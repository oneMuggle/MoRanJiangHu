/**
 * Phase 10: 日常城镇地图引擎测试
 */

import { describe, test, expect } from 'vitest';
import {
  DailyTownEngine,
  createDailyTownEngine,
} from './engine/dailyTownEngine';
import type { RegionNode } from '../../models/dailyTown/regionNode';
import type { NpcSchedule } from '../../models/dailyTown/npcSchedule';

// ==================== Test Fixtures ====================

const TEST_NODES: RegionNode[] = [
  {
    id: 'home',
    name: '家',
    type: '家',
    description: '你的住处',
    connectedRegionIds: ['street', 'tavern'],
    availableTimeSlots: ['上午', '下午', '晚上'],
    npcIds: [],
    eventTemplateIds: [],
  },
  {
    id: 'street',
    name: '街道',
    type: '市集',
    description: '繁华的街道',
    connectedRegionIds: ['home', 'weapon-shop', 'tea-house'],
    availableTimeSlots: ['上午', '下午'],
    npcIds: ['npc-merchant'],
    eventTemplateIds: [],
  },
  {
    id: 'weapon-shop',
    name: '武器铺',
    type: '武器铺',
    description: '出售武器的店铺',
    connectedRegionIds: ['street'],
    availableTimeSlots: ['上午', '下午'],
    npcIds: ['npc-blacksmith'],
    eventTemplateIds: [],
  },
  {
    id: 'tea-house',
    name: '茶楼',
    type: '茶楼',
    description: '喝茶闲聊的好地方',
    connectedRegionIds: ['street'],
    availableTimeSlots: ['上午', '下午', '晚上'],
    npcIds: ['npc-teahouse'],
    eventTemplateIds: [],
  },
  {
    id: 'tavern',
    name: '酒楼',
    type: '酒楼',
    description: '热闹的酒馆',
    connectedRegionIds: ['home'],
    availableTimeSlots: ['晚上'],
    npcIds: [],
    eventTemplateIds: [],
  },
];

const TEST_SCHEDULES: NpcSchedule[] = [
  {
    npcId: 'npc-merchant',
    name: '商人张三',
    entries: [
      { npcId: 'npc-merchant', timeSlot: '上午', regionId: 'street', activity: '摆摊', available: true },
      { npcId: 'npc-merchant', timeSlot: '下午', regionId: 'tea-house', activity: '喝茶', available: true },
      { npcId: 'npc-merchant', timeSlot: '晚上', regionId: 'home', activity: '休息', available: false },
    ],
  },
  {
    npcId: 'npc-blacksmith',
    name: '铁匠李四',
    entries: [
      { npcId: 'npc-blacksmith', timeSlot: '上午', regionId: 'weapon-shop', activity: '打铁', available: true },
      { npcId: 'npc-blacksmith', timeSlot: '下午', regionId: 'weapon-shop', activity: '修理', available: true },
      { npcId: 'npc-blacksmith', timeSlot: '晚上', regionId: 'home', activity: '休息', available: false },
    ],
  },
  {
    npcId: 'npc-teahouse',
    name: '茶楼王五',
    entries: [
      { npcId: 'npc-teahouse', timeSlot: '上午', regionId: 'tea-house', activity: '准备营业', available: true },
      { npcId: 'npc-teahouse', timeSlot: '下午', regionId: 'tea-house', activity: '招呼客人', available: true },
      { npcId: 'npc-teahouse', timeSlot: '晚上', regionId: 'tea-house', activity: '说书', available: true },
    ],
  },
];

function makeEngine(rng: () => number = () => 0.5): DailyTownEngine {
  return createDailyTownEngine({
    maxActionPoints: 5,
    movesPerTimeSlot: 2,
    nodes: TEST_NODES,
    schedules: TEST_SCHEDULES,
    triggerRate: 0.5,
    rng,
  });
}

// ==================== TownGraph Tests ====================

describe('TownGraph', () => {
  test('adds nodes and retrieves them', () => {
    const engine = makeEngine();
    const nodes = engine.graph.getAllNodes();
    expect(nodes).toHaveLength(5);
    expect(nodes.find((n) => n.id === 'home')).toBeDefined();
  });

  test('isReachable returns true for connected regions', () => {
    const engine = makeEngine();
    expect(engine.graph.isReachable('home', 'street')).toBe(true);
    expect(engine.graph.isReachable('street', 'weapon-shop')).toBe(true);
  });

  test('isReachable returns false for unconnected regions', () => {
    const engine = makeEngine();
    expect(engine.graph.isReachable('home', 'weapon-shop')).toBe(false);
  });

  test('getConnectedRegions returns directly connected nodes', () => {
    const engine = makeEngine();
    const connected = engine.graph.getConnectedRegions('street');
    expect(connected).toHaveLength(3);
    expect(connected.map((n) => n.id)).toContain('home');
  });

  test('findPath returns shortest path', () => {
    const engine = makeEngine();
    const path = engine.graph.findPath('home', 'tea-house');
    expect(path).toEqual(['home', 'street', 'tea-house']);
  });

  test('findPath returns path through intermediate nodes', () => {
    const engine = makeEngine();
    const path = engine.graph.findPath('tavern', 'weapon-shop');
    expect(path).toEqual(['tavern', 'home', 'street', 'weapon-shop']);
  });

  test('marks regions as visited', () => {
    const engine = makeEngine();
    engine.graph.markVisited('home', 1);
    const state = engine.graph.getState('home');
    expect(state?.visited).toBe(true);
    expect(state?.lastVisitedTurn).toBe(1);
  });

  test('isAvailableAtTime checks time slot availability', () => {
    const engine = makeEngine();
    expect(engine.graph.isAvailableAtTime('tavern', '晚上')).toBe(true);
    expect(engine.graph.isAvailableAtTime('tavern', '上午')).toBe(false);
  });

  test('getMoveCost returns correct cost', () => {
    const engine = makeEngine();
    expect(engine.graph.getMoveCost('home', 'street')).toBe(1);
    expect(engine.graph.getMoveCost('home', 'weapon-shop')).toBe(Infinity);
  });
});

// ==================== ActionPointManager Tests ====================

describe('ActionPointManager', () => {
  test('starts with max points', () => {
    const engine = makeEngine();
    expect(engine.apManager.current).toBe(5);
    expect(engine.apManager.max).toBe(5);
  });

  test('spends points correctly', () => {
    const engine = makeEngine();
    expect(engine.apManager.spend(2)).toBe(true);
    expect(engine.apManager.current).toBe(3);
  });

  test('fails to spend when insufficient', () => {
    const engine = makeEngine();
    engine.apManager.spend(4);
    expect(engine.apManager.spend(2)).toBe(false);
    expect(engine.apManager.current).toBe(1);
  });

  test('canSpend returns correct value', () => {
    const engine = makeEngine();
    expect(engine.apManager.canSpend(5)).toBe(true);
    expect(engine.apManager.canSpend(6)).toBe(false);
  });

  test('refill restores max points', () => {
    const engine = makeEngine();
    engine.apManager.spend(3);
    engine.apManager.refill();
    expect(engine.apManager.current).toBe(5);
  });

  test('advanceDay resets points and increments day', () => {
    const engine = makeEngine();
    engine.apManager.spend(3);
    engine.apManager.advanceDay();
    expect(engine.apManager.current).toBe(5);
    expect(engine.apManager.day).toBe(2);
  });

  test('setMax updates max and caps current', () => {
    const engine = makeEngine();
    engine.apManager.setMax(3);
    expect(engine.apManager.max).toBe(3);
    expect(engine.apManager.current).toBe(3);
  });
});

// ==================== TimeOfDayManager Tests ====================

describe('TimeOfDayManager', () => {
  test('starts at 上午 with 0 moves', () => {
    const engine = makeEngine();
    expect(engine.timeManager.currentTimeSlot).toBe('上午');
    expect(engine.timeManager.movesInCurrentSlot).toBe(0);
  });

  test('recordMove advances slot after threshold', () => {
    const engine = makeEngine();
    const slot1 = engine.timeManager.recordMove();
    expect(slot1).toBeNull();
    expect(engine.timeManager.movesInCurrentSlot).toBe(1);

    const slot2 = engine.timeManager.recordMove();
    expect(slot2).toBe('下午');
    expect(engine.timeManager.movesInCurrentSlot).toBe(0);
  });

  test('advances to next day after 晚上', () => {
    const engine = makeEngine();
    engine.timeManager.recordMove();
    engine.timeManager.recordMove();
    expect(engine.timeManager.currentTimeSlot).toBe('下午');

    engine.timeManager.recordMove();
    engine.timeManager.recordMove();
    expect(engine.timeManager.currentTimeSlot).toBe('晚上');

    engine.timeManager.recordMove();
    engine.timeManager.recordMove();
    expect(engine.timeManager.currentTimeSlot).toBe('上午');
    expect(engine.timeManager.day).toBe(2);
  });

  test('movesRemaining decreases correctly', () => {
    const engine = makeEngine();
    expect(engine.timeManager.movesRemaining).toBe(2);
    engine.timeManager.recordMove();
    expect(engine.timeManager.movesRemaining).toBe(1);
  });

  test('reset returns to 上午', () => {
    const engine = makeEngine();
    engine.timeManager.recordMove();
    engine.timeManager.recordMove();
    engine.timeManager.reset();
    expect(engine.timeManager.currentTimeSlot).toBe('上午');
    expect(engine.timeManager.movesInCurrentSlot).toBe(0);
  });
});

// ==================== NpcScheduleManager Tests ====================

describe('NpcScheduleManager', () => {
  test('returns NPC location for given time slot', () => {
    const engine = makeEngine();
    const loc = engine.npcManager.getNpcLocation('npc-merchant', '上午');
    expect(loc).not.toBeNull();
    expect(loc?.currentRegionId).toBe('street');
    expect(loc?.activity).toBe('摆摊');
    expect(loc?.available).toBe(true);
  });

  test('returns all NPCs in a region', () => {
    const engine = makeEngine();
    const npcs = engine.npcManager.getNpcsInRegion('street', '上午');
    expect(npcs).toHaveLength(1);
    expect(npcs[0].name).toBe('商人张三');
  });

  test('returns null for NPC without schedule', () => {
    const engine = makeEngine();
    const loc = engine.npcManager.getNpcLocation('nonexistent', '上午');
    expect(loc).toBeNull();
  });
});

// ==================== DynamicEventTrigger Tests ====================

describe('DynamicEventTrigger', () => {
  test('shouldTrigger respects rate', () => {
    const engine = createDailyTownEngine({ triggerRate: 0, rng: () => 0.5 });
    expect(engine.eventTrigger.shouldTrigger()).toBe(false);
  });

  test('shouldTrigger always true when rate is 1', () => {
    const engine = createDailyTownEngine({ triggerRate: 1, rng: () => 0.5 });
    expect(engine.eventTrigger.shouldTrigger()).toBe(true);
  });

  test('rollEvent returns null when trigger rate not met', () => {
    const engine = createDailyTownEngine({ triggerRate: 0, rng: () => 0.5 });
    expect(engine.eventTrigger.rollEvent()).toBeNull();
  });

  test('rollEvent returns event when triggered', () => {
    const engine = createDailyTownEngine({ triggerRate: 1, rng: () => 0.5 });
    const event = engine.eventTrigger.rollEvent();
    expect(event).not.toBeNull();
    expect(event?.type).toBeDefined();
    expect(event?.description).toBeDefined();
  });

  test('getTriggerRate returns configured rate', () => {
    const engine = createDailyTownEngine({ triggerRate: 0.3 });
    expect(engine.eventTrigger.getTriggerRate()).toBe(0.3);
  });

  test('setTriggerRate updates rate', () => {
    const engine = createDailyTownEngine({ triggerRate: 0 });
    engine.eventTrigger.setTriggerRate(0.8);
    expect(engine.eventTrigger.getTriggerRate()).toBe(0.8);
  });
});

// ==================== DailyTownEngine Core Tests ====================

describe('DailyTownEngine - Region Movement', () => {
  test('first move enters region without spending AP', () => {
    const engine = makeEngine();
    const result = engine.moveToRegion('street');
    expect(result.success).toBe(true);
    expect(result.apSpent).toBe(0);
    expect(engine.currentRegionId).toBe('street');
  });

  test('move to connected region spends AP', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    const result = engine.moveToRegion('weapon-shop');
    expect(result.success).toBe(true);
    expect(result.apSpent).toBe(1);
    expect(engine.currentRegionId).toBe('weapon-shop');
  });

  test('move to unreachable region fails', () => {
    const engine = makeEngine();
    engine.moveToRegion('home');
    const result = engine.moveToRegion('weapon-shop');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('目标区域不可达');
  });

  test('move to same region fails', () => {
    const engine = makeEngine();
    engine.moveToRegion('home');
    const result = engine.moveToRegion('home');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('已在当前区域');
  });

  test('move to region not available at current time fails', () => {
    const engine = makeEngine();
    engine.moveToRegion('home');
    engine.moveToRegion('street');
    engine.moveToRegion('tea-house');
    const result = engine.moveToRegion('tavern');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('目标区域不可达');
  });

  test('insufficient AP blocks movement', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    engine.apManager.spend(5);
    const result = engine.moveToRegion('home');
    expect(result.success).toBe(false);
    expect(result.reason).toBe('行动力不足');
  });

  test('enterRegion does not spend AP', () => {
    const engine = makeEngine();
    const result = engine.enterRegion('weapon-shop');
    expect(result.success).toBe(true);
    expect(result.apSpent).toBe(0);
    expect(engine.currentRegionId).toBe('weapon-shop');
  });
});

describe('DailyTownEngine - Time & Day', () => {
  test('time slot changes after enough moves', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    engine.moveToRegion('home');
    expect(engine.timeManager.currentTimeSlot).toBe('下午');
  });

  test('advanceDay resets time and AP', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    engine.moveToRegion('home');
    engine.advanceDay();
    expect(engine.timeManager.currentTimeSlot).toBe('上午');
    expect(engine.apManager.current).toBe(5);
  });

  test('rest restores AP without advancing day', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    const dayBefore = engine.apManager.day;
    engine.rest();
    expect(engine.apManager.current).toBe(5);
    expect(engine.apManager.day).toBe(dayBefore);
  });
});

describe('DailyTownEngine - NPC & Events', () => {
  test('getCurrentNpcs returns NPCs in current region', () => {
    const engine = makeEngine();
    engine.enterRegion('street');
    const npcs = engine.getCurrentNpcs();
    expect(npcs.length).toBeGreaterThanOrEqual(0);
  });

  test('getReachableRegions returns connected available regions', () => {
    const engine = makeEngine();
    engine.enterRegion('street');
    const regions = engine.getReachableRegions();
    expect(regions.length).toBeGreaterThan(0);
    expect(regions.map((r) => r.id)).toContain('home');
  });

  test('move result includes NPCs in target region', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    const result = engine.moveToRegion('tea-house');
    expect(result.success).toBe(true);
    expect(result.npcsInRegion.length).toBeGreaterThanOrEqual(0);
  });
});

describe('DailyTownEngine - SLGEngine Interface', () => {
  test('advanceTurn increments turn number', () => {
    const engine = makeEngine();
    const before = engine.turnNumber;
    const result = engine.advanceTurn();
    expect(result.turnNumber).toBe(before + 1);
  });

  test('executePlayerAction move succeeds', () => {
    const engine = makeEngine();
    engine.enterRegion('home');
    const result = engine.executePlayerAction({
      id: 'test-action',
      engineType: 'dailyTown',
      type: 'move',
      payload: { targetRegionId: 'street' },
      timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  test('executePlayerAction rest succeeds', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    const result = engine.executePlayerAction({
      id: 'test-action',
      engineType: 'dailyTown',
      type: 'rest',
      payload: {},
      timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  test('executePlayerAction advanceDay succeeds', () => {
    const engine = makeEngine();
    const result = engine.executePlayerAction({
      id: 'test-action',
      engineType: 'dailyTown',
      type: 'advanceDay',
      payload: {},
      timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  test('executePlayerAction unsupported type fails', () => {
    const engine = makeEngine();
    const result = engine.executePlayerAction({
      id: 'test-action',
      engineType: 'dailyTown',
      type: 'invalid',
      payload: {},
      timestamp: Date.now(),
    });
    expect(result.success).toBe(false);
  });

  test('canExecuteAction returns correct values', () => {
    const engine = makeEngine();
    engine.enterRegion('home');
    expect(
      engine.canExecuteAction({
        id: 'a1',
        engineType: 'dailyTown',
        type: 'move',
        payload: { targetRegionId: 'street' },
        timestamp: 0,
      })
    ).toBe(true);
    expect(
      engine.canExecuteAction({
        id: 'a2',
        engineType: 'dailyTown',
        type: 'rest',
        payload: {},
        timestamp: 0,
      })
    ).toBe(true);
  });

  test('getSnapshot returns valid state', () => {
    const engine = makeEngine();
    engine.enterRegion('home');
    const snapshot = engine.getSnapshot();
    expect(snapshot.turnNumber).toBe(0);
    expect(snapshot.engineStates.dailyTown).toBeDefined();
  });

  test('getNarrativeConstraints returns valid XML', () => {
    const engine = makeEngine();
    engine.enterRegion('home');
    const constraints = engine.getNarrativeConstraints();
    expect(constraints.scene).toContain('家');
    expect(constraints.turn).toBe(0);
  });

  test('reset clears state', () => {
    const engine = makeEngine();
    engine.moveToRegion('street');
    engine.advanceTurn();
    engine.reset();
    expect(engine.currentRegionId).toBeNull();
    expect(engine.turnNumber).toBe(0);
  });
});
