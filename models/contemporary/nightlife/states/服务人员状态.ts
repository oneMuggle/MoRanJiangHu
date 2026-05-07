/**
 * 服务人员核心状态
 * 夜场/KTV NSFW 模块
 */

import type { 服务人员核心状态, 服务人员类型, 服务人员级别 } from '../types';

/**
 * 创建默认服务人员状态
 */
export function 创建服务人员状态(params: {
  ID: string;
  化名: string;
  性别: '男' | '女';
  年龄: number;
  类型: 服务人员类型;
  所属场所: string;
}): 服务人员核心状态 {
  const {
    ID,
    化名,
    性别,
    年龄,
    类型,
    所属场所,
  } = params;

  return {
    ID,
    化名,
    本名: undefined,
    性别,
    年龄,
    身高: 性别 === '女' ? 160 + Math.floor(Math.random() * 15) : 170 + Math.floor(Math.random() * 15),
    体重: 性别 === '女' ? 45 + Math.floor(Math.random() * 15) : 60 + Math.floor(Math.random() * 15),
    外貌评分: 6 + Math.random() * 4, // 6-10

    类型,
    所属场所,
    入行时长: 1 + Math.floor(Math.random() * 60), // 1-60个月
    级别: '普通',

    唱功: 50 + Math.random() * 50,
    酒量: 50 + Math.random() * 50,
    社交能力: 50 + Math.random() * 50,
    察言观色: 50 + Math.random() * 50,
    应对技巧: 50 + Math.random() * 50,

    羞耻度: 30 + Math.random() * 40,
    麻木度: 20 + Math.random() * 50,
    自我保护: 50 + Math.random() * 50,
    赚钱欲望: 50 + Math.random() * 50,
    酒精依赖: 20 + Math.random() * 40,

    被骚扰次数: 0,
    被迫出台次数: 0,
    被下药次数: 0,
    受伤次数: 0,

    月收入: 5000 + Math.floor(Math.random() * 20000),
    小费收入: 0,
    出台收入: 0,
    债务: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) : 0,

    计划转型: false,
    转型方向: undefined,
    存钱目标: 100000 + Math.floor(Math.random() * 400000),
  };
}

/**
 * 公主/佳丽级别升级判断
 */
export function 判断级别升级(状态: 服务人员核心状态): 服务人员级别 | null {
  if (状态.级别 === '头牌') return null;

  const 综合评分 = 
    状态.外貌评分 * 0.3 +
    状态.唱功 * 0.1 +
    状态.酒量 * 0.1 +
    状态.社交能力 * 0.2 +
    状态.察言观色 * 0.15 +
    状态.应对技巧 * 0.15;

  if (状态.级别 === '普通' && 综合评分 > 75 && 状态.入行时长 > 6) {
    return '高级';
  }
  if (状态.级别 === '高级' && 综合评分 > 88 && 状态.入行时长 > 18) {
    return '头牌';
  }
  return null;
}

/**
 * 计算出台意愿
 */
export function 计算出台意愿(状态: 服务人员核心状态, params: {
  客人小费: number;
  客人魅力: number;
  妈咪态度: '强制' | '劝说' | '尊重';
  当前醉酒值: number;
}): { 意愿: number; 风险: number } {
  const { 客人小费, 客人魅力, 妈咪态度, 当前醉酒值 } = params;

  // 基础意愿
  let 意愿 = 30;
  let 风险 = 20;

  // 小费影响
  if (客人小费 > 5000) 意愿 += 30;
  else if (客人小费 > 2000) 意愿 += 20;
  else if (客人小费 > 1000) 意愿 += 10;

  // 魅力影响
  if (客人魅力 > 8) 意愿 += 15;
  else if (客人魅力 > 6) 意愿 += 5;

  // 妈咪态度影响
  if (妈咪态度 === '强制') {
    意愿 += 10;
    风险 += 30;
  } else if (妈咪态度 === '劝说') {
    意愿 += 5;
    风险 += 10;
  }

  // 醉酒影响
  if (当前醉酒值 > 60) {
    意愿 -= 20;
    风险 += 40;
  } else if (当前醉酒值 > 40) {
    意愿 -= 10;
    风险 += 20;
  }

  // 赚钱欲望加成
  意愿 += (状态.赚钱欲望 - 50) * 0.3;

  // 麻木度加成（越麻木越愿意）
  意愿 += (状态.麻木度 - 50) * 0.2;

  // 自我保护降低风险
  风险 -= (状态.自我保护 - 50) * 0.3;

  return {
    意愿: Math.max(0, Math.min(100, 意愿)),
    风险: Math.max(0, Math.min(100, 风险)),
  };
}

/**
 * 出台后风险评估
 */
export const 出台风险表 = [
  '被占更多便宜',
  '被拍照/录像',
  '被传染疾病',
  '被卖给其他人',
  '被抢劫/勒索',
];

/**
 * 计算被打扰概率
 */
export function 计算被打扰概率(场所状态: { 安保水平: '弱' | '中' | '强'; 监控覆盖: number }): number {
  if (场所状态.安伴水平 === '强') return 0.1;
  if (场所状态.安伴水平 === '中') return 0.3;
  return 0.6;
}
