import React from 'react';
import { ThemePreset, 时代配置 } from '../../../types';
import { 主题列表 } from '../../../styles/themes';
import { 获取时代推荐主题 } from '../../../models/system';

interface Props {
    currentTheme: ThemePreset;
    onThemeChange: (theme: ThemePreset) => void;
    currentEra?: string;
    availableEras?: 时代配置[];
    onEraChange?: (eraId: string) => void;
}

const ThemeSettings: React.FC<Props> = ({
    currentTheme, onThemeChange,
    currentEra, availableEras = [], onEraChange
}) => {
    const eraRecommendation = currentEra ? 获取时代推荐主题(currentEra) : null;

    return (
        <div className="space-y-8">
            {/* Era Selector */}
            {availableEras.length > 0 && onEraChange && (
                <div>
                    <h3 className="mb-4 text-lg font-bold font-serif text-wuxia-gold">时代背景</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {availableEras.map((era) => {
                            const selected = currentEra === era.id;
                            const recommendedTheme = 获取时代推荐主题(era.id);
                            const themeDef = recommendedTheme
                                ? 主题列表.find((t) => t.id === recommendedTheme)
                                : null;
                            return (
                                <button
                                    key={era.id}
                                    type="button"
                                    onClick={() => onEraChange(era.id)}
                                    className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                                        selected
                                            ? 'border-wuxia-gold bg-wuxia-gold/10 shadow-[0_0_15px_rgba(230,200,110,0.18)]'
                                            : 'border-gray-700 bg-black/40 hover:border-wuxia-gold/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-white/10"
                                            style={{
                                                backgroundColor: themeDef?.colors[0] ?? '#333'
                                            }}
                                        />
                                        <span className={`font-bold font-serif ${selected ? 'text-wuxia-gold' : 'text-gray-200'}`}>
                                            {era.名称}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">
                                        {era.时代} · {era.科技水平描述?.slice(0, 50)}...
                                    </div>
                                    {themeDef && (
                                        <div className="flex gap-1">
                                            {themeDef.colors.slice(0, 4).map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="w-5 h-2 rounded-sm"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {selected && (
                                        <div className="absolute right-2 top-2 text-[10px] font-mono text-wuxia-gold">已启用</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Theme Grid */}
            <div>
                <h3 className="mb-4 text-lg font-bold font-serif text-wuxia-gold">界面风格</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {主题列表.map((theme) => {
                        const selected = currentTheme === theme.id;
                        const isRecommended = eraRecommendation === theme.id;
                        return (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => onThemeChange(theme.id)}
                                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                                    selected
                                        ? 'border-wuxia-gold bg-wuxia-gold/10 shadow-[0_0_15px_rgba(230,200,110,0.18)]'
                                        : isRecommended
                                            ? 'border-wuxia-gold/60 bg-black/40 hover:border-wuxia-gold'
                                            : 'border-gray-700 bg-black/40 hover:border-wuxia-gold/50'
                                }`}
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <div className={`font-bold font-serif ${selected ? 'text-wuxia-gold' : 'text-gray-200'}`}>
                                            {theme.name}
                                        </div>
                                        <div className="mt-1 text-xs leading-relaxed text-gray-500">{theme.description}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {selected && <span className="text-[10px] font-mono text-wuxia-gold">已启用</span>}
                                        {isRecommended && !selected && (
                                            <span className="text-[10px] font-mono text-wuxia-cyan/70">推荐</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2">
                                    {theme.colors.map((color, colorIndex) => (
                                        <div
                                            key={`${theme.id}-color-${colorIndex}`}
                                            className="h-10 rounded-md border border-white/10 shadow-sm"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                <div className="mt-3 text-[10px] text-gray-500">推荐来源：{theme.source}</div>

                                <div className={`absolute right-0 top-0 h-2 w-2 border-r border-t transition-colors ${selected ? 'border-wuxia-gold' : 'border-gray-600'}`} />
                                <div className={`absolute bottom-0 left-0 h-2 w-2 border-b border-l transition-colors ${selected ? 'border-wuxia-gold' : 'border-gray-600'}`} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;
