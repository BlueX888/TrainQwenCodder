#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

from typing import Dict, List


# Map high-level "must_use_apis" in prompt seeds to concrete checkable patterns.
# - If the mapped value contains '#', stage0 validator will require it to appear in api_usage.hits.
# - Otherwise it will check member-expression existence / substring existence.
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
    # Keyboard (access-based)
    "Phaser.Input.Keyboard.KeyCodes": ["Phaser.Input.Keyboard.KeyCodes", "this.input.keyboard"],
}


def derive_must_use_checks(must_use_apis: List[str]) -> List[str]:
    out: List[str] = []
    for m in must_use_apis:
        s = str(m).strip()
        if not s:
            continue
        mapped = MUST_USE_MAP.get(s)
        if mapped:
            out.extend(mapped)
        else:
            out.append(s)
    seen = set()
    uniq: List[str] = []
    for x in out:
        if x in seen:
            continue
        seen.add(x)
        uniq.append(x)
    return uniq

