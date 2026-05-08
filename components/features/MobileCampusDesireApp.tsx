// 移动端欲望仪表盘 — 紧凑版校园 NSFW 状态卡片

import React, { useMemo } from 'react';
import type { NPC欲望档案, 欲望阶段, 关系轨道, 后果记录 } from '../../models/campusNSFW';

// ==================== 常量 ====================

const 欲望阶段颜色: Record<欲望阶段, string> = {
  '克制': 'text-blue-400',
  '试探': 'text-cyan-400',
  '渴望': 'text-pink-400',
  '沉沦': 'text-red-400',
  '支配': 'text-purple-400',
};

const 关系轨道颜色: Record<关系轨道, string> = {
  '纯爱': 'text-emerald-400',
  '暧昧': 'text-yellow-400',
  '肉体': 'text-red-400',
  '支配': 'text-purple-400',
  '多角': 'text-orange-400',
};

// ==================== 子组件 ====================

interface MiniBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

const MiniBar: React.FC<MiniBarProps> = ({ label, value, max = 100, color = 'bg-wuxia-gold' }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-gray-500 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-500 font-mono w-6 text-right">{value}</span>
    </div>
  );
};

interface NPCDesireCardProps {
  npcName: string;
  档案: NPC欲望档案;
  未解决后果数: number;
}

const MobileNPCDesireCard: React.FC<NPCDesireCardProps> = ({ npcName, 档案, 未解决后果数 }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 active:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black/60 border border-wuxia-gold/30 flex items-center justify-center text-sm font-serif text-wuxia-gold/60">
            {npcName[0]}
          </div>
          <div className="text-left">
            <div className="font-serif text-wuxia-gold text-sm">{npcName}</div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] ${欲望阶段颜色[档案.当前阶段]}`}>
                {档案.当前阶段}
              </span>
              <span className="text-gray-700">|</span>
              <span className={`text-[10px] ${关系轨道颜色[档案.关系轨道]}`}>
                {档案.关系轨道}
              </span>
              {未解决后果数 > 0 && (
                <span className="text-[9px] text-red-500 bg-red-500/10 px-1 rounded">
                  {未解决后果数}后果
                </span>
              )}
            </div>
          </div>
        </div>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
          {/* 欲望进度 */}
          <MiniBar
            label="欲望"
            value={档案.阶段进度}
            color={档案.阶段进度 >= 80 ? 'bg-red-500' : 'bg-wuxia-gold'}
          />

          {/* 暴露风险 */}
          <MiniBar
            label="暴露"
            value={档案.暴露风险值}
            color={档案.暴露风险值 >= 70 ? 'bg-red-600' : 档案.暴露风险值 >= 40 ? 'bg-orange-500' : 'bg-green-500'}
          />

          {/* 流言等级 */}
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-gray-600">流言:</span>
            {[0, 1, 2, 3, 4].map(i => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full text-[6px] flex items-center justify-center ${
                  i < 档案.流言等级 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-gray-800 text-gray-700'
                }`}
              >
                {i < 档案.流言等级 ? '●' : '○'}
              </span>
            ))}
          </div>

          {/* 扩展状态 (v1.1+) */}
          {档案.露出状态 && (
            <MiniBar
              label="露出"
              value={档案.露出状态.当前等级 * 20}
              color="bg-pink-500"
            />
          )}

          {档案.紧张度状态 && (
            <MiniBar
              label="紧张"
              value={档案.紧张度状态.当前值}
              color={档案.紧张度状态.当前值 >= 80 ? 'bg-red-600' : 'bg-orange-400'}
            />
          )}

          {档案.权力天平 && (
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-gray-600 w-12">权力</span>
              <span className={`font-mono ${档案.权力天平.当前值 < 0 ? 'text-purple-400' : 'text-blue-400'}`}>
                {档案.权力天平.当前值 > 0 ? '+' : ''}{档案.权力天平.当前值}
              </span>
            </div>
          )}

          {档案.服从度 && (
            <MiniBar
              label="服从"
              value={档案.服从度.当前值}
              color="bg-indigo-500"
            />
          )}

          {/* 冷却提示 */}
          {档案.互动冷却期 > 0 && (
            <div className="text-[10px] text-gray-600">冷却中 {档案.互动冷却期} 回合</div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 主组件 ====================

interface Props {
  NPC欲望档案: Record<string, NPC欲望档案>;
  后果列表: 后果记录[];
  NPC姓名映射: Record<string, string>;
  onClose: () => void;
}

export const MobileCampusDesireApp: React.FC<Props> = ({
  NPC欲望档案,
  后果列表,
  NPC姓名映射,
  onClose,
}) => {
  const npcIds = Object.keys(NPC欲望档案);

  const 未解决后果计数 = useMemo(() => {
    const map: Record<string, number> = {};
    后果列表.filter(c => !c.是否已解决).forEach(c => {
      if (c.关联NPC) {
        map[c.关联NPC] = (map[c.关联NPC] || 0) + 1;
      }
    });
    return map;
  }, [后果列表]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="h-12 shrink-0 border-b border-white/10 bg-black/80 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-wuxia-red animate-pulse" />
          <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-[0.2em]">欲望仪表盘</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 active:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/5 bg-black/30">
        <div className="text-center">
          <div className="text-[9px] text-gray-600">NPC</div>
          <div className="text-lg font-serif text-wuxia-gold">{npcIds.length}</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-gray-600">后果</div>
          <div className={`text-lg font-serif ${npcIds.some(id => 未解决后果计数[id]) ? 'text-red-500' : 'text-gray-600'}`}>
            {npcIds.reduce((sum, id) => sum + (未解决后果计数[id] || 0), 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-gray-600">暴露</div>
          <div className="text-lg font-serif text-red-400">
            {npcIds.reduce((s, id) => s + (NPC欲望档案[id]?.已暴露次数 || 0), 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-gray-600">最高</div>
          <div className="text-lg font-serif text-pink-400">
            {npcIds.some(id => NPC欲望档案[id]?.当前阶段 === '支配') ? '支配' :
             npcIds.some(id => NPC欲望档案[id]?.当前阶段 === '沉沦') ? '沉沦' :
             npcIds.some(id => NPC欲望档案[id]?.当前阶段 === '渴望') ? '渴望' :
             npcIds.some(id => NPC欲望档案[id]?.当前阶段 === '试探') ? '试探' : '克制'}
          </div>
        </div>
      </div>

      {/* NPC 列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {npcIds.map(id => (
          <MobileNPCDesireCard
            key={id}
            npcName={NPC姓名映射[id] || id}
            档案={NPC欲望档案[id]}
            未解决后果数={未解决后果计数[id] || 0}
          />
        ))}
        {npcIds.length === 0 && (
          <div className="text-center text-gray-600 py-16 font-serif">
            <div className="text-base mb-2">暂无欲望档案</div>
            <div className="text-[11px]">与校园 NPC 互动后自动创建</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCampusDesireApp;