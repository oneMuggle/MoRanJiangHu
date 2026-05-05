/**
 * Narrative Director - 叙事导演
 * 负责控制故事节奏、章节推进、伏笔管理
 */

import { BaseDirector } from './BaseDirector';
import type { DirectorContext, NarrativeDecision } from '../types';
import { 叙事导演_角色提示 } from '../prompts/directorCore';
import { 叙事导演_提示词 } from '../prompts/rolePrompts';

/**
 * 叙事导演
 * 掌控故事节奏、推进剧情、管理伏笔
 */
export class NarrativeDirector extends BaseDirector {
  constructor() {
    super('narrative', 叙事导演_角色提示);
  }

  /**
   * 分析上下文并做出叙事决策
   */
  async analyze(context: DirectorContext): Promise<NarrativeDecision> {
    if (!this.validateContext(context)) {
      return this.createDefaultDecision();
    }

    const { gameState, characterState, currentScene } = context;

    // 分析剧情发展阶段
    const storyPhase = this.analyzeStoryPhase(gameState);
    
    // 决定叙事重点
    const narrativeFocus = this.decideNarrativeFocus(storyPhase, currentScene);
    
    // 检查伏笔回收时机
    const foreshadowingToResolve = this.checkForeshadowing(gameState);
    
    // 生成叙事决策
    const decision = this.generateNarrativeDecision(
      narrativeFocus,
      foreshadowingToResolve,
      storyPhase
    );

    return {
      ...this.createBaseDecision(
        decision.核心决策,
        decision.事件列表,
        decision.变量更新,
        decision.置信度,
        decision.理由
      ),
      chapterProgress: this.calculateChapterProgress(gameState),
      foreshadowing: decision.伏笔列表,
      sideQuests: decision.支线任务,
    } as NarrativeDecision;
  }

  /**
   * 分析当前剧情阶段
   */
  private analyzeStoryPhase(gameState: DirectorContext['gameState']): 'opening' | 'development' | 'climax' | 'resolution' {
    // 基于游戏时间或章节进度判断
    const progress = gameState.游戏时间?.match(/第(\d+)章/) || ['第1章'];
    const chapter = parseInt(progress[1] || '1');
    
    if (chapter <= 1) return 'opening';
    if (chapter <= 3) return 'development';
    if (chapter <= 5) return 'climax';
    return 'resolution';
  }

  /**
   * 决定叙事重点
   */
  private decideNarrativeFocus(
    storyPhase: string,
    currentScene: DirectorContext['currentScene']
  ): string {
    const focuses: Record<string, string[]> = {
      opening: ['介绍主要人物', '建立世界观', '引出主线冲突'],
      development: ['展开支线', '深化人物关系', '增加冲突'],
      climax: ['激化矛盾', '高潮对决', '关键抉择'],
      resolution: ['解决冲突', '回收伏笔', '收尾铺垫'],
    };

    const possibleFocus = focuses[storyPhase] || focuses.development;
    return possibleFocus[Math.floor(Math.random() * possibleFocus.length)];
  }

  /**
   * 检查伏笔回收时机
   */
  private checkForeshadowing(gameState: DirectorContext['gameState']): string[] {
    // 从游戏状态中获取待回收的伏笔
    const pendingForeshadowing = (gameState as any).伏笔列表 || [];
    return pendingForeshadowing.slice(0, 2); // 最多回收2个
  }

  /**
   * 生成叙事决策
   */
  private generateNarrativeDecision(
    focus: string,
    foreshadowing: string[],
    phase: string
  ): {
    核心决策: string;
    事件列表: string[];
    变量更新: Record<string, unknown>;
    置信度: number;
    理由: string;
    伏笔列表: string[];
    支线任务: string[];
  } {
    const events: string[] = [];
    const variables: Record<string, unknown> = {};
    const sideQuests: string[] = [];

    // 根据当前叙事重点生成事件
    switch (focus) {
      case '介绍主要人物':
        events.push('新NPC登场');
        variables.新NPC触发 = true;
        break;
      case '建立世界观':
        events.push('场景描写增强');
        variables.世界观展示 = true;
        break;
      case '引出主线冲突':
        events.push('主线任务更新');
        variables.主线进度推进 = true;
        break;
      case '展开支线':
        sideQuests.push('支线任务A');
        events.push('支线任务触发');
        break;
      case '深化人物关系':
        events.push('关系变化事件');
        variables.关系深化 = true;
        break;
      case '高潮对决':
        events.push('BOSS战开始');
        variables.战斗触发 = true;
        break;
      default:
        events.push('剧情自然推进');
    }

    // 回收伏笔
    foreshadowing.forEach(f => {
      events.push(`伏笔回收：${f}`);
    });

    return {
      核心决策: `当前叙事重点：${focus}`,
      事件列表: events,
      变量更新: variables,
      置信度: 0.85,
      理由: `基于${phase}阶段的叙事需求`,
      伏笔列表: foreshadowing,
      支线任务: sideQuests,
    };
  }

  /**
   * 计算章节进度
   */
  private calculateChapterProgress(gameState: DirectorContext['gameState']): number {
    // 简单实现：基于游戏时间估算
    const timeStr = gameState.游戏时间 || '';
    const match = timeStr.match(/第(\d+)章/);
    if (match) {
      const chapter = parseInt(match[1]);
      return Math.min(100, chapter * 20);
    }
    return 10; // 默认进度
  }

  /**
   * 创建默认决策
   */
  private createDefaultDecision(): NarrativeDecision {
    return {
      role: 'narrative',
      decision: '继续当前剧情',
      events: [],
      variables: {},
      confidence: 0.5,
      reasoning: '默认决策',
      chapterProgress: 0,
      foreshadowing: [],
      sideQuests: [],
    };
  }

  /**
   * 获取上下文提示词 - 重写版本
   */
  protected getContextPrompt(context: DirectorContext): string {
    return `
你是叙事导演，负责掌控故事节奏与叙事走向。

${叙事导演_提示词
  .replace('{{currentTask}}', context.currentScene.场景名称 || '推进剧情')
  .replace('{{existingForeshadowing}}', ((context.gameState as any).伏笔列表 || []).join(', ') || '无')
  .replace('{{pendingForeshadowing}}', '无')
  .replace('{{readyToResolve}}', '无')
  .replace('{{chapterProgress}}', this.calculateChapterProgress(context.gameState).toString())
  .replace('{{narrativeFocus}}', this.decideNarrativeFocus(
    this.analyzeStoryPhase(context.gameState),
    context.currentScene
  ))
  .replace('{{narrativeGoal}}', '推进主线剧情')}
`;
  }
}
