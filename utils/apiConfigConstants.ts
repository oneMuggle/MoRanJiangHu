import {
    接口供应商类型,
    OpenAI兼容方案类型,
    请求协议覆盖类型,
    图片词组序列化策略类型
} from '../models/system';

// ==================== 标签映射 ====================

export const 供应商标签: Record<接口供应商类型, string> = {
    gemini: 'Gemini',
    claude: 'Claude',
    openai: 'OpenAI',
    deepseek: 'DeepSeek',
    zhipu: '智谱',
    openai_compatible: 'OpenAI自定义',
    grok: 'Grok'
};

export const OpenAI兼容方案预设: Record<OpenAI兼容方案类型, { label: string; baseUrl: string }> = {
    custom: { label: '自定义', baseUrl: '' },
    siliconflow: { label: 'SiliconFlow', baseUrl: 'https://api.siliconflow.cn/v1' },
    together: { label: 'Together', baseUrl: 'https://api.together.xyz/v1' },
    groq: { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' }
};

export const 请求协议覆盖标签: Record<请求协议覆盖类型, string> = {
    auto: '自动识别',
    openai: 'OpenAI 协议',
    gemini: 'Gemini 协议',
    claude: 'Claude 协议',
    deepseek: 'DeepSeek 协议'
};

// ==================== 供应商默认值 ====================

export const 供应商默认值: Record<接口供应商类型, { baseUrl: string; model: string }> = {
    gemini: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: 'gemini-2.0-flash'
    },
    claude: {
        baseUrl: '',
        model: 'claude-3-5-sonnet-latest'
    },
    openai: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini'
    },
    deepseek: {
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat'
    },
    zhipu: {
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4-flash'
    },
    openai_compatible: {
        baseUrl: '',
        model: 'gpt-4o-mini'
    },
    grok: {
        baseUrl: 'https://api.x.ai/v1',
        model: 'grok-2-image'
    }
};

// ==================== ID 生成 ====================

export const 生成配置ID = (): string => `api_cfg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
export const 生成预设ID = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ==================== 基础读取辅助 ====================

export const 读取字符串 = (value: unknown, fallback = ''): string => {
    return typeof value === 'string' ? value : fallback;
};

export const 读取布尔值 = (value: unknown): boolean | undefined => {
    if (typeof value === 'boolean') return value;
    return undefined;
};

export const 读取正整数 = (value: unknown): number | undefined => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        return Math.floor(value);
    }
    if (typeof value === 'string') {
        const cleaned = value.trim();
        if (!cleaned) return undefined;
        const parsed = Number(cleaned);
        if (Number.isFinite(parsed) && parsed > 0) {
            return Math.floor(parsed);
        }
    }
    return undefined;
};

export const 读取温度值 = (value: unknown): number | undefined => {
    const 归一化 = (raw: number): number | undefined => {
        if (!Number.isFinite(raw)) return undefined;
        if (raw < 0 || raw > 2) return undefined;
        return Math.round(raw * 100) / 100;
    };
    if (typeof value === 'number') return 归一化(value);
    if (typeof value === 'string') {
        const cleaned = value.trim();
        if (!cleaned) return undefined;
        const parsed = Number(cleaned);
        return 归一化(parsed);
    }
    return undefined;
};

export const 标准化字符串列表 = (value: unknown): string[] | undefined => {
    const list = Array.isArray(value) ? value : [];
    const normalized = list
        .map((item) => 读取字符串(item).trim())
        .filter(Boolean);
    return normalized.length > 0 ? normalized : undefined;
};

// ==================== 类型标准化 ====================

export const 推断供应商 = (baseUrlRaw: unknown): 接口供应商类型 => {
    const baseUrl = 读取字符串(baseUrlRaw).toLowerCase();
    if (!baseUrl) return 'openai';
    if (baseUrl.includes('generativelanguage.googleapis.com') || baseUrl.includes('googleapis.com')) return 'gemini';
    if (baseUrl.includes('deepseek')) return 'deepseek';
    if (baseUrl.includes('bigmodel.cn') || baseUrl.includes('open.bigmodel.cn')) return 'zhipu';
    if (baseUrl.includes('anthropic') || baseUrl.includes('claude')) return 'claude';
    if (baseUrl.includes('siliconflow') || baseUrl.includes('together') || baseUrl.includes('groq')) {
        return 'openai_compatible';
    }
    if (baseUrl.includes('x.ai') || baseUrl.includes('grok')) return 'grok';
    if (baseUrl.includes('openai')) return 'openai';
    return 'openai_compatible';
};

export const 选取有效预设ID = <T extends { id: string }>(list: T[], candidate: unknown, fallback?: (item: T) => boolean): string => {
    const id = 读取字符串(candidate).trim();
    if (id && list.some((item) => item.id === id)) return id;
    if (fallback) return list.find(fallback)?.id || '';
    return list[0]?.id || '';
};

// ==================== CNB ComfyUI 地址解析 ====================

export const 解析CnbComfyui地址 = (url: string): string => {
    if (!url?.trim()) return '';
    return url.trim().replace(/\/+$/, '');
};

// ==================== 结构化词组输出格式提示词 ====================

export const 构建结构化词组输出格式提示词 = (
    strategy: 图片词组序列化策略类型,
    scope: 'npc' | 'scene'
): string => {
    if (scope === 'npc') {
        const serializerHint = strategy === 'nai_character_segments'
            ? 'NovelAI 最终会直接使用这一条单角色 tags；如需要人数标签或权重分组，可直接写在同一个 <提示词> 中。'
            : strategy === 'grok_structured'
                ? 'Grok 最终会把这条单角色 tags 转成更电影化的描述式提示词。'
                : strategy === 'gemini_structured'
                    ? 'Gemini 最终会把这条单角色 tags 转成清晰、可执行的英文短语。'
                    : '输出必须可被后续解析成单角色提示词。';
        return [
            '请使用以下结构输出：',
            '<提示词>...</提示词>',
            '只输出当前单个角色最终用于生图的 tags。',
            serializerHint,
            '输出内容只保留这个结构本身。'
        ].join('\n');
    }
    const serializerHint = strategy === 'nai_character_segments'
        ? 'NovelAI 多角色会按基础段 + 角色段序列化，并使用 | 连接。<基础> 负责全局环境、镜头、天气、布局和光影；<角色> 内每条 [序号] 内容负责该角色当前镜头需要的最小必要 tags。'
        : strategy === 'grok_structured'
            ? 'Grok 最终会把这些段落转成更电影化的描述式提示词；<角色> 内每条 [序号] 仍只写对应角色的动作、姿态、视线和镜头关系。'
            : strategy === 'gemini_structured'
                ? 'Gemini 最终会把这些段落转成清晰的描述式提示词；<角色> 内每条 [序号] 写成完整、可执行的英文短语。'
                : '输出必须可被后续解析成基础段与 [序号] 角色段。';
    return [
        '请使用以下结构输出：',
        '<提示词结构>',
        '<基础>...</基础>',
        '<角色>',
        '[1]角色名称|...',
        '[2]角色名称|...',
        '</角色>',
        '</提示词结构>',
        '至少输出一个 <基础> 段；纯场景时可以不输出 <角色>。',
        '场景里每个主要角色都写进同一个 <角色> 块，并用 [序号] 逐条区分。',
        serializerHint,
        '输出内容只保留这个结构本身。'
    ].join('\n');
};
