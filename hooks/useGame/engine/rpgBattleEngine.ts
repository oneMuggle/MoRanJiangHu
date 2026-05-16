/**
 * rpgBattleEngine.ts
 *
 * RPG 战斗引擎 — 管理回合制战斗全流程
 * 整合 damageCalculator、initiativeCalculator、skillResolver、buffManager、battleStateMachine
 */

import { BaseEngine } from './baseEngine';
import type {
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  EngineType,
} from './types';
import type { 角色数据结构 } from '../../../models/character';
import type { 功法结构 } from '../../../models/kungfu';
import type { 游戏物品 } from '../../../models/item';
import type { 战斗敌方信息 } from '../../../models/battle';
import {
  calculateCombatStats,
  calculateDamage,
  calculateSkillDamage,
  getBodyPartMultiplier,
  type CombatStats,
} from '../rpg/battle/damageCalculator';
import {
  calculateInitiative,
  type InitiativeActor,
} from '../rpg/battle/initiativeCalculator';
import {
  resolveSkill,
  consumeResource,
  tickCooldowns,
  setCooldown,
} from '../rpg/battle/skillResolver';
import {
  BuffManager,
} from '../rpg/battle/buffManager';
import {
  BattleStateMachine,
  type BattlePhase,
} from '../rpg/battle/battleStateMachine';

// ==================== 类型定义 ====================

/** 统一战斗角色 — 玩家用 character，敌人用 enemy */
export interface BattleActor {
  id: string;
  name: string;
  side: 'player' | 'enemy';
  /** 玩家角色数据（仅 player 侧） */
  character?: 角色数据结构;
  /** 敌人数据（仅 enemy 侧） */
  enemy?: 战斗敌方信息;
  /** 装备（仅 player 侧） */
  equipment?: Record<string, 游戏物品 | undefined>;
  /** 功法列表 */
  kungfuList?: 功法结构[];
}

export interface BattleLogEntry {
  round: number;
  actorId: string;
  action: string;
  targetId?: string;
  damage?: number;
  isCrit?: boolean;
  isDodge?: boolean;
  detail?: string;
}

export interface BattleSnapshot {
  phase: BattlePhase;
  round: number;
  actors: Array<{
    id: string;
    name: string;
    side: 'player' | 'enemy';
    currentHP: number;
    maxHP: number;
    isAlive: boolean;
  }>;
  currentActorId: string | null;
  cooldowns: Record<string, Record<string, number>>;
  buffs: Record<string, string[]>;
  log: BattleLogEntry[];
}

export interface BattleOutcome {
  winner: 'player' | 'enemy' | 'draw';
  rounds: number;
  log: BattleLogEntry[];
}

// ==================== RpgBattleEngine ====================

export class RpgBattleEngine extends BaseEngine {
  private _turnNumber = 0;
  private _stateMachine: BattleStateMachine;
  private _buffManager: BuffManager;
  private _actors: BattleActor[] = [];
  private _orderedActors: InitiativeActor[] = [];
  private _cooldowns: Map<string, Map<string, number>> = new Map();
  private _hp: Map<string, number> = new Map();
  private _maxHp: Map<string, number> = new Map();
  private _combatStats: Map<string, CombatStats> = new Map();
  private _log: BattleLogEntry[] = [];
  private _outcome: BattleOutcome | null = null;
  private _rng: () => number;

  constructor(rng?: () => number) {
    super('rpgBattle' as EngineType);
    this._stateMachine = new BattleStateMachine();
    this._buffManager = new BuffManager();
    this._rng = rng ?? Math.random;
  }

  // ==================== 公开属性 ====================

  get phase(): BattlePhase {
    return this._stateMachine.phase;
  }

  get isActive(): boolean {
    return this._stateMachine.phase !== 'idle' && this._stateMachine.phase !== 'end';
  }

  get round(): number {
    return this._stateMachine.round;
  }

  // ==================== 战斗生命周期 ====================

  /**
   * 初始化战斗
   */
  initBattle(actors: BattleActor[]): void {
    if (actors.length < 2) return;

    this._actors = actors;
    this._log = [];
    this._outcome = null;

    for (const actor of this._actors) {
      let stats: CombatStats;
      let maxHP: number;
      let currentHP: number;

      if (actor.side === 'player' && actor.character) {
        stats = calculateCombatStats(actor.character, actor.equipment ?? {});
        maxHP = stats.最大血量;
        const totalBodyHP = this._getTotalBodyHP(actor.character);
        const hpRatio = totalBodyHP > 0 ? totalBodyHP / maxHP : 1;
        currentHP = Math.round(maxHP * Math.min(hpRatio, 1));
      } else if (actor.side === 'enemy' && actor.enemy) {
        maxHP = actor.enemy.最大血量;
        currentHP = actor.enemy.当前血量;
        stats = {
          攻击力: actor.enemy.战斗力,
          防御力: actor.enemy.防御力,
          速度: 10,
          暴击率: 0.05,
          闪避率: 0.03,
          最大血量: maxHP,
        };
      } else {
        maxHP = 100;
        currentHP = 100;
        stats = {
          攻击力: 10,
          防御力: 5,
          速度: 10,
          暴击率: 0.05,
          闪避率: 0.03,
          最大血量: maxHP,
        };
      }

      this._combatStats.set(actor.id, stats);
      this._maxHp.set(actor.id, maxHP);
      this._hp.set(actor.id, currentHP);
      this._cooldowns.set(actor.id, new Map());
    }

    // 先攻判定
    const initiativeActors: InitiativeActor[] = this._actors.map((actor) => ({
      id: actor.id,
      side: actor.side,
      stats: this._combatStats.get(actor.id)!,
    }));
    this._orderedActors = calculateInitiative(initiativeActors, this._rng);

    // 状态机推进到 turn_start
    this._stateMachine.start();
    this._stateMachine.onInitiativeResolved();

    this._turnNumber = 1;

    this._publishBattleEvent('BATTLE_START', {
      actorCount: this._actors.length,
      order: this._orderedActors.map((a) => a.id),
    });
  }

  /**
   * 获取当前行动者
   */
  getCurrentActor(): BattleActor | null {
    const index = this._stateMachine.currentActorIndex;
    if (index < 0 || index >= this._orderedActors.length) return null;
    const actorId = this._orderedActors[index].id;
    return this._actors.find((a) => a.id === actorId) ?? null;
  }

  /**
   * 获取玩家战斗属性
   */
  getPlayerStats(): CombatStats | null {
    const player = this._actors.find((a) => a.side === 'player');
    if (!player) return null;
    return this._combatStats.get(player.id) ?? null;
  }

  /**
   * 获取角色当前HP
   */
  getActorHP(actorId: string): { current: number; max: number } | null {
    const max = this._maxHp.get(actorId);
    if (max === undefined) return null;
    return { current: this._hp.get(actorId) ?? 0, max };
  }

  /**
   * 获取战斗日志
   */
  getBattleLog(): ReadonlyArray<BattleLogEntry> {
    return [...this._log];
  }

  /**
   * 获取战斗结果
   */
  getOutcome(): BattleOutcome | null {
    return this._outcome;
  }

  /**
   * 获取战斗快照
   */
  getBattleSnapshot(): BattleSnapshot | null {
    if (!this.isActive) return null;

    return {
      phase: this._stateMachine.phase,
      round: this._stateMachine.round,
      actors: this._actors.map((a) => ({
        id: a.id,
        name: a.name,
        side: a.side,
        currentHP: this._hp.get(a.id) ?? 0,
        maxHP: this._maxHp.get(a.id) ?? 0,
        isAlive: (this._hp.get(a.id) ?? 0) > 0,
      })),
      currentActorId:
        this._orderedActors[this._stateMachine.currentActorIndex]?.id ?? null,
      cooldowns: Object.fromEntries(
        Array.from(this._cooldowns.entries()).map(([k, v]) => [k, Object.fromEntries(v)]),
      ),
      buffs: Object.fromEntries(
        this._actors.map((a) => [
          a.id,
          this._buffManager.getBuffs(a.id).map((b) => b.name),
        ]),
      ),
      log: this._log,
    };
  }

  // ==================== SLGEngine 接口 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;

    // 更新所有冷却
    for (const [actorId, cooldowns] of this._cooldowns) {
      this._cooldowns.set(actorId, tickCooldowns(cooldowns));
    }

    if (this.isActive) {
      const totalActors = this._orderedActors.length;
      if (totalActors > 0) {
        const currentPhase = this._stateMachine.phase;

        if (currentPhase === 'turn_start') {
          // turn_start → action_select → (auto action if needed) → ... → turn_end → check_win
          this._advanceFullActorTurn(totalActors);
        } else if (currentPhase === 'action_select') {
          // 玩家还没行动，自动跳过
          const currentActor = this.getCurrentActor();
          if (currentActor && currentActor.side === 'enemy') {
            this._enemyAutoAction(currentActor);
          }
          // 推进完整个行动周期
          this._advanceFullActionCycle();
        } else if (currentPhase === 'turn_end') {
          this._stateMachine.onWinCheck(totalActors);
        } else if (currentPhase === 'check_win') {
          const nextPhase = this._stateMachine.onWinCheck(totalActors);
          if (nextPhase === 'turn_start') {
            this._stateMachine.onTurnStart();
          }
        }
      }
    }

    return {
      turnNumber: this._turnNumber,
      phase: this.isActive ? 'player-action' : 'narrative',
      eventsTriggered: this._pendingEvents.map((e) => ({ ...e })),
      stateChanges: [
        {
          key: 'battle_phase',
          before: this._stateMachine.phase,
          after: this._stateMachine.phase,
        },
      ],
    };
  }

  /**
   * 完整推进一个行动者的回合：从 turn_start 到 check_win
   */
  private _advanceFullActorTurn(totalActors: number): void {
    this._stateMachine.onTurnStart();

    // 如果是敌人行动，自动执行
    const currentActor = this.getCurrentActor();
    if (currentActor && currentActor.side === 'enemy') {
      this._enemyAutoAction(currentActor);
    }

    // 如果还在 action_select（没人行动或玩家没行动），自动跳过
    if (this._stateMachine.phase === 'action_select') {
      this._advanceFullActionCycle();
    }
    // 如果已经通过行动推进到了后续阶段，只需要做收尾
    else if (this._stateMachine.phase !== 'check_win' && this._stateMachine.phase !== 'end') {
      if (this._stateMachine.phase === 'action_execute') {
        this._stateMachine.onDamageCalculated();
      }
      if (this._stateMachine.phase === 'damage') {
        this._stateMachine.onBuffResolved();
      }
      if (this._stateMachine.phase === 'buff_resolve') {
        this._stateMachine.onTurnEnd();
      }
      if (this._stateMachine.phase === 'turn_end') {
        this._stateMachine.onWinCheck(totalActors);
      }
    }

    // 最终都要检查胜负（如果前面没检查过的话）
    if (this._stateMachine.phase === 'turn_end') {
      this._stateMachine.onWinCheck(totalActors);
    }
  }

  /**
   * 从 action_select 推进到 turn_end
   */
  private _advanceFullActionCycle(): void {
    if (this._stateMachine.phase === 'action_select') {
      this._stateMachine.onActionSelected('idle', '');
    }
    if (this._stateMachine.phase === 'action_execute') {
      this._stateMachine.onActionExecuted();
    }
    if (this._stateMachine.phase === 'damage') {
      this._stateMachine.onDamageCalculated();
    }
    if (this._stateMachine.phase === 'buff_resolve') {
      this._stateMachine.onBuffResolved();
    }
    if (this._stateMachine.phase === 'turn_end') {
      this._stateMachine.onTurnEnd();
    }
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    const { type, payload } = action;

    if (type === 'attack' || type === 'normal_attack') {
      const currentActor = this.getCurrentActor();
      if (!currentActor) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<战斗>无当前行动者</战斗>',
          keyStep: false,
          sideEffects: [],
        };
      }

      if (currentActor.side !== 'player') {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<战斗>不是玩家的回合</战斗>',
          keyStep: false,
          sideEffects: [],
        };
      }

      const targetId = payload.targetId as string;
      const bodyPart = payload.bodyPart as string | undefined;
      return this._doAttack(currentActor.id, targetId, bodyPart);
    }

    if (type === 'skill_attack') {
      const currentActor = this.getCurrentActor();
      if (!currentActor) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<战斗>无当前行动者</战斗>',
          keyStep: false,
          sideEffects: [],
        };
      }

      const targetId = payload.targetId as string;
      const kungfuId = payload.kungfuId as string;
      const bodyPart = payload.bodyPart as string | undefined;
      return this._doSkillAttack(currentActor.id, targetId, kungfuId, bodyPart);
    }

    if (type === 'defend') {
      const currentActor = this.getCurrentActor();
      if (!currentActor) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<战斗>无当前行动者</战斗>',
          keyStep: false,
          sideEffects: [],
        };
      }
      return this._doDefend(currentActor.id);
    }

    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: '<战斗>未知操作类型</战斗>',
      keyStep: false,
      sideEffects: [],
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    return ['attack', 'normal_attack', 'skill_attack', 'defend'].includes(action.type);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        rpgBattle: {
          battleActive: this.isActive,
          phase: this._stateMachine.phase,
          round: this._stateMachine.round,
          actors: this._actors.map((a) => ({
            id: a.id,
            name: a.name,
            side: a.side,
            currentHP: this._hp.get(a.id) ?? 0,
            maxHP: this._maxHp.get(a.id) ?? 0,
            isAlive: (this._hp.get(a.id) ?? 0) > 0,
          })),
          currentActorId:
            this._orderedActors[this._stateMachine.currentActorIndex]?.id ?? null,
          logLength: this._log.length,
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const alivePlayers = this._actors.filter(
      (a) => a.side === 'player' && (this._hp.get(a.id) ?? 0) > 0,
    ).length;
    const aliveEnemies = this._actors.filter(
      (a) => a.side === 'enemy' && (this._hp.get(a.id) ?? 0) > 0,
    ).length;

    return {
      scene: this.isActive ? '战斗中' : '战斗外',
      turn: this._stateMachine.round,
      tension: this.isActive ? Math.min(alivePlayers + aliveEnemies, 10) : 0,
      playerAction: `存活: 玩家方${alivePlayers}人, 敌方${aliveEnemies}人`,
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: this.isActive ? 'battle_action' : 'idle',
    };
  }

  reset(): void {
    this._actors = [];
    this._orderedActors = [];
    this._hp.clear();
    this._maxHp.clear();
    this._combatStats.clear();
    this._cooldowns.clear();
    this._buffManager.clear();
    this._log = [];
    this._outcome = null;
    this._stateMachine.reset();
    this._turnNumber = 0;
    super.pause('phase-change');
    super.resume();
  }

  // ==================== 序列化 ====================

  serialize(): Record<string, unknown> {
    return {
      engineType: this.getEngineType(),
      turnNumber: this._turnNumber,
      battleActive: this.isActive,
      phase: this._stateMachine.phase,
      round: this._stateMachine.round,
      currentActorIndex: this._stateMachine.currentActorIndex,
      actors: this._actors,
      hp: Array.from(this._hp.entries()),
      maxHp: Array.from(this._maxHp.entries()),
      cooldowns: Array.from(this._cooldowns.entries()).map(
        ([k, v]) => [k, Array.from(v.entries())],
      ),
      log: this._log,
      outcome: this._outcome,
    };
  }

  static fromJSON(state: Record<string, unknown>): RpgBattleEngine {
    const engine = new RpgBattleEngine();
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;

    if (Array.isArray(state.actors)) {
      engine._actors = state.actors as BattleActor[];
    }

    if (Array.isArray(state.hp)) {
      engine._hp = new Map(state.hp as [string, number][]);
    }

    if (Array.isArray(state.maxHp)) {
      engine._maxHp = new Map(state.maxHp as [string, number][]);
    }

    if (Array.isArray(state.cooldowns)) {
      engine._cooldowns = new Map(
        (state.cooldowns as [string, [string, number][]][]).map(
          ([k, v]) => [k, new Map(v)],
        ),
      );
    }

    if (Array.isArray(state.log)) {
      engine._log = state.log as BattleLogEntry[];
    }

    if (state.outcome) {
      engine._outcome = state.outcome as BattleOutcome;
    }

    // 恢复状态机状态
    if (typeof state.phase === 'string' && state.battleActive === true && engine._actors.length >= 2) {
      engine._stateMachine.start();
      engine._stateMachine.onInitiativeResolved();
    }

    return engine;
  }

  // ==================== 内部方法 ====================

  private _doAttack(attackerId: string, defenderId: string, bodyPart?: string): ActionResult {
    const attackerStats = this._combatStats.get(attackerId);
    const defenderStats = this._combatStats.get(defenderId);
    if (!attackerStats || !defenderStats) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<战斗>角色不在战斗中</战斗>',
        keyStep: false,
        sideEffects: [],
      };
    }

    this._stateMachine.onActionSelected('normal_attack', defenderId);
    this._stateMachine.onActionExecuted();

    let result = calculateDamage(attackerStats, defenderStats, this._rng);

    if (bodyPart) {
      const multiplier = getBodyPartMultiplier(bodyPart);
      result = { ...result, damage: Math.round(result.damage * multiplier) };
    }

    // Buff 结算
    const attackerBuffResolve = this._buffManager.resolve(attackerId);
    const defenderBuffResolve = this._buffManager.resolve(defenderId);

    if (defenderBuffResolve.damageOverTime > 0) {
      result.damage += defenderBuffResolve.damageOverTime;
    }

    const attackerHp = this._hp.get(attackerId) ?? 0;
    this._hp.set(
      attackerId,
      Math.min(attackerHp + attackerBuffResolve.hpRegen, this._maxHp.get(attackerId) ?? 0),
    );

    const currentDefenderHp = this._hp.get(defenderId) ?? 0;
    const newDefenderHp = Math.max(0, currentDefenderHp - result.damage);
    this._hp.set(defenderId, newDefenderHp);

    this._stateMachine.onDamageCalculated();
    this._stateMachine.onBuffResolved();
    this._stateMachine.onTurnEnd();

    this._log.push({
      round: this._stateMachine.round,
      actorId: attackerId,
      action: 'normal_attack',
      targetId: defenderId,
      damage: result.damage,
      isCrit: result.isCrit,
      isDodge: result.isDodge,
    });

    this._publishBattleEvent('BATTLE_DAMAGE', {
      attackerId, defenderId, damage: result.damage,
      isCrit: result.isCrit, isDodge: result.isDodge,
    });

    this._checkWinCondition();

    return {
      success: true,
      stateUpdates: { action: 'attack', attackerId, defenderId, damage: result.damage },
      narrativeConstraint: result.isDodge
        ? `<战斗>${defenderId} 闪避了攻击！</战斗>`
        : `<战斗>${attackerId} 对 ${defenderId} 造成 ${result.damage} 点伤害${result.isCrit ? '（暴击！）' : ''}</战斗>`,
      keyStep: result.isCrit || result.damage > 50,
      sideEffects: [
        { type: 'battle_damage', payload: { attackerId, defenderId, damage: result.damage } },
      ],
    };
  }

  private _doSkillAttack(
    attackerId: string,
    defenderId: string,
    kungfuId: string,
    bodyPart?: string,
  ): ActionResult {
    const attacker = this._actors.find((a) => a.id === attackerId);
    const defenderStats = this._combatStats.get(defenderId);
    if (!attacker || !defenderStats) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<战斗>角色不在战斗中</战斗>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const kungfu = (attacker.kungfuList ?? []).find((k) => k.ID === kungfuId);
    if (!kungfu) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<战斗>未习得该功法</战斗>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const buffModifiers = this._buffManager.getModifiers(attackerId);
    if (buffModifiers.isSilenced) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<战斗>角色被沉默，无法使用技能</战斗>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const actorCooldowns = this._cooldowns.get(attackerId) ?? new Map();
    const attackerStats = this._combatStats.get(attackerId)!;

    // 敌人没有完整的角色数据结构，用简化处理
    let damageResult: { damage: number; isCrit: boolean; isDodge: boolean; damageType: 'physical' | 'skill' | 'true' | 'mixed' };

    if (attacker.character) {
      const skillResult = resolveSkill(kungfu, actorCooldowns, () =>
        calculateSkillDamage(
          attacker.character!,
          attackerStats,
          defenderStats,
          kungfu,
          this._rng,
        ),
      );

      if (!skillResult.success) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: `<战斗>技能施展失败: ${skillResult.reason}</战斗>`,
          keyStep: false,
          sideEffects: [],
        };
      }

      if (skillResult.cost && skillResult.cost > 0 && attacker.character) {
        const consumed = consumeResource(attacker.character, kungfu.消耗类型, skillResult.cost);
        attacker.character = consumed as 角色数据结构;
      }

      const cooldownTurns = this._parseCooldown(kungfu.冷却时间);
      this._cooldowns.set(attackerId, setCooldown(actorCooldowns, kungfuId, cooldownTurns));
      damageResult = skillResult.damage!;
    } else {
      // 敌人用简化伤害
      damageResult = {
        damage: Math.max(1, attackerStats.攻击力 - defenderStats.防御力 * 0.3),
        isCrit: false,
        isDodge: false,
        damageType: 'skill' as const,
      };
    }

    this._stateMachine.onActionSelected('skill_attack', defenderId);
    this._stateMachine.onActionExecuted();

    if (bodyPart) {
      const multiplier = getBodyPartMultiplier(bodyPart);
      damageResult = { ...damageResult, damage: Math.round(damageResult.damage * multiplier) };
    }

    const defenderBuffResolve = this._buffManager.resolve(defenderId);
    const attackerBuffResolve = this._buffManager.resolve(attackerId);

    if (defenderBuffResolve.damageOverTime > 0) {
      damageResult.damage += defenderBuffResolve.damageOverTime;
    }

    const attackerHp = this._hp.get(attackerId) ?? 0;
    this._hp.set(
      attackerId,
      Math.min(attackerHp + attackerBuffResolve.hpRegen, this._maxHp.get(attackerId) ?? 0),
    );

    const currentDefenderHp = this._hp.get(defenderId) ?? 0;
    const newDefenderHp = Math.max(0, currentDefenderHp - damageResult.damage);
    this._hp.set(defenderId, newDefenderHp);

    this._stateMachine.onDamageCalculated();
    this._stateMachine.onBuffResolved();
    this._stateMachine.onTurnEnd();

    if (attacker.character && kungfu.附带效果?.length) {
      this._applySkillBuff(attackerId, defenderId, kungfu);
    }

    this._log.push({
      round: this._stateMachine.round,
      actorId: attackerId,
      action: `skill:${kungfu.名称}`,
      targetId: defenderId,
      damage: damageResult.damage,
      isCrit: damageResult.isCrit,
      isDodge: damageResult.isDodge,
    });

    this._publishBattleEvent('BATTLE_SKILL_USE', {
      attackerId, defenderId, skillName: kungfu.名称, damage: damageResult.damage,
    });

    this._checkWinCondition();

    return {
      success: true,
      stateUpdates: {
        action: 'skill_attack', attackerId, defenderId,
        skillName: kungfu.名称, damage: damageResult.damage,
      },
      narrativeConstraint: damageResult.isDodge
        ? `<战斗>${defenderId} 闪避了 ${kungfu.名称}！</战斗>`
        : `<战斗>${attackerId} 施展 ${kungfu.名称}，对 ${defenderId} 造成 ${damageResult.damage} 点伤害${damageResult.isCrit ? '（暴击！）' : ''}</战斗>`,
      keyStep: damageResult.isCrit || damageResult.damage > 80,
      sideEffects: [
        { type: 'battle_skill_use', payload: { attackerId, defenderId, skillName: kungfu.名称, damage: damageResult.damage } },
      ],
    };
  }

  private _doDefend(actorId: string): ActionResult {
    this._buffManager.addBuff(actorId, {
      name: '防御姿态',
      remainingTurns: 1,
      maxTurns: 1,
      buffType: 'buff',
      effectType: 'defense_modify',
      value: 10,
      isPercentage: false,
    });

    this._stateMachine.onActionSelected('defend', actorId);
    this._stateMachine.onActionExecuted();
    this._stateMachine.onDamageCalculated();
    this._stateMachine.onBuffResolved();
    this._stateMachine.onTurnEnd();

    this._log.push({
      round: this._stateMachine.round,
      actorId,
      action: 'defend',
      detail: '进入防御姿态，防御力+10',
    });

    this._publishBattleEvent('BATTLE_BUFF_APPLY', { actorId, buffName: '防御姿态' });
    this._checkWinCondition();

    return {
      success: true,
      stateUpdates: { action: 'defend', actorId },
      narrativeConstraint: `<战斗>${actorId} 进入防御姿态</战斗>`,
      keyStep: false,
      sideEffects: [{ type: 'battle_defend', payload: { actorId } }],
    };
  }

  private _enemyAutoAction(enemy: BattleActor): void {
    const players = this._actors.filter(
      (a) => a.side === 'player' && (this._hp.get(a.id) ?? 0) > 0,
    );
    if (players.length === 0) return;

    const target = players[Math.floor(this._rng() * players.length)];
    const attackerStats = this._combatStats.get(enemy.id);
    const defenderStats = this._combatStats.get(target.id);
    if (!attackerStats || !defenderStats) return;

    // 尝试使用技能
    const kungfuList = enemy.kungfuList ?? [];
    if (kungfuList.length > 0) {
      const kungfu = kungfuList[Math.floor(this._rng() * kungfuList.length)];
      const result = this._doSkillAttack(enemy.id, target.id, kungfu.ID);
      if (result.success) return;
    }

    // 默认普通攻击
    this._doAttack(enemy.id, target.id);
  }

  private _checkWinCondition(): void {
    const playerAlive = this._actors.some(
      (a) => a.side === 'player' && (this._hp.get(a.id) ?? 0) > 0,
    );
    const enemyAlive = this._actors.some(
      (a) => a.side === 'enemy' && (this._hp.get(a.id) ?? 0) > 0,
    );

    if (!playerAlive && !enemyAlive) {
      this._outcome = { winner: 'draw', rounds: this._stateMachine.round, log: [...this._log] };
      this._stateMachine.end('draw');
    } else if (!enemyAlive) {
      this._outcome = { winner: 'player', rounds: this._stateMachine.round, log: [...this._log] };
      this._stateMachine.end('player');
    } else if (!playerAlive) {
      this._outcome = { winner: 'enemy', rounds: this._stateMachine.round, log: [...this._log] };
      this._stateMachine.end('enemy');
    }
    // If both sides are alive, don't call onWinCheck here — advanceTurn will handle phase progression
  }

  private _applySkillBuff(
    _attackerId: string,
    defenderId: string,
    kungfu: 功法结构,
  ): void {
    for (const effect of kungfu.附带效果 ?? []) {
      const effectName = effect.名称;
      const duration = this._parseDuration(effect.持续时间);

      if (effectName === '眩晕') {
        this._buffManager.addBuff(defenderId, {
          name: `${kungfu.名称}-眩晕`,
          remainingTurns: duration,
          maxTurns: duration,
          buffType: 'control',
          effectType: 'stun',
          value: 0,
          isPercentage: false,
          sourceSkillId: kungfu.ID,
        });
      } else if (effectName === '沉默') {
        this._buffManager.addBuff(defenderId, {
          name: `${kungfu.名称}-沉默`,
          remainingTurns: duration,
          maxTurns: duration,
          buffType: 'control',
          effectType: 'silence',
          value: 0,
          isPercentage: false,
          sourceSkillId: kungfu.ID,
        });
      }
    }
  }

  private _getTotalBodyHP(character: 角色数据结构): number {
    return (
      (character.头部当前血量 ?? 0) +
      (character.胸部当前血量 ?? 0) +
      (character.腹部当前血量 ?? 0) +
      (character.左手当前血量 ?? 0) +
      (character.右手当前血量 ?? 0) +
      (character.左腿当前血量 ?? 0) +
      (character.右腿当前血量 ?? 0)
    );
  }

  private _parseDuration(durationStr: string): number {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }

  private _parseCooldown(cooldownStr: string): number {
    const match = cooldownStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private _publishBattleEvent(type: string, payload: Record<string, unknown>): void {
    this.enqueueEvent({
      id: `battle-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      engineType: this._engineType,
      type,
      description: `Battle event: ${type}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    });
  }
}

/** 工厂函数 */
export function createRpgBattleEngine(rng?: () => number): RpgBattleEngine {
  return new RpgBattleEngine(rng);
}
