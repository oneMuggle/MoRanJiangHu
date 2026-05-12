/**
 * eventSubscriber.ts
 *
 * 事件订阅者接口 — 引擎实现此接口后可通过 EventBus 接收事件。
 */

import type { EngineType, GameEvent } from '../engine/types';
import type { GameEventType } from './eventTypes';

/**
 * 事件订阅者 — 每个引擎可选择实现此接口以接收跨引擎事件。
 * 未实现的引擎仍可正常工作，只是不会收到 EventBus 推送。
 */
export interface EventSubscriber {
  /** 订阅者所属的引擎类型 */
  subscriberType: EngineType;
  /** 感兴趣的事件类型列表，空数组 = 订阅所有事件 */
  subscribedEventTypes: GameEventType[];
  /** 处理事件的回调 */
  handleEvent(event: GameEvent): void;
  /** 优先级，数字越大越先被调用，默认 0 */
  priority?: number;
}
