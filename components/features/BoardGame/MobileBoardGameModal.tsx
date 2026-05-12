/**
 * MobileBoardGameModal.tsx — 桌游局 Modal (移动端 Bottom Sheet)
 */

import React from 'react';
import { TensionMeter, PlayerRoster, EventQueue, RoundCounter } from './shared';
import { 骰子游戏Panel } from './panels';
import type {
  多人局状态,
  桌游类型,
  桌游状态,
} from '../../../models/boardGameNSFW/core';

interface MobileBoardGameModalProps {
  多人局: 多人局状态 | null;
  桌游类型: 桌游类型 | null;
  桌游状态: 桌游状态 | null;
  onClose: () => void;
}

const MobileBoardGameModal: React.FC<MobileBoardGameModalProps> = ({ 多人局, 桌游类型: gameType, 桌游状态: bgState, onClose }) => {
  const pending = 多人局?.待处理事件 ?? [];
  const executed = 多人局?.已执行事件 ?? [];
  const players = 多人局?.参与NPC ?? [];
  const 阵营分配 = 多人局?.阵营分配 ?? {};
  const currentRound = 多人局?.当前回合 ?? 1;
  const totalRounds = 多人局?.总回合数 ?? 12;

  const tension = pending.length > 0
    ? Math.max(...pending.map(e => e.紧张度))
    : 0;

  const renderGamePanel = () => {
    switch (gameType) {
      case '骰子游戏': {
        const diceState = bgState?.当前桌游 as import('../../../models/boardGameNSFW/core').骰子游戏状态 | null;
        return <骰子游戏Panel state={diceState} />;
      }
      default:
        return (
          <div className="text-center text-sm text-gray-500 py-8">
            {gameType ? `${gameType} 面板开发中` : '请选择游戏类型'}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex flex-col bg-black/50 backdrop-blur-sm">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-wuxia-gold animate-pulse" />
          <span className="text-sm font-serif text-wuxia-gold font-bold">
            桌游局{gameType && ` · ${gameType}`}
          </span>
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

      {/* 状态栏 */}
      <div className="flex items-center gap-4 px-4 py-2 bg-black/20 border-b border-gray-700/20 shrink-0">
        <RoundCounter current={currentRound} total={totalRounds} />
        <div className="text-xs text-gray-500 shrink-0">
          <span className="text-gray-400">{players.filter(p => !p.出局).length}</span>/{players.length}
        </div>
      </div>

      {/* 紧张度 */}
      {tension > 0 && (
        <div className="px-4 py-2 border-b border-gray-700/20 shrink-0">
          <TensionMeter value={tension} label="紧张度" />
        </div>
      )}

      {/* 玩家花名册 */}
      {players.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-700/20 shrink-0">
          <PlayerRoster
            players={players}
            maxPlayers={多人局?.配置.最大人数 ?? 8}
            compact
            阵营映射={阵营分配}
          />
        </div>
      )}

      {/* 游戏面板 */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {renderGamePanel()}
      </div>

      {/* 事件队列 */}
      {(pending.length > 0 || executed.length > 0) && (
        <div className="px-4 py-2 border-t border-gray-700/20 shrink-0 max-h-40 overflow-y-auto">
          <EventQueue pending={pending} executed={executed} maxVisible={2} />
        </div>
      )}
    </div>
  );
};

export default MobileBoardGameModal;
