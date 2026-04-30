import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 创建变量校准协调器 } from './variableCalibrationCoordinator';

vi.mock('../../services/ai/text', () => ({
    generateText: vi.fn(() => Promise.resolve('calibrated text'))
}));

describe('variableCalibrationCoordinator', () => {
    const makeDeps = (overrides: any = {}) => ({
        apiConfig: {},
        gameConfig: {},
        prompts: [],
        内置提示词列表: [],
        世界书列表: [],
        世界演变进行中Ref: { current: false },
        variableGenerationAbortControllerRef: { current: null },
        set变量生成中: vi.fn(),
        深拷贝: vi.fn((v: any) => JSON.parse(JSON.stringify(v))),
        世界演变功能已开启: vi.fn(() => true),
        等待世界演变空闲: vi.fn(() => Promise.resolve()),
        收集最近变量生成上下文: vi.fn(() => []),
        执行变量模型校准工作流: vi.fn(() => Promise.resolve({})),
        合并变量生成结果到响应: vi.fn((resp) => resp),
        变量生成功能已启用: vi.fn(() => true),
        获取变量计算接口配置: vi.fn(() => null),
        接口配置是否可用: vi.fn(() => true),
        序列化变量生成命令: vi.fn(() => 'command'),
        使用快照重建解析回合: vi.fn(() => Promise.resolve()),
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns coordinator functions', () => {
        const deps = makeDeps();
        const coordinator = 创建变量校准协调器(deps);
        expect(typeof coordinator.后台执行变量校准).toBe('function');
        expect(typeof coordinator.执行变量校准并合并响应).toBe('function');
        expect(typeof coordinator.执行重解析变量校准).toBe('function');
    });

    describe('执行变量校准并合并响应', () => {
        it('returns null when variable generation not enabled', async () => {
            const deps = makeDeps({
                变量生成功能已启用: vi.fn(() => false)
            });
            const coordinator = 创建变量校准协调器(deps);
            const result = await coordinator.执行变量校准并合并响应({} as any);
            expect(result).toBeNull();
        });
    });
});
