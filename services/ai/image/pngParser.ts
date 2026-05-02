import { unzlibSync } from 'fflate';
import type { PNG解析参数结构 } from '../../../models/system';
import { PNG签名, 读取Null终止文本, 解码Latin1, 解码UTF8, TIFF字段类型字节数 } from './constants';
import { 提取平衡JSON对象, NovelAI隐写PNG魔术字符串, NovelAI隐写PNG最大像素数 } from './imageTokenizer';

export type PNG元数据解析结果 = {
    来源: 'novelai' | 'sd_webui' | 'unknown';
    正面提示词: string;
    负面提示词: string;
    参数?: PNG解析参数结构;
    原始元数据: string;
    元数据标签?: Record<string, string>;
};

export type PNG画风提炼结果 = {
    画师串: string;
    原始正面提示词: string;
    剥离后正面提示词: string;
    AI提炼正面提示词: string;
    正面提示词: string;
    负面提示词: string;
    画师命中项: string[];
    说明?: string;
};

// ==================== Decompression & Chunk Parsing ====================

const 解压文本块 = (bytes: Uint8Array): Uint8Array => {
    if (!bytes.length) return bytes;
    try { return unzlibSync(bytes); } catch { return bytes; }
};

const 解析PNG文本块 = (type: string, data: Uint8Array): { key: string; value: string } | null => {
    if (!data.length) return null;
    if (type === 'tEXt') {
        const splitIndex = data.indexOf(0);
        if (splitIndex <= 0) return null;
        const key = 解码Latin1(data.subarray(0, splitIndex)).trim();
        const value = 解码Latin1(data.subarray(splitIndex + 1)).trim();
        if (!key) return null;
        return { key, value };
    }
    if (type === 'zTXt') {
        const splitIndex = data.indexOf(0);
        if (splitIndex <= 0 || splitIndex + 2 > data.length) return null;
        const key = 解码Latin1(data.subarray(0, splitIndex)).trim();
        const compressed = data.subarray(splitIndex + 2);
        const value = 解码Latin1(解压文本块(compressed)).trim();
        if (!key) return null;
        return { key, value };
    }
    if (type === 'iTXt') {
        const keywordPart = 读取Null终止文本(data, 0, 解码Latin1);
        if (!keywordPart.text) return null;
        const compressionFlag = data[keywordPart.nextIndex] || 0;
        const compressionMethod = data[keywordPart.nextIndex + 1] || 0;
        let cursor = keywordPart.nextIndex + 2;
        const languagePart = 读取Null终止文本(data, cursor, 解码Latin1);
        cursor = languagePart.nextIndex;
        const translatedPart = 读取Null终止文本(data, cursor, 解码UTF8);
        cursor = translatedPart.nextIndex;
        const rawText = data.subarray(cursor);
        const decodedText = compressionFlag === 1 && compressionMethod === 0
            ? 解码UTF8(解压文本块(rawText)) : 解码UTF8(rawText);
        return { key: keywordPart.text.trim(), value: decodedText.trim() };
    }
    return null;
};

// ==================== Chunk Traversal ====================

const 遍历PNG数据块 = (
    pngBytes: Uint8Array,
    visitor: (params: { type: string; data: Uint8Array; length: number }) => boolean | void
): boolean => {
    if (pngBytes.length < PNG签名.length) return false;
    for (let i = 0; i < PNG签名.length; i += 1) { if (pngBytes[i] !== PNG签名[i]) return false; }
    const view = new DataView(pngBytes.buffer, pngBytes.byteOffset, pngBytes.byteLength);
    let offset = PNG签名.length;
    while (offset + 8 <= pngBytes.length) {
        const length = view.getUint32(offset);
        const typeBytes = pngBytes.subarray(offset + 4, offset + 8);
        const type = String.fromCharCode(...Array.from(typeBytes));
        const dataStart = offset + 8;
        const dataEnd = dataStart + length;
        if (dataEnd > pngBytes.length) return false;
        const shouldStop = visitor({ type, data: pngBytes.subarray(dataStart, dataEnd), length });
        if (shouldStop === true) return true;
        offset = dataEnd + 4;
    }
    return true;
};

const 解析PNG文本元数据 = (pngBytes: Uint8Array): Record<string, string> => {
    const result: Record<string, string> = {};
    遍历PNG数据块(pngBytes, ({ type, data }) => {
        if (type !== 'tEXt' && type !== 'zTXt' && type !== 'iTXt') return;
        const parsed = 解析PNG文本块(type, data);
        if (!parsed?.key) return;
        const existing = result[parsed.key];
        result[parsed.key] = existing ? `${existing}\n${parsed.value}` : parsed.value;
    });
    return result;
};

const 提取PNG指定块列表 = (pngBytes: Uint8Array, targetType: string): Uint8Array[] => {
    const chunks: Uint8Array[] = [];
    遍历PNG数据块(pngBytes, ({ type, data }) => { if (type === targetType) chunks.push(data.slice()); });
    return chunks;
};

const 读取元数据字段 = (map: Record<string, string>, keys: string[]): string => {
    for (const key of keys) {
        const direct = map[key]; if (direct && direct.trim()) return direct.trim();
        const lower = Object.entries(map).find(([k]) => k.toLowerCase() === key.toLowerCase());
        if (lower?.[1]) return lower[1].trim();
    }
    return '';
};

// ==================== Exif Parsing ====================

const 读取Exif字段原始字节 = (view: DataView, entryOffset: number, type: number, count: number, littleEndian: boolean): Uint8Array | null => {
    const unitSize = TIFF字段类型字节数[type];
    if (!unitSize || !Number.isFinite(count) || count <= 0) return null;
    const totalSize = unitSize * count;
    if (!Number.isFinite(totalSize) || totalSize <= 0) return null;
    if (totalSize <= 4) return new Uint8Array(view.buffer.slice(view.byteOffset + entryOffset + 8, view.byteOffset + entryOffset + 8 + totalSize));
    const valueOffset = view.getUint32(entryOffset + 8, littleEndian);
    if (valueOffset + totalSize > view.byteLength) return null;
    return new Uint8Array(view.buffer.slice(view.byteOffset + valueOffset, view.byteOffset + valueOffset + totalSize));
};

const 解码ExifUserComment = (bytes: Uint8Array, littleEndian: boolean): string => {
    if (!bytes.length) return '';
    if (bytes.length >= 8) {
        const prefix = 解码Latin1(bytes.subarray(0, 8)); const payload = bytes.subarray(8);
        if (prefix === 'ASCII\x00\x00\x00') return 解码Latin1(payload).replace(/\0+$/g, '').trim();
        if (prefix === 'UNICODE\x00') { try { return new TextDecoder(littleEndian ? 'utf-16le' : 'utf-16be').decode(payload).replace(/\0+$/g, '').trim(); } catch { return 解码UTF8(payload).replace(/\0+$/g, '').trim(); } }
        if (prefix === 'JIS\x00\x00\x00\x00\x00') return 解码Latin1(payload).replace(/\0+$/g, '').trim();
    }
    return 解码UTF8(bytes).replace(/\0+$/g, '').trim() || 解码Latin1(bytes).replace(/\0+$/g, '').trim();
};

const 解析单个ExifIFD = (view: DataView, ifdOffset: number, littleEndian: boolean, sink: Record<string, string>, visited: Set<number>): void => {
    if (!Number.isFinite(ifdOffset) || ifdOffset < 0 || ifdOffset + 2 > view.byteLength || visited.has(ifdOffset)) return;
    visited.add(ifdOffset);
    const entryCount = view.getUint16(ifdOffset, littleEndian);
    for (let i = 0; i < entryCount; i += 1) {
        const entryOffset = ifdOffset + 2 + i * 12; if (entryOffset + 12 > view.byteLength) break;
        const tag = view.getUint16(entryOffset, littleEndian);
        const type = view.getUint16(entryOffset + 2, littleEndian);
        const count = view.getUint32(entryOffset + 4, littleEndian);
        if (tag === 0x8769 || tag === 0x8825) { 解析单个ExifIFD(view, view.getUint32(entryOffset + 8, littleEndian), littleEndian, sink, visited); continue; }
        const rawBytes = 读取Exif字段原始字节(view, entryOffset, type, count, littleEndian); if (!rawBytes?.length) continue;
        if (tag === 0x010E && !sink.ImageDescription) { const v = (type === 2 ? 解码Latin1(rawBytes) : 解码UTF8(rawBytes)).replace(/\0+$/g, '').trim(); if (v) sink.ImageDescription = v; continue; }
        if (tag === 0x9286 && !sink.UserComment) { const v = 解码ExifUserComment(rawBytes, littleEndian); if (v) sink.UserComment = v; continue; }
        if (tag === 0x9C9C && !sink.XPComment) { try { const v = new TextDecoder('utf-16le').decode(rawBytes).replace(/\0+$/g, '').trim(); if (v) sink.XPComment = v; } catch { /* ignore */ } }
    }
    const next = ifdOffset + 2 + entryCount * 12;
    if (next + 4 <= view.byteLength) { const p = view.getUint32(next, littleEndian); if (p > 0) 解析单个ExifIFD(view, p, littleEndian, sink, visited); }
};

const 解析PNGExif元数据 = (pngBytes: Uint8Array): Record<string, string> => {
    const exifChunks = 提取PNG指定块列表(pngBytes, 'eXIf');
    if (!exifChunks.length) return {};
    const result: Record<string, string> = {};
    for (const chunk of exifChunks) {
        if (!chunk?.length || chunk.length < 8) continue;
        const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        const byteOrder = view.getUint16(0, false);
        const littleEndian = byteOrder === 0x4949;
        if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) continue;
        if (view.getUint16(2, littleEndian) !== 42) continue;
        const sink: Record<string, string> = {};
        解析单个ExifIFD(view, view.getUint32(4, littleEndian), littleEndian, sink, new Set<number>());
        if (sink.ImageDescription && !result.Description) result.Description = sink.ImageDescription;
        if (sink.UserComment && !result.Comment) result.Comment = sink.UserComment;
        else if (sink.XPComment && !result.Comment) result.Comment = sink.XPComment;
        Object.entries(sink).forEach(([k, v]) => { if (v && !result[k]) result[k] = v; });
    }
    return result;
};

// ==================== NovelAI Steganography ====================

const 从PNG隐写Alpha提取NovelAI文本 = async (blob: Blob): Promise<string> => {
    if (typeof document === 'undefined' || typeof URL === 'undefined') return '';
    let objectUrl = '';
    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('加载 PNG 图像失败')); objectUrl = URL.createObjectURL(blob); img.src = objectUrl; });
        if (!image.width || !image.height) return '';
        if (image.width * image.height > NovelAI隐写PNG最大像素数) return '';
        const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); if (!ctx) return '';
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const alphaLsb = new Uint8Array(image.width * image.height);
        for (let p = 0; p < alphaLsb.length; p += 1) alphaLsb[p] = imageData.data[p * 4 + 3] & 1;
        let bitOffset = 0;
        const nextByte = (): number | null => { if (bitOffset + 8 > alphaLsb.length) return null; let byte = 0; for (let i = 0; i < 8; i += 1) { const c = (bitOffset % image.height) * image.width + Math.floor(bitOffset / image.height); if (c >= alphaLsb.length) return null; byte |= alphaLsb[c] << (7 - i); bitOffset += 1; } return byte; };
        const magicBytes = new Uint8Array(NovelAI隐写PNG魔术字符串.length);
        for (let i = 0; i < magicBytes.length; i += 1) { const v = nextByte(); if (v === null) return ''; magicBytes[i] = v; }
        if (解码Latin1(magicBytes) !== NovelAI隐写PNG魔术字符串) return '';
        const sizeBytes = new Uint8Array(4);
        for (let i = 0; i < 4; i += 1) { const v = nextByte(); if (v === null) return ''; sizeBytes[i] = v; }
        const compressedBitSize = new DataView(sizeBytes.buffer).getUint32(0, false);
        if (!Number.isFinite(compressedBitSize) || compressedBitSize <= 0 || compressedBitSize % 8 !== 0) return '';
        const compressedBytes = new Uint8Array(compressedBitSize / 8);
        for (let i = 0; i < compressedBytes.length; i += 1) { const v = nextByte(); if (v === null) return ''; compressedBytes[i] = v; }
        return 解码UTF8(unzlibSync(compressedBytes)).trim();
    } catch { return ''; } finally { if (objectUrl) URL.revokeObjectURL(objectUrl); }
};

// ==================== NovelAI Metadata ====================

const 从PNG原始字节搜索NovelAI元数据 = (pngBytes: Uint8Array): { 正面提示词: string; 负面提示词: string; 参数?: PNG解析参数结构; 原始元数据: string } | null => {
    const rawText = 解码Latin1(pngBytes); if (!rawText) return null;
    for (const marker of ['"request_type":"PromptGenerateRequest"', '"request_type": "PromptGenerateRequest"', '"signed_hash"', '"v4_negative_prompt"', '"extra_passthrough_testing"']) {
        const mi = rawText.indexOf(marker); if (mi < 0) continue;
        let bi = rawText.lastIndexOf('{', mi); let attempts = 0;
        while (bi >= 0 && attempts < 12) { const c = 提取平衡JSON对象(rawText, bi); if (c) { const p = 解析NovelAI注释JSON(c); if (p?.正面提示词) return { 正面提示词: p.正面提示词, 负面提示词: p.负面提示词, 参数: p.参数, 原始元数据: c }; } bi = rawText.lastIndexOf('{', bi - 1); attempts += 1; }
    }
    return null;
};

const 尝试解析NovelAI注释文本 = (rawText: string): { 正面提示词: string; 负面提示词: string; 参数?: PNG解析参数结构 } | null => {
    const direct = 解析NovelAI注释JSON(rawText); if (direct) return direct;
    if (!rawText) return null; const fb = rawText.indexOf('{'); if (fb < 0) return null;
    const c = 提取平衡JSON对象(rawText, fb); return c ? 解析NovelAI注释JSON(c) : null;
};

const 提取LoRA列表 = (text: string): PNG解析参数结构['LoRA列表'] => {
    const matches = Array.from((text || '').matchAll(/<lora:([^:>]+)(?::([\d.]+))?>/gi));
    if (!matches.length) return undefined;
    const items: Array<{ 名称: string; 权重?: number }> = [];
    for (const m of matches) { const n = (m?.[1] || '').trim(); if (!n) continue; items.push({ 名称: n, 权重: m?.[2] ? Number(m[2]) : undefined }); }
    return items.length ? items : undefined;
};

const 读取有限数字 = (v: unknown): number | undefined => { if (typeof v === 'number' && Number.isFinite(v)) return v; if (typeof v === 'string' && v.trim()) { const p = Number(v); if (Number.isFinite(p)) return p; } return undefined; };
const 读取布尔值 = (v: unknown): boolean | undefined => { if (typeof v === 'boolean') return v; if (typeof v === 'string') { const n = v.trim().toLowerCase(); if (n === 'true') return true; if (n === 'false') return false; } return undefined; };

const 读取V4提示结构 = (v: unknown): PNG解析参数结构['V4正向提示'] | undefined => {
    if (!v || typeof v !== 'object') return undefined; const s = v as Record<string, unknown>;
    const cap = s.caption && typeof s.caption === 'object' ? s.caption as Record<string, unknown> : null;
    const cc = Array.isArray(cap?.char_captions) ? cap.char_captions.filter((x): x is string | Record<string, unknown> => (typeof x === 'string' && x.trim().length > 0) || Boolean(x) && typeof x === 'object') : [];
    const r = { useCoords: 读取布尔值(s.use_coords), useOrder: 读取布尔值(s.use_order), legacyUc: 读取布尔值(s.legacy_uc), characterCaptions: cc.length ? cc : undefined };
    return Object.values(r).some((x) => x !== undefined) ? r : undefined;
};

const 解析NovelAI注释JSON = (rawText: string): { 正面提示词: string; 负面提示词: string; 参数?: PNG解析参数结构 } | null => {
    if (!rawText) return null; let p: any; try { p = JSON.parse(rawText); } catch { return null; }
    if (!p || typeof p !== 'object') return null;
    const 正面 = typeof p.prompt === 'string' ? p.prompt.trim() : '';
    const 负面 = typeof p.uc === 'string' ? p.uc.trim() : (typeof p.negative_prompt === 'string' ? p.negative_prompt.trim() : '');
    if (!正面 && !负面) return null;
    const params: PNG解析参数结构 = {
        采样器: typeof p.sampler === 'string' ? p.sampler.trim() : undefined,
        噪声计划: (typeof p.noise_schedule === 'string' ? p.noise_schedule.trim() : '') || undefined,
        步数: Number.isFinite(p.steps) ? Math.floor(p.steps) : undefined,
        CFG强度: Number.isFinite(p.scale ?? p.cfg_scale ?? p.cfg) ? (p.scale ?? p.cfg_scale ?? p.cfg) : undefined,
        CFG重缩放: 读取有限数字(p.cfg_rescale ?? p.prompt_guidance_rescale),
        反向提示引导强度: 读取有限数字(p.uncond_scale),
        ClipSkip: Number.isFinite(p.clip_skip ?? p.clipSkip) ? Math.floor(p.clip_skip ?? p.clipSkip) : undefined,
        宽度: (() => { const w = 读取有限数字(p.width); return w ? Math.floor(w) : undefined; })(),
        高度: (() => { const h = 读取有限数字(p.height); return h ? Math.floor(h) : undefined; })(),
        随机种子: (() => { const s = 读取有限数字(p.seed); return s ? Math.floor(s) : undefined; })(),
        SMEA: 读取布尔值(p.sm), SMEA动态: 读取布尔值(p.sm_dyn), 动态阈值: 读取布尔值(p.dynamic_thresholding),
        动态阈值百分位: 读取有限数字(p.dynamic_thresholding_percentile), 动态阈值模拟CFG: 读取有限数字(p.dynamic_thresholding_mimic_scale),
        高Sigma跳过CFG: 读取有限数字(p.skip_cfg_above_sigma), 低Sigma跳过CFG: 读取有限数字(p.skip_cfg_below_sigma),
        偏好布朗噪声: 读取布尔值(p.prefer_brownian), Euler祖先采样Bug兼容: 读取布尔值(p.deliberate_euler_ancestral_bug),
        精细细节增强: 读取布尔值(p.explike_fine_detail), 最小化Sigma无穷: 读取布尔值(p.minimize_sigma_inf),
        模型: typeof p.model === 'string' ? p.model.trim() : undefined,
        V4正向提示: 读取V4提示结构(p.v4_prompt), V4负向提示: 读取V4提示结构(p.v4_negative_prompt),
        原始参数: JSON.parse(JSON.stringify(p)) as Record<string, unknown>,
        LoRA列表: 提取LoRA列表(正面)
    };
    return { 正面提示词: 正面, 负面提示词: 负面, 参数: params };
};

// ==================== SD Parameter Parsing ====================

const 解析SD参数文本 = (rawText: string): { 正面提示词: string; 负面提示词: string; 参数?: PNG解析参数结构 } => {
    const lines = (rawText || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const mi = lines.findIndex((l) => /Steps\s*:\s*\d+/i.test(l) || /Sampler\s*:/i.test(l));
    const metaLine = mi >= 0 ? lines[mi] : '';
    const textLines = mi >= 0 ? lines.slice(0, mi) : lines;
    const ni = textLines.findIndex((l) => /^negative prompt\s*:/i.test(l));
    const 正面 = ni >= 0 ? textLines.slice(0, ni).join('\n').trim() : textLines.join('\n').trim();
    const 负面 = ni >= 0 ? textLines.slice(ni).join('\n').replace(/^negative prompt\s*:/i, '').trim() : '';
    const mp: Record<string, string> = {};
    if (metaLine) metaLine.replace(/([^:]+):\s*([^,]+)(?:,|$)/g, (_, k, v) => { const kk = String(k || '').trim(); if (kk) mp[kk] = String(v || '').trim(); return ''; });
    const rm = (pats: RegExp[]): string => { const e = Object.entries(mp).find(([k]) => pats.some((r) => r.test(k))); return e?.[1]?.trim() || ''; };
    const 解析参数: PNG解析参数结构 = {
        采样器: rm([/^Sampler$/i]) || undefined,
        步数: (() => { const s = Number(rm([/^Steps$/i])); return Number.isFinite(s) ? Math.floor(s) : undefined; })(),
        CFG强度: (() => { const c = Number(rm([/^CFG scale$/i, /^CFG$/i])); return Number.isFinite(c) ? c : undefined; })(),
        ClipSkip: (() => { const c = Number(rm([/^Clip skip$/i])); return Number.isFinite(c) ? Math.floor(c) : undefined; })(),
        模型: rm([/^Model$/i]) || undefined, LoRA列表: 提取LoRA列表(正面)
    };
    const hs = Number(rm([/^Hires upscale$/i])); const hst = Number(rm([/^Hires steps$/i]));
    const hd = Number(rm([/^Denoising strength$/i])); const hu = rm([/^Hires upscaler$/i]);
    if (Number.isFinite(hs) || Number.isFinite(hst) || Number.isFinite(hd) || hu) { 解析参数.Hires修复 = { 放大倍数: Number.isFinite(hs) ? hs : undefined, 步数: Number.isFinite(hst) ? Math.floor(hst) : undefined, 放大器: hu || undefined, 去噪强度: Number.isFinite(hd) ? hd : undefined }; }
    const adm = rm([/^ADetailer model/i]); const adp = rm([/^ADetailer prompt/i]); const adn = rm([/^ADetailer negative prompt/i]);
    if (adm || adp || adn) { 解析参数.ADetailer = { 模型: adm || undefined, 正向提示词: adp || undefined, 负向提示词: adn || undefined }; }
    return { 正面提示词: 正面, 负面提示词: 负面, 参数: 解析参数 };
};

// ==================== Main Parser ====================

export const 解析PNG字节元数据 = (pngBytes: Uint8Array, 额外NovelAI注释文本 = ''): PNG元数据解析结果 => {
    const 标签映射 = { ...解析PNGExif元数据(pngBytes), ...解析PNG文本元数据(pngBytes) };
    const parametersText = 读取元数据字段(标签映射, ['parameters', 'Parameters']);
    const commentText = 读取元数据字段(标签映射, ['comment', 'Comment', 'UserComment', 'XPComment']);
    const descriptionText = 读取元数据字段(标签映射, ['description', 'Description', 'ImageDescription']);
    for (const candidate of [commentText, 额外NovelAI注释文本].filter((x): x is string => Boolean(x && x.trim()))) {
        const p = 尝试解析NovelAI注释文本(candidate); if (!p) continue;
        return { 来源: 'novelai', 正面提示词: p.正面提示词 || descriptionText || '', 负面提示词: p.负面提示词 || '', 参数: p.参数, 原始元数据: candidate || descriptionText || JSON.stringify(标签映射, null, 2), 元数据标签: Object.keys(标签映射).length > 0 ? 标签映射 : undefined };
    }
    const raw = 从PNG原始字节搜索NovelAI元数据(pngBytes);
    if (raw) return { 来源: 'novelai', 正面提示词: raw.正面提示词 || descriptionText || '', 负面提示词: raw.负面提示词 || '', 参数: raw.参数, 原始元数据: raw.原始元数据 || commentText || descriptionText || JSON.stringify(标签映射, null, 2), 元数据标签: Object.keys(标签映射).length > 0 ? 标签映射 : undefined };
    if (parametersText) { const p = 解析SD参数文本(parametersText); return { 来源: 'sd_webui', 正面提示词: p.正面提示词, 负面提示词: p.负面提示词, 参数: p.参数, 原始元数据: parametersText, 元数据标签: Object.keys(标签映射).length > 0 ? 标签映射 : undefined }; }
    const fb = descriptionText || commentText || '';
    return { 来源: 'unknown', 正面提示词: fb, 负面提示词: '', 参数: fb ? { LoRA列表: 提取LoRA列表(fb) } : undefined, 原始元数据: fb || JSON.stringify(标签映射, null, 2), 元数据标签: Object.keys(标签映射).length > 0 ? 标签映射 : undefined };
};

export const 解析PNG文件元数据 = async (file: File): Promise<PNG元数据解析结果> => {
    const buffer = await file.arrayBuffer(); const pngBytes = new Uint8Array(buffer);
    const stealth = await 从PNG隐写Alpha提取NovelAI文本(file);
    return 解析PNG字节元数据(pngBytes, stealth);
};
