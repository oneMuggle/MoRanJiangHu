/**
 * 糖爹状态管理
 */

import type {
  糖爹核心状态,
  糖爹身份,
  财富等级,
  糖爹动机,
  糖关系状态,
} from './types';

// 默认化名池
const 糖爹化名池 = [
  'James', 'Michael', 'David', '陈总', '王总', '李总',
  '刘总', '张总', '周总', '吴总', '郑总', '徐总',
];

// 创建默认糖爹状态
export function 创建默认糖爹状态(partial?: Partial<糖爹核心状态>): 糖爹核心状态 {
  return {
    ID: partial?.ID || `糖爹_${Date.now()}`,
    化名: partial?.化名 || 糖爹化名池[Math.floor(Math.random() * 糖爹化名池.length)],
    本名: partial?.本名,
    年龄: partial?.年龄 || 45,
    身份类型: partial?.身份类型 || '中年企业家',
    财富等级: partial?.财富等级 || '金主',
    婚姻状态: partial?.婚姻状态 || '已婚',
    配偶知情: partial?.配偶知情 ?? false,
    婚姻满意度: partial?.婚姻满意度 || 40,
    年收入: partial?.年收入 || 5000000,
    可支配零花钱: partial?.可支配零花钱 || 2000000,
    累计花费: partial?.累计花费 || 0,
    资产状况: partial?.资产状况 || 50000000,
    主要动机: partial?.主要动机 || '寂寞空虚',
    占有欲: partial?.占有欲 || 60,
    控制欲: partial?.控制欲 || 50,
    慷慨度: partial?.慷慨度 || 70,
    花心度: partial?.花心度 || 40,
    当前糖宝ID: partial?.当前糖宝ID,
    关系状态: partial?.关系状态 || '筛选期',
    同时糖宝数: partial?.同时糖宝数 || 0,
    历任糖宝数: partial?.历任糖宝数 || 0,
    平均关系时长: partial?.平均关系时长 || 6,
    分手原因: partial?.分手原因 || [],
    曝光风险: partial?.曝光风险 || 15,
    原配攻击性: partial?.原配攻击性 || 50,
    法律风险: partial?.法律风险 || 10,
  };
}

// 根据身份类型调整初始状态
export function 根据身份创建糖爹(
  身份类型: 糖爹身份,
  财富等级: 财富等级,
  婚姻状态: '未婚' | '已婚' | '离异' | '丧偶' = '已婚',
  年龄?: number
): 糖爹核心状态 {
  const base = 创建默认糖爹状态({ 身份类型, 财富等级, 婚姻状态, 年龄 });

  // 根据财富等级调整收入
  switch (财富等级) {
    case '普通干爹':
      base.年收入 = 1000000 + Math.random() * 4000000;
      base.可支配零花钱 = base.年收入 * 0.1;
      break;
    case '金主':
      base.年收入 = 5000000 + Math.random() * 15000000;
      base.可支配零花钱 = base.年收入 * 0.2;
      break;
    case '超级金主':
      base.年收入 = 20000000 + Math.random() * 30000000;
      base.可支配零花钱 = base.年收入 * 0.3;
      break;
    case '传奇干爹':
      base.年收入 = 50000000 + Math.random() * 100000000;
      base.可支配零花钱 = base.年收入 * 0.4;
      break;
  }

  // 根据身份类型调整属性
  switch (身份类型) {
    case '中年企业家':
      base.控制欲 = 70;
      base.占有欲 = 65;
      break;
    case '富二代':
      base.花心度 = 80;
      base.慷慨度 = 75;
      base.控制欲 = 40;
      break;
    case '成功人士':
      base.控制欲 = 60;
      base.占有欲 = 55;
      break;
    case '暴发户':
      base.炫耀欲 = 90;
      base.慷慨度 = 60;
      base.控制欲 = 75;
      break;
    case '外籍人士':
      base.匿名性需求 = 70;
      break;
    case '已婚男人':
      base.曝光风险 = 30;
      base.原配攻击性 = 60;
      break;
  }

  return base;
}

// 更新糖爹状态
export function 更新糖爹状态(
  state: 糖爹核心状态,
  updates: Partial<糖爹核心状态>
): 糖爹核心状态 {
  return { ...state, ...updates };
}

// 增加累计花费
export function 糖爹花费(
  state: 糖爹核心状态,
  金额: number
): 糖爹核心状态 {
  return 更新糖爹状态(state, {
    累计花费: state.累计花费 + 金额,
    可支配零花钱: state.可支配零花钱 - 金额,
  });
}

// 关系状态变化
export function 推进糖爹关系状态(
  state: 糖爹核心状态,
  新状态: 糖关系状态
): 糖爹核心状态 {
  const updates: Partial<糖爹核心状态> = {
    关系状态: 新状态,
  };

  switch (新状态) {
    case '蜜月期':
      updates.慷慨度 = Math.min(100, state.慷慨度 + 10);
      break;
    case '冷淡期':
      updates.慷慨度 = Math.max(0, state.慷慨度 - 15);
      break;
    case '危机期':
      updates.曝光风险 = Math.min(100, state.曝光风险 + 25);
      break;
    case '已结束':
      updates.当前糖宝ID = undefined;
      updates.同时糖宝数 = Math.max(0, state.同时糖宝数 - 1);
      updates.历任糖宝数 = state.历任糖宝数 + 1;
      break;
  }

  return 更新糖爹状态(state, updates);
}

// 记录分手原因
export function 记录分手原因(
  state: 糖爹核心状态,
  原因: string
): 糖爹核心状态 {
  return 更新糖爹状态(state, {
    分手原因: [...state.分手原因, 原因],
  });
}

// 计算糖爹风险
export function 计算糖爹风险(state: 糖爹核心状态): number {
  let risk = state.曝光风险;

  // 已婚风险更高
  if (state.婚姻状态 === '已婚') {
    risk += 15;
  }

  // 花心度高风险更高
  if (state.花心度 > 70) {
    risk += 10;
  }

  // 同时维持多个风险更高
  if (state.同时糖宝数 > 1) {
    risk += state.同时糖宝数 * 8;
  }

  // 原配攻击性高风险更高
  if (state.原配攻击性 > 70) {
    risk += 10;
  }

  return Math.max(0, Math.min(100, risk));
}

// 获取糖爹摘要
export function 获取糖爹摘要(state: 糖爹核心状态): string {
  return `${state.化名}（${state.身份类型}，${state.年龄}岁）`
    + `| ${state.财富等级} | ${state.婚姻状态}`
    + `| 累计花费${state.累计花费}元 | 曝光风险${state.曝光风险}%`;
}
