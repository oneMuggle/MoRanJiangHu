import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    生成NPC生图记录ID,
    标准化NPC图片结果,
    标准化香闺秘档部位结果,
    标准化香闺秘档部位档案
} from './npcImageStateWorkflow';

vi.mock('../../utils/imageAssets', () => ({
    获取图片展示地址: vi.fn((url: string) => url),
    压缩图片资源字段: vi.fn((obj: any) => obj)
}));

describe('npcImageStateWorkflow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('生成NPC生图记录ID', () => {
        it('generates unique IDs with prefix', () => {
            const id = 生成NPC生图记录ID();
            expect(id).toMatch(/^npc_img_/);
        });

        it('generates different IDs each call', () => {
            const id1 = 生成NPC生图记录ID();
            const id2 = 生成NPC生图记录ID();
            expect(id1).not.toBe(id2);
        });
    });

    describe('标准化NPC图片结果', () => {
        it('returns undefined for invalid input', () => {
            expect(标准化NPC图片结果(null)).toBeUndefined();
            expect(标准化NPC图片结果([])).toBeUndefined();
            expect(标准化NPC图片结果('string')).toBeUndefined();
        });

        it('generates ID when missing', () => {
            const result = 标准化NPC图片结果({ 图片URL: 'test.png' });
            expect(result?.id).toMatch(/^npc_img_/);
        });

        it('preserves existing ID', () => {
            const result = 标准化NPC图片结果({ id: 'existing_id', 图片URL: 'test.png' });
            expect(result?.id).toBe('existing_id');
        });

        it('trims and validates ID', () => {
            const result = 标准化NPC图片结果({ id: '  ', 图片URL: 'test.png' });
            expect(result?.id).toMatch(/^npc_img_/);
        });
    });

    describe('标准化香闺秘档部位结果', () => {
        it('returns undefined for invalid input', () => {
            expect(标准化香闺秘档部位结果(null, '胸部')).toBeUndefined();
            expect(标准化香闺秘档部位结果([], '胸部')).toBeUndefined();
        });

        it('normalizes valid result', () => {
            const result = 标准化香闺秘档部位结果({
                图片URL: 'image.png',
                生图词组: 'prompt',
                原始描述: 'description'
            }, '胸部');
            expect(result?.部位).toBe('胸部');
            expect(result?.构图).toBe('部位特写');
            expect(result?.图片URL).toBe('image.png');
        });

        it('returns undefined when no meaningful data', () => {
            const result = 标准化香闺秘档部位结果({}, '胸部');
            expect(result).toBeUndefined();
        });

        it('uses fallback ID when missing', () => {
            const result = 标准化香闺秘档部位结果({ 图片URL: 'test.png' }, '小穴');
            expect(result?.id).toContain('npc_secret_');
        });
    });

    describe('标准化香闺秘档部位档案', () => {
        it('returns undefined for invalid input', () => {
            expect(标准化香闺秘档部位档案(null)).toBeUndefined();
            expect(标准化香闺秘档部位档案([])).toBeUndefined();
        });

        it('normalizes archive with valid data', () => {
            const result = 标准化香闺秘档部位档案({
                胸部: { 图片URL: 'chest.png', 生图词组: 'prompt' }
            });
            expect(result).toBeDefined();
        });

        it('returns undefined for empty archive', () => {
            const result = 标准化香闺秘档部位档案({});
            expect(result).toBeUndefined();
        });
    });
});
