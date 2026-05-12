/**
 * SLG + AI 混合架构 — 后果链式系统
 *
 * 网约车后果事件的链式反应，支持级联触发和严重程度升级。
 */

export type ConsequenceType =
  | '平台投诉' | '行车记录仪曝光' | '药物后遗症' | '差评降权'
  | '乘客依赖' | '网络传播' | '警察盘查' | '同行竞争'
  | '常客流失' | '封号处罚' | '勒索威胁' | '情感纠葛';

export type Severity = '轻微' | '中等' | '严重' | '毁灭';

export interface ConsequenceEvent {
  id: string;
  type: ConsequenceType;
  severity: Severity;
  description: string;
  triggeredAt: number;
  resolved: boolean;
  chainParentId: string | null;
  childIds: string[];
}

export interface ChainRule {
  trigger: ConsequenceType;
  condition: (event: ConsequenceEvent, context: ChainContext) => boolean;
  consequence: ConsequenceType;
  severityUpgrade: boolean;
  delayMs: number;
}

export interface ChainContext {
  totalConsequences: number;
  platformRating: number;   // 0-100
  activeTrips: number;
  drugInvolved: boolean;
  recordingActive: boolean;
}

const SEVERITY_ORDER: Severity[] = ['轻微', '中等', '严重', '毁灭'];

const DEFAULT_RULES: ChainRule[] = [
  {
    trigger: '平台投诉',
    condition: (_event, ctx) => ctx.totalConsequences >= 3,
    consequence: '封号处罚',
    severityUpgrade: true,
    delayMs: 3600000,
  },
  {
    trigger: '行车记录仪曝光',
    condition: (_event, ctx) => ctx.recordingActive,
    consequence: '网络传播',
    severityUpgrade: true,
    delayMs: 7200000,
  },
  {
    trigger: '网络传播',
    condition: (_event, ctx) => ctx.drugInvolved,
    consequence: '警察盘查',
    severityUpgrade: true,
    delayMs: 1800000,
  },
  {
    trigger: '差评降权',
    condition: (_event, ctx) => ctx.platformRating < 30,
    consequence: '封号处罚',
    severityUpgrade: true,
    delayMs: 86400000,
  },
  {
    trigger: '乘客依赖',
    condition: (_event, ctx) => ctx.activeTrips > 5,
    consequence: '情感纠葛',
    severityUpgrade: false,
    delayMs: 43200000,
  },
  {
    trigger: '勒索威胁',
    condition: (_event, ctx) => ctx.drugInvolved || ctx.recordingActive,
    consequence: '网络传播',
    severityUpgrade: true,
    delayMs: 21600000,
  },
];

export class ConsequenceChain {
  private _events: ConsequenceEvent[] = [];
  private _rules: ChainRule[];
  private _pendingChains: Array<{ rule: ChainRule; parentId: string; fireAt: number }> = [];

  constructor(rules?: ChainRule[]) {
    this._rules = rules ?? DEFAULT_RULES;
  }

  trigger(type: ConsequenceType, severity: Severity, description: string, context: ChainContext): ConsequenceEvent {
    const event: ConsequenceEvent = {
      id: `conseq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      severity,
      description,
      triggeredAt: Date.now(),
      resolved: false,
      chainParentId: null,
      childIds: [],
    };

    this._events.push(event);

    const chains = this._checkChainRules(event, context);
    for (const chain of chains) {
      this._pendingChains.push({
        rule: chain,
        parentId: event.id,
        fireAt: Date.now() + chain.delayMs,
      });
    }

    return event;
  }

  processPendingChains(context: ChainContext): ConsequenceEvent[] {
    const now = Date.now();
    const fired: ConsequenceEvent[] = [];

    const remaining = this._pendingChains.filter((chain) => {
      if (chain.fireAt > now) return true;

      const parent = this._events.find((e) => e.id === chain.parentId);
      if (!parent || parent.resolved) return false;

      const childSeverity = chain.rule.severityUpgrade
        ? this._upgradeSeverity(parent.severity)
        : parent.severity;

      const child = this.trigger(
        chain.rule.consequence,
        childSeverity,
        `由「${parent.type}」引发的连锁反应：${chain.rule.consequence}`,
        context,
      );
      child.chainParentId = parent.id;
      parent.childIds.push(child.id);

      fired.push(child);
      return false;
    });

    this._pendingChains = remaining;
    return fired;
  }

  resolveEvent(id: string): boolean {
    const event = this._events.find((e) => e.id === id);
    if (!event) return false;
    event.resolved = true;
    return true;
  }

  getActiveEvents(): ConsequenceEvent[] {
    return this._events.filter((e) => !e.resolved);
  }

  getEventsByType(type: ConsequenceType): ConsequenceEvent[] {
    return this._events.filter((e) => e.type === type);
  }

  getPendingChainCount(): number {
    return this._pendingChains.length;
  }

  getEventChainRoot(id: string): ConsequenceEvent | null {
    const event = this._events.find((e) => e.id === id);
    if (!event) return null;

    let current: ConsequenceEvent | undefined = event;
    while (current?.chainParentId) {
      current = this._events.find((e) => e.id === current!.chainParentId);
    }
    return current ?? null;
  }

  clearResolved(): void {
    this._events = this._events.filter((e) => !e.resolved);
  }

  private _checkChainRules(event: ConsequenceEvent, context: ChainContext): ChainRule[] {
    return this._rules.filter((rule) => rule.trigger === event.type && rule.condition(event, context));
  }

  private _upgradeSeverity(severity: Severity): Severity {
    const idx = SEVERITY_ORDER.indexOf(severity);
    return SEVERITY_ORDER[Math.min(idx + 1, SEVERITY_ORDER.length - 1)];
  }
}

export function createConsequenceChain(rules?: ChainRule[]): ConsequenceChain {
  return new ConsequenceChain(rules);
}
