/**
 * API Failover — automatic fallback to alternative endpoints when the primary fails.
 * Wraps 请求模型文本 with multi-config retry logic.
 */

import { 请求模型文本, 通用消息, 通用流式选项, 响应格式类型 } from '../services/ai/chatCompletionClient';
import type { 当前可用接口结构 } from './apiConfig';
import type { 接口设置结构 } from '../models/system';

export type FailoverResult = {
    response: string;
    usedConfig: 当前可用接口结构;
    attempts: number;
};

export class 所有配置均失败错误 extends Error {
    attemptDetails: Array<{ configId: string; baseUrl: string; error: string }>;

    constructor(message: string, attempts: Array<{ configId: string; baseUrl: string; error: string }>) {
        super(message);
        this.name = '所有配置均失败错误';
        this.attemptDetails = attempts;
    }
}

export async function 请求带故障切换(
    settings: 接口设置结构,
    primaryConfig: 当前可用接口结构 | null,
    messages: 通用消息[],
    options: {
        temperature: number;
        signal?: AbortSignal;
        streamOptions?: 通用流式选项;
        responseFormat?: 响应格式类型;
        errorDetailLimit?: number;
    }
): Promise<FailoverResult> {
    const candidates: 当前可用接口结构[] = [];
    const seenIds = new Set<string>();

    if (primaryConfig?.id) {
        candidates.push(primaryConfig);
        seenIds.add(primaryConfig.id);
    }

    for (const cfg of (settings.configs || [])) {
        if (!seenIds.has(cfg.id) && cfg.baseUrl && cfg.apiKey) {
            seenIds.add(cfg.id);
            candidates.push({
                id: cfg.id,
                名称: cfg.名称,
                供应商: cfg.供应商,
                baseUrl: cfg.baseUrl,
                apiKey: cfg.apiKey,
                model: cfg.model || primaryConfig?.model || '',
                maxTokens: cfg.maxTokens,
                temperature: cfg.temperature,
            });
        }
    }

    if (candidates.length === 0) {
        throw new Error('没有可用的 API 配置。请先在接口连接中添加配置。');
    }

    const attemptDetails: Array<{ configId: string; baseUrl: string; error: string }> = [];

    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        try {
            const response = await 请求模型文本(candidate, messages, {
                ...options,
            });

            return {
                response,
                usedConfig: candidate,
                attempts: i + 1,
            };
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            attemptDetails.push({ configId: candidate.id, baseUrl: candidate.baseUrl, error: msg });

            if (options.signal?.aborted) {
                throw error;
            }

            if (i < candidates.length - 1) {
                console.warn(`[API故障切换] ${candidate.名称} (${candidate.baseUrl}) 失败，切换到下一个配置`);
            }
        }
    }

    throw new 所有配置均失败错误(
        `所有 ${candidates.length} 个 API 配置均失败。`,
        attemptDetails
    );
}
