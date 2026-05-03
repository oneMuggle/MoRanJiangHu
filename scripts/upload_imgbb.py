#!/usr/bin/env python3
"""
imgbb 图床上传脚本
用法: python3 scripts/upload_imgbb.py <图片路径>
       python3 scripts/upload_imgbb.py --all  # 上传 resources/images 下所有图片
"""

import urllib.request
import urllib.parse
import base64
import json
import os
import sys
import time

# ============ 配置区 ============
API_KEY = "b9a2b004645f4db2e41e1595fd0c0218"
UPLOAD_URL = "https://api.imgbb.com/1/upload"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# ================================

def upload_image(filepath):
    filename = os.path.basename(filepath)
    print(f"Uploading {filename}...", end=" ", flush=True)

    with open(filepath, 'rb') as f:
        image_data = base64.b64encode(f.read()).decode('utf-8')

    params = urllib.parse.urlencode({
        "key": API_KEY,
        "image": image_data,
        "name": filename,
    })

    try:
        req = urllib.request.Request(UPLOAD_URL, data=params.encode())
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            if result.get("success"):
                url = result["data"]["url"]
                print(f"OK {url}")
                return url
            else:
                print(f"FAIL {result}")
                return None
    except Exception as e:
        print(f"ERROR {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    if sys.argv[1] == "--all":
        images_dir = os.path.join(BASE_DIR, "resources", "images")
        uploaded = {}
        files = []
        for root, dirs, filenames in os.walk(images_dir):
            for fname in sorted(filenames):
                if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    files.append((os.path.join(root, fname), fname))

        print(f"Found {len(files)} images to upload\n")
        for fpath, fname in files:
            url = upload_image(fpath)
            if url:
                uploaded[fname] = url
            time.sleep(1)  # imgbb 免费版限速

        print(f"\n=== 完成: {len(uploaded)}/{len(files)} ===")
        for fname, url in sorted(uploaded.items()):
            print(f"  {fname}: {url}")
    else:
        url = upload_image(sys.argv[1])
        print(f"Result: {url}")

if __name__ == "__main__":
    main()
