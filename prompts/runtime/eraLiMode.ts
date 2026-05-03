/**
 * 子纪元里模式提示词注入
 *
 * 根据选择的 SubEra 解析其 liMode 定义，生成里模式规则注入块。
 * 支持两种格式：
 *   1. 旧版：纯 rules 文本
 *   2. 强化版：结构化字段 + 强度级别
 */

import { resolveEraNode } from '../../models/eraTheme';
import { EraLiModeEnhanced } from '../../models/eraTheme/types';

/** 里模式强度级别 */
export type LiModeIntensity = '微暗' | '暧昧' | '露骨';

/** 根据强度级别过滤结构化字段 */
function filterByIntensity(li: EraLiModeEnhanced, intensity: LiModeIntensity): string {
    const parts: string[] = [];

    // 所有级别都包含的内容
    parts.push(`【${li.name}（${li.description}）】`);

    if (li.corePrinciple) {
        parts.push(`## 核心原理\n${li.corePrinciple}`);
    }
    if (li.powerSystem) {
        parts.push(`## 权力等级\n${li.powerSystem}`);
    }
    if (li.dualPersonalities && li.dualPersonalities.length > 0) {
        parts.push(`## 角色表里人格\n${li.dualPersonalities.map((p, i) => `${i + 1}. ${p}`).join('\n')}`);
    }

    // 暧昧级别及以上包含的内容
    if (intensity === '暧昧' || intensity === '露骨') {
        if (li.sceneTypes && li.sceneTypes.length > 0) {
            parts.push(`## 亲密场景类型\n${li.sceneTypes.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
        }
        if (li.desireMotives && li.desireMotives.length > 0) {
            parts.push(`## 欲望动机\n${li.desireMotives.map((m, i) => `${i + 1}. ${m}`).join('\n')}`);
        }
    }

    // 露骨级别包含的内容
    if (intensity === '露骨') {
        if (li.taboos && li.taboos.length > 0) {
            parts.push(`## 禁忌与边界\n${li.taboos.map((t, i) => `${i + 1}. ${t}`).join('\n')}`);
        }
        if (li.aiDirectives && li.aiDirectives.length > 0) {
            parts.push(`## AI 指令\n${li.aiDirectives.map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
        }
        if (li.intensityLevels?.露骨) {
            parts.push(`## 露骨级别规则\n${li.intensityLevels.露骨}`);
        }
    } else if (intensity === '暧昧' && li.intensityLevels?.暧昧) {
        parts.push(`## 暧昧级别规则\n${li.intensityLevels.暧昧}`);
    } else if (intensity === '微暗' && li.intensityLevels?.微暗) {
        parts.push(`## 微暗级别规则\n${li.intensityLevels.微暗}`);
    }

    return parts.join('\n\n');
}

/** 构建子纪元里模式注入提示词 */
export function 构建子纪元里模式注入(
    eraId: string | null | undefined,
    enabled: boolean = true,
    intensity?: LiModeIntensity
): string | null {
    if (!eraId || !enabled) return null;

    const resolved = resolveEraNode(eraId);
    const liMode = resolved?.inherited.liMode;
    if (!liMode) return null;

    // 判断是否为强化版（有结构化字段）
    const enhanced = liMode as EraLiModeEnhanced;
    const hasStructuredFields = !!(
        enhanced.corePrinciple ||
        enhanced.powerSystem ||
        enhanced.dualPersonalities ||
        enhanced.sceneTypes ||
        enhanced.desireMotives ||
        enhanced.aiDirectives ||
        enhanced.intensityLevels
    );

    if (hasStructuredFields) {
        const effectiveIntensity = intensity || '露骨';
        return filterByIntensity(enhanced, effectiveIntensity);
    }

    // 向后兼容：使用旧版 rules 文本
    if ('rules' in liMode && liMode.rules) {
        return `【${liMode.name}（${liMode.description}）】\n${liMode.rules}`;
    }

    return null;
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
