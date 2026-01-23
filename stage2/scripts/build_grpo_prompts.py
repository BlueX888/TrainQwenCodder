#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import random
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

from common import write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def iter_prompt_seeds(path: Path) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s:
                continue
            obj = json.loads(s)
            if isinstance(obj, dict):
                rows.append(obj)
    return rows


def split_counts(total: int) -> Dict[str, int]:
    n = int(total)
    easy = int(round(n * 0.4))
    medium = int(round(n * 0.4))
    hard = n - easy - medium
    return {"easy": easy, "medium": medium, "hard": hard}


def sample_by_difficulty(rows: List[Dict[str, Any]], count: int, rng: random.Random) -> List[Dict[str, Any]]:
    by_diff: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in rows:
        diff = str(r.get("difficulty", "medium")).lower().strip()
        if diff not in ("easy", "medium", "hard"):
            diff = "medium"
        by_diff[diff].append(r)

    targets = split_counts(count)
    picked: List[Dict[str, Any]] = []
    for diff, n in targets.items():
        pool = by_diff.get(diff, [])
        if not pool:
            continue
        rng.shuffle(pool)
        picked.extend(pool[: min(n, len(pool))])

    # If shortage (e.g., not enough hard), top-up from remaining.
    if len(picked) < count:
        picked_ids = {str(r.get("id", "")) for r in picked}
        remaining = [r for r in rows if str(r.get("id", "")) not in picked_ids]
        rng.shuffle(remaining)
        picked.extend(remaining[: count - len(picked)])

    return picked[:count]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt-seeds", default=str(repo_root() / "stage0/data/prompt_seeds/prompt_seeds.jsonl"))
    ap.add_argument("--out-train", default=str(repo_root() / "stage2/data/grpo/prompts_train.jsonl"))
    ap.add_argument("--out-eval", default=str(repo_root() / "stage2/data/grpo/prompts_eval.jsonl"))
    ap.add_argument("--train-count", type=int, default=1800)
    ap.add_argument("--eval-count", type=int, default=300)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    seeds_path = Path(args.prompt_seeds)
    if not seeds_path.exists():
        raise SystemExit(f"prompt seeds not found: {seeds_path}")

    rng = random.Random(int(args.seed))
    all_rows = iter_prompt_seeds(seeds_path)
    rng.shuffle(all_rows)

    # First pick eval (frozen), then train from remaining to avoid overlap.
    eval_rows = sample_by_difficulty(all_rows, int(args.eval_count), rng)
    eval_ids = {str(r.get("id", "")) for r in eval_rows}
    remaining = [r for r in all_rows if str(r.get("id", "")) not in eval_ids]
    train_rows = sample_by_difficulty(remaining, int(args.train_count), rng)

    now = datetime.now(timezone.utc).isoformat()

    def to_prompt(r: Dict[str, Any], prefix: str) -> Dict[str, Any]:
        pid = str(r.get("id", "")).strip()
        return {
            "id": f"{prefix}_{pid}" if not pid.startswith(prefix + "_") else pid,
            "source_id": pid,
            "difficulty": r.get("difficulty", ""),
            "modules": r.get("modules", []),
            "task": r.get("task", ""),
            "constraints": r.get("constraints", []),
            "must_use_apis": r.get("must_use_apis", []),
            "eval_hints": r.get("eval_hints", []),
            "tags": r.get("tags", []),
            "ood": False,
            "created_at": now,
        }

    out_train_path = Path(args.out_train)
    out_eval_path = Path(args.out_eval)

    write_jsonl(out_train_path, [to_prompt(r, "train") for r in train_rows])
    write_jsonl(out_eval_path, [to_prompt(r, "eval") for r in eval_rows])

    report = {
        "created_at": now,
        "prompt_seeds": str(seeds_path),
        "train_out": str(out_train_path),
        "eval_out": str(out_eval_path),
        "train_count": len(train_rows),
        "eval_count": len(eval_rows),
        "seed": int(args.seed),
    }
    report_path = out_train_path.parent / "reports" / "prompts_build_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

