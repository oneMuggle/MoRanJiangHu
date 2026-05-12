/**
 * 棋牌游戏Panel.tsx — 棋牌游戏出牌面板
 *
 * 选牌出牌 → 胜负判定 → Bluff心理战
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { 棋牌游戏状态, 棋牌游戏子类型 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import StatusBadge from '../shared/StatusBadge';

interface 棋牌游戏PanelProps {
  state: 棋牌游戏状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

const 子类型图标: Record<棋牌游戏子类型, string> = {
  '扑克': '\u{1F0CF}',
  '麻将': '\u{1F004}',
  '象棋': '\u{265F}',
  '自创卡牌': '\u{1F0A1}',
};

export const 棋牌游戏Panel: React.FC<棋牌游戏PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlayCard = useCallback((card: string, bluff: boolean = false) => {
    if (!state || isProcessing || isPaused) return;

    setIsProcessing(true);
    setSelectedCard(card);

    const 操作: 玩家操作 = {
      type: '出牌',
      payload: { 牌: card, bluff },
      游戏类型: '棋牌游戏',
    };

    const 结算 = executePlayerAction(操作, {
      紧张度: 40,
      当前回合: state.当前轮次,
      总回合数: state.总轮次,
    });

    dispatch({
      type: '出牌',
      payload: { 牌: card, bluff, 结算 },
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

    setTimeout(() => {
      setIsProcessing(false);
      setSelectedCard(null);
    }, 500);
  }, [state, isProcessing, isPaused, dispatch, recordSettlement, pauseGame, onSettlement]);

  const handleBluff = useCallback(() => {
    if (state && state.玩家手牌.length > 0) {
      handlePlayCard(state.玩家手牌[0], true);
    }
  }, [state, handlePlayCard]);

  const winRate = useMemo(() => {
    if (!state || state.总轮次 === 0) return 0;
    return Math.round((state.玩家胜局 / state.总轮次) * 100);
  }, [state]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3">{子类型图标['扑克']}</div>
        <div>棋牌游戏未开始</div>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <StatusBadge status="running" />
        <span className="text-xs text-gray-500">
          {子类型图标[state.游戏子类型]} {state.游戏子类型} | 轮次 {state.当前轮次}/{state.总轮次}
        </span>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <div className="text-xs text-gray-500">胜</div>
            <div className="text-green-400 font-mono font-bold">{state.玩家胜局}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">胜率</div>
            <div className="text-wuxia-gold font-mono font-bold">{winRate}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">心理战</div>
            <div className="text-purple-400 font-mono font-bold">{state.已使用Bluff次数}</div>
          </div>
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">你的手牌</h3>
        <div className="flex flex-wrap gap-2">
          {state.玩家手牌.map((card, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePlayCard(card)}
              disabled={isProcessing}
              className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                selectedCard === card
                  ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold'
                  : 'border-gray-600/30 bg-gray-700/20 text-gray-300 hover:border-wuxia-gold/50'
              } disabled:opacity-50`}
            >
              {card}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4 text-center">
        <button
          type="button"
          onClick={handleBluff}
          disabled={isProcessing || state.玩家手牌.length === 0}
          className="px-6 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm font-semibold transition-all disabled:opacity-50"
        >
          虚张声势 (Bluff)
        </button>
        <p className="text-xs text-gray-500 mt-1">欺骗对手，但被抓到会有惩罚</p>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">心理战阶段</h3>
        <span className={`text-sm font-semibold ${
          state.心理战阶段 === '试探' ? 'text-blue-400' :
          state.心理战阶段 === '博弈' ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {state.心理战阶段}
        </span>
      </div>
    </div>
  );
};

export default 棋牌游戏Panel;
