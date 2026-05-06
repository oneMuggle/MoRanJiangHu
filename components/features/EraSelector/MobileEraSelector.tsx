/**
 * MobileEraSelector.tsx - 移动端时代选择器
 *
 * 功能：移动端纵向标签分步选择（Epoch → Era → SubEra）
 * 说明：移动端专用版本，与桌面端 EraSelector 共享子组件
 */

import React, { useState, useMemo } from 'react';
import { allEraNodes, eraTree, type EraNode } from '../../../models/eraTheme';
import { EraPreviewCard } from './EraPreviewCard';

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
 * 移动端时代选择器
 * 采用纵向标签分步选择：第一步选大类，第二步选时代，第三步选子纪元
 */
export const MobileEraSelector: React.FC<Props> = ({ value, onChange, onCancel }) => {
    const [selectedEpoch, setSelectedEpoch] = useState<string | null>(null);
    const [selectedEra, setSelectedEra] = useState<string | null>(null);
    const [selectedSubEra, setSelectedSubEra] = useState<string | null>(value || null);
    // 移动端标签：0=大类, 1=时代, 2=子纪元
    const [mobileTab, setMobileTab] = useState(0);
    // 是否在本轮交互中主动选择过子纪元
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
        if (!hasSelected || !selectedSubEra) return null;
        return findPath(selectedSubEra);
    }, [selectedSubEra, hasSelected]);

    // 移动端：选中大类后自动展开并跳到时代标签
    const handleEpochSelect = (id: string) => {
        setSelectedEpoch(id);
        setSelectedEra(null);
        setMobileTab(1);
    };

    // 移动端：选中时代后自动展开子纪元并跳到子纪元标签
    const handleEraSelect = (id: string) => {
        setSelectedEra(id);
        setMobileTab(2);
    };

    // 选中子纪元
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

    // 随机选择
    const handleRandom = () => {
        const subEraNodes = allEraNodes.filter((n: EraNode) => n.depth === 2);
        if (subEraNodes.length === 0) return;
        const randomIndex = Math.floor(Math.random() * subEraNodes.length);
        const randomSubEra = subEraNodes[randomIndex];
        handleSubEraSelect(randomSubEra.id);
        const node = allEraNodes.find((n: EraNode) => n.id === randomSubEra.id);
        if (node?.parent) {
            const era = allEraNodes.find((n: EraNode) => n.id === node.parent);
            if (era?.parent) {
                setSelectedEpoch(era.parent);
                setSelectedEra(era.id);
            }
        }
    };

    // 确认选择
    const handleConfirm = () => {
        if (selectedSubEra) {
            onChange(selectedSubEra);
        }
    };

    // 各标签内容渲染
    const renderTabContent = () => {
        if (mobileTab === 0) {
            // 大类选择
            return (
                <div className="space-y-3 p-4">
                    {eraTreeData.map((epoch) => (
                        <button
                            key={epoch.id}
                            type="button"
                            onClick={() => handleEpochSelect(epoch.id)}
                            className={`w-full text-left px-5 py-5 min-h-[56px] rounded-2xl font-serif tracking-wide transition-all text-base ${
                                selectedEpoch === epoch.id
                                    ? 'bg-wuxia-gold/15 text-wuxia-gold border-2 border-wuxia-gold/40'
                                    : 'text-gray-200 hover:bg-white/5 border-2 border-gray-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🌍</span>
                                <div>
                                    <div className="font-bold">{epoch.name}</div>
                                    {epoch.description && (
                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                            {epoch.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            );
        }

        if (mobileTab === 1 && selectedEpoch) {
            const epoch = eraTreeData.find((e) => e.id === selectedEpoch);
            if (!epoch?.eras || epoch.eras.length === 0) {
                return (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        该大类下无时代
                    </div>
                );
            }
            return (
                <div className="space-y-3 p-4">
                    <button
                        type="button"
                        onClick={() => setMobileTab(0)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-2"
                    >
                        ← 返回大类
                    </button>
                    {epoch.eras.map((era) => (
                        <button
                            key={era.id}
                            type="button"
                            onClick={() => handleEraSelect(era.id)}
                            className={`w-full text-left px-5 py-4 min-h-[52px] rounded-xl transition-all text-sm ${
                                selectedEra === era.id
                                    ? 'bg-wuxia-gold/10 text-wuxia-gold border-2 border-wuxia-gold/30'
                                    : 'text-gray-300 hover:bg-white/5 border-2 border-gray-800'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📜</span>
                                <span className="font-medium">{era.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            );
        }

        if (mobileTab === 2 && selectedEra) {
            const epoch = eraTreeData.find((e) => e.id === selectedEpoch);
            const era = epoch?.eras?.find((e) => e.id === selectedEra);
            if (!era?.subEras || era.subEras.length === 0) {
                return (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                        该时代下无子纪元
                    </div>
                );
            }
            return (
                <div className="space-y-3 p-4">
                    <button
                        type="button"
                        onClick={() => setMobileTab(1)}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-2"
                    >
                        ← 返回时代
                    </button>
                    {era.subEras.map((subEra) => (
                        <button
                            key={subEra.id}
                            type="button"
                            onClick={() => handleSubEraSelect(subEra.id)}
                            className={`w-full text-left px-5 py-4 min-h-[52px] rounded-xl transition-all text-sm ${
                                selectedSubEra === subEra.id
                                    ? 'bg-wuxia-gold/20 text-wuxia-gold border-2 border-wuxia-gold/40 font-medium'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border-2 border-gray-800'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⚔️</span>
                                    <div>
                                        <div className="font-medium">{subEra.name}</div>
                                        {subEra.description && (
                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                {subEra.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {selectedSubEra === subEra.id && (
                                    <span className="text-wuxia-gold text-lg">✓</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-48 text-gray-500">
                请从上方选择
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
            {/* Header */}
            <div className="h-14 border-b border-gray-800/80 bg-black/60 flex items-center justify-between px-4">
                <h1 className="text-lg font-serif font-bold text-wuxia-gold tracking-wider">
                    选择时代
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRandom}
                        className="text-sm text-wuxia-gold hover:text-wuxia-gold/80 transition-colors px-3 py-2 flex items-center gap-1"
                        title="随机选择"
                    >
                        🎲
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
                    >
                        取消
                    </button>
                </div>
            </div>

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
                        onClick={() => {
                            if (idx === 0) setMobileTab(0);
                            else if (idx === 1 && selectedEpoch) setMobileTab(1);
                            else if (idx === 2 && selectedEra) setMobileTab(2);
                        }}
                        className={`flex-1 py-3.5 text-center text-sm transition-all border-b-2 ${
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
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {renderTabContent()}
            </div>

            {/* 当前选中预览（移动端底部） */}
            {hasSelected && currentPath && (
                <div className="border-t border-gray-800/60 bg-black/30 p-3 max-h-48 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-400">
                            <span className="text-wuxia-gold">{currentPath.subEra.name}</span>
                            <span className="mx-1">·</span>
                            {currentPath.era.name}
                            <span className="mx-1">·</span>
                            {currentPath.epoch.name}
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {currentPath.subEra.description}
                    </div>
                </div>
            )}

            {/* Bottom Action Bar */}
            <div className="h-16 border-t border-gray-800/80 bg-black/60 flex items-center justify-between px-4">
                <div className="text-xs text-gray-400 truncate max-w-[45%]">
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
    );
};
