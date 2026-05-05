/**
 * 校园 NSFW v1.2 SM/支配服从系统 + v1.6 BDSM 关系管线
 * 权力天平、服从度、契约、SM场景、调教任务、关系状态
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

// v1.6 BDSM 关系管线

export type BDSM任务类型 =
  | '服从测试'
  | '忠诚考验'
  | '技能训练'
  | '心理建设'
  | '公开挑战'
  | '日常指令'
  | '信物任务'
  | '契约履行';

export type BDSM任务难度 = '入门' | '初级' | '中级' | '高级' | '极限';

export type BDSM任务状态 = '待接受' | '进行中' | '已完成' | '已失败' | '已放弃';

export type BDSM评价等级 = '完美服从' | '优秀' | '良好' | '勉强' | '失败' | '拒绝';

export type 关系阶段 = '初识' | '试探' | '确立' | '深入' | '固化';

export interface BDSM调教任务 {
  id: string;
  类型: BDSM任务类型;
  标题: string;
  描述: string;
  难度: BDSM任务难度;
  发布者: string;
  接受者: string;
  状态: BDSM任务状态;
  发布时间: string;
  截止时间?: string;
  完成时间?: string;
  评价?: BDSM评价等级;
  服从度变化: number;
  奖励描述?: string;
  惩罚描述?: string;
  前置任务ID?: string;
  关联契约ID?: string;
  关联场景?: SM场景类型;
}

export interface BDSM日常指令 {
  content: string;
  category: '称呼' | '穿着' | '行为' | '报告' | '任务';
  duration: string;
  是否完成: boolean;
  rewardHint: string;
  punishmentHint: string;
}

export interface BDSM里程碑 {
  类型: string;
  时间: string;
  描述: string;
}

export interface BDSM关系状态 {
  阶段: 关系阶段;
  服从度: number;
  权力天平: number;         // -50(绝对服从) ~ +50(绝对支配)
  契约记录: 契约记录[];
  任务历史: BDSM调教任务[];
  日常指令: BDSM日常指令[];
  里程碑: BDSM里程碑[];
  安全词: string;
  底线列表: string[];
}
