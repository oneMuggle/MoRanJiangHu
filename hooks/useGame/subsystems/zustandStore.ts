// hooks/useGame/subsystems/zustandStore.ts
// Zustand 主 store — 渐进式迁移入口
// 当前: 将已验证的 slice 纳入 Zustand，其余仍用 hook-based
// 未来: 逐步将 useGame.ts 中所有 useState 迁移到此 store

import { create } from 'zustand';
import type { 右下角提示结构 } from '../ui/notificationSystem';
import type { 旅行事件 } from '../travel/travelWorkflow';

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

// ==================== Store ====================

interface GameStore extends UISlice, TravelSlice {}

export const useGameStore = create<GameStore>()((...a) => ({
    ...createUISlice(...a),
    ...createTravelSlice(...a),
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
