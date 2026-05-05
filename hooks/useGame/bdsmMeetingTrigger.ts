/**
 * bdsmMeetingTrigger.ts
 * 见面触发器：检查见面预约是否到期，构建主剧情注入提示词
 */

import type { 见面预约 } from '../../models/campusPhone';

/**
 * 检查是否有到期的见面预约
 */
export const 检查到期见面预约 = (
    预约列表: 见面预约[] | undefined,
    当前回合: number
): 见面预约[] => {
    if (!预约列表 || 预约列表.length === 0) return [];

    return 预约列表.filter(预约 => {
        if (预约.状态 !== '已协商') return false;
        const 触发回合 = (预约.创建回合 || 0) + 预约.见面回合偏移;
        return 当前回合 >= 触发回合;
    });
};

/**
 * 构建见面注入提示词，供 systemPromptBuilder 注入到主剧情 prompt
 */
export const 构建见面注入提示词 = (预约: 见面预约): string => {
    return `## 见面预约触发

本轮有已预约的见面即将发生：
- 对方：${预约.npcName}
- 地点：${预约.见面地点}
- 安全词：${预约.安全词}
${预约.玩家底线.length > 0 ? `- 玩家底线：${预约.玩家底线.join('、')}` : ''}
${预约.npc底线 && 预约.npc底线.length > 0 ? `- NPC底线：${预约.npc底线.join('、')}` : ''}

请在本次剧情中生成${预约.npcName}与玩家在${预约.见面地点}见面的场景。
注意尊重安全词和底线约束，根据双方关系阶段生成合适的互动叙事。
见面结束后，请在回复末尾输出以下标签来更新预约状态：

<见面预约更新>
{"npcId": "${预约.npcId}", "新状态": "已见面"}
</见面预约更新>
`;
};

/**
 * 解析 AI 响应中的 <见面预约更新> 标签
 */
export const 解析见面预约更新 = (responseText: string): { npcId: string; 新状态: string } | null => {
    const match = responseText.match(/<见面预约更新>\s*([\s\S]*?)\s*<\/见面预约更新>/);
    if (!match) return null;
    try {
        const data = JSON.parse(match[1]);
        if (data.npcId && data.新状态) {
            return { npcId: data.npcId, 新状态: data.新状态 };
        }
    } catch {
        // ignore
    }
    return null;
};
