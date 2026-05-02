#!/usr/bin/env python3
"""
pz.al 图床上传脚本
用法: python3 scripts/upload_pzal.py <图片路径>
       python3 scripts/upload_pzal.py --all  # 上传 resources/images 下所有图片
"""

import urllib.request
import urllib.parse
import json
import os
import sys
import time

# ============ 配置区 ============
TOKEN = "a225c412f65365d500bc9a787ff039"
UPLOAD_URL = "https://pz.al/api/upload"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# ================================

def upload_image(filepath):
    filename = os.path.basename(filepath)
    print(f"Uploading {filename}...", end=" ", flush=True)
    
    with open(filepath, 'rb') as f:
        image_data = f.read()
    
    boundary = "----WebKitFormBoundarypzalUpload"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="image"; filename="{filename}"\r\n'
        f"Content-Type: image/png\r\n\r\n"
    ).encode() + image_data + f"\r\n--{boundary}--\r\n".encode()
    
    req = urllib.request.Request(UPLOAD_URL, data=body)
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    req.add_header("Authorization", f"Bearer {TOKEN}")
    
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            if result.get("code") == 200:
                print(f"OK {result['data']['url']}")
                return result["data"]["url"]
            else:
                print(f"FAIL code={result.get('code')} msg={result.get('msg')}")
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
        for root, dirs, files in os.walk(images_dir):
            for fname in sorted(files):
                if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    fpath = os.path.join(root, fname)
                    url = upload_image(fpath)
                    if url:
                        uploaded[fname] = url
                    time.sleep(0.5)
        print(f"\n=== 完成: {len(uploaded)}/{len(files)} ===")
        for fname, url in uploaded.items():
            print(f"  {fname}: {url}")
    else:
        url = upload_image(sys.argv[1])
        print(f"Result: {url}")

if __name__ == "__main__":
    main()
