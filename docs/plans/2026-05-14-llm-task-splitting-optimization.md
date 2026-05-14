# LLM 任务拆分与队列优化计划

> 日期: 2026-05-14
> 状态: 待审批

---

## 一、目标

当前系统在用户发送输入后，必须等待所有 LLM 调用（正文生成、变量解析、世界演变、规划分析、设备消息、BDSM任务补充等）**全部串行完成**后才会结束 loading 状态。这导致用户等待时间过长。

**核心目标**：
1. 将非关键路径的 LLM 调用移至后台异步队列，优先向用户展示正文
2. 按任务复杂度分配最优 LLM 模型，降低成本
3. 并行处理无依赖的后台任务，缩短总体耗时

---

## 二、现状分析

### 2.1 当前 LLM 调用站点全景

| # | 任务 | 所在文件 | 独立API配置 | 当前执行方式 | 预估Token |
|---|------|---------|------------|-------------|----------|
| 1 | **主故事生成** | `services/ai/text/storyCoreTasks.ts` | `获取主剧情接口配置` | 同步阻塞 | 2000-5000 |
| 2 | **记忆召回** | `sendWorkflow/memoryRecallPhase.ts` | `获取剧情回忆接口配置` | 同步阻塞（故事前） | 500-2000 |
| 3 | **正文润色** | `opening/bodyPolish.ts` | `获取文章优化接口配置` | 同步阻塞（故事后） | 输入的80-100% |
| 4 | **变量校准** | `sendWorkflow/independentStages.ts` | `获取变量计算接口配置` | 同步阻塞（故事后） | 500-1500 |
| 5 | **世界演变** | `world/worldEvolutionWorkflow.ts` | `获取世界演变接口配置` | 同步阻塞（故事后） | 1000-3000 |
| 6 | **规划分析** | `planning/planningUpdateWorkflow.ts` | `获取规划分析接口配置` | 同步阻塞（故事后） | 1000-2000 |
| 7 | **设备消息** | `device/deviceAiWorkflow.ts` | `获取设备消息接口配置` | 同步阻塞（故事后） | 500-2000 |
| 8 | **BDSM任务补充** | `sendWorkflow/index.ts` (逐NPC循环) | `获取主剧情接口配置` | 同步阻塞（故事后） | 300-800/NPC |
| 9 | **记忆总结(玩家)** | `memory/memorySummaryHandlers.ts` | `获取记忆总结接口配置` | 手动触发 | 500-1500 |
| 10 | **记忆总结(NPC)** | `memory/npcMemorySummary.ts` | `获取记忆总结接口配置` | 异步队列(已有) | 300-800/NPC |
| 11 | **图片生成** | `image/imageGenerationCoordinator.ts` | `获取文生图接口配置` | 异步队列(已有) | N/A |
| 12 | **小说拆分** | `services/novel-decomposition/` | `获取小说拆分接口配置` | 手动触发 | 5000+ |

### 2.2 现有基础设施

- **独立API配置已完备**（`utils/apiConfig.ts`）：每个任务类型已有独立路由配置，支持切换供应商和模型
- **`variableGenerationQueue.ts` 已有队列模式**：变量生成已支持并发和进度回调
- **`device/messageQueue.ts` + `messageScheduler.ts`**：游戏内消息队列（非LLM调用队列）
- **`构建可重试独立阶段执行器`**（`independentStages.ts`）：已有可重试阶段框架
- **Zustand Store**（`subsystems/zustandStore.ts`）：已有状态管理模式

### 2.3 核心问题

1. **用户等待链过长**：发送 → 故事 → 润色 → 变量 → 世界演变 → 规划 → 设备 → BDSM，全部串行
2. **主模型浪费**：BDSM任务、设备消息等简单任务使用了 `获取主剧情接口配置`
3. **无并行**：变量、世界演变、规划分析之间无依赖，却串行执行
4. **无降级**：后台任务失败影响整体流程

---

## 三、任务分类

### 3.1 按用户等待优先级

| 优先级 | 任务 | 执行策略 | 目标响应 |
|--------|------|---------|---------|
| **P0 关键** | 记忆召回、主故事生成 | 同步阻塞，SSE流式 | < 10s 首字 |
| **P1 快速** | 正文润色 | 异步队列，优先调度 | 故事后 < 5s |
| **P2 后台** | 变量校准、世界演变、规划分析 | 异步队列，并行执行 | 故事后 < 30s |
| **P3 延迟** | 设备消息、BDSM任务补充 | 异步队列，低优先级 | 故事后 < 60s |
| **P4 空闲** | NPC记忆总结、图片生成 | 空闲队列，批量 | < 5min |
| **P5 手动** | 玩家记忆总结、小说拆分 | 用户操作触发 | 用户控制 |

### 3.2 按任务复杂度

| 复杂度 | 任务 | 推荐模型类型 |
|--------|------|-------------|
| **高** | 故事生成、世界演变 | 顶级创意模型 |
| **中** | 规划分析、设备消息、BDSM任务 | 均衡型模型 |
| **低** | 变量校准、记忆召回、记忆总结 | 快速低成本模型 |
| **特低** | 正文润色 | 快速模型 |

---

## 四、LLM 模型推荐清单

### 4.1 按任务推荐

| 任务类型 | 推荐首选 | 备选 | 理由 | 成本等级 |
|----------|---------|------|------|---------|
| **主故事生成** | Claude 3.5 Sonnet / Gemini 2.0 Pro | GPT-4o | 最佳叙事连贯性 | 高 |
| **记忆召回** | DeepSeek-V3 / GPT-4o-mini | Claude Haiku | 信息提取为主 | 低 |
| **正文润色** | DeepSeek-V3 / GPT-4o-mini | Gemini 2.0 Flash | 文本润色较简单 | 低 |
| **变量校准** | DeepSeek-V3 / GPT-4o-mini | Claude Haiku | 结构化JSON输出 | 低 |
| **世界演变** | Gemini 2.0 Pro | Claude 3.5 Sonnet / GPT-4o | 创意世界构建 | 高 |
| **规划分析** | DeepSeek-V3 | GPT-4o-mini / Claude Haiku | 模式识别 | 低 |
| **设备消息** | DeepSeek-V3 / GPT-4o-mini | Gemini 2.0 Flash | JSON输出简单 | 低 |
| **BDSM任务补充** | DeepSeek-V3 / GPT-4o-mini | - | 结构化模板 | 低 |
| **记忆总结** | DeepSeek-V3 / GPT-4o-mini | Claude Haiku | 信息压缩 | 低 |
| **图片提示词转换** | GPT-4o-mini | Gemini 2.0 Flash | 格式转换 | 低 |
| **小说拆分** | Claude 3.5 Sonnet | GPT-4o | 大上下文分析 | 高 |

### 4.2 模型成本参考（每百万Token）

| 模型 | 输入 | 输出 | 适合场景 |
|------|------|------|---------|
| Claude 3.5 Sonnet | $3.00 | $15.00 | 创意写作、复杂推理 |
| Gemini 2.0 Pro | $1.25 | $5.00 | 创意写作、平衡选择 |
| Gemini 2.0 Flash | $0.10 | $0.40 | 快速低成本 |
| GPT-4o | $2.50 | $10.00 | 通用高质量 |
| GPT-4o-mini | $0.15 | $0.60 | 低成本结构化 |
| DeepSeek-V3 | $0.07 | $0.28 | 极低成本可靠 |

### 4.3 推荐配置策略

```
主故事: Claude 3.5 Sonnet 或 Gemini 2.0 Pro（用户选择）
记忆召回: DeepSeek-V3 或 GPT-4o-mini
正文润色: DeepSeek-V3
变量校准: DeepSeek-V3 或 GPT-4o-mini
世界演变: Gemini 2.0 Pro（性价比优于Claude）
规划分析: DeepSeek-V3
设备消息: DeepSeek-V3
BDSM任务: DeepSeek-V3
记忆总结: DeepSeek-V3 或 GPT-4o-mini
```

**成本优化效果**：如果 80% 的后台任务使用 DeepSeek-V3，仅主故事使用 Claude，总体 LLM 成本可降低 60-75%。

---

## 五、优化后架构

### 5.1 队列注册中心

```
LLMQueueRegistry
├── storyQueue          (P0, concurrency=1, retry=2, SSE streaming)
├── polishQueue         (P1, concurrency=1, retry=2)
├── variableQueue       (P2, concurrency=3, retry=3) ← 已部分实现
├── worldQueue          (P2, concurrency=1, retry=2)
├── planningQueue       (P2, concurrency=1, retry=2)
├── deviceQueue         (P3, concurrency=2, retry=2)
├── bdsmQueue           (P3, concurrency=2, retry=2)
├── memorySummaryQueue  (P4, concurrency=1, retry=3) ← 已部分实现
└── imageQueue          (P4, concurrency=1, retry=2) ← 已实现
```

### 5.2 优化后的发送流程

```
用户发送输入
    │
    ▼
[P0] 记忆召回 (同步)
    │
    ▼
[P0] 主故事生成 (同步，SSE流式)
    │
    ▼
━━━━━━━ 正文立即显示，loading 结束 ━━━━━━━
    │
    ├──▶ [P1] 正文润色 → polishQueue (async)
    ├──▶ [P2] 变量校准 → variableQueue (async, 并发)
    ├──▶ [P2] 世界演变 → worldQueue (async)
    ├──▶ [P2] 规划分析 → planningQueue (async)
    ├──▶ [P3] 设备消息 → deviceQueue (async)
    └──▶ [P3] BDSM任务 → bdsmQueue (async, 批量)

UI: "故事就绪 ✓" + 后台任务进度指示
```

### 5.3 Zustand 状态

新增 `llmQueueSlice`：

```typescript
interface LLMQueueState {
  queues: Record<string, {
    status: 'idle' | 'running' | 'paused' | 'error';
    activeTasks: number;
    pendingTasks: number;
    completedTasks: number;
    lastError?: string;
  }>;
  currentTurnTasks: Array<{
    id: string;
    type: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    turnNumber: number;  // 防止过期结果覆盖
    startedAt?: number;
    error?: string;
  }>;
}
```

---

## 六、实施阶段

### Phase 1: 队列基础设施

**新建文件**：
- `hooks/useGame/llmQueue/types.ts` — 共享类型
- `hooks/useGame/llmQueue/llmTaskQueue.ts` — 通用队列工厂（基于 variableGenerationQueue 模式）
- `hooks/useGame/llmQueue/queueRegistry.ts` — 队列注册中心（预配置 9 个队列）
- `hooks/useGame/llmQueue/index.ts` — 导出

**修改文件**：
- `hooks/useGame/subsystems/zustandStore.ts` — 新增 `llmQueueSlice`

**验收**：队列工厂可独立测试，支持 submit/cancel/pause/resume/abort、指数退避+抖动重试

### Phase 2: 主故事工作流重构

**修改文件**：
- `hooks/useGame/sendWorkflow/index.ts` — 故事显示后立即结束 loading，后台任务提交队列
- `hooks/useGame/sendWorkflow/independentStages.ts` — 新增 `queueMode` 选项
- `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` — 后台任务改为队列提交
- `hooks/useGame/subsystems/zustandStore.ts` — 新增异步结果应用 handlers

**验收**：故事文本生成完成即显示，后台任务异步执行，turnNumber 防过期覆盖

### Phase 3: 设备消息与 BDSM 任务队列化

**修改文件**：
- `hooks/useGame/device/deviceAiWorkflow.ts` — 队列提交包装器
- `hooks/useGame/sendWorkflow/index.ts` — BDSM 任务批量移至队列

### Phase 4: 渐进式 UX 面板

**新建文件**：
- `components/features/BackgroundTasks/BackgroundTaskPanel.tsx` — 后台任务面板

**修改文件**：
- `App.tsx` — 集成面板到右侧面板

**面板功能**：可折叠、状态图标、进度条、错误重试、"中止所有"按钮

### Phase 5: 开局工作流优化

**修改文件**：
- `hooks/useGame/opening/openingStoryWorkflow.ts` — 复用队列模式

### Phase 6: 测试与回归验证

- 队列工厂单元测试
- 队列注册中心集成测试
- 完整回合 E2E 测试
- 错误恢复测试（模拟 API 失败）

---

## 七、风险管理

| 风险 | 缓解措施 |
|------|---------|
| 异步任务完成顺序不确定，状态覆盖 | turnNumber 版本号，Zustand handler 拒绝旧版本 |
| 重构 sendWorkflow 引入回归 | 功能开关 `启用异步任务队列`，默认关闭，逐步启用 |
| 队列任务在页面关闭时泄漏 | AbortController 清理，组件卸载时取消所有队列 |
| 后台任务失败不可见 | 面板显示错误 + 重试，关键任务提供手动重试 |
| 多队列并发导致 API 限流 | 每队列独立并发限制，全局请求追踪 |

---

## 八、关键设计决策

1. **记忆召回保持同步**：其输出注入故事生成 prompt，异步将导致故事缺少召回结果
2. **正文润色优先级高**：直接影响阅读体验，P1 优先于后台任务
3. **变量校准支持并发**：利用已有的 `获取变量生成并发配置`（maxConcurrency 1-5）
4. **BDSM 任务批量提交**：从逐NPC串行改为批量收集后并发提交（concurrency=2）
5. **功能开关渐进启用**：`gameConfig.启用异步任务队列` 默认 false，先启用 variableQueue，再 deviceQueue + bdsmQueue，最后 worldQueue + planningQueue

---

## 九、文件清单

| 文件 | 操作 | 描述 |
|------|------|------|
| `hooks/useGame/llmQueue/types.ts` | **新建** | 队列系统类型 |
| `hooks/useGame/llmQueue/llmTaskQueue.ts` | **新建** | 通用队列工厂 |
| `hooks/useGame/llmQueue/queueRegistry.ts` | **新建** | 队列注册中心 |
| `hooks/useGame/llmQueue/index.ts` | **新建** | 导出 |
| `hooks/useGame/subsystems/zustandStore.ts` | **修改** | 新增 llmQueueSlice |
| `hooks/useGame/sendWorkflow/index.ts` | **修改** | 重构为队列提交 |
| `hooks/useGame/sendWorkflow/independentStages.ts` | **修改** | 新增 queueMode |
| `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` | **修改** | 后台任务队列化 |
| `hooks/useGame/device/deviceAiWorkflow.ts` | **修改** | 队列包装器 |
| `hooks/useGame/opening/openingStoryWorkflow.ts` | **修改** | 复用队列模式 |
| `components/features/BackgroundTasks/BackgroundTaskPanel.tsx` | **新建** | 后台任务面板 |
| `App.tsx` | **修改** | 集成面板 |

**统计**：5 个新建，7 个修改

---

## 十、预期效果

| 指标 | 当前 | 优化后 | 改善 |
|------|------|--------|------|
| 用户首字响应 | 15-40s | 3-10s | **减少 60-75%** |
| 后台任务总耗时 | 串行 20-60s | 并行 10-30s | **减少 30-50%** |
| LLM 成本 | 全部主模型 | 80% 低成本模型 | **降低 60-75%** |
| 任务失败影响 | 整体中断 | 单任务独立 | **可用性提升** |
