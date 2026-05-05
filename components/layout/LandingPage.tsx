
import React from 'react';
import GameButton from '../ui/GameButton';
import { GitHubSyncButton } from '../features/Auth/GitHubSyncButton';
import { useUIText } from '../../hooks/useUIText';

const requestBrowserFullscreen = () => {
    const doc = document as Document & {
        webkitFullscreenElement?: Element;
        webkitExitFullscreen?: () => Promise<void> | void;
        msFullscreenElement?: Element;
        msExitFullscreen?: () => Promise<void> | void;
    };

    const root = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
    };

    const isFullscreen = !!(
        document.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement
    );

    if (!isFullscreen) {
        const enter = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen;
        if (enter) {
            Promise.resolve(enter.call(root)).catch((err: unknown) => {
                console.error('进入全屏失败:', err);
            });
        }
        return;
    }

    const exit = document.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (exit) {
        Promise.resolve(exit.call(document)).catch((err: unknown) => {
            console.error('退出全屏失败:', err);
        });
    }
};

interface Props {
    onStart: () => void;
    onLoad: () => void;
    onImageManager: () => void;
    onWorldbookManager: () => void;
    onNovelDecomposition: () => void;
    onNovelWriting: () => void;
    onSettings: () => void;
    hasSave: boolean;
}

const LandingPage: React.FC<Props> = ({ onStart, onLoad, onImageManager, onWorldbookManager, onNovelDecomposition, onNovelWriting, onSettings, hasSave }) => {
    const 文案 = useUIText();
    return (
        <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden bg-black z-40 rounded-xl">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-black"></div>
            
            {/* Animated particles or dust could go here */}

            {/* GitHub 云同步按钮 */}
            <GitHubSyncButton />

            {/* 全屏按钮 */}
            <button
                type="button"
                onClick={requestBrowserFullscreen}
                className="absolute right-4 top-4 z-20 border border-wuxia-gold/40 bg-black/50 px-3 py-1 text-xs md:text-sm font-serif tracking-[0.2em] text-wuxia-gold hover:bg-black/70 transition-colors"
                style={{
                    fontFamily: 'var(--ui-按钮-font-family, inherit)',
                    fontSize: 'var(--ui-按钮-font-size, 14px)',
                    lineHeight: 'var(--ui-按钮-line-height, 1.2)'
                }}
                    title={文案.全屏按钮}
            >
                {文案.全屏按钮}
            </button>

            {/* Main Title Area */}
            <div className="relative z-10 flex flex-col items-center mb-10 md:mb-16 animate-fadeIn px-4">
                 {/* Decorative Circle/Moon */}
                 <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-wuxia-gold/5 blur-3xl"></div>
                 
                 <h1
                    onClick={requestBrowserFullscreen}
                    className="text-6xl sm:text-7xl md:text-9xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-b from-gray-100 to-gray-500 tracking-[0.1em] drop-shadow-2xl select-none mb-4 md:mb-6 text-center cursor-pointer"
                    style={{
                        fontFamily: 'var(--ui-页面标题-font-family, inherit)',
                        fontSize: 'var(--ui-页面标题-font-size, clamp(2.5rem,10vw,6rem))',
                        lineHeight: 'var(--ui-页面标题-line-height, 1.2)',
                        fontStyle: 'var(--ui-页面标题-font-style, normal)'
                    }}
                        title={文案.首页主标题}
                 >
                    {文案.首页主标题}
                 </h1>
                 
                 <div className="flex items-center gap-3 md:gap-6 opacity-80">
                     <div className="h-px w-10 md:w-16 bg-gradient-to-r from-transparent to-wuxia-red"></div>
                     <h2 className="text-lg md:text-2xl font-serif text-wuxia-red tracking-[0.3em] md:tracking-[0.5em] uppercase font-bold text-shadow-sm" style={{ fontFamily: 'var(--ui-分组标题-font-family, inherit)', lineHeight: 'var(--ui-分组标题-line-height, 1.35)' }}>
                        {文案.首页副标题}
                     </h2>
                     <div className="h-px w-10 md:w-16 bg-gradient-to-l from-transparent to-wuxia-red"></div>
                 </div>
            </div>

            {/* Menu Options */}
            <div className="relative z-10 flex flex-col gap-4 md:gap-6 w-64 animate-slide-in delay-100 px-4">
                <GameButton onClick={onStart} variant="primary" className="text-base md:text-lg py-3 md:py-4 shadow-lg min-h-[44px]">
                    {文案.开始游戏按钮}
                </GameButton>

                <GameButton
                    onClick={onLoad}
                    variant="secondary"
                    className={`text-base md:text-lg py-3 md:py-4 shadow-lg min-h-[44px] ${!hasSave ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    disabled={!hasSave}
                >
                    {文案.继续游戏按钮}
                </GameButton>

                <GameButton onClick={onImageManager} variant="secondary" className="text-base md:text-lg py-3 md:py-4 shadow-lg border-opacity-50 opacity-90 hover:opacity-100 min-h-[44px]">
                    {文案.图片管理按钮}
                </GameButton>

                <GameButton onClick={onWorldbookManager} variant="secondary" className="text-base md:text-lg py-3 md:py-4 shadow-lg border-opacity-50 opacity-90 hover:opacity-100 min-h-[44px]">
                    {文案.世界书按钮}
                </GameButton>

                <GameButton onClick={onNovelDecomposition} variant="secondary" className="text-base md:text-lg py-3 md:py-4 shadow-lg border-opacity-50 opacity-90 hover:opacity-100 min-h-[44px]">
                    {文案.小说分解按钮}
                </GameButton>

                <GameButton onClick={onNovelWriting} variant="secondary" className="text-base md:text-lg py-3 md:py-4 shadow-lg border-opacity-50 opacity-90 hover:opacity-100 min-h-[44px]">
                    {文案.小说写作按钮}
                </GameButton>

                <GameButton onClick={onSettings} variant="secondary" className="text-base md:text-lg py-3 md:py-4 shadow-lg border-opacity-50 opacity-80 hover:opacity-100 min-h-[44px]">
                    {文案.设置按钮}
                </GameButton>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-[10px] text-gray-600 font-mono tracking-[0.3em] opacity-60" style={{ fontFamily: 'var(--ui-等宽信息-font-family, inherit)', fontSize: 'var(--ui-等宽信息-font-size, 12px)', lineHeight: 'var(--ui-等宽信息-line-height, 1.45)' }}>
                VER 0.0.1 ALPHA
            </div>
            
            {/* Ink Drops Decoration */}
            <div className="absolute top-10 right-20 w-32 h-32 bg-black/50 rounded-full blur-2xl opacity-40"></div>
            <div className="absolute bottom-20 left-10 w-48 h-48 bg-black/60 rounded-full blur-3xl opacity-30"></div>
        </div>
    );
};

export default LandingPage;
