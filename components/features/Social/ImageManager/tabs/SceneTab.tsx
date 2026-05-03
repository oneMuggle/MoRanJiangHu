import React from 'react';
import type { 
    场景图片档案,
    场景生图任务记录
} from '../../../../../types';
import { 
    状态样式, 
    状态文案,
    队列状态样式, 
    队列状态文案,
    次级按钮样式,
    统计卡
} from '../utils/imageManagerConstants';
import { 
    格式化时间,
    空状态
} from '../utils/imageManagerHelpers';

interface SceneTabProps {
    当前壁纸记录?: 场景图片档案['最近生图结果'];
    sceneArchiveLimit: number;
    sceneArchiveLimitDraft: string;
    sceneResolution: string;
    sceneResolutionOptions: { label: string; value: string }[];
    sceneOrientation: '横屏' | '竖屏';
    sceneCompositionRequirement: '纯场景' | '故事快照';
    sceneExtraRequirement: string;
    sceneManualArtistPresetId: string;
    sceneManualPngPresetId: string;
    sceneArtistPresets: { id: string; 名称: string; 正面提示词?: string; 负面提示词?: string }[];
    sceneHistory: 场景图片档案['最近生图结果'][];
    sceneQueueList: 场景生图任务记录[];
    sceneStats: {
        total: number;
        success: number;
        failed: number;
        pending: number;
        queueTotal: number;
        queueRunning: number;
    };
    sceneStatusText: string;
    busyActionKey: string;
    currentPersistentWallpaper?: string;
    当前场景壁纸ID?: string;
    获取图片展示地址: (result: any) => string | undefined;
    是否存在本地图片副本: (result: any) => boolean;
    格式化本地图片描述: (path?: string) => string;
    打开图片查看器: (src: string, alt: string) => void;
    setSceneArchiveLimitDraft: (value: string) => void;
    setSceneResolution: (value: string) => void;
    setSceneOrientation: (value: '横屏' | '竖屏') => void;
    setSceneCompositionRequirement: (value: '纯场景' | '故事快照') => void;
    setSceneExtraRequirement: (value: string) => void;
    setSceneManualArtistPresetId: (value: string) => void;
    setSceneManualPngPresetId: (value: string) => void;
    handleGenerateSceneImage?: () => Promise<void>;
    handleClearSceneHistory?: () => Promise<void>;
    handleDeleteSceneImage?: (imageId: string) => Promise<void>;
    handleApplySceneWallpaper?: (imageId: string) => Promise<void>;
    handleClearSceneWallpaper?: () => Promise<void>;
    handleSetPersistentWallpaper?: (imageUrl: string) => Promise<void>;
    handleClearPersistentWallpaper?: () => Promise<void>;
    handleSaveSceneImageLocally?: (imageId: string) => Promise<void>;
    handleDeleteSceneQueueTask?: (taskId: string) => Promise<void>;
    handleClearSceneQueue?: (mode: 'all' | 'completed') => Promise<void>;
    handleSaveSceneArchiveLimit?: () => Promise<void>;
    selectedSceneArtistPreset?: { 正面提示词?: string; 负面提示词?: string };
    selectedScenePngPreset?: { 正面提示词?: string; 负面提示词?: string };
    manualBackgroundMode: boolean;
}

export const SceneTab: React.FC<SceneTabProps> = ({
    当前壁纸记录,
    sceneArchiveLimit,
    sceneArchiveLimitDraft,
    sceneResolution,
    sceneResolutionOptions,
    sceneOrientation,
    sceneCompositionRequirement,
    sceneExtraRequirement,
    sceneManualArtistPresetId,
    sceneManualPngPresetId,
    sceneArtistPresets,
    sceneHistory,
    sceneQueueList,
    sceneStats,
    sceneStatusText,
    busyActionKey,
    currentPersistentWallpaper,
    当前场景壁纸ID,
    获取图片展示地址,
    是否存在本地图片副本,
    格式化本地图片描述,
    打开图片查看器,
    setSceneArchiveLimitDraft,
    setSceneResolution,
    setSceneOrientation,
    setSceneCompositionRequirement,
    setSceneExtraRequirement,
    setSceneManualArtistPresetId,
    setSceneManualPngPresetId,
    handleGenerateSceneImage,
    handleClearSceneHistory,
    handleDeleteSceneImage,
    handleApplySceneWallpaper,
    handleClearSceneWallpaper,
    handleSetPersistentWallpaper,
    handleClearPersistentWallpaper,
    handleSaveSceneImageLocally,
    handleDeleteSceneQueueTask,
    handleClearSceneQueue,
    handleSaveSceneArchiveLimit,
    selectedSceneArtistPreset,
    selectedScenePngPreset,
    manualBackgroundMode
}) => {
    const 小标题样式 = 'text-[10px] md:text-xs text-wuxia-gold/70 tracking-widest uppercase font-serif drop-shadow-md';

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 h-full">
            <div className="flex flex-col gap-6">
                <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 relative overflow-hidden flex flex-col min-h-[460px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 relative z-10">
                        <div>
                            <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">当前场景壁纸</div>
                            <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Current Wallpaper</div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col relative z-10">
                        {获取图片展示地址(当前壁纸记录) ? (
                            <button
                                type="button"
                                className="flex-1 rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col group hover:border-wuxia-gold/40 transition-colors text-left"
                                onClick={() => 打开图片查看器(获取图片展示地址(当前壁纸记录), 当前壁纸记录?.摘要 || '当前场景壁纸')}
                                title="点击查看图片大图"
                            >
                                <div className="flex-1 bg-[radial-gradient(circle_at_center,#1a1a1c,black)] flex items-center justify-center relative overflow-hidden">
                                    <img src={获取图片展示地址(当前壁纸记录)} alt="当前壁纸" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded border border-wuxia-gold/40 bg-wuxia-gold/20 backdrop-blur-sm text-[10px] text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                                        当前使用中
                                    </div>
                                </div>
                                <div className="p-3 border-t border-wuxia-gold/10 bg-gradient-to-b from-transparent to-black/50">
                                    <div className="text-sm font-serif text-wuxia-gold/90 mb-1">{当前壁纸记录?.摘要 || '未命名场景'}</div>
                                    <div className="text-[10px] text-gray-500 flex justify-between">
                                        <span>模型: {当前壁纸记录?.使用模型 || '未记录'}</span>
                                        <span>回合: {当前壁纸记录?.来源回合 || '无'}</span>
                                    </div>
                                </div>
                            </button>
                        ) : (
                            <div className="flex-1 rounded border border-dashed border-wuxia-gold/20 bg-black/20 flex flex-col items-center justify-center text-center p-6">
                                <div className="text-wuxia-gold/30 text-5xl mb-4">⛰️</div>
                                <div className="text-gray-400 font-serif mb-2">暂无场景壁纸</div>
                                <div className="text-xs text-gray-600">当前尚未指定任何场景壁纸</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded p-5 relative">
                    <div className="text-wuxia-gold font-serif text-lg tracking-wider border-b border-wuxia-gold/10 pb-3 mb-4">场景生成统计</div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <统计卡 label="图片总数" value={sceneStats.total} />
                        <统计卡 label="成功" value={sceneStats.success} tone="success" />
                        <统计卡 label="失败" value={sceneStats.failed} tone="danger" />
                        <统计卡 label="生成中" value={sceneStats.pending} tone="warning" />
                        <统计卡 label="队列总数" value={sceneStats.queueTotal} tone="info" />
                        <统计卡 label="运行中" value={sceneStats.queueRunning} tone="info" />
                    </div>
                    <div className="mt-4 rounded border border-wuxia-gold/20 bg-black/30 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="text-sm font-serif text-wuxia-gold/90">场景历史数量限制</div>
                                <div className="mt-1 text-[11px] text-gray-500">当前 {sceneStats.total} / {sceneArchiveLimit}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={sceneArchiveLimitDraft}
                                    onChange={(e) => setSceneArchiveLimitDraft(e.target.value)}
                                    className="w-24 rounded border border-wuxia-gold/20 bg-black/50 px-3 py-2 text-sm text-wuxia-gold/90 outline-none focus:border-wuxia-gold/50"
                                />
                                <button type="button" onClick={() => { void handleSaveSceneArchiveLimit?.(); }} className={次级按钮样式()}>
                                    应用上限
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-wuxia-gold/10 flex flex-col gap-3">
                        <div className="space-y-2">
                            <label className={小标题样式}>场景构图要求</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['纯场景', '故事快照'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setSceneCompositionRequirement(mode)}
                                        className={`rounded border px-3 py-2 text-xs font-serif transition-all duration-300 ${sceneCompositionRequirement === mode ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>画面方向</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['横屏', '竖屏'] as const).map((orientation) => (
                                    <button
                                        key={orientation}
                                        type="button"
                                        onClick={() => setSceneOrientation(orientation)}
                                        className={`rounded border px-3 py-2 text-xs font-serif transition-all duration-300 ${sceneOrientation === orientation ? 'border-wuxia-gold bg-wuxia-gold/20 text-wuxia-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'border-wuxia-gold/20 bg-black/40 text-gray-400 hover:border-wuxia-gold/50'}`}
                                    >
                                        {orientation}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>分辨率 / 比例</label>
                            <select
                                value={sceneResolution}
                                onChange={(e) => setSceneResolution(e.target.value)}
                                className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                            >
                                {sceneResolutionOptions.map((option) => (
                                    <option key={option.value} value={option.value} className="bg-gray-900">
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="text-[10px] text-gray-500">当前分辨率：{sceneResolution || '未选择'}</div>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>额外要求</label>
                            <textarea
                                value={sceneExtraRequirement}
                                onChange={(e) => setSceneExtraRequirement(e.target.value)}
                                rows={3}
                                placeholder="如：夜雨江湖、远景俯瞰、人物剪影..."
                                className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none resize-y focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>场景画师串预设</label>
                            <select
                                value={sceneManualArtistPresetId}
                                onChange={(e) => setSceneManualArtistPresetId(e.target.value)}
                                className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                            >
                                {sceneArtistPresets.length <= 0 ? (
                                    <option value="">未配置预设</option>
                                ) : (
                                    sceneArtistPresets.map((preset) => (
                                        <option key={preset.id} value={preset.id} className="bg-gray-900">
                                            {preset.名称}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className={小标题样式}>场景PNG画风预设</label>
                            <select
                                value={sceneManualPngPresetId}
                                onChange={(e) => setSceneManualPngPresetId(e.target.value)}
                                className="w-full rounded border border-wuxia-gold/20 bg-black/60 px-3 py-2 text-sm text-gray-200 outline-none focus:border-wuxia-gold/60 focus:bg-wuxia-gold/5 transition-all appearance-none"
                            >
                                <option value="">不启用</option>
                            </select>
                        </div>
                        {sceneStatusText && (
                            <div className="rounded border border-wuxia-gold/40 bg-wuxia-gold/10 p-3 text-sm text-wuxia-gold whitespace-pre-wrap">{sceneStatusText}</div>
                        )}
                        <div className="flex flex-wrap gap-2 justify-end">
                            {handleGenerateSceneImage && (
                                <button
                                    type="button"
                                    onClick={() => { void handleGenerateSceneImage(); }}
                                    disabled={busyActionKey === 'generate_scene_image'}
                                    className={次级按钮样式()}
                                >
                                    按当前正文生成
                                </button>
                            )}
                            {handleClearSceneHistory && (
                                <button
                                    type="button"
                                    onClick={() => { void handleClearSceneHistory(); }}
                                    disabled={busyActionKey === 'clear_scene_history'}
                                    className={次级按钮样式(true)}
                                >
                                    清空历史
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 flex flex-col relative min-h-0">
                <div className="absolute inset-0 bg-[radial_gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
                
                <div className="flex flex-col h-full relative z-10 space-y-6">
                    {(sceneQueueList.length > 0) && (
                        <div className="flex flex-col shrink-0 max-h-[30%] min-h-[120px]">
                            <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-3 mb-3 shrink-0">
                                <div className="text-wuxia-gold font-serif text-lg tracking-wider">场景队列</div>
                                <div className="flex gap-2">
                                    {handleClearSceneQueue && (
                                        <>
                                            <button type="button" onClick={() => { void handleClearSceneQueue('completed'); }} disabled={busyActionKey === 'clear_scene_queue_completed'} className={次级按钮样式(true)}>
                                                清空已完成
                                            </button>
                                            <button type="button" onClick={() => { void handleClearSceneQueue('all'); }} disabled={busyActionKey === 'clear_scene_queue_all'} className={次级按钮样式(true)}>
                                                清空全部
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                {sceneQueueList.length > 0 ? (
                                    sceneQueueList.map((task) => (
                                        <div key={task.id} className="rounded border border-wuxia-gold/20 bg-black/40 p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-wuxia-gold/90 font-serif">{task.摘要 || '场景生成'}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">{格式化时间(task.创建时间)}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border ${队列状态样式[task.状态]}`}>{队列状态文案[task.状态]}</span>
                                                    {handleDeleteSceneQueueTask && (
                                                        <button type="button" onClick={() => { void handleDeleteSceneQueueTask(task.id); }} disabled={busyActionKey === `delete_scene_queue_${task.id}`} className={次级按钮样式(true)}>
                                                            删除
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-gray-600 py-4">场景队列为空</div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-3 mb-4">
                            <div className="text-wuxia-gold font-serif text-lg">场景历史</div>
                            <div className="text-[10px] text-gray-500">{sceneHistory.length} 条记录</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {sceneHistory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                    {sceneHistory.map((result) => {
                                        const imageId = typeof result?.id === 'string' ? result.id : '';
                                        const imageSrc = 获取图片展示地址(result);
                                        const isCurrentWallpaper = Boolean(imageId) && imageId === 当前场景壁纸ID;
                                        const status = result?.状态 || 'success';
                                        const canUseSceneImage = Boolean(imageId && imageSrc && status === 'success');
                                        
                                        return (
                                            <div key={imageId || result.生成时间} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col hover:border-wuxia-gold/50 transition-all duration-300 group">
                                                <div className="aspect-[16/9] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                                    {imageSrc ? (
                                                        <img src={imageSrc} alt={result?.摘要 || '场景'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-xs text-gray-500">图片不可用</div>
                                                    )}
                                                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${状态样式[status as keyof typeof 状态样式]}`}>
                                                            {状态文案[status as keyof typeof 状态文案]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 flex flex-col flex-1 bg-gradient-to-b from-transparent to-black/30">
                                                    <div className="flex items-start justify-between gap-2 border-b border-wuxia-gold/10 pb-2 mb-2">
                                                        <div className="min-w-0">
                                                            <div className="text-sm font-serif text-wuxia-gold/90 truncate">{result?.摘要 || '未命名场景'}</div>
                                                            <div className="text-[10px] text-gray-500">{格式化时间(result?.生成时间)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-2 flex flex-wrap justify-end gap-1.5">
                                                        {handleApplySceneWallpaper && canUseSceneImage && (
                                                            <button type="button" onClick={() => { void (isCurrentWallpaper ? handleClearSceneWallpaper?.() : handleApplySceneWallpaper(imageId)); }} className={次级按钮样式()}>
                                                                {isCurrentWallpaper ? '取消壁纸' : '设为壁纸'}
                                                            </button>
                                                        )}
                                                        {handleDeleteSceneImage && imageId && (
                                                            <button type="button" onClick={() => { void handleDeleteSceneImage(imageId); }} className={次级按钮样式(true)}>
                                                                删除
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <空状态 title="暂无场景历史记录" desc="请先生成场景图片。" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SceneTab;