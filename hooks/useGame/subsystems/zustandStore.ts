// hooks/useGame/subsystems/zustandStore.ts
// Zustand 主 store — 渐进式迁移入口
// 当前: 将已验证的 slice 纳入 Zustand，其余仍用 hook-based
// 未来: 逐步将 useGame.ts 中所有 useState 迁移到此 store

import { create } from 'zustand';
import type { 右下角提示结构 } from '../ui/notificationSystem';
import type { 旅行事件 } from '../travel/travelWorkflow';
import type { DeviceState } from '../../../models/mobileDevice';
import type { AppInstallState } from '../../../models/installedApps';
import { createInitialInstallState, installApp, uninstallApp, updateBadge, recordAppOpened } from '../../../models/installedApps';
import type { 设备刷新任务 } from '../device/deviceRefreshMonitor';
import type { NPC生图任务记录, 场景生图任务记录, 世界书结构, 世界书预设组结构, 内置提示词条目结构, 场景图片档案, 时代信息结构 } from '../../../types';
import type { 记忆压缩任务结构 } from '../memory/memoryUtils';
import type { NPC记忆总结任务结构, 记忆总结阶段类型 } from '../memory/memorySummaryHandlers';
import type { WorldGenConfig } from '../../../models/system';
import type { 角色数据结构 } from '../../../models/character';
import type { OpeningConfig } from '../../../models/system';
import type { 桌游类型 } from '../../../models/boardGameNSFW/core';
import type { EngineType, PauseReason, ActionLogEntry, ScheduledEvent } from '../engine/types';
import type { GalgameState } from '../../../models/avg/galgame';
import type { BattleLogEntry, BattleOutcome } from '../engine/rpgBattleEngine';
import type { BattlePhase } from '../rpg/battle/battleStateMachine';

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
    设备已安装App: AppInstallState;
}

interface DeviceSliceActions {
    set设备状态: (updater: DeviceState | ((prev: DeviceState) => DeviceState)) => void;
    set设备刷新任务队列: (updater: 设备刷新任务[] | ((prev: 设备刷新任务[]) => 设备刷新任务[])) => void;
    set设备已安装App: (updater: AppInstallState | ((prev: AppInstallState) => AppInstallState)) => void;
    安装App: (appId: string) => void;
    卸载App: (appId: string) => void;
    更新App角标: (appId: string, count: number) => void;
    记录App打开: (appId: string) => void;
    初始化App安装: (backgroundName?: string) => void;
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

const createDeviceSlice: ZustandSlice<DeviceSlice> = (set, _get) => ({
    设备状态: 创建初始设备状态(),
    设备刷新任务队列: [],
    设备已安装App: { installedApps: [] },
    set设备状态: (updater) => set((state) => ({
        设备状态: typeof updater === 'function' ? (updater as (prev: DeviceState) => DeviceState)(state.设备状态) : updater
    })),
    set设备刷新任务队列: (updater) => set((state) => ({
        设备刷新任务队列: typeof updater === 'function' ? (updater as (prev: 设备刷新任务[]) => 设备刷新任务[])(state.设备刷新任务队列) : updater
    })),
    set设备已安装App: (updater) => set((state) => ({
        设备已安装App: typeof updater === 'function' ? (updater as (prev: AppInstallState) => AppInstallState)(state.设备已安装App) : updater
    })),
    安装App: (appId) => set((state) => ({
        设备已安装App: installApp(state.设备已安装App, appId)
    })),
    卸载App: (appId) => set((state) => ({
        设备已安装App: uninstallApp(state.设备已安装App, appId)
    })),
    更新App角标: (appId, count) => set((state) => ({
        设备已安装App: updateBadge(state.设备已安装App, appId, count)
    })),
    记录App打开: (appId) => set((state) => ({
        设备已安装App: recordAppOpened(state.设备已安装App, appId)
    })),
    初始化App安装: (backgroundName) => set(() => ({
        设备已安装App: createInitialInstallState(backgroundName)
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

// ==================== BoardGame Slice (Zustand) ====================

export interface BoardGamePlayerAction {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface BoardGamePendingEvent {
  id: string;
  type: '轮流' | '随机' | '阵营';
  description: string;
  choices: BoardGameEventChoice[];
  timeout?: number;
}

export interface BoardGameEventChoice {
  id: string;
  label: string;
  risk: 'low' | 'medium' | 'high';
  consequence: string;
}

export interface BoardGameSettlementResult {
  success: boolean;
  tensionDelta: number;
  nsfwTriggered: boolean;
  keyStep: boolean;
  narrativeConstraint: string;
  nextState: Record<string, unknown>;
}

interface BoardGameSliceState {
  showBoardGameDashboard: boolean;
  showBoardGameModal: boolean;
  activeBoardGameTab: 'dashboard' | 'history' | 'preferences';
  selectedGameType: 桌游类型 | null;
  // SLG 新增
  boardGamePaused: boolean;
  pauseReason: 'chat-sent' | 'key-step' | 'player-pause' | null;
  pendingEvents: BoardGamePendingEvent[];
  actionHistory: BoardGamePlayerAction[];
  narrativeConstraints: string | null;
  lastSettlement: BoardGameSettlementResult | null;
}

interface BoardGameSliceActions {
  setShowBoardGameDashboard: (updater: boolean | ((prev: boolean) => boolean)) => void;
  setShowBoardGameModal: (updater: boolean | ((prev: boolean) => boolean)) => void;
  setActiveBoardGameTab: (updater: BoardGameSliceState['activeBoardGameTab'] | ((prev: BoardGameSliceState['activeBoardGameTab']) => BoardGameSliceState['activeBoardGameTab'])) => void;
  setSelectedGameType: (updater: 桌游类型 | null | ((prev: 桌游类型 | null) => 桌游类型 | null)) => void;
  // SLG 新增
  setBoardGamePaused: (updater: boolean | ((prev: boolean) => boolean)) => void;
  setPauseReason: (updater: BoardGameSliceState['pauseReason'] | ((prev: BoardGameSliceState['pauseReason']) => BoardGameSliceState['pauseReason'])) => void;
  setPendingEvents: (updater: BoardGamePendingEvent[] | ((prev: BoardGamePendingEvent[]) => BoardGamePendingEvent[])) => void;
  addActionToHistory: (action: BoardGamePlayerAction) => void;
  setNarrativeConstraints: (updater: string | null | ((prev: string | null) => string | null)) => void;
  setLastSettlement: (updater: BoardGameSettlementResult | null | ((prev: BoardGameSettlementResult | null) => BoardGameSettlementResult | null)) => void;
  clearActionHistory: () => void;
  clearPendingEvents: () => void;
}

interface BoardGameSlice extends BoardGameSliceState, BoardGameSliceActions {}

const createBoardGameSlice: ZustandSlice<BoardGameSlice> = (set) => ({
  showBoardGameDashboard: false,
  showBoardGameModal: false,
  activeBoardGameTab: 'dashboard',
  selectedGameType: null,
  // SLG 新增
  boardGamePaused: false,
  pauseReason: null,
  pendingEvents: [],
  actionHistory: [],
  narrativeConstraints: null,
  lastSettlement: null,
  setShowBoardGameDashboard: (updater) => set((state) => ({
    showBoardGameDashboard: typeof updater === 'function' ? (updater as (prev: boolean) => boolean)(state.showBoardGameDashboard) : updater,
  })),
  setShowBoardGameModal: (updater) => set((state) => ({
    showBoardGameModal: typeof updater === 'function' ? (updater as (prev: boolean) => boolean)(state.showBoardGameModal) : updater,
  })),
  setActiveBoardGameTab: (updater) => set((state) => ({
    activeBoardGameTab: typeof updater === 'function' ? (updater as (prev: BoardGameSliceState['activeBoardGameTab']) => BoardGameSliceState['activeBoardGameTab'])(state.activeBoardGameTab) : updater,
  })),
  setSelectedGameType: (updater) => set((state) => ({
    selectedGameType: typeof updater === 'function' ? (updater as (prev: 桌游类型 | null) => 桌游类型 | null)(state.selectedGameType) : updater,
  })),
  // SLG 新增
  setBoardGamePaused: (updater) => set((state) => ({
    boardGamePaused: typeof updater === 'function' ? (updater as (prev: boolean) => boolean)(state.boardGamePaused) : updater,
  })),
  setPauseReason: (updater) => set((state) => ({
    pauseReason: typeof updater === 'function' ? (updater as (prev: BoardGameSliceState['pauseReason']) => BoardGameSliceState['pauseReason'])(state.pauseReason) : updater,
  })),
  setPendingEvents: (updater) => set((state) => ({
    pendingEvents: typeof updater === 'function' ? (updater as (prev: BoardGamePendingEvent[]) => BoardGamePendingEvent[])(state.pendingEvents) : updater,
  })),
  addActionToHistory: (action) => set((state) => ({
    actionHistory: [...state.actionHistory, action].slice(-50),
  })),
  setNarrativeConstraints: (updater) => set((state) => ({
    narrativeConstraints: typeof updater === 'function' ? (updater as (prev: string | null) => string | null)(state.narrativeConstraints) : updater,
  })),
  setLastSettlement: (updater) => set((state) => ({
    lastSettlement: typeof updater === 'function' ? (updater as (prev: BoardGameSettlementResult | null) => BoardGameSettlementResult | null)(state.lastSettlement) : updater,
  })),
  clearActionHistory: () => set({ actionHistory: [] }),
  clearPendingEvents: () => set({ pendingEvents: [] }),
});

// ==================== Exploration Slice (Zustand) ====================

import type { MapNode as EngineMapNode, MapPath as EngineMapPath } from '../../../models/exploration/mapNode';

interface ExplorationSliceState {
  showMapExplorer: boolean;
  explorationPaused: boolean;
  explorationPauseReason: string | null;
  explorationNodes: EngineMapNode[];
  explorationPaths: EngineMapPath[];
  explorationCurrentAp: number;
  explorationMaxAp: number;
  explorationCurrentNodeId: string | null;
  explorationTimeOfDay: string;
  explorationPendingEvents: Array<{ type: string; payload: Record<string, unknown> }>;
}

interface ExplorationSliceActions {
  setShowMapExplorer: (updater: boolean | ((prev: boolean) => boolean)) => void;
  setExplorationPaused: (updater: boolean | ((prev: boolean) => boolean)) => void;
  setExplorationPauseReason: (updater: string | null | ((prev: string | null) => string | null)) => void;
  setExplorationNodes: (updater: EngineMapNode[] | ((prev: EngineMapNode[]) => EngineMapNode[])) => void;
  setExplorationPaths: (updater: EngineMapPath[] | ((prev: EngineMapPath[]) => EngineMapPath[])) => void;
  setExplorationCurrentAp: (updater: number | ((prev: number) => number)) => void;
  setExplorationMaxAp: (updater: number | ((prev: number) => number)) => void;
  setExplorationCurrentNodeId: (updater: string | null | ((prev: string | null) => string | null)) => void;
  setExplorationTimeOfDay: (updater: string | ((prev: string) => string)) => void;
  setExplorationPendingEvents: (updater: ExplorationSliceState['explorationPendingEvents'] | ((prev: ExplorationSliceState['explorationPendingEvents']) => ExplorationSliceState['explorationPendingEvents'])) => void;
  syncExplorationState: (state: Partial<ExplorationSliceState>) => void;
}

interface ExplorationSlice extends ExplorationSliceState, ExplorationSliceActions {}

const createExplorationSlice: ZustandSlice<ExplorationSlice> = (set) => ({
  showMapExplorer: false,
  explorationPaused: false,
  explorationPauseReason: null,
  explorationNodes: [],
  explorationPaths: [],
  explorationCurrentAp: 10,
  explorationMaxAp: 10,
  explorationCurrentNodeId: null,
  explorationTimeOfDay: '未知',
  explorationPendingEvents: [],
  setShowMapExplorer: (updater) => set((state) => ({
    showMapExplorer: typeof updater === 'function' ? (updater as (prev: boolean) => boolean)(state.showMapExplorer) : updater,
  })),
  setExplorationPaused: (updater) => set((state) => ({
    explorationPaused: typeof updater === 'function' ? (updater as (prev: boolean) => boolean)(state.explorationPaused) : updater,
  })),
  setExplorationPauseReason: (updater) => set((state) => ({
    explorationPauseReason: typeof updater === 'function' ? (updater as (prev: string | null) => string | null)(state.explorationPauseReason) : updater,
  })),
  setExplorationNodes: (updater) => set((state) => ({
    explorationNodes: typeof updater === 'function' ? (updater as (prev: EngineMapNode[]) => EngineMapNode[])(state.explorationNodes) : updater,
  })),
  setExplorationPaths: (updater) => set((state) => ({
    explorationPaths: typeof updater === 'function' ? (updater as (prev: EngineMapPath[]) => EngineMapPath[])(state.explorationPaths) : updater,
  })),
  setExplorationCurrentAp: (updater) => set((state) => ({
    explorationCurrentAp: typeof updater === 'function' ? (updater as (prev: number) => number)(state.explorationCurrentAp) : updater,
  })),
  setExplorationMaxAp: (updater) => set((state) => ({
    explorationMaxAp: typeof updater === 'function' ? (updater as (prev: number) => number)(state.explorationMaxAp) : updater,
  })),
  setExplorationCurrentNodeId: (updater) => set((state) => ({
    explorationCurrentNodeId: typeof updater === 'function' ? (updater as (prev: string | null) => string | null)(state.explorationCurrentNodeId) : updater,
  })),
  setExplorationTimeOfDay: (updater) => set((state) => ({
    explorationTimeOfDay: typeof updater === 'function' ? (updater as (prev: string) => string)(state.explorationTimeOfDay) : updater,
  })),
  setExplorationPendingEvents: (updater) => set((state) => ({
    explorationPendingEvents: typeof updater === 'function' ? (updater as (prev: ExplorationSliceState['explorationPendingEvents']) => ExplorationSliceState['explorationPendingEvents'])(state.explorationPendingEvents) : updater,
  })),
  syncExplorationState: (partial) => set((state) => ({
    ...state,
    ...partial,
  })),
});

// ==================== Engine Slice (Zustand) ====================

interface EngineSliceState {
  engineStatus: Record<EngineType, 'idle' | 'running' | 'paused' | 'error'>;
  enginePausedReason: Record<EngineType, PauseReason | null>;
  engineActiveFlags: Record<EngineType, boolean>;
}

interface EngineSliceActions {
  setEngineStatus: (type: EngineType, status: EngineSliceState['engineStatus'][EngineType]) => void;
  setEnginePausedReason: (type: EngineType, reason: PauseReason | null) => void;
  setEngineActive: (type: EngineType, active: boolean) => void;
  pauseEngine: (type: EngineType, reason: PauseReason) => void;
  resumeEngine: (type: EngineType) => void;
}

interface EngineSlice extends EngineSliceState, EngineSliceActions {}

// 辅助函数：为所有 EngineType 生成默认值
function allEngines<T>(fallback: T): Record<EngineType, T> {
  return {
    boardGame: fallback,
    urbanDriver: fallback,
    phoneSim: fallback,
    campusNSFW: fallback,
    bdsm: fallback,
    global: fallback,
    rpgBattle: fallback,
    rpgEquip: fallback,
    rpgItem: fallback,
    rpgKungfu: fallback,
    rpgTask: fallback,
    rpgSect: fallback,
    avgDialogue: fallback,
    avgRelation: fallback,
    avgBranch: fallback,
    exploration: fallback,
    dailyTown: fallback,
    notification: fallback,
  };
}

const DEFAULT_ENGINE_STATUS: Record<EngineType, 'idle' | 'running' | 'paused' | 'error'> = {
  ...allEngines('idle' as const),
};

const createEngineSlice: ZustandSlice<EngineSlice> = (set) => ({
  engineStatus: { ...DEFAULT_ENGINE_STATUS },
  enginePausedReason: allEngines(null),
  engineActiveFlags: allEngines(false),
  setEngineStatus: (type, status) => set((state) => ({
    engineStatus: { ...state.engineStatus, [type]: status },
  })),
  setEnginePausedReason: (type, reason) => set((state) => ({
    enginePausedReason: { ...state.enginePausedReason, [type]: reason },
  })),
  setEngineActive: (type, active) => set((state) => ({
    engineActiveFlags: { ...state.engineActiveFlags, [type]: active },
  })),
  pauseEngine: (type, reason) => set((state) => ({
    engineStatus: { ...state.engineStatus, [type]: 'paused' },
    enginePausedReason: { ...state.enginePausedReason, [type]: reason },
  })),
  resumeEngine: (type) => set((state) => ({
    engineStatus: { ...state.engineStatus, [type]: 'running' },
    enginePausedReason: { ...state.enginePausedReason, [type]: null },
  })),
});

// ==================== Turn Slice (Zustand) ====================

interface TurnSliceState {
  globalTurn: number;
  currentPhase: 'idle' | 'player-action' | 'resolution' | 'narrative' | 'transition';
  activeEngines: EngineType[];
  lastTurnTimestamp: number | null;
}

interface TurnSliceActions {
  advanceTurn: () => void;
  setTurnPhase: (phase: TurnSliceState['currentPhase']) => void;
  setActiveEngines: (engines: EngineType[]) => void;
  toggleEngineActive: (type: EngineType, active: boolean) => void;
  resetTurn: () => void;
}

interface TurnSlice extends TurnSliceState, TurnSliceActions {}

const createTurnSlice: ZustandSlice<TurnSlice> = (set, get) => ({
  globalTurn: 0,
  currentPhase: 'idle',
  activeEngines: [],
  lastTurnTimestamp: null,
  advanceTurn: () => set((state) => ({
    globalTurn: state.globalTurn + 1,
    lastTurnTimestamp: Date.now(),
  })),
  setTurnPhase: (phase) => set({ currentPhase: phase }),
  setActiveEngines: (engines) => set({ activeEngines: engines }),
  toggleEngineActive: (type, active) => set((state) => ({
    activeEngines: active
      ? [...new Set([...state.activeEngines, type])]
      : state.activeEngines.filter((e) => e !== type),
  })),
  resetTurn: () => set({ globalTurn: 0, currentPhase: 'idle', activeEngines: [], lastTurnTimestamp: null }),
});

// ==================== ActionLog Slice (Zustand) ====================

interface ActionLogSliceState {
  logs: ActionLogEntry[];
  logTurn: number;
}

interface ActionLogSliceActions {
  addLog: (entry: ActionLogEntry) => void;
  clearLogs: () => void;
  incrementLogTurn: () => void;
}

interface ActionLogSlice extends ActionLogSliceState, ActionLogSliceActions {}

const createActionLogSlice: ZustandSlice<ActionLogSlice> = (set) => ({
  logs: [],
  logTurn: 0,
  addLog: (entry) => set((state) => ({
    logs: [...state.logs, entry].slice(-500),
    logTurn: state.logTurn + 1,
  })),
  clearLogs: () => set({ logs: [], logTurn: 0 }),
  incrementLogTurn: () => set((state) => ({ logTurn: state.logTurn + 1 })),
});

// ==================== RPG Slice (Zustand) ====================

interface RpgSliceState {
  rpgBattleActive: boolean;
  rpgBattlePhase: BattlePhase | null;
  rpgBattleRound: number;
  rpgBattleCurrentActor: string | null;
  rpgBattleLog: BattleLogEntry[];
  rpgBattlePlayerHP: { current: number; max: number } | null;
  rpgBattleOutcome: BattleOutcome['winner'] | null;
  // Equip
  rpgEquipWeapon: string | null;
  rpgEquipArmor: string | null;
  rpgEquipAccessory: string | null;
  // Kungfu
  rpgActiveKungfuIds: string[];
  // Task
  rpgActiveTaskIds: string[];
  // Sect
  rpgSectId: string | null;
  rpgSectContribution: number;
}

interface RpgSliceActions {
  setRpgState: (partial: Partial<RpgSliceState>) => void;
  resetRpgState: () => void;
  setRpgEquipSlot: (slot: 'weapon' | 'armor' | 'accessory', item: { ID: string } | null) => void;
  toggleKungfu: (kungfuId: string) => void;
  toggleTask: (taskId: string) => void;
  setRpgSect: (sectId: string | null) => void;
  setRpgSectContribution: (amount: number) => void;
}

interface RpgSlice extends RpgSliceState, RpgSliceActions {}

const createRpgSlice: ZustandSlice<RpgSlice> = (set) => ({
  rpgBattleActive: false,
  rpgBattlePhase: null,
  rpgBattleRound: 0,
  rpgBattleCurrentActor: null,
  rpgBattleLog: [],
  rpgBattlePlayerHP: null,
  rpgBattleOutcome: null,
  rpgEquipWeapon: null,
  rpgEquipArmor: null,
  rpgEquipAccessory: null,
  rpgActiveKungfuIds: [],
  rpgActiveTaskIds: [],
  rpgSectId: null,
  rpgSectContribution: 0,
  setRpgState: (partial) => set((state) => ({ ...state, ...partial })),
  resetRpgState: () => set({
    rpgBattleActive: false,
    rpgBattlePhase: null,
    rpgBattleRound: 0,
    rpgBattleCurrentActor: null,
    rpgBattleLog: [],
    rpgBattlePlayerHP: null,
    rpgBattleOutcome: null,
    rpgEquipWeapon: null,
    rpgEquipArmor: null,
    rpgEquipAccessory: null,
    rpgActiveKungfuIds: [],
    rpgActiveTaskIds: [],
    rpgSectId: null,
    rpgSectContribution: 0,
  }),
  setRpgEquipSlot: (slot, item) => {
    const key = slot === 'weapon' ? 'rpgEquipWeapon' : slot === 'armor' ? 'rpgEquipArmor' : 'rpgEquipAccessory';
    set({ [key]: item?.ID ?? null });
  },
  toggleKungfu: (kungfuId) => set((state) => ({
    rpgActiveKungfuIds: state.rpgActiveKungfuIds.includes(kungfuId)
      ? state.rpgActiveKungfuIds.filter((id) => id !== kungfuId)
      : [...state.rpgActiveKungfuIds, kungfuId],
  })),
  toggleTask: (taskId) => set((state) => ({
    rpgActiveTaskIds: state.rpgActiveTaskIds.includes(taskId)
      ? state.rpgActiveTaskIds.filter((id) => id !== taskId)
      : [...state.rpgActiveTaskIds, taskId],
  })),
  setRpgSect: (sectId) => set({ rpgSectId: sectId }),
  setRpgSectContribution: (amount) => set({ rpgSectContribution: amount }),
});

// ==================== AVG / Galgame Slice (Zustand) ====================

interface AvgSliceState {
  avgGalgameState: GalgameState | null;
  avgActiveRouteId: string | null;
  avgActiveRouteName: string | null;
  avgUnlockedRouteIds: string[];
  avgLockedRouteIds: string[];
  avgCompletedEndingIds: string[];
  avgUnlockedCGIds: string[];
  avgTriggeredEventIds: string[];
  avgIntimacyLevel: string | null;
  avgAvailableCGs: number;
  avgUnlockedCGs: number;
}

interface AvgSliceActions {
  setAvgState: (partial: Partial<AvgSliceState>) => void;
  resetAvgState: () => void;
}

interface AvgSlice extends AvgSliceState, AvgSliceActions {}

const createAvgSlice: ZustandSlice<AvgSlice> = (set) => ({
  avgGalgameState: null,
  avgActiveRouteId: null,
  avgActiveRouteName: null,
  avgUnlockedRouteIds: [],
  avgLockedRouteIds: [],
  avgCompletedEndingIds: [],
  avgUnlockedCGIds: [],
  avgTriggeredEventIds: [],
  avgIntimacyLevel: null,
  avgAvailableCGs: 0,
  avgUnlockedCGs: 0,
  setAvgState: (partial) => set((state) => ({ ...state, ...partial })),
  resetAvgState: () => set({
    avgGalgameState: null,
    avgActiveRouteId: null,
    avgActiveRouteName: null,
    avgUnlockedRouteIds: [],
    avgLockedRouteIds: [],
    avgCompletedEndingIds: [],
    avgUnlockedCGIds: [],
    avgTriggeredEventIds: [],
    avgIntimacyLevel: null,
    avgAvailableCGs: 0,
    avgUnlockedCGs: 0,
  }),
});

// ==================== Store ====================

export interface GameStore extends UISlice, TravelSlice, DeviceSlice, ImageSlice, SettingsSlice, WorldSlice, MemorySlice, VariableSlice, OpeningSlice, SceneConfigSlice, BoardGameSlice, ExplorationSlice, EngineSlice, TurnSlice, ActionLogSlice, RpgSlice, AvgSlice {}

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
    ...createBoardGameSlice(...a),
    ...createExplorationSlice(...a),
    ...createEngineSlice(...a),
    ...createTurnSlice(...a),
    ...createActionLogSlice(...a),
    ...createRpgSlice(...a),
    ...createAvgSlice(...a),
}));

