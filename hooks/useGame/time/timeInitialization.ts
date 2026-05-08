/**
 * 时间初始化 + 消息辅助工具
 * 从 useGame.ts 提取的节日同步、游戏时间初始化 useEffect，以及消息辅助函数
 */
import { useEffect } from 'react';
import { normalizeCanonicalGameTime, 环境时间转标准串, 提取环境月日 } from './timeUtils';
import type { 聊天记录结构, 游戏设置结构 } from '../../../types';

interface 时间初始化依赖 {
    环境: any;
    游戏初始时间: string | null;
    记忆系统: any;
    festivals: any[];
    设置环境: (updater: (prev: any) => any) => void;
    设置游戏初始时间: (value: string) => void;
}

interface 消息辅助依赖 {
    设置历史记录: (updater: (prev: 聊天记录结构[]) => 聊天记录结构[]) => void;
}

// --- 时间初始化 Hook ---

export function use时间初始化(deps: 时间初始化依赖) {
    const { 环境, 游戏初始时间, 记忆系统, festivals, 设置环境, 设置游戏初始时间 } = deps;

    // Frontend 联动：当游戏时间命中节日设定时，自动同步"名称/简介/效果"到环境
    useEffect(() => {
        const md = 提取环境月日(环境);
        const matched = md ? festivals.find(f => f.月 === md.month && f.日 === md.day) : undefined;
        const nextFestival = matched
            ? {
                名称: matched.名称?.trim() || '',
                简介: matched.描述?.trim() || '',
                效果: matched.效果?.trim() || ''
            }
            : null;

        const currentFestival = 环境?.节日 || null;
        const sameFestival = !!(
            (!currentFestival && !nextFestival) ||
            (
                currentFestival &&
                nextFestival &&
                (currentFestival.名称 || '') === (nextFestival.名称 || '') &&
                (currentFestival.简介 || '') === (nextFestival.简介 || '') &&
                (currentFestival.效果 || '') === (nextFestival.效果 || '')
            )
        );

        if (sameFestival) return;
        设置环境(prev => ({
            ...prev,
            节日: nextFestival
        }));
    }, [环境?.时间, 环境?.节日, festivals, 设置环境]);

    // 游戏初始时间初始化：从环境或回忆档案中获取
    useEffect(() => {
        if (游戏初始时间) return;
        const 占位开局时间 = '1:01:01:00:00';
        const 规范化可用起始时间 = (value?: string | null): string | null => {
            const canonical = normalizeCanonicalGameTime((value || '').trim());
            if (!canonical || canonical === 占位开局时间) return null;
            return canonical;
        };

        const currentTime = 规范化可用起始时间(环境时间转标准串(环境));
        if (currentTime) {
            设置游戏初始时间(currentTime);
            return;
        }

        const 回忆档案 = Array.isArray(记忆系统?.回忆档案) ? 记忆系统.回忆档案 : [];
        const 开局回忆 = 回忆档案.find((item) => item?.回合 === 1 || item?.名称 === '【回忆001】') || 回忆档案[0];
        const 回忆开局时间 = 规范化可用起始时间(开局回忆?.记录时间)
            || 规范化可用起始时间(开局回忆?.时间戳);
        if (!回忆开局时间) return;
        设置游戏初始时间(回忆开局时间);
    }, [环境, 游戏初始时间, 记忆系统, 设置游戏初始时间]);
}

// --- 消息辅助函数（纯函数，无需 hook）---

export const 构建标签解析选项 = (config: 游戏设置结构) => ({
    validateTagCompleteness: config?.启用标签检测完整性 === true,
    enableTagRepair: config?.启用标签修复 !== false,
    requireActionOptionsTag: config?.启用行动选项 !== false
});

export const 创建追加系统消息 = (设置历史记录: 消息辅助依赖['设置历史记录']) => {
    return (content: string, options?: { position?: 'tail' | 'after_last_turn' }) => {
        const text = (content || '').trim();
        if (!text) return;
        const position = options?.position || 'tail';
        const now = Date.now();
        const systemMsg: 聊天记录结构 = {
            role: 'system',
            content: text,
            timestamp: now
        };

        设置历史记录((prev) => {
            const history = Array.isArray(prev) ? [...prev] : [];
            if (position !== 'after_last_turn') {
                return [...history, systemMsg];
            }

            let lastTurnIndex = -1;
            for (let i = history.length - 1; i >= 0; i -= 1) {
                const item = history[i];
                if (item?.role === 'assistant' && item?.structuredResponse) {
                    lastTurnIndex = i;
                    break;
                }
            }
            if (lastTurnIndex < 0) {
                return [...history, systemMsg];
            }

            let insertAt = lastTurnIndex + 1;
            while (insertAt < history.length && history[insertAt]?.role !== 'user') {
                insertAt += 1;
            }
            history.splice(insertAt, 0, systemMsg);
            return history;
        });
    };
};
