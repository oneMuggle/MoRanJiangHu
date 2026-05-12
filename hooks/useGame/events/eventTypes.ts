/**
 * eventTypes.ts
 *
 * 全局事件总线 — 40+ 事件类型定义，按领域分组。
 * 每个事件类型是字符串字面量联合，确保类型安全。
 */

import type { EngineType } from '../engine/types';

// ==================== 事件类型 ====================

export type GameEventType =
  // 战斗事件
  | 'BATTLE_START'
  | 'BATTLE_END'
  | 'BATTLE_DAMAGE'
  | 'BATTLE_SKILL_USE'
  | 'BATTLE_BUFF_APPLY'
  | 'BATTLE_BUFF_EXPIRE'
  | 'BATTLE_DEATH'
  // 装备/物品事件
  | 'EQUIP_CHANGE'
  | 'ITEM_USE'
  | 'ITEM_GAIN'
  | 'ITEM_LOSE'
  | 'ITEM_STACK_CHANGE'
  // 功法事件
  | 'KUNGFU_LEVEL_UP'
  | 'KUNGFU_BREAKTHROUGH'
  | 'KUNGFU_COOLDOWN'
  // 任务/门派事件
  | 'TASK_ACCEPT'
  | 'TASK_COMPLETE'
  | 'TASK_FAIL'
  | 'TASK_REWARD'
  | 'SECT_CONTRIBUTION'
  | 'SECT_MEMBER_JOIN'
  | 'SECT_MEMBER_LEAVE'
  // 关系/好感事件
  | 'RELATION_CHANGE'
  | 'INTIMACY_CHANGE'
  | 'INTIMACY_THRESHOLD'
  | 'NPC_MEET'
  | 'ROUTE_CHANGE'
  | 'ENDING_TRIGGER'
  // 对话/剧情事件
  | 'DIALOGUE_START'
  | 'DIALOGUE_BRANCH'
  | 'DIALOGUE_CHOICE'
  | 'STORY_CHAPTER_CHANGE'
  | 'BRANCH_SELECT'
  | 'CONSEQUENCE_APPLY'
  // 桌游事件
  | 'BOARD_GAME_START'
  | 'BOARD_GAME_END'
  | 'BOARD_GAME_SETTLEMENT'
  // 手机/都市事件
  | 'PHONE_MESSAGE'
  | 'PHONE_APP_OPEN'
  | 'URBAN_TRIP_START'
  | 'URBAN_TRIP_END'
  | 'URBAN_CONSEQUENCE'
  // 世界/时间事件
  | 'WORLD_EVOLVE'
  | 'TIME_ADVANCE'
  | 'TIME_OF_DAY_CHANGE'
  // 探索事件
  | 'EXPLORE_MOVE'
  | 'ENCOUNTER_START'
  | 'TREASURE_FIND'
  | 'FOW_REVEAL'
  // 日常城镇事件
  | 'DAILY_MOVE'
  | 'DAILY_ACTION_POINT_CHANGE'
  | 'DYNAMIC_EVENT_TRIGGER'
  // 通知事件
  | 'NOTIFICATION_PUSH'
  | 'NOTIFICATION_DISMISS'
  // 引擎生命周期事件
  | 'ENGINE_REGISTER'
  | 'ENGINE_UNREGISTER'
  | 'ENGINE_PAUSE'
  | 'ENGINE_RESUME';

// ==================== 事件分类映射 ====================

/** 事件类型到所属领域的映射，用于调试和过滤 */
export const EVENT_DOMAIN: Record<GameEventType, string> = {
  BATTLE_START: 'battle',
  BATTLE_END: 'battle',
  BATTLE_DAMAGE: 'battle',
  BATTLE_SKILL_USE: 'battle',
  BATTLE_BUFF_APPLY: 'battle',
  BATTLE_BUFF_EXPIRE: 'battle',
  BATTLE_DEATH: 'battle',
  EQUIP_CHANGE: 'equipment',
  ITEM_USE: 'equipment',
  ITEM_GAIN: 'equipment',
  ITEM_LOSE: 'equipment',
  ITEM_STACK_CHANGE: 'equipment',
  KUNGFU_LEVEL_UP: 'kungfu',
  KUNGFU_BREAKTHROUGH: 'kungfu',
  KUNGFU_COOLDOWN: 'kungfu',
  TASK_ACCEPT: 'task',
  TASK_COMPLETE: 'task',
  TASK_FAIL: 'task',
  TASK_REWARD: 'task',
  SECT_CONTRIBUTION: 'sect',
  SECT_MEMBER_JOIN: 'sect',
  SECT_MEMBER_LEAVE: 'sect',
  RELATION_CHANGE: 'relation',
  INTIMACY_CHANGE: 'relation',
  INTIMACY_THRESHOLD: 'relation',
  NPC_MEET: 'relation',
  ROUTE_CHANGE: 'relation',
  ENDING_TRIGGER: 'relation',
  DIALOGUE_START: 'dialogue',
  DIALOGUE_BRANCH: 'dialogue',
  DIALOGUE_CHOICE: 'dialogue',
  STORY_CHAPTER_CHANGE: 'dialogue',
  BRANCH_SELECT: 'dialogue',
  CONSEQUENCE_APPLY: 'dialogue',
  BOARD_GAME_START: 'boardgame',
  BOARD_GAME_END: 'boardgame',
  BOARD_GAME_SETTLEMENT: 'boardgame',
  PHONE_MESSAGE: 'phone',
  PHONE_APP_OPEN: 'phone',
  URBAN_TRIP_START: 'urban',
  URBAN_TRIP_END: 'urban',
  URBAN_CONSEQUENCE: 'urban',
  WORLD_EVOLVE: 'world',
  TIME_ADVANCE: 'world',
  TIME_OF_DAY_CHANGE: 'world',
  EXPLORE_MOVE: 'exploration',
  ENCOUNTER_START: 'exploration',
  TREASURE_FIND: 'exploration',
  FOW_REVEAL: 'exploration',
  DAILY_MOVE: 'daily',
  DAILY_ACTION_POINT_CHANGE: 'daily',
  DYNAMIC_EVENT_TRIGGER: 'daily',
  NOTIFICATION_PUSH: 'notification',
  NOTIFICATION_DISMISS: 'notification',
  ENGINE_REGISTER: 'engine',
  ENGINE_UNREGISTER: 'engine',
  ENGINE_PAUSE: 'engine',
  ENGINE_RESUME: 'engine',
};

// ==================== 事件工厂 ====================

let _eventCounter = 0;

/**
 * 创建游戏事件 — 自动分配 ID 和元数据
 */
export function createGameEvent(args: {
  engineType: EngineType;
  type: GameEventType;
  description: string;
  payload?: Record<string, unknown>;
}) {
  _eventCounter += 1;
  return {
    id: `evt-${_eventCounter}-${Date.now()}`,
    engineType: args.engineType,
    type: args.type,
    description: args.description,
    status: 'pending' as const,
    payload: args.payload ?? {},
    createdAt: Date.now(),
  };
}
