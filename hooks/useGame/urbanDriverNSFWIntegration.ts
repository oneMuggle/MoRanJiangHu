/**
 * urbanDriverNSFWIntegration.ts
 * 将都市网约车 NSFW 引擎与主剧情发送工作流桥接
 *
 * 在主剧情 AI 响应处理后，解析 <都市网约车系统状态> 标签并应用状态变更。
 */

import type {
  乘客欲望阶段,
  行程关系轨道,
  醉酒状态,
  药物状态,
  乘客欲望档案,
} from '../../models/urbanDriverNSFW/core';
import type {
  行程NSFW类型,
  行程地点,
} from '../../models/urbanDriverNSFW/scenarios';
import type {
  网约车后果类型,
} from '../../models/urbanDriverNSFW/consequences';
import type { 都市网约车NSFW设置 } from '../../models/urbanDriverNSFW';

// 司机相关背景列表
const 司机背景列表 = ['网约车司机', '网约车夜司机', '代驾司机', '网约车队长'];

// 场景类型列表（用于随机分配初始行程）
const 行程类型列表 = ['深夜独处', '后座暗示', '停车场秘密', '醉酒搭车', '拼车暧昧', '常客关系', '行车记录仪', '饮料下药'] as const;

/**
 * 为单个 NPC 创建初始乘客欲望档案（含随机初始值）
 */
function 创建初始乘客档案(
  nsfw设置: 都市网约车NSFW设置,
): 乘客欲望档案 {
  // 根据设置的内容强度分配随机初始进度
  const 强度基数: Record<string, number> = { '微暗': 5, '暧昧': 15, '露骨': 25 };
  const 基数 = 强度基数[nsfw设置.NSFW内容强度 ?? '暧昧'] ?? 10;
  const 随机偏移 = Math.floor(Math.random() * 10);
  return {
    当前阶段: '克制' as 乘客欲望阶段,
    阶段进度: 基数 + 随机偏移,
    关系轨道: '暧昧' as 行程关系轨道,
    轨道进度: 基数 + 随机偏移,
    暴露风险值: Math.floor(Math.random() * 15),
    紧张度: Math.floor(Math.random() * 10),
    已解锁互动: [],
    里程碑列表: [],
  };
}

/**
 * 解析都市网约车系统状态更新标签
 * 格式: <都市网约车系统状态>{"更新档案":{"NPC_ID":{...}}}</都市网约车系统状态>
 */
export const 解析都市网约车系统状态更新 = (
  rawText: string
): {
  更新档案: Record<string, {
    当前阶段?: 乘客欲望阶段;
    阶段进度?: number;
    关系轨道?: 行程关系轨道;
    轨道进度?: number;
    暴露风险值?: number;
    紧张度?: number;
    当前行程类型?: 行程NSFW类型;
    当前地点?: 行程地点;
    药物状态?: { 类型: string; 生效阶段: '未生效' | '初期' | '强烈' | '衰退' };
    醉酒状态?: { 等级: '清醒' | '微醺' | '醉酒' | '烂醉'; 行为大胆度?: number; 记忆模糊度?: number; 判断力下降?: boolean };
  }>;
} | null => {
  const match = rawText.match(/<都市网约车系统状态>([\s\S]*?)<\/都市网约车系统状态>/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    if (!parsed.更新档案) return null;
    return parsed as {
      更新档案: Record<string, {
        当前阶段?: 乘客欲望阶段;
        阶段进度?: number;
        关系轨道?: 行程关系轨道;
        轨道进度?: number;
        暴露风险值?: number;
        紧张度?: number;
        当前行程类型?: 行程NSFW类型;
        当前地点?: 行程地点;
        药物状态?: { 类型: string; 生效阶段: '未生效' | '初期' | '强烈' | '衰退' };
        醉酒状态?: { 等级: '清醒' | '微醺' | '醉酒' | '烂醉'; 行为大胆度?: number; 记忆模糊度?: number; 判断力下降?: boolean };
      }>;
    };
  } catch {
    return null;
  }
};

/**
 * 移除都市网约车系统状态标签
 */
export const 移除都市网约车系统状态标签 = (rawText: string): string => {
  return rawText.replace(/<都市网约车系统状态>[\s\S]*?<\/都市网约车系统状态>/g, '').trim();
};

/**
 * 应用都市网约车系统状态更新
 * 将 AI 输出的状态变更合并到当前游戏状态中
 */
export const 应用都市网约车状态更新 = (
  current: { 行程系统?: Record<string, unknown> } | undefined,
  update: {
    更新档案: Record<string, {
      当前阶段?: 乘客欲望阶段;
      阶段进度?: number;
      关系轨道?: 行程关系轨道;
      轨道进度?: number;
      暴露风险值?: number;
      紧张度?: number;
      当前行程类型?: 行程NSFW类型;
      当前地点?: 行程地点;
      药物状态?: { 类型: string; 生效阶段: '未生效' | '初期' | '强烈' | '衰退' };
      醉酒状态?: { 等级: '清醒' | '微醺' | '醉酒' | '烂醉'; 行为大胆度?: number; 记忆模糊度?: number; 判断力下降?: boolean };
    }>;
  }
): { 行程系统?: Record<string, unknown> } | undefined => {
  if (!current?.行程系统) return current;

  const 行程系统 = current.行程系统 as {
    乘客欲望档案: Record<string, Record<string, unknown>>;
    活跃场景标签: string[];
    当前地点: string | null;
    行车记录仪状态: string;
    后果列表: unknown[];
    常客记录: unknown[];
  };

  // 确保乘客欲望档案存在
  if (!行程系统.乘客欲望档案) {
    行程系统.乘客欲望档案 = {};
  }
  // 确保活跃场景标签存在
  if (!行程系统.活跃场景标签) {
    行程系统.活跃场景标签 = [];
  }

  for (const [npcId, partialUpdate] of Object.entries(update.更新档案)) {
    const existing = 行程系统.乘客欲望档案[npcId] || {} as Record<string, unknown>;
    // 合并更新：只更新提供的字段
    for (const [key, value] of Object.entries(partialUpdate)) {
      if (key === '当前行程类型' && typeof value === 'string') {
        // 兼容旧字段：将单场景标签追加到活跃场景列表
        if (!行程系统.活跃场景标签.includes(value)) {
          行程系统.活跃场景标签.push(value);
        }
        continue;
      }
      if (key === '当前地点' && typeof value === 'string') {
        行程系统.当前地点 = value;
        continue;
      }
      if (value !== undefined) {
        existing[key] = value;
      }
    }
    行程系统.乘客欲望档案[npcId] = existing;
  }

  return { ...current, 行程系统 };
};

/**
 * 构建都市网约车 NSFW 运行时参数（供主剧情请求使用）
 */
export const 构建都市网约车NSFW参数 = (state: {
  都市网约车系统?: {
    行程系统?: {
      乘客欲望档案: Record<string, 乘客欲望档案>;
      活跃场景标签: 行程NSFW类型[];
      当前地点: 行程地点 | null;
      行车记录仪状态: '关闭' | '录制中' | '已泄露';
      后果列表: Array<{
        id: string;
        类型: 网约车后果类型;
        严重程度: '轻微' | '中等' | '严重' | '毁灭';
        描述: string;
        触发时间: number;
        影响NPC: string[];
        已处理: boolean;
      }>;
      常客记录: Array<{ 乘客Id: string; 搭乘次数: number; 最后时间: number }>;
    };
  };
  gameConfig?: {
    都市网约车NSFW设置?: 都市网约车NSFW设置;
  };
  角色?: {
    出身背景?: {
      名称?: string;
    };
  };
  时代配置ID?: string;
  社交列表?: Array<{ id: string; 姓名?: string }>;
}): {
  活跃场景标签?: 行程NSFW类型[];
  乘客欲望阶段?: 乘客欲望阶段;
  关系轨道?: 行程关系轨道;
  暴露风险?: number;
  紧张度?: number;
  醉酒状态?: 醉酒状态;
  药物状态?: 药物状态;
  行车记录仪状态?: '关闭' | '录制中' | '已泄露';
  内容强度?: '微暗' | '暧昧' | '露骨';
  后果?: { 类型: 网约车后果类型; 严重程度: '轻微' | '中等' | '严重' | '毁灭'; NPC信息?: string };
  首选药物类型?: '迷药' | '安眠药' | '兴奋剂' | '催情药' | '致幻剂' | '记忆阻断剂' | '随机';
} | undefined => {
  // 检查时代配置
  if (state.时代配置ID !== 'contemporary_urban') {
    return undefined;
  }

  // 检查是否为司机背景
  const 背景 = state.角色?.出身背景?.名称;
  if (!背景 || !司机背景列表.includes(背景)) {
    return undefined;
  }

  // 检查子系统开关
  const nsfw设置 = state.gameConfig?.都市网约车NSFW设置;
  if (!nsfw设置?.启用都市网约车NSFW系统) {
    return undefined;
  }

  // 获取或创建行程系统（兼容旧存档缺少字段的情况）
  let 行程系统 = state.都市网约车系统?.行程系统;
  if (!行程系统) {
    // 当时代和背景条件满足时，内联创建默认行程系统，避免因存档缺少字段而跳过
    行程系统 = {
      乘客欲望档案: {} as Record<string, 乘客欲望档案>,
      活跃场景标签: [],
      当前地点: null,
      行车记录仪状态: '关闭' as const,
      后果列表: [],
      常客记录: [],
    };
  }

  // 确保字段完整（兜底补全，兼容旧存档）
  if (!行程系统.乘客欲望档案 || typeof 行程系统.乘客欲望档案 !== 'object') {
    行程系统.乘客欲望档案 = {} as Record<string, 乘客欲望档案>;
  }
  if (!行程系统.活跃场景标签) {
    行程系统.活跃场景标签 = [];
  }
  if (!行程系统.后果列表) {
    行程系统.后果列表 = [];
  }
  if (!行程系统.常客记录) {
    行程系统.常客记录 = [];
  }

  // 兜底：当档案为空但社交列表有 NPC 时，内联创建初始档案
  const npcIds = Object.keys(行程系统.乘客欲望档案);
  if (npcIds.length === 0 && Array.isArray(state.社交列表) && state.社交列表.length > 0) {
    for (const npc of state.社交列表) {
      行程系统.乘客欲望档案[npc.id] = 创建初始乘客档案(nsfw设置);
    }
  }

  const finalNpcIds = Object.keys(行程系统.乘客欲望档案);
  if (finalNpcIds.length === 0) {
    return undefined;
  }

  // 将当前设置中启用但尚未在活跃列表中的场景补充进去
  const 启用的行程类型 = 行程类型列表.filter(t => {
    if (t === '醉酒搭车') return nsfw设置.启用醉酒乘客场景;
    if (t === '饮料下药') return nsfw设置.启用饮料下药场景;
    if (t === '深夜独处') return nsfw设置.启用深夜独处场景;
    if (t === '后座暗示') return nsfw设置.启用后座暗示场景;
    if (t === '停车场秘密') return nsfw设置.启用停车场秘密场景;
    if (t === '拼车暧昧') return nsfw设置.启用拼车暧昧场景;
    if (t === '常客关系') return nsfw设置.启用常客关系系统;
    if (t === '行车记录仪') return nsfw设置.启用行车记录仪系统;
    return false;
  });
  for (const 类型 of 启用的行程类型) {
    if (!行程系统.活跃场景标签.includes(类型)) {
      行程系统.活跃场景标签.push(类型 as 行程NSFW类型);
    }
  }

  // 找出欲望阶段最高的 NPC 作为焦点
  const 阶段权重: Record<乘客欲望阶段, number> = { '克制': 0, '试探': 1, '渴望': 2, '沉沦': 3, '支配': 4 };
  const 焦点NpcId = finalNpcIds.reduce((best, id) => {
    const a = 行程系统.乘客欲望档案[id];
    const b = 行程系统.乘客欲望档案[best];
    return (阶段权重[a?.当前阶段] || 0) > (阶段权重[b?.当前阶段] || 0) ? id : best;
  });

  const 焦点档案 = 行程系统.乘客欲望档案[焦点NpcId];
  if (!焦点档案) {
    return undefined;
  }

  // 获取最新的未处理后果
  const 未处理后果 = 行程系统.后果列表?.find(c => !c.已处理);

  // 当活跃场景包含"饮料下药"且药物状态为空时，自动初始化为初期
  const 包含下药场景 = (行程系统.活跃场景标签 ?? []).includes('饮料下药');
  let 药物状态 = 焦点档案.药物状态;
  if (包含下药场景 && !药物状态) {
    // 根据玩家设置的首选药物类型选择，随机时随机选择
    const 可选药物类型 = ['迷药', '安眠药', '兴奋剂', '催情药', '致幻剂', '记忆阻断剂'] as const;
    const 药物类型 = nsfw设置.首选药物类型 === '随机'
      ? 可选药物类型[Math.floor(Math.random() * 可选药物类型.length)]
      : nsfw设置.首选药物类型;
    药物状态 = { 类型: 药物类型, 生效阶段: '初期' as const, 意识清晰度: 80, 身体控制度: 85 };
  }

  return {
    活跃场景标签: 行程系统.活跃场景标签,
    乘客欲望阶段: 焦点档案.当前阶段,
    关系轨道: 焦点档案.关系轨道,
    暴露风险: 焦点档案.暴露风险值,
    紧张度: 焦点档案.紧张度,
    醉酒状态: 焦点档案.醉酒状态,
    药物状态,
    行车记录仪状态: 行程系统.行车记录仪状态 ?? '关闭',
    内容强度: nsfw设置.NSFW内容强度,
    首选药物类型: nsfw设置.首选药物类型,
    后果: 未处理后果
      ? { 类型: 未处理后果.类型, 严重程度: 未处理后果.严重程度, NPC信息: 未处理后果.影响NPC.join('、') }
      : undefined,
  };
};
