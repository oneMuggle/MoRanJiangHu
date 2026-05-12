/**
 * 骰子游戏Panel.tsx — 骰子游戏专属面板
 *
 * 展示骰子投掷结果、历史、累积效应。
 */

import React, { useMemo } from 'react';
import type { 骰子游戏状态, 骰子面类型 } from '../../../../models/boardGameNSFW/core';

interface 骰子游戏PanelProps {
  state: 骰子游戏状态 | null;
}

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

const 骰子游戏Panel: React.FC<骰子游戏PanelProps> = ({ state }) => {
  const recentResults = useMemo(() => {
    if (!state) return [];
    return state.历史投掷.slice(-10).reverse();
  }, [state]);

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-sm text-gray-500">
        <div className="text-4xl mb-3"></div>
        <div>骰子游戏未初始化</div>
        <div className="text-xs text-gray-600 mt-1">请通过 AI 聊天开始骰子游戏</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 投掷区域 */}
      <div className="bg-black/30 border border-gray-700/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-serif text-wuxia-gold/70">当前投掷</h3>
          <div className="text-xs text-gray-500">
            回合 {state.当前回合}/{state.总回合数}
          </div>
        </div>

        {/* 骰子结果 */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {Array.from({ length: state.骰子数量 }, (_, i) => {
            const result = i === 0 ? state.最近投掷结果 : null;
            return (
              <div
                key={i}
                className={`w-16 h-16 flex items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                  result
                    ? `${骰子面颜色[result]} animate-pulse`
                    : 'border-gray-700/30 bg-black/40 text-gray-700'
                }`}
              >
                {result ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">{result[0]}</span>
                    <span>{result}</span>
                  </div>
                ) : (
                  <span className="text-2xl">?</span>
                )}
              </div>
            );
          })}
        </div>

        {/* 累积效应 */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="text-center">
            <div className="text-gray-500">累积等级</div>
            <div className="text-wuxia-gold font-mono font-bold text-lg">{state.累计效应}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">连续相同</div>
            <div className="text-wuxia-gold font-mono font-bold text-lg">{state.连续相同面次数}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">最大等级</div>
            <div className="text-purple-400 font-mono font-bold text-lg">{state.最大累积等级}</div>
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      {recentResults.length > 0 && (
        <div className="bg-black/30 border border-gray-700/30 rounded-xl p-4">
          <h3 className="text-xs font-serif text-wuxia-gold/70 mb-3">投掷历史</h3>
          <div className="flex flex-wrap gap-2">
            {recentResults.map((result, idx) => (
              <div
                key={idx}
                className={`px-2 py-1 rounded-lg border text-[10px] ${骰子面颜色[result]}`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default 骰子游戏Panel;
