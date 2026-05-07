// 写真约拍 NSFW 模块注册

import type { StoryModule, 游戏状态快照 } from '../../../utils/storyModule/types';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { 写真NSFW设置 } from '../../../models/photographyNSFW';
import { 默认写真NSFW设置 } from '../../../models/photographyNSFW';
import { 规范化写真NSFW设置 } from '../../../models/photographyNSFW/normalization';
import type { 玩法层类型 } from '../../../models/photographyNSFW';
import { 构建写真NSFW完整叙事约束 } from '../../../prompts/runtime/photographyNSFW';

// ==================== 运行时参数 ====================

interface 写真运行时参数 {
  进行中的项目摘要: string;
  模特状态摘要: string;
  摄影师口碑摘要: string;
  泄露事件摘要: string;
  主要玩法层: 玩法层类型;
  NSFW内容强度: '微暗' | '暧昧' | '露骨';
  启用尺度递进: boolean;
  启用越界识别: boolean;
  启用安全词系统: boolean;
  启用照片交付: boolean;
  启用泄露事件: boolean;
  泄露事件频率: '低' | '中' | '高';
  启用道德选择: boolean;
}

// ==================== 参数提取 ====================

function 提取写真参数(
  gameState: 游戏状态快照,
  settings: 写真NSFW设置
): 写真运行时参数 | null {
  const 写真系统 = gameState.写真系统 as Record<string, unknown> | undefined;
  if (!写真系统) return null;

  const 模特档案 = 写真系统.模特档案 as Record<string, any> | undefined;
  const 摄影师档案 = 写真系统.摄影师档案 as Record<string, any> | undefined;
  const 进行中的拍摄项目 = 写真系统.进行中的拍摄项目 as any[] | undefined;
  const 泄露事件列表 = 写真系统.泄露事件列表 as any[] | undefined;

  const 有活跃内容 = (
    (模特档案 && Object.keys(模特档案).length > 0) ||
    (进行中的拍摄项目 && 进行中的拍摄项目.length > 0) ||
    (泄露事件列表 && 泄露事件列表.length > 0)
  );
  if (!有活跃内容) return null;

  const 模特摘要条目: string[] = [];
  if (模特档案) {
    for (const [id, m] of Object.entries(模特档案)) {
      const 模特 = m as any;
      模特摘要条目.push(
        `${模特.姓名 || id}: 底线=${模特.当前底线} 安全感=${模特.安全感} ` +
        `信任=${模特.信任度} 拍摄=${模特.拍摄总次数}次`
      );
    }
  }

  const 项目摘要条目: string[] = [];
  if (进行中的拍摄项目) {
    for (const p of 进行中的拍摄项目) {
      项目摘要条目.push(
        `项目${p.id}: 场所=${p.实际场所} 尺度=${p.实际尺度} ` +
        `阶段=${p.拍摄阶段} 回合=${p.当前回合}/${p.最大回合} ` +
        `泄露风险=${p.泄露风险评分}`
      );
    }
  }

  const 摄影师摘要条目: string[] = [];
  if (摄影师档案) {
    for (const [id, p] of Object.entries(摄影师档案)) {
      const 摄 = p as any;
      摄影师摘要条目.push(
        `${摄.姓名 || id}: 口碑=${摄.口碑评分} 信誉=${摄.信誉} ` +
        `越界倾向=${摄.越界倾向}`
      );
    }
  }

  const 泄露摘要条目: string[] = [];
  if (泄露事件列表) {
    for (const e of 泄露事件列表) {
      if (e.状态 === '活跃' || e.状态 === '已发酵') {
        泄露摘要条目.push(
          `泄露事件${e.id}: 类型=${e.泄露类型} 传播=${e.传播范围} ` +
          `心理影响=${e.心理影响} 状态=${e.状态}`
        );
      }
    }
  }

  return {
    进行中的项目摘要: 项目摘要条目.length > 0 ? 项目摘要条目.join('；') : '无进行中项目',
    模特状态摘要: 模特摘要条目.length > 0 ? 模特摘要条目.join('；') : '无活跃模特',
    摄影师口碑摘要: 摄影师摘要条目.length > 0 ? 摄影师摘要条目.join('；') : '无活跃摄影师',
    泄露事件摘要: 泄露摘要条目.length > 0 ? 泄露摘要条目.join('；') : '无活跃泄露事件',
    主要玩法层: settings.主要玩法层,
    NSFW内容强度: settings.NSFW内容强度,
    启用尺度递进: settings.启用尺度递进,
    启用越界识别: settings.启用越界识别,
    启用安全词系统: settings.启用安全词系统,
    启用照片交付: settings.启用照片交付,
    启用泄露事件: settings.启用泄露事件,
    泄露事件频率: settings.泄露事件频率,
    启用道德选择: settings.启用道德选择,
  };
}

// ==================== 提示词构建 ====================

function 构建写真NSFW叙事约束(params: 写真运行时参数): string {
  return 构建写真NSFW完整叙事约束({
    内容强度: params.NSFW内容强度,
    主要玩法层: params.主要玩法层,
    启用尺度递进: params.启用尺度递进,
    启用越界识别: params.启用越界识别,
    启用安全词系统: params.启用安全词系统,
    启用照片交付: params.启用照片交付,
    启用泄露事件: params.启用泄露事件,
    泄露事件频率: params.泄露事件频率,
    启用道德选择: params.启用道德选择,
    活跃泄露事件摘要: params.泄露事件摘要 !== '无活跃泄露事件' ? params.泄露事件摘要 : undefined,
  });
}

// ==================== 模块注册 ====================

const 写真NSFW模块: StoryModule<写真NSFW设置, 写真运行时参数> = {
  id: 'photographyNSFW',
  name: '写真约拍NSFW',
  eraId: 'contemporary_urban',
  version: '1.0.0',
  priority: 80,
  category: 'nsfw',
  description: '现代纪元写真约拍NSFW系统：尺度递进、越界识别、照片交付、泄露事件、模特保护机制',
  masterToggleKey: '启用写真NSFW系统',
  dependencies: [],
  defaultSettings: 默认写真NSFW设置,
  normalizeSettings: (raw) => 规范化写真NSFW设置(raw as Partial<写真NSFW设置>),
  extractPromptParams: 提取写真参数,
  buildPromptFragment: (params) => 构建写真NSFW叙事约束(params),
  responseTag: '写真系统状态',
};

故事模块注册表.注册模块(写真NSFW模块);
