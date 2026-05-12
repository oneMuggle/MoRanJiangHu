/**
 * skillResolver.ts
 *
 * 技能解析器 — 处理功法的施展、冷却、消耗校验
 */

import type { 功法结构, 消耗类型 } from '../../../../models/kungfu';
import type { DamageResult } from './damageCalculator';

/** 技能施展结果 */
export interface SkillResolveResult {
  /** 是否成功施展 */
  success: boolean;
  /** 失败原因 */
  reason?: 'insufficient_energy' | 'on_cooldown' | 'not_learned';
  /** 消耗的资源量 */
  cost?: number;
  /** 伤害计算结果（如果成功） */
  damage?: DamageResult;
}

/**
 * 检查并施展技能
 */
export function resolveSkill(
  kungfu: 功法结构,
  cooldowns: Map<string, number>,
  calculateDamage: () => DamageResult,
): SkillResolveResult {
  // 1. 检查冷却
  const remainingCooldown = cooldowns.get(kungfu.ID) ?? 0;
  if (remainingCooldown > 0) {
    return { success: false, reason: 'on_cooldown' };
  }

  // 2. 检查消耗资源（在 engine 层统一扣除，这里只做校验）
  const costValue = kungfu.消耗数值 ?? 0;
  if (costValue > 0) {
    // 消耗校验由调用方在战斗状态中完成
    // 这里仅标记需要消耗
  }

  // 3. 计算伤害
  const damage = calculateDamage();

  return {
    success: true,
    cost: costValue,
    damage,
  };
}

/**
 * 消耗角色资源（返回新的状态对象）
 * 注意：角色HP按部位存储，气血消耗按总HP扣除
 */
export function consumeResource<T extends { 当前内力?: number; 当前精力?: number }>(
  character: T,
  type: 消耗类型 | undefined,
  amount: number,
): T {
  switch (type) {
    case '内力':
      return { ...character, 当前内力: Math.max(0, (character.当前内力 ?? 0) - amount) };
    case '精力':
      return { ...character, 当前精力: Math.max(0, (character.当前精力 ?? 0) - amount) };
    case '气血':
      // 气血消耗由 engine 层按部位血量比例分摊
      return character;
    default:
      return character;
  }
}

/**
 * 更新技能冷却时间（每回合递减）
 */
export function tickCooldowns(cooldowns: Map<string, number>): Map<string, number> {
  const next = new Map<string, number>();
  for (const [id, remaining] of cooldowns) {
    if (remaining > 1) {
      next.set(id, remaining - 1);
    }
  }
  return next;
}

/**
 * 设置技能冷却
 */
export function setCooldown(
  cooldowns: Map<string, number>,
  skillId: string,
  turns: number,
): Map<string, number> {
  const next = new Map(cooldowns);
  if (turns > 0) {
    next.set(skillId, turns);
  }
  return next;
}
