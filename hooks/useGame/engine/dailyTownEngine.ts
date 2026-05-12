/**
 * dailyTownEngine.ts
 *
 * 日常城镇地图引擎 — 管理城镇区域移动、行动力消耗、时段推进、NPC 会面和动态事件。
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
import type { RegionNode, TimeSlot } from '../../../models/dailyTown/regionNode';
import type { NpcSchedule, NpcLocation } from '../../../models/dailyTown/npcSchedule';
import { TownGraph, createTownGraph } from '../dailytown/townGraph';
import { ActionPointManager, createActionPointManager } from '../dailytown/actionPointManager';
import { TimeOfDayManager, createTimeOfDayManager } from '../dailytown/timeOfDayManager';
import { NpcScheduleManager, createNpcScheduleManager } from '../dailytown/npcScheduleManager';
import {
  DynamicEventTrigger,
  createDynamicEventTrigger,
  type DynamicEvent,
  type DynamicEventTemplate,
} from '../dailytown/dynamicEventTrigger';

export interface DailyTownState {
  currentRegionId: string | null;
  apState: ReturnType<ActionPointManager['getState']>;
  timeState: ReturnType<TimeOfDayManager['getState']>;
  graphNodes: RegionNode[];
  lastMoveResult: MoveResult | null;
  lastDynamicEvent: DynamicEvent | null;
}

export interface MoveResult {
  success: boolean;
  targetRegionId: string;
  apSpent: number;
  timeSlotChanged: boolean;
  newTimeSlot: TimeSlot | null;
  npcsInRegion: NpcLocation[];
  dynamicEvent: DynamicEvent | null;
  reason?: string;
}

const DEFAULT_TEMPLATES: DynamicEventTemplate[] = [
  {
    type: 'random_npc_greeting',
    descriptions: [
      '一个路过的熟识 NPC 向你点头致意',
      '一个陌生的旅人好奇地打量着你',
      '街边的小贩热情地招呼你',
    ],
    weight: 4,
  },
  {
    type: 'limited_discount',
    descriptions: [
      '武器铺今日限时折扣——全场八折',
      '药铺老板正在清理库存，价格减半',
      '市集上出现了一位慷慨的商人',
    ],
    weight: 2,
    payloadTemplate: { discount: 0.8 },
  },
  {
    type: 'special_guest',
    descriptions: [
      '一个蒙面人坐在客栈角落等你',
      '一位游吟诗人在广场中央弹奏',
      '有位神秘商人在市集兜售稀有物品',
    ],
    weight: 2,
  },
  {
    type: 'weather_change',
    descriptions: [
      '天空突然下起了细雨',
      '一阵凉风吹过，似乎要变天了',
      '阳光穿透云层，洒在石板路上',
    ],
    weight: 2,
  },
];

export class DailyTownEngine extends BaseEngine {
  private _graph: TownGraph;
  private _apManager: ActionPointManager;
  private _timeManager: TimeOfDayManager;
  private _npcManager: NpcScheduleManager;
  private _eventTrigger: DynamicEventTrigger;
  private _currentRegionId: string | null = null;
  private _turnNumber = 0;
  private _lastMoveResult: MoveResult | null = null;
  private _lastDynamicEvent: DynamicEvent | null = null;

  constructor(config?: {
    maxActionPoints?: number;
    movesPerTimeSlot?: number;
    nodes?: RegionNode[];
    schedules?: NpcSchedule[];
    eventTemplates?: DynamicEventTemplate[];
    triggerRate?: number;
    rng?: () => number;
  }) {
    super('dailyTown' as EngineType);

    const templates = config?.eventTemplates ?? DEFAULT_TEMPLATES;
    this._graph = createTownGraph(config?.nodes);
    this._apManager = createActionPointManager(config?.maxActionPoints);
    this._timeManager = createTimeOfDayManager(config?.movesPerTimeSlot);
    this._npcManager = createNpcScheduleManager(config?.schedules);
    this._eventTrigger = createDynamicEventTrigger(templates, config?.triggerRate);
  }

  // ==================== 公开 getter ====================

  get currentRegionId(): string | null {
    return this._currentRegionId;
  }

  get turnNumber(): number {
    return this._turnNumber;
  }

  get graph(): TownGraph {
    return this._graph;
  }

  get apManager(): ActionPointManager {
    return this._apManager;
  }

  get timeManager(): TimeOfDayManager {
    return this._timeManager;
  }

  get npcManager(): NpcScheduleManager {
    return this._npcManager;
  }

  get eventTrigger(): DynamicEventTrigger {
    return this._eventTrigger;
  }

  get lastMoveResult(): MoveResult | null {
    return this._lastMoveResult;
  }

  // ==================== 核心操作 ====================

  /**
   * 移动到目标区域
   */
  moveToRegion(targetRegionId: string): MoveResult {
    const fromId = this._currentRegionId;

    if (fromId === null) {
      const node = this._graph.getNode(targetRegionId);
      if (!node) {
        return this._makeFailResult(targetRegionId, '目标区域不存在');
      }
      this._currentRegionId = targetRegionId;
      this._graph.markVisited(targetRegionId, this._turnNumber);
      this._timeManager.recordMove();
      const npcs = this._npcManager.getNpcsInRegion(
        targetRegionId,
        this._timeManager.currentTimeSlot
      );
      return {
        success: true,
        targetRegionId,
        apSpent: 0,
        timeSlotChanged: false,
        newTimeSlot: null,
        npcsInRegion: npcs,
        dynamicEvent: null,
      };
    }

    if (fromId === targetRegionId) {
      return this._makeFailResult(targetRegionId, '已在当前区域');
    }

    if (!this._graph.isReachable(fromId, targetRegionId)) {
      return this._makeFailResult(targetRegionId, '目标区域不可达');
    }

    const targetNode = this._graph.getNode(targetRegionId);
    if (!targetNode) {
      return this._makeFailResult(targetRegionId, '目标区域不存在');
    }

    if (!this._graph.isAvailableAtTime(targetRegionId, this._timeManager.currentTimeSlot)) {
      return this._makeFailResult(targetRegionId, '该区域当前时段未开放');
    }

    const cost = this._graph.getMoveCost(fromId, targetRegionId);
    if (!this._apManager.canSpend(cost)) {
      return this._makeFailResult(targetRegionId, '行动力不足');
    }

    this._apManager.spend(cost);
    const changedSlot = this._timeManager.recordMove();

    this._currentRegionId = targetRegionId;
    this._graph.markVisited(targetRegionId, this._turnNumber);

    const npcs = this._npcManager.getNpcsInRegion(
      targetRegionId,
      this._timeManager.currentTimeSlot
    );

    let dynamicEvent: DynamicEvent | null = null;
    if (changedSlot === null) {
      dynamicEvent = this._eventTrigger.rollEvent();
    }

    this._lastDynamicEvent = dynamicEvent;

    const result: MoveResult = {
      success: true,
      targetRegionId,
      apSpent: cost,
      timeSlotChanged: changedSlot !== null,
      newTimeSlot: changedSlot,
      npcsInRegion: npcs,
      dynamicEvent,
    };

    this._lastMoveResult = result;

    this._publishMoveEvent(result);

    return result;
  }

  /**
   * 进入指定区域（不消耗行动力，用于初始化或强制传送）
   */
  enterRegion(regionId: string): MoveResult {
    const node = this._graph.getNode(regionId);
    if (!node) {
      return this._makeFailResult(regionId, '目标区域不存在');
    }

    this._currentRegionId = regionId;
    this._graph.markVisited(regionId, this._turnNumber);

    const npcs = this._npcManager.getNpcsInRegion(
      regionId,
      this._timeManager.currentTimeSlot
    );

    return {
      success: true,
      targetRegionId: regionId,
      apSpent: 0,
      timeSlotChanged: false,
      newTimeSlot: null,
      npcsInRegion: npcs,
      dynamicEvent: null,
    };
  }

  /**
   * 推进到下一天
   */
  advanceDay(): void {
    this._apManager.advanceDay();
    this._timeManager.reset();
    this._turnNumber++;

    this._publishEvent('DAY_ADVANCE', `新的一天开始 (第${this._apManager.day}天)`);
  }

  /**
   * 休息（恢复所有行动力但不推进天数）
   */
  rest(): void {
    this._apManager.refill();
    this._publishEvent('REST', '休息恢复了所有行动力');
  }

  /**
   * 获取当前区域内的 NPC 列表
   */
  getCurrentNpcs(): NpcLocation[] {
    if (!this._currentRegionId) return [];
    return this._npcManager.getNpcsInRegion(
      this._currentRegionId,
      this._timeManager.currentTimeSlot
    );
  }

  /**
   * 获取可到达的区域列表
   */
  getReachableRegions(): RegionNode[] {
    if (!this._currentRegionId) return this._graph.getAllNodes();
    return this._graph.getConnectedRegions(this._currentRegionId).filter((node) =>
      this._graph.isAvailableAtTime(node.id, this._timeManager.currentTimeSlot)
    );
  }

  /**
   * 获取当前区域信息
   */
  getCurrentRegion(): RegionNode | undefined {
    if (!this._currentRegionId) return undefined;
    return this._graph.getNode(this._currentRegionId);
  }

  getState(): DailyTownState {
    return {
      currentRegionId: this._currentRegionId,
      apState: this._apManager.getState(),
      timeState: this._timeManager.getState(),
      graphNodes: this._graph.getAllNodes(),
      lastMoveResult: this._lastMoveResult,
      lastDynamicEvent: this._lastDynamicEvent,
    };
  }

  // ==================== SLGEngine 接口实现 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;

    if (this._timeManager.movesRemaining === 0) {
      this._apManager.advanceDay();
      this._timeManager.reset();
    }

    const events = this.resolvePendingEvents();

    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: events.map((e) => e.event),
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    if (action.type === 'move') {
      const targetId = action.payload.targetRegionId as string | undefined;
      if (!targetId) {
        return this._failResult('缺少目标区域参数');
      }
      const result = this.moveToRegion(targetId);
      if (!result.success) {
        return this._failResult(result.reason ?? '移动失败');
      }
      return {
        success: true,
        stateUpdates: { currentRegionId: result.targetRegionId },
        narrativeConstraint: this._buildMoveNarrative(result),
        keyStep: result.timeSlotChanged,
        sideEffects: [],
      };
    }

    if (action.type === 'rest') {
      this.rest();
      return {
        success: true,
        stateUpdates: { ap: this._apManager.current },
        narrativeConstraint: '<叙事>你找了一处安静的地方休息，恢复了精力</叙事>',
        keyStep: false,
        sideEffects: [],
      };
    }

    if (action.type === 'advanceDay') {
      this.advanceDay();
      return {
        success: true,
        stateUpdates: {
          day: this._apManager.day,
          timeSlot: this._timeManager.currentTimeSlot,
        },
        narrativeConstraint: `<叙事>新的一天开始了，这是第${this._apManager.day}天</叙事>`,
        keyStep: true,
        sideEffects: [],
      };
    }

    return this._failResult(`不支持的操作: ${action.type}`);
  }

  canExecuteAction(action: PlayerAction): boolean {
    if (action.type === 'move') {
      const targetId = action.payload.targetRegionId as string | undefined;
      if (!targetId || !this._currentRegionId) return false;
      return this._graph.isReachable(this._currentRegionId, targetId);
    }
    if (action.type === 'rest') return true;
    if (action.type === 'advanceDay') return true;
    return false;
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        dailyTown: this.getState() as unknown as Record<string, unknown>,
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const currentRegion = this.getCurrentRegion();
    const regionName = currentRegion?.name ?? '未进入任何区域';
    const timeSlot = this._timeManager.currentTimeSlot;

    let scene = `${timeSlot}，${regionName}`;
    const npcs = this.getCurrentNpcs();
    if (npcs.length > 0) {
      scene += `，${npcs.map((n) => `${n.name}(${n.activity})`).join('、')}也在`;
    }

    if (this._lastDynamicEvent) {
      scene += `。${this._lastDynamicEvent.description}`;
    }

    return {
      scene,
      turn: this._turnNumber,
      tension: 0,
      playerAction: `日常城镇移动 — ${regionName}`,
      keyStep: false,
      nsfwTriggered: false,
      participants: npcs.map((n) => ({
        id: n.npcId,
        name: n.name,
        status: n.activity,
      })),
      nextEvent: '等待玩家选择移动或交互',
    };
  }

  reset(): void {
    this._currentRegionId = null;
    this._turnNumber = 0;
    this._lastMoveResult = null;
    this._lastDynamicEvent = null;
    this._apManager = createActionPointManager(this._apManager.max);
    this._timeManager = createTimeOfDayManager(this._timeManager.movesPerSlot);
    this._pendingEvents = [];
  }

  // ==================== 内部辅助 ====================

  private _makeFailResult(targetRegionId: string, reason: string): MoveResult {
    return {
      success: false,
      targetRegionId,
      apSpent: 0,
      timeSlotChanged: false,
      newTimeSlot: null,
      npcsInRegion: [],
      dynamicEvent: null,
      reason,
    };
  }

  private _failResult(reason: string): ActionResult {
    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: `<错误>${reason}</错误>`,
      keyStep: false,
      sideEffects: [],
    };
  }

  private _buildMoveNarrative(result: MoveResult): string {
    const node = this._graph.getNode(result.targetRegionId);
    const regionName = node?.name ?? result.targetRegionId;

    let text = `你来到了${regionName}`;
    if (result.timeSlotChanged && result.newTimeSlot) {
      text += `。不知不觉间已是${result.newTimeSlot}`;
    }
    if (result.npcsInRegion.length > 0) {
      text += `，这里${result.npcsInRegion.map((n) => n.name).join('、')}也在`;
    }
    if (result.dynamicEvent) {
      text += `。${result.dynamicEvent.description}`;
    }
    return `<叙事>${text}</叙事>`;
  }

  private _publishEvent(type: string, description: string): void {
    const event: GameEvent = {
      id: `dailyTown-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      engineType: 'dailyTown' as EngineType,
      type,
      description,
      status: 'pending',
      payload: { turnNumber: this._turnNumber },
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }

  private _publishMoveEvent(result: MoveResult): void {
    const node = this._graph.getNode(result.targetRegionId);
    const regionName = node?.name ?? result.targetRegionId;
    const payload: Record<string, unknown> = {
      targetRegionId: result.targetRegionId,
      regionName,
      apSpent: result.apSpent,
      apRemaining: this._apManager.current,
      timeSlot: this._timeManager.currentTimeSlot,
      timeSlotChanged: result.timeSlotChanged,
      npcCount: result.npcsInRegion.length,
    };

    if (result.dynamicEvent) {
      payload.dynamicEventType = result.dynamicEvent.type;
    }

    const event: GameEvent = {
      id: `dailyTown-move-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      engineType: 'dailyTown' as EngineType,
      type: 'REGION_MOVE',
      description: `移动到${regionName}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }
}

export function createDailyTownEngine(config?: {
  maxActionPoints?: number;
  movesPerTimeSlot?: number;
  nodes?: RegionNode[];
  schedules?: NpcSchedule[];
  eventTemplates?: DynamicEventTemplate[];
  triggerRate?: number;
  rng?: () => number;
}): DailyTownEngine {
  return new DailyTownEngine(config);
}
