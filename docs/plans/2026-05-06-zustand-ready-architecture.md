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

### 6.2 已完成 Slice (3/13)

| Slice | 对应目录 | 行数 | 关键状态 | 状态 |
|-------|---------|------|---------|------|
| `useTravelSlice` | travel/ | ~77 | 旅行事件, 旅行/探索/购买/出售 | ✅ 已创建并接入 useGame.ts |
| `useBDSMSlice` | bdsm/ | ~151 | BDSM 关系, 任务, 契约, AI 生成/评价 | ✅ 已创建并接入 useGame.ts |
| `useUISlice` | ui/ | ~92 | 通知, 回档快照, 重Roll计数 | ✅ 已创建并接入 useGame.ts |

**useGame.ts 行数变化：** 2952 → 2651 (-301行)

## Phase 6: 子 Hook 拆分 — Zustand 就绪 (进行中)

### 6.5 Zustand 已安装 ✅
- `zustand@5.0.13` 已安装 (`pnpm add zustand`)
- `hooks/useGame/subsystems/zustandStore.ts` 已创建，包含 UI + Travel 两个 Zustand slice
- 兼容层 `useUIFromStore()` / `useTravelFromStore()` 提供与原有 hook 相同的 `{ state, actions }` 接口
- 未来逐步将 useGame.ts 中所有 useState 迁移到此 store

### 6.6 Slice 清单

| Slice | 对应目录 | 预估行数 | 关键状态 | 难度 |
|-------|---------|---------|---------|------|
| `useImageSlice` | image/ | ~300 | NPC/主角/场景生图队列 | 中 (动态import) |
| `useCharacterSlice` | npc/, character state | ~200 | 角色, NPC CRUD | 高 (跨 memory/campus) |
| `useWorldSlice` | world/ | ~200 | 世界, 世界演变 | 中 (async workflow) |
| `useMemorySlice` | memory/ | ~250 | 记忆总结, 记忆召回 | 高 (async + processor) |
| `useStorySlice` | core/, opening/, response/ | ~400 | 剧情, 发送, 润色 | 高 (最大, 核心流程) |
| `useCampusSlice` | campus/, semester/ | ~250 | 校园, 学术, 日程 | 中 |
| `useVariableSlice` | planning/ | ~200 | 变量生成, 校准 | 中 (async workflow) |
| `useDeviceSlice` | device/ | ~100 | 移动设备状态 | 低 (mostly pass-through) |
| `useCombatSlice` | combatCalculation | ~150 | 战斗状态, 计算 | 低 (纯计算) |
| `useApiSlice` | apiConfig, prompts | ~150 | API 配置, 提示词预设 | 低 (配置管理) |

> **备注：** 剩余 slice 的跨边界依赖较深（NPC 管理涉及 memory/campus/image 三个域，世界演变涉及 planning/variable），建议按功能优先级逐步完成，而非一次性全部提取。

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

## Phase 7: App.tsx 瘦身 (进行中)

**目标：** 从 2115 行减少到 ~800-1000 行

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
App.tsx: 2027 → 1857 行（累计从 2115 → 1857, -258 行）

### 7.5 提取 useConfirmSystem hook ✅ 完成
提取确认对话框逻辑（~30 行）到 `hooks/useConfirmSystem.tsx`，包括 confirmState、requestConfirm、resolveConfirm、InAppConfirmModal 渲染
App.tsx: 1857 → 1828 行（累计从 2115 → 1828, -287 行）

### 7.6-7.9 提取 useDerivedState / useTicker / useVisualTheme / useKeyboardShortcuts — 跳过
activeMobileWindow 与 useModalOpeners 存在循环依赖，useTicker/useVisualTheme 行数收益极低（各 ~30 行）。提取复杂度远超收益。

### 7.10 提取 useContextSnapshot hook
App.tsx 中 context snapshot 相关代码仅约 5 行（调用 actions.getContextSnapshot），提取价值有限。

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
Phase 0 ✓ ─┬─ Phase 1 ✓ ────────┬─ Phase 6 (下一步) ─┬─ Phase 7
           │                     │                     │
           ├─ Phase 2 ✓ ─────────┘                     │
           │                                           │
           ├─ Phase 3 ✓ ───────────────────────────────┘
           │
           ├─ Phase 4 ✓
           │
           └─ Phase 5 ✓

Phase 0/1/2/3/4/5 已完成
Phase 6: 子 Hook 拆分 — Zustand 就绪 (下一步)
Phase 7: App.tsx 瘦身 (可与 Phase 6 并行)

总工期: 10-14 天
```

| Phase | 工期 | 风险 | 状态 |
|-------|------|------|------|
| 0. 准备 | 0.5天 | 无 | ✅ 完成 |
| 1. 拆分 system.ts | 2-3天 | 低（barrel 保护） | ✅ 完成 |
| 2. 清理重复 models | 1天 | 低（机械操作） | ✅ 完成 |
| 3. 目录重组 | 2-3天 | 低（单消费者） | ✅ 完成 |
| 4. 删除废弃 GM | 0.5天 | 无 | ✅ 完成 |
| 5. 修复 prompts | 0.5天 | 无 | ✅ 完成 |
| 6. 子 Hook 拆分 | 3-4天 | 中（最大行为变更） | 进行中 (3/13 slice) |
| 7. App.tsx 瘦身 | 1天 | 低（提取-only） | 已完成 (7.2-7.5 完成) |

---

## 关键文件清单

| 文件 | 原行数 | 当前行数 | 目标行数 | 变更类型 |
|------|--------|---------|---------|---------|
| `models/system.ts` | 1780 | ~10 (barrel) | ~10 | ✅ 拆分为 4 文件 + barrel |
| `hooks/useGame.ts` | 2952 | 2651 | ~500-800 | 部分完成 (3 slice 接入, -301行) |
| `App.tsx` | 2115 | 1828 | ~800-1000 | 部分完成 (7.2-7.5 完成, -287行) |
| `components/features/lazyComponents.tsx` | 新建 | 122 | - | ✅ 55 个懒组件声明 |
| `hooks/useResponsive.ts` | 新建 | 21 | - | ✅ 响应式断点检测 |
| `hooks/useModalOpeners.ts` | 新建 | ~330 | - | ✅ 面板开关逻辑 |
| `hooks/useConfirmSystem.tsx` | 新建 | ~57 | - | ✅ 确认对话框逻辑 |
| `hooks/useGame/index.ts` | 新建 | ~195 | - | ✅ barrel 导出入口 |
| `hooks/useGame/subsystems/types.ts` | 新建 | ~340 | - | ✅ slice 契约定义 |
| `hooks/useGame/subsystems/zustandStore.ts` | 新建 | ~110 | - | ✅ Zustand 主 store (UI + Travel) |
| `hooks/useGame/subsystems/useTravelSlice.ts` | 新建 | ~77 | - | ✅ 旅行/交易 slice (hook 模式) |
| `hooks/useGame/subsystems/useBDSMSlice.ts` | 新建 | ~151 | - | ✅ BDSM 关系 slice (hook 模式) |
| `hooks/useGame/subsystems/useUISlice.ts` | 新建 | ~92 | - | ✅ UI/通知/回档 slice (hook 模式) |

## Phase 1-3 变更统计

| 指标 | 数量 |
|------|------|
| 新建文件 | 4 (models/) + 14 (hooks/useGame/ 子目录) |
| 删除文件 | 13 (models/domain/ + models/game/) |
| 移动文件 | 65+ (hooks/useGame/ 重组) |
| 修复 import | 15+ 文件 (components/, services/, utils/, App.tsx) |
| 新增 TypeScript 错误 | 0 |
| Vite build | ✅ 通过 |
