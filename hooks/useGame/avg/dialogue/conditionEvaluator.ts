/**
 * AVG 对话树 — 条件求值器
 *
 * 基于当前游戏状态判断对话分支可达性。
 */

import type { DialogueCondition, DialogueChoice } from '../../../../models/avg/dialogueTree';

export interface GameContext {
  stats: Record<string, number>;
  intimacy: Record<string, number>;
  tasks: Record<string, string>;
  items: string[];
  flags: Record<string, boolean>;
}

export class ConditionEvaluator {
  private context: GameContext;

  constructor(context: GameContext) {
    this.context = context;
  }

  updateContext(context: Partial<GameContext>): void {
    if (context.stats) this.context.stats = { ...this.context.stats, ...context.stats };
    if (context.intimacy) this.context.intimacy = { ...this.context.intimacy, ...context.intimacy };
    if (context.tasks) this.context.tasks = { ...this.context.tasks, ...context.tasks };
    if (context.items) this.context.items = [...new Set([...this.context.items, ...context.items])];
    if (context.flags) this.context.flags = { ...this.context.flags, ...context.flags };
  }

  evaluate(condition: DialogueCondition): boolean {
    switch (condition.type) {
      case 'always_true':
        return true;
      case 'always_false':
        return false;
      case 'stat_check':
        return this._checkStat(condition);
      case 'intimacy_check':
        return this._checkIntimacy(condition);
      case 'task_check':
        return this._checkTask(condition);
      case 'item_check':
        return this._checkItem(condition);
      case 'flag_check':
        return this._checkFlag(condition);
      default:
        return false;
    }
  }

  evaluateChoices(choices: DialogueChoice[]): DialogueChoice[] {
    return choices.filter((choice) => {
      if (!choice.condition) return true;
      return this.evaluate(choice.condition);
    });
  }

  private _checkStat(condition: DialogueCondition): boolean {
    if (!condition.field) return false;
    const value = this.context.stats[condition.field];
    if (value === undefined) return false;
    return this._compare(value, condition);
  }

  private _checkIntimacy(condition: DialogueCondition): boolean {
    if (!condition.field) return false;
    const value = this.context.intimacy[condition.field];
    if (value === undefined) return false;
    return this._compare(value, condition);
  }

  private _checkTask(condition: DialogueCondition): boolean {
    if (!condition.field) return false;
    const value = this.context.tasks[condition.field];
    if (value === undefined) return false;
    if (condition.operator === 'eq') return value === condition.value;
    if (condition.operator === 'neq') return value !== condition.value;
    return false;
  }

  private _checkItem(condition: DialogueCondition): boolean {
    const hasItem = this.context.items.includes(condition.value as string);
    return condition.operator === 'has' ? hasItem : hasItem === (condition.value as boolean);
  }

  private _checkFlag(condition: DialogueCondition): boolean {
    if (!condition.field) return false;
    const value = this.context.flags[condition.field];
    if (value === undefined) return false;
    if (condition.operator === 'eq') return value === condition.value;
    return false;
  }

  private _compare(actual: number, condition: DialogueCondition): boolean {
    const expected = typeof condition.value === 'number' ? condition.value : Number(condition.value);
    switch (condition.operator) {
      case 'gte':
        return actual >= expected;
      case 'lte':
        return actual <= expected;
      case 'eq':
        return actual === expected;
      case 'neq':
        return actual !== expected;
      default:
        return false;
    }
  }
}

export function createConditionEvaluator(context: GameContext): ConditionEvaluator {
  return new ConditionEvaluator(context);
}
