/**
 * rpgSectEngine.ts
 *
 * RPG 门派引擎 — 管理门派经济、成员派遣、任务刷新、商品定价
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
import type { 详细门派结构, 门派商品 } from '../../../models/sect';
import {
  addFunds,
  spendFunds,
  investConstruction,
  calculateDailyMaintenance,
  type EconomyState,
} from '../rpg/sect/economyManager';
import {
  addContribution,
  spendContribution,
  calculateRank,
  getNextRankInfo,
} from '../rpg/sect/contributionManager';
import { refreshMissions } from '../rpg/sect/missionRefreshManager';
import {
  initializePosts,
  assignToPost,
  removeFromPost,
  calculatePostOutput,
  type PostAssignment,
  type SectMember,
} from '../rpg/sect/memberDispatcher';
import {
  calculateFinalPrice,
  type PriceConfig,
  type SupplyDemand,
} from '../rpg/sect/dynamicPricing';

export class RpgSectEngine extends BaseEngine {
  private _sectData: 详细门派结构 | null = null;
  private _postAssignments: PostAssignment[] = [];
  private _turnNumber = 0;

  constructor() {
    super('rpgSect' as EngineType);
  }

  get sectData(): 详细门派结构 | null {
    return this._sectData;
  }

  get postAssignments(): ReadonlyArray<PostAssignment> {
    return this._postAssignments;
  }

  /**
   * 初始化门派数据
   */
  initialize(sectData: 详细门派结构): ActionResult {
    this._sectData = { ...sectData };
    this._postAssignments = initializePosts();

    this._publishSectEvent('SECT_INITIALIZE', {
      sectId: sectData.ID,
      sectName: sectData.名称,
    });

    return {
      success: true,
      stateUpdates: { sect: sectData.ID, action: 'initialize' },
      narrativeConstraint: `<门派>加入${sectData.名称}</门派>`,
      keyStep: true,
      sideEffects: [{ type: 'sect_initialize', payload: { sectId: sectData.ID } }],
    };
  }

  /**
   * 增加贡献
   */
  gainContribution(amount: number): ActionResult {
    if (!this._sectData) {
      return this._notInSect();
    }

    const result = addContribution(this._sectData.玩家贡献, amount);
    if (!result.success) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<贡献>${result.reason}</贡献>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const newRank = calculateRank(result.newContribution);
    this._sectData = {
      ...this._sectData,
      玩家贡献: result.newContribution,
      玩家职位: newRank,
    };

    this._publishSectEvent('SECT_CONTRIBUTION', { amount, newContribution: result.newContribution });

    return {
      success: true,
      stateUpdates: { contribution: result.newContribution, rank: newRank },
      narrativeConstraint: `<贡献>贡献+${amount}，当前职位: ${newRank}</贡献>`,
      keyStep: amount >= 100,
      sideEffects: [{ type: 'contribution_gain', payload: { amount } }],
    };
  }

  /**
   * 消耗贡献
   */
  useContribution(amount: number): ActionResult {
    if (!this._sectData) {
      return this._notInSect();
    }

    const result = spendContribution(this._sectData.玩家贡献, amount);
    if (!result.success) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<贡献>${result.reason}</贡献>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    this._sectData = {
      ...this._sectData,
      玩家贡献: result.newContribution,
    };

    return {
      success: true,
      stateUpdates: { contribution: result.newContribution },
      narrativeConstraint: `<贡献>贡献-${amount}</贡献>`,
      keyStep: false,
      sideEffects: [{ type: 'contribution_spend', payload: { amount } }],
    };
  }

  /**
   * 增加门派资金
   */
  addSectFunds(amount: number): ActionResult {
    if (!this._sectData) return this._notInSect();

    const economy: EconomyState = {
      门派资金: this._sectData.门派资金,
      门派物资: this._sectData.门派物资,
      建设度: this._sectData.建设度,
    };
    const result = addFunds(economy, amount);
    if (!result.success) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<经济>${result.reason}</经济>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    this._sectData = { ...this._sectData, 门派资金: result.newState.门派资金 };
    return {
      success: true,
      stateUpdates: { sectFunds: result.newState.门派资金 },
      narrativeConstraint: `<经济>门派资金+${amount}</经济>`,
      keyStep: false,
      sideEffects: [],
    };
  }

  /**
   * 投入建设
   */
  investInConstruction(funds: number): ActionResult {
    if (!this._sectData) return this._notInSect();

    const economy: EconomyState = {
      门派资金: this._sectData.门派资金,
      门派物资: this._sectData.门派物资,
      建设度: this._sectData.建设度,
    };
    const result = investConstruction(economy, funds);
    if (!result.success) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<建设>${result.reason}</建设>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    this._sectData = {
      ...this._sectData,
      门派资金: result.newState.门派资金,
      建设度: result.newState.建设度,
    };

    this._publishSectEvent('SECT_CONSTRUCTION', { funds, newConstruction: result.newState.建设度 });

    return {
      success: true,
      stateUpdates: { construction: result.newState.建设度 },
      narrativeConstraint: `<建设>投入${funds}资金，建设度+${result.newState.建设度 - economy.建设度}</建设>`,
      keyStep: true,
      sideEffects: [{ type: 'sect_construction', payload: { funds } }],
    };
  }

  /**
   * 刷新任务列表
   */
  refreshTasks(missionCountPerType: number = 2): ActionResult {
    if (!this._sectData) return this._notInSect();

    const currentTasks = this._sectData.任务列表 ?? [];
    const newTasks = refreshMissions(currentTasks, missionCountPerType);

    this._sectData = { ...this._sectData, 任务列表: newTasks };

    this._publishSectEvent('SECT_TASK_REFRESH', { taskCount: newTasks.length });

    return {
      success: true,
      stateUpdates: { tasks: 'refreshed', taskCount: newTasks.length },
      narrativeConstraint: `<门派>任务已刷新，共${newTasks.length}个任务</门派>`,
      keyStep: false,
      sideEffects: [{ type: 'sect_task_refresh', payload: { taskCount: newTasks.length } }],
    };
  }

  /**
   * 分配成员到岗位
   */
  dispatchMember(memberId: string, postId: string): ActionResult {
    if (!this._sectData) return this._notInSect();

    const result = assignToPost(this._postAssignments, memberId, postId);
    if (!result.success) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<派遣>${result.reason}</派遣>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const assignment = this._postAssignments.find((a) => a.postId === postId);
    if (assignment) {
      assignment.assignedMembers.push(memberId);
    }

    return {
      success: true,
      stateUpdates: { dispatch: { memberId, postId } },
      narrativeConstraint: `<派遣>成员已分配到${postId}岗位</派遣>`,
      keyStep: false,
      sideEffects: [{ type: 'member_dispatch', payload: { memberId, postId } }],
    };
  }

  /**
   * 从岗位移除成员
   */
  recallMember(memberId: string): ActionResult {
    if (!this._sectData) return this._notInSect();

    const result = removeFromPost(this._postAssignments, memberId);
    if (!result.success) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<派遣>${result.reason}</派遣>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    return {
      success: true,
      stateUpdates: { recall: memberId },
      narrativeConstraint: `<派遣>成员已召回</派遣>`,
      keyStep: false,
      sideEffects: [{ type: 'member_recall', payload: { memberId } }],
    };
  }

  /**
   * 计算岗位产出
   */
  calculateAllPostOutputs(members: SectMember[]): { postId: string; postName: string; dailyYield: number }[] {
    return this._postAssignments.map((assignment) => {
      const output = calculatePostOutput(assignment, members);
      return {
        postId: output.postId,
        postName: output.postName,
        dailyYield: output.dailyYield,
      };
    });
  }

  /**
   * 计算商品动态价格
   */
  calculateItemPrice(
    item: 门派商品,
    supplyDemand: SupplyDemand,
    volatility = 0.5,
  ): number {
    const config: PriceConfig = {
      basePrice: item.兑换价格,
      minPrice: Math.floor(item.兑换价格 * 0.5),
      maxPrice: Math.floor(item.兑换价格 * 2),
      volatility,
    };
    return calculateFinalPrice(config, supplyDemand);
  }

  /**
   * 获取贡献等级信息
   */
  getContributionInfo(): {
    currentRank: string;
    nextRank: string | null;
    needed: number;
    contribution: number;
  } {
    if (!this._sectData) {
      return { currentRank: '无门派', nextRank: null, needed: 0, contribution: 0 };
    }
    const rankInfo = getNextRankInfo(this._sectData.玩家贡献);
    return {
      ...rankInfo,
      contribution: this._sectData.玩家贡献,
    };
  }

  /**
   * 每日经济维护
   */
  dailyMaintenance(): ActionResult {
    if (!this._sectData) return this._notInSect();

    const maintenance = calculateDailyMaintenance(this._sectData.建设度);

    const economy: EconomyState = {
      门派资金: this._sectData.门派资金,
      门派物资: this._sectData.门派物资,
      建设度: this._sectData.建设度,
    };

    const netFunds = maintenance.income - maintenance.expense;
    const newState = netFunds >= 0
      ? addFunds(economy, netFunds).newState
      : spendFunds(economy, Math.abs(netFunds)).newState;

    this._sectData = {
      ...this._sectData,
      门派资金: newState.门派资金,
    };

    return {
      success: true,
      stateUpdates: {
        dailyIncome: maintenance.income,
        dailyExpense: maintenance.expense,
        net: netFunds,
      },
      narrativeConstraint: `<经济>每日维护: 收入+${maintenance.income}, 支出-${maintenance.expense}, 净${netFunds >= 0 ? '+' : ''}${netFunds}</经济>`,
      keyStep: false,
      sideEffects: [],
    };
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

    if (type === 'gain_contribution') {
      const amount = (payload.amount as number) ?? 0;
      return this.gainContribution(amount);
    }

    if (type === 'use_contribution') {
      const amount = (payload.amount as number) ?? 0;
      return this.useContribution(amount);
    }

    if (type === 'invest_construction') {
      const funds = (payload.funds as number) ?? 0;
      return this.investInConstruction(funds);
    }

    if (type === 'refresh_tasks') {
      const count = (payload.missionCountPerType as number) ?? 2;
      return this.refreshTasks(count);
    }

    if (type === 'dispatch_member') {
      const memberId = payload.memberId as string;
      const postId = payload.postId as string;
      return this.dispatchMember(memberId, postId);
    }

    if (type === 'recall_member') {
      const memberId = payload.memberId as string;
      return this.recallMember(memberId);
    }

    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: '<门派>未知操作类型</门派>',
      keyStep: false,
      sideEffects: [],
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    return [
      'gain_contribution',
      'use_contribution',
      'invest_construction',
      'refresh_tasks',
      'dispatch_member',
      'recall_member',
    ].includes(action.type);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        rpgSect: {
          sectName: this._sectData?.名称 ?? null,
          playerPosition: this._sectData?.玩家职位 ?? null,
          playerContribution: this._sectData?.玩家贡献 ?? 0,
          sectFunds: this._sectData?.门派资金 ?? 0,
          sectSupplies: this._sectData?.门派物资 ?? 0,
          constructionLevel: this._sectData?.建设度 ?? 0,
          taskCount: this._sectData?.任务列表?.length ?? 0,
          postAssignments: this._postAssignments.map((a) => ({
            postId: a.postId,
            memberCount: a.assignedMembers.length,
            maxSlots: a.maxSlots,
          })),
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    return {
      scene: this._sectData?.名称 ?? '无门派',
      turn: this._turnNumber,
      tension: 0,
      playerAction: this._sectData?.玩家职位 ?? '散修',
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: 'sect_idle',
    };
  }

  reset(): void {
    this._sectData = null;
    this._postAssignments = [];
    this._turnNumber = 0;
    super.pause('phase-change');
    super.resume();
  }

  serialize(): Record<string, unknown> {
    return {
      engineType: 'rpgSect',
      turnNumber: this._turnNumber,
      sectData: this._sectData,
      postAssignments: this._postAssignments,
    };
  }

  static fromJSON(state: Record<string, unknown>): RpgSectEngine {
    const engine = new RpgSectEngine();
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    if (state.sectData !== undefined && state.sectData !== null) {
      engine._sectData = state.sectData as 详细门派结构;
    }
    if (Array.isArray(state.postAssignments)) {
      engine._postAssignments = state.postAssignments as PostAssignment[];
    }
    return engine;
  }

  private _notInSect(): ActionResult {
    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: '<门派>未加入任何门派</门派>',
      keyStep: false,
      sideEffects: [],
    };
  }

  private _publishSectEvent(type: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: `sect-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      engineType: this._engineType,
      type,
      description: `Sect event: ${type}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }
}

/** 工厂函数 */
export function createRpgSectEngine(): RpgSectEngine {
  return new RpgSectEngine();
}
