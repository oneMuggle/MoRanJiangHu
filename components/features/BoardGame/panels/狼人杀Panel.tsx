/**
 * 狼人杀Panel.tsx — 狼人杀夜间行动/白天投票面板
 *
 * 夜间选择 → 白天投票 → 阵营胜负判定
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { 狼人杀状态 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import StatusBadge from '../shared/StatusBadge';

interface 狼人杀PanelProps {
  state: 狼人杀状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

const 角色图标: Record<string, string> = {
  '狼人': '\u{1F43A}',
  '预言家': '\u{1F52E}',
  '女巫': '\u{1F9EA}',
  '猎人': '\u{1F52B}',
  '平民': '\u{1F464}',
  '守卫': '\u{1F6E1}',
};

export const 狼人杀Panel: React.FC<狼人杀PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [isProcessing, setIsProcessing] = useState(false);

  const isNightPhase = useMemo(() => (state?.当前轮次 ?? 1) % 2 === 1, [state?.当前轮次]);

  const handleAction = useCallback((target: string, phase: '夜间' | '白天') => {
    if (!state || isProcessing || isPaused) return;

    setIsProcessing(true);

    const 操作: 玩家操作 = {
      type: '投票',
      payload: { 阶段: phase, 目标: target },
      游戏类型: '狼人杀',
    };

    const 结算 = executePlayerAction(操作, {
      紧张度: 50,
      当前回合: state.当前轮次,
      总回合数: 12,
    });

    dispatch({
      type: '投票',
      payload: { 阶段: phase, 目标: target, 结算 },
    });

    recordSettlement({
      success: 结算.success,
      tensionDelta: 结算.tensionDelta,
      nsfwTriggered: 结算.nsfwTriggered,
      keyStep: 结算.keyStep,
      narrativeConstraint: 结算.narrativeConstraint,
      nextState: {},
    });

    if (结算.keyStep && 结算.narrativeConstraint) {
      pauseGame('key-step');
    }

    onSettlement?.({
      tensionDelta: 结算.tensionDelta,
      nsfwTriggered: 结算.nsfwTriggered,
      keyStep: 结算.keyStep,
    });

    setTimeout(() => setIsProcessing(false), 500);
  }, [state, isProcessing, isPaused, dispatch, recordSettlement, pauseGame, onSettlement]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3">{'\u{1F43A}'}</div>
        <div>狼人杀未开始</div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="bg-black/60 border border-yellow-500/30 rounded-xl p-6 text-center space-y-3">
        <StatusBadge status="paused" pauseReason={pauseReason === 'chat-sent' ? '等待回复' : pauseReason === 'key-step' ? '关键步骤' : '手动暂停'} />
        <p className="text-sm text-gray-400">
          {pauseReason === 'key-step' && '剧情关键点，等待叙事推进...'}
        </p>
        <button type="button" onClick={resumeGame} className="px-4 py-2 rounded-lg bg-wuxia-gold/80 hover:bg-wuxia-gold text-ink-black text-sm font-semibold transition-all">
          继续游戏
        </button>
      </div>
    );
  }

  const players = ['玩家A', '玩家B', '玩家C', '玩家D'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <StatusBadge status="running" />
        <span className="text-xs text-gray-500">
          {角色图标[state.NPC角色]} {state.NPC角色} | 轮次 {state.当前轮次}
        </span>
      </div>

      {state.游戏结果 !== '进行中' && (
        <div className={`p-4 rounded-xl border text-center ${
          state.游戏结果 === '好人胜利'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <div className="text-lg font-bold">{state.游戏结果}</div>
        </div>
      )}

      <div className={`p-3 rounded-xl border text-center ${
        isNightPhase
          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      }`}>
        <span className="text-sm font-semibold">
          {isNightPhase ? '\u{1F319} 夜间阶段' : '☀\u{FE0F} 白天阶段'}
        </span>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">
          {isNightPhase ? '夜间行动' : '白天投票'}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {players.map((player) => (
            <button
              key={player}
              type="button"
              onClick={() => handleAction(player, isNightPhase ? '夜间' : '白天')}
              disabled={isProcessing || state.已出局玩家.includes(player)}
              className="py-2 px-3 rounded-lg border border-gray-600/30 bg-gray-700/20 hover:border-wuxia-gold/50 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {state.已出局玩家.includes(player) ? `${player} (出局)` : player}
            </button>
          ))}
        </div>
      </div>

      {state.私下结盟发生 && state.结盟NPC && (
        <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
          <h3 className="text-xs font-serif text-purple-400/70 mb-2">私下结盟</h3>
          <p className="text-sm text-purple-400">
            与 {state.结盟NPC} 建立了联盟
          </p>
        </div>
      )}

      {state.已出局玩家.length > 0 && (
        <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
          <h3 className="text-xs font-serif text-gray-400/70 mb-2">已出局</h3>
          <div className="flex flex-wrap gap-2">
            {state.已出局玩家.map((p, idx) => (
              <span key={idx} className="text-xs text-gray-500 line-through">{p}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default 狼人杀Panel;
