/**
 * SLG + AI 混合架构 — PhoneSim 引擎
 *
 * 手机模拟器引擎，管理消息调度、通知中心、NPC 互动。
 * 继承 BaseEngine，实现 SLGEngine 接口。
 */

import { BaseEngine } from './baseEngine';
import type {
  PlayerAction,
  ActionResult,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  GameEvent,
} from './types';
import { MessageScheduler } from '../device/messageScheduler';
import type { ScheduledMessage, DisplayMessage, NPCProfile } from '../device/messageScheduler';
import { NotificationEngine } from './notificationEngine';
import type { EngineNotification } from './notificationEngine';

export interface PhoneEngineState {
  activeAppId: string | null;
  unreadCount: number;
  notificationCount: number;
  lastDeliveredAt: number;
  npcInteractions: number;
}

export type PhoneActionType =
  | 'OPEN_APP'
  | 'SEND_MESSAGE'
  | 'READ_MESSAGE'
  | 'DISMISS_NOTIFICATION'
  | 'INSTALL_APP'
  | 'UNINSTALL_APP';

export interface PhoneSideEffect {
  type: 'newMessage' | 'notification' | 'appInstalled' | 'appUninstalled';
  payload: Record<string, unknown>;
}

export class PhoneEngine extends BaseEngine {
  private _scheduler: MessageScheduler;
  private _notifications: NotificationEngine;
  private _state: PhoneEngineState;
  private _installedApps: Set<string>;
  private _deliveredMessages: DisplayMessage[];

  constructor() {
    super('phoneSim');
    this._scheduler = new MessageScheduler();
    this._notifications = new NotificationEngine();
    this._state = {
      activeAppId: null,
      unreadCount: 0,
      notificationCount: 0,
      lastDeliveredAt: 0,
      npcInteractions: 0,
    };
    this._installedApps = new Set(['sms', 'phone']);
    this._deliveredMessages = [];
  }

  advanceTurn(): TurnResult {
    const events: GameEvent[] = [];
    const stateChanges: Array<{ key: string; before: unknown; after: unknown }> = [];

    if (!this._paused) {
      const beforeNpcCheck = this._scheduler.getPendingCount();
      this._scheduler.checkNPCTriggers();
      const afterNpcCheck = this._scheduler.getPendingCount();

      if (afterNpcCheck > beforeNpcCheck) {
        events.push({
          id: `phone-npc-trigger-${Date.now()}`,
          engineType: 'phoneSim',
          type: 'NPC_MESSAGE_TRIGGERED',
          description: `${afterNpcCheck - beforeNpcCheck} NPC 消息触发`,
          status: 'resolved',
          payload: { count: afterNpcCheck - beforeNpcCheck },
          createdAt: Date.now(),
          resolvedAt: Date.now(),
        });
      }

      const delivered = this._scheduler.processQueue();
      if (delivered.length > 0) {
        this._deliveredMessages.push(...delivered);
        const beforeUnread = this._state.unreadCount;
        this._state.unreadCount += delivered.length;
        this._state.lastDeliveredAt = Date.now();

        stateChanges.push({
          key: 'unreadCount',
          before: beforeUnread,
          after: this._state.unreadCount,
        });

        events.push({
          id: `phone-messages-delivered-${Date.now()}`,
          engineType: 'phoneSim',
          type: 'MESSAGES_DELIVERED',
          description: `${delivered.length} 条消息已送达`,
          status: 'resolved',
          payload: { count: delivered.length },
          createdAt: Date.now(),
          resolvedAt: Date.now(),
        });
      }
    }

    return {
      turnNumber: 0,
      phase: 'resolution',
      eventsTriggered: events,
      stateChanges,
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    const actionType = action.type as PhoneActionType;
    const sideEffects: PhoneSideEffect[] = [];
    let narrativeConstraint = '';
    let keyStep = false;

    switch (actionType) {
      case 'OPEN_APP': {
        const appId = action.payload.appId as string;
        if (!this._installedApps.has(appId)) {
          return { success: false, stateUpdates: {}, narrativeConstraint: '应用未安装', keyStep: false, sideEffects: [] };
        }
        this._state.activeAppId = appId;
        this._state.unreadCount = 0;

        sideEffects.push({ type: 'newMessage', payload: { appId } });
        narrativeConstraint = `<手机操作>打开 ${appId} | 未读清零</手机操作>`;
        break;
      }

      case 'SEND_MESSAGE': {
        const targetId = action.payload.targetId as string;
        const content = action.payload.content as string;
        this._scheduler.scheduleMessage({
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          senderId: 'player',
          senderName: '玩家',
          appId: 'sms',
          content,
          scheduledTime: Date.now(),
          priority: 'normal',
          trigger: 'player_send',
        });
        narrativeConstraint = `<手机操作>发送消息给 ${targetId}: ${content.slice(0, 50)}</手机操作>`;
        break;
      }

      case 'READ_MESSAGE': {
        this._state.unreadCount = Math.max(0, this._state.unreadCount - 1);
        narrativeConstraint = `<手机操作>阅读消息</手机操作>`;
        break;
      }

      case 'DISMISS_NOTIFICATION': {
        const notifId = action.payload.notificationId as string;
        sideEffects.push({ type: 'notification', payload: { dismissed: notifId } });
        narrativeConstraint = `<手机操作>清除通知</手机操作>`;
        break;
      }

      case 'INSTALL_APP': {
        const appId = action.payload.appId as string;
        this._installedApps.add(appId);
        sideEffects.push({ type: 'appInstalled', payload: { appId } });
        narrativeConstraint = `<手机操作>安装 ${appId}</手机操作>`;
        keyStep = true;
        break;
      }

      case 'UNINSTALL_APP': {
        const appId = action.payload.appId as string;
        if (appId === 'sms' || appId === 'phone') {
          return { success: false, stateUpdates: {}, narrativeConstraint: '系统应用不可卸载', keyStep: false, sideEffects: [] };
        }
        this._installedApps.delete(appId);
        sideEffects.push({ type: 'appUninstalled', payload: { appId } });
        narrativeConstraint = `<手机操作>卸载 ${appId}</手机操作>`;
        break;
      }

      default:
        return { success: false, stateUpdates: {}, narrativeConstraint: '未知操作', keyStep: false, sideEffects: [] };
    }

    return {
      success: true,
      stateUpdates: {
        activeAppId: this._state.activeAppId,
        unreadCount: this._state.unreadCount,
      },
      narrativeConstraint,
      keyStep,
      sideEffects,
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    const actionType = action.type as PhoneActionType;
    switch (actionType) {
      case 'OPEN_APP':
        return typeof action.payload.appId === 'string' && this._installedApps.has(action.payload.appId);
      case 'SEND_MESSAGE':
        return typeof action.payload.targetId === 'string' && typeof action.payload.content === 'string';
      case 'READ_MESSAGE':
        return this._state.unreadCount > 0;
      case 'DISMISS_NOTIFICATION':
        return typeof action.payload.notificationId === 'string';
      case 'INSTALL_APP':
        return typeof action.payload.appId === 'string';
      case 'UNINSTALL_APP':
        return typeof action.payload.appId === 'string' && !['sms', 'phone'].includes(action.payload.appId);
      default:
        return false;
    }
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: 0,
      timestamp: Date.now(),
      engineStates: {
        phoneSim: {
          activeAppId: this._state.activeAppId,
          unreadCount: this._state.unreadCount,
          notificationCount: this._notifications.getUnreadCount(),
          installedApps: Array.from(this._installedApps),
          pendingMessages: this._scheduler.getPendingCount(),
          npcInteractions: this._state.npcInteractions,
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    return {
      scene: '手机',
      turn: 0,
      tension: 0,
      playerAction: this._state.activeAppId ? `使用 ${this._state.activeAppId}` : '待机',
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: this._scheduler.getDueCount() > 0 ? '消息推送' : '空闲',
    };
  }

  // ==================== Phone-Specific Methods ====================

  registerNPC(npc: NPCProfile): void {
    this._scheduler.registerNPC(npc);
  }

  scheduleMessage(message: Omit<ScheduledMessage, 'createdAt'>): void {
    this._scheduler.scheduleMessage(message);
  }

  getDeliveredMessages(): ReadonlyArray<DisplayMessage> {
    return this._deliveredMessages;
  }

  getInstalledApps(): ReadonlySet<string> {
    return this._installedApps;
  }

  getUnreadCount(): number {
    return this._state.unreadCount;
  }

  getActiveAppId(): string | null {
    return this._state.activeAppId;
  }

  getPendingMessageCount(): number {
    return this._scheduler.getPendingCount();
  }

  processIncomingMessages(): DisplayMessage[] {
    const delivered = this._scheduler.processQueue();
    if (delivered.length > 0) {
      this._deliveredMessages.push(...delivered);
      this._state.unreadCount += delivered.length;
      this._state.lastDeliveredAt = Date.now();
    }
    return delivered;
  }

  pushNotification(notification: Omit<EngineNotification, 'id' | 'timestamp' | 'read'>): EngineNotification {
    const notif = this._notifications.push(notification);
    this._state.notificationCount = this._notifications.getUnreadCount();
    return notif;
  }

  dismissNotification(id: string): boolean {
    const result = this._notifications.dismiss(id);
    this._state.notificationCount = this._notifications.getUnreadCount();
    return result;
  }

  getNotifications() {
    return this._notifications.getAll();
  }

  getUnreadNotificationCount(): number {
    return this._notifications.getUnreadCount();
  }
}

export function createPhoneEngine(): PhoneEngine {
  return new PhoneEngine();
}
