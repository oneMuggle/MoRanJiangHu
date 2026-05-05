/**
 * Base Director - Abstract base class for all game master directors
 * 所有游戏主持人导演的抽象基类
 */

import type { 
  DirectorContext, 
  DirectorDecision, 
  IDirector, 
  DirectorRole 
} from '../types';

/**
 * 导演基类 - 所有具体导演的父类
 * 定义通用接口和工具方法
 */
export abstract class BaseDirector implements IDirector {
  /** 导演角色 */
  protected role: DirectorRole;
  /** 系统提示词 */
  protected systemPrompt: string;
  /** 当前上下文 */
  protected currentContext?: DirectorContext;

  constructor(role: DirectorRole, systemPrompt: string) {
    this.role = role;
    this.systemPrompt = systemPrompt;
  }

  /**
   * 获取角色
   */
  getRole(): DirectorRole {
    return this.role;
  }

  /**
   * 获取系统提示词
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /**
   * 分析上下文并做出决策 - 子类必须实现
   */
  abstract analyze(context: DirectorContext): Promise<DirectorDecision>;

  /**
   * 构建完整的提示词
   */
  protected buildPrompt(context: DirectorContext): string {
    return `${this.systemPrompt}

${this.getContextPrompt(context)}
`;
  }

  /**
   * 获取上下文提示词 - 子类可重写
   */
  protected getContextPrompt(context: DirectorContext): string {
    return `当前游戏状态：
- 游戏时间：${context.gameState.游戏时间 || '未知'}
- 所在地点：${context.currentScene.地点 || '未知'}
- 当前时代：${context.gameState.时代 || '武侠'}

玩家角色状态：
- 姓名：${context.characterState.姓名 || '未知'}
- 境界：${context.characterState.境界 || '未知'}
- 生命值：${context.characterState.生命值 || 0}/${context.characterState.最大生命值 || 0}
- 内力值：${context.characterState.内力值 || 0}/${context.characterState.最大内力值 || 0}

当前场景：${context.currentScene.场景名称 || '未知'}
场景类型：${context.currentScene.场景类型 || '未知'}
在场NPC：${this.formatNPCs(context.currentScene.NPC列表)}
`;
  }

  /**
   * 格式化NPC列表
   */
  protected formatNPCs(npcs?: Array<{ 姓名: string; 关系?: number }>): string {
    if (!npcs || npcs.length === 0) return '无';
    return npcs.map(npc => `${npc.姓名}(关系:${npc.关系 || 0})`).join(', ');
  }

  /**
   * 创建基础决策对象
   */
  protected createBaseDecision(
    decision: string,
    events: string[] = [],
    variables: Record<string, unknown> = {},
    confidence: number = 0.8,
    reasoning: string = ''
  ): DirectorDecision {
    return {
      role: this.role,
      decision,
      events: events.map(event => this.createGameEvent(event)),
      variables,
      confidence,
      reasoning: reasoning || this.getDefaultReasoning(),
    };
  }

  /**
   * 创建游戏事件
   */
  protected createGameEvent(eventDesc: string) {
    return {
      id: `${this.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      类型: this.role as any,
      描述: eventDesc,
      时间戳: Date.now(),
    };
  }

  /**
   * 获取默认决策理由
   */
  protected getDefaultReasoning(): string {
    const reasonings: Record<DirectorRole, string> = {
      narrative: '基于当前剧情发展和叙事节奏考虑',
      combat: '基于战斗规则和双方属性计算',
      judge: '基于随机判定和游戏平衡',
      atmosphere: '基于当前场景氛围和情感需求',
      economy: '基于经济系统和资源平衡',
    };
    return reasonings[this.role];
  }

  /**
   * 验证上下文完整性
   */
  protected validateContext(context: DirectorContext): boolean {
    return !!(
      context.gameState &&
      context.characterState &&
      context.currentScene &&
      context.role === this.role
    );
  }
}
