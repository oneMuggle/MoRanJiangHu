import type { 游戏事件 } from '../../../models/eventTrigger';

export function 创建回合偏移事件(id: string, 名称: string, 偏移量: number, 事件数据: Record<string, unknown> = {}, 选项?: { 描述?: string; 优先级?: number; 过期回合?: number; 标签?: string[] }): 游戏事件 {
  return { id, 类型: '预约', 名称, 描述: 选项?.描述, 触发条件: { kind: '回合偏移', 偏移量 }, 事件数据, 状态: '待触发', 创建回合: 0, 优先级: 选项?.优先级, 过期回合: 选项?.过期回合, 标签: 选项?.标签 };
}

export function 创建绝对回合事件(id: string, 名称: string, 目标回合: number, 事件数据: Record<string, unknown> = {}, 选项?: { 描述?: string; 优先级?: number; 过期回合?: number; 标签?: string[] }): 游戏事件 {
  return { id, 类型: '定时', 名称, 描述: 选项?.描述, 触发条件: { kind: '回合绝对', 目标回合 }, 事件数据, 状态: '待触发', 创建回合: 0, 优先级: 选项?.优先级, 过期回合: 选项?.过期回合, 标签: 选项?.标签 };
}

export function 创建条件事件(id: string, 名称: string, 表达式: string, 事件数据: Record<string, unknown> = {}, 选项?: { 描述?: string; 优先级?: number; 过期回合?: number; 标签?: string[] }): 游戏事件 {
  return { id, 类型: '条件', 名称, 描述: 选项?.描述, 触发条件: { kind: '条件表达式', 表达式 }, 事件数据, 状态: '待触发', 创建回合: 0, 优先级: 选项?.优先级, 过期回合: 选项?.过期回合, 标签: 选项?.标签 };
}
