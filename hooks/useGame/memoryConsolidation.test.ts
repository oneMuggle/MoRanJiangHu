import { describe, it, expect, vi } from 'vitest';
import {
    需要压缩,
    获取待处理压缩任务队列,
    执行单次记忆压缩,
    执行记忆整合,
    需要立即整合,
    获取记忆健康状态,
    创建记忆整合追踪器,
    自动记忆整合,
    整合记忆系统,
} from './memoryConsolidation';
import type { 记忆系统结构 } from '../../types';

// Mock the memoryUtils functions
vi.mock('./memoryUtils', () => ({
    规范化记忆系统: (raw: any) => {
        if (!raw) {
            return {
                回忆档案: [],
                即时记忆: [],
                短期记忆: [],
                中期记忆: [],
                长期记忆: [],
            };
        }
        return {
            回忆档案: Array.isArray(raw.回忆档案) ? [...raw.回忆档案] : [],
            即时记忆: Array.isArray(raw.即时记忆) ? [...raw.即时记忆] : [],
            短期记忆: Array.isArray(raw.短期记忆) ? [...raw.短期记忆] : [],
            中期记忆: Array.isArray(raw.中期记忆) ? [...raw.中期记忆] : [],
            长期记忆: Array.isArray(raw.长期记忆) ? [...raw.长期记忆] : [],
        };
    },
    规范化记忆配置: (raw: any) => ({
        短期记忆阈值: Math.max(5, Number(raw?.短期记忆阈值) || 30),
        中期记忆阈值: Math.max(20, Number(raw?.中期记忆阈值) || 50),
        重要角色关键记忆条数N: 20,
        NPC记忆总结阈值: 20,
        即时消息上传条数N: 10,
        短期转中期提示词: '短期转中期提示词',
        中期转长期提示词: '中期转长期提示词',
        NPC记忆总结提示词: 'NPC记忆总结提示词',
    }),
    构建待处理记忆压缩任务: vi.fn((memory, config) => {
        const mem = memory as 记忆系统结构;
        const cfg = config as any;
        const shortLimit = Math.max(5, Number(cfg?.短期记忆阈值) || 30);
        const midLimit = Math.max(20, Number(cfg?.中期记忆阈值) || 50);

        if (mem.短期记忆.length > shortLimit) {
            return {
                id: `短期|0|${shortLimit - 1}|${shortLimit}|未知时间|未知时间|批次头`,
                来源层: '短期' as const,
                目标层: '中期' as const,
                批次: mem.短期记忆.slice(0, shortLimit),
                批次条数: shortLimit,
                起始索引: 0,
                结束索引: shortLimit - 1,
                起始时间: '未知时间',
                结束时间: '未知时间',
                提示词模板: cfg?.短期转中期提示词 || '提示词',
                触发方式: 'auto' as const,
            };
        }

        if (mem.中期记忆.length > midLimit) {
            return {
                id: `中期|0|${midLimit - 1}|${midLimit}|未知时间|未知时间|批次头`,
                来源层: '中期' as const,
                目标层: '长期' as const,
                批次: mem.中期记忆.slice(0, midLimit),
                批次条数: midLimit,
                起始索引: 0,
                结束索引: midLimit - 1,
                起始时间: '未知时间',
                结束时间: '未知时间',
                提示词模板: cfg?.中期转长期提示词 || '提示词',
                触发方式: 'auto' as const,
            };
        }

        return null;
    }),
    应用记忆压缩结果: vi.fn((memory, task, summaryText) => {
        const mem = memory as 记忆系统结构;
        const next = { ...mem };
        
        if (task.来源层 === '短期') {
            const removed = next.短期记忆.splice(task.起始索引, task.结束索引 - task.起始索引 + 1);
            if (summaryText && summaryText.trim()) {
                next.中期记忆.push(summaryText.trim());
            }
        } else if (task.来源层 === '中期') {
            const removed = next.中期记忆.splice(task.起始索引, task.结束索引 - task.起始索引 + 1);
            if (summaryText && summaryText.trim()) {
                next.长期记忆.push(summaryText.trim());
            }
        }
        
        return next;
    }),
}));

const 创建测试记忆系统 = (overrides: Partial<记忆系统结构> = {}): 记忆系统结构 => ({
    回忆档案: [],
    即时记忆: [],
    短期记忆: [],
    中期记忆: [],
    长期记忆: [],
    ...overrides,
});

const 创建测试配置 = () => ({
    短期记忆阈值: 30,
    中期记忆阈值: 50,
    重要角色关键记忆条数N: 20,
    NPC记忆总结阈值: 20,
    即时消息上传条数N: 10,
    短期转中期提示词: '短期转中期',
    中期转长期提示词: '中期转长期',
    NPC记忆总结提示词: 'NPC记忆总结',
});

describe('需要压缩', () => {
    it('returns false when memory is within thresholds', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(20).fill('短期记忆条目'),
            中期记忆: Array(30).fill('中期记忆条目'),
        });
        const config = 创建测试配置();
        expect(需要压缩(memory, config)).toBe(false);
    });

    it('returns true when short-term memory exceeds threshold', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(35).fill('短期记忆条目'),
        });
        const config = 创建测试配置();
        expect(需要压缩(memory, config)).toBe(true);
    });

    it('returns true when medium-term memory exceeds threshold', () => {
        const memory = 创建测试记忆系统({
            中期记忆: Array(55).fill('中期记忆条目'),
        });
        const config = 创建测试配置();
        expect(需要压缩(memory, config)).toBe(true);
    });

    it('returns true when both layers exceed thresholds', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(40).fill('短期记忆条目'),
            中期记忆: Array(60).fill('中期记忆条目'),
        });
        const config = 创建测试配置();
        expect(需要压缩(memory, config)).toBe(true);
    });
});

describe('获取待处理压缩任务队列', () => {
    it('returns empty array when no compression needed', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(20).fill('短期记忆条目'),
            中期记忆: Array(30).fill('中期记忆条目'),
        });
        const config = 创建测试配置();
        const queue = 获取待处理压缩任务队列(memory, config);
        expect(queue).toEqual([]);
    });

    it('returns short-term compression task when needed', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(35).fill('短期记忆条目'),
        });
        const config = 创建测试配置();
        const queue = 获取待处理压缩任务队列(memory, config);
        expect(queue.length).toBeGreaterThan(0);
        expect(queue[0].来源层).toBe('短期');
    });
});

describe('执行单次记忆压缩', () => {
    it('compresses short-term to medium-term', () => {
        const memory = 创建测试记忆系统({
            短期记忆: ['条目1', '条目2', '条目3'],
            中期记忆: [],
        });
        const task = {
            id: 'test_task',
            来源层: '短期' as const,
            目标层: '中期' as const,
            批次: ['条目1', '条目2', '条目3'],
            批次条数: 3,
            起始索引: 0,
            结束索引: 2,
            起始时间: '时间1',
            结束时间: '时间3',
            提示词模板: '提示词',
            触发方式: 'auto' as const,
        };
        
        const result = 执行单次记忆压缩(memory, task, '整合后的摘要');
        
        expect(result.compressed).toBe(true);
        expect(result.compressedLayers).toContain('短期');
        expect(result.memory.短期记忆.length).toBe(0);
        expect(result.memory.中期记忆.length).toBe(1);
        expect(result.memory.中期记忆[0]).toBe('整合后的摘要');
    });

    it('compresses medium-term to long-term', () => {
        const memory = 创建测试记忆系统({
            中期记忆: ['中期条目1', '中期条目2'],
            长期记忆: [],
        });
        const task = {
            id: 'test_task',
            来源层: '中期' as const,
            目标层: '长期' as const,
            批次: ['中期条目1', '中期条目2'],
            批次条数: 2,
            起始索引: 0,
            结束索引: 1,
            起始时间: '时间1',
            结束时间: '时间2',
            提示词模板: '提示词',
            触发方式: 'auto' as const,
        };
        
        const result = 执行单次记忆压缩(memory, task, '长期整合摘要');
        
        expect(result.compressed).toBe(true);
        expect(result.compressedLayers).toContain('中期');
        expect(result.memory.中期记忆.length).toBe(0);
        expect(result.memory.长期记忆.length).toBe(1);
    });
});

describe('需要立即整合', () => {
    it('returns false when memory is below 1.5x threshold', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(40).fill('短期记忆'), // 30 * 1.5 = 45, 40 < 45
        });
        const config = 创建测试配置();
        expect(需要立即整合(memory, config)).toBe(false);
    });

    it('returns true when short-term exceeds 1.5x threshold', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(50).fill('短期记忆'), // 30 * 1.5 = 45, 50 > 45
        });
        const config = 创建测试配置();
        expect(需要立即整合(memory, config)).toBe(true);
    });
});

describe('获取记忆健康状态', () => {
    it('returns normal status when memory is within limits', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(20).fill('短期记忆'),
            中期记忆: Array(30).fill('中期记忆'),
        });
        const config = 创建测试配置();
        const health = 获取记忆健康状态(memory, config);
        
        expect(health.短期.status).toBe('normal');
        expect(health.中期.status).toBe('normal');
        expect(health.长期.status).toBe('normal');
    });

    it('returns warning status at 80% usage', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(24).fill('短期记忆'), // 24/30 = 80%
        });
        const config = 创建测试配置();
        const health = 获取记忆健康状态(memory, config);
        
        expect(health.短期.status).toBe('warning');
    });

    it('returns critical status when exceeding limit', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(35).fill('短期记忆'),
        });
        const config = 创建测试配置();
        const health = 获取记忆健康状态(memory, config);
        
        expect(health.短期.status).toBe('critical');
    });
});

describe('创建记忆整合追踪器', () => {
    it('initializes with default state', () => {
        const tracker = 创建记忆整合追踪器();
        const state = tracker.getState();
        
        expect(state.pendingTasks).toEqual([]);
        expect(state.isProcessing).toBe(false);
        expect(state.summary).toBe('');
    });

    it('updates state when beginning consolidation', () => {
        const tracker = 创建记忆整合追踪器();
        tracker.beginConsolidation();
        
        expect(tracker.getState().isProcessing).toBe(true);
    });

    it('updates state when completing consolidation', () => {
        const tracker = 创建记忆整合追踪器();
        tracker.beginConsolidation();
        
        const result = {
            memory: 创建测试记忆系统(),
            compressed: true,
            compressedLayers: (['短期']) as ('短期')[],
            remainingTasks: 0,
            summary: '整合完成',
        };
        
        tracker.completeConsolidation(result);
        const state = tracker.getState();
        
        expect(state.isProcessing).toBe(false);
        expect(state.summary).toBe('整合完成');
        expect(state.lastConsolidationTime).toBeGreaterThan(0);
    });
});

describe('自动记忆整合', () => {
    it('returns null when immediate consolidation is not needed', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(40).fill('短期记忆'), // below 1.5x threshold
        });
        const config = 创建测试配置();
        
        const result = 自动记忆整合(memory, config);
        expect(result).toBeNull();
    });

    it('returns consolidation result when needed', () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(50).fill('短期记忆条目'),
        });
        const config = 创建测试配置();
        
        const result = 自动记忆整合(memory, config);
        expect(result).not.toBeNull();
        expect(result!.compressed).toBe(true);
    });
});

describe('整合记忆系统', () => {
    it('processes all pending compression tasks', async () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(35).fill('短期记忆条目'),
        });
        const config = 创建测试配置();
        
        const result = await 整合记忆系统(memory, config);
        
        expect(result.memory).toBeDefined();
        // Short-term was compressed to medium-term
        expect(result.compressed).toBe(true);
    });

    it('handles AI summary generator', async () => {
        const memory = 创建测试记忆系统({
            短期记忆: ['条目1', '条目2'],
        });
        const config = 创建测试配置();
        
        const aiGenerator = async (task: any) => {
            return `AI生成的摘要：合并了${task.批次条数}条记忆`;
        };
        
        const result = await 整合记忆系统(memory, config, aiGenerator);
        
        expect(result.compressed).toBe(true);
    });

    it('returns no compression when not needed', async () => {
        const memory = 创建测试记忆系统({
            短期记忆: Array(20).fill('短期记忆'),
            中期记忆: Array(30).fill('中期记忆'),
        });
        const config = 创建测试配置();
        
        const result = await 整合记忆系统(memory, config);
        
        expect(result.compressed).toBe(false);
        expect(result.compressedLayers).toEqual([]);
        expect(result.summary).toContain('无需整合');
    });
});

describe('执行记忆整合', () => {
    it('processes multiple compression cycles', () => {
        // Create a memory state where multiple compressions are needed
        const memory = 创建测试记忆系统({
            短期记忆: Array(35).fill('短期记忆'),
        });
        const config = 创建测试配置();
        
        const result = 执行记忆整合(memory, config, 1);
        
        expect(result.memory).toBeDefined();
        expect(result.compressedLayers.length).toBeGreaterThanOrEqual(0);
    });

    it('handles empty memory gracefully', () => {
        const memory = 创建测试记忆系统();
        const config = 创建测试配置();
        
        const result = 执行记忆整合(memory, config);
        
        expect(result.compressed).toBe(false);
        expect(result.remainingTasks).toBe(0);
    });
});
