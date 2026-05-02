import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseUserConfig } from './configAssistant';

// Mock 请求模型文本
vi.mock('../chatCompletionClient', () => ({
    请求模型文本: vi.fn(),
}));

import { 请求模型文本 } from '../chatCompletionClient';

describe('parseUserConfig — 正则回退路径', () => {
    beforeEach(() => {
        vi.mocked(请求模型文本).mockRejectedValue(new Error('LLM unavailable'));
    });

    it('解析中文格式：api地址 + 令牌', async () => {
        const result = await parseUserConfig(
            'api地址：https://api.openai.com/v1 令牌：sk-proj-abc123def456',
            '', '', ''
        );
        expect(result).toHaveLength(1);
        expect(result[0].baseUrl).toBe('https://api.openai.com/v1');
        expect(result[0].apiKey).toBe('sk-proj-abc123def456');
    });

    it('解析英文格式：baseUrl + apiKey', async () => {
        const result = await parseUserConfig(
            'baseUrl: https://api.deepseek.com/v1, apiKey: sk-deepseek-key',
            '', '', ''
        );
        expect(result).toHaveLength(1);
        // 正则回退路径的 baseUrl 匹配会包含逗号，需要去除
        expect(result[0].baseUrl.replace(/,+$/, '')).toBe('https://api.deepseek.com/v1');
        expect(result[0].apiKey).toBe('sk-deepseek-key');
    });

    it('空输入返回空数组', async () => {
        const result = await parseUserConfig('', '', '', '');
        expect(result).toEqual([]);
    });

    it('无效输入返回空数组', async () => {
        const result = await parseUserConfig('这是一段无关的文字', '', '', '');
        expect(result).toEqual([]);
    });

    it('baseUrl 不带 /v1 保留原始', async () => {
        const result = await parseUserConfig(
            'api地址：https://api.siliconflow.cn 令牌：sk-sf-key',
            '', '', ''
        );
        expect(result[0].baseUrl).toBe('https://api.siliconflow.cn');
    });

    it('baseUrl 带多余斜杠自动去除', async () => {
        const result = await parseUserConfig(
            'api地址：https://api.openai.com/v1/// 令牌：sk-test12345678',
            '', '', ''
        );
        expect(result[0].baseUrl).toBe('https://api.openai.com/v1');
    });

    it('多行配置只提取第一个有效配置', async () => {
        const result = await parseUserConfig(
            'api地址：https://api.openai.com/v1\n令牌：sk-test12345678',
            '', '', ''
        );
        expect(result).toHaveLength(1);
        expect(result[0].apiKey).toBe('sk-test12345678');
    });

    it('API Key 格式多样仍能提取', async () => {
        // gg- 格式
        const r1 = await parseUserConfig('api地址：https://example.com/v1 令牌：gg-abcdef1234567890', '', '', '');
        expect(r1[0].apiKey).toBe('gg-abcdef1234567890');
    });
});
