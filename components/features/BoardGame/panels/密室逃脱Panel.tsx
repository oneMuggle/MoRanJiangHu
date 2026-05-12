/**
 * 密室逃脱Panel.tsx — 密室逃脱路径选择面板
 *
 * 路径选择 → 属性检定 → 线索发现/意外事件
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { 密室逃脱状态, 密室主题 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import StatusBadge from '../shared/StatusBadge';

interface 密室逃脱PanelProps {
  state: 密室逃脱状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

const 主题图标: Record<密室主题, string> = {
  '古宅惊魂': '\u{1F3DA}',
  '古墓迷踪': '\u{1F3DB}',
  '末日地堡': '\u{1F6E0}',
  '魔法学院': '\u{26F0}',
  '医院密室': '\u{1F3E5}',
  '温泉旅馆': '\u{2668}',
};

interface PathChoice {
  id: string;
  label: string;
  desc: string;
  需求属性值: number;
  risk: 'low' | 'medium' | 'high';
}

const pathChoices: PathChoice[] = [
  { id: 'search', label: '仔细搜索', desc: '安全但缓慢，可能发现隐藏线索', 需求属性值: 3, risk: 'low' },
  { id: 'explore', label: '探索新路', desc: '风险与机遇并存', 需求属性值: 5, risk: 'medium' },
  { id: 'rush', label: '强行突破', desc: '高风险高回报，可能触发意外', 需求属性值: 8, risk: 'high' },
];

export const 密室逃脱Panel: React.FC<密室逃脱PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChoosePath = useCallback((choice: PathChoice) => {
    if (!state || isProcessing || isPaused) return;

    setIsProcessing(true);

    const 操作: 玩家操作 = {
      type: '选择路径',
      payload: { 需求属性值: choice.需求属性值, 路径: choice.id },
      游戏类型: '密室逃脱',
    };

    const 结算 = executePlayerAction(操作, {
      紧张度: 60,
      当前回合: state.已通关房间数,
      总回合数: state.总房间数,
    });

    dispatch({
      type: '选择路径',
      payload: { 路径: choice.id, 结算 },
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

  const progress = useMemo(() => {
    if (!state || state.总房间数 === 0) return 0;
    return Math.round((state.已通关房间数 / state.总房间数) * 100);
  }, [state]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3">{'\u{1F510}'}</div>
        <div>密室逃脱未开始</div>
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
          {主题图标[state.当前主题]} {state.当前主题}
        </span>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>通关进度</span>
          <span>{state.已通关房间数}/{state.总房间数} ({progress}%)</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div className="bg-wuxia-gold/60 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">选择行动</h3>
        <div className="space-y-2">
          {pathChoices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => handleChoosePath(choice)}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-xl border transition-all text-left disabled:opacity-50 ${
                choice.risk === 'low' ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/15' :
                choice.risk === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/15' :
                'border-red-500/30 bg-red-500/5 hover:bg-red-500/15'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-wuxia-gold/80">{choice.label}</div>
                  <div className="text-xs text-gray-400">{choice.desc}</div>
                </div>
                <span className="text-xs text-gray-500">需求: {choice.需求属性值}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">状态信息</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">NPC表现</span>
            <span className="ml-2 text-wuxia-gold">{state.NPC表现}</span>
          </div>
          <div>
            <span className="text-gray-500">逃脱成功率</span>
            <span className="ml-2 text-wuxia-gold font-mono">{state.逃脱成功率}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default 密室逃脱Panel;
