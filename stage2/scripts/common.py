#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator, List, Optional, Tuple


def iter_jsonl(path: Path) -> Iterator[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            s = line.strip()
            if not s:
                continue
            try:
                obj = json.loads(s)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSONL at {path}:{line_no}: {e}") from e
            if not isinstance(obj, dict):
                raise ValueError(f"Expected object at {path}:{line_no}, got {type(obj)}")
            yield obj


def write_jsonl(path: Path, rows: Iterable[Dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def append_jsonl(path: Path, row: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def sha256_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8", errors="ignore")).hexdigest()


_RE_FENCE = re.compile(r"^```(?:\\w+)?\\s*$")


def strip_markdown_fences(code: str) -> str:
    lines = (code or "").splitlines()
    out: List[str] = []
    for ln in lines:
        if _RE_FENCE.match(ln.strip()):
            continue
        out.append(ln)
    return "\n".join(out).strip()


@dataclass
class Extracted:
    plan_raw: str
    code_raw: str


def extract_plan_code(text: str) -> Extracted:
    s = (text or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if not s:
        return Extracted(plan_raw="", code_raw="")

    lower = s.lower()
    plan_idx = lower.find("plan:")
    code_idx = lower.find("code:")

    if plan_idx != -1 and code_idx != -1 and plan_idx < code_idx:
        plan_part = s[plan_idx + len("plan:") : code_idx].strip()
        code_part = s[code_idx + len("code:") :].strip()
        return Extracted(plan_raw=plan_part, code_raw=strip_markdown_fences(code_part))

    # fallback: treat whole output as code
    return Extracted(plan_raw="", code_raw=strip_markdown_fences(s))


def parse_plan_json(plan_raw: str) -> Tuple[Optional[Dict[str, Any]], str]:
    raw = (plan_raw or "").strip()
    if not raw:
        return None, ""
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        return None, raw
    if isinstance(obj, dict):
        return obj, raw
    return None, raw


def clamp01(x: float) -> float:
    if x < 0.0:
        return 0.0
    if x > 1.0:
        return 1.0
    return float(x)


_RE_BLOCK_COMMENT = re.compile(r"/\\*.*?\\*/", re.DOTALL)
_RE_LINE_COMMENT = re.compile(r"//.*?$", re.MULTILINE)
_RE_WS = re.compile(r"\\s+")


def normalized_code_hash(code: str) -> str:
    s = code or ""
    s = _RE_BLOCK_COMMENT.sub("", s)
    s = _RE_LINE_COMMENT.sub("", s)
    s = _RE_WS.sub("", s)
    return sha256_text(s)


def non_empty_lines(code: str) -> int:
    return sum(1 for ln in (code or "").splitlines() if ln.strip())


def effective_code_ratio(code: str) -> float:
    lines = (code or "").splitlines()
    if not lines:
        return 0.0
    eff = 0
    for ln in lines:
        s = ln.strip()
        if not s:
            continue
        if s.startswith("//"):
            continue
        eff += 1
    return eff / max(1, sum(1 for ln in lines if ln.strip()))

