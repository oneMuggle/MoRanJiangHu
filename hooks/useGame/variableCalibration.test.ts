import { describe, it, expect, vi } from 'vitest';
import { 执行变量自动校准 } from './variableCalibration';
import type { 变量校准状态 } from './variableCalibration';

function makeDeps(): any {
    return {
        规范化环境信息: vi.fn((env: any) => env || {}),
        规范化社交列表: vi.fn((list: any) => list || []),
        规范化世界状态: vi.fn((world: any) => world || {}),
        规范化战斗状态: vi.fn((battle: any) => battle || {}),
        规范化门派状态: vi.fn((sect: any) => sect || {}),
        规范化剧情状态: vi.fn((story: any) => story || {}),
        规范化剧情规划状态: vi.fn((plan: any) => plan || {}),
        规范化女主剧情规划状态: vi.fn((plan: any) => plan),
        规范化同人剧情规划状态: vi.fn((plan: any) => plan),
        规范化同人女主剧情规划状态: vi.fn((plan: any) => plan),
        规范化角色物品容器映射: vi.fn((char: any) => char || {}),
    };
}

function makeState(overrides: any = {}): 变量校准状态 {
    return {
        角色: {
            当前精力: 100, 最大精力: 100,
            当前内力: 50, 最大内力: 50,
            当前饱腹: 80, 最大饱腹: 100,
            当前口渴: 20, 最大口渴: 100,
            头部当前血量: 100, 头部最大血量: 100,
            胸部当前血量: 100, 胸部最大血量: 100,
            腹部当前血量: 100, 腹部最大血量: 100,
            左手当前血量: 100, 左手最大血量: 100,
            右手当前血量: 100, 右手最大血量: 100,
            左腿当前血量: 100, 左腿最大血量: 100,
            右腿当前血量: 100, 右腿最大血量: 100,
        },
        环境: {},
        社交: [],
        世界: {},
        战斗: {},
        玩家门派: {},
        任务列表: [],
        约定列表: [],
        剧情: {},
        剧情规划: {},
        ...overrides,
    } as 变量校准状态;
}

describe('执行变量自动校准 — 精力/内力/饱腹/口渴', () => {
    it('does not correct valid values', () => {
        const state = makeState();
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.corrections).toHaveLength(0);
    });

    it('clamps current above max', () => {
        const state = makeState({ 角色: { ...makeState().角色, 当前精力: 200, 最大精力: 100 } });
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.corrections.some((c) => c.includes('精力') && c.includes('200 -> 100'))).toBe(true);
        expect((result.state.角色 as any).当前精力).toBe(100);
    });

    it('clamps current below zero', () => {
        const state = makeState({ 角色: { ...makeState().角色, 当前内力: -10 } });
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.corrections.some((c) => c.includes('内力') && c.includes('-10 -> 0'))).toBe(true);
        expect((result.state.角色 as any).当前内力).toBe(0);
    });

    it('clamps NaN to min', () => {
        const state = makeState({ 角色: { ...makeState().角色, 当前饱腹: NaN, 最大饱腹: 100 } });
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.corrections.some((c) => c.includes('饱腹'))).toBe(true);
        expect((result.state.角色 as any).当前饱腹).toBe(0);
    });

    it('defaults missing max to 0', () => {
        const baseRole = { ...makeState().角色 };
        delete (baseRole as any).最大口渴;
        delete (baseRole as any).当前口渴;
        const state = makeState({ 角色: { ...baseRole, 当前口渴: 50 } });
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.corrections.some((c) => c.includes('口渴'))).toBe(true);
        expect((result.state.角色 as any).当前口渴).toBe(0);
        expect((result.state.角色 as any).最大口渴).toBe(0);
    });
});

describe('执行变量自动校准 — 部位血量', () => {
    it('clamps all 7 body parts', () => {
        const role = { ...makeState().角色 };
        (role as any).头部当前血量 = 150;
        (role as any).胸部当前血量 = -20;
        (role as any).腹部当前血量 = 50;
        (role as any).腹部最大血量 = 40;
        const state = makeState({ 角色: role });
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.corrections.length).toBeGreaterThan(0);
        expect((result.state.角色 as any).头部当前血量).toBe(100);
        expect((result.state.角色 as any).胸部当前血量).toBe(0);
        expect((result.state.角色 as any).腹部当前血量).toBe(40);
    });

    it('valid body part values produce no correction', () => {
        const state = makeState();
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.corrections.filter((c) => c.includes('血量'))).toHaveLength(0);
    });
});

describe('执行变量自动校准 — 委托规范化', () => {
    it('calls all normalization deps', () => {
        const deps = makeDeps();
        const state = makeState();
        执行变量自动校准(state, deps);
        expect(deps.规范化环境信息).toHaveBeenCalled();
        expect(deps.规范化社交列表).toHaveBeenCalled();
        expect(deps.规范化世界状态).toHaveBeenCalled();
        expect(deps.规范化战斗状态).toHaveBeenCalled();
        expect(deps.规范化门派状态).toHaveBeenCalled();
        expect(deps.规范化剧情状态).toHaveBeenCalled();
        expect(deps.规范化剧情规划状态).toHaveBeenCalled();
    });

    it('handles non-array tasks/agreements', () => {
        const state = makeState({ 任务列表: null, 约定列表: 'not-array' });
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.state.任务列表).toEqual([]);
        expect(result.state.约定列表).toEqual([]);
    });

    it('preserves array tasks/agreements', () => {
        const state = makeState({ 任务列表: [{ 名称: 't1' }], 约定列表: [{ 描述: 'a1' }] });
        const result = 执行变量自动校准(state, makeDeps());
        expect(result.state.任务列表).toEqual([{ 名称: 't1' }]);
        expect(result.state.约定列表).toEqual([{ 描述: 'a1' }]);
    });
});
