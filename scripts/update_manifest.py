#!/usr/bin/env python3
"""更新 manifest.json 中的 CDN 地址：从 R2 迁移到七牛云"""

import json
import os
from datetime import datetime

CDN_BASE = "https://ted3eqr3p.hn-bkt.clouddn.com"

manifest_path = "resources/manifest.json"

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

count = 0
def replace_url(obj):
    global count
    if isinstance(obj, dict):
        if "cdn_url" in obj and obj["cdn_url"].startswith("r2://"):
            old = obj["cdn_url"]
            # r2://mosheqiankun/resources/images/xxx.png -> https://cdn/resources/images/xxx.png
            path = old.replace("r2://mosheqiankun/", "")
            obj["cdn_url"] = f"{CDN_BASE}/{path}"
            count += 1
            print(f"  {old}")
            print(f"    -> {obj['cdn_url']}")
        for v in obj.values():
            replace_url(v)
    elif isinstance(obj, list):
        for item in obj:
            replace_url(item)

print("替换 CDN URL:")
replace_url(manifest["resources"])

manifest["updated_at"] = datetime.now().isoformat()

with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print(f"\n完成: 替换了 {count} 个 URL")
