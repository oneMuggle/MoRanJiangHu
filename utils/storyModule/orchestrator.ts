// 模块编排器 — 运行时初始化、参数提取、提示词组装

import type { StoryModule, 游戏状态快照 } from './types';
import { 故事模块注册表 } from './registry';

/** 模块运行时上下文 */
export interface 模块运行时上下文 {
  /** 活跃模块列表（按优先级排序） */
  activeModules: StoryModule[];
  /** 各模块的已规范化设置 */
  moduleSettings: Map<string, Record<string, unknown>>;
  /** 各模块的运行时参数 */
  moduleParams: Map<string, Record<string, unknown>>;
}

/**
 * 初始化模块编排器
 * 根据 eraId 和 gameConfig 确定活跃模块并收集设置
 */
export function 初始化模块编排(
  eraId: string,
  gameConfig: Record<string, unknown>
): 模块运行时上下文 {
  const activeModules = 故事模块注册表.获取活跃模块(eraId, gameConfig);

  // 过滤依赖不满足的模块
  const activeIds = new Set(activeModules.map(m => m.id));
  const satisfiedModules = activeModules.filter(m =>
    故事模块注册表.依赖是否满足(m.id, activeIds)
  );

  // 收集各模块的设置（从 gameConfig 中提取，缺失时用默认值填充）
  const moduleSettings = new Map<string, Record<string, unknown>>();
  for (const module of satisfiedModules) {
    const settingsKey = `${module.id}设置`;
    const rawSettings = gameConfig[settingsKey] as Record<string, unknown> | undefined;
    const settings = module.normalizeSettings(rawSettings ?? {});
    moduleSettings.set(module.id, settings as Record<string, unknown>);
  }

  return {
    activeModules: satisfiedModules,
    moduleSettings,
    moduleParams: new Map(),
  };
}

/**
 * 提取所有活跃模块的运行时参数
 * 应在每次发送主剧情前调用
 */
export function 提取模块参数(
  context: 模块运行时上下文,
  gameState: 游戏状态快照
): void {
  for (const module of context.activeModules) {
    const settings = context.moduleSettings.get(module.id);
    if (!settings) continue;

    const params = module.extractPromptParams(gameState, settings);
    if (params !== null) {
      context.moduleParams.set(module.id, params as Record<string, unknown>);
    }
  }
}

/**
 * 构建所有活跃模块的提示词
 * 返回拼接后的完整提示词字符串
 */
export function 构建故事模块提示词(
  context: 模块运行时上下文
): string {
  const fragments: string[] = [];

  for (const module of context.activeModules) {
    const settings = context.moduleSettings.get(module.id);
    if (!settings) continue;

    const params = context.moduleParams.get(module.id);
    if (!params) continue;

    const fragment = module.buildPromptFragment(params, settings);
    if (!fragment) continue;

    fragments.push(
      `<!-- PROMPT_MODULE:${module.id}:START -->\n` +
      fragment +
      `\n<!-- PROMPT_MODULE:${module.id}:END -->`
    );
  }

  return fragments.join('\n\n');
}
