/**
 * encumbranceCalculator.ts
 *
 * 负重计算 — 计算角色当前负重及移动速度影响
 *
 * 负重规则:
 * - 负重 = Σ(物品重量 * 堆叠数量)
 * - 负重上限 = 体质 * 5 + 力量 * 3 (斤)
 * - 超载 (> 80% 上限): 速度 -30%
 * - 极超载 (> 100% 上限): 速度 -60%, 无法使用轻功
 */

import type { 游戏物品 } from '../../../../models/item';
import type { 角色数据结构 } from '../../../../models/character';

export interface EncumbranceResult {
  /** 当前总重量（斤） */
  currentWeight: number;
  /** 负重上限（斤） */
  maxWeight: number;
  /** 负重百分比 (0-1) */
  loadPercentage: number;
  /** 是否超载 (> 80%) */
  isOverloaded: boolean;
  /** 是否极超载 (> 100%) */
  isCriticalOverload: boolean;
  /** 速度修正系数 (1.0 = 无修正, 0.7 = -30%, 0.4 = -60%) */
  speedPenalty: number;
}

/**
 * 计算负重
 */
export function calculateEncumbrance(
  character: 角色数据结构,
  inventory: 游戏物品[],
): EncumbranceResult {
  // 当前重量 = Σ(物品重量 * 堆叠数量)
  const currentWeight = inventory.reduce((sum, item) => {
    return sum + item.重量 * (item.堆叠数量 ?? 1);
  }, 0);

  // 负重上限 = 体质 * 5 + 力量 * 3
  const maxWeight = character.体质 * 5 + character.力量 * 3;

  const loadPercentage = maxWeight > 0 ? currentWeight / maxWeight : 0;
  const isOverloaded = loadPercentage > 0.8;
  const isCriticalOverload = loadPercentage > 1.0;

  // 速度修正
  let speedPenalty = 1.0;
  if (isCriticalOverload) {
    speedPenalty = 0.4; // -60%
  } else if (isOverloaded) {
    speedPenalty = 0.7; // -30%
  }

  return {
    currentWeight,
    maxWeight,
    loadPercentage,
    isOverloaded,
    isCriticalOverload,
    speedPenalty,
  };
}

/**
 * 检查物品是否可以加入背包（不超载）
 */
export function canCarry(
  character: 角色数据结构,
  inventory: 游戏物品[],
  newItem: 游戏物品,
  quantity = 1,
): boolean {
  const currentWeight = inventory.reduce((sum, item) => {
    return sum + item.重量 * (item.堆叠数量 ?? 1);
  }, 0);

  const maxWeight = character.体质 * 5 + character.力量 * 3;
  return currentWeight + newItem.重量 * quantity <= maxWeight;
}
