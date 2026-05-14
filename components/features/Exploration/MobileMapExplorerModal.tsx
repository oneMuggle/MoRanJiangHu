import React from 'react';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import { MobileMapExplorer } from './MobileMapExplorer';
import { adaptMapData } from '../../../hooks/useGame/exploration/mapNodeAdapter';
import { 完整时段显示 } from '../../../hooks/useGame/exploration/timeOfDayUtils';

interface Props {
  onClose: () => void;
  onMove: (nodeId: string) => void;
  onLazyInit?: () => void;
}

const MobileMapExplorerModal: React.FC<Props> = ({ onClose, onMove, onLazyInit }) => {
  const {
    explorationNodes,
    explorationPaths,
    explorationCurrentAp,
    explorationMaxAp,
    explorationCurrentNodeId,
    explorationTimeOfDay,
    环境时间,
  } = useGameStore(useShallow((s) => ({
    explorationNodes: s.explorationNodes,
    explorationPaths: s.explorationPaths,
    explorationCurrentAp: s.explorationCurrentAp,
    explorationMaxAp: s.explorationMaxAp,
    explorationCurrentNodeId: s.explorationCurrentNodeId,
    explorationTimeOfDay: s.explorationTimeOfDay,
    环境时间: (s as any).环境?.时间,
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
        <div className="w-full bg-gray-900 p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="text-gray-400">当前没有探索数据</p>
          <button className="mt-4 px-4 py-2 bg-wuxia-gold text-gray-900 rounded" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  return (
    <MobileMapExplorer
      nodes={adapted.nodes}
      paths={adapted.paths}
      currentActionPoints={explorationCurrentAp}
      maxActionPoints={explorationMaxAp}
      timeOfDay={displayTime}
      playerSilver={0}
      onMove={handleMove}
      onClose={onClose}
    />
  );
};

export default MobileMapExplorerModal;
