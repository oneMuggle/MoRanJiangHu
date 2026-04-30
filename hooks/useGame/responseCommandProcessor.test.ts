import { describe, it, expect, vi } from 'vitest';
import { 执行响应命令处理 } from './responseCommandProcessor';
import * as stateHelpers from '../../utils/stateHelpers';

vi.mock('../../utils/stateHelpers', () => ({
    applyStateCommand: vi.fn((char, env, social, world, battle, story, storyPlan, heroinePlan, fandomStoryPlan, fandomHeroinePlan, sect, tasks, agreements, key, value, action) => {
        return { char, env, social, world, battle, story, storyPlan, heroinePlan, fandomStoryPlan, fandomHeroinePlan, sect, tasks, agreements };
    }),
}));

const mockApplyStateCommand = vi.mocked(stateHelpers.applyStateCommand);

function makeState(overrides: any = {}) {
    return {
        角色: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [] } as any,
        环境: { 时间: '2026:04:30:14:00', 大地点: '江南' } as any,
        社交: [] as any[],
        世界: { 世界种子: 'seed' } as any,
        战斗: { 状态: 'idle' } as any,
        玩家门派: { 门派名称: '华山' } as any,
        任务列表: [] as any[],
        约定列表: [] as any[],
        剧情: { 当前章节: null } as any,
        剧情规划: {} as any,
        ...overrides,
    };
}

function makeDeps(overrides: any = {}) {
    return {
        规范化环境信息: vi.fn((env: any) => env || {}),
        规范化社交列表: vi.fn((list: any) => Array.isArray(list) ? list : []),
        规范化世界状态: vi.fn((w: any) => w || {}),
        规范化战斗状态: vi.fn((b: any) => b || {}),
        规范化门派状态: vi.fn((s: any) => s || {}),
        规范化剧情状态: vi.fn((s: any) => s || {}),
        规范化剧情规划状态: vi.fn((p: any) => p || {}),
        规范化女主剧情规划状态: vi.fn((p: any) => undefined),
        规范化同人剧情规划状态: vi.fn((p: any) => undefined),
        规范化同人女主剧情规划状态: vi.fn((p: any) => undefined),
        规范化角色物品容器映射: vi.fn((r: any) => r || {}),
        战斗结束自动清空: vi.fn((b: any) => b),
        命令后校准: undefined,
        设置角色: vi.fn(),
        设置环境: vi.fn(),
        设置社交: vi.fn(),
        设置世界: vi.fn(),
        设置战斗: vi.fn(),
        设置玩家门派: vi.fn(),
        设置任务列表: vi.fn(),
        设置约定列表: vi.fn(),
        设置剧情: vi.fn(),
        设置剧情规划: vi.fn(),
        设置女主剧情规划: vi.fn(),
        设置同人剧情规划: vi.fn(),
        设置同人女主剧情规划: vi.fn(),
        ...overrides,
    };
}

describe('执行响应命令处理', () => {
    it('returns current state when no commands', () => {
        const state = makeState();
        const deps = makeDeps();
        const response = { logs: [] } as any;
        const result = 执行响应命令处理(response, state, deps);
        expect(result).toBeDefined();
        expect(result.角色).toBe(state.角色);
    });

    it('processes commands via applyStateCommand', () => {
        const state = makeState();
        const deps = makeDeps();
        const response = {
            logs: [],
            tavern_commands: [
                { action: 'set', key: 'gameState.角色.气血', value: 80 },
            ],
        } as any;
        执行响应命令处理(response, state, deps);
        expect(mockApplyStateCommand).toHaveBeenCalled();
    });

    it('calls 命令后校准 if provided', () => {
        const state = makeState();
        const 命令后校准 = vi.fn((s: any) => s);
        const deps = makeDeps({ 命令后校准 });
        const response = { logs: [] } as any;
        执行响应命令处理(response, state, deps);
        expect(命令后校准).toHaveBeenCalledTimes(1);
    });

    it('applies 命令后校准 corrections', () => {
        const state = makeState();
        const 命令后校准 = vi.fn((s: any) => ({
            state: { ...s, 角色: { ...s.角色, 气血: 999 } },
            corrections: ['corrected'],
        }));
        const deps = makeDeps({ 命令后校准 });
        const response = { logs: [] } as any;
        const result = 执行响应命令处理(response, state, deps);
        expect(result.角色.气血).toBe(999);
    });

    it('applies state to setters by default (when commands present)', () => {
        const state = makeState();
        const deps = makeDeps();
        const response = {
            logs: [],
            tavern_commands: [{ action: 'set', key: 'gameState.角色.气血', value: 80 }],
        } as any;
        执行响应命令处理(response, state, deps);
        expect(deps.设置角色).toHaveBeenCalled();
    });

    it('applies state when no commands but 命令后校准 exists', () => {
        const state = makeState();
        const deps = makeDeps({ 命令后校准: vi.fn((s: any) => s) });
        const response = { logs: [] } as any;
        执行响应命令处理(response, state, deps);
        expect(deps.设置角色).toHaveBeenCalled();
    });

    it('skips state application when applyState=false', () => {
        const state = makeState();
        const deps = makeDeps();
        const response = { logs: [] } as any;
        执行响应命令处理(response, state, deps, undefined, { applyState: false });
        expect(deps.设置角色).not.toHaveBeenCalled();
        expect(deps.设置环境).not.toHaveBeenCalled();
    });

    it('preserves 气运列表 when commands clear it', () => {
        mockApplyStateCommand.mockReturnValueOnce({
            char: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [] },
            env: {}, social: [], world: {}, battle: {}, story: {}, storyPlan: {},
            heroinePlan: {}, fandomStoryPlan: {}, fandomHeroinePlan: {},
            sect: {}, tasks: [], agreements: [],
        } as any);
        const state = makeState({
            角色: { 姓名: '李四', 气血: 100, 物品列表: [], 气运列表: [{ 名称: '好运' }] },
        });
        const deps = makeDeps();
        const response = {
            logs: [],
            tavern_commands: [{ action: 'set', key: 'gameState.角色.气血', value: 80 }],
        } as any;
        const result = 执行响应命令处理(response, state, deps);
        expect(result.角色.气运列表).toHaveLength(1);
        expect(result.角色.气运列表[0].名称).toBe('好运');
    });

    it('uses baseState when provided', () => {
        const state = makeState();
        const baseState = {
            角色: { 姓名: 'BaseChar', 气血: 50, 物品列表: [], 气运列表: [] },
        };
        const deps = makeDeps();
        const response = { logs: [] } as any;
        const result = 执行响应命令处理(response, state, deps, baseState);
        expect(result.角色.姓名).toBe('BaseChar');
    });

    it('calls 战斗结束自动清空 after processing commands', () => {
        const state = makeState();
        const deps = makeDeps();
        const response = {
            logs: [],
            tavern_commands: [{ action: 'set', key: 'gameState.角色.气血', value: 80 }],
        } as any;
        执行响应命令处理(response, state, deps);
        expect(deps.战斗结束自动清空).toHaveBeenCalled();
    });

    it('calls 规范化角色物品容器映射 after commands', () => {
        const state = makeState();
        const deps = makeDeps();
        const response = {
            logs: [],
            tavern_commands: [{ action: 'set', key: 'gameState.角色.气血', value: 80 }],
        } as any;
        执行响应命令处理(response, state, deps);
        expect(deps.规范化角色物品容器映射).toHaveBeenCalled();
    });
});
