import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type {
    NPC结构,
    NPC图片记录,
    场景图片档案,
    场景生图任务记录,
    NPC生图任务记录,
    图片管理筛选条件,
    接口设置结构
} from '../../../../../types';
import { 规范化接口设置 } from '../../../../../utils/apiConfig';
import type { 页面标签类型, NPC图库分组, 合并队列记录 } from '../types';

interface UseImageManagerStateOptions {
    socialList: NPC结构[];
    queue: NPC生图任务记录[];
    sceneArchive: 场景图片档案;
    sceneQueue: 场景生图任务记录[];
    apiConfig?: 接口设置结构;
    cultivationSystemEnabled?: boolean;
}

interface ImageManagerState {
    filters: 图片管理筛选条件;
    activeTab: 页面标签类型;
    selectedNpcId: string;
    npcOptions: { id: string; 姓名: string; 性别?: string; 是否主要角色?: boolean }[];
    records: NPC图片记录[];
    filteredRecords: NPC图片记录[];
    queue: NPC生图任务Record[];
    filteredQueue: NPC生图任务Record[];
    combinedQueue: 合并队列记录[];
    filteredCombinedQueue: 合并队列记录[];
    sceneHistory: 场景生图任务记录[];
    sceneQueueList: 场景生图任务记录[];
    图片统计: { total: number; success: number; failed: number; pending: number };
    队列统计: { total: number; queued: number; running: number; success: number; failed: number };
    sceneStats: { total: number; success: number; failed: number; pending: number; queueTotal: number; queueRunning: number };
    npcLibraryGroups: NPC图库分组[];
    libraryNpcId: string;
    currentLibraryGroup: NPC图库分组 | null;
    presetConfig: 接口设置结构;
    showRealm: boolean;
    setFilters: React.Dispatch<React.SetStateAction<图片管理筛选条件>>;
    setActiveTab: React.Dispatch<React.SetStateAction<页面标签类型>>;
    setSelectedNpcId: React.Dispatch<React.SetStateAction<string>>;
    setLibraryNpcId: React.Dispatch<React.SetStateAction<string>>;
}

type NPC生图任务Record = NPC生图任务记录;

export function useImageManagerState(options: UseImageManagerStateOptions): ImageManagerState {
    const {
        socialList,
        queue,
        sceneArchive,
        sceneQueue,
        apiConfig,
        cultivationSystemEnabled = true
    } = options;

    const showRealm = cultivationSystemEnabled !== false;

    const [filters, setFilters] = useState<图片管理筛选条件>({
        目标类型: '全部' as const,
        角色姓名: '',
        状态: '全部' as const
    });

    const [activeTab, setActiveTab] = useState<页面标签类型>('manual');
    const [selectedNpcId, setSelectedNpcId] = useState<string>('');
    const [libraryNpcId, setLibraryNpcId] = useState<string>('');

    const presetConfig = useMemo(() => 规范化接口设置(apiConfig), [apiConfig]);

    const npcOptions = useMemo(() => {
        return (Array.isArray(socialList) ? socialList : [])
            .filter((npc) => npc && typeof npc.id === 'string' && npc.id.trim())
            .slice()
            .sort((a, b) => {
                if (a.是否主要角色 !== b.是否主要角色) {
                    return a.是否主要角色 ? -1 : 1;
                }
                return (a.姓名 || '').localeCompare(b.姓名 || '', 'zh-CN');
            });
    }, [socialList]);

    const records = useMemo<NPC图片记录[]>(() => {
        return (Array.isArray(socialList) ? socialList : [])
            .flatMap((npc) => {
                const hasExplicitHistory = Array.isArray(npc?.图片档案?.生图历史);
                const history = hasExplicitHistory ? npc.图片档案?.生图历史 : [];
                const fallbackRecent = !hasExplicitHistory && npc?.最近生图结果 ? [npc.最近生图结果] : [];
                const safeHistory = Array.isArray(history) ? history : [];
                const resultList = (safeHistory.length > 0 ? safeHistory : fallbackRecent)
                    .filter((item) => item && typeof item === 'object');
                return resultList.map((result) => ({
                    目标类型: 'npc' as const,
                    NPC标识: npc.id,
                    NPC姓名: npc.姓名,
                    NPC性别: npc.性别,
                    是否主要角色: npc.是否主要角色,
                    结果: result
                }));
            })
            .sort((a, b) => (b.结果?.生成时间 || 0) - (a.结果?.生成时间 || 0));
    }, [socialList]);

    const filteredRecords = useMemo(() => {
        const keyword = (filters.角色姓名 || '').trim().toLowerCase();
        return records.filter((record) => {
            if (filters.目标类型 && filters.目标类型 !== '全部' && record.目标类型 !== filters.目标类型) {
                return false;
            }
            if (filters.角色标识 && record.NPC标识 !== filters.角色标识) {
                return false;
            }
            if (keyword && !record.NPC姓名.toLowerCase().includes(keyword)) {
                return false;
            }
            if (filters.状态 && filters.状态 !== '全部' && (record.结果?.状态 || 'success') !== filters.状态) {
                return false;
            }
            return true;
        });
    }, [records, filters]);

    const queueList = useMemo(() => {
        return (Array.isArray(queue) ? queue : []).slice().sort((a, b) => (b.创建时间 || 0) - (a.创建时间 || 0));
    }, [queue]);

    const filteredQueue = useMemo(() => {
        const keyword = (filters.角色姓名 || '').trim().toLowerCase();
        return queueList.filter((task) => {
            if (filters.角色标识 && task.NPC标识 !== filters.角色标识) {
                return false;
            }
            if (keyword && !task.NPC姓名.toLowerCase().includes(keyword)) {
                return false;
            }
            if (filters.状态 && filters.状态 !== '全部') {
                if (filters.状态 === 'pending') {
                    return task.状态 === 'queued' || task.状态 === 'running';
                }
                return task.状态 === filters.状态;
            }
            return true;
        });
    }, [filters, queueList]);

    const combinedQueue = useMemo<合并队列记录[]>(() => {
        const sceneRecords = (Array.isArray(sceneQueue) ? sceneQueue : []).map((task) => ({
            类型: 'scene' as const,
            id: task.id,
            创建时间: task.创建时间 || 0,
            状态: task.状态,
            task
        }));
        const npcRecords = queueList.map((task) => ({
            类型: 'npc' as const,
            id: task.id,
            创建时间: task.创建时间 || 0,
            状态: task.状态,
            task
        }));
        return [...npcRecords, ...sceneRecords].sort((a, b) => b.创建时间 - a.创建时间);
    }, [queueList, sceneQueue]);

    const filteredCombinedQueue = useMemo(() => {
        const keyword = (filters.角色姓名 || '').trim().toLowerCase();
        return combinedQueue.filter((entry) => {
            if (filters.目标类型 && filters.目标类型 !== '全部' && entry.类型 !== filters.目标类型) {
                return false;
            }
            if (filters.状态 && filters.状态 !== '全部') {
                if (filters.状态 === 'pending') {
                    if (!(entry.状态 === 'queued' || entry.状态 === 'running')) return false;
                } else if (entry.状态 !== filters.状态) {
                    return false;
                }
            }
            if (!keyword) return true;
            if (entry.类型 === 'npc') {
                const task = entry.task as NPC生图任务记录;
                return (task.NPC姓名 || '').toLowerCase().includes(keyword);
            }
            const task = entry.task as 场景生图任务记录;
            const text = [task.摘要, task.场景类型, task.进度文本, '场景']
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return text.includes(keyword);
        });
    }, [combinedQueue, filters]);

    const sceneHistory = useMemo(() => {
        return (Array.isArray(sceneArchive?.生图历史) ? sceneArchive.生图历史 : [])
            .slice()
            .sort((a, b) => (b?.生成时间 || 0) - (a?.生成时间 || 0));
    }, [sceneArchive]);

    const sceneQueueList = useMemo(() => {
        return (Array.isArray(sceneQueue) ? sceneQueue : []).slice().sort((a, b) => (b.创建时间 || 0) - (a.创建时间 || 0));
    }, [sceneQueue]);

    const 图片统计 = useMemo(() => ({
        total: records.length + sceneHistory.length,
        success: records.filter((item) => (item.结果?.状态 || 'success') === 'success').length + sceneHistory.filter((item) => (item?.状态 || 'success') === 'success').length,
        failed: records.filter((item) => item.结果?.状态 === 'failed').length + sceneHistory.filter((item) => item?.状态 === 'failed').length,
        pending: records.filter((item) => item.结果?.状态 === 'pending').length + sceneHistory.filter((item) => item?.状态 === 'pending').length
    }), [records, sceneHistory]);

    const 队列统计 = useMemo(() => ({
        total: combinedQueue.length,
        queued: combinedQueue.filter((item) => item.状态 === 'queued').length,
        running: combinedQueue.filter((item) => item.状态 === 'running').length,
        success: combinedQueue.filter((item) => item.状态 === 'success').length,
        failed: combinedQueue.filter((item) => item.状态 === 'failed').length
    }), [combinedQueue]);

    const sceneStats = useMemo(() => ({
        total: sceneHistory.length,
        success: sceneHistory.filter((item) => (item?.状态 || 'success') === 'success').length,
        failed: sceneHistory.filter((item) => item?.状态 === 'failed').length,
        pending: sceneHistory.filter((item) => item?.状态 === 'pending').length,
        queueTotal: sceneQueueList.length,
        queueRunning: sceneQueueList.filter((item) => item?.状态 === 'running').length
    }), [sceneHistory, sceneQueueList]);

    const npcLibraryGroups = useMemo<NPC图库分组[]>(() => {
        const recordMap = new Map<string, NPC图片记录[]>();
        filteredRecords.forEach((record) => {
            const key = record.NPC标识 || '';
            if (!key) return;
            const current = recordMap.get(key) || [];
            current.push(record);
            recordMap.set(key, current);
        });
        return npcOptions
            .map((npc) => ({
                npc,
                records: recordMap.get(npc.id) || []
            }))
            .filter((group) => group.records.length > 0);
    }, [filteredRecords, npcOptions]);

    const currentLibraryGroup = useMemo(() => {
        return npcLibraryGroups.find((group) => group.npc.id === libraryNpcId) || null;
    }, [npcLibraryGroups, libraryNpcId]);

    useEffect(() => {
        if (!selectedNpcId && npcOptions.length > 0) {
            setSelectedNpcId(npcOptions[0].id);
        }
    }, [npcOptions, selectedNpcId]);

    useEffect(() => {
        if (activeTab !== 'library') return;
        if (!npcLibraryGroups.length) {
            setLibraryNpcId('');
            return;
        }
        const exists = npcLibraryGroups.some((group) => group.npc.id === libraryNpcId);
        if (!libraryNpcId || !exists) {
            setLibraryNpcId(npcLibraryGroups[0].npc.id);
        }
    }, [activeTab, npcLibraryGroups, libraryNpcId]);

    return {
        filters,
        activeTab,
        selectedNpcId,
        npcOptions,
        records,
        filteredRecords,
        queue: queueList,
        filteredQueue,
        combinedQueue,
        filteredCombinedQueue,
        sceneHistory,
        sceneQueueList,
        图片统计,
        队列统计,
        sceneStats,
        npcLibraryGroups,
        libraryNpcId,
        currentLibraryGroup,
        presetConfig,
        showRealm,
        setFilters,
        setActiveTab,
        setSelectedNpcId,
        setLibraryNpcId
    };
}