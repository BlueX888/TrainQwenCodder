#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List


def load_summary(path: Path) -> Dict[str, Any]:
    obj = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(obj, dict):
        raise ValueError(f"summary not object: {path}")
    return obj


def pick_metrics(summary: Dict[str, Any]) -> Dict[str, Any]:
    m = summary.get("metrics") or {}
    pass1 = m.get("pass1") or {}
    out = {
        "model_name": summary.get("model_name", ""),
        "pass_at_1": float(m.get("pass_at_1", 0.0) or 0.0),
        "pass_at_8": float(m.get("pass_at_8", 0.0) or 0.0),
        "api_accuracy_mean": float(pass1.get("api_accuracy_mean", 0.0) or 0.0),
        "structure_rate": float(pass1.get("structure_rate", 0.0) or 0.0),
        "crash_rate": float(pass1.get("crash_rate", 0.0) or 0.0),
        "lint_rate": float(pass1.get("lint_rate", 0.0) or 0.0),
    }
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--summaries", nargs="+", required=True, help="one or more summary.json paths")
    ap.add_argument("--out-json", required=True)
    ap.add_argument("--out-csv", required=True)
    args = ap.parse_args()

    rows: List[Dict[str, Any]] = []
    for p in args.summaries:
        s = load_summary(Path(p))
        rows.append(pick_metrics(s))

    baseline = rows[0] if rows else None
    out_rows: List[Dict[str, Any]] = []
    for r in rows:
        rr = dict(r)
        if baseline is not None:
            rr.update(
                {
                    "d_pass_at_1": rr["pass_at_1"] - baseline["pass_at_1"],
                    "d_pass_at_8": rr["pass_at_8"] - baseline["pass_at_8"],
                    "d_api_accuracy_mean": rr["api_accuracy_mean"] - baseline["api_accuracy_mean"],
                    "d_structure_rate": rr["structure_rate"] - baseline["structure_rate"],
                    "d_crash_rate": rr["crash_rate"] - baseline["crash_rate"],
                }
            )
        out_rows.append(rr)

    out_json = Path(args.out_json)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps({"baseline": baseline, "rows": out_rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    out_csv = Path(args.out_csv)
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "model_name",
        "pass_at_1",
        "pass_at_8",
        "api_accuracy_mean",
        "structure_rate",
        "crash_rate",
        "lint_rate",
        "d_pass_at_1",
        "d_pass_at_8",
        "d_api_accuracy_mean",
        "d_structure_rate",
        "d_crash_rate",
    ]
    with out_csv.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in out_rows:
            w.writerow({k: r.get(k, "") for k in fields})

    print(json.dumps({"out_json": str(out_json), "out_csv": str(out_csv)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

