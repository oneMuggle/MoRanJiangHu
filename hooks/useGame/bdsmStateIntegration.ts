/**
 * bdsmStateIntegration.ts
 * 将 BDSM 状态解析器与主剧情发送工作流桥接
 *
 * 在主剧情 AI 响应处理后，解析 <BDSM状态更新> 标签并应用状态变更。
 */

import { 解析BDSM状态更新, 移除BDSM状态标签, type BDSM状态更新结果 } from './bdsmStateParser';

export type BDSM状态更新回调 = (result: BDSM状态更新结果) => void;

/**
 * 从校园系统状态构建 BDSM 相关的 prompt 上下文
 * 供主剧情请求构建时使用，让 AI 知道当前 BDSM 状态
 */
export const 构建BDSM上下文 = (校园系统?: any): string => {
    const 欲望系统 = 校园系统?.欲望系统;
    if (!欲望系统?.NPC欲望档案) return '';

    const 活跃关系: string[] = [];
    for (const [, 档案] of Object.entries(欲望系统.NPC欲望档案)) {
        const bdsM关系 = (档案 as any).BDSM关系;
        if (bdsM关系) {
            活跃关系.push(
                `【${(档案 as any)._npcName || '未知'} - BDSM关系】` +
                `阶段:${bdsM关系.阶段} 服从度:${bdsM关系.服从度} ` +
                `权力天平:${bdsM关系.权力天平} 安全词:${bdsM关系.安全词}`
            );
        }
    }
    return 活跃关系.join('\n');
};

/**
 * 处理 AI 响应中的 BDSM 状态更新
 * 1. 解析 <BDSM状态更新> 标签
 * 2. 调用回调应用状态变更
 * 3. 返回清理后的纯文本（不含状态标签）
 */
export const 处理BDSM状态更新 = (
    rawAiText: string,
    callback: BDSM状态更新回调
): string => {
    const 解析结果 = 解析BDSM状态更新(rawAiText);
    if (解析结果) {
        callback(解析结果);
    }
    return 移除BDSM状态标签(rawAiText);
};

/**
 * 构建校园 NSFW 运行时参数（供主剧情请求使用）
 */
export const 构建校园NSFW参数 = (state: {
    校园系统?: any;
    gameConfig?: any;
}): any => {
    const 欲望系统 = state.校园系统?.欲望系统;
    if (!欲望系统) return undefined;

    const npcIds = Object.keys(欲望系统.NPC欲望档案 || {});
    if (npcIds.length === 0) return undefined;

    const 阶段权重: Record<string, number> = { '克制': 0, '试探': 1, '渴望': 2, '沉沦': 3, '支配': 4 };
    const 焦点NpcId = npcIds.reduce((best, id) => {
        const a = 欲望系统.NPC欲望档案![id];
        const b = 欲望系统.NPC欲望档案![best];
        return (阶段权重[a?.当前阶段] || 0) > (阶段权重[b?.当前阶段] || 0) ? id : best;
    });

    const 焦点档案 = 欲望系统.NPC欲望档案?.[焦点NpcId];
    if (!焦点档案) return undefined;

    const 其他Npc摘要: string[] = [];
    for (const id of npcIds) {
        if (id === 焦点NpcId) continue;
        const 档案 = 欲望系统.NPC欲望档案![id];
        if (!档案) continue;
        其他Npc摘要.push(`${id}: ${档案.当前阶段}/${档案.关系轨道}(进度${档案.阶段进度}/${档案.轨道进度}) 暴露${档案.暴露风险值}`);
    }

    // 收集 BDSM 关系摘要
    const bdsm关系摘要: string[] = [];
    for (const id of npcIds) {
        const 档案 = 欲望系统.NPC欲望档案![id];
        const bdsM关系 = 档案?.BDSM关系;
        if (bdsM关系) {
            bdsm关系摘要.push(
                `${档案._npcName || id}: ${bdsM关系.阶段} 服从度${bdsM关系.服从度} 天平${bdsM关系.权力天平}`
            );
        }
    }

    return {
        欲望阶段: 焦点档案.当前阶段,
        关系轨道: 焦点档案.关系轨道,
        暴露风险: 焦点档案.暴露风险值,
        流言等级: 焦点档案.流言等级,
        露出偏好等级: 焦点档案.露出状态?.当前等级,
        紧张度: 焦点档案.紧张度状态?.当前值,
        权力倾向: 焦点档案.权力倾向,
        服从度: 焦点档案.服从度?.当前值,
        内容强度: state.gameConfig?.校园NSFW设置?.NSFW内容强度,
        其他Npc欲望摘要: 其他Npc摘要.length > 0 ? 其他Npc摘要.join('；') : undefined,
        BDSM关系摘要: bdsm关系摘要.length > 0 ? bdsm关系摘要.join('；') : undefined,
    };
};
