/**
 * mapNodeAdapter.ts
 *
 * 将 ExplorationEngine 内部的 MapNode / MapPath 转换为 UI 组件期望的数据格式。
 */

import type { MapNode as EngineMapNode } from '../../../models/exploration/mapNode';
import type { MapPath as EngineMapPath } from '../../../models/exploration/mapNode';
import type { MapNode as UIMapNode, MapPath as UIPath, NodeType } from '../../../components/features/Exploration/MapExplorer';

const engineTypeToUI: Record<EngineMapNode['type'], NodeType> = {
  sect: '门派',
  inn: '客栈',
  market: '市集',
  secret: '秘境',
  cave: '山洞',
  village: '村庄',
  town: '城镇',
  wilderness: '荒野',
};

const dangerLevelToDots: Record<EngineMapNode['dangerLevel'], number> = {
  safe: 1,
  low: 2,
  medium: 3,
  high: 4,
  deadly: 5,
};

/** 将引擎节点坐标映射到 SVG 画布 */
function computeLayoutXY(
  _node: EngineMapNode,
  index: number,
  total: number,
  isCurrent: boolean,
  isAdjacent: boolean,
): { x: number; y: number } {
  if (isCurrent) return { x: 50, y: 40 };

  const adjacentCount = total - 1;
  if (isAdjacent) {
    const angle = (2 * Math.PI * index) / adjacentCount - Math.PI / 2;
    return {
      x: 50 + 25 * Math.cos(angle),
      y: 40 + 15 * Math.sin(angle),
    };
  }

  return {
    x: 10 + ((index * 37) % 80),
    y: 5 + ((index * 53) % 25),
  };
}

export interface AdaptedMapData {
  nodes: UIMapNode[];
  paths: UIPath[];
}

/** 节点类型映射（与 explorationEngine._calculateTravelTime 保持一致，仅限 MapNodeType 包含的类型） */
const nodeTypeTimeMultipliers: Record<EngineMapNode['type'], number> = {
  wilderness: 1.5,
  cave: 1.3,
  secret: 2.0,
  village: 1.0,
  town: 0.8,
  market: 0.7,
  inn: 0.6,
  sect: 0.9,
};

const dangerTimeMultipliers: Record<EngineMapNode['dangerLevel'], number> = {
  safe: 0.8,
  low: 1.0,
  medium: 1.3,
  high: 1.6,
  deadly: 2.0,
};

/** 计算预计耗时（与 engine 端 _calculateTravelTime 一致） */
function calculateEstimatedTime(path: EngineMapPath, targetNode: EngineMapNode): number {
  const baseMinutes = path.actionCost * 10;
  const typeMultiplier = nodeTypeTimeMultipliers[targetNode.type] ?? 1.0;
  const dangerMultiplier = dangerTimeMultipliers[targetNode.dangerLevel] ?? 1.0;
  const minutes = Math.round(baseMinutes * typeMultiplier * dangerMultiplier);
  return Math.max(5, minutes);
}

/** 将引擎状态转换为 UI 可用的地图数据。
 * @param allNodes 引擎中所有节点
 * @param allPaths 引擎中所有路径
 * @param currentNodeId 玩家当前所在节点 ID
 */
export function adaptMapData(
  allNodes: EngineMapNode[],
  allPaths: EngineMapPath[],
  currentNodeId: string | null,
): AdaptedMapData {
  const adjacentIds = new Set<string>();
  const pathToAdjacent = new Map<string, EngineMapPath>();
  if (currentNodeId) {
    for (const p of allPaths) {
      if (p.from === currentNodeId) {
        adjacentIds.add(p.to);
        pathToAdjacent.set(p.to, p);
      }
      if (p.to === currentNodeId) {
        adjacentIds.add(p.from);
        pathToAdjacent.set(p.from, p);
      }
    }
  }

  const nodeMap = new Map<string, EngineMapNode>();
  for (const n of allNodes) nodeMap.set(n.id, n);

  const nodes: UIMapNode[] = allNodes
    .filter((n) => n.fowState !== 'hidden')
    .map((node, idx) => {
      const isCurrent = node.id === currentNodeId;
      const isAdjacent = adjacentIds.has(node.id);
      const isExplored = node.fowState === 'explored' || node.fowState === 'revealed';

      let estimatedTimeMinutes: number | undefined;
      if (isAdjacent && currentNodeId) {
        const path = pathToAdjacent.get(node.id);
        if (path) {
          estimatedTimeMinutes = calculateEstimatedTime(path, node);
        }
      }

      return {
        id: node.id,
        name: node.name,
        type: engineTypeToUI[node.type] ?? '荒野',
        dangerLevel: dangerLevelToDots[node.dangerLevel] ?? 1,
        isExplored,
        isAdjacent,
        isCurrent,
        estimatedTimeMinutes,
        ...computeLayoutXY(node, idx, allNodes.length, isCurrent, isAdjacent),
      };
    });

  const paths: UIPath[] = allPaths
    .filter((p) => {
      const fromNode = nodeMap.get(p.from);
      const toNode = nodeMap.get(p.to);
      return fromNode?.fowState !== 'hidden' && toNode?.fowState !== 'hidden';
    })
    .map((p) => ({
      from: p.from,
      to: p.to,
      isUnlocked: true,
    }));

  return { nodes, paths };
}
