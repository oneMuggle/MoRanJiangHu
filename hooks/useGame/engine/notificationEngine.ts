/**
 * SLG + AI 混合架构 — 通知中心引擎
 *
 * 统一管理所有 App 通知，支持分组、清除、优先级排序。
 */

export type NotificationCategory = 'message' | 'system' | 'social' | 'urgent' | 'promo';
export type NotificationTone = 'info' | 'success' | 'warning' | 'error';

export interface EngineNotification {
  id: string;
  appId: string;
  category: NotificationCategory;
  tone: NotificationTone;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  action?: {
    type: string;
    payload: Record<string, unknown>;
  };
}

export interface NotificationGroup {
  appId: string;
  appName: string;
  count: number;
  latest: EngineNotification;
  notifications: EngineNotification[];
}

export class NotificationEngine {
  private _notifications: EngineNotification[] = [];
  private _maxHistory = 200;

  push(notification: Omit<EngineNotification, 'id' | 'timestamp' | 'read'>): EngineNotification {
    const full: EngineNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      read: false,
    };

    this._notifications.unshift(full);

    if (this._notifications.length > this._maxHistory) {
      this._notifications = this._notifications.slice(0, this._maxHistory);
    }

    return full;
  }

  markAsRead(id: string): boolean {
    const notif = this._notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  }

  markAllAsRead(): void {
    for (const n of this._notifications) {
      n.read = true;
    }
  }

  dismiss(id: string): boolean {
    const before = this._notifications.length;
    this._notifications = this._notifications.filter((n) => n.id !== id);
    return this._notifications.length < before;
  }

  dismissByAppId(appId: string): number {
    const before = this._notifications.length;
    this._notifications = this._notifications.filter((n) => n.appId !== appId);
    return before - this._notifications.length;
  }

  clearAll(): void {
    this._notifications = [];
  }

  getUnread(): EngineNotification[] {
    return this._notifications.filter((n) => !n.read);
  }

  getUnreadCount(): number {
    return this._notifications.filter((n) => !n.read).length;
  }

  getUnreadCountByApp(appId: string): number {
    return this._notifications.filter((n) => n.appId === appId && !n.read).length;
  }

  getAll(): EngineNotification[] {
    return [...this._notifications];
  }

  getGroupedByApp(): NotificationGroup[] {
    const groups = new Map<string, EngineNotification[]>();

    for (const n of this._notifications) {
      if (!groups.has(n.appId)) groups.set(n.appId, []);
      groups.get(n.appId)!.push(n);
    }

    return Array.from(groups.entries()).map(([appId, notifications]) => ({
      appId,
      appName: appId,
      count: notifications.length,
      latest: notifications[0],
      notifications,
    }));
  }

  getByCategory(category: NotificationCategory): EngineNotification[] {
    return this._notifications.filter((n) => n.category === category);
  }

  getUrgent(): EngineNotification[] {
    return this._notifications.filter((n) => n.category === 'urgent');
  }

  getMaxHistory(): number {
    return this._maxHistory;
  }

  setMaxHistory(limit: number): void {
    this._maxHistory = Math.max(10, limit);
  }
}

export function createNotificationEngine(): NotificationEngine {
  return new NotificationEngine();
}
