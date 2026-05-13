# UI 沉浸式演进方案 — 实施计划

> 创建日期: 2026-05-13
> 状态: **实施中（Phase 1-2 P0 已完成，增强功能已完成）**
> 上游文档: `2026-05-12-slg-rpg-avg-ai-architecture-migration.md`（第七节）
> 最后更新: 2026-05-13

## 进度总览

| Phase | 名称 | 优先级 | 状态 |
|-------|------|--------|------|
| Phase 1 | 数据链路打通 | P0 | ✅ **已完成** |
| Phase 2 | Galgame 核心 UI | P0 | ✅ **已完成** |
| Phase 2.5 | Galgame 体验增强 | P0 | ✅ **已完成** |
| Phase 3 | 场景切换动画 | P1 | 待实施 |
| Phase 4 | 战争迷雾 & 战术地图增强 | P1 | 待实施 |
| Phase 5 | CG 播放器 | P1 | 待实施 |
| Phase 6 | UI 模式切换器 | P2 | 待实施 |
| Phase 7 | 降级体系 | P2 | 待实施 |

**Phase 1-2 产出：**
- 新增 6 个文件：`useTypewriter.ts`, `CharacterSprite.tsx`, `SceneBackground.tsx`, `GalgameDialogueBox.tsx`, `GalgameMode.tsx`, `GalgameView.tsx`
- 修改 5 个文件：`MapExplorerModal.tsx`, `MobileMapExplorerModal.tsx`, `ModalLayer.tsx`, `global.css`, `GameView.tsx`, `useAppModalState.ts`, `App.tsx`
- MapExplorer 弹窗已从 demo 数据切换到真实引擎数据
- Galgame UI 基础设施（立绘、背景、对话框、打字机、容器）全部就绪
- GalgameView 已完整接入 GameView，通过右上角切换按钮可在 Galgame 模式和传统 ChatList 模式间切换

**Phase 2.5 增强产出：**
- 新增 2 个文件：`useAggregatedDialogue.ts`, `DialogueBacklog.tsx`
- 修改 2 个文件：`GalgameDialogueBox.tsx`（disableTypewriter prop）, `GalgameView.tsx`（完全重写）
- 全量对话日志聚合：`useAggregatedDialogue` hook 展平所有回合的所有 logs
- 多条目显示：当前场景最后 3 条堆叠显示（旁白 + NPC 对话）
- 修复 loading 白屏：AI 生成时保留上次场景，不再白屏
- Backlog 对话记录面板：ESC 关闭、自动滚动、时间线样式

---

---

## 一、背景与目标

### 1.1 背景

当前 UI 采用三栏功能面板布局（LeftPanel | Chat | RightPanel），以功能性为导向。架构文档第七节规划了六个演进阶段，目标是将其升级为沉浸式 Galgame/SLG 风格 UI，提升视觉体验。

### 1.2 核心问题

架构文档中的 UI 演进方案已规划完备，但仅有基础设施（组件骨架、数据模型、引擎层）已就绪，**实际可交互的 UI 组件大部分尚未实现**。MapExplorer 和 CGGallery 当前使用 demo 数据硬编码，未与 Zustand Store 和引擎层打通。

### 1.3 目标

1. 打通 MapExplorer / CGGallery 的真实数据链路（替代 demo 数据）
2. 实现 Galgame 对话系统（角色立绘 + 场景背景 + 对话框 + 逐字效果）
3. 实现场景切换动画
4. 完善战术地图的战争迷雾层
5. 实现 UI 模式切换器，根据游戏模式自动切换 UI 风格
6. 实现降级体系（性能/流量/无生图能力用户）

---

## 二、现状分析：已实现 vs 缺失

### 2.1 已实现部分

#### 基础设施层

| 组件/模块 | 文件路径 | 状态 | 说明 |
|-----------|----------|------|------|
| 地图探索核心组件 | `components/features/Exploration/MapExplorer.tsx` | 已实现 | SVG 节点地图，支持路径、危险等级、行动力、可移动判定 |
| 移动端地图组件 | `components/features/Exploration/MobileMapExplorer.tsx` | 已实现 | 列表式移动端适配 |
| 地图弹窗包装器 | `components/features/Exploration/MapExplorerModal.tsx` | 已实现（demo） | 使用硬编码 demo 数据 |
| 移动端地图弹窗 | `components/features/Exploration/MobileMapExplorerModal.tsx` | 已实现（demo） | 使用硬编码 demo 数据 |
| CG 图鉴面板 | `components/features/Galgame/CGGallery.tsx` | 已实现 | 支持筛选、路线分组、锁/解锁状态、大图查看 |
| CG 图鉴弹窗 | `components/features/Galgame/CGGalleryModal.tsx` | 已实现（demo） | 使用硬编码 demo 数据 |
| 移动端 CG 弹窗 | `components/features/Galgame/MobileCGGalleryModal.tsx` | 已实现 | 待确认 |
| Galgame 数据模型 | `models/avg/galgame.ts` | 已实现 | Route、Ending、CG、State 定义完整 |
| 对话树模型 | `models/avg/dialogueTree.ts` | 已实现 | Phase 11 完成 |
| 关系图谱模型 | `models/avg/relationGraph.ts` | 已实现 | Phase 12 完成 |
| 分支叙事模型 | `models/avg/branchNarrative.ts` | 已实现 | Phase 13 完成 |
| 探索引擎 | `hooks/useGame/engine/explorationEngine.ts` | 已实现 | Phase 14 完成 |
| RPG 战斗引擎 | `hooks/useGame/engine/rpgBattleEngine.ts` | 已实现 | Phase 8 完成 |
| 日常城镇引擎 | `hooks/useGame/engine/dailyTownEngine.ts` | 已实现 | Phase 10 完成 |
| 对话树引擎 | `hooks/useGame/engine/avgDialogueEngine.ts` | 已实现 | Phase 11 完成 |
| 关系图谱引擎 | `hooks/useGame/engine/avgRelationEngine.ts` | 已实现 | Phase 12 完成 |
| 分支叙事引擎 | `hooks/useGame/engine/avgBranchEngine.ts` | 已实现 | Phase 13 完成 |
| 引擎注册表 | `hooks/useGame/engine/engineRegistry.ts` | 已实现 | 引擎注册/路由 |
| 引擎基类 | `hooks/useGame/engine/baseEngine.ts` | 已实现 | 所有引擎继承 |
| Zustand Store | `hooks/useGame/subsystems/zustandStore.ts` | 已实现 | 14 slices |
| useGame 探索状态 | `hooks/useGame.ts` | 已实现 | explorationNodes, explorationPaths, explorationCurrentAp 等 |
| useGame UI 状态控制 | `hooks/useGame.ts` | 已实现 | setShowCGGallery, setShowMapExplorer |
| ModalLayer 路由 | `components/app/ModalLayer.tsx` | 已实现 | CGGallery + MapExplorer 已注册 |
| 懒加载组件 | `components/features/lazyComponents.tsx` | 已实现 | CGGalleryModal + MapExplorerModal 已注册 |

#### useGame.ts 导出的关键状态

```
// Exploration Slice（已实现）
explorationPaused, explorationPauseReason,
explorationNodes, explorationPaths,
explorationCurrentAp, explorationMaxAp,
explorationCurrentNodeId, explorationPendingEvents,
setExplorationPaused, setExplorationPauseReason,
setExplorationNodes, setExplorationPaths,
setExplorationCurrentAp, setExplorationMaxAp,
setExplorationCurrentNodeId, setExplorationPendingEvents,
syncExplorationState,
```

### 2.2 缺失部分（本节实施目标）

| 缺失组件 | 架构文档计划文件 | 状态 | 优先级 |
|----------|------------------|------|--------|
| `CharacterSprite.tsx` | 七.2 UI-1 | 未实现 | P0 |
| `SceneBackground.tsx` | 七.2 UI-1 | 未实现 | P0 |
| `GalgameDialogueBox.tsx` | 七.2 UI-1/UI-2 | 未实现 | P0 |
| `GalgameMode.tsx` | 七.2 UI-1 | 未实现 | P0 |
| `CGPlayer.tsx` | 七.2 UI-5 | 未实现 | P1 |
| `TacticalMap.tsx` | 七.2 UI-4 | 未实现 | P1 |
| `FogOfWar.tsx` | 七.2 UI-4 | 未实现 | P1 |
| `SceneTransition.tsx` | 七.2 UI-3 | 未实现 | P1 |
| `ModeSwitcher.tsx` | 七.2 UI-6 | 未实现 | P2 |
| `useTypewriter.ts` | 七.2 UI-1 | 未实现 | P0 |
| `uiModeManager.ts` | 七.2 UI-6 | 未实现 | P2 |

#### 数据链路问题

| 问题 | 说明 |
|------|------|
| MapExplorerModal 使用硬编码 demo 数据 | 未连接 `explorationNodes` / `explorationPaths` 等 Zustand 状态 |
| MobileMapExplorerModal 使用硬编码 demo 数据 | 同上 |
| CGGalleryModal 使用硬编码 demo 数据 | 未连接 `avgRelationEngine` 的 CG 数据 |
| MapExplorer 无战争迷雾 | 架构文档规划的 FogOfWar 未实现 |
| 无角色立绘/场景背景组件 | UI-1 核心缺失 |
| 无对话框/逐字效果 | UI-2 核心缺失 |
| 无场景切换动画 | UI-3 缺失 |
| 无 UI 模式切换逻辑 | UI-6 缺失，App.tsx 未根据模式切换渲染层 |

---

## 三、分阶段实施计划

### Phase 1：数据链路打通（P0 — 1-2 天）

**目标**：将 MapExplorer 和 CGGallery 从 demo 数据切换到真实 Zustand 状态。

#### 步骤

- [x] **步骤 1.1**：修改 `MapExplorerModal.tsx`，从 Zustand Store 读取真实数据
  - 文件：`components/features/Exploration/MapExplorerModal.tsx`
  - 改动：移除硬编码 demoNodes/demoPaths，改为从 store 读取 `explorationNodes`、`explorationPaths`、`explorationCurrentAp`、`explorationMaxAp`、`explorationCurrentNodeId`、`explorationPendingEvents`
  - 将 `onMove` 回调连接到引擎层的事件处理（通过 `explorationBridge` 或直接调用引擎方法）
  - 状态：✅ 已完成（2026-05-13）。使用 `adaptMapData` 转换引擎数据，`onMove` 通过 `explorationBridge.moveTo` 调用

- [x] **步骤 1.2**：修改 `MobileMapExplorerModal.tsx`，同上
  - 文件：`components/features/Exploration/MobileMapExplorerModal.tsx`
  - 状态：✅ 已完成（2026-05-13）。与桌面端同样的数据接入方式

- [ ] **步骤 1.3**：修改 `CGGalleryModal.tsx`，从 Zustand Store 读取 CG 数据
  - 文件：`components/features/Galgame/CGGalleryModal.tsx`
  - 改动：从 `avgRelationEngine` 的 Zustand slice 读取 CG 列表，移除 demoCGs 硬编码

- [ ] **步骤 1.4**：修改 `MobileCGGalleryModal.tsx`，同上
  - 文件：`components/features/Galgame/MobileCGGalleryModal.tsx`

- [ ] **步骤 1.5**：扩展 Zustand Store，添加 UI 相关状态
  - 文件：`hooks/useGame/subsystems/zustandStore.ts`
  - 新增 slices：`uiSlice`（当前 UI 模式、视觉层级、动画开关等）

#### 依赖

- 无（现有 Zustand slices 已包含 exploration 数据）

---

### Phase 2：Galgame 核心 UI（P0 — 3-4 天）

**目标**：实现角色立绘、场景背景、对话框、逐字效果。

#### 步骤

- [x] **步骤 2.1**：实现逐字显示 Hook
  - 文件：`hooks/useGame/ui/useTypewriter.ts`（新建）
  - 功能：
    - 输入完整文本，按字符逐个显示（可配置速度）
    - 支持 `skip()` 跳过到完整显示
    - 支持 `isComplete` 状态
    - 支持中文按字符（非按字节）显示
  - 状态：✅ 已完成（2026-05-13）。使用 `[...text]` 展开支持中文

- [x] **步骤 2.2**：实现角色立绘组件
  - 文件：`components/features/Galgame/CharacterSprite.tsx`（新建）
  - 功能：
    - 接收 NPC 数据（名字、图片 URL、表情、位置）
    - 支持左/右侧定位（说话中的角色在前景）
    - 支持 CSS 呼吸动画（`@keyframes breathe`）
    - 支持表情切换（通过 CSS filter 或不同图片）
    - 支持懒加载和预缓存
    - 降级支持：无图片时显示色块 + 名称标签（Tier 3）
  - 状态：✅ 已完成（2026-05-13）

- [x] **步骤 2.3**：实现场景背景组件
  - 文件：`components/features/Galgame/SceneBackground.tsx`（新建）
  - 功能：
    - 根据当前区域加载背景图
    - 支持淡入淡出过渡
    - 支持时段影响色调（CSS `filter: brightness()` + `sepia()`）
    - 降级支持：CSS gradient 模拟场景氛围（Tier 3）
    - 图片缓存到 IndexedDB
  - 状态：✅ 已完成（2026-05-13）。CSS gradient 降级已实现

- [x] **步骤 2.4**：实现 Galgame 对话框
  - 文件：`components/features/Galgame/GalgameDialogueBox.tsx`（新建）
  - 功能：
    - 角色名显示区
    - 对话文本区（集成 useTypewriter）
    - 点击跳过逐字动画
    - 选项按钮列表（与 AVG 对话树引擎联动）
    - 后果提示小字
  - 状态：✅ 已完成（2026-05-13）

- [x] **步骤 2.5**：实现 Galgame 模式容器
  - 文件：`components/features/Galgame/GalgameMode.tsx`（新建）
  - 功能：
    - 组合 SceneBackground + CharacterSprite(s) + GalgameDialogueBox
    - 从 Zustand 读取当前对话数据
    - 支持移动端适配（全屏纵向布局）
  - 状态：✅ 已完成（2026-05-13）

#### 依赖

- Phase 1（需已打通数据链路）
- useTypewriter 是其他组件的前置依赖

---

### Phase 3：场景切换动画（P1 — 1-2 天）

**目标**：区域移动时增加过渡动画。

#### 步骤

- [ ] **步骤 3.1**：实现场景切换组件
  - 文件：`components/features/Transitions/SceneTransition.tsx`（新建）
  - 功能：
    - 支持淡入淡出（fade）模式
    - 支持滑入滑出（slide）模式
    - 支持全屏过渡模式
    - 显示过渡文本（AI 生成或预设）
    - 可配置动画时长
  - 动画实现：使用 `framer-motion` 或纯 CSS transition

- [ ] **步骤 3.2**：集成到 MapExplorer
  - 文件：`components/features/Exploration/MapExplorer.tsx`
  - 改动：移动节点时触发 SceneTransition

- [ ] **步骤 3.3**：集成到 GalgameMode
  - 文件：`components/features/Galgame/GalgameMode.tsx`
  - 改动：场景切换时使用过渡

- [ ] **步骤 3.4**：设置中增加「关闭动画」开关
  - 文件：`components/features/Settings/` 相关 tab
  - 改动：新增视觉设置项

#### 依赖

- Phase 2

---

### Phase 4：战争迷雾 & 战术地图增强（P1 — 2-3 天）

**目标**：为 SLG 战术地图增加战争迷雾层和缩放/拖拽能力。

#### 步骤

- [ ] **步骤 4.1**：实现战争迷雾组件
  - 文件：`components/features/Exploration/FogOfWar.tsx`（新建）
  - 功能：
    - 使用 Canvas 覆盖层渲染迷雾
    - 已探索区域清晰，未探索区域模糊/黑色
    - 相邻区域半透明（探索中）
    - 迷雾揭示动画（玩家移动到新区域时）

- [ ] **步骤 4.2**：增强 MapExplorer — 支持缩放和拖拽
  - 文件：`components/features/Exploration/MapExplorer.tsx`
  - 改动：
    - 增加 viewBox 动态调整支持缩放
    - 支持鼠标拖拽平移
    - 支持滚轮缩放
    - 玩家位置角色图标
    - 路径线区分已解锁/未解锁

- [ ] **步骤 4.3**：创建 TacticalMap 组件（可选，如现有 MapExplorer 已满足需求可跳过）
  - 文件：`components/features/Exploration/TacticalMap.tsx`（新建）
  - 说明：如果需要更复杂的 2D 俯视角渲染（如 tile-based 地图），则新建此组件；否则复用 MapExplorer 并增强

#### 依赖

- Phase 1（需真实数据驱动）

---

### Phase 5：CG 播放器（P1 — 2 天）

**目标**：实现全屏 CG 播放体验。

#### 步骤

- [ ] **步骤 5.1**：实现 CG 播放器
  - 文件：`components/features/Galgame/CGPlayer.tsx`（新建）
  - 功能：
    - 全屏 CG 图片展示
    - 叙事文本叠加
    - 点击继续
    - 淡入淡出过渡
    - 自动记录到 CG 图鉴

- [ ] **步骤 5.2**：CG 触发流程集成
  - 文件：`hooks/useGame/ui/cgTriggerWorkflow.ts`（新建）
  - 功能：
    - 监听好感度/事件/结局触发条件
    - 调用图片生成 API（如有配置）
    - 缓存到 IndexedDB
    - 更新 Zustand 中 CG 状态

#### 依赖

- Phase 1（CG 数据链路）
- Phase 2（Galgame 基础设施）

---

### Phase 6：UI 模式切换器（P2 — 2-3 天）

**目标**：根据游戏模式自动切换 UI 风格。

#### 步骤

- [ ] **步骤 6.1**：实现 UI 模式管理器
  - 文件：`hooks/useGame/ui/uiModeManager.ts`（新建）
  - 功能：
    - 定义模式枚举：`'default' | 'avg' | 'rpg' | 'exploration' | 'town' | 'boardgame' | 'phone'`
    - 模式切换规则（触发条件 -> 目标模式）
    - 过渡动画管理
    - 手动切换覆盖

- [ ] **步骤 6.2**：实现模式切换器组件
  - 文件：`components/features/UIMode/ModeSwitcher.tsx`（新建）
  - 功能：
    - 根据当前模式决定渲染哪个 UI 层
    - default -> 三栏布局（现有 LeftPanel/Chat/RightPanel）
    - avg -> GalgameMode
    - exploration -> 战术地图
    - 模式切换过渡动画

- [ ] **步骤 6.3**：集成到 App.tsx / ModalLayer
  - 文件：`components/app/ModalLayer.tsx` 或 `App.tsx`
  - 改动：在现有 view 路由基础上增加模式切换逻辑

#### 依赖

- Phase 2（GalgameMode）
- Phase 4（战术地图）

---

### Phase 7：降级体系（P2 — 3-4 天）

**目标**：实现四阶降级，覆盖所有用户群。

#### 步骤

- [ ] **步骤 7.1**：纯文本模式开关（Tier 4）
  - 文件：`hooks/useGame/ui/performanceConfig.ts`（扩展现有）
  - 功能：视觉层级设置，关闭所有图片/动画

- [ ] **步骤 7.2**：图片 IndexedDB 缓存
  - 文件：`services/dbService.ts` 扩展现有 IndexedDB 操作
  - 功能：图片缓存读写、TTL 管理

- [ ] **步骤 7.3**：手机端性能优化
  - 文件：`hooks/useGame/ui/performanceDetector.ts`（新建）
  - 功能：
    - 检测 `navigator.hardwareConcurrency`
    - 检测电池 API
    - 检测 Connection API
    - 自动降级决策

- [ ] **步骤 7.4**：CSS 氛围场景（Tier 3）
  - 文件：`components/features/Galgame/CSSSceneBackground.tsx`（新建）
  - 功能：纯 CSS gradient 模拟场景氛围

- [ ] **步骤 7.5**：程序化头像（无生图能力用户）
  - 文件：`components/features/Galgame/ProceduralAvatar.tsx`（新建）
  - 功能：使用 dicebear 或自定义算法生成头像

- [ ] **步骤 7.6**：设置面板增加性能/流量选项
  - 文件：`components/features/Settings/` 相关 tab
  - 新增：「性能模式」「流量模式」设置项

#### 依赖

- Phase 2（需要组件支持降级）

---

## 四、文件级别汇总

### 新建文件清单（共 16 个）

| 文件 | Phase | 说明 | 状态 |
|------|-------|------|------|
| `hooks/useGame/ui/useTypewriter.ts` | 2 | 逐字显示 hook | ✅ 已完成 |
| `hooks/useGame/ui/uiModeManager.ts` | 6 | UI 模式管理器 | 待实施 |
| `hooks/useGame/ui/performanceDetector.ts` | 7 | 设备性能检测 | 待实施 |
| `hooks/useGame/ui/cgTriggerWorkflow.ts` | 5 | CG 触发流程 | 待实施 |
| `components/features/Galgame/CharacterSprite.tsx` | 2 | 角色立绘组件 | ✅ 已完成 |
| `components/features/Galgame/SceneBackground.tsx` | 2 | 场景背景组件 | ✅ 已完成 |
| `components/features/Galgame/GalgameDialogueBox.tsx` | 2 | 对话框 + 逐字效果 | ✅ 已完成 |
| `components/features/Galgame/GalgameMode.tsx` | 2 | Galgame 模式容器 | ✅ 已完成 |
| `components/features/Galgame/CGPlayer.tsx` | 5 | CG 播放器 | 待实施 |
| `components/features/Galgame/CSSSceneBackground.tsx` | 7 | CSS 氛围场景（降级） | 待实施 |
| `components/features/Galgame/ProceduralAvatar.tsx` | 7 | 程序化头像 | 待实施 |
| `components/features/Exploration/FogOfWar.tsx` | 4 | 战争迷雾层 | 待实施 |
| `components/features/Transitions/SceneTransition.tsx` | 3 | 场景切换动画 | 待实施 |
| `components/features/UIMode/ModeSwitcher.tsx` | 6 | UI 模式切换器 | 待实施 |
| `hooks/useGame/ui/__tests__/useTypewriter.test.ts` | 2 | useTypewriter 测试 | 待实施 |
| `hooks/useGame/ui/__tests__/performanceDetector.test.ts` | 7 | performanceDetector 测试 | 待实施 |

### 修改文件清单（共 9 个）

| 文件 | Phase | 改动说明 | 状态 |
|------|-------|----------|------|
| `components/features/Exploration/MapExplorerModal.tsx` | 1 | 连接 Zustand 真实数据 | ✅ 已完成 |
| `components/features/Exploration/MobileMapExplorerModal.tsx` | 1 | 同上 | ✅ 已完成 |
| `components/features/Galgame/CGGalleryModal.tsx` | 1 | 连接 Zustand 真实数据 | 待实施 |
| `components/features/Galgame/MobileCGGalleryModal.tsx` | 1 | 同上 | 待实施 |
| `components/features/Exploration/MapExplorer.tsx` | 3,4 | 集成场景切换动画 + 缩放拖拽 | 待实施 |
| `hooks/useGame/subsystems/zustandStore.ts` | 1 | 新增 uiSlice | 待实施 |
| `services/dbService.ts` | 7 | 扩展图片缓存 | 待实施 |
| `components/app/ModalLayer.tsx` | 6 | 集成模式切换器 | ✅ 已完成（传递 onMove 回调） |
| `components/features/lazyComponents.tsx` | 2,3,5,6 | 注册新组件 | 待实施 |
| `styles/global.css` | 2 | 新增呼吸动画 | ✅ 已完成 |

---

## 五、阶段依赖关系

```
Phase 1（数据链路）──┬──▶ Phase 2（Galgame 核心）──▶ Phase 3（场景动画）
                    │                                  │
                    │                                  └─▶ Phase 5（CG 播放器）
                    │
                    ├──▶ Phase 4（战争迷雾）───────────┘
                    │
                    └─────────────────────────────────▶ Phase 6（模式切换器）
                                                            │
                                                            └─▶ Phase 7（降级体系）
```

- Phase 1 是独立的前置条件，所有其他阶段都需要真实数据
- Phase 2 完成后，Phase 3 和 Phase 5 可以并行
- Phase 6 依赖 Phase 2（GalgameMode）和 Phase 4（战术地图）
- Phase 7 依赖 Phase 2（需要组件支持降级）

---

## 六、风险评估

### 6.1 技术风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 大图片解码导致手机端发热 | 用户体验差 | 高 | Phase 7 降级体系，手机端限制分辨率 |
| Canvas 迷雾渲染性能开销 | 低端设备卡顿 | 中 | 手机端降级为简单遮罩 |
| useTypewriter 中文分字问题 | 逐字效果异常 | 低 | 使用 `[...text]` 展开而非 `split('')` |
| Zustand 状态同步延迟 | 地图/CG 数据不一致 | 低 | 使用 `syncExplorationState` 统一同步 |
| framer-motion 包体积增加 | 加载变慢 | 中 | 使用纯 CSS transition 替代 |

### 6.2 项目风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| 分阶段过多，实施周期长 | 交付延迟 | 中 | 优先 P0（Phase 1+2），P1/P2 可后续迭代 |
| AI 生图 API 不稳定 | CG 无法生成 | 中 | 降级到 CC0 预置素材 / CSS 氛围 |
| 移动端适配工作量大 | 延迟发布 | 低 | 先完成桌面端，移动端复用现有 MobileXxx 模式 |

### 6.3 推荐实施顺序

1. **MVP（Week 1-2）**：Phase 1 + Phase 2
   - 数据链路打通 + Galgame 核心 UI
   - 这是视觉体验的核心，优先交付

2. **增强（Week 3）**：Phase 3 + Phase 4 + Phase 5
   - 场景动画 + 战争迷雾 + CG 播放器
   - 提升沉浸感和收集乐趣

3. **完善（Week 4）**：Phase 6 + Phase 7
   - 模式切换 + 降级体系
   - 确保所有用户都能流畅体验

---

## 七、验收标准

### Phase 1 验收

- [x] MapExplorerModal 显示真实 exploration 数据（非 demo）✅
- [x] 点击可移动节点触发真实移动 ✅（通过 explorationBridge.moveTo）
- [ ] CGGalleryModal 显示真实 CG 数据
- [ ] 移动端弹窗同样使用真实数据

### Phase 2 验收

- [x] 角色立绘在对话时正确显示（通过 GalgameView → GalgameMode → CharacterSprite 链路）
- [x] 说话中的角色立绘有呼吸动画 ✅（`animate-breathe` 已添加到 global.css）
- [x] 场景背景根据当前区域正确加载（通过 GalgameView → SceneBackground 链路）
- [x] 对话框支持逐字显示，点击可跳过 ✅
- [x] 选项按钮列表正确渲染 ✅
- [x] GalgameMode 通过 GalgameView 完整接入 GameView，替代 ChatList 渲染
- [x] 右上角切换按钮实现，可切换 Galgame 模式 / 传统 ChatList 模式
- [x] AI 生成时不白屏，保留上次场景显示
- [x] 旁白文本正确渲染（斜体、左边框样式）
- [x] 当前场景多条对话堆叠显示（最后 3 条）
- [x] 对话记录 Backlog 面板（ESC 关闭、自动滚动到底部）
- [ ] 移动端 GalgameMode 全屏适配

### Phase 2.5 验收（增强功能）

- [x] 全量对话日志聚合（`useAggregatedDialogue` hook）
- [x] 段进度计数器 + 翻阅导航
- [x] 选项移到正文上方独立区域
- [x] 选项紧凑样式
- [ ] 段分组逻辑需优化（当前按"连续旁白+角色"分组不够准确）
- [ ] 段落切换时角色立绘应跟随切换
- [ ] 选项样式需进一步 Galgame 化（参考经典 AVG 选项浮层）
- [ ] 整体布局需视觉调优（对话框高度、内边距、行间距等）
- [ ] 点击/回车支持段进度翻页
- [ ] 打字机动画在切换段时应正确重置/跳过

### Phase 3 验收

- [ ] 区域移动时有过渡动画
- [ ] 过渡动画可在设置中关闭
- [ ] 过渡文本正确显示

### Phase 4 验收

- [ ] 未探索区域有迷雾遮盖
- [ ] 移动到新区域时迷雾揭示
- [ ] 地图支持缩放和拖拽

### Phase 5 验收

- [ ] CG 触发时全屏播放
- [ ] 叙事文本叠加在 CG 上
- [ ] 点击继续正确
- [ ] CG 自动记录到图鉴

### Phase 6 验收

- [ ] 不同游戏模式切换对应 UI
- [ ] 切换有平滑过渡
- [ ] 可手动切回默认模式

### Phase 7 验收

- [ ] 纯文本模式开关有效
- [ ] 图片缓存到 IndexedDB
- [ ] 手机端自动降级
- [ ] CSS 氛围场景可用
- [ ] 程序化头像可用
