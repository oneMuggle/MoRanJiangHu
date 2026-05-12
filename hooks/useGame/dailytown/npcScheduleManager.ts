/**
 * 日常城镇地图 — NPC 日程管理器
 *
 * 根据当前时段计算每个 NPC 所在的位置和活动状态。
 */

import type { TimeSlot } from '../../../models/dailyTown/regionNode';
import type { NpcSchedule, NpcScheduleEntry, NpcLocation } from '../../../models/dailyTown/npcSchedule';

export class NpcScheduleManager {
  private schedules: Map<string, NpcSchedule>;

  constructor(schedules: NpcSchedule[] = []) {
    this.schedules = new Map();
    schedules.forEach((s) => this.schedules.set(s.npcId, s));
  }

  addSchedule(schedule: NpcSchedule): void {
    this.schedules.set(schedule.npcId, { ...schedule });
  }

  getSchedule(npcId: string): NpcSchedule | undefined {
    return this.schedules.get(npcId);
  }

  getAllSchedules(): NpcSchedule[] {
    return Array.from(this.schedules.values());
  }

  getNpcLocation(npcId: string, timeSlot: TimeSlot): NpcLocation | null {
    const schedule = this.schedules.get(npcId);
    if (!schedule) return null;

    const entry = schedule.entries.find(
      (e) => e.timeSlot === timeSlot && e.available
    );

    if (!entry) {
      const anyEntry = schedule.entries.find((e) => e.timeSlot === timeSlot);
      if (!anyEntry) return null;
      return {
        npcId: anyEntry.npcId,
        name: schedule.name,
        currentRegionId: anyEntry.regionId,
        activity: anyEntry.activity,
        available: false,
      };
    }

    return {
      npcId: entry.npcId,
      name: schedule.name,
      currentRegionId: entry.regionId,
      activity: entry.activity,
      available: entry.available,
    };
  }

  getNpcsInRegion(regionId: string, timeSlot: TimeSlot): NpcLocation[] {
    const result: NpcLocation[] = [];
    for (const schedule of this.schedules.values()) {
      const location = this.getNpcLocation(schedule.npcId, timeSlot);
      if (location && location.currentRegionId === regionId) {
        result.push(location);
      }
    }
    return result;
  }

  updateEntry(npcId: string, entry: NpcScheduleEntry): void {
    const schedule = this.schedules.get(npcId);
    if (!schedule) return;

    const updatedEntries = schedule.entries.map((e) =>
      e.timeSlot === entry.timeSlot ? { ...entry } : e
    );

    this.schedules.set(npcId, {
      ...schedule,
      entries: updatedEntries,
    });
  }

  removeSchedule(npcId: string): void {
    this.schedules.delete(npcId);
  }
}

export function createNpcScheduleManager(schedules?: NpcSchedule[]): NpcScheduleManager {
  return new NpcScheduleManager(schedules);
}
