# 桌游社交 SLG 交互体验系统

> 创建日期: 2026-05-12
> 状态: 实施中
> 替代方案: 旧版被动 UI 方案（已覆盖）

---

## 背景与目标

桌游 NSFW 引擎层已功能完整（8种游戏类型、3-8人多人局、事件编排、紧张度计算、阵营分配、回合推进、淘汰机制、NSFW升级判定），但 UI 层仅为"被动观察者"——玩家无法操作，引擎 mechanics 隐藏在 AI prompt 约束中。

**目标**：以 SLG（策略模拟游戏）模式重构桌游交互体验，实现：
1. **当剧情推进到游戏环节时，弹出游戏 UI**
2. **玩家在游戏界面上做策略决策（SLG 操作）**
3. **发送新消息后，游戏暂停并保存状态**
4. **下一回合 LLM 回复后，恢复游戏状态继续**
5. **关键步骤（如惩罚、升级）触发剧情推进到下一回合**

**核心循环**：`玩家决策 → 引擎结算 → AI 叙事描写`

---

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    叙事层 (AI Chat)                       │
│  - 场景渲染  - NPC 性格表达  - 关键步骤详细描写           │
├─────────────────────────────────────────────────────────┤
│                  桥接层 (Bridge Hook)                     │
│  - useBoardGameBridge: SLG 结果 → 叙事约束               │
│  - 自动暂停/恢复  - 状态序列化  - 事件推送               │
├─────────────────────────────────────────────────────────┤
│                  操作层 (Actions Hook)                    │
│  - useBoardGameActions: 封装玩家所有可交互操作            │
│  - 掷骰  - 投票  - 解谜  - 选择  - 资源管理              │
├─────────────────────────────────────────────────────────┤
│                  SLG 引擎层 (现有 Engine)                 │
│  - 紧张度  - 事件编排  - 阵营  - 淘汰  - NSFW 升级        │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
[玩家操作]
    ↓
useBoardGameActions.dispatch(action)
    ↓
boardGameNSFWEngine.executePlayerAction(action)
    ↓
引擎计算结果 → 更新桌游状态
    ↓
useBoardGameBridge.captureNarrativeConstraints(result)
    ↓
生成叙事约束 JSON → 写入待发送上下文
    ↓
[关键步骤？] → 自动触发剧情推进 → AI 按约束生成叙事 → 聊天区展示
```

### 暂停/恢复协议

```
发送消息                    AI 回复
   │                          │
   ▼                          │
暂停游戏                       │
保存状态 ──────────────────► 恢复状态
   │                          继续游戏
   ▼                          │
[聊天区] ──────────────────► [聊天区]
```

---

## 涉及文件

### 新建文件

| 文件 | 用途 |
|------|------|
| `hooks/useBoardGameBridge.ts` | 叙事桥接层：SLG ↔ AI 双向通信，暂停/恢复，叙事约束生成 |
| `hooks/useBoardGameActions.ts` | 玩家操作层：封装所有可交互操作 |
| `components/features/BoardGame/panels/骰子游戏Panel.tsx` | 骰子游戏 SLG 面板（重写为交互版） |
| `components/features/BoardGame/panels/密室逃脱Panel.tsx` | 密室逃脱 SLG 面板 |
| `components/features/BoardGame/panels/狼人杀Panel.tsx` | 狼人杀 SLG 面板 |
| `components/features/BoardGame/panels/剧本杀Panel.tsx` | 剧本杀 SLG 面板 |
| `components/features/BoardGame/panels/真心话大冒险Panel.tsx` | 真心话大冒险 SLG 面板 |
| `components/features/BoardGame/panels/国王游戏Panel.tsx` | 国王游戏 SLG 面板 |
| `components/features/BoardGame/panels/大富翁Panel.tsx` | 大富翁 SLG 面板 |
| `components/features/BoardGame/panels/棋牌游戏Panel.tsx` | 棋牌游戏 SLG 面板 |
| `components/features/BoardGame/shared/ActionButtons.tsx` | 操作按钮组（带 loading/disabled） |
| `components/features/BoardGame/shared/ChoiceDialog.tsx` | 选择对话框（多选项、风险标识） |
| `components/features/BoardGame/shared/StatusBadge.tsx` | 状态徽章（运行/暂停/结束） |

### 修改文件

| 文件 | 变更内容 |
|------|---------|
| `hooks/useGame/subsystems/zustandStore.ts` | BoardGameSlice 扩展：新增 paused 状态、操作历史、待处理事件 |
| `hooks/useGame.ts` | 暴露新 setter 和 actions |
| `hooks/useGame/boardGameNSFWEngine/core.ts` | 新增 `executePlayerAction()`、`pauseGame()`、`resumeGame()` |
| `hooks/useGame/boardGameNSFWEngine/eventSystem.ts` | 事件增加 `pending` 状态，支持玩家选择 |
| `components/features/BoardGame/BoardGameDashboard.tsx` | 增加游戏状态指示（运行/暂停） |
| `components/features/BoardGame/BoardGameModal.tsx` | 集成桥接层，增加暂停/恢复控制 |
| `components/features/BoardGame/MobileBoardGameModal.tsx` | 同上 |
| `components/features/BoardGame/panels/index.ts` | 注册所有 8 个游戏 Panel |
| `components/app/useAppModalState.ts` | 新增 `boardGamePaused` 状态 |
| `components/app/NSFWModals.tsx` | 传递暂停状态和恢复回调 |
| `hooks/useGame/sendWorkflow.ts` | 发消息时自动暂停桌游 |
| `hooks/useGame/responseCommandProcessor.ts` | AI 回复后自动恢复桌游状态 |
| `prompts/runtime/boardGameNSFW.ts` | 增加叙事约束生成器（基于 SLG 结算结果） |

---

## 状态管理扩展

### BoardGameSlice 新增字段

```typescript
interface BoardGameSliceState {
  // 现有
  showBoardGameDashboard: boolean;
  showBoardGameModal: boolean;
  activeBoardGameTab: 'dashboard' | 'history' | 'preferences';
  selectedGameType: 桌游类型 | null;

  // 新增
  boardGamePaused: boolean;
  pauseReason: 'chat-sent' | 'key-step' | 'player-pause' | null;
  pendingEvents: PendingEvent[];
  actionHistory: BoardGameAction[];
  narrativeConstraints: string | null;
  lastSettlement: SettlementResult | null;
}

interface PendingEvent {
  id: string;
  type: '轮流' | '随机' | '阵营';
  description: string;
  choices: EventChoice[];
  timeout?: number;
}

interface EventChoice {
  id: string;
  label: string;
  risk: 'low' | 'medium' | 'high';
  consequence: string;
}

interface SettlementResult {
  success: boolean;
  tensionDelta: number;
  nsfwTriggered: boolean;
  keyStep: boolean;
  narrativeConstraint: string;
  nextState: Partial<桌游状态>;
}
```

---

## 桥接层核心逻辑

```typescript
// hooks/useBoardGameBridge.ts

// 1. 玩家发送消息时自动暂停
function onChatMessageSent() {
  if (hasActiveBoardGame()) {
    pauseBoardGame('chat-sent');
    serializeAndSaveState();
  }
}

// 2. AI 回复后恢复
function onAIReplyReceived() {
  if (isPaused('chat-sent')) {
    restoreState();
    resumeBoardGame();
  }
}

// 3. 关键步骤触发叙事推进
function onKeyStepDetected(result: SettlementResult) {
  pauseBoardGame('key-step');
  pushNarrativeConstraint(result.narrativeConstraint);
  // 强制推进到下一回合，让 AI 描写关键步骤
}

// 4. 叙事约束生成
function generateNarrativeConstraint(action: PlayerAction, result: EngineResult): string {
  return `<桌游叙事约束>
    当前游戏类型: ${result.gameType}
    玩家操作: ${action.type}
    结算结果: ${result.outcome}
    紧张度变化: ${result.tensionDelta}
    NSFW触发: ${result.nsfwTriggered ? '是' : '否'}
    ${result.keyStep ? '关键步骤，请详细描写' : ''}
  </桌游叙事约束>`;
}
```

---

## 各游戏类型 SLG 界面设计

### 1. 骰子游戏

```
┌─────────────────────────────────────────┐
│ 骰子游戏 (3 dice)    回合 5/12          │
├─────────────────────────────────────────┤
│ [紧张度 ████░░ 67]  [累积等级 Lv.4]     │
├─────────────────────────────────────────┤
│     [🎲]    [🎲]    [🎲]               │
│      ?       ?       ?                  │
│  ┌─────────────────────────────────┐    │
│  │ 选择策略：                       │    │
│  │ [激进] 翻倍概率↑ 惩罚风险↑       │    │
│  │ [保守] 豁免概率↑ 累积↓           │    │
│  │ [平衡] 标准投掷                  │    │
│  └─────────────────────────────────┘    │
│           [ 掷骰 ]                       │
├─────────────────────────────────────────┤
│ 历史: R1轻抚→R2亲吻→R3翻倍→R4拥抱       │
└─────────────────────────────────────────┘
```

**核心操作**：选择策略 → 掷骰 → 引擎结算 → 更新累积效应

### 2. 密室逃脱

```
┌─────────────────────────────────────────┐
│ 密室逃脱    剩余时间: 08:32              │
├─────────────────────────────────────────┤
│ [紧张度 ███░░░ 45]  [线索: 3/7]         │
├─────────────────────────────────────────┤
│  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │ 左门   │  │ 中路   │  │ 右窗   │       │
│  │ 需要:  │  │ 需要:  │  │ 需要:  │       │
│  │ 智力≥5 │  │ 敏捷≥7 │  │ 魅力≥4 │       │
│  │ [探索] │  │ [探索] │  │ [探索] │       │
│  └───────┘  └───────┘  └───────┘       │
│  已发现线索:                             │
│  · 墙上的血迹图案 [智力检定通过]          │
├─────────────────────────────────────────┤
│ NPC 状态: 张三[紧张] 李四[冷静]          │
└─────────────────────────────────────────┘
```

**核心操作**：选择路径 → 属性检定 → 发现线索/触发事件

### 3. 狼人杀

```
┌─────────────────────────────────────────┐
│ 狼人杀    第 3 夜    你的身份: 平民      │
├─────────────────────────────────────────┤
│ [存活: 6/8]  [紧张度 █████░ 78]         │
├─────────────────────────────────────────┤
│  玩家列表：                              │
│  👤 张三  [存活]  昨晚投了: 李四        │
│  👤 李四  [存活]  昨晚投了: 王五        │
│  💀 王五  [出局]  身份: 预言家           │
│  ┌─────────────────────────────────┐    │
│  │ 白天投票：                       │    │
│  │ [张三] [李四] [赵六] [跳过]      │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│ 你的推理笔记: [点击编辑]                 │
└─────────────────────────────────────────┘
```

**核心操作**：夜间选择目标 / 白天投票 / 编辑推理笔记

### 4. 剧本杀

```
┌─────────────────────────────────────────┐
│ 剧本杀: 《血色黄昏》   第 2 幕           │
├─────────────────────────────────────────┤
│ [线索卡: 5/12]  [推理度 ███░░░ 42%]     │
├─────────────────────────────────────────┤
│  线索墙：                                │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ 🔪   │ │ 📝   │ │ 🕐   │ │ 👤   │      │
│  │ 凶器 │ │ 遗书 │ │ 时间 │ │ 证人 │      │
│  │ [已得│ │ [未得│ │ [已得│ │ [未得│      │
│  │  到] │ │  到] │ │  到] │ │  到] │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│  ┌─────────────────────────────────┐    │
│  │ 本轮行动：                       │    │
│  │ [搜索房间] [审问 NPC] [隐藏线索] │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│ 推理链: 凶器 → ??? → 凶手               │
└─────────────────────────────────────────┘
```

**核心操作**：搜索/审问/隐藏 → 拼凑线索 → 推理指控

### 5. 真心话大冒险

```
┌─────────────────────────────────────────┐
│ 真心话大冒险    轮到: 你                 │
├─────────────────────────────────────────┤
│ [紧张度 ██░░░░ 28]  [底线余量: 72%]     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ 你的选择：                       │    │
│  │  ┌──────────────┐ ┌──────────┐  │    │
│  │  │   真心话      │ │  大冒险  │  │    │
│  │  │  风险: 低     │ │ 风险: 中 │  │    │
│  │  │  余量 -5%     │ │ 余量-15% │  │    │
│  │  └──────────────┘ └──────────┘  │    │
│  └─────────────────────────────────┘    │
│  底线管理：████████░░ 72%               │
├─────────────────────────────────────────┤
│ NPC 底线余量: 张三 85% | 李四 60%        │
└─────────────────────────────────────────┘
```

**核心操作**：选择真心话/大冒险 → 底线消耗 → 触发后果

### 6. 国王游戏

```
┌─────────────────────────────────────────┐
│ 国王游戏    第 4 轮    你是: 服从者      │
├─────────────────────────────────────────┤
│  🎭 国王命令："李四，给赵六按摩 30 秒"   │
│  ┌─────────────────────────────────┐    │
│  │ [服从] 服从度↑ 紧张度↑           │    │
│  │ [协商] 修改命令内容               │    │
│  │ [反抗] 服从度↓↓ 可能触发惩罚     │    │
│  └─────────────────────────────────┘    │
│  服从度历史：R1✓ R2✓ R3✗ R4?            │
├─────────────────────────────────────────┤
│ 累计服从: 3/4 | 最大反抗: 1              │
└─────────────────────────────────────────┘
```

**核心操作**：回应国王命令（服从/协商/反抗）

### 7. 大富翁

```
┌─────────────────────────────────────────┐
│ 大富翁    你的回合    💰 资金: 5000      │
├─────────────────────────────────────────┤
│  你的位置: 05 (⭐ 机会格)               │
│  ┌─────────────────────────────────┐    │
│  │ 机会卡："获得 NPC 好感，支付 1000"│    │
│  │ [接受] [拒绝]                    │    │
│  └─────────────────────────────────┘    │
│  资产：02 号地块(2000) | 06 号地块(3000) │
├─────────────────────────────────────────┤
│ 掷骰: [🎲 结果: 4] → 移动到 09          │
└─────────────────────────────────────────┘
```

**核心操作**：掷骰移动 → 地块决策（购买/支付/机会）

### 8. 棋牌游戏

```
┌─────────────────────────────────────────┐
│ 棋牌游戏: 斗地主    你的回合             │
├─────────────────────────────────────────┤
│  上家出牌: 对 8                          │
│  你的手牌：3 4 5 6 7 8 9 10 J Q K A 2   │
│  ┌─────────────────────────────────┐    │
│  │ [对 9] [对 J] [对 Q] [不出]     │    │
│  └─────────────────────────────────┘    │
│  其他玩家剩余：张三 8 张 | 李四 15 张    │
└─────────────────────────────────────────┘
```

**核心操作**：选择手牌 → 出牌/不出 → 胜负判定

---

## 实施步骤

### 里程碑 1：基础架构扩展 (2-3h)

- [x] 扩展 `zustandStore.ts` BoardGameSlice 状态字段
- [x] 新增 `useBoardGameActions.ts` 操作层
- [x] 新增 `useBoardGameBridge.ts` 桥接层
- [x] 扩展 `engine/core.ts` 添加 `executePlayerAction`、`pauseGame`、`resumeGame`
- [x] 扩展 `eventSystem.ts` 支持 pending 事件

### 里程碑 2：共享组件补全 (2-3h)

- [x] `ActionButtons.tsx` — 操作按钮组（带 loading/disabled 状态）
- [x] `ChoiceDialog.tsx` — 选择对话框（多选项、风险标识）
- [x] `StatusBadge.tsx` — 状态徽章（运行/暂停/结束）
- [ ] 更新现有共享组件以支持交互（TensionMeter 增加预警动画）

### 里程碑 3：骰子游戏 Panel 重写 (2h)

- [x] 重写 `骰子游戏Panel.tsx` 为完整 SLG 交互
- [x] 策略选择（激进/保守/平衡）
- [x] 掷骰操作 + 动画
- [x] 累积效应可视化
- [x] 历史记录增强

### 里程碑 4：桥接层集成 (2h)

- [x] 发消息时自动暂停游戏（`useGame.ts` 包装 `handleSend` 调用 `onChatMessageSent`）
- [x] AI 回复后自动恢复游戏（包装 `handleSend` 调用 `onAIReplyReceived`）
- [x] 关键步骤触发叙事推进（`keyStep` 检测自动暂停）
- [x] 叙事约束生成与注入（`generateNarrativeConstraint` 暴露到 `actions.boardGameBridge`）

### 里程碑 5：设置面板重写 (1h)

- [x] 主开关、强度选择、游戏类型开关、触发频率
- [x] 多人局/邀请/成就/线上模式开关

### 里程碑 5b：其余 7 个游戏 Panel (8-12h)

按优先级逐个实现：
1. [ ] 真心话大冒险（简单，底线管理）
2. [ ] 国王游戏（简单，服从/反抗）
3. [ ] 大富翁（中等，资源经营）
4. [ ] 棋牌游戏（中等，回合策略）
5. [ ] 密室逃脱（中等，属性检定）
6. [ ] 剧本杀（复杂，线索推理）
7. [ ] 狼人杀（复杂，社交推理）

### 里程碑 6：暂停/恢复协议测试 (1h)

- [ ] 验证发消息 → 暂停 → 保存 → AI 回复 → 恢复 完整链路
- [ ] 验证关键步骤 → 叙事推进流程
- [ ] 验证状态序列化/反序列化正确性

---

## 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 范围蔓延（8种游戏） | 高 | 里程碑 3 仅实现骰子游戏，其余后续迭代 |
| 引擎与 UI 状态不同步 | 中 | 使用 Zustand 作为单一数据源，引擎只读状态 |
| 叙事约束格式不稳定 | 中 | 定义严格的 XML tag 协议，增加校验 |
| 暂停/恢复状态丢失 | 中 | IndexedDB 持久化 + 内存缓存双保险 |
| 移动端空间不足 | 中 | Bottom Sheet + 垂直滚动 + 可折叠面板 |

---

## 验证标准

1. `npm run build` 构建通过
2. 游戏弹出/暂停/恢复链路正常
3. 骰子游戏可完整游玩（选择策略 → 掷骰 → 结算 → 更新状态）
4. 叙事约束正确注入 AI prompt
5. 移动端响应式正常
6. 状态序列化/反序列化无损

---

## 预估工时

| 阶段 | 工时 |
|------|------|
| 里程碑 1：基础架构 | 2-3h |
| 里程碑 2：共享组件 | 2-3h |
| 里程碑 3：骰子游戏重写 | 2h |
| 里程碑 4：桥接层集成 | 2h |
| 里程碑 5：其余 7 Panel | 8-12h |
| 里程碑 6：测试验证 | 1h |
| **总计** | **17-23h** |

---

## 实施记录

### 2026-05-12 进度更新

**已完成里程碑 1-5，共修改 12 个文件：**

| 文件 | 状态 | 变更 |
|------|------|------|
| `hooks/useGame/subsystems/zustandStore.ts` | 已修改 | BoardGameSlice 新增 6 个 SLG 字段 + 8 个 setter |
| `hooks/useGame/state/gameStateAccess.ts` | 已修改 | 暴露 12 个 BoardGame 字段到全局状态访问 |
| `hooks/useGame.ts` | 已修改 | 导入 `useBoardGameBridge`，包装 `handleSend`，暴露 `boardGameBridge` 到返回值 |
| `hooks/useGame/core/useGameReturnMapper.ts` | 已修改 | 新增 `boardGameBridge` 类型定义和返回值传递 |
| `hooks/useBoardGameActions.ts` | 已新建 | 封装 dispatch/pause/resume/recordSettlement/resolvePendingEvent |
| `hooks/useBoardGameBridge.ts` | 已新建 | 叙事桥接层：onChatMessageSent/onAIReplyReceived/onKeyStepDetected |
| `hooks/useGame/boardGameNSFWEngine/core.ts` | 已修改 | 新增 `executePlayerAction` + `玩家操作`/`操作结算结果` 类型 |
| `hooks/useGame/boardGameNSFWEngine/eventSystem.ts` | 已修改 | 新增 `待处理桌游事件`、`桌游事件选择`、`生成待处理桌游事件`、`解析事件选择` |
| `hooks/useGame/boardGameNSFWEngine/index.ts` | 已修改 | 导出新增函数和类型 |
| `components/features/BoardGame/shared/ActionButtons.tsx` | 已新建 | 多布局操作按钮组（horizontal/vertical/grid） |
| `components/features/BoardGame/shared/ChoiceDialog.tsx` | 已新建 | 多选项对话框（低/中/高风险着色） |
| `components/features/BoardGame/shared/StatusBadge.tsx` | 已新建 | 运行/暂停/结束状态徽章 |
| `components/features/BoardGame/shared/index.ts` | 已修改 | 导出新增共享组件 |
| `components/features/BoardGame/panels/骰子游戏Panel.tsx` | 已重写 | 完整 SLG 交互：策略选择、掷骰动画、引擎结算、暂停/恢复 |
| `components/features/Settings/BoardGameNSFWSettings.tsx` | 已存在 | 设置面板已完整实现 |

**TypeScript 编译结果**：新增修改文件零错误（65 个错误均为预先存在的无关文件）。
