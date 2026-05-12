/**
 * 日常城镇地图 — NPC 日程数据模型
 */

import type { TimeSlot } from './regionNode';

export interface NpcScheduleEntry {
  npcId: string;
  timeSlot: TimeSlot;
  regionId: string;
  activity: string;
  available: boolean;
}

export interface NpcSchedule {
  npcId: string;
  name: string;
  entries: NpcScheduleEntry[];
}

export interface NpcLocation {
  npcId: string;
  name: string;
  currentRegionId: string;
  activity: string;
  available: boolean;
}
