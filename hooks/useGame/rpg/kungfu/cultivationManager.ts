/**
 * cultivationManager.ts
 *
 * 功法修炼管理 — 熟练度积累、重数提升
 */

import type { 功法结构 } from '../../../../models/kungfu';

export interface CultivationResult {
  success: boolean;
  newProficiency: number;
  levelUp: boolean;
  newLevel: number;
  reason?: string;
}

/**
 * 修炼功法，增加熟练度
 */
export function cultivateKungfu(
  kungfu: 功法结构,
  proficiencyGain: number,
): CultivationResult {
  const currentProficiency = kungfu.当前熟练度 ?? 0;
  const currentLevel = kungfu.当前重数 ?? 1;
  const maxLevel = kungfu.最高重数 ?? 10;
  const expNeeded = kungfu.升级经验 ?? 100;

  if (currentLevel >= maxLevel) {
    return {
      success: false,
      newProficiency: currentProficiency,
      levelUp: false,
      newLevel: currentLevel,
      reason: '已达最高重数',
    };
  }

  const newProficiency = currentProficiency + proficiencyGain;

  if (newProficiency >= expNeeded) {
    return {
      success: true,
      newProficiency,
      levelUp: true,
      newLevel: currentLevel + 1,
    };
  }

  return {
    success: true,
    newProficiency,
    levelUp: false,
    newLevel: currentLevel,
  };
}

/**
 * 批量修炼（多次修炼累积，可能跨越多重升级）
 */
export function cultivateKungfuBatch(
  kungfu: 功法结构,
  totalProficiencyGain: number,
): CultivationResult {
  const currentProficiency = kungfu.当前熟练度 ?? 0;
  const currentLevel = kungfu.当前重数 ?? 1;
  const maxLevel = kungfu.最高重数 ?? 10;
  const expNeeded = kungfu.升级经验 ?? 100;

  if (currentLevel >= maxLevel) {
    return {
      success: false,
      newProficiency: currentProficiency,
      levelUp: false,
      newLevel: currentLevel,
      reason: '已达最高重数',
    };
  }

  let remaining = totalProficiencyGain;
  let level = currentLevel;
  let proficiency = currentProficiency;

  while (remaining > 0 && level < maxLevel) {
    const needed = expNeeded - proficiency;
    if (remaining >= needed) {
      remaining -= needed;
      level++;
      proficiency = 0;
    } else {
      proficiency += remaining;
      remaining = 0;
    }
  }

  const overflowed = level > currentLevel;

  return {
    success: true,
    newProficiency: overflowed ? 0 : proficiency,
    levelUp: level > currentLevel,
    newLevel: level,
  };
}
