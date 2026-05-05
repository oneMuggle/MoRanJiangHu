/** 变量生成队列调度系统 — 优先级队列 + 并发控制器 */

import type { 变量模型校准参数, 变量模型校准结果 } from './variableModelWorkflow';

export type 变量生成任务状态 = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type 变量生成任务优先级 = 'critical' | 'high' | 'normal' | 'low';
export type 变量生成任务类型 = 'opening' | 'turn' | 'reparse' | 'supplement' | 'background';

export type 变量生成进度 = {
    phase: 'start' | 'done' | 'error' | 'cancelled';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
    taskId?: string;
};

type 任务执行器 = (params: 变量模型校准参数, options: { apiConfig: any; gameConfig: any }) => Promise<变量模型校准结果 | null>;

export type 变量生成任务 = {
    id: string;
    type: 变量生成任务类型;
    priority: 变量生成任务优先级;
    status: 变量生成任务状态;
    params: 变量模型校准参数;
    options: { apiConfig: any; gameConfig: any };
    retryCount: number;
    maxRetries: number;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    abortController: AbortController;
    result?: 变量模型校准结果 | null;
    error?: Error;
    onProgress?: (progress: 变量生成进度) => void;
    resolve?: (value: 变量模型校准结果 | null) => void;
    reject?: (reason: Error) => void;
};

type 队列调度器配置 = {
    maxConcurrency?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    completedTaskTTL?: number;
    maxRequestsPerMinute?: number;
};

export type 队列快照 = {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    runningTaskIds: string[];
    tasks: 变量生成任务[];
};

const 优先级权重: Record<变量生成任务优先级, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3
};

const 生成任务ID = (() => {
    let counter = 0;
    return () => `vgq-${Date.now()}-${++counter}`;
})();

const 比较任务优先级 = (a: 变量生成任务, b: 变量生成任务): number => {
    const priorityDiff = 优先级权重[a.priority] - 优先级权重[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.createdAt - b.createdAt;
};

export const 创建变量生成队列调度器 = (
    deps: { 执行器: 任务执行器 },
    config: 队列调度器配置 = {}
) => {
    const maxConcurrency = config.maxConcurrency ?? 3;
    const maxRetries = config.maxRetries ?? 2;
    const retryDelayMs = config.retryDelayMs ?? 1000;
    const completedTaskTTL = config.completedTaskTTL ?? 50;
    const maxRequestsPerMinute = config.maxRequestsPerMinute ?? 30;

    const pendingQueue: 变量生成任务[] = [];
    const runningTasks = new Map<string, 变量生成任务>();
    const completedTasks: 变量生成任务[] = [];
    const failedTasks: 变量生成任务[] = [];

    const requestTimestamps: number[] = [];
    const 检查速率限制 = (): number => {
        const now = Date.now();
        const windowStart = now - 60_000;
        while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
            requestTimestamps.shift();
        }
        if (requestTimestamps.length >= maxRequestsPerMinute) {
            const oldestInWindow = requestTimestamps[0];
            return oldestInWindow + 60_000 - now;
        }
        return 0;
    };

    const 记录请求 = () => {
        requestTimestamps.push(Date.now());
    };

    const 等待 = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    const 清理过期任务 = () => {
        if (completedTasks.length > completedTaskTTL) {
            completedTasks.splice(0, completedTasks.length - completedTaskTTL);
        }
    };

    const 入列 = (
        params: 变量模型校准参数,
        options: { apiConfig: any; gameConfig: any },
        taskOptions?: {
            type?: 变量生成任务类型;
            priority?: 变量生成任务优先级;
            maxRetries?: number;
            onProgress?: (progress: 变量生成进度) => void;
        }
    ): { taskId: string; abort: () => void; result: Promise<变量模型校准结果 | null> } => {
        const taskId = 生成任务ID();
        const abortController = new AbortController();

        const task: 变量生成任务 = {
            id: taskId,
            type: taskOptions?.type ?? 'turn',
            priority: taskOptions?.priority ?? 'normal',
            status: 'pending',
            params,
            options,
            retryCount: 0,
            maxRetries: taskOptions?.maxRetries ?? maxRetries,
            createdAt: Date.now(),
            abortController,
            onProgress: taskOptions?.onProgress
        };

        const resultPromise = new Promise<变量模型校准结果 | null>((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
        });

        pendingQueue.push(task);
        pendingQueue.sort(比较任务优先级);

        drain();

        return {
            taskId,
            abort: () => 取消(taskId),
            result: resultPromise
        };
    };

    const 取消 = (taskId: string) => {
        const pendingIndex = pendingQueue.findIndex((t) => t.id === taskId);
        if (pendingIndex !== -1) {
            const task = pendingQueue.splice(pendingIndex, 1)[0];
            task.status = 'cancelled';
            task.reject?.(new DOMException('任务已取消', 'AbortError'));
            return;
        }

        const runningTask = runningTasks.get(taskId);
        if (runningTask) {
            runningTask.abortController.abort();
            return;
        }
    };

    const 取消全部 = () => {
        pendingQueue.splice(0, pendingQueue.length).forEach((task) => {
            task.status = 'cancelled';
            task.reject?.(new DOMException('全部任务已取消', 'AbortError'));
        });
        runningTasks.forEach((task) => {
            task.abortController.abort();
        });
    };

    const 获取状态 = (): 队列快照 => ({
        pending: pendingQueue.length,
        running: runningTasks.size,
        completed: completedTasks.length,
        failed: failedTasks.length,
        runningTaskIds: Array.from(runningTasks.keys()),
        tasks: [...pendingQueue, ...runningTasks.values(), ...completedTasks, ...failedTasks]
    });

    const 执行任务 = async (task: 变量生成任务) => {
        if (task.abortController.signal.aborted) {
            task.status = 'cancelled';
            task.reject?.(new DOMException('任务已取消', 'AbortError'));
            drain();
            return;
        }

        const rateLimitDelay = 检查速率限制();
        if (rateLimitDelay > 0) {
            task.onProgress?.({ phase: 'start', text: `速率限制中，等待 ${Math.ceil(rateLimitDelay / 1000)}s...`, taskId: task.id });
            await 等待(rateLimitDelay);
        }

        runningTasks.set(task.id, task);
        task.status = 'running';
        task.startedAt = Date.now();
        记录请求();

        task.onProgress?.({ phase: 'start', text: '正在执行变量生成...', taskId: task.id });

        try {
            task.params = { ...task.params, signal: task.abortController.signal };
            const result = await deps.执行器(task.params, task.options);

            if (task.abortController.signal.aborted) {
                task.status = 'cancelled';
                task.onProgress?.({ phase: 'cancelled', text: '已取消本次变量生成。', taskId: task.id });
                task.reject?.(new DOMException('任务已取消', 'AbortError'));
                return;
            }

            task.result = result;
            task.status = 'completed';
            task.completedAt = Date.now();
            completedTasks.push(task);
            清理过期任务();

            task.onProgress?.({
                phase: 'done',
                text: result && (result.commands.length > 0 || result.reports.length > 0)
                    ? `变量生成完成，产出 ${result.commands.length} 条命令`
                    : '当前回合未产出额外变量命令',
                rawText: result?.rawText,
                taskId: task.id
            });

            task.resolve?.(result);
        } catch (error: any) {
            if (error?.name === 'AbortError' || task.abortController.signal.aborted) {
                task.status = 'cancelled';
                task.onProgress?.({ phase: 'cancelled', text: '已取消本次变量生成。', taskId: task.id });
                task.reject?.(new DOMException('任务已取消', 'AbortError'));
                return;
            }

            task.error = error instanceof Error ? error : new Error(String(error));

            if (task.retryCount < task.maxRetries) {
                task.retryCount += 1;
                const delay = retryDelayMs * Math.pow(2, task.retryCount - 1) + Math.random() * 200;
                task.status = 'pending';
                task.onProgress?.({ phase: 'start', text: `第 ${task.retryCount} 次重试，等待 ${Math.ceil(delay / 1000)}s...`, taskId: task.id });
                await 等待(delay);
                pendingQueue.push(task);
                pendingQueue.sort(比较任务优先级);
            } else {
                task.status = 'failed';
                task.completedAt = Date.now();
                failedTasks.push(task);

                task.onProgress?.({
                    phase: 'error',
                    text: `变量生成失败: ${task.error.message}`,
                    taskId: task.id
                });

                task.reject?.(task.error);
            }
        } finally {
            runningTasks.delete(task.id);
            drain();
        }
    };

    const drain = () => {
        while (pendingQueue.length > 0 && runningTasks.size < maxConcurrency) {
            const task = pendingQueue.shift()!;
            执行任务(task);
        }
    };

    return {
        入列,
        取消,
        取消全部,
        获取状态
    };
};
