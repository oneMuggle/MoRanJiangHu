import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    去重文本数组,
    收集剧情规划时间触发原因,
    收集女主规划时间触发原因,
    收集剧情正文命中原因,
    收集女主正文命中原因,
    过滤规划补丁命令,
} from './planningReasonCollector';

vi.mock('./timeUtils', () => ({
    环境时间转标准串: vi.fn((env: any) => env ? `${env.年}-${String(env.月).padStart(2, '0')}-${String(env.日).padStart(2, '0')}T00:00:00` : ''),
    normalizeCanonicalGameTime: vi.fn((t: string) => t || ''),
}));
vi.mock('./responseTextHelpers', () => ({
    游戏时间转排序值: vi.fn((t: string) => {
        if (!t) return null;
        return new Date(t).getTime();
    }),
}));
vi.mock('./storyState', () => ({
    规范化剧情规划状态: vi.fn((p: any) => p || { 待触发事件: [], 当前章任务: [] }),
    规范化女主剧情规划状态: vi.fn((p: any) => p || null),
    规范化剧情状态: vi.fn((p: any) => p || { 当前章节: {} }),
}));

describe('planningReasonCollector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('去重文本数组', () => {
        it('returns unique items in order', () => {
            expect(去重文本数组(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
        });

        it('trims whitespace and filters empty strings', () => {
            expect(去重文本数组(['  a  ', '', '  ', 'b'])).toEqual(['a', 'b']);
        });

        it('handles non-string items', () => {
            expect(去重文本数组([null as any, undefined as any, 42 as any])).toEqual([]);
        });

        it('handles non-array input', () => {
            expect(去重文本数组(null as any)).toEqual([]);
        });
    });

    describe('收集剧情规划时间触发原因', () => {
        const baseEnv = { 年: 2026, 月: 4, 日: 30 };

        it('returns empty array when no environment', () => {
            expect(收集剧情规划时间触发原因(undefined, undefined as any)).toEqual([]);
        });

        it('returns empty array when plan has no events or tasks', () => {
            const result = 收集剧情规划时间触发原因({}, baseEnv);
            expect(result).toEqual([]);
        });

        it('detects triggered event times', () => {
            const plan = {
                待触发事件: [
                    {
                        事件名: '刺杀任务',
                        计划触发时间: '2026-04-29T00:00:00',
                        最早触发时间: '2026-04-28T00:00:00',
                        最晚触发时间: '2026-05-01T00:00:00',
                    },
                ],
                当前章任务: [],
            };
            const result = 收集剧情规划时间触发原因(plan, baseEnv);
            expect(result.length).toBeGreaterThan(0);
            expect(result.some((r) => r.includes('刺杀任务'))).toBe(true);
        });

        it('detects triggered task times', () => {
            const plan = {
                待触发事件: [],
                当前章任务: [
                    {
                        标题: '探索密室',
                        计划执行时间: '2026-04-30T00:00:00',
                        最早执行时间: '2026-04-25T00:00:00',
                        最迟执行时间: '2026-05-05T00:00:00',
                    },
                ],
            };
            const result = 收集剧情规划时间触发原因(plan, baseEnv);
            expect(result.some((r) => r.includes('探索密室'))).toBe(true);
        });

        it('does not trigger for future times', () => {
            const plan = {
                待触发事件: [
                    {
                        事件名: '未来事件',
                        计划触发时间: '2027-01-01T00:00:00',
                        最早触发时间: '2027-01-01T00:00:00',
                        最晚触发时间: '2027-01-01T00:00:00',
                    },
                ],
                当前章任务: [],
            };
            const result = 收集剧情规划时间触发原因(plan, baseEnv);
            expect(result).toEqual([]);
        });

        it('deduplicates reasons', () => {
            const plan = {
                待触发事件: [
                    {
                        事件名: '重复事件',
                        计划触发时间: '2026-04-29T00:00:00',
                        最早触发时间: '2026-04-29T00:00:00',
                        最晚触发时间: '2026-04-29T00:00:00',
                    },
                ],
                当前章任务: [],
            };
            const result = 收集剧情规划时间触发原因(plan, baseEnv);
            const uniqueReasons = new Set(result);
            expect(uniqueReasons.size).toBe(result.length);
        });

        it('uses default name for unnamed events', () => {
            const plan = {
                待触发事件: [
                    {
                        计划触发时间: '2026-04-29T00:00:00',
                    },
                ],
                当前章任务: [],
            };
            const result = 收集剧情规划时间触发原因(plan, baseEnv);
            expect(result.some((r) => r.includes('未命名事件'))).toBe(true);
        });
    });

    describe('收集女主规划时间触发原因', () => {
        const baseEnv = { 年: 2026, 月: 4, 日: 30 };

        it('returns empty array when no plan', () => {
            expect(收集女主规划时间触发原因(undefined as any, baseEnv)).toEqual([]);
        });

        it('returns empty array when no events', () => {
            const plan = { 女主互动事件: [] };
            expect(收集女主规划时间触发原因(plan, baseEnv)).toEqual([]);
        });

        it('detects triggered heroine event times', () => {
            const plan = {
                女主互动事件: [
                    {
                        事件名: '花园相遇',
                        女主姓名: '小凤',
                        计划触发时间: '2026-04-29T00:00:00',
                        最早触发时间: '2026-04-28T00:00:00',
                        最晚触发时间: '2026-05-01T00:00:00',
                    },
                ],
            };
            const result = 收集女主规划时间触发原因(plan, baseEnv);
            expect(result.some((r) => r.includes('小凤') && r.includes('花园相遇'))).toBe(true);
        });

        it('uses defaults for missing fields', () => {
            const plan = {
                女主互动事件: [
                    {
                        计划触发时间: '2026-04-29T00:00:00',
                    },
                ],
            };
            const result = 收集女主规划时间触发原因(plan, baseEnv);
            expect(result.some((r) => r.includes('未知女主'))).toBe(true);
            expect(result.some((r) => r.includes('未知排期'))).toBe(true);
        });
    });

    describe('收集剧情正文命中原因', () => {
        it('returns empty array when no body text', () => {
            expect(收集剧情正文命中原因({}, {}, '')).toEqual([]);
            expect(收集剧情正文命中原因({}, {}, undefined as any)).toEqual([]);
        });

        it('matches keywords from story chapter title', () => {
            const story = { 当前章节: { 标题: '刺杀行动' } };
            const plan = { 待触发事件: [], 当前章任务: [] };
            const body = '今夜执行刺杀行动，潜入敌营。';
            const result = 收集剧情正文命中原因(story, plan, body);
            expect(result).toContain('最近正文命中剧情线索「刺杀行动」');
        });

        it('matches keywords from planned events', () => {
            const story = { 当前章节: {} };
            const plan = {
                待触发事件: [{ 事件名: '秘境探索' }],
                当前章任务: [],
            };
            const body = '众人进入了秘境探索的入口。';
            const result = 收集剧情正文命中原因(story, plan, body);
            expect(result).toContain('最近正文命中剧情线索「秘境探索」');
        });

        it('matches keywords from chapter tasks', () => {
            const story = { 当前章节: {} };
            const plan = {
                待触发事件: [],
                当前章任务: [{ 标题: '寻找秘籍' }],
            };
            const body = '他踏上了寻找秘籍的旅途。';
            const result = 收集剧情正文命中原因(story, plan, body);
            expect(result).toContain('最近正文命中剧情线索「寻找秘籍」');
        });

        it('filters keywords shorter than 2 chars', () => {
            const story = { 当前章节: { 标题: 'a' } };
            const plan = { 待触发事件: [], 当前章任务: [] };
            const body = 'a test';
            const result = 收集剧情正文命中原因(story, plan, body);
            expect(result).toEqual([]);
        });

        it('deduplicates keywords', () => {
            const story = { 当前章节: { 标题: '重复' } };
            const plan = {
                待触发事件: [{ 事件名: '重复' }],
                当前章任务: [],
            };
            const body = '重复的内容重复。';
            const result = 收集剧情正文命中原因(story, plan, body);
            expect(result.length).toBe(1);
        });
    });

    describe('收集女主正文命中原因', () => {
        it('returns empty array when no body text', () => {
            expect(收集女主正文命中原因({}, '')).toEqual([]);
        });

        it('returns empty array when no plan', () => {
            expect(收集女主正文命中原因(undefined as any, 'body')).toEqual([]);
        });

        it('matches heroine names in body text', () => {
            const plan = { 女主条目: [{ 女主姓名: '小凤' }, { 女主姓名: '小兰' }] };
            const body = '小凤微笑着看向远方。';
            const result = 收集女主正文命中原因(plan, body);
            expect(result).toContain('最近正文命中女主线索「小凤」');
            expect(result).not.toContain('小兰');
        });

        it('filters short names', () => {
            const plan = { 女主条目: [{ 女主姓名: 'a' }] };
            const body = 'a test';
            const result = 收集女主正文命中原因(plan, body);
            expect(result).toEqual([]);
        });
    });

    describe('过滤规划补丁命令', () => {
        const commands = [
            { action: 'set', key: '剧情', value: 'x' },
            { action: 'set', key: '剧情.主线', value: 'y' },
            { action: 'set', key: '剧情规划[0]', value: 'z' },
            { action: 'set', key: '角色.姓名', value: 'w' },
            { action: 'set', key: '女主剧情规划.条目', value: 'v' },
        ];

        it('filters by prefix match', () => {
            const result = 过滤规划补丁命令(commands as any, ['剧情']);
            expect(result.length).toBe(2);
            expect(result.every((c) => c.key.startsWith('剧情'))).toBe(true);
        });

        it('filters by multiple prefixes', () => {
            const result = 过滤规划补丁命令(commands as any, ['剧情', '女主剧情规划']);
            expect(result.length).toBe(3);
        });

        it('filters out invalid commands', () => {
            const invalidCommands = [
                { action: 'set', value: 'x' },
                null,
                undefined,
                { key: '剧情' },
                ...commands,
            ];
            const result = 过滤规划补丁命令(invalidCommands as any, ['剧情']);
            expect(result.every((c) => typeof c?.key === 'string' && typeof c?.action === 'string')).toBe(true);
        });

        it('returns empty array for non-array input', () => {
            expect(过滤规划补丁命令(null as any, ['剧情'])).toEqual([]);
        });
    });
});
