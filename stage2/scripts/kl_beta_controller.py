#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import json


def update_beta(beta: float, kl: float, target_kl: float, beta_mul: float, beta_min: float, beta_max: float) -> float:
    """
    Simple multiplicative controller:
    - if KL too high -> increase beta
    - if KL too low  -> decrease beta
    """

    b = float(beta)
    kl = float(kl)
    t = float(target_kl)
    mul = float(beta_mul)

    if t <= 0:
        return max(beta_min, min(beta_max, b))

    if kl > 1.5 * t:
        b *= mul
    elif kl < 0.5 * t:
        b /= mul

    if b < beta_min:
        b = beta_min
    if b > beta_max:
        b = beta_max
    return float(b)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--beta", type=float, required=True)
    ap.add_argument("--kl", type=float, required=True)
    ap.add_argument("--target-kl", type=float, default=0.1)
    ap.add_argument("--beta-mul", type=float, default=1.5)
    ap.add_argument("--beta-min", type=float, default=0.005)
    ap.add_argument("--beta-max", type=float, default=0.5)
    args = ap.parse_args()

    new_beta = update_beta(
        beta=float(args.beta),
        kl=float(args.kl),
        target_kl=float(args.target_kl),
        beta_mul=float(args.beta_mul),
        beta_min=float(args.beta_min),
        beta_max=float(args.beta_max),
    )
    out = {"beta_old": float(args.beta), "kl": float(args.kl), "target_kl": float(args.target_kl), "beta_new": new_beta}
    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    main()

