// hooks/useGame/subsystems/zustandStore.ts
// Zustand 主 store — 渐进式迁移入口
// 当前: 将已验证的 slice 纳入 Zustand，其余仍用 hook-based
// 未来: 逐步将 useGame.ts 中所有 useState 迁移到此 store

import { create } from 'zustand';
import type { 右下角提示结构 } from '../ui/notificationSystem';
import type { 回合快照结构 } from '../ui/rollbackSnapshot';

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
}

interface UISlice extends UIState, UIActions {}

type ZustandSlice<T> = (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T,
    store: any
) => T;

const createUISlice: ZustandSlice<UISlice> = (set) => ({
    右下角提示列表: [],
    聊天区自动滚动抑制令牌: 0,
    聊天区强制置底令牌: 0,
    可重Roll计数: 0,
    推送右下角提示: (toast) => set((state) => ({
        右下角提示列表: [...state.右下角提示列表, { ...toast, id: `toast-${Date.now()}-${Math.random()}` }]
    })),
    关闭右下角提示: (toastId) => set((state) => ({
        右下角提示列表: state.右下角提示列表.filter(t => t.id !== toastId)
    })),
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
});

// ==================== Travel Slice (Zustand) ====================

interface TravelState {
    旅行事件列表: any[];
}

interface TravelActions {
    设置旅行事件列表: (events: any[]) => void;
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
    state: UIState & { 回合快照栈Ref: React.MutableRefObject<回合快照结构[]> | null };
    actions: UIActions;
} {
    const store = useGameStore();
    return {
        state: {
            右下角提示列表: store.右下角提示列表,
            聊天区自动滚动抑制令牌: store.聊天区自动滚动抑制令牌,
            聊天区强制置底令牌: store.聊天区强制置底令牌,
            可重Roll计数: store.可重Roll计数,
            回合快照栈Ref: null,
        },
        actions: {
            推送右下角提示: store.推送右下角提示,
            关闭右下角提示: store.关闭右下角提示,
            抑制滚动: store.抑制滚动,
            强制置底: store.强制置底,
            递增重Roll计数: store.递增重Roll计数,
            重置重Roll计数: store.重置重Roll计数,
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
