/**
 * 宠物主人状态管理
 */

import type {
  主人核心状态,
  主人身份,
  养宠动机,
  消费能力,
} from '../types';

// 默认昵称池
const 昵称池 = [
  '铲屎官小王', '猫咪控', '汪星人', '宠物妈妈', '爱宠人士',
  '萌宠达人', '铲屎官', '毛孩子家长', '宠物日记', '养宠日记',
];

// 创建默认主人状态
export function 创建默认主人状态(partial?: Partial<主人核心状态>): 主人核心状态 {
  return {
    ID: partial?.ID || `主人_${Date.now()}`,
    昵称: partial?.昵称 || 昵称池[Math.floor(Math.random() * 昵称池.length)],
    真实身份: partial?.真实身份,
    性别: partial?.性别 || '女',
    年龄: partial?.年龄 || 28,

    // 养宠情况
    养宠经验: partial?.养宠经验 ?? 2,
    当前宠物: partial?.当前宠物 || [],
    养宠动机: partial?.养宠动机 || '情感陪伴',
    消费能力: partial?.消费能力 || '小康型',

    // 经济状况
    月均宠物消费: partial?.月均宠物消费 ?? 1500,
    年宠物消费: partial?.年宠物消费 ?? 18000,
    愿意为单次医疗支付: partial?.愿意为单次医疗支付 ?? 5000,

    // 心理状态
    情感依赖度: partial?.情感依赖度 ?? 50,
    理性程度: partial?.理性程度 ?? 60,
    社交需求: partial?.社交需求 ?? 40,
    焦虑程度: partial?.焦虑程度 ?? 30,

    // 社交状态
    宠物圈社交: partial?.宠物圈社交 ?? 30,
    宠物博主关注: partial?.宠物博主关注 || [],
    网红程度: partial?.网红程度 ?? 0,
    粉丝数: partial?.粉丝数 ?? 0,

    // 安全意识
    保险意识: partial?.保险意识 ?? 30,
    医疗常识: partial?.医疗常识 ?? 40,
    法律意识: partial?.法律意识 ?? 30,
  };
}

// 根据身份类型创建主人
export function 根据身份创建主人(
  身份: 主人身份,
  性别: '男' | '女',
  年龄?: number
): 主人核心状态 {
  const base = 创建默认主人状态({ 性别, 年龄, 身份 } as any);

  switch (身份) {
    case '单身白领':
      base.养宠动机 = '情感陪伴';
      base.消费能力 = '中产型';
      base.月均宠物消费 = 2000;
      base.社交需求 = 60;
      break;
    case '情侣/夫妻':
      base.养宠动机 = '情感陪伴';
      base.消费能力 = '小康型';
      base.月均宠物消费 = 1200;
      break;
    case '有钱有闲':
      base.养宠动机 = '身份象征';
      base.消费能力 = '奢侈型';
      base.月均宠物消费 = 10000;
      base.理性程度 = 40;
      break;
    case '网红/博主':
      base.养宠动机 = '社交需求';
      base.消费能力 = '奢侈型';
      base.月均宠物消费 = 8000;
      base.网红程度 = 70;
      base.粉丝数 = 50000;
      break;
    case '繁殖者':
      base.养宠动机 = '投资繁育';
      base.消费能力 = '中产型';
      base.养宠经验 = 10;
      base.医疗常识 = 80;
      break;
    case '救助者':
      base.养宠动机 = '救助心理';
      base.消费能力 = '基础型';
      base.情感依赖度 = 70;
      base.理性程度 = 80;
      break;
  }

  return base;
}

// 更新主人状态
export function 更新主人状态(
  state: 主人核心状态,
  updates: Partial<主人核心状态>
): 主人核心状态 {
  return { ...state, ...updates };
}

// 增加宠物
export function 添加宠物(
  state: 主人核心状态,
  宠物ID: string
): 主人核心状态 {
  return 更新主人状态(state, {
    当前宠物: [...state.当前宠物, 宠物ID],
  });
}

// 移除宠物
export function 移除宠物(
  state: 主人核心状态,
  宠物ID: string
): 主人核心状态 {
  return 更新主人状态(state, {
    当前宠物: state.当前宠物.filter(id => id !== 宠物ID),
  });
}

// 消费能力变化
export function 更新消费能力(
  state: 主人核心状态,
  消费类型: '增加' | '减少',
  金额: number
): 主人核心状态 {
  const 月均宠物消费 = 消费类型 === '增加' 
    ? state.月均宠物消费 + 金额 
    : Math.max(0, state.月均宠物消费 - 金额);

  // 消费能力变化影响心理
  const 焦虑程度 = 消费类型 === '增加' && 金额 > 5000
    ? Math.min(100, state.焦虑程度 + 10)
    : state.焦虑程度;

  return 更新主人状态(state, {
    月均宠物消费,
    年宠物消费: 月均宠物消费 * 12,
    焦虑程度,
  });
}

// 社交能力提升
export function 提升社交能力(
  state: 主人核心状态,
  提升值: number
): 主人核心状态 {
  return 更新主人状态(state, {
    宠物圈社交: Math.min(100, state.宠物圈社交 + 提升值),
    社交需求: Math.min(100, state.社交需求 + Math.floor(提升值 / 2)),
  });
}

// 医疗决策理性化
export function 提升医疗理性(state: 主人核心状态): 主人核心状态 {
  return 更新主人状态(state, {
    理性程度: Math.min(100, state.理性程度 + 5),
    焦虑程度: Math.max(0, state.焦虑程度 - 5),
  });
}

// 获取主人摘要
export function 获取主人摘要(state: 主人核心状态): string {
  return `${state.昵称}（${state.性别}，${state.年龄}岁）`
    + `| 养宠${state.养宠经验}年 | ${state.消费能力}`
    + `| 月消费${state.月均宠物消费}元 | 社交需求${state.社交需求}`;
}
