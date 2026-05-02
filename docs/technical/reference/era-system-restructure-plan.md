# 墨色江湖·时代体系重构方案

## 当前问题

现有 `eraTheme.ts` 将"时代时间轴"和"文化空间/类型"混为扁平列表，每一项都是一个"时代+类型"的固定捆绑：

```
era_ancient_wuxia       → 古代武侠（时代=古代，类型=武侠）
era_republic_modern     → 近代民国（时代=近代，类型=民国）
era_modern_urban        → 现代都市（时代=现代，类型=都市）
era_cyberpunk_nearfuture → 近未来赛博（时代=近未来，类型=赛博）
era_scifi_future        → 未来科幻（时代=未来，类型=科幻）
```

问题：
1. **维度混乱**：武侠/民国/都市/赛博/科幻 —— 其中"武侠"是文化类型，"民国"是历史时期，"赛博"又是未来风格
2. **难以扩展**：想加一个"古代西方/中世纪"或"近代欧洲/维多利亚"，需要新建 era 并复制大量重复元数据
3. **素材与类型绑定**：图片/BGM 只能属于单一 era，无法跨 era 复用（如"武侠"风格的通用BGM）

---

## 重构方案：三层树状结构

### 层级设计

```
┌─────────────────────────────────────────────────┐
│                  META LAYER                     │
│            元数据：配色/字体/UI/特效              │
├─────────────────────────────────────────────────┤
│               HIERARCHY LAYER                   │
│        Epoch → Era → Sub-Era (树状层级)         │
├─────────────────────────────────────────────────┤
│                CONTENT LAYER                    │
│          世界观/场景/角色/事件（游戏内容）          │
└─────────────────────────────────────────────────┘
```

### 完整分类体系

```
【第一层：Epoch — 按时间线（时代）】

├── ancient（古代）
│   ├── eastern（东方古代）
│   │   ├── wuxia（武侠）← 已有，保留并完善
│   │   ├── zhiguai（志怪）← 新增：聊斋式神怪故事
│   │   └── myth（神话）← 新增：中国上古神话/封神演义
│   │
│   └── western（西方古代）
│       ├── greek（古希腊）← 新增
│       ├── roman（古罗马）← 新增
│       └── medieval（欧洲中世纪）← 新增
│
├── modern（近代）
│   ├── eastern（东方近代）
│   │   ├── republic（民国风云）← 已有，保留并完善
│   │   └── meiji-taisho（明治·大正日本）← 新增
│   │
│   └── western（西方近代）
│       ├── victorian（维多利亚时代）← 新增
│       ├── jazz-age（爵士时代/咆哮二十年代）← 新增
│       └── post-war（战后重建/1940s-1950s）← 新增
│
├── contemporary（现代）
│   ├── urban（都市）← 已有，保留并完善
│   ├── rural（乡村）← 新增
│   └── post-apocalyptic（末日/废土）← 新增
│
├── near-future（近未来）
│   ├── cyberpunk（赛博朋克）← 已有，保留并完善
│   ├── dystopia（反乌托邦）← 新增
│   └── space-colonization（太空殖民）← 新增
│
└── far-future（未来）
    ├── space-opera（星际科幻）← 已有，保留并完善
    ├── cyborg（赛博格）← 新增（偏重义体改造，与赛博朋克区分）
    └── virtual-reality（虚拟现实/元宇宙）← 新增
```

### 每个节点可挂载的元数据

| 元数据维度 | 说明 |
|-----------|------|
| `id` | 全局唯一标识符，格式：`epoch_era_subera`（如 `ancient_eastern_wuxia`） |
| `name` | 显示名称（中文） |
| `parent` | 父节点路径 |
| `depth` | 层级深度（0=Epoch, 1=Era, 2=SubEra） |
| `colors` | 配色方案 |
| `typography` | 字体族 |
| `uiStyle` | UI文案风格标签 |
| `bgmTags` | BGM风格标签数组 |
| `artStyle` | 美术风格参考 |
| `decorations` | 装饰特效（扫描线/颗粒/水墨晕染/霓虹闪烁） |
| `description` | 描述 |
| `icon` | 图标或标志物 |

---

## TypeScript 接口设计方案

```typescript
// === 节点元数据 ===

interface EraColors {
  'ink-black': string;      // RGB "x x x"
  'ink-gray': string;
  primary: string;
  'primary-dark': string;
  secondary: string;
  accent: string;
  'paper-white': string;
}

interface EraTypography {
  页面标题: string;
  正文: string;
  等宽: string;
}

type UIDecoration = 'scanline' | 'grain' | 'ink-bleed' | 'neon-flicker' | 'holographic';

interface EraUIStyle {
  style: 'classical' | 'modern' | 'tech' | 'retro' | 'scifi';
  tone: 'formal' | 'casual' | 'archaic' | 'military' | 'commercial';
  decorations: UIDecoration[];
}

// === 树状层级接口 ===

type EpochDepth = 0 | 1 | 2;

interface EraNode {
  id: string;               // 全局唯一，如 "ancient_eastern_wuxia"
  name: string;             // "古代东方·武侠"
  depth: EpochDepth;        // 0=Epoch, 1=Era, 2=SubEra
  parent: string | null;    // 父节点ID，根节点为null
  
  // 元数据（叶子节点必有，父节点可继承或覆盖）
  colors?: EraColors;
  typography?: EraTypography;
  uiStyle?: EraUIStyle;
  bgmTags?: string[];
  artStyle?: string;
  description?: string;
  
  // 子节点
  children?: EraNode[];
}

// === 查找与继承 ===

interface EraInheritance {
  resolvedColors: EraColors;
  resolvedTypography: EraTypography;
  resolvedUIStyle: EraUIStyle;
  resolvedDecorations: UIDecoration[];
  sourceNodes: string[];  // 每个维度最终取自哪个节点
}
```

---

## 继承规则

当子节点未定义某个元数据时，向上追溯最近的父节点定义：

```
ancient_eastern_wuxia.colors → 无 → 查 ancient_eastern.colors → 无 → 查 ancient.colors → 有 → 继承 ancient 的配色
```

这样：
- `Epoch` 层定义全局基调（如"古代"统一暖色调）
- `Era` 层定义文化圈共性（如"东方古代"统一水墨风格）
- `SubEra` 层只定义自己独有的（如"武侠"独有的金色点缀）

---

## 现有5个时代的映射

| 现有ID | 新路径 | 变化 |
|--------|--------|------|
| `era_ancient_wuxia` | `ancient/eastern/wuxia` | ID格式改变，扩展元数据 |
| `era_republic_modern` | `modern/eastern/republic` | ID格式改变，扩展元数据 |
| `era_modern_urban` | `contemporary/urban` | ID格式改变，扩展元数据 |
| `era_cyberpunk_nearfuture` | `near-future/cyberpunk` | ID格式改变，扩展元数据 |
| `era_scifi_future` | `far-future/space-opera` | ID格式改变，扩展元数据 |

---

## 实施步骤

### Step 1: 设计数据模型
- 重构 `eraTheme.ts` 的 TypeScript 接口，支持树状层级
- 实现继承解析函数 `resolveEraNode(id): EraInheritance`
- 保持向后兼容：提供 `getEraById(id)` 兼容旧接口

### Step 2: 迁移现有数据
- 将现有5个 era 的数据迁移到新树状结构
- 补充各父节点（Epoch/Era层）的元数据默认值
- 更新 `eraTheme.ts` 导出

### Step 3: 扩展内容
- 在新结构下补充新增节点的设计：
  - 武侠、志怪、神话的差异化设计
  - 民国、维多利亚、爵士时代的差异化设计
  - 赛博朋克与反乌托邦的差异化设计
  - 等等

---

## 文件位置

- 现有文件：`/home/ubuntu/project/MoRanJiangHu/models/eraTheme.ts`
- 备份原文件后再修改
- 建议同时更新 `src/types/era.ts` 如果存在相关类型定义
