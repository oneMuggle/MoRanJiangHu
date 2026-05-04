# 里模式阶段系统方案

**日期：** 2026-05-04
**状态：** 待评审
**优先级：** 高

---

## Context

里模式当前强度体系（微暗/暧昧/露骨）控制的是**内容描写的直白程度**（prompt 注入量），但缺乏对 NPC **心理与行为反应模式**的控制。用户希望在里模式中引入"阶段"维度，定义 NPC 面对色情行为时的心理态度和行为倾向，类似 AV 剧情中常见的角色反应阶段。

---

## 需求重述

### 新增"阶段"维度（与现有"强度"正交）

| 阶段 | NPC 心理反应 | NPC 行为表现 | 参考元素 |
|------|-------------|-------------|---------|
| **平然** | 大幅降低防备心，将色情行为视为"正常" | 不抗拒、不制止，心理上觉得理所当然，但生理反应保持正常人水平 | 日常化、自然接受 |
| **羞耻** | 感到羞耻、尴尬、不好意思 | 不产生抗拒/反感/制止等过激行为，会害羞但配合 | 面红耳赤、欲拒还迎 |
| **欲望** | 主动渴望色情行为 | 主动寻求、引导、暗示主角进行亲密行为 | 痴女、主动诱惑 |

### 共同约束

- 所有阶段都维持正常社会准则和行为规范
- 色情行为主要在私密/不会被发现的环境发生
- 不会大张旗鼓引起所有人注意
- 不影响公共场合的正常社交表现

### 维度关系

- **强度**（微暗/暧昧/露骨）：控制 AI 描写 NSFW 内容的直白程度（已有）
- **阶段**（平然/羞耻/欲望）：控制 NPC 对 NSFW 行为的心理态度与行为倾向（新增）

两者正交，互不影响。例如"露骨+平然"=直白描写但 NPC 觉得正常；"暧昧+欲望"=含蓄描写但 NPC 主动引导。

---

## 实施阶段

### Phase 1: 数据模型扩展

#### 1.1 新增阶段类型定义

```typescript
// models/eraTheme/types.ts — 新增
export type LiModeStage = '平然' | '羞耻' | '欲望';

// models/system.ts — 游戏设置结构 扩展
子纪元里模式阶段?: Record<string, '平然' | '羞耻' | '欲望'>;
// 按 eraId 存储，默认 '羞耻'

// models/social.ts — NPC结构 扩展
里模式阶段?: '平然' | '羞耻' | '欲望';
// NPC 个体可覆盖全局阶段设置，默认跟随全局
```

#### 1.2 每个增强版 liMode 增加阶段规则字段

```typescript
// models/eraTheme/types.ts — EraLiModeEnhanced 扩展
stageRules?: {
    平然: string;  // 平然阶段的 AI 行为引导规则
    羞耻: string;  // 羞耻阶段的 AI 行为引导规则
    欲望: string;  // 欲望阶段的 AI 行为引导规则
};
```

**涉及文件：**
| 文件 | 修改 |
|------|------|
| `models/eraTheme/types.ts` | 新增 `LiModeStage` 类型 + `EraLiModeEnhanced.stageRules` |
| `models/system.ts` | `游戏设置结构` 增加 `子纪元里模式阶段` |
| `models/social.ts` | `NPC结构` 增加 `里模式阶段` 字段 |

---

### Phase 2: 阶段规则数据填充

为 31 个 SubEra 的增强版 liMode 各补充 `stageRules` 字段。由于每个阶段的规则描述具有通用性（与时代主题相关度低），可以设计一套**通用阶段规则模板**，在 `filterByStage` 中按阶段选择对应规则，各 SubEra 可选择性覆盖。

**通用阶段规则模板：**

| 阶段 | 规则要点 |
|------|---------|
| **平然** | NPC 对亲密行为心理接受度高，视为日常互动的一部分。不会产生道德负担或心理冲突。生理反应（心跳加速、脸红等）保持正常人的自然反应。不会在公共场合主动表现，但私下环境中不会抗拒或制止。 |
| **羞耻** | NPC 对亲密行为感到害羞、尴尬、不好意思，但不会产生反感、抗拒或制止行为。可能会有言语上的推脱（"不要这样"），但行为上配合。面红耳赤、躲避眼神、小声说话等表现。 |
| **欲望** | NPC 主动渴望并引导亲密行为。会通过暗示、挑逗、肢体接触等方式主动出击。参考"痴女"元素：故意靠近、制造独处机会、言语撩拨。但仅限于私密环境，公共场合维持正常社交。 |

**涉及文件：**
| 文件 | 修改 |
|------|------|
| `prompts/runtime/eraLiMode.ts` | 新增 `构建里模式阶段注入` 函数 + 通用阶段规则常量 |
| `data/newGamePresets.ts` | 默认阶段预设（'羞耻'） |

---

### Phase 3: Prompt 注入链路

#### 3.1 阶段过滤函数

在 `eraLiMode.ts` 中新增：

```typescript
export function 构建里模式阶段注入(
    eraId: string | null | undefined,
    stage: LiModeStage,
    enabled: boolean
): string | null
```

- 当 liMode 开启时，根据当前阶段注入对应行为规则
- 规则内容引导 AI 在该阶段下 NPC 的心理与行为模式

#### 3.2 系统集成

在 `systemPromptBuilder.ts` 中：
- 从 `gameConfig.子纪元里模式阶段[eraId]` 读取阶段
- 调用 `构建里模式阶段注入` 追加到 prompt
- 在 NPC 上下文构建中也传入阶段信息，供个体 NPC 覆盖

**涉及文件：**
| 文件 | 修改 |
|------|------|
| `prompts/runtime/eraLiMode.ts` | `构建里模式阶段注入` 函数 |
| `hooks/useGame/systemPromptBuilder.ts` | 阶段参数读取 + 注入调用 |
| `hooks/useGame/npcContext.ts` | NPC 个体阶段注入（可选） |

---

### Phase 4: UI 体系

#### 4.1 NewGameWizard 阶段选择器

在新建游戏向导中，里模式强度选择器下方增加阶段选择器（三档按钮样式）。

#### 4.2 GameSettings 阶段选择器

在游戏设置面板中，里模式强度选择器下方增加阶段选择器。

#### 4.3 TopBar 阶段显示

在 TopBar 已有的里模式徽章中，增加阶段信息。显示格式从"里·暧昧"扩展为"里·羞耻"（阶段比强度更重要，优先展示阶段，强度可放在悬浮详情中）。

**涉及文件：**
| 文件 | 修改 |
|------|------|
| `components/features/NewGame/NewGameWizardContent.tsx` | 阶段选择器 |
| `components/features/Settings/GameSettings.tsx` | 阶段选择器 |
| `components/layout/TopBar.tsx` | 徽章扩展显示阶段 |

---

## 涉及核心文件总览

| 文件 | 涉及阶段 | 修改内容 |
|------|---------|---------|
| `models/eraTheme/types.ts` | Phase 1 | `LiModeStage` 类型 + `stageRules` 字段 |
| `models/system.ts` | Phase 1 | `游戏设置结构` 增加 `子纪元里模式阶段` |
| `models/social.ts` | Phase 1 | `NPC结构` 增加 `里模式阶段` |
| `prompts/runtime/eraLiMode.ts` | Phase 2-3 | 阶段规则常量 + `构建里模式阶段注入` |
| `hooks/useGame/systemPromptBuilder.ts` | Phase 3 | 阶段参数传递 |
| `hooks/useGame/npcContext.ts` | Phase 3 | NPC 个体阶段注入 |
| `components/features/NewGame/NewGameWizardContent.tsx` | Phase 4 | UI 阶段选择器 |
| `components/features/Settings/GameSettings.tsx` | Phase 4 | UI 阶段选择器 |
| `components/layout/TopBar.tsx` | Phase 4 | 徽章扩展 |
| `data/newGamePresets.ts` | Phase 2 | 默认阶段预设 |

---

## 风险评估

| 风险 | 等级 | 应对 |
|------|------|------|
| 阶段规则与强度规则可能产生语义冲突 | 中 | 阶段管"行为/心理"，强度管"描写尺度"，两者正交，prompt 中分开注入 |
| 阶段规则编写质量 | 中 | 先出通用模板验证效果，SubEra 覆盖按需逐步补充 |
| 旧存档兼容性 | 低 | 所有新字段 optional，默认值 '羞耻'，不影响旧存档 |
| TopBar 空间拥挤 | 低 | 徽章文字精简，强度信息移至悬浮详情 |

---

## 预计工作量

| 阶段 | 工作量 | 说明 |
|------|--------|------|
| Phase 1 | 低 | 类型定义 + 模型字段扩展（~3 文件） |
| Phase 2 | 中 | 通用阶段规则编写（~1 文件） |
| Phase 3 | 低 | Prompt 注入函数 + 系统提示词集成（~3 文件） |
| Phase 4 | 低 | UI 选择器复用已有样式（~3 文件） |

---

## 实施顺序

```
Phase 1（类型/模型）
  ↓
Phase 2（阶段规则编写 — 通用模板优先）
  ↓
Phase 3（Prompt 注入链路）
  ↓
Phase 4（UI 选择器 + 状态显示）
```

---

## 实施进度

- [x] Phase 1：数据模型扩展
  - [x] `models/eraTheme/types.ts` — `LiModeStage` 类型 + `EraLiModeEnhanced.stageRules`
  - [x] `models/system.ts` — `游戏设置结构` 增加 `子纪元里模式阶段`
  - [x] `models/social.ts` — `NPC结构` 增加 `里模式阶段`
- [x] Phase 2：阶段规则数据填充
  - [x] `prompts/runtime/eraLiMode.ts` — 通用阶段规则常量 `DEFAULT_STAGE_RULES`
  - [x] `构建里模式阶段注入` 函数（优先 SubEra 自定义 stageRules，回退通用模板）
- [x] Phase 3：Prompt 注入链路
  - [x] `hooks/useGame/systemPromptBuilder.ts` — 阶段参数读取 + 注入调用
  - [x] `hooks/useGame/npcContext.ts` — NPC 个体阶段注入（优先 NPC 个体，回退全局）
- [x] Phase 4：UI 体系
  - [x] `NewGameWizardContent.tsx` — 阶段选择器（平然/羞耻/欲望 三档按钮）
  - [x] `useNewGameWizardState.ts` — 阶段状态 + 持久化
  - [x] `GameSettings.tsx` — 设置面板阶段选择器
  - [x] `TopBar.tsx` — 徽章显示格式改为"阶段·强度"（如"羞耻·暧昧"）
  - [x] `App.tsx` — 传递 `子纪元里模式阶段` 到 TopBar
