import React from 'react';

interface EraTreeNode {
    id: string;
    name: string;
    depth: number;
    eras?: EraTreeNode[];
    subEras?: EraTreeNode[];
}

interface Props {
    eraTree: EraTreeNode[];
    selectedEpoch: string | null;
    selectedEra: string | null;
    selectedSubEra: string | null;
    onEpochSelect: (id: string | null) => void;
    onEraSelect: (id: string | null) => void;
    onSubEraSelect: (id: string) => void;
}

/**
 * 三级树状导航：Epoch → Era → SubEra
 * P1-2: 实现三级树状导航（EraTreeNav）
 */
export const EraTreeNav: React.FC<Props> = ({
    eraTree,
    selectedEpoch,
    selectedEra,
    selectedSubEra,
    onEpochSelect,
    onEraSelect,
    onSubEraSelect,
}) => {
    return (
        <div className="space-y-1">
            {eraTree.map((epoch) => (
                <div key={epoch.id}>
                    {/* Epoch Level */}
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedEpoch === epoch.id) {
                                onEpochSelect(null);
                                onEraSelect(null);
                            } else {
                                onEpochSelect(epoch.id);
                                onEraSelect(null);
                            }
                        }}
                        className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg font-serif tracking-wide transition-all text-sm ${
                            selectedEpoch === epoch.id
                                ? 'bg-wuxia-gold/15 text-wuxia-gold border border-wuxia-gold/30'
                                : 'text-gray-200 hover:bg-white/5 border border-transparent'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-bold">{epoch.name}</span>
                            <span className={`text-xs transition-transform duration-200 ${selectedEpoch === epoch.id ? 'rotate-90' : ''}`}>▶</span>
                        </div>
                    </button>

                    {/* Era Level */}
                    {selectedEpoch === epoch.id && epoch.eras && (
                        <div className="ml-4 mt-1 space-y-0.5">
                            {epoch.eras.map((era) => (
                                <div key={era.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (selectedEra === era.id) {
                                                onEraSelect(null);
                                            } else {
                                                onEraSelect(era.id);
                                            }
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                                            selectedEra === era.id
                                                ? 'bg-wuxia-gold/10 text-wuxia-gold border border-wuxia-gold/20'
                                                : 'text-gray-300 hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{era.name}</span>
                                            <span className={`text-[10px] transition-transform ${selectedEra === era.id ? 'rotate-90' : ''}`}>▶</span>
                                        </div>
                                    </button>

                                    {/* SubEra Level */}
                                    {selectedEra === era.id && era.subEras && (
                                        <div className="ml-4 mt-0.5 space-y-0.5">
                                            {era.subEras.map((subEra) => (
                                                <button
                                                    key={subEra.id}
                                                    type="button"
                                                    onClick={() => onSubEraSelect(subEra.id)}
                                                    className={`w-full text-left px-3 py-1.5 rounded text-xs transition-all ${
                                                        selectedSubEra === subEra.id
                                                            ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/30 font-medium'
                                                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                                                    }`}
                                                >
                                                    {subEra.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
