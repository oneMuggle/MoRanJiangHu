/**
 * 相亲对象状态管理
 */

import type {
  对象核心状态,
  外貌类型,
  相亲动机,
  骗婚类型,
  相亲对象类型,
  家庭背景,
} from './types';

// 默认化名池
const 化名池 = [
  '诗涵', '子萱', '雨萱', '思琪', '雅琪', '美琪', '诗琪', '欣怡',
  '俊杰', '志强', '伟强', '子轩', '浩然', '宇轩', '天宇', '思远',
  '佳怡', '诗诗', '瑶瑶', '婷婷', '美美', '莎莎', '晴晴', '甜甜',
];

const 职业池 = [
  '程序员', '教师', '医生', '律师', '销售', '设计师', '国企管理',
  '公务员', '银行高管', '私企老板', '投资人', '网红', '个体老板',
];

const 学历池 = ['本科', '硕士', '博士', 'MBA', '海归硕士', '双学位'];

// 创建默认相亲对象
export function 创建默认相亲对象(partial?: Partial<对象核心状态>): 对象核心状态 {
  return {
    ID: partial?.ID || `对象_${Date.now()}`,
    昵称: partial?.昵称 || 化名池[Math.floor(Math.random() * 化名池.length)],
    本名: partial?.本名,
    性别: partial?.性别 || '女',
    年龄: partial?.年龄 || 26,
    外貌: partial?.外貌 || '普通',

    // 背景信息
    学历: partial?.学历 || 学历池[Math.floor(Math.random() * 学历池.length)],
    职业: partial?.职业 || 职业池[Math.floor(Math.random() * 职业池.length)],
    收入: partial?.收入 || 20,

    // 物质条件
    房产: partial?.房产 || '有房有车',
    车子: partial?.车子 || '普通车',
    家庭背景: partial?.家庭背景 || '城市中产',

    // 真实属性（隐藏）
    真实动机: partial?.真实动机 || '真心想结婚',
    真实物质: partial?.真实物质 || '真实',
    婚史: partial?.婚史 || '未婚',
    隐藏属性: partial?.隐藏属性 || [],

    // 与玩家关系
    关系状态: partial?.关系状态 || '陌生',
    好感度: partial?.好感度 || 50,
    信任度: partial?.信任度 || 50,
    投入度: partial?.投入度 || 30,
    物质要求: partial?.物质要求 || 50,

    // 骗子属性
    是骗子: partial?.是骗子 || false,
    骗子类型: partial?.骗子类型,
    欺骗能力: partial?.欺骗能力 || 0,
    目标金额: partial?.目标金额,
  };
}

// 创建骗子对象
export function 创建骗子对象(
  骗子类型: 骗婚类型,
  性别: '男' | '女'
): 对象核心状态 {
  const base = 创建默认相亲对象({ 性别 });

  switch (骗子类型) {
    case '酒托':
      base.昵称 = '酒托女';
      base.外貌 = '帅气/漂亮';
      base.真实动机 = '商业目的';
      base.是骗子 = true;
      base.骗子类型 = '酒托';
      base.欺骗能力 = 70 + Math.floor(Math.random() * 20);
      base.目标金额 = 5000 + Math.floor(Math.random() * 15000);
      break;

    case '红包党':
      base.昵称 = '红包女';
      base.外貌 = '普通';
      base.真实动机 = '商业目的';
      base.是骗子 = true;
      base.骗子类型 = '红包党';
      base.欺骗能力 = 60 + Math.floor(Math.random() * 20);
      base.目标金额 = 1000 + Math.floor(Math.random() * 5000);
      break;

    case '杀猪盘':
      base.昵称 = 性别 === '女' ? '高富帅' : '白富美';
      base.外貌 = '帅气/漂亮';
      base.职业 = '投资人/创业者';
      base.收入 = 50 + Math.floor(Math.random() * 50);
      base.真实动机 = '商业目的';
      base.是骗子 = true;
      base.骗子类型 = '杀猪盘';
      base.欺骗能力 = 80 + Math.floor(Math.random() * 15);
      base.目标金额 = 10 + Math.floor(Math.random() * 50); // 万
      break;

    case '职业骗婚':
      base.外貌 = '普通';
      base.职业 = '个体户';
      base.收入 = 10;
      base.家庭背景 = '农村';
      base.真实动机 = '商业目的';
      base.真实物质 = '很差';
      base.是骗子 = true;
      base.骗子类型 = '职业骗婚';
      base.欺骗能力 = 50 + Math.floor(Math.random() * 30);
      base.目标金额 = 10 + Math.floor(Math.random() * 15); // 万
      break;

    case '骗房本':
      base.外貌 = '普通';
      base.职业 = '销售';
      base.收入 = 15;
      base.真实动机 = '商业目的';
      base.真实物质 = '无房无车';
      base.是骗子 = true;
      base.骗子类型 = '骗房本';
      base.欺骗能力 = 60 + Math.floor(Math.random() * 25);
      base.目标金额 = 100; // 房价的50%
      break;

    case '同性恋骗婚':
      base.外貌 = '普通';
      base.真实动机 = '商业目的';
      base.隐藏属性 = ['同性恋'];
      base.是骗子 = true;
      base.骗子类型 = '同性恋骗婚';
      base.欺骗能力 = 70 + Math.floor(Math.random() * 20);
      break;
  }

  return base;
}

// 创建真诚对象
export function 创建真诚对象(
  类型: 相亲对象类型,
  性别: '男' | '女'
): 对象核心状态 {
  const base = 创建默认相亲对象({ 性别, 真实动机: '真心想结婚' });

  switch (类型) {
    case '体制内':
      base.职业 = '公务员';
      base.收入 = 15 + Math.floor(Math.random() * 10);
      base.房产 = '有房无贷';
      base.车子 = '普通车';
      break;
    case '企业高管':
      base.职业 = '企业高管';
      base.收入 = 40 + Math.floor(Math.random() * 30);
      base.房产 = '有房无贷';
      base.车子 = '豪车';
      break;
    case '中产白领':
      base.职业 = '工程师/设计师';
      base.收入 = 20 + Math.floor(Math.random() * 15);
      base.房产 = '有房贷';
      base.车子 = '普通车';
      break;
    case '创业者':
      base.职业 = '创业者';
      base.收入 = 0; // 创业阶段收入不稳定
      base.真实物质 = '有房有车但有贷款';
      base.房产 = '有房贷';
      base.车子 = '普通车';
      break;
    case '富二代':
      base.职业 = '不固定';
      base.收入 = 0; // 不需要工作
      base.真实物质 = '家里有钱';
      base.房产 = '多套房产';
      base.车子 = '豪车';
      base.家庭背景 = '富裕';
      break;
    case '凤凰男/女':
      base.职业 = '程序员/医生';
      base.收入 = 30 + Math.floor(Math.random() * 20);
      base.家庭背景 = '农村';
      base.户籍 = '农村';
      break;
    case '海归':
      base.学历 = '海归硕士';
      base.职业 = '外企/金融';
      base.收入 = 25 + Math.floor(Math.random() * 20);
      break;
  }

  return base;
}

// 更新对象状态
export function 更新对象状态(
  state: 对象核心状态,
  updates: Partial<对象核心状态>
): 对象核心状态 {
  return { ...state, ...updates };
}

// 提升好感度
export function 提升好感度(
  state: 对象核心状态,
  增量: number
): 对象核心状态 {
  return 更新对象状态(state, {
    好感度: Math.min(100, state.好感度 + 增量),
  });
}

// 降低好感度
export function 降低好感度(
  state: 对象核心状态,
  减量: number
): 对象核心状态 {
  return 更新对象状态(state, {
    好感度: Math.max(0, state.好感度 - 减量),
  });
}

// 提升信任度
export function 提升信任度(
  state: 对象核心状态,
  增量: number
): 对象核心状态 {
  return 更新对象状态(state, {
    信任度: Math.min(100, state.信任度 + 增量),
  });
}

// 降低信任度
export function 降低信任度(
  state: 对象核心状态,
  减量: number
): 对象核心状态 {
  return 更新对象状态(state, {
    信任度: Math.max(0, state.信任度 - 减量),
  });
}

// 提升投入度
export function 提升投入度(
  state: 对象核心状态,
  增量: number
): 对象核心状态 {
  return 更新对象状态(state, {
    投入度: Math.min(100, state.投入度 + 增量),
  });
}

// 物质要求提升
export function 物质要求提升(
  state: 对象核心状态,
  增量: number
): 对象核心状态 {
  return 更新对象状态(state, {
    物质要求: Math.min(100, state.物质要求 + 增量),
  });
}

// 判断是否为骗子（玩家视角）
export function 是否可疑对象(state: 对象核心状态): {
  可疑: boolean;
  原因: string[];
} {
  const 原因: string[] = [];

  // 照片太完美
  if (state.外貌 === '帅气/漂亮' && state.收入 > 30) {
    原因.push('条件太好不像真的');
  }

  // 急于结婚
  if (state.投入度 > 80) {
    原因.push('进展太快');
  }

  // 物质要求过高
  if (state.物质要求 > 80) {
    原因.push('物质要求过高');
  }

  // 职业与收入不符
  if (state.职业 === '个体户' && state.收入 > 50) {
    原因.push('收入可疑');
  }

  // 家庭背景与物质条件不符
  if (state.家庭背景 === '农村' && state.房产 === '有房无贷' && state.车子 === '豪车') {
    原因.push('农村背景配豪车，可疑');
  }

  return {
    可疑: 原因.length >= 2,
    原因,
  };
}

// 获取对象摘要
export function 获取对象摘要(state: 对象核心状态): string {
  const 骗子标记 = state.是骗子 ? `【骗子:${state.骗子类型}】` : '';
  return `${state.昵称}（${state.性别}，${state.年龄}岁）${骗子标记}`
    + `| ${state.职业} | 年收${state.收入}万`
    + `| ${state.外貌} | ${state.家庭背景}`
    + `| 好感:${state.好感度} | 信任:${state.信任度}`
    + `| 动机:${state.真实动机}`;
}
