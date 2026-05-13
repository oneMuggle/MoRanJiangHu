import type { GameResponse } from '../../../../types';
import { 获取变量计算接口配置, 接口配置是否可用 } from '../../../../utils/apiConfig';
import {
    开局变量生成附加提示词,
    构建开局变量生成审计重点
} from '../../../../prompts/runtime/openingVariableGenerationInit';
import { 构建世界书注入文本 } from '../../../../utils/worldbook';
import { 按功能开关过滤提示词内容 } from '../../../../utils/promptFeatureToggles';
import { 执行变量模型校准工作流 } from '../../planning/variableModelWorkflow';
import { 合并变量校准结果到响应 as 合并变量生成结果到响应 } from '../../planning/variableCalibrationMerge';
import { 环境时间转标准串 } from '../../time/timeUtils';
import type { 开场剧情生成依赖, 开场命令基态 } from './types';
import { 构建带索引命令文本 } from './utils';

export interface VariableInitPhaseResult {
    variableStage: { completed: boolean; result?: any };
    responseForExecution: GameResponse;
    simulatedOpeningState: 开场命令基态;
    aiData: GameResponse;
}

export async function 执行开局变量生成阶段(
    responseForExecution: GameResponse,
    simulatedOpeningState: 开场命令基态,
    commandBaseState: 开场命令基态,
    openingBodyText: string,
    openingVariablePlanText: string,
    openingPromptSnapshot: any[],
    openingRuntimeFandomBundle: { enabled: boolean },
    openingGameConfig: any,
    openingRoleSetupText: string,
    openingConfigText: string,
    options: { 开局配置?: any },
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
): Promise<VariableInitPhaseResult> {
    let localResponseForExecution = responseForExecution;
    let localSimulatedOpeningState = simulatedOpeningState;
    let localAiData = deps.processResponseCommands(localResponseForExecution, commandBaseState, { applyState: false, rawContent: deps.获取原始AI消息(aiResult.rawText) });

    const openingVariableApi = 获取变量计算接口配置(deps.apiConfig);
    if (接口配置是否可用(openingVariableApi)) {
        const variableStage = await 执行可重试开局阶段({
            stageLabel: '开局变量生成',
            beforeAttempt: (attempt) => {
                deps.设置开局变量生成进度({
                    phase: 'start',
                    text: attempt > 1
                        ? `正在重新生成开局变量...（第 ${attempt} 次手动重试）`
                        : '正在生成开局变量...'
                });
            },
            onAutoRetry: (attempt, maxAttempts, reason) => {
                deps.设置开局变量生成进度({
                    phase: 'start',
                    text: `开局变量生成请求失败，正在自动重试（${attempt}/${maxAttempts}）${reason ? `：${reason}` : ''}`
                });
            },
            run: async () => {
                const openingCurrentGameTime = 环境时间转标准串(localSimulatedOpeningState.环境) || '未知时间';
                const openingVariableAudit = 构建开局变量生成审计重点({
                    fandomEnabled: openingRuntimeFandomBundle.enabled
                });
                const variableWorldbookExtra = 按功能开关过滤提示词内容(构建世界书注入文本({
                    books: deps.worldbooks,
                    scopes: ['variable_calibration'],
                    environment: localSimulatedOpeningState.环境,
                    social: localSimulatedOpeningState.社交,
                    history: [],
                    extraTexts: [openingBodyText, openingVariablePlanText]
                }).combinedText, openingGameConfig);
                const variableExtraPrompt = [
                    开局变量生成附加提示词,
                    openingVariableAudit,
                    variableWorldbookExtra
                ]
                    .filter(Boolean)
                    .join('\n\n');
                return 执行变量模型校准工作流(
                    {
                        playerInput: '',
                        parsedResponse: localResponseForExecution,
                        baseState: {
                            角色: commandBaseState.角色,
                            环境: commandBaseState.环境,
                            社交: commandBaseState.社交,
                            战斗: commandBaseState.战斗,
                            玩家门派: commandBaseState.玩家门派,
                            任务列表: commandBaseState.任务列表,
                            约定列表: commandBaseState.约定列表
                        },
                        promptPool: openingPromptSnapshot,
                        worldEvolutionEnabled: false,
                        builtinPromptEntries: deps.builtinPromptEntries,
                        worldbooks: deps.worldbooks,
                        signal: deps.abortControllerRef.current?.signal!,
                        extraPromptAppend: variableExtraPrompt,
                        openingConfig: options?.开局配置,
                        isOpeningRound: true,
                        openingTaskContext: {
                            currentGameTime: openingCurrentGameTime,
                            openingRoleSetupText,
                            openingConfigText
                        }
                    },
                    {
                        apiConfig: deps.apiConfig,
                        gameConfig: deps.gameConfig
                    }
                );
            },
            onError: (errorText) => {
                deps.设置开局变量生成进度({
                    phase: 'error',
                    text: `${errorText || '开局变量生成失败'}\n等待选择：重试当前阶段，或跳过继续。`
                });
            },
            onSkip: (errorText) => {
                deps.设置开局变量生成进度({
                    phase: 'skipped',
                    text: `开局变量生成失败，已按用户选择跳过。${errorText ? `\n${errorText}` : ''}`
                });
            },
            getErrorText: (error: any) => error?.message || '开局变量生成失败'
        });
        const openingVariableResult = variableStage.result;
        const openingVariableStartIndex = (Array.isArray(localResponseForExecution.tavern_commands) ? localResponseForExecution.tavern_commands.length : 0) + 1;
        if (variableStage.completed) {
            const variableCommands = Array.isArray(openingVariableResult?.commands)
                ? openingVariableResult.commands
                : [];
            deps.设置开局变量生成进度({
                phase: variableCommands.length > 0 ? 'done' : 'skipped',
                text: variableCommands.length > 0
                    ? '开局变量生成完成。'
                    : '开局变量生成未产生更新。',
                rawText: typeof openingVariableResult?.rawText === 'string' ? openingVariableResult.rawText : '',
                commandTexts: 构建带索引命令文本(variableCommands, openingVariableStartIndex)
            });
            if (openingVariableResult && variableCommands.length > 0) {
                localResponseForExecution = 合并变量生成结果到响应(localResponseForExecution, openingVariableResult);
                localAiData = {
                    ...localAiData,
                    variable_calibration_report: localResponseForExecution.variable_calibration_report,
                    variable_calibration_commands: localResponseForExecution.variable_calibration_commands,
                    variable_calibration_model: localResponseForExecution.variable_calibration_model
                };
                localSimulatedOpeningState = deps.processResponseCommands(localResponseForExecution, commandBaseState, { applyState: false, rawContent: deps.获取原始AI消息(aiResult.rawText) });
                const 立即并入开局变量状态 = (nextResponse: GameResponse) => {
                    localSimulatedOpeningState = deps.processResponseCommands(nextResponse, commandBaseState, { rawContent: deps.获取原始AI消息(aiResult.rawText) });
                    const appliedTime = 环境时间转标准串(localSimulatedOpeningState.环境);
                    if (appliedTime) {
                        deps.设置游戏初始时间(appliedTime);
                    }
                    return localSimulatedOpeningState;
                };
                立即并入开局变量状态(localResponseForExecution);
                deps.设置开局变量生成进度({
                    phase: 'done',
                    text: '开局变量生成完成，并已立即并入前台初始化状态。',
                    rawText: typeof openingVariableResult?.rawText === 'string' ? openingVariableResult.rawText : '',
                    commandTexts: 构建带索引命令文本(variableCommands, openingVariableStartIndex)
                });
            }
        }
    } else {
        deps.设置开局变量生成进度({
            phase: 'skipped',
            text: '变量生成独立链路未启用，已跳过。'
        });
    }

    return {
        variableStage: { completed: false },
        responseForExecution: localResponseForExecution,
        simulatedOpeningState: localSimulatedOpeningState,
        aiData: localAiData
    };
}
