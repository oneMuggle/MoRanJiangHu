/**
 * rpgBattleEngine.ts
 *
 * RPG 回合制战斗引擎 — 继承 BaseEngine，实现 SLGEngine 接口
 *
 * 核心能力:
 * - 确定性伤害计算（不依赖 AI）
 * - 先攻排序的行动顺序
 * - 技能施展与冷却管理
 * - Buff 结算
 * - 身体部位 HP 系统
 * - 通过 EventBus 发布战斗事件
 */

import { BaseEngine } from '../engine/baseEngine';
import type {
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  StateChange,
  EngineType,
} from '../engine/types';
import { GlobalEventBus } from '../events/globalEventBus';
import {
  BattleStateMachine,
  calculateCombatStats,
  calculateDamage,
  calculateSkillDamage,
  getBodyPartMultiplier,
  calculateInitiative,
  resolveSkill,
  tickCooldowns,
  setCooldown,
  BuffManager,
  type CombatStats,
  type DamageResult,
  type InitiativeActor,
  type BuffResolveResult,
} from '../rpg/battle';
import type { 角色数据结构 } from '../../../models/character';
import type { 游戏物品 } from '../../../models/item';
import type { 功法结构 } from '../../../models/kungfu';
import type { 战斗敌方信息 } from '../../../models/battle';

/** 战斗参与者 */
export interface BattleActor {
  /** 唯一标识 */
  id: string;
  /** 名字 */
  name: string;
  /** 阵营 */
  side: 'player' | 'enemy';
  /** 角色数据（玩家）或敌方信息（敌人） */
  character?: 角色数据结构;
  enemy?: 战斗敌方信息;
  /** 装备（仅玩家） */
  equipment?: Record<string, 游戏物品 | undefined>;
  /** 已学功法（仅玩家） */
  kungfuList?: 功法结构[];
}

/** 战斗配置 */
export interface BattleConfig {
  /** 随机数种子（可选，用于确定性回放） */
  seed?: number;
  /** 最大回合数（超时判负） */
  maxRounds?: number;
}

/** 战斗引擎状态 */
export interface RpgBattleState {
  /** 战斗是否进行中 */
  isActive: boolean;
  /** 当前回合数 */
  round: number;
  /** 所有行动者（按先攻排序） */
  actors: BattleActor[];
  /** 当前行动者索引 */
  currentActorIndex: number;
  /** 玩家战斗属性 */
  playerStats?: CombatStats;
  /** 敌方战斗属性映射 */
  enemyStats: Map<string, CombatStats>;
  /** 技能冷却（actor ID -> skill ID -> remaining turns） */
  cooldowns: Map<string, Map<string, number>>;
}

let _simpleRngState = 0;

/** 简单确定性 RNG（基于种子） */
function seededRng(seed: number): () => number {
  _simpleRngState = seed;
  return () => {
    _simpleRngState = (_simpleRngState * 16807 + 0) % 2147483647;
    return _simpleRngState / 2147483647;
  };
}

export class RpgBattleEngine extends BaseEngine {
  private _stateMachine: BattleStateMachine;
  private _buffManager: BuffManager;
  private _battleState: RpgBattleState;
  private _rng: () => number;
  private _eventBus: GlobalEventBus;

  constructor() {
    super('rpgBattle' as EngineType);
    this._stateMachine = new BattleStateMachine();
    this._buffManager = new BuffManager();
    this._rng = Math.random;
    this._eventBus = GlobalEventBus.getInstance();
    this._battleState = this._initialBattleState();
  }

  // ==================== 战斗初始化 ====================

  /**
   * 初始化战斗 — 设置参与者、计算先攻
   */
  initBattle(actors: BattleActor[], config?: BattleConfig): void {
    // 设置 RNG
    if (config?.seed != null) {
      this._rng = seededRng(config.seed);
    }

    this._battleState = {
      isActive: true,
      round: 0,
      actors,
      currentActorIndex: 0,
      playerStats: undefined,
      enemyStats: new Map(),
      cooldowns: new Map(),
    };

    // 计算战斗属性
    for (const actor of actors) {
      if (actor.side === 'player' && actor.character) {
        this._battleState.playerStats = calculateCombatStats(
          actor.character,
          actor.equipment ?? {},
        );
      } else if (actor.side === 'enemy' && actor.enemy) {
        const stats = this._enemyToCombatStats(actor.enemy);
        this._battleState.enemyStats.set(actor.id, stats);
      }
      this._battleState.cooldowns.set(actor.id, new Map());
    }

    // 计算先攻并排序
    const initiativeActors: InitiativeActor[] = actors.map((actor) => ({
      id: actor.id,
      side: actor.side,
      stats: this._getActorCombatStats(actor),
    }));
    const ordered = calculateInitiative(initiativeActors, this._rng);
    this._battleState.actors = actors
      .slice()
      .sort((a, b) => {
        const orderA = ordered.findIndex((o) => o.id === a.id);
        const orderB = ordered.findIndex((o) => o.id === b.id);
        return orderA - orderB;
      });

    // 启动状态机
    this._stateMachine.start();
    this._stateMachine.onInitiativeResolved();

    // 发布战斗开始事件
    this._publishEvent('BATTLE_START', {
      round: this._battleState.round,
      actorCount: actors.length,
      actors: actors.map((a) => ({ id: a.id, name: a.name, side: a.side })),
    });
  }

  // ==================== SLGEngine 接口实现 ====================

  /**
   * 推进战斗回合
   */
  advanceTurn(): TurnResult {
    const stateChanges: StateChange[] = [];
    const eventsTriggered: GameEvent[] = [];

    if (!this._battleState.isActive || this._stateMachine.phase === 'end') {
      return { turnNumber: this._stateMachine.round, phase: 'idle', eventsTriggered: [], stateChanges: [] };
    }

    const previousPhase = this._stateMachine.phase;

    // 状态机推进
    switch (previousPhase) {
      case 'turn_start':
        this._stateMachine.onTurnStart();
        break;

      case 'action_select': {
        const currentActor = this._battleState.actors[this._stateMachine.currentActorIndex];
        // 检查眩晕状态
        if (currentActor) {
          const modifiers = this._buffManager.getModifiers(currentActor.id);
          if (modifiers.isStunned) {
            // 被眩晕，跳过行动
            this._stateMachine.onActionSelected('skip', currentActor.id);
          } else if (currentActor.side === 'enemy') {
            this._autoSelectEnemyAction(currentActor);
          }
        }
        break;
      }

      case 'action_execute':
        this._executeCurrentAction();
        this._stateMachine.onActionExecuted();
        break;

      case 'damage':
        this._stateMachine.onDamageCalculated();
        break;

      case 'buff_resolve': {
        const currentActor = this._battleState.actors[this._stateMachine.currentActorIndex];
        if (currentActor) {
          const buffResult = this._buffManager.resolve(currentActor.id);
          this._applyBuffResult(currentActor.id, buffResult);
        }
        // Tick 所有角色的冷却
        for (const [actorId, actorCooldowns] of this._battleState.cooldowns) {
          this._battleState.cooldowns.set(actorId, tickCooldowns(actorCooldowns));
        }
        this._stateMachine.onBuffResolved();
        break;
      }

      case 'turn_end':
        this._stateMachine.onTurnEnd();
        break;

      case 'check_win': {
        const winResult = this._checkWinCondition();
        if (winResult) {
          this._stateMachine.end(winResult);
          this._publishEvent('BATTLE_END', {
            winner: winResult,
            round: this._stateMachine.round,
          });
          this._battleState.isActive = false;
        } else {
          this._stateMachine.onWinCheck(this._battleState.actors.length);
        }
        break;
      }

      default:
        this._stateMachine.onTurnStart();
        break;
    }

    // 收集状态变更
    stateChanges.push({
      key: 'battle.phase',
      before: previousPhase,
      after: this._stateMachine.phase,
    });

    return {
      turnNumber: this._stateMachine.round,
      phase: this._mapBattlePhaseToTurnPhase(),
      eventsTriggered,
      stateChanges,
    };
  }

  /**
   * 执行玩家行动
   */
  executePlayerAction(action: PlayerAction): ActionResult {
    if (this._stateMachine.phase !== 'action_select') {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<战斗>当前阶段不允许行动</战斗>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const currentActor = this._battleState.actors[this._stateMachine.currentActorIndex];
    if (currentActor?.side !== 'player') {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<战斗>不是玩家的回合</战斗>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const actionType = action.type;
    const targetId = action.payload.targetId as string;

    // 检查眩晕状态
    const playerModifiers = this._buffManager.getModifiers(currentActor.id);
    if (playerModifiers.isStunned) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<战斗>角色被眩晕，无法行动</战斗>',
        keyStep: false,
        sideEffects: [],
      };
    }

    this._stateMachine.onActionSelected(actionType, targetId);

    return {
      success: true,
      stateUpdates: { action: actionType, target: targetId },
      narrativeConstraint: `<战斗行动>类型: ${actionType}, 目标: ${targetId}</战斗行动>`,
      keyStep: true,
      sideEffects: [{ type: 'action_selected', payload: { actionType, targetId } }],
    };
  }

  /**
   * 检查行动是否合法
   */
  canExecuteAction(action: PlayerAction): boolean {
    if (this._stateMachine.phase !== 'action_select') return false;

    const currentActor = this._battleState.actors[this._stateMachine.currentActorIndex];
    if (currentActor?.side !== 'player') return false;

    // 检查是否被眩晕
    const modifiers = this._buffManager.getModifiers(currentActor.id);
    if (modifiers.isStunned) return false;

    // 检查技能是否被沉默
    if (action.type === 'skill' && modifiers.isSilenced) return false;

    // 检查目标是否有效
    const targetId = action.payload.targetId as string;
    if (!targetId) return false;

    return this._battleState.actors.some((a) => a.id === targetId && a.side !== currentActor.side);
  }

  /**
   * 获取战斗状态快照
   */
  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._stateMachine.round,
      timestamp: Date.now(),
      engineStates: {
        rpgBattle: {
          phase: this._stateMachine.phase,
          round: this._stateMachine.round,
          currentActorIndex: this._stateMachine.currentActorIndex,
          isActive: this._battleState.isActive,
          actors: this._battleState.actors.map((a) => ({
            id: a.id,
            name: a.name,
            side: a.side,
          })),
        },
      },
    };
  }

  /**
   * 获取叙事约束
   */
  getNarrativeConstraints(): NarrativeConstraint {
    const currentActor = this._battleState.actors[this._stateMachine.currentActorIndex];
    return {
      scene: `战斗第${this._stateMachine.round}回合`,
      turn: this._stateMachine.round,
      tension: this._calculateTension(),
      playerAction: currentActor?.side === 'player' ? `选择行动: ${this._stateMachine.phase}` : '敌人行动中',
      keyStep: this._stateMachine.phase === 'action_select',
      nsfwTriggered: false,
      participants: this._battleState.actors.map((a) => ({
        id: a.id,
        name: a.name,
        status: a.side === 'player' ? '战斗中' : '敌方',
      })),
      nextEvent: this._stateMachine.phase,
    };
  }

  // ==================== 公共 API ====================

  /** 获取当前战斗阶段 */
  get phase() {
    return this._stateMachine.phase;
  }

  /** 获取当前回合数 */
  get round() {
    return this._stateMachine.round;
  }

  /** 获取战斗是否进行中 */
  get isActive() {
    return this._battleState.isActive;
  }

  /** 获取所有 Buff */
  getBuffs(actorId: string) {
    return this._buffManager.getBuffs(actorId);
  }

  /** 添加 Buff */
  addBuff(actorId: string, buff: Parameters<BuffManager['addBuff']>[1]) {
    this._buffManager.addBuff(actorId, buff);
    this._publishEvent('BATTLE_BUFF_APPLY', {
      actorId,
      buffName: buff.name,
      remainingTurns: buff.remainingTurns,
    });
  }

  /** 获取当前行动者 */
  getCurrentActor(): BattleActor | undefined {
    return this._battleState.actors[this._stateMachine.currentActorIndex];
  }

  /** 获取玩家战斗属性 */
  getPlayerStats(): CombatStats | undefined {
    return this._battleState.playerStats;
  }

  /** 获取敌方战斗属性 */
  getEnemyStats(actorId: string): CombatStats | undefined {
    return this._battleState.enemyStats.get(actorId);
  }

  /** 重置战斗引擎 */
  reset(): void {
    super.pause('phase-change');
    this._stateMachine.reset();
    this._buffManager.clear();
    this._battleState = this._initialBattleState();
    super.resume();
  }

  // ==================== 内部方法 ====================

  private _executeCurrentAction(): void {
    const currentActor = this._battleState.actors[this._stateMachine.currentActorIndex];
    const action = this._stateMachine.state.selectedAction;
    const targetId = this._stateMachine.state.actionTarget;

    if (!currentActor || !action || !targetId) return;

    const targetActor = this._battleState.actors.find((a) => a.id === targetId);
    if (!targetActor) return;

    const attackerStats = this._getActorCombatStats(currentActor);
    const defenderStats = this._getActorCombatStats(targetActor);

    let damageResult: DamageResult;

    if (action === 'attack' || action === 'normal_attack') {
      damageResult = calculateDamage(attackerStats, defenderStats, this._rng);
    } else if (action === 'skill') {
      damageResult = this._tryExecuteSkill(currentActor, attackerStats, defenderStats);
    } else {
      damageResult = calculateDamage(attackerStats, defenderStats, this._rng);
    }

    // 应用身体部位伤害修正
    const bodyPart = (action as unknown as { bodyPart?: string }).bodyPart ?? '胸部';
    const multiplier = getBodyPartMultiplier(bodyPart);
    const finalDamage = Math.round(damageResult.damage * multiplier);

    // 发布伤害事件
    this._publishEvent('BATTLE_DAMAGE', {
      attackerId: currentActor.id,
      targetId: targetActor.id,
      damage: finalDamage,
      isCrit: damageResult.isCrit,
      isDodge: damageResult.isDodge,
      damageType: damageResult.damageType,
      bodyPart,
      multiplier,
    });
  }

  private _tryExecuteSkill(
    actor: BattleActor,
    attackerStats: CombatStats,
    defenderStats: CombatStats,
  ): DamageResult {
    // 尝试使用最后选择的技能
    const skillId = this._stateMachine.state.selectedAction;
    const kungfu = actor.kungfuList?.find((k) => k.ID === skillId);

    if (!kungfu || !actor.character) {
      return calculateDamage(attackerStats, defenderStats, this._rng);
    }

    const cooldowns = this._battleState.cooldowns.get(actor.id) ?? new Map();
    const resolveResult = resolveSkill(
      kungfu,
      cooldowns,
      () =>
        calculateSkillDamage(
          actor.character!,
          attackerStats,
          defenderStats,
          kungfu,
          this._rng,
        ),
    );

    if (resolveResult.success && resolveResult.damage) {
      // 设置冷却（解析字符串如 "3回合" → 3）
      if (kungfu.冷却时间) {
        const cooldownTurns = this._parseCooldown(kungfu.冷却时间);
        if (cooldownTurns > 0) {
          this._battleState.cooldowns.set(
            actor.id,
            setCooldown(cooldowns, kungfu.ID, cooldownTurns),
          );
        }
      }

      // 发布技能使用事件
      if (resolveResult.cost && resolveResult.cost > 0) {
        this._publishEvent('BATTLE_SKILL_USE', {
          actorId: actor.id,
          skillName: kungfu.名称,
          cost: resolveResult.cost,
          costType: kungfu.消耗类型,
        });
      }

      return resolveResult.damage;
    }

    // 技能施展失败，回退为普通攻击
    return calculateDamage(attackerStats, defenderStats, this._rng);
  }

  private _autoSelectEnemyAction(_enemy: BattleActor): void {
    // 简单 AI：随机选择一个玩家目标并执行普通攻击
    const playerTargets = this._battleState.actors.filter((a) => a.side === 'player');
    if (playerTargets.length === 0) return;

    const target = playerTargets[Math.floor(this._rng() * playerTargets.length)];
    this._stateMachine.onActionSelected('attack', target.id);
  }

  private _checkWinCondition(): 'player' | 'enemy' | 'draw' | null {
    const playerAlive = this._battleState.actors.some(
      (a) => a.side === 'player' && this._isActorAlive(a),
    );
    const enemyAlive = this._battleState.actors.some(
      (a) => a.side === 'enemy' && this._isActorAlive(a),
    );

    if (!playerAlive && !enemyAlive) return 'draw';
    if (!enemyAlive) return 'player';
    if (!playerAlive) return 'enemy';

    // 超时检查
    if (this._stateMachine.round >= 50) {
      return 'draw';
    }

    return null;
  }

  private _isActorAlive(actor: BattleActor): boolean {
    if (actor.side === 'player' && actor.character) {
      const totalHp =
        (actor.character.头部当前血量 ?? 0) +
        (actor.character.胸部当前血量 ?? 0) +
        (actor.character.腹部当前血量 ?? 0) +
        (actor.character.左手当前血量 ?? 0) +
        (actor.character.右手当前血量 ?? 0) +
        (actor.character.左腿当前血量 ?? 0) +
        (actor.character.右腿当前血量 ?? 0);
      return totalHp > 0;
    }
    if (actor.side === 'enemy' && actor.enemy) {
      return (actor.enemy.当前血量 ?? 0) > 0;
    }
    return false;
  }

  private _getActorCombatStats(actor: BattleActor): CombatStats {
    if (actor.side === 'player' && this._battleState.playerStats) {
      return this._battleState.playerStats;
    }
    const enemyStats = this._battleState.enemyStats.get(actor.id);
    if (enemyStats) return enemyStats;

    return {
      攻击力: 10,
      防御力: 5,
      速度: 10,
      暴击率: 0.05,
      闪避率: 0.03,
      最大血量: 100,
    };
  }

  private _enemyToCombatStats(enemy: 战斗敌方信息): CombatStats {
    return {
      攻击力: enemy.战斗力 ?? 10,
      防御力: enemy.防御力 ?? 5,
      速度: 10,
      暴击率: 0.05,
      闪避率: 0.03,
      最大血量: enemy.最大血量 ?? 100,
    };
  }

  private _applyBuffResult(actorId: string, result: BuffResolveResult): void {
    if (result.damageOverTime > 0) {
      this._publishEvent('BATTLE_DAMAGE', {
        attackerId: 'buff',
        targetId: actorId,
        damage: result.damageOverTime,
        isCrit: false,
        isDodge: false,
        damageType: 'skill',
        bodyPart: '胸部',
        multiplier: 1.0,
      });
    }
    if (result.hpRegen > 0) {
      this._publishEvent('BATTLE_BUFF_APPLY', {
        actorId,
        effect: 'hp_regen',
        value: result.hpRegen,
      });
    }
  }

  private _calculateTension(): number {
    const playerCount = this._battleState.actors.filter(
      (a) => a.side === 'player' && this._isActorAlive(a),
    ).length;
    const enemyCount = this._battleState.actors.filter(
      (a) => a.side === 'enemy' && this._isActorAlive(a),
    ).length;
    const total = this._battleState.actors.length;
    if (total === 0) return 0;
    return Math.min(10, Math.round(((total - playerCount - enemyCount) / total) * 10));
  }

  private _mapBattlePhaseToTurnPhase(): TurnResult['phase'] {
    switch (this._stateMachine.phase) {
      case 'action_select':
        return 'player-action';
      case 'action_execute':
      case 'damage':
      case 'buff_resolve':
        return 'resolution';
      case 'turn_end':
      case 'check_win':
        return 'transition';
      case 'end':
        return 'idle';
      default:
        return 'narrative';
    }
  }

  private _publishEvent(type: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: `battle-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      engineType: this._engineType,
      type,
      description: `Battle event: ${type}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this._eventBus.publish(event);
    this.enqueueEvent(event);
  }

  private _initialBattleState(): RpgBattleState {
    return {
      isActive: false,
      round: 0,
      actors: [],
      currentActorIndex: 0,
      playerStats: undefined,
      enemyStats: new Map(),
      cooldowns: new Map(),
    };
  }

  /**
   * 解析冷却时间字符串（如 "3回合" → 3）
   */
  private _parseCooldown(cooldownStr: string): number {
    const match = cooldownStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}

/**
 * 工厂函数
 */
export function createRpgBattleEngine(): RpgBattleEngine {
  return new RpgBattleEngine();
}
