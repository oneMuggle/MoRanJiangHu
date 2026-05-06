/**
 * 跨时代移动设备 — 里模式样式
 * 
 * 提供各时代风格的里模式主题色和视觉效果
 */

import React from 'react';

export interface LiModeStyleConfig {
    /** 主标题色 */
    accentColor: string;
    /** 背景渐变起始色 */
    bgGradientStart: string;
    /** 背景渐变结束色 */
    bgGradientEnd: string;
    /** 边框色 */
    borderColor: string;
    /** 发光效果 */
    glowColor: string;
    /** 次要文字色 */
    mutedColor: string;
}

// 各时代的里模式样式配置
export const ERA_LI_MODE_STYLES: Record<string, LiModeStyleConfig> = {
    // ========== 当代 · 里都市 ==========
    contemporary_urban: {
        accentColor: '#6B2D8B',      // 暗紫
        bgGradientStart: '#1a1a2e',
        bgGradientEnd: '#16213e',
        borderColor: '#6B2D8B',
        glowColor: 'rgba(107, 45, 139, 0.5)',
        mutedColor: '#888',
    },
    // ========== 当代 · 里乡土 ==========
    contemporary_rural: {
        accentColor: '#2D5A27',      // 暗绿
        bgGradientStart: '#1a1f16',
        bgGradientEnd: '#0d1409',
        borderColor: '#2D5A27',
        glowColor: 'rgba(45, 90, 39, 0.5)',
        mutedColor: '#7a8b6a',
    },
    // ========== 当代 · 里废土 ==========
    contemporary_post_apocalyptic: {
        accentColor: '#8B3A3A',      // 锈红
        bgGradientStart: '#1a1414',
        bgGradientEnd: '#0d0909',
        borderColor: '#8B3A3A',
        glowColor: 'rgba(139, 58, 58, 0.5)',
        mutedColor: '#8b6a6a',
    },
    // ========== 当代 · 里黑色 ==========
    contemporary_noir: {
        accentColor: '#E2A03F',      // 琥珀黄
        bgGradientStart: '#1a1a2e',
        bgGradientEnd: '#0f0f1a',
        borderColor: '#1A1A2E',
        glowColor: 'rgba(226, 160, 63, 0.4)',
        mutedColor: '#888',
    },
    // ========== 当代 · 里嬉皮 ==========
    contemporary_hippie: {
        accentColor: '#9B59B6',      // 迷幻紫
        bgGradientStart: '#1a0f1a',
        bgGradientEnd: '#2d1f3d',
        borderColor: '#9B59B6',
        glowColor: 'rgba(155, 89, 182, 0.5)',
        mutedColor: '#9b8ab4',
    },
    // ========== 近未来 · 里赛博 ==========
    'near-future_cyberpunk': {
        accentColor: '#00FFFF',      // 赛博青
        bgGradientStart: '#0a0a1a',
        bgGradientEnd: '#001a1a',
        borderColor: '#00FFFF',
        glowColor: 'rgba(0, 255, 255, 0.5)',
        mutedColor: '#4a9a9a',
    },
    // ========== 近未来 · 里反乌托邦 ==========
    'near-future_dystopia': {
        accentColor: '#CC0000',      // 监控红
        bgGradientStart: '#1a0a0a',
        bgGradientEnd: '#0d0505',
        borderColor: '#CC0000',
        glowColor: 'rgba(204, 0, 0, 0.5)',
        mutedColor: '#8b4a4a',
    },
    // ========== 近未来 · 里星际拓荒 ==========
    'near-future_space_colonization': {
        accentColor: '#FFD700',      // 星光金
        bgGradientStart: '#0a0a1a',
        bgGradientEnd: '#050510',
        borderColor: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.4)',
        mutedColor: '#8a8a9a',
    },
    // ========== 古代东方 · 里模式通用 ==========
    ancient_eastern: {
        accentColor: '#5C1A1A',      // 暗朱砂
        bgGradientStart: '#1a0f0f',
        bgGradientEnd: '#0d0707',
        borderColor: '#5C1A1A',
        glowColor: 'rgba(92, 26, 26, 0.5)',
        mutedColor: '#8b6a6a',
    },
    // ========== 近代东方 · 里模式 ==========
    modern_eastern: {
        accentColor: '#5C1A1A',      // 暗朱砂
        bgGradientStart: '#1a1510',
        bgGradientEnd: '#0d0a07',
        borderColor: '#5C1A1A',
        glowColor: 'rgba(92, 26, 26, 0.5)',
        mutedColor: '#8b7a6a',
    },
    // ========== 远未来 · 里模式 ==========
    far_future: {
        accentColor: '#00FFFF',      // 赛博青
        bgGradientStart: '#0a0a1a',
        bgGradientEnd: '#001a1a',
        borderColor: '#00FFFF',
        glowColor: 'rgba(0, 255, 255, 0.5)',
        mutedColor: '#4a9a9a',
    },
    // ========== 后人类 · 里模式 ==========
    post_human: {
        accentColor: '#FFFFFF',      // 白色
        bgGradientStart: '#0a0a0a',
        bgGradientEnd: '#141414',
        borderColor: '#FFFFFF',
        glowColor: 'rgba(255, 255, 255, 0.3)',
        mutedColor: '#aaa',
    },
    // ========== 远古 · 里模式 ==========
    primordial: {
        accentColor: '#8B4513',      // 土褐色
        bgGradientStart: '#1a1510',
        bgGradientEnd: '#0d0a07',
        borderColor: '#8B4513',
        glowColor: 'rgba(139, 69, 19, 0.5)',
        mutedColor: '#8b7a6a',
    },
    // ========== 默认里模式 ==========
    default: {
        accentColor: '#6B2D8B',
        bgGradientStart: '#1a1a2e',
        bgGradientEnd: '#16213e',
        borderColor: '#2a2a4a',
        glowColor: 'rgba(107, 45, 139, 0.5)',
        mutedColor: '#888',
    },
};

/**
 * 根据 eraId 获取对应的里模式样式配置
 */
export function getLiModeStyleConfig(eraId: string): LiModeStyleConfig {
    // 精确匹配
    if (ERA_LI_MODE_STYLES[eraId]) {
        return ERA_LI_MODE_STYLES[eraId];
    }
    
    // 前缀匹配
    for (const [key, config] of Object.entries(ERA_LI_MODE_STYLES)) {
        if (eraId.startsWith(key)) {
            return config;
        }
    }
    
    // 时代类别匹配
    if (eraId.startsWith('contemporary_')) {
        if (eraId.includes('noir')) return ERA_LI_MODE_STYLES.contemporary_noir;
        if (eraId.includes('hippie')) return ERA_LI_MODE_STYLES.contemporary_hippie;
        if (eraId.includes('rural')) return ERA_LI_MODE_STYLES.contemporary_rural;
        if (eraId.includes('post_apocalyptic') || eraId.includes('zombie') || eraId.includes('nuclear') || eraId.includes('biohazard')) {
            return ERA_LI_MODE_STYLES.contemporary_post_apocalyptic;
        }
        return ERA_LI_MODE_STYLES.contemporary_urban;
    }
    if (eraId.startsWith('near-future_')) {
        if (eraId.includes('cyberpunk')) return ERA_LI_MODE_STYLES['near-future_cyberpunk'];
        if (eraId.includes('dystopia')) return ERA_LI_MODE_STYLES['near-future_dystopia'];
        if (eraId.includes('space_colonization')) return ERA_LI_MODE_STYLES['near-future_space_colonization'];
        return ERA_LI_MODE_STYLES['near-future_cyberpunk'];
    }
    if (eraId.startsWith('far-future_')) {
        return ERA_LI_MODE_STYLES.far_future;
    }
    if (eraId.startsWith('post-human_')) {
        return ERA_LI_MODE_STYLES.post_human;
    }
    if (eraId.startsWith('ancient_')) {
        return ERA_LI_MODE_STYLES.ancient_eastern;
    }
    if (eraId.startsWith('modern_')) {
        return ERA_LI_MODE_STYLES.modern_eastern;
    }
    if (eraId.startsWith('primordial_')) {
        return ERA_LI_MODE_STYLES.primordial;
    }
    
    return ERA_LI_MODE_STYLES.default;
}

interface LiModeStylesProps {
    eraId: string;
    children: React.ReactNode;
}

/**
 * 里模式样式提供者组件
 * 根据 eraId 应用对应的里模式视觉效果
 */
export const LiModeStyles: React.FC<LiModeStylesProps> = ({ eraId, children }) => {
    const config = getLiModeStyleConfig(eraId);
    
    return (
        <div
            className="li-mode-styled"
            style={{
                '--li-accent': config.accentColor,
                '--li-bg-start': config.bgGradientStart,
                '--li-bg-end': config.bgGradientEnd,
                '--li-border': config.borderColor,
                '--li-glow': config.glowColor,
                '--li-muted': config.mutedColor,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
};

export default LiModeStyles;
