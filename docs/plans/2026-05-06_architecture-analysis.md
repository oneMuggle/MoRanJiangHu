# 墨染江湖架构分析与重构方案

> 生成时间：2026-05-06
> 分析方式：多专家角色并行协作分析（5个子Agent）

---

## 一、项目规模概览

| 指标 | 数值 |
|------|------|
| 总文件数 | ~329 (不含 node_modules) |
| 总代码行数 | ~99k 行 TypeScript/TSX |
| 大型文件 (>500行) | 47 个 |
| 最大单体文件 | `hooks/useGame/` 150个文件，共 41,793行 |

---

## 二、当前架构核心矛盾

### 2.1 God Hook 架构

```
App.tsx (2115行)
    └── useGame() [唯一数据源]
            ├── state: 角色、环境、社交、世界、战斗、剧情、历史...
            ├── setters: 30+ 状态修改器
            └── actions: handleSend、handleStop 等 30+ 动作

hooks/useGame/ (150文件, 41,793行)
    ├── systemPromptBuilder.ts (1,733行)
    ├── campusNSFWEngine.ts (1,601行)
    ├── openingStoryWorkflow.ts (1,466行)
    ├── stateTransforms.ts (1,234行)
    └── ... + 146个平级文件
```

### 2.2 问题本质

所有业务逻辑都围绕 `useGame` hook 运行，没有任何中间层抽象。UI 层（App.tsx）直接依赖整个游戏状态，业务逻辑和视图耦合。

---

## 三、主要问题清单

### 问题一：hooks/useGame/ 扁平化严重

**现状**：
- 仅 4 个子目录（config、image、saveLoad、sendWorkflow）
- 142 个文件散落顶层，无功能分组
- BDSM(7文件)、NSFW(3文件)、变量系统(11文件) 全堆在一起

**建议**：按功能域创建分组目录

```
hooks/useGame/
├── _workflows/      # 核心工作流
├── _state/          # 状态管理
├── _memory/         # 记忆系统 (5文件)
├── _bdsm/           # BDSM功能隔离 (7文件)
├── _nsfw/           # NSFW功能隔离 (3文件)
├── _variable/        # 变量生成系统 (11文件)
├── _world/          # 世界系统 (3文件)
└── _shared/         # 共享工具
```

---

### 问题二：models/system.ts (1780行) 职责膨胀

| 混合的职责 | 建议 |
|-----------|------|
| 文生图配置 | 拆分到 `image-config.ts` |
| API供应商类型 | 拆分到 `ai-config.ts` |
| 内置时代配置 | 与 `eraTheme/` 冲突，需统一 |
| 游戏设置/记忆配置 | 拆分到 `game-settings.ts` |

---

### 问题三：两个 GameMaster 系统并存

| 路径 | 定位 |
|------|------|
| `services/ai/gameMaster/` | AI服务下的GameMaster |
| `services/gameMaster/` | 独立的GameMaster |

两者职责边界模糊，存在重复建设。

---

### 问题四：models/ 重复类型定义

| 重复文件对 | 问题 |
|-----------|------|
| `models/worldbook.ts` vs `models/game/worldbook.ts` | 完全相同 |
| `models/item.ts` vs `models/domain/item.ts` | 部分重复 |
| `models/kungfu.ts` vs `models/domain/kungfu.ts` | B多里修描述 |

`domain/` 是后来引入的重构层，但顶层旧文件未删除。

---

### 问题五：prompts/6层结构未被严格执行

| 问题 | 状态 |
|------|------|
| `intimacy/` 目录存在但**未被 index.ts 导入** | ❌ |
| `runtime/gameMaster/` 新增但**未被 index.ts 导出** | ❌ |

---

### 问题六：巨型文件未拆分

| 文件 | 行数 | 问题 |
|------|------|------|
| `systemPromptBuilder.ts` | 1,733 | 超大，未拆分 |
| `campusNSFWEngine.ts` | 1,601 | 可独立feature hook |
| `openingStoryWorkflow.ts` | 1,466 | 超大 |
| `stateTransforms.ts` | 1,234 | 超大 |
| `storyState.ts` | 941 | 偏大 |
| `promptRuntime.ts` | 751 | 偏大 |
| `npcContext.ts` | 690 | 偏大 |

---

### 问题七：App.tsx (2115行) 职责过多

**混合的职责**：
- 视图路由（三路分支：home/new_game/game）
- 移动端窗口路由（20+种窗口类型）
- 懒加载组件注册（54个）
- UI状态管理（11个useState）
- 键盘快捷键处理
- 确认对话框系统
- Context snapshot 构建

**应下放到子组件的逻辑**：
- 20+个 `open*` 函数 → 移到 RightPanel/MobileQuickMenu
- `handleMobileMenuClick` (700行) → 移到 MobileQuickMenu 组件
- `closeAllPanels` → 抽象为 useGame 的 action
- `activeMobileWindow` 计算 → 移到独立 hook `useWindowRouter`

---

## 四、循环依赖检查

**结论**：hooks/useGame/ 目录内**无循环依赖**

主要导入链是单向的树状结构：
```
sendWorkflow/index.ts → memoryUtils, mainStoryRequest, timeUtils
memoryRecallPhase.ts → memoryUtils, recallWorkflow, promptRuntime
responseProcessingPhase.ts → timeUtils, storyResponseGuards, memoryUtils
```

---

## 五、重构建议（分阶段）

### 5.1 阶段一：Context Providers + Selectors（1-2周）

**目标**：打破 God Hook 的直接依赖，让子模块可以独立测试

```typescript
// contexts/GameStateContext.tsx
const GameStateContext = createContext<GameState>(null!);
const GameMetaContext = createContext<GameMeta>(null!);
const GameActionsContext = createContext<GameActions>(null!);

// App.tsx 改为组合多个 Provider
function App() {
  return (
    <GameStateProvider>
      <GameMetaProvider>
        <GameActionsProvider>
          <AppContent />
        </GameActionsProvider>
      </GameMetaProvider>
    </GameStateProvider>
  );
}

// hooks/useGameSelectors.ts
export const useCharacter = () => useGameState(s => s.角色);
export const useWorld = () => useGameState(s => s.世界);
export const useBattle = () => useGameState(s => s.战斗);
export const useChatHistory = () => useGameState(s => s.历史记录);
```

**收益**：UI 组件只订阅需要的状态，减少不必要重渲染。

---

### 5.2 阶段二：hooks/useGame/ 目录重组（2-3周）

**目标**：整理目录结构，按功能域分组

```
hooks/useGame/
├── _workflows/           # 原有的 workflow 文件
│   ├── sendWorkflow/
│   ├── worldEvolutionWorkflow/
│   └── ...
├── _state/              # 状态相关
│   ├── useGameState.ts
│   ├── stateTransforms.ts     (1234行 - 建议拆分)
│   └── storyState.ts
├── _context/            # 上下文构建
│   ├── npcContext.ts
│   ├── contextSnapshot.ts
│   └── promptRuntime.ts
├── _memory/             # 记忆系统 (5文件)
│   ├── memoryUtils.ts
│   ├── memoryRecall.ts
│   ├── memoryConsolidation.ts
│   └── ...
├── _image/              # 图片系统 (已有子目录，保留)
├── _engine/             # 核心引擎
│   ├── systemPromptBuilder.ts (1733行 - 建议拆分)
│   ├── combatCalculation.ts
│   └── bodyPolish.ts
├── _bdsm/               # ⭐ BDSM功能隔离 (7文件)
│   ├── bdsmTaskWorkflow.ts
│   ├── bdsmTaskTrigger.ts
│   ├── bdsmMeetingWorkflow.ts
│   ├── bdsmMeetingTrigger.ts
│   ├── bdsmStateIntegration.ts
│   ├── bdsmStateParser.ts
│   └── bdsmForumEngine.ts
├── _nsfw/               # ⭐ NSFW功能隔离 (3文件)
│   ├── campusNSFWEngine.ts (1601行)
│   ├── campusForumWorkflow.ts
│   └── campusPromptInjector.ts
├── _variable/           # 变量生成系统 (11文件)
├── _world/              # 世界系统 (3文件)
└── _shared/            # 共享工具
```

**注意**：这只是目录重组，不改变 import 路径。

---

### 5.3 阶段三：models/system.ts 拆分（2-3周）

**目标**：消除职责膨胀，建立清晰类型分层

```
models/
├── system.ts             # 保留导出，仅做重导出
├── ai-config.ts          # 新增：API配置（接口供应商类型、配置结构）
├── image-config.ts       # 新增：图片生成配置（NovelAI/SD/ComfyUI）
├── game-settings.ts      # 新增：游戏设置schema
├── era-config.ts         # 新增：统一时代配置（合并system.ts内置配置与eraTheme）
└── save-schema.ts        # 新增：存档结构schema
```

**消除重复**：
- 保留 `models/domain/` 作为规范源
- 删除顶层重复文件（或改为重新导出）
- `models/game/` 同样处理

---

### 5.4 阶段四：Zustand 状态管理迁移（4-6周）

**推荐理由**：轻量、hooks友好、最小迁移成本

```typescript
// stores/gameStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface GameState {
  角色: 角色数据结构;
  世界: 世界数据结构;
  // ... 其他状态
}

export const useGameStore = create(
  immer((set) => ({
    角色: null,
    世界: null,
    set角色: (角色) => set({ 角色 }),
    // ...
  }))
);
```

**迁移顺序**（从边缘开始）：
1. 先迁移 `settings`（最简单的只读配置）
2. 再迁移 `角色`、`环境`、`世界`（核心数据）
3. 最后迁移 `战斗`、`剧情`、`社交`（复杂状态）

---

### 5.5 阶段五：Feature Module 化（8-12周）

**目标**：将散落的业务逻辑组织成真正的功能模块

```
src/features/
├── story/
│   ├── components/       # StoryView, StoryCard
│   ├── hooks/            # useStory, useStoryWorkflow
│   ├── prompts/          # 剧情相关提示词
│   └── store.ts          # 剧情状态
│
├── combat/
│   ├── components/       # BattleView, CombatLog
│   ├── hooks/            # useCombat
│   ├── engine/           # combatCalculation.ts
│   └── store.ts
│
├── world/
│   ├── components/
│   ├── hooks/
│   └── store.ts
│
├── social/
│   ├── components/
│   ├── hooks/
│   └── store.ts
│
├── _shared/              # 跨功能共享
│   ├── hooks/
│   │   ├── useNPC.ts
│   │   └── useImageGenerator.ts
│   └── utils/
│
└── nsfw/                 # ⭐ BDSM/NSFW 隔离域
    ├── campus/
    ├── bdsm/
    └── store.ts
```

---

## 六、实施优先级

| 优先级 | 动作 | 工期 | 风险 | 收益 |
|--------|------|------|------|------|
| **P0** | 提取 `activeMobileWindow` 为 `useWindowRouter` hook | 1天 | 🟢低 | 减少~25行，提升可测试性 |
| **P0** | 提取 `closeAllPanels` 到 useGame setters | 1天 | 🟢低 | 减少~25行 |
| **P0** | `systemPromptBuilder.ts` (1733行) 拆分为 `core/systemPrompt/` | 3天 | 🟢低 | 显著降低加载时间 |
| **P0** | `stateTransforms.ts` (1234行) 拆分 | 2天 | 🟢低 | 可测试性提升 |
| **P1** | hooks/useGame/ 按功能域分组 | 1周 | 🟢低 | 功能内聚、可读性提升 |
| **P1** | models/system.ts 拆分为 ai-config + image-config + game-settings | 1周 | 🟢低 | 消除职责膨胀 |
| **P1** | App.tsx: 合并 UI状态到 useGame 的 modal 状态对象 | 2天 | 🟢低 | 减少11个useState |
| **P2** | 删除 models/ 重复文件，建立 domain/ 为规范源 | 2天 | 🟢低 | 消除重复定义 |
| **P2** | 合并两个 GameMaster 系统 | 2周 | 🟡中 | 消除重复 |
| **P2** | App.tsx: 提取 BDSM 相关回调到 `useBDSMActions` hook | 1周 | 🟢低 | 减少~100行 |
| **P3** | prompts/ 修复 index.ts 导出遗漏（intimacy/、runtime/gameMaster/） | 1天 | 🟢低 | 修复架构不一致 |
| **P3** | 考虑 Zustand 迁移 | 4-6周 | 🟡中 | 状态管理现代化 |
| **P4** | Feature Module 化 | 8-12周 | 🔴高 | 长期可维护性 |
| **P4** | 微前端拆分（可选） | 12+周 | 🔴高 | 独立部署 |

---

## 七、不建议现在做的

1. **引入 Redux** — boilerplate太多，学习成本高，当前项目不需要
2. **微前端拆分** — 项目规模还没到需要，收益远小于成本
3. **彻底重写** — 当前架构虽有缺陷但可运行，重写风险极高

---

## 八、为什么不建议引入状态管理库

| 方案 | 收益 | 成本 |
|------|------|------|
| **Zustand** | 消除 props drilling；状态与 UI 分离 | 需要迁移成本（~3000行的useGame） |
| **Redux Toolkit** | 成熟、DevTools 强 | 学习曲线、boilerplate |
| **Jotai** | 原子化状态；派生状态简单 | 概念新，需要重构 |

**useGame 已经是状态管理编排器**（2952行），引入外部库需要彻底重构。建议：
1. 先进行阶段一（Context Providers）改善渲染性能
2. 如仍感觉状态管理复杂，再考虑 Zustand

---

## 九、立即行动建议

**阶段一（Context Providers + Selectors）** 是投入产出比最高的改进：

1. 创建 `contexts/GameStateContext.tsx`
2. 创建 `hooks/useGameSelectors.ts` 导出 `useCharacter`、`useWorld` 等
3. App.tsx 改为组合多个 Provider
4. 验证渲染性能改善

此阶段可以在**不破坏现有逻辑**的情况下解决渲染性能问题，且风险极低。

---

## 十、总结

| 核心矛盾 | 业务复杂度 vs 代码组织形式 |
|----------|--------------------------|
| 最大问题 | 所有状态和逻辑都堆在一个 ~3000行的 hook 里 |
| 扩展风险 | 新功能必须修改核心文件，测试几乎不可能 |
| 重构路径 | Context Providers → Selectors → 目录重组 → Zustand → Feature Module |

**建议立即行动**：阶段一（Context Providers + Selectors）
