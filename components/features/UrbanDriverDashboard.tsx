// 桌面端都市网约车 NSFW 仪表盘 — 展示网约车子系统状态概览

import React, { useMemo } from 'react';
import type {
  乘客欲望档案,
  乘客欲望阶段,
  行程关系轨道,
} from '../../models/urbanDriverNSFW/core';
import type {
  行程NSFW类型,
  行程地点,
} from '../../models/urbanDriverNSFW/scenarios';
import type {
  后果事件,
} from '../../models/urbanDriverNSFW/consequences';
import { 地点风险 } from '../../models/urbanDriverNSFW/scenarios';
import { 后果严重度权重 } from '../../models/urbanDriverNSFW/consequences';

// ==================== 常量 ====================

const 欲望阶段颜色: Record<乘客欲望阶段, string> = {
  '克制': 'text-blue-400',
  '试探': 'text-cyan-400',
  '渴望': 'text-pink-400',
  '沉沦': 'text-red-400',
  '支配': 'text-purple-400',
};

const 欲望阶段图标: Record<乘客欲望阶段, string> = {
  '克制': '❄',
  '试探': '🔍',
  '渴望': '🔥',
  '沉沦': '💫',
  '支配': '👑',
};

const 关系轨道颜色: Record<行程关系轨道, string> = {
  '纯爱': 'text-emerald-400',
  '暧昧': 'text-yellow-400',
  '肉体': 'text-red-400',
  '支配': 'text-purple-400',
  '交易': 'text-orange-400',
};

const 后果严重程度颜色: Record<string, string> = {
  '轻微': 'text-yellow-500',
  '中等': 'text-orange-500',
  '严重': 'text-red-500',
  '毁灭': 'text-red-700',
};

const 行程类型图标: Record<行程NSFW类型, string> = {
  '醉酒搭车': '🍷',
  '饮料下药': '🪶',
  '深夜独处': '🌙',
  '后座暗示': '👁',
  '停车场秘密': '🏗',
  '拼车暧昧': '👯',
  '常客关系': '🔄',
  '行车记录仪': '📹',
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

interface PassengerCardProps {
  npcName: string;
  档案: 乘客欲望档案;
}

const PassengerCard: React.FC<PassengerCardProps> = ({ npcName, 档案 }) => {
  const [expanded, setExpanded] = React.useState(false);
  const stageColor = 欲望阶段颜色[档案.当前阶段] || 'text-gray-400';
  const stageIcon = 欲望阶段图标[档案.当前阶段] || '?';
  const orbitColor = 关系轨道颜色[档案.关系轨道] || 'text-gray-400';

  return (
    <div className="rounded border border-white/10 bg-gray-900/50 p-3">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{stageIcon}</span>
          <span className="font-medium text-sm text-gray-200">{npcName}</span>
          <span className={`text-xs ${stageColor}`}>{档案.当前阶段}</span>
        </div>
        <span className="text-xs text-gray-500">{expanded ? '▼' : '▶'}</span>
      </div>

      {/* 基础信息 — 始终显示 */}
      <div className="mt-2 flex gap-4 text-xs">
        <div>
          <span className="text-gray-500">进度</span>
          <span className="text-gray-300 ml-1 font-mono">{档案.阶段进度}%</span>
        </div>
        <div>
          <span className="text-gray-500">轨道</span>
          <span className={`ml-1 ${orbitColor}`}>{档案.关系轨道}</span>
        </div>
        <div>
          <span className="text-gray-500">暴露风险</span>
          <span className="text-gray-300 ml-1 font-mono">{档案.暴露风险值}</span>
        </div>
      </div>

      {/* 展开详情 */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-white/5 pt-2">
          <ProgressBar label="阶段进度" value={档案.阶段进度} color={stageColor.replace('text', 'bg')} />
          <ProgressBar label="轨道进度" value={档案.轨道进度} color={orbitColor.replace('text', 'bg')} />
          <ProgressBar label="暴露风险" value={档案.暴露风险值} color="bg-orange-500" />
          <ProgressBar label="紧张度" value={档案.紧张度} color="bg-red-500" />

          {档案.醉酒状态 && (
            <div className="text-xs text-yellow-300">
              🍷 醉酒: {档案.醉酒状态.等级} (行为{档案.醉酒状态.行为大胆度}%, 记忆模糊{档案.醉酒状态.记忆模糊度}%)
            </div>
          )}
          {档案.药物状态 && (
            <div className="text-xs text-purple-300">
              🪶 药物: {档案.药物状态.类型} ({档案.药物状态.生效阶段}, 意识{档案.药物状态.意识清晰度}%)
            </div>
          )}

          {档案.里程碑列表.length > 0 && (
            <div className="text-xs text-gray-500">
              📌 {档案.里程碑列表.length} 个里程碑
            </div>
          )}
          {档案.已解锁互动.length > 0 && (
            <div className="text-xs text-gray-500">
              🔓 已解锁: {档案.已解锁互动.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 主组件 ====================

interface TripInfoProps {
  活跃场景标签: 行程NSFW类型[];
  当前地点: 行程地点 | null;
  行车记录仪状态: string;
}

const TripInfo: React.FC<TripInfoProps> = ({ 活跃场景标签, 当前地点, 行车记录仪状态 }) => {
  if (活跃场景标签.length === 0) return null;

  const risk = 当前地点 ? 地点风险[当前地点] ?? 0 : 0;
  const riskColor = risk >= 60 ? 'text-red-400' : risk >= 30 ? 'text-orange-400' : 'text-green-400';
  const recorderColor = 行车记录仪状态 === '录制中' ? 'text-red-400' : 行车记录仪状态 === '已泄露' ? 'text-purple-400' : 'text-gray-500';

  return (
    <div className="rounded border border-white/10 bg-gray-900/50 p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {活跃场景标签.map(标签 => (
          <span key={标签} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10">
            <span className="text-base">{行程类型图标[标签] || '🚗'}</span>
            <span className="text-gray-200 font-medium text-xs">{标签}</span>
          </span>
        ))}
        {当前地点 && (
          <span className="text-gray-500 text-xs ml-1">→ {当前地点}</span>
        )}
      </div>
      <div className="mt-2 flex gap-4 text-xs">
        <span className="text-gray-500">风险等级</span>
        <span className={`font-mono ${riskColor}`}>{risk}</span>
        <span className="text-gray-500 ml-2">记录仪</span>
        <span className={`font-mono ${recorderColor}`}>{行车记录仪状态}</span>
      </div>
    </div>
  );
};

interface ConsequenceItemProps {
  后果: 后果事件;
}

const ConsequenceItem: React.FC<ConsequenceItemProps> = ({ 后果 }) => {
  const sevColor = 后果严重程度颜色[后果.严重程度] || 'text-gray-400';
  const severity = 后果严重度权重[后果.类型] ?? 0;

  return (
    <div className={`rounded border p-2 text-xs ${后果.已处理 ? 'border-green-900/30 bg-green-900/10' : 'border-white/10 bg-gray-900/50'}`}>
      <div className="flex items-center justify-between">
        <span className={`font-medium ${sevColor}`}>{后果.类型}</span>
        <span className="text-gray-500 font-mono">严重度 {severity}</span>
      </div>
      <div className="text-gray-400 mt-1">{后果.描述}</div>
      {后果.已处理 && <span className="text-green-500 text-[10px]">✓ 已处理</span>}
    </div>
  );
};

// ==================== Export ====================

interface UrbanDriverDashboardProps {
  都市网约车系统: unknown;
  onClose: () => void;
}

const UrbanDriverDashboard: React.FC<UrbanDriverDashboardProps> = ({ 都市网约车系统, onClose }) => {
  const 行程系统 = (都市网约车系统 as any)?.行程系统;

  const 乘客欲望档案 = useMemo(() => {
    if (!行程系统?.乘客欲望档案) return {};
    return 行程系统.乘客欲望档案 as Record<string, 乘客欲望档案>;
  }, [行程系统]);

  const 后果列表 = useMemo(() => {
    if (!行程系统?.后果列表) return [];
    return 行程系统.后果列表 as 后果事件[];
  }, [行程系统]);

  const 未处理后果 = useMemo(() => 后果列表.filter(c => !c.已处理), [后果列表]);
  const 已处理后果 = useMemo(() => 后果列表.filter(c => c.已处理), [后果列表]);

  const 常客记录 = useMemo(() => {
    if (!行程系统?.常客记录) return [];
    return 行程系统.常客记录 as { 乘客Id: string; 搭乘次数: number; 最后时间: number }[];
  }, [行程系统]);

  const hasData = Object.keys(乘客欲望档案).length > 0 || 后果列表.length > 0 || (行程系统?.活跃场景标签?.length ?? 0) > 0;

  if (!hasData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="w-[600px] max-h-[80vh] rounded-lg border border-white/10 bg-gray-900 p-6">
          <h2 className="text-lg font-bold text-gray-200 mb-4">🚗 网约车仪表盘</h2>
          <p className="text-sm text-gray-500">暂无数据。当乘客欲望系统激活后，此处将显示状态信息。</p>
          <button className="mt-4 px-4 py-2 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto pt-8 pb-8">
      <div className="w-[700px] rounded-lg border border-white/10 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-200">🚗 网约车仪表盘</h2>
          <button className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600" onClick={onClose}>
            ✕ 关闭
          </button>
        </div>

        <div className="space-y-4">
          {/* 当前行程信息 */}
          {行程系统?.活跃场景标签 && 行程系统.活跃场景标签.length > 0 && (
            <section>
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-2">▶ 当前行程</h3>
              <TripInfo
                活跃场景标签={行程系统.活跃场景标签}
                当前地点={行程系统.当前地点}
                行车记录仪状态={行程系统.行车记录仪状态 || '关闭'}
              />
            </section>
          )}

          {/* 乘客欲望档案 */}
          {Object.keys(乘客欲望档案).length > 0 && (
            <section>
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-2">👤 乘客欲望档案 ({Object.keys(乘客欲望档案).length})</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(乘客欲望档案).map(([id, 档案]) => (
                  <PassengerCard key={id} npcName={id} 档案={档案} />
                ))}
              </div>
            </section>
          )}

          {/* 未处理后果 */}
          {未处理后果.length > 0 && (
            <section>
              <h3 className="text-xs text-red-400 uppercase tracking-widest mb-2">⚠ 未处理后果 ({未处理后果.length})</h3>
              <div className="space-y-2">
                {未处理后果.map(c => (
                  <ConsequenceItem key={c.id} 后果={c} />
                ))}
              </div>
            </section>
          )}

          {/* 已处理后果 */}
          {已处理后果.length > 0 && (
            <section>
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-2">✓ 已处理后果 ({已处理后果.length})</h3>
              <div className="space-y-2 opacity-60">
                {已处理后果.map(c => (
                  <ConsequenceItem key={c.id} 后果={c} />
                ))}
              </div>
            </section>
          )}

          {/* 常客记录 */}
          {常客记录.length > 0 && (
            <section>
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-2">🔄 常客记录 ({常客记录.length})</h3>
              <div className="rounded border border-white/10 bg-gray-900/50 p-3">
                {常客记录.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-400 py-1">
                    <span>{c.乘客Id}</span>
                    <span className="font-mono">{c.搭乘次数} 次搭乘</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default UrbanDriverDashboard;
