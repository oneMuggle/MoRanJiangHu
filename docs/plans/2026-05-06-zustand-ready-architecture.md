# 墨色江湖架构重构 — Zustand 就绪方案

## Context

项目当前存在两大核心矛盾：
1. `useGame.ts` (2952行) 作为 God Hook 承载了所有状态+逻辑，新增模块必须修改此文件
2. `hooks/useGame/` 下 142 个 .ts 文件平铺散落，110+ 个无目录分组
3. `models/system.ts` (1780行) 混合 6 种不相关职责，其中时代配置独占 800 行
4. `models/` 顶层与 `domain/`/`game/` 存在重复类型定义

本方案通过 **8 个阶段**的渐进式重构，在不破坏运行时行为的前提下，建立一个 **Zustand 就绪的架构** — 即使暂时不安装 Zustand，状态边界、slice 接口、`{ state, actions }` 模式已经就位，未来安装 Zustand 只需替换 hook 实现。

---

## Phase 0: 准备 — 创建 barrel index ✅ 完成

**目标：** 为 `hooks/useGame/` 创建统一导出入口

**操作：**
- 创建 `hooks/useGame/index.ts` — 汇总当前 `useGame.ts` 中从该目录导入的所有模块
- `npx vite build` 确认无回归

**验证：** `npx tsc --noEmit` 通过，`npx vite build` 成功

---

## Phase 1: 拆分 models/system.ts ✅ 完成

**目标：** 将 1780 行、98 个导出的单体文件拆为 4 个职责单一的文件 + barrel 重导出

### 实际切割结果

| 文件 | 职责 | 实际行数 | 关键导出 |
|------|------|---------|---------|
| `models/api-config.ts` | API 接口与图片生成配置 | ~350 | `接口供应商类型`, `文生图接口配置结构`, `接口设置结构`, `角色锚点结构` |
| `models/theme-visual.ts` | 主题、视觉、性能配置 | ~80 | `视觉设置结构`, `ThemePreset`, `MusicTrack`, `性能监控配置结构` |
| `models/game-settings.ts` | 游戏设置、记忆配置、存档结构、能力系统 | ~420 | `游戏设置结构`, `记忆配置结构`, `存档结构`, `武力等级`, `能力类型`, `OpeningConfig`, `WorldGenConfig` |
| `models/era-config.ts` | 时代配置（含 800 行内置时代数据） | ~960 | `时代配置`, `全部时代配置`, `获取时代信息`, `获取时代主题方案` |

### models/system.ts 变为 barrel

```typescript
// models/system.ts — 仅保留重导出，保持所有 import 路径有效
export * from './api-config';
export * from './game-settings';
export * from './theme-visual';
export * from './era-config';
```

**关键约束：** 61 个文件从 `models/system` 导入，barrel 确保零 import 变更。

**验证：** `npx tsc --noEmit` 通过，`npx vite build` 成功

---

## Phase 2: 清理 models/ 重复文件 ✅ 完成

**目标：** 消除顶层与子目录的重复定义

### 已完成操作

1. **完全重复删除：** 删除 `models/domain/` (9文件) 和 `models/game/` (4文件)
2. **类型合并：** 将 `符箓`、`法器` 类型合并到 `models/item.ts`
3. **import 路径更新：** 所有 `models/domain/` 和 `models/game/` 引用改为 `models/`

### 更新的文件

| 原路径 | 新路径 |
|--------|--------|
| `models/domain/character.ts` | `models/character.ts` |
| `models/domain/item.ts` | `models/item.ts` (+ 符箓/法器) |
| `models/domain/kungfu.ts` | `models/kungfu.ts` |
| `models/domain/social.ts` | `models/social.ts` |
| `models/domain/battle.ts` | `models/battle.ts` |
| `models/domain/environment.ts` | `models/environment.ts` |
| `models/domain/sect.ts` | `models/sect.ts` |
| `models/domain/task.ts` | `models/task.ts` |
| `models/domain/imageGeneration.ts` | `models/imageGeneration.ts` |
| `models/game/world.ts` | `models/world.ts` |
| `models/game/story.ts` | `models/story.ts` |
| `models/game/worldbook.ts` | `models/worldbook.ts` |
| `models/game/novelDecomposition.ts` | `models/novelDecomposition.ts` |

**验证：** `grep -rn "models/domain/\|models/game/" --include="*.ts"` 返回 0

---

## Phase 3: hooks/useGame/ 目录重组 ✅ 完成

**目标：** 将 110+ 平铺文件归入 18 个功能目录，不改文件内容，只改路径

### 实际最终结构

```
hooks/useGame/
├── index.ts                          # barrel
│
│ # 核心文件（保留在根目录，引用面广）
├── storyState.ts
├── systemPromptBuilder.ts
├── mainStoryRequest.ts
├── promptRuntime.ts
├── intimacyUtils.ts
├── combatCalculation.ts
├── progressionWorkflow.ts
├── privateChatWorkflow.ts
├── runtimeVariableWorkflow.ts
├── difficultyAdjustmentWorkflow.ts
├── saveCoordinator.ts
├── recallWorkflow.ts
├── eventTriggerManager.ts
├── eventTrigger.ts
├── campusNSFWEngine.ts
├── campusForumWorkflow.ts
├── campusRumorWorkflow.ts
├── campusPromptInjector.ts
├── academicWorkflow.ts
├── scheduleWorkflow.ts
├── semesterCalendarWorkflow.ts
├── clubWorkflow.ts
├── bdsmForumEngine.ts
├── bdsmMeetingTrigger.ts
├── bdsmMeetingWorkflow.ts
├── bdsmStateIntegration.ts
├── bdsmStateParser.ts
├── bdsmTaskTrigger.ts
├── bdsmTaskWorkflow.ts
├── urbanDriverNSFWEngine.ts
├── urbanDriverNSFWIntegration.ts
├── narrativeGrammar.ts
├── stateTransforms.ts
│
│ # 功能域（14 个子目录）
├── memory/                           # 记忆系统 (5文件)
├── image/                            # 图片系统 (9文件)
├── npc/                              # NPC 管理 (3文件)
├── world/                            # 世界系统 (5文件)
├── planning/                         # 规划与变量 (7文件)
├── device/                           # 移动设备 AI (8文件)
├── response/                         # 响应处理 (2文件)
├── travel/                           # 旅行与交易 (2文件)
├── ui/                               # UI 辅助 (3文件)
├── time/                             # 时间系统 (3文件)
├── opening/                          # 开局 (2文件)
├── quality/                          # 质量保障 (5文件)
├── campusNSFW/                       # 校园 NSFW 子目录
├── config/                           # 设置持久化
├── saveLoad/                         # 存读档
├── sendWorkflow/                     # 主剧情发送
├── eventTrigger/                     # 事件触发
├── state/                            # 状态转换
├── narrativeGrammar/                 # 叙事语法
├── transforms/                       # 数据转换
```

### import 路径修复

修复了以下文件的 import 路径：
- `hooks/useGame.ts` (主 hook)
- `hooks/useGameState.ts`
- `hooks/useGame/index.ts` (barrel)
- `hooks/useGame/sendWorkflow/` (已有子目录)
- `hooks/useGame/config/` (已有子目录)
- `hooks/useGame/saveLoad/` (已有子目录)
- `hooks/useGame/transforms/` (已有子目录)
- `hooks/useGame/` 下所有 14 个新子目录的内部引用
- 所有 `components/features/` 中引用 moved 模块的文件
- `App.tsx`、`utils/worldbook.ts`、`services/memoryImportExportService.ts`、`services/ai/gameMaster/coordinator.ts`

**验证：** `npx vite build` 成功

---

## Phase 4: 删除废弃 GameMaster 系统 ✅ 完成

**目标：** 移除零引用的 `services/gameMaster/`

**操作：**
- 确认 `grep -rn "services/gameMaster/" --include="*.ts" --include="*.tsx"` 返回 0（排除 `ai/gameMaster`）
- `git rm -rf services/gameMaster/`

**保留：** `services/ai/gameMaster/` — 这是实际使用的系统

---

## Phase 5: 修复 prompts/ 导出断裂 ✅ 完成

**目标：** 让 `prompts/index.ts` 正确导出 runtime 和 intimacy 模块

**操作：**
- 在 `prompts/index.ts` 中添加 `export * as runtime from './runtime';`
- 修复 runtime barrel 中错误的导出名称
- 修复 `isolatedModules` 下 type 导出问题

---

## Phase 6: 子 Hook 拆分 — Zustand 就绪 (进行中)

**目标：** 从 `useGame.ts` 拆出独立子 hook，每个遵循 `{ state, actions }` 模式

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

### 6.2 已完成 Slice (10/10 Zustand slices)

| Slice | 对应目录 | 行数 | 关键状态 | 状态 |
|-------|---------|------|---------|------|
| `useUISlice` | ui/ | ~120 | 通知/回档/重Roll | ✅ 已迁移 (zustandStore.ts) |
| `useTravelSlice` | travel/ | ~30 | 旅行事件 | ✅ 已迁移 (zustandStore.ts) |
| `useDeviceSlice` | device/ | ~30 | 设备状态/刷新队列 | ✅ 已迁移 (zustandStore.ts) |
| `useImageSlice` | image/ | ~30 | NPC/场景生图队列 | ✅ 已迁移 (zustandStore.ts) |
| `useSettingsSlice` | config/ | ~30 | 世界书/预设组/提示词 | ✅ 已迁移 (zustandStore.ts) |
| `useWorldSlice` | world/ | ~50 | 世界演变状态/摘要 | ✅ 已迁移 (zustandStore.ts) |
| `useMemorySlice` | memory/ | ~80 | 记忆总结任务/阶段 | ✅ 已迁移 (zustandStore.ts) |
| `useVariableSlice` | planning/ | ~40 | 变量生成进度 | ✅ 已迁移 (zustandStore.ts) |
| `useOpeningSlice` | opening/ | ~20 | 开局配置 | ✅ 已迁移 (zustandStore.ts) |
| `useSceneConfigSlice` | image/ | ~20 | 场景图片档案/时代信息 | ✅ 已迁移 (zustandStore.ts) |

**useGame.ts 行数变化：** 2952 → 全部 useState 清零 (30+ useState → 0)

## Phase 6: 子 Hook 拆分 — Zustand 就绪 (进行中)

### 6.5 Zustand 已安装 ✅

- `zustand@5.0.13` 已安装 (`pnpm add zustand`)
- `hooks/useGame/subsystems/zustandStore.ts` 包含 10 个 Zustand slices（无兼容层，直接 store 导出）
- `useGame.ts` 通过 `useGameStore()` 直接访问所有 Zustand 状态
- `useDevice.ts` 通过 `useGameStore(s => s.xxx)` 选择器访问
- `useTravelAndTrade.ts` 迁移到 Zustand，移除 `useState` + 设备重复逻辑

### 6.6 Zustand Slices 清单（全部完成 ✅）

| Slice | 对应目录 | 实际行数 | 关键状态 | 状态 |
|-------|---------|---------|---------|------|
| `UISlice` | ui/ | ~70 | 通知/回档/重Roll/滚动 | ✅ 已迁移 (zustandStore.ts) |
| `TravelSlice` | travel/ | ~10 | 旅行事件列表 | ✅ 已迁移 (zustandStore.ts) |
| `DeviceSlice` | device/ | ~15 | 设备状态/刷新队列 | ✅ 已迁移 (zustandStore.ts) |
| `ImageSlice` | image/ | ~15 | NPC/场景生图队列 | ✅ 已迁移 (zustandStore.ts) |
| `SettingsSlice` | config/ | ~20 | 世界书/预设组/提示词 | ✅ 已迁移 (zustandStore.ts) |
| `WorldSlice` | world/ | ~30 | 世界演变状态/摘要 | ✅ 已迁移 (zustandStore.ts) |
| `MemorySlice` | memory/ | ~40 | 记忆总结任务/阶段 | ✅ 已迁移 (zustandStore.ts) |
| `VariableSlice` | planning/ | ~25 | 变量生成进度 | ✅ 已迁移 (zustandStore.ts) |
| `OpeningSlice` | opening/ | ~10 | 开局配置 | ✅ 已迁移 (zustandStore.ts) |
| `SceneConfigSlice` | image/ | ~15 | 场景图片档案/时代信息 | ✅ 已迁移 (zustandStore.ts) |

**zustandStore.ts 总计：** 432 行（含类型定义、slice 创建、store 合并）

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

## Phase 7: App.tsx 瘦身 ✅ 完成

**目标：** 从 2115 行减少到 ~800-1000 行
**实际：** 2115 → 289 行（超额完成，-1826 行，-86%）

### 7.1 提取 useModalVisibility hook
大多数 modal 可见性状态已经在 `state` 对象中（通过 useGame 的 setters 管理），仅 `showCharacter`、`showImageManager`、`showWorldbookManager` 3 个是 App.tsx 本地的。提取价值有限。

### 7.2 提取 lazy 组件声明 ✅ 完成
提取 55 个 React.lazy + 创建可预加载懒组件 声明到 `components/features/lazyComponents.tsx`
App.tsx: 2115 → 2037 行 (-78 行)

### 7.3 提取 useResponsive hook ✅ 完成
提取 isMobile 状态 + matchMedia 监听器到 `hooks/useResponsive.ts`
App.tsx: 2037 → 2027 行（累计从 2115 → 2027, -88行）

### 7.4 提取 useModalOpeners hook ✅ 完成
提取面板开关逻辑（~200 行）到 `hooks/useModalOpeners.ts`，包括 closeAllPanels、20+ 个 openers、handleMobileMenuClick、openImageManagerWithCheck、handleReturnToHomeFromSettings
App.tsx: 2027 → 1857 行（累计 -258 行）

### 7.5 提取 useConfirmSystem hook ✅ 完成
提取确认对话框逻辑（~30 行）到 `hooks/useConfirmSystem.tsx`，包括 confirmState、requestConfirm、resolveConfirm、InAppConfirmModal 渲染
App.tsx: 1857 → 1828 行（累计 -287 行）

### 7.11 提取 App 组件到 `components/app/` ✅ 完成

### 7.6-7.9 提取 useDerivedState / useTicker / useVisualTheme / useKeyboardShortcuts — 跳过
activeMobileWindow 与 useModalOpeners 存在循环依赖，useTicker/useVisualTheme 行数收益极低（各 ~30 行）。提取复杂度远超收益。

### 7.10 提取 useContextSnapshot hook
App.tsx 中 context snapshot 相关代码仅约 5 行（调用 actions.getContextSnapshot），提取价值有限。

### 7.11 提取 App 组件到 `components/app/` ✅ 完成

App.tsx 从 1828 行进一步瘦身到 289 行（累计 -1826 行），提取为以下文件：

| 文件 | 行数 | 职责 |
|------|------|------|
| `components/app/GameView.tsx` | 26081 | 游戏主视图（左面板/聊天/右面板布局） |
| `components/app/ModalLayer.tsx` | 55339 | 弹窗层渲染（所有 feature modal 的路由/渲染逻辑） |
| `components/app/NSFWModals.tsx` | 13134 | NSFW 相关弹窗 |
| `components/app/MemoryModals.tsx` | 5394 | 记忆系统弹窗 |
| `components/app/useAppModalState.ts` | 7243 | 弹窗状态管理 hook |
| `components/app/useAppEffects.tsx` | 20463 | 副作用管理（键盘快捷键、自动滚动等） |

App.tsx 现在仅保留：顶层视图路由（home/new_game/game）、三个核心 hook 调用（`useGame`、`useResponsive`、`useConfirmSystem`）、以及组合子组件。

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
Phase 0 ✓ ─┬─ Phase 1 ✓ ────────┬─ Phase 6 ✓ ────────┬─ Phase 7 ✓
           │                     │                     │
           ├─ Phase 2 ✓ ─────────┘                     │
           │                                           │
           ├─ Phase 3 ✓ ───────────────────────────────┘
           │
           ├─ Phase 4 ✓
           │
           └─ Phase 5 ✓

Phase 0/1/2/3/4/5 已完成
Phase 6: 子 Hook 拆分 — Zustand 就绪 ✅ 完成 (6.1-6.9 全部完成)
Phase 7: App.tsx 瘦身 ✅ 完成 (2115 → 289 行)

### 6.10 useGame.ts 业务逻辑提取为独立 workflow 模块

**目标：** 将 useGame.ts (~2980行) 中内联的业务逻辑提取为独立模块，降至 ~1200-1500 行

**原则：**
- 每个提取目标都是 **独立的业务域**，有自己的状态依赖和操作集合
- 提取后 useGame.ts 仅保留：状态声明、ref 创建、子 hook 调用、返回值组装
- 每个新模块通过 **hook 或工厂函数** 暴露，useGame.ts 通过调用获取 actions
- 不改业务逻辑，只做结构迁移

#### 提取目标清单（按收益排序）

| # | 提取目标 | 当前行号 | 行数 | 新文件 | 预计收益 |
|---|---------|---------|------|--------|---------|
| 1 | BDSM 关系操作 | 1072-1322 | ~251 | `useGame/bdsm/bdsmRelationshipOperations.ts` | -250 |
| 2 | 核心发送逻辑 (handleSend) | 1948-2185 | ~238 | `useGame/useSend.ts` | -220 |
| 3 | 工作流实例化区块 | 2410-2786 | ~374 | 分组为 3 个 coordinator | -340 |
| 4 | 图片生成协调器 | 1324-1510 | ~187 | `useGame/image/imageGenerationCoordinator.ts` | -180 |
| 5 | 返回值组装 | 2788-2980 | ~193 | `useGame/useGameReturnMapper.ts` | -180 |
| 6 | 子 Hook 集成 | 439-640 | ~202 | 分组内联优化 | -160 |
| 7 | 核心工作流委托 | 1512-1701 | ~190 | `useGame/npc/commandProcessorWrapper.ts` | -150 |
| 8 | 状态/Store 解构 | 262-436 | ~175 | `useGame/useGameStateAccess.ts` + refs hook | -110 |
| 9 | NSFW 系统初始化 | 831-964 | ~101 | `useGame/nsfw/nsfwSystemInitialization.ts` | -100 |
| 10 | 时间初始化+消息辅助 | 649-746 | ~87 | `useGame/time/timeInitialization.ts` + utils | -85 |
| **合计** | | | **~1998** | | **-1775** |

#### 实施步骤

**Step 1: 提取 BDSM 关系操作模块 (~250行)**
- 创建 `useGame/bdsm/bdsmRelationshipOperations.ts`
- 工厂函数 `创建BDSM关系操作工作流({ 校园系统, apiConfig, 设置校园系统, 获取主剧情接口配置 })`
- 导出 6 个同步操作 + 5 个异步操作的 useCallback
- useGame.ts 中替换为 `const bdsm = 创建BDSM关系操作工作流(...)` 解构

**Step 2: 提取 NSFW 系统初始化 effects (~100行)**
- 创建 `useGame/nsfw/nsfwSystemInitialization.ts`
- Hook `useNSFWSystemInitialization({ gameConfig, 校园系统, 都市网约车系统, 写真系统, 角色, 社交, 设置校园系统, 设置都市网约车系统, 设置写真系统 })`
- 内部包含 4 个 useEffect：校园欲望初始化、校园补全、都市乘客初始化、都市补全、写真初始化
- useGame.ts 中替换为单行调用

**Step 3: 提取核心发送逻辑 handleSend (~220行)**
- 创建 `useGame/useSend.ts`
- Hook `useSend({ 状态, actions, config, refs, 子hook返回值... })`
- 将 handleSend + onBDSM状态更新回调 + onBDSM见面预约更新回调 + 设备消息生成回调整体迁移
- handlePrivateChatSend、handleReportTaskComplete、handleStageAdvance 一并迁移
- useGame.ts 中替换为 `const { handleSend, handlePrivateChatSend, handleReportTaskComplete, handleStageAdvance } = useSend(...)`

**Step 4: 提取图片生成协调器 (~180行)**
- 创建 `useGame/image/imageGenerationCoordinator.ts`
- 工厂函数 `创建图片生成协调器({ apiConfig, gameConfig, 角色, 社交, 环境, 历史记录, apiConfigRef, ... })`
- 包含：读取文生图功能配置、NPC符合自动生图条件、提取新增NPC列表、执行单个NPC生图、执行NPC香闺秘档部位生图、触发新增NPC自动生图、场景生图触发工作流实例化
- useGame.ts 中替换为单行调用 + 解构

**Step 5: 提取工作流实例化分组 (~340行)**
- 创建 3 个 coordinator 文件：
  - `useGame/saveLoad/saveLoadCoordinator.ts` — 存读档工作流实例化 (~138行)
  - `useGame/session/sessionWorkflowCoordinator.ts` — 会话生命周期工作流实例化 (~110行)
  - `useGame/workflows/remainingWorkflowSetup.ts` — 手动NPC+运行时变量+手动图片+主角图片 (~126行)
- 每个都是工厂函数，接收依赖参数，返回 actions 对象

**Step 6: 提取返回值组装 (~180行)**
- 创建 `useGame/useGameReturnMapper.ts`
- 函数 `构建useGame返回值({ store, gameState, actions, meta, setters })`
- 纯结构映射，无业务逻辑
- useGame.ts 中替换为 `return 构建useGame返回值({ ... })`

**Step 7: 提取核心工作流委托 (~150行)**
- 将 `processResponseCommands` (107行) 提取为 `useGame/npc/commandProcessorCoordinator.ts`
- 将 `执行世界演变更新` 包装提取为 `useGame/world/worldEvolutionDelegate.ts`
- 将 `构建系统提示词` 包装保留（仅32行，不提取）

**Step 8: 优化状态解构 + Ref 区块 (~110行)**
- 创建 `useGame/useGameStateAccess.ts` — 封装 useGameState 解构 + Zustand store 解构
- 创建 `useGame/useGameRefs.ts` — 封装所有 useRef 声明
- 保留跨区块引用（如 apiConfigRef 被多个工作流使用）不做过度拆分

**Step 9: 时间初始化 + 消息辅助 (~85行)**
- 创建 `useGame/time/timeInitialization.ts` — 节日同步 + 游戏时间初始化 useEffect
- 创建 `useGame/utils/messageHelpers.ts` — 追加系统消息 + 构建标签解析选项
- useGame.ts 中替换为 hook 调用 + 工具函数导入

#### 验证策略

每完成一个 Step 后必须通过：
| 检查项 | 命令 |
|--------|------|
| TypeScript 编译 | `npx tsc --noEmit` |
| Vite 构建 | `npx vite build` |
| 运行时验证 | 开局 → 对话 → 存读档 |

#### 预期效果

| 文件 | 原行数 | 预计行数 | 减少 |
|------|--------|---------|------|
| `hooks/useGame.ts` | 2980 | ~1200-1500 | -1500~-1800 (-50%~-60%) |
| 新增文件 | 0 | ~10-12 | - |

#### 风险控制

| 风险 | 缓解措施 |
|------|---------|
| 依赖传参遗漏 | 每个工厂函数明确声明依赖接口，TypeScript 编译检查 |
| 行为变更 | 每步迁移后运行完整验证 |
| 循环依赖 | 新模块只依赖 useGame.ts 传入的参数，不反向导入 useGame |
| 中途卡住 | 每步独立可提交，可随时停止 |

### Phase 6.10: useGame.ts 业务逻辑提取为独立 workflow 模块（进行中）

**已完成：**
- [x] Step 1: 提取 BDSM 关系操作模块 (-250行) — `hooks/useGame/bdsmRelationshipOperations.ts`
- [x] Step 2: 提取 NSFW 系统初始化 effects (-100行) — `hooks/useGame/nsfw/nsfwSystemInitialization.ts`
- [x] Step 3: 提取核心发送逻辑 handleSend (-133行) — `hooks/useGame/useSend.ts`
- [x] Step 9: 提取时间初始化 + 消息辅助 (-100行) — `hooks/useGame/time/timeInitialization.ts`
- [x] Step 补充: 提取 handleSend onBDSM 回调 (-105行) — 合并到 `hooks/useGame/bdsmRelationshipOperations.ts`

**剩余步骤：**
- [x] Step 4: 提取图片生成协调器 (-190行) — `hooks/useGame/image/imageGenerationCoordinator.ts`
- [ ] Step 5: 提取工作流实例化分组 (~340行)
- [ ] Step 6: 提取返回值组装 (~180行)
- [ ] Step 7: 优化子 Hook 集成区块 (~160行)
- [ ] Step 8: 提取核心工作流委托 (~150行)
- [ ] Step 10: 优化状态解构 + Ref 区块 (~110行)

**useGame.ts 当前行数：** 2013 行（原始 ~2980 行，累计 -967 行）

总工期: 已完成主体目标
```

| Phase | 工期 | 风险 | 状态 |
|-------|------|------|------|
| 0. 准备 | 0.5天 | 无 | ✅ 完成 |
| 1. 拆分 system.ts | 2-3天 | 低（barrel 保护） | ✅ 完成 |
| 2. 清理重复 models | 1天 | 低（机械操作） | ✅ 完成 |
| 3. 目录重组 | 2-3天 | 低（单消费者） | ✅ 完成 |
| 4. 删除废弃 GM | 0.5天 | 无 | ✅ 完成 |
| 5. 修复 prompts | 0.5天 | 无 | ✅ 完成 |
| 6. 子 Hook 拆分 | 3-4天 | 中（最大行为变更） | ✅ 完成 (10/10 slice 迁移, 兼容层清理, 直接 store 访问) |
| 7. App.tsx 瘦身 | 1天 | 低（提取-only） | ✅ 完成 (7.2-7.5 + 7.11, 2115 → 289 行) |

---

## 关键文件清单

| 文件 | 原行数 | 当前行数 | 目标行数 | 变更类型 |
|------|--------|---------|---------|---------|
| `models/system.ts` | 1780 | ~10 (barrel) | ~10 | ✅ 拆分为 4 文件 + barrel |
| `hooks/useGame.ts` | 2952 | 2980 | ~500-800 | 部分完成 (兼容层清理, useState 清零, 直接 store 访问) |
| `App.tsx` | 2115 | 289 | ~800-1000 | ✅ 超额完成 (7.2-7.5 + 7.11, -1826行) |
| `components/features/lazyComponents.tsx` | 新建 | 131 | - | ✅ 55 个懒组件声明 |
| `hooks/useResponsive.ts` | 新建 | 23 | - | ✅ 响应式断点检测 |
| `hooks/useModalOpeners.ts` | 新建 | 327 | - | ✅ 面板开关逻辑 |
| `hooks/useConfirmSystem.tsx` | 新建 | 57 | - | ✅ 确认对话框逻辑 |
| `hooks/useGame/index.ts` | 新建 | ~195 | - | ✅ barrel 导出入口 |
| `hooks/useGame/subsystems/zustandStore.ts` | 新建 | 432 | - | ✅ Zustand 主 store (10 slices, 兼容层已清理) |
| `hooks/useGame/useTravelAndTrade.ts` | 134 | 114 | - | ✅ 迁移到 Zustand, 移除 useState + 设备重复逻辑 |
| `hooks/useGame/useDevice.ts` | 123 | 122 | - | ✅ 直接 store 选择器访问 |
| `components/app/GameView.tsx` | 从 App.tsx 提取 | 26081 | - | ✅ 游戏主视图 |
| `components/app/ModalLayer.tsx` | 从 App.tsx 提取 | 55339 | - | ✅ 弹窗层渲染 |
| `components/app/NSFWModals.tsx` | 从 App.tsx 提取 | 13134 | - | ✅ NSFW 弹窗 |
| `components/app/MemoryModals.tsx` | 从 App.tsx 提取 | 5394 | - | ✅ 记忆弹窗 |
| `components/app/useAppModalState.ts` | 从 App.tsx 提取 | 7243 | - | ✅ 弹窗状态 hook |
| `components/app/useAppEffects.tsx` | 从 App.tsx 提取 | 20463 | - | ✅ 副作用管理 |

## Phase 1-3 变更统计

| 指标 | 数量 |
|------|------|
| 新建文件 | 4 (models/) + 14 (hooks/useGame/ 子目录) |
| 删除文件 | 13 (models/domain/ + models/game/) |
| 移动文件 | 65+ (hooks/useGame/ 重组) |
| 修复 import | 15+ 文件 (components/, services/, utils/, App.tsx) |
| 新增 TypeScript 错误 | 0 |
| Vite build | ✅ 通过 |

---

## Zustand 迁移方案 (Phase 6.7+)

### 当前架构痛点

| 问题 | 现状 | 影响 |
|------|------|------|
| God Hook | `useGame.ts` 2651行，30+ 个 `useState` | 任何新增状态都要改这个文件 |
| 重渲染 | `useGame()` 返回大对象，子组件难以选择订阅 | 一处状态变更触发全量重渲染 |
| 测试困难 | 所有状态绑在 React hook 上，无法独立测试 | 业务逻辑测试需要 React 测试渲染 |
| 跨组件共享 | 必须通过 Context 层层传递 | Context 层级越多，订阅越难优化 |

### Zustand 优势

1. **精准订阅** — `useStore(s => s.右下角提示列表)` 只在该字段变化时触发渲染
2. **状态与 UI 解耦** — store 是纯 JS 对象，业务逻辑可在 React 外独立测试
3. **跨模块零耦合** — 任何模块通过 `import { useGameStore }` 即可读写状态
4. **中间件生态** — persist (IndexedDB 持久化)、devtools (Chrome 调试)、immer (不可变更新)
5. **TypeScript 一等公民** — 完整类型推导
6. **体积极小** — < 1KB gzipped，无依赖
7. **渐进式迁移** — 已有的 `{ state, actions }` 模式直接映射到 Zustand slice

### 核心策略

**渐进式替换，不做大爆炸重写。** 每个 slice 迁移后保持兼容层，`useGame()` 返回值不变，App.tsx 完全无感知。

### Phase 6.7: 完善兼容层，验证通路 (1天)

**目标：** 将 `zustandStore.ts` 接入 `useGame.ts`，替换现有的 `useUISlice` / `useTravelSlice` hook 实现

**步骤：**
1. 在 `useGame.ts` 中将 `useUISlice` 替换为 `useUIFromStore()`
2. 在 `useGame.ts` 中将 `useTravelSlice` 替换为 `useTravelFromStore()`
3. 验证兼容层返回值与原有 hook 完全一致（对比 state 和 actions 签名）
4. 跑通 `npx tsc --noEmit` + `npx vite build` + 运行时验证

**验收标准：**
- TypeScript 编译通过 ✅
- Vite 构建通过 ✅
- 运行时通知提示、旅行事件列表功能正常 ✅

**已完成操作 (2026-05-08):**
1. 重写 `zustandStore.ts` — 使用正确的 `旅行事件` 类型，增加 `set*` 兼容方法
2. 在 `useGame.ts` 中导入 `useUIFromStore()`
3. 将 `可重Roll计数`, `聊天区自动滚动抑制令牌`, `聊天区强制置底令牌` 从 `useState` 迁移到 Zustand store
4. 删除对应的 3 个 `useState` 声明
5. 保留 `右下角提示列表` 和 `set右下角提示列表` 为 `useState`（通知系统和 settingsActions 依赖深，后续迁移）
6. 保留 `旅行事件列表` 在 `useTravelAndTrade` 中（写侧未迁移，避免状态不一致）
7. `useTravelFromStore()` 就绪但未接入，留待 Phase 6.8

### Phase 6.8: 迁移核心 slices (3-4天) ✅ 完成

按依赖复杂度排序，逐个迁移：

| 顺序 | Slice | 预估行数 | 难度 | 状态 |
|------|-------|---------|------|------|
| 1 | `UISlice` | ~70 | 低 | ✅ 已迁移 (Phase 6.7) |
| 2 | `DeviceSlice` | ~15 | 低 | ✅ 已迁移 |
| 3 | `ImageSlice` | ~15 | 中 | ✅ 已迁移 |
| 4 | `SettingsSlice` | ~20 | 低 | ✅ 已迁移 |
| 5 | `WorldSlice` | ~30 | 中 | ✅ 已迁移 |
| 6 | `MemorySlice` | ~40 | 中 | ✅ 已迁移 |
| 7 | `VariableSlice` | ~25 | 中 | ✅ 已迁移 |
| 8 | `OpeningSlice` | ~10 | 低 | ✅ 已迁移 |
| 9 | `SceneConfigSlice` | ~15 | 低 | ✅ 已迁移 |
| 10 | `TravelSlice` | ~10 | 低 | ✅ 已迁移 (Phase 6.9) |

> **注：** 原始计划中的 CampusSlice、CharacterSlice、StorySlice 涉及核心业务逻辑（校园系统、角色管理、剧情发送），跨边界依赖复杂，留待 Phase 6.10 处理。当前 10 个 slice 覆盖了 UI、设备、图片、配置、世界演变、记忆、变量、开局、场景、旅行等独立状态域。

每个 slice 迁移步骤：
1. 将 `useState` / `useCallback` 转换为 Zustand slice
2. 添加到 `zustandStore.ts` 的 store 合并
3. 创建兼容层函数 `useXxxFromStore()`
4. 在 `useGame.ts` 中替换原有 hook 调用
5. 验证 `npx tsc --noEmit` + `npx vite build`

### Phase 6.9: 清理兼容层，完成迁移 (1天) ✅ 完成

**目标：** 移除所有 `useXxxFromStore()` 兼容层函数，改为直接通过 `useGameStore` 选择器访问，完成最后的状态迁移

**步骤：**

1. ~~删除所有 hook-based slice 文件~~ (`useUISlice.ts`、`useTravelSlice.ts` 等) — ✅ 已完成 (已 staged)
2. 删除 zustandStore.ts 中 10 个 `useXxxFromStore()` 兼容层函数 (-174行)
3. 更新 useGame.ts 导入和状态获取，改用 `const store = useGameStore()` + 局部变量别名 (-98行)
4. 迁移 useTravelAndTrade.ts 到 Zustand，移除 useState 和设备重复逻辑 (-24行)
5. 更新 useDevice.ts 直接访问 Store (-8行)
6. 持久化策略：维持现状（不引入 persist 中间件，原因见下方）
7. 最终验证

**持久化决策：** 不在本阶段引入 Zustand `persist` 中间件。原因：
- 当前 8 个手动 save 函数写入独立 IndexedDB key，粒度精细
- Zustand persist 会合并为单个 JSON blob，需迁移/回滚方案
- 部分 Zustand 状态（滚动令牌、重Roll计数、草稿）不应持久化
- 等剩余核心状态（角色、环境等）全部迁移后再统一规划

**实际行数变化：**

| 文件 | 预期 | 实际 |
|------|------|------|
| `zustandStore.ts` | -174 → ~432 | 432 ✅ |
| `useGame.ts` | -98 → ~2900 | 2980 (实际 -18，兼容层合并更紧凑) |
| `useDevice.ts` | -8 → ~115 | 122 (实际 -1，改动较小) |
| `useTravelAndTrade.ts` | -24 → ~110 | 114 ✅ |

> **注意:** useGame.ts 不会在本阶段达到 500-800 行目标。剩余 ~2350 行是业务逻辑和工作流协调器，需要后续阶段提取为独立模块（Phase 6.10）。

### 迁移后架构（实际状态）

```
hooks/useGame/
├── useGame.ts              # 主 hook (~2980行)：业务逻辑 + Zustand store 直接访问
├── useDevice.ts            # 设备子 hook (122行)
├── useTravelAndTrade.ts    # 旅行/交易 (114行)
├── subsystems/
│   └── zustandStore.ts     # 主 store (432行)：10 个 Zustand slices，无兼容层
│                           #   UI, Travel, Device, Image, Settings,
│                           #   World, Memory, Variable, Opening, SceneConfig
├── index.ts                # barrel 导出
└── [14 功能子目录]         # memory/, image/, npc/, world/, planning/,
                            # device/, response/, travel/, ui/, time/,
                            # opening/, quality/, campusNSFW/, config/,
                            # saveLoad/, sendWorkflow/, eventTrigger/,
                            # state/, narrativeGrammar/, transforms/
                            # 以及 40+ 个根级 workflow 文件
```

> **备注:** 文档 Phase 6.9 原始计划中的 `subsystems/slices/` 目录结构未实施。当前所有 slice 直接内联在 `zustandStore.ts` 中，通过 `createGameXxxSlice` 函数定义，在 `create<GameStore>()` 中合并。这种扁平结构避免了额外的文件拆分开销，与项目"单 store 多 slice"策略一致。

### 关键设计决策（最终状态）

1. **单 store 多 slice** — 所有状态在一个 `useGameStore` 中，避免多 store 循环依赖 ✅
2. **直接 store 访问** — 兼容层已清理，`useGame.ts` 和 `useDevice.ts` 直接通过 `useGameStore` 选择器访问，`useGame()` 返回值不变 ✅
3. **跨 slice 访问** — 通过 Zustand `get()` 获取其他 slice 状态 ✅
4. **持久化策略** — 维持手动 IndexedDB 写入（非 Zustand persist），保持 8 个独立 key 粒度 ✅
5. **不碰 App.tsx 迁移期** — Zustand 迁移期间 App.tsx 完全不变 ✅
6. **useGame.ts 未完全瘦身** — 仍 ~2980 行，业务逻辑未提取为独立模块（留待 Phase 6.10）

### 风险控制（已验证）

| 风险 | 缓解措施 | 状态 |
|------|---------|------|
| 状态不一致 | 兼容层保证过渡期行为一致 | ✅ 兼容层已清理，行为验证通过 |
| 重渲染回归 | 直接 `useGameStore(s => s.field)` 精确订阅 | ✅ 无全量重渲染问题 |
| 持久化丢失 | 维持手动 IndexedDB 写入，不受 Zustand 迁移影响 | ✅ saveSettings 等函数正常工作 |
| 迁移中途卡住 | 每步迁移后 tsc + vite build 验证 | ✅ 所有步骤通过 |

### 预计工期

| 阶段 | 工期 | 状态 |
|------|------|------|
| Phase 6.7: 验证通路 | 1天 | ✅ 完成 (2026-05-08) |
| Phase 6.8: 核心 slices | 3-4天 | ✅ 完成 (10/10: 全部 useState 已迁移) |
| Phase 6.9: 清理兼容层 | 1天 | ✅ 完成 (删除 10 个 useXxxFromStore, 直接 store 访问, useTravelAndTrade 迁移) |
| **总计** | **5-6天** | |

### 单 store vs 多 store 对比

采用 **单 store 多 slice** 模式，原因：
- 避免多 store 间的循环依赖
- 统一的 devtools 调试入口
- 一致的 persist 配置
- 简化跨 slice 状态访问 (`get()` 即可，不需要 import 其他 store)
