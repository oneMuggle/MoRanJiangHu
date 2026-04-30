import { describe, it, expect, vi } from 'vitest';
import { 按世界演变分流净化响应 } from './storyResponseGuards';

vi.mock('../../utils/stateHelpers', () => ({
    normalizeStateCommandKey: vi.fn((key: string) => key),
}));

function makeResponse(overrides: any = {}) {
    return {
        logs: [],
        tavern_commands: [],
        ...overrides,
    } as any;
}

describe('按世界演变分流净化响应', () => {
    it('passes through response when disabled', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'set', key: 'gameState.世界.地图', value: 'test' },
            ],
        });
        const result = 按世界演变分流净化响应(response, false);
        expect(result.response).toBe(response);
        expect(result.removedWorldCommands).toEqual([]);
        expect(result.appendedDynamicHints).toEqual([]);
    });

    it('keeps non-world commands and removes world commands', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'set', key: 'gameState.角色.气血', value: 100 },
                { action: 'set', key: 'gameState.世界.事件', value: 'war' },
                { action: 'push', key: 'gameState.社交', value: { 姓名: '张三' } },
            ],
        });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.response.tavern_commands).toHaveLength(2);
        expect(result.removedWorldCommands).toHaveLength(1);
        expect(result.removedWorldCommands[0].key).toBe('gameState.世界.事件');
    });

    it('generates dynamic hints for removed world commands', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'set', key: 'gameState.世界.事件', value: 'war started' },
            ],
        });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.appendedDynamicHints).toHaveLength(1);
        expect(result.appendedDynamicHints[0]).toContain('主剧情提及世界层变化');
        expect(result.appendedDynamicHints[0]).toContain('世界.事件');
    });

    it('uses "新增" prefix for push actions', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'push', key: 'gameState.世界.国家', value: { 名称: '楚国' } },
            ],
        });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.appendedDynamicHints[0]).toContain('主剧情提及世界层新增');
    });

    it('uses "移除" prefix for delete actions', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'delete', key: 'gameState.世界.国家', value: 'old' },
            ],
        });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.appendedDynamicHints[0]).toContain('主剧情提及世界层移除');
        expect(result.appendedDynamicHints[0]).not.toContain('=>');
    });

    it('truncates long values in hints', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'set', key: 'gameState.世界.描述', value: 'a'.repeat(100) },
            ],
        });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.appendedDynamicHints[0]).toContain('...');
    });

    it('handles array values in hints', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'set', key: 'gameState.世界.列表', value: [1, 2, 3, 4, 5] },
            ],
        });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.appendedDynamicHints[0]).toContain('数组(5)');
    });

    it('handles object values with 标题 in hints', () => {
        const response = makeResponse({
            tavern_commands: [
                { action: 'set', key: 'gameState.世界.对象', value: { 标题: 'The War' } },
            ],
        });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.appendedDynamicHints[0]).toContain('对象(The War)');
    });

    it('handles empty commands array', () => {
        const response = makeResponse({ tavern_commands: [] });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.removedWorldCommands).toEqual([]);
        expect(result.appendedDynamicHints).toEqual([]);
    });

    it('handles response without tavern_commands', () => {
        const response = makeResponse({ tavern_commands: undefined });
        const result = 按世界演变分流净化响应(response, true);
        expect(result.removedWorldCommands).toEqual([]);
        expect(result.appendedDynamicHints).toEqual([]);
    });
});
