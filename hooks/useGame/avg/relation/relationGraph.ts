/**
 * AVG 关系图谱 — 有向图实现
 *
 * NPC 关系图谱：节点 = NPC，边 = 关系（带好感度/信任度/亲密度权重）。
 */

import type {
  RelationEdge,
  RelationGraphData,
  NpcRelationSummary,
  IntimacyLevel,
  RelationGraphChange,
  ChangeType,
} from '../../../../models/avg/relationGraph';
import { INTIMACY_THRESHOLDS } from '../../../../models/avg/relationGraph';

export class RelationGraph {
  private _nodes: Set<string>;
  private _edges: Map<string, RelationEdge>; // key: `${fromNpcId}->${toNpcId}`
  private _changes: RelationGraphChange[];

  constructor(data?: RelationGraphData) {
    this._nodes = new Set(data?.npcIds ?? []);
    this._edges = new Map();
    this._changes = [];

    if (data?.edges) {
      for (const edge of data.edges) {
        this._nodes.add(edge.fromNpcId);
        this._nodes.add(edge.toNpcId);
        this._edges.set(this._edgeKey(edge.fromNpcId, edge.toNpcId), { ...edge });
      }
    }
  }

  // ==================== 节点操作 ====================

  addNode(npcId: string): void {
    if (!this._nodes.has(npcId)) {
      this._nodes.add(npcId);
      this._recordChange('node_add', `添加 NPC: ${npcId}`);
    }
  }

  removeNode(npcId: string): void {
    if (this._nodes.has(npcId)) {
      this._nodes.delete(npcId);
      const keysToRemove: string[] = [];
      for (const [key, edge] of this._edges) {
        if (edge.fromNpcId === npcId || edge.toNpcId === npcId) {
          keysToRemove.push(key);
        }
      }
      for (const key of keysToRemove) {
        this._edges.delete(key);
      }
      this._recordChange('node_remove', `移除 NPC: ${npcId}`);
    }
  }

  hasNode(npcId: string): boolean {
    return this._nodes.has(npcId);
  }

  getNodeCount(): number {
    return this._nodes.size;
  }

  getAllNpcIds(): string[] {
    return Array.from(this._nodes);
  }

  // ==================== 边操作 ====================

  addEdge(edge: RelationEdge): void {
    this._nodes.add(edge.fromNpcId);
    this._nodes.add(edge.toNpcId);
    const key = this._edgeKey(edge.fromNpcId, edge.toNpcId);
    const exists = this._edges.has(key);
    this._edges.set(key, { ...edge });
    this._recordChange(exists ? 'edge_update' : 'edge_add', `关系边: ${edge.fromNpcId} -> ${edge.toNpcId}`);
  }

  removeEdge(fromNpcId: string, toNpcId: string): void {
    const key = this._edgeKey(fromNpcId, toNpcId);
    if (this._edges.delete(key)) {
      this._recordChange('edge_remove', `移除关系边: ${fromNpcId} -> ${toNpcId}`);
    }
  }

  getEdge(fromNpcId: string, toNpcId: string): RelationEdge | null {
    return this._edges.get(this._edgeKey(fromNpcId, toNpcId)) ?? null;
  }

  getEdgesFrom(npcId: string): RelationEdge[] {
    const result: RelationEdge[] = [];
    for (const edge of this._edges.values()) {
      if (edge.fromNpcId === npcId) result.push({ ...edge });
    }
    return result;
  }

  getEdgesTo(npcId: string): RelationEdge[] {
    const result: RelationEdge[] = [];
    for (const edge of this._edges.values()) {
      if (edge.toNpcId === npcId) result.push({ ...edge });
    }
    return result;
  }

  getEdgeCount(): number {
    return this._edges.size;
  }

  // ==================== 好感度查询 ====================

  getIntimacy(fromNpcId: string, toNpcId: string): number {
    const edge = this.getEdge(fromNpcId, toNpcId);
    return edge?.intimacy ?? 0;
  }

  getLevel(fromNpcId: string, toNpcId: string): IntimacyLevel {
    const intimacy = this.getIntimacy(fromNpcId, toNpcId);
    return this.intimacyToLevel(intimacy);
  }

  getSummary(npcId: string): NpcRelationSummary[] {
    const edges = this.getEdgesFrom(npcId);
    return edges.map((edge) => ({
      npcId: edge.toNpcId,
      intimacy: edge.intimacy,
      level: this.intimacyToLevel(edge.intimacy),
      relationType: edge.relationType,
      trust: edge.trust,
      closeness: edge.closeness,
    }));
  }

  // ==================== 好感度更新 ====================

  updateIntimacy(fromNpcId: string, toNpcId: string, delta: number): { newIntimacy: number; levelChanged: boolean; oldLevel: IntimacyLevel; newLevel: IntimacyLevel } {
    const key = this._edgeKey(fromNpcId, toNpcId);
    const existing = this._edges.get(key);

    if (!existing) {
      this.addEdge({
        fromNpcId,
        toNpcId,
        relationType: 'stranger',
        intimacy: Math.max(0, delta),
        trust: 0,
        closeness: 0,
      });
      return {
        newIntimacy: Math.max(0, delta),
        levelChanged: true,
        oldLevel: 0,
        newLevel: this.intimacyToLevel(Math.max(0, delta)),
      };
    }

    const oldLevel = this.intimacyToLevel(existing.intimacy);
    const newIntimacy = Math.max(0, existing.intimacy + delta);
    const newLevel = this.intimacyToLevel(newIntimacy);

    this._edges.set(key, {
      ...existing,
      intimacy: newIntimacy,
    });
    this._recordChange('edge_update', `好感度变更: ${fromNpcId} -> ${toNpcId}, ${existing.intimacy} → ${newIntimacy}`);

    return {
      newIntimacy,
      levelChanged: oldLevel !== newLevel,
      oldLevel,
      newLevel,
    };
  }

  updateTrust(fromNpcId: string, toNpcId: string, delta: number): number {
    const key = this._edgeKey(fromNpcId, toNpcId);
    const existing = this._edges.get(key);
    if (!existing) return 0;

    const newTrust = Math.max(0, Math.min(100, existing.trust + delta));
    this._edges.set(key, { ...existing, trust: newTrust });
    return newTrust;
  }

  updateCloseness(fromNpcId: string, toNpcId: string, delta: number): number {
    const key = this._edgeKey(fromNpcId, toNpcId);
    const existing = this._edges.get(key);
    if (!existing) return 0;

    const newCloseness = Math.max(0, Math.min(100, existing.closeness + delta));
    this._edges.set(key, { ...existing, closeness: newCloseness });
    return newCloseness;
  }

  // ==================== 序列化 ====================

  toJSON(): RelationGraphData {
    return {
      npcIds: this.getAllNpcIds(),
      edges: Array.from(this._edges.values()),
    };
  }

  static fromJSON(data: RelationGraphData): RelationGraph {
    return new RelationGraph(data);
  }

  // ==================== 变更历史 ====================

  getChanges(): ReadonlyArray<RelationGraphChange> {
    return this._changes;
  }

  clearChanges(): void {
    this._changes = [];
  }

  // ==================== 内部辅助 ====================

  private _edgeKey(from: string, to: string): string {
    return `${from}->${to}`;
  }

  private intimacyToLevel(intimacy: number): IntimacyLevel {
    if (intimacy >= INTIMACY_THRESHOLDS[5]) return 5;
    if (intimacy >= INTIMACY_THRESHOLDS[4]) return 4;
    if (intimacy >= INTIMACY_THRESHOLDS[3]) return 3;
    if (intimacy >= INTIMACY_THRESHOLDS[2]) return 2;
    if (intimacy >= INTIMACY_THRESHOLDS[1]) return 1;
    return 0;
  }

  private _recordChange(type: ChangeType, details: string): void {
    this._changes.push({ type, details });
  }
}

export function createRelationGraph(data?: RelationGraphData): RelationGraph {
  return new RelationGraph(data);
}
