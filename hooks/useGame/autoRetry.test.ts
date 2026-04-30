import { describe, it, expect, vi } from 'vitest';
import {
    自动重试最大次数,
    替换流式草稿为失败提示,
    更新流式草稿为自动重试提示,
    游戏设置启用自动重试,
    提取自动重试原因,
    是否可自动重试错误,
    执行带自动重试的生成请求,
} from './autoRetry';

describe('自动重试最大次数', () => {
    it('is 3', () => {
        expect(自动重试最大次数).toBe(3);
    });
});

describe('替换流式草稿为失败提示', () => {
    it('replaces last unstructured assistant message', () => {
        const history = [
            { role: 'user', content: 'hello' } as any,
            { role: 'assistant', content: 'draft text' } as any,
        ];
        const result = 替换流式草稿为失败提示(history, 'error msg');
        expect(result[1].content).toBe('【生成失败】error msg');
    });

    it('appends if no unstructured assistant found', () => {
        const history = [
            { role: 'user', content: 'hello' } as any,
        ];
        const result = 替换流式草稿为失败提示(history, 'error msg');
        expect(result.length).toBe(2);
        expect(result[1].content).toBe('【生成失败】error msg');
        expect(result[1].role).toBe('assistant');
    });

    it('skips structured assistant messages', () => {
        const history = [
            { role: 'assistant', structuredResponse: { logs: [] } } as any,
        ];
        const result = 替换流式草稿为失败提示(history, 'error msg');
        expect(result.length).toBe(2);
        expect(result[1].content).toBe('【生成失败】error msg');
    });

    it('handles non-array history', () => {
        const result = 替换流式草稿为失败提示(null as any, 'err');
        expect(result.length).toBe(1);
        expect(result[0].content).toBe('【生成失败】err');
    });

    it('uses unknown error for empty message', () => {
        const result = 替换流式草稿为失败提示([], '');
        expect(result[0].content).toBe('【生成失败】未知错误');
    });

    it('does not mutate original array', () => {
        const history = [{ role: 'assistant', content: 'draft' } as any];
        const result = 替换流式草稿为失败提示(history, 'err');
        expect(result).not.toBe(history);
        expect(history[0].content).toBe('draft');
    });
});

describe('更新流式草稿为自动重试提示', () => {
    it('replaces last unstructured assistant with retry text', () => {
        const history = [{ role: 'assistant', content: 'draft' } as any];
        const result = 更新流式草稿为自动重试提示(history, 2, 3, 'parse error');
        expect(result[0].content).toBe('【自动重试中】第 2 / 3 次：parse error');
    });

    it('appends if no unstructured assistant found', () => {
        const history = [{ role: 'user', content: 'hello' } as any];
        const result = 更新流式草稿为自动重试提示(history, 1, 3);
        expect(result.length).toBe(2);
        expect(result[1].content).toBe('【自动重试中】第 1 / 3 次');
    });

    it('omits reason when not provided', () => {
        const result = 更新流式草稿为自动重试提示([], 1, 3);
        expect(result[0].content).toBe('【自动重试中】第 1 / 3 次');
    });

    it('does not mutate original array', () => {
        const history = [{ role: 'assistant', content: 'draft' } as any];
        const result = 更新流式草稿为自动重试提示(history, 1, 3);
        expect(result).not.toBe(history);
    });
});

describe('游戏设置启用自动重试', () => {
    it('returns true only when explicitly true', () => {
        expect(游戏设置启用自动重试({ 启用自动重试: true } as any)).toBe(true);
    });

    it('returns false for false', () => {
        expect(游戏设置启用自动重试({ 启用自动重试: false } as any)).toBe(false);
    });

    it('returns false for undefined/null', () => {
        expect(游戏设置启用自动重试(undefined)).toBe(false);
        expect(游戏设置启用自动重试(null)).toBe(false);
    });

    it('returns false for missing field', () => {
        expect(游戏设置启用自动重试({} as any)).toBe(false);
    });
});

describe('提取自动重试原因', () => {
    it('returns parse error message for StoryResponseParseError', () => {
        const err = { name: 'StoryResponseParseError', message: 'bad json' };
        expect(提取自动重试原因(err)).toBe('解析失败，正在重新生成');
    });

    it('returns error message string', () => {
        const err = new Error('network timeout');
        expect(提取自动重试原因(err)).toBe('network timeout');
    });

    it('returns plain string trimmed', () => {
        expect(提取自动重试原因('  some reason  ')).toBe('some reason');
    });

    it('returns default for empty/invalid', () => {
        expect(提取自动重试原因('')).toBe('请求失败，正在重试');
        expect(提取自动重试原因(null)).toBe('请求失败，正在重试');
        expect(提取自动重试原因(undefined)).toBe('请求失败，正在重试');
    });

    it('prefers message property over toString', () => {
        const err = { message: 'specific error' };
        expect(提取自动重试原因(err)).toBe('specific error');
    });
});

describe('是否可自动重试错误', () => {
    it('returns false for falsy errors', () => {
        expect(是否可自动重试错误(null)).toBe(false);
        expect(是否可自动重试错误(undefined)).toBe(false);
    });

    it('returns false for AbortError', () => {
        expect(是否可自动重试错误({ name: 'AbortError' })).toBe(false);
    });

    it('returns true for StoryResponseParseError', () => {
        expect(是否可自动重试错误({ name: 'StoryResponseParseError' })).toBe(true);
    });

    it('returns true for other errors', () => {
        // The function has `|| true` fallback, so everything else is retryable
        expect(是否可自动重试错误(new Error('network error'))).toBe(true);
        expect(是否可自动重试错误('string error')).toBe(true);
    });
});

describe('执行带自动重试的生成请求', () => {
    it('succeeds on first attempt', async () => {
        const action = vi.fn().mockResolvedValue('success');
        const result = await 执行带自动重试的生成请求({ enabled: true, action });
        expect(result).toBe('success');
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('retries on failure when enabled', async () => {
        const action = vi.fn()
            .mockRejectedValueOnce(new Error('fail 1'))
            .mockResolvedValue('success');
        const onRetry = vi.fn();
        const result = await 执行带自动重试的生成请求({ enabled: true, action, onRetry });
        expect(result).toBe('success');
        expect(action).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenCalledWith(2, 3, 'fail 1');
    });

    it('throws after max attempts', async () => {
        const action = vi.fn().mockRejectedValue(new Error('always fails'));
        const onRetry = vi.fn();
        await expect(执行带自动重试的生成请求({ enabled: true, action, onRetry }))
            .rejects.toThrow('always fails');
        expect(action).toHaveBeenCalledTimes(3);
    });

    it('does not retry when disabled', async () => {
        const action = vi.fn().mockRejectedValue(new Error('fail'));
        await expect(执行带自动重试的生成请求({ enabled: false, action }))
            .rejects.toThrow('fail');
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('does not retry non-retryable errors', async () => {
        const action = vi.fn().mockRejectedValue({ name: 'AbortError' });
        await expect(执行带自动重试的生成请求({ enabled: true, action }))
            .rejects.toMatchObject({ name: 'AbortError' });
        expect(action).toHaveBeenCalledTimes(1);
    });

    it('calls onRetry with correct attempt count', async () => {
        const action = vi.fn()
            .mockRejectedValueOnce(new Error('err1'))
            .mockRejectedValueOnce(new Error('err2'))
            .mockResolvedValue('ok');
        const onRetry = vi.fn();
        await 执行带自动重试的生成请求({ enabled: true, action, onRetry });
        expect(onRetry).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenNthCalledWith(1, 2, 3, 'err1');
        expect(onRetry).toHaveBeenNthCalledWith(2, 3, 3, 'err2');
    });
});
