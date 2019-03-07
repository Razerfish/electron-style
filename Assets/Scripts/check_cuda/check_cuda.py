import json
import torch

import argparse

parser = argparse.ArgumentParser(description="Checks if CUDA is available and returns the result as a JSON string.")
parser.add_argument("--attached", "-A", action="store_true", dest="attached",
help="Run the program in attached mode.")

attached = parser.parse_args().attached

if attached:
    #Wait for parent process to be ready for output
    input()

print(json.dumps({
    "cuda_available":str(torch.cuda.is_available())
}), flush=True)
