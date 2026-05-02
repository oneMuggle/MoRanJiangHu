/**
 * 子纪元里模式提示词注入
 *
 * 根据选择的 SubEra 解析其 liMode 定义，生成里模式规则注入块。
 */

import { resolveEraNode } from '../../models/eraTheme';

/** 构建子纪元里模式注入提示词 */
export function 构建子纪元里模式注入(eraId: string | null | undefined, enabled: boolean = true): string | null {
    if (!eraId || !enabled) return null;

    const resolved = resolveEraNode(eraId);
    if (!resolved?.inherited.liMode) return null;

    const { name, description, rules } = resolved.inherited.liMode;
    return `【${name}（${description}）】\n${rules}`;
}

/** 判断当前 eraId 是否已有子纪元里模式生效（用于避免与 legacy 开关重复注入） */
export function 子纪元里模式是否已注入(
    eraId: string | null | undefined,
    启用子纪元里模式: Record<string, boolean> | undefined
): boolean {
    if (!eraId) return false;
    const perEraEnabled = 启用子纪元里模式?.[eraId];
    const enabled = perEraEnabled !== false;
    return 构建子纪元里模式注入(eraId, enabled) !== null;
}
