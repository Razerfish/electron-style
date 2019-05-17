import torch
from PIL import Image
import json
import sys
import os
import time

def log(data):
    print(data, flush=True)

def load_image(filename, size=None, scale=None):
    img = Image.open(filename)

    if size is not None:
        img = img.resize((size, size), Image.ANTIALIAS)
    elif scale is not None:
        img = img.resize((int(img.size[0] / scale), int(img.size[1] / scale)), Image.ANTIALIAS)
    return img


def save_image(filename, data):
    img = data.clone().clamp(0, 255).numpy()
    
    img = img.transpose(1, 2, 0).astype("uint8")

    img = Image.fromarray(img)

    img.save(filename)


def gram_matrix(y):
    (b, ch, h, w) = y.size()
    features = y.view(b, ch, w * h)
    features_t = features.transpose(1, 2)
    gram = features.bmm(features_t) / (ch * h * w)
    return gram


def normalize_batch(batch):
    # normalize using imagenet mean and std
    mean = batch.new_tensor([0.485, 0.456, 0.406]).view(-1, 1, 1)
    std = batch.new_tensor([0.229, 0.224, 0.225]).view(-1, 1, 1)
    batch = batch.div_(255.0)
    return (batch - mean) / std

class InputArgs():
    def __init__(self, data):
        cuda_available = torch.cuda.is_available()

        if data["subcommand"] == "eval":
            self.subcommand = "eval"

            if os.path.isfile(str(data["content_image"])):
                self.content_image = str(data["content_image"])
            else:
                raise Exception("Content image could not be found at {}".format(str(data["content_image"])))
            
            try:
                self.content_scale = float(data["content_scale"])
            except KeyError:
                self.content_scale = None

            self.output_image = str((data["output_image"]))

            if os.path.isfile(str(data["model"])):
                self.model = str(data["model"])
            else:
                raise Exception("Model file could not be found at {}".format(str(data["model"])))

            if cuda_available:
                self.cuda = int(data["cuda"])
            else:
                self.cuda = 0

            try:
                self.export_onnx = str(data["export_onnx"])
            except KeyError:
                self.export_onnx = None

        elif data["subcommand"] == "train":
            self.subcommand = "train"

            try:
                self.epochs = int(data["self"])
            except KeyError:
                self.epochs = 2

            try:
                self.batch_size = int(data["batch_size"])
            except KeyError:
                self.batch_size = 4

            if os.path.isdir(str(data["dataset"])):
                self.dataset = str(data["dataset"])
            else:
                raise Exception("Dataset not found at {}".format(str(data["dataset"])))

            if os.path.isfile(str(data["style_image"])):
                self.style_image = str(data["style_image"])
            else:
                raise Exception("Style image not found at {}".format(str(data["style_image"])))

            self.save_model_dir = str(data["save_model_dir"])

            try:
                self.name = str(data["name"])
            except KeyError:
                self.name = None

            try:
                self.checkpoint_model_dir = str(data["checkpoint_model_dir"])
            except KeyError:
                self.checkpoint_model_dir = None

            try:
                self.image_size = int(data["image_size"])
            except KeyError:
                self.image_size = 256

            try:
                self.style_size = int(data["style_size"])
            except KeyError:
                self.style_size = None

            if cuda_available:
                self.cuda = int(data["cuda"])
            else:
                self.cuda = 0

            try:
                self.seed = int(data["seed"])
            except KeyError:
                self.seed = 42

            try:
                self.content_weight = float(data["content_weight"])
            except KeyError:
                self.content_weight = float(1e5)

            try:
                self.style_weight = float(data["style_weight"])
            except KeyError:
                self.style_weight = float(1e10)

            try:
                self.lr = float(data["lr"])
            except KeyError:
                self.lr = float(1e-3)

            self.log_interval = 1
            
            try:
                self.checkpoint_interval = int(data["checkpoint_interval"])
            except KeyError:
                self.checkpoint_interval = 2000
        
        else:
            raise Exception("Unknown subcommand: {}".format(str(data["subcommand"])))
