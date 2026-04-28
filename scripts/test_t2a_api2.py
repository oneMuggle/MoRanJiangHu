#!/usr/bin/env python3
"""Test MiniMax T2A v2 API"""
import os, json, urllib.request, urllib.error

for line in open("/home/ubuntu/project/MoRanJiangHu/.env.minimax"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        os.environ[k] = v

api_key = os.environ.get("MINIMAX_API_KEY")
BASE = "https://api.minimax.chat/v1"

print("=== T2A v2 Tests ===")

t2a_payloads = [
    ("speech-01 minimal", {
        "model": "speech-01",
        "text": "The ancient temple stands mist-shrouded, a monk strikes the great bronze bell.",
        "voice_setting": {"voice_id": "male-qn-qingse"},
        "audio_setting": {"format": "mp3", "sample_rate": 44100},
    }),
    ("speech-01-turbo", {
        "model": "speech-01-turbo",
        "text": "The ancient temple stands mist-shrouded, a monk strikes the great bronze bell.",
        "voice_setting": {"voice_id": "male-qn-qingse"},
        "audio_setting": {"format": "mp3", "sample_rate": 44100},
    }),
    ("speech-01-turbo no voice_id", {
        "model": "speech-01-turbo",
        "text": "The ancient temple stands mist-shrouded, a monk strikes the great bronze bell.",
        "audio_setting": {"format": "mp3", "sample_rate": 44100},
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
        audio_url = result.get("data", {}).get("audio_url", "")
        has_audio = bool(audio_url)
        print(f"{'✅' if has_audio else '❌'} {test_name}")
        print(f"   audio_url: {audio_url[:100] if audio_url else 'NONE'}")
        if not has_audio:
            print(f"   response: {json.dumps(result, ensure_ascii=False)[:200]}")
    except urllib.error.HTTPError as e:
        print(f"❌ {test_name}: HTTP {e.code}: {e.read().decode()[:200]}")
    except Exception as e:
        print(f"❌ {test_name}: error: {e}")
    print()
