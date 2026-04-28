#!/usr/bin/env python3
"""
Cloudflare R2 资源管理命令行工具

功能：
- 上传/下载/删除 R2 资源文件
- 生成/更新 manifest.json
- 同步本地 resources/ 目录到 R2
- 列出 R2 上的资源

Usage:
    python3 scripts/r2_manager.py upload resources/images/items/icon.png images/items/icon.png
    python3 scripts/r2_manager.py download images/items/icon.png /tmp/icon.png
    python3 scripts/r2_manager.py sync
    python3 scripts/r2_manager.py manifest
    python3 scripts/r2_manager.py list
    python3 scripts/r2_manager.py delete images/items/icon.png
"""

import os
import sys
import json
import hashlib
import argparse
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict

# boto3 是可选依赖，未安装时给出友好提示
try:
    import boto3
    from botocore.exceptions import ClientError
    HAS_BOTO3 = True
except ImportError:
    HAS_BOTO3 = False

# ============== 配置 ==============

DEFAULT_BUCKET = os.environ.get("R2_BUCKET", "wuxia-game-assets")
DEFAULT_CDN_BASE = os.environ.get("CDN_BASE_URL", "")
MANIFEST_FILENAME = "manifest.json"
RESOURCES_DIR = Path(__file__).parent.parent / "resources"


@dataclass
class ResourceEntry:
    id: str
    resource_type: str  # image, audio
    cdn_url: str
    local_path: str
    size: int
    sha256: str
    content_type: str
    updated_at: str


@dataclass
class Manifest:
    version: str
    updated_at: str
    base_url: str
    resources: Dict[str, Dict[str, List[Dict[str, Any]]]]


def get_r2_client():
    """获取 R2 S3 兼容客户端"""
    if not HAS_BOTO3:
        print("错误: 需要安装 boto3 库")
        print("安装命令: pip install boto3")
        sys.exit(1)

    account_id = os.environ.get("CF_ACCOUNT_ID")
    access_key_id = os.environ.get("R2_ACCESS_KEY_ID")
    access_key_secret = os.environ.get("R2_ACCESS_KEY_SECRET")

    if not all([account_id, access_key_id, access_key_secret]):
        print("错误: R2 环境变量未配置，无法操作")
        print("需要设置: CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_ACCESS_KEY_SECRET")
        sys.exit(1)

    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key_id,
        aws_secret_access_key=access_key_secret,
        region_name="auto",
    )


def get_cdn_base() -> str:
    """获取 CDN 基础 URL"""
    base = os.environ.get("CDN_BASE_URL", "").rstrip("/")
    if not base:
        # 尝试从 manifest 读取
        manifest_path = RESOURCES_DIR / MANIFEST_FILENAME
        if manifest_path.exists():
            try:
                with open(manifest_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    base = data.get("base_url", "").rstrip("/")
            except Exception:
                pass
    return base


def compute_sha256(file_path: str) -> str:
    """计算文件 SHA256"""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return f"sha256:{sha256.hexdigest()}"


def guess_content_type(file_path: str) -> str:
    """根据扩展名猜测 MIME 类型"""
    ext = Path(file_path).suffix.lower()
    mapping = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".ogg": "audio/ogg",
        ".flac": "audio/flac",
        ".json": "application/json",
    }
    return mapping.get(ext, "application/octet-stream")


def path_to_resource_type(r2_key: str) -> str:
    """根据 R2 key 路径判断资源类型"""
    if r2_key.startswith("images/"):
        return "image"
    if r2_key.startswith("audio/"):
        return "audio"
    return "other"


# ============== Manifest 操作 ==============

def load_manifest() -> Manifest:
    """加载本地 manifest"""
    manifest_path = RESOURCES_DIR / MANIFEST_FILENAME
    if not manifest_path.exists():
        return Manifest(
            version="1.0.0",
            updated_at=datetime.now(timezone.utc).isoformat(),
            base_url=get_cdn_base(),
            resources={"images": {}, "audio": {}},
        )
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return Manifest(**data)


def save_manifest(manifest: Manifest) -> str:
    """保存 manifest 到本地"""
    manifest_path = RESOURCES_DIR / MANIFEST_FILENAME
    manifest.updated_at = datetime.now(timezone.utc).isoformat()
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(asdict(manifest), f, ensure_ascii=False, indent=2)
    return str(manifest_path)


def update_manifest_entry(entry: ResourceEntry) -> Manifest:
    """更新 manifest 中的单个条目"""
    manifest = load_manifest()
    category = "images" if entry.resource_type == "image" else "audio"
    sub_path = entry.local_path.replace(f"resources/{category}/", "").split("/")[0] if f"resources/{category}/" in entry.local_path else "other"

    if category not in manifest.resources:
        manifest.resources[category] = {}
    if sub_path not in manifest.resources[category]:
        manifest.resources[category][sub_path] = []

    # 更新或添加条目
    existing = [r for r in manifest.resources[category][sub_path] if r["id"] == entry.id]
    entry_dict = asdict(entry)
    if existing:
        existing[0].update(entry_dict)
    else:
        manifest.resources[category][sub_path].append(entry_dict)

    save_manifest(manifest)
    return manifest


# ============== R2 操作 ==============

def upload_file(local_path: str, r2_key: str) -> str:
    """上传文件到 R2"""
    client = get_r2_client()
    bucket = DEFAULT_BUCKET
    content_type = guess_content_type(local_path)

    client.upload_file(
        local_path,
        bucket,
        r2_key,
        ExtraArgs={"ContentType": content_type},
    )

    cdn_base = get_cdn_base()
    if cdn_base:
        return f"{cdn_base}/{r2_key}"
    return f"r2://{bucket}/{r2_key}"


def download_file(r2_key: str, local_path: str) -> str:
    """从 R2 下载文件"""
    client = get_r2_client()
    bucket = DEFAULT_BUCKET

    Path(local_path).parent.mkdir(parents=True, exist_ok=True)
    client.download_file(bucket, r2_key, local_path)
    return local_path


def delete_file(r2_key: str) -> bool:
    """删除 R2 上的文件"""
    client = get_r2_client()
    bucket = DEFAULT_BUCKET

    try:
        client.delete_object(Bucket=bucket, Key=r2_key)
        return True
    except ClientError as e:
        print(f"删除失败: {e}")
        return False


def list_files(prefix: str = "") -> List[Dict]:
    """列出 R2 上的文件"""
    client = get_r2_client()
    bucket = DEFAULT_BUCKET

    files = []
    paginator = client.get_paginator("list_objects_v2")
    params = {"Bucket": bucket}
    if prefix:
        params["Prefix"] = prefix

    for page in paginator.paginate(**params):
        for obj in page.get("Contents", []):
            files.append({
                "key": obj["Key"],
                "size": obj["Size"],
                "last_modified": obj["LastModified"].isoformat(),
            })

    return files


# ============== 同步操作 ==============

def collect_local_resources() -> List[Dict]:
    """收集本地 resources/ 目录下的所有资源文件"""
    resources = []
    if not RESOURCES_DIR.exists():
        return resources

    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp", "*.gif", "*.mp3", "*.wav", "*.ogg", "*.flac"):
        for file_path in RESOURCES_DIR.rglob(ext):
            rel_path = file_path.relative_to(RESOURCES_DIR.parent)
            r2_key = str(rel_path).replace("\\", "/")
            resources.append({
                "local_path": str(file_path),
                "rel_path": str(rel_path),
                "r2_key": r2_key,
                "size": file_path.stat().st_size,
            })

    return resources


def sync_resources(
    priorities: Optional[List[str]] = None,
    resource_types: Optional[List[str]] = None,
    dry_run: bool = False,
) -> Dict[str, Any]:
    """同步本地资源到 R2"""
    results = {"uploaded": 0, "skipped": 0, "failed": 0, "errors": []}
    local_resources = collect_local_resources()

    # 筛选
    if resource_types:
        type_map = {"image": "images", "audio": "audio"}
        allowed_prefixes = [f"resources/{type_map[t]}/" for t in resource_types if t in type_map]
        local_resources = [r for r in local_resources if any(r["r2_key"].startswith(p) for p in allowed_prefixes)]

    if priorities:
        # 优先级筛选：根据文件名前缀匹配（如 P0_, P1_ 等）
        local_resources = [
            r for r in local_resources
            if any(f"P{p}_" in Path(r["r2_key"]).name for p in priorities)
        ]

    manifest = load_manifest()

    for i, res in enumerate(local_resources, 1):
        r2_key = res["r2_key"]
        local_path = res["local_path"]
        file_sha = compute_sha256(local_path)
        resource_type = path_to_resource_type(r2_key)

        # 检查是否需要上传
        existing = _find_in_manifest(manifest, r2_key)
        if existing and existing.get("sha256") == file_sha:
            results["skipped"] += 1
            print(f"  [{i}/{len(local_resources)}] 跳过（未变更）: {r2_key}")
            continue

        if dry_run:
            results["skipped"] += 1
            print(f"  [{i}/{len(local_resources)}] DRY-RUN: {r2_key}")
            continue

        try:
            cdn_url = upload_file(local_path, r2_key)
            entry = ResourceEntry(
                id=Path(r2_key).stem,
                resource_type=resource_type,
                cdn_url=cdn_url,
                local_path=res["rel_path"],
                size=res["size"],
                sha256=file_sha,
                content_type=guess_content_type(local_path),
                updated_at=datetime.now(timezone.utc).isoformat(),
            )
            update_manifest_entry(entry)
            results["uploaded"] += 1
            print(f"  [{i}/{len(local_resources)}] 上传成功: {r2_key} -> {cdn_url}")
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"key": r2_key, "error": str(e)})
            print(f"  [{i}/{len(local_resources)}] 上传失败: {r2_key} - {e}")

    # 保存更新后的 manifest 到 R2
    if not dry_run and results["uploaded"] > 0:
        manifest = load_manifest()
        manifest_path = RESOURCES_DIR / MANIFEST_FILENAME
        if manifest_path.exists():
            try:
                client = get_r2_client()
                client.upload_file(
                    str(manifest_path),
                    DEFAULT_BUCKET,
                    MANIFEST_FILENAME,
                    ExtraArgs={"ContentType": "application/json"},
                )
                print(f"\nmanifest.json 已上传到 R2")
            except Exception as e:
                print(f"\nmanifest.json 上传到 R2 失败: {e}")

    return results


def _find_in_manifest(manifest: Manifest, r2_key: str) -> Optional[Dict]:
    """在 manifest 中查找匹配的资源"""
    for category in manifest.resources.values():
        for sub_list in category.values():
            for entry in sub_list:
                if entry.get("local_path", "").replace("\\", "/") == r2_key:
                    return entry
    return None


# ============== CLI ==============

def cmd_upload(args):
    """上传单个文件"""
    local_path = args.local_path
    r2_key = args.r2_key

    if not Path(local_path).exists():
        print(f"错误: 本地文件不存在: {local_path}")
        sys.exit(1)

    cdn_url = upload_file(local_path, r2_key)
    print(f"上传成功: {local_path} -> {r2_key}")
    print(f"CDN URL: {cdn_url}")

    # 更新 manifest
    entry = ResourceEntry(
        id=Path(r2_key).stem,
        resource_type=path_to_resource_type(r2_key),
        cdn_url=cdn_url,
        local_path=local_path,
        size=Path(local_path).stat().st_size,
        sha256=compute_sha256(local_path),
        content_type=guess_content_type(local_path),
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
    update_manifest_entry(entry)
    print("manifest.json 已更新")


def cmd_download(args):
    """下载单个文件"""
    local_path = args.local_path or Path(args.r2_key).name
    download_file(args.r2_key, local_path)
    print(f"下载成功: {args.r2_key} -> {local_path}")


def cmd_delete(args):
    """删除文件"""
    ok = delete_file(args.r2_key)
    if ok:
        print(f"删除成功: {args.r2_key}")
    else:
        print(f"删除失败: {args.r2_key}")
        sys.exit(1)


def cmd_list(args):
    """列出文件"""
    prefix = args.prefix or ""
    files = list_files(prefix)
    if not files:
        print("未找到文件")
        return

    print(f"\n{'Key':<60} {'Size':>10}  {'Modified'}")
    print("-" * 90)
    for f in files:
        size_kb = f["size"] / 1024
        print(f"{f['key']:<60} {size_kb:>8.1f}KB  {f['last_modified'][:19]}")
    print(f"\n共 {len(files)} 个文件")


def cmd_sync(args):
    """同步资源"""
    priorities = [p.strip() for p in args.priority.split(",")] if args.priority else None
    resource_types = [t.strip() for t in args.resource_type.split(",")] if args.resource_type else None
    dry_run = args.dry_run

    mode = "DRY-RUN" if dry_run else "正式"
    print(f"\n{'='*60}")
    print(f"R2 资源同步 - {mode}模式")
    print(f"{'='*60}\n")

    results = sync_resources(
        priorities=priorities,
        resource_types=resource_types,
        dry_run=dry_run,
    )

    print(f"\n{'='*60}")
    print(f"同步结果")
    print(f"{'='*60}")
    print(f"上传: {results['uploaded']}")
    print(f"跳过: {results['skipped']}")
    print(f"失败: {results['failed']}")
    if results["errors"]:
        print(f"\n错误详情:")
        for err in results["errors"]:
            print(f"  - {err['key']}: {err['error']}")


def cmd_manifest(args):
    """生成/显示 manifest"""
    manifest = load_manifest()

    if args.push:
        try:
            manifest_path = RESOURCES_DIR / MANIFEST_FILENAME
            if manifest_path.exists():
                client = get_r2_client()
                client.upload_file(
                    str(manifest_path),
                    DEFAULT_BUCKET,
                    MANIFEST_FILENAME,
                    ExtraArgs={"ContentType": "application/json"},
                )
                print("manifest.json 已推送到 R2")
            else:
                print("本地 manifest.json 不存在，请先执行 sync")
        except Exception as e:
            print(f"推送失败: {e}")
            sys.exit(1)
        return

    print(json.dumps(asdict(manifest), ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Cloudflare R2 资源管理工具")
    subparsers = parser.add_subparsers(dest="command", help="子命令")

    # upload
    p_upload = subparsers.add_parser("upload", help="上传文件到 R2")
    p_upload.add_argument("local_path", help="本地文件路径")
    p_upload.add_argument("r2_key", help="R2 存储键（如 images/items/icon.png）")
    p_upload.set_defaults(func=cmd_upload)

    # download
    p_download = subparsers.add_parser("download", help="从 R2 下载文件")
    p_download.add_argument("r2_key", help="R2 存储键")
    p_download.add_argument("--output", dest="local_path", help="本地保存路径")
    p_download.set_defaults(func=cmd_download)

    # delete
    p_delete = subparsers.add_parser("delete", help="删除 R2 上的文件")
    p_delete.add_argument("r2_key", help="R2 存储键")
    p_delete.set_defaults(func=cmd_delete)

    # list
    p_list = subparsers.add_parser("list", help="列出 R2 上的文件")
    p_list.add_argument("--prefix", help="路径前缀过滤")
    p_list.set_defaults(func=cmd_list)

    # sync
    p_sync = subparsers.add_parser("sync", help="同步本地资源到 R2")
    p_sync.add_argument("--dry-run", action="store_true", help="模拟运行")
    p_sync.add_argument("--priority", help="优先级筛选，逗号分隔")
    p_sync.add_argument("--resource-type", help="资源类型筛选，逗号分隔（image, audio）")
    p_sync.set_defaults(func=cmd_sync)

    # manifest
    p_manifest = subparsers.add_parser("manifest", help="生成/显示 manifest")
    p_manifest.add_argument("--push", action="store_true", help="推送到 R2")
    p_manifest.set_defaults(func=cmd_manifest)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
