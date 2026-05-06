/**
 * models/eraAssets.ts - 时代素材类型定义
 *
 * 定义 era_assets 动态加载机制所需的类型
 */

import type { EraColors, EraTypography, EraUIStyle, UIDecoration } from './eraTheme';

/** 素材清单数据（从 manifest.json 解析） */
export interface EraManifest {
    id: string;
    status: 'complete' | 'pending' | 'missing';
    images: string[];
    bgm?: string;
    artStyle?: string;
    bgmTags?: string[];
}

/** 素材就绪状态 */
export type EraAssetStatus = 'ready' | 'pending' | 'missing' | 'unknown';

/** 时代素材包 */
export interface EraAssetBundle {
    subEraId: string;
    /** 场景图片数组 */
    sceneImages: ImageAsset[];
    /** BGM 音频资源 */
    bgm: AudioAsset | null;
    /** 素材清单 */
    manifest: EraManifest;
}

/** 图片资源 */
export interface ImageAsset {
    id: string;
    filename: string;
    url: string;
    /** 是否已缓存 */
    cached: boolean;
}

/** 音频资源 */
export interface AudioAsset {
    id: string;
    filename: string;
    url: string;
    /** 音频时长（秒） */
    duration?: number;
    /** 是否已缓存 */
    cached: boolean;
}

/** 素材加载结果 */
export interface EraAssets {
    eraId: string;
    manifest: EraManifest | null;
    images: string[];
    bgmPath: string | null;
}

/** 时代主题完整配置（供 useEraTheme hook 使用） */
export interface EraThemeConfig {
    /** 时代 ID */
    eraId: string;
    /** 时代名称 */
    name: string;
    /** 颜色配置 */
    colors: EraColors;
    /** 字体配置 */
    typography: EraTypography;
    /** UI 样式 */
    uiStyle: EraUIStyle;
    /** UI 文案映射 */
    uiCopy: Record<string, string>;
    /** 装饰效果列表 */
    decorations: UIDecoration[];
    /** 美术风格 */
    artStyle: string;
    /** BGM 标签 */
    bgmTags: string[];
}

/** 时代素材预加载状态 */
export interface EraAssetPreloadState {
    eraId: string;
    status: EraAssetStatus;
    progress: number; // 0-100
    loadedImages: number;
    totalImages: number;
}
