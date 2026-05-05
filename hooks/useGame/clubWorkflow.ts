/**
 * 校园社团系统工作流
 * 社团创建、加入、活动管理、成员关系
 */

// 使用 crypto.randomUUID 替代 uuid 依赖
const uuidv4 = (): string => crypto.randomUUID();

// 社团类型
export type 社团类型 = '学术' | '艺术' | '体育' | '社交' | '神秘' | '综合';
export type 社团职位 = '会长' | '副会长' | '骨干' | '普通成员';
export type 社团活动类型 = '比赛' | '演出' | '讲座' | '团建' | '社会实践' | '日常聚会';

// 社团数据
export interface 社团成员 {
  npcId: string;
  职位: 社团职位;
  加入时间: string;
  贡献度: number; // 0-100
  请假次数: number;
  最后活跃时间?: string;
}

export interface 社团资源 {
  资金: number;
  名气: number;    // 影响招募和活动效果
  凝聚力: number; // 影响活动成功率
  人脉: number;   // 影响对外合作
}

export interface 社团活动 {
  id: string;
  名称: string;
  类型: 社团活动类型;
  描述: string;
  消耗资源: Partial<社团资源>;
  预计收益: Partial<社团资源>;
  成功率: number; // 0-100
  实际结果?: '成功' | '失败' | '部分成功';
  参与成员: string[];
  时间: string;
  持续天数: number;
}

export interface 社团数据 {
  id: string;
  名称: string;
  类型: 社团类型;
  会长Id: string; // NPC ID
  成员: 社团成员[];
  资源: 社团资源;
  等级: number;     // 1-5级
  设施等级: number; // 1-5级，影响可举办活动类型
  成立时间: string;
  描述?: string;
  招新中: boolean;
  对外关系: Record<string, number>; // 其他社团的关系 -100到100
}

// 社团升级条件
export const 社团升级条件: Record<number, { 名气: number; 资金: number; 成员数: number }> = {
  2: { 名气: 50, 资金: 1000, 成员数: 5 },
  3: { 名气: 150, 资金: 3000, 成员数: 10 },
  4: { 名气: 400, 资金: 8000, 成员数: 20 },
  5: { 名气: 1000, 资金: 20000, 成员数: 35 },
};

// 社团活动配置
export const 社团活动配置: Record<社团活动类型, { 消耗资金: number; 消耗凝聚力: number; 名气收益: number; 凝聚力收益: number; 基础成功率: number }> = {
  '比赛': { 消耗资金: 500, 消耗凝聚力: 20, 名气收益: 100, 凝聚力收益: 5, 基础成功率: 60 },
  '演出': { 消耗资金: 800, 消耗凝聚力: 30, 名气收益: 150, 凝聚力收益: 10, 基础成功率: 70 },
  '讲座': { 消耗资金: 300, 消耗凝聚力: 10, 名气收益: 50, 凝聚力收益: 15, 基础成功率: 80 },
  '团建': { 消耗资金: 400, 消耗凝聚力: 5, 名气收益: 20, 凝聚力收益: 40, 基础成功率: 90 },
  '社会实践': { 消耗资金: 600, 消耗凝聚力: 25, 名气收益: 120, 凝聚力收益: 20, 基础成功率: 65 },
  '日常聚会': { 消耗资金: 100, 消耗凝聚力: 2, 名气收益: 5, 凝聚力收益: 20, 基础成功率: 95 },
};

/**
 * 创建新社团
 */
export function 创建社团(
  名称: string,
  类型: 社团类型,
  会长Id: string
): 社团数据 {
  return {
    id: uuidv4(),
    名称,
    类型,
    会长Id,
    成员: [{
      npcId: 会长Id,
      职位: '会长',
      加入时间: new Date().toISOString(),
      贡献度: 100,
      请假次数: 0,
    }],
    资源: {
      资金: 500,    // 初始资金
      名气: 10,     // 初始名气
      凝聚力: 50,   // 初始凝聚力
      人脉: 20,     // 初始人脉
    },
    等级: 1,
    设施等级: 1,
    成立时间: new Date().toISOString(),
    招新中: false,
    对外关系: {},
  };
}

/**
 * 添加社团成员
 */
export function 添加社团成员(
  社团: 社团数据,
  npcId: string,
  职位: 社团职位 = '普通成员'
): 社团数据 {
  const 新成员: 社团成员 = {
    npcId,
    职位,
    加入时间: new Date().toISOString(),
    贡献度: 0,
    请假次数: 0,
  };
  
  return {
    ...社团,
    成员: [...社团.成员, 新成员],
  };
}

/**
 * 移除社团成员
 */
export function 移除社团成员(社团: 社团数据, npcId: string): 社团数据 {
  const 被移除成员 = 社团.成员.find(m => m.npcId === npcId);
  
  // 会长不能直接移除，需要转让
  if (被移除成员?.职位 === '会长') {
    return 社团;
  }
  
  return {
    ...社团,
    成员: 社团.成员.filter(m => m.npcId !== npcId),
  };
}

/**
 * 成员贡献度变化
 */
export function 更新成员贡献度(
  社团: 社团数据,
  npcId: string,
  变化: number
): 社团数据 {
  return {
    ...社团,
    成员: 社团.成员.map(m => 
      m.npcId === npcId 
        ? { ...m, 贡献度: Math.max(0, Math.min(100, m.贡献度 + 变化)), 最后活跃时间: new Date().toISOString() }
        : m
    ),
  };
}

/**
 * 社团资金变化
 */
export function 更新社团资金(社团: 社团数据, 变化: number): 社团数据 {
  return {
    ...社团,
    资源: {
      ...社团.资源,
      资金: Math.max(0, 社团.资源.资金 + 变化),
    },
  };
}

/**
 * 举办社团活动
 */
export function 创建社团活动(
  社团: 社团数据,
  名称: string,
  类型: 社团活动类型,
  描述: string,
  参与成员: string[]
): 社团活动 {
  const config = 社团活动配置[类型];
  
  // 计算成功率
  const 成员加成 = Math.min(20, 参与成员.length * 2);
  const 凝聚力加成 = Math.floor(社团.资源.凝聚力 / 10);
  const 名气惩罚 = Math.min(10, Math.floor(社团.资源.名气 / 50));
  const 最终成功率 = Math.min(95, config.基础成功率 + 成员加成 + 凝聚力加成 -名气惩罚);
  
  return {
    id: uuidv4(),
    名称,
    类型,
    描述,
    消耗资源: {
      资金: config.消耗资金,
      凝聚力: config.消耗凝聚力,
    },
    预计收益: {
      名气: config.名气收益,
      凝聚力: config.凝聚力收益,
    },
    成功率: 最终成功率,
    参与成员,
    时间: new Date().toISOString(),
    持续天数: 类型 === '比赛' ? 3 : 类型 === '社会实践' ? 7 : 1,
  };
}

/**
 * 执行活动结果判定
 */
export function 判定活动结果(活动: 社团活动): 社团活动 {
  const 随机值 = Math.random() * 100;
  let 实际结果: '成功' | '失败' | '部分成功';
  
  if (随机值 <= 活动.成功率) {
    实际结果 = '成功';
  } else if (随机值 <= 活动.成功率 + 20) {
    实际结果 = '部分成功';
  } else {
    实际结果 = '失败';
  }
  
  return {
    ...活动,
    实际结果,
  };
}

/**
 * 应用活动结果到社团
 */
export function 应用活动结果(社团: 社团数据, 活动: 社团活动): 社团数据 {
  if (!活动.实际结果) return 社团;
  
  let 新社团 = { ...社团 };
  
  // 扣除消耗
  if (活动.消耗资源.资金) {
    新社团 = 更新社团资金(新社团, -活动.消耗资源.资金);
  }
  if (活动.消耗资源.凝聚力) {
    新社团.资源.凝聚力 = Math.max(0, 新社团.资源.凝聚力 - 活动.消耗资源.凝聚力);
  }
  
  // 根据结果计算收益
  let 收益倍数 = 0;
  switch (活动.实际结果) {
    case '成功':
      收益倍数 = 1.0;
      // 成功增加凝聚力
      新社团.资源.凝聚力 = Math.min(100, 新社团.资源.凝聚力 + (活动.预计收益.凝聚力 || 0));
      break;
    case '部分成功':
      收益倍数 = 0.5;
      break;
    case '失败':
      收益倍数 = 0;
      // 失败降低凝聚力和名气
      新社团.资源.凝聚力 = Math.max(0, 新社团.资源.凝聚力 - 10);
      新社团.资源.名气 = Math.max(0, 新社团.资源.名气 - 20);
      break;
  }
  
  // 应用收益
  if (活动.预计收益.名气) {
    新社团.资源.名气 += Math.floor(活动.预计收益.名气 * 收益倍数);
  }
  
  // 成员贡献度增加
  活动.参与成员.forEach(npcId => {
    新社团 = 更新成员贡献度(新社团, npcId, Math.floor(10 * 收益倍数 + 5));
  });
  
  return 新社团;
}

/**
 * 检查社团升级条件
 */
export function 检查社团升级条件(社团: 社团数据): { 可升级: boolean; 不足项: string[] } {
  const 条件 = 社团升级条件[社团.等级 + 1];
  if (!条件) return { 可升级: false, 不足项: [] }; // 已满级
  
  const 不足项: string[] = [];
  
  if (社团.资源.名气 < 条件.名气) 不足项.push(`名气(需要${条件.名气}, 当前${社团.资源.名气})`);
  if (社团.资源.资金 < 条件.资金) 不足项.push(`资金(需要${条件.资金}, 当前${社团.资源.资金})`);
  if (社团.成员.length < 条件.成员数) 不足项.push(`成员(需要${条件.成员数}, 当前${社团.成员.length})`);
  
  return {
    可升级: 不足项.length === 0,
    不足项,
  };
}

/**
 * 社团升级
 */
export function 社团升级(社团: 社团数据): 社团数据 {
  const 检查 = 检查社团升级条件(社团);
  if (!检查.可升级) return 社团;
  
  const 条件 = 社团升级条件[社团.等级 + 1];
  
  return {
    ...社团,
    等级: 社团.等级 + 1,
    资源: {
      ...社团.资源,
      资金: 社团.资源.资金 - 条件.资金,
    },
  };
}

/**
 * 计算社团排名（基于名气）
 */
export function 计算社团排名(社团列表: 社团数据[], 社团Id: string): number {
  const sorted = [...社团列表].sort((a, b) => b.资源.名气 - a.资源.名气);
  const index = sorted.findIndex(s => s.id === 社团Id);
  return index + 1;
}

/**
 * 获取社团状态描述
 */
export function 获取社团状态描述(社团: 社团数据): string {
  const 成员描述 = `${社团.成员.length}名成员`;
  const 等级描述 = `Lv.${社团.等级}`;
  const 资金描述 = 社团.资源.资金 >= 5000 ? '资金充裕' : 社团.资源.资金 >= 1000 ? '资金一般' : '资金紧张';
  const 名气描述 = 社团.资源.名气 >= 500 ? '赫赫有名' : 社团.资源.名气 >= 100 ? '小有名气' : '默默无闻';
  
  return `${等级描述}·${社团.名称}，${成员描述}，${名气描述}、${资金描述}。`;
}

/**
 * NPC是否在社团中
 */
export function NPC是否在社团中(社团: 社团数据, npcId: string): boolean {
  return 社团.成员.some(m => m.npcId === npcId);
}

/**
 * 获取NPC在社团中的职位
 */
export function 获取NPC社团职位(社团: 社团数据, npcId: string): 社团职位 | null {
  const 成员 = 社团.成员.find(m => m.npcId === npcId);
  return 成员?.职位 || null;
}
