/**
 * sendWorkflow/memoryRecallPhase.ts
 * 回忆检索阶段 — 剧情回忆模型检索与标签注入逻辑
 * 仅处理回忆检索，不包含后续正文生成
 */

import { 规范化记忆系统 } from './memoryUtils';
import { 提取剧情回忆标签 } from './memoryRecall';
import { 执行剧情回忆检索 } from './recallWorkflow';
import { 构建COT伪装提示词 } from './promptRuntime';
import { 规范化游戏设置 } from '../../utils/gameSettings';
import type { 记忆系统结构 } from '../../types';
import type { 回忆检索进度 } from './independentStages';

// ─── 回忆检索阶段结果 ────────────────────────────────────────────────────────

export type 回忆检索阶段结果 = {
    sendInput: string;
    recallTag: string | undefined;
    attachedRecallPreview: string;
    /** 是否已自动跳过（静默确认模式） */
    silentConfirm: boolean;
};

// ─── 回忆检索阶段 ────────────────────────────────────────────────────────────

export const 执行回忆检索阶段 = async (params: {
    content: string;
    currentState: {
        apiConfig: any;
        记忆系统: 记忆系统结构;
        gameConfig: any;
    };
    options?: {
        onRecallProgress?: (progress: 回忆检索进度) => void;
    };
    callbacks?: {
        setShowSettings: (value: boolean) => void;
    };
}): Promise<{ result: 回忆检索阶段结果; nextRound: number; normalizedMemBeforeSend: 记忆系统结构 }> => {
    const { content, currentState, options, callbacks } = params;

    const recallConfig = currentState.apiConfig?.功能模型占位 || ({} as any);
    const recallFeatureEnabled = Boolean(recallConfig.剧情回忆独立模型开关);
    const recallMinRound = Math.max(1, Number(recallConfig.剧情回忆最早触发回合) || 10);
    const normalizedMemBeforeSend = 规范化记忆系统(currentState.记忆系统);
    const nextRound = (Array.isArray(normalizedMemBeforeSend.回忆档案)
        ? normalizedMemBeforeSend.回忆档案.length
        : 0) + 1;
    const recallRoundReady = nextRound >= recallMinRound;
    const extracted = 提取剧情回忆标签(content);
    let sendInput = extracted.cleanInput || content.trim();
    let recallTag = extracted.recallTag;
    let attachedRecallPreview = '';

    const recallRuntimeGameConfig = 规范化游戏设置(currentState.gameConfig);
    const recallExtraPrompt = [
        typeof recallRuntimeGameConfig.额外提示词 === 'string'
            ? recallRuntimeGameConfig.额外提示词.trim()
            : ''
    ]
        .filter(Boolean)
        .join('\n\n');
    const recallCotPseudoPrompt = recallRuntimeGameConfig.启用COT伪装注入 !== false
        ? 构建COT伪装提示词(recallRuntimeGameConfig)
        : '';

    // 静默确认模式：不需要用户确认，直接使用标签
    const silentConfirm = Boolean(currentState.apiConfig?.功能模型占位?.剧情回忆静默确认);

    if (recallFeatureEnabled && recallRoundReady && !recallTag) {
        try {
            options?.onRecallProgress?.({ phase: 'start', text: '正在检索剧情回忆...' });
            const recalled = await 执行剧情回忆检索(
                sendInput,
                normalizedMemBeforeSend,
                currentState.apiConfig,
                {
                    extraPrompt: recallExtraPrompt,
                    cotPseudoHistoryPrompt: recallCotPseudoPrompt,
                    onDelta: (_delta, accumulated) => {
                        options?.onRecallProgress?.({ phase: 'stream', text: accumulated });
                    }
                }
            );
            if (!recalled) {
                if (typeof window !== 'undefined') {
                    alert('已开启剧情回忆模型，但未配置可用接口。');
                }
                callbacks?.setShowSettings(true);
                throw new Error('回忆检索未配置可用接口');
            }
            attachedRecallPreview = recalled.previewText;
            options?.onRecallProgress?.({ phase: 'done', text: recalled.previewText });

            if (!silentConfirm) {
                // 需要用户确认 — 返回给上层中断流程
                return {
                    result: {
                        sendInput,
                        recallTag: recalled.tagContent,
                        attachedRecallPreview: recalled.previewText,
                        silentConfirm: false
                    },
                    nextRound,
                    normalizedMemBeforeSend
                };
            }
            recallTag = recalled.tagContent;
        } catch (error: any) {
            console.error('剧情回忆检索失败', error);
            options?.onRecallProgress?.({ phase: 'error', text: error?.message || '剧情回忆检索失败' });
            if (typeof window !== 'undefined') {
                alert(`剧情回忆检索失败：${error?.message || '未知错误'}`);
            }
            throw error;
        }
    }

    return {
        result: {
            sendInput,
            recallTag,
            attachedRecallPreview,
            silentConfirm: true // 无需确认或未触发
        },
        nextRound,
        normalizedMemBeforeSend
    };
};
