/**
 * 潜水者状态
 * 
 * v1.0: 潜水者核心状态管理
 */

import type { 潜水者核心状态 } from '../types';

/**
 * 创建默认潜水者状态
 */
export function 创建潜水者状态(partial: Partial<潜水者核心状态> = {}): 潜水者核心状态 {
  return {
    ID: partial.ID || crypto.randomUUID(),
    昵称: partial.昵称 || '潜水者',
    本名: partial.本名,
    性别: partial.性别 || '男',
    年龄: partial.年龄 || 25,
    外貌: partial.外貌 || '普通外貌',

    // 潜水资质
    潜水等级: partial.潜水等级 || 'OW',
    潜水执照数量: partial.潜水执照数量 || 1,
    持证时间: partial.持证时间 || 6,
    总潜水次数: partial.总潜水次数 || 0,
    总潜水时长: partial.总潜水时长 || 0,

    // 擅长类型
    擅长潜水类型: partial.擅长潜水类型 || ['水肺潜水'],
    擅长潜点: partial.擅长潜点 || [],
    专长: partial.专长 || '深潜',

    // 心理状态
    水下焦虑度: partial.水下焦虑度 || 20,
    放松程度: partial.放松程度 || 50,
    感官敏感度: partial.感官敏感度 || 50,

    // 安全记录
    事故记录: partial.事故记录 || 0,
    紧急事件: partial.紧急事件 || 0,
    被救次数: partial.被救次数 || 0,
    救人次数: partial.救人次数 || 0,

    // 潜水装备
    自有装备: partial.自有装备 || [],
    需要租用: partial.需要租用 || ['面罩', '脚蹼', '潜水服'],
    装备保养状况: partial.装备保养状况 || 80,

    // 社交状态
    社交身份: partial.社交身份 || '独自旅行',
    当前同行人数: partial.当前同行人数 || 0,
    同行人关系: partial.同行人关系 || [],
    派对中暧昧对象: partial.派对中暧昧对象,
  };
}

/**
 * 潜水者状态默认值
 */
export const 潜水者状态默认值 = 创建潜水者状态();

/**
 * 潜水等级经验值配置
 */
export const 潜水等级经验配置: Record<string, { 所需次数: number; 所需时长: number }> = {
  'OW': { 所需次数: 0, 所需时长: 0 },
  'AOW': { 所需次数: 20, 所需时长: 15 },
  '救援潜水员': { 所需次数: 50, 所需时长: 40 },
  'DM': { 所需次数: 100, 所需时长: 80 },
  '教练': { 所需次数: 200, 所需时长: 150 },
};

/**
 * 计算潜水等级提升进度
 */
export function 计算等级进度(状态: 潜水者核心状态): { 等级: string; 进度: number } {
  const 当前等级 = 状态.潜水等级;
  const 等级顺序 = ['OW', 'AOW', '救援潜水员', 'DM', '教练'];
  const 当前索引 = 等级顺序.indexOf(当前等级);
  
  if (当前索引 === 等级顺序.length - 1) {
    return { 等级: 当前等级, 进度: 100 };
  }

  const 下一等级 = 等级顺序[当前索引 + 1];
  const 当前配置 = 潜水等级经验配置[当前等级];
  const 下一配置 = 潜水等级经验配置[下一等级];

  const 次数进度 = Math.min(1, 状态.总潜水次数 / 下一配置.所需次数);
  const 时长进度 = Math.min(1, 状态.总潜水时长 / 下一配置.所需时长);
  const 进度 = (次数进度 + 时长进度) / 2 * 100;

  return { 等级: 下一等级, 进度: Math.round(进度) };
}
