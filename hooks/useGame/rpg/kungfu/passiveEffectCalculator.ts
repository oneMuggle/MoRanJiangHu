/**
 * passiveEffectCalculator.ts
 *
 * 功法被动效果计算 — 功法常驻属性修正
 */

import type { 功法结构 } from '../../../../models/kungfu';

export interface PassiveModifiers {
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

/**
 * 计算单个功法的被动属性修正
 */
export function calculatePassiveEffects(kungfu: 功法结构): PassiveModifiers {
  const result: PassiveModifiers = {
    力量: 0, 敏捷: 0, 体质: 0, 根骨: 0, 悟性: 0, 福源: 0,
    攻击力: 0, 防御力: 0, 速度: 0, 暴击率: 0, 闪避率: 0,
  };

  const currentLevel = kungfu.当前重数 ?? 1;

  for (const passive of kungfu.被动修正 ?? []) {
    const scaledValue = passive.数值 * currentLevel;
    applyPassiveAttr(result, passive.属性名, scaledValue, passive.类型);
  }

  return result;
}

/**
 * 合并多个功法的被动修正
 */
export function mergePassiveEffects(...modifiers: PassiveModifiers[]): PassiveModifiers {
  const merged: PassiveModifiers = {
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

function applyPassiveAttr(
  result: PassiveModifiers,
  attrName: string,
  value: number,
  type: string,
): void {
  const finalValue = type === '百分比' ? value / 100 : value;

  switch (attrName) {
    case '力量': result.力量 += finalValue; break;
    case '敏捷': result.敏捷 += finalValue; break;
    case '体质': result.体质 += finalValue; break;
    case '根骨': result.根骨 += finalValue; break;
    case '悟性': result.悟性 += finalValue; break;
    case '福源': result.福源 += finalValue; break;
    case '物理攻击':
    case '攻击力': result.攻击力 += finalValue; break;
    case '物理防御':
    case '防御力': result.防御力 += finalValue; break;
    case '速度': result.速度 += finalValue; break;
    case '暴击':
    case '暴击率': result.暴击率 += finalValue; break;
    case '闪避':
    case '闪避率': result.闪避率 += finalValue; break;
  }
}
