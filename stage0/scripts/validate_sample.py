#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--code-file", required=True, help="Path to generated JS code file")
    ap.add_argument("--api-index", default="data/api_index/phaser_api.jsonl")
    ap.add_argument(
        "--validator-cli",
        default="validator/src/cli.js",
        help="Path to validator CLI entry (node script)",
    )
    ap.add_argument("--prompt-json", default="{}")
    ap.add_argument("--timeout-ms", type=int, default=1500)
    ap.add_argument("--frames", type=int, default=60)
    ap.add_argument("--skip-eslint", action="store_true")
    ap.add_argument("--skip-runtime", action="store_true")
    args = ap.parse_args()

    code_file = Path(args.code_file)
    if not code_file.exists():
        raise SystemExit(f"code file not found: {code_file}")

    validator_cli = Path(args.validator_cli)
    if not validator_cli.exists():
        raise SystemExit(f"validator cli not found: {validator_cli}")

    try:
        prompt_obj = json.loads(args.prompt_json)
    except json.JSONDecodeError as e:
        raise SystemExit(f"--prompt-json invalid JSON: {e}")

    cmd = [
        "node",
        str(validator_cli),
        "--code-file",
        str(code_file),
        "--api-index",
        str(args.api_index),
        "--prompt-json",
        json.dumps(prompt_obj, ensure_ascii=False),
        "--timeout-ms",
        str(int(args.timeout_ms)),
        "--frames",
        str(int(args.frames)),
    ]
    if args.skip_eslint:
        cmd.append("--skip-eslint")
    if args.skip_runtime:
        cmd.append("--skip-runtime")

    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.stderr.strip():
        print(p.stderr, file=sys.stderr)

    if p.returncode != 0:
        raise SystemExit(f"validator failed (exit={p.returncode})")

    out = p.stdout.strip()
    if not out:
        raise SystemExit("validator produced empty stdout")

    try:
        obj: Dict[str, Any] = json.loads(out)
    except json.JSONDecodeError:
        print(out)
        raise SystemExit("validator output is not JSON")

    print(json.dumps(obj, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

