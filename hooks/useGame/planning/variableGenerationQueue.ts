/**
 * 变量生成队列调度器
 * 支持多任务并发处理、优先级排序、重试、进度追踪
 */

import type { 变量模型校准参数, 变量模型校准结果 } from '../planning/variableModelWorkflow';

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

export type 变量生成任务 = {
    id: string;
    type: 变量生成任务类型;
    priority: 变量生成任务优先级;
    status: 变量生成任务状态;
    params: 变量模型校准参数;
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

export type 变量生成队列状态 = {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
    runningTaskIds: string[];
    tasks: 变量生成任务[];
};

type 队列调度器配置 = {
    maxConcurrency: number;
    maxRetries: number;
    retryDelayMs: number;
    completedTaskTTL: number;
};

const 默认配置: 队列调度器配置 = {
    maxConcurrency: 3,
    maxRetries: 2,
    retryDelayMs: 1000,
    completedTaskTTL: 50
};

const 优先级映射: Record<变量生成任务优先级, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3
};

const 创建唯一Id = (): string => {
    return `vq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const 计算重试延迟 = (retryCount: number, baseDelayMs: number): number => {
    const exponentialDelay = baseDelayMs * Math.pow(2, retryCount);
    const jitter = Math.random() * 200;
    return exponentialDelay + jitter;
};

export const 创建变量生成队列调度器 = (
    deps: {
        执行变量模型校准工作流: (params: 变量模型校准参数, options: { apiConfig: any; gameConfig: any }) => Promise<变量模型校准结果 | null>;
        apiConfig: any;
        gameConfig: any;
    },
    config?: Partial<队列调度器配置>
) => {
    const cfg: 队列调度器配置 = { ...默认配置, ...config };

    let pendingQueue: 变量生成任务[] = [];
    const runningTasks: Map<string, 变量生成任务> = new Map();
    const completedTasks: 变量生成任务[] = [];
    const taskCompletionPromises: Map<string, { resolve: (value: 变量模型校准结果 | null) => void; reject: (error: Error) => void }> = new Map();

    // 优先级排序
    const 按优先级排序 = (a: 变量生成任务, b: 变量生成任务): number => {
        const priorityDiff = 优先级映射[a.priority] - 优先级映射[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt - b.createdAt; // FIFO for same priority
    };

    // 入列
    const 入列 = (
        params: 变量模型校准参数,
        options: {
            type?: 变量生成任务类型;
            priority?: 变量生成任务优先级;
            maxRetries?: number;
            onProgress?: (progress: 变量生成进度) => void;
        } = {}
    ): { taskId: string; abort: () => void; resultPromise: Promise<变量模型校准结果 | null> } => {
        const taskId = 创建唯一Id();
        const abortController = new AbortController();

        const task: 变量生成任务 = {
            id: taskId,
            type: options.type || 'turn',
            priority: options.priority || 'normal',
            status: 'pending',
            params,
            retryCount: 0,
            maxRetries: options.maxRetries ?? cfg.maxRetries,
            createdAt: Date.now(),
            abortController,
            onProgress: options.onProgress
        };

        pendingQueue.push(task);
        pendingQueue.sort(按优先级排序);

        // 立即触发排水
        drain();

        // 返回 Promise 用于等待结果
        const resultPromise = new Promise<变量模型校准结果 | null>((resolve, reject) => {
            taskCompletionPromises.set(taskId, { resolve, reject });
        });

        return {
            taskId,
            abort: () => 取消(taskId),
            resultPromise
        };
    };

    // 队列排水 - 尝试启动等待中的任务
    const drain = () => {
        while (runningTasks.size < cfg.maxConcurrency && pendingQueue.length > 0) {
            const task = pendingQueue.shift()!;
            execute(task);
        }
    };

    // 执行单个任务
    const execute = async (task: 变量生成任务): Promise<void> => {
        if (task.status === 'cancelled') return;

        // eslint-disable-next-line no-param-reassign
        task.status = 'running';
        // eslint-disable-next-line no-param-reassign
        task.startedAt = Date.now();
        runningTasks.set(task.id, task);

        task.onProgress?.({ phase: 'start', text: '正在执行变量生成...', taskId: task.id });

        try {
            const result = await deps.执行变量模型校准工作流(task.params, {
                apiConfig: deps.apiConfig,
                gameConfig: deps.gameConfig
            });

            if (task.abortController.signal.aborted) {
                task.onProgress?.({ phase: 'cancelled', text: '已取消本次变量生成。', taskId: task.id });
                完成任务(task, null);
                return;
            }

            if (result && (result.commands.length > 0 || result.reports.length > 0)) {
                // eslint-disable-next-line no-param-reassign
                task.result = result;
                // eslint-disable-next-line no-param-reassign
                task.status = 'completed';
                // eslint-disable-next-line no-param-reassign
                task.completedAt = Date.now();
                task.onProgress?.({
                    phase: 'done',
                    text: `变量生成完成，新增 ${result.commands.length} 条变量命令${result.model ? `（${result.model}）` : ''}`,
                    rawText: result.rawText,
                    taskId: task.id
                });
                完成任务(task, result);
            } else {
                // eslint-disable-next-line no-param-reassign
                task.result = null;
                // eslint-disable-next-line no-param-reassign
                task.status = 'completed';
                // eslint-disable-next-line no-param-reassign
                task.completedAt = Date.now();
                task.onProgress?.({
                    phase: 'done',
                    text: '当前回合未产出额外变量命令，沿用现有变量结果。',
                    rawText: result?.rawText,
                    taskId: task.id
                });
                完成任务(task, null);
            }
        } catch (error: any) {
            if (error?.name === 'AbortError' || task.abortController.signal.aborted) {
                task.onProgress?.({ phase: 'cancelled', text: '已取消本次变量生成。', taskId: task.id });
                完成任务(task, null);
                return;
            }

            // eslint-disable-next-line no-param-reassign
            task.error = error;
            // eslint-disable-next-line no-param-reassign
            task.retryCount += 1;

            if (task.retryCount <= task.maxRetries) {
                // 指数退避重试
                const delay = 计算重试延迟(task.retryCount, cfg.retryDelayMs);
                task.onProgress?.({
                    phase: 'start',
                    text: `变量生成请求失败，正在自动重试（${task.retryCount}/${task.maxRetries}）`,
                    taskId: task.id
                });
                await new Promise<void>((resolve) => setTimeout(resolve, delay));
                // 重新加入队列
                pendingQueue.push(task);
                pendingQueue.sort(按优先级排序);
                drain();
            } else {
                task.status = 'failed';
                task.completedAt = Date.now();
                task.onProgress?.({
                    phase: 'error',
                    text: `变量生成失败：${error?.message || '未知错误'}`,
                    taskId: task.id
                });
                完成任务(task, null);
            }
        }

        // 触发下一个任务
        drain();
    };

    // 完成任务处理
    const 完成任务 = (task: 变量生成任务, result: 变量模型校准结果 | null) => {
        runningTasks.delete(task.id);

        // 保留到已完成列表
        completedTasks.push(task);
        if (completedTasks.length > cfg.completedTaskTTL) {
            completedTasks.shift();
        }

        // 解决 Promise
        const completionHandler = taskCompletionPromises.get(task.id);
        if (completionHandler) {
            if (task.status === 'completed') {
                completionHandler.resolve(result);
            } else {
                completionHandler.reject(task.error || new Error('Task failed'));
            }
            taskCompletionPromises.delete(task.id);
        }
    };

    // 取消指定任务
    const 取消 = (taskId: string): boolean => {
        // 检查等待队列
        const pendingIndex = pendingQueue.findIndex((t) => t.id === taskId);
        if (pendingIndex !== -1) {
            const task = pendingQueue.splice(pendingIndex, 1)[0];
            task.status = 'cancelled';
            task.completedAt = Date.now();
            task.abortController.abort();
            完成任务(task, null);
            return true;
        }

        // 检查运行中任务
        const runningTask = runningTasks.get(taskId);
        if (runningTask) {
            runningTask.status = 'cancelled';
            runningTask.completedAt = Date.now();
            runningTask.abortController.abort();
            完成任务(runningTask, null);
            return true;
        }

        return false;
    };

    // 取消全部任务
    const 取消全部 = () => {
        // 取消所有等待中的任务
        pendingQueue.forEach((task) => {
            task.status = 'cancelled';
            task.completedAt = Date.now();
            task.abortController.abort();
            完成任务(task, null);
        });
        pendingQueue = [];

        // 取消所有运行中的任务
        runningTasks.forEach((task) => {
            task.status = 'cancelled';
            task.completedAt = Date.now();
            task.abortController.abort();
            完成任务(task, null);
        });
    };

    // 获取队列状态快照
    const 获取状态 = (): 变量生成队列状态 => {
        return {
            pending: pendingQueue.length,
            running: runningTasks.size,
            completed: completedTasks.filter((t) => t.status === 'completed').length,
            failed: completedTasks.filter((t) => t.status === 'failed').length,
            cancelled: completedTasks.filter((t) => t.status === 'cancelled').length,
            runningTaskIds: Array.from(runningTasks.keys()),
            tasks: [...pendingQueue, ...Array.from(runningTasks.values()), ...completedTasks]
        };
    };

    // 获取任务详情
    const 获取任务详情 = (taskId: string): 变量生成任务 | undefined => {
        return 获取状态().tasks.find((t) => t.id === taskId);
    };

    // 监听任务完成
    const 监听任务完成 = (taskId: string): Promise<变量模型校准结果 | null> => {
        return new Promise((resolve, reject) => {
            const task = 获取任务详情(taskId);
            if (!task) {
                reject(new Error(`Task ${taskId} not found`));
                return;
            }
            if (task.status === 'completed') {
                resolve(task.result ?? null);
                return;
            }
            if (task.status === 'failed') {
                reject(task.error || new Error('Task failed'));
                return;
            }
            // 等待完成
            const checkInterval = setInterval(() => {
                const currentTask = 获取任务详情(taskId);
                if (!currentTask) {
                    clearInterval(checkInterval);
                    reject(new Error(`Task ${taskId} not found`));
                    return;
                }
                if (currentTask.status === 'completed') {
                    clearInterval(checkInterval);
                    resolve(currentTask.result ?? null);
                    return;
                }
                if (currentTask.status === 'failed') {
                    clearInterval(checkInterval);
                    reject(currentTask.error || new Error('Task failed'));
                }
            }, 100);
        });
    };

    // 检查是否有运行中的任务
    const 有运行中任务 = (): boolean => runningTasks.size > 0;

    // 获取运行中的任务数量
    const 获取运行中数量 = (): number => runningTasks.size;

    // 获取等待中的任务数量
    const 获取等待中数量 = (): number => pendingQueue.length;

    return {
        入列,
        取消,
        取消全部,
        获取状态,
        获取任务详情,
        监听任务完成,
        有运行中任务,
        获取运行中数量,
        获取等待中数量,
        drain
    };
};

export type 变量生成队列调度器 = ReturnType<typeof 创建变量生成队列调度器>;
