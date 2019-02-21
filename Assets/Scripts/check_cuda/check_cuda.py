#Wait for parent process to be ready for output
input()

import json
import torch

print(json.dumps({
    "cuda_available":str(torch.cuda.is_available())
}), flush=True)
