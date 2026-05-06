import type {
    GameResponse,
    女主剧情规划结构,
    OpeningConfig,
    详细门派结构,
    世界数据结构,
    剧情系统结构,
    战斗状态结构,
    环境信息结构,
    聊天记录结构,
    角色数据结构
} from '../../types';
import { 创建变量生成队列调度器, type 变量生成队列调度器, type 变量生成进度 } from './variableGenerationQueue';

type 回合快照结构 = {
    玩家输入: string;
    游戏时间: string;
    回档前状态: {
        角色: 角色数据结构;
        环境: 环境信息结构;
        社交: any[];
        世界: 世界数据结构;
        战斗: 战斗状态结构;
        玩家门派: 详细门派结构;
        任务列表: any[];
        约定列表: any[];
        剧情: 剧情系统结构;
        女主剧情规划?: 女主剧情规划结构;
        记忆系统?: any;
    };
    回档前持久态?: {
        视觉设置?: any;
        场景图片档案?: any;
    };
    回档前历史: 聊天记录结构[];
};

type 变量生成工作流依赖 = {
    apiConfig: any;
    gameConfig: any;
    prompts: any[];
    开局配置?: OpeningConfig;
    内置提示词列表: any[];
    世界书列表: any[];
    世界演变进行中Ref: { current: boolean };
    variableGenerationAbortControllerRef: { current: AbortController | null };
    set变量生成中: (value: boolean) => void;
    深拷贝: <T>(value: T) => T;
    世界演变功能已开启: () => boolean;
    等待世界演变空闲: (signal?: AbortSignal, timeoutMs?: number) => Promise<void>;
    收集最近变量生成上下文: (history: any[], limit?: number) => any[];
    执行变量模型校准工作流: (params: any, options: { apiConfig: any; gameConfig: any }) => Promise<any>;
    合并变量生成结果到响应: (response: GameResponse, calibration: any) => GameResponse;
    变量生成功能已启用: (apiConfig: any) => boolean;
    获取变量计算接口配置: (apiConfig: any) => any;
    接口配置是否可用: (api: any) => boolean;
    序列化变量生成命令: (cmd: any) => string;
    使用快照重建解析回合: (snapshot: any, parsed: GameResponse, rawText: string, options?: any) => Promise<void>;
};

type 变量校准合并结果 = {
    mergedParsed: GameResponse;
    mergedDisplayResponse: GameResponse;
    variableCalibration: any;
};

const 构建基础状态 = (snapshot: 回合快照结构, 深拷贝: <T>(value: T) => T) => ({
    角色: 深拷贝(snapshot.回档前状态.角色),
    环境: 深拷贝(snapshot.回档前状态.环境),
    社交: 深拷贝(snapshot.回档前状态.社交),
    世界: 深拷贝(snapshot.回档前状态.世界),
    战斗: 深拷贝(snapshot.回档前状态.战斗),
    玩家门派: 深拷贝(snapshot.回档前状态.玩家门派),
    任务列表: 深拷贝(snapshot.回档前状态.任务列表),
    约定列表: 深拷贝(snapshot.回档前状态.约定列表),
    剧情: 深拷贝(snapshot.回档前状态.剧情),
    女主剧情规划: 深拷贝(snapshot.回档前状态.女主剧情规划)
});

type 变量校准协调器配置 = {
    maxConcurrency?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    completedTaskTTL?: number;
};

export const 创建变量校准协调器 = (deps: 变量生成工作流依赖, config?: 变量校准协调器配置) => {
    // 创建队列调度器
    const 队列调度器 = 创建变量生成队列调度器({
        执行变量模型校准工作流: deps.执行变量模型校准工作流,
        apiConfig: deps.apiConfig,
        gameConfig: deps.gameConfig
    }, config);

    const 构建带索引命令文本 = (commands: any[], startIndex: number): string[] => (
        (Array.isArray(commands) ? commands : [])
            .map((cmd, index) => {
                const body = deps.序列化变量生成命令(cmd);
                return body.trim() ? `[#${startIndex + index}] ${body}` : '';
            })
            .filter(Boolean)
    );

    const 执行变量校准并合并响应 = async (params: {
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
    }): Promise<变量校准合并结果 | null> => {
        if (!deps.变量生成功能已启用(deps.apiConfig)) {
            return null;
        }
        const variableApi = deps.获取变量计算接口配置(deps.apiConfig);
        if (!deps.接口配置是否可用(variableApi)) {
            return null;
        }

        // 如果有正在运行的任务，先取消
        if (队列调度器.有运行中任务()) {
            队列调度器.取消全部();
        }

        const worldEvolutionEnabled = deps.世界演变功能已开启();
        const calibrationResponse = params.parsedResponse;
        const mergeTargetResponse = params.mergeTargetResponse || params.parsedResponse;
        const displayResponse = params.displayResponse || mergeTargetResponse;
        const recentRounds = deps.收集最近变量生成上下文(
            Array.isArray(params.snapshot?.回档前历史) ? params.snapshot.回档前历史 : [],
            2
        );
        const isOpeningRound = (Array.isArray(params.snapshot?.回档前历史) ? params.snapshot.回档前历史.length : 0) <= 1;

        // 包装进度回调，添加 taskId 信息
        const wrappedProgressCallback = (progress: 变量生成进度) => {
            params.onProgress?.({ ...progress });
        };

        // 构建任务参数
        const taskParams = {
            playerInput: params.playerInput,
            parsedResponse: calibrationResponse,
            baseState: 构建基础状态(params.snapshot, deps.深拷贝),
            promptPool: deps.prompts,
            worldEvolutionEnabled,
            builtinPromptEntries: deps.内置提示词列表,
            worldEvolutionUpdated: params.worldEvolutionUpdated === true,
            worldbooks: deps.世界书列表,
            openingConfig: deps.开局配置,
            extraPromptAppend: params.extraPromptAppend,
            recentRounds,
            isOpeningRound
        };

        // 入列并等待结果
        const { taskId, resultPromise } = 队列调度器.入列(taskParams, {
            type: 'turn',
            priority: 'normal',
            onProgress: wrappedProgressCallback
        });

        params.onProgress?.({ phase: 'start', text: '正在执行独立变量生成...', taskId });

        try {
            const variableCalibration = await resultPromise;

            if (!variableCalibration || (
                variableCalibration.commands.length === 0
                && variableCalibration.reports.length === 0
            )) {
                params.onProgress?.({ phase: 'done', text: '当前回合未产出额外变量命令，沿用现有变量结果。', rawText: variableCalibration?.rawText, taskId });
                return {
                    mergedParsed: mergeTargetResponse,
                    mergedDisplayResponse: displayResponse,
                    variableCalibration: null
                };
            }

            const mergedParsed = deps.合并变量生成结果到响应(mergeTargetResponse, variableCalibration);
            const mergedDisplayResponse: GameResponse = {
                ...displayResponse,
                tavern_commands: Array.isArray(mergedParsed.tavern_commands) ? mergedParsed.tavern_commands : [],
                variable_calibration_report: mergedParsed.variable_calibration_report,
                variable_calibration_commands: mergedParsed.variable_calibration_commands,
                variable_calibration_model: mergedParsed.variable_calibration_model
            };

            return {
                mergedParsed,
                mergedDisplayResponse,
                variableCalibration
            };
        } catch (error: any) {
            if (error?.name === 'AbortError') {
                params.onProgress?.({ phase: 'cancelled', text: '已取消本次变量生成。', taskId });
                return null;
            }
            throw error;
        }
    };

    const 后台执行变量校准 = async (params: {
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
    }) => {
        if (!deps.变量生成功能已启用(deps.apiConfig)) {
            return;
        }
        const variableApi = deps.获取变量计算接口配置(deps.apiConfig);
        if (!deps.接口配置是否可用(variableApi)) {
            return;
        }

        const worldEvolutionEnabled = deps.世界演变功能已开启();
        const calibrationResponse = params.parsedResponse;
        const mergeTargetResponse = params.mergeTargetResponse || params.parsedResponse;
        const recentRounds = deps.收集最近变量生成上下文(
            Array.isArray(params.snapshot?.回档前历史) ? params.snapshot.回档前历史 : [],
            2
        );
        const isOpeningRound = (Array.isArray(params.snapshot?.回档前历史) ? params.snapshot.回档前历史.length : 0) <= 1;

        // 包装进度回调
        const wrappedProgressCallback = (progress: 变量生成进度) => {
            params.onProgress?.({ ...progress });
        };

        const taskParams = {
            playerInput: params.playerInput,
            parsedResponse: calibrationResponse,
            baseState: 构建基础状态(params.snapshot, deps.深拷贝),
            promptPool: deps.prompts,
            worldEvolutionEnabled,
            builtinPromptEntries: deps.内置提示词列表,
            worldEvolutionUpdated: params.worldEvolutionUpdated === true,
            worldbooks: deps.世界书列表,
            openingConfig: deps.开局配置,
            extraPromptAppend: params.extraPromptAppend,
            recentRounds,
            isOpeningRound
        };

        // 低优先级入列（后台执行）
        const { taskId, resultPromise } = 队列调度器.入列(taskParams, {
            type: 'background',
            priority: 'low',
            onProgress: wrappedProgressCallback
        });

        // 等待结果 - queue returns 变量模型校准结果 | null
        const variableCalibration = await resultPromise;
        if (!variableCalibration || (variableCalibration.commands.length === 0 && variableCalibration.reports.length === 0)) {
            return;
        }

        // 执行合并
        const mergedParsed = deps.合并变量生成结果到响应(mergeTargetResponse, variableCalibration);
        const mergedDisplayResponse: GameResponse = {
            ...(params.displayResponse || mergeTargetResponse),
            tavern_commands: Array.isArray(mergedParsed.tavern_commands) ? mergedParsed.tavern_commands : [],
            variable_calibration_report: mergedParsed.variable_calibration_report,
            variable_calibration_commands: mergedParsed.variable_calibration_commands,
            variable_calibration_model: mergedParsed.variable_calibration_model
        };

        await deps.使用快照重建解析回合(params.snapshot, mergedParsed, params.rawText, {
            playerInput: params.playerInput,
            displayResponse: mergedDisplayResponse,
            preserveSnapshot: true,
            inputTokens: params.inputTokens,
            responseDurationSec: params.responseDurationSec,
            skipVariableModelCalibration: true,
            preserveScrollPosition: true,
            forceAutoSave: true
        });
        params.onProgress?.({
            phase: 'done',
            text: `已补充 ${variableCalibration.commands.length} 条变量命令${variableCalibration.model ? `（${variableCalibration.model}）` : ''}`,
            rawText: variableCalibration.rawText,
            commandTexts: 构建带索引命令文本(
                variableCalibration.commands,
                (Array.isArray((params.mergeTargetResponse || params.parsedResponse)?.tavern_commands)
                    ? (params.mergeTargetResponse || params.parsedResponse).tavern_commands.length
                    : 0) + 1
            ),
            taskId
        });
    };

    const 执行重解析变量校准 = async (params: {
        snapshot: 回合快照结构;
        playerInput: string;
        parsedResponse: GameResponse;
    }): Promise<GameResponse> => {
        if (!deps.变量生成功能已启用(deps.apiConfig)) {
            return params.parsedResponse;
        }
        const variableApi = deps.获取变量计算接口配置(deps.apiConfig);
        if (!deps.接口配置是否可用(variableApi)) {
            return params.parsedResponse;
        }

        const worldEvolutionEnabled = deps.世界演变功能已开启();
        const recentRounds = deps.收集最近变量生成上下文(
            Array.isArray(params.snapshot?.回档前历史) ? params.snapshot.回档前历史 : [],
            2
        );
        const isOpeningRound = (Array.isArray(params.snapshot?.回档前历史) ? params.snapshot.回档前历史.length : 0) <= 1;

        const taskParams = {
            playerInput: params.playerInput,
            parsedResponse: params.parsedResponse,
            baseState: 构建基础状态(params.snapshot, deps.深拷贝),
            promptPool: deps.prompts,
            worldEvolutionEnabled,
            builtinPromptEntries: deps.内置提示词列表,
            worldbooks: deps.世界书列表,
            openingConfig: deps.开局配置,
            recentRounds,
            isOpeningRound
        };

        // 关键任务，高优先级入列
        const { resultPromise } = 队列调度器.入列(taskParams, {
            type: 'reparse',
            priority: 'critical'
        });

        const variableCalibration = await resultPromise;
        if (variableCalibration && (
            variableCalibration.commands.length > 0
            || variableCalibration.reports.length > 0
        )) {
            return deps.合并变量生成结果到响应(params.parsedResponse, variableCalibration);
        }
        return params.parsedResponse;
    };

    // 导出队列调度器供外部使用（如取消全部）
    return {
        后台执行变量校准,
        执行变量校准并合并响应,
        执行重解析变量校准,
        队列调度器
    };
};
