/**
 * rpgKungfuEngine.ts
 *
 * RPG 功法引擎 — 管理功法学习、修炼、突破、被动效果
 */

import { BaseEngine } from '../engine/baseEngine';
import type {
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  EngineType,
} from '../engine/types';
import {
  cultivateKungfu,
  cultivateKungfuBatch,
  checkBreakthrough,
  calculatePassiveEffects,
  mergePassiveEffects,
  type PassiveModifiers,
} from '../rpg/kungfu';
import type { 功法结构 } from '../../../models/kungfu';
import type { 角色数据结构 } from '../../../models/character';

export class RpgKungfuEngine extends BaseEngine {
  private _kungfuList: 功法结构[] = [];
  private _turnNumber = 0;

  constructor() {
    super('rpgKungfu' as EngineType);
  }

  get kungfuList(): ReadonlyArray<功法结构> {
    return this._kungfuList;
  }

  /**
   * 学习新功法
   */
  learnKungfu(kungfu: 功法结构): ActionResult {
    const existing = this._kungfuList.find((k) => k.ID === kungfu.ID);
    if (existing) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<功法>已学会${kungfu.名称}</功法>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    this._kungfuList.push({ ...kungfu });

    this._publishKungfuEvent('KUNGFU_LEARN', {
      kungfuId: kungfu.ID,
      kungfuName: kungfu.名称,
      quality: kungfu.品质,
    });

    return {
      success: true,
      stateUpdates: { kungfu: kungfu.ID },
      narrativeConstraint: `<功法>学会${kungfu.名称}（${kungfu.品质}）</功法>`,
      keyStep: true,
      sideEffects: [{ type: 'kungfu_learn', payload: { kungfuId: kungfu.ID } }],
    };
  }

  /**
   * 修炼功法
   */
  cultivateKungfu(kungfuId: string, proficiencyGain: number): ActionResult {
    const index = this._kungfuList.findIndex((k) => k.ID === kungfuId);
    if (index < 0) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<功法>未学会该功法</功法>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const kungfu = this._kungfuList[index];
    const result = cultivateKungfu(kungfu, proficiencyGain);

    const updated = { ...kungfu, 当前熟练度: result.newProficiency };
    if (result.levelUp) {
      updated.当前重数 = result.newLevel;
    }
    this._kungfuList[index] = updated;

    this._publishKungfuEvent(result.levelUp ? 'KUNGFU_LEVEL_UP' : 'KUNGFU_CULTIVATE', {
      kungfuId: kungfu.ID,
      kungfuName: kungfu.名称,
      newLevel: result.newLevel,
      newProficiency: result.newProficiency,
    });

    return {
      success: result.success,
      stateUpdates: {
        kungfu: kungfu.ID,
        level: result.newLevel,
        proficiency: result.newProficiency,
      },
      narrativeConstraint: result.levelUp
        ? `<功法>${kungfu.名称}突破到第${result.newLevel}重</功法>`
        : `<功法>${kungfu.名称}熟练度+${proficiencyGain}</功法>`,
      keyStep: result.levelUp,
      sideEffects: [
        {
          type: result.levelUp ? 'kungfu_level_up' : 'kungfu_cultivate',
          payload: { kungfuId: kungfu.ID, gain: proficiencyGain },
        },
      ],
    };
  }

  /**
   * 批量修炼
   */
  cultivateKungfuBatch(kungfuId: string, totalProficiencyGain: number): ActionResult {
    const index = this._kungfuList.findIndex((k) => k.ID === kungfuId);
    if (index < 0) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<功法>未学会该功法</功法>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const kungfu = this._kungfuList[index];
    const result = cultivateKungfuBatch(kungfu, totalProficiencyGain);

    const updated = { ...kungfu, 当前熟练度: result.newProficiency };
    if (result.levelUp) {
      updated.当前重数 = result.newLevel;
    }
    this._kungfuList[index] = updated;

    this._publishKungfuEvent('KUNGFU_LEVEL_UP', {
      kungfuId: kungfu.ID,
      kungfuName: kungfu.名称,
      newLevel: result.newLevel,
    });

    return {
      success: true,
      stateUpdates: {
        kungfu: kungfu.ID,
        level: result.newLevel,
        proficiency: result.newProficiency,
      },
      narrativeConstraint: `<功法>${kungfu.名称}修炼到第${result.newLevel}重</功法>`,
      keyStep: result.levelUp,
      sideEffects: [
        { type: 'kungfu_batch_cultivate', payload: { kungfuId: kungfu.ID, gain: totalProficiencyGain } },
      ],
    };
  }

  /**
   * 检查突破条件
   */
  checkBreakthrough(kungfuId: string, character: 角色数据结构): import('../rpg/kungfu').BreakthroughCheck {
    const kungfu = this._kungfuList.find((k) => k.ID === kungfuId);
    if (!kungfu) {
      return { canBreakthrough: false, blockedBy: ['未学会该功法'] };
    }
    return checkBreakthrough(kungfu, character);
  }

  /**
   * 突破功法
   */
  breakthroughKungfu(kungfuId: string, character: 角色数据结构): ActionResult {
    const check = this.checkBreakthrough(kungfuId, character);
    if (!check.canBreakthrough) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<功法>突破失败: ${check.blockedBy.join(', ')}</功法>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const index = this._kungfuList.findIndex((k) => k.ID === kungfuId);
    const kungfu = this._kungfuList[index];
    const oldLevel = kungfu.当前重数 ?? 1;
    const updated = { ...kungfu, 当前重数: oldLevel + 1, 当前熟练度: 0 };
    this._kungfuList[index] = updated;

    this._publishKungfuEvent('KUNGFU_BREAKTHROUGH', {
      kungfuId: kungfu.ID,
      kungfuName: kungfu.名称,
      oldLevel,
      newLevel: updated.当前重数,
    });

    return {
      success: true,
      stateUpdates: { kungfu: kungfu.ID, level: updated.当前重数 },
      narrativeConstraint: `<功法>${kungfu.名称}突破到第${updated.当前重数}重</功法>`,
      keyStep: true,
      sideEffects: [
        { type: 'kungfu_breakthrough', payload: { kungfuId: kungfu.ID, newLevel: updated.当前重数 } },
      ],
    };
  }

  /**
   * 计算所有功法的被动修正总和
   */
  getTotalPassiveModifiers(): PassiveModifiers {
    const modifiers = this._kungfuList.map((k) => calculatePassiveEffects(k));
    return modifiers.length > 0 ? mergePassiveEffects(...modifiers) : this._zeroModifiers();
  }

  // ==================== SLGEngine 接口 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;
    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: [],
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    const { type, payload } = action;

    if (type === 'cultivate') {
      const kungfuId = payload.kungfuId as string;
      const gain = (payload.proficiencyGain as number) ?? 10;
      return this.cultivateKungfu(kungfuId, gain);
    }

    if (type === 'breakthrough') {
      const kungfuId = payload.kungfuId as string;
      const character = payload.character as 角色数据结构 | undefined;
      if (!character) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<功法>缺少角色数据</功法>',
          keyStep: false,
          sideEffects: [],
        };
      }
      return this.breakthroughKungfu(kungfuId, character);
    }

    if (type === 'learn') {
      const kungfu = payload.kungfu as 功法结构 | undefined;
      if (!kungfu) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<功法>缺少功法数据</功法>',
          keyStep: false,
          sideEffects: [],
        };
      }
      return this.learnKungfu(kungfu);
    }

    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: '<功法>未知操作类型</功法>',
      keyStep: false,
      sideEffects: [],
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    return ['cultivate', 'breakthrough', 'learn'].includes(action.type);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        rpgKungfu: {
          kungfuCount: this._kungfuList.length,
          kungfuList: this._kungfuList.map((k: 功法结构) => ({
            id: k.ID,
            name: k.名称,
            level: k.当前重数,
            proficiency: k.当前熟练度,
          })),
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    return {
      scene: '功法修炼',
      turn: this._turnNumber,
      tension: 0,
      playerAction: `已学功法: ${this._kungfuList.length} 种`,
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: 'kungfu_cultivate',
    };
  }

  reset(): void {
    this._kungfuList = [];
    this._turnNumber = 0;
    super.pause('phase-change');
    super.resume();
  }

  serialize(): Record<string, unknown> {
    return {
      engineType: 'rpgKungfu',
      turnNumber: this._turnNumber,
      kungfuList: this._kungfuList,
    };
  }

  static fromJSON(state: Record<string, unknown>): RpgKungfuEngine {
    const engine = new RpgKungfuEngine();
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    if (Array.isArray(state.kungfuList)) {
      engine._kungfuList = state.kungfuList as 功法结构[];
    }
    return engine;
  }

  private _publishKungfuEvent(type: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: `kungfu-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      engineType: this._engineType,
      type,
      description: `Kungfu event: ${type}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }

  private _zeroModifiers(): PassiveModifiers {
    return {
      力量: 0, 敏捷: 0, 体质: 0, 根骨: 0, 悟性: 0, 福源: 0,
      攻击力: 0, 防御力: 0, 速度: 0, 暴击率: 0, 闪避率: 0,
    };
  }
}

/** 工厂函数 */
export function createRpgKungfuEngine(): RpgKungfuEngine {
  return new RpgKungfuEngine();
}
