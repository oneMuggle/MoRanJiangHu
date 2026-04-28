#!/usr/bin/env python3
"""Test MiniMax music generation API"""
import os, json, urllib.request, urllib.error

for line in open("/home/ubuntu/project/MoRanJiangHu/.env.minimax"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        os.environ[k] = v

api_key = os.environ.get("MINIMAX_API_KEY")
BASE = "https://api.minimax.chat/v1"

# music-02 model - try different param structures
print("=== Music Generation (music-02) ===")

# Try with model and simple text
for test_name, payload in [
    ("music-02 minimal", {"model": "music-02", "text": "Chinese folk instruments, guzheng, mystical atmosphere"}),
    ("music-02 with audio_setting", {
        "model": "music-02",
        "text": "Chinese folk instruments, guzheng, mystical atmosphere",
        "audio_setting": {"format": "mp3", "sample_rate": 44100}
    }),
    ("music-02 with duration", {
        "model": "music-02",
        "prompt": "Chinese folk instruments, guzheng, mystical atmosphere",
        "duration": 30,
    }),
]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/music_generation",
        data=data,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        print(f"{test_name}: {json.dumps(result, ensure_ascii=False)[:400]}")
    except urllib.error.HTTPError as e:
        print(f"{test_name}: HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        print(f"{test_name}: error: {e}")
    print()
