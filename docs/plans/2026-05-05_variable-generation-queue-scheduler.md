# 方案C：变量生成队列调度系统 — 详细设计文档

## 上下文

**问题：** 当前变量生成使用独立 API 但每次只能处理一个请求。单一 AbortController + 布尔 `变量生成中` 标志 + 串行执行架构，使得即使有多个变量生成需求（如开局变量、回合变量、世界演变后的补充变量等），也只能排队等待或相互 abort。

**目标：** 引入完整的任务队列 + 并发控制器，支持多变量生成任务同时处理，同时保留优先级、重试、进度追踪能力。

**现状关键文件：**
- `hooks/useGame/variableCalibrationCoordinator.ts` — 协调器，封装单一请求生命周期
- `hooks/useGame/variableModelWorkflow.ts` — 工作流，组装 prompt 并调用 API
- `hooks/useGame/variableGenerationProgress.ts` — 进度追踪与 abort 控制
- `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` — 调用点（line 337-379）
- `hooks/useGame/openingStoryWorkflow.ts` — 开局变量生成调用点（line 838）
- `hooks/useGame/variableCalibrationMerge.ts` — 结果合并
- `models/system.ts` — 设置：`变量计算独立模型开关`(line 244)、`独立APIGPT模式.变量生成`(line 1586)
- `utils/apiConfig.ts` — `获取变量计算接口配置`(line 242)、`变量校准功能已启用`(line 255)

---

## 架构设计

### 核心概念

```
┌──────────────────────────────────────────────────────────┐
│                    变量生成队列调度器                        │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  任务队列    │  │ 并发控制器   │  │  进度聚合器       │  │
│  │             │  │             │  │                  │  │
│  │ pending[]   │─>│ max: 3      │─>│ UI 进度回调       │  │
│  │ priority    │  │ rate limit  │  │ 任务状态追踪       │  │
│  │ retry count │  │ abort map   │  │ 结果收集          │  │
│  └─────────────┘  └─────────────┘  └──────────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              任务执行器 (原有工作流)                    │ │
│  │  variableModelWorkflow.ts → variableCalibrationTask  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 任务类型定义

```typescript
type 变量生成任务状态 = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

type 变量生成任务优先级 = 'critical' | 'high' | 'normal' | 'low';

type 变量生成任务类型 =
    | 'opening'        // 开局变量生成
    | 'turn'           // 回合变量生成
    | 'reparse'        // 重解析
    | 'supplement'     // 世界演变后补充
    | 'background';    // 后台补充

type 变量生成任务 = {
    id: string;              // uuid 自增
    type: 变量生成任务类型;
    priority: 变量生成任务优先级;
    status: 变量生成任务状态;
    params: 变量模型校准参数;  // 复用现有类型（来自 variableModelWorkflow.ts）
    retryCount: number;
    maxRetries: number;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    abortController: AbortController;
    result?: 变量模型校准结果 | null;
    error?: Error;
    onProgress?: (progress: 变量生成进度) => void;
};
```

---

## 实施步骤

### 阶段一：新建队列调度核心（新文件）

**文件：** `hooks/useGame/variableGenerationQueue.ts`（新建）

**内容：**

1. **`创建变量生成队列调度器(deps)`** — 主调度器工厂函数
   - 内部维护 `pendingQueue: 变量生成任务[]`（按 priority 排序的优先级队列）
   - 内部维护 `runningTasks: Map<string, 变量生成任务>`（并发中的任务）
   - 内部维护 `completedTasks: 变量生成任务[]`（已完成任务，保留最近 N 个）
   - 配置项：
     - `maxConcurrency: number`（默认 3，可配置）
     - `maxRetries: number`（默认 2）
     - `retryDelayMs: number`（默认 1000，指数退避基数）
     - `completedTaskTTL: number`（默认 50，保留最近 50 个已完成任务）

2. **优先级排序规则：**
   ```
   critical(0) > high(1) > normal(2) > low(3)
   同优先级按 createdAt 排序（FIFO）
   ```

3. **`入列(params, options)`** — 提交新任务
   - 生成唯一 taskId
   - 创建 AbortController
   - 插入 pendingQueue 并按 priority 排序
   - 触发 `drain()` 尝试启动任务
   - 返回 `{ taskId, abort: () => void }`

4. **`drain()`** — 队列排水
   - 检查 `runningTasks.size < maxConcurrency`
   - 从 pendingQueue 弹出最高优先级任务
   - 调用 `execute(task)`
   - 循环直到队列空或并发数满

5. **`execute(task)`** — 执行单个任务
   - 设置 status = 'running'
   - 调用 `执行变量模型校准工作流(task.params)`
   - 成功后设置 status = 'completed'，移入 completedTasks
   - 失败后按 retryCount 决定是否重试或标记 failed
   - 触发 `drain()` 让下一个排队任务启动

6. **`取消(taskId)`** — 取消指定任务
   - 如果在 pendingQueue 中，直接移除
   - 如果在 runningTasks 中，调用 abortController.abort()

7. **`取消全部()`** — 取消所有任务
   - abort 所有 runningTasks
   - 清空 pendingQueue

8. **`获取状态()`** — 返回队列快照
   ```typescript
   {
       pending: number,
       running: number,
       completed: number,
       failed: number,
       runningTaskIds: string[],
       tasks: 变量生成任务[]
   }
   ```

### 阶段二：并发 API 请求封装

**文件：** `services/ai/text/variableBatchCalibration.ts`（新建，可选优化）

**内容：**

1. **`批量执行变量校准(tasks[])`** — 批量模式（可选优化）
   - 当多个任务使用相同 API 配置时，可合并为单次请求
   - 构建合并 prompt，一次调用返回所有结果
   - 拆分结果并分发给各任务
   - 作为 `maxConcurrency > 1` 时的优化路径

2. **速率限制器（Rate Limiter）**
   - 滑动窗口限流：`maxRequestsPerMinute`（默认 30）
   - 在 `execute()` 前检查限流状态
   - 超限则延迟入列而非拒绝

### 阶段三：改造现有协调器

**文件：** `hooks/useGame/variableCalibrationCoordinator.ts`（修改）

**改动：**

1. 将现有的 `variableGenerationAbortControllerRef` 替换为队列调度器引用
2. 将 `变量生成中`（boolean）替换为 `获取变量生成状态()` 返回的快照对象
3. `执行变量校准并合并响应()` 改为 `入列()` + 等待结果
4. `后台执行变量校准()` 改为以 `priority: 'low'` 入列
5. `执行重解析变量校准()` 改为以 `priority: 'critical'` 入列
6. 保留 abort 兼容性：取消任务时通过队列的 `取消(taskId)` 方法

**关键兼容点：**
- 所有调用点不需要知道队列的存在，调用方式保持一致
- 进度回调 `onProgress` 仍然正常工作，但会携带 taskId 标识
- 合并逻辑 `variableCalibrationMerge.ts` 不变，只接收结果

### 阶段四：改造进度系统

**文件：** `hooks/useGame/variableGenerationProgress.ts`（修改）

**改动：**

1. 将 `变量生成中: boolean` 替换为 `变量生成状态: { running: Set<string>, pending: number }`
2. `variableGenerationAbortControllerRef` 替换为队列调度器引用
3. `等待世界演变空闲()` 保留不变（跨模块依赖）
4. 新增 `获取任务详情(taskId)` 方法
5. 新增 `监听任务完成(taskId)` 返回 Promise，用于等待特定任务

### 阶段五：更新调用点

**文件：** `hooks/useGame/sendWorkflow/responseProcessingPhase.ts`（修改）

**改动：**
- line 337 的 `deps.执行变量生成并合并响应` 改为 `队列调度器.入列(params)` + await 结果
- 进度回调保持不变（回调中增加 taskId）

**文件：** `hooks/useGame/openingStoryWorkflow.ts`（修改）

**改动：**
- line 838 的开局变量生成改为 `priority: 'critical'` 入列
- 保留 `执行可重试开局阶段` 包装，但内部使用队列

**文件：** `hooks/useGame/historyTurnWorkflow.ts`（修改）

**改动：**
- line 351-352 的 `if (deps.变量生成中)` 改为检查队列是否有 running 任务
- 增加更精确的判断：只阻塞同类型/同回合的任务

### 阶段六：UI 适配

**文件：** `components/features/Settings/GameSettings.tsx`（修改）

**改动：**
- 新增 `变量生成并发数` 配置项（1-5，默认 3）
- 在进度展示区显示队列状态（等待中 N 个，进行中 N 个）

### 阶段七：设置与配置

**文件：** `models/system.ts`（修改）

**改动：**
- 在 `功能模型占位配置结构` 中新增：
  ```typescript
  变量生成并发数: number;  // 1-5，默认 3
  变量生成最大重试次数: number;  // 0-5，默认 2
  ```

**文件：** `utils/apiConfig.ts`（修改）

**改动：**
- 无需修改，`获取变量计算接口配置` 保持原样
- 新增 `获取变量生成并发配置` 辅助函数

### 阶段八：合并逻辑增强

**文件：** `hooks/useGame/variableCalibrationMerge.ts`（修改）

**改动：**
- 增加 `批量合并变量校准结果(baseResponse, calibrations[])` 方法
- 处理并发结果中的命令冲突（同 key 后到者覆盖）
- 报告合并冲突信息

---

## 并发安全设计

### 命令冲突解决

当多个任务同时生成对同一 key 的命令时：

1. **add/set 冲突：** 后完成的覆盖先完成的（基于 completedAt 时间戳）
2. **push 冲突：** 所有 push 按完成顺序追加
3. **delete 冲突：** delete 优先于后续 set（防脏写）
4. **跨域安全：** `gameState.角色.xxx` 与 `gameState.世界.xxx` 无冲突

### Abort 安全

- 每个任务独立 AbortController
- 取消任务不影响其他正在运行的任务
- 取消全部任务时逐个 abort

### 重试安全

- 指数退避：`delay = retryDelayMs * 2^retryCount + jitter(0-200ms)`
- 重试次数达上限后标记 failed，不阻塞队列
- failed 任务可通过 UI 手动重试

---

## 验证方案

### 单元测试

1. **队列优先级测试：** 入列 low → high → critical，出列顺序应为 critical → high → low
2. **并发限制测试：** maxConcurrency=3，入列 5 个，验证只有 3 个 running
3. **取消测试：** 入列后取消，验证 abort signal 正确传递
4. **重试测试：** 模拟失败 2 次 + 成功 1 次，验证最终 completed
5. **合并冲突测试：** 两个任务对同一 key 生成不同值，验证后到者覆盖

### 集成验证

1. 开启变量生成 + 独立 API
2. 连续发送多条消息，观察队列状态
3. 验证多个变量生成任务是否同时执行（通过日志时间戳）
4. 验证结果是否正确合并到游戏状态
5. 测试取消、重试、全部取消等操作

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `hooks/useGame/variableGenerationQueue.ts` | **新建** | 队列调度核心 |
| `services/ai/text/variableBatchCalibration.ts` | **新建** | 批量请求封装（可选） |
| `hooks/useGame/variableCalibrationCoordinator.ts` | 修改 | 改用队列调度 |
| `hooks/useGame/variableGenerationProgress.ts` | 修改 | 状态模型升级 |
| `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` | 修改 | 调用点适配 |
| `hooks/useGame/openingStoryWorkflow.ts` | 修改 | 调用点适配 |
| `hooks/useGame/historyTurnWorkflow.ts` | 修改 | 守卫条件升级 |
| `hooks/useGame/variableCalibrationMerge.ts` | 修改 | 批量合并支持 |
| `hooks/useGame/runtimeVariableWorkflow.ts` | 修改 | 运行时命令应用 |
| `hooks/useGame.ts` | 修改 | 初始化队列调度器 |
| `models/system.ts` | 修改 | 新增配置字段 |
| `utils/apiConfig.ts` | 修改 | 新增配置读取 |
| `components/features/Settings/GameSettings.tsx` | 修改 | 新增配置 UI |

---

## 风险评估

| 风险 | 等级 | 应对 |
|------|------|------|
| 并发导致命令冲突 | 中 | 合并逻辑中实现冲突解决策略 |
| API 速率限制 | 中 | 内置滑动窗口限流器 |
| 内存泄漏（任务对象累积） | 低 | completedTaskTTL 自动清理 |
| 与现有 abort 逻辑冲突 | 中 | 保持 abort 兼容，渐进替换 |
| 开局流程复杂度增加 | 低 | 开局场景 maxConcurrency=1 保持串行 |
| UI 进度展示混乱 | 低 | 每个任务独立 taskId，UI 按任务追踪 |

---

## 实施顺序

1. **阶段一**（队列核心） → 先写独立模块，不影响现有代码
2. **阶段二**（批量封装） → 可选优化，可延后
3. **阶段三+四**（改造协调器+进度） → 核心改动
4. **阶段五**（调用点适配） → 逐个调用点验证
5. **阶段六+七**（UI+配置） → 用户可见部分
6. **阶段八**（合并增强） → 最后完善

建议分 3 个 PR 提交：
- **PR1：** 阶段一 + 阶段二 + 单元测试（纯新增，零风险）
- **PR2：** 阶段三 + 阶段四 + 阶段五（核心改造）
- **PR3：** 阶段六 + 阶段七 + 阶段八（UI + 配置 + 合并增强）
