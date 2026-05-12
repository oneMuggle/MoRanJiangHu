/**
 * 大富翁Panel.tsx — 大富翁地产决策面板
 *
 * 掷骰移动 → 地块购买/决策 → 资产结算
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { 大富翁状态, 大富翁地产 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import StatusBadge from '../shared/StatusBadge';

interface 大富翁PanelProps {
  state: 大富翁状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

const 地产颜色: Record<大富翁地产, string> = {
  '温泉旅馆': 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  '私人海滩': 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
  '豪华套房': 'border-purple-500/30 bg-purple-500/5 text-purple-400',
  '秘密花园': 'border-green-500/30 bg-green-500/5 text-green-400',
  '情侣包厢': 'border-pink-500/30 bg-pink-500/5 text-pink-400',
  '星空帐篷': 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
  '地下密室': 'border-gray-500/30 bg-gray-500/5 text-gray-400',
  '天台酒吧': 'border-orange-500/30 bg-orange-500/5 text-orange-400',
};

export const 大富翁Panel: React.FC<大富翁PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = useCallback(() => {
    if (!state || isRolling || isPaused) return;

    setIsRolling(true);

    const 操作: 玩家操作 = {
      type: '购买地块',
      payload: { 动作: '掷骰' },
      游戏类型: '大富翁',
    };

    const 结算 = executePlayerAction(操作, {
      紧张度: 40,
      当前回合: state.当前回合,
      总回合数: state.总回合数,
    });

    dispatch({
      type: '购买地块',
      payload: { 结算, 动作: '掷骰' },
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

    setTimeout(() => setIsRolling(false), 600);
  }, [state, isRolling, isPaused, dispatch, recordSettlement, pauseGame, onSettlement]);

  const ownedProperties = useMemo(() => state?.已购地产权 ?? [], [state?.已购地产权]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3">{'\u{1F3E0}'}</div>
        <div>大富翁游戏未开始</div>
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
        <span className="text-xs text-gray-500">回合 {state.当前回合}/{state.总回合数}</span>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">资产概览</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-center p-2 bg-green-500/5 rounded-lg border border-green-500/20">
            <div className="text-xs text-gray-500">你的资产</div>
            <div className="text-green-400 font-mono font-bold text-lg">{state.玩家资产}</div>
          </div>
          <div className="text-center p-2 bg-red-500/5 rounded-lg border border-red-500/20">
            <div className="text-xs text-gray-500">NPC资产</div>
            <div className="text-red-400 font-mono font-bold text-lg">{state.NPC资产}</div>
          </div>
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-5 text-center">
        <h3 className="text-sm font-serif text-wuxia-gold/70 mb-3">掷骰移动</h3>
        <button
          type="button"
          onClick={handleRoll}
          disabled={isRolling || isPaused}
          className="px-8 py-3 rounded-xl bg-wuxia-gold/80 hover:bg-wuxia-gold text-ink-black font-semibold transition-all disabled:opacity-50"
        >
          {isRolling ? '移动中...' : '掷骰子'}
        </button>
      </div>

      {ownedProperties.length > 0 && (
        <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
          <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">已购地产</h3>
          <div className="flex flex-wrap gap-2">
            {ownedProperties.map((prop, idx) => (
              <span key={idx} className={`px-3 py-1 rounded-lg border text-xs ${地产颜色[prop]}`}>
                {prop}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">NPC情绪</h3>
        <span className="text-sm text-wuxia-gold">{state.NPC情绪}</span>
      </div>
    </div>
  );
};

export default 大富翁Panel;
