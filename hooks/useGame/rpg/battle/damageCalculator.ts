/**
 * damageCalculator.ts
 *
 * RPG 伤害计算器 — 复用 combatCalculation.ts 中的公式，
 * 补充技能伤害计算（原代码中 技能基础伤害 = 0 的存根）。
 *
 * 基础伤害公式（来自 combatCalculation.ts）:
 *   基础攻击 = 力量 * 2
 *   基础防御 = 体质 + 根骨
 *   基础速度 = 敏捷 * 1.5
 *   基础血量 = 体质 * 10 + 根骨 * 5
 *
 * 装备攻击 = Σ((最小攻击 + 最大攻击) / 2) for 3 weapon slots
 * 装备防御 = Σ(物理防御 + 内功防御) for 7 armor slots
 *
 * 伤害公式:
 *   基础伤害 = max(1, 攻击力 - 防御力 * 0.5)
 *   浮动 = 基础伤害 * (0.9 ~ 1.1)
 *   暴击 = 浮动 * 1.5 (if crit roll succeeds)
 *   闪避 = 0 (if dodge roll succeeds)
 *
 * 技能伤害公式（修复原有存根）:
 *   属性值 =  attacker[功法.加成属性] (从角色属性中查找)
 *   技能基础 = 功法.基础伤害 + 属性值 * 功法.加成系数
 *   内力加成 = 技能基础 * 功法.内力系数 * (当前内力 / 最大内力)
 *   最终技能伤害 = 技能基础 + 内力加成
 */

import type { 角色数据结构 } from '../../../../models/character';
import type { 功法结构 } from '../../../../models/kungfu';
import type { 游戏物品, 武器, 防具 } from '../../../../models/item';

/** 类型守卫：判断是否为武器 */
function isWeapon(item: 游戏物品): item is 武器 {
  return item.类型 === '武器';
}

/** 类型守卫：判断是否为防具 */
function isArmor(item: 游戏物品): item is 防具 {
  return item.类型 === '防具';
}

/** 战斗属性（从角色属性+装备派生） */
export interface CombatStats {
  攻击力: number;
  防御力: number;
  速度: number;
  暴击率: number;
  闪避率: number;
  最大血量: number;
}

/** 伤害计算结果 */
export interface DamageResult {
  /** 最终伤害值 */
  damage: number;
  /** 是否暴击 */
  isCrit: boolean;
  /** 是否被闪避 */
  isDodge: boolean;
  /** 伤害类型 */
  damageType: 'physical' | 'skill' | 'true' | 'mixed';
}

/**
 * 从角色属性和装备计算战斗属性
 */
export function calculateCombatStats(
  character: 角色数据结构,
  equipment: Record<string, 游戏物品 | undefined>,
): CombatStats {
  // 基础属性
  const baseAttack = character.力量 * 2;
  const baseDefense = character.体质 + character.根骨;
  const baseSpeed = character.敏捷 * 1.5;
  const baseHP = character.体质 * 10 + character.根骨 * 5;

  // 装备攻击 = Σ((最小攻击 + 最大攻击) / 2) for weapon slots
  const weaponSlots = ['主武器', '副武器', '暗器'] as const;
  let equipAttack = 0;
  for (const slot of weaponSlots) {
    const item = equipment[slot];
    if (item && isWeapon(item)) {
      equipAttack += (item.最小攻击 + item.最大攻击) / 2;
    }
  }

  // 装备防御 = Σ(物理防御 + 内功防御) for armor slots
  const armorSlots = [
    '头部',
    '胸部',
    '盔甲',
    '内衬',
    '腿部',
    '手部',
    '足部',
  ] as const;
  let equipDefense = 0;
  for (const slot of armorSlots) {
    const item = equipment[slot];
    if (item && isArmor(item)) {
      equipDefense += item.物理防御 + item.内功防御;
    }
  }

  // 装备攻速修正（取平均值）
  let equipSpeedBonus = 0;
  for (const slot of weaponSlots) {
    const item = equipment[slot];
    if (item && isWeapon(item)) {
      equipSpeedBonus += item.攻速修正;
    }
  }

  // 暴击率: 基础 5% + 福源 * 0.5%
  const baseCritRate = 0.05 + character.福源 * 0.005;
  // 闪避率: 基础 3% + 敏捷 * 0.3%
  const baseDodgeRate = 0.03 + character.敏捷 * 0.003;

  return {
    攻击力: baseAttack + equipAttack,
    防御力: baseDefense + equipDefense,
    速度: baseSpeed + equipSpeedBonus,
    暴击率: Math.min(baseCritRate, 0.5),
    闪避率: Math.min(baseDodgeRate, 0.5),
    最大血量: baseHP,
  };
}

/**
 * 普通攻击伤害计算
 */
export function calculateDamage(
  attackerStats: CombatStats,
  defenderStats: CombatStats,
  rng: () => number = Math.random,
): DamageResult {
  // 基础伤害 = max(1, 攻击力 - 防御力 * 0.5)
  let baseDamage = Math.max(1, attackerStats.攻击力 - defenderStats.防御力 * 0.5);

  // 闪避判定
  const isDodge = rng() < defenderStats.闪避率;
  if (isDodge) {
    return { damage: 0, isCrit: false, isDodge: true, damageType: 'physical' };
  }

  // 浮动: 90% ~ 110%
  const floatRange = 0.9 + rng() * 0.2;
  baseDamage *= floatRange;

  // 暴击判定
  const isCrit = rng() < attackerStats.暴击率;
  if (isCrit) {
    baseDamage *= 1.5;
  }

  return {
    damage: Math.round(baseDamage),
    isCrit,
    isDodge: false,
    damageType: 'physical',
  };
}

/**
 * 技能伤害计算（修复原有 技能基础伤害 = 0 的存根）
 *
 * 使用功法的 基础伤害 + 加成属性 * 加成系数 + 内力系数
 */
export function calculateSkillDamage(
  attacker: 角色数据结构,
  attackerStats: CombatStats,
  defenderStats: CombatStats,
  kungfu: 功法结构,
  rng: () => number = Math.random,
): DamageResult {
  // 1. 查找加成属性值
  const attrValue = getAttributeValue(attacker, kungfu.加成属性);

  // 2. 技能基础伤害 = 基础伤害 + 加成属性 * 加成系数
  let skillBase = (kungfu.基础伤害 ?? 0) + attrValue * (kungfu.加成系数 ?? 0);

  // 3. 内力加成 = 技能基础 * 内力系数 * (当前内力 / 最大内力)
  const innerPowerRatio =
    attacker.最大内力 > 0 ? attacker.当前内力 / attacker.最大内力 : 0;
  const innerPowerBonus =
    skillBase * (kungfu.内力系数 ?? 0) * innerPowerRatio;

  let totalDamage = skillBase + innerPowerBonus;

  // 4. 防御减免
  totalDamage = Math.max(1, totalDamage - defenderStats.防御力 * 0.3);

  // 5. 闪避判定
  const isDodge = rng() < defenderStats.闪避率;
  if (isDodge) {
    return { damage: 0, isCrit: false, isDodge: true, damageType: kungfu.伤害类型 as DamageResult['damageType'] };
  }

  // 6. 浮动
  const floatRange = 0.9 + rng() * 0.2;
  totalDamage *= floatRange;

  // 7. 暴击判定
  const isCrit = rng() < attackerStats.暴击率;
  if (isCrit) {
    totalDamage *= 1.5;
  }

  return {
    damage: Math.round(totalDamage),
    isCrit,
    isDodge: false,
    damageType: kungfu.伤害类型 as DamageResult['damageType'],
  };
}

/**
 * 从角色数据结构中查找指定属性名的值
 */
function getAttributeValue(
  character: 角色数据结构,
  attrName: string | undefined,
): number {
  if (!attrName) return 0;

  const attrMap: Record<string, number | undefined> = {
    力量: character.力量,
    敏捷: character.敏捷,
    体质: character.体质,
    根骨: character.根骨,
    悟性: character.悟性,
    福源: character.福源,
  };

  return attrMap[attrName] ?? 0;
}

/**
 * 身体部位伤害修正
 *
 * 部位伤害系数:
 * - 头部: 1.5x (要害)
 * - 胸部: 1.0x
 * - 腹部: 1.2x
 * - 左手/右手: 0.7x
 * - 左腿/右腿: 0.8x
 */
export function getBodyPartMultiplier(bodyPart: string): number {
  const multipliers: Record<string, number> = {
    头部: 1.5,
    胸部: 1.0,
    腹部: 1.2,
    左手: 0.7,
    右手: 0.7,
    左腿: 0.8,
    右腿: 0.8,
  };
  return multipliers[bodyPart] ?? 1.0;
}
