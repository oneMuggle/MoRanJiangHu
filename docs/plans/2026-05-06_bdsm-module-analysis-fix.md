# BDSM 模块全流程分析与修复计划

**日期:** 2026-05-06
**模块:** 校园 NSFW v1.6 — BDSM 关系管线

---

## 目标

分析 BDSM 模块的全流程，确保功能正常切实可用。使用测试 API `https://gcli.ggchan.dev/`（令牌 `gg-gcli-RALFsIs47kRn7m3HKh98dTj0R48ccM2ln8sIVDc3OSA`）验证 AI 调用路径。

---

## 模块架构概览

### 数据流

```
用户操作 (UI Modal) → useGame.ts 状态变更 → AI 调用 → 响应解析 → 状态更新 → UI 刷新
```

### 核心子系统

| 子系统 | 入口文件 | 状态 |
|--------|----------|------|
| 调教任务工作流 | `hooks/useGame/bdsmTaskWorkflow.ts` | **未连接** — 5个核心函数无调用者 |
| 调教任务触发器 | `hooks/useGame/bdsmTaskTrigger.ts` | 仅构建提示词，未调用 AI |
| 论坛内容引擎 | `hooks/useGame/bdsmForumEngine.ts` | 已连接 |
| 设备AI工作流 | `hooks/useGame/deviceAiWorkflow.ts` | 已连接 (bdsn app) |
| 私聊工作流 | `hooks/useGame/privateChatWorkflow.ts` | 已连接 |
| 见面工作流 | `hooks/useGame/bdsmMeetingWorkflow.ts` | 已连接 |
| 状态集成 | `hooks/useGame/bdsmStateIntegration.ts` | 已连接 |
| 状态解析器 | `hooks/useGame/bdsmStateParser.ts` | 已连接 |
| UI 组件 (4 modals) | `components/features/BDSM*.tsx` | 已渲染 (仅桌面端) |
| 仪表盘 | `components/features/CampusDesireDashboard.tsx` | 已连接 |
| 谣言工作流 | `hooks/useGame/campusRumorWorkflow.ts` | **未连接** — 10KB 死代码 |
| 论坛工作流 | `hooks/useGame/campusForumWorkflow.ts` | 逻辑与 deviceRefreshMonitor 重复 |

### UI 层级

```
CampusDesireDashboard (欲望仪表盘)
  ├── [关系总览] → BDSMRelationshipModal
  │     ├── [调教任务] → BDSMTaskModal
  │     ├── [契约管理] → BDSMContractModal
  │     └── [安全设置] → BDSMSafetyModal
  ├── [契约管理] → BDSMContractModal
  └── [安全设置] → BDSMSafetyModal
```

---

## 发现的问题

### CRITICAL — 功能未连接

**问题 1: `bdsmTaskWorkflow.ts` 完全未被导入**

该文件包含 5 个核心 AI 函数，是 BDSM 模块的引擎核心：
- `生成调教任务()` — 生成调教任务列表
- `生成日常指令()` — 生成日常指令
- `评价任务完成()` — 评价任务执行情况
- `生成契约条款()` — 生成契约内容
- `判定关系阶段推进()` — 判定是否升级关系阶段

**现状:** 无任何文件导入此模块。这意味着任务生成、指令刷新、契约协商、阶段推进全部是空壳。

**影响:** 用户可以打开 UI 界面，点击"接受任务"、"报告完成"等按钮，但背后没有任何 AI 驱动的逻辑在工作。

**修复:** 在 `useGame.ts` 中接入这些函数，在用户操作时调用。

---

**问题 2: `bdsmTaskTrigger.ts` 仅构建提示词，未调用 AI**

`触发任务生成()` 和 `触发日常指令刷新()` 只返回提示词字符串，没有 AI 调用。实际调用应该发生在哪里 — 不明确。

**修复:** 与问题 1 一起修复，在触发器中调用工作流函数。

---

**问题 3: `campusRumorWorkflow.ts` 未导入**

10KB 的谣言传播逻辑完全未被使用。

**修复:** 暂不连接（属于 v1.1 子系统，优先级低于核心的 v1.6 BDSM 管线）。

---

### HIGH — 类型安全问题

**问题 4: `useGame.ts` 中大量使用 `any` 访问 BDSM 状态**

```typescript
// 当前写法 — 失去类型检查
const 关系状态 = (state as any).校园系统?.欲望系统?.NPC欲望档案?.[npcId]?.BDSM关系
```

**修复:** 使用类型断言或类型守卫，确保 `NPC欲望档案` 正确导入 `BDSM关系状态` 类型。

---

**问题 5: `服从度` 双重存储不一致**

- `NPC欲望档案.服从度` → `服从度状态` 对象（含 `当前值`, `未完成指令数` 等）
- `BDSM关系状态.服从度` → 纯数字

两个值从未同步。

**修复:** 在状态更新时保持一致性，或统一为一个数据源。

---

### MEDIUM — 逻辑问题

**问题 6: 任务生成提示词硬编码契约类型**

`触发任务生成()` 始终传入 `契约类型: '口头约定'` 和 `契约状态: '口头约定'`，无视实际契约状态。

**修复:** 从 `关系状态.契约记录` 中读取当前契约信息。

---

**问题 7: 论坛影响应用到所有 NPC**

`处理BDSM论坛影响` 对所有 NPC 应用相同的 push 值，不合理。

**修复:** 仅对与帖子相关的 NPC 应用影响。

---

**问题 8: 阶段推进阈值三处重复**

相同的阶段阈值出现在 3 个文件中：
- `bdsmTaskWorkflow.ts`（硬编码判定）
- `campusNSFWEngine.ts`（判定函数）
- `prompts/runtime/bdsmTasks.ts`（提示词构建）

**修复:** 统一到单一常量文件。

---

### LOW — UI/UX 问题

**问题 9: BDSM 模态框仅在桌面端渲染**

`App.tsx` 中 BDSM modals 只在 `!isMobile` 条件下渲染。移动端用户无法访问 BDSM 功能。

**修复:** 不在本次范围内处理（需要新建移动端组件）。

---

**问题 10: `BDSMRelationshipModal` 中报告完成传入空字符串**

```typescript
onReportComplete?.(task, '') // 执行描述为空
```

而 `BDSMTaskModal` 有文本框让用户输入执行描述。

**修复:** 在 RelationshipModal 中也添加输入框。

---

## 修复方案

### 阶段 1: 核心工作流连接（最重要）

**目标:** 让 `bdsmTaskWorkflow.ts` 中的 5 个核心函数在用户操作时被调用。

#### 步骤 1.1: 在 `useGame.ts` 中导入工作流函数

在 `hooks/useGame.ts` 顶部导入：
```typescript
import { 生成调教任务, 生成日常指令, 评价任务完成, 生成契约条款, 判定关系阶段推进 } from './useGame/bdsmTaskWorkflow';
```

#### 步骤 1.2: 创建异步操作函数

在 `useGame.ts` 的返回值中添加异步操作：
- `请求生成BDSM任务(npcId)` — 调用 `生成调教任务()`，将结果添加到状态
- `请求生成BDSM日常指令(npcId)` — 调用 `生成日常指令()`，更新状态
- `请求评价BDSM任务(npcId, taskId, 执行情况)` — 调用 `评价任务完成()`，更新服从度和任务状态
- `请求生成BDSM契约(npcId)` — 调用 `生成契约条款()`，更新契约记录
- `请求判定BDSM阶段推进(npcId)` — 调用 `判定关系阶段推进()`，更新阶段

#### 步骤 1.3: 将异步操作传递给 UI 组件

修改 `CampusDesireDashboard`、`BDSMRelationshipModal`、`BDSMTaskModal`、`BDSMContractModal` 的 props，接入新异步操作。

#### 步骤 1.4: 修复触发器逻辑

修改 `bdsmTaskTrigger.ts` 中的 `触发任务生成()`，从 `关系状态.契约记录` 中读取真实契约信息，而非硬编码 `'口头约定'`。

### 阶段 2: API 测试验证

**目标:** 使用测试 API 验证所有 AI 调用路径正常工作。

#### 步骤 2.1: 配置测试 API

在开发环境中临时替换 `apiConfig` 为测试配置：
```typescript
{
  接口类型: 'openai_compatible',
  地址: 'https://gcli.ggchan.dev/',
  模型: '默认',
  密钥: 'gg-gcli-RALFsIs47kRn7m3HKh98dTj0R48ccM2ln8sIVDc3OSA'
}
```

#### 步骤 2.2: 测试任务生成

调用 `生成调教任务()` 验证：
- API 请求成功
- 返回可解析的 JSON
- 字段映射正确
- 错误处理正常（模拟失败场景）

#### 步骤 2.3: 测试日常指令生成

调用 `生成日常指令()` 验证同上。

#### 步骤 2.4: 测试任务评价

调用 `评价任务完成()` 验证同上。

#### 步骤 2.5: 测试契约生成

调用 `生成契约条款()` 验证同上。

#### 步骤 2.6: 测试阶段推进判定

调用 `判定关系阶段推进()` 验证同上。

### 阶段 3: 类型安全修复

#### 步骤 3.1: 消除 `any` 类型访问

在 `useGame.ts` 中为 BDSM 状态访问添加正确的类型断言。

#### 步骤 3.2: 统一 `服从度` 数据源

确保 `NPC欲望档案.服从度.当前值` 与 `BDSM关系状态.服从度` 保持同步。

### 阶段 4: 统一阶段阈值常量

将三处重复的阶段阈值提取到 `models/campusNSFW/bdsmConstants.ts`：
```typescript
export const BDSM阶段要求 = {
  '初识': { 下一阶段: '试探', 服从度: 20, 任务数: 2, 完美服从: 0, 最大违约: 0 },
  '试探': { 下一阶段: '确立', 服从度: 40, 任务数: 5, 完美服从: 1, 最大违约: 0 },
  '确立': { 下一阶段: '深入', 服从度: 60, 任务数: 10, 完美服从: 3, 最大违约: 1 },
  '深入': { 下一阶段: '固化', 服从度: 80, 任务数: 20, 完美服从: 8, 最大违约: 0 },
} as const;
```

---

## 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| AI 返回格式不稳定 | 高 | JSON 提取器 + 硬编码 fallback 已实现 |
| 异步状态更新竞争条件 | 中 | 使用 AbortSignal，每个 NPC 独立 |
| 测试 API 限流 | 低 | 测试用例会加延迟间隔 |
| 移动端无支持 | 低 | 不在本次范围 |

---

## 预估复杂度

- **阶段 1 (核心连接):** 中高 — 需要修改 useGame.ts 和 4 个组件的 props
- **阶段 2 (API 测试):** 中 — 编写测试脚本，验证 5 个 AI 函数
- **阶段 3 (类型修复):** 低 — 类型断言 + 状态同步
- **阶段 4 (常量统一):** 低 — 提取常量，更新 3 处引用

---

## 实施步骤进度

- [x] 阶段 1: 核心工作流连接
  - [x] 步骤 1.1: 导入工作流函数到 useGame.ts
  - [x] 步骤 1.2: 创建异步操作函数
  - [x] 步骤 1.3: 将异步操作传递给 UI 组件
  - [x] 步骤 1.4: 修复触发器逻辑
- [x] 阶段 2: API 测试验证
  - [x] 步骤 2.1: 配置测试 API
  - [x] 步骤 2.2-2.6: 测试 5 个 AI 函数（全部通过）
- [x] 阶段 3: 类型安全修复
  - [x] 步骤 3.1: 消除 any 类型访问（契约记录字段映射修复）
  - [x] 步骤 3.2: 统一服从度数据源（日常指令中文字段 fallback）
- [x] 阶段 4: 统一阶段阈值常量
  - [x] 提取常量到 models/campusNSFW/bdsmConstants.ts
  - [x] 更新 bdsmTaskWorkflow.ts 引用
  - [x] 更新 campusNSFWEngine.ts 引用
