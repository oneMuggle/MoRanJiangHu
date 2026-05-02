import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
    classifyError,
    classifyHttpError,
    testNetworkLatency,
    autoAssignModelsWithRedundancy,
    analyzeUnknownErrorWithLLM,
    classifyErrorWithLLMFallback,
} from './apiDiagnostics';
import type { ConfigWithModels } from './modelCategorizer';

// Mock LLM client — must be hoisted by vi.mock
const mockLLM = vi.fn();
vi.mock('../services/ai/chatCompletionClient', () => ({
    请求模型文本: (...args: unknown[]) => mockLLM(...args),
}));

describe('classifyError', () => {
    it('识别超时错误', () => {
        const e1 = new Error('The operation was aborted due to timeout');
        expect(classifyError(e1).type).toBe('TIMEOUT');

        const e2 = new Error('AbortError: timeout');
        expect(classifyError(e2).type).toBe('TIMEOUT');

        const e3 = new Error('Request timed out');
        expect(classifyError(e3).type).toBe('TIMEOUT');
    });

    it('识别网络错误', () => {
        const e1 = new Error('fetch failed');
        expect(classifyError(e1).type).toBe('NETWORK_ERROR');

        const e2 = new Error('Network error: connection refused');
        expect(classifyError(e2).type).toBe('NETWORK_ERROR');

        const e3 = new Error('DNS lookup failed');
        expect(classifyError(e3).type).toBe('NETWORK_ERROR');
    });

    it('识别认证失败', () => {
        const e1 = new Error('401 Unauthorized');
        expect(classifyError(e1).type).toBe('AUTH_FAILED');

        const e2 = new Error('Invalid API key provided');
        expect(classifyError(e2).type).toBe('AUTH_FAILED');

        const e3 = new Error('invalid_key');
        expect(classifyError(e3).type).toBe('AUTH_FAILED');
    });

    it('识别端点不存在', () => {
        const e = new Error('404 Not Found');
        expect(classifyError(e).type).toBe('ENDPOINT_NOT_FOUND');
    });

    it('识别频率限制', () => {
        const e1 = new Error('429 Too Many Requests');
        expect(classifyError(e1).type).toBe('RATE_LIMITED');

        const e2 = new Error('Rate limit exceeded');
        expect(classifyError(e2).type).toBe('RATE_LIMITED');
    });

    it('识别服务不可用', () => {
        const e1 = new Error('503 Service Unavailable');
        expect(classifyError(e1).type).toBe('SERVICE_UNAVAILABLE');

        const e2 = new Error('Server overloaded');
        expect(classifyError(e2).type).toBe('SERVICE_UNAVAILABLE');
    });

    it('识别模型不存在', () => {
        const e = new Error('Model not found: gpt-99');
        expect(classifyError(e).type).toBe('MODEL_NOT_FOUND');
    });

    it('未知错误返回 UNKNOWN', () => {
        const e1 = new Error('Some random error');
        expect(classifyError(e1).type).toBe('UNKNOWN');

        const e2 = 42;
        expect(classifyError(e2).type).toBe('UNKNOWN');

        const e3 = { code: 'ERR' };
        expect(classifyError(e3).type).toBe('UNKNOWN');
    });

    it('包含建议信息', () => {
        const result = classifyError(new Error('401 Unauthorized'));
        expect(result.suggestion).toContain('API Key');
        expect(result.message).toBe('401 Unauthorized');
    });
});

describe('classifyHttpError', () => {
    const testCases: Array<{ status: number; expected: string }> = [
        { status: 401, expected: 'AUTH_FAILED' },
        { status: 403, expected: 'AUTH_FAILED' },
        { status: 404, expected: 'ENDPOINT_NOT_FOUND' },
        { status: 429, expected: 'RATE_LIMITED' },
        { status: 500, expected: 'SERVICE_UNAVAILABLE' },
        { status: 502, expected: 'SERVICE_UNAVAILABLE' },
        { status: 503, expected: 'SERVICE_UNAVAILABLE' },
        { status: 504, expected: 'TIMEOUT' },
        { status: 418, expected: 'UNKNOWN' },
    ];

    testCases.forEach(({ status, expected }) => {
        it(`HTTP ${status} -> ${expected}`, () => {
            expect(classifyHttpError(status).type).toBe(expected);
        });
    });

    it('包含消息和建议', () => {
        const result = classifyHttpError(429, 'Rate limit hit');
        expect(result.message).toBe('Rate limit hit');
        expect(result.suggestion).toContain('稍后再试');
    });
});

describe('testNetworkLatency', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    it('成功测量延迟', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });

        const result = await testNetworkLatency('https://api.example.com/v1', 'sk-test');

        expect(result.ok).toBe(true);
        expect(result.latencyMs).toBeGreaterThanOrEqual(0);
        expect(result.error).toBeUndefined();
    });

    it('去除 baseUrl 末尾斜杠和 /v1', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

        await testNetworkLatency('https://api.example.com/v1///', 'sk-test');

        expect(globalThis.fetch).toHaveBeenCalledWith(
            'https://api.example.com/v1/models',
            expect.any(Object)
        );
    });

    it('HEAD 请求携带 Authorization', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });

        await testNetworkLatency('https://api.example.com/v1', 'sk-secret-key');

        const callArgs = vi.mocked(globalThis.fetch).mock.calls[0];
        expect(callArgs[1]?.method).toBe('HEAD');
        expect((callArgs[1]?.headers as Record<string, string>).Authorization).toBe('Bearer sk-secret-key');
    });

    it('非 2xx 返回错误分类', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, statusText: 'Unauthorized' });

        const result = await testNetworkLatency('https://api.example.com/v1', 'sk-bad');

        expect(result.ok).toBe(false);
        expect(result.error?.type).toBe('AUTH_FAILED');
        expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('网络异常返回错误分类', async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('fetch failed'));

        const result = await testNetworkLatency('https://api.example.com/v1', 'sk-test');

        expect(result.ok).toBe(false);
        expect(result.error?.type).toBe('NETWORK_ERROR');
    });
});

describe('autoAssignModelsWithRedundancy', () => {
    const 构建配置 = (models: string[], id: string = 'cfg_1'): ConfigWithModels => ({
        id,
        baseUrl: 'https://api.example.com/v1',
        apiKey: 'sk-test',
        provider: 'openai',
        models,
    });

    it('单配置含 smart + fast 时主剧情有 primary 和 fallback', () => {
        const configs = [构建配置(['gpt-4o', 'gpt-4o-mini'])];
        const result = autoAssignModelsWithRedundancy(configs);

        const mainStory = result.areas.find(a => a.areaLabel === '主剧情');
        expect(mainStory?.primary?.modelId).toBe('gpt-4o');
        expect(mainStory?.fallback?.modelId).toBe('gpt-4o-mini');
    });

    it('规划分析优先 reasoning，fallback 到 smart', () => {
        const configs = [构建配置(['o1', 'gpt-4o', 'gpt-4o-mini'])];
        const result = autoAssignModelsWithRedundancy(configs);

        const planning = result.areas.find(a => a.areaLabel === '规划分析');
        expect(planning?.primary?.modelId).toBe('o1');
        expect(planning?.fallback?.modelId).toBe('gpt-4o');
    });

    it('仅含 image 模型时非 image 功能区返回 null', () => {
        const configs = [构建配置(['dall-e-3'])];
        const result = autoAssignModelsWithRedundancy(configs);

        const mainStory = result.areas.find(a => a.areaLabel === '主剧情');
        expect(mainStory?.primary).toBeNull();
        expect(mainStory?.fallback).toBeNull();
    });

    it('image 功能区只使用 image-tier 模型', () => {
        const configs = [构建配置(['gpt-4o', 'dall-e-3'])];
        const result = autoAssignModelsWithRedundancy(configs);

        const textToImage = result.areas.find(a => a.areaLabel === '文生图');
        expect(textToImage?.primary?.modelId).toBe('dall-e-3');
        expect(textToImage?.primary?.tier).toBe('image');
        expect(textToImage?.fallback).toBeNull();
    });

    it('空配置数组返回全 null areas', () => {
        const result = autoAssignModelsWithRedundancy([]);

        expect(result.areas.length).toBeGreaterThan(0);
        expect(result.areas.every(a => a.primary === null)).toBe(true);
        expect(result.endpointHealth).toHaveLength(0);
    });

    it('多配置时选择最优模型', () => {
        const configs = [
            { ...构建配置(['gpt-4o'], 'cfg_smart'), health: { configId: 'cfg_smart', baseUrl: 'https://api.smart.com/v1', provider: 'openai' as const, modelCount: 1, status: 'healthy' as const, latencyMs: 50, models: ['gpt-4o'] } },
            { ...构建配置(['gemini-2.0-flash'], 'cfg_fast'), health: { configId: 'cfg_fast', baseUrl: 'https://api.fast.com/v1', provider: 'openai' as const, modelCount: 1, status: 'degraded' as const, latencyMs: 200, models: ['gemini-2.0-flash'] } },
        ];
        const result = autoAssignModelsWithRedundancy(configs);

        const mainStory = result.areas.find(a => a.areaLabel === '主剧情');
        expect(mainStory?.primary?.configId).toBe('cfg_smart');

        const health = result.endpointHealth.find(e => e.configId === 'cfg_smart');
        expect(health?.status).toBe('healthy');
        expect(health?.latencyMs).toBe(50);
    });

    it('无 preferred 但有 fallback tier 时使用 fallback 作为 primary', () => {
        const configs = [构建配置(['gpt-3.5-turbo'])];
        const result = autoAssignModelsWithRedundancy(configs);

        const variableCalc = result.areas.find(a => a.areaLabel === '变量计算');
        expect(variableCalc?.primary?.modelId).toBe('gpt-3.5-turbo');
    });

    it('endpointHealth 反映配置健康状态', () => {
        const configs = [
            { ...构建配置(['gpt-4o'], 'cfg_1'), health: undefined },
        ];
        const result = autoAssignModelsWithRedundancy(configs);

        expect(result.endpointHealth).toHaveLength(1);
        expect(result.endpointHealth[0].configId).toBe('cfg_1');
        expect(result.endpointHealth[0].status).toBe('healthy');
        expect(result.endpointHealth[0].models).toContain('gpt-4o');
    });

    it('无模型的配置标记为 unavailable', () => {
        const configs = [构建配置([], 'cfg_empty')];
        const result = autoAssignModelsWithRedundancy(configs);

        expect(result.endpointHealth[0].status).toBe('unavailable');
    });
});

describe('analyzeUnknownErrorWithLLM', () => {
    beforeEach(() => {
        mockLLM.mockReset();
    });

    const llmOptions = {
        assistantBaseUrl: 'https://api.openai.com/v1',
        assistantApiKey: 'sk-test',
    };

    it('LLM 成功分析未知错误', async () => {
        mockLLM.mockResolvedValue(JSON.stringify({
            type: 'INVALID_RESPONSE',
            message: '响应格式无效，缺少 data 字段',
            suggestion: '检查 API 响应格式是否符合 OpenAI 规范',
            confidence: 'high'
        }));

        const result = await analyzeUnknownErrorWithLLM(
            { error: new Error('Unexpected token < in JSON') },
            llmOptions
        );

        expect(result.isLLMAnalyzed).toBe(true);
        expect(result.confidence).toBe('high');
        expect(result.type).toBe('INVALID_RESPONSE');
        expect(result.message).toContain('响应格式无效');
        expect(result.suggestion).toContain('API 响应格式');
    });

    it('LLM 返回无效类型时回退到 UNKNOWN', async () => {
        mockLLM.mockResolvedValue(JSON.stringify({
            type: 'SOME_MADE_UP_TYPE',
            message: 'some error',
            suggestion: 'fix it',
            confidence: 'high'
        }));

        const result = await analyzeUnknownErrorWithLLM(
            { error: new Error('some error') },
            llmOptions
        );

        expect(result.type).toBe('UNKNOWN');
    });

    it('LLM 本身失败时返回降级结果', async () => {
        mockLLM.mockRejectedValue(new Error('LLM service down'));

        const result = await analyzeUnknownErrorWithLLM(
            { error: new Error('Unknown weird error') },
            llmOptions
        );

        expect(result.isLLMAnalyzed).toBe(true);
        expect(result.confidence).toBe('low');
        expect(result.message).toContain('LLM 分析失败');
    });

    it('包含完整上下文信息', async () => {
        mockLLM.mockResolvedValue(JSON.stringify({
            type: 'RATE_LIMITED',
            message: 'Request rate exceeded',
            suggestion: '降低请求频率',
            confidence: 'medium'
        }));

        await analyzeUnknownErrorWithLLM({
            error: new Error('429 too many requests'),
            baseUrl: 'https://api.example.com/v1',
            endpoint: '/v1/chat/completions',
            httpStatus: 429,
            rawResponse: '{"error": "rate limit"}',
            operationDescription: '测试模型列表',
        }, llmOptions);

        const callArgs = mockLLM.mock.calls[0];
        const messages = callArgs[1] as Array<{ role: string; content: string }>;
        const userMessage = messages[1].content;
        expect(userMessage).toContain('api.example.com');
        expect(userMessage).toContain('/v1/chat/completions');
        expect(userMessage).toContain('429');
        expect(userMessage).toContain('rate limit');
        expect(userMessage).toContain('测试模型列表');
    });

    it('LLM 返回中等置信度', async () => {
        mockLLM.mockResolvedValue(JSON.stringify({
            type: 'SERVICE_UNAVAILABLE',
            message: 'Service busy',
            suggestion: '稍后重试',
            confidence: 'medium'
        }));

        const result = await analyzeUnknownErrorWithLLM(
            { error: new Error('Service busy') },
            llmOptions
        );

        expect(result.confidence).toBe('medium');
    });

    it('LLM 返回低等置信度（默认）', async () => {
        mockLLM.mockResolvedValue(JSON.stringify({
            type: 'UNKNOWN',
            message: 'weird error',
            suggestion: 'check logs'
            // no confidence field
        }));

        const result = await analyzeUnknownErrorWithLLM(
            { error: new Error('weird error') },
            llmOptions
        );

        expect(result.confidence).toBe('low');
    });
});

describe('classifyErrorWithLLMFallback', () => {
    beforeEach(() => {
        mockLLM.mockReset();
    });

    const llmOptions = {
        assistantBaseUrl: 'https://api.openai.com/v1',
        assistantApiKey: 'sk-test',
    };

    it('规则能匹配时不调用 LLM', async () => {
        const result = await classifyErrorWithLLMFallback(
            new Error('401 Unauthorized'),
            { baseUrl: 'https://api.example.com/v1' },
            llmOptions
        );

        expect(result.isLLMAnalyzed).toBe(false);
        expect(result.confidence).toBe('high');
        expect(result.type).toBe('AUTH_FAILED');
        expect(mockLLM).not.toHaveBeenCalled();
    });

    it('规则不匹配时调用 LLM', async () => {
        mockLLM.mockResolvedValue(JSON.stringify({
            type: 'INVALID_RESPONSE',
            message: 'JSON parse error',
            suggestion: '检查响应格式',
            confidence: 'high'
        }));

        const result = await classifyErrorWithLLMFallback(
            new Error('Unexpected token < in JSON'),
            { baseUrl: 'https://api.example.com/v1' },
            llmOptions
        );

        expect(result.isLLMAnalyzed).toBe(true);
        expect(result.type).toBe('INVALID_RESPONSE');
        expect(mockLLM).toHaveBeenCalled();
    });

    it('LLM 也失败时返回 UNKNOWN 并标记', async () => {
        mockLLM.mockRejectedValue(new Error('LLM down'));

        const result = await classifyErrorWithLLMFallback(
            new Error('very weird error'),
            { baseUrl: 'https://api.example.com/v1' },
            llmOptions
        );

        expect(result.isLLMAnalyzed).toBe(true);
        expect(result.confidence).toBe('low');
        expect(result.type).toBe('UNKNOWN');
    });
});
