/**
 * privateChatWorkflow.ts
 * 私聊发送工作流：LLM 回复生成 + 状态解析 + 变量更新
 *
 * 私聊消息不进入主剧情，而是通过独立的 LLM 调用生成 NPC 回复，
 * 同时解析 AI 响应中的 <欲望系统状态> 标签更新欲望系统和 BDSM 关系。
 */

import { 请求模型文本, 通用消息 } from '../../services/ai/chatCompletionClient';
import type { 当前可用接口结构 } from '../../utils/apiConfig';

export interface 私聊上下文 {
    npcId: string;
    npcName: string;
    玩家姓名: string;
    会话历史: { sender: string; content: string; isMe: boolean }[];
    校园系统?: any;
    apiConfig: 当前可用接口结构;
}

export interface 私聊回复结果 {
    npcReply: string;
    状态更新?: { 更新档案?: Record<string, any> };
}

/**
 * 构建私聊请求 prompt
 */
const 构建私聊提示词 = (ctx: 私聊上下文, 用户消息: string): string => {
    const 欲望系统 = ctx.校园系统?.欲望系统;
    const npc档案 = 欲望系统?.NPC欲望档案?.[ctx.npcId];
    const bdsM关系 = npc档案?.BDSM关系;

    let prompt = `你是${ctx.npcName}，正在与${ctx.玩家姓名}进行私聊对话。

请根据以下信息生成符合角色性格的私聊回复：
`;

    if (npc档案) {
        prompt += `\n【角色信息】
- 姓名：${npc档案.姓名 || ctx.npcName}
- 性格：${npc档案.性格特征 || '未知'}
- 身份：${npc档案.身份 || '学生'}
- 欲望阶段：${npc档案.欲望阶段 || '未知'}
`;
    }

    if (bdsM关系) {
        prompt += `\n【BDSM 关系状态】
- 关系阶段：${bdsM关系.阶段}
- 服从度：${bdsM关系.服从度}
- 安全词：${bdsM关系.安全词}
`;
    }

    prompt += `\n【对话要求】
1. 保持角色一致性，回复符合角色性格和当前关系状态
2. 私聊回复要自然、简短（一般不超过 100 字）
3. 如果涉及 BDSM 相关内容，注意安全词和底线约束
4. 如果需要更新欲望系统状态，在回复末尾输出 <欲望系统状态> 标签

【对方刚发送的消息】
${用户消息}

【示例格式】
你好，最近怎么样？

<欲望系统状态>
{"更新档案": {"${ctx.npcId}": {"服从度": 65}}}
</欲望系统状态>
`;

    return prompt;
};

/**
 * 构建私聊消息链
 */
const 构建私聊消息链 = (ctx: 私聊上下文, 用户消息: string): 通用消息[] => {
    const systemPrompt = 构建私聊提示词(ctx, 用户消息);

    // 取最近 10 条对话作为上下文
    const recentHistory = ctx.会话历史.slice(-10);
    const historyMessages: 通用消息[] = recentHistory.map(h => ({
        role: h.isMe ? 'user' as const : 'assistant' as const,
        content: h.content
    }));

    return [
        { role: 'system' as const, content: systemPrompt },
        ...historyMessages,
        { role: 'user' as const, content: 用户消息 }
    ];
};

/**
 * 解析 AI 响应中的 <欲望系统状态> 标签
 */
const 解析私聊状态更新 = (responseText: string): { 更新档案?: Record<string, any> } | undefined => {
    const match = responseText.match(/<欲望系统状态>\s*([\s\S]*?)\s*<\/欲望系统状态>/);
    if (!match) return undefined;
    try {
        return JSON.parse(match[1]);
    } catch {
        return undefined;
    }
};

/**
 * 提取纯文本回复（去掉 XML 标签）
 */
const 提取纯文本回复 = (responseText: string): string => {
    return responseText
        .replace(/<欲望系统状态>[\s\S]*?<\/欲望系统状态>/g, '')
        .trim();
};

/**
 * 执行私聊发送工作流
 */
export const 执行私聊发送工作流 = async (
    ctx: 私聊上下文,
    用户消息: string
): Promise<私聊回复结果> => {
    const messages = 构建私聊消息链(ctx, 用户消息);

    const response = await 请求模型文本(ctx.apiConfig, messages, {
        temperature: 0.8,
        streamOptions: undefined
    });

    const npcReply = 提取纯文本回复(response);
    const 状态更新 = 解析私聊状态更新(response);

    return { npcReply, 状态更新 };
};
