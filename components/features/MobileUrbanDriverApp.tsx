// 移动端都市网约车 NSFW 仪表盘

import React, { useMemo } from 'react';
import type {
  乘客欲望档案,
  乘客欲望阶段,
  行程关系轨道,
} from '../../models/urbanDriverNSFW/core';
import type {
  后果事件,
} from '../../models/urbanDriverNSFW/consequences';
import { 地点风险 } from '../../models/urbanDriverNSFW/scenarios';

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

// ==================== 主组件 ====================

interface MobileUrbanDriverAppProps {
  都市网约车系统: unknown;
  onClose: () => void;
}

const MobileUrbanDriverApp: React.FC<MobileUrbanDriverAppProps> = ({ 都市网约车系统, onClose }) => {
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

  const hasData = Object.keys(乘客欲望档案).length > 0 || 后果列表.length > 0 || (行程系统?.活跃场景标签?.length ?? 0) > 0;

  if (!hasData) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-bold text-gray-200">🚗 网约车</h2>
          <button className="text-gray-400 text-lg px-2" onClick={onClose}>✕</button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">暂无数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="text-sm font-bold text-gray-200">🚗 网约车仪表盘</h2>
        <button className="text-gray-400 text-lg px-2" onClick={onClose}>✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* 当前行程 */}
        {行程系统?.活跃场景标签 && 行程系统.活跃场景标签.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">当前行程</span>
            </div>
            <div className="rounded border border-white/10 bg-gray-900/50 p-2">
              <div className="flex flex-wrap items-center gap-1 text-xs">
                {行程系统.活跃场景标签.map((标签: string) => (
                  <span key={标签} className="text-gray-200 font-medium bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{标签}</span>
                ))}
                {行程系统.当前地点 && (
                  <span className="text-gray-500 ml-1">→ {行程系统.当前地点}</span>
                )}
              </div>
              <div className="mt-1 flex gap-3 text-[10px]">
                <span className="text-gray-500">风险</span>
                <span className="text-gray-300 font-mono">{行程系统.当前地点 ? 地点风险[行程系统.当前地点] ?? 0 : 0}</span>
                <span className="text-gray-500">记录仪</span>
                <span className="text-gray-300 font-mono">{行程系统.行车记录仪状态 || '关闭'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 乘客列表 */}
        {Object.keys(乘客欲望档案).length > 0 && (
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">乘客 ({Object.keys(乘客欲望档案).length})</span>
            <div className="space-y-2 mt-1">
              {Object.entries(乘客欲望档案).map(([id, 档案]) => {
                const stageColor = 欲望阶段颜色[档案.当前阶段] || 'text-gray-400';
                const stageIcon = 欲望阶段图标[档案.当前阶段] || '?';
                const orbitColor = 关系轨道颜色[档案.关系轨道] || 'text-gray-400';

                return (
                  <div key={id} className="rounded border border-white/10 bg-gray-900/50 p-2">
                    <div className="flex items-center gap-2">
                      <span>{stageIcon}</span>
                      <span className="text-xs text-gray-200 flex-1">{id}</span>
                      <span className={`text-[10px] ${stageColor}`}>{档案.当前阶段}</span>
                    </div>
                    <div className="mt-1 flex gap-3 text-[10px] text-gray-500">
                      <span>进度 {档案.阶段进度}%</span>
                      <span className={orbitColor}>{档案.关系轨道}</span>
                      <span>风险 {档案.暴露风险值}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 未处理后果 */}
        {未处理后果.length > 0 && (
          <div>
            <span className="text-[10px] text-red-400 uppercase tracking-widest">⚠ 后果 ({未处理后果.length})</span>
            <div className="space-y-2 mt-1">
              {未处理后果.map(c => (
                <div key={c.id} className="rounded border border-white/10 bg-gray-900/50 p-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={后果严重程度颜色[c.严重程度]}>{c.类型}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">{c.描述}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileUrbanDriverApp;
