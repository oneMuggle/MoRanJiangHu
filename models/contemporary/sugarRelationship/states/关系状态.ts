/**
 * 糖关系状态管理
 */

import type {
  糖关系状态完整,
  糖关系状态,
  关系模式,
  关系事件,
  危机事件,
  零花钱级别,
} from './types';

// 创建新关系
export function 创建糖关系(
  糖宝ID: string,
  糖爹ID: string,
  月零花钱: number,
  模式: 关系模式 = '模糊不清'
): 糖关系状态完整 {
  return {
    关系ID: `关系_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    糖宝ID,
    糖爹ID,
    状态: '筛选期',
    模式,
    开始时间: new Date().toISOString(),
    持续时间: 0,
    月零花钱,
    付款方式: '月结',
    是否签协议: false,
    专属条款: [],
    红线条款: ['不拍照', '不录像', '不外传'],
    糖宝满意度: 50,
    糖宝投入度: 30,
    糖宝依赖度: 20,
    糖爹满意度: 50,
    糖爹投入度: 30,
    糖爹控制度: 40,
    礼物清单: [],
    重大事件: [],
    危机事件: [],
    预期持续时间: 12,
    预期结局: '未知',
  };
}

// 推进关系状态
export function 推进关系状态(
  关系: 糖关系状态完整,
  新状态: 糖关系状态
): 糖关系状态完整 {
  const updates: Partial<糖关系状态完整> = { 状态: 新状态 };

  switch (新状态) {
    case '暧昧期':
      updates.糖宝投入度 = 50;
      updates.糖爹投入度 = 50;
      break;
    case '蜜月期':
      updates.糖宝满意度 = 80;
      updates.糖宝投入度 = 70;
      updates.糖爹投入度 = 80;
      break;
    case '稳定期':
      updates.糖宝满意度 = 65;
      updates.糖宝投入度 = 60;
      updates.糖爹投入度 = 55;
      break;
    case '冷淡期':
      updates.糖宝满意度 = Math.max(0, 关系.糖宝满意度 - 30);
      updates.糖宝投入度 = Math.max(0, 关系.糖宝投入度 - 20);
      break;
    case '危机期':
      updates.糖宝满意度 = Math.max(0, 关系.糖宝满意度 - 40);
      break;
    case '已结束':
      updates.预期持续时间 = 0;
      break;
  }

  return { ...关系, ...updates };
}

// 添加礼物记录
export function 添加礼物记录(
  关系: 糖关系状态完整,
  内容: string,
  价值: number,
  类型: '现金' | '奢侈品' | '房产' | '转账' | '其他'
): 糖关系状态完整 {
  return {
    ...关系,
    礼物清单: [
      ...关系.礼物清单,
      {
        时间: new Date().toISOString(),
        内容,
        价值,
        类型,
      },
    ],
  };
}

// 添加关系事件
export function 添加关系事件(
  关系: 糖关系状态完整,
  事件: 关系事件
): 糖关系状态完整 {
  if (关系.重大事件.includes(事件)) {
    return 关系;
  }
  return {
    ...关系,
    重大事件: [...关系.重大事件, 事件],
  };
}

// 添加危机事件
export function 添加危机事件(
  关系: 糖关系状态完整,
  事件: 危机事件
): 糖关系状态完整 {
  if (关系.危机事件.includes(事件)) {
    return 关系;
  }
  return {
    ...关系,
    危机事件: [...关系.危机事件, 事件],
  };
}

// 更新情感指数
export function 更新情感指数(
  关系: 糖关系状态完整,
  更新: Partial<Pick<糖关系状态完整, '糖宝满意度' | '糖宝投入度' | '糖宝依赖度' | '糖爹满意度' | '糖爹投入度' | '糖爹控制度'>>
): 糖关系状态完整 {
  return {
    ...关系,
    ...更新,
  };
}

// 计算关系紧密度
export function 计算关系紧密度(关系: 糖关系状态完整): number {
  const 物质权重 = 0.3;
  const 情感权重 = 0.4;
  const 时间权重 = 0.3;

  const 物质得分 = Math.min(1, 关系.月零花钱 / 300000) * 100 * 物质权重;
  const 情感得分 = ((关系.糖宝满意度 + 关系.糖宝投入度 + 关系.糖宝依赖度) / 3) * 情感权重;
  const 时间得分 = Math.min(1, 关系.持续时间 / 24) * 100 * 时间权重;

  return Math.round(物质得分 + 情感得分 + 时间得分);
}

// 计算零花钱级别
export function 计算零花钱级别(月零花钱: number): 零花钱级别 {
  if (月零花钱 < 20000) return '零花级';
  if (月零花钱 < 50000) return '小康级';
  if (月零花钱 < 100000) return '中产级';
  if (月零花钱 < 300000) return '富裕级';
  return '奢华级';
}

// 模拟关系演化
export function 模拟关系演化(
  关系: 糖关系状态完整,
  月数: number = 1
): 糖关系状态完整 {
  let newRelation = {
    ...关系,
    持续时间: 关系.持续时间 + 月数,
  };

  // 蜜月期后逐渐降温
  if (关系.状态 === '蜜月期' && 关系.持续时间 > 3) {
    newRelation.糖宝满意度 = Math.max(40, 关系.糖宝满意度 - 5 * 月数);
    newRelation.糖宝投入度 = Math.max(30, 关系.糖宝投入度 - 3 * 月数);
  }

  // 稳定期小幅波动
  if (关系.状态 === '稳定期') {
    const 波动 = (Math.random() - 0.5) * 10;
    newRelation.糖宝满意度 = Math.max(0, Math.min(100, 关系.糖宝满意度 + 波动));
  }

  // 计算预期结局
  if (关系.状态 === '冷淡期' || 关系.状态 === '危机期') {
    if (关系.危机事件.length > 2) {
      newRelation.预期结局 = '曝光';
    } else if (Math.random() < 0.4) {
      newRelation.预期结局 = '被甩';
    }
  }

  // 长期关系可能转正
  if (关系.持续时间 > 24 && 关系.糖宝依赖度 > 70 && 关系.糖爹满意度 > 80) {
    newRelation.预期结局 = '转正';
  }

  return newRelation;
}

// 计算分手费
export function 计算分手费(
  关系: 糖关系状态完整,
  原因: '被分手' | '主动分手' | '协商分手'
): number {
  const 基础费 = 关系.月零花钱 * 3;
  const 情感补偿 = 关系.糖宝依赖度 > 70 ? 关系.月零花钱 * 2 : 0;
  const 风险补偿 = 关系.曝光风险 > 50 ? 关系.月零花钱 * 3 : 0;

  switch (原因) {
    case '被分手':
      return 基础费 + 情感补偿 + 风险补偿;
    case '主动分手':
      return 基础费 * 0.5;
    case '协商分手':
      return 基础费 + 情感补偿;
  }
}

// 获取关系摘要
export function 获取关系摘要(关系: 糖关系状态完整): string {
  return `关系${关系.关系ID}`
    + `| ${关系.状态}`
    + `| 时长${关系.持续时间}月`
    + `| 月零花${关系.月零花钱}元`
    + `| 糖宝满意度${关系.糖宝满意度}%`
    + `| 预期${关系.预期结局}`;
}
