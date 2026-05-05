/** 后台生图监控系统 */

import { useEffect, useRef } from 'react';
import type { 场景生图任务记录, NPC生图任务记录, 香闺秘档部位类型 } from '../../types';

export const useBackgroundImageMonitor = (deps: {
    推送右下角提示: (toast: { title: string; message: string; tone?: 'info' | 'success' | 'error' }) => void;
    NPC生图任务队列: NPC生图任务记录[];
    场景生图任务队列: 场景生图任务记录[];
}) => {
    const 后台手动生图监控Ref = useRef<Array<{ npcId: string; since: number; npcName: string; 构图: '头像' | '半身' | '立绘' }>>([]);
    const 已提示后台生图任务Ref = useRef<Set<string>>(new Set());
    const 后台私密生图监控Ref = useRef<Array<{ npcId: string; since: number; npcName: string; 部位: 香闺秘档部位类型 }>>([]);
    const 已提示后台私密生图任务Ref = useRef<Set<string>>(new Set());
    const 后台场景生图监控Ref = useRef<Array<{ since: number; 摘要: string }>>([]);
    const 已提示后台场景生图任务Ref = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!后台手动生图监控Ref.current.length) return;
        const pendingMonitors = 后台手动生图监控Ref.current.filter((monitor) => {
            const matchedTask = (Array.isArray(deps.NPC生图任务队列) ? deps.NPC生图任务队列 : []).find((task) => (
                (task?.NPC标识 === monitor.npcId || task?.NPC标识 === `id:${monitor.npcId}`)
                && (task?.来源 === 'manual' || task?.来源 === 'retry')
                && (task?.创建时间 || 0) >= monitor.since
            ));
            if (!matchedTask || (matchedTask.状态 !== 'success' && matchedTask.状态 !== 'failed')) {
                return true;
            }
            if (已提示后台生图任务Ref.current.has(matchedTask.id)) {
                return false;
            }
            已提示后台生图任务Ref.current.add(matchedTask.id);
            deps.推送右下角提示({
                title: matchedTask.状态 === 'success' ? '手动生图完成' : '手动生图失败',
                message: matchedTask.状态 === 'success'
                    ? `${monitor.npcName}的${monitor.构图}已生成完成。`
                    : `${monitor.npcName}的${monitor.构图}生成失败：${matchedTask.错误信息 || '未知错误'}`,
                tone: matchedTask.状态 === 'success' ? 'success' : 'error'
            });
            return false;
        });
        后台手动生图监控Ref.current = pendingMonitors;
    }, [deps.NPC生图任务队列]);

    useEffect(() => {
        if (!后台私密生图监控Ref.current.length) return;
        const pendingMonitors = 后台私密生图监控Ref.current.filter((monitor) => {
            const matchedTask = (Array.isArray(deps.NPC生图任务队列) ? deps.NPC生图任务队列 : []).find((task) => (
                (task?.NPC标识 === monitor.npcId || task?.NPC标识 === `id:${monitor.npcId}`)
                && task?.来源 === 'manual'
                && task?.构图 === '部位特写'
                && task?.部位 === monitor.部位
                && (task?.创建时间 || 0) >= monitor.since
            ));
            if (!matchedTask || (matchedTask.状态 !== 'success' && matchedTask.状态 !== 'failed')) {
                return true;
            }
            if (已提示后台私密生图任务Ref.current.has(matchedTask.id)) {
                return false;
            }
            已提示后台私密生图任务Ref.current.add(matchedTask.id);
            deps.推送右下角提示({
                title: matchedTask.状态 === 'success' ? '私密特写完成' : '私密特写失败',
                message: matchedTask.状态 === 'success'
                    ? `${monitor.npcName}的${monitor.部位}特写已生成完成。`
                    : `${monitor.npcName}的${monitor.部位}特写生成失败：${matchedTask.错误信息 || '未知错误'}`,
                tone: matchedTask.状态 === 'success' ? 'success' : 'error'
            });
            return false;
        });
        后台私密生图监控Ref.current = pendingMonitors;
    }, [deps.NPC生图任务队列]);

    useEffect(() => {
        if (!后台场景生图监控Ref.current.length) return;
        const pendingMonitors = 后台场景生图监控Ref.current.filter((monitor) => {
            const matchedTask = (Array.isArray(deps.场景生图任务队列) ? deps.场景生图任务队列 : []).find((task) => (
                task?.来源 === 'manual'
                && (task?.创建时间 || 0) >= monitor.since
            ));
            if (!matchedTask || (matchedTask.状态 !== 'success' && matchedTask.状态 !== 'failed')) {
                return true;
            }
            if (已提示后台场景生图任务Ref.current.has(matchedTask.id)) {
                return false;
            }
            已提示后台场景生图任务Ref.current.add(matchedTask.id);
            deps.推送右下角提示({
                title: matchedTask.状态 === 'success' ? '场景生图完成' : '场景生图失败',
                message: matchedTask.状态 === 'success'
                    ? `${monitor.摘要 || '当前正文场景'}已生成完成。`
                    : `${monitor.摘要 || '当前正文场景'}生成失败：${matchedTask.错误信息 || '未知错误'}`,
                tone: matchedTask.状态 === 'success' ? 'success' : 'error'
            });
            return false;
        });
        后台场景生图监控Ref.current = pendingMonitors;
    }, [deps.场景生图任务队列]);

    const 记录后台场景监控 = (item: { since: number; 摘要: string }) => {
        后台场景生图监控Ref.current.push(item);
    };

    const 记录后台手动生图监控 = (payload: { npcId: string; since: number; npcName: string; 构图: '头像' | '半身' | '立绘' }) => {
        后台手动生图监控Ref.current.push(payload);
    };

    const 记录后台私密生图监控 = (payload: { npcId: string; since: number; npcName: string; 部位: 香闺秘档部位类型 }) => {
        后台私密生图监控Ref.current.push(payload);
    };

    return {
        refs: {
            后台手动生图监控Ref,
            已提示后台生图任务Ref,
            后台私密生图监控Ref,
            已提示后台私密生图任务Ref,
            后台场景生图监控Ref,
            已提示后台场景生图任务Ref
        },
        记录后台场景监控,
        记录后台手动生图监控,
        记录后台私密生图监控
    };
};
