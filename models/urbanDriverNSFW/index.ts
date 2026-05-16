/**
 * 都市网约车 NSFW 深化系统数据模型 — 模块化入口
 *
 * v1.0: 乘客欲望状态机、行程场景系统、后果系统
 */

// 核心类型
export type {
  乘客欲望阶段,
  行程关系轨道,
  权力倾向,
  乘客欲望档案,
  亲密里程碑,
  后果记录,
  醉酒状态,
  药物状态,
} from './core';

// 场景类型
export type {
  行程NSFW类型,
  乘客类型,
  行程地点,
} from './scenarios';
export {
  预设乘客列表,
  深夜时段,
  是否为深夜,
  地点风险,
  行程NSFW判定规则,
} from './scenarios';

// 后果类型
export type {
  网约车后果类型,
  后果事件,
} from './consequences';
export {
  后果严重度权重,
  后果叙事模板,
} from './consequences';

// 设置接口
export interface 都市网约车NSFW设置 {
  启用都市网约车NSFW系统: boolean;
  NSFW内容强度: '微暗' | '暧昧' | '露骨';

  // 场景开关
  启用醉酒乘客场景: boolean;
  醉酒场景强度: '关闭' | '轻度' | '中度' | '深度';
  启用饮料下药场景: boolean;
  下药场景强度: '关闭' | '轻度' | '中度' | '深度';
  首选药物类型: '迷药' | '安眠药' | '兴奋剂' | '催情药' | '致幻剂' | '记忆阻断剂' | '随机';
  启用深夜独处场景: boolean;
  启用后座暗示场景: boolean;
  启用停车场秘密场景: boolean;
  启用拼车暧昧场景: boolean;
  启用常客关系系统: boolean;
  启用行车记录仪系统: boolean;

  // 后果系统
  启用后果系统: boolean;
  后果严重程度: '轻微' | '中等' | '严重' | '毁灭';
  启用平台处罚: boolean;
  启用网络传播: boolean;
  启用警察盘查: boolean;
  启用勒索威胁: boolean;

  // 频率控制
  NSFW行程触发频率: '低' | '中' | '高';
}

export const 默认都市网约车NSFW设置: 都市网约车NSFW设置 = {
  启用都市网约车NSFW系统: false,
  NSFW内容强度: '暧昧',
  启用醉酒乘客场景: false,
  醉酒场景强度: '关闭',
  启用饮料下药场景: false,
  下药场景强度: '关闭',
  首选药物类型: '随机',
  启用深夜独处场景: false,
  启用后座暗示场景: false,
  启用停车场秘密场景: false,
  启用拼车暧昧场景: false,
  启用常客关系系统: false,
  启用行车记录仪系统: false,
  启用后果系统: true,
  后果严重程度: '中等',
  启用平台处罚: true,
  启用网络传播: false,
  启用警察盘查: false,
  启用勒索威胁: false,
  NSFW行程触发频率: '中',
};

// 挂载点接口
export interface 都市网约车系统扩展 {
  行程系统?: {
    乘客欲望档案: Record<string, import('./core').乘客欲望档案>;
    活跃场景标签: import('./scenarios').行程NSFW类型[];
    当前地点: import('./scenarios').行程地点 | null;
    行车记录仪状态: '关闭' | '录制中' | '已泄露';
    后果列表: import('./consequences').后果事件[];
    常客记录: { 乘客Id: string; 搭乘次数: number; 最后时间: number }[];
  };
}
