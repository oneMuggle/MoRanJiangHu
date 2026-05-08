// hooks/useGame/subsystems/zustandStore.ts
// Zustand 主 store — 渐进式迁移入口
// 当前: 将已验证的 slice 纳入 Zustand，其余仍用 hook-based
// 未来: 逐步将 useGame.ts 中所有 useState 迁移到此 store

import { create } from 'zustand';
import type { 右下角提示结构 } from '../ui/notificationSystem';
import type { 旅行事件 } from '../travel/travelWorkflow';
import type { DeviceState } from '../../../models/mobileDevice';
import type { 设备刷新任务 } from '../device/deviceRefreshMonitor';
import type { NPC生图任务记录, 场景生图任务记录, 世界书结构, 世界书预设组结构, 内置提示词条目结构, 场景图片档案, 时代信息结构 } from '../../../types';
import type { 记忆压缩任务结构 } from '../memory/memoryUtils';
import type { NPC记忆总结任务结构, 记忆总结阶段类型 } from '../memory/memorySummaryHandlers';
import type { WorldGenConfig } from '../../../models/system';
import type { 角色数据结构 } from '../../../models/character';
import type { OpeningConfig } from '../../../models/system';

// Type helpers for slices (defined locally to avoid circular deps with useGame.ts)
type 最近开局配置结构 = {
    worldConfig: WorldGenConfig;
    charData: 角色数据结构;
    openingConfig?: OpeningConfig;
    openingStreaming: boolean;
    openingExtraPrompt: string;
};

type 开局独立阶段进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped' | 'cancelled';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

// ==================== Type Helper ====================

type ZustandSlice<T> = (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T,
    store: unknown
) => T;

// ==================== UI Slice (Zustand) ====================

interface UIState {
    右下角提示列表: 右下角提示结构[];
    聊天区自动滚动抑制令牌: number;
    聊天区强制置底令牌: number;
    可重Roll计数: number;
}

interface UIActions {
    推送右下角提示: (toast: Omit<右下角提示结构, 'id'>) => void;
    关闭右下角提示: (toastId: string) => void;
    抑制滚动: () => void;
    强制置底: () => void;
    递增重Roll计数: () => void;
    重置重Roll计数: () => void;
    set右下角提示列表: (updater: 右下角提示结构[] | ((prev: 右下角提示结构[]) => 右下角提示结构[])) => void;
    set聊天区自动滚动抑制令牌: (updater: number | ((prev: number) => number)) => void;
    set聊天区强制置底令牌: (updater: number | ((prev: number) => number)) => void;
    set可重Roll计数: (updater: number | ((prev: number) => number)) => void;
}

interface UISlice extends UIState, UIActions {}

const createUISlice: ZustandSlice<UISlice> = (set) => ({
    // --- state ---
    右下角提示列表: [],
    聊天区自动滚动抑制令牌: 0,
    聊天区强制置底令牌: 0,
    可重Roll计数: 0,

    // --- actions ---
    推送右下角提示: (toast) => {
        const nextId = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        set((state) => {
            const next = [...state.右下角提示列表, { id: nextId, ...toast }].slice(-4);
            window.setTimeout(() => {
                set((s) => ({
                    右下角提示列表: s.右下角提示列表.filter(item => item.id !== nextId)
                }));
            }, 4200);
            return { 右下角提示列表: next };
        });
    },
    关闭右下角提示: (toastId) => {
        if (!toastId) return;
        set((state) => ({
            右下角提示列表: state.右下角提示列表.filter(t => t.id !== toastId)
        }));
    },
    抑制滚动: () => set((state) => ({
        聊天区自动滚动抑制令牌: state.聊天区自动滚动抑制令牌 + 1
    })),
    强制置底: () => set((state) => ({
        聊天区强制置底令牌: state.聊天区强制置底令牌 + 1
    })),
    递增重Roll计数: () => set((state) => ({
        可重Roll计数: state.可重Roll计数 + 1
    })),
    重置重Roll计数: () => set({ 可重Roll计数: 0 }),
    set右下角提示列表: (updater) => set((state) => ({
        右下角提示列表: typeof updater === 'function' ? (updater as (prev: 右下角提示结构[]) => 右下角提示结构[])(state.右下角提示列表) : updater
    })),
    set聊天区自动滚动抑制令牌: (updater) => set((state) => ({
        聊天区自动滚动抑制令牌: typeof updater === 'function' ? (updater as (prev: number) => number)(state.聊天区自动滚动抑制令牌) : updater
    })),
    set聊天区强制置底令牌: (updater) => set((state) => ({
        聊天区强制置底令牌: typeof updater === 'function' ? (updater as (prev: number) => number)(state.聊天区强制置底令牌) : updater
    })),
    set可重Roll计数: (updater) => set((state) => ({
        可重Roll计数: typeof updater === 'function' ? (updater as (prev: number) => number)(state.可重Roll计数) : updater
    })),
});

// ==================== Travel Slice (Zustand) ====================

interface TravelState {
    旅行事件列表: 旅行事件[];
}

interface TravelActions {
    设置旅行事件列表: (events: 旅行事件[]) => void;
    清空旅行事件列表: () => void;
}

interface TravelSlice extends TravelState, TravelActions {}

const createTravelSlice: ZustandSlice<TravelSlice> = (set) => ({
    旅行事件列表: [],
    设置旅行事件列表: (events) => set({ 旅行事件列表: events }),
    清空旅行事件列表: () => set({ 旅行事件列表: [] }),
});

// ==================== Device Slice (Zustand) ====================

interface DeviceSliceState {
    设备状态: DeviceState;
    设备刷新任务队列: 设备刷新任务[];
}

interface DeviceSliceActions {
    set设备状态: (updater: DeviceState | ((prev: DeviceState) => DeviceState)) => void;
    set设备刷新任务队列: (updater: 设备刷新任务[] | ((prev: 设备刷新任务[]) => 设备刷新任务[])) => void;
}

interface DeviceSlice extends DeviceSliceState, DeviceSliceActions {}

const 创建初始设备状态 = (): DeviceState => ({
    isOpen: false,
    activeApp: null,
    mode: 'normal' as const,
    messages: [],
    stats: {
        totalMessagesSent: 0,
        totalMessagesReceived: 0,
        lastUsedTimestamp: 0,
        activeContacts: [],
        missedNotifications: 0,
    },
    notifications: [],
});

const createDeviceSlice: ZustandSlice<DeviceSlice> = (set) => ({
    设备状态: 创建初始设备状态(),
    设备刷新任务队列: [],
    set设备状态: (updater) => set((state) => ({
        设备状态: typeof updater === 'function' ? (updater as (prev: DeviceState) => DeviceState)(state.设备状态) : updater
    })),
    set设备刷新任务队列: (updater) => set((state) => ({
        设备刷新任务队列: typeof updater === 'function' ? (updater as (prev: 设备刷新任务[]) => 设备刷新任务[])(state.设备刷新任务队列) : updater
    })),
});

// ==================== Image Slice (Zustand) ====================

interface ImageSliceState {
    NPC生图任务队列: NPC生图任务记录[];
    场景生图任务队列: 场景生图任务记录[];
}

interface ImageSliceActions {
    setNPC生图任务队列: (updater: NPC生图任务记录[] | ((prev: NPC生图任务记录[]) => NPC生图任务记录[])) => void;
    set场景生图任务队列: (updater: 场景生图任务记录[] | ((prev: 场景生图任务记录[]) => 场景生图任务记录[])) => void;
}

interface ImageSlice extends ImageSliceState, ImageSliceActions {}

const createImageSlice: ZustandSlice<ImageSlice> = (set) => ({
    NPC生图任务队列: [],
    场景生图任务队列: [],
    setNPC生图任务队列: (updater) => set((state) => ({
        NPC生图任务队列: typeof updater === 'function' ? (updater as (prev: NPC生图任务记录[]) => NPC生图任务记录[])(state.NPC生图任务队列) : updater
    })),
    set场景生图任务队列: (updater) => set((state) => ({
        场景生图任务队列: typeof updater === 'function' ? (updater as (prev: 场景生图任务记录[]) => 场景生图任务记录[])(state.场景生图任务队列) : updater
    })),
});

// ==================== Settings Slice (Zustand) ====================

interface SettingsSliceState {
    世界书列表: 世界书结构[];
    世界书预设组列表: 世界书预设组结构[];
    内置提示词列表: 内置提示词条目结构[];
}

interface SettingsSliceActions {
    set世界书列表: (updater: 世界书结构[] | ((prev: 世界书结构[]) => 世界书结构[])) => void;
    set世界书预设组列表: (updater: 世界书预设组结构[] | ((prev: 世界书预设组结构[]) => 世界书预设组结构[])) => void;
    set内置提示词列表: (updater: 内置提示词条目结构[] | ((prev: 内置提示词条目结构[]) => 内置提示词条目结构[])) => void;
}

interface SettingsSlice extends SettingsSliceState, SettingsSliceActions {}

const createSettingsSlice: ZustandSlice<SettingsSlice> = (set) => ({
    世界书列表: [],
    世界书预设组列表: [],
    内置提示词列表: [],
    set世界书列表: (updater) => set((state) => ({
        世界书列表: typeof updater === 'function' ? (updater as (prev: 世界书结构[]) => 世界书结构[])(state.世界书列表) : updater
    })),
    set世界书预设组列表: (updater) => set((state) => ({
        世界书预设组列表: typeof updater === 'function' ? (updater as (prev: 世界书预设组结构[]) => 世界书预设组结构[])(state.世界书预设组列表) : updater
    })),
    set内置提示词列表: (updater) => set((state) => ({
        内置提示词列表: typeof updater === 'function' ? (updater as (prev: 内置提示词条目结构[]) => 内置提示词条目结构[])(state.内置提示词列表) : updater
    })),
});

// ==================== World Slice (Zustand) ====================

interface WorldSliceState {
    世界演变更新中: boolean;
    世界演变状态文本: string;
    世界演变最近更新时间: string | null;
    世界演变最近摘要: string[];
    世界演变最近原始消息: string;
}

interface WorldSliceActions {
    set世界演变更新中: (updater: boolean | ((prev: boolean) => boolean)) => void;
    set世界演变状态文本: (updater: string | ((prev: string) => string)) => void;
    set世界演变最近更新时间: (updater: string | null | ((prev: string | null) => string | null)) => void;
    set世界演变最近摘要: (updater: string[] | ((prev: string[]) => string[])) => void;
    set世界演变最近原始消息: (updater: string | ((prev: string) => string)) => void;
}

interface WorldSlice extends WorldSliceState, WorldSliceActions {}

const createWorldSlice: ZustandSlice<WorldSlice> = (set) => ({
    世界演变更新中: false,
    世界演变状态文本: '世界演变待命',
    世界演变最近更新时间: null,
    世界演变最近摘要: [],
    世界演变最近原始消息: '',
    set世界演变更新中: (updater) => set((state) => ({
        世界演变更新中: typeof updater === 'function' ? (updater as (prev: boolean) => boolean)(state.世界演变更新中) : updater
    })),
    set世界演变状态文本: (updater) => set((state) => ({
        世界演变状态文本: typeof updater === 'function' ? (updater as (prev: string) => string)(state.世界演变状态文本) : updater
    })),
    set世界演变最近更新时间: (updater) => set((state) => ({
        世界演变最近更新时间: typeof updater === 'function' ? (updater as (prev: string | null) => string | null)(state.世界演变最近更新时间) : updater
    })),
    set世界演变最近摘要: (updater) => set((state) => ({
        世界演变最近摘要: typeof updater === 'function' ? (updater as (prev: string[]) => string[])(state.世界演变最近摘要) : updater
    })),
    set世界演变最近原始消息: (updater) => set((state) => ({
        世界演变最近原始消息: typeof updater === 'function' ? (updater as (prev: string) => string)(state.世界演变最近原始消息) : updater
    })),
});

// ==================== Memory Slice (Zustand) ====================

interface MemorySliceState {
    待处理记忆总结任务: 记忆压缩任务结构 | null;
    记忆总结阶段: 记忆总结阶段类型;
    记忆总结草稿: string;
    记忆总结错误: string;
    待处理NPC记忆总结队列: NPC记忆总结任务结构[];
    NPC记忆总结阶段: 记忆总结阶段类型;
    NPC记忆总结草稿: string;
    NPC记忆总结错误: string;
}

interface MemorySliceActions {
    set待处理记忆总结任务: (updater: 记忆压缩任务结构 | null | ((prev: 记忆压缩任务结构 | null) => 记忆压缩任务结构 | null)) => void;
    set记忆总结阶段: (updater: 记忆总结阶段类型 | ((prev: 记忆总结阶段类型) => 记忆总结阶段类型)) => void;
    set记忆总结草稿: (updater: string | ((prev: string) => string)) => void;
    set记忆总结错误: (updater: string | ((prev: string) => string)) => void;
    set待处理NPC记忆总结队列: (updater: NPC记忆总结任务结构[] | ((prev: NPC记忆总结任务结构[]) => NPC记忆总结任务结构[])) => void;
    setNPC记忆总结阶段: (updater: 记忆总结阶段类型 | ((prev: 记忆总结阶段类型) => 记忆总结阶段类型)) => void;
    setNPC记忆总结草稿: (updater: string | ((prev: string) => string)) => void;
    setNPC记忆总结错误: (updater: string | ((prev: string) => string)) => void;
}

interface MemorySlice extends MemorySliceState, MemorySliceActions {}

const createMemorySlice: ZustandSlice<MemorySlice> = (set) => ({
    待处理记忆总结任务: null,
    记忆总结阶段: 'idle',
    记忆总结草稿: '',
    记忆总结错误: '',
    待处理NPC记忆总结队列: [],
    NPC记忆总结阶段: 'idle',
    NPC记忆总结草稿: '',
    NPC记忆总结错误: '',
    set待处理记忆总结任务: (updater) => set((state) => ({
        待处理记忆总结任务: typeof updater === 'function' ? (updater as (prev: 记忆压缩任务结构 | null) => 记忆压缩任务结构 | null)(state.待处理记忆总结任务) : updater
    })),
    set记忆总结阶段: (updater) => set((state) => ({
        记忆总结阶段: typeof updater === 'function' ? (updater as (prev: 记忆总结阶段类型) => 记忆总结阶段类型)(state.记忆总结阶段) : updater
    })),
    set记忆总结草稿: (updater) => set((state) => ({
        记忆总结草稿: typeof updater === 'function' ? (updater as (prev: string) => string)(state.记忆总结草稿) : updater
    })),
    set记忆总结错误: (updater) => set((state) => ({
        记忆总结错误: typeof updater === 'function' ? (updater as (prev: string) => string)(state.记忆总结错误) : updater
    })),
    set待处理NPC记忆总结队列: (updater) => set((state) => ({
        待处理NPC记忆总结队列: typeof updater === 'function' ? (updater as (prev: NPC记忆总结任务结构[]) => NPC记忆总结任务结构[])(state.待处理NPC记忆总结队列) : updater
    })),
    setNPC记忆总结阶段: (updater) => set((state) => ({
        NPC记忆总结阶段: typeof updater === 'function' ? (updater as (prev: 记忆总结阶段类型) => 记忆总结阶段类型)(state.NPC记忆总结阶段) : updater
    })),
    setNPC记忆总结草稿: (updater) => set((state) => ({
        NPC记忆总结草稿: typeof updater === 'function' ? (updater as (prev: string) => string)(state.NPC记忆总结草稿) : updater
    })),
    setNPC记忆总结错误: (updater) => set((state) => ({
        NPC记忆总结错误: typeof updater === 'function' ? (updater as (prev: string) => string)(state.NPC记忆总结错误) : updater
    })),
});

// ==================== Variable Slice (Zustand) ====================

interface VariableSliceState {
    变量生成中: boolean;
    开局变量生成进度: 开局独立阶段进度 | null;
    开局世界演变进度: 开局独立阶段进度 | null;
    开局规划进度: 开局独立阶段进度 | null;
}

interface VariableSliceActions {
    set变量生成中: (updater: boolean | ((prev: boolean) => boolean)) => void;
    set开局变量生成进度: (updater: 开局独立阶段进度 | null | ((prev: 开局独立阶段进度 | null) => 开局独立阶段进度 | null)) => void;
    set开局世界演变进度: (updater: 开局独立阶段进度 | null | ((prev: 开局独立阶段进度 | null) => 开局独立阶段进度 | null)) => void;
    set开局规划进度: (updater: 开局独立阶段进度 | null | ((prev: 开局独立阶段进度 | null) => 开局独立阶段进度 | null)) => void;
}

interface VariableSlice extends VariableSliceState, VariableSliceActions {}

const createVariableSlice: ZustandSlice<VariableSlice> = (set) => ({
    变量生成中: false,
    开局变量生成进度: null,
    开局世界演变进度: null,
    开局规划进度: null,
    set变量生成中: (updater) => set((state) => ({
        变量生成中: typeof updater === 'function' ? (updater as (prev: boolean) => boolean)(state.变量生成中) : updater
    })),
    set开局变量生成进度: (updater) => set((state) => ({
        开局变量生成进度: typeof updater === 'function' ? (updater as (prev: 开局独立阶段进度 | null) => 开局独立阶段进度 | null)(state.开局变量生成进度) : updater
    })),
    set开局世界演变进度: (updater) => set((state) => ({
        开局世界演变进度: typeof updater === 'function' ? (updater as (prev: 开局独立阶段进度 | null) => 开局独立阶段进度 | null)(state.开局世界演变进度) : updater
    })),
    set开局规划进度: (updater) => set((state) => ({
        开局规划进度: typeof updater === 'function' ? (updater as (prev: 开局独立阶段进度 | null) => 开局独立阶段进度 | null)(state.开局规划进度) : updater
    })),
});

// ==================== Opening Slice (Zustand) ====================

interface OpeningSliceState {
    最近开局配置: 最近开局配置结构 | null;
}

interface OpeningSliceActions {
    set最近开局配置: (updater: 最近开局配置结构 | null | ((prev: 最近开局配置结构 | null) => 最近开局配置结构 | null)) => void;
}

interface OpeningSlice extends OpeningSliceState, OpeningSliceActions {}

const createOpeningSlice: ZustandSlice<OpeningSlice> = (set) => ({
    最近开局配置: null,
    set最近开局配置: (updater) => set((state) => ({
        最近开局配置: typeof updater === 'function' ? (updater as (prev: 最近开局配置结构 | null) => 最近开局配置结构 | null)(state.最近开局配置) : updater
    })),
});

// ==================== Scene Config Slice (Zustand) ====================

interface SceneConfigSliceState {
    场景图片档案: 场景图片档案;
    时代信息: 时代信息结构 | undefined;
}

interface SceneConfigSliceActions {
    set场景图片档案: (updater: 场景图片档案 | ((prev: 场景图片档案) => 场景图片档案)) => void;
    set时代信息: (updater: 时代信息结构 | undefined | ((prev: 时代信息结构 | undefined) => 时代信息结构 | undefined)) => void;
}

interface SceneConfigSlice extends SceneConfigSliceState, SceneConfigSliceActions {}

const createSceneConfigSlice: ZustandSlice<SceneConfigSlice> = (set) => ({
    场景图片档案: {},
    时代信息: undefined,
    set场景图片档案: (updater) => set((state) => ({
        场景图片档案: typeof updater === 'function' ? (updater as (prev: 场景图片档案) => 场景图片档案)(state.场景图片档案) : updater
    })),
    set时代信息: (updater) => set((state) => ({
        时代信息: typeof updater === 'function' ? (updater as (prev: 时代信息结构 | undefined) => 时代信息结构 | undefined)(state.时代信息) : updater
    })),
});

// ==================== Store ====================

interface GameStore extends UISlice, TravelSlice, DeviceSlice, ImageSlice, SettingsSlice, WorldSlice, MemorySlice, VariableSlice, OpeningSlice, SceneConfigSlice {}

export const useGameStore = create<GameStore>()((...a) => ({
    ...createUISlice(...a),
    ...createTravelSlice(...a),
    ...createDeviceSlice(...a),
    ...createImageSlice(...a),
    ...createSettingsSlice(...a),
    ...createWorldSlice(...a),
    ...createMemorySlice(...a),
    ...createVariableSlice(...a),
    ...createOpeningSlice(...a),
    ...createSceneConfigSlice(...a),
}));

// ==================== 兼容层 (供 useGame.ts 过渡期使用) ====================

export function useUIFromStore(): {
    state: UIState;
    actions: UIActions;
} {
    const store = useGameStore();
    return {
        state: {
            右下角提示列表: store.右下角提示列表,
            聊天区自动滚动抑制令牌: store.聊天区自动滚动抑制令牌,
            聊天区强制置底令牌: store.聊天区强制置底令牌,
            可重Roll计数: store.可重Roll计数,
        },
        actions: {
            推送右下角提示: store.推送右下角提示,
            关闭右下角提示: store.关闭右下角提示,
            抑制滚动: store.抑制滚动,
            强制置底: store.强制置底,
            递增重Roll计数: store.递增重Roll计数,
            重置重Roll计数: store.重置重Roll计数,
            set右下角提示列表: store.set右下角提示列表,
            set聊天区自动滚动抑制令牌: store.set聊天区自动滚动抑制令牌,
            set聊天区强制置底令牌: store.set聊天区强制置底令牌,
            set可重Roll计数: store.set可重Roll计数,
        },
    };
}

export function useTravelFromStore(): { state: TravelState; actions: TravelActions } {
    const store = useGameStore();
    return {
        state: { 旅行事件列表: store.旅行事件列表 },
        actions: {
            设置旅行事件列表: store.设置旅行事件列表,
            清空旅行事件列表: store.清空旅行事件列表,
        },
    };
}

export function useDeviceFromStore(): { state: DeviceSliceState; actions: DeviceSliceActions } {
    const store = useGameStore();
    return {
        state: {
            设备状态: store.设备状态,
            设备刷新任务队列: store.设备刷新任务队列,
        },
        actions: {
            set设备状态: store.set设备状态,
            set设备刷新任务队列: store.set设备刷新任务队列,
        },
    };
}

export function useImageFromStore(): { state: ImageSliceState; actions: ImageSliceActions } {
    const store = useGameStore();
    return {
        state: {
            NPC生图任务队列: store.NPC生图任务队列,
            场景生图任务队列: store.场景生图任务队列,
        },
        actions: {
            setNPC生图任务队列: store.setNPC生图任务队列,
            set场景生图任务队列: store.set场景生图任务队列,
        },
    };
}

export function useSettingsFromStore(): { state: SettingsSliceState; actions: SettingsSliceActions } {
    const store = useGameStore();
    return {
        state: {
            世界书列表: store.世界书列表,
            世界书预设组列表: store.世界书预设组列表,
            内置提示词列表: store.内置提示词列表,
        },
        actions: {
            set世界书列表: store.set世界书列表,
            set世界书预设组列表: store.set世界书预设组列表,
            set内置提示词列表: store.set内置提示词列表,
        },
    };
}

export function useWorldFromStore(): { state: WorldSliceState; actions: WorldSliceActions } {
    const store = useGameStore();
    return {
        state: {
            世界演变更新中: store.世界演变更新中,
            世界演变状态文本: store.世界演变状态文本,
            世界演变最近更新时间: store.世界演变最近更新时间,
            世界演变最近摘要: store.世界演变最近摘要,
            世界演变最近原始消息: store.世界演变最近原始消息,
        },
        actions: {
            set世界演变更新中: store.set世界演变更新中,
            set世界演变状态文本: store.set世界演变状态文本,
            set世界演变最近更新时间: store.set世界演变最近更新时间,
            set世界演变最近摘要: store.set世界演变最近摘要,
            set世界演变最近原始消息: store.set世界演变最近原始消息,
        },
    };
}

export function useMemoryFromStore(): { state: MemorySliceState; actions: MemorySliceActions } {
    const store = useGameStore();
    return {
        state: {
            待处理记忆总结任务: store.待处理记忆总结任务,
            记忆总结阶段: store.记忆总结阶段,
            记忆总结草稿: store.记忆总结草稿,
            记忆总结错误: store.记忆总结错误,
            待处理NPC记忆总结队列: store.待处理NPC记忆总结队列,
            NPC记忆总结阶段: store.NPC记忆总结阶段,
            NPC记忆总结草稿: store.NPC记忆总结草稿,
            NPC记忆总结错误: store.NPC记忆总结错误,
        },
        actions: {
            set待处理记忆总结任务: store.set待处理记忆总结任务,
            set记忆总结阶段: store.set记忆总结阶段,
            set记忆总结草稿: store.set记忆总结草稿,
            set记忆总结错误: store.set记忆总结错误,
            set待处理NPC记忆总结队列: store.set待处理NPC记忆总结队列,
            setNPC记忆总结阶段: store.setNPC记忆总结阶段,
            setNPC记忆总结草稿: store.setNPC记忆总结草稿,
            setNPC记忆总结错误: store.setNPC记忆总结错误,
        },
    };
}

export function useVariableFromStore(): { state: VariableSliceState; actions: VariableSliceActions } {
    const store = useGameStore();
    return {
        state: {
            变量生成中: store.变量生成中,
            开局变量生成进度: store.开局变量生成进度,
            开局世界演变进度: store.开局世界演变进度,
            开局规划进度: store.开局规划进度,
        },
        actions: {
            set变量生成中: store.set变量生成中,
            set开局变量生成进度: store.set开局变量生成进度,
            set开局世界演变进度: store.set开局世界演变进度,
            set开局规划进度: store.set开局规划进度,
        },
    };
}

export function useOpeningFromStore(): { state: OpeningSliceState; actions: OpeningSliceActions } {
    const store = useGameStore();
    return {
        state: {
            最近开局配置: store.最近开局配置,
        },
        actions: {
            set最近开局配置: store.set最近开局配置,
        },
    };
}

export function useSceneConfigFromStore(): { state: SceneConfigSliceState; actions: SceneConfigSliceActions } {
    const store = useGameStore();
    return {
        state: {
            场景图片档案: store.场景图片档案,
            时代信息: store.时代信息,
        },
        actions: {
            set场景图片档案: store.set场景图片档案,
            set时代信息: store.set时代信息,
        },
    };
}
