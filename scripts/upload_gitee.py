#!/usr/bin/env python3
"""通过 Gitee API 上传资源文件（使用 POST 创建新文件）"""

import requests
import base64
import os

TOKEN = '8de01ccd489a2818ce1607ecf673db30'
OWNER = 'onemuggle'
REPO = 'moran-resources'
API = 'https://gitee.com/api/v5/repos'
GITEE_PAGES = "https://onemuggle.gitee.io/moran-resources"

def upload_file(filepath):
    """上传单个文件"""
    path = filepath.replace('\\', '/')
    url = f'{API}/{OWNER}/{REPO}/contents/{path}'

    with open(filepath, 'rb') as f:
        content = base64.b64encode(f.read()).decode()

    data = {
        'access_token': TOKEN,
        'message': f'Upload {path}',
        'content': content,
        'branch': 'master',
    }

    r = requests.post(url, json=data, timeout=30)
    if r.status_code in (201, 200):
        return True, r.json()
    else:
        return False, r.json()

def get_cdn_url(path):
    return f"{GITEE_PAGES}/{path}"

resources_dir = 'resources'
uploaded = []
failed = []

for root, dirs, files in os.walk(resources_dir):
    for filename in files:
        filepath = os.path.join(root, filename)
        key = filepath.replace('\\', '/')

        print(f"上传: {key} ...", end=' ', flush=True)
        ok, result = upload_file(filepath)
        if ok:
            cdn_url = get_cdn_url(key)
            uploaded.append((key, cdn_url))
            print("✅")
        else:
            failed.append((key, result))
            print(f"❌ {result.get('message', str(result))[:80]}")

print(f"\n完成: {len(uploaded)} 成功, {len(failed)} 失败")
if failed:
    print("\n失败文件:")
    for k, e in failed:
        print(f"  {k}: {e}")
