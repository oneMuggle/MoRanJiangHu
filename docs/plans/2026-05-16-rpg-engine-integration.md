# RPG 引擎融合增强方案

> 创建日期: 2026-05-16
> 状态: 实施中

## 进度

- [ ] Phase 1: 桥接层补全（useRpgStateBridge + rpgActionDispatcher + fromJSON 修复）
- [ ] Phase 2: 传统面板注入 RPG 引擎
- [ ] Phase 3: 模式切换行为
- [ ] Phase 4: Zustand 双向绑定
- [ ] Phase 5: 数据迁移与存档
- [ ] Phase 6: 清理冗余

## 核心设计原则

**不是创建另一套 RPG 体系替换传统系统**，而是在现有的 AI 叙事驱动框架上，注入 RPG 引擎的确定性计算——让回合制战斗、装备数值、功法被动等增强游戏体验，同时保持 AI 叙事自由度不变。

### 融合方式

```
rpgMode = false → 传统面板走原有的 state 读写（AI 自由叙事）
rpgMode = true  → 传统面板走 RPG 引擎计算（确定性数值）
```

同一个面板（BattleModal、EquipmentModal 等），通过 `rpgModeEnabled` 切换计算路径，不替换 UI。

## 现状评估

### RPG 引擎（代码存在但孤立）

| 引擎 | 测试 | 注册到 Orchestrator | 桥接层 | 实际被调用？ |
|------|------|---------------------|--------|-------------|
| RpgBattleEngine | 598 行完整测试 | 是 | 仅战斗同步 | 仅 RpgBattleIntegration 调用（但永不渲染） |
| RpgEquipEngine | phase8 测试 | 是 | Ref 存在，无方法 | 否 |
| RpgKungfuEngine | phase8 测试 | 是 | Ref 存在，无方法 | 否 |
| RpgTaskEngine | phase9 测试 | 是 | Ref 存在，无方法 | 否 |
| RpgSectEngine | phase9 测试 | 是 | Ref 存在，无方法 | 否 |
| RpgItemEngine | phase8 测试 | 是 | Ref 存在，无方法 | 否 |

### 关键问题

1. **桥接层不完整** — `useRpgStateBridge` 只有战斗同步，其余 5 个引擎 ref 是死代码
2. **Dispatcher 暴露面不完整** — 门派/任务/物品引擎大量方法未暴露
3. **引擎反序列化 broken** — 所有引擎的 `fromJSON` 只恢复 `turnNumber`，游戏状态全丢
4. **Zustand RPG slice 是空槽位** — 引擎不读它，UI 写了没人消费
5. **5 个 RPG 集成组件是纯 UI 状态包装** — 不驱动引擎，和传统面板功能重复

## 实施步骤

### Phase 1: 桥接层补全

#### 1.1 补全 useRpgStateBridge

- `syncEquipState()` — 读取 RpgEquipEngine 的装备槽 → 写入 Zustand
- `syncKungfuState()` — 读取 RpgKungfuEngine 的功法列表 → Zustand
- `syncTaskState()` — 读取 RpgTaskEngine 的任务列表 → Zustand
- `syncSectState()` — 读取 RpgSectEngine 的门派数据 → Zustand
- `syncItemState()` — 读取 RpgItemEngine 的背包 → Zustand
- `syncAllEnginesState()` 改为真正同步全部 6 个引擎

#### 1.2 补全 rpgActionDispatcher

- 装备：`equipItem`、`unequipItem`（已有）
- 功法：`learnKungfu`、`cultivateKungfu`（已有）、`breakthroughKungfu`（新增）
- 任务：`acceptTask`、`updateTaskProgress`、`submitTask`、`failTask`（新增全部）
- 门派：`gainContribution`、`investConstruction`、`refreshSectTasks`、`dispatchMember`、`recallMember`（新增）
- 物品：`addItem`、`removeItem`（已有 useItem）

#### 1.3 修复所有引擎的 fromJSON

每个引擎的 `fromJSON` 需要恢复完整状态：
- RpgBattleEngine：actors、HP、cooldowns、buffs
- RpgEquipEngine：装备槽数据
- RpgKungfuEngine：功法列表
- RpgTaskEngine：任务列表
- RpgSectEngine：门派数据、人员派遣
- RpgItemEngine：背包内容

### Phase 2: 传统面板注入 RPG 引擎

核心思路：传统面板保持不变，在操作处插入 RPG 引擎计算层。条件注入：
```
if (rpgModeEnabled) { 走 RPG 引擎计算 } else { 走原有逻辑 }
```

#### 2.1 BattleModal 注入
- "攻击"按钮 → `rpgBattleEngine.executePlayerAction` → 返回伤害结果 → 更新 `state.战斗` HP
- 战斗日志显示结构化日志（第X回合，X攻击Y，造成Z伤害）
- AI 叙事仍可自由生成战斗描写，数值走 RPG 引擎

#### 2.2 EquipmentModal 注入
- 装备/卸下走 RpgEquipEngine
- 显示属性变化预览（装备前 vs 装备后）
- 显示负重状态

#### 2.3 KungfuModal 注入
- 修炼走 `cultivateKungfu`，自动判断升级
- 突破走 `breakthroughKungfu`，校验境界要求
- 显示被动修正汇总

#### 2.4 TaskModal 注入
- 接取走 `acceptTask`（校验境界）
- 完成走 `updateTaskProgress`
- 提交走 `submitTask`，自动解析奖励

#### 2.5 SectModal 注入
- 贡献走 `gainContribution`
- 建设走 `investConstruction`
- 任务布告走 `refreshSectTasks`
- 人员派遣走 `dispatchMember`

### Phase 3: 模式切换行为

`rpgModeEnabled` 控制计算路径，不替换面板。

修改 `hooks/useGame/sendWorkflow.ts`：RPG 模式下，将引擎的 `narrativeConstraint` 注入 system prompt，约束 AI 描写与引擎数值一致。

### Phase 4: Zustand 双向绑定

- 引擎操作后 → 自动 sync 到 Zustand（write）
- UI 初始化时 → 从 Zustand 恢复到引擎（read-back）
- 存档/读档通过 Zustand 保存/恢复引擎状态

### Phase 5: 数据迁移与存档

- `saveCoordinator.ts`：序列化 6 个 RPG 引擎完整状态
- 旧存档兼容：无 RPG 数据时自动跳过

### Phase 6: 清理冗余

- 删除 5 个独立 RPG 弹窗注册（`rpgBattle`、`rpgEquipment` 等）
- 删除 RightPanel 中的 RPG 菜单项
- 保留 `rpgModeEnabled` 切换按钮

## 涉及文件

### 需要修改的文件

| 文件 | 操作 |
|------|------|
| `hooks/useRpgStateBridge.ts` | 补全 6 个引擎同步方法 |
| `hooks/useGame/rpg/rpgActionDispatcher.ts` | 补全暴露面 |
| `hooks/useGame/engine/rpgBattleEngine.ts` | 修复 fromJSON |
| `hooks/useGame/engine/rpgEquipEngine.ts` | 修复 fromJSON |
| `hooks/useGame/engine/rpgKungfuEngine.ts` | 修复 fromJSON |
| `hooks/useGame/engine/rpgTaskEngine.ts` | 修复 fromJSON |
| `hooks/useGame/engine/rpgSectEngine.ts` | 修复 fromJSON |
| `hooks/useGame/engine/rpgItemEngine.ts` | 修复 fromJSON |
| `components/features/Battle/BattleModal.tsx` | 注入 RPG 引擎 |
| `components/features/Equipment/EquipmentModal.tsx` | 注入 RPG 引擎 |
| `components/features/Kungfu/KungfuModal.tsx` | 注入 RPG 引擎 |
| `components/features/Task/TaskModal.tsx` | 注入 RPG 引擎 |
| `components/features/Sect/SectModal.tsx` | 注入 RPG 引擎 |
| `hooks/useGame/sendWorkflow.ts` | rpgMode 影响 send 路径 |
| `hooks/useGame/subsystems/zustandStore.ts` | RPG slice 扩展 |
| `hooks/useGame/saveCoordinator.ts` | 引擎序列化 |
| `hooks/useGame/saveLoad/saveLoadWorkflow.ts` | 读档恢复 |
| `utils/moduleRegistry/legacyRegistrations.ts` | 删除新增 RPG 注册项 |
| `components/layout/RightPanel.tsx` | 删除 RPG 菜单项 |

## 风险评估

| 风险 | 影响 | 缓解 |
|------|------|------|
| RPG 引擎计算与 AI 叙事冲突 | 中 | narrativeConstraint 注入 system prompt |
| 3 槽装备 vs 10 槽战斗计算不匹配 | 中 | 桥接层做映射 |
| 大文件修改风险 | 中 | 条件注入，不破坏现有路径 |
| 引擎反序列化修复涉及多文件 | 低 | 逐个修复，独立测试 |

## 预估工作量

| 阶段 | 工作量 | 复杂度 |
|------|--------|--------|
| Phase 1 | 3 天 | 中 |
| Phase 2 | 4 天 | 高 |
| Phase 3 | 1 天 | 低 |
| Phase 4 | 2 天 | 中 |
| Phase 5 | 1 天 | 中 |
| Phase 6 | 0.5 天 | 低 |
| **总计** | **~11.5 天** | — |
