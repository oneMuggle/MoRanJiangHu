import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建记忆总结处理器 } from './memorySummaryHandlers';

vi.mock('./memoryUtils', () => ({
    规范化记忆系统: vi.fn((m: any) => m || { 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] }),
    规范化记忆配置: vi.fn(() => ({
        重要角色关键记忆条数N: 5,
        记忆压缩提示词: 'compress prompt',
        NPC记忆总结提示词: 'npc summary prompt'
    })),
    构建待处理记忆压缩任务: vi.fn((mem: any) => {
        if (!mem?.短期记忆?.length && !mem?.中期记忆?.length) return null;
        return {
            id: 'memory_task_1',
            来源层: '短期',
            目标层: '中期',
            提示词模板: 'compress prompt',
            批次: mem.短期记忆?.map((m: any) => m.内容) || [],
            批次条数: mem.短期记忆?.length || 0,
            起始时间: '2024-01-01',
            结束时间: '2024-01-02'
        };
    }),
    构建手动记忆压缩任务: vi.fn(() => ({
        id: 'manual_task_1',
        来源层: '短期',
        目标层: '中期',
        提示词模板: 'compress prompt',
        批次: ['manual item'],
        批次条数: 1,
        起始时间: '2024-01-01',
        结束时间: '2024-01-02'
    })),
    应用记忆压缩结果: vi.fn((mem: any, _task: any, draft: string) => ({
        ...mem,
        中期记忆: [...(mem.中期记忆 || []), { 内容: draft, 时间: '2024-01-02' }]
    }))
}));

vi.mock('./npcMemorySummary', () => ({
    应用NPC记忆总结: vi.fn((npc: any, _candidate: any, draft: string) => ({
        ...npc,
        记忆: [{ 内容: draft, 时间: '2024-01-02' }]
    })),
    构建手动NPC记忆总结候选: vi.fn((mem: any) => {
        if (!Array.isArray(mem) || mem.length === 0) return null;
        return { 批次: mem.slice(-3), 批次条数: 3, 起始原始索引: 0, 结束原始索引: 3, 起始时间: '2024-01-01', 结束时间: '2024-01-02', 预留原始条数: 1 };
    }),
    构建自动NPC记忆总结候选: vi.fn((mem: any) => {
        if (!Array.isArray(mem) || mem.length < 10) return null;
        return { 批次: mem.slice(0, 5), 批次条数: 5, 起始原始索引: 0, 结束原始索引: 5, 起始时间: '2024-01-01', 结束时间: '2024-01-02', 预留原始条数: 2 };
    }),
    构建NPC记忆总结回退文案: vi.fn(() => '回退文案')
}));

vi.mock('../../utils/apiConfig', () => ({
    获取记忆总结接口配置: vi.fn(() => ({ id: 'test_api', 供应商: 'openai', baseUrl: 'https://api.test', apiKey: 'key', model: 'gpt-4' })),
    接口配置是否可用: vi.fn(() => true)
}));

vi.mock('../../services/ai/text', () => ({
    generateMemoryRecall: vi.fn(() => Promise.resolve('AI总结结果'))
}));

describe('memorySummaryHandlers', () => {
    const makeDeps = (overrides: any = {}) => ({
        待处理记忆总结任务: null,
        set待处理记忆总结任务: vi.fn(),
        记忆总结阶段: 'idle' as const,
        set记忆总结阶段: vi.fn(),
        记忆总结草稿: '',
        set记忆总结草稿: vi.fn(),
        记忆总结错误: '',
        set记忆总结错误: vi.fn(),
        待处理NPC记忆总结队列: [],
        set待处理NPC记忆总结队列: vi.fn((fn) => {
            if (typeof fn === 'function') fn([]);
        }),
        NPC记忆总结阶段: 'idle' as const,
        setNPC记忆总结阶段: vi.fn(),
        NPC记忆总结草稿: '',
        setNPC记忆总结草稿: vi.fn(),
        NPC记忆总结错误: '',
        setNPC记忆总结错误: vi.fn(),
        社交: [],
        设置社交: vi.fn(),
        记忆系统: { 回忆档案: [], 即时记忆: [], 短期记忆: [], 中期记忆: [], 长期记忆: [] },
        设置记忆系统: vi.fn(),
        memoryConfig: {},
        apiConfig: { 功能模型占位: {}, configs: [] },
        历史记录: [],
        performAutoSave: vi.fn(),
        规范化社交列表: vi.fn((list: any[]) => list),
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns all handler functions', () => {
        const deps = makeDeps();
        const handlers = 创建记忆总结处理器(deps);
        expect(typeof handlers.handleStartMemorySummary).toBe('function');
        expect(typeof handlers.handleCancelMemorySummary).toBe('function');
        expect(typeof handlers.handleApplyMemorySummary).toBe('function');
        expect(typeof handlers.handleStartNpcMemorySummary).toBe('function');
        expect(typeof handlers.handleApplyNpcMemorySummary).toBe('function');
        expect(typeof handlers.handleQueueManualNpcMemorySummary).toBe('function');
    });

    describe('记忆总结', () => {
        it('构建记忆总结用户提示词', () => {
            const handlers = 创建记忆总结处理器(makeDeps());
            const task = {
                来源层: '短期' as const,
                目标层: '中期' as const,
                起始时间: '2024-01-01',
                结束时间: '2024-01-02',
                批次条数: 3,
                批次: ['内容1', '内容2', '内容3'],
                提示词模板: 'prompt'
            };
            const prompt = handlers.构建记忆总结用户提示词(task as any);
            expect(prompt).toContain('短期记忆压缩为中期记忆');
            expect(prompt).toContain('2024-01-01');
            expect(prompt).toContain('内容1');
        });

        it('清理记忆总结输出 removes code fences', () => {
            const handlers = 创建记忆总结处理器(makeDeps());
            expect(handlers.清理记忆总结输出('```text\nhello\n```')).toBe('hello');
        });

        it('清理记忆总结输出 removes empty phrases', () => {
            const handlers = 创建记忆总结处理器(makeDeps());
            expect(handlers.清理记忆总结输出('无')).toBe('');
            expect(handlers.清理记忆总结输出('暂无')).toBe('');
            expect(handlers.清理记忆总结输出('无重要内容')).toBe('');
        });

        it('handleStartMemorySummary sets processing stage', async () => {
            const deps = makeDeps({
                待处理记忆总结任务: {
                    id: 'task_1',
                    提示词模板: 'prompt',
                    批次: ['item'],
                    批次条数: 1
                }
            });
            const handlers = 创建记忆总结处理器(deps);
            await handlers.handleStartMemorySummary();
            expect(deps.set记忆总结阶段).toHaveBeenCalledWith('processing');
        });

        it('handleCancelMemorySummary clears state', () => {
            const deps = makeDeps();
            const handlers = 创建记忆总结处理器(deps);
            handlers.handleCancelMemorySummary();
            expect(deps.set记忆总结阶段).toHaveBeenCalledWith('idle');
        });

        it('handleApplyMemorySummary applies result', () => {
            const deps = makeDeps({
                待处理记忆总结任务: { id: 'task_1' },
                记忆总结草稿: '总结内容'
            });
            const handlers = 创建记忆总结处理器(deps);
            handlers.handleApplyMemorySummary();
            expect(deps.设置记忆系统).toHaveBeenCalled();
        });
    });

    describe('NPC记忆总结', () => {
        it('构建NPC记忆总结任务', () => {
            const deps = makeDeps();
            const handlers = 创建记忆总结处理器(deps);
            const npc = {
                id: 'npc_1',
                姓名: '张三',
                记忆: Array(15).fill(null).map((_, i) => ({ 内容: `记忆${i}`, 时间: '2024-01-01' }))
            };
            const task = handlers.构建NPC记忆总结任务(npc as any, 'auto');
            expect(task).not.toBeNull();
            expect(task?.npcId).toBe('npc_1');
        });

        it('returns null task when NPC has no memories', () => {
            const deps = makeDeps();
            const handlers = 创建记忆总结处理器(deps);
            const npc = { id: 'npc_1', 姓名: '张三', 记忆: [] };
            const task = handlers.构建NPC记忆总结任务(npc as any, 'auto');
            expect(task).toBeNull();
        });

        it('清空NPC记忆总结流程', () => {
            const deps = makeDeps();
            const handlers = 创建记忆总结处理器(deps);
            handlers.清空NPC记忆总结流程();
            expect(deps.setNPC记忆总结阶段).toHaveBeenCalledWith('idle');
        });

        it('handleCancelNpcMemorySummary clears state', () => {
            const deps = makeDeps();
            const handlers = 创建记忆总结处理器(deps);
            handlers.handleCancelNpcMemorySummary();
            expect(deps.setNPC记忆总结阶段).toHaveBeenCalledWith('idle');
        });
    });

    describe('刷新任务', () => {
        it('刷新记忆总结任务 creates new task when memories exist', () => {
            const deps = makeDeps();
            const handlers = 创建记忆总结处理器(deps);
            handlers.刷新记忆总结任务({
                短期记忆: [{ 内容: '短期记忆', 时间: '2024-01-01' }]
            } as any);
            expect(deps.set待处理记忆总结任务).toHaveBeenCalled();
        });

        it('刷新记忆总结任务 clears when no task needed', () => {
            const deps = makeDeps();
            const handlers = 创建记忆总结处理器(deps);
            handlers.刷新记忆总结任务({
                短期记忆: [],
                中期记忆: []
            } as any);
            expect(deps.set记忆总结阶段).toHaveBeenCalledWith('idle');
        });
    });
});
