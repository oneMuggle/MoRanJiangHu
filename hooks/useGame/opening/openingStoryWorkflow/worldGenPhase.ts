import * as textAIService from '../../../../services/ai/text';
import type { GameResponse, TavernCommand } from '../../../../types';
import { 获取世界演变接口配置, 接口配置是否可用 } from '../../../../utils/apiConfig';
import {
    构建开局世界演变初始化上下文,
    开局世界演变初始化附加提示词
} from '../../../../prompts/runtime/openingWorldEvolutionInit';
import { 数值_世界演化 } from '../../../../prompts/stats/world';
import {
    构建世界演变COT提示词,
    世界演变COT伪装历史消息提示词
} from '../../../../prompts/runtime/worldEvolutionCot';
import { 按功能开关过滤提示词内容, 裁剪修炼体系上下文数据 } from '../../../../utils/promptFeatureToggles';
import {
    世界书本体槽位,
    构建世界书注入文本
} from '../../../../utils/worldbook';
import { 获取激活小说拆分注入文本 } from '../../../../services/novel-decomposition/novelDecompositionInjection';
import { 构建世界演变上下文文本 } from '../../world/worldEvolutionUtils';
import { 环境时间转标准串 } from '../../time/timeUtils';
import type { 开场剧情生成依赖, 开场命令基态 } from './types';
import { 构建带索引命令文本 } from './utils';

export interface WorldGenPhaseResult {
    worldResult: any;
    worldStage: { completed: boolean; result?: any };
    responseForExecution: GameResponse;
    simulatedOpeningState: 开场命令基态;
    openingWorldInitUpdates: string[];
}

export async function 执行开局世界演变阶段(
    responseForExecution: GameResponse,
    simulatedOpeningState: 开场命令基态,
    commandBaseState: 开场命令基态,
    openingBodyText: string,
    openingPlanText: string,
    openingWorldPrompt: string,
    openingWorldEvolutionPrompt: string,
    openingRuntimeFandomBundle: { enabled: boolean; 境界母板补丁?: string; 同人设定摘要?: string },
    openingGameConfig: any,
    options: { 开局配置?: any; eraId?: string | null },
    deps: 开场剧情生成依赖,
    aiResult: { rawText: string },
    执行可重试开局阶段: <T,>(params: {
        stageLabel: string;
        run: () => Promise<T>;
        beforeAttempt?: (attempt: number) => void;
        onAutoRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
        onError?: (errorText: string) => void;
        onSkip?: (errorText: string) => void;
        getErrorText?: (error: any) => string;
    }) => Promise<{ completed: boolean; result?: T }>
): Promise<WorldGenPhaseResult> {
    let localResponseForExecution = responseForExecution;
    let localSimulatedOpeningState = simulatedOpeningState;
    let openingWorldInitUpdates: string[] = [];

    const openingWorldApi = 获取世界演变接口配置(deps.apiConfig);
    if (接口配置是否可用(openingWorldApi)) {
        const worldStage = await 执行可重试开局阶段({
            stageLabel: '开局动态世界',
            beforeAttempt: (attempt) => {
                deps.设置开局世界演变进度({
                    phase: 'start',
                    text: attempt > 1
                        ? `正在重新初始化动态世界...（第 ${attempt} 次手动重试）`
                        : '正在初始化动态世界...'
                });
            },
            onAutoRetry: (attempt, maxAttempts, reason) => {
                deps.设置开局世界演变进度({
                    phase: 'start',
                    text: `开局动态世界请求失败，正在自动重试（${attempt}/${maxAttempts}）${reason ? `：${reason}` : ''}`
                });
            },
            run: async () => {
                const worldCommandTexts = 构建带索引命令文本(localResponseForExecution.tavern_commands || []);
                const worldInitContext = 构建开局世界演变初始化上下文({
                    openingBodyText,
                    openingPlanText,
                    openingCommandTexts: worldCommandTexts,
                    currentGameTime: 环境时间转标准串(localSimulatedOpeningState.环境) || '未知时间'
                });
                const worldbookExtra = 按功能开关过滤提示词内容(构建世界书注入文本({
                    books: deps.worldbooks,
                    scopes: ['world_evolution'],
                    environment: localSimulatedOpeningState.环境,
                    world: localSimulatedOpeningState.世界,
                    history: [],
                    extraTexts: [openingBodyText, openingPlanText, ...worldCommandTexts]
                }).combinedText, openingGameConfig);
                const worldNovelDecompositionPrompt = await 获取激活小说拆分注入文本(
                    deps.apiConfig,
                    'world_evolution',
                    options?.开局配置,
                    localSimulatedOpeningState.剧情,
                    localSimulatedOpeningState.角色?.姓名 || deps.角色?.姓名 || ''
                );
                const worldExtraPrompt = [
                    开局世界演变初始化附加提示词,
                    worldInitContext,
                    worldbookExtra,
                    按功能开关过滤提示词内容(worldNovelDecompositionPrompt, openingGameConfig),
                    按功能开关过滤提示词内容(openingRuntimeFandomBundle.同人设定摘要, openingGameConfig),
                    openingRuntimeFandomBundle.enabled ? openingRuntimeFandomBundle.境界母板补丁 : ''
                ]
                    .filter(Boolean)
                    .join('\n\n');
                const worldContext = 构建世界演变上下文文本({
                    worldPrompt: openingWorldPrompt,
                    worldEvolutionPrompt: openingWorldEvolutionPrompt,
                    envData: localSimulatedOpeningState.环境,
                    worldData: localSimulatedOpeningState.世界,
                    storyData: localSimulatedOpeningState.剧情,
                    shortMemoryTexts: [],
                    scriptText: openingBodyText || '暂无',
                    currentTurnBody: openingBodyText,
                    currentTurnPlanText: openingPlanText,
                    currentTurnCommandsText: 构建带索引命令文本(localResponseForExecution.tavern_commands || [])
                        .map((line) => line.replace(/^\[#(\d+)\]\s*/, '#$1 '))
                        .join('\n'),
                    currentGameTime: 环境时间转标准串(localSimulatedOpeningState.环境) || '',
                    dynamicHints: Array.isArray(localResponseForExecution.dynamic_world) ? localResponseForExecution.dynamic_world : [],
                    dueHints: []
                });
                return textAIService.generateWorldEvolutionUpdate(
                    worldContext,
                    openingWorldApi,
                    deps.abortControllerRef.current?.signal!,
                    worldExtraPrompt,
                    openingGameConfig.启用COT伪装注入 !== false ? 世界演变COT伪装历史消息提示词 : '',
                    构建世界演变COT提示词({ fandom: openingRuntimeFandomBundle.enabled }),
                    openingRuntimeFandomBundle.enabled,
                    openingGameConfig.独立APIGPT模式?.世界演变 === true
                );
            },
            onError: (errorText) => {
                deps.设置开局世界演变进度({
                    phase: 'error',
                    text: `${errorText || '动态世界初始化失败'}\n等待选择：重试当前阶段，或跳过继续。`
                });
            },
            onSkip: (errorText) => {
                deps.设置开局世界演变进度({
                    phase: 'skipped',
                    text: `动态世界初始化失败，已按用户选择跳过。${errorText ? `\n${errorText}` : ''}`
                });
            },
            getErrorText: (error: any) => error?.message || '动态世界初始化失败'
        });
        const worldResult = worldStage.result;
        if (worldStage.completed && worldResult) {
            openingWorldInitUpdates = Array.isArray(worldResult.updates)
                ? worldResult.updates.map((item: any) => (item || '').trim()).filter(Boolean)
                : [];
            deps.设置开局世界演变进度({
                phase: (Array.isArray(worldResult.commands) && worldResult.commands.length > 0) || openingWorldInitUpdates.length > 0
                    ? 'done'
                    : 'skipped',
                text: (
                    (Array.isArray(worldResult.commands) && worldResult.commands.length > 0) || openingWorldInitUpdates.length > 0
                        ? '动态世界初始化完成。'
                        : '动态世界初始化未产生更新。'
                ),
                rawText: worldResult.rawText,
                commandTexts: 构建带索引命令文本(worldResult.commands || [])
            });
            if (Array.isArray(worldResult.commands) && worldResult.commands.length > 0) {
                localResponseForExecution = {
                    ...localResponseForExecution,
                    tavern_commands: [
                        ...(Array.isArray(localResponseForExecution.tavern_commands) ? localResponseForExecution.tavern_commands : []),
                        ...worldResult.commands
                    ]
                };
                localSimulatedOpeningState = deps.processResponseCommands(localResponseForExecution, commandBaseState, { applyState: false, rawContent: deps.获取原始AI消息(aiResult.rawText) });
            }
        }
    } else {
        deps.设置开局世界演变进度({
            phase: 'skipped',
            text: '动态世界独立链路未启用，已跳过。'
        });
    }

    return {
        worldResult: null,
        worldStage: { completed: false },
        responseForExecution: localResponseForExecution,
        simulatedOpeningState: localSimulatedOpeningState,
        openingWorldInitUpdates
    };
}
