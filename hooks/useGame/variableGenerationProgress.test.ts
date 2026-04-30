import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 创建变量生成进度系统 } from './variableGenerationProgress';

function makeDeps(overrides: any = {}) {
    return {
        最近变量生成上下文Ref: { current: [] },
        变量生成中: false,
        set变量生成中: vi.fn(),
        开局变量生成进度: null,
        set开局变量生成进度: vi.fn(),
        世界演变进行中Ref: { current: false },
        variableGenerationAbortControllerRef: { current: null as AbortController | null },
        深拷贝: <T>(data: T) => JSON.parse(JSON.stringify(data)),
        ...overrides,
    };
}

describe('创建变量生成进度系统', () => {
    it('returns expected functions', () => {
        const deps = makeDeps();
        const system = 创建变量生成进度系统(deps);
        expect(typeof system.序列化变量校准命令).toBe('function');
        expect(typeof system.清空变量生成上下文缓存).toBe('function');
        expect(typeof system.记录变量生成上下文).toBe('function');
        expect(typeof system.收集最近变量生成上下文).toBe('function');
        expect(typeof system.等待世界演变空闲).toBe('function');
        expect(typeof system.handleCancelVariableGeneration).toBe('function');
    });

    describe('序列化变量校准命令', () => {
        it('serializes set command', () => {
            const { 序列化变量校准命令 } = 创建变量生成进度系统(makeDeps());
            const result = 序列化变量校准命令({ action: 'set', key: 'gameState.角色.气血', value: 100 });
            expect(result).toContain('set');
            expect(result).toContain('gameState.角色.气血');
            expect(result).toContain('100');
        });

        it('serializes delete command', () => {
            const { 序列化变量校准命令 } = 创建变量生成进度系统(makeDeps());
            const result = 序列化变量校准命令({ action: 'delete', key: 'gameState.角色.旧字段' });
            expect(result).toBe('delete gameState.角色.旧字段');
        });

        it('handles default action', () => {
            const { 序列化变量校准命令 } = 创建变量生成进度系统(makeDeps());
            const result = 序列化变量校准命令({ key: 'gameState.角色.气血', value: 100 });
            expect(result).toContain('set');
        });
    });

    describe('清空变量生成上下文缓存', () => {
        it('clears the ref', () => {
            const deps = makeDeps({
                最近变量生成上下文Ref: { current: [{ 回合: 1, 玩家输入: 'test', 正文: 'body', 本回合命令: [], 校准说明: [], 校准命令: [] }] },
            });
            const { 清空变量生成上下文缓存 } = 创建变量生成进度系统(deps);
            清空变量生成上下文缓存();
            expect(deps.最近变量生成上下文Ref.current).toEqual([]);
        });
    });

    describe('记录变量生成上下文', () => {
        it('records a valid context entry', () => {
            const deps = makeDeps();
            const { 记录变量生成上下文 } = 创建变量生成进度系统(deps);
            记录变量生成上下文({
                playerInput: 'player action',
                response: { logs: [{ sender: '旁白', text: 'story text' }] },
            });
            expect(deps.最近变量生成上下文Ref.current).toHaveLength(1);
            expect(deps.最近变量生成上下文Ref.current[0].玩家输入).toBe('player action');
        });

        it('skips when all fields empty', () => {
            const deps = makeDeps();
            const { 记录变量生成上下文 } = 创建变量生成进度系统(deps);
            记录变量生成上下文({
                playerInput: '',
                response: { logs: [], tavern_commands: [] },
            });
            expect(deps.最近变量生成上下文Ref.current).toHaveLength(0);
        });

        it('caps at 2 entries (slice -2)', () => {
            const deps = makeDeps();
            const { 记录变量生成上下文 } = 创建变量生成进度系统(deps);
            记录变量生成上下文({ playerInput: 'a', response: { logs: [{ sender: '旁白', text: 'b' }] } });
            记录变量生成上下文({ playerInput: 'c', response: { logs: [{ sender: '旁白', text: 'd' }] } });
            记录变量生成上下文({ playerInput: 'e', response: { logs: [{ sender: '旁白', text: 'f' }] } });
            expect(deps.最近变量生成上下文Ref.current).toHaveLength(2);
        });

        it('extracts calibration reports', () => {
            const deps = makeDeps();
            const { 记录变量生成上下文 } = 创建变量生成进度系统(deps);
            记录变量生成上下文({
                playerInput: 'input',
                response: {
                    logs: [{ sender: '旁白', text: 'body' }],
                    variable_calibration_report: ['NPC updated', 'Quest advanced'],
                },
            });
            expect(deps.最近变量生成上下文Ref.current[0].校准说明).toEqual(['NPC updated', 'Quest advanced']);
        });

        it('serializes tavern_commands', () => {
            const deps = makeDeps();
            const { 记录变量生成上下文 } = 创建变量生成进度系统(deps);
            记录变量生成上下文({
                playerInput: 'input',
                response: {
                    logs: [{ sender: '旁白', text: 'body' }],
                    tavern_commands: [{ action: 'set', key: 'gameState.角色.气血', value: 100 }],
                },
            });
            expect(deps.最近变量生成上下文Ref.current[0].本回合命令.length).toBeGreaterThan(0);
        });
    });

    describe('收集最近变量生成上下文', () => {
        it('uses cache first', () => {
            const cachedItem = { 回合: 1, 玩家输入: 'cached', 正文: 'body', 本回合命令: [], 校准说明: [], 校准命令: [] };
            const deps = makeDeps({
                最近变量生成上下文Ref: { current: [cachedItem] },
            });
            const { 收集最近变量生成上下文 } = 创建变量生成进度系统(deps);
            const result = 收集最近变量生成上下文([], 2);
            expect(result).toHaveLength(1);
            expect(result[0].玩家输入).toBe('cached');
        });

        it('collects from history when cache empty', () => {
            const deps = makeDeps({ 最近变量生成上下文Ref: { current: [] } });
            const history = [
                { role: 'user', content: 'player input' },
                {
                    role: 'assistant',
                    structuredResponse: {
                        logs: [{ sender: '旁白', text: 'response body' }],
                        tavern_commands: [],
                    },
                },
            ];
            const { 收集最近变量生成上下文 } = 创建变量生成进度系统(deps);
            const result = 收集最近变量生成上下文(history as any, 2);
            expect(result).toHaveLength(1);
            expect(result[0].玩家输入).toBe('player input');
        });

        it('respects limit', () => {
            const deps = makeDeps({ 最近变量生成上下文Ref: { current: [] } });
            const history = [
                { role: 'user', content: 'input1' },
                { role: 'assistant', structuredResponse: { logs: [{ sender: '旁白', text: 'body1' }], tavern_commands: [] } },
                { role: 'user', content: 'input2' },
                { role: 'assistant', structuredResponse: { logs: [{ sender: '旁白', text: 'body2' }], tavern_commands: [] } },
                { role: 'user', content: 'input3' },
                { role: 'assistant', structuredResponse: { logs: [{ sender: '旁白', text: 'body3' }], tavern_commands: [] } },
            ];
            const { 收集最近变量生成上下文 } = 创建变量生成进度系统(deps);
            const result = 收集最近变量生成上下文(history as any, 2);
            expect(result).toHaveLength(2);
        });

        it('skips empty turns', () => {
            const deps = makeDeps({ 最近变量生成上下文Ref: { current: [] } });
            const history = [
                { role: 'user', content: '' },
                { role: 'assistant', structuredResponse: { logs: [], tavern_commands: [] } },
            ];
            const { 收集最近变量生成上下文 } = 创建变量生成进度系统(deps);
            const result = 收集最近变量生成上下文(history as any, 2);
            expect(result).toHaveLength(0);
        });

        it('handles non-array history', () => {
            const deps = makeDeps({ 最近变量生成上下文Ref: { current: [] } });
            const { 收集最近变量生成上下文 } = 创建变量生成进度系统(deps);
            const result = 收集最近变量生成上下文(null as any, 2);
            expect(result).toEqual([]);
        });
    });

    describe('等待世界演变空闲', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('resolves immediately when not busy', async () => {
            const deps = makeDeps({ 世界演变进行中Ref: { current: false } });
            const { 等待世界演变空闲 } = 创建变量生成进度系统(deps);
            await expect(等待世界演变空闲()).resolves.toBeUndefined();
        });

        it('times out when busy', async () => {
            const deps = makeDeps({ 世界演变进行中Ref: { current: true } });
            const { 等待世界演变空闲 } = 创建变量生成进度系统(deps);
            const promise = 等待世界演变空闲(undefined, 50);
            // Advance fake time past the timeout (50ms) + one poll interval (80ms)
            await vi.advanceTimersByTimeAsync(150);
            await expect(promise).resolves.toBeUndefined();
        });
    });

    describe('handleCancelVariableGeneration', () => {
        it('aborts the controller', () => {
            const controller = new AbortController();
            const deps = makeDeps({
                variableGenerationAbortControllerRef: { current: controller },
            });
            const { handleCancelVariableGeneration } = 创建变量生成进度系统(deps);
            handleCancelVariableGeneration();
            expect(controller.signal.aborted).toBe(true);
        });

        it('does nothing when no controller', () => {
            const deps = makeDeps({
                variableGenerationAbortControllerRef: { current: null },
            });
            const { handleCancelVariableGeneration } = 创建变量生成进度系统(deps);
            expect(() => handleCancelVariableGeneration()).not.toThrow();
        });
    });
});
