/**
 * effectCalculator.ts
 *
 * 装备效果计算 — 计算装备穿戴后的属性修正
 *
 * 属性映射（来自词条列表）:
 * - "力量" → 角色.力量
 * - "敏捷" → 角色.敏捷
 * - "体质" → 角色.体质
 * - "根骨" → 角色.根骨
 * - "悟性" → 角色.悟性
 * - "福源" → 角色.福源
 * - "物理攻击" → 攻击力加成
 * - "物理防御" → 防御力加成
 * - "速度" → 速度加成
 */

import type { 游戏物品, 物品词条, 武器, 防具 } from '../../../../models/item';
import type { 角色数据结构 } from '../../../../models/character';

/** 装备属性修正结果 */
export interface EquipModifiers {
  力量: number;
  敏捷: number;
  体质: number;
  根骨: number;
  悟性: number;
  福源: number;
  攻击力: number;
  防御力: number;
  速度: number;
  暴击率: number;
  闪避率: number;
}

const ATTR_KEYS: (keyof 角色数据结构 & string)[] = ['力量', '敏捷', '体质', '根骨', '悟性', '福源'];

/**
 * 计算单件装备的属性修正
 */
export function calculateItemModifiers(item: 游戏物品): EquipModifiers {
  const result: EquipModifiers = {
    力量: 0, 敏捷: 0, 体质: 0, 根骨: 0, 悟性: 0, 福源: 0,
    攻击力: 0, 防御力: 0, 速度: 0, 暴击率: 0, 闪避率: 0,
  };

  // 武器：攻击力 = (最小攻击 + 最大攻击) / 2, 速度 = 攻速修正
  if (item.类型 === '武器') {
    const weapon = item as 武器;
    result.攻击力 = (weapon.最小攻击 + weapon.最大攻击) / 2;
    result.速度 = weapon.攻速修正;
  }

  // 防具：防御力 = 物理防御 + 内功防御
  if (item.类型 === '防具') {
    const armor = item as 防具;
    result.防御力 = armor.物理防御 + armor.内功防御;
  }

  // 词条属性
  for (const affix of item.词条列表 ?? []) {
    applyAffix(result, affix);
  }

  return result;
}

/**
 * 应用单个词条到修正值
 */
function applyAffix(result: EquipModifiers, affix: 物品词条): void {
  const attr = affix.属性;
  const value = affix.类型 === '百分比' ? affix.数值 / 100 : affix.数值;

  // 六维属性
  for (const key of ATTR_KEYS) {
    if (attr.includes(key)) {
      result[key as keyof EquipModifiers] += value;
    }
  }

  // 战斗属性
  if (attr.includes('物理攻击') || attr.includes('攻击力')) {
    result.攻击力 += value;
  }
  if (attr.includes('物理防御') || attr.includes('防御力')) {
    result.防御力 += value;
  }
  if (attr.includes('速度')) {
    result.速度 += value;
  }
  if (attr.includes('暴击')) {
    result.暴击率 += value;
  }
  if (attr.includes('闪避')) {
    result.闪避率 += value;
  }
}

/**
 * 合并多件装备的修正值
 */
export function mergeModifiers(...modifiers: EquipModifiers[]): EquipModifiers {
  const merged: EquipModifiers = {
    力量: 0, 敏捷: 0, 体质: 0, 根骨: 0, 悟性: 0, 福源: 0,
    攻击力: 0, 防御力: 0, 速度: 0, 暴击率: 0, 闪避率: 0,
  };

  for (const mod of modifiers) {
    merged.力量 += mod.力量;
    merged.敏捷 += mod.敏捷;
    merged.体质 += mod.体质;
    merged.根骨 += mod.根骨;
    merged.悟性 += mod.悟性;
    merged.福源 += mod.福源;
    merged.攻击力 += mod.攻击力;
    merged.防御力 += mod.防御力;
    merged.速度 += mod.速度;
    merged.暴击率 += mod.暴击率;
    merged.闪避率 += mod.闪避率;
  }

  return merged;
}

/**
 * 计算角色穿戴装备后的最终属性修正
 *
 * 公式: 最终属性 = 基础属性 * (1 + 百分比修正) + 固定修正
 */
export function applyEquipmentModifiers(
  _character: 角色数据结构,
  equipment: Record<string, 游戏物品 | undefined>,
): EquipModifiers {
  const modifiers: EquipModifiers[] = [];

  for (const item of Object.values(equipment)) {
    if (item) {
      modifiers.push(calculateItemModifiers(item));
    }
  }

  if (modifiers.length === 0) {
    return {
      力量: 0, 敏捷: 0, 体质: 0, 根骨: 0, 悟性: 0, 福源: 0,
      攻击力: 0, 防御力: 0, 速度: 0, 暴击率: 0, 闪避率: 0,
    };
  }

  return mergeModifiers(...modifiers);
}
