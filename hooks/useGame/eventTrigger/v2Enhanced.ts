import type { 游戏事件, 增强条件 } from '../../../models/eventTrigger';
import { 计算触发回合 } from './core';

const 获取嵌套属性 = (obj: unknown, 路径: string): unknown => {
  const parts = 路径.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object') current = (current as Record<string, unknown>)[part];
    else return undefined;
  }
  return current;
};

const 比较值 = (左值: unknown, 操作符: '>' | '<' | '>=' | '<=' | '==' | '!=', 右值: unknown): boolean => {
  switch (操作符) {
    case '>': return (左值 as number) > (右值 as number);
    case '<': return (左值 as number) < (右值 as number);
    case '>=': return (左值 as number) >= (右值 as number);
    case '<=': return (左值 as number) <= (右值 as number);
    case '==': return 左值 == 右值;
    case '!=': return 左值 != 右值;
    default: return false;
  }
};

export function 求值增强条件(条件: 增强条件, 游戏状态: Record<string, unknown>): boolean {
  switch (条件.kind) {
    case '属性比较': { const v = 获取嵌套属性(游戏状态, 条件.属性路径); return 比较值(v, 条件.操作符, 条件.值); }
    case '状态检查': { const v = 获取嵌套属性(游戏状态, 条件.检查项); return v === 条件.期望值; }
    case '概率': return Math.random() < 条件.概率;
    case '且': return 条件.条件列表.every(c => 求值增强条件(c, 游戏状态));
    case '或': return 条件.条件列表.some(c => 求值增强条件(c, 游戏状态));
    case '非': return !求值增强条件(条件.条件, 游戏状态);
    default: return false;
  }
}

export function 检查周期性触发(事件: 游戏事件, 当前回合: number): boolean {
  if (事件.状态 !== '待触发' || !事件.周期性配置) return false;
  const { 间隔回合, 终止回合, 最大触发次数 } = 事件.周期性配置;
  const 已触发次数 = 事件.已触发次数 || 0;
  if (最大触发次数 !== undefined && 已触发次数 >= 最大触发次数) return false;
  if (终止回合 !== undefined && 当前回合 > 终止回合) return false;
  const 初始 = 计算触发回合(事件);
  if (初始 === null) return false;
  const 距初始 = 当前回合 - 初始;
  return 距初始 > 0 && 距初始 % 间隔回合 === 0;
}

export function 获取下一触发回合(事件: 游戏事件, 当前回合: number): number | null {
  if (!事件.周期性配置) return null;
  const { 间隔回合, 终止回合, 最大触发次数 } = 事件.周期性配置;
  const 已触发次数 = 事件.已触发次数 || 0;
  if (最大触发次数 !== undefined && 已触发次数 >= 最大触发次数) return null;
  const 初始 = 计算触发回合(事件);
  if (初始 === null) return null;
  let 下一触发 = 初始 + 间隔回合;
  while (下一触发 <= 当前回合) 下一触发 += 间隔回合;
  if (终止回合 !== undefined && 下一触发 > 终止回合) return null;
  return 下一触发;
}

export function 查找链式触发事件(源事件ID: string, 事件列表: 游戏事件[], 当前回合: number): 游戏事件[] {
  return 事件列表.filter(事件 => {
    if (事件.状态 !== '待触发' || !事件.事件链列表 || 事件.事件链列表.length === 0) return false;
    return 事件.事件链列表.some(链 => {
      if (链.源事件ID !== 源事件ID) return false;
      return 当前回合 >= (事件.触发回合 || 0) + 链.触发后延迟;
    });
  });
}

export function 清理已过期事件(事件列表: 游戏事件[], 当前回合: number): 游戏事件[] {
  return 事件列表.filter(事件 => {
    if (事件.状态 === '已取消') return false;
    if (事件.状态 === '已过期') {
      const 过期回合 = 事件.过期回合 || (事件.创建回合 + 100);
      return 当前回合 - 过期回合 < 10;
    }
    return true;
  });
}

export function 处理事件组互斥(事件列表: 游戏事件[], 分组ID: string): 游戏事件[] {
  const 分组内 = 事件列表.filter(e => e.事件分组ID === 分组ID);
  if (分组内.length <= 1) return 事件列表;
  const 排序后 = [...分组内].sort((a, b) => (b.优先级 ?? 0) - (a.优先级 ?? 0));
  const 最高 = 排序后[0];
  const 其他 = 事件列表.filter(e => e.事件分组ID !== 分组ID);
  return [...其他, 最高];
}

export function 获取分组待触发事件(事件列表: 游戏事件[], 分组ID: string): 游戏事件[] {
  return 事件列表.filter(e => e.事件分组ID === 分组ID && e.状态 === '待触发');
}

export function 更新周期触发计数(事件: 游戏事件): 游戏事件 {
  if (事件.类型 !== '周期') return 事件;
  return { ...事件, 已触发次数: (事件.已触发次数 || 0) + 1 };
}

export function 检查事件过期(事件: 游戏事件, 当前回合: number): 游戏事件 | null {
  if (事件.状态 !== '待触发') return null;
  if (事件.过期回合 !== undefined && 当前回合 > 事件.过期回合) return { ...事件, 状态: '已过期' as const };
  if (事件.周期性配置?.最大触发次数 !== undefined) {
    if ((事件.已触发次数 || 0) >= 事件.周期性配置.最大触发次数) return { ...事件, 状态: '已过期' as const };
  }
  return null;
}
