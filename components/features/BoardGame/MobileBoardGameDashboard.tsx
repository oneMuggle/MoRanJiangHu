/**
 * MobileBoardGameDashboard.tsx — 桌游社交仪表盘 (移动端 Bottom Sheet)
 *
 * 移动端适配：全屏布局，垂直堆叠。
 */

import React, { useMemo } from 'react';
import { StatCard, GameTypeSelector } from './shared';
import type { 桌游状态, 桌游类型 } from '../../../models/boardGameNSFW/core';

interface MobileBoardGameDashboardProps {
  桌游状态: 桌游状态 | null;
  onClose: () => void;
  onStartGame: (type: 桌游类型) => void;
}

const MobileBoardGameDashboard: React.FC<MobileBoardGameDashboardProps> = ({ 桌游状态: boardGameState, onClose, onStartGame }) => {
  const stats = useMemo(() => {
    const history = boardGameState?.历史桌游记录 ?? [];
    return {
      totalGames: history.length,
      totalNSFW: history.reduce((sum, h) => sum + h.触发NSFW场景数, 0),
      uniqueNPCs: new Set(history.flatMap(h => h.参与NPC)).size,
      maxMilestones: history.reduce((max, h) => Math.max(max, h.里程碑.length), 0),
    };
  }, [boardGameState]);

  const 偏好列表 = useMemo(() => {
    return Object.entries(boardGameState?.桌游偏好 ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
  }, [boardGameState]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/50 backdrop-blur-sm">
      {/* 顶部关闭栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-wuxia-gold animate-pulse" />
          <span className="text-sm font-serif text-wuxia-gold font-bold">桌游</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 active:bg-white/10"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="场次" value={stats.totalGames} color="text-wuxia-gold" />
          <StatCard label="NSFW" value={stats.totalNSFW} color="text-pink-400" />
          <StatCard label="里程碑" value={stats.maxMilestones} color="text-purple-400" />
          <StatCard label="NPC" value={stats.uniqueNPCs} color="text-blue-400" />
        </div>

        {/* 游戏选择 */}
        <div>
          <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">开始新桌游</h3>
          <GameTypeSelector
            onSelect={onStartGame}
            history={boardGameState?.桌游偏好 ?? {}}
          />
        </div>

        {/* 历史简表 */}
        {(boardGameState?.历史桌游记录 ?? []).length > 0 && (
          <div>
            <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">最近记录</h3>
            <div className="space-y-2">
              {(boardGameState?.历史桌游记录 ?? []).slice(-3).reverse().map((record, idx) => (
                <div key={idx} className="text-xs bg-black/30 border border-gray-700/30 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-wuxia-gold/60">{record.类型}</span>
                    <span className="text-gray-500">{record.日期}</span>
                  </div>
                  <div className="text-gray-500 mt-1">{record.参与NPC.length}人参与 · NSFW {record.触发NSFW场景数}次</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 偏好 */}
        {偏好列表.length > 0 && (
          <div>
            <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">偏好</h3>
            <div className="space-y-1.5">
              {偏好列表.map(({ type, count }) => {
                const maxCount = 偏好列表[0]?.count ?? 1;
                return (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-gray-400">{type}</span>
                    <div className="flex-1 h-1 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-wuxia-gold/50 rounded-full"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-500 font-mono w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBoardGameDashboard;
