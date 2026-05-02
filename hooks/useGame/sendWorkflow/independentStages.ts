/**
 * sendWorkflow/independentStages.ts
 * 独立阶段类型、工具函数和可重试执行框架
 * 被 index.ts 中的主工作流引用
 */



// ─── 进度类型 ────────────────────────────────────────────────────────────────

export type 回忆检索进度 = {
    phase: 'start' | 'stream' | 'done' | 'error';
    text?: string;
};

export type 正文润色进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

export type 变量生成进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped' | 'cancelled';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

export type 独立阶段标识 = 'polish' | 'world' | 'planning' | 'variable';

export type 独立阶段失败决策 = 'retry' | 'skip';

export type 独立阶段失败决策参数 = {
    stageId: 独立阶段标识;
    stageLabel: string;
    errorText: string;
};

export type 规划分析进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

export type 世界演变进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

// ─── 工具函数 ────────────────────────────────────────────────────────────────

export const 格式化命令展示路径 = (key: string): string =>
    key.replace(/^gameState\./, '');

export const 序列化命令文本 = (cmd: any): string => {
    const action = typeof cmd?.action === 'string' ? cmd.action : 'set';
    const key = 格式化命令展示路径(typeof cmd?.key === 'string' ? cmd.key : '');
    if (action === 'delete') return `${action} ${key}`;
    try {
        return `${action} ${key} = ${JSON.stringify(cmd?.value ?? null)}`;
    } catch {
        return `${action} ${key} = ${String(cmd?.value ?? null)}`;
    }
};

export const 构建带索引命令文本 = (commands: any[], startIndex: number): string[] =>
    (Array.isArray(commands) ? commands : [])
        .map((cmd, index) => {
            const body = 序列化命令文本(cmd);
            return body.trim() ? `[#${startIndex + index}] ${body}` : '';
        })
        .filter(Boolean);

// ─── 可重试独立阶段执行器类型 ─────────────────────────────────────────────────

export type 主剧情发送依赖_独立阶段 = {
    执行带自动重试的生成请求: <T>(params: {
        enabled: boolean;
        action: () => Promise<T>;
        onRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
    }) => Promise<T>;
    提取原始报错详情: (error: any) => string;
    格式化错误详情: (error: any) => string;
};

/**
 * 构建可重试独立阶段执行器
 * 工厂函数，供 index.ts 在创建工作流实例时调用
 */
export const 构建可重试独立阶段执行器 = (
    deps: 主剧情发送依赖_独立阶段,
    独立阶段自动重试已启用: boolean,
    请求独立阶段失败决策: (
        params: 独立阶段失败决策参数
    ) => Promise<独立阶段失败决策>
) => {
    return async <T,>(params: {
        stageId: 独立阶段标识;
        stageLabel: string;
        run: () => Promise<T>;
        beforeAttempt?: (attempt: number) => void;
        onAutoRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
        onError?: (errorText: string) => void;
        onSkip?: (errorText: string) => void;
        getErrorText?: (error: any) => string;
    }): Promise<{ completed: boolean; result?: T }> => {
        let manualAttempt = 0;
        while (true) {
            manualAttempt += 1;
            params.beforeAttempt?.(manualAttempt);
            try {
                const result = await deps.执行带自动重试的生成请求<T>({
                    enabled: 独立阶段自动重试已启用,
                    action: params.run,
                    onRetry: params.onAutoRetry
                });
                return { completed: true, result };
            } catch (error: any) {
                if (error?.name === 'AbortError') {
                    throw error;
                }
                const errorText = params.getErrorText
                    ? params.getErrorText(error)
                    : (
                        deps.提取原始报错详情(error)
                        || deps.格式化错误详情(error)
                        || error?.message
                        || '未知错误'
                    );
                params.onError?.(errorText);
                const decision = await 请求独立阶段失败决策({
                    stageId: params.stageId,
                    stageLabel: params.stageLabel,
                    errorText
                });
                if (decision === 'retry') {
                    continue;
                }
                params.onSkip?.(errorText);
                return { completed: false };
            }
        }
    };
};
