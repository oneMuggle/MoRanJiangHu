/**
 * 统一状态访问层
 *
 * 将 useGame 中所有从 useGameState() 和 useGameStore() 解构的状态
 * 整合到单一接口，减少主文件的 ~85 个解构变量。
 */

import type { useGameState } from '../../useGameState';
import type { GameStore, BoardGamePlayerAction, BoardGamePendingEvent, BoardGameSettlementResult } from '../subsystems/zustandStore';

// ============================================================
// 类型定义
// ============================================================

/** 从 useGameState 解构的状态集合 */
export type GameStateSlice = ReturnType<typeof useGameState>;

/** 从 useGameStore 解构的状态集合 — 直接使用 GameStore 接口 */
export type GameStoreSlice = GameStore;

/** 世界演变时间戳管理 */
export interface 世界演变时间管理器 {
    游戏内时间: string | null;
    现实时间戳: number;
    set游戏内时间: (value: string | null) => void;
}

/** 统一状态访问接口 */
export interface GameStateAccess {
    // --- 基础游戏状态 (useGameState) ---
    view: GameStateSlice['view'];
    setView: GameStateSlice['setView'];
    setHasSave: GameStateSlice['setHasSave'];

    角色: GameStateSlice['角色'];
    设置角色: GameStateSlice['设置角色'];
    环境: GameStateSlice['环境'];
    设置环境: GameStateSlice['设置环境'];
    社交: GameStateSlice['社交'];
    设置社交: GameStateSlice['设置社交'];
    世界: GameStateSlice['世界'];
    设置世界: GameStateSlice['设置世界'];
    战斗: GameStateSlice['战斗'];
    设置战斗: GameStateSlice['设置战斗'];
    玩家门派: GameStateSlice['玩家门派'];
    设置玩家门派: GameStateSlice['设置玩家门派'];
    任务列表: GameStateSlice['任务列表'];
    设置任务列表: GameStateSlice['设置任务列表'];
    约定列表: GameStateSlice['约定列表'];
    设置约定列表: GameStateSlice['设置约定列表'];
    剧情: GameStateSlice['剧情'];
    设置剧情: GameStateSlice['设置剧情'];
    剧情规划: GameStateSlice['剧情规划'];
    设置剧情规划: GameStateSlice['设置剧情规划'];
    女主剧情规划: GameStateSlice['女主剧情规划'];
    设置女主剧情规划: GameStateSlice['设置女主剧情规划'];
    同人剧情规划: GameStateSlice['同人剧情规划'];
    设置同人剧情规划: GameStateSlice['设置同人剧情规划'];
    同人女主剧情规划: GameStateSlice['同人女主剧情规划'];
    设置同人女主剧情规划: GameStateSlice['设置同人女主剧情规划'];
    开局配置: GameStateSlice['开局配置'];
    设置开局配置: GameStateSlice['设置开局配置'];
    游戏初始时间: GameStateSlice['游戏初始时间'];
    设置游戏初始时间: GameStateSlice['设置游戏初始时间'];
    历史记录: GameStateSlice['历史记录'];
    设置历史记录: GameStateSlice['设置历史记录'];
    记忆系统: GameStateSlice['记忆系统'];
    设置记忆系统: GameStateSlice['设置记忆系统'];
    loading: GameStateSlice['loading'];
    setLoading: GameStateSlice['setLoading'];
    setWorldEvents: GameStateSlice['setWorldEvents'];

    // 模态显示控制
    setShowSettings: GameStateSlice['setShowSettings'];
    setShowInventory: GameStateSlice['setShowInventory'];
    setShowEquipment: GameStateSlice['setShowEquipment'];
    setShowBattle: GameStateSlice['setShowBattle'];
    setShowSocial: GameStateSlice['setShowSocial'];
    setShowTeam: GameStateSlice['setShowTeam'];
    setShowKungfu: GameStateSlice['setShowKungfu'];
    setShowWorld: GameStateSlice['setShowWorld'];
    setShowMap: GameStateSlice['setShowMap'];
    setShowSect: GameStateSlice['setShowSect'];
    setShowTask: GameStateSlice['setShowTask'];
    setShowAgreement: GameStateSlice['setShowAgreement'];
    setShowStory: GameStateSlice['setShowStory'];
    setShowHeroinePlan: GameStateSlice['setShowHeroinePlan'];
    setShowMemory: GameStateSlice['setShowMemory'];
    setShowSaveLoad: GameStateSlice['setShowSaveLoad'];
    setShowRelationship: GameStateSlice['setShowRelationship'];

    // 关系谱
    关系谱: GameStateSlice['关系谱'];
    设置关系谱: GameStateSlice['设置关系谱'];

    setActiveTab: GameStateSlice['setActiveTab'];
    setCurrentTheme: GameStateSlice['setCurrentTheme'];

    // 配置
    apiConfig: GameStateSlice['apiConfig'];
    setApiConfig: GameStateSlice['setApiConfig'];
    visualConfig: GameStateSlice['visualConfig'];
    setVisualConfig: GameStateSlice['setVisualConfig'];
    imageManagerConfig: GameStateSlice['imageManagerConfig'];
    setImageManagerConfig: GameStateSlice['setImageManagerConfig'];
    gameConfig: GameStateSlice['gameConfig'];
    setGameConfig: GameStateSlice['setGameConfig'];
    memoryConfig: GameStateSlice['memoryConfig'];
    setMemoryConfig: GameStateSlice['setMemoryConfig'];
    performanceConfig: GameStateSlice['performanceConfig'];
    prompts: GameStateSlice['prompts'];
    setPrompts: GameStateSlice['setPrompts'];
    ensurePromptsLoaded: GameStateSlice['ensurePromptsLoaded'];
    festivals: GameStateSlice['festivals'];
    setFestivals: GameStateSlice['setFestivals'];
    currentEra: GameStateSlice['currentEra'];
    setCurrentEra: GameStateSlice['setCurrentEra'];

    // Refs
    scrollRef: GameStateSlice['scrollRef'];
    abortControllerRef: GameStateSlice['abortControllerRef'];
    variableGenerationAbortControllerRef: GameStateSlice['variableGenerationAbortControllerRef'];

    // Campus Systems
    校规系统: GameStateSlice['校规系统'];
    设置校规系统: GameStateSlice['设置校规系统'];
    催眠系统: GameStateSlice['催眠系统'];
    设置催眠系统: GameStateSlice['设置催眠系统'];
    校园系统: GameStateSlice['校园系统'];
    设置校园系统: GameStateSlice['设置校园系统'];

    // NSFW Systems
    写真系统: GameStateSlice['写真系统'];
    设置写真系统: GameStateSlice['设置写真系统'];
    都市网约车系统: GameStateSlice['都市网约车系统'];
    设置都市网约车系统: GameStateSlice['设置都市网约车系统'];

    // --- Zustand Store 状态 ---

    // UI Slice
    可重Roll计数: GameStoreSlice['可重Roll计数'];
    set可重Roll计数: GameStoreSlice['set可重Roll计数'];
    聊天区自动滚动抑制令牌: GameStoreSlice['聊天区自动滚动抑制令牌'];
    set聊天区自动滚动抑制令牌: GameStoreSlice['set聊天区自动滚动抑制令牌'];
    聊天区强制置底令牌: GameStoreSlice['聊天区强制置底令牌'];
    set聊天区强制置底令牌: GameStoreSlice['set聊天区强制置底令牌'];
    右下角提示列表: GameStoreSlice['右下角提示列表'];
    set右下角提示列表: GameStoreSlice['set右下角提示列表'];

    // Image Slice
    NPC生图任务队列: GameStoreSlice['NPC生图任务队列'];
    setNPC生图任务队列: GameStoreSlice['setNPC生图任务队列'];
    场景生图任务队列: GameStoreSlice['场景生图任务队列'];
    set场景生图任务队列: GameStoreSlice['set场景生图任务队列'];

    // Settings Slice
    内置提示词列表: GameStoreSlice['内置提示词列表'];
    set内置提示词列表: GameStoreSlice['set内置提示词列表'];
    世界书列表: GameStoreSlice['世界书列表'];
    set世界书列表: GameStoreSlice['set世界书列表'];
    世界书预设组列表: GameStoreSlice['世界书预设组列表'];
    set世界书预设组列表: GameStoreSlice['set世界书预设组列表'];

    // Device Slice
    设备状态: GameStateSlice['设备状态'];
    设置设备状态: GameStateSlice['设置设备状态'];
    设备刷新任务队列: GameStoreSlice['设备刷新任务队列'];
    set设备刷新任务队列: GameStoreSlice['set设备刷新任务队列'];

    // World Slice
    世界演变更新中: GameStoreSlice['世界演变更新中'];
    set世界演变更新中: GameStoreSlice['set世界演变更新中'];
    世界演变状态文本: GameStoreSlice['世界演变状态文本'];
    set世界演变状态文本: GameStoreSlice['set世界演变状态文本'];
    世界演变最近更新时间: GameStoreSlice['世界演变最近更新时间'];
    set世界演变最近更新时间State: GameStoreSlice['set世界演变最近更新时间'];
    世界演变最近摘要: GameStoreSlice['世界演变最近摘要'];
    set世界演变最近摘要: GameStoreSlice['set世界演变最近摘要'];
    世界演变最近原始消息: GameStoreSlice['世界演变最近原始消息'];
    set世界演变最近原始消息: GameStoreSlice['set世界演变最近原始消息'];

    // Memory Slice
    待处理记忆总结任务: GameStoreSlice['待处理记忆总结任务'];
    set待处理记忆总结任务: GameStoreSlice['set待处理记忆总结任务'];
    记忆总结阶段: GameStoreSlice['记忆总结阶段'];
    set记忆总结阶段: GameStoreSlice['set记忆总结阶段'];
    记忆总结草稿: GameStoreSlice['记忆总结草稿'];
    set记忆总结草稿: GameStoreSlice['set记忆总结草稿'];
    记忆总结错误: GameStoreSlice['记忆总结错误'];
    set记忆总结错误: GameStoreSlice['set记忆总结错误'];
    待处理NPC记忆总结队列: GameStoreSlice['待处理NPC记忆总结队列'];
    set待处理NPC记忆总结队列: GameStoreSlice['set待处理NPC记忆总结队列'];
    NPC记忆总结阶段: GameStoreSlice['NPC记忆总结阶段'];
    setNPC记忆总结阶段: GameStoreSlice['setNPC记忆总结阶段'];
    NPC记忆总结草稿: GameStoreSlice['NPC记忆总结草稿'];
    setNPC记忆总结草稿: GameStoreSlice['setNPC记忆总结草稿'];
    NPC记忆总结错误: GameStoreSlice['NPC记忆总结错误'];
    setNPC记忆总结错误: GameStoreSlice['setNPC记忆总结错误'];

    // Variable Slice
    变量生成中: GameStoreSlice['变量生成中'];
    set变量生成中: GameStoreSlice['set变量生成中'];
    开局变量生成进度: GameStoreSlice['开局变量生成进度'];
    set开局变量生成进度: GameStoreSlice['set开局变量生成进度'];
    开局世界演变进度: GameStoreSlice['开局世界演变进度'];
    set开局世界演变进度: GameStoreSlice['set开局世界演变进度'];
    开局规划进度: GameStoreSlice['开局规划进度'];
    set开局规划进度: GameStoreSlice['set开局规划进度'];

    // Opening Slice
    最近开局配置: GameStoreSlice['最近开局配置'];
    设置最近开局配置: GameStateSlice['设置开局配置'];

    // Scene Config Slice
    场景图片档案: GameStoreSlice['场景图片档案'];
    set场景图片档案: GameStoreSlice['set场景图片档案'];
    set时代信息: GameStoreSlice['set时代信息'];

    // Travel Slice
    旅行事件列表: GameStoreSlice['旅行事件列表'];

    // BoardGame Slice
    showBoardGameDashboard: GameStoreSlice['showBoardGameDashboard'];
    setShowBoardGameDashboard: GameStoreSlice['setShowBoardGameDashboard'];
    showBoardGameModal: GameStoreSlice['showBoardGameModal'];
    setShowBoardGameModal: GameStoreSlice['setShowBoardGameModal'];
    activeBoardGameTab: GameStoreSlice['activeBoardGameTab'];
    setActiveBoardGameTab: GameStoreSlice['setActiveBoardGameTab'];
    selectedGameType: GameStoreSlice['selectedGameType'];
    setSelectedGameType: GameStoreSlice['setSelectedGameType'];
    // SLG 新增
    boardGamePaused: GameStoreSlice['boardGamePaused'];
    setBoardGamePaused: GameStoreSlice['setBoardGamePaused'];
    pauseReason: GameStoreSlice['pauseReason'];
    setPauseReason: GameStoreSlice['setPauseReason'];
    pendingEvents: GameStoreSlice['pendingEvents'];
    setPendingEvents: GameStoreSlice['setPendingEvents'];
    actionHistory: GameStoreSlice['actionHistory'];
    addActionToHistory: GameStoreSlice['addActionToHistory'];
    narrativeConstraints: GameStoreSlice['narrativeConstraints'];
    setNarrativeConstraints: GameStoreSlice['setNarrativeConstraints'];
    lastSettlement: GameStoreSlice['lastSettlement'];
    setLastSettlement: GameStoreSlice['setLastSettlement'];
    clearActionHistory: GameStoreSlice['clearActionHistory'];
    clearPendingEvents: GameStoreSlice['clearPendingEvents'];

    // --- 派生状态 ---
    /** 世界演变时间管理（游戏内时间 + 现实时间戳） */
    世界演变时间管理: 世界演变时间管理器;
}

/**
 * 创建统一状态访问层
 *
 * 将 useGameState 和 useGameStore 的所有解构状态整合到单一对象。
 */
export function createGameStateAccess(
    gameState: GameStateSlice,
    store: GameStoreSlice
): GameStateAccess {
    // 世界演变时间管理的封装（替代原 useGame.ts 中的内联逻辑）
    const 世界演变现实时间Ref = { current: 0 };
    const 世界演变时间管理: 世界演变时间管理器 = {
        get 游戏内时间() {
            return store.世界演变最近更新时间;
        },
        get 现实时间戳() {
            return 世界演变现实时间Ref.current;
        },
        set游戏内时间(value: string | null) {
            store.set世界演变最近更新时间(value);
            世界演变现实时间Ref.current = Date.now();
        }
    };

    return {
        // --- 基础游戏状态 ---
        view: gameState.view,
        setView: gameState.setView,
        setHasSave: gameState.setHasSave,

        角色: gameState.角色,
        设置角色: gameState.设置角色,
        环境: gameState.环境,
        设置环境: gameState.设置环境,
        社交: gameState.社交,
        设置社交: gameState.设置社交,
        世界: gameState.世界,
        设置世界: gameState.设置世界,
        战斗: gameState.战斗,
        设置战斗: gameState.设置战斗,
        玩家门派: gameState.玩家门派,
        设置玩家门派: gameState.设置玩家门派,
        任务列表: gameState.任务列表,
        设置任务列表: gameState.设置任务列表,
        约定列表: gameState.约定列表,
        设置约定列表: gameState.设置约定列表,
        剧情: gameState.剧情,
        设置剧情: gameState.设置剧情,
        剧情规划: gameState.剧情规划,
        设置剧情规划: gameState.设置剧情规划,
        女主剧情规划: gameState.女主剧情规划,
        设置女主剧情规划: gameState.设置女主剧情规划,
        同人剧情规划: gameState.同人剧情规划,
        设置同人剧情规划: gameState.设置同人剧情规划,
        同人女主剧情规划: gameState.同人女主剧情规划,
        设置同人女主剧情规划: gameState.设置同人女主剧情规划,
        开局配置: gameState.开局配置,
        设置开局配置: gameState.设置开局配置,
        游戏初始时间: gameState.游戏初始时间,
        设置游戏初始时间: gameState.设置游戏初始时间,
        历史记录: gameState.历史记录,
        设置历史记录: gameState.设置历史记录,
        记忆系统: gameState.记忆系统,
        设置记忆系统: gameState.设置记忆系统,
        loading: gameState.loading,
        setLoading: gameState.setLoading,
        setWorldEvents: gameState.setWorldEvents,

        // 模态显示控制
        setShowSettings: gameState.setShowSettings,
        setShowInventory: gameState.setShowInventory,
        setShowEquipment: gameState.setShowEquipment,
        setShowBattle: gameState.setShowBattle,
        setShowSocial: gameState.setShowSocial,
        setShowTeam: gameState.setShowTeam,
        setShowKungfu: gameState.setShowKungfu,
        setShowWorld: gameState.setShowWorld,
        setShowMap: gameState.setShowMap,
        setShowSect: gameState.setShowSect,
        setShowTask: gameState.setShowTask,
        setShowAgreement: gameState.setShowAgreement,
        setShowStory: gameState.setShowStory,
        setShowHeroinePlan: gameState.setShowHeroinePlan,
        setShowMemory: gameState.setShowMemory,
        setShowSaveLoad: gameState.setShowSaveLoad,
        setShowRelationship: gameState.setShowRelationship,

        // 关系谱
        关系谱: gameState.关系谱,
        设置关系谱: gameState.设置关系谱,

        setActiveTab: gameState.setActiveTab,
        setCurrentTheme: gameState.setCurrentTheme,

        // 配置
        apiConfig: gameState.apiConfig,
        setApiConfig: gameState.setApiConfig,
        visualConfig: gameState.visualConfig,
        setVisualConfig: gameState.setVisualConfig,
        imageManagerConfig: gameState.imageManagerConfig,
        setImageManagerConfig: gameState.setImageManagerConfig,
        gameConfig: gameState.gameConfig,
        setGameConfig: gameState.setGameConfig,
        memoryConfig: gameState.memoryConfig,
        setMemoryConfig: gameState.setMemoryConfig,
        performanceConfig: gameState.performanceConfig,
        prompts: gameState.prompts,
        setPrompts: gameState.setPrompts,
        ensurePromptsLoaded: gameState.ensurePromptsLoaded,
        festivals: gameState.festivals,
        setFestivals: gameState.setFestivals,
        currentEra: gameState.currentEra,
        setCurrentEra: gameState.setCurrentEra,

        // Refs
        scrollRef: gameState.scrollRef,
        abortControllerRef: gameState.abortControllerRef,
        variableGenerationAbortControllerRef: gameState.variableGenerationAbortControllerRef,

        // Campus Systems
        校规系统: gameState.校规系统,
        设置校规系统: gameState.设置校规系统,
        催眠系统: gameState.催眠系统,
        设置催眠系统: gameState.设置催眠系统,
        校园系统: gameState.校园系统,
        设置校园系统: gameState.设置校园系统,

        // NSFW Systems
        写真系统: gameState.写真系统,
        设置写真系统: gameState.设置写真系统,
        都市网约车系统: gameState.都市网约车系统,
        设置都市网约车系统: gameState.设置都市网约车系统,

        // --- Zustand Store 状态 ---

        // UI Slice
        可重Roll计数: store.可重Roll计数,
        set可重Roll计数: store.set可重Roll计数,
        聊天区自动滚动抑制令牌: store.聊天区自动滚动抑制令牌,
        set聊天区自动滚动抑制令牌: store.set聊天区自动滚动抑制令牌,
        聊天区强制置底令牌: store.聊天区强制置底令牌,
        set聊天区强制置底令牌: store.set聊天区强制置底令牌,
        右下角提示列表: store.右下角提示列表,
        set右下角提示列表: store.set右下角提示列表,

        // Image Slice
        NPC生图任务队列: store.NPC生图任务队列,
        setNPC生图任务队列: store.setNPC生图任务队列,
        场景生图任务队列: store.场景生图任务队列,
        set场景生图任务队列: store.set场景生图任务队列,

        // Settings Slice
        内置提示词列表: store.内置提示词列表,
        set内置提示词列表: store.set内置提示词列表,
        世界书列表: store.世界书列表,
        set世界书列表: store.set世界书列表,
        世界书预设组列表: store.世界书预设组列表,
        set世界书预设组列表: store.set世界书预设组列表,

        // Device Slice
        设备状态: gameState.设备状态,
        设置设备状态: gameState.设置设备状态,
        设备刷新任务队列: store.设备刷新任务队列,
        set设备刷新任务队列: store.set设备刷新任务队列,

        // World Slice
        世界演变更新中: store.世界演变更新中,
        set世界演变更新中: store.set世界演变更新中,
        世界演变状态文本: store.世界演变状态文本,
        set世界演变状态文本: store.set世界演变状态文本,
        世界演变最近更新时间: store.世界演变最近更新时间,
        set世界演变最近更新时间State: store.set世界演变最近更新时间,
        世界演变最近摘要: store.世界演变最近摘要,
        set世界演变最近摘要: store.set世界演变最近摘要,
        世界演变最近原始消息: store.世界演变最近原始消息,
        set世界演变最近原始消息: store.set世界演变最近原始消息,

        // Memory Slice
        待处理记忆总结任务: store.待处理记忆总结任务,
        set待处理记忆总结任务: store.set待处理记忆总结任务,
        记忆总结阶段: store.记忆总结阶段,
        set记忆总结阶段: store.set记忆总结阶段,
        记忆总结草稿: store.记忆总结草稿,
        set记忆总结草稿: store.set记忆总结草稿,
        记忆总结错误: store.记忆总结错误,
        set记忆总结错误: store.set记忆总结错误,
        待处理NPC记忆总结队列: store.待处理NPC记忆总结队列,
        set待处理NPC记忆总结队列: store.set待处理NPC记忆总结队列,
        NPC记忆总结阶段: store.NPC记忆总结阶段,
        setNPC记忆总结阶段: store.setNPC记忆总结阶段,
        NPC记忆总结草稿: store.NPC记忆总结草稿,
        setNPC记忆总结草稿: store.setNPC记忆总结草稿,
        NPC记忆总结错误: store.NPC记忆总结错误,
        setNPC记忆总结错误: store.setNPC记忆总结错误,

        // Variable Slice
        变量生成中: store.变量生成中,
        set变量生成中: store.set变量生成中,
        开局变量生成进度: store.开局变量生成进度,
        set开局变量生成进度: store.set开局变量生成进度,
        开局世界演变进度: store.开局世界演变进度,
        set开局世界演变进度: store.set开局世界演变进度,
        开局规划进度: store.开局规划进度,
        set开局规划进度: store.set开局规划进度,

        // Opening Slice
        最近开局配置: store.最近开局配置,
        设置最近开局配置: gameState.设置开局配置,

        // Scene Config Slice
        场景图片档案: store.场景图片档案,
        set场景图片档案: store.set场景图片档案,
        set时代信息: store.set时代信息,

        // Travel Slice
        旅行事件列表: store.旅行事件列表,

        // BoardGame Slice
        showBoardGameDashboard: store.showBoardGameDashboard,
        setShowBoardGameDashboard: store.setShowBoardGameDashboard,
        showBoardGameModal: store.showBoardGameModal,
        setShowBoardGameModal: store.setShowBoardGameModal,
        activeBoardGameTab: store.activeBoardGameTab,
        setActiveBoardGameTab: store.setActiveBoardGameTab,
        selectedGameType: store.selectedGameType,
        setSelectedGameType: store.setSelectedGameType,
        // SLG 新增
        boardGamePaused: store.boardGamePaused,
        setBoardGamePaused: store.setBoardGamePaused,
        pauseReason: store.pauseReason,
        setPauseReason: store.setPauseReason,
        pendingEvents: store.pendingEvents,
        setPendingEvents: store.setPendingEvents,
        actionHistory: store.actionHistory,
        addActionToHistory: store.addActionToHistory,
        narrativeConstraints: store.narrativeConstraints,
        setNarrativeConstraints: store.setNarrativeConstraints,
        lastSettlement: store.lastSettlement,
        setLastSettlement: store.setLastSettlement,
        clearActionHistory: store.clearActionHistory,
        clearPendingEvents: store.clearPendingEvents,

        // --- 派生状态 ---
        世界演变时间管理,
    };
}
