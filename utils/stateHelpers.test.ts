import { describe, it, expect } from 'vitest';
import { normalizeStateCommandKey, applyStateCommand, readGameStateValueByPath } from './stateHelpers';

const emptyChar: any = {};
const emptyEnv: any = {};
const emptySocial: any[] = [];
const emptyWorld: any = {};
const emptyBattle: any = {};
const emptyStory: any = {};
const emptyStoryPlan: any = {};

function baseState(): Record<string, any> {
    return {
        char: { ...emptyChar, 姓名: '测试角色' } as any,
        env: { ...emptyEnv, 天气: '晴' } as any,
        social: [...emptySocial],
        world: { ...emptyWorld },
        battle: { ...emptyBattle },
        story: { ...emptyStory },
        storyPlan: { ...emptyStoryPlan },
        heroinePlan: undefined,
        fandomStoryPlan: undefined,
        fandomHeroinePlan: undefined,
        sect: {},
        tasks: [],
        agreements: [],
    };
}

describe('normalizeStateCommandKey — direct paths', () => {
    it('passes through gameState. paths unchanged', () => {
        expect(normalizeStateCommandKey('gameState.角色')).toBe('gameState.角色');
        expect(normalizeStateCommandKey('gameState.角色.姓名')).toBe('gameState.角色.姓名');
    });

    it('wraps bare root keys', () => {
        expect(normalizeStateCommandKey('角色')).toBe('gameState.角色');
        expect(normalizeStateCommandKey('环境')).toBe('gameState.环境');
        expect(normalizeStateCommandKey('世界')).toBe('gameState.世界');
    });

    it('wraps dotted root paths', () => {
        expect(normalizeStateCommandKey('角色.姓名')).toBe('gameState.角色.姓名');
        expect(normalizeStateCommandKey('环境.天气')).toBe('gameState.环境.天气');
    });

    it('wraps bracket paths', () => {
        expect(normalizeStateCommandKey('社交[0]')).toBe('gameState.社交[0]');
    });
});

describe('normalizeStateCommandKey — alias resolution', () => {
    it('maps 战斗态势 to 战斗', () => {
        expect(normalizeStateCommandKey('战斗态势')).toBe('gameState.战斗');
    });

    it('maps 战斗态势.主角.X to 角色.X', () => {
        expect(normalizeStateCommandKey('战斗态势.主角.姓名')).toBe('gameState.角色.姓名');
    });

    it('maps 战斗态势.角色.X to 角色.X', () => {
        expect(normalizeStateCommandKey('战斗态势.角色.内力')).toBe('gameState.角色.内力');
    });

    it('maps 战斗态势.rest to 战斗.rest', () => {
        expect(normalizeStateCommandKey('战斗态势.回合数')).toBe('gameState.战斗.回合数');
    });
});

describe('normalizeStateCommandKey — relative field inference', () => {
    it('infers 世界 from 活跃NPC列表', () => {
        expect(normalizeStateCommandKey('活跃NPC列表')).toBe('gameState.世界.活跃NPC列表');
        expect(normalizeStateCommandKey('活跃NPC列表[0]')).toBe('gameState.世界.活跃NPC列表[0]');
    });

    it('infers 环境 from 天气', () => {
        expect(normalizeStateCommandKey('天气')).toBe('gameState.环境.天气');
    });

    it('infers 剧情 from 当前章节', () => {
        expect(normalizeStateCommandKey('当前章节')).toBe('gameState.剧情.当前章节');
    });

    it('infers 剧情规划 from 当前章目标', () => {
        expect(normalizeStateCommandKey('当前章目标')).toBe('gameState.剧情规划.当前章目标');
    });

    it('infers 女主剧情规划 from 阶段推进', () => {
        expect(normalizeStateCommandKey('阶段推进')).toBe('gameState.女主剧情规划.阶段推进');
    });

    it('infers 同人剧情规划 from 当前对齐信息', () => {
        expect(normalizeStateCommandKey('当前对齐信息')).toBe('gameState.同人剧情规划.当前对齐信息');
    });

    it('returns raw key for unknown paths', () => {
        expect(normalizeStateCommandKey('unknownField')).toBe('unknownField');
    });

    it('returns empty string for empty input', () => {
        expect(normalizeStateCommandKey('')).toBe('');
        expect(normalizeStateCommandKey('   ')).toBe('');
    });
});

describe('applyStateCommand — set action', () => {
    it('sets a top-level character field', () => {
        const state = baseState();
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色.姓名', '新名字', 'set'
        );
        expect(result.char.姓名).toBe('新名字');
        expect(result.env.天气).toBe('晴'); // unchanged
    });

    it('replaces entire root object', () => {
        const state = baseState();
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '环境', { 天气: '雨' } as any, 'set'
        );
        expect(result.env).toEqual({ 天气: '雨' });
    });

    it('creates nested structure from undefined', () => {
        const state = baseState();
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色.新字段.深层', 'value', 'set'
        );
        expect((result.char as any).新字段.深层).toBe('value');
    });
});

describe('applyStateCommand — push action', () => {
    it('pushes to an array field', () => {
        const state = { ...baseState(), social: [{ 名称: 'NPC1' } as any] };
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '社交', { 名称: 'NPC2' }, 'push'
        );
        expect(result.social).toHaveLength(2);
        expect(result.social[1].名称).toBe('NPC2');
    });

    it('initializes array if undefined and pushes', () => {
        const state = baseState();
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '任务列表', { 名称: 'task1' }, 'push'
        );
        expect(result.tasks).toHaveLength(1);
        expect((result.tasks[0] as any).名称).toBe('task1');
    });

    it('pushes to nested array field', () => {
        const state = baseState();
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '世界.活跃NPC列表', { 名称: 'NPC' }, 'push'
        );
        expect((result.world as any).活跃NPC列表).toHaveLength(1);
    });
});

describe('applyStateCommand — add/sub actions', () => {
    it('adds numeric values', () => {
        const state = { ...baseState(), char: { ...emptyChar, 经验: 100 } as any };
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色.经验', 50, 'add'
        );
        expect(result.char.经验).toBe(150);
    });

    it('subtracts numeric values', () => {
        const state = { ...baseState(), char: { ...emptyChar, 经验: 100 } as any };
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色.经验', 30, 'sub'
        );
        expect(result.char.经验).toBe(70);
    });
});

describe('applyStateCommand — delete action', () => {
    it('deletes a property', () => {
        const state = { ...baseState(), char: { ...emptyChar, 临时字段: 'delete me' } };
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色.临时字段', undefined, 'delete'
        );
        expect((result.char as any).临时字段).toBeUndefined();
    });

    it('removes array element by index', () => {
        const state = { ...baseState(), tasks: [{ 名称: 'task1' }, { 名称: 'task2' }] };
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '任务列表[0]', undefined, 'delete'
        );
        expect(result.tasks).toHaveLength(1);
        expect((result.tasks[0] as any).名称).toBe('task2');
    });
});

describe('applyStateCommand — merge behavior', () => {
    it('deep merges objects on set', () => {
        const state = { ...baseState(), char: { ...emptyChar, 等级: 5, 经验: 100 } };
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色', { 经验: 200 }, 'set'
        );
        expect(result.char.等级).toBe(5); // preserved
        expect(result.char.经验).toBe(200); // overwritten
    });
});

describe('applyStateCommand — immutability', () => {
    it('does not mutate input state', () => {
        const state = baseState();
        const originalCharName = state.char.姓名;
        const originalEnvWeather = state.env.天气;

        applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色.姓名', '新名字', 'set'
        );

        expect(state.char.姓名).toBe(originalCharName);
        expect(state.env.天气).toBe(originalEnvWeather);
    });

    it('returns independent copies', () => {
        const state = baseState();
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色.姓名', '新名字', 'set'
        );
        (result.char as any).姓名 = '再次修改';
        // Should not affect another call's result
        const result2 = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            '角色', {}, 'set'
        );
        expect(result2.char.姓名).toBe('测试角色');
    });
});

describe('applyStateCommand — unrecognized keys', () => {
    it('returns unchanged state for unknown paths', () => {
        const state = baseState();
        const result = applyStateCommand(
            state.char, state.env, state.social, state.world, state.battle,
            state.story, state.storyPlan, state.heroinePlan,
            state.fandomStoryPlan, state.fandomHeroinePlan,
            state.sect, state.tasks, state.agreements,
            'unknownPath', 'value', 'set'
        );
        expect(result.char.姓名).toBe('测试角色');
    });
});

describe('readGameStateValueByPath', () => {
    it('reads top-level root', () => {
        const state = { 角色: { 姓名: '英雄' }, 环境: { 天气: '晴' } };
        expect(readGameStateValueByPath(state, '角色')).toEqual({ 姓名: '英雄' });
    });

    it('reads nested field', () => {
        const state = { 角色: { 姓名: '英雄' }, 环境: { 天气: '晴' } };
        expect(readGameStateValueByPath(state, '角色.姓名')).toBe('英雄');
    });

    it('reads array element by index', () => {
        const state = { 社交: [{ 名称: 'NPC1' }, { 名称: 'NPC2' }] };
        expect(readGameStateValueByPath(state, '社交[0].名称')).toBe('NPC1');
    });

    it('infers 世界 fields', () => {
        const state = { 世界: { 活跃NPC列表: [{ 名称: 'NPC' }] } };
        expect(readGameStateValueByPath(state, '活跃NPC列表[0].名称')).toBe('NPC');
    });

    it('infers 环境 fields', () => {
        const state = { 环境: { 天气: '雪' } };
        expect(readGameStateValueByPath(state, '天气')).toBe('雪');
    });

    it('returns undefined for missing paths', () => {
        const state = { 角色: {} };
        expect(readGameStateValueByPath(state, '角色.不存在的字段')).toBeUndefined();
    });

    it('returns undefined for non-gameState paths', () => {
        const state = { something: 'value' };
        expect(readGameStateValueByPath(state, 'something')).toBeUndefined();
    });

    it('handles 战斗态势 alias for reading', () => {
        const state = { 角色: { 内力: 50 } };
        expect(readGameStateValueByPath(state, '战斗态势.主角.内力')).toBe(50);
    });
});
