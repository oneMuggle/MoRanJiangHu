/**
 * 宠物状态管理
 */

import type {
  宠物核心状态,
  宠物类型,
  宠物品种,
  宠物年龄,
  宠物来源,
} from '../types';

// 默认宠物名池
const 猫咪名池 = ['奶茶', '布丁', '团子', '豆豆', '米粒', '糖糖', '雪球', '丸子', '花花', '小咪'];
const 狗狗名池 = ['旺财', '来福', '可乐', '豆芽', '土豆', '笨笨', '球球', '小黑', '小白', '大黄'];
const 其他宠物名池 = ['小宠', '球球', '豆豆', '咪咪', '噜噜', '皮皮'];

// 创建默认宠物状态
export function 创建默认宠物状态(partial?: Partial<宠物核心状态>): 宠物核心状态 {
  return {
    ID: partial?.ID || `宠物_${Date.now()}`,
    名称: partial?.名称 || '',
    类型: partial?.类型 || '猫咪',
    品种: partial?.品种 || '宠物级',
    年龄: partial?.年龄 || '成年',
    性别: partial?.性别 || '母',

    // 健康状态
    健康值: partial?.健康值 ?? 80,
    外观值: partial?.外观值 ?? 70,
    心情值: partial?.心情值 ?? 80,
    饱腹度: partial?.饱腹度 ?? 80,
    卫生度: partial?.卫生度 ?? 80,

    // 身份信息
    来源: partial?.来源 || '宠物店购买',
    血统证书: partial?.血统证书 ?? false,
    芯片植入: partial?.芯片植入 ?? false,
    免疫记录: partial?.免疫记录 || [],

    // 价值评估
    购买价格: partial?.购买价格 || 0,
    当前价值: partial?.当前价值 || 0,
    繁育价值: partial?.繁育价值 || 0,
    比赛价值: partial?.比赛价值 || 0,

    // 行为特质
    亲人度: partial?.亲人度 ?? 60,
    攻击性: partial?.攻击性 ?? 20,
    服从度: partial?.服从度 ?? 50,
    粘人度: partial?.粘人度 ?? 60,

    // 安全记录
    生病的次数: partial?.生病的次数 || 0,
    事故次数: partial?.事故次数 || 0,
    伤人记录: partial?.伤人记录 || 0,
    走失次数: partial?.走失次数 || 0,
  };
}

// 根据宠物类型创建宠物
export function 根据类型创建宠物(
  类型: 宠物类型,
  品种: 宠物品种,
  名称?: string
): 宠物核心状态 {
  const 名池 = 类型 === '猫咪' ? 猫咪名池 
    : 类型 === '狗狗' ? 狗狗名池 
    : 其他宠物名池;
  
  const 默认名 = 名池[Math.floor(Math.random() * 名池.length)];
  
  const base = 创建默认宠物状态({ 类型, 品种, 名称: 名称 || 默认名 });

  // 根据品种调整价值
  switch (品种) {
    case '赛级':
      base.购买价格 = 20000 + Math.floor(Math.random() * 30000);
      base.当前价值 = base.购买价格 * 0.8;
      base.比赛价值 = 80;
      base.血统证书 = true;
      break;
    case '纯种':
      base.购买价格 = 8000 + Math.floor(Math.random() * 12000);
      base.当前价值 = base.购买价格 * 0.7;
      base.比赛价值 = 50;
      base.血统证书 = true;
      break;
    case '繁育级':
      base.购买价格 = 10000 + Math.floor(Math.random() * 15000);
      base.当前价值 = base.购买价格 * 0.6;
      base.繁育价值 = 80;
      base.血统证书 = true;
      break;
    case '宠物级':
      base.购买价格 = 1000 + Math.floor(Math.random() * 4000);
      base.当前价值 = base.购买价格 * 0.5;
      break;
    case '串串':
      base.购买价格 = 100 + Math.floor(Math.random() * 400);
      base.当前价值 = base.购买价格 * 0.3;
      break;
    case '土猫/土狗':
      base.购买价格 = 0;
      base.当前价值 = 0;
      break;
  }

  return base;
}

// 更新宠物状态
export function 更新宠物状态(
  state: 宠物核心状态,
  updates: Partial<宠物核心状态>
): 宠物核心状态 {
  return { ...state, ...updates };
}

// 宠物健康检查
export function 健康检查(宠物: 宠物核心状态): {
  总体状态: '优秀' | '良好' | '一般' | '欠佳';
  问题: string[];
  建议: string[];
} {
  const 问题: string[] = [];
  const 建议: string[] = [];

  if (宠物.健康值 < 50) {
    问题.push('健康状况欠佳');
    建议.push('建议进行全面体检');
  }

  if (宠物.外观值 < 50) {
    问题.push('外观状况较差');
    建议.push('建议进行美容护理');
  }

  if (宠物.心情值 < 40) {
    问题.push('情绪低落');
    建议.push('增加陪伴时间和互动');
  }

  if (宠物.饱腹度 < 30) {
    问题.push('饥饿状态');
    建议.push('及时喂食');
  }

  if (宠物.卫生度 < 40) {
    问题.push('卫生状况不佳');
    建议.push('建议洗澡清洁');
  }

  // 攻击性检查
  if (宠物.攻击性 > 60) {
    问题.push('有攻击倾向');
    建议.push('建议进行行为训练');
  }

  let 总体状态: '优秀' | '良好' | '一般' | '欠佳' = '优秀';
  if (问题.length >= 3) 总体状态 = '欠佳';
  else if (问题.length >= 1) 总体状态 = '一般';
  else if (问题.length === 0 && 宠物.健康值 > 80) 总体状态 = '优秀';
  else if (问题.length === 0) 总体状态 = '良好';

  return { 总体状态, 问题, 建议 };
}

// 宠物价值折旧
export function 计算宠物价值(state: 宠物核心状态): 宠物核心状态 {
  let 当前价值 = state.当前价值;
  const 年龄 = state.年龄;

  // 赛级/繁育级宠物贬值慢
  if (state.品种 === '赛级' || state.品种 === '繁育级') {
    当前价值 = state.购买价格 * 0.8; // 保持较高价值
  } else {
    // 宠物级/串串快速贬值
    switch (年龄) {
      case '幼年':
        当前价值 = state.购买价格 * 0.6;
        break;
      case '少年':
        当前价值 = state.购买价格 * 0.4;
        break;
      case '成年':
        当前价值 = state.购买价格 * 0.2;
        break;
      case '老年':
        当前价值 = state.购买价格 * 0.1;
        break;
    }
  }

  return 更新宠物状态(state, { 当前价值 });
}

// 宠物心情变化
export function 更新宠物心情(
  state: 宠物核心状态,
  变化值: number
): 宠物核心状态 {
  const 心情值 = Math.max(0, Math.min(100, state.心情值 + 变化值));
  return 更新宠物状态(state, { 心情值 });
}

// 宠物饥饿度变化
export function 更新饥饿度(
  state: 宠物核心状态,
  变化值: number
): 宠物核心状态 {
  const 饱腹度 = Math.max(0, Math.min(100, state.饱腹度 + 变化值));
  
  // 饥饿影响健康和心情
  let 健康值 = state.健康值;
  let 心情值 = state.心情值;
  
  if (饱腹度 < 20) {
    健康值 = Math.max(0, 健康值 - 5);
    心情值 = Math.max(0, 心情值 - 10);
  }

  return 更新宠物状态(state, { 饱腹度, 健康值, 心情值 });
}

// 星期狗检测 - 从非正规渠道购买后的风险评估
export function 星期狗风险评估(宠物: 宠物核心状态): {
  是否高风险: boolean;
  风险等级: '低' | '中' | '高' | '极高';
  可能症状: string[];
  建议: string[];
} {
  // 非正规来源
  const 非正规来源 = ['路边购买', '朋友赠送', '自行繁殖'];
  const 是非正规 = 非正规来源.includes(宠物.来源);
  const 无证书 = !宠物.血统证书 && (宠物.品种 === '纯种' || 宠物.品种 === '赛级');
  const 无芯片 = !宠物.芯片植入;

  let 风险点 = 0;
  if (是非正规) 风险点 += 2;
  if (无证书) 风险点 += 1;
  if (无芯片) 风险点 += 1;

  const 可能症状 = [
    '精神萎靡',
    '食欲下降',
    '呕吐腹泻',
    '发热咳嗽',
    '眼鼻分泌物',
  ];

  const 建议: string[] = [];
  if (风险点 >= 2) {
    建议.push('建议购买后尽快进行健康检查');
    建议.push('观察7天内精神状态');
    建议.push('不要洗澡或改变饮食');
  }

  let 风险等级: '低' | '中' | '高' | '极高' = '低';
  if (风险点 >= 3) 风险等级 = '极高';
  else if (风险点 >= 2) 风险等级 = '高';
  else if (风险点 >= 1) 风险等级 = '中';

  return {
    是否高风险: 风险点 >= 2,
    风险等级,
    可能症状,
    建议,
  };
}

// 获取宠物摘要
export function 获取宠物摘要(state: 宠物核心状态): string {
  return `${state.名称}（${state.类型}，${state.品种}，${state.性别}性，${state.年龄}）`
    + `| 健康${state.健康值} | 外观${state.外观值} | 心情${state.心情值}`
    + `| 亲人度${state.亲人度} | 攻击性${state.攻击性}`;
}
