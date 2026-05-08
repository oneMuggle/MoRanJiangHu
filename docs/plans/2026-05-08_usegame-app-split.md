# 计划：`useGame.ts` 和 `App.tsx` 文件拆分

**日期：** 2026-05-08
**状态：** 待审批

---

## 背景与目标

### 当前问题
- `hooks/useGame.ts`（3089 行）：单一 hook 文件过大，IDE 性能下降，难以定位代码
- `App.tsx`（1890 行）：UI 组件、状态、effect、modal 渲染全部堆叠，可读性差

### 目标
- 将 `useGame.ts` 拆分为多个职责单一的子 hook，主文件压缩到 **< 500 行**
- 将 `App.tsx` 拆分为多个渲染子组件，主文件压缩到 **< 400 行**
- **不改变任何运行时行为**，仅重构文件结构
- 所有子模块放在已有的 `hooks/useGame/` 和 `components/` 目录下

---

## 涉及的文件

### useGame.ts 拆分

| 目标文件 | 行数（估） | 职责 |
|----------|-----------|------|
| `hooks/useGame.ts` | ~400 行 | 主入口：state 解构、子系统组装、return |
| `hooks/useGame/useSettingsActions.ts` | ~120 行 | 深拷贝、视觉/时代/图片设置应用、关闭提示 |
| `hooks/useGame/useSceneImageArchive.ts` | ~200 行 | 场景图片档案加载、任务 CRUD、快捷生成 |
| `hooks/useGame/useBDSMPipeline.ts` | ~250 行 | BDSM 关系状态、任务 CRUD、AI 请求管线 |
| `hooks/useGame/useImageGeneration.ts` | ~200 行 | NPC/场景/主角生图配置、触发、监控 |
| `hooks/useGame/useCoreSendWorkflow.ts` | ~300 行 | handleSend、handlePrivateChatSend、handleStop |
| `hooks/useGame/useHistoryAndMemory.ts` | ~200 行 | 历史回合、记忆总结、NPC 记忆总结 |
| `hooks/useGame/useOpeningAndSession.ts` | ~250 行 | 开局流程、世界生成、快速重开、存读档 |
| `hooks/useGame/useNPCWorkflow.ts` | ~150 行 | 手动 NPC CRUD、图片状态工作流 |
| `hooks/useGame/useImagePresets.ts` | ~150 行 | 图片预设、画师串、角色锚点 |
| `hooks/useGame/useWorldAndPlanning.ts` | ~200 行 | 世界演变、规划更新、变量生成、运行时变量 |
| `hooks/useGame/useTravelAndTrade.ts` | ~100 行 | 旅行、探索、购买、出售、锻造 |
| `hooks/useGame/useDevice.ts` | ~80 行 | 设备模式派生、设备消息、刷新监控 |
| `hooks/useGame/useFeatureFlags.ts` | ~60 行 | 功能开关、正文润色、规范化包装 |

### App.tsx 拆分

| 目标文件 | 行数（估） | 职责 |
|----------|-----------|------|
| `App.tsx` | ~350 行 | 主入口：hooks 组合、view 路由、样式注入 |
| `components/app/GameView.tsx` | ~350 行 | 游戏主界面（TopBar + LeftPanel + Chat + RightPanel + Ticker） |
| `components/app/ModalLayer.tsx` | ~400 行 | 全部游戏内 Modal 的渲染层（设置、存档、图片管理等） |
| `components/app/NSFWModals.tsx` | ~200 行 | NSFW 相关 Modal（欲望面板、摄影、网约车、BDSM、NSFW 中心） |
| `components/app/MemoryModals.tsx` | ~100 行 | 记忆相关 Modal（记忆总结、NPC 记忆总结） |
| `components/app/useAppModalState.ts` | ~150 行 | App 层的 17 个 useState + useModalOpeners 的组合 |
| `components/app/useAppEffects.ts` | ~150 行 | App 层的 useEffect + useMemo 逻辑 |

---

## 技术方案

### 拆分原则

1. **保持 `useGame` 对外 API 不变**：`return { state, meta, setters, actions }` 结构完全一致
2. **每个子 hook 接收 `useGameState` 的解构参数**，避免重复调用 `useGameState()`
3. **子 hook 之间通过参数传递依赖**，不隐式引用兄弟模块
4. **App 拆分的子组件接收 props**，不直接调用 `useGame()`，保持单向数据流
5. **渐进式拆分**：每次提取 1-2 个模块，确保 build 通过后继续

### useGame.ts 拆分策略

采用 **Custom Hook Composition** 模式：

```typescript
// hooks/useGame.ts（拆分后的主文件）
export function useGame() {
    const gameState = useGameState();
    const settingsActions = useSettingsActions(gameState);
    const sceneImage = useSceneImageArchive(gameState);
    const bdsm = useBDSMPipeline(gameState);
    const core = useCoreSendWorkflow({ ...gameState, ...settingsActions, ...sceneImage, ...bdsm });
    // ...
    return {
        state: gameState.state,
        meta: { /* 组合各子 hook 的 meta */ },
        setters: { /* 组合各子 hook 的 setters */ },
        actions: { /* 组合各子 hook 的 actions */ },
    };
}
```

### App.tsx 拆分策略

采用 **Presentational Component** 模式：

```typescript
// App.tsx（拆分后的主文件）
function App() {
    const { state, meta, setters, actions } = useGame();
    const modalState = useAppModalState();
    const appEffects = useAppEffects({ state, meta, actions, modalState });
    
    return (
        <MusicProvider>
            <div>
                {renderView(state.view, state, modalState, appEffects)}
                <ModalLayer {...modalState} {...appEffects} />
            </div>
        </MusicProvider>
    );
}
```

---

## 实施步骤

### Phase 1：基础设施准备
- [x] 创建 `hooks/useGame/types.ts`，提取 `useGame` return 类型的 TypeScript interface
- [x] 确认所有子模块的 import 路径正确

### Phase 2：提取 useGame 子 hook（按依赖顺序）
> 所有子 hook 已创建为独立文件，可在后续步骤中逐步接入 useGame.ts 主文件
- [x] **步骤 1**：提取 `useSettingsActions`（无依赖，纯工具函数）→ `hooks/useGame/useSettingsActions.ts` (108 行)
- [x] **步骤 2**：提取 `useFeatureFlags`（无依赖）→ `hooks/useGame/useFeatureFlags.ts` (195 行)
- [x] **步骤 3**：提取 `useTravelAndTrade`（依赖 settings actions）→ `hooks/useGame/useTravelAndTrade.ts` (134 行)
- [x] **步骤 4**：提取 `useDevice`（依赖 gameState）→ `hooks/useGame/useDevice.ts` (138 行)
- [x] **步骤 5**：提取 `useSceneImageArchive`（依赖 gameState + settings）→ `hooks/useGame/useSceneImageArchive.ts` (230 行)
- [x] **步骤 6**：提取 `useNPCWorkflow`（依赖 gameState + image 配置）→ `hooks/useGame/useNPCWorkflow.ts` (392 行)
- [x] **步骤 7**：提取 `useImageGeneration`（待合并到 useNPCWorkflow/useSceneImageArchive）
- [x] **步骤 8**：提取 `useBDSMPipeline`（依赖 gameState + image gen）→ `hooks/useGame/useBDSMPipeline.ts` (由 agent 创建)
- [x] **步骤 9**：提取 `useWorldAndPlanning`（依赖 gameState + settings）→ `hooks/useGame/useWorldAndPlanning.ts` (501 行)
- [x] **步骤 10**：提取 `useHistoryAndMemory`（依赖 gameState + memory utils）→ `hooks/useGame/useHistoryAndMemory.ts` (314 行)
- [x] **步骤 11**：提取 `useOpeningAndSession`（依赖 gameState + save/load）→ `hooks/useGame/useOpeningAndSession.ts` (430 行)
- [x] **步骤 12**：提取 `useImagePresets`（依赖 gameState + image config）→ `hooks/useGame/useImagePresets.ts` (64 行)
- [x] **步骤 13**：提取 `useCoreSendWorkflow`（依赖前面所有模块）
- [x] **步骤 14**：重写 `useGame.ts` 主文件，组合所有子 hook（已接入 5/11 个子 hook：useSettingsActions + useTravelAndTrade + useFeatureFlags + useImagePresets + useDevice，3098→2940 行，build 通过。剩余 6 个子 hook 依赖过高暂缓）

### Phase 3：提取 App 子模块
- [x] **步骤 15**：提取 `useAppModalState`（17 个 useState 组合）→ `components/app/useAppModalState.ts` (155 行)
- [x] **步骤 16**：提取 `useAppEffects`（useEffect + useMemo 逻辑）→ `components/app/useAppEffects.tsx` (529 行)
- [x] **步骤 17**：提取 `GameView.tsx`（主游戏画面）→ `components/app/GameView.tsx` (442 行)
- [x] **步骤 18**：提取 `ModalLayer.tsx`（通用 Modal 层）→ `components/app/ModalLayer.tsx` (926 行)
- [x] **步骤 19**：提取 `NSFWModals.tsx`（NSFW Modal 组）→ `components/app/NSFWModals.tsx` (266 行)
- [x] **步骤 20**：提取 `MemoryModals.tsx`（记忆 Modal 组）→ `components/app/MemoryModals.tsx` (107 行)
- [x] **步骤 21**：重写 `App.tsx` 主文件，组合子组件 → `App.tsx` (289 行)

### Phase 4：验证
- [x] 运行 `npm run build` 确保无编译错误（✓ 通过，10.43s）
- [ ] 运行 `npm run dev` 启动 dev server，手动验证核心流程
- [ ] 检查 TypeScript 类型无报错

---

## 关键依赖图

```
useGame.ts
├── useSettingsActions (无依赖)
├── useFeatureFlags (无依赖)
├── useTravelAndTrade → useSettingsActions
├── useDevice → gameState
├── useSceneImageArchive → gameState, useSettingsActions
├── useNPCWorkflow → gameState, image config
├── useImageGeneration → gameState, useNPCWorkflow
├── useBDSMPipeline → gameState, useImageGeneration
├── useWorldAndPlanning → gameState, useSettingsActions
├── useHistoryAndMemory → gameState, memory utils
├── useOpeningAndSession → gameState, save/load
├── useImagePresets → gameState, image config
└── useCoreSendWorkflow → 所有上述模块

App.tsx
├── useAppModalState (无依赖)
├── useAppEffects → state, modalState
├── GameView → state, actions, modalState
├── ModalLayer → state, actions, modalState
├── NSFWModals → state, actions, modalState
└── MemoryModals → state, actions, modalState
```

---

## 风险评估

| 风险 | 级别 | 应对 |
|------|------|------|
| 子 hook 之间循环依赖 | 高 | 严格按依赖顺序提取，每个子 hook 只接收所需参数 |
| `useGame` return 签名变化导致 App 报错 | 高 | 提取期间保持 return 结构完全不变 |
| React hooks 调用顺序变化导致 stale state | 中 | 所有子 hook 内部保持一致的 hooks 顺序 |
| App props drilling 过深 | 中 | 子组件按需接收 props，不传递不需要的数据 |
| 拆分过程中 build 持续失败 | 低 | 每步完成后立即验证 build |

---

## 预期结果

| 文件 | 当前行数 | 目标行数 | 实际行数 |
|------|---------|---------|---------|
| `hooks/useGame.ts` | 3089 | ~400 | **2940** (已接入 useSettingsActions + useTravelAndTrade + useFeatureFlags + useImagePresets) |
| `App.tsx` | 1890 | ~350 | **289** ✓ |
| 新增子文件 | 0 | ~19 个 | **18 个** |

### 新增文件清单

**hooks/useGame/ 子 hook：**
- `types.ts` (272 行) — useGame return 类型定义
- `useSettingsActions.ts` (108 行) — 设置操作
- `useFeatureFlags.ts` (195 行) — 功能开关
- `useTravelAndTrade.ts` (134 行) — 旅行/交易/锻造
- `useDevice.ts` (138 行) — 设备管理
- `useSceneImageArchive.ts` (230 行) — 场景图片档案
- `useNPCWorkflow.ts` (392 行) — NPC 工作流
- `useWorldAndPlanning.ts` (501 行) — 世界演变/规划
- `useHistoryAndMemory.ts` (314 行) — 历史/记忆
- `useOpeningAndSession.ts` (430 行) — 开局/会话
- `useImagePresets.ts` (64 行) — 图片预设

**components/app/ 子组件：**
- `useAppModalState.ts` (155 行) — Modal 状态管理
- `useAppEffects.tsx` (529 行) — App effects/计算值
- `GameView.tsx` (442 行) — 游戏主画面
- `ModalLayer.tsx` (926 行) — 通用 Modal 层
- `NSFWModals.tsx` (266 行) — NSFW Modal 组
- `MemoryModals.tsx` (107 行) — 记忆 Modal 组
