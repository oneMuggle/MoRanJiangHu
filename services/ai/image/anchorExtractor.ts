import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { PNG解析参数结构, 角色锚点结构 } from '../../../models/system';
import { PNG解析COT伪装历史消息提示词 } from '../../../prompts/runtime/pngParseCot';
import { 角色锚点提取COT伪装历史消息提示词 } from '../../../prompts/runtime/imageAnchorExtractionCot';
import { 本地拆分画师标签 } from '../artistTagExtractor';
import {
    规范化文本补全消息链,
    替换COT伪装身份占位,
    请求模型文本
} from '../chatCompletionClient';
import { parseJsonWithRepair } from '../../../utils/jsonRepair';
import type { PNG元数据解析结果, PNG画风提炼结果, 角色锚点提取结果 } from './imageTasksTypes';

const 角色锚点提示词含有效片段 = (text: string): boolean => (
    (text || '')
        .split(',')
        .map((item) => item.trim())
        .some((item) => item.length > 0 && /[\p{L}\p{N}]/u.test(item))
);

const 角色锚点结构化特征含有效内容 = (features?: 角色锚点结构['结构化特征']): boolean => {
    if (!features || typeof features !== 'object') return false;
    return Object.values(features).some((value) => (
        Array.isArray(value)
        && value.some((item) => typeof item === 'string' && item.trim().length > 0)
    ));
};

const 角色锚点提取结果含有效内容 = (result?: 角色锚点提取结果 | null): boolean => (
    Boolean(result) && (
        角色锚点提示词含有效片段(result?.正面提示词 || '')
        || 角色锚点结构化特征含有效内容(result?.结构化特征)
    )
);

const 按逗号拆分提示词 = (text: string): string[] => (
    (text || '')
        .replace(/\r?\n+/g, ', ')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
);

const 从提示词中移除角色名称片段 = (text: string, displayName?: string): string => {
    const source = (text || '').trim();
    const normalizedDisplayName = (displayName || '').trim();
    if (!source || !normalizedDisplayName) return source;
    const escaped = normalizedDisplayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tokens = 按逗号拆分提示词(source);
    if (tokens.length <= 0) return source;
    const filtered = tokens.filter((token) => {
        const trimmed = token.trim();
        if (!trimmed) return false;
        return !new RegExp(escaped, 'iu').test(trimmed);
    });
    return filtered.join(', ');
};

const 从结构化特征中移除角色名称片段 = (
    features: 角色锚点结构['结构化特征'] | undefined,
    displayName?: string
): 角色锚点结构['结构化特征'] | undefined => {
    if (!features || typeof features !== 'object') return undefined;
    const normalizedDisplayName = (displayName || '').trim();
    const entries = Object.entries(features).map(([key, value]) => {
        if (!Array.isArray(value)) return [key, value] as const;
        if (!normalizedDisplayName) return [key, value] as const;
        const next = value
            .map((item) => String(item || '').trim())
            .filter((item) => item && !new RegExp(normalizedDisplayName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'iu').test(item));
        return [key, next] as const;
    });
    const normalized = Object.fromEntries(entries) as 角色锚点结构['结构化特征'];
    return 角色锚点结构化特征含有效内容(normalized) ? normalized : undefined;
};

export const 净化PNG复刻参数 = (params?: PNG解析参数结构): PNG解析参数结构 | undefined => {
    if (!params) return undefined;
    const sanitized: PNG解析参数结构 = {
        ...params,
        宽度: undefined,
        高度: undefined,
        随机种子: undefined
    };
    return Object.values(sanitized).some((value) => value !== undefined) ? sanitized : undefined;
};

const 规范化模糊匹配文本 = (text: string): string => (
    (text || '')
        .trim()
        .toLowerCase()
        .replace(/^\d+(?:\.\d+)?::/g, '')
        .replace(/::$/g, '')
        .replace(/^[:\s]+|[:\s]+$/g, '')
        .replace(/^[([{<]+|[)\]}>]+$/g, '')
        .replace(/[()[\]{}<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
);

const 用原始提示词模糊补全 = (candidatePrompt: string, sourcePrompt: string): string => {
    const candidateTokens = 本地拆分画师标签(candidatePrompt).剩余Tokens;
    const sourceTokens = 本地拆分画师标签(sourcePrompt).剩余Tokens;
    if (candidateTokens.length === 0 || sourceTokens.length === 0) {
        return (candidatePrompt || '').trim();
    }

    const sourceIndex = sourceTokens.map((token) => ({
        raw: token,
        normalized: 规范化模糊匹配文本(token)
    })).filter((item) => item.normalized);

    const mapped = candidateTokens.map((token) => {
        const normalized = 规范化模糊匹配文本(token);
        if (!normalized) return token.trim();

        const exact = sourceIndex.find((item) => item.normalized === normalized);
        if (exact) return exact.raw.trim();

        const fuzzy = sourceIndex.find((item) => (
            item.normalized.includes(normalized)
            || normalized.includes(item.normalized)
        ));
        if (fuzzy) return fuzzy.raw.trim();

        return token.trim();
    }).filter(Boolean);

    const deduped: string[] = [];
    mapped.forEach((item) => {
        if (!deduped.includes(item)) deduped.push(item);
    });
    return deduped.join(', ');
};

const 提取最后一个标签文本 = (rawText: string, tagName: string): string => {
    const source = (rawText || '').trim();
    if (!source) return '';
    const regex = new RegExp(`<\\s*${tagName}\\b[^>]*>([\\s\\S]*?)<\\s*\\/\\s*${tagName}\\s*>`, 'gi');
    const match = regex.exec(source);
    if (!match) return '';
    return match[1].trim();
};

export const 提炼PNG画风标签 = async (
    payload: PNG元数据解析结果,
    apiConfig: 当前可用接口结构,
    options?: { signal?: AbortSignal; 额外要求?: string }
): Promise<PNG画风提炼结果> => {
    const artistSplit = 本地拆分画师标签(payload.正面提示词 || '');
    const 原始正面提示词 = (payload.正面提示词 || '').trim();
    const 剥离后正面提示词 = (artistSplit.剩余正面提示词 || '').trim();
    const 画师串 = (artistSplit.画师串 || '').trim();
    const 画师命中项 = artistSplit.画师命中项.slice();
    const systemPrompt = [
        '你是 PNG 风格正面提示词清洗器。',
        '你收到的输入已经去掉画师标签。你的任务是从剩余正面提示词中保守剔除主体污染，只保留可长期复用的风格信息。',
        '目标不是重写提示词，而是从现有提示词中筛出"跨角色、跨场景仍然成立"的风格层内容。',
        '你的工作本质上是保守删除，不是自由改写。默认保留；只有在明确属于主体、构图、场景、剧情或单次镜头内容时才允许删除。',
        '请保留这几类信息：质量串、画风介质、渲染流派、笔触或材质、色彩倾向、光照风格、年代感、审美标签、官方图/插画标签、摄影或镜头质感标签、整体氛围标签、风格 LoRA/embedding。',
        '请优先保留示例：masterpiece, best quality, official art, anime style, realistic skin texture, oil painting, watercolor, ink wash, cinematic lighting, photorealistic, volumetric lighting, film look, painterly, cel shading, analog film grain, <lora:...>。',
        '请删除这几类信息：固定 IP 名、角色名、人物身份与性别、人物数量、外貌、年龄、表情、视线、姿势、发型、发色、瞳色、服装主体、地点、建筑或道具主体、具体动作、剧情状态、镜头景别、构图描述、身体部位描写。',
        '请特别删除"只对当前主体成立"的信息，例如：1girl, solo, upper body, looking at viewer, sword in hand, red dress, temple courtyard, night rain, close-up, fighting stance。',
        '如果一个提示词同时包含风格与主体信息，除非主体信息占主导且无法拆分，否则优先保留整项，避免误删风格信息。',
        '例如：official art, cinematic lighting, watercolor texture, painterly shading, dramatic contrast, volumetric lighting 这类风格项应优先保留。',
        '例如：young woman, black hair, amber eyes, hanfu, in a bamboo forest, low angle, close-up, holding sword 这类主体或镜头项应删除。',
        'positivePrompt 必须直接由输入正面提示词删除若干项后得到，保持原始结构和原始表达，不要重写成另一套新提示词。',
        'positivePrompt 中的每一项都必须直接拷贝自输入正面提示词，按逗号分隔项完整保留。',
        '任何形如"1.2::token::""0.8::tag::""1.63::photo(medium)::"的强度提示词，都按完整单元原样保留。',
        '任何形如"(tag:1.3)""((tag))""[tag]""{tag}""{{tag}}""<lora:name:0.6>"的语法结构，都必须把整项当作一个完整提示词处理；若保留就整项原样保留，若删除也必须整项删除。',
        '保持原始顺序。对部分模型与前置质量串来说，顺序本身有意义。',
        '保持转义字符与字面量写法，例如"\\,"、"\\("、"\\["、"\\\\"都按原样保留。',
        '每个逗号分隔项都视为一个完整提示词单元，按完整单元处理。',
        '对于重复但具有权重意义的质量串或风格串，按原样保留，不要擅自去重到改变风格重心。',
        '若无法确定一个词是否属于主体污染，默认保留，保证清洗过程克制、稳定、可追溯。',
        '必须输出 JSON，字段：positivePrompt, notes。',
        'positivePrompt：删减后的完整正面提示词；notes：简短说明删除了哪些主体污染类别。',
        '若输入正面提示词不足，保持字段为空字符串。'
    ].join('\n');

    const normalizedExtraRequirement = (options?.额外要求 || '').trim();
    const taskPayload = {
        正面提示词: 剥离后正面提示词,
        ...(normalizedExtraRequirement ? { 额外要求: normalizedExtraRequirement } : {})
    };

    if (!剥离后正面提示词) {
        return {
            画师串,
            原始正面提示词,
            剥离后正面提示词: '',
            AI提炼正面提示词: '',
            正面提示词: '',
            负面提示词: payload.负面提示词 || '',
            画师命中项
        };
    }

    const cotPseudoPrompt = 替换COT伪装身份占位(
        PNG解析COT伪装历史消息提示词.trim(),
        systemPrompt
    ).trim();
    const messages = 规范化文本补全消息链([
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: `【本次任务】\n请只根据以下 PNG 非 artist 正面提示词清洗可复用风格词：\n\n${JSON.stringify(taskPayload, null, 2)}` },
        { role: 'user', content: '开始任务' },
        ...(cotPseudoPrompt ? [{ role: 'assistant' as const, content: cotPseudoPrompt }] : [])
    ], { 保留System: true, 合并同角色: false });

    const raw = await 请求模型文本(apiConfig, messages, {
        temperature: 0.5,
        signal: options?.signal
    });

    try {
        const resultPayload = 提取最后一个标签文本(raw, '结果') || raw;
        const repaired = parseJsonWithRepair<any>(resultPayload);
        const parsed = repaired.value;
        if (!parsed || typeof parsed !== 'object') {
            throw new Error(repaired.error || 'PNG 画风提炼结果不是有效 JSON 对象');
        }
        const AI原始正面提示词 = typeof parsed.positivePrompt === 'string' ? parsed.positivePrompt.trim() : '';
        const AI提炼正面提示词 = 用原始提示词模糊补全(AI原始正面提示词, 剥离后正面提示词);
        const 说明 = typeof parsed.notes === 'string' ? parsed.notes.trim() : '';
        const 正面提示词 = AI提炼正面提示词 || 剥离后正面提示词;
        return {
            画师串,
            原始正面提示词,
            剥离后正面提示词,
            AI提炼正面提示词,
            正面提示词,
            负面提示词: payload.负面提示词 || '',
            画师命中项,
            说明
        };
    } catch {
        return {
            画师串,
            原始正面提示词,
            剥离后正面提示词,
            AI提炼正面提示词: '',
            正面提示词: 剥离后正面提示词,
            负面提示词: payload.负面提示词 || '',
            画师命中项,
            说明: raw.slice(0, 400)
        };
    }
};

export const 提取角色锚点提示词 = async (
    npcData: unknown,
    apiConfig: 当前可用接口结构,
    options?: { signal?: AbortSignal; 名称?: string; 额外要求?: string }
): Promise<角色锚点提取结果> => {
    const 原始资料 = JSON.stringify(npcData ?? {}, null, 2);
    const 显示名称 = (options?.名称 || '').trim() || '角色锚点';
    const systemPrompt = [
        '你是角色视觉锚点提取器。',
        '你的任务是从角色资料中提取可长期复用的稳定外观锚点，用于后续保持角色一致性。',
        '提取重点放在外貌、脸型、五官、发型、发色、瞳色、肤色、身材、胸部/罩杯、年龄感、常驻服装基底和长期可见特征。',
        '当资料缺少关键稳定外观时，可以依据身份、时代、气质和已有外貌描述做保守补全，优先选择常见、低冲突、容易长期保持一致的视觉表达。',
        '正面提示词要尽量完整，适合直接作为稳定角色锚点追加到图像模型。',
        '正面提示词只保留长期可见、长期稳定的视觉信息，让每个词都服务于持续复用。',
        '如果角色具有门派、职业、种族、血统、异色瞳、伤痕、纹身、泪痣、兽耳、角等长期可见特征，请结构化保留。',
        '如果角色资料包含多套装束，请选择最常驻、最核心、最能长期识别角色的那一套服装基底。',
        '提示词使用英文 tag 风格，按逗号分隔。',
        '提示词中直接写可见外观和可见身份道具，不写人名、称呼、IP 名称或剧情标签。',
        '负面提示词在资料明确给出长期需要规避的视觉特征时填写，否则保持空字符串。',
        '输出必须是 JSON，字段：positivePrompt, negativePrompt, features, notes。',
        'notes 用简短文字说明哪些内容来自保守补全。',
        'features 内字段固定为：外貌标签, 身材标签, 胸部标签, 发型标签, 发色标签, 眼睛标签, 肤色标签, 年龄感标签, 服装基底标签, 特殊特征标签。',
        '每个 features 字段都必须是字符串数组或空数组。',
        'positivePrompt 直接输出可用于生图的英文提示词。'
    ].join('\n');

    const taskPrompt = [
        '请根据以下角色资料提取角色视觉锚点。',
        options?.额外要求 ? `额外要求：${options.额外要求}` : '',
        '',
        原始资料
    ].filter(Boolean).join('\n');
    const cotPseudoPrompt = 替换COT伪装身份占位(
        角色锚点提取COT伪装历史消息提示词.trim(),
        systemPrompt
    ).trim();
    const messages = 规范化文本补全消息链([
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: `【本次任务】\n${taskPrompt}` },
        { role: 'user', content: '开始任务' },
        ...(cotPseudoPrompt ? [{ role: 'assistant' as const, content: cotPseudoPrompt }] : [])
    ], { 保留System: true, 合并同角色: false });

    const raw = await 请求模型文本(apiConfig, messages, {
        temperature: 0.5,
        responseFormat: 'json_object',
        signal: options?.signal
    });

    try {
        const repaired = parseJsonWithRepair<any>(raw);
        const parsed = repaired.value;
        if (!parsed || typeof parsed !== 'object') {
            throw new Error(repaired.error || '角色锚点提取结果不是有效 JSON 对象');
        }
        const 结构化特征 = {
            外貌标签: Array.isArray(parsed?.features?.外貌标签) ? parsed.features.外貌标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            身材标签: Array.isArray(parsed?.features?.身材标签) ? parsed.features.身材标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            胸部标签: Array.isArray(parsed?.features?.胸部标签) ? parsed.features.胸部标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            发型标签: Array.isArray(parsed?.features?.发型标签) ? parsed.features.发型标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            发色标签: Array.isArray(parsed?.features?.发色标签) ? parsed.features.发色标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            眼睛标签: Array.isArray(parsed?.features?.眼睛标签) ? parsed.features.眼睛标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            肤色标签: Array.isArray(parsed?.features?.肤色标签) ? parsed.features.肤色标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            年龄感标签: Array.isArray(parsed?.features?.年龄感标签) ? parsed.features.年龄感标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            服装基底标签: Array.isArray(parsed?.features?.服装基底标签) ? parsed.features.服装基底标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined,
            特殊特征标签: Array.isArray(parsed?.features?.特殊特征标签) ? parsed.features.特殊特征标签.map((item: unknown) => String(item).trim()).filter(Boolean) : undefined
        };
        const hasFeatures = Object.values(结构化特征).some((item) => Array.isArray(item) && item.length > 0);
        const result: 角色锚点提取结果 = {
            名称: 显示名称,
            正面提示词: 从提示词中移除角色名称片段(typeof parsed?.positivePrompt === 'string' ? parsed.positivePrompt.trim() : '', 显示名称),
            负面提示词: 从提示词中移除角色名称片段(typeof parsed?.negativePrompt === 'string' ? parsed.negativePrompt.trim() : '', 显示名称),
            结构化特征: 从结构化特征中移除角色名称片段(hasFeatures ? 结构化特征 : undefined, 显示名称),
            说明: typeof parsed?.notes === 'string' ? parsed.notes.trim() : ''
        };
        if (!角色锚点提取结果含有效内容(result)) {
            throw new Error(result.说明 || '角色锚点提取结果为空，模型未返回可用的稳定外观内容。');
        }
        return result;
    } catch (error: any) {
        if (error instanceof Error && typeof error.message === 'string' && error.message.trim()) {
            throw error;
        }
        const detail = raw.replace(/\s+/g, ' ').trim().slice(0, 240);
        throw new Error(detail ? `角色锚点提取失败：模型返回内容不可用。${detail}` : '角色锚点提取失败：模型未返回可用内容。');
    }
};
