/**
 * eraAssetsService.ts - 时代素材加载服务
 *
 * P2 阶段实现：动态加载时代素材、检查素材就绪状态、获取时代 BGM
 */

import { allEraNodes } from '../../models/eraTheme';

/** 素材清单数据（从 manifest.json 解析） */
export interface EraManifest {
    id: string;
    status: 'complete' | 'pending' | 'missing';
    images: string[];
    bgm?: string;
}

/** 素材就绪状态 */
export type EraAssetStatus = 'ready' | 'pending' | 'missing' | 'unknown';

/** 素材加载结果 */
export interface EraAssets {
    eraId: string;
    manifest: EraManifest | null;
    images: string[];
    bgmPath: string | null;
}

// R2 CDN 基础 URL（通过环境变量配置，默认为空字符串）
const R2_CDN_BASE = (typeof window !== 'undefined' && (window as any).__R2_CDN_BASE__)
    || '';

const R2_MANIFEST_URLS = (eraId: string): string => {
    if (R2_CDN_BASE) {
        return `${R2_CDN_BASE.replace(/\/$/, '')}/data/era_assets/${eraId}/manifest.json`;
    }
    return `/data/era_assets/${eraId}/manifest.json`;
};

/** 动态加载时代素材清单 */
export async function loadEraManifest(eraId: string): Promise<EraManifest | null> {
    try {
        const manifestPath = R2_CDN_BASE
            ? `${R2_CDN_BASE.replace(/\/$/, '')}/data/era_assets/${eraId}/manifest.json`
            : `/data/era_assets/${eraId}/manifest.json`;
        const response = await fetch(manifestPath);
        if (!response.ok) {
            return null;
        }
        return await response.json() as EraManifest;
    } catch {
        return null;
    }
}

/** 检查时代素材就绪状态（读取 manifest.json） */
export async function checkEraAssetsStatus(eraId: string): Promise<EraAssetStatus> {
    const manifest = await loadEraManifest(eraId);
    if (!manifest) {
        return 'unknown';
    }
    switch (manifest.status) {
        case 'complete':
            return 'ready';
        case 'pending':
            return 'pending';
        case 'missing':
            return 'missing';
        default:
            return 'unknown';
    }
}

/** 获取时代的 BGM 路径（从 allEraNodes 查找 bgmTags） */
export async function getEraBgm(eraId: string): Promise<string | null> {
    // 从 allEraNodes 查找对应节点
    const node = allEraNodes.find((n) => n.id === eraId);
    if (!node) {
        return null;
    }

    // 尝试从 manifest 获取 bgm 文件名
    const manifest = await loadEraManifest(eraId);
    if (manifest?.bgm) {
        const base = R2_CDN_BASE || '';
        return base ? `${base}/data/era_assets/${eraId}/${manifest.bgm}` : `/data/era_assets/${eraId}/${manifest.bgm}`;
    }

    // fallback: 通过 bgmTags 标签组合路径（仅作为备用）
    const bgmTags = node.bgmTags || [];
    if (bgmTags.length > 0) {
        const base = R2_CDN_BASE || '';
        return base ? `${base}/data/era_assets/${eraId}/${eraId}_bgm.mp3` : `/data/era_assets/${eraId}/${eraId}_bgm.mp3`;
    }

    return null;
}

/** 动态加载完整时代素材 */
export async function loadEraAssets(eraId: string): Promise<EraAssets> {
    const [manifest, bgmPath] = await Promise.all([
        loadEraManifest(eraId),
        getEraBgm(eraId),
    ]);

    const base = R2_CDN_BASE || '';
    const images = manifest?.images?.map(
        (img) => base ? `${base}/data/era_assets/${eraId}/${img}` : `/data/era_assets/${eraId}/${img}`
    ) || [];

    return {
        eraId,
        manifest,
        images,
        bgmPath,
    };
}
