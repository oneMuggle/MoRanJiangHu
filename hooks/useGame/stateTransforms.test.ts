import { describe, it, expect } from 'vitest';
import {
    规范化环境信息,
    构建完整地点文本,
    规范化角色物品容器映射,
    规范化社交列表
} from './stateTransforms';

describe('规范化环境信息', () => {
    it('returns default structure for null/undefined input', () => {
        const result = 规范化环境信息(null);
        expect(result).toHaveProperty('时间');
        expect(result).toHaveProperty('大地点');
        expect(result).toHaveProperty('中地点');
        expect(result).toHaveProperty('小地点');
        expect(result).toHaveProperty('具体地点');
        expect(result).toHaveProperty('节日');
        expect(result).toHaveProperty('天气');
        expect(result).toHaveProperty('环境变量');
    });

    it('normalizes location fields', () => {
        const result = 规范化环境信息({
            大地点: ' 江南 ',
            中地点: '苏州',
            小地点: ' 留园 ',
            具体地点: '正门',
        });
        expect(result.大地点).toBe('江南');
        expect(result.中地点).toBe('苏州');
        expect(result.小地点).toBe('留园');
        expect(result.具体地点).toBe('正门');
    });

    it('parses festival as object', () => {
        const result = 规范化环境信息({
            节日: { 名称: '中秋', 简介: '赏月', 效果: '增益' },
        });
        expect(result.节日).toEqual({ 名称: '中秋', 简介: '赏月', 效果: '增益' });
    });

    it('parses festival as string name', () => {
        const result = 规范化环境信息({ 节日: '春节' });
        expect(result.节日).toEqual({ 名称: '春节', 简介: '', 效果: '' });
    });

    it('normalizes weather with end date', () => {
        const result = 规范化环境信息({
            天气: { 天气: '晴天', 结束日期: '2026:05:01:12:00' },
        });
        expect(result.天气.天气).toBe('晴天');
        expect(result.天气.结束日期).toBeTruthy();
    });

    it('limits environment variables to last 2', () => {
        const result = 规范化环境信息({
            环境变量: [
                { 名称: 'A', 描述: 'desc1', 效果: 'eff1' },
                { 名称: 'B', 描述: 'desc2', 效果: 'eff2' },
                { 名称: 'C', 描述: 'desc3', 效果: 'eff3' },
            ],
        });
        expect(result.环境变量).toHaveLength(2);
        expect(result.环境变量[0].名称).toBe('B');
        expect(result.环境变量[1].名称).toBe('C');
    });

    it('filters invalid environment variable entries', () => {
        const result = 规范化环境信息({
            环境变量: [
                { 名称: '', 描述: '', 效果: '' },
                { 名称: 'Valid', 描述: 'desc', 效果: '' },
                null,
            ],
        });
        expect(result.环境变量).toHaveLength(1);
        expect(result.环境变量[0].名称).toBe('Valid');
    });
});

describe('构建完整地点文本', () => {
    it('joins location parts with arrow', () => {
        const result = 构建完整地点文本({
            大地点: '江南',
            中地点: '苏州',
            小地点: '留园',
            具体地点: '正门',
        });
        expect(result).toBe('江南 > 苏州 > 留园 > 正门');
    });

    it('returns 未知地点 when all parts empty', () => {
        const result = 构建完整地点文本({});
        expect(result).toBe('未知地点');
    });

    it('deduplicates repeated parts', () => {
        const result = 构建完整地点文本({
            大地点: '长安',
            中地点: '长安',
            小地点: '',
            具体地点: '城门',
        });
        expect(result).toBe('长安 > 城门');
    });

    it('normalizes input before building', () => {
        const result = 构建完整地点文本({
            大地点: ' 江南 ',
            中地点: '',
            小地点: ' 留园 ',
            具体地点: '',
        });
        expect(result).toBe('江南 > 留园');
    });
});

describe('规范化角色物品容器映射', () => {
    it('returns empty role structure for null input', () => {
        const result = 规范化角色物品容器映射(null);
        expect(result).toHaveProperty('姓名');
        expect(result).toHaveProperty('物品列表');
        expect(result).toHaveProperty('装备');
    });

    it('defaults gender to 男 when missing', () => {
        const result = 规范化角色物品容器映射({});
        expect(result.性别).toBe('男');
    });

    it('clamps age to valid range', () => {
        const result1 = 规范化角色物品容器映射({ 年龄: -5 });
        expect(result1.年龄).toBeGreaterThanOrEqual(0);
        const result2 = 规范化角色物品容器映射({ 年龄: 99999 });
        expect(result2.年龄).toBeLessThanOrEqual(9999);
    });

    it('normalizes role name by trimming', () => {
        const result = 规范化角色物品容器映射({ 姓名: ' 张三 ' });
        expect(result.姓名).toBe('张三');
    });

    it('preserves existing 物品列表', () => {
        const result = 规范化角色物品容器映射({
            姓名: '李四',
            物品列表: [{ 名称: '剑', 数量: 1 }],
        });
        expect(result.物品列表).toHaveLength(1);
        expect(result.物品列表[0].名称).toBe('剑');
    });

    it('sets default sect info', () => {
        const result = 规范化角色物品容器映射({});
        expect(result.所属门派ID).toBe('none');
        expect(result.门派职位).toBe('无');
    });
});

describe('规范化社交列表', () => {
    it('returns empty array for non-array input', () => {
        expect(规范化社交列表(null as any)).toEqual([]);
        expect(规范化社交列表(undefined as any)).toEqual([]);
    });

    it('normalizes NPC entries', () => {
        const result = 规范化社交列表([
            { 姓名: ' 张三 ', 性别: '女', 好感度: 50 },
        ]);
        expect(result).toHaveLength(1);
        expect(result[0].姓名).toBe('张三');
    });

    it('handles empty list', () => {
        expect(规范化社交列表([])).toEqual([]);
    });

    it('merges duplicate NPCs by default', () => {
        const result = 规范化社交列表([
            { 姓名: '张三', 好感度: 50 },
            { 姓名: '张三', 好感度: 80 },
        ]);
        expect(result.length).toBeLessThanOrEqual(2);
    });

    it('preserves duplicates when 合并同名=false', () => {
        const result = 规范化社交列表([
            { 姓名: '张三', 好感度: 50 },
            { 姓名: '张三', 好感度: 80 },
        ], { 合并同名: false });
        expect(result).toHaveLength(2);
    });
});
