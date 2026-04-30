import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock react BEFORE importing the module that uses it
vi.mock('react', () => ({
    useEffect: vi.fn(),
}));
vi.mock('../../utils/apiConfig', () => ({
    获取世界演变接口配置: vi.fn(),
    接口配置是否可用: vi.fn(),
}));

import { useWorldEvolutionControl } from './worldEvolutionControl';

function makeDeps(overrides: any = {}) {
    return {
        view: 'game',
        loading: false,
        apiConfig: { 世界演变API: { provider: 'openai', apiKey: 'key', baseUrl: 'url', model: 'gpt-4' } },
        环境: { 年: 2026, 月: 4, 日: 30 },
        世界: { 事件: [] },
        世界演变更新中: false,
        变量生成中: false,
        世界演变状态文本: '世界演变待命',
        世界演变最近更新时间: null,
        世界演变最近现实更新时间戳Ref: { current: 0 },
        世界演变去重签名Ref: { current: '' },
        世界演变功能已开启: vi.fn(() => true),
        已进入主剧情回合: vi.fn(() => true),
        set世界演变状态文本: vi.fn(),
        规范化世界状态: vi.fn((w: any) => w),
        执行世界演变更新: vi.fn(() => Promise.resolve({ ok: true })),
        ...overrides,
    };
}

describe('useWorldEvolutionControl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('handleForceWorldEvolutionUpdate', () => {
        it('returns null on success', async () => {
            const deps = makeDeps();
            const { handleForceWorldEvolutionUpdate } = useWorldEvolutionControl(deps);
            const result = await handleForceWorldEvolutionUpdate();
            expect(result).toBeNull();
            expect(deps.执行世界演变更新).toHaveBeenCalledWith({
                来源: 'manual',
                动态世界线索: [],
                force: true,
            });
        });

        it('returns error message on failure', async () => {
            const deps = makeDeps({
                执行世界演变更新: vi.fn(() => Promise.resolve({ ok: false, statusText: 'evolution failed' })),
            });
            const { handleForceWorldEvolutionUpdate } = useWorldEvolutionControl(deps);
            const result = await handleForceWorldEvolutionUpdate();
            expect(result).toBe('evolution failed');
        });

        it('falls back to 世界演变状态文本 when no statusText', async () => {
            const deps = makeDeps({
                世界演变状态文本: 'fallback status',
                执行世界演变更新: vi.fn(() => Promise.resolve({ ok: false })),
            });
            const { handleForceWorldEvolutionUpdate } = useWorldEvolutionControl(deps);
            const result = await handleForceWorldEvolutionUpdate();
            expect(result).toBe('fallback status');
        });

        it('uses default message when nothing available', async () => {
            const deps = makeDeps({
                世界演变状态文本: '',
                执行世界演变更新: vi.fn(() => Promise.resolve({ ok: false })),
            });
            const { handleForceWorldEvolutionUpdate } = useWorldEvolutionControl(deps);
            const result = await handleForceWorldEvolutionUpdate();
            expect(result).toContain('世界演变更新未执行');
        });
    });
});
