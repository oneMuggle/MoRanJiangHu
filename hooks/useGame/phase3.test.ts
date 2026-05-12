/**
 * Phase 3 组件测试
 *
 * 覆盖 MessageQueue、MessageScheduler、PhoneEngine、NotificationEngine、SocialGraph
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageQueue } from './device/messageQueue';
import { MessageScheduler } from './device/messageScheduler';
import { PhoneEngine, createPhoneEngine } from './engine/phoneEngine';
import { NotificationEngine, createNotificationEngine } from './engine/notificationEngine';
import { SocialGraph, createSocialGraph } from './device/socialGraph';
import type { DisplayMessage } from './device/messageQueue';
import type { NPCTriggerRule, NPCProfile } from './device/messageScheduler';

// ==================== MessageQueue ====================

describe('MessageQueue', () => {
  let queue: MessageQueue;

  beforeEach(() => {
    queue = new MessageQueue();
  });

  it('应返回空队列', () => {
    expect(queue.size()).toBe(0);
    expect(queue.dequeue()).toEqual([]);
  });

  it('应入队消息', () => {
    queue.enqueue({
      id: 'msg-1', senderId: 'npc-a', senderName: 'A', appId: 'sms',
      content: 'Hello', scheduledTime: Date.now() - 1000, priority: 'normal',
      trigger: 'test', createdAt: Date.now(),
    });
    expect(queue.size()).toBe(1);
  });

  it('应按优先级出队', () => {
    const now = Date.now();
    queue.enqueue({
      id: 'low', senderId: 'a', senderName: 'A', appId: 'sms', content: 'low',
      scheduledTime: now, priority: 'low', trigger: 'test', createdAt: now,
    });
    queue.enqueue({
      id: 'urgent', senderId: 'b', senderName: 'B', appId: 'sms', content: 'urgent',
      scheduledTime: now, priority: 'urgent', trigger: 'test', createdAt: now,
    });
    queue.enqueue({
      id: 'normal', senderId: 'c', senderName: 'C', appId: 'sms', content: 'normal',
      scheduledTime: now, priority: 'normal', trigger: 'test', createdAt: now,
    });

    const result = queue.dequeue(3);
    expect(result.map((m: DisplayMessage) => m.id)).toEqual(['urgent', 'normal', 'low']);
  });

  it('应只返回已到时间的消息', () => {
    const now = Date.now();
    queue.enqueue({
      id: 'due', senderId: 'a', senderName: 'A', appId: 'sms', content: 'due',
      scheduledTime: now - 1000, priority: 'normal', trigger: 'test', createdAt: now,
    });
    queue.enqueue({
      id: 'future', senderId: 'b', senderName: 'B', appId: 'sms', content: 'future',
      scheduledTime: now + 60000, priority: 'urgent', trigger: 'test', createdAt: now,
    });

    const result = queue.dequeue(2);
    expect(result.map((m: DisplayMessage) => m.id)).toEqual(['due']);
  });

  it('应支持按 ID 删除', () => {
    const now = Date.now();
    queue.enqueue({
      id: 'to-remove', senderId: 'a', senderName: 'A', appId: 'sms', content: 'x',
      scheduledTime: now, priority: 'normal', trigger: 'test', createdAt: now,
    });
    expect(queue.removeById('to-remove')).toBe(true);
    expect(queue.size()).toBe(0);
    expect(queue.removeById('nonexistent')).toBe(false);
  });

  it('应支持清空', () => {
    const now = Date.now();
    queue.enqueue({
      id: 'msg', senderId: 'a', senderName: 'A', appId: 'sms', content: 'x',
      scheduledTime: now, priority: 'normal', trigger: 'test', createdAt: now,
    });
    queue.clear();
    expect(queue.size()).toBe(0);
  });
});

// ==================== MessageScheduler ====================

describe('MessageScheduler', () => {
  let scheduler: MessageScheduler;

  beforeEach(() => {
    scheduler = new MessageScheduler({ npcCheckIntervalMs: 0 });
  });

  it('应调度消息', () => {
    scheduler.scheduleMessage({
      id: 'msg-1', senderId: 'npc-a', senderName: 'A', appId: 'sms',
      content: 'Test', scheduledTime: Date.now(), priority: 'normal', trigger: 'test',
    });
    expect(scheduler.getPendingCount()).toBe(1);
  });

  it('应在队列满时拒绝', () => {
    const small = new MessageScheduler({ maxQueueSize: 1, npcCheckIntervalMs: 0 });
    small.scheduleMessage({
      id: 'msg-1', senderId: 'a', senderName: 'A', appId: 'sms',
      content: 'x', scheduledTime: Date.now(), priority: 'normal', trigger: 'test',
    });
    small.scheduleMessage({
      id: 'msg-2', senderId: 'b', senderName: 'B', appId: 'sms',
      content: 'y', scheduledTime: Date.now(), priority: 'normal', trigger: 'test',
    });
    expect(small.getPendingCount()).toBe(1);
  });

  it('应处理队列', () => {
    scheduler.scheduleMessage({
      id: 'msg-1', senderId: 'a', senderName: 'A', appId: 'sms',
      content: 'Hello', scheduledTime: Date.now() - 1000, priority: 'normal', trigger: 'test',
    });
    const delivered = scheduler.processQueue();
    expect(delivered.length).toBe(1);
    expect(delivered[0].content).toBe('Hello');
  });

  it('应注册和触发 NPC', () => {
    scheduler.registerNPC({ id: 'npc-1', name: 'Alice', relationship: 50, intimacyLevel: '友好', lastMessageTime: Date.now() - 120000 });
    scheduler.registerTrigger({
      condition: ((npc: NPCProfile, elapsed: number) => npc.relationship > 30 && elapsed > 60000) as NPCTriggerRule['condition'],
      priority: 'normal',
      appId: 'sms',
      delayMs: 0,
    });

    const triggered = scheduler.checkNPCTriggers();
    expect(triggered.length).toBeGreaterThan(0);
  });

  it('应在检查间隔内不触发', () => {
    const bounded = new MessageScheduler({ npcCheckIntervalMs: 60000 });
    bounded.registerNPC({ id: 'npc-1', name: 'Bob', relationship: 80, intimacyLevel: '亲密' });
    const triggered = bounded.checkNPCTriggers();
    expect(triggered.length).toBe(0);
  });

  it('应支持配置更新', () => {
    scheduler.updateConfig({ maxQueueSize: 50 });
    expect(scheduler.getConfig().maxQueueSize).toBe(50);
  });
});

// ==================== PhoneEngine ====================

describe('PhoneEngine', () => {
  let engine: PhoneEngine;

  beforeEach(() => {
    engine = createPhoneEngine();
  });

  it('应正确初始化', () => {
    const snapshot = engine.getSnapshot();
    expect(snapshot.engineStates.phoneSim.activeAppId).toBeNull();
    expect(snapshot.engineStates.phoneSim.unreadCount).toBe(0);
  });

  it('应安装应用', () => {
    const action = {
      id: 'act-1', engineType: 'phoneSim' as const, type: 'INSTALL_APP',
      payload: { appId: 'forum' }, timestamp: Date.now(),
    };
    const result = engine.executePlayerAction(action);
    expect(result.success).toBe(true);
    expect(result.keyStep).toBe(true);
    expect(Array.from(engine.getInstalledApps())).toContain('forum');
  });

  it('应打开已安装的应用', () => {
    engine.executePlayerAction({
      id: 'act-1', engineType: 'phoneSim' as const, type: 'INSTALL_APP',
      payload: { appId: 'forum' }, timestamp: Date.now(),
    });
    const result = engine.executePlayerAction({
      id: 'act-2', engineType: 'phoneSim' as const, type: 'OPEN_APP',
      payload: { appId: 'forum' }, timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(engine.getActiveAppId()).toBe('forum');
  });

  it('应拒绝打开未安装的应用', () => {
    const result = engine.executePlayerAction({
      id: 'act-1', engineType: 'phoneSim' as const, type: 'OPEN_APP',
      payload: { appId: 'nonexistent' }, timestamp: Date.now(),
    });
    expect(result.success).toBe(false);
  });

  it('应发送消息', () => {
    const result = engine.executePlayerAction({
      id: 'act-1', engineType: 'phoneSim' as const, type: 'SEND_MESSAGE',
      payload: { targetId: 'npc-1', content: 'Hello there!' }, timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(result.narrativeConstraint).toContain('发送消息');
  });

  it('应拒绝卸载系统应用', () => {
    const result = engine.executePlayerAction({
      id: 'act-1', engineType: 'phoneSim' as const, type: 'UNINSTALL_APP',
      payload: { appId: 'sms' }, timestamp: Date.now(),
    });
    expect(result.success).toBe(false);
  });

  it('应卸载非系统应用', () => {
    engine.executePlayerAction({
      id: 'act-1', engineType: 'phoneSim' as const, type: 'INSTALL_APP',
      payload: { appId: 'forum' }, timestamp: Date.now(),
    });
    const result = engine.executePlayerAction({
      id: 'act-2', engineType: 'phoneSim' as const, type: 'UNINSTALL_APP',
      payload: { appId: 'forum' }, timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
    expect(Array.from(engine.getInstalledApps())).not.toContain('forum');
  });

  it('canExecuteAction 应正确验证', () => {
    expect(engine.canExecuteAction({
      id: 'act', engineType: 'phoneSim' as const, type: 'OPEN_APP',
      payload: { appId: 'sms' }, timestamp: Date.now(),
    })).toBe(true);

    expect(engine.canExecuteAction({
      id: 'act', engineType: 'phoneSim' as const, type: 'OPEN_APP',
      payload: { appId: 'nonexistent' }, timestamp: Date.now(),
    })).toBe(false);
  });

  it('advanceTurn 应在有消息时生成事件', () => {
    engine.scheduleMessage({
      id: 'msg-1', senderId: 'a', senderName: 'A', appId: 'sms',
      content: 'Hi', scheduledTime: Date.now() - 1000, priority: 'normal', trigger: 'test',
    });
    const result = engine.advanceTurn();
    expect(result.eventsTriggered.length).toBeGreaterThan(0);
  });

  it('getNarrativeConstraints 应返回约束', () => {
    const constraints = engine.getNarrativeConstraints();
    expect(constraints.scene).toBe('手机');
  });

  it('推送和清除通知', () => {
    engine.pushNotification({
      appId: 'sms', category: 'message', tone: 'info',
      title: 'New Message', body: 'You have a new message',
    });
    expect(engine.getUnreadNotificationCount()).toBe(1);

    const notifs = engine.getNotifications();
    engine.dismissNotification(notifs[0].id);
    expect(engine.getUnreadNotificationCount()).toBe(0);
  });
});

// ==================== NotificationEngine ====================

describe('NotificationEngine', () => {
  let engine: NotificationEngine;

  beforeEach(() => {
    engine = createNotificationEngine();
  });

  it('应推送通知', () => {
    const notif = engine.push({
      appId: 'sms', category: 'message', tone: 'info',
      title: 'Test', body: 'Body',
    });
    expect(notif.id).toBeDefined();
    expect(notif.read).toBe(false);
  });

  it('应标记已读', () => {
    const notif = engine.push({
      appId: 'sms', category: 'message', tone: 'info',
      title: 'Test', body: 'Body',
    });
    expect(engine.markAsRead(notif.id)).toBe(true);
    expect(engine.getUnreadCount()).toBe(0);
  });

  it('应清除通知', () => {
    engine.push({
      appId: 'sms', category: 'message', tone: 'info',
      title: 'Test', body: 'Body',
    });
    const all = engine.getAll();
    engine.dismiss(all[0].id);
    expect(engine.getAll().length).toBe(0);
  });

  it('应按 App 分组', () => {
    engine.push({ appId: 'sms', category: 'message', tone: 'info', title: 'A', body: 'B' });
    engine.push({ appId: 'sms', category: 'message', tone: 'info', title: 'C', body: 'D' });
    engine.push({ appId: 'forum', category: 'social', tone: 'info', title: 'E', body: 'F' });

    const groups = engine.getGroupedByApp();
    expect(groups.length).toBe(2);
    const smsGroup = groups.find((g) => g.appId === 'sms');
    expect(smsGroup).toBeDefined();
    expect(smsGroup!.count).toBe(2);
  });

  it('应按分类筛选', () => {
    engine.push({ appId: 'sms', category: 'urgent', tone: 'warning', title: 'Urgent', body: '!' });
    engine.push({ appId: 'sms', category: 'message', tone: 'info', title: 'Normal', body: '.' });

    const urgent = engine.getUrgent();
    expect(urgent.length).toBe(1);
    expect(urgent[0].title).toBe('Urgent');
  });

  it('应标记全部已读', () => {
    engine.push({ appId: 'a', category: 'message', tone: 'info', title: '1', body: 'x' });
    engine.push({ appId: 'b', category: 'message', tone: 'info', title: '2', body: 'x' });
    engine.markAllAsRead();
    expect(engine.getUnreadCount()).toBe(0);
  });

  it('应按 App 删除', () => {
    engine.push({ appId: 'sms', category: 'message', tone: 'info', title: '1', body: 'x' });
    engine.push({ appId: 'forum', category: 'social', tone: 'info', title: '2', body: 'x' });
    engine.push({ appId: 'sms', category: 'message', tone: 'info', title: '3', body: 'x' });

    const removed = engine.dismissByAppId('sms');
    expect(removed).toBe(2);
    expect(engine.getAll().length).toBe(1);
  });

  it('应支持修改最大历史', () => {
    engine.setMaxHistory(10);
    expect(engine.getMaxHistory()).toBe(10);
  });
});

// ==================== SocialGraph ====================

describe('SocialGraph', () => {
  let graph: SocialGraph;

  beforeEach(() => {
    graph = createSocialGraph();
  });

  it('应注册 NPC', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    expect(graph.getNPCs()).toContain('alice');
    expect(graph.getNPCs()).toContain('bob');
  });

  it('应设置关系', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    graph.setBond('alice', 'bob', 'friend', 60);

    const bond = graph.getBond('alice', 'bob');
    expect(bond).toBeDefined();
    expect(bond!.type).toBe('friend');
    expect(bond!.strength).toBe(60);
  });

  it('应删除 NPC 及其关系', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    graph.setBond('alice', 'bob', 'friend', 60);
    graph.removeNPC('alice');

    expect(graph.getBond('alice', 'bob')).toBeUndefined();
    expect(graph.getNPCs()).not.toContain('alice');
  });

  it('应模拟互动生成事件', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    graph.setBond('alice', 'bob', 'lover', 80);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const events = graph.simulateInteractions();
    vi.restoreAllMocks();

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].initiatorId).toBe('alice');
    expect(events[0].targetId).toBe('bob');
  });

  it('应获取最近事件', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    graph.setBond('alice', 'bob', 'friend', 50);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    graph.simulateInteractions();
    vi.restoreAllMocks();

    const recent = graph.getRecentEvents(5);
    expect(recent.length).toBeGreaterThan(0);
  });

  it('应获取互动频率', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    graph.setBond('alice', 'bob', 'friend', 80);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    graph.simulateInteractions();
    graph.simulateInteractions();
    vi.restoreAllMocks();

    const freq = graph.getInteractionFrequency('alice');
    expect(freq.get('bob')).toBeGreaterThan(0);
  });

  it('应清空事件', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    graph.setBond('alice', 'bob', 'friend', 80);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    graph.simulateInteractions();
    vi.restoreAllMocks();

    graph.clearEvents();
    expect(graph.getRecentEvents()).toEqual([]);
  });

  it('应获取 NPC 的关系', () => {
    graph.addNPC('alice');
    graph.addNPC('bob');
    graph.addNPC('charlie');
    graph.setBond('alice', 'bob', 'friend', 50);
    graph.setBond('alice', 'charlie', 'rival', 30);

    const bonds = graph.getBondsForNPC('alice');
    expect(bonds.length).toBe(2);
  });
});
