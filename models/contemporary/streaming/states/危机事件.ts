/**
 * 危机事件状态
 */

import type { 危机事件类型, 舆论状态 } from '../types';

export interface 危机事件 {
  事件ID: string;
  事件类型: 危机事件类型;
  发生时间: string;
  发酵程度: 舆论状态;
  影响范围: number;         // 预计受影响人数
  处理状态: '待处理' | '处理中' | '已平息' | '失控';
  处理方案?: string;
}

/**
 * 创建危机事件
 */
export function 创建危机事件(
  事件ID: string,
  事件类型: 危机事件类型,
  发生时间: string
): 危机事件 {
  return {
    事件ID,
    事件类型,
    发生时间,
    发酵程度: '小范围发酵',
    影响范围: 0,
    处理状态: '待处理',
  };
}
