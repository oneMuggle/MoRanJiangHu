# 桌游社交 NSFW UI 互动系统

> 创建日期: 2026-05-12
> 状态: 规划中

## 需求

为桌游社交 NSFW 系统（8种桌游类型、3-8人多人局管理）设计并实现沉浸式 UI 互动体验。当前引擎层功能完整但 UI 层几乎不存在（仅一个"开发中"占位符）。

## 现状分析

| 层级 | 状态 | 说明 |
|------|------|------|
| 数据模型 | 完整 | 8种桌游类型状态 + 多人局管理 + 事件编排 |
| 引擎逻辑 | 完整 | 触发判定、紧张度计算、阵营分配、回合推进 |
| 提示词约束 | 完整 | 每种游戏的叙事约束 + 多人局叙事 |
| 设置面板 | 占位 | 仅显示"开发中" |
| 仪表盘 | 不存在 | moduleRegistry 已注册但无组件 |
| 游戏 Modal | 不存在 | 无任何互动 UI |
| 导航入口 | 不存在 | 右侧面板/手机快捷菜单均无入口 |

## 核心设计原则

1. **文本优先**：UI 展示结构化状态（数字、进度条、状态徽章），叙事仍由 AI 在聊天区域生成
2. **分层渐进**：基础设施 → 共享组件 → 仪表盘 → 首个游戏面板 → 完整 8 种游戏
3. **响应式**：桌面端 Modal + 移动端 Bottom Sheet

## 变更文件总览

| 文件 | 操作 | 阶段 |
|------|------|------|
| `hooks/useGame/subsystems/zustandStore.ts` | 修改 | Phase 1 |
| `hooks/useGame.ts` | 修改 | Phase 1 |
| `components/features/lazyComponents.tsx` | 修改 | Phase 1 |
| `components/app/useAppModalState.ts` | 修改 | Phase 1 |
| `components/features/BoardGame/*` | 新建 (7) | Phase 1-4 |
| `components/features/Settings/BoardGameNSFWSettings.tsx` | 修改 | Phase 5 |
| `components/layout/RightPanel.tsx` | 修改 | Phase 6 |
| `components/layout/MobileQuickMenu.tsx` | 修改 | Phase 6 |
| `hooks/useModalOpeners.ts` | 修改 | Phase 6 |

## 实施步骤

### Phase 1: 基础设施

#### 1.1 Zustand BoardGame Slice

**文件**: `hooks/useGame/subsystems/zustandStore.ts`

新增 slice 管理 UI 瞬态状态（不复制引擎数据）：

```typescript
interface BoardGameSliceState {
  showBoardGameDashboard: boolean;
  showBoardGameModal: boolean;
  activeBoardGameTab: 'dashboard' | 'history' | 'preferences';
  selectedGameType: 桌游类型 | null;
}
```

#### 1.2 暴露 Setters

**文件**: `hooks/useGame.ts` — 解构并返回新增的 setter。

#### 1.3 懒加载注册

**文件**: `components/features/lazyComponents.tsx`

```typescript
export const BoardGameDashboard = 创建可预加载懒组件(() => import('./BoardGame/BoardGameDashboard'));
export const BoardGameModal = 创建可预加载懒组件(() => import('./BoardGame/BoardGameModal'));
export const MobileBoardGameDashboard = 创建可预加载懒组件(() => import('./BoardGame/MobileBoardGameDashboard'));
export const MobileBoardGameModal = 创建可预加载懒组件(() => import('./BoardGame/MobileBoardGameModal'));
```

#### 1.4 Modal 状态管理

**文件**: `components/app/useAppModalState.ts` — 新增 `showBoardGameDashboard` / `showBoardGameModal` 状态。

### Phase 2: 共享组件

所有共享组件放在 `components/features/BoardGame/shared/`。

#### 2.1 TensionMeter.tsx — 紧张度进度条 (0-100，绿→黄→红→紫渐变)

#### 2.2 PlayerRoster.tsx — 玩家花名册 (3-8人，活跃/出局状态，阵营色边框)

#### 2.3 EventQueue.tsx — 事件队列 (待处理/已执行，按类型着色)

#### 2.4 RoundCounter.tsx — 回合计数器 (Round 3/12 + 进度点)

#### 2.5 GameTypeSelector.tsx — 8种桌游选择卡片网格

#### 2.6 StatCard.tsx — 通用统计卡片

#### 2.7 ProgressBar.tsx — 从 CampusDesireDashboard 提取为共享组件

### Phase 3: 桌游仪表盘 ("桌游社交仪表盘")

**文件**:
- `components/features/BoardGame/BoardGameDashboard.tsx`
- `components/features/BoardGame/MobileBoardGameDashboard.tsx`

布局结构：

```
+---------------------------------------------------+
| [pulse] 桌游社交仪表盘    BOARD GAME    [X close] |
+---------------------------------------------------+
| [总场次:12] [最高紧张度:87] [NSFW触发:5] [偏好NPC:3] |
+---------------------------------------------------+
| Tabs: [历史记录] [游戏偏好] [多人局统计]             |
+---------------------------------------------------+
| 历史记录列表 (按场次折叠)                           |
| 每场：类型、参与者、NSFW次数、里程碑                 |
|                                                   |
| NPC 偏好进度条 (ProgressBar)                        |
+---------------------------------------------------+
| [开始新桌游] → 打开 BoardGameModal                 |
+---------------------------------------------------+
```

Props:
```typescript
interface BoardGameDashboardProps {
  桌游状态: 桌游状态;
  社交列表: NPC结构[];
  onClose: () => void;
  onStartGame: (type: 桌游类型) => void;
}
```

### Phase 4: 游戏互动 Modal

**文件**:
- `components/features/BoardGame/BoardGameModal.tsx` — 桌面端
- `components/features/BoardGame/MobileBoardGameModal.tsx` — 移动端

#### 4.1 Modal 外壳

```
+---------------------------------------------------+
| [pulse] 桌游局        GAME IN PROGRESS    [X]      |
+---------------------------------------------------+
| [Round 3/12] [Tension: ████░░ 67] [Players: 5]    |
+---------------------------------------------------+
| Player Roster                                      |
+---------------------------------------------------+
| 游戏类型专属面板 (策略模式路由)                      |
+---------------------------------------------------+
| Event Queue (可折叠)                               |
+---------------------------------------------------+
```

#### 4.2 策略注册表

**文件**: `components/features/BoardGame/panels/index.ts`

```typescript
const gamePanelRegistry: Record<桌游类型, React.ComponentType<GamePanelProps>> = {
  '密室逃脱': 密室逃脱Panel,
  '狼人杀': 狼人杀Panel,
  '剧本杀': 剧本杀Panel,
  '真心话大冒险': 真心话大冒险Panel,
  '国王游戏': 国王游戏Panel,
  '大富翁': 大富翁Panel,
  '棋牌游戏': 棋牌游戏Panel,
  '骰子游戏': 骰子游戏Panel,
};
```

#### 4.3 首个实现：骰子游戏 Panel

**文件**: `components/features/BoardGame/panels/骰子游戏Panel.tsx`

```
+-------------------------------------------+
| 骰子游戏 (3 dice)                         |
| [🎲 掷骰按钮]                             |
+-------------------------------------------+
| 当前结果: [轻抚] [亲吻] [翻倍]             |
| 累积效应: Level 4                          |
+-------------------------------------------+
| 历史记录:                                  |
|   R1: 轻抚  拥抱  豁免                     |
|   R2: 翻倍  轻抚  亲吻                     |
|   R3: 亲吻  脱衣  惩罚 ← current           |
+-------------------------------------------+
```

选择骰子游戏的原因：UI 需求相对简单（骰子展示、历史记录、累积效应），能锻炼所有共享组件的使用，且数据模型清晰。

#### 4.4 后续 Panel（按优先级）

1. **密室逃脱Panel** — 房间网格地图、逃脱进度条、主题选择器
2. **真心话大冒险Panel** — 卡片翻转动画、指令展示、饮酒状态
3. **国王游戏Panel** — 国王选择动画、指令展示、执行确认面板
4. **狼人杀Panel** — 角色卡、阵营展示、投票面板、淘汰追踪
5. **剧本杀Panel** — 剧本文本、CP关系指示器、现实/虚构模糊度
6. **大富翁Panel** — 简化地产板、资产追踪、债务惩罚列表
7. **棋牌游戏Panel** — 手牌展示、虚张声势指示、赌注池

### Phase 5: 设置面板

**文件**: `components/features/Settings/BoardGameNSFWSettings.tsx`

替换占位符，实现 `桌游社交NSFW设置` 的完整控制：

- 主开关：启用桌游社交NSFW系统
- 强度选择：关闭/轻度/中度/深度
- 每种游戏类型独立开关
- 触发频率：低/中/高
- 多人局/邀请/成就/线上模式开关

### Phase 6: 导航入口

#### 6.1 右侧面板

**文件**: `components/layout/RightPanel.tsx` — 添加"桌游"菜单项，受 `enableBoardGame` 属性控制。

#### 6.2 手机快捷菜单

**文件**: `components/layout/MobileQuickMenu.tsx` — 添加"桌游"入口 + 骰子图标。

#### 6.3 Modal 开启器

**文件**: `hooks/useModalOpeners.ts` — 新增 `openBoardGameDashboard` / `openBoardGameModal`。

## 数据流

```
引擎状态 (校园系统.欲望系统.桌游状态)
    │ (只读)
    ▼
useGame 返回 state.校园系统
    │
    ▼
App.tsx → BoardGameModals
    │
    ▼
BoardGameModal 提取数据 → PlayerRoster + EventQueue + GamePanel
```

UI 不修改引擎状态，引擎状态变更通过现有 `set校园系统` 更新。

## 风险与缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| 状态路径深嵌套 | 中 | 封装 `useBoardGameState()` selector hook |
| 联合类型区分 | 中 | 每种游戏状态有独立 type 字段，用 discriminated union |
| 移动端空间不足 | 中 | 移动端使用 Bottom Sheet + 垂直滚动 |
| 范围蔓延 | 高 | Phase 4.3 仅实现骰子游戏，其余后续迭代 |
| 与叙事内容重复 | 低 | UI 仅展示结构化数据，不复制叙事文本 |

## 复杂度评估

| 阶段 | 复杂度 | 预估工时 |
|------|--------|----------|
| Phase 1: 基础设施 | 低 | 1-2h |
| Phase 2: 共享组件 | 中 | 3-4h |
| Phase 3: 仪表盘 | 中 | 2-3h |
| Phase 4.1-4.3: Modal+骰子游戏 | 高 | 4-6h |
| Phase 4.4-4.10: 剩余 7 个 Panel | 高 | 8-12h |
| Phase 5: 设置面板 | 低 | 1-2h |
| Phase 6: 导航入口 | 低 | 1h |
| **总计** | **高** | **20-30h** |

## 推荐实施顺序

**本轮**：Phase 1 + Phase 2 + Phase 3 + Phase 4.1-4.2 (基础设施 + 共享组件 + 仪表盘 + Modal 外壳 + 骰子游戏 Panel)

**后续**：Phase 4.3 (剩余 7 Panel) + Phase 5 + Phase 6
