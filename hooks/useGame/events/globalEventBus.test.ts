/**
 * globalEventBus.test.ts
 *
 * EventBus 单元测试：订阅/发布/广播/历史/延迟队列
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GlobalEventBus } from './globalEventBus';
import type { EventSubscriber } from './eventSubscriber';
import type { GameEvent, EngineType } from '../engine/types';
import type { GameEventType } from './eventTypes';

function makeEvent(type: GameEventType, engine: EngineType = 'boardGame'): GameEvent {
  return {
    id: `test-${type}`,
    engineType: engine,
    type,
    description: `Test event: ${type}`,
    status: 'pending',
    payload: {},
    createdAt: Date.now(),
  };
}

function makeSubscriber(
  engineType: EngineType = 'phoneSim',
  eventTypes: GameEventType[] = [],
  priority = 0,
): EventSubscriber {
  return {
    subscriberType: engineType,
    subscribedEventTypes: eventTypes,
    handleEvent: () => {},
    priority,
  };
}

describe('GlobalEventBus', () => {
  let bus: GlobalEventBus;

  beforeEach(() => {
    GlobalEventBus.resetInstance();
    bus = GlobalEventBus.getInstance();
  });

  describe('singleton', () => {
    it('returns the same instance', () => {
      const a = GlobalEventBus.getInstance();
      const b = GlobalEventBus.getInstance();
      expect(a).toBe(b);
    });

    it('can reset and create new instance', () => {
      const old = GlobalEventBus.getInstance();
      GlobalEventBus.resetInstance();
      const fresh = GlobalEventBus.getInstance();
      expect(old).not.toBe(fresh);
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('registers a subscriber', () => {
      const sub = makeSubscriber('phoneSim', ['BATTLE_START']);
      bus.subscribe(sub);
      expect(bus.getSubscribers()).toContain(sub);
    });

    it('removes a subscriber on unsubscribe', () => {
      const sub = makeSubscriber('phoneSim', ['BATTLE_START']);
      bus.subscribe(sub);
      bus.unsubscribe('phoneSim');
      expect(bus.getSubscribers()).not.toContain(sub);
    });

    it('overwrites existing subscriber of same type', () => {
      const sub1 = makeSubscriber('phoneSim', ['BATTLE_START'], 1);
      const sub2 = makeSubscriber('phoneSim', ['BATTLE_END'], 2);
      bus.subscribe(sub1);
      bus.subscribe(sub2);
      expect(bus.getSubscribers()).toEqual([sub2]);
    });
  });

  describe('publish', () => {
    it('routes events to matching subscribers', () => {
      let received = false;
      const sub: EventSubscriber = {
        subscriberType: 'phoneSim',
        subscribedEventTypes: ['BATTLE_START'],
        handleEvent: () => { received = true; },
      };
      bus.subscribe(sub);
      bus.publish(makeEvent('BATTLE_START'));
      expect(received).toBe(true);
    });

    it('does not route events to non-matching subscribers', () => {
      let received = false;
      const sub: EventSubscriber = {
        subscriberType: 'phoneSim',
        subscribedEventTypes: ['BATTLE_START' as GameEventType],
        handleEvent: () => { received = true; },
      };
      bus.subscribe(sub);
      bus.publish(makeEvent('BATTLE_END'));
      expect(received).toBe(false);
    });

    it('routes to all subscribers when subscribedEventTypes is empty', () => {
      let count = 0;
      const sub: EventSubscriber = {
        subscriberType: 'phoneSim',
        subscribedEventTypes: [],
        handleEvent: () => { count++; },
      };
      bus.subscribe(sub);
      bus.publish(makeEvent('BATTLE_START'));
      bus.publish(makeEvent('BATTLE_END'));
      expect(count).toBe(2);
    });

    it('appends events to history', () => {
      bus.publish(makeEvent('BATTLE_START'));
      expect(bus.getHistory().length).toBe(1);
    });

    it('calls subscribers in priority order', () => {
      const order: number[] = [];
      const sub1: EventSubscriber = {
        subscriberType: 'phoneSim',
        subscribedEventTypes: ['BATTLE_START'],
        handleEvent: () => order.push(1),
        priority: 1,
      };
      const sub2: EventSubscriber = {
        subscriberType: 'rpgBattle',
        subscribedEventTypes: ['BATTLE_START'],
        handleEvent: () => order.push(2),
        priority: 2,
      };
      bus.subscribe(sub1);
      bus.subscribe(sub2);
      bus.publish(makeEvent('BATTLE_START'));
      expect(order).toEqual([2, 1]); // higher priority first
    });
  });

  describe('broadcast', () => {
    it('sends events to all subscribers regardless of filter', () => {
      let count = 0;
      const sub1: EventSubscriber = {
        subscriberType: 'phoneSim',
        subscribedEventTypes: ['BATTLE_START'],
        handleEvent: () => count++,
      };
      const sub2: EventSubscriber = {
        subscriberType: 'rpgBattle',
        subscribedEventTypes: ['DIALOGUE_CHOICE'],
        handleEvent: () => count++,
      };
      bus.subscribe(sub1);
      bus.subscribe(sub2);
      bus.broadcast(makeEvent('BATTLE_END'));
      expect(count).toBe(2);
    });
  });

  describe('history', () => {
    it('maintains last N events', () => {
      for (let i = 0; i < 250; i++) {
        bus.publish({
          id: `evt-${i}`,
          engineType: 'boardGame' as EngineType,
          type: 'BATTLE_DAMAGE' as GameEventType,
          description: `Event ${i}`,
          status: 'pending',
          payload: {},
          createdAt: Date.now(),
        });
      }
      // MAX_HISTORY is 200
      expect(bus.getHistory().length).toBe(200);
    });

    it('getHistory with limit returns only last N', () => {
      bus.publish(makeEvent('BATTLE_START'));
      bus.publish(makeEvent('BATTLE_END'));
      bus.publish(makeEvent('BATTLE_DAMAGE'));
      expect(bus.getHistory(2).length).toBe(2);
    });

    it('filters by event type', () => {
      bus.publish(makeEvent('BATTLE_START'));
      bus.publish(makeEvent('DIALOGUE_CHOICE', 'avgDialogue'));
      bus.publish(makeEvent('BATTLE_END'));
      const battleEvents = bus.getHistory().filter((e) => e.type.startsWith('BATTLE'));
      expect(battleEvents.length).toBe(2);
    });

    it('clears history', () => {
      bus.publish(makeEvent('BATTLE_START'));
      bus.clearHistory();
      expect(bus.getHistory()).toEqual([]);
    });
  });

  describe('delayed queue', () => {
    it('enqueues events for later processing', () => {
      bus.enqueue(makeEvent('BATTLE_START'), 5);
      expect(bus.getQueueSize()).toBe(1);
    });

    it('processes events when current turn reaches processTurn', () => {
      let received = false;
      const sub: EventSubscriber = {
        subscriberType: 'phoneSim',
        subscribedEventTypes: ['BATTLE_START'],
        handleEvent: () => { received = true; },
      };
      bus.subscribe(sub);
      bus.enqueue(makeEvent('BATTLE_START'), 5);

      bus.processQueued(3); // too early
      expect(received).toBe(false);

      bus.processQueued(5); // exactly right
      expect(received).toBe(true);
      expect(bus.getQueueSize()).toBe(0);
    });
  });
});
