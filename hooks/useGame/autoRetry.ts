/** 自动重试系统 */

import type { 游戏设置结构, 聊天记录结构 } from '../../types';
import * as textAIService from '../../services/ai/text';

/** 自动重试最大次数 */
export const 自动重试最大次数 = 3;

/** 替换流式草稿为失败提示 */
export const 替换流式草稿为失败提示 = (history: 聊天记录结构[], errorMessage: string): 聊天记录结构[] => {
    const next = Array.isArray(history) ? [...history] : [];
    const failureText = `【生成失败】${errorMessage || '未知错误'}`;
    for (let i = next.length - 1; i >= 0; i -= 1) {
        const item = next[i];
        if (item?.role === 'assistant' && !item?.structuredResponse) {
            next[i] = {
                ...item,
                content: failureText
            };
            return next;
        }
    }
    return [
        ...next,
        {
            role: 'assistant',
            content: failureText,
            timestamp: Date.now()
        }
    ];
};

/** 更新流式草稿为自动重试提示 */
export const 更新流式草稿为自动重试提示 = (
    history: 聊天记录结构[],
    attempt: number,
    maxAttempts: number,
    reason?: string
): 聊天记录结构[] => {
    const next = Array.isArray(history) ? [...history] : [];
    const retryText = `【自动重试中】第 ${attempt} / ${maxAttempts} 次${reason ? `：${reason}` : ''}`;
    for (let i = next.length - 1; i >= 0; i -= 1) {
        const item = next[i];
        if (item?.role === 'assistant' && !item?.structuredResponse) {
            next[i] = {
                ...item,
                content: retryText
            };
            return next;
        }
    }
    return [
        ...next,
        {
            role: 'assistant',
            content: retryText,
            timestamp: Date.now()
        }
    ];
};

/** 游戏设置启用自动重试 */
export const 游戏设置启用自动重试 = (config?: Partial<游戏设置结构> | null): boolean => {
    return config?.启用自动重试 === true;
};

/** 提取自动重试原因 */
export const 提取自动重试原因 = (error: unknown): string => {
    if (error instanceof textAIService.StoryResponseParseError || (error as any)?.name === 'StoryResponseParseError') {
        return '解析失败，正在重新生成';
    }
    if (typeof (error as any)?.message === 'string' && (error as any).message.trim()) {
        return (error as any).message.trim();
    }
    if (typeof error === 'string' && error.trim()) {
        return error.trim();
    }
    return '请求失败，正在重试';
};

/** 是否可自动重试错误 */
export const 是否可自动重试错误 = (error: unknown): boolean => {
    if (!error) return false;
    if ((error as any)?.name === 'AbortError') return false;
    return error instanceof textAIService.StoryResponseParseError
        || (error as any)?.name === 'StoryResponseParseError'
        || true;
};

/** 执行带自动重试的生成请求 */
export const 执行带自动重试的生成请求 = async <T,>(params: {
    enabled: boolean;
    action: () => Promise<T>;
    onRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
}): Promise<T> => {
    const maxAttempts = params.enabled ? 自动重试最大次数 : 1;
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await params.action();
        } catch (error: unknown) {
            lastError = error;
            if (!params.enabled || attempt >= maxAttempts || !是否可自动重试错误(error)) {
                throw error;
            }
            const reason = 提取自动重试原因(error);
            params.onRetry?.(attempt + 1, maxAttempts, reason);
        }
    }
    throw lastError;
};
