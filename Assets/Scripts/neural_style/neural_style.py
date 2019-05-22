import os
import sys
import time
import re
import json

import numpy as np
import torch
from torch.optim import Adam
from torch.utils.data import DataLoader
from torchvision import datasets
from torchvision import transforms
import torch.onnx

from neural_style.utils import log
import neural_style.utils as utils
from neural_style.transformer_net import TransformerNet
from neural_style.vgg import Vgg16

import argparse

def check_paths(args):
    try:
        if not os.path.exists(args.save_model_dir):
            os.makedirs(args.save_model_dir)
        if args.checkpoint_model_dir is not None and not (os.path.exists(args.checkpoint_model_dir)):
            os.makedirs(args.checkpoint_model_dir)
    except OSError as e:
        sys.exit(e)

def train(args):
    log(json.dumps({
        "type": "status",
        "data": "start_train"
    }))
    
    device = torch.device("cuda" if args.cuda else "cpu")

    np.random.seed(args.seed)
    torch.manual_seed(args.seed)

    transform = transforms.Compose([
        transforms.Resize(args.image_size),
        transforms.CenterCrop(args.image_size),
        transforms.ToTensor(),
        transforms.Lambda(lambda x: x.mul(255))
    ])
    
    train_dataset = datasets.ImageFolder(args.dataset, transform)
    log(json.dumps({"type": "dataset_length", "data": json.dumps({
            "length": len(train_dataset),
            "epochs": args.epochs,
            "effective_length": len(train_dataset) * args.epochs
        })
    }))

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size)

    transformer = TransformerNet().to(device)

    optimizer = Adam(transformer.parameters(), args.lr)

    mse_loss = torch.nn.MSELoss()

    vgg = Vgg16(requires_grad=False).to(device)

    style_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Lambda(lambda x: x.mul(255))
    ])

    style = utils.load_image(args.style_image, size=args.style_size)

    style = style_transform(style)
    style = style.repeat(args.batch_size, 1, 1, 1).to(device)

    features_style = vgg(utils.normalize_batch(style))
    
    gram_style = [utils.gram_matrix(y) for y in features_style]

    progress_count = 0

    log(json.dumps({
        "type": "status",
        "data": "training"
    }))

    for e in range(args.epochs):
        transformer.train()
        agg_content_loss = 0.
        agg_style_loss = 0.
        count = 0
        for batch_id, (x, _) in enumerate(train_loader):
            n_batch = len(x)
            count += n_batch
            optimizer.zero_grad()

            x = x.to(device)
            y = transformer(x)

            y = utils.normalize_batch(y)
            x = utils.normalize_batch(x)

            features_y = vgg(y)
            features_x = vgg(x)

            content_loss = args.content_weight * mse_loss(features_y.relu2_2, features_x.relu2_2)

            style_loss = 0.
            for ft_y, gm_s in zip(features_y, gram_style):
                gm_y = utils.gram_matrix(ft_y)
                style_loss += mse_loss(gm_y, gm_s[:n_batch, :, :])
            style_loss *= args.style_weight

            total_loss = content_loss + style_loss
            total_loss.backward()
            optimizer.step()

            agg_content_loss += content_loss.item()
            agg_style_loss += style_loss.item()

            log(json.dumps({
                "type": "train_progress",
                "data": int(progress_count)
            }))

            progress_count = progress_count + args.batch_size

            if args.checkpoint_model_dir is not None and (batch_id + 1) % args.checkpoint_interval == 0:
                transformer.eval().cpu()
                if args.name is None:
                    ckpt_model_filename = str(os.path.normpath(os.path.basename(args.style_image))
                    [0:int(os.path.normpath(os.path.basename(args.style_image)).rfind("."))]) + "_" + str(batch_id + 1) + ".pth"
                else:
                    ckpt_model_filename = str(args.name) + "_" + str(batch_id + 1) + ".pth"
                ckpt_model_path = os.path.join(args.checkpoint_model_dir, ckpt_model_filename)
                torch.save(transformer.state_dict(), ckpt_model_path)
                transformer.to(device).train()

    # save model
    transformer.eval().cpu()
    if args.name is None:
        save_model_filename = str(os.path.normpath(os.path.basename(args.style_image))
        [0:int(os.path.normpath(os.path.basename(args.style_image)).rfind("."))]) + ".pth"
    else:
        save_model_filename = str(args.name + ".pth")
    
    save_model_path = os.path.join(args.save_model_dir, save_model_filename)
    
    torch.save(transformer.state_dict(), save_model_path)

    log(json.dumps({
        "type": "status",
        "data": "train_done"
    }))

def stylize(args):
    log(json.dumps({
        "type": "status",
        "data": "style"
    }))

    device = torch.device("cuda" if args.cuda else "cpu")

    content_image = utils.load_image(args.content_image, scale=args.content_scale)
    
    content_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Lambda(lambda x: x.mul(255))
    ])
    content_image = content_transform(content_image)

    content_image = content_image.unsqueeze(0).to(device)


    if args.model.endswith(".onnx"):
        output = stylize_onnx_caffe2(content_image, args)
    else:
        with torch.no_grad():
            style_model = TransformerNet()
            state_dict = torch.load(args.model)
            # remove saved deprecated running_* keys in InstanceNorm from the checkpoint
            for k in list(state_dict.keys()):
                if re.search(r'in\d+\.running_(mean|var)$', k):
                    del state_dict[k]
            style_model.load_state_dict(state_dict)
            style_model.to(device)

            if args.export_onnx:
                assert args.export_onnx.endswith(".onnx"), "Export model file should end with .onnx"
                output = torch.onnx._export(style_model, content_image, args.export_onnx).cpu()
            else:
                output = style_model(content_image).cpu()

    utils.save_image(args.output_image, output[0])

    log(json.dumps({
        "type": "status",
        "data": "style_done"
    }))

def stylize_onnx_caffe2(content_image, args):
    """
    Read ONNX model and run it using Caffe2
    """

    assert not args.export_onnx

    import onnx
    import onnx_caffe2.backend

    model = onnx.load(args.model)

    prepared_backend = onnx_caffe2.backend.prepare(model, device='CUDA' if args.cuda else 'CPU')
    inp = {model.graph.input[0].name: content_image.numpy()}
    c2_out = prepared_backend.run(inp)[0]

    return torch.from_numpy(c2_out)


def main(start_conds):
    args = utils.InputArgs(json.loads(start_conds.args))
    if args.subcommand is None:
        raise Exception("Subcommand is None")
    if args.cuda and not torch.cuda.is_available():
        raise Exception("CUDA is not available")

    if args.subcommand == "train":
        check_paths(args)
        train(args)
    else:
        stylize(args)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Runs neural style with the given arguments.")
    parser.add_argument("args", action='store',
    help="Arguments to pass to neural style.")

    start_conds = parser.parse_args()

    main(start_conds)
