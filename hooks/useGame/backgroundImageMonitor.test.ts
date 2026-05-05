import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBackgroundImageMonitor } from './backgroundImageMonitor';

describe('backgroundImageMonitor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('useBackgroundImageMonitor', () => {
        const makeDeps = (overrides: any = {}) => ({
            推送右下角提示: vi.fn(),
            NPC生图任务队列: [],
            场景生图任务队列: [],
            ...overrides,
        });

        it('returns refs and recording functions', () => {
            const deps = makeDeps();
            const { result } = renderHook(() => useBackgroundImageMonitor(deps));
            expect(result.current.refs).toBeDefined();
            expect(typeof result.current.记录后台场景监控).toBe('function');
            expect(typeof result.current.记录后台手动生图监控).toBe('function');
            expect(typeof result.current.记录后台私密生图监控).toBe('function');
        });

        it('records manual image generation monitor', () => {
            const deps = makeDeps();
            const { result } = renderHook(() => useBackgroundImageMonitor(deps));
            result.current.记录后台手动生图监控({ npcId: 'npc_1', since: Date.now(), npcName: '张三', 构图: '头像' });
            expect(result.current.refs.后台手动生图监控Ref.current).toHaveLength(1);
        });

        it('records private image generation monitor', () => {
            const deps = makeDeps();
            const { result } = renderHook(() => useBackgroundImageMonitor(deps));
            result.current.记录后台私密生图监控({ npcId: 'npc_1', since: Date.now(), npcName: '张三', 部位: '胸部' });
            expect(result.current.refs.后台私密生图监控Ref.current).toHaveLength(1);
        });

        it('records scene image generation monitor', () => {
            const deps = makeDeps();
            const { result } = renderHook(() => useBackgroundImageMonitor(deps));
            result.current.记录后台场景监控({ since: Date.now(), 摘要: '场景摘要' });
            expect(result.current.refs.后台场景生图监控Ref.current).toHaveLength(1);
        });

        it('shows success toast when manual task completes', () => {
            const task = {
                id: 'task_1',
                NPC标识: 'npc_1',
                来源: 'manual' as const,
                状态: 'success' as const,
                创建时间: Date.now(),
                构图: '头像' as const,
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台手动生图监控({ npcId: 'npc_1', since: task.创建时间 - 1000, npcName: '张三', 构图: '头像' });
            act(() => {
                deps.NPC生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledWith(
                expect.objectContaining({ title: '手动生图完成', tone: 'success' })
            );
        });

        it('shows error toast when manual task fails', () => {
            const task = {
                id: 'task_1',
                NPC标识: 'npc_1',
                来源: 'manual' as const,
                状态: 'failed' as const,
                创建时间: Date.now(),
                构图: '立绘' as const,
                错误信息: '超时',
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台手动生图监控({ npcId: 'npc_1', since: task.创建时间 - 1000, npcName: '张三', 构图: '立绘' });
            act(() => {
                deps.NPC生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledWith(
                expect.objectContaining({ title: '手动生图失败', tone: 'error' })
            );
        });

        it('ignores tasks that are still running', () => {
            const task = {
                id: 'task_1',
                NPC标识: 'npc_1',
                来源: 'manual' as const,
                状态: 'running' as const,
                创建时间: Date.now(),
                构图: '头像' as const,
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台手动生图监控({ npcId: 'npc_1', since: task.创建时间 - 1000, npcName: '张三', 构图: '头像' });
            act(() => {
                deps.NPC生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).not.toHaveBeenCalled();
        });

        it('matches tasks by id: prefix', () => {
            const task = {
                id: 'task_1',
                NPC标识: 'id:npc_1',
                来源: 'manual' as const,
                状态: 'success' as const,
                创建时间: Date.now(),
                构图: '头像' as const,
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台手动生图监控({ npcId: 'npc_1', since: task.创建时间 - 1000, npcName: '张三', 构图: '头像' });
            act(() => {
                deps.NPC生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledWith(
                expect.objectContaining({ title: '手动生图完成' })
            );
        });

        it('shows private part completion toast', () => {
            const task = {
                id: 'task_1',
                NPC标识: 'npc_1',
                来源: 'manual' as const,
                状态: 'success' as const,
                创建时间: Date.now(),
                构图: '部位特写' as const,
                部位: '胸部' as const,
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台私密生图监控({ npcId: 'npc_1', since: task.创建时间 - 1000, npcName: '张三', 部位: '胸部' });
            act(() => {
                deps.NPC生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledWith(
                expect.objectContaining({ title: '私密特写完成', tone: 'success' })
            );
        });

        it('shows scene completion toast', () => {
            const task = {
                id: 'scene_task_1',
                来源: 'manual' as const,
                状态: 'success' as const,
                创建时间: Date.now(),
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台场景监控({ since: task.创建时间 - 1000, 摘要: '竹林夜色' });
            act(() => {
                deps.场景生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledWith(
                expect.objectContaining({ title: '场景生图完成', tone: 'success' })
            );
        });

        it('shows scene failure toast with fallback text', () => {
            const task = {
                id: 'scene_task_1',
                来源: 'manual' as const,
                状态: 'failed' as const,
                创建时间: Date.now(),
                错误信息: '网络错误',
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台场景监控({ since: task.创建时间 - 1000, 摘要: '' });
            act(() => {
                deps.场景生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledWith(
                expect.objectContaining({ title: '场景生图失败' })
            );
            expect(deps.推送右下角提示).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('当前正文场景') })
            );
        });

        it('does not trigger for non-manual tasks', () => {
            const task = {
                id: 'task_1',
                NPC标识: 'npc_1',
                来源: 'auto' as const,
                状态: 'success' as const,
                创建时间: Date.now(),
                构图: '头像' as const,
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台手动生图监控({ npcId: 'npc_1', since: task.创建时间 - 1000, npcName: '张三', 构图: '头像' });
            act(() => {
                deps.NPC生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).not.toHaveBeenCalled();
        });

        it('deduplicates completed task notifications', () => {
            const task = {
                id: 'task_1',
                NPC标识: 'npc_1',
                来源: 'manual' as const,
                状态: 'success' as const,
                创建时间: Date.now(),
                构图: '头像' as const,
            };
            const deps = makeDeps();
            const { result, rerender } = renderHook(({ deps }) => useBackgroundImageMonitor(deps), { initialProps: { deps } });
            result.current.记录后台手动生图监控({ npcId: 'npc_1', since: task.创建时间 - 1000, npcName: '张三', 构图: '头像' });
            act(() => {
                deps.NPC生图任务队列 = [task];
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledTimes(1);

            // Second rerender with same task should not trigger again
            act(() => {
                rerender({ deps });
            });
            expect(deps.推送右下角提示).toHaveBeenCalledTimes(1);
        });
    });
});
