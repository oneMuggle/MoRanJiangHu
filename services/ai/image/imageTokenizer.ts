import type { 角色锚点结构, 图片词组序列化策略类型 } from '../../../models/system';
import type { 场景角色锚点输入 } from './imageTasksTypes';

type 结构化角色词组片段 = {
    名称: string;
    内容: string;
};

type 结构化词组结果 = {
    基础: string;
    角色列表: 结构化角色词组片段[];
};

const 提取平衡JSON对象 = (text: string, startIndex: number): string => {
    if (!text || startIndex < 0 || text[startIndex] !== '{') return '';
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = startIndex; i < text.length; i += 1) {
        const ch = text[i];
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === '"') {
                inString = false;
            }
            continue;
        }
        if (ch === '"') {
            inString = true;
            continue;
        }
        if (ch === '{') {
            depth += 1;
            continue;
        }
        if (ch === '}') {
            depth -= 1;
            if (depth === 0) {
                return text.slice(startIndex, i + 1);
            }
        }
    }
    return '';
};

const 解析可能是JSON字符串 = (text: string): unknown | null => {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

const 提取图片生成结果 = (payload: unknown): { 图片URL?: string; 本地路径?: string; 原始响应?: string } | null => {
    if (!payload || typeof payload !== 'object') return null;

    const 读取图片字段 = (value: unknown): { 图片URL?: string; 本地路径?: string } | null => {
        if (!value) return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return null;
            if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
                return { 图片URL: trimmed };
            }
            if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 64) {
                return { 图片URL: `data:image/png;base64,${trimmed.replace(/\s+/g, '')}` };
            }
            return { 本地路径: trimmed };
        }
        if (typeof value === 'object') {
            const obj = value as Record<string, unknown>;
            const url = typeof obj.url === 'string' ? obj.url.trim() : '';
            const path = typeof obj.path === 'string' ? obj.path.trim() : (typeof obj.local_path === 'string' ? obj.local_path.trim() : '');
            const b64 = typeof obj.b64_json === 'string'
                ? obj.b64_json.trim()
                : (typeof obj.base64 === 'string' ? obj.base64.trim() : (typeof obj.image_base64 === 'string' ? obj.image_base64.trim() : (typeof obj.image === 'string' ? obj.image.trim() : '')));
            if (url) return { 图片URL: url };
            if (b64) return { 图片URL: `data:image/png;base64,${b64.replace(/\s+/g, '')}` };
            if (path) return { 本地路径: path };
        }
        return null;
    };

    const obj = payload as Record<string, unknown>;
    const candidates = [
        obj?.data?.[0],
        obj?.images?.[0],
        obj?.output?.[0],
        obj?.result,
        obj?.image,
        obj?.url,
        obj?.path,
        obj
    ];

    for (const candidate of candidates) {
        const hit = 读取图片字段(candidate);
        if (hit) return hit;
    }

    return null;
};

export const NovelAI隐写PNG魔术字符串 = 'stealth_pngcomp';
export const NovelAI隐写PNG最大像素数 = 4096 * 4096;

export const 清理生图词组输出 = (rawText: string): string => {
    return (rawText || '')
        .replace(/^```(?:text|markdown|json)?\s*/i, '')
        .replace(/```$/i, '')
        .replace(/^【?生图词组】?[:：]?/i, '')
        .trim();
};

export const 按逗号拆分提示词 = (text: string): string[] => (
    (text || '')
        .replace(/\r?\n+/g, ', ')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
);

const 提取权重组内部提示词 = (token: string): string[] => {
    const source = (token || '').trim();
    if (!source.includes('::')) return [];
    const start = source.indexOf('::');
    const end = source.lastIndexOf('::');
    if (start < 0 || end <= start + 2) return [];
    return 按逗号拆分提示词(source.slice(start + 2, end));
};

const 规范化提示词键 = (token: string): string => (
    (token || '')
        .trim()
        .toLowerCase()
        .replace(/^\d+(?:\.\d+)?::/g, '')
        .replace(/::$/g, '')
        .replace(/^[([{<]+|[)\]}>]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim()
);

const 按提示词单元拆分 = (text: string): string[] => {
    const source = (text || '').replace(/\r?\n+/g, ', ').trim();
    if (!source) return [];
    const tokens: string[] = [];
    let current = '';
    let index = 0;
    let weightDepth = 0;
    while (index < source.length) {
        const ch = source[index];
        const nextTwo = source.slice(index, index + 2);
        if (nextTwo === '::') {
            weightDepth = weightDepth === 0 ? 1 : 0;
            current += nextTwo;
            index += 2;
            continue;
        }
        if (ch === ',' && weightDepth === 0) {
            const trimmed = current.trim();
            if (trimmed) tokens.push(trimmed);
            current = '';
            index += 1;
            continue;
        }
        current += ch;
        index += 1;
    }
    const tail = current.trim();
    if (tail) tokens.push(tail);
    return tokens;
};

export const 去重提示词片段 = (tokens: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    tokens.forEach((token) => {
        const normalized = token.replace(/^[\-*•\s]+/, '').trim();
        if (!normalized) return;
        const key = normalized.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        result.push(normalized);
    });
    return result;
};

const 合并并去重提示词单元 = (...parts: Array<string | undefined>): string[] => {
    const result: string[] = [];
    const seenKeys = new Set<string>();
    const seenTokens = new Set<string>();
    parts.forEach((part) => {
        按提示词单元拆分((part || '').trim()).forEach((token) => {
            const normalizedToken = token.trim();
            if (!normalizedToken) return;
            const tokenKey = normalizedToken.toLowerCase();
            if (seenTokens.has(tokenKey)) return;

            const childTokens = 提取权重组内部提示词(normalizedToken);
            const keys = (childTokens.length > 0 ? childTokens : [normalizedToken])
                .map(规范化提示词键)
                .filter(Boolean);
            if (keys.length > 0 && keys.every((key) => seenKeys.has(key))) {
                return;
            }

            seenTokens.add(tokenKey);
            keys.forEach((key) => seenKeys.add(key));
            result.push(normalizedToken);
        });
    });
    return result;
};

export const 合并正向提示词片段 = (...parts: Array<string | undefined>): string => {
    const tokens = 合并并去重提示词单元(...parts);
    return 规范化Artist标签大小写(tokens.join(', '));
};

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

export const 规范化Artist标签大小写 = (rawText: string): string => (
    (rawText || '').replace(/\bArtist\s*:/g, 'artist:')
);

const 移除全部结构标签 = (rawText: string): string => (
    (rawText || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
);

const 移除序号角色名称前缀 = (rawText: string): string => (
    (rawText || '')
        .replace(/(^|\n)\s*\[\d+\]\s*[^|\n<>]{1,80}\|/g, '$1')
        .trim()
);

const 移除思考标签块 = (rawText: string): string => (
    (rawText || '')
        .replace(/<\s*thinking\s*>[\s\S]*?<\s*\/\s*thinking\s*>/gi, '')
        .replace(/<\s*think\s*>[\s\S]*?<\s*\/\s*think\s*>/gi, '')
        .trim()
);

export const 转换NAI括号权重语法 = (rawText: string): string => {
    let output = rawText || '';
    for (let i = 0; i < 8; i += 1) {
        const next = output.replace(/\(([^()]+?)\s*:\s*(-?\d+(?:\.\d+)?)\)/g, (_match, content, weight) => {
            const cleanedContent = 清理生图词组输出(String(content || ''));
            const cleanedWeight = String(weight || '').trim();
            if (!cleanedContent || !cleanedWeight) return '';
            return `${cleanedWeight}::${cleanedContent}::`;
        });
        if (next === output) break;
        output = next;
    }
    for (let i = 0; i < 8; i += 1) {
        const next = output.replace(/\(\s*(-?\d+(?:\.\d+)?)::([\s\S]*?)::\s*\)/g, (_match, weight, content) => {
            const cleanedContent = 清理生图词组输出(String(content || ''));
            const cleanedWeight = String(weight || '').trim();
            if (!cleanedContent || !cleanedWeight) return '';
            return `${cleanedWeight}::${cleanedContent}::`;
        });
        if (next === output) break;
        output = next;
    }
    return 规范化Artist标签大小写(output);
};

export const 清洗NAI脏权重语法 = (rawText: string): string => {
    let output = rawText || '';

    for (let i = 0; i < 8; i += 1) {
        const next = output.replace(
            /(-?\d+(?:\.\d+)?)::\s*([^:]+?)\s*,\s*::\s*(-?\d+(?:\.\d+)?)::\s*([^:]+?)::/g,
            (_match, leftWeight, leftContent, rightWeight, rightContent) => {
                const normalizedLeftWeight = String(leftWeight || '').trim();
                const normalizedRightWeight = String(rightWeight || '').trim();
                const normalizedLeftContent = 清理生图词组输出(String(leftContent || ''));
                const normalizedRightContent = 清理生图词组输出(String(rightContent || ''));
                const parts = [
                    normalizedLeftWeight && normalizedLeftContent ? `${normalizedLeftWeight}::${normalizedLeftContent}::` : '',
                    normalizedRightWeight && normalizedRightContent ? `${normalizedRightWeight}::${normalizedRightContent}::` : ''
                ].filter(Boolean);
                return parts.join(', ');
            }
        );
        if (next === output) break;
        output = next;
    }

    for (let i = 0; i < 8; i += 1) {
        const next = output.replace(
            /,\s*::\s*(-?\d+(?:\.\d+)?)::\s*([^:]+?)::/g,
            (_match, weight, content) => {
                const normalizedWeight = String(weight || '').trim();
                const normalizedContent = 清理生图词组输出(String(content || ''));
                if (!normalizedWeight || !normalizedContent) return '';
                return `, ${normalizedWeight}::${normalizedContent}::`;
            }
        );
        if (next === output) break;
        output = next;
    }

    for (let i = 0; i < 8; i += 1) {
        const next = output.replace(
            /(-?\d+(?:\.\d+)?)::\s*([^:]+?)\s*,\s*::/g,
            (_match, weight, content) => {
                const normalizedWeight = String(weight || '').trim();
                const normalizedContent = 清理生图词组输出(String(content || ''));
                if (!normalizedWeight || !normalizedContent) return '';
                return `${normalizedWeight}::${normalizedContent}::, `;
            }
        );
        if (next === output) break;
        output = next;
    }

    output = output
        .replace(/,\s*,+/g, ', ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+,/g, ',')
        .trim();

    return output;
};

const 截取最后场景判定之后 = (rawText: string): string => {
    const source = rawText || '';
    const regex = /<\s*场景判定\s*>/gi;
    let lastIndex = -1;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(source))) {
        lastIndex = match.index;
    }
    return lastIndex >= 0 ? source.slice(lastIndex) : source;
};

const 提取判定说明后词组 = (rawText: string): string => {
    const source = rawText || '';
    const regex = /<\s*\/\s*判定说明\s*>/gi;
    let lastEndIndex = -1;
    let match: RegExpExecArray | null = null;
    while ((match = regex.exec(source))) {
        lastEndIndex = match.index + match[0].length;
    }
    if (lastEndIndex < 0) return '';
    const tail = source.slice(lastEndIndex).trim();
    if (!tail) return '';
    return tail
        .replace(/<\s*\/\s*词组\s*>/gi, '')
        .replace(/<\s*词组\s*>/gi, '')
        .replace(/<\s*\/\s*生图词组\s*>/gi, '')
        .replace(/<\s*生图词组\s*>/gi, '')
        .replace(/[<>/]/g, '')
        .trim();
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
        roles.push({
            名称: safeName,
            内容: safeContent
        });
    }
    return roles;
};

const 解析结构化词组结果 = (rawText: string): 结构化词组结果 | null => {
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
        if (
            序号角色.length > 0
            && !attrs.名称
            && !attrs.name
            && !attrs.role
            && !attrs.角色
        ) {
            序号角色.forEach((item) => {
                角色列表.push(item);
                roleIndex += 1;
            });
            continue;
        }
        const 名称 = (attrs.名称 || attrs.name || attrs.role || attrs.角色 || `角色${roleIndex + 1}`).trim();
        const 内容 = 清理生图词组输出(原始内容);
        if (名称 || 内容) {
            角色列表.push({ 名称, 内容 });
            roleIndex += 1;
        }
    }
    if (角色列表.length <= 0) {
        const 序号角色列表 = 解析序号角色列表(提取最后一个标签文本(source, '角色'));
        if (序号角色列表.length > 0) {
            角色列表.push(...序号角色列表);
        }
    }
    if (基础 || 角色列表.length > 0) {
        return {
            基础: 清理生图词组输出(基础),
            角色列表
        };
    }

    const bracketSource = source.replace(/\r\n/g, '\n');
    const blockRegex = /【\s*(基础|角色(?:\s*[:：]\s*([^\]】]+))?)\s*】([\s\S]*?)(?=【\s*(?:基础|角色)|$)/g;
    let blockMatch: RegExpExecArray | null = null;
    let bracketBase = '';
    const bracketRoles: 结构化角色词组片段[] = [];
    while ((blockMatch = blockRegex.exec(bracketSource))) {
        const section = (blockMatch[1] || '').trim();
        const roleName = (blockMatch[2] || '').trim();
        const content = 清理生图词组输出(blockMatch[3] || '');
        if (!content) continue;
        if (section.startsWith('基础')) {
            bracketBase = content;
            continue;
        }
        bracketRoles.push({
            名称: roleName || `角色${bracketRoles.length + 1}`,
            内容: content
        });
    }
    if (!bracketBase && bracketRoles.length <= 0) return null;
    return {
        基础: bracketBase,
        角色列表: bracketRoles
    };
};

export const 清洗最终主体提示词 = (rawText: string, options?: { isNovelAI?: boolean }): string => {
    const withoutThinking = 移除思考标签块(rawText);
    const 基础段内容 = 提取最后一个标签文本(withoutThinking, '基础');
    const 角色块内容 = 提取最后一个标签文本(withoutThinking, '角色');
    const 序号角色列表 = 解析序号角色列表(角色块内容 || withoutThinking);
    if (序号角色列表.length > 0) {
        const safeBase = 规范化Artist标签大小写(清理生图词组输出(基础段内容 || ''));
        const safeRoles = 序号角色列表
            .map((item) => 规范化Artist标签大小写(清理生图词组输出(item?.内容 || '')))
            .filter(Boolean);
        const mergedStructured = options?.isNovelAI
            ? [safeBase, ...safeRoles].filter(Boolean).join(' | ')
            : [safeBase, ...safeRoles].filter(Boolean).join('; ');
        if (mergedStructured.trim()) {
            return options?.isNovelAI ? 保守补全NAI权重语法(mergedStructured) : mergedStructured.trim();
        }
    }
    const extracted = 提取最后一个标签文本列表(withoutThinking, ['提示词', '词组', '生图词组'])
        || 提取最后一个标签文本(withoutThinking, '基础');
    let finalFallback = withoutThinking;
    if (!extracted) {
        const lines = withoutThinking.split('\n');
        for (let i = lines.length - 1; i >= 0; i -= 1) {
            const line = lines[i].trim();
            if (line && /[,\(\)]/.test(line) && !line.startsWith('**') && !line.includes(':') && line.length > 10) {
                finalFallback = line;
                break;
            }
        }
    }
    const withoutResidualTags = 移除序号角色名称前缀(
        移除全部结构标签(
            (extracted || finalFallback || '')
            .replace(/<\s*\/?\s*提示词\s*>/gi, '')
            .replace(/<\s*\/?\s*词组\s*>/gi, '')
            .replace(/<\s*\/?\s*生图词组\s*>/gi, '')
            .trim()
        )
    );
    const cleaned = 规范化Artist标签大小写(清理生图词组输出(withoutResidualTags));
    if (!cleaned) return '';
    return options?.isNovelAI ? 保守补全NAI权重语法(cleaned) : cleaned;
};

export const 保守补全NAI权重语法 = (rawText: string): string => {
    const cleaned = 清理生图词组输出(
        清洗NAI脏权重语法(
            转换NAI括号权重语法(
                移除思考标签块(rawText)
            )
        )
    );
    if (!cleaned) return '';
    return cleaned;
};

const 推断NAI角色起始标签 = (text: string): string => {
    const source = (text || '').toLowerCase();
    if (!source) return '';
    if (/\b(1woman|woman|adult woman|adult female|female adult)\b/.test(source)) return '1woman';
    if (/\b(1man|man|adult man|adult male|male adult)\b/.test(source)) return '1man';
    if (/\b(1girl|girl|female)\b/.test(source)) return '1girl';
    if (/\b(1boy|boy|male)\b/.test(source)) return '1boy';
    return '';
};

const 是NAI角色起始标签 = (token: string): boolean => (
    /^(?:1girl|1boy|1woman|1man|girl|boy|woman|man)$/iu.test((token || '').trim())
);

const 清理NAI角色段占位词 = (text: string): string => {
    const source = 清理生图词组输出(text)
        .replace(/^\[\d+\]\s*/u, '')
        .replace(/^(?:主体|角色\s*\d+|character\s*\d+|role\s*\d+|subject)\s*[:：\-]?\s*/iu, '')
        .trim();
    if (!source) return '';
    return 去重提示词片段(按逗号拆分提示词(source))
        .map((token) => token.trim())
        .filter(Boolean)
        .filter((token) => !/^(?:主体|角色\s*\d+|character\s*\d+|role\s*\d+|subject)\s*[:：\-]?$/iu.test(token))
        .join(', ');
};

export const 构建角色锚点稳定外观提示词 = (
    anchor: Pick<角色锚点结构, '正面提示词' | '结构化特征'> | null | undefined
): string => {
    const positive = (anchor?.正面提示词 || '').trim();
    const features = anchor?.结构化特征;
    const 过滤镜头动作环境词 = (tokens: string[]): string[] => {
        const deny = /(portrait|close-?up|upper body|waist-?up|full body|cowboy shot|wide shot|mid shot|low angle|high angle|standing|sitting|kneeling|running|jumping|walking|looking at viewer|looking away|from side|from behind|facing viewer|dynamic pose|action pose|background|scenery|environment|landscape|indoors|outdoors|rim light|lighting|sunlight|moonlight|fog|mist|rain|snow|depth of field|composition|framing|rule of thirds|atmospheric haze)/i;
        return tokens.filter((token) => !deny.test(token));
    };
    const 从结构化特征抽取 = (
        keys: Array<keyof NonNullable<角色锚点结构['结构化特征']>>,
        limit = 28
    ): string[] => {
        if (!features) return [];
        const fragments = keys
            .flatMap((key) => (Array.isArray((features as any)?.[key]) ? (features as any)[key] : []))
            .map((item: unknown) => String(item || '').trim())
            .filter(Boolean);
        return 过滤镜头动作环境词(去重提示词片段(fragments)).slice(0, Math.max(0, limit));
    };
    const featureTokens = 从结构化特征抽取([
        '外貌标签',
        '身材标签',
        '胸部标签',
        '发型标签',
        '发色标签',
        '眼睛标签',
        '肤色标签',
        '年龄感标签',
        '服装基底标签',
        '特殊特征标签'
    ], 30);
    if (featureTokens.length > 0) return featureTokens.join(', ');
    if (!positive) return '';
    if (/::/.test(positive)) return positive;
    const allow = /(1girl|1boy|girl|boy|woman|man|female|male|young|adult|teen|hair|eyes?|iris|pupil|eyebrow|eyelash|face|lips?|mouth|nose|skin|complexion|freckle|mole|beauty mark|scar|tattoo|makeup|ear|neck|body|figure|bust|breast|chest|waist|hip|thigh|outfit|robe|hanfu|armor|dress|clothing|sleeve|glove|stocking|boots|pants|skirt|kimono|cape|cloak|belt|jewelry|earring|hairpin|ornament|jade|embroidery|weapon|sword|blade|saber|fan|staff)/i;
    const deny = /(portrait|close-?up|upper body|full body|waist-?up|cowboy shot|wide shot|mid shot|low angle|high angle|standing|sitting|kneeling|running|jumping|walking|looking at viewer|looking away|from side|from behind|background|scenery|environment|landscape|indoors|outdoors|rim light|lighting|sunlight|moonlight|fog|mist|rain|snow|depth of field|composition|framing|rule of thirds)/i;
    return 过滤镜头动作环境词(去重提示词片段(按逗号拆分提示词(positive)))
        .filter((token) => allow.test(token) && !deny.test(token))
        .slice(0, 28)
        .join(', ');
};

export const 构建角色锚点注入提示词 = (
    anchor: Pick<角色锚点结构, '正面提示词' | '结构化特征'> | null | undefined,
    options: { 构图: '头像' | '半身' | '立绘' | '场景' | '部位特写'; 部位?: import('../../../models/imageGeneration').香闺秘档部位类型 }
): string => {
    const positive = (anchor?.正面提示词 || '').trim();
    const features = anchor?.结构化特征;
    const composition = options.构图;

    const 去除镜头构图词 = (tokens: string[]): string[] => {
        const cameraWords = /(headshot|portrait|upper body|waist-?up|full body|cowboy shot|close-?up|extreme close-?up|wide shot|mid shot|low angle|high angle|standing|sitting|kneeling|running|framing|character sheet|composition|depth of field|rule of thirds|feet included|floor contact|avatar)/i;
        return tokens.filter((token) => !cameraWords.test(token));
    };

    const 从结构化特征挑选 = (
        keys: Array<keyof NonNullable<角色锚点结构['结构化特征']>>,
        limit = 24
    ): string[] => {
        if (!features) return [];
        const fragments = keys
            .flatMap((key) => (Array.isArray((features as any)?.[key]) ? (features as any)[key] : []))
            .map((item: unknown) => String(item || '').trim())
            .filter(Boolean);
        return 去除镜头构图词(去重提示词片段(fragments)).slice(0, Math.max(0, limit));
    };

    const 从原始提示词挑选 = (params: { allow: RegExp; deny: RegExp; limit?: number }): string[] => {
        if (!positive) return [];
        if (/::/.test(positive)) return [];
        const tokens = 去除镜头构图词(去重提示词片段(按逗号拆分提示词(positive)));
        const filtered = tokens.filter((token) => params.allow.test(token) && !params.deny.test(token));
        return filtered.slice(0, Math.max(0, params.limit ?? 24));
    };

    if (composition === '头像') {
        const tokensFromFeatures = 从结构化特征挑选([
            '外貌标签',
            '发型标签',
            '发色标签',
            '眼睛标签',
            '肤色标签',
            '年龄感标签',
            '特殊特征标签'
        ], 20);
        if (tokensFromFeatures.length > 0) return tokensFromFeatures.join(', ');

        const allow = /(1girl|1boy|girl|boy|woman|man|female|male|young|adult|teen|hair|eyes?|iris|pupil|eyebrow|eyelash|face|lips?|mouth|nose|skin|complexion|freckle|mole|beauty mark|scar|tattoo|makeup|ear|neck)/i;
        const deny = /(breast|bust|cleavage|waist|hip|thigh|leg|feet|nude|dress|robe|hanfu|armor|outfit|clothing|sleeve|glove|stocking|boots|pants|skirt|kimono|cape|cloak|weapon|sword|background|scenery|environment|landscape)/i;
        return 从原始提示词挑选({ allow, deny, limit: 16 }).join(', ');
    }

    if (composition === '部位特写') {
        const part = options.部位;
        if (part === '胸部') {
            const allow = /(breast|breasts|bust|cup|cleavage|nipple|nipples|areola|chest|skin|complexion|pale|fair|tan|young|adult|teen)/i;
            const deny = /(face|eyes?|hair|lips?|mouth|nose|dress|robe|hanfu|armor|outfit|clothing|upper body|waist|portrait|full body)/i;

            const tokens = 从结构化特征挑选(['胸部标签', '肤色标签', '年龄感标签'], 14)
                .filter((token) => allow.test(token) && !deny.test(token));
            if (tokens.length > 0) return tokens.join(', ');

            return 从原始提示词挑选({ allow, deny, limit: 10 }).join(', ');
        }

        const allow = /(skin|complexion|pale|fair|tan|young|adult|teen)/i;
        const deny = /(face|eyes?|hair|dress|robe|hanfu|armor|outfit|clothing|upper body|waist|portrait|full body|standing|sitting|kneeling|feet)/i;

        const safe = 从结构化特征挑选(['肤色标签', '年龄感标签'], 8)
            .filter((token) => allow.test(token) && !deny.test(token));
        if (safe.length > 0) return safe.join(', ');

        return 从原始提示词挑选({ allow, deny, limit: 6 }).join(', ');
    }

    return positive;
};

const 规范化角色名 = (name: string): string => (name || '').toLowerCase().replace(/\s+/g, '').trim();

const 确保NAI角色段起始标签 = (text: string): string => {
    const cleaned = 清理NAI角色段占位词(text);
    if (!cleaned) return '';
    const tokens = 去重提示词片段(按逗号拆分提示词(cleaned));
    if (tokens.length <= 0) return '';
    const inferredLead = 推断NAI角色起始标签(cleaned);
    const normalizedTokens = inferredLead
        ? 去重提示词片段([inferredLead, ...tokens.filter((token) => !是NAI角色起始标签(token))])
        : tokens;
    return normalizedTokens.join(', ');
};

export const 构建NAI基础人数标签 = (segments: string[]): string[] => {
    const counts = { '1girl': 0, '1boy': 0, '1woman': 0, '1man': 0 } as Record<string, number>;
    segments.forEach((segment) => {
        const lead = 推断NAI角色起始标签(segment);
        if (lead && counts[lead] !== undefined) counts[lead] += 1;
    });
    const labels: string[] = [];
    if (counts['1girl'] > 0) labels.push(counts['1girl'] > 1 ? `${counts['1girl']}girls` : '1girl');
    if (counts['1boy'] > 0) labels.push(counts['1boy'] > 1 ? `${counts['1boy']}boys` : '1boy');
    if (counts['1woman'] > 0) labels.push(counts['1woman'] > 1 ? `${counts['1woman']}women` : '1woman');
    if (counts['1man'] > 0) labels.push(counts['1man'] > 1 ? `${counts['1man']}men` : '1man');
    return labels;
};

const 补全NAI基础人数标签 = (base: string, segments: string[]): string => {
    const cleanedBase = 清理生图词组输出(base);
    if (/\b\d+\s*(?:girls?|boys?|women|men)\b/i.test(cleanedBase)) return cleanedBase;
    const countLabels = 构建NAI基础人数标签(segments);
    if (countLabels.length <= 0) return cleanedBase;
    return 合并正向提示词片段(countLabels.join(', '), cleanedBase);
};

const 构建结构化角色段列表 = (
    roles: 结构化角色词组片段[],
    anchors: 场景角色锚点输入[]
): Array<结构化角色词组片段 & { 锚点?: 场景角色锚点输入 }> => {
    const safeRoles = Array.isArray(roles) ? roles : [];
    const safeAnchors = Array.isArray(anchors) ? anchors : [];
    const usedAnchorIndexes = new Set<number>();
    const resolved = safeRoles.map((role, roleIndex) => {
        const roleName = (role?.名称 || '').trim();
        const roleNameKey = 规范化角色名(roleName);
        let matchedAnchorIndex = safeAnchors.findIndex((anchor, index) => (
            !usedAnchorIndexes.has(index)
            && roleNameKey
            && (
                规范化角色名(anchor?.名称 || '') === roleNameKey
                || 规范化角色名(anchor?.名称 || '').includes(roleNameKey)
                || roleNameKey.includes(规范化角色名(anchor?.名称 || ''))
            )
        ));
        if (matchedAnchorIndex < 0 && safeAnchors.length === 1 && !usedAnchorIndexes.has(0)) {
            matchedAnchorIndex = 0;
        }
        if (matchedAnchorIndex < 0 && roleIndex < safeAnchors.length && !usedAnchorIndexes.has(roleIndex)) {
            matchedAnchorIndex = roleIndex;
        }
        if (matchedAnchorIndex >= 0) usedAnchorIndexes.add(matchedAnchorIndex);
        return {
            名称: roleName || safeAnchors[matchedAnchorIndex]?.名称 || `角色${roleIndex + 1}`,
            内容: (role?.内容 || '').trim(),
            锚点: matchedAnchorIndex >= 0 ? safeAnchors[matchedAnchorIndex] : undefined
        };
    });
    safeAnchors.forEach((anchor, index) => {
        if (usedAnchorIndexes.has(index)) return;
        resolved.push({
            名称: (anchor?.名称 || '').trim() || `角色${resolved.length + 1}`,
            内容: '',
            锚点: anchor
        });
    });
    return resolved.filter((item) => (item?.名称 || item?.内容 || item?.锚点?.正面提示词 || '').trim());
};

const 序列化结构化词组结果 = (
    structured: 结构化词组结果,
    strategy: 图片词组序列化策略类型,
    anchors: 场景角色锚点输入[]
): string => {
    const 基础 = (structured?.基础 || '').trim();
    const 角色段列表 = 构建结构化角色段列表(structured?.角色列表 || [], anchors);
    if (strategy === 'nai_character_segments') {
        const 序列化角色段 = 角色段列表
            .map((role) => 确保NAI角色段起始标签(合并正向提示词片段(构建角色锚点稳定外观提示词(role.锚点), role.内容)))
            .map((text) => (text ? 保守补全NAI权重语法(text) : ''))
            .filter(Boolean);
        if (序列化角色段.length <= 0) return 保守补全NAI权重语法(基础);
        const 基础段 = 保守补全NAI权重语法(补全NAI基础人数标签(基础, 序列化角色段));
        return [基础段, ...序列化角色段].filter(Boolean).join(' | ');
    }

    const 角色描述段 = 角色段列表
        .map((role, index) => {
            const text = 合并正向提示词片段(构建角色锚点稳定外观提示词(role.锚点), role.内容);
            if (!text) return '';
            const label = (role.名称 || '').trim() || `Character ${index + 1}`;
            return `${label}: ${text}`;
        })
        .filter(Boolean);

    if (strategy === 'gemini_structured' || strategy === 'grok_structured') {
        const baseLabel = strategy === 'grok_structured' ? 'Scene staging' : 'Base scene';
        return [
            基础 ? `${baseLabel}: ${基础}` : '',
            ...角色描述段
        ].filter(Boolean).join('; ');
    }

    return 合并正向提示词片段(
        基础,
        ...角色描述段
    );
};

export const 序列化词组转化器输出 = (
    rawText: string,
    options?: {
        strategy?: 图片词组序列化策略类型;
        roleAnchors?: 场景角色锚点输入[];
    }
): string => {
    const strategy = options?.strategy || 'flat';
    const roleAnchors = Array.isArray(options?.roleAnchors) ? options?.roleAnchors : [];
    const sanitizedRawText = 移除思考标签块(rawText);
    const structured = 解析结构化词组结果(sanitizedRawText);
    if (structured) {
        return 序列化结构化词组结果(structured, strategy, roleAnchors);
    }
    const cleaned = 清洗最终主体提示词(sanitizedRawText, {
        isNovelAI: strategy === 'nai_character_segments'
    });
    if (!cleaned) return '';
    if (strategy === 'flat') return cleaned;
    return 序列化结构化词组结果({
        基础: cleaned,
        角色列表: []
    }, strategy, roleAnchors);
};

export const 归一化单段词组转化器输出 = (
    rawText: string,
    options?: { isNovelAI?: boolean }
): string => {
    const sanitizedRawText = 移除思考标签块(rawText);
    const structured = 解析结构化词组结果(sanitizedRawText);
    const merged = structured
        ? 合并正向提示词片段(
            structured.基础,
            ...((structured.角色列表 || []).map((role) => 清理NAI角色段占位词(role?.内容 || '')))
        )
        : 清洗最终主体提示词(sanitizedRawText, { isNovelAI: options?.isNovelAI });
    return options?.isNovelAI
        ? 保守补全NAI权重语法(merged)
        : 清理生图词组输出(merged);
};

export const 解析场景词组响应 = (rawText: string): {
    场景类型: '场景快照' | '风景场景';
    场景判定说明: string;
    生图词组: string;
} => {
    const mainPayload = 截取最后场景判定之后(rawText);
    const 判定文本 = 提取最后一个标签文本列表(mainPayload, ['场景判定', '判定']);
    const 场景类型文本 = 提取最后一个标签文本列表(mainPayload, ['场景类型', '输出类型', '模式']);
    const 判定说明 = 提取最后一个标签文本列表(mainPayload, ['判定说明', '说明', '理由'])
        .replace(/^[•\-]\s*/gm, '')
        .trim();
    const 结构化词组块 = 提取最后一个标签完整块(mainPayload, '提示词结构');
    const 词组标签内容 = 提取最后一个标签文本列表(mainPayload, ['词组', '生图词组']);
    const 生图词组 = 结构化词组块
        || 词组标签内容
        || 提取判定说明后词组(mainPayload)
        || 清理生图词组输出(mainPayload);
    const combined = `${判定文本}\n${场景类型文本}\n${判定说明}`;
    const 明确不适合快照 = /不适合场景快照|风景场景|风景|景观|山水|landscape/i.test(combined);
    const 明确适合快照 = /适合场景快照|场景快照/i.test(`${判定文本}\n${场景类型文本}`) && !/不适合/i.test(`${判定文本}\n${场景类型文本}`);
    const 场景类型: '场景快照' | '风景场景' = 明确适合快照 && !明确不适合快照
        ? '场景快照'
        : '风景场景';
    return {
        场景类型,
        场景判定说明: 判定说明 || (场景类型 === '风景场景'
            ? '当前正文缺少足够稳定的单帧画面证据，已优先转为风景背景镜头。'
            : '当前正文具备明确地点、空间关系与可视化细节，可在背景优先前提下生成场景快照。'),
        生图词组
    };
};

export {
    提取平衡JSON对象,
    解析可能是JSON字符串,
    提取图片生成结果
};
