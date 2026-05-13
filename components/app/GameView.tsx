/**
 * GameView.tsx
 *
 * 提取 App 中的游戏视图渲染逻辑。
 * 包含：TopBar、LeftPanel、ChatArea、RightPanel、通知、MobileQuickMenu、底部滚动条、MobileMusicPlayer。
 */

import * as React from 'react';
import TopBar from '../layout/TopBar';
import LeftPanel from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import MobileQuickMenu from '../layout/MobileQuickMenu';
import ChatList from '../features/Chat/ChatList';
import InputArea from '../features/Chat/InputArea';
import { 懒加载边界, MobileMusicPlayer } from '../features/lazyComponents';

// ============================================================================
// 类型
// ============================================================================

interface GameViewProps {
    state: Record<string, unknown>;
    meta: Record<string, unknown>;
    actions: Record<string, unknown>;
    isMobile: boolean;
    currentOptions: string[];
    当前背景图片地址: string;
    玩家头像地址: string;
    hideBottomTicker: boolean;
    启用修炼体系: boolean;
    chatContentHidden: boolean;
    setChatContentHidden: (v: React.SetStateAction<boolean>) => void;
    sceneQuickGenHint: boolean;
    sceneQuickGenToastVisible: boolean;
    tickerEvents: unknown[];
    fontFaceStyleText: string;
    uiTextStyleVars: React.CSSProperties;
    openDevice: () => void;
    openCharacter: () => void;
    openSettings: () => void;
    openInventory: () => void;
    openEquipment: () => void;
    openBattle: () => void;
    openTeam: () => void;
    openSocial: () => void;
    openKungfu: () => void;
    openWorld: () => void;
    openMap: () => void;
    openSect: () => void;
    openTask: () => void;
    openAgreement: () => void;
    openStory: () => void;
    openHeroinePlan: () => void;
    openMemory: () => void;
    openCGGallery: () => void;
    openMapExplorer: () => void;
    openImageManagerWithCheck: () => void;
    openNovelDecompositionWorkbench: () => void;
    openSave: () => void;
    openLoad: () => void;
    openNsfwCenter: () => void;
    closeMobileMusic: () => void;
    showMobileMusic: boolean;
    activeMobileWindow: string | null;
    handleMobileMenuClick: (name: string) => void;
    dismissNotification: (id: string) => void;
    renderTickerItems: (items: string[], keyPrefix: string) => React.ReactNode[];
    requestConfirm: (options: any) => Promise<boolean>;
}

// ============================================================================
// Component
// ============================================================================

export function GameView({
    state,
    meta,
    actions,
    isMobile,
    currentOptions,
    当前背景图片地址,
    玩家头像地址,
    hideBottomTicker,
    启用修炼体系,
    chatContentHidden,
    setChatContentHidden,
    sceneQuickGenHint,
    sceneQuickGenToastVisible,
    tickerEvents,
    fontFaceStyleText,
    uiTextStyleVars,
    openDevice,
    openCharacter,
    openSettings,
    openInventory,
    openEquipment,
    openBattle,
    openTeam,
    openSocial,
    openKungfu,
    openWorld,
    openMap,
    openSect,
    openTask,
    openAgreement,
    openStory,
    openHeroinePlan,
    openMemory,
    openCGGallery,
    openMapExplorer,
    openImageManagerWithCheck,
    openNovelDecompositionWorkbench,
    openSave,
    openLoad,
    openNsfwCenter,
    closeMobileMusic,
    showMobileMusic,
    activeMobileWindow,
    handleMobileMenuClick,
    dismissNotification,
    renderTickerItems,
    requestConfirm,
}: GameViewProps) {
    const playerProfile = React.useMemo(
        () => ({ 姓名: (state.角色 as any)?.姓名, 头像图片URL: 玩家头像地址 }),
        [(state.角色 as any)?.姓名, 玩家头像地址]
    );

    return (
        <>
            {fontFaceStyleText && <style>{fontFaceStyleText}</style>}
            <div className={`relative flex-1 flex flex-col w-full h-full rounded-2xl overflow-hidden bg-ink-black shadow-2xl ${(state.gameConfig as any)?.启用里武侠模式 ? 'lixia-active' : ''} ${(state.gameConfig as any)?.启用里志怪模式 ? 'lizhiguai-active' : ''}`}>

                {/* 里武侠花瓣装饰层 */}
                {(state.gameConfig as any)?.启用里武侠模式 && <div className="lixia-petals" aria-hidden="true" />}

                {/* 里志怪鬼火粒子装饰层 */}
                {(state.gameConfig as any)?.启用里志怪模式 && <div className="lizhiguai-particles" aria-hidden="true" />}

                {/* 顶部导航栏 */}
                <div className={`shrink-0 z-40 bg-ink-black/90 border-b border-wuxia-gold/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative rounded-t-xl overflow-visible mx-1 mt-1 lixia-topbar ${(state.gameConfig as any)?.启用里志怪模式 ? 'lizhiguai-topbar' : ''}`}>
                    <TopBar
                        环境={state.环境}
                        游戏初始时间={state.游戏初始时间}
                        timeFormat={(state.visualConfig as any)?.时间显示格式}
                        festivals={state.festivals}
                        visualConfig={state.visualConfig}
                        eraId={state.currentEra}
                        启用子纪元里模式={(state.gameConfig as any)?.启用子纪元里模式}
                        子纪元里模式强度={(state.gameConfig as any)?.子纪元里模式强度}
                        子纪元里模式阶段={(state.gameConfig as any)?.子纪元里模式阶段}
                        onLiModeIntensityChange={(eraId: string, intensity: number) => {
                            const prev = (state.gameConfig as any)?.子纪元里模式强度 || {};
                            (actions.saveGameSettings as any)?.({ ...(state.gameConfig as any), 子纪元里模式强度: { ...prev, [eraId]: intensity } });
                        }}
                    />
                    {/* NSFW 管理中心入口 */}
                    <button
                        type="button"
                        onClick={openNsfwCenter}
                        className="absolute top-2 right-2 z-50 w-8 h-8 flex items-center justify-center rounded-full border border-red-900/50 bg-red-950/60 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors text-[10px]"
                        title="NSFW 管理中心"
                        aria-label="NSFW 管理中心"
                    >
                        NSFW
                    </button>
                </div>

                {/* 中间主要互动区域 */}
                <div className="flex-1 flex overflow-hidden relative z-10 mx-1 mb-1">

                    {/* 左侧栏 */}
                    <div className={`hidden md:block w-[14.285714%] h-full relative z-20 bg-ink-black/95 border-r border-wuxia-gold/20 flex flex-col shadow-[10px_0_20px_rgba(0,0,0,0.5)] lixia-panel-left ${(state.gameConfig as any)?.启用里志怪模式 ? 'lizhiguai-panel-left' : ''}`}>
                        <LeftPanel
                            角色={state.角色}
                            onOpenCharacter={openCharacter}
                            onUploadAvatar={(actions as any).updatePlayerAvatar}
                            visualConfig={state.visualConfig}
                            gameConfig={state.gameConfig}
                        />
                    </div>

                    {/* 中间栏 - Chat Area */}
                    <div className="flex-1 flex flex-col relative z-0 min-w-0 transition-colors duration-500">
                        {当前背景图片地址 && (
                            <div
                                className={`absolute inset-0 z-0 bg-cover bg-center pointer-events-none transition-opacity duration-300 ${
                                    chatContentHidden ? 'opacity-100' : 'opacity-35'
                                }`}
                                style={{ backgroundImage: `url(${当前背景图片地址})` }}
                            ></div>
                        )}
                        <div
                            className={`absolute inset-0 z-0 bg-gradient-to-b from-white/12 via-white/5 to-white/12 pointer-events-none transition-opacity duration-300 ${
                                chatContentHidden ? 'opacity-0' : 'opacity-100'
                            }`}
                        ></div>
                        <div className="absolute right-3 top-3 z-30 flex items-center gap-2">
                            {chatContentHidden && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        (actions as any).setSceneQuickGenHint?.(true);
                                        (actions as any).setSceneQuickGenToastVisible?.(true);
                                        window.setTimeout(() => (actions as any).setSceneQuickGenHint?.(false), 1200);
                                        window.setTimeout(() => (actions as any).setSceneQuickGenToastVisible?.(false), 2000);
                                        void (actions as any).generateSceneImageManually?.();
                                    }}
                                    className={`inline-flex h-[27px] w-[27px] items-center justify-center rounded-full border bg-black/55 backdrop-blur-sm transition-colors hover:text-white ${sceneQuickGenHint ? 'border-emerald-300 text-emerald-100 ring-2 ring-emerald-300/60 animate-pulse' : 'border-emerald-600/60 text-emerald-100 hover:border-emerald-400'}`}
                                    title="一键生成当前场景"
                                    aria-label="一键生成当前场景"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-[14px] w-[14px]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5 8.5 16 19 5.5" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 12h4" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v4" />
                                    </svg>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setChatContentHidden(prev => !prev)}
                                className="inline-flex h-[27px] w-[27px] items-center justify-center rounded-full border border-sky-700/60 bg-black/55 text-sky-100 backdrop-blur-sm transition-colors hover:border-sky-400 hover:text-white"
                                title={chatContentHidden ? '显示正文内容' : '隐藏正文内容，仅查看壁纸'}
                                aria-label={chatContentHidden ? '显示正文内容' : '隐藏正文内容，仅查看壁纸'}
                            >
                                {chatContentHidden ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-[14px] w-[14px]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" />
                                        <circle cx="12" cy="12" r="2.75" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-[14px] w-[14px]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.5c2.2 2.5 5.24 3.75 9 3.75s6.8-1.25 9-3.75" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.5 7 12.7" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 15.5-2.5-2.8" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 16.5 10 13" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 16.5-.5-3.5" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div
                            className={`relative z-10 flex min-h-0 flex-1 flex-col transition-opacity duration-300 ${
                                chatContentHidden ? 'pointer-events-none select-none opacity-0' : 'opacity-100'
                            }`}
                            aria-hidden={chatContentHidden}
                        >
                            <ChatList
                                history={state.历史记录}
                                loading={state.loading}
                                scrollRef={state.scrollRef}
                                onUpdateHistory={(actions as any).updateHistoryItem}
                                onPolishTurn={(actions as any).handlePolishTurn}
                                visualConfig={state.visualConfig}
                                socialList={state.社交}
                                playerProfile={playerProfile}
                                renderCount={(state.visualConfig as any)?.渲染层数}
                                suppressAutoScrollToken={(meta as any).chatScrollSuppressToken}
                                forceScrollToken={(meta as any).chatForceScrollToken}
                                isDebugMode={(state.gameConfig as any)?.启用调试模式 === true}
                            />
                            <InputArea
                                onSend={(actions as any).handleSend}
                                onStop={(actions as any).handleStop}
                                onCancelVariableGeneration={(actions as any).handleCancelVariableGeneration}
                                onRegenerate={(actions as any).handleRegenerate}
                                onRecoverParseErrorRaw={(actions as any).handleRecoverFromParseErrorRaw}
                                onQuickRestart={(actions as any).handleQuickRestart}
                                requestConfirm={requestConfirm}
                                loading={state.loading}
                                variableGenerationRunning={(meta as any).variableGenerationRunning}
                                canReroll={(meta as any).canRerollLatest}
                                canQuickRestart={(meta as any).canQuickRestart}
                                openingWorldEvolutionProgress={(meta as any).openingWorldEvolutionProgress}
                                openingPlanningProgress={(meta as any).openingPlanningProgress}
                                openingVariableGenerationProgress={(meta as any).openingVariableGenerationProgress}
                                options={currentOptions}
                                actionOptionInputMode={(state.gameConfig as any)?.行动选项输入模式}
                            />
                        </div>
                        {sceneQuickGenToastVisible && (
                            <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
                                <div className="rounded-xl border border-emerald-400/40 bg-black/75 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-emerald-100 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur">
                                    已提交场景生图请求
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 右侧栏 */}
                    <div className={`hidden md:block w-[14.285714%] h-full relative z-20 bg-ink-black/95 border-l border-wuxia-gold/20 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.5)] lixia-panel-right ${(state.gameConfig as any)?.启用里志怪模式 ? 'lizhiguai-panel-right' : ''}`}>
                        <RightPanel
                            onOpenSettings={openSettings}
                            onOpenInventory={openInventory}
                            onOpenEquipment={openEquipment}
                            onOpenBattle={openBattle}
                            onOpenTeam={openTeam}
                            onOpenSocial={openSocial}
                            onOpenKungfu={openKungfu}
                            onOpenWorld={openWorld}
                            onOpenMap={openMap}
                            onOpenSect={openSect}
                            onOpenTask={openTask}
                            onOpenAgreement={openAgreement}
                            onOpenStory={openStory}
                            onOpenHeroinePlan={openHeroinePlan}
                            onOpenMemory={openMemory}
                            onOpenImageManager={openImageManagerWithCheck}
                            onOpenNovelDecomposition={openNovelDecompositionWorkbench}
                            onOpenDevice={openDevice}
                            onOpenCGGallery={openCGGallery}
                            onOpenMapExplorer={openMapExplorer}
                            deviceUnreadCount={((state as any).设备状态?.notifications || []).filter((n: any) => !n.read).length}
                            worldEvolutionEnabled={(meta as any).worldEvolutionEnabled}
                            worldEvolutionUpdating={(meta as any).worldEvolutionUpdating}
                            enableHeroinePlan={(state.gameConfig as any)?.启用女主剧情规划 === true}
                            enableKungfu={启用修炼体系}
                            onSave={openSave}
                            onLoad={openLoad}
                            visualConfig={state.visualConfig}
                        />
                    </div>
                </div>

                {meta.notifications && (meta.notifications as any[]).length > 0 && (
                    <div className="absolute right-4 bottom-16 md:bottom-14 z-[70] flex flex-col gap-2 pointer-events-none">
                        {(meta.notifications as any[]).map((toast) => (
                            <div
                                key={toast.id}
                                className={`pointer-events-auto w-[min(280px,90vw)] rounded-xl border px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-md ${
                                    toast.tone === 'success'
                                        ? 'border-emerald-600/50 bg-emerald-950/85 text-emerald-100'
                                        : toast.tone === 'error'
                                            ? 'border-red-600/50 bg-red-950/85 text-red-100'
                                            : 'border-sky-600/50 bg-sky-950/85 text-sky-100'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold">{toast.title}</div>
                                        <div className="mt-1 text-xs leading-5 opacity-90">{toast.message}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => dismissNotification(toast.id)}
                                        className="shrink-0 text-xs opacity-70 hover:opacity-100"
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 移动端快捷菜单 */}
                <MobileQuickMenu
                    activeWindow={activeMobileWindow}
                    onMenuClick={handleMobileMenuClick}
                    enableHeroinePlan={(state.gameConfig as any)?.启用女主剧情规划 === true}
                    enableKungfu={启用修炼体系}
                    enableImageManager={true}
                    enableNovelDecomposition={true}
                    deviceUnreadCount={((state as any).设备状态?.notifications || []).filter((n: any) => !n.read).length}
                />

                {!hideBottomTicker && (
                    <div className="md:hidden shrink-0 h-[32px] bg-ink-black/90 border-t border-wuxia-gold/20 flex items-center text-[10px] font-mono text-wuxia-gold-dark relative mx-1 mb-1 overflow-hidden pb-[env(safe-area-inset-bottom)]">
                        <div className="shrink-0 h-full px-2 flex items-center border-r border-gray-800 text-wuxia-gold/90 tracking-wider">
                            世界大事
                        </div>
                        <div className="flex-1 overflow-hidden relative h-full flex items-center">
                            <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-ink-black to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-ink-black to-transparent z-10 pointer-events-none"></div>
                            {tickerEvents && tickerEvents.length > 0 ? (
                                <div className="w-full overflow-hidden">
                                    <div
                                        className="flex items-center gap-8 whitespace-nowrap min-w-max animate-marquee-linear text-[10px] text-wuxia-gold/70 tracking-wide"
                                        style={{ ['--marquee-duration' as any]: '28s' }}
                                    >
                                        <div className="flex items-center gap-8">
                                            {renderTickerItems(tickerEvents as string[], 'm')}
                                        </div>
                                        <div className="flex items-center gap-8" aria-hidden>
                                            {renderTickerItems(tickerEvents as string[], 'm-dup')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full text-center text-[10px] text-gray-700 tracking-wider">
                                    江湖平静，暂无大事发生...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!hideBottomTicker && (
                    <div className="hidden md:flex shrink-0 h-[37px] bg-ink-black/90 border-t border-wuxia-gold/20 justify-between px-4 items-center text-xs font-mono text-wuxia-gold-dark z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.8)] relative rounded-b-xl mx-1 mb-1 overflow-hidden">
                        <div className="shrink-0 text-wuxia-gold font-bold mr-2 z-20 bg-ink-black/90 px-2 flex items-center h-full border-r border-gray-800">
                            【世界大事】
                        </div>

                        <div className="flex-1 overflow-hidden relative h-full flex items-center mx-2">
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-ink-black to-transparent z-10 pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ink-black to-transparent z-10 pointer-events-none"></div>

                            {tickerEvents && tickerEvents.length > 0 ? (
                                <div className="w-full overflow-hidden">
                                    <div
                                        className="flex items-center gap-10 whitespace-nowrap min-w-max animate-marquee-linear text-[10px] text-wuxia-gold/70 font-mono tracking-wider"
                                        style={{ ['--marquee-duration' as any]: '36s' }}
                                    >
                                        <div className="flex items-center gap-10">
                                            {renderTickerItems(tickerEvents as string[], 'd')}
                                        </div>
                                        <div className="flex items-center gap-10" aria-hidden>
                                            {renderTickerItems(tickerEvents as string[], 'd-dup')}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full text-center text-[10px] text-gray-700 font-mono tracking-widest">
                                    江湖平静，暂无大事发生...
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 text-wuxia-gold font-bold ml-2 z-20 bg-ink-black/90 px-2 flex items-center h-full border-l border-gray-800">
                            【V0.0.1】
                        </div>
                    </div>
                )}
                {/* Mobile Music Player Drawer */}
                {isMobile && showMobileMusic && (
                    <懒加载边界>
                        <MobileMusicPlayer
                            open={true}
                            onClose={closeMobileMusic}
                        />
                    </懒加载边界>
                )}
            </div>
        </>
    );
}
