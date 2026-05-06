/**
 * GameStateContext.tsx
 * 
 * 上下文提供者，将 useGame 的状态拆分为多个独立的 Context：
 * - GameStateContext: 核心游戏状态（角色、环境、世界、战斗等）
 * - GameMetaContext: 元信息（loading、view、history等）
 * - GameConfigContext: 配置状态（apiConfig、visualConfig、gameConfig等）
 * - GameModalContext: UI 弹窗状态（showSettings、showInventory等）
 * 
 * 这样子组件可以只订阅需要的状态切片，减少不必要的重渲染。
 * 
 * @see docs/plans/2026-05-06_architecture-analysis.md#阶段一
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useGame } from '../hooks/useGame';
import type {
    角色数据结构,
    环境信息结构,
    世界数据结构,
    战斗状态结构,
    NPC结构,
    任务结构,
    约定结构,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    详细门派结构,
    记忆系统结构,
    聊天记录结构,
    接口设置结构,
    视觉设置结构,
    游戏设置结构,
    记忆配置结构,
    提示词结构,
    图片管理设置结构,
    时代信息结构,
    节日结构,
    OpeningConfig,
    ThemePreset
} from '../types';
import type { DeviceState, MobileApp } from '../hooks/useGame/mobileDeviceWorkflow';
import type { 校园系统数据 } from '../models/campusPhone';
import type { 校规条目, 校规影响日志, 催眠记录, 催眠App等级 } from '../types';

// ============================================================================
// 类型定义
// ============================================================================

/** 核心游戏状态 */
export interface GameState {
    角色: 角色数据结构;
    环境: 环境信息结构;
    世界: 世界数据结构;
    战斗: 战斗状态结构;
    社交: NPC结构[];
    玩家门派: 详细门派结构;
    任务列表: 任务结构[];
    约定列表: 约定结构[];
    剧情: 剧情系统结构;
    剧情规划: 剧情规划结构;
    女主剧情规划: 女主剧情规划结构 | undefined;
    同人剧情规划: 同人剧情规划结构 | undefined;
    同人女主剧情规划: 同人女主剧情规划结构 | undefined;
    开局配置: OpeningConfig | undefined;
    游戏初始时间: string;
    记忆系统: 记忆系统结构;
    世界事件: string[];
}

/** 游戏元信息 */
export interface GameMeta {
    view: 'home' | 'game' | 'new_game';
    hasSave: boolean;
    loading: boolean;
    历史记录: 聊天记录结构[];
    prompts: 提示词结构[];
    promptsReady: boolean;
    festivals: 节日结构[];
    currentTheme: ThemePreset;
    currentEra: string;
    时代信息: 时代信息结构 | undefined;
}

/** 配置状态 */
export interface GameConfig {
    apiConfig: 接口设置结构;
    visualConfig: 视觉设置结构;
    imageManagerConfig: 图片管理设置结构;
    gameConfig: 游戏设置结构;
    memoryConfig: 记忆配置结构;
}

/** UI 弹窗/面板状态 */
export interface GameModal {
    showSettings: boolean;
    showInventory: boolean;
    showEquipment: boolean;
    showBattle: boolean;
    showSocial: boolean;
    showTeam: boolean;
    showKungfu: boolean;
    showWorld: boolean;
    showMap: boolean;
    showSect: boolean;
    showTask: boolean;
    showAgreement: boolean;
    showStory: boolean;
    showHeroinePlan: boolean;
    showMemory: boolean;
    showSaveLoad: { show: boolean; mode: 'save' | 'load' };
    activeTab: 'api' | 'image_generation' | 'integrated_models' | 'independent_api_gpt' | 'novel_decomposition' | 'novel_decomposition_runtime' | 'prompt' | 'storage' | 'theme' | 'visual' | 'world' | 'game' | 'reality' | 'tavern_preset' | 'memory' | 'history' | 'context' | 'music' | 'npc_management' | 'variable_manager';
    currentTheme: ThemePreset;
    currentEra: string;
}

/** 设备状态 */
export interface GameDevice {
    设备状态: DeviceState;
    设备打开: () => void;
    设备关闭: () => void;
    设备打开应用: (app: MobileApp) => void;
    设备返回主页: () => void;
}

/** 校园系统状态 */
export interface GameCampusSystems {
    校规系统: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] };
    催眠系统: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number };
    校园系统: 校园系统数据;
}

// ============================================================================
// Context 创建
// ============================================================================

/** 核心游戏状态 Context */
const GameStateContext = createContext<GameState | null>(null);

/** 游戏元信息 Context */
const GameMetaContext = createContext<GameMeta | null>(null);

/** 配置状态 Context */
const GameConfigContext = createContext<GameConfig | null>(null);

/** UI 弹窗状态 Context */
const GameModalContext = createContext<GameModal | null>(null);

/** 设备状态 Context */
const GameDeviceContext = createContext<GameDevice | null>(null);

/** 校园系统状态 Context */
const GameCampusSystemsContext = createContext<GameCampusSystems | null>(null);

// ============================================================================
// Provider 组件
// ============================================================================

/**
 * GameStateProvider
 * 
 * 提供核心游戏状态（角色、环境、世界、战斗等）
 */
export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state } = useGame();
    
    const value = useMemo<GameState>(() => ({
        角色: state.角色,
        环境: state.环境,
        世界: state.世界,
        战斗: state.战斗,
        社交: state.社交,
        玩家门派: state.玩家门派,
        任务列表: state.任务列表,
        约定列表: state.约定列表,
        剧情: state.剧情,
        剧情规划: state.剧情规划,
        女主剧情规划: state.女主剧情规划,
        同人剧情规划: state.同人剧情规划,
        同人女主剧情规划: state.同人女主剧情规划,
        开局配置: state.开局配置,
        游戏初始时间: state.游戏初始时间,
        记忆系统: state.记忆系统,
        世界事件: state.worldEvents,
    }), [
        state.角色, state.环境, state.世界, state.战斗, state.社交,
        state.玩家门派, state.任务列表, state.约定列表, state.剧情,
        state.剧情规划, state.女主剧情规划, state.同人剧情规划,
        state.同人女主剧情规划, state.开局配置, state.游戏初始时间,
        state.记忆系统, state.worldEvents
    ]);
    
    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
};

/**
 * GameMetaProvider
 * 
 * 提供游戏元信息（view、loading、history等）
 */
export const GameMetaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { meta } = useGame();
    
    const value = useMemo<GameMeta>(() => ({
        view: meta.view,
        hasSave: meta.hasSave,
        loading: meta.loading,
        历史记录: meta.历史记录,
        prompts: meta.prompts,
        promptsReady: meta.promptsReady,
        festivals: meta.festivals,
        currentTheme: meta.currentTheme,
        currentEra: meta.currentEra,
        时代信息: meta.时代信息,
    }), [
        meta.view, meta.hasSave, meta.loading, meta.历史记录,
        meta.prompts, meta.promptsReady, meta.festivals,
        meta.currentTheme, meta.currentEra, meta.时代信息
    ]);
    
    return (
        <GameMetaContext.Provider value={value}>
            {children}
        </GameMetaContext.Provider>
    );
};

/**
 * GameConfigProvider
 * 
 * 提供配置状态（apiConfig、visualConfig、gameConfig等）
 */
export const GameConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state } = useGame();
    
    const value = useMemo<GameConfig>(() => ({
        apiConfig: state.apiConfig,
        visualConfig: state.visualConfig,
        imageManagerConfig: state.imageManagerConfig,
        gameConfig: state.gameConfig,
        memoryConfig: state.memoryConfig,
    }), [
        state.apiConfig, state.visualConfig, state.imageManagerConfig,
        state.gameConfig, state.memoryConfig
    ]);
    
    return (
        <GameConfigContext.Provider value={value}>
            {children}
        </GameConfigContext.Provider>
    );
};

/**
 * GameModalProvider
 * 
 * 提供 UI 弹窗/面板状态
 */
export const GameModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state } = useGame();
    
    const value = useMemo<GameModal>(() => ({
        showSettings: state.showSettings,
        showInventory: state.showInventory,
        showEquipment: state.showEquipment,
        showBattle: state.showBattle,
        showSocial: state.showSocial,
        showTeam: state.showTeam,
        showKungfu: state.showKungfu,
        showWorld: state.showWorld,
        showMap: state.showMap,
        showSect: state.showSect,
        showTask: state.showTask,
        showAgreement: state.showAgreement,
        showStory: state.showStory,
        showHeroinePlan: state.showHeroinePlan,
        showMemory: state.showMemory,
        showSaveLoad: state.showSaveLoad,
        activeTab: state.activeTab,
        currentTheme: state.currentTheme,
        currentEra: state.currentEra,
    }), [
        state.showSettings, state.showInventory, state.showEquipment,
        state.showBattle, state.showSocial, state.showTeam, state.showKungfu,
        state.showWorld, state.showMap, state.showSect, state.showTask,
        state.showAgreement, state.showStory, state.showHeroinePlan,
        state.showMemory, state.showSaveLoad, state.activeTab,
        state.currentTheme, state.currentEra
    ]);
    
    return (
        <GameModalContext.Provider value={value}>
            {children}
        </GameModalContext.Provider>
    );
};

/**
 * GameDeviceProvider
 * 
 * 提供移动设备状态
 */
export const GameDeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state } = useGame();
    
    const value = useMemo<GameDevice>(() => ({
        设备状态: state.设备状态,
        设备打开: state.设备打开,
        设备关闭: state.设备关闭,
        设备打开应用: state.设备打开应用,
        设备返回主页: state.设备返回主页,
    }), [
        state.设备状态, state.设备打开, state.设备关闭,
        state.设备打开应用, state.设备返回主页
    ]);
    
    return (
        <GameDeviceContext.Provider value={value}>
            {children}
        </GameDeviceContext.Provider>
    );
};

/**
 * GameCampusSystemsProvider
 * 
 * 提供校园系统状态
 */
export const GameCampusSystemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state } = useGame();
    
    const value = useMemo<GameCampusSystems>(() => ({
        校规系统: state.校规系统,
        催眠系统: state.催眠系统,
        校园系统: state.校园系统,
    }), [
        state.校规系统, state.催眠系统, state.校园系统
    ]);
    
    return (
        <GameCampusSystemsContext.Provider value={value}>
            {children}
        </GameCampusSystemsContext.Provider>
    );
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * useGameStateContext
 * 获取核心游戏状态
 */
export function useGameStateContext(): GameState {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameStateContext must be used within GameStateProvider');
    }
    return context;
}

/**
 * useGameMetaContext
 * 获取游戏元信息
 */
export function useGameMetaContext(): GameMeta {
    const context = useContext(GameMetaContext);
    if (!context) {
        throw new Error('useGameMetaContext must be used within GameMetaProvider');
    }
    return context;
}

/**
 * useGameConfigContext
 * 获取配置状态
 */
export function useGameConfigContext(): GameConfig {
    const context = useContext(GameConfigContext);
    if (!context) {
        throw new Error('useGameConfigContext must be used within GameConfigProvider');
    }
    return context;
}

/**
 * useGameModalContext
 * 获取 UI 弹窗状态
 */
export function useGameModalContext(): GameModal {
    const context = useContext(GameModalContext);
    if (!context) {
        throw new Error('useGameModalContext must be used within GameModalProvider');
    }
    return context;
}

/**
 * useGameDeviceContext
 * 获取设备状态
 */
export function useGameDeviceContext(): GameDevice {
    const context = useContext(GameDeviceContext);
    if (!context) {
        throw new Error('useGameDeviceContext must be used within GameDeviceProvider');
    }
    return context;
}

/**
 * useGameCampusSystemsContext
 * 获取校园系统状态
 */
export function useGameCampusSystemsContext(): GameCampusSystems {
    const context = useContext(GameCampusSystemsContext);
    if (!context) {
        throw new Error('useGameCampusSystemsContext must be used within GameCampusSystemsProvider');
    }
    return context;
}
