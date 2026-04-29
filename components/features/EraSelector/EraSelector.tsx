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

/**
 * 三层时代选择器：Epoch → Era → SubEra
 * 
 * P1-1: 创建 EraSelector 组件目录 ✅
 * P1-2: 实现三级树状导航（EraTreeNav）✅
 * P1-3: 实现时代预览卡片（EraPreviewCard）✅
 */
export const EraSelector: React.FC<Props> = ({ value, onChange, onCancel }) => {
    const 文案 = useUIText();
    const [selectedEpoch, setSelectedEpoch] = useState<string | null>(null);
    const [selectedEra, setSelectedEra] = useState<string | null>(null);
    const [selectedSubEra, setSelectedSubEra] = useState<string | null>(value || null);

    // 构建三层树用于导航
    const eraTreeData = useMemo(() => {
        return eraTree.children.map((epoch: EraNode) => ({
            ...epoch,
            eras: epoch.children?.map((era: EraNode) => ({
                ...era,
                subEras: era.children || [],
            })) || [],
        }));
    }, []);

    // 获取当前选中 SubEra 的完整信息
    const currentSubEra = useMemo(() => {
        if (!selectedSubEra) return null;
        const node = allEraNodes.find((n: EraNode) => n.id === selectedSubEra && n.depth === 2);
        if (!node) return null;
        // 向上查找父节点
        const path = [];
        let current: EraNode | undefined = node;
        while (current) {
            path.unshift(current);
            current = current.parent ? allEraNodes.find((n: EraNode) => n.id === current!.parent) : undefined;
        }
        return {
            epoch: path[0],
            era: path[1],
            subEra: path[2],
        };
    }, [selectedSubEra]);

    const handleConfirm = () => {
        if (selectedSubEra) {
            onChange(selectedSubEra);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full h-full max-w-6xl mx-auto flex flex-col bg-black/95 border border-wuxia-gold/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="h-16 border-b border-gray-800/80 bg-black/60 backdrop-blur-md flex items-center justify-between px-8">
                    <h1 className="text-xl font-serif font-bold text-wuxia-gold tracking-wider">
                        {文案.选择时代 || '选择时代'}
                    </h1>
                    <button
                        onClick={onCancel}
                        className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2"
                    >
                        取消
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Tree Navigation */}
                    <div className="w-80 border-r border-gray-800/80 bg-black/40 overflow-y-auto custom-scrollbar p-4">
                        <EraTreeNav
                            eraTree={eraTreeData as any}
                            selectedEpoch={selectedEpoch}
                            selectedEra={selectedEra}
                            selectedSubEra={selectedSubEra}
                            onEpochSelect={setSelectedEpoch}
                            onEraSelect={setSelectedEra}
                            onSubEraSelect={(id) => {
                                setSelectedSubEra(id);
                                // 自动选中上级
                                const node = allEraNodes.find((n: EraNode) => n.id === id);
                                if (node?.parent) {
                                    const era = allEraNodes.find((n: EraNode) => n.id === node.parent);
                                    if (era?.parent) {
                                        setSelectedEpoch(era.parent);
                                        setSelectedEra(era.id);
                                    }
                                }
                            }}
                        />
                    </div>

                    {/* Right: Preview Card */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {currentSubEra ? (
                            <EraPreviewCard
                                epoch={currentSubEra.epoch}
                                era={currentSubEra.era}
                                subEra={currentSubEra.subEra}
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

                {/* Bottom Action Bar */}
                <div className="h-20 border-t border-gray-800/80 bg-black/60 backdrop-blur-md flex items-center justify-between px-10">
                    <div className="text-sm text-gray-400">
                        {selectedSubEra
                            ? `已选择: ${currentSubEra?.subEra?.name || selectedSubEra}`
                            : '请选择时代'}
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedSubEra}
                            className={`px-8 py-3 rounded-lg font-serif tracking-wider transition-all ${
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
