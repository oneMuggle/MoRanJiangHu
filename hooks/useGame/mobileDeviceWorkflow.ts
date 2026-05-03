// 移动设备工作流
// 负责设备状态管理、提示词构建、AI 消息生成

export type { DeviceState, DeviceMode, MobileApp, DeviceMessage, DeviceContact, DeviceGroup, DeviceStats, DeviceNotification, NotificationType } from '../../models/mobileDevice';
import { DeviceState, DeviceMode, MobileApp } from '../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../models/eraDevice';
import { 构建子纪元里模式注入, LiModeIntensity } from '../../prompts/runtime/eraLiMode';

/** 初始设备统计 */
export function 初始设备统计(): import('../../models/mobileDevice').DeviceStats {
    return {
        totalMessagesSent: 0,
        totalMessagesReceived: 0,
        lastUsedTimestamp: 0,
        activeContacts: [],
        missedNotifications: 0,
    };
}

/** 初始设备状态 */
export function 初始设备状态(): DeviceState {
    return {
        isOpen: false,
        activeApp: null,
        mode: 'normal',
        messages: [],
        stats: 初始设备统计(),
        notifications: [],
    };
}

/** 构建设备消息提示词 */
export function 构建设备消息提示词(
    eraId: string,
    deviceMode: DeviceMode,
    appType: MobileApp,
    context: {
        当前场景?: string;
        角色名?: string;
        额外上下文?: string;
    } = {},
    liIntensity?: LiModeIntensity
): string {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appType, deviceMode) : appType;

    const parts = [
        `【设备内容生成 — ${appName}】`,
        `时代: ${eraId}`,
        `应用: ${appName}`,
        `模式: ${deviceMode === 'li' ? '里模式' : '正常模式'}`,
    ];

    if (context.当前场景) {
        parts.push(`当前场景: ${context.当前场景}`);
    }
    if (context.角色名) {
        parts.push(`角色: ${context.角色名}`);
    }
    if (context.额外上下文) {
        parts.push(context.额外上下文);
    }

    // 里模式注入
    if (deviceMode === 'li') {
        const liInjection = 构建子纪元里模式注入(eraId, true, liIntensity);
        if (liInjection) {
            parts.push(`\n【里模式设备内容规则】${liInjection}`);
        }
    }

    return parts.join('\n');
}
