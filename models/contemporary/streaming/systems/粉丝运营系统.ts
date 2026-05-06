/**
 * 粉丝运营系统 - 直播/短视频 NSFW 模块
 * 
 * v1.0: 粉丝团、粉丝关系、粉丝行为
 */

import {
  粉丝核心状态,
  粉丝身份,
  粉丝关系,
  粉丝等级,
  主播核心状态,
  粉丝团状态,
} from '../types';

/**
 * 默认粉丝团状态
 */
export function 创建粉丝团(): 粉丝团状态 {
  return {
    等级: 1,
    当前经验: 0,
    升级经验需求: 1000,
  };
}

/**
 * 计算粉丝团升级经验
 */
export function 计算升级经验(当前等级: number): number {
  return Math.floor(1000 * Math.pow(1.5, 当前等级 - 1));
}

/**
 * 粉丝团经验获取（基于打赏）
 */
export function 获取粉丝团经验(打赏金额: number): number {
  // 假设1元 = 10经验
  return 打赏金额 * 10;
}

/**
 * 粉丝团升级
 */
export function 尝试升级粉丝团(粉丝团: 粉丝团状态, 增加经验: number): 粉丝团状态 {
  let 新经验 = 粉丝团.当前经验 + 增加经验;
  let 新等级 = 粉丝团.等级;
  let 升级经验需求 = 粉丝团.升级经验需求;
  
  while (新经验 >= 升级经验需求 && 新等级 < 10) {
    新经验 -= 升级经验需求;
    新等级++;
    升级经验需求 = 计算升级经验(新等级);
  }
  
  return {
    等级: 新等级,
    当前经验: 新经验,
    升级经验需求,
  };
}

/**
 * 粉丝身份更新
 */
export function 更新粉丝身份(
  当前身份: 粉丝身份,
  累计打赏: number,
  是否是管理组: boolean = false
): 粉丝身份 {
  if (是否是管理组) return '管理组';
  if (累计打赏 >= 50000) return '粉丝团长';
  if (累计打赏 >= 1000) return '普通粉丝';
  return '普通粉丝';
}

/**
 * 粉丝关系进展
 */
export function 计算关系进展(
  当前关系: 粉丝关系,
  互动次数: number,
  累计打赏: number,
  私下互动: boolean
): 粉丝关系 {
  // 私下互动是关系升级的关键
  if (私下互动 && 累计打赏 >= 10000) {
    return '金主';
  }
  
  if (私下互动 && 累计打赏 >= 5000) {
    return '恋人';
  }
  
  if (互动次数 >= 10 || 累计打赏 >= 5000) {
    return '暧昧';
  }
  
  if (互动次数 >= 3 || 累计打赏 >= 500) {
    return '熟悉';
  }
  
  return '陌生';
}

/**
 * 检查是否越界（粉丝行为）
 */
export function 是否越界行为(
  粉丝状态: 粉丝核心状态,
  行为: string
): boolean {
  // 黑粉
  if (粉丝状态.关系 === '陌生' && 粉丝状态.攻击性 > 70) {
    return true;
  }
  
  // 私生饭行为
  if (行为.includes('跟踪') || 行为.includes('骚扰')) {
    return true;
  }
  
  return false;
}

/**
 * 记录恶意行为
 */
export function 记录恶意行为(
  粉丝状态: 粉丝核心状态,
  行为: string
): 粉丝核心状态 {
  return {
    ...粉丝状态,
    恶意行为: [...粉丝状态.恶意行为, 行为],
    骚扰记录: 粉丝状态.骚扰记录 + 1,
  };
}

/**
 * 主播拉黑粉丝
 */
export function 拉黑粉丝(
  主播状态: 主播核心状态,
  粉丝ID: string
): 主播核心状态 {
  // 如果是榜一大哥，需要特殊处理
  if (主播状态.榜一大哥ID === 粉丝ID) {
    return {
      ...主播状态,
      榜一大哥ID: undefined,
      黑名单: [...主播状态.黑名单, 粉丝ID],
    };
  }
  
  return {
    ...主播状态,
    黑名单: [...主播状态.黑名单, 粉丝ID],
  };
}

/**
 * 粉丝被移除黑名单
 */
export function 解除拉黑(
  主播状态: 主播核心状态,
  粉丝ID: string
): 主播核心状态 {
  return {
    ...主播状态,
    黑名单: 主播状态.黑名单.filter(id => id !== 粉丝ID),
  };
}

/**
 * 添加暧昧对象
 */
export function 添加暧昧对象(
  主播状态: 主播核心状态,
  粉丝ID: string
): 主播核心状态 {
  if (主播状态.暧昧对象列表.includes(粉丝ID)) {
    return 主播状态;
  }
  
  return {
    ...主播状态,
    暧昧对象列表: [...主播状态.暧昧对象列表, 粉丝ID],
  };
}

/**
 * 移除暧昧对象
 */
export function 移除暧昧对象(
  主播状态: 主播核心状态,
  粉丝ID: string
): 主播核心状态 {
  return {
    ...主播状态,
    暧昧对象列表: 主播状态.暧昧对象列表.filter(id => id !== 粉丝ID),
  };
}

/**
 * 更新榜一大哥
 */
export function 更新榜一大哥(
  主播状态: 主播核心状态,
  新榜一ID: string | undefined
): 主播核心状态 {
  return {
    ...主播状态,
    榜一大哥ID: 新榜一ID,
  };
}

/**
 * 计算粉丝粘性
 */
export function 计算粉丝粘性(
  互动次数: number,
  累计打赏: number,
  关注天数: number
): number {
  // 简化计算：互动、金额、时间权重各占1/3
  const 互动评分 = Math.min(100, 互动次数 * 2);
  const 金额评分 = Math.min(100, 累计打赏 / 100);
  const 时间评分 = Math.min(100, 关注天数);
  
  return Math.floor((互动评分 + 金额评分 + 时间评分) / 3);
}

/**
 * 计算粉丝攻击性
 */
export function 计算粉丝攻击性(
  骚扰记录: number,
  恶意行为数量: number,
  异常发言数量: number
): number {
  // 基础攻击性 + 各因素加权
  return Math.min(100, 骚扰记录 * 10 + 恶意行为数量 * 20 + 异常发言数量 * 5);
}
