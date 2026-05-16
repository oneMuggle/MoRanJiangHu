/**
 * RpgSectIntegration.tsx
 *
 * RPG 模式门派面板。显示门派信息、贡献度、职位，支持加入/退出门派。
 */

import React, { useMemo } from 'react';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import type { 详细门派结构 } from '../../../models/sect';
import { 职位等级排序 } from '../../../models/sect';

interface Props {
  sectData: 详细门派结构 | null;
  onClose: () => void;
  onJoinSect?: (sectId: string) => void;
  onLeaveSect?: () => void;
}

export const RpgSectIntegration: React.FC<Props> = ({ sectData, onClose, onJoinSect, onLeaveSect }) => {
  const { rpgSectId, setRpgSect, setRpgSectContribution } = useGameStore(
    useShallow((s) => ({
      rpgSectId: s.rpgSectId,
      setRpgSect: s.setRpgSect,
      setRpgSectContribution: s.setRpgSectContribution,
    }))
  );

  const sect = useMemo(() => sectData ?? null, [sectData]);

  if (!sect) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="bg-ink-black/95 border border-wuxia-gold/20 w-full max-w-lg h-[50vh] flex flex-col rounded-2xl overflow-hidden">
          <div className="shrink-0 h-14 flex items-center justify-between px-6 border-b border-wuxia-gold/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3" />
                </svg>
              </div>
              <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-wider">RPG 门派</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-700 text-gray-400 hover:text-wuxia-red">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-500 font-serif">
            暂无门派信息
          </div>
        </div>
      </div>
    );
  }

  const currentLevel = 职位等级排序[sect.玩家职位] || 0;
  const rankEntries = Object.entries(职位等级排序).sort((a, b) => a[1] - b[1]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-ink-black/95 border border-wuxia-gold/20 w-full max-w-lg h-[70vh] flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-6 border-b border-wuxia-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-700/40 flex items-center justify-center text-emerald-400 font-serif font-bold text-sm">
              {sect.名称[0]}
            </div>
            <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-wider">{sect.名称}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-700 text-gray-400 hover:text-wuxia-red">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Player Info */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg border border-wuxia-gold/20 bg-black/40 text-center">
              <div className="text-[10px] text-gray-500 mb-1">职位</div>
              <div className="text-sm font-bold text-wuxia-cyan">{sect.玩家职位}</div>
            </div>
            <div className="p-3 rounded-lg border border-wuxia-gold/20 bg-black/40 text-center">
              <div className="text-[10px] text-gray-500 mb-1">贡献</div>
              <div className="text-sm font-bold text-wuxia-gold">{sect.玩家贡献}</div>
            </div>
            <div className="p-3 rounded-lg border border-wuxia-gold/20 bg-black/40 text-center">
              <div className="text-[10px] text-gray-500 mb-1">资源</div>
              <div className="text-xs text-gray-300">{sect.门派资金} / {sect.门派物资}</div>
            </div>
          </div>

          {/* Rank Progress */}
          <div className="mb-6">
            <div className="text-xs text-wuxia-gold/60 font-serif mb-2 tracking-wider">
              ── 晋升之路 ──
            </div>
            <div className="space-y-2">
              {rankEntries.map(([rank, lvl]) => {
                const isCurrent = rank === sect.玩家职位;
                const isPassed = lvl < currentLevel;
                return (
                  <div key={rank} className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                    isCurrent
                      ? 'border-wuxia-gold/40 bg-wuxia-gold/10'
                      : isPassed
                        ? 'border-gray-700/50 bg-gray-900/20 opacity-50'
                        : 'border-gray-800 bg-black/40'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border font-mono ${
                      isCurrent ? 'bg-wuxia-gold text-black border-wuxia-gold' :
                      isPassed ? 'bg-gray-700 text-gray-400 border-gray-600' : 'border-gray-600 text-gray-600'
                    }`}>
                      {lvl}
                    </div>
                    <span className={`text-sm font-serif ${isCurrent ? 'text-wuxia-gold font-bold' : 'text-gray-500'}`}>
                      {rank}
                    </span>
                    {isCurrent && <span className="text-[10px] text-wuxia-gold border border-wuxia-gold px-2 rounded ml-auto">当前</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks */}
          {sect.任务列表 && sect.任务列表.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-wuxia-gold/60 font-serif mb-2 tracking-wider">
                ── 任务布告 ({sect.任务列表.length}) ──
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sect.任务列表.slice(0, 5).map((mission) => {
                  const statusColor = mission.当前状态 === '可接取'
                    ? 'text-green-400 border-green-500/50 bg-green-500/10'
                    : mission.当前状态 === '进行中'
                      ? 'text-wuxia-gold border-wuxia-gold/50 bg-wuxia-gold/10'
                      : 'text-gray-500 border-gray-600 bg-gray-800/30';
                  return (
                    <div key={mission.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-800 bg-black/40">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-200 truncate">{mission.标题}</div>
                        <div className="text-[10px] text-gray-500">{mission.类型} · {mission.难度}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ml-2 font-serif ${statusColor}`}>
                        {mission.当前状态}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exchange */}
          {sect.兑换列表 && sect.兑换列表.length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-wuxia-gold/60 font-serif mb-2 tracking-wider">
                ── 藏经阁 ({sect.兑换列表.length}) ──
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sect.兑换列表.slice(0, 4).map((good) => (
                  <div key={good.id} className="p-2 rounded-lg border border-gray-800 bg-black/40">
                    <div className="text-sm text-gray-200 truncate">{good.物品名称}</div>
                    <div className="text-[10px] text-gray-500">{good.类型} · {good.要求职位}</div>
                    <div className="text-xs text-wuxia-gold font-mono">{good.兑换价格} 贡献</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            {onJoinSect && !rpgSectId && (
              <button
                onClick={() => { setRpgSect(sect.ID); setRpgSectContribution(sect.玩家贡献); }}
                className="flex-1 px-4 py-2 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-sm font-serif hover:bg-emerald-900/50 transition-colors"
              >
                加入门派
              </button>
            )}
            {onLeaveSect && rpgSectId && (
              <button
                onClick={() => { setRpgSect(null); setRpgSectContribution(0); }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 text-sm font-serif hover:bg-red-900/50 transition-colors"
              >
                退出门派
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
