#!/usr/bin/env python3
"""Test MiniMax API connectivity and endpoints"""
import os, json, urllib.request, urllib.error

# Load API key
for line in open("/home/ubuntu/project/MoRanJiangHu/.env.minimax"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        os.environ[k] = v

api_key = os.environ.get("MINIMAX_API_KEY")
print(f"API Key present: {bool(api_key)}")
print(f"API Key prefix: {api_key[:8] if api_key else 'None'}...")

BASE = "https://api.minimax.chat/v1"

# Test 1: Image generation - try different models/endpoints
print("\n=== Image Generation Tests ===")

# Try image-01 with /image_generation
payload = {
    "model": "image-01",
    "prompt": "深山古刹，雾气缭绕的古寺，水墨灵异·幽暗风格，高质量，游戏场景概念图",
    "n": 1,
    "size": "1024x1024",
}
data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    f"{BASE}/image_generation",
    data=data,
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    print(f"image_generation result: {json.dumps(result, ensure_ascii=False)[:300]}")
except urllib.error.HTTPError as e:
    print(f"image_generation HTTP {e.code}: {e.read().decode()[:200]}")
except Exception as e:
    print(f"image_generation error: {e}")

# Test 2: Try /v1/text_to_speech for BGM (MiniMax music generation may be different)
print("\n=== Audio/Music Generation Tests ===")

# MiniMax has a music generation endpoint - let's try it
# According to MiniMax docs: POST /v1/music_generation
music_payload = {
    "model": "music-01",
    "prompt": "Chinese folk instruments, guzheng, mystical and eerie atmosphere, supernatural tale, hauntingly beautiful",
}
data = json.dumps(music_payload).encode("utf-8")
req = urllib.request.Request(
    f"{BASE}/music_generation",
    data=data,
    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    print(f"music_generation result: {json.dumps(result, ensure_ascii=False)[:500]}")
except urllib.error.HTTPError as e:
    print(f"music_generation HTTP {e.code}: {e.read().decode()[:200]}")
except Exception as e:
    print(f"music_generation error: {e}")

# Test 3: Check what models are available - try a simple models list
print("\n=== Model Info ===")
req = urllib.request.Request(
    f"{BASE}/models",
    headers={"Authorization": f"Bearer {api_key}"},
    method="GET",
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    print(f"models result: {json.dumps(result, ensure_ascii=False)[:500]}")
except urllib.error.HTTPError as e:
    print(f"models HTTP {e.code}: {e.read().decode()[:200]}")
except Exception as e:
    print(f"models error: {e}")
