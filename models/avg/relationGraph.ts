/**
 * AVG 关系图谱 — 数据模型
 */

/** 关系类型 */
export type RelationType =
  | 'stranger'      // 陌生人
  | 'acquaintance'  // 认识
  | 'familiar'      // 熟悉
  | 'friend'        // 好友
  | 'close_friend'  // 挚友
  | 'lover'         // 恋人
  | 'rival'         // 对手
  | 'enemy'         // 敌人
  | 'master'        // 师徒
  | 'sect_member';  // 同门

/** 好感度等级 */
export type IntimacyLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** 好感度等级描述 */
export const INTIMACY_LEVEL_LABELS: Record<IntimacyLevel, string> = {
  0: '陌生人',
  1: '认识',
  2: '熟悉',
  3: '好友',
  4: '挚友',
  5: '恋人',
};

/** 好感度阈值（对应等级） */
export const INTIMACY_THRESHOLDS: Record<number, number> = {
  0: 0,
  1: 20,
  2: 50,
  3: 80,
  4: 120,
  5: 160,
};

/** 关系边定义 */
export interface RelationEdge {
  fromNpcId: string;
  toNpcId: string;
  relationType: RelationType;
  intimacy: number;       // 好感度数值 (0-200+)
  trust: number;          // 信任度 (0-100)
  closeness: number;      // 亲密度 (0-100)
  notes?: string;         // 备注
}

/** 关系图谱 */
export interface RelationGraphData {
  npcIds: string[];
  edges: RelationEdge[];
}

/** NPC 关系摘要 */
export interface NpcRelationSummary {
  npcId: string;
  intimacy: number;
  level: IntimacyLevel;
  relationType: RelationType;
  trust: number;
  closeness: number;
}

/** 好感度变更 */
export interface IntimacyChange {
  npcId: string;
  delta: number;
  reason: string;
  newIntimacy: number;
  levelChanged: boolean;
  oldLevel: IntimacyLevel;
  newLevel: IntimacyLevel;
}

/** 关系图谱变更 */
export type ChangeType = 'edge_add' | 'edge_remove' | 'edge_update' | 'node_add' | 'node_remove';

export interface RelationGraphChange {
  type: ChangeType;
  details: string;
}
