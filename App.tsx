import React from 'react';
import LandingPage from './components/layout/LandingPage';
import { useGame } from './hooks/useGame';
import { useResponsive } from './hooks/useResponsive';
import { useConfirmSystem } from './hooks/useConfirmSystem';
import { MusicProvider } from './components/features/Music/MusicProvider';
import { 懒加载边界, NewGameWizard, MobileNewGameWizard } from './components/features/lazyComponents';
import { useAppModalState } from './components/app/useAppModalState';
import { useAppEffects } from './components/app/useAppEffects';
import { GameView } from './components/app/GameView';
import { ModalLayer } from './components/app/ModalLayer';
import { NSFWModals } from './components/app/NSFWModals';
import { MemoryModals } from './components/app/MemoryModals';

const App: React.FC = () => {
    const { state, meta, setters, actions } = useGame();
    const { isMobile } = useResponsive();
    const { requestConfirm, ConfirmModal } = useConfirmSystem();

    // --- activeMobileWindow (needed for useAppModalState deps) ---
    const activeMobileWindow = React.useMemo(() => {
        // We compute this based on state — will be refined once modalState is wired
        return null;
    }, [state.view, state.showBattle, state.showEquipment, state.showInventory, state.showSocial, state.showKungfu, state.showWorld, state.showMap, state.showTeam, state.showSect, state.showTask, state.showAgreement, state.showStory, state.showHeroinePlan, state.showMemory, state.showSaveLoad, state.showSettings]);

    const {
        showCharacter, setShowCharacter,
        showImageManager, setShowImageManager,
        showWorldbookManager, setShowWorldbookManager,
        showNovelDecompositionWorkbench, setShowNovelDecompositionWorkbench,
        showNovelWritingWorkbench, setShowNovelWritingWorkbench,
        showMobileMusic, setShowMobileMusic,
        showCampusDesire, setShowCampusDesire,
        showPhotography, setShowPhotography,
        showUrbanDriver, setShowUrbanDriver,
        showNsfwCenter, setShowNsfwCenter,
        showBoardGameDashboard, setShowBoardGameDashboard,
        showBoardGameModal, setShowBoardGameModal,
        showBDSMRelationship, setShowBDSMRelationship,
        showBDSMContract, setShowBDSMContract,
        showBDSMSafety, setShowBDSMSafety,
        chatContentHidden, setChatContentHidden,
        sceneQuickGenHint, setSceneQuickGenHint,
        sceneQuickGenToastVisible, setSceneQuickGenToastVisible,
        contextSnapshot, setContextSnapshot,
        modalOpeners,
    } = useAppModalState({
        setters,
        actions,
        apiConfig: state.apiConfig,
        启用修炼体系: state.gameConfig?.启用修炼体系 !== false,
        activeMobileWindow,
        requestConfirm,
    });

    const appEffects = useAppEffects({
        state,
        meta,
        actions,
        setters,
        isMobile,
        modalState: {
            chatContentHidden,
            setChatContentHidden,
            sceneQuickGenHint,
            setSceneQuickGenHint,
            sceneQuickGenToastVisible,
            setSceneQuickGenToastVisible,
            contextSnapshot,
            setContextSnapshot,
        },
    });

    // activeMobileWindow — recompute with actual modal state
    const activeMobileWindowResolved =
        showCharacter ? '角色' :
        state.showBattle ? '战斗' :
        state.showEquipment ? '装备' :
        state.showInventory ? '背包' :
        state.showSocial ? '社交' :
        (appEffects.启用修炼体系 && state.showKungfu) ? '功法' :
        state.showWorld ? '世界' :
        state.showMap ? '地图' :
        state.showTeam ? '队伍' :
        state.showSect ? '门派' :
        state.showTask ? '任务' :
        state.showAgreement ? '约定' :
        state.showStory ? '剧情' :
        state.showHeroinePlan ? '规划' :
        state.showMemory ? '记忆' :
        showImageManager ? '图册' :
        showNovelDecompositionWorkbench ? '小说分解' :
        state.showSaveLoad.show ? (state.showSaveLoad.mode === 'save' ? '保存' : '读取') :
        state.showSettings ? '设置' :
        showMobileMusic ? '音乐' :
        null;

    const {
        closeAllPanels, openCharacter, openSettings, openInventory, openEquipment,
        openBattle, openTeam, openSocial, openKungfu,
        openWorld, openMap, openSect, openTask,
        openAgreement, openStory, openHeroinePlan, openMemory,
        openSave, openLoad,
        closeSettings, closeNovelDecompositionWorkbench, closeNovelWritingWorkbench,
        closeSaveLoad, closeMobileMusic,
        openWorldbookManager, openNovelDecompositionWorkbench,
        openImageManagerWithCheck, openCGGallery, openMapExplorer, handleMobileMenuClick, handleStartFromLanding,
        handleReturnToHomeFromSettings,
    } = modalOpeners;

    const {
        tickerEvents,
        renderTickerItems,
        启用同人模式,
        启用修炼体系,
        当前剧情规划,
        当前女主剧情规划,
        currentEnvTime,
        当前背景图片地址,
        玩家头像地址,
        主角锚点,
        playerProfile,
        fontFaceStyleText,
        uiTextStyleVars,
        hideBottomTicker,
        runtimeStateSections,
        latestAssistantMessage,
        currentOptions,
    } = appEffects;

    return (
        <MusicProvider visualConfig={state.visualConfig} onSaveVisual={actions.saveVisualSettings}>
            <div className="h-screen w-screen overflow-hidden bg-ink-black relative flex flex-col p-3 transition-colors duration-500" style={uiTextStyleVars}>
                {fontFaceStyleText && <style>{fontFaceStyleText}</style>}

                {/* View Switching */}
                {state.view === 'home' && (
                    <LandingPage
                        onStart={handleStartFromLanding}
                        onLoad={openLoad}
                        onImageManager={openImageManagerWithCheck}
                        onWorldbookManager={openWorldbookManager}
                        onNovelDecomposition={() => { void openNovelDecompositionWorkbench(); }}
                        onNovelWriting={() => { void setShowNovelWritingWorkbench(true); }}
                        onSettings={openSettings}
                        hasSave={state.hasSave}
                    />
                )}

                {state.view === 'new_game' && (
                    <懒加载边界>
                        {isMobile ? (
                            <MobileNewGameWizard
                                onComplete={actions.handleGenerateWorld}
                                onCancel={() => { state.setView('home'); }}
                                onEraSelect={actions.handleEraChange}
                                loading={state.loading}
                                currentEra={state.currentEra}
                                requestConfirm={requestConfirm}
                            />
                        ) : (
                            <NewGameWizard
                                onComplete={actions.handleGenerateWorld}
                                onCancel={() => { state.setView('home'); }}
                                onEraSelect={actions.handleEraChange}
                                loading={state.loading}
                                currentEra={state.currentEra}
                                requestConfirm={requestConfirm}
                            />
                        )}
                    </懒加载边界>
                )}

                {state.view === 'game' && (
                    <GameView
                        state={state}
                        meta={meta}
                        actions={actions}
                        isMobile={isMobile}
                        currentOptions={currentOptions}
                        当前背景图片地址={当前背景图片地址}
                        玩家头像地址={玩家头像地址}
                        hideBottomTicker={hideBottomTicker}
                        启用修炼体系={启用修炼体系}
                        chatContentHidden={chatContentHidden}
                        setChatContentHidden={setChatContentHidden}
                        sceneQuickGenHint={sceneQuickGenHint}
                        sceneQuickGenToastVisible={sceneQuickGenToastVisible}
                        tickerEvents={tickerEvents}
                        fontFaceStyleText={fontFaceStyleText}
                        uiTextStyleVars={uiTextStyleVars}
                        openDevice={(actions as any).openDevice}
                        openCharacter={openCharacter}
                        openSettings={openSettings}
                        openInventory={openInventory}
                        openEquipment={openEquipment}
                        openBattle={openBattle}
                        openTeam={openTeam}
                        openSocial={openSocial}
                        openKungfu={openKungfu}
                        openWorld={openWorld}
                        openMap={openMap}
                        openSect={openSect}
                        openTask={openTask}
                        openAgreement={openAgreement}
                        openStory={openStory}
                        openHeroinePlan={openHeroinePlan}
                        openMemory={openMemory}
                        openCGGallery={openCGGallery}
                        openMapExplorer={openMapExplorer}
                        openImageManagerWithCheck={openImageManagerWithCheck}
                        openNovelDecompositionWorkbench={openNovelDecompositionWorkbench}
                        openSave={openSave}
                        openLoad={openLoad}
                        openNsfwCenter={() => setShowNsfwCenter(true)}
                        closeMobileMusic={closeMobileMusic}
                        showMobileMusic={showMobileMusic}
                        activeMobileWindow={activeMobileWindowResolved}
                        handleMobileMenuClick={handleMobileMenuClick}
                        dismissNotification={(actions as any).dismissNotification}
                        renderTickerItems={renderTickerItems}
                        requestConfirm={requestConfirm}
                    />
                )}

                {/* Modal Layer */}
                <ModalLayer
                    state={state}
                    meta={meta}
                    setters={setters}
                    actions={actions}
                    isMobile={isMobile}
                    enable修炼体系={启用修炼体系}
                    当前剧情规划={当前剧情规划}
                    当前女主剧情规划={当前女主剧情规划}
                    enable同人模式={启用同人模式}
                    currentEnvTime={currentEnvTime}
                    runtimeStateSections={runtimeStateSections}
                    contextSnapshot={contextSnapshot}
                    showCharacter={showCharacter}
                    showImageManager={showImageManager}
                    showWorldbookManager={showWorldbookManager}
                    showNovelDecompositionWorkbench={showNovelDecompositionWorkbench}
                    showNovelWritingWorkbench={showNovelWritingWorkbench}
                    requestConfirm={requestConfirm}
                    closeSettings={closeSettings}
                    closeNovelDecompositionWorkbench={closeNovelDecompositionWorkbench}
                    closeNovelWritingWorkbench={closeNovelWritingWorkbench}
                    closeSaveLoad={closeSaveLoad}
                    handleReturnToHomeFromSettings={handleReturnToHomeFromSettings}
                    setShowCharacter={setShowCharacter}
                    setShowImageManager={setShowImageManager}
                    setShowWorldbookManager={setShowWorldbookManager}
                    setShowNovelDecompositionWorkbench={setShowNovelDecompositionWorkbench}
                    setShowNovelWritingWorkbench={setShowNovelWritingWorkbench}
                />

                {/* NSFW Modals */}
                <NSFWModals
                    state={state}
                    setters={setters}
                    actions={actions}
                    isMobile={isMobile}
                    showCampusDesire={showCampusDesire}
                    setShowCampusDesire={setShowCampusDesire}
                    showPhotography={showPhotography}
                    setShowPhotography={setShowPhotography}
                    showUrbanDriver={showUrbanDriver}
                    setShowUrbanDriver={setShowUrbanDriver}
                    showNsfwCenter={showNsfwCenter}
                    setShowNsfwCenter={setShowNsfwCenter}
                    showBoardGameDashboard={showBoardGameDashboard}
                    setShowBoardGameDashboard={setShowBoardGameDashboard}
                    showBoardGameModal={showBoardGameModal}
                    setShowBoardGameModal={setShowBoardGameModal}
                    showBDSMRelationship={showBDSMRelationship}
                    setShowBDSMRelationship={setShowBDSMRelationship}
                    showBDSMContract={showBDSMContract}
                    setShowBDSMContract={setShowBDSMContract}
                    showBDSMSafety={showBDSMSafety}
                    setShowBDSMSafety={setShowBDSMSafety}
                />

                {/* Memory Modals */}
                <MemoryModals
                    meta={meta}
                    actions={actions}
                    isMobile={isMobile}
                    gameView={state.view === 'game'}
                />

                {ConfirmModal}
            </div>
        </MusicProvider>
    );
};

export default App;
