/**
 * SLG + AI 混合架构 — 网约车行程调度器
 *
 * 基于时间/地点自动触发行程，替代纯 AI 驱动的行程判定。
 */

export type TripStatus = 'idle' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface TripConfig {
  id: string;
  passengerId: string;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledTime: number;
  nsfwType: string;
  relationshipTrack: '纯爱' | '暧昧' | '肉体' | '支配' | '交易';
  priority: 'low' | 'normal' | 'urgent';
}

export interface ScheduledTrip extends TripConfig {
  status: TripStatus;
  createdAt: number;
  actualStartTime?: number;
  actualEndTime?: number;
}

export interface TripTriggerRule {
  condition: (context: TripTriggerContext) => boolean;
  nsfwType: string;
  priority: 'low' | 'normal' | 'urgent';
  minHour: number;
  maxHour: number;
}

export interface TripTriggerContext {
  currentHour: number;
  currentLocation: string;
  passengerHistory: number;
  driverRating: number;
  isLateNight: boolean;
}

export class TripScheduler {
  private _trips: ScheduledTrip[] = [];
  private _rules: TripTriggerRule[] = [];
  private _maxTrips = 50;

  scheduleTrip(config: TripConfig): ScheduledTrip {
    if (this._trips.length >= this._maxTrips) {
      throw new Error('行程队列已满');
    }

    const trip: ScheduledTrip = {
      ...config,
      status: 'waiting',
      createdAt: Date.now(),
    };
    this._trips.push(trip);
    return trip;
  }

  registerTrigger(rule: TripTriggerRule): void {
    this._rules.push(rule);
  }

  checkTriggers(context: TripTriggerContext): ScheduledTrip[] {
    const triggered: ScheduledTrip[] = [];

    for (const rule of this._rules) {
      if (context.currentHour < rule.minHour || context.currentHour > rule.maxHour) {
        continue;
      }

      if (rule.condition(context)) {
        const trip = this.scheduleTrip({
          id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          passengerId: 'auto-generated',
          passengerName: '自动匹配',
          pickupLocation: context.currentLocation,
          dropoffLocation: '未知',
          scheduledTime: Date.now(),
          nsfwType: rule.nsfwType,
          relationshipTrack: '暧昧',
          priority: rule.priority,
        });
        triggered.push(trip);
      }
    }

    return triggered;
  }

  startTrip(tripId: string): ScheduledTrip | null {
    const trip = this._trips.find((t) => t.id === tripId);
    if (!trip || trip.status !== 'waiting') return null;

    trip.status = 'in_progress';
    trip.actualStartTime = Date.now();
    return trip;
  }

  completeTrip(tripId: string): ScheduledTrip | null {
    const trip = this._trips.find((t) => t.id === tripId);
    if (!trip || trip.status !== 'in_progress') return null;

    trip.status = 'completed';
    trip.actualEndTime = Date.now();
    return trip;
  }

  cancelTrip(tripId: string): boolean {
    const trip = this._trips.find((t) => t.id === tripId);
    if (!trip || trip.status !== 'waiting') return false;

    trip.status = 'cancelled';
    return true;
  }

  getPendingTrips(): ScheduledTrip[] {
    return this._trips.filter((t) => t.status === 'waiting');
  }

  getActiveTrip(): ScheduledTrip | undefined {
    return this._trips.find((t) => t.status === 'in_progress');
  }

  getRecentTrips(limit: number = 10): ScheduledTrip[] {
    return this._trips.slice(-limit);
  }

  getTripCountByStatus(status: TripStatus): number {
    return this._trips.filter((t) => t.status === status).length;
  }

  clearCompleted(): void {
    this._trips = this._trips.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  }
}

export function createTripScheduler(): TripScheduler {
  return new TripScheduler();
}
