import type { 游戏事件, 事件状态 } from '../../../models/eventTrigger';
import { 计算触发回合 } from './core';

export function 计算事件新状态(事件: 游戏事件, 新状态: 事件状态, 额外数据?: Record<string, unknown>): 游戏事件 {
  return {
    ...事件, 状态: 新状态,
    触发回合: 事件.触发回合 ?? 计算触发回合(事件),
    ...(额外数据 ? { 事件数据: { ...事件.事件数据, ...额外数据 } } : {})
  };
}

export function 批量更新事件状态(事件列表: 游戏事件[], 更新映射: Record<string, 事件状态>): 游戏事件[] {
  return 事件列表.map(事件 => {
    const 新状态 = 更新映射[事件.id];
    if (新状态 && 事件.状态 === '待触发') return 计算事件新状态(事件, 新状态);
    return 事件;
  });
}
