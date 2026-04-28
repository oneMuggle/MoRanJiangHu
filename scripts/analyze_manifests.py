#!/usr/bin/env python3
"""分析所有 manifest.json 的状态"""
import json
from pathlib import Path

assets_dir = Path("/home/ubuntu/project/MoRanJiangHu/data/era_assets")
manifests = sorted(assets_dir.glob("*/manifest.json"))

pending = []
for m in manifests:
    data = json.load(open(m))
    subdir = m.parent.name
    num_images = len(data.get("images", []))
    num_bgms = len(data.get("bgms", []))
    print(f"{data.get('status', '?'):12s} | {subdir:40s} | images:{num_images} bgms:{num_bgms}")
    if data.get("status") == "pending":
        pending.append(subdir)

print(f"\nTotal: {len(manifests)}, Pending: {len(pending)}")
print("Pending SubEras:", pending)
