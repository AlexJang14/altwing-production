#!/usr/bin/env python3
from __future__ import annotations

import itertools
import math
import re
from collections import Counter
from pathlib import Path

MAJORS = [
    "aerospace", "mechanical", "electrical", "computer", "chemical",
    "biomedical", "civil", "industrial", "materials", "environmental",
    "nuclear", "robotics", "software", "petroleum",
]

match_source = Path("src/features/guidance/engineeringMatchData.ts").read_text()
component_source = Path("src/features/guidance/EngineeringMatch.tsx").read_text()

weight_blocks = re.findall(r"weights:\s*\{([^}]*)\}", match_source)
if len(weight_blocks) != 32:
    raise SystemExit(f"Expected 32 WingMatch option weight blocks; found {len(weight_blocks)}")

options = []
for block in weight_blocks:
    weights = {major: 0.0 for major in MAJORS}
    for key, value in re.findall(r"(\w+):\s*([0-9.]+)", block):
        if key in weights:
            weights[key] = float(value)
    options.append(weights)
questions = [options[index:index + 4] for index in range(0, len(options), 4)]

baseline_pattern = re.compile(
    r"(aerospace|mechanical|electrical|computer|chemical|biomedical|civil|industrial|materials|environmental|nuclear|robotics|software|petroleum):\s*"
    r"\{\s*mean:\s*([\-0-9.]+),\s*sd:\s*([\-0-9.]+),\s*offset:\s*([\-0-9.]+)\s*\}"
)
baselines = {
    major: {"mean": float(mean), "sd": float(sd), "offset": float(offset)}
    for major, mean, sd, offset in baseline_pattern.findall(component_source)
}
if set(baselines) != set(MAJORS):
    missing = sorted(set(MAJORS) - set(baselines))
    raise SystemExit(f"Missing WingMatch baseline(s): {missing}")

wins = Counter()
combinations = 0
for choices in itertools.product(range(4), repeat=8):
    raw = {major: 0.0 for major in MAJORS}
    for q_index, option_index in enumerate(choices):
        for major, weight in questions[q_index][option_index].items():
            raw[major] += weight

    def calibrated(major: str) -> tuple[float, float, str]:
        baseline = baselines[major]
        z = ((raw[major] - baseline["mean"]) / baseline["sd"]) + baseline["offset"]
        return z, raw[major], major

    winner = max(MAJORS, key=calibrated)
    wins[winner] += 1
    combinations += 1

shares = {major: wins[major] / combinations for major in MAJORS}
spread = max(shares.values()) - min(shares.values())

print(f"Engineering WingMatch structural audit: {combinations:,} response patterns")
for major in MAJORS:
    print(f"{major:14} {shares[major] * 100:6.2f}%")
print(f"Winner-share spread: {spread * 100:.2f} percentage points")

if combinations != 65_536:
    raise SystemExit("Unexpected combination count")
if spread > 0.015:
    raise SystemExit("Winner-share spread exceeds the 1.5 percentage-point structural audit threshold")
print("Engineering WingMatch structural balance check passed.")
