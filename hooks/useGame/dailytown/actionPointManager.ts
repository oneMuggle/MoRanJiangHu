/**
 * 日常城镇地图 — 行动力管理器
 *
 * 管理每日行动力上限、消耗和恢复。
 */

export interface ActionPointState {
  current: number;
  max: number;
  day: number;
}

export class ActionPointManager {
  private state: ActionPointState;

  constructor(maxPoints: number = 5, startDay: number = 1) {
    this.state = {
      current: maxPoints,
      max: maxPoints,
      day: startDay,
    };
  }

  get current(): number {
    return this.state.current;
  }

  get max(): number {
    return this.state.max;
  }

  get day(): number {
    return this.state.day;
  }

  getState(): ActionPointState {
    return { ...this.state };
  }

  canSpend(amount: number = 1): boolean {
    return this.state.current >= amount;
  }

  spend(amount: number = 1): boolean {
    if (!this.canSpend(amount)) return false;
    this.state = {
      ...this.state,
      current: this.state.current - amount,
    };
    return true;
  }

  refill(points?: number): void {
    const newPoints = points ?? this.state.max;
    this.state = {
      ...this.state,
      current: newPoints,
      max: Math.max(this.state.max, newPoints),
    };
  }

  advanceDay(): void {
    this.state = {
      ...this.state,
      day: this.state.day + 1,
      current: this.state.max,
    };
  }

  setMax(max: number): void {
    this.state = {
      ...this.state,
      max,
      current: Math.min(this.state.current, max),
    };
  }
}

export function createActionPointManager(maxPoints?: number): ActionPointManager {
  return new ActionPointManager(maxPoints);
}
