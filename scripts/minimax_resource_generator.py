#!/usr/bin/env python3
"""
MiniMax 资源生成器 - 配合 Cloudflare R2 CDN 使用

定时任务流程（每天 22:00）：
1. 分析资源需求（检查 data/era_assets/ 目录和 eraTheme.ts）
2. 生成资源（MiniMax API 生成图片/音频）
3. 上传到 R2（通过 r2_manager.py 集成）
4. 更新 manifest.json

Usage:
    python3 scripts/minimax_resource_generator.py            # 完整流程
    python3 scripts/minimax_resource_generator.py --dry-run  # 模拟运行
    python3 scripts/minimax_resource_generator.py --upload-only  # 仅上传已有资源
    python3 scripts/minimax_resource_generator.py --era ancient_eastern_zhiguai  # 指定纪元
    python3 scripts/minimax_resource_generator.py --list-pending  # 列出待生成资源
"""

import os
import sys
import json
import time
import hashlib
import argparse
import subprocess
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
ERA_ASSETS_DIR = PROJECT_ROOT / "data" / "era_assets"
ERA_THEME_TS = PROJECT_ROOT / "models" / "eraTheme.ts"
R2_MANAGER = PROJECT_ROOT / "scripts" / "r2_manager.py"

# MiniMax API 配置
MINIMAX_API_URL = "https://api.minimax.chat/v1"
MINIMAX_IMAGE_MODEL = "image-01"
MINIMAX_AUDIO_MODEL = "speech-01"

# ============== 环境检测 ==============

def _load_env_file():
    """从 .env.minimax 加载 API Key（供 cron 环境使用）"""
    env_file = PROJECT_ROOT / ".env.minimax"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                if k == "MINIMAX_API_KEY" and not os.environ.get("MINIMAX_API_KEY"):
                    os.environ[k] = v

_load_env_file()

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


# ============== Era Theme 解析 ==============

def parse_era_theme_bgm_tags(era_id: str) -> List[str]:
    """从 eraTheme.ts 解析指定 SubEra 的 bgmTags"""
    if not ERA_THEME_TS.exists():
        return []
    
    with open(ERA_THEME_TS, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 查找 makeNode('era_id', ...) 的完整定义（跨多行）
    # 匹配从 makeNode(... 到下一个 ), 组合（SubEra 节点结束）
    pattern = rf"makeNode\s*\(\s*'{era_id}'\s*,[^;]*?bgmTags:\s*\[([^\]]+)\]"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return []
    
    bgm_str = match.group(1)
    tags = re.findall(r"'([^']+)'", bgm_str)
    # 过滤掉明显的 uiCopy 内容
    ui_copy_keywords = ['标题', '按钮', '标签', '面板', '存档', '页面', '系统', '菜单', '提示', '说明', '文字', 'tab']
    tags = [t for t in tags if not any(kw in t for kw in ui_copy_keywords)]
    return tags[:6]  # 限制最多6个标签


def parse_era_theme_art_style(era_id: str) -> str:
    """从 eraTheme.ts 解析指定 SubEra 的 artStyle"""
    if not ERA_THEME_TS.exists():
        return ""
    
    with open(ERA_THEME_TS, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 查找 makeNode('era_id', ...) 的完整定义，提取 artStyle
    pattern = rf"makeNode\s*\(\s*'{era_id}'\s*,[^;]*?artStyle:\s*'([^']+)'"
    match = re.search(pattern, content, re.DOTALL)
    return match.group(1) if match else ""


# ============== Manifest 管理 ==============

def load_all_manifests() -> Dict[str, Dict[str, Any]]:
    """加载所有 era_assets 子目录的 manifest.json"""
    manifests = {}
    if not ERA_ASSETS_DIR.exists():
        return manifests
    
    for era_dir in ERA_ASSETS_DIR.iterdir():
        if era_dir.is_dir():
            manifest_path = era_dir / "manifest.json"
            if manifest_path.exists():
                try:
                    with open(manifest_path, "r", encoding="utf-8") as f:
                        manifests[era_dir.name] = json.load(f)
                except json.JSONDecodeError:
                    print(f"[WARN] {manifest_path} 解析失败")
    return manifests


def get_pending_suberas() -> List[Dict[str, Any]]:
    """获取所有待生成的 SubEra（status=pending）"""
    manifests = load_all_manifests()
    pending = []
    
    for era_id, manifest in manifests.items():
        if manifest.get("status") == "pending":
            era_dir = ERA_ASSETS_DIR / era_id
            existing_images = []
            if era_dir.exists():
                existing_images = [f.name for f in era_dir.iterdir() 
                                   if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
            
            bgm_tags = parse_era_theme_bgm_tags(era_id)
            art_style = parse_era_theme_art_style(era_id)
            
            pending.append({
                "id": era_id,
                "images": manifest.get("images", []),
                "bgm": manifest.get("bgm", ""),
                "bgmTags": bgm_tags,
                "artStyle": art_style,
                "existingImages": existing_images,
                "missingCount": len([img for img in manifest.get("images", []) 
                                     if not any(img in ex for ex in existing_images)]),
            })
    
    return pending


def list_era_assets() -> None:
    """列出所有 era_assets 及其状态"""
    manifests = load_all_manifests()
    complete, pending = [], []
    
    for era_id, manifest in manifests.items():
        if manifest.get("status") == "complete":
            complete.append(era_id)
        else:
            pending.append(era_id)
    
    print(f"\n完整素材包 ({len(complete)}):")
    for e in sorted(complete):
        print(f"  ✅ {e}")
    
    print(f"\n待生成素材包 ({len(pending)}):")
    for e in sorted(pending):
        print(f"  ⏳ {e}")
    print()


# ============== MiniMax API 调用 ==============

def call_minimax_api(prompt: str, output_path: str, category: str, 
                      width: int = 1024, height: int = 1024) -> bool:
    """
    调用 MiniMax API 生成资源
    
    Args:
        prompt: 生成提示词
        output_path: 输出文件路径
        category: 资源类别 (images/*, audio/*)
        width/height: 图片尺寸
    
    Returns:
        是否成功
    """
    api_key = os.environ.get("MINIMAX_API_KEY")
    if not api_key:
        print(f"  [SKIP] MINIMAX_API_KEY 未配置")
        return False
    
    is_image = category.startswith("images/")
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    if is_image:
        return _call_minimax_image_api(api_key, prompt, output_path, width, height)
    else:
        return _call_minimax_audio_api(api_key, prompt, output_path)


def _call_minimax_image_api(api_key: str, prompt: str, output_path: Path,
                            width: int, height: int) -> bool:
    """调用 MiniMax 图片生成 API"""
    import urllib.request
    import urllib.error
    
    # 根据尺寸字符串选择模型
    size_str = f"{width}x{height}"
    
    payload = {
        "model": MINIMAX_IMAGE_MODEL,
        "prompt": prompt,
        "n": 1,
        "size": size_str,
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{MINIMAX_API_URL}/image_generation",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        # 图片 URL 在 data[0].image_urls[0]（image-01 返回结构）
        img_url = None
        if result.get("data"):
            d = result["data"]
            if isinstance(d, list) and d:
                # 新结构: data[0].image_urls[]
                if d[0].get("image_urls"):
                    img_url = d[0]["image_urls"][0]
                elif d[0].get("url"):
                    img_url = d[0]["url"]
            elif isinstance(d, dict) and d.get("image_urls"):
                img_url = d["image_urls"][0]
            elif isinstance(d, dict) and d.get("url"):
                img_url = d["url"]

        if img_url:
            img_req = urllib.request.Request(img_url)
            with urllib.request.urlopen(img_req, timeout=60) as img_resp:
                img_data = img_resp.read()
            
            with open(output_path, "wb") as f:
                f.write(img_data)
            
            print(f"  ✅ 图片已保存: {output_path.name}")
            return True
        else:
            print(f"  [ERROR] API 返回无图片数据: {result}")
            return False
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        print(f"  [HTTP ERROR] {e.code}: {error_body[:200]}")
        return False
    except Exception as e:
        print(f"  [ERROR] 图片生成失败: {e}")
        return False


def _call_minimax_audio_api(api_key: str, prompt: str, output_path: Path) -> bool:
    """调用 MiniMax 语音生成 API (BGM)"""
    import urllib.request
    import urllib.error
    
    # 构建 BGM 生成提示词
    bgm_prompt = f"Generate ambient background music. {prompt}. Cinematic, atmospheric, loopable."
    
    payload = {
        "model": MINIMAX_AUDIO_MODEL,
        "text": bgm_prompt,
        "voice_setting": {
            "voice_id": "male-qn-qingse",  # 轻柔男声，适合背景音乐描述
        },
        "audio_setting": {
            "sample_rate": 44100,
            "bitrate": 128,
            "format": "mp3",
        },
    }
    
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{MINIMAX_API_URL}/text_to_speech",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            result = json.loads(resp.read().decode("utf-8"))
        
        if result.get("data") and result["data"].get("audio_file"):
            # 下载音频
            audio_url = result["data"]["audio_file"]
            audio_req = urllib.request.Request(audio_url)
            with urllib.request.urlopen(audio_req, timeout=120) as audio_resp:
                audio_data = audio_resp.read()
            
            with open(output_path, "wb") as f:
                f.write(audio_data)
            
            print(f"  ✅ BGM 已保存: {output_path.name}")
            return True
        else:
            print(f"  [ERROR] API 返回无音频数据: {result}")
            return False
            
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        print(f"  [HTTP ERROR] {e.code}: {error_body[:200]}")
        return False
    except Exception as e:
        print(f"  [ERROR] BGM 生成失败: {e}")
        return False


# ============== 资源生成提示词构建 ==============

# SubEra 场景描述映射（用于生成具体场景图）
SUBERA_SCENE_TEMPLATES = {
    "ancient_eastern_zhiguai": [
        "深山古刹，雾气缭绕的古寺",
        "狐妖洞穴，幽暗神秘的洞窟",
        "冥界幽都，阴森恐怖的冥界",
        "道观炼丹，道士在炼制丹药",
        "花妖花园，妖艳花朵盛开",
        "荒村鬼谈，废弃村庄的鬼魂",
    ],
    "ancient_eastern_myth": [
        "天庭宫殿，金碧辉煌的天宫",
        "昆仑仙境，云雾缭绕的仙山",
        "封神战场，古战场遗迹",
        "东海龙宫，海底水晶宫殿",
        "瑶池盛会，仙女的盛宴",
        "妖界裂缝，妖异的空间裂缝",
    ],
    "ancient_western_greek": [
        "奥林匹斯山，巍峨的神山",
        "雅典卫城，古典建筑遗迹",
        "斯巴达军营，严肃的军事营地",
        "奥林匹克赛场，古代竞技场",
        "德尔斐神庙，神谕的殿堂",
        "爱琴海港口，地中海港口",
    ],
    "ancient_western_roman": [
        "罗马斗兽场，巨大的圆形竞技场",
        "元老院，古罗马政治中心",
        "罗马浴场，宏伟的公共浴池",
        "军团营地，罗马军团驻扎地",
        "庞贝古城，被火山掩埋的城市",
        "地中海商港，繁忙的贸易港口",
    ],
    "ancient_western_medieval": [
        "哥特式城堡，阴森的城堡建筑",
        "骑士比武场，精彩的骑士竞技",
        "修道院，宁静的宗教场所",
        "集市广场，热闹的贸易市场",
        "森林猎人小屋，偏远的猎人住所",
        "封建领主庄园，贵族的领地",
    ],
    "modern_eastern_meiji_taisho": [
        "明治银座，西化的日本商业街",
        "大正茶室，传统茶道场所",
        "西洋建筑群，西式建筑群",
        "神社祭典，日本传统节日",
        "居酒屋，传统日本酒馆",
        "军校操场，军事训练场地",
    ],
    "modern_western_victorian": [
        "伦敦塔桥，标志性的吊桥",
        "工业烟囱，蒸汽时代的工厂",
        "绅士俱乐部，上流社会场所",
        "维多利亚市场，繁华的市场",
        "乡间庄园，优雅的乡村别墅",
        "蒸汽火车，蒸汽动力火车",
    ],
    "modern_western_jazz_age": [
        "爵士酒吧，1920年代风格酒吧",
        "Art Deco建筑，装饰艺术风格建筑",
        "地下酒吧，禁酒令时期的秘密酒吧",
        "黑帮俱乐部，犯罪组织聚集地",
        "好莱坞片场，电影制作现场",
        "海岸度假村，海滨度假胜地",
    ],
    "modern_western_postwar": [
        "废墟城市，战后废墟的城市",
        "难民营地，战后难民营",
        "黑市交易，非法贸易场所",
        "战后工厂，重新运转的工厂",
        "盟军指挥部，联军军事基地",
        "铁路站台，蒸汽火车站在线",
    ],
    "contemporary_rural": [
        "稻田农舍，的传统农舍",
        "乡村小学，简朴的教育场所",
        "集市庙会，热闹的乡村集市",
        "山水梯田，层层叠叠的梯田",
        "河边洗衣，传统洗衣方式",
        "丰收打谷场，收获季节场景",
    ],
    "contemporary_post_apocalyptic": [
        "废墟都市，末日后的城市废墟",
        "辐射荒原，充满辐射的荒野",
        "幸存者营地，幸存者聚居地",
        "变异生物巢穴，变异生物栖息地",
        "物资掠夺点，搜寻物资的地方",
        "旧世界遗迹，战前的建筑遗迹",
    ],
    "near-future_dystopia": [
        "监控广场，全天候监控的广场",
        "极权总部，政府权力中心",
        "居民区，统一规划的居民楼",
        "洗脑宣传墙，政治宣传墙",
        "地下抵抗组织，反抗军基地",
        "配给中心，物资分配中心",
    ],
    "near-future_space_colonization": [
        "月球基地，月球上的永久基地",
        "火星殖民地，火星人类定居点",
        "小行星采矿站，资源开采设施",
        "星际飞船，巨大的宇宙飞船",
        "零重力实验室，科学研究设施",
        "深空信号站，通讯中继站",
    ],
    "far-future_cyborg": [
        "义体改造医院，机械改造手术",
        "意识上传中心，数字意识上传",
        "机械躯体工厂，机器人制造",
        "人机融合社区，半机械人聚居地",
        "神经接口市场，义体交易市场",
        "记忆银行，记忆存储设施",
    ],
    "far-future_virtual_reality": [
        "虚拟城市，由代码构成的城市",
        "数字意识海，数字化的意识空间",
        "代码构成的世界，完全虚拟的世界",
        "虚拟身份交易所，数字身份交易",
        "数据神殿，核心数据存储",
        "意识脱离装置，连接虚拟世界的设备",
    ],
}

# BGM 提示词模板
BGM_PROMPT_TEMPLATES = {
    "ancient_eastern_zhiguai": "Chinese folk instruments, guzheng, dizi, mystical and eerie atmosphere, supernatural tale, hauntingly beautiful",
    "ancient_eastern_myth": "Chinese classical music, bianzhong, chinoiserie, epic and mythical, divine and majestic",
    "ancient_western_greek": "Ancient Greek lyre, aulos, classical Greek instruments, epic mythology atmosphere",
    "ancient_western_roman": "Roman orchestral, brass, military march, epic and powerful, ancient Rome grandeur",
    "ancient_western_medieval": "Medieval Gregorian chant, lute, medieval folk, dark ages atmosphere",
    "modern_eastern_meiji_taisho": "JapaneseTaisho era, shamisen, piano, nostalgic and elegant, Meiji Western-Japanese fusion",
    "modern_western_victorian": "Victorian era orchestral, music box, industrial revolution, steampunk elements",
    "modern_western_jazz_age": "1920s jazz, swing, brass, prohibition era speakeasy, Art Deco glamour",
    "modern_western_postwar": "1940s big band jazz, early rock and roll, blues, post-war recovery mood",
    "contemporary_rural": "Folk music, acoustic guitar, nature sounds, peaceful countryside atmosphere",
    "contemporary_post_apocalyptic": "Dark ambient, low frequency drones, desolate, post-apocalyptic tension",
    "near-future_dystopia": "Electronic ambient,压抑 atmosphere, dystopian, oppressive electronic soundscape",
    "near-future_space_colonization": "Sci-fi orchestral, space exploration, hopeful yet tense, cosmic wonder",
    "far-future_cyborg": "Electronic synthesis, cyberpunk, neural interface, futuristic and transhumanist",
    "far-future_virtual_reality": "Digital ambient, synthesized pads, virtual world, ethereal and otherworldly",
}


def build_image_prompt(era_id: str, scene_index: int, art_style: str) -> str:
    """构建图片生成提示词"""
    scenes = SUBERA_SCENE_TEMPLATES.get(era_id, [])
    scene_desc = scenes[scene_index] if scene_index < len(scenes) else f"场景 {scene_index + 1}"
    
    prompt = f"{scene_desc}，{art_style}风格，高质量，游戏场景概念图，中国/东方美学" if "eastern" in era_id else f"{scene_desc}，{art_style}风格，高质量，游戏场景概念图，西方古典美学"
    return prompt


def build_bgm_prompt(era_id: str, bgm_tags: List[str]) -> str:
    """构建 BGM 生成提示词"""
    template = BGM_PROMPT_TEMPLATES.get(era_id, "ambient background music, atmospheric, cinematic")
    tags_str = ", ".join(bgm_tags) if bgm_tags else ""
    return f"{template}, tags: {tags_str}" if tags_str else template


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


def batch_upload_resources(dry_run: bool = False, era_id: Optional[str] = None) -> Dict[str, Any]:
    """批量上传 era_assets 目录到 R2"""
    if not has_r2_config():
        print("[INFO] R2 环境变量未配置，跳过批量上传（优雅降级）")
        return {"uploaded": 0, "skipped": 0, "reason": "R2 not configured"}

    if not ensure_r2_manager_available():
        return {"uploaded": 0, "skipped": 0, "reason": "r2_manager unavailable"}

    # 上传指定 era 或全部
    upload_dirs = []
    if era_id:
        era_path = ERA_ASSETS_DIR / era_id
        if era_path.exists():
            upload_dirs.append(era_path)
    else:
        upload_dirs = [d for d in ERA_ASSETS_DIR.iterdir() if d.is_dir()]

    uploaded_count = 0
    for era_dir in upload_dirs:
        cmd = [sys.executable, str(R2_MANAGER), "sync", str(era_dir)]
        if dry_run:
            cmd.append("--dry-run")

        print(f"[R2] {'DRY-RUN' if dry_run else '同步'}: {era_dir.name}")
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            if result.returncode == 0:
                uploaded_count += 1
            else:
                print(f"  [WARN] R2 sync 失败: {result.stderr[:100]}")
        except Exception as e:
            print(f"  [WARN] R2 sync 异常: {e}")

    return {"uploaded": uploaded_count, "total": len(upload_dirs)}


# ============== Manifest 更新 ==============

def update_manifest_status(era_id: str, status: str) -> bool:
    """更新指定 era 的 manifest.json status"""
    manifest_path = ERA_ASSETS_DIR / era_id / "manifest.json"
    if not manifest_path.exists():
        return False
    
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        
        manifest["status"] = status
        manifest["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        
        return True
    except Exception as e:
        print(f"  [WARN] 更新 manifest 失败: {e}")
        return False


# ============== 主流程 ==============

def generate_era_assets(era_id: str, dry_run: bool = False, upload: bool = True) -> Dict[str, Any]:
    """为指定 SubEra 生成所有资源"""
    results = {
        "era_id": era_id,
        "images_generated": 0,
        "images_skipped": 0,
        "bgm_generated": False,
        "uploaded": False,
        "errors": [],
    }
    
    era_dir = ERA_ASSETS_DIR / era_id
    if not era_dir.exists():
        era_dir.mkdir(parents=True, exist_ok=True)
    
    # 加载 manifest
    manifest_path = era_dir / "manifest.json"
    manifest = {"id": era_id, "status": "pending", "images": [], "bgm": ""}
    if manifest_path.exists():
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    
    # 获取 bgmTags 和 artStyle
    bgm_tags = parse_era_theme_bgm_tags(era_id)
    art_style = parse_era_theme_art_style(era_id)
    
    if not art_style:
        art_style = "高质量游戏美术风格"
    
    print(f"\n{'='*60}")
    print(f"生成素材: {era_id}")
    print(f"  bgmTags: {bgm_tags}")
    print(f"  artStyle: {art_style}")
    print(f"{'='*60}")
    
    # 检查现有图片
    existing_images = {f.stem: f for f in era_dir.iterdir() 
                        if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']}
    
    # 生成缺失的图片
    manifest_images = manifest.get("images", [])
    for i, img_name in enumerate(manifest_images):
        img_path = era_dir / img_name
        
        # 检查是否已存在
        if img_path.exists() and img_path.stat().st_size > 1000:
            print(f"  [SKIP] 图片已存在: {img_name}")
            results["images_skipped"] += 1
            continue
        
        if dry_run:
            prompt = build_image_prompt(era_id, i, art_style)
            print(f"  [DRY] 将生成: {img_name}")
            print(f"        Prompt: {prompt[:80]}...")
            results["images_generated"] += 1
            continue
        
        # 生成图片
        prompt = build_image_prompt(era_id, i, art_style)
        print(f"\n  生成图片 {i+1}/{len(manifest_images)}: {img_name}")
        print(f"  Prompt: {prompt[:100]}...")
        
        if has_minimax_api_key():
            success = call_minimax_api(prompt, str(img_path), "images/scene")
            if success:
                results["images_generated"] += 1
            else:
                results["errors"].append(f"图片生成失败: {img_name}")
        else:
            # 创建占位符
            _create_placeholder_image(img_path, img_name)
            print(f"  [PLACEHOLDER] 占位图已创建（API 未配置）")
            results["images_generated"] += 1
        
        time.sleep(1)  # 避免 API 限流
    
    # 生成 BGM
    bgm_name = manifest.get("bgm", f"{era_id}_bgm.mp3")
    bgm_path = era_dir / bgm_name
    
    if bgm_path.exists() and bgm_path.stat().st_size > 10000:
        print(f"  [SKIP] BGM 已存在: {bgm_name}")
    else:
        if dry_run:
            prompt = build_bgm_prompt(era_id, bgm_tags)
            print(f"  [DRY] 将生成 BGM: {bgm_name}")
            print(f"        Prompt: {prompt[:80]}...")
            results["bgm_generated"] = True
        else:
            prompt = build_bgm_prompt(era_id, bgm_tags)
            print(f"\n  生成 BGM: {bgm_name}")
            print(f"  Prompt: {prompt[:100]}...")
            
            if has_minimax_api_key():
                success = call_minimax_api(prompt, str(bgm_path), "audio/bgm")
                if success:
                    results["bgm_generated"] = True
                else:
                    results["errors"].append("BGM 生成失败")
            else:
                _create_placeholder_bgm(bgm_path, bgm_name)
                print(f"  [PLACEHOLDER] 占位 BGM 已创建（API 未配置）")
                results["bgm_generated"] = True
    
    # 上传到 R2
    if upload and not dry_run:
        print(f"\n  上传到 R2...")
        upload_result = batch_upload_resources(dry_run=False, era_id=era_id)
        results["uploaded"] = upload_result.get("uploaded", 0) > 0
    
    # 检查是否所有资源都已生成
    all_complete = True
    for img_name in manifest_images:
        img_path = era_dir / img_name
        if not img_path.exists() or img_path.stat().st_size < 1000:
            all_complete = False
            break
    
    if not bgm_path.exists() or bgm_path.stat().st_size < 10000:
        all_complete = False
    
    # 更新 manifest 状态
    new_status = "complete" if all_complete else "partial"
    if dry_run:
        print(f"\n  [DRY] manifest status 将更新为: {new_status}")
    else:
        update_manifest_status(era_id, new_status)
    
    return results


def _create_placeholder_image(path: Path, name: str) -> None:
    """创建占位图片（当 API 未配置时）"""
    # 创建一个简单的 SVG 占位图
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2a2a4a"/>
  <text x="256" y="240" font-size="24" fill="#8ec5fc" text-anchor="middle" font-family="sans-serif">
    待生成素材
  </text>
  <text x="256" y="280" font-size="18" fill="#d4af37" text-anchor="middle" font-family="sans-serif">
    {name}
  </text>
  <text x="256" y="320" font-size="14" fill="#888" text-anchor="middle" font-family="sans-serif">
    MiniMax API 未配置
  </text>
</svg>'''
    
    path.parent.mkdir(parents=True, exist_ok=True)
    # 保存为 SVG（兼容 webp/png）
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg_content)


def _create_placeholder_bgm(path: Path, name: str) -> None:
    """创建占位 BGM 文件（当 API 未配置时）"""
    # 创建一个小的静音 MP3 占位符（最小有效 MP3）
    # 这里只创建文件，实际使用时需要真实的音频文件
    path.parent.mkdir(parents=True, exist_ok=True)
    
    # 最小的有效 MP3 文件（silent, mono, 8kHz, 1 second）
    # 使用 base64 编码的最小 MP3
    minimal_mp3 = bytes([
        0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ])
    
    with open(path, "wb") as f:
        f.write(minimal_mp3)


def run_full_pipeline(dry_run: bool = False, era_id: Optional[str] = None, upload: bool = True) -> None:
    """执行完整的资源生成流程"""
    start_time = time.time()

    print("\n" + "=" * 60)
    print("墨色江湖 - MiniMax 资源生成器 (P3)")
    print("=" * 60)
    print(f"时间: {datetime.now(timezone.utc).isoformat()}")
    print(f"模式: {'DRY-RUN' if dry_run else '正式'}")
    print(f"R2 配置: {'已配置' if has_r2_config() else '未配置（优雅降级）'}")
    print(f"MiniMax API: {'已配置' if has_minimax_api_key() else '未配置'}")
    print(f"目标 Era: {era_id or '全部待生成'}")
    print("=" * 60 + "\n")

    # Step 1: 列出待生成资源
    print("[1/4] 分析资源需求...")
    pending = get_pending_suberas()
    if not pending:
        print("  所有素材包已完成！")
    else:
        print(f"  待生成素材包 ({len(pending)}):")
        for p in sorted(pending, key=lambda x: x["id"]):
            print(f"    ⏳ {p['id']}: {p['missingCount']} 张图 + BGM")
            print(f"       bgmTags: {p['bgmTags']}")
            print(f"       artStyle: {p['artStyle']}")
    print()

    # Step 2: 执行生成
    if era_id:
        # --era 参数：强制处理该 era（不受 pending 状态限制）
        # 构造与 get_pending_suberas() 相同格式的记录
        era_dir = ERA_ASSETS_DIR / era_id
        manifest_path = era_dir / "manifest.json"
        manifest = {"id": era_id, "status": "pending", "images": [], "bgm": ""}
        if manifest_path.exists():
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        bgm_tags = parse_era_theme_bgm_tags(era_id)
        art_style = parse_era_theme_art_style(era_id)
        if not art_style:
            art_style = "高质量游戏美术风格"
        existing_images = [f.name for f in era_dir.iterdir()
                          if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
        target_pendings = [{
            "id": era_id,
            "images": manifest.get("images", []),
            "bgm": manifest.get("bgm", ""),
            "bgmTags": bgm_tags,
            "artStyle": art_style,
            "existingImages": existing_images,
            "missingCount": len([img for img in manifest.get("images", [])
                                 if not any(img in ex for ex in existing_images)]),
        }]
    else:
        target_pendings = pending

    if not target_pendings:
        print("[INFO] 没有需要生成的素材")
    else:
        print(f"[2/4] 开始生成 {len(target_pendings)} 个素材包...")
        for p in target_pendings:
            results = generate_era_assets(p["id"], dry_run=dry_run, upload=upload)
            print(f"  结果: 图片 {results['images_generated']}/{results['images_generated']+results['images_skipped']}, "
                  f"BGM: {'✅' if results['bgm_generated'] else '❌'}")
            if results["errors"]:
                print(f"  错误: {results['errors']}")
    print()

    # Step 3: 上传到 R2
    if upload and not dry_run:
        print("[3/4] 上传资源到 R2...")
        batch_upload_resources(dry_run=False, era_id=era_id)
        print()
    elif upload and dry_run:
        print("[3/4] [DRY-RUN] 跳过实际上传")
        print()
    else:
        print("[3/4] 跳过上传（--no-upload）")
        print()

    # Step 4: 汇总报告
    print("[4/4] 生成汇总报告...")
    elapsed = time.time() - start_time
    
    manifests = load_all_manifests()
    complete_count = sum(1 for m in manifests.values() if m.get("status") == "complete")
    pending_count = len(manifests) - complete_count
    
    print("\n" + "=" * 60)
    print("汇总报告")
    print("=" * 60)
    print(f"总素材包: {len(manifests)}")
    print(f"已完成: {complete_count}")
    print(f"待生成: {pending_count}")
    print(f"耗时: {elapsed:.1f}s")
    print("=" * 60)
    
    if not has_minimax_api_key():
        print("\n[提示] MINIMAX_API_KEY 未设置，已创建占位文件。")
        print("       实际生成需要配置 MiniMax API Key。")
    
    print()


def main():
    parser = argparse.ArgumentParser(description="墨色江湖 - MiniMax 资源生成器 (P3)")
    parser.add_argument("--dry-run", action="store_true", help="模拟运行，不实际生成/上传")
    parser.add_argument("--era", type=str, help="指定要生成的 SubEra ID")
    parser.add_argument("--list-pending", action="store_true", help="列出所有待生成的素材包")
    parser.add_argument("--no-upload", action="store_true", help="不执行 R2 上传")
    args = parser.parse_args()

    if args.list_pending:
        list_era_assets()
        return

    run_full_pipeline(
        dry_run=args.dry_run,
        era_id=args.era,
        upload=not args.no_upload,
    )


if __name__ == "__main__":
    main()
