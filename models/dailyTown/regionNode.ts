/**
 * 日常城镇地图 — 区域节点数据模型
 */

export type RegionType =
  | '家'
  | '客栈'
  | '酒楼'
  | '武器铺'
  | '药铺'
  | '茶楼'
  | '书院'
  | '市集'
  | 'NPC居所'
  | '衙门'
  | '医馆'
  | '武馆'
  | '寺庙';

export type TimeSlot = '上午' | '下午' | '晚上';

export interface RegionNode {
  id: string;
  name: string;
  type: RegionType;
  description: string;
  connectedRegionIds: string[];
  availableTimeSlots: TimeSlot[];
  npcIds: string[];
  eventTemplateIds: string[];
  moveCost?: number;
}

export interface RegionState {
  visited: boolean;
  lastVisitedTurn?: number;
  unlocked: boolean;
}
