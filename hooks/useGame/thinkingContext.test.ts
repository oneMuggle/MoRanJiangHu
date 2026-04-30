import { describe, it, expect } from 'vitest';
import { 提取响应规划文本, 提取响应变量规划文本, 提取响应思考上下文 } from './thinkingContext';
import type { GameResponse } from '../../types';

describe('提取响应规划文本', () => {
    it('returns planning text from t_plan', () => {
        const response = { t_plan: '<剧情规划>计划内容</剧情规划>' } as GameResponse;
        const result = 提取响应规划文本(response);
        expect(result).toBe('计划内容');
    });

    it('returns empty for undefined response', () => {
        expect(提取响应规划文本(undefined)).toBe('');
    });

    it('strips storyplan tags too', () => {
        const response = { t_plan: '<storyplan>plan</storyplan>' } as GameResponse;
        const result = 提取响应规划文本(response);
        expect(result).toBe('plan');
    });
});

describe('提取响应变量规划文本', () => {
    it('returns variable planning from t_var_plan', () => {
        const response = { t_var_plan: '<变量规划>var plan</变量规划>' } as GameResponse;
        const result = 提取响应变量规划文本(response);
        expect(result).toBe('var plan');
    });

    it('returns empty for undefined response', () => {
        expect(提取响应变量规划文本(undefined)).toBe('');
    });
});

describe('提取响应思考上下文', () => {
    it('collects thinking_native as primary', () => {
        const response = { thinking_native: 'primary thought' } as GameResponse;
        const result = 提取响应思考上下文(response);
        expect(result).toContain('【本回合<think>】');
        expect(result).toContain('primary thought');
    });

    it('collects thinking_pre as secondary', () => {
        const response = { thinking_pre: 'secondary thought' } as GameResponse;
        const result = 提取响应思考上下文(response);
        expect(result).toContain('【本回合<thinking>】');
        expect(result).toContain('secondary thought');
    });

    it('skips duplicate thinking_pre when same as thinking_native', () => {
        const response = { thinking_native: 'same', thinking_pre: 'same' } as GameResponse;
        const result = 提取响应思考上下文(response);
        expect(result).not.toContain('【本回合<thinking>】');
    });

    it('includes variable planning', () => {
        const response = { t_var_plan: 'var plan' } as GameResponse;
        const result = 提取响应思考上下文(response);
        expect(result).toContain('【本回合<变量规划>】');
        expect(result).toContain('var plan');
    });

    it('includes planning', () => {
        const response = { t_plan: '<剧情规划>plan</剧情规划>' } as GameResponse;
        const result = 提取响应思考上下文(response);
        expect(result).toContain('【本回合<剧情规划>】');
        expect(result).toContain('plan');
    });

    it('includes fallback when different', () => {
        const result = 提取响应思考上下文(undefined, 'fallback thought');
        expect(result).toContain('【补充思考】');
        expect(result).toContain('fallback thought');
    });

    it('strips thinking tags from fallback', () => {
        const result = 提取响应思考上下文(undefined, '<thinking>hidden</thinking>');
        expect(result).not.toContain('<thinking>');
        expect(result).toContain('hidden');
    });

    it('returns empty for all undefined', () => {
        expect(提取响应思考上下文(undefined)).toBe('');
    });

    it('separates blocks with double newline', () => {
        const response = {
            thinking_native: 'thought1',
            t_var_plan: 'var plan',
        } as GameResponse;
        const result = 提取响应思考上下文(response);
        expect(result).toContain('\n\n');
    });
});
