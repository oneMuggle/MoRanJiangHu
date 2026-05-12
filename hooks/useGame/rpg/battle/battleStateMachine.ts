/**
 * battleStateMachine.ts
 *
 * 战斗状态机 — 管理回合制战斗的阶段转换
 *
 * 状态流转:
 * IDLE → INIT → INITIATIVE → TURN_START → ACTION_SELECT → ACTION_EXECUTE
 * → DAMAGE → BUFF_RESOLVE → TURN_END → CHECK_WIN → (WIN|LOSE|DRAW) → END
 * → (loop back to TURN_START for next round)
 */

export type BattlePhase =
  | 'idle'
  | 'init'
  | 'initiative'
  | 'turn_start'
  | 'action_select'
  | 'action_execute'
  | 'damage'
  | 'buff_resolve'
  | 'turn_end'
  | 'check_win'
  | 'end';

export interface BattleState {
  phase: BattlePhase;
  round: number;
  currentActorIndex: number; // index in the combined actor list (sorted by initiative)
  selectedAction: string | null;
  actionTarget: string | null; // target actor ID
  winner: string | null; // 'player' | 'enemy' | 'draw'
}

export class BattleStateMachine {
  private _state: BattleState;

  constructor() {
    this._state = this._initialState();
  }

  get state(): BattleState {
    return { ...this._state };
  }

  get phase(): BattlePhase {
    return this._state.phase;
  }

  get round(): number {
    return this._state.round;
  }

  get currentActorIndex(): number {
    return this._state.currentActorIndex;
  }

  /**
   * 开始战斗 — IDLE → INIT → INITIATIVE
   */
  start(): void {
    this._transition('init');
    this._transition('initiative');
  }

  /**
   * 先攻确定后 → TURN_START
   */
  onInitiativeResolved(): void {
    this._assertPhase('initiative');
    this._state.round = 1;
    this._state.currentActorIndex = 0;
    this._transition('turn_start');
  }

  /**
   * 回合开始 → ACTION_SELECT
   */
  onTurnStart(): void {
    this._assertPhase('turn_start');
    this._transition('action_select');
  }

  /**
   * 行动选择完成 → ACTION_EXECUTE
   */
  onActionSelected(action: string, targetId: string): void {
    this._assertPhase('action_select');
    this._state.selectedAction = action;
    this._state.actionTarget = targetId;
    this._transition('action_execute');
  }

  /**
   * 行动执行完毕 → DAMAGE
   */
  onActionExecuted(): void {
    this._assertPhase('action_execute');
    this._transition('damage');
  }

  /**
   * 伤害计算完毕 → BUFF_RESOLVE
   */
  onDamageCalculated(): void {
    this._assertPhase('damage');
    this._transition('buff_resolve');
  }

  /**
   * Buff 结算完毕 → TURN_END
   */
  onBuffResolved(): void {
    this._assertPhase('buff_resolve');
    this._state.selectedAction = null;
    this._state.actionTarget = null;
    this._transition('turn_end');
  }

  /**
   * 回合结束 → CHECK_WIN
   */
  onTurnEnd(): void {
    this._assertPhase('turn_end');
    this._state.currentActorIndex++;
    this._transition('check_win');
  }

  /**
   * 胜负检查 — 若无胜负，继续下一行动者或下一回合
   */
  onWinCheck(totalActors: number): BattlePhase {
    this._assertPhase('check_win');

    if (this._state.currentActorIndex >= totalActors) {
      // 所有行动者行动完毕，进入下一回合
      this._state.round++;
      this._state.currentActorIndex = 0;
      this._transition('turn_start');
    } else {
      // 下一个行动者
      this._transition('turn_start');
    }

    return this._state.phase;
  }

  /**
   * 战斗结束 — 任意状态 → END
   */
  end(winner: 'player' | 'enemy' | 'draw'): void {
    this._state.winner = winner;
    this._transition('end');
  }

  /**
   * 重置状态机
   */
  reset(): void {
    this._state = this._initialState();
  }

  private _transition(to: BattlePhase): void {
    this._state.phase = to;
  }

  private _assertPhase(expected: BattlePhase): void {
    if (this._state.phase !== expected) {
      throw new Error(
        `Invalid phase transition: expected "${expected}", got "${this._state.phase}"`,
      );
    }
  }

  private _initialState(): BattleState {
    return {
      phase: 'idle',
      round: 0,
      currentActorIndex: -1,
      selectedAction: null,
      actionTarget: null,
      winner: null,
    };
  }
}
