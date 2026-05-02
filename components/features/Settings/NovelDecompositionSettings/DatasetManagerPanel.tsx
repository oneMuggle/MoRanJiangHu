import React from 'react';
import InlineSelect from '../../ui/InlineSelect';
import type { 小说拆分数据集结构, 小说拆分任务结构 } from '../../../../types';

const 来源类型文本映射: Record<string, string> = {
    novel: '普通小说',
    txt: 'TXT 导入',
    epub: 'EPUB 导入',
    shared_json: '分享 ZIP'
};

interface DatasetManagerPanelProps {
    datasetList: 小说拆分数据集结构[];
    selectedDataset: 小说拆分数据集结构 | null;
    selectedDatasetTasks: 小说拆分任务结构[];
    onDatasetSelect: (value: string) => void;
    onStartTaskForDataset: (dataset?: 小说拆分数据集结构, options?: { successMessage?: string }) => void;
    onSetActiveDataset: () => void;
    onExportSelectedDataset: () => void;
    onDeleteCurrentDataset: () => void;
}

const DatasetManagerPanel: React.FC<DatasetManagerPanelProps> = ({
    datasetList,
    selectedDataset,
    selectedDatasetTasks,
    onDatasetSelect,
    onStartTaskForDataset,
    onSetActiveDataset,
    onExportSelectedDataset,
    onDeleteCurrentDataset
}) => {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 shadow-xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-white/5 pb-6">
                    <div className="flex-1">
                        <h4 className="text-lg font-serif font-semibold text-wuxia-gold tracking-wide">小说库与注入来源</h4>
                        <div className="mt-1.5 text-xs text-gray-400/80 leading-relaxed max-w-2xl">
                            这里管理所有的分解数据集，可在此切换正在用于游戏的主剧情注入小说。
                        </div>
                    </div>
                    <div className="w-full lg:w-80 shrink-0">
                        <div className="text-xs text-gray-500 mb-2 font-medium">选择数据集</div>
                        <InlineSelect
                            value={selectedDataset?.id || ''}
                            options={datasetList.map((dataset) => ({
                                value: dataset.id,
                                label: `${dataset.激活注入 ? '★ 正在注入 | ' : ''}${dataset.作品名 || dataset.标题 || dataset.id}`
                            }))}
                            onChange={onDatasetSelect}
                            placeholder={datasetList.length > 0 ? '选择数据集' : '暂无数据集'}
                            disabled={datasetList.length <= 0}
                            buttonClassName="bg-black/40 border-white/10 py-3 rounded-lg hover:border-wuxia-gold/30 hover:bg-black/60 transition-all text-gray-200"
                        />
                    </div>
                </div>

                {!selectedDataset ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-dashed border-white/10 bg-black/20">
                        <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <div className="text-sm font-medium text-gray-400">目前还没有数据集</div>
                        <div className="mt-1 text-xs text-gray-500">请先使用"导入与配置"面板导入 TXT、EPUB 或分享 ZIP。</div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                            <div className="rounded-lg border border-white/5 bg-black/30 p-4 hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">当前作品</div>
                                <div className="text-sm font-bold text-gray-200 truncate" title={selectedDataset.作品名 || selectedDataset.标题}>{selectedDataset.作品名 || selectedDataset.标题}</div>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-black/30 p-4 hover:bg-white/5 transition-colors relative overflow-hidden group">
                                <div className={`absolute inset-0 opacity-10 transition-opacity ${selectedDataset.激活注入 ? 'bg-wuxia-gold group-hover:opacity-20' : 'bg-transparent'}`}></div>
                                <div className="relative">
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">注入状态</div>
                                    <div className={`text-sm font-bold ${selectedDataset.激活注入 ? 'text-wuxia-gold' : 'text-gray-400'}`}>{selectedDataset.激活注入 ? '★ 当前注入中' : '未激活'}</div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-black/30 p-4 hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">数据来源</div>
                                <div className="text-sm font-bold text-gray-200">{来源类型文本映射[selectedDataset.来源类型] || selectedDataset.来源类型}</div>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-black/30 p-4 hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">章节 / 分段</div>
                                <div className="text-sm font-bold text-gray-200"><span className="text-blue-400">{selectedDataset.总章节数}</span> / <span className="text-emerald-400">{selectedDataset.分段列表.length}</span></div>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-black/30 p-4 hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">原文长度</div>
                                <div className="text-sm font-bold text-gray-200">{(selectedDataset.原始文本长度 || 0).toLocaleString()}</div>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-black/30 p-4 hover:bg-white/5 transition-colors">
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">关联任务</div>
                                <div className="text-sm font-bold text-gray-200">{selectedDatasetTasks.length}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                onClick={() => onSetActiveDataset()}
                                className={`px-6 py-2.5 rounded-lg text-xs font-medium transition-all ${selectedDataset.激活注入 ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/30 cursor-default' : 'bg-wuxia-gold/80 text-black hover:bg-wuxia-gold border border-wuxia-gold'}`}
                                disabled={selectedDataset.激活注入}
                            >
                                {selectedDataset.激活注入 ? '已是当前注入目标' : '设为当前注入'}
                            </button>
                            <button
                                onClick={() => onStartTaskForDataset()}
                                className="px-5 py-2.5 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all"
                            >
                                {selectedDatasetTasks.length > 0 ? '重新开始任务' : '开始任务'}
                            </button>
                            <button
                                onClick={() => onExportSelectedDataset()}
                                className="px-5 py-2.5 rounded-lg text-xs font-medium border border-white/10 bg-black/40 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                            >
                                导出分享 ZIP
                            </button>
                            <div className="flex-1"></div>
                            <button
                                onClick={() => onDeleteCurrentDataset()}
                                className="px-5 py-2.5 rounded-lg text-xs font-medium border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            >
                                删除数据集
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatasetManagerPanel;
