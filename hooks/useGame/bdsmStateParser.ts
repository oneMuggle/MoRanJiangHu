/**
 * bdsmStateParser.ts
 * 解析主剧情 AI 响应中的 <BDSM状态更新> 标签
 *
 * AI 在生成包含 BDSM 内容的剧情后，在响应末尾输出状态变更：
 * <BDSM状态更新>
 * { "任务更新": [...], "服从度变化": {...}, ... }
 * </BDSM状态更新>
 */

export interface 任务更新 {
    id: string;
    状态?: string;
    评价?: string;
}

export interface BDSM状态更新结果 {
    任务更新?: 任务更新[];
    服从度变化?: Record<string, number>;
    关系阶段推进?: Record<string, string>;
    契约更新?: { id: string; 违约次数?: number }[];
    里程碑?: { 类型: string; 时间: string; 描述: string }[];
    日常指令?: { content: string; category: string; duration: string; 是否完成: boolean; rewardHint: string; punishmentHint: string }[];
}

/**
 * 解析 AI 响应中的 <BDSM状态更新> 标签
 * 返回结构化数据，解析失败返回 null
 */
export const 解析BDSM状态更新 = (responseText: string): BDSM状态更新结果 | null => {
    if (!responseText) return null;

    const match = responseText.match(/<BDSM状态更新>\s*([\s\S]*?)\s*<\/BDSM状态更新>/);
    if (!match) return null;

    try {
        const parsed = JSON.parse(match[1].trim()) as BDSM状态更新结果;
        const hasData = parsed.任务更新 || parsed.服从度变化 || parsed.关系阶段推进 ||
                        parsed.契约更新 || parsed.里程碑 || parsed.日常指令;
        return hasData ? parsed : null;
    } catch {
        return null;
    }
};

/**
 * 从响应文本中移除 <BDSM状态更新> 标签块
 * 返回清理后的纯叙事文本
 */
export const 移除BDSM状态标签 = (responseText: string): string => {
    if (!responseText) return responseText;
    return responseText
        .replace(/<BDSM状态更新>[\s\S]*?<\/BDSM状态更新>/g, '')
        .trim();
};
