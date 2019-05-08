import json
import torch

import argparse

def main(attached):
    if attached:
        # Wait for parent process to be ready for output.
        input()

    print(json.dumps({
        "cuda_available": torch.cuda.is_available()
    }), flush=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Checks if CUDA is available and returns the result as a JSON string.")
    parser.add_argument("--attached", "-A", action="store_true", dest="attached",
    help="Run the program in attached mode.")

    attached = parser.parse_args().attached

    main(attached)
