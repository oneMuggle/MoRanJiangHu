/**
 * 地图探索引擎 — 主类
 *
 * 管理大地图移动、遇敌、宝藏发现、事件触发。
 */

import { BaseEngine } from './baseEngine';
import type {
  PlayerAction,
  ActionResult,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
} from './types';
import type { MapNode, EncounterResult, TreasureResult } from '../../../models/exploration/mapNode';
import type { EventTrigger } from '../exploration/eventTriggerPoint';
import { MapGraph, createMapGraph } from '../exploration/mapGraph';
import { rollEncounter, calculateEncounterRate } from '../exploration/encounterCalculator';
import { rollTreasure } from '../exploration/treasureDetector';
import { EventTriggerManager, createEventTriggerManager } from '../exploration/eventTriggerPoint';

export interface ExplorationEngineConfig {
  maxAp?: number;
  playerLuck?: number;
  playerInsight?: number;
}

export interface ExplorationState {
  currentNodeId: string | null;
  currentAp: number;
  maxAp: number;
  visitedNodes: string[];
  playerLuck: number;
  playerInsight: number;
}

export class ExplorationEngine extends BaseEngine {
  private _graph: MapGraph;
  private _eventManager: EventTriggerManager;
  private _currentNodeId: string | null;
  private _turnNumber = 0;
  private _currentAp: number;
  private _maxAp: number;
  private _visitedNodes: Set<string>;
  private _playerLuck: number;
  private _playerInsight: number;

  constructor(config: ExplorationEngineConfig = {}) {
    super('exploration');
    this._graph = createMapGraph();
    this._eventManager = createEventTriggerManager();
    this._currentNodeId = null;
    this._currentAp = config.maxAp ?? 10;
    this._maxAp = config.maxAp ?? 10;
    this._visitedNodes = new Set();
    this._playerLuck = config.playerLuck ?? 50;
    this._playerInsight = config.playerInsight ?? 50;
  }

  // ==================== SLGEngine 抽象方法 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;
    this._currentAp = Math.min(this._maxAp, this._currentAp + 2);
    const events = this.resolvePendingEvents();
    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: events.map((e) => e.event),
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    if (action.type === 'moveTo') {
      return this._handleMove(action.payload as { targetNodeId: string });
    }
    if (action.type === 'explore') {
      return this._handleExplore();
    }
    if (action.type === 'rest') {
      return this._handleRest();
    }
    if (action.type === 'initMap') {
      return this._handleInitMap(action.payload as { nodes: MapNode[]; paths: Array<{ from: string; to: string; actionCost: number }> });
    }
    return this._failResult(`不支持的操作: ${action.type}`);
  }

  canExecuteAction(action: PlayerAction): boolean {
    if (action.type === 'moveTo') {
      if (!this._currentNodeId) return false;
      const target = action.payload.targetNodeId as string | undefined;
      if (!target || !this._graph.hasPath(this._currentNodeId, target)) return false;
      return true;
    }
    if (action.type === 'explore') return this._currentNodeId !== null;
    if (action.type === 'rest') return true;
    if (action.type === 'initMap') return this._currentNodeId === null;
    return false;
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        exploration: {
          currentNodeId: this._currentNodeId,
          currentAp: this._currentAp,
          visitedCount: this._visitedNodes.size,
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const currentNode = this._currentNodeId ? this._graph.getNode(this._currentNodeId) : null;
    return {
      scene: currentNode?.name ?? '未知区域',
      turn: this._turnNumber,
      tension: 0,
      playerAction: this._currentNodeId ? `位于 ${currentNode?.name}` : '未在地图中',
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: '探索中',
    };
  }

  // ==================== 地图管理 ====================

  initMap(nodes: MapNode[], paths: Array<{ from: string; to: string; actionCost: number; description?: string }>, startNodeId?: string): void {
    for (const node of nodes) {
      this._graph.addNode(node);
    }
    for (const path of paths) {
      this._graph.addPath({
        from: path.from,
        to: path.to,
        actionCost: path.actionCost,
        description: path.description,
      });
    }
    if (startNodeId) {
      this._currentNodeId = startNodeId;
      this._graph.revealNode(startNodeId);
      this._graph.markExplored(startNodeId);
      this._visitedNodes.add(startNodeId);
      this._revealAdjacent(startNodeId);
    }

    // 为每个节点注册首次访问事件
    for (const node of nodes) {
      this._eventManager.addTrigger({
        id: `evt_first_${node.id}`,
        nodeId: node.id,
        conditionType: 'first_visit',
        eventId: `narrative_first_visit_${node.id}`,
        oneTime: true,
      });
    }
  }

  registerEventTrigger(trigger: EventTrigger): void {
    this._eventManager.addTrigger(trigger);
  }

  // ==================== 移动 ====================

  moveTo(targetNodeId: string): { success: boolean; encounter?: EncounterResult; treasure?: TreasureResult; hiddenEvents: string[]; travelTimeMinutes: number; pathCost: number } {
    if (!this._currentNodeId) return { success: false, hiddenEvents: [], travelTimeMinutes: 0, pathCost: 0 };

    const path = this._graph.getPathsFrom(this._currentNodeId).find((p) => p.to === targetNodeId);
    if (!path) return { success: false, hiddenEvents: [], travelTimeMinutes: 0, pathCost: 0 };

    const pathCost = path.actionCost;

    // 本地计算预计耗时
    const travelTimeMinutes = this._calculateTravelTime(path, this._graph.getNode(targetNodeId)!);

    const fromNodeId = this._currentNodeId; // 保存原始值 (Step 1.1)
    this._currentNodeId = targetNodeId;

    this._graph.revealNode(targetNodeId);
    this._graph.markExplored(targetNodeId);
    this._revealAdjacent(targetNodeId);

    const isFirstVisit = !this._visitedNodes.has(targetNodeId);
    this._visitedNodes.add(targetNodeId);

    const targetNode = this._graph.getNode(targetNodeId)!;
    const encounter = rollEncounter({
      luck: this._playerLuck,
      dangerLevel: targetNode.dangerLevel,
    });

    const treasure = rollTreasure({
      insight: this._playerInsight,
      luck: this._playerLuck,
      areaTreasureRate: targetNode.dangerLevel === 'safe' ? 0.05 : 0.15,
    });

    const triggers = this._eventManager.checkTriggers(
      targetNode,
      isFirstVisit,
      { insight: this._playerInsight, luck: this._playerLuck },
      {},
    );

    // 遇敌/宝藏独立事件入队 (Step 1.3)
    if (encounter.triggered) {
      this._pushEvent('遇敌', `在 ${targetNode.name} 遭遇了${encounter.encounterType}`, {
        encounterType: encounter.encounterType,
        entityId: encounter.entityId,
        dangerLevel: encounter.dangerLevel,
      });
    }

    if (treasure.found) {
      this._pushEvent('发现宝藏', `在 ${targetNode.name} 发现了${treasure.quality}品质的宝藏`, {
        treasureId: treasure.treasureId,
        quality: treasure.quality,
      });
    }

    this._pushEvent('移动', `移动到 ${targetNode.name}`, {
      from: fromNodeId,
      to: targetNodeId,
      remainingAp: this._currentAp,
      encounter: encounter.triggered ? encounter : undefined,
      treasure: treasure.found ? treasure : undefined,
      triggeredEvents: triggers.map((t) => t.eventId),
    });

    return {
      success: true,
      encounter: encounter.triggered ? encounter : undefined,
      treasure: treasure.found ? treasure : undefined,
      hiddenEvents: triggers.map((t) => t.eventId),
      travelTimeMinutes,
      pathCost,
    };
  }

  // ==================== 探索 ====================

  explore(): ActionResult {
    if (!this._currentNodeId) return this._failResult('不在地图中');

    const node = this._graph.getNode(this._currentNodeId)!;
    const exploreTime = 15; // 探索消耗 15 分钟

    const treasure = rollTreasure({
      insight: this._playerInsight,
      luck: this._playerLuck,
      areaTreasureRate: 0.2,
    });

    this._pushEvent('探索', `在 ${node.name} 探索`, {
      nodeId: this._currentNodeId,
      treasure: treasure.found ? treasure : undefined,
      travelTimeMinutes: exploreTime,
    });

    if (treasure.found) {
      return {
        success: true,
        stateUpdates: { treasure, travelTimeMinutes: exploreTime },
        narrativeConstraint: `<叙事>你在 ${node.name} 发现了宝藏</叙事>`,
        keyStep: treasure.quality === 'rare' || treasure.quality === 'epic' || treasure.quality === 'legendary',
        sideEffects: [],
      };
    }

    return {
      success: true,
      stateUpdates: { travelTimeMinutes: exploreTime },
      narrativeConstraint: `<叙事>你在 ${node.name} 探索了一番，一无所获</叙事>`,
      keyStep: false,
      sideEffects: [],
    };
  }

  // ==================== 休息 ====================

  rest(): ActionResult {
    const restTime = 30; // 休息消耗 30 分钟
    this._pushEvent('休息', '休息恢复行动力', { restoredAp: this._maxAp, travelTimeMinutes: restTime });
    return {
      success: true,
      stateUpdates: { ap: this._currentAp, travelTimeMinutes: restTime },
      narrativeConstraint: '<叙事>你休息了一会儿，恢复了精力</叙事>',
      keyStep: false,
      sideEffects: [],
    };
  }

  // ==================== 查询接口 ====================

  getCurrentNode(): MapNode | undefined {
    return this._currentNodeId ? this._graph.getNode(this._currentNodeId) : undefined;
  }

  getAdjacentNodes(): { node: MapNode; path: { actionCost: number; description?: string } }[] {
    if (!this._currentNodeId) return [];
    return this._graph.getAdjacentNodes(this._currentNodeId).map(({ node, path }) => ({
      node,
      path: { actionCost: path.actionCost, description: path.description },
    }));
  }

  getState(): ExplorationState {
    return {
      currentNodeId: this._currentNodeId,
      currentAp: this._currentAp,
      maxAp: this._maxAp,
      visitedNodes: Array.from(this._visitedNodes),
      playerLuck: this._playerLuck,
      playerInsight: this._playerInsight,
    };
  }

  getEncounterRate(): number {
    const node = this.getCurrentNode();
    if (!node) return 0;
    return calculateEncounterRate({ luck: this._playerLuck, dangerLevel: node.dangerLevel });
  }

  // ==================== 序列化 ====================

  serialize(): Record<string, unknown> {
    return {
      engineType: this.getEngineType(),
      turnNumber: this._turnNumber,
      graph: this._graph.toJSON(),
      eventManager: this._eventManager.toJSON(),
      currentNodeId: this._currentNodeId,
      currentAp: this._currentAp,
      maxAp: this._maxAp,
      visitedNodes: Array.from(this._visitedNodes),
      playerLuck: this._playerLuck,
      playerInsight: this._playerInsight,
    };
  }

  static fromJSON(state: Record<string, unknown>): ExplorationEngine {
    const engine = new ExplorationEngine();
    if (state.graph) engine._graph = MapGraph.fromJSON(state.graph as any);
    if (state.eventManager) engine._eventManager = EventTriggerManager.fromJSON(state.eventManager as any);
    if (typeof state.currentNodeId === 'string') engine._currentNodeId = state.currentNodeId;
    if (typeof state.currentAp === 'number') engine._currentAp = state.currentAp;
    if (typeof state.maxAp === 'number') engine._maxAp = state.maxAp;
    if (Array.isArray(state.visitedNodes)) engine._visitedNodes = new Set(state.visitedNodes as string[]);
    if (typeof state.playerLuck === 'number') engine._playerLuck = state.playerLuck;
    if (typeof state.playerInsight === 'number') engine._playerInsight = state.playerInsight;
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    return engine;
  }

  // ==================== 内部方法 ====================

  /** 本地计算预计耗时 — 基于路径成本、节点类型、危险等级 */
  private _calculateTravelTime(path: { actionCost: number; description?: string }, targetNode: MapNode): number {
    const baseMinutes = path.actionCost * 10; // actionCost * 10 分钟为基础

    // 节点类型加成
    const typeMultipliers: Record<string, number> = {
      'wilderness': 1.5,
      'mountain': 1.8,
      'cave': 1.3,
      'secret': 2.0,
      'village': 1.0,
      'town': 0.8,
      'market': 0.7,
      'inn': 0.6,
      'sect': 0.9,
    };
    const multiplier = typeMultipliers[targetNode.type] ?? 1.0;

    // 危险等级加成（危险区域行进更慢）
    const dangerMultipliers: Record<string, number> = {
      'safe': 0.8,
      'low': 1.0,
      'medium': 1.3,
      'high': 1.6,
      'deadly': 2.0,
    };
    const dangerMultiplier = dangerMultipliers[targetNode.dangerLevel] ?? 1.0;

    const minutes = Math.round(baseMinutes * multiplier * dangerMultiplier);
    return Math.max(5, minutes); // 至少 5 分钟
  }

  private _handleMove(payload: { targetNodeId: string }): ActionResult {
    const result = this.moveTo(payload.targetNodeId);
    if (!result.success) return this._failResult('无法移动');
    return {
      success: true,
      stateUpdates: { currentNodeId: this._currentNodeId, currentAp: this._currentAp, encounter: result.encounter, treasure: result.treasure },
      narrativeConstraint: '<叙事>你移动到了新的位置</叙事>',
      keyStep: !!result.encounter?.triggered,
      sideEffects: [],
    };
  }

  private _handleExplore(): ActionResult {
    return this.explore();
  }

  private _handleRest(): ActionResult {
    return this.rest();
  }

  private _handleInitMap(payload: { nodes: MapNode[]; paths: Array<{ from: string; to: string; actionCost: number; description?: string }> }): ActionResult {
    this.initMap(payload.nodes, payload.paths);
    return { success: true, stateUpdates: {}, narrativeConstraint: '', keyStep: false, sideEffects: [] };
  }

  private _revealAdjacent(nodeId: string): void {
    const adjacent = this._graph.getAdjacentNodes(nodeId);
    for (const { node } of adjacent) {
      if (node.fowState === 'hidden') {
        this._graph.revealNode(node.id);
      }
    }
  }

  private _failResult(message: string): ActionResult {
    return { success: false, stateUpdates: {}, narrativeConstraint: message, keyStep: false, sideEffects: [] };
  }

  private _pushEvent(type: string, description: string, payload: Record<string, unknown>): void {
    this.enqueueEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      engineType: this.getEngineType(),
      type,
      description,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    });
  }
}

export function createExplorationEngine(config?: ExplorationEngineConfig): ExplorationEngine {
  return new ExplorationEngine(config);
}
