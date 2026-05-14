import React, { useMemo, useCallback } from 'react';

export type NodeType = '门派' | '客栈' | '市集' | '秘境' | '山洞' | '村庄' | '城镇' | '荒野';

export interface MapNode {
  id: string;
  name: string;
  type: NodeType;
  dangerLevel: number;
  isExplored: boolean;
  isAdjacent: boolean;
  isCurrent: boolean;
  x: number;
  y: number;
  estimatedTimeMinutes?: number;
}

export interface MapPath {
  from: string;
  to: string;
  isUnlocked: boolean;
}

interface Props {
  nodes: MapNode[];
  paths: MapPath[];
  timeOfDay: string;
  playerSilver: number;
  onMove: (nodeId: string) => void;
  onExplore?: () => void;
  onRest?: () => void;
  onClose: () => void;
}

const nodeTypeColors: Record<NodeType, { bg: string; border: string; label: string }> = {
  '门派': { bg: 'bg-purple-900/60', border: 'border-purple-500', label: 'text-purple-300' },
  '客栈': { bg: 'bg-amber-900/60', border: 'border-amber-500', label: 'text-amber-300' },
  '市集': { bg: 'bg-yellow-900/60', border: 'border-yellow-500', label: 'text-yellow-300' },
  '秘境': { bg: 'bg-cyan-900/60', border: 'border-cyan-500', label: 'text-cyan-300' },
  '山洞': { bg: 'bg-stone-900/60', border: 'border-stone-500', label: 'text-stone-300' },
  '村庄': { bg: 'bg-green-900/60', border: 'border-green-500', label: 'text-green-300' },
  '城镇': { bg: 'bg-blue-900/60', border: 'border-blue-500', label: 'text-blue-300' },
  '荒野': { bg: 'bg-red-900/60', border: 'border-red-500', label: 'text-red-300' },
};

const dangerDots = (level: number) => Array.from({ length: 5 }, (_, i) => (
  <span key={i} className={`inline-block w-2 h-2 rounded-full mx-px ${i < level ? 'bg-red-500' : 'bg-gray-700'}`} />
));

export const MapExplorer: React.FC<Props> = ({
  nodes, paths, timeOfDay, playerSilver, onMove, onExplore, onRest, onClose,
}) => {
  const nodeMap = useMemo(() => {
    const map = new Map<string, MapNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const handleClick = useCallback((nodeId: string) => {
    onMove(nodeId);
  }, [onMove]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="max-w-3xl w-full mx-4 bg-gray-900 rounded-lg p-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-wuxia-gold">大地图探索</h2>
          <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
        </div>

        <div className="flex gap-4 mb-4 text-sm flex-wrap">
          <span className="text-gray-400">时段: <span className="text-white">{timeOfDay}</span></span>
          <span className="text-gray-400">银两: <span className="text-amber-400">{playerSilver}</span></span>
        </div>

        {(onExplore || onRest) && (
          <div className="flex gap-2 mb-4">
            {onExplore && (
              <button
                className="px-3 py-1.5 rounded bg-emerald-900/60 border border-emerald-600 text-emerald-300 text-sm hover:bg-emerald-800/60 transition-colors"
                onClick={onExplore}
              >
                探索此地
              </button>
            )}
            {onRest && (
              <button
                className="px-3 py-1.5 rounded bg-blue-900/60 border border-blue-600 text-blue-300 text-sm hover:bg-blue-800/60 transition-colors"
                onClick={onRest}
              >
                休息
              </button>
            )}
          </div>
        )}

        {/* Map SVG */}
        <div className="relative w-full" style={{ paddingBottom: '60%' }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60">
            {paths.map((path, i) => {
              const from = nodeMap.get(path.from);
              const to = nodeMap.get(path.to);
              if (!from || !to) return null;
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={path.isUnlocked ? '#6b7280' : '#374151'}
                  strokeWidth={0.3}
                  strokeDasharray={path.isUnlocked ? undefined : '1,1'}
                />
              );
            })}
            {nodes.map((node) => {
              const canMove = node.isAdjacent;
              if (!node.isExplored) {
                return (
                  <g key={node.id}>
                    <circle cx={node.x} cy={node.y} r={3} fill="#374151" opacity={0.5} />
                    <text x={node.x} y={node.y + 0.5} textAnchor="middle" fill="#6b7280" fontSize={2}>???</text>
                  </g>
                );
              }
              return (
                <g
                  key={node.id}
                  className={canMove ? 'cursor-pointer' : ''}
                  onClick={() => canMove && handleClick(node.id)}
                >
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.isCurrent ? 4 : 3}
                    fill={node.isCurrent ? '#f59e0b' : node.isAdjacent ? '#4b5563' : '#374151'}
                    stroke={node.isCurrent ? '#fbbf24' : node.isAdjacent ? '#9ca3af' : '#4b5563'}
                    strokeWidth={node.isCurrent ? 0.5 : 0.3}
                  />
                  <text x={node.x} y={node.y + 0.4} textAnchor="middle" fill="#e5e7eb" fontSize={1.8}>
                    {node.name}
                  </text>
                  {node.isCurrent && (
                    <text x={node.x} y={node.y - 0.5} textAnchor="middle" fill="#fbbf24" fontSize={1.5}>
                      你在此
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node list */}
        <div className="mt-4 border-t border-gray-800 pt-3">
          <h3 className="text-sm font-bold text-gray-400 mb-2">可到达区域</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {nodes.filter((n) => n.isExplored).map((node) => {
              const colors = nodeTypeColors[node.type];
              const canMove = node.isAdjacent;
              return (
                <button
                  key={node.id}
                  className={`p-2 rounded border text-left ${canMove ? `${colors.border} ${colors.bg} hover:opacity-80` : 'border-gray-800 opacity-40'}`}
                  onClick={() => canMove && handleClick(node.id)}
                  disabled={!canMove}
                >
                  <p className={`text-sm font-medium ${colors.label}`}>
                    {node.isCurrent && '📍 '}{node.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    危险: {dangerDots(node.dangerLevel)}
                    {node.estimatedTimeMinutes != null && (
                      <span className="ml-2 text-amber-400">预计 {node.estimatedTimeMinutes} 分钟</span>
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
