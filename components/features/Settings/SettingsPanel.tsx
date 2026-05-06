import React from 'react';
import { OrnateBorder } from '../../ui/decorations/OrnateBorder';
import { 时代主题方案 } from '../../../models/eraTheme';
import {
    接口设置结构, 提示词结构, ThemePreset, 视觉设置结构, 节日结构, 聊天记录结构,
    游戏设置结构, 记忆配置结构, 记忆系统结构, NPC结构, TavernCommand, OpeningConfig, 剧情系统结构,
    时代配置, 时代信息结构
} from '../../../types';
import { 性能监控配置结构 } from '../../../models/system';

const ApiSettings = React.lazy(() => import('./ApiSettings'));
const ImageGenerationSettings = React.lazy(() => import('./ImageGenerationSettings'));
const PromptManager = React.lazy(() => import('./PromptManager'));
const StorageManager = React.lazy(() => import('./StorageManager'));
const ThemeSettings = React.lazy(() => import('./ThemeSettings'));
const VisualSettings = React.lazy(() => import('./VisualSettings'));
const WorldSettings = React.lazy(() => import('./WorldSettings'));
const GameSettings = React.lazy(() => import('./GameSettings'));
const RealitySettings = React.lazy(() => import('./RealitySettings'));
const TavernPresetSettings = React.lazy(() => import('./TavernPresetSettings'));
const MemorySettings = React.lazy(() => import('./MemorySettings'));
const HistoryViewer = React.lazy(() => import('./HistoryViewer'));
const ContextViewer = React.lazy(() => import('./ContextViewer'));
const IntegratedModelSettings = React.lazy(() => import('./IntegratedModelSettings'));
const IndependentApiGptModeSettings = React.lazy(() => import('./IndependentApiGptModeSettings'));
const NovelDecompositionApiSettings = React.lazy(() => import('./NovelDecompositionApiSettings'));
const CurrentNovelDecompositionInjectionSettings = React.lazy(() => import('./CurrentNovelDecompositionInjectionSettings'));
const MusicSettings = React.lazy(() => import('./MusicSettings'));
const NpcManager = React.lazy(() => import('./NpcManager'));
const VariableManager = React.lazy(() => import('./VariableManager'));
const PerformanceMonitorSettings = React.lazy(() => import('./PerformanceMonitorSettings'));
const CampusNSFWSettings = React.lazy(() => import('./CampusNSFWSettings'));
const UrbanDriverNSFWSettings = React.lazy(() => import('./UrbanDriverNSFWSettings'));
import { 默认校园NSFW设置 } from '../../../models/campusNSFW';
import type { 校园NSFW设置 } from '../../../models/campusNSFW';
import { 默认都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';
import type { 都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';

type RuntimeStateSections = Record<'角色' | '环境' | '社交' | '世界' | '战斗' | '剧情' | '女主剧情规划' | '玩家门派' | '任务列表' | '约定列表' | '记忆系统', unknown>;

type ContextSection = {
    id: string;
    title: string;
    category: string;
    order: number;
    content: string;
    uploadTokens?: number;
};

type ContextSnapshot = {
    sections: ContextSection[];
    fullText: string;
    uploadTokens?: number;
    runtimePromptStates?: Record<string, {
        当前启用: boolean;
        原始启用: boolean;
        受运行时接管: boolean;
        运行时注入: boolean;
    }>;
};

export type SettingsTabId =
    | 'api' | 'image_generation' | 'integrated_models'
    | 'independent_api_gpt' | 'novel_decomposition' | 'novel_decomposition_runtime'
    | 'prompt' | 'storage' | 'theme' | 'visual' | 'world'
    | 'game' | 'campus_nsfw' | 'urban_driver_nsfw' | 'reality' | 'tavern_preset' | 'memory'
    | 'history' | 'context' | 'music' | 'npc_management' | 'variable_manager' | 'performance';

export interface SettingsTabItem {
    id: SettingsTabId;
    label: string;
}

export interface SettingsPanelProps {
    activeTab: SettingsTabId;
    onTabChange: (tab: SettingsTabId) => void;
    onClose: () => void;

    apiConfig: 接口设置结构;
    visualConfig: 视觉设置结构;
    gameConfig?: 游戏设置结构;
    memoryConfig?: 记忆配置结构;
    prompts: 提示词结构[];
    festivals: 节日结构[];
    currentTheme: ThemePreset;
    currentEra?: string;
    eraInfo?: 时代信息结构;
    eraTheme?: 时代主题方案;
    availableEras?: 时代配置[];
    onEraChange?: (eraId: string) => void;
    history: 聊天记录结构[];
    memorySystem?: 记忆系统结构;
    socialList: NPC结构[];
    runtimeState: RuntimeStateSections;
    currentStory?: 剧情系统结构;
    openingConfig?: OpeningConfig;
    contextSnapshot?: ContextSnapshot;

    onSaveApi: (config: 接口设置结构) => void;
    onSaveVisual: (config: 视觉设置结构) => void;
    onSaveGame?: (config: 游戏设置结构) => void;
    onSaveMemory?: (config: 记忆配置结构) => void;
    performanceConfig?: 性能监控配置结构;
    onSavePerformance?: (config: 性能监控配置结构) => void;
    onCreateNpc: (seed?: Partial<NPC结构>) => NPC结构 | void;
    onSaveNpc: (npcId: string, npc: NPC结构) => void;
    onDeleteNpc: (npcId: string) => void;
    onStartNpcMemorySummary?: (npcId: string) => void;
    onUploadNpcImage: (npcId: string, slot: '头像' | '立绘' | '背景' | '胸部' | '小穴' | '屁穴', payload: { dataUrl: string; fileName?: string }) => Promise<unknown> | unknown;
    onReplaceVariableSection: (section: keyof RuntimeStateSections, value: unknown) => void;
    onApplyVariableCommand: (command: TavernCommand) => void;
    onUpdatePrompts: (prompts: 提示词结构[]) => void;
    onUpdateFestivals: (festivals: 节日结构[]) => void;
    onThemeChange: (theme: ThemePreset) => void;
    onReturnToHome?: () => void;
    isHome?: boolean;
    requestConfirm?: (options: { title?: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => Promise<boolean>;

    navMode: 'sidebar' | 'pills';
    tabs: SettingsTabItem[];
}

const 设置加载占位 = (
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-wuxia-gold/10 bg-black/20 text-sm tracking-[0.2em] text-wuxia-gold/70">
        设置载入中…
    </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    activeTab, onTabChange, onClose,
    apiConfig, visualConfig, gameConfig, memoryConfig, performanceConfig, prompts, festivals, currentTheme, currentEra, eraInfo, eraTheme, availableEras, onEraChange, history, memorySystem, socialList, runtimeState, currentStory, openingConfig, contextSnapshot,
    onSaveApi, onSaveVisual, onSaveGame, onSaveMemory, onSavePerformance, onCreateNpc, onSaveNpc, onDeleteNpc, onStartNpcMemorySummary, onUploadNpcImage, onReplaceVariableSection, onApplyVariableCommand, onUpdatePrompts, onUpdateFestivals, onThemeChange, onEraChange: onEraChangeProp,
    onReturnToHome, isHome, requestConfirm,
    navMode, tabs,
}) => {
    const renderTabContent = () => {
        if (activeTab === 'api') return <ApiSettings settings={apiConfig} onSave={onSaveApi} />;
        if (activeTab === 'image_generation') return <ImageGenerationSettings settings={apiConfig} onSave={onSaveApi} />;
        if (activeTab === 'integrated_models') return <IntegratedModelSettings settings={apiConfig} onSave={onSaveApi} />;
        if (activeTab === 'independent_api_gpt' && gameConfig && onSaveGame) return <IndependentApiGptModeSettings settings={gameConfig} onSave={onSaveGame} />;
        if (activeTab === 'novel_decomposition') return <NovelDecompositionApiSettings settings={apiConfig} onSave={onSaveApi} />;
        if (activeTab === 'novel_decomposition_runtime') {
            return (
                <CurrentNovelDecompositionInjectionSettings
                    settings={apiConfig}
                    story={currentStory}
                    openingConfig={openingConfig}
                    playerName={typeof (runtimeState?.角色 as any)?.姓名 === 'string' ? (runtimeState.角色 as any).姓名 : ''}
                />
            );
        }
        if (activeTab === 'prompt') return <PromptManager prompts={prompts} onUpdate={onUpdatePrompts} requestConfirm={requestConfirm} runtimePromptStates={contextSnapshot?.runtimePromptStates} />;
        if (activeTab === 'world') return <WorldSettings festivals={festivals || []} onUpdate={onUpdateFestivals} requestConfirm={requestConfirm} />;
        if (activeTab === 'theme') return <ThemeSettings currentTheme={currentTheme} onThemeChange={onThemeChange} currentEra={currentEra} availableEras={availableEras} onEraChange={onEraChange || onEraChangeProp} />;
        if (activeTab === 'visual') return <VisualSettings settings={visualConfig} onSave={onSaveVisual} />;
        if (activeTab === 'npc_management') {
            return (
                <NpcManager
                    socialList={socialList}
                    memoryConfig={memoryConfig}
                    onStartNpcMemorySummary={onStartNpcMemorySummary}
                    onCreateNpc={onCreateNpc}
                    onSaveNpc={onSaveNpc}
                    onDeleteNpc={onDeleteNpc}
                    onUploadNpcImage={onUploadNpcImage}
                />
            );
        }
        if (activeTab === 'variable_manager') {
            return (
                <VariableManager
                    runtimeState={runtimeState}
                    onReplaceSection={onReplaceVariableSection}
                    onApplyCommand={onApplyVariableCommand}
                />
            );
        }
        if (activeTab === 'music') return <MusicSettings />;
        if (activeTab === 'storage') return <StorageManager requestConfirm={requestConfirm} />;
        if (activeTab === 'history') return <HistoryViewer history={history} memorySystem={memorySystem} />;
        if (activeTab === 'context' && contextSnapshot) {
            return (
                <ContextViewer
                    snapshot={contextSnapshot}
                    memoryConfig={memoryConfig}
                    onSaveMemory={onSaveMemory}
                />
            );
        }
        if (activeTab === 'context') {
            return (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-wuxia-gold/10 bg-black/20 text-sm tracking-[0.2em] text-wuxia-gold/70">
                    上下文计算中…
                </div>
            );
        }
        if (activeTab === 'game' && gameConfig && onSaveGame) return <GameSettings settings={gameConfig} onSave={onSaveGame} currentEra={currentEra} onEraChange={onEraChange} availableEras={availableEras} eraTheme={eraTheme} />;
        if (activeTab === 'campus_nsfw' && gameConfig && onSaveGame) {
            const campusSettings = gameConfig.校园NSFW设置 ?? 默认校园NSFW设置;
            return (
                <CampusNSFWSettings
                    settings={campusSettings}
                    onChange={(s: 校园NSFW设置) => onSaveGame({ ...gameConfig, 校园NSFW设置: s })}
                />
            );
        }
        if (activeTab === 'urban_driver_nsfw' && gameConfig && onSaveGame) {
            const driverSettings = gameConfig.都市网约车NSFW设置 ?? 默认都市网约车NSFW设置;
            return (
                <UrbanDriverNSFWSettings
                    settings={driverSettings}
                    onChange={(s: 都市网约车NSFW设置) => onSaveGame({ ...gameConfig, 都市网约车NSFW设置: s })}
                />
            );
        }
        if (activeTab === 'reality' && gameConfig && onSaveGame) return <RealitySettings settings={gameConfig} onSave={onSaveGame} />;
        if (activeTab === 'tavern_preset' && gameConfig && onSaveGame) return <TavernPresetSettings settings={gameConfig} onSave={onSaveGame} />;
        if (activeTab === 'memory' && memoryConfig && onSaveMemory) return <MemorySettings settings={memoryConfig} onSave={onSaveMemory} />;
        if (activeTab === 'performance' && performanceConfig && onSavePerformance) return <PerformanceMonitorSettings settings={performanceConfig} onSave={onSavePerformance} />;
        return null;
    };

    if (navMode === 'sidebar') {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] overflow-y-auto animate-fadeIn">
                <div className="min-h-full w-full flex items-start md:items-center justify-center p-0 md:p-4">
                    <OrnateBorder className="w-full h-[100dvh] md:max-w-7xl md:h-[85vh] md:max-h-[90vh] flex shadow-[0_0_80px_rgba(0,0,0,0.9)] p-0 overflow-hidden backdrop-blur-md rounded-none md:rounded-2xl">
                        <div className="flex w-full h-full min-h-0">
                            <div className="hidden md:flex w-[220px] lg:w-[236px] bg-black/40 border-r border-wuxia-gold/10 flex-col pt-9 relative z-10 min-h-0">
                                <h2 className="text-xl text-wuxia-gold font-serif font-black px-5 mb-6 italic" style={{ fontFamily: 'var(--ui-页面标题-font-family, inherit)', fontSize: 'var(--ui-页面标题-font-size, 28px)' }}>设置</h2>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {tabs.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => onTabChange(item.id)}
                                            className={`w-full px-4 py-3 text-left text-sm font-bold tracking-[0.2em] transition-all hover:bg-white/5 hover:pl-6 ${
                                                activeTab === item.id
                                                    ? 'text-wuxia-gold border-l-4 border-wuxia-gold bg-white/5 shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)]'
                                                    : 'text-gray-500 border-l-4 border-transparent'
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-4 border-t border-gray-800/50 space-y-3 bg-black/20">
                                    {!isHome && onReturnToHome && (
                                        <button
                                            onClick={onReturnToHome}
                                            className="w-full py-3 border border-red-900/50 text-red-500 hover:bg-red-900/10 hover:text-red-400 hover:border-red-500 text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                            </svg>
                                            返回首页
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 bg-wuxia-gold text-black font-bold text-xs tracking-[0.2em] hover:bg-white transition-colors shadow-lg"
                                    >
                                        关闭设置
                                    </button>
                                </div>
                            </div>

                            <div className="md:hidden w-full h-full flex flex-col min-h-0">
                                <div className="shrink-0 border-b border-wuxia-gold/20 bg-black/60">
                                    <div className="px-4 py-3 flex items-center justify-between">
                                        <h2 className="text-lg text-wuxia-gold font-serif font-black tracking-wider" style={{ fontFamily: 'var(--ui-页面标题-font-family, inherit)', fontSize: 'var(--ui-页面标题-font-size, 24px)' }}>设置</h2>
                                        <div className="flex items-center gap-2">
                                            {!isHome && onReturnToHome && (
                                                <button
                                                    onClick={onReturnToHome}
                                                    className="px-2 py-1 text-[10px] border border-red-900/60 text-red-400 rounded min-h-[44px]"
                                                >
                                                    返回
                                                </button>
                                            )}
                                            <button
                                                onClick={onClose}
                                                className="px-2 py-1 text-[10px] border border-wuxia-gold/50 text-wuxia-gold rounded min-h-[44px]"
                                            >
                                                关闭
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-2 pb-2 overflow-x-auto no-scrollbar">
                                        <div className="flex gap-2 min-w-max">
                                            {tabs.map(item => (
                                                <button
                                                    key={`m-${item.id}`}
                                                    onClick={() => onTabChange(item.id)}
                                                    className={`px-3 py-1.5 rounded border text-xs whitespace-nowrap transition-colors min-h-[44px] flex items-center active:opacity-80 ${
                                                        activeTab === item.id
                                                            ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                                                            : 'border-gray-700 text-gray-400'
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0 p-4 overflow-y-auto relative z-10 custom-scrollbar">
                                    <React.Suspense fallback={设置加载占位}>
                                        {renderTabContent()}
                                    </React.Suspense>
                                </div>
                            </div>

                            <div className="hidden md:block flex-1 min-h-0 p-8 overflow-y-auto relative z-10 custom-scrollbar">
                                <React.Suspense fallback={设置加载占位}>
                                    {renderTabContent()}
                                </React.Suspense>
                            </div>
                        </div>
                    </OrnateBorder>
                </div>
            </div>
        );
    }

    // pills mode (mobile)
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[220] flex items-center justify-center p-0 sm:p-4 md:hidden animate-fadeIn">
            <div className="w-full h-full sm:h-[90vh] bg-[#0b0b0c]/95 border-0 sm:border border-wuxia-gold/30 rounded-none sm:rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
                <div className="shrink-0 px-4 py-3 border-b border-gray-800/70 bg-black/35">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-wuxia-gold font-serif font-bold tracking-[0.28em] text-sm" style={{ fontFamily: 'var(--ui-页面标题-font-family, inherit)', fontSize: 'var(--ui-页面标题-font-size, 22px)' }}>设 定</div>
                            <div className="text-[10px] text-gray-500 mt-1">移动端面板</div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isHome && onReturnToHome && (
                                <button
                                    onClick={onReturnToHome}
                                    className="px-2.5 py-1 text-[10px] rounded border border-red-900/60 text-red-400 bg-red-900/10 min-h-[44px]"
                                >
                                    返回
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-300"
                                title="关闭"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="mt-3 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 min-w-max">
                            {tabs.map(item => (
                                <button
                                    key={`mobile-tab-${item.id}`}
                                    onClick={() => onTabChange(item.id)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] border transition-colors min-h-[44px] flex items-center active:opacity-80 ${
                                        activeTab === item.id
                                            ? 'border-wuxia-gold bg-wuxia-gold/12 text-wuxia-gold'
                                            : 'border-gray-800 text-gray-500 bg-black/40'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 bg-ink-wash/5">
                    <React.Suspense fallback={设置加载占位}>
                        {renderTabContent()}
                    </React.Suspense>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
