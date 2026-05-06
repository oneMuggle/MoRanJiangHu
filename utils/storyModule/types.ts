// 故事模块通用接口定义

/** 游戏状态快照：extractPromptParams 需要的上下文 */
export interface 游戏状态快照 {
  eraId: string;
  角色: Record<string, unknown>;
  环境: Record<string, unknown>;
  社交: Record<string, unknown>;
  世界?: Record<string, unknown>;
  校园系统?: Record<string, unknown>;
  都市网约车系统?: Record<string, unknown>;
  // 随模块扩展
  [key: string]: unknown;
}

/**
 * 故事模块通用接口
 * @param Settings - 模块设置类型（如 校园NSFW设置）
 * @param PromptParams - 传递给提示词的运行时参数类型
 */
export interface StoryModule<
  Settings = Record<string, unknown>,
  PromptParams = Record<string, unknown>
> {
  /** 模块唯一标识，如 'campus_nsfw'、'photography_nsfw' */
  id: string;

  /** 模块显示名称，如 '校园NSFW' */
  name: string;

  /** 所属时代 ID，如 'contemporary_urban' */
  eraId: string;

  /** 语义化版本 */
  version: string;

  /** 优先级（数字越大越先处理），用于提示词组装顺序 */
  priority: number;

  /** 模块分类 */
  category: 'nsfw' | 'gameplay' | 'narrative' | 'social';

  /** 简短描述 */
  description: string;

  /** 主开关在 gameConfig 中的键名，如 '启用校园NSFW系统' */
  masterToggleKey: string;

  /** 依赖的其他模块 ID（为空表示无依赖） */
  dependencies: string[];

  /** 设置类型的默认值 */
  defaultSettings: Settings;

  /**
   * 规范化设置：处理用户输入的类型转换和校验
   */
  normalizeSettings: (raw: Partial<Settings>) => Settings;

  /**
   * 从游戏运行时状态中提取本模块的提示词参数
   * @returns 运行时参数，为 null 时该模块本轮不贡献提示词
   */
  extractPromptParams: (
    gameState: 游戏状态快照,
    settings: Settings
  ) => PromptParams | null;

  /**
   * 构建本模块的提示词片段
   */
  buildPromptFragment: (
    params: PromptParams,
    settings: Settings
  ) => string;

  /**
   * 可选：AI 响应中的状态更新标签，如 '欲望系统状态'、'写真系统状态'
   */
  responseTag?: string;

  /**
   * 可选：解析 AI 响应中的状态更新
   */
  parseStateUpdate?: (rawText: string) => Record<string, unknown> | null;
}
