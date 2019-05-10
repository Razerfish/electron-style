import json
import torch

def main():
    print(json.dumps({
        "cuda_available": torch.cuda.is_available()
    }), flush=True)

if __name__ == "__main__":
    main()
