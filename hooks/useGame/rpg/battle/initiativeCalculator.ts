/**
 * initiativeCalculator.ts
 *
 * 先攻值计算 — 决定战斗中的行动顺序
 *
 * 先攻值公式:
 *   基础先攻 = 速度 (来自 CombatStats)
 *   随机浮动 = 基础先攻 * (0.9 ~ 1.1)
 *   先攻值 = 基础先攻 + 随机浮动
 *
 * 行动顺序按先攻值降序排列
 */

import type { CombatStats } from './damageCalculator';

export interface InitiativeActor {
  /** 唯一标识 */
  id: string;
  /** 阵营: 'player' | 'enemy' */
  side: 'player' | 'enemy';
  /** 战斗属性 */
  stats: CombatStats;
  /** 可选: 先攻加成（来自装备/功法被动） */
  initiativeBonus?: number;
}

/**
 * 计算所有行动者的先攻值并排序
 *
 * @returns 按先攻值降序排列的行动者列表
 */
export function calculateInitiative(
  actors: InitiativeActor[],
  rng: () => number = Math.random,
): InitiativeActor[] {
  const withInitiative = actors.map((actor) => {
    const floatRange = 0.9 + rng() * 0.2;
    const initiative = actor.stats.速度 * floatRange + (actor.initiativeBonus ?? 0);
    return { ...actor, initiative };
  });

  return withInitiative.sort((a, b) => b.initiative - a.initiative);
}

/**
 * 获取当前回合的行动者索引
 */
export function getCurrentActorIndex(
  orderedActors: InitiativeActor[],
  currentRound: number,
): number {
  return (currentRound - 1) % orderedActors.length;
}
