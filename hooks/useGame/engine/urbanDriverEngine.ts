/**
 * SLG + AI 混合架构 — Urban Driver 引擎
 *
 * 封装现有 urbanDriverNSFWEngine 函数，整合行程调度、乘客状态机、后果链。
 * 继承 BaseEngine，实现 SLGEngine 接口。
 */

import { BaseEngine } from './baseEngine';
import type {
  PlayerAction,
  ActionResult,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  GameEvent,
} from './types';
import { TripScheduler } from '../urbanDriver/tripScheduler';
import type { TripTriggerContext } from '../urbanDriver/tripScheduler';
import { PassengerStateMachine } from '../urbanDriver/passengerStateMachine';
import type { PassengerState } from '../urbanDriver/passengerStateMachine';
import { ConsequenceChain } from '../urbanDriver/consequenceChain';
import type { ConsequenceEvent, ChainContext, ConsequenceType, Severity } from '../urbanDriver/consequenceChain';

export interface UrbanDriverEngineState {
  currentTripId: string | null;
  tension: number;
  totalTrips: number;
  platformRating: number;
  recordingActive: boolean;
  drugInvolved: boolean;
}

export type UrbanDriverActionType =
  | 'START_TRIP'
  | 'COMPLETE_TRIP'
  | 'CANCEL_TRIP'
  | 'ACCEPT_PASSENGER'
  | 'TOGGLE_RECORDING'
  | 'APPLY_INTOXICATION'
  | 'APPLY_DRUG'
  | 'RESOLVE_CONSEQUENCE';

export class UrbanDriverEngine extends BaseEngine {
  private _scheduler: TripScheduler;
  private _passenger: PassengerStateMachine;
  private _consequences: ConsequenceChain;
  private _state: UrbanDriverEngineState;

  constructor() {
    super('urbanDriver');
    this._scheduler = new TripScheduler();
    this._passenger = new PassengerStateMachine();
    this._consequences = new ConsequenceChain();
    this._state = {
      currentTripId: null,
      tension: 0,
      totalTrips: 0,
      platformRating: 100,
      recordingActive: false,
      drugInvolved: false,
    };
  }

  advanceTurn(): TurnResult {
    const events: GameEvent[] = [];
    const stateChanges: Array<{ key: string; before: unknown; after: unknown }> = [];

    if (!this._paused) {
      const decayResult = this._passenger.decayTurn();
      if (decayResult.changes.length > 0) {
        events.push({
          id: `driver-decay-${Date.now()}`,
          engineType: 'urbanDriver',
          type: 'STATE_DECAY',
          description: decayResult.changes.join(', '),
          status: 'resolved',
          payload: { changes: decayResult.changes },
          createdAt: Date.now(),
          resolvedAt: Date.now(),
        });
      }

      const chainContext = this._buildChainContext();
      const newChains = this._consequences.processPendingChains(chainContext);
      for (const chain of newChains) {
        events.push({
          id: `driver-chain-${chain.id}`,
          engineType: 'urbanDriver',
          type: 'CONSEQUENCE_CHAIN',
          description: chain.description,
          status: 'resolved',
          payload: { type: chain.type, severity: chain.severity },
          createdAt: Date.now(),
          resolvedAt: Date.now(),
        });
      }

      const hour = new Date().getHours();
      const triggerContext: TripTriggerContext = {
        currentHour: hour,
        currentLocation: '城市主干道',
        passengerHistory: this._state.totalTrips,
        driverRating: this._state.platformRating,
        isLateNight: hour >= 22 || hour < 5,
      };

      const triggeredTrips = this._scheduler.checkTriggers(triggerContext);
      for (const trip of triggeredTrips) {
        events.push({
          id: `driver-trip-trigger-${trip.id}`,
          engineType: 'urbanDriver',
          type: 'TRIP_TRIGGERED',
          description: `新行程触发: ${trip.passengerName} → ${trip.pickupLocation}`,
          status: 'resolved',
          payload: { tripId: trip.id },
          createdAt: Date.now(),
          resolvedAt: Date.now(),
        });
      }
    }

    return {
      turnNumber: 0,
      phase: 'resolution',
      eventsTriggered: events,
      stateChanges,
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    const actionType = action.type as UrbanDriverActionType;
    let narrativeConstraint = '';
    let keyStep = false;
    const sideEffects: Array<{ type: string; payload: Record<string, unknown> }> = [];

    switch (actionType) {
      case 'START_TRIP': {
        const tripId = action.payload.tripId as string;
        const trip = this._scheduler.startTrip(tripId);
        if (!trip) {
          return { success: false, stateUpdates: {}, narrativeConstraint: '行程不存在或已开始', keyStep: false, sideEffects: [] };
        }
        this._state.currentTripId = tripId;
        this._state.totalTrips++;
        narrativeConstraint = `<行程开始>乘客: ${trip.passengerName} | 地点: ${trip.pickupLocation} → ${trip.dropoffLocation} | NSFW类型: ${trip.nsfwType}</行程开始>`;
        break;
      }

      case 'COMPLETE_TRIP': {
        const trip = this._scheduler.completeTrip(this._state.currentTripId ?? '');
        if (!trip) {
          return { success: false, stateUpdates: {}, narrativeConstraint: '当前无进行中的行程', keyStep: false, sideEffects: [] };
        }
        this._state.currentTripId = null;
        narrativeConstraint = `<行程结束>完成 ${trip.passengerName} 的行程</行程结束>`;
        break;
      }

      case 'CANCEL_TRIP': {
        const tripId = action.payload.tripId as string;
        const cancelled = this._scheduler.cancelTrip(tripId);
        if (!cancelled) {
          return { success: false, stateUpdates: {}, narrativeConstraint: '行程无法取消', keyStep: false, sideEffects: [] };
        }
        narrativeConstraint = `<行程取消>行程 ${tripId} 已取消</行程取消>`;
        break;
      }

      case 'ACCEPT_PASSENGER': {
        const passengerId = action.payload.passengerId as string;
        const track = action.payload.relationshipTrack as string;
        this._passenger.setRelationshipTrack(track as PassengerState['relationshipTrack']);
        sideEffects.push({ type: 'passenger_accepted', payload: { passengerId, track } });
        narrativeConstraint = `<乘客上车>${passengerId} 接受了你的乘车请求</乘客上车>`;
        break;
      }

      case 'TOGGLE_RECORDING': {
        this._state.recordingActive = !this._state.recordingActive;
        narrativeConstraint = `<行车记录仪>${this._state.recordingActive ? '开始录制' : '停止录制'}</行车记录仪>`;
        keyStep = this._state.recordingActive;
        break;
      }

      case 'APPLY_INTOXICATION': {
        const amount = action.payload.amount as '少量' | '中量' | '大量';
        this._passenger.applyIntoxication(amount);
        narrativeConstraint = `<醉酒状态>乘客饮酒量: ${amount}</醉酒状态>`;
        break;
      }

      case 'APPLY_DRUG': {
        const type = action.payload.drugType as '迷药' | '安眠药' | '兴奋剂' | '未知';
        const potency = (action.payload.potency as number) ?? 50;
        this._passenger.applyDrug(type, potency);
        this._state.drugInvolved = true;
        narrativeConstraint = `<药物状态>药物类型: ${type} | 强度: ${potency}</药物状态>`;
        keyStep = true;

        this._consequences.trigger(
          '药物后遗症',
          '中等',
          `乘客使用了${type}，药效强度 ${potency}`,
          this._buildChainContext(),
        );
        break;
      }

      case 'RESOLVE_CONSEQUENCE': {
        const eventId = action.payload.eventId as string;
        const resolved = this._consequences.resolveEvent(eventId);
        if (!resolved) {
          return { success: false, stateUpdates: {}, narrativeConstraint: '后果事件不存在', keyStep: false, sideEffects: [] };
        }
        narrativeConstraint = `<后果处理>已处理后果事件 ${eventId}</后果处理>`;
        break;
      }

      default:
        return { success: false, stateUpdates: {}, narrativeConstraint: '未知操作', keyStep: false, sideEffects: [] };
    }

    return {
      success: true,
      stateUpdates: {
        currentTripId: this._state.currentTripId,
        tension: this._state.tension,
        totalTrips: this._state.totalTrips,
      },
      narrativeConstraint,
      keyStep,
      sideEffects,
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    const actionType = action.type as UrbanDriverActionType;
    switch (actionType) {
      case 'START_TRIP':
        return typeof action.payload.tripId === 'string' && this._scheduler.getPendingTrips().length > 0;
      case 'COMPLETE_TRIP':
        return this._state.currentTripId !== null;
      case 'CANCEL_TRIP':
        return typeof action.payload.tripId === 'string';
      case 'ACCEPT_PASSENGER':
        return typeof action.payload.passengerId === 'string';
      case 'TOGGLE_RECORDING':
        return true;
      case 'APPLY_INTOXICATION':
        return ['少量', '中量', '大量'].includes(action.payload.amount as string);
      case 'APPLY_DRUG':
        return typeof action.payload.drugType === 'string';
      case 'RESOLVE_CONSEQUENCE':
        return typeof action.payload.eventId === 'string';
      default:
        return false;
    }
  }

  getSnapshot(): GameStateSnapshot {
    const passengerState = this._passenger.getState();
    return {
      turnNumber: 0,
      timestamp: Date.now(),
      engineStates: {
        urbanDriver: {
          currentTripId: this._state.currentTripId,
          tension: this._state.tension,
          totalTrips: this._state.totalTrips,
          platformRating: this._state.platformRating,
          recordingActive: this._state.recordingActive,
          drugInvolved: this._state.drugInvolved,
          passengerDesireStage: passengerState.desireStage,
          passengerIntoxication: passengerState.intoxication,
          activeConsequences: this._consequences.getActiveEvents().length,
          pendingTrips: this._scheduler.getPendingTrips().length,
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const passengerState = this._passenger.getState();
    const activeTrip = this._scheduler.getActiveTrip();

    return {
      scene: activeTrip ? `网约车-${activeTrip.nsfwType}` : '网约车',
      turn: this._state.totalTrips,
      tension: this._state.tension,
      playerAction: activeTrip ? `载客中: ${activeTrip.passengerName}` : '待命中',
      keyStep: this._state.recordingActive || this._state.drugInvolved,
      nsfwTriggered: passengerState.desireStage !== '克制',
      participants: [
        {
          id: 'passenger',
          name: activeTrip?.passengerName ?? '无',
          status: passengerState.intoxication,
          desireStage: passengerState.desireStage,
        },
      ],
      nextEvent: this._consequences.getPendingChainCount() > 0 ? '后果链触发' : '正常行程',
    };
  }

  // ==================== Urban-Driver-Specific Methods ====================

  getScheduler(): TripScheduler {
    return this._scheduler;
  }

  getPassengerState(): Readonly<PassengerState> {
    return this._passenger.getState();
  }

  getActiveConsequences(): ConsequenceEvent[] {
    return this._consequences.getActiveEvents();
  }

  triggerConsequence(type: ConsequenceType, severity: Severity, description: string): ConsequenceEvent {
    return this._consequences.trigger(type, severity, description, this._buildChainContext());
  }

  setTension(value: number): void {
    this._state.tension = Math.min(100, Math.max(0, value));
  }

  private _buildChainContext(): ChainContext {
    return {
      totalConsequences: this._consequences.getActiveEvents().length,
      platformRating: this._state.platformRating,
      activeTrips: this._scheduler.getPendingTrips().length,
      drugInvolved: this._state.drugInvolved,
      recordingActive: this._state.recordingActive,
    };
  }
}

export function createUrbanDriverEngine(): UrbanDriverEngine {
  return new UrbanDriverEngine();
}
