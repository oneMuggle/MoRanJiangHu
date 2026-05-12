/**
 * 桌游社交 NSFW 引擎 — 核心逻辑
 *
 * 从 campusNSFW/boardGameSystem.ts 迁移，去校园化，支持全时代
 */

import type { 桌游类型, 密室主题, 欲望阶段, 露出偏好等级 } from '../../../models/campusNSFW';

export function 判定桌游触发(参数: {
  当前回合: number; 上次桌游回合: number; 是社团活动: boolean;
  是周末: boolean; 是文化节: boolean; npc桌游偏好: number;
}): boolean {
  const { 当前回合, 上次桌游回合, 是社团活动, 是周末, 是文化节, npc桌游偏好 } = 参数;
  if (当前回合 - 上次桌游回合 < 10) return false;
  let 基础概率 = 0.05;
  if (是社团活动) 基础概率 = 0.20;
  else if (是文化节) 基础概率 = 0.30;
  else if (是周末) 基础概率 = 0.15;
  if (npc桌游偏好 > 60) 基础概率 += 0.10;
  return Math.random() < 基础概率;
}

export function 选择桌游类型(参数: {
  npc内向: boolean; npc外向: boolean; npc情感型: boolean;
  npc高露出偏好: boolean; 参与NPC欲望阶段: 欲望阶段;
}): 桌游类型 {
  const { npc内向, npc外向, npc情感型, npc高露出偏好, 参与NPC欲望阶段 } = 参数;
  if (npc内向 && 参与NPC欲望阶段 !== '克制') return '密室逃脱';
  if (npc外向 && 参与NPC欲望阶段 !== '克制') return '狼人杀';
  if (npc情感型) return '剧本杀';
  if (npc高露出偏好) return Math.random() < 0.5 ? '真心话大冒险' : '国王游戏';
  const 列表: 桌游类型[] = ['密室逃脱', '狼人杀', '剧本杀', '真心话大冒险', '国王游戏'];
  return 列表[Math.floor(Math.random() * 列表.length)];
}

export function 计算桌游紧张度(参数: {
  桌游类型: 桌游类型; 密室主题?: 密室主题;
  周围人数: number; 当前回合: number; 已触发NSFW: boolean;
}): number {
  const { 桌游类型, 密室主题, 周围人数, 当前回合, 已触发NSFW } = 参数;
  let 基础值 = 40;
  switch (桌游类型) {
    case '密室逃脱': 基础值 = 60; break;
    case '狼人杀': 基础值 = 50; break;
    case '剧本杀': 基础值 = 45; break;
    case '真心话大冒险': 基础值 = 55; break;
    case '国王游戏': 基础值 = 65; break;
  }
  if (密室主题 === '末日地堡') 基础值 += 20;
  else if (密室主题 === '温泉旅馆') 基础值 += 10;
  else if (密室主题 === '魔法学院') 基础值 -= 10;
  const 人数修正 = 1.0 + (周围人数 / 10) * 0.5;
  const 回合修正 = 1.0 + 当前回合 * 0.05;
  const nsfw修正 = 已触发NSFW ? 1.3 : 1.0;
  return Math.min(100, Math.round(基础值 * 人数修正 * 回合修正 * nsfw修正));
}

export function 计算羁绊加成(参数: {
  已通关房间数: number; 总房间数: number;
  黑暗中共处次数: number; 独处事件次数: number;
}): number {
  const { 已通关房间数, 总房间数, 黑暗中共处次数, 独处事件次数 } = 参数;
  let 加成 = 0;
  if (已通关房间数 === 总房间数) 加成 += 15;
  加成 += 黑暗中共处次数 * 5;
  加成 += 独处事件次数 * 3;
  return Math.min(30, 加成);
}

export function 判定桌游NSFW升级(参数: {
  桌游类型: 桌游类型; 紧张度: number; 欲望阶段: 欲望阶段;
  露出偏好等级: 露出偏好等级; 已触发NSFW: boolean;
}): boolean {
  const { 桌游类型, 紧张度, 欲望阶段, 露出偏好等级, 已触发NSFW } = 参数;
  if (已触发NSFW) return false;
  if (紧张度 >= 70 && 欲望阶段 !== '克制') return true;
  if (桌游类型 === '密室逃脱' && 欲望阶段 === '试探' && 紧张度 >= 50) return true;
  if (桌游类型 === '真心话大冒险' && 露出偏好等级 >= 2 && 紧张度 >= 60) return true;
  if (桌游类型 === '国王游戏' && 露出偏好等级 >= 3 && 欲望阶段 === '沉沦') return true;
  return false;
}

// ============================================================================
// SLG 交互扩展
// ============================================================================

export interface 玩家操作 {
  type: '掷骰' | '选择路径' | '投票' | '搜索' | '选择真心话大冒险' | '回应命令' | '购买地块' | '出牌' | '自定义';
  payload: Record<string, unknown>;
  游戏类型: 桌游类型;
}

export interface 操作结算结果 {
  success: boolean;
  tensionDelta: number;
  nsfwTriggered: boolean;
  keyStep: boolean;
  narrativeConstraint: string;
  description: string;
}

/**
 * 执行玩家操作，返回结算结果。
 * 这是 SLG 引擎的核心入口 — 玩家操作经此计算后影响游戏状态。
 */
export function executePlayerAction(操作: 玩家操作, 当前状态: {
  紧张度: number;
  当前回合: number;
  总回合数: number;
}): 操作结算结果 {
  const { 游戏类型, type, payload } = 操作;
  const { 紧张度, 当前回合 } = 当前状态;

  let tensionDelta = Math.floor(Math.random() * 5) + 1;
  let success = true;
  let keyStep = false;
  let description = '';

  switch (type) {
    case '掷骰': {
      const 骰子结果 = Math.random();
      if (骰子结果 < 0.15) {
        keyStep = true;
        tensionDelta += 15;
        description = '骰子落在了惩罚面，气氛骤然紧张';
      } else if (骰子结果 < 0.30) {
        tensionDelta += 10;
        description = '翻倍！紧张度急剧上升';
      } else {
        description = '骰子平稳落地';
      }
      break;
    }

    case '选择路径': {
      const 需求值 = (payload.需求属性值 as number) ?? 5;
      const 路径成功率 = Math.min(0.9, 需求值 / 10);
      success = Math.random() < 路径成功率;
      if (!success) {
        keyStep = true;
        tensionDelta += 12;
        description = '探索失败了，触发了意外事件';
      } else {
        tensionDelta += 5;
        description = '成功发现了一条新线索';
      }
      break;
    }

    case '投票':
      tensionDelta += 8;
      description = '投票已提交';
      break;

    case '搜索': {
      const 搜索成功 = Math.random() < 0.7;
      if (搜索成功) {
        description = '找到了一条重要线索';
        tensionDelta += 3;
      } else {
        description = '搜索无果';
        tensionDelta += 6;
      }
      break;
    }

    case '选择真心话大冒险': {
      const 选择 = (payload.选择 as string) ?? '真心话';
      if (选择 === '大冒险') {
        tensionDelta += 15;
        keyStep = Math.random() < 0.3;
        description = keyStep ? '大冒险的内容超出了预期' : '大冒险顺利完成';
      } else {
        tensionDelta += 8;
        description = '选择了真心话';
      }
      break;
    }

    case '回应命令': {
      const 回应 = (payload.回应 as string) ?? '服从';
      if (回应 === '反抗') {
        tensionDelta += 20;
        keyStep = true;
        description = '反抗了命令，气氛剑拔弩张';
      } else if (回应 === '协商') {
        tensionDelta += 10;
        description = '尝试协商修改命令';
      } else {
        tensionDelta += 5;
        description = '服从了命令';
      }
      break;
    }

    case '购买地块':
      tensionDelta += 3;
      description = '购买了新的地块';
      break;

    case '出牌':
      tensionDelta += 5;
      description = '出了一张牌';
      break;

    default:
      tensionDelta += 5;
      description = '执行了自定义操作';
  }

  const 回合加成 = Math.floor(当前回合 / 5) * 2;
  tensionDelta += 回合加成;

  const 最终紧张度 = Math.min(100, 紧张度 + tensionDelta);
  const nsfwTriggered = 最终紧张度 >= 75 && Math.random() < 0.3;

  if (nsfwTriggered) {
    keyStep = true;
    tensionDelta += 10;
  }

  return {
    success,
    tensionDelta,
    nsfwTriggered,
    keyStep,
    narrativeConstraint: `<桌游叙事约束>游戏类型: ${游戏类型} | 操作: ${type} | ${description} | 紧张度+${tensionDelta}${nsfwTriggered ? ' | NSFW触发' : ''}${keyStep ? ' | 关键步骤' : ''}</桌游叙事约束>`,
    description,
  };
}
