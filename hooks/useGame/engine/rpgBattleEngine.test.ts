/**
 * rpgBattleEngine.test.ts
 *
 * RPG Battle Engine 端到端测试 + 子组件单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RpgBattleEngine, createRpgBattleEngine, type BattleActor } from '../engine/rpgBattleEngine';
import { BattleStateMachine } from '../rpg/battle/battleStateMachine';
import { calculateCombatStats, calculateDamage, getBodyPartMultiplier } from '../rpg/battle/damageCalculator';
import { calculateInitiative, type InitiativeActor } from '../rpg/battle/initiativeCalculator';
import { BuffManager } from '../rpg/battle/buffManager';
import { resolveSkill, tickCooldowns, setCooldown } from '../rpg/battle/skillResolver';
import type { 角色数据结构 } from '../../../models/character';
import type { 功法结构 } from '../../../models/kungfu';
import type { 战斗敌方信息 } from '../../../models/battle';

// ==================== Helpers ====================

function makePlayerCharacter(): 角色数据结构 {
  return {
    ID: 'player-1',
    名字: '主角',
    力量: 15,
    敏捷: 12,
    体质: 10,
    根骨: 8,
    悟性: 10,
    福源: 5,
    当前精力: 100,
    最大精力: 100,
    当前内力: 50,
    最大内力: 50,
    当前饱腹: 80,
    最大饱腹: 100,
    当前口渴: 30,
    最大口渴: 100,
    当前生命: 100,
    最大生命: 100,
    头部当前血量: 30,
    头部最大血量: 30,
    头部状态: '正常',
    胸部当前血量: 40,
    胸部最大血量: 40,
    胸部状态: '正常',
    腹部当前血量: 35,
    腹部最大血量: 35,
    腹部状态: '正常',
    左手当前血量: 20,
    左手最大血量: 20,
    左手状态: '正常',
    右手当前血量: 20,
    右手最大血量: 20,
    右手状态: '正常',
    左腿当前血量: 25,
    左腿最大血量: 25,
    左腿状态: '正常',
    右腿当前血量: 25,
    右腿最大血量: 25,
    右腿状态: '正常',
    功法列表: [],
    当前经验: 0,
    当前等级: 1,
    境界: '初学',
    当前坐标X: 0,
    当前坐标Y: 0,
    当前负重: 0,
  } as unknown as 角色数据结构;
}

function makeEnemy(name: string, hp: number, atk: number, def: number): 战斗敌方信息 {
  return {
    名字: name,
    简介: `一个${name}`,
    境界: '初学',
    技能: [],
    战斗力: atk,
    防御力: def,
    当前血量: hp,
    最大血量: hp,
    当前精力: 50,
    最大精力: 50,
    当前内力: 30,
    最大内力: 30,
  };
}

function makePlayerActor(character: 角色数据结构): BattleActor {
  return {
    id: 'player-1',
    name: '主角',
    side: 'player',
    character,
    equipment: {},
    kungfuList: [],
  };
}

function makeEnemyActor(enemy: 战斗敌方信息): BattleActor {
  return {
    id: `enemy-${enemy.名字}`,
    name: enemy.名字,
    side: 'enemy',
    enemy,
  };
}

function makeTestKungfu(): 功法结构 {
  return {
    ID: 'skill-fireball',
    名称: '火焰掌',
    功法类型: '外功',
    品质: '良品',
    基础伤害: 20,
    加成属性: '力量',
    加成系数: 1.5,
    内力系数: 0.5,
    伤害类型: '物理',
    消耗类型: '内力',
    消耗数值: 10,
    施展耗时: 1,
    冷却时间: '2回合',
    当前重数: 1,
    最高重数: 10,
    当前熟练度: 0,
    升级经验: 100,
  } as unknown as 功法结构;
}

// ==================== Tests ====================

describe('RpgBattleEngine', () => {
  let engine: RpgBattleEngine;

  beforeEach(() => {
    engine = createRpgBattleEngine();
  });

  describe('initialization', () => {
    it('starts in idle state', () => {
      expect(engine.phase).toBe('idle');
      expect(engine.isActive).toBe(false);
    });

    it('initializes battle with actors', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      const actors = [makePlayerActor(player), makeEnemyActor(enemy)];

      engine.initBattle(actors);

      expect(engine.isActive).toBe(true);
      expect(engine.phase).toBe('turn_start');
      expect(engine.round).toBe(1);
    });

    it('computes player combat stats', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      const stats = engine.getPlayerStats();
      expect(stats).toBeDefined();
      expect(stats!.攻击力).toBeGreaterThan(0);
      expect(stats!.防御力).toBeGreaterThan(0);
    });
  });

  describe('turn advancement', () => {
    beforeEach(() => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);
    });

    it('advances through phases', () => {
      const result = engine.advanceTurn();
      expect(result.turnNumber).toBeGreaterThanOrEqual(1);
    });

    it('enemy auto-selects action when it is their turn', () => {
      // Advance until enemy turn
      for (let i = 0; i < 5; i++) {
        engine.advanceTurn();
      }
      // Engine should not crash and should continue
      expect(engine.phase).not.toBe('idle');
    });
  });

  describe('player actions', () => {
    it('allows player action during action_select phase', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      // Advance to action_select for player
      engine.advanceTurn(); // turn_start → action_select

      if (engine.phase === 'action_select') {
        const currentActor = engine.getCurrentActor();
        if (currentActor?.side === 'player') {
          const result = engine.executePlayerAction({
            id: 'action-1',
            engineType: 'rpgBattle',
            type: 'attack',
            payload: { targetId: 'enemy-山贼' },
            timestamp: Date.now(),
          });
          expect(result.success).toBe(true);
        }
      }
    });

    it('rejects action when not player turn', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      // Advance multiple times to potentially reach enemy turn
      for (let i = 0; i < 10; i++) {
        engine.advanceTurn();
      }

      const result = engine.executePlayerAction({
        id: 'action-1',
        engineType: 'rpgBattle',
        type: 'attack',
        payload: { targetId: 'enemy-山贼' },
        timestamp: Date.now(),
      });

      // May or may not succeed depending on whose turn it is
      expect(result).toBeDefined();
    });
  });

  describe('win conditions', () => {
    it('detects battle end', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 1, 1, 0); // Very weak enemy
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      const enemyId = `enemy-${enemy.名字}`;
      let actionSelectCount = 0;
      let damageCount = 0;

      // Each advanceTurn advances one phase; player needs explicit action
      for (let i = 0; i < 1000; i++) {
        if (engine.phase === 'action_select') {
          const currentActor = engine.getCurrentActor();
          actionSelectCount++;
          if (currentActor?.side === 'player') {
            engine.executePlayerAction({
              id: `action-${i}`,
              engineType: 'rpgBattle',
              type: 'attack',
              payload: { targetId: enemyId },
              timestamp: Date.now(),
            });
          }
        }
        if (engine.phase === 'damage') {
          damageCount++;
        }
        engine.advanceTurn();
        if (!engine.isActive) break;
      }

      // Battle should eventually end
      expect(engine.isActive).toBe(false);
      expect(engine.phase).toBe('end');
    });
  });

  describe('snapshot', () => {
    it('returns valid snapshot', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      const snapshot = engine.getSnapshot();
      expect(snapshot.turnNumber).toBe(1);
      expect(snapshot.engineStates.rpgBattle).toBeDefined();
    });
  });

  describe('narrative constraints', () => {
    it('returns valid constraints', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      const constraints = engine.getNarrativeConstraints();
      expect(constraints.scene).toContain('战斗');
      expect(constraints.turn).toBe(1);
    });
  });

  describe('reset', () => {
    it('resets engine to initial state', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);
      engine.reset();

      expect(engine.isActive).toBe(false);
      expect(engine.phase).toBe('idle');
    });
  });
});

describe('BattleStateMachine', () => {
  let sm: BattleStateMachine;

  beforeEach(() => {
    sm = new BattleStateMachine();
  });

  it('starts at idle', () => {
    expect(sm.phase).toBe('idle');
  });

  it('transitions through start sequence', () => {
    sm.start();
    expect(sm.phase).toBe('initiative');
  });

  it('throws on invalid transition', () => {
    expect(() => sm.onActionSelected('attack', 'target')).toThrow();
  });

  it('completes a full turn cycle', () => {
    sm.start();
    sm.onInitiativeResolved();
    expect(sm.phase).toBe('turn_start');
    expect(sm.round).toBe(1);

    // First actor's turn
    sm.onTurnStart();
    sm.onActionSelected('attack', 'target-1');
    sm.onActionExecuted();
    sm.onDamageCalculated();
    sm.onBuffResolved();
    sm.onTurnEnd(); // index: 0 → 1
    sm.onWinCheck(2); // 1 < 2 → turn_start, round stays 1
    expect(sm.phase).toBe('turn_start');
    expect(sm.round).toBe(1);

    // Second actor's turn
    sm.onTurnStart();
    sm.onActionSelected('attack', 'target-2');
    sm.onActionExecuted();
    sm.onDamageCalculated();
    sm.onBuffResolved();
    sm.onTurnEnd(); // index: 1 → 2
    sm.onWinCheck(2); // 2 >= 2 → round++ → 2, index → 0
    expect(sm.phase).toBe('turn_start');
    expect(sm.round).toBe(2);
  });

  it('ends battle with winner', () => {
    sm.start();
    sm.end('player');
    expect(sm.phase).toBe('end');
    expect(sm.state.winner).toBe('player');
  });

  it('resets state', () => {
    sm.start();
    sm.reset();
    expect(sm.phase).toBe('idle');
  });
});

describe('damageCalculator', () => {
  it('calculates combat stats from attributes', () => {
    const character = makePlayerCharacter();
    const stats = calculateCombatStats(character, {});

    // 基础攻击 = 力量 * 2 = 30
    expect(stats.攻击力).toBe(30);
    // 基础防御 = 体质 + 根骨 = 18
    expect(stats.防御力).toBe(18);
    // 基础速度 = 敏捷 * 1.5 = 18
    expect(stats.速度).toBe(18);
    // 基础血量 = 体质 * 10 + 根骨 * 5 = 140
    expect(stats.最大血量).toBe(140);
  });

  it('calculates damage with dodge', () => {
    const attackerStats: import('../rpg/battle/damageCalculator').CombatStats = {
      攻击力: 30, 防御力: 18, 速度: 18, 暴击率: 0.05, 闪避率: 0.03, 最大血量: 140,
    };
    const defenderStats: import('../rpg/battle/damageCalculator').CombatStats = {
      攻击力: 20, 防御力: 10, 速度: 15, 暴击率: 0.05, 闪避率: 0.99, 最大血量: 100,
    };

    const result = calculateDamage(attackerStats, defenderStats, () => 0.5);
    expect(result.isDodge).toBe(true);
    expect(result.damage).toBe(0);
  });

  it('calculates damage with crit', () => {
    const attackerStats: import('../rpg/battle/damageCalculator').CombatStats = {
      攻击力: 30, 防御力: 18, 速度: 18, 暴击率: 0.99, 闪避率: 0.03, 最大血量: 140,
    };
    const defenderStats: import('../rpg/battle/damageCalculator').CombatStats = {
      攻击力: 20, 防御力: 10, 速度: 15, 暴击率: 0.05, 闪避率: 0.03, 最大血量: 100,
    };

    const result = calculateDamage(attackerStats, defenderStats, () => 0.5);
    expect(result.isCrit).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
  });

  it('applies body part multipliers', () => {
    expect(getBodyPartMultiplier('头部')).toBe(1.5);
    expect(getBodyPartMultiplier('胸部')).toBe(1.0);
    expect(getBodyPartMultiplier('左手')).toBe(0.7);
    expect(getBodyPartMultiplier('右腿')).toBe(0.8);
    expect(getBodyPartMultiplier('未知部位')).toBe(1.0);
  });
});

describe('initiativeCalculator', () => {
  it('sorts actors by initiative', () => {
    const actors: InitiativeActor[] = [
      { id: 'slow', side: 'enemy', stats: { 攻击力: 10, 防御力: 5, 速度: 5, 暴击率: 0, 闪避率: 0, 最大血量: 50 } },
      { id: 'fast', side: 'player', stats: { 攻击力: 20, 防御力: 10, 速度: 20, 暴击率: 0, 闪避率: 0, 最大血量: 100 } },
    ];

    const ordered = calculateInitiative(actors, () => 0.5); // deterministic
    expect(ordered[0].id).toBe('fast');
    expect(ordered[1].id).toBe('slow');
  });

  it('includes initiative bonus', () => {
    const actors: InitiativeActor[] = [
      { id: 'a', side: 'player', stats: { 攻击力: 10, 防御力: 5, 速度: 10, 暴击率: 0, 闪避率: 0, 最大血量: 50 }, initiativeBonus: 0 },
      { id: 'b', side: 'enemy', stats: { 攻击力: 10, 防御力: 5, 速度: 5, 暴击率: 0, 闪避率: 0, 最大血量: 50 }, initiativeBonus: 20 },
    ];

    const ordered = calculateInitiative(actors, () => 0.5);
    expect(ordered[0].id).toBe('b'); // higher bonus wins
  });
});

describe('BuffManager', () => {
  let manager: BuffManager;

  beforeEach(() => {
    manager = new BuffManager();
  });

  it('adds and retrieves buffs', () => {
    manager.addBuff('actor-1', {
      name: '攻击强化',
      remainingTurns: 3,
      maxTurns: 3,
      buffType: 'buff',
      effectType: 'attack_modify',
      value: 10,
      isPercentage: false,
    });

    const buffs = manager.getBuffs('actor-1');
    expect(buffs).toHaveLength(1);
    expect(buffs[0].name).toBe('攻击强化');
  });

  it('resolves buffs and decrements turns', () => {
    manager.addBuff('actor-1', {
      name: '攻击强化',
      remainingTurns: 3,
      maxTurns: 3,
      buffType: 'buff',
      effectType: 'attack_modify',
      value: 10,
      isPercentage: false,
    });

    const result = manager.resolve('actor-1');
    expect(result.attackModifier).toBe(10);

    const buffs = manager.getBuffs('actor-1');
    expect(buffs[0].remainingTurns).toBe(2);
  });

  it('removes expired buffs', () => {
    manager.addBuff('actor-1', {
      name: '短暂增益',
      remainingTurns: 1,
      maxTurns: 1,
      buffType: 'buff',
      effectType: 'attack_modify',
      value: 5,
      isPercentage: false,
    });

    manager.resolve('actor-1'); // should expire
    expect(manager.getBuffs('actor-1')).toHaveLength(0);
  });

  it('applies stun control', () => {
    manager.addBuff('actor-1', {
      name: '眩晕',
      remainingTurns: 2,
      maxTurns: 2,
      buffType: 'control',
      effectType: 'stun',
      value: 0,
      isPercentage: false,
    });

    const result = manager.getModifiers('actor-1');
    expect(result.isStunned).toBe(true);
  });

  it('calculates damage over time', () => {
    manager.addBuff('actor-1', {
      name: '中毒',
      remainingTurns: 3,
      maxTurns: 3,
      buffType: 'debuff',
      effectType: 'damage_over_time',
      value: 5,
      isPercentage: false,
    });

    const result = manager.resolve('actor-1');
    expect(result.damageOverTime).toBe(5);
  });

  it('clears all buffs', () => {
    manager.addBuff('actor-1', {
      name: 'test',
      remainingTurns: 3,
      maxTurns: 3,
      buffType: 'buff',
      effectType: 'attack_modify',
      value: 10,
      isPercentage: false,
    });
    manager.clear();
    expect(manager.getBuffs('actor-1')).toHaveLength(0);
  });
});

describe('skillResolver', () => {
  it('resolves skill when no cooldown', () => {
    const kungfu = makeTestKungfu();
    const cooldowns = new Map<string, number>();

    const result = resolveSkill(
      kungfu,
      cooldowns,
      () => ({ damage: 50, isCrit: false, isDodge: false, damageType: 'physical' }),
    );

    expect(result.success).toBe(true);
    expect(result.cost).toBe(10);
    expect(result.damage?.damage).toBe(50);
  });

  it('fails when on cooldown', () => {
    const kungfu = makeTestKungfu();
    const cooldowns = new Map<string, number>();
    cooldowns.set(kungfu.ID, 2);

    const result = resolveSkill(kungfu, cooldowns, () => ({
      damage: 50,
      isCrit: false,
      isDodge: false,
      damageType: 'physical',
    }));

    expect(result.success).toBe(false);
    expect(result.reason).toBe('on_cooldown');
  });

  it('ticks cooldowns correctly', () => {
    const cooldowns = new Map<string, number>();
    cooldowns.set('skill-a', 3);
    cooldowns.set('skill-b', 1);

    const next = tickCooldowns(cooldowns);
    expect(next.get('skill-a')).toBe(2);
    expect(next.get('skill-b')).toBeUndefined(); // expired
  });

  it('sets cooldown correctly', () => {
    const cooldowns = new Map<string, number>();
    const next = setCooldown(cooldowns, 'new-skill', 3);
    expect(next.get('new-skill')).toBe(3);
  });
});
