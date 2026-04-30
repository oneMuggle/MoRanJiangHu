import { describe, it, expect } from 'vitest';
import { 提取原始报错详情, 格式化错误详情, 提取解析失败原始信息 } from './errorFormatting';

describe('提取原始报错详情', () => {
    it('extracts detail property', () => {
        expect(提取原始报错详情({ detail: 'custom detail' })).toBe('custom detail');
    });

    it('falls back to message property', () => {
        expect(提取原始报错详情({ message: 'error message' })).toBe('error message');
    });

    it('handles Error objects', () => {
        const err = new Error('test error');
        expect(提取原始报错详情(err)).toBe('test error');
    });

    it('handles plain strings', () => {
        expect(提取原始报错详情('plain string error')).toBe('plain string error');
    });

    it('handles null', () => {
        // null is falsy, so `error ?? '未知错误'` returns '未知错误'
        expect(提取原始报错详情(null)).toBe('未知错误');
    });

    it('handles undefined', () => {
        expect(提取原始报错详情(undefined)).toBe('未知错误');
    });

    it('handles numbers', () => {
        expect(提取原始报错详情(404)).toBe('404');
    });

    it('stringifies objects', () => {
        const result = 提取原始报错详情({ code: 500, reason: 'server error' });
        expect(result).toContain('"code": 500');
        expect(result).toContain('"reason": "server error"');
    });

    it('handles circular references gracefully', () => {
        const circular: any = {};
        circular.self = circular;
        const result = 提取原始报错详情(circular);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
    });
});

describe('格式化错误详情', () => {
    it('returns 未知错误 for falsy values', () => {
        expect(格式化错误详情(null)).toBe('未知错误');
        expect(格式化错误详情(undefined)).toBe('未知错误');
        expect(格式化错误详情(0)).toBe('未知错误');
        expect(格式化错误详情('')).toBe('未知错误');
    });

    it('returns plain strings as-is', () => {
        expect(格式化错误详情('simple error')).toBe('simple error');
    });

    it('formats Error-like objects', () => {
        const err = { name: 'TypeError', message: 'x is not a function', status: 400 };
        const result = 格式化错误详情(err);
        expect(result).toContain('Name: TypeError');
        expect(result).toContain('Message: x is not a function');
        expect(result).toContain('Status: 400');
    });

    it('includes detail field when present', () => {
        const err = { message: 'failed', detail: 'raw detail text' };
        const result = 格式化错误详情(err);
        expect(result).toContain('Message: failed');
        expect(result).toContain('Detail:');
        expect(result).toContain('raw detail text');
    });

    it('stringifies object detail', () => {
        const err = { message: 'failed', detail: { code: 'ERR_1' } };
        const result = 格式化错误详情(err);
        expect(result).toContain('"code": "ERR_1"');
    });

    it('includes parseDetail when present', () => {
        const err = { parseDetail: 'parse error detail' };
        const result = 格式化错误详情(err);
        expect(result).toContain('parse error detail');
    });

    it('falls back to JSON.stringify for unknown objects', () => {
        const result = 格式化错误详情({ custom: 'data' });
        expect(result).toContain('"custom": "data"');
    });

    it('falls back to String for un-stringifiable values', () => {
        const circular: any = {};
        circular.self = circular;
        const result = 格式化错误详情(circular);
        expect(typeof result).toBe('string');
    });
});

describe('提取解析失败原始信息', () => {
    it('returns default for falsy values', () => {
        expect(提取解析失败原始信息(null)).toBe('返回内容不符合标签协议');
        expect(提取解析失败原始信息(undefined)).toBe('返回内容不符合标签协议');
    });

    it('returns trimmed string input', () => {
        expect(提取解析失败原始信息('  error text  ')).toBe('error text');
    });

    it('extracts parseDetail property', () => {
        const err = { parseDetail: '  parse failed  ' };
        expect(提取解析失败原始信息(err)).toBe('parse failed');
    });

    it('falls back to message property', () => {
        const err = { message: '  message text  ' };
        expect(提取解析失败原始信息(err)).toBe('message text');
    });

    it('prefers parseDetail over message', () => {
        const err = { parseDetail: 'parse info', message: 'msg info' };
        expect(提取解析失败原始信息(err)).toBe('parse info');
    });

    it('ignores empty parseDetail', () => {
        const err = { parseDetail: '   ', message: 'fallback msg' };
        expect(提取解析失败原始信息(err)).toBe('fallback msg');
    });

    it('ignores empty string input', () => {
        expect(提取解析失败原始信息('   ')).toBe('返回内容不符合标签协议');
    });
});
