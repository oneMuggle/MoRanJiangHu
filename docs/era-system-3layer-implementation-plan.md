# 墨染江湖·三层时代体系完整实施方案

> 版本：v2.0（Claude Code 分析生成）
> 日期：2026-04-28
> 状态：数据模型已完善（22个SubEra均有完整bgmTags/artStyle/uiCopy）

## 一、现状盘点

### 1.1 数据模型 ✅ 完整
- `models/eraTheme.ts` — 22个SubEra，**全部有完整元数据**（bgmTags、artStyle、uiCopy）
- 三层结构：Epoch（5个）→ Era（9个）→ SubEra（22个）

### 1.2 素材现状 ❌ 部分缺失
| 状态 | SubEra数量 | 名称 |
|------|-----------|------|
| ✅ 有素材 | 5 | 武侠、民国风云、都市、赛博朋克、星际科幻 |
| ⏳ 待生成 | 17 | 志怪、神话、古希腊、古罗马、中世纪明治大正、维多利亚、爵士时代、战后重建、乡村、末日废土、反乌托邦、太空殖民、赛博格、虚拟现实 |

### 1.3 待实现功能
1. 时代选择器 UI 组件
2. era_assets 动态加载机制
3. 时代主题动态 UI 切换
4. 时代感知的世界生成
5. SubEra 素材生成管线

---

## 二、任务优先级

### P0 — 核心架构（必须先完成）
无阻塞项，数据模型已完整。

### P1 — 时代选择器 + 加载机制（短期目标）

| 任务ID | 名称 | 优先级 | 工作量 |
|--------|------|--------|--------|
| P1-1 | 创建 EraSelector 组件目录 | P1 | 小 |
| P1-2 | 实现三级树状导航（EraTreeNav） | P1 | 中 |
| P1-3 | 实现时代预览卡片（EraPreviewCard） | P1 | 中 |
| P1-4 | 集成到 NewGame 流程 | P1 | 中 |
| P1-5 | 存档数据结构扩展（eraId字段） | P1 | 小 |
| P2-1 | 创建 eraAssets 服务模块 | P1 | 中 |
| P2-2 | 定义素材加载接口（models/eraAssets.ts） | P1 | 小 |
| P2-3 | 实现 manifest.json 解析器 | P1 | 小 |
| P2-4 | 素材缓存与懒加载 | P1 | 中 |
| P2-5 | BGM 自动播放集成 | P1 | 中 |

### P2 — 动态主题 + 世界生成（中期目标）

| 任务ID | 名称 | 优先级 | 工作量 |
|--------|------|--------|--------|
| P4-1 | 创建 useEraTheme Hook | P2 | 中 |
| P4-2 | 动态 CSS 变量注入 | P2 | 中 |
| P4-3 | UI 装饰效果实现（5种） | P2 | 中 |
| P4-4 | 全局文案替换 | P2 | 中 |
| P5-1 | 扩展世界生成提示词 | P1 | 中 |
| P5-2 | 时代特定 NPC 规则 | P2 | 大 |
| P5-3 | 时代特定物品/武学/系统 | P2 | 大 |

### P3 — 素材生成管线（长期目标）

| 任务ID | 名称 | 优先级 | 工作量 |
|--------|------|--------|--------|
| P3-1 | 创建素材生成脚本 | P2 | 中 |
| P3-2 | BGM 生成/匹配管线 | P2 | 大 |
| P3-3 | 素材目录标准化 | P2 | 中 |
| P3-4 | 更新 index.html 素材索引 | P2 | 小 |

---

## 三、关键文件清单

### 已有文件
| 文件 | 状态 | 说明 |
|------|------|------|
| `models/eraTheme.ts` | ✅ 完整 | 22个SubEra完整定义 |
| `data/era_assets/index.html` | ✅ 可用 | 素材展示页（5有素材+17待生成） |
| `docs/era-system-3layer-implementation-plan.md` | ✅ 完整 | 实施方案文档 |

### 待创建文件

**P1 时代选择器**
- `components/features/EraSelector/EraSelector.tsx` — 主组件
- `components/features/EraSelector/EraNodeCard.tsx` — 节点卡片
- `components/features/EraSelector/EraTreeNav.tsx` — 树状导航
- `components/features/EraSelector/EraPreviewCard.tsx` — 预览卡片
- `components/features/EraSelector/MobileEraSelector.tsx` — 移动端版本
- `components/features/NewGameModal.tsx` — 集成时代选择
- `components/features/mobile/MobileNewGame.tsx` — 移动端集成

**P2 素材加载**
- `services/eraAssets.ts` — 素材加载服务
- `models/eraAssets.ts` — 素材类型定义

**P4 动态主题**
- `hooks/useEraTheme.ts` — 时代主题Hook
- `styles/eraDecorations.css` — 装饰效果

**P3 素材生成**
- `scripts/generateEraAssets.ts` — AI素材生成脚本
- `data/presets/era/` — 各时代专属预设数据

**P5 世界生成**
- `prompts/runtime/worldGeneration.ts` — 世界生成提示词
- `prompts/runtime/eraNpcRules.ts` — NPC规则

---

## 四、era_assets 目录结构（已更新）

```
data/era_assets/
├── index.html                    # 素材展示页（已更新）
├── ancient_eastern_wuxia/       # ✅ 有素材
│   ├── manifest.json            # ✅ 已创建
│   ├── ancient_01_江南水乡.jpg
│   └── ...
├── ancient_eastern_zhiguai/     # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── ancient_eastern_myth/        # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── ancient_western_greek/        # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── ancient_western_roman/        # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── ancient_western_medieval/    # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── modern_eastern_republic/      # ✅ 有素材
│   └── manifest.json            # ✅ 已创建
├── modern_eastern_meiji_taisho/  # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── modern_western_victorian/     # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── modern_western_jazz_age/      # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── modern_western_postwar/       # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── contemporary_urban/           # ✅ 有素材
│   └── manifest.json            # ✅ 已创建
├── contemporary_rural/           # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── contemporary_post_apocalyptic/ # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── near-future_cyberpunk/        # ✅ 有素材
│   └── manifest.json            # ✅ 已创建
├── near-future_dystopia/         # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── near-future_space_colonization/ # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
├── far-future_space_opera/       # ✅ 有素材
│   └── manifest.json            # ✅ 已创建
├── far-future_cyborg/            # ⏳ 待生成
│   └── manifest.json            # ✅ 已创建
└── far-future_virtual_reality/   # ⏳ 待生成
    └── manifest.json            # ✅ 已创建
```

---

## 五、关键实现细节

### 5.1 eraAssets 服务接口
```typescript
// services/eraAssets.ts
interface EraAssetBundle {
  subEraId: string;
  sceneImages: ImageAsset[];  // 6张场景图
  bgm: AudioAsset | null;
  manifest: EraManifest;
}

function getEraAssets(subEraId: string): Promise<EraAssetBundle>
function preloadEraAssets(subEraId: string): Promise<void>
function clearAssetCache(): void
```

### 5.2 useEraTheme Hook
```typescript
// hooks/useEraTheme.ts
function useEraTheme(eraId: string): {
  colors: EraColors;
  typography: EraTypography;
  uiStyle: UiStyleConfig;
  uiCopy: UiCopyMap;
  decorations: string[];
}
```

### 5.3 5种 UI 装饰效果
- `scanline` — CRT扫描线 overlay
- `grain` — 胶片颗粒 SVG filter
- `ink-bleed` — 水墨晕染 background
- `neon-flicker` — 霓虹闪烁 keyframes
- `holographic` — 全息彩虹 gradient

### 5.4 新建游戏流程
```
开始游戏 → 选择 Epoch → 选择 Era → 选择 SubEra → 选择天赋/背景 → 开始游戏
```

### 5.5 存档兼容性
- 旧存档无 `eraId` 字段 → 默认回退到 `ancient_eastern_wuxia`
- 新存档包含 `设置.eraId` 字段

---

## 六、估计工作量

| 阶段 | 工作量 |
|------|--------|
| P1 时代选择器 UI | 3-4天 |
| P2 素材加载机制 | 2-3天 |
| P3 素材生成管线 | 5-7天（取决于AI生成速度）|
| P4 动态主题 | 2-3天 |
| P5 时代感知世界生成 | 3-4天 |

---

## 七、下一步行动（按优先级）

1. **P1-1**: 创建 `components/features/EraSelector/` 目录和基础文件
2. **P1-2**: 实现 `EraTreeNav` 三级树状导航
3. **P1-3**: 实现 `EraPreviewCard` 预览卡片
4. **P2-1**: 创建 `services/eraAssets.ts` 素材加载服务
5. **P4-1**: 创建 `hooks/useEraTheme.ts` 时代主题Hook
6. **P3-1**: 创建 `scripts/generateEraAssets.ts` 素材生成脚本

---

## 八、manifest.json 格式

```json
{
  "id": "ancient_eastern_zhiguai",
  "status": "pending",
  "images": ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg"],
  "bgm": "zhiguai_bgm.mp3",
  "artStyle": "水墨灵异·幽暗",
  "bgmTags": ["民乐", "古筝", "箫", "灵异", "志怪"]
}
```
