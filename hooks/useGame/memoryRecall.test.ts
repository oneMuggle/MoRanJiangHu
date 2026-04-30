import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    提取剧情回忆标签,
    解析剧情回忆输出,
    预筛剧情回忆候选,
    构建剧情回忆检索上下文,
    基于候选生成回忆回退结果,
    根据检索结果构建剧情回忆标签,
} from './memoryRecall';

describe('提取剧情回忆标签', () => {
    it('extracts content between tags', () => {
        const { cleanInput, recallTag } = 提取剧情回忆标签('hello<剧情回忆>recall this</剧情回忆>world');
        expect(recallTag).toBe('recall this');
        expect(cleanInput).toBe('helloworld');
    });

    it('handles multiple tags', () => {
        const { recallTag } = 提取剧情回忆标签('<剧情回忆>first</剧情回忆><剧情回忆>second</剧情回忆>');
        expect(recallTag).toContain('first');
        expect(recallTag).toContain('second');
    });

    it('returns empty recallTag when no tags', () => {
        const { cleanInput, recallTag } = 提取剧情回忆标签('no tags here');
        expect(recallTag).toBe('');
        expect(cleanInput).toBe('no tags here');
    });

    it('handles empty content', () => {
        const { cleanInput, recallTag } = 提取剧情回忆标签('<剧情回忆></剧情回忆>');
        expect(recallTag).toBe('');
        expect(cleanInput).toBe('');
    });

    it('handles non-string input', () => {
        const result = 提取剧情回忆标签(null as any);
        expect(result.recallTag).toBe('');
    });
});

describe('解析剧情回忆输出', () => {
    it('parses strong and weak recall lines', () => {
        const result = 解析剧情回忆输出('强回忆:【回忆001】|【回忆002】\n弱回忆:【回忆003】');
        expect(result.strongIds).toEqual(['【回忆001】', '【回忆002】']);
        expect(result.weakIds).toEqual(['【回忆003】']);
    });

    it('defaults to 无 when lines missing', () => {
        const result = 解析剧情回忆输出('some random text');
        expect(result.normalizedText).toContain('强回忆:无');
        expect(result.normalizedText).toContain('弱回忆:无');
    });

    it('deduplicates weak from strong', () => {
        const result = 解析剧情回忆输出('强回忆:【回忆001】\n弱回忆:【回忆001】|【回忆002】');
        expect(result.strongIds).toEqual(['【回忆001】']);
        expect(result.weakIds).toEqual(['【回忆002】']);
    });

    it('handles Chinese colon', () => {
        const result = 解析剧情回忆输出('强回忆：【回忆001】');
        expect(result.strongIds).toEqual(['【回忆001】']);
    });

    it('handles empty input', () => {
        const result = 解析剧情回忆输出('');
        expect(result.strongIds).toEqual([]);
        expect(result.weakIds).toEqual([]);
    });
});

describe('预筛剧情回忆候选', () => {
    it('returns empty for no archives', () => {
        const result = 预筛剧情回忆候选('query', { 回忆档案: [] }, 20);
        expect(result).toEqual([]);
    });

    it('scores candidates by relevance', () => {
        const mem = {
            回忆档案: [
                { 名称: '【回忆001】', 概括: 'sword fight', 原文: 'player used sword', 回合: 1 },
                { 名称: '【回忆002】', 概括: 'eating food', 原文: 'player ate rice', 回合: 2 },
            ],
        };
        const result = 预筛剧情回忆候选('sword', mem as any, 20);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].相关度).toBeGreaterThanOrEqual(0);
    });

    it('includes recent items by reserve', () => {
        const archives = Array.from({ length: 10 }, (_, i) => ({
            名称: `【回忆${String(i + 1).padStart(3, '0')}】`,
            概括: `summary ${i}`,
            原文: `raw ${i}`,
            回合: i + 1,
        }));
        const mem = { 回忆档案: archives, 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] };
        const result = 预筛剧情回忆候选('query', mem as any, 5, { recentReserve: 3 });
        const rounds = result.map(r => r.回合);
        expect(rounds).toContain(10);
    });

    it('respects topK limit', () => {
        const archives = Array.from({ length: 50 }, (_, i) => ({
            名称: `【回忆${String(i + 1).padStart(3, '0')}】`,
            概括: `summary ${i}`,
            原文: `raw ${i}`,
            回合: i + 1,
        }));
        const mem = { 回忆档案: archives, 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] };
        const result = 预筛剧情回忆候选('query', mem as any, 5, { topK: 4, recentReserve: 1 });
        expect(result.length).toBeLessThanOrEqual(5);
    });

    it('extracts chinese terms from query', () => {
        const mem = {
            回忆档案: [{ 名称: '【回忆001】', 概括: '华山论剑', 原文: '华山论剑', 回合: 1 }],
        };
        const result = 预筛剧情回忆候选('华山剑法', mem as any, 20);
        expect(result.length).toBe(1);
        expect(result[0].相关度).toBeGreaterThan(0);
    });
});

describe('构建剧情回忆检索上下文', () => {
    it('returns 暂无可用回忆 for empty archives', () => {
        const result = 构建剧情回忆检索上下文({ 回忆档案: [] }, 20);
        expect(result).toBe('暂无可用回忆。');
    });

    it('includes candidate marker when provided', () => {
        const mem = {
            回忆档案: [{ 名称: '【回忆001】', 概括: 'summary', 原文: 'full text', 回合: 1 }],
        };
        const result = 构建剧情回忆检索上下文(mem as any, 20, { candidateIds: ['【回忆001】'] });
        expect(result).toContain('本地预筛：可能相关');
    });

    it('shows full text for recent items', () => {
        const mem = {
            回忆档案: [{ 名称: '【回忆001】', 概括: 'summary', 原文: 'full text', 回合: 1 }],
        };
        const result = 构建剧情回忆检索上下文(mem as any, 1);
        expect(result).toContain('原文：');
        expect(result).toContain('full text');
    });

    it('shows short summary for older items', () => {
        const archives = Array.from({ length: 5 }, (_, i) => ({
            名称: `【回忆${String(i + 1).padStart(3, '0')}】`,
            概括: `summary ${i}`,
            原文: `raw ${i}`,
            回合: i + 1,
        }));
        const mem = { 回忆档案: archives, 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] };
        const result = 构建剧情回忆检索上下文(mem as any, 2);
        expect(result).toContain('短期记忆：');
    });
});

describe('基于候选生成回忆回退结果', () => {
    it('returns strong/weak from sorted candidates', () => {
        const candidates = [
            { id: 'A', 相关度: 100, 排序值: 0, 回合: 1, 概括: '', 原文: '', 是否完整原文: false },
            { id: 'B', 相关度: 80, 排序值: 1, 回合: 2, 概括: '', 原文: '', 是否完整原文: false },
            { id: 'C', 相关度: 5, 排序值: 2, 回合: 3, 概括: '', 原文: '', 是否完整原文: false },
        ];
        const result = 基于候选生成回忆回退结果(candidates);
        expect(result.strongIds).toContain('A');
        expect(result.normalizedText).toContain('强回忆:');
        expect(result.normalizedText).toContain('弱回忆:');
    });

    it('handles empty candidates', () => {
        const result = 基于候选生成回忆回退结果([]);
        expect(result.strongIds).toEqual([]);
        expect(result.weakIds).toEqual([]);
        expect(result.normalizedText).toContain('强回忆:无');
    });

    it('caps strong at 6', () => {
        const candidates = Array.from({ length: 10 }, (_, i) => ({
            id: `item${i}`, 相关度: 100 - i * 5, 排序值: i, 回合: i + 1,
            概括: '', 原文: '', 是否完整原文: false,
        }));
        const result = 基于候选生成回忆回退结果(candidates);
        expect(result.strongIds.length).toBeLessThanOrEqual(6);
    });
});

describe('根据检索结果构建剧情回忆标签', () => {
    it('includes strong recall full text', () => {
        const mem = {
            回忆档案: [{ 名称: '【回忆001】', 概括: 'summary', 原文: 'full text', 回合: 1 }],
        };
        const result = 根据检索结果构建剧情回忆标签(mem as any, { strongIds: ['【回忆001】'], weakIds: [] });
        expect(result).toContain('强回忆：');
        expect(result).toContain('full text');
    });

    it('includes weak recall summaries', () => {
        const mem = {
            回忆档案: [{ 名称: '【回忆002】', 概括: 'weak summary', 原文: 'full text', 回合: 2 }],
        };
        const result = 根据检索结果构建剧情回忆标签(mem as any, { strongIds: [], weakIds: ['【回忆002】'] });
        expect(result).toContain('weak summary');
    });

    it('shows 无 when no ids', () => {
        const mem = { 回忆档案: [] };
        const result = 根据检索结果构建剧情回忆标签(mem as any, { strongIds: [], weakIds: [] });
        expect(result).toContain('强回忆：');
        expect(result).toContain('无');
        expect(result).toContain('弱回忆：');
    });

    it('deduplicates strong ids', () => {
        const mem = {
            回忆档案: [{ 名称: '【回忆001】', 概括: 's', 原文: 't', 回合: 1 }],
        };
        const result = 根据检索结果构建剧情回忆标签(mem as any, {
            strongIds: ['【回忆001】', '【回忆001】'],
            weakIds: [],
        });
        const strongMatches = result.match(/【回忆001】/g) || [];
        expect(strongMatches.length).toBe(1);
    });
});
