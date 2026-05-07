/**
 * sendWorkflow/responseProcessingPhase.ts
 * 响应处理阶段 — AI 响应解析后、正文润色、变量生成、规划分析、世界演变的完整处理链路
 */

import { 环境时间转标准串 } from '../time/timeUtils';
import { 按世界演变分流净化响应 } from '../response/storyResponseGuards';
import { 获取世界演变接口配置, 接口配置是否可用 } from '../../../utils/apiConfig';
import { 同步剧情小说分解时间校准 } from '../../../services/novel-decomposition/novelDecompositionCalibration';
import {
    规范化记忆系统,
    构建即时记忆条目,
    构建短期记忆条目,
    写入四段记忆
} from '../memory/memoryUtils';
import { 规范化记忆配置 } from '../memory/memoryUtils';
import { 处理BDSM状态更新, type BDSM状态更新回调 } from '../bdsmStateIntegration';
import { 解析见面预约更新 } from '../bdsmMeetingTrigger';
import type { GameResponse, 聊天记录结构, 剧情系统结构, 记忆系统结构 } from '../../../types';
import type { 世界演变进度, 规划分析进度, 正文润色进度, 变量生成进度, 设备消息进度 } from './independentStages';
import type { 回合快照结构 } from './index';
import type { 世界演变执行结果, 世界演变触发参数 } from '../world/worldEvolutionWorkflow';

// ─── 辅助类型（避免循环导入） ────────────────────────────────────────────────

export type 响应命令基础状态 = {
    角色: any;
    环境: any;
    社交: any[];
    世界: any;
    战斗: any;
    玩家门派: any;
    任务列表: any[];
    约定列表: any[];
    剧情: 剧情系统结构;
    女主剧情规划?: any;
};

// ─── 主剧情发送依赖（仅响应处理阶段需要的方法）───────────────────────────────

export type 响应处理阶段依赖 = {
    深拷贝: <T>(value: T) => T;
    processResponseCommands: (
        response: GameResponse,
        baseState?: Partial<{
            角色: any;
            环境: any;
            社交: any[];
            世界: any;
            战斗: any;
            玩家门派: any;
            任务列表: any[];
            约定列表: any[];
            剧情: 剧情系统结构;
            女主剧情规划?: any;
        }>,
        options?: { applyState?: boolean; rawContent?: string }
    ) => any;
    提取新增NPC列表: (beforeList: any[], afterList: any[]) => any[];
    触发新增NPC自动生图: (npcs: any[]) => void;
    触发场景自动生图: (params: {
        response: GameResponse;
        bodyText?: string;
        env?: any;
        turnNumber?: number;
        playerInput?: string;
        source?: 'auto' | 'manual' | 'retry';
        autoApply?: boolean;
    }) => void;
    应用常驻壁纸为背景: () => Promise<void> | void;
    设置剧情: (value: 剧情系统结构) => void;
    规范化剧情状态: (raw?: any, envLike?: any) => 剧情系统结构;
    规范化环境信息: (envLike?: any) => any;
    规范化女主剧情规划状态: (raw?: any) => any;
    规范化同人剧情规划状态: (raw?: any) => any;
    规范化同人女主剧情规划状态: (raw?: any) => any;
    计算回复耗时秒: (startedAt: number, finishedAt?: number) => number;
    估算AI输出Token: (text: string, model?: string) => number;
    应用并同步记忆系统: (memory: any, options?: { 静默总结提示?: boolean }) => void;
    设置历史记录: (value: 聊天记录结构[] | ((prev: 聊天记录结构[]) => 聊天记录结构[])) => void;
    执行正文润色: (
        baseResponse: GameResponse,
        rawText: string,
        options?: { manual?: boolean; playerInput?: string }
    ) => Promise<{ response: GameResponse; applied: boolean; error?: string; rawText?: string }>;
    后台执行统一规划分析: (params: {
        state: {
            环境: any;
            社交: any[];
            世界: any;
            剧情: 剧情系统结构;
            剧情规划: any;
            女主剧情规划?: any;
            同人剧情规划?: any;
            同人女主剧情规划?: any;
        };
        playerInput: string;
        gameTime: string;
        response: GameResponse;
    }) => Promise<{
        updated: boolean;
        message: string;
        rawText?: string;
        commands: any[];
        storyPlanCommands?: any[];
        heroinePlanCommands?: any[];
    }>;
    执行世界演变更新: (params?: 世界演变触发参数) => Promise<世界演变执行结果>;
    执行变量生成并合并响应: (params: {
        snapshot: 回合快照结构;
        parsedResponse: GameResponse;
        mergeTargetResponse?: GameResponse;
        displayResponse?: GameResponse;
        rawText: string;
        playerInput: string;
        inputTokens?: number;
        responseDurationSec?: number;
        worldEvolutionUpdated?: boolean;
        extraPromptAppend?: string;
        onProgress?: (progress: 变量生成进度) => void;
    }) => Promise<{
        mergedParsed: GameResponse;
        mergedDisplayResponse: GameResponse;
        variableCalibration: {
            commands: any[];
            reports: string[];
            rawText: string;
            model: string;
        } | null;
    } | null>;
    performAutoSave: (snapshot?: any) => Promise<void>;
    获取原始AI消息: (rawText: string) => string;
    提取原始报错详情: (error: any) => string;
    触发设备消息生成?: (params: {
        finalState: any;
        rawAiText: string;
        sendInput: string;
        signal?: AbortSignal;
    }) => Promise<{ summary?: string; rawText?: string } | void>;
    onBDSM状态更新?: BDSM状态更新回调;
    onBDSM见面预约更新?: (更新: { npcId: string; 新状态: string }) => void;
};

// ─── 响应处理阶段输入 ────────────────────────────────────────────────────────

export type 响应处理阶段输入 = {
    aiResult: {
        response: GameResponse;
        rawText: string;
    };
    currentState: {
        apiConfig: any;
        gameConfig: any;
        剧情: 剧情系统结构;
        角色: any;
        环境: any;
        社交: any[];
        世界: any;
        战斗: any;
        玩家门派: any;
        任务列表: any[];
        约定列表: any[];
        剧情规划: any;
        女主剧情规划?: any;
        同人剧情规划?: any;
        同人女主剧情规划?: any;
        开局配置?: any;
        都市网约车系统?: Record<string, unknown>;
    };
    requestMeta: {
        sendInput: string;
        currentGameTime: string;
        inputTokens: number;
        mainRequestStartedAt: number;
        historyBeforeSend: 聊天记录结构[];
        updatedDisplayHistory: 聊天记录结构[];
        updatedMemSys: 记忆系统结构;
        normalizedMemoryConfig: ReturnType<typeof 规范化记忆配置>;
        streamMarker: number;
        isStreaming: boolean;
    };
    turnSnapshot: 回合快照结构;
    options?: {
        onPolishProgress?: (progress: 正文润色进度) => void;
        onWorldEvolutionProgress?: (progress: 世界演变进度) => void;
        onPlanningProgress?: (progress: 规划分析进度) => void;
        onVariableGenerationProgress?: (progress: 变量生成进度) => void;
        onDeviceMessageProgress?: (progress: 设备消息进度) => void;
        abortSignal?: AbortSignal;
    };
};

// ─── 响应处理阶段输出 ────────────────────────────────────────────────────────

export type 响应处理阶段输出 = {
    finalParsedResponse: GameResponse;
    finalDisplayResponse: GameResponse;
    finalState: any;
    nextMemory: 记忆系统结构;
    newAiMsg: 聊天记录结构;
    pushedNpcList: any[];
    latestBodyText: string;
    rawAiText: string;
    responseDurationSec: number;
    worldEvolutionResult: 世界演变执行结果 | null;
};

// ─── 响应处理阶段 ────────────────────────────────────────────────────────────

export const 执行响应处理阶段 = async (
    input: 响应处理阶段输入,
    deps: 响应处理阶段依赖,
    执行可重试独立阶段: <T,>(params: {
        stageId: 'polish' | 'world' | 'planning' | 'variable';
        stageLabel: string;
        run: () => Promise<T>;
        beforeAttempt?: (attempt: number) => void;
        onAutoRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
        onError?: (errorText: string) => void;
        onSkip?: (errorText: string) => void;
        getErrorText?: (error: any) => string;
    }) => Promise<{ completed: boolean; result?: T }>,
    文章优化功能已开启: () => boolean,
    构建带索引命令文本: (commands: any[], startIndex: number) => string[]
): Promise<响应处理阶段输出> => {
    const { aiResult, currentState, requestMeta, turnSnapshot, options } = input;
    const { sendInput, currentGameTime, inputTokens, mainRequestStartedAt,
        historyBeforeSend, updatedDisplayHistory, updatedMemSys,
        normalizedMemoryConfig, streamMarker, isStreaming } = requestMeta;

    const worldEvolutionSplitEnabled = 接口配置是否可用(获取世界演变接口配置(currentState.apiConfig));

    // 构建命令基础状态
    const mainCommandBaseState: 响应命令基础状态 = {
        角色: deps.深拷贝(currentState.角色),
        环境: deps.深拷贝(currentState.环境),
        社交: deps.深拷贝(currentState.社交),
        世界: deps.深拷贝(currentState.世界),
        战斗: deps.深拷贝(currentState.战斗),
        玩家门派: deps.深拷贝(currentState.玩家门派),
        任务列表: deps.深拷贝(currentState.任务列表),
        约定列表: deps.深拷贝(currentState.约定列表),
        剧情: deps.深拷贝(currentState.剧情),
        女主剧情规划: deps.深拷贝(currentState.女主剧情规划)
    };

    let aiData = 按世界演变分流净化响应(aiResult.response, worldEvolutionSplitEnabled).response;
    let displayAiData = aiData;
    const socialBeforeMainCommands = deps.深拷贝(currentState.社交);
    let rawAiText = deps.获取原始AI消息
        ? deps.获取原始AI消息(aiResult.rawText)
        : aiResult.rawText;

    // ─── BDSM 状态更新解析 ──────────────────────────────────────────────
    if (deps.onBDSM状态更新) {
        rawAiText = 处理BDSM状态更新(rawAiText, deps.onBDSM状态更新);
    }

    // ─── BDSM 见面预约更新解析 ──────────────────────────────────────────────
    if (deps.onBDSM见面预约更新) {
        const 更新结果 = 解析见面预约更新(rawAiText);
        if (更新结果) {
            deps.onBDSM见面预约更新(更新结果);
        }
    }

    // ─── 都市网约车 NSFW 状态解析与应用 ────────────────────────────────
    const { 解析都市网约车系统状态更新, 移除都市网约车系统状态标签, 应用都市网约车状态更新 } =
        await import('../urbanDriverNSFWIntegration');
    const nsfwUpdate = 解析都市网约车系统状态更新(rawAiText);
    if (nsfwUpdate) {
        currentState.都市网约车系统 = 应用都市网约车状态更新(
            currentState.都市网约车系统,
            nsfwUpdate
        );
        rawAiText = 移除都市网约车系统状态标签(rawAiText);
    }

    // ─── 都市网约车 NSFW 引擎层激活 ──────────────────────────────────
    const 行程系统 = (currentState.都市网约车系统 as { 行程系统?: Record<string, unknown> } | undefined)?.行程系统;
    if (行程系统 && typeof 行程系统 === 'object') {
        try {
            const { 判定行程NSFW类型, 生成后果事件 } = await import('../urbanDriverNSFWEngine');
            const nsfw设置 = (currentState.gameConfig as any)?.都市网约车NSFW设置;
            const 时代ID = (currentState.环境 as any)?.时代配置ID;

            if (nsfw设置?.启用都市网约车NSFW系统 && 时代ID === 'contemporary_urban') {
                const 乘客欲望档案 = (行程系统 as any).乘客欲望档案 || {};
                const npcIds = Object.keys(乘客欲望档案);
                if (npcIds.length > 0) {
                    const 焦点NpcId = (() => {
                        const 阶段权重: Record<string, number> = { '克制': 0, '试探': 1, '渴望': 2, '沉沦': 3, '支配': 4 };
                        return npcIds.reduce((best, id) => {
                            const a = 乘客欲望档案[id];
                            const b = 乘客欲望档案[best];
                            return (阶段权重[a?.当前阶段] || 0) > (阶段权重[b?.当前阶段] || 0) ? id : best;
                        });
                    })();
                    const 焦点档案 = 乘客欲望档案[焦点NpcId];

                    if (焦点档案) {
                        const 当前地点 = (行程系统 as any).当前地点 || '城市主干道';
                        const 当前小时 = (() => {
                            const 时间串 = (currentState.环境 as any)?.时间 || '';
                            const parts = 时间串.split(':');
                            return parts.length >= 4 ? parseInt(parts[3], 10) || 12 : 12;
                        })();

                        const 下一行程类型 = 判定行程NSFW类型(
                            当前地点,
                            当前小时,
                            焦点档案,
                            nsfw设置,
                            {
                                乘客数量: 1,
                                到达后未离开: false,
                                常客搭乘次数: 0,
                                行车记录仪开启: (行程系统 as any).行车记录仪状态 === '录制中',
                            }
                        );

                        if (下一行程类型 && 焦点档案.暴露风险值 >= 0) {
                            const 后果 = 生成后果事件(
                                下一行程类型,
                                焦点档案.暴露风险值,
                                nsfw设置,
                                [焦点NpcId]
                            );
                            if (后果) {
                                const 现有后果 = Array.isArray((行程系统 as any).后果列表)
                                    ? (行程系统 as any).后果列表
                                    : [];
                                (行程系统 as any).后果列表 = [...现有后果, 后果];
                            }
                        }
                    }
                }
            }
        } catch {
            // 引擎层激活失败不影响主流程，静默跳过
        }
    }

    // ─── 正文润色阶段 ──────────────────────────────────────────────────────
    if (文章优化功能已开启()) {
        const polishStage = await 执行可重试独立阶段({
            stageId: 'polish',
            stageLabel: '文章优化',
            beforeAttempt: (attempt) => {
                options?.onPolishProgress?.({
                    phase: 'start',
                    text: attempt > 1
                        ? `正在重新提取并润色<正文>内容...（第 ${attempt} 次手动重试）`
                        : '正在提取并润色<正文>内容...'
                });
            },
            onAutoRetry: (attempt, maxAttempts, reason) => {
                options?.onPolishProgress?.({
                    phase: 'start',
                    text: `正文优化请求失败，正在自动重试（${attempt}/${maxAttempts}）${reason ? `：${reason}` : ''}`
                });
            },
            run: () => deps.执行正文润色(aiData, rawAiText, { playerInput: sendInput }),
            onError: (errorText) => {
                options?.onPolishProgress?.({
                    phase: 'error',
                    text: `${errorText || '正文优化失败，已保留原文。'}\n等待选择：重试当前阶段，或跳过继续。`
                });
            },
            onSkip: (errorText) => {
                options?.onPolishProgress?.({
                    phase: 'skipped',
                    text: `正文优化失败，已按用户选择跳过。${errorText ? `\n${errorText}` : ''}`
                });
            }
        });
        const polished = polishStage.result;
        if (polishStage.completed && polished) {
            if (polished.applied) {
                displayAiData = polished.response;
                options?.onPolishProgress?.({
                    phase: 'done',
                    text: `已应用优化结果（模型：${polished.response.body_optimized_model || '未知'}）`,
                    rawText: polished.rawText
                });
            } else {
                options?.onPolishProgress?.({
                    phase: 'done',
                    text: polished.error || '优化未生效，已保留原文。',
                    rawText: polished.rawText
                });
            }
        }
    } else {
        options?.onPolishProgress?.({
            phase: 'skipped',
            text: '正文优化功能未开启，已跳过。'
        });
    }

    // ─── 初始化命令执行状态 ──────────────────────────────────────────────
    let responseForExecution: GameResponse = {
        ...aiData,
        tavern_commands: Array.isArray(aiData.tavern_commands) ? [...aiData.tavern_commands] : []
    };
    let simulatedState = deps.processResponseCommands(responseForExecution, mainCommandBaseState, { applyState: false, rawContent: rawAiText });

    let finalParsedResponse: GameResponse = responseForExecution;
    let finalDisplayResponse: GameResponse = {
        ...displayAiData,
        tavern_commands: Array.isArray(responseForExecution.tavern_commands)
            ? [...responseForExecution.tavern_commands]
            : []
    };
    const mainStoryVariableResponse: GameResponse = {
        ...displayAiData,
        tavern_commands: Array.isArray(aiData?.tavern_commands) ? [...aiData.tavern_commands] : []
    };
    const 立即并入变量生成状态 = (nextResponse: GameResponse) => {
        simulatedState = deps.processResponseCommands(nextResponse, mainCommandBaseState, { rawContent: rawAiText });
        return simulatedState;
    };

    // ─── 变量生成阶段 ─────────────────────────────────────────────────────
    let variableGenerationResult: Awaited<ReturnType<typeof deps.执行变量生成并合并响应>> = null;
    const 变量生成前命令数 = Array.isArray(responseForExecution.tavern_commands)
        ? responseForExecution.tavern_commands.length
        : 0;

    const variableStage = await 执行可重试独立阶段({
        stageId: 'variable',
        stageLabel: '变量生成',
        beforeAttempt: (attempt) => {
            if (attempt <= 1) return;
            options?.onVariableGenerationProgress?.({
                phase: 'start',
                text: `正在重新执行变量生成...（第 ${attempt} 次手动重试）`
            });
        },
        onAutoRetry: (attempt, maxAttempts, reason) => {
            options?.onVariableGenerationProgress?.({
                phase: 'start',
                text: `变量生成请求失败，正在自动重试（${attempt}/${maxAttempts}）${reason ? `：${reason}` : ''}`
            });
        },
        run: () => deps.执行变量生成并合并响应({
            snapshot: turnSnapshot,
            parsedResponse: mainStoryVariableResponse,
            mergeTargetResponse: responseForExecution,
            displayResponse: finalDisplayResponse,
            rawText: rawAiText,
            playerInput: sendInput,
            inputTokens,
            responseDurationSec: deps.计算回复耗时秒(mainRequestStartedAt),
            worldEvolutionUpdated: false,
            onProgress: options?.onVariableGenerationProgress
        }),
        onError: (errorText) => {
            options?.onVariableGenerationProgress?.({
                phase: 'error',
                text: `${errorText || '变量生成失败'}\n等待选择：重试当前阶段，或跳过继续。`
            });
        },
        onSkip: (errorText) => {
            options?.onVariableGenerationProgress?.({
                phase: 'skipped',
                text: `变量生成失败，已按用户选择跳过。${errorText ? `\n${errorText}` : ''}`
            });
        },
        getErrorText: (error: any) => (
            deps.提取原始报错详情?.(error)
            || error?.message
            || '变量生成失败'
        )
    });
    variableGenerationResult = variableStage.result ?? null;

    if (variableStage.completed && variableGenerationResult?.mergedParsed) {
        responseForExecution = variableGenerationResult.mergedParsed;
        finalParsedResponse = variableGenerationResult.mergedParsed;
        finalDisplayResponse = variableGenerationResult.mergedDisplayResponse;
        displayAiData = variableGenerationResult.mergedDisplayResponse;
        simulatedState = deps.processResponseCommands(responseForExecution, mainCommandBaseState, { applyState: false });
        if (Array.isArray(responseForExecution.tavern_commands) && responseForExecution.tavern_commands.length > 0) {
            立即并入变量生成状态(responseForExecution);
        }
        if (variableGenerationResult.variableCalibration) {
            options?.onVariableGenerationProgress?.({
                phase: 'done',
                text: `变量生成完成，新增 ${variableGenerationResult.variableCalibration.commands.length} 条变量命令${variableGenerationResult.variableCalibration.model ? `（${variableGenerationResult.variableCalibration.model}）` : ''}，并已立即并入当前前台状态。`,
                rawText: variableGenerationResult.variableCalibration.rawText,
                commandTexts: 构建带索引命令文本(
                    variableGenerationResult.variableCalibration.commands,
                    变量生成前命令数 + 1
                )
            });
        }
    }

    // ─── 世界演变阶段 ─────────────────────────────────────────────────────
    let worldEvolutionResult: 世界演变执行结果 | null = null;
    const 变量生成后命令数 = Array.isArray(responseForExecution.tavern_commands)
        ? responseForExecution.tavern_commands.length
        : 0;

    if (worldEvolutionSplitEnabled) {
        const worldStage = await 执行可重试独立阶段({
            stageId: 'world',
            stageLabel: '动态世界',
            beforeAttempt: (attempt) => {
                options?.onWorldEvolutionProgress?.({
                    phase: 'start',
                    text: attempt > 1
                        ? `正在重新执行动态世界更新...（第 ${attempt} 次手动重试）`
                        : '正在执行动态世界更新...'
                });
            },
            onAutoRetry: (attempt, maxAttempts, reason) => {
                options?.onWorldEvolutionProgress?.({
                    phase: 'start',
                    text: `动态世界请求失败，正在自动重试（${attempt}/${maxAttempts}）${reason ? `：${reason}` : ''}`
                });
            },
            run: async () => {
                const worldContextResponse: GameResponse = {
                    ...displayAiData,
                    tavern_commands: Array.isArray(responseForExecution.tavern_commands)
                        ? [...responseForExecution.tavern_commands]
                        : []
                };
                const result = await deps.执行世界演变更新({
                    来源: 'story_dynamic',
                    动态世界线索: [],
                    applyCommands: false,
                    currentResponse: worldContextResponse,
                    stateBase: simulatedState
                });
                if (result.phase === 'error') {
                    const wrappedError = new Error(result.statusText || '动态世界更新失败');
                    (wrappedError as Error & { stageResult?: 世界演变执行结果 }).stageResult = result;
                    throw wrappedError;
                }
                return result;
            },
            getErrorText: (error: any) => (
                error?.stageResult?.statusText
                || deps.提取原始报错详情?.(error)
                || error?.message
                || '动态世界更新失败'
            ),
            onError: (errorText) => {
                options?.onWorldEvolutionProgress?.({
                    phase: 'error',
                    text: `${errorText || '动态世界更新失败'}\n等待选择：重试当前阶段，或跳过继续。`
                });
            },
            onSkip: (errorText) => {
                options?.onWorldEvolutionProgress?.({
                    phase: 'skipped',
                    text: `动态世界更新失败，已按用户选择跳过。${errorText ? `\n${errorText}` : ''}`
                });
            }
        });
        worldEvolutionResult = worldStage.result || null;
        if (worldStage.completed && worldEvolutionResult) {
            options?.onWorldEvolutionProgress?.({
                phase: worldEvolutionResult.phase,
                text: worldEvolutionResult.statusText || (worldEvolutionResult.ok ? '动态世界更新完成。' : '动态世界未产生更新。'),
                rawText: worldEvolutionResult.rawText,
                commandTexts: 构建带索引命令文本(worldEvolutionResult.commands, 变量生成后命令数 + 1)
            });
        }
    } else {
        options?.onWorldEvolutionProgress?.({
            phase: 'skipped',
            text: '世界演变独立链路未启用，已跳过。'
        });
    }

    if (worldEvolutionResult && worldEvolutionResult.commands.length > 0) {
        responseForExecution = {
            ...responseForExecution,
            tavern_commands: [
                ...(Array.isArray(responseForExecution.tavern_commands)
                    ? responseForExecution.tavern_commands
                    : []),
                ...worldEvolutionResult.commands
            ]
        };
        simulatedState = deps.processResponseCommands(responseForExecution, mainCommandBaseState, { applyState: false });
    }

    // ─── 规划分析阶段 ─────────────────────────────────────────────────────
    let 当前命令偏移 = 变量生成后命令数 + (worldEvolutionResult ? worldEvolutionResult.commands.length : 0);
    const planningStage = await 执行可重试独立阶段({
        stageId: 'planning',
        stageLabel: '规划分析',
        beforeAttempt: (attempt) => {
            options?.onPlanningProgress?.({
                phase: 'start',
                text: attempt > 1
                    ? `正在重新分析并修订剧情规划...（第 ${attempt} 次手动重试）`
                    : '正在分析并修订剧情规划...'
            });
        },
        onAutoRetry: (attempt, maxAttempts, reason) => {
            options?.onPlanningProgress?.({
                phase: 'start',
                text: `规划分析请求失败，正在自动重试（${attempt}/${maxAttempts}）${reason ? `：${reason}` : ''}`
            });
        },
        run: () => deps.后台执行统一规划分析({
            state: {
                环境: simulatedState.环境,
                社交: simulatedState.社交,
                世界: simulatedState.世界,
                剧情: simulatedState.剧情,
                剧情规划: simulatedState.剧情规划,
                女主剧情规划: simulatedState.女主剧情规划,
                同人剧情规划: simulatedState.同人剧情规划,
                同人女主剧情规划: simulatedState.同人女主剧情规划
            },
            playerInput: sendInput,
            gameTime: 环境时间转标准串(simulatedState.环境) || '未知时间',
            response: responseForExecution
        }),
        onError: (errorText) => {
            options?.onPlanningProgress?.({
                phase: 'error',
                text: `${errorText || '规划分析失败'}\n等待选择：重试当前阶段，或跳过继续。`
            });
        },
        onSkip: (errorText) => {
            options?.onPlanningProgress?.({
                phase: 'skipped',
                text: `规划分析失败，已按用户选择跳过。${errorText ? `\n${errorText}` : ''}`
            });
        },
        getErrorText: (error: any) => (
            deps.提取原始报错详情?.(error)
            || error?.message
            || '规划分析失败'
        )
    });

    const planningResult = planningStage.result;
    if (planningStage.completed && planningResult) {
        options?.onPlanningProgress?.({
            phase: planningResult.updated ? 'done' : 'skipped',
            text: planningResult.message,
            rawText: planningResult.rawText,
            commandTexts: 构建带索引命令文本(planningResult.commands, 当前命令偏移 + 1)
        });
        if (planningResult.commands.length > 0) {
            responseForExecution = {
                ...responseForExecution,
                tavern_commands: [
                    ...(Array.isArray(responseForExecution.tavern_commands)
                        ? responseForExecution.tavern_commands
                        : []),
                    ...planningResult.commands
                ]
            };
            当前命令偏移 += planningResult.commands.length;
            simulatedState = deps.processResponseCommands(responseForExecution, mainCommandBaseState, { applyState: false });
        }
    }

    finalParsedResponse = responseForExecution;
    finalDisplayResponse = {
        ...displayAiData,
        tavern_commands: Array.isArray(responseForExecution.tavern_commands)
            ? [...responseForExecution.tavern_commands]
            : []
    };

    // ─── 命令执行 ────────────────────────────────────────────────────────
    let finalState = deps.processResponseCommands(finalParsedResponse, mainCommandBaseState, { rawContent: rawAiText });
    const calibratedFinalStory = await 同步剧情小说分解时间校准({
        previousStory: currentState.剧情,
        nextStory: finalState.剧情,
        currentGameTime: 环境时间转标准串(finalState.环境) || currentGameTime,
        openingConfig: currentState.开局配置
    });
    if (JSON.stringify(calibratedFinalStory) !== JSON.stringify(finalState.剧情 || {})) {
        finalState = {
            ...finalState,
            剧情: deps.规范化剧情状态(calibratedFinalStory, finalState.环境)
        };
        deps.设置剧情(finalState.剧情);
    }

    // ─── 记忆更新 ────────────────────────────────────────────────────────
    const nextGameTime = 环境时间转标准串(finalState.环境) || '未知时间';
    const immediateEntry = 构建即时记忆条目(nextGameTime, sendInput, finalDisplayResponse);
    const shortEntry = 构建短期记忆条目(nextGameTime, finalDisplayResponse);
    const aiTurnTimestamp = Date.now();
    const responseDurationSec = deps.计算回复耗时秒(mainRequestStartedAt, aiTurnTimestamp);
    const nextMemory = 写入四段记忆(
        规范化记忆系统(updatedMemSys),
        immediateEntry,
        shortEntry,
        {
            immediateLimit: normalizedMemoryConfig.即时消息上传条数N,
            shortLimit: normalizedMemoryConfig.短期记忆阈值,
            midLimit: normalizedMemoryConfig.中期记忆阈值,
            recordTime: nextGameTime,
            timestamp: nextGameTime
        }
    );
    deps.应用并同步记忆系统(nextMemory);

    // ─── AI 消息构建 ─────────────────────────────────────────────────────
    const newAiMsg: 聊天记录结构 = {
        role: 'assistant',
        content: 'Structured Response',
        structuredResponse: finalDisplayResponse,
        rawJson: rawAiText,
        timestamp: aiTurnTimestamp,
        gameTime: nextGameTime,
        inputTokens,
        responseDurationSec,
        outputTokens: deps.估算AI输出Token(rawAiText, undefined)
    };

    if (isStreaming) {
        deps.设置历史记录((prev: 聊天记录结构[]) =>
            prev.map(item => {
                if (
                    item.timestamp === streamMarker
                    && item.role === 'assistant'
                    && !item.structuredResponse
                ) {
                    return { ...newAiMsg };
                }
                return item;
            })
        );
    } else {
        deps.设置历史记录([...updatedDisplayHistory, newAiMsg]);
    }

    // ─── NPC 自动生图 ─────────────────────────────────────────────────────
    const pushedNpcList = deps.提取新增NPC列表(socialBeforeMainCommands, finalState.社交);
    if (pushedNpcList.length > 0) {
        deps.触发新增NPC自动生图(pushedNpcList);
    }

    // ─── 场景自动生图 ─────────────────────────────────────────────────────
    const latestBodyText = (Array.isArray(finalDisplayResponse.logs) ? finalDisplayResponse.logs : [])
        .map((log) => `${log?.sender || '旁白'}：${log?.text || ''}`)
        .filter((line) => line.trim().length > 0)
        .join('\n');

    if (latestBodyText.trim()) {
        await deps.应用常驻壁纸为背景();
        deps.触发场景自动生图({
            response: finalDisplayResponse,
            bodyText: latestBodyText,
            env: finalState.环境,
            turnNumber: turnSnapshot.回档前状态.记忆系统.回忆档案?.length ?? 0,
            playerInput: sendInput,
            source: 'auto',
            autoApply: true
        });
    }

    // ─── 设备消息生成（回合末尾） ────────────────────────────────────────────
    if (deps.触发设备消息生成) {
        try {
            options?.onDeviceMessageProgress?.({ phase: 'start' });
            const deviceResult = await deps.触发设备消息生成({
                finalState,
                rawAiText,
                sendInput,
                signal: options?.abortSignal,
            });
            if (deviceResult) {
                const deviceText = deviceResult.summary || deviceResult.rawText;
                options?.onDeviceMessageProgress?.({
                    phase: 'done',
                    text: deviceText?.substring(0, 200),
                    rawText: deviceResult.rawText,
                });
            } else {
                options?.onDeviceMessageProgress?.({ phase: 'done' });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            options?.onDeviceMessageProgress?.({
                phase: 'error',
                text: `设备消息生成失败: ${errorMessage}`,
            });
        }
    }

    return {
        finalParsedResponse,
        finalDisplayResponse,
        finalState,
        nextMemory,
        newAiMsg,
        pushedNpcList,
        latestBodyText,
        rawAiText,
        responseDurationSec,
        worldEvolutionResult
    };
};
