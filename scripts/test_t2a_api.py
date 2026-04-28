#!/usr/bin/env python3
"""Test MiniMax T2A (text-to-audio) API for BGM substitute"""
import os, json, urllib.request, urllib.error

for line in open("/home/ubuntu/project/MoRanJiangHu/.env.minimax"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        os.environ[k] = v

api_key = os.environ.get("MINIMAX_API_KEY")
BASE = "https://api.minimax.chat/v1"

print("=== T2A (text-to-audio) Tests ===")

# T2A v2 endpoint
t2a_payloads = [
    ("T2A v2 speech-01", {
        "model": "speech-01",
        "text": "The ancient temple stands mist-shrouded, a monk strikes the great bronze bell. Chinese guzheng and dizi create a mystical atmosphere.",
        "voice_setting": {"voice_id": "male-qn-qingse"},
        "audio_setting": {"format": "mp3", "sample_rate": 44100, "bitrate": 128},
    }),
    ("T2A v2 speech-01-turbo", {
        "model": "speech-01-turbo",
        "text": "The ancient temple stands mist-shrouded, a monk strikes the great bronze bell. Chinese guzheng and dizi create a mystical atmosphere.",
        "voice_setting": {"voice_id": "male-qn-qingse"},
        "audio_setting": {"format": "mp3", "sample_rate": 44100, "bitrate": 128},
    }),
    ("T2A v2 with duration", {
        "model": "speech-01",
        "text": "The ancient temple stands mist-shrouded, a monk strikes the great bronze bell. Chinese guzheng and dizi create a mystical atmosphere. This is ambient background music.",
        "voice_setting": {"voice_id": "male-qn-qingse"},
        "audio_setting": {"format": "mp3", "sample_rate": 44100, "bitrate": 128, "duration": 60},
    }),
]

for test_name, payload in t2a_payloads:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/t2a_v2",
        data=data,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        has_audio = bool(result.get("data", {}).get("audio_url"))
        audio_url = result.get("data", {}).get("audio_url", "")[:100]
        print(f"✅ {test_name}: has_audio={has_audio}, url={audio_url}")
        print(f"   Full: {json.dumps(result, ensure_ascii=False)[:300]}")
    except urllib.error.HTTPError as e:
        print(f"❌ {test_name}: HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        print(f"❌ {test_name}: error: {e}")
    print()
