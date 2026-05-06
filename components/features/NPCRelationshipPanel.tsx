/**
 * NPCRelationshipPanel - NPC 关系详情面板
 * 展示 NPC 关系的完整状态、进度和互动选项
 */

import React, { useMemo } from 'react';
import type { NPC结构 } from '../../models/domain/social';
import type { NPC关系数据, 关系类型, 关系状态, 互动类型 } from '../../models/campusNSFW';
import { 计算关系类型 } from '../../models/campusNSFW';

interface NPCRelationshipPanelProps {
  npc: NPC结构;
  onClose: () => void;
  onInteraction?: (npcId: string, type: 互动类型) => void;
}

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, max, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-400 w-12">{label}</span>
    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
    <span className="text-xs text-gray-300 w-10 text-right">{value}</span>
  </div>
);

const 关系类型颜色: Record<关系类型, string> = {
  '陌生': '#9CA3AF',
  '相识': '#60A5FA',
  '好感': '#34D399',
  '亲密': '#FBBF24',
  '恋人': '#F472B6',
  '挚友': '#A78BFA',
};

const 关系状态标签: Record<关系状态, string> = {
  '单恋': '单恋中',
  '暧昧': '暧昧中',
  '已确认': '已确认',
  '分手': '已分手',
  '友谊': '友谊',
};

const 互动按钮列表: { type: 互动类型; label: string; icon: string }[] = [
  { type: '对话', label: '对话', icon: '💬' },
  { type: '送礼', label: '送礼', icon: '🎁' },
  { type: '邀约', label: '邀约', icon: '📅' },
  { type: '任务帮助', label: '帮助', icon: '🤝' },
  { type: '亲密互动', label: '亲密', icon: '❤️' },
];

const NPCRelationshipPanel: React.FC<NPCRelationshipPanelProps> = ({
  npc,
  onClose,
  onInteraction,
}) => {
  const 关系数据 = npc.关系数据;
  const 当前阶段 = 关系数据 ? 计算关系类型(关系数据) : '陌生';
  const 阶段颜色 = 关系类型颜色[当前阶段];

  // 计算到下一阶段需要的数值
  const 下一阶段阈值 = useMemo(() => {
    if (当前阶段 === '陌生人') return null;
    const 阈值表: Record<关系类型, { 好感度: number; 亲密度: number; 信任度: number; 感情值: number }> = {
      '陌生': { 好感度: 20, 亲密度: 10, 信任度: 5, 感情值: 5 },
      '相识': { 好感度: 40, 亲密度: 25, 信任度: 20, 感情值: 15 },
      '好感': { 好感度: 60, 亲密度: 50, 信任度: 40, 感情值: 35 },
      '亲密': { 好感度: 80, 亲密度: 75, 信任度: 60, 感情值: 50 },
      '恋人': { 好感度: 100, 亲密度: 100, 信任度: 100, 感情值: 100 },
      '挚友': { 好感度: 100, 亲密度: 100, 信任度: 100, 感情值: 100 },
    };
    return 阈值表[当前阶段] || null;
  }, [当前阶段]);

  const 剩余进度 = useMemo(() => {
    if (!下一阶段阈值 || !关系数据) return null;
    return {
      好感度: Math.max(0, 下一阶段阈值.好感度 - 关系数据.好感度),
      亲密度: Math.max(0, 下一阶段阈值.亲密度 - 关系数据.亲密度),
      信任度: Math.max(0, 下一阶段阈值.信任度 - 关系数据.信任度),
      感情值: Math.max(0, 下一阶段阈值.感情值 - 关系数据.感情值),
    };
  }, [下一阶段阈值, 关系数据]);

  if (!关系数据) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
          <h2 className="text-lg font-bold text-white mb-4">{npc.姓名}</h2>
          <p className="text-gray-400 text-center py-8">暂无关系数据</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{npc.姓名}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 阶段颜色 + '30', color: 阶段颜色 }}
              >
                {当前阶段}
              </span>
              <span className="text-xs text-gray-400">
                {关系状态标签[关系数据.关系状态]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 数值进度 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">关系数值</h3>
            <ProgressBar label="好感" value={关系数据.好感度} max={100} color="#34D399" />
            <ProgressBar label="亲密" value={关系数据.亲密度} max={100} color="#FBBF24" />
            <ProgressBar label="信任" value={关系数据.信任度} max={100} color="#60A5FA" />
            <ProgressBar label="感情" value={关系数据.感情值} max={100} color="#F472B6" />
          </div>

          {/* 互动统计 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">互动次数</span>
            <span className="text-white">{关系数据.互动次数} 次</span>
          </div>

          {关系数据.最近互动时间 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">最近互动</span>
              <span className="text-gray-300 text-xs">
                {new Date(关系数据.最近互动时间).toLocaleString('zh-CN')}
              </span>
            </div>
          )}

          {/* 解锁场景 */}
          {关系数据.解锁场景.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">已解锁场景</h3>
              <div className="flex flex-wrap gap-1">
                {关系数据.解锁场景.map((scene, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-xs"
                  >
                    {scene}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 关系进度提示 */}
          {剩余进度 && 当前阶段 !== '恋人' && 当前阶段 !== '挚友' && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-300 mb-2">距离下阶段还需</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-400">好感 {剩余进度.好感度 > 0 ? `+${剩余进度.好感度}` : '已达成'}</div>
                <div className="text-gray-400">亲密 {剩余进度.亲密度 > 0 ? `+${剩余进度.亲密度}` : '已达成'}</div>
                <div className="text-gray-400">信任 {剩余进度.信任度 > 0 ? `+${剩余进度.信任度}` : '已达成'}</div>
                <div className="text-gray-400">感情 {剩余进度.感情值 > 0 ? `+${剩余进度.感情值}` : '已达成'}</div>
              </div>
            </div>
          )}

          {/* 关键事件时间线 */}
          {关系数据.关键事件.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">关系历程</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {关系数据.关键事件.slice(-5).reverse().map((event) => (
                  <div key={event.id} className="flex items-start gap-2 text-xs">
                    <span className="text-gray-500 shrink-0">
                      {new Date(event.时间).toLocaleDateString('zh-CN')}
                    </span>
                    <div>
                      <span className="text-gray-300">[{event.类型}]</span>
                      <span className="text-white ml-1">{event.标题}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部互动按钮 */}
        <div className="p-4 border-t border-gray-700">
          <div className="grid grid-cols-5 gap-2">
            {互动按钮列表.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => onInteraction?.(npc.id, type)}
                className="flex flex-col items-center gap-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <span className="text-lg">{icon}</span>
                <span className="text-xs text-gray-300">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPCRelationshipPanel;
