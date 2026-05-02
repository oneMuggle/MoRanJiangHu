import {
    接口设置结构,
    单接口配置结构,
    功能模型占位配置结构,
    接口供应商类型,
    图片词组序列化策略类型,
    画师串预设结构,
    模型词组转化器预设结构,
    词组转化器提示词预设结构,
    词组转化器提示词预设类型
} from '../models/system';
import {
    供应商标签,
    推断供应商,
    读取字符串,
    解析CnbComfyui地址,
    生成配置ID
} from './apiConfigConstants';

export { 供应商标签, 推断供应商, OpenAI兼容方案预设 } from './apiConfigConstants';
export { 默认功能模型占位, 规范化接口设置 } from './apiConfigNormalization';

// ==================== 公共类型 ====================

export type 当前可用接口结构 = Pick<单接口配置结构, 'id' | '名称' | '供应商' | '协议覆盖' | 'baseUrl' | 'apiKey' | 'model' | 'maxTokens' | 'temperature'> & {
    图片后端类型?: 功能模型占位配置结构['文生图后端类型'];
    图片接口路径?: string;
    图片接口路径模式?: 功能模型占位配置结构['文生图接口路径模式'];
    图片预设接口路径?: 功能模型占位配置结构['文生图预设接口路径'];
    图片响应格式?: 'url' | 'b64_json';
    图片走OpenAI自定义格式?: boolean;
    画师串预设列表?: 画师串预设结构[];
    当前NPC画师串预设ID?: string;
    当前场景画师串预设ID?: string;
    NovelAI启用自定义参数?: boolean;
    NovelAI采样器?: 功能模型占位配置结构['NovelAI采样器'];
    NovelAI噪点表?: 功能模型占位配置结构['NovelAI噪点表'];
    NovelAI步数?: number;
    NovelAI负面提示词?: string;
    NPC生图使用词组转化器?: boolean;
    词组转化兼容模式?: boolean;
    词组转化器AI角色提示词?: string;
    词组转化器提示词?: string;
    场景判定提示词?: string;
    词组转化输出策略?: 图片词组序列化策略类型;
    模型词组转化器预设列表?: 模型词组转化器预设结构[];
    词组转化器提示词预设列表?: 词组转化器提示词预设结构[];
    当前NAI词组转化器提示词预设ID?: string;
    当前NPC词组转化器提示词预设ID?: string;
    当前场景词组转化器提示词预设ID?: string;
    当前场景判定提示词预设ID?: string;
    ComfyUI工作流JSON?: string;
    画风?: '通用' | '二次元' | '写实' | '国风';
    香闺秘档特写强制裸体语义?: boolean;
};

export type 词组转化器预设上下文结构 = {
    AI角色定制提示词: string;
    相关提示词: string;
    词组序列化策略: 图片词组序列化策略类型;
};

// ==================== 模板 & 空配置 ====================

export const 创建空接口设置 = (): 接口设置结构 => ({
    activeConfigId: null,
    configs: [],
    功能模型占位: require('./apiConfigNormalization').默认功能模型占位
});

export const 创建接口配置模板 = (
    supplier: 接口供应商类型,
    _options?: { compatiblePreset?: 接口供应商类型 }
): 单接口配置结构 => {
    const now = Date.now();
    const preset = {
        gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.0-flash' },
        claude: { baseUrl: '', model: 'claude-3-5-sonnet-latest' },
        openai: { baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
        deepseek: { baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
        zhipu: { baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash' },
        openai_compatible: { baseUrl: '', model: 'gpt-4o-mini' },
        grok: { baseUrl: 'https://api.x.ai/v1', model: 'grok-2-image' }
    }[supplier];
    return {
        id: 生成配置ID(),
        名称: `${供应商标签[supplier]} 配置`,
        供应商: supplier,
        兼容方案: undefined,
        协议覆盖: 'auto',
        baseUrl: preset.baseUrl,
        apiKey: '',
        model: preset.model,
        maxTokens: undefined,
        temperature: undefined,
        createdAt: now,
        updatedAt: now
    };
};

// ==================== 预设获取 ====================

export const 获取生图画师串预设 = (
    settings: 接口设置结构,
    scope: 'npc' | 'scene',
    preferredId?: string
): 画师串预设结构 | null => {
    const feature = settings?.功能模型占位;
    const list = (Array.isArray(feature?.画师串预设列表) ? feature.画师串预设列表 : [])
        .filter((item) => item && typeof item.id === 'string' && !item.id.startsWith('png_artist_'));
    if (list.length <= 0) return null;
    const targetId = 读取字符串(preferredId).trim()
        || (scope === 'scene' ? 读取字符串(feature?.当前场景画师串预设ID).trim() : 读取字符串(feature?.当前NPC画师串预设ID).trim());
    const scopedList = list.filter((item) => item?.适用范围 === scope || item?.适用范围 === 'all');
    if (targetId) {
        const matched = scopedList.find((item) => item.id === targetId) || list.find((item) => item.id === targetId);
        if (matched) return matched;
    }
    return scopedList[0] || null;
};

export const 获取命中模型词组转化器预设 = (settings: 接口设置结构): 模型词组转化器预设结构 | null => {
    const feature = settings?.功能模型占位;
    const list = Array.isArray(feature?.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : [];
    return list.find((item) => item?.是否启用 === true) || null;
};

export const 获取词组转化器预设上下文 = (
    settings: 接口设置结构,
    scope: 词组转化器提示词预设类型,
    mode?: 'default' | 'anchor',
    options?: { 包含输出格式提示词?: boolean }
): 词组转化器预设上下文结构 => {
    const feature = settings?.功能模型占位;
    const list = Array.isArray(feature?.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : [];
    const matchedModelPreset = 获取命中模型词组转化器预设(settings);
    const targetId = scope === 'scene'
        ? (读取字符串(matchedModelPreset?.场景词组转化器提示词预设ID).trim() || 读取字符串(feature?.当前场景词组转化器提示词预设ID).trim())
        : scope === 'scene_judge'
            ? (读取字符串(matchedModelPreset?.场景判定提示词预设ID).trim() || 读取字符串(feature?.当前场景判定提示词预设ID).trim())
            : scope === 'nai'
                ? 读取字符串(feature?.当前NAI词组转化器提示词预设ID).trim()
                : (读取字符串(matchedModelPreset?.NPC词组转化器提示词预设ID).trim() || 读取字符串(feature?.当前NPC词组转化器提示词预设ID).trim());
    const matched = list.find((item) => item.id === targetId && (item?.类型 === scope || (scope === 'nai' && item?.类型 === 'npc')));
    const AI角色定制提示词 = [mode === 'anchor'
        ? 读取字符串(matchedModelPreset?.锚定模式模型提示词 ?? matchedModelPreset?.模型专属提示词).trim()
        : 读取字符串(matchedModelPreset?.模型专属提示词).trim(),
    ].filter(Boolean).join('\n\n');
    const 相关提示词 = [
        mode === 'anchor' ? (读取字符串(scope === 'scene' ? (matched?.场景角色锚定模式提示词 ?? matched?.角色锚定模式提示词 ?? matched?.提示词) : (matched?.角色锚定模式提示词 ?? matched?.提示词)).trim()) : (matched?.提示词?.trim() || ''),
        mode === 'default' ? 读取字符串(matched?.无锚点回退提示词).trim() : '',
        options?.包含输出格式提示词 === false ? '' : 读取字符串(matched?.输出格式提示词).trim()
    ].filter(Boolean).join('\n\n');
    const 词组序列化策略 = matchedModelPreset?.词组序列化策略 || (scope === 'nai' ? 'nai_character_segments' : 'flat');
    return { AI角色定制提示词, 相关提示词, 词组序列化策略 };
};

export const 获取词组转化器预设提示词 = (
    settings: 接口设置结构,
    scope: 词组转化器提示词预设类型,
    mode?: 'default' | 'anchor',
    options?: { 包含输出格式提示词?: boolean }
): string => {
    const context = 获取词组转化器预设上下文(settings, scope, mode, options);
    return [context.AI角色定制提示词, context.相关提示词].filter(Boolean).join('\n\n');
};

// ==================== 接口配置获取 ====================

export const 获取当前接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    if (!settings || !Array.isArray(settings.configs) || settings.configs.length === 0) return null;
    const active = settings.configs.find(cfg => cfg.id === settings.activeConfigId) || settings.configs[0];
    if (!active) return null;
    return { id: active.id, 名称: active.名称, 供应商: active.供应商, 协议覆盖: active.协议覆盖 || 'auto', baseUrl: active.baseUrl, apiKey: active.apiKey, model: active.model, maxTokens: active.maxTokens, temperature: active.temperature };
};

export const 获取主剧情接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const mainModel = 读取字符串(current.model).trim() || 读取字符串((settings as any)?.功能模型占位?.主剧情使用模型).trim();
    if (!mainModel) return null;
    return { ...current, model: mainModel };
};

export const 获取剧情回忆接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const enabled = Boolean(feature?.剧情回忆独立模型开关);
    if (!enabled) return null;
    const recallModel = 读取字符串(feature?.剧情回忆使用模型).trim();
    if (!recallModel) return null;
    const recallBaseUrl = 读取字符串(feature?.剧情回忆API地址).trim();
    const recallApiKey = 读取字符串(feature?.剧情回忆API密钥).trim();
    const supplier = recallBaseUrl ? 推断供应商(recallBaseUrl) : current.供应商;
    return { ...current, 供应商: supplier, 协议覆盖: recallBaseUrl ? 'auto' : current.协议覆盖, baseUrl: recallBaseUrl || current.baseUrl, apiKey: recallApiKey || current.apiKey, model: recallModel };
};

export const 获取记忆总结接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const independent = Boolean(feature?.记忆总结独立模型开关);
    if (!independent) { const recallConfig = 获取剧情回忆接口配置(settings); if (接口配置是否可用(recallConfig)) return recallConfig; return current; }
    const summaryModel = 读取字符串(feature?.记忆总结使用模型).trim();
    if (!summaryModel) return null;
    const summaryBaseUrl = 读取字符串(feature?.记忆总结API地址).trim();
    const summaryApiKey = 读取字符串(feature?.记忆总结API密钥).trim();
    const supplier = summaryBaseUrl ? 推断供应商(summaryBaseUrl) : current.供应商;
    return { ...current, 供应商: supplier, 协议覆盖: summaryBaseUrl ? 'auto' : current.协议覆盖, baseUrl: summaryBaseUrl || current.baseUrl, apiKey: summaryApiKey || current.apiKey, model: summaryModel };
};

export const 获取文章优化接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const independent = Boolean(feature?.文章优化独立模型开关);
    if (!independent) return null;
    const polishModel = 读取字符串(feature?.文章优化使用模型).trim();
    if (!polishModel) return null;
    const polishBaseUrl = 读取字符串(feature?.文章优化API地址).trim();
    const polishApiKey = 读取字符串(feature?.文章优化API密钥).trim();
    const supplier = polishBaseUrl ? 推断供应商(polishBaseUrl) : current.供应商;
    return { ...current, 供应商: supplier, 协议覆盖: polishBaseUrl ? 'auto' : current.协议覆盖, baseUrl: polishBaseUrl || current.baseUrl, apiKey: polishApiKey || current.apiKey, model: polishModel };
};

export const 获取变量计算接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const enabled = Boolean(feature?.变量计算独立模型开关);
    const variableModel = 读取字符串(feature?.变量计算使用模型).trim();
    if (!enabled || !variableModel) return null;
    const variableBaseUrl = 读取字符串(feature?.变量计算API地址).trim();
    const variableApiKey = 读取字符串(feature?.变量计算API密钥).trim();
    const supplier = variableBaseUrl ? 推断供应商(variableBaseUrl) : current.供应商;
    return { ...current, 供应商: supplier, 协议覆盖: variableBaseUrl ? 'auto' : current.协议覆盖, baseUrl: variableBaseUrl || current.baseUrl, apiKey: variableApiKey || current.apiKey, model: variableModel };
};

export const 变量校准功能已启用 = (settings: 接口设置结构 | null | undefined): boolean => {
    const feature = (settings as any)?.功能模型占位;
    return Boolean(feature?.变量计算独立模型开关);
};

export const 获取世界演变接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const enabled = Boolean(feature?.世界演变独立模型开关);
    const worldModel = 读取字符串(feature?.世界演变使用模型).trim();
    if (!enabled || !worldModel) return null;
    const worldBaseUrl = 读取字符串(feature?.世界演变API地址).trim();
    const worldApiKey = 读取字符串(feature?.世界演变API密钥).trim();
    const supplier = worldBaseUrl ? 推断供应商(worldBaseUrl) : current.供应商;
    return { ...current, 供应商: supplier, 协议覆盖: worldBaseUrl ? 'auto' : current.协议覆盖, baseUrl: worldBaseUrl || current.baseUrl, apiKey: worldApiKey || current.apiKey, model: worldModel };
};

export const 获取小说拆分接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    const feature = (settings as any)?.功能模型占位;
    const baseUrl = 读取字符串(feature?.小说拆分API地址).trim();
    const apiKey = 读取字符串(feature?.小说拆分API密钥).trim();
    const dedicatedModel = 读取字符串(feature?.小说拆分使用模型).trim();
    const 小说拆分最大输出Token = 32_768;
    if (baseUrl && apiKey && dedicatedModel) {
        return { id: current?.id || 'novel_decomposition_dedicated', 名称: current?.名称 || '小说拆分独立接口', 供应商: 推断供应商(baseUrl), 协议覆盖: 'auto', baseUrl, apiKey, model: dedicatedModel, maxTokens: 小说拆分最大输出Token, temperature: current?.temperature };
    }
    if (!current) return null;
    const enabled = Boolean(feature?.小说拆分独立模型开关);
    const model = enabled ? dedicatedModel : 读取字符串(current.model || feature?.主剧情使用模型).trim();
    if (!model) return null;
    const supplier = baseUrl ? 推断供应商(baseUrl) : current.供应商;
    return { ...current, 供应商: supplier, 协议覆盖: baseUrl ? 'auto' : current.协议覆盖, baseUrl: baseUrl || current.baseUrl, apiKey: apiKey || current.apiKey, model, maxTokens: 小说拆分最大输出Token };
};

export const 获取规划分析接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const enabled = Boolean(feature?.规划分析独立模型开关) || Boolean(feature?.剧情规划独立模型开关) || Boolean(feature?.女主规划独立模型开关);
    const model = 读取字符串(feature?.规划分析使用模型 || feature?.剧情规划使用模型 || feature?.女主规划使用模型).trim();
    if (!enabled || !model) return null;
    const baseUrl = 读取字符串(feature?.规划分析API地址 || feature?.剧情规划API地址 || feature?.女主规划API地址).trim();
    const apiKey = 读取字符串(feature?.规划分析API密钥 || feature?.剧情规划API密钥 || feature?.女主规划API密钥).trim();
    const supplier = baseUrl ? 推断供应商(baseUrl) : current.供应商;
    return { ...current, 供应商: supplier, 协议覆盖: baseUrl ? 'auto' : current.协议覆盖, baseUrl: baseUrl || current.baseUrl, apiKey: apiKey || current.apiKey, model };
};

export const 获取女主规划接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => 获取规划分析接口配置(settings);
export const 获取剧情规划接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => 获取规划分析接口配置(settings);

export const 获取文生图接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const imgConfigs = feature?.文生图配置列表;
    const currentImgConfigId = feature?.当前文生图配置ID;
    if (Array.isArray(imgConfigs) && imgConfigs.length > 0) {
        const activeImgConfig = imgConfigs.find((c: any) => c.id === currentImgConfigId) || imgConfigs[0];
        if (!activeImgConfig) return null;
        const enabled = activeImgConfig.功能启用 ?? true;
        if (!enabled) return null;
        const backend = activeImgConfig.后端类型 || 'openai';
        const model = 读取字符串(activeImgConfig.模型).trim();
        const baseUrl = 读取字符串(activeImgConfig.API地址).trim();
        const apiKey = 读取字符串(activeImgConfig.API密钥).trim();
        const cnbUrl = 读取字符串(feature?.cnbComfyui地址).trim();
        const cnbBaseUrl = 解析CnbComfyui地址(cnbUrl);
        const isCnbComfyui = backend === 'comfyui' && cnbBaseUrl;
        const resolvedBaseUrl = isCnbComfyui ? (cnbBaseUrl || baseUrl) : (baseUrl || (backend === 'openai' || backend === 'novelai' || backend === 'grok' ? current.baseUrl : ''));
        const 需要鉴权 = backend === 'openai' || backend === 'novelai' || backend === 'grok';
        return {
            ...current, 供应商: resolvedBaseUrl ? 推断供应商(resolvedBaseUrl) : current.供应商, 协议覆盖: baseUrl ? 'auto' : current.协议覆盖,
            baseUrl: resolvedBaseUrl, apiKey: 需要鉴权 ? (apiKey || current.apiKey) : apiKey, model,
            图片后端类型: backend, 图片接口路径模式: activeImgConfig.接口路径模式 === 'custom' ? 'custom' : 'preset',
            图片预设接口路径: activeImgConfig.预设接口路径 || 'openai_images',
            图片接口路径: (() => { const m: Record<string, string> = { openai_images: '/v1/images/generations', openai_chat: '/v1/chat/completions', novelai_generate: '/ai/generate-image', sd_txt2img: '/sdapi/v1/txt2img', comfyui_prompt: '/prompt' }; if (activeImgConfig.接口路径模式 === 'custom') return activeImgConfig.自定义接口路径 || ''; return m[activeImgConfig.预设接口路径 || 'openai_images'] || ''; })(),
            图片响应格式: activeImgConfig.响应格式 === 'b64_json' ? 'b64_json' : 'url',
            图片走OpenAI自定义格式: Boolean(activeImgConfig.OpenAI自定义格式),
            NovelAI启用自定义参数: Boolean(activeImgConfig.NovelAI启用自定义参数),
            NovelAI采样器: activeImgConfig.NovelAI采样器 || 'k_euler_ancestral',
            NovelAI噪点表: activeImgConfig.NovelAI噪点表 || 'karras',
            NovelAI步数: Math.max(1, Math.min(50, Number(activeImgConfig.NovelAI步数) || 28)),
            NovelAI负面提示词: 读取字符串(activeImgConfig.NovelAI负面提示词).trim(),
            NPC生图使用词组转化器: backend === 'novelai' ? true : true,
            香闺秘档特写强制裸体语义: false,
            ComfyUI工作流JSON: 读取字符串(activeImgConfig.ComfyUI工作流JSON)
        };
    }
    const 图片后端类型 = feature?.文生图后端类型 === 'novelai' || feature?.文生图后端类型 === 'sd_webui' || feature?.文生图后端类型 === 'comfyui' || feature?.文生图后端类型 === 'grok' ? feature.文生图后端类型 : 'openai';
    const enabled = Boolean(feature?.文生图功能启用);
    if (!enabled) return null;
    const imageModel = 读取字符串(feature?.文生图模型使用模型).trim();
    if ((图片后端类型 === 'openai' || 图片后端类型 === 'novelai' || 图片后端类型 === 'grok') && !imageModel) return null;
    const imageBaseUrl = 读取字符串(feature?.文生图模型API地址).trim();
    const imageApiKey = 读取字符串(feature?.文生图模型API密钥).trim();
    const cnbUrl = 读取字符串(feature?.cnbComfyui地址).trim();
    const cnbBaseUrl = 解析CnbComfyui地址(cnbUrl);
    const resolvedImageBaseUrl = (图片后端类型 === 'comfyui' && cnbBaseUrl) ? (cnbBaseUrl || imageBaseUrl || ((图片后端类型 === 'openai' || 图片后端类型 === 'novelai' || 图片后端类型 === 'grok') ? current.baseUrl : '')) : (imageBaseUrl || ((图片后端类型 === 'openai' || 图片后端类型 === 'novelai' || 图片后端类型 === 'grok') ? current.baseUrl : ''));
    const supplier = resolvedImageBaseUrl ? 推断供应商(resolvedImageBaseUrl) : current.供应商;
    const 图片接口路径模式 = feature?.文生图接口路径模式 === 'custom' ? 'custom' : 'preset';
    const 图片预设接口路径: NonNullable<当前可用接口结构['图片预设接口路径']> = feature?.文生图预设接口路径 === 'openai_chat' || feature?.文生图预设接口路径 === 'novelai_generate' || feature?.文生图预设接口路径 === 'sd_txt2img' || feature?.文生图预设接口路径 === 'comfyui_prompt' ? feature.文生图预设接口路径 : 'openai_images';
    const m: Record<NonNullable<当前可用接口结构['图片预设接口路径']>, string> = { openai_images: '/v1/images/generations', openai_chat: '/v1/chat/completions', novelai_generate: '/ai/generate-image', sd_txt2img: '/sdapi/v1/txt2img', comfyui_prompt: '/prompt' };
    return {
        ...current, 供应商: supplier, 协议覆盖: imageBaseUrl ? 'auto' : current.协议覆盖,
        baseUrl: resolvedImageBaseUrl, apiKey: (图片后端类型 === 'openai' || 图片后端类型 === 'novelai' || 图片后端类型 === 'grok') ? (imageApiKey || current.apiKey) : imageApiKey,
        model: imageModel, 图片后端类型, 图片接口路径模式, 图片预设接口路径, 图片接口路径: 图片接口路径模式 === 'custom' ? 读取字符串(feature?.文生图接口路径).trim() : m[图片预设接口路径],
        图片响应格式: feature?.文生图响应格式 === 'b64_json' ? 'b64_json' : 'url',
        图片走OpenAI自定义格式: Boolean(feature?.文生图OpenAI自定义格式),
        画师串预设列表: Array.isArray(feature?.画师串预设列表) ? feature.画师串预设列表 : [],
        当前NPC画师串预设ID: 读取字符串(feature?.当前NPC画师串预设ID).trim(),
        当前场景画师串预设ID: 读取字符串(feature?.当前场景画师串预设ID).trim(),
        NovelAI启用自定义参数: Boolean(feature?.NovelAI启用自定义参数),
        NovelAI采样器: feature?.NovelAI采样器 === 'k_euler' || feature?.NovelAI采样器 === 'k_euler_ancestral' || feature?.NovelAI采样器 === 'k_dpmpp_2m' || feature?.NovelAI采样器 === 'k_dpmpp_2s_ancestral' || feature?.NovelAI采样器 === 'k_dpmpp_sde' || feature?.NovelAI采样器 === 'k_dpmpp_2m_sde' ? feature.NovelAI采样器 : 'k_euler_ancestral',
        NovelAI噪点表: feature?.NovelAI噪点表 === 'native' || feature?.NovelAI噪点表 === 'karras' || feature?.NovelAI噪点表 === 'exponential' || feature?.NovelAI噪点表 === 'polyexponential' ? feature.NovelAI噪点表 : 'karras',
        NovelAI步数: Math.max(1, Math.min(50, Number(feature?.NovelAI步数) || 28)),
        NovelAI负面提示词: 读取字符串(feature?.NovelAI负面提示词).trim(),
        NPC生图使用词组转化器: 图片后端类型 === 'novelai' ? true : feature?.NPC生图使用词组转化器 !== false,
        香闺秘档特写强制裸体语义: feature?.香闺秘档特写强制裸体语义 === true,
        模型词组转化器预设列表: Array.isArray(feature?.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : [],
        词组转化器提示词预设列表: Array.isArray(feature?.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : [],
        当前NAI词组转化器提示词预设ID: 读取字符串(feature?.当前NAI词组转化器提示词预设ID).trim(),
        当前NPC词组转化器提示词预设ID: 读取字符串(feature?.当前NPC词组转化器提示词预设ID).trim(),
        当前场景词组转化器提示词预设ID: 读取字符串(feature?.当前场景词组转化器提示词预设ID).trim(),
        当前场景判定提示词预设ID: 读取字符串(feature?.当前场景判定提示词预设ID).trim(),
        ComfyUI工作流JSON: 读取字符串(feature?.ComfyUI工作流JSON)
    };
};

export const 获取场景文生图接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const feature = (settings as any)?.功能模型占位;
    const independent = Boolean(feature?.场景生图独立接口启用);
    if (!independent) return 获取文生图接口配置(settings);
    const configId = feature?.场景生图使用配置ID;
    const configList = feature?.文生图配置列表 || [];
    const selectedConfig = configId ? configList.find((c: any) => c.id === configId) : null;
    if (selectedConfig) {
        const backend = selectedConfig.后端类型 || 'openai';
        const needsModel = backend === 'openai' || backend === 'novelai' || backend === 'grok';
        const needsAuth = backend === 'openai' || backend === 'novelai' || backend === 'grok';
        if (needsModel && !selectedConfig.模型?.trim()) return null;
        if (needsAuth && !selectedConfig.API密钥?.trim()) return null;
        const presetPathMap: Record<string, string> = { openai_images: '/v1/images/generations', openai_chat: '/v1/chat/completions', novelai_generate: '/ai/generate-image', sd_txt2img: '/sdapi/v1/txt2img', comfyui_prompt: '/prompt' };
        const 预设路径值 = selectedConfig.接口路径模式 === 'preset' ? (selectedConfig.预设接口路径 || 'openai_images') : 'openai_images';
        return {
            id: selectedConfig.id || '', 名称: selectedConfig.名称 || '', 供应商: 推断供应商(selectedConfig.API地址), 协议覆盖: 'auto' as const,
            baseUrl: selectedConfig.API地址?.trim() || '', apiKey: selectedConfig.API密钥?.trim() || '', model: selectedConfig.模型?.trim() || '',
            maxTokens: undefined, temperature: undefined, 图片后端类型: backend,
            图片接口路径模式: selectedConfig.接口路径模式 as 'preset' | 'custom', 图片预设接口路径: 预设路径值,
            图片接口路径: selectedConfig.接口路径模式 === 'custom' ? (selectedConfig.自定义接口路径 || presetPathMap[预设路径值] || '/v1/images/generations') : (presetPathMap[预设路径值] || '/v1/images/generations'),
            图片响应格式: (selectedConfig.响应格式 || 'url') as 'url' | 'b64_json', 图片走OpenAI自定义格式: Boolean(selectedConfig.OpenAI自定义格式),
            NPC生图使用词组转化器: backend === 'novelai' ? true : true, ComfyUI工作流JSON: selectedConfig.ComfyUI工作流JSON || '',
            词组转化器提示词: '', 模型词组转化器预设列表: [], 词组转化器提示词预设列表: [],
            当前NAI词组转化器提示词预设ID: '', 当前NPC词组转化器提示词预设ID: '', 当前场景词组转化器提示词预设ID: '', 当前场景判定提示词预设ID: '', 词组转化兼容模式: false
        };
    }
    const sharedConfig = 获取文生图接口配置(settings);
    if (!sharedConfig) return null;
    const sceneBackend: NonNullable<当前可用接口结构['图片后端类型']> = feature?.场景生图后端类型 === 'novelai' || feature?.场景生图后端类型 === 'sd_webui' || feature?.场景生图后端类型 === 'comfyui' || feature?.场景生图后端类型 === 'grok' ? feature.场景生图后端类型 : 'openai';
    const sharedBackend: NonNullable<当前可用接口结构['图片后端类型']> = sharedConfig.图片后端类型 === 'novelai' || sharedConfig.图片后端类型 === 'sd_webui' || sharedConfig.图片后端类型 === 'comfyui' || sharedConfig.图片后端类型 === 'grok' ? sharedConfig.图片后端类型 : 'openai';
    const sceneModel = 读取字符串(feature?.场景生图模型使用模型).trim();
    if ((sceneBackend === 'openai' || sceneBackend === 'novelai' || sceneBackend === 'grok') && !sceneModel) return null;
    const sceneBaseUrl = 读取字符串(feature?.场景生图模型API地址).trim();
    const sceneApiKey = 读取字符串(feature?.场景生图模型API密钥).trim();
    const sceneWorkflow = 读取字符串(feature?.场景ComfyUI工作流JSON);
    const sceneCnbUrl = 读取字符串(feature?.cnbComfyui场景地址).trim();
    const globalCnbUrl = 读取字符串(feature?.cnbComfyui地址).trim();
    const sceneCnbBaseUrl = 解析CnbComfyui地址(sceneCnbUrl || globalCnbUrl);
    const canReuseSharedConnection = sceneBackend === sharedBackend;
    const resolvedBaseUrl = (sceneBackend === 'comfyui' && sceneCnbBaseUrl) ? (sceneCnbBaseUrl || sceneBaseUrl || (canReuseSharedConnection ? sharedConfig.baseUrl : '')) : (sceneBaseUrl || (canReuseSharedConnection ? sharedConfig.baseUrl : ''));
    const resolvedApiKey = (sceneBackend === 'openai' || sceneBackend === 'novelai' || sceneBackend === 'grok') ? (sceneApiKey || (canReuseSharedConnection ? sharedConfig.apiKey : '')) : sceneApiKey;
    const resolvedWorkflow = sceneBackend === 'comfyui' ? (sceneWorkflow || (canReuseSharedConnection ? sharedConfig.ComfyUI工作流JSON || '' : '')) : '';
    const supplier = resolvedBaseUrl ? 推断供应商(resolvedBaseUrl) : sharedConfig.供应商;
    const scenePresetPathMap: Record<'openai' | 'novelai' | 'sd_webui' | 'comfyui' | 'grok', NonNullable<当前可用接口结构['图片预设接口路径']>> = { openai: 'openai_images', novelai: 'novelai_generate', sd_webui: 'sd_txt2img', comfyui: 'comfyui_prompt', grok: 'openai_chat' };
    const presetPathValue = scenePresetPathMap[sceneBackend];
    const presetPathMap: Record<NonNullable<当前可用接口结构['图片预设接口路径']>, string> = { openai_images: '/v1/images/generations', openai_chat: '/v1/chat/completions', novelai_generate: '/ai/generate-image', sd_txt2img: '/sdapi/v1/txt2img', comfyui_prompt: '/prompt' };
    const 图片接口路径模式 = canReuseSharedConnection ? sharedConfig.图片接口路径模式 : 'preset';
    const 图片预设接口路径: NonNullable<当前可用接口结构['图片预设接口路径']> = canReuseSharedConnection ? (sharedConfig.图片接口路径模式 === 'preset' ? (sharedConfig.图片预设接口路径 || presetPathValue) : presetPathValue) : presetPathValue;
    const 图片接口路径 = 图片接口路径模式 === 'custom' ? (sharedConfig.图片接口路径 || presetPathMap[图片预设接口路径]) : presetPathMap[图片预设接口路径];
    return {
        ...sharedConfig, 供应商: supplier, 协议覆盖: sceneBaseUrl ? 'auto' : (canReuseSharedConnection ? sharedConfig.协议覆盖 : 'auto'),
        baseUrl: resolvedBaseUrl, apiKey: resolvedApiKey, model: sceneModel, 图片后端类型: sceneBackend,
        图片接口路径模式, 图片预设接口路径, 图片接口路径,
        图片响应格式: sceneBackend === 'openai' ? sharedConfig.图片响应格式 : 'url',
        图片走OpenAI自定义格式: sceneBackend === 'openai' ? Boolean(sharedConfig.图片走OpenAI自定义格式) : false,
        NPC生图使用词组转化器: sceneBackend === 'novelai' ? true : sharedConfig.NPC生图使用词组转化器,
        ComfyUI工作流JSON: resolvedWorkflow
    };
};

export const 获取生图词组转化器接口配置 = (settings: 接口设置结构): 当前可用接口结构 | null => {
    const current = 获取当前接口配置(settings);
    if (!current) return null;
    const feature = (settings as any)?.功能模型占位;
    const independent = Boolean(feature?.词组转化器启用独立模型);
    if (!independent) return {
        ...current, model: 读取字符串(current.model).trim() || 读取字符串(feature?.主剧情使用模型).trim(),
        词组转化器提示词: 读取字符串(feature?.词组转化器提示词).trim(),
        模型词组转化器预设列表: Array.isArray(feature?.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : [],
        词组转化器提示词预设列表: Array.isArray(feature?.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : [],
        当前NAI词组转化器提示词预设ID: 读取字符串(feature?.当前NAI词组转化器提示词预设ID).trim(),
        当前NPC词组转化器提示词预设ID: 读取字符串(feature?.当前NPC词组转化器提示词预设ID).trim(),
        当前场景词组转化器提示词预设ID: 读取字符串(feature?.当前场景词组转化器提示词预设ID).trim(),
        当前场景判定提示词预设ID: 读取字符串(feature?.当前场景判定提示词预设ID).trim(),
        词组转化兼容模式: feature?.词组转化兼容模式 === true
    };
    const transformerModel = 读取字符串(feature?.词组转化器使用模型).trim();
    if (!transformerModel) return null;
    const transformerBaseUrl = 读取字符串(feature?.词组转化器API地址).trim();
    const transformerApiKey = 读取字符串(feature?.词组转化器API密钥).trim();
    const supplier = transformerBaseUrl ? 推断供应商(transformerBaseUrl) : current.供应商;
    return {
        ...current, 供应商: supplier, 协议覆盖: transformerBaseUrl ? 'auto' : current.协议覆盖,
        baseUrl: transformerBaseUrl || current.baseUrl, apiKey: transformerApiKey || current.apiKey, model: transformerModel,
        词组转化器提示词: 读取字符串(feature?.词组转化器提示词).trim(),
        模型词组转化器预设列表: Array.isArray(feature?.模型词组转化器预设列表) ? feature.模型词组转化器预设列表 : [],
        词组转化器提示词预设列表: Array.isArray(feature?.词组转化器提示词预设列表) ? feature.词组转化器提示词预设列表 : [],
        当前NAI词组转化器提示词预设ID: 读取字符串(feature?.当前NAI词组转化器提示词预设ID).trim(),
        当前NPC词组转化器提示词预设ID: 读取字符串(feature?.当前NPC词组转化器提示词预设ID).trim(),
        当前场景词组转化器提示词预设ID: 读取字符串(feature?.当前场景词组转化器提示词预设ID).trim(),
        当前场景判定提示词预设ID: 读取字符串(feature?.当前场景判定提示词预设ID).trim(),
        词组转化兼容模式: feature?.词组转化兼容模式 === true
    };
};

export const 接口配置是否可用 = (config: 当前可用接口结构 | null): config is 当前可用接口结构 => {
    if (!config) return false;
    if (config.图片后端类型) {
        const backend = config.图片后端类型;
        const hasBaseUrl = Boolean(config.baseUrl?.trim());
        const needsApiKey = backend === 'openai' || backend === 'novelai' || backend === 'grok';
        const needsModel = backend === 'openai' || backend === 'novelai' || backend === 'grok';
        const needsWorkflow = backend === 'comfyui';
        return hasBaseUrl && (!needsApiKey || Boolean(config.apiKey?.trim())) && (!needsModel || Boolean(config.model?.trim())) && (!needsWorkflow || Boolean(config.ComfyUI工作流JSON?.trim()));
    }
    return Boolean(config.baseUrl?.trim() && config.apiKey?.trim() && config.model?.trim());
};
