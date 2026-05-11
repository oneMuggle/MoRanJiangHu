# BDSM 与桌游社交 NSFW 系统独立提取与增强方案

> 创建日期: 2026-05-11
> 状态: 实施中

## 需求

将当前嵌套在 **校园 NSFW 深化系统** 下的 BDSM 系统和桌游社交 NSFW 系统提取为独立的、全时代可用的 NSFW 子系统，并在独立后进行功能增强。

## 现状问题

| 问题 | 说明 |
|------|------|
| 耦合度高 | BDSM 和桌游的类型定义、引擎、提示词全部在 `campusNSFW/` 目录下 |
| 校园依赖 | 触发逻辑隐式依赖校园上下文（club/学期/校园祭） |
| 设置分散 | BDSM 相关开关散布在 `校园NSFW设置` 的 30+ 个 key 中 |
| 无法独立启用 | 非校园时代无法单独启用 BDSM 或桌游社交 |

## 目标架构

```
游戏NSFW
├── 校园NSFW深化系统（精简版，保留欲望/校园祭/露出等）
├── 都市网约车NSFW
├── 写真NSFW
├── BDSM独立系统 ★ 新增    ← 全时代可用
└── 桌游社交NSFW ★ 新增     ← 全时代可用
```

## 实施步骤

### 阶段一：模型层提取（models/）

- [x] 创建 `models/bdsmNSFW/` 目录结构
  - [x] `core.ts` — 从 `models/campusNSFW/sm.ts` 迁移（权力平衡、服从度、契约）
  - [x] `forum.ts` — 从 `models/campusNSFW/bdsm-forum.ts` 迁移
  - [x] `constants.ts` — 从 `models/campusNSFW/bdsmConstants.ts` 迁移
  - [x] `scenarios.ts` — 新增：非校园场景（都市/古代/近未来等时代适配）
  - [x] `normalization.ts` — 新增：设置规范化函数
  - [x] `index.ts` — 统一导出
- [x] 创建 `models/boardGameNSFW/` 目录结构
  - [x] `core.ts` — 从 `models/campusNSFW/party-games.ts` 迁移（5种游戏状态）
  - [x] `scenarios.ts` — 新增：非校园场景（酒吧/会所/线上/社团聚会等）
  - [x] `normalization.ts` — 新增：设置规范化函数
  - [x] `index.ts` — 统一导出
- [x] 更新 `models/system.ts`
  - [x] 新增 `启用BDSM独立系统` 和 `启用桌游社交NSFW系统` 到 `游戏设置结构`
  - [x] 新增 `BDSM系统设置` 和 `桌游社交NSFW设置` 类型

### 阶段六（部分）：向后兼容层

- [x] `models/campusNSFW/sm.ts` 改为 re-export `models/bdsmNSFW/`
- [x] `models/campusNSFW/party-games.ts` 改为 re-export `models/boardGameNSFW/`
- [x] `models/campusNSFW/bdsmConstants.ts` 改为 re-export
- [x] 新增 `utils/bdsmMigration.ts` 存档迁移函数
- [x] 新增 `utils/boardGameMigration.ts` 存档迁移函数

### 阶段二：引擎层提取（hooks/useGame/）

- [x] 创建 `hooks/useGame/bdsmNSFWEngine/` 目录
  - [x] `core.ts` — 迁移 `campusNSFW/bdsmSystem.ts`
  - [x] `eraAdapter.ts` — 新增：时代适配层
  - [x] `index.ts` — 统一导出
- [x] 创建 `hooks/useGame/boardGameNSFWEngine/` 目录
  - [x] `core.ts` — 迁移 `campusNSFW/boardGameSystem.ts`
  - [x] `eraAdapter.ts` — 新增：时代适配
  - [x] `eventSystem.ts` — 新增：桌游事件系统
  - [x] `index.ts` — 统一导出

### 阶段三：提示词层提取（prompts/runtime/）

- [x] 创建 `prompts/runtime/bdsmNSFW.ts` — 核心叙事约束（SM/任务系统/关系管线）
- [x] 创建 `prompts/runtime/boardGameNSFW.ts` — 桌游叙事约束 + 紧张度叙事

### 阶段四：组件层迁移（components/）

- [x] 新增 BDSM 设置组件 `components/features/Settings/BDSMNSFWSettings.tsx`（占位）
- [x] 新增桌游设置组件 `components/features/Settings/BoardGameNSFWSettings.tsx`（占位）
- [x] 更新 `components/features/NSFWCenter/moduleRegistry.ts` 注册新模块
- [x] 现有 BDSM 组件引用通过 re-export 兼容层保持工作

### 阶段五：模块注册（modules/）

- [x] 新建 `modules/contemporary/bdsmNSFW/registration.ts`
- [x] 新建 `modules/contemporary/boardGameNSFW/registration.ts`
- [x] 更新 `modules/contemporary/index.ts` 导入新注册

### 阶段六：向后兼容层

- [x] `models/campusNSFW/sm.ts` 改为 re-export `models/bdsmNSFW/`
- [x] `models/campusNSFW/party-games.ts` 改为 re-export `models/boardGameNSFW/`
- [x] `models/campusNSFW/bdsmConstants.ts` 改为 re-export
- [x] `hooks/useGame/campusNSFW/bdsmSystem.ts` 改为 re-export `hooks/useGame/bdsmNSFWEngine/`
- [x] `hooks/useGame/campusNSFW/boardGameSystem.ts` 改为 re-export `hooks/useGame/boardGameNSFWEngine/`
- [x] 新增 `utils/bdsmMigration.ts` 存档迁移函数
- [x] 新增 `utils/boardGameMigration.ts` 存档迁移函数
- [ ] 旧存档映射：`校园NSFW设置.启用SM系统` → `启用BDSM独立系统`

### 阶段七：增强功能

**P0 — 核心增强**
- [ ] BDSM 多角色关系网（当前仅支持一对一）
- [ ] BDSM 时代场景包（古代主仆/现代都市/近未来AI支配）
- [x] 桌游新增游戏类型（大富翁NSFW版、棋牌类、骰子游戏）
- [ ] 桌游多人局管理（3-8人NSFW事件编排）

**P1 — 扩展增强**
- [ ] BDSM 信誉系统（社区信誉等级影响匹配质量）
- [ ] BDSM 安全词历史与 Aftercare 报告
- [ ] BDSM 契约模板库
- [ ] 桌游邀请系统（NPC主动邀请）
- [ ] 桌游成就系统
- [ ] 桌游线上模式（远程虚拟桌游）

## 风险与缓解

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| 旧存档数据丢失 | 中 | 完善的迁移脚本 + re-export 兼容层 |
| 校园 NSFW 精简后功能断裂 | 低 | 保留欲望/校园祭/露出等核心模块 |
| 提示词注入冲突 | 中 | 在 `prompts/runtime/nsfw.ts` 中协调子系统优先级 |
| 组件引用断裂 | 低 | 逐步迁移，每次迁移后跑 build 验证 |
| 增强功能范围蔓延 | 中 | 分 P0/P1 优先级 |

## 复杂度评估

| 阶段 | 复杂度 | 预估工时 |
|------|--------|----------|
| 阶段一：模型提取 | 中 | 3-4h |
| 阶段二：引擎提取 | 高 | 6-8h |
| 阶段三：提示词提取 | 中 | 3-4h |
| 阶段四：组件迁移 | 中 | 4-5h |
| 阶段五：模块注册 | 低 | 1-2h |
| 阶段六：向后兼容 | 中 | 3-4h |
| 阶段七：增强功能 | 高 | 8-12h |
| **总计** | **高** | **28-39h** |
