/**
 * SLG + AI 混合架构 — 全局回合管理器
 *
 * 基于 EngineRegistry 的全局回合调度，支持：
 * - 优先级调度（高/中/低）
 * - Tick-based 定时推进
 * - 跨引擎事件聚合
 * - Web Worker 迁移准备（纯逻辑，无 DOM 依赖）
 */

import type {
  EngineType,
  TurnResult,
  GameEvent,
  PauseReason,
  StateChange,
  SLGEngine,
  PlayerAction,
  ActionResult,
} from './types';
import { EngineRegistry } from './engineRegistry';

export interface GlobalTurnManagerConfig {
  /** 自动推进间隔（ms），0 表示禁用自动推进 */
  autoAdvanceInterval: number;
  /** 最大聚合事件数（超过此数量时分批处理） */
  maxBatchSize: number;
}

export const DEFAULT_GLOBAL_TURN_CONFIG: GlobalTurnManagerConfig = {
  autoAdvanceInterval: 0,
  maxBatchSize: 50,
};

export class GlobalTurnManager {
  private _registry: EngineRegistry;
  private _currentTurn = 0;
  private _paused = false;
  private _pauseReason: PauseReason | null = null;
  private _globalEvents: GameEvent[] = [];
  private _turnHistory: TurnResult[] = [];
  private _maxHistoryLength = 100;
  private _autoAdvanceTimer: ReturnType<typeof setInterval> | null = null;
  private _config: GlobalTurnManagerConfig;

  constructor(config?: Partial<GlobalTurnManagerConfig>) {
    this._registry = new EngineRegistry();
    this._config = { ...DEFAULT_GLOBAL_TURN_CONFIG, ...config };
  }

  // ==================== 引擎管理 ====================

  /**
   * 获取底层引擎注册表。
   */
  get registry(): EngineRegistry {
    return this._registry;
  }

  /**
   * 注册引擎。
   */
  registerEngine(engine: SLGEngine): void {
    this._registry.register(engine);
  }

  /**
   * 注销引擎。
   */
  unregisterEngine(type: EngineType): boolean {
    return this._registry.unregister(type);
  }

  // ==================== 回合推进 ====================

  /**
   * 推进全局回合。
   *
   * 流程：
   * 1. 回合号 +1
   * 2. 按优先级推进各活跃引擎
   * 3. 聚合全局事件
   * 4. 记录回合历史
   */
  advanceTurn(): TurnResult {
    if (this._paused) {
      return this._emptyTurnResult();
    }

    this._currentTurn++;

    const eventsTriggered: GameEvent[] = [];
    const stateChanges: StateChange[] = [];

    // 按优先级推进各引擎
    const engines = this._registry.getByPriority();
    for (const engine of engines) {
      const meta = this._registry.getMetadata(engine.getEngineType());
      if (!meta?.isActive || engine.isPaused()) continue;

      const result = engine.advanceTurn();
      eventsTriggered.push(...result.eventsTriggered);
      stateChanges.push(...result.stateChanges);
    }

    // 聚合全局事件
    const batchedEvents = this._batchEvents(eventsTriggered);
    batchedEvents.push(...this._drainGlobalEvents());

    const turnResult: TurnResult = {
      turnNumber: this._currentTurn,
      phase: 'transition',
      eventsTriggered: batchedEvents,
      stateChanges,
    };

    this._recordTurn(turnResult);
    return turnResult;
  }

  /**
   * 仅执行玩家操作，不推进回合。
   */
  executeAction(action: PlayerAction): ActionResult {
    const engine = this._registry.get(action.engineType);
    if (!engine) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `引擎 ${action.engineType} 未注册`,
        keyStep: false,
        sideEffects: [],
      };
    }

    if (!engine.canExecuteAction(action)) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `操作 ${action.type} 在当前状态下不可执行`,
        keyStep: false,
        sideEffects: [],
      };
    }

    return engine.executePlayerAction(action);
  }

  // ==================== 暂停/恢复 ====================

  pause(reason: PauseReason): void {
    this._paused = true;
    this._pauseReason = reason;
    this._stopAutoAdvance();

    for (const engine of this._registry.getAll()) {
      if (!engine.isPaused()) {
        engine.pause(reason);
      }
    }
  }

  resume(): void {
    this._paused = false;
    this._pauseReason = null;

    for (const engine of this._registry.getAll()) {
      engine.resume();
    }

    this._startAutoAdvance();
  }

  isPaused(): boolean {
    return this._paused;
  }

  // ==================== 全局事件 ====================

  addGlobalEvent(event: GameEvent): void {
    this._globalEvents.push(event);
  }

  get pendingGlobalEvents(): GameEvent[] {
    return [...this._globalEvents];
  }

  // ==================== Tick 定时推进 ====================

  /**
   * 启动自动推进（tick-based）。
   */
  startAutoAdvance(): void {
    this._config.autoAdvanceInterval = this._config.autoAdvanceInterval || 5000;
    this._startAutoAdvance();
  }

  /**
   * 停止自动推进。
   */
  stopAutoAdvance(): void {
    this._stopAutoAdvance();
  }

  // ==================== 查询 ====================

  /**
   * 获取当前回合号。
   */
  get currentTurn(): number {
    return this._currentTurn;
  }

  /**
   * 获取最近 N 个回合的历史。
   */
  getTurnHistory(limit: number = 10): TurnResult[] {
    return this._turnHistory.slice(-limit);
  }

  /**
   * 获取管理器快照。
   */
  getSnapshot() {
    return {
      currentTurn: this._currentTurn,
      paused: this._paused,
      pauseReason: this._pauseReason,
      activeEngines: this._registry.activeCount,
      registeredEngines: this._registry.registeredTypes,
      pendingGlobalEvents: this._globalEvents.length,
    };
  }

  // ==================== 内部方法 ====================

  private _startAutoAdvance(): void {
    this._stopAutoAdvance();

    if (this._config.autoAdvanceInterval > 0) {
      this._autoAdvanceTimer = setInterval(() => {
        if (!this._paused) {
          this.advanceTurn();
        }
      }, this._config.autoAdvanceInterval);
    }
  }

  private _stopAutoAdvance(): void {
    if (this._autoAdvanceTimer) {
      clearInterval(this._autoAdvanceTimer);
      this._autoAdvanceTimer = null;
    }
  }

  private _batchEvents(events: GameEvent[]): GameEvent[] {
    if (events.length <= this._config.maxBatchSize) return events;

    const batches: GameEvent[] = [];
    for (let i = 0; i < events.length; i += this._config.maxBatchSize) {
      const batch = events.slice(i, i + this._config.maxBatchSize);
      batches.push({
        id: `batch-${this._currentTurn}-${Math.floor(i / this._config.maxBatchSize)}`,
        engineType: 'global',
        type: 'EVENT_BATCH',
        description: `聚合 ${batch.length} 个事件`,
        status: 'resolved',
        payload: { batchCount: batch.length },
        createdAt: Date.now(),
        resolvedAt: Date.now(),
      });
    }

    return batches;
  }

  private _drainGlobalEvents(): GameEvent[] {
    const events = [...this._globalEvents];
    this._globalEvents = [];
    return events;
  }

  private _recordTurn(result: TurnResult): void {
    this._turnHistory.push(result);
    if (this._turnHistory.length > this._maxHistoryLength) {
      this._turnHistory = this._turnHistory.slice(-this._maxHistoryLength);
    }
  }

  private _emptyTurnResult(): TurnResult {
    return {
      turnNumber: this._currentTurn,
      phase: 'transition',
      eventsTriggered: [],
      stateChanges: [],
    };
  }
}

export function createGlobalTurnManager(config?: Partial<GlobalTurnManagerConfig>): GlobalTurnManager {
  return new GlobalTurnManager(config);
}
