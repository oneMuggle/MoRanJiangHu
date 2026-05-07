/**
 * photographyNSFWIntegration.ts
 * 将写真约拍 NSFW 引擎与主剧情发送工作流桥接
 *
 * 在主剧情 AI 响应处理后，解析 <写真系统状态> 标签并应用状态变更。
 */

import type {
  写真NSFW设置,
  写真系统扩展,
  模特核心状态,
  拍摄项目状态,
  泄露事件状态,
} from '../../models/photographyNSFW';

/**
 * 解析写真系统状态更新标签
 * 格式: <写真系统状态>{"更新档案":{"NPC_ID":{...}}}</写真系统状态>
 */
export const 解析写真系统状态更新 = (
  rawText: string
): {
  更新模特档案?: Record<string, Partial<模特核心状态>>;
  更新摄影师档案?: Record<string, any>;
  更新拍摄项目?: Partial<拍摄项目状态>[];
  新泄露事件?: 泄露事件状态[];
} | null => {
  const match = rawText.match(/<写真系统状态>([\s\S]*?)<\/写真系统状态>/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    return parsed as {
      更新模特档案?: Record<string, Partial<模特核心状态>>;
      更新摄影师档案?: Record<string, any>;
      更新拍摄项目?: Partial<拍摄项目状态>[];
      新泄露事件?: 泄露事件状态[];
    };
  } catch {
    return null;
  }
};

/**
 * 移除写真系统状态标签
 */
export const 移除写真系统状态标签 = (rawText: string): string => {
  return rawText.replace(/<写真系统状态>[\s\S]*?<\/写真系统状态>/g, '').trim();
};

/**
 * 构建写真约拍 NSFW 运行时参数（供主剧情请求使用）
 */
export const 构建写真NSFW参数 = (state: {
  写真系统?: 写真系统扩展;
  gameConfig?: {
    写真NSFW设置?: 写真NSFW设置;
  };
  角色?: {
    出身背景?: {
      名称?: string;
    };
  };
  时代配置ID?: string;
}): {
  活跃拍摄项目?: 拍摄项目状态;
  模特数量?: number;
  摄影师数量?: number;
  泄露事件数量?: number;
  内容强度?: '微暗' | '暧昧' | '露骨';
  主要玩法层?: '经营管理' | '人际关系' | '灰色地带';
  启用道德选择?: boolean;
} | undefined => {
  // 检查时代配置 - 必须是 contemporary_ 开头的现代纪元
  const 时代ID = state.时代配置ID || '';
  if (!时代ID.startsWith('contemporary_')) {
    return undefined;
  }

  // 检查子系统开关
  const nsfw设置 = state.gameConfig?.写真NSFW设置;
  if (!nsfw设置?.启用写真NSFW系统) {
    return undefined;
  }

  // 检查写真系统是否存在
  const 写真系统 = state.写真系统;
  if (!写真系统) {
    return undefined;
  }

  // 获取活跃拍摄项目
  const 进行中项目 = 写真系统.进行中的拍摄项目;
  const 活跃项目 = 进行中项目 && 进行中项目.length > 0 
    ? 进行中项目[进行中项目.length - 1] 
    : undefined;

  // 统计数量
  const 模特数量 = 写真系统.模特档案 ? Object.keys(写真系统.模特档案).length : 0;
  const 摄影师数量 = 写真系统.摄影师档案 ? Object.keys(写真系统.摄影师档案).length : 0;
  const 泄露事件数量 = 写真系统.泄露事件列表?.length || 0;

  return {
    活跃拍摄项目: 活跃项目,
    模特数量,
    摄影师数量,
    泄露事件数量,
    内容强度: nsfw设置.NSFW内容强度,
    主要玩法层: nsfw设置.主要玩法层,
    启用道德选择: nsfw设置.启用道德选择,
  };
};
