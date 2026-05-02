import { describe, it, expect } from 'vitest';
import { 推断供应商 } from './apiConfig';

describe('推断供应商', () => {
    it('识别 Gemini 端点', () => {
        expect(推断供应商('https://generativelanguage.googleapis.com/v1beta/openai')).toBe('gemini');
        expect(推断供应商('https://googleapis.com/v1')).toBe('gemini');
    });

    it('识别 DeepSeek 端点', () => {
        expect(推断供应商('https://api.deepseek.com/v1')).toBe('deepseek');
    });

    it('识别智谱端点', () => {
        expect(推断供应商('https://open.bigmodel.cn/api/paas/v4')).toBe('zhipu');
        expect(推断供应商('https://bigmodel.cn/v1')).toBe('zhipu');
    });

    it('识别 Claude 端点', () => {
        expect(推断供应商('https://api.anthropic.com/v1/messages')).toBe('claude');
        expect(推断供应商('https://claude.example.com/v1')).toBe('claude');
    });

    it('识别 OpenAI 端点', () => {
        expect(推断供应商('https://api.openai.com/v1')).toBe('openai');
    });

    it('识别 SiliconFlow 为 openai_compatible', () => {
        expect(推断供应商('https://api.siliconflow.cn/v1')).toBe('openai_compatible');
    });

    it('识别 Together 为 openai_compatible', () => {
        expect(推断供应商('https://api.together.xyz/v1')).toBe('openai_compatible');
    });

    it('识别 Groq 为 openai_compatible', () => {
        expect(推断供应商('https://api.groq.com/openai/v1')).toBe('openai_compatible');
    });

    it('识别 Grok/xAI 端点', () => {
        expect(推断供应商('https://api.x.ai/v1')).toBe('grok');
        expect(推断供应商('https://grok.example.com/v1')).toBe('grok');
    });

    it('空输入返回默认 openai', () => {
        expect(推断供应商('')).toBe('openai');
        expect(推断供应商(null)).toBe('openai');
        expect(推断供应商(undefined)).toBe('openai');
    });

    it('未知自定义端点返回 openai_compatible', () => {
        expect(推断供应商('https://custom-provider.example.com/v1')).toBe('openai_compatible');
    });

    it('URL 末尾带多余斜杠仍能识别', () => {
        expect(推断供应商('https://api.openai.com/v1/')).toBe('openai');
        expect(推断供应商('https://api.deepseek.com/v1/')).toBe('deepseek');
    });

    it('非字符串类型输入不崩溃', () => {
        expect(推断供应商(123)).toBe('openai');
        expect(推断供应商({})).toBe('openai');
        expect(推断供应商(true)).toBe('openai');
    });
});
