/**
 * AVG Galgame — 数据模型
 *
 * 角色路线、结局判定、CG 图鉴。
 */

import type { IntimacyLevel } from './relationGraph';

/** 路线互斥组 */
export type RouteMutualGroup = 'main_heroine' | 'sub_heroine' | 'neutral';

/** 路线定义 */
export interface GalgameRoute {
  id: string;
  npcId: string;
  routeName: string;
  mutualGroup: RouteMutualGroup;
  /** 路线锁定点：达到此好感度等级后路线锁定，无法切换到同组其他路线 */
  lockLevel: IntimacyLevel;
  /** 各等级事件 ID 列表 */
  eventIds: Record<number, string[]>;
}

/** 结局类型 */
export type EndingType =
  | 'good'       // 好结局
  | 'normal'     // 普通结局
  | 'bad'        // 坏结局
  | 'true'       // 真结局
  | 'secret';    // 隐藏结局

/** 结局定义 */
export interface GalgameEnding {
  id: string;
  routeId: string;
  endingType: EndingType;
  title: string;
  description: string;
  /** 达成条件 */
  requirements: EndingRequirement[];
  /** 关联 CG ID */
  cgIds: string[];
}

/** 结局条件类型 */
export type EndingRequirementType = 'intimacy_min' | 'flag_set' | 'event_completed' | 'route_locked';

export interface EndingRequirement {
  type: EndingRequirementType;
  field: string;
  value: number | boolean | string;
}

/** CG 条目 */
export interface GalgameCG {
  id: string;
  routeId: string;
  title: string;
  description: string;
  /** 解锁条件 */
  unlockCondition: CGUnlockCondition;
  /** 是否已解锁 */
  unlocked: boolean;
  /** 解锁时间 */
  unlockedAt?: number;
  /** 图片引用 */
  imageUrl?: string;
}

/** CG 解锁条件类型 */
export type CGUnlockConditionType = 'intimacy_reached' | 'event_triggered' | 'ending_reached' | 'flag_set';

export interface CGUnlockCondition {
  type: CGUnlockConditionType;
  field: string;
  value: number | boolean | string;
}

/** Galgame 状态 */
export interface GalgameState {
  /** 当前激活的路线 ID */
  activeRouteId: string | null;
  /** 已解锁的路线 ID */
  unlockedRouteIds: string[];
  /** 已锁定的路线 ID */
  lockedRouteIds: string[];
  /** 已触发的事件 ID */
  triggeredEventIds: string[];
  /** 已完成的结局 ID */
  completedEndingIds: string[];
  /** 已解锁的 CG ID */
  unlockedCGIds: string[];
  /** 全局 flag */
  flags: Record<string, boolean>;
}

/** 路线判定结果 */
export interface RouteJudgment {
  canEnter: boolean;
  reason: string;
  suggestedRouteId: string | null;
  blockedBy: string | null;
}

/** 结局判定结果 */
export interface EndingJudgment {
  resolved: boolean;
  ending: GalgameEnding | null;
  reason: string;
}
