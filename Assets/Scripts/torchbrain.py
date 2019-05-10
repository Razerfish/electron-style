import neural_style
import check_cuda

import os
import sys

import argparse

parser = argparse.ArgumentParser(description="Run neural style or check cuda.")

subparsers = parser.add_subparsers(title="mode", dest="mode", required=True)

cuda_parser = subparsers.add_parser("check_cuda", help="Run check cuda")

neural_parser = subparsers.add_parser("neural_style", help="Run neural_style")
neural_parser.add_argument("args", action="store", help="Arguments to pass to neural style")

args = parser.parse_args()

if args.mode == "check_cuda":
    check_cuda.check_cuda()
    sys.exit(0)
else:
    neural_style.neural_style(args)
    sys.exit(0)
