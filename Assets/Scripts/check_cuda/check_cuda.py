import json
import torch

def main():
    print(json.dumps({
        "type": "cuda_available",
        "data": True
    }), flush=True)

if __name__ == "__main__":
    main()
