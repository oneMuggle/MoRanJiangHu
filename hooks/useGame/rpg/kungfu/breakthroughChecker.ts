/**
 * breakthroughChecker.ts
 *
 * 功法突破检查 — 判断是否满足突破条件（境界、属性要求）
 */

import type { 功法结构 } from '../../../../models/kungfu';
import type { 角色数据结构 } from '../../../../models/character';

export interface BreakthroughCheck {
  canBreakthrough: boolean;
  blockedBy: string[];
}

/**
 * 检查功法是否可以突破到下一重
 */
export function checkBreakthrough(
  kungfu: 功法结构,
  character: 角色数据结构,
): BreakthroughCheck {
  const blockedBy: string[] = [];

  const currentLevel = kungfu.当前重数 ?? 1;
  const maxLevel = kungfu.最高重数 ?? 10;
  if (currentLevel >= maxLevel) {
    blockedBy.push('已达最高重数');
  }

  const currentProficiency = kungfu.当前熟练度 ?? 0;
  const expNeeded = kungfu.升级经验 ?? 100;
  if (currentProficiency < expNeeded) {
    blockedBy.push('熟练度不足');
  }

  const realmRequirement = getRealmRequirement(kungfu);
  if (realmRequirement) {
    const realmOrder = ['初学', '入门', '小成', '大成', '圆满', '宗师', '大宗师', 'legendary'];
    const currentRealmIndex = realmOrder.indexOf(character.境界);
    const requiredRealmIndex = realmOrder.indexOf(realmRequirement);
    if (currentRealmIndex < requiredRealmIndex) {
      blockedBy.push(`境界不足（需要${realmRequirement}）`);
    }
  }

  // 检查功法是否有属性门槛要求（通过被动修正的数值作为门槛标记）
  // 这里约定：如果功法描述或特殊字段中标注了属性要求，则在外部引擎层处理
  // 功法结构.被动修正仅用于属性加成，不做门槛检查

  return {
    canBreakthrough: blockedBy.length === 0,
    blockedBy,
  };
}

function getRealmRequirement(kungfu: 功法结构): string | null {
  const qualityRealmMap: Record<string, string> = {
    '凡品': '初学',
    '良品': '入门',
    '上品': '小成',
    '极品': '大成',
    '绝品': '圆满',
    '神品': '宗师',
  };
  return qualityRealmMap[kungfu.品质] ?? null;
}
