# 素材资源需求分析与规划

**日期：** 2026-05-03
**状态：** 规划中
**优先级：** 高

---

## 一、现状总览

| 类别 | 数量 | 完成度 |
|------|------|--------|
| 数据（天赋/气运/节日/志怪/功法） | 18 文件, 4,376 行 | ✅ 95% |
| Prompt 模板 | 99 文件, 10,148 行 | ✅ 90% |
| 图片生成系统 | 13 文件, 3,984 行 | ✅ 90% |
| 音频资源（本地 + R2 CDN） | 19 首 BGM + 15 音效, ~25MB | 🟡 60% |
| UI/图标/主题 | 8 文件, 1,048 行 | ✅ 95% |
| 时代场景素材（R2 CDN） | 7 时代已上线, 36 图 + 7 BGM | 🟡 45% |
| R2 CDN 图片图标 | 14 张（建筑/物品/技能） | 🟡 40% |
| 开局预设方案 | 空数组 | 🔴 0% |

**CDN 地址：** `https://mrqk.cc.cd` （Manifest 更新于 2026-04-30）

---

## 二、已完成部分

### 2.1 数据素材 ✅

| 资源 | 文件 | 说明 |
|------|------|------|
| 天赋预设 | `data/presets.ts` (1011 行) | 100+ 条，含时代/子纪元/NSFW 适配 |
| 气运系统 | `data/qiyun/index.ts` (1280 行) | 200+ 条气运，11 大分类 |
| 节日列表 | `data/world.ts` (125 行) | 14 个传统节日，含日期+游戏效果 |
| 子纪元快捷预设 | `data/subEraDefaultPresets.ts` (389 行) | 20+ 子纪元背景+天赋组合 |
| 里象功法 | `data/cultivation/lixiang.ts` (186 行) | 合欢/血河/天魔/自创流派 |
| 妖象功法 | `data/cultivation/yaoxiang.ts` (222 行) | 志怪主题功法体系 |
| 志怪生物 | `data/zhiguai/creatures.ts` (428 行) | 30+ 妖怪，含行为模式/弱点/威胁等级/阴阳属性 |
| 志怪事件 | `data/zhiguai/events.ts` (204 行) | 触发类型+关联生物+结果类型 |

### 2.2 Prompt 模板 ✅

| 模块 | 文件数 | 状态 |
|------|--------|------|
| core/ 核心推理 | 19 | ✅ 完整 |
| runtime/ 运行时 | ~30 | ✅ 基本完整 |
| difficulty/ 难度 | 3 | ✅ 完整 |
| writing/ 写作风格 | 5 | ✅ 完整 |
| stats/ 数值计算 | 13 | ✅ 完整 |
| intimacy/ 好感度 | 2 | ✅ 完整 |
| storyStyles/ 文风 | 7 | ✅ 完整 |
| eraRealism/ 时代写实 | 6 | ✅ 完整 |

### 2.3 UI 资源 ✅

| 资源 | 说明 |
|------|------|
| SVG 图标组件 | 20+ 图标（剑、盾、甲、包、戒指等），currentColor 自适应主题 |
| 主题定义 | 5 套主题（墨色/青鸾/赤金等），完整 CSS 变量 |
| 稀有度样式 | 6 级色彩（普通~神话） |
| Android 启动图标 | 26 张 PNG，全 DPI + 横竖屏覆盖 |

### 2.4 音频资源 ✅

**本地文件（`data/resources/audio/bgm/`）：**

| 资源 | 大小 |
|------|------|
| `bgm_marketplace.mp3` | 874KB |
| `bgm_tavern.mp3` | 870KB |
| `bgm_temple.mp3` | 6.4MB |

**R2 CDN BGM（4 首）：**

| ID | 大小 | 风格 |
|----|------|------|
| `bgm_jianghu_inn` | 788KB | 江湖客栈 |
| `bgm_battle_normal` | 4.1MB | 普通战斗 |
| `bgm_battle_boss` | 674KB | Boss 战斗 |
| `bgm_qingfeng_town` | 7.4MB | 城镇探索 |

**R2 CDN SFX 音效（15 个）：**

| 分类 | 音效 |
|------|------|
| UI | `sfx_ui_click`(5.2KB)、`sfx_ui_confirm`(9.1KB)、`sfx_notification`(17.3KB) |
| 战斗 | `sfx_combat_hit`(4.3KB)、`sfx_combat_block`(3.5KB)、`sfx_combat_dodge`(6.5KB)、`sfx_sword_swing`(8.7KB)、`sfx_victory`(51.7KB)、`sfx_defeat`(56.0KB)、`sfx_miss`(8.7KB) |
| 系统 | `sfx_level_up`(34.5KB)、`sfx_buff_apply`(25.9KB)、`sfx_debuff`(20.3KB)、`sfx_coin`(15.1KB)、`sfx_door_open`(17.3KB) |

### 2.5 时代场景素材（R2 CDN，7 时代已完成 ✅）

CDN 路径：`https://mrqk.cc.cd/data/era_assets/{eraId}/manifest.json`

| 时代 | 状态 | 场景 | BGM |
|------|------|------|-----|
| 东方·武侠 `ancient_eastern_wuxia` | ✅ | 江南水乡、少林寺、大漠驼铃、江湖酒楼、竹林剑战、皇宫大殿 | ✅ |
| 东方·志怪 `ancient_eastern_zhiguai` | ✅ | 6 张 | ✅ |
| 东方·神话 `ancient_eastern_myth` | ✅ | 6 张 | ✅ |
| 西方·希腊 `ancient_western_greek` | ✅ | 6 张 | ✅ |
| 西方·罗马 `ancient_western_roman` | ✅ | 6 张 | ✅ |
| 西方·中世纪 `ancient_western_medieval` | ✅ | 6 张 | ✅ |
| 当代·都市 `contemporary_urban` | ✅ | 6 张 | ✅ |

**统计：** 7 × 6 = 42 张场景图 + 7 首时代 BGM

### 2.6 R2 CDN 图标图片（14 张）

| 分类 | 数量 | 详情 |
|------|------|------|
| 建筑图片 | 4 张 | 客栈(2版本)、市场、寺庙 |
| 物品图标 | 6 张 | 剑/刀武器、丹药(2版本)、技能书、轻甲 |
| 技能图标 | 1 张 | `skill_sword_basic` |
| 测试文件 | 1 个 | `r2_test` |

### 2.7 图片生成系统 ✅

| 模块 | 说明 |
|------|------|
| 多后端支持 | NovelAI / ComfyUI / OpenAI / Grok / Banana |
| 资源缓存 | `wuxia-asset://` URI + IndexedDB |
| CDN 集成 | R2 manifest.json 自动加载 |
| 图片管理器 UI | 7 个 Tab（预设/手动/场景/历史/图库/规则/队列） |

---

## 三、未完成部分

### 🔴 高优先级

| # | 资源 | 问题 | 影响范围 |
|---|------|------|----------|
| 1 | **6 个时代场景素材缺失** | CDN 返回 404 | 文艺复兴/校园/赛博朋克/太空/后人类/远古 无场景图 + BGM |
| 2 | **开局预设方案** `data/newGamePresets.ts` | `开局预设方案列表` 为空数组 | 新游戏界面无预置方案可选 |
| 3 | **AlbumApp 占位图片** | 6 个 emoji 占位符 | 相册功能无真实内容 |
| 4 | **Prompt Stub 文件** | 7 个文件仅 1-3 行 | 图片锚点提取、PNG 解析、境界默认等缺失 |

### 🟡 中优先级

| # | 资源 | 问题 | 影响范围 |
|---|------|------|----------|
| 5 | **BGM 场景覆盖不全** | 现有 14 首 BGM，缺探索/宗门/好感度/结局等专属曲目 | 部分场景无匹配音乐 |
| 6 | **无自定义字体** | 使用系统 serif | 武侠标题氛围弱 |
| 7 | **时代图标 emoji** | `eraIconMap.ts` 用 emoji | 视觉粗糙 |
| 8 | **建筑/物品/技能图标不够** | CDN 仅 14 张图标 | 大量道具缺专属图标 |

### 🟢 低优先级

| # | 资源 | 问题 |
|---|------|------|
| 9 | CDN manifest 错误处理 | fetch 失败静默降级 |
| 10 | 视频素材少 | 仅 2 个演示 MP4，缺开场动画 |

---

## 四、详细需求方案

### 阶段一：补齐核心缺失（预估 2-3 天）

#### 1. 补齐 6 个缺失时代的场景素材

**缺失时代：** 文艺复兴、校园、赛博朋克、太空、后人类、远古

**涉及文件：**
- `scripts/generateEraAssets.ts` — 生成脚本
- `data/era_assets/` — 输出目录
- `services/assets/eraAssetsService.ts` — 加载服务

**方案：** 运行生成脚本或通过图片管理器手动生成，每个时代 6 场景 + 1 BGM

**预估产出：** 36 张场景图 + 6 首 BGM

#### 2. 完善开局预设方案

**目标：** 填充 `data/newGamePresets.ts` 的 `开局预设方案列表`

**涉及文件：**
- `data/newGamePresets.ts` — 目标文件
- `data/subEraDefaultPresets.ts` — 参考数据源
- `data/presets.ts` — 天赋/背景数据源

**方案：** 基于子纪元预设转化，每个时代 3-5 套，共 40-60 套

#### 3. 修复 Prompt Stub

| 文件 | 当前 | 需实现 |
|------|------|--------|
| `prompts/runtime/imageAnchorExtractionCot.ts` | 2 行 | 图片锚点提取 COT |
| `prompts/runtime/imageTokenizerCharacterCot.ts` | 2 行 | 角色图 token 化 COT |
| `prompts/runtime/imageTokenizerSceneCot.ts` | 2 行 | 场景图 token 化 COT |
| `prompts/runtime/imageTokenizerSecretPartCot.ts` | 2 行 | 部位特写 token 化 COT |
| `prompts/runtime/pngParseCot.ts` | 2 行 | PNG 解析 COT |
| `prompts/shared/realmDefaults.ts` | 1 行 | 境界默认配置 |
| `prompts/runtime/variableCalibration.ts` | 3 行 | 变量校准规则 |

---

### 阶段二：素材丰富（预估 1 周）

#### 4. BGM 扩充

| 场景 | 建议曲目数 | 状态 |
|------|-----------|------|
| 普通战斗 | 1 首 | ✅ `bgm_battle_normal` |
| Boss 战斗 | 1 首 | ✅ `bgm_battle_boss` |
| 客栈/酒馆 | 1 首 | ✅ `bgm_jianghu_inn` |
| 城镇探索 | 1 首 | ✅ `bgm_qingfeng_town` |
| 市集 | 1 首 | ✅ `bgm_marketplace` (本地) |
| 寺庙/道观 | 1 首 | ✅ `bgm_temple` (本地) |
| 旅行/远行 | 2 首 | ❌ 缺失 |
| 宗门修炼 | 2 首 | ❌ 缺失 |
| 志怪夜行 | 2 首 | ❌ 缺失 |
| 好感度/亲密 | 2 首 | ❌ 缺失 |
| 结局/大剧情 | 1-2 首 | ❌ 缺失 |

#### 5. 自定义字体引入

| 用途 | 推荐字体 | 格式 | 体积 |
|------|---------|------|------|
| 标题/功法名 | 思源宋体 (Noto Serif SC) | WOFF2, subset | ~500KB |
| 武侠特效字 | 站酷文艺体 | WOFF2 | ~300KB |

#### 6. 图标扩充

- 当前 14 张 → 目标 50+ 张
- 优先补充：丹药类、武功秘籍类、武器进阶、防具进阶

#### 7. 时代图标 emoji → SVG

24x24 viewBox, stroke-based, currentColor 自适应

---

### 阶段三：体验增强（预估 1-2 周）

#### 8. 相册功能接入真实图片

`components/features/MobileDevice/apps/AlbumApp.tsx` 改为从 `imageAssets.ts` 加载

#### 9. 视频素材扩展

开场动画、重大剧情过场

---

## 五、实施步骤

- [ ] 阶段一.1：补齐 6 个缺失时代的场景素材（36 图 + 6 BGM）
- [ ] 阶段一.2：填充 `开局预设方案列表`，40-60 套方案
- [ ] 阶段一.3：实现 7 个 Prompt Stub 文件
- [ ] 阶段二.4：扩充 BGM 至 20+ 首
- [ ] 阶段二.5：引入自定义字体
- [ ] 阶段二.6：图标扩充至 50+ 张
- [ ] 阶段二.7：时代图标 emoji → SVG
- [ ] 阶段三.8：AlbumApp 接入真实图片系统
- [ ] 阶段三.9：扩展视频素材

---

## 六、风险评估

| 风险 | 等级 | 应对 |
|------|------|------|
| 时代素材生成 API 不可用 | 高 | 用 ComfyUI/NovelAI 手动生成 |
| AI 生成图片风格不一致 | 中 | 统一风格前缀 + 负面 prompt |
| BGM 版权问题 | 高 | 仅使用 CC0/CC-BY 资源 |
| 字体体积过大 | 中 | WOFF2 + subset |
