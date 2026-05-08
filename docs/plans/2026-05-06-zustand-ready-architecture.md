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

### Phase 6.8: 迁移核心 slices (3-4天)

按依赖复杂度排序，逐个迁移：

| 顺序 | Slice | 预估行数 | 难度 | 理由 |
|------|-------|---------|------|------|
| 1 | `useDeviceSlice` | ~100 | 低 | 纯透传，无复杂依赖 |
| 2 | `useCombatSlice` | ~150 | 低 | 纯计算，无副作用 |
| 3 | `useApiSlice` | ~150 | 低 | 配置管理，独立 |
| 4 | `useImageSlice` | ~300 | 中 | 图片队列，有动态 import |
| 5 | `useWorldSlice` | ~200 | 中 | 世界演变，有 async workflow |
| 6 | `useCampusSlice` | ~250 | 中 | 校园系统，模块独立 |
| 7 | `useVariableSlice` | ~200 | 中 | 变量生成，async |
| 8 | `useCharacterSlice` | ~200 | 高 | 跨 memory/campus 依赖 |
| 9 | `useMemorySlice` | ~250 | 高 | async + processor，复杂 |
| 10 | `useStorySlice` | ~400 | 高 | 最大最核心，最后迁移 |

每个 slice 迁移步骤：
1. 将 `useState` / `useCallback` 转换为 Zustand slice
2. 添加到 `zustandStore.ts` 的 store 合并
3. 创建兼容层函数 `useXxxFromStore()`
4. 在 `useGame.ts` 中替换原有 hook 调用
5. 验证 `npx tsc --noEmit` + `npx vite build`

### Phase 6.9: 清理兼容层，完成迁移 (1天)

**目标：** 所有 slice 迁移到 Zustand 后，移除 hook-based 实现

**步骤：**
1. 删除所有 hook-based slice 文件 (`useUISlice.ts`、`useTravelSlice.ts` 等)
2. `useGame()` 变为薄适配层 (~100-200行)，仅做 `{ state, meta, setters, actions }` 格式转换
3. 使用 Zustand `persist` 中间件替代手动 `saveSettings()` / `loadSettings()`
4. 最终验证

### 迁移后架构

```
hooks/useGame/
├── useGame.ts              # 薄适配层 (~150行)：组装 slices 为 { state, meta, setters, actions }
├── subsystems/
│   ├── zustandStore.ts     # 主 store: create<GameStore>() 合并所有 slices
│   ├── types.ts            # 接口契约 (不变)
│   └── slices/             # 13 个 Zustand slices
│       ├── uiSlice.ts
│       ├── travelSlice.ts
│       ├── deviceSlice.ts
│       ├── combatSlice.ts
│       ├── apiSlice.ts
│       ├── imageSlice.ts
│       ├── worldSlice.ts
│       ├── campusSlice.ts
│       ├── variableSlice.ts
│       ├── characterSlice.ts
│       ├── memorySlice.ts
│       ├── storySlice.ts
│       └── bdsmSlice.ts
```

### 关键设计决策

1. **单 store 多 slice** — 所有状态在一个 `useGameStore` 中，避免多 store 循环依赖
2. **兼容层保留** — 每个 slice 提供 `{ state, actions }` 兼容函数，确保 `useGame()` 返回值不变
3. **跨 slice 访问** — 通过 Zustand `get()` 获取其他 slice 状态
4. **持久化策略** — Zustand `persist` 中间件替代手动持久化
5. **不碰 App.tsx** — 迁移期间 App.tsx 完全不变

### 风险控制

| 风险 | 缓解措施 |
|------|---------|
| 状态不一致 | 每个 slice 迁移后做运行时对比：hook 值 vs store 值 |
| 重渲染回归 | `useStore(s => s.field)` 精确订阅 |
| 持久化丢失 | persist 中间件正确配置 IndexedDB 适配 |
| 迁移中途卡住 | 兼容层保证随时可回退 |

### 预计工期

| 阶段 | 工期 | 状态 |
|------|------|------|
| Phase 6.7: 验证通路 | 1天 | ✅ 完成 (2026-05-08) |
| Phase 6.8: 核心 slices | 3-4天 | ⬜ 待开始 |
| Phase 6.9: 清理兼容层 | 1天 | ⬜ 待开始 |
| **总计** | **5-6天** | |

### 单 store vs 多 store 对比

采用 **单 store 多 slice** 模式，原因：
- 避免多 store 间的循环依赖
- 统一的 devtools 调试入口
- 一致的 persist 配置
- 简化跨 slice 状态访问 (`get()` 即可，不需要 import 其他 store)
