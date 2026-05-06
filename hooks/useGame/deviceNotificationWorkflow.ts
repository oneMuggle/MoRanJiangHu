/**
 * 设备通知生成工作流
 * 生成设备通知（未读消息提醒、来电提醒、推送通知等）
 */

import type { DeviceNotification, MobileApp, DeviceMessage } from '../../models/mobileDevice';

/**
 * 通知类型到显示优先级的映射
 */
const 通知优先级: Record<DeviceNotification['type'], number> = {
    'missed_call': 1,      // 未接来电最高优先级
    'incoming_message': 2, // 新消息
    'news_push': 3,        // 资讯推送
    'forum_reply': 4,      // 论坛回复
    'system_alert': 5,     // 系统提醒最低
};

/**
 * 根据消息生成通知
 */
export function 创建设备通知(
    message: DeviceMessage,
    app: MobileApp,
    options?: {
        /** 是否设置为已读 */
        已读?: boolean;
        /** 通知类型，默认根据 app 类型推断 */
        类型?: DeviceNotification['type'];
    }
): DeviceNotification {
    const { 已读 = false, 类型 } = options || {};

    // 根据 app 类型推断通知类型
    const 推断类型 = 类型 || (() => {
        switch (app) {
            case 'chat': return 'incoming_message';
            case 'forum': return 'forum_reply';
            case 'news': return 'news_push';
            default: return 'incoming_message';
        }
    })();

    return {
        id: `notif-${message.id}-${Date.now()}`,
        type: 推断类型,
        title: message.title,
        body: message.content.substring(0, 100),
        timestamp: message.timestamp,
        read: 已读,
        relatedMessageId: message.id,
        relatedApp: app,
    };
}

/**
 * 批量生成通知
 */
export function 批量创建设备通知(
    messages: DeviceMessage[],
    app: MobileApp
): DeviceNotification[] {
    return messages.map((msg) => 创建设备通知(msg, app));
}

/**
 * 按优先级排序通知
 */
export function 按优先级排序通知(
    notifications: DeviceNotification[]
): DeviceNotification[] {
    return [...notifications].sort((a, b) => {
        const 优先级A = 通知优先级[a.type] ?? 99;
        const 优先级B = 通知优先级[b.type] ?? 99;
        if (优先级A !== 优先级B) {
            return 优先级A - 优先级B;
        }
        // 同优先级按时间倒序
        return b.timestamp - a.timestamp;
    });
}

/**
 * 标记通知为已读
 */
export function 标记通知为已读(
    notifications: DeviceNotification[],
    notificationId: string
): DeviceNotification[] {
    return notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
    );
}

/**
 * 标记所有通知为已读
 */
export function 标记所有通知为已读(
    notifications: DeviceNotification[]
): DeviceNotification[] {
    return notifications.map((n) => ({ ...n, read: true }));
}

/**
 * 获取未读通知数量
 */
export function 获取未读通知数量(
    notifications: DeviceNotification[]
): number {
    return notifications.filter((n) => !n.read).length;
}

/**
 * 清除过期通知（超过指定毫秒数的通知）
 */
export function 清除过期通知(
    notifications: DeviceNotification[],
    过期毫秒数: number = 7 * 24 * 60 * 60 * 1000 // 默认7天
): DeviceNotification[] {
    const 过期时间戳 = Date.now() - 过期毫秒数;
    return notifications.filter((n) => n.timestamp >= 过期时间戳);
}

/**
 * 限制通知数量（保留最新的）
 */
export function 限制通知数量(
    notifications: DeviceNotification[],
    最大数量: number = 50
): DeviceNotification[] {
    if (notifications.length <= 最大数量) {
        return notifications;
    }
    // 按时间倒序，保留最新的
    const sorted = 按优先级排序通知(notifications);
    return sorted.slice(0, 最大数量);
}
