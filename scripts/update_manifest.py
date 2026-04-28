#!/usr/bin/env python3
"""更新 manifest status"""
import json
import sys
from pathlib import Path
from datetime import datetime, timezone

target = sys.argv[1] if len(sys.argv) > 1 else "ancient_eastern_zhiguai"
new_status = sys.argv[2] if len(sys.argv) > 2 else "generating"

m = Path(f"/home/ubuntu/project/MoRanJiangHu/data/era_assets/{target}/manifest.json")
d = json.load(open(m))
d["status"] = new_status
d["updated_at"] = datetime.now(timezone.utc).isoformat()
json.dump(d, open(m, "w"), ensure_ascii=False, indent=2)
print(f"Updated {target} -> {new_status}")
