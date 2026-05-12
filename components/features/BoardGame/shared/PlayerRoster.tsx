import React from 'react';
import type { 多人局参与者 } from '../../../../models/boardGameNSFW/core';

interface PlayerRosterProps {
  players: 多人局参与者[];
  maxPlayers?: number;
  compact?: boolean;
  /** 阵营映射：{ [参与者id]: 阵营名称 }，来自 多人局状态.阵营分配 */
  阵营映射?: Record<string, string>;
}

const 阵营颜色: Record<string, string> = {
  '好人': 'border-blue-500/50 bg-blue-500/5',
  '狼人': 'border-red-500/50 bg-red-500/5',
  '中立': 'border-yellow-500/50 bg-yellow-500/5',
  '默认': 'border-gray-500/30 bg-gray-500/5',
};

const PlayerRoster: React.FC<PlayerRosterProps> = ({ players, maxPlayers = 8, compact = false, 阵营映射 }) => {
  const slots = Array.from({ length: maxPlayers }, (_, i) => players[i] || null);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {slots.map((player, idx) => {
          const 阵营 = (player && 阵营映射?.[player.id]) ?? '默认';
          return (
          <div
            key={idx}
            className={`px-2 py-1 rounded-lg border text-xs ${
              player
                ? `${阵营颜色[阵营]} ${player.出局 ? 'opacity-40 line-through' : ''}`
                : 'border-dashed border-gray-600/30 text-gray-600'
            }`}
          >
            {player ? player.姓名 : `空位${idx + 1}`}
          </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {slots.map((player, idx) => {
        const 阵营 = (player && 阵营映射?.[player.id]) ?? '默认';
        return (
        <div
          key={idx}
          className={`p-3 rounded-lg border transition-all ${
            player
              ? `${阵营颜色[阵营]} ${player.出局 ? 'opacity-40' : 'hover:border-wuxia-gold/30'}`
              : 'border-dashed border-gray-600/30'
          }`}
        >
          <div className="text-sm font-serif text-gray-300">
            {player ? player.姓名 : `空位 ${idx + 1}`}
          </div>
          {player && (
            <>
              <div className="text-[10px] text-gray-500 mt-0.5">{player.欲望阶段}</div>
              {player.出局 && (
                <div className="text-[10px] text-red-400/70 mt-0.5">已出局</div>
              )}
            </>
          )}
        </div>
        );
      })}
    </div>
  );
};

export default PlayerRoster;
