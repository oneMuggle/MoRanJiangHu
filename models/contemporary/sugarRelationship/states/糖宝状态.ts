/**
 * 糖宝状态管理
 */

import type {
  糖宝核心状态,
  糖宝身份,
  外貌类型,
  入行原因,
  糖关系状态,
  关系模式,
  零花钱级别,
} from './types';

// 默认化名池
const 化名池 = [
  '小雅', '婷婷', '雪儿', 'Lily', 'Coco', 'Momo',
  '苏苏', '瑶瑶', '甜甜', '欣欣', '梦梦', '琪琪',
];

// 创建默认糖宝状态
export function 创建默认糖宝状态(partial?: Partial<糖宝核心状态>): 糖宝核心状态 {
  return {
    ID: partial?.ID || `糖宝_${Date.now()}`,
    化名: partial?.化名 || 化名池[Math.floor(Math.random() * 化名池.length)],
    本名: partial?.本名,
    年龄: partial?.年龄 || 22,
    外貌类型: partial?.外貌类型 || '邻家女孩',
    身高: partial?.身高 || 165,
    体重: partial?.体重 || 48,
    身份类型: partial?.身份类型 || '在校学生',
    入行原因: partial?.入行原因 || '好奇心',
    入行时长: partial?.入行时长 || 0,
    入行次数: partial?.入行次数 || 0,
    当前糖爹ID: partial?.当前糖爹ID,
    关系状态: partial?.关系状态 || '筛选期',
    关系模式: partial?.关系模式 || '模糊不清',
    关系时长: partial?.关系时长 || 0,
    零花钱级别: partial?.零花钱级别 || '零花级',
    月零花钱: partial?.月零花钱 || 5000,
    累计获得: partial?.累计获得 || 0,
    名下资产: partial?.名下资产 || 0,
    债务: partial?.债务 || 0,
    奢侈品数量: partial?.奢侈品数量 || 0,
    物质依赖度: partial?.物质依赖度 || 30,
    情感依赖度: partial?.情感依赖度 || 20,
    羞耻度: partial?.羞耻度 || 60,
    幸福度: partial?.幸福度 || 50,
    焦虑度: partial?.焦虑度 || 40,
    风险感知: partial?.风险感知 || 50,
    备胎数量: partial?.备胎数量 || 0,
    备胎质量: partial?.备胎质量 || 50,
    同时维持: partial?.同时维持 || false,
    曝光风险: partial?.曝光风险 || 20,
    被威胁次数: partial?.被威胁次数 || 0,
    安全词: partial?.安全词,
    黑名单: partial?.黑名单 || [],
    计划转型: partial?.计划转型 || false,
    转型方向: partial?.转型方向,
    存钱目标: partial?.存钱目标 || 1000000,
    心理底线: partial?.心理底线 || ['不拍照', '不录像'],
  };
}

// 根据身份类型调整初始状态
export function 根据身份创建糖宝(
  身份类型: 糖宝身份,
  入行原因: 入行原因,
  年龄?: number
): 糖宝核心状态 {
  const base = 创建默认糖宝状态({ 身份类型, 入行原因, 年龄 });

  switch (身份类型) {
    case '在校学生':
      base.化名 = 化名池[Math.floor(Math.random() * 6)];
      base.羞耻度 = 70;
      base.物质依赖度 = 40;
      break;
    case '应届毕业生':
      base.羞耻度 = 60;
      base.物质依赖度 = 50;
      break;
    case '职场新人':
      base.羞耻度 = 50;
      base.物质依赖度 = 55;
      break;
    case '网红/主播':
      base.羞耻度 = 30;
      base.物质依赖度 = 60;
      base.外貌类型 = '网红脸';
      break;
    case '全职被包养':
      base.羞耻度 = 40;
      base.物质依赖度 = 80;
      break;
    case '兼职糖宝':
      base.羞耻度 = 55;
      base.物质依赖度 = 45;
      break;
  }

  return base;
}

// 更新糖宝状态
export function 更新糖宝状态(
  state: 糖宝核心状态,
  updates: Partial<糖宝核心状态>
): 糖宝核心状态 {
  return { ...state, ...updates };
}

// 增加累计金额
export function 糖宝获得收益(
  state: 糖宝核心状态,
  金额: number,
  类型: '现金' | '转账' | '奢侈品' | '房产' = '现金'
): 糖宝核心状态 {
  const updates: Partial<糖宝核心状态> = {
    累计获得: state.累计获得 + 金额,
  };

  if (类型 === '奢侈品') {
    updates.奢侈品数量 = state.奢侈品数量 + 1;
  }

  // 物质依赖度随收益增加
  updates.物质依赖度 = Math.min(100, state.物质依赖度 + 金额 / 10000);

  return 更新糖宝状态(state, updates);
}

// 关系状态变化
export function 推进关系状态(
  state: 糖宝核心状态,
  新状态: 糖关系状态
): 糖宝核心状态 {
  const updates: Partial<糖宝核心状态> = {
    关系状态: 新状态,
  };

  switch (新状态) {
    case '蜜月期':
      updates.幸福度 = Math.min(100, state.幸福度 + 20);
      updates.羞耻度 = Math.max(0, state.羞耻度 - 10);
      break;
    case '冷淡期':
      updates.幸福度 = Math.max(0, state.幸福度 - 20);
      updates.焦虑度 = Math.min(100, state.焦虑度 + 15);
      break;
    case '危机期':
      updates.焦虑度 = Math.min(100, state.焦虑度 + 30);
      updates.曝光风险 = Math.min(100, state.曝光风险 + 20);
      break;
    case '已结束':
      updates.当前糖爹ID = undefined;
      updates.关系时长 = 0;
      updates.焦虑度 = Math.min(100, state.焦虑度 + 10);
      break;
  }

  return 更新糖宝状态(state, updates);
}

// 计算曝光风险
export function 计算曝光风险(state: 糖宝核心状态): number {
  let risk = state.曝光风险;

  // 备胎多风险增加
  if (state.同时维持 && state.备胎数量 > 0) {
    risk += state.备胎数量 * 5;
  }

  // 高调消费增加风险
  if (state.奢侈品数量 > 10) {
    risk += 10;
  }

  // 关系越久风险越高
  if (state.关系时长 > 12) {
    risk += 15;
  }

  // 羞耻度低说明越放得开，但可能更谨慎
  if (state.羞耻度 < 30) {
    risk -= 10;
  }

  return Math.max(0, Math.min(100, risk));
}

// 添加到黑名单
export function 添加到黑名单(
  state: 糖宝核心状态,
  糖爹ID: string,
  原因?: string
): 糖宝核心状态 {
  if (state.黑名单.includes(糖爹ID)) {
    return state;
  }

  return 更新糖宝状态(state, {
    黑名单: [...state.黑名单, 糖爹ID],
    被威胁次数: state.被威胁次数 + 1,
  });
}

// 获取糖宝摘要
export function 获取糖宝摘要(state: 糖宝核心状态): string {
  return `${state.化名}（${state.身份类型}，${state.年龄}岁）`
    + `| 入行${state.入行时长}个月 | 经历糖爹${state.入行次数}位`
    + `| 现关系${state.关系状态} | 月零花${state.月零花钱}元`
    + `| 累计${state.累计获得}元 | 曝光风险${state.曝光Risk}%`;
}
