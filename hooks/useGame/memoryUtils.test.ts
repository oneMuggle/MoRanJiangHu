import { describe, it, expect } from 'vitest';
import {
    即时短期分隔标记,
    拆分即时与短期,
    格式化回忆名称,
    从即时记忆推导回忆档案,
    规范化记忆系统,
    规范化记忆配置,
    解析记忆条目时间信息,
    构建带时间戳的记忆条目,
    格式化短期记忆展示文本,
    构建待处理记忆压缩任务,
    构建手动记忆压缩任务,
    应用记忆压缩结果,
    生成记忆摘要,
    格式化记忆时间,
    构建即时记忆条目,
    构建短期记忆条目,
    合并即时与短期,
    写入四段记忆,
} from './memoryUtils';

describe('拆分即时与短期', () => {
    it('splits at the separator', () => {
        const entry = '即时内容' + 即时短期分隔标记 + '短期摘要';
        const result = 拆分即时与短期(entry);
        expect(result.即时内容).toBe('即时内容');
        expect(result.短期摘要).toBe('短期摘要');
    });

    it('returns all content as 即时 when no separator', () => {
        const result = 拆分即时与短期('no separator');
        expect(result.即时内容).toBe('no separator');
        expect(result.短期摘要).toBe('');
    });

    it('handles empty input', () => {
        const result = 拆分即时与短期('');
        expect(result.即时内容).toBe('');
        expect(result.短期摘要).toBe('');
    });
});

describe('格式化回忆名称', () => {
    it('formats with zero-padded round number', () => {
        expect(格式化回忆名称(1)).toBe('【回忆001】');
        expect(格式化回忆名称(42)).toBe('【回忆042】');
        expect(格式化回忆名称(100)).toBe('【回忆100】');
    });

    it('uses minimum 1 for zero/negative', () => {
        expect(格式化回忆名称(0)).toBe('【回忆001】');
        expect(格式化回忆名称(-5)).toBe('【回忆001】');
    });
});

describe('从即时记忆推导回忆档案', () => {
    it('creates回忆档案 from 即时记忆', () => {
        const items = ['内容1' + 即时短期分隔标记 + '摘要1', '内容2' + 即时短期分隔标记 + '摘要2'];
        const result = 从即时记忆推导回忆档案(items);
        expect(result).toHaveLength(2);
        expect(result[0].名称).toBe('【回忆001】');
        expect(result[0].概括).toBe('摘要1');
        expect(result[0].原文).toBe('内容1');
        expect(result[1].名称).toBe('【回忆002】');
    });

    it('filters empty entries', () => {
        const result = 从即时记忆推导回忆档案(['', '   ']);
        expect(result).toHaveLength(0);
    });
});

describe('规范化记忆系统', () => {
    it('creates default structure for null input', () => {
        const result = 规范化记忆系统(null);
        expect(result.即时记忆).toEqual([]);
        expect(result.回忆档案).toEqual([]);
        expect(result.短期记忆).toEqual([]);
    });

    it('derives回忆档案 from 即时记忆 when not provided', () => {
        const raw = { 即时记忆: ['content' + 即时短期分隔标记 + 'summary'] };
        const result = 规范化记忆系统(raw as any);
        expect(result.回忆档案).toHaveLength(1);
    });

    it('normalizes provided回忆档案', () => {
        const raw = {
            回忆档案: [{ 名称: '自定义', 概括: 'g', 原文: 'o', 回合: 5, 记录时间: 't1', 时间戳: 't2' }],
        };
        const result = 规范化记忆系统(raw as any);
        expect(result.回忆档案[0].名称).toBe('自定义');
        expect(result.回忆档案[0].回合).toBe(5);
    });
});

describe('规范化记忆配置', () => {
    it('uses defaults for null input', () => {
        const result = 规范化记忆配置(null);
        expect(result.短期记忆阈值).toBeGreaterThanOrEqual(5);
        expect(result.中期记忆阈值).toBeGreaterThanOrEqual(20);
    });

    it('respects provided values', () => {
        const result = 规范化记忆配置({ 短期记忆阈值: 10, 中期记忆阈值: 30 } as any);
        expect(result.短期记忆阈值).toBe(10);
        expect(result.中期记忆阈值).toBe(30);
    });

    it('enforces minimum thresholds', () => {
        const result = 规范化记忆配置({ 短期记忆阈值: 1, NPC记忆总结阈值: 0 } as any);
        expect(result.短期记忆阈值).toBe(5);
        expect(result.NPC记忆总结阈值).toBe(20);
    });
});

describe('解析记忆条目时间信息', () => {
    it('parses time-prefixed content', () => {
        const result = 解析记忆条目时间信息('【2026:04:30:14:00】some content');
        expect(result.开始时间).toBe('2026:04:30:14:00');
        expect(result.内容).toBe('some content');
    });

    it('parses time range', () => {
        const result = 解析记忆条目时间信息('【2026:04:30:14:00 - 2026:04:30:15:00】content');
        expect(result.开始时间).toBe('2026:04:30:14:00');
        expect(result.结束时间).toBe('2026:04:30:15:00');
    });

    it('returns raw content when no time prefix', () => {
        const result = 解析记忆条目时间信息('no time prefix');
        expect(result.开始时间).toBe('');
        expect(result.内容).toBe('no time prefix');
    });

    it('handles empty input', () => {
        const result = 解析记忆条目时间信息('');
        expect(result.开始时间).toBe('');
        expect(result.结束时间).toBe('');
        expect(result.内容).toBe('');
    });
});

describe('构建带时间戳的记忆条目', () => {
    it('adds time prefix to content', () => {
        const result = 构建带时间戳的记忆条目('content', '2026:04:30:14:00');
        expect(result).toContain('【2026:04:30:14:00】');
        expect(result).toContain('content');
    });

    it('adds time range when both provided', () => {
        const result = 构建带时间戳的记忆条目('content', '2026:04:30:14:00', '2026:04:30:15:00');
        expect(result).toContain('【2026:04:30:14:00 - 2026:04:30:15:00】');
    });

    it('returns just content when no start time', () => {
        const result = 构建带时间戳的记忆条目('content');
        expect(result).toBe('content');
    });
});

describe('格式化短期记忆展示文本', () => {
    it('formats time-prefixed memory', () => {
        const result = 格式化短期记忆展示文本('【2026:04:30:14:00】content');
        expect(result).toContain('【2026:04:30:14:00】');
        expect(result).toContain('content');
    });

    it('returns raw text when no time prefix', () => {
        const result = 格式化短期记忆展示文本('plain text');
        expect(result).toBe('plain text');
    });
});

describe('构建待处理记忆压缩任务', () => {
    it('returns null when within limits', () => {
        const memory = { 即时记忆: [], 短期记忆: ['m1'], 中期记忆: [], 长期记忆: [] };
        const config = { 短期记忆阈值: 30, 中期记忆阈值: 50 };
        const result = 构建待处理记忆压缩任务(memory as any, config as any);
        expect(result).toBeNull();
    });

    it('creates short-to-mid task when exceeded', () => {
        const shortItems = Array(31).fill('short memory');
        const memory = { 即时记忆: [], 短期记忆: shortItems, 中期记忆: [], 长期记忆: [] };
        const config = { 短期记忆阈值: 5, 中期记忆阈值: 50 };
        const result = 构建待处理记忆压缩任务(memory as any, config as any);
        expect(result).not.toBeNull();
        expect(result.来源层).toBe('短期');
        expect(result.目标层).toBe('中期');
    });

    it('creates mid-to-long task when short within limit', () => {
        const midItems = Array(51).fill('mid memory');
        const memory = { 即时记忆: [], 短期记忆: ['m1'], 中期记忆: midItems, 长期记忆: [] };
        const config = { 短期记忆阈值: 30, 中期记忆阈值: 5 };
        const result = 构建待处理记忆压缩任务(memory as any, config as any);
        expect(result).not.toBeNull();
        expect(result.来源层).toBe('中期');
        expect(result.目标层).toBe('长期');
    });
});

describe('构建手动记忆压缩任务', () => {
    it('creates manual task for short-term', () => {
        const memory = { 即时记忆: [], 短期记忆: ['m1', 'm2', 'm3'], 中期记忆: [], 长期记忆: [] };
        const config = { 短期记忆阈值: 30, 中期记忆阈值: 50 };
        const result = 构建手动记忆压缩任务(memory as any, config as any, '短期', 0, 1);
        expect(result).not.toBeNull();
        expect(result.来源层).toBe('短期');
        expect(result.触发方式).toBe('manual');
    });

    it('returns null for empty source', () => {
        const memory = { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] };
        const config = {};
        const result = 构建手动记忆压缩任务(memory as any, config as any, '短期', 0, 1);
        expect(result).toBeNull();
    });
});

describe('应用记忆压缩结果', () => {
    it('removes source entries and adds summary to target', () => {
        const memory = {
            即时记忆: [],
            短期记忆: ['entry1', 'entry2', 'entry3'],
            中期记忆: [],
            长期记忆: [],
        };
        const task = {
            来源层: '短期' as const,
            目标层: '中期' as const,
            起始索引: 0,
            结束索引: 1,
            起始时间: '2026:04:30:14:00',
            结束时间: '2026:04:30:15:00',
            批次: [],
            批次条数: 0,
            id: 'test',
            提示词模板: '',
        };
        const result = 应用记忆压缩结果(memory as any, task, 'compressed summary');
        expect(result.短期记忆.length).toBe(1);
        expect(result.中期记忆.length).toBe(1);
        expect(result.中期记忆[0]).toContain('compressed summary');
    });
});

describe('生成记忆摘要', () => {
    it('generates summary from batch', () => {
        const result = 生成记忆摘要(['entry1', 'entry2', 'entry3'], '短期');
        expect(result).toContain('短期汇总');
        expect(result).toContain('entry1');
    });

    it('handles empty batch', () => {
        const result = 生成记忆摘要([], '中期');
        expect(result).toBe('中期记忆汇总（空）');
    });
});

describe('格式化记忆时间', () => {
    it('formats valid time', () => {
        const result = 格式化记忆时间('2026:04:30:14:00');
        expect(result).toBe('【2026:04:30:14:00】');
    });

    it('handles invalid time', () => {
        const result = 格式化记忆时间('not-a-time');
        expect(result).toBe('【not-a-time】');
    });

    it('handles non-string', () => {
        const result = 格式化记忆时间(123 as any);
        expect(result).toBe('【未知时间】');
    });
});

describe('构建即时记忆条目', () => {
    it('includes time, player input, and AI output', () => {
        const aiData = {
            logs: [{ sender: '旁白', text: '剧情推进' }],
        } as any;
        const result = 构建即时记忆条目('2026:04:30:14:00', '玩家操作', aiData);
        expect(result).toContain('【2026:04:30:14:00】');
        expect(result).toContain('玩家输入：玩家操作');
        expect(result).toContain('AI输出');
        expect(result).toContain('旁白');
    });

    it('omits player input when flag set', () => {
        const aiData = { logs: [] } as any;
        const result = 构建即时记忆条目('2026:04:30:14:00', 'input', aiData, { 省略玩家输入: true });
        expect(result).not.toContain('玩家输入');
    });

    it('handles empty logs', () => {
        const aiData = { logs: [] } as any;
        const result = 构建即时记忆条目('2026:04:30:14:00', 'input', aiData);
        expect(result).toContain('无有效剧情日志');
    });
});

describe('构建短期记忆条目', () => {
    it('uses shortTerm field when available', () => {
        const aiData = { shortTerm: 'short term summary' } as any;
        const result = 构建短期记忆条目('2026:04:30:14:00', aiData);
        expect(result).toContain('short term summary');
    });

    it('falls back to logs', () => {
        const aiData = { logs: [{ sender: '旁白', text: 'log fallback' }] } as any;
        const result = 构建短期记忆条目('2026:04:30:14:00', aiData);
        expect(result).toContain('旁白');
    });

    it('adds time prefix', () => {
        const aiData = { shortTerm: 'summary' } as any;
        const result = 构建短期记忆条目('2026:04:30:14:00', aiData);
        expect(result).toContain('【2026:04:30:14:00】');
    });
});

describe('合并即时与短期', () => {
    it('combines with separator', () => {
        const result = 合并即时与短期('immediate', 'summary');
        expect(result).toContain('immediate');
        expect(result).toContain('summary');
        expect(result).toContain(即时短期分隔标记);
    });

    it('returns just immediate when no summary', () => {
        const result = 合并即时与短期('immediate', '');
        expect(result).toBe('immediate');
        expect(result).not.toContain(即时短期分隔标记);
    });
});

describe('写入四段记忆', () => {
    it('writes to 即时记忆 and回忆档案', () => {
        const memory = { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] } as any;
        const result = 写入四段记忆(memory, 'immediate', 'summary');
        expect(result.即时记忆).toHaveLength(1);
        expect(result.回忆档案).toHaveLength(1);
    });

    it('only writes短期 when no immediate', () => {
        const memory = { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] } as any;
        const result = 写入四段记忆(memory, '', 'summary only');
        expect(result.即时记忆).toHaveLength(0);
        expect(result.短期记忆).toHaveLength(1);
    });

    it('does nothing for empty input', () => {
        const memory = { 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [], 回忆档案: [] } as any;
        const result = 写入四段记忆(memory, '', '');
        expect(result.即时记忆).toHaveLength(0);
        expect(result.短期记忆).toHaveLength(0);
    });

    it('shifts exceeded即时记忆 to短期', () => {
        const existing = Array(3).fill('existing' + 即时短期分隔标记 + 'summary');
        const memory = {
            即时记忆: [...existing],
            短期记忆: [],
            中期记忆: [],
            长期记忆: [],
            回忆档案: [],
        } as any;
        const result = 写入四段记忆(memory, 'new immediate', 'new summary', { immediateLimit: 3 });
        expect(result.短期记忆.length).toBeGreaterThanOrEqual(1);
    });
});
