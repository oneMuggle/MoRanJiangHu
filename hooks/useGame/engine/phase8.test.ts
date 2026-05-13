/**
 * phase8.test.ts
 *
 * 阶段八：RPG 装备/物品/功法引擎 — 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RpgEquipEngine, createRpgEquipEngine } from '../engine/rpgEquipEngine';
import { RpgItemEngine, createRpgItemEngine } from '../engine/rpgItemEngine';
import { RpgKungfuEngine, createRpgKungfuEngine } from '../engine/rpgKungfuEngine';
import {
  calculateItemModifiers,
  mergeModifiers,
  applyEquipmentModifiers,
} from '../rpg/equipment/effectCalculator';
import {
  calculateEncumbrance,
  canCarry,
} from '../rpg/equipment/encumbranceCalculator';
import {
  cultivateKungfu,
  cultivateKungfuBatch,
} from '../rpg/kungfu/cultivationManager';
import {
  calculatePassiveEffects,
  mergePassiveEffects,
} from '../rpg/kungfu/passiveEffectCalculator';
import {
  checkBreakthrough,
} from '../rpg/kungfu/breakthroughChecker';
import type { 游戏物品 } from '../../../models/item';
import type { 角色数据结构 } from '../../../models/character';
import type { 功法结构 } from '../../../models/kungfu';

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

function makeWeapon(): 游戏物品 {
  return {
    ID: 'weapon-iron-sword',
    名称: '铁剑',
    类型: '武器',
    最小攻击: 10,
    最大攻击: 20,
    攻速修正: 2,
    重量: 5,
    最大堆叠: 1,
    词条列表: [
      { 属性: '力量+1', 数值: 1, 类型: '固定' },
    ],
  } as unknown as 游戏物品;
}

function makeArmor(): 游戏物品 {
  return {
    ID: 'armor-leather',
    名称: '皮甲',
    类型: '防具',
    物理防御: 5,
    内功防御: 3,
    重量: 8,
    最大堆叠: 1,
    词条列表: [
      { 属性: '体质+2', 数值: 2, 类型: '固定' },
    ],
  } as unknown as 游戏物品;
}

function makeConsumable(): 游戏物品 {
  return {
    ID: 'item-herb',
    名称: '金创药',
    类型: '消耗品',
    重量: 0.5,
    最大堆叠: 10,
    词条列表: [],
  } as unknown as 游戏物品;
}

function makeKungfu(level = 1, proficiency = 0, exp = 100): 功法结构 {
  return {
    ID: 'kungfu-fire',
    名称: '火焰掌',
    品质: '良品',
    当前重数: level,
    最高重数: 10,
    当前熟练度: proficiency,
    升级经验: exp,
    被动修正: [
      { 属性名: '攻击力', 数值: 3, 类型: '固定' },
    ],
  } as unknown as 功法结构;
}

// ==================== RpgEquipEngine Tests ====================

describe('RpgEquipEngine', () => {
  let engine: RpgEquipEngine;

  beforeEach(() => {
    engine = createRpgEquipEngine();
  });

  describe('initialization', () => {
    it('starts with empty equipment slots', () => {
      const eq = engine.equipment;
      expect(eq.武器).toBeUndefined();
      expect(eq.防具).toBeUndefined();
      expect(eq.饰品).toBeUndefined();
    });

    it('returns zero modifiers when nothing equipped', () => {
      const mods = engine.getTotalModifiers();
      expect(mods.攻击力).toBe(0);
      expect(mods.防御力).toBe(0);
    });
  });

  describe('equip/unequip', () => {
    it('can equip a weapon', () => {
      const weapon = makeWeapon();
      const result = engine.equip('武器', weapon);
      expect(result.success).toBe(true);
      expect(engine.equipment.武器).toBe(weapon);
      expect(result.narrativeConstraint).toContain('铁剑');
    });

    it('calculates modifiers after equipping', () => {
      const weapon = makeWeapon();
      engine.equip('武器', weapon);
      const mods = engine.getTotalModifiers();
      expect(mods.攻击力).toBe(15);
      expect(mods.力量).toBe(1);
      expect(mods.速度).toBe(2);
    });

    it('can unequip a weapon', () => {
      const weapon = makeWeapon();
      engine.equip('武器', weapon);
      const result = engine.unequip('武器');
      expect(result.success).toBe(true);
      expect(engine.equipment.武器).toBeUndefined();
    });

    it('fails to unequip empty slot', () => {
      const result = engine.unequip('防具');
      expect(result.success).toBe(false);
    });

    it('replaces existing equipment in same slot', () => {
      const weapon1 = makeWeapon();
      const weapon2 = { ...makeWeapon(), ID: 'weapon-steel', 名称: '钢剑' } as unknown as 游戏物品;
      engine.equip('武器', weapon1);
      engine.equip('武器', weapon2);
      expect(engine.equipment.武器).toBe(weapon2);
    });
  });

  describe('encumbrance', () => {
    it('calculates encumbrance correctly', () => {
      const character = makePlayerCharacter();
      const inventory: 游戏物品[] = [
        { ...makeWeapon(), 堆叠数量: 1 },
        { ...makeArmor(), 堆叠数量: 1 },
      ];
      const result = engine.calculateEncumbrance(character, inventory);
      expect(result.currentWeight).toBe(13);
      expect(result.maxWeight).toBe(95);
      expect(result.isOverloaded).toBe(false);
    });

    it('checks canCarryItem', () => {
      const character = makePlayerCharacter();
      const inventory: 游戏物品[] = [];
      const item = makeWeapon();
      expect(engine.canCarryItem(character, inventory, item)).toBe(true);
    });
  });

  describe('player actions', () => {
    it('handles equip action', () => {
      const weapon = makeWeapon();
      const result = engine.executePlayerAction({
        id: 'action-1',
        engineType: 'rpgEquip',
        type: 'equip',
        payload: { slot: '武器', item: weapon },
        timestamp: Date.now(),
      });
      expect(result.success).toBe(true);
    });

    it('handles unequip action', () => {
      const weapon = makeWeapon();
      engine.equip('武器', weapon);
      const result = engine.executePlayerAction({
        id: 'action-2',
        engineType: 'rpgEquip',
        type: 'unequip',
        payload: { slot: '武器' },
        timestamp: Date.now(),
      });
      expect(result.success).toBe(true);
    });

    it('returns false for unknown action', () => {
      const result = engine.executePlayerAction({
        id: 'action-3',
        engineType: 'rpgEquip',
        type: 'unknown',
        payload: {},
        timestamp: Date.now(),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('SLG interface', () => {
    it('advanceTurn increments turn', () => {
      const r = engine.advanceTurn();
      expect(r.turnNumber).toBe(1);
    });

    it('canExecuteAction returns correct values', () => {
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgEquip', type: 'equip', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgEquip', type: 'unequip', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgEquip', type: 'attack', payload: {}, timestamp: 0 })).toBe(false);
    });

    it('getSnapshot returns valid state', () => {
      const snap = engine.getSnapshot();
      expect(snap.engineStates.rpgEquip).toBeDefined();
    });

    it('getNarrativeConstraints returns valid data', () => {
      const nc = engine.getNarrativeConstraints();
      expect(nc.scene).toBe('装备管理');
    });

    it('reset clears equipment', () => {
      engine.equip('武器', makeWeapon());
      engine.reset();
      expect(engine.equipment.武器).toBeUndefined();
    });
  });

  describe('serialization', () => {
    it('serializes and deserializes equipment state', () => {
      const weapon = makeWeapon();
      engine.equip('武器', weapon);
      engine.advanceTurn();

      const data = engine.serialize();
      expect(data.engineType).toBe('rpgEquip');
      expect(data.turnNumber).toBe(1);

      const restored = RpgEquipEngine.fromJSON(data);
      expect(restored.equipment.武器).toBeDefined();
    });
  });
});

// ==================== RpgItemEngine Tests ====================

describe('RpgItemEngine', () => {
  let engine: RpgItemEngine;

  beforeEach(() => {
    engine = createRpgItemEngine(10);
  });

  describe('initialization', () => {
    it('starts with empty inventory', () => {
      expect(engine.inventory).toHaveLength(0);
      expect(engine.slotCount).toBe(0);
      expect(engine.maxSlots).toBe(10);
    });

    it('reports zero quantity for unknown items', () => {
      expect(engine.getItemQuantity('nonexistent')).toBe(0);
    });

    it('reports false for hasItem on unknown items', () => {
      expect(engine.hasItem('nonexistent')).toBe(false);
    });
  });

  describe('addItem', () => {
    it('adds a new item', () => {
      const item = makeConsumable();
      const result = engine.addItem(item, 3);
      expect(result.success).toBe(true);
      expect(engine.getItemQuantity('item-herb')).toBe(3);
      expect(engine.slotCount).toBe(1);
    });

    it('stacks existing items', () => {
      const item = makeConsumable();
      engine.addItem(item, 3);
      engine.addItem(item, 2);
      expect(engine.getItemQuantity('item-herb')).toBe(5);
      expect(engine.slotCount).toBe(1);
    });

    it('respects max stack limit', () => {
      const item = makeConsumable();
      engine.addItem(item, 8);
      const r2 = engine.addItem(item, 3);
      expect(r2.success).toBe(false);
    });

    it('respects max slot limit', () => {
      for (let i = 0; i < 10; i++) {
        engine.addItem({ ...makeConsumable(), ID: `item-${i}` } as unknown as 游戏物品);
      }
      const result = engine.addItem({ ...makeConsumable(), ID: 'item-new' } as unknown as 游戏物品);
      expect(result.success).toBe(false);
    });
  });

  describe('removeItem', () => {
    it('removes items from inventory', () => {
      const item = makeConsumable();
      engine.addItem(item, 5);
      const result = engine.removeItem('item-herb', 2);
      expect(result.success).toBe(true);
      expect(engine.getItemQuantity('item-herb')).toBe(3);
    });

    it('removes item completely when quantity reaches 0', () => {
      const item = makeConsumable();
      engine.addItem(item, 2);
      engine.removeItem('item-herb', 2);
      expect(engine.getItemQuantity('item-herb')).toBe(0);
      expect(engine.slotCount).toBe(0);
    });

    it('fails when quantity insufficient', () => {
      const item = makeConsumable();
      engine.addItem(item, 1);
      const result = engine.removeItem('item-herb', 5);
      expect(result.success).toBe(false);
    });

    it('fails when item does not exist', () => {
      const result = engine.removeItem('nonexistent');
      expect(result.success).toBe(false);
    });
  });

  describe('useItem', () => {
    it('uses a consumable item', () => {
      const item = makeConsumable();
      engine.addItem(item, 3);
      const character = makePlayerCharacter();
      const result = engine.useItem('item-herb', character, 1);
      expect(result.success).toBe(true);
      expect(engine.getItemQuantity('item-herb')).toBe(2);
    });

    it('fails when item not in inventory', () => {
      const character = makePlayerCharacter();
      const result = engine.useItem('nonexistent', character);
      expect(result.success).toBe(false);
    });

    it('fails when item is not a consumable', () => {
      const weapon = makeWeapon();
      engine.addItem(weapon);
      const character = makePlayerCharacter();
      const result = engine.useItem('weapon-iron-sword', character);
      expect(result.success).toBe(false);
      expect(result.narrativeConstraint).toContain('不是消耗品');
    });
  });

  describe('SLG interface', () => {
    it('advanceTurn increments turn', () => {
      const r = engine.advanceTurn();
      expect(r.turnNumber).toBe(1);
    });

    it('canExecuteAction', () => {
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgItem', type: 'use_item', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgItem', type: 'drop_item', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgItem', type: 'attack', payload: {}, timestamp: 0 })).toBe(false);
    });

    it('getSnapshot', () => {
      engine.addItem(makeConsumable(), 5);
      const snap = engine.getSnapshot();
      expect(snap.engineStates.rpgItem).toBeDefined();
    });

    it('getNarrativeConstraints', () => {
      const nc = engine.getNarrativeConstraints();
      expect(nc.scene).toBe('背包管理');
    });

    it('reset clears inventory', () => {
      engine.addItem(makeConsumable());
      engine.reset();
      expect(engine.inventory).toHaveLength(0);
    });
  });

  describe('serialization', () => {
    it('serializes and deserializes', () => {
      engine.addItem(makeConsumable(), 3);
      engine.advanceTurn();
      const data = engine.serialize();
      expect(data.engineType).toBe('rpgItem');

      const restored = RpgItemEngine.fromJSON(data);
      expect(restored.slotCount).toBe(0);
    });
  });
});

// ==================== RpgKungfuEngine Tests ====================

describe('RpgKungfuEngine', () => {
  let engine: RpgKungfuEngine;

  beforeEach(() => {
    engine = createRpgKungfuEngine();
  });

  describe('initialization', () => {
    it('starts with empty kungfu list', () => {
      expect(engine.kungfuList).toHaveLength(0);
    });

    it('returns zero passive modifiers when no kungfu', () => {
      const mods = engine.getTotalPassiveModifiers();
      expect(mods.攻击力).toBe(0);
    });
  });

  describe('learnKungfu', () => {
    it('learns a new kungfu', () => {
      const kf = makeKungfu();
      const result = engine.learnKungfu(kf);
      expect(result.success).toBe(true);
      expect(engine.kungfuList).toHaveLength(1);
    });

    it('rejects duplicate kungfu', () => {
      const kf = makeKungfu();
      engine.learnKungfu(kf);
      const result = engine.learnKungfu(kf);
      expect(result.success).toBe(false);
      expect(result.narrativeConstraint).toContain('已学会');
    });
  });

  describe('cultivateKungfu', () => {
    it('gains proficiency', () => {
      const kf = makeKungfu();
      engine.learnKungfu(kf);
      const result = engine.cultivateKungfu('kungfu-fire', 50);
      expect(result.success).toBe(true);
      expect(result.narrativeConstraint).toContain('熟练度');
    });

    it('levels up when proficiency reaches threshold', () => {
      const kf = makeKungfu(1, 80);
      engine.learnKungfu(kf);
      const result = engine.cultivateKungfu('kungfu-fire', 20);
      expect(result.success).toBe(true);
      expect(result.keyStep).toBe(true);
      expect(result.narrativeConstraint).toContain('突破到第2重');
    });

    it('fails when kungfu not learned', () => {
      const result = engine.cultivateKungfu('nonexistent', 10);
      expect(result.success).toBe(false);
    });
  });

  describe('cultivateKungfuBatch', () => {
    it('levels up multiple times with large proficiency gain', () => {
      const kf = makeKungfu(1, 50, 100);
      engine.learnKungfu(kf);
      const result = engine.cultivateKungfuBatch('kungfu-fire', 500);
      expect(result.success).toBe(true);
    });

    it('fails when kungfu not learned', () => {
      const result = engine.cultivateKungfuBatch('nonexistent', 100);
      expect(result.success).toBe(false);
    });
  });

  describe('breakthroughKungfu', () => {
    it('breaks through when conditions met', () => {
      const kf = makeKungfu(1, 100);
      engine.learnKungfu(kf);
      const character = { ...makePlayerCharacter(), 境界: '入门' };
      const result = engine.breakthroughKungfu('kungfu-fire', character);
      expect(result.success).toBe(true);
      expect(result.narrativeConstraint).toContain('突破到第2重');
    });

    it('fails when proficiency insufficient', () => {
      const kf = makeKungfu(1, 50);
      engine.learnKungfu(kf);
      const character = makePlayerCharacter();
      const result = engine.breakthroughKungfu('kungfu-fire', character);
      expect(result.success).toBe(false);
    });

    it('fails when character missing', () => {
      engine.learnKungfu(makeKungfu(1, 100));
      const result = engine.executePlayerAction({
        id: 'x', engineType: 'rpgKungfu', type: 'breakthrough',
        payload: { kungfuId: 'kungfu-fire' }, timestamp: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('checkBreakthrough', () => {
    it('checks breakthrough conditions', () => {
      const kf = makeKungfu(1, 100);
      engine.learnKungfu(kf);
      const character = makePlayerCharacter();
      const result = engine.checkBreakthrough('kungfu-fire', character);
      expect(result.canBreakthrough).toBe(false);
    });
  });

  describe('total passive modifiers', () => {
    it('sums passive effects from all kungfu', () => {
      const kf1 = makeKungfu(2, 0);
      const kf2 = { ...makeKungfu(1, 0), ID: 'kungfu-ice', 名称: '寒冰掌', 被动修正: [{ 属性名: '防御力', 数值: 2, 类型: '固定' }] } as unknown as 功法结构;
      engine.learnKungfu(kf1);
      engine.learnKungfu(kf2);
      const mods = engine.getTotalPassiveModifiers();
      expect(mods.攻击力).toBe(6);
      expect(mods.防御力).toBe(2);
    });
  });

  describe('SLG interface', () => {
    it('advanceTurn', () => {
      const r = engine.advanceTurn();
      expect(r.turnNumber).toBe(1);
    });

    it('canExecuteAction', () => {
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgKungfu', type: 'cultivate', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgKungfu', type: 'breakthrough', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgKungfu', type: 'learn', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgKungfu', type: 'attack', payload: {}, timestamp: 0 })).toBe(false);
    });

    it('getSnapshot', () => {
      engine.learnKungfu(makeKungfu());
      const snap = engine.getSnapshot();
      expect(snap.engineStates.rpgKungfu).toBeDefined();
    });

    it('getNarrativeConstraints', () => {
      const nc = engine.getNarrativeConstraints();
      expect(nc.scene).toBe('功法修炼');
    });

    it('reset clears kungfu list', () => {
      engine.learnKungfu(makeKungfu());
      engine.reset();
      expect(engine.kungfuList).toHaveLength(0);
    });
  });

  describe('serialization', () => {
    it('serializes and deserializes', () => {
      engine.learnKungfu(makeKungfu());
      engine.advanceTurn();
      const data = engine.serialize();
      expect(data.engineType).toBe('rpgKungfu');
      expect(data.kungfuCount).toBe(1);

      const restored = RpgKungfuEngine.fromJSON(data);
      expect(restored.kungfuList).toHaveLength(0);
    });
  });
});

// ==================== effectCalculator Tests ====================

describe('effectCalculator', () => {
  it('calculates weapon modifiers', () => {
    const weapon = makeWeapon();
    const mods = calculateItemModifiers(weapon);
    expect(mods.攻击力).toBe(15);
    expect(mods.速度).toBe(2);
    expect(mods.力量).toBe(1);
  });

  it('calculates armor modifiers', () => {
    const armor = makeArmor();
    const mods = calculateItemModifiers(armor);
    expect(mods.防御力).toBe(8);
    expect(mods.体质).toBe(2);
  });

  it('handles items with no affixes', () => {
    const item: 游戏物品 = {
      ID: 'plain-item',
      名称: '普通物品',
      类型: '其他',
      重量: 1,
      词条列表: [],
    } as unknown as 游戏物品;
    const mods = calculateItemModifiers(item);
    expect(mods.攻击力).toBe(0);
    expect(mods.防御力).toBe(0);
  });

  it('merges multiple modifiers', () => {
    const wMods = calculateItemModifiers(makeWeapon());
    const aMods = calculateItemModifiers(makeArmor());
    const merged = mergeModifiers(wMods, aMods);
    expect(merged.攻击力).toBe(15);
    expect(merged.防御力).toBe(8);
    expect(merged.力量).toBe(1);
    expect(merged.体质).toBe(2);
  });

  it('applies equipment modifiers to character', () => {
    const character = makePlayerCharacter();
    const equipment = { 武器: makeWeapon(), 防具: makeArmor() };
    const mods = applyEquipmentModifiers(character, equipment);
    expect(mods.攻击力).toBe(15);
    expect(mods.防御力).toBe(8);
  });

  it('returns zero for empty equipment', () => {
    const character = makePlayerCharacter();
    const mods = applyEquipmentModifiers(character, {});
    expect(mods.攻击力).toBe(0);
  });
});

// ==================== encumbranceCalculator Tests ====================

describe('encumbranceCalculator', () => {
  it('calculates normal encumbrance', () => {
    const character = makePlayerCharacter();
    const inventory: 游戏物品[] = [{ ...makeWeapon(), 堆叠数量: 1 }];
    const result = calculateEncumbrance(character, inventory);
    expect(result.currentWeight).toBe(5);
    expect(result.maxWeight).toBe(95);
    expect(result.isOverloaded).toBe(false);
    expect(result.speedPenalty).toBe(1.0);
  });

  it('detects overloaded state (>80%)', () => {
    const character = { ...makePlayerCharacter(), 体质: 1, 力量: 1 };
    const inventory: 游戏物品[] = [{ ...makeWeapon(), 重量: 7, 堆叠数量: 1 }];
    const result = calculateEncumbrance(character, inventory);
    expect(result.currentWeight).toBe(7);
    expect(result.maxWeight).toBe(8);
    expect(result.isOverloaded).toBe(true);
    expect(result.speedPenalty).toBe(0.7);
  });

  it('detects critical overloaded state (>100%)', () => {
    const character = { ...makePlayerCharacter(), 体质: 1, 力量: 1 };
    const inventory: 游戏物品[] = [{ ...makeWeapon(), 重量: 9, 堆叠数量: 1 }];
    const result = calculateEncumbrance(character, inventory);
    expect(result.isCriticalOverload).toBe(true);
    expect(result.speedPenalty).toBe(0.4);
  });

  it('canCarry returns true when within limit', () => {
    const character = makePlayerCharacter();
    const inventory: 游戏物品[] = [];
    expect(canCarry(character, inventory, makeWeapon())).toBe(true);
  });

  it('canCarry returns false when over limit', () => {
    const character = { ...makePlayerCharacter(), 体质: 1, 力量: 1 };
    const inventory: 游戏物品[] = [{ ...makeWeapon(), 重量: 7, 堆叠数量: 1 }];
    const item = { ...makeWeapon(), 重量: 2 } as unknown as 游戏物品;
    expect(canCarry(character, inventory, item)).toBe(false);
  });

  it('accounts for stack quantity in weight', () => {
    const character = makePlayerCharacter();
    const inventory: 游戏物品[] = [{ ...makeConsumable(), 堆叠数量: 5 }];
    const result = calculateEncumbrance(character, inventory);
    expect(result.currentWeight).toBe(2.5);
  });
});

// ==================== cultivationManager Tests ====================

describe('cultivationManager', () => {
  it('gains proficiency without level up', () => {
    const kf = makeKungfu(1, 30);
    const result = cultivateKungfu(kf, 20);
    expect(result.success).toBe(true);
    expect(result.newProficiency).toBe(50);
    expect(result.levelUp).toBe(false);
  });

  it('levels up when proficiency reaches threshold', () => {
    const kf = makeKungfu(1, 80);
    const result = cultivateKungfu(kf, 20);
    expect(result.success).toBe(true);
    expect(result.newProficiency).toBe(100);
    expect(result.levelUp).toBe(true);
    expect(result.newLevel).toBe(2);
  });

  it('fails at max level', () => {
    const kf = makeKungfu(10, 0);
    const result = cultivateKungfu(kf, 100);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('已达最高重数');
  });

  it('batch cultivation levels up multiple times', () => {
    const kf = makeKungfu(1, 50, 100);
    const result = cultivateKungfuBatch(kf, 300);
    expect(result.success).toBe(true);
    expect(result.newLevel).toBe(4);
  });

  it('batch cultivation fails at max level', () => {
    const kf = makeKungfu(10, 0);
    const result = cultivateKungfuBatch(kf, 100);
    expect(result.success).toBe(false);
  });
});

// ==================== passiveEffectCalculator Tests ====================

describe('passiveEffectCalculator', () => {
  it('calculates passive effects scaled by level', () => {
    const kf = makeKungfu(3, 0);
    const mods = calculatePassiveEffects(kf);
    expect(mods.攻击力).toBe(9);
  });

  it('handles percentage modifiers', () => {
    const kf = {
      ...makeKungfu(1, 0),
      被动修正: [{ 属性名: '暴击率', 数值: 5, 类型: '百分比' }],
    } as unknown as 功法结构;
    const mods = calculatePassiveEffects(kf);
    expect(mods.暴击率).toBe(0.05);
  });

  it('merges multiple passive effects', () => {
    const kf1 = { ...makeKungfu(1, 0), ID: 'kf1', 被动修正: [{ 属性名: '攻击力', 数值: 5, 类型: '固定' }] } as unknown as 功法结构;
    const kf2 = { ...makeKungfu(2, 0), ID: 'kf2', 被动修正: [{ 属性名: '攻击力', 数值: 3, 类型: '固定' }] } as unknown as 功法结构;
    const m1 = calculatePassiveEffects(kf1);
    const m2 = calculatePassiveEffects(kf2);
    const merged = mergePassiveEffects(m1, m2);
    expect(merged.攻击力).toBe(11);
  });
});

// ==================== breakthroughChecker Tests ====================

describe('breakthroughChecker', () => {
  it('allows breakthrough when all conditions met', () => {
    const kf = makeKungfu(1, 100);
    const character = { ...makePlayerCharacter(), 境界: '入门' };
    const result = checkBreakthrough(kf, character);
    expect(result.canBreakthrough).toBe(true);
    expect(result.blockedBy).toHaveLength(0);
  });

  it('blocks due to insufficient proficiency', () => {
    const kf = makeKungfu(1, 50);
    const character = { ...makePlayerCharacter(), 境界: '入门' };
    const result = checkBreakthrough(kf, character);
    expect(result.canBreakthrough).toBe(false);
    expect(result.blockedBy).toContain('熟练度不足');
  });

  it('blocks due to insufficient realm', () => {
    const kf = makeKungfu(1, 100);
    const character = { ...makePlayerCharacter(), 境界: '初学' };
    const result = checkBreakthrough(kf, character);
    expect(result.canBreakthrough).toBe(false);
    expect(result.blockedBy.some(b => b.includes('境界'))).toBe(true);
  });

  it('blocks at max level', () => {
    const kf = makeKungfu(10, 100);
    const character = makePlayerCharacter();
    const result = checkBreakthrough(kf, character);
    expect(result.canBreakthrough).toBe(false);
    expect(result.blockedBy).toContain('已达最高重数');
  });
});
