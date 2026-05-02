import { GameResponse, TavernCommand, 内置提示词条目结构 } from '../../../types';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import { 世界书本体槽位 } from '../../../utils/worldbook';
import { 获取内置提示词槽位内容 } from '../../../utils/builtinPrompts';
import {
    构建变量模型身份提示词,
    构建变量模型职责提示词,
    构建变量模型系统提示词,
    构建变量模型任务提示词,
    构建变量模型输出格式提示词,
    构建变量模型用户附加规则提示词,
    构建变量模型COT伪装提示词
} from '../../../prompts/runtime/variableModel';
import { 默认COT伪装历史消息提示词 } from '../../../prompts/runtime/defaults';
import { 获取变量校准COT提示词 } from '../../../prompts/runtime/variableCot';
import {
    type 通用消息,
    规范化文本补全消息链,
    请求模型文本
} from '../chatCompletionClient';
import { 提取首尾思考区段, 解析动态世界块, 解析命令块, 提取首个标签内容 } from './storyResponseParser';

export interface VariableCalibrationResult {
    commands: TavernCommand[];
    reports: string[];
    rawText: string;
}

// ==================== Parsing ====================

const 解析变量校准响应 = (rawText: string): { commands: TavernCommand[]; reports: string[] } => {
    const source = (rawText || '').trim();
    if (!source) return { commands: [], reports: [] };

    const thinkingSegment = 提取首尾思考区段(source);
    let textWithoutThinking = (thinkingSegment.matched ? thinkingSegment.textWithoutThinking : source).trim();
    if (thinkingSegment.matched && !textWithoutThinking) {
        textWithoutThinking = source
            .replace(/<\s*\/\s*(thinking|think)\s*>/gi, '')
            .replace(/<\s*(thinking|think)\s*>/gi, '')
            .trim();
    }
    const reportBlock = 提取首个标签内容(textWithoutThinking, '说明')
        || 提取首个标签内容(textWithoutThinking, '校准说明')
        || 提取首个标签内容(textWithoutThinking, '校准报告')
        || 提取首个标签内容(textWithoutThinking, '说明');
    const commandBlock = 提取首个标签内容(textWithoutThinking, '命令');
    const reports = 解析动态世界块(reportBlock);

    const commands = 解析命令块((commandBlock || textWithoutThinking).trim())
        .map((cmd) => ({ action: cmd.action, key: cmd.key, value: cmd.value })) as TavernCommand[];

    return { commands, reports };
};

// ==================== Variable Calibration ====================

const 构建独立任务触发消息 = (taskPrompt: string, _gptMode?: boolean): 通用消息 => ({
    role: 'user',
    content: taskPrompt
});

export const generateVariableCalibrationUpdate = async (
    params: {
        stateJson: string;
        response: GameResponse;
        calibrationRulesContext?: string;
        worldEvolutionEnabled?: boolean;
        worldEvolutionUpdated?: boolean;
        builtinPromptEntries?: 内置提示词条目结构[];
        survivalNeedsEnabled?: boolean;
        cultivationSystemEnabled?: boolean;
        recentRounds?: Array<{
            回合: number;
            玩家输入: string;
            正文: string;
            本回合命令: string[];
            校准说明: string[];
            校准命令: string[];
        }>;
        isOpeningRound?: boolean;
        openingTaskContext?: {
            currentGameTime?: string;
            openingRoleSetupText?: string;
            openingConfigText?: string;
        };
    },
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    extraPrompt?: string,
    onStreamDelta?: (delta: string, accumulated: string) => void,
    gptMode?: boolean
): Promise<VariableCalibrationResult> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');

    const systemPrompt = 获取内置提示词槽位内容({
        entries: params.builtinPromptEntries,
        slotId: params.worldEvolutionUpdated === true
            ? 世界书本体槽位.变量模型系统_世界演变已更新
            : 世界书本体槽位.变量模型系统_常规,
        fallback: ''
    });
    const 默认系统补充提示词 = 构建变量模型系统提示词({
        worldEvolutionEnabled: params.worldEvolutionUpdated === true,
        worldEvolutionUpdated: params.worldEvolutionUpdated === true,
        survivalNeedsEnabled: params.survivalNeedsEnabled !== false,
        cultivationSystemEnabled: params.cultivationSystemEnabled !== false
    }).trim();
    const 去重后的系统补充提示词 = (() => {
        const source = (systemPrompt || '').trim();
        if (!source) return '';
        if (source === 默认系统补充提示词) return '';
        if (source.startsWith(默认系统补充提示词)) {
            return source.slice(默认系统补充提示词.length).trim();
        }
        return source;
    })();
    const userPromptExtraRules = 获取内置提示词槽位内容({
        entries: params.builtinPromptEntries,
        slotId: params.worldEvolutionUpdated === true
            ? 世界书本体槽位.变量模型用户_世界演变已更新
            : 世界书本体槽位.变量模型用户_常规,
        fallback: 构建变量模型用户附加规则提示词()
    });
    const taskPrompt = 构建变量模型任务提示词({
        stateJson: params.stateJson,
        response: params.response,
        extraPrompt,
        isOpeningRound: params.isOpeningRound === true,
        openingTaskContext: params.openingTaskContext
    });
    const variableCotPrompt = 获取内置提示词槽位内容({
        entries: params.builtinPromptEntries,
        slotId: 世界书本体槽位.变量模型COT,
        fallback: 获取变量校准COT提示词({ 启用修炼体系: params.cultivationSystemEnabled })
    });
    const rulesContext = (params.calibrationRulesContext || '').trim();
    const messages = 规范化文本补全消息链([
        { role: 'system', content: `【AI身份提示词】\n${构建变量模型身份提示词()}` },
        { role: 'system', content: `【职责】\n${构建变量模型职责提示词({
            survivalNeedsEnabled: params.survivalNeedsEnabled !== false,
            cultivationSystemEnabled: params.cultivationSystemEnabled !== false
        })}` },
        ...(去重后的系统补充提示词
            ? [{ role: 'system' as const, content: `【系统补充】\n${去重后的系统补充提示词}` }]
            : []),
        ...(rulesContext
            ? [{ role: 'system' as const, content: `【变量相关提示词】\n${rulesContext}` }]
            : []),
        ...(userPromptExtraRules
            ? [{ role: 'system' as const, content: `【附加变量规则】\n${userPromptExtraRules}` }]
            : []),
        { role: 'system', content: `【变量生成COT】\n${variableCotPrompt}` },
        { role: 'system', content: 构建变量模型输出格式提示词() },
        { role: gptMode ? 'user' : 'assistant', content: taskPrompt },
        ...(!gptMode ? [构建独立任务触发消息('开始任务', false)] : []),
        { role: 'assistant', content: 构建变量模型COT伪装提示词() || 默认COT伪装历史消息提示词.trim() }
    ], { 保留System: true, 合并同角色: false });

    const rawText = await 请求模型文本(apiConfig, messages, {
        temperature: 0.2,
        signal,
        errorDetailLimit: Number.POSITIVE_INFINITY,
        streamOptions: onStreamDelta
            ? { stream: true, onDelta: onStreamDelta }
            : undefined
    });
    const parsed = 解析变量校准响应(rawText);

    return { commands: parsed.commands, reports: parsed.reports, rawText };
};
