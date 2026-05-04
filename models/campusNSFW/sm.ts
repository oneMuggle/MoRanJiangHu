/**
 * 校园 NSFW v1.2 SM/支配服从系统
 * 权力天平、服从度、契约、SM场景
 */

// 权力倾向已在 core.ts 中定义，此处复用
import type { 权力倾向 } from './core';
export type { 权力倾向 };

export interface 权力天平状态 {
  当前值: number;
  波动范围: number;
  已交互次数: number;
  是否已固化: boolean;
}

export interface 服从度状态 {
  当前值: number;
  未完成指令数: number;
  连续拒绝次数: number;
  连续服从回合: number;
  最后指令时间: string;
}

export type 契约类型 = '口头约定' | '书面契约' | '信物交换';
export type 契约状态 = '未缔结' | '口头约定' | '书面契约' | '信物交换' | '已解除' | '已违约';

export interface 契约记录 {
  id: string;
  类型: 契约类型;
  状态: 契约状态;
  缔结时间: string;
  条款列表: string[];
  信物描述?: string;
  违约次数: number;
}

export type SM场景类型 =
  | '指令游戏' | '服从测试' | '轻度束缚' | '角色扮演'
  | '惩罚与奖励' | '感官剥夺' | '契约关系' | '公开服从';

export interface SM场景记录 {
  id: string;
  类型: SM场景类型;
  子类型: string;
  时间: string;
  地点: string;
  结果: '成功' | '失败' | '中断';
  服从度变化: number;
  权力天平变化: number;
  描述: string;
}
