import { 标准化单个NPC, 合并同名NPC列表 } from './npcNormalization';

export function 规范化社交列表(list: any[], options?: { 合并同名?: boolean }): any[] {
  if (!Array.isArray(list)) return [];
  const normalized = list.map((npc, index) => 标准化单个NPC(npc, index));
  if (options?.合并同名 === false) return normalized;
  return 合并同名NPC列表(normalized);
}
