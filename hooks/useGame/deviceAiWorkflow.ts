import type { 当前可用接口结构 } from '../../utils/apiConfig';
import type { 接口设置结构 } from '../../models/system';
import type { DeviceMode, MobileApp, DeviceMessage, DeviceContact, DeviceGroup } from '../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../models/eraDevice';
import { getEraCategory } from '../../components/features/MobileDevice/eraStyles/EraStyleSelector';
import { 构建子纪元里模式注入, LiModeIntensity } from '../../prompts/runtime/eraLiMode';
import {
    type 通用消息,
    规范化文本补全消息链,
    请求模型文本,
} from '../../services/ai/chatCompletionClient';

// ============================================================
// 设备消息 AI 生成工作流
// ============================================================

export interface DeviceMessageGenerationResult {
    messages: DeviceMessage[];
    rawText: string;
}

export interface DeviceMessageOptions {
    eraId: string;
    mode: DeviceMode;
    appType: MobileApp;
    context: {
        当前场景?: string;
        角色名?: string;
        当前位置?: string;
        世界状态?: string;
        额外要求?: string;
    };
    count?: number;
    /** 里模式强度级别 */
    liIntensity?: LiModeIntensity;
}

// ============================================================
// 系统提示词构建
// ============================================================

export function 构建设备消息系统提示词(
    eraId: string,
    mode: DeviceMode,
    appType: MobileApp,
    liIntensity?: LiModeIntensity
): string {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appType, mode) : appType;
    const eraCategory = getEraCategory(eraId);
    const isLiMode = mode === 'li';

    const eraStyleMap: Record<string, string> = {
        ancient: '古代武侠风格，文风古朴，用词雅致，可适当使用文言文句式',
        modern: '近现代风格，语言平实直接，带有时代特色',
        tech: '近未来科技风格，语言简洁高效，可带技术术语',
        holographic: '远未来风格，语言抽象诗意，带有哲学意味',
        consciousness: '后人类意识风格，语言流意识化，模糊边界感',
    };

    const eraStyle = eraStyleMap[eraCategory] || '通用武侠风格';

    const appTypeMap: Record<MobileApp, { 角色: string; 输出格式: string }> = {
        chat: {
            角色: '群聊内容生成器',
            输出格式: 'JSON 数组，每条消息包含 sender（发送者昵称）、content（消息内容）、time（古代时辰格式）',
        },
        news: {
            角色: '江湖资讯撰写者',
            输出格式: 'JSON 数组，每条新闻包含 title（标题）、source（来源）、time（时间）、summary（摘要）、category（分类）、urgent（是否紧急）',
        },
        forum: {
            角色: '论坛帖子生成器',
            输出格式: 'JSON 数组，每个帖子包含 author（作者）、title（标题）、content（正文）、category（分类）、time（时间）、replies（回复数）、views（浏览数）、replyList（回复列表）',
        },
        map: {
            角色: '地理位置描述者',
            输出格式: 'JSON 数组，每个位置包含 name（名称）、type（类型）、description（描述）、distance（距离）',
        },
        contacts: {
            角色: 'NPC 联系人描述者',
            输出格式: 'JSON 数组，每个联系人包含 name（姓名）、relation（关系）、location（位置）、description（简介）',
        },
        album: {
            角色: '图片描述者',
            输出格式: 'JSON 数组，每张图片包含 title（标题）、description（描述）、date（日期）',
        },
        tools: {
            角色: '设备工具描述者',
            输出格式: 'JSON 数组，每个工具包含 name（名称）、description（描述）',
        },
        schedule: {
            角色: '课程表内容生成器',
            输出格式: 'JSON 数组，每门课程包含 name（名称）、location（地点）、teacher（教师）、time（时间段）',
        },
        campus_card: {
            角色: '校园卡消费记录生成器',
            输出格式: 'JSON 数组，每条记录包含 time（时间）、location（地点）、amount（金额）、type（类型）',
        },
        club: {
            角色: '社团活动生成器',
            输出格式: 'JSON 数组，每个活动包含 name（名称）、organizer（组织者）、time（时间）、location（地点）、description（描述）',
        },
        confession: {
            角色: '表白墙内容生成器',
            输出格式: 'JSON 数组，每条包含 author（匿名作者）、title（标题）、content（内容）、time（时间）、reactions（回应数）',
        },
        rules: {
            角色: '校规内容生成器',
            输出格式: 'JSON 数组，每条校规包含 title（标题）、content（内容）、category（分类）、severity（严重程度）',
        },
        hypnosis: {
            角色: '催眠效果描述生成器',
            输出格式: 'JSON 数组，每条包含 target（目标）、effect（效果）、duration（持续时间）、intensity（强度）',
        },
    };

    const appInfo = appTypeMap[appType];

    const parts = [
        `你是一个${eraStyle}的${appInfo.角色}。`,
        `当前设备：${config?.deviceName || '未知设备'}`,
        `当前应用：${appName}`,
        `输出格式：${appInfo.输出格式}`,
        `要求：只输出 JSON 数组，不要其他任何内容。`,
    ];

    if (isLiMode) {
        const liInjection = 构建子纪元里模式注入(eraId, true, liIntensity);
        if (liInjection) {
            parts.push(`\n【里模式设备内容规则】${liInjection}`);
        }
        parts.push('里模式下，内容应更加阴暗、隐秘、带有阴谋色彩。');
    }

    return parts.join('\n');
}

export function 构建设备消息用户提示词(
    options: DeviceMessageOptions,
    count: number
): string {
    const { eraId, appType, mode, context } = options;

    const parts = [
        `请生成 ${count} 条${getAppName(getDeviceConfig(eraId), appType, mode)}的内容。`,
    ];

    if (context.当前场景) parts.push(`当前场景：${context.当前场景}`);
    if (context.角色名) parts.push(`角色名：${context.角色名}`);
    if (context.当前位置) parts.push(`当前位置：${context.当前位置}`);
    if (context.世界状态) parts.push(`世界状态：${context.世界状态}`);
    if (context.额外要求) parts.push(`额外要求：${context.额外要求}`);

    parts.push('请确保内容符合当前时代的语言风格和文化背景。');

    return parts.join('\n');
}

// ============================================================
// AI 消息生成
// ============================================================

function 解析JSON数组(text: string): unknown[] | null {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    try {
        const parsed = JSON.parse(jsonMatch[0]);
        return Array.isArray(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

export async function 生成设备消息(
    options: DeviceMessageOptions,
    apiConfig: 当前可用接口结构,
    settings: 接口设置结构,
    count?: number
): Promise<DeviceMessageGenerationResult> {
    const messageCount = count ?? options.count ?? 5;

    const systemPrompt = 构建设备消息系统提示词(options.eraId, options.mode, options.appType, options.liIntensity);
    const userPrompt = 构建设备消息用户提示词(options, messageCount);

    const messages: 通用消息[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];

    const normalizedMessages = 规范化文本补全消息链(messages);

    try {
        const rawText = await 请求模型文本(
            apiConfig,
            normalizedMessages,
            { temperature: 0.7, responseFormat: 'json_object' }
        );

        const items = 解析JSON数组(rawText);
        if (items) {
            const deviceMessages: DeviceMessage[] = items.map((item: unknown, i: number) => {
                const obj = item as Record<string, unknown>;
                return {
                    id: `ai-msg-${Date.now()}-${i}`,
                    type: options.appType as DeviceMessage['type'],
                    title: (obj.title as string) || getAppName(getDeviceConfig(options.eraId), options.appType, options.mode),
                    content: (obj.content as string) || (obj.summary as string) || '',
                    sender: obj.sender as string | undefined,
                    timestamp: Date.now(),
                    tags: obj.category ? [obj.category as string] : undefined,
                };
            });
            return { messages: deviceMessages, rawText };
        }

        return { messages: [], rawText };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            messages: [],
            rawText: `生成失败: ${errorMessage}`,
        };
    }
}

export async function 生成设备群组(
    eraId: string,
    mode: DeviceMode,
    context: DeviceMessageOptions['context'],
    apiConfig: 当前可用接口结构,
    settings: 接口设置结构,
    count?: number
): Promise<DeviceGroup[]> {
    const options: DeviceMessageOptions = {
        eraId,
        mode,
        appType: 'chat',
        context,
        count: count ?? 5,
    };

    const result = await 生成设备消息(options, apiConfig, settings, count);
    const config = getDeviceConfig(eraId);
    const groupType = config?.deviceForm === 'smartphone' ? 'modern'
        : config?.deviceForm === 'neural_interface' ? 'neural'
        : config?.deviceForm === 'scroll' ? 'tribe'
        : config?.deviceForm === 'hologram' ? 'modern'
        : 'sect';

    return result.messages.map((msg, i) => ({
        id: `ai-group-${Date.now()}-${i}`,
        name: msg.title || msg.sender || `群组${i + 1}`,
        type: groupType,
        members: msg.sender ? [msg.sender] : [],
        lastMessage: msg,
    }));
}

export async function 生成设备联系人(
    eraId: string,
    mode: DeviceMode,
    context: DeviceMessageOptions['context'],
    apiConfig: 当前可用接口结构,
    settings: 接口设置结构,
    count?: number
): Promise<DeviceContact[]> {
    const options: DeviceMessageOptions = {
        eraId,
        mode,
        appType: 'contacts',
        context,
        count: count ?? 8,
    };

    const result = await 生成设备消息(options, apiConfig, settings, count);

    return result.messages.map((msg, i) => ({
        id: `ai-contact-${Date.now()}-${i}`,
        name: msg.sender || msg.title || `联系人${i + 1}`,
        relation: (msg.tags && msg.tags[0]) || '江湖中人',
        description: msg.content,
        lastContact: Date.now(),
    }));
}
