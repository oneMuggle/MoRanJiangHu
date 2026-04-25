/** 记忆总结处理器 */

import type { 记忆系统结构, NPC结构, 接口设置结构 } from '../../types';
import * as textAIService from '../../services/ai/text';
import {
    规范化记忆系统,
    规范化记忆配置,
    构建待处理记忆压缩任务,
    构建手动记忆压缩任务,
    应用记忆压缩结果,
    记忆压缩任务结构
} from './memoryUtils';
import { 应用NPC记忆总结, 构建手动NPC记忆总结候选, 构建自动NPC记忆总结候选, 构建NPC记忆总结回退文案 } from './npcMemorySummary';
import { 获取记忆总结接口配置, 接口配置是否可用 } from '../../utils/apiConfig';

type 记忆总结阶段类型 = 'idle' | 'remind' | 'processing' | 'review';

export type { 记忆总结阶段类型 };

export type NPC记忆总结任务结构 = {
    id: string;
    类型: 'npc_memory';
    npcId: string;
    npcName: string;
    批次: string[];
    批次条数: number;
    起始索引: number;
    结束索引: number;
    起始时间: string;
    结束时间: string;
    提示词模板: string;
    触发方式: 'auto' | 'manual';
    预留原始条数: number;
};

export const 创建记忆总结处理器 = (deps: {
    待处理记忆总结任务: 记忆压缩任务结构 | null;
    set待处理记忆总结任务: (v: 记忆压缩任务结构 | null) => void;
    记忆总结阶段: 记忆总结阶段类型;
    set记忆总结阶段: (v: 记忆总结阶段类型) => void;
    记忆总结草稿: string;
    set记忆总结草稿: (v: string) => void;
    记忆总结错误: string;
    set记忆总结错误: (v: string) => void;
    待处理NPC记忆总结队列: NPC记忆总结任务结构[];
    set待处理NPC记忆总结队列: React.Dispatch<React.SetStateAction<NPC记忆总结任务结构[]>>;
    NPC记忆总结阶段: 记忆总结阶段类型;
    setNPC记忆总结阶段: (v: 记忆总结阶段类型) => void;
    NPC记忆总结草稿: string;
    setNPC记忆总结草稿: (v: string) => void;
    NPC记忆总结错误: string;
    setNPC记忆总结错误: (v: string) => void;
    社交: NPC结构[];
    设置社交: (v: NPC结构[]) => void;
    记忆系统: 记忆系统结构;
    设置记忆系统: (v: 记忆系统结构) => void;
    memoryConfig: any;
    apiConfig: 接口设置结构;
    历史记录: any[];
    performAutoSave: (...args: any[]) => void;
    规范化社交列表: (list: any[], options?: { 合并同名?: boolean }) => any[];
}) => {
    const 构建NPC记忆总结任务 = (
        npc: NPC结构,
        trigger: 'auto' | 'manual'
    ): NPC记忆总结任务结构 | null => {
        const candidate = trigger === 'manual'
            ? 构建手动NPC记忆总结候选(npc?.记忆, deps.memoryConfig)
            : 构建自动NPC记忆总结候选(npc?.记忆, deps.memoryConfig);
        if (!candidate || !npc?.id) return null;
        const promptTemplate = (规范化记忆配置(deps.memoryConfig).NPC记忆总结提示词 || '').trim();
        return {
            id: `npc_memory_${npc.id}_${candidate.起始原始索引}_${candidate.结束原始索引}_${candidate.批次条数}_${trigger}`,
            类型: 'npc_memory',
            npcId: npc.id,
            npcName: npc.姓名 || npc.id,
            批次: candidate.批次.map((item, index) => `[${index}] [${item.时间 || '未知时间'}] ${item.内容}`),
            批次条数: candidate.批次条数,
            起始索引: candidate.起始原始索引,
            结束索引: candidate.结束原始索引,
            起始时间: candidate.起始时间,
            结束时间: candidate.结束时间,
            提示词模板: promptTemplate,
            触发方式: trigger,
            预留原始条数: candidate.预留原始条数
        };
    };

    const 构建NPC记忆总结用户提示词 = (task: NPC记忆总结任务结构): string => {
        const lines = [
            `请将以下 NPC 原始记忆压缩为一条总结记忆。`,
            `NPC：${task.npcName}`,
            `索引范围：${task.起始索引} - ${task.结束索引}`,
            `时间范围：${task.起始时间} - ${task.结束时间}`,
            `条目数量：${task.批次条数}`,
            `总结后仍保留的较新原始记忆条数：${task.预留原始条数}`,
            '输入条目如下：',
            ...task.批次
        ];
        return lines.join('\n');
    };

    const 清空NPC记忆总结流程 = (options?: { 保留队列?: boolean }) => {
        if (!options?.保留队列) {
            deps.set待处理NPC记忆总结队列([]);
        }
        deps.setNPC记忆总结阶段('idle');
        deps.setNPC记忆总结草稿('');
        deps.setNPC记忆总结错误('');
    };

    const 刷新NPC记忆总结队列 = (
        socialData: NPC结构[],
        options?: { 静默?: boolean }
    ) => {
        const normalizedList = deps.规范化社交列表(socialData, { 合并同名: false });
        const rebuiltQueue = normalizedList
            .map((npc) => 构建NPC记忆总结任务(npc, 'auto'))
            .filter((item): item is NPC记忆总结任务结构 => Boolean(item));

        deps.set待处理NPC记忆总结队列((prev) => {
            const activeId = prev[0]?.id;
            if (!activeId) return rebuiltQueue;
            const activeTask = rebuiltQueue.find((item) => item.id === activeId);
            const rest = rebuiltQueue.filter((item) => item.id !== activeId);
            return activeTask ? [activeTask, ...rest] : rebuiltQueue;
        });

        if (rebuiltQueue.length === 0) {
            清空NPC记忆总结流程();
            return;
        }
        if (!options?.静默 && deps.NPC记忆总结阶段 === 'idle') {
            deps.setNPC记忆总结阶段('remind');
        }
    };

    const 应用并同步社交列表 = (
        nextSocial: NPC结构[],
        options?: { 静默NPC总结提示?: boolean }
    ): NPC结构[] => {
        const normalized = deps.规范化社交列表(nextSocial, { 合并同名: false });
        deps.设置社交(normalized);
        刷新NPC记忆总结队列(normalized, { 静默: options?.静默NPC总结提示 === true });
        void deps.performAutoSave({ social: normalized, history: deps.历史记录, force: true });
        return normalized;
    };

    const 清空记忆总结流程 = (options?: { 保留任务?: boolean }) => {
        if (!options?.保留任务) {
            deps.set待处理记忆总结任务(null);
        }
        deps.set记忆总结阶段('idle');
        deps.set记忆总结草稿('');
        deps.set记忆总结错误('');
    };

    const 刷新记忆总结任务 = (
        memoryData: 记忆系统结构,
        options?: { 静默?: boolean }
    ) => {
        const nextTask = 构建待处理记忆压缩任务(
            规范化记忆系统(memoryData),
            规范化记忆配置(deps.memoryConfig)
        );
        if (!nextTask) {
            清空记忆总结流程();
            return;
        }
        const sameTask = deps.待处理记忆总结任务?.id === nextTask.id;
        deps.set待处理记忆总结任务(nextTask);
        if (sameTask && (deps.记忆总结阶段 === 'processing' || deps.记忆总结阶段 === 'review')) {
            return;
        }
        if (!sameTask) {
            deps.set记忆总结草稿('');
            deps.set记忆总结错误('');
        }
        if (!options?.静默) {
            deps.set记忆总结阶段('remind');
        }
    };

    const 应用并同步记忆系统 = (
        nextMemory: 记忆系统结构,
        options?: { 静默总结提示?: boolean }
    ): 记忆系统结构 => {
        const normalized = 规范化记忆系统(nextMemory);
        deps.设置记忆系统(normalized);
        刷新记忆总结任务(normalized, { 静默: options?.静默总结提示 === true });
        return normalized;
    };

    const 构建记忆总结用户提示词 = (task: 记忆压缩任务结构): string => {
        const sourceLabel = task.来源层 === '短期' ? '短期记忆' : '中期记忆';
        const targetLabel = task.目标层 === '中期' ? '中期记忆' : '长期记忆';
        const lines = [
            `请将以下${sourceLabel}压缩为${targetLabel}。`,
            `时间范围：${task.起始时间} - ${task.结束时间}`,
            `条目数量：${task.批次条数}`,
            '输入条目如下：',
            ...task.批次.map((item, index) => `[${index + 1}] ${item}`),
            '再次强调：若无重要内容，输出空字符串。'
        ];
        return lines.join('\n');
    };

    const 清理记忆总结输出 = (rawText: string): string => {
        let text = (rawText || '').trim();
        if (!text) return '';
        text = text
            .replace(/^```(?:text|markdown)?\s*/i, '')
            .replace(/```$/i, '')
            .trim();
        if (!text) return '';
        if (/^(?:无|暂无|无重要内容|无需输出|空|空字符串|无重要事件)[。！!？?]*$/i.test(text)) {
            return '';
        }
        return text;
    };

    const handleStartMemorySummary = async (): Promise<void> => {
        if (!deps.待处理记忆总结任务) return;
        const summaryApi = 获取记忆总结接口配置(deps.apiConfig);
        if (!接口配置是否可用(summaryApi)) {
            deps.set记忆总结错误('未配置可用接口，无法执行记忆总结。');
            deps.set记忆总结阶段('review');
            return;
        }
        const task = deps.待处理记忆总结任务;
        deps.set记忆总结阶段('processing');
        deps.set记忆总结错误('');
        try {
            const raw = await textAIService.generateMemoryRecall(
                task.提示词模板,
                构建记忆总结用户提示词(task),
                summaryApi
            );
            deps.set记忆总结草稿(清理记忆总结输出(raw));
            deps.set记忆总结阶段('review');
        } catch (error: unknown) {
            deps.set记忆总结草稿('');
            deps.set记忆总结错误((error as any)?.detail ?? (error as any)?.message ?? '记忆总结失败。');
            deps.set记忆总结阶段('review');
        }
    };

    const handleCancelMemorySummary = () => {
        清空记忆总结流程({ 保留任务: true });
    };

    const handleBackToMemorySummaryRemind = () => {
        if (!deps.待处理记忆总结任务) return;
        deps.set记忆总结阶段('remind');
        deps.set记忆总结错误('');
    };

    const handleUpdateMemorySummaryDraft = (nextDraft: string) => {
        deps.set记忆总结草稿(nextDraft);
    };

    const handleStartManualMemorySummary = (
        来源层: '短期' | '中期',
        起始索引: number,
        结束索引: number
    ) => {
        const task = 构建手动记忆压缩任务(
            规范化记忆系统(deps.记忆系统),
            规范化记忆配置(deps.memoryConfig),
            来源层,
            起始索引,
            结束索引
        );
        if (!task) return;
        deps.set待处理记忆总结任务(task);
        deps.set记忆总结草稿('');
        deps.set记忆总结错误('');
        deps.set记忆总结阶段('remind');
    };

    const handleApplyMemorySummary = () => {
        if (!deps.待处理记忆总结任务) return;
        const nextMemory = 应用记忆压缩结果(
            规范化记忆系统(deps.记忆系统),
            deps.待处理记忆总结任务,
            deps.记忆总结草稿
        );
        deps.set记忆总结阶段('idle');
        deps.set记忆总结草稿('');
        deps.set记忆总结错误('');
        const appliedMemory = 应用并同步记忆系统(nextMemory);
        void deps.performAutoSave({ memory: appliedMemory });
    };

    const handleStartNpcMemorySummary = async (): Promise<void> => {
        const currentTask = deps.待处理NPC记忆总结队列[0];
        if (!currentTask) return;
        const summaryApi = 获取记忆总结接口配置(deps.apiConfig);
        if (!接口配置是否可用(summaryApi)) {
            deps.setNPC记忆总结错误('未配置可用接口，无法执行 NPC 记忆总结。');
            deps.setNPC记忆总结阶段('review');
            return;
        }
        deps.setNPC记忆总结阶段('processing');
        deps.setNPC记忆总结错误('');
        try {
            const raw = await textAIService.generateMemoryRecall(
                currentTask.提示词模板,
                构建NPC记忆总结用户提示词(currentTask),
                summaryApi
            );
            const cleaned = 清理记忆总结输出(raw);
            deps.setNPC记忆总结草稿(cleaned || 构建NPC记忆总结回退文案(
                currentTask.批次.map((item) => {
                    const match = item.match(/^\[\d+\]\s+\[(.*?)\]\s+(.*)$/);
                    return {
                        时间: match?.[1] || '未知时间',
                        内容: match?.[2] || item
                    };
                })
            ));
            deps.setNPC记忆总结阶段('review');
        } catch (error: unknown) {
            deps.setNPC记忆总结草稿('');
            deps.setNPC记忆总结错误((error as any)?.detail ?? (error as any)?.message ?? 'NPC 记忆总结失败。');
            deps.setNPC记忆总结阶段('review');
        }
    };

    const handleCancelNpcMemorySummary = () => {
        清空NPC记忆总结流程({ 保留队列: true });
    };

    const handleBackToNpcMemorySummaryRemind = () => {
        if (!deps.待处理NPC记忆总结队列[0]) return;
        deps.setNPC记忆总结阶段('remind');
        deps.setNPC记忆总结错误('');
    };

    const handleUpdateNpcMemorySummaryDraft = (nextDraft: string) => {
        deps.setNPC记忆总结草稿(nextDraft);
    };

    const handleQueueManualNpcMemorySummary = (npcId: string) => {
        const targetNpc = (Array.isArray(deps.社交) ? deps.社交 : []).find((npc) => npc?.id === npcId);
        if (!targetNpc) return;
        const manualTask = 构建NPC记忆总结任务(targetNpc, 'manual');
        if (!manualTask) return;
        deps.set待处理NPC记忆总结队列((prev) => {
            const rest = prev.filter((item) => item.id !== manualTask.id);
            return [manualTask, ...rest];
        });
        deps.setNPC记忆总结草稿('');
        deps.setNPC记忆总结错误('');
        deps.setNPC记忆总结阶段('remind');
    };

    const handleApplyNpcMemorySummary = () => {
        const currentTask = deps.待处理NPC记忆总结队列[0];
        if (!currentTask) return;
        const targetNpc = (Array.isArray(deps.社交) ? deps.社交 : []).find((npc) => npc?.id === currentTask.npcId);
        if (!targetNpc) {
            刷新NPC记忆总结队列(Array.isArray(deps.社交) ? deps.社交 : [], { 静默: true });
            清空NPC记忆总结流程({ 保留队列: true });
            return;
        }
        const candidate = currentTask.触发方式 === 'manual'
            ? 构建手动NPC记忆总结候选(targetNpc.记忆, deps.memoryConfig)
            : 构建自动NPC记忆总结候选(targetNpc.记忆, deps.memoryConfig);
        if (!candidate) {
            刷新NPC记忆总结队列(Array.isArray(deps.社交) ? deps.社交 : [], { 静默: true });
            deps.setNPC记忆总结阶段('idle');
            deps.setNPC记忆总结草稿('');
            deps.setNPC记忆总结错误('');
            return;
        }
        const nextNpc = 应用NPC记忆总结(targetNpc, candidate, deps.NPC记忆总结草稿);
        const nextSocial = (Array.isArray(deps.社交) ? deps.社交 : []).map((npc) => npc?.id === targetNpc.id ? nextNpc : npc);
        应用并同步社交列表(nextSocial);
        deps.setNPC记忆总结阶段('idle');
        deps.setNPC记忆总结草稿('');
        deps.setNPC记忆总结错误('');
    };

    return {
        构建记忆总结用户提示词,
        清理记忆总结输出,
        handleStartMemorySummary,
        handleCancelMemorySummary,
        handleBackToMemorySummaryRemind,
        handleUpdateMemorySummaryDraft,
        handleStartManualMemorySummary,
        handleApplyMemorySummary,
        构建NPC记忆总结任务,
        构建NPC记忆总结用户提示词,
        清空NPC记忆总结流程,
        刷新NPC记忆总结队列,
        应用并同步社交列表,
        清空记忆总结流程,
        刷新记忆总结任务,
        应用并同步记忆系统,
        handleStartNpcMemorySummary,
        handleCancelNpcMemorySummary,
        handleBackToNpcMemorySummaryRemind,
        handleUpdateNpcMemorySummaryDraft,
        handleQueueManualNpcMemorySummary,
        handleApplyNpcMemorySummary
    };
};
