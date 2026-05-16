/**
 * rpgTaskEngine.ts
 *
 * RPG 任务引擎 — 管理任务接取、进度更新、提交、奖励发放
 */

import { BaseEngine } from '../engine/baseEngine';
import type {
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  EngineType,
} from '../engine/types';
import type { 任务结构 } from '../../../models/task';
import {
  checkTaskTransition,
  areAllObjectivesComplete,
  canAcceptTask,
} from '../rpg/task/taskStateMachine';
import { distributeRewards, parseRewardDescription } from '../rpg/task/rewardDistributor';
import type { 角色数据结构 } from '../../../models/character';

export class RpgTaskEngine extends BaseEngine {
  private _taskList: 任务结构[] = [];
  private _turnNumber = 0;
  private _completedTasks: 任务结构[] = [];
  private _failedReasons: Record<string, string> = {};

  constructor() {
    super('rpgTask' as EngineType);
  }

  get taskList(): ReadonlyArray<任务结构> {
    return this._taskList;
  }

  get completedTasks(): ReadonlyArray<任务结构> {
    return this._completedTasks;
  }

  /**
   * 接取任务
   */
  acceptTask(task: 任务结构, playerRealm: string): ActionResult {
    const canAccept = canAcceptTask(task, playerRealm, this._taskList);
    if (!canAccept.canAccept) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<任务>${canAccept.reason}</任务>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const acceptedTask: 任务结构 = { ...task, 当前状态: '进行中' };
    this._taskList.push(acceptedTask);

    this._publishTaskEvent('TASK_ACCEPT', {
      taskTitle: task.标题,
      taskType: task.类型,
    });

    return {
      success: true,
      stateUpdates: { task: task.标题, action: 'accept' },
      narrativeConstraint: `<任务>接取任务: ${task.标题}</任务>`,
      keyStep: true,
      sideEffects: [{ type: 'task_accept', payload: { taskTitle: task.标题 } }],
    };
  }

  /**
   * 更新任务进度
   */
  updateTaskProgress(taskTitle: string, objectiveIndex: number): ActionResult {
    const index = this._taskList.findIndex((t) => t.标题 === taskTitle);
    if (index < 0) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<任务>任务不存在</任务>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const task = this._taskList[index];
    if (task.当前状态 !== '进行中') {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<任务>任务当前状态为${task.当前状态}，无法更新进度</任务>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const updatedObjectives = [...task.目标列表];
    if (objectiveIndex >= 0 && objectiveIndex < updatedObjectives.length) {
      updatedObjectives[objectiveIndex] = {
        ...updatedObjectives[objectiveIndex],
        完成状态: true,
      };
    }

    const updatedTask: 任务结构 = {
      ...task,
      目标列表: updatedObjectives,
    };

    const allComplete = updatedObjectives.every((obj) => obj.完成状态);
    const transition = checkTaskTransition(
      updatedTask,
      allComplete ? 'objectives_complete' : 'progress_update',
    );

    if (transition.canTransition) {
      updatedTask.当前状态 = transition.nextState;
    }

    this._taskList[index] = updatedTask;

    this._publishTaskEvent('TASK_PROGRESS', {
      taskTitle,
      objectiveIndex,
      allComplete,
      newState: updatedTask.当前状态,
    });

    return {
      success: true,
      stateUpdates: { task: taskTitle, progress: objectiveIndex },
      narrativeConstraint: allComplete
        ? `<任务>任务 ${task.标题} 所有目标已完成，可提交</任务>`
        : `<任务>任务 ${task.标题} 进度更新</任务>`,
      keyStep: allComplete,
      sideEffects: [
        {
          type: allComplete ? 'task_objectives_complete' : 'task_progress',
          payload: { taskTitle, objectiveIndex },
        },
      ],
    };
  }

  /**
   * 提交任务并发放奖励
   */
  submitTask(taskTitle: string, character: 角色数据结构): ActionResult {
    const index = this._taskList.findIndex((t) => t.标题 === taskTitle);
    if (index < 0) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<任务>任务不存在</任务>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const task = this._taskList[index];
    const transition = checkTaskTransition(task, 'submit');
    if (!transition.canTransition) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<任务>${transition.reason}</任务>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const completedTask: 任务结构 = {
      ...task,
      当前状态: '已完成',
    };

    this._taskList.splice(index, 1);
    this._completedTasks.push(completedTask);

    const rewardDesc = task.奖励描述 ?? [];
    const rewards = parseRewardDescription(rewardDesc);
    const rewardResult = distributeRewards(character, rewards);

    this._publishTaskEvent('TASK_COMPLETE', {
      taskTitle: task.标题,
      rewards,
    });

    return {
      success: true,
      stateUpdates: { task: taskTitle, action: 'submit', ...rewards },
      narrativeConstraint: `<任务>完成任务: ${task.标题}。${rewardResult.narrative}</任务>`,
      keyStep: true,
      sideEffects: [
        { type: 'task_complete', payload: { taskTitle, rewards } },
      ],
    };
  }

  /**
   * 标记任务失败
   */
  failTask(taskTitle: string, reason?: string): ActionResult {
    const index = this._taskList.findIndex((t) => t.标题 === taskTitle);
    if (index < 0) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<任务>任务不存在</任务>',
        keyStep: false,
        sideEffects: [],
      };
    }

    const task = this._taskList[index];
    const transition = checkTaskTransition(task, 'fail');
    if (!transition.canTransition) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<任务>${transition.reason}</任务>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const failedTask: 任务结构 = {
      ...task,
      当前状态: '已失败',
    };

    this._taskList[index] = failedTask;
    if (reason) {
      this._failedReasons[taskTitle] = reason;
    }

    this._publishTaskEvent('TASK_FAIL', {
      taskTitle: task.标题,
      reason,
    });

    return {
      success: true,
      stateUpdates: { task: taskTitle, action: 'fail' },
      narrativeConstraint: `<任务>任务失败: ${task.标题}。原因: ${reason ?? '未知'}</任务>`,
      keyStep: false,
      sideEffects: [
        { type: 'task_fail', payload: { taskTitle, reason } },
      ],
    };
  }

  /**
   * 检查所有任务的目标完成情况
   */
  checkAllObjectives(): { taskTitle: string; allComplete: boolean }[] {
    return this._taskList
      .filter((t) => t.当前状态 === '进行中')
      .map((t) => ({
        taskTitle: t.标题,
        allComplete: areAllObjectivesComplete(t),
      }));
  }

  // ==================== SLGEngine 接口 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;

    const expiredTasks: string[] = [];
    for (const task of this._taskList) {
      if (task.当前状态 === '进行中' && task.截止时间) {
        const parts = task.截止时间.split(':').map(Number);
        if (parts.length >= 5) {
          const [year, month, day, hour, minute] = parts;
          const deadlineDate = new Date(year, month - 1, day, hour, minute);
          if (Date.now() > deadlineDate.getTime()) {
            expiredTasks.push(task.标题);
          }
        }
      }
    }

    for (const taskTitle of expiredTasks) {
      this.failTask(taskTitle, '任务已超时');
    }

    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: expiredTasks.map((title) => ({
        id: `task-expire-${title}`,
        engineType: this._engineType,
        type: 'TASK_EXPIRE',
        description: `Task expired: ${title}`,
        status: 'pending' as const,
        payload: { taskTitle: title },
        createdAt: Date.now(),
      })),
      stateChanges: expiredTasks.map((title) => ({
        key: `task_state_${title}`,
        before: '进行中',
        after: '已失败',
      })),
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    const { type, payload } = action;

    if (type === 'accept_task') {
      const task = payload.task as 任务结构 | undefined;
      const playerRealm = (payload.playerRealm as string) ?? '初学';
      if (!task) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<任务>缺少任务数据</任务>',
          keyStep: false,
          sideEffects: [],
        };
      }
      return this.acceptTask(task, playerRealm);
    }

    if (type === 'update_progress') {
      const taskTitle = payload.taskTitle as string;
      const objectiveIndex = (payload.objectiveIndex as number) ?? 0;
      return this.updateTaskProgress(taskTitle, objectiveIndex);
    }

    if (type === 'submit_task') {
      const taskTitle = payload.taskTitle as string;
      const character = payload.character as 角色数据结构 | undefined;
      if (!character) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<任务>缺少角色数据</任务>',
          keyStep: false,
          sideEffects: [],
        };
      }
      return this.submitTask(taskTitle, character);
    }

    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: '<任务>未知操作类型</任务>',
      keyStep: false,
      sideEffects: [],
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    return ['accept_task', 'update_progress', 'submit_task'].includes(action.type);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        rpgTask: {
          activeTaskCount: this._taskList.length,
          completedTaskCount: this._completedTasks.length,
          taskList: this._taskList.map((t) => ({
            title: t.标题,
            state: t.当前状态,
          })),
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const activeCount = this._taskList.filter((t) => t.当前状态 === '进行中').length;
    const submitableCount = this._taskList.filter((t) => t.当前状态 === '可提交').length;

    return {
      scene: '任务管理',
      turn: this._turnNumber,
      tension: submitableCount > 0 ? 3 : 0,
      playerAction: `进行中: ${activeCount}, 可提交: ${submitableCount}`,
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: activeCount > 0 ? 'task_progress' : 'idle',
    };
  }

  reset(): void {
    this._taskList = [];
    this._completedTasks = [];
    this._failedReasons = {};
    this._turnNumber = 0;
    super.pause('phase-change');
    super.resume();
  }

  serialize(): Record<string, unknown> {
    return {
      engineType: 'rpgTask',
      turnNumber: this._turnNumber,
      taskList: this._taskList,
      completedTasks: this._completedTasks,
      failedReasons: this._failedReasons,
    };
  }

  static fromJSON(state: Record<string, unknown>): RpgTaskEngine {
    const engine = new RpgTaskEngine();
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    if (Array.isArray(state.taskList)) {
      engine._taskList = state.taskList as 任务结构[];
    }
    if (Array.isArray(state.completedTasks)) {
      engine._completedTasks = state.completedTasks as 任务结构[];
    }
    if (state.failedReasons && typeof state.failedReasons === 'object') {
      engine._failedReasons = state.failedReasons as Record<string, string>;
    }
    return engine;
  }

  private _publishTaskEvent(type: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: `task-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      engineType: this._engineType,
      type,
      description: `Task event: ${type}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }
}

/** 工厂函数 */
export function createRpgTaskEngine(): RpgTaskEngine {
  return new RpgTaskEngine();
}
