#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import random
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

from common import iter_jsonl, strip_markdown_fences, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def get_system_and_user_messages(row: Dict[str, Any]) -> Tuple[str, str]:
    req = row.get("request") or {}
    messages = req.get("messages") or []
    sys_msg = ""
    user_msg = ""
    for m in messages:
        if not isinstance(m, dict):
            continue
        role = str(m.get("role", "")).strip()
        content = str(m.get("content", "") or "")
        if role == "system" and not sys_msg:
            sys_msg = content
        if role == "user" and not user_msg:
            user_msg = content
    return sys_msg.strip(), user_msg.strip()


def format_output(plan_raw: str, code: str) -> str:
    plan_s = (plan_raw or "").strip()
    code_s = strip_markdown_fences(code or "")
    parts = ["plan:", plan_s, "code:", code_s]
    return "\n".join(parts).strip() + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--selected", default=str(repo_root() / "stage1/data/sft_distill/selected.jsonl"))
    ap.add_argument("--out-dir", default=str(repo_root() / "stage1/data/sft_dataset"))
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--val-ratio", type=float, default=0.05)
    ap.add_argument("--test-ratio", type=float, default=0.05)
    ap.add_argument("--require-plan", action="store_true")
    args = ap.parse_args()

    selected_path = Path(args.selected)
    out_dir = Path(args.out_dir)
    if not selected_path.exists():
        raise SystemExit(f"selected not found: {selected_path}")

    rows = list(iter_jsonl(selected_path))
    rng = random.Random(int(args.seed))
    rng.shuffle(rows)

    examples: List[Dict[str, Any]] = []
    dropped = 0
    by_diff = Counter()
    by_module = Counter()

    for r in rows:
        prompt = r.get("prompt") or {}
        difficulty = str(prompt.get("difficulty", ""))
        modules = prompt.get("modules") or []

        plan_raw = str(r.get("plan_raw", "") or "")
        if args.require_plan and not plan_raw.strip():
            dropped += 1
            continue

        sys_msg, user_msg = get_system_and_user_messages(r)
        if not user_msg:
            # Fallback to task-only input if request messages are missing
            user_msg = str(prompt.get("task", "") or "").strip()

        out_text = format_output(plan_raw, str(r.get("code", "") or ""))
        if not out_text.strip():
            dropped += 1
            continue

        ex_id = f"sft_{r.get('prompt_id','')}_v{r.get('variant',0)}"
        examples.append(
            {
                "id": ex_id,
                "instruction": sys_msg or "你是 Phaser3 JavaScript 专家开发者。",
                "input": user_msg,
                "output": out_text,
            }
        )

        if difficulty:
            by_diff[difficulty] += 1
        for m in modules if isinstance(modules, list) else []:
            by_module[str(m)] += 1

    n = len(examples)
    val_n = int(round(n * float(args.val_ratio)))
    test_n = int(round(n * float(args.test_ratio)))
    val_n = max(1 if n >= 20 else 0, val_n)
    test_n = max(1 if n >= 20 else 0, test_n)
    if val_n + test_n >= n:
        val_n = max(0, min(val_n, n // 10))
        test_n = max(0, min(test_n, n // 10))

    train = examples[: n - val_n - test_n]
    val = examples[n - val_n - test_n : n - test_n]
    test = examples[n - test_n :]

    out_dir.mkdir(parents=True, exist_ok=True)
    train_path = out_dir / "train.jsonl"
    val_path = out_dir / "val.jsonl"
    test_path = out_dir / "test.jsonl"
    write_jsonl(train_path, train)
    write_jsonl(val_path, val)
    write_jsonl(test_path, test)

    now = datetime.now(timezone.utc).isoformat()
    report = {
        "created_at": now,
        "selected": str(selected_path),
        "out_dir": str(out_dir),
        "seed": int(args.seed),
        "require_plan": bool(args.require_plan),
        "counts": {"total_selected": len(rows), "dropped": dropped, "train": len(train), "val": len(val), "test": len(test)},
        "by_difficulty": dict(by_diff),
        "by_module": dict(by_module),
    }
    report_path = out_dir.parent / "reports" / "sft_dataset_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

