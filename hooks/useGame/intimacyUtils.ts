import type { NPC结构 } from '@/models/social';
import type { 亲密互动类型, 属性奖励结构, 亲密互动记录 } from '@/models/intimacy';
import { 计算亲密度等级, 是否可触发互动, 获取可触发互动选项, 获取互动等级要求, 生成亲密互动记录, 生成双修奖励 } from '@/models/intimacy';

export function updateIntimacy(npc: NPC结构, delta: number): NPC结构 {
  const newFavor = Math.max(0, Math.min(100, npc.好感度 + delta));
  return { ...npc, 好感度: newFavor };
}

export function getIntimacyLevel(npc: NPC结构): number {
  return 计算亲密度等级(npc.好感度);
}

export function canTriggerIntimacy(npc: NPC结构, intimacyType: 亲密互动类型): boolean {
  const level = getIntimacyLevel(npc);
  const required = 获取互动等级要求(intimacyType);
  return 是否可触发互动(level, required);
}

export function getAvailableOptions(npc: NPC结构) {
  const level = getIntimacyLevel(npc);
  return 获取可触发互动选项(level);
}

export function createIntimacyRecord(
  npcId: string,
  type: 亲密互动类型,
  desc: string,
  reward?: 属性奖励结构
): 亲密互动记录 {
  return 生成亲密互动记录(npcId, type, desc, reward);
}

export { 计算亲密度等级, 生成双修奖励, 获取互动等级要求 };
export type { 亲密互动类型, 属性奖励结构, 亲密互动记录 };