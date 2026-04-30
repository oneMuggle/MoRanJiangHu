import { describe, it, expect } from 'vitest';
import {
    规范化结构化时间,
    结构化时间转标准串,
    标准时间串转结构化,
    环境时间转标准串,
    提取环境月日,
    normalizeCanonicalGameTime,
    提取时间月日,
} from './timeUtils';

describe('规范化结构化时间', () => {
    it('normalizes valid time objects', () => {
        const result = 规范化结构化时间({ 年: 2026, 月: 4, 日: 30, 时: 14, 分: 30 });
        expect(result).toEqual({ 年: 2026, 月: 4, 日: 30, 时: 14, 分: 30 });
    });

    it('returns null for null/undefined', () => {
        expect(规范化结构化时间(null)).toBeNull();
        expect(规范化结构化时间(undefined)).toBeNull();
    });

    it('returns null for non-objects', () => {
        expect(规范化结构化时间('2026-04-30')).toBeNull();
        expect(规范化结构化时间(12345)).toBeNull();
    });

    it('returns null for arrays', () => {
        expect(规范化结构化时间([2026, 4, 30, 14, 30])).toBeNull();
    });

    it('returns null for missing fields', () => {
        const result = 规范化结构化时间({ 年: 2026 });
        expect(result).toBeNull();
    });

    it('returns null for out-of-range values', () => {
        expect(规范化结构化时间({ 年: 2026, 月: 13, 日: 1, 时: 0, 分: 0 })).toBeNull();
        expect(规范化结构化时间({ 年: 2026, 月: 0, 日: 1, 时: 0, 分: 0 })).toBeNull();
        expect(规范化结构化时间({ 年: 2026, 月: 1, 日: 32, 时: 0, 分: 0 })).toBeNull();
        expect(规范化结构化时间({ 年: 2026, 月: 1, 日: 1, 时: 24, 分: 0 })).toBeNull();
        expect(规范化结构化时间({ 年: 2026, 月: 1, 日: 1, 时: 0, 分: 60 })).toBeNull();
    });

    it('returns null for non-finite values', () => {
        expect(规范化结构化时间({ 年: NaN, 月: 1, 日: 1, 时: 0, 分: 0 })).toBeNull();
        expect(规范化结构化时间({ 年: Infinity, 月: 1, 日: 1, 时: 0, 分: 0 })).toBeNull();
    });

    it('accepts string-number fields', () => {
        const result = 规范化结构化时间({ 年: '2026', 月: '4', 日: '30', 时: '14', 分: '30' });
        expect(result).toEqual({ 年: 2026, 月: 4, 日: 30, 时: 14, 分: 30 });
    });
});

describe('结构化时间转标准串', () => {
    it('converts to canonical format', () => {
        expect(结构化时间转标准串({ 年: 2026, 月: 4, 日: 30, 时: 14, 分: 5 })).toBe('2026:04:30:14:05');
    });

    it('pads single-digit values', () => {
        // Year is NOT padded (no padStart on year), only month/day/hour/minute
        expect(结构化时间转标准串({ 年: 1, 月: 1, 日: 1, 时: 1, 分: 1 })).toBe('1:01:01:01:01');
    });

    it('returns null for invalid input', () => {
        expect(结构化时间转标准串(null)).toBeNull();
        expect(结构化时间转标准串({ 年: 2026 })).toBeNull();
    });
});

describe('标准时间串转结构化', () => {
    it('parses canonical format', () => {
        const result = 标准时间串转结构化('2026:04:30:14:05');
        expect(result).toEqual({ 年: 2026, 月: 4, 日: 30, 时: 14, 分: 5 });
    });

    it('returns null for invalid strings', () => {
        expect(标准时间串转结构化('not-a-time')).toBeNull();
        expect(标准时间串转结构化('')).toBeNull();
        expect(标准时间串转结构化(undefined)).toBeNull();
    });
});

describe('normalizeCanonicalGameTime', () => {
    it('normalizes valid time strings', () => {
        expect(normalizeCanonicalGameTime('2026:4:30:14:5')).toBe('2026:04:30:14:05');
    });

    it('trims whitespace', () => {
        expect(normalizeCanonicalGameTime('  2026:4:30:14:5  ')).toBe('2026:04:30:14:05');
    });

    it('returns null for invalid formats', () => {
        expect(normalizeCanonicalGameTime('2026-04-30')).toBeNull();
        expect(normalizeCanonicalGameTime('2026/04/30 14:05')).toBeNull();
        expect(normalizeCanonicalGameTime('')).toBeNull();
        expect(normalizeCanonicalGameTime(undefined)).toBeNull();
    });

    it('returns null for out-of-range values', () => {
        expect(normalizeCanonicalGameTime('2026:13:30:14:05')).toBeNull();
        expect(normalizeCanonicalGameTime('2026:04:32:14:05')).toBeNull();
        expect(normalizeCanonicalGameTime('2026:04:30:24:05')).toBeNull();
        expect(normalizeCanonicalGameTime('2026:04:30:14:60')).toBeNull();
    });
});

describe('环境时间转标准串', () => {
    it('uses 时间 field if present', () => {
        const env = { 时间: '2026:4:30:14:5' };
        expect(环境时间转标准串(env)).toBe('2026:04:30:14:05');
    });

    it('falls back to structured time', () => {
        const env = { 年: 2026, 月: 4, 日: 30, 时: 14, 分: 5 };
        expect(环境时间转标准串(env)).toBe('2026:04:30:14:05');
    });

    it('returns null for invalid env', () => {
        expect(环境时间转标准串(null)).toBeNull();
        expect(环境时间转标准串('string')).toBeNull();
        expect(环境时间转标准串([])).toBeNull();
    });
});

describe('提取时间月日', () => {
    it('extracts month and day', () => {
        expect(提取时间月日('2026:04:30:14:05')).toEqual({ month: 4, day: 30 });
    });

    it('returns null for invalid input', () => {
        expect(提取时间月日(null)).toBeNull();
        expect(提取时间月日('invalid')).toBeNull();
    });
});

describe('提取环境月日', () => {
    it('extracts from 时间 field', () => {
        const env = { 时间: '2026:04:30:14:05' };
        expect(提取环境月日(env)).toEqual({ month: 4, day: 30 });
    });

    it('extracts from structured fields', () => {
        const env = { 年: 2026, 月: 4, 日: 30, 时: 14, 分: 5 };
        expect(提取环境月日(env)).toEqual({ month: 4, day: 30 });
    });

    it('returns null for invalid env', () => {
        expect(提取环境月日(null)).toBeNull();
    });
});
