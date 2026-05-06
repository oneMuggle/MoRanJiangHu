/**
 * services/eraAssets.ts - 时代素材加载服务（重导出）
 *
 * 本模块作为 eraAssetsService 的入口重导出，
 * 保持与规划文档一致的路径约定。
 */

export {
    loadEraManifest,
    checkEraAssetsStatus,
    getEraBgm,
    loadEraAssets,
    type EraManifest,
    type EraAssetStatus,
    type EraAssets,
} from './assets/eraAssetsService';
