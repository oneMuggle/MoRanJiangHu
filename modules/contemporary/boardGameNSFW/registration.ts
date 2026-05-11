// 桌游社交 NSFW 模块注册

import type { StoryModule, 游戏状态快照 } from '../../../utils/storyModule/types';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { 桌游社交NSFW设置 } from '../../../models/boardGameNSFW';
import { 默认桌游社交NSFW设置, 规范化桌游社交NSFW设置 } from '../../../models/boardGameNSFW';
import { 构建桌游NSFW完整叙事约束 } from '../../../prompts/runtime/boardGameNSFW';

// ==================== 运行时参数 ====================

interface 桌游运行时参数 {
  桌游类型: string;
  密室主题: string;
  紧张度: number;
  参与NPC摘要: string;
  NSFW强度: '关闭' | '轻度' | '中度' | '深度';
  启用桌游多人局: boolean;
  启用桌游邀请系统: boolean;
  启用桌游成就系统: boolean;
}

// ==================== 参数提取 ====================

function 提取桌游参数(
  _gameState: 游戏状态快照,
  settings: 桌游社交NSFW设置
): 桌游运行时参数 | null {
  return {
    桌游类型: '',
    密室主题: '',
    紧张度: 0,
    参与NPC摘要: '等待桌游事件触发',
    NSFW强度: settings.桌游社交NSFW强度,
    启用桌游多人局: settings.启用桌游多人局,
    启用桌游邀请系统: settings.启用桌游邀请系统,
    启用桌游成就系统: settings.启用桌游成就系统,
  };
}

// ==================== 提示词构建 ====================

function 构建桌游NSFW叙事约束(params: 桌游运行时参数): string {
  const 约束参数: Parameters<typeof 构建桌游NSFW完整叙事约束>[0] = {};

  if (params.桌游类型) {
    约束参数.桌游类型 = params.桌游类型 as any;
    if (params.密室主题) {
      约束参数.密室主题 = params.密室主题 as any;
    }
    约束参数.紧张度 = params.紧张度;
    if (params.参与NPC摘要 !== '等待桌游事件触发') {
      约束参数.参与NPC摘要 = params.参与NPC摘要;
    }
  }

  return 构建桌游NSFW完整叙事约束(约束参数);
}

// ==================== 模块注册 ====================

const 桌游社交NSFW模块: StoryModule<桌游社交NSFW设置, 桌游运行时参数> = {
  id: 'boardGameNSFW',
  name: '桌游社交NSFW',
  eraId: 'contemporary',
  version: '1.0.0',
  priority: 70,
  category: 'nsfw',
  description: '全时代可用 桌游社交 NSFW 系统：密室逃脱、狼人杀、剧本杀、真心话大冒险、国王游戏、大富翁、棋牌游戏、骰子游戏',
  masterToggleKey: '启用桌游社交NSFW系统',
  dependencies: [],
  defaultSettings: 默认桌游社交NSFW设置,
  normalizeSettings: (raw) => 规范化桌游社交NSFW设置(raw as Partial<桌游社交NSFW设置>),
  extractPromptParams: 提取桌游参数,
  buildPromptFragment: (params) => 构建桌游NSFW叙事约束(params),
  responseTag: '桌游系统状态',
};

故事模块注册表.注册模块(桌游社交NSFW模块);
