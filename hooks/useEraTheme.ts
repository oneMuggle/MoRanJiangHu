/**
 * useEraTheme.ts - 时代主题 Hook
 *
 * 功能：动态注入时代主题 CSS 变量、UI 装饰效果、时代文案
 * 用法：
 *   const theme = useEraTheme(eraId);
 *   // theme.colors.primary === '#xxx'
 *   // theme.decorations === ['scanline', 'grain']
 */

import { useMemo } from 'react';
import { resolveEraNode } from '../models/eraTheme';
import type { UIDecoration } from '../models/eraTheme';
import type { EraThemeConfig } from '../models/eraAssets';

/** 默认主题配置（古代武侠风格） */
const DEFAULT_THEME: EraThemeConfig = {
    eraId: 'ancient_eastern_wuxia',
    name: '武侠',
    colors: {
        'ink-black': '#0a0a0a',
        'ink-gray': '#2d2d2d',
        primary: '#c9a962',
        'primary-dark': '#8b6914',
        secondary: '#4a3728',
        accent: '#d4af37',
        'paper-white': '#f5f0e6',
    },
    typography: {
        页面标题: 'font-serif',
        正文: 'font-serif',
        等宽: 'font-mono',
    },
    uiStyle: {
        style: 'classical',
        tone: 'formal',
        decorations: [],
    },
    uiCopy: {},
    decorations: [],
    artStyle: '水墨武侠',
    bgmTags: ['民乐', '古筝', '笛子', '武侠'],
};

/**
 * 解析时代节点并构建主题配置
 */
export function resolveEraThemeConfig(eraId: string | null | undefined): EraThemeConfig {
    if (!eraId) return DEFAULT_THEME;

    const resolved = resolveEraNode(eraId);
    if (!resolved) return DEFAULT_THEME;

    const { inherited, node } = resolved;

    return {
        eraId: node.id,
        name: node.name,
        colors: inherited.colors || DEFAULT_THEME.colors,
        typography: inherited.typography || DEFAULT_THEME.typography,
        uiStyle: inherited.uiStyle || DEFAULT_THEME.uiStyle,
        uiCopy: inherited.uiCopy || {},
        decorations: inherited.uiStyle?.decorations || [],
        artStyle: inherited.artStyle || DEFAULT_THEME.artStyle,
        bgmTags: inherited.bgmTags || [],
    };
}

/**
 * useEraTheme Hook
 *
 * @param eraId - 时代 ID（SubEra 级别）
 * @returns 时代主题配置
 */
export function useEraTheme(eraId: string | null | undefined): EraThemeConfig {
    return useMemo(() => resolveEraThemeConfig(eraId), [eraId]);
}

/**
 * 5 种 UI 装饰效果对应的 CSS 类名
 */
export const DECORATION_CSS_CLASSES: Record<UIDecoration, string> = {
    scanline: 'era-decoration-scanline',
    grain: 'era-decoration-grain',
    'ink-bleed': 'era-decoration-ink-bleed',
    'neon-flicker': 'era-decoration-neon-flicker',
    holographic: 'era-decoration-holographic',
};

/**
 * 获取装饰效果对应的 CSS 类名列表
 */
export function getDecorationClasses(decorations: UIDecoration[]): string[] {
    return decorations.map((d) => DECORATION_CSS_CLASSES[d]).filter(Boolean);
}

/**
 * 应用时代主题 CSS 变量到 document root
 * 调用时机：游戏初始化、时代切换时
 */
export function applyEraThemeCSSVariables(config: EraThemeConfig): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // 颜色变量
    if (config.colors) {
        root.style.setProperty('--era-ink-black', config.colors['ink-black']);
        root.style.setProperty('--era-ink-gray', config.colors['ink-gray']);
        root.style.setProperty('--era-primary', config.colors.primary);
        root.style.setProperty('--era-primary-dark', config.colors['primary-dark']);
        root.style.setProperty('--era-secondary', config.colors.secondary);
        root.style.setProperty('--era-accent', config.colors.accent);
        root.style.setProperty('--era-paper-white', config.colors['paper-white']);
    }

    // UI 样式变量
    if (config.uiStyle) {
        root.style.setProperty('--era-ui-style', config.uiStyle.style);
        root.style.setProperty('--era-ui-tone', config.uiStyle.tone);
    }
}

/**
 * 清除时代主题 CSS 变量（恢复默认）
 */
export function clearEraThemeCSSVariables(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const vars = [
        '--era-ink-black',
        '--era-ink-gray',
        '--era-primary',
        '--era-primary-dark',
        '--era-secondary',
        '--era-accent',
        '--era-paper-white',
        '--era-ui-style',
        '--era-ui-tone',
    ];

    vars.forEach((v) => root.style.removeProperty(v));
}
