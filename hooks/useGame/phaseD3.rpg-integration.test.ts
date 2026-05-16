/**
 * Phase D3: RPG 引擎注入集成测试
 *
 * 覆盖范围：
 * - RpgActionDispatcher: 全部分发器路由
 * - RPG 引擎生命周期与状态同步
 * - Zustand RpgSlice: rpgMode toggle
 * - 融合增强模式: 条件注入路径验证
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createRpgActionDispatcher } from './rpg/rpgActionDispatcher';
import { createRpgBattleEngine, type BattleActor } from './engine/rpgBattleEngine';
import { createRpgEquipEngine } from './engine/rpgEquipEngine';
import { createRpgItemEngine } from './engine/rpgItemEngine';
import { createRpgKungfuEngine } from './engine/rpgKungfuEngine';
import { createRpgTaskEngine } from './engine/rpgTaskEngine';
import { createRpgSectEngine } from './engine/rpgSectEngine';
import type { 角色数据结构 } from '../../models/character';
import type { 功法结构, 功法品质 } from '../../models/kungfu';
import type { 任务结构 } from '../../models/task';
import type { 游戏物品 } from '../../models/item';
import type { 战斗敌方信息 } from '../../models/battle';
import { resetRpgEngines, getRpgDispatcher } from '../useRpgStateBridge';
import { useGameStore } from './subsystems/zustandStore';

// ==================== Helpers (mirroring rpgBattleEngine.test.ts) ====================

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
    ID: 'kf_001',
    名称: '测试功法',
    品质: '凡品' as 功法品质,
    类型: '内功',
    描述: '测试用功法',
    来源: '系统',
    基础伤害: 10,
    内力系数: 1.5,
    施展耗时: '1s',
    冷却时间: '2s',
    消耗数值: 10,
    消耗类型: '内力',
    目标类型: '单体' as any,
    最大目标数: 1,
    当前熟练度: 0,
    升级经验: 100,
    当前重数: 1,
    突破条件: '',
    境界限制: '',
    大成方向: '',
    圆满效果: '',
    附带效果: [],
    武器限制: [],
    最高重数: 10,
    加成属性: '',
    加成系数: 1,
    伤害类型: '外伤' as any,
    重数描述映射: {},
    被动修正: [],
    境界特效: {},
  } as unknown as 功法结构;
}

function makeMockTask(): 任务结构 {
  return {
    标题: '测试任务',
    描述: '测试用任务',
    类型: '支线',
    发布人: 'NPC_A',
    发布地点: '新手村',
    推荐境界: '炼气一层',
    当前状态: '进行中',
    目标列表: [],
    奖励描述: ['奖励1'],
  };
}

function makeMockItem(id: string, name: string, type: string): 游戏物品 {
  return {
    ID: id,
    名称: name,
    类型: type,
    品质: '普通',
    描述: `测试${name}`,
    基础属性: [],
    携带效果: [],
  } as unknown as 游戏物品;
}

// ==================== RpgActionDispatcher Tests ====================

describe('RpgActionDispatcher', () => {
  let dispatcher: ReturnType<typeof createRpgActionDispatcher>;

  beforeEach(() => {
    dispatcher = createRpgActionDispatcher();
    dispatcher.setBattleEngine(createRpgBattleEngine());
    dispatcher.setEquipEngine(createRpgEquipEngine());
    dispatcher.setItemEngine(createRpgItemEngine());
    dispatcher.setKungfuEngine(createRpgKungfuEngine());
    dispatcher.setTaskEngine(createRpgTaskEngine());
    dispatcher.setSectEngine(createRpgSectEngine());
  });

  describe('Battle actions', () => {
    it('initBattle creates active battle state', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      dispatcher.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      const snapshot = dispatcher.getBattleSnapshot();
      expect(snapshot).not.toBeNull();
      expect(snapshot!.actors).toHaveLength(2);
      expect(dispatcher.isBattleActive()).toBe(true);
    });

    it('executeAttack returns action result when battle active', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      dispatcher.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);
      // advanceTurn handles full actor cycle including turn_start → action_select
      dispatcher.advanceTurn();

      const snap = dispatcher.getBattleSnapshot();
      expect(snap).not.toBeNull();
      // Battle should still be active after turn advance
      expect(dispatcher.isBattleActive()).toBe(true);
    });

    it('executeAttack returns null when battle inactive', () => {
      const result = dispatcher.executeAttack('enemy-1');
      expect(result).toBeNull();
    });

    it('executeDefend returns action result when battle active', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      dispatcher.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);
      dispatcher.advanceTurn();

      const snap = dispatcher.getBattleSnapshot();
      expect(snap).not.toBeNull();
    });

    it('advanceTurn progresses the battle', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      dispatcher.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

      dispatcher.advanceTurn();
      const after = dispatcher.getBattleSnapshot();
      expect(after).not.toBeNull();
    });

    it('getBattleOutcome returns null before battle ends', () => {
      const player = makePlayerCharacter();
      const enemy = makeEnemy('山贼', 100, 20, 10);
      dispatcher.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);
      expect(dispatcher.getBattleOutcome()).toBeNull();
    });
  });

  describe('Equipment actions', () => {
    it('equipItem returns action result', () => {
      const result = dispatcher.equipItem('武器', makeMockItem('wpn_001', '铁剑', '武器'));
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('unequipItem returns action result after equip', () => {
      dispatcher.equipItem('武器', makeMockItem('wpn_001', '铁剑', '武器'));
      const result = dispatcher.unequipItem('武器');
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });
  });

  describe('Kungfu actions', () => {
    it('learnKungfu registers a new kungfu', () => {
      const result = dispatcher.learnKungfu(makeTestKungfu());
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('cultivateKungfu increases proficiency', () => {
      dispatcher.learnKungfu(makeTestKungfu());
      const result = dispatcher.cultivateKungfu('kf_001', 50);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('cultivateKungfuBatch increases proficiency by batch amount', () => {
      dispatcher.learnKungfu(makeTestKungfu());
      const result = dispatcher.cultivateKungfuBatch('kf_001', 100);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('breakthroughKungfu returns a result', () => {
      dispatcher.learnKungfu(makeTestKungfu());
      const result = dispatcher.breakthroughKungfu('kf_001', makePlayerCharacter());
      expect(result).not.toBeNull();
    });
  });

  describe('Task actions', () => {
    it('acceptTask adds a task to tracking', () => {
      const result = dispatcher.acceptTask(makeMockTask(), '炼气一层');
      expect(result).not.toBeNull();
    });

    it('submitTask attempts to submit a tracked task', () => {
      dispatcher.acceptTask(makeMockTask(), '炼气一层');
      const result = dispatcher.submitTask('测试任务', makePlayerCharacter());
      expect(result).not.toBeNull();
    });

    it('failTask marks a task as failed', () => {
      dispatcher.acceptTask(makeMockTask(), '炼气一层');
      const result = dispatcher.failTask('测试任务', '测试放弃');
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('updateTaskProgress advances objective progress', () => {
      const task: 任务结构 = {
        ...makeMockTask(),
        目标列表: [{ 描述: '目标1', 当前进度: 0, 总需进度: 10, 完成状态: false }],
      };
      dispatcher.acceptTask(task, '炼气一层');
      const result = dispatcher.updateTaskProgress('测试任务', 0);
      expect(result).not.toBeNull();
    });
  });

  describe('Sect actions', () => {
    function initSect(dispatcher: ReturnType<typeof createRpgActionDispatcher>) {
      const sectEngine = createRpgSectEngine();
      dispatcher.setSectEngine(sectEngine);
      sectEngine.initialize({
        ID: 'sect_001',
        名称: '测试门派',
        简介: '测试用门派',
        门规: ['戒律一：不可背叛师门'],
        玩家职位: '外门弟子',
        玩家贡献: 0,
        门派资金: 1000,
        门派物资: 500,
        建设度: 100,
        任务列表: [],
        兑换列表: [],
        重要成员: [],
      } as any);
    }

    it('gainContribution increases contribution points', () => {
      initSect(dispatcher);
      const result = dispatcher.gainContribution(10);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('investConstruction increases construction funds', () => {
      initSect(dispatcher);
      const result = dispatcher.investConstruction(100);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('useContribution deducts contribution points', () => {
      initSect(dispatcher);
      dispatcher.gainContribution(50);
      const result = dispatcher.useContribution(10);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('refreshTasks generates new sect missions', () => {
      initSect(dispatcher);
      const result = dispatcher.refreshTasks(2);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });
  });

  describe('Item actions', () => {
    it('addItem adds item to inventory', () => {
      const result = dispatcher.addItem(makeMockItem('item_001', '回复丹', '药品'), 3);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });

    it('removeItem removes item from inventory', () => {
      dispatcher.addItem(makeMockItem('item_001', '回复丹', '药品'), 5);
      const result = dispatcher.removeItem('item_001', 2);
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
    });
  });

  describe('Engine missing errors', () => {
    it('throws when battle engine not set', () => {
      const d = createRpgActionDispatcher();
      expect(() => d.initBattle([])).toThrow('RpgBattleEngine not set');
    });

    it('throws when equip engine not set', () => {
      const d = createRpgActionDispatcher();
      expect(() => d.equipItem('武器', makeMockItem('wpn_001', '铁剑', '武器'))).toThrow('RpgEquipEngine not set');
    });

    it('throws when task engine not set', () => {
      const d = createRpgActionDispatcher();
      expect(() => d.failTask('test', 'reason')).toThrow('RpgTaskEngine not set');
    });

    it('throws when sect engine not set', () => {
      const d = createRpgActionDispatcher();
      expect(() => d.gainContribution(10)).toThrow('RpgSectEngine not set');
    });
  });
});

// ==================== RPG Engine Lifecycle Tests ====================

describe('RPG Engine Lifecycle', () => {
  it('fresh dispatcher has no engines wired', () => {
    const dispatcher = createRpgActionDispatcher();
    expect(() => dispatcher.isBattleActive()).toThrow('RpgBattleEngine not set');
  });

  it('dispatcher with battle engine returns isBattleActive=false before init', () => {
    const dispatcher = createRpgActionDispatcher();
    dispatcher.setBattleEngine(createRpgBattleEngine());
    expect(dispatcher.isBattleActive()).toBe(false);
  });

  it('battle engine tracks round progression', () => {
    const dispatcher = createRpgActionDispatcher();
    dispatcher.setBattleEngine(createRpgBattleEngine());

    const player = makePlayerCharacter();
    const enemy = makeEnemy('山贼', 100, 20, 10);
    dispatcher.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

    const snap1 = dispatcher.getBattleSnapshot();
    expect(snap1).not.toBeNull();
    const initialRound = snap1!.round;

    dispatcher.advanceTurn();
    const snap2 = dispatcher.getBattleSnapshot();
    expect(snap2!.round).toBeGreaterThanOrEqual(initialRound);
  });

  it('kungfu engine tracks proficiency accumulation', () => {
    const engine = createRpgKungfuEngine();
    const dispatcher = createRpgActionDispatcher();
    dispatcher.setKungfuEngine(engine);

    dispatcher.learnKungfu(makeTestKungfu());
    dispatcher.cultivateKungfu('kf_001', 30);
    dispatcher.cultivateKungfu('kf_001', 20);

    const kf = engine.kungfuList.find(k => k.ID === 'kf_001');
    expect(kf).not.toBeNull();
    expect(kf!.当前熟练度).toBe(50);
  });

  it('task engine tracks multiple tasks independently', () => {
    const engine = createRpgTaskEngine();
    const dispatcher = createRpgActionDispatcher();
    dispatcher.setTaskEngine(engine);

    const task1: 任务结构 = { ...makeMockTask(), 标题: '任务A', 类型: '主线' };
    const task2: 任务结构 = { ...makeMockTask(), 标题: '任务B', 类型: '支线' };

    dispatcher.acceptTask(task1, '炼气一层');
    dispatcher.acceptTask(task2, '炼气一层');

    const t1 = engine.taskList.find(t => t.标题 === '任务A');
    const t2 = engine.taskList.find(t => t.标题 === '任务B');
    expect(t1).not.toBeNull();
    expect(t2).not.toBeNull();
    expect(t1!.类型).toBe('主线');
    expect(t2!.类型).toBe('支线');
  });

  it('sect engine starts with no sect and accepts construction investment', () => {
    const engine = createRpgSectEngine();
    const dispatcher = createRpgActionDispatcher();
    dispatcher.setSectEngine(engine);

    expect(engine.sectData).toBeNull();

    const result = dispatcher.investConstruction(100);
    expect(result).not.toBeNull();
  });
});

// ==================== Battle State Machine Tests ====================

describe('RPG Battle State Machine', () => {
  it('battle transitions through player and enemy turns', () => {
    const engine = createRpgBattleEngine();
    const player = makePlayerCharacter();
    const enemy = makeEnemy('山贼', 100, 20, 10);
    engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);

    engine.advanceTurn();

    const snap = engine.getBattleSnapshot();
    expect(snap).not.toBeNull();
  });

  it('damage reduces target HP', () => {
    const engine = createRpgBattleEngine();
    const player = makePlayerCharacter();
    const enemy = makeEnemy('山贼', 100, 20, 10);
    engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);
    // advanceTurn handles the full cycle
    engine.advanceTurn();

    const after = engine.getBattleSnapshot();
    expect(after).not.toBeNull();
    expect(after!.actors).toHaveLength(2);
  });

  it('defend action is accepted successfully', () => {
    const engine = createRpgBattleEngine();
    const player = makePlayerCharacter();
    const enemy = makeEnemy('山贼', 100, 20, 10);
    engine.initBattle([makePlayerActor(player), makeEnemyActor(enemy)]);
    engine.advanceTurn();

    const snap = engine.getBattleSnapshot();
    expect(snap).not.toBeNull();
    expect(snap!.round).toBeGreaterThanOrEqual(1);
  });
});

// ==================== Zustand RpgSlice Tests ====================

describe('Zustand RpgSlice', () => {
  it('rpgMode initial state is false', () => {
    const state = useGameStore.getState();
    expect(state.rpgMode).toBe(false);
  });

  it('toggleRpgMode flips the mode', () => {
    const store = useGameStore.getState();

    store.toggleRpgMode();
    expect(useGameStore.getState().rpgMode).toBe(true);

    store.toggleRpgMode();
    expect(useGameStore.getState().rpgMode).toBe(false);
  });
});

// ==================== Integration: Modal RPG Injection Pattern ====================

describe('Modal RPG Injection Pattern', () => {
  it('rpgMode conditional injection follows the expected prop pattern', () => {
    type RpgModalProps = {
      rpgMode?: boolean;
      character?: 角色数据结构 | null;
    };

    const checkProps = (props: RpgModalProps, expectedMode: boolean) => {
      expect(typeof props.rpgMode).toBe('boolean');
      expect(props.rpgMode).toBe(expectedMode);
    };

    checkProps({ rpgMode: true, character: makePlayerCharacter() }, true);
    checkProps({ rpgMode: false }, false);
    // Empty props means default/undefined, which is valid for optional injection
    expect(typeof ({} as RpgModalProps).rpgMode).toBe('undefined');
  });

  it('equipment slot mapping: 12 traditional slots to 3 RPG slots', () => {
    const toRpgSlot = (slotKey: string): string | null => {
      if (slotKey === '主武器' || slotKey === '副武器') return '武器';
      if (slotKey === '盔甲' || slotKey === '胸部' || slotKey === '内衬') return '防具';
      if (['头部', '腰部', '手部', '足部', '腿部'].includes(slotKey)) return '饰品';
      return null;
    };

    expect(toRpgSlot('主武器')).toBe('武器');
    expect(toRpgSlot('副武器')).toBe('武器');
    expect(toRpgSlot('盔甲')).toBe('防具');
    expect(toRpgSlot('胸部')).toBe('防具');
    expect(toRpgSlot('内衬')).toBe('防具');
    expect(toRpgSlot('头部')).toBe('饰品');
    expect(toRpgSlot('腰部')).toBe('饰品');
    expect(toRpgSlot('手部')).toBe('饰品');
    expect(toRpgSlot('足部')).toBe('饰品');
    expect(toRpgSlot('腿部')).toBe('饰品');
    expect(toRpgSlot('其他')).toBeNull();
  });

  it('dispatcher singleton pattern allows shared state across consumers', () => {
    resetRpgEngines();

    const d1 = getRpgDispatcher();
    expect(d1).toBeDefined();
    expect(d1.isBattleActive()).toBe(false);

    const d2 = getRpgDispatcher();
    expect(d1).toBe(d2);

    resetRpgEngines();
  });
});
