// 故事模块管理系统 — 统一导出

export type { StoryModule, 游戏状态快照 } from './types';
export { 故事模块注册表 } from './registry';
export type { 模块运行时上下文 } from './orchestrator';
export {
  初始化模块编排,
  提取模块参数,
  构建故事模块提示词,
} from './orchestrator';
