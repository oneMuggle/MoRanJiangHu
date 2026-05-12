/**
 * BoardGame 游戏循环
 *
 * 基于 setTimeout 的游戏循环，支持暂停、恢复、速度控制。
 * 每个 tick 推进 BoardGameEngine 一个回合，并触发叙事约束更新。
 */

import type { BoardGameEngine } from './boardGameEngine';
import type { TurnResult, PlayerAction, ActionResult } from '../engine/types';

export type GameLoopState = 'idle' | 'running' | 'paused' | 'waiting-input' | 'ended';

export interface GameLoopConfig {
  /** 每 tick 间隔（ms），默认 2000 */
  tickInterval: number;
  /** 最大回合数，达到后自动结束 */
  maxTurns: number;
  /** 是否在 keyStep 后暂停等待输入 */
  pauseOnKeyStep: boolean;
}

const DEFAULT_CONFIG: GameLoopConfig = {
  tickInterval: 2000,
  maxTurns: 24,
  pauseOnKeyStep: true,
};

export interface GameLoopCallbacks {
  /** 回合推进时调用 */
  onTurnAdvance?: (result: TurnResult) => void;
  /** 玩家操作结算后调用 */
  onActionResolved?: (action: PlayerAction, result: ActionResult) => void;
  /** 状态变化时调用 */
  onStateChange?: (state: GameLoopState) => void;
  /** 需要玩家输入时调用 */
  onInputRequired?: () => void;
}

export class BoardGameLoop {
  private _engine: BoardGameEngine;
  private _config: GameLoopConfig;
  private _callbacks: GameLoopCallbacks;
  private _state: GameLoopState = 'idle';
  private _timerId: ReturnType<typeof setTimeout> | null = null;
  private _pendingAction: PlayerAction | null = null;

  constructor(
    engine: BoardGameEngine,
    config: Partial<GameLoopConfig> = {},
    callbacks: GameLoopCallbacks = {},
  ) {
    this._engine = engine;
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._callbacks = callbacks;
  }

  /** 开始游戏循环 */
  start(): void {
    if (this._state === 'running') return;
    this._setState('running');
    this._scheduleTick();
  }

  /** 暂停游戏循环 */
  pause(): void {
    if (this._state !== 'running') return;
    this._clearTimer();
    this._setState('paused');
  }

  /** 恢复游戏循环 */
  resume(): void {
    if (this._state !== 'paused') return;
    this._setState('running');
    this._scheduleTick();
  }

  /** 停止游戏循环 */
  stop(): void {
    this._clearTimer();
    this._setState('ended');
  }

  /** 提交玩家操作 */
  submitAction(action: PlayerAction): void {
    this._pendingAction = action;
    if (this._state === 'waiting-input') {
      this._processPendingAction();
    }
  }

  /** 获取当前状态 */
  get state(): GameLoopState {
    return this._state;
  }

  /** 获取引擎引用 */
  get engine(): BoardGameEngine {
    return this._engine;
  }

  /** 更新配置 */
  updateConfig(config: Partial<GameLoopConfig>): void {
    this._config = { ...this._config, ...config };
  }

  private _scheduleTick(): void {
    if (this._state !== 'running') return;
    this._timerId = setTimeout(() => {
      this._tick();
    }, this._config.tickInterval);
  }

  private _tick(): void {
    if (this._state !== 'running') return;

    const snapshot = this._engine.getSnapshot();
    const currentTurn = snapshot.engineStates.boardGame.currentTurn as number;
    if (currentTurn >= this._config.maxTurns) {
      this._setState('ended');
      return;
    }

    const turnResult = this._engine.advanceTurn();
    this._callbacks.onTurnAdvance?.(turnResult);

    if (this._config.pauseOnKeyStep && this._engine.getNarrativeConstraints().keyStep) {
      this._setState('waiting-input');
      this._callbacks.onInputRequired?.();
      return;
    }

    this._scheduleTick();
  }

  private _processPendingAction(): void {
    if (!this._pendingAction) return;

    const action = this._pendingAction;
    this._pendingAction = null;

    const result = this._engine.executePlayerAction(action);
    this._callbacks.onActionResolved?.(action, result);

    if (this._state === 'waiting-input') {
      this._setState('running');
      this._scheduleTick();
    }
  }

  private _setState(newState: GameLoopState): void {
    if (this._state === newState) return;
    this._state = newState;
    this._callbacks.onStateChange?.(newState);
  }

  private _clearTimer(): void {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }
}

/**
 * 工厂函数：创建并返回一个配置好的游戏循环实例。
 */
export function createBoardGameLoop(
  engine: BoardGameEngine,
  config?: Partial<GameLoopConfig>,
  callbacks?: GameLoopCallbacks,
): BoardGameLoop {
  return new BoardGameLoop(engine, config, callbacks);
}
