/**
 * AVG 好感度状态机 + 触发器
 *
 * 好感度状态机: 陌生人 → 认识 → 熟悉 → 好友 → 挚友 → 恋人
 * 触发器: 好感度阈值触发特殊事件/对话/选项
 */

import type { IntimacyLevel } from '../../../../models/avg/relationGraph';
import {
  INTIMACY_THRESHOLDS,
  INTIMACY_LEVEL_LABELS,
} from '../../../../models/avg/relationGraph';

/** 好感度事件定义 */
export interface IntimacyEvent {
  id: string;
  npcId: string;
  /** 触发所需的好感度等级 */
  requiredLevel: IntimacyLevel;
  /** 事件标题 */
  title: string;
  /** 事件描述 */
  description: string;
  /** 是否已触发 */
  triggered: boolean;
}

/** 好感度触发结果 */
export interface IntimacyTriggerResult {
  /** 新触发的事件 */
  newEvents: IntimacyEvent[];
  /** 等级是否提升 */
  levelUp: boolean;
  /** 旧等级 */
  oldLevel: IntimacyLevel;
  /** 新等级 */
  newLevel: IntimacyLevel;
  /** 当前好感度 */
  currentIntimacy: number;
}

/** 好感度触发器 */
export class IntimacyTrigger {
  private _events: Map<string, IntimacyEvent>; // key: `${npcId}_${level}`

  constructor(events: IntimacyEvent[] = []) {
    this._events = new Map();
    for (const event of events) {
      this._events.set(this._eventKey(event.npcId, event.requiredLevel), { ...event });
    }
  }

  addEvent(event: IntimacyEvent): void {
    this._events.set(this._eventKey(event.npcId, event.requiredLevel), { ...event });
  }

  removeEvent(npcId: string, level: IntimacyLevel): void {
    this._events.delete(this._eventKey(npcId, level));
  }

  /**
   * 检查好感度变更后的触发事件
   */
  check(npcId: string, newIntimacy: number, oldLevel: IntimacyLevel, newLevel: IntimacyLevel): IntimacyTriggerResult {
    const newEvents: IntimacyEvent[] = [];
    let levelUp = false;

    if (newLevel > oldLevel) {
      levelUp = true;
      for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
        const event = this._events.get(this._eventKey(npcId, lvl as IntimacyLevel));
        if (event && !event.triggered) {
          const triggered = { ...event, triggered: true };
          this._events.set(this._eventKey(npcId, lvl as IntimacyLevel), triggered);
          newEvents.push(triggered);
        }
      }
    }

    return {
      newEvents,
      levelUp,
      oldLevel,
      newLevel,
      currentIntimacy: newIntimacy,
    };
  }

  getEventsForNpc(npcId: string): IntimacyEvent[] {
    const result: IntimacyEvent[] = [];
    for (const event of this._events.values()) {
      if (event.npcId === npcId) result.push({ ...event });
    }
    return result;
  }

  getTriggeredEvents(): IntimacyEvent[] {
    return Array.from(this._events.values()).filter((e) => e.triggered);
  }

  resetAll(): void {
    for (const [key, event] of this._events) {
      this._events.set(key, { ...event, triggered: false });
    }
  }

  getLevelLabel(level: IntimacyLevel): string {
    return INTIMACY_LEVEL_LABELS[level];
  }

  intimacyToLevel(intimacy: number): IntimacyLevel {
    return IntimacyStateMachine.intimacyToLevel(intimacy);
  }

  getLevelThreshold(level: IntimacyLevel): number {
    return INTIMACY_THRESHOLDS[level];
  }

  private _eventKey(npcId: string, level: IntimacyLevel): string {
    return `${npcId}_${level}`;
  }
}

/**
 * 好感度状态机 — 管理好感度等级转换和阈值计算。
 */
export class IntimacyStateMachine {
  static intimacyToLevel(intimacy: number): IntimacyLevel {
    if (intimacy >= INTIMACY_THRESHOLDS[5]) return 5;
    if (intimacy >= INTIMACY_THRESHOLDS[4]) return 4;
    if (intimacy >= INTIMACY_THRESHOLDS[3]) return 3;
    if (intimacy >= INTIMACY_THRESHOLDS[2]) return 2;
    if (intimacy >= INTIMACY_THRESHOLDS[1]) return 1;
    return 0;
  }

  static getLevelThreshold(level: IntimacyLevel): number {
    return INTIMACY_THRESHOLDS[level];
  }

  static getLevelLabel(level: IntimacyLevel): string {
    return INTIMACY_LEVEL_LABELS[level];
  }

  static remainingToNext(level: IntimacyLevel): number {
    if (level >= 5) return 0;
    return INTIMACY_THRESHOLDS[level + 1] - INTIMACY_THRESHOLDS[level];
  }

  static remainingToLevel(from: IntimacyLevel, to: IntimacyLevel): number {
    if (to <= from) return 0;
    return INTIMACY_THRESHOLDS[to] - INTIMACY_THRESHOLDS[from];
  }
}

export function createIntimacyTrigger(events?: IntimacyEvent[]): IntimacyTrigger {
  return new IntimacyTrigger(events);
}
