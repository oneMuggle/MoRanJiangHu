import React from 'react';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import { MapExplorer } from './MapExplorer';
import { adaptMapData } from '../../../hooks/useGame/exploration/mapNodeAdapter';
import { 完整时段显示 } from '../../../hooks/useGame/exploration/timeOfDayUtils';

interface Props {
  onClose: () => void;
  onMove: (nodeId: string) => void;
  onExplore?: () => void;
  onRest?: () => void;
  onLazyInit?: () => void;
}

const MapExplorerModal: React.FC<Props> = ({ onClose, onMove, onExplore, onRest, onLazyInit }) => {
  const {
    explorationNodes,
    explorationPaths,
    explorationCurrentNodeId,
    explorationTimeOfDay,
    环境时间,
    角色银两,
  } = useGameStore(useShallow((s) => ({
    explorationNodes: s.explorationNodes,
    explorationPaths: s.explorationPaths,
    explorationCurrentNodeId: s.explorationCurrentNodeId,
    explorationTimeOfDay: s.explorationTimeOfDay,
    环境时间: (s as any).环境?.时间,
    角色银两: (s as any).角色?.金钱?.银子 ?? 0,
  })));

  const displayTime = 完整时段显示(环境时间) || explorationTimeOfDay;

  const adapted = adaptMapData(
    explorationNodes as any[],
    explorationPaths as Array<{ from: string; to: string; actionCost: number }>,
    explorationCurrentNodeId,
  );

  const handleMove = React.useCallback((nodeId: string) => {
    onMove(nodeId);
  }, [onMove]);

  // 安全网：Zustand 为空时触发懒加载初始化
  React.useEffect(() => {
    if (adapted.nodes.length === 0 && onLazyInit) {
      onLazyInit();
    }
  }, [onLazyInit, adapted.nodes.length]);

  if (adapted.nodes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
        <div className="max-w-3xl w-full mx-4 bg-gray-900 rounded-lg p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-gray-400">当前没有探索数据</p>
          <button className="mt-4 px-4 py-2 bg-wuxia-gold text-gray-900 rounded" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  return (
    <MapExplorer
      nodes={adapted.nodes}
      paths={adapted.paths}
      timeOfDay={displayTime}
      playerSilver={角色银两}
      onMove={handleMove}
      onExplore={onExplore}
      onRest={onRest}
      onClose={onClose}
    />
  );
};

export default MapExplorerModal;
