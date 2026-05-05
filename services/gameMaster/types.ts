/**
 * Multi-Agent Game Master System Types
 * 多智能体游戏主持人系统类型定义
 */

/**
 * 导演角色类型
 */
export type DirectorRole = 'narrative' | 'combat' | 'judge' | 'atmosphere' | 'economy';

/**
 * 游戏状态（游戏主持人内部使用）
 */
export interface GameMasterGameState {
  游戏时间?: string;
  时代?: string;
  天气?: string;
  当前事件?: string[];
  伏笔列表?: string[];
  [key: string]: unknown;
}

/**
 * 角色状态（游戏主持人内部使用）
 */
export interface GameMasterCharacterState {
  姓名?: string;
  境界?: string;
  生命值?: number;
  最大生命值?: number;
  内力值?: number;
  最大内力值?: number;
  攻击力?: number;
  防御力?: number;
  技能等级?: number;
  技能列表?: string[];
  [key: string]: unknown;
}

/**
 * 场景状态（游戏主持人内部使用）
 */
export interface GameMasterSceneState {
  场景名称?: string;
  场景类型?: string;
  地点?: string;
  NPC列表?: Array<{ 姓名: string; 关系?: number }>;
  战斗中?: boolean;
  战斗数据?: { 回合?: number };
  判定数据?: { 类型?: string; 难度?: number; 修正?: number };
  敌人列表?: Array<{
    name: string;
    attack: number;
    defense: number;
    hp: number;
    maxHp: number;
    mp: number;
    skills: string[];
  }>;
  [key: string]: unknown;
}

/**
 * 游戏事件结构
 */
export interface GameMasterEvent {
  id: string;
  类型?: string;
  描述?: string;
  时间戳?: number;
  [key: string]: unknown;
}

/**
 * 导演上下文 - 包含智能体决策所需的所有信息
 */
export interface DirectorContext {
  /** 当前导演角色 */
  role: DirectorRole;
  /** 游戏全局状态 */
  gameState: GameMasterGameState;
  /** 角色状态 */
  characterState: GameMasterCharacterState;
  /** 当前场景状态 */
  currentScene: GameMasterSceneState;
  /** 额外上下文数据 */
  extraContext?: Record<string, unknown>;
}

/**
 * 导演决策 - 单个智能体的输出
 */
export interface DirectorDecision {
  /** 决策角色 */
  role: DirectorRole;
  /** 核心决策描述 */
  decision: string;
  /** 触发的事件列表 */
  events: GameMasterEvent[];
  /** 决策产生的变量更新 */
  variables: Record<string, unknown>;
  /** 决策置信度 0-1 */
  confidence?: number;
  /** 决策理由 */
  reasoning?: string;
}

/**
 * 游戏主持人请求类型
 */
export type GameMasterRequestType = 
  | 'narrative'   // 叙事请求
  | 'combat'      // 战斗请求
  | 'judge'       // 判定请求
  | 'atmosphere'  // 氛围请求
  | 'economy'     // 经济请求
  | 'full';       // 完整请求（所有智能体）

/**
 * 游戏主持人请求
 */
export interface GameMasterRequest {
  /** 请求类型 */
  type: GameMasterRequestType;
  /** 导演上下文 */
  context: Omit<DirectorContext, 'role'>;
  /** 用户输入 */
  userInput?: string;
  /** 是否并行处理 */
  parallel?: boolean;
}

/**
 * 游戏主持人响应
 */
export interface GameMasterResponse {
  /** 所有导演的决策 */
  decisions: DirectorDecision[];
  /** 融合后的最终输出 */
  finalOutput: string;
  /** 触发的事件列表 */
  events: GameMasterEvent[];
  /** 更新的变量 */
  variables: Record<string, unknown>;
  /** 处理耗时(ms) */
  processingTime?: number;
}

/**
 * 智能体基类接口
 */
export interface IDirector {
  /** 获取角色 */
  getRole(): DirectorRole;
  /** 分析上下文并做出决策 */
  analyze(context: DirectorContext): Promise<DirectorDecision>;
  /** 获取角色提示词 */
  getSystemPrompt(): string;
}

/**
 * 调度器配置
 */
export interface DispatcherConfig {
  /** 最大并行数 */
  maxParallel: number;
  /** 超时时间(ms) */
  timeout: number;
  /** 启用缓存 */
  enableCache: boolean;
}

/**
 * 协调器配置
 */
export interface CoordinatorConfig {
  /** 融合策略 */
  fusionStrategy: 'priority' | 'consensus' | 'weighted';
  /** 优先级权重 */
  roleWeights: Record<DirectorRole, number>;
}

/**
 * 叙事决策扩展
 */
export interface NarrativeDecision extends DirectorDecision {
  /** 章节进度 */
  chapterProgress?: number;
  /** 伏笔列表 */
  foreshadowing?: string[];
  /** 支线触发 */
  sideQuests?: string[];
}

/**
 * 战斗决策扩展
 */
export interface CombatDecision extends DirectorDecision {
  /** 伤害值 */
  damage?: number;
  /** 技能效果 */
  skillEffects?: string[];
  /** 战斗阶段 */
  combatPhase?: 'initiation' | 'action' | 'counter' | 'resolution';
}

/**
 * 判定决策扩展
 */
export interface JudgeDecision extends DirectorDecision {
  /** 判定结果 */
  result?: 'success' | 'failure' | 'critical';
  /** 判定值 */
  roll?: number;
  /** 难度等级 */
  difficulty?: number;
}

/**
 * 氛围决策扩展
 */
export interface AtmosphereDecision extends DirectorDecision {
  /** 氛围标签 */
  atmosphereTags?: string[];
  /** 情感倾向 */
  emotionalTone?: 'tense' | 'peaceful' | 'mysterious' | 'exciting' | 'romantic';
  /** 场景描写增强 */
  sceneEnhancement?: string;
}

/**
 * 经济决策扩展
 */
export interface EconomyDecision extends DirectorDecision {
  /** 物品掉落 */
  drops?: Array<{ itemId: string; quantity: number; rarity: string }>;
  /** 价格浮动 */
  priceChanges?: Array<{ itemId: string; priceChange: number }>;
  /** 资源变化 */
  resourceChanges?: Record<string, number>;
}

/**
 * 默认配置
 */
export const DEFAULT_DISPATCHER_CONFIG: DispatcherConfig = {
  maxParallel: 5,
  timeout: 30000,
  enableCache: true,
};

export const DEFAULT_COORDINATOR_CONFIG: CoordinatorConfig = {
  fusionStrategy: 'priority',
  roleWeights: {
    narrative: 1.0,
    combat: 0.9,
    judge: 0.8,
    atmosphere: 0.7,
    economy: 0.6,
  },
};
