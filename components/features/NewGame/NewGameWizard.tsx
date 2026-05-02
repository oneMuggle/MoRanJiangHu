import React from 'react';
import GameButton from '../../ui/GameButton';
import { NewGameWizardContent } from './NewGameWizardContent';
import { useNewGameWizardState } from './useNewGameWizardState';
import { EraSelector } from '../EraSelector';
import type { OpeningConfig, WorldGenConfig, 角色数据结构 } from '../../../types';
import { useUIText } from '../../../hooks/useUIText';
import { 获取时代主题方案 } from '../../../models/eraTheme';
import { 应用时代主题到根元素 } from '../../../styles/themes';
import { 全部时代配置 } from '../../../models/system';

interface Props {
    onComplete: (
        worldConfig: WorldGenConfig,
        charData: 角色数据结构,
        openingConfig: OpeningConfig | undefined,
        mode: 'all' | 'step',
        openingStreaming: boolean,
        openingExtraPrompt?: string
    ) => void;
    onCancel: () => void;
    onEraSelect?: (eraId: string) => void;
    loading: boolean;
    currentEra?: string;
    requestConfirm?: (options: { title?: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => Promise<boolean>;
}

const STEPS = ['世界观', '角色基础', '天赋背景', '开局配置', '确认生成'];

const NewGameWizard: React.FC<Props> = ({ onComplete, onCancel, onEraSelect, loading, currentEra, requestConfirm }) => {
    const wizard = useNewGameWizardState({ onComplete, onCancel, loading, currentEra, requestConfirm });
    const { step, setStep, stepProgress, currentStepLabel, handleNextStep, handleGenerate, showEraSelector, setShowEraSelector } = wizard;
    const 文案 = useUIText();

    // Expose setShowEraSelector to wizard state so content can trigger it
    // We use a ref pattern via the wizard's existing showEraSelector state
    const openEraSelector = () => setShowEraSelector(true);

    return (
        <>
            {showEraSelector && (
                <EraSelector
                    value={wizard.worldConfig.时代配置ID || 'ancient_eastern_wuxia'}
                    onChange={(eraId) => {
                        wizard.setWorldConfig((prev: WorldGenConfig) => ({ ...prev, 时代配置ID: eraId }));
                        onEraSelect?.(eraId);
                        // 应用时代配色、字体到根元素，实时预览主题变化
                        const eraScheme = 获取时代主题方案(eraId);
                        if (eraScheme) {
                            应用时代主题到根元素(eraScheme);
                        }
                        // 同步古代体系选择：根据新 eras 的支持体系重置
                        const era = 全部时代配置.find(c => c.id === eraId);
                        if (era && Array.isArray(era.支持体系) && era.支持体系.length > 0) {
                            wizard.设置古代体系选择(era.支持体系[0]);
                        }
                        setShowEraSelector(false);
                    }}
                    onCancel={() => setShowEraSelector(false)}
                />
            )}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
                <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col bg-black/95 border border-gray-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="h-16 border-b border-gray-800/80 bg-black/60 backdrop-blur-md flex items-center justify-between px-8">
                        <h1 className="text-xl font-serif font-bold text-wuxia-gold tracking-wider">{文案.新建游戏按钮}</h1>
                        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-white transition-colors">
                            取消
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Sidebar */}
                        <div className="w-56 border-r border-gray-800/80 bg-black/40 p-4 hidden md:flex flex-col gap-2">
                            {STEPS.map((label, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setStep(idx)}
                                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                        idx === step
                                            ? 'bg-wuxia-gold/10 text-wuxia-gold border border-wuxia-gold/30'
                                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                    }`}
                                >
                                    <span className="text-[10px] text-gray-600 font-mono mr-2">{idx + 1}</span>
                                    {label}
                                </button>
                            ))}
                            <div className="mt-auto pt-4 text-[10px] text-gray-600">
                                当前: {currentStepLabel}
                            </div>
                        </div>

                        {/* Main Content - pass openEraSelector */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                            <NewGameWizardContent wizard={wizard} openEraSelector={openEraSelector} />
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="h-24 border-t border-gray-800/80 bg-black/60 backdrop-blur-md flex items-center justify-between px-10 shadow-[0_-10px_30px_rgba(0,0,0,0.4)]">
                        <div>
                            <div className="text-[11px] text-gray-500 font-mono tracking-widest uppercase">Progress</div>
                            <div className="mt-1.5 flex items-center gap-2">
                                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-wuxia-gold transition-all duration-500" style={{ width: `${stepProgress}%` }}></div>
                                </div>
                                <span className="text-xs text-wuxia-gold ml-2 font-mono">{step + 1} / {STEPS.length}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {step > 0 && (
                                <GameButton onClick={() => setStep(step - 1)} variant="secondary" className="px-8 py-3 text-sm tracking-wider opacity-80 hover:opacity-100 transition-opacity">
                                    上一步
                                </GameButton>
                            )}
                            {step < STEPS.length - 1 ? (
                                <GameButton onClick={handleNextStep} variant="primary" className="px-8 py-3 text-sm tracking-wider shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                                    下一步
                                </GameButton>
                            ) : (
                                <GameButton onClick={() => { void handleGenerate(); }} variant="primary" className="px-10 py-3 text-base tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] bg-gradient-to-r from-wuxia-gold/90 to-wuxia-gold text-black font-bold">
                                    开启世界推演
                                </GameButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewGameWizard;
