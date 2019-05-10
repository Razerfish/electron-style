import sys
import json
import traceback

def fail_safe(exctype, value, tb):
    print(json.dumps({
        "type": "error",
        "data": traceback.format_exception(exctype, value, tb)
    }), file=sys.stderr, flush=True)

    sys.exit(0)

sys.excepthook = fail_safe
