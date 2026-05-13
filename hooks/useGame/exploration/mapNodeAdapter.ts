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

/**
 * 将引擎状态转换为 UI 可用的地图数据。
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
  if (currentNodeId) {
    for (const p of allPaths) {
      if (p.from === currentNodeId) adjacentIds.add(p.to);
      if (p.to === currentNodeId) adjacentIds.add(p.from);
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

      return {
        id: node.id,
        name: node.name,
        type: engineTypeToUI[node.type] ?? '荒野',
        dangerLevel: dangerLevelToDots[node.dangerLevel] ?? 1,
        isExplored,
        isAdjacent,
        isCurrent,
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
