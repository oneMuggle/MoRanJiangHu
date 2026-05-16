# Galgame & RPG 模块完整实现方案

> 创建日期: 2026-05-16
> 状态: 实施中

## 进度

- [x] Phase A1: 创建 Engine-to-React-State Bridge（`useAvgStateBridge.ts`, `useRpgStateBridge.ts`）
- [x] Phase A2: 创建 UI Action-to-Engine Dispatcher（`avgActionDispatcher.ts`, `rpgActionDispatcher.ts`）
- [x] Zustand Store 扩展（AVG slice + RPG slice）
- [x] Phase A3: Galgame Engine-UI Connection（GalgameView 接入引擎 + 路线指示器 + 建议选项）
- [x] Phase B1: Galgame 事件系统（galgameEventBus.ts）
- [x] Phase B2: Save/Load 序列化（galgameSerializer.ts + 存档结构扩展）
- [x] Phase B3: AI 驱动的 CG 生成管线（galgameCgGenerator.ts）
- [x] Phase B4: 路线/结局 UI 提示（RouteIndicator.tsx + EndingNotification.tsx）
- [x] Phase B5: 对话树与分支叙事（useDialogueTree.ts + GalgameView 集成）
- [x] Phase C1: RPG 战斗 UI 集成（RpgBattleIntegration.tsx + BattleModal 条件渲染）
- [x] Phase C2: RPG 装备 UI 集成（RpgEquipmentIntegration.tsx — 3 槽位面板）
- [x] Phase C3: RPG 武功 UI 集成（RpgKungfuIntegration.tsx — 功法激活/停用面板）
- [x] Phase C4: RPG 任务 UI 集成（RpgTaskIntegration.tsx — 任务追踪面板）
- [x] Phase C5: RPG 门派 UI 集成（RpgSectIntegration.tsx — 门派信息/贡献面板）
- [x] Phase C6: RPG 模式切换开关（GameView 红色主题按钮）
- [x] Phase C7: RPG 组件 UI 注册管线（lazyComponents 导出 + UIFeatureRegistry 注册 + RightPanel RPG 菜单 + GameView/App 传递）
- [x] Phase D1: 统一模式管理（modeManager.ts）
- [x] Phase D2: 性能优化（CharacterSprite + SceneBackground memo + 已验证所有 memo/useMemo/useShallow）
- [x] Phase D3: 测试完善 — 创建 `phaseD3.rpg-integration.test.ts`，40 个测试覆盖分发器/引擎生命周期/Zustand RpgSlice/注入模式
- [x] Phase D4: 数据迁移（saveCoordinator.ts + saveLoadWorkflow.ts 集成 galgame 序列化/反序列化）

## Phase 2: RPG 引擎注入传统面板（融合增强）

- [x] Phase 2.0: Zustand 扩展 — RpgSlice 添加 `rpgMode: boolean` + `toggleRpgMode()` 方法
- [x] Phase 2.0b: `useAppModalState.ts` — rpgModeEnabled/toggleRpgMode 从 Zustand 读取
- [x] Phase 2.1: EquipmentModal RPG 引擎注入 — 12 槽位映射到 3 RPG 槽位，点击装备/卸下走引擎
- [x] Phase 2.2: KungfuModal RPG 引擎注入 — 修炼/突破按钮调用 dispatcher
- [x] Phase 2.3: TaskModal RPG 引擎注入 — 提交/放弃按钮调用 dispatcher
- [x] Phase 2.4: SectModal RPG 引擎注入 — 获取贡献/投资建设按钮调用 dispatcher
- [x] Phase 2.5: 所有 modal 默认从 Zustand 读取 rpgMode，可选 props 传入覆盖
- [x] Phase 2.6: MobileEquipmentModal RPG 引擎注入 — 槽位映射+装备/卸下走引擎
- [x] Phase 2.7: MobileKungfuModal RPG 引擎注入 — 修炼/突破按钮调用 dispatcher
- [x] Phase 2.8: MobileTask RPG 引擎注入 — 提交/放弃按钮调用 dispatcher + propsFactory 更新
- [x] Phase 2.9: MobileSect RPG 引擎注入 — 获取贡献/投资建设按钮调用 dispatcher + propsFactory 更新

## 一、现状评估

### Galgame 模块

**已完成（代码存在且可构建）：**
- 数据模型：`GalgameRoute`, `GalgameEnding`, `GalgameCG`, `GalgameState` 已定义 (`models/avg/galgame.ts`)
- 引擎逻辑：`routeResolver.ts`, `endingResolver.ts`, `AvgRelationEngine` 已实现
- UI 组件：8 个组件完整（GalgameMode, GalgameDialogueBox, SceneBackground, CharacterSprite, DialogueBacklog, CGGallery, CGGalleryModal, MobileCGGalleryModal）
- 视图集成：`GalgameView` 可作为 ChatList 的替代视图
- 模式切换：GameView 中有 Galgame 模式开关
- 单元测试：phase12.test.ts 75 个测试通过

**缺失/不完整：**
1. **引擎与 UI 未连接** — GalgameView 只渲染对话历史，不触发路线判定、结局解析、CG 解锁
2. **无 CG/角色立绘/场景背景素材** — 仅占位，需要 195+ 资产
3. **无 AI 驱动的 CG 生成管线**
4. **GalgameState 无专门的存档/读档序列化**
5. **无 galgame 事件系统** — 路线进入、结局触发、CG 解锁未接入游戏循环
6. **对话树/分支系统不完整** — `nodeResolver.ts`, `conditionEvaluator.ts` 存在但未与 UI 连接

### RPG 模块

**已完成（代码存在且可构建）：**
- 6 大引擎：Battle, Equipment, Item, Kungfu, Task, Sect 全部实现
- 子模块计算器：damage/initiative/skill/buff/encumbrance/inventory/kungfu/task/sect 等
- 单元测试：phase8/phase9 共 164 个测试通过
- 已接入 `EngineRegistry`, `GlobalTurnManager`, `EventBus`

**缺失/不完整：**
1. **完全无 UI 集成** — 现有战斗/装备/武功/任务/门派面板仍是纯展示，不调用 RPG 引擎
2. **引擎状态与 React 状态无桥接层** — 引擎使用内部状态格式，UI 读取 `state.角色`, `state.战斗` 等
3. **无 RPG 模式 UI** — 计划提到功能性面板风格，当前仍是三栏布局
4. **引擎与用户操作未绑定** — 用户点击战斗面板按钮后，不触发 `rpgBattleEngine`

### 模块注册系统

- UI 模块注册 (`utils/moduleRegistry/`)：35+ 弹窗已注册，可见性控制正常
- 引擎注册 (`hooks/useGame/engine/`)：`EngineRegistry` + `GameOrchestrator` 已集成

---

## 二、完整实现方案

### Phase A: 桥接层（最高优先级）

#### A1. Engine-to-React-State Bridge
- 创建 `hooks/useGame/avg/avgStateBridge.ts` — 将 AvgRelationEngine 状态同步到 React state
- 创建 `hooks/useGame/rpg/rpgStateBridge.ts` — 将 RPG 引擎状态同步到 React state
- 在 `useGame.ts` 中初始化桥接，确保引擎输出能被 UI 消费
- **预期产出**: 2 个新文件 + `useGame.ts` 修改

#### A2. UI Action-to-Engine Dispatcher
- 创建 `hooks/useGame/avg/avgActionDispatcher.ts` — 将 UI 操作（选择对话选项、进入路线）转为引擎调用
- 创建 `hooks/useGame/rpg/rpgActionDispatcher.ts` — 将 UI 操作（战斗指令、装备更换）转为引擎调用
- **预期产出**: 2 个新文件

#### A3. Galgame Engine-UI Connection
- 修改 `components/app/GalgameView.tsx`：接入 `AvgRelationEngine`，在选择对话选项时触发路线判定
- 修改 `components/features/Galgame/GalgameDialogueBox.tsx`：支持分支选项（从引擎获取可选路线）
- 修改 `hooks/useGame/sendWorkflow.ts`：在 AI 返回的对话中注入 galgame 事件标签（路线进入/CG解锁/结局达成）
- **预期产出**: 3 个文件修改

### Phase B: Galgame 完善

#### B1. Galgame Event System
- 创建 `hooks/useGame/avg/galgame/galgameEventBus.ts` — 定义 galgame 事件类型和分发机制
- 事件类型：`ROUTE_ENTER`, `ROUTE_EXIT`, `ENDING_TRIGGER`, `CG_UNLOCK`, `FLAG_CHANGE`, `INTIMACY_CHANGE`
- 与现有 EventBus 集成
- **预期产出**: 1 个新文件

#### B2. Save/Load Serialization
- 创建 `hooks/useGame/avg/galgame/galgameSerializer.ts` — GalgameState 序列化/反序列化
- 集成到 `saveCoordinator.ts`
- **预期产出**: 1 个新文件 + 1 个文件修改

#### B3. AI-Driven CG Generation Pipeline
- 创建 `services/ai/image/galgameCgGenerator.ts` — 基于 AI 的 CG 生成服务
- 与现有的 image generation 系统集成
- CG 生成后自动解锁并加入 CG 画廊
- **预期产出**: 1 个新文件

#### B4. 路线/结局 UI 提示 — [x] 已完成
- 创建 `components/features/Galgame/RouteIndicator.tsx` — 路线状态独立组件（路线名+好感度圆点可视化+CG收集进度）
- 创建 `components/features/Galgame/EndingNotification.tsx` — 结局达成全屏提示（5种结局类型各自配色）
- GalgameView 已用 RouteIndicator 替换内联路线指示器
- AvgRelationEngine 新增 `_lastResolvedEnding` 字段 + `getLastResolvedEnding()` getter
- AvgStateBridgeSnapshot 新增 `currentEnding` 字段

#### B5. 对话树与分支叙事 — [x] 已完成
- 创建 `hooks/useGame/avg/dialogue/useDialogueTree.ts` — 对话树运行时 hook
- 将 `NodeResolver` 与 `AvgRelationEngine` 桥接，从引擎获取 intimacy/flags/CGs
- GalgameView 集成对话树分支选项（紫色主题 UI + consequenceHint 显示）
- GameView 传递 `engineRef` 到 GalgameView
- 支持分支选择、动作执行（好感度变化、flag设置、物品增减）
- `nodeResolver.ts` 和 `conditionEvaluator.ts` 本身已完整

### Phase C: RPG UI 集成

#### C1. RPG Battle UI — [x] 已完成
- 创建 `components/features/Battle/RpgBattleIntegration.tsx` — RPG 战斗引擎集成组件
- 修改 `components/features/Battle/BattleModal.tsx` — 条件渲染 RPG/传统两种模式
- 实现回合制战斗 UI：回合计数、当前行动者、HP 显示、战斗日志
- 用户操作 → engine → state bridge → Zustand → UI 更新

#### C2. RPG Equipment UI — [x] 已完成
- 创建 `components/features/Equipment/RpgEquipmentIntegration.tsx` — RPG 模式 3 槽位装备面板（武器/防具/饰品）
- 读取 Zustand `rpgEquipWeapon/rpgEquipArmor/rpgEquipAccessory` 状态
- 背包选择器按类型过滤（武器/防具/饰品），支持装备/卸下操作

#### C3. RPG Kungfu UI — [x] 已完成
- 创建 `components/features/Kungfu/RpgKungfuIntegration.tsx` — RPG 模式功法面板
- 读取 Zustand `rpgActiveKungfuIds` 状态，支持激活/停用功法
- 功法分类过滤、选中查看详情（熟练度/重数/被动修正）

#### C4. RPG Task UI — [x] 已完成
- 创建 `components/features/Task/RpgTaskIntegration.tsx` — RPG 模式任务面板
- 读取 Zustand `rpgActiveTaskIds` 状态，支持任务追踪开关
- 任务类型过滤、选中查看详情（目标进度/奖励）

#### C5. RPG Sect UI — [x] 已完成
- 创建 `components/features/Sect/RpgSectIntegration.tsx` — RPG 模式门派面板
- 读取 Zustand `rpgSectId/rpgSectContribution` 状态
- 显示门派信息（职位/贡献/资源）、晋升之路、任务布告、藏经阁
- 支持加入/退出门派操作

#### C6. RPG Mode Toggle — [x] 已完成
- 在 `components/app/GameView.tsx` 中添加 RPG 模式切换按钮（红色主题图标）
- 在 `components/app/useAppModalState.ts` 中添加 `rpgModeEnabled` / `toggleRpgMode` 状态
- 在 `App.tsx` 中传递 `rpgModeEnabled` / `toggleRpgMode` 到 GameView
- 与 Galgame toggle 并列显示在 TopBar 右侧
- **预期产出**: 3 个文件修改

### Phase D: 系统优化

#### D1. 统一模式管理 — [x] 已完成
- 创建 `hooks/useGame/modeManager.ts`
- 支持模式：`traditional`, `galgame`, `rpg`, `exploration`
- 模式切换时保存 UI 状态快照
- 提供 `serializeMode()` / `deserializeMode()` 用于存档集成
- 提供 `onModeChange()` 监听器 API

#### D2. 性能优化 — [x] 已完成
- CharacterSprite 组件使用 React.memo 防止不必要的重渲染
- SceneBackground 组件使用 React.memo 防止不必要的重渲染
- useAggregatedDialogue 已使用 useMemo 缓存对话聚合计算
- Zustand 使用 useShallow 选择性订阅，避免全量状态更新触发
- SceneBackground 和 CharacterSprite 已内置图片懒加载（loading="lazy"）+ 淡入过渡

#### D3. 测试完善
- Galgame 集成测试：路线进入/退出、结局触发、CG 解锁
- RPG UI 集成测试：引擎与 UI 的完整流程
- E2E 测试：Galgame 完整游玩流程
- **预期产出**: 多个测试文件

#### D4. 数据迁移 — [x] 已完成
- 在 `saveCoordinator.ts` 中集成 galgame 序列化：存档时自动序列化 AvgRelationEngine 状态
- 在 `执行读取存档` 中添加 galgame 反序列化逻辑，旧存档无 `galgameSaveData` 时自动跳过
- 在 `saveLoadWorkflow.ts` 中添加 `avgGalgameEngine` 依赖传递和读档后引擎恢复
- 存档格式兼容：旧存档加载不受影响，新存档自动包含 galgame 状态
- **预期产出**: 2 个文件修改（saveCoordinator.ts + saveLoadWorkflow.ts）

---

## 三、实现优先级

| 优先级 | 阶段 | 理由 |
|--------|------|------|
| P0 | Phase A (桥接层) | 所有后续工作的基础 |
| P1 | Phase B (Galgame 完善) | 已有 UI，补齐后立即可用 |
| P2 | Phase C (RPG UI 集成) | 引擎完整，需 UI 对接 |
| P3 | Phase D (系统优化) | 体验提升，可迭代进行 |

## 四、风险评估

| 风险 | 影响 | 缓解 |
|------|------|------|
| 引擎状态与 React 状态格式不匹配 | 高 | 桥接层做格式转换，不修改引擎 |
| 现有 AI 叙事流与确定型引擎冲突 | 高 | 使用事件标签注入，保持 AI 自由度 |
| 存档兼容性问题 | 中 | 数据迁移脚本 + 版本标记 |
| Galgame 素材缺失 | 中 | AI 生成管线先行，占位素材过渡 |
| 大文件修改风险（useGame.ts 等） | 中 | 按模块拆分 PR，每次聚焦单一变更 |

## 五、预估工作量

| 阶段 | 工作量 | 复杂度 |
|------|--------|--------|
| Phase A | 2-3 天 | 中 |
| Phase B | 3-4 天 | 中高 |
| Phase C | 4-5 天 | 高 |
| Phase D | 2-3 天 | 中 |
| **总计** | **11-15 天** | — |

## 六、涉及的核心文件

### 需要创建的文件 (~13 个)
```
hooks/useGame/avg/avgStateBridge.ts
hooks/useGame/avg/avgActionDispatcher.ts
hooks/useGame/avg/galgame/galgameEventBus.ts
hooks/useGame/avg/galgame/galgameSerializer.ts
hooks/useGame/rpg/rpgStateBridge.ts
hooks/useGame/rpg/rpgActionDispatcher.ts
hooks/useGame/modeManager.ts
services/ai/image/galgameCgGenerator.ts
components/features/Galgame/RouteIndicator.tsx
components/features/Galgame/EndingNotification.tsx
utils/migration/galgameRpgMigration.ts
hooks/useGame/avg/avgIntegration.test.ts
hooks/useGame/rpg/rpgIntegration.test.ts
```

### 需要修改的文件 (~12 个)
```
hooks/useGame.ts                          — 初始化和接入桥接
hooks/useGame/sendWorkflow.ts              — AI 叙事流注入 galgame 事件
hooks/useGame/saveCoordinator.ts           — GalgameState 存档集成
components/app/GalgameView.tsx             — 接入引擎
components/app/GameView.tsx                — 添加 RPG 模式开关
components/features/Galgame/GalgameDialogueBox.tsx — 分支选项支持
components/features/BattleModal.tsx        — 接入 RPG 战斗引擎
components/features/EquipmentModal.tsx     — 接入 RPG 装备引擎
components/features/KungfuModal.tsx        — 接入 RPG 武功引擎
components/features/TaskModal.tsx          — 接入 RPG 任务引擎
components/features/SectModal.tsx          — 接入 RPG 门派引擎
App.tsx                                   — 模式切换入口
```
