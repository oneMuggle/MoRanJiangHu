import React, { useCallback } from 'react';
import type { MapNode, MapPath, NodeType } from './MapExplorer';

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

export const MobileMapExplorer: React.FC<Props> = ({
  nodes, paths: _paths, timeOfDay, playerSilver, onMove, onExplore, onRest, onClose,
}) => {
  const handleMove = useCallback((nodeId: string) => {
    onMove(nodeId);
  }, [onMove]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold text-wuxia-gold">大地图探索</h2>
        <button className="text-gray-400 hover:text-white text-xl" onClick={onClose}>×</button>
      </div>

      <div className="flex gap-3 px-4 py-2 text-xs flex-wrap border-b border-gray-800">
        <span className="text-gray-400">时段: {timeOfDay}</span>
        <span className="text-amber-400">银两: {playerSilver}</span>
      </div>

      {(onExplore || onRest) && (
        <div className="flex gap-2 px-4 py-2 border-b border-gray-800">
          {onExplore && (
            <button
              className="flex-1 px-3 py-2 rounded bg-emerald-900/60 border border-emerald-600 text-emerald-300 text-sm active:bg-emerald-800/60"
              onClick={onExplore}
            >
              探索此地
            </button>
          )}
          {onRest && (
            <button
              className="flex-1 px-3 py-2 rounded bg-blue-900/60 border border-blue-600 text-blue-300 text-sm active:bg-blue-800/60"
              onClick={onRest}
            >
              休息
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {nodes.filter((n) => n.isExplored).map((node) => {
          const colors = nodeTypeColors[node.type];
          const canMove = node.isAdjacent;
          return (
            <button
              key={node.id}
              className={`w-full p-3 rounded border text-left ${canMove ? `${colors.border} ${colors.bg} active:opacity-80` : 'border-gray-800 opacity-40'}`}
              onClick={() => canMove && handleMove(node.id)}
              disabled={!canMove}
            >
              <div className="flex items-center justify-between">
                <p className={`font-medium ${colors.label}`}>
                  {node.isCurrent && '📍 '}{node.name}
                </p>
                {node.isCurrent && <span className="text-xs text-yellow-400">当前位置</span>}
                {node.isAdjacent && !node.isCurrent && (
                  <span className="text-xs text-amber-400">
                    {node.estimatedTimeMinutes != null ? `预计 ${node.estimatedTimeMinutes} 分钟` : '可移动'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                危险等级: {Array.from({ length: node.dangerLevel }, (_, i) => (
                  <span key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mx-px" />
                ))}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
