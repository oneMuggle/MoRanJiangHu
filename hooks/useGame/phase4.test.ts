/**
 * Phase 4 组件测试
 *
 * 覆盖 TripScheduler、PassengerStateMachine、ConsequenceChain、UrbanDriverEngine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TripScheduler, createTripScheduler } from './urbanDriver/tripScheduler';
import { PassengerStateMachine, createPassengerStateMachine } from './urbanDriver/passengerStateMachine';
import { ConsequenceChain, createConsequenceChain } from './urbanDriver/consequenceChain';
import { UrbanDriverEngine, createUrbanDriverEngine } from './engine/urbanDriverEngine';
import type { TripTriggerContext } from './urbanDriver/tripScheduler';

// ==================== TripScheduler ====================

describe('TripScheduler', () => {
  let scheduler: TripScheduler;

  beforeEach(() => {
    scheduler = createTripScheduler();
  });

  it('应注册行程', () => {
    const trip = scheduler.scheduleTrip({
      id: 'trip-1', passengerId: 'p1', passengerName: 'Alice',
      pickupLocation: '酒吧街', dropoffLocation: '酒店区',
      scheduledTime: Date.now(), nsfwType: '醉酒搭车',
      relationshipTrack: '暧昧', priority: 'normal',
    });
    expect(trip.status).toBe('waiting');
    expect(scheduler.getPendingTrips().length).toBe(1);
  });

  it('应启动行程', () => {
    scheduler.scheduleTrip({
      id: 'trip-1', passengerId: 'p1', passengerName: 'Alice',
      pickupLocation: '酒吧街', dropoffLocation: '酒店区',
      scheduledTime: Date.now(), nsfwType: '醉酒搭车',
      relationshipTrack: '暧昧', priority: 'normal',
    });
    const started = scheduler.startTrip('trip-1');
    expect(started).not.toBeNull();
    expect(started!.status).toBe('in_progress');
    expect(scheduler.getActiveTrip()).toBeDefined();
  });

  it('应完成行程', () => {
    scheduler.scheduleTrip({
      id: 'trip-1', passengerId: 'p1', passengerName: 'Alice',
      pickupLocation: '酒吧街', dropoffLocation: '酒店区',
      scheduledTime: Date.now(), nsfwType: '醉酒搭车',
      relationshipTrack: '暧昧', priority: 'normal',
    });
    scheduler.startTrip('trip-1');
    const completed = scheduler.completeTrip('trip-1');
    expect(completed).not.toBeNull();
    expect(completed!.status).toBe('completed');
    expect(completed!.actualEndTime).toBeDefined();
  });

  it('应取消行程', () => {
    scheduler.scheduleTrip({
      id: 'trip-1', passengerId: 'p1', passengerName: 'Alice',
      pickupLocation: '酒吧街', dropoffLocation: '酒店区',
      scheduledTime: Date.now(), nsfwType: '醉酒搭车',
      relationshipTrack: '暧昧', priority: 'normal',
    });
    expect(scheduler.cancelTrip('trip-1')).toBe(true);
    expect(scheduler.getTripCountByStatus('cancelled')).toBe(1);
  });

  it('应清理已完成行程', () => {
    scheduler.scheduleTrip({
      id: 'trip-1', passengerId: 'p1', passengerName: 'Alice',
      pickupLocation: '酒吧街', dropoffLocation: '酒店区',
      scheduledTime: Date.now(), nsfwType: '醉酒搭车',
      relationshipTrack: '暧昧', priority: 'normal',
    });
    scheduler.startTrip('trip-1');
    scheduler.completeTrip('trip-1');
    scheduler.clearCompleted();
    expect(scheduler.getPendingTrips().length).toBe(0);
  });

  it('应通过触发器创建行程', () => {
    scheduler.registerTrigger({
      condition: ((ctx: TripTriggerContext) => ctx.isLateNight) as (ctx: { isLateNight: boolean }) => boolean,
      nsfwType: '深夜独处',
      priority: 'urgent',
      minHour: 22,
      maxHour: 23,
    });

    const triggered = scheduler.checkTriggers({
      currentHour: 23,
      currentLocation: '酒吧街',
      passengerHistory: 0,
      driverRating: 100,
      isLateNight: true,
    });
    expect(triggered.length).toBeGreaterThan(0);
  });
});

// ==================== PassengerStateMachine ====================

describe('PassengerStateMachine', () => {
  let psm: PassengerStateMachine;

  beforeEach(() => {
    psm = createPassengerStateMachine();
  });

  it('应正确初始化', () => {
    const state = psm.getState();
    expect(state.desireStage).toBe('克制');
    expect(state.desireProgress).toBe(0);
    expect(state.intoxication).toBe('清醒');
    expect(state.drugType).toBeNull();
  });

  it('应推进欲望进度', () => {
    psm.advanceDesireProgress(20);
    expect(psm.getState().desireProgress).toBeGreaterThan(0);
  });

  it('应升级欲望阶段', () => {
    psm.advanceDesireProgress(150);
    expect(psm.getState().desireStage).toBe('试探');
    expect(psm.getState().desireProgress).toBe(0);
  });

  it('关系轨道应有不同推进系数', () => {
    psm.setRelationshipTrack('纯爱');
    psm.advanceDesireProgress(10);
    const pureLoveProgress = psm.getState().desireProgress;

    const psm2 = createPassengerStateMachine();
    psm2.setRelationshipTrack('交易');
    psm2.advanceDesireProgress(10);
    const transactionProgress = psm2.getState().desireProgress;

    expect(transactionProgress).toBeGreaterThan(pureLoveProgress);
  });

  it('应衰减醉酒状态', () => {
    psm.applyIntoxication('中量');
    expect(psm.getState().intoxication).toBe('微醺');

    psm.decayTurn();
    expect(psm.getState().intoxicationLevel).toBeLessThan(35);
  });

  it('应衰减药物效果', () => {
    psm.applyDrug('迷药', 80);
    expect(psm.getState().drugType).toBe('迷药');
    expect(psm.getState().drugPotency).toBe(80);

    psm.decayTurn();
    expect(psm.getState().drugPotency).toBeLessThan(80);
    expect(psm.getState().drugClarity).toBeGreaterThan(20);
  });

  it('药物强度归零应清除类型', () => {
    psm.applyDrug('安眠药', 8);
    psm.decayTurn();
    expect(psm.getState().drugType).toBeNull();
  });
});

// ==================== ConsequenceChain ====================

describe('ConsequenceChain', () => {
  let chain: ConsequenceChain;

  beforeEach(() => {
    chain = createConsequenceChain();
  });

  it('应触发后果', () => {
    const event = chain.trigger('平台投诉', '轻微', '乘客投诉司机行为不当', {
      totalConsequences: 1, platformRating: 80, activeTrips: 0,
      drugInvolved: false, recordingActive: false,
    });
    expect(event.type).toBe('平台投诉');
    expect(event.resolved).toBe(false);
  });

  it('应返回活跃事件', () => {
    chain.trigger('差评降权', '轻微', '评分下降', {
      totalConsequences: 0, platformRating: 80, activeTrips: 0,
      drugInvolved: false, recordingActive: false,
    });
    expect(chain.getActiveEvents().length).toBe(1);
  });

  it('应标记已解决', () => {
    const event = chain.trigger('平台投诉', '轻微', '投诉', {
      totalConsequences: 1, platformRating: 80, activeTrips: 0,
      drugInvolved: false, recordingActive: false,
    });
    expect(chain.resolveEvent(event.id)).toBe(true);
    expect(chain.getActiveEvents().length).toBe(0);
  });

  it('应清理已解决事件', () => {
    const event = chain.trigger('差评降权', '轻微', '差评', {
      totalConsequences: 0, platformRating: 80, activeTrips: 0,
      drugInvolved: false, recordingActive: false,
    });
    chain.resolveEvent(event.id);
    chain.clearResolved();
    expect(chain.getActiveEvents().length).toBe(0);
  });

  it('应触发链式反应', () => {
    chain.trigger('网络传播', '严重', '事件在社交媒体发酵', {
      totalConsequences: 1, platformRating: 50, activeTrips: 0,
      drugInvolved: true, recordingActive: false,
    });
    expect(chain.getPendingChainCount()).toBeGreaterThan(0);
  });

  it('应获取事件链根', () => {
    const parent = chain.trigger('勒索威胁', '严重', '被勒索', {
      totalConsequences: 1, platformRating: 50, activeTrips: 0,
      drugInvolved: true, recordingActive: false,
    });

    const root = chain.getEventChainRoot(parent.id);
    expect(root).not.toBeNull();
    expect(root!.id).toBe(parent.id);
  });

  it('应按类型筛选', () => {
    chain.trigger('平台投诉', '轻微', '投诉1', {
      totalConsequences: 1, platformRating: 80, activeTrips: 0,
      drugInvolved: false, recordingActive: false,
    });
    chain.trigger('平台投诉', '中等', '投诉2', {
      totalConsequences: 2, platformRating: 80, activeTrips: 0,
      drugInvolved: false, recordingActive: false,
    });

    const filtered = chain.getEventsByType('平台投诉');
    expect(filtered.length).toBe(2);
  });
});

// ==================== UrbanDriverEngine ====================

describe('UrbanDriverEngine', () => {
  let engine: UrbanDriverEngine;

  beforeEach(() => {
    engine = createUrbanDriverEngine();
  });

  it('应正确初始化', () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.engineStates.urbanDriver.currentTripId).toBeNull();
    expect(snapshot.engineStates.urbanDriver.totalTrips).toBe(0);
    expect(snapshot.engineStates.urbanDriver.platformRating).toBe(100);
  });

  it('应开始并完成行程', () => {
    engine.getScheduler().scheduleTrip({
      id: 'trip-1', passengerId: 'p1', passengerName: 'Alice',
      pickupLocation: '酒吧街', dropoffLocation: '酒店区',
      scheduledTime: Date.now(), nsfwType: '醉酒搭车',
      relationshipTrack: '暧昧', priority: 'normal',
    });

    const start = engine.executePlayerAction({
      id: 'act-1', engineType: 'urbanDriver' as const, type: 'START_TRIP',
      payload: { tripId: 'trip-1' }, timestamp: Date.now(),
    });
    expect(start.success).toBe(true);

    const complete = engine.executePlayerAction({
      id: 'act-2', engineType: 'urbanDriver' as const, type: 'COMPLETE_TRIP',
      payload: {}, timestamp: Date.now(),
    });
    expect(complete.success).toBe(true);
  });

  it('应切换行车记录仪', () => {
    const result = engine.executePlayerAction({
      id: 'act-1', engineType: 'urbanDriver' as const, type: 'TOGGLE_RECORDING',
      payload: {}, timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(result.keyStep).toBe(true);
    expect(result.narrativeConstraint).toContain('开始录制');
  });

  it('应应用醉酒', () => {
    const result = engine.executePlayerAction({
      id: 'act-1', engineType: 'urbanDriver' as const, type: 'APPLY_INTOXICATION',
      payload: { amount: '中量' }, timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(result.narrativeConstraint).toContain('中量');
  });

  it('应应用药物并触发后果链', () => {
    const result = engine.executePlayerAction({
      id: 'act-1', engineType: 'urbanDriver' as const, type: 'APPLY_DRUG',
      payload: { drugType: '迷药', potency: 80 }, timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(result.keyStep).toBe(true);
    expect(engine.getSnapshot().engineStates.urbanDriver.drugInvolved).toBe(true);
  });

  it('advanceTurn 应产生衰减事件', () => {
    engine.executePlayerAction({
      id: 'act-1', engineType: 'urbanDriver' as const, type: 'APPLY_INTOXICATION',
      payload: { amount: '中量' }, timestamp: Date.now(),
    });
    const result = engine.advanceTurn();
    expect(result.eventsTriggered.length).toBeGreaterThan(0);
  });

  it('canExecuteAction 应正确验证', () => {
    expect(engine.canExecuteAction({
      id: 'act', engineType: 'urbanDriver' as const, type: 'TOGGLE_RECORDING',
      payload: {}, timestamp: Date.now(),
    })).toBe(true);

    expect(engine.canExecuteAction({
      id: 'act', engineType: 'urbanDriver' as const, type: 'COMPLETE_TRIP',
      payload: {}, timestamp: Date.now(),
    })).toBe(false);
  });

  it('getNarrativeConstraints 应返回约束', () => {
    const constraints = engine.getNarrativeConstraints();
    expect(constraints.scene).toContain('网约车');
  });
});
