/**
 * 真心话大冒险Panel.tsx — 真心话/大冒险选择面板
 */

import React, { useCallback, useState } from 'react';
import type { 派对游戏状态 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import StatusBadge from '../shared/StatusBadge';

interface 真心话大冒险PanelProps {
  state: 派对游戏状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

export const 真心话大冒险Panel: React.FC<真心话大冒险PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [lastChoice, setLastChoice] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChoice = useCallback((choice: '真心话' | '大冒险') => {
    if (!state || isProcessing || isPaused) return;

    setIsProcessing(true);
    setLastChoice(choice);

    const 操作: 玩家操作 = {
      type: '选择真心话大冒险',
      payload: { 选择: choice },
      游戏类型: '真心话大冒险',
    };

    const 结算 = executePlayerAction(操作, {
      紧张度: state.紧张氛围,
      当前回合: state.当前回合,
      总回合数: 12,
    });

    dispatch({
      type: '选择真心话大冒险',
      payload: { 选择: choice, 结算 },
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

  const handleTruth = useCallback(() => handleChoice('真心话'), [handleChoice]);
  const handleDare = useCallback(() => handleChoice('大冒险'), [handleChoice]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3">&#x1F3AD;</div>
        <div>真心话大冒险未开始</div>
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
        <span className="text-xs text-gray-500">回合 {state.当前回合}</span>
      </div>

      {lastChoice && (
        <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4 text-center">
          <span className="text-sm text-gray-400">上轮选择：</span>
          <span className={`font-semibold ${lastChoice === '大冒险' ? 'text-red-400' : 'text-blue-400'}`}>
            {lastChoice}
          </span>
        </div>
      )}

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-6 text-center space-y-4">
        <h3 className="text-lg font-serif text-wuxia-gold/70">选择你的行动</h3>
        <p className="text-xs text-gray-500">真心话相对安全，大冒险更具刺激性但也更危险</p>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            type="button"
            onClick={handleTruth}
            disabled={isProcessing}
            className="py-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/15 transition-all disabled:opacity-50"
          >
            <div className="text-2xl mb-1">&#x1F4AC;</div>
            <div className="text-blue-400 font-semibold">真心话</div>
            <div className="text-xs text-gray-500 mt-1">较低紧张度</div>
          </button>

          <button
            type="button"
            onClick={handleDare}
            disabled={isProcessing}
            className="py-4 rounded-xl border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500/15 transition-all disabled:opacity-50"
          >
            <div className="text-2xl mb-1">&#x1F525;</div>
            <div className="text-red-400 font-semibold">大冒险</div>
            <div className="text-xs text-gray-500 mt-1">更高紧张度</div>
          </button>
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">参与信息</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">参与人数</span>
            <span className="ml-2 text-wuxia-gold font-mono">{state.参与人数}</span>
          </div>
          <div>
            <span className="text-gray-500">酒后状态</span>
            <span className="ml-2 text-wuxia-gold font-mono">{state.酒后状态 ? '已饮酒' : '清醒'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default 真心话大冒险Panel;
