import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建回档快照系统 } from './rollbackSnapshot';
import * as dbService from '../../services/dbService';

vi.mock('../../services/dbService', () => ({
    删除最近自动存档: vi.fn(),
}));

const mock删除最近自动存档 = vi.mocked(dbService.删除最近自动存档);

function makeDeepCopy<T>(value: T): T {
    if (value === undefined) return undefined as T;
    return JSON.parse(JSON.stringify(value));
}

function makeDeps(overrides: any = {}) {
    return {
        回合快照栈Ref: { current: [] as any[] },
        可重Roll计数: 0,
        set可重Roll计数: vi.fn(),
        最近自动存档时间戳Ref: { current: 0 },
        最近自动存档签名Ref: { current: '' },
        深拷贝: makeDeepCopy,
        规范化角色物品容器映射: vi.fn((v: any) => v),
        规范化环境信息: vi.fn((v: any) => v),
        规范化社交列表: vi.fn((v: any[]) => v),
        规范化世界状态: vi.fn((v: any) => v),
        规范化剧情状态: vi.fn((v: any) => v),
        规范化剧情规划状态: vi.fn((v: any) => v),
        规范化女主剧情规划状态: vi.fn((v: any) => v),
        规范化同人剧情规划状态: vi.fn((v: any) => v),
        规范化同人女主剧情规划状态: vi.fn((v: any) => v),
        应用并同步记忆系统: vi.fn(),
        设置历史记录: vi.fn(),
        应用视觉设置到状态: vi.fn(),
        应用场景图片档案到状态: vi.fn(),
        ...overrides,
    };
}

function makeSnapshot(overrides: any = {}) {
    return {
        玩家输入: '玩家输入',
        游戏时间: '2026-04-30T00:00:00',
        回档前状态: {
            角色: { 姓名: '李四' },
            环境: { 年: 2026 },
            社交: [],
            世界: {},
            战斗: {},
            玩家门派: {},
            任务列表: [],
            约定列表: [],
            剧情: {},
            剧情规划: {},
            女主剧情规划: {},
            同人剧情规划: {},
            同人女主剧情规划: {},
            记忆系统: { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] },
        },
        回档前持久态: {
            视觉设置: { 主题: 'dark' },
            场景图片档案: {},
        },
        回档前历史: [{ role: 'user', content: 'hello' }],
        ...overrides,
    };
}

describe('创建回档快照系统', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('同步重Roll计数', () => {
        it('syncs count to stack length', () => {
            const deps = makeDeps();
            const { 同步重Roll计数 } = 创建回档快照系统(deps);
            deps.回合快照栈Ref.current = [{}, {}, {}];
            同步重Roll计数();
            expect(deps.set可重Roll计数).toHaveBeenCalledWith(3);
        });
    });

    describe('清空重Roll快照', () => {
        it('clears the stack and syncs count', () => {
            const deps = makeDeps({
                回合快照栈Ref: { current: [makeSnapshot(), makeSnapshot()] },
            });
            const { 清空重Roll快照 } = 创建回档快照系统(deps);
            清空重Roll快照();
            expect(deps.回合快照栈Ref.current).toEqual([]);
            expect(deps.set可重Roll计数).toHaveBeenCalledWith(0);
        });
    });

    describe('推入重Roll快照', () => {
        it('pushes snapshot to stack and syncs count', () => {
            const deps = makeDeps();
            const { 推入重Roll快照 } = 创建回档快照系统(deps);
            const snapshot = makeSnapshot();
            推入重Roll快照(snapshot);
            expect(deps.回合快照栈Ref.current).toHaveLength(1);
            expect(deps.回合快照栈Ref.current[0]).toBe(snapshot);
            expect(deps.set可重Roll计数).toHaveBeenCalledWith(1);
        });
    });

    describe('弹出重Roll快照', () => {
        it('pops and returns the last snapshot', () => {
            const snapshot1 = makeSnapshot({ 玩家输入: 'first' });
            const snapshot2 = makeSnapshot({ 玩家输入: 'second' });
            const deps = makeDeps({
                回合快照栈Ref: { current: [snapshot1, snapshot2] },
            });
            const { 弹出重Roll快照 } = 创建回档快照系统(deps);
            const result = 弹出重Roll快照();
            expect(result).toBe(snapshot2);
            expect(deps.回合快照栈Ref.current).toHaveLength(1);
            expect(deps.回合快照栈Ref.current[0]).toBe(snapshot1);
        });

        it('returns null when stack is empty', () => {
            const deps = makeDeps();
            const { 弹出重Roll快照 } = 创建回档快照系统(deps);
            const result = 弹出重Roll快照();
            expect(result).toBeNull();
        });
    });

    describe('回档到快照', () => {
        it('restores history and memory', () => {
            const deps = makeDeps();
            const { 回档到快照 } = 创建回档快照系统(deps);
            const snapshot = makeSnapshot();
            回档到快照(snapshot);
            expect(deps.设置历史记录).toHaveBeenCalledWith(snapshot.回档前历史);
            expect(deps.应用并同步记忆系统).toHaveBeenCalledWith(snapshot.回档前状态.记忆系统);
        });

        it('applies visual and image state by default', () => {
            const deps = makeDeps();
            const { 回档到快照 } = 创建回档快照系统(deps);
            const snapshot = makeSnapshot();
            回档到快照(snapshot);
            expect(deps.应用视觉设置到状态).toHaveBeenCalled();
            expect(deps.应用场景图片档案到状态).toHaveBeenCalled();
        });

        it('skips visual and image state when 保留图片状态=true', () => {
            const deps = makeDeps();
            const { 回档到快照 } = 创建回档快照系统(deps);
            const snapshot = makeSnapshot();
            回档到快照(snapshot, { 保留图片状态: true });
            expect(deps.应用视觉设置到状态).not.toHaveBeenCalled();
            expect(deps.应用场景图片档案到状态).not.toHaveBeenCalled();
        });
    });

    describe('重置自动存档状态', () => {
        it('resets timestamp and signature refs', () => {
            const deps = makeDeps({
                最近自动存档时间戳Ref: { current: 12345 },
                最近自动存档签名Ref: { current: 'sig' },
            });
            const { 重置自动存档状态 } = 创建回档快照系统(deps);
            重置自动存档状态();
            expect(deps.最近自动存档时间戳Ref.current).toBe(0);
            expect(deps.最近自动存档签名Ref.current).toBe('');
        });
    });

    describe('删除最近自动存档并重置状态', () => {
        it('deletes auto-save and resets state', async () => {
            mock删除最近自动存档.mockResolvedValue(undefined);
            const deps = makeDeps({
                最近自动存档时间戳Ref: { current: 12345 },
                最近自动存档签名Ref: { current: 'sig' },
            });
            const { 删除最近自动存档并重置状态 } = 创建回档快照系统(deps);
            await 删除最近自动存档并重置状态();
            expect(mock删除最近自动存档).toHaveBeenCalled();
            expect(deps.最近自动存档时间戳Ref.current).toBe(0);
        });

        it('resets state even if delete fails', async () => {
            mock删除最近自动存档.mockRejectedValue(new Error('db error'));
            const deps = makeDeps({
                最近自动存档时间戳Ref: { current: 12345 },
                最近自动存档签名Ref: { current: 'sig' },
            });
            const { 删除最近自动存档并重置状态 } = 创建回档快照系统(deps);
            await 删除最近自动存档并重置状态();
            expect(deps.最近自动存档时间戳Ref.current).toBe(0);
            expect(deps.最近自动存档签名Ref.current).toBe('');
        });
    });
});
