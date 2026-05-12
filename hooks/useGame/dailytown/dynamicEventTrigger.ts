/**
 * 日常城镇地图 — 动态事件触发
 *
 * 在移动到低概率触发随机事件。
 */

export type DynamicEventType =
  | 'random_npc_greeting'
  | 'limited_discount'
  | 'special_guest'
  | 'weather_change';

export interface DynamicEvent {
  type: DynamicEventType;
  description: string;
  payload: Record<string, unknown>;
}

export interface DynamicEventTemplate {
  type: DynamicEventType;
  descriptions: string[];
  weight: number;
  payloadTemplate?: Record<string, unknown>;
}

export class DynamicEventTrigger {
  private templates: DynamicEventTemplate[];
  private triggerRate: number;
  private rng: () => number;

  constructor(
    templates: DynamicEventTemplate[] = [],
    triggerRate: number = 0.12,
    rng?: () => number
  ) {
    this.templates = templates;
    this.triggerRate = Math.max(0, Math.min(1, triggerRate));
    this.rng = rng ?? Math.random;
  }

  setTriggerRate(rate: number): void {
    this.triggerRate = Math.max(0, Math.min(1, rate));
  }

  addTemplate(template: DynamicEventTemplate): void {
    this.templates.push({ ...template });
  }

  setTemplates(templates: DynamicEventTemplate[]): void {
    this.templates = templates.map((t) => ({ ...t }));
  }

  shouldTrigger(): boolean {
    return this.rng() < this.triggerRate;
  }

  rollEvent(): DynamicEvent | null {
    if (!this.shouldTrigger()) return null;
    if (this.templates.length === 0) return null;

    const totalWeight = this.templates.reduce((sum, t) => sum + t.weight, 0);
    let roll = this.rng() * totalWeight;

    for (const template of this.templates) {
      roll -= template.weight;
      if (roll <= 0) {
        const descriptionIndex = Math.floor(this.rng() * template.descriptions.length);
        return {
          type: template.type,
          description: template.descriptions[descriptionIndex],
          payload: template.payloadTemplate ? { ...template.payloadTemplate } : {},
        };
      }
    }

    const last = this.templates[this.templates.length - 1];
    const descriptionIndex = Math.floor(this.rng() * last.descriptions.length);
    return {
      type: last.type,
      description: last.descriptions[descriptionIndex],
      payload: last.payloadTemplate ? { ...last.payloadTemplate } : {},
    };
  }

  getTriggerRate(): number {
    return this.triggerRate;
  }

  getTemplates(): ReadonlyArray<DynamicEventTemplate> {
    return this.templates;
  }
}

export function createDynamicEventTrigger(
  templates?: DynamicEventTemplate[],
  triggerRate?: number
): DynamicEventTrigger {
  return new DynamicEventTrigger(templates, triggerRate);
}
