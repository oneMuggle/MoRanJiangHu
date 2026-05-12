/**
 * Phase 5 测试
 *
 * 覆盖 EngineRegistry、GlobalTurnManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EngineRegistry, createEngineRegistry } from './engine/engineRegistry';
import { GlobalTurnManager, createGlobalTurnManager } from './engine/globalTurnManager';
import type {
  SLGEngine,
  EngineType,
  TurnResult,
  PlayerAction,
  ActionResult,
  GameStateSnapshot,
  NarrativeConstraint,
  GameEvent,
  ScheduledEvent,
  ResolvedEvent,
  PauseReason,
} from './engine/types';

// ==================== Mock Engine ====================

class MockEngine implements SLGEngine {
  private _type: EngineType;
  private _paused = false;
  private _turnCount = 0;
  advanceCount = 0;
  actionCount = 0;

  constructor(type: EngineType) {
    this._type = type;
  }

  advanceTurn(): TurnResult {
    this.advanceCount++;
    this._turnCount++;
    return {
      turnNumber: this._turnCount,
      phase: 'transition',
      eventsTriggered: [{
        id: `event-${this._type}-${this._turnCount}`,
        engineType: this._type,
        type: 'MOCK_EVENT',
        description: `Mock event from ${this._type}`,
        status: 'resolved',
        payload: {},
        createdAt: Date.now(),
        resolvedAt: Date.now(),
      }],
      stateChanges: [{ key: `${this._type}.turn`, before: this._turnCount - 1, after: this._turnCount }],
    };
  }

  pause(_reason: PauseReason): void { this._paused = true; }
  resume(): void { this._paused = false; }
  isPaused(): boolean { return this._paused; }
  getPauseReason(): PauseReason | null { return null; }
  enqueueEvent(_e: GameEvent): void {}
  resolvePendingEvents(): ResolvedEvent[] { return []; }
  scheduleEvent(_e: ScheduledEvent): void {}

  executePlayerAction(_a: PlayerAction): ActionResult {
    this.actionCount++;
    return { success: true, stateUpdates: {}, narrativeConstraint: 'mock', keyStep: false, sideEffects: [] };
  }
  canExecuteAction(_a: PlayerAction): boolean { return true; }

  getSnapshot(): GameStateSnapshot {
    return { turnNumber: this._turnCount, timestamp: Date.now(), engineStates: {} };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    return { scene: 'mock', turn: this._turnCount, tension: 0, playerAction: '', keyStep: false, nsfwTriggered: false, participants: [], nextEvent: '' };
  }

  getEngineType(): EngineType { return this._type; }
}

// ==================== EngineRegistry ====================

describe('EngineRegistry', () => {
  let registry: EngineRegistry;

  beforeEach(() => {
    registry = createEngineRegistry();
  });

  it('应正确初始化', () => {
    const snapshot = registry.getSnapshot();
    expect(snapshot.totalCount).toBe(0);
    expect(snapshot.activeCount).toBe(0);
    expect(registry.registeredTypes).toEqual([]);
  });

  it('应注册引擎', () => {
    const engine = new MockEngine('boardGame');
    registry.register(engine);

    expect(registry.has('boardGame')).toBe(true);
    expect(registry.get('boardGame')).toBe(engine);
    expect(registry.registeredTypes).toContain('boardGame');
  });

  it('重复注册应抛出错误', () => {
    const engine = new MockEngine('boardGame');
    registry.register(engine);
    expect(() => registry.register(engine)).toThrow('已注册');
  });

  it('应注销引擎', () => {
    const engine = new MockEngine('boardGame');
    registry.register(engine);
    expect(registry.unregister('boardGame')).toBe(true);
    expect(registry.has('boardGame')).toBe(false);
  });

  it('注销未注册引擎应返回 false', () => {
    expect(registry.unregister('global' as EngineType)).toBe(false);
  });

  it('应获取所有引擎', () => {
    registry.register(new MockEngine('boardGame'));
    registry.register(new MockEngine('urbanDriver'));
    registry.register(new MockEngine('phoneSim'));
    expect(registry.getAll().length).toBe(3);
  });

  it('应按优先级排序返回引擎', () => {
    registry.register(new MockEngine('phoneSim'));    // medium
    registry.register(new MockEngine('boardGame'));   // high
    registry.register(new MockEngine('bdsm'));        // low

    const sorted = registry.getByPriority();
    expect(sorted[0].getEngineType()).toBe('boardGame');
    expect(sorted[1].getEngineType()).toBe('phoneSim');
    expect(sorted[2].getEngineType()).toBe('bdsm');
  });

  it('应获取活跃引擎（排除暂停的）', () => {
    const bg = new MockEngine('boardGame');
    const ud = new MockEngine('urbanDriver');
    registry.register(bg);
    registry.register(ud);

    bg.pause('chat-sent');
    const active = registry.getActive();
    expect(active.length).toBe(1);
    expect(active[0].getEngineType()).toBe('urbanDriver');
  });

  it('应激活/停用引擎', () => {
    registry.register(new MockEngine('boardGame'));
    registry.setActive('boardGame', false);
    expect(registry.activeCount).toBe(0);
    registry.setActive('boardGame', true);
    expect(registry.activeCount).toBe(1);
  });

  it('应返回注册表快照', () => {
    registry.register(new MockEngine('boardGame'));
    registry.register(new MockEngine('urbanDriver'));
    const snapshot = registry.getSnapshot();
    expect(snapshot.totalCount).toBe(2);
    expect(snapshot.activeCount).toBe(2);
    expect(snapshot.engines.length).toBe(2);
  });

  it('应路由事件到目标引擎', () => {
    let enqueued = false;
    const engine = new MockEngine('urbanDriver');
    engine.enqueueEvent = () => { enqueued = true; };
    registry.register(engine);

    registry.routeEvent('boardGame', {
      id: 'evt-1', engineType: 'urbanDriver', type: 'TEST',
      description: 'test', status: 'pending', payload: {},
      createdAt: Date.now(),
    });
    expect(enqueued).toBe(true);
  });

  it('应广播事件到所有引擎', () => {
    let count = 0;
    const e1 = new MockEngine('boardGame');
    const e2 = new MockEngine('urbanDriver');
    e1.enqueueEvent = () => count++;
    e2.enqueueEvent = () => count++;
    registry.register(e1);
    registry.register(e2);

    registry.broadcastEvent({
      id: 'evt-broadcast', engineType: 'global', type: 'BROADCAST',
      description: 'all', status: 'pending', payload: {}, createdAt: Date.now(),
    });
    expect(count).toBe(2);
  });
});

// ==================== GlobalTurnManager ====================

describe('GlobalTurnManager', () => {
  let gtm: GlobalTurnManager;

  beforeEach(() => {
    gtm = createGlobalTurnManager();
  });

  afterEach(() => {
    gtm.stopAutoAdvance();
  });

  it('应正确初始化', () => {
    expect(gtm.currentTurn).toBe(0);
    expect(gtm.isPaused()).toBe(false);
  });

  it('应注册引擎', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);
    const snapshot = gtm.getSnapshot();
    expect(snapshot.registeredEngines).toContain('boardGame');
  });

  it('advanceTurn 应推进回合并调用引擎', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);

    const result = gtm.advanceTurn();
    expect(gtm.currentTurn).toBe(1);
    expect(engine.advanceCount).toBe(1);
    expect(result.turnNumber).toBe(1);
    expect(result.eventsTriggered.length).toBeGreaterThan(0);
  });

  it('多引擎应按优先级全部推进', () => {
    const bg = new MockEngine('boardGame');
    const ud = new MockEngine('urbanDriver');
    const ps = new MockEngine('phoneSim');
    gtm.registerEngine(bg);
    gtm.registerEngine(ud);
    gtm.registerEngine(ps);

    gtm.advanceTurn();
    expect(bg.advanceCount).toBe(1);
    expect(ud.advanceCount).toBe(1);
    expect(ps.advanceCount).toBe(1);
  });

  it('暂停的引擎不应被推进', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);
    engine.pause('chat-sent');

    gtm.advanceTurn();
    expect(engine.advanceCount).toBe(0);
  });

  it('全局管理器暂停时 advanceTurn 应返回空结果', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);
    gtm.pause('player-pause');

    const result = gtm.advanceTurn();
    expect(result.eventsTriggered.length).toBe(0);
    expect(engine.advanceCount).toBe(0);
  });

  it('pause 应暂停所有引擎', () => {
    const e1 = new MockEngine('boardGame');
    const e2 = new MockEngine('urbanDriver');
    gtm.registerEngine(e1);
    gtm.registerEngine(e2);

    gtm.pause('chat-sent');
    expect(e1.isPaused()).toBe(true);
    expect(e2.isPaused()).toBe(true);
  });

  it('resume 应恢复所有引擎', () => {
    const e1 = new MockEngine('boardGame');
    gtm.registerEngine(e1);
    gtm.pause('chat-sent');
    gtm.resume();

    expect(e1.isPaused()).toBe(false);
    expect(gtm.isPaused()).toBe(false);
  });

  it('executeAction 应路由到正确引擎', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);

    const result = gtm.executeAction({
      id: 'act-1', engineType: 'boardGame', type: 'ROLL_DICE',
      payload: {}, timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(engine.actionCount).toBe(1);
  });

  it('executeAction 对未注册引擎应失败', () => {
    const result = gtm.executeAction({
      id: 'act-1', engineType: 'urbanDriver', type: 'START_TRIP',
      payload: {}, timestamp: Date.now(),
    });
    expect(result.success).toBe(false);
    expect(result.narrativeConstraint).toContain('未注册');
  });

  it('应添加和清除全局事件', () => {
    gtm.addGlobalEvent({
      id: 'global-evt-1', engineType: 'global', type: 'GLOBAL',
      description: 'test', status: 'pending', payload: {}, createdAt: Date.now(),
    });
    expect(gtm.pendingGlobalEvents.length).toBe(1);

    gtm.advanceTurn();
    expect(gtm.pendingGlobalEvents.length).toBe(0);
  });

  it('应记录回合历史', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);

    gtm.advanceTurn();
    gtm.advanceTurn();
    gtm.advanceTurn();

    const history = gtm.getTurnHistory();
    expect(history.length).toBe(3);
    expect(history[0].turnNumber).toBe(1);
    expect(history[2].turnNumber).toBe(3);
  });

  it('回合历史应限制最大长度', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);

    for (let i = 0; i < 110; i++) {
      gtm.advanceTurn();
    }

    const history = gtm.getTurnHistory(Infinity);
    expect(history.length).toBe(100);
    expect(history[0].turnNumber).toBe(11);
  });

  it('注销引擎后不再调度', () => {
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);
    gtm.unregisterEngine('boardGame');

    gtm.advanceTurn();
    expect(engine.advanceCount).toBe(0);
  });

  it('快照应包含正确信息', () => {
    gtm.registerEngine(new MockEngine('boardGame'));
    gtm.registerEngine(new MockEngine('urbanDriver'));
    gtm.advanceTurn();

    const snapshot = gtm.getSnapshot();
    expect(snapshot.currentTurn).toBe(1);
    expect(snapshot.activeEngines).toBe(2);
    expect(snapshot.registeredEngines.length).toBe(2);
  });
});

// ==================== GlobalTurnManager Auto-Advance ====================

describe('GlobalTurnManager Auto-Advance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('startAutoAdvance 应定时推进', () => {
    const gtm = createGlobalTurnManager({ autoAdvanceInterval: 1000 });
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);
    gtm.startAutoAdvance();

    vi.advanceTimersByTime(1000);
    expect(engine.advanceCount).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(engine.advanceCount).toBe(2);

    gtm.stopAutoAdvance();
  });

  it('stopAutoAdvance 应停止定时推进', () => {
    const gtm = createGlobalTurnManager({ autoAdvanceInterval: 1000 });
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);
    gtm.startAutoAdvance();

    vi.advanceTimersByTime(1000);
    expect(engine.advanceCount).toBe(1);

    gtm.stopAutoAdvance();
    vi.advanceTimersByTime(3000);
    expect(engine.advanceCount).toBe(1);
  });

  it('暂停时应停止自动推进', () => {
    const gtm = createGlobalTurnManager({ autoAdvanceInterval: 1000 });
    const engine = new MockEngine('boardGame');
    gtm.registerEngine(engine);
    gtm.startAutoAdvance();

    vi.advanceTimersByTime(1000);
    expect(engine.advanceCount).toBe(1);

    gtm.pause('player-pause');
    vi.advanceTimersByTime(2000);
    const countAfterPause = engine.advanceCount;

    gtm.resume();
    gtm.startAutoAdvance();
    vi.advanceTimersByTime(1000);
    expect(engine.advanceCount).toBeGreaterThan(countAfterPause);
  });
});

// ==================== EngineRegistry + GlobalTurnManager Integration ====================

describe('EngineRegistry + GlobalTurnManager Integration', () => {
  it('多引擎集成：注册 → 推进 → 事件聚合', () => {
    const gtm = createGlobalTurnManager();

    const bg = new MockEngine('boardGame');
    const ud = new MockEngine('urbanDriver');
    gtm.registerEngine(bg);
    gtm.registerEngine(ud);

    const result = gtm.advanceTurn();

    expect(gtm.currentTurn).toBe(1);
    expect(result.eventsTriggered.length).toBe(2);
    expect(result.stateChanges.length).toBe(2);
  });

  it('引擎停用后 advanceTurn 应跳过', () => {
    const gtm = createGlobalTurnManager();
    const bg = new MockEngine('boardGame');
    const ud = new MockEngine('urbanDriver');
    gtm.registerEngine(bg);
    gtm.registerEngine(ud);

    gtm.registry.setActive('urbanDriver', false);

    const result = gtm.advanceTurn();
    expect(result.eventsTriggered.length).toBe(1);
    expect(result.eventsTriggered[0].engineType).toBe('boardGame');
  });

  it('事件广播应到达所有引擎', () => {
    const registry = createEngineRegistry();
    const e1 = new MockEngine('boardGame');
    const e2 = new MockEngine('urbanDriver');
    registry.register(e1);
    registry.register(e2);

    let e1Received = false;
    let e2Received = false;
    e1.enqueueEvent = (e: GameEvent) => { if (e.type === 'BROADCAST') e1Received = true; };
    e2.enqueueEvent = (e: GameEvent) => { if (e.type === 'BROADCAST') e2Received = true; };

    registry.broadcastEvent({
      id: 'broadcast', engineType: 'global', type: 'BROADCAST',
      description: 'all', status: 'pending', payload: {}, createdAt: Date.now(),
    });

    expect(e1Received).toBe(true);
    expect(e2Received).toBe(true);
  });
});
