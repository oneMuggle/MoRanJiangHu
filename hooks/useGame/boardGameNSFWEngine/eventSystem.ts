/**
 * 桌游社交 NSFW 引擎 — 事件系统
 *
 * SLG 扩展：支持 pending 状态和玩家选择
 */

import type { 桌游类型 } from '../../../models/boardGameNSFW';

export interface 桌游NSFW事件 {
  id: string;
  桌游类型: 桌游类型;
  事件描述: string;
  紧张度: number;
  参与者: string[];
  时间: string;
}

export interface 桌游事件选择 {
  id: string;
  label: string;
  risk: 'low' | 'medium' | 'high';
  consequence: string;
}

export interface 待处理桌游事件 extends 桌游NSFW事件 {
  状态: 'pending' | 'resolved' | 'expired';
  可选择项: 桌游事件选择[];
  超时?: number;
}

export function 生成桌游NSFW事件(参数: {
  桌游类型: 桌游类型;
  紧张度: number;
  参与者: string[];
  时间: string;
}): 桌游NSFW事件 {
  const { 桌游类型, 紧张度, 参与者, 时间 } = 参数;
  const 事件描述 = `在${桌游类型}中，紧张氛围达到${紧张度}%`;
  return {
    id: `bg_event_${Date.now()}`,
    桌游类型,
    事件描述,
    紧张度,
    参与者,
    时间,
  };
}

/**
 * 生成待处理事件 — 需要玩家做出选择
 */
export function 生成待处理桌游事件(参数: {
  桌游类型: 桌游类型;
  紧张度: number;
  参与者: string[];
  时间: string;
  可选择项: 桌游事件选择[];
  超时?: number;
}): 待处理桌游事件 {
  const 基础事件 = 生成桌游NSFW事件({
    桌游类型: 参数.桌游类型,
    紧张度: 参数.紧张度,
    参与者: 参数.参与者,
    时间: 参数.时间,
  });
  return {
    ...基础事件,
    状态: 'pending',
    可选择项: 参数.可选择项,
    超时: 参数.超时,
  };
}

/**
 * 解析玩家选择，返回事件结果
 */
export function 解析事件选择(事件: 待处理桌游事件, 选择Id: string): {
  成功: boolean;
  紧张度变化: number;
  描述: string;
} {
  const 选择 = 事件.可选择项.find(c => c.id === 选择Id);
  if (!选择) {
    return { 成功: false, 紧张度变化: 5, 描述: '无效选择' };
  }

  const 风险权重 = { low: 0.3, medium: 0.6, high: 0.9 };
  const 成功概率 = 1 - (风险权重[选择.risk] ?? 0.5);
  const 成功 = Math.random() < 成功概率;

  const 紧张度变化 = 选择.risk === 'high' ? 15 : 选择.risk === 'medium' ? 10 : 5;

  return {
    成功,
    紧张度变化,
    描述: 成功 ? 选择.consequence : `选择失败：${选择.consequence}`,
  };
}
