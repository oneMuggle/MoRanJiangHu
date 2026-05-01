#!/usr/bin/env python3
"""上传本地资源文件到七牛云"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv('.env.qiniu')

import qiniu

ACCESS_KEY = os.getenv('QINIU_ACCESS_KEY')
SECRET_KEY = os.getenv('QINIU_SECRET_KEY')
BUCKET = os.getenv('QINIU_BUCKET')
CDN_DOMAIN = os.getenv('QINIU_CDN_DOMAIN')

print(f"Bucket: {BUCKET}")
print(f"CDN Domain: {CDN_DOMAIN}")
print(f"Access Key: {ACCESS_KEY[:8]}...")

auth = qiniu.Auth(ACCESS_KEY, SECRET_KEY)

# 上传本地 resources 目录
resources_dir = 'resources'

uploaded = []
failed = []

for root, dirs, files in os.walk(resources_dir):
    for filename in files:
        local_path = os.path.join(root, filename)
        # 七牛云 key = resources/images/xxx.png
        key = local_path.replace('\\', '/')

        token = auth.upload_token(BUCKET, key)
        ret, info = qiniu.put_file(token, key, local_path)
        if ret is not None:
            url = f"https://{CDN_DOMAIN}/{key}"
            uploaded.append((key, url))
            print(f"✅ {key} -> {url}")
        else:
            failed.append((key, info))
            print(f"❌ {key} failed: {info}")

print(f"\n完成: {len(uploaded)} 成功, {len(failed)} 失败")
if failed:
    print("失败的文件:")
    for k, e in failed:
        print(f"  {k}: {e}")
