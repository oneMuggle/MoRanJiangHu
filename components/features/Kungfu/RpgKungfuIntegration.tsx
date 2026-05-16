/**
 * RpgKungfuIntegration.tsx
 *
 * RPG 模式武功面板。显示已学功法列表，支持激活/停用功法。
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import type { 角色数据结构 } from '../../../models/character';
import { getRarityStyles, getRarityNameClass } from '../../ui/rarityStyles';
import { IconScroll } from '../../ui/Icons';

interface Props {
  character: 角色数据结构;
  onClose: () => void;
}

export const RpgKungfuIntegration: React.FC<Props> = ({ character, onClose }) => {
  const { rpgActiveKungfuIds, toggleKungfu } = useGameStore(
    useShallow((s) => ({
      rpgActiveKungfuIds: s.rpgActiveKungfuIds,
      toggleKungfu: s.toggleKungfu,
    }))
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('全部');

  const skills = useMemo(() => character.功法列表 ?? [], [character.功法列表]);

  const categories = useMemo(() => {
    const cats = new Set(skills.map((s) => s.类型));
    return ['全部', ...Array.from(cats)];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    if (filter === '全部') return skills;
    return skills.filter((s) => s.类型 === filter);
  }, [skills, filter]);

  const selectedSkill = useMemo(
    () => skills.find((s) => s.ID === selectedId) ?? null,
    [skills, selectedId]
  );

  const handleToggle = useCallback((id: string) => {
    toggleKungfu(id);
  }, [toggleKungfu]);

  const activeCount = rpgActiveKungfuIds.length;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-ink-black/95 border border-wuxia-gold/20 w-full max-w-lg h-[70vh] flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-6 border-b border-wuxia-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-700/40 flex items-center justify-center text-amber-400">
              <IconScroll size={16} />
            </div>
            <div>
              <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-wider">RPG 功法</h3>
              <div className="text-[10px] text-gray-500">已激活 {activeCount}/3</div>
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
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 text-xs rounded border font-serif tracking-widest transition-all ${
                  filter === cat
                    ? 'bg-wuxia-gold/20 text-wuxia-gold border-wuxia-gold/40'
                    : 'text-gray-500 border-gray-700 hover:text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Skill List */}
          <div className="space-y-2 mb-6">
            {filteredSkills.map((skill) => {
              const isActive = rpgActiveKungfuIds.includes(skill.ID);
              const styles = getRarityStyles(skill.品质);
              return (
                <div
                  key={skill.ID}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                    isActive
                      ? `${styles.border} ${styles.bg} bg-opacity-10`
                      : 'border-gray-800 bg-black/40 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedId(skill.ID)}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${getRarityNameClass(skill.品质)}`}>
                      {skill.名称}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {skill.类型} · {skill.品质} · 第 {skill.当前重数} 重
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggle(skill.ID); }}
                    className={`shrink-0 px-2 py-1 text-[10px] rounded border font-serif tracking-wider transition-all ${
                      isActive
                        ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50 hover:bg-red-900/30 hover:text-red-400 hover:border-red-700/50'
                        : 'bg-gray-800/50 text-gray-500 border-gray-700 hover:text-wuxia-gold hover:border-wuxia-gold/40'
                    }`}
                  >
                    {isActive ? '已激活' : '激活'}
                  </button>
                </div>
              );
            })}
            {filteredSkills.length === 0 && (
              <div className="text-center text-gray-600 text-sm py-8 italic">暂无功法</div>
            )}
          </div>

          {/* Selected Skill Detail */}
          {selectedSkill && (
            <div className="border-t border-gray-800 pt-4">
              <div className="text-xs text-wuxia-gold/60 font-serif mb-2 tracking-wider">
                ── {selectedSkill.名称} ──
              </div>
              <div className={`p-3 rounded-lg border bg-black/40 ${getRarityStyles(selectedSkill.品质).border}`}>
                <div className={`text-sm font-bold mb-2 ${getRarityNameClass(selectedSkill.品质)}`}>
                  {selectedSkill.名称}
                </div>
                <div className="text-xs text-gray-400 leading-relaxed mb-2">{selectedSkill.描述}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                  <div>熟练度: {selectedSkill.当前熟练度}/{selectedSkill.升级经验}</div>
                  <div>重数: {selectedSkill.当前重数}/{selectedSkill.最高重数}</div>
                  <div>伤害: {selectedSkill.基础伤害}</div>
                  <div>类型: {selectedSkill.伤害类型}</div>
                </div>
                {selectedSkill.被动修正 && selectedSkill.被动修正.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <div className="text-[10px] text-emerald-500/60 mb-1">被动修正</div>
                    {selectedSkill.被动修正.map((mod, i) => (
                      <div key={i} className="text-[10px] text-gray-400">
                        {mod.属性名} {mod.数值 > 0 ? '+' : ''}{mod.数值}{mod.类型 === '百分比' ? '%' : ''}
                      </div>
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
