/**
 * Judge Director - 判定导演
 * 负责随机事件判定、NPC行为决策
 */

import { BaseDirector } from './BaseDirector';
import type { DirectorContext, JudgeDecision } from '../types';
import { 判定导演_角色提示 } from '../prompts/directorCore';
import { 判定导演_提示词 } from '../prompts/rolePrompts';

/**
 * 判定导演
 * 负责随机判定、NPC行为决策、事件触发
 */
export class JudgeDirector extends BaseDirector {
  constructor() {
    super('judge', 判定导演_角色提示);
  }

  /**
   * 分析上下文并做出判定决策
   */
  async analyze(context: DirectorContext): Promise<JudgeDecision> {
    if (!this.validateContext(context)) {
      return this.createDefaultDecision();
    }

    const { gameState, characterState, currentScene } = context;

    // 获取判定信息
    const judgeInfo = this.getJudgeInfo(gameState, currentScene);
    
    // 执行判定
    const rollResult = this.executeRoll(judgeInfo);
    
    // 生成判定决策
    const decision = this.generateJudgeDecision(rollResult, judgeInfo);

    return {
      ...this.createBaseDecision(
        decision.核心决策,
        decision.事件列表,
        decision.变量更新,
        decision.置信度,
        decision.理由
      ),
      result: decision.判定结果,
      roll: rollResult.roll,
      difficulty: judgeInfo.difficulty,
    } as JudgeDecision;
  }

  /**
   * 获取判定信息
   */
  private getJudgeInfo(
    gameState: DirectorContext['gameState'],
    currentScene: DirectorContext['currentScene']
  ): {
    judgeType: string;
    skillLevel: number;
    difficulty: number;
    modifier: number;
    consecutiveFails: number;
  } {
    // 从游戏状态或场景中获取判定信息
    const judgeData = (currentScene as any).判定数据 || {};
    
    return {
      judgeType: judgeData.类型 || 'encounter',
      skillLevel: (characterState as any).技能等级 || 50,
      difficulty: judgeData.难度 || 50,
      modifier: judgeData.修正 || 0,
      consecutiveFails: (gameState as any).连续失败次数 || 0,
    };
  }

  /**
   * 执行判定
   */
  private executeRoll(judgeInfo: ReturnType<typeof this.getJudgeInfo>): {
    roll: number;
    baseSuccessRate: number;
    finalSuccessRate: number;
    result: 'critical_success' | 'success' | 'failure' | 'critical_failure';
  } {
    const { skillLevel, difficulty, modifier, consecutiveFails } = judgeInfo;

    // 计算基础成功率 = (技能等级 - 难度) × 10 + 50
    let baseSuccessRate = (skillLevel - difficulty) * 10 + 50;
    
    // 加上修正值
    baseSuccessRate += modifier;
    
    // 连续失败加成（每次失败+10%）
    baseSuccessRate += consecutiveFails * 10;
    
    // 限制在 5% - 95%
    baseSuccessRate = Math.max(5, Math.min(95, baseSuccessRate));

    // 投掷1d100
    const roll = Math.floor(Math.random() * 100) + 1;

    // 判断结果
    let result: 'critical_success' | 'success' | 'failure' | 'critical_failure';
    
    if (roll <= baseSuccessRate * 0.3) {
      result = 'critical_success';
    } else if (roll <= baseSuccessRate) {
      result = 'success';
    } else if (roll >= baseSuccessRate * 1.7 || roll === 100) {
      result = 'critical_failure';
    } else {
      result = 'failure';
    }

    return {
      roll,
      baseSuccessRate,
      finalSuccessRate: baseSuccessRate,
      result,
    };
  }

  /**
   * 生成判定决策
   */
  private generateJudgeDecision(
    rollResult: ReturnType<typeof this.executeRoll>,
    judgeInfo: ReturnType<typeof this.getJudgeInfo>
  ): {
    核心决策: string;
    事件列表: string[];
    变量更新: Record<string, unknown>;
    置信度: number;
    理由: string;
    判定结果: 'success' | 'failure' | 'critical';
  } {
    const events: string[] = [];
    const variables: Record<string, unknown> = {};

    let coreDecision = '';
    let judgeResult: 'success' | 'failure' | 'critical' = 'failure';

    switch (rollResult.result) {
      case 'critical_success':
        coreDecision = '大成功！';
        judgeResult = 'critical';
        events.push('大成功！效果翻倍');
        variables.判定加成 = 2;
        variables.连续失败次数 = 0;
        variables.大成功触发 = true;
        break;

      case 'success':
        coreDecision = '成功';
        judgeResult = 'success';
        events.push('判定成功');
        variables.判定加成 = 1;
        variables.连续失败次数 = 0;
        break;

      case 'failure':
        coreDecision = '失败';
        judgeResult = 'failure';
        events.push('判定失败');
        variables.判定加成 = 0;
        variables.连续失败次数 = (judgeInfo.consecutiveFails || 0) + 1;
        break;

      case 'critical_failure':
        coreDecision = '大失败！';
        judgeResult = 'failure';
        events.push('大失败！产生负面影响');
        variables.判定加成 = -1;
        variables.连续失败次数 = 0;
        variables.大失败触发 = true;
        // 大失败可能触发意外事件
        events.push('意外发生！');
        break;
    }

    // 根据判定类型添加特定事件
    switch (judgeInfo.judgeType) {
      case 'encounter':
        if (rollResult.result === 'success' || rollResult.result === 'critical_success') {
          events.push('遭遇有利事件');
        } else {
          events.push('遭遇敌人');
          variables.敌人遭遇 = true;
        }
        break;

      case 'search':
        if (rollResult.result === 'success' || rollResult.result === 'critical_success') {
          events.push('发现隐藏物品');
          variables.发现物品 = true;
        } else {
          events.push('搜索无果');
        }
        break;

      case 'interaction':
        if (rollResult.result === 'success' || rollResult.result === 'critical_success') {
          events.push('NPC好感度提升');
          variables.好感度变化 = rollResult.result === 'critical_success' ? 20 : 10;
        } else {
          events.push('NPC好感度下降');
          variables.好感度变化 = -5;
        }
        break;
    }

    return {
      核心决策: coreDecision,
      事件列表: events,
      变量更新: variables,
      置信度: 0.9,
      理由: `投掷${rollResult.roll} vs 成功率${rollResult.finalSuccessRate}%`,
      判定结果: judgeResult,
    };
  }

  /**
   * 创建默认决策
   */
  private createDefaultDecision(): JudgeDecision {
    return {
      role: 'judge',
      decision: '等待判定',
      events: [],
      variables: {},
      confidence: 0.5,
      reasoning: '默认决策',
      result: 'failure',
      roll: 0,
      difficulty: 50,
    };
  }
}
