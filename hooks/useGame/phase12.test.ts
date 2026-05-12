/**
 * Phase 12: AVG 关系图谱/好感度/Galgame 引擎 Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RelationGraph, createRelationGraph } from './avg/relation/relationGraph';
import { IntimacyTrigger, IntimacyStateMachine, createIntimacyTrigger } from './avg/intimacy/intimacyStateMachine';
import type { IntimacyEvent } from './avg/intimacy/intimacyStateMachine';
import { RouteResolver, createRouteResolver } from './avg/galgame/routeResolver';
import { EndingResolver, createEndingResolver, CGManager, createCGManager } from './avg/galgame/endingResolver';
import { AvgRelationEngine, createAvgRelationEngine } from './engine/avgRelationEngine';
import type { PlayerAction } from './engine/types';
import type { RelationEdge } from '../../models/avg/relationGraph';
import type { GalgameRoute, GalgameEnding, GalgameCG, GalgameState } from '../../models/avg/galgame';
import { INTIMACY_THRESHOLDS } from '../../models/avg/relationGraph';

const makeAction = (type: string, payload: Record<string, unknown>): PlayerAction => ({
  id: `test-${type}-${Date.now()}`,
  engineType: 'avgRelation' as const,
  type,
  payload,
  timestamp: Date.now(),
});

// ==================== RelationGraph Tests ====================

describe('RelationGraph', () => {
  let graph: RelationGraph;

  beforeEach(() => {
    graph = createRelationGraph();
  });

  describe('nodes', () => {
    it('add node', () => {
      graph.addNode('npc_001');
      expect(graph.hasNode('npc_001')).toBe(true);
      expect(graph.getNodeCount()).toBe(1);
    });

    it('remove node also removes connected edges', () => {
      graph.addNode('npc_001');
      graph.addNode('npc_002');
      graph.addEdge({
        fromNpcId: 'npc_001',
        toNpcId: 'npc_002',
        relationType: 'friend',
        intimacy: 50,
        trust: 30,
        closeness: 20,
      });
      graph.removeNode('npc_001');
      expect(graph.hasNode('npc_001')).toBe(false);
      expect(graph.getEdge('npc_001', 'npc_002')).toBeNull();
    });

    it('getAllNpcIds', () => {
      graph.addNode('a');
      graph.addNode('b');
      expect(graph.getAllNpcIds()).toContain('a');
      expect(graph.getAllNpcIds()).toContain('b');
    });
  });

  describe('edges', () => {
    const edge: RelationEdge = {
      fromNpcId: 'player',
      toNpcId: 'npc_001',
      relationType: 'acquaintance',
      intimacy: 25,
      trust: 10,
      closeness: 5,
    };

    it('add and get edge', () => {
      graph.addEdge(edge);
      const got = graph.getEdge('player', 'npc_001');
      expect(got).not.toBeNull();
      expect(got!.intimacy).toBe(25);
    });

    it('remove edge', () => {
      graph.addEdge(edge);
      graph.removeEdge('player', 'npc_001');
      expect(graph.getEdge('player', 'npc_001')).toBeNull();
    });

    it('getEdgesFrom', () => {
      graph.addEdge(edge);
      graph.addEdge({
        fromNpcId: 'player',
        toNpcId: 'npc_002',
        relationType: 'stranger',
        intimacy: 0,
        trust: 0,
        closeness: 0,
      });
      expect(graph.getEdgesFrom('player')).toHaveLength(2);
    });

    it('getEdgesTo', () => {
      graph.addEdge(edge);
      graph.addEdge({
        fromNpcId: 'npc_002',
        toNpcId: 'npc_001',
        relationType: 'rival',
        intimacy: 10,
        trust: 5,
        closeness: 0,
      });
      expect(graph.getEdgesTo('npc_001')).toHaveLength(2);
    });

    it('getEdgeCount', () => {
      graph.addEdge(edge);
      expect(graph.getEdgeCount()).toBe(1);
    });
  });

  describe('intimacy', () => {
    it('updateIntimacy creates new edge if not exists', () => {
      const result = graph.updateIntimacy('player', 'npc_001', 30);
      expect(result.newIntimacy).toBe(30);
      expect(graph.getIntimacy('player', 'npc_001')).toBe(30);
    });

    it('updateIntimacy increments existing', () => {
      graph.updateIntimacy('player', 'npc_001', 30);
      const result = graph.updateIntimacy('player', 'npc_001', 10);
      expect(result.newIntimacy).toBe(40);
    });

    it('level change detection', () => {
      graph.updateIntimacy('player', 'npc_001', 15);
      const result = graph.updateIntimacy('player', 'npc_001', 10);
      expect(result.levelChanged).toBe(true);
      expect(result.oldLevel).toBe(0);
      expect(result.newLevel).toBe(1);
    });

    it('no level change', () => {
      graph.updateIntimacy('player', 'npc_001', 5);
      const result = graph.updateIntimacy('player', 'npc_001', 3);
      expect(result.levelChanged).toBe(false);
    });

    it('clamped to 0', () => {
      graph.updateIntimacy('player', 'npc_001', 10);
      const result = graph.updateIntimacy('player', 'npc_001', -20);
      expect(result.newIntimacy).toBe(0);
    });
  });

  describe('trust and closeness', () => {
    beforeEach(() => {
      graph.addEdge({
        fromNpcId: 'player',
        toNpcId: 'npc_001',
        relationType: 'friend',
        intimacy: 50,
        trust: 30,
        closeness: 20,
      });
    });

    it('updateTrust', () => {
      const newTrust = graph.updateTrust('player', 'npc_001', 10);
      expect(newTrust).toBe(40);
    });

    it('updateTrust clamped', () => {
      const newTrust = graph.updateTrust('player', 'npc_001', 80);
      expect(newTrust).toBe(100);
    });

    it('updateCloseness', () => {
      const newCloseness = graph.updateCloseness('player', 'npc_001', 30);
      expect(newCloseness).toBe(50);
    });

    it('returns 0 for missing edge', () => {
      expect(graph.updateTrust('player', 'missing', 10)).toBe(0);
    });
  });

  describe('summary', () => {
    beforeEach(() => {
      graph.addEdge({
        fromNpcId: 'player',
        toNpcId: 'npc_001',
        relationType: 'friend',
        intimacy: 80,
        trust: 50,
        closeness: 30,
      });
    });

    it('getSummary', () => {
      const summary = graph.getSummary('player');
      expect(summary).toHaveLength(1);
      expect(summary[0].npcId).toBe('npc_001');
      expect(summary[0].level).toBe(3);
    });
  });

  describe('serialization', () => {
    it('toJSON and fromJSON roundtrip', () => {
      graph.updateIntimacy('player', 'npc_001', 50);
      const json = graph.toJSON();
      const restored = RelationGraph.fromJSON(json);
      expect(restored.getIntimacy('player', 'npc_001')).toBe(50);
    });
  });

  describe('changes', () => {
    it('tracks changes', () => {
      graph.addNode('npc_001');
      expect(graph.getChanges().length).toBeGreaterThan(0);
    });

    it('clearChanges', () => {
      graph.addNode('npc_001');
      graph.clearChanges();
      expect(graph.getChanges()).toHaveLength(0);
    });
  });
});

// ==================== IntimacyStateMachine Tests ====================

describe('IntimacyStateMachine', () => {
  it('intimacyToLevel', () => {
    expect(IntimacyStateMachine.intimacyToLevel(0)).toBe(0);
    expect(IntimacyStateMachine.intimacyToLevel(19)).toBe(0);
    expect(IntimacyStateMachine.intimacyToLevel(20)).toBe(1);
    expect(IntimacyStateMachine.intimacyToLevel(50)).toBe(2);
    expect(IntimacyStateMachine.intimacyToLevel(80)).toBe(3);
    expect(IntimacyStateMachine.intimacyToLevel(120)).toBe(4);
    expect(IntimacyStateMachine.intimacyToLevel(160)).toBe(5);
    expect(IntimacyStateMachine.intimacyToLevel(200)).toBe(5);
  });

  it('getLevelThreshold', () => {
    expect(IntimacyStateMachine.getLevelThreshold(0)).toBe(0);
    expect(IntimacyStateMachine.getLevelThreshold(3)).toBe(80);
    expect(IntimacyStateMachine.getLevelThreshold(5)).toBe(160);
  });

  it('getLevelLabel', () => {
    expect(IntimacyStateMachine.getLevelLabel(0)).toBe('陌生人');
    expect(IntimacyStateMachine.getLevelLabel(3)).toBe('好友');
    expect(IntimacyStateMachine.getLevelLabel(5)).toBe('恋人');
  });

  it('remainingToNext', () => {
    expect(IntimacyStateMachine.remainingToNext(0)).toBe(20);
    expect(IntimacyStateMachine.remainingToNext(2)).toBe(30);
    expect(IntimacyStateMachine.remainingToNext(5)).toBe(0);
  });

  it('remainingToLevel', () => {
    expect(IntimacyStateMachine.remainingToLevel(0, 3)).toBe(80);
    expect(IntimacyStateMachine.remainingToLevel(2, 4)).toBe(70);
    expect(IntimacyStateMachine.remainingToLevel(3, 3)).toBe(0);
  });
});

// ==================== IntimacyTrigger Tests ====================

describe('IntimacyTrigger', () => {
  let trigger: IntimacyTrigger;
  let events: IntimacyEvent[];

  beforeEach(() => {
    events = [
      { id: 'e1', npcId: 'npc_001', requiredLevel: 1, title: '初次见面', description: '认识', triggered: false },
      { id: 'e2', npcId: 'npc_001', requiredLevel: 3, title: '成为好友', description: '好感提升', triggered: false },
      { id: 'e3', npcId: 'npc_002', requiredLevel: 2, title: '熟悉', description: '熟悉', triggered: false },
    ];
    trigger = createIntimacyTrigger(events);
  });

  it('check triggers events on level up', () => {
    const result = trigger.check('npc_001', 80, 0, 3);
    expect(result.levelUp).toBe(true);
    expect(result.newEvents.length).toBeGreaterThan(0);
    expect(result.newEvents.some((e) => e.id === 'e1')).toBe(true);
    expect(result.newEvents.some((e) => e.id === 'e2')).toBe(true);
  });

  it('no events on same level', () => {
    const result = trigger.check('npc_001', 30, 1, 1);
    expect(result.levelUp).toBe(false);
    expect(result.newEvents).toHaveLength(0);
  });

  it('getEventsForNpc', () => {
    const npcEvents = trigger.getEventsForNpc('npc_001');
    expect(npcEvents).toHaveLength(2);
  });

  it('getTriggeredEvents after check', () => {
    trigger.check('npc_001', 80, 0, 3);
    expect(trigger.getTriggeredEvents()).toHaveLength(2);
  });

  it('addEvent', () => {
    trigger.addEvent({ id: 'e4', npcId: 'npc_001', requiredLevel: 5, title: '恋人', description: '恋爱', triggered: false });
    const npcEvents = trigger.getEventsForNpc('npc_001');
    expect(npcEvents).toHaveLength(3);
  });

  it('resetAll', () => {
    trigger.check('npc_001', 80, 0, 3);
    trigger.resetAll();
    expect(trigger.getTriggeredEvents()).toHaveLength(0);
  });
});

// ==================== RouteResolver Tests ====================

describe('RouteResolver', () => {
  let resolver: RouteResolver;
  let routes: GalgameRoute[];
  let state: GalgameState;

  beforeEach(() => {
    routes = [
      { id: 'route_a', npcId: 'npc_001', routeName: '路线A', mutualGroup: 'main_heroine', lockLevel: 3, eventIds: {} },
      { id: 'route_b', npcId: 'npc_002', routeName: '路线B', mutualGroup: 'main_heroine', lockLevel: 3, eventIds: {} },
      { id: 'route_c', npcId: 'npc_003', routeName: '路线C', mutualGroup: 'neutral', lockLevel: 1, eventIds: {} },
    ];
    resolver = createRouteResolver(routes);
    state = {
      activeRouteId: null,
      unlockedRouteIds: [],
      lockedRouteIds: [],
      triggeredEventIds: [],
      completedEndingIds: [],
      unlockedCGIds: [],
      flags: {},
    };
  });

  it('judgeEnter passes when intimacy sufficient', () => {
    const result = resolver.judgeEnter('route_a', 80, state);
    expect(result.canEnter).toBe(true);
  });

  it('judgeEnter fails when intimacy insufficient', () => {
    const result = resolver.judgeEnter('route_a', 30, state);
    expect(result.canEnter).toBe(false);
  });

  it('judgeEnter fails when route locked', () => {
    state.lockedRouteIds = ['route_b'];
    const result = resolver.judgeEnter('route_a', 80, state);
    expect(result.canEnter).toBe(false);
    expect(result.blockedBy).toBe('route_b');
  });

  it('judgeEnter passes for neutral route even when locked', () => {
    state.lockedRouteIds = ['route_b'];
    const result = resolver.judgeEnter('route_c', 20, state);
    expect(result.canEnter).toBe(true);
  });

  it('shouldLockRoute', () => {
    const shouldLock = resolver.shouldLockRoute('route_a', 80, state);
    expect(shouldLock).toBe(true);
  });

  it('shouldLockRoute returns false for neutral', () => {
    const shouldLock = resolver.shouldLockRoute('route_c', 20, state);
    expect(shouldLock).toBe(false);
  });

  it('suggestRoute returns best matching route', () => {
    const suggested = resolver.suggestRoute(80, 'npc_001', state);
    expect(suggested).not.toBeNull();
    expect(suggested!.id).toBe('route_a');
  });

  it('suggestRoute returns null when intimacy too low', () => {
    const suggested = resolver.suggestRoute(5, 'npc_001', state);
    expect(suggested).toBeNull();
  });
});

// ==================== EndingResolver Tests ====================

describe('EndingResolver', () => {
  let resolver: EndingResolver;
  let state: GalgameState;

  beforeEach(() => {
    const endings = [
      {
        id: 'ending_good',
        routeId: 'route_a',
        endingType: 'good',
        title: '好结局',
        description: '美好结局',
        requirements: [{ type: 'intimacy_min', field: 'intimacy', value: 120 }],
        cgIds: ['cg_001'],
      },
      {
        id: 'ending_normal',
        routeId: 'route_a',
        endingType: 'normal',
        title: '普通结局',
        description: '普通结局',
        requirements: [{ type: 'intimacy_min', field: 'intimacy', value: 50 }],
        cgIds: [],
      },
      {
        id: 'ending_bad',
        routeId: 'route_a',
        endingType: 'bad',
        title: '坏结局',
        description: '悲剧结局',
        requirements: [{ type: 'intimacy_min', field: 'intimacy', value: 0 }],
        cgIds: [],
      },
    ];
    resolver = createEndingResolver(endings);
    state = {
      activeRouteId: 'route_a',
      unlockedRouteIds: ['route_a'],
      lockedRouteIds: [],
      triggeredEventIds: [],
      completedEndingIds: [],
      unlockedCGIds: [],
      flags: {},
    };
  });

  it('resolve good ending', () => {
    const result = resolver.resolve('route_a', 120, state);
    expect(result.resolved).toBe(true);
    expect(result.ending!.id).toBe('ending_good');
  });

  it('resolve normal ending when good not met', () => {
    const result = resolver.resolve('route_a', 70, state);
    expect(result.resolved).toBe(true);
    expect(result.ending!.id).toBe('ending_normal');
  });

  it('resolve bad ending as fallback', () => {
    const result = resolver.resolve('route_a', 10, state);
    expect(result.resolved).toBe(true);
    expect(result.ending!.id).toBe('ending_bad');
  });

  it('no ending for unknown route', () => {
    const result = resolver.resolve('unknown', 100, state);
    expect(result.resolved).toBe(false);
  });

  it('flag-based requirement', () => {
    // Remove all endings and add only the secret one for this test
    resolver.removeEnding('ending_good');
    resolver.removeEnding('ending_normal');
    resolver.removeEnding('ending_bad');
    resolver.addEnding({
      id: 'ending_secret',
      routeId: 'route_a',
      endingType: 'secret',
      title: '隐藏结局',
      description: '隐藏',
      requirements: [{ type: 'flag_set', field: 'secret_found', value: true }],
      cgIds: [],
    });
    state.flags.secret_found = true;
    const result = resolver.resolve('route_a', 200, state);
    expect(result.resolved).toBe(true);
    expect(result.ending!.id).toBe('ending_secret');
  });
});

// ==================== CGManager Tests ====================

describe('CGManager', () => {
  let manager: CGManager;
  let state: GalgameState;

  beforeEach(() => {
    const cgs = [
      {
        id: 'cg_001',
        routeId: 'route_a',
        title: '初遇',
        description: '初次相遇',
        unlockCondition: { type: 'intimacy_reached', field: 'intimacy', value: 20 },
        unlocked: false,
      },
      {
        id: 'cg_002',
        routeId: 'route_a',
        title: '告白',
        description: '表白场景',
        unlockCondition: { type: 'intimacy_reached', field: 'intimacy', value: 120 },
        unlocked: false,
      },
    ];
    manager = createCGManager(cgs);
    state = {
      activeRouteId: null,
      unlockedRouteIds: [],
      lockedRouteIds: [],
      triggeredEventIds: [],
      completedEndingIds: [],
      unlockedCGIds: [],
      flags: {},
    };
  });

  it('checkUnlock unlocks CGs meeting condition', () => {
    const unlocked = manager.checkUnlock(120, state);
    expect(unlocked).toContain('cg_001');
    expect(unlocked).toContain('cg_002');
  });

  it('checkUnlock only unlocks new ones', () => {
    manager.checkUnlock(20, state);
    const second = manager.checkUnlock(120, state);
    expect(second).toContain('cg_002');
    expect(second).not.toContain('cg_001');
  });

  it('getUnlockedCGs', () => {
    manager.checkUnlock(120, state);
    expect(manager.getUnlockedCGs()).toHaveLength(2);
  });

  it('getLockedCGs', () => {
    manager.checkUnlock(20, state);
    expect(manager.getLockedCGs()).toHaveLength(1);
  });

  it('getCGsForRoute', () => {
    expect(manager.getCGsForRoute('route_a')).toHaveLength(2);
    expect(manager.getCGsForRoute('other')).toHaveLength(0);
  });
});

// ==================== AvgRelationEngine Tests ====================

describe('AvgRelationEngine', () => {
  let engine: AvgRelationEngine;

  beforeEach(() => {
    engine = createAvgRelationEngine();
  });

  describe('NPC management', () => {
    it('add and remove NPC', () => {
      engine.addNpc('npc_001');
      expect(engine.hasNpc('npc_001')).toBe(true);
      engine.removeNpc('npc_001');
      expect(engine.hasNpc('npc_001')).toBe(false);
    });

    it('getAllNpcs', () => {
      engine.addNpc('a');
      engine.addNpc('b');
      expect(engine.getAllNpcs()).toHaveLength(2);
    });
  });

  describe('relations', () => {
    it('set and get relation', () => {
      engine.setRelation({
        fromNpcId: 'player',
        toNpcId: 'npc_001',
        relationType: 'friend',
        intimacy: 50,
        trust: 30,
        closeness: 20,
      });
      const rel = engine.getRelation('player', 'npc_001');
      expect(rel).not.toBeNull();
      expect(rel!.intimacy).toBe(50);
    });

    it('getRelationsFrom', () => {
      engine.setRelation({
        fromNpcId: 'player',
        toNpcId: 'npc_001',
        relationType: 'friend',
        intimacy: 50,
        trust: 0,
        closeness: 0,
      });
      engine.setRelation({
        fromNpcId: 'player',
        toNpcId: 'npc_002',
        relationType: 'stranger',
        intimacy: 0,
        trust: 0,
        closeness: 0,
      });
      expect(engine.getRelationsFrom('player')).toHaveLength(2);
    });

    it('removeRelation', () => {
      engine.setRelation({
        fromNpcId: 'player',
        toNpcId: 'npc_001',
        relationType: 'friend',
        intimacy: 50,
        trust: 0,
        closeness: 0,
      });
      engine.removeRelation('player', 'npc_001');
      expect(engine.getRelation('player', 'npc_001')).toBeNull();
    });
  });

  describe('intimacy', () => {
    it('changeIntimacy', () => {
      const change = engine.changeIntimacy('player', 'npc_001', 20, '初次见面');
      expect(change.npcId).toBe('npc_001');
      expect(change.newIntimacy).toBe(20);
      expect(change.levelChanged).toBe(true);
    });

    it('getIntimacy', () => {
      engine.changeIntimacy('player', 'npc_001', 50, 'test');
      expect(engine.getIntimacy('player', 'npc_001')).toBe(50);
    });

    it('getLevel', () => {
      engine.changeIntimacy('player', 'npc_001', 80, 'test');
      expect(engine.getLevel('player', 'npc_001')).toBe(3);
    });

    it('getLevelLabel', () => {
      expect(engine.getLevelLabel(3)).toBe('好友');
    });
  });

  describe('route judgment', () => {
    beforeEach(() => {
      engine = createAvgRelationEngine(undefined, undefined, [
        { id: 'route_a', npcId: 'npc_001', routeName: '路线A', mutualGroup: 'neutral', lockLevel: 3, eventIds: {} },
      ]);
    });

    it('enterRoute succeeds', () => {
      engine.changeIntimacy('player', 'npc_001', 80, 'test');
      const success = engine.enterRoute('route_a', 'npc_001');
      expect(success).toBe(true);
      expect(engine.getActiveRoute()).toBeDefined();
    });

    it('enterRoute fails when intimacy too low', () => {
      const success = engine.enterRoute('route_a', 'npc_001');
      expect(success).toBe(false);
    });

    it('suggestRoute', () => {
      engine.changeIntimacy('player', 'npc_001', 80, 'test');
      const suggested = engine.suggestRoute('npc_001');
      expect(suggested).not.toBeNull();
    });
  });

  describe('ending', () => {
    beforeEach(() => {
      engine = createAvgRelationEngine(undefined, undefined, [
        { id: 'route_a', npcId: 'npc_001', routeName: '路线A', mutualGroup: 'neutral', lockLevel: 1, eventIds: {} },
      ], [
        {
          id: 'ending_good',
          routeId: 'route_a',
          endingType: 'good',
          title: '好结局',
          description: '美好结局',
          requirements: [{ type: 'intimacy_min', field: 'intimacy', value: 80 }],
          cgIds: [],
        },
      ]);
      engine.changeIntimacy('player', 'npc_001', 80, 'test');
      engine.enterRoute('route_a', 'npc_001');
    });

    it('resolveEnding', () => {
      engine.changeIntimacy('player', 'npc_001', 80, 'test');
      const result = engine.resolveEnding();
      expect(result.resolved).toBe(true);
    });

    it('completeEnding', () => {
      engine.changeIntimacy('player', 'npc_001', 80, 'test');
      engine.resolveEnding();
      const success = engine.completeEnding('ending_good');
      expect(success).toBe(true);
      expect(engine.getGalgameState().completedEndingIds).toContain('ending_good');
    });
  });

  describe('flags', () => {
    it('set and get flag', () => {
      engine.setFlag('test_flag', true);
      expect(engine.getFlag('test_flag')).toBe(true);
    });

    it('get missing flag returns false', () => {
      expect(engine.getFlag('missing')).toBe(false);
    });
  });

  describe('SLGEngine interface', () => {
    it('executePlayerAction change_intimacy', () => {
      const result = engine.executePlayerAction(makeAction('change_intimacy', {
        fromNpcId: 'player',
        toNpcId: 'npc_001',
        delta: 20,
        reason: 'test',
      }));
      expect(result.success).toBe(true);
    });

    it('executePlayerAction enter_route', () => {
      engine = createAvgRelationEngine(undefined, undefined, [
        { id: 'route_a', npcId: 'npc_001', routeName: '路线A', mutualGroup: 'neutral', lockLevel: 1, eventIds: {} },
      ]);
      engine.changeIntimacy('player', 'npc_001', 20, 'test');
      const result = engine.executePlayerAction(makeAction('enter_route', {
        routeId: 'route_a',
        npcId: 'npc_001',
      }));
      expect(result.success).toBe(true);
    });

    it('executePlayerAction resolve_ending', () => {
      const result = engine.executePlayerAction(makeAction('resolve_ending', {}));
      expect(result.success).toBe(false);
    });

    it('canExecuteAction', () => {
      expect(engine.canExecuteAction(makeAction('change_intimacy', {}))).toBe(true);
      expect(engine.canExecuteAction(makeAction('enter_route', {}))).toBe(true);
      expect(engine.canExecuteAction(makeAction('resolve_ending', {}))).toBe(true);
      expect(engine.canExecuteAction(makeAction('unknown', {}))).toBe(false);
    });

    it('advanceTurn', () => {
      const result = engine.advanceTurn();
      expect(result.turnNumber).toBe(1);
      expect(result.phase).toBe('narrative');
    });

    it('getSnapshot', () => {
      const snapshot = engine.getSnapshot();
      expect(snapshot.turnNumber).toBe(0);
      expect(snapshot.engineStates.avgRelation).toBeDefined();
    });

    it('getNarrativeConstraints', () => {
      const constraints = engine.getNarrativeConstraints();
      expect(constraints.scene).toBeDefined();
    });

    it('reset', () => {
      engine.addNpc('npc_001');
      engine.reset();
      expect(engine.getAllNpcs()).toHaveLength(0);
    });
  });

  describe('getState', () => {
    it('returns full state', () => {
      engine.addNpc('npc_001');
      engine.changeIntimacy('player', 'npc_001', 20, 'test');
      const state = engine.getState();
      expect(state.graphData.npcIds).toContain('npc_001');
      expect(state.triggeredEventCount).toBe(0);
    });
  });
});
