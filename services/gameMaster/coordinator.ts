/**
 * Game Master Coordinator - 结果协调器
 * 负责汇聚多个导演的决策并生成最终输出
 */

import type {
  DirectorDecision,
  DirectorRole,
  GameMasterResponse,
  CoordinatorConfig,
  DEFAULT_COORDINATOR_CONFIG,
  GameEvent,
} from './types';
import { 协调器_融合提示 } from './prompts/rolePrompts';

/**
 * 游戏主持人协调器
 * 负责汇聚各导演决策并生成最终输出
 */
export class GameMasterCoordinator {
  /** 配置 */
  private config: CoordinatorConfig;

  /** 角色优先级 */
  private rolePriority: Record<DirectorRole, number> = {
    narrative: 1,    // 叙事最高
    combat: 2,       // 战斗次之
    judge: 3,        // 判定第三
    atmosphere: 4,   // 氛围第四
    economy: 5,       // 经济最低
  };

  constructor(config: Partial<CoordinatorConfig> = {}) {
    this.config = { ...DEFAULT_COORDINATOR_CONFIG, ...config };
  }

  /**
   * 协调多个导演决策
   */
  coordinate(decisions: DirectorDecision[], userInput?: string): GameMasterResponse {
    const startTime = Date.now();

    // 排序决策（按优先级）
    const sortedDecisions = this.sortByPriority(decisions);

    // 合并事件
    const allEvents = this.mergeEvents(sortedDecisions);

    // 合并变量
    const mergedVariables = this.mergeVariables(sortedDecisions);

    // 生成最终输出
    const finalOutput = this.generateFinalOutput(sortedDecisions, userInput);

    // 计算处理时间
    const processingTime = Date.now() - startTime;

    return {
      decisions: sortedDecisions,
      finalOutput,
      events: allEvents,
      variables: mergedVariables,
      processingTime,
    };
  }

  /**
   * 按优先级排序决策
   */
  private sortByPriority(decisions: DirectorDecision[]): DirectorDecision[] {
    return [...decisions].sort((a, b) => {
      const priorityA = this.rolePriority[a.role] ?? 999;
      const priorityB = this.rolePriority[b.role] ?? 999;
      return priorityA - priorityB;
    });
  }

  /**
   * 合并所有事件
   */
  private mergeEvents(decisions: DirectorDecision[]): GameEvent[] {
    const eventMap = new Map<string, GameEvent>();

    for (const decision of decisions) {
      for (const event of decision.events) {
        // 去重，基于事件描述
        const key = event.描述 || event.id;
        if (!eventMap.has(key)) {
          eventMap.set(key, event);
        }
      }
    }

    return Array.from(eventMap.values());
  }

  /**
   * 合并所有变量
   */
  private mergeVariables(decisions: DirectorDecision[]): Record<string, unknown> {
    const merged: Record<string, unknown> = {};

    for (const decision of decisions) {
      Object.assign(merged, decision.variables);
    }

    return merged;
  }

  /**
   * 生成最终输出
   */
  private generateFinalOutput(
    decisions: DirectorDecision[],
    userInput?: string
  ): string {
    const sections: string[] = [];

    // 用户输入（如果有）
    if (userInput) {
      sections.push(`【玩家】${userInput}`);
    }

    // 叙事决策（最重要）
    const narrativeDecision = decisions.find(d => d.role === 'narrative');
    if (narrativeDecision) {
      sections.push(`【叙事】${narrativeDecision.decision}`);
      if (narrativeDecision.reasoning) {
        sections.push(`  → ${narrativeDecision.reasoning}`);
      }
    }

    // 战斗决策
    const combatDecision = decisions.find(d => d.role === 'combat');
    if (combatDecision) {
      sections.push(`【战斗】${combatDecision.decision}`);
      if ((combatDecision as any).damage) {
        sections.push(`  → 伤害：${(combatDecision as any).damage}`);
      }
    }

    // 判定决策
    const judgeDecision = decisions.find(d => d.role === 'judge');
    if (judgeDecision) {
      sections.push(`【判定】${judgeDecision.decision}`);
      if (judgeDecision.reasoning) {
        sections.push(`  → ${judgeDecision.reasoning}`);
      }
    }

    // 氛围决策
    const atmosphereDecision = decisions.find(d => d.role === 'atmosphere');
    if (atmosphereDecision) {
      const atmosphereDesc = (atmosphereDecision as any).sceneEnhancement;
      if (atmosphereDesc) {
        sections.push(`【氛围】${atmosphereDesc}`);
      }
    }

    // 经济决策
    const economyDecision = decisions.find(d => d.role === 'economy');
    if (economyDecision) {
      if (economyDecision.events.length > 0) {
        sections.push(`【经济】${economyDecision.events.map(e => e.描述 || e.id).join('、')}`);
      }
    }

    // 触发事件
    const allEvents = this.mergeEvents(decisions);
    if (allEvents.length > 0) {
      const eventDescriptions = allEvents
        .map(e => e.描述 || e.id)
        .filter(Boolean)
        .join('；');
      if (eventDescriptions) {
        sections.push(`【事件】${eventDescriptions}`);
      }
    }

    return sections.join('\n');
  }

  /**
   * 根据融合策略处理冲突
   */
  private resolveConflict(
    decisions: DirectorDecision[],
    strategy: CoordinatorConfig['fusionStrategy']
  ): DirectorDecision[] {
    switch (strategy) {
      case 'priority':
        return this.resolveByPriority(decisions);
      case 'consensus':
        return this.resolveByConsensus(decisions);
      case 'weighted':
        return this.resolveByWeight(decisions);
      default:
        return decisions;
    }
  }

  /**
   * 按优先级解决冲突
   */
  private resolveByPriority(decisions: DirectorDecision[]): DirectorDecision[] {
    const grouped = new Map<DirectorRole, DirectorDecision>();

    for (const decision of decisions) {
      const existing = grouped.get(decision.role);
      if (!existing || (decision.confidence || 0) > (existing.confidence || 0)) {
        grouped.set(decision.role, decision);
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * 按共识解决冲突
   */
  private resolveByConsensus(decisions: DirectorDecision[]): DirectorDecision[] {
    // 简化实现：使用置信度作为共识指标
    return decisions.filter(d => (d.confidence || 0) >= 0.7);
  }

  /**
   * 按权重解决冲突
   */
  private resolveByWeight(decisions: DirectorDecision[]): DirectorDecision[] {
    const weighted = decisions.map(d => ({
      decision: d,
      weight: (d.confidence || 0) * (this.config.roleWeights[d.role] || 0),
    }));

    weighted.sort((a, b) => b.weight - a.weight);

    return weighted.map(w => w.decision);
  }

  /**
   * 获取协调统计
   */
  getStats(decisions: DirectorDecision[]): {
    roleCount: number;
    totalEvents: number;
    totalVariables: number;
    avgConfidence: number;
  } {
    const totalEvents = decisions.reduce((sum, d) => sum + d.events.length, 0);
    const totalVariables = decisions.reduce(
      (sum, d) => sum + Object.keys(d.variables).length,
      0
    );
    const avgConfidence =
      decisions.length > 0
        ? decisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / decisions.length
        : 0;

    return {
      roleCount: decisions.length,
      totalEvents,
      totalVariables,
      avgConfidence,
    };
  }
}
