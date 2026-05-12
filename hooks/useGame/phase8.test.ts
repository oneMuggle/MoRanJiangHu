/**
 * Phase 8 单元测试 — 装备/物品/功法引擎 + 子组件
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateItemModifiers,
  mergeModifiers,
  applyEquipmentModifiers,
} from './rpg/equipment/effectCalculator';
import { calculateEncumbrance, canCarry } from './rpg/equipment/encumbranceCalculator';
import { InventoryManager } from './rpg/inventory/inventoryManager';
import { cultivateKungfu, cultivateKungfuBatch } from './rpg/kungfu/cultivationManager';
import { checkBreakthrough } from './rpg/kungfu/breakthroughChecker';
import { calculatePassiveEffects, mergePassiveEffects } from './rpg/kungfu/passiveEffectCalculator';
import { RpgEquipEngine, createRpgEquipEngine } from './engine/rpgEquipEngine';
import { RpgItemEngine, createRpgItemEngine } from './engine/rpgItemEngine';
import { RpgKungfuEngine, createRpgKungfuEngine } from './engine/rpgKungfuEngine';
import type { 游戏物品 } from '../../models/item';
import type { 角色数据结构 } from '../../models/character';
import type { 功法结构 } from '../../models/kungfu';

// ==================== Helpers ====================

function makePlayerCharacter(): 角色数据结构 {
  return {
    ID: 'player-1',
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

function makeWeapon(name: string, minAtk: number, maxAtk: number, speed = 0): 游戏物品 {
  return {
    ID: `weapon-${name}`,
    名称: name,
    类型: '武器',
    最小攻击: minAtk,
    最大攻击: maxAtk,
    攻速修正: speed,
    格挡率: 0,
    词条列表: [],
    重量: 5,
    最大堆叠: 1,
  } as unknown as 游戏物品;
}

function makeArmor(name: string, physDef: number, magicDef: number): 游戏物品 {
  return {
    ID: `armor-${name}`,
    名称: name,
    类型: '防具',
    物理防御: physDef,
    内功防御: magicDef,
    覆盖部位: '胸部',
    词条列表: [],
    重量: 10,
    最大堆叠: 1,
  } as unknown as 游戏物品;
}

function makeConsumable(name: string): 游戏物品 {
  return {
    ID: `consumable-${name}`,
    名称: name,
    类型: '消耗品',
    词条列表: [],
    重量: 1,
    最大堆叠: 99,
  } as unknown as 游戏物品;
}

function makeKungfu(name: string, quality: string, baseDmg = 20): 功法结构 {
  return {
    ID: `kungfu-${name}`,
    名称: name,
    功法类型: '外功',
    品质: quality,
    基础伤害: baseDmg,
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
    被动修正: [],
  } as unknown as 功法结构;
}

// ==================== Equipment: effectCalculator ====================

describe('effectCalculator', () => {
  it('calculates weapon modifiers', () => {
    const weapon = makeWeapon('铁剑', 10, 20);
    const mods = calculateItemModifiers(weapon);

    expect(mods.攻击力).toBe(15); // (10 + 20) / 2
    expect(mods.速度).toBe(0);
  });

  it('calculates weapon with speed', () => {
    const weapon = makeWeapon('快剑', 10, 20, 2);
    const mods = calculateItemModifiers(weapon);

    expect(mods.速度).toBe(2);
  });

  it('calculates armor modifiers', () => {
    const armor = makeArmor('皮甲', 5, 3);
    const mods = calculateItemModifiers(armor);

    expect(mods.防御力).toBe(8); // 5 + 3
  });

  it('calculates affix modifiers', () => {
    const weapon = makeWeapon('铁剑', 10, 20, 0);
    weapon.词条列表 = [
      { 名称: '力量强化', 属性: '力量+5', 数值: 5, 类型: '固定值' },
      { 名称: '暴击强化', 属性: '暴击+10%', 数值: 10, 类型: '百分比' },
    ];
    const mods = calculateItemModifiers(weapon);

    expect(mods.力量).toBe(5);
    expect(mods.暴击率).toBe(0.1);
  });

  it('merges multiple modifiers', () => {
    const weapon = makeWeapon('铁剑', 10, 20);
    const armor = makeArmor('皮甲', 5, 3);
    const merged = mergeModifiers(
      calculateItemModifiers(weapon),
      calculateItemModifiers(armor),
    );

    expect(merged.攻击力).toBe(15);
    expect(merged.防御力).toBe(8);
  });

  it('applyEquipmentModifiers returns zero for empty equipment', () => {
    const result = applyEquipmentModifiers({} as 角色数据结构, {});
    expect(result.攻击力).toBe(0);
    expect(result.防御力).toBe(0);
  });
});

// ==================== Equipment: encumbranceCalculator ====================

describe('encumbranceCalculator', () => {
  it('calculates normal encumbrance', () => {
    const character = makePlayerCharacter();
    const inventory: 游戏物品[] = [makeWeapon('铁剑', 10, 20)];
    const result = calculateEncumbrance(character, inventory);

    expect(result.currentWeight).toBe(5);
    expect(result.maxWeight).toBe(95); // 10*5 + 15*3
    expect(result.loadPercentage).toBeLessThan(0.8);
    expect(result.isOverloaded).toBe(false);
    expect(result.speedPenalty).toBe(1.0);
  });

  it('detects overload (>80%)', () => {
    const character = makePlayerCharacter();
    const inventory: 游戏物品[] = [makeArmor('重甲', 20, 20)];
    inventory[0].重量 = 80;
    const result = calculateEncumbrance(character, inventory);

    expect(result.isOverloaded).toBe(true);
    expect(result.speedPenalty).toBe(0.7);
  });

  it('detects critical overload (>100%)', () => {
    const character = makePlayerCharacter();
    const inventory: 游戏物品[] = [makeArmor('超重甲', 30, 30)];
    inventory[0].重量 = 100;
    const result = calculateEncumbrance(character, inventory);

    expect(result.isCriticalOverload).toBe(true);
    expect(result.speedPenalty).toBe(0.4);
  });

  it('canCarry checks weight limit', () => {
    const character = makePlayerCharacter();
    const inventory: 游戏物品[] = [];
    const newItem = makeWeapon('铁剑', 10, 20);

    expect(canCarry(character, inventory, newItem)).toBe(true);
  });
});

// ==================== Inventory: inventoryManager ====================

describe('InventoryManager', () => {
  let manager: InventoryManager;

  beforeEach(() => {
    manager = new InventoryManager(10);
  });

  it('adds items', () => {
    const item = makeConsumable('回春丹');
    const result = manager.addItem(item, 5);

    expect(result.success).toBe(true);
    expect(result.updatedQuantity).toBe(5);
    expect(manager.slotCount).toBe(1);
  });

  it('stacks items', () => {
    const item = makeConsumable('回春丹');
    manager.addItem(item, 3);
    const result = manager.addItem(item, 2);

    expect(result.success).toBe(true);
    expect(result.updatedQuantity).toBe(5);
    expect(manager.slotCount).toBe(1);
  });

  it('respects max stack limit', () => {
    const item = makeConsumable('回春丹');
    manager.addItem(item, 99);
    const result = manager.addItem(item, 1);

    expect(result.success).toBe(false);
  });

  it('rejects when inventory is full', () => {
    for (let i = 0; i < 10; i++) {
      manager.addItem(makeConsumable(`物品${i}`));
    }
    const result = manager.addItem(makeConsumable('新物品'));

    expect(result.success).toBe(false);
    expect(result.reason).toBe('背包已满');
  });

  it('removes items', () => {
    const item = makeConsumable('回春丹');
    manager.addItem(item, 5);
    const result = manager.removeItem(item.ID, 2);

    expect(result.success).toBe(true);
    expect(result.updatedQuantity).toBe(3);
  });

  it('removes slot when quantity reaches zero', () => {
    const item = makeConsumable('回春丹');
    manager.addItem(item, 3);
    manager.removeItem(item.ID, 3);

    expect(manager.slotCount).toBe(0);
  });

  it('checks item existence', () => {
    const item = makeConsumable('回春丹');
    manager.addItem(item, 5);

    expect(manager.hasItem(item.ID)).toBe(true);
    expect(manager.hasItem(item.ID, 10)).toBe(false);
    expect(manager.hasItem('nonexistent')).toBe(false);
  });

  it('clears inventory', () => {
    manager.addItem(makeConsumable('A'));
    manager.addItem(makeConsumable('B'));
    manager.clear();

    expect(manager.slotCount).toBe(0);
  });
});

// ==================== Kungfu: cultivationManager ====================

describe('cultivationManager', () => {
  it('cultivates without level up', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    const result = cultivateKungfu(kungfu, 50);

    expect(result.success).toBe(true);
    expect(result.levelUp).toBe(false);
    expect(result.newProficiency).toBe(50);
    expect(result.newLevel).toBe(1);
  });

  it('levels up when proficiency exceeds threshold', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    const result = cultivateKungfu(kungfu, 120);

    expect(result.success).toBe(true);
    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('fails at max level', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    kungfu.当前重数 = 10;
    const result = cultivateKungfu(kungfu, 50);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('已达最高重数');
  });

  it('batch cultivates across multiple levels', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    const result = cultivateKungfuBatch(kungfu, 350);

    expect(result.success).toBe(true);
    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(4); // 1 + 3 full levels (300), 50 remaining
  });

  it('batch cultivation stops at max level', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    kungfu.最高重数 = 3;
    const result = cultivateKungfuBatch(kungfu, 500);

    expect(result.success).toBe(true);
    expect(result.newLevel).toBe(3);
  });
});

// ==================== Kungfu: breakthroughChecker ====================

describe('breakthroughChecker', () => {
  it('allows breakthrough when conditions met', () => {
    const kungfu = makeKungfu('火焰掌', '凡品');
    kungfu.当前熟练度 = 100;
    const character = makePlayerCharacter();

    const result = checkBreakthrough(kungfu, character);

    expect(result.canBreakthrough).toBe(true);
    expect(result.blockedBy).toHaveLength(0);
  });

  it('blocks when proficiency insufficient', () => {
    const kungfu = makeKungfu('火焰掌', '凡品');
    kungfu.当前熟练度 = 50;
    const character = makePlayerCharacter();

    const result = checkBreakthrough(kungfu, character);

    expect(result.canBreakthrough).toBe(false);
    expect(result.blockedBy).toContain('熟练度不足');
  });

  it('blocks when at max level', () => {
    const kungfu = makeKungfu('火焰掌', '凡品');
    kungfu.当前重数 = 10;
    const character = makePlayerCharacter();

    const result = checkBreakthrough(kungfu, character);

    expect(result.canBreakthrough).toBe(false);
    expect(result.blockedBy).toContain('已达最高重数');
  });

  it('blocks when realm insufficient', () => {
    const kungfu = makeKungfu('神功', '神品'); // requires 宗师
    kungfu.当前熟练度 = 100;
    const character = makePlayerCharacter(); // 初学

    const result = checkBreakthrough(kungfu, character);

    expect(result.canBreakthrough).toBe(false);
    expect(result.blockedBy.some((b) => b.includes('境界不足'))).toBe(true);
  });
});

// ==================== Kungfu: passiveEffectCalculator ====================

describe('passiveEffectCalculator', () => {
  it('calculates passive effects from modifiers', () => {
    const kungfu = makeKungfu('内功心法', '良品');
    kungfu.被动修正 = [
      { 属性名: '力量', 数值: 3, 类型: '固定值' },
      { 属性名: '攻击力', 数值: 5, 类型: '固定值' },
    ];
    kungfu.当前重数 = 2;

    const mods = calculatePassiveEffects(kungfu);

    expect(mods.力量).toBe(6); // 3 * 2
    expect(mods.攻击力).toBe(10); // 5 * 2
  });

  it('applies percentage type correctly', () => {
    const kungfu = makeKungfu('内功心法', '良品');
    kungfu.被动修正 = [
      { 属性名: '暴击率', 数值: 10, 类型: '百分比' },
    ];

    const mods = calculatePassiveEffects(kungfu);

    expect(mods.暴击率).toBe(0.1);
  });

  it('merges passive effects', () => {
    const k1 = makeKungfu('功法A', '良品');
    k1.被动修正 = [{ 属性名: '力量', 数值: 2, 类型: '固定值' }];
    const k2 = makeKungfu('功法B', '良品');
    k2.被动修正 = [{ 属性名: '敏捷', 数值: 3, 类型: '固定值' }];

    const merged = mergePassiveEffects(
      calculatePassiveEffects(k1),
      calculatePassiveEffects(k2),
    );

    expect(merged.力量).toBe(2);
    expect(merged.敏捷).toBe(3);
  });

  it('returns zero for no passive corrections', () => {
    const kungfu = makeKungfu('基础拳法', '凡品');
    const mods = calculatePassiveEffects(kungfu);

    expect(mods.力量).toBe(0);
    expect(mods.攻击力).toBe(0);
  });
});

// ==================== Engine: RpgEquipEngine ====================

describe('RpgEquipEngine', () => {
  let engine: RpgEquipEngine;

  beforeEach(() => {
    engine = createRpgEquipEngine();
  });

  it('starts with empty equipment', () => {
    expect(engine.equipment.武器).toBeUndefined();
    expect(engine.equipment.防具).toBeUndefined();
  });

  it('equips items', () => {
    const weapon = makeWeapon('铁剑', 10, 20);
    const result = engine.equip('武器', weapon);

    expect(result.success).toBe(true);
    expect(engine.equipment.武器).toBe(weapon);
  });

  it('unequips items', () => {
    const weapon = makeWeapon('铁剑', 10, 20);
    engine.equip('武器', weapon);
    const result = engine.unequip('武器');

    expect(result.success).toBe(true);
    expect(engine.equipment.武器).toBeUndefined();
  });

  it('rejects unequip empty slot', () => {
    const result = engine.unequip('武器');

    expect(result.success).toBe(false);
  });

  it('calculates total modifiers', () => {
    engine.equip('武器', makeWeapon('铁剑', 10, 20));
    engine.equip('防具', makeArmor('皮甲', 5, 3));

    const mods = engine.getTotalModifiers();
    expect(mods.攻击力).toBe(15);
    expect(mods.防御力).toBe(8);
  });

  it('advanceTurn increments turn number', () => {
    const result = engine.advanceTurn();
    expect(result.turnNumber).toBe(1);
  });

  it('executePlayerAction handles equip', () => {
    const weapon = makeWeapon('铁剑', 10, 20);
    const result = engine.executePlayerAction({
      id: 'action-1',
      engineType: 'rpgEquip',
      type: 'equip',
      payload: { slot: '武器', item: weapon },
      timestamp: Date.now(),
    });

    expect(result.success).toBe(true);
  });

  it('getSnapshot returns equipment state', () => {
    engine.equip('武器', makeWeapon('铁剑', 10, 20));
    const snapshot = engine.getSnapshot();

    const equipState = snapshot.engineStates.rpgEquip.equipment as Record<string, string | undefined>;
    expect(equipState.武器).toBe('weapon-铁剑');
  });
});

// ==================== Engine: RpgItemEngine ====================

describe('RpgItemEngine', () => {
  let engine: RpgItemEngine;

  beforeEach(() => {
    engine = createRpgItemEngine(10);
  });

  it('starts with empty inventory', () => {
    expect(engine.slotCount).toBe(0);
  });

  it('adds items', () => {
    const item = makeConsumable('回春丹');
    const result = engine.addItem(item, 5);

    expect(result.success).toBe(true);
    expect(engine.slotCount).toBe(1);
  });

  it('uses consumable items', () => {
    const item = makeConsumable('回春丹');
    engine.addItem(item, 5);
    const result = engine.useItem(item.ID, makePlayerCharacter(), 1);

    expect(result.success).toBe(true);
    expect(engine.getItemQuantity(item.ID)).toBe(4);
  });

  it('rejects using non-consumable', () => {
    const weapon = makeWeapon('铁剑', 10, 20);
    engine.addItem(weapon, 1);
    const result = engine.useItem(weapon.ID, makePlayerCharacter());

    expect(result.success).toBe(false);
  });

  it('drops items', () => {
    const item = makeConsumable('回春丹');
    engine.addItem(item, 5);
    const result = engine.executePlayerAction({
      id: 'action-1',
      engineType: 'rpgItem',
      type: 'drop_item',
      payload: { itemId: item.ID, quantity: 2 },
      timestamp: Date.now(),
    });

    expect(result.success).toBe(true);
    expect(engine.getItemQuantity(item.ID)).toBe(3);
  });

  it('getSnapshot returns inventory state', () => {
    engine.addItem(makeConsumable('A'), 3);
    const snapshot = engine.getSnapshot();

    expect(snapshot.engineStates.rpgItem.slotCount).toBe(1);
  });
});

// ==================== Engine: RpgKungfuEngine ====================

describe('RpgKungfuEngine', () => {
  let engine: RpgKungfuEngine;

  beforeEach(() => {
    engine = createRpgKungfuEngine();
  });

  it('starts with empty kungfu list', () => {
    expect(engine.kungfuList).toHaveLength(0);
  });

  it('learns new kungfu', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    const result = engine.learnKungfu(kungfu);

    expect(result.success).toBe(true);
    expect(engine.kungfuList).toHaveLength(1);
  });

  it('rejects duplicate learn', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    engine.learnKungfu(kungfu);
    const result = engine.learnKungfu(kungfu);

    expect(result.success).toBe(false);
  });

  it('cultivates kungfu', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    engine.learnKungfu(kungfu);
    const result = engine.cultivateKungfu(kungfu.ID, 50);

    expect(result.success).toBe(true);
  });

  it('levels up through cultivation', () => {
    const kungfu = makeKungfu('火焰掌', '良品');
    engine.learnKungfu(kungfu);
    const result = engine.cultivateKungfu(kungfu.ID, 120);

    expect(result.keyStep).toBe(true);
    expect(result.stateUpdates.level).toBe(2);
  });

  it('checks breakthrough conditions', () => {
    const kungfu = makeKungfu('火焰掌', '凡品');
    kungfu.当前熟练度 = 100;
    engine.learnKungfu(kungfu);

    const result = engine.checkBreakthrough(kungfu.ID, makePlayerCharacter());

    expect(result.canBreakthrough).toBe(true);
  });

  it('calculates total passive modifiers', () => {
    const kungfu = makeKungfu('内功心法', '良品');
    kungfu.被动修正 = [{ 属性名: '力量', 数值: 2, 类型: '固定值' }];
    engine.learnKungfu(kungfu);

    const mods = engine.getTotalPassiveModifiers();
    expect(mods.力量).toBe(2);
  });

  it('getSnapshot returns kungfu state', () => {
    engine.learnKungfu(makeKungfu('火焰掌', '良品'));
    const snapshot = engine.getSnapshot();

    expect(snapshot.engineStates.rpgKungfu.kungfuCount).toBe(1);
  });

  it('reset clears all kungfu', () => {
    engine.learnKungfu(makeKungfu('火焰掌', '良品'));
    engine.reset();

    expect(engine.kungfuList).toHaveLength(0);
  });
});
