// 桌面端欲望仪表盘 — 展示校园 NSFW 子系统状态概览

import React, { useMemo } from 'react';
import type { NPC欲望档案, 欲望阶段, 关系轨道, 后果记录 } from '../../models/campusNSFW';

// ==================== 常量与工具函数 ====================

const 欲望阶段颜色: Record<欲望阶段, string> = {
  '克制': 'text-blue-400',
  '试探': 'text-cyan-400',
  '渴望': 'text-pink-400',
  '沉沦': 'text-red-400',
  '支配': 'text-purple-400',
};

const 欲望阶段图标: Record<欲望阶段, string> = {
  '克制': '❄',
  '试探': '🔍',
  '渴望': '🔥',
  '沉沦': '💫',
  '支配': '👑',
};

const 关系轨道颜色: Record<关系轨道, string> = {
  '纯爱': 'text-emerald-400',
  '暧昧': 'text-yellow-400',
  '肉体': 'text-red-400',
  '支配': 'text-purple-400',
  '多角': 'text-orange-400',
};

const 后果严重程度颜色: Record<string, string> = {
  '轻微': 'text-yellow-500',
  '中等': 'text-orange-500',
  '严重': 'text-red-500',
  '毁灭': 'text-red-700',
};

// ==================== 子组件 ====================

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, max = 100, color = 'bg-wuxia-gold', showValue = true }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 shrink-0 w-16">{label}</span>
      <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && <span className="text-gray-400 font-mono w-8 text-right">{value}</span>}
    </div>
  );
};

interface NPCDesireCardProps {
  npcId: string;
  npcName: string;
  档案: NPC欲望档案;
  后果: 后果记录[];
  里程碑数: number;
  onOpenBDSMRelationship?: (npcId: string, npcName: string) => void;
  onOpenBDSMContract?: (npcId: string, npcName: string) => void;
  onOpenBDSMSafety?: (npcId: string, npcName: string) => void;
  onGenerateTasks?: (npcId: string, npcName: string) => void;
  onGenerateDailyInstructions?: (npcId: string, npcName: string) => void;
  onCheckStageAdvance?: (npcId: string, npcName: string) => void;
}

const NPCDesireCard: React.FC<NPCDesireCardProps> = ({ npcName, 档案, 后果, 里程碑数, npcId, onOpenBDSMRelationship, onOpenBDSMContract, onOpenBDSMSafety, onGenerateTasks, onGenerateDailyInstructions, onCheckStageAdvance }) => {
  const [expanded, setExpanded] = React.useState(false);

  const 活跃后果 = useMemo(() => 后果.filter(c => !c.是否已解决), [后果]);

  return (
    <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-wuxia-gold/20 transition-colors">
      {/* 头部 */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/60 border border-wuxia-gold/30 flex items-center justify-center text-lg font-serif text-wuxia-gold/60">
            {npcName[0]}
          </div>
          <div className="text-left">
            <div className="font-serif text-wuxia-gold font-bold">{npcName}</div>
            <div className={`text-[11px] ${欲望阶段颜色[档案.当前阶段]}`}>
              {欲望阶段图标[档案.当前阶段]} {档案.当前阶段}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {活跃后果.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
          <span className={`text-[11px] ${关系轨道颜色[档案.关系轨道]}`}>
            {档案.关系轨道}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* 欲望进度 */}
          <ProgressBar
            label="欲望进度"
            value={档案.阶段进度}
            color={档案.阶段进度 >= 80 ? 'bg-red-500' : 'bg-wuxia-gold'}
          />

          {/* 暴露风险 */}
          <ProgressBar
            label="暴露风险"
            value={档案.暴露风险值}
            color={档案.暴露风险值 >= 70 ? 'bg-red-600' : 档案.暴露风险值 >= 40 ? 'bg-orange-500' : 'bg-green-500'}
          />

          {/* 流言等级 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-16">流言等级</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <span
                  key={i}
                  className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center border ${
                    i < 档案.流言等级
                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                      : 'border-gray-700 text-gray-700'
                  }`}
                >
                  {i < 档案.流言等级 ? '●' : '○'}
                </span>
              ))}
            </div>
            <span className="text-gray-500">/ 5</span>
          </div>

          {/* 露出偏好 (v1.1) */}
          {档案.露出状态 && (
            <ProgressBar
              label="露出偏好"
              value={档案.露出状态.当前等级 * 20}
              color="bg-pink-500"
              showValue={false}
            />
          )}

          {/* 紧张度 (v1.1) */}
          {档案.紧张度状态 && (
            <ProgressBar
              label="紧张度"
              value={档案.紧张度状态.当前值}
              color={档案.紧张度状态.当前值 >= 80 ? 'bg-red-600 animate-pulse' : 'bg-orange-400'}
            />
          )}

          {/* 权力天平 (v1.2) */}
          {档案.权力天平 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 w-16">权力天平</span>
              <div className="flex-1 relative h-3 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-white/20" />
                </div>
                <div
                  className={`absolute top-0 bottom-0 transition-all duration-300 rounded-full ${
                    档案.权力天平.当前值 < 0
                      ? 'bg-purple-500/50'
                      : 'bg-blue-500/50'
                  }`}
                  style={{
                    width: `${Math.abs(档案.权力天平.当前值) / 2}%`,
                    ...(档案.权力天平.当前值 < 0 ? { right: '50%' } : { left: '50%' }),
                  }}
                />
              </div>
              <span className="text-gray-400 font-mono w-10 text-right">{档案.权力天平.当前值 > 0 ? '+' : ''}{档案.权力天平.当前值}</span>
            </div>
          )}

          {/* 服从度 (v1.2) */}
          {档案.服从度 && (
            <ProgressBar
              label="服从度"
              value={档案.服从度.当前值}
              color="bg-indigo-500"
            />
          )}

          {/* BDSM 关系入口 (v1.6) */}
          {(档案 as any).BDSM关系 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="text-[10px] text-gray-600 uppercase tracking-widest">BDSM 关系</div>
              <div className="flex gap-2">
                {onOpenBDSMRelationship && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenBDSMRelationship(npcId, npcName); }}
                    className="flex-1 text-[11px] py-1.5 rounded bg-purple-900/20 border border-purple-500/30 text-purple-400 hover:bg-purple-900/40 transition-colors"
                  >
                    关系总览
                  </button>
                )}
                {onOpenBDSMContract && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenBDSMContract(npcId, npcName); }}
                    className="flex-1 text-[11px] py-1.5 rounded bg-amber-900/20 border border-amber-500/30 text-amber-400 hover:bg-amber-900/40 transition-colors"
                  >
                    契约管理
                  </button>
                )}
                {onOpenBDSMSafety && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onOpenBDSMSafety(npcId, npcName); }}
                    className="flex-1 text-[11px] py-1.5 rounded bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition-colors"
                  >
                    安全设置
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {onGenerateTasks && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onGenerateTasks(npcId, npcName); }}
                    className="flex-1 text-[11px] py-1.5 rounded bg-blue-900/20 border border-blue-500/30 text-blue-400 hover:bg-blue-900/40 transition-colors"
                  >
                    生成任务
                  </button>
                )}
                {onGenerateDailyInstructions && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onGenerateDailyInstructions(npcId, npcName); }}
                    className="flex-1 text-[11px] py-1.5 rounded bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 transition-colors"
                  >
                    刷新指令
                  </button>
                )}
                {onCheckStageAdvance && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onCheckStageAdvance(npcId, npcName); }}
                    className="flex-1 text-[11px] py-1.5 rounded bg-amber-900/20 border border-amber-500/30 text-amber-400 hover:bg-amber-900/40 transition-colors"
                  >
                    阶段判定
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 里程碑计数 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">里程碑</span>
            <span className="text-wuxia-gold font-mono">{里程碑数}</span>
            {档案.互动冷却期 > 0 && (
              <span className="text-gray-600 ml-2">(冷却中 {档案.互动冷却期} 回合)</span>
            )}
          </div>

          {/* 活跃后果警告 */}
          {活跃后果.length > 0 && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-2 space-y-1">
              <div className="text-[10px] text-red-400/80 font-bold tracking-widest">活跃后果</div>
              {活跃后果.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center gap-2 text-[11px]">
                  <span className={后果严重程度颜色[c.严重程度]}>{c.类型}</span>
                  <span className="text-gray-600">({c.严重程度})</span>
                  <span className="text-gray-700 ml-auto">剩余 {c.持续回合} 回合</span>
                </div>
              ))}
              {活跃后果.length > 3 && (
                <div className="text-[10px] text-gray-600">+{活跃后果.length - 3} 更多后果</div>
              )}
            </div>
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
  里程碑数: Record<string, number>;
  NPC姓名映射: Record<string, string>;
  onClose: () => void;
  onOpenBDSMRelationship?: (npcId: string, npcName: string) => void;
  onOpenBDSMContract?: (npcId: string, npcName: string) => void;
  onOpenBDSMSafety?: (npcId: string, npcName: string) => void;
  onGenerateTasks?: (npcId: string, npcName: string) => void;
  onGenerateDailyInstructions?: (npcId: string, npcName: string) => void;
  onCheckStageAdvance?: (npcId: string, npcName: string) => void;
}

export const CampusDesireDashboard: React.FC<Props> = ({
  NPC欲望档案,
  后果列表,
  里程碑数,
  NPC姓名映射,
  onClose,
  onOpenBDSMRelationship,
  onOpenBDSMContract,
  onOpenBDSMSafety,
  onGenerateTasks,
  onGenerateDailyInstructions,
  onCheckStageAdvance,
}) => {
  const npcIds = Object.keys(NPC欲望档案);

  const 统计 = useMemo(() => {
    const 各阶段计数: Record<欲望阶段, number> = { '克制': 0, '试探': 0, '渴望': 0, '沉沦': 0, '支配': 0 };
    const 各轨道计数: Record<关系轨道, number> = { '纯爱': 0, '暧昧': 0, '肉体': 0, '支配': 0, '多角': 0 };
    let 总暴露事件 = 0;
    let 总活跃后果 = 0;
    let 总里程碑 = 0;

    for (const id of npcIds) {
      const a = NPC欲望档案[id];
      各阶段计数[a.当前阶段]++;
      各轨道计数[a.关系轨道]++;
      总暴露事件 += a.已暴露次数 || 0;
      总里程碑 += 里程碑数[id] || 0;
    }
    总活跃后果 = 后果列表.filter(c => !c.是否已解决).length;

    return { 各阶段计数, 各轨道计数, 总暴露事件, 总活跃后果, 总里程碑 };
  }, [npcIds, NPC欲望档案, 后果列表, 里程碑数]);

  const 最高阶段 = useMemo((): 欲望阶段 => {
    if (统计.各阶段计数['支配'] > 0) return '支配';
    if (统计.各阶段计数['沉沦'] > 0) return '沉沦';
    if (统计.各阶段计数['渴望'] > 0) return '渴望';
    if (统计.各阶段计数['试探'] > 0) return '试探';
    return '克制';
  }, [统计.各阶段计数]);

  const 最高阶段颜色 = 欲望阶段颜色[最高阶段];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-ink-black/95 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-wuxia-gold/20 shadow-[0_0_80px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="h-14 shrink-0 border-b border-white/10 bg-gradient-to-r from-black/80 to-black/40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-wuxia-red animate-pulse" />
            <h3 className="text-wuxia-gold font-serif font-bold text-xl tracking-[0.3em]">
              欲望仪表盘
              <span className="text-[10px] text-wuxia-gold/50 ml-2 font-mono tracking-widest border border-wuxia-gold/20 px-2 py-0.5 rounded-full">CAMPUS DESIRE</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-400 transition-all"
            title="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-5 gap-3 px-6 py-4 border-b border-white/5 bg-black/30">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">总 NPC</div>
            <div className="text-2xl font-serif text-wuxia-gold">{npcIds.length}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">总里程碑</div>
            <div className="text-2xl font-serif text-wuxia-gold">{统计.总里程碑}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">暴露事件</div>
            <div className="text-2xl font-serif text-red-400">{统计.总暴露事件}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">活跃后果</div>
            <div className={`text-2xl font-serif ${统计.总活跃后果 > 0 ? 'text-red-500' : 'text-gray-600'}`}>
              {统计.总活跃后果}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">最高阶段</div>
            <div className={`text-2xl font-serif ${最高阶段颜色}`}>
              {最高阶段}
            </div>
          </div>
        </div>

        {/* NPC 列表 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {npcIds.map(id => (
            <NPCDesireCard
              key={id}
              npcId={id}
              npcName={NPC姓名映射[id] || id}
              档案={NPC欲望档案[id]}
              后果={后果列表}
              里程碑数={里程碑数[id] || 0}
              onOpenBDSMRelationship={onOpenBDSMRelationship}
              onOpenBDSMContract={onOpenBDSMContract}
              onOpenBDSMSafety={onOpenBDSMSafety}
              onGenerateTasks={onGenerateTasks}
              onGenerateDailyInstructions={onGenerateDailyInstructions}
              onCheckStageAdvance={onCheckStageAdvance}
            />
          ))}
          {npcIds.length === 0 && (
            <div className="text-center text-gray-600 py-16 font-serif">
              <div className="text-lg mb-2">暂无欲望档案</div>
              <div className="text-xs">与校园 NPC 互动后将自动创建档案</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampusDesireDashboard;