/**
 * BoardGameModal.tsx — 桌游局 Modal (桌面端)
 *
 * 展示多人局状态：回合计数器、紧张度、玩家花名册、游戏专属面板、事件队列。
 */

import React from 'react';
import { TensionMeter, PlayerRoster, EventQueue, RoundCounter } from './shared';
import { 骰子游戏Panel } from './panels';
import type {
  多人局状态,
  桌游类型,
  桌游状态,
} from '../../../models/boardGameNSFW/core';

interface BoardGameModalProps {
  多人局: 多人局状态 | null;
  桌游类型: 桌游类型 | null;
  桌游状态: 桌游状态 | null;
  onClose: () => void;
}

const BoardGameModal: React.FC<BoardGameModalProps> = ({ 多人局, 桌游类型: gameType, 桌游状态: bgState, onClose }) => {
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
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[92vh] mx-4 bg-gray-900/95 border border-wuxia-gold/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-wuxia-gold animate-pulse" />
            <h2 className="text-base font-serif text-wuxia-gold font-bold tracking-wider">
              桌游局 {gameType && <span className="text-gray-400 font-normal">· {gameType}</span>}
            </h2>
          </div>
          <div className="text-[10px] text-gray-600 tracking-widest uppercase">GAME IN PROGRESS</div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* 状态栏 */}
        <div className="flex items-center gap-6 px-6 py-2 bg-black/20 border-b border-gray-700/20 shrink-0">
          <RoundCounter current={currentRound} total={totalRounds} />
          <div className="w-48">
            <TensionMeter value={tension} label="紧张度" />
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-gray-400">{players.filter(p => !p.出局).length}</span>/{players.length} 活跃
          </div>
        </div>

        {/* 玩家花名册 */}
        {players.length > 0 && (
          <div className="px-6 py-3 border-b border-gray-700/20 shrink-0">
            <PlayerRoster
              players={players}
              maxPlayers={多人局?.配置.最大人数 ?? 8}
              compact
              阵营映射={阵营分配}
            />
          </div>
        )}

        {/* 游戏类型专属面板 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderGamePanel()}
        </div>

        {/* 事件队列 */}
        {(pending.length > 0 || executed.length > 0) && (
          <div className="px-6 py-3 border-t border-gray-700/20 shrink-0 max-h-48 overflow-y-auto">
            <EventQueue pending={pending} executed={executed} maxVisible={3} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardGameModal;
