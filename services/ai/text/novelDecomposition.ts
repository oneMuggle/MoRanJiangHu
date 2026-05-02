import { TavernCommand } from '../../../types';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import { parseJsonWithRepair } from '../../../utils/jsonRepair';
import {
    小说拆分AI身份提示词,
    小说拆分其他要求提示词,
    小说拆分结构要求提示词,
    构建小说拆分当前任务提示词,
    小说拆分COT伪装提示词
} from '../../../prompts/runtime/novelDecomposition';
import { 小说拆分COT提示词 } from '../../../prompts/runtime/novelDecompositionCot';
import { 同人规划分析附加系统提示词, 同人规划分析附加COT提示词 } from '../../../prompts/runtime/fandomPlanningAnalysis';
import { 构建统一规划分析系统提示词, 构建统一规划分析用户提示词 } from '../../../prompts/runtime/planningAnalysis';
import {
    构建统一规划分析专用上下文,
    统一规划分析COT提示词
} from '../../../prompts/runtime/planUpdateReference';
import { 默认COT伪装历史消息提示词 } from '../../../prompts/runtime/defaults';
import { 构建AI角色声明提示词 } from '../../../prompts/runtime/roleIdentity';
import {
    规范化文本补全消息链,
    请求模型文本,
    替换COT伪装身份占位
} from '../chatCompletionClient';
import { 提取首尾思考区段, 解析动态世界块, 解析命令块, 提取首个标签内容 } from './storyResponseParser';

// ==================== Types ====================

export interface PlanningAnalysisResult {
    shouldUpdate: boolean;
    reason: string;
    commands: TavernCommand[];
    notes: string[];
    rawText: string;
}

export interface NovelDecompositionEventAnalysisResult {
    事件名: string;
    事件说明: string;
    开始时间: string;
    最早开始时间: string;
    最迟开始时间: string;
    结束时间: string;
    前置条件: string[];
    触发条件: string[];
    阻断条件: string[];
    事件结果: string[];
    对下一组影响: string[];
    信息可见性: NovelDecompositionVisibilityAnalysisResult;
}

export interface NovelDecompositionVisibilityAnalysisResult {
    谁知道: string[];
    谁不知道: string[];
    是否仅读者视角可见: boolean;
}

export interface NovelDecompositionVisibleInfoItemAnalysisResult {
    内容: string;
    信息可见性: NovelDecompositionVisibilityAnalysisResult;
}

export interface NovelDecompositionCharacterProgressAnalysisResult {
    角色名: string;
    本组前状态: string[];
    本组变化: string[];
    本组后状态: string[];
    对下一组影响: string[];
}

export interface NovelDecompositionAnalysisResult {
    groupNumber: number;
    chapterRange: string;
    chapterTitles: string[];
    isOpeningGroup: boolean;
    summary: string;
    openingFacts: string[];
    continuationFacts: string[];
    endStates: string[];
    nextGroupReferences: string[];
    hardConstraints: NovelDecompositionVisibleInfoItemAnalysisResult[];
    foreshadowing: NovelDecompositionVisibleInfoItemAnalysisResult[];
    appearingCharacters: string[];
    timelineStart: string;
    timelineEnd: string;
    keyEvents: NovelDecompositionEventAnalysisResult[];
    characterProgressions: NovelDecompositionCharacterProgressAnalysisResult[];
    rawText: string;
}

// ==================== Title Alias Map ====================

const 标题别名映射 = {
    组号: ['组号'],
    章节范围: ['章节范围'],
    章节标题: ['章节标题'],
    是否开局组: ['是否开局组'],
    本组概括: ['本组概括'],
    开局已成立事实: ['开局已成立事实'],
    前组延续事实: ['前组延续事实'],
    本组结束状态: ['本组结束状态'],
    给下一组参考: ['给下一组参考'],
    原著硬约束: ['原著硬约束'],
    可提前铺垫: ['可提前铺垫'],
    登场角色: ['登场角色'],
    时间线起点: ['时间线起点', '本组开始时间', '本组开始时间线'],
    时间线终点: ['时间线终点', '本组结束时间', '本组结束时间线'],
    关键事件: ['关键事件'],
    角色推进: ['角色推进']
} as const;

type 标题键 = keyof typeof 标题别名映射;

const 标题别名到键映射 = new Map<string, 标题键>(
    Object.entries(标题别名映射).flatMap(([key, aliases]) =>
        (aliases as readonly string[]).map((alias) => [alias, key as 标题键] as const)
    )
);

const 标题别名模式 = Array.from(标题别名到键映射.keys())
    .sort((a, b) => b.length - a.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

// ==================== Utility Helpers ====================

const 去重文本列表 = (items: string[], maxCount?: number): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of items) {
        const normalized = String(raw || '').trim();
        if (!normalized || normalized === '无') continue;
        const key = normalized.replace(/\s+/g, '');
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(normalized);
        if (typeof maxCount === 'number' && result.length >= maxCount) break;
    }
    return result;
};

const 获取候选文本列表 = (rawText: string): string[] => {
    const source = (rawText || '').trim();
    if (!source) return [];

    const thinkingSegment = 提取首尾思考区段(source);
    let textWithoutThinking = (thinkingSegment.matched ? thinkingSegment.textWithoutThinking : source).trim();
    if (thinkingSegment.matched && !textWithoutThinking) {
        textWithoutThinking = source
            .replace(/<\s*\/\s*(thinking|think)\s*>/gi, '')
            .replace(/<\s*(thinking|think)\s*>/gi, '')
            .trim();
    }

    return 去重文本列表([
        提取首个标签内容(textWithoutThinking, '结果') || '',
        textWithoutThinking,
        提取首个标签内容(source, '结果') || '',
        source
    ]);
};

const 规范化标题文本 = (text: string): string => {
    const source = (text || '').replace(/\r\n/g, '\n');
    if (!source.trim()) return '';
    const wrappedHeadingPattern = new RegExp(
        `([^\\n])((?:【\\s*|\\[\\s*|<\\s*|\\*\\*\\s*)(${标题别名模式})(?:\\s*】|\\s*\\]|\\s*>|\\s*\\*\\*))`,
        'g'
    );
    return source.replace(wrappedHeadingPattern, '$1\n$2');
};

const 匹配标题行 = (line: string): { key: 标题键; content: string } | null => {
    const matched = line.trim().match(
        new RegExp(
            `^(?:#+\\s*)?(?:[-*•]\\s*)?(?:【\\s*|\\[\\s*|<\\s*|\\*\\*\\s*)?(${标题别名模式})(?:\\s*】|\\s*\\]|\\s*>|\\s*\\*\\*)?\\s*[:：-]?\\s*(.*)$`
        )
    );
    if (!matched) return null;
    const key = 标题别名到键映射.get((matched[1] || '').trim());
    if (!key) return null;
    return { key, content: (matched[2] || '').trim() };
};

const 统计括号差值 = (value: string): number => {
    let balance = 0;
    for (const char of (value || '')) {
        if (char === '(' || char === '（') balance += 1;
        if (char === ')' || char === '）') balance -= 1;
    }
    return balance;
};

const 存在未闭合括号 = (value: string): boolean => 统计括号差值(value) > 0;

const 规范化概括文本 = (value: unknown): string => {
    if (typeof value !== 'string') return '';
    const source = value.replace(/\r\n/g, '\n').trim();
    if (!source || /^无$/i.test(source)) return '';
    return source
        .split('\n')
        .map((line) => line.trim().replace(/[^\S\r\n]+/g, ' '))
        .filter(Boolean)
        .join('\n')
        .trim();
};

const 规范化信息可见性 = (raw: any): NovelDecompositionVisibilityAnalysisResult => ({
    谁知道: 去重文本列表(Array.isArray(raw?.谁知道) ? raw.谁知道 : [], 12),
    谁不知道: 去重文本列表(Array.isArray(raw?.谁不知道) ? raw.谁不知道 : [], 12),
    是否仅读者视角可见: raw?.是否仅读者视角可见 === true
});

const 合并信息可见性 = (
    left: NovelDecompositionVisibilityAnalysisResult,
    right: NovelDecompositionVisibilityAnalysisResult
): NovelDecompositionVisibilityAnalysisResult => ({
    谁知道: 去重文本列表([...(left?.谁知道 || []), ...(right?.谁知道 || [])], 12),
    谁不知道: 去重文本列表([...(left?.谁不知道 || []), ...(right?.谁不知道 || [])], 12),
    是否仅读者视角可见: left?.是否仅读者视角可见 === true || right?.是否仅读者视角可见 === true
});

const 规范化可见信息条目 = (raw: any): NovelDecompositionVisibleInfoItemAnalysisResult => ({
    内容: typeof raw?.内容 === 'string' ? raw.内容.trim() : typeof raw?.content === 'string' ? raw.content.trim() : '',
    信息可见性: 规范化信息可见性(raw?.信息可见性)
});

const 去重可见信息条目 = (
    items: NovelDecompositionVisibleInfoItemAnalysisResult[],
    maxCount?: number
): NovelDecompositionVisibleInfoItemAnalysisResult[] => {
    const ordered: NovelDecompositionVisibleInfoItemAnalysisResult[] = [];
    const indexMap = new Map<string, number>();

    for (const raw of Array.isArray(items) ? items : []) {
        const item = 规范化可见信息条目(raw);
        if (!item.内容 || item.内容 === '无') continue;
        const key = item.内容.replace(/\s+/g, '');
        const existingIndex = indexMap.get(key);
        if (typeof existingIndex === 'number') {
            ordered[existingIndex] = {
                ...ordered[existingIndex],
                信息可见性: 合并信息可见性(ordered[existingIndex].信息可见性, item.信息可见性)
            };
            continue;
        }
        indexMap.set(key, ordered.length);
        ordered.push(item);
        if (typeof maxCount === 'number' && ordered.length >= maxCount) break;
    }
    return ordered;
};

const 解析分隔列表 = (value: string): string[] => (value || '')
    .split(/[、,，/｜|；;]/)
    .map((item) => item.trim())
    .filter((item) => item && item !== '无');

const 解析数字 = (value: string, fallback = 1): number => {
    const numeric = Number((value || '').trim());
    return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : fallback;
};

const 解析布尔 = (value: string): boolean => /^(?:是|true|yes|y|1)$/i.test((value || '').trim());

const 解析信息可见性 = (entry: Record<string, string>): NovelDecompositionVisibilityAnalysisResult => (
    规范化信息可见性({
        谁知道: 解析分隔列表(entry.谁知道 || ''),
        谁不知道: 解析分隔列表(entry.谁不知道 || ''),
        是否仅读者视角可见: 解析布尔(entry.是否仅读者视角可见 || '')
    })
);

const 解析JSON信息可见性 = (raw: any): NovelDecompositionVisibilityAnalysisResult => {
    const source = raw?.信息可见性 && typeof raw.信息可见性 === 'object'
        ? raw.信息可见性
        : raw?.visibility && typeof raw.visibility === 'object'
            ? raw.visibility
            : raw;
    const 转列表 = (value: unknown): string[] => Array.isArray(value)
        ? value.map((item) => String(item || '').trim()).filter(Boolean)
        : typeof value === 'string'
            ? 解析分隔列表(value)
            : [];
    return 规范化信息可见性({
        谁知道: 转列表(source?.谁知道 ?? source?.knownBy),
        谁不知道: 转列表(source?.谁不知道 ?? source?.unknownTo),
        是否仅读者视角可见: source?.是否仅读者视角可见 === true || source?.readerOnly === true
    });
};

const 解析可见信息条目 = (entry: Record<string, string>): NovelDecompositionVisibleInfoItemAnalysisResult => ({
    内容: (entry.内容 || '').trim(),
    信息可见性: 解析信息可见性(entry)
});

const 解析JSON可见信息条目 = (raw: any): NovelDecompositionVisibleInfoItemAnalysisResult => ({
    内容: typeof raw?.内容 === 'string' ? raw.内容.trim() : typeof raw?.content === 'string' ? raw.content.trim() : '',
    信息可见性: 解析JSON信息可见性(raw)
});

// ==================== Result Normalization ====================

const 规范化结果 = (base: Omit<NovelDecompositionAnalysisResult, 'rawText'>): Omit<NovelDecompositionAnalysisResult, 'rawText'> => ({
    groupNumber: Math.max(1, Number(base.groupNumber) || 1),
    chapterRange: typeof base.chapterRange === 'string' ? base.chapterRange.trim() : '',
    chapterTitles: 去重文本列表(base.chapterTitles || [], 24),
    isOpeningGroup: base.isOpeningGroup === true,
    summary: 规范化概括文本(base.summary),
    openingFacts: 去重文本列表(base.openingFacts || [], 12),
    continuationFacts: 去重文本列表(base.continuationFacts || [], 12),
    endStates: 去重文本列表(base.endStates || [], 12),
    nextGroupReferences: 去重文本列表(base.nextGroupReferences || [], 12),
    hardConstraints: 去重可见信息条目(base.hardConstraints || [], 12),
    foreshadowing: 去重可见信息条目(base.foreshadowing || [], 12),
    appearingCharacters: 去重文本列表(base.appearingCharacters || [], 24),
    timelineStart: typeof base.timelineStart === 'string' ? base.timelineStart.trim() : '',
    timelineEnd: typeof base.timelineEnd === 'string' ? base.timelineEnd.trim() : '',
    keyEvents: Array.isArray(base.keyEvents)
        ? base.keyEvents
            .map((event) => ({
                事件名: typeof event?.事件名 === 'string' ? event.事件名.trim() : '',
                事件说明: typeof event?.事件说明 === 'string' ? event.事件说明.trim() : '',
                开始时间: typeof event?.开始时间 === 'string' ? event.开始时间.trim() : '',
                最早开始时间: typeof event?.最早开始时间 === 'string' ? event.最早开始时间.trim() : '',
                最迟开始时间: typeof event?.最迟开始时间 === 'string' ? event.最迟开始时间.trim() : '',
                结束时间: typeof event?.结束时间 === 'string' ? event.结束时间.trim() : '',
                前置条件: 去重文本列表(event?.前置条件 || [], 12),
                触发条件: 去重文本列表(event?.触发条件 || [], 12),
                阻断条件: 去重文本列表(event?.阻断条件 || [], 12),
                事件结果: 去重文本列表(event?.事件结果 || [], 12),
                对下一组影响: 去重文本列表(event?.对下一组影响 || [], 12),
                信息可见性: 规范化信息可见性(event?.信息可见性)
            }))
            .filter((event) => event.事件名 || event.事件说明)
        : [],
    characterProgressions: Array.isArray(base.characterProgressions)
        ? base.characterProgressions
            .map((item) => ({
                角色名: typeof item?.角色名 === 'string' ? item.角色名.trim() : '',
                本组前状态: 去重文本列表(item?.本组前状态 || [], 12),
                本组变化: 去重文本列表(item?.本组变化 || [], 12),
                本组后状态: 去重文本列表(item?.本组后状态 || [], 12),
                对下一组影响: 去重文本列表(item?.对下一组影响 || [], 12)
            }))
            .filter((item) => item.角色名)
        : []
});

// ==================== Tag-Based Parsing ====================

const 提取标题区块 = (text: string): Record<标题键, string> => {
    const sections: Record<标题键, string[]> = {
        组号: [], 章节范围: [], 章节标题: [], 是否开局组: [], 本组概括: [],
        开局已成立事实: [], 前组延续事实: [], 本组结束状态: [], 给下一组参考: [],
        原著硬约束: [], 可提前铺垫: [], 登场角色: [],
        时间线起点: [], 时间线终点: [], 关键事件: [], 角色推进: []
    };
    const lines = 规范化标题文本(text).split('\n');
    let current: 标题键 | null = null;

    for (const rawLine of lines) {
        const matched = 匹配标题行(rawLine);
        if (matched) {
            current = matched.key;
            if (matched.content) sections[current].push(matched.content);
            continue;
        }
        if (current) sections[current].push(rawLine.trimEnd());
    }

    return Object.fromEntries(
        Object.entries(sections).map(([key, values]) => [key, values.join('\n').trim()])
    ) as Record<标题键, string>;
};

const 解析列表区块 = (text: string): string[] => {
    const result: string[] = [];
    let current = '';
    const lines = (text || '').replace(/\r\n/g, '\n').split('\n');

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || /^无$/i.test(line)) continue;
        const itemMatch = line.match(/^(?:[-*•]\s*|\d+[.)、]\s*|\[\d+\]\s*)(.+)$/);
        if (itemMatch) {
            const nextItem = (itemMatch[1] || '').trim();
            if (current && nextItem && 存在未闭合括号(current)) {
                current = `${current} ${nextItem}`.trim();
                continue;
            }
            if (current) result.push(current.trim());
            current = nextItem;
            continue;
        }
        if (current) { current = `${current} ${line}`.trim(); continue; }
        result.push(line);
    }
    if (current) result.push(current.trim());
    return result.filter(Boolean);
};

const 解析单段区块 = (text: string): string => 规范化概括文本(text);

const 解析条目块 = (text: string): Array<Record<string, string>> => {
    const source = (text || '').replace(/\r\n/g, '\n').trim();
    if (!source || /^无$/i.test(source)) return [];

    const lines = source.split('\n');
    const entries: Array<Record<string, string>> = [];
    let current: Record<string, string> | null = null;
    let lastKey = '';

    const pushCurrent = () => {
        if (current && Object.keys(current).length > 0) entries.push(current);
        current = null;
        lastKey = '';
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        const entryMatch = line.match(/^\[(\d+)\]\s*(.*)$/);
        if (entryMatch) {
            pushCurrent();
            current = {};
            const inline = (entryMatch[2] || '').trim();
            if (inline) {
                const kvInline = inline.match(/^([^:：]+)\s*[:：]\s*(.*)$/);
                if (kvInline) { current[kvInline[1].trim()] = kvInline[2].trim(); lastKey = kvInline[1].trim(); }
            }
            continue;
        }
        if (!current) current = {};
        const kvMatch = line.match(/^(?:[-*•]\s*)?([^:：]+)\s*[:：]\s*(.*)$/);
        if (kvMatch) { current[kvMatch[1].trim()] = kvMatch[2].trim(); lastKey = kvMatch[1].trim(); continue; }
        if (lastKey) { current[lastKey] = `${current[lastKey] || ''}\n${line}`.trim(); }
    }

    pushCurrent();
    return entries;
};

// ==================== Result Extraction ====================

const 提取结果JSON = (rawText: string): any => {
    const candidates = 获取候选文本列表(rawText);
    let latestError = '未获得有效 JSON';

    for (const candidate of candidates) {
        const parsed = parseJsonWithRepair<any>(candidate);
        if (parsed.value && typeof parsed.value === 'object') return parsed.value;
        latestError = parsed.error || latestError;
    }

    throw new Error(`小说拆分解析失败: 未匹配到有效的 <结果> 标签结构，且 JSON 解析失败（${latestError}）`);
};

const 解析标签结果 = (rawText: string): NovelDecompositionAnalysisResult | null => {
    const candidates = 获取候选文本列表(rawText);
    if (candidates.length <= 0) return null;

    for (const candidate of candidates) {
        const sections = 提取标题区块(candidate);
        const hasStructuredContent = Object.values(sections).some((item) => Boolean(item));
        if (!hasStructuredContent) continue;

        return {
            ...规范化结果({
                groupNumber: 解析数字(sections.组号, 1),
                chapterRange: sections.章节范围,
                chapterTitles: 解析列表区块(sections.章节标题),
                isOpeningGroup: 解析布尔(sections.是否开局组),
                summary: 解析单段区块(sections.本组概括),
                openingFacts: 解析列表区块(sections.开局已成立事实),
                continuationFacts: 解析列表区块(sections.前组延续事实),
                endStates: 解析列表区块(sections.本组结束状态),
                nextGroupReferences: 解析列表区块(sections.给下一组参考),
                hardConstraints: 解析条目块(sections.原著硬约束).map(解析可见信息条目).filter((item) => item.内容),
                foreshadowing: 解析条目块(sections.可提前铺垫).map(解析可见信息条目).filter((item) => item.内容),
                appearingCharacters: 解析列表区块(sections.登场角色),
                timelineStart: (sections.时间线起点 || '').trim(),
                timelineEnd: (sections.时间线终点 || '').trim(),
                keyEvents: 解析条目块(sections.关键事件).map((entry) => ({
                    事件名: (entry.事件名 || '').trim(),
                    事件说明: (entry.事件说明 || '').trim(),
                    开始时间: (entry.开始时间 || '').trim(),
                    最早开始时间: (entry.最早开始时间 || '').trim(),
                    最迟开始时间: (entry.最迟开始时间 || '').trim(),
                    结束时间: (entry.结束时间 || '').trim(),
                    前置条件: 解析分隔列表(entry.前置条件 || ''),
                    触发条件: 解析分隔列表(entry.触发条件 || ''),
                    阻断条件: 解析分隔列表(entry.阻断条件 || ''),
                    事件结果: 解析分隔列表(entry.事件结果 || ''),
                    对下一组影响: 解析分隔列表(entry.对下一组影响 || ''),
                    信息可见性: 解析信息可见性(entry)
                })).filter((item) => item.事件名 || item.事件说明),
                characterProgressions: 解析条目块(sections.角色推进).map((entry) => ({
                    角色名: (entry.角色名 || '').trim(),
                    本组前状态: 解析分隔列表(entry.本组前状态 || ''),
                    本组变化: 解析分隔列表(entry.本组变化 || ''),
                    本组后状态: 解析分隔列表(entry.本组后状态 || ''),
                    对下一组影响: 解析分隔列表(entry.对下一组影响 || '')
                })).filter((item) => item.角色名)
            }),
            rawText
        };
    }

    return null;
};

const 解析结果 = (rawText: string): NovelDecompositionAnalysisResult => {
    const taggedResult = 解析标签结果(rawText);
    if (taggedResult) return taggedResult;

    const data = 提取结果JSON(rawText);
    return {
        ...规范化结果({
            groupNumber: 解析数字(String(data?.groupNumber ?? data?.组号 ?? ''), 1),
            chapterRange: typeof data?.chapterRange === 'string' ? data.chapterRange.trim() : typeof data?.章节范围 === 'string' ? data.章节范围.trim() : '',
            chapterTitles: Array.isArray(data?.chapterTitles)
                ? data.chapterTitles.map((item: any) => String(item || '').trim()).filter(Boolean)
                : Array.isArray(data?.章节标题) ? data.章节标题.map((item: any) => String(item || '').trim()).filter(Boolean) : [],
            isOpeningGroup: typeof data?.isOpeningGroup === 'boolean' ? data.isOpeningGroup : typeof data?.是否开局组 === 'boolean' ? data.是否开局组 : 解析布尔(String(data?.是否开局组 ?? '')),
            summary: typeof data?.summary === 'string' ? data.summary.trim() : typeof data?.本组概括 === 'string' ? data.本组概括.trim() : '',
            openingFacts: Array.isArray(data?.openingFacts) ? data.openingFacts.map((item: any) => String(item || '').trim()).filter(Boolean) : Array.isArray(data?.开局已成立事实) ? data.开局已成立事实.map((item: any) => String(item || '').trim()).filter(Boolean) : [],
            continuationFacts: Array.isArray(data?.continuationFacts) ? data.continuationFacts.map((item: any) => String(item || '').trim()).filter(Boolean) : Array.isArray(data?.前组延续事实) ? data.前组延续事实.map((item: any) => String(item || '').trim()).filter(Boolean) : [],
            endStates: Array.isArray(data?.endStates) ? data.endStates.map((item: any) => String(item || '').trim()).filter(Boolean) : Array.isArray(data?.本组结束状态) ? data.本组结束状态.map((item: any) => String(item || '').trim()).filter(Boolean) : [],
            nextGroupReferences: Array.isArray(data?.nextGroupReferences) ? data.nextGroupReferences.map((item: any) => String(item || '').trim()).filter(Boolean) : Array.isArray(data?.给下一组参考) ? data.给下一组参考.map((item: any) => String(item || '').trim()).filter(Boolean) : [],
            hardConstraints: Array.isArray(data?.hardConstraints)
                ? data.hardConstraints.map((item: any) => 解析JSON可见信息条目(item)).filter((item: any) => item.内容)
                : Array.isArray(data?.原著硬约束) ? data.原著硬约束.map((item: any) => 解析JSON可见信息条目(item)).filter((item: any) => item.内容) : [],
            foreshadowing: Array.isArray(data?.foreshadowing)
                ? data.foreshadowing.map((item: any) => 解析JSON可见信息条目(item)).filter((item: any) => item.内容)
                : Array.isArray(data?.可提前铺垫) ? data.可提前铺垫.map((item: any) => 解析JSON可见信息条目(item)).filter((item: any) => item.内容) : [],
            appearingCharacters: Array.isArray(data?.appearingCharacters) ? data.appearingCharacters.map((item: any) => String(item || '').trim()).filter(Boolean) : Array.isArray(data?.登场角色) ? data.登场角色.map((item: any) => String(item || '').trim()).filter(Boolean) : [],
            timelineStart: typeof data?.timelineStart === 'string' ? data.timelineStart.trim() : typeof data?.时间线起点 === 'string' ? data.时间线起点.trim() : typeof data?.本组开始时间 === 'string' ? data.本组开始时间.trim() : '',
            timelineEnd: typeof data?.timelineEnd === 'string' ? data.timelineEnd.trim() : typeof data?.时间线终点 === 'string' ? data.时间线终点.trim() : typeof data?.本组结束时间 === 'string' ? data.本组结束时间.trim() : '',
            keyEvents: Array.isArray(data?.keyEvents)
                ? data.keyEvents.map((item: any) => ({
                    事件名: typeof item?.事件名 === 'string' ? item.事件名.trim() : typeof item?.name === 'string' ? item.name.trim() : '',
                    事件说明: typeof item?.事件说明 === 'string' ? item.事件说明.trim() : typeof item?.description === 'string' ? item.description.trim() : '',
                    开始时间: typeof item?.开始时间 === 'string' ? item.开始时间.trim() : typeof item?.startTime === 'string' ? item.startTime.trim() : '',
                    最早开始时间: typeof item?.最早开始时间 === 'string' ? item.最早开始时间.trim() : typeof item?.earliestStartTime === 'string' ? item.earliestStartTime.trim() : '',
                    最迟开始时间: typeof item?.最迟开始时间 === 'string' ? item.最迟开始时间.trim() : typeof item?.latestStartTime === 'string' ? item.latestStartTime.trim() : '',
                    结束时间: typeof item?.结束时间 === 'string' ? item.结束时间.trim() : typeof item?.endTime === 'string' ? item.endTime.trim() : '',
                    前置条件: Array.isArray(item?.前置条件) ? item.前置条件.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    触发条件: Array.isArray(item?.触发条件) ? item.触发条件.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    阻断条件: Array.isArray(item?.阻断条件) ? item.阻断条件.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    事件结果: Array.isArray(item?.事件结果) ? item.事件结果.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    对下一组影响: Array.isArray(item?.对下一组影响) ? item.对下一组影响.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    信息可见性: 解析JSON信息可见性(item)
                })).filter((item: any) => item.事件名 || item.事件说明)
                : [],
            characterProgressions: Array.isArray(data?.characterProgressions)
                ? data.characterProgressions.map((item: any) => ({
                    角色名: typeof item?.角色名 === 'string' ? item.角色名.trim() : typeof item?.name === 'string' ? item.name.trim() : '',
                    本组前状态: Array.isArray(item?.本组前状态) ? item.本组前状态.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    本组变化: Array.isArray(item?.本组变化) ? item.本组变化.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    本组后状态: Array.isArray(item?.本组后状态) ? item.本组后状态.map((v: any) => String(v || '').trim()).filter(Boolean) : [],
                    对下一组影响: Array.isArray(item?.对下一组影响) ? item.对下一组影响.map((v: any) => String(v || '').trim()).filter(Boolean) : []
                })).filter((item: any) => item.角色名)
                : []
        }),
        rawText
    };
};

// ==================== Novel Decomposition API Call ====================

interface WorldStreamOptions {
    stream?: boolean;
    onDelta?: (delta: string, accumulated: string) => void;
}

export const generateNovelDecomposition = async (
    params: {
        text: string;
        groupIndex?: number;
        chapterRange?: string;
        chapterTitles?: string[];
        previousGroupReference?: string;
        previousTimelineEnd?: string;
        nextChapterTitles?: string[];
        leadingSystemPrompt?: string;
        extraPrompt?: string;
        gptMode?: boolean;
    },
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    streamOptions?: WorldStreamOptions
): Promise<NovelDecompositionAnalysisResult> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');

    const taskPrompt = 构建小说拆分当前任务提示词(params);
    const normalizedLeadingSystemPrompt = typeof params.leadingSystemPrompt === 'string' ? params.leadingSystemPrompt.trim() : '';
    const normalizedExtraPrompt = typeof params.extraPrompt === 'string' ? params.extraPrompt.trim() : '';

    const rawText = await 请求模型文本(apiConfig, 规范化文本补全消息链([
        ...(normalizedLeadingSystemPrompt
            ? [{ role: 'system' as const, content: `【AI角色】\n${normalizedLeadingSystemPrompt}` }]
            : []),
        { role: 'system', content: `【AI身份提示词】\n${小说拆分AI身份提示词}` },
        { role: 'system', content: `【其他要求】\n${小说拆分其他要求提示词}` },
        { role: 'system', content: `【结构要求】\n${小说拆分结构要求提示词}` },
        { role: 'system', content: `【COT提示词】\n${小说拆分COT提示词}` },
        ...(normalizedExtraPrompt
            ? [{ role: 'user' as const, content: `【额外要求提示词】\n${normalizedExtraPrompt}` }]
            : []),
        { role: params.gptMode ? 'user' : 'assistant', content: taskPrompt },
        ...(!params.gptMode ? [{ role: 'user' as const, content: '开始任务' }] : []),
        { role: 'assistant', content: 小说拆分COT伪装提示词 }
    ], { 保留System: true, 合并同角色: false }), {
        temperature: 0.3,
        signal,
        errorDetailLimit: Number.POSITIVE_INFINITY,
        streamOptions
    });

    return 解析结果(rawText);
};

// ==================== Planning Analysis ====================

const 解析规划补丁结果 = (
    rawText: string,
    _label: string
): {
    shouldUpdate: boolean;
    reason: string;
    commands: TavernCommand[];
    notes: string[];
} => {
    const source = (rawText || '').trim();
    if (!source) return { shouldUpdate: false, reason: '', commands: [], notes: [] };

    const thinkingSegment = 提取首尾思考区段(source);
    let textWithoutThinking = (thinkingSegment.matched ? thinkingSegment.textWithoutThinking : source).trim();
    if (thinkingSegment.matched && !textWithoutThinking) {
        textWithoutThinking = source
            .replace(/<\s*\/\s*(thinking|think)\s*>/gi, '')
            .replace(/<\s*(thinking|think)\s*>/gi, '')
            .trim();
    }
    const noteBlock = 提取首个标签内容(textWithoutThinking, '说明');
    const commandBlock = 提取首个标签内容(textWithoutThinking, '命令');
    const notes = 解析动态世界块(noteBlock);
    const commands = 解析命令块(commandBlock || textWithoutThinking)
        .map((cmd) => ({
            action: cmd.action === 'add' ? 'set' : cmd.action,
            key: cmd.key,
            value: cmd.value
        }))
        .filter((cmd) => cmd.action === 'set' || cmd.action === 'push' || cmd.action === 'delete') as TavernCommand[];
    const reason = notes[0] || '';
    const noUpdate = notes.some((item) => /无需更新|无需修补|无须更新|无可更新/.test(item));
    return { shouldUpdate: !noUpdate && commands.length > 0, reason, commands, notes };
};

export const generatePlanningAnalysis = async (
    params: {
        playerName: string;
        currentStoryJson: string;
        currentHeroinePlanJson: string;
        worldJson: string;
        socialJson: string;
        envJson: string;
        recentBodiesText: string;
        currentPlanText?: string;
        auditFocusText: string;
        heroineEnabled?: boolean;
        ntlEnabled?: boolean;
        fandomEnabled?: boolean;
        extraPrompt?: string;
        gptMode?: boolean;
    },
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal
): Promise<PlanningAnalysisResult> => {
    if (!apiConfig.apiKey) throw new Error('Missing API Key');

    const aiRolePrompt = 构建AI角色声明提示词(params.playerName);
    const cotPseudoPrompt = 替换COT伪装身份占位(默认COT伪装历史消息提示词.trim(), aiRolePrompt);
    const normalizedExtraPrompt = typeof params.extraPrompt === 'string' ? params.extraPrompt.trim() : '';
    const fandomSystemPrompt = params.fandomEnabled ? 同人规划分析附加系统提示词 : '';
    const fandomCotPrompt = params.fandomEnabled ? 同人规划分析附加COT提示词 : '';

    const rawText = await 请求模型文本(apiConfig, 规范化文本补全消息链([
        { role: 'system', content: `【AI角色】\n${aiRolePrompt}` },
        { role: 'system', content: `【系统提示词】\n${构建统一规划分析系统提示词({
            heroineEnabled: params.heroineEnabled === true,
            ntl: params.ntlEnabled === true,
            fandom: params.fandomEnabled === true
        })}` },
        ...(fandomSystemPrompt ? [{ role: 'system' as const, content: `【同人规划补充】\n${fandomSystemPrompt}` }] : []),
        { role: 'system', content: `【结构参考与更新规则】\n${构建统一规划分析专用上下文()}` },
        ...(normalizedExtraPrompt ? [{ role: 'system' as const, content: `【附加世界书】\n${normalizedExtraPrompt}` }] : []),
        { role: 'system', content: `【统一COT】\n${统一规划分析COT提示词}` },
        ...(fandomCotPrompt ? [{ role: 'system' as const, content: `【同人规划COT】\n${fandomCotPrompt}` }] : []),
        {
            role: params.gptMode ? 'user' as const : 'assistant' as const,
            content: `【本次任务】\n${构建统一规划分析用户提示词({
                currentStoryJson: params.currentStoryJson,
                currentHeroinePlanJson: params.currentHeroinePlanJson,
                worldJson: params.worldJson,
                socialJson: params.socialJson,
                envJson: params.envJson,
                recentBodiesText: params.recentBodiesText,
                currentPlanText: params.currentPlanText,
                auditFocusText: params.auditFocusText,
                heroineEnabled: params.heroineEnabled === true
            })}`
        },
        ...(!params.gptMode ? [{ role: 'user' as const, content: '开始任务' }] : []),
        { role: 'assistant', content: cotPseudoPrompt }
    ], { 保留System: true, 合并同角色: false }), {
        temperature: 0.3,
        signal,
        errorDetailLimit: Number.POSITIVE_INFINITY
    });

    return { ...解析规划补丁结果(rawText, '统一规划分析'), rawText };
};
