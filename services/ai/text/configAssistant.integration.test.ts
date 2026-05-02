import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock 请求模型文本 — 默认行为可在个别测试中覆盖
const mock请求模型文本 = vi.fn().mockRejectedValue(new Error('LLM unavailable'));

vi.mock('../chatCompletionClient', () => ({
    请求模型文本: () => mock请求模型文本(),
}));

import { testAndFetchModels } from './configAssistant';

describe('testAndFetchModels — 集成测试', () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        vi.useFakeTimers();
        mock请求模型文本.mockReset();
        mock请求模型文本.mockRejectedValue(new Error('LLM unavailable'));
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.useRealTimers();
    });

    it('正常端点返回模型列表', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                data: [
                    { id: 'gpt-4o' },
                    { id: 'gpt-4o-mini' },
                    { id: 'dall-e-3' },
                ]
            })
        });

        const result = await testAndFetchModels({
            baseUrl: 'https://api.openai.com/v1',
            apiKey: 'sk-test-key',
        });

        expect(result.models).toContain('gpt-4o');
        expect(result.models).toContain('gpt-4o-mini');
        expect(result.provider).toBe('openai');
    });

    it('/v1/models 404 时回退到 /models', async () => {
        globalThis.fetch = vi.fn().mockImplementation((url: string) => {
            if (url.includes('/v1/models')) {
                return Promise.resolve({ ok: false, status: 404 });
            }
            if (url.includes('/models')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ id: 'test-model' }] })
                });
            }
            return Promise.reject(new Error('Not found'));
        });

        const result = await testAndFetchModels({
            baseUrl: 'https://api.example.com/v1',
            apiKey: 'sk-test',
        });

        expect(result.models).toContain('test-model');
    });

    it('所有端点失败时回退到聊天补全测试', async () => {
        // 模型列表请求全部返回 503
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
        // fallbackChatTest 中 请求模型文本 也失败
        mock请求模型文本.mockRejectedValue(new Error('Service unavailable'));

        await expect(testAndFetchModels({
            baseUrl: 'https://api.unavailable.com/v1',
            apiKey: 'sk-test',
        })).rejects.toThrow('连接测试失败');
    });

    it('API Key 无效（401）', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });

        await expect(testAndFetchModels({
            baseUrl: 'https://api.openai.com/v1',
            apiKey: 'sk-invalid-key',
        })).rejects.toThrow();
    });

    it('网络超时', async () => {
        vi.useRealTimers();

        globalThis.fetch = vi.fn().mockImplementation(() => {
            return new Promise((_, reject) => {
                setTimeout(() => reject(new Error('AbortError: timeout')), 50);
            });
        });

        await expect(testAndFetchModels({
            baseUrl: 'https://api.slow.com/v1',
            apiKey: 'sk-test',
        })).rejects.toThrow();
    }, 30000);

    it('响应中 data.data 为空数组时回退到聊天补全', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: [] })
        });

        await expect(testAndFetchModels({
            baseUrl: 'https://api.empty.com/v1',
            apiKey: 'sk-test',
        })).rejects.toThrow();
    });
});
