import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    构建NPC记忆总结回退文案,
    构建自动NPC记忆总结候选,
    构建手动NPC记忆总结候选,
    应用NPC记忆总结,
    构建NPC记忆展示结果,
} from './npcMemorySummary';

vi.mock('./memoryUtils', () => ({
    规范化记忆配置: vi.fn((c: any) => ({ NPC记忆总结阈值: 20, ...c })),
}));
vi.mock('./timeUtils', () => ({
    normalizeCanonicalGameTime: vi.fn((t: string) => t || ''),
}));

describe('npcMemorySummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('构建NPC记忆总结回退文案', () => {
        it('returns default message when all memories are empty', () => {
            const batch = [{ 时间: '2026-04-30', 内容: '' }, { 时间: '2026-04-30', 内容: '   ' }];
            const result = 构建NPC记忆总结回退文案(batch as any);
            expect(result).toContain('2 条可追溯记忆');
        });

        it('returns default message when batch is empty', () => {
            const result = 构建NPC记忆总结回退文案([]);
            expect(result).toContain('0 条可追溯记忆');
        });

        it('shows preview of unique memories', () => {
            const batch = [
                { 时间: '2026-04-30', 内容: '第一次相遇' },
                { 时间: '2026-04-31', 内容: '第二次相遇' },
            ];
            const result = 构建NPC记忆总结回退文案(batch as any);
            expect(result).toContain('第一次相遇');
            expect(result).toContain('第二次相遇');
        });

        it('truncates long memory previews', () => {
            const batch = [
                { 时间: '2026-04-30', 内容: '这是一个非常非常长的记忆内容，超过二十八个字符的超长记忆内容' },
            ];
            const result = 构建NPC记忆总结回退文案(batch as any);
            expect(result).toContain('...');
        });

        it('deduplicates identical content', () => {
            const batch = [
                { 时间: '2026-04-30', 内容: '相同内容' },
                { 时间: '2026-04-31', 内容: '相同内容' },
                { 时间: '2026-04-32', 内容: '不同内容' },
            ];
            const result = 构建NPC记忆总结回退文案(batch as any);
            expect(result).toContain('相同内容');
            expect(result).toContain('不同内容');
            const matches = result.match(/相同内容/g);
            expect(matches?.length).toBe(1);
        });

        it('shows up to 3 previews with suffix when more', () => {
            const batch = [
                { 时间: 't1', 内容: '记忆1' },
                { 时间: 't2', 内容: '记忆2' },
                { 时间: 't3', 内容: '记忆3' },
                { 时间: 't4', 内容: '记忆4' },
            ];
            const result = 构建NPC记忆总结回退文案(batch as any);
            expect(result).toContain('记忆1');
            expect(result).toContain('记忆2');
            expect(result).toContain('记忆3');
            expect(result).not.toContain('记忆4');
            expect(result).toContain('等经历逐渐沉淀');
        });
    });

    describe('构建自动NPC记忆总结候选', () => {
        it('returns null when not enough memories', () => {
            const memories = [{ 时间: '2026-04-30', 内容: '一条记忆' }];
            const result = 构建自动NPC记忆总结候选(memories as any, {});
            expect(result).toBeNull();
        });

        it('returns null for empty memories', () => {
            expect(构建自动NPC记忆总结候选(undefined, {})).toBeNull();
            expect(构建自动NPC记忆总结候选([], {})).toBeNull();
        });

        it('creates candidate when threshold met', () => {
            const memories = Array.from({ length: 20 }, (_, i) => ({
                时间: `2026-04-${String(i + 1).padStart(2, '0')}`,
                内容: `记忆${i + 1}`,
            }));
            const result = 构建自动NPC记忆总结候选(memories as any, {});
            expect(result).not.toBeNull();
            expect(result?.批次条数).toBeLessThan(20);
            expect(result?.预留原始条数).toBeGreaterThan(0);
            expect(result?.起始原始索引).toBe(0);
        });

        it('uses custom threshold from config', () => {
            const memories = Array.from({ length: 10 }, (_, i) => ({
                时间: `2026-04-${String(i + 1).padStart(2, '0')}`,
                内容: `记忆${i + 1}`,
            }));
            const result = 构建自动NPC记忆总结候选(memories as any, { NPC记忆总结阈值: 5 });
            expect(result).not.toBeNull();
        });

        it('filters empty content memories', () => {
            const memories = [
                { 时间: 't1', 内容: '' },
                { 时间: 't2', 内容: '   ' },
                { 时间: 't3', 内容: 'valid' },
            ];
            const result = 构建自动NPC记忆总结候选(memories as any, { NPC记忆总结阈值: 5 });
            expect(result).toBeNull();
        });

        it('sets correct time range', () => {
            const memories = [
                { 时间: '2026-04-01T00:00:00', 内容: 'first' },
                { 时间: '2026-04-02T00:00:00', 内容: 'second' },
                { 时间: '2026-04-03T00:00:00', 内容: 'third' },
                { 时间: '2026-04-04T00:00:00', 内容: 'fourth' },
                { 时间: '2026-04-05T00:00:00', 内容: 'last' },
            ];
            // threshold is Math.max(5, config阈值||20), so pass 5
            const result = 构建自动NPC记忆总结候选(memories as any, { NPC记忆总结阈值: 5 });
            expect(result).not.toBeNull();
            expect(result?.起始时间).toBeTruthy();
        });
    });

    describe('构建手动NPC记忆总结候选', () => {
        it('returns null when less than 2 memories', () => {
            const memories = [{ 时间: '2026-04-30', 内容: '一条' }];
            const result = 构建手动NPC记忆总结候选(memories as any, {});
            expect(result).toBeNull();
        });

        it('returns null for empty/undefined', () => {
            expect(构建手动NPC记忆总结候选(undefined, {})).toBeNull();
        });

        it('creates candidate with all but reserved memories', () => {
            const memories = Array.from({ length: 10 }, (_, i) => ({
                时间: `2026-04-${String(i + 1).padStart(2, '0')}`,
                内容: `记忆${i + 1}`,
            }));
            const result = 构建手动NPC记忆总结候选(memories as any, {});
            expect(result).not.toBeNull();
            expect(result?.批次条数).toBeLessThan(10);
            expect(result?.预留原始条数).toBeGreaterThan(0);
        });

        it('creates candidate for exactly 2 memories', () => {
            const memories = [
                { 时间: 't1', 内容: 'first' },
                { 时间: 't2', 内容: 'second' },
            ];
            const result = 构建手动NPC记忆总结候选(memories as any, {});
            expect(result).not.toBeNull();
            expect(result?.批次条数).toBe(1);
        });
    });

    describe('应用NPC记忆总结', () => {
        const createNpc = (memories: any[] = [], summaries: any[] = []) => ({
            id: 'npc_1',
            姓名: '测试NPC',
            记忆: memories,
            总结记忆: summaries,
        });

        const createCandidate = (batchSize: number): any => ({
            批次: Array.from({ length: batchSize }, (_, i) => ({ 时间: `t${i}`, 内容: `m${i}` })),
            批次条数: batchSize,
            起始原始索引: 0,
            结束原始索引: batchSize - 1,
            起始时间: 't0',
            结束时间: `t${batchSize - 1}`,
            预留原始条数: 0,
        });

        it('adds summary and removes batched memories', () => {
            const npc = createNpc([
                { 时间: 't1', 内容: '记忆1' },
                { 时间: 't2', 内容: '记忆2' },
                { 时间: 't3', 内容: '记忆3' },
            ]);
            const candidate = createCandidate(2);
            const result = 应用NPC记忆总结(npc, candidate, '总结内容');

            expect(result.总结记忆).toHaveLength(1);
            expect(result.总结记忆[0].内容).toBe('总结内容');
            expect(result.记忆).toHaveLength(1);
            expect(result.记忆[0].内容).toBe('记忆3');
        });

        it('uses fallback text when summary is empty', () => {
            const npc = createNpc([
                { 时间: 't1', 内容: '记忆1' },
                { 时间: 't2', 内容: '记忆2' },
            ]);
            const candidate = createCandidate(2);
            const result = 应用NPC记忆总结(npc, candidate, '');

            expect(result.总结记忆[0].内容).toBeTruthy();
            expect(result.总结记忆[0].内容.length).toBeGreaterThan(0);
        });

        it('appends to existing summaries', () => {
            const npc = createNpc(
                [{ 时间: 't1', 内容: '新记忆1' }, { 时间: 't2', 内容: '新记忆2' }],
                [{ 开始索引: 0, 结束索引: 4, 内容: '旧总结', 时间: 'old' }]
            );
            const candidate = createCandidate(2);
            const result = 应用NPC记忆总结(npc, candidate, '新总结');

            expect(result.总结记忆).toHaveLength(2);
            expect(result.总结记忆[0].内容).toBe('旧总结');
            expect(result.总结记忆[1].内容).toBe('新总结');
        });

        it('sets correct summary indices', () => {
            const npc = createNpc(
                [{ 时间: 't1', 内容: 'm1' }, { 时间: 't2', 内容: 'm2' }],
                [{ 开始索引: 0, 结束索引: 4, 内容: 'old', 时间: 'old' }]
            );
            const candidate = createCandidate(2);
            const result = 应用NPC记忆总结(npc, candidate, '新总结');

            expect(result.总结记忆[1].开始索引).toBe(5);
            expect(result.总结记忆[1].结束索引).toBe(6);
        });
    });

    describe('构建NPC记忆展示结果', () => {
        it('returns empty arrays for empty input', () => {
            const result = 构建NPC记忆展示结果(undefined, undefined);
            expect(result.总结记忆).toEqual([]);
            expect(result.记忆).toEqual([]);
            expect(result.原始总数).toBe(0);
        });

        it('formats summaries with index ranges', () => {
            const summaries = [
                { 开始索引: 0, 结束索引: 4, 内容: '总结1', 时间: 't1-t4', 条数: 5 },
                { 开始索引: 5, 结束索引: 9, 内容: '总结2', 时间: 't5-t9', 条数: 5 },
            ];
            const result = 构建NPC记忆展示结果(summaries as any, []);
            expect(result.总结记忆).toHaveLength(2);
            expect(result.总结记忆[0].标签).toBe('[0]');
            expect(result.总结记忆[0].索引范围).toBe('[0-4]');
            expect(result.总结记忆[1].标签).toBe('[1]');
        });

        it('formats memories with raw indices', () => {
            const summaries = [{ 开始索引: 0, 结束索引: 4, 内容: '总结', 时间: 't', 条数: 5 }];
            const memories = [
                { 时间: 't5', 内容: '记忆1' },
                { 时间: 't6', 内容: '记忆2' },
            ];
            const result = 构建NPC记忆展示结果(summaries as any, memories as any);
            expect(result.记忆).toHaveLength(2);
            expect(result.记忆[0].原始索引).toBe(5);
            expect(result.记忆[0].标签).toBe('[5]');
            expect(result.记忆[1].原始索引).toBe(6);
        });

        it('calculates total count correctly', () => {
            const summaries = [{ 开始索引: 0, 结束索引: 4, 内容: '总结', 时间: 't', 条数: 5 }];
            const memories = [
                { 时间: 't5', 内容: '记忆1' },
                { 时间: 't6', 内容: '记忆2' },
            ];
            const result = 构建NPC记忆展示结果(summaries as any, memories as any);
            expect(result.原始总数).toBe(7);
        });

        it('handles memories without summaries', () => {
            const memories = [
                { 时间: 't1', 内容: '记忆1' },
                { 时间: 't2', 内容: '记忆2' },
            ];
            const result = 构建NPC记忆展示结果([], memories as any);
            expect(result.记忆[0].原始索引).toBe(0);
            expect(result.记忆[1].原始索引).toBe(1);
            expect(result.原始总数).toBe(2);
        });

        it('filters empty content from memories', () => {
            const memories = [
                { 时间: 't1', 内容: 'valid' },
                { 时间: 't2', 内容: '' },
                { 时间: 't3', 内容: '   ' },
            ];
            const result = 构建NPC记忆展示结果([], memories as any);
            expect(result.记忆).toHaveLength(1);
        });
    });
});
