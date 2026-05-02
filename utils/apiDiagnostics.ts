/**
 * API 诊断工具：纯网络延迟测试、错误类型识别、多端点冗余推荐
 */

import type { 接口供应商类型 } from '../models/system';
import { categorizeModel, type ConfigWithModels, type ModelTier } from './modelCategorizer';
import { 请求模型文本, 通用消息 } from '../services/ai/chatCompletionClient';
import { 推断供应商 } from './apiConfig';

export type ErrorType =
    | 'AUTH_FAILED'
    | 'ENDPOINT_NOT_FOUND'
    | 'RATE_LIMITED'
    | 'SERVICE_UNAVAILABLE'
    | 'TIMEOUT'
    | 'NETWORK_ERROR'
    | 'INVALID_RESPONSE'
    | 'MODEL_NOT_FOUND'
    | 'UNKNOWN';

export interface ErrorClassification {
    type: ErrorType;
    message: string;
    suggestion: string;
}

export interface NetworkLatencyResult {
    ok: boolean;
    latencyMs: number;
    error?: ErrorClassification;
}

export interface EndpointHealth {
    configId: string;
    baseUrl: string;
    provider: 接口供应商类型;
    modelCount: number;
    status: 'healthy' | 'degraded' | 'unavailable';
    latencyMs?: number;
    error?: ErrorClassification;
    models: string[];
}

export interface RedundantAreaAssignment {
    areaLabel: string;
    modelField: string;
    configIdField: string;
    primary: { modelId: string; configId: string; tier: ModelTier } | null;
    fallback: { modelId: string; configId: string; tier: ModelTier } | null;
    tier: ModelTier;
}

export interface RedundantRecommendation {
    areas: RedundantAreaAssignment[];
    endpointHealth: EndpointHealth[];
}

export const FUNCTIONAL_REDUNDANT_AREAS: Array<{
    label: string;
    modelField: string;
    configIdField: string;
    preferredTier: ModelTier;
    fallbackTier: ModelTier;
}> = [
    { label: '主剧情', modelField: '主剧情使用模型', configIdField: '', preferredTier: 'smart', fallbackTier: 'fast' },
    { label: '记忆总结', modelField: '记忆总结使用模型', configIdField: '记忆总结使用配置ID', preferredTier: 'smart', fallbackTier: 'fast' },
    { label: '文章优化', modelField: '文章优化使用模型', configIdField: '文章优化使用配置ID', preferredTier: 'smart', fallbackTier: 'fast' },
    { label: '规划分析', modelField: '规划分析使用模型', configIdField: '规划分析使用配置ID', preferredTier: 'reasoning', fallbackTier: 'smart' },
    { label: '女主规划', modelField: '女主规划使用模型', configIdField: '女主规划使用配置ID', preferredTier: 'reasoning', fallbackTier: 'smart' },
    { label: '变量计算', modelField: '变量计算使用模型', configIdField: '变量计算使用配置ID', preferredTier: 'fast', fallbackTier: 'cheap' },
    { label: '世界演变', modelField: '世界演变使用模型', configIdField: '世界演变使用配置ID', preferredTier: 'fast', fallbackTier: 'cheap' },
    { label: '剧情回忆', modelField: '剧情回忆使用模型', configIdField: '剧情回忆使用配置ID', preferredTier: 'cheap', fallbackTier: 'fast' },
    { label: '小说拆分', modelField: '小说拆分使用模型', configIdField: '', preferredTier: 'cheap', fallbackTier: 'fast' },
    { label: '词组转化器', modelField: '词组转化器使用模型', configIdField: '', preferredTier: 'fast', fallbackTier: 'cheap' },
    { label: 'PNG提炼', modelField: 'PNG提炼使用模型', configIdField: '', preferredTier: 'cheap', fallbackTier: 'fast' },
    { label: '文生图', modelField: '文生图模型使用模型', configIdField: '', preferredTier: 'image', fallbackTier: 'image' },
    { label: '场景生图', modelField: '场景生图模型使用模型', configIdField: '场景生图使用配置ID', preferredTier: 'image', fallbackTier: 'image' },
    { label: '剧情规划', modelField: '剧情规划使用模型', configIdField: '剧情规划使用配置ID', preferredTier: 'smart', fallbackTier: 'fast' },
];

/**
 * 纯网络延迟测试：仅测量 TCP/TLS + HTTP 往返耗时，不包含 AI 推理时间
 * 通过向 /models 端点发送 HEAD 或 GET 请求来测量
 */
export async function testNetworkLatency(baseUrl: string, apiKey: string, timeoutMs: number = 8000): Promise<NetworkLatencyResult> {
    const normalized = baseUrl.replace(/\/+$/, '').replace(/\/v1$/i, '');
    const testUrl = `${normalized}/v1/models`;

    const startedAt = Date.now();
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(testUrl, {
            method: 'HEAD',
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: controller.signal,
        });
        clearTimeout(timer);

        const elapsed = Date.now() - startedAt;

        if (res.ok) {
            return { ok: true, latencyMs: elapsed };
        }
        return { ok: false, latencyMs: elapsed, error: classifyHttpError(res.status, `${res.status} ${res.statusText}`) };
    } catch (error) {
        const elapsed = Date.now() - startedAt;
        return { ok: false, latencyMs: elapsed, error: classifyError(error) };
    }
}

/**
 * 根据错误响应识别错误类型
 */
export function classifyError(error: unknown): ErrorClassification {
    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        // AbortError = timeout
        if (msg.includes('abort') || msg.includes('timed out') || msg.includes('timeout')) {
            return {
                type: 'TIMEOUT',
                message: error.message,
                suggestion: '网络连接超时，请检查网络设置或 API 端点是否可达。',
            };
        }
        // Network errors
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('dns') || msg.includes('connection') || msg.includes('refused')) {
            return {
                type: 'NETWORK_ERROR',
                message: error.message,
                suggestion: '网络连接失败，请检查网络设置。',
            };
        }
        // API-level errors embedded in error message
        if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid api') || msg.includes('invalid_key')) {
            return {
                type: 'AUTH_FAILED',
                message: error.message,
                suggestion: 'API Key 无效或已过期，请检查令牌。',
            };
        }
        // Model errors must be checked before generic "not found"
        if (msg.includes('model') && (msg.includes('not found') || msg.includes('invalid') || msg.includes('does not exist'))) {
            return {
                type: 'MODEL_NOT_FOUND',
                message: error.message,
                suggestion: '模型名称不存在，请检查模型配置。',
            };
        }
        if (msg.includes('404') || msg.includes('not found')) {
            return {
                type: 'ENDPOINT_NOT_FOUND',
                message: error.message,
                suggestion: 'API 端点地址错误，请检查 Base URL。',
            };
        }
        if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')) {
            return {
                type: 'RATE_LIMITED',
                message: error.message,
                suggestion: '请求频率超限，请稍后再试。',
            };
        }
        if (msg.includes('503') || msg.includes('service unavailable') || msg.includes('overloaded')) {
            return {
                type: 'SERVICE_UNAVAILABLE',
                message: error.message,
                suggestion: '服务暂时不可用，请稍后再试。',
            };
        }
    }
    return {
        type: 'UNKNOWN',
        message: typeof error === 'string' ? error : JSON.stringify(error),
        suggestion: '发生未知错误，请检查日志。',
    };
}

/**
 * 根据 HTTP 状态码识别错误类型
 */
export function classifyHttpError(status: number, message: string = ''): ErrorClassification {
    switch (status) {
        case 401:
            return {
                type: 'AUTH_FAILED',
                message,
                suggestion: 'API Key 无效或已过期，请检查令牌。',
            };
        case 403:
            return {
                type: 'AUTH_FAILED',
                message,
                suggestion: '权限不足，请检查 API Key 权限。',
            };
        case 404:
            return {
                type: 'ENDPOINT_NOT_FOUND',
                message,
                suggestion: 'API 端点地址错误，请检查 Base URL。',
            };
        case 429:
            return {
                type: 'RATE_LIMITED',
                message,
                suggestion: '请求频率超限，请稍后再试。',
            };
        case 500:
            return {
                type: 'SERVICE_UNAVAILABLE',
                message,
                suggestion: '服务器内部错误，请稍后再试。',
            };
        case 502:
            return {
                type: 'SERVICE_UNAVAILABLE',
                message,
                suggestion: '网关错误，服务可能暂时不可用。',
            };
        case 503:
            return {
                type: 'SERVICE_UNAVAILABLE',
                message,
                suggestion: '服务暂时不可用，请稍后再试。',
            };
        case 504:
            return {
                type: 'TIMEOUT',
                message,
                suggestion: '网关超时，服务响应过慢。',
            };
        default:
            return {
                type: 'UNKNOWN',
                message,
                suggestion: `HTTP ${status} 错误，请检查 API 端点。`,
            };
    }
}

/**
 * LLM 未知错误分析：将未定义的错误类型交给 LLM 判断
 */

export interface LLMErrorAnalysisOptions {
    assistantBaseUrl: string;
    assistantApiKey: string;
    assistantModel?: string;
    signal?: AbortSignal;
}

export interface ErrorAnalysisContext {
    error: unknown;
    baseUrl?: string;
    endpoint?: string;
    httpStatus?: number;
    rawResponse?: string;
    operationDescription?: string;
}

export interface LLMErrorClassification extends ErrorClassification {
    isLLMAnalyzed: boolean;
    confidence: 'high' | 'medium' | 'low';
}

const ERROR_ANALYSIS_SYSTEM_PROMPT = `你是一个 API 错误诊断助手。请分析给定的错误信息，判断错误类型并提供解决建议。

可识别的错误类型：
- AUTH_FAILED: 认证失败（无效 API Key、过期、权限不足）
- ENDPOINT_NOT_FOUND: 端点不存在（404、URL 错误）
- RATE_LIMITED: 频率限制（429、请求过多）
- SERVICE_UNAVAILABLE: 服务不可用（500/502/503/504、服务器过载）
- TIMEOUT: 超时（请求超时、网关超时）
- NETWORK_ERROR: 网络错误（DNS 失败、连接拒绝、fetch 失败）
- INVALID_RESPONSE: 响应格式无效（JSON 解析失败、缺少必需字段）
- MODEL_NOT_FOUND: 模型不存在
- UNKNOWN: 其他未定义错误

请分析错误信息并输出 JSON 格式：
{"type": "错误类型", "message": "错误描述", "suggestion": "解决建议（中文）", "confidence": "high|medium|low"}

规则：
1. 尽可能匹配已知错误类型，不要随意归类为 UNKNOWN
2. confidence 表示你对判断的置信度：high=非常确定，medium=较确定，low=猜测
3. suggestion 应该具体可操作
4. 只输出 JSON，不要其他内容`;

function makeTempLLMConfig(options: LLMErrorAnalysisOptions) {
    const baseUrl = options.assistantBaseUrl.replace(/\/+$/, '');
    return {
        id: 'temp-error-analysis',
        名称: '错误分析临时配置',
        供应商: 推断供应商(baseUrl),
        baseUrl,
        apiKey: options.assistantApiKey,
        model: options.assistantModel || '',
        maxTokens: 1024,
        temperature: 0.1,
    };
}

/**
 * 使用 LLM 分析未知错误
 * 当 classifyError 返回 UNKNOWN 时，调用此函数让 LLM 判断
 */
export async function analyzeUnknownErrorWithLLM(
    context: ErrorAnalysisContext,
    llmOptions: LLMErrorAnalysisOptions
): Promise<LLMErrorClassification> {
    const { error, baseUrl, endpoint, httpStatus, rawResponse, operationDescription } = context;

    // 构建错误上下文描述
    const errorDetails: string[] = [];
    if (error instanceof Error) {
        errorDetails.push(`错误消息: ${error.message}`);
        if (error.name !== 'Error') errorDetails.push(`错误名称: ${error.name}`);
    } else if (typeof error === 'string') {
        errorDetails.push(`错误消息: ${error}`);
    } else {
        try {
            errorDetails.push(`错误详情: ${JSON.stringify(error)}`);
        } catch {
            errorDetails.push(`错误详情: [无法序列化]`);
        }
    }
    if (baseUrl) errorDetails.push(`Base URL: ${baseUrl}`);
    if (endpoint) errorDetails.push(`请求端点: ${endpoint}`);
    if (httpStatus) errorDetails.push(`HTTP 状态码: ${httpStatus}`);
    if (rawResponse) errorDetails.push(`原始响应: ${rawResponse.slice(0, 2000)}`);
    if (operationDescription) errorDetails.push(`操作描述: ${operationDescription}`);

    const userMessage = `请分析以下 API 错误并判断其类型：\n\n${errorDetails.join('\n')}`;

    const messages: 通用消息[] = [
        { role: 'system', content: ERROR_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
    ];

    const tempConfig = makeTempLLMConfig(llmOptions);

    try {
        const response = await 请求模型文本(tempConfig, messages, {
            temperature: 0.1,
            signal: llmOptions.signal,
            responseFormat: 'json_object',
        });

        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/) || response.match(/(\{[\s\S]*\})/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
        const parsed = JSON.parse(jsonStr) as {
            type?: string;
            message?: string;
            suggestion?: string;
            confidence?: string;
        };

        const validTypes: ErrorType[] = [
            'AUTH_FAILED', 'ENDPOINT_NOT_FOUND', 'RATE_LIMITED', 'SERVICE_UNAVAILABLE',
            'TIMEOUT', 'NETWORK_ERROR', 'INVALID_RESPONSE', 'MODEL_NOT_FOUND', 'UNKNOWN'
        ];
        const inferredType = (validTypes as string[]).includes(parsed.type || '') ? parsed.type as ErrorType : 'UNKNOWN';
        const confidence = parsed.confidence === 'high' || parsed.confidence === 'medium' ? parsed.confidence : 'low';

        return {
            type: inferredType,
            message: parsed.message || (typeof error === 'string' ? error : JSON.stringify(error)),
            suggestion: parsed.suggestion || '发生未知错误，请检查日志。',
            isLLMAnalyzed: true,
            confidence,
        };
    } catch (llmError) {
        // LLM 本身也失败，返回 UNKNOWN 并标记
        const fallback = classifyError(error);
        return {
            ...fallback,
            isLLMAnalyzed: true,
            confidence: 'low' as const,
            message: `${fallback.message} [LLM 分析失败: ${llmError instanceof Error ? llmError.message : '未知'}]`,
        };
    }
}

/**
 * 统一错误分类：先用规则匹配，如果返回 UNKNOWN 则调用 LLM 深度分析
 * @returns 错误分类结果，如果是 LLM 分析的则包含 isLLMAnalyzed 和 confidence 字段
 */
export async function classifyErrorWithLLMFallback(
    error: unknown,
    context: Omit<ErrorAnalysisContext, 'error'>,
    llmOptions: LLMErrorAnalysisOptions
): Promise<LLMErrorClassification> {
    // Step 1: 先用规则匹配
    const ruleResult = classifyError(error);

    // 如果规则能匹配到（不是 UNKNOWN），直接返回
    if (ruleResult.type !== 'UNKNOWN') {
        return {
            ...ruleResult,
            isLLMAnalyzed: false,
            confidence: 'high' as const,
        };
    }

    // Step 2: 规则未匹配，交给 LLM 判断
    return analyzeUnknownErrorWithLLM({ error, ...context }, llmOptions);
}

/**
 * 多端点冗余推荐：为每个功能区返回 [primary, fallback] 多端点列表
 */
export function autoAssignModelsWithRedundancy(
    configs: Array<ConfigWithModels & { health?: EndpointHealth }>
): RedundantRecommendation {
    const tierMap = new Map<ModelTier, Array<{ modelId: string; configId: string }>>();
    for (const cfg of configs) {
        for (const modelId of cfg.models) {
            const { tier } = categorizeModel(modelId);
            if (!tierMap.has(tier)) tierMap.set(tier, []);
            tierMap.get(tier)!.push({ modelId, configId: cfg.id });
        }
    }

    const areas: RedundantAreaAssignment[] = FUNCTIONAL_REDUNDANT_AREAS.map((area) => {
        const pickCandidates = (tier: ModelTier): Array<{ modelId: string; configId: string }> => {
            return tierMap.get(tier) || [];
        };

        let primary: RedundantAreaAssignment['primary'] = null;
        let fallback: RedundantAreaAssignment['fallback'] = null;

        // Image tier: no fallback to text models
        if (area.preferredTier === 'image') {
            const imageModels = pickCandidates('image');
            if (imageModels.length > 0) {
                primary = { modelId: imageModels[0].modelId, configId: imageModels[0].configId, tier: 'image' };
            }
            return { areaLabel: area.label, modelField: area.modelField, configIdField: area.configIdField, primary, fallback: null, tier: 'unknown' };
        }

        // Primary from preferred tier
        const preferred = pickCandidates(area.preferredTier);
        if (preferred.length > 0) {
            primary = { modelId: preferred[0].modelId, configId: preferred[0].configId, tier: area.preferredTier };
        }

        // Fallback from fallback tier
        const fallbackList = pickCandidates(area.fallbackTier);
        if (fallbackList.length > 0) {
            fallback = { modelId: fallbackList[0].modelId, configId: fallbackList[0].configId, tier: area.fallbackTier };
        }

        // If no preferred, use fallback as primary
        if (!primary && fallback) {
            primary = { ...fallback };
        }

        return {
            areaLabel: area.label,
            modelField: area.modelField,
            configIdField: area.configIdField,
            primary,
            fallback,
            tier: primary?.tier ?? 'unknown',
        };
    });

    const endpointHealth: EndpointHealth[] = configs.map((cfg) => ({
        configId: cfg.id,
        baseUrl: cfg.baseUrl,
        provider: cfg.provider as 接口供应商类型,
        modelCount: cfg.models.length,
        status: cfg.health?.status ?? (cfg.models.length > 0 ? 'healthy' : 'unavailable'),
        latencyMs: cfg.health?.latencyMs,
        error: cfg.health?.error,
        models: cfg.models,
    }));

    return { areas, endpointHealth };
}
