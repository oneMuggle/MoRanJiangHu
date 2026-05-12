/**
 * SLG + AI 混合架构 — NPC 社交图谱
 *
 * NPC 之间通过关系网络互动，生成事件和消息。
 */

export type RelationshipType = 'friend' | 'rival' | 'lover' | 'family' | 'colleague' | 'stranger';

export interface SocialBond {
  fromId: string;
  toId: string;
  type: RelationshipType;
  strength: number;  // 0 ~ 100
  lastInteraction?: number;
}

export interface SocialEvent {
  id: string;
  initiatorId: string;
  targetId: string;
  type: string;
  description: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface InteractionRule {
  bondType: RelationshipType;
  minStrength: number;
  triggerChance: number;  // 0 ~ 1
  eventTypes: string[];
}

const DEFAULT_RULES: InteractionRule[] = [
  { bondType: 'lover', minStrength: 50, triggerChance: 0.8, eventTypes: ['flirt', 'date_invite', 'jealousy'] },
  { bondType: 'friend', minStrength: 30, triggerChance: 0.5, eventTypes: ['gossip', 'hangout', 'help_request'] },
  { bondType: 'rival', minStrength: 20, triggerChance: 0.4, eventTypes: ['challenge', 'sabotage', 'taunt'] },
  { bondType: 'colleague', minStrength: 10, triggerChance: 0.3, eventTypes: ['work_request', 'gossip', 'conflict'] },
  { bondType: 'family', minStrength: 60, triggerChance: 0.6, eventTypes: ['check_in', 'drama', 'favor'] },
  { bondType: 'stranger', minStrength: 0, triggerChance: 0.1, eventTypes: ['first_meet'] },
];

export class SocialGraph {
  private _bonds: Map<string, SocialBond>;
  private _npcIds: Set<string>;
  private _events: SocialEvent[];
  private _rules: InteractionRule[];

  constructor() {
    this._bonds = new Map();
    this._npcIds = new Set();
    this._events = [];
    this._rules = DEFAULT_RULES;
  }

  addNPC(npcId: string): void {
    this._npcIds.add(npcId);
  }

  removeNPC(npcId: string): void {
    this._npcIds.delete(npcId);
    const toRemove: string[] = [];
    for (const [key] of this._bonds) {
      if (key.startsWith(`${npcId}:`) || key.endsWith(`:${npcId}`)) {
        toRemove.push(key);
      }
    }
    for (const key of toRemove) {
      this._bonds.delete(key);
    }
  }

  setBond(fromId: string, toId: string, type: RelationshipType, strength: number): void {
    const key = this._bondKey(fromId, toId);
    this._bonds.set(key, {
      fromId,
      toId,
      type,
      strength,
      lastInteraction: Date.now(),
    });
  }

  getBond(fromId: string, toId: string): SocialBond | undefined {
    return this._bonds.get(this._bondKey(fromId, toId));
  }

  getBondsForNPC(npcId: string): SocialBond[] {
    return Array.from(this._bonds.values()).filter(
      (bond) => bond.fromId === npcId || bond.toId === npcId
    );
  }

  getNPCs(): string[] {
    return Array.from(this._npcIds);
  }

  simulateInteractions(): SocialEvent[] {
    const events: SocialEvent[] = [];

    for (const bond of this._bonds.values()) {
      const rule = this._rules.find(
        (r) => r.bondType === bond.type && r.minStrength <= bond.strength
      );
      if (!rule) continue;

      if (Math.random() < rule.triggerChance) {
        const eventType = rule.eventTypes[Math.floor(Math.random() * rule.eventTypes.length)];
        const event: SocialEvent = {
          id: `social-${Date.now()}-${bond.fromId}-${bond.toId}-${Math.random().toString(36).slice(2, 6)}`,
          initiatorId: bond.fromId,
          targetId: bond.toId,
          type: eventType,
          description: `${bond.fromId} 对 ${bond.toId} 触发了 ${eventType}`,
          timestamp: Date.now(),
          payload: { bondType: bond.type, strength: bond.strength },
        };
        events.push(event);
        this._events.push(event);

        bond.lastInteraction = Date.now();
      }
    }

    return events;
  }

  getRecentEvents(limit: number = 10): SocialEvent[] {
    return this._events.slice(-limit);
  }

  getInteractionFrequency(npcId: string): Map<string, number> {
    const freq = new Map<string, number>();
    for (const event of this._events) {
      if (event.initiatorId === npcId || event.targetId === npcId) {
        const other = event.initiatorId === npcId ? event.targetId : event.initiatorId;
        freq.set(other, (freq.get(other) ?? 0) + 1);
      }
    }
    return freq;
  }

  updateRules(rules: InteractionRule[]): void {
    this._rules = rules;
  }

  clearEvents(): void {
    this._events = [];
  }

  private _bondKey(a: string, b: string): string {
    return `${a}:${b}`;
  }
}

export function createSocialGraph(): SocialGraph {
  return new SocialGraph();
}
