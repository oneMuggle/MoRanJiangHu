/**
 * 医美中介状态管理
 */

import type { 医美中介状态 } from '../types';

// 创建默认中介状态
export function 创建默认中介状态(partial?: Partial<医美中介状态>): 医美中介状态 {
  return {
    中介ID: partial?.中介ID || `中介_${Date.now()}`,
    昵称: partial?.昵称 || '小美',
    性别: partial?.性别 || '女',
    年龄: partial?.年龄 || 28,

    // 渠道能力
    合作医院: partial?.合作医院 || [],
    客源数量: partial?.客源数量 || 0,
    成交率: partial?.成交率 || 60,

    // 收入
    中介抽成: partial?.中介抽成 || 50,
    月收入: partial?.月收入 || 30000,
    累计收入: partial?.累计收入 || 500000,

    // 风格
    推销力度: partial?.推销力度 || 70,
    良心程度: partial?.良心程度 || 40,
    承诺水分: partial?.承诺水分 || 30,

    // 道德风险
    坑蒙拐骗: partial?.坑蒙拐骗 || 20,
    虚假承诺: partial?.虚假承诺 || 25,
  };
}

// 根据风格创建中介
export function 根据风格创建中介(
  风格: '良心' | '普通' | '黑心'
): 医美中介状态 {
  const base = 创建默认中介状态();

  switch (风格) {
    case '良心':
      base.昵称 = '阿雪';
      base.推销力度 = 40;
      base.良心程度 = 80;
      base.承诺水分 = 10;
      base.坑蒙拐骗 = 5;
      base.虚假承诺 = 10;
      base.中介抽成 = 30;
      break;

    case '普通':
      base.昵称 = '小丽';
      base.推销力度 = 70;
      base.良心程度 = 40;
      base.承诺水分 = 30;
      base.坑蒙拐骗 = 20;
      base.虚假承诺 = 30;
      base.中介抽成 = 50;
      break;

    case '黑心':
      base.昵称 = '阿强';
      base.性别 = '男';
      base.推销力度 = 90;
      base.良心程度 = 10;
      base.承诺水分 = 60;
      base.坑蒙拐骗 = 60;
      base.虚假承诺 = 70;
      base.中介抽成 = 70;
      break;
  }

  return base;
}

// 计算中介可信度
export function 计算中介可信度(中介: 医美中介状态): {
  可信度: number;
  风险等级: '低' | '中' | '高';
  主要问题: string[];
} {
  let 可信度 = 100;
  const 主要问题: string[] = [];

  // 良心程度低
  if (中介.良心程度 < 30) {
    可信度 -= 40;
    主要问题.push('推荐医院质量堪忧');
  } else if (中介.良心程度 < 60) {
    可信度 -= 20;
  }

  // 承诺水分高
  if (中介.承诺水分 > 50) {
    可信度 -= 30;
    主要问题.push('承诺与实际可能不符');
  } else if (中介.承诺水分 > 30) {
    可信度 -= 15;
  }

  // 坑蒙拐骗
  if (中介.坑蒙拐骗 > 40) {
    可信度 -= 30;
    主要问题.push('存在欺诈行为');
  } else if (中介.坑蒙拐骗 > 20) {
    可信度 -= 15;
  }

  // 虚假承诺
  if (中介.虚假承诺 > 50) {
    可信度 -= 25;
    主要问题.push('承诺多为虚假');
  } else if (中介.虚假承诺 > 30) {
    可信度 -= 10;
  }

  可信度 = Math.max(0, Math.min(100, 可信度));

  let 风险等级: '低' | '中' | '高' = '低';
  if (可信度 < 40) 风险等级 = '高';
  else if (可信度 < 70) 风险等级 = '中';

  return { 可信度, 风险等级, 主要问题 };
}

// 更新中介状态
export function 更新中介状态(
  state: 医美中介状态,
  updates: Partial<医美中介状态>
): 医美中介状态 {
  return { ...state, ...updates };
}

// 记录成交
export function 记录成交(
  中介: 医美中介状态,
  手术金额: number
): 医美中介状态 {
  const 中介费 = 手术金额 * (中介.中介抽成 / 100);

  return 更新中介状态(中介, {
    客源数量: 中介.客源数量 + 1,
    月收入: 中介.月收入 + 中介费,
    累计收入: 中介.累计收入 + 中介费,
  });
}

// 获取中介摘要
export function 获取中介摘要(state: 医美中介状态): string {
  const { 可信度, 风险等级 } = 计算中介可信度(state);
  return `${state.昵称}（${state.性别}，${state.年龄}岁）`
    + `| 合作${state.合作医院.length}家医院 | 成交${state.客源数量}单`
    + `| 抽成:${state.中介抽成}% | 月入${state.月收入}元`
    + `| 可信度:${可信度} | 风险:${风险等级}`;
}
