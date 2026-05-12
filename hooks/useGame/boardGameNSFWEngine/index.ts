/**
 * 桌游社交 NSFW 引擎 — 统一入口
 */

export {
  判定桌游触发,
  选择桌游类型,
  计算桌游紧张度,
  计算羁绊加成,
  判定桌游NSFW升级,
  executePlayerAction,
  type 玩家操作,
  type 操作结算结果,
} from './core';

export {
  获取桌游场景For时代,
  获取桌游NSFW强度修正,
} from './eraAdapter';

export {
  生成桌游NSFW事件,
  生成待处理桌游事件,
  解析事件选择,
} from './eventSystem';

export type { 桌游NSFW事件, 桌游事件选择, 待处理桌游事件 } from './eventSystem';

// === 多人局管理 ===

export {
  选择参与NPC,
  判定多人局触发,
  编排多人局NSFW事件,
  推进多人局回合,
  分配阵营,
  初始化多人局,
  type 候选NPC,
} from './multiplayer';

// === SLG Engine 实现 ===

export { BoardGameEngine } from './boardGameEngine';

// === 游戏循环 ===

export {
  BoardGameLoop,
  createBoardGameLoop,
  type GameLoopState,
  type GameLoopConfig,
  type GameLoopCallbacks,
} from './gameLoop';

export type {
  多人局配置,
  多人局参与者,
  多人局事件,
  多人局状态,
} from '../../../models/boardGameNSFW/core';
