/**
 * 打赏系统 - 直播/短视频 NSFW 模块
 * 
 * v1.0: 打赏等级、收益计算、特权解锁
 */

import {
  粉丝等级,
  粉丝核心状态,
  主播核心状态,
  打赏等级列表,
  打赏等级权益,
} from '../types';

/**
 * 根据累计打赏计算粉丝等级
 */
export function 计算粉丝等级(累计打赏: number): 粉丝等级 {
  // 按累计金额排序，从高到低检查
  const sortedLevels = [...打赏等级列表].sort((a, b) => b.累计金额 - a.累计金额);
  
  for (const level of sortedLevels) {
    if (累计打赏 >= level.累计金额) {
      return level.等级;
    }
  }
  
  return '潜水';
}

/**
 * 获取等级的解锁权限
 */
export function 获取等级权限(等级: 粉丝等级): string[] {
  const levelConfig = 打赏等级列表.find(l => l.等级 === 等级);
  return levelConfig?.解锁权限 || [];
}

/**
 * 计算打赏收益（平台抽成后）
 */
export function 计算打赏收益(
  打赏金额: number,
  平台抽成比例: number = 0.4,
  公会抽成比例: number = 0.2
): { 平台收益: number; 公会收益: number; 主播收益: number } {
  const 平台收益 = Math.floor(打赏金额 * 平台抽成比例);
  const 公会收益 = Math.floor(打赏金额 * 公会抽成比例);
  const 主播收益 = 打赏金额 - 平台收益 - 公会收益;
  
  return { 平台收益, 公会收益, 主播收益 };
}

/**
 * 检查是否能解锁私下互动
 */
export function 可解锁私下互动(粉丝状态: 粉丝核心状态): boolean {
  return 粉丝状态.等级 === '榜一' || 粉丝状态.等级 === '皇帝';
}

/**
 * 计算月榜排名
 */
export function 计算月榜排名(粉丝月打赏列表: { 粉丝ID: string; 月打赏: number }[]): string[] {
  return 粉丝月打赏列表
    .sort((a, b) => b.月打赏 - a.月打赏)
    .map(f => f.粉丝ID);
}

/**
 * 获取榜一大哥ID
 */
export function 获取榜一大哥(粉丝月打赏列表: { 粉丝ID: string; 月打赏: number }[]): string | undefined {
  const ranking = 计算月榜排名(粉丝月打赏列表);
  return ranking[0];
}

/**
 * 检查粉丝是否达到守护等级
 */
export function 是守护等级(累计打赏: number): boolean {
  return 累计打赏 >= 5000;
}

/**
 * 计算下次升级还需多少打赏
 */
export function 计算升级差距(累计打赏: number): { 下一等级: 粉丝等级 | null; 差距: number } {
  const sortedLevels = [...打赏等级列表]
    .filter(l => l.累计金额 > 0)
    .sort((a, b) => a.累计金额 - b.累计金额);
  
  for (const level of sortedLevels) {
    if (累计打赏 < level.累计金额) {
      return { 下一等级: level.等级, 差距: level.累计金额 - 累计打赏 };
    }
  }
  
  return { 下一等级: null, 差距: 0 };
}

/**
 * 应用打赏到主播状态
 */
export function 应用打赏到主播(
  主播状态: 主播核心状态,
  打赏金额: number,
  平台抽成比例: number = 0.4,
  公会抽成比例: number = 0.2
): 主播核心状态 {
  const { 主播收益 } = 计算打赏收益(打赏金额, 平台抽成比例, 公会抽成比例);
  
  return {
    ...主播状态,
    月收入: 主播状态.月收入 + 主播收益,
    累计收入: 主播状态.累计收入 + 主播收益,
  };
}

/**
 * 应用打赏到粉丝状态
 */
export function 应用打赏到粉丝(
  粉丝状态: 粉丝核心状态,
  打赏金额: number
): 粉丝核心状态 {
  const 新累计打赏 = 粉丝状态.累计打赏 + 打赏金额;
  const 新月打赏 = 粉丝状态.月打赏 + 打赏金额;
  const 新等级 = 计算粉丝等级(新累计打赏);
  
  return {
    ...粉丝状态,
    累计打赏: 新累计打赏,
    月打赏: 新月打赏,
    等级: 新等级,
    已解锁私下互动: 可解锁私下互动({ ...粉丝状态, 累计打赏: 新累计打赏, 等级: 新等级 }),
  };
}
