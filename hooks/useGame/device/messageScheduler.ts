/**
 * SLG + AI 混合架构 — 消息调度器
 *
 * 定时推送消息，NPC 根据关系和状态自动触发消息，处理消息队列。
 */

import { MessageQueue } from './messageQueue';
import type { ScheduledMessage, DisplayMessage } from './messageQueue';

export type { MessagePriority, ScheduledMessage, DisplayMessage } from './messageQueue';

export interface NPCProfile {
  id: string;
  name: string;
  relationship: number;       // 好感度 -100 ~ 100
  intimacyLevel: string;      // 关系阶段
  lastMessageTime?: number;
}

export interface NPCTriggerRule {
  condition: (npc: NPCProfile, elapsedMs: number) => boolean;
  priority: 'low' | 'normal' | 'urgent';
  appId: string;
  delayMs: number;
}

export interface MessageSchedulerConfig {
  maxQueueSize: number;
  tickIntervalMs: number;
  npcCheckIntervalMs: number;
}

const DEFAULT_CONFIG: MessageSchedulerConfig = {
  maxQueueSize: 100,
  tickIntervalMs: 5000,
  npcCheckIntervalMs: 30000,
};

export class MessageScheduler {
  private _queue: MessageQueue;
  private _npcs: Map<string, NPCProfile>;
  private _triggers: NPCTriggerRule[];
  private _config: MessageSchedulerConfig;
  private _lastNpcCheck = 0;

  constructor(config?: Partial<MessageSchedulerConfig>) {
    this._queue = new MessageQueue();
    this._npcs = new Map();
    this._triggers = [];
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  scheduleMessage(message: Omit<ScheduledMessage, 'createdAt'>): void {
    if (this._queue.size() >= this._config.maxQueueSize) {
      return;
    }

    const fullMessage: ScheduledMessage = {
      ...message,
      createdAt: Date.now(),
    };
    this._queue.enqueue(fullMessage);
  }

  registerNPC(npc: NPCProfile): void {
    this._npcs.set(npc.id, npc);
  }

  removeNPC(npcId: string): void {
    this._npcs.delete(npcId);
  }

  registerTrigger(rule: NPCTriggerRule): void {
    this._triggers.push(rule);
  }

  checkNPCTriggers(): ScheduledMessage[] {
    const now = Date.now();
    if (now - this._lastNpcCheck < this._config.npcCheckIntervalMs) {
      return [];
    }
    this._lastNpcCheck = now;

    const triggered: ScheduledMessage[] = [];

    for (const npc of this._npcs.values()) {
      const elapsed = npc.lastMessageTime ? now - npc.lastMessageTime : Infinity;

      for (const rule of this._triggers) {
        if (rule.condition(npc, elapsed)) {
          if (this._queue.size() >= this._config.maxQueueSize) break;

          const message: ScheduledMessage = {
            id: `npc-trigger-${npc.id}-${now}-${Math.random().toString(36).slice(2, 8)}`,
            senderId: npc.id,
            senderName: npc.name,
            appId: rule.appId,
            content: '',
            scheduledTime: now + rule.delayMs,
            priority: rule.priority,
            trigger: rule.condition.toString().slice(0, 100),
            createdAt: now,
          };
          triggered.push(message);
          this._queue.enqueue(message);

          npc.lastMessageTime = now;
          break;
        }
      }
    }

    return triggered;
  }

  processQueue(): DisplayMessage[] {
    return this._queue.dequeue(5);
  }

  getPendingCount(): number {
    return this._queue.size();
  }

  getDueCount(): number {
    return this._queue.getDueCount();
  }

  getScheduledMessages(): ScheduledMessage[] {
    return this._queue.getAllScheduled();
  }

  clearQueue(): void {
    this._queue.clear();
  }

  getConfig(): MessageSchedulerConfig {
    return { ...this._config };
  }

  updateConfig(config: Partial<MessageSchedulerConfig>): void {
    this._config = { ...this._config, ...config };
  }
}
