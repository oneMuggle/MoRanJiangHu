import {
    单接口配置结构,
    接口供应商类型,
    OpenAI兼容方案类型,
    功能模型占位配置结构,
    请求协议覆盖类型,
    画师串预设结构,
    模型词组转化器预设结构,
    词组转化器提示词预设结构,
    画师串预设适用范围类型,
    词组转化器提示词预设类型,
    PNG画风预设结构,
    角色锚点结构,
    角色锚点特征结构
} from '../models/system';
import { 默认文章优化提示词 } from '../prompts/runtime/defaults';
import { 默认词组转化器提示词预设列表, 默认模型词组转化器预设列表 } from '../data/transformerPresets';
import {
    供应商标签,
    供应商默认值,
    生成配置ID,
    生成预设ID,
    读取字符串,
    读取布尔值,
    读取正整数,
    读取温度值,
    标准化字符串列表,
    推断供应商,
    选取有效预设ID
} from './apiConfigConstants';

// ==================== 类型标准化辅助 ====================

export const 标准化供应商 = (value: unknown, fallback: 接口供应商类型): 接口供应商类型 => {
    if (value === 'gemini' || value === 'claude' || value === 'openai' || value === 'deepseek' || value === 'zhipu' || value === 'openai_compatible' || value === 'grok') {
        return value;
    }
    return fallback;
};

export const 标准化兼容方案 = (value: unknown): OpenAI兼容方案类型 => {
    if (value === 'custom' || value === 'siliconflow' || value === 'together' || value === 'groq') {
        return value;
    }
    return 'custom';
};

export const 标准化协议覆盖 = (value: unknown): 请求协议覆盖类型 => {
    if (value === 'auto' || value === 'openai' || value === 'gemini' || value === 'claude' || value === 'deepseek') {
        return value;
    }
    return 'auto';
};

export const 标准化画师串预设适用范围 = (value: unknown): 画师串预设适用范围类型 => {
    if (value === 'npc' || value === 'scene' || value === 'all') return value;
    return 'all';
};

export const 标准化词组转化器提示词预设类型 = (value: unknown): 词组转化器提示词预设类型 => {
    if (value === 'nai' || value === 'npc' || value === 'scene' || value === 'scene_judge') return value;
    return 'npc';
};

// ==================== 列表标准化 ====================

export const 标准化画师串预设列表 = (raw: unknown): 画师串预设结构[] => {
    const now = Date.now();
    const list = Array.isArray(raw) ? raw : [];
    return list
        .map((item, index) => {
            const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const 画师串 = 读取字符串(source?.画师串 ?? source?.artistPrompt ?? source?.artist).trim();
            const 正面提示词 = 读取字符串(source?.正面提示词 ?? source?.positivePrompt).trim();
            const 负面提示词 = 读取字符串(source?.负面提示词 ?? source?.negativePrompt).trim();
            if (!画师串 && !正面提示词 && !负面提示词) return null;
            const id = 读取字符串(source?.id).trim() || 生成预设ID('artist_preset');
            const 名称 = 读取字符串(source?.名称 ?? source?.name, `画师串预设 ${index + 1}`).trim() || `画师串预设 ${index + 1}`;
            const createdAt = typeof source?.createdAt === 'number' && Number.isFinite(source.createdAt) ? source.createdAt : now;
            const updatedAt = typeof source?.updatedAt === 'number' && Number.isFinite(source.updatedAt) ? source.updatedAt : now;
            return {
                id,
                名称,
                适用范围: 标准化画师串预设适用范围(source?.适用范围 ?? source?.scope),
                画师串,
                正面提示词,
                负面提示词,
                createdAt,
                updatedAt
            } satisfies 画师串预设结构;
        })
        .filter((item): item is 画师串预设结构 => Boolean(item));
};

export const 标准化PNG画风预设列表 = (raw: unknown): PNG画风预设结构[] => {
    const now = Date.now();
    const list = Array.isArray(raw) ? raw : [];
    return list
        .map((item, index) => {
            const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const 原始正面提示词 = 读取字符串(source?.原始正面提示词 ?? source?.rawPositivePrompt).trim();
            const 剥离后正面提示词 = 读取字符串(source?.剥离后正面提示词 ?? source?.strippedPositivePrompt).trim();
            const AI提炼正面提示词 = 读取字符串(source?.AI提炼正面提示词 ?? source?.refinedPositivePrompt).trim();
            const 正面提示词 = 读取字符串(source?.正面提示词 ?? source?.positivePrompt).trim();
            const 负面提示词 = 读取字符串(source?.负面提示词 ?? source?.negativePrompt).trim();
            const 画师串 = 读取字符串(source?.画师串 ?? source?.artistPrompt ?? source?.artist).trim();
            const artistHitsRaw = source?.画师命中项 ?? source?.artistHits;
            const 画师命中项 = Array.isArray(artistHitsRaw)
                ? artistHitsRaw.map((entry) => 读取字符串(entry).trim()).filter(Boolean)
                : [];
            if (!原始正面提示词 && !剥离后正面提示词 && !AI提炼正面提示词 && !正面提示词 && !负面提示词 && !画师串) return null;
            const id = 读取字符串(source?.id).trim() || 生成预设ID('png_preset');
            const 名称 = 读取字符串(source?.名称 ?? source?.name, `PNG预设 ${index + 1}`).trim() || `PNG预设 ${index + 1}`;
            const createdAt = typeof source?.createdAt === 'number' && Number.isFinite(source.createdAt) ? source.createdAt : now;
            const updatedAt = typeof source?.updatedAt === 'number' && Number.isFinite(source.updatedAt) ? source.updatedAt : now;
            const 参数 = typeof source?.参数 === 'object' && source?.参数
                ? { ...(source.参数 as PNG画风预设结构['参数']), 宽度: undefined, 高度: undefined, 随机种子: undefined }
                : undefined;
            return {
                id,
                名称,
                来源: source?.来源 === 'novelai' || source?.来源 === 'sd_webui' ? source.来源 : 'unknown',
                原始正面提示词,
                剥离后正面提示词,
                AI提炼正面提示词,
                正面提示词,
                负面提示词,
                画师串,
                画师命中项,
                优先复刻原参数: source?.优先复刻原参数 === true || source?.preferReusePngParams === true,
                参数,
                封面: 读取字符串(source?.封面 ?? source?.cover ?? source?.coverDataUrl).trim() || undefined,
                原始元数据: 读取字符串(source?.原始元数据 ?? source?.rawMetadata).trim() || undefined,
                元数据标签: typeof source?.元数据标签 === 'object' && source?.元数据标签 ? source.元数据标签 as Record<string, string> : undefined,
                createdAt,
                updatedAt
            } as PNG画风预设结构;
        })
        .filter((item): item is PNG画风预设结构 => Boolean(item));
};

export const 标准化角色锚点特征 = (raw: unknown): 角色锚点特征结构 | undefined => {
    if (!raw || typeof raw !== 'object') return undefined;
    const source = raw as Record<string, unknown>;
    const normalized: 角色锚点特征结构 = {
        外貌标签: 标准化字符串列表(source?.外貌标签 ?? source?.appearanceTags),
        身材标签: 标准化字符串列表(source?.身材标签 ?? source?.bodyTags),
        胸部标签: 标准化字符串列表(source?.胸部标签 ?? source?.bustTags),
        发型标签: 标准化字符串列表(source?.发型标签 ?? source?.hairStyleTags),
        发色标签: 标准化字符串列表(source?.发色标签 ?? source?.hairColorTags),
        眼睛标签: 标准化字符串列表(source?.眼睛标签 ?? source?.eyeTags),
        肤色标签: 标准化字符串列表(source?.肤色标签 ?? source?.skinTags),
        年龄感标签: 标准化字符串列表(source?.年龄感标签 ?? source?.ageTags),
        服装基底标签: 标准化字符串列表(source?.服装基底标签 ?? source?.outfitBaseTags),
        特殊特征标签: 标准化字符串列表(source?.特殊特征标签 ?? source?.specialTags)
    };
    return Object.values(normalized).some((item) => Array.isArray(item) && item.length > 0) ? normalized : undefined;
};

export const 标准化角色锚点列表 = (raw: unknown): 角色锚点结构[] => {
    const now = Date.now();
    const list = Array.isArray(raw) ? raw : [];
    return list
        .map((item, index) => {
            const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const 正面提示词 = 读取字符串(source?.正面提示词 ?? source?.positivePrompt).trim();
            const 负面提示词 = 读取字符串(source?.负面提示词 ?? source?.negativePrompt).trim();
            const npcId = 读取字符串(source?.npcId ?? source?.NPCID).trim();
            if (!npcId || (!正面提示词 && !负面提示词)) return null;
            const id = 读取字符串(source?.id).trim() || 生成预设ID('character_anchor');
            const 名称 = 读取字符串(source?.名称 ?? source?.name, `角色锚点 ${index + 1}`).trim() || `角色锚点 ${index + 1}`;
            const createdAt = typeof source?.createdAt === 'number' && Number.isFinite(source.createdAt) ? source.createdAt : now;
            const updatedAt = typeof source?.updatedAt === 'number' && Number.isFinite(source.updatedAt) ? source.updatedAt : now;
            return {
                id,
                npcId,
                名称,
                是否启用: source?.是否启用 !== false && source?.enabled !== false,
                生成时默认附加: source?.生成时默认附加 === true || source?.defaultApply === true,
                场景生图自动注入: source?.场景生图自动注入 === true || source?.autoInjectForScene === true,
                正面提示词,
                负面提示词,
                结构化特征: 标准化角色锚点特征(source?.结构化特征 ?? source?.features),
                来源: source?.来源 === 'manual' || source?.来源 === 'imported' ? source.来源 : 'ai_extract',
                原始提取文本: 读取字符串(source?.原始提取文本 ?? source?.rawExtractedText).trim() || undefined,
                提取模型信息: 读取字符串(source?.提取模型信息 ?? source?.extractModelInfo).trim() || undefined,
                createdAt,
                updatedAt
            } satisfies 角色锚点结构;
        })
        .filter(Boolean) as 角色锚点结构[];
};

export const 标准化词组转化器提示词预设列表 = (raw: unknown): 词组转化器提示词预设结构[] => {
    const now = Date.now();
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list
        .map((item, index) => {
            const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const 提示词 = 读取字符串(source?.提示词 ?? source?.prompt).trim();
            if (!提示词) return null;
            const id = 读取字符串(source?.id).trim() || 生成预设ID('transformer_preset');
            const 名称 = 读取字符串(source?.名称 ?? source?.name, `词组提示词预设 ${index + 1}`).trim() || `词组提示词预设 ${index + 1}`;
            const createdAt = typeof source?.createdAt === 'number' && Number.isFinite(source.createdAt) ? source.createdAt : now;
            const updatedAt = typeof source?.updatedAt === 'number' && Number.isFinite(source.updatedAt) ? source.updatedAt : now;
            return {
                id,
                名称,
                类型: 标准化词组转化器提示词预设类型(source?.类型 ?? source?.scope),
                提示词,
                角色锚定模式提示词: 读取字符串(source?.角色锚定模式提示词 ?? source?.anchorPrompt).trim() || undefined,
                场景角色锚定模式提示词: 读取字符串(source?.场景角色锚定模式提示词 ?? source?.sceneAnchorPrompt).trim() || undefined,
                无锚点回退提示词: 读取字符串(source?.无锚点回退提示词 ?? source?.fallbackPrompt).trim() || undefined,
                输出格式提示词: 读取字符串(source?.输出格式提示词 ?? source?.outputFormatPrompt).trim() || undefined,
                createdAt,
                updatedAt
            } satisfies 词组转化器提示词预设结构;
        })
        .filter(Boolean) as 词组转化器提示词预设结构[];
    const mergedMap = new Map<string, 词组转化器提示词预设结构>();
    [...默认词组转化器提示词预设列表, ...normalized].forEach((item) => {
        mergedMap.set(item.id, item);
    });
    return Array.from(mergedMap.values());
};

export const 标准化模型词组转化器预设列表 = (
    raw: unknown,
    promptPresets: 词组转化器提示词预设结构[]
): 模型词组转化器预设结构[] => {
    const now = Date.now();
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list
        .map((item, index) => {
            const source = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const id = 读取字符串(source?.id).trim() || 生成预设ID('transformer_model');
            const 名称 = 读取字符串(source?.名称 ?? source?.name, `模型预设 ${index + 1}`).trim() || `模型预设 ${index + 1}`;
            const createdAt = typeof source?.createdAt === 'number' && Number.isFinite(source.createdAt) ? source.createdAt : now;
            const updatedAt = typeof source?.updatedAt === 'number' && Number.isFinite(source.updatedAt) ? source.updatedAt : now;
            const npcPresetId = 选取有效预设ID(
                promptPresets.filter((preset) => preset.类型 === 'npc'),
                source?.NPC词组转化器提示词预设ID ?? source?.npcPresetId,
                (preset) => preset.id === 'transformer_banana_npc'
            );
            const scenePresetId = 选取有效预设ID(
                promptPresets.filter((preset) => preset.类型 === 'scene'),
                source?.场景词组转化器提示词预设ID ?? source?.scenePresetId,
                (preset) => preset.id === 'transformer_banana_scene'
            );
            const sceneJudgePresetId = 选取有效预设ID(
                promptPresets.filter((preset) => preset.类型 === 'scene_judge'),
                source?.场景判定提示词预设ID ?? source?.sceneJudgePresetId,
                (preset) => preset.id === 'transformer_banana_scene_judge'
            );
            return {
                id,
                名称,
                是否启用: typeof source?.是否启用 === 'boolean' ? source.是否启用 : source?.enabled === true,
                模型专属提示词: 读取字符串(source?.模型专属提示词 ?? source?.modelPrompt ?? source?.prompt).trim(),
                锚定模式模型提示词: 读取字符串(source?.锚定模式模型提示词 ?? source?.anchorModelPrompt).trim() || undefined,
                NPC词组转化器提示词预设ID: npcPresetId,
                场景词组转化器提示词预设ID: scenePresetId,
                场景判定提示词预设ID: sceneJudgePresetId,
                createdAt,
                updatedAt
            } satisfies 模型词组转化器预设结构;
        })
        .filter(Boolean) as 模型词组转化器预设结构[];
    const 最后启用的原始预设ID = normalized
        .filter((item) => item.是否启用 === true)
        .slice(-1)[0]?.id || '';
    const mergedMap = new Map<string, 模型词组转化器预设结构>();
    [...默认模型词组转化器预设列表, ...normalized].forEach((item) => {
        mergedMap.set(item.id, item);
    });
    return Array.from(mergedMap.values()).map((item) => ({
        ...item,
        是否启用: 最后启用的原始预设ID
            ? item.id === 最后启用的原始预设ID
            : item.是否启用 === true
    }));
};

// ==================== 单配置标准化 ====================

export const 标准化单配置 = (raw: any, index: number): 单接口配置结构 => {
    const now = Date.now();
    const fallbackSupplier = 推断供应商(raw?.baseUrl);
    const supplier = 标准化供应商(raw?.供应商 ?? raw?.provider, fallbackSupplier);
    const compatiblePreset = 标准化兼容方案(raw?.兼容方案 ?? raw?.compatiblePreset);
    const defaultPreset = 供应商默认值[supplier];

    const id = 读取字符串(raw?.id).trim() || 生成配置ID();
    const nameFallback = `${供应商标签[supplier]} 配置 ${index + 1}`;
    const name = 读取字符串(raw?.名称 ?? raw?.name, nameFallback).trim() || nameFallback;
    const baseUrl = 读取字符串(raw?.baseUrl, defaultPreset.baseUrl).trim();
    const apiKey = 读取字符串(raw?.apiKey).trim();
    const model = 读取字符串(raw?.model, defaultPreset.model).trim() || defaultPreset.model;
    const maxTokens = 读取正整数(raw?.maxTokens ?? raw?.max_tokens);
    const temperature = 读取温度值(raw?.temperature);
    const 协议覆盖 = 标准化协议覆盖(raw?.协议覆盖 ?? raw?.protocolOverride);

    const createdAt = typeof raw?.createdAt === 'number' && Number.isFinite(raw.createdAt) ? raw.createdAt : now;
    const updatedAt = typeof raw?.updatedAt === 'number' && Number.isFinite(raw.updatedAt) ? raw.updatedAt : now;

    return {
        id,
        名称: name,
        供应商: supplier,
        兼容方案: supplier === 'openai_compatible' ? compatiblePreset : undefined,
        协议覆盖,
        baseUrl,
        apiKey,
        model,
        maxTokens,
        temperature,
        createdAt,
        updatedAt
    };
};

// ==================== 功能模型占位标准化 ====================

export const 标准化功能模型占位 = (raw: any): 功能模型占位配置结构 => {
    const polishPromptCandidate = typeof raw?.文章优化提示词 === 'string' ? raw.文章优化提示词 : '';
    const legacyPlanningEnabled = Boolean(raw?.剧情规划独立模型开关) || Boolean(raw?.女主规划独立模型开关);
    const legacyPlanningModel = 读取字符串(raw?.剧情规划使用模型 || raw?.女主规划使用模型);
    const legacyPlanningBaseUrl = 读取字符串(raw?.剧情规划API地址 || raw?.女主规划API地址);
    const legacyPlanningApiKey = 读取字符串(raw?.剧情规划API密钥 || raw?.女主规划API密钥);
    const 画师串预设列表 = 标准化画师串预设列表(raw?.画师串预设列表);
    const 词组转化器提示词预设列表 = 标准化词组转化器提示词预设列表(raw?.词组转化器提示词预设列表);
    const 模型词组转化器预设列表 = 标准化模型词组转化器预设列表(raw?.模型词组转化器预设列表, 词组转化器提示词预设列表);
    const 角色锚点列表 = 标准化角色锚点列表(raw?.角色锚点列表 ?? raw?.characterAnchors);
    const PNG画风预设列表 = 标准化PNG画风预设列表(raw?.PNG画风预设列表 ?? raw?.pngPresets ?? raw?.png_style_presets);
    const 当前NPC画师串预设ID = (() => {
        if (Object.prototype.hasOwnProperty.call(raw || {}, '当前NPC画师串预设ID')) {
            const rawId = 读取字符串(raw?.当前NPC画师串预设ID).trim();
            if (rawId === '') return '';
        }
        return 选取有效预设ID(
            画师串预设列表.filter((item) => item.适用范围 === 'npc' || item.适用范围 === 'all'),
            raw?.当前NPC画师串预设ID
        );
    })();
    const 当前场景画师串预设ID = (() => {
        if (Object.prototype.hasOwnProperty.call(raw || {}, '当前场景画师串预设ID')) {
            const rawId = 读取字符串(raw?.当前场景画师串预设ID).trim();
            if (rawId === '') return '';
        }
        return 选取有效预设ID(
            画师串预设列表.filter((item) => item.适用范围 === 'scene' || item.适用范围 === 'all'),
            raw?.当前场景画师串预设ID
        );
    })();
    const 当前NPCPNG画风预设ID = (() => {
        const rawId = 读取字符串(raw?.当前NPCPNG画风预设ID ?? raw?.currentNpcPngPresetId).trim();
        if (rawId) return rawId;
        return 读取字符串(raw?.当前PNG画风预设ID ?? raw?.currentPngPresetId).trim();
    })();
    const 当前场景PNG画风预设ID = (() => {
        const rawId = 读取字符串(raw?.当前场景PNG画风预设ID ?? raw?.currentScenePngPresetId).trim();
        if (rawId) return rawId;
        return 读取字符串(raw?.当前PNG画风预设ID ?? raw?.currentPngPresetId).trim();
    })();
    const 当前NAI词组转化器提示词预设ID = (() => {
        if (!Object.prototype.hasOwnProperty.call(raw || {}, '当前NAI词组转化器提示词预设ID')) {
            return 'transformer_nai_npc';
        }
        const rawId = 读取字符串(raw?.当前NAI词组转化器提示词预设ID).trim();
        if (rawId === '') return '';
        return 选取有效预设ID(
            词组转化器提示词预设列表.filter((item) => item.类型 === 'nai' || item.类型 === 'npc'),
            rawId
        ) || 'transformer_nai_npc';
    })();
    const 当前NPC词组转化器提示词预设ID = (() => {
        if (!Object.prototype.hasOwnProperty.call(raw || {}, '当前NPC词组转化器提示词预设ID')) {
            return 'transformer_banana_npc';
        }
        const rawId = 读取字符串(raw?.当前NPC词组转化器提示词预设ID).trim();
        if (rawId === '') return '';
        return 选取有效预设ID(
            词组转化器提示词预设列表.filter((item) => item.类型 === 'npc'),
            rawId
        ) || 'transformer_banana_npc';
    })();
    const 当前场景词组转化器提示词预设ID = (() => {
        if (!Object.prototype.hasOwnProperty.call(raw || {}, '当前场景词组转化器提示词预设ID')) {
            return 'transformer_banana_scene';
        }
        const rawId = 读取字符串(raw?.当前场景词组转化器提示词预设ID).trim();
        if (rawId === '') return '';
        return 选取有效预设ID(
            词组转化器提示词预设列表.filter((item) => item.类型 === 'scene'),
            rawId
        ) || 'transformer_banana_scene';
    })();
    const 当前场景判定提示词预设ID = (() => {
        if (!Object.prototype.hasOwnProperty.call(raw || {}, '当前场景判定提示词预设ID')) {
            return 'transformer_banana_scene_judge';
        }
        const rawId = 读取字符串(raw?.当前场景判定提示词预设ID).trim();
        if (rawId === '') return '';
        return 选取有效预设ID(
            词组转化器提示词预设列表.filter((item) => item.类型 === 'scene_judge'),
            rawId
        ) || 'transformer_banana_scene_judge';
    })();
    return {
        主剧情使用模型: 读取字符串(raw?.主剧情使用模型),
        剧情回忆独立模型开关: Boolean(raw?.剧情回忆独立模型开关),
        剧情回忆静默确认: Boolean(raw?.剧情回忆静默确认),
        剧情回忆完整原文条数N: Math.max(1, Number(raw?.剧情回忆完整原文条数N) || 20),
        剧情回忆最早触发回合: Math.max(1, Number(raw?.剧情回忆最早触发回合) || 10),
        记忆总结独立模型开关: Boolean(raw?.记忆总结独立模型开关),
        世界演变独立模型开关: Boolean(raw?.世界演变独立模型开关),
        变量计算独立模型开关: Boolean(raw?.变量计算独立模型开关),
        规划分析独立模型开关: 读取布尔值(raw?.规划分析独立模型开关) ?? legacyPlanningEnabled,
        女主规划独立模型开关: Boolean(raw?.女主规划独立模型开关),
        剧情规划独立模型开关: Boolean(raw?.剧情规划独立模型开关),
        文章优化独立模型开关: Boolean(raw?.文章优化独立模型开关),
        小说拆分功能启用: Boolean(raw?.小说拆分功能启用),
        小说拆分独立模型开关: Boolean(raw?.小说拆分独立模型开关),
        剧情回忆使用模型: 读取字符串(raw?.剧情回忆使用模型),
        剧情回忆使用配置ID: 读取字符串(raw?.剧情回忆使用配置ID),
        剧情回忆API地址: 读取字符串(raw?.剧情回忆API地址),
        剧情回忆API密钥: 读取字符串(raw?.剧情回忆API密钥),
        记忆总结使用模型: 读取字符串(raw?.记忆总结使用模型),
        记忆总结使用配置ID: 读取字符串(raw?.记忆总结使用配置ID),
        记忆总结API地址: 读取字符串(raw?.记忆总结API地址),
        记忆总结API密钥: 读取字符串(raw?.记忆总结API密钥),
        世界演变使用模型: 读取字符串(raw?.世界演变使用模型),
        世界演变使用配置ID: 读取字符串(raw?.世界演变使用配置ID),
        世界演变API地址: 读取字符串(raw?.世界演变API地址),
        世界演变API密钥: 读取字符串(raw?.世界演变API密钥),
        变量计算使用模型: 读取字符串(raw?.变量计算使用模型),
        变量计算使用配置ID: 读取字符串(raw?.变量计算使用配置ID),
        变量计算API地址: 读取字符串(raw?.变量计算API地址),
        变量计算API密钥: 读取字符串(raw?.变量计算API密钥),
        规划分析使用模型: 读取字符串(raw?.规划分析使用模型 || legacyPlanningModel),
        规划分析使用配置ID: 读取字符串(raw?.规划分析使用配置ID),
        规划分析API地址: 读取字符串(raw?.规划分析API地址 || legacyPlanningBaseUrl),
        规划分析API密钥: 读取字符串(raw?.规划分析API密钥 || legacyPlanningApiKey),
        女主规划使用模型: 读取字符串(raw?.女主规划使用模型),
        女主规划使用配置ID: 读取字符串(raw?.女主规划使用配置ID),
        女主规划API地址: 读取字符串(raw?.女主规划API地址),
        女主规划API密钥: 读取字符串(raw?.女主规划API密钥),
        剧情规划使用模型: 读取字符串(raw?.剧情规划使用模型),
        剧情规划使用配置ID: 读取字符串(raw?.剧情规划使用配置ID),
        剧情规划API地址: 读取字符串(raw?.剧情规划API地址),
        剧情规划API密钥: 读取字符串(raw?.剧情规划API密钥),
        文章优化使用模型: 读取字符串(raw?.文章优化使用模型),
        文章优化使用配置ID: 读取字符串(raw?.文章优化使用配置ID),
        文章优化API地址: 读取字符串(raw?.文章优化API地址),
        文章优化API密钥: 读取字符串(raw?.文章优化API密钥),
        文章优化提示词: polishPromptCandidate.trim().length > 0 ? polishPromptCandidate : 默认文章优化提示词,
        小说拆分使用模型: 读取字符串(raw?.小说拆分使用模型),
        小说拆分API地址: 读取字符串(raw?.小说拆分API地址),
        小说拆分API密钥: 读取字符串(raw?.小说拆分API密钥),
        小说拆分RPM限制: Math.max(1, Number(raw?.小说拆分RPM限制) || 10),
        小说拆分按N章分组: Math.max(1, Number(raw?.小说拆分按N章分组) || 5),
        小说拆分单次处理批量: Math.max(1, Number(raw?.小说拆分单次处理批量) || 1),
        小说拆分自动重试次数: Math.max(0, Number(raw?.小说拆分自动重试次数) || 0),
        小说拆分后台运行: 读取布尔值(raw?.小说拆分后台运行) ?? true,
        小说拆分自动续跑: 读取布尔值(raw?.小说拆分自动续跑) ?? true,
        小说拆分主剧情注入: 读取布尔值(raw?.小说拆分主剧情注入) ?? true,
        小说拆分规划分析注入: 读取布尔值(raw?.小说拆分规划分析注入) ?? true,
        小说拆分世界演变注入: 读取布尔值(raw?.小说拆分世界演变注入) ?? true,
        小说拆分主剧情注入上限: Math.max(200, Number(raw?.小说拆分主剧情注入上限) || Number(raw?.小说拆分主剧情滑窗安全上限) || 1200),
        小说拆分详细注入上限: Math.max(500, Number(raw?.小说拆分详细注入上限) || 4000),
        文生图功能启用: Boolean(raw?.文生图功能启用),
        文生图配置列表: Array.isArray(raw?.文生图配置列表) ? raw.文生图配置列表 : [],
        当前文生图配置ID: raw?.当前文生图配置ID || null,
        文生图后端类型: raw?.文生图后端类型 === 'novelai' || raw?.文生图后端类型 === 'sd_webui' || raw?.文生图后端类型 === 'comfyui' || raw?.文生图后端类型 === 'grok'
            ? raw.文生图后端类型 : 'openai',
        文生图模型使用模型: 读取字符串(raw?.文生图模型使用模型),
        文生图模型API地址: 读取字符串(raw?.文生图模型API地址),
        文生图模型API密钥: 读取字符串(raw?.文生图模型API密钥),
        ComfyUI工作流JSON: 读取字符串(raw?.ComfyUI工作流JSON),
        场景生图独立接口启用: Boolean(raw?.场景生图独立接口启用),
        场景生图使用配置ID: raw?.场景生图使用配置ID || null,
        场景生图后端类型: raw?.场景生图后端类型 === 'novelai' || raw?.场景生图后端类型 === 'sd_webui' || raw?.场景生图后端类型 === 'comfyui' || raw?.场景生图后端类型 === 'grok'
            ? raw.场景生图后端类型 : 'openai',
        场景生图模型使用模型: 读取字符串(raw?.场景生图模型使用模型),
        场景生图模型API地址: 读取字符串(raw?.场景生图模型API地址),
        场景生图模型API密钥: 读取字符串(raw?.场景生图模型API密钥),
        场景ComfyUI工作流JSON: 读取字符串(raw?.场景ComfyUI工作流JSON),
        文生图接口路径模式: raw?.文生图接口路径模式 === 'custom' ? 'custom' : 'preset',
        文生图预设接口路径: raw?.文生图预设接口路径 === 'openai_chat' || raw?.文生图预设接口路径 === 'novelai_generate' || raw?.文生图预设接口路径 === 'sd_txt2img' || raw?.文生图预设接口路径 === 'comfyui_prompt'
            ? raw.文生图预设接口路径 : 'openai_images',
        文生图接口路径: 读取字符串(raw?.文生图接口路径),
        文生图响应格式: raw?.文生图响应格式 === 'b64_json' ? 'b64_json' : 'url',
        文生图OpenAI自定义格式: Boolean(raw?.文生图OpenAI自定义格式),
        画师串预设列表,
        当前NPC画师串预设ID,
        当前场景画师串预设ID,
        当前NPCPNG画风预设ID,
        当前场景PNG画风预设ID,
        自动NPC生图画风: raw?.自动NPC生图画风 === '二次元' || raw?.自动NPC生图画风 === '写实' || raw?.自动NPC生图画风 === '国风'
            ? raw.自动NPC生图画风 : '通用',
        自动场景生图画风: raw?.自动场景生图画风 === '二次元' || raw?.自动场景生图画风 === '写实' || raw?.自动场景生图画风 === '国风'
            ? raw.自动场景生图画风 : '通用',
        自动场景生图构图要求: raw?.自动场景生图构图要求 === '故事快照' || raw?.自动场景生图构图要求 === '纯场景'
            ? raw.自动场景生图构图要求 : '纯场景',
        自动场景生图横竖屏: raw?.自动场景生图横竖屏 === '竖屏' || raw?.自动场景生图横竖屏 === '横屏'
            ? raw.自动场景生图横竖屏 : '横屏',
        自动场景生图分辨率: 读取字符串(raw?.自动场景生图分辨率).trim() || '1024x576',
        NovelAI启用自定义参数: Boolean(raw?.NovelAI启用自定义参数),
        NovelAI采样器: raw?.NovelAI采样器 === 'k_euler' || raw?.NovelAI采样器 === 'k_euler_ancestral' || raw?.NovelAI采样器 === 'k_dpmpp_2m' || raw?.NovelAI采样器 === 'k_dpmpp_2s_ancestral' || raw?.NovelAI采样器 === 'k_dpmpp_sde' || raw?.NovelAI采样器 === 'k_dpmpp_2m_sde'
            ? raw.NovelAI采样器 : 'k_euler_ancestral',
        NovelAI噪点表: raw?.NovelAI噪点表 === 'native' || raw?.NovelAI噪点表 === 'karras' || raw?.NovelAI噪点表 === 'exponential' || raw?.NovelAI噪点表 === 'polyexponential'
            ? raw.NovelAI噪点表 : 'karras',
        NovelAI步数: Math.max(1, Math.min(50, Number(raw?.NovelAI步数) || 28)),
        NovelAI负面提示词: 读取字符串(raw?.NovelAI负面提示词),
        NPC生图使用词组转化器: raw?.文生图后端类型 === 'novelai' ? true : raw?.NPC生图使用词组转化器 !== false,
        词组转化兼容模式: raw?.词组转化兼容模式 === true,
        香闺秘档特写强制裸体语义: raw?.香闺秘档特写强制裸体语义 === true,
        词组转化器启用独立模型: Boolean(raw?.词组转化器启用独立模型),
        词组转化器使用模型: 读取字符串(raw?.词组转化器使用模型),
        词组转化器API地址: 读取字符串(raw?.词组转化器API地址),
        词组转化器API密钥: 读取字符串(raw?.词组转化器API密钥),
        词组转化器提示词: '',
        模型词组转化器预设列表,
        词组转化器提示词预设列表,
        当前NAI词组转化器提示词预设ID,
        当前NPC词组转化器提示词预设ID,
        当前场景词组转化器提示词预设ID,
        当前场景判定提示词预设ID,
        角色锚点列表,
        当前角色锚点ID: 读取字符串(raw?.当前角色锚点ID ?? raw?.currentCharacterAnchorId).trim(),
        PNG画风预设列表,
        当前PNG画风预设ID: 读取字符串(raw?.当前PNG画风预设ID ?? raw?.currentPngPresetId).trim(),
        PNG提炼启用独立模型: Boolean(raw?.PNG提炼启用独立模型 ?? raw?.pngRefineIndependent),
        PNG提炼使用模型: 读取字符串(raw?.PNG提炼使用模型 ?? raw?.pngRefineModel),
        PNG提炼API地址: 读取字符串(raw?.PNG提炼API地址 ?? raw?.pngRefineApiBaseUrl),
        PNG提炼API密钥: 读取字符串(raw?.PNG提炼API密钥 ?? raw?.pngRefineApiKey),
        场景生图启用: Boolean(raw?.场景生图启用),
        主角生图启用: Boolean(raw?.主角生图启用),
        NPC生图启用: Boolean(raw?.NPC生图启用),
        主角生图独立接口启用: Boolean(raw?.主角生图独立接口启用),
        主角生图后端类型: raw?.主角生图后端类型 === 'novelai' || raw?.主角生图后端类型 === 'sd_webui' || raw?.主角生图后端类型 === 'comfyui' || raw?.主角生图后端类型 === 'grok'
            ? raw.主角生图后端类型 : 'openai',
        主角生图模型使用模型: 读取字符串(raw?.主角生图模型使用模型),
        主角生图模型API地址: 读取字符串(raw?.主角生图模型API地址),
        主角生图模型API密钥: 读取字符串(raw?.主角生图模型API密钥),
        主角画师串预设ID: 读取字符串(raw?.主角画师串预设ID),
        主角PNG画风预设ID: 读取字符串(raw?.主角PNG画风预设ID),
        主角词组转化器预设ID: 读取字符串(raw?.主角词组转化器预设ID),
        NPC生图性别筛选: raw?.NPC生图性别筛选 === '男' || raw?.NPC生图性别筛选 === '女' || raw?.NPC生图性别筛选 === '全部'
            ? raw.NPC生图性别筛选 : '全部',
        NPC生图重要性筛选: raw?.NPC生图重要性筛选 === '仅重要' || raw?.NPC生图重要性筛选 === '全部'
            ? raw.NPC生图重要性筛选 : '全部',
        提示词生成重试次数: Math.max(0, Math.min(5, Number(raw?.提示词生成重试次数) || 1)),
        图片生成重试次数: Math.max(0, Math.min(5, Number(raw?.图片生成重试次数) || 1)),
        cnbComfyui地址: 读取字符串(raw?.cnbComfyui地址).trim(),
        cnbComfyui场景地址: 读取字符串(raw?.cnbComfyui场景地址).trim(),
        comfyui地址模式: (raw?.comfyui地址模式 === 'cnb' || raw?.comfyui地址模式 === 'api') ? raw.comfyui地址模式 : 'api',
        场景comfyui地址模式: (raw?.场景comfy地址模式 === 'cnb' || raw?.场景comfyui地址模式 === 'api') ? raw.场景comfyui地址模式 : 'api'
    };
};

export const 默认功能模型占位: 功能模型占位配置结构 = 标准化功能模型占位({});

export const 规范化接口设置 = (raw: unknown): import('../models/system').接口设置结构 => {
    if (!raw || typeof raw !== 'object') {
        return 创建空接口设置();
    }
    const source = raw as any;
    const configs: import('../models/system').单接口配置结构[] = Array.isArray(source.configs)
        ? source.configs.map((item: any, index: number) => 标准化单配置(item, index))
        : [];
    const activeConfigId = (() => {
        const candidate = 读取字符串(source.activeConfigId).trim();
        if (!candidate) return configs[0]?.id || null;
        return configs.some((cfg) => cfg.id === candidate) ? candidate : (configs[0]?.id || null);
    })();
    return {
        activeConfigId,
        configs,
        功能模型占位: 标准化功能模型占位(source.功能模型占位)
    };
};

const 创建空接口设置 = (): import('../models/system').接口设置结构 => ({
    activeConfigId: null,
    configs: [],
    功能模型占位: { ...默认功能模型占位 }
});
