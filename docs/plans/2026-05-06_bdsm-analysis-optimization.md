# BDSM 模块分析与优化方案

**日期：** 2026-05-06
**状态：** 待审批

---

## 一、模块概述

BDSM 系统分为两个子模块：

| 子模块 | 版本 | 功能 |
|--------|------|------|
| **BDSM 论坛 (BDSM Forum)** | v1.5 | 校园手机 "bdsn" 应用中的论坛帖子浏览、发帖、联系协商、NPC 解锁 |
| **BDSM 关系管线 (BDSM Relationship Pipeline)** | v1.6 | NPC 欲望档案中的关系状态追踪、AI 驱动的调教任务/契约/日常指令、见面预约与触发 |

### 架构分层（6 层）

| 层级 | 关键文件 | 职责 |
|------|----------|------|
| **Models** | `models/campusNSFW/sm.ts`, `bdsm-forum.ts`, `core.ts`, `index.ts` | 类型定义：BDSM关系状态、契约记录、帖子、联系会话等 |
| **Prompts** | `prompts/runtime/bdsmTasks.ts`, `bdsmForum.ts` | AI 提示词模板：任务生成、契约、评价、Aftercare、论坛内容 |
| **Engines** | `hooks/useGame/campusNSFWEngine.ts`, `bdsmForumEngine.ts` | 纯函数逻辑：欲望档案初始化、论坛影响计算、NPC 创建 |
| **Workflows** | `bdsmTaskWorkflow.ts`, `bdsmMeetingWorkflow.ts`, `bdsmStateIntegration.ts`, `bdsmStateParser.ts`, `bdsmMeetingTrigger.ts`, `bdsmTaskTrigger.ts` | 编排层：AI 调用、状态解析、任务触发、见面触发 |
| **Components** | `BDSMRelationshipDashboard.tsx`, `BDSMTaskPanel.tsx`, `BDSMContractPanel.tsx`, `BDSMSafetySettings.tsx`, `BDSMNegotiationPanel.tsx`, `BDSMContactModal.tsx` | 移动端 UI（仅 MobileDevice/apps/） |
| **Integration** | `useGame.ts`, `systemPromptBuilder.ts`, `sendWorkflow/index.ts` | 状态管理、主循环集成、Prompt 注入 |

---

## 二、能否正常工作？

### ✅ 可正常工作的部分

1. **论坛帖子生成 → 展示 → 联系 → NPC 解锁**：数据流完整
2. **任务生成（AI）→ 展示 → 接受 → 完成 → 评价 → 状态更新**：链路完整，依赖 AI 输出格式合规
3. **契约协商 → 条款生成 → 存储 → 展示**：链路完整
4. **见面预约 → 触发 → 场景生成 → 结果解析**：基本完整
5. **存档/读档**：包含 BDSM 状态，有向后兼容处理
6. **类型一致性**：核心类型在 models/workflows/components 之间基本对齐

### ⚠️ 存在问题的部分

| 问题 | 严重程度 | 详情 |
|------|----------|------|
| **无桌面端 UI** | 中 | 所有 6 个 BDSM 组件仅存在于 `MobileDevice/apps/`，桌面端用户无法访问 |
| **ContactModal 使用硬编码回复池** | 中 | `BDSMContactModal.tsx` 使用硬编码 NPC 回复（第 13-31 行、238-267 行），未调用 `bdsmForum.ts` 中的 AI prompt 函数 |
| **SafetySettings 未接入** | 低 | `BDSMSafetySettings.tsx` 存在但没有被任何页面引用/渲染 |
| **v1.6 设置项未暴露** | 低 | `CampusNSFWSettings.tsx` 有 v1.5 论坛开关，但缺少 v1.6 关系管线的开关（`启用BDSM关系管线`、`启用BDSM调教任务`、`启用BDSM契约系统` 在 model 中定义但 UI 未暴露） |
| **DeviceState 重复定义** | 低 | `mobileDevice.ts` 第 62-69 行和第 103-107 行有重复的 `DeviceState` 接口，第二个定义缺少 `messages`、`stats`、`notifications` 字段 |
| **任务评价触发路径不清晰** | 中 | `bdsmTaskWorkflow.ts` 中的评价函数存在，但从 UI 触发 AI 评价的路径不明确 |
| **Aftercare 注入时机待验证** | 低 | `bdsmTaskTrigger.ts` 中的 `检查Aftercare需求` 函数存在，但在 sendWorkflow 中的注入点不明确 |

---

## 三、与其他模块的适配性分析

### 与角色系统（Character）
- **适配性：良好** — NPC 欲望档案通过 NPC ID 索引，`从NPC创建欲望档案()` 在 `campusNSFWEngine.ts` 中正确初始化 BDSM 关系默认值

### 与社交/NPC 系统（Social）
- **适配性：良好** — 欲望档案引用 social.ts 中的 NPC 结构，性格特征影响初始阶段和权力倾向

### 与亲密度系统（Intimacy）
- **适配性：良好** — `校园亲密互动类型` 驱动关系阶段推进，阶段推进解锁 BDSM 内容，有明确的闸门机制

### 与战斗系统（Battle）
- **适配性：不适用** — BDSM 是纯叙事/社交系统，与战斗无直接关联，设计合理

### 与世界系统（World）
- **适配性：良好** — 校园时代背景决定设备能力和应用可用性

### 与故事生成系统（Story/SendWorkflow）
- **适配性：良好** — `sendWorkflow/index.ts` 每回合运行 "BDSM 任务补充阶段"，`systemPromptBuilder.ts` 注入活跃任务和契约状态，AI 响应通过 `<BDSM状态更新>` 标签解析

### 与设置系统（Settings）
- **适配性：部分** — 设置 UI 仅覆盖 v1.5 论坛，v1.6 管线设置未暴露

### 与手机设备系统（MobileDevice）
- **适配性：良好** — `bdsn` 应用正确注册在 `MobileApp` 枚举中，`CampusForumApp.tsx` 正确渲染 bdsn 板块

---

## 四、优化方案

### 阶段一：修复功能性缺陷（优先级高）

#### 1.1 接入 BDSMSafetySettings 组件
- 在 `BDSMRelationshipDashboard.tsx` 中添加"安全设置"入口按钮
- 将 `BDSMSafetySettings.tsx` 注册为子面板，在 `MobileHome.tsx` 的路由中添加
- **影响文件：** `BDSMRelationshipDashboard.tsx`, `MobileHome.tsx`
- **工作量：** 低（1-2 小时）

#### 1.2 暴露 v1.6 设置项
- 在 `CampusNSFWSettings.tsx` 中添加 v1.6 关系管线相关开关：
  - `启用BDSM关系管线`
  - `启用BDSM调教任务`
  - `启用BDSM契约系统`
  - `启用BDSM见面预约`
- **影响文件：** `CampusNSFWSettings.tsx`, `models/campusNSFW/index.ts`
- **工作量：** 低（1-2 小时）

#### 1.3 合并重复的 DeviceState 定义
- 将 `mobileDevice.ts` 中两处 `DeviceState` 合并为一个完整定义
- **影响文件：** `mobileDevice.ts`
- **工作量：** 低（0.5 小时）

### 阶段二：提升 AI 驱动质量（优先级中）

#### 2.1 AI 化 ContactModal
- 将 `BDSMContactModal.tsx` 中的硬编码回复池替换为 AI 调用
- 使用 `bdsmForum.ts` 中已定义的 `构建寻主召奴联系对话Prompt` 函数
- 接入 `chatCompletionClient.ts` 进行实时对话生成
- **影响文件：** `BDSMContactModal.tsx`, `campusForumWorkflow.ts`, `prompts/runtime/bdsmForum.ts`
- **工作量：** 中（3-4 小时）

#### 2.2 明确任务评价触发路径
- 在 `BDSMTaskPanel.tsx` 中添加"请求评价"按钮
- 在 `useGame.ts` 中添加 `评价BDSM任务` action
- 连接 `bdsmTaskWorkflow.ts` 中的 `评价任务完成` 函数
- **影响文件：** `BDSMTaskPanel.tsx`, `useGame.ts`, `bdsmTaskWorkflow.ts`
- **工作量：** 中（2-3 小时）

#### 2.3 验证 Aftercare 注入时机
- 检查 `bdsmTaskTrigger.ts` 中 `检查Aftercare需求` 是否在 sendWorkflow 中被调用
- 如未调用，在 `sendWorkflow/index.ts` 或 `systemPromptBuilder.ts` 中添加注入点
- **影响文件：** `sendWorkflow/index.ts`, `systemPromptBuilder.ts`, `bdsmTaskTrigger.ts`
- **工作量：** 低（1-2 小时）

### 阶段三：扩展桌面端支持（优先级低）

#### 3.1 创建桌面端 BDSM 组件
- 按照项目约定，在 `components/features/` 下创建桌面版组件：
  - `BDSMRelationshipModal.tsx`
  - `BDSMTaskModal.tsx`
  - `BDSMContractModal.tsx`
  - `BDSMSafetyModal.tsx`
- 在 `App.tsx` 中注册懒加载组件
- **影响文件：** 新增 4 个文件 + `App.tsx` 修改
- **工作量：** 高（6-8 小时）

### 阶段四：增强健壮性（优先级低）

#### 4.1 添加 BDSM 状态数据校验
- 类似关系模块的 `验证关系数据`，创建 `验证BDSM状态数据` 函数
- 在存档加载和 NPC 创建时调用
- **影响文件：** 新建 `hooks/useGame/bdsmStateValidation.ts`
- **工作量：** 低（1-2 小时）

#### 4.2 统一命名风格
- 将 `BDSM日常指令` 中的混用字段名（如 `content`）统一为中文风格或明确约定
- **影响文件：** `models/campusNSFW/sm.ts`, `bdsmStateParser.ts` 及相关引用
- **工作量：** 低（1 小时）

---

## 五、总结

**BDSM 模块整体架构合理，数据流基本完整，核心功能可以正常工作。** 主要问题集中在：

1. **UI 层面**：仅支持移动端，桌面端缺失；部分组件未接入导航
2. **设置层面**：v1.6 管线的开关未暴露到设置面板
3. **AI 驱动层面**：ContactModal 使用硬编码回复，未充分发挥 AI 能力
4. **代码质量**：少量类型重复定义和命名不一致

建议按 **阶段一 → 阶段二 → 阶段三 → 阶段四** 的顺序逐步优化，每个阶段可独立验证和提交。
