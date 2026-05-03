import React, { createContext, useContext, useMemo } from 'react';
import type {
    NPC结构,
    NPC图片记录,
    场景图片档案,
    场景生图任务记录,
    场景生图结果,
    NPC生图任务记录,
    图片管理筛选条件,
    接口设置结构
} from '../../../../../types';
import { useImageManagerState } from '../hooks/useImageManagerState';
import type { 页面标签类型, NPC图库分组, 合并队列记录 } from '../types';

export interface ImageManagerContextValue {
    filters: 图片管理筛选条件;
    activeTab: 页面标签类型;
    selectedNpcId: string;
    npcOptions: { id: string; 姓名: string; 性别?: string; 是否主要角色?: boolean }[];
    records: NPC图片记录[];
    filteredRecords: NPC图片记录[];
    queue: NPC生图任务记录[];
    filteredQueue: NPC生图任务记录[];
    combinedQueue: 合并队列记录[];
    filteredCombinedQueue: 合并队列记录[];
    sceneHistory: 场景生图结果[];
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

const ImageManagerContext = createContext<ImageManagerContextValue | null>(null);

interface ProviderProps {
    children: React.ReactNode;
    socialList: NPC结构[];
    queue: NPC生图任务记录[];
    sceneArchive: 场景图片档案;
    sceneQueue: 场景生图任务记录[];
    apiConfig?: 接口设置结构;
    cultivationSystemEnabled?: boolean;
}

export const ImageManagerProvider: React.FC<ProviderProps> = ({
    children,
    socialList,
    queue,
    sceneArchive,
    sceneQueue,
    apiConfig,
    cultivationSystemEnabled
}) => {
    const state = useImageManagerState({
        socialList,
        queue,
        sceneArchive,
        sceneQueue,
        apiConfig,
        cultivationSystemEnabled
    });

    const value = useMemo(() => state, [state]);

    return (
        <ImageManagerContext.Provider value={value}>
            {children}
        </ImageManagerContext.Provider>
    );
};

export function useImageManagerContext(): ImageManagerContextValue {
    const context = useContext(ImageManagerContext);
    if (!context) {
        throw new Error('useImageManagerContext must be used within ImageManagerProvider');
    }
    return context;
}

export { ImageManagerContext };