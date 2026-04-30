import { describe, it, expect } from 'vitest';
import {
    过滤饱腹口渴提示词行,
    构建功能附加块,
    构建修炼体系附加块,
    构建里武侠附加块,
    构建里志怪附加块,
    按功能开关过滤提示词内容,
    裁剪里武侠上下文数据,
    裁剪修炼体系上下文数据,
    裁剪里志怪上下文数据,
} from './promptFeatureToggles';

describe('过滤饱腹口渴提示词行', () => {
    it('removes lines containing hunger/thirst keywords', () => {
        const input = `normal line
角色感到饥饿需要进食
another line
口渴值上升了
clean line`;
        const result = 过滤饱腹口渴提示词行(input);
        expect(result).not.toContain('饥饿');
        expect(result).not.toContain('口渴');
        expect(result).toContain('normal line');
        expect(result).toContain('another line');
        expect(result).toContain('clean line');
    });

    it('handles empty input', () => {
        expect(过滤饱腹口渴提示词行('')).toBe('');
        expect(过滤饱腹口渴提示词行(null as any)).toBe('');
    });

    it('collapses multiple blank lines', () => {
        const input = 'line1\n\n\n\nline2';
        const result = 过滤饱腹口渴提示词行(input);
        expect(result).toBe('line1\n\nline2');
    });
});

describe('构建功能附加块', () => {
    it('wraps content in feature markers', () => {
        const result = 构建功能附加块('cultivation', 'cultivation content');
        expect(result).toContain('<!-- PROMPT_FEATURE:cultivation:START -->');
        expect(result).toContain('cultivation content');
        expect(result).toContain('<!-- PROMPT_FEATURE:cultivation:END -->');
    });

    it('lowercases feature ID', () => {
        const result = 构建功能附加块('CULTIVATION', 'content');
        expect(result).toContain('cultivation');
    });

    it('returns empty for empty feature ID', () => {
        expect(构建功能附加块('', 'content')).toBe('');
        expect(构建功能附加块('   ', 'content')).toBe('');
    });

    it('returns empty for empty content', () => {
        expect(构建功能附加块('cultivation', '')).toBe('');
        expect(构建功能附加块('cultivation', '   ')).toBe('');
    });
});

describe('convenience block builders', () => {
    it('构建修炼体系附加块 uses cultivation ID', () => {
        const result = 构建修炼体系附加块('修炼内容');
        expect(result).toContain('PROMPT_FEATURE:cultivation:START');
    });

    it('构建里武侠附加块 uses liwuxia ID', () => {
        const result = 构建里武侠附加块('里武侠内容');
        expect(result).toContain('PROMPT_FEATURE:liwuxia:START');
    });

    it('构建里志怪附加块 uses lizhiguai ID', () => {
        const result = 构建里志怪附加块('里志怪内容');
        expect(result).toContain('PROMPT_FEATURE:lizhiguai:START');
    });
});

describe('按功能开关过滤提示词内容', () => {
    it('keeps enabled feature blocks', () => {
        const input = [
            'intro text',
            '<!-- PROMPT_FEATURE:cultivation:START -->',
            'cultivation rules',
            '<!-- PROMPT_FEATURE:cultivation:END -->',
        ].join('\n');
        const result = 按功能开关过滤提示词内容(input, { 启用修炼体系: true });
        expect(result).toContain('cultivation rules');
    });

    it('removes disabled feature blocks', () => {
        const input = [
            'intro text',
            '<!-- PROMPT_FEATURE:survival:START -->',
            'survival rules',
            '<!-- PROMPT_FEATURE:survival:END -->',
        ].join('\n');
        const result = 按功能开关过滤提示词内容(input, { 启用饱腹口渴系统: false });
        expect(result).not.toContain('survival rules');
    });

    it('removes survival lines when 启用饱腹口渴系统 is false', () => {
        const input = '角色感到饥饿\nnormal line\n脱水值上升';
        const result = 按功能开关过滤提示词内容(input, { 启用饱腹口渴系统: false });
        expect(result).not.toContain('饥饿');
        expect(result).not.toContain('脱水');
        expect(result).toContain('normal line');
    });

    it('keeps everything when config is null/undefined', () => {
        const input = 'some prompt text with 饥饿';
        const result = 按功能开关过滤提示词内容(input, null);
        expect(result).toBe(input);
    });

    it('handles multiple feature blocks with mixed enable/disable', () => {
        const input = [
            'outer',
            '<!-- PROMPT_FEATURE:liwuxia:START -->',
            'liwuxia content',
            '<!-- PROMPT_FEATURE:liwuxia:END -->',
            '<!-- PROMPT_FEATURE:zhiguai:START -->',
            'zhiguai content',
            '<!-- PROMPT_FEATURE:zhiguai:END -->',
        ].join('\n');
        const result = 按功能开关过滤提示词内容(input, { 古代体系选择: '武侠', 启用里武侠模式: true });
        expect(result).toContain('liwuxia content');
        expect(result).not.toContain('zhiguai content');
    });

    it('trims and normalizes output', () => {
        const input = '  text  \n\n\n  ';
        const result = 按功能开关过滤提示词内容(input);
        expect(result).toBe('text');
    });
});

describe('裁剪里武侠上下文数据', () => {
    it('returns value unchanged when 里武侠 mode is enabled', () => {
        const data = { 武根: '甲', 硬度: 10, 其他: 'info' };
        const result = 裁剪里武侠上下文数据(data, { 启用里武侠模式: true });
        expect(result).toEqual(data);
    });

    it('removes 武根 fields when mode is disabled', () => {
        const data = { 武根: '甲', 硬度: 10, 尺寸: 5, 其他: 'info' };
        const result = 裁剪里武侠上下文数据(data, { 启用里武侠模式: false });
        expect(result).toEqual({ 其他: 'info' });
    });

    it('removes 武根 fields when config is undefined', () => {
        const data = { 武根: '甲', 精元储量: 100, 名字: 'hero' };
        const result = 裁剪里武侠上下文数据(data, null);
        expect(result).toEqual({ 名字: 'hero' });
    });

    it('recursively removes fields in nested objects', () => {
        const data = {
            outer: {
                武根: '乙',
                inner: { 硬度: 20, 名称: 'item' }
            }
        };
        const result = 裁剪里武侠上下文数据(data);
        expect(result).toEqual({ outer: { inner: { 名称: 'item' } } });
    });

    it('handles arrays', () => {
        const data = [
            { 武根: '甲', 名字: 'a' },
            { 尺寸: 5, 名字: 'b' }
        ];
        const result = 裁剪里武侠上下文数据(data);
        expect(result).toEqual([{ 名字: 'a' }, { 名字: 'b' }]);
    });
});

describe('裁剪修炼体系上下文数据', () => {
    it('returns value unchanged when cultivation is enabled (default)', () => {
        const data = { 境界: '炼气', 当前经验: 100, 名字: 'hero' };
        const result = 裁剪修炼体系上下文数据(data, {});
        expect(result).toEqual(data);
    });

    it('removes cultivation fields when disabled', () => {
        const data = { 境界: '炼气', 当前经验: 100, 境界层级: '初期', 名字: 'hero' };
        const result = 裁剪修炼体系上下文数据(data, { 启用修炼体系: false });
        expect(result).toEqual({ 名字: 'hero' });
    });

    it('preserves non-cultivation fields', () => {
        const data = { 姓名: 'hero', 年龄: 25, 描述: 'description' };
        const result = 裁剪修炼体系上下文数据(data, { 启用修炼体系: false });
        expect(result).toEqual(data);
    });

    it('recursively removes fields in nested structures', () => {
        const data = {
            character: { 境界: '筑基', 姓名: 'hero' },
            items: [{ 功法列表: [], 名称: 'sword' }]
        };
        const result = 裁剪修炼体系上下文数据(data, { 启用修炼体系: false });
        expect(result).toEqual({
            character: { 姓名: 'hero' },
            items: [{ 名称: 'sword' }]
        });
    });
});

describe('裁剪里志怪上下文数据', () => {
    it('returns value unchanged when 里志怪 mode is enabled', () => {
        const data = { 妖根: '天', 业障: 10, 功德: 5, 名字: 'demon' };
        const result = 裁剪里志怪上下文数据(data, { 启用里志怪模式: true });
        expect(result).toEqual(data);
    });

    it('removes 志怪 fields when mode is disabled', () => {
        const data = { 妖根: '地', 业障: 10, 功德: 5, 灵视能力: '强', 名字: 'demon' };
        const result = 裁剪里志怪上下文数据(data, { 启用里志怪模式: false });
        expect(result).toEqual({ 名字: 'demon' });
    });

    it('removes 志怪 fields when config is undefined', () => {
        const data = { 妖根: '玄', 已知道法: ['fireball'], 称号: 'demon lord' };
        const result = 裁剪里志怪上下文数据(data, null);
        expect(result).toEqual({ 称号: 'demon lord' });
    });

    it('handles arrays of objects', () => {
        const data = [
            { 妖根: '甲', 名称: 'demon1' },
            { 功德: 100, 名称: 'demon2' }
        ];
        const result = 裁剪里志怪上下文数据(data);
        expect(result).toEqual([{ 名称: 'demon1' }, { 名称: 'demon2' }]);
    });
});

describe('功能附加块是否启用 — edge cases', () => {
    it('limode always returns true', () => {
        const block = 构建功能附加块('limode', 'li mode content');
        const result = 按功能开关过滤提示词内容(block, null);
        expect(result).toBe('li mode content');
    });

    it('unknown feature IDs default to true', () => {
        const block = 构建功能附加块('unknown', 'unknown content');
        const result = 按功能开关过滤提示词内容(block, {});
        expect(result).toBe('unknown content');
    });

    it('zhiguai is enabled for 双修 selection', () => {
        const block = 构建功能附加块('zhiguai', 'zhiguai content');
        const result = 按功能开关过滤提示词内容(block, { 古代体系选择: '双修' });
        expect(result).toBe('zhiguai content');
    });

    it('zhiguai is disabled for 武侠 selection', () => {
        const block = 构建功能附加块('zhiguai', 'zhiguai content');
        const result = 按功能开关过滤提示词内容(block, { 古代体系选择: '武侠' });
        expect(result).not.toContain('zhiguai content');
    });
});
