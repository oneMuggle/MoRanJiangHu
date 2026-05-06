/**
 * 校园纪元 NPC 关系引擎
 * 负责 NPC 关系的完整生命周期管理
 */

import type { NPC结构 } from '../../models/domain/social';
import type {
  NPC关系数据,
  关系事件,
  关系类型,
  互动类型,
} from '../../models/campusNSFW';
import {
  创建默认关系数据,
  计算关系类型,
  能否进阶,
  计算互动效果,
  验证关系数据,
  关系阈值配置,
} from '../../models/campusNSFW';

/**
 * 初始化 NPC 关系
 * 为 NPC 创建初始关系数据
 */
export function 初始化NPC关系(npcId: string): NPC关系数据 {
  return 创建默认关系数据(npcId);
}

/**
 * 从 NPC 结构初始化关系数据
 * 如果 NPC 已有关系数据则返回，否则创建新的
 */
export function 从NPC初始化关系(npc: NPC结构): NPC关系数据 {
  if (npc.关系数据 && 验证关系数据(npc.关系数据)) {
    return npc.关系数据;
  }
  return 创建默认关系数据(npc.id);
}

/**
 * 更新关系数据
 * 对指定属性进行增量更新
 */
export function 更新关系数据(
  当前数据: NPC关系数据,
  变化: {
    好感度?: number;
    亲密度?: number;
    信任度?: number;
    感情值?: number;
  }
): NPC关系数据 {
  const 更新后 = { ...当前数据 };

  if (变化.好感度 !== undefined) {
    更新后.好感度 = Math.max(0, Math.min(100, 更新后.好感度 + 变化.好感度));
  }
  if (变化.亲密度 !== undefined) {
    更新后.亲密度 = Math.max(0, Math.min(100, 更新后.亲密度 + 变化.亲密度));
  }
  if (变化.信任度 !== undefined) {
    更新后.信任度 = Math.max(0, Math.min(100, 更新后.信任度 + 变化.信任度));
  }
  if (变化.感情值 !== undefined) {
    更新后.感情值 = Math.max(0, Math.min(100, 更新后.感情值 + 变化.感情值));
  }

  // 更新最近互动时间
  更新后.最近互动时间 = new Date().toISOString();
  更新后.互动次数 += 1;

  return 更新后;
}

/**
 * 添加关系事件
 * 记录一次关系互动的详细信息
 */
export function 添加关系事件(
  当前数据: NPC关系数据,
  事件: Omit<关系事件, 'id'>
): NPC关系数据 {
  const 新事件: 关系事件 = {
    ...事件,
    id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };

  return {
    ...当前数据,
    关键事件: [...当前数据.关键事件, 新事件],
  };
}

/**
 * 计算当前关系阶段
 * 根据当前数值计算关系类型
 */
export function 计算关系阶段(数据: NPC关系数据): 关系类型 {
  return 计算关系类型(数据);
}

/**
 * 检查关系进展
 * 判断当前数据是否满足进阶条件
 */
export function 检查关系进展(数据: NPC关系数据): {
  可进阶: boolean;
  当前阶段: 关系类型;
  下一阶段?: 关系类型;
} {
  const 当前阶段 = 计算关系类型(数据);
  const 阶段顺序: 关系类型[] = ['陌生', '相识', '好感', '亲密', '恋人'];

  // 寻找下一阶段
  const 当前索引 = 阶段顺序.indexOf(当前阶段);
  let 下一阶段: 关系类型 | undefined;

  if (当前索引 < 阶段顺序.length - 1) {
    // 恋人之后可能是挚友，需要特殊判断
    if (当前阶段 === '恋人') {
      下一阶段 = '挚友';
    } else {
      下一阶段 = 阶段顺序[当前索引 + 1];
    }
  }

  // 检查是否满足进阶条件
  const 可进阶 = 下一阶段 ? 能否进阶(当前阶段, 数据) : false;

  return {
    可进阶,
    当前阶段,
    下一阶段,
  };
}

/**
 * 执行互动并返回关系变化
 * 计算互动效果并更新关系数据
 */
export function 执行关系互动(
  当前数据: NPC关系数据,
  互动类型: 互动类型,
  场景?: string
): {
  更新后数据: NPC关系数据;
  变化值: { 好感度: number; 亲密度: number; 信任度: number; 感情值: number };
  事件: Omit<关系事件, 'id'>;
} {
  // 计算互动效果
  const 变化值 = 计算互动效果(互动类型, 场景);

  // 更新数值
  let 更新后数据 = 更新关系数据(当前数据, 变化值);

  // 记录事件
  const 事件: Omit<关系事件, 'id'> = {
    时间: new Date().toISOString(),
    类型: 互动类型 === '亲密互动' ? '亲密' : 互动类型 === '冲突' ? '冲突' : '对话',
    标题: get互动标题(互动类型),
    描述: get互动描述(互动类型, 变化值),
    好感度变化: 变化值.好感度,
    亲密度变化: 变化值.亲密度,
    信任度变化: 变化值.信任度,
    感情值变化: 变化值.感情值,
  };

  更新后数据 = 添加关系事件(更新后数据, 事件);

  return {
    更新后数据,
    变化值,
    事件,
  };
}

/**
 * 解锁关系场景
 * 添加新的私密场景到解锁列表
 */
export function 解锁关系场景(
  当前数据: NPC关系数据,
  场景Id: string
): NPC关系数据 {
  if (当前数据.解锁场景.includes(场景Id)) {
    return 当前数据;
  }

  return {
    ...当前数据,
    解锁场景: [...当前数据.解锁场景, 场景Id],
  };
}

/**
 * 设置独占标记
 * 确立独占关系
 */
export function 设置独占标记(
  当前数据: NPC关系数据,
  独占: boolean = true
): NPC关系数据 {
  return {
    ...当前数据,
    独家标记: 独占,
    关系状态: 独占 ? '已确认' : 当前数据.关系状态,
  };
}

/**
 * 获取关系摘要
 * 生成人类可读的关系描述
 */
export function 获取关系摘要(数据: NPC关系数据): string {
  const 阶段 = 计算关系类型(数据);
  const 阶段描述 = get阶段描述(阶段);

  return `${阶段描述}：好感度${数据.好感度}/100，亲密度${数据.亲密度}/100，信任度${数据.信任度}/100，感情值${数据.感情值}/100`;
}

/**
 * 获取互动标题
 */
function get互动标题(类型: 互动类型): string {
  const 标题映射: Record<互动类型, string> = {
    '对话': '日常对话',
    '送礼': '赠送礼物',
    '邀约': '约会邀约',
    '任务帮助': '帮助完成',
    '亲密互动': '亲密接触',
    '冲突': '发生冲突',
  };
  return 标题映射[类型] || '未知互动';
}

/**
 * 获取互动描述
 */
function get互动描述(
  类型: 互动类型,
  变化值: { 好感度: number; 亲密度: number; 信任度: number; 感情值: number }
): string {
  const 正向 = 变化值.好感度 > 0 ? '提升' : '下降';
  return `${get互动标题(类型)}，关系数值${正向}`;
}

/**
 * 获取阶段描述
 */
function get阶段描述(阶段: 关系类型): string {
  const 描述映射: Record<关系类型, string> = {
    '陌生': '陌生',
    '相识': '相识',
    '好感': '有好感',
    '亲密': '亲密关系',
    '恋人': '恋人',
    '挚友': '挚友',
  };
  return 描述映射[阶段] || '未知';
}

/**
 * 批量更新 NPC 关系列表
 * 用于游戏存档的整体关系状态更新
 */
export function 批量更新NPC关系(
  关系列表: Record<string, NPC关系数据>,
  npcId: string,
  更新: Partial<NPC关系数据>
): Record<string, NPC关系数据> {
  const 当前 = 关系列表[npcId];
  if (!当前) {
    return 关系列表;
  }

  return {
    ...关系列表,
    [npcId]: { ...当前, ...更新 },
  };
}
