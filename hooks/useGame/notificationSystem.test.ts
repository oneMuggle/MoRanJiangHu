import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 创建通知系统 } from './notificationSystem';

function makeSetter() {
    let state: any[] = [];
    const setter = vi.fn((updater: any) => {
        if (typeof updater === 'function') {
            state = updater(state);
        } else {
            state = updater;
        }
    });
    return { setter, getState: () => state };
}

describe('创建通知系统', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns push and close functions', () => {
        const { setter } = makeSetter();
        const { 推送右下角提示, 关闭右下角提示 } = 创建通知系统(setter);
        expect(typeof 推送右下角提示).toBe('function');
        expect(typeof 关闭右下角提示).toBe('function');
    });

    it('pushes a toast with generated id', () => {
        const { setter, getState } = makeSetter();
        const { 推送右下角提示 } = 创建通知系统(setter);
        推送右下角提示({ title: 'Test', message: 'Hello', tone: 'info' });
        const toasts = getState();
        expect(toasts).toHaveLength(1);
        expect(toasts[0].id).toMatch(/^toast_/);
        expect(toasts[0].title).toBe('Test');
        expect(toasts[0].message).toBe('Hello');
        expect(toasts[0].tone).toBe('info');
    });

    it('caps at 4 toasts (slice -4)', () => {
        const { setter, getState } = makeSetter();
        const { 推送右下角提示 } = 创建通知系统(setter);
        推送右下角提示({ title: '1', message: 'a' });
        推送右下角提示({ title: '2', message: 'b' });
        推送右下角提示({ title: '3', message: 'c' });
        推送右下角提示({ title: '4', message: 'd' });
        推送右下角提示({ title: '5', message: 'e' });
        expect(getState()).toHaveLength(4);
        expect(getState()[0].title).toBe('2');
        expect(getState()[3].title).toBe('5');
    });

    it('auto-removes toast after 4200ms', () => {
        const { setter, getState } = makeSetter();
        const { 推送右下角提示 } = 创建通知系统(setter);
        推送右下角提示({ title: 'Auto', message: 'gone' });
        expect(getState()).toHaveLength(1);
        vi.advanceTimersByTime(4200);
        expect(getState()).toHaveLength(0);
    });

    it('manually closes a toast by id', () => {
        const { setter, getState } = makeSetter();
        const { 推送右下角提示, 关闭右下角提示 } = 创建通知系统(setter);
        推送右下角提示({ title: 'Keep', message: 'stay' });
        推送右下角提示({ title: 'Close', message: 'bye' });
        const toasts = getState();
        关闭右下角提示(toasts[1].id);
        expect(getState()).toHaveLength(1);
        expect(getState()[0].title).toBe('Keep');
    });

    it('ignores close with empty id', () => {
        const { setter, getState } = makeSetter();
        const { 推送右下角提示, 关闭右下角提示 } = 创建通知系统(setter);
        推送右下角提示({ title: 'Test', message: 'stay' });
        关闭右下角提示('');
        expect(getState()).toHaveLength(1);
    });

    it('defaults tone when not provided', () => {
        const { setter, getState } = makeSetter();
        const { 推送右下角提示 } = 创建通知系统(setter);
        推送右下角提示({ title: 'No tone', message: 'ok' });
        expect(getState()[0].tone).toBeUndefined();
    });
});
