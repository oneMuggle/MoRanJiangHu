/**
 * 日常城镇地图 — 城镇区域节点图
 *
 * 管理区域节点之间的连接关系和可达性计算。
 */

import type { RegionNode, RegionState, TimeSlot } from '../../../models/dailyTown/regionNode';

export class TownGraph {
  private nodes: Map<string, RegionNode>;
  private states: Map<string, RegionState>;

  constructor(nodes: RegionNode[] = []) {
    this.nodes = new Map();
    this.states = new Map();
    nodes.forEach((node) => this.addNode(node));
  }

  addNode(node: RegionNode): void {
    this.nodes.set(node.id, { ...node });
    this.states.set(node.id, {
      visited: false,
      unlocked: true,
    });
  }

  getNode(id: string): RegionNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): RegionNode[] {
    return Array.from(this.nodes.values());
  }

  getConnectedRegions(regionId: string): RegionNode[] {
    const node = this.nodes.get(regionId);
    if (!node) return [];
    return node.connectedRegionIds
      .map((id) => this.nodes.get(id))
      .filter((n): n is RegionNode => n !== undefined);
  }

  isReachable(fromId: string, toId: string): boolean {
    const from = this.nodes.get(fromId);
    const to = this.nodes.get(toId);
    if (!from || !to) return false;
    return from.connectedRegionIds.includes(toId);
  }

  isAvailableAtTime(regionId: string, timeSlot: TimeSlot): boolean {
    const node = this.nodes.get(regionId);
    if (!node) return false;
    return node.availableTimeSlots.includes(timeSlot);
  }

  markVisited(regionId: string, turnNumber: number): void {
    const state = this.states.get(regionId);
    if (state) {
      this.states.set(regionId, {
        ...state,
        visited: true,
        lastVisitedTurn: turnNumber,
      });
    }
  }

  getState(regionId: string): RegionState | undefined {
    return this.states.get(regionId);
  }

  getAllStates(): Map<string, RegionState> {
    return new Map(this.states);
  }

  getMoveCost(fromId: string, toId: string): number {
    const to = this.nodes.get(toId);
    if (to?.moveCost !== undefined) return to.moveCost;
    return this.isReachable(fromId, toId) ? 1 : Infinity;
  }

  findPath(fromId: string, toId: string): string[] {
    if (fromId === toId) return [fromId];
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return [];

    const visited = new Set<string>();
    const queue: Array<{ current: string; path: string[] }> = [
      { current: fromId, path: [fromId] },
    ];

    while (queue.length > 0) {
      const { current, path } = queue.shift()!;
      if (current === toId) return path;

      if (visited.has(current)) continue;
      visited.add(current);

      const neighbors = this.getConnectedRegions(current);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          queue.push({ current: neighbor.id, path: [...path, neighbor.id] });
        }
      }
    }

    return [];
  }
}

export function createTownGraph(nodes?: RegionNode[]): TownGraph {
  return new TownGraph(nodes);
}
