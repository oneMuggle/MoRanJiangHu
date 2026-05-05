import React, { useState, useMemo } from 'react';
import { allEraNodes, eraTree, type EraNode } from '../../../models/eraTheme';
import { EraTreeNav } from './EraTreeNav';
import { EraPreviewCard } from './EraPreviewCard';
import { useUIText } from '../../../hooks/useUIText';

interface Props {
    value: string; // subEraId
    onChange: (subEraId: string) => void;
    onCancel: () => void;
}

// 从子纪元节点向上查找完整路径
const findPath = (subEraId: string): { epoch: EraNode; era: EraNode; subEra: EraNode } | null => {
    const node = allEraNodes.find((n: EraNode) => n.id === subEraId && n.depth === 2);
    if (!node) return null;
    const era = node.parent ? allEraNodes.find((n: EraNode) => n.id === node.parent) : null;
    if (!era) return null;
    const epoch = era.parent ? allEraNodes.find((n: EraNode) => n.id === era.parent) : null;
    if (!epoch) return null;
    return { epoch, era, subEra: node };
};

/**
 * 三层时代选择器：Epoch → Era → SubEra
 * 移动端：纵向标签分步选择
 * 桌面端：左右分栏（树形导航 + 预览卡片）
 */
export const EraSelector: React.FC<Props> = ({ value, onChange, onCancel }) => {
    const 文案 = useUIText();
    const [selectedEpoch, setSelectedEpoch] = useState<string | null>(null);
    const [selectedEra, setSelectedEra] = useState<string | null>(null);
    const [selectedSubEra, setSelectedSubEra] = useState<string | null>(value || null);
    // 移动端标签：0=大类, 1=时代, 2=子纪元
    const [mobileTab, setMobileTab] = useState(0);
    // 是否在本轮交互中主动选择过子纪元（打开时已有 value 不显示预览，只有主动选择后才出现）
    const [hasSelected, setHasSelected] = useState(false);

    const eraTreeData = useMemo(() => {
        return eraTree.children.map((epoch: EraNode) => ({
            ...epoch,
            eras: epoch.children?.map((era: EraNode) => ({
                ...era,
                subEras: era.children || [],
            })) || [],
        }));
    }, []);

    const currentPath = useMemo(() => {
        // 只有用户主动选择后才计算预览路径
        if (!hasSelected || !selectedSubEra) return null;
        return findPath(selectedSubEra);
    }, [selectedSubEra, hasSelected]);

    const handleConfirm = () => {
        if (selectedSubEra) {
            onChange(selectedSubEra);
        }
    };

    const handleSubEraSelect = (id: string) => {
        setSelectedSubEra(id);
        setHasSelected(true);
        const node = allEraNodes.find((n: EraNode) => n.id === id);
        if (node?.parent) {
            const era = allEraNodes.find((n: EraNode) => n.id === node.parent);
            if (era?.parent) {
                setSelectedEpoch(era.parent);
                setSelectedEra(era.id);
            }
        }
    };

    // 移动端：选中大类后自动展开并跳到时代标签
    const handleEpochSelect = (id: string | null) => {
        setSelectedEpoch(id);
        setSelectedEra(null);
        if (id) setMobileTab(1);
    };

    // 移动端：选中时代后自动展开子纪元并跳到子纪元标签
    const handleEraSelect = (id: string | null) => {
        setSelectedEra(id);
        if (id) setMobileTab(2);
    };

    // 随机选择一个子纪元
    const handleRandom = () => {
        const subEraNodes = allEraNodes.filter((n: EraNode) => n.depth === 2);
        if (subEraNodes.length === 0) return;
        const randomIndex = Math.floor(Math.random() * subEraNodes.length);
        const randomSubEra = subEraNodes[randomIndex];
        handleSubEraSelect(randomSubEra.id);
        // 桌面端也需要设置选中的 epoch 和 era
        const node = allEraNodes.find((n: EraNode) => n.id === randomSubEra.id);
        if (node?.parent) {
            const era = allEraNodes.find((n: EraNode) => n.id === node.parent);
            if (era?.parent) {
                setSelectedEpoch(era.parent);
                setSelectedEra(era.id);
            }
        }
    };

    // 移动端各标签下的内容渲染
    const renderMobileTabContent = () => {
        if (mobileTab === 0) {
            // 大类选择
            return (
                <div className="space-y-2">
                    {eraTreeData.map((epoch) => (
                        <button
                            key={epoch.id}
                            type="button"
                            onClick={() => handleEpochSelect(epoch.id)}
                            className={`w-full text-left px-5 py-4 min-h-[48px] rounded-xl font-serif tracking-wide transition-all text-base ${
                                selectedEpoch === epoch.id
                                    ? 'bg-wuxia-gold/15 text-wuxia-gold border border-wuxia-gold/30'
                                    : 'text-gray-200 hover:bg-white/5 border border-gray-800'
                            }`}
                        >
                            <span className="font-bold">{epoch.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{epoch.description?.slice(0, 30) || ''}</span>
                        </button>
                    ))}
                </div>
            );
        }

        if (mobileTab === 1 && selectedEpoch) {
            // 时代选择
            const epoch = eraTreeData.find(e => e.id === selectedEpoch);
            if (!epoch?.eras) return <div className="text-gray-500 text-center py-8">该大类下无时代</div>;
            return (
                <div className="space-y-2">
                    {epoch.eras.map((era) => (
                        <button
                            key={era.id}
                            type="button"
                            onClick={() => handleEraSelect(era.id)}
                            className={`w-full text-left px-5 py-4 min-h-[48px] rounded-xl transition-all text-sm ${
                                selectedEra === era.id
                                    ? 'bg-wuxia-gold/10 text-wuxia-gold border border-wuxia-gold/20'
                                    : 'text-gray-300 hover:bg-white/5 border border-gray-800'
                            }`}
                        >
                            <span className="font-medium">{era.name}</span>
                        </button>
                    ))}
                </div>
            );
        }

        if (mobileTab === 2 && selectedEra) {
            // 子纪元选择
            const epoch = eraTreeData.find(e => e.id === selectedEpoch);
            const era = epoch?.eras?.find(e => e.id === selectedEra);
            if (!era?.subEras) return <div className="text-gray-500 text-center py-8">该时代下无子纪元</div>;
            return (
                <div className="space-y-2">
                    {era.subEras.map((subEra) => (
                        <button
                            key={subEra.id}
                            type="button"
                            onClick={() => {
                                handleSubEraSelect(subEra.id);
                            }}
                            className={`w-full text-left px-5 py-4 min-h-[48px] rounded-xl transition-all text-sm ${
                                selectedSubEra === subEra.id
                                    ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/30 font-medium'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-gray-800'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{subEra.name}</span>
                                {selectedSubEra === subEra.id && <span className="text-wuxia-gold text-xs">✓</span>}
                            </div>
                            {subEra.description && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{subEra.description}</div>
                            )}
                        </button>
                    ))}
                </div>
            );
        }

        if (mobileTab === 1 || mobileTab === 2) {
            return <div className="text-gray-500 text-center py-8">请先选择上一级</div>;
        }

        return null;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col bg-black/95 border border-wuxia-gold/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="h-14 md:h-16 border-b border-gray-800/80 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 md:px-8">
                    <h1 className="text-lg md:text-xl font-serif font-bold text-wuxia-gold tracking-wider">
                        {文案.选择时代 || '选择时代'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRandom}
                            className="text-sm text-wuxia-gold hover:text-wuxia-gold/80 transition-colors px-3 py-2 flex items-center gap-1"
                            title="随机选择"
                        >
                            🎲 随机
                        </button>
                        <button
                            onClick={onCancel}
                            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
                        >
                            取消
                        </button>
                    </div>
                </div>

                {/* 桌面端：左右分栏（隐藏于移动端） */}
                <div className="hidden md:flex flex-1 overflow-hidden">
                    <div className="w-80 border-r border-gray-800/80 bg-black/40 overflow-y-auto custom-scrollbar p-4">
                        <EraTreeNav
                            eraTree={eraTreeData as any}
                            selectedEpoch={selectedEpoch}
                            selectedEra={selectedEra}
                            selectedSubEra={selectedSubEra}
                            onEpochSelect={setSelectedEpoch}
                            onEraSelect={setSelectedEra}
                            onSubEraSelect={handleSubEraSelect}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {currentPath ? (
                            <EraPreviewCard
                                epoch={currentPath.epoch}
                                era={currentPath.era}
                                subEra={currentPath.subEra}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <div className="text-4xl mb-4">⚔️</div>
                                    <p>请从左侧选择一个时代</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 移动端：纵向布局 */}
                <div className="flex md:hidden flex-1 flex-col overflow-hidden">
                    {/* 标签导航 */}
                    <div className="flex border-b border-gray-800/80 bg-black/40">
                        {[
                            { label: '大类', icon: '🌍' },
                            { label: '时代', icon: '📜' },
                            { label: '子纪元', icon: '⚔️' },
                        ].map((tab, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setMobileTab(idx)}
                                className={`flex-1 py-3 text-center text-sm transition-all border-b-2 ${
                                    mobileTab === idx
                                        ? 'border-wuxia-gold text-wuxia-gold bg-wuxia-gold/5'
                                        : 'border-transparent text-gray-500'
                                }`}
                            >
                                <span className="mr-1">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* 内容区域 */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                        {renderMobileTabContent()}
                    </div>

                    {/* 当前选中预览（移动端） */}
                    {hasSelected && currentPath && (
                        <div className="border-t border-gray-800/60 bg-black/30 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-xs text-gray-400">
                                    <span className="text-wuxia-gold">{currentPath.subEra.name}</span>
                                    <span className="mx-1">·</span>
                                    {currentPath.era.name}
                                </div>
                            </div>
                            <EraPreviewCard
                                epoch={currentPath.epoch}
                                era={currentPath.era}
                                subEra={currentPath.subEra}
                            />
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="h-16 md:h-20 border-t border-gray-800/80 bg-black/60 backdrop-blur-md flex items-center justify-between px-4 md:px-10">
                    <div className="text-xs md:text-sm text-gray-400 truncate max-w-[50%]">
                        {selectedSubEra
                            ? `已选择: ${currentPath?.subEra?.name || selectedSubEra}`
                            : '请选择时代'}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-500 transition-colors text-sm"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedSubEra}
                            className={`px-6 py-2.5 rounded-lg font-serif tracking-wider transition-all text-sm ${
                                selectedSubEra
                                    ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/40 hover:bg-wuxia-gold/30'
                                    : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                            }`}
                        >
                            确认时代
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
