/**
 * AVG Galgame — 结局解析器 + CG 管理器
 *
 * 根据当前路线状态和好感度判定最终结局。
 * 管理 CG 图鉴的解锁和查询。
 */

import type {
  GalgameEnding,
  EndingJudgment,
  GalgameState,
  GalgameCG,
  CGUnlockCondition,
} from '../../../../models/avg/galgame';

export class EndingResolver {
  private _endings: Map<string, GalgameEnding>;

  constructor(endings: GalgameEnding[] = []) {
    this._endings = new Map();
    for (const ending of endings) {
      this._endings.set(ending.id, { ...ending });
    }
  }

  addEnding(ending: GalgameEnding): void {
    this._endings.set(ending.id, { ...ending });
  }

  removeEnding(endingId: string): void {
    this._endings.delete(endingId);
  }

  getEnding(endingId: string): GalgameEnding | undefined {
    return this._endings.get(endingId);
  }

  getEndingsForRoute(routeId: string): GalgameEnding[] {
    return Array.from(this._endings.values()).filter((e) => e.routeId === routeId);
  }

  /**
   * 判定当前状态能达成的结局
   */
  resolve(
    routeId: string,
    intimacy: number,
    state: GalgameState
  ): EndingJudgment {
    const candidates = this.getEndingsForRoute(routeId);
    if (candidates.length === 0) {
      return { resolved: false, ending: null, reason: '该路线没有定义的结局' };
    }

    const priority: Record<string, number> = { true: 5, good: 4, normal: 3, bad: 2, secret: 1 };
    const sorted = [...candidates].sort(
      (a, b) => (priority[b.endingType] ?? 0) - (priority[a.endingType] ?? 0)
    );

    for (const ending of sorted) {
      if (this._checkRequirements(ending, intimacy, state)) {
        return { resolved: true, ending, reason: '' };
      }
    }

    return { resolved: false, ending: null, reason: '没有满足条件的结局' };
  }

  private _checkRequirements(
    ending: GalgameEnding,
    intimacy: number,
    state: GalgameState
  ): boolean {
    return ending.requirements.every((req) => {
      switch (req.type) {
        case 'intimacy_min':
          return intimacy >= (req.value as number);
        case 'flag_set':
          return !!state.flags[req.field as string];
        case 'event_completed':
          return state.triggeredEventIds.includes(req.field as string);
        case 'route_locked':
          return state.lockedRouteIds.includes(ending.routeId);
        default:
          return false;
      }
    });
  }
}

export function createEndingResolver(endings?: GalgameEnding[]): EndingResolver {
  return new EndingResolver(endings);
}

/**
 * CG 管理器 — 管理 CG 图鉴的解锁和查询。
 */
export class CGManager {
  private _cgs: Map<string, GalgameCG>;

  constructor(cgs: GalgameCG[] = []) {
    this._cgs = new Map();
    for (const cg of cgs) {
      this._cgs.set(cg.id, { ...cg });
    }
  }

  addCG(cg: GalgameCG): void {
    this._cgs.set(cg.id, { ...cg });
  }

  getCG(cgId: string): GalgameCG | undefined {
    return this._cgs.get(cgId);
  }

  getAllCGs(): GalgameCG[] {
    return Array.from(this._cgs.values());
  }

  getCGsForRoute(routeId: string): GalgameCG[] {
    return Array.from(this._cgs.values()).filter((cg) => cg.routeId === routeId);
  }

  getUnlockedCGs(): GalgameCG[] {
    return Array.from(this._cgs.values()).filter((cg) => cg.unlocked);
  }

  getLockedCGs(): GalgameCG[] {
    return Array.from(this._cgs.values()).filter((cg) => !cg.unlocked);
  }

  /**
   * 检查并解锁满足条件的 CG
   */
  checkUnlock(intimacy: number, state: GalgameState): string[] {
    const newlyUnlocked: string[] = [];

    for (const [id, cg] of this._cgs) {
      if (cg.unlocked) continue;

      if (this._checkCondition(cg.unlockCondition, intimacy, state)) {
        const unlocked = { ...cg, unlocked: true, unlockedAt: Date.now() };
        this._cgs.set(id, unlocked);
        newlyUnlocked.push(id);
      }
    }

    return newlyUnlocked;
  }

  private _checkCondition(
    condition: CGUnlockCondition,
    intimacy: number,
    state: GalgameState
  ): boolean {
    switch (condition.type) {
      case 'intimacy_reached':
        return intimacy >= (condition.value as number);
      case 'event_triggered':
        return state.triggeredEventIds.includes(condition.field);
      case 'ending_reached':
        return state.completedEndingIds.includes(condition.field as string);
      case 'flag_set':
        return !!state.flags[condition.field as string];
      default:
        return false;
    }
  }
}

export function createCGManager(cgs?: GalgameCG[]): CGManager {
  return new CGManager(cgs);
}
