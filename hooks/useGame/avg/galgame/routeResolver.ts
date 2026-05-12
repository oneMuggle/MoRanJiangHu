/**
 * AVG Galgame — 路线判定器
 *
 * 判定玩家是否可以进入某条角色路线，处理路线互斥和锁定。
 */

import type { IntimacyLevel } from '../../../../models/avg/relationGraph';
import { INTIMACY_THRESHOLDS } from '../../../../models/avg/relationGraph';
import type {
  GalgameRoute,
  RouteJudgment,
  GalgameState,
} from '../../../../models/avg/galgame';

export class RouteResolver {
  private _routes: Map<string, GalgameRoute>;

  constructor(routes: GalgameRoute[] = []) {
    this._routes = new Map();
    for (const route of routes) {
      this._routes.set(route.id, { ...route });
    }
  }

  addRoute(route: GalgameRoute): void {
    this._routes.set(route.id, { ...route });
  }

  removeRoute(routeId: string): void {
    this._routes.delete(routeId);
  }

  getRoute(routeId: string): GalgameRoute | undefined {
    return this._routes.get(routeId);
  }

  getAllRoutes(): GalgameRoute[] {
    return Array.from(this._routes.values());
  }

  /**
   * 判定是否可以进入指定路线
   */
  judgeEnter(
    routeId: string,
    intimacy: number,
    state: GalgameState
  ): RouteJudgment {
    const route = this._routes.get(routeId);
    if (!route) {
      return { canEnter: false, reason: '路线不存在', suggestedRouteId: null, blockedBy: null };
    }

    // 检查是否已被锁定（锁定的是其他路线）
    if (state.lockedRouteIds.length > 0) {
      const lockedRouteId = state.lockedRouteIds.find((id) => {
        const locked = this._routes.get(id);
        return locked && locked.mutualGroup === route.mutualGroup && locked.mutualGroup !== 'neutral';
      });
      if (lockedRouteId) {
        return {
          canEnter: false,
          reason: `路线已锁定为: ${this._routes.get(lockedRouteId)!.routeName}`,
          suggestedRouteId: lockedRouteId,
          blockedBy: lockedRouteId,
        };
      }
    }

    // 检查好感度是否达到路线最低要求
    const threshold = INTIMACY_THRESHOLDS[route.lockLevel];
    if (intimacy < threshold) {
      return {
        canEnter: false,
        reason: `好感度不足，需要 ${threshold}，当前 ${intimacy}`,
        suggestedRouteId: null,
        blockedBy: null,
      };
    }

    return {
      canEnter: true,
      reason: '',
      suggestedRouteId: routeId,
      blockedBy: null,
    };
  }

  /**
   * 检查是否应该锁定路线
   */
  shouldLockRoute(routeId: string, intimacy: number, state: GalgameState): boolean {
    const route = this._routes.get(routeId);
    if (!route) return false;
    if (state.lockedRouteIds.includes(routeId)) return true;

    const threshold = INTIMACY_THRESHOLDS[route.lockLevel];
    return intimacy >= threshold && route.mutualGroup !== 'neutral';
  }

  /**
   * 获取当前好感度对应的建议路线
   */
  suggestRoute(intimacy: number, npcId: string, state: GalgameState): GalgameRoute | null {
    const candidates = Array.from(this._routes.values()).filter(
      (r) => r.npcId === npcId && !state.lockedRouteIds.includes(r.id)
    );

    candidates.sort((a, b) => a.lockLevel - b.lockLevel);
    for (const route of candidates) {
      if (intimacy >= INTIMACY_THRESHOLDS[route.lockLevel]) {
        return route;
      }
    }
    return null;
  }
}

export function createRouteResolver(routes?: GalgameRoute[]): RouteResolver {
  return new RouteResolver(routes);
}
