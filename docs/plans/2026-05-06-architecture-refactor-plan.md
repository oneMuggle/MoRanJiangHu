# 墨色江湖架构重构方案

> 日期: 2026-05-06
> 状态: 分析规划中
> 触发: 多模块持续增加，需要更好的组织形式

---

## 1. 当前架构全景

### 1.1 目录结构

```
src/
├── App.tsx                          # 根组件 (2115行) — 路由、弹窗管理、响应式布局
├── hooks/
│   ├── useGame.ts                   # 主 hook (2952行) — 所有游戏状态 + actions
│   ├── useGameState.ts              # 状态初始化
│   └── useGame/                     # 业务逻辑工作流 (142 个 .ts 文件)
│       ├── campusNSFW/              # 校园 NSFW 子模块 (11 文件)
│       ├── config/                  # 设置持久化 (1 文件)
│       ├── eventTrigger/            # 事件触发器
│       ├── image/                   # 手动图片工作流 (1 文件)
│       ├── narrativeGrammar/        # 叙事语法
│       ├── saveLoad/                # 存读档 (1 文件)
│       ├── sendWorkflow/            # 主剧情发送 (4 文件)
│       ├── state/                   # 状态工厂与规范化 (3 文件)
│       ├── transforms/              # 状态转换
│       └── [110+ 个独立 .ts 文件]    # 散落在根目录的工作流
├── components/
│   ├── features/                    # 25 个功能模块目录
│   │   ├── [Module]/                # 每个模块 = 桌面 + 移动端组件
│   │   ├── CampusDesireDashboard.tsx   # 散落的顶层组件
│   │   ├── MobileCampusDesireApp.tsx   # 散落的顶层组件
│   │   ├── BDSM*Modal.tsx (4 个)       # 散落的顶层组件
│   │   └── AGENTS.md
│   ├── layout/                      # 布局组件
│   └── ui/                          # 共享 UI 原语
├── models/
│   ├── domain/                      # 领域模型 (character, item, battle...)
│   ├── game/                        # 运行时游戏状态 (world, story, worldbook)
│   ├── planning/                    # 剧情规划
│   ├── fandomPlanning/              # 同人规划
│   ├── campusNSFW/                  # 校园 NSFW 模型
│   ├── eraTheme/                    # 时代主题
│   └── [顶层 .ts 文件]               # 散落的类型定义
├── services/
│   ├── ai/                          # AI 客户端 (text + image)
│   ├── gameMaster/                  # GM 多智能体
│   ├── novel-decomposition/         # 小说拆分
│   └── [顶层 .ts 文件]
├── prompts/
│   ├── core/                        # 核心规则
│   ├── runtime/                     # 运行时注入
│   ├── writing/                     # 写作风格
│   ├── stats/                       # 统计格式
│   ├── difficulty/                  # 难度规则
│   └── shared/                      # 共享片段
└── utils/                           # 工具函数
```

### 1.2 数据流

```
App.tsx
  └─ useGame()
       ├─ useGameState()          # 从 IndexedDB 初始化
       ├─ 40+ useState/useRef     # 本地 UI 状态
       ├─ 142 个子模块 import      # 业务逻辑
       └─ 返回 { state, meta, setters, actions }
            ├─ state: 所有游戏状态 (扁平结构)
            ├─ meta: loading, notifications, progress
            ├─ setters: setShowXxx 系列
            └─ actions: 200+ 个方法
                 └─ App.tsx 通过 props 透传给 25+ 个 feature 组件
```

### 1.3 大文件清单

| 文件 | 行数 | 问题 |
|------|------|------|
| `hooks/useGame.ts` | 2952 | 核心单体，所有状态+actions汇聚点 |
| `App.tsx` | 2115 | 50+ lazy组件声明 + 路由逻辑 + 每个modal的状态管理 |
| `hooks/useGame/systemPromptBuilder.ts` | 1733 | 提示词构建逻辑 |
| `hooks/useGame/openingStoryWorkflow.ts` | 1466 | 开局剧情生成 |
| `hooks/useGame/promptRuntime.ts` | 751 | 运行时提示词工具 |
| `hooks/useGame/npcContext.ts` | 690 | NPC上下文构建 |
| `hooks/useGame/imagePresetWorkflow.ts` | 618 | 图片预设 |
| `hooks/useGame/bdsmTaskWorkflow.ts` | 509 | BDSM任务 |
| `hooks/useGame/npcImageStateWorkflow.ts` | 551 | NPC图片状态 |
| `hooks/useGame/batchImageGenerationWorkflow.ts` | 484 | 批量生图 |
| `hooks/useGame/deviceAiWorkflow.ts` | 484 | 设备AI |
| `hooks/useGame/historyTurnWorkflow.ts` | 486 | 历史回合 |

---

## 2. 痛点分析

### 2.1 useGame.ts — 上帝 Hook (2952行)

**症状：**
- 40+ 个 `useState` + 20+ 个 `useRef` 集中在一个 hook 中
- 200+ 个 `useCallback` 方法，通过 `actions` 对象一次性返回
- 142 个子模块的直接 import 依赖
- 每次 render 都要传递整个 actions 对象到子组件
- 新增模块需要在此 hook 中加 state → 加 action → 加 return

**根因：**
- 所有子系统共享同一个扁平 state 对象
- 缺少子 hook 抽象，每个子系统没有独立的 `{ state, actions }` 边界
- `useCallback` 的依赖数组经常跨越多个子系统状态，导致不必要的重渲染

### 2.2 App.tsx — 上帝组件 (2115行)

**症状：**
- 50+ 个 `React.lazy` 组件声明
- 每个 feature modal 一个 `showXxx` useState
- 大量条件渲染逻辑 (桌面 vs 移动端)
- 直接把 `actions.methodName` 当 props 透传
- 快照、通知、变量生成等 UI 状态散落在组件内

**根因：**
- App.tsx 承担了「路由 + 状态管理 + 组件编排」三重职责
- 没有「模态路由」抽象层
- 每个 feature modal 的打开/关闭逻辑没有统一封装

### 2.3 工作流文件散落

**症状：**
- `hooks/useGame/` 下有 110+ 个平铺的 `.ts` 文件
- 只有 9 个目录子模块，其余全部平铺
- 按功能相关性本应归组：
  - 记忆相关：`memoryUtils`, `memoryRecall`, `memoryConsolidation`, `memorySummaryHandlers` (4个)
  - 图片相关：`npcImageWorkflow`, `npcImageStateWorkflow`, `npcSecretImageWorkflow`, `playerImageWorkflow`, `sceneImageWorkflow`, `sceneImageArchiveWorkflow`, `sceneImageTriggerWorkflow`, `batchImageGenerationWorkflow`, `imagePresetWorkflow` (9个)
  - NPC相关：`npcContext`, `npcMemorySummary`, `manualNpcWorkflow`, `npcImageStateWorkflow` (交叉)
  - 规划相关：`planningUpdateWorkflow`, `planningReasonCollector`, `variableCalibration*` (5个)
  - 校园相关：`campusNSFWEngine`, `campusForumWorkflow`, `campusRumorWorkflow`, `campusPromptInjector`, `academicWorkflow`, `scheduleWorkflow`, `semesterCalendarWorkflow`, `clubWorkflow` (8个)
  - BDSM相关：`bdsmTaskWorkflow`, `bdsmMeetingWorkflow`, `bdsmMeetingTrigger`, `bdsmTaskTrigger`, `bdsmStateIntegration`, `bdsmStateParser`, `bdsmForumEngine` (7个)
  - 城市司机NSFW：`urbanDriverNSFWEngine`, `urbanDriverNSFWIntegration` (2个)
  - 事件触发：`eventTrigger`, `eventTriggerManager` + `eventTrigger/` (3个)
  - 设备AI：`deviceAiWorkflow`, `deviceRefreshMonitor`, `mobileDeviceWorkflow`, `triggerDeviceMessageWorkflow` + `useDevice*` (4个 hook)
  - 响应处理：`responseCommandProcessor`, `responseTextHelpers`, `storyResponseGuards` (3个)
  - 世界演变：`worldEvolutionWorkflow`, `worldEvolutionControl`, `worldEvolutionUtils`, `worldGenerationWorkflow`, `worldStateIntegrity` (5个)
  - 变量生成：`variableCalibration`, `variableCalibrationCoordinator`, `variableCalibrationMerge`, `variableModelWorkflow`, `variableGenerationProgress`, `variableGenerationQueue`, `variableGenerationProgress` (7个)
  - 时间/回合：`timeUtils`, `historyTurnWorkflow`, `historyUtils` (3个)
  - 通知/快照：`notificationSystem`, `rollbackSnapshot`, `contextSnapshot` (3个)
  - 叙事语法：`narrativeGrammar.ts` + `narrativeGrammar/` 目录

### 2.4 Feature 组件组织

**症状：**
- `components/features/` 下 25 个目录 + 6 个散落文件 (`CampusDesireDashboard.tsx`, `BDSM*Modal.tsx` x4, `MobileCampusDesireApp.tsx`)
- 每个 feature 内部结构不统一：
  - 有的只有 `Modal.tsx` + `Mobile*.tsx`
  - 有的有 `constants.ts`, `types.ts`, `hooks/`
- 新增模块不知道应该遵循什么约定

### 2.5 模型分层不清晰

**症状：**
- `models/` 顶层和 `models/domain/` 存在同名文件 (`battle.ts`, `character.ts`, `imageGeneration.ts`, `item.ts`...)
- `models/campusNSFW.ts` (顶层) 和 `models/campusNSFW/` (目录) 并存
- `models/eraTheme.ts` (顶层) 和 `models/eraTheme/` (目录) 并存
- 不清楚哪个是权威定义

---

## 3. 候选方案对比

### 方案 A：渐进式子 Hook 拆分 + 目录重组 (推荐)

**核心思路：** 在现有架构基础上，做三件事：
1. 从 `useGame.ts` 拆分出独立子 hook
2. 将 `hooks/useGame/` 下平铺文件按功能域归组
3. 清理 models 的重复文件

**改动范围：**
- `hooks/useGame.ts` → 拆分出 6-8 个子 hook
- `hooks/useGame/` → 创建 10+ 个功能目录
- `models/` → 清理顶层与 domain/ 的重叠
- `components/features/` → 统一模块内部结构

**优点：**
- 渐进式，每步可独立验证和回退
- 不改变运行时行为
- `App.tsx` 和外部调用完全不受影响（子 hook 最终合并回同一个返回值）
- 团队学习成本低

**缺点：**
- 不解决 App.tsx 复杂度的根本问题
- 子 hook 间仍有交叉依赖

**复杂度：中 | 风险：低 | 预计工时：5-7 天**

### 方案 B：Feature-Sliced Design (FSD) 重构

**核心思路：** 采用 FSD 架构，按 feature 分层：
```
src/
├── app/          # App.tsx, providers, routing
├── pages/        # 页面级组合
├── widgets/      # 复合 UI 组件 (LeftPanel, RightPanel, Chat)
├── features/     # 用户可触发的功能 (打开角色面板, 发送消息)
├── entities/     # 业务实体 (角色, NPC, 世界, 装备)
└── shared/       # 工具, UI 原语
```

**优点：**
- 业界成熟的架构模式
- 清晰的依赖方向（只能向上依赖）
- 新增模块有明确的位置和约定

**缺点：**
- 需要大规模文件移动（100+ 文件）
- 游戏项目的「状态驱动」特性与 FSD 的「功能驱动」不完全匹配
- 学习曲线陡峭
- 短期内降低开发速度

**复杂度：高 | 风险：高 | 预计工时：15-20 天**

### 方案 C：模块化状态总线 (Redux/Zustand 模式)

**核心思路：** 引入独立状态管理库，将 `useGame.ts` 替换为 Store：
```
src/stores/
├── gameState.ts      # 主 store
├── characterSlice.ts
├── worldSlice.ts
├── socialSlice.ts
├── imageSlice.ts
└── uiSlice.ts
```

**优点：**
- 彻底解决 useGame.ts 的复杂度问题
- 子模块可以独立订阅，避免不必要重渲染
- 状态序列化/持久化更清晰

**缺点：**
- 引入新依赖（Zustand/Redux）
- 需要重写所有状态读写逻辑
- 现有 IndexedDB 集成需要适配
- 风险最高，迁移最慢

**复杂度：高 | 风险：高 | 预计工时：10-15 天**

---

## 4. 推荐方案：方案 A（渐进式子 Hook 拆分 + 目录重组）

### 为什么选 A

1. **风险最低** — 不改变运行时行为，每步可独立验证
2. **见效最快** — 先解决最痛的 `useGame/` 目录混乱问题
3. **为 B 和 C 铺路** — 子 hook 边界确立后，后续迁移到 FSD 或 Zustand 更容易
4. **不影响开发节奏** — 现有代码调用方式不变

---

## 5. 分阶段迁移计划

### Phase 1: 目录重组 (hooks/useGame/) — 1-2 天

**目标：** 将 110+ 个平铺文件归入功能目录

**新目录结构：**

```
hooks/useGame/
├── index.ts                      # 统一导出（未来子 hook 入口）
│
├── core/                         # 核心流程（不可替代）
│   ├── sendWorkflow/             # 主剧情发送（已有目录，补全）
│   ├── systemPromptBuilder.ts
│   ├── storyState.ts
│   └── storyResponseGuards.ts
│
├── memory/                       # 记忆系统
│   ├── memoryUtils.ts
│   ├── memoryRecall.ts
│   ├── memoryConsolidation.ts
│   ├── memorySummaryHandlers.ts
│   └── npcMemorySummary.ts
│
├── npc/                          # NPC 管理
│   ├── npcContext.ts
│   ├── npcImageWorkflow.ts
│   ├── npcImageStateWorkflow.ts
│   ├── npcSecretImageWorkflow.ts
│   └── manualNpcWorkflow.ts
│
├── image/                        # 图片系统（已有目录，扩充）
│   ├── playerImageWorkflow.ts
│   ├── sceneImageWorkflow.ts
│   ├── sceneImageArchiveWorkflow.ts
│   ├── sceneImageTriggerWorkflow.ts
│   ├── batchImageGenerationWorkflow.ts
│   ├── imagePresetWorkflow.ts
│   └── manualImageActionsWorkflow.ts  # 从根移入
│
├── planning/                     # 剧情规划
│   ├── planningUpdateWorkflow.ts
│   ├── planningReasonCollector.ts
│   ├── variableCalibration.ts
│   ├── variableCalibrationCoordinator.ts
│   ├── variableCalibrationMerge.ts
│   ├── variableModelWorkflow.ts
│   ├── variableGenerationProgress.ts
│   ├── variableGenerationQueue.ts
│   └── variableGenerationProgress.ts
│
├── world/                        # 世界系统
│   ├── worldEvolutionWorkflow.ts
│   ├── worldEvolutionControl.ts
│   ├── worldEvolutionUtils.ts
│   ├── worldGenerationWorkflow.ts
│   └── worldStateIntegrity.ts
│
├── campus/                       # 校园系统
│   ├── campusNSFWEngine.ts
│   ├── campusForumWorkflow.ts
│   ├── campusRumorWorkflow.ts
│   ├── campusPromptInjector.ts
│   ├── academicWorkflow.ts
│   ├── scheduleWorkflow.ts
│   ├── semesterCalendarWorkflow.ts
│   ├── clubWorkflow.ts
│   └── campusNSFW/               # 已有子目录
│
├── bdsm/                         # BDSM 系统
│   ├── bdsmTaskWorkflow.ts
│   ├── bdsmMeetingWorkflow.ts
│   ├── bdsmMeetingTrigger.ts
│   ├── bdsmTaskTrigger.ts
│   ├── bdsmStateIntegration.ts
│   ├── bdsmStateParser.ts
│   └── bdsmForumEngine.ts
│
├── urbanDriver/                  # 城市司机 NSFW
│   ├── urbanDriverNSFWEngine.ts
│   └── urbanDriverNSFWIntegration.ts
│
├── device/                       # 移动设备 AI
│   ├── deviceAiWorkflow.ts
│   ├── deviceRefreshMonitor.ts
│   ├── mobileDeviceWorkflow.ts
│   ├── triggerDeviceMessageWorkflow.ts
│   ├── useDeviceContacts.ts
│   ├── useDeviceMessages.ts
│   ├── useDeviceNavigation.ts
│   └── useDeviceTheme.ts
│
├── response/                     # 响应处理
│   ├── responseCommandProcessor.ts
│   ├── responseTextHelpers.ts
│   └── storyResponseGuards.ts
│
├── eventTrigger/                 # 事件触发（已有目录，补全）
│   ├── eventTriggerManager.ts
│   ├── eventTrigger.ts
│   └── eventTrigger.test.ts
│
├── opening/                      # 开局流程
│   ├── openingStoryWorkflow.ts
│   └── bodyPolish.ts
│
├── travel/                       # 旅行与交易
│   ├── travelWorkflow.ts
│   └── tradeWorkflow.ts
│
├── ui/                           # UI 辅助
│   ├── notificationSystem.ts
│   ├── rollbackSnapshot.ts
│   └── contextSnapshot.ts
│
├── time/                         # 时间系统
│   ├── timeUtils.ts
│   ├── historyTurnWorkflow.ts
│   └── historyUtils.ts
│
├── state/                        # 状态工具（已有目录）
│   ├── factories.ts
│   ├── historyUtils.ts
│   ├── planningNormalizers.ts
│   └── stateTransforms.ts         # 从根移入
│
├── config/                       # 配置（已有目录）
│   └── settingsPersistenceWorkflow.ts
│
├── saveLoad/                     # 存读档（已有目录）
│   └── saveLoadWorkflow.ts
│
├── narrativeGrammar/             # 叙事语法（已有目录）
│
├── quality/                      # 质量保障
│   ├── autoRetry.ts
│   ├── errorFormatting.ts
│   ├── backgroundImageMonitor.ts
│   ├── performanceMonitor.ts
│   └── thinkingContext.ts
│
├── promptRuntime.ts              # 运行时提示词（独立，引用面广）
├── intimacyUtils.ts              # 亲密度工具（独立，引用面广）
├── combatCalculation.ts          # 战斗计算（独立）
├── progressionWorkflow.ts        # 进度工作流（独立）
├── scheduleWorkflow.ts           # 日程（如与 campus 重复需合并）
├── privateChatWorkflow.ts        # 私聊工作流
├── runtimeVariableWorkflow.ts    # 运行时变量
├── difficultyAdjustmentWorkflow.ts # 难度调整
└── narrativeGrammar.ts           # 如与目录重复需合并
```

**实施步骤：**

1. 对每个功能域：创建目录 → 移入文件 → 创建 `index.ts` barrel export → 更新 `useGame.ts` import 路径 → 运行 `tsc --noEmit` 验证
2. 最后运行 `npm run build` 确保构建通过

**关键约束：**
- 只改文件位置和 export 路径，不改文件内容
- 每次移动一个目录后立即验证编译
- 测试文件随源文件一起移动

### Phase 2: 子 Hook 拆分 — 3-4 天

**目标：** 从 `useGame.ts` 中拆分出 6 个独立子 hook

**子 Hook 清单：**

```typescript
// hooks/useGame/subsystems/useImageSubsystem.ts
// 职责：所有图片相关状态和动作
import { useState, useRef, useCallback } from 'react';
export function useImageSubsystem(config: { apiConfigRef: any; visualConfigRef: any; ... }) {
  const [npcImageQueue, setNpcImageQueue] = useState([]);
  const npcImageInProgressRef = useRef<Set<string>>(new Set());
  // ... 所有图片相关 state + ref + useCallback
  return {
    state: { npcImageQueue, sceneImageQueue, ... },
    actions: { generateNpcImage, selectNpcAvatarImage, ... }
  };
}

// hooks/useGame/subsystems/useMemorySubsystem.ts
// 职责：记忆系统状态和动作
export function useMemorySubsystem(config: { memoryConfigRef: any; apiConfigRef: any; ... }) {
  const [pendingSummary, setPendingSummary] = useState(null);
  // ... 所有记忆相关 state + ref + useCallback
  return {
    state: { pendingSummary, summaryPhase, ... },
    actions: { startMemorySummary, applyMemorySummary, ... }
  };
}

// hooks/useGame/subsystems/usePlanningSubsystem.ts
// 职责：剧情规划 + 变量生成
export function usePlanningSubsystem(config: { ... }) { ... }

// hooks/useGame/subsystems/useWorldSubsystem.ts
// 职责：世界演变 + 世界生成
export function useWorldSubsystem(config: { ... }) { ... }

// hooks/useGame/subsystems/useCampusSubsystem.ts
// 职责：校园 + BDSM 系统
export function useCampusSubsystem(config: { ... }) { ... }

// hooks/useGame/subsystems/useDeviceSubsystem.ts
// 职责：移动设备 AI
export function useDeviceSubsystem(config: { ... }) { ... }
```

**useGame.ts 改造后：**

```typescript
// useGame.ts 从 ~2952 行减少到 ~800-1000 行
export const useGame = () => {
  const gameState = useGameState();

  // 委派给子系统
  const image = useImageSubsystem(sharedConfig);
  const memory = useMemorySubsystem(sharedConfig);
  const planning = usePlanningSubsystem(sharedConfig);
  const world = useWorldSubsystem(sharedConfig);
  const campus = useCampusSubsystem(sharedConfig);
  const device = useDeviceSubsystem(sharedConfig);

  // 仍然保留的核心逻辑（sendWorkflow 等）
  const handleSend = useCallback(...)

  // 合并返回值（保持接口不变）
  return {
    state: { ...gameState, ...image.state, ...memory.state, ... },
    meta: { ... },
    setters: { ... },
    actions: {
      handleSend,
      ...image.actions,
      ...memory.actions,
      ...planning.actions,
      ...world.actions,
      ...campus.actions,
      ...device.actions,
    }
  };
};
```

**关键设计决策：**

1. **子 hook 不直接调用 `useGameState`** — 通过 `config` 参数接收需要的引用，避免隐式依赖
2. **返回值统一为 `{ state, actions }`** — 方便后续迁移到 Zustand
3. **`useGame.ts` 仍然是唯一对外导出** — 所有外部调用无需修改

### Phase 3: App.tsx 瘦身 — 2 天

**目标：** 将 App.tsx 从 2115 行减少到 ~800 行

**具体改动：**

#### 3.1 提取 Modal 路由组件

```typescript
// components/features/ModalRouter.tsx
// 接管所有 feature modal 的显示/隐藏逻辑
export const ModalRouter = ({ actions, state }: { actions: any; state: any }) => {
  // 50+ lazy 组件声明移到独立文件
  // 每个 modal 的状态管理封装为 useModalState hook
  // 桌面/移动端分支逻辑集中处理
};
```

#### 3.2 提取 lazy 组件声明

```typescript
// components/features/lazyComponents.ts
// 将所有 React.lazy 声明从 App.tsx 移出
export const CharacterModal = createPreloadableLazy(...)
export const MobileCharacter = createPreloadableLazy(...)
// ... 50+ exports
```

#### 3.3 提取 isMobile 响应式 hook

```typescript
// hooks/useResponsive.ts
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(...)
  // 从 App.tsx 的 media query 逻辑提取
  return { isMobile }
}
```

### Phase 4: Models 清理 — 1 天

**目标：** 消除顶层与子目录的重复文件

**具体操作：**

1. **合并 `models/campusNSFW.ts` → `models/campusNSFW/index.ts`**
2. **合并 `models/eraTheme.ts` → `models/eraTheme/index.ts`**
3. **清理顶层与 `models/domain/` 的同名文件：**
   - 如果顶层是旧版，删除顶层，统一从 `domain/` 导出
   - 如果顶层包含额外类型，合并到 `domain/` 后重新导出
4. **更新所有 import 路径**

### Phase 5: Feature 组件标准化 — 1 天

**目标：** 统一 `components/features/` 下各模块的内部结构

**约定结构：**

```
components/features/[FeatureName]/
├── index.ts              # barrel export
├── Desktop.tsx           # 桌面端组件（统一命名）
├── Mobile.tsx            # 移动端组件（统一命名）
├── types.ts              # 组件本地类型（如有）
├── constants.ts          # 组件本地常量（如有）
└── hooks/                # 组件本地 hooks（如有）
    └── use[FeatureName].ts
```

**散落文件归位：**
- `CampusDesireDashboard.tsx` → `components/features/CampusDesire/Desktop.tsx`
- `MobileCampusDesireApp.tsx` → `components/features/CampusDesire/Mobile.tsx`
- `BDSMRelationshipModal.tsx` → `components/features/BDSM/RelationshipModal.tsx`
- `BDSMContractModal.tsx` → `components/features/BDSM/ContractModal.tsx`
- `BDSMSafetyModal.tsx` → `components/features/BDSM/SafetyModal.tsx`
- `BDSMTaskModal.tsx` → `components/features/BDSM/TaskModal.tsx`

---

## 6. 每个阶段的具体变更清单

### Phase 1: 目录重组

| 步骤 | 操作 | 验证 |
|------|------|------|
| 1.1 | 创建 `memory/` 目录，移入 5 个文件，创建 barrel | `tsc --noEmit` |
| 1.2 | 创建 `npc/` 目录，移入 5 个文件，创建 barrel | `tsc --noEmit` |
| 1.3 | 扩充 `image/` 目录，移入 7 个文件 | `tsc --noEmit` |
| 1.4 | 创建 `planning/` 目录，移入 9 个文件 | `tsc --noEmit` |
| 1.5 | 创建 `world/` 目录，移入 5 个文件 | `tsc --noEmit` |
| 1.6 | 创建 `campus/` 目录，移入 8 个文件 | `tsc --noEmit` |
| 1.7 | 创建 `bdsm/` 目录，移入 7 个文件 | `tsc --noEmit` |
| 1.8 | 创建 `urbanDriver/` 目录，移入 2 个文件 | `tsc --noEmit` |
| 1.9 | 创建 `device/` 目录，移入 8 个文件 | `tsc --noEmit` |
| 1.10 | 创建 `response/` 目录，移入 3 个文件 | `tsc --noEmit` |
| 1.11 | 扩充 `eventTrigger/` 目录 | `tsc --noEmit` |
| 1.12 | 创建 `opening/` 目录，移入 2 个文件 | `tsc --noEmit` |
| 1.13 | 创建 `travel/` 目录，移入 2 个文件 | `tsc --noEmit` |
| 1.14 | 创建 `ui/` 目录，移入 3 个文件 | `tsc --noEmit` |
| 1.15 | 创建 `time/` 目录，移入 3 个文件 | `tsc --noEmit` |
| 1.16 | 扩充 `state/` 目录 | `tsc --noEmit` |
| 1.17 | 创建 `quality/` 目录，移入 5 个文件 | `tsc --noEmit` |
| 1.18 | 移动 `stateTransforms.ts` 到 `state/` | `tsc --noEmit` |
| 1.19 | 更新 `useGame.ts` 中所有 import 路径 | `tsc --noEmit` |
| 1.20 | `npm run build` 完整构建 | `npm run build` |

### Phase 2: 子 Hook 拆分

| 步骤 | 操作 | 验证 |
|------|------|------|
| 2.1 | 创建 `subsystems/useImageSubsystem.ts` | `tsc --noEmit` |
| 2.2 | 创建 `subsystems/useMemorySubsystem.ts` | `tsc --noEmit` |
| 2.3 | 创建 `subsystems/usePlanningSubsystem.ts` | `tsc --noEmit` |
| 2.4 | 创建 `subsystems/useWorldSubsystem.ts` | `tsc --noEmit` |
| 2.5 | 创建 `subsystems/useCampusSubsystem.ts` | `tsc --noEmit` |
| 2.6 | 创建 `subsystems/useDeviceSubsystem.ts` | `tsc --noEmit` |
| 2.7 | 修改 `useGame.ts` 使用子 hook | `tsc --noEmit` + 冒烟测试 |
| 2.8 | 验证 `useGame()` 返回值接口不变 | 运行应用 |

### Phase 3: App.tsx 瘦身

| 步骤 | 操作 | 验证 |
|------|------|------|
| 3.1 | 提取 `lazyComponents.ts` | `tsc --noEmit` |
| 3.2 | 创建 `useResponsive.ts` | `tsc --noEmit` |
| 3.3 | 创建 `ModalRouter.tsx` | `tsc --noEmit` |
| 3.4 | 更新 `App.tsx` 使用新组件 | 运行应用 |

### Phase 4: Models 清理

| 步骤 | 操作 | 验证 |
|------|------|------|
| 4.1 | 合并 `campusNSFW.ts` → `campusNSFW/index.ts` | `tsc --noEmit` |
| 4.2 | 合并 `eraTheme.ts` → `eraTheme/index.ts` | `tsc --noEmit` |
| 4.3 | 分析并清理 domain 重叠文件 | `tsc --noEmit` |
| 4.4 | 更新所有 import 路径 | `tsc --noEmit` + `npm run build` |

### Phase 5: Feature 标准化

| 步骤 | 操作 | 验证 |
|------|------|------|
| 5.1 | 归位散落的 6 个顶层 .tsx 文件 | `tsc --noEmit` |
| 5.2 | 统一重命名 `Desktop.tsx` / `Mobile.tsx` | `tsc --noEmit` |
| 5.3 | 更新所有 import 引用 | `npm run build` |

---

## 7. 风险控制

### 可回退策略
- **每个 Phase 独立为一个 git commit**，可 `git revert`
- **Phase 1 不改动任何文件内容**，只改路径和 import，回退成本极低
- **Phase 2 保持 useGame() 返回值接口不变**，即使回退也不影响调用方

### 验证策略
- 每移动一个目录/文件后立即 `tsc --noEmit`
- 每个 Phase 完成后 `npm run build`
- Phase 2 完成后进行一次完整的冒烟测试（开局 → 对话 → 存读档）

### 并行开发
- Phase 1 进行期间，其他功能开发可继续（只需 rebase 到新路径）
- Phase 2 各子 hook 可并行开发
- 建议在功能开发的低峰期进行

---

## 8. 长期展望

完成本方案后，项目的架构将具备以下能力：

1. **新增模块标准化**：新模块 = 1 个子 hook + 1 个 feature 目录 + `useGame.ts` 一行接入
2. **子 Hook 可独立测试**：每个 subsystem 可单独做单元测试
3. **为 Zustand 迁移铺路**：子 hook 的 `{ state, actions }` 模式与 Zustand store 几乎一致
4. **为 FSD 迁移铺路**：功能目录归组后，迁移到 FSD 只需要调整 import 路径

---

## 9. 实施优先级建议

```
优先级 1 (立即执行): Phase 1 — 目录重组
  理由: 改动最小，效果立竿见影，开发体验提升最大

优先级 2 (1-2 周内): Phase 2 — 子 Hook 拆分
  理由: 解决核心痛点（useGame.ts 2952行），降低后续维护成本

优先级 3 (Phase 2 完成后): Phase 3 — App.tsx 瘦身
  理由: 依赖 Phase 2 的 actions 分组结果

优先级 4 (有空再做): Phase 4 + 5 — Models 清理 + Feature 标准化
  理由: 技术债清理，不影响功能开发
```
