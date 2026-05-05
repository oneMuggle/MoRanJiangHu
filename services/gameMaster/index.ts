/**
 * Multi-Agent Game Master System
 * 多智能体游戏主持人系统
 * 
 * 提供多角色智能体架构，用于分散游戏决策逻辑
 * - NarrativeDirector: 叙事导演 - 控制故事节奏
 * - CombatDirector: 战斗导演 - 处理战斗判定
 * - JudgeDirector: 判定导演 - 随机事件判定
 * - AtmosphereDirector: 氛围导演 - 控制情感氛围
 * - EconomyDirector: 经济导演 - 管理物品经济
 */

export * from './types';
export * from './dispatcher';
export * from './coordinator';
export * from './agents/NarrativeDirector';
export * from './agents/CombatDirector';
export * from './agents/JudgeDirector';
export * from './agents/AtmosphereDirector';
export * from './agents/EconomyDirector';

import { DirectorDispatcher } from './dispatcher';
import { GameMasterCoordinator } from './coordinator';
import { NarrativeDirector } from './agents/NarrativeDirector';
import { CombatDirector } from './agents/CombatDirector';
import { JudgeDirector } from './agents/JudgeDirector';
import { AtmosphereDirector } from './agents/AtmosphereDirector';
import { EconomyDirector } from './agents/EconomyDirector';
import type { 
  GameMasterRequest, 
  GameMasterResponse,
  DirectorContext,
  DEFAULT_DISPATCHER_CONFIG,
  DEFAULT_COORDINATOR_CONFIG,
} from './types';

/**
 * 创建游戏主持人实例
 */
export function createGameMaster(): GameMaster {
  return new GameMaster();
}

/**
 * 游戏主持人主类
 */
export class GameMaster {
  private dispatcher: DirectorDispatcher;
  private coordinator: GameMasterCoordinator;

  constructor() {
    // 创建所有导演
    const directors = [
      new NarrativeDirector(),
      new CombatDirector(),
      new JudgeDirector(),
      new AtmosphereDirector(),
      new EconomyDirector(),
    ];

    // 初始化调度器和协调器
    this.dispatcher = new DirectorDispatcher(directors);
    this.coordinator = new GameMasterCoordinator();
  }

  /**
   * 处理游戏主持人请求
   */
  async process(request: GameMasterRequest): Promise<GameMasterResponse> {
    // 调度到相关导演
    const decisions = await this.dispatcher.dispatch(request);

    // 协调决策
    const response = this.coordinator.coordinate(decisions, request.userInput);

    return response;
  }

  /**
   * 快捷方法：处理叙事请求
   */
  async processNarrative(context: Omit<DirectorContext, 'role'>): Promise<GameMasterResponse> {
    return this.process({
      type: 'narrative',
      context,
    });
  }

  /**
   * 快捷方法：处理战斗请求
   */
  async processCombat(context: Omit<DirectorContext, 'role'>): Promise<GameMasterResponse> {
    return this.process({
      type: 'combat',
      context,
    });
  }

  /**
   * 快捷方法：处理判定请求
   */
  async processJudge(context: Omit<DirectorContext, 'role'>): Promise<GameMasterResponse> {
    return this.process({
      type: 'judge',
      context,
    });
  }

  /**
   * 快捷方法：处理氛围请求
   */
  async processAtmosphere(context: Omit<DirectorContext, 'role'>): Promise<GameMasterResponse> {
    return this.process({
      type: 'atmosphere',
      context,
    });
  }

  /**
   * 快捷方法：处理经济请求
   */
  async processEconomy(context: Omit<DirectorContext, 'role'>): Promise<GameMasterResponse> {
    return this.process({
      type: 'economy',
      context,
    });
  }

  /**
   * 获取调度统计
   */
  getDispatcherStats() {
    return this.dispatcher.getStats();
  }

  /**
   * 清空缓存
   */
  clearCache() {
    this.dispatcher.clearCache();
  }
}

/**
 * 默认游戏主持人实例（单例）
 */
let defaultGameMaster: GameMaster | null = null;

export function getGameMaster(): GameMaster {
  if (!defaultGameMaster) {
    defaultGameMaster = createGameMaster();
  }
  return defaultGameMaster;
}
