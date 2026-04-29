#!/usr/bin/env python3
"""
墨染江湖视频生成脚本
使用 MiniMax MiniMax-Hailuo-2.3-Fast 图生视频 API
"""

import os
import sys
import json
import time
import base64
import urllib.request
import urllib.error
import subprocess
import urllib.parse
from pathlib import Path

# ========== 配置 ==========
CONFIG_FILE = Path("/home/ubuntu/.hermes/config.yaml")
API_KEY = None
for line in CONFIG_FILE.read_text().splitlines():
    line = line.strip()
    if "MINIMAX_API_KEY" in line:
        # 支持 YAML 格式 "KEY: value" 和 "KEY=value"
        if ":" in line:
            parts = line.split(":", 1)
        else:
            parts = line.split("=", 1)
        if len(parts) == 2:
            API_KEY = parts[1].strip().strip('"').strip("'")
        break

if not API_KEY:
    raise RuntimeError("API key not found")

BASE_URL = "https://api.minimaxi.com"
OUTPUT_DIR = Path("/home/ubuntu/project/MoRanJiangHu/data/era_assets")

# 4个有图片的代表性纪元
ERAS = [
    ("ancient_eastern_wuxia",
     "ancient Chinese wuxia swordsman in bamboo forest, clashing swords, cinematic, dramatic, misty atmosphere, martial arts"),
    ("modern_eastern_republic",
     "1930s Shanghai night, neon lights, rainy streets, jazz club, vintage glamour, cinematic, Art Deco"),
    ("near-future_cyberpunk",
     "cyberpunk city at night, neon lights, rainy streets, futuristic, holographic signs, cinematic, atmospheric"),
    ("far-future_space_opera",
     "space opera, massive starship in nebula, epic battle scene, laser weapons, grand cinematic scale, dramatic"),
]


def find_era_image(era_id):
    era_path = OUTPUT_DIR / era_id
    if era_path.exists():
        imgs = sorted(era_path.glob("*.jpg"))
        if imgs:
            return str(imgs[0])
    return None


def submit_video(image_b64: str, prompt: str) -> str:
    """提交图生视频任务，返回 task_id"""
    payload = {
        "model": "MiniMax-Hailuo-2.3-Fast",
        "prompt": prompt,
        "first_frame_image": image_b64,
        "duration": 6,
        "resolution": "768P",
    }
    data = json.dumps(payload)
    req = urllib.request.Request(
        f"{BASE_URL}/v1/video_generation",
        data=data.encode("utf-8"),
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    code = result.get("base_resp", {}).get("status_code", -1)
    if code != 0:
        raise RuntimeError(f"提交失败 [{code}]: {result.get('base_resp', {}).get('status_msg')}")
    return result["task_id"]


def query_video(task_id: str) -> dict:
    """查询视频任务状态"""
    req = urllib.request.Request(
        f"{BASE_URL}/v1/query/video_generation?task_id={task_id}",
        headers={"Authorization": f"Bearer {API_KEY}"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download_video(file_id: str, output_path: Path) -> bool:
    """下载视频文件（GET /v1/files/retrieve?file_id=xxx）"""
    req = urllib.request.Request(
        f"{BASE_URL}/v1/files/retrieve?file_id={file_id}",
        headers={"Authorization": f"Bearer {API_KEY}"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        video_url = result.get("file", {}).get("download_url", "")
        if not video_url:
            print(f"       [ERROR] 无 download_url: {result}")
            return False
        print(f"       下载链接获取成功，开始下载...")
        subprocess.run(["curl", "-s", "--max-time", "120", "-o", str(output_path), video_url], check=True)
        return True
    except Exception as e:
        print(f"       [ERROR] 下载失败: {e}")
        return False


def wait_video(task_id: str, output_path: Path, max_wait: int = 300) -> bool:
    """轮询直到视频生成完成"""
    start = time.time()
    interval = 8
    while time.time() - start < max_wait:
        result = query_video(task_id)
        status = result.get("status", "")
        elapsed = int(time.time() - start)
        print(f"       [{elapsed}s] status={status}")
        if status == "Success":
            file_id = result.get("file_id", "")
            if not file_id:
                print(f"       [ERROR] Success 但无 file_id")
                return False
            print(f"       file_id={file_id[:20]}...")
            ok = download_video(file_id, output_path)
            if ok:
                size = output_path.stat().st_size / 1024 / 1024
                print(f"       ✅ 已下载: {output_path.name} ({size:.1f}MB)")
                return True
            return False
        elif status == "Fail":
            print(f"       [ERROR] 任务失败: {result.get('base_resp', {}).get('status_msg')}")
            return False
        time.sleep(interval)
    print(f"       [ERROR] 等待超时（{max_wait}s）")
    return False


def main():
    print("=" * 60)
    print("墨染江湖视频生成 — MiniMax MiniMax-Hailuo-2.3-Fast")
    print("=" * 60)

    results = {}
    for era_id, prompt in ERAS:
        era_dir = OUTPUT_DIR / era_id
        output_path = era_dir / f"{era_id}_video.mp4"

        # 找图片
        img_path = find_era_image(era_id)
        if not img_path:
            print(f"\n❌ [{era_id}] 无图片，跳过")
            results[era_id] = "skip_no_image"
            continue

        # 跳过已存在的
        if output_path.exists():
            print(f"\n⏭️  [{era_id}] 已存在，跳过")
            results[era_id] = "exists"
            continue

        print(f"\n{'='*50}")
        print(f"📹 纪元: {era_id}")
        print(f"🎬 提示词: {prompt[:60]}...")
        print(f"📷 图片: {img_path}")

        # 读取图片转 base64
        with open(img_path, "rb") as f:
            img_data = f.read()
        img_b64 = base64.b64encode(img_data).decode("ascii")
        image_url = f"data:image/jpeg;base64,{img_b64}"

        print(f"📤 提交任务...")
        try:
            task_id = submit_video(image_url, prompt)
            print(f"   🆔 task_id: {task_id}")
        except Exception as e:
            print(f"   [ERROR] 提交失败: {e}")
            results[era_id] = f"submit_error: {e}"
            continue

        ok = wait_video(task_id, output_path)
        results[era_id] = "success" if ok else "failed"

    # 总结
    print("\n" + "=" * 60)
    print("生成结果:")
    for era_id, status in results.items():
        icon = "✅" if status == "success" else ("⏭️ " if status == "exists" else "❌")
        print(f"  {icon} {era_id}: {status}")


if __name__ == "__main__":
    main()
