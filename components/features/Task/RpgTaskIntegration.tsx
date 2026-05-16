/**
 * RpgTaskIntegration.tsx
 *
 * RPG 模式任务面板。显示当前任务列表，支持激活/停用任务追踪。
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import type { 任务结构 } from '../../../models/task';
import { IconTarget } from '../../ui/Icons';

interface Props {
  tasks: 任务结构[];
  onClose: () => void;
}

export const RpgTaskIntegration: React.FC<Props> = ({ tasks, onClose }) => {
  const { rpgActiveTaskIds, toggleTask } = useGameStore(
    useShallow((s) => ({
      rpgActiveTaskIds: s.rpgActiveTaskIds,
      toggleTask: s.toggleTask,
    }))
  );

  const [filter, setFilter] = useState<string>('全部');
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);

  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === '全部') return safeTasks;
    return safeTasks.filter((t) => t.类型 === filter);
  }, [safeTasks, filter]);

  const selectedTask = selectedIdx >= 0 && selectedIdx < filteredTasks.length
    ? filteredTasks[selectedIdx]
    : null;

  const handleToggle = useCallback((taskTitle: string) => {
    toggleTask(taskTitle);
  }, [toggleTask]);

  const getStatusTheme = (status: string) => {
    switch (status) {
      case '进行中': return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
      case '可提交': return { text: 'text-wuxia-gold', border: 'border-wuxia-gold/50', bg: 'bg-wuxia-gold/20' };
      case '已完成': return { text: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
      case '已失败': return { text: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10' };
      default: return { text: 'text-gray-500', border: 'border-gray-500/30', bg: 'bg-gray-500/10' };
    }
  };

  const activeCount = rpgActiveTaskIds.length;
  const types = useMemo(() => {
    const ts = new Set(safeTasks.map((t) => t.类型));
    return ['全部', ...Array.from(ts)];
  }, [safeTasks]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-ink-black/95 border border-wuxia-gold/20 w-full max-w-lg h-[70vh] flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-6 border-b border-wuxia-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-700/40 flex items-center justify-center text-cyan-400">
              <IconTarget size={16} />
            </div>
            <div>
              <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-wider">RPG 任务</h3>
              <div className="text-[10px] text-gray-500">追踪中 {activeCount}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-700 text-gray-400 hover:text-wuxia-red">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => { setFilter(t); setSelectedIdx(-1); }}
                className={`px-3 py-1 text-xs rounded border font-serif tracking-widest transition-all ${
                  filter === t
                    ? 'bg-wuxia-gold/20 text-wuxia-gold border-wuxia-gold/40'
                    : 'text-gray-500 border-gray-700 hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-2 mb-6">
            {filteredTasks.map((task, idx) => {
              const statusTheme = getStatusTheme(task.当前状态);
              const isTracked = rpgActiveTaskIds.includes(task.标题);
              const isSelected = idx === selectedIdx;
              return (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-wuxia-gold/40 bg-wuxia-gold/10'
                      : 'border-gray-800 bg-black/40 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-200 truncate">{task.标题}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-serif ${statusTheme.text} ${statusTheme.bg} ${statusTheme.border}`}>
                          {task.当前状态}
                        </span>
                        <span className="text-[10px] text-gray-500">{task.类型}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggle(task.标题); }}
                      className={`shrink-0 ml-2 px-2 py-1 text-[10px] rounded border font-serif tracking-wider transition-all ${
                        isTracked
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50 hover:bg-red-900/30 hover:text-red-400 hover:border-red-700/50'
                          : 'bg-gray-800/50 text-gray-500 border-gray-700 hover:text-wuxia-gold hover:border-wuxia-gold/40'
                      }`}
                    >
                      {isTracked ? '追踪中' : '追踪'}
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredTasks.length === 0 && (
              <div className="text-center text-gray-600 text-sm py-8 italic">暂无任务</div>
            )}
          </div>

          {/* Selected Task Detail */}
          {selectedTask && (
            <div className="border-t border-gray-800 pt-4">
              <div className="text-xs text-wuxia-gold/60 font-serif mb-2 tracking-wider">
                ── {selectedTask.标题} ──
              </div>
              <div className="p-3 rounded-lg border border-gray-700 bg-black/40">
                <div className="text-sm font-bold text-gray-200 mb-1">{selectedTask.标题}</div>
                <div className="text-xs text-gray-400 leading-relaxed mb-3">{selectedTask.描述}</div>
                {selectedTask.目标列表 && selectedTask.目标列表.length > 0 && (
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">目标</div>
                    {selectedTask.目标列表.map((obj, i) => (
                      <div key={i} className={`text-[10px] flex items-center gap-2 py-1 ${obj.完成状态 ? 'text-emerald-500 line-through' : 'text-gray-400'}`}>
                        <span className={`w-3 h-3 rounded-full border flex items-center justify-center text-[8px] ${
                          obj.完成状态 ? 'bg-emerald-600 border-emerald-500' : 'border-gray-600'
                        }`}>
                          {obj.完成状态 ? '✓' : ''}
                        </span>
                        <span className="flex-1">{obj.描述}</span>
                        <span className="text-gray-600">{obj.当前进度}/{obj.总需进度}</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTask.奖励描述 && selectedTask.奖励描述.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <div className="text-[10px] text-wuxia-gold/60 mb-1">奖励</div>
                    {selectedTask.奖励描述.map((r, i) => (
                      <div key={i} className="text-[10px] text-wuxia-gold/80">· {r}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
