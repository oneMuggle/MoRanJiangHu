/**
 * useGameSelectors.ts
 * 
 * 细粒度状态选择器 Hooks，允许组件只订阅需要的状态片段。
 * 
 * 使用方式：
 * ```tsx
 * // 在组件中直接使用
 * const 角色 = useCharacter();
 * const 世界 = useWorld();
 * const 正在战斗 = useBattle(s => s.是否战斗中);
 * ```
 * 
 * @see docs/plans/2026-05-06_architecture-analysis.md#阶段一
 */

import { useContext } from 'react';
import {
    GameStateContext,
    GameMetaContext,
    GameConfigContext,
    GameModalContext,
    GameDeviceContext,
    GameCampusSystemsContext,
    type GameState,
    type GameMeta,
    type GameConfig,
    type GameModal,
    type GameDevice,
    type GameCampusSystems
} from '../contexts/GameStateContext';

// ============================================================================
// 游戏状态选择器
// ============================================================================

/**
 * useCharacter - 获取角色数据
 */
export const useCharacter = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useCharacter must be used within GameStateProvider');
    return state.角色;
};

/**
 * useEnvironment - 获取环境信息
 */
export const useEnvironment = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useEnvironment must be used within GameStateProvider');
    return state.环境;
};

/**
 * useWorld - 获取世界数据
 */
export const useWorld = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useWorld must be used within GameStateProvider');
    return state.世界;
};

/**
 * useBattle - 获取战斗状态
 */
export const useBattle = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useBattle must be used within GameStateProvider');
    return state.战斗;
};

/**
 * useSocial - 获取社交列表（NPC）
 */
export const useSocial = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useSocial must be used within GameStateProvider');
    return state.社交;
};

/**
 * usePlayerSect - 获取玩家门派
 */
export const usePlayerSect = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('usePlayerSect must be used within GameStateProvider');
    return state.玩家门派;
};

/**
 * useTaskList - 获取任务列表
 */
export const useTaskList = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useTaskList must be used within GameStateProvider');
    return state.任务列表;
};

/**
 * useAgreementList - 获取约定列表
 */
export const useAgreementList = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useAgreementList must be used within GameStateProvider');
    return state.约定列表;
};

/**
 * useStory - 获取剧情状态
 */
export const useStory = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useStory must be used within GameStateProvider');
    return state.剧情;
};

/**
 * useStoryPlanning - 获取剧情规划
 */
export const useStoryPlanning = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useStoryPlanning must be used within GameStateProvider');
    return state.剧情规划;
};

/**
 * useHeroinePlanning - 获取女主剧情规划
 */
export const useHeroinePlanning = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useHeroinePlanning must be used within GameStateProvider');
    return state.女主剧情规划;
};

/**
 * useFanFictionPlanning - 获取同人剧情规划
 */
export const useFanFictionPlanning = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useFanFictionPlanning must be used within GameStateProvider');
    return state.同人剧情规划;
};

/**
 * useFanFictionHeroinePlanning - 获取同人女主剧情规划
 */
export const useFanFictionHeroinePlanning = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useFanFictionHeroinePlanning must be used within GameStateProvider');
    return state.同人女主剧情规划;
};

/**
 * useOpeningConfig - 获取开局配置
 */
export const useOpeningConfig = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useOpeningConfig must be used within GameStateProvider');
    return state.开局配置;
};

/**
 * useGameInitialTime - 获取游戏初始时间
 */
export const useGameInitialTime = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useGameInitialTime must be used within GameStateProvider');
    return state.游戏初始时间;
};

/**
 * useMemorySystem - 获取记忆系统
 */
export const useMemorySystem = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useMemorySystem must be used within GameStateProvider');
    return state.记忆系统;
};

/**
 * useWorldEvents - 获取世界事件列表
 */
export const useWorldEvents = () => {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useWorldEvents must be used within GameStateProvider');
    return state.世界事件;
};

/**
 * useGameState - 通用游戏状态选择器（支持自定义选择函数）
 */
export function useGameState<T>(selector: (state: GameState) => T): T {
    const state = useContext(GameStateContext);
    if (!state) throw new Error('useGameState must be used within GameStateProvider');
    return selector(state);
}

// ============================================================================
// 游戏元信息选择器
// ============================================================================

/**
 * useView - 获取当前视图（home/game/new_game）
 */
export const useView = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useView must be used within GameMetaProvider');
    return meta.view;
};

/**
 * useHasSave - 检查是否有存档
 */
export const useHasSave = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useHasSave must be used within GameMetaProvider');
    return meta.hasSave;
};

/**
 * useLoading - 获取加载状态
 */
export const useLoading = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useLoading must be used within GameMetaProvider');
    return meta.loading;
};

/**
 * useChatHistory - 获取聊天历史记录
 */
export const useChatHistory = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useChatHistory must be used within GameMetaProvider');
    return meta.历史记录;
};

/**
 * usePrompts - 获取提示词列表
 */
export const usePrompts = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('usePrompts must be used within GameMetaProvider');
    return meta.prompts;
};

/**
 * usePromptsReady - 检查提示词是否已加载
 */
export const usePromptsReady = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('usePromptsReady must be used within GameMetaProvider');
    return meta.promptsReady;
};

/**
 * useFestivals - 获取节日列表
 */
export const useFestivals = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useFestivals must be used within GameMetaProvider');
    return meta.festivals;
};

/**
 * useCurrentTheme - 获取当前主题
 */
export const useCurrentTheme = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useCurrentTheme must be used within GameMetaProvider');
    return meta.currentTheme;
};

/**
 * useCurrentEra - 获取当前时代
 */
export const useCurrentEra = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useCurrentEra must be used within GameMetaProvider');
    return meta.currentEra;
};

/**
 * useEraInfo - 获取时代信息
 */
export const useEraInfo = () => {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useEraInfo must be used within GameMetaProvider');
    return meta.时代信息;
};

/**
 * useGameMeta - 通用游戏元信息选择器
 */
export function useGameMeta<T>(selector: (meta: GameMeta) => T): T {
    const meta = useContext(GameMetaContext);
    if (!meta) throw new Error('useGameMeta must be used within GameMetaProvider');
    return selector(meta);
}

// ============================================================================
// 配置选择器
// ============================================================================

/**
 * useApiConfig - 获取 API 配置
 */
export const useApiConfig = () => {
    const config = useContext(GameConfigContext);
    if (!config) throw new Error('useApiConfig must be used within GameConfigProvider');
    return config.apiConfig;
};

/**
 * useVisualConfig - 获取视觉配置
 */
export const useVisualConfig = () => {
    const config = useContext(GameConfigContext);
    if (!config) throw new Error('useVisualConfig must be used within GameConfigProvider');
    return config.visualConfig;
};

/**
 * useImageManagerConfig - 获取图片管理配置
 */
export const useImageManagerConfig = () => {
    const config = useContext(GameConfigContext);
    if (!config) throw new Error('useImageManagerConfig must be used within GameConfigProvider');
    return config.imageManagerConfig;
};

/**
 * useGameConfig - 获取游戏配置
 */
export const useGameConfig = () => {
    const config = useContext(GameConfigContext);
    if (!config) throw new Error('useGameConfig must be used within GameConfigProvider');
    return config.gameConfig;
};

/**
 * useMemoryConfig - 获取记忆配置
 */
export const useMemoryConfig = () => {
    const config = useContext(GameConfigContext);
    if (!config) throw new Error('useMemoryConfig must be used within GameConfigProvider');
    return config.memoryConfig;
};

/**
 * useGameConfig - 通用配置选择器
 */
export function useGameConfigSelector<T>(selector: (config: GameConfig) => T): T {
    const config = useContext(GameConfigContext);
    if (!config) throw new Error('useGameConfig must be used within GameConfigProvider');
    return selector(config);
}

// ============================================================================
// UI 状态选择器
// ============================================================================

/**
 * useShowSettings - 检查设置面板是否显示
 */
export const useShowSettings = () => {
    const modal = useContext(GameModalContext);
    if (!modal) throw new Error('useShowSettings must be used within GameModalProvider');
    return modal.showSettings;
};

/**
 * useShowInventory - 检查背包面板是否显示
 */
export const useShowInventory = () => {
    const modal = useContext(GameModalContext);
    if (!modal) throw new Error('useShowInventory must be used within GameModalProvider');
    return modal.showInventory;
};

/**
 * useShowEquipment - 检查装备面板是否显示
 */
export const useShowEquipment = () => {
    const modal = useContext(GameModalContext);
    if (!modal) throw new Error('useShowEquipment must be used within GameModalProvider');
    return modal.showEquipment;
};

/**
 * useShowBattle - 检查战斗面板是否显示
 */
export const useShowBattle = () => {
    const modal = useContext(GameModalContext);
    if (!modal) throw new Error('useShowBattle must be used within GameModalProvider');
    return modal.showBattle;
};

/**
 * useShowSocial - 检查社交面板是否显示
 */
export const useShowSocial = () => {
    const modal = useContext(GameModalContext);
    if (!modal) throw new Error('useShowSocial must be used within GameModalProvider');
    return modal.showSocial;
};

/**
 * useActiveTab - 获取当前设置标签页
 */
export const useActiveTab = () => {
    const modal = useContext(GameModalContext);
    if (!modal) throw new Error('useActiveTab must be used within GameModalProvider');
    return modal.activeTab;
};

/**
 * useGameModal - 通用 UI 状态选择器
 */
export function useGameModal<T>(selector: (modal: GameModal) => T): T {
    const modal = useContext(GameModalContext);
    if (!modal) throw new Error('useGameModal must be used within GameModalProvider');
    return selector(modal);
}

// ============================================================================
// 设备状态选择器
// ============================================================================

/**
 * useDeviceState - 获取设备状态
 */
export const useDeviceState = () => {
    const device = useContext(GameDeviceContext);
    if (!device) throw new Error('useDeviceState must be used within GameDeviceProvider');
    return device.设备状态;
};

/**
 * useGameDevice - 通用设备状态选择器
 */
export function useGameDevice<T>(selector: (device: GameDevice) => T): T {
    const device = useContext(GameDeviceContext);
    if (!device) throw new Error('useGameDevice must be used within GameDeviceProvider');
    return selector(device);
}

// ============================================================================
// 校园系统选择器
// ============================================================================

/**
 * useCampusSystems - 获取校园系统数据
 */
export const useCampusSystems = () => {
    const campus = useContext(GameCampusSystemsContext);
    if (!campus) throw new Error('useCampusSystems must be used within GameCampusSystemsProvider');
    return campus.校园系统;
};

/**
 * useSchoolRules - 获取校规系统
 */
export const useSchoolRules = () => {
    const campus = useContext(GameCampusSystemsContext);
    if (!campus) throw new Error('useSchoolRules must be used within GameCampusSystemsProvider');
    return campus.校规系统;
};

/**
 * useHypnosisSystem - 获取催眠系统
 */
export const useHypnosisSystem = () => {
    const campus = useContext(GameCampusSystemsContext);
    if (!campus) throw new Error('useHypnosisSystem must be used within GameCampusSystemsProvider');
    return campus.催眠系统;
};

/**
 * useGameCampusSystems - 通用校园系统选择器
 */
export function useGameCampusSystems<T>(selector: (campus: GameCampusSystems) => T): T {
    const campus = useContext(GameCampusSystemsContext);
    if (!campus) throw new Error('useGameCampusSystems must be used within GameCampusSystemsProvider');
    return selector(campus);
}

// ============================================================================
// 便捷组合选择器
// ============================================================================

/**
 * useIsInBattle - 检查是否在战斗中
 */
export const useIsInBattle = () => useBattle().是否战斗中;

/**
 * useCurrentLocation - 获取当前位置描述
 */
export const useCurrentLocation = () => {
    const env = useEnvironment();
    const world = useWorld();
    const 大地点 = env.大地点 || world.当前地点?.名称 || '';
    const 中地点 = env.中地点 || '';
    const 小地点 = env.小地点 || '';
    return [大地点, 中地点, 小地点].filter(Boolean).join(' - ') || '未知地点';
};

/**
 * useGameTime - 获取游戏时间
 */
export const useGameTime = () => useEnvironment().时间;

/**
 * useMainNpcs - 获取主要 NPC 列表
 */
export const useMainNpcs = () => useSocial().filter(npc => npc.是否主要角色);

/**
 * useRecentChatHistory - 获取最近 N 条聊天记录
 */
export const useRecentChatHistory = (count: number = 20) => {
    const history = useChatHistory();
    return history.slice(-count);
};
