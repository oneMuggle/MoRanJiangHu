import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as textAIService from '../../services/ai/text';
import * as apiConfig from '../../utils/apiConfig';
import * as gameSettings from '../../utils/gameSettings';
import { 执行正文润色 } from './bodyPolish';

vi.mock('../../services/ai/text', () => ({
    generatePolishedBody: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取文章优化接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));
vi.mock('../../utils/gameSettings', () => ({
    规范化游戏设置: vi.fn(),
}));

const mockGeneratePolishedBody = vi.mocked(textAIService.generatePolishedBody);
const mock获取文章优化接口配置 = vi.mocked(apiConfig.获取文章优化接口配置);
const mock接口配置是否可用 = vi.mocked(apiConfig.接口配置是否可用);
const mock规范化游戏设置 = vi.mocked(gameSettings.规范化游戏设置);

function makeDeps(overrides: any = {}) {
    return {
        apiConfig: {} as any,
        gameConfig: { 剧情风格: '写实', 叙事人称: '第三人称', 字数要求: 450 } as any,
        prompts: [{ id: 'core_format', 内容: '## 2. 正文结构与叙事约束（硬约束 + 质量约束）\nSome format rules\n## 3. Other' }] as any[],
        环境: { 当前时辰: { 年: 2026, 月: 4, 日: 30 }, 当前地点: '长安' } as any,
        剧情: { 当前章节: { 标题: '第一章' } } as any,
        社交: [{ 姓名: '张三', 是否在场: true }] as any[],
        战斗: {} as any,
        角色: { 姓名: '李四' } as any,
        文章优化已开启: true,
        深拷贝: <T>(data: T) => JSON.parse(JSON.stringify(data)),
        ...overrides,
    };
}

function makeBaseResponse(overrides: any = {}) {
    return {
        logs: [{ sender: '旁白', text: 'Original body text' }],
        body_original_logs: [],
        ...overrides,
    } as any;
}

beforeEach(() => {
    vi.resetAllMocks();
    mock获取文章优化接口配置.mockReturnValue({ model: 'gpt-4o', apiKey: 'key', baseUrl: 'url' } as any);
    mock接口配置是否可用.mockReturnValue(true);
    mock规范化游戏设置.mockReturnValue({ 剧情风格: '写实', 叙事人称: '第三人称', 字数要求: 450 } as any);
    mockGeneratePolishedBody.mockResolvedValue({
        bodyText: '【旁白】Polished body text',
        rawText: '<thinking>...</thinking><正文>【旁白】Polished body text</正文>',
    } as any);
});

describe('执行正文润色', () => {
    it('returns applied: false when polish disabled', async () => {
        const deps = makeDeps({ 文章优化已开启: false });
        const result = await 执行正文润色(makeBaseResponse(), '', deps);
        expect(result.applied).toBe(false);
        expect(result.error).toContain('文章优化已关闭');
    });

    it('returns applied: false when API config unavailable', async () => {
        mock获取文章优化接口配置.mockReturnValue(undefined as any);
        mock接口配置是否可用.mockReturnValue(false);
        const deps = makeDeps({ 文章优化已开启: true });
        const result = await 执行正文润色(makeBaseResponse(), '', deps);
        expect(result.applied).toBe(false);
        expect(result.error).toContain('未配置');
    });

    it('returns applied: false when source body is empty', async () => {
        const deps = makeDeps();
        const result = await 执行正文润色(makeBaseResponse({ logs: [] }), '', deps);
        expect(result.applied).toBe(false);
        expect(result.error).toContain('正文为空');
    });

    it('calls polish API with source body', async () => {
        const baseResponse = makeBaseResponse();
        const rawText = '<正文>【旁白】Source text</正文>';
        const deps = makeDeps();
        await 执行正文润色(baseResponse, rawText, deps);
        expect(mockGeneratePolishedBody).toHaveBeenCalledTimes(1);
        const [sourceBody] = mockGeneratePolishedBody.mock.calls[0];
        expect(sourceBody).toBe('【旁白】Source text');
    });

    it('returns applied: true with polished logs', async () => {
        mockGeneratePolishedBody.mockResolvedValue({
            bodyText: '【旁白】Polished body text',
            rawText: '<正文>【旁白】Polished body text</正文>',
        } as any);
        const deps = makeDeps();
        const result = await 执行正文润色(makeBaseResponse(), '<正文>【旁白】Source</正文>', deps);
        expect(result.applied).toBe(true);
        expect(result.response.logs).toHaveLength(1);
        expect(result.response.logs[0].sender).toBe('旁白');
        expect(result.response.logs[0].text).toBe('Polished body text');
        expect(result.response.body_optimized).toBe(true);
        expect(result.response.body_optimized_manual).toBe(false);
    });

    it('marks manual polish when option set', async () => {
        const deps = makeDeps();
        const result = await 执行正文润色(makeBaseResponse(), '<正文>【旁白】Source</正文>', deps, { manual: true });
        expect(result.response.body_optimized_manual).toBe(true);
    });

    it('preserves original logs in body_original_logs', async () => {
        const baseResponse = makeBaseResponse({
            logs: [{ sender: '旁白', text: 'Original' }],
        });
        const deps = makeDeps();
        const result = await 执行正文润色(baseResponse, '<正文>【旁白】Source</正文>', deps);
        expect(result.response.body_original_logs).toBeDefined();
        expect(result.response.body_original_logs.length).toBeGreaterThan(0);
    });

    it('returns applied: false when polished result is empty', async () => {
        mockGeneratePolishedBody.mockResolvedValue({
            bodyText: '',
            rawText: '',
        } as any);
        const deps = makeDeps();
        const result = await 执行正文润色(makeBaseResponse(), '<正文>【旁白】Source</正文>', deps);
        expect(result.applied).toBe(false);
        expect(result.error).toContain('优化后正文为空');
    });

    it('uses fallback prompts when feature config prompt is empty', async () => {
        const deps = {
            ...makeDeps(),
            apiConfig: { 功能模型占位: { 文章优化提示词: '' } } as any,
        };
        await 执行正文润色(makeBaseResponse(), '<正文>【旁白】Source</正文>', deps);
        const [, prompt] = mockGeneratePolishedBody.mock.calls[0];
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
    });

    it('uses custom prompt from feature config when provided', async () => {
        const deps = {
            ...makeDeps(),
            apiConfig: { 功能模型占位: { 文章优化提示词: 'Custom polish prompt' } } as any,
        };
        await 执行正文润色(makeBaseResponse(), '<正文>【旁白】Source</正文>', deps);
        const [, prompt] = mockGeneratePolishedBody.mock.calls[0];
        expect(prompt).toContain('Custom polish prompt');
    });

    it('injects player input into prompt when provided', async () => {
        const deps = makeDeps();
        await 执行正文润色(makeBaseResponse(), '<正文>【旁白】Source</正文>', deps, { playerInput: '玩家说你好' });
        const [, prompt] = mockGeneratePolishedBody.mock.calls[0];
        expect(prompt).toContain('玩家说你好');
    });

    it('falls back to logs when no 正文 tag in rawText', async () => {
        const deps = makeDeps();
        const rawText = 'No tag content';
        await 执行正文润色(makeBaseResponse(), rawText, deps);
        const [sourceBody] = mockGeneratePolishedBody.mock.calls[0];
        // Falls back to 构建正文文本 from baseResponse.logs
        expect(sourceBody).toBe('【旁白】Original body text');
    });
});
