/**
 * 宠物服务场所状态管理
 */

import type {
  宠物服务场所状态,
  宠物服务,
} from '../types';

// 创建默认场所状态
export function 创建默认场所状态(partial?: Partial<宠物服务场所状态>): 宠物服务场所状态 {
  return {
    场所ID: partial?.场所ID || `场所_${Date.now()}`,
    场所名称: partial?.场所名称 || '宠物店',
    类型: partial?.类型 || '宠物美容',

    // 规模与资质
    规模: partial?.规模 || '小店',
    资质: partial?.资质 || ['营业执照'],
    员工数量: partial?.员工数量 ?? 3,
    专业人员: partial?.专业人员 || [],

    // 服务能力
    接待量: partial?.接待量 ?? 20,
    预约量: partial?.预约量 ?? 10,
    忙碌程度: partial?.忙碌程度 ?? 30,

    // 口碑
    好评率: partial?.好评率 ?? 85,
    差评率: partial?.差评率 ?? 10,
    投诉率: partial?.投诉率 ?? 5,

    // 安全记录
    事故数: partial?.事故数 ?? 0,
    医疗事故: partial?.医疗事故 ?? 0,
    卫生检查: partial?.卫生检查 || '合格',
    违规记录: partial?.违规记录 || [],

    // 费用
    基础价格: partial?.基础价格 ?? 200,
    溢价能力: partial?.溢价能力 ?? 30,
  };
}

// 根据类型创建服务场所
export function 根据类型创建场所(
  类型: 宠物服务,
  规模: '小店' | '连锁' | '旗舰店'
): 宠物服务场所状态 {
  const base = 创建默认场所状态({ 类型, 规模 });

  // 根据规模调整
  switch (规模) {
    case '小店':
      base.员工数量 = 2 + Math.floor(Math.random() * 3);
      base.接待量 = 15;
      base.基础价格 = 类型 === '宠物医疗' ? 300 : 150;
      break;
    case '连锁':
      base.员工数量 = 10 + Math.floor(Math.random() * 10);
      base.接待量 = 50;
      base.基础价格 = 类型 === '宠物医疗' ? 500 : 300;
      base.资质 = ['营业执照', '特许经营'];
      break;
    case '旗舰店':
      base.员工数量 = 20 + Math.floor(Math.random() * 20);
      base.接待量 = 100;
      base.基础价格 = 类型 === '宠物医疗' ? 1000 : 500;
      base.资质 = ['营业执照', '特许经营', '专业资质认证'];
      base.溢价能力 = 60;
      break;
  }

  // 根据服务类型调整专业人员
  if (类型 === '宠物医疗') {
    base.专业人员 = ['兽医', '兽医助理'];
  } else if (类型 === '宠物美容') {
    base.专业人员 = ['美容师', '美容师助理'];
  } else if (类型 === '宠物酒店') {
    base.专业人员 = ['宠物护理员', '管理员'];
  }

  return base;
}

// 更新场所状态
export function 更新场所状态(
  state: 宠物服务场所状态,
  updates: Partial<宠物服务场所状态>
): 宠物服务场所状态 {
  return { ...state, ...updates };
}

// 忙碌程度变化
export function 更新忙碌程度(
  state: 宠物服务场所状态,
  变化值: number
): 宠物服务场所状态 {
  return 更新场所状态(state, {
    忙碌程度: Math.max(0, Math.min(100, state.忙碌程度 + 变化值)),
  });
}

// 添加事故记录
export function 记录事故(
  state: 宠物服务场所状态,
  是医疗事故: boolean = false
): 宠物服务场所状态 {
  const updates: Partial<宠物服务场所状态> = {
    事故数: state.事故数 + 1,
  };

  if (是医疗事故) {
    updates.医疗事故 = state.医疗事故 + 1;
    updates.好评率 = Math.max(0, state.好评率 - 5);
  }

  updates.差评率 = Math.min(100, state.差评率 + 2);

  return 更新场所状态(state, updates);
}

// 评价更新
export function 更新评价(
  state: 宠物服务场所状态,
  好评: boolean
): 宠物服务场所状态 {
  if (好评) {
    return 更新场所状态(state, {
      好评率: Math.min(100, state.好评率 + 1),
      差评率: Math.max(0, state.差评率 - 1),
    });
  } else {
    return 更新场所状态(state, {
      好评率: Math.max(0, state.好评率 - 2),
      差评率: Math.min(100, state.差评率 + 2),
      投诉率: Math.min(100, state.投诉率 + 1),
    });
  }
}

// 预约
export function 添加预约(state: 宠物服务场所状态): 宠物服务场所状态 {
  const 忙碌程度 = state.忙碌程度 + 5;
  return 更新场所状态(state, {
    预约量: state.预约量 + 1,
    忙碌程度: Math.min(100, 忙碌程度),
  });
}

// 卫生检查更新
export function 卫生检查结果(
  state: 宠物服务场所状态,
  结果: '合格' | '一般' | '不合格'
): 宠物服务场所状态 {
  const updates: Partial<宠物服务场所状态> = {
    卫生检查: 结果,
  };

  if (结果 === '不合格') {
    updates.违规记录 = [...state.违规记录, `卫生检查不合格-${new Date().toISOString().split('T')[0]}`];
    updates.好评率 = Math.max(0, state.好评率 - 10);
  }

  return 更新场所状态(state, updates);
}

// 计算服务价格
export function 计算服务价格(
  state: 宠物服务场所状态,
  基础价格: number
): number {
  // 基础价格 * (1 + 溢价能力/100)
  const 溢价 = 基础价格 * (state.溢价能力 / 100);
  return Math.round(基础价格 + 溢价);
}

// 获取场所摘要
export function 获取场所摘要(state: 宠物服务场所状态): string {
  return `${state.场所名称}（${state.类型}，${state.规模}）`
    + `| 好评率${state.好评率}% | 忙碌${state.忙碌程度}%`
    + `| 基础价${state.基础价格}元`;
}
