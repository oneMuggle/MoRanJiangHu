/**
 * phase9.test.ts
 *
 * 阶段九：RPG 任务/门派引擎 — 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RpgTaskEngine, createRpgTaskEngine } from '../engine/rpgTaskEngine';
import { RpgSectEngine, createRpgSectEngine } from '../engine/rpgSectEngine';
import {
  checkTaskTransition,
  areAllObjectivesComplete,
  canAcceptTask,
} from '../rpg/task/taskStateMachine';
import {
  distributeRewards,
  parseRewardDescription,
} from '../rpg/task/rewardDistributor';
import {
  addFunds,
  spendFunds,
  addSupplies,
  spendSupplies,
  investConstruction,
  calculateDailyMaintenance,
  type EconomyState,
} from '../rpg/sect/economyManager';
import {
  addContribution,
  spendContribution,
  calculateRank,
  getNextRankInfo,
} from '../rpg/sect/contributionManager';
import {
  initializePosts,
  assignToPost,
  removeFromPost,
  calculatePostOutput,
  type PostAssignment,
  type SectMember,
} from '../rpg/sect/memberDispatcher';
import {
  calculatePriceMultiplier,
  calculateFinalPrice,
  type PriceConfig,
  type SupplyDemand,
} from '../rpg/sect/dynamicPricing';
import type { 角色数据结构 } from '../../../models/character';
import type { 任务结构 } from '../../../models/task';
import type { 详细门派结构 } from '../../../models/sect';

// ==================== Helpers ====================

function makePlayerCharacter(): 角色数据结构 {
  return {
    ID: 'player-1', 名字: '主角',
    力量: 15, 敏捷: 12, 体质: 10, 根骨: 8, 悟性: 10, 福源: 5,
    当前精力: 100, 最大精力: 100, 当前内力: 50, 最大内力: 50,
    当前饱腹: 80, 最大饱腹: 100, 当前口渴: 30, 最大口渴: 100,
    当前生命: 100, 最大生命: 100,
    头部当前血量: 30, 头部最大血量: 30, 头部状态: '正常',
    胸部当前血量: 40, 胸部最大血量: 40, 胸部状态: '正常',
    腹部当前血量: 35, 腹部最大血量: 35, 腹部状态: '正常',
    左手当前血量: 20, 左手最大血量: 20, 左手状态: '正常',
    右手当前血量: 20, 右手最大血量: 20, 右手状态: '正常',
    左腿当前血量: 25, 左腿最大血量: 25, 左腿状态: '正常',
    右腿当前血量: 25, 右腿最大血量: 25, 右腿状态: '正常',
    功法列表: [], 当前经验: 0, 当前等级: 1, 境界: '初学',
    当前坐标X: 0, 当前坐标Y: 0, 当前负重: 0,
  } as unknown as 角色数据结构;
}

function makeTask(title: string, objectives: number = 1): 任务结构 {
  return {
    ID: `task-${title}`, 标题: title, 类型: '主线', 当前状态: '可接取',
    目标列表: Array.from({ length: objectives }, (_, i) => ({
      描述: `目标${i + 1}`, 完成状态: false,
    })),
    奖励描述: ['100银两', '50经验'],
  } as unknown as 任务结构;
}

function makeSectData(): 详细门派结构 {
  return {
    ID: 'sect-huashan', 名称: '华山派', 简介: '五岳剑派之一',
    门派资金: 1000, 门派物资: 500, 建设度: 10,
    玩家贡献: 0, 玩家职位: '杂役弟子', 成员列表: [], 任务列表: [],
  } as unknown as 详细门派结构;
}

// ==================== RpgTaskEngine Tests ====================

describe('RpgTaskEngine', () => {
  let engine: RpgTaskEngine;

  beforeEach(() => { engine = createRpgTaskEngine(); });

  describe('initialization', () => {
    it('starts with empty task list', () => {
      expect(engine.taskList).toHaveLength(0);
      expect(engine.completedTasks).toHaveLength(0);
    });
  });

  describe('acceptTask', () => {
    it('accepts a new task', () => {
      const task = makeTask('护送商队');
      const result = engine.acceptTask(task, '初学');
      expect(result.success).toBe(true);
      expect(engine.taskList).toHaveLength(1);
      expect(result.narrativeConstraint).toContain('护送商队');
    });

    it('rejects duplicate task', () => {
      const task = makeTask('护送商队');
      engine.acceptTask(task, '初学');
      const result = engine.acceptTask(task, '初学');
      expect(result.success).toBe(false);
    });

    it('rejects when realm too low', () => {
      const task = { ...makeTask('高级任务'), 推荐境界: '大成' } as unknown as 任务结构;
      const result = engine.acceptTask(task, '初学');
      expect(result.success).toBe(false);
      expect(result.narrativeConstraint).toContain('推荐境界');
    });
  });

  describe('updateTaskProgress', () => {
    it('updates progress on active task', () => {
      const task = makeTask('护送商队', 2);
      engine.acceptTask(task, '初学');
      const result = engine.updateTaskProgress('护送商队', 0);
      expect(result.success).toBe(true);
      expect(result.narrativeConstraint).toContain('进度更新');
    });

    it('marks task as completeable when all objectives done', () => {
      const task = makeTask('护送商队', 1);
      engine.acceptTask(task, '初学');
      const result = engine.updateTaskProgress('护送商队', 0);
      expect(result.success).toBe(true);
      expect(result.keyStep).toBe(true);
      expect(result.narrativeConstraint).toContain('可提交');
    });

    it('fails when task not found', () => {
      const result = engine.updateTaskProgress('不存在的任务', 0);
      expect(result.success).toBe(false);
    });
  });

  describe('submitTask', () => {
    it('submits a complete task and distributes rewards', () => {
      const task = makeTask('护送商队');
      engine.acceptTask(task, '初学');
      engine.updateTaskProgress('护送商队', 0);
      const character = makePlayerCharacter();
      const result = engine.submitTask('护送商队', character);
      expect(result.success).toBe(true);
      expect(engine.completedTasks).toHaveLength(1);
      expect(engine.taskList).toHaveLength(0);
      expect(result.narrativeConstraint).toContain('完成任务');
    });

    it('fails when task not completeable', () => {
      const task = makeTask('护送商队');
      engine.acceptTask(task, '初学');
      const character = makePlayerCharacter();
      const result = engine.submitTask('护送商队', character);
      expect(result.success).toBe(false);
    });

    it('fails when task not found', () => {
      const character = makePlayerCharacter();
      const result = engine.submitTask('不存在的任务', character);
      expect(result.success).toBe(false);
    });
  });

  describe('failTask', () => {
    it('marks task as failed', () => {
      const task = makeTask('护送商队');
      engine.acceptTask(task, '初学');
      const result = engine.failTask('护送商队', '超时');
      expect(result.success).toBe(true);
      expect(result.narrativeConstraint).toContain('任务失败');
    });

    it('fails when task not found', () => {
      const result = engine.failTask('不存在的任务');
      expect(result.success).toBe(false);
    });
  });

  describe('checkAllObjectives', () => {
    it('returns status of all active tasks', () => {
      const task = makeTask('护送商队', 2);
      engine.acceptTask(task, '初学');
      const status = engine.checkAllObjectives();
      expect(status).toHaveLength(1);
      expect(status[0].allComplete).toBe(false);
    });
  });

  describe('SLG interface', () => {
    it('advanceTurn', () => {
      const r = engine.advanceTurn();
      expect(r.turnNumber).toBe(1);
    });

    it('canExecuteAction', () => {
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgTask', type: 'accept_task', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgTask', type: 'update_progress', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgTask', type: 'submit_task', payload: {}, timestamp: 0 })).toBe(true);
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgTask', type: 'attack', payload: {}, timestamp: 0 })).toBe(false);
    });

    it('getSnapshot', () => {
      engine.acceptTask(makeTask('护送商队'), '初学');
      const snap = engine.getSnapshot();
      expect(snap.engineStates.rpgTask).toBeDefined();
    });

    it('getNarrativeConstraints', () => {
      const nc = engine.getNarrativeConstraints();
      expect(nc.scene).toBe('任务管理');
    });

    it('reset clears task list', () => {
      engine.acceptTask(makeTask('护送商队'), '初学');
      engine.reset();
      expect(engine.taskList).toHaveLength(0);
    });
  });

  describe('serialization', () => {
    it('serializes and deserializes', () => {
      engine.acceptTask(makeTask('护送商队'), '初学');
      engine.advanceTurn();
      const data = engine.serialize();
      expect(data.engineType).toBe('rpgTask');
      expect(data.taskCount).toBe(1);

      const restored = RpgTaskEngine.fromJSON(data);
      expect(restored.taskList).toHaveLength(0);
    });
  });
});

// ==================== RpgSectEngine Tests ====================

describe('RpgSectEngine', () => {
  let engine: RpgSectEngine;

  beforeEach(() => { engine = createRpgSectEngine(); });

  describe('initialization', () => {
    it('starts with no sect', () => {
      expect(engine.sectData).toBeNull();
    });
  });

  describe('initialize sect', () => {
    it('joins a sect', () => {
      const sectData = makeSectData();
      const result = engine.initialize(sectData);
      expect(result.success).toBe(true);
      expect(engine.sectData?.名称).toBe('华山派');
    });

    it('re-initialize overwrites previous sect data', () => {
      engine.initialize(makeSectData());
      const result = engine.initialize(makeSectData());
      expect(result.success).toBe(true);
    });
  });

  describe('sect operations', () => {
    beforeEach(() => { engine.initialize(makeSectData()); });

    it('gains contribution', () => {
      const result = engine.gainContribution(50);
      expect(result.success).toBe(true);
    });

    it('spends contribution', () => {
      engine.gainContribution(100);
      const result = engine.useContribution(30);
      expect(result.success).toBe(true);
    });

    it('fails to spend contribution when insufficient', () => {
      const result = engine.useContribution(30);
      expect(result.success).toBe(false);
    });

    it('adds funds', () => {
      const result = engine.addSectFunds(200);
      expect(result.success).toBe(true);
    });

    it('invests in construction', () => {
      const result = engine.investInConstruction(500);
      expect(result.success).toBe(true);
      expect(engine.sectData?.建设度).toBeGreaterThan(10);
    });

    it('fails construction with insufficient funds', () => {
      // Default sect has 1000 funds, try to spend more
      const result = engine.investInConstruction(999999);
      expect(result.success).toBe(false);
    });

    it('refreshes tasks', () => {
      const result = engine.refreshTasks();
      expect(result.success).toBe(true);
    });

    it('daily maintenance', () => {
      const result = engine.dailyMaintenance();
      expect(result.success).toBe(true);
    });

    it('returns not-in-sect when operations called without sect', () => {
      engine.reset();
      const result = engine.gainContribution(50);
      expect(result.success).toBe(false);
      expect(result.narrativeConstraint).toContain('未加入任何门派');
    });
  });

  describe('SLG interface', () => {
    it('advanceTurn', () => {
      const r = engine.advanceTurn();
      expect(r.turnNumber).toBe(1);
    });

    it('canExecuteAction', () => {
      expect(engine.canExecuteAction({ id: 'x', engineType: 'rpgSect', type: 'gain_contribution', payload: {}, timestamp: 0 })).toBe(true);
    });

    it('getSnapshot', () => {
      engine.initialize(makeSectData());
      const snap = engine.getSnapshot();
      expect(snap.engineStates.rpgSect).toBeDefined();
    });

    it('getNarrativeConstraints with sect', () => {
      engine.initialize(makeSectData());
      const nc = engine.getNarrativeConstraints();
      expect(nc.scene).toBe('华山派');
    });

    it('getNarrativeConstraints without sect', () => {
      const nc = engine.getNarrativeConstraints();
      expect(nc.scene).toBe('无门派');
    });

    it('reset', () => {
      engine.initialize(makeSectData());
      engine.reset();
      expect(engine.sectData).toBeNull();
    });
  });

  describe('serialization', () => {
    it('serializes and deserializes', () => {
      engine.initialize(makeSectData());
      engine.advanceTurn();
      const data = engine.serialize();
      expect(data.engineType).toBe('rpgSect');
      expect(data.turnNumber).toBe(1);
      expect(data.hasSect).toBe(true);

      const restored = RpgSectEngine.fromJSON(data);
      expect(restored.sectData).toBeNull();
    });
  });
});

// ==================== taskStateMachine Tests ====================

describe('taskStateMachine', () => {
  describe('checkTaskTransition', () => {
    it('allows progress_update for in-progress task', () => {
      const task = makeTask('test');
      task.当前状态 = '进行中';
      const result = checkTaskTransition(task, 'progress_update');
      expect(result.canTransition).toBe(true);
    });

    it('allows objectives_complete', () => {
      const task = makeTask('test');
      task.当前状态 = '进行中';
      const result = checkTaskTransition(task, 'objectives_complete');
      expect(result.canTransition).toBe(true);
      expect(result.nextState).toBe('可提交');
    });

    it('allows submit from 可提交', () => {
      const task = makeTask('test');
      task.当前状态 = '可提交';
      const result = checkTaskTransition(task, 'submit');
      expect(result.canTransition).toBe(true);
      expect(result.nextState).toBe('已完成');
    });

    it('blocks from completed state', () => {
      const task = makeTask('test');
      task.当前状态 = '已完成';
      const result = checkTaskTransition(task, 'submit');
      expect(result.canTransition).toBe(false);
    });

    it('blocks from failed state', () => {
      const task = makeTask('test');
      task.当前状态 = '已失败';
      const result = checkTaskTransition(task, 'progress_update');
      expect(result.canTransition).toBe(false);
    });

    it('blocks invalid action', () => {
      const task = makeTask('test');
      task.当前状态 = '进行中';
      const result = checkTaskTransition(task, 'invalid_action');
      expect(result.canTransition).toBe(false);
    });
  });

  describe('areAllObjectivesComplete', () => {
    it('returns true when all objectives are done', () => {
      const task = makeTask('test', 2);
      task.目标列表[0].完成状态 = true;
      task.目标列表[1].完成状态 = true;
      expect(areAllObjectivesComplete(task)).toBe(true);
    });

    it('returns false when some objectives remain', () => {
      const task = makeTask('test', 2);
      task.目标列表[0].完成状态 = true;
      expect(areAllObjectivesComplete(task)).toBe(false);
    });

    it('returns false for empty objective list', () => {
      const task = makeTask('test', 0);
      expect(areAllObjectivesComplete(task)).toBe(false);
    });
  });

  describe('canAcceptTask', () => {
    it('accepts new task', () => {
      const task = makeTask('new-task');
      expect(canAcceptTask(task, '初学', [])).toEqual({ canAccept: true });
    });

    it('rejects if already in progress', () => {
      const task = makeTask('existing');
      task.当前状态 = '进行中';
      const result = canAcceptTask(task, '初学', [task]);
      expect(result.canAccept).toBe(false);
    });

    it('rejects if already completed', () => {
      const task = makeTask('existing');
      task.当前状态 = '已完成';
      const result = canAcceptTask(task, '初学', [task]);
      expect(result.canAccept).toBe(false);
    });

    it('rejects if realm too low', () => {
      const task = { ...makeTask('hard'), 推荐境界: '大成' } as unknown as 任务结构;
      const result = canAcceptTask(task, '初学', []);
      expect(result.canAccept).toBe(false);
    });
  });
});

// ==================== rewardDistributor Tests ====================

describe('rewardDistributor', () => {
  it('distributes multiple rewards', () => {
    const character = makePlayerCharacter();
    const result = distributeRewards(character, { silver: 100, experience: 50 });
    expect(result.success).toBe(true);
    expect(result.narrative).toContain('银两+100');
    expect(result.narrative).toContain('经验+50');
  });

  it('handles empty rewards', () => {
    const character = makePlayerCharacter();
    const result = distributeRewards(character, {});
    expect(result.success).toBe(true);
    expect(result.narrative).toContain('无实质奖励');
  });

  it('parses reward description', () => {
    const parsed = parseRewardDescription(['100银两', '50经验', '20贡献']);
    expect(parsed.silver).toBe(100);
    expect(parsed.experience).toBe(50);
    expect(parsed.sectContribution).toBe(20);
  });

  it('parses wisdom and luck rewards', () => {
    const parsed = parseRewardDescription(['5悟性', '3福源']);
    expect(parsed.wisdom).toBe(5);
    expect(parsed.luck).toBe(3);
  });
});

// ==================== economyManager Tests ====================

describe('economyManager', () => {
  function makeEconomyState(): EconomyState {
    return { 门派资金: 1000, 门派物资: 500, 建设度: 10 };
  }

  it('adds funds', () => {
    const result = addFunds(makeEconomyState(), 200);
    expect(result.success).toBe(true);
    expect(result.newState.门派资金).toBe(1200);
  });

  it('spends funds', () => {
    const result = spendFunds(makeEconomyState(), 300);
    expect(result.success).toBe(true);
    expect(result.newState.门派资金).toBe(700);
  });

  it('fails to spend more than available', () => {
    const result = spendFunds(makeEconomyState(), 2000);
    expect(result.success).toBe(false);
  });

  it('adds supplies', () => {
    const result = addSupplies(makeEconomyState(), 100);
    expect(result.success).toBe(true);
    expect(result.newState.门派物资).toBe(600);
  });

  it('spends supplies', () => {
    const result = spendSupplies(makeEconomyState(), 200);
    expect(result.success).toBe(true);
    expect(result.newState.门派物资).toBe(300);
  });

  it('invests in construction', () => {
    const result = investConstruction(makeEconomyState(), 500);
    expect(result.success).toBe(true);
    expect(result.newState.建设度).toBe(15);
  });

  it('fails construction with insufficient funds', () => {
    const result = investConstruction(makeEconomyState(), 2000);
    expect(result.success).toBe(false);
  });

  it('calculates daily maintenance', () => {
    const result = calculateDailyMaintenance(10);
    expect(result.income).toBe(5);
    expect(result.expense).toBe(3);
    expect(result.net).toBe(2);
  });
});

// ==================== contributionManager Tests ====================

describe('contributionManager', () => {
  it('adds contribution', () => {
    const result = addContribution(100, 50);
    expect(result.success).toBe(true);
    expect(result.newContribution).toBe(150);
  });

  it('spends contribution', () => {
    const result = spendContribution(100, 30);
    expect(result.success).toBe(true);
    expect(result.newContribution).toBe(70);
  });

  it('fails when contribution insufficient', () => {
    const result = spendContribution(10, 50);
    expect(result.success).toBe(false);
  });

  it('calculates rank', () => {
    expect(calculateRank(0)).toBe('杂役弟子');
    expect(calculateRank(100)).toBe('外门弟子');
    expect(calculateRank(500)).toBe('内门弟子');
    expect(calculateRank(2000)).toBe('真传弟子');
    expect(calculateRank(100000)).toBe('掌门');
  });

  it('gets next rank info', () => {
    const info = getNextRankInfo(50);
    expect(info.currentRank).toBe('杂役弟子');
    expect(info.nextRank).toBe('外门弟子');
    expect(info.needed).toBe(50);
  });
});

// ==================== memberDispatcher Tests ====================

describe('memberDispatcher', () => {
  let posts: PostAssignment[];

  beforeEach(() => { posts = initializePosts(); });

  it('initializes all posts', () => {
    expect(posts).toHaveLength(5);
    expect(posts.find(p => p.postId === '巡逻')).toBeDefined();
  });

  it('assignToPost validates successfully', () => {
    const result = assignToPost(posts, 'member-1', '巡逻');
    expect(result.success).toBe(true);
  });

  it('assignToPost only validates (engine handles mutation)', () => {
    const r1 = assignToPost(posts, 'member-1', '巡逻');
    expect(r1.success).toBe(true);
    const r2 = assignToPost(posts, 'member-1', '建设');
    expect(r2.success).toBe(true);
  });

  it('fails when post is full', () => {
    const patrol = posts.find(p => p.postId === '巡逻')!;
    patrol.assignedMembers = ['m1', 'm2', 'm3'];
    const result = assignToPost(posts, 'm4', '巡逻');
    expect(result.success).toBe(false);
  });

  it('fails when member already in a post', () => {
    const patrol = posts.find(p => p.postId === '巡逻')!;
    patrol.assignedMembers = ['member-1'];
    const result = assignToPost(posts, 'member-1', '建设');
    expect(result.success).toBe(false);
  });

  it('removes member from post', () => {
    const patrol = posts.find(p => p.postId === '巡逻')!;
    patrol.assignedMembers = ['member-1'];
    const result = removeFromPost(posts, 'member-1');
    expect(result.success).toBe(true);
    expect(patrol.assignedMembers).toHaveLength(0);
  });

  it('removeFromPost fails when not in any post', () => {
    const result = removeFromPost(posts, 'member-1');
    expect(result.success).toBe(false);
  });

  it('calculates post output', () => {
    const members: SectMember[] = [
      { ID: 'm1', 名称: '张三', 职位: '', 岗位: null, 能力值: 80 },
    ];
    const patrol = posts.find(p => p.postId === '巡逻')!;
    patrol.assignedMembers = ['m1'];
    const output = calculatePostOutput(patrol, members);
    expect(output.postId).toBe('巡逻');
    expect(output.totalEfficiency).toBeGreaterThan(0);
  });
});

// ==================== dynamicPricing Tests ====================

describe('dynamicPricing', () => {
  const config: PriceConfig = { basePrice: 100, minPrice: 50, maxPrice: 200, volatility: 0.5 };

  it('calculates price with balanced supply/demand', () => {
    const sd: SupplyDemand = { supply: 100, demand: 100 };
    const price = calculateFinalPrice(config, sd);
    expect(price).toBe(100);
  });

  it('increases price when demand exceeds supply', () => {
    const sd: SupplyDemand = { supply: 10, demand: 100 };
    const price = calculateFinalPrice(config, sd);
    expect(price).toBeGreaterThan(100);
  });

  it('decreases price when supply exceeds demand', () => {
    const sd: SupplyDemand = { supply: 200, demand: 50 };
    const price = calculateFinalPrice(config, sd);
    expect(price).toBeLessThan(100);
  });

  it('respects min/max price bounds', () => {
    const sd: SupplyDemand = { supply: 1000, demand: 1 };
    const price = calculateFinalPrice(config, sd);
    expect(price).toBeGreaterThanOrEqual(50);
    expect(price).toBeLessThanOrEqual(200);
  });

  it('handles zero demand', () => {
    const sd: SupplyDemand = { supply: 10, demand: 0 };
    const price = calculateFinalPrice(config, sd);
    expect(price).toBe(100);
  });

  it('calculates price multiplier directly', () => {
    const sd: SupplyDemand = { supply: 50, demand: 100 };
    const mult = calculatePriceMultiplier({ basePrice: 100, minPrice: 50, maxPrice: 200, volatility: 1 }, sd);
    expect(mult).toBeGreaterThan(1);
    expect(mult).toBeLessThanOrEqual(2);
  });
});
