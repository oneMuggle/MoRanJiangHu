import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 香闺秘档部位类型 } from '../../../models/imageGeneration';
import type { PNG解析参数结构, 角色锚点结构 } from '../../../models/system';
import type { 图片提示词装配结果, 场景角色锚点输入 } from './imageTasksTypes';
import { 部位特写分词COT伪装历史消息提示词 } from '../../../prompts/runtime/imageTokenizerSecretPartCot';
import { 替换COT伪装身份占位, 请求模型文本, 规范化文本补全消息链 } from '../chatCompletionClient';
import {
    清理生图词组输出,
    按逗号拆分提示词,
    去重提示词片段,
    合并正向提示词片段,
    保守补全NAI权重语法,
    构建角色锚点注入提示词,
    序列化词组转化器输出,
    归一化单段词组转化器输出,
    解析场景词组响应
} from './imageTokenizer';

// ==================== NPC Field Readers ====================

const 读取NPC字段文本 = (data: any, key: string): string => {
    const value = data?.[key];
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return '';
};

const 读取NPC对象片段 = (data: any, key: string): string => {
    const source = data?.[key];
    if (!source || typeof source !== 'object' || Array.isArray(source)) return '';
    return Object.entries(source as Record<string, unknown>)
        .map(([name, value]) => {
            if (typeof value === 'string' && value.trim()) return `${name}:${value.trim()}`;
            if (typeof value === 'number' && Number.isFinite(value)) return `${name}:${value}`;
            return '';
        })
        .filter(Boolean)
        .join('，');
};

const 读取NPC数组片段 = (data: any, key: string): string => {
    const source = data?.[key];
    if (!Array.isArray(source)) return '';
    return source
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object' && typeof (item as any)?.名称 === 'string') return (item as any).名称.trim();
            return '';
        })
        .filter(Boolean)
        .join('，');
};

// ==================== Tokenizer Helper Stubs (duplicated from imageTokenizer for local use) ====================

const 请求分词器文本 = async (
    params: {
        apiConfig: 当前可用接口结构;
        aiRolePrompt?: string;
        systemPrompts?: Array<string | undefined>;
        taskPrompt: string;
        signal?: AbortSignal;
        cotPseudoHistoryPrompt?: string;
        taskType?: '角色' | '场景' | '部位特写';
    }
): Promise<string> => {
    const 规范化可选文本 = (value: unknown): string => (
        typeof value === 'string' ? value.trim() : ''
    );
    const 默认图片分词COT = params.taskType === '场景'
        ? (await import('../../../prompts/runtime/imageTokenizerSceneCot')).场景图片分词COT伪装历史消息提示词
        : params.taskType === '部位特写'
            ? 部位特写分词COT伪装历史消息提示词
            : (await import('../../../prompts/runtime/imageTokenizerCharacterCot')).角色图片分词COT伪装历史消息提示词;
    const aiRoleSystemPrompt = [
        (await import('./constants')).默认分词器AI角色提示词,
        规范化可选文本(params.aiRolePrompt)
    ].filter(Boolean).join('\n\n');
    const normalizedCotPrompt = 替换COT伪装身份占位(
        规范化可选文本(params.cotPseudoHistoryPrompt) || 默认图片分词COT.trim(),
        aiRoleSystemPrompt
    ).trim();
    const normalizedSystemPrompts = (params.systemPrompts || [])
        .map((content) => 规范化可选文本(content))
        .filter(Boolean);
    const taskPrompt = 规范化可选文本(params.taskPrompt);
    const messagesRaw: any[] = [
        { role: 'system', content: aiRoleSystemPrompt },
        ...normalizedSystemPrompts.map((content) => ({ role: 'system' as const, content })),
        { role: 'assistant', content: `【本次任务】\n${taskPrompt}` },
        { role: 'user', content: '开始任务' },
        ...(normalizedCotPrompt ? [{ role: 'assistant' as const, content: normalizedCotPrompt }] : [])
    ];
    const messages = 规范化文本补全消息链(messagesRaw, { 保留System: true, 合并同角色: false });
    return 请求模型文本(params.apiConfig, messages, {
        temperature: 0.5,
        signal: params.signal
    });
};

// ==================== Secret Part Constants ====================

const 香闺秘档部位描述字段映射: Record<香闺秘档部位类型, string> = {
    胸部: '胸部描述',
    小穴: '小穴描述',
    屁穴: '屁穴描述'
};

const 构建香闺秘档部位特写说明 = (部位: 香闺秘档部位类型): string => {
    if (部位 === '胸部') {
        return '胸部微距特写 (Breasts Macro Photography)。极近距离裁切，画面完全被胸部占据，聚焦于乳头纹理、乳晕色泽 (Pink nipples, Detailed areola) 以及皮肤的透光感 (Subsurface scattering)，背景需完全虚化或仅保留极小比例。';
    }
    if (部位 === '小穴') {
        return '阴部核心特写 (Crotch/Pussy Macro Focus)。超近距离紧裁切，聚焦于花径、湿润程度 (Wetness, Pussy juice) 以及皮肤纹理，强调真实的肉感与微距细节，严禁退回全身或半身视角。';
    }
    return '后庭局部特写 (Ass/Anus Extreme Close-up)。超近距离裁切，画面被臀部与后庭占据，聚焦于皮肤褶皱、肉感 (Skin texture, Fleshy) 以及后庭细节 (Detailed anus)，强调微距级别的细节呈现。';
};

const 强化香闺秘档特写词组 = (
    prompt: string,
    部位: 香闺秘档部位类型
): string => {
    const source = 清理生图词组输出(prompt);
    if (!source) return source;
    const deny = /^(?:portrait|headshot|upper body|half body|waist-?up|full body|cowboy shot|wide shot|mid shot|long shot|standing|sitting|kneeling|running|walking|looking at viewer|face focus|facial focus|scenery|environment|landscape|room|indoors|outdoors|background|establishing shot)$/i;
    return 去重提示词片段(按逗号拆分提示词(source))
        .filter((token) => !deny.test(token))
        .join(', ');
};

const 生成NovelAI人物数量标签 = (source: Record<string, unknown>): string => {
    const gender = 读取NPC字段文本(source, '性别');
    if (gender === '女') return '1girl';
    if (gender === '男') return '1man';
    return 'solo';
};

// ==================== Serialization Helpers ====================

type 结构化角色词组片段 = { 名称: string; 内容: string };

const 提取最后一个标签完整块 = (rawText: string, tagName: string): string => {
    const source = (rawText || '').trim();
    if (!source) return '';
    const regex = new RegExp(`<\\s*${tagName}\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*${tagName}\\s*>`, 'gi');
    const matches = source.match(regex);
    return Array.isArray(matches) && matches.length > 0 ? (matches[matches.length - 1] || '').trim() : '';
};

const 提取最后一个标签文本 = (rawText: string, tagName: string): string => {
    const block = 提取最后一个标签完整块(rawText, tagName);
    if (!block) return '';
    const source = block.trim();
    return source
        .replace(new RegExp(`^<\\s*${tagName}\\b[^>]*>`, 'i'), '')
        .replace(new RegExp(`<\\s*\\/\\s*${tagName}\\s*>$`, 'i'), '')
        .trim();
};

const 提取最后一个标签文本列表 = (rawText: string, tagNames: string[]): string => {
    for (const tagName of tagNames) {
        const text = 提取最后一个标签文本(rawText, tagName);
        if (text) return text;
    }
    return '';
};

const 解析标签属性 = (raw: string): Record<string, string> => {
    const attrs: Record<string, string> = {};
    const regex = /([^\s=]+)\s*=\s*["']([^"']+)["']/g;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(raw || ''))) {
        const key = (match[1] || '').trim();
        const value = (match[2] || '').trim();
        if (key && value) attrs[key] = value;
    }
    return attrs;
};

const 解析序号角色列表 = (rawText: string): 结构化角色词组片段[] => {
    const source = (rawText || '').replace(/\r\n/g, '\n').trim();
    if (!source) return [];
    const roles: 结构化角色词组片段[] = [];
    const regex = /(?:^|\n)\s*\[(\d+)\]\s*([\s\S]*?)(?=(?:\n\s*\[\d+\]\s*)|$)/g;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(source))) {
        const index = Number(match[1] || String(roles.length + 1));
        const payload = 清理生图词组输出(match[2] || '');
        if (!payload) continue;
        const separatorIndex = payload.indexOf('|');
        const maybeName = separatorIndex >= 0 ? payload.slice(0, separatorIndex).trim() : '';
        const maybeContent = separatorIndex >= 0 ? payload.slice(separatorIndex + 1).trim() : payload;
        const safeName = maybeName && !/,/.test(maybeName) ? maybeName : `角色${index}`;
        const safeContent = 清理生图词组输出(maybeContent);
        if (!safeContent) continue;
        roles.push({ 名称: safeName, 内容: safeContent });
    }
    return roles;
};

const 解析结构化词组结果 = (rawText: string): { 基础: string; 角色列表: 结构化角色词组片段[] } | null => {
    const source = (提取最后一个标签完整块(rawText, '提示词结构') || rawText || '').trim();
    if (!source) return null;
    const 基础完整块 = 提取最后一个标签完整块(source, '基础');
    const 基础 = 基础完整块 ? 提取最后一个标签文本(基础完整块, '基础') : 提取最后一个标签文本(source, '基础');
    const 角色列表: 结构化角色词组片段[] = [];
    const roleRegex = /<\s*角色\b([^>]*)>([\s\S]*?)<\s*\/\s*角色\s*>/gi;
    let roleMatch: RegExpExecArray | null = null;
    let roleIndex = 0;
    while ((roleMatch = roleRegex.exec(source))) {
        const attrs = 解析标签属性(roleMatch[1] || '');
        const 原始内容 = roleMatch[2] || '';
        const 序号角色 = 解析序号角色列表(原始内容);
        if (序号角色.length > 0 && !attrs.名称 && !attrs.name && !attrs.role && !attrs.角色) {
            序号角色.forEach((item) => { 角色列表.push(item); roleIndex += 1; });
            continue;
        }
        const 名称 = (attrs.名称 || attrs.name || attrs.role || attrs.角色 || `角色${roleIndex + 1}`).trim();
        const 内容 = 清理生图词组输出(原始内容);
        if (名称 || 内容) { 角色列表.push({ 名称, 内容 }); roleIndex += 1; }
    }
    if (角色列表.length <= 0) {
        const 序号角色列表 = 解析序号角色列表(提取最后一个标签文本(source, '角色'));
        if (序号角色列表.length > 0) 角色列表.push(...序号角色列表);
    }
    if (基础 || 角色列表.length > 0) {
        return { 基础: 清理生图词组输出(基础), 角色列表 };
    }
    return null;
};

const 构建提示词装配结果 = (
    prompt: string,
    apiConfig: 当前可用接口结构,
    options?: { 附加正向提示词?: string; 附加负面提示词?: string; 尺寸?: string; PNG参数?: PNG解析参数结构 }
): 图片提示词装配结果 => {
    const 前置正向 = (options?.附加正向提示词 || '').trim();
    const 主体正向 = (prompt || '').trim();
    const 后置正向 = '';
    const 主体负向 = (options?.附加负面提示词 || '').trim();
    const baseNegative = '';
    const 最终负向 = [主体负向, baseNegative].filter(Boolean).join(', ');
    const 最终正向 = [前置正向, 主体正向, 后置正向].filter(Boolean).join(', ');
    const 带内联负面 = 最终负向
        ? `${最终正向}\nNegative prompt: ${最终负向}`
        : 最终正向;
    const 尺寸 = options?.尺寸 || '1024x1024';
    const parts = 尺寸.split('x').map((v) => Number(v));
    const 宽度 = Number.isFinite(parts[0]) ? parts[0] : 1024;
    const 高度 = Number.isFinite(parts[1]) ? parts[1] : 1024;
    return {
        前置正向提示词: 前置正向,
        主体正向提示词: 主体正向,
        后置正向提示词: 后置正向,
        最终正向提示词: 最终正向,
        最终负向提示词: 最终负向,
        带内联负面提示词的正向提示词: 带内联负面,
        尺寸,
        宽度,
        高度
    };
};

// ==================== Prompt Builders ====================

export type NPC提示词选项 = {
    构图?: '头像' | '半身' | '立绘';
    画风?: 当前可用接口结构['画风'];
    额外要求?: string;
    后端类型?: 当前可用接口结构['图片后端类型'];
    启用画师串预设?: boolean;
    兼容模式?: boolean;
    风格提示词输入?: string;
    角色锚点?: {
        名称?: string;
        正面提示词: string;
        负面提示词?: string;
        结构化特征?: 角色锚点结构['结构化特征'];
    };
};

export type NPC秘档部位提示词选项 = {
    部位: 香闺秘档部位类型;
    画风?: 当前可用接口结构['画风'];
    额外要求?: string;
    后端类型?: 当前可用接口结构['图片后端类型'];
    启用画师串预设?: boolean;
    兼容模式?: boolean;
    风格提示词输入?: string;
    角色锚点?: {
        名称?: string;
        正面提示词: string;
        负面提示词?: string;
        结构化特征?: 角色锚点结构['结构化特征'];
    };
};

export const buildNpcDirectImagePrompt = (
    npcData: unknown,
    options?: NPC提示词选项
): { 原始描述: string; 生图词组: string } => {
    const source = (npcData && typeof npcData === 'object') ? npcData as Record<string, unknown> : {};
    const isNovelAI = options?.后端类型 === 'novelai';
    const fragments = [
        读取NPC字段文本(source, '性别'),
        读取NPC字段文本(source, '年龄') ? `${读取NPC字段文本(source, '年龄')}岁` : '',
        读取NPC字段文本(source, '身份'),
        读取NPC字段文本(source, '境界'),
        读取NPC字段文本(source, '简介'),
        读取NPC字段文本(source, '核心性格特征'),
        读取NPC字段文本(source, '性格'),
        读取NPC字段文本(source, '外貌'),
        读取NPC字段文本(source, '身材'),
        读取NPC字段文本(source, '衣着')
    ];

    const 装备短语 = 读取NPC对象片段(source, '当前装备');
    if (装备短语) fragments.push(`装备：${装备短语}`);
    const 背包短语 = 读取NPC数组片段(source, '背包');
    if (背包短语) fragments.push(`随身物品：${背包短语}`);
    const 补充视觉设定 = 读取NPC对象片段(source, '补充视觉设定');
    if (补充视觉设定) fragments.push(`补充设定：${补充视觉设定}`);

    if (isNovelAI) {
        const characterCountTag = 生成NovelAI人物数量标签(source);
        if (options?.构图 === '立绘') {
            fragments.push(characterCountTag, 'full body, standing, character focus');
        } else {
            fragments.push(characterCountTag, 'portrait, upper body, face focus');
        }
    } else {
        if (options?.构图 === '立绘') fragments.push('全身角色，站姿，角色主体');
    }
    if ((options?.额外要求 || '').trim()) fragments.push((options?.额外要求 || '').trim());

    const 原始词组 = fragments.filter(Boolean).join(isNovelAI ? ', ' : '，');
    const 生图词组 = isNovelAI ? 保守补全NAI权重语法(原始词组) : 原始词组;
    return {
        原始描述: JSON.stringify(source ?? {}, null, 2),
        生图词组
    };
};

export const buildNpcSecretPartDirectImagePrompt = (
    npcData: unknown,
    options: NPC秘档部位提示词选项
): { 原始描述: string; 生图词组: string } => {
    const source = (npcData && typeof npcData === 'object') ? npcData as Record<string, unknown> : {};
    const 部位 = options.部位;
    const 描述字段 = 香闺秘档部位描述字段映射[部位];
    const 描述文本 = 读取NPC字段文本(source, 描述字段);
    if (!描述文本) {
        throw new Error(`${部位}描述为空，无法生成${部位}特写。`);
    }

    const isNovelAI = options.后端类型 === 'novelai';
    const 额外要求 = (options?.额外要求 || '').trim();
    const 角色锚点注入词 = 构建角色锚点注入提示词(options?.角色锚点, { 构图: '部位特写', 部位 });
    const fragments = [
        isNovelAI ? 生成NovelAI人物数量标签(source) : 'single female subject',
        读取NPC字段文本(source, '性别') === '女' ? 'female' : '',
        角色锚点注入词,
        描述文本,
        额外要求
    ].map(item => item.trim()).filter(Boolean);

    return {
        原始描述: JSON.stringify({
            部位,
            描述字段,
            描述文本,
            角色锚点注入词,
            角色锚点: {
                名称: (options?.角色锚点?.名称 || '').trim(),
                正面提示词: (options?.角色锚点?.正面提示词 || '').trim(),
                负面提示词: (options?.角色锚点?.负面提示词 || '').trim(),
                结构化特征: options?.角色锚点?.结构化特征,
                姓名: 读取NPC字段文本(source, '姓名'),
                性别: 读取NPC字段文本(source, '性别'),
                年龄: 读取NPC字段文本(source, '年龄'),
                身份: 读取NPC字段文本(source, '身份'),
                外貌: 读取NPC字段文本(source, '外貌'),
                身材: 读取NPC字段文本(source, '身材'),
                衣着: 读取NPC字段文本(source, '衣着')
            }
        }, null, 2),
        生图词组: isNovelAI ? 保守补全NAI权重语法(合并正向提示词片段(...fragments)) : 合并正向提示词片段(...fragments)
    };
};

export const generateNpcSecretPartImagePrompt = async (
    npcData: unknown,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    extraPrompt?: string,
    cotPseudoHistoryPrompt?: string,
    options?: NPC秘档部位提示词选项
): Promise<{ 原始描述: string; 生图词组: string }> => {
    const source = (npcData && typeof npcData === 'object') ? npcData as Record<string, unknown> : {};
    const 部位 = options?.部位;
    if (!部位) throw new Error('缺少目标部位，无法生成香闺秘档特写词组。');
    const 描述字段 = 香闺秘档部位描述字段映射[部位];
    const 描述文本 = 读取NPC字段文本(source, 描述字段);
    if (!描述文本) throw new Error(`${部位}描述为空，无法生成${部位}特写。`);

    const 原始描述 = JSON.stringify({ 部位, 描述字段, 描述文本, 角色资料: source }, null, 2);
    const 词组转化器AI角色提示词 = (apiConfig.词组转化器AI角色提示词 || '').trim();
    const 相关转换提示词 = (apiConfig.词组转化器提示词 || '').trim();
    const 额外要求 = (options?.额外要求 || '').trim();
    const isNovelAI = options?.后端类型 === 'novelai';
    const 兼容模式 = options?.兼容模式 === true;
    const 风格提示词输入 = (options?.风格提示词输入 || '').trim();
    const 角色锚点 = options?.角色锚点;
    const 使用角色锚点 = Boolean((角色锚点?.正面提示词 || '').trim());
    const 角色锚点注入词 = 构建角色锚点注入提示词(角色锚点, { 构图: '部位特写', 部位 });
    const 特写说明 = 构建香闺秘档部位特写说明(部位);
    const 默认系统提示词 = (isNovelAI ? [
        '你是 NovelAI V4/V4.5 专用的武侠/仙侠私密部位特写提示词专家。',
        '任务：根据输入的角色资料、角色锚点和目标部位描述，生成稳定、可画的英文 tags。',
        '【输出策略】：可以使用 NovelAI 权重分组语法来组织构图、主体、局部细节和附加风格要求，但不要默认补充固定质量串或固定画风串。',
        '【构图规范】：极速聚焦（Macro Focus）。目标部位必须撑满画面，禁止任何退回半身、全身或普通人像的倾向。',
        '【视觉纹理】：重点描述 skins texture, subsurface scattering, glistening moisture, soft shadows, rim lighting。',
        '【解剖约束】：严格执行"单体准则"。禁止出现重复乳头、多重生殖器或镜像复制。若资料中包含多项描述，应提炼为单一、稳定的视觉焦点。',
        '【风格对齐】：跟随输入资料、额外要求和风格词，不要擅自附加档案页、参考页、拼贴页、多分镜或固定古风底座。',
        使用角色锚点 ? '【锚点对齐】：优先继承与目标部位稳定相关的身体特征，让局部细节与角色保持一致。' : '',
        '禁止生成：face, eyes, hair, arms, legs, background scenery, furniture, clothes (除非作为边缘遮挡)。',
        兼容模式 && 风格提示词输入 ? '请自然吸收并整合额外提供的风格词：' + 风格提示词输入 : '',
        `本次目标：${特写说明}`,
        '输出结构：请只输出 <提示词>...</提示词>。'
    ] : [
        '你是武侠/仙侠香闺秘档部位特写提示词转换器。',
        '任务：将角色资料、角色锚点与部位描述转化为稳定、可画的生图短语（英文 tags）。',
        '画面要求：纯粹的微距特写 (Macro shot)。目标部位占据 90% 以上画面，强调纹理、颜色、光泽与边缘细节。',
        '禁止退步：严禁生成包含头部、四肢或大幅场景的提示词。',
        '单体约束：画面中只能有一个目标器官，严禁任何形式的解剖重复或畸变镜像。',
        '质感表现：优先体现肤质（如玉、细腻）、湿润感、光影层次（侧逆光、柔光）以及布料的物理挤压关系。',
        '风格要求：跟随输入资料、额外要求和风格提示词；不要默认补充固定质量串、固定二次元风格串或固定写实风格串。',
        使用角色锚点 ? '锚点对齐：优先继承与目标部位稳定相关的身体特征，让局部细节与角色保持一致。' : '',
        '输出格式：使用英文逗号分隔的短语串。',
        兼容模式 && 风格提示词输入 ? '请吸收额外风格词并整合：' + 风格提示词输入 : '',
        `本次目标：${特写说明}`,
        '输出结构：请只输出 <提示词>...</提示词>。'
    ]).filter(Boolean).join('\n');

    const taskPrompt = isNovelAI ? [
        '【角色与目标部位资料】', 原始描述,
        使用角色锚点 ? `\n【角色稳定视觉锚点】\n${(角色锚点?.正面提示词 || '').trim()}` : '',
        角色锚点注入词 ? `\n【部位裁剪锚点】\n${角色锚点注入词}` : '',
        '', '【输出要求】', `目标部位：${部位}`,
        '输出语言：以英文 tags 为主，必要时可保留专有名词。',
        '格式：请只输出 <提示词>...</提示词>，其中内容使用英文逗号分隔。',
        '重点：只保留目标部位特写和最小必要周边，让局部细节完整、清晰、可画。',
        '镜头要求：必须是 extreme close-up / ultra tight crop，目标部位占据画面主体，不能退成普通近景。',
        '数量要求：只允许一个目标部位，不允许重复、镜像复制、并排复制。',
        '禁止内容：face, portrait, upper body, half body, full body, legs, hands, multiple people, room focus, scenery focus。',
        兼容模式 && 风格提示词输入 ? `额外风格正面提示词：${风格提示词输入}` : '',
        额外要求 ? `附加要求：${额外要求}` : '附加要求：无'
    ].join('\n') : [
        '【角色与目标部位资料】', 原始描述,
        使用角色锚点 ? `\n【角色稳定视觉锚点】\n${(角色锚点?.正面提示词 || '').trim()}` : '',
        角色锚点注入词 ? `\n【部位裁剪锚点】\n${角色锚点注入词}` : '',
        '', '【额外生成要求】', '世界观：中国武侠/仙侠（古风）',
        `目标部位：${部位}`, '构图：部位特写 / 仅展示目标部位及其必要周边',
        '画面保持局部聚焦、单主体表达，禁止参考页、拼贴页、多分镜或宫格化排版。',
        '画面要求：描述必须具体、可见、可画，优先写形状、颜色、肌理、湿润感、边缘和布料裁切。',
        '镜头要求：必须是 extreme close-up / ultra tight crop，目标部位占据画面主体，不能退成普通近景。',
        '数量要求：只允许一个目标部位，不允许重复、镜像复制、并排复制。',
        '禁止内容：face, portrait, upper body, half body, full body, legs, hands, multiple people, room focus, scenery focus。',
        '格式：请只输出 <提示词>...</提示词>。',
        兼容模式 && 风格提示词输入 ? `额外风格正面提示词：${风格提示词输入}` : '',
        额外要求 ? `附加要求：${额外要求}` : '附加要求：无'
    ].join('\n');

    const raw = await 请求分词器文本({
        apiConfig, aiRolePrompt: 词组转化器AI角色提示词,
        systemPrompts: [相关转换提示词, 默认系统提示词, extraPrompt],
        taskPrompt, signal, cotPseudoHistoryPrompt, taskType: '部位特写'
    });
    const 生图词组 = 强化香闺秘档特写词组(
        合并正向提示词片段(角色锚点注入词, 归一化单段词组转化器输出(raw, { isNovelAI })),
        部位
    );
    if (!生图词组) throw new Error('香闺秘档特写词组转化器未返回有效生图词组');
    return { 原始描述, 生图词组 };
};

export const generateNpcImagePrompt = async (
    npcData: unknown,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    extraPrompt?: string,
    cotPseudoHistoryPrompt?: string,
    options?: NPC提示词选项
): Promise<{ 原始描述: string; 生图词组: string }> => {
    const 原始描述 = JSON.stringify(npcData ?? {}, null, 2);
    const 构图 = options?.构图 || '头像';
    const 画风要求 = options?.画风 || '通用';
    const 额外要求 = (options?.额外要求 || '').trim();
    const 词组转化器AI角色提示词 = (apiConfig.词组转化器AI角色提示词 || '').trim();
    const 相关转换提示词 = (apiConfig.词组转化器提示词 || '').trim();
    const isNovelAI = options?.后端类型 === 'novelai';
    const 输出策略 = isNovelAI
        ? (apiConfig.词组转化输出策略 === 'flat' ? 'nai_character_segments' : (apiConfig.词组转化输出策略 || 'nai_character_segments'))
        : (apiConfig.词组转化输出策略 || 'flat');
    const 兼容模式 = options?.兼容模式 === true;
    const 风格提示词输入 = (options?.风格提示词输入 || '').trim();
    const 角色锚点 = options?.角色锚点;
    const 使用角色锚点 = Boolean((角色锚点?.正面提示词 || '').trim());
    const 构图说明 = 构图 === '立绘'
        ? '立绘/全身图，完整展示人物从头到脚的轮廓、站姿、服装层次与落地感。'
        : 构图 === '半身'
            ? '半身角色像，聚焦面部辨识、肩颈线条、上半身服饰层次与手部动作。'
            : '头像特写，聚焦头部与领口，保证五官辨识、目光与面部气质表达。';
    const 默认系统提示词 = (isNovelAI ? [
        `当前任务目标画风：${画风要求}。除非输入资料或附加要求明确指定，否则不要擅自锁定具体风格标签。`,
        '请把身份、境界、性格、外貌、身材和衣着转换成可见的角色信息，不要写成空泛气质词。',
        使用角色锚点 ? '已提供稳定视觉锚点。请沿用锚点中的稳定主体，只补充当前镜头、姿态、表情、光影、环境和临时变化。' : '请先完成稳定身份辨识、外观、身材和常驻衣着，再补动作、镜头、光影和环境。',
        使用角色锚点 ? '' : '若原始资料较少，可以根据身份、境界、年龄、性别做低冲突保守补全，优先补出年龄感、脸部气质、体态、常驻衣着材质、身份道具和气场表现。',
        兼容模式 && 风格提示词输入 ? '请吸收额外提供的非主体风格正面提示词，并将其整理进最终词组。' : '',
        `当前构图要求：${构图说明}`,
        '请保持单一镜头距离、单一主姿态、单一主光源，不要混入相互冲突的多镜头、多动作或多光效。'
    ] : [
        `当前任务目标画风：${画风要求}。除非输入资料或附加要求明确指定，否则不要擅自锁定具体风格标签。`,
        '请把身份、境界、外貌、身材、衣着和性格转换成可见的画面信息，不要只输出抽象氛围。',
        使用角色锚点 ? '已提供稳定视觉锚点。请沿用锚点中的稳定主体，只补充当前镜头、姿态、表情、光影、环境和临时变化。' : '请先完成稳定外观、常驻服饰和身份辨识，再补动作、镜头、光影和环境关系。',
        使用角色锚点 ? '' : '若原始资料较少，可以根据身份、境界、年龄、性别做低冲突保守补全，优先补出年龄感、脸部气质、体态、常驻衣着材质、身份道具和气场表现。',
        兼容模式 && 风格提示词输入 ? '请吸收额外提供的非主体风格正面提示词，并自然整理进最终输出。' : '',
        `当前构图要求：${构图说明}`,
        '请保持单一镜头距离、单一主姿态、单一主光源，避免互相冲突的镜头和动作。'
    ]).filter(Boolean).join('\n');

    const taskPrompt = isNovelAI ? [
        '【NPC基础资料】', 原始描述,
        使用角色锚点 ? `\n【角色稳定视觉锚点】\n${(角色锚点?.正面提示词 || '').trim()}` : '',
        '', '【输出要求】', `输出风格：${画风要求}。不要补充用户未要求的固定风格底座。`,
        '输出语言：英文 tags，使用英文逗号分隔。', `构图模式：${构图}`,
        '输出结构：请只输出 <提示词>...</提示词>。',
        '标签组织：优先整理成 4 到 6 个加权分组，再补少量自然标签。',
        使用角色锚点 ? '' : '请使用源数据里已有的稳定设定字段，尤其是身份、境界、外貌、身材、衣着和性格。',
        使用角色锚点 ? '' : '不要只返回姿态、镜头、光影或抽象气质词；<提示词> 内必须具备能长期复用的身份辨识、外观与服饰信息。',
        使用角色锚点 ? '' : '若资料字段不足，请根据身份、境界、年龄、性别自行补全最稳妥的可见设定。',
        兼容模式 && 风格提示词输入 ? `额外风格正面提示词：${风格提示词输入}` : '',
        构图 === '立绘' ? '构图重点：完整轮廓、站姿落地感、服装层次、鞋履与地面接触关系。'
            : 构图 === '半身' ? '构图重点：面部辨识、肩颈线条、上半身服饰层次与手部动作。'
            : '构图重点：头部与领口区域、五官辨识、目光、发丝与衣领细节。',
        '镜头约束：单一镜头距离、单一主姿态、单一主光源。',
        '色彩要求：从角色身份、衣着、环境和情绪线索中自然提炼，不要额外强塞固定配色模板。',
        使用角色锚点 ? '锚点模式下，请直接沿用锚点中的稳定外观，只在 <提示词> 内补镜头、动作、姿态、表情、构图、环境与临时变化。' : '',
        额外要求 ? `附加要求：${额外要求}` : '附加要求：无'
    ].join('\n') : [
        '【NPC基础资料】', 原始描述,
        使用角色锚点 ? `\n【角色稳定视觉锚点】\n${(角色锚点?.正面提示词 || '').trim()}` : '',
        '', '【核心生图要求】', `风格：${画风要求}。不要默认补充二次元、写实或国风固定质量串。`,
        '世界观：中国武侠/仙侠（Ancient Chinese Fantasy）。', `构图：${构图}`,
        '输出结构：请只输出 <提示词>...</提示词>。',
        使用角色锚点 ? '' : '请显式使用输入资料中的身份、境界、外貌、身材、衣着和性格。',
        使用角色锚点 ? '' : '不要只输出镜头、姿态、光影或氛围；<提示词> 内必须先给出稳定外观、常驻服饰与身份辨识，再补动作和环境。',
        使用角色锚点 ? '' : '若资料字段不足，请根据身份、境界、年龄、性别自行补全最稳妥的可见设定。',
        兼容模式 && 风格提示词输入 ? `额外风格正面提示词：${风格提示词输入}` : '',
        构图 === '立绘' ? '构图重点：完整轮廓、站姿落地感、服装层次、鞋履与地面接触关系。'
            : 构图 === '半身' ? '构图重点：面部辨识、肩颈线条、上半身服饰层次与手部动作。'
            : '构图重点：头部与领口区域、五官辨识、目光、发丝与衣领细节。',
        '镜头约束：单一镜头距离、单一主姿态、单一主光源。',
        '色彩与光线：根据角色资料、服装、材质和场景自然生成，保持协调统一。',
        使用角色锚点 ? '锚点模式下，请直接沿用锚点中的基础外观，只在 <提示词> 内补镜头、动作、姿态、表情、构图和环境补充。' : '',
        额外要求 ? `附加要求：${额外要求}` : '附加要求：无'
    ].join('\n');

    const raw = await 请求分词器文本({
        apiConfig, aiRolePrompt: 词组转化器AI角色提示词,
        systemPrompts: [相关转换提示词, 默认系统提示词, extraPrompt],
        taskPrompt, signal, cotPseudoHistoryPrompt, taskType: '角色'
    });
    const 序列化结果 = 序列化词组转化器输出(raw, {
        strategy: 输出策略,
        roleAnchors: 角色锚点 ? [{
            名称: '角色1', 正面提示词: (角色锚点?.正面提示词 || '').trim(),
            负面提示词: (角色锚点?.负面提示词 || '').trim(),
            结构化特征: 角色锚点?.结构化特征
        }] : []
    });
    const 生图词组 = 输出策略 === 'flat' && isNovelAI ? 保守补全NAI权重语法(序列化结果) : 序列化结果;
    if (!生图词组) throw new Error('词组转化器未返回有效生图词组');
    return { 原始描述, 生图词组 };
};

export const generateSceneImagePrompt = async (
    bodyText: string,
    sceneContext: unknown,
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    extraPrompt?: string,
    cotPseudoHistoryPrompt?: string,
    options?: {
        画风?: 当前可用接口结构['画风'];
        后端类型?: 当前可用接口结构['图片后端类型'];
        启用画师串预设?: boolean;
        兼容模式?: boolean;
        风格提示词输入?: string;
        额外要求?: string;
        构图要求?: '纯场景' | '故事快照';
        角色锚点列表?: 场景角色锚点输入[];
    }
): Promise<{ 原始描述: string; 生图词组: string; 场景类型: '场景快照' | '风景场景'; 场景判定说明: string }> => {
    const trimmedBody = (bodyText || '').trim();
    if (!trimmedBody) throw new Error('缺少可用于场景生图的正文内容');
    const 词组转化器AI角色提示词 = (apiConfig.词组转化器AI角色提示词 || '').trim();
    const 相关场景提示词 = (apiConfig.词组转化器提示词 || '').trim();
    const 相关场景判定提示词 = (apiConfig.场景判定提示词 || '').trim();
    const 兼容模式 = options?.兼容模式 === true;
    const 风格提示词输入 = (options?.风格提示词输入 || '').trim();
    const isNovelAI = options?.后端类型 === 'novelai';
    const 输出策略 = isNovelAI ? 'nai_character_segments' : (apiConfig.词组转化输出策略 || 'flat');
    const 构图要求 = options?.构图要求;
    const 额外要求 = (options?.额外要求 || '').trim();
    const 原始角色锚点列表 = Array.isArray(options?.角色锚点列表) ? options?.角色锚点列表.filter((item) => (item?.正面提示词 || '').trim()) : [];
    const 纯场景模式 = 构图要求 === '纯场景';
    const 角色锚点列表 = 纯场景模式 ? [] : 原始角色锚点列表;
    const 使用角色锚点 = 角色锚点列表.length > 0;
    const 强制构图 = 构图要求 === '纯场景' || 构图要求 === '故事快照';
    const 场景风格要求 = 风格提示词输入 || '跟随正文、场景资料和附加要求决定';

    const 默认系统提示词 = 强制构图 ? [
        '你是武侠/仙侠场景提示词转换器。', '任务：把当前场景整理成可直接生图的高质量英文 tags。',
        `目标画风：${场景风格要求}。除非正文、附加要求或风格提示词明确指定，否则不要擅自锁定二次元、写实、国风等具体风格标签。`,
        纯场景模式 ? '推荐结构：质量底座 -> 场景介质 -> 地点/时间天气 -> 空间层级与材质 -> 镜头与光影。' : '推荐结构：质量底座 -> 场景介质 -> 地点/时间天气 -> 空间层级与材质 -> 人物站位/互动 -> 镜头与光影。',
        纯场景模式 ? '质量、画风和整体环境基调适合权重分组；空间层级、材质细节、天气和光影适合自然标签表达。' : '质量、画风和整体环境基调适合权重分组；人物站位、动作关系、材质细节和天气气氛适合自然标签表达。',
        '【空间构图逻辑 (Spatial Logic)】：请按以下结构描述画面：',
        '1) 背景 (Background)：天色、星辰、远山、建筑远影。',
        '2) 中景 (Midground)：地点主体、主要植被、地貌细节。',
        '3) 前景 (Foreground)：点景器物、近端花草、地面纹理。',
        纯场景模式 ? '4) 视觉重心 (Placement)：明确核心景物或主景位于左(Left)、中(Center)或右(Right)。' : '4) 方位 (Placement)：明确人物或核心视觉锚点在左(Left)、中(Center)或右(Right)。',
        '【光影效果】：描述光线方向（Side lighting, Rim lighting）与氛围（God rays, Atmospheric haze）。',
        构图要求 === '故事快照' ? '故事快照时，让主互动人物成为清晰焦点，同时保留足够的地点、材质和空间信息。' : '纯场景时，让地点、季节、天气、材质、景深和主光源先成立。',
        '输出的场景保持单一可执行镜头，让时间、天气和视角自然统一。',
        使用角色锚点 ? '若已提供角色锚点，请直接沿用这些角色的稳定外观，把场景输出重点放在站位、动作、互动、表情、镜头与环境关系。' : '',
        构图要求 === '纯场景' ? '构图要求：纯场景，完整展开环境空间、材质、天气和光影。' : '构图要求：故事快照，优先抓取一个可执行的单帧互动，允许 tighter framing、portrait-friendly composition 或 vertical composition 语义。',
        纯场景模式 ? '纯场景硬约束：最终只输出场景/风景/建筑/天气/材质/光影相关 tags，禁止输出任何角色、人物、性别、动作、表情、服饰、互动或站位 tags。' : '',
        兼容模式 && 风格提示词输入 ? '请吸收额外提供的非主体风格正面提示词，并将其提炼进最终场景词组中。' : '',
        '词组使用短语串，按逗号分隔。',
        '若目标后端是 NovelAI，优先使用带权重的标签分组。',
        纯场景模式 ? '输出格式固定为 <提示词结构><基础>...</基础></提示词结构>。' : '输出格式固定为 <提示词结构><基础>...</基础><角色>[1]角色名称|tags\n[2]角色名称|tags</角色></提示词结构>。',
        纯场景模式 ? '' : '若存在角色，必须把角色内容写进单个 <角色> 块，并用 [序号] 开头逐条输出。'
    ] : [
        '你是武侠/仙侠场景提示词判定与转换器。',
        '任务：判断当前正文更适合生成"风景场景"还是"故事快照"，并整理成可直接生图的场景词组。',
        `核心画风：${场景风格要求}。除非正文、附加要求或风格提示词明确指定，否则不要擅自锁定二次元、写实、国风等具体风格标签。`,
        '当正文能够稳定落成单一可见时刻时，选择故事快照；其余情况优先选择风景场景。',
        '故事快照优先信号：明确地点、可见环境细节、在场角色、稳定姿态、清晰动作、视线关系、道具交互、空间方向、单帧时刻感。',
        '空间构图始终遵循：Background -> Midground -> Foreground。',
        '方位说明：为核心视觉锚点标出 L/C/R 位置。',
        '视觉材质：主动写出 Weathered stone, Glistening water, Flowing clouds, Mossy roof tiles 这类可见材质。',
        '对话、心理、设定说明、回忆总结和抽象气氛更适合转成风景场景；清晰单帧事件更适合故事快照。',
        '故事快照中控制人物密度与动作复杂度，让画面保持清晰稳定。',
        '若最终判定为风景场景，必须只输出环境/风景/建筑/天气/材质/光影 tags，禁止输出任何角色标签或 <角色> 段。',
        兼容模式 && 风格提示词输入 ? '请吸收额外提供的非主体风格正面提示词，并在最终结果中提炼输出。' : '',
        使用角色锚点 ? '若已提供角色锚点，只有在判定为故事快照时才沿用这些角色的稳定外观。' : '',
        '标签格式要求：',
        '1) <thinking>...</thinking>',
        '2) <场景判定>适合场景快照 或 不适合场景快照</场景判定>',
        '3) <判定说明>...</判定说明>',
        '4) <场景类型>场景快照 或 风景场景</场景类型>',
        '5) 若为风景场景，输出 <提示词结构><基础>...</基础></提示词结构>；若为场景快照，输出 <提示词结构><基础>...</基础><角色>...</角色></提示词结构>'
    ].filter(Boolean).join('\n');

    const taskPrompt = [
        '【环境层级与具体坐标】',
        `大地点（远景）：${(sceneContext as any)?.大地点 || '未知'}`,
        `具体地点（近景/舞台）：${(sceneContext as any)?.具体地点 || '未知'}`,
        使用角色锚点 ? `角色锚点：\n${角色锚点列表.map((item, index) => `[${index + 1}]${(item?.名称 || '').trim() || `角色${index + 1}`}|${(item?.正面提示词 || '').trim()}`).join('\n')}` : '',
        兼容模式 && 风格提示词输入 ? `额外风格正面提示词：${风格提示词输入}` : '',
        '', '【当前上下文详情】',
        typeof sceneContext === 'string' ? sceneContext : JSON.stringify(sceneContext ?? {}, null, 2),
        '', '【最新正文】', trimmedBody, '', '【生图核心约束】',
        `风格：${场景风格要求}。不要默认补充固定二次元质量串。`,
        '位阶构图：利用 [大地点] 渲染宏大的视觉远景/地标，利用 [具体地点] 渲染细腻的活动区/前景。',
        '空间要求：Background (Far) -> Midground (Main) -> Foreground (Close) 逻辑层次。',
        纯场景模式 ? '方位要求：必须明确主景或核心视觉重心位于画面 左(Left)、中(Center) 或 右(Right)。' : '方位要求：必须明确视觉锚点位于画面 左(Left)、中(Center) 或 右(Right)。',
        纯场景模式 ? '结构化输出：只写 <基础>，内容只包含环境、建筑、地形、天气、材质、镜头、布局、光影与景深；不要输出 <角色>。' : '结构化输出：<基础> 写环境、镜头、天气、布局、多人关系框架；<角色> 内按 [序号]角色名称|tags 逐条写该角色的外观锚点补充、动作、姿态、视线与环境/他人的关系。',
        !纯场景模式 && isNovelAI ? 'NovelAI 最终会使用 | 连接基础段与角色段；每条 [序号] 角色内容开头优先写 1girl、1boy、1woman 或 1man。' : '',
        '武侠意境：自然融入气场 (Qi aura)、剑意残影 (Sword intent)、写意留白 (Xieyi ink-wash bits) 或粒子特效（如花瓣、流光）。',
        使用角色锚点 ? '锚点模式下，请直接沿用角色的稳定外观，让 [序号] 角色内容集中承载站位、动作、关系、镜头和环境。' : '',
        构图要求 === '纯场景' ? '构图要求：纯风景，默认宽景，完整展开环境层级。最终只允许输出场景/风景 tags，禁止输出人物相关 tags。'
            : 构图要求 === '故事快照' ? '构图要求：故事快照，优先抓取一个清晰互动瞬间；人物可以成为主焦点，但必须保留地点层级、地面关系与环境补充。'
            : '构图要求：未指定。若正文适合快照，则抓取单帧互动；否则回退为环境主导的风景场景。',
        纯场景模式 ? '输出顺序：质量与介质 -> 地点与天气 -> 空间层级与材质 -> 镜头与光影。' : '输出顺序：质量与介质 -> 地点与天气 -> 空间层级与材质 -> 人物站位/互动 -> 镜头与光影。',
        额外要求 ? `额外要求：${额外要求}` : '额外要求：无',
        '要求：词组应以英文 tags 为主，包含具体的光影描述和材质细节。'
    ].filter(Boolean).join('\n');

    const 场景系统提示词列表: Array<string | undefined> = (强制构图
        ? [相关场景提示词, 默认系统提示词, extraPrompt]
        : [相关场景提示词, 相关场景判定提示词, 默认系统提示词, extraPrompt]
    ).map((item) => Array.isArray(item) ? item.join('\n') : item);

    const raw = await 请求分词器文本({
        apiConfig, aiRolePrompt: 词组转化器AI角色提示词,
        systemPrompts: 场景系统提示词列表,
        taskPrompt, signal, cotPseudoHistoryPrompt, taskType: '场景'
    });

    const parsed = 强制构图
        ? (() => {
            const 生图词组 = 提取最后一个标签完整块(raw, '提示词结构') || 提取最后一个标签文本列表(raw, ['词组', '生图词组']) || raw;
            const 场景类型: '场景快照' | '风景场景' = 构图要求 === '故事快照' ? '场景快照' : '风景场景';
            return { 场景类型, 场景判定说明: 构图要求 === '故事快照' ? '已按手动要求生成故事快照。' : '已按手动要求生成纯场景。', 生图词组 };
        })()
        : 解析场景词组响应(raw);

    const 序列化角色锚点列表 = parsed.场景类型 === '风景场景' ? [] : 角色锚点列表;
    const 序列化结果 = 序列化词组转化器输出(parsed.生图词组, { strategy: 输出策略, roleAnchors: 序列化角色锚点列表 });
    const 生图词组 = 输出策略 === 'flat' && isNovelAI ? 保守补全NAI权重语法(序列化结果) : 序列化结果;
    if (!生图词组) throw new Error('场景词组转化器未返回有效生图词组');

    const 原始描述 = JSON.stringify({
        最新正文: trimmedBody, 场景上下文: sceneContext ?? {},
        场景判定: { 场景类型: parsed.场景类型, 判定说明: parsed.场景判定说明, 是否适合场景快照: parsed.场景类型 === '场景快照' }
    }, null, 2);

    return { 原始描述, 生图词组, 场景类型: parsed.场景类型, 场景判定说明: parsed.场景判定说明 };
};

// ==================== Prompt Assembly ====================

export const 构建最终图片提示词 = (
    prompt: string,
    apiConfig: 当前可用接口结构,
    options?: { 附加正向提示词?: string; 附加负面提示词?: string; 尺寸?: string; PNG参数?: PNG解析参数结构 }
): 图片提示词装配结果 => {
    return 构建提示词装配结果(prompt, apiConfig, options);
};
