# 三层时代主题 — 资源需求清单

> 基于 `era-theme-tree-structure.md`（树结构定义）和 `era-theme-three-layer-architecture.md`（架构方案）
> 统计 37 个子时代（SubEra）的全部外部资源需求。
>
> **Phase D（提示词层接入）已完成：** promptVars / openingScenes / characterArchetypes / writingSamples / conflictTypes / eraRealism 已全部接入系统提示词。

---

## 总览

| 资源类型 | 标准需求 | 已有 | 需要补充 | 获取方式 |
|---------|---------|------|---------|---------|
| 场景图片 | 222 张 (37×6) | 42 张 | **180 张** | AI 生成管线 |
| BGM 音频 | 37 首 (37×1) | 5 首 | **32 首** | AI 生成 / CC 素材库 |
| Web 字体 | 15 种 | 0 (系统字体) | **~900KB** (子集化) | Google Fonts CDN |
| SVG 滤镜 | 2 个 | 0 | **2 个** | 手写 SVG |
| 背景纹理 | 4 种 | 0 | **3 个** (+1 纯CSS) | SVG data URI / CSS |

---

## 一、场景图片

**标准：** 每个 SubEra 需要 6 张场景图（开局场景、战斗场景、NPC 肖像、环境氛围等）。

### 1.1 远古（Primordial）— 全新

| SubEra | 中文名称 | 现有图片 | 需补充 | 艺术风格定义 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `primordial_african` | 非洲部落 | 0 | 6 | 岩壁画·赭石色·部落图腾 | P2 |
| `primordial_americas` | 美洲原住民 | 0 | 6 | 玛雅石刻·羽毛图腾·丛林 | P2 |
| `primordial_norse` | 北欧萨满 ← 新 | 0 | 6 | 冰原风雪·卢恩符文·萨满仪式 | P2 |

### 1.2 古代（Ancient）— 现有 + 新增

| SubEra | 中文名称 | 现有图片 | 需补充 | 艺术风格定义 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `ancient_eastern_wuxia` | 武侠 | 6 | 0 | 水墨写实摄影 | 完成 |
| `ancient_eastern_zhiguai` | 志怪 | 6 | 0 | 水墨灵异·幽暗 | 完成 |
| `ancient_eastern_myth` | 神话 | 0 | 6 | 古典壁画·金石气 | P1 |
| `ancient_eastern_intrigue` | 权谋 ← 新 | 0 | 6 | 宫廷暗纹·玄铁灰·官印效果 | P2 |
| `ancient_eastern_cultivation` | 修仙 ← 新 | 0 | 6 | 紫霄灵气·炼丹炉·仙境云海 | P2 |
| `ancient_western_greek` | 古希腊 | 0 | 6 | 希腊大理石雕塑风 | P1 |
| `ancient_western_roman` | 古罗马 | 0 | 6 | 罗马浮雕与大理石 | P1 |
| `ancient_western_medieval` | 中世纪欧洲 | 0 | 6 | 中世纪手抄本彩绘 | P1 |
| `ancient_western_viking` | 维京 ← 新 | 0 | 6 | 北欧长船·卢恩符文·风雪海浪 | P2 |
| `ancient_western_celtic` | 凯尔特 ← 新 | 0 | 6 | 德鲁伊森林·凯尔特结·妖精传说 | P2 |

### 1.3 近代（Modern）— 现有 + 新增

| SubEra | 中文名称 | 现有图片 | 需补充 | 艺术风格定义 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `modern_eastern_republic` | 民国风云 | 7 | 0 | 老照片质感·暖褐 | 完成 |
| `modern_eastern_meiji_taisho` | 明治·大正 | 0 | 6 | 浮世绘与洋画风 | P2 |
| `modern_eastern_late_qing` | 晚清 ← 新 | 0 | 6 | 清末老照片·暗红·王朝将倾 | P2 |
| `modern_western_victorian` | 维多利亚时代 | 0 | 6 | 蒸汽朋克机械·油画 | P2 |
| `modern_western_jazz_age` | 爵士时代 | 0 | 6 | Art Deco 装饰艺术·金黑 | P2 |
| `modern_western_postwar` | 战后重建 | 0 | 6 | 彩色胶片摄影·Kodachrome 暖调 | P2 |

### 1.4 现代（Contemporary）— 重组 + 新增

| SubEra | 中文名称 | 现有图片 | 需补充 | 艺术风格定义 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `contemporary_urban` | 都市 | 6 | 0 | 现代写实摄影·冷蓝 | 完成 |
| `contemporary_rural` | 乡村 | 0 | 6 | 自然写实摄影·暖绿 | P2 |
| `contemporary_post_apocalyptic` | 末日废土 | 0 | 6 | 废土写实摄影·沙黄 | P2 |
| `contemporary_noir` | 黑色犯罪 ← 新 | 0 | 6 | 冷硬派侦探·暗红·极简冷硬 | P2 |
| `contemporary_hippie` | 嬉皮士文化 ← 新 | 0 | 6 | 迷幻色彩·胶片颗粒·自由精神 | P3 |
| `contemporary_zombie` | 丧尸危机 ← 新 | 0 | 6 | 腐肉绿·血渍质感·末日废墟 | P2 |
| `contemporary_extreme_cold` | 极寒末日 ← 新 | 0 | 6 | 冰蓝·风雪效果·冰封城市 | P2 |
| `contemporary_biohazard` | 生化危机 ← 新 | 0 | 6 | 生化黄·危险警示·隔离区 | P2 |
| `contemporary_nuclear_winter` | 核冬天 ← 新 | 0 | 6 | 辐射橙·辐射尘·核战废土 | P3 |

### 1.5 近未来（Near Future）— 重组

| SubEra | 中文名称 | 现有图片 | 需补充 | 艺术风格定义 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `near-future_cyberpunk` | 赛博朋克 | 6 | 0 | 赛博霓虹写实 | 完成 |
| `near-future_dystopia` | 反乌托邦 | 0 | 6 | 灰暗写实·压抑 | P3 |
| `near-future_space_colonization` | 太空殖民 | 0 | 6 | 科幻写实·深空蓝 | P3 |

### 1.6 未来（Far Future）— 重组

| SubEra | 中文名称 | 现有图片 | 需补充 | 艺术风格定义 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `far-future_space_opera` | 星际科幻 | 6 | 0 | 深空科幻写实 | 完成 |
| `far-future_cyborg` | 赛博格 | 0 | 6 | 未来写实·青白 | P3 |
| `far-future_virtual_reality` | 虚拟现实 | 0 | 6 | 数字写实·霓虹几何 | P3 |

### 1.7 后人类（Post-Human）— 全新

| SubEra | 中文名称 | 现有图片 | 需补充 | 艺术风格定义 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `post-human_energy` | 纯能量生命 ← 新 | 0 | 6 | 抽象几何·光粒子·虚空 | P3 |
| `post-human_dimension` | 维度旅行 ← 新 | 0 | 6 | 多维空间·数学结构·超现实 | P3 |
| `post-human_math` | 数学实在论 ← 新 | 0 | 6 | 分形几何·曼德博集合·纯粹数学 | P3 |

**合计：180 张需要生成。** 已有 42 张（5 个子时代已完成）。
（比扩展前新增 90 张）

**已有图片存储路径：** `data/era_assets/{eraId}/*.jpg`

---

## 二、BGM 音频

**标准：** 每个 SubEra 需要 1 首背景音乐（可循环播放的 mp3 或 ogg）。

| SubEra | 中文名称 | 现有 BGM | 需补充 | BGM 风格标签 | 优先级 |
|--------|---------|---------|--------|-------------|--------|
| `ancient_eastern_wuxia` | 武侠 | 1 | 0 | 民乐、古筝、笛子、武侠 | 完成 |
| `ancient_eastern_zhiguai` | 志怪 | 0 | 1 | 民乐、古筝、箫、灵异、志怪 | P1 |
| `ancient_eastern_myth` | 神话 | 0 | 1 | 民乐、编钟、埙、史诗、神话 | P1 |
| `ancient_eastern_intrigue` | 权谋 ← 新 | 0 | 1 | 古琴、低沉、紧张、朝堂 | P2 |
| `ancient_eastern_cultivation` | 修仙 ← 新 | 0 | 1 | 民乐、空灵、仙气、炼丹、飞升 | P2 |
| `ancient_western_greek` | 古希腊 | 0 | 1 | 古典、里拉琴、管弦、地中海 | P1 |
| `ancient_western_roman` | 古罗马 | 0 | 1 | 古典、管弦、军乐、史诗 | P1 |
| `ancient_western_medieval` | 中世纪欧洲 | 0 | 1 | 古典、圣咏、鲁特琴、骑士 | P1 |
| `ancient_western_viking` | 维京 ← 新 | 0 | 1 | 北欧民谣鼓、战号、风雪声、卢恩吟唱 | P2 |
| `ancient_western_celtic` | 凯尔特 ← 新 | 0 | 1 | 竖琴、风笛、妖精传说、森林神秘 | P2 |
| `modern_eastern_republic` | 民国风云 | 1 | 0 | 爵士、时代曲、上海滩 | 完成 |
| `modern_eastern_meiji_taisho` | 明治·大正 | 0 | 1 | 和乐、军乐、洋乐、时代曲 | P2 |
| `modern_eastern_late_qing` | 晚清 ← 新 | 0 | 1 | 传统民乐·沉闷·王朝将倾·压抑 | P2 |
| `modern_western_victorian` | 维多利亚时代 | 0 | 1 | 古典、管弦、八音盒、工业革命 | P2 |
| `modern_western_jazz_age` | 爵士时代 | 0 | 1 | 爵士、摇摆乐、铜管、禁酒令地下酒吧 | P2 |
| `modern_western_postwar` | 战后重建 | 0 | 1 | 爵士、大乐队、早期摇滚、蓝调、战后复兴 | P2 |
| `contemporary_urban` | 都市 | 1 | 0 | 电子、流行、城市生活 | 完成 |
| `contemporary_rural` | 乡村 | 0 | 1 | 民谣、吉他、自然声 | P2 |
| `contemporary_post_apocalyptic` | 末日废土 | 0 | 1 | 环境、低频、低沉、荒漠 | P2 |
| `contemporary_noir` | 黑色犯罪 ← 新 | 0 | 1 | 爵士、低音萨克斯、冷硬、暗夜 | P2 |
| `contemporary_hippie` | 嬉皮士文化 ← 新 | 0 | 1 | 迷幻摇滚、风琴、自由、反文化 | P3 |
| `contemporary_zombie` | 丧尸危机 ← 新 | 0 | 1 | 低沉鼓点、尖叫、恐怖、紧张 | P2 |
| `contemporary_extreme_cold` | 极寒末日 ← 新 | 0 | 1 | 风笛、低频环境音、风雪、孤寂 | P2 |
| `contemporary_biohazard` | 生化危机 ← 新 | 0 | 1 | 电子警报、环境低频、紧张、危机 | P2 |
| `contemporary_nuclear_winter` | 核冬天 ← 新 | 0 | 1 | 盖革计数器声、环境低频、荒凉、辐射 | P3 |
| `near-future_cyberpunk` | 赛博朋克 | 1 | 0 | 电子、合成器、赛博、霓虹 | 完成 |
| `near-future_dystopia` | 反乌托邦 | 0 | 1 | 电子、低沉、压抑、氛围 | P3 |
| `near-future_space_colonization` | 太空殖民 | 0 | 1 | 电子、管弦、太空、悬疑 | P3 |
| `far-future_space_opera` | 星际科幻 | 1 | 0 | 管弦、史诗、星际、壮阔 | 完成 |
| `far-future_cyborg` | 赛博格 | 0 | 1 | 电子、氛围、赛博格、空灵 | P3 |
| `far-future_virtual_reality` | 虚拟现实 | 0 | 1 | 电子、环境、数字、空灵 | P3 |
| `primordial_african` | 非洲部落 ← 新 | 0 | 1 | 部落鼓、人声吟唱、原始、巫术 | P2 |
| `primordial_americas` | 美洲原住民 ← 新 | 0 | 1 | 原住民笛、丛林环境音、祭祀 | P2 |
| `primordial_norse` | 北欧萨满 ← 新 | 0 | 1 | 人声吟唱、风铃、萨满鼓、风雪 | P2 |
| `post-human_energy` | 纯能量生命 ← 新 | 0 | 1 | 氛围、极简、超越、意识流 | P3 |
| `post-human_dimension` | 维度旅行 ← 新 | 0 | 1 | 氛围、数学感、多维、空灵 | P3 |
| `post-human_math` | 数学实在论 ← 新 | 0 | 1 | 极简、电子脉冲、分形、数学 | P3 |

**合计：32 首需要补充。** 已有 5 首。
（比扩展前新增 17 首）

**已有音频存储路径：** `data/era_assets/{eraId}/{eraId}_bgm.mp3`

**获取途径建议：**
1. **AI 生成** — Suno / Udio 等音乐 AI 工具，按风格标签生成
2. **免费 CC 素材** — FreeSound.org、OpenGameArt.org
3. **商业素材库** — AudioJungle / Envato Elements（单价约 $5-20/首）

---

## 三、Web 字体

代码中引用了以下**非系统自带**字体，需要通过网络加载确保跨平台一致性。

| 字体 | 用途 | 来源 | 加载方式 | 文件大(约) | 优先级 |
|------|------|------|---------|-------------|--------|
| **Noto Serif SC** | 中文衬底回退（古代标题） | Google Fonts | CDN / 子集化 | 200KB | P1 |
| **Noto Sans SC** | 中文正文回退 | Google Fonts | CDN / 子集化 | 200KB | P1 |
| **JetBrains Mono** | 近未来等宽字体 | Google Fonts | CDN | 200KB | P1 |
| **Orbitron** | 未来科幻标题字体 | Google Fonts | CDN | 50KB | P2 |
| **Rajdhani** | 未来科幻辅助字体 | Google Fonts | CDN | 80KB | P2 |
| **Share Tech Mono** | 未来终端等宽字体 | Google Fonts | CDN | 40KB | P2 |
| **Noto Serif JP** | 日本近代标题（替代 YuMincho） | Google Fonts | CDN | 200KB | P3 |
| **Noto Sans JP** | 日本近代正文回退 | Google Fonts | CDN | 200KB | P3 |
| **Runes (Junicode)** | 北欧维京/卢恩字符 | Google Fonts | CDN | 100KB | P3 |
| **Cinzel** | 古希腊/古罗马标题 | Google Fonts | CDN | 60KB | P2 |
| **MedievalSharp** | 中世纪风格标题 | Google Fonts | CDN | 50KB | P2 |
| **Ma Shan Zheng** | 权谋/朝堂风格 | Google Fonts | CDN | 200KB | P3 |
| **ZCOOL KuaiLe** | 嬉皮士/轻松风格 | Google Fonts | CDN | 200KB | P3 |
| **Long Cang** | 手写/书法风格 | Google Fonts | CDN | 200KB | P3 |
| **Maoken** | 赛博朋克/未来感 | 本地托管 | CDN | 150KB | P3 |

**总计：~2130KB（子集化中文后约 ~900KB）。**

**建议方案：** 在 `index.html` 中引入 Google Fonts CDN：
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=Orbitron&family=Rajdhani:wght@400;600&family=Share+Tech+Mono&family=Noto+Serif+JP&family=Noto+Sans+JP&family=Junicode&family=Cinzel&family=MedievalSharp&family=Ma+Shan+Zheng&family=ZCOOL+KuaiLe&family=Long+Cang&display=swap" rel="stylesheet">
```

或本地托管子集化字体（国内用户无 Google 访问问题）。

---

## 四、SVG 滤镜

| 滤镜 ID | 对应装饰效果 | SVG Filter | 复杂度 |
|---------|-------------|------------|--------|
| `ink-bleed` | 墨渗（水墨边缘不规则扩散） | `feTurbulence + feDisplacementMap` | 中 |
| `grain-texture` | 胶片颗粒（替代 CSS noise 方案） | `feTurbulence + feColorMatrix` | 低 |

**存储路径建议：** `public/filters.svg`

**CSS 引用方式：**
```css
.deco-ink-bleed {
  filter: url(/filters.svg#ink-bleed);
}
```

---

## 五、背景纹理

| 纹理名称 | 用途 | 实现方式 | 大小 | 优先级 |
|---------|------|---------|------|--------|
| 纸张纹理 | 古代/近代背景叠加 | SVG data URI（内联 base64） | <10KB | P2 |
| CRT 网格 | 赛博朋克扫描线叠加 | CSS `repeating-linear-gradient` | 0（纯CSS） | P1 |
| 全息网格 | 未来感半透明网格 | CSS `linear-gradient` + `animation` | 0（纯CSS） | P2 |
| 岩画质感 | 远古/原始时代纹理 | SVG data URI（内联 base64） | <10KB | P2 |

---

## 六、按优先级分组

### P1 — 核心体验（第一批补齐）

| 资源 | 数量 | 说明 |
|------|------|------|
| `ancient_eastern_zhiguai` BGM | 1 首 | 志怪灵异风 |
| `ancient_eastern_myth` 图片 | 6 张 | 古典壁画风 |
| `ancient_eastern_myth` BGM | 1 首 | 编钟史诗风 |
| `ancient_western_greek` 图片 | 6 张 | 大理石雕塑风 |
| `ancient_western_greek` BGM | 1 首 | 里拉琴古典风 |
| `ancient_western_roman` 图片 | 6 张 | 罗马浮雕风 |
| `ancient_western_roman` BGM | 1 首 | 军乐史诗风 |
| `ancient_western_medieval` 图片 | 6 张 | 手抄本彩绘风 |
| `ancient_western_medieval` BGM | 1 首 | 圣咏骑士风 |
| Web 字体 (P1) | ~600KB | Noto SC + JetBrains Mono |
| SVG 滤镜 | 2 个 | 墨渗 + 颗粒 |
| CRT 网格纹理 | 1 个 | 纯 CSS |

### P2 — 丰富体验（第二批补齐）

| 资源 | 数量 | 说明 |
|------|------|------|
| 古代新增图片 × 6 | 36 张 | 权谋、修仙、维京、凯尔特、神话 |
| 古代新增 BGM × 6 | 6 首 | 对应各风格 |
| 近代图片 × 8 | 48 张 | 明治大正、晚清、维多利亚、爵士、战后 |
| 近代 BGM × 8 | 8 首 | 对应各风格 |
| 现代图片 × 4 | 24 张 | 乡村、废土、黑色犯罪 |
| 现代 BGM × 4 | 4 首 | 对应各风格 |
| 末日图片 × 4 | 24 张 | 丧尸危机、极寒末日、生化危机、核冬天 |
| 末日 BGM × 4 | 4 首 | 对应各风格 |
| 远古图片 × 3 | 18 张 | 非洲部落、美洲原住民、北欧萨满 |
| 远古 BGM × 3 | 3 首 | 对应各风格 |
| Web 字体 (P2) | ~190KB | Orbitron + Rajdhani + Share Tech Mono + Cinzel + MedievalSharp |
| 纸张纹理 | 1 个 | SVG data URI |
| 全息网格纹理 | 1 个 | 纯 CSS |
| 岩画质感纹理 | 1 个 | SVG data URI |

### P3 — 锦上添花（最后补齐）

| 资源 | 数量 | 说明 |
|------|------|------|
| 近未来图片 × 2 | 12 张 | 反乌托邦、太空殖民 |
| 近未来 BGM × 2 | 2 首 | 对应各风格 |
| 未来图片 × 2 | 12 张 | 赛博格、虚拟现实 |
| 未来 BGM × 2 | 2 首 | 对应各风格 |
| 后人类图片 × 3 | 18 张 | 纯能量生命、维度旅行、数学实在论 |
| 后人类 BGM × 3 | 3 首 | 对应各风格 |
| 现代图片 × 1 | 6 张 | 嬉皮士文化 |
| 现代 BGM × 1 | 1 首 | 嬉皮士风 |
| Web 字体 (P3) | ~510KB | Noto JP + Runes + 中文特殊字体 + 赛博字体 |

---

## 七、现有资产索引

已有完整资产（图片 + BGM 齐全）的 SubEra（5 个）：

| SubEra | 中文名 | 图片数 | BGM |
|--------|--------|--------|-----|
| `ancient_eastern_wuxia` | 武侠 | 6 | 1 |
| `modern_eastern_republic` | 民国风云 | 7 | 1 |
| `contemporary_urban` | 都市 | 6 | 1 |
| `near-future_cyberpunk` | 赛博朋克 | 6 | 1 |
| `far-future_space_opera` | 星际科幻 | 6 | 1 |

已有图片但缺 BGM 的 SubEra（1 个）：

| SubEra | 中文名 | 图片数 | BGM |
|--------|--------|--------|-----|
| `ancient_eastern_zhiguai` | 志怪 | 6 | 0 |

完全无资产的 SubEra（31 个）：

| SubEra | 中文名 |
|--------|--------|
| `ancient_eastern_myth` | 神话 |
| `ancient_eastern_intrigue` | 权谋 ← 新 |
| `ancient_eastern_cultivation` | 修仙 ← 新 |
| `ancient_western_greek` | 古希腊 |
| `ancient_western_roman` | 古罗马 |
| `ancient_western_medieval` | 中世纪欧洲 |
| `ancient_western_viking` | 维京 ← 新 |
| `ancient_western_celtic` | 凯尔特 ← 新 |
| `modern_eastern_meiji_taisho` | 明治·大正 |
| `modern_eastern_late_qing` | 晚清 ← 新 |
| `modern_western_victorian` | 维多利亚时代 |
| `modern_western_jazz_age` | 爵士时代 |
| `modern_western_postwar` | 战后重建 |
| `contemporary_rural` | 乡村 |
| `contemporary_post_apocalyptic` | 末日废土 |
| `contemporary_noir` | 黑色犯罪 ← 新 |
| `contemporary_hippie` | 嬉皮士文化 ← 新 |
| `contemporary_zombie` | 丧尸危机 ← 新 |
| `contemporary_extreme_cold` | 极寒末日 ← 新 |
| `contemporary_biohazard` | 生化危机 ← 新 |
| `contemporary_nuclear_winter` | 核冬天 ← 新 |
| `near-future_dystopia` | 反乌托邦 |
| `near-future_space_colonization` | 太空殖民 |
| `far-future_cyborg` | 赛博格 |
| `far-future_virtual_reality` | 虚拟现实 |
| `primordial_african` | 非洲部落 ← 新 |
| `primordial_americas` | 美洲原住民 ← 新 |
| `primordial_norse` | 北欧萨满 ← 新 (ID 修正: `primordial_norse_saman` → `primordial_norse`) |
| `post-human_energy` | 纯能量生命 ← 新 (ID 修正: `post-human_pure_energy` → `post-human_energy`) |
| `post-human_dimension` | 维度旅行 ← 新 |
| `post-human_math` | 数学实在论 ← 新 (ID 修正: `post-human_math_reality` → `post-human_math`) |

---

## 八、扩展前后对比

| 指标 | 扩展前 | 扩展后 | 增量 |
|------|--------|--------|------|
| 时代 (Epoch) | 5 | 7 | +2 |
| 纪元 (Era) | 4 | 13 | +9 |
| 子纪元 (SubEra) | 22 | 37 | +15 |
| 场景图片需求 | 90 张 | 222 张 (37×6) | +132 |
| BGM 需求 | 17 首 | 36 首 (37−1已有) | +19 |
| Web 字体 | 8 种 | 15 种 | +7 |
| 背景纹理 | 3 种 | 4 种 | +1 |
| 完全无资产 SubEra | 14 个 | 32 个 | +18 |
