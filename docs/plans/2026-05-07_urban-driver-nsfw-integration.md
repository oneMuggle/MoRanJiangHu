# 都市网约车NSFW模块完整集成方案

**日期:** 2026-05-07
**作者:** Claude Code
**状态:** 全部完成

---

## 一、现状分析

### 1.1 架构总览

都市网约车NSFW模块采用了分层架构，代码结构清晰：

| 层级 | 文件 | 状态 |
|------|------|------|
| **数据层** | `models/urbanDriverNSFW/` (core, scenarios, consequences, normalization) | ✅ 完整 |
| **引擎层** | `hooks/useGame/urbanDriverNSFWEngine.ts` | ✅ 完整 |
| **集成层** | `hooks/useGame/urbanDriverNSFWIntegration.ts` | ⚠️ 部分断连 |
| **Prompt层** | `prompts/runtime/urbanDriverNSFW.ts` | ✅ 完整 |
| **UI层** | NSFW Control Center + UrbanDriverNSFWSettings | ✅ 完整 |
| **模块注册** | `modules/contemporary/urbanDriverNSFW/registration.ts` | ✅ 完整 |

### 1.2 已连通的链路（Prompt注入路径 ✅）

```
用户操作 → sendWorkflow/index.ts (L521)
  → 构建都市网约车NSFW参数()
  → mainStoryRequest.ts (L226)
  → 构建运行时额外提示词()
  → prompts/runtime/nsfw.ts (L252)
  → 构建都市网约车完整叙事约束()
  → 注入 AI 请求 extra_prompt
```

这条链路完全正常工作。AI 会收到完整的网约车NSFW叙事约束。

### 1.3 断开的链路（状态回写路径 ❌）

**关键发现：以下两个函数已定义但从未被调用：**

| 函数 | 定义位置 | 调用次数 |
|------|----------|----------|
| `解析都市网约车系统状态更新()` | `urbanDriverNSFWIntegration.ts:31` | **0次** |
| `移除都市网约车系统状态标签()` | `urbanDriverNSFWIntegration.ts:67` | **0次** |

这意味着：
1. **AI 输出的 `<都市网约车系统状态>` 标签从未被解析** — NPC欲望状态变化无法回写到游戏状态
2. **状态标签从未从响应文本中移除** — 用户会在剧情中看到原始JSON标签
3. **整个"AI响应 → 状态更新 → 下次请求携带新状态"的闭环是断的**

### 1.4 其他缺失的集成点

| 缺失项 | 影响 |
|--------|------|
| **状态初始化缺失** | 新游戏创建时 `都市网约车系统` 未初始化，`行程系统` 为 `undefined` |
| **响应处理阶段未接入** | `responseProcessingPhase.ts` 中没有任何 NSFW 状态解析逻辑 |
| **状态持久化缺失** | `都市网约车系统` 未纳入自动存档的保存范围 |

---

## 二、问题汇总

| # | 问题 | 严重性 | 影响 |
|---|------|--------|------|
| 1 | AI响应状态标签未解析 | **CRITICAL** | 欲望状态机无法推进，每次请求都是空状态 |
| 2 | 状态标签未从响应文本移除 | **HIGH** | 用户会在剧情中看到JSON标签 |
| 3 | 新游戏状态未初始化 | **HIGH** | `都市网约车系统` 为 undefined，参数构建直接返回 undefined |
| 4 | 状态未纳入存档 | **MEDIUM** | 存档加载后状态丢失 |
| 5 | 引擎层纯函数未被调用 | **MEDIUM** | 欲望推进、后果生成等逻辑从未执行 |

---

## 三、实施步骤

### Phase 1: 状态初始化（新游戏创建）

**文件:** `hooks/useGame/openingStoryWorkflow.ts`

在新游戏创建时，当时代为 `contemporary_urban` 且角色背景为司机时，初始化 `都市网约车系统` 状态。

- [x] 修改新游戏初始化逻辑，添加 `都市网约车系统` 初始化

### Phase 2: 响应解析与状态应用

**文件:** `hooks/useGame/sendWorkflow/responseProcessingPhase.ts`

在AI响应解析完成后，添加状态解析和应用逻辑。

- [x] 在 `urbanDriverNSFWIntegration.ts` 新增 `应用都市网约车状态更新()` 函数
- [x] 在 `responseProcessingPhase.ts` 中调用解析和应用函数
- [x] 从响应文本中移除状态标签

### Phase 3: 存档持久化

**文件:** `hooks/useGame/sendWorkflow/index.ts` + `hooks/useGame/saveCoordinator.ts` + `models/system.ts`

将 `都市网约车系统` 纳入自动存档。

- [x] 修改自动存档逻辑，包含 `都市网约车系统`
- [x] 确认数据库schema支持新字段 — `models/system.ts` 的 `存档结构` 新增可选字段

### Phase 4: 引擎层激活

**文件:** `hooks/useGame/sendWorkflow/responseProcessingPhase.ts`

在状态解析后，使用引擎层纯函数计算新行程类型和后果。

- [x] 调用 `判定行程NSFW类型()` 计算下一行程
- [x] 调用 `生成后果事件()` 生成后果

---

## 四、文件变更清单

| 文件 | 变更类型 | 说明 | 状态 |
|------|----------|------|------|
| `hooks/useGame/openingStoryWorkflow.ts` | 修改 | 新增状态初始化 | ✅ 已完成 |
| `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` | 修改 | 新增状态解析、应用和引擎激活 | ✅ 已完成 |
| `hooks/useGame/urbanDriverNSFWIntegration.ts` | 修改 | 新增 `应用都市网约车状态更新()` | ✅ 已完成 |
| `hooks/useGame/sendWorkflow/index.ts` | 修改 | 存档包含都市网约车系统 | ✅ 已完成 |
| `hooks/useGame/saveCoordinator.ts` | 修改 | 存档快照支持都市网约车系统 | ✅ 已完成 |
| `models/system.ts` | 修改 | `存档结构` 新增 `都市网约车系统` 字段 | ✅ 已完成 |
