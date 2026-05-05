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
 * 构建都市网约车 NSFW 运行时参数（供主剧情请求使用）
 */
export const 构建都市网约车NSFW参数 = (state: {
  都市网约车系统?: {
    行程系统?: {
      乘客欲望档案: Record<string, 乘客欲望档案>;
      当前行程类型: 行程NSFW类型 | null;
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
}): {
  行程类型?: 行程NSFW类型;
  乘客欲望阶段?: 乘客欲望阶段;
  关系轨道?: 行程关系轨道;
  暴露风险?: number;
  紧张度?: number;
  醉酒状态?: 醉酒状态;
  药物状态?: 药物状态;
  行车记录仪状态?: '关闭' | '录制中' | '已泄露';
  内容强度?: '微暗' | '暧昧' | '露骨';
  后果?: { 类型: 网约车后果类型; 严重程度: '轻微' | '中等' | '严重' | '毁灭'; NPC信息?: string };
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

  // 检查乘客欲望档案
  const 行程系统 = state.都市网约车系统?.行程系统;
  if (!行程系统?.乘客欲望档案) {
    return undefined;
  }

  const npcIds = Object.keys(行程系统.乘客欲望档案);
  if (npcIds.length === 0) {
    return undefined;
  }

  // 找出欲望阶段最高的 NPC 作为焦点
  const 阶段权重: Record<乘客欲望阶段, number> = { '克制': 0, '试探': 1, '渴望': 2, '沉沦': 3, '支配': 4 };
  const 焦点NpcId = npcIds.reduce((best, id) => {
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

  return {
    行程类型: 行程系统.当前行程类型 ?? undefined,
    乘客欲望阶段: 焦点档案.当前阶段,
    关系轨道: 焦点档案.关系轨道,
    暴露风险: 焦点档案.暴露风险值,
    紧张度: 焦点档案.紧张度,
    醉酒状态: 焦点档案.醉酒状态,
    药物状态: 焦点档案.药物状态,
    行车记录仪状态: 行程系统.行车记录仪状态 ?? '关闭',
    内容强度: nsfw设置.NSFW内容强度,
    后果: 未处理后果
      ? { 类型: 未处理后果.类型, 严重程度: 未处理后果.严重程度, NPC信息: 未处理后果.影响NPC.join('、') }
      : undefined,
  };
};
