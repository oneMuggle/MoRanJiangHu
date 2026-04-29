#!/usr/bin/env python3
"""
墨染江湖 BGM 生成脚本
使用 MiniMax music-2.6 API 生成各 Era 专属背景音乐
"""

import os
import sys
import json
import time
import base64
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional

API_KEY = "sk-cp-oggfO6wpQ3-J_qWRv3ZEGfwvJHocLlG0o0kMrrLTWzynJojCw0kZdchQMNPCSbj0R_u7_P6cciZskq9Zk4k9L74uEjQGyodTNIuyhTFvbLMp_wboEn-UKk8"
BASE_URL = "https://api.minimax.chat/v1"
MODEL = "music-2.6"
OUTPUT_DIR = Path("/home/ubuntu/project/MoRanJiangHu/data/era_assets")

TAG_TO_EN = {
    "民乐": "Chinese traditional instruments",
    "古风": "ancient Chinese style",
    "武侠": "wuxia martial arts",
    "古筝": "guzheng",
    "笛子": "bamboo flute dizi",
    "箫": "xiao flute",
    "灵异": "mystical supernatural",
    "编钟": "bianzhong ancient bells",
    "埙": "xun ocarina",
    "史诗": "epic cinematic",
    "古典": "classical",
    "管弦": "orchestral",
    "圣咏": "chant Gregorian",
    "里拉琴": "lyre",
    "地中海": "Mediterranean",
    "军乐": "military march",
    "骑士": "knightly medieval",
    "爵士": "jazz",
    "时代曲": "era period music",
    "上海滩": "Shanghai 1930s",
    "和乐": "Japanese style",
    "洋乐": "Western orchestral",
    "铜管": "brass instruments",
    "八音盒": "music box",
    "工业革命": "industrial revolution",
    "摇摆乐": "swing music",
    "禁酒令": "prohibition era speakeasy",
    "大乐队": "big band",
    "早期摇滚": "early rock and roll",
    "蓝调": "blues",
    "电子": "electronic synth",
    "流行": "pop contemporary",
    "城市生活": "urban city life",
    "民谣": "folk acoustic",
    "吉他": "acoustic guitar",
    "自然声": "nature sounds ambient",
    "低频": "low frequency deep bass",
    "低沉": "deep moody",
    "荒漠": "desolate wasteland",
    "摇滚": "rock",
    "低音萨克斯": "low saxophone",
    "冷硬": "cold hard",
    "暗夜": "nocturnal dark",
    "迷幻摇滚": "psychedelic rock",
    "风琴": "organ",
    "自由": "freedom liberty",
    "反文化": "counterculture 1960s",
    "末日": "apocalyptic doom",
    "生存": "survival tense",
    "紧张": "tense suspenseful",
    "低沉鼓点": "deep drums percussion",
    "尖叫": "screams horror",
    "恐怖": "horror eerie",
    "风笛": "bagpipes",
    "风雪": "snowstorm blizzard",
    "孤寂": "isolation solitude",
    "电子警报": "electronic alarm siren",
    "危机": "crisis danger",
    "盖革计数器声": "Geiger counter clicks",
    "荒凉": "barren desolate",
    "辐射": "radiation toxic",
    "合成器": "synthesizer",
    "赛博": "cyberpunk",
    "霓虹": "neon",
    "压抑": "oppressive grim",
    "氛围": "atmospheric ambient",
    "太空": "space cosmic",
    "悬疑": "suspense mystery",
    "星际": "interstellar",
    "壮阔": "grand magnificent",
    "赛博格": "cyborg transhuman",
    "空灵": "ethereal otherworldly",
    "数字": "digital futuristic",
}

def tags_to_english(tags):
    parts = []
    for tag in tags:
        parts.append(TAG_TO_EN.get(tag, tag))
    return ", ".join(parts)


ERAS = [
    ("ancient", ["民乐", "古风", "武侠"]),
    ("ancient_eastern_wuxia", ["民乐", "古筝", "笛子", "武侠"]),
    ("ancient_eastern_zhiguai", ["民乐", "古筝", "箫", "灵异"]),
    ("ancient_eastern_myth", ["民乐", "编钟", "埙", "史诗"]),
    ("ancient_western", ["古典", "管弦", "圣咏"]),
    ("ancient_western_greek", ["古典", "里拉琴", "管弦", "地中海"]),
    ("ancient_western_roman", ["古典", "管弦", "军乐", "史诗"]),
    ("ancient_western_medieval", ["古典", "圣咏", "鲁特琴", "骑士"]),
    ("modern", ["爵士", "民乐", "时代曲"]),
    ("modern_eastern_republic", ["爵士", "时代曲", "上海滩"]),
    ("modern_eastern_meiji_taisho", ["和乐", "军乐", "洋乐", "时代曲"]),
    ("modern_western", ["古典", "爵士", "铜管"]),
    ("modern_western_victorian", ["古典", "管弦", "八音盒", "工业革命"]),
    ("modern_western_jazz_age", ["爵士", "摇摆乐", "铜管", "禁酒令"]),
    ("modern_western_postwar", ["爵士", "大乐队", "早期摇滚", "蓝调"]),
    ("contemporary", ["电子", "流行", "城市生活"]),
    ("contemporary_urban", ["电子", "流行", "城市生活"]),
    ("contemporary_rural", ["民谣", "吉他", "自然声"]),
    ("contemporary_post_apocalyptic", ["环境", "低频", "低沉", "荒漠"]),
    ("contemporary_western", ["摇滚", "流行", "电子"]),
    ("contemporary_noir", ["爵士", "低音萨克斯", "冷硬", "暗夜"]),
    ("contemporary_hippie", ["迷幻摇滚", "风琴", "自由", "反文化"]),
    ("contemporary_apocalypse", ["末日", "生存", "紧张", "低频"]),
    ("contemporary_zombie", ["低沉鼓点", "尖叫", "恐怖", "紧张"]),
    ("contemporary_extreme_cold", ["风笛", "低频环境音", "风雪", "孤寂"]),
    ("contemporary_biohazard", ["电子警报", "环境低频", "紧张", "危机"]),
    ("contemporary_nuclear_winter", ["盖革计数器声", "环境低频", "荒凉", "辐射"]),
    ("near-future", ["电子", "合成器", "赛博", "霓虹"]),
    ("near-future_dystopia", ["电子", "低沉", "压抑", "氛围"]),
    ("near-future_space_colonization", ["电子", "管弦", "太空", "悬疑"]),
    ("far-future", ["管弦", "史诗", "星际", "壮阔"]),
    ("far-future_cyborg", ["电子", "氛围", "赛博格", "空灵"]),
    ("far-future_virtual_reality", ["电子", "环境", "数字", "空灵"]),
]

GENERIC_BGMS = [
    ("bgm_marketplace", "ancient Chinese marketplace, bustling market, merchants, street atmosphere, loopable, cinematic"),
    ("bgm_palace", "ancient Chinese palace, grand hall, ceremonial, imperial majesty, orchestral, epic"),
    ("bgm_temple", "ancient Chinese temple, Buddhist, incense, peaceful, contemplative, guqin, ambient"),
    ("bgm_tavern", "wuxia tavern, Jianghu inn, drinking, swordsmen, lively yet mysterious, Chinese folk"),
    ("bgm_forest", "mystical bamboo forest, martial arts, serene, Chinese nature, guzheng, peaceful"),
    ("bgm_battle", "epic battle, martial arts combat, heroic, intense, Chinese orchestral, percussion, drums"),
]

STYLES = {
    "ancient": "ancient Chinese style, traditional Chinese instruments, atmospheric, loopable",
    "ancient_eastern_wuxia": "wuxia martial arts world, guzheng, bamboo flute, heroic, mysterious, loopable",
    "ancient_eastern_zhiguai": "supernatural ancient China, mystical, xiao flute, eerie, haunting, loopable",
    "ancient_eastern_myth": "Chinese mythology, bianzhong bells, epic, divine, majestic, cinematic",
    "ancient_western": "ancient western classical, orchestral, Gregorian chant, sacred, elegant",
    "ancient_western_greek": "ancient Greek, lyre, Mediterranean, sunny, classical, peaceful",
    "ancient_western_roman": "ancient Roman empire, military, orchestral, march, epic, grandeur",
    "ancient_western_medieval": "medieval European, lute, Gregorian chant, knights, atmospheric",
    "modern": "1930s-1940s East Asia, jazz, period drama, nostalgic, cinematic",
    "modern_eastern_republic": "1920s Shanghai, jazz, neon, speakeasy, glamorous, nostalgic",
    "modern_eastern_meiji_taisho": "Meiji Taisho Japan, military march, Western influence, era period",
    "modern_western": "early 20th century Western, jazz, brass, period orchestral, nostalgic",
    "modern_western_victorian": "Victorian era, music box, steampunk, industrial, elegant, nostalgic",
    "modern_western_jazz_age": "1920s jazz age, big band, swing, prohibition speakeasy, energetic",
    "modern_western_postwar": "1940s-50s postwar, big band, early rock, blues, optimistic yet tense",
    "contemporary": "modern urban, electronic pop, city life, energetic, contemporary",
    "contemporary_urban": "modern city, electronic, urban lifestyle, vibrant, fast-paced",
    "contemporary_rural": "peaceful countryside, acoustic guitar, folk, nature, serene, relaxing",
    "contemporary_post_apocalyptic": "post-apocalyptic, desolate wasteland, low rumble, tension, survival",
    "contemporary_western": "modern Western, rock pop, electronic, contemporary, energetic",
    "contemporary_noir": "film noir, saxophone, smoky jazz, dark, nocturnal, suspenseful",
    "contemporary_hippie": "1960s counterculture, psychedelic rock, organ, freedom, hazy atmosphere",
    "contemporary_apocalypse": "apocalyptic world, doom, tension, low frequency, survival mode",
    "contemporary_zombie": "zombie horror, deep drums, screams, terror, tense, unsettling",
    "contemporary_extreme_cold": "extreme cold arctic, bagpipes, blizzard, isolation, desolate, haunting",
    "contemporary_biohazard": "biohazard outbreak, alarm siren, tension, crisis, electronic, dangerous",
    "contemporary_nuclear_winter": "nuclear winter, Geiger counter, radiation, barren, grim, desolate",
    "near-future": "near future cyberpunk, synth, neon, electronic, urban, edgy, atmospheric",
    "near-future_dystopia": "dystopian future, oppressive, electronic, synth, grim, tension, ambient",
    "near-future_space_colonization": "space colonization, electronic orchestral, cosmic, hopeful yet tense",
    "far-future": "far future space opera, epic orchestral, interstellar, grand, magnificent",
    "far-future_cyborg": "cyborg transhuman world, electronic, ethereal, atmospheric, futuristic",
    "far-future_virtual_reality": "virtual reality digital world, ethereal electronic, synthesized, otherworldly",
}

def generate_music(prompt: str, output_path: Path) -> bool:
    """调用 MiniMax music-2.6 API 生成音乐（需要 lyrics 参数，返回 base64 音频）"""
    # 简单的器乐歌词占位
    lyrics = "la la la la la la la la, na na na na na na na na"
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "lyrics": lyrics,
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/music_generation",
        data=data,
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        print(f"       原始响应: {str(result)[:200]}")

        # music-2.6 返回 base64 编码的音频在 data.audio
        audio_b64 = None
        if result.get("data") and result["data"].get("audio"):
            audio_b64 = result["data"]["audio"]

        if not audio_b64:
            print(f"       [ERROR] 未找到 audio 字段: {list(result.get('data', {}).keys())}")
            return False

        # 解码 base64 并保存（music-2.6 返回 URL-safe base64，使用 -/_ 而非 +/）
        try:
            music_data = base64.b64decode(audio_b64)
        except Exception:
            # 尝试 URL-safe 解码
            audio_fixed = audio_b64.replace('-', '+').replace('_', '/')
            music_data = base64.b64decode(audio_fixed)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(music_data)

        size = len(music_data) / 1024 / 1024
        print(f"       ✅ 已保存: {output_path.name} ({size:.1f}MB)")
        return True

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        print(f"       [HTTP {e.code}] {error_body[:300]}")
        return False
    except Exception as e:
        print(f"       [ERROR] {type(e).__name__}: {e}")
        return False


def main():
    print("=" * 60)
    print("墨染江湖 BGM 生成 — MiniMax music-2.6")
    print("=" * 60)

    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("[DRY RUN] 仅演示，不实际调用 API\n")

    # Era BGM
    print(f"\n{'[DRY RUN] ' if dry_run else ''}生成 Era BGM ({len(ERAS)} 首)...\n")
    success_era = 0
    failed_era = []

    for i, (era_id, tags) in enumerate(ERAS, 1):
        style = STYLES.get(era_id, "")
        en_prompt = tags_to_english(tags)
        prompt = f"{style}, {en_prompt}. Cinematic, atmospheric, loopable, high quality background music."

        era_dir = OUTPUT_DIR / era_id
        output_path = era_dir / "bgm.mp3"

        if dry_run:
            print(f"  {i:2d}. [{era_id}] → {output_path.name}")
            print(f"       提示词: {prompt[:80]}...")
            continue

        print(f"  {i:2d}. [{era_id}]")
        print(f"       提示词: {prompt[:80]}...")

        ok = generate_music(prompt, output_path)
        if ok:
            success_era += 1
        else:
            failed_era.append(era_id)
        time.sleep(1)  # 避免过快

    # 通用 BGM
    print(f"\n{'[DRY RUN] ' if dry_run else ''}生成通用 BGM ({len(GENERIC_BGMS)} 首)...\n")
    success_generic = 0
    failed_generic = []

    for i, (name, prompt) in enumerate(GENERIC_BGMS, 1):
        output_path = OUTPUT_DIR.parent / "resources" / "audio" / "bgm" / f"{name}.mp3"

        if dry_run:
            print(f"  {i}. {name} → {output_path.name}")
            print(f"       提示词: {prompt[:80]}...")
            continue

        print(f"  {i}. [{name}]")
        print(f"       提示词: {prompt[:80]}...")

        ok = generate_music(prompt, output_path)
        if ok:
            success_generic += 1
        else:
            failed_generic.append(name)
        time.sleep(1)

    # 总结
    if dry_run:
        return

    total = success_era + success_generic
    print("\n" + "=" * 60)
    print(f"完成: {total}/{len(ERAS) + len(GENERIC_BGMS)} 首")
    print(f"  Era BGM: {success_era}/{len(ERAS)}")
    print(f"  通用 BGM: {success_generic}/{len(GENERIC_BGMS)}")
    if failed_era:
        print(f"  失败 Era: {', '.join(failed_era)}")
    if failed_generic:
        print(f"  失败通用: {', '.join(failed_generic)}")


if __name__ == "__main__":
    main()
