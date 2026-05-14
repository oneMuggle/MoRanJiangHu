/**
 * 类型化状态选择器
 *
 * 消除组件和注册表中 (state as any).xxx 的深层路径访问。
 * 将散落的 as any 集中到一处，后续逐步添加类型定义。
 */

type GameView = 'home' | 'new_game' | 'game';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDict = Record<string, any>;

/** 公共选择器 — 所有深层路径访问集中于此 */
export function createSelectors(state: AnyDict, meta: AnyDict) {
  const config = state.gameConfig as AnyDict | undefined;

  return {
    // === 视图状态 ===
    getCurrentView: (): GameView | undefined => state.view as GameView | undefined,
    isGameView: (): boolean => state.view === 'game',
    isNewGameView: (): boolean => state.view === 'new_game',
    isHomeView: (): boolean => state.view === 'home',

    // === 游戏配置 ===
    getGameConfig: () => config,
    getConfigValue: <T = unknown>(key: string, fallback?: T): T => (config?.[key] ?? fallback) as T,
    isNsfwEnabled: (): boolean => config?.启用NSFW模式 === true,
    isCultivationEnabled: (): boolean => config?.启用修炼体系 !== false,
    isHeroinePlanningEnabled: (): boolean => config?.启用女主剧情规划 === true,
    isCampusNSFWEnabled: (): boolean => config?.启用校园NSFW模式 === true,
    isPhotographyNSFWEnabled: (): boolean => config?.启用写真NSFW模式 === true,
    isUrbanDriverNSFWEnabled: (): boolean => config?.启用都市网约车NSFW模式 === true,

    // === 校园系统 ===
    getCampusSystem: () => state.校园系统 as AnyDict | undefined,
    getDesireSystem: () => state.校园系统?.欲望系统 as AnyDict | undefined,
    getNpcDesireProfile: (npcId: string): AnyDict | undefined =>
      state.校园系统?.欲望系统?.NPC欲望档案?.[npcId] as AnyDict | undefined,
    getNpcBdsmRelation: (npcId: string): AnyDict | undefined =>
      state.校园系统?.欲望系统?.NPC欲望档案?.[npcId]?.BDSM关系 as AnyDict | undefined,
    getCampusPrivateChats: (): AnyDict[] =>
      (state.校园系统?.私聊会话列表 ?? []) as AnyDict[],
    getCampusBDSMPosts: (): AnyDict[] =>
      (state.校园系统?.BDSM帖子列表 ?? []) as AnyDict[],

    // === 写真与网约车 ===
    getPhotographySystem: () => state.写真系统 as AnyDict | undefined,
    getUrbanDriverSystem: () => state.都市网约车系统 as AnyDict | undefined,

    // === 核心游戏数据 ===
    getCharacter: () => state.角色 as AnyDict | undefined,
    getEnvironment: () => state.环境 as AnyDict | undefined,
    getSocial: (): AnyDict[] => (state.社交 ?? []) as AnyDict[],
    getWorld: () => state.世界 as AnyDict | undefined,
    getBattle: () => state.战斗 as AnyDict | undefined,
    getStory: () => state.剧情 as AnyDict | undefined,
    getMemory: () => state.记忆系统 as AnyDict | undefined,
    getHistory: (): AnyDict[] => (state.历史记录 ?? []) as AnyDict[],
    getAgreements: (): AnyDict[] => (state.约定列表 ?? []) as AnyDict[],
    getTasks: (): AnyDict[] => (state.任务列表 ?? []) as AnyDict[],
    getSect: () => state.玩家门派 as AnyDict | undefined,
    getPrompts: (): AnyDict[] => (state.prompts ?? []) as AnyDict[],
    getFestivals: (): AnyDict[] => (state.festivals ?? []) as AnyDict[],

    // === 配置数据 ===
    getApiConfig: () => state.apiConfig as AnyDict | undefined,
    getVisualConfig: () => state.visualConfig as AnyDict | undefined,
    getMemoryConfig: () => state.memoryConfig as AnyDict | undefined,
    getCurrentTheme: () => state.currentTheme as AnyDict | undefined,
    getCurrentEra: (): string | undefined => state.currentEra as string | undefined,

    // === 开局配置 ===
    getOpeningConfig: () => state.开局配置 as AnyDict | undefined,

    // === 设备状态 ===
    getDeviceState: () => state.设备状态 as AnyDict | undefined,

    // === 规划 ===
    getPlanning: () => state.规划 as AnyDict | undefined,
    getCurrentStoryPlan: () => state.规划?.当前剧情规划 as AnyDict | undefined,
    getCurrentHeroinePlan: () => state.规划?.当前女主剧情规划 as AnyDict | undefined,
    isFandomMode: (): boolean => state.规划?.同人剧情规划 != null,
    isFandomHeroineMode: (): boolean => state.规划?.同人女主剧情规划 != null,

    // === Meta 选择器 ===
    getEraInfo: () => meta.eraInfo as AnyDict | undefined,
    getDeviceMeta: () => meta.deviceState as AnyDict | undefined,
    getDeviceRefreshQueue: () => meta.deviceRefreshQueue as AnyDict[] | undefined,
    getImageQueue: () => meta.imageGenerationQueue as AnyDict[] | undefined,
    getSceneArchive: () => meta.sceneImageArchive as AnyDict | undefined,
    getSceneQueue: () => meta.sceneImageQueue as AnyDict[] | undefined,
    getWorldbooks: () => meta.worldbooks as AnyDict[] | undefined,
    getBuiltinPromptEntries: () => meta.builtinPromptEntries as AnyDict[] | undefined,
    getWorldbookPresetGroups: () => meta.worldbookPresetGroups as AnyDict | undefined,
    isWorldEvolutionEnabled: (): boolean => meta.worldEvolutionEnabled === true,
    isWorldEvolutionUpdating: (): boolean => meta.worldEvolutionUpdating === true,
    getWorldEvolutionStatus: () => meta.worldEvolutionStatus as string | undefined,
    getWorldEvolutionLastUpdatedAt: () => meta.worldEvolutionLastUpdatedAt as string | undefined,
    getWorldEvolutionLastSummary: () => meta.worldEvolutionLastSummary as string | undefined,
    getWorldEvolutionLastRawText: () => meta.worldEvolutionLastRawText as string | undefined,
    getCanRerollLatest: (): boolean => meta.canRerollLatest === true,
    getCanQuickRestart: (): boolean => meta.canQuickRestart === true,

    // === 通用安全访问 ===
    get: <K extends keyof typeof state>(key: K) => state[key],
    getMeta: <K extends keyof typeof meta>(key: K) => meta[key],
  };
}
