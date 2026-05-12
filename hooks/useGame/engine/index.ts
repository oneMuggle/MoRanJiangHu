/**
 * SLG + AI 混合架构 — 引擎层导出
 */

export * from './types';
export { BaseEngine } from './baseEngine';
export { TurnManager } from './turnManager';
export { ActionRouter } from './actionRouter';
export { ActionLogger } from './actionLogger';
export { PhoneEngine, createPhoneEngine } from './phoneEngine';
export type { PhoneEngineState, PhoneActionType, PhoneSideEffect } from './phoneEngine';
export { NotificationEngine, createNotificationEngine } from './notificationEngine';
export type { EngineNotification, NotificationCategory, NotificationTone, NotificationGroup } from './notificationEngine';
export { UrbanDriverEngine, createUrbanDriverEngine } from './urbanDriverEngine';
export type { UrbanDriverEngineState, UrbanDriverActionType } from './urbanDriverEngine';
export { EngineRegistry, createEngineRegistry } from './engineRegistry';
export type { EngineMetadata, EngineRegistrySnapshot } from './engineRegistry';
export { GlobalTurnManager, createGlobalTurnManager } from './globalTurnManager';
export type { GlobalTurnManagerConfig } from './globalTurnManager';
export { MessageScheduler } from '../device/messageScheduler';
export { MessageQueue } from '../device/messageQueue';
export type { NPCProfile, NPCTriggerRule, MessageSchedulerConfig } from '../device/messageScheduler';
export type { MessagePriority, ScheduledMessage, DisplayMessage } from '../device/messageQueue';
export { DailyTownEngine, createDailyTownEngine } from './dailyTownEngine';
export type { DailyTownState } from './dailyTownEngine';
export { AvgDialogueEngine, createAvgDialogueEngine } from './avgDialogueEngine';
export type { AvgDialogueState } from './avgDialogueEngine';
export { AvgRelationEngine, createAvgRelationEngine } from './avgRelationEngine';
export type { AvgRelationState } from './avgRelationEngine';
