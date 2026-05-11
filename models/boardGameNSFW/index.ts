/**
 * 桌游社交 NSFW 系统数据模型 — 统一入口
 *
 * 从 campusNSFW 提取，支持全时代
 */

export type {
  桌游类型,
  密室主题,
  密室逃脱状态,
  狼人杀状态,
  剧本杀状态,
  派对游戏状态,
  大富翁状态,
  棋牌游戏状态,
  骰子游戏状态,
  大富翁地产,
  棋牌游戏子类型,
  骰子面类型,
  桌游状态,
} from './core';

export type { 桌游时代场景类型, 桌游时代场景 } from './scenarios';

export { 获取桌游时代场景, 通用桌游场景, 桌游时代场景库 } from './scenarios';

// === 系统设置 ===

export interface 桌游社交NSFW设置 {
  启用桌游社交NSFW系统: boolean;
  桌游社交NSFW强度: '关闭' | '轻度' | '中度' | '深度';
  启用密室逃脱NSFW: boolean;
  启用狼人杀NSFW: boolean;
  启用剧本杀NSFW: boolean;
  启用派对游戏NSFW: boolean;
  启用骰子桌游NSFW: boolean;
  启用棋牌桌游NSFW: boolean;
  桌游触发频率: '低' | '中' | '高';
  启用桌游多人局: boolean;
  启用桌游邀请系统: boolean;
  启用桌游成就系统: boolean;
  启用桌游线上模式: boolean;
}

export const 默认桌游社交NSFW设置: 桌游社交NSFW设置 = {
  启用桌游社交NSFW系统: false,
  桌游社交NSFW强度: '中度',
  启用密室逃脱NSFW: true,
  启用狼人杀NSFW: true,
  启用剧本杀NSFW: true,
  启用派对游戏NSFW: true,
  启用骰子桌游NSFW: true,
  启用棋牌桌游NSFW: true,
  桌游触发频率: '中',
  启用桌游多人局: false,
  启用桌游邀请系统: false,
  启用桌游成就系统: false,
  启用桌游线上模式: false,
};

export { 规范化桌游社交NSFW设置 } from './normalization';
