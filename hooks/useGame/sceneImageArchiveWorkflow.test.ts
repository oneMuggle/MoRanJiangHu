import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    生成场景生图记录ID,
    规范化场景图片档案,
    按场景图上限裁剪档案,
    创建场景图片档案工作流
} from './sceneImageArchiveWorkflow';

vi.mock('../../utils/visualSettings', () => ({
    规范化视觉设置: vi.fn((v: any) => v || {})
}));

vi.mock('../../utils/imageAssets', () => ({
    获取图片展示地址: vi.fn((item: any) => item?.图片URL || undefined),
    压缩图片资源字段: vi.fn((obj: any) => obj)
}));

describe('sceneImageArchiveWorkflow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('生成场景生图记录ID', () => {
        it('generates unique IDs with prefix', () => {
            const id = 生成场景生图记录ID();
            expect(id).toMatch(/^scene_img_/);
        });
    });

    describe('规范化场景图片档案', () => {
        it('returns empty for undefined input', () => {
            const result = 规范化场景图片档案(undefined);
            expect(result).toEqual({});
        });

        it('normalizes history with generated IDs', () => {
            const result = 规范化场景图片档案({
                生图历史: [{ 图片URL: 'scene.png', 生成时间: Date.now() }]
            });
            expect(result.生图历史).toHaveLength(1);
            expect(result.生图历史?.[0].构图).toBe('场景');
        });

        it('sorts history by time descending', () => {
            const now = Date.now();
            const result = 规范化场景图片档案({
                生图历史: [
                    { 图片URL: 'old.png', 生成时间: now - 1000 },
                    { 图片URL: 'new.png', 生成时间: now }
                ]
            });
            expect(result.生图历史?.[0].图片URL).toBe('new.png');
        });

        it('deduplicates by id', () => {
            const result = 规范化场景图片档案({
                生图历史: [
                    { id: 'dup', 图片URL: 'a.png' },
                    { id: 'dup', 图片URL: 'b.png' }
                ]
            });
            expect(result.生图历史).toHaveLength(1);
        });
    });

    describe('按场景图上限裁剪档案', () => {
        it('does not trim when within limit', () => {
            const result = 按场景图上限裁剪档案({
                生图历史: [{ 图片URL: 'a.png' }, { 图片URL: 'b.png' }]
            }, 5);
            expect(result.删除数量).toBe(0);
        });

        it('trims history when over limit', () => {
            const result = 按场景图上限裁剪档案({
                生图历史: Array(5).fill(null).map((_, i) => ({ 图片URL: `img_${i}.png`, 生成时间: Date.now() - i * 1000 }))
            }, 2);
            expect(result.档案.生图历史).toHaveLength(2);
            expect(result.删除数量).toBe(3);
        });
    });

    describe('创建场景图片档案工作流', () => {
        const makeDeps = (overrides: any = {}) => ({
            获取场景图历史上限: vi.fn(() => 10),
            读取场景图片档案设置: vi.fn(() => Promise.resolve({})),
            保存场景图片档案设置: vi.fn(),
            同步场景图片档案: vi.fn(),
            获取当前场景图片档案: vi.fn(() => ({})),
            清理未引用图片资源: vi.fn(() => Promise.resolve()),
            获取当前视觉设置: vi.fn(() => ({})),
            应用视觉设置到状态: vi.fn(),
            深拷贝: vi.fn((v: any) => JSON.parse(JSON.stringify(v))),
            加载图片AI服务: vi.fn(() => Promise.resolve({})),
            ...overrides
        });

        it('returns workflow functions', () => {
            const deps = makeDeps();
            const workflow = 创建场景图片档案工作流(deps);
            expect(typeof workflow.写入场景图片档案).toBe('function');
            expect(typeof workflow.应用场景图片为壁纸).toBe('function');
        });
    });
});
