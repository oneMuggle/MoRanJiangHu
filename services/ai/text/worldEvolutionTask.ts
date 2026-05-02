import { TavernCommand } from '../../../types';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import { 构建世界演变系统提示词, 构建世界演变用户提示词 } from '../../../prompts/runtime/worldEvolution';
import { 同人世界演变附加系统提示词, 同人世界演变附加COT提示词 } from '../../../prompts/runtime/fandomWorldEvolution';
import {
    type 通用消息,
    规范化文本补全消息链,
    请求模型文本
} from '../chatCompletionClient';
import { 提取首尾思考区段, 解析动态世界块, 解析命令块, 提取首个标签内容 } from './storyResponseParser';

export interface WorldEvolutionResult {
    commands: TavernCommand[];
    updates: string[];
    rawText: string;
}

// ==================== Parsing Helpers ====================

const 提取世界演变标题区块 = (text: string): { updateBlock: string; commandBlock: string } => {
    const sections: Record<'说明' | '命令', string[]> = { 说明: [], 命令: [] };
    const lines = (text || '').replace(/\r\n/g, '\n').split('\n');
    let current: '说明' | '命令' | null = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) { if (current) sections[current].push(''); continue; }

        if (/^(?:【\s*)?(?:说明|世界更新|动态世界)(?:\s*】)?\s*[:：]?\s*(.*)$/i.test(line)) {
            current = '说明';
            const matched = line.match(/^(?:【\s*)?(?:说明|世界更新|动态世界)(?:\s*】)?\s*[:：]?\s*(.*)$/i);
            const firstLine = (matched?.[1] || '').trim();
            if (firstLine) sections[current].push(firstLine);
            continue;
        }
        if (/^(?:【\s*)?(?:命令|commands?|cmd)(?:\s*】)?\s*[:：]?\s*(.*)$/i.test(line)) {
            current = '命令';
            const matched = line.match(/^(?:【\s*)?(?:命令|commands?|cmd)(?:\s*】)?\s*[:：]?\s*(.*)$/i);
            const firstLine = (matched?.[1] || '').trim();
            if (firstLine) sections[current].push(firstLine);
            continue;
        }

        if (current) sections[current].push(rawLine.trimEnd());
    }

    return {
        updateBlock: sections.说明.join('\n').trim(),
        commandBlock: sections.命令.join('\n').trim()
    };
};

const 解析世界演变候选文本 = (text: string): { commands: TavernCommand[]; updates: string[] } => {
    const candidate = (text || '').trim();
    if (!candidate) return { commands: [], updates: [] };

    const updateBlock = 提取首个标签内容(candidate, '说明')
        || 提取首个标签内容(candidate, '世界更新')
        || 提取首个标签内容(candidate, '动态世界');
    const commandBlock = 提取首个标签内容(candidate, '命令');
    const titleBlocks = (!updateBlock && !commandBlock) ? 提取世界演变标题区块(candidate) : { updateBlock: '', commandBlock: '' };

    const updates = 解析动态世界块(updateBlock || titleBlocks.updateBlock);
    const commands = 解析命令块(commandBlock || titleBlocks.commandBlock)
        .map((cmd) => ({ action: cmd.action, key: cmd.key, value: cmd.value })) as TavernCommand[];

    if (commands.length > 0 || updates.length > 0) return { commands, updates };
    return { commands: 解析命令块(candidate) as TavernCommand[], updates: [] };
};

const 解析世界演变响应 = (rawText: string): { commands: TavernCommand[]; updates: string[] } => {
    const source = (rawText || '').trim();
    if (!source) return { commands: [], updates: [] };

    const thinkingSegment = 提取首尾思考区段(source);
    const candidates = [
        (thinkingSegment.matched ? thinkingSegment.textWithoutThinking : source).trim(),
        thinkingSegment.matched
            ? source.replace(/<\s*\/\s*(thinking|think)\s*>/gi, '').replace(/<\s*(thinking|think)\s*>/gi, '').trim()
            : '',
        source
    ].filter((item, index, list) => Boolean(item) && list.indexOf(item) === index);

    for (const candidate of candidates) {
        const parsed = 解析世界演变候选文本(candidate);
        if (parsed.commands.length > 0 || parsed.updates.length > 0) return parsed;
    }

    return { commands: [], updates: [] };
};

// ==================== World Evolution ====================

const 构建独立任务触发消息 = (taskPrompt: string, gptMode?: boolean, fallback = '开始任务'): 通用消息 => ({
    role: 'user',
    content: gptMode ? taskPrompt : fallback
});

export const generateWorldEvolutionUpdate = async (
    worldContext: string,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    extraPrompt?: string,
    cotPseudoHistoryPrompt?: string,
    cotPrompt?: string,
    fandomEnabled?: boolean,
    gptMode?: boolean
): Promise<WorldEvolutionResult> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');

    const systemPrompt = 构建世界演变系统提示词({ fandom: fandomEnabled === true });
    const userPrompt = 构建世界演变用户提示词(worldContext, { fandom: fandomEnabled === true });
    const normalizedExtraPrompt = (extraPrompt || '').trim();
    const normalizedCotPseudoPrompt = (cotPseudoHistoryPrompt || '').trim();
    const normalizedCotPrompt = (cotPrompt || '').trim();
    const fandomSystemPrompt = fandomEnabled ? 同人世界演变附加系统提示词 : '';
    const fandomCotPrompt = fandomEnabled ? 同人世界演变附加COT提示词 : '';

    const messagesRaw: 通用消息[] = [{ role: 'system', content: systemPrompt }];
    if (fandomSystemPrompt) messagesRaw.push({ role: 'system', content: fandomSystemPrompt });
    if (normalizedExtraPrompt) messagesRaw.push({ role: 'system', content: `【额外要求提示词】\n${normalizedExtraPrompt}` });
    if (gptMode) {
        messagesRaw.push({ role: 'user', content: userPrompt });
    } else {
        messagesRaw.push({ role: 'system', content: userPrompt });
    }
    if (normalizedCotPrompt) {
        messagesRaw.push({ role: 'system', content: normalizedCotPrompt });
        if (fandomCotPrompt) messagesRaw.push({ role: 'system', content: fandomCotPrompt });
        if (!gptMode) messagesRaw.push(构建独立任务触发消息(userPrompt, false));
    } else if (fandomCotPrompt) {
        messagesRaw.push({ role: 'system', content: fandomCotPrompt });
    }
    if (normalizedCotPseudoPrompt) messagesRaw.push({ role: 'assistant', content: normalizedCotPseudoPrompt });
    const messages = 规范化文本补全消息链(messagesRaw, { 保留System: true, 合并同角色: false });

    const rawText = await 请求模型文本(apiConfig, messages, {
        temperature: 0.4,
        signal,
        errorDetailLimit: Number.POSITIVE_INFINITY
    });
    const parsed = 解析世界演变响应(rawText);
    return { commands: parsed.commands, updates: parsed.updates, rawText };
};
