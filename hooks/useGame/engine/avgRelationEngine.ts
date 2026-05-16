/**
 * avgRelationEngine.ts
 *
 * AVG 关系引擎 — 管理 NPC 关系图谱、好感度追踪、Galgame 路线判定和结局解析。
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
import { RelationGraph, createRelationGraph } from '../avg/relation/relationGraph';
import { IntimacyTrigger, IntimacyStateMachine, createIntimacyTrigger } from '../avg/intimacy/intimacyStateMachine';
import type { IntimacyEvent } from '../avg/intimacy/intimacyStateMachine';
import { RouteResolver, createRouteResolver } from '../avg/galgame/routeResolver';
import { EndingResolver, createEndingResolver, CGManager, createCGManager } from '../avg/galgame/endingResolver';
import type {
  RelationGraphData,
  RelationEdge,
  IntimacyLevel,
  NpcRelationSummary,
  IntimacyChange,
} from '../../../models/avg/relationGraph';
import type {
  GalgameRoute,
  GalgameEnding,
  GalgameCG,
  GalgameState,
  RouteJudgment,
  EndingJudgment,
} from '../../../models/avg/galgame';

export interface AvgRelationState {
  graphData: RelationGraphData;
  galgameState: GalgameState;
  totalIntimacyChanges: number;
  triggeredEventCount: number;
}

export class AvgRelationEngine extends BaseEngine {
  private _graph: RelationGraph;
  private _trigger: IntimacyTrigger;
  private _routeResolver: RouteResolver;
  private _endingResolver: EndingResolver;
  private _cgManager: CGManager;
  private _galgameState: GalgameState;
  private _turnNumber = 0;
  private _lastResolvedEnding: EndingJudgment | null = null;

  constructor(
    graphData?: RelationGraphData,
    events?: IntimacyEvent[],
    routes?: GalgameRoute[],
    endings?: GalgameEnding[],
    cgs?: GalgameCG[]
  ) {
    super('avgRelation' as EngineType);

    this._graph = createRelationGraph(graphData);
    this._trigger = createIntimacyTrigger(events);
    this._routeResolver = createRouteResolver(routes);
    this._endingResolver = createEndingResolver(endings);
    this._cgManager = createCGManager(cgs);
    this._galgameState = {
      activeRouteId: null,
      unlockedRouteIds: [],
      lockedRouteIds: [],
      triggeredEventIds: [],
      completedEndingIds: [],
      unlockedCGIds: [],
      flags: {},
    };
  }

  // ==================== 关系图谱操作 ====================

  addNpc(npcId: string): void {
    this._graph.addNode(npcId);
  }

  removeNpc(npcId: string): void {
    this._graph.removeNode(npcId);
  }

  hasNpc(npcId: string): boolean {
    return this._graph.hasNode(npcId);
  }

  getAllNpcs(): string[] {
    return this._graph.getAllNpcIds();
  }

  setRelation(edge: RelationEdge): void {
    this._graph.addEdge(edge);
  }

  removeRelation(fromNpcId: string, toNpcId: string): void {
    this._graph.removeEdge(fromNpcId, toNpcId);
  }

  getRelation(fromNpcId: string, toNpcId: string): RelationEdge | null {
    return this._graph.getEdge(fromNpcId, toNpcId);
  }

  getRelationsFrom(npcId: string): RelationEdge[] {
    return this._graph.getEdgesFrom(npcId);
  }

  getRelationsTo(npcId: string): RelationEdge[] {
    return this._graph.getEdgesTo(npcId);
  }

  getRelationSummary(npcId: string): NpcRelationSummary[] {
    return this._graph.getSummary(npcId);
  }

  // ==================== 好感度操作 ====================

  changeIntimacy(
    fromNpcId: string,
    toNpcId: string,
    delta: number,
    reason: string
  ): IntimacyChange {
    const oldLevel = this._graph.getLevel(fromNpcId, toNpcId);
    const result = this._graph.updateIntimacy(fromNpcId, toNpcId, delta);

    const triggerResult = this._trigger.check(
      toNpcId,
      result.newIntimacy,
      oldLevel,
      result.newLevel
    );

    if (triggerResult.levelUp) {
      this._checkRouteLock(toNpcId, result.newIntimacy);
      this._checkCGUnlock(result.newIntimacy);
    }

    for (const event of triggerResult.newEvents) {
      if (!this._galgameState.triggeredEventIds.includes(event.id)) {
        this._galgameState.triggeredEventIds = [...this._galgameState.triggeredEventIds, event.id];
      }
    }

    this._publishEvent('INTIMACY_CHANGE', `${fromNpcId} -> ${toNpcId}: ${delta} (${reason})`);

    return {
      npcId: toNpcId,
      delta,
      reason,
      newIntimacy: result.newIntimacy,
      levelChanged: result.levelChanged,
      oldLevel: result.oldLevel,
      newLevel: result.newLevel,
    };
  }

  getIntimacy(fromNpcId: string, toNpcId: string): number {
    return this._graph.getIntimacy(fromNpcId, toNpcId);
  }

  getLevel(fromNpcId: string, toNpcId: string): IntimacyLevel {
    return this._graph.getLevel(fromNpcId, toNpcId);
  }

  getLevelLabel(level: IntimacyLevel): string {
    return IntimacyStateMachine.getLevelLabel(level);
  }

  getRemainingToNext(level: IntimacyLevel): number {
    return IntimacyStateMachine.remainingToNext(level);
  }

  // ==================== 路线判定 ====================

  judgeRoute(routeId: string, npcId: string): RouteJudgment {
    const intimacy = this._graph.getIntimacy('player', npcId);
    return this._routeResolver.judgeEnter(routeId, intimacy, this._galgameState);
  }

  enterRoute(routeId: string, npcId: string): boolean {
    const judgment = this.judgeRoute(routeId, npcId);
    if (!judgment.canEnter) return false;

    this._galgameState.activeRouteId = routeId;
    if (!this._galgameState.unlockedRouteIds.includes(routeId)) {
      this._galgameState.unlockedRouteIds = [...this._galgameState.unlockedRouteIds, routeId];
    }
    this._publishEvent('ROUTE_ENTER', `进入路线: ${routeId}`);
    return true;
  }

  suggestRoute(npcId: string): GalgameRoute | null {
    const intimacy = this._graph.getIntimacy('player', npcId);
    return this._routeResolver.suggestRoute(intimacy, npcId, this._galgameState);
  }

  getActiveRoute(): GalgameRoute | undefined {
    if (!this._galgameState.activeRouteId) return undefined;
    return this._routeResolver.getRoute(this._galgameState.activeRouteId);
  }

  // ==================== 结局解析 ====================

  resolveEnding(routeId?: string): EndingJudgment {
    const resolvedRouteId = routeId ?? this._galgameState.activeRouteId;
    if (!resolvedRouteId) {
      const result = { resolved: false, ending: null, reason: '没有激活的路线' };
      this._lastResolvedEnding = result;
      return result;
    }

    const route = this._routeResolver.getRoute(resolvedRouteId);
    if (!route) {
      const result = { resolved: false, ending: null, reason: '路线不存在' };
      this._lastResolvedEnding = result;
      return result;
    }

    const intimacy = this._graph.getIntimacy('player', route.npcId);
    const result = this._endingResolver.resolve(resolvedRouteId, intimacy, this._galgameState);
    this._lastResolvedEnding = result;
    return result;
  }

  /** 获取最近一次结局解析结果 */
  getLastResolvedEnding(): EndingJudgment | null {
    return this._lastResolvedEnding;
  }

  completeEnding(endingId: string): boolean {
    const ending = this._endingResolver.getEnding(endingId);
    if (!ending) return false;

    if (!this._galgameState.completedEndingIds.includes(endingId)) {
      this._galgameState.completedEndingIds = [...this._galgameState.completedEndingIds, endingId];
    }

    for (const cgId of ending.cgIds) {
      if (!this._galgameState.unlockedCGIds.includes(cgId)) {
        this._galgameState.unlockedCGIds = [...this._galgameState.unlockedCGIds, cgId];
      }
    }

    this._publishEvent('ENDING_COMPLETE', `完成结局: ${ending.title}`);
    return true;
  }

  // ==================== CG 图鉴 ====================

  getAllCGs(): GalgameCG[] {
    return this._cgManager.getAllCGs();
  }

  getUnlockedCGs(): GalgameCG[] {
    return this._cgManager.getUnlockedCGs();
  }

  getLockedCGs(): GalgameCG[] {
    return this._cgManager.getLockedCGs();
  }

  getCGsForRoute(routeId: string): GalgameCG[] {
    return this._cgManager.getCGsForRoute(routeId);
  }

  // ==================== 状态 ====================

  getGalgameState(): GalgameState {
    return { ...this._galgameState };
  }

  getGraph(): RelationGraph {
    return this._graph;
  }

  getState(): AvgRelationState {
    return {
      graphData: this._graph.toJSON(),
      galgameState: this.getGalgameState(),
      totalIntimacyChanges: this._graph.getChanges().filter((c) => c.type === 'edge_update').length,
      triggeredEventCount: this._galgameState.triggeredEventIds.length,
    };
  }

  setFlag(key: string, value: boolean): void {
    this._galgameState.flags = { ...this._galgameState.flags, [key]: value };
  }

  getFlag(key: string): boolean {
    return !!this._galgameState.flags[key];
  }

  // ==================== SLGEngine 接口 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;

    const events = this.resolvePendingEvents();

    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: events.map((e) => e.event),
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    if (action.type === 'change_intimacy') {
      const { fromNpcId, toNpcId, delta, reason } = action.payload as {
        fromNpcId: string;
        toNpcId: string;
        delta: number;
        reason: string;
      };
      const change = this.changeIntimacy(fromNpcId, toNpcId, delta, reason);
      return {
        success: true,
        stateUpdates: {
          npcId: change.npcId,
          newIntimacy: change.newIntimacy,
          levelChanged: change.levelChanged,
          newLevel: change.newLevel,
        },
        narrativeConstraint: `<叙事>好感度变化: ${change.npcId} ${change.delta > 0 ? '+' : ''}${change.delta}, 等级: ${this.getLevelLabel(change.newLevel)}</叙事>`,
        keyStep: change.levelChanged,
        sideEffects: [],
      };
    }

    if (action.type === 'enter_route') {
      const { routeId, npcId } = action.payload as { routeId: string; npcId: string };
      const success = this.enterRoute(routeId, npcId);
      return success
        ? {
            success: true,
            stateUpdates: { routeId },
            narrativeConstraint: '<叙事>你进入了路线</叙事>',
            keyStep: true,
            sideEffects: [],
          }
        : {
            success: false,
            stateUpdates: {},
            narrativeConstraint: '<错误>无法进入路线</错误>',
            keyStep: false,
            sideEffects: [],
          };
    }

    if (action.type === 'resolve_ending') {
      const result = this.resolveEnding();
      return result.resolved
        ? {
            success: true,
            stateUpdates: { endingId: result.ending!.id },
            narrativeConstraint: `<叙事>结局: ${result.ending!.title}</叙事>`,
            keyStep: true,
            sideEffects: [],
          }
        : {
            success: false,
            stateUpdates: {},
            narrativeConstraint: `<错误>${result.reason}</错误>`,
            keyStep: false,
            sideEffects: [],
          };
    }

    return this._failResult(`不支持的操作: ${action.type}`);
  }

  canExecuteAction(action: PlayerAction): boolean {
    if (action.type === 'change_intimacy') return true;
    if (action.type === 'enter_route') return true;
    if (action.type === 'resolve_ending') return true;
    return false;
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        avgRelation: this.getState() as unknown as Record<string, unknown>,
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const activeRoute = this.getActiveRoute();
    const scene = activeRoute
      ? `当前路线: ${activeRoute.routeName}`
      : '当前没有激活的路线';

    return {
      scene,
      turn: this._turnNumber,
      tension: 0,
      playerAction: `AVG 关系 — ${activeRoute?.routeName ?? '无'}`,
      keyStep: this._galgameState.triggeredEventIds.length > 0,
      nsfwTriggered: false,
      participants: [],
      nextEvent: this._galgameState.activeRouteId ? '等待剧情推进' : '等待玩家选择路线',
    };
  }

  reset(): void {
    this._graph = createRelationGraph();
    this._trigger.resetAll();
    this._turnNumber = 0;
    this._pendingEvents = [];
    this._galgameState = {
      activeRouteId: null,
      unlockedRouteIds: [],
      lockedRouteIds: [],
      triggeredEventIds: [],
      completedEndingIds: [],
      unlockedCGIds: [],
      flags: {},
    };
  }

  // ==================== 序列化 ====================

  serialize(): Record<string, unknown> {
    return {
      engineType: this.getEngineType(),
      turnNumber: this._turnNumber,
      galgameState: this._galgameState,
      relationCount: this._graph.getAllNpcIds().length,
    };
  }

  static fromJSON(state: Record<string, unknown>): AvgRelationEngine {
    const engine = new AvgRelationEngine();
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    if (state.galgameState) engine._galgameState = state.galgameState as any;
    return engine;
  }

  // ==================== 内部辅助 ====================

  private _failResult(reason: string): ActionResult {
    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: `<错误>${reason}</错误>`,
      keyStep: false,
      sideEffects: [],
    };
  }

  private _checkRouteLock(npcId: string, intimacy: number): void {
    const suggested = this._routeResolver.suggestRoute(intimacy, npcId, this._galgameState);
    if (suggested && this._routeResolver.shouldLockRoute(suggested.id, intimacy, this._galgameState)) {
      if (!this._galgameState.lockedRouteIds.includes(suggested.id)) {
        this._galgameState.lockedRouteIds = [...this._galgameState.lockedRouteIds, suggested.id];
        this._publishEvent('ROUTE_LOCK', `路线锁定: ${suggested.routeName}`);
      }
    }
  }

  private _checkCGUnlock(intimacy: number): void {
    const newlyUnlocked = this._cgManager.checkUnlock(intimacy, this._galgameState);
    for (const cgId of newlyUnlocked) {
      if (!this._galgameState.unlockedCGIds.includes(cgId)) {
        this._galgameState.unlockedCGIds = [...this._galgameState.unlockedCGIds, cgId];
      }
    }
    if (newlyUnlocked.length > 0) {
      this._publishEvent('CG_UNLOCK', `CG 解锁: ${newlyUnlocked.join(', ')}`);
    }
  }

  private _publishEvent(type: string, description: string): void {
    const event: GameEvent = {
      id: `avgRelation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      engineType: 'avgRelation' as EngineType,
      type,
      description,
      status: 'pending',
      payload: { turnNumber: this._turnNumber },
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }
}

export function createAvgRelationEngine(
  graphData?: RelationGraphData,
  events?: IntimacyEvent[],
  routes?: GalgameRoute[],
  endings?: GalgameEnding[],
  cgs?: GalgameCG[]
): AvgRelationEngine {
  return new AvgRelationEngine(graphData, events, routes, endings, cgs);
}
