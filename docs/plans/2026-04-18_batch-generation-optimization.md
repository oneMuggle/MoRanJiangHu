# 2026-04-18 批量生图优化 (Batch Generation Optimization)

## 状态
- **创建时间**: 2026-04-18
- **状态**: 已完成
- **优先级**: P1

## 背景

当前生图系统存在以下问题：
1. NPC 生图和场景生图各自独立执行，无统一批处理调度
2. `NPC生图进行中集合` 是单一 Set，同一时间只能处理一个 NPC 生图
3. 队列仅作为记录展示，缺乏后台自动消费机制
4. 失败任务无自动重试和指数退避
5. 批量生成时无法控制并发数，可能导致 API 限流

## 优化目标

1. 实现统一的生图队列调度器，统一处理 NPC 生图和场景生图
2. 支持可配置的最大并发数，避免 API 限流
3. 失败任务自动重试（最多 3 次，指数退避）
4. 队列任务优先级排序（手动 > 自动）
5. 队列暂停/恢复功能

## 实现方案

### 1. 新建 `hooks/useGame/batchImageGenerationWorkflow.ts`

```typescript
// 批量生图工作流
export const 创建批量生图调度器 = (deps: BatchDeps) => {
  // 内部状态
  let 处理中NPC任务 = new Map<string, Promise<void>>();
  let 处理中场景任务 = new Map<string, Promise<void>>();
  let 已暂停 = false;
  
  // 调度逻辑：每次从队列取任务，按优先级排序后执行
  // 维持最大并发数：NPC 任务最多 2 个，场景任务最多 1 个
  // 失败自动重试，指数退避
  
  return {
    启动调度: () => void,
    暂停调度: () => void,
    恢复调度: () => void,
    取消所有任务: () => void,
  };
};
```

### 2. 类型定义扩展

```typescript
// models/imageGeneration.ts 新增
export interface 批量生图配置 {
  最大NPC并发数: number;      // 默认: 2
  最大场景并发数: number;     // 默认: 1
  重试次数: number;           // 默认: 3
  基础重试延迟ms: number;     // 默认: 1000
  启用自动重试: boolean;      // 默认: true
}

export type 任务优先级 = 'high' | 'normal' | 'low';
```

### 3. 调度器依赖注入

```typescript
type BatchDeps = {
  // 状态访问
  获取NPC生图任务队列: () => NPC生图任务记录[];
  获取场景生图任务队列: () => 场景生图任务记录[];
  
  // 状态更新
  设置NPC生图任务队列: (updater: any) => void;
  设置场景生图任务队列: (updater: any) => void;
  
  // 任务执行
  执行NPC生图工作流: typeof 执行NPC生图工作流;
  执行场景生图工作流: typeof 执行场景生图工作流;
  
  // 通知
  推送右下角提示: (toast: Toast) => void;
  
  // 配置
  获取批量生图配置: () => 批量生图配置;
};
```

### 4. 优先级排序规则

1. `manual` 来源 > `retry` 来源 > `auto` 来源
2. 同优先级按创建时间正序（先创建的先处理）
3. 手动触发的高优先级任务立即插入队列头部

### 5. 指数退避策略

```
delay = 基础重试延迟 * 2^(attempt - 1) + jitter
jitter = random(0, 基础重试延迟 / 2)
```

最大延迟上限: 60 秒

## 文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `hooks/useGame/batchImageGenerationWorkflow.ts` | 新建 | 批量生图调度器 |
| `models/imageGeneration.ts` | 修改 | 新增批量生图配置类型 |

## 测试计划

1. 手动添加 5 个 NPC 生图任务到队列，验证按顺序执行
2. 同时添加 NPC 和场景任务，验证并发控制
3. 模拟 API 失败，验证重试机制和退避延迟
4. 测试暂停/恢复功能
5. 验证任务取消后正确清理进行中状态
