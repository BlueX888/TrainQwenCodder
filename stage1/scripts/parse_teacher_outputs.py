#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from common import extract_plan_code, iter_jsonl, parse_plan_json, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--requests", default=str(repo_root() / "stage1/data/sft_distill/requests.jsonl"))
    ap.add_argument("--raw-outputs", default=str(repo_root() / "stage1/data/sft_distill/raw_outputs.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage1/data/sft_distill/candidates.jsonl"))
    args = ap.parse_args()

    req_path = Path(args.requests)
    raw_path = Path(args.raw_outputs)
    out_path = Path(args.out)

    if not req_path.exists():
        raise SystemExit(f"requests not found: {req_path}")
    if not raw_path.exists():
        raise SystemExit(f"raw outputs not found: {raw_path}")

    req_by_id: Dict[str, Dict[str, Any]] = {}
    for r in iter_jsonl(req_path):
        rid = str(r.get("request_id", "")).strip()
        if rid:
            req_by_id[rid] = r

    now = datetime.now(timezone.utc).isoformat()
    candidates: List[Dict[str, Any]] = []

    stats = {
        "total": 0,
        "with_plan": 0,
        "with_code": 0,
        "plan_json_ok": 0,
        "missing_request": 0,
    }

    for i, row in enumerate(iter_jsonl(raw_path), 1):
        stats["total"] += 1
        rid = str(row.get("request_id", "")).strip()
        req = req_by_id.get(rid)
        if req is None:
            stats["missing_request"] += 1
            req = {}

        text = str(row.get("text", "") or "")
        extracted = extract_plan_code(text)
        plan_obj, plan_str = parse_plan_json(extracted.plan_raw)

        if extracted.plan_raw.strip():
            stats["with_plan"] += 1
        if extracted.code_raw.strip():
            stats["with_code"] += 1
        if plan_obj is not None:
            stats["plan_json_ok"] += 1

        prompt = req.get("prompt") or {}
        messages = req.get("messages") or []
        gen = req.get("gen") or {}
        req_meta = req.get("meta") or {}
        candidates.append(
            {
                "candidate_id": f"cand_{i:06d}",
                "request_id": rid,
                "prompt_id": req.get("prompt_id", "") or prompt.get("id", ""),
                "variant": req.get("variant", row.get("variant", 0)),
                "prompt": prompt,
                "request": {"messages": messages, "gen": gen, "meta": req_meta},
                "plan": plan_obj,
                "plan_raw": plan_str,
                "code": extracted.code_raw,
                "text": text,
                "meta": {
                    "teacher_model": row.get("teacher_model", ""),
                    "finish_reason": row.get("finish_reason", ""),
                    "created_at": row.get("created_at", now),
                },
            }
        )

    write_jsonl(out_path, candidates)

    report_path = out_path.parent.parent / "reports" / "parse_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report = {"created_at": now, "requests": str(req_path), "raw_outputs": str(raw_path), "out": str(out_path), "stats": stats}
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
