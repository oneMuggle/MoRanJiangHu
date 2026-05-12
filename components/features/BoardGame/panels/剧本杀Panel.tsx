/**
 * 剧本杀Panel.tsx — 剧本杀线索搜索面板
 *
 * 搜索/审问 → 线索推理 → 情感线推进
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { 剧本杀状态 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import StatusBadge from '../shared/StatusBadge';

interface 剧本杀PanelProps {
  state: 剧本杀状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

interface SearchAction {
  id: string;
  label: string;
  icon: string;
  desc: string;
  type: '搜索' | '自定义';
}

const searchActions: SearchAction[] = [
  { id: 'search-room', label: '搜索房间', icon: '\u{1F50D}', desc: '仔细搜查当前房间的线索', type: '搜索' },
  { id: 'interrogate', label: '审问NPC', icon: '\u{1F4AC}', desc: '向NPC询问关键信息', type: '自定义' },
  { id: 'examine-body', label: '搜身检查', icon: '\u{1F44B}', desc: '对嫌疑人进行搜身', type: '自定义' },
  { id: 'exchange-secret', label: '交换秘密', icon: '\u{1F91D}', desc: '与NPC交换秘密信息', type: '自定义' },
];

export const 剧本杀Panel: React.FC<剧本杀PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = useCallback((action: SearchAction) => {
    if (!state || isProcessing || isPaused) return;

    setIsProcessing(true);

    const 操作: 玩家操作 = {
      type: action.type,
      payload: { 动作: action.id },
      游戏类型: '剧本杀',
    };

    const 结算 = executePlayerAction(操作, {
      紧张度: 45,
      当前回合: state.当前幕,
      总回合数: state.总幕数,
    });

    dispatch({
      type: action.type,
      payload: { 动作: action.id, 结算 },
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

  const actProgress = useMemo(() => {
    if (!state || state.总幕数 === 0) return 0;
    return Math.round((state.当前幕 / state.总幕数) * 100);
  }, [state]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3">{'\u{1F4DC}'}</div>
        <div>剧本杀未开始</div>
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
          {state.剧本名称 || '剧本杀'} | 第 {state.当前幕}/{state.总幕数} 幕
        </span>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>当前进度</span>
          <span>{actProgress}%</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div className="bg-wuxia-gold/60 h-2 rounded-full transition-all" style={{ width: `${actProgress}%` }} />
        </div>
      </div>

      <div className="bg-black/30 border border-pink-500/20 rounded-xl p-4">
        <h3 className="text-xs font-serif text-pink-400/70 mb-2">情感线</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-pink-400">{state.情感线进度}</span>
          {state.CP关系 && <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded">CP关系</span>}
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">行动选项</h3>
        <div className="grid grid-cols-2 gap-3">
          {searchActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleAction(action)}
              disabled={isProcessing}
              className="py-3 px-3 rounded-xl border border-gray-600/30 bg-gray-700/20 hover:border-wuxia-gold/50 transition-all text-left disabled:opacity-50"
            >
              <div className="text-lg mb-1">{action.icon}</div>
              <div className="text-sm text-wuxia-gold/80 font-semibold">{action.label}</div>
              <div className="text-xs text-gray-400">{action.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">特殊状态</h3>
        <div className="flex flex-wrap gap-2">
          {state.搜身发生 && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">已搜身</span>}
          {state.秘密交换发生 && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">已交换秘密</span>}
          <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded">模糊度: {state.剧本与现实模糊度}%</span>
        </div>
      </div>
    </div>
  );
};

export default 剧本杀Panel;
