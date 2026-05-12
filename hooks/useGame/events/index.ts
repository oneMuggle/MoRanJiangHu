/**
 * events/index.ts
 *
 * 事件总线模块 — 统一导出
 */

export { GlobalEventBus, getEventBus } from './globalEventBus';
export type { EventSubscriber } from './eventSubscriber';
export type { GameEventType } from './eventTypes';
export { EVENT_DOMAIN, createGameEvent } from './eventTypes';
