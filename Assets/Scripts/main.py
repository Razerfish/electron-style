import neural_style
import check_cuda

import os
import sys

import argparse

parser = argparse.ArgumentParser(description="Run neural style or check cuda.")

subparsers = parser.add_subparsers(title="mode", dest="mode", required=True)

parser.add_argument("--attached", "-A", action="store_true", dest="attached",
help="Run program in attached mode")

cuda_parser = subparsers.add_parser("check_cuda", help="Run check cuda")

neural_parser = subparsers.add_parser("neural_style", help="Run neural_style")
neural_parser.add_argument("args", action="store", help="Arguments to pass to neural style")

args = parser.parse_args()

if args.mode == "check_cuda":
    check_cuda.check_cuda(args.attached)
    sys.exit(0)
elif args.mode == "neural_style":
    neural_style.neural_style(args)
    sys.exit(0)
else:
    sys.stderr.write("Unknown mode: " + str(args.mode))
    sys.stderr.flush()
    sys.exit(1)
