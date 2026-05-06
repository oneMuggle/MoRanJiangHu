import type { 桌游类型, 密室主题, 桌游状态, 欲望阶段, 露出偏好等级 } from '../../../models/campusNSFW';

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
