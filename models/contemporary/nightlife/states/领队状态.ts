/**
 * 领队/妈咪状态
 * 夜场/KTV NSFW 模块
 */

import type { 领队状态, 领队类型, 服务人员类型, 带队风格 } from '../types';

/**
 * 创建默认领队状态
 */
export function 创建领队状态(params: {
  ID: string;
  昵称: string;
  性别: '男' | '女';
  年龄: number;
  类型?: 领队类型;
}): 领队状态 {
  const {
    ID,
    昵称,
    性别,
    年龄,
    类型 = '妈咪',
  } = params;

  return {
    ID,
    昵称,
    性别,
    年龄,

    管理人数: 5 + Math.floor(Math.random() * 20),
    手下类型: 获取手下类型列表(类型),
    江湖地位: 30 + Math.random() * 60,

    客户资源: [],
    场所关系: [],
    渠道关系: [],

    带队风格: 获取带队风格(类型),
    保护手下: 类型 === '妈咪助理' ? 60 : 30,
    压榨程度: 类型 === '渠道中介' ? 70 : 50,

    月入: 30000 + Math.floor(Math.random() * 100000),
    抽成比例: 0.2 + Math.random() * 0.2,
  };
}

/**
 * 获取手下类型列表
 */
function 获取手下类型列表(类型: 领队类型): 服务人员类型[] {
  switch (类型) {
    case '妈咪':
      return ['公主', '佳丽'];
    case '男模领队':
      return ['少爷', '模特'];
    case '妈咪助理':
      return ['公主', '佳丽'];
    case '渠道中介':
      return ['公主', '少爷', '模特', '佳丽'];
    default:
      return ['公主'];
  }
}

/**
 * 获取带队风格
 */
function 获取带队风格(类型: 领队类型): 带队风格 {
  switch (类型) {
    case '妈咪':
      return Math.random() > 0.5 ? '严厉' : '利益至上';
    case '男模领队':
      return '严厉';
    case '妈咪助理':
      return '温和';
    case '渠道中介':
      return '利益至上';
    default:
      return '利益至上';
  }
}

/**
 * 计算抽成收入
 */
export function 计算抽成收入(领队: 领队状态, 手下总收入: number): number {
  return Math.floor(手下总收入 * 领队.抽成比例);
}

/**
 * 判断是否保护手下
 */
export function 是否保护手下(领队: 领队状态, 风险程度: number): boolean {
  // 保护手下意愿 = 保护程度 - 压榨程度 + 江湖地位影响
  const 保护意愿 = 领队.保护手下 - 领队.压榨程度 * 0.5 + (领队.江湖地位 - 50) * 0.3;
  
  // 风险程度越高，越可能保护
  return 保护意愿 + 风险程度 * 0.5 > 50;
}
