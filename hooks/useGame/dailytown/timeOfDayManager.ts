/**
 * 日常城镇地图 — 时段管理器
 *
 * 管理「上午/下午/晚上」时段切换和推进。
 */

import type { TimeSlot } from '../../../models/dailyTown/regionNode';

export const TIME_SLOT_ORDER: TimeSlot[] = ['上午', '下午', '晚上'];

export interface TimeOfDayState {
  currentTimeSlot: TimeSlot;
  day: number;
  movesInCurrentSlot: number;
  movesPerSlot: number;
}

export class TimeOfDayManager {
  private state: TimeOfDayState;

  constructor(movesPerSlot: number = 2, startDay: number = 1) {
    this.state = {
      currentTimeSlot: '上午',
      day: startDay,
      movesInCurrentSlot: 0,
      movesPerSlot,
    };
  }

  get currentTimeSlot(): TimeSlot {
    return this.state.currentTimeSlot;
  }

  get day(): number {
    return this.state.day;
  }

  get movesInCurrentSlot(): number {
    return this.state.movesInCurrentSlot;
  }

  get movesPerSlot(): number {
    return this.state.movesPerSlot;
  }

  get movesRemaining(): number {
    return Math.max(0, this.state.movesPerSlot - this.state.movesInCurrentSlot);
  }

  getState(): TimeOfDayState {
    return { ...this.state };
  }

  recordMove(): TimeSlot | null {
    const newMoves = this.state.movesInCurrentSlot + 1;

    if (newMoves >= this.state.movesPerSlot) {
      const currentIndex = TIME_SLOT_ORDER.indexOf(this.state.currentTimeSlot);
      const nextIndex = (currentIndex + 1) % TIME_SLOT_ORDER.length;
      const nextSlot = TIME_SLOT_ORDER[nextIndex];

      if (nextIndex === 0) {
        this.state = {
          ...this.state,
          currentTimeSlot: nextSlot,
          day: this.state.day + 1,
          movesInCurrentSlot: 0,
        };
      } else {
        this.state = {
          ...this.state,
          currentTimeSlot: nextSlot,
          movesInCurrentSlot: 0,
        };
      }

      return nextSlot;
    }

    this.state = {
      ...this.state,
      movesInCurrentSlot: newMoves,
    };

    return null;
  }

  setMovesPerSlot(moves: number): void {
    this.state = {
      ...this.state,
      movesPerSlot: moves,
      movesInCurrentSlot: Math.min(this.state.movesInCurrentSlot, moves),
    };
  }

  forceAdvanceTo(slot: TimeSlot): void {
    this.state = {
      ...this.state,
      currentTimeSlot: slot,
      movesInCurrentSlot: 0,
    };
  }

  reset(day?: number): void {
    this.state = {
      currentTimeSlot: '上午',
      day: day ?? this.state.day + 1,
      movesInCurrentSlot: 0,
      movesPerSlot: this.state.movesPerSlot,
    };
  }
}

export function createTimeOfDayManager(movesPerSlot?: number): TimeOfDayManager {
  return new TimeOfDayManager(movesPerSlot);
}
