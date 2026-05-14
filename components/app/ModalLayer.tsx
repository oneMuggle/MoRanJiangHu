/**
 * ModalLayer.tsx
 *
 * 提取 App 中的通用弹窗渲染逻辑。
 * 包含：SaveLoad、Settings、WorldbookManager、NovelDecomposition、NovelWriting、
 *       ConfirmModal、ImageManager、Inventory、Character、Equipment、Battle、Team、
 *       Social、Kungfu、World、Map、Sect、Task、Agreement、Story、HeroinePlan、
 *       Memory、MobileDevice。
 */

import * as React from 'react';
import { 获取时代主题方案, 全部时代配置 } from '../../models/system';
import { desktopTabs, mobileTabs } from '../features/Settings/tabDefinitions';
import {
    懒加载边界,
    CharacterModal,
    MobileCharacter,
    SettingsPanel,
    InventoryModal,
    MobileInventoryModal,
    EquipmentModal,
    MobileEquipmentModal,
    BattleModal,
    MobileBattleModal,
    SocialModal,
    MobileSocial,
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
    SaveLoadModal,
    MobileSaveLoadModal,
    WorldbookManagerModal,
    MobileWorldbookManagerModal,
    NovelDecompositionWorkbenchModal,
    MobileNovelDecompositionWorkbenchModal,
    NovelWritingWorkbenchModal,
    MobileNovelWritingWorkbenchModal,
    ImageManagerModal,
    MobileImageManagerModal,
    MobileDeviceModal,
    CGGalleryModal,
    MobileCGGalleryModal,
    MapExplorerModal,
    MobileMapExplorerModal,
} from '../features/lazyComponents';

// ============================================================================
// 类型
// ============================================================================

interface ModalLayerProps {
    state: Record<string, unknown>;
    meta: Record<string, unknown>;
    setters: Record<string, unknown>;
    actions: Record<string, unknown>;
    isMobile: boolean;
    enable修炼体系: boolean;
    当前剧情规划: unknown;
    当前女主剧情规划: unknown;
    enable同人模式: boolean;
    currentEnvTime: string;
    runtimeStateSections: unknown;
    contextSnapshot: unknown;
    showCharacter: boolean;
    showImageManager: boolean;
    showWorldbookManager: boolean;
    showNovelDecompositionWorkbench: boolean;
    showNovelWritingWorkbench: boolean;
    requestConfirm: (options: any) => Promise<boolean>;
    // openers
    closeSettings: () => void;
    closeNovelDecompositionWorkbench: () => void;
    closeNovelWritingWorkbench: () => void;
    closeSaveLoad: () => void;
    handleReturnToHomeFromSettings: () => void;
    // setters (direct)
    setShowCharacter: (v: React.SetStateAction<boolean>) => void;
    setShowImageManager: (v: React.SetStateAction<boolean>) => void;
    setShowWorldbookManager: (v: React.SetStateAction<boolean>) => void;
    setShowNovelDecompositionWorkbench: (v: React.SetStateAction<boolean>) => void;
    setShowNovelWritingWorkbench: (v: React.SetStateAction<boolean>) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ModalLayer({
    state,
    meta,
    setters,
    actions,
    isMobile,
    enable修炼体系,
    当前剧情规划,
    当前女主剧情规划,
    enable同人模式,
    currentEnvTime,
    runtimeStateSections,
    contextSnapshot,
    showCharacter,
    showImageManager,
    showWorldbookManager,
    showNovelDecompositionWorkbench,
    showNovelWritingWorkbench,
    requestConfirm,
    closeSettings,
    closeNovelDecompositionWorkbench,
    closeNovelWritingWorkbench,
    closeSaveLoad,
    handleReturnToHomeFromSettings,
    setShowCharacter,
    setShowImageManager,
    setShowWorldbookManager,
    setShowNovelDecompositionWorkbench,
    setShowNovelWritingWorkbench,
}: ModalLayerProps) {
    return (
        <>
            {/* Global Golden Border Frame */}
            <div className="pointer-events-none fixed inset-2 md:inset-3 z-[100] border-[3px] md:border-4 border-double border-wuxia-gold/40 rounded-xl md:rounded-2xl shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                {/* Corner Ornaments */}
                <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t-[3px] md:border-t-4 border-l-[3px] md:border-l-4 border-wuxia-gold rounded-tl-lg md:rounded-tl-xl shadow-[-2px_-2px_5px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t-[3px] md:border-t-4 border-r-[3px] md:border-r-4 border-wuxia-gold rounded-tr-lg md:rounded-tr-xl shadow-[2px_-2px_5px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 border-b-[3px] md:border-b-4 border-l-[3px] md:border-l-4 border-wuxia-gold rounded-bl-lg md:rounded-bl-xl shadow-[-2px_2px_5px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b-[3px] md:border-b-4 border-r-[3px] md:border-r-4 border-wuxia-gold rounded-br-lg md:rounded-br-xl shadow-[2px_2px_5px_rgba(0,0,0,0.5)]"></div>

                {/* Mid-point Accents */}
                <div className="absolute top-1/2 left-0 w-1 h-12 -translate-y-1/2 bg-wuxia-gold/60"></div>
                <div className="absolute top-1/2 right-0 w-1 h-12 -translate-y-1/2 bg-wuxia-gold/60"></div>
            </div>

            {/* Save/Load Modal */}
            {((state.showSaveLoad as any)?.show) && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileSaveLoadModal
                            onClose={closeSaveLoad}
                            onLoadGame={(actions as any).handleLoadGame}
                            onSaveGame={(actions as any).handleSaveGame}
                            mode={(state.showSaveLoad as any).mode}
                            requestConfirm={requestConfirm}
                        />
                    ) : (
                        <SaveLoadModal
                            onClose={closeSaveLoad}
                            onLoadGame={(actions as any).handleLoadGame}
                            onSaveGame={(actions as any).handleSaveGame}
                            mode={(state.showSaveLoad as any).mode}
                            requestConfirm={requestConfirm}
                        />
                    )}
                </懒加载边界>
            )}

            {/* Settings Modal */}
            {(state.showSettings as boolean) && (
                <懒加载边界>
                    <SettingsPanel
                        navMode={isMobile ? 'pills' : 'sidebar'}
                        tabs={isMobile ? mobileTabs : desktopTabs}
                        activeTab={state.activeTab as any}
                        onTabChange={(setters as any).setActiveTab as any}
                        onClose={closeSettings}
                        apiConfig={state.apiConfig}
                        visualConfig={state.visualConfig}
                        gameConfig={state.gameConfig}
                        memoryConfig={state.memoryConfig}
                        prompts={state.prompts}
                        festivals={state.festivals}
                        currentTheme={state.currentTheme}
                        currentEra={state.currentEra}
                        eraInfo={(meta as any).eraInfo}
                        eraTheme={state.currentEra ? 获取时代主题方案(state.currentEra as string) : undefined}
                        availableEras={全部时代配置}
                        onEraChange={(actions as any).handleEraChange}
                        history={state.历史记录}
                        memorySystem={state.记忆系统}
                        socialList={state.社交}
                        runtimeState={runtimeStateSections}
                        currentStory={state.剧情}
                        openingConfig={state.开局配置}
                        contextSnapshot={contextSnapshot}
                        onSaveApi={(actions as any).saveSettings}
                        onSaveVisual={(actions as any).saveVisualSettings}
                        onSaveGame={(actions as any).saveGameSettings}
                        onSaveMemory={(actions as any).saveMemorySettings}
                        onCreateNpc={(actions as any).createNpcManually}
                        onSaveNpc={(actions as any).updateNpcManually}
                        onDeleteNpc={(actions as any).deleteNpcManually}
                        onStartNpcMemorySummary={(actions as any).handleQueueManualNpcMemorySummary}
                        onUploadNpcImage={(actions as any).uploadNpcImageToSlot}
                        onReplaceVariableSection={(actions as any).updateRuntimeVariableSection}
                        onApplyVariableCommand={(actions as any).applyRuntimeVariableCommand}
                        onUpdatePrompts={(actions as any).updatePrompts}
                        onUpdateFestivals={(actions as any).updateFestivals}
                        onThemeChange={(setters as any).setCurrentTheme}
                        requestConfirm={requestConfirm}
                        onReturnToHome={handleReturnToHomeFromSettings}
                        isHome={state.view === 'home'}
                    />
                </懒加载边界>
            )}

            {/* Worldbook Manager */}
            {showWorldbookManager && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileWorldbookManagerModal
                            builtinPromptEntries={(meta as any).builtinPromptEntries}
                            worldbooks={(meta as any).worldbooks}
                            worldbookPresetGroups={(meta as any).worldbookPresetGroups}
                            onSaveBuiltinPromptEntries={(actions as any).saveBuiltinPromptEntries}
                            onSaveWorldbooks={(actions as any).saveWorldbooks}
                            onSaveWorldbookPresetGroups={(actions as any).saveWorldbookPresetGroups}
                            onClose={() => setShowWorldbookManager(false)}
                            requestConfirm={requestConfirm}
                        />
                    ) : (
                        <WorldbookManagerModal
                            builtinPromptEntries={(meta as any).builtinPromptEntries}
                            worldbooks={(meta as any).worldbooks}
                            worldbookPresetGroups={(meta as any).worldbookPresetGroups}
                            onSaveBuiltinPromptEntries={(actions as any).saveBuiltinPromptEntries}
                            onSaveWorldbooks={(actions as any).saveWorldbooks}
                            onSaveWorldbookPresetGroups={(actions as any).saveWorldbookPresetGroups}
                            onClose={() => setShowWorldbookManager(false)}
                            requestConfirm={requestConfirm}
                        />
                    )}
                </懒加载边界>
            )}

            {/* Novel Decomposition Workbench */}
            {showNovelDecompositionWorkbench && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileNovelDecompositionWorkbenchModal
                            open={true}
                            settings={state.apiConfig}
                            onSave={(actions as any).saveSettings}
                            onClose={closeNovelDecompositionWorkbench}
                            requestConfirm={requestConfirm}
                            onNotify={(actions as any).pushNotification}
                        />
                    ) : (
                        <NovelDecompositionWorkbenchModal
                            open={true}
                            settings={state.apiConfig}
                            onSave={(actions as any).saveSettings}
                            onClose={closeNovelDecompositionWorkbench}
                            requestConfirm={requestConfirm}
                            onNotify={(actions as any).pushNotification}
                        />
                    )}
                </懒加载边界>
            )}

            {/* Novel Writing Workbench */}
            {showNovelWritingWorkbench && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileNovelWritingWorkbenchModal
                            open={true}
                            onClose={closeNovelWritingWorkbench}
                            onNotify={(actions as any).pushNotification}
                        />
                    ) : (
                        <NovelWritingWorkbenchModal
                            open={true}
                            onClose={closeNovelWritingWorkbench}
                            onNotify={(actions as any).pushNotification}
                        />
                    )}
                </懒加载边界>
            )}

            {/* Image Manager */}
            {showImageManager && (
                <懒加载边界>
                    {isMobile ? (
                        <MobileImageManagerModal
                            socialList={state.社交}
                            cultivationSystemEnabled={enable修炼体系}
                            queue={(meta as any).imageGenerationQueue || []}
                            sceneArchive={(meta as any).sceneImageArchive || {}}
                            sceneQueue={(meta as any).sceneImageQueue || []}
                            apiConfig={state.apiConfig}
                            imageManagerConfig={state.imageManagerConfig}
                            currentPersistentWallpaper={(state.visualConfig as any)?.常驻壁纸 || ''}
                            onSaveApiConfig={(actions as any).saveSettings}
                            onSaveImageManagerConfig={(actions as any).saveImageManagerSettings}
                            onGenerateImage={(actions as any).generateNpcImageManually}
                            onGenerateSecretPartImage={(actions as any).generateNpcSecretPartImage}
                            onRetryImage={(actions as any).retryNpcImageGeneration}
                            onGenerateSceneImage={(actions as any).generateSceneImageManually}
                            onSelectAvatarImage={(actions as any).selectNpcAvatarImage}
                            onSelectPortraitImage={(actions as any).selectNpcPortraitImage}
                            onSelectBackgroundImage={(actions as any).selectNpcBackgroundImage}
                            onClearAvatarImage={(actions as any).clearNpcAvatarImage}
                            onClearPortraitImage={(actions as any).clearNpcPortraitImage}
                            onClearBackgroundImage={(actions as any).clearNpcBackgroundImage}
                            onDeleteImageRecord={(actions as any).removeNpcImageRecord}
                            onClearImageHistory={(actions as any).clearNpcImageHistory}
                            onDeleteQueueTask={(actions as any).removeNpcImageQueueTask}
                            onClearQueue={(actions as any).clearNpcImageQueue}
                            onSaveImageLocally={(actions as any).saveNpcImageLocally}
                            onApplySceneWallpaper={(actions as any).applySceneImageWallpaper}
                            onClearSceneWallpaper={(actions as any).clearSceneWallpaper}
                            onDeleteSceneImage={(actions as any).removeSceneImageRecord}
                            onClearSceneHistory={(actions as any).clearSceneImageHistory}
                            onDeleteSceneQueueTask={(actions as any).removeSceneImageQueueTask}
                            onClearSceneQueue={(actions as any).clearSceneImageQueue}
                            onSaveSceneImageLocally={(actions as any).saveSceneImageLocally}
                            onSetPersistentWallpaper={(actions as any).setPersistentWallpaper}
                            onClearPersistentWallpaper={(actions as any).clearPersistentWallpaper}
                            onSavePngStylePreset={(actions as any).savePngStylePreset}
                            onDeletePngStylePreset={(actions as any).deletePngStylePreset}
                            onSetCurrentPngStylePreset={(actions as any).setCurrentPngStylePreset}
                            onParsePngStylePreset={(actions as any).parsePngStylePreset}
                            onExportPngStylePresets={(actions as any).exportPngStylePresets}
                            onImportPngStylePresets={(actions as any).importPngStylePresets}
                            onSaveCharacterAnchor={(actions as any).saveCharacterAnchor}
                            onDeleteCharacterAnchor={(actions as any).deleteCharacterAnchor}
                            onExtractCharacterAnchor={(actions as any).extractCharacterAnchor}
                            onClose={() => setShowImageManager(false)}
                            onSaveArtistPreset={(actions as any).saveArtistPreset}
                            onDeleteArtistPreset={(actions as any).deleteArtistPreset}
                            onSaveModelConverterPreset={(actions as any).saveModelConverterPreset}
                            onDeleteModelConverterPreset={(actions as any).deleteModelConverterPreset}
                            onSetModelConverterPresetEnabled={(actions as any).setModelConverterPresetEnabled}
                            onSavePromptConverterPreset={(actions as any).savePromptConverterPreset}
                            onDeletePromptConverterPreset={(actions as any).deletePromptConverterPreset}
                            onImportPresets={(actions as any).importPresets}
                            onExportPresets={(actions as any).exportPresets}
                        />
                    ) : (
                        <ImageManagerModal
                            socialList={state.社交}
                            cultivationSystemEnabled={enable修炼体系}
                            queue={(meta as any).imageGenerationQueue || []}
                            sceneArchive={(meta as any).sceneImageArchive || {}}
                            sceneQueue={(meta as any).sceneImageQueue || []}
                            apiConfig={state.apiConfig}
                            imageManagerConfig={state.imageManagerConfig}
                            currentPersistentWallpaper={(state.visualConfig as any)?.常驻壁纸 || ''}
                            onSaveApiConfig={(actions as any).saveSettings}
                            onSaveImageManagerConfig={(actions as any).saveImageManagerSettings}
                            onGenerateImage={(actions as any).generateNpcImageManually}
                            onGenerateSecretPartImage={(actions as any).generateNpcSecretPartImage}
                            onRetryImage={(actions as any).retryNpcImageGeneration}
                            onGenerateSceneImage={(actions as any).generateSceneImageManually}
                            onSelectAvatarImage={(actions as any).selectNpcAvatarImage}
                            onSelectPortraitImage={(actions as any).selectNpcPortraitImage}
                            onSelectBackgroundImage={(actions as any).selectNpcBackgroundImage}
                            onClearAvatarImage={(actions as any).clearNpcAvatarImage}
                            onClearPortraitImage={(actions as any).clearNpcPortraitImage}
                            onClearBackgroundImage={(actions as any).clearNpcBackgroundImage}
                            onDeleteImageRecord={(actions as any).removeNpcImageRecord}
                            onClearImageHistory={(actions as any).clearNpcImageHistory}
                            onDeleteQueueTask={(actions as any).removeNpcImageQueueTask}
                            onClearQueue={(actions as any).clearNpcImageQueue}
                            onSaveImageLocally={(actions as any).saveNpcImageLocally}
                            onApplySceneWallpaper={(actions as any).applySceneImageWallpaper}
                            onClearSceneWallpaper={(actions as any).clearSceneWallpaper}
                            onDeleteSceneImage={(actions as any).removeSceneImageRecord}
                            onClearSceneHistory={(actions as any).clearSceneImageHistory}
                            onDeleteSceneQueueTask={(actions as any).removeSceneImageQueueTask}
                            onClearSceneQueue={(actions as any).clearSceneImageQueue}
                            onSaveSceneImageLocally={(actions as any).saveSceneImageLocally}
                            onSetPersistentWallpaper={(actions as any).setPersistentWallpaper}
                            onClearPersistentWallpaper={(actions as any).clearPersistentWallpaper}
                            onSavePngStylePreset={(actions as any).savePngStylePreset}
                            onDeletePngStylePreset={(actions as any).deletePngStylePreset}
                            onSetCurrentPngStylePreset={(actions as any).setCurrentPngStylePreset}
                            onParsePngStylePreset={(actions as any).parsePngStylePreset}
                            onExportPngStylePresets={(actions as any).exportPngStylePresets}
                            onImportPngStylePresets={(actions as any).importPngStylePresets}
                            onSaveCharacterAnchor={(actions as any).saveCharacterAnchor}
                            onDeleteCharacterAnchor={(actions as any).deleteCharacterAnchor}
                            onExtractCharacterAnchor={(actions as any).extractCharacterAnchor}
                            onClose={() => setShowImageManager(false)}
                        />
                    )}
                </懒加载边界>
            )}

            {/* In-Game Modals */}
            {state.view === 'game' && (
                <>
                    {(state.showInventory as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileInventoryModal
                                    character={state.角色}
                                    onClose={() => (setters as any).setShowInventory?.(false)}
                                />
                            ) : (
                                <InventoryModal
                                    character={state.角色}
                                    onClose={() => (setters as any).setShowInventory?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {showCharacter && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileCharacter
                                    character={state.角色}
                                    gameConfig={state.gameConfig}
                                    apiConfig={state.apiConfig}
                                    playerAnchor={(actions as any).getPlayerCharacterAnchor?.() || null}
                                    onGeneratePlayerImage={(actions as any).generatePlayerImageManually}
                                    onSelectPlayerAvatarImage={(actions as any).selectPlayerAvatarImage}
                                    onClearPlayerAvatarImage={(actions as any).clearPlayerAvatarImage}
                                    onSelectPlayerPortraitImage={(actions as any).selectPlayerPortraitImage}
                                    onClearPlayerPortraitImage={(actions as any).clearPlayerPortraitImage}
                                    onRemovePlayerImageRecord={(actions as any).removePlayerImageRecord}
                                    onClose={() => setShowCharacter(false)}
                                />
                            ) : (
                                <CharacterModal
                                    character={state.角色}
                                    onClose={() => setShowCharacter(false)}
                                    visualConfig={state.visualConfig}
                                    apiConfig={state.apiConfig}
                                    playerAnchor={(actions as any).getPlayerCharacterAnchor?.() || null}
                                    onGeneratePlayerImage={(actions as any).generatePlayerImageManually}
                                    onExtractPlayerAnchor={(actions as any).extractPlayerCharacterAnchor}
                                    onSavePlayerAnchor={(actions as any).saveCharacterAnchor}
                                    onDeletePlayerAnchor={(actions as any).deleteCharacterAnchor}
                                    onSelectPlayerAvatarImage={(actions as any).selectPlayerAvatarImage}
                                    onClearPlayerAvatarImage={(actions as any).clearPlayerAvatarImage}
                                    onSelectPlayerPortraitImage={(actions as any).selectPlayerPortraitImage}
                                    onClearPlayerPortraitImage={(actions as any).clearPlayerPortraitImage}
                                    onRemovePlayerImageRecord={(actions as any).removePlayerImageRecord}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showEquipment as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileEquipmentModal
                                    character={state.角色}
                                    onClose={() => (setters as any).setShowEquipment?.(false)}
                                />
                            ) : (
                                <EquipmentModal
                                    character={state.角色}
                                    onClose={() => (setters as any).setShowEquipment?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showBattle as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileBattleModal
                                    character={state.角色}
                                    battle={state.战斗}
                                    onClose={() => (setters as any).setShowBattle?.(false)}
                                />
                            ) : (
                                <BattleModal
                                    character={state.角色}
                                    battle={state.战斗}
                                    onClose={() => (setters as any).setShowBattle?.(false)}
                                    onAction={() => {}}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showTeam as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileTeamModal
                                    character={state.角色}
                                    teammates={state.社交}
                                    onClose={() => (setters as any).setShowTeam?.(false)}
                                />
                            ) : (
                                <TeamModal
                                    character={state.角色}
                                    teammates={state.社交}
                                    onClose={() => (setters as any).setShowTeam?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showSocial as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileSocial
                                    socialList={state.社交}
                                    cultivationSystemEnabled={enable修炼体系}
                                    onClose={() => (setters as any).setShowSocial?.(false)}
                                    playerName={(state.角色 as any)?.姓名}
                                    nsfwEnabled={(state.gameConfig as any)?.启用NSFW模式 === true}
                                    onToggleMajorRole={(actions as any).updateNpcMajorRole}
                                    onTogglePresence={(actions as any).updateNpcPresence}
                                    onDeleteNpc={(actions as any).removeNpc}
                                    欲望系统={(state as any).校园系统?.欲望系统}
                                    onOpenCampusDesire={() => (actions as any).openCampusDesire?.()}
                                    关系谱={(state as any).关系谱}
                                />
                            ) : (
                                <SocialModal
                                    socialList={state.社交}
                                    cultivationSystemEnabled={enable修炼体系}
                                    onClose={() => (setters as any).setShowSocial?.(false)}
                                    playerName={(state.角色 as any)?.姓名}
                                    nsfwEnabled={(state.gameConfig as any)?.启用NSFW模式 === true}
                                    onToggleMajorRole={(actions as any).updateNpcMajorRole}
                                    onTogglePresence={(actions as any).updateNpcPresence}
                                    onDeleteNpc={(actions as any).removeNpc}
                                    欲望系统={(state as any).校园系统?.欲望系统}
                                    onOpenCampusDesire={() => (actions as any).openCampusDesire?.()}
                                    关系谱={(state as any).关系谱}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {enable修炼体系 && (state.showKungfu as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileKungfuModal
                                    skills={(state.角色 as any)?.功法列表}
                                    onClose={() => (setters as any).setShowKungfu?.(false)}
                                />
                            ) : (
                                <KungfuModal
                                    skills={(state.角色 as any)?.功法列表}
                                    onClose={() => (setters as any).setShowKungfu?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showWorld as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileWorldModal
                                    world={state.世界}
                                    worldEvolutionEnabled={(meta as any).worldEvolutionEnabled}
                                    worldEvolutionUpdating={(meta as any).worldEvolutionUpdating}
                                    worldEvolutionStatus={(meta as any).worldEvolutionStatus}
                                    worldEvolutionLastUpdatedAt={(meta as any).worldEvolutionLastUpdatedAt}
                                    worldEvolutionLastSummary={(meta as any).worldEvolutionLastSummary}
                                    worldEvolutionLastRawText={(meta as any).worldEvolutionLastRawText}
                                    onForceUpdate={(actions as any).handleForceWorldEvolutionUpdate}
                                    onClose={() => (setters as any).setShowWorld?.(false)}
                                />
                            ) : (
                                <WorldModal
                                    world={state.世界}
                                    worldEvolutionEnabled={(meta as any).worldEvolutionEnabled}
                                    worldEvolutionUpdating={(meta as any).worldEvolutionUpdating}
                                    worldEvolutionStatus={(meta as any).worldEvolutionStatus}
                                    worldEvolutionLastUpdatedAt={(meta as any).worldEvolutionLastUpdatedAt}
                                    worldEvolutionLastSummary={(meta as any).worldEvolutionLastSummary}
                                    worldEvolutionLastRawText={(meta as any).worldEvolutionLastRawText}
                                    onForceUpdate={(actions as any).handleForceWorldEvolutionUpdate}
                                    onClose={() => (setters as any).setShowWorld?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showMap as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileMapModal
                                    world={state.世界}
                                    env={state.环境}
                                    character={state.角色}
                                    onTravel={(actions as any).handleTravel}
                                    onExplore={(actions as any).handleExplore}
                                    travelEvents={(actions as any).travelEvents}
                                    onClose={() => (setters as any).setShowMap?.(false)}
                                />
                            ) : (
                                <MapModal
                                    world={state.世界}
                                    env={state.环境}
                                    character={state.角色}
                                    onTravel={(actions as any).handleTravel}
                                    onExplore={(actions as any).handleExplore}
                                    travelEvents={(actions as any).travelEvents}
                                    onClose={() => (setters as any).setShowMap?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showSect as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileSect
                                    sectData={state.玩家门派}
                                    currentTime={currentEnvTime}
                                    onClose={() => (setters as any).setShowSect?.(false)}
                                />
                            ) : (
                                <SectModal
                                    sectData={state.玩家门派}
                                    currentTime={currentEnvTime}
                                    onClose={() => (setters as any).setShowSect?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showTask as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileTask
                                    tasks={state.任务列表}
                                    onDeleteTask={(actions as any).removeTask}
                                    onClose={() => (setters as any).setShowTask?.(false)}
                                />
                            ) : (
                                <TaskModal
                                    tasks={state.任务列表}
                                    onDeleteTask={(actions as any).removeTask}
                                    onClose={() => (setters as any).setShowTask?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showAgreement as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileAgreementModal
                                    agreements={state.约定列表}
                                    onDeleteAgreement={(actions as any).removeAgreement}
                                    onClose={() => (setters as any).setShowAgreement?.(false)}
                                />
                            ) : (
                                <AgreementModal
                                    agreements={state.约定列表}
                                    onDeleteAgreement={(actions as any).removeAgreement}
                                    onClose={() => (setters as any).setShowAgreement?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showStory as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileStory
                                    story={state.剧情}
                                    storyPlan={当前剧情规划}
                                    isFandomMode={enable同人模式}
                                    onClose={() => (setters as any).setShowStory?.(false)}
                                />
                            ) : (
                                <StoryModal
                                    story={state.剧情}
                                    storyPlan={当前剧情规划}
                                    isFandomMode={enable同人模式}
                                    onClose={() => (setters as any).setShowStory?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showHeroinePlan as boolean) && (state.gameConfig as any)?.启用女主剧情规划 === true && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileHeroinePlanModal
                                    plan={当前女主剧情规划}
                                    isFandomMode={enable同人模式}
                                    onClose={() => (setters as any).setShowHeroinePlan?.(false)}
                                />
                            ) : (
                                <HeroinePlanModal
                                    plan={当前女主剧情规划}
                                    isFandomMode={enable同人模式}
                                    onClose={() => (setters as any).setShowHeroinePlan?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {(state.showMemory as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileMemory
                                    history={state.历史记录}
                                    memorySystem={state.记忆系统}
                                    onClose={() => (setters as any).setShowMemory?.(false)}
                                    currentTime={currentEnvTime}
                                    onSaveMemory={(actions as any).updateMemorySystem}
                                    onStartMemorySummary={(actions as any).handleStartManualMemorySummary}
                                />
                            ) : (
                                <MemoryModal
                                    history={state.历史记录}
                                    memorySystem={state.记忆系统}
                                    onClose={() => (setters as any).setShowMemory?.(false)}
                                    currentTime={currentEnvTime}
                                    onSaveMemory={(actions as any).updateMemorySystem}
                                    onStartMemorySummary={(actions as any).handleStartManualMemorySummary}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {/* CG Gallery Modal */}
                    {(state.showCGGallery as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileCGGalleryModal
                                    onClose={() => (setters as any).setShowCGGallery?.(false)}
                                />
                            ) : (
                                <CGGalleryModal
                                    onClose={() => (setters as any).setShowCGGallery?.(false)}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {/* Map Explorer Modal */}
                    {(state.showMapExplorer as boolean) && (
                        <懒加载边界>
                            {isMobile ? (
                                <MobileMapExplorerModal
                                    onClose={() => (setters as any).setShowMapExplorer?.(false)}
                                    onMove={async (nodeId: string) => {
                                        const bridge = (actions as any).explorationBridge;
                                        if (bridge?.moveTo) await bridge.moveTo(nodeId);
                                    }}
                                />
                            ) : (
                                <MapExplorerModal
                                    onClose={() => (setters as any).setShowMapExplorer?.(false)}
                                    onMove={async (nodeId: string) => {
                                        const bridge = (actions as any).explorationBridge;
                                        if (bridge?.moveTo) await bridge.moveTo(nodeId);
                                    }}
                                />
                            )}
                        </懒加载边界>
                    )}

                    {/* Mobile Device Modal */}
                    {((meta as any).deviceState?.isOpen) && (
                        <懒加载边界>
                            <MobileDeviceModal
                                eraId={(state.currentEra as string) || 'contemporary_urban'}
                                deviceState={(meta as any).deviceState}
                                onAppClick={(actions as any).openDeviceApp}
                                onReturnHome={(actions as any).returnDeviceHome}
                                onClose={(actions as any).closeDevice}
                                gameContext={{
                                    角色: (state.角色 as any) || null,
                                    社交: (state.社交 as any[]) || [],
                                    世界: (state.世界 as any) || null,
                                    剧情: (state.剧情 as any) || null,
                                    历史记录: (state.历史记录 as any[]) || [],
                                    校规系统: (state as any).校规系统,
                                    催眠系统: (state as any).催眠系统,
                                    校园系统: (state as any).校园系统,
                                }}
                                onRulesChange={(updater: any) => {
                                    const prev = (state as any).校规系统 || { 校规列表: [], 影响日志: [] };
                                    (setters as any).set校规系统?.(updater(prev));
                                }}
                                onHypnosisChange={(updater: any) => {
                                    const prev = (state as any).催眠系统 || { 催眠记录列表: [], app等级: { 当前等级: 1, 已使用次数: 0, 升级阈值: 5, 解锁能力: [] }, 累计使用次数: 0 };
                                    (setters as any).set催眠系统?.(updater(prev));
                                }}
                                onRefresh={(board: string) => {
                                    const activeApp = (meta as any).deviceState.activeApp;
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
                                }}
                                onSendMessage={(npcId: string, npcName: string, content: string) => {
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
                                }}
                                onUnlockNPC={(newNpc: any) => {
                                    const prev = (state.社交 as any[]) || [];
                                    const exists = prev.some((npc: any) => npc.id === newNpc.id || npc.姓名 === newNpc.姓名);
                                    if (!exists) {
                                        (setters as any).set社交?.([...prev, newNpc]);
                                    }
                                }}
                                onBDSM帖子更新={(帖子ID: string, updater: any) => {
                                    const campusSystem = (state as any).校园系统 || { BDSM帖子列表: [] };
                                    const updatedPosts = (campusSystem.BDSM帖子列表 || []).map((post: any) =>
                                        post.id === 帖子ID ? updater(post) : post
                                    );
                                    (setters as any).set校园系统?.({ ...campusSystem, BDSM帖子列表: updatedPosts });
                                }}
                                onBDSM任务操作={(npcId: string, 操作: string, 任务ID: string, 执行描述: string) => {
                                    if (操作 === '接受') {
                                        (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '进行中');
                                    } else if (操作 === '报告完成') {
                                        (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '已完成');
                                        (actions as any).addBDSMMilestone?.(npcId, '任务完成', `完成调教任务：${执行描述 || 任务ID}`);
                                    } else if (操作 === '放弃') {
                                        (actions as any).updateBDSMTaskStatus?.(npcId, 任务ID, '已放弃');
                                    }
                                }}
                                onBDSM保存安全设置={(npcId: string, 安全词: string, 底线: string[]) => {
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
                                            欲望系统: {
                                                ...欲望系统,
                                                NPC欲望档案,
                                            },
                                        });
                                    }
                                }}
                                onCreateChatSession={(npcId: string, npcName: string, 关系标签: string, 初始消息: string) => {
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
                                }}
                                onConfirmNegotiation={(npcId: string, npcName: string, 协商结果: { 见面回合偏移: number; 见面地点: string; 安全词: string; 玩家底线: string[] }) => {
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
                                }}
                                apiConfig={state.apiConfig as any}
                                installedApps={(state as any).设备已安装App}
                                nsfwEnabled={(state as any).gameConfig?.启用NSFW模式}
                                maxNsfwLevel={(state as any).gameConfig?.最大NSFW等级 ?? 0}
                                onInstallApp={(appId: string) => (actions as any).安装App?.(appId)}
                                onUninstallApp={(appId: string) => (actions as any).卸载App?.(appId)}
                            />
                        </懒加载边界>
                    )}
                </>
            )}
        </>
    );
}
