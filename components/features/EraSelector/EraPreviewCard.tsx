import React from 'react';
import type { EraNode } from '../../../models/eraTheme';
import { ERA_ICON_MAP, ERA_BG_CONFIG } from './eraIconMap';
import { useEraAssets } from '../../../hooks/useEraAssets';

interface Props {
    epoch: EraNode;
    era: EraNode;
    subEra: EraNode;
}

/**
 * 时代预览卡片
 * P1-3: 实现时代预览卡片（EraPreviewCard）
 */
export const EraPreviewCard: React.FC<Props> = ({
    epoch,
    era,
    subEra,
}) => {
    const bgmTags = subEra.bgmTags || era.bgmTags || epoch.bgmTags || [];
    const artStyle = subEra.artStyle || era.artStyle || epoch.artStyle || '待配置';
    const description = subEra.description || era.description || epoch.description || '';

    const cfg = ERA_BG_CONFIG[subEra.id] || { bg: 'from-gray-800 to-gray-900', icon: 'world' };
    const icon = ERA_ICON_MAP[cfg.icon] || '?';

    return (
        <div className="space-y-4 md:space-y-6">
            {/* 时代标题 */}
            <div className="text-center">
                <div className="inline-block px-3 py-1 md:px-4 md:py-1 bg-wuxia-gold/10 border border-wuxia-gold/30 rounded-full text-[10px] md:text-xs text-wuxia-gold mb-2">
                    {epoch.name} · {era.name}
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wider">
                    {subEra.name}
                </h2>
                <p className="mt-2 text-gray-400 text-xs md:text-sm">
                    {description}
                </p>
            </div>

            {/* 预览图占位 */}
            <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg md:rounded-xl border border-gray-700/50 overflow-hidden">
                {/* 动态背景 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cfg.bg} flex flex-col items-center justify-center`}>
                    <span className="text-6xl">{icon}</span>
                    <span className="text-gray-500 text-sm mt-3">素材占位 - {artStyle}</span>
                </div>

                {/* BGM 标签 */}
                <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                    {bgmTags.length > 0 ? (
                        bgmTags.slice(0, 5).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-gray-300">
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-gray-500">
                            待生成素材
                        </span>
                    )}
                </div>

                {/* 艺术风格标签 */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono ${
                        artStyle && artStyle !== '待配置'
                            ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/30'
                            : 'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}>
                        {artStyle}
                    </span>
                </div>

                {/* 素材状态 */}
                <div className="absolute top-4 left-4">
                    <EraAssetStatusBadge subEraId={subEra.id} />
                </div>
            </div>

            {/* 详细信息 */}
            <div className="grid grid-cols-2 gap-4">
                <InfoCard label="时代" value={epoch.name} />
                <InfoCard label="纪元" value={era.name} />
                <InfoCard label="艺术风格" value={artStyle} />
                <InfoCard label="子纪元" value={subEra.name} />
            </div>

            {/* 界面文案预览 */}
            {subEra.uiCopy && (
                <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-mono mb-2">界面文案</div>
                    <div className="space-y-2">
                        {Object.entries(subEra.uiCopy).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-400">{key}:</span>
                                <span className="text-white">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 配色预览 */}
            {subEra.colors && (
                <div className="bg-black/40 border border-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-500 font-mono mb-2">配色方案</div>
                    <div className="flex gap-2">
                        {Object.entries(subEra.colors).slice(0, 5).map(([key, rgb]) => (
                            <div key={key} className="flex flex-col items-center gap-1">
                                <div
                                    className="w-8 h-8 rounded border border-gray-700"
                                    style={{ backgroundColor: `rgb(${rgb})` }}
                                />
                                <span className="text-[10px] text-gray-500">{key}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="bg-black/40 border border-gray-800 rounded-lg p-2 md:p-3">
        <div className="text-[10px] md:text-xs text-gray-500 mb-1">{label}</div>
        <div className="text-xs md:text-sm text-white font-medium">{value}</div>
    </div>
);

// 素材状态徽章
// P2: 接入 useEraAssets hook 获取真实状态
const EraAssetStatusBadge: React.FC<{ subEraId: string }> = ({ subEraId }) => {
    const { status, isLoading } = useEraAssets(subEraId);

    if (isLoading) {
        return (
            <span className="px-2 py-1 rounded text-xs font-mono bg-gray-800/60 text-gray-400 border border-gray-700">
                ...
            </span>
        );
    }

    const cfg: Record<string, { cls: string; label: string }> = {
        ready: { cls: 'bg-green-900/60 text-green-400 border-green-700', label: '有素材' },
        pending: { cls: 'bg-yellow-900/40 text-yellow-400 border-yellow-700', label: '待生成' },
        missing: { cls: 'bg-red-900/40 text-red-400 border-red-700', label: '缺失' },
        unknown: { cls: 'bg-gray-800/60 text-gray-400 border border-gray-700', label: 'unknown' },
    };
    const c = cfg[status] || cfg.unknown;
    return (
        <span className={`px-2 py-1 rounded text-xs font-mono ${c.cls}`}>
            {c.label}
        </span>
    );
};
