/**
 * 关系系统
 * 
 * 糖宝与糖爹关系的建立、演化、结束机制
 */

import type {
  糖宝核心状态,
  糖爹核心状态,
  糖关系状态完整,
  糖关系状态,
  关系模式,
} from './types';
import { 创建糖关系, 推进关系状态 as 推进关系, 模拟关系演化 } from '../states/关系状态';
import { 推进关系状态 as 更新糖宝关系, 更新糖宝状态 } from '../states/糖宝状态';
import { 推进糖爹关系状态 as 更新糖爹关系 } from '../states/糖爹状态';

// ==================== 关系阶段特征 ====================

export const 阶段特征 = {
  '筛选期': {
    糖宝投入: 0.3,
    糖爹投入: 0.3,
    物质交换: '少量测试',
    风险: '被骗',
  },
  '暧昧期': {
    糖宝投入: 0.5,
    糖爹投入: 0.5,
    物质交换: '确定零花钱',
    风险: '期望不符',
  },
  '蜜月期': {
    糖宝投入: 0.7,
    糖爹投入: 0.8,
    物质交换: '频繁赠送',
    风险: '暴露',
  },
  '稳定期': {
    糖宝投入: 0.6,
    糖爹投入: 0.5,
    物质交换: '稳定供给',
    风险: '倦怠',
  },
  '冷淡期': {
    糖宝投入: 0.4,
    糖爹投入: 0.3,
    物质交换: '减少',
    风险: '寻找新目标',
  },
  '危机期': {
    糖宝投入: 0.3,
    糖爹投入: 0.2,
    物质交换: '中断',
    风险: '曝光/报复',
  },
  '已结束': {
    糖宝投入: 0,
    糖爹投入: 0,
    物质交换: '无',
    风险: '后续纠纷',
  },
};

// ==================== 关系建立 ====================

// 建立新关系
export function 建立关系(
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态,
  月零花钱: number,
  模式: 关系模式 = '模糊不清'
): {
  关系: 糖关系状态完整;
  糖宝: 糖宝核心状态;
  糖爹: 糖爹核心状态;
} {
  const 关系 = 创建糖关系(糖宝.ID, 糖爹.ID, 月零花钱, 模式);

  const 更新后的糖宝 = 更新糖宝状态(糖宝, {
    当前糖爹ID: 糖爹.ID,
    关系状态: '筛选期',
    关系模式: 模式,
    月零花钱,
  });

  const 更新后的糖爹 = 更新糖爹关系(糖爹, {
    当前糖宝ID: 糖宝.ID,
    关系状态: '筛选期',
  });

  return {
    关系,
    糖宝: 更新后的糖宝,
    糖爹: 更新后的糖爹,
  };
}

// 进入暧昧期
export function 进入暧昧期(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态
): { 关系: 糖关系状态完整; 糖宝: 糖宝核心状态; 糖爹: 糖爹核心状态 } {
  const newRelation = 推进关系(关系, '暧昧期');
  const newSugarBaby = 更新糖宝关系(糖宝, '暧昧期');
  const newSugarDaddy = 更新糖爹关系(糖爹, '暧昧期');

  return {
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹: newSugarDaddy,
  };
}

// 进入蜜月期
export function 进入蜜月期(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态
): { 关系: 糖关系状态完整; 糖宝: 糖宝核心状态; 糖爹: 糖爹核心状态 } {
  const newRelation = 推进关系(关系, '蜜月期');
  const newSugarBaby = 更新糖宝关系(糖宝, '蜜月期');
  newSugarBaby.幸福度 = Math.min(100, 糖宝.幸福度 + 20);
  newSugarBaby.羞耻度 = Math.max(0, 糖宝.羞耻度 - 10);

  const newSugarDaddy = 更新糖爹关系(糖爹, '蜜月期');

  return {
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹: newSugarDaddy,
  };
}

// 进入稳定期
export function 进入稳定期(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态
): { 关系: 糖关系状态完整; 糖宝: 糖宝核心状态; 糖爹: 糖爹核心状态 } {
  const newRelation = 推进关系(关系, '稳定期');
  const newSugarBaby = 更新糖宝关系(糖宝, '稳定期');
  const newSugarDaddy = 更新糖爹关系(糖爹, '稳定期');

  return {
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹: newSugarDaddy,
  };
}

// ==================== 关系演化 ====================

// 推进关系时间（每月）
export function 推进关系时间(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态,
  月数: number = 1
): { 关系: 糖关系状态完整; 糖宝: 糖宝核心状态; 糖爹: 糖爹核心状态 } {
  let newRelation = 模拟关系演化(关系, 月数);

  // 更新糖宝状态
  let newSugarBaby = 更新糖宝状态(糖宝, {
    关系时长: 糖宝.关系时长 + 月数,
    累计获得: 糖宝.累计获得 + 关系.月零花钱 * 月数,
  });

  // 根据关系状态更新幸福度和焦虑度
  if (newRelation.状态 === '蜜月期') {
    newSugarBaby.幸福度 = Math.min(100, newSugarBaby.幸福度 + 5 * 月数);
    newSugarBaby.羞耻度 = Math.max(0, newSugarBaby.羞耻度 - 3 * 月数);
  } else if (newRelation.状态 === '冷淡期') {
    newSugarBaby.幸福度 = Math.max(0, newSugarBaby.幸福度 - 10 * 月数);
    newSugarBaby.焦虑度 = Math.min(100, newSugarBaby.焦虑度 + 8 * 月数);
  } else if (newRelation.状态 === '危机期') {
    newSugarBaby.焦虑度 = Math.min(100, newSugarBaby.焦虑度 + 15 * 月数);
    newSugarBaby.曝光风险 = Math.min(100, newSugarBaby.曝光风险 + 10 * 月数);
  }

  // 更新糖爹状态
  let newSugarDaddy = 更新糖爹关系(糖爹, newRelation.状态);
  newSugarDaddy.累计花费 = 糖爹.累计花费 + 关系.月零花钱 * 月数;

  return {
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹: newSugarDaddy,
  };
}

// 进入冷淡期
export function 进入冷淡期(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态,
  原因?: string
): { 关系: 糖关系状态完整; 糖宝: 糖宝核心状态; 糖爹: 糖爹核心状态 } {
  const newRelation = 推进关系(关系, '冷淡期');
  const newSugarBaby = 更新糖宝关系(糖宝, '冷淡期');
  const newSugarDaddy = 更新糖爹关系(糖爹, '冷淡期');

  return {
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹: newSugarDaddy,
  };
}

// 进入危机期
export function 进入危机期(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态
): { 关系: 糖关系状态完整; 糖宝: 糖宝核心状态; 糖爹: 糖爹核心状态 } {
  const newRelation = 推进关系(关系, '危机期');
  const newSugarBaby = 更新糖宝关系(糖宝, '危机期');
  newSugarBaby.焦虑度 = Math.min(100, 糖宝.焦虑度 + 20);
  newSugarBaby.曝光风险 = Math.min(100, 糖宝.曝光风险 + 15);

  const newSugarDaddy = 更新糖爹关系(糖爹, '危机期');
  newSugarDaddy.曝光风险 = Math.min(100, 糖爹.曝光风险 + 20);

  return {
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹: newSugarDaddy,
  };
}

// ==================== 关系结束 ====================

// 关系结束
export function 结束关系(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态,
  分手方式: '被分手' | '主动分手' | '协商分手',
  分手费?: number
): { 关系: 糖关系状态完整; 糖宝: 糖宝核心状态; 糖爹: 糖爹核心状态 } {
  const newRelation: 糖关系状态完整 = {
    ...推进关系(关系, '已结束'),
    预期结局: 分手方式 === '被分手' ? '被甩' : '正常分手',
  };

  // 计算分手费
  const fee = 分手费 ?? (关系.月零花钱 * (分手方式 === '被分手' ? 3 :分手方式 === '协商分手' ? 2 : 1));

  // 更新糖宝
  let newSugarBaby = 更新糖宝状态(糖宝, {
    当前糖爹ID: undefined,
    关系状态: '已结束',
    关系时长: 0,
    入行次数: 糖宝.入行次数 + 1,
    累计获得: 糖宝.累计获得 + fee,
    计划转型: 糖宝.计划转型 || (分手方式 === '被分手' && 关系.糖宝依赖度 < 30),
  });

  if (分手方式 === '被分手') {
    newSugarBaby.焦虑度 = Math.min(100, 糖宝.焦虑度 + 20);
    newSugarBaby.羞耻度 = Math.min(100, 糖宝.羞耻度 + 10);
  }

  // 更新糖爹
  const newSugarDaddy = 更新糖爹关系(糖爹, '已结束');
  newSugarDaddy.累计花费 = 糖爹.累计花费 + fee;

  return {
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹: newSugarDaddy,
  };
}

// 转正（从糖宝变老婆）
export function 尝试转正(
  关系: 糖关系状态完整,
  糖宝: 糖宝核心状态,
  糖爹: 糖爹核心状态
): {
  成功: boolean;
  关系: 糖关系状态完整;
  糖宝: 糖宝核心状态;
  糖爹: 糖爹核心状态;
  原因: string;
} {
  // 转正条件
  if (关系.持续时间 < 18) {
    return {
      成功: false,
      关系,
      糖宝,
      糖爹,
      原因: '关系时长不足18个月',
    };
  }

  if (糖宝.情感依赖度 < 60) {
    return {
      成功: false,
      关系,
      糖宝,
      糖爹,
      原因: '糖宝情感依赖度不足',
    };
  }

  if (糖爹.婚姻状态 !== '未婚' && !糖爹.配偶知情) {
    return {
      成功: false,
      关系,
      糖宝,
      糖爹,
      原因: '糖爹婚姻状况不允许',
    };
  }

  // 转正成功
  const newRelation: 糖关系状态完整 = {
    ...关系,
    预期结局: '转正',
    重大事件: [...关系.重大事件, '转正'],
  };

  const newSugarBaby = 更新糖宝状态(糖宝, {
    计划转型: true,
    转型方向: '结婚',
  });

  return {
    成功: true,
    关系: newRelation,
    糖宝: newSugarBaby,
    糖爹,
    原因: '转正成功',
  };
}

// ==================== 关系诊断 ====================

// 诊断关系健康度
export function 诊断关系健康度(关系: 糖关系状态完整): {
  健康度: number;
  状态: '危险' | '一般' | '良好' | '甜蜜';
  问题: string[];
  建议: string[];
} {
  const 健康度 = Math.round(
    (关系.糖宝满意度 + 关系.糖宝投入度 + 关系.糖爹满意度 + 关系.糖爹投入度) / 4
  );

  const 状态 = 健康度 >= 80 ? '甜蜜' : 健康度 >= 60 ? '良好' : 健康度 >= 40 ? '一般' : '危险';
  const 问题: string[] = [];
  const 建议: string[] = [];

  if (关系.状态 === '冷淡期') {
    问题.push('关系处于冷淡期');
    建议.push('增加见面频率，送礼物挽回');
  }

  if (关系.状态 === '危机期') {
    问题.push('关系处于危机期');
    建议.push('谨慎处理，考虑是否继续');
  }

  if (关系.糖宝满意度 < 50) {
    问题.push('糖宝满意度低');
    建议.push('糖爹应增加投入');
  }

  if (关系.糖宝依赖度 < 30 && 关系.持续时间 > 6) {
    问题.push('糖宝依赖度异常低，可能已有备胎');
    建议.push('注意关系稳定性');
  }

  if (关系.危机事件.length > 0) {
    问题.push(`存在${关系.危机事件.length}个危机事件`);
    建议.push('注意风险控制');
  }

  return { 健康度, 状态, 问题, 建议 };
}
