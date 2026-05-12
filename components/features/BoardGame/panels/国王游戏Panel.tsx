/**
 * 国王游戏Panel.tsx — 国王命令回应面板
 *
 * 玩家面对国王命令时选择：服从 / 协商 / 反抗
 */

import React, { useCallback, useState } from 'react';
import type { 派对游戏状态 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import StatusBadge from '../shared/StatusBadge';

interface 国王游戏PanelProps {
  state: 派对游戏状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

interface ResponseOption {
  id: '服从' | '协商' | '反抗';
  label: string;
  icon: string;
  desc: string;
  riskLevel: 'low' | 'medium' | 'high';
  color: string;
}

const responseOptions: ResponseOption[] = [
  { id: '服从', label: '服从', icon: '\u{1F44C}', desc: '顺从命令，紧张度增长较低', riskLevel: 'low', color: 'border-green-500/30 bg-green-500/5 hover:bg-green-500/15 text-green-400' },
  { id: '协商', label: '协商', icon: '\u{1F91D}', desc: '尝试协商修改命令，中等紧张度', riskLevel: 'medium', color: 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-400' },
  { id: '反抗', label: '反抗', icon: '\u{26A1}', desc: '拒绝服从，紧张度大幅上升但可能触发关键剧情', riskLevel: 'high', color: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400' },
];

export const 国王游戏Panel: React.FC<国王游戏PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [lastResponse, setLastResponse] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResponse = useCallback((response: '服从' | '协商' | '反抗') => {
    if (!state || isProcessing || isPaused) return;

    setIsProcessing(true);
    setLastResponse(response);

    const 操作: 玩家操作 = {
      type: '回应命令',
      payload: { 回应: response },
      游戏类型: '国王游戏',
    };

    const 结算 = executePlayerAction(操作, {
      紧张度: state.紧张氛围,
      当前回合: state.当前回合,
      总回合数: 12,
    });

    dispatch({
      type: '回应命令',
      payload: { 回应: response, 结算 },
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
        <div className="text-4xl mb-3">{'\u{1F451}'}</div>
        <div>国王游戏未开始</div>
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

      {lastResponse && (
        <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4 text-center">
          <span className="text-sm text-gray-400">你的回应：</span>
          <span className="font-semibold text-wuxia-gold">{lastResponse}</span>
        </div>
      )}

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-6 text-center space-y-4">
        <h3 className="text-lg font-serif text-wuxia-gold/70">国王的命令已下</h3>
        <p className="text-xs text-gray-500">你必须做出选择，每个回应都会影响剧情走向</p>

        <div className="space-y-3 mt-4">
          {responseOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleResponse(opt.id)}
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-xl border-2 transition-all disabled:opacity-50 text-left ${opt.color}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.desc}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  opt.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                  opt.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {opt.riskLevel === 'low' ? '低风险' : opt.riskLevel === 'medium' ? '中风险' : '高风险'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-2">局势信息</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">紧张氛围</span>
            <span className="ml-2 text-wuxia-gold font-mono">{Math.round(state.紧张氛围)}%</span>
          </div>
          <div>
            <span className="text-gray-500">参与人数</span>
            <span className="ml-2 text-wuxia-gold font-mono">{state.参与人数}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default 国王游戏Panel;
