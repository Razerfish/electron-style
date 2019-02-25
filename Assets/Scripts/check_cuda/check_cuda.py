import json
import torch

#Wait for parent process to be ready for output
input()

print(json.dumps({
    "cuda_available":str(torch.cuda.is_available())
}), flush=True)
