import React from 'react';
import GameButton from '../../../ui/GameButton';
import { NewGameWizardContent } from '../NewGameWizardContent';
import { useNewGameWizardState } from '../useNewGameWizardState';
import { EraSelector } from '../../EraSelector';
import type { OpeningConfig, WorldGenConfig, 角色数据结构 } from '../../../../types';
import { 获取时代主题方案 } from '../../../../models/eraTheme';
import { 应用时代主题到根元素 } from '../../../../styles/themes';

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
    loading: boolean;
    currentEra?: string;
    requestConfirm?: (options: { title?: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }) => Promise<boolean>;
}

const STEPS = ['世界观', '角色基础', '天赋背景', '开局配置', '确认生成'];

const MobileNewGameWizard: React.FC<Props> = ({ onComplete, onCancel, loading, currentEra, requestConfirm }) => {
    const wizard = useNewGameWizardState({ onComplete, onCancel, loading, currentEra, requestConfirm });
    const { step, setStep, stepProgress, handleNextStep, handleGenerate, showEraSelector, setShowEraSelector } = wizard;

    // Expose setShowEraSelector to wizard state so content can trigger it
    const openEraSelector = () => setShowEraSelector(true);

    return (
        <>
            {showEraSelector && (
                <EraSelector
                    value={wizard.worldConfig.时代配置ID || 'ancient_eastern_wuxia'}
                    onChange={(eraId) => {
                        wizard.setWorldConfig((prev: WorldGenConfig) => ({ ...prev, 时代配置ID: eraId }));
                        const eraScheme = 获取时代主题方案(eraId);
                        if (eraScheme) {
                            应用时代主题到根元素(eraScheme);
                        }
                        setShowEraSelector(false);
                    }}
                    onCancel={() => setShowEraSelector(false)}
                />
            )}
            <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden">
                {/* Mobile Header */}
                <div className="w-full relative z-20 border-b border-gray-800/80 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-gray-500 font-mono tracking-widest">NEW CHARACTER</div>
                        <div className="text-sm text-wuxia-gold font-serif font-bold">
                            {step + 1}. {STEPS[step]}
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-xs text-gray-400 hover:text-white transition-colors">
                        取消
                    </button>
                </div>

                {/* Progress Strip */}
                <div className="h-1 bg-gray-800">
                    <div
                        className="h-full bg-wuxia-gold transition-all duration-500"
                        style={{ width: `${stepProgress}%` }}
                    />
                </div>

                {/* Step Indicator Dots */}
                <div className="flex items-center justify-center gap-2 py-2 bg-black/60">
                    {STEPS.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setStep(idx)}
                            className={`h-2 rounded-full transition-all ${
                                idx === step
                                    ? 'w-6 bg-wuxia-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                                    : idx < step
                                        ? 'w-2 bg-wuxia-gold/40'
                                        : 'w-2 bg-gray-700'
                            }`}
                        />
                    ))}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
                    <NewGameWizardContent wizard={wizard} openEraSelector={openEraSelector} />
                </div>

                {/* Mobile Bottom Action Bar */}
                <div className="w-full relative z-20 border-t border-gray-800/80 bg-black/80 backdrop-blur-md px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3">
                        {step > 0 ? (
                            <GameButton onClick={() => setStep(step - 1)} variant="secondary" className="flex-1 py-3 text-sm opacity-90">
                                上一步
                            </GameButton>
                        ) : (
                            <GameButton onClick={onCancel} variant="secondary" className="flex-1 py-3 text-sm !border-red-500/30 !text-red-400 hover:!bg-red-500/10">
                                放弃创建
                            </GameButton>
                        )}
                        {step < STEPS.length - 1 ? (
                            <GameButton onClick={handleNextStep} variant="primary" className="flex-1 py-3 text-sm shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                                下一步
                            </GameButton>
                        ) : (
                            <GameButton onClick={() => { void handleGenerate(); }} variant="primary" className="flex-1 py-3 text-sm font-bold bg-gradient-to-r from-wuxia-gold/90 to-wuxia-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                                推演世界
                            </GameButton>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNewGameWizard;
