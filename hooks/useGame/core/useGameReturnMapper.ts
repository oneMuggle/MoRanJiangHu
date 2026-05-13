/**
 * useGame 返回值组装
 * 从 useGame.ts 提取的纯结构映射，无业务逻辑
 */

interface ReturnMapperDeps {
    // State source
    gameState: any;

    // Zustand store aliases
    可重Roll计数: number;
    世界演变更新中: boolean;
    世界演变状态文本: string | null;
    世界演变最近更新时间: string | null;
    世界演变最近摘要: string[];
    世界演变最近原始消息: string;
    待处理记忆总结任务: any;
    记忆总结阶段: string;
    记忆总结草稿: string | null;
    记忆总结错误: string | null;
    待处理NPC记忆总结队列: any[];
    NPC记忆总结阶段: string;
    NPC记忆总结草稿: string | null;
    NPC记忆总结错误: string | null;
    NPC生图任务队列: any[];
    场景图片档案: any;
    场景生图任务队列: any[];
    变量生成中: boolean;
    开局世界演变进度: any;
    开局规划进度: any;
    开局变量生成进度: any;
    内置提示词列表: any[];
    世界书列表: any[];
    世界书预设组列表: any[];
    右下角提示列表: any[];
    聊天区自动滚动抑制令牌: number;
    聊天区强制置底令牌: number;
    时代信息Ref: { current: any };
    设备状态: any;
    设备刷新任务队列: any[];
    旅行事件列表: any[];

    // BoardGame Slice
    showBoardGameDashboard: boolean;
    setShowBoardGameDashboard: (updater: boolean | ((prev: boolean) => boolean)) => void;
    showBoardGameModal: boolean;
    setShowBoardGameModal: (updater: boolean | ((prev: boolean) => boolean)) => void;
    activeBoardGameTab: string;
    setActiveBoardGameTab: (updater: any) => void;
    selectedGameType: string | null;
    setSelectedGameType: (updater: any) => void;
    // SLG 新增
    boardGamePaused: boolean;
    setBoardGamePaused: (updater: boolean | ((prev: boolean) => boolean)) => void;
    pauseReason: 'chat-sent' | 'key-step' | 'player-pause' | null;
    setPauseReason: (updater: any) => void;
    pendingEvents: any[];
    setPendingEvents: (updater: any) => void;
    actionHistory: any[];
    addActionToHistory: (action: any) => void;
    narrativeConstraints: string | null;
    setNarrativeConstraints: (updater: any) => void;
    lastSettlement: any;
    setLastSettlement: (updater: any) => void;
    clearActionHistory: () => void;
    clearPendingEvents: () => void;

    // BoardGame Bridge
    boardGameBridge: {
        onChatMessageSent: () => void;
        onAIReplyReceived: () => void;
        onKeyStepDetected: (result: any) => void;
        generateNarrativeConstraint: (actionType: string, result: any) => string;
        isPaused: boolean;
        pauseReason: string | null;
        narrativeConstraints: string | null;
    };

    最近开局配置: any;

    // Computed meta
    已进入主剧情回合: () => boolean;
    接口配置是否可用: (...args: any[]) => boolean;
    获取世界演变接口配置: (...args: any[]) => any;
    apiConfig: any;

    // Setters
    setShowSettings: (v: boolean) => void;
    setShowInventory: (v: boolean) => void;
    setShowEquipment: (v: boolean) => void;
    setShowBattle: (v: boolean) => void;
    setShowSocial: (v: boolean) => void;
    setShowTeam: (v: boolean) => void;
    setShowKungfu: (v: boolean) => void;
    setShowWorld: (v: boolean) => void;
    setShowMap: (v: boolean) => void;
    setShowSect: (v: boolean) => void;
    setShowTask: (v: boolean) => void;
    setShowAgreement: (v: boolean) => void;
    setShowStory: (v: boolean) => void;
    setShowHeroinePlan: (v: boolean) => void;
    setShowMemory: (v: boolean) => void;
    setShowSaveLoad: (v: any) => void;
    setShowRelationship: (v: any) => void;
    showCGGallery: boolean;
    setShowCGGallery: (v: boolean) => void;
    showMapExplorer: boolean;
    setShowMapExplorer: (v: boolean) => void;

    // 关系谱
    设置关系谱: (v: any) => void;

    setActiveTab: (v: any) => void;
    setCurrentTheme: (v: any) => void;
    setCurrentEra: (v: any) => void;
    setApiConfig: (v: any) => void;
    setVisualConfig: (v: any) => void;
    setImageManagerConfig: (v: any) => void;
    setPrompts: (v: any) => void;
    设置校规系统: (v: any) => void;
    设置催眠系统: (v: any) => void;
    设置校园系统: (v: any) => void;
    设置约定列表: (v: any) => void;
    设置社交: (v: any) => void;
    set设备刷新任务队列: (v: any) => void;

    // Actions
    handleSend: any;
    handlePrivateChatSend: any;
    handleStop: () => void;
    handleCancelVariableGeneration: any;
    handleRegenerate: any;
    handlePolishTurn: any;
    handleRecoverFromParseErrorRaw: any;
    saveSettings: any;
    saveVisualSettings: any;
    saveImageManagerSettings: any;
    saveGameSettings: any;
    saveMemorySettings: any;
    saveBuiltinPromptEntries: any;
    saveWorldbooks: any;
    saveWorldbookPresetGroups: any;
    updatePrompts: any;
    updateFestivals: any;
    handleSaveGame: any;
    handleLoadGame: any;
    updateHistoryItem: any;
    updateMemorySystem: (nextMemory: any) => void;
    createNpcManually: any;
    updateNpcManually: any;
    deleteNpcManually: any;
    uploadNpcImageToSlot: any;
    updateRuntimeVariableSection: any;
    applyRuntimeVariableCommand: any;
    handleStartNewGameWizard: any;
    handleGenerateWorld: any;
    handleQuickRestart: any;
    handleReturnToHome: any;
    updateNpcMajorRole: any;
    updateNpcPresence: any;
    removeNpc: any;
    removeTask: any;
    removeAgreement: any;
    generateNpcImageManually: any;
    generateNpcSecretPartImage: any;
    retryNpcImageGeneration: any;
    更新玩家头像: any;
    生成主角图片: any;
    选择主角头像图片: any;
    清除主角头像图片: any;
    选择主角立绘图片: any;
    清除主角立绘图片: any;
    删除主角图片记录: any;
    生成场景壁纸: any;
    选择NPC头像图片: any;
    选择NPC立绘图片: any;
    选择NPC背景图片: any;
    清除NPC头像图片: any;
    清除NPC立绘图片: any;
    清除NPC背景图片: any;
    删除NPC图片记录: any;
    清空NPC图片历史: any;
    删除NPC生图任务: any;
    清空NPC生图任务队列: any;
    保存NPC图片本地副本: any;
    应用场景图片为壁纸: any;
    清除场景壁纸: any;
    删除场景图片记录: any;
    清空场景图片历史: any;
    删除场景生图任务: any;
    清空场景生图任务队列: any;
    保存场景图片本地副本: any;
    关闭右下角提示: any;
    handleForceWorldEvolutionUpdate: any;
    buildContextSnapshot: () => Promise<any>;
    handleStartMemorySummary: any;
    handleCancelMemorySummary: any;
    handleBackToMemorySummaryRemind: any;
    handleUpdateMemorySummaryDraft: any;
    handleStartManualMemorySummary: any;
    handleApplyMemorySummary: any;
    handleStartNpcMemorySummary: any;
    handleCancelNpcMemorySummary: any;
    handleBackToNpcMemorySummaryRemind: any;
    handleUpdateNpcMemorySummaryDraft: any;
    handleQueueManualNpcMemorySummary: any;
    handleApplyNpcMemorySummary: any;
    saveArtistPreset: any;
    deleteArtistPreset: any;
    saveModelConverterPreset: any;
    deleteModelConverterPreset: any;
    setModelConverterPresetEnabled: any;
    savePromptConverterPreset: any;
    deletePromptConverterPreset: any;
    保存角色锚点: any;
    删除角色锚点: any;
    设置当前角色锚点: any;
    读取角色锚点: any;
    按NPC读取角色锚点: any;
    读取主角角色锚点: any;
    提取角色锚点: any;
    提取主角角色锚点: any;
    importPresets: any;
    exportPresets: any;
    保存PNG画风预设: any;
    删除PNG画风预设: any;
    设置当前PNG画风预设: any;
    parsePngStylePreset: any;
    导出PNG画风预设: any;
    导入PNG画风预设: any;
    设置常驻壁纸: any;
    清除常驻壁纸: any;
    推送右下角提示: any;
    处理时代变更: any;
    更新BDSM关系状态: any;
    添加BDSM任务: any;
    更新BDSM任务状态: any;
    更新契约状态: any;
    添加BDSM里程碑: any;
    设置日常指令: any;
    构建见面场景提示词: any;
    解析见面结果: any;
    生成任务摘要: any;
    请求报告任务完成: any;
    请求阶段推进: any;
    请求生成BDSM任务: any;
    请求生成BDSM日常指令: any;
    请求评价BDSM任务: any;
    请求生成BDSM契约: any;
    请求判定BDSM阶段推进: any;
    handleTravel: any;
    handleExplore: any;
    handleBuyItem: any;
    handleSellItem: any;
    handleForgeItem: any;
    getForgeRecipes: any;
    checkForgeMaterials: any;
    getForgeSuccessRate: any;
    设备打开: any;
    设备关闭: any;
    设备打开应用: any;
    设备返回主页: any;
    设置设备状态: any;
    performanceConfig: any;
}

export function 构建useGame返回值(deps: ReturnMapperDeps) {
    return {
        state: deps.gameState,
        meta: {
            canRerollLatest: deps.可重Roll计数 > 0,
            canQuickRestart: Boolean(deps.最近开局配置),
            worldEvolutionEnabled: deps.已进入主剧情回合() && deps.接口配置是否可用(deps.获取世界演变接口配置(deps.apiConfig)),
            worldEvolutionUpdating: deps.世界演变更新中,
            worldEvolutionStatus: deps.世界演变状态文本,
            worldEvolutionLastUpdatedAt: deps.世界演变最近更新时间,
            worldEvolutionLastSummary: deps.世界演变最近摘要,
            worldEvolutionLastRawText: deps.世界演变最近原始消息,
            memorySummaryOpen: Boolean(deps.待处理记忆总结任务) && deps.记忆总结阶段 !== 'idle',
            memorySummaryStage: deps.记忆总结阶段,
            memorySummaryTask: deps.待处理记忆总结任务,
            memorySummaryDraft: deps.记忆总结草稿,
            memorySummaryError: deps.记忆总结错误,
            npcMemorySummaryOpen: !Boolean(deps.待处理记忆总结任务) && Boolean(deps.待处理NPC记忆总结队列[0]) && deps.NPC记忆总结阶段 !== 'idle',
            npcMemorySummaryStage: deps.NPC记忆总结阶段,
            npcMemorySummaryTask: deps.待处理NPC记忆总结队列[0] || null,
            npcMemorySummaryDraft: deps.NPC记忆总结草稿,
            npcMemorySummaryError: deps.NPC记忆总结错误,
            npcMemorySummaryQueueLength: deps.待处理NPC记忆总结队列.length,
            imageGenerationQueue: deps.NPC生图任务队列,
            sceneImageArchive: deps.场景图片档案,
            sceneImageQueue: deps.场景生图任务队列,
            variableGenerationRunning: deps.变量生成中,
            openingWorldEvolutionProgress: deps.开局世界演变进度,
            openingPlanningProgress: deps.开局规划进度,
            openingVariableGenerationProgress: deps.开局变量生成进度,
            builtinPromptEntries: deps.内置提示词列表,
            worldbooks: deps.世界书列表,
            worldbookPresetGroups: deps.世界书预设组列表,
            notifications: deps.右下角提示列表,
            chatScrollSuppressToken: deps.聊天区自动滚动抑制令牌,
            chatForceScrollToken: deps.聊天区强制置底令牌,
            eraInfo: deps.时代信息Ref.current,
            deviceState: deps.设备状态,
            deviceRefreshQueue: deps.设备刷新任务队列,
        },
        setters: {
            setShowSettings: deps.setShowSettings,
            setShowInventory: deps.setShowInventory,
            setShowEquipment: deps.setShowEquipment,
            setShowBattle: deps.setShowBattle,
            setShowSocial: deps.setShowSocial,
            setShowTeam: deps.setShowTeam,
            setShowKungfu: deps.setShowKungfu,
            setShowWorld: deps.setShowWorld,
            setShowMap: deps.setShowMap,
            setShowSect: deps.setShowSect,
            setShowTask: deps.setShowTask,
            setShowAgreement: deps.setShowAgreement,
            setShowStory: deps.setShowStory,
            setShowHeroinePlan: deps.setShowHeroinePlan,
            setShowMemory: deps.setShowMemory,
            setShowSaveLoad: deps.setShowSaveLoad,
            setShowRelationship: deps.setShowRelationship,
            showCGGallery: deps.showCGGallery,
            setShowCGGallery: deps.setShowCGGallery,
            showMapExplorer: deps.showMapExplorer,
            setShowMapExplorer: deps.setShowMapExplorer,
            设置关系谱: deps.设置关系谱,
            setActiveTab: deps.setActiveTab,
            setCurrentTheme: deps.setCurrentTheme,
            setCurrentEra: deps.setCurrentEra,
            setApiConfig: deps.setApiConfig,
            setVisualConfig: deps.setVisualConfig,
            setImageManagerConfig: deps.setImageManagerConfig,
            setPrompts: deps.setPrompts,
            set校规系统: deps.设置校规系统,
            set催眠系统: deps.设置催眠系统,
            set校园系统: deps.设置校园系统,
            set约定列表: deps.设置约定列表,
            set社交: deps.设置社交,
            set设备刷新队列: deps.set设备刷新任务队列,
        },
        actions: {
            handleSend: deps.handleSend,
            handlePrivateChatSend: deps.handlePrivateChatSend,
            handleStop: deps.handleStop,
            handleCancelVariableGeneration: deps.handleCancelVariableGeneration,
            handleRegenerate: deps.handleRegenerate,
            handlePolishTurn: deps.handlePolishTurn,
            handleRecoverFromParseErrorRaw: deps.handleRecoverFromParseErrorRaw,
            saveSettings: deps.saveSettings,
            saveVisualSettings: deps.saveVisualSettings,
            saveImageManagerSettings: deps.saveImageManagerSettings,
            saveGameSettings: deps.saveGameSettings,
            saveMemorySettings: deps.saveMemorySettings,
            saveBuiltinPromptEntries: deps.saveBuiltinPromptEntries,
            saveWorldbooks: deps.saveWorldbooks,
            saveWorldbookPresetGroups: deps.saveWorldbookPresetGroups,
            updatePrompts: deps.updatePrompts,
            updateFestivals: deps.updateFestivals,
            handleSaveGame: deps.handleSaveGame,
            handleLoadGame: deps.handleLoadGame,
            updateHistoryItem: deps.updateHistoryItem,
            updateMemorySystem: deps.updateMemorySystem,
            createNpcManually: deps.createNpcManually,
            updateNpcManually: deps.updateNpcManually,
            deleteNpcManually: deps.deleteNpcManually,
            uploadNpcImageToSlot: deps.uploadNpcImageToSlot,
            updateRuntimeVariableSection: deps.updateRuntimeVariableSection,
            applyRuntimeVariableCommand: deps.applyRuntimeVariableCommand,
            handleStartNewGameWizard: deps.handleStartNewGameWizard,
            handleGenerateWorld: deps.handleGenerateWorld,
            handleQuickRestart: deps.handleQuickRestart,
            handleReturnToHome: deps.handleReturnToHome,
            updateNpcMajorRole: deps.updateNpcMajorRole,
            updateNpcPresence: deps.updateNpcPresence,
            removeNpc: deps.removeNpc,
            removeTask: deps.removeTask,
            removeAgreement: deps.removeAgreement,
            generateNpcImageManually: deps.generateNpcImageManually,
            generateNpcSecretPartImage: deps.generateNpcSecretPartImage,
            retryNpcImageGeneration: deps.retryNpcImageGeneration,
            updatePlayerAvatar: deps.更新玩家头像,
            generatePlayerImageManually: deps.生成主角图片,
            selectPlayerAvatarImage: deps.选择主角头像图片,
            clearPlayerAvatarImage: deps.清除主角头像图片,
            selectPlayerPortraitImage: deps.选择主角立绘图片,
            clearPlayerPortraitImage: deps.清除主角立绘图片,
            removePlayerImageRecord: deps.删除主角图片记录,
            generateSceneImageManually: deps.生成场景壁纸,
            selectNpcAvatarImage: deps.选择NPC头像图片,
            selectNpcPortraitImage: deps.选择NPC立绘图片,
            selectNpcBackgroundImage: deps.选择NPC背景图片,
            clearNpcAvatarImage: deps.清除NPC头像图片,
            clearNpcPortraitImage: deps.清除NPC立绘图片,
            clearNpcBackgroundImage: deps.清除NPC背景图片,
            removeNpcImageRecord: deps.删除NPC图片记录,
            clearNpcImageHistory: deps.清空NPC图片历史,
            removeNpcImageQueueTask: deps.删除NPC生图任务,
            clearNpcImageQueue: deps.清空NPC生图任务队列,
            saveNpcImageLocally: deps.保存NPC图片本地副本,
            applySceneImageWallpaper: deps.应用场景图片为壁纸,
            clearSceneWallpaper: deps.清除场景壁纸,
            removeSceneImageRecord: deps.删除场景图片记录,
            clearSceneImageHistory: deps.清空场景图片历史,
            removeSceneImageQueueTask: deps.删除场景生图任务,
            clearSceneImageQueue: deps.清空场景生图任务队列,
            saveSceneImageLocally: deps.保存场景图片本地副本,
            dismissNotification: deps.关闭右下角提示,
            handleForceWorldEvolutionUpdate: deps.handleForceWorldEvolutionUpdate,
            getContextSnapshot: deps.buildContextSnapshot,
            handleStartMemorySummary: deps.handleStartMemorySummary,
            handleCancelMemorySummary: deps.handleCancelMemorySummary,
            handleBackToMemorySummaryRemind: deps.handleBackToMemorySummaryRemind,
            handleUpdateMemorySummaryDraft: deps.handleUpdateMemorySummaryDraft,
            handleStartManualMemorySummary: deps.handleStartManualMemorySummary,
            handleApplyMemorySummary: deps.handleApplyMemorySummary,
            handleStartNpcMemorySummary: deps.handleStartNpcMemorySummary,
            handleCancelNpcMemorySummary: deps.handleCancelNpcMemorySummary,
            handleBackToNpcMemorySummaryRemind: deps.handleBackToNpcMemorySummaryRemind,
            handleUpdateNpcMemorySummaryDraft: deps.handleUpdateNpcMemorySummaryDraft,
            handleQueueManualNpcMemorySummary: deps.handleQueueManualNpcMemorySummary,
            handleApplyNpcMemorySummary: deps.handleApplyNpcMemorySummary,
            saveArtistPreset: deps.saveArtistPreset,
            deleteArtistPreset: deps.deleteArtistPreset,
            saveModelConverterPreset: deps.saveModelConverterPreset,
            deleteModelConverterPreset: deps.deleteModelConverterPreset,
            setModelConverterPresetEnabled: deps.setModelConverterPresetEnabled,
            savePromptConverterPreset: deps.savePromptConverterPreset,
            deletePromptConverterPreset: deps.deletePromptConverterPreset,
            saveCharacterAnchor: deps.保存角色锚点,
            deleteCharacterAnchor: deps.删除角色锚点,
            setCurrentCharacterAnchor: deps.设置当前角色锚点,
            getCharacterAnchor: deps.读取角色锚点,
            getCharacterAnchorByNpcId: deps.按NPC读取角色锚点,
            getPlayerCharacterAnchor: deps.读取主角角色锚点,
            extractCharacterAnchor: deps.提取角色锚点,
            extractPlayerCharacterAnchor: deps.提取主角角色锚点,
            importPresets: deps.importPresets,
            exportPresets: deps.exportPresets,
            savePngStylePreset: deps.保存PNG画风预设,
            deletePngStylePreset: deps.删除PNG画风预设,
            setCurrentPngStylePreset: deps.设置当前PNG画风预设,
            parsePngStylePreset: deps.parsePngStylePreset,
            exportPngStylePresets: deps.导出PNG画风预设,
            importPngStylePresets: deps.导入PNG画风预设,
            setPersistentWallpaper: deps.设置常驻壁纸,
            clearPersistentWallpaper: deps.清除常驻壁纸,
            pushNotification: deps.推送右下角提示,
            handleEraChange: deps.处理时代变更,
            updateBDSMRelationshipState: deps.更新BDSM关系状态,
            addBDSMTask: deps.添加BDSM任务,
            updateBDSMTaskStatus: deps.更新BDSM任务状态,
            updateContractStatus: deps.更新契约状态,
            addBDSMMilestone: deps.添加BDSM里程碑,
            setDailyInstructions: deps.设置日常指令,
            buildMeetingPrompt: deps.构建见面场景提示词,
            parseMeetingResult: deps.解析见面结果,
            generateTaskSummary: deps.生成任务摘要,
            reportTaskComplete: deps.请求报告任务完成,
            stageAdvance: deps.请求阶段推进,
            requestBDSMTaskGeneration: deps.请求生成BDSM任务,
            requestBDSMDailyInstructions: deps.请求生成BDSM日常指令,
            requestBDSMTaskEvaluation: deps.请求评价BDSM任务,
            requestBDSMContractGeneration: deps.请求生成BDSM契约,
            requestBDSMStageAdvance: deps.请求判定BDSM阶段推进,
            handleTravel: deps.handleTravel,
            handleExplore: deps.handleExplore,
            travelEvents: deps.旅行事件列表,
            handleBuyItem: deps.handleBuyItem,
            handleSellItem: deps.handleSellItem,
            handleForgeItem: deps.handleForgeItem,
            getForgeRecipes: deps.getForgeRecipes,
            checkForgeMaterials: deps.checkForgeMaterials,
            getForgeSuccessRate: deps.getForgeSuccessRate,
            openDevice: deps.设备打开,
            closeDevice: deps.设备关闭,
            openDeviceApp: deps.设备打开应用,
            returnDeviceHome: deps.设备返回主页,
            setDeviceState: deps.设置设备状态,
            performanceConfig: deps.performanceConfig,
            boardGameBridge: deps.boardGameBridge
        }
    };
}
