#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple


CH2EN_HINTS = {
    "场景": ["scene"],
    "切场景": ["scene", "start"],
    "物理": ["physics", "arcade"],
    "重力": ["gravity"],
    "碰撞": ["collider", "overlap", "collision"],
    "输入": ["input"],
    "鼠标": ["pointer"],
    "触摸": ["pointer", "touch"],
    "键盘": ["keyboard", "cursors", "keys"],
    "拖拽": ["drag"],
    "动画": ["animation", "anims", "tween"],
    "补间": ["tween"],
    "粒子": ["particles", "emitter"],
    "瓦片": ["tilemap"],
    "地图": ["tilemap"],
    "摄像机": ["camera"],
    "文本": ["text"],
    "精灵": ["sprite"],
    "容器": ["container"],
    "图形": ["graphics"],
    "声音": ["sound", "audio"],
}

_RE_CAMEL_1 = re.compile(r"([a-z0-9])([A-Z])")
_RE_CAMEL_2 = re.compile(r"([A-Z]+)([A-Z][a-z])")
_RE_NON_TOKEN = re.compile(r"[^0-9a-zA-Z]+")


def normalize_text(s: str) -> str:
    s = s.replace("#", " ").replace(".", " ").replace("/", " ").replace("_", " ").replace("-", " ")
    s = _RE_CAMEL_2.sub(r"\1 \2", s)
    s = _RE_CAMEL_1.sub(r"\1 \2", s)
    s = s.lower()
    s = _RE_NON_TOKEN.sub(" ", s)
    return " ".join(s.split())


def tokenize(text: str) -> List[str]:
    norm = normalize_text(text)
    return norm.split() if norm else []


def expand_query_tokens(query: str) -> List[str]:
    tokens = tokenize(query)
    for ch_kw, en_tokens in CH2EN_HINTS.items():
        if ch_kw in query:
            tokens.extend(en_tokens)
    seen = set()
    out: List[str] = []
    for t in tokens:
        if not t or t in seen:
            continue
        seen.add(t)
        out.append(t)
    return out


def iter_jsonl(path: Path) -> Iterable[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s:
                continue
            obj = json.loads(s)
            if isinstance(obj, dict):
                yield obj


def record_text(rec: Dict[str, Any]) -> str:
    parts = []
    for k in ("symbol_id", "owner", "name", "signature", "kind"):
        v = rec.get(k)
        if isinstance(v, str) and v:
            parts.append(v)
    tags = rec.get("tags")
    if isinstance(tags, list) and tags:
        parts.append(" ".join(str(x) for x in tags))
    return " ".join(parts)


@dataclass
class ApiEntry:
    symbol_id: str
    owner: str
    name: str
    kind: str
    signature: str
    tags: List[str]


class ApiBm25Index:
    def __init__(self, index_path: Path, k1: float = 1.2, b: float = 0.75) -> None:
        self.index_path = index_path
        self.k1 = float(k1)
        self.b = float(b)

        self.entries: List[ApiEntry] = []
        self.doc_len: List[int] = []
        self.doc_norm: List[float] = []
        self.postings: Dict[str, List[Tuple[int, int]]] = {}
        self.idf: Dict[str, float] = {}
        self.avgdl: float = 1.0

    def build(self, limit: Optional[int] = None) -> "ApiBm25Index":
        df: Dict[str, int] = {}
        total_dl = 0
        n_docs = 0

        for rec in iter_jsonl(self.index_path):
            if limit is not None and n_docs >= limit:
                break

            text = record_text(rec)
            tokens = tokenize(text)
            if not tokens:
                continue

            entry = ApiEntry(
                symbol_id=str(rec.get("symbol_id", "")),
                owner=str(rec.get("owner", "")),
                name=str(rec.get("name", "")),
                kind=str(rec.get("kind", "")),
                signature=str(rec.get("signature", "")),
                tags=list(rec.get("tags", []) or []),
            )
            doc_id = len(self.entries)
            self.entries.append(entry)

            dl = len(tokens)
            self.doc_len.append(dl)
            total_dl += dl
            n_docs += 1

            tf: Dict[str, int] = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            for t, c in tf.items():
                self.postings.setdefault(t, []).append((doc_id, c))
            for t in tf.keys():
                df[t] = df.get(t, 0) + 1

        if n_docs == 0:
            self.avgdl = 1.0
            self.doc_norm = [0.0 for _ in self.entries]
            self.idf = {}
            return self

        self.avgdl = total_dl / n_docs
        self.doc_norm = [self.k1 * (1.0 - self.b + self.b * (dl / self.avgdl)) for dl in self.doc_len]

        idf: Dict[str, float] = {}
        for t, c in df.items():
            idf[t] = math.log((n_docs - c + 0.5) / (c + 0.5) + 1.0)
        self.idf = idf
        return self

    def query(self, text: str, top_k: int = 20) -> List[Tuple[ApiEntry, float]]:
        if not self.entries:
            return []
        q_tokens = expand_query_tokens(text)
        if not q_tokens:
            return []

        scores: Dict[int, float] = {}
        for t in q_tokens:
            plist = self.postings.get(t)
            if not plist:
                continue
            idf = self.idf.get(t, 0.0)
            for doc_id, tf in plist:
                denom = tf + self.doc_norm[doc_id]
                inc = idf * (tf * (self.k1 + 1.0)) / denom
                scores[doc_id] = scores.get(doc_id, 0.0) + inc

        if not scores:
            return []

        # partial sort
        items = sorted(scores.items(), key=lambda x: x[1], reverse=True)[: max(1, int(top_k))]
        return [(self.entries[i], float(s)) for i, s in items]

    def format_context_lines(self, query_text: str, top_k: int = 20) -> List[str]:
        out: List[str] = []
        for entry, _score in self.query(query_text, top_k=top_k):
            sig = entry.signature.strip() or entry.symbol_id
            out.append(sig)
        return out

