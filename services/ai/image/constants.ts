import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 香闺秘档部位类型 } from '../../../models/imageGeneration';

// ==================== Negative Prompt Defaults ====================

export const 自动去水印负面提示词 = 'text, watermark, signature, username, logo, artist name, web address, url, copyright, subtitle';

export const 默认NovelAI负面提示词 = 'photorealistic, realistic, 3d, rendering, unreal engine, octane render, real life, photography, bokeh, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, border, out of frame';

// ==================== Tokenizer AI Role Defaults ====================

export const 默认分词器AI角色提示词 = [
    '你是分词器大师。',
    '你的职责是把输入资料整理成稳定、可执行、可直接投喂图像模型的高质量提示词。',
    '请严格遵循系统层给定的角色、规则、任务和输出约束，围绕任务目标组织结果。'
].join('\n');

// ==================== PNG Parsing Constants ====================

export const PNG签名 = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

export const 合并负面提示词片段 = (...parts: Array<string | undefined>): string => {
    const seen = new Set<string>();
    const items: string[] = [];
    parts.forEach((part) => {
        (part || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .forEach((item) => {
                const key = item.toLowerCase();
                if (seen.has(key)) return;
                seen.add(key);
                items.push(item);
            });
    });
    return items.join(', ');
};

// ==================== NovelAI Steganography ====================

export const NovelAI隐写PNG魔术字符串 = 'stealth_pngcomp';
export const NovelAI隐写PNG最大像素数 = 4096 * 4096;

// ==================== TIFF / Exif ====================

export const TIFF字段类型字节数: Record<number, number> = {
    1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8
};

// ==================== Composition Negative Prompt Map ====================

export const 构图附加负面提示词映射: Partial<Record<'头像' | '半身' | '立绘' | '场景' | '部位特写', string>> = {
    部位特写: 'multiple views, split screen, panel layout, comic panel, comic page, collage, contact sheet, reference sheet, character sheet, turnaround, comparison sheet, montage, triptych, diptych, quadriptych, grid layout, tiled composition'
};

// ==================== Secret Part Mapping ====================

export const 香闺秘档部位描述字段映射: Record<香闺秘档部位类型, string> = {
    胸部: '胸部描述',
    小穴: '小穴描述',
    屁穴: '屁穴描述'
};

export const 构建香闺秘档部位特写说明 = (部位: 香闺秘档部位类型): string => {
    if (部位 === '胸部') {
        return '胸部微距特写 (Breasts Macro Photography)。极近距离裁切，画面完全被胸部占据，聚焦于乳头纹理、乳晕色泽 (Pink nipples, Detailed areola) 以及皮肤的透光感 (Subsurface scattering)，背景需完全虚化或仅保留极小比例。';
    }
    if (部位 === '小穴') {
        return '阴部核心特写 (Crotch/Pussy Macro Focus)。超近距离紧裁切，聚焦于花径、湿润程度 (Wetness, Pussy juice) 以及皮肤纹理，强调真实的肉感与微距细节，严禁退回全身或半身视角。';
    }
    return '后庭局部特写 (Ass/Anus Extreme Close-up)。超近距离裁切，画面被臀部与后庭占据，聚焦于皮肤褶皱、肉感 (Skin texture, Fleshy) 以及后庭细节 (Detailed anus)，强调微距级别的细节呈现。';
};

// ==================== URL Helpers ====================

export const 清理末尾斜杠 = (baseUrl: string): string => baseUrl.replace(/\/+$/, '');

export const 规范化NovelAI基础地址 = (baseUrlRaw: string): string => {
    const trimmed = 清理末尾斜杠(baseUrlRaw || '');
    if (!trimmed) return trimmed;
    return trimmed.replace(/^https:\/\/novelai\.net(?=\/|$)/i, 'https://image.novelai.net');
};

export const 需要使用本地NovelAI代理 = (baseUrlRaw: string): boolean => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    const isLocalDev = host === 'localhost' || host === '127.0.0.1';
    return isLocalDev && /https:\/\/image\.novelai\.net/i.test(baseUrlRaw || '');
};

// ==================== Decoders ====================

const UTF8解码器 = new TextDecoder('utf-8');
const Latin1解码器 = new TextDecoder('iso-8859-1');

export const 解码UTF8 = (bytes: Uint8Array): string => {
    try { return UTF8解码器.decode(bytes); } catch { return ''; }
};

export const 解码Latin1 = (bytes: Uint8Array): string => {
    try { return Latin1解码器.decode(bytes); } catch { return ''; }
};

export const 读取Null终止文本 = (bytes: Uint8Array, startIndex: number, decoder: (payload: Uint8Array) => string): { text: string; nextIndex: number } => {
    let endIndex = startIndex;
    while (endIndex < bytes.length && bytes[endIndex] !== 0) endIndex += 1;
    const text = decoder(bytes.subarray(startIndex, endIndex));
    return { text, nextIndex: Math.min(bytes.length, endIndex + 1) };
};

// ==================== Image Endpoint & Headers ====================

export const 构建图片端点 = (
    baseUrlRaw: string,
    customPathRaw?: string,
    pathMode?: 'preset' | 'custom'
): string => {
    const normalizedBaseRaw = 规范化NovelAI基础地址(baseUrlRaw || '');
    const base = 清理末尾斜杠(normalizedBaseRaw || '');
    const customPath = (customPathRaw || '').trim();
    if (需要使用本地NovelAI代理(base)) {
        const targetPath = customPath
            ? (/^https?:\/\//i.test(customPath) ? new URL(customPath).pathname : (customPath.startsWith('/') ? customPath : `/${customPath}`))
            : '/ai/generate-image';
        return `/api/novelai${targetPath}`;
    }
    if (/^https?:\/\//i.test(customPath)) {
        return 清理末尾斜杠(customPath);
    }
    if (!base) return '';
    if (customPath) {
        const normalizedPath = customPath.startsWith('/') ? customPath : `/${customPath}`;
        return `${base}${normalizedPath}`;
    }
    if (pathMode === 'custom') {
        return base;
    }
    if (/\/images\/generations$/i.test(base)) return base;
    if (/\/chat\/completions$/i.test(base)) return base;
    if (/\/v1$/i.test(base)) return `${base}/images/generations`;
    return `${base}/v1/images/generations`;
};

export const 构建生图请求头 = (apiConfig: 当前可用接口结构): Record<string, string> => {
    const backendType = apiConfig.图片后端类型 || 'openai';
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (backendType === 'novelai') {
        headers.Accept = 'application/zip';
    }
    if (apiConfig.apiKey && (backendType === 'openai' || backendType === 'novelai' || backendType === 'grok')) {
        headers.Authorization = `Bearer ${apiConfig.apiKey}`;
    }
    return headers;
};
