import { GameResponse } from '../../../types';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 接口设置结构 } from '../../../models/system';
import { parseJsonWithRepair } from '../../../utils/jsonRepair';
import { 获取世界观生成系统提示词, 构建世界观生成用户提示词 } from '../../../prompts/runtime/worldGeneration';
import { 同人境界体系生成系统提示词, 构建同人境界体系生成用户提示词 } from '../../../prompts/runtime/fandomRealmGeneration';
import { 校验境界体系提示词完整性 } from '../../../prompts/runtime/fandom';
import { 默认COT伪装历史消息提示词 } from '../../../prompts/runtime/defaults';
import {
    type 通用消息,
    规范化文本补全消息链,
    请求模型文本,
    替换COT伪装身份占位
} from '../chatCompletionClient';
import {
    parseStoryRawText,
    提取首尾思考区段
} from './storyResponseParser';

// ==================== Types ====================

export interface ConnectionTestResult {
    ok: boolean;
    detail: string;
}

export interface StoryResponseResult {
    response: GameResponse;
    rawText: string;
}

export interface StoryStreamOptions {
    stream?: boolean;
    onDelta?: (delta: string, accumulated: string) => void;
}

export interface StoryRequestOptions {
    enableCotInjection?: boolean;
    cotPseudoHistoryPrompt?: string;
    orderedMessages?: 通用消息[];
    leadingSystemPrompt?: string;
    styleAssistantPrompt?: string;
    outputProtocolPrompt?: string;
    lengthRequirementPrompt?: string;
    disclaimerRequirementPrompt?: string;
    validateTagCompleteness?: boolean;
    enableTagRepair?: boolean;
    requireActionOptionsTag?: boolean;
    requireDynamicWorldTag?: boolean;
    errorDetailLimit?: number;
    eraId?: string;
}

// ==================== Memory Recall ====================

interface RecallStreamOptions {
    stream?: boolean;
    onDelta?: (delta: string, accumulated: string) => void;
}

export const generateMemoryRecall = async (
    systemPrompt: string,
    userPrompt: string,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    streamOptions?: RecallStreamOptions,
    extraPrompt?: string,
    cotPseudoHistoryPrompt?: string
): Promise<string> => {
    const normalizedExtraPrompt = (extraPrompt || '').trim();
    const normalizedCotPseudoPrompt = (cotPseudoHistoryPrompt || '').trim();
    const messagesRaw: 通用消息[] = [
        { role: 'system', content: systemPrompt }
    ];
    if (normalizedExtraPrompt) {
        messagesRaw.push({ role: 'user', content: `【额外要求提示词】\n${normalizedExtraPrompt}` });
    }
    messagesRaw.push({ role: 'user', content: userPrompt });
    if (normalizedCotPseudoPrompt) {
        messagesRaw.push({ role: 'assistant', content: normalizedCotPseudoPrompt });
    }
    const messages = 规范化文本补全消息链(messagesRaw, { 保留System: true, 合并同角色: false });
    return 请求模型文本(apiConfig, messages, {
        temperature: 0.2,
        signal,
        streamOptions
    });
};

// ==================== Body Polish ====================

const 清理润色正文输出 = (rawText: string): string => {
    let text = (rawText || '').trim();
    if (!text) return '';

    text = text
        .replace(/^```(?:text|markdown)?\s*/i, '')
        .replace(/```$/i, '')
        .trim();

    const thinkingSegment = 提取首尾思考区段(text);
    const textWithoutThinking = (
        thinkingSegment.matched
            ? thinkingSegment.textWithoutThinking
            : text
    ).trim();
    const bodyOpenRegex = /<\s*正文\s*>/gi;
    let bodyOpenMatch: RegExpExecArray | null = null;
    let lastBodyOpenMatch: RegExpExecArray | null = null;
    while ((bodyOpenMatch = bodyOpenRegex.exec(textWithoutThinking)) !== null) {
        lastBodyOpenMatch = bodyOpenMatch;
    }
    if (!lastBodyOpenMatch || typeof lastBodyOpenMatch.index !== 'number') {
        return '';
    }
    const payload = textWithoutThinking
        .slice(lastBodyOpenMatch.index + lastBodyOpenMatch[0].length)
        .replace(/<\s*\/\s*正文\s*>\s*$/i, '')
        .replace(/^[\t ]+|[\t ]+$/gm, '')
        .trim();
    return payload;
};

export interface PolishedBodyResult {
    bodyText: string;
    rawText: string;
}

export const generatePolishedBody = async (
    bodyText: string,
    polishPrompt: string,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    extraPrompt?: string,
    cotPseudoHistoryPrompt?: string
): Promise<PolishedBodyResult> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');
    const normalizedBody = (bodyText || '').trim();
    if (!normalizedBody) {
        return { bodyText: '', rawText: '' };
    }

    const normalizedPrompt = (polishPrompt || '').trim();
    const fallbackPrompt = [
        '请在不改变事实前提下润色正文，并仅输出正文。',
        '【输出结构硬约束】',
        '1) 你必须输出 <thinking>...</thinking> 与 <正文>...</正文> 两个标签块，顺序固定为 thinking 在前、正文在后。',
        '2) 除这两个标签外，禁止输出其他内容（解释、命令、免责声明、代码块等）。',
        '3) 系统只会提取 <正文> 内容用于最终渲染。'
    ].join('\n');
    const systemPrompt = normalizedPrompt || fallbackPrompt;
    const userPrompt = ['【待润色正文】', normalizedBody].join('\n');
    const normalizedExtraPrompt = (extraPrompt || '').trim();
    const normalizedCotPseudoPrompt = (cotPseudoHistoryPrompt || '').trim();

    const messagesRaw: 通用消息[] = [{ role: 'system', content: systemPrompt }];
    if (normalizedExtraPrompt) {
        messagesRaw.push({ role: 'user', content: `【额外要求提示词】\n${normalizedExtraPrompt}` });
    }
    messagesRaw.push({ role: 'user', content: userPrompt });
    if (normalizedCotPseudoPrompt) {
        messagesRaw.push({ role: 'assistant', content: normalizedCotPseudoPrompt });
    }
    const messages = 规范化文本补全消息链(messagesRaw, { 保留System: true, 合并同角色: false });

    const raw = await 请求模型文本(apiConfig, messages, {
        temperature: 0.6,
        signal,
        errorDetailLimit: Number.POSITIVE_INFINITY
    });

    return { bodyText: 清理润色正文输出(raw), rawText: raw };
};

// ==================== World Generation ====================

interface WorldStreamOptions {
    stream?: boolean;
    onDelta?: (delta: string, accumulated: string) => void;
}

export const generateWorldData = async (
    worldContext: string,
    charData: any,
    apiConfig: 当前可用接口结构,
    streamOptions?: WorldStreamOptions,
    extraPrompt?: string,
    cotPseudoHistoryPrompt?: string,
    config?: { 启用修炼体系?: boolean }
): Promise<string> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');

    const genSystemPrompt = 获取世界观生成系统提示词(config);
    const genUserPrompt = 构建世界观生成用户提示词(worldContext, charData, config);
    const normalizedExtraPrompt = (extraPrompt || '').trim();
    const normalizedCotPseudoPrompt = (cotPseudoHistoryPrompt || '').trim();

    const messagesRaw: 通用消息[] = [{ role: 'system', content: genSystemPrompt }];
    if (normalizedExtraPrompt) {
        messagesRaw.push({ role: 'user', content: `【额外要求提示词】\n${normalizedExtraPrompt}` });
    }
    messagesRaw.push({ role: 'user', content: genUserPrompt });
    if (normalizedCotPseudoPrompt) {
        messagesRaw.push({ role: 'assistant', content: normalizedCotPseudoPrompt });
    }
    const messages = 规范化文本补全消息链(messagesRaw, { 保留System: true, 合并同角色: false });

    const rawText = await 请求模型文本(apiConfig, messages, { temperature: 0.8, streamOptions });
    return 解析世界观提示词内容(rawText);
};

export const 解析世界观提示词内容 = (content: string): string => {
    const source = (content || '').trim();
    if (!source) throw new Error('世界观生成解析失败: 输出为空');

    const findLastMatch = (text: string, regex: RegExp): { index: number; length: number } | null => {
        const re = new RegExp(regex.source, regex.flags);
        let match: RegExpExecArray | null = null;
        let last: { index: number; length: number } | null = null;
        while ((match = re.exec(text)) !== null) {
            last = { index: match.index, length: match[0].length };
        }
        return last;
    };

    const lastWorldOpen = findLastMatch(source, /<\s*世界观\s*>/gi);
    const lastThinkingClose = (() => {
        const thinking = findLastMatch(source, /<\s*\/\s*thinking\s*>/gi);
        const think = findLastMatch(source, /<\s*\/\s*think\s*>/gi);
        if (!thinking && !think) return null;
        if (thinking && think) return thinking.index >= think.index ? thinking : think;
        return thinking || think;
    })();

    const worldIndex = lastWorldOpen?.index ?? -1;
    const thinkingIndex = lastThinkingClose ? lastThinkingClose.index + lastThinkingClose.length : -1;
    const sliceStart = Math.max(worldIndex, thinkingIndex);
    const textForParsing = (sliceStart > 0 ? source.slice(sliceStart) : source).trim();

    const worldMatches = Array.from(textForParsing.matchAll(/<\s*世界观\s*>([\s\S]*?)(?:<\s*\/\s*世界观\s*>|$)/gi));
    const worldTagBlock = worldMatches.length > 0
        ? (worldMatches[worldMatches.length - 1]?.[1] || '').trim()
        : '';
    if (worldTagBlock) return worldTagBlock;

    const parsed = parseJsonWithRepair<Record<string, unknown>>(textForParsing);
    if (!parsed.value || typeof parsed.value !== 'object') {
        throw new Error(`世界观生成解析失败: 未找到<世界观>标签，且JSON解析失败: ${parsed.error || '未获得有效 JSON'}`);
    }
    const prompt = typeof parsed.value.world_prompt === 'string'
        ? parsed.value.world_prompt.trim()
        : typeof parsed.value.worldPrompt === 'string'
            ? parsed.value.worldPrompt.trim()
            : '';
    if (!prompt) throw new Error('世界观生成解析失败: 未找到<世界观>标签且world_prompt为空');
    return prompt;
};

// ==================== Fandom Realm Generation ====================

export const 解析境界体系提示词内容 = (content: string): string => {
    const source = (content || '').trim();
    if (!source) throw new Error('同人境界体系生成解析失败: 输出为空');

    const tagMatches = Array.from(source.matchAll(/<\s*境界体系\s*>([\s\S]*?)(?:<\s*\/\s*境界体系\s*>|$)/gi));
    const tagged = tagMatches.length > 0
        ? (tagMatches[tagMatches.length - 1]?.[1] || '').trim()
        : source;
    if (!tagged) throw new Error('同人境界体系生成解析失败: 未找到<境界体系>标签');

    const validation = 校验境界体系提示词完整性(tagged);
    if (!validation.ok) {
        const detail = [
            validation.missingSections.length > 0 ? `缺少区块: ${validation.missingSections.join('、')}` : '',
            validation.missingMappings.length > 0 ? `缺少映射值: ${validation.missingMappings.join('、')}` : '',
            validation.missingSubMarkers.length > 0 ? `缺少子标记: ${validation.missingSubMarkers.join('、')}` : '',
            validation.missingStageJumps.length > 0 ? `缺少阶段推进: ${validation.missingStageJumps.join('、')}` : '',
            validation.missingBreakthroughJumps.length > 0 ? `缺少大境突破: ${validation.missingBreakthroughJumps.join('、')}` : ''
        ].filter(Boolean).join('；');
        throw new Error(`同人境界体系生成解析失败: ${detail || '输出不完整'}`);
    }
    return validation.normalizedText;
};

export const generateFandomRealmData = async (
    params: { openingConfig?: any },
    apiConfig: 当前可用接口结构,
    streamOptions?: WorldStreamOptions,
    extraPrompt?: string
): Promise<string> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');

    const systemPrompt = 同人境界体系生成系统提示词;
    const userPrompt = 构建同人境界体系生成用户提示词({ openingConfig: params.openingConfig });
    const normalizedExtraPrompt = (extraPrompt || '').trim();

    const 请求并解析 = async (messages: 通用消息[], currentStreamOptions?: WorldStreamOptions): Promise<string> => {
        const rawText = await 请求模型文本(
            apiConfig,
            规范化文本补全消息链(messages, { 保留System: true, 合并同角色: false }),
            { temperature: 0.5, streamOptions: currentStreamOptions }
        );
        return 解析境界体系提示词内容(rawText);
    };

    const baseMessages: 通用消息[] = [{ role: 'system', content: systemPrompt }];
    if (normalizedExtraPrompt) {
        baseMessages.push({ role: 'user', content: `【额外要求提示词】\n${normalizedExtraPrompt}` });
    }
    baseMessages.push({ role: 'user', content: userPrompt });

    try {
        return await 请求并解析(baseMessages, streamOptions);
    } catch (error) {
        const repairMessages: 通用消息[] = [{ role: 'system', content: systemPrompt }];
        if (normalizedExtraPrompt) {
            repairMessages.push({ role: 'user', content: `【额外要求提示词】\n${normalizedExtraPrompt}` });
        }
        repairMessages.push(
            { role: 'user', content: userPrompt },
            { role: 'user', content: `上一次输出未通过校验，原因如下：${error instanceof Error ? error.message : '输出不完整'}。\n请完整重写，并确保 <境界体系> 中覆盖所有 required 区块、全部映射值、全部阶段推进跳转和全部大境突破跳转。` }
        );
        return 请求并解析(repairMessages, undefined);
    }
};

// ==================== Story Response ====================

const 解析故事响应 = (rawText: string, requestOptions?: StoryRequestOptions): StoryResponseResult => ({
    response: parseStoryRawText(rawText, {
        validateTagCompleteness: requestOptions?.validateTagCompleteness,
        enableTagRepair: requestOptions?.enableTagRepair,
        requireActionOptionsTag: requestOptions?.requireActionOptionsTag,
        requireDynamicWorldTag: requestOptions?.requireDynamicWorldTag
    }),
    rawText
});

export const generateStoryResponse = async (
    systemPrompt: string,
    userContext: string,
    playerInput: string,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    streamOptions?: StoryStreamOptions,
    extraPrompt?: string,
    requestOptions?: StoryRequestOptions
): Promise<StoryResponseResult> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');

    const orderedMessagesRaw = Array.isArray(requestOptions?.orderedMessages)
        ? requestOptions.orderedMessages
            .map((item) => ({ role: item?.role, content: typeof item?.content === 'string' ? item.content.trim() : '' }))
            .filter((item): item is 通用消息 =>
                (item.role === 'system' || item.role === 'user' || item.role === 'assistant') && item.content.length > 0
            )
        : [];
    const orderedMessages = 规范化文本补全消息链(orderedMessagesRaw, { 保留System: true, 合并同角色: false });

    if (orderedMessages.length > 0) {
        const rawText = await 请求模型文本(apiConfig, orderedMessages, {
            temperature: 0.7, signal, streamOptions, errorDetailLimit: requestOptions?.errorDetailLimit
        });
        return 解析故事响应(rawText, requestOptions);
    }

    const normalizedSystemPrompt = typeof systemPrompt === 'string' ? systemPrompt.trim() : '';
    const normalizedContext = typeof userContext === 'string' ? userContext.trim() : '';
    const normalizedExtraPrompt = typeof extraPrompt === 'string' ? extraPrompt.trim() : '';
    const enableCotInjection = requestOptions?.enableCotInjection !== false;
    const leadingSystemPrompt = typeof requestOptions?.leadingSystemPrompt === 'string' ? requestOptions.leadingSystemPrompt.trim() : '';
    const cotPseudoHistoryPromptRaw = typeof requestOptions?.cotPseudoHistoryPrompt === 'string'
        ? requestOptions.cotPseudoHistoryPrompt.trim()
        : 默认COT伪装历史消息提示词.trim();
    const cotPseudoHistoryPrompt = 替换COT伪装身份占位(cotPseudoHistoryPromptRaw, leadingSystemPrompt);
    const styleAssistantPrompt = typeof requestOptions?.styleAssistantPrompt === 'string' ? requestOptions.styleAssistantPrompt.trim() : '';
    const outputProtocolPrompt = typeof requestOptions?.outputProtocolPrompt === 'string' ? requestOptions.outputProtocolPrompt.trim() : '';
    const lengthRequirementPrompt = typeof requestOptions?.lengthRequirementPrompt === 'string' ? requestOptions.lengthRequirementPrompt.trim() : '';
    const disclaimerRequirementPrompt = typeof requestOptions?.disclaimerRequirementPrompt === 'string' ? requestOptions.disclaimerRequirementPrompt.trim() : '';

    const apiMessages: 通用消息[] = [];
    if (normalizedSystemPrompt) apiMessages.push({ role: 'system', content: normalizedSystemPrompt });
    if (normalizedContext) apiMessages.push({ role: 'system', content: normalizedContext });
    if (leadingSystemPrompt) apiMessages.push({ role: 'system', content: leadingSystemPrompt });
    if (lengthRequirementPrompt) apiMessages.push({ role: 'system', content: lengthRequirementPrompt });
    if (styleAssistantPrompt) apiMessages.push({ role: 'system', content: styleAssistantPrompt });
    if (outputProtocolPrompt) apiMessages.push({ role: 'system', content: outputProtocolPrompt });
    if (disclaimerRequirementPrompt) apiMessages.push({ role: 'user', content: disclaimerRequirementPrompt });
    if (normalizedExtraPrompt) apiMessages.push({ role: 'user', content: normalizedExtraPrompt });

    const normalizedPlayerInput = typeof playerInput === 'string' && playerInput.trim().length > 0 ? playerInput : '开始任务。';
    if (enableCotInjection && cotPseudoHistoryPrompt) {
        apiMessages.push({ role: 'user', content: '开始任务。' });
        apiMessages.push({ role: 'assistant', content: cotPseudoHistoryPrompt });
    }
    apiMessages.push({ role: 'user', content: normalizedPlayerInput });

    const normalizedApiMessages = 规范化文本补全消息链(apiMessages, { 保留System: true, 合并同角色: false });

    const rawText = await 请求模型文本(apiConfig, normalizedApiMessages, {
        temperature: 0.7, signal, streamOptions, errorDetailLimit: requestOptions?.errorDetailLimit
    });

    return 解析故事响应(rawText, requestOptions);
};

// ==================== Connection Test ====================

export const testConnection = async (apiConfig: 当前可用接口结构): Promise<ConnectionTestResult> => {
    if (!apiConfig.apiKey) return { ok: false, detail: '缺少 API Key' };
    if (!apiConfig.baseUrl) return { ok: false, detail: '缺少 Base URL' };
    if (!apiConfig.model) return { ok: false, detail: '缺少模型名称' };

    const messages = 规范化文本补全消息链([
        { role: 'user', content: '你是连接测试。请只回答 OK。' },
        { role: 'user', content: 'ping' }
    ], { 保留System: true, 合并同角色: true });

    const startedAt = Date.now();
    try {
        const text = await 请求模型文本(apiConfig, messages, { temperature: 0, errorDetailLimit: Number.POSITIVE_INFINITY });
        const elapsed = Date.now() - startedAt;
        const body = typeof text === 'string' ? text : '';
        const content = body.length > 0 ? body : '无响应内容';
        return { ok: true, detail: `耗时: ${elapsed}ms\n\n${content}` };
    } catch (error: unknown) {
        const raw = (error as any)?.detail ?? (error as any)?.message ?? error ?? '未知错误';
        const detail = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
        return { ok: false, detail };
    }
};

// ==================== Story Response with Failover ====================

export const generateStoryResponseWithFailover = async (
    settings: 接口设置结构,
    primaryConfig: 当前可用接口结构 | null,
    systemPrompt: string,
    userContext: string,
    playerInput: string,
    signal?: AbortSignal,
    streamOptions?: StoryStreamOptions,
    extraPrompt?: string,
    requestOptions?: StoryRequestOptions
): Promise<StoryResponseResult & { usedConfig: 当前可用接口结构; attempts: number }> => {
    const orderedMessagesRaw = Array.isArray(requestOptions?.orderedMessages)
        ? requestOptions.orderedMessages
            .map((item) => ({ role: item?.role, content: typeof item?.content === 'string' ? item.content.trim() : '' }))
            .filter((item): item is 通用消息 =>
                (item.role === 'system' || item.role === 'user' || item.role === 'assistant') && item.content.length > 0
            )
        : [];
    const orderedMessages = 规范化文本补全消息链(orderedMessagesRaw, { 保留System: true, 合并同角色: false });

    const candidates: 当前可用接口结构[] = [];
    const seenIds = new Set<string>();
    if (primaryConfig?.id) { candidates.push(primaryConfig); seenIds.add(primaryConfig.id); }
    for (const cfg of (settings.configs || [])) {
        if (!seenIds.has(cfg.id) && cfg.baseUrl && cfg.apiKey) {
            seenIds.add(cfg.id);
            candidates.push({
                id: cfg.id, 名称: cfg.名称, 供应商: cfg.供应商, baseUrl: cfg.baseUrl,
                apiKey: cfg.apiKey, model: cfg.model || primaryConfig?.model || '',
                maxTokens: cfg.maxTokens, temperature: cfg.temperature
            });
        }
    }
    if (candidates.length === 0) throw new Error('没有可用的 API 配置。');

    const attemptDetails: Array<{ configId: string; baseUrl: string; error: string }> = [];

    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        try {
            const messages = orderedMessages.length > 0 ? orderedMessages : (() => {
                const normalizedSystemPrompt = typeof systemPrompt === 'string' ? systemPrompt.trim() : '';
                const normalizedContext = typeof userContext === 'string' ? userContext.trim() : '';
                const normalizedExtraPrompt = typeof extraPrompt === 'string' ? extraPrompt.trim() : '';
                const enableCotInjection = requestOptions?.enableCotInjection !== false;
                const leadingSystemPrompt = typeof requestOptions?.leadingSystemPrompt === 'string' ? requestOptions.leadingSystemPrompt.trim() : '';
                const cotPseudoHistoryPromptRaw = typeof requestOptions?.cotPseudoHistoryPrompt === 'string' ? requestOptions.cotPseudoHistoryPrompt.trim() : 默认COT伪装历史消息提示词.trim();
                const cotPseudoHistoryPrompt = 替换COT伪装身份占位(cotPseudoHistoryPromptRaw, leadingSystemPrompt);
                const styleAssistantPrompt = typeof requestOptions?.styleAssistantPrompt === 'string' ? requestOptions.styleAssistantPrompt.trim() : '';
                const outputProtocolPrompt = typeof requestOptions?.outputProtocolPrompt === 'string' ? requestOptions.outputProtocolPrompt.trim() : '';
                const lengthRequirementPrompt = typeof requestOptions?.lengthRequirementPrompt === 'string' ? requestOptions.lengthRequirementPrompt.trim() : '';
                const disclaimerRequirementPrompt = typeof requestOptions?.disclaimerRequirementPrompt === 'string' ? requestOptions.disclaimerRequirementPrompt.trim() : '';
                const msgs: 通用消息[] = [];
                if (normalizedSystemPrompt) msgs.push({ role: 'system', content: normalizedSystemPrompt });
                if (normalizedContext) msgs.push({ role: 'system', content: normalizedContext });
                if (leadingSystemPrompt) msgs.push({ role: 'system', content: leadingSystemPrompt });
                if (lengthRequirementPrompt) msgs.push({ role: 'system', content: lengthRequirementPrompt });
                if (styleAssistantPrompt) msgs.push({ role: 'system', content: styleAssistantPrompt });
                if (outputProtocolPrompt) msgs.push({ role: 'system', content: outputProtocolPrompt });
                if (disclaimerRequirementPrompt) msgs.push({ role: 'user', content: disclaimerRequirementPrompt });
                if (normalizedExtraPrompt) msgs.push({ role: 'user', content: normalizedExtraPrompt });
                const normalizedPlayerInput = typeof playerInput === 'string' && playerInput.trim().length > 0 ? playerInput : '开始任务。';
                if (enableCotInjection && cotPseudoHistoryPrompt) { msgs.push({ role: 'user', content: '开始任务。' }); msgs.push({ role: 'assistant', content: cotPseudoHistoryPrompt }); }
                msgs.push({ role: 'user', content: normalizedPlayerInput });
                return 规范化文本补全消息链(msgs, { 保留System: true, 合并同角色: true });
            })();

            const rawText = await 请求模型文本(candidate, messages, {
                temperature: 0.7, signal, streamOptions, errorDetailLimit: requestOptions?.errorDetailLimit
            });
            return { ...解析故事响应(rawText, requestOptions), usedConfig: candidate, attempts: i + 1 };
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            attemptDetails.push({ configId: candidate.id, baseUrl: candidate.baseUrl, error: msg });
            if (signal?.aborted) throw error;
        }
    }

    throw new Error(
        `所有 ${candidates.length} 个 API 配置均失败。` +
        attemptDetails.map(a => `\n- ${a.configId} (${a.baseUrl}): ${a.error}`).join('')
    );
};
