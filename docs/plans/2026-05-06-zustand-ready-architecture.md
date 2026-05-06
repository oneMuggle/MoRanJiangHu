# 墨色江湖架构重构 — Zustand 就绪方案

## Context

项目当前存在两大核心矛盾：
1. `useGame.ts` (2952行) 作为 God Hook 承载了所有状态+逻辑，新增模块必须修改此文件
2. `hooks/useGame/` 下 142 个 .ts 文件平铺散落，110+ 个无目录分组
3. `models/system.ts` (1780行) 混合 6 种不相关职责，其中时代配置独占 800 行
4. `models/` 顶层与 `domain/`/`game/` 存在重复类型定义

本方案通过 **8 个阶段**的渐进式重构，在不破坏运行时行为的前提下，建立一个 **Zustand 就绪的架构** — 即使暂时不安装 Zustand，状态边界、slice 接口、`{ state, actions }` 模式已经就位，未来安装 Zustand 只需替换 hook 实现。

---

## Phase 0: 准备 — 创建 barrel index (0.5天)

**目标：** 为 `hooks/useGame/` 创建统一导出入口

**操作：**
- 创建 `hooks/useGame/index.ts` — 汇总当前 `useGame.ts` 中从该目录导入的所有模块
- `npx vite build` 确认无回归

**验证：** `npx tsc --noEmit` 通过，`npx vite build` 成功

---

## Phase 1: 拆分 models/system.ts (2-3天)

**目标：** 将 1780 行、98 个导出的单体文件拆为 6 个职责单一的文件 + barrel 重导出

### 1.1 新文件清单

| 文件 | 职责 | 预估行数 | 关键导出 |
|------|------|---------|---------|
| `models/era-config.ts` | 时代配置（含 800 行内置时代数据） | ~800 | `时代配置`, `全部时代配置`, `获取时代信息`, `获取时代主题方案` |
| `models/api-config.ts` | API 接口与图片生成配置 | ~400 | `接口供应商类型`, `文生图接口配置结构`, `接口设置结构`, `角色锚点结构` |
| `models/game-settings.ts` | 游戏设置、记忆配置、存档结构 | ~350 | `游戏设置结构`, `记忆配置结构`, `存档结构`, `游戏难度` |
| `models/theme-visual.ts` | 主题、视觉、性能配置 | ~80 | `视觉设置结构`, `ThemePreset`, `MusicTrack` |
| `models/ability-system.ts` | 超能力系统 | ~60 | `超能力分类`, `觉醒程度` |
| `models/prompt-config.ts` | 提示词与节日 | ~30 | `提示词结构`, `节日结构` |

### 1.2 models/system.ts 变为 barrel

```typescript
// models/system.ts — 仅保留重导出，保持所有 import 路径有效
export * from './era-config';
export * from './api-config';
export * from './game-settings';
export * from './theme-visual';
export * from './ability-system';
export * from './prompt-config';
```

**关键约束：** 61 个文件从 `models/system` 导入，barrel 确保零 import 变更。

**验证：** `npx tsc --noEmit` 通过，`npx vite build` 成功

---

## Phase 2: 清理 models/ 重复文件 (1天)

**目标：** 消除顶层与子目录的重复定义

### 2.1 完全重复 — 直接删除子目录版本

| 删除文件 | 保留文件 |
|---------|---------|
| `models/domain/battle.ts` | `models/battle.ts` |
| `models/domain/environment.ts` | `models/environment.ts` |
| `models/domain/item.ts` | `models/item.ts` |
| `models/domain/sect.ts` | `models/sect.ts` |
| `models/domain/task.ts` | `models/task.ts` |
| `models/game/story.ts` | `models/story.ts` |
| `models/game/worldbook.ts` | `models/worldbook.ts` |

### 2.2 近似重复 — 保留顶层，更新 import

| 差异 | 处理 |
|------|------|
| `models/item.ts` vs `models/domain/item.ts` — domain 版多了 `符箓`、`法器` | 将 2 个类型合并到 `models/item.ts`，删 domain 版 |
| `models/kungfu.ts` vs `models/domain/kungfu.ts` — 顶层版多了 `里修描述`、`怪修描述` | 补充到 `models/domain/kungfu.ts` 后合并，保留顶层 |
| `models/character.ts` vs `models/domain/character.ts` — 顶层版多了武根/妖根 | 保留顶层 |
| `models/social.ts` vs `models/domain/social.ts` — 顶层是超集 | 保留顶层 |

### 2.3 更新 import 路径

`hooks/useGame.ts` 中 `from '../models/game/world'` → `from '../models/world'`

**验证：** `grep -rn "models/domain/\|models/game/" --include="*.ts"` 返回 0

---

## Phase 3: hooks/useGame/ 目录重组 (2-3天)

**目标：** 将 110+ 平铺文件归入 18 个功能目录，不改文件内容，只改路径

### 3.1 目标结构

```
hooks/useGame/
├── index.ts                          # barrel (Phase 0 已创建)
│
│ # 核心文件（保留在根目录，引用面广）
├── storyState.ts
├── systemPromptBuilder.ts
├── mainStoryRequest.ts
├── promptRuntime.ts
│
│ # 功能域
├── memory/                           # 记忆系统 (5文件)
│   ├── memoryUtils.ts
│   ├── memoryRecall.ts
│   ├── memoryConsolidation.ts
│   ├── memorySummaryHandlers.ts
│   └── npcMemorySummary.ts
│
├── image/                            # 图片系统 (从1→10文件)
│   ├── playerImageWorkflow.ts
│   ├── sceneImageWorkflow.ts
│   ├── sceneImageArchiveWorkflow.ts
│   ├── sceneImageTriggerWorkflow.ts
│   ├── npcImageWorkflow.ts
│   ├── npcImageStateWorkflow.ts
│   ├── npcSecretImageWorkflow.ts
│   ├── batchImageGenerationWorkflow.ts
│   ├── imagePresetWorkflow.ts
│   └── manualImageActionsWorkflow.ts
│
├── npc/                              # NPC 管理 (4文件)
│   ├── npcContext.ts
│   ├── manualNpcWorkflow.ts
│   └── responseCommandProcessor.ts
│
├── world/                            # 世界系统 (5文件)
│   ├── worldEvolutionWorkflow.ts
│   ├── worldEvolutionControl.ts
│   ├── worldEvolutionUtils.ts
│   ├── worldGenerationWorkflow.ts
│   └── worldStateIntegrity.ts
│
├── planning/                         # 规划与变量 (7文件)
│   ├── planningUpdateWorkflow.ts
│   ├── planningReasonCollector.ts
│   ├── variableCalibration.ts
│   ├── variableCalibrationCoordinator.ts
│   ├── variableCalibrationMerge.ts
│   ├── variableModelWorkflow.ts
│   └── variableGenerationProgress.ts
│
├── campus/                           # 校园系统 (8文件+子目录)
│   ├── campusNSFWEngine.ts
│   ├── campusForumWorkflow.ts
│   ├── campusRumorWorkflow.ts
│   ├── campusPromptInjector.ts
│   ├── academicWorkflow.ts
│   ├── scheduleWorkflow.ts
│   ├── semesterCalendarWorkflow.ts
│   ├── clubWorkflow.ts
│   └── campusNSFW/
│
├── bdsm/                             # BDSM 系统 (7文件)
│   ├── bdsmTaskWorkflow.ts
│   ├── bdsmMeetingWorkflow.ts
│   ├── bdsmMeetingTrigger.ts
│   ├── bdsmTaskTrigger.ts
│   ├── bdsmStateIntegration.ts
│   ├── bdsmStateParser.ts
│   └── bdsmForumEngine.ts
│
├── urbanDriver/                      # 城市司机 NSFW (2文件)
│   ├── urbanDriverNSFWEngine.ts
│   └── urbanDriverNSFWIntegration.ts
│
├── device/                           # 移动设备 AI (8文件)
│   ├── deviceAiWorkflow.ts
│   ├── deviceRefreshMonitor.ts
│   ├── mobileDeviceWorkflow.ts
│   ├── triggerDeviceMessageWorkflow.ts
│   ├── useDeviceContacts.ts
│   ├── useDeviceMessages.ts
│   ├── useDeviceNavigation.ts
│   └── useDeviceTheme.ts
│
├── response/                         # 响应处理 (2文件)
│   ├── responseTextHelpers.ts
│   └── storyResponseGuards.ts
│
├── travel/                           # 旅行与交易 (2文件)
│   ├── travelWorkflow.ts
│   └── tradeWorkflow.ts
│
├── ui/                               # UI 辅助 (3文件)
│   ├── notificationSystem.ts
│   ├── rollbackSnapshot.ts
│   └── contextSnapshot.ts
│
├── time/                             # 时间系统 (3文件)
│   ├── timeUtils.ts
│   ├── historyTurnWorkflow.ts
│   └── historyUtils.ts
│
├── opening/                          # 开局 (2文件)
│   ├── openingStoryWorkflow.ts
│   └── bodyPolish.ts
│
├── quality/                          # 质量保障 (5文件)
│   ├── autoRetry.ts
│   ├── errorFormatting.ts
│   ├── backgroundImageMonitor.ts
│   ├── performanceMonitor.ts
│   └── thinkingContext.ts
│
├── eventTrigger/                     # 已有目录，补充
│   ├── eventTriggerManager.ts
│   └── eventTrigger.ts
│
├── state/                            # 已有目录，补充
│   └── stateTransforms.ts
│
│ # 已有目录（不变）
├── config/                           # settingsPersistenceWorkflow.ts
├── saveLoad/                         # saveLoadWorkflow.ts
├── narrativeGrammar/                 # 叙事语法
├── sendWorkflow/                     # 主剧情发送
├── transforms/                       # 状态转换
│
│ # 独立文件（引用面广，不宜归入子目录）
├── intimacyUtils.ts
├── combatCalculation.ts
├── progressionWorkflow.ts
├── privateChatWorkflow.ts
├── runtimeVariableWorkflow.ts
├── difficultyAdjustmentWorkflow.ts
├── saveCoordinator.ts
```

### 3.2 迁移方法

每移动一个文件：
1. `git mv old-path new-path`
2. 更新文件内相对 import 路径
3. 更新 `useGame.ts` 中的 import 路径
4. `npx tsc --noEmit` 验证
5. 一个目录完成后 commit

**关键约束：** 只改路径，不改内容。每次 commit 一个目录的移动。

---

## Phase 4: 删除废弃 GameMaster 系统 (0.5天)

**目标：** 移除零引用的 `services/gameMaster/`

**操作：**
- 确认 `grep -rn "services/gameMaster/" --include="*.ts" --include="*.tsx"` 返回 0（排除 `ai/gameMaster`）
- `git rm -rf services/gameMaster/`

**保留：** `services/ai/gameMaster/` — 这是实际使用的系统

---

## Phase 5: 修复 prompts/ 导出断裂 (0.5天)

**目标：** 让 `prompts/index.ts` 正确导出 runtime 和 intimacy 模块

**操作：**
- 在 `prompts/index.ts` 中添加 `export * as runtime from './runtime';`
- 为 `prompts/intimacy/` 创建 `index.ts` 导出 txt 文件

---

## Phase 6: 子 Hook 拆分 — Zustand 就绪 (3-4天)

**目标：** 从 `useGame.ts` 拆出 13 个独立子 hook，每个遵循 `{ state, actions }` 模式

### 6.1 设计原则

每个子 hook 是一个 **Zustand slice 的 hook 等价物**：

```typescript
// hooks/useGame/subsystems/useImageSlice.ts
export interface ImageSlice {
  // State
  npcImageQueue: NPC生图任务记录[];
  sceneImageQueue: 场景生图任务记录[];
  // Actions
  generateNpcImageManually: (...) => void;
  selectNpcAvatarImage: (...) => void;
}

export function useImageSlice(base: UseGameBase): ImageSlice {
  // 使用 base 提供的状态和 setter，封装自己的 actions
  return { state..., actions... };
}
```

当未来安装 Zustand 时，只需替换为：
```typescript
export const useImageStore = create<ImageSlice>((set, get) => ({
  // state + actions 接口完全不变
}));
```

### 6.2 Slice 清单

| Slice | 对应 Phase 3 目录 | 预估行数 | 关键状态 |
|-------|------------------|---------|---------|
| `useCharacterSlice` | npc/, character state | ~200 | 角色, NPC CRUD |
| `useEnvironmentSlice` | travel/, environment state | ~100 | 环境, 旅行事件 |
| `useCombatSlice` | combatCalculation | ~150 | 战斗 |
| `useWorldSlice` | world/ | ~200 | 世界, 世界演变 |
| `useMemorySlice` | memory/ | ~250 | 记忆总结, 记忆召回 |
| `useImageSlice` | image/ | ~300 | NPC/主角/场景生图 |
| `useStorySlice` | core/, opening/, response/ | ~400 | 剧情, 发送, 润色 |
| `useBDSMSlice` | bdsm/ | ~200 | BDSM 关系, 任务 |
| `useCampusSlice` | campus/, semester/ | ~250 | 校园, 学术, 日程 |
| `useVariableSlice` | planning/ | ~200 | 变量生成, 校准 |
| `useDeviceSlice` | device/ | ~100 | 移动设备状态 |
| `useUISlice` | ui/, quality/ | ~80 | 通知, 快照, 回档 |
| `useApiSlice` | apiConfig, prompts | ~150 | API 配置, 提示词 |

### 6.3 useGame.ts 改造后

```typescript
// useGame.ts — 从 2952 行减少到 ~500-800 行
export const useGame = () => {
  const base = useGameBase(); // 从 useGameState 衍生的基础上下文

  const character = useCharacterSlice(base);
  const environment = useEnvironmentSlice(base);
  // ... 13 个子 slice

  // 兼容层：保持 { state, meta, setters, actions } 不变
  return {
    state: base.state,
    meta: computeMeta(base, world, memory, image, variable),
    setters: base.setters,
    actions: {
      ...character,
      ...environment,
      ...world,
      ...memory,
      ...image,
      ...story,
      ...bdsm,
      ...campus,
      ...variable,
      ...device,
      ...ui,
      ...api,
    }
  };
};
```

**关键约束：** `useGame()` 返回值形状完全不变，所有外部调用（App.tsx、所有 feature 组件）无需修改。

**跨边界依赖处理：**
- 如 BDSM action 需要 `apiConfig`，通过 `base` 参数的 `getApiConfig()` 方法获取，而非闭包依赖
- 这直接对应 Zustand 的 `getState()` 模式

### 6.4 接口定义文件

```typescript
// hooks/useGame/subsystems/types.ts
// 定义 useGame() 返回值接口，作为所有 slice 的契约
export interface UseGameReturn {
  state: GameState;
  meta: GameMeta;
  setters: GameSetters;
  actions: GameActions;
}
```

---

## Phase 7: App.tsx 瘦身 (1天)

**目标：** 从 2115 行减少到 ~800-1000 行

### 7.1 提取 useModalVisibility hook
提取 App.tsx 中 30+ 个 local useState（showCharacter, showImageManager, ...）

### 7.2 提取 lazy 组件声明
提取 50+ 个 React.lazy + 创建可预加载懒组件 声明到 `components/features/lazyComponents.ts`

### 7.3 提取 useResponsive hook
提取 isMobile 状态 + resize listener 逻辑

### 7.4 提取 useContextSnapshot hook
提取 App.tsx 中 70+ 行的 context snapshot useEffect

---

## 验证策略

每个 Phase 完成后必须通过：

| 检查项 | 命令 |
|--------|------|
| TypeScript 编译 | `npx tsc --noEmit` |
| Vite 构建 | `npx vite build` |
| 运行时验证 | 开局 → 对话 → 存读档 |

---

## 执行顺序与工期

```
Phase 0 ─┬─ Phase 1 ──┬─ Phase 3 ── Phase 6 ─┬─ Phase 7   (主线)
         │             │                       │
         ├─ Phase 2 ───┘                       │
         │                                     │
         ├─ Phase 4 ───────────────────────────┘
         │
         └─ Phase 5

并行可做: Phase 7 可与任何 Phase 并行
总工期: 10-14 天
```

| Phase | 工期 | 风险 |
|-------|------|------|
| 0. 准备 | 0.5天 | 无 |
| 1. 拆分 system.ts | 2-3天 | 低（barrel 保护） |
| 2. 清理重复 models | 1天 | 低（机械操作） |
| 3. 目录重组 | 2-3天 | 低（单消费者） |
| 4. 删除废弃 GM | 0.5天 | 无 |
| 5. 修复 prompts | 0.5天 | 无 |
| 6. 子 Hook 拆分 | 3-4天 | 中（最大行为变更） |
| 7. App.tsx 瘦身 | 1天 | 低（提取-only） |

---

## 关键文件清单

| 文件 | 当前行数 | 目标行数 | 变更类型 |
|------|---------|---------|---------|
| `models/system.ts` | 1780 | ~10 (barrel) | 拆分为 6 文件 |
| `hooks/useGame.ts` | 2952 | ~500-800 | 拆分为 13 子 hook |
| `App.tsx` | 2115 | ~800-1000 | 提取 4 个 hook |
| `prompts/index.ts` | 现有 | +runtime 导出 | 补充导出 |
| `services/gameMaster/` | 整个目录 | 删除 | Phase 4 |
