#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

from common import iter_jsonl, sha256_text, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def non_empty_lines(code: str) -> int:
    return sum(1 for ln in (code or "").splitlines() if ln.strip())


_RE_BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)
_RE_LINE_COMMENT = re.compile(r"//.*?$", re.MULTILINE)
_RE_WS = re.compile(r"\s+")


def normalized_code_hash(code: str) -> str:
    s = code or ""
    s = _RE_BLOCK_COMMENT.sub("", s)
    s = _RE_LINE_COMMENT.sub("", s)
    s = _RE_WS.sub("", s)
    return sha256_text(s)


def bounds_for_difficulty(difficulty: str) -> Tuple[int, int]:
    d = (difficulty or "").lower().strip()
    if d == "easy":
        return 12, 220
    if d == "hard":
        return 30, 380
    return 20, 300


def score_candidate(row: Dict[str, Any]) -> float:
    v = row.get("validation") or {}
    if not v.get("parse_ok", False):
        return -1e9

    score = 0.0

    if v.get("lint_ok", False):
        score += 1.0
    if v.get("api_ok", False):
        score += 2.0
    if v.get("runtime_ok", False):
        score += 0.5

    api_usage = v.get("api_usage") or {}
    hits = api_usage.get("hits") or []
    misses = api_usage.get("misses") or []
    score += min(1.0, len(hits) / 50.0)  # cap
    score -= min(1.0, len(misses) / 20.0)

    must_miss = api_usage.get("must_use_misses") or []
    score -= min(2.0, 0.5 * len(must_miss))

    prompt = row.get("prompt") or {}
    difficulty = str(prompt.get("difficulty", "medium"))
    lo, hi = bounds_for_difficulty(difficulty)
    lines = non_empty_lines(str(row.get("code", "") or ""))
    if lines < lo:
        score -= (lo - lines) * 0.05
    if lines > hi:
        score -= (lines - hi) * 0.02

    if row.get("plan") is not None:
        score += 0.2
    if str(row.get("plan_raw", "")).strip():
        score += 0.1

    return float(score)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--validated", default=str(repo_root() / "stage1/data/sft_distill/validated.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage1/data/sft_distill/selected.jsonl"))
    args = ap.parse_args()

    validated_path = Path(args.validated)
    out_path = Path(args.out)
    if not validated_path.exists():
        raise SystemExit(f"validated not found: {validated_path}")

    by_prompt: Dict[str, List[Dict[str, Any]]] = {}
    for row in iter_jsonl(validated_path):
        pid = str(row.get("prompt_id", "")).strip() or "UNKNOWN"
        by_prompt.setdefault(pid, []).append(row)

    selected: List[Dict[str, Any]] = []
    stats = {
        "prompts": 0,
        "selected": 0,
        "prompts_with_any_pass": 0,
        "dedup_dropped": 0,
    }

    for pid, rows in by_prompt.items():
        stats["prompts"] += 1
        scored = [(score_candidate(r), r) for r in rows]
        scored.sort(key=lambda x: x[0], reverse=True)

        # Prefer those that pass hard filter, but still pick best available if none pass.
        pass_rows = [r for _s, r in scored if r.get("filter_pass", False)]
        pool = pass_rows if pass_rows else [r for _s, r in scored[:3]]  # keep small
        if pass_rows:
            stats["prompts_with_any_pass"] += 1

        # De-dup within the prompt by normalized code hash.
        seen = set()
        best = None
        best_score = -1e9
        for r in pool:
            h = normalized_code_hash(str(r.get("code", "") or ""))
            if h in seen:
                stats["dedup_dropped"] += 1
                continue
            seen.add(h)
            s = score_candidate(r)
            if s > best_score:
                best_score = s
                best = r

        if best is None:
            continue

        out_row = dict(best)
        out_row["selection_score"] = best_score
        selected.append(out_row)
        stats["selected"] += 1

    write_jsonl(out_path, selected)

    now = datetime.now(timezone.utc).isoformat()
    report_path = out_path.parent.parent / "reports" / "selection_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report = {"created_at": now, "validated": str(validated_path), "out": str(out_path), "stats": stats}
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()

