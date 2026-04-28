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

/** 动态加载时代素材清单 */
export async function loadEraManifest(eraId: string): Promise<EraManifest | null> {
    try {
        const manifestPath = `/data/era_assets/${eraId}/manifest.json`;
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
        return `/data/era_assets/${eraId}/${manifest.bgm}`;
    }

    // fallback: 通过 bgmTags 标签组合路径（仅作为备用）
    const bgmTags = node.bgmTags || [];
    if (bgmTags.length > 0) {
        // 常见的 bgm 文件名模式：eraId + _bgm.mp3
        return `/data/era_assets/${eraId}/${eraId}_bgm.mp3`;
    }

    return null;
}

/** 动态加载完整时代素材 */
export async function loadEraAssets(eraId: string): Promise<EraAssets> {
    const [manifest, bgmPath] = await Promise.all([
        loadEraManifest(eraId),
        getEraBgm(eraId),
    ]);

    const images = manifest?.images?.map(
        (img) => `/data/era_assets/${eraId}/${img}`
    ) || [];

    return {
        eraId,
        manifest,
        images,
        bgmPath,
    };
}
