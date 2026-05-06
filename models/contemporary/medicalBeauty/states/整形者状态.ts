/**
 * 整形者状态管理
 */

import type {
  整形者核心状态,
  整形动机,
  整形阶段,
  消费能力,
  手术类型,
} from './types';

// 默认化名池
const 化名池 = [
  '小雅', '婷婷', '雪儿', 'Lily', 'Coco', 'Momo',
  '苏苏', '瑶瑶', '甜甜', '欣欣', '梦梦', '琪琪',
  '雨晴', '思思', '佳佳', '婷婷', '美美', '莎莎',
];

// 创建默认整形者状态
export function 创建默认整形者状态(partial?: Partial<整形者核心状态>): 整形者核心状态 {
  return {
    ID: partial?.ID || `整形_${Date.now()}`,
    昵称: partial?.昵称 || 化名池[Math.floor(Math.random() * 化名池.length)],
    本名: partial?.本名,
    性别: partial?.性别 || '女',
    年龄: partial?.年龄 || 25,

    // 外貌基础
    原生颜值: partial?.原生颜值 || 6,
    当前颜值: partial?.当前颜值 || 6,
    外貌焦虑: partial?.外貌焦虑 || 50,

    // 整形信息
    整形动机: partial?.整形动机 || '跟风从众',
    整形阶段: partial?.整形阶段 || '观望',
    做过项目: partial?.做过项目 || [],
    累计花费: partial?.累计花费 || 0,
    整形次数: partial?.整形次数 || 0,

    // 经济状况
    消费能力: partial?.消费能力 || '普通白领',
    贷款金额: partial?.贷款金额 || 0,
    还款压力: partial?.还款压力 || 0,
    月还款: partial?.月还款 || 0,

    // 心理状态
    满意度: partial?.满意度 || 100,
    成瘾程度: partial?.成瘾程度 || 0,
    焦虑程度: partial?.焦虑程度 || 30,
    自信程度: partial?.自信程度 || 50,
    羞耻程度: partial?.羞耻程度 || 40,

    // 安全记录
    手术失败次数: partial?.手术失败次数 || 0,
    并发症次数: partial?.并发症次数 || 0,
    维权次数: partial?.维权次数 || 0,

    // 社会关系
    家人知道: partial?.家人知道 || false,
    朋友知道: partial?.朋友知道 || false,
    同事知道: partial?.同事知道 || false,
    男朋友/老公知道: partial?.['男朋友/老公知道'] || false,
  };
}

// 根据动机创建整形者
export function 根据动机创建整形者(
  动机: 整形动机,
  消费能力: 消费能力,
  年龄?: number
): 整形者核心状态 {
  const base = 创建默认整形者状态({ 整形动机: 动机, 消费能力, 年龄 });

  switch (动机) {
    case '职业需求':
      base.羞耻程度 = 30;
      base.外貌焦虑 = 70;
      base.整形阶段 = '咨询';
      break;
    case '婚姻需求':
      base.羞耻程度 = 50;
      base.外貌焦虑 = 60;
      break;
    case '自信提升':
      base.羞耻程度 = 40;
      base.外貌焦虑 = 65;
      base.自信程度 = 30;
      break;
    case '修复缺陷':
      base.羞耻程度 = 60;
      base.外貌焦虑 = 80;
      break;
    case '跟风从众':
      base.羞耻程度 = 45;
      base.外貌焦虑 = 55;
      break;
    case '上瘾沉迷':
      base.羞耻程度 = 35;
      base.外貌焦虑 = 85;
      base.成瘾程度 = 70;
      base.整形阶段 = '上瘾期';
      break;
  }

  return base;
}

// 更新整形者状态
export function 更新整形者状态(
  state: 整形者核心状态,
  updates: Partial<整形者核心状态>
): 整形者核心状态 {
  return { ...state, ...updates };
}

// 进行手术
export function 进行手术(
  state: 整形者核心状态,
  项目: 手术类型,
  花费: number
): 整形者核心状态 {
  const updates: Partial<整形者核心状态> = {
    做过项目: [...state.做过项目, 项目],
    累计花费: state.累计花费 + 花费,
    整形次数: state.整形次数 + 1,
    整形阶段: '修复期',
  };

  // 手术后满意度会波动
  updates.满意度 = 80; // 刚开始期望值高

  // 成瘾程度可能增加
  if (state.成瘾程度 > 50) {
    updates.成瘾程度 = Math.min(100, state.成瘾程度 + 10);
  }

  return 更新整形者状态(state, updates);
}

// 手术失败
export function 记录手术失败(
  state: 整形者核心状态,
  类型: '效果不满意' | '并发症' | '毁容'
): 整形者核心状态 {
  const updates: Partial<整形者核心状态> = {
    满意度: Math.max(0, state.满意度 - 30),
    焦虑程度: Math.min(100, state.焦虑程度 + 20),
    手术失败次数: state.手术失败次数 + 1,
  };

  if (类型 === '并发症') {
    updates.并发症次数 = state.并发症次数 + 1;
  }

  return 更新整形者状态(state, updates);
}

// 申请贷款
export function 申请整形贷(
  state: 整形者核心状态,
  金额: number,
  月利率: number,
  期数: number
): 整形者核心状态 {
  const 月还款 = (金额 * (1 + 月利率)) / 期数;
  
  // 估算月收入（根据消费能力）
  let 预估月收入 = 5000;
  switch (state.消费能力) {
    case '学生党': 预估月收入 = 2000; break;
    case '普通白领': 预估月收入 = 8000; break;
    case '中产阶层': 预估月收入 = 20000; break;
    case '有钱任性': 预估月收入 = 50000; break;
    case '网红富婆': 预估月收入 = 100000; break;
  }

  const 还款压力 = Math.round((月还款 / 预估月收入) * 100);

  return 更新整形者状态(state, {
    贷款金额: state.贷款金额 + 金额,
    月还款: state.月还款 + 月还款,
    还款压力: Math.min(100, state.还款压力 + 还款压力),
    整形阶段: state.整形阶段 === '观望' ? '首次手术' : state.整形阶段,
  });
}

// 进入修复期
export function 进入修复期(state: 整形者核心状态): 整形者核心状态 {
  return 更新整形者状态(state, {
    整形阶段: '修复期',
    满意度: Math.max(0, state.满意度 - 20),
  });
}

// 修复完成
export function 修复完成(state: 整形者核心状态): 整形者核心状态 {
  return 更新整形者状态(state, {
    整形阶段: state.成瘾程度 > 60 ? '上瘾期' : '二次手术',
    满意度: 70,
  });
}

// 曝光被发现
export function 曝光被发现(
  state: 整形者核心状态,
  发现者: '家人' | '朋友' | '同事' | '男友/老公'
): 整形者核心状态 {
  const updates: Partial<整形者核心状态> = {
    羞耻程度: Math.min(100, state.羞耻程度 + 30),
    焦虑程度: Math.min(100, state.焦虑程度 + 20),
  };

  switch (发现者) {
    case '家人': updates.家人知道 = true; break;
    case '朋友': updates.朋友知道 = true; break;
    case '同事': updates.同事知道 = true; break;
    case '男友/老公': updates['男朋友/老公知道'] = true; break;
  }

  return 更新整形者状态(state, updates);
}

// 计算外貌焦虑
export function 计算外貌焦虑(state: 整形者核心状态): number {
  let 焦虑 = state.外貌焦虑;

  // 社交媒体曝光增加焦虑
  if (state.整形次数 === 0 && 焦虑 > 30) {
    焦虑 += 5;
  }

  // 失败经历增加焦虑
  焦虑 += state.手术失败次数 * 10;
  焦虑 += state.并发症次数 * 5;

  // 成瘾程度高会持续焦虑
  if (state.成瘾程度 > 70) {
    焦虑 = Math.min(100, 焦虑 + 15);
  }

  // 贷款压力增加焦虑
  if (state.还款压力 > 50) {
    焦虑 = Math.min(100, 焦虑 + 10);
  }

  return Math.max(0, Math.min(100, 焦虑));
}

// 获取整形者摘要
export function 获取整形者摘要(state: 整形者核心状态): string {
  return `${state.昵称}（${state.性别}，${state.年龄}岁）`
    + `| 动机:${state.整形动机} | 阶段:${state.整形阶段}`
    + `| 做过${state.做过项目.length}个项目 | 累计${state.累计花费}元`
    + `| 颜值:${state.原生颜值}→${state.当前颜值}`
    + `| 成瘾度:${state.成瘾程度} | 满意度:${state.满意度}`;
}
