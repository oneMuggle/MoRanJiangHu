/**
 * 子纪元里模式提示词注入
 *
 * 根据选择的 SubEra 解析其 liMode 定义，生成里模式规则注入块。
 * 支持两种格式：
 *   1. 旧版：纯 rules 文本
 *   2. 强化版：结构化字段 + 强度级别
 */

import { resolveEraNode } from '../../models/eraTheme';
import { EraLiModeEnhanced, LiModeStage } from '../../models/eraTheme/types';
import { NPC结构 } from '../../models/social';
import { 计算亲密度等级 } from '../../models/intimacy';

/** 里模式强度级别 */
export type LiModeIntensity = '微暗' | '暧昧' | '露骨';

/** 默认阶段规则 — 通用模板，SubEra 可通过 stageRules 覆盖 */
const DEFAULT_STAGE_RULES: Record<LiModeStage, string> = {
    平然: '【平然阶段】NPC 对亲密行为具有极高的心理接受度，将其视为日常互动的一部分。不会产生道德负担或心理冲突。生理反应（心跳加速、脸红、紧张等）保持正常人的自然水平。在私密环境中不会抗拒或制止亲密行为，心理上觉得理所当然。公共场合仍维持正常社交表现，不会主动暴露或引人注意。',
    羞耻: '【羞耻阶段】NPC 对亲密行为感到明显的羞耻、尴尬和不好意思，但不会产生反感、抗拒或制止行为。可能会有言语上的推脱（如"不要这样"），但行为上会配合。典型表现：面红耳赤、躲避眼神接触、小声说话、欲拒还迎。在私密环境中虽害羞但不会逃跑或呼救，公共场合严格维持正常社交形象。',
    欲望: '【欲望阶段】NPC 主动渴望并引导亲密行为。会通过暗示、挑逗、肢体接触等方式主动出击，制造独处机会、言语撩拨、故意靠近。行为可参考"痴女"元素：主动引导、大胆暗示、迫不及待但保持优雅。仅限于私密环境或不会被发现的场合，公共场合严格维持正常社交表现，不会大张旗鼓引起注意。',
};

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
        // 里模式专属事件引导
        parts.push(`## 里模式专属事件引导\n当里模式开启时，可生成专属亲密事件。事件应参考上述场景类型和欲望动机，在剧情推进中自然引入。事件不必标注"里模式"字样，但氛围与内容应符合里模式定义。`);
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

/** 构建里模式 NPC 原型注入提示词 — 从 SubEra liMode 的 dualPersonalities 提取表里人格模板 */
export function 构建里模式NPC原型注入(
    eraId: string | null | undefined,
    enabled: boolean = true
): string | null {
    if (!eraId || !enabled) return null;

    const resolved = resolveEraNode(eraId);
    const liMode = resolved?.inherited.liMode;
    if (!liMode) return null;

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

    // 仅增强版 liMode 才有结构化 dualPersonalities
    if (!hasStructuredFields) return null;

    if (!enhanced.dualPersonalities || enhanced.dualPersonalities.length === 0) return null;

    const parts = [
        '【里模式 NPC 表里人格模板】',
        '当里模式开启时，新登场的 NPC 应参考以下表里人格模板进行塑造。',
        'NPC 不必完全匹配某个模板，但应在性格、行为、外表与内在的反差上体现类似模式。',
        '',
        '可选人格原型：',
        ...enhanced.dualPersonalities.map((p, i) => `${i + 1}. ${p}`),
    ];

    return parts.join('\n');
}

/** 判断 NPC 里人格激活条件是否满足 */
function is里人格激活(
    npc: NPC结构,
    _eraId: string | null | undefined
): boolean {
    const cond = npc.里人格激活条件;
    if (!cond) return false;

    const 亲密度等级 = 计算亲密度等级(npc.好感度 ?? 0);
    if (cond.亲密度阈值 != null && 亲密度等级 < cond.亲密度阈值) return false;

    // 时间条件、地点条件、特定事件条件目前由 AI 自行判断，TS 层不做硬校验
    // 这些字段作为 prompt 提示告知 AI

    return true;
}

/** 构建 NPC 表里切换注入提示词 — 当 NPC 里人格激活时，告知 AI 该 NPC 当前的人格状态 */
export function 构建NPC表里切换注入(
    npc: NPC结构,
    eraId: string | null | undefined,
    liModeEnabled: boolean
): string | null {
    if (!liModeEnabled || !eraId) return null;

    const resolved = resolveEraNode(eraId);
    const liMode = resolved?.inherited.liMode;
    if (!liMode) return null;

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
    if (!hasStructuredFields || !enhanced.dualPersonalities?.length) return null;

    const 激活 = is里人格激活(npc, eraId);
    const 亲密度等级 = 计算亲密度等级(npc.好感度 ?? 0);

    // 更新当前人格状态
    npc.当前人格状态 = 激活 ? '里' : '表';

    if (!激活) return null;

    // 从 dualPersonalities 中找到最匹配的人格描述
    // 取第一个匹配的（dualPersonalities 格式为 "角色名：表——...；里——..."）
    const match = enhanced.dualPersonalities.find(p =>
        p.startsWith(npc.核心性格特征?.substring(0, 4) ?? '') ||
        p.includes(npc.身份?.substring(0, 4) ?? '')
    );

    const 里人格描述 = match
        ? match.split('里——')[1]?.split('；')[0] ?? match
        : `里人格已激活（亲密度等级${亲密度等级}）`;

    const parts = [
        `【${npc.姓名} — 里人格激活】`,
        `该角色当前处于里人格状态（亲密度等级 ${亲密度等级}）。`,
        `里人格表现：${里人格描述}`,
        `当与该角色互动时，应体现其里人格特质，对话风格和行为方式应与其表人格形成反差。`,
    ];

    if (npc.里人格激活条件?.时间条件) {
        parts.push(`时间偏好：${npc.里人格激活条件.时间条件}`);
    }
    if (npc.里人格激活条件?.地点条件) {
        parts.push(`地点偏好：${npc.里人格激活条件.地点条件}`);
    }

    return parts.join('\n');
}

/** 构建里模式阶段注入提示词 — 根据当前阶段返回 NPC 心理与行为引导规则 */
export function 构建里模式阶段注入(
    eraId: string | null | undefined,
    stage: LiModeStage,
    enabled: boolean
): string | null {
    if (!eraId || !enabled) return null;

    const resolved = resolveEraNode(eraId);
    const liMode = resolved?.inherited.liMode;
    if (!liMode) return null;

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
    if (!hasStructuredFields) return null;

    // 优先使用 SubEra 自定义 stageRules，否则使用通用模板
    const rule = enhanced.stageRules?.[stage] ?? DEFAULT_STAGE_RULES[stage];
    if (!rule) return null;

    return `## 里模式阶段：${stage}\n${rule}`;
}
