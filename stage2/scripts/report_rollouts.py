#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List

from common import iter_jsonl


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rollouts", required=True)
    args = ap.parse_args()

    path = Path(args.rollouts)
    if not path.exists():
        raise SystemExit(f"rollouts not found: {path}")

    total = 0
    reward_sum = 0.0
    pass_cnt = 0
    by_reason = Counter()
    by_diff = defaultdict(lambda: {"n": 0, "reward_sum": 0.0, "pass": 0})

    for row in iter_jsonl(path):
        total += 1
        reward = row.get("reward") or {}
        r = float(reward.get("total", 0.0))
        reward_sum += r

        v = row.get("validation") or {}
        ok = bool(v.get("parse_ok", False)) and bool(v.get("lint_ok", False)) and bool(v.get("api_ok", False))
        if ok:
            pass_cnt += 1
        else:
            # first-fail reason (approx)
            if not v.get("parse_ok", False):
                by_reason["parse_failed"] += 1
            elif not v.get("lint_ok", False):
                by_reason["lint_failed"] += 1
            elif not v.get("api_ok", False):
                by_reason["api_failed"] += 1
            elif not v.get("runtime_ok", True):
                by_reason["runtime_failed"] += 1
            else:
                by_reason["other_failed"] += 1

        prompt = row.get("prompt") or {}
        diff = str(prompt.get("difficulty", "")).lower().strip() if isinstance(prompt, dict) else ""
        if not diff:
            diff = "unknown"
        by_diff[diff]["n"] += 1
        by_diff[diff]["reward_sum"] += r
        by_diff[diff]["pass"] += 1 if ok else 0

    out = {
        "rollouts": str(path),
        "total_rows": total,
        "mean_reward": (reward_sum / total) if total else 0.0,
        "pass_rate": (pass_cnt / total) if total else 0.0,
        "fail_reasons": dict(by_reason),
        "by_difficulty": {k: {"n": v["n"], "mean_reward": (v["reward_sum"] / v["n"]) if v["n"] else 0.0, "pass_rate": (v["pass"] / v["n"]) if v["n"] else 0.0} for k, v in by_diff.items()},
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

