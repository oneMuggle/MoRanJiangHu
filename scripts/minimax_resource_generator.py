#!/usr/bin/env python3
"""
MiniMax 资源生成器 - 配合 Cloudflare R2 CDN 使用

定时任务流程（每天 22:00）：
1. 分析资源需求（检查 resources/ 目录和 PLAN_WuXiaAIWorld_v2.md）
2. 生成资源（MiniMax API 生成图片/音频）
3. 上传到 R2（通过 r2_manager.py 集成）
4. 更新 manifest.json

Usage:
    python3 scripts/minimax_resource_generator.py            # 完整流程
    python3 scripts/minimax_resource_generator.py --dry-run  # 模拟运行
    python3 scripts/minimax_resource_generator.py --upload-only  # 仅上传已有资源
"""

import os
import sys
import json
import time
import hashlib
import argparse
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
RESOURCES_DIR = PROJECT_ROOT / "resources"
R2_MANAGER = PROJECT_ROOT / "scripts" / "r2_manager.py"

# ============== 环境检测 ==============

def has_r2_config() -> bool:
    """检查 R2 环境变量是否已配置"""
    return all([
        os.environ.get("CF_ACCOUNT_ID"),
        os.environ.get("R2_ACCESS_KEY_ID"),
        os.environ.get("R2_ACCESS_KEY_SECRET"),
    ])


def has_minimax_api_key() -> bool:
    """检查 MiniMax API Key 是否已配置"""
    return bool(os.environ.get("MINIMAX_API_KEY"))


def ensure_r2_manager_available() -> bool:
    """确认 r2_manager.py 可用"""
    if not R2_MANAGER.exists():
        print("[WARN] r2_manager.py 未找到，跳过 R2 上传")
        return False
    try:
        result = subprocess.run(
            [sys.executable, str(R2_MANAGER), "--help"],
            capture_output=True, text=True, timeout=5,
        )
        return result.returncode == 0
    except Exception:
        print("[WARN] r2_manager.py 不可用，跳过 R2 上传")
        return False


# ============== 资源分析 ==============

def scan_resource_gaps() -> List[Dict[str, str]]:
    """扫描 resources/ 目录，找出空缺的资源位置"""
    gaps = []
    expected_structure = {
        "images/characters": [".webp", ".png"],
        "images/buildings": [".webp", ".png"],
        "images/items": [".webp", ".png"],
        "images/skills": [".webp", ".png", ".gif"],
        "images/ui": [".webp", ".png", ".svg"],
        "images/weather": [".webp", ".png"],
        "audio/bgm": [".mp3", ".ogg"],
        "audio/sfx": [".mp3", ".wav", ".ogg"],
        "audio/tts": [".mp3", ".wav"],
    }

    for subdir, exts in expected_structure.items():
        dir_path = RESOURCES_DIR / subdir
        dir_path.mkdir(parents=True, exist_ok=True)
        existing = list(dir_path.glob("*"))
        if len(existing) == 0:
            gaps.append({
                "category": subdir,
                "path": str(dir_path.relative_to(RESOURCES_DIR)),
                "status": "empty",
                "hint": f"需要生成 {', '.join(exts)} 文件",
            })
        else:
            gaps.append({
                "category": subdir,
                "path": str(dir_path.relative_to(RESOURCES_DIR)),
                "status": "exists",
                "count": len(existing),
            })

    return gaps


def load_plan_document() -> Optional[Dict[str, Any]]:
    """读取 PLAN_WuXiaAIWorld_v2.md，提取资源需求（简化版）"""
    plan_path = PROJECT_ROOT / "PLAN_WuXiaAIWorld_v2.md"
    if not plan_path.exists():
        return None

    with open(plan_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 简化解析：提取包含图片/音频需求的段落
    return {"exists": True, "size": len(content), "path": str(plan_path)}


# ============== MiniMax 资源生成 ==============

def generate_resource_prompt(category: str, filename: str) -> str:
    """根据类别和文件名生成 MiniMax API prompt 模板"""
    prompts = {
        "images/characters": f"武侠风格角色立绘，半身像，{filename}，中国古风，水墨画风，高质量",
        "images/buildings": f"武侠世界建筑场景图，{filename}，中国古风城镇/门派，水墨渲染",
        "images/items": f"武侠道具图标，{filename}，精致小图，简洁明了",
        "images/skills": f"武侠技能特效图，{filename}，动态感，水墨风格",
        "images/ui": f"武侠游戏UI素材，{filename}，古风边框/按钮",
        "images/weather": f"武侠场景天气效果，{filename}，雨/雪/雾/晴，氛围感",
        "audio/bgm": f"武侠风格背景音乐，{filename}，中国民族乐器",
        "audio/sfx": f"武侠游戏音效，{filename}",
        "audio/tts": f"武侠角色语音，{filename}",
    }
    return prompts.get(category, f"武侠风格资源：{filename}")


def call_minimax_api(prompt: str, output_path: str, category: str) -> bool:
    """
    调用 MiniMax API 生成资源

    注：实际 MiniMax API 调用需要根据具体 API 版本实现。
    此处提供框架，待填入实际的 API endpoint 和参数。
    """
    if not has_minimax_api_key():
        print("  [SKIP] MiniMax API Key 未配置")
        return False

    api_key = os.environ["MINIMAX_API_KEY"]
    is_image = category.startswith("images/")

    # 这里使用 subprocess 调用 curl，方便未来扩展
    # 实际应根据 MiniMax API 文档填写正确的 endpoint
    if is_image:
        # 示例：MiniMax 图片生成 API
        # payload = {
        #     "model": "image-01",
        #     "prompt": prompt,
        #     "n": 1,
        #     "size": "1024x1024",
        # }
        print(f"  [TODO] MiniMax 图片 API 待实现: {prompt}")
    else:
        # 示例：MiniMax 音频生成 API
        print(f"  [TODO] MiniMax 音频 API 待实现: {prompt}")

    return False


# ============== R2 上传集成 ==============

def upload_to_r2(local_path: str, r2_key: str) -> Optional[str]:
    """通过 r2_manager.py 上传文件到 R2，返回 CDN URL"""
    if not has_r2_config():
        print(f"  [SKIP] R2 未配置，跳过上传: {r2_key}")
        return None

    if not ensure_r2_manager_available():
        return None

    try:
        result = subprocess.run(
            [sys.executable, str(R2_MANAGER), "upload", local_path, r2_key],
            capture_output=True, text=True, timeout=60,
        )
        if result.returncode == 0:
            # 从输出中提取 CDN URL
            for line in result.stdout.splitlines():
                if "CDN URL:" in line:
                    return line.split("CDN URL:")[1].strip()
            return f"r2://uploaded/{r2_key}"
        else:
            print(f"  [WARN] R2 上传失败: {result.stderr.strip()}")
            return None
    except subprocess.TimeoutExpired:
        print(f"  [WARN] R2 上传超时: {r2_key}")
        return None
    except Exception as e:
        print(f"  [WARN] R2 上传异常: {e}")
        return None


def batch_upload_resources(dry_run: bool = False) -> Dict[str, Any]:
    """批量上传 resources/ 目录到 R2"""
    if not has_r2_config():
        print("[INFO] R2 环境变量未配置，跳过批量上传（优雅降级）")
        return {"uploaded": 0, "skipped": 0, "reason": "R2 not configured"}

    if not ensure_r2_manager_available():
        return {"uploaded": 0, "skipped": 0, "reason": "r2_manager unavailable"}

    cmd = [sys.executable, str(R2_MANAGER), "sync"]
    if dry_run:
        cmd.append("--dry-run")

    print(f"[R2] {'DRY-RUN' if dry_run else '正式'} 同步: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        print(result.stdout)
        if result.returncode != 0:
            print(f"[WARN] R2 sync 失败: {result.stderr}")
        return {"uploaded": 0, "exit_code": result.returncode}
    except Exception as e:
        print(f"[WARN] R2 sync 异常: {e}")
        return {"uploaded": 0, "error": str(e)}


# ============== Manifest 管理 ==============

def generate_manifest() -> Dict[str, Any]:
    """通过 r2_manager.py 生成 manifest"""
    manifest_path = RESOURCES_DIR / "manifest.json"

    if has_r2_config() and ensure_r2_manager_available():
        subprocess.run(
            [sys.executable, str(R2_MANAGER), "manifest"],
            capture_output=True, text=True, timeout=30,
        )

    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)

    return {
        "version": "1.0.0",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "base_url": os.environ.get("CDN_BASE_URL", ""),
        "resources": {"images": {}, "audio": {}},
        "note": "R2 未配置，此为骨架 manifest",
    }


# ============== 主流程 ==============

def run_resource_generation(dry_run: bool = False, upload_only: bool = False):
    """执行完整的资源生成流程"""
    start_time = time.time()

    print("\n" + "=" * 60)
    print("墨色江湖 - MiniMax 资源生成器")
    print("=" * 60)
    print(f"时间: {datetime.now(timezone.utc).isoformat()}")
    print(f"模式: {'DRY-RUN' if dry_run else '正式'}")
    print(f"R2 配置: {'已配置' if has_r2_config() else '未配置（优雅降级）'}")
    print(f"MiniMax API: {'已配置' if has_minimax_api_key() else '未配置'}")
    print("=" * 60 + "\n")

    # Step 1: 分析资源需求
    print("[1/4] 分析资源需求...")
    gaps = scan_resource_gaps()
    plan = load_plan_document()
    for gap in gaps:
        status_icon = "[OK]" if gap["status"] == "exists" else "[  ]"
        count_info = f" ({gap.get('count', 0)} 个文件)" if gap["status"] == "exists" else ""
        print(f"  {status_icon} {gap['category']}{count_info} - {gap.get('hint', '')}")
    if plan:
        print(f"  [OK] PLAN 文档: {plan['path']} ({plan['size']} 字节)")
    else:
        print("  [  ] PLAN 文档未找到")
    print()

    # Step 2: 仅上传模式
    if upload_only:
        print("[2/2] 仅上传模式 - 批量上传现有资源到 R2...")
        batch_upload_resources(dry_run=dry_run)
        print()
        return

    # Step 3: 生成资源
    print("[2/4] 生成资源（MiniMax API）...")
    empty_dirs = [g for g in gaps if g["status"] == "empty"]
    if not empty_dirs:
        print("  所有资源目录已有文件，跳过生成")
    else:
        for gap in empty_dirs:
            print(f"  需要生成: {gap['category']} ({gap['hint']})")
        print("  [INFO] MiniMax API 集成待完善，当前跳过实际生成步骤")
    print()

    # Step 4: 上传到 R2
    print("[3/4] 上传资源到 R2...")
    batch_upload_resources(dry_run=dry_run)
    print()

    # Step 5: 生成 manifest
    print("[4/4] 生成 manifest.json...")
    manifest = generate_manifest()
    manifest_path = RESOURCES_DIR / "manifest.json"
    if not manifest_path.exists():
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        print(f"  manifest.json 已创建: {manifest_path}")
    else:
        print(f"  manifest.json 已存在: {manifest_path}")
    print()

    elapsed = time.time() - start_time
    print("=" * 60)
    print(f"完成，耗时 {elapsed:.1f}s")
    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="MiniMax 资源生成器")
    parser.add_argument("--dry-run", action="store_true", help="模拟运行，不实际上传")
    parser.add_argument("--upload-only", action="store_true", help="仅上传已有资源，不生成新资源")
    args = parser.parse_args()

    run_resource_generation(dry_run=args.dry_run, upload_only=args.upload_only)


if __name__ == "__main__":
    main()
