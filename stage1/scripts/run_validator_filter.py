#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from common import append_jsonl, ensure_dir, iter_jsonl, sha256_text, write_jsonl


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]

MUST_USE_MAP: Dict[str, List[str]] = {
    # GameObjects
    "Phaser.GameObjects.Graphics": ["Phaser.GameObjects.GameObjectFactory#graphics"],
    "Phaser.GameObjects.Text": ["Phaser.GameObjects.GameObjectFactory#text"],
    "Phaser.GameObjects.Sprite": ["Phaser.GameObjects.GameObjectFactory#sprite"],
    "Phaser.GameObjects.Image": ["Phaser.GameObjects.GameObjectFactory#image"],
    "Phaser.GameObjects.Container": ["Phaser.GameObjects.GameObjectFactory#container"],
    "Phaser.GameObjects.Particles.ParticleEmitterManager": ["Phaser.GameObjects.GameObjectFactory#particles"],
    # Physics (Arcade)
    "Phaser.Physics.Arcade.Sprite": ["Phaser.Physics.Arcade.Factory#sprite"],
    "Phaser.Physics.Arcade.Group": ["Phaser.Physics.Arcade.Factory#group"],
    # Tween
    "Phaser.Tweens.Tween": ["Phaser.Tweens.TweenManager#add"],
    # Tilemap
    "Phaser.Tilemaps.Tilemap": ["Phaser.GameObjects.GameObjectCreator#tilemap"],
    # Camera (access-based)
    "Phaser.Cameras.Scene2D.Camera": ["this.cameras.main"],
}


def derive_must_use_checks(must_use_apis: List[str]) -> List[str]:
    """
    Convert high-level must_use_apis (often class names) into checkable patterns for validator:
    - symbol_id requirements (contain '#') are checked against validator api_usage.hits
    - string requirements are checked against member expressions or substring match
    """

    out: List[str] = []
    for m in must_use_apis:
        s = str(m).strip()
        if not s:
            continue
        mapped = MUST_USE_MAP.get(s)
        if mapped:
            out.extend(mapped)
            continue
        out.append(s)

    # stable de-dup
    seen = set()
    uniq: List[str] = []
    for x in out:
        if x in seen:
            continue
        seen.add(x)
        uniq.append(x)
    return uniq


def must_use_hash(must_use: List[str]) -> str:
    norm = [str(x).strip() for x in must_use if str(x).strip()]
    norm.sort()
    return sha256_text(json.dumps(norm, ensure_ascii=False))


def cache_key(code_hash: str, must_use: List[str], skip_eslint: bool, skip_runtime: bool) -> str:
    return f"{code_hash}:{must_use_hash(must_use)}:{int(skip_eslint)}:{int(skip_runtime)}"


def load_cache(path: Optional[Path]) -> Dict[str, Dict[str, Any]]:
    if not path or not path.exists():
        return {}
    cache: Dict[str, Dict[str, Any]] = {}
    for row in iter_jsonl(path):
        k = str(row.get("key", "")).strip()
        v = row.get("validator")
        if k and isinstance(v, dict):
            cache[k] = v
    return cache


def run_validator(
    *,
    validator_cli: Path,
    api_index: Path,
    code_file: Path,
    must_use: List[str],
    timeout_ms: int,
    frames: int,
    skip_eslint: bool,
    skip_runtime: bool,
) -> Tuple[bool, Dict[str, Any], str]:
    cmd = [
        "node",
        str(validator_cli),
        "--code-file",
        str(code_file),
        "--api-index",
        str(api_index),
        "--prompt-json",
        json.dumps({"must_use_apis": must_use}, ensure_ascii=False),
        "--timeout-ms",
        str(int(timeout_ms)),
        "--frames",
        str(int(frames)),
    ]
    if skip_eslint:
        cmd.append("--skip-eslint")
    if skip_runtime:
        cmd.append("--skip-runtime")

    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    stderr = (p.stderr or "").strip()
    out = (p.stdout or "").strip()

    if p.returncode != 0:
        return False, {}, stderr or f"validator_exit_{p.returncode}"
    if not out:
        return False, {}, stderr or "validator_empty_stdout"
    try:
        obj = json.loads(out)
    except json.JSONDecodeError as e:
        return False, {}, f"validator_output_not_json: {e}"
    if not isinstance(obj, dict):
        return False, {}, "validator_output_not_object"
    return True, obj, stderr


def failure_reason(v: Dict[str, Any]) -> str:
    if not v.get("parse_ok", False):
        return "parse_failed"
    if not v.get("lint_ok", False):
        return "lint_failed"
    if not v.get("api_ok", False):
        return "api_failed"
    if not v.get("runtime_ok", False):
        return "runtime_failed"
    return ""


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", default=str(repo_root() / "stage1/data/sft_distill/candidates.jsonl"))
    ap.add_argument("--out", default=str(repo_root() / "stage1/data/sft_distill/validated.jsonl"))
    ap.add_argument("--api-index", default=str(repo_root() / "stage0/data/api_index/phaser_api.jsonl"))
    ap.add_argument("--validator-cli", default=str(repo_root() / "stage0/validator/src/cli.js"))
    ap.add_argument("--cache-jsonl", default=str(repo_root() / "stage1/data/sft_distill/validator_cache.jsonl"))
    ap.add_argument("--code-dir", default=str(repo_root() / "stage1/data/sft_distill/codes"))
    ap.add_argument("--save-codes", action="store_true")
    ap.add_argument("--timeout-ms", type=int, default=1500)
    ap.add_argument("--frames", type=int, default=60)
    ap.add_argument("--skip-eslint", action="store_true")
    ap.add_argument("--skip-runtime", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    candidates_path = Path(args.candidates)
    out_path = Path(args.out)
    api_index_path = Path(args.api_index)
    validator_cli = Path(args.validator_cli)
    cache_path = Path(args.cache_jsonl) if args.cache_jsonl else None
    code_dir = Path(args.code_dir)
    save_codes = bool(args.save_codes)

    if not candidates_path.exists():
        raise SystemExit(f"candidates not found: {candidates_path}")
    if not api_index_path.exists():
        raise SystemExit(f"api index not found: {api_index_path}")
    if not validator_cli.exists():
        raise SystemExit(f"validator cli not found: {validator_cli}")

    if save_codes:
        ensure_dir(code_dir)

    cache = load_cache(cache_path)
    now = datetime.now(timezone.utc).isoformat()

    stats = {
        "total": 0,
        "pass": 0,
        "fail": 0,
        "fail_reasons": {},
        "skip_eslint": bool(args.skip_eslint),
        "skip_runtime": bool(args.skip_runtime),
    }

    validated_rows: List[Dict[str, Any]] = []
    limit = int(args.limit)

    for row_i, cand in enumerate(iter_jsonl(candidates_path), 1):
        if limit > 0 and row_i > limit:
            break

        stats["total"] += 1

        code = str(cand.get("code", "") or "")
        code_hash = sha256_text(code)

        prompt = cand.get("prompt") or {}
        must_use_raw = prompt.get("must_use_apis") or []
        must_use_raw = [str(x) for x in must_use_raw if x is not None]
        must_use = derive_must_use_checks(must_use_raw)

        k = cache_key(code_hash, must_use, bool(args.skip_eslint), bool(args.skip_runtime))
        v = cache.get(k)
        if v is None:
            code_file = (code_dir / f"{code_hash}.js") if save_codes else (out_path.parent / f"__tmp_{code_hash}.js")
            code_file.parent.mkdir(parents=True, exist_ok=True)
            code_file.write_text(code + "\n", encoding="utf-8")

            ok, v, stderr = run_validator(
                validator_cli=validator_cli,
                api_index=api_index_path,
                code_file=code_file,
                must_use=must_use,
                timeout_ms=int(args.timeout_ms),
                frames=int(args.frames),
                skip_eslint=bool(args.skip_eslint),
                skip_runtime=bool(args.skip_runtime),
            )
            if not save_codes:
                try:
                    code_file.unlink()
                except OSError:
                    pass
            if not ok:
                v = {
                    "parse_ok": False,
                    "lint_ok": False,
                    "api_ok": False,
                    "runtime_ok": False,
                    "errors": [{"code": "validator_failed", "message": stderr}],
                    "warnings": [],
                    "api_usage": {"hits": [], "misses": [], "must_use_hits": [], "must_use_misses": []},
                    "runtime": {"ms": 0, "crashed": True, "logs": [], "errors": [stderr], "signals": {}},
                    "signals": {},
                }

            cache[k] = v
            if cache_path is not None:
                append_jsonl(
                    cache_path,
                    {
                        "key": k,
                        "code_hash": code_hash,
                        "must_use_raw": must_use_raw,
                        "must_use_checks": must_use,
                        "validator": v,
                        "created_at": now,
                    },
                )

        reason = failure_reason(v)
        passed = reason == ""
        if passed:
            stats["pass"] += 1
        else:
            stats["fail"] += 1
            stats["fail_reasons"][reason] = stats["fail_reasons"].get(reason, 0) + 1

        out_row = dict(cand)
        out_row["code_hash"] = code_hash
        out_row["validation"] = v
        out_row["filter_pass"] = passed
        out_row["fail_reason"] = reason
        validated_rows.append(out_row)

    write_jsonl(out_path, validated_rows)

    report_path = out_path.parent.parent / "reports" / "filter_report.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "created_at": now,
        "candidates": str(candidates_path),
        "out": str(out_path),
        "api_index": str(api_index_path),
        "validator_cli": str(validator_cli),
        "stats": stats,
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
