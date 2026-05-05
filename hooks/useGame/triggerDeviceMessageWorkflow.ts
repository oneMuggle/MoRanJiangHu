/**
 * 回合末尾设备消息生成工作流
 * 每回合结束后，根据时代、模式、当前场景自动生成设备内容
 */

import type { DeviceMessage, DeviceMode, MobileApp, DeviceNotification, DeviceStats } from '../../models/mobileDevice';
import type { 当前可用接口结构 } from '../../utils/apiConfig';
import type { 接口设置结构 } from '../../models/system';
import type { LiModeIntensity } from '../../prompts/runtime/eraLiMode';
import { 生成设备消息 } from './deviceAiWorkflow';
import * as dbService from '../../services/dbService';

export interface 设备消息触发参数 {
    eraId: string;
    mode: DeviceMode;
    apiConfig: 当前可用接口结构;
    apiSettings: 接口设置结构;
    context: {
        角色名: string;
        当前场景: string;
        当前位置: string;
        世界状态: string;
    };
    /** 本回合要生成内容的 App 列表，为空则使用时代默认 */
    targetApps?: MobileApp[];
    /** 每 App 生成消息条数，默认 3 */
    messagesPerApp?: number;
    /** 是否持久化到 IndexedDB */
    persistToDb?: boolean;
    /** 里模式强度级别（仅在 mode='li' 时生效） */
    liIntensity?: LiModeIntensity;
    /** 用于取消生成的信号 */
    signal?: AbortSignal;
}

export interface 设备消息触发结果 {
    generatedMessages: Partial<Record<MobileApp, DeviceMessage[]>>;
    newNotifications: DeviceNotification[];
    updatedStats: DeviceStats;
    errors: string[];
}

/** 根据时代决定默认生成哪些 App 的内容 */
export function 获取时代默认生成App(eraId: string, mode: DeviceMode): MobileApp[] {
    if (mode === 'li') {
        return ['news', 'forum', 'chat', 'bdsn'];
    }
    if (eraId.startsWith('ancient')) {
        return ['news', 'forum'];
    }
    if (eraId.startsWith('modern') || eraId.startsWith('near_future')) {
        return ['news', 'chat'];
    }
    return ['news'];
}

/** 将设备消息转换为通知 */
function 消息转通知(msg: DeviceMessage, app: MobileApp): DeviceNotification {
    return {
        id: `notif-${msg.id}`,
        type: 'incoming_message',
        title: msg.title,
        body: msg.content.substring(0, 100),
        timestamp: msg.timestamp,
        read: false,
        relatedMessageId: msg.id,
        relatedApp: app,
    };
}

/** 构建设备通讯摘要 — 注入系统提示词，让 AI 在正文中引用手机/通讯内容 */
export function 构建设备通讯摘要(params: {
    messages: Array<{ app: string; title: string; content: string; timestamp: number; read: boolean }>;
    /** 最多包含条数，默认 5 */
    maxItems?: number;
}): string {
    const { messages, maxItems = 5 } = params;
    if (messages.length === 0) return '';

    const unread = messages.filter(m => !m.read);
    const recent = messages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, maxItems);

    const lines: string[] = [];
    lines.push(`【设备通讯】最近收到 ${messages.length} 条消息（${unread.length} 条未读）`);
    for (const msg of recent) {
        const appLabel = (() => {
            switch (msg.app) {
                case 'news': return '资讯';
                case 'forum': return '论坛';
                case 'chat': return '群聊';
                case 'contacts': return '通讯录';
                case 'album': return '相册';
                case 'tools': return '工具';
                case 'map': return '地图';
                default: return msg.app;
            }
        })();
        const preview = msg.content.length > 60 ? msg.content.substring(0, 60) + '…' : msg.content;
        lines.push(`  - [${appLabel}] ${msg.title}：${preview}`);
    }
    return lines.join('\n');
}

/** 回合末尾触发设备消息生成 */
export async function 触发设备消息生成(
    params: 设备消息触发参数
): Promise<设备消息触发结果> {
    const { eraId, mode, apiConfig, apiSettings, context, targetApps, messagesPerApp = 3, persistToDb = true, liIntensity, signal } = params;
    const result: 设备消息触发结果 = {
        generatedMessages: {},
        newNotifications: [],
        updatedStats: {
            totalMessagesSent: 0,
            totalMessagesReceived: 0,
            lastUsedTimestamp: Date.now(),
            activeContacts: [],
            missedNotifications: 0,
        },
        errors: [],
    };

    const appsToGenerate = targetApps && targetApps.length > 0
        ? targetApps
        : 获取时代默认生成App(eraId, mode);

    for (const app of appsToGenerate) {
        try {
            const appContext = {
                当前场景: context.当前场景,
                角色名: context.角色名,
                当前位置: context.当前位置,
                世界状态: context.世界状态,
            };

            const genResult = await 生成设备消息({
                eraId,
                mode,
                appType: app,
                context: appContext,
                count: messagesPerApp,
                liIntensity,
                signal,
            }, apiConfig, apiSettings, messagesPerApp);

            if (genResult.messages.length > 0) {
                result.generatedMessages[app] = genResult.messages;

                for (const msg of genResult.messages) {
                    result.newNotifications.push(消息转通知(msg, app));
                    result.updatedStats.totalMessagesReceived++;
                }

                if (persistToDb) {
                    for (const msg of genResult.messages) {
                        await dbService.保存设备消息(msg);
                    }
                }
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            result.errors.push(`${app}: ${msg}`);
        }
    }

    return result;
}
