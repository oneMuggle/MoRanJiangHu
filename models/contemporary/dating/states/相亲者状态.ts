/**
 * 相亲者状态管理
 */

import type {
  相亲者核心状态,
  相亲身份,
  相亲动机,
  相亲渠道,
  外貌类型,
} from './types';

// 默认化名池
const 化名池 = [
  '建国', '志强', '伟明', '秀英', '丽华', '桂兰', '婷婷', '雪梅',
  '宇轩', '子涵', '雨萱', '浩然', '思远', '嘉欣', '子琪', '思雨',
  '俊杰', '雅婷', '浩然', '雨欣', '子轩', '雨彤', '豪杰', '秀芳',
];

const 职业池 = [
  '程序员', '教师', '医生', '会计', '律师', '销售', '设计师', '工程师',
  '公务员', '银行职员', '私企员工', '个体户', '自由职业', '国企员工',
];

const 户籍池 = [
  '北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '南京',
  '西安', '长沙', '苏州', '天津', '重庆', '郑州', '青岛', '大连',
];

// 创建默认相亲者状态
export function 创建默认相亲者状态(partial?: Partial<相亲者核心状态>): 相亲者核心状态 {
  return {
    ID: partial?.ID || `相亲_${Date.now()}`,
    昵称: partial?.昵称 || 化名池[Math.floor(Math.random() * 化名池.length)],
    本名: partial?.本名,
    性别: partial?.性别 || '男',
    年龄: partial?.年龄 || 30,
    身高: partial?.身高 || (partial?.性别 === '女' ? 163 : 175),
    体重: partial?.体重 || (partial?.性别 === '女' ? 52 : 70),
    外貌: partial?.外貌 || '普通',

    // 背景信息
    学历: partial?.学历 || '本科',
    职业: partial?.职业 || 职业池[Math.floor(Math.random() * 职业池.length)],
    户籍: partial?.户籍 || 户籍池[Math.floor(Math.random() * 户籍池.length)],
    收入: partial?.收入 || 15,

    // 物质条件
    房产: partial?.房产 || '有/无',
    车子: partial?.车子 || '有/无',
    存款: partial?.存款 || 30,

    // 相亲状态
    相亲次数: partial?.相亲次数 || 0,
    当前状态: partial?.当前状态 || '单身',
    相亲渠道: partial?.相亲渠道 || [],
    相亲动机: partial?.相亲动机 || '试试看',

    // 心理状态
    年龄焦虑度: partial?.年龄焦虑度 || 50,
    物质焦虑度: partial?.物质焦虑度 || 50,
    婚姻期望度: partial?.婚姻期望度 || 70,
    现实匹配度: partial?.现实匹配度 || 60,
    急切度: partial?.急切度 || 40,

    // 安全属性
    骗子识别能力: partial?.骗子识别能力 || 50,
    被骗次数: partial?.被骗次数 || 0,
    黑名单: partial?.黑名单 || [],

    // 历史记录
    相亲对象数: partial?.相亲对象数 || 0,
    失败原因: partial?.失败原因 || [],
    成功次数: partial?.成功次数 || 0,
  };
}

// 根据身份创建相亲者
export function 根据身份创建相亲者(
  身份: 相亲身份,
  性别: '男' | '女'
): 相亲者核心状态 {
  let 年龄: number;
  let 动机: 相亲动机;

  switch (身份) {
    case '剩男':
      年龄 = 32 + Math.floor(Math.random() * 8);
      动机 = Math.random() > 0.5 ? '社会压力' : '真心想结婚';
      break;
    case '剩女':
      年龄 = 28 + Math.floor(Math.random() * 10);
      动机 = Math.random() > 0.3 ? '父母催促' : '社会压力';
      break;
    case '离异男':
      年龄 = 35 + Math.floor(Math.random() * 10);
      动机 = Math.random() > 0.6 ? '真心想结婚' : '试试看';
      break;
    case '离异女':
      年龄 = 30 + Math.floor(Math.random() * 8);
      动机 = Math.random() > 0.4 ? '真心想结婚' : '父母催促';
      break;
    case '丧偶':
      年龄 = 38 + Math.floor(Math.random() * 10);
      动机 = '真心想结婚';
      break;
    case '再婚':
      年龄 = 36 + Math.floor(Math.random() * 8);
      动机 = '真心想结婚';
      break;
    default:
      年龄 = 28;
      动机 = '试试看';
  }

  const base = 创建默认相亲者状态({
    性别,
    年龄,
    相亲动机: 动机,
  });

  // 根据身份调整状态
  switch (身份) {
    case '剩男':
    case '剩女':
      base.年龄焦虑度 = Math.min(100, base.年龄焦虑度 + 30);
      base.急切度 = Math.min(100, base.急切度 + 20);
      break;
    case '离异男':
    case '离异女':
      base.物质焦虑度 = Math.min(100, base.物质焦虑度 + 20);
      base.婚姻期望度 = Math.max(0, base.婚姻期望度 - 10);
      break;
    case '丧偶':
      base.婚姻期望度 = 80;
      base.年龄焦虑度 = 40;
      break;
    case '再婚':
      base.现实匹配度 = Math.max(0, base.现实匹配度 - 20);
      break;
  }

  return base;
}

// 根据动机创建相亲者
export function 根据动机创建相亲者(
  动机: 相亲动机,
  性别: '男' | '女'
): 相亲者核心状态 {
  const base = 创建默认相亲者状态({ 性别, 相亲动机: 动机 });

  switch (动机) {
    case '父母催促':
      base.急切度 = 60;
      base.年龄焦虑度 = 70;
      break;
    case '社会压力':
      base.急切度 = 50;
      base.年龄焦虑度 = 60;
      break;
    case '真心想结婚':
      base.急切度 = 70;
      base.婚姻期望度 = 90;
      break;
    case '试试看':
      base.急切度 = 20;
      base.婚姻期望度 = 50;
      break;
    case '玩玩而已':
      base.急切度 = 10;
      base.婚姻期望度 = 30;
      break;
    case '商业目的':
      base.急切度 = 30;
      base.物质焦虑度 = 90;
      break;
  }

  return base;
}

// 更新相亲者状态
export function 更新相亲者状态(
  state: 相亲者核心状态,
  updates: Partial<相亲者核心状态>
): 相亲者核心状态 {
  return { ...state, ...updates };
}

// 添加相亲渠道
export function 添加相亲渠道(
  state: 相亲者核心状态,
  渠道: 相亲渠道
): 相亲者核心状态 {
  if (state.相亲渠道.includes(渠道)) {
    return state;
  }
  return 更新相亲者状态(state, {
    相亲渠道: [...state.相亲渠道, 渠道],
  });
}

// 记录相亲失败
export function 记录相亲失败(
  state: 相亲者核心状态,
  原因: string
): 相亲者核心状态 {
  return 更新相亲者状态(state, {
    相亲次数: state.相亲次数 + 1,
    相亲对象数: state.相亲对象数 + 1,
    失败原因: [...state.失败原因, 原因],
    年龄焦虑度: Math.min(100, state.年龄焦虑度 + 5),
  });
}

// 相亲成功
export function 相亲成功(
  state: 相亲者核心状态
): 相亲者核心状态 {
  return 更新相亲者状态(state, {
    当前状态: '恋爱',
    成功次数: state.成功次数 + 1,
    年龄焦虑度: Math.max(0, state.年龄焦虑度 - 20),
  });
}

// 进入暧昧期
export function 进入暧昧期(
  state: 相亲者核心状态
): 相亲者核心状态 {
  return 更新相亲者状态(state, {
    当前状态: '暧昧',
  });
}

// 订婚
export function 订婚(
  state: 相亲者核心状态
): 相亲者核心状态 {
  return 更新相亲者状态(state, {
    当前状态: '订婚',
    年龄焦虑度: Math.max(0, state.年龄焦虑度 - 30),
  });
}

// 结婚
export function 结婚(
  state: 相亲者核心状态
): 相亲者核心状态 {
  return 更新相亲者状态(state, {
    当前状态: '已婚',
    年龄焦虑度: 0,
    物质焦虑度: Math.max(0, state.物质焦虑度 - 20),
  });
}

// 被骗经历
export function 记录被骗(
  state: 相亲者核心状态,
  骗子ID: string
): 相亲者核心状态 {
  return 更新相亲者状态(state, {
    被骗次数: state.被骗次数 + 1,
    黑名单: [...state.黑名单, 骗子ID],
    物质焦虑度: Math.min(100, state.物质焦虑度 + 10),
    骗子识别能力: Math.min(100, state.骗子识别能力 + 15), // 吃一堑长一智
  });
}

// 增加相亲次数
export function 增加相亲次数(
  state: 相亲者核心状态
): 相亲者核心状态 {
  return 更新相亲者状态(state, {
    相亲次数: state.相亲次数 + 1,
    相亲对象数: state.相亲对象数 + 1,
  });
}

// 计算匹配度
export function 计算个人综合条件(state: 相亲者核心状态): number {
  let score = 50;

  // 年龄因素
  if (state.性别 === '女') {
    if (state.年龄 < 25) score += 15;
    else if (state.年龄 < 28) score += 10;
    else if (state.年龄 < 32) score += 5;
    else if (state.年龄 > 35) score -= 20;
  } else {
    if (state.年龄 < 28) score += 10;
    else if (state.年龄 < 35) score += 5;
    else if (state.年龄 > 40) score -= 10;
  }

  // 收入
  if (state.收入 > 50) score += 15;
  else if (state.收入 > 30) score += 10;
  else if (state.收入 > 15) score += 5;
  else if (state.收入 < 10) score -= 10;

  // 房产
  if (state.房产 === '无贷款') score += 10;
  else if (state.房产 === '有贷款') score += 5;
  else score -= 5;

  // 学历
  if (state.学历 === '博士') score += 10;
  else if (state.学历 === '硕士') score += 7;
  else if (state.学历 === '本科') score += 3;

  // 外貌
  if (state.外貌 === '帅气/漂亮') score += 15;
  else if (state.外貌 === '普通') score += 5;
  else if (state.外貌 === '难看') score -= 15;

  return Math.max(0, Math.min(100, score));
}

// 获取相亲者摘要
export function 获取相亲者摘要(state: 相亲者核心状态): string {
  return `${state.昵称}（${state.性别}，${state.年龄}岁）`
    + `| ${state.职业} | 年收${state.收入}万`
    + `| ${state.学历} | ${state.户籍}`
    + `| 相${state.相亲次数}次 | ${state.当前状态}`
    + `| 焦虑:${state.年龄焦虑度} | 物质:${state.物质焦虑度}`
    + `| 动机:${state.相亲动机}`;
}
