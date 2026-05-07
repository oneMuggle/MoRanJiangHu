// 移动端写真仪表盘 — 写真 NSFW 子系统状态概览

import React, { useMemo } from 'react';
import type { 模特核心状态, 摄影师核心状态, 拍摄项目状态, 泄露事件状态 } from '../../models/photographyNSFW';
import type { 拍摄尺度, 拍摄场所, 传播范围 } from '../../models/photographyNSFW';

const 尺度颜色: Record<拍摄尺度, string> = {
  'G级': 'text-green-400',
  'PG-13': 'text-yellow-400',
  'R级': 'text-orange-400',
  'NC-17': 'text-red-400',
  'XXX': 'text-purple-400',
};

const 泄露严重程度颜色: Record<传播范围, string> = {
  '未传播': 'text-green-400',
  '小范围': 'text-yellow-400',
  '论坛传播': 'text-orange-400',
  '社交媒体': 'text-orange-400',
  '图片网站': 'text-red-400',
  '成人网站': 'text-red-500',
  '全网扩散': 'text-purple-500',
};

const 场所风险颜色: Record<拍摄场所, string> = {
  '影棚': 'text-green-400',
  '外景': 'text-yellow-400',
  '酒店': 'text-orange-400',
  '民宿': 'text-orange-400',
  '个人住所': 'text-red-400',
  '更衣室': 'text-yellow-400',
  '野外': 'text-red-400',
};

interface ProgressBarProps {
  label: string;
  value: number;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, color = 'bg-wuxia-gold' }) => {
  const pct = Math.min(100, Math.max(0, (value / 100) * 100));
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="text-gray-500 shrink-0 w-14">{label}</span>
      <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-400 font-mono w-6 text-right">{value}</span>
    </div>
  );
};

type TabId = 'projects' | 'leaks' | 'models' | 'photographers';

interface Props {
  模特档案: Record<string, 模特核心状态>;
  摄影师档案: Record<string, 摄影师核心状态>;
  进行中的拍摄项目: 拍摄项目状态[];
  历史拍摄记录: 拍摄项目状态[];
  泄露事件列表: 泄露事件状态[];
  onClose: () => void;
}

export const MobilePhotographyDashboard: React.FC<Props> = ({
  模特档案, 摄影师档案, 进行中的拍摄项目, 泄露事件列表, onClose
}) => {
  const [activeTab, setActiveTab] = React.useState<TabId>('projects');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const 活跃泄露 = useMemo(() => 泄露事件列表.filter(e => e.状态 === '活跃' || e.状态 === '已发酵'), [泄露事件列表]);

  const 模特姓名映射 = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [id, m] of Object.entries(模特档案)) map[id] = m.姓名;
    return map;
  }, [模特档案]);

  const 摄影师姓名映射 = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [id, p] of Object.entries(摄影师档案)) map[id] = p.姓名;
    return map;
  }, [摄影师档案]);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: 'projects', label: '项目', count: 进行中的拍摄项目.length },
    { id: 'leaks', label: '泄露', count: 活跃泄露.length },
    { id: 'models', label: '模特', count: Object.keys(模特档案).length },
    { id: 'photographers', label: '摄影师', count: Object.keys(摄影师档案).length },
  ];

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const renderProjects = () => (
    <div className="space-y-2 p-3">
      {进行中的拍摄项目.length === 0 && <div className="text-center text-gray-600 py-12 text-sm">暂无进行中的项目</div>}
      {进行中的拍摄项目.map(p => {
        const 模特姓名 = 模特姓名映射[p.模特Id] || p.模特Id;
        const 摄影师姓名 = 摄影师姓名映射[p.摄影师Id] || p.摄影师Id;
        const 进度 = p.最大回合 > 0 ? Math.round((p.当前回合 / p.最大回合) * 100) : 0;
        return (
          <div key={p.id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleExpand(p.id)} className="w-full flex items-center justify-between p-3">
              <div className="text-left">
                <div className="text-wuxia-gold font-bold text-sm">{模特姓名} × {摄影师姓名}</div>
                <div className="text-[10px] text-gray-500">{p.拍摄阶段}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] ${尺度颜色[p.实际尺度]}`}>{p.实际尺度}</span>
              </div>
            </button>
            {expandedId === p.id && (
              <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-gray-500 w-10">进度</span>
                  <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-wuxia-gold" style={{ width: `${进度}%` }} />
                  </div>
                  <span className="text-gray-400 font-mono w-10 text-right">{进度}%</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  场所: <span className={场所风险颜色[p.实际场所]}>{p.实际场所}</span>
                </div>
                <ProgressBar label="泄露风险" value={p.泄露风险评分} color={p.泄露风险评分 >= 70 ? 'bg-red-500' : p.泄露风险评分 >= 40 ? 'bg-yellow-500' : 'bg-green-500'} />
                {p.越界行为记录.length > 0 && (
                  <div className="bg-red-950/20 border border-red-900/30 rounded p-2">
                    <div className="text-[10px] text-red-400">越界行为: {p.越界行为记录.length} 次</div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderLeaks = () => (
    <div className="space-y-2 p-3">
      {活跃泄露.length === 0 && <div className="text-center text-gray-600 py-12 text-sm">暂无活跃泄露事件</div>}
      {活跃泄露.map(e => (
        <div key={e.id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
          <button type="button" onClick={() => toggleExpand(e.id)} className="w-full flex items-center justify-between p-3">
            <div className="text-left">
              <div className="text-wuxia-gold font-bold text-sm">{模特姓名映射[e.模特Id] || e.模特Id}</div>
              <div className="text-[10px] text-gray-500">{e.泄露类型}</div>
            </div>
            <span className={`text-[11px] ${泄露严重程度颜色[e.传播范围]}`}>{e.传播范围}</span>
          </button>
          {expandedId === e.id && (
            <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
              <ProgressBar label="心理" value={e.心理影响} color="bg-purple-400" />
              <ProgressBar label="名誉" value={e.名誉影响} color="bg-red-400" />
              <ProgressBar label="职业" value={e.职业影响} color="bg-orange-400" />
              <ProgressBar label="生活" value={e.生活影响} color="bg-yellow-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderModels = () => (
    <div className="space-y-2 p-3">
      {Object.keys(模特档案).length === 0 && <div className="text-center text-gray-600 py-12 text-sm">暂无模特数据</div>}
      {Object.entries(模特档案).map(([id, 模特]) => {
        const 安全感颜色 = 模特.安全感 >= 70 ? 'bg-green-500' : 模特.安全感 >= 40 ? 'bg-yellow-500' : 'bg-red-500';
        return (
          <div key={id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleExpand(id)} className="w-full flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black/60 border border-wuxia-gold/30 flex items-center justify-center text-sm font-serif text-wuxia-gold/60">{模特.姓名[0]}</div>
                <div className="text-left">
                  <div className="text-wuxia-gold font-bold text-sm">{模特.姓名}</div>
                  <div className="text-[10px] text-gray-500">{模特.类型} · {模特.职业状态}</div>
                </div>
              </div>
              <span className={`text-[11px] ${尺度颜色[模特.当前底线]}`}>{模特.当前底线}</span>
            </button>
            {expandedId === id && (
              <div className="px-3 pb-3 space-y-1 border-t border-white/5 pt-2">
                <ProgressBar label="安全感" value={模特.安全感} color={安全感颜色} />
                <ProgressBar label="信任度" value={模特.信任度} color="bg-blue-400" />
                <ProgressBar label="自我认同" value={模特.自我认同} color="bg-blue-400" />
                <ProgressBar label="羞耻度" value={模特.羞耻度} color="bg-red-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderPhotographers = () => (
    <div className="space-y-2 p-3">
      {Object.keys(摄影师档案).length === 0 && <div className="text-center text-gray-600 py-12 text-sm">暂无摄影师数据</div>}
      {Object.entries(摄影师档案).map(([id, 摄影师]) => (
        <div key={id} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
          <button type="button" onClick={() => toggleExpand(id)} className="w-full flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/60 border border-wuxia-gold/30 flex items-center justify-center text-sm font-serif text-wuxia-gold/60">{摄影师.姓名[0]}</div>
              <div className="text-left">
                <div className="text-wuxia-gold font-bold text-sm">{摄影师.姓名}</div>
                <div className="text-[10px] text-gray-500">{摄影师.类型}</div>
              </div>
            </div>
            <span className="text-[11px] text-gray-500">评分 {Math.round(摄影师.口碑评分)}</span>
          </button>
          {expandedId === id && (
            <div className="px-3 pb-3 space-y-1 border-t border-white/5 pt-2">
              <ProgressBar label="技术水平" value={摄影师.技术水平} color="bg-blue-400" />
              <ProgressBar label="沟通能力" value={摄影师.沟通能力} color="bg-green-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="h-12 shrink-0 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-wuxia-red animate-pulse" />
          <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-[0.2em]">写真</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-black/30">
        {tabs.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2 text-xs text-center transition-colors ${activeTab === tab.id ? 'text-wuxia-gold border-b-2 border-wuxia-gold' : 'text-gray-500'}`}>
            {tab.label}{tab.count > 0 ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'leaks' && renderLeaks()}
        {activeTab === 'models' && renderModels()}
        {activeTab === 'photographers' && renderPhotographers()}
      </div>
    </div>
  );
};

export default MobilePhotographyDashboard;
