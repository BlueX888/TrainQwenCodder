#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator, Optional, Set, Tuple


def iter_jsonl(path: Path) -> Iterator[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s:
                continue
            obj = json.loads(s)
            if isinstance(obj, dict):
                yield obj


@dataclass
class ApiIndex:
    symbol_ids: Set[str]

    @classmethod
    def load(cls, path: Path) -> "ApiIndex":
        symbol_ids: Set[str] = set()
        for rec in iter_jsonl(path):
            sid = rec.get("symbol_id")
            if isinstance(sid, str) and sid:
                symbol_ids.add(sid)
        return cls(symbol_ids=symbol_ids)

    def exists(self, api_token: str) -> bool:
        s = (api_token or "").strip()
        if not s:
            return False
        return s in self.symbol_ids

    def normalize_token(self, api_token: str) -> str:
        """
        Normalize plan api strings into canonical symbol_id-like forms.
        Examples:
        - "Phaser.Events.EventEmitter#on(event: ...): this" -> "Phaser.Events.EventEmitter#on"
        - "this.add.text" -> keep as-is (member string)
        - "Phaser.Input.Events.POINTER_DOWN" -> keep as-is
        """

        s = (api_token or "").strip()
        if not s:
            return ""

        # strip signature args if present
        if "(" in s:
            s = s.split("(", 1)[0].strip()
        # strip trailing punctuation
        s = s.rstrip(":;")
        return s

