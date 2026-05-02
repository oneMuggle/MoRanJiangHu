# 三层时代类型选择架构 — 完整方案

> 整合差异化分析、架构设计、扩展方案于一体。
> 补充 `era-theme-tree-structure.md`（树结构定义）。
> 相关文档：`era-theme-resource-list.md`（资源清单）。

---

## 一、三层差异化分析

### 1.1 时代层（Epoch）— 宏观世界观翻转

时代层决定**"这是一个什么样的世界"**。不同时代之间差异最大，堪比换一个游戏题材。

| 维度 | 古代 | 近代 | 现代 | 近未来 | 未来 |
|------|------|------|------|------|------|
| **视觉主色** | 墨黑+暗金 | 棕褐+铜锈 | 冷灰+霓虹 | 铬银+电蓝 | 纯白+全息虹彩 |
| **装饰特效** | 墨渗、纸张纹理 | 胶片颗粒、老电影抖动 | CRT 扫描线、霓虹闪烁 | 全息投影残影、数字噪点 | 极简留白、微光渐变 |
| **字体方向** | 楷体/宋体（书法感） | 仿宋/老式印刷体 | 无衬线（现代感） | 等宽/科技感 | 极细无衬线/未来感 |
| **文风** | 金庸式武侠、章回体 | 民国白话、半文半白 | 硬汉派侦探、冷硬派 | 赛博朋克、冷峻技术流 | 太空歌剧、史诗叙事 |
| **货币** | 文/两/贯 | 银元/法币 | 元/比特币 | 信用点/企业券 | 星币/量子信用 |
| **核心玩法** | 武功、江湖、门派 | 武术+枪械过渡、暗杀 | 格斗+黑客、企业斗争 | 义体改造、网络入侵 | 灵能觉醒、星际武道 |
| **BGM 方向** | 古筝、笛箫、琵琶 | 留声机爵士、管弦 | 电子合成、低音鼓点 | 工业电子、低频脉冲 | 太空氛围、合成器浪潮 |

> **差异等级：★★★★★** — 换了时代≈换了游戏题材

### 1.2 纪元层（Era）— 子类型风格切换

纪元层决定**"同一时代下的哪个子类型"**。差异中等，类似同题材下的不同风格路线。

以**古代**为例：

| 维度 | 东方武侠 | 东方志怪 | 东方神话 | 东方修仙 | 东方权谋 |
|------|---------|---------|---------|---------|---------|
| **强调色** | 暗金 `#D4A017` | 幽绿 `#7EC850` | 玄赤 `#B22222` | 紫霄 `#7B68EE` | 玄铁灰 `#5C5C5C` |
| **UI 风格** | 传统武侠 | 志怪灵异 | 神话史诗 | 修仙飘逸 | 宫廷权谋 |
| **UI 文案** | "精力→真气" | "精力→灵力" | "精力→神力" | "精力→灵力" | "精力→心力" |
| | "货币→文" | "货币→纸钱" | "货币→香火" | "货币→灵石" | "货币→俸禄" |
| | "修为→内力" | "修为→妖力" | "修为→神格" | "修为→境界" | "修为→权势" |
| **文风** | 金庸式传统武侠 | 聊斋式志怪笔记 | 山海经式神话 | 修真小说 | 权谋小说 |
| **装饰** | 水墨风 | 墨渗+幽光闪烁 | 金色辉光+祥云纹 | 流光溢彩+灵气粒子 | 暗纹+官印效果 |
| **核心玩法** | 武功对招、江湖恩怨 | 捉妖、驱邪、诡事调查 | 封神、渡劫、神器争夺 | 修炼突破、斗法 | 朝堂博弈、间谍暗战 |

> **差异等级：★★★★☆** — 换了纪元≈同题材换流派（武侠→志怪→修仙）

### 1.3 子纪元层（SubEra）— 细节微调

子纪元层决定**"同一纪元下的具体朝代/时期"**。差异最小，主要是具体细节的替换。

以**古代·东方武侠**为例：

| 维度 | 大唐武侠 | 大宋武侠 | 大明武侠 | 大清的武侠 | 架空武侠 |
|------|---------|---------|---------|-----------|---------|
| **强调色** | 牡丹红 `#E03C31` | 汝窑青 `#7FB3B3` | 明黄 `#FFD700` | 宝石蓝 `#2E5090` | 暗金 `#D4A017`（继承） |
| **字体微调** | 行楷（飘逸） | 瘦金体（精致） | 隶书（庄重） | 满汉合璧 | 默认宋体 |
| **UI 文案** | 同纪元（不额外覆盖） | 同纪元（不额外覆盖） | 同纪元（不额外覆盖） | 同纪元（不额外覆盖） | 同纪元（不额外覆盖） |
| **开局场景** | 长安城外的客栈 | 汴京瓦舍勾栏 | 金陵秦淮河畔 | 紫禁城角楼 | 无名山镇 |
| **文风参考** | 大唐豪侠风 | 宋人笔记风格 | 明代章回体 | 清代侠义公案 | 通用武侠 |
| **差异化来源** | 历史背景、门派原型、势力格局 | 市井文化、理学思想 | 锦衣卫、东厂元素 | 满汉文化碰撞 | 无历史束缚 |

> **差异等级：★★☆☆☆** — 换了子纪元≈同流派换背景（唐朝→宋朝→明朝）

---

## 二、差异化总览矩阵

| 层级 | 视觉差异 | 文案差异 | 玩法差异 | 提示词差异 | 继承行为 |
|------|---------|---------|---------|-----------|---------|
| **时代** | ★★★★★ 完全换色+换特效+换字体 | ★★★★★ 全套文案替换 | ★★★★★ 核心玩法翻转 | ★★★★★ 文风+世界观+角色模板全换 | 父→子逐级传递 |
| **纪元** | ★★★★☆ 强调色+装饰变 | ★★★★☆ 关键文案替换 | ★★★★☆ 战斗/养成系统差异 | ★★★★☆ 文风参考+核心Prompt变体 | 继承时代，覆盖局部 |
| **子纪元** | ★★☆☆☆ 微调强调色 | ★★☆☆☆ 通常继承纪元 | ★★☆☆☆ 开局场景+势力变化 | ★★☆☆☆ 开局场景+文风参考微调 | 继承纪元，微调局部 |

**继承规则：** 每个节点只定义自己独有的部分，缺失字段自动从最近祖先继承。
- 子纪元通常只改 `强调色`、`开局场景`、`文风参考`
- 纪元会覆盖 `UI风格`、`UI文案`、`装饰特效`、`文风参考`
- 时代定义全部字段，作为基线

---

## 三、当前现状与架构设计

### 3.1 已实现的部分

| 模块 | 状态 | 说明 |
|------|------|------|
| 树结构定义 (`models/eraTheme.ts`) | ✅ 完成 | 22个SubEra，含完整metadata |
| 时代配置映射 (`models/system.ts`) | ✅ 完成 | 25条配置（5内置+15新增+5兼容） |
| 主题色预设 (`styles/themes.ts`) | ✅ 完成 | 8套色板 |
| UI文案系统 (`utils/eraUIText.ts`) | ✅ 完成 | 67个key的pub/sub系统 |
| 三层选择器UI (`NewGameWizardContent.tsx`) | ✅ 完成 | 含"详细选择"树导航 |
| 文风提示词 (`prompts/writing/style.ts`) | ⚠️ 部分 | 仅硬编码 ancient_eastern_wuxia |

### 3.2 结构性问题

**问题一：现代/近未来/未来缺失纪元层**

```
contemporary (现代) ← Epoch
  ├── contemporary_urban      ← 直接挂在 Epoch 下，跳过 Era
  ├── contemporary_rural
  └── contemporary_post_apocalyptic

near-future (近未来) ← Epoch
  ├── near-future_cyberpunk
  ├── near-future_dystopia
  └── near-future_space_colonization

far-future (未来) ← Epoch
  ├── far-future_space_opera
  ├── far-future_cyborg
  └── far-future_virtual_reality
```

这 9 个子纪元直接挂在时代节点下，中间没有纪元层做分类，导致：
- 无法在纪元层定义共性（BGM 风格、UI 语气）
- 无法扩展"同一纪元下的变体"

**问题二：古代/近代的纪元覆盖不够深**

| 纪元 | 当前 SubEra 数 | 评估 |
|------|---------------|------|
| 东方古代 | 3（武侠、志怪、神话） | 缺少权谋、修仙 |
| 西方古代 | 3（古希腊、古罗马、中世纪） | 缺少维京、凯尔特 |
| 东方近代 | 2（民国风云、明治·大正） | 缺少晚清 |
| 西方近代 | 5（维多利亚、爵士时代、战后重建） | 较丰富 |

**问题三：子纪元元数据重复**

部分 SubEra 的 colors/typography/uiStyle 与父纪元完全一致，没有发挥差异化能力。

### 3.3 需要补全的架构差距

```
┌─────────────────────────────────────────────────────────────┐
│                      三层时代选择架构                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [选择时代] ──→ Epoch/Era/SubEra 三级树                      │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐                                        │
│  │ ①主题应用层      │  resolveEraNode(id) → CSS变量注入      │
│  │ themes.ts 改造   │  装饰效果CSS实现                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ ②UI文案层        │  设置时代UI文案(node.eraUIText)        │
│  │ eraUIText 联动   │  时代切换时实时触发                     │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ ③提示词层        │  构建通用文风规则(eraConfig)            │
│  │ prompts 注入     │  世界观生成+角色生成+正文               │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ ④新建游戏向导    │  同步所有配置（非仅5内置）              │
│  │ NewGameWizard    │  选择时实时预览主题                      │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ ⑤存档恢复层      │  读档时恢复时代主题+UI文案               │
│  │ loadGame 联动    │  从存档读取时代配置ID并应用               │
│  └─────────────────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 数据流

```
用户选择 SubEra ID
     │
     ├──→ resolveEraNode(id) ──→ 完整 metadata（含继承）
     │         │
     │         ├──→ 应用时代主题到根元素(eraNode.theme)  // 视觉
     │         ├──→ 设置时代UI文案(eraNode.uiCopy)       // 文案
     │         ├──→ 构建通用文风规则(eraNode.promptVars) // 提示词
     │         └──→ 存入 state.视觉配置.时代主题方案       // 持久化
     │
     └──→ 存档时保存 时代配置ID → 读档时重新执行上述流程
```

---

## 四、实施阶段

### Phase 1: 主题应用层改造 — 让视觉真正"不同"

**目标：** 将 `styles/themes.ts` 从 legacy 格式改造为支持 `EraNode` 完整元数据。

**核心改动：**

#### 4.1.1 改造 `应用时代主题到根元素()`

```typescript
// styles/themes.ts — 新增函数
export function 应用时代主题(eraNode: EraNode): void {
  const root = document.documentElement
  const colors = resolveEraColors(eraNode)  // 含继承解析

  // 1. 设置 CSS 变量
  root.style.setProperty('--c-ink-black', colors.墨黑)
  root.style.setProperty('--c-wuxia-gold', colors.强调色)
  root.style.setProperty('--c-paper-white', colors.背景色)
  // ... 其余变量

  // 2. 设置字体
  if (eraNode.typography?.headingFont) {
    root.style.setProperty('--font-heading', eraNode.typography.headingFont)
  }
  if (eraNode.typography?.bodyFont) {
    root.style.setProperty('--font-body', eraNode.typography.bodyFont)
  }

  // 3. 应用装饰特效（新增）
  applyDecorations(eraNode.uiStyle?.decorations ?? [])
}

function applyDecorations(decorations: string[]): void {
  const root = document.documentElement
  // 清除旧装饰
  root.classList.remove('deco-scanline', 'deco-grain', 'deco-ink-bleed',
    'deco-neon-flicker', 'deco-holographic', 'deco-gold-glow',
    'deco-ink-wash', 'deco-cloud-pattern', 'deco-flowing-light')
  // 添加新装饰
  for (const deco of decorations) {
    root.classList.add(`deco-${deco}`)
  }
}
```

#### 4.1.2 新增装饰特效 CSS

```css
/* styles/globals.css — 新增 */

/* 墨渗效果 */
.deco-ink-bleed {
  filter: url(#ink-bleed-svg); /* SVG filter 模拟墨渗 */
}

/* CRT 扫描线 */
.deco-scanline::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

/* 胶片颗粒 */
.deco-grain::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise SVG */
  opacity: 0.08;
  pointer-events: none;
  z-index: 9999;
  animation: grain-shift 0.1s steps(4) infinite;
}

/* 霓虹闪烁 */
.deco-neon-flicker {
  animation: neon-flicker 3s infinite;
}

@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.85; }
}

/* 全息投影残影 */
.deco-holographic {
  text-shadow: 0 0 5px rgba(0, 200, 255, 0.3),
               0 0 10px rgba(0, 200, 255, 0.1);
}

/* 金色辉光 */
.deco-gold-glow {
  text-shadow: 0 0 8px rgba(212, 160, 23, 0.4);
}

/* 流光溢彩 */
.deco-flowing-light {
  background: linear-gradient(90deg, transparent, rgba(123, 104, 238, 0.1), transparent);
  animation: flowing-light 3s ease-in-out infinite;
}

@keyframes flowing-light {
  0%, 100% { background-position: -200% center; }
  50% { background-position: 200% center; }
}
```

#### 4.1.3 调用点

在 `useGame.ts` 中，时代配置变更时调用：

```typescript
// hooks/useGame.ts — 新增 effect
useEffect(() => {
  const eraNode = resolveEraNode(state.视觉配置?.时代主题方案?.时代ID ?? 'ancient_eastern_wuxia')
  应用时代主题(eraNode)
  设置时代UI文案(eraNode.uiCopy ?? {})
}, [state.视觉配置?.时代主题方案?.时代ID])
```

**风险：** CSS 装饰特效可能影响性能（尤其 scanline + grain 叠加）。
**缓解：** 移动端默认禁用 `::after` 伪元素装饰（通过 `@media (min-width: 768px)` 包裹）。

---

### Phase 2: UI 文案实时联动 — 让文字"说出来"

**目标：** 确保时代切换时，所有 UI 文案实时更新。

**现状：** `utils/eraUIText.ts` 仅在初始化时调用 `设置时代UI文案()`。

**改动：**

```typescript
// hooks/useGame.ts — 在时代变更时触发
useEffect(() => {
  const eraNode = resolveEraNode(eraId)
  if (eraNode?.uiCopy) {
    设置时代UI文案(eraNode.uiCopy)
  }
}, [eraId])
```

同时需要通知所有订阅了 UI 文案的组件重新渲染：

```typescript
// utils/eraUIText.ts — 增强
const 文案订阅器 = new Set<() => void>()

export function 订阅时代文案(回调: () => void): () => void {
  文案订阅器.add(回调)
  return () => 文案订阅器.delete(回调)
}

export function 设置时代文案(覆盖: Partial<时代UI文案方案>): void {
  // ... 现有合并逻辑 ...
  文案订阅器.forEach(cb => cb())  // 通知所有订阅者
}
```

在组件中使用：

```typescript
// 示例：任意需要显示动态文案的组件
function 精力标签() {
  const [, forceUpdate] = useState(0)
  useEffect(() => 订阅时代文案(() => forceUpdate(n => n + 1)), [])
  return <span>{获取时代文案('精力标签')}</span>
}
```

**风险：** 频繁 `forceUpdate` 可能影响性能。
**缓解：** 使用 `useSyncExternalStore` 替代手动 forceUpdate（React 19 原生支持）。

---

### Phase 3: 提示词层注入 — 让 AI "知道时代"

**目标：** 在所有 AI 请求中注入时代上下文。

#### 3.1 文风提示词

```typescript
// prompts/writing/style.ts — 改造
export function 构建通用文风规则(eraConfig: 时代配置): string {
  const 文风参考 = 获取时代文风参考(eraConfig)  // 替代硬编码 switch

  return `
## 文风规则
- 参考风格：${文风参考}
- 叙事视角：${eraConfig.核心Prompt变体?.叙事视角 ?? '第三人称有限视角'}
- 对话占比：${eraConfig.核心Prompt变体?.对话占比 ?? '30%-40%'}
- 描写重点：${eraConfig.核心Prompt变体?.描写重点 ?? '动作、环境、心理'}
  `
}

function 获取时代文风参考(config: 时代配置): string {
  if (config.核心Prompt变体?.文风参考) return config.核心Prompt变体.文风参考
  if (config.文风参考描述) return config.文风参考描述
  return '传统武侠风格，注重武打描写和江湖气息'
}
```

#### 3.2 世界观生成注入

```typescript
// hooks/useGame/worldGenerationWorkflow.ts — 新增
function 构建时代世界观提示(eraNode: EraNode): string {
  const colors = resolveEraColors(eraNode)
  return `
## 时代背景
- 时代名称：${eraNode.name}
- 视觉氛围：墨黑=${colors.墨黑}, 强调色=${colors.强调色}, 背景=${colors.背景色}
- 社会形态：${eraNode.promptVars?.社会形态 ?? '江湖门派林立'}
- 科技水平：${eraNode.promptVars?.科技水平 ?? '冷兵器时代'}
- 货币体系：${eraNode.uiCopy?.货币单位 ?? '文'}
- 力量体系：${eraNode.uiCopy?.修为境界 ?? '内力'}
  `
}
```

#### 3.3 角色生成注入

```typescript
// hooks/useGame/ 下角色生成相关文件
function 构建角色时代约束(eraNode: EraNode): string {
  return `
## 角色时代约束
- 穿着风格必须符合${eraNode.name}的审美
- 使用的货币必须是${eraNode.uiCopy?.货币单位 ?? '文'}
- 修为体系必须使用${eraNode.uiCopy?.修为境界 ?? '内力'}
- 称呼应使用${eraNode.uiCopy?.称呼前缀 ?? '少侠'}
  `
}
```

**风险：** prompt 过长可能超出 token 限制。
**缓解：** 时代约束合并到已有的 system prompt 中，不单独追加。

---

### Phase 4: 新建游戏向导 — 让选择"看得见"

**目标：** 用户在向导中选择时代时，实时预览主题效果。

#### 4.1 选择时预览

```typescript
// components/features/NewGame/NewGameWizardContent.tsx
useEffect(() => {
  if (selectedNode && isPreviewMode) {
    应用时代主题预览(selectedNode)  // 临时应用，不持久化
  }
}, [selectedNode, isPreviewMode])
```

#### 4.2 同步所有配置

```typescript
import { 全部时代配置 } from 'models/system'

function 同步时代配置默认值(时代ID: string) {
  const config = 全部时代配置[时代ID]
  if (!config) return
  setFormField('货币模板', config.货币模板)
  setFormField('品质等级名称', config.品质等级名称)
  setFormField('默认开局场景', config.默认开局场景)
}
```

**风险：** 临时预览可能和用户最终选择不一致。
**缓解：** 预览使用 `::before` 伪元素覆盖，确认选择后才真正应用。

---

### Phase 5: 存档恢复层 — 让主题"记住"

**目标：** 读档时自动恢复该存档的时代主题。

```typescript
// hooks/useGame/ 下存档恢复相关
async function 加载游戏(存档: 游戏存档): Promise<void> {
  // ... 现有加载逻辑 ...
  const eraId = 存档.视觉配置?.时代主题方案?.时代配置ID ?? 'ancient_eastern_wuxia'
  const eraNode = resolveEraNode(eraId)
  应用时代主题(eraNode)
  设置时代文案(eraNode.uiCopy ?? {})
}
```

---

## 五、文件变更清单

### 新建文件（4个）

| 文件 | 用途 |
|------|------|
| `styles/era-decorations.css` | 装饰特效 CSS（scanline、grain、ink-bleed 等） |
| `utils/eraThemeResolver.ts` | 时代主题解析工具（resolveEraColors、applyDecorations） |
| `prompts/runtime/eraContext.ts` | 时代上下文提示词（世界观、角色约束） |
| `hooks/useGame/eraThemeSync.ts` | 时代主题同步 hook（选择→应用→持久化） |

### 修改文件（11个）

| 文件 | 改动 |
|------|------|
| `styles/themes.ts` | 改造 `应用时代主题到根元素`，支持 EraNode |
| `styles/globals.css` | 引入 `era-decorations.css` |
| `utils/eraUIText.ts` | 增加订阅通知机制 |
| `hooks/useGame.ts` | 新增时代变更 useEffect |
| `prompts/writing/style.ts` | 移除硬编码 switch，改用动态解析 |
| `hooks/useGame/worldGenerationWorkflow.ts` | 注入时代世界观提示 |
| `components/features/NewGame/NewGameWizardContent.tsx` | 实时预览 + 全量配置同步 |
| `hooks/useGame/saveCoordinator.ts` | 存档时保存/恢复时代主题 |
| `hooks/useGame/openingStoryWorkflow.ts` | 开局故事注入时代约束 |
| `hooks/useGame/systemPromptBuilder.ts` | 运行时 prompt 组装包含时代上下文 |
| `models/eraTheme.ts` | 补充 promptVars 字段 |

---

## 六、扩展方案

> 以下章节描述在当前架构基础上，如何扩展时代、纪元、子纪元的覆盖范围和元数据深度。

### 6.1 时代层（Epoch）扩展

**当前 5 个时代：** 古代 → 近代 → 现代 → 近未来 → 未来

#### 6.1.1 新增：远古（Primordial）

**时间范围：** 史前 ~ 文明诞生前

**定位：** 与"古代"有本质差异——文字未发明、部落制、巫术信仰、创世神话。

| 字段 | 值 |
|------|-----|
| `id` | `primordial` |
| `name` | 远古 |
| `description` | 史前时期，部落文明，文字未诞生，巫术与信仰主导 |
| `colors.ink-black` | `8 6 4`（极暗的焦土色） |
| `colors.primary` | `180 120 60`（陶土色） |
| `colors.secondary` | `100 80 50`（骨色） |
| `colors.accent` | `200 60 30`（火焰色） |
| `colors.paper-white` | `210 195 170`（粗陶色） |
| `typography.页面标题` | `'SimSun', serif`（粗重、原始感） |
| `typography.正文` | `'SimSun', 'Noto Serif SC', serif` |
| `uiStyle.style` | `classical` |
| `uiStyle.tone` | `archaic` |
| `uiStyle.decorations` | `['grain']`（岩画质感） |
| `bgmTags` | `['鼓', '人声吟唱', '原始', '部落']` |
| `artStyle` | 岩画与骨刻风格 |

**纪元与子纪元规划：**

| 纪元 | 子纪元 | 说明 |
|------|--------|------|
| 全球原始文明 | 非洲部落 | 部落战争、巫术、祖先崇拜 |
| 全球原始文明 | 美洲原住民 | 玛雅/阿兹特克/印加文明前夕 |
| 全球原始文明 | 北欧萨满 | 冰原生存、萨满仪式、图腾崇拜 |

#### 6.1.2 新增：后人类（Post-Human）

**时间范围：** 超越星际文明

**定位：** 与"未来"的差异在于——未来还是人类中心叙事，后人类已经超越肉体、物理法则、线性时间。提供从"人"到"非人"的完整叙事弧。

| 字段 | 值 |
|------|-----|
| `id` | `post-human` |
| `name` | 后人类 |
| `description` | 超越肉体与物理法则的时代，意识宇宙、维度旅行、纯能量生命 |
| `colors.ink-black` | `0 0 0`（纯黑，虚空） |
| `colors.primary` | `255 255 255`（纯白，超越光谱） |
| `colors.secondary` | `200 200 255`（冷白微蓝） |
| `colors.accent` | `180 255 200`（生命绿） |
| `colors.paper-white` | `250 250 255` |
| `typography.页面标题` | `'Orbitron', 'Rajdhani', sans-serif`（极简、数学感） |
| `typography.正文` | `'Share Tech Mono', monospace` |
| `uiStyle.style` | `scifi` |
| `uiStyle.tone` | `formal` |
| `uiStyle.decorations` | `['holographic']` |
| `bgmTags` | `['氛围', '极简', '数学', '超越']` |
| `artStyle` | 抽象几何+数学美学 |

**纪元与子纪元规划：**

| 纪元 | 子纪元 | 说明 |
|------|--------|------|
| 意识宇宙 | 纯能量生命 | 脱离物质形态，意识即存在 |
| 意识宇宙 | 维度旅行 | 跨越维度边界的多维叙事 |
| 意识宇宙 | 数学实在论 | 宇宙是数学结构的终极揭示 |

#### 6.1.3 扩展后时代时间线

```
远古 → 古代 → 近代 → 现代 → 近未来 → 未来 → 后人类
7 个时代（原 5 个）
```

### 6.2 纪元层（Era）扩展

#### 6.2.1 已有纪元 — 新增 SubEra

| 所属纪元 | 当前 → 目标 | 新增 SubEra | 关键元数据差异 |
|---------|-----------|-------------|---------------|
| 东方古代 | 3 → 5 | **权谋** | 强调色=玄铁灰，装饰=暗纹+官印，语气=military |
| 东方古代 | 3 → 5 | **修仙** | 强调色=紫霄，装饰=流光溢彩+灵气粒子 |
| 西方古代 | 3 → 5 | **维京** | 强调色=海蓝 `#3A7CA5`，装饰=grain+ink-bleed |
| 西方古代 | 3 → 5 | **凯尔特** | 强调色=森林绿 `#2E7D32`，装饰=grain（苔藓） |
| 东方近代 | 2 → 3 | **晚清** | 强调色=暗红 `#8B0000`，装饰=grain（老照片） |

#### 6.2.2 新建纪元

**现代·东方现代**（重组现有 3 个 SubEra）：
```
contemporary
  └── contemporary_eastern (东方现代)
        ├── contemporary_urban      (都市)
        ├── contemporary_rural      (乡村)
        └── contemporary_post_apocalyptic (末日废土)
  └── contemporary_western (西方现代)
        ├── contemporary_noir        (黑色犯罪) ← 新
        └── contemporary_hippie      (嬉皮士文化) ← 新
  └── contemporary_apocalypse (末日纪元) ← 新纪元
        ├── contemporary_zombie       (丧尸危机) ← 新
        ├── contemporary_extreme_cold (极寒末日) ← 新
        ├── contemporary_biohazard    (生化危机) ← 新
        └── contemporary_nuclear_winter (核冬天) ← 新
```

**近未来·技术 dystopia + 太空扩张**（重组现有 3 个 SubEra）：
```
near-future
  └── near-future_tech_dystopia
        ├── near-future_cyberpunk    (赛博朋克)
        └── near-future_dystopia     (反乌托邦)
  └── near-future_space_expansion
        └── near-future_space_colonization (太空殖民)
```

**未来·星际文明 + 数字超越**（重组现有 3 个 SubEra）：
```
far-future
  └── far-future_interstellar
        └── far-future_space_opera (星际科幻)
  └── far-future_digital_transcendence
        ├── far-future_cyborg        (赛博格)
        └── far-future_virtual_reality (虚拟现实)
```

**远古·全球原始文明**（新建 3 个 SubEra）：
```
primordial
  └── primordial_global
        ├── primordial_african       (非洲部落)
        ├── primordial_americas      (美洲原住民)
        └── primordial_norse_saman   (北欧萨满)
```

#### 6.2.3 新增纪元：现代·末日纪元

**定位：** 与"东方现代"的都市/乡村/废土不同——末日纪元聚焦全球性灾难后的极端生存环境，每个子纪元代表一种灾难类型，核心叙事是"人类在灭绝边缘的挣扎与重建"。

| SubEra | 差异化说明 | 关键元数据差异 |
|--------|-----------|---------------|
| **丧尸危机** | 僵尸病毒爆发，幸存者据点防守，人性与感染恐惧 | 强调色=腐肉绿 `#4A7C59`，装饰=grain（血渍质感），BGM=低沉鼓点+尖叫，conflictTypes=['人尸对抗','幸存者内斗','资源争夺','感染恐惧'] |
| **极寒末日** | 全球冰河期，冰原生存，保暖与热量是核心资源 | 强调色=冰蓝 `#A8D8EA`，装饰=scanline（风雪效果），BGM=风笛+低频环境音，conflictTypes=['极端天气','资源短缺','避难所争夺','人性考验'] |
| **生化危机** | 实验室泄漏，变异生物，防毒面具与隔离区 | 强调色=生化黄 `#FFD600`，装饰=holographic（危险警示），BGM=电子警报+环境低频，conflictTypes=['病毒扩散','变异威胁','实验室调查','隔离区求生'] |
| **核冬天** | 核战后废土，辐射变异，地下掩体与地表探索 | 强调色=辐射橙 `#FF8C00`，装饰=grain+scanline（辐射尘），BGM=盖革计数器声+环境低频，conflictTypes=['辐射危害','领地争夺','遗迹探索','重建文明'] |

**末日纪元（Era 级别）共享元数据：**
```
contemporary_apocalypse (末日纪元)
  colors.accent: 根据 SubEra 动态变化（腐肉绿/冰蓝/生化黄/辐射橙）
  uiStyle.decorations: ['grain', 'scanline'] 共用
  bgmTags: ['末日', '生存', '紧张', '低频']
  uiCopy.修为境界: '生存等级'
  uiCopy.货币单位: '物资点'
  uiCopy.称呼前缀: '幸存者'
```

#### 6.2.3 扩展后纪元列表

| 序号 | 所属时代 | 纪元 | 子纪元数 | 变化 |
|------|---------|------|---------|------|
| 1 | 远古 | 全球原始文明 | 3 | 新 |
| 2 | 古代 | 东方古代 | 5 | +2（权谋、修仙） |
| 3 | 古代 | 西方古代 | 5 | +2（维京、凯尔特） |
| 4 | 近代 | 东方近代 | 3 | +1（晚清） |
| 5 | 近代 | 西方近代 | 5 | 不变 |
| 6 | 现代 | 东方现代 | 3 | 重组现有 |
| 7 | 现代 | 西方现代 | 2 | 新 |
| 8 | 现代 | 末日纪元 | 4 | 新 |
| 9 | 近未来 | 技术 dystopia | 2 | 重组现有 |
| 10 | 近未来 | 太空扩张 | 1 | 重组现有 |
| 11 | 未来 | 星际文明 | 1 | 重组现有 |
| 12 | 未来 | 数字超越 | 2 | 重组现有 |
| 13 | 后人类 | 意识宇宙 | 3 | 新 |

**纪元数：4 → 13**（+9 个）
**子纪元数：22 → 36**（+14 个）

### 6.3 子纪元层（SubEra）元数据扩展

#### 6.3.1 当前元数据字段（7 个）

| 字段 | 类型 | 说明 |
|------|------|------|
| `colors` | EraColors | 配色方案 |
| `typography` | EraTypography | 字体 |
| `uiStyle` | EraUIStyle | UI 风格+装饰 |
| `bgmTags` | string[] | BGM 标签 |
| `artStyle` | string | 美术风格参考 |
| `description` | string | 描述 |
| `uiCopy` | Record<string,string> | UI 文案 |

#### 6.3.2 新增元数据字段（+5 个）

**`promptVars` — 提示词变量**
```typescript
export interface EraPromptVars {
    社会形态: string;        // 用于世界观生成
    科技水平: string;        // 决定可用技术/物品
    力量体系: string;        // 内力/灵力/神格/义体/灵能
    叙事视角: string;        // 叙事视角偏好
    描写重点: string;        // 描写重点
    对话占比: string;        // 对话占比建议
    禁忌: string[];          // 时代禁忌（告诉 AI 不要写什么）
}
```

**`openingScenes` — 开局场景池**
```typescript
export interface EraOpeningScene {
    id: string;
    name: string;
    description: string;
    imageId?: string;        // 对应场景图片的 asset ID
}
```

**`characterArchetypes` — 角色原型模板**
```typescript
export interface EraCharacterArchetype {
    id: string;
    name: string;
    description: string;
    appearance: string;      // 典型穿着/外观
    abilities: string[];     // 典型能力标签
}
```

**`writingSamples` — 文风示例段落**
```typescript
writingSamples?: string[];  // 2-3 段典型文风的样例文字
```

**`conflictTypes` — 核心冲突类型**
```typescript
conflictTypes?: string[];  // 该时代的核心冲突类型
```

#### 6.3.3 示例

```typescript
// 武侠
promptVars: {
    社会形态: '江湖门派林立，朝廷与武林并存',
    科技水平: '冷兵器时代，无火器',
    力量体系: '内力、武功招式、轻功',
    叙事视角: '第三人称有限视角',
    描写重点: '武打动作、环境意境、人物神态',
    对话占比: '30%-40%',
    禁忌: ['现代科技词汇', '枪械', '手机', '网络'],
}

writingSamples: [
    '那人一袭青衣，手中长剑斜指地面，剑尖微颤，似有风过。他并未开口，但那一双眸子已如寒星般锁定对手。',
    '客栈里人声鼎沸，角落里一个独坐的汉子却仿佛与世隔绝。他面前的酒碗已空了三巡，手始终按在腰间的刀柄上。',
]

openingScenes: [
    { id: 'inn_outside_changan', name: '长安城外客栈', description: '黄土路上的一家小客栈，门外拴着几匹瘦马' },
    { id: 'luoyang_ring', name: '洛阳城擂台', description: '城中广场搭起的比武擂台，围观者众' },
]

characterArchetypes: [
    { id: 'swordsman', name: '剑客', description: '浪迹天涯的剑客', appearance: '青衣佩剑，眼神凌厉', abilities: ['剑法', '轻功'] },
]

conflictTypes: ['门派之争', '武林争霸', '恩怨情仇', '正邪对立'],
```

#### 6.3.4 扩展后元数据总览

| # | 字段 | 层级 | 说明 |
|---|------|------|------|
| 1 | `colors` | 全层 | 配色方案 |
| 2 | `typography` | 全层 | 字体 |
| 3 | `uiStyle` | 全层 | UI 风格+装饰 |
| 4 | `bgmTags` | 全层 | BGM 标签 |
| 5 | `artStyle` | 全层 | 美术风格参考 |
| 6 | `description` | 全层 | 描述 |
| 7 | `uiCopy` | SubEra | UI 文案 |
| 8 | `promptVars` | 全层 | **提示词变量** |
| 9 | `openingScenes` | SubEra | **开局场景池** |
| 10 | `characterArchetypes` | SubEra | **角色原型模板** |
| 11 | `writingSamples` | SubEra | **文风示例段落** |
| 12 | `conflictTypes` | SubEra | **核心冲突类型** |

---

## 七、扩展实施路线图

| Phase | 内容 | 影响文件 | 风险 |
|-------|------|---------|------|
| **A** | 元数据扩展：新增 5 个接口，补充现有 SubEra 的 `promptVars`/`conflictTypes` | `models/eraTheme.ts` | 低 |
| **B** | 树结构重组：新建 7 个纪元，迁移 9 个 SubEra，新增 2 个 Epoch | `models/eraTheme.ts` | 中 |
| **C** | 新 SubEra 定义：权谋/修仙/维京/凯尔特/晚清/黑色犯罪/嬉皮士/丧尸/极寒/生化危机/核冬天等 | `models/eraTheme.ts` | 低 |
| **D** | 提示词层接入：`writingSamples` few-shot、`promptVars` 注入世界观 | `prompts/` + `hooks/useGame/` | 中 |
| **E** | 资源需求更新：根据扩展后 SubEra 数量更新资源清单 | `era-theme-resource-list.md` | 低 |

---

## 八、扩展后结构总览

```
远古 (Primordial)
  └── 全球原始文明
        ├── 非洲部落
        ├── 美洲原住民
        └── 北欧萨满

古代 (Ancient)
  ├── 东方古代
  │     ├── 武侠
  │     ├── 志怪
  │     ├── 神话
  │     ├── 权谋          ← 新
  │     └── 修仙          ← 新
  └── 西方古代
        ├── 古希腊
        ├── 古罗马
        ├── 中世纪欧洲
        ├── 维京          ← 新
        └── 凯尔特        ← 新

近代 (Modern)
  ├── 东方近代
  │     ├── 民国风云
  │     ├── 明治·大正
  │     └── 晚清          ← 新
  └── 西方近代
        ├── 维多利亚时代
        ├── 爵士时代
        └── 战后重建

现代 (Contemporary)
  ├── 东方现代
  │     ├── 都市
  │     ├── 乡村
  │     └── 末日废土
  └── 西方现代
        ├── 黑色犯罪       ← 新
        └── 嬉皮士文化     ← 新
  └── 末日纪元              ← 新纪元
        ├── 丧尸危机        ← 新
        ├── 极寒末日        ← 新
        ├── 生化危机        ← 新
        └── 核冬天          ← 新

近未来 (Near Future)
  ├── 技术 dystopia
  │     ├── 赛博朋克
  │     └── 反乌托邦
  └── 太空扩张
        └── 太空殖民

未来 (Far Future)
  ├── 星际文明
  │     └── 星际科幻
  └── 数字超越
        ├── 赛博格
        └── 虚拟现实

后人类 (Post-Human)
  └── 意识宇宙
        ├── 纯能量生命     ← 新
        ├── 维度旅行       ← 新
        └── 数学实在论     ← 新
```

**扩展后总计：7 时代 × 13 纪元 × 36 子纪元**

---

## 九、风险评估

| 风险 | 等级 | 影响 | 缓解措施 |
|------|------|------|---------|
| CSS 装饰性能问题 | 中 | 移动端掉帧 | 移动端禁用 ::after 装饰 |
| Prompt 超长 | 低 | AI 截断 | 合并到已有 system prompt |
| 旧存档缺少时代ID | 中 | 读档后无主题 | 默认回退 ancient_eastern_wuxia |
| 时代切换时组件未重渲染 | 中 | UI 文案不更新 | 使用 useSyncExternalStore |
| 22 套子时代数据不完整 | 低 | 部分子时代回退到父级 | 继承机制兜底 |
| 树结构重组破坏 parent 关系 | 中 | 查找函数返回 null | 全面测试 getEraById/resolveEraNode |
| 新增 SubEra 元数据不完整 | 低 | 继承回退到父级 | 继承机制兜底 |

---

## 十、验收清单

- [ ] 选择不同 Epoch 时，页面主色调、字体、装饰特效全部切换
- [ ] 选择不同 Era 时，强调色、UI 文案（精力/货币/修为）、装饰效果变化
- [ ] 选择不同 SubEra 时，开局场景、文风参考微调
- [ ] 新建游戏向导中，选择时代时可预览主题效果
- [ ] 保存游戏后，重新加载能正确恢复时代主题
- [ ] 旧存档（无时代ID）加载时回退到默认主题不报错
- [ ] 移动端装饰特效不造成性能问题
- [ ] 所有 AI 请求中包含正确的时代上下文约束
- [ ] 扩展后的远古/后人类时代可正常选择并应用主题
- [ ] 新增的 promptVars/openingScenes/characterArchetypes/writingSamples/conflictTypes 在 AI 生成中生效
