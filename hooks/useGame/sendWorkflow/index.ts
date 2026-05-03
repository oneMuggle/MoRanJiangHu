/**
 * sendWorkflow/index.ts
 * 主剧情发送工作流入口
 * 组合回忆检索阶段、响应处理阶段及独立阶段调度
 */

import * as textAIService from '../../../services/ai/text';
import type {
    GameResponse,
    OpeningConfig,
    聊天记录结构,
    记忆系统结构,
    角色数据结构,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    世界书结构,
    内置提示词条目结构
} from '../../../types';
import { 获取主剧情接口配置, 接口配置是否可用 } from '../../../utils/apiConfig';
import { 规范化游戏设置 } from '../../../utils/gameSettings';
import { 规范化记忆配置, 规范化记忆系统 } from '../memoryUtils';

import { 构建主剧情请求参数, type 主剧情系统上下文 } from '.../mainStoryRequest';
import { 环境时间转标准串 } from '.../timeUtils';
import { 获取激活小说拆分注入文本 } from '../../../../services/novel-decomposition/novelDecompositionInjection';
import type { 响应命令处理状态 } from '.../responseCommandProcessor';
import type { 自动存档快照结构 } from '.../saveCoordinator';
import type { 世界演变触发参数, 世界演变执行结果 } from '../worldEvolutionWorkflow';

// ─── 从子模块重新导出类型 ────────────────────────────────────────────────────

export type {
    回忆检索进度,
    正文润色进度,
    变量生成进度,
    独立阶段标识,
    独立阶段失败决策,
    独立阶段失败决策参数,
    规划分析进度,
    世界演变进度,
} from './independentStages';

export { 构建可重试独立阶段执行器 } from './independentStages';
export { 执行回忆检索阶段, type 回忆检索阶段结果 } from './memoryRecallPhase';

// ─── 工具函数重新导出 ────────────────────────────────────────────────────────

export {
    格式化命令展示路径,
    序列化命令文本,
    构建带索引命令文本
} from './independentStages';

// ─── 发送选项 ───────────────────────────────────────────────────────────────

export type 发送选项 = {
    onRecallProgress?: (progress: import('./independentStages').回忆检索进度) => void;
    onPolishProgress?: (progress: import('./independentStages').正文润色进度) => void;
    onWorldEvolutionProgress?: (progress: import('./independentStages').世界演变进度) => void;
    onPlanningProgress?: (progress: import('./independentStages').规划分析进度) => void;
    onVariableGenerationProgress?: (progress: import('./independentStages').变量生成进度) => void;
    onStageFailureDecision?: (params: import('./independentStages').独立阶段失败决策参数) =>
        Promise<import('./independentStages').独立阶段失败决策> |
        import('./independentStages').独立阶段失败决策;
};

export type 发送结果 = {
    cancelled?: boolean;
    attachedRecallPreview?: string;
    preparedRecallTag?: string;
    needRecallConfirm?: boolean;
    needRerollConfirm?: boolean;
    parseErrorMessage?: string;
    parseErrorDetail?: string;
    parseErrorRawText?: string;
    errorDetail?: string;
    errorTitle?: string;
};

// ─── 回合快照结构 ────────────────────────────────────────────────────────────

export type 回合快照结构 = {
    玩家输入: string;
    游戏时间: string;
    回档前状态: {
        角色: any;
        环境: any;
        社交: any[];
        世界: any;
        战斗: any;
        玩家门派: any;
        任务列表: any[];
        约定列表: any[];
        剧情: 剧情系统结构;
        剧情规划: 剧情规划结构;
        女主剧情规划?: 女主剧情规划结构;
        同人剧情规划?: 同人剧情规划结构;
        同人女主剧情规划?: 同人女主剧情规划结构;
        记忆系统: 记忆系统结构;
    };
    回档前持久态: {
        视觉设置: any;
        场景图片档案: any;
    };
    回档前历史: 聊天记录结构[];
};

// ─── 主剧情发送当前状态 ──────────────────────────────────────────────────────

type 主剧情发送当前状态 = {
    历史记录: 聊天记录结构[];
    记忆系统: 记忆系统结构;
    角色: 角色数据结构;
    环境: any;
    社交: any[];
    世界: any;
    战斗: any;
    玩家门派: any;
    任务列表: any[];
    约定列表: any[];
    剧情: 剧情系统结构;
    剧情规划: 剧情规划结构;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;
    开局配置?: OpeningConfig;
    loading: boolean;
    gameConfig: any;
    apiConfig: any;
    memoryConfig: any;
    visualConfig: any;
    sceneImageArchive: any;
    prompts: any[];
    内置提示词列表: 内置提示词条目结构[];
    世界书列表: 世界书结构[];
};

// ─── 主剧情发送依赖 ─────────────────────────────────────────────────────────

type 主剧情发送依赖 = {
    abortControllerRef: { current: AbortController | null };
    setLoading: (value: boolean) => void;
    setShowSettings: (value: boolean) => void;
    设置剧情: (value: 剧情系统结构) => void;
    设置历史记录: (value: 聊天记录结构[] | ((prev: 聊天记录结构[]) => 聊天记录结构[])) => void;
    应用并同步记忆系统: (memory: 记忆系统结构, options?: { 静默总结提示?: boolean }) => void;
    构建系统提示词: (promptPool: any[], memoryData: 记忆系统结构, socialData: any[], statePayload: any, options?: any) => 主剧情系统上下文 & {
        runtimePromptStates: Record<string, any>;
    };
    processResponseCommands: (
        response: GameResponse,
        baseState?: Partial<响应命令处理状态>,
        options?: { applyState?: boolean }
    ) => 响应命令处理状态;
    performAutoSave: (snapshot?: 自动存档快照结构) => Promise<void>;
    执行正文润色: (
        baseResponse: GameResponse,
        rawText: string,
        options?: { manual?: boolean; playerInput?: string }
    ) => Promise<{ response: GameResponse; applied: boolean; error?: string; rawText?: string }>;
    执行世界演变更新: (params?: 世界演变触发参数) => Promise<世界演变执行结果>;
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
    提取新增NPC列表: (beforeList: any[], afterList: any[]) => any[];
    推入重Roll快照: (snapshot: 回合快照结构) => void;
    弹出重Roll快照: () => 回合快照结构 | undefined;
    回档到快照: (snapshot: 回合快照结构, options?: { 保留图片状态?: boolean }) => void;
    深拷贝: <T>(value: T) => T;
    按回合窗口裁剪历史: (history: 聊天记录结构[], rounds: number) => 聊天记录结构[];
    规范化环境信息: (envLike?: any) => any;
    规范化剧情状态: (raw?: any, envLike?: any) => 剧情系统结构;
    规范化剧情规划状态: (raw?: any) => 剧情规划结构;
    规范化女主剧情规划状态: (raw?: any) => 女主剧情规划结构 | undefined;
    规范化同人剧情规划状态: (raw?: any) => 同人剧情规划结构 | undefined;
    规范化同人女主剧情规划状态: (raw?: any) => 同人女主剧情规划结构 | undefined;
    规范化世界状态: (raw?: any) => any;
    游戏设置启用自动重试: (config?: any) => boolean;
    执行带自动重试的生成请求: <T>(params: {
        enabled: boolean;
        action: () => Promise<T>;
        onRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
    }) => Promise<T>;
    更新流式草稿为自动重试提示: (history: 聊天记录结构[], attempt: number, maxAttempts: number, reason?: string) => 聊天记录结构[];
    提取解析失败原始信息: (error: any) => string;
    提取原始报错详情: (error: any) => string;
    格式化错误详情: (error: any) => string;
    获取原始AI消息: (rawText: string) => string;
    估算消息Token: (messages: Array<{ role?: string; content?: string; name?: string }>, model?: string) => number;
    估算AI输出Token: (text: string, model?: string) => number;
    计算回复耗时秒: (startedAt: number, finishedAt?: number) => number;
    文章优化功能已开启: () => boolean;
    后台执行统一规划分析: (params: {
        state: {
            环境: any;
            社交: any[];
            世界: any;
            剧情: 剧情系统结构;
            剧情规划: 剧情规划结构;
            女主剧情规划?: 女主剧情规划结构;
            同人剧情规划?: 同人剧情规划结构;
            同人女主剧情规划?: 同人女主剧情规划结构;
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
        onProgress?: (progress: import('./independentStages').变量生成进度) => void;
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
};

// ─── 主工作流 ───────────────────────────────────────────────────────────────

export const 执行主剧情发送工作流 = async (
    content: string,
    isStreaming: boolean,
    currentState: 主剧情发送当前状态,
    deps: 主剧情发送依赖,
    options?: 发送选项
): Promise<发送结果> => {
    // ─── 前置清理 ──────────────────────────────────────────────────────
    let historyBeforeSend = [...currentState.历史记录];
    const lastMessage = historyBeforeSend.length > 0
        ? historyBeforeSend[historyBeforeSend.length - 1]
        : null;

    if (
        lastMessage
        && lastMessage.role === 'system'
        && typeof lastMessage.content === 'string'
        && lastMessage.content.startsWith('[系统错误]:')
        && historyBeforeSend.length >= 2
    ) {
        const userMessageCandidate = historyBeforeSend[historyBeforeSend.length - 2];
        if (userMessageCandidate.role === 'user') {
            historyBeforeSend = historyBeforeSend.slice(0, -2);
            deps.设置历史记录(historyBeforeSend);
        }
    }

    if (!content.trim() || currentState.loading) return {};

    const activeApi = 获取主剧情接口配置(currentState.apiConfig);
    if (!接口配置是否可用(activeApi)) {
        if (typeof window !== 'undefined') alert('请先在设置中填写 API 地址/API Key，并选择主剧情使用模型。');
        deps.setShowSettings(true);
        return { cancelled: true };
    }

    const mainRequestStartedAt = Date.now();
    const normalizedMemBeforeSend = 规范化记忆系统(currentState.记忆系统);

    // ─── 回忆检索阶段 ──────────────────────────────────────────────────
    const recallConfig = currentState.apiConfig?.功能模型占位 || ({} as any);
    const recallFeatureEnabled = Boolean(recallConfig.剧情回忆独立模型开关);
    const recallMinRound = Math.max(1, Number(recallConfig.剧情回忆最早触发回合) || 10);
    const nextRound = (Array.isArray(normalizedMemBeforeSend.回忆档案)
        ? normalizedMemBeforeSend.回忆档案.length
        : 0) + 1;
    const recallRoundReady = nextRound >= recallMinRound;

    let sendInput = content.trim();
    let recallTag: string | undefined;
    let attachedRecallPreview = '';

    if (recallFeatureEnabled && recallRoundReady) {
        const { 执行回忆检索阶段: 回忆 } = await import('./memoryRecallPhase');
        const recallResult = await 回忆({
            content,
            currentState,
            options,
            callbacks: { setShowSettings: deps.setShowSettings }
        });
        sendInput = recallResult.result.sendInput;
        recallTag = recallResult.result.recallTag;
        attachedRecallPreview = recallResult.result.attachedRecallPreview;

        // 需要用户确认回忆标签
        if (!recallResult.result.silentConfirm) {
            return {
                cancelled: true,
                attachedRecallPreview,
                preparedRecallTag: recallTag,
                needRecallConfirm: true
            };
        }
    }

    if (!sendInput.trim()) return { cancelled: true };

    const canonicalTime = 环境时间转标准串(currentState.环境);
    const currentGameTime = canonicalTime || '未知时间';

    // ─── 推入重Roll 快照 ────────────────────────────────────────────────
    deps.推入重Roll快照({
        玩家输入: sendInput,
        游戏时间: currentGameTime,
        回档前状态: {
            角色: deps.深拷贝(currentState.角色),
            环境: deps.规范化环境信息(deps.深拷贝(currentState.环境)),
            社交: deps.深拷贝(currentState.社交),
            世界: deps.深拷贝(currentState.世界),
            战斗: deps.深拷贝(currentState.战斗),
            玩家门派: deps.深拷贝(currentState.玩家门派),
            任务列表: deps.深拷贝(currentState.任务列表),
            约定列表: deps.深拷贝(currentState.约定列表),
            剧情: deps.深拷贝(currentState.剧情),
            剧情规划: deps.深拷贝(currentState.剧情规划),
            女主剧情规划: deps.深拷贝(currentState.女主剧情规划),
            同人剧情规划: deps.深拷贝(currentState.同人剧情规划),
            同人女主剧情规划: deps.深拷贝(currentState.同人女主剧情规划),
            记忆系统: deps.深拷贝(normalizedMemBeforeSend)
        },
        回档前持久态: {
            视觉设置: deps.深拷贝(currentState.visualConfig),
            场景图片档案: deps.深拷贝(currentState.sceneImageArchive)
        },
        回档前历史: deps.深拷贝(historyBeforeSend)
    });

    const normalizedMemoryConfig = 规范化记忆配置(currentState.memoryConfig);
    const immediateUploadLimit = Math.max(1, Number(normalizedMemoryConfig.即时消息上传条数N) || 10);
    const roundsBeforeCurrentInput = Math.max(0, immediateUploadLimit - 1);
    const contextHistory = deps.按回合窗口裁剪历史(historyBeforeSend, roundsBeforeCurrentInput);
    const updatedMemSys = 规范化记忆系统(normalizedMemBeforeSend);

    const newUserMsg: 聊天记录结构 = {
        role: 'user',
        content: sendInput,
        timestamp: Date.now(),
        gameTime: currentGameTime
    };
    const updatedContextHistory = [...contextHistory, newUserMsg];
    const updatedDisplayHistory = [...historyBeforeSend, newUserMsg];
    deps.设置历史记录(updatedDisplayHistory);
    deps.setLoading(true);

    const controller = new AbortController();
    deps.abortControllerRef.current = controller;

    // ─── 构建可重试独立阶段执行器 ────────────────────────────────────────
    const 独立阶段自动重试已启用 = deps.游戏设置启用自动重试(规范化游戏设置(currentState.gameConfig));
    const 请求独立阶段失败决策 = async (
        params: import('./independentStages').独立阶段失败决策参数
    ): Promise<import('./independentStages').独立阶段失败决策> => {
        const message = [
            `${params.stageLabel}请求失败：`,
            params.errorText || '未知错误',
            '',
            '选择"重试"会重新执行当前阶段；选择"跳过"会保留当前结果并继续后续阶段。'
        ].join('\n');
        if (options?.onStageFailureDecision) {
            const result = await Promise.resolve(options.onStageFailureDecision(params));
            return result === 'retry' ? 'retry' : 'skip';
        }
        if (typeof window !== 'undefined') {
            return window.confirm(`${message}\n\n确定要重试当前阶段吗？`) ? 'retry' : 'skip';
        }
        return 'skip';
    };

    const { 构建可重试独立阶段执行器 } = await import('./independentStages');
    const 执行可重试独立阶段 = 构建可重试独立阶段执行器(
        {
            执行带自动重试的生成请求: deps.执行带自动重试的生成请求,
            提取原始报错详情: deps.提取原始报错详情,
            格式化错误详情: deps.格式化错误详情
        },
        独立阶段自动重试已启用,
        请求独立阶段失败决策
    );

    try {
        // ─── 构建系统提示词 ────────────────────────────────────────────
        const builtContext = deps.构建系统提示词(
            currentState.prompts,
            updatedMemSys,
            currentState.社交,
            {
                角色: currentState.角色,
                环境: deps.规范化环境信息(currentState.环境),
                世界: currentState.世界,
                战斗: currentState.战斗,
                玩家门派: currentState.玩家门派,
                任务列表: currentState.任务列表,
                约定列表: currentState.约定列表,
                剧情: deps.规范化剧情状态(currentState.剧情, currentState.环境),
                女主剧情规划: deps.规范化女主剧情规划状态(currentState.女主剧情规划),
                同人剧情规划: deps.规范化同人剧情规划状态(currentState.同人剧情规划),
                同人女主剧情规划: deps.规范化同人女主剧情规划状态(currentState.同人女主剧情规划),
                开局配置: currentState.开局配置
            },
            {
                ...(recallFeatureEnabled && recallTag
                    ? { 禁用中期长期记忆: true, 禁用短期记忆: true }
                    : {}),
                世界书作用域: 规范化游戏设置(currentState.gameConfig).启用酒馆预设模式 === true
                    ? ['main', 'tavern']
                    : ['main'],
                世界书附加文本: [sendInput, recallTag || '']
            }
        );

        // ─── 流式标记 ──────────────────────────────────────────────────
        let streamMarker = 0;
        if (isStreaming) {
            streamMarker = Date.now();
            deps.设置历史记录([
                ...updatedDisplayHistory,
                {
                    role: 'assistant',
                    content: '',
                    timestamp: streamMarker,
                    gameTime: currentGameTime
                }
            ]);
        }

        // ─── 构建主剧情请求参数 ────────────────────────────────────────
        const {
            runtimeGameConfig,
            runtimeCotPseudoEnabled,
            lengthRequirementPrompt,
            disclaimerRequirementPrompt,
            outputProtocolPrompt,
            styleAssistantPrompt,
            realWorldModePrompt,
            cotPseudoPrompt,
            orderedMessages,
            extraPromptForService
        } = 构建主剧情请求参数({
            gameConfig: currentState.gameConfig,
            apiConfig: currentState.apiConfig,
            builtContext,
            updatedContextHistory,
            updatedMemSys,
            sendInput,
            recallTag,
            novelDecompositionPrompt: await 获取激活小说拆分注入文本(
                currentState.apiConfig,
                'main_story',
                currentState.开局配置,
                deps.规范化剧情状态(currentState.剧情, currentState.环境),
                currentState.角色?.姓名 || ''
            ),
            playerRole: currentState.角色,
            builtinPromptEntries: currentState.内置提示词列表,
            worldbooks: currentState.世界书列表
        });
        const inputTokens = deps.估算消息Token(orderedMessages, activeApi?.model);

        // ─── AI 生成请求 ────────────────────────────────────────────────
        const aiResult = await deps.执行带自动重试的生成请求({
            enabled: deps.游戏设置启用自动重试(runtimeGameConfig),
            onRetry: (attempt, maxAttempts, reason) => {
                if (isStreaming) {
                    deps.设置历史记录((prev: 聊天记录结构[]) =>
                        deps.更新流式草稿为自动重试提示(prev, attempt, maxAttempts, reason)
                    );
                }
            },
            action: async () => {
                return textAIService.generateStoryResponseWithFailover(
                    currentState.apiConfig,
                    activeApi,
                    '',
                    '',
                    '',
                    controller.signal,
                    isStreaming
                        ? {
                            stream: true,
                            onDelta: (_delta, accumulated) => {
                                deps.设置历史记录((prev: 聊天记录结构[]) =>
                                    prev.map(item => {
                                        if (
                                            item.timestamp === streamMarker
                                            && item.role === 'assistant'
                                            && !item.structuredResponse
                                        ) {
                                            return { ...item, content: accumulated };
                                        }
                                        return item;
                                    })
                                );
                            }
                        }
                        : undefined,
                    extraPromptForService,
                    {
                        orderedMessages,
                        enableCotInjection: runtimeCotPseudoEnabled,
                        leadingSystemPrompt: builtContext.contextPieces.AI角色声明,
                        styleAssistantPrompt: [styleAssistantPrompt, realWorldModePrompt].filter(Boolean).join('\n\n'),
                        outputProtocolPrompt,
                        cotPseudoHistoryPrompt: cotPseudoPrompt,
                        lengthRequirementPrompt,
                        disclaimerRequirementPrompt,
                        validateTagCompleteness: runtimeGameConfig.启用标签检测完整性 === true,
                        enableTagRepair: runtimeGameConfig.启用标签修复 !== false,
                        requireActionOptionsTag: runtimeGameConfig.启用行动选项 !== false,
                        errorDetailLimit: Number.POSITIVE_INFINITY
                    }
                );
            }
        });


        const turnSnapshot: 回合快照结构 = {
            玩家输入: sendInput,
            游戏时间: currentGameTime,
            回档前状态: {
                角色: deps.深拷贝(currentState.角色),
                环境: deps.规范化环境信息(deps.深拷贝(currentState.环境)),
                社交: deps.深拷贝(currentState.社交),
                世界: deps.深拷贝(currentState.世界),
                战斗: deps.深拷贝(currentState.战斗),
                玩家门派: deps.深拷贝(currentState.玩家门派),
                任务列表: deps.深拷贝(currentState.任务列表),
                约定列表: deps.深拷贝(currentState.约定列表),
                剧情: deps.深拷贝(currentState.剧情),
                剧情规划: deps.深拷贝(currentState.剧情规划),
                女主剧情规划: deps.深拷贝(currentState.女主剧情规划),
                同人剧情规划: deps.深拷贝(currentState.同人剧情规划),
                同人女主剧情规划: deps.深拷贝(currentState.同人女主剧情规划),
                记忆系统: deps.深拷贝(normalizedMemBeforeSend)
            },
            回档前持久态: {
                视觉设置: deps.深拷贝(currentState.visualConfig),
                场景图片档案: deps.深拷贝(currentState.sceneImageArchive)
            },
            回档前历史: deps.深拷贝(historyBeforeSend)
        };

        // ─── 响应处理阶段 ───────────────────────────────────────────────
        const { 执行响应处理阶段 } = await import('./responseProcessingPhase');
        const { 构建带索引命令文本 } = await import('./independentStages');

        const processingResult = await 执行响应处理阶段(
            {
                aiResult: { response: aiResult.response, rawText: aiResult.rawText },
                currentState,
                requestMeta: {
                    sendInput,
                    currentGameTime,
                    inputTokens,
                    mainRequestStartedAt,
                    historyBeforeSend,
                    updatedDisplayHistory,
                    updatedMemSys,
                    normalizedMemoryConfig,
                    streamMarker,
                    isStreaming
                },
                turnSnapshot,
                options
            },
            {
                深拷贝: deps.深拷贝,
                processResponseCommands: deps.processResponseCommands,
                提取新增NPC列表: deps.提取新增NPC列表,
                触发新增NPC自动生图: deps.触发新增NPC自动生图,
                触发场景自动生图: deps.触发场景自动生图,
                应用常驻壁纸为背景: deps.应用常驻壁纸为背景,
                设置剧情: deps.设置剧情,
                规范化剧情状态: deps.规范化剧情状态,
                规范化环境信息: deps.规范化环境信息,
                规范化女主剧情规划状态: deps.规范化女主剧情规划状态,
                规范化同人剧情规划状态: deps.规范化同人剧情规划状态,
                规范化同人女主剧情规划状态: deps.规范化同人女主剧情规划状态,
                计算回复耗时秒: deps.计算回复耗时秒,
                估算AI输出Token: deps.估算AI输出Token,
                应用并同步记忆系统: deps.应用并同步记忆系统,
                设置历史记录: deps.设置历史记录,
                执行正文润色: deps.执行正文润色,
                后台执行统一规划分析: deps.后台执行统一规划分析,
                执行世界演变更新: deps.执行世界演变更新,
                执行变量生成并合并响应: deps.执行变量生成并合并响应,
                performAutoSave: deps.performAutoSave,
                获取原始AI消息: deps.获取原始AI消息,
                提取原始报错详情: deps.提取原始报错详情
            },
            执行可重试独立阶段,
            deps.文章优化功能已开启,
            构建带索引命令文本
        );

        // ─── 自动存档 ──────────────────────────────────────────────────
        void deps.performAutoSave({
            history: [...updatedDisplayHistory, processingResult.newAiMsg],
            role: processingResult.finalState.角色,
            env: processingResult.finalState.环境,
            social: processingResult.finalState.社交,
            world: processingResult.finalState.世界,
            battle: processingResult.finalState.战斗,
            sect: processingResult.finalState.玩家门派,
            tasks: processingResult.finalState.任务列表,
            agreements: processingResult.finalState.约定列表,
            story: processingResult.finalState.剧情,
            storyPlan: processingResult.finalState.剧情规划,
            heroinePlan: processingResult.finalState.女主剧情规划,
            fandomStoryPlan: processingResult.finalState.同人剧情规划,
            fandomHeroinePlan: processingResult.finalState.同人女主剧情规划,
            memory: processingResult.nextMemory,
            force: true
        });

        return { attachedRecallPreview };

    } catch (error: any) {
        if (error.name === 'AbortError') {
            const snapshot = deps.弹出重Roll快照();
            if (snapshot) {
                deps.回档到快照(snapshot);
            } else {
                deps.设置历史记录(historyBeforeSend);
                deps.应用并同步记忆系统(normalizedMemBeforeSend);
            }
            console.log('Request aborted by user');
            return { cancelled: true };
        }

        if (error instanceof textAIService.StoryResponseParseError || error?.name === 'StoryResponseParseError') {
            deps.设置历史记录(historyBeforeSend);
            deps.应用并同步记忆系统(normalizedMemBeforeSend);
            const parseErrorRaw = deps.提取解析失败原始信息(error);
            const parseErrorRawText = typeof error?.rawText === 'string' ? error.rawText : '';
            if (deps.游戏设置启用自动重试(规范化游戏设置(currentState.gameConfig))) {
                deps.设置历史记录([...updatedDisplayHistory, {
                    role: 'system',
                    content: `[系统错误]: ${parseErrorRaw}`,
                    timestamp: Date.now()
                }]);
                return {
                    cancelled: true,
                    parseErrorMessage: parseErrorRaw,
                    parseErrorDetail: parseErrorRaw,
                    parseErrorRawText
                };
            }
            return {
                cancelled: true,
                needRerollConfirm: true,
                parseErrorMessage: parseErrorRaw,
                parseErrorDetail: parseErrorRaw,
                parseErrorRawText
            };
        }

        deps.弹出重Roll快照();
        const detail = deps.格式化错误详情(error);
        const summary = typeof error?.message === 'string' && error.message.trim().length > 0
            ? error.message
            : (typeof error === 'string' ? error : '未知错误');
        const errorMsg: 聊天记录结构 = {
            role: 'system',
            content: `[系统错误]: ${summary}`,
            timestamp: Date.now()
        };
        deps.设置历史记录([...updatedDisplayHistory, errorMsg]);
        return {
            cancelled: true,
            errorDetail: detail,
            errorTitle: '请求失败'
        };
    } finally {
        deps.setLoading(false);
        deps.abortControllerRef.current = null;
    }
};
