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
import { MemoryModals } from './components/app/MemoryModals';
import { ModalRenderer, useModalManager } from './utils/moduleRegistry';
import './utils/moduleRegistry/bootstrap'; // 激活所有模块注册

const App: React.FC = () => {
    const { state, meta, setters, actions } = useGame();
    const { isMobile } = useResponsive();
    const { requestConfirm, ConfirmModal } = useConfirmSystem();
    const modalManager = useModalManager();

    // 监听新系统弹窗事件（由 ModalRenderer 的 modalManager 派发）
    React.useEffect(() => {
        const handleOpen = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string; payload?: unknown };
            modalManager.open(detail.id, detail.payload);
        };
        const handleClose = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string };
            modalManager.close(detail.id);
        };
        const handleCloseAll = () => modalManager.closeAll();
        const handleToggle = (e: Event) => {
            const detail = (e as CustomEvent).detail as { id: string };
            modalManager.toggle(detail.id);
        };
        window.addEventListener('modal:open', handleOpen);
        window.addEventListener('modal:close', handleClose);
        window.addEventListener('modal:closeAll', handleCloseAll);
        window.addEventListener('modal:toggle', handleToggle);
        return () => {
            window.removeEventListener('modal:open', handleOpen);
            window.removeEventListener('modal:close', handleClose);
            window.removeEventListener('modal:closeAll', handleCloseAll);
            window.removeEventListener('modal:toggle', handleToggle);
        };
    }, [modalManager]);

    // --- activeMobileWindow (needed for useAppModalState deps) ---
    const activeMobileWindow = React.useMemo(() => {
        // We compute this based on state — will be refined once modalState is wired
        return null;
    }, [state.view, state.showBattle, state.showEquipment, state.showInventory, state.showSocial, state.showKungfu, state.showWorld, state.showMap, state.showTeam, state.showSect, state.showTask, state.showAgreement, state.showStory, state.showHeroinePlan, state.showMemory, state.showSaveLoad, state.showSettings]);

    const {
        showCharacter,
        showNovelDecompositionWorkbench,
        showMobileMusic,
        chatContentHidden, setChatContentHidden,
        sceneQuickGenHint, setSceneQuickGenHint,
        sceneQuickGenToastVisible, setSceneQuickGenToastVisible,
        contextSnapshot, setContextSnapshot,
        galgameModeEnabled, toggleGalgameMode,
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

    // activeMobileWindow — 使用 modalManager 追踪
    const isOpen = React.useCallback((id: string) => modalManager.isOpen(id), [modalManager]);
    const activeMobileWindowResolved =
        showCharacter ? '角色' :
        isOpen('battle') ? '战斗' :
        isOpen('equipment') ? '装备' :
        isOpen('inventory') ? '背包' :
        isOpen('social') ? '社交' :
        (appEffects.启用修炼体系 && isOpen('kungfu')) ? '功法' :
        isOpen('world') ? '世界' :
        isOpen('map') ? '地图' :
        isOpen('team') ? '队伍' :
        isOpen('sect') ? '门派' :
        isOpen('task') ? '任务' :
        isOpen('agreement') ? '约定' :
        isOpen('story') ? '剧情' :
        isOpen('heroinePlan') ? '规划' :
        isOpen('memory') ? '记忆' :
        showNovelDecompositionWorkbench ? '小说分解' :
        isOpen('saveLoad') ? (modalManager.openModals.get('saveLoad') as { mode?: string } | undefined)?.mode === 'load' ? '读取' : '保存' :
        isOpen('settings') ? '设置' :
        showMobileMusic ? '音乐' :
        null;

    const {
        openCharacter, openSettings, openInventory, openEquipment,
        openBattle, openTeam, openSocial, openKungfu,
        openWorld, openMap, openSect, openTask,
        openAgreement, openStory, openHeroinePlan, openMemory,
        openSave, openLoad,
        closeMobileMusic,
        openWorldbookManager, openNovelDecompositionWorkbench,
        openCGGallery, openMapExplorer, handleMobileMenuClick, handleStartFromLanding,
    } = modalOpeners;

    const {
        tickerEvents,
        renderTickerItems,
        启用修炼体系,
        当前背景图片地址,
        玩家头像地址,
        fontFaceStyleText,
        uiTextStyleVars,
        hideBottomTicker,
        runtimeStateSections,
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
                        onImageManager={() => { modalManager.open('imageManager'); }}
                        onWorldbookManager={openWorldbookManager}
                        onNovelDecomposition={() => { void openNovelDecompositionWorkbench(); }}
                        onNovelWriting={() => { modalManager.open('novelWritingWorkbench'); }}
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
                        galgameModeEnabled={galgameModeEnabled}
                        toggleGalgameMode={toggleGalgameMode}
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
                        openImageManagerWithCheck={() => { modalManager.open('imageManager'); }}
                        openNovelDecompositionWorkbench={openNovelDecompositionWorkbench}
                        openSave={openSave}
                        openLoad={openLoad}
                        openNsfwCenter={() => modalManager.open('nsfwCenter')}
                        closeMobileMusic={closeMobileMusic}
                        showMobileMusic={showMobileMusic}
                        activeMobileWindow={activeMobileWindowResolved}
                        handleMobileMenuClick={handleMobileMenuClick}
                        dismissNotification={(actions as any).dismissNotification}
                        renderTickerItems={renderTickerItems}
                        requestConfirm={requestConfirm}
                    />
                )}

                {/* Modal Layer (global decorative frame only) */}
                <ModalLayer />

                {/* Memory Modals */}
                <MemoryModals
                    meta={meta}
                    actions={actions}
                    isMobile={isMobile}
                    gameView={state.view === 'game'}
                />

                {/* 新模块注册系统渲染器（Phase 2：与 ModalLayer 共存） */}
                <ModalRenderer
                    state={state}
                    meta={meta}
                    setters={setters}
                    actions={actions}
                    isMobile={isMobile}
                    openModals={modalManager.openModals}
                    onClose={modalManager.close}
                    requestConfirm={requestConfirm}
                    extraProps={{ runtimeStateSections, contextSnapshot }}
                />

                {ConfirmModal}
            </div>
        </MusicProvider>
    );
};

export default App;
