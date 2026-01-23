#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import random
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

from common import iter_jsonl, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def norm_diff(d: Any) -> str:
    s = str(d or "").lower().strip()
    if s in ("easy", "medium", "hard"):
        return s
    return "medium"


_DIFF_RANK = {"easy": 0, "medium": 1, "hard": 2}


def max_diff(a: str, b: str) -> str:
    return a if _DIFF_RANK.get(a, 1) >= _DIFF_RANK.get(b, 1) else b


def uniq_list(xs: List[Any], limit: int | None = None) -> List[Any]:
    out: List[Any] = []
    seen = set()
    for x in xs:
        k = json.dumps(x, ensure_ascii=False, sort_keys=True) if isinstance(x, (dict, list)) else str(x)
        if k in seen:
            continue
        seen.add(k)
        out.append(x)
        if limit is not None and len(out) >= limit:
            break
    return out


def split_counts(total: int) -> Dict[str, int]:
    n = int(total)
    easy = int(round(n * 0.4))
    medium = int(round(n * 0.4))
    hard = n - easy - medium
    return {"easy": easy, "medium": medium, "hard": hard}


def sample_by_difficulty(rows: List[Dict[str, Any]], count: int, rng: random.Random) -> List[Dict[str, Any]]:
    by_diff: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in rows:
        by_diff[norm_diff(r.get("difficulty"))].append(r)

    targets = split_counts(count)
    picked: List[Dict[str, Any]] = []
    for diff, n in targets.items():
        pool = by_diff.get(diff, [])
        if not pool:
            continue
        rng.shuffle(pool)
        take = min(n, len(pool))
        picked.extend(pool[:take])
        # Top-up with replacement if shortage.
        for _ in range(n - take):
            picked.append(rng.choice(pool))

    # If shortage due to missing difficulties, top-up from all with replacement.
    while len(picked) < count and rows:
        picked.append(rng.choice(rows))

    return picked[:count]


_RE_INT = re.compile(r"(?<!\\d)(\\d{1,4})(?!\\d)")


def jitter_task(task: str, rng: random.Random) -> str:
    s = str(task or "").strip()
    if not s:
        return s
    nums = list(_RE_INT.finditer(s))
    if not nums:
        extra = rng.choice(["（变体：增加一个可重置操作）", "（变体：增加一个可视化提示）", "（变体：增加一个简单状态机）"])
        return s + extra
    # jitter up to 2 numbers
    out = s
    replaced = 0
    for m in reversed(nums[:2]):
        try:
            v = int(m.group(1))
        except ValueError:
            continue
        delta = rng.randint(-max(5, v // 5), max(5, v // 5))
        nv = max(1, v + delta)
        out = out[: m.start(1)] + str(nv) + out[m.end(1) :]
        replaced += 1
    if replaced:
        out += "（变体）"
    return out


def make_eval_prompt_from_seed(seed_row: Dict[str, Any], *, eval_id: str, now: str, rng: random.Random, augmented: bool) -> Dict[str, Any]:
    task = str(seed_row.get("task", "")).strip()
    if augmented:
        task = jitter_task(task, rng)

    return {
        "id": eval_id,
        "source_id": str(seed_row.get("id", "")).strip(),
        "difficulty": norm_diff(seed_row.get("difficulty")),
        "modules": seed_row.get("modules", []) or [],
        "task": task,
        "constraints": seed_row.get("constraints", []) or [],
        "must_use_apis": seed_row.get("must_use_apis", []) or [],
        "eval_hints": seed_row.get("eval_hints", []) or [],
        "tags": seed_row.get("tags", []) or [],
        "ood": False,
        "ood_type": None,
        "created_at": now,
        "meta": {"augmented": bool(augmented)},
    }


def make_ood_prompt(a: Dict[str, Any], b: Dict[str, Any], *, eval_id: str, now: str) -> Dict[str, Any]:
    modules = uniq_list([*(a.get("modules") or []), *(b.get("modules") or [])])
    difficulty = max_diff(norm_diff(a.get("difficulty")), norm_diff(b.get("difficulty")))

    task_a = str(a.get("task", "")).strip()
    task_b = str(b.get("task", "")).strip()
    task = f"组合任务：{task_a} 同时，{task_b}。要求在同一个 Scene 内实现。"

    constraints = uniq_list([*(a.get("constraints") or []), *(b.get("constraints") or [])], limit=12)
    constraints.append("两个需求必须在同一 Scene 内组合实现（避免拆成多个独立示例）。")

    must_use = uniq_list([*(a.get("must_use_apis") or [])[:2], *(b.get("must_use_apis") or [])[:2]], limit=6)
    eval_hints = uniq_list([*(a.get("eval_hints") or []), *(b.get("eval_hints") or [])], limit=12)
    eval_hints.append("应同时满足两个子任务的关键验收点。")

    tags = uniq_list([*(a.get("tags") or []), *(b.get("tags") or []), "ood", "combo"], limit=16)

    return {
        "id": eval_id,
        "source_id": None,
        "source_ids": [str(a.get("id", "")).strip(), str(b.get("id", "")).strip()],
        "difficulty": difficulty,
        "modules": modules,
        "task": task,
        "constraints": constraints,
        "must_use_apis": must_use,
        "eval_hints": eval_hints,
        "tags": tags,
        "ood": True,
        "ood_type": "cross_module_combo",
        "created_at": now,
        "meta": {},
    }


def summarize(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    by_diff = Counter()
    by_ood = Counter()
    by_module = Counter()
    for r in rows:
        by_diff[norm_diff(r.get("difficulty"))] += 1
        by_ood["ood" if r.get("ood") else "iid"] += 1
        mods = r.get("modules") or []
        if mods:
            by_module[str(mods[0])] += 1
        else:
            by_module["(none)"] += 1
    return {
        "total": len(rows),
        "by_difficulty": dict(by_diff),
        "by_ood": dict(by_ood),
        "by_primary_module": dict(by_module),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt-seeds", default=str(repo_root() / "stage0/data/prompt_seeds/prompt_seeds.jsonl"))
    ap.add_argument("--out-eval", default=str(repo_root() / "stage3/data/eval/prompts_eval_300.jsonl"))
    ap.add_argument("--out-human", default=str(repo_root() / "stage3/data/eval/prompts_human_200.jsonl"))
    ap.add_argument("--eval-count", type=int, default=300)
    ap.add_argument("--human-count", type=int, default=200)
    ap.add_argument("--ood-ratio", type=float, default=0.2)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    seeds_path = Path(args.prompt_seeds)
    if not seeds_path.exists():
        raise SystemExit(f"prompt seeds not found: {seeds_path}")

    rng = random.Random(int(args.seed))
    seeds = list(iter_jsonl(seeds_path))
    if not seeds:
        raise SystemExit(f"empty prompt seeds: {seeds_path}")
    rng.shuffle(seeds)

    eval_count = max(1, int(args.eval_count))
    human_count = max(1, int(args.human_count))
    ood_ratio = float(args.ood_ratio)
    ood_ratio = max(0.0, min(0.8, ood_ratio))

    ood_n = int(round(eval_count * ood_ratio))
    iid_n = eval_count - ood_n

    now = datetime.now(timezone.utc).isoformat()

    iid_seeds = sample_by_difficulty(seeds, iid_n, rng)
    # Generate IID prompts (allow "augmented" variants when the same seed repeats).
    seen_source = Counter()
    eval_rows: List[Dict[str, Any]] = []
    idx = 1
    for s in iid_seeds:
        sid = str(s.get("id", "")).strip()
        seen_source[sid] += 1
        augmented = seen_source[sid] > 1
        eval_rows.append(make_eval_prompt_from_seed(s, eval_id=f"eval_{idx:06d}", now=now, rng=rng, augmented=augmented))
        idx += 1

    # Generate OOD prompts by pairing seeds. (Can exceed seed count.)
    tries = 0
    while len(eval_rows) < eval_count and tries < 100000:
        tries += 1
        a = rng.choice(seeds)
        b = rng.choice(seeds)
        if a is b:
            continue
        mods_a = set(str(x) for x in (a.get("modules") or []))
        mods_b = set(str(x) for x in (b.get("modules") or []))
        if mods_a == mods_b:
            # try to encourage cross-module combos
            continue
        eval_rows.append(make_ood_prompt(a, b, eval_id=f"eval_{idx:06d}", now=now))
        idx += 1

    eval_rows = eval_rows[:eval_count]

    # Human subset: sample from eval_rows by difficulty split; keep OOD naturally included.
    human_pool = eval_rows[:]
    rng.shuffle(human_pool)
    human_targets = split_counts(min(human_count, len(human_pool)))
    by_diff: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for r in human_pool:
        by_diff[norm_diff(r.get("difficulty"))].append(r)
    human_rows: List[Dict[str, Any]] = []
    for diff, n in human_targets.items():
        pool = by_diff.get(diff, [])
        if not pool:
            continue
        human_rows.extend(pool[: min(n, len(pool))])
    if len(human_rows) < min(human_count, len(human_pool)):
        picked = {r["id"] for r in human_rows if isinstance(r.get("id"), str)}
        rest = [r for r in human_pool if str(r.get("id", "")) not in picked]
        human_rows.extend(rest[: min(human_count, len(human_pool)) - len(human_rows)])
    human_rows = human_rows[: min(human_count, len(human_pool))]

    out_eval = Path(args.out_eval)
    out_human = Path(args.out_human)
    write_jsonl(out_eval, eval_rows)
    write_jsonl(out_human, human_rows)

    report = {
        "created_at": now,
        "seed": int(args.seed),
        "prompt_seeds": str(seeds_path),
        "eval_out": str(out_eval),
        "human_out": str(out_human),
        "eval_requested": int(args.eval_count),
        "human_requested": int(args.human_count),
        "eval_written": len(eval_rows),
        "human_written": len(human_rows),
        "ood_ratio_target": ood_ratio,
        "eval_summary": summarize(eval_rows),
        "human_summary": summarize(human_rows),
    }
    report_path = out_eval.parent / "reports" / "eval_set_build_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

