/**
 * 遗留弹窗批量注册
 *
 * 将 lazyComponents.tsx 中所有现有弹窗注册到 UIFeatureRegistry。
 * 这些注册项在 Phase 3 迁移完成后将被逐步移除。
 */

import { UIFeatureRegistry } from './registry';
import {
  CharacterModal,
  MobileCharacter,
  NewGameWizard,
  MobileNewGameWizard,
  SettingsPanel,
  InventoryModal,
  MobileInventoryModal,
  EquipmentModal,
  MobileEquipmentModal,
  BattleModal,
  MobileBattleModal,
  SocialModal,
  MobileSocial,
  ImageManagerModal,
  MobileImageManagerModal,
  CampusDesireDashboard,
  PhotographyDashboard,
  MobilePhotographyDashboard,
  BDSMRelationshipModal,
  BDSMContractModal,
  BDSMSafetyModal,
  MobileCampusDesireApp,
  UrbanDriverDashboard,
  MobileUrbanDriverApp,
  NsfwControlCenter,
  WorldbookManagerModal,
  MobileWorldbookManagerModal,
  TeamModal,
  MobileTeamModal,
  KungfuModal,
  MobileKungfuModal,
  WorldModal,
  MobileWorldModal,
  MapModal,
  MobileMapModal,
  SectModal,
  MobileSect,
  TaskModal,
  MobileTask,
  AgreementModal,
  MobileAgreementModal,
  StoryModal,
  MobileStory,
  HeroinePlanModal,
  MobileHeroinePlanModal,
  MemoryModal,
  MobileMemory,
  MemorySummaryFlowModal,
  MemorySummaryFlowMobileModal,
  NpcMemorySummaryFlowModal,
  NpcMemorySummaryFlowMobileModal,
  SaveLoadModal,
  MobileSaveLoadModal,
  MobileMusicPlayer,
  NovelDecompositionWorkbenchModal,
  MobileNovelDecompositionWorkbenchModal,
  NovelWritingWorkbenchModal,
  MobileNovelWritingWorkbenchModal,
  MobileDeviceModal,
  BoardGameDashboard,
  BoardGameModal,
  MobileBoardGameDashboard,
  MobileBoardGameModal,
  CGGalleryModal,
  MobileCGGalleryModal,
  MapExplorerModal,
  MobileMapExplorerModal,
} from '../../components/features/lazyComponents';

// ============================================================================
// 核心模块
// ============================================================================

// Character — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'character',
  name: '角色面板',
  icon: '👤',
  category: 'core',
  priority: 100,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: CharacterModal,
    mobileComponent: MobileCharacter,
    visibility: 'always',
    stateKey: 'showCharacter',
    gameViewOnly: true,
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      character: state.角色,
      gameConfig: state.gameConfig,
      apiConfig: state.apiConfig,
      visualConfig: state.visualConfig,
      playerAnchor: (actions as any).getPlayerCharacterAnchor?.() || null,
      onGeneratePlayerImage: (actions as any).generatePlayerImageManually,
      onExtractPlayerAnchor: (actions as any).extractPlayerCharacterAnchor,
      onSavePlayerAnchor: (actions as any).saveCharacterAnchor,
      onDeletePlayerAnchor: (actions as any).deleteCharacterAnchor,
      onSelectPlayerAvatarImage: (actions as any).selectPlayerAvatarImage,
      onClearPlayerAvatarImage: (actions as any).clearPlayerAvatarImage,
      onSelectPlayerPortraitImage: (actions as any).selectPlayerPortraitImage,
      onClearPlayerPortraitImage: (actions as any).clearPlayerPortraitImage,
      onRemovePlayerImageRecord: (actions as any).removePlayerImageRecord,
      onClose: () => {
        (setters as any).setShowCharacter?.(false);
        modalManager.close('character');
      },
    }),
  },
});

// Inventory — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'inventory',
  name: '背包',
  icon: '🎒',
  category: 'core',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: InventoryModal,
    mobileComponent: MobileInventoryModal,
    visibility: 'always',
    stateKey: 'showInventory',
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      onClose: () => {
        (setters as any).setShowInventory?.(false);
        modalManager.close('inventory');
      },
    }),
  },
});

// Equipment — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'equipment',
  name: '装备',
  icon: '⚔️',
  category: 'core',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: EquipmentModal,
    mobileComponent: MobileEquipmentModal,
    visibility: 'always',
    stateKey: 'showEquipment',
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      onClose: () => {
        (setters as any).setShowEquipment?.(false);
        modalManager.close('equipment');
      },
    }),
  },
});

// Battle — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'battle',
  name: '战斗',
  icon: '⚔️',
  category: 'core',
  priority: 95,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: BattleModal,
    mobileComponent: MobileBattleModal,
    visibility: 'always',
    stateKey: 'showBattle',
    gameViewOnly: true,
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      battle: state.战斗,
      onClose: () => {
        (setters as any).setShowBattle?.(false);
        modalManager.close('battle');
      },
      onAction: () => {},
    }),
  },
});

// Social — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'social',
  name: '社交',
  icon: '👥',
  category: 'core',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: SocialModal,
    mobileComponent: MobileSocial,
    visibility: 'always',
    stateKey: 'showSocial',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      socialList: state.社交,
      cultivationSystemEnabled: ((state as any).gameConfig?.启用修炼体系) !== false,
      onClose: () => {
        (setters as any).setShowSocial?.(false);
        modalManager.close('social');
      },
      playerName: (state.角色 as any)?.姓名,
      nsfwEnabled: ((state as any).gameConfig?.启用NSFW模式) === true,
      onToggleMajorRole: (actions as any).updateNpcMajorRole,
      onTogglePresence: (actions as any).updateNpcPresence,
      onDeleteNpc: (actions as any).移除NPC,
      欲望系统: (state as any).校园系统?.欲望系统,
      onOpenCampusDesire: () => modalManager.open('campusDesire'),
      关系谱: (state as any).关系谱,
    }),
  },
});

// Team — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'team',
  name: '队伍',
  icon: '👥',
  category: 'core',
  priority: 85,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: TeamModal,
    mobileComponent: MobileTeamModal,
    visibility: 'always',
    stateKey: 'showTeam',
    propsFactory: ({ state, setters, modalManager }) => ({
      character: state.角色,
      teammates: state.社交,
      onClose: () => {
        (setters as any).setShowTeam?.(false);
        modalManager.close('team');
      },
    }),
  },
});

// Kungfu — 已迁移到新系统（完整 propsFactory，需启用修炼体系）
UIFeatureRegistry.register({
  id: 'kungfu',
  name: '武功',
  icon: '🥋',
  category: 'core',
  priority: 85,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: KungfuModal,
    mobileComponent: MobileKungfuModal,
    visibility: 'config-dependent',
    gameViewOnly: true,
    configKey: '启用修炼体系',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => ({
      skills: (state.角色 as any)?.功法列表,
      onClose: () => {
        (setters as any).setShowKungfu?.(false);
        modalManager.close('kungfu');
      },
    }),
  },
});

// SaveLoad — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'saveLoad',
  name: '存档/读档',
  icon: '💾',
  category: 'tools',
  priority: 95,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: SaveLoadModal,
    mobileComponent: MobileSaveLoadModal,
    visibility: 'always',
    stateKey: 'showSaveLoad',
    stateKey: 'showKungfu',
    propsFactory: ({ state, actions, modalManager, requestConfirm }) => {
      const payload = modalManager.openModals.get('saveLoad');
      const mode = (payload && typeof payload === 'object' && 'mode' in payload)
        ? (payload as { mode: string }).mode
        : ((state as any).showSaveLoad?.mode ?? 'load');
      return {
        onClose: () => modalManager.close('saveLoad'),
        onLoadGame: (actions as any).handleLoadGame,
        onSaveGame: (actions as any).handleSaveGame,
        mode,
        requestConfirm,
      };
    },
  },
});

// ============================================================================
// 世界与地图
// ============================================================================

// World — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'world',
  name: '世界',
  icon: '🌍',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: WorldModal,
    mobileComponent: MobileWorldModal,
    visibility: 'always',
    stateKey: 'showWorld',
    propsFactory: ({ state, meta, actions, setters, modalManager }) => ({
      world: state.世界,
      worldEvolutionEnabled: (meta as any).worldEvolutionEnabled,
      worldEvolutionUpdating: (meta as any).worldEvolutionUpdating,
      worldEvolutionStatus: (meta as any).worldEvolutionStatus,
      worldEvolutionLastUpdatedAt: (meta as any).worldEvolutionLastUpdatedAt,
      worldEvolutionLastSummary: (meta as any).worldEvolutionLastSummary,
      worldEvolutionLastRawText: (meta as any).worldEvolutionLastRawText,
      onForceUpdate: (actions as any).handleForceWorldEvolutionUpdate,
      onClose: () => {
        (setters as any).setShowWorld?.(false);
        modalManager.close('world');
      },
    }),
  },
});

// Map — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'map',
  name: '地图',
  icon: '🗺️',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: MapModal,
    mobileComponent: MobileMapModal,
    visibility: 'always',
    stateKey: 'showMap',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      world: state.世界,
      env: state.环境,
      character: state.角色,
      onTravel: (actions as any).handleTravel,
      onExplore: (actions as any).handleExplore,
      travelEvents: (actions as any).travelEvents,
      onClose: () => {
        (setters as any).setShowMap?.(false);
        modalManager.close('map');
      },
    }),
  },
});

// Sect — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'sect',
  name: '门派',
  icon: '🏯',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: SectModal,
    mobileComponent: MobileSect,
    visibility: 'always',
    stateKey: 'showSect',
    propsFactory: ({ state, setters, modalManager }) => ({
      sectData: state.玩家门派,
      currentTime: ((state as any).环境?.时间) || '未知时间',
      onClose: () => {
        (setters as any).setShowSect?.(false);
        modalManager.close('sect');
      },
    }),
  },
});

// Task — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'task',
  name: '任务',
  icon: '📋',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: TaskModal,
    mobileComponent: MobileTask,
    visibility: 'always',
    stateKey: 'showTask',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      tasks: state.任务列表,
      onDeleteTask: (actions as any).removeTask,
      onClose: () => {
        (setters as any).setShowTask?.(false);
        modalManager.close('task');
      },
    }),
  },
});

// Agreement — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'agreement',
  name: '约定',
  icon: '📝',
  category: 'core',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: AgreementModal,
    mobileComponent: MobileAgreementModal,
    visibility: 'always',
    stateKey: 'showAgreement',
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      agreements: state.约定列表,
      onDeleteAgreement: (actions as any).removeAgreement,
      onClose: () => {
        (setters as any).setShowAgreement?.(false);
        modalManager.close('agreement');
      },
    }),
  },
});

// ============================================================================
// 叙事与记忆
// ============================================================================

// Story — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'story',
  name: '剧情',
  icon: '📖',
  category: 'narrative',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: StoryModal,
    mobileComponent: MobileStory,
    visibility: 'always',
    stateKey: 'showStory',
    propsFactory: ({ state, setters, modalManager }) => {
      const 当前剧情规划 = (state as any).规划?.当前剧情规划;
      return {
        story: state.剧情,
        storyPlan: 当前剧情规划,
        isFandomMode: ((state as any).规划?.同人剧情规划 != null),
        onClose: () => {
          (setters as any).setShowStory?.(false);
          modalManager.close('story');
        },
      };
    },
  },
});

// HeroinePlan — 已迁移到新系统（完整 propsFactory，需启用女主剧情规划）
UIFeatureRegistry.register({
  id: 'heroinePlan',
  name: '女主剧情规划',
  icon: '📋',
  category: 'narrative',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: HeroinePlanModal,
    mobileComponent: MobileHeroinePlanModal,
    visibility: 'config-dependent',
    configKey: '启用女主剧情规划',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => {
      const 当前女主剧情规划 = (state as any).规划?.当前女主剧情规划;
      return {
        plan: 当前女主剧情规划,
        isFandomMode: ((state as any).规划?.同人女主剧情规划 != null),
        onClose: () => {
          (setters as any).setShowHeroinePlan?.(false);
          modalManager.close('heroinePlan');
        },
      };
    },
  },
});

// Memory — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'memory',
  name: '记忆',
  icon: '🧠',
  category: 'narrative',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: MemoryModal,
    mobileComponent: MobileMemory,
    visibility: 'always',
    stateKey: 'showMemory',
    stateKey: 'showHeroinePlan',
    propsFactory: ({ state, setters, modalManager }) => ({
      history: state.历史记录,
      memorySystem: state.记忆系统,
      onClose: () => {
        (setters as any).setShowMemory?.(false);
        modalManager.close('memory');
      },
    }),
  },
});

// MemorySummaryFlow — 已迁移到新系统
UIFeatureRegistry.register({
  id: 'memorySummaryFlow',
  name: '记忆总结',
  icon: '📝',
  category: 'narrative',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: MemorySummaryFlowModal,
    mobileComponent: MemorySummaryFlowMobileModal,
    visibility: 'always',
    propsFactory: ({ modalManager }) => ({
      onClose: () => modalManager.close('memorySummaryFlow'),
    }),
  },
});

// NpcMemorySummaryFlow — 已迁移到新系统
UIFeatureRegistry.register({
  id: 'npcMemorySummaryFlow',
  name: 'NPC记忆总结',
  icon: '📝',
  category: 'narrative',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: NpcMemorySummaryFlowModal,
    mobileComponent: NpcMemorySummaryFlowMobileModal,
    visibility: 'always',
    propsFactory: ({ modalManager }) => ({
      onClose: () => modalManager.close('npcMemorySummaryFlow'),
    }),
  },
});

// ============================================================================
// 工具与设置
// ============================================================================

// Settings — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'settings',
  name: '设置',
  icon: '⚙️',
  category: 'settings',
  priority: 100,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: SettingsPanel,
    visibility: 'always',
    stateKey: 'showSettings',
    propsFactory: ({ state, meta, setters, actions, modalManager, isMobile, requestConfirm, extraProps }) => {
      // 动态导入 tabDefinitions 避免循环依赖
      const { desktopTabs, mobileTabs } = require('../../components/features/Settings/tabDefinitions');
      return {
        navMode: isMobile ? 'pills' : 'sidebar',
        tabs: isMobile ? mobileTabs : desktopTabs,
        activeTab: (state as any).activeTab,
        onTabChange: (setters as any).setActiveTab,
        onClose: () => {
          (setters as any).setShowSettings?.(false);
          modalManager.close('settings');
        },
        apiConfig: state.apiConfig,
        visualConfig: state.visualConfig,
        gameConfig: state.gameConfig,
        memoryConfig: state.memoryConfig,
        prompts: state.prompts,
        festivals: state.festivals,
        currentTheme: state.currentTheme,
        currentEra: state.currentEra,
        eraInfo: (meta as any).eraInfo,
        eraTheme: state.currentEra ? require('../../models/system').获取时代主题方案(state.currentEra as string) : undefined,
        availableEras: require('../../models/system').全部时代配置,
        onEraChange: (actions as any).handleEraChange,
        history: state.历史记录,
        memorySystem: state.记忆系统,
        socialList: state.社交,
        runtimeState: extraProps?.runtimeStateSections,
        currentStory: state.剧情,
        openingConfig: state.开局配置,
        contextSnapshot: extraProps?.contextSnapshot,
        onSaveApi: (actions as any).saveSettings,
        onSaveVisual: (actions as any).saveVisualSettings,
        onSaveGame: (actions as any).saveGameSettings,
        onSaveMemory: (actions as any).saveMemorySettings,
        onCreateNpc: (actions as any).createNpcManually,
        onSaveNpc: (actions as any).updateNpcManually,
        onDeleteNpc: (actions as any).deleteNpcManually,
        onStartNpcMemorySummary: (actions as any).handleQueueManualNpcMemorySummary,
        onUploadNpcImage: (actions as any).uploadNpcImageToSlot,
        onReplaceVariableSection: (actions as any).updateRuntimeVariableSection,
        onApplyVariableCommand: (actions as any).applyRuntimeVariableCommand,
        onUpdatePrompts: (actions as any).updatePrompts,
        onUpdateFestivals: (actions as any).updateFestivals,
        onThemeChange: (setters as any).setCurrentTheme,
        requestConfirm,
        onReturnToHome: (actions as any).handleReturnToHome,
        isHome: state.view === 'home',
      };
    },
  },
});

// ImageManager — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'imageManager',
  name: '图片管理',
  icon: '🖼️',
  category: 'tools',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: ImageManagerModal,
    mobileComponent: MobileImageManagerModal,
    visibility: 'always',
    stateKey: 'showImageManager',
    propsFactory: ({ state, meta, actions, setters, modalManager }) => ({
      socialList: state.社交,
      cultivationSystemEnabled: ((state as any).gameConfig?.启用修炼体系) !== false,
      queue: (meta as any).imageGenerationQueue || [],
      sceneArchive: (meta as any).sceneImageArchive || {},
      sceneQueue: (meta as any).sceneImageQueue || [],
      apiConfig: state.apiConfig,
      imageManagerConfig: state.imageManagerConfig,
      currentPersistentWallpaper: ((state as any).visualConfig?.常驻壁纸) || '',
      onSaveApiConfig: (actions as any).saveSettings,
      onSaveImageManagerConfig: (actions as any).saveImageManagerSettings,
      onGenerateImage: (actions as any).generateNpcImageManually,
      onGenerateSecretPartImage: (actions as any).generateNpcSecretPartImage,
      onRetryImage: (actions as any).retryNpcImageGeneration,
      onGenerateSceneImage: (actions as any).generateSceneImageManually,
      onSelectAvatarImage: (actions as any).selectNpcAvatarImage,
      onSelectPortraitImage: (actions as any).selectNpcPortraitImage,
      onSelectBackgroundImage: (actions as any).selectNpcBackgroundImage,
      onClearAvatarImage: (actions as any).clearNpcAvatarImage,
      onClearPortraitImage: (actions as any).clearNpcPortraitImage,
      onClearBackgroundImage: (actions as any).clearNpcBackgroundImage,
      onDeleteImageRecord: (actions as any).removeNpcImageRecord,
      onClearImageHistory: (actions as any).clearNpcImageHistory,
      onDeleteQueueTask: (actions as any).removeNpcImageQueueTask,
      onClearQueue: (actions as any).clearNpcImageQueue,
      onSaveImageLocally: (actions as any).saveNpcImageLocally,
      onApplySceneWallpaper: (actions as any).applySceneImageWallpaper,
      onClearSceneWallpaper: (actions as any).clearSceneWallpaper,
      onDeleteSceneImage: (actions as any).removeSceneImageRecord,
      onClearSceneHistory: (actions as any).clearSceneImageHistory,
      onDeleteSceneQueueTask: (actions as any).removeSceneImageQueueTask,
      onClearSceneQueue: (actions as any).clearSceneImageQueue,
      onSaveSceneImageLocally: (actions as any).saveSceneImageLocally,
      onSetPersistentWallpaper: (actions as any).setPersistentWallpaper,
      onClearPersistentWallpaper: (actions as any).clearPersistentWallpaper,
      onSavePngStylePreset: (actions as any).savePngStylePreset,
      onDeletePngStylePreset: (actions as any).deletePngStylePreset,
      onSetCurrentPngStylePreset: (actions as any).setCurrentPngStylePreset,
      onParsePngStylePreset: (actions as any).parsePngStylePreset,
      onExportPngStylePresets: (actions as any).exportPngStylePresets,
      onImportPngStylePresets: (actions as any).importPngStylePresets,
      onSaveCharacterAnchor: (actions as any).saveCharacterAnchor,
      onDeleteCharacterAnchor: (actions as any).deleteCharacterAnchor,
      onExtractCharacterAnchor: (actions as any).extractCharacterAnchor,
      onClose: () => {        modalManager.close('imageManager');
      },
      onSaveArtistPreset: (actions as any).saveArtistPreset,
      onDeleteArtistPreset: (actions as any).deleteArtistPreset,
      onSaveModelConverterPreset: (actions as any).saveModelConverterPreset,
      onDeleteModelConverterPreset: (actions as any).deleteModelConverterPreset,
      onSetModelConverterPresetEnabled: (actions as any).setModelConverterPresetEnabled,
      onSavePromptConverterPreset: (actions as any).savePromptConverterPreset,
      onDeletePromptConverterPreset: (actions as any).deletePromptConverterPreset,
      onImportPresets: (actions as any).importPresets,
      onExportPresets: (actions as any).exportPresets,
    }),
  },
});

// Worldbook Manager — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'worldbookManager',
  name: '世界书',
  icon: '📚',
  category: 'tools',
  priority: 80,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: WorldbookManagerModal,
    mobileComponent: MobileWorldbookManagerModal,
    visibility: 'always',
    propsFactory: ({ meta, actions, modalManager, requestConfirm }) => ({
      builtinPromptEntries: meta.builtinPromptEntries,
      worldbooks: meta.worldbooks,
      worldbookPresetGroups: meta.worldbookPresetGroups,
      onSaveBuiltinPromptEntries: actions.saveBuiltinPromptEntries,
      onSaveWorldbooks: actions.saveWorldbooks,
      onSaveWorldbookPresetGroups: actions.saveWorldbookPresetGroups,
      onClose: () => modalManager.close('worldbookManager'),
      requestConfirm,
    }),
  },
});

// Novel Decomposition Workbench — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'novelDecompositionWorkbench',
  name: '小说拆解工作台',
  icon: '📖',
  category: 'tools',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: NovelDecompositionWorkbenchModal,
    mobileComponent: MobileNovelDecompositionWorkbenchModal,
    visibility: 'always',
    stateKey: 'showNovelDecompositionWorkbench',
    propsFactory: ({ state, actions, modalManager, requestConfirm }) => ({
      open: true,
      settings: state.apiConfig,
      onSave: actions.saveSettings,
      onClose: () => modalManager.close('novelDecompositionWorkbench'),
      requestConfirm,
      onNotify: actions.pushNotification,
    }),
  },
});

// Novel Writing Workbench — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'novelWritingWorkbench',
  name: '小说写作工作台',
  icon: '✍️',
  category: 'tools',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: NovelWritingWorkbenchModal,
    mobileComponent: MobileNovelWritingWorkbenchModal,
    visibility: 'always',
    propsFactory: ({ actions, modalManager }) => ({
      open: true,
      onClose: () => modalManager.close('novelWritingWorkbench'),
      onNotify: actions.pushNotification,
    }),
  },
});

// ============================================================================
// 娱乐
// ============================================================================

// CG Gallery — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'cgGallery',
  name: 'CG 画廊',
  icon: '🎨',
  category: 'entertainment',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: CGGalleryModal,
    mobileComponent: MobileCGGalleryModal,
    visibility: 'always',
    stateKey: 'showCGGallery',
    propsFactory: ({ setters, modalManager }) => ({
      onClose: () => {
        setters.setShowCGGallery?.(false);
        modalManager.close('cgGallery');
      },
    }),
  },
});

// Music — 已迁移到新系统
UIFeatureRegistry.register({
  id: 'music',
  name: '音乐',
  icon: '🎵',
  category: 'entertainment',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: MobileMusicPlayer,
    visibility: 'always',
    stateKey: 'showMobileMusic',
    propsFactory: ({ setters, modalManager }) => ({
      onClose: () => {        modalManager.close('music');
      },
    }),
  },
});

// ============================================================================
// 探索
// ============================================================================

// Map Explorer — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'mapExplorer',
  name: '地图探索',
  icon: '🗺️',
  category: 'core',
  priority: 85,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: MapExplorerModal,
    mobileComponent: MobileMapExplorerModal,
    visibility: 'always',
    stateKey: 'showMapExplorer',
    propsFactory: ({ state, actions, modalManager }) => {
      const bridge = (actions as any).explorationBridge;
      return {
        onClose: () => {
          (state as any).setShowMapExplorer?.(false);
          modalManager.close('mapExplorer');
        },
        onMove: async (nodeId: string) => {
          if (bridge?.moveTo) await bridge.moveTo(nodeId);
        },
        onExplore: () => { bridge?.explore?.(); },
        onRest: () => { bridge?.rest?.(); },
      };
    },
  },
});

// ============================================================================
// NSFW 模块
// ============================================================================

// CampusDesire — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'campusDesire',
  name: '校园欲望',
  icon: '🎭',
  category: 'nsfw',
  priority: 80,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: ['campusNSFW'],
  storyModuleId: 'campusNSFW',
  modal: {
    desktopComponent: CampusDesireDashboard,
    mobileComponent: MobileCampusDesireApp,
    visibility: 'config-dependent',
    configKey: '启用校园NSFW模式',
    configValue: true,
    propsFactory: ({ state, setters, actions, modalManager }) => {
      const 校园系统 = (state as any).校园系统 || {};
      const 欲望系统 = 校园系统.欲望系统 || {};
      const NPC欲望档案 = 欲望系统.NPC欲望档案 ?? {};
      const 社交 = (state as any).社交 || [];
      const NPC姓名映射 = Object.fromEntries(
        Object.keys(NPC欲望档案).map(id => {
          const npc = 社交.find((n: any) => n.id === id);
          return [id, npc?.姓名 ?? id];
        })
      );
      return {
        NPC欲望档案,
        后果列表: 欲望系统.后果列表 ?? [],
        里程碑数: Object.fromEntries(
          Object.entries(NPC欲望档案).map(([id]: [string, unknown]) => {
            const milestones = (欲望系统.里程碑列表 ?? []).filter(
              (m: any) => m.NPC姓名 === id || id.includes(m.NPC姓名)
            );
            return [id, milestones.length];
          })
        ),
        NPC姓名映射,
        onClose: () => {          modalManager.close('campusDesire');
        },
        onOpenBDSMRelationship: (npcId: string, npcName: string) => modalManager.open('bdsmRelationship', { npcId, npcName }),
        onOpenBDSMContract: (npcId: string, npcName: string) => modalManager.open('bdsmContract', { npcId, npcName }),
        onOpenBDSMSafety: (npcId: string, npcName: string) => modalManager.open('bdsmSafety', { npcId, npcName }),
        onGenerateTasks: (npcId: string, npcName: string) => { void (actions as any).requestBDSMTaskGeneration(npcId, npcName); },
        onGenerateDailyInstructions: (npcId: string, npcName: string) => { void (actions as any).requestBDSMDailyInstructions(npcId, npcName); },
        onCheckStageAdvance: (npcId: string, npcName: string) => { void (actions as any).requestBDSMStageAdvance(npcId, npcName); },
      };
    },
  },
});

// Photography — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'photography',
  name: '写真',
  icon: '📷',
  category: 'nsfw',
  priority: 75,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: [],
  modal: {
    desktopComponent: PhotographyDashboard,
    mobileComponent: MobilePhotographyDashboard,
    visibility: 'config-dependent',
    configKey: '启用写真NSFW模式',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => {
      const 写真系统 = (state as any).写真系统 || {};
      return {
        模特档案: 写真系统.模特档案 ?? {},
        摄影师档案: 写真系统.摄影师档案 ?? {},
        进行中的拍摄项目: 写真系统.进行中的拍摄项目 ?? [],
        历史拍摄记录: 写真系统.历史拍摄记录 ?? [],
        泄露事件列表: 写真系统.泄露事件列表 ?? [],
        onClose: () => {          modalManager.close('photography');
        },
      };
    },
  },
});

// UrbanDriver — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'urbanDriver',
  name: '网约车',
  icon: '🚗',
  category: 'nsfw',
  priority: 75,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: [],
  modal: {
    desktopComponent: UrbanDriverDashboard,
    mobileComponent: MobileUrbanDriverApp,
    visibility: 'config-dependent',
    configKey: '启用都市网约车NSFW模式',
    configValue: true,
    propsFactory: ({ state, setters, modalManager }) => ({
      都市网约车系统: (state as any).都市网约车系统,
      onClose: () => {        modalManager.close('urbanDriver');
      },
    }),
  },
});

// NsfwCenter — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'nsfwCenter',
  name: 'NSFW 控制台',
  icon: '🔞',
  category: 'nsfw',
  priority: 90,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: NsfwControlCenter,
    visibility: 'config-dependent',
    configKey: '启用NSFW模式',
    configValue: true,
    propsFactory: ({ state, actions, setters, modalManager }) => ({
      gameConfig: state.gameConfig,
      onSaveGame: (config: unknown) => (actions as any).saveGameSettings(config),
      onClose: () => {        modalManager.close('nsfwCenter');
      },
      onOpenDashboard: (moduleId: string) => {
        modalManager.close('nsfwCenter');
        if (moduleId === 'campusNSFW') modalManager.open('campusDesire');
        else if (moduleId === 'photographyNSFW') modalManager.open('photography');
        else if (moduleId === 'urbanDriverNSFW') modalManager.open('urbanDriver');
        else if (moduleId === 'boardGameNSFW') modalManager.open('boardGameDashboard');
      },
    }),
  },
});

// BoardGameDashboard — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'boardGameDashboard',
  name: '桌游面板',
  icon: '🎲',
  category: 'entertainment',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: BoardGameDashboard,
    mobileComponent: MobileBoardGameDashboard,
    visibility: 'always',
    stateKey: 'showBoardGameDashboard',
    stateKey: 'showNsfwCenter',
    stateKey: 'showUrbanDriver',
    stateKey: 'showPhotography',
    stateKey: 'showCampusDesire',
    propsFactory: ({ state, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      return {
        桌游状态: 欲望系统.桌游状态 ?? null,
        onClose: () => {
          (setters as any).setShowBoardGameDashboard?.(false);
          modalManager.close('boardGameDashboard');
        },
        onStartGame: (type: string) => {
          modalManager.close('boardGameDashboard');
          modalManager.open('boardGame', { type });
        },
      };
    },
  },
});

// BoardGame — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'boardGame',
  name: '桌游',
  icon: '🎲',
  category: 'entertainment',
  priority: 75,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: BoardGameModal,
    mobileComponent: MobileBoardGameModal,
    visibility: 'always',
    stateKey: 'showBoardGame',
    propsFactory: ({ state, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      return {
        多人局: 欲望系统.多人局 ?? null,
        桌游类型: 欲望系统.桌游状态?.桌游类型 ?? null,
        桌游状态: 欲望系统.桌游状态 ?? null,
        onClose: () => {
          (setters as any).setShowBoardGameModal?.(false);
          modalManager.close('boardGame');
        },
      };
    },
  },
});

// BDSMRelationship — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'bdsmRelationship',
  name: 'BDSM 关系',
  icon: '🔗',
  category: 'nsfw',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: BDSMRelationshipModal,
    visibility: 'always',
    propsFactory: ({ state, actions, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      const payload = modalManager.openModals?.get?.('bdsmRelationship') as { npcId: string; npcName: string } | null;
      if (!payload) return { onClose: () => modalManager.close('bdsmRelationship') };
      const 档案 = 欲望系统.NPC欲望档案?.[payload.npcId];
      return {
        关系状态: 档案?.BDSM关系,
        欲望档案: 档案,
        npcName: payload.npcName,
        日常指令: 档案?.BDSM关系?.日常指令 ?? [],
        onClose: () => {
          (setters as any).setShowBDSMRelationship?.(null);
          modalManager.close('bdsmRelationship');
        },
        onAcceptTask: (taskId: string) => (actions as any).updateBDSMTaskStatus(payload.npcId, taskId, '进行中'),
        onReportComplete: (taskId: string, desc: string) => { void (actions as any).requestBDSMTaskEvaluation(payload.npcId, taskId, desc || '已完成任务'); },
        onAbandonTask: (taskId: string) => (actions as any).updateBDSMTaskStatus(payload.npcId, taskId, '已放弃'),
        onGoToContract: () => {
          modalManager.close('bdsmRelationship');
          modalManager.open('bdsmContract', payload);
        },
        onEditSafety: () => {
          modalManager.close('bdsmRelationship');
          modalManager.open('bdsmSafety', payload);
        },
      };
    },
  },
});

// BDSMContract — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'bdsmContract',
  name: 'BDSM 契约',
  icon: '📜',
  category: 'nsfw',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: BDSMContractModal,
    visibility: 'always',
    propsFactory: ({ state, actions, setters, modalManager }) => {
      const 欲望系统 = ((state as any).校园系统?.欲望系统) || {};
      const payload = modalManager.openModals?.get?.('bdsmContract') as { npcId: string; npcName: string } | null;
      if (!payload) return { onClose: () => modalManager.close('bdsmContract') };
      const 档案 = 欲望系统.NPC欲望档案?.[payload.npcId];
      return {
        关系状态: 档案?.BDSM关系,
        onClose: () => {
          (setters as any).setShowBDSMContract?.(null);
          modalManager.close('bdsmContract');
        },
        onNegotiateContract: () => { void (actions as any).requestBDSMContractGeneration(payload.npcId, '书面契约'); },
        onDissolveContract: () => {
          if (档案?.BDSM关系?.契约记录?.length > 0) {
            const 最后契约 = 档案.BDSM关系.契约记录[档案.BDSM关系.契约记录.length - 1];
            (actions as any).updateContractStatus(payload.npcId, { ...最后契约, 状态: '已解除' });
          }
          modalManager.close('bdsmContract');
        },
      };
    },
  },
});

// BDSMSafety — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'bdsmSafety',
  name: 'BDSM 安全',
  icon: '🛡️',
  category: 'nsfw',
  priority: 70,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: BDSMSafetyModal,
    visibility: 'always',
    propsFactory: ({ state, setters, modalManager }) => {
      const 校园系统 = (state as any).校园系统 || {};
      const 欲望系统 = 校园系统.欲望系统 || {};
      const 校园状态 = 校园系统;
      const payload = modalManager.openModals?.get?.('bdsmSafety') as { npcId: string; npcName: string } | null;
      if (!payload) return { onClose: () => modalManager.close('bdsmSafety') };
      const 档案 = 欲望系统.NPC欲望档案?.[payload.npcId];
      return {
        关系状态: 档案?.BDSM关系,
        npcName: payload.npcName,
        onClose: () => {
          (setters as any).setShowBDSMSafety?.(null);
          modalManager.close('bdsmSafety');
        },
        onSave: (安全词: string, 底线: string[]) => {
          const NPC欲望档案 = 欲望系统.NPC欲望档案 || {};
          const 当前档案 = NPC欲望档案[payload.npcId];
          if (当前档案?.BDSM关系) {
            NPC欲望档案[payload.npcId] = {
              ...当前档案,
              BDSM关系: { ...当前档案.BDSM关系, 安全词, 底线列表: 底线 },
            };
            (setters as any).set校园系统?.({ ...校园状态, 欲望系统: { ...欲望系统, NPC欲望档案 } });
          }
          modalManager.close('bdsmSafety');
        },
      };
    },
  },
});

// ============================================================================
// 设备
// ============================================================================

// MobileDevice — 已迁移到新系统（完整 propsFactory）
UIFeatureRegistry.register({
  id: 'mobileDevice',
  name: '手机',
  icon: '📱',
  category: 'core',
  priority: 95,
  version: '1.1.0',
  eraId: 'contemporary',
  dependencies: [],
  modal: {
    desktopComponent: MobileDeviceModal,
    visibility: 'always',
    stateKey: 'showMobileDevice',
    gameViewOnly: true,
    propsFactory: ({ state, meta, setters, actions, modalManager }) => {
      const deviceState = (meta as any).deviceState;
      if (!deviceState?.isOpen) return null; // 未打开时不渲染

      return {
        eraId: (state.currentEra as string) || 'contemporary_urban',
        deviceState,
        onAppClick: (actions as any).openDeviceApp,
        onReturnHome: (actions as any).returnDeviceHome,
        onClose: () => {
          (actions as any).closeDevice?.();
          modalManager.close('mobileDevice');
        },
        gameContext: {
          角色: (state.角色 as any) || null,
          社交: (state.社交 as any[]) || [],
          世界: (state.世界 as any) || null,
          剧情: (state.剧情 as any) || null,
          历史记录: (state.历史记录 as any[]) || [],
          校规系统: (state as any).校规系统,
          催眠系统: (state as any).催眠系统,
          校园系统: (state as any).校园系统,
        },
        onRulesChange: (updater: any) => {
          const prev = (state as any).校规系统 || { 校规列表: [], 影响日志: [] };
          (setters as any).set校规系统?.(updater(prev));
        },
        onHypnosisChange: (updater: any) => {
          const prev = (state as any).催眠系统 || { 催眠记录列表: [], app等级: { 当前等级: 1, 已使用次数: 0, 升级阈值: 5, 解锁能力: [] }, 累计使用次数: 0 };
          (setters as any).set催眠系统?.(updater(prev));
        },
        onRefresh: (board: string) => {
          const activeApp = deviceState.activeApp;
          if (!activeApp) return;
          const hasPending = (meta as any).deviceRefreshQueue?.some(
            (t: any) => t.status === 'pending' || t.status === 'processing'
          );
          if (hasPending) return;
          const refreshApp = board === 'bdsn' ? 'bdsn' : activeApp;
          (setters as any).set设备刷新队列?.((prev: any[]) => [...prev, {
            id: `refresh-${Date.now()}`,
            app: refreshApp,
            status: 'pending' as const,
            创建时间: Date.now(),
          }]);
        },
        onSendMessage: (npcId: string, npcName: string, content: string) => {
          return (actions as any).handlePrivateChatSend?.(npcId, npcName, content).then((result: any) => {
            if (result.npcReply) {
              const prev = (state as any).校园系统;
              const 私聊列表 = prev?.私聊会话列表 || [];
              const 更新后列表 = 私聊列表.map((s: any) => {
                if (s.id === npcId) {
                  const newMsg = {
                    id: `msg-${Date.now()}`,
                    发送者: npcName,
                    内容: result.npcReply,
                    时间: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                    是否已读: false,
                  };
                  return { ...s, 消息列表: [...(s.消息列表 || []), newMsg], 最后消息: result.npcReply };
                }
                return s;
              });
              (setters as any).set校园系统?.({ ...prev, 私聊会话列表: 更新后列表 });
            }
            return result;
          });
        },
        onUnlockNPC: (newNpc: any) => {
          const prev = (state.社交 as any[]) || [];
          const exists = prev.some((npc: any) => npc.id === newNpc.id || npc.姓名 === newNpc.姓名);
          if (!exists) {
            (setters as any).set社交?.([...prev, newNpc]);
          }
        },
        onBDSM帖子更新: (帖子ID: string, updater: any) => {
          const campusSystem = (state as any).校园系统 || { BDSM帖子列表: [] };
          const updatedPosts = (campusSystem.BDSM帖子列表 || []).map((post: any) =>
            post.id === 帖子ID ? updater(post) : post
          );
          (setters as any).set校园系统?.({ ...campusSystem, BDSM帖子列表: updatedPosts });
        },
        onBDSM任务操作: (npcId: string, 操作: string, 任务ID: string, 执行描述: string) => {
          if (操作 === '接受') {
            (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '进行中');
          } else if (操作 === '报告完成') {
            (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '已完成');
            (actions as any).addBDSMMilestone?.(npcId, '任务完成', `完成调教任务：${执行描述 || 任务ID}`);
          } else if (操作 === '放弃') {
            (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '已放弃');
          }
        },
        onBDSM保存安全设置: (npcId: string, 安全词: string, 底线: string[]) => {
          const campusSystem = (state as any).校园系统 || {};
          const 欲望系统 = campusSystem.欲望系统 || {};
          const NPC欲望档案 = 欲望系统.NPC欲望档案 || {};
          const 档案 = NPC欲望档案[npcId];
          if (档案?.BDSM关系) {
            NPC欲望档案[npcId] = {
              ...档案,
              BDSM关系: {
                ...档案.BDSM关系,
                安全词,
                底线列表: 底线,
              },
            };
            (setters as any).set校园系统?.({
              ...campusSystem,
              欲望系统: { ...欲望系统, NPC欲望档案 },
            });
          }
        },
        onCreateChatSession: (npcId: string, npcName: string, 关系标签: string, 初始消息: string) => {
          const prev = (state as any).校园系统;
          const 私聊列表 = prev?.私聊会话列表 || [];
          const exists = 私聊列表.some((s: any) => s.id === npcId);
          if (!exists) {
            const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
            const 新会话 = {
              id: npcId,
              对方姓名: npcName,
              最后消息: 初始消息,
              最后时间: now,
              未读数: 1,
              消息列表: [{
                id: `init-${Date.now()}`,
                发送者: npcName,
                内容: 初始消息,
                时间: now,
                是否已读: false,
              }],
              关系类型: 关系标签,
            };
            const 欲望系统 = prev?.欲望系统 || {};
            const NPC欲望档案 = 欲望系统.NPC欲望档案 || {};
            if (!NPC欲望档案[npcId]) {
              NPC欲望档案[npcId] = {
                姓名: npcName,
                _npcName: npcName,
                BDSM关系: {
                  阶段: '初识',
                  服从度: 50,
                  权力天平: 0,
                  契约记录: [],
                  任务历史: [],
                  日常指令: [],
                  里程碑: [],
                  安全词: '月光',
                  底线列表: [],
                },
              };
              欲望系统.NPC欲望档案 = NPC欲望档案;
            }
            (setters as any).set校园系统?.({ ...prev, 私聊会话列表: [...私聊列表, 新会话], 欲望系统 });
          }
        },
        onConfirmNegotiation: (npcId: string, npcName: string, 协商结果: { 见面回合偏移: number; 见面地点: string; 安全词: string; 玩家底线: string[] }) => {
          const prev = (state as any).校园系统;
          const 预约列表 = prev?.见面预约列表 || [];
          const 当前回合 = ((state.历史记录 as any[])?.length ?? 0);
          const 新预约 = {
            npcId,
            npcName,
            见面回合偏移: 协商结果.见面回合偏移,
            见面地点: 协商结果.见面地点,
            安全词: 协商结果.安全词,
            玩家底线: 协商结果.玩家底线,
            状态: '已协商' as const,
            创建回合: 当前回合,
          };
          (setters as any).set校园系统?.({ ...prev, 见面预约列表: [...预约列表, 新预约] });

          const 现有约定 = (state.约定列表 as any[]) || [];
          const 新约定 = {
            对象: npcName,
            性质: '承诺' as const,
            标题: `${协商结果.见面地点}之约`,
            誓言内容: `与${npcName}相约于${协商结果.见面地点}，回合后相见。安全词：${协商结果.安全词}`,
            约定地点: 协商结果.见面地点,
            约定时间: `${当前回合 + 协商结果.见面回合偏移}回合后`,
            有效时段: 协商结果.见面回合偏移,
            当前状态: '等待中' as const,
            履行后果: `与${npcName}的见面达成，将开启一段特殊的亲密关系`,
            违约后果: `辜负了${npcName}的信任，关系将受到严重影响`,
            背景故事: `校园BDSM见面预约 | 安全词: ${协商结果.安全词}${协商结果.玩家底线.length > 0 ? ' | 玩家底线: ' + 协商结果.玩家底线.join('、') : ''}`,
          };
          (setters as any).set约定列表?.([...现有约定, 新约定]);
        },
        apiConfig: state.apiConfig as any,
        installedApps: (state as any).设备已安装App,
        nsfwEnabled: (state as any).gameConfig?.启用NSFW模式,
        maxNsfwLevel: (state as any).gameConfig?.最大NSFWLevel ?? 0,
        onInstallApp: (appId: string) => (actions as any).安装App?.(appId),
        onUninstallApp: (appId: string) => (actions as any).卸载App?.(appId),
      };
    },
  },
});

// ============================================================================
// New Game (特殊：仅在 new_game 视图显示，由 App.tsx 直接渲染)
// ============================================================================

UIFeatureRegistry.register({
  id: 'newGameWizard',
  name: '新游戏向导',
  icon: '🎮',
  category: 'core',
  priority: 100,
  version: '1.1.0',
  dependencies: [],
  modal: {
    desktopComponent: NewGameWizard,
    mobileComponent: MobileNewGameWizard,
    visibility: 'hidden', // 由 App.tsx 直接渲染，不通过 ModalRenderer
    propsFactory: () => ({}),
  },
});
