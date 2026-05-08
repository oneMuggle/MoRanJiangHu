# NSFW 仪表盘修复计划

**日期:** 2026-05-08
**状态:** 已完成

---

## 背景与目标

项目中已有三个 NSFW 系统（校园、写真约拍、都市网约车），但它们的仪表盘（Dashboard）完整性和功能性差异很大。需要逐一修复，确保三个系统都能正常展示、保存、加载。

## 现状分析

| 系统 | 桌面端 | 移动端 | 路由 | 保存 | 加载 | 初始化 |
|------|:------:|:------:|:----:|:----:|:----:|:------:|
| 校园 NSFW | OK | OK | OK | OK | OK | OK |
| 写真约拍 NSFW | OK | OK | OK | **缺失** | **缺失** | **缺失** |
| 都市网约车 NSFW | **缺失** | **缺失** | **断裂** | 部分 | **缺失** | OK |

### 校园 NSFW — 基本功能正常，存在小 Bug

- 仪表盘组件完整，状态连接正常，保存/加载正常
- **问题 1:** 后果记录（`后果记录` 类型）没有 `关联NPC` 字段，导致每个 NPC 卡片显示的都是全局总后果数，而非该 NPC 的后果数
- 涉及文件：
  - `models/campusNSFW/types.ts` — 后果记录类型定义
  - `components/features/CampusDesireDashboard.tsx` — 桌面端
  - `components/features/MobileCampusDesireApp.tsx` — 移动端

### 写真约拍 NSFW — 组件完整但数据持久化完全断裂

- 仪表盘 UI 组件已实现，NSFW Center 路由正常
- **致命问题:** `写真系统` 从未被保存或加载，每次存档重开数据全部丢失
- **致命问题:** `写真系统` 未在游戏开局初始化，仪表盘永远显示空数据直到 AI 响应创建它
- 涉及文件：
  - `hooks/useGame/saveCoordinator.ts` — 存档/加载逻辑（缺失）
  - `hooks/useGame/opening/openingStoryWorkflow.ts` — 开局初始化（缺失）

### 都市网约车 NSFW — 仪表盘完全不存在

- 后端引擎（`urbanDriverNSFWEngine.ts`）和集成层（`urbanDriverNSFWIntegration.ts`）已实现
- NSFW Module Registry 注册了模块，按钮会渲染
- **致命问题:** 点击 NSFW Center 的「网约车仪表盘」按钮无任何反应（App.tsx 的 `onOpenDashboard` 没有处理 `urbanDriverNSFW`）
- **缺失:** 无桌面端/移动端仪表盘组件、无懒加载注册、无 App.tsx 状态管理
- **部分问题:** 保存逻辑存在但未被 TypeScript 类型识别，加载逻辑完全缺失
- 涉及文件：
  - `components/features/NSFWCenter/moduleRegistry.tsx` — 已注册但按钮无效
  - `App.tsx` — 路由断裂（~1384-1388 行）
  - `hooks/useGame/saveCoordinator.ts` — 加载缺失
  - 需新建：`UrbanDriverDashboard.tsx`、`MobileUrbanDriverApp.tsx`
  - 需修改：`components/features/lazyComponents.tsx`

---

## 修复方案

### 优先级 P0 — 写真系统数据持久化修复

**原因:** 数据每次存档丢失，功能完全不可用

#### 步骤 1: 添加写真系统到存档类型

- **文件:** `hooks/useGame/saveCoordinator.ts`
- 在 `存档协调当前状态` 类型定义中（~82 行附近）添加 `写真系统?: any`

#### 步骤 2: 添加写真系统保存逻辑

- **文件:** `hooks/useGame/saveCoordinator.ts`
- 在存档快照构建处（~299 行附近），添加：
  ```
  写真系统: (currentState as any).写真系统 ? deps.深拷贝((currentState as any).写真系统) : undefined,
  ```

#### 步骤 3: 添加写真系统加载逻辑

- **文件:** `hooks/useGame/saveCoordinator.ts`
- 在存档恢复逻辑处（~432-433 行附近，校园系统恢复的旁边），添加：
  ```
  if (saveSnapshot.写真系统) {
    state.写真系统 = saveSnapshot.写真系统;
  }
  ```

#### 步骤 4: 添加写真系统开局初始化

- **文件:** `hooks/useGame/opening/openingStoryWorkflow.ts`
- 在 `都市网约车系统` 初始化的附近（~801 行），添加写真系统的空结构初始化

### 优先级 P0 — 都市网约车 NSFW 仪表盘实现

**原因:** 按钮存在但点击无反应，用户体验断裂

#### 步骤 5: 创建桌面端仪表盘组件

- **新建文件:** `components/features/UrbanDriverDashboard.tsx`
- 展示内容：
  - 乘客欲望状态列表（每位乘客的沉沦度、依赖度、 intoxication/drug 状态）
  - 当前行程信息（NSFW 类型、风险等级）
  - 后果事件列表（平台投诉、网络传播、警察盘查、勒索威胁）
  - 常客乘客记录

#### 步骤 6: 创建移动端仪表盘组件

- **新建文件:** `components/features/MobileUrbanDriverApp.tsx`
- 适配移动端的相同信息展示

#### 步骤 7: 注册懒加载组件

- **文件:** `components/features/lazyComponents.tsx`
- 添加 `创建可预加载懒组件(UrbanDriverDashboard)` 和 `创建可预加载懒组件(MobileUrbanDriverApp)`

#### 步骤 8: 添加 App.tsx 状态和路由

- **文件:** `App.tsx`
- 添加 `showUrbanDriver` / `setShowUrbanDriver` 状态
- 在 NSFW Center 的 `onOpenDashboard` 处理中添加 `urbanDriverNSFW` 分支
- 在渲染区域添加对应的懒加载组件渲染

#### 步骤 9: 修复都市网约车系统加载逻辑

- **文件:** `hooks/useGame/saveCoordinator.ts`
- 在 `存档协调当前状态` 类型中添加 `都市网约车系统?: any`
- 添加加载恢复逻辑（保存逻辑已存在但不被类型识别）

### 优先级 P1 — 校园 NSFW 后果归属修复

**原因:** 功能可用但数据展示不准确

#### 步骤 10: 为后果记录添加 NPC 关联字段

- **文件:** `models/campusNSFW/types.ts`
- 在 `后果记录` 接口中添加 `关联NPC?: string` 或 `关联NPC_ID?: string`

#### 步骤 11: 修复桌面端后果过滤

- **文件:** `components/features/CampusDesireDashboard.tsx`
- 在每个 NPC 卡片渲染处，过滤后果列表：`后果列表.filter(c => c.关联NPC === id && !c.是否已解决)`

#### 步骤 12: 修复移动端后果计数

- **文件:** `components/features/MobileCampusDesireApp.tsx`
- 计算每个 NPC 的独立后果数，而非传递全局总数

---

## 涉及文件汇总

| 文件 | 操作 | 优先级 |
|------|------|--------|
| `hooks/useGame/saveCoordinator.ts` | 修改：添加写真/都市网约车型 + 加载逻辑 | P0 |
| `hooks/useGame/opening/openingStoryWorkflow.ts` | 修改：初始化写真系统 | P0 |
| `components/features/UrbanDriverDashboard.tsx` | **新建** | P0 |
| `components/features/MobileUrbanDriverApp.tsx` | **新建** | P0 |
| `components/features/lazyComponents.tsx` | 修改：注册网约车懒组件 | P0 |
| `App.tsx` | 修改：状态 + 路由 + 渲染 | P0 |
| `models/campusNSFW/types.ts` | 修改：后果记录添加关联字段 | P1 |
| `components/features/CampusDesireDashboard.tsx` | 修改：按 NPC 过滤后果 | P1 |
| `components/features/MobileCampusDesireApp.tsx` | 修改：按 NPC 计数后果 | P1 |

## 风险评估

- **低风险:** 写真系统保存/加载修复 — 纯增量变更，不影响现有逻辑
- **中风险:** 都市网约车仪表盘新建 — 需要理解引擎状态结构，但引擎已有完整类型定义
- **低风险:** 校园后果归属修复 — 需要在 AI 生成后果时填充 `关联NPC` 字段，可能需要同步修改 AI 响应解析逻辑

## 实施顺序

1. 写真系统持久化修复（步骤 1-4）— 最小改动，立即见效
2. 都市网约车仪表盘实现（步骤 5-9）— 核心功能补齐
3. 校园 NSFW 后果归属修复（步骤 10-12）— 体验优化

---

## 实施记录（2026-05-08）

所有 12 个步骤已完成：

- [x] 步骤 1-4: 写真系统持久化修复（saveCoordinator.ts + useGameState.ts + useGame.ts + openingStoryWorkflow.ts）
- [x] 步骤 5-9: 都市网约车仪表盘实现（新建 UrbanDriverDashboard.tsx + MobileUrbanDriverApp.tsx + lazyComponents.tsx + App.tsx 路由 + saveCoordinator 加载）
- [x] 步骤 10-12: 校园 NSFW 后果归属修复（core.ts 添加关联NPC字段 + convenienceFunctions.ts 填充字段 + CampusDesireDashboard.tsx / MobileCampusDesireApp.tsx 按 NPC 过滤）
