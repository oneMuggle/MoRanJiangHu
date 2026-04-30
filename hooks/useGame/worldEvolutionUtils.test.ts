import { describe, it, expect, vi } from 'vitest';
import { 规范化世界演变命令列表, 分析世界到期触发, 构建世界演变上下文文本 } from './worldEvolutionUtils';

// Mock dependencies
vi.mock('./memoryUtils', () => ({
    格式化短期记忆展示文本: vi.fn((text: string) => text || '暂无'),
}));

describe('规范化世界演变命令列表', () => {
    it('returns empty array for non-array input', () => {
        expect(规范化世界演变命令列表(null as any)).toEqual([]);
        expect(规范化世界演变命令列表(undefined as any)).toEqual([]);
        expect(规范化世界演变命令列表('not-array' as any)).toEqual([]);
    });

    it('normalizes keys via normalizeStateCommandKey', () => {
        const cmds = [{ action: 'set' as const, key: '世界.活跃NPC列表', value: 1 }];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(1);
        expect(result[0].key).toBeTruthy();
    });

    it('filters out keys not matching allowed prefixes', () => {
        const cmds = [{ action: 'set' as const, key: '角色.当前精力', value: 100 }];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(0);
    });

    it('filters out invalid actions', () => {
        const cmds: any[] = [
            { action: 'set', key: '世界.活跃NPC列表', value: 1 },
            { action: 'invalid', key: '世界.活跃NPC列表', value: 2 },
            { action: '', key: '世界.活跃NPC列表', value: 3 },
        ];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(1);
        expect(result[0].value).toBe(1);
    });

    it('accepts all 4 valid actions', () => {
        const actions: Array<'add' | 'set' | 'push' | 'delete'> = ['add', 'set', 'push', 'delete'];
        for (const action of actions) {
            const cmds = [{ action, key: '世界.活跃NPC列表', value: 'x' } as const];
            const result = 规范化世界演变命令列表(cmds);
            expect(result).toHaveLength(1);
            expect(result[0].action).toBe(action);
        }
    });

    it('accepts nested paths under allowed prefixes', () => {
        const cmds = [{ action: 'set' as const, key: '世界.活跃NPC列表.0.姓名', value: '张三' }];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(1);
    });

    it('accepts array-index syntax paths', () => {
        const cmds = [{ action: 'push' as const, key: '世界.活跃NPC列表[0]', value: 'item' }];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(1);
    });

    it('strips gameState. prefix when checking prefixes', () => {
        const cmds = [{ action: 'set' as const, key: 'gameState.世界.地图', value: {} }];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(1);
    });

    it('accepts environment paths', () => {
        const cmds = [{ action: 'set' as const, key: '环境.天气', value: '晴' }];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(1);
    });

    it('handles empty key strings', () => {
        const cmds = [{ action: 'set' as const, key: '', value: 1 }];
        const result = 规范化世界演变命令列表(cmds);
        expect(result).toHaveLength(0);
    });
});

describe('分析世界到期触发', () => {
    it('returns hasDue false when no current time', () => {
        const result = 分析世界到期触发({}, {});
        expect(result.hasDue).toBe(false);
        expect(result.eventDueList).toEqual([]);
        expect(result.npcDueList).toEqual([]);
    });

    it('detects due events', () => {
        const world = {
            进行中事件: [
                { 事件名: '武林大会', 预计结束时间: '2026:04:01:12:00' },
                { 事件名: '秘境探索', 预计结束时间: '2026:06:01:12:00' },
            ],
        };
        const env = { 时间: '2026:05:01:12:00' };
        const result = 分析世界到期触发(world, env);
        expect(result.hasDue).toBe(true);
        expect(result.eventDueList).toHaveLength(1);
        expect(result.eventDueList[0].title).toBe('武林大会');
        expect(result.summaryHints.some(h => h.includes('武林大会'))).toBe(true);
    });

    it('detects due NPCs', () => {
        const world = {
            活跃NPC列表: [
                { 姓名: '李四', 行动结束时间: '2026:04:01:12:00' },
                { 姓名: '王五', 行动结束时间: '2026:06:01:12:00' },
            ],
        };
        const env = { 时间: '2026:05:01:12:00' };
        const result = 分析世界到期触发(world, env);
        expect(result.hasDue).toBe(true);
        expect(result.npcDueList).toHaveLength(1);
        expect(result.npcDueList[0].name).toBe('李四');
        expect(result.npcDueList[0].reason).toBe('行动结束时间已到');
    });

    it('returns null end times as no due', () => {
        const world = {
            进行中事件: [
                { 事件名: '永恒事件' }, // no end time
            ],
            活跃NPC列表: [
                { 姓名: '永恒NPC' }, // no end time
            ],
        };
        const env = { 时间: '2026:05:01:12:00' };
        const result = 分析世界到期触发(world, env);
        expect(result.hasDue).toBe(false);
    });

    it('uses structured time objects', () => {
        const world = {
            进行中事件: [
                { 事件名: '限时任务', 预计结束时间: { 年: 2026, 月: 4, 日: 1, 时: 12, 分: 0 } },
            ],
        };
        const env = { 年: 2026, 月: 5, 日: 1, 时: 12, 分: 0 };
        const result = 分析世界到期触发(world, env);
        expect(result.hasDue).toBe(true);
    });

    it('handles invalid end times gracefully', () => {
        const world = {
            进行中事件: [
                { 事件名: '坏事件', 预计结束时间: 'not-a-time' },
            ],
        };
        const env = { 时间: '2026:05:01:12:00' };
        const result = 分析世界到期触发(world, env);
        expect(result.hasDue).toBe(false);
    });

    it('uses fallback index for unnamed events/npcs with due times', () => {
        const world = {
            进行中事件: [
                { 预计结束时间: '2026:04:01:12:00' }, // no 事件名, but has end time
            ],
            活跃NPC列表: [
                { 行动结束时间: '2026:04:01:12:00' }, // no 姓名, but has end time
            ],
        };
        const env = { 时间: '2026:05:01:12:00' };
        const result = 分析世界到期触发(world, env);
        expect(result.eventDueList).toHaveLength(1);
        expect(result.eventDueList[0].id).toBe('事件#1');
        expect(result.npcDueList).toHaveLength(1);
        expect(result.npcDueList[0].id).toBe('NPC#1');
    });
});

describe('构建世界演变上下文文本', () => {
    it('renders all sections with provided data', () => {
        const result = 构建世界演变上下文文本({
            worldPrompt: '世界观内容',
            worldEvolutionPrompt: '演化规则',
            envData: { 天气: '晴' },
            worldData: { 活跃NPC列表: [] },
            storyData: { 当前章节: { 标题: '第一章' }, 下一章预告: {}, 历史卷宗: [] },
            shortMemoryTexts: ['记忆1', '记忆2'],
            scriptText: '历史回顾',
            currentTurnBody: '本回合正文',
            currentTurnPlanText: '本回合规划',
            currentTurnCommandsText: '已落地命令',
            currentGameTime: '2026:04:30:14:00',
            dynamicHints: ['线索1'],
            dueHints: ['到期1'],
        });
        expect(result).toContain('【世界观提示词】');
        expect(result).toContain('世界观内容');
        expect(result).toContain('【世界演化规则】');
        expect(result).toContain('演化规则');
        expect(result).toContain('【当前游戏内时间】');
        expect(result).toContain('2026:04:30:14:00');
        expect(result).toContain('【当前环境】');
        expect(result).toContain('天气');
        expect(result).toContain('【当前世界】');
        expect(result).toContain('【当前剧情锚点】');
        expect(result).toContain('【本回合前台已发生事实】');
        expect(result).toContain('本回合正文');
        expect(result).toContain('【本回合<剧情规划>】');
        expect(result).toContain('本回合规划');
        expect(result).toContain('【本回合主链已落地命令】');
        expect(result).toContain('已落地命令');
        expect(result).toContain('【短期记忆（最近）】');
        expect(result).toContain('【最近数回合前台回顾】');
        expect(result).toContain('历史回顾');
        expect(result).toContain('【动态世界线索】');
        expect(result).toContain('线索1');
        expect(result).toContain('【到期触发摘要】');
        expect(result).toContain('到期1');
        expect(result).toContain('【本回合可触发演变候选】');
        expect(result).toContain('线索驱动：线索1');
        expect(result).toContain('到期驱动：到期1');
    });

    it('uses defaults for missing params', () => {
        const result = 构建世界演变上下文文本({});
        expect(result).toContain('暂无');
        expect(result).toContain('无');
        expect(result).toContain('未知时间');
        expect(result).toContain('- 无');
    });

    it('renders dynamic hints as list items', () => {
        const result = 构建世界演变上下文文本({ dynamicHints: ['hint1', 'hint2'] });
        expect(result).toContain('- hint1');
        expect(result).toContain('- hint2');
    });

    it('renders due hints as list items', () => {
        const result = 构建世界演变上下文文本({ dueHints: ['due1'] });
        expect(result).toContain('- due1');
    });

    it('renders current turn body', () => {
        const result = 构建世界演变上下文文本({ currentTurnBody: '  action text  ' });
        expect(result).toContain('action text');
    });

    it('serializes world prompt as JSON', () => {
        const result = 构建世界演变上下文文本({ worldPrompt: 'custom world' });
        expect(result).toContain('custom world');
    });

    it('includes evolution candidates combining dynamic and due hints', () => {
        const result = 构建世界演变上下文文本({
            dynamicHints: ['dyn'],
            dueHints: ['due'],
        });
        expect(result).toContain('线索驱动：dyn');
        expect(result).toContain('到期驱动：due');
    });

    it('handles empty arrays for hints', () => {
        const result = 构建世界演变上下文文本({
            dynamicHints: [],
            dueHints: [],
        });
        expect(result).toContain('- 无');
    });
});
