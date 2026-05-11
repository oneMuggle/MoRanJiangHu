/**
 * 桌游社交 NSFW 系统 — 设置规范化
 */

import type { 桌游社交NSFW设置 } from './index';
import { 默认桌游社交NSFW设置 } from './index';

const 读取布尔 = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const 合法桌游强度 = ['关闭', '轻度', '中度', '深度'] as const;
const 合法桌游频率 = ['低', '中', '高'] as const;

function 枚举校验<T extends string>(value: unknown, 合法值: readonly T[], fallback: T): T {
  return (合法值 as readonly string[]).includes(typeof value === 'string' ? value : '')
    ? (value as T)
    : fallback;
}

/**
 * 规范化桌游社交 NSFW 系统设置
 */
export function 规范化桌游社交NSFW设置(raw: Partial<桌游社交NSFW设置>): 桌游社交NSFW设置 {
  const s = 默认桌游社交NSFW设置;
  return {
    启用桌游社交NSFW系统: 读取布尔(raw.启用桌游社交NSFW系统, s.启用桌游社交NSFW系统),
    桌游社交NSFW强度: 枚举校验(raw.桌游社交NSFW强度, 合法桌游强度, s.桌游社交NSFW强度),
    启用密室逃脱NSFW: 读取布尔(raw.启用密室逃脱NSFW, s.启用密室逃脱NSFW),
    启用狼人杀NSFW: 读取布尔(raw.启用狼人杀NSFW, s.启用狼人杀NSFW),
    启用剧本杀NSFW: 读取布尔(raw.启用剧本杀NSFW, s.启用剧本杀NSFW),
    启用派对游戏NSFW: 读取布尔(raw.启用派对游戏NSFW, s.启用派对游戏NSFW),
    启用骰子桌游NSFW: 读取布尔(raw.启用骰子桌游NSFW, s.启用骰子桌游NSFW),
    启用棋牌桌游NSFW: 读取布尔(raw.启用棋牌桌游NSFW, s.启用棋牌桌游NSFW),
    桌游触发频率: 枚举校验(raw.桌游触发频率, 合法桌游频率, s.桌游触发频率),
    启用桌游多人局: 读取布尔(raw.启用桌游多人局, s.启用桌游多人局),
    启用桌游邀请系统: 读取布尔(raw.启用桌游邀请系统, s.启用桌游邀请系统),
    启用桌游成就系统: 读取布尔(raw.启用桌游成就系统, s.启用桌游成就系统),
    启用桌游线上模式: 读取布尔(raw.启用桌游线上模式, s.启用桌游线上模式),
  };
}
