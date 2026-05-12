/**
 * 骰子游戏Panel.tsx — 骰子游戏 SLG 交互面板
 *
 * 策略选择 → 掷骰操作 → 引擎结算 → 叙事桥接 → 状态继承
 */

import React, { useCallback, useMemo, useState } from 'react';
import type { 骰子游戏状态, 骰子面类型 } from '../../../../models/boardGameNSFW/core';
import { executePlayerAction } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import type { 玩家操作 } from '../../../../hooks/useGame/boardGameNSFWEngine/core';
import { useBoardGameActions } from '../../../../hooks/useBoardGameActions';
import ActionButtons from '../shared/ActionButtons';
import ChoiceDialog from '../shared/ChoiceDialog';
import StatusBadge from '../shared/StatusBadge';
import type { ChoiceOption } from '../shared/ChoiceDialog';

interface 骰子游戏PanelProps {
  state: 骰子游戏状态 | null;
  onSettlement?: (result: { tensionDelta: number; nsfwTriggered: boolean; keyStep: boolean }) => void;
}

type 策略类型 = '保守' | '平衡' | '激进';

const 策略描述: Record<策略类型, string> = {
  保守: '偏向安全选项，降低触发高风险事件的概率，适合稳步推进。',
  平衡: '风险与收益均衡，随机性适中，适合大多数情况。',
  激进: '追求高风险高回报，更容易触发特殊事件和高等级效果。',
};

const 骰子面颜色: Record<骰子面类型, string> = {
  '轻抚': 'text-pink-400 border-pink-500/30 bg-pink-500/5',
  '亲吻': 'text-rose-400 border-rose-500/30 bg-rose-500/5',
  '拥抱': 'text-blue-400 border-blue-500/30 bg-blue-500/5',
  '低语': 'text-purple-400 border-purple-500/30 bg-purple-500/5',
  '脱衣': 'text-red-400 border-red-500/30 bg-red-500/5',
  '惩罚': 'text-orange-400 border-orange-500/30 bg-orange-500/5',
  '豁免': 'text-green-400 border-green-500/30 bg-green-500/5',
  '翻倍': 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
};

const 骰子图标: Record<骰子面类型, string> = {
  '轻抚': '✋',
  '亲吻': '💋',
  '拥抱': '🤗',
  '低语': '👂',
  '脱衣': '👗',
  '惩罚': '⚡',
  '豁免': '🛡️',
  '翻倍': '×2',
};

export const 骰子游戏Panel: React.FC<骰子游戏PanelProps> = ({ state, onSettlement }) => {
  const { dispatch, pauseGame, resumeGame, isPaused, pauseReason, recordSettlement } = useBoardGameActions();
  const [isRolling, setIsRolling] = useState(false);
  const [strategy, setStrategy] = useState<策略类型>('平衡');
  const [animatingDice, setAnimatingDice] = useState<number[]>([]);
  const [showStrategySelect, setShowStrategySelect] = useState(false);

  const recentResults = useMemo(() => {
    if (!state) return [];
    return state.历史投掷.slice(-12).reverse();
  }, [state]);

  const handleRoll = useCallback(() => {
    if (!state || isRolling || isPaused) return;

    setIsRolling(true);
    const diceCount = state.骰子数量;

    // 动画：依次翻转骰子
    const diceIndices = Array.from({ length: diceCount }, (_, i) => i);
    setAnimatingDice(diceIndices);

    // 构造玩家操作
    const 操作: 玩家操作 = {
      type: '掷骰',
      payload: {
        骰子数量: diceCount,
        策略: strategy,
        骰子面配置: state.骰子面配置,
      },
      游戏类型: '骰子游戏',
    };

    // 引擎结算
    const 结算 = executePlayerAction(操作, {
      紧张度: 0,
      当前回合: state.当前回合,
      总回合数: state.总回合数,
    });

    // 记录操作历史
    dispatch({
      type: '掷骰',
      payload: { 策略: strategy, 骰子数量: diceCount, 结算 },
    });

    // 记录结算结果
    recordSettlement({
      success: 结算.success,
      tensionDelta: 结算.tensionDelta,
      nsfwTriggered: 结算.nsfwTriggered,
      keyStep: 结算.keyStep,
      narrativeConstraint: 结算.narrativeConstraint,
      nextState: {},
    });

    // 关键步骤：暂停并推送叙事约束
    if (结算.keyStep && 结算.narrativeConstraint) {
      pauseGame('key-step');
    }

    // 回调通知上层
    onSettlement?.({
      tensionDelta: 结算.tensionDelta,
      nsfwTriggered: 结算.nsfwTriggered,
      keyStep: 结算.keyStep,
    });

    // 动画结束
    setTimeout(() => {
      setIsRolling(false);
      setAnimatingDice([]);
    }, 800);
  }, [state, isRolling, isPaused, strategy, dispatch, recordSettlement, pauseGame, onSettlement]);

  const handleStrategySelect = useCallback((id: string) => {
    setStrategy(id as 策略类型);
    setShowStrategySelect(false);
  }, []);

  const strategyOptions: ChoiceOption[] = useMemo(() =>
    (['保守', '平衡', '激进'] as 策略类型[]).map(s => ({
      id: s,
      label: s,
      risk: s === '保守' ? 'low' : s === '激进' ? 'high' : 'medium',
      consequence: 策略描述[s],
    })), []);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3"></div>
        <div>骰子游戏未初始化</div>
        <div className="text-xs text-gray-600 mt-1">请通过 AI 聊天开始骰子游戏</div>
      </div>
    );
  }

  // 暂停遮罩
  if (isPaused) {
    return (
      <div className="relative">
        <div className="bg-black/60 border border-yellow-500/30 rounded-xl p-6 text-center space-y-3">
          <StatusBadge status="paused" pauseReason={pauseReason === 'chat-sent' ? '等待回复' : pauseReason === 'key-step' ? '关键步骤' : '手动暂停'} />
          <p className="text-sm text-gray-400">
            {pauseReason === 'chat-sent' && '已发送消息，等待 AI 回复后继续...'}
            {pauseReason === 'key-step' && '剧情关键点，等待叙事推进...'}
            {pauseReason === 'player-pause' && '游戏已暂停'}
          </p>
          <button
            type="button"
            onClick={resumeGame}
            className="px-4 py-2 rounded-lg bg-wuxia-gold/80 hover:bg-wuxia-gold text-ink-black text-sm font-semibold transition-all"
          >
            继续游戏
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status="running" />
          <span className="text-xs text-gray-500">
            回合 {state.当前回合}/{state.总回合数}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowStrategySelect(!showStrategySelect)}
          className="text-xs text-gray-400 hover:text-wuxia-gold transition-colors"
        >
          当前策略: {strategy} ▾
        </button>
      </div>

      {/* 策略选择对话框 */}
      {showStrategySelect && (
        <ChoiceDialog
          title="选择策略"
          description="策略会影响骰子结果的分布和触发事件的类型"
          options={strategyOptions}
          onSelect={handleStrategySelect}
          onClose={() => setShowStrategySelect(false)}
        />
      )}

      {/* 投掷区域 */}
      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-5">
        <h3 className="text-sm font-serif text-wuxia-gold/70 mb-4">当前投掷</h3>

        {/* 骰子结果 */}
        <div className="flex items-center justify-center gap-3 mb-4 min-h-[64px]">
          {Array.from({ length: state.骰子数量 }, (_, i) => {
            const result = i === 0 ? state.最近投掷结果 : null;
            const isAnimating = animatingDice.includes(i);
            return (
              <div
                key={i}
                className={`w-16 h-16 flex items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                  isAnimating
                    ? 'border-wuxia-gold/50 bg-wuxia-gold/10 animate-bounce'
                    : result
                      ? `${骰子面颜色[result]} animate-pulse`
                      : 'border-gray-700/30 bg-black/40 text-gray-700'
                }`}
              >
                {isAnimating ? (
                  <span className="text-2xl animate-spin"></span>
                ) : result ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg">{骰子图标[result]}</span>
                    <span className="text-[10px]">{result}</span>
                  </div>
                ) : (
                  <span className="text-2xl">?</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 操作按钮 */}
        <ActionButtons
          layout="horizontal"
          buttons={[
            {
              id: 'roll',
              label: isRolling ? '投掷中...' : '掷骰子',
              variant: 'primary',
              disabled: isRolling || isPaused,
              loading: isRolling,
              icon: '',
              onClick: handleRoll,
            },
          ]}
        />
      </div>

      {/* 累积效应 */}
      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
        <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">累积效应</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-gray-500 text-xs">累积等级</div>
            <div className="text-wuxia-gold font-mono font-bold text-xl">{state.累计效应}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">连续相同</div>
            <div className="text-wuxia-gold font-mono font-bold text-xl">{state.连续相同面次数}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">最大等级</div>
            <div className="text-purple-400 font-mono font-bold text-xl">{state.最大累积等级}</div>
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      {recentResults.length > 0 && (
        <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
          <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">投掷历史</h3>
          <div className="flex flex-wrap gap-2">
            {recentResults.map((result, idx) => {
              const roundNum = state.当前回合 - (recentResults.length - 1 - idx);
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center px-2 py-1.5 rounded-lg border text-[10px] ${骰子面颜色[result]}`}
                >
                  <span className="text-gray-500">R{roundNum}</span>
                  <span className="font-medium">{result}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default 骰子游戏Panel;
