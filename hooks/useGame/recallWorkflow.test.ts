import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 执行剧情回忆检索 } from './recallWorkflow';
import * as textAIService from '../../services/ai/text';
import * as apiConfig from '../../utils/apiConfig';
import * as memoryRecall from './memoryRecall';

vi.mock('../../services/ai/text', () => ({
    generateMemoryRecall: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取剧情回忆接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));
vi.mock('../../prompts/runtime/recall', () => ({
    剧情回忆检索COT提示词: '<回忆COT>',
    剧情回忆检索输出格式提示词: '<回忆输出格式>',
    构建剧情回忆检索用户提示词: vi.fn((input: string, corpus: string) => `用户提示词:${input}|${corpus}`),
}));
vi.mock('./memoryRecall', () => ({
    预筛剧情回忆候选: vi.fn(() => []),
    构建剧情回忆检索上下文: vi.fn(() => '<记忆语料>'),
    基于候选生成回忆回退结果: vi.fn(() => ({ strongIds: [], weakIds: [], normalizedText: '强回忆:无\n弱回忆:无' })),
    解析剧情回忆输出: vi.fn(() => ({ strongIds: [], weakIds: [], normalizedText: '强回忆:无\n弱回忆:无' })),
    根据检索结果构建剧情回忆标签: vi.fn((_mem: any, parsed: any) => `<标签:${parsed.normalizedText || ''}>`),
}));
vi.mock('./memoryUtils', () => ({
    规范化记忆系统: vi.fn((m: any) => m || { 短期记忆: [] }),
}));

const mock生成回忆 = vi.mocked(textAIService.generateMemoryRecall);
const mock获取回忆接口配置 = vi.mocked(apiConfig.获取剧情回忆接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);
const mock预筛候选 = vi.mocked(memoryRecall.预筛剧情回忆候选);
const mock构建上下文 = vi.mocked(memoryRecall.构建剧情回忆检索上下文);
const mock生成回退 = vi.mocked(memoryRecall.基于候选生成回忆回退结果);
const mock解析输出 = vi.mocked(memoryRecall.解析剧情回忆输出);

function makeMem(overrides: any = {}) {
    return {
        长期记忆: [],
        短期记忆: ['短期1', '短期2'],
        核心要点: [],
        ...overrides,
    };
}

function makeApiConfig(overrides: any = {}) {
    return {
        剧情回忆API: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' },
        ...overrides,
    };
}

function enableBasicMocks(recallResponse?: string) {
    mock获取回忆接口配置.mockReturnValue({ provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } as any);
    mock接口配置是否可用.mockReturnValue(true);
    mock生成回忆.mockResolvedValue(recallResponse || '{"strong":[],"weak":[]}');
}

describe('执行剧情回忆检索', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('early returns', () => {
        it('returns null when API not configured', async () => {
            mock获取回忆接口配置.mockReturnValue({ provider: 'openai', apiKey: '', baseUrl: '', model: '' } as any);
            mock接口配置是否可用.mockReturnValue(false);
            const result = await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            expect(result).toBeNull();
            expect(mock生成回忆).not.toHaveBeenCalled();
        });
    });

    describe('basic flow', () => {
        it('returns tagContent and previewText', async () => {
            enableBasicMocks();
            mock解析输出.mockReturnValue({ strongIds: ['id1'], weakIds: [], normalizedText: '强回忆:id1\n弱回忆:无' });
            const result = await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            expect(result).not.toBeNull();
            expect(result?.tagContent).toBeDefined();
            expect(result?.previewText).toBe('强回忆:id1\n弱回忆:无');
        });

        it('calls generateMemoryRecall with correct prompts', async () => {
            enableBasicMocks();
            await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            expect(mock生成回忆).toHaveBeenCalled();
            const call = mock生成回忆.mock.calls[0];
            expect(call[0]).toContain('<回忆COT>');
            expect(call[0]).toContain('<回忆输出格式>');
        });
    });

    describe('local candidate fallback', () => {
        it('uses fallback when model returns no ids', async () => {
            enableBasicMocks();
            mock解析输出.mockReturnValue({ strongIds: [], weakIds: [], normalizedText: '强回忆:无\n弱回忆:无' });
            mock生成回退.mockReturnValue({ strongIds: ['local1'], weakIds: [], normalizedText: '强回忆:local1\n弱回忆:无' });
            const result = await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            // When model returns no ids, the code falls back to localFallback
            expect(result?.previewText).toBe('强回忆:local1\n弱回忆:无');
        });

        it('uses fallback when model call throws', async () => {
            enableBasicMocks();
            mock生成回忆.mockRejectedValue(new Error('model timeout'));
            mock生成回退.mockReturnValue({ strongIds: ['local1'], weakIds: [], normalizedText: '强回忆:local1\n弱回忆:无' });
            const result = await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            expect(result?.previewText).toBe('强回忆:local1\n弱回忆:无');
        });

        it('prefers model result when it has strong ids', async () => {
            enableBasicMocks();
            mock解析输出.mockReturnValue({ strongIds: ['model1'], weakIds: [], normalizedText: '强回忆:model1\n弱回忆:无' });
            mock生成回退.mockReturnValue({ strongIds: ['local1'], weakIds: [], normalizedText: '强回忆:local1\n弱回忆:无' });
            const result = await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            expect(result?.previewText).toBe('强回忆:model1\n弱回忆:无');
        });
    });

    describe('streaming mode', () => {
        it('passes onDelta callback when provided', async () => {
            enableBasicMocks();
            const onDelta = vi.fn();
            await 执行剧情回忆检索('player input', makeMem(), makeApiConfig(), { onDelta });
            const call = mock生成回忆.mock.calls[0];
            expect(call[4]).toEqual({
                stream: true,
                onDelta,
            });
        });

        it('passes undefined options when onDelta not provided', async () => {
            enableBasicMocks();
            await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            const call = mock生成回忆.mock.calls[0];
            expect(call[4]).toBeUndefined();
        });
    });

    describe('error handling', () => {
        it('falls back on model failure', async () => {
            enableBasicMocks();
            mock生成回忆.mockRejectedValue(new Error('network error'));
            mock生成回退.mockReturnValue({ strongIds: ['fallback1'], weakIds: [], normalizedText: '强回忆:fallback1\n弱回忆:无' });
            const result = await 执行剧情回忆检索('player input', makeMem(), makeApiConfig());
            expect(result).not.toBeNull();
            expect(result?.previewText).toBe('强回忆:fallback1\n弱回忆:无');
        });
    });

    describe('memory corpus building', () => {
        it('builds corpus from memory system', async () => {
            enableBasicMocks();
            const mem = makeMem({ 短期记忆: ['mem1', 'mem2', 'mem3'] });
            await 执行剧情回忆检索('input', mem, makeApiConfig());
            expect(mock预筛候选).toHaveBeenCalledWith('input', mem, 20);
            expect(mock构建上下文).toHaveBeenCalled();
        });

        it('uses fullN from api config placeholder', async () => {
            enableBasicMocks();
            const apiConfig = makeApiConfig({ 功能模型占位: { 剧情回忆完整原文条数N: 50 } });
            await 执行剧情回忆检索('input', makeMem(), apiConfig);
            expect(mock预筛候选).toHaveBeenCalledWith('input', expect.anything(), 50);
        });
    });

    describe('options', () => {
        it('passes signal when provided', async () => {
            enableBasicMocks();
            const controller = new AbortController();
            await 执行剧情回忆检索('input', makeMem(), makeApiConfig(), { signal: controller.signal });
            const call = mock生成回忆.mock.calls[0];
            expect(call[3]).toBe(controller.signal);
        });

        it('passes extraPrompt when provided', async () => {
            enableBasicMocks();
            await 执行剧情回忆检索('input', makeMem(), makeApiConfig(), { extraPrompt: 'extra context' });
            const call = mock生成回忆.mock.calls[0];
            expect(call[5]).toBe('extra context');
        });

        it('passes cotPseudoHistoryPrompt when provided', async () => {
            enableBasicMocks();
            await 执行剧情回忆检索('input', makeMem(), makeApiConfig(), { cotPseudoHistoryPrompt: '<伪历史>' });
            const call = mock生成回忆.mock.calls[0];
            expect(call[6]).toBe('<伪历史>');
        });
    });
});
