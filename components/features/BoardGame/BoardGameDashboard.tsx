/**
 * BoardGameDashboard.tsx — 桌游社交仪表盘 (桌面端)
 *
 * 展示桌游统计、历史记录、偏好NPC、游戏类型选择器。
 * 数据源：校园系统.欲望系统.桌游状态
 */

import React, { useMemo } from 'react';
import { StatCard, GameTypeSelector } from './shared';
import type { 桌游状态, 桌游类型 } from '../../../models/boardGameNSFW/core';

interface BoardGameDashboardProps {
  桌游状态: 桌游状态 | null;
  onClose: () => void;
  onStartGame: (type: 桌游类型) => void;
}

const BoardGameDashboard: React.FC<BoardGameDashboardProps> = ({ 桌游状态: boardGameState, onClose, onStartGame }) => {
  const stats = useMemo(() => {
    const history = boardGameState?.历史桌游记录 ?? [];
    const totalGames = history.length;
    const totalNSFW = history.reduce((sum, h) => sum + h.触发NSFW场景数, 0);
    const allNPCs = new Set<string>();
    history.forEach(h => h.参与NPC.forEach(npc => allNPCs.add(npc)));
    const uniqueNPCs = allNPCs.size;
    const maxMilestones = history.reduce((max, h) => {
      return h.里程碑.length > max ? h.里程碑.length : max;
    }, 0);

    return { totalGames, totalNSFW, uniqueNPCs, maxMilestones };
  }, [boardGameState]);

  const 偏好列表 = useMemo(() => {
    const 偏好 = boardGameState?.桌游偏好 ?? {};
    return Object.entries(偏好)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }, [boardGameState]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-gray-900/95 border border-wuxia-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-wuxia-gold animate-pulse" />
            <h2 className="text-lg font-serif text-wuxia-gold font-bold tracking-wider">桌游社交仪表盘</h2>
          </div>
          <div className="text-[10px] text-gray-600 tracking-widest uppercase">BOARD GAME</div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="总场次" value={stats.totalGames} color="text-wuxia-gold" />
            <StatCard label="NSFW触发" value={stats.totalNSFW} color="text-pink-400" />
            <StatCard label="最高里程碑" value={stats.maxMilestones} color="text-purple-400" />
            <StatCard label="偏好NPC" value={stats.uniqueNPCs} color="text-blue-400" />
          </div>

          {/* 游戏类型选择器 */}
          <div>
            <h3 className="text-sm font-serif text-wuxia-gold/70 mb-3">选择游戏类型</h3>
            <GameTypeSelector
              onSelect={onStartGame}
              history={boardGameState?.桌游偏好 ?? {}}
            />
          </div>

          {/* 历史记录 & 偏好 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 历史记录 */}
            <div>
              <h3 className="text-sm font-serif text-wuxia-gold/70 mb-2">历史记录</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(boardGameState?.历史桌游记录 ?? []).length === 0 ? (
                  <div className="text-xs text-gray-600 text-center py-6">暂无历史记录</div>
                ) : (
                  (boardGameState?.历史桌游记录 ?? []).slice().reverse().map((record, idx) => (
                    <details key={idx} className="text-xs bg-black/30 border border-gray-700/30 rounded-lg overflow-hidden">
                      <summary className="px-3 py-2 cursor-pointer hover:bg-white/5 text-gray-300">
                        <span className="text-wuxia-gold/60 mr-2">{record.类型}</span>
                        <span className="text-gray-500">{record.日期}</span>
                        <span className="ml-auto text-gray-600">{record.参与NPC.length}人</span>
                      </summary>
                      <div className="px-3 pb-2 text-gray-500 space-y-1">
                        <div>参与: {record.参与NPC.join(', ')}</div>
                        <div>NSFW: {record.触发NSFW场景数} 次</div>
                        {record.里程碑.length > 0 && (
                          <div>里程碑: {record.里程碑.join(' → ')}</div>
                        )}
                      </div>
                    </details>
                  ))
                )}
              </div>
            </div>

            {/* 游戏偏好 */}
            <div>
              <h3 className="text-sm font-serif text-wuxia-gold/70 mb-2">游戏偏好</h3>
              {偏好列表.length === 0 ? (
                <div className="text-xs text-gray-600 text-center py-6">暂无偏好数据</div>
              ) : (
                <div className="space-y-2">
                  {偏好列表.map(({ type, count }) => {
                    const maxCount = 偏好列表[0]?.count ?? 1;
                    return (
                      <div key={type} className="flex items-center gap-3 text-xs">
                        <span className="w-24 text-gray-400">{type}</span>
                        <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-wuxia-gold/50 rounded-full transition-all"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-500 font-mono w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardGameDashboard;
