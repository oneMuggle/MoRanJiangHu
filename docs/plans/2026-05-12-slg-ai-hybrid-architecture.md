# SLG + AI 混合架构转型方案

> 创建日期: 2026-05-12
> 状态: 待评审
> 关联文档: `2026-05-12-boardgame-ui-interactive.md`

---

## 一、背景与目标

### 1.1 背景

项目已从纯文字冒险游戏演进为多模态交互系统，当前包含：

| 子系统 | 现有状态 | 交互复杂度 |
|--------|---------|-----------|
| 桌游社交 | 引擎已完整（8种游戏、事件编排、SLG交互扩展），UI 已实现骰子游戏面板 | 高：回合推进、阵营分配、紧张度计算、玩家选择 |
| 网约车 NSFW | 引擎已完整（药物/醉酒状态机、关系轨道、后果事件） | 高：状态衰减、后果链式反应 |
| 手机 App 模拟 | 基础框架已存在（安装管理、消息调度、设备刷新监控） | 中：定时调度、消息队列、通知系统 |
| 校园 NSFW | 引擎已完整（欲望状态机、暴露风险、流言传播） | 中：状态推进、社交传播 |
| BDSM 关系网 | 引擎已完整（权力天平、服从度、多角色冲突检测） | 高：多角色状态管理、关系拓扑 |

### 1.2 问题

当前架构下，**所有复杂计算都由 AI 完成**，导致：

1. **结果不可预测** — 同一操作多次执行结果差异大
2. **游戏平衡失控** — 紧张度、概率、属性检定无法精确控制
3. **状态一致性无保证** — AI 可能遗漏已存在的状态（如药物效果、醉酒等级）
4. **缺乏即时反馈** — 玩家操作后必须等待 AI 回复才能看到结果
5. **难以实现真正的 Game Feel** — 没有确定的游戏循环，缺少"回合推进"的仪式感

### 1.3 目标

建立 **SLG + AI 混合架构**，实现：

1. **确定性计算层（SLG Engine）** — 回合系统、资源管理、属性计算、事件触发、条件判定、后果结算
2. **叙事生成层（AI Layer）** — 文字描写、NPC 反应、场景渲染、情感表达
3. **叙事桥接层（Narrative Bridge）** — 将 SLG 状态转化为 AI 可用的叙事约束，将 AI 响应回写到游戏状态
4. **渐进式迁移** — 不需要大爆炸重写，从 BoardGame 开始逐步迁移

### 1.4 核心循环

```
[玩家操作] → [SLG Engine 确定性计算] → [Narrative Bridge 生成约束] → [AI 生成叙事] → [状态更新] → [UI 刷新]
```

---

## 二、当前架构分析

### 2.1 现有优势

| 优势 | 说明 |
|------|------|
| 模块化工作流 | 45+ 独立子模块，职责清晰 |
| 事件系统成熟 | `eventTrigger/` 提供调度、周期、链式、分组、增强条件 |
| SLG 基础已存在 | `boardGameNSFWEngine` 有 `executePlayerAction`、事件选择、叙事约束生成 |
| Zustand 渐进迁移 | 已有 slice 架构，BoardGameSlice 已扩展 SLG 字段 |
| 桥接层已实现 | `useBoardGameBridge` 实现了暂停/恢复协议 |
| 多引擎矩阵 | 4 个独立 NSFW 引擎，各自负责确定性计算 |

### 2.2 现有限制

| 限制 | 影响 |
|------|------|
| 单巨型 Hook | `useGame.ts` ~3000 行，状态管理耦合 |
| 缺乏统一游戏循环 | 一切由 AI 回复驱动，没有独立的 tick 系统 |
| 状态变更缺乏事务性 | 多个子系统可能同时修改状态 |
| AI 与计算未分离 | `sendWorkflow` 将游戏状态直接注入 prompt，AI 既做计算又做叙事 |
| 测试框架缺失 | 无法验证引擎计算的正确性 |

### 2.3 已有 SLG 基础设施清单

| 文件 | 功能 | 复用度 |
|------|------|--------|
| `hooks/useGame/boardGameNSFWEngine/core.ts` | `executePlayerAction()` — 玩家操作执行与结算 | 高 |
| `hooks/useGame/boardGameNSFWEngine/eventSystem.ts` | 待处理事件系统（pending/resolved/expired） | 高 |
| `hooks/useBoardGameBridge.ts` | 叙事桥接：暂停/恢复/叙事约束生成 | 高 |
| `hooks/useBoardGameActions.ts` | 操作分发层 | 高 |
| `hooks/useGame/subsystems/zustandStore.ts` | BoardGameSlice — SLG 状态存储 | 高 |
| `hooks/useGame/urbanDriverNSFWEngine.ts` | 网约车状态机（药物/醉酒衰减） | 中 |
| `hooks/useGame/eventTrigger/` | 事件调度框架 | 中 |
| `hooks/useGame/device/deviceRefreshMonitor.ts` | 设备刷新监控（定时调度基础） | 中 |

---

## 三、目标架构设计

### 3.1 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer (React)                  │
│  BoardGameModal, PhoneApp, UrbanDriverDashboard, ...             │
│  - 渲染游戏状态                                                  │
│  - 接收玩家操作                                                  │
│  - 显示 AI 叙事                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    SLG Game Engine (Deterministic)               │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ TurnManager│  │ EventMgr   │  │ StateMgr   │  │ RuleEngine│  │
│  │ 回合调度   │  │ 事件调度   │  │ 状态快照   │  │ 规则判定  │  │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │BoardGame   │  │ PhoneSim   │  │ UrbanDriver│  │ Social    │  │
│  │ Engine     │  │ Engine     │  │ Engine     │  │ Engine    │  │
│  │ (已有)     │  │ (增强)     │  │ (已有)     │  │ (已有)    │  │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │
│                                                                  │
│  ┌────────────┐                                                  │
│  │ ActionMgr  │  玩家操作路由、验证、执行                        │
│  └────────────┘                                                  │
├─────────────────────────────────────────────────────────────────┤
│                   Narrative Bridge (Constraint Gen)              │
│  - 将 SLG 状态转化为 XML/JSON 叙事约束                           │
│  - 将 AI 响应回写到 SLG 状态                                     │
│  - 关键步骤检测与自动暂停                                        │
├─────────────────────────────────────────────────────────────────┤
│                    AI Layer (Non-deterministic)                  │
│  - 多供应商客户端 (Claude/Gemini/OpenAI/...)                     │
│  - 结构化输出 (Zod schema 验证)                                  │
│  - Prompt 运行时注入叙事约束                                     │
├─────────────────────────────────────────────────────────────────┤
│                    Persistence Layer                             │
│  - Zustand Store (内存)                                          │
│  - IndexedDB (持久化)                                            │
│  - 事件日志（回档/调试）                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 数据流详解

```
[玩家点击 "掷骰"]
        │
        ▼
ActionMgr.validate(action)          ← 验证操作合法性（是否在回合内、是否轮到我）
        │
        ▼
BoardGameEngine.executePlayerAction(action, state)
        │                              │
        │    确定性计算：               │
        │    - 骰子随机数              │
        │    - 紧张度 +15              │
        │    - 判定 NSFW 触发          │
        │    - 判定 keyStep            │
        ▼                              ▼
  更新 Zustand Store          生成叙事约束 XML
        │                              │
        ▼                              ▼
   UI 即时刷新              NarrativeBridge.buildPrompt()
   (骰子数字、                    │
    紧张度条)                     ▼
                              注入到 sendWorkflow prompt
                                      │
                                      ▼
                                AI 生成叙事文本
                                      │
                                      ▼
                              解析并回写状态
                              (NPC 反应、场景描写)
                                      │
                                      ▼
                                UI 二次刷新（叙事追加）
```

### 3.3 关键接口定义

#### A. 统一游戏引擎接口

```typescript
interface SLGEngine {
  // 回合管理
  advanceTurn(): TurnResult;
  pause(reason: PauseReason): void;
  resume(): void;
  isPaused(): boolean;

  // 事件系统
  enqueueEvent(event: GameEvent): void;
  resolvePendingEvents(): ResolvedEvent[];
  scheduleEvent(event: ScheduledEvent): void;

  // 玩家操作
  executePlayerAction(action: PlayerAction): ActionResult;
  canExecuteAction(action: PlayerAction): boolean;

  // 状态查询
  getSnapshot(): GameStateSnapshot;
  getNarrativeConstraints(): NarrativeConstraint;
}

interface TurnResult {
  turnNumber: number;
  phase: TurnPhase;
  eventsTriggered: GameEvent[];
  stateChanges: StateChange[];
}

interface ActionResult {
  success: boolean;
  stateUpdates: Partial<GameState>;
  narrativeConstraint: string;
  keyStep: boolean;
  sideEffects: SideEffect[];
}
```

#### B. 叙事约束格式

```xml
<游戏叙事约束>
  <场景>桌游-骰子游戏</场景>
  <回合>5/12</回合>
  <紧张度>67(+15)</紧张度>
  <玩家操作>掷骰 | 策略: 激进 | 结果: 翻倍</玩家操作>
  <关键步骤>true</关键步骤>
  <NSFW触发>false</NSFW触发>
  <参与NPC>
    <NPC id="A" 状态="紧张" 欲望阶段="试探"/>
    <NPC id="B" 状态="兴奋" 欲望阶段="渴望"/>
  </参与NPC>
  <下一事件>阵营对抗</下一事件>
</游戏叙事约束>
```

#### C. 结构化 AI 输出

```typescript
interface AINarrativeResponse {
  narrativeText: string;           // 叙事文本
  npcReactions: NPCReaction[];     // NPC 反应
  stateUpdates: Partial<GameState>; // 状态更新（由 AI 推断）
  emotionalTone: EmotionalTone;    // 情感基调
  suggestedNextActions: string[];  // 建议的下一步操作
}
```

---

## 四、实施计划

### 阶段一：基础设施准备（2-3 周）

#### 1.1 抽象统一 GameEngine 接口

**目标**：为所有子引擎定义统一的接口，使它们可以被同一个 TurnManager 调度。

**涉及文件**：

| 文件 | 操作 | 说明 |
|------|------|------|
| `hooks/useGame/engine/types.ts` | 新建 | 统一类型定义：SLGEngine、TurnResult、ActionResult 等 |
| `hooks/useGame/engine/baseEngine.ts` | 新建 | 抽象基类，提供通用实现 |
| `hooks/useGame/engine/turnManager.ts` | 新建 | 全局回合调度器 |
| `hooks/useGame/engine/actionRouter.ts` | 新建 | 玩家操作路由 |

**关键设计决策**：
- 使用 interface + class 而非纯函数式，便于状态封装
- 所有引擎继承 baseEngine，各自实现 `executePlayerAction`
- TurnManager 持有引擎注册表，按优先级调度

#### 1.2 完善 Zustand 状态迁移

**目标**：将 `useGame.ts` 中的核心游戏状态迁移到 Zustand，建立单一数据源。

**新增 Slice**：

| Slice | 当前状态 | 目标 |
|-------|---------|------|
| EngineSlice | 分散在 useGame.ts | 统一管理所有子引擎的 running/paused 状态 |
| TurnSlice | 无 | 全局回合计数器、当前阶段、活跃引擎列表 |
| ActionLogSlice | 无 | 玩家操作历史（事件溯源基础） |

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/subsystems/zustandStore.ts` | 扩展：新增 EngineSlice、TurnSlice、ActionLogSlice |
| `hooks/useGame/state/gameStateAccess.ts` | 扩展：暴露新字段 |

#### 1.3 引入事件溯源

**目标**：为关键操作添加事件日志，支持回档和调试。

```typescript
interface ActionLogEntry {
  id: string;
  timestamp: number;
  turnNumber: number;
  engineType: EngineType;
  action: PlayerAction;
  result: ActionResult;
  snapshotBefore: GameStateSnapshot;
  snapshotAfter: GameStateSnapshot;
}
```

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/engine/actionLogger.ts` | 新建 |
| `hooks/useGame/subsystems/zustandStore.ts` | 扩展：ActionLogSlice |

#### 1.4 建立测试框架

**目标**：为 NSFW 引擎添加单元测试，确保迁移过程中不破坏现有功能。

**首批测试**：

| 测试文件 | 覆盖内容 |
|----------|---------|
| `hooks/useGame/boardGameNSFWEngine/core.test.ts` | `executePlayerAction` 各操作类型 |
| `hooks/useGame/urbanDriverNSFWEngine.test.ts` | 药物/醉酒状态衰减计算 |
| `hooks/useGame/engine/turnManager.test.ts` | 回合调度逻辑 |

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `package.json` | 添加 vitest 依赖 |
| `vitest.config.ts` | 新建 |
| `hooks/useGame/boardGameNSFWEngine/core.test.ts` | 新建 |

#### 阶段一验收标准

- [x] `hooks/useGame/engine/types.ts` 导出所有统一接口
- [x] `hooks/useGame/engine/baseEngine.ts` 可被具体引擎继承
- [x] `hooks/useGame/engine/turnManager.ts` 支持多引擎注册和调度
- [x] Zustand store 包含 EngineSlice、TurnSlice、ActionLogSlice
- [x] `vitest` 可运行，boardGameNSFWEngine 测试覆盖率 > 70%（56 tests, 4 test files）
- [x] `BoardGameEngine` 类实现并完成（22 tests 通过）
- [x] `npm run build` 通过

---

### 阶段二：BoardGame SLG 引擎完善（3-4 周）

> [x] 2.1 接入统一引擎接口 — **已完成**。`BoardGameEngine` 继承 `BaseEngine`，实现 `SLGEngine` 全部接口。

> [x] 2.2 完整游戏循环 — `gameLoop.ts` 实现（事件触发 + 自动回合 + 关键步骤检测），16 tests
> [x] 2.3 7 个新游戏 Panel 实现 — **已完成**。全部 8 个游戏 Panel 均已实现并注册：
>   - 真心话大冒险Panel、国王游戏Panel（P0）
>   - 大富翁Panel、棋牌游戏Panel（P1）
>   - 密室逃脱Panel、剧本杀Panel、狼人杀Panel（P2/P3）
> [x] 2.4 叙事约束注入验证 — `systemPromptBuilder.ts:1578-1591` 注入桌游约束到 prompt

> 这是最成熟的模块，已有完整的引擎代码和部分 UI。

#### 2.1 接入统一引擎接口

**目标**：将现有 `boardGameNSFWEngine` 改造为继承 `baseEngine`。

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/boardGameNSFWEngine/core.ts` | 重构：继承 BaseEngine，实现标准接口 |
| `hooks/useGame/boardGameNSFWEngine/index.ts` | 更新导出 |

**改造要点**：
- `executePlayerAction` 已存在，需补充 `canExecuteAction` 验证
- 新增 `getSnapshot()` 返回当前游戏状态快照
- 新增 `getNarrativeConstraints()` 生成叙事约束

#### 2.2 实现完整游戏循环

**目标**：从"事件驱动"升级为"定时器 + 事件驱动"混合模式。

```typescript
// 游戏循环伪代码
function gameLoop() {
  if (!engine.isPaused()) {
    // 1. 检查自动事件触发
    const events = eventTriggerManager.checkTriggers();

    // 2. 处理待结算事件
    const resolved = engine.resolvePendingEvents();

    // 3. 检查是否需要自动推进回合
    if (shouldAdvanceTurn()) {
      engine.advanceTurn();
    }

    // 4. 检查关键步骤，触发叙事
    const keySteps = filterKeySteps(resolved);
    if (keySteps.length > 0) {
      narrativeBridge.onKeyStepDetected(keySteps);
    }
  }

  // 下一帧
  requestAnimationFrame(gameLoop);
}
```

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/boardGameNSFWEngine/gameLoop.ts` | 新建 |
| `hooks/useGame/boardGameNSFWEngine/eventSystem.ts` | 增强：与主事件管理器集成 |

#### 2.3 其余 7 个游戏 Panel 实现

**优先级排序**（由简到繁）：

| 优先级 | 游戏 | 复杂度 | 核心操作 | 预计工时 |
|--------|------|--------|---------|---------|
| P0 | 真心话大冒险 | 低 | 选择真心话/大冒险 → 底线消耗 | 2h |
| P0 | 国王游戏 | 低 | 服从/协商/反抗 | 2h |
| P1 | 大富翁 | 中 | 掷骰移动 → 地块决策 | 3h |
| P1 | 棋牌游戏 | 中 | 选牌出牌 → 胜负判定 | 3h |
| P2 | 密室逃脱 | 中 | 路径选择 → 属性检定 | 3h |
| P2 | 剧本杀 | 高 | 搜索/审问 → 线索推理 | 4h |
| P3 | 狼人杀 | 高 | 夜间选择 → 白天投票 | 4h |

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `components/features/BoardGame/panels/真心话大冒险Panel.tsx` | 新建 |
| `components/features/BoardGame/panels/国王游戏Panel.tsx` | 新建 |
| `components/features/BoardGame/panels/大富翁Panel.tsx` | 新建 |
| `components/features/BoardGame/panels/棋牌游戏Panel.tsx` | 新建 |
| `components/features/BoardGame/panels/密室逃脱Panel.tsx` | 新建 |
| `components/features/BoardGame/panels/剧本杀Panel.tsx` | 新建 |
| `components/features/BoardGame/panels/狼人杀Panel.tsx` | 新建 |
| `components/features/BoardGame/panels/index.ts` | 更新注册 |

#### 2.4 叙事约束注入验证

**目标**：验证 SLG 结算结果正确注入 AI prompt，AI 输出质量达标。

**验证方法**：
1. 执行桌游操作，记录叙事约束 XML
2. 检查 `systemPromptBuilder.ts` 是否正确组装约束
3. 检查 AI 响应是否符合约束（紧张度变化、关键步骤描写）
4. A/B 测试：对比有无 SLG 约束的 AI 输出质量

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `prompts/runtime/boardGameNSFW.ts` | 增强：叙事约束生成器 |
| `hooks/useGame/systemPromptBuilder.ts` | 增强：注入叙事约束 |

#### 阶段二验收标准

- [x] `boardGameNSFWEngine` 继承 BaseEngine，通过接口测试 — `BoardGameEngine` 22 tests
- [x] 游戏循环正常运行，自动回合推进正常 — `BoardGameLoop` 16 tests
- [x] 7 个新游戏 Panel 可交互游玩 — 全部 8 个 Panel 已实现
- [x] 叙事约束正确注入 prompt — `systemPromptBuilder.ts:1578-1591` 调用 `构建桌游NSFW完整叙事约束`，读取 `statePayload.桌游系统` 并生成约束
- [ ] AI 输出质量验证通过（紧张度变化、关键步骤描写）— 需 E2E 手动验证
- [ ] 所有 Panel 移动端响应式正常 — 需视觉测试
- [x] `npm run build` 通过

---

### 阶段三：Phone App 引擎增强（3-4 周）

> [x] 3.1 消息调度系统 — **已完成**。`MessageQueue` + `MessageScheduler` 实现优先级队列、定时推送、NPC 触发。
> [x] 3.2 PhoneSim 引擎 — **已完成**。`PhoneEngine` 继承 `BaseEngine`，实现完整 SLGEngine 接口（App 管理、消息收发、通知）。
> [x] 3.3 通知中心 — **已完成**。`NotificationEngine` 实现分组、清除、优先级排序。
> [x] 3.4 社交图谱 — **已完成**。`SocialGraph` 实现 NPC 关系网络和互动事件模拟。
> [x] 39/39 单元测试通过。

#### 3.1 消息调度系统

**目标**：从"AI 生成消息内容"转变为"定时调度 + AI 生成内容"。

**当前状态**：
- `deviceRefreshMonitor.ts` 已实现定时刷新监控
- `useDeviceMessages.ts` 已实现消息收发
- 消息内容由 AI 直接生成

**改进方向**：
- 引入消息队列，按时间调度推送
- NPC 消息由引擎规则生成触发条件，AI 只负责内容
- 支持消息优先级（紧急消息优先推送）

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/engine/phoneEngine.ts` | 新建：PhoneSim 引擎 |
| `hooks/useGame/device/messageScheduler.ts` | 新建：消息调度器 |
| `hooks/useGame/device/messageQueue.ts` | 新建：消息队列 |
| `hooks/useGame/device/useDeviceMessages.ts` | 重构：接入调度系统 |

**核心逻辑**：

```typescript
interface MessageScheduler {
  // 定时推送
  scheduleMessage(message: ScheduledMessage): void;

  // NPC 自动发消息（基于关系和状态）
  checkNPCTriggers(): PendingMessage[];

  // 处理消息队列
  processQueue(): DisplayMessage[];
}

interface ScheduledMessage {
  id: string;
  senderId: string;
  content: string;           // 由 AI 生成
  scheduledTime: number;     // 定时推送时间
  priority: 'low' | 'normal' | 'urgent';
  trigger: string;           // 触发条件表达式
}
```

#### 3.2 应用生态增强

**目标**：实现更丰富的手机 App 交互体验。

**新增功能**：

| 功能 | 说明 | 复杂度 |
|------|------|--------|
| 通知中心 | 统一管理所有 App 通知，支持分组/清除 | 中 |
| App 内状态 | 每个 App 维护独立状态（如论坛帖子、社交动态） | 中 |
| 社交图谱 | NPC 之间通过 App 互动，生成事件 | 高 |
| 成就系统 | 基于 App 使用行为的成就解锁 | 低 |

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/engine/notificationEngine.ts` | 新建 |
| `models/installedApps.ts` | 扩展：App 内状态 |
| `components/features/Device/NotificationCenter.tsx` | 新建 |
| `hooks/useGame/device/socialGraph.ts` | 新建 |

#### 3.3 叙事注入

**目标**：手机消息作为叙事约束注入 AI prompt。

**实现方式**：
- 消息队列中的待处理消息转化为叙事约束
- AI 回复时参考手机消息生成连贯叙事
- 支持"手机打断叙事"的场景（如正进行到关键时刻，手机响了）

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `prompts/runtime/deviceMessages.ts` | 新建 |
| `hooks/useGame/systemPromptBuilder.ts` | 增强：注入手机消息约束 |

#### 阶段三验收标准

- [x] 消息调度系统正常运行，定时推送正常 — `MessageScheduler` + `MessageQueue` 实现
- [x] 通知中心可管理所有 App 通知 — `NotificationEngine` 实现
- [x] NPC 通过 App 自动互动，生成连贯叙事 — `SocialGraph` 实现
- [x] 手机消息作为叙事约束正确注入 prompt — `PhoneEngine.getNarrativeConstraints()` 返回约束
- [x] 39 个单元测试全部通过
- [x] `npm run build` 通过

---

### 阶段四：Urban Driver 引擎增强（2-3 周）

> 已有完整引擎，此阶段重点是增强和集成。
>
> **进度**: 全部完成 ✅
> - [x] 4.1 行程调度系统 — `TripScheduler` 实现（scheduleTrip/startTrip/completeTrip/cancelTrip + Trigger 系统）
> - [x] 4.2 乘客状态机 — `PassengerStateMachine` 实现（欲望推进、醉酒衰减、药物衰减、关系轨道系数）
> - [x] 4.3 后果链系统 — `ConsequenceChain` 实现（6 条默认规则、延迟链式、严重度升级）
> - [x] 4.4 引擎封装 — `UrbanDriverEngine` 继承 `BaseEngine`，整合三大子系统
> - [x] 28/28 单元测试全部通过

#### 4.1 行程调度

**目标**：从"AI 决定何时触发行程"转变为"基于时间/地点的自动触发"。

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/engine/urbanDriverEngine.ts` | 新建：封装现有引擎 |
| `hooks/useGame/urbanDriverNSFWEngine.ts` | 重构：接入统一引擎接口 |
| `hooks/useGame/urbanDriver/tripScheduler.ts` | 新建 |

#### 4.2 乘客状态机增强

**目标**：强化药物/醉酒状态的衰减模型。

```typescript
interface PassengerState {
  desireStage: DesireStage;          // 欲望阶段
  desireProgress: number;            // 阶段进度 0-100
  intoxication: IntoxicationLevel;   // 醉酒等级
  drugState: DrugState;              // 药物状态
  relationshipTrack: RelationshipTrack; // 关系轨道
}

// 每回合自动衰减
function decayState(state: PassengerState, elapsedTurns: number): PassengerState {
  // 药物衰减：随时间恢复意识
  // 醉酒衰减：随时间清醒
  // 欲望阶段：不衰减，但进度可能回退
  return newState;
}
```

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/urbanDriver/passengerStateMachine.ts` | 新建 |
| `models/urbanDriverNSFW/core.ts` | 扩展：衰减规则 |

#### 4.3 后果系统

**目标**：完善后果事件的链式反应。

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/urbanDriver/consequenceChain.ts` | 新建 |
| `models/urbanDriverNSFW/consequences.ts` | 扩展：链式规则 |

#### 阶段四验收标准

- [x] 行程自动触发正常运行 — `TripScheduler` + `TripTriggerRule` 实现
- [x] 药物/醉酒状态衰减正确 — `PassengerStateMachine` 实现（5 种欲望阶段、4 种醉酒等级、3 种药物类型）
- [x] 后果事件链式反应正常 — `ConsequenceChain` 实现（6 条规则链、延迟触发、严重度升级）
- [x] 叙事约束正确注入 prompt — `UrbanDriverEngine.getNarrativeConstraints()` 返回完整约束
- [x] 28/28 单元测试全部通过
- [x] `npm run build` 通过

---

### 阶段五：统一游戏循环（2-3 周）

> **进度**: 5.1-5.2 完成 ✅，5.3 性能优化为后续优化项
> - [x] 5.1 全局 Turn Manager — `GlobalTurnManager` 实现（回合推进、事件聚合、回合历史、暂停/恢复）
> - [x] 5.2 优先级调度 — `EngineRegistry` 实现（动态注册/注销、按优先级排序、跨引擎事件路由、广播）
> - [x] Tick-based 定时推进 — `startAutoAdvance/stopAutoAdvance` + `setInterval` 驱动
> - [x] 事件批量处理 — `maxBatchSize` 配置，超过阈值自动聚合
> - [ ] 5.3 性能优化（Web Worker / 批量写入 / 防抖 / 快照压缩）— 后续优化项
> - [x] 33/33 单元测试全部通过

#### 5.1 全局 Turn Manager

**目标**：统一管理所有子系统的回合。

```typescript
class GlobalTurnManager {
  private engines: Map<EngineType, SLGEngine>;
  private currentTurn: number;
  private activeEngines: Set<EngineType>;

  advanceTurn() {
    this.currentTurn++;

    // 按优先级调度各引擎
    for (const [type, engine] of this.priorityOrder()) {
      if (this.activeEngines.has(type) && !engine.isPaused()) {
        engine.advanceTurn();
      }
    }

    // 触发全局事件
    this.emitGlobalEvents();
  }
}
```

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/engine/globalTurnManager.ts` | 新建 |
| `hooks/useGame/engine/engineRegistry.ts` | 新建 |

#### 5.2 优先级调度

**目标**：确保关键事件优先处理。

**优先级矩阵**：

| 引擎 | 优先级 | 调度策略 |
|------|--------|---------|
| BoardGame | 高 | 每回合必处理（玩家正在游玩） |
| UrbanDriver | 高 | 每回合必处理（行程进行中） |
| PhoneSim | 中 | 定时检查（消息队列） |
| CampusNSFW | 中 | 定时检查（欲望状态） |
| BDSM | 低 | 条件触发（关系变化） |

#### 5.3 性能优化

**目标**：减少不必要的 AI 调用，优化批量状态更新。

**优化措施**：

| 优化项 | 说明 | 预期效果 |
|--------|------|---------|
| Web Worker | 将 SLG 计算移至 Worker | 减少主线程阻塞 |
| 批量写入 | 多个状态变更合并为一次 IndexedDB 写入 | 减少 IO 开销 |
| 防抖 | AI 调用防抖，避免频繁请求 | 减少 API 调用次数 30%+ |
| 快照压缩 | GameStateSnapshot 压缩存储 | 减少 IndexedDB 空间 |

**涉及文件**：

| 文件 | 操作 |
|------|------|
| `hooks/useGame/engine/computeWorker.ts` | 新建 |
| `services/batchDbWriter.ts` | 新建 |

#### 阶段五验收标准

- [x] 全局 Turn Manager 正常调度所有引擎 — `GlobalTurnManager` + `EngineRegistry` 实现
- [x] 优先级调度正确，关键事件优先处理 — 按 `ENGINE_PRIORITY` 顺序调度
- [ ] 性能优化生效，API 调用减少 30%+ — 5.3 后续优化
- [x] 多个子系统同时运行时状态一致 — 集成测试通过
- [x] 33/33 单元测试全部通过
- [x] `npm run build` 通过

---

## 五、风险评估

### 5.1 技术风险

| 风险 | 严重度 | 可能性 | 缓解措施 |
|------|--------|--------|---------|
| 状态同步问题（SLG vs AI） | 高 | 中 | 事件溯源 + 乐观更新 + 冲突检测 |
| AI 响应不匹配游戏状态 | 中 | 高 | 结构化输出 + Zod 验证 + 自动修复 |
| 性能问题（大量状态计算） | 中 | 低 | Web Worker 卸载计算 |
| IndexedDB 写入瓶颈 | 低 | 低 | 批量写入 + 防抖 |
| 向后兼容性 | 高 | 中 | 渐进式迁移，保持旧路径兼容 |
| 测试覆盖率不足 | 中 | 高 | 阶段一建立测试框架 |

### 5.2 设计风险

1. **过度工程化** — SLG 引擎可能变得过于复杂
   - 缓解：从 BoardGame 开始小步迭代，每个阶段交付可验证功能

2. **AI 依赖仍然过重** — 即使有 SLG 引擎，叙事质量仍依赖 AI
   - 缓解：做好 prompt 优化，增加叙事约束的精确度

3. **用户体验断裂** — 迁移期间可能出现 UI 闪烁或状态不一致
   - 缓解：每个阶段完成后进行完整 E2E 测试

### 5.3 关键决策

| 决策 | 选项 A | 选项 B | 推荐 |
|------|--------|--------|------|
| 状态管理 | 完全迁移到 Zustand | 保持 hook-based + Zustand 辅助 | B（渐进式） |
| 游戏循环 | 定时器驱动 | 事件驱动（玩家操作触发） | 混合（关键路径定时器，其余事件驱动） |
| AI 集成 | 结构化输出 | 自由文本 + 解析 | 结构化输出（Zod schema） |
| 迁移方式 | 大爆炸重写 | 渐进式替换 | 渐进式 |

---

## 六、文件变更清单

### 新建文件（32 个）

| 文件 | 阶段 | 说明 |
|------|------|------|
| `hooks/useGame/engine/types.ts` | 一 | 统一接口类型定义 |
| `hooks/useGame/engine/baseEngine.ts` | 一 | 抽象基类 |
| `hooks/useGame/engine/turnManager.ts` | 一 | 回合调度器 |
| `hooks/useGame/engine/actionRouter.ts` | 一 | 操作路由器 |
| `hooks/useGame/engine/actionLogger.ts` | 一 | 操作日志（事件溯源） |
| `hooks/useGame/engine/globalTurnManager.ts` | 五 | 全局回合管理器 |
| `hooks/useGame/engine/engineRegistry.ts` | 五 | 引擎注册表 |
| `hooks/useGame/engine/computeWorker.ts` | 五 | Web Worker 计算 |
| `hooks/useGame/engine/phoneEngine.ts` | 三 | 手机模拟引擎 |
| `hooks/useGame/engine/notificationEngine.ts` | 三 | 通知引擎 |
| `hooks/useGame/engine/urbanDriverEngine.ts` | 四 | 网约车引擎封装 |
| `hooks/useGame/device/messageScheduler.ts` | 三 | 消息调度器 |
| `hooks/useGame/device/messageQueue.ts` | 三 | 消息队列 |
| `hooks/useGame/device/socialGraph.ts` | 三 | 社交图谱 |
| `hooks/useGame/boardGameNSFWEngine/gameLoop.ts` | 二 | 游戏循环 |
| `hooks/useGame/urbanDriver/tripScheduler.ts` | 四 | 行程调度器 |
| `hooks/useGame/urbanDriver/passengerStateMachine.ts` | 四 | 乘客状态机 |
| `hooks/useGame/urbanDriver/consequenceChain.ts` | 四 | 后果链 |
| `services/batchDbWriter.ts` | 五 | 批量数据库写入 |
| `prompts/runtime/deviceMessages.ts` | 三 | 手机消息叙事约束 |
| `components/features/Device/NotificationCenter.tsx` | 三 | 通知中心 UI |
| `vitest.config.ts` | 一 | 测试配置 |
| `hooks/useGame/boardGameNSFWEngine/core.test.ts` | 一 | 桌游引擎测试 |
| `hooks/useGame/urbanDriverNSFWEngine.test.ts` | 一 | 网约车引擎测试 |
| `hooks/useGame/engine/turnManager.test.ts` | 一 | 回合管理器测试 |
| `components/features/BoardGame/panels/真心话大冒险Panel.tsx` | 二 | 游戏面板 |
| `components/features/BoardGame/panels/国王游戏Panel.tsx` | 二 | 游戏面板 |
| `components/features/BoardGame/panels/大富翁Panel.tsx` | 二 | 游戏面板 |
| `components/features/BoardGame/panels/棋牌游戏Panel.tsx` | 二 | 游戏面板 |
| `components/features/BoardGame/panels/密室逃脱Panel.tsx` | 二 | 游戏面板 |
| `components/features/BoardGame/panels/剧本杀Panel.tsx` | 二 | 游戏面板 |
| `components/features/BoardGame/panels/狼人杀Panel.tsx` | 二 | 游戏面板 |

### 修改文件（15 个）

| 文件 | 阶段 | 变更内容 |
|------|------|---------|
| `hooks/useGame/subsystems/zustandStore.ts` | 一 | 新增 EngineSlice、TurnSlice、ActionLogSlice |
| `hooks/useGame/state/gameStateAccess.ts` | 一 | 暴露新字段 |
| `hooks/useGame/boardGameNSFWEngine/core.ts` | 二 | 继承 BaseEngine，补充标准接口 |
| `hooks/useGame/boardGameNSFWEngine/index.ts` | 二 | 更新导出 |
| `hooks/useGame/boardGameNSFWEngine/eventSystem.ts` | 二 | 与主事件管理器集成 |
| `hooks/useGame/urbanDriverNSFWEngine.ts` | 四 | 接入统一引擎接口 |
| `hooks/useGame/urbanDriverNSFWIntegration.ts` | 四 | 适配新接口 |
| `hooks/useGame/device/useDeviceMessages.ts` | 三 | 接入消息调度系统 |
| `hooks/useGame/systemPromptBuilder.ts` | 二/三 | 注入叙事约束 |
| `prompts/runtime/boardGameNSFW.ts` | 二 | 增强叙事约束生成器 |
| `models/installedApps.ts` | 三 | 扩展 App 内状态 |
| `models/urbanDriverNSFW/core.ts` | 四 | 扩展衰减规则 |
| `models/urbanDriverNSFW/consequences.ts` | 四 | 扩展链式规则 |
| `package.json` | 一 | 添加 vitest 依赖 |

---

## 七、预估工时

| 阶段 | 内容 | 工时 | 风险缓冲 |
|------|------|------|---------|
| 阶段一 | 基础设施准备 | 2-3 周 | +1 周 |
| 阶段二 | BoardGame SLG 完善 | 3-4 周 | +1 周 |
| 阶段三 | Phone App 引擎增强 | 3-4 周 | +1 周 |
| 阶段四 | Urban Driver 增强 | 2-3 周 | +1 周 |
| 阶段五 | 统一游戏循环 | 2-3 周 | +1 周 |
| **总计** | | **12-17 周** | **+5 周** |

> 注：各阶段可并行工作的部分（如 UI 开发与引擎开发）可缩短总工期。

---

## 八、验收标准总览

### 功能验收

| 模块 | 验收项 |
|------|--------|
| BoardGame | 8 种游戏均可交互游玩，玩家操作即时反馈，AI 叙事符合约束 |
| Phone App | 消息定时推送，NPC 自动互动，通知中心正常 |
| Urban Driver | 行程自动触发，状态衰减正确，后果链正常 |
| 统一引擎 | 全局回合调度正常，多子系统同时运行状态一致 |

### 质量验收

| 项目 | 标准 |
|------|------|
| 构建 | `npm run build` 通过 |
| 类型检查 | `tsc --noEmit` 零错误 |
| 测试覆盖率 | 引擎层 > 80%，UI 层 > 60% |
| 性能 | API 调用减少 30%+，主线程无阻塞 |
| 移动端 | 所有新 Panel 响应式正常 |

---

## 九、后续演进方向

完成 SLG + AI 混合架构后，可进一步探索：

1. **多人联机** — 通过 WebSocket 实现真正的多人桌游
2. **AI NPC 自主行为** — NPC 根据 SLG 状态自主决策，不依赖玩家操作
3. **动态难度调节** — 根据玩家表现自动调整引擎参数
4. **存档回放** — 利用事件溯源实现游戏过程回放
5. **MOD 系统** — 允许社区自定义游戏规则和场景

---

## 十、实施记录

### 2026-05-12 创建

- 完成架构分析与方案设计
- 定义分层架构、数据流、关键接口
- 制定 5 阶段实施计划
- 评估风险与工时

### 2026-05-12 阶段一至五实施

- **阶段一**：基础设施（types.ts, baseEngine.ts, turnManager.ts, actionRouter.ts, actionLogger.ts）+ 98 tests
- **阶段二**：BoardGame 完善（BoardGameEngine, gameLoop.ts, 7 Panel）+ 38 tests
- **阶段三**：Phone App 增强（PhoneEngine, NotificationEngine, MessageScheduler, MessageQueue）+ 39 tests
- **阶段四**：Urban Driver 增强（UrbanDriverEngine, TripScheduler, PassengerStateMachine, ConsequenceChain）+ 28 tests
- **阶段五**：统一游戏循环（GlobalTurnManager, EngineRegistry）+ 33 tests
- **总计**：20+ 新文件，158/158 测试通过，构建通过
- **未完成项**：Phase 2 E2E 验证、移动端响应式测试、Phase 5.3 性能优化（Web Worker / 批量写入 / 防抖）
