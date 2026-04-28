// 时代图标映射
export const ERA_ICON_MAP: Record<string, string> = {
    sword: '⚔', ghost: '👻', seal: '🧧', temple: '🏛', eagle: '🦅', castle: '🏰',
    building: '🏛', shrine: '⛩', tophat: '🎩', sax: '🎷', factory: '🏭',
    city: '🌆', wheat: '🌾', radiation: '☢', robot: '🤖', warning: '⚠',
    rocket: '🚀', galaxy: '🌌', cyborg: '🦾', crystal: '💠', world: '🌍',
};

// 时代背景占位配置（用于 EraPreviewCard）
export const ERA_BG_CONFIG: Record<string, { bg: string; icon: string }> = {
    'ancient_eastern_wuxia': { bg: 'from-amber-900/30 to-stone-900', icon: 'sword' },
    'ancient_eastern_zhiguai': { bg: 'from-purple-900/30 to-gray-900', icon: 'ghost' },
    'ancient_eastern_myth': { bg: 'from-yellow-900/30 to-orange-900/20', icon: 'seal' },
    'ancient_western_greek': { bg: 'from-blue-900/40 to-stone-800', icon: 'temple' },
    'ancient_western_roman': { bg: 'from-red-900/30 to-stone-900', icon: 'eagle' },
    'ancient_western_medieval': { bg: 'from-stone-800/50 to-gray-900', icon: 'castle' },
    'modern_eastern_republic': { bg: 'from-gray-700/50 to-stone-800', icon: 'building' },
    'modern_eastern_meiji_taisho': { bg: 'from-rose-900/30 to-stone-800', icon: 'shrine' },
    'modern_western_victorian': { bg: 'from-amber-800/40 to-gray-900', icon: 'tophat' },
    'modern_western_jazz_age': { bg: 'from-yellow-800/30 to-amber-900/40', icon: 'sax' },
    'modern_western_postwar': { bg: 'from-gray-600/40 to-stone-800', icon: 'factory' },
    'contemporary_urban': { bg: 'from-blue-900/30 to-gray-900', icon: 'city' },
    'contemporary_rural': { bg: 'from-green-900/30 to-stone-800', icon: 'wheat' },
    'contemporary_post_apocalyptic': { bg: 'from-orange-900/30 to-gray-900', icon: 'radiation' },
    'near-future_cyberpunk': { bg: 'from-cyan-900/40 to-purple-900/40', icon: 'robot' },
    'near-future_dystopia': { bg: 'from-red-900/40 to-black', icon: 'warning' },
    'near-future_space_colonization': { bg: 'from-blue-900/40 to-black', icon: 'rocket' },
    'far-future_space_opera': { bg: 'from-indigo-900/40 to-black', icon: 'galaxy' },
    'far-future_cyborg': { bg: 'from-cyan-800/40 to-gray-900', icon: 'cyborg' },
    'far-future_virtual_reality': { bg: 'from-violet-900/40 to-black', icon: 'crystal' },
};
