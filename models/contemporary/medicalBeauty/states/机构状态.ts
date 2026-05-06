/**
 * 医美机构状态管理
 */

import type {
  医美机构状态,
  机构类型,
  机构档次,
} from './types';

// 机构名称生成
const 机构名池 = [
  '华美', '美莱', '艺星', '薇琳', '联合丽格',
  '伊美尔', '美联臣', '丽都', '芳华', '瑞丽',
  '鹏程', '阳光', '华怡', '康美', '欧菲',
];

// 创建默认机构状态
export function 创建默认机构状态(partial?: Partial<医美机构状态>): 医美机构状态 {
  return {
    机构ID: partial?.机构ID || `机构_${Date.now()}`,
    机构名称: partial?.机构名称 || 机构名池[Math.floor(Math.random() * 机构名池.length)] + '医疗美容',
    类型: partial?.类型 || '美容诊所',
    档次: partial?.档次 || '中端',

    // 资质
    资质证书: partial?.资质证书 || [],
    医生数量: partial?.医生数量 || 5,
    主任医师: partial?.主任医师 || 1,
    无证医生: partial?.无证医生 || 0,

    // 安全
    事故率: partial?.事故率 || 5,
    死亡率: partial?.死亡率 || 1,
    感染率: partial?.感染率 || 2,
    投诉率: partial?.投诉率 || 10,

    // 经营
    宰客程度: partial?.宰客程度 || 30,
    虚假宣传: partial?.虚假宣传 || 20,
    渠道抽成: partial?.渠道抽成 || 40,

    // 口碑
    好评率: partial?.好评率 || 70,
    真实好评率: partial?.真实好评率 || 50,
    水军比例: partial?.水军比例 || 30,
  };
}

// 根据档次创建机构
export function 根据档次创建机构(档次: 机构档次): 医美机构状态 {
  const base = 创建默认机构状态({ 档次 });

  switch (档次) {
    case '顶级':
      base.类型 = '三甲医院整形科';
      base.医生数量 = 20;
      base.主任医师 = 5;
      base.无证医生 = 0;
      base.事故率 = 1;
      base.死亡率 = 0.1;
      base.感染率 = 0.5;
      base.宰客程度 = 20;
      base.虚假宣传 = 5;
      base.渠道抽成 = 20;
      base.好评率 = 90;
      base.真实好评率 = 85;
      base.水军比例 = 5;
      break;

    case '高端':
      base.类型 = '大型连锁机构';
      base.医生数量 = 10;
      base.主任医师 = 2;
      base.无证医生 = 0;
      base.事故率 = 3;
      base.死亡率 = 0.5;
      base.感染率 = 1;
      base.宰客程度 = 40;
      base.虚假宣传 = 25;
      base.渠道抽成 = 40;
      base.好评率 = 80;
      base.真实好评率 = 60;
      base.水军比例 = 25;
      break;

    case '中端':
      base.类型 = '专科医院';
      base.医生数量 = 5;
      base.主任医师 = 1;
      base.无证医生 = 1;
      base.事故率 = 8;
      base.死亡率 = 1;
      base.感染率 = 3;
      base.宰客程度 = 50;
      base.虚假宣传 = 40;
      base.渠道抽成 = 50;
      base.好评率 = 65;
      base.真实好评率 = 40;
      base.水军比例 = 40;
      break;

    case '低端':
      base.类型 = '美容诊所';
      base.医生数量 = 3;
      base.主任医师 = 0;
      base.无证医生 = 2;
      base.事故率 = 15;
      base.死亡率 = 3;
      base.感染率 = 8;
      base.宰客程度 = 70;
      base.虚假宣传 = 60;
      base.渠道抽成 = 60;
      base.好评率 = 50;
      base.真实好评率 = 25;
      base.水军比例 = 55;
      break;

    case '黑机构':
      base.类型 = '工作室';
      base.医生数量 = 1;
      base.主任医师 = 0;
      base.无证医生 = 1;
      base.事故率 = 30;
      base.死亡率 = 10;
      base.感染率 = 20;
      base.宰客程度 = 90;
      base.虚假宣传 = 90;
      base.渠道抽成 = 70;
      base.好评率 = 30;
      base.真实好评率 = 10;
      base.水军比例 = 80;
      break;
  }

  return base;
}

// 评估机构安全性
export function 评估机构安全性(机构: 医美机构状态): {
  安全评分: number;
  推荐指数: number;
  主要风险: string[];
} {
  let 安全评分 = 100;
  const 主要风险: string[] = [];

  // 资质风险
  if (机构.无证医生 > 0) {
    安全评分 -= 机构.无证医生 * 15;
    主要风险.push(`存在${机构.无证医生}名无证医生`);
  }

  // 事故率风险
  if (机构.事故率 > 10) {
    安全评分 -= 20;
    主要风险.push('事故率较高');
  }

  // 死亡率风险
  if (机构.死亡率 > 5) {
    安全评分 -= 30;
    主要风险.push('曾有手术死亡案例');
  }

  // 感染率风险
  if (机构.感染率 > 5) {
    安全评分 -= 15;
    主要风险.push('术后感染率偏高');
  }

  // 投诉率风险
  if (机构.投诉率 > 20) {
    安全评分 -= 10;
    主要风险.push('投诉率偏高');
  }

  // 虚假宣传风险
  if (机构.虚假宣传 > 50) {
    安全评分 -= 15;
    主要风险.push('存在虚假宣传');
  }

  // 宰客风险
  if (机构.宰客程度 > 60) {
    安全评分 -= 10;
    主要风险.push('收费不合理');
  }

  // 水军风险
  if (机构.水军比例 > 50) {
    安全评分 -= 10;
    主要风险.push('好评疑似造假');
  }

  安全评分 = Math.max(0, Math.min(100, 安全评分));

  // 推荐指数（考虑性价比）
  let 推荐指数 = 安全评分;
  if (机构.渠道抽成 > 50) {
    推荐指数 -= 10; // 渠道抽成高可能意味着价格虚高
  }

  return {
    安全评分,
    推荐指数: Math.max(0, Math.min(100, 推荐指数)),
    主要风险,
  };
}

// 更新机构状态
export function 更新机构状态(
  state: 医美机构状态,
  updates: Partial<医美机构状态>
): 医美机构状态 {
  return { ...state, ...updates };
}

// 记录事故
export function 记录机构事故(
  state: 医美机构状态,
  事故类型: '事故' | '死亡' | '感染'
): 医美机构状态 {
  const updates: Partial<医美机构状态> = {
    投诉率: Math.min(100, state.投诉率 + 5),
  };

  switch (事故类型) {
    case '事故':
      updates.事故率 = Math.min(100, state.事故率 + 3);
      updates.好评率 = Math.max(0, state.好评率 - 5);
      updates.真实好评率 = Math.max(0, state.真实好评率 - 8);
      break;
    case '死亡':
      updates.死亡率 = Math.min(100, state.死亡率 + 5);
      updates.好评率 = Math.max(0, state.好评率 - 20);
      updates.真实好评率 = Math.max(0, state.真实好评率 - 30);
      break;
    case '感染':
      updates.感染率 = Math.min(100, state.感染率 + 5);
      updates.好评率 = Math.max(0, state.好评率 - 3);
      break;
  }

  return 更新机构状态(state, updates);
}

// 获取机构摘要
export function 获取机构摘要(state: 医美机构状态): string {
  const { 安全评分, 推荐指数 } = 评估机构安全性(state);
  return `${state.机构名称}（${state.类型}）`
    + `| 档次:${state.档次} | 安全评分:${安全评分}`
    + `| 医生${state.医生数量}人(主任${state.主任医师}人)`
    + `| 事故率:${state.事故率}% | 好评率:${state.好评率}%`
    + `| 水军:${state.水军比例}%`;
}
