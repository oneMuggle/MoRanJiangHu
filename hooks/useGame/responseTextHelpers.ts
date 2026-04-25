/** 响应文本和时间辅助函数 */

import type { GameResponse } from '../../types';
import { countOpenAIChatMessagesTokens, countOpenAITextTokens } from '../../utils/tokenEstimate';
import { normalizeCanonicalGameTime } from './timeUtils';

/** 获取原始AI消息 */
export const 获取原始AI消息 = (rawText: string): string => (typeof rawText === 'string' ? rawText : '');

/** 计算回复耗时秒 */
export const 计算回复耗时秒 = (startedAt: number, endedAt: number = Date.now()): number => {
    if (!Number.isFinite(startedAt) || startedAt <= 0) return 0;
    const elapsed = endedAt - startedAt;
    if (!Number.isFinite(elapsed) || elapsed <= 0) return 0;
    return Math.max(1, Math.round(elapsed / 1000));
};

/** 估算消息Token */
export const 估算消息Token = (
    messages: Array<{ role?: string; content?: string; name?: string }>,
    model?: string
): number => countOpenAIChatMessagesTokens(messages, model);

/** 估算AI输出Token */
export const 估算AI输出Token = (rawText: string, model?: string): number => (
    countOpenAITextTokens(typeof rawText === 'string' ? rawText : '', model)
);

/** 游戏时间转排序值 */
export const 游戏时间转排序值 = (input?: string): number | null => {
    const canonical = normalizeCanonicalGameTime(input);
    if (!canonical) return null;
    const matched = canonical.match(/^(\d{1,6}):(\d{2}):(\d{2}):(\d{2}):(\d{2})$/);
    if (!matched) return null;
    return (
        Number(matched[1]) * 100000000 +
        Number(matched[2]) * 1000000 +
        Number(matched[3]) * 10000 +
        Number(matched[4]) * 100 +
        Number(matched[5])
    );
};

/** 提取文本中的游戏时间列表 */
export const 提取文本中的游戏时间列表 = (text?: string): string[] => {
    if (!text || typeof text !== 'string') return [];
    const matched = text.match(/\d{1,6}:\d{1,2}:\d{1,2}:\d{1,2}:\d{1,2}/g) || [];
    const deduped: string[] = [];
    matched.forEach((item) => {
        const canonical = normalizeCanonicalGameTime(item);
        if (canonical && !deduped.includes(canonical)) deduped.push(canonical);
    });
    return deduped;
};

/** 当前时间已达到 */
export const 当前时间已达到 = (currentTime?: string, targetTime?: string): boolean => {
    const currentSort = 游戏时间转排序值(currentTime);
    const targetSort = 游戏时间转排序值(targetTime);
    if (currentSort === null || targetSort === null) return false;
    return currentSort >= targetSort;
};

/** 提取响应完整正文文本 */
export const 提取响应完整正文文本 = (response?: GameResponse): string => {
    const logs = Array.isArray(response?.logs) ? response.logs : [];
    return logs
        .map((item) => `${item?.sender || '旁白'}：${item?.text || ''}`.trim())
        .filter(Boolean)
        .join('\n')
        .trim();
};

type 最近正文回合结构 = {
    玩家输入: string;
    游戏时间: string;
    正文: string;
};

/** 收集最近完整正文回合 */
export const 收集最近完整正文回合 = (params: {
    history: any[];
    currentPlayerInput?: string;
    currentGameTime?: string;
    currentResponse?: GameResponse;
    maxTurns?: number;
}): 最近正文回合结构[] => {
    const maxTurns = Math.max(1, Number(params.maxTurns) || 3);
    const collected: 最近正文回合结构[] = [];
    const pushTurn = (item: 最近正文回合结构) => {
        if (!item.正文.trim()) return;
        const signature = `${item.游戏时间}__${item.玩家输入}__${item.正文}`;
        if (collected.some((existing) => `${existing.游戏时间}__${existing.玩家输入}__${existing.正文}` === signature)) {
            return;
        }
        collected.push(item);
    };

    const currentBody = 提取响应完整正文文本(params.currentResponse);
    if (currentBody) {
        pushTurn({
            玩家输入: params.currentPlayerInput || '',
            游戏时间: params.currentGameTime || '',
            正文: currentBody
        });
    }

    const history = Array.isArray(params.history) ? params.history : [];
    for (let i = history.length - 1; i >= 0 && collected.length < maxTurns; i -= 1) {
        const item = history[i];
        if (item?.role !== 'assistant' || !item?.structuredResponse) continue;
        const body = 提取响应完整正文文本(item.structuredResponse);
        if (!body) continue;
        let playerInput = '';
        for (let j = i - 1; j >= 0; j -= 1) {
            if (history[j]?.role === 'user') {
                playerInput = typeof history[j]?.content === 'string' ? history[j].content : '';
                break;
            }
        }
        pushTurn({
            玩家输入: playerInput,
            游戏时间: item.gameTime || '',
            正文: body
        });
    }

    return collected.slice(0, maxTurns).reverse();
};

/** 构建最近完整正文上下文 */
export const 构建最近完整正文上下文 = (rounds: 最近正文回合结构[]): string => (
    (Array.isArray(rounds) ? rounds : [])
        .map((item, index) => [
            `【正文片段${index + 1}】`,
            item.游戏时间 ? `游戏时间：${item.游戏时间}` : '游戏时间：未知',
            item.玩家输入 ? `玩家输入：${item.玩家输入}` : '玩家输入：',
            '完整正文：',
            item.正文
        ].join('\n'))
        .join('\n\n')
        .trim()
);
