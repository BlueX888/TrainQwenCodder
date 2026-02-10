#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 对 API 索引执行 BM25 检索，用于 Prompt 注入与人工检索。

import argparse
import heapq
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


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
    if not norm:
        return []
    return norm.split()


def expand_query_tokens(query: str) -> List[str]:
    tokens = tokenize(query)
    for ch_kw, en_tokens in CH2EN_HINTS.items():
        if ch_kw in query:
            tokens.extend(en_tokens)
    # de-dup while preserving order
    seen = set()
    out: List[str] = []
    for t in tokens:
        if not t or t in seen:
            continue
        seen.add(t)
        out.append(t)
    return out


def iter_jsonl(path: Path) -> Iterable[dict]:
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            yield json.loads(line)


def record_text(rec: dict) -> str:
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
class BM25:
    idf: Dict[str, float]
    avgdl: float
    k1: float = 1.2
    b: float = 0.75

    def score(self, query_tokens: List[str], doc_tf: Dict[str, int], dl: int) -> float:
        if dl <= 0:
            return 0.0
        score = 0.0
        denom_norm = self.k1 * (1.0 - self.b + self.b * (dl / self.avgdl))
        for t in query_tokens:
            tf = doc_tf.get(t, 0)
            if tf <= 0:
                continue
            idf = self.idf.get(t, 0.0)
            score += idf * (tf * (self.k1 + 1.0)) / (tf + denom_norm)
        return float(score)


def build_bm25(index_path: Path) -> Tuple[BM25, int]:
    df: Dict[str, int] = {}
    total_dl = 0
    n_docs = 0

    for rec in iter_jsonl(index_path):
        tokens = tokenize(record_text(rec))
        if not tokens:
            continue
        n_docs += 1
        total_dl += len(tokens)
        for t in set(tokens):
            df[t] = df.get(t, 0) + 1

    if n_docs == 0:
        return BM25(idf={}, avgdl=1.0), 0

    avgdl = total_dl / n_docs
    idf: Dict[str, float] = {}
    for t, c in df.items():
        # BM25+ style idf (always positive)
        idf[t] = math.log((n_docs - c + 0.5) / (c + 0.5) + 1.0)

    return BM25(idf=idf, avgdl=avgdl), n_docs


def topk_search(index_path: Path, query: str, top_k: int) -> List[dict]:
    bm25, n_docs = build_bm25(index_path)
    if n_docs == 0:
        return []

    q_tokens = expand_query_tokens(query)
    if not q_tokens:
        return []

    heap: List[Tuple[float, int, dict]] = []
    seq = 0

    for rec in iter_jsonl(index_path):
        text = record_text(rec)
        tokens = tokenize(text)
        if not tokens:
            continue
        tf: Dict[str, int] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        s = bm25.score(q_tokens, tf, len(tokens))
        if s <= 0:
            continue
        seq += 1
        item = (s, seq, rec)
        if len(heap) < top_k:
            heapq.heappush(heap, item)
        else:
            if s > heap[0][0]:
                heapq.heapreplace(heap, item)

    heap.sort(key=lambda x: x[0], reverse=True)
    out: List[dict] = []
    for s, _, rec in heap:
        out.append(
            {
                "symbol_id": rec.get("symbol_id", ""),
                "owner": rec.get("owner", ""),
                "name": rec.get("name", ""),
                "kind": rec.get("kind", ""),
                "signature": rec.get("signature", ""),
                "tags": rec.get("tags", []),
                "score": round(float(s), 6),
            }
        )
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--index", required=True, help="Path to API index JSONL (e.g. data/api_index/phaser_api.jsonl)")
    ap.add_argument("--text", required=True, help="Query text")
    ap.add_argument("--top-k", type=int, default=20)
    ap.add_argument("--pretty", action="store_true")
    args = ap.parse_args()

    index_path = Path(args.index)
    if not index_path.exists():
        raise SystemExit(f"Index not found: {index_path}")

    results = topk_search(index_path, args.text, max(1, int(args.top_k)))
    if args.pretty:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print(json.dumps(results, ensure_ascii=False))


if __name__ == "__main__":
    main()
