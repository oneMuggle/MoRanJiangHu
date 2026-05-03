import React from 'react';
import ToggleSwitch from '../../../ui/ToggleSwitch';
import type { 接口设置结构, 功能模型占位配置结构 } from '../../../../types';

interface ImportExportPanelProps {
    datasetsCount: number;
    tasksLength: number;
    form: 接口设置结构;
    updatePlaceholder: <K extends keyof 功能模型占位配置结构>(key: K, value: 功能模型占位配置结构[K]) => void;
    showStrategySection: boolean;
    setShowStrategySection: React.Dispatch<React.SetStateAction<boolean>>;
    importTxtInputRef: React.RefObject<HTMLInputElement | null>;
    importEpubInputRef: React.RefObject<HTMLInputElement | null>;
    importJsonInputRef: React.RefObject<HTMLInputElement | null>;
    onCreateEmptyDataset: () => void;
}

const ImportExportPanel: React.FC<ImportExportPanelProps> = ({
    datasetsCount,
    tasksLength,
    form,
    updatePlaceholder,
    showStrategySection,
    setShowStrategySection,
    importTxtInputRef,
    importEpubInputRef,
    importJsonInputRef,
    onCreateEmptyDataset
}) => {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <input
                ref={importTxtInputRef}
                type="file"
                accept=".txt,text/plain"
                className="hidden"
            />
            <input
                ref={importEpubInputRef}
                type="file"
                accept=".epub,application/epub+zip"
                className="hidden"
            />
            <input
                ref={importJsonInputRef}
                type="file"
                accept=".zip,application/zip"
                className="hidden"
            />

            <div className="rounded-xl border border-white/5 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md p-6 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h4 className="text-lg font-serif font-semibold text-wuxia-gold tracking-wide">快速导入</h4>
                        <div className="mt-1.5 text-xs text-gray-400/80 leading-relaxed max-w-2xl">
                            推荐先直接导入小说 TXT、EPUB 或分解 ZIP。TXT / EPUB 会先创建数据集，方便你检查章节、删除目录页后再手动开始任务；分解 ZIP 会导入已拆好的结构结果，并可选择是否同时带入原文。
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-3 bg-black/30 rounded-lg px-4 py-2 border border-white/5">
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">数据集</div>
                            <div className="text-sm font-bold text-gray-200">{datasetsCount}</div>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">任务</div>
                            <div className="text-sm font-bold text-gray-200">{tasksLength}</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => importTxtInputRef.current?.click()}
                        className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-white/5 bg-black/30 hover:bg-wuxia-gold/5 hover:border-wuxia-gold/30 transition-all duration-300"
                    >
                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-wuxia-gold/20 text-gray-300 group-hover:text-wuxia-gold">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-wuxia-gold">导入 TXT</span>
                    </button>
                    <button
                        onClick={() => importEpubInputRef.current?.click()}
                        className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-white/5 bg-black/30 hover:bg-wuxia-gold/5 hover:border-wuxia-gold/30 transition-all duration-300"
                    >
                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-wuxia-gold/20 text-gray-300 group-hover:text-wuxia-gold">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-wuxia-gold">导入 EPUB</span>
                    </button>
                    <button
                        onClick={() => importJsonInputRef.current?.click()}
                        className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-white/5 bg-black/30 hover:bg-wuxia-gold/5 hover:border-wuxia-gold/30 transition-all duration-300"
                    >
                        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-wuxia-gold/20 text-gray-300 group-hover:text-wuxia-gold">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-wuxia-gold">导入分解 ZIP</span>
                    </button>
                    <button
                        onClick={() => onCreateEmptyDataset()}
                        className="group relative flex flex-col items-center justify-center p-5 rounded-xl border border-dashed border-white/10 bg-black/10 hover:bg-white/5 hover:border-white/30 transition-all duration-300"
                    >
                        <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-white/20 text-gray-400 group-hover:text-gray-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200">新建空白集</span>
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/30 backdrop-blur-md shadow-lg overflow-hidden transition-all duration-300">
                <div
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setShowStrategySection((prev) => !prev)}
                >
                    <div>
                        <h4 className="text-base font-serif font-semibold text-gray-200 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            任务与注入策略
                        </h4>
                        <div className="mt-1 text-xs text-gray-500">
                            调整批量拆分、后台续跑或全局注入策略。
                        </div>
                    </div>
                    <div className={`p-2 rounded-full bg-black/30 border border-white/5 transition-transform duration-300 ${showStrategySection ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>

                {showStrategySection && (
                    <div className="p-6 border-t border-white/5 bg-black/20 space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">按 N 章分组</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.功能模型占位.小说拆分按N章分组}
                                        onChange={(e) => updatePlaceholder('小说拆分按N章分组', Math.max(1, Number(e.target.value) || 1))}
                                        className="w-full border border-white/10 bg-black/40 px-4 py-2.5 text-gray-200 rounded-lg outline-none focus:border-wuxia-gold/50 focus:ring-1 focus:ring-wuxia-gold/20 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">单次处理批量</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.功能模型占位.小说拆分单次处理批量}
                                        onChange={(e) => updatePlaceholder('小说拆分单次处理批量', Math.max(1, Number(e.target.value) || 1))}
                                        className="w-full border border-white/10 bg-black/40 px-4 py-2.5 text-gray-200 rounded-lg outline-none focus:border-wuxia-gold/50 focus:ring-1 focus:ring-wuxia-gold/20 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">自动重试次数</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.功能模型占位.小说拆分自动重试次数}
                                        onChange={(e) => updatePlaceholder('小说拆分自动重试次数', Math.max(0, Number(e.target.value) || 0))}
                                        className="w-full border border-white/10 bg-black/40 px-4 py-2.5 text-gray-200 rounded-lg outline-none focus:border-wuxia-gold/50 focus:ring-1 focus:ring-wuxia-gold/20 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <div className="mb-4 text-xs font-medium text-gray-400 uppercase tracking-wider">后台与注入控制</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <label className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-white/5 group-hover:text-wuxia-gold transition-colors text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
                                        <span className="text-sm text-gray-300">后台自动拆分</span>
                                    </div>
                                    <ToggleSwitch checked={Boolean(form.功能模型占位.小说拆分后台运行)} onChange={(checked) => updatePlaceholder('小说拆分后台运行', checked)} ariaLabel="切换后台拆分" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-white/5 group-hover:text-wuxia-gold transition-colors text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>
                                        <span className="text-sm text-gray-300">自动从断点续跑</span>
                                    </div>
                                    <ToggleSwitch checked={Boolean(form.功能模型占位.小说拆分自动续跑)} onChange={(checked) => updatePlaceholder('小说拆分自动续跑', checked)} ariaLabel="切换自动续跑" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-white/5 group-hover:text-blue-400 transition-colors text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                                        <span className="text-sm text-gray-300">主剧情三章滑窗注入</span>
                                    </div>
                                    <ToggleSwitch checked={Boolean(form.功能模型占位.小说拆分主剧情注入)} onChange={(checked) => updatePlaceholder('小说拆分主剧情注入', checked)} ariaLabel="切换主剧情注入" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-white/5 group-hover:text-purple-400 transition-colors text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
                                        <span className="text-sm text-gray-300">规划分析当前章注入</span>
                                    </div>
                                    <ToggleSwitch checked={Boolean(form.功能模型占位.小说拆分规划分析注入)} onChange={(checked) => updatePlaceholder('小说拆分规划分析注入', checked)} ariaLabel="切换规划分析注入" />
                                </label>
                                <label className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-white/5 group-hover:text-emerald-400 transition-colors text-gray-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                        <span className="text-sm text-gray-300">世界演变当前章注入</span>
                                    </div>
                                    <ToggleSwitch checked={Boolean(form.功能模型占位.小说拆分世界演变注入)} onChange={(checked) => updatePlaceholder('小说拆分世界演变注入', checked)} ariaLabel="切换世界演变注入" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportExportPanel;
