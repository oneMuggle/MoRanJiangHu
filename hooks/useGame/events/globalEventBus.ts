/**
 * globalEventBus.ts
 *
 * 全局事件总线 — 跨引擎事件分发机制。
 * 发布-订阅模式，支持按事件类型过滤、优先级排序、历史回溯、延迟队列。
 */

import type { EngineType, GameEvent } from '../engine/types';
import type { EventSubscriber } from './eventSubscriber';
import type { GameEventType } from './eventTypes';

const MAX_HISTORY = 200;

/** 延迟队列条目 */
interface QueuedEvent {
  event: GameEvent;
  processTurn: number;
}

export class GlobalEventBus {
  private static _instance: GlobalEventBus | null = null;

  private _subscribers: Map<EngineType, EventSubscriber> = new Map();
  private _history: GameEvent[] = [];
  private _queue: QueuedEvent[] = [];

  // ===== 单例 =====

  static getInstance(): GlobalEventBus {
    if (!GlobalEventBus._instance) {
      GlobalEventBus._instance = new GlobalEventBus();
    }
    return GlobalEventBus._instance;
  }

  /** 重置单例（仅测试用） */
  static resetInstance(): void {
    GlobalEventBus._instance = null;
  }

  // ===== 订阅管理 =====

  /**
   * 注册订阅者 — 订阅者实现 EventSubscriber 接口即可接收事件。
   * 同一引擎类型只能有一个订阅者，重复注册会覆盖。
   */
  subscribe(subscriber: EventSubscriber): void {
    this._subscribers.set(subscriber.subscriberType, subscriber);
  }

  /**
   * 取消订阅 — 移除指定引擎的订阅者。
   */
  unsubscribe(subscriberType: EngineType): void {
    this._subscribers.delete(subscriberType);
  }

  /**
   * 获取所有当前订阅者（按优先级降序排列）
   */
  getSubscribers(): EventSubscriber[] {
    const subs = Array.from(this._subscribers.values());
    subs.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    return subs;
  }

  // ===== 事件发布 =====

  /**
   * 发布事件 — 仅路由到订阅了该事件类型的订阅者。
   * 事件自动追加到历史缓冲区（环形，最大 MAX_HISTORY 条）。
   */
  publish(event: GameEvent): void {
    this._appendToHistory(event);

    const subscribers = this.getSubscribers();
    for (const sub of subscribers) {
      if (
        sub.subscribedEventTypes.length === 0 ||
        sub.subscribedEventTypes.includes(event.type as GameEventType)
      ) {
        try {
          sub.handleEvent(event);
        } catch {
          // 订阅者处理失败不影响其他订阅者
        }
      }
    }
  }

  /**
   * 广播事件 — 发送给所有订阅者，无视事件类型过滤。
   */
  broadcast(event: GameEvent): void {
    this._appendToHistory(event);

    for (const sub of this.getSubscribers()) {
      try {
        sub.handleEvent(event);
      } catch {
        // 忽略单个订阅者错误
      }
    }
  }

  // ===== 事件历史 =====

  /**
   * 获取最近的事件历史（默认全部）
   */
  getHistory(limit?: number): GameEvent[] {
    if (limit === undefined) return [...this._history];
    return this._history.slice(-limit);
  }

  /**
   * 清空事件历史
   */
  clearHistory(): void {
    this._history = [];
  }

  /**
   * 按事件类型过滤历史
   */
  getHistoryByType(type: GameEventType): GameEvent[] {
    return this._history.filter((e) => e.type === type);
  }

  /**
   * 按引擎类型过滤历史
   */
  getHistoryByEngine(engineType: EngineType): GameEvent[] {
    return this._history.filter((e) => e.engineType === engineType);
  }

  // ===== 延迟队列 =====

  /**
   * 入队事件 — 在指定回合数时才处理。
   */
  enqueue(event: GameEvent, processTurn: number): void {
    this._queue.push({ event, processTurn });
  }

  /**
   * 处理所有到期事件 — 由 GlobalTurnManager 在每个回合结束时调用。
   */
  processQueued(currentTurn: number): void {
    const ready = this._queue.filter((q) => q.processTurn <= currentTurn);
    this._queue = this._queue.filter((q) => q.processTurn > currentTurn);

    for (const { event } of ready) {
      this.publish(event);
    }
  }

  /**
   * 获取队列中待处理事件数量
   */
  getQueueSize(): number {
    return this._queue.length;
  }

  // ===== 私有方法 =====

  private _appendToHistory(event: GameEvent): void {
    this._history.push(event);
    if (this._history.length > MAX_HISTORY) {
      this._history = this._history.slice(-MAX_HISTORY);
    }
  }
}

/** 便捷访问函数 */
export function getEventBus(): GlobalEventBus {
  return GlobalEventBus.getInstance();
}
