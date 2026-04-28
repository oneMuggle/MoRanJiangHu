/**
 * useEraAssets.ts - 时代素材加载 Hook
 *
 * P2 阶段实现：提供时代素材就绪状态查询
 */

import { useState, useEffect, useCallback } from 'react';
import { checkEraAssetsStatus, loadEraAssets, type EraAssets, type EraAssetStatus } from '../services/assets/eraAssetsService';

export interface UseEraAssetsResult {
    status: EraAssetStatus;
    isLoading: boolean;
    error: string | null;
    assets: EraAssets | null;
    reload: () => void;
}

/**
 * 时代素材状态 Hook
 * @param eraId 时代 ID
 */
export function useEraAssets(eraId: string | null | undefined): UseEraAssetsResult {
    const [status, setStatus] = useState<EraAssetStatus>('unknown');
    const [assets, setAssets] = useState<EraAssets | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!eraId) {
            setStatus('unknown');
            setAssets(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const [newStatus, newAssets] = await Promise.all([
                checkEraAssetsStatus(eraId),
                loadEraAssets(eraId),
            ]);
            setStatus(newStatus);
            setAssets(newAssets);
        } catch (e) {
            setError(e instanceof Error ? e.message : '加载素材失败');
            setStatus('unknown');
        } finally {
            setIsLoading(false);
        }
    }, [eraId]);

    useEffect(() => {
        load();
    }, [load]);

    return {
        status,
        isLoading,
        error,
        assets,
        reload: load,
    };
}
