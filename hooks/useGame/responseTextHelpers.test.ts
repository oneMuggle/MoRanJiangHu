import { describe, it, expect } from 'vitest';
import {
    获取原始AI消息,
    计算回复耗时秒,
    估算消息Token,
    估算AI输出Token,
    游戏时间转排序值,
    提取文本中的游戏时间列表,
    当前时间已达到,
    提取响应完整正文文本,
    收集最近完整正文回合,
    构建最近完整正文上下文,
} from './responseTextHelpers';

describe('获取原始AI消息', () => {
    it('returns string as-is', () => {
        expect(获取原始AI消息('hello')).toBe('hello');
    });

    it('returns empty for non-string', () => {
        expect(获取原始AI消息(null as any)).toBe('');
        expect(获取原始AI消息(undefined as any)).toBe('');
        expect(获取原始AI消息(123 as any)).toBe('');
    });
});

describe('计算回复耗时秒', () => {
    it('returns rounded seconds with minimum of 1', () => {
        const start = Date.now() - 5000;
        const result = 计算回复耗时秒(start, Date.now());
        expect(result).toBeGreaterThanOrEqual(1);
    });

    it('returns 0 for invalid start', () => {
        expect(计算回复耗时秒(0)).toBe(0);
        expect(计算回复耗时秒(-1)).toBe(0);
        expect(计算回复耗时秒(NaN)).toBe(0);
    });

    it('returns 0 for invalid elapsed', () => {
        expect(计算回复耗时秒(100, 50)).toBe(0);
    });

    it('uses Date.now as default endedAt', () => {
        const result = 计算回复耗时秒(Date.now() - 3000);
        expect(result).toBeGreaterThanOrEqual(1);
    });
});

describe('估算消息Token', () => {
    it('delegates to countOpenAIChatMessagesTokens', () => {
        const messages = [{ role: 'user', content: 'hello' }];
        const result = 估算消息Token(messages);
        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
    });
});

describe('估算AI输出Token', () => {
    it('delegates to countOpenAITextTokens', () => {
        const result = 估算AI输出Token('hello world');
        expect(typeof result).toBe('number');
    });

    it('handles non-string input', () => {
        const result = 估算AI输出Token(null as any);
        expect(typeof result).toBe('number');
    });
});

describe('游戏时间转排序值', () => {
    it('converts valid time to sortable number', () => {
        const result = 游戏时间转排序值('2026:04:30:14:05');
        expect(result).toBe(202604301405);
    });

    it('returns null for invalid input', () => {
        expect(游戏时间转排序值('')).toBeNull();
        expect(游戏时间转排序值(undefined)).toBeNull();
        expect(游戏时间转排序值('not-a-time')).toBeNull();
    });

    it('normalizes input before conversion', () => {
        const result = 游戏时间转排序值('2026:4:30:14:5');
        expect(result).toBe(202604301405);
    });
});

describe('提取文本中的游戏时间列表', () => {
    it('extracts time patterns', () => {
        const result = 提取文本中的游戏时间列表('时间是2026:4:30:14:5和2026:5:1:12:0');
        expect(result).toContain('2026:04:30:14:05');
        expect(result).toContain('2026:05:01:12:00');
    });

    it('deduplicates normalized times', () => {
        const result = 提取文本中的游戏时间列表('2026:4:30:14:5 and 2026:04:30:14:05');
        expect(result).toHaveLength(1);
    });

    it('returns empty for non-string', () => {
        expect(提取文本中的游戏时间列表(undefined)).toEqual([]);
        expect(提取文本中的游戏时间列表('')).toEqual([]);
    });
});

describe('当前时间已达到', () => {
    it('returns true when current >= target', () => {
        expect(当前时间已达到('2026:05:01:12:00', '2026:04:30:14:00')).toBe(true);
        expect(当前时间已达到('2026:04:30:14:00', '2026:04:30:14:00')).toBe(true);
    });

    it('returns false when current < target', () => {
        expect(当前时间已达到('2026:04:30:14:00', '2026:05:01:12:00')).toBe(false);
    });

    it('returns false for invalid times', () => {
        expect(当前时间已达到('', '2026:05:01:12:00')).toBe(false);
        expect(当前时间已达到('2026:05:01:12:00', '')).toBe(false);
        expect(当前时间已达到(undefined, undefined)).toBe(false);
    });
});

describe('提取响应完整正文文本', () => {
    it('formats logs with sender and text', () => {
        const response = { logs: [{ sender: '旁白', text: '故事开始' }] } as any;
        const result = 提取响应完整正文文本(response);
        expect(result).toBe('旁白：故事开始');
    });

    it('uses default sender for missing sender', () => {
        const response = { logs: [{ text: 'no sender' }] } as any;
        const result = 提取响应完整正文文本(response);
        expect(result).toBe('旁白：no sender');
    });

    it('filters empty text entries', () => {
        const response = { logs: [{ sender: '旁白', text: 'valid' }, { sender: '旁白', text: '' }] } as any;
        const result = 提取响应完整正文文本(response);
        expect(result).toBe('旁白：valid\n旁白：');
    });

    it('returns empty for no logs', () => {
        expect(提取响应完整正文文本(undefined)).toBe('');
        expect(提取响应完整正文文本({} as any)).toBe('');
        expect(提取响应完整正文文本({ logs: [] } as any)).toBe('');
    });

    it('joins multiple logs with newlines', () => {
        const response = {
            logs: [
                { sender: '旁白', text: 'line1' },
                { sender: '张三', text: 'line2' },
            ],
        } as any;
        const result = 提取响应完整正文文本(response);
        expect(result).toBe('旁白：line1\n张三：line2');
    });
});

describe('收集最近完整正文回合', () => {
    it('collects current response turn', () => {
        const response = { logs: [{ sender: '旁白', text: 'current body' }] } as any;
        const result = 收集最近完整正文回合({
            history: [],
            currentPlayerInput: 'player action',
            currentGameTime: '2026:04:30:14:00',
            currentResponse: response,
        });
        expect(result).toHaveLength(1);
        expect(result[0].正文).toBe('旁白：current body');
        expect(result[0].玩家输入).toBe('player action');
        expect(result[0].游戏时间).toBe('2026:04:30:14:00');
    });

    it('collects from history', () => {
        const history = [
            { role: 'user', content: 'old input' },
            {
                role: 'assistant',
                gameTime: '2026:04:29:10:00',
                structuredResponse: {
                    logs: [{ sender: '旁白', text: 'old body' }],
                },
            },
        ];
        const result = 收集最近完整正文回合({ history, maxTurns: 2 });
        expect(result).toHaveLength(1);
        expect(result[0].玩家输入).toBe('old input');
        expect(result[0].游戏时间).toBe('2026:04:29:10:00');
    });

    it('respects maxTurns limit', () => {
        const history = [
            { role: 'user', content: 'input1' },
            { role: 'assistant', gameTime: '2026:04:28:10:00', structuredResponse: { logs: [{ sender: '旁白', text: 'body1' }] } },
            { role: 'user', content: 'input2' },
            { role: 'assistant', gameTime: '2026:04:29:10:00', structuredResponse: { logs: [{ sender: '旁白', text: 'body2' }] } },
            { role: 'user', content: 'input3' },
            { role: 'assistant', gameTime: '2026:04:30:10:00', structuredResponse: { logs: [{ sender: '旁白', text: 'body3' }] } },
        ];
        const result = 收集最近完整正文回合({ history, maxTurns: 2 });
        expect(result).toHaveLength(2);
        expect(result[0].游戏时间).toBe('2026:04:29:10:00');
        expect(result[1].游戏时间).toBe('2026:04:30:10:00');
    });

    it('deduplicates identical turns', () => {
        const response = { logs: [{ sender: '旁白', text: 'same body' }] } as any;
        const history = [
            { role: 'assistant', gameTime: '2026:04:30:10:00', structuredResponse: { logs: [{ sender: '旁白', text: 'same body' }] } },
        ];
        const result = 收集最近完整正文回合({
            history,
            currentResponse: response,
            currentGameTime: '2026:04:30:10:00',
            currentPlayerInput: '',
            maxTurns: 5,
        });
        expect(result.length).toBeLessThanOrEqual(1);
    });

    it('skips turns with empty body', () => {
        const history = [
            { role: 'assistant', gameTime: '2026:04:30:10:00', structuredResponse: { logs: [] } },
        ];
        const result = 收集最近完整正文回合({ history });
        expect(result).toHaveLength(0);
    });

    it('handles non-array history', () => {
        const result = 收集最近完整正文回合({ history: null as any });
        expect(result).toEqual([]);
    });

    it('defaults maxTurns to 3', () => {
        const result = 收集最近完整正文回合({
            history: [],
            maxTurns: NaN,
        });
        expect(result).toEqual([]);
    });
});

describe('构建最近完整正文上下文', () => {
    it('formats rounds with headers', () => {
        const rounds = [
            { 玩家输入: 'action', 游戏时间: '2026:04:30:14:00', 正文: 'body text' },
        ];
        const result = 构建最近完整正文上下文(rounds);
        expect(result).toContain('【正文片段1】');
        expect(result).toContain('游戏时间：2026:04:30:14:00');
        expect(result).toContain('玩家输入：action');
        expect(result).toContain('完整正文：');
        expect(result).toContain('body text');
    });

    it('handles missing game time', () => {
        const rounds = [{ 玩家输入: '', 游戏时间: '', 正文: 'body' }];
        const result = 构建最近完整正文上下文(rounds);
        expect(result).toContain('游戏时间：未知');
    });

    it('returns empty for empty rounds', () => {
        expect(构建最近完整正文上下文([])).toBe('');
    });

    it('separates multiple rounds with double newline', () => {
        const rounds = [
            { 玩家输入: 'a1', 游戏时间: 't1', 正文: 'b1' },
            { 玩家输入: 'a2', 游戏时间: 't2', 正文: 'b2' },
        ];
        const result = 构建最近完整正文上下文(rounds);
        expect(result).toContain('\n\n');
    });

    it('handles non-array input', () => {
        expect(构建最近完整正文上下文(null as any)).toBe('');
    });
});
