import React from 'react';
import type { 
    NPC图片记录,
    场景图片档案
} from '../../../../../types';
import { IconScroll } from '../../../../ui/Icons';
import { 
    状态样式, 
    状态文案,
    次级按钮样式
} from '../utils/imageManagerConstants';
import { 
    格式化时间,
    获取NPC构图文案
} from '../utils/imageManagerHelpers';

type 合并历史记录 = {
    类型: 'npc' | 'scene';
    key: string;
    时间: number;
    状态: string;
    npcRecord?: NPC图片记录;
    sceneRecord?: 场景图片档案['最近生图结果'];
};

interface HistoryTabProps {
    combinedHistoryRecords: 合并历史记录[];
    busyActionKey: string;
    currentPersistentWallpaper?: string;
    当前场景壁纸ID?: string;
    获取图片展示地址: (result: any) => string | undefined;
    是否存在本地图片副本: (result: any) => boolean;
    格式化本地图片描述: (path?: string) => string;
    打开图片查看器: (src: string, alt: string) => void;
    onClearImageHistory?: () => Promise<void> | void;
    onClearSceneHistory?: () => Promise<void> | void;
    onDeleteImageRecord?: (npcId: string, imageId: string) => Promise<void> | void;
    onDeleteSceneImage?: (imageId: string) => Promise<void> | void;
    onApplySceneWallpaper?: (imageId: string) => Promise<void> | void;
    onClearSceneWallpaper?: () => Promise<void> | void;
    onSetPersistentWallpaper?: (imageUrl: string) => Promise<void> | void;
    onClearPersistentWallpaper?: () => Promise<void> | void;
    onSaveImageLocally?: (npcId: string, imageId: string) => Promise<void> | void;
    onSaveSceneImageLocally?: (imageId: string) => Promise<void> | void;
    handleClearAllHistory?: () => Promise<void>;
    handleClearSceneHistory?: () => Promise<void>;
    handleDeleteSceneImage?: (imageId: string) => Promise<void>;
    handleApplySceneWallpaper?: (imageId: string) => Promise<void>;
    handleClearSceneWallpaper?: () => Promise<void>;
    handleSetPersistentWallpaper?: (imageUrl: string) => Promise<void>;
    handleClearPersistentWallpaper?: () => Promise<void>;
    handleSaveSceneImageLocally?: (imageId: string) => Promise<void>;
    handleDeleteImageRecord?: (npcId: string, imageId: string) => Promise<void>;
    handleSaveNpcImageLocally?: (npcId: string, imageId: string) => Promise<void>;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
    combinedHistoryRecords,
    busyActionKey,
    currentPersistentWallpaper,
    当前场景壁纸ID,
    获取图片展示地址,
    是否存在本地图片副本,
    格式化本地图片描述,
    打开图片查看器,
    onClearImageHistory,
    onClearSceneHistory,
    onDeleteImageRecord,
    onDeleteSceneImage,
    onApplySceneWallpaper,
    onClearSceneWallpaper,
    onSetPersistentWallpaper,
    onClearPersistentWallpaper,
    onSaveImageLocally,
    onSaveSceneImageLocally,
    handleClearAllHistory,
    handleClearSceneHistory,
    handleDeleteSceneImage,
    handleApplySceneWallpaper,
    handleClearSceneWallpaper,
    handleSetPersistentWallpaper,
    handleClearPersistentWallpaper,
    handleSaveSceneImageLocally,
    handleDeleteImageRecord,
    handleSaveNpcImageLocally
}) => {
    return (
        <div className="flex flex-col h-full bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-wrap items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 shrink-0 gap-4">
                    <div>
                        <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">全部生成历史</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Chronicles of the Past</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {onClearImageHistory && (
                            <button
                                type="button"
                                onClick={() => { void handleClearAllHistory?.(); }}
                                disabled={busyActionKey === 'clear_all_history'}
                                className={次级按钮样式(true)}
                            >
                                清空 NPC 历史
                            </button>
                        )}
                        {onClearSceneHistory && (
                            <button
                                type="button"
                                onClick={() => { void handleClearSceneHistory?.(); }}
                                disabled={busyActionKey === 'clear_scene_history'}
                                className={次级按钮样式(true)}
                            >
                                清空场景历史
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5">
                    {combinedHistoryRecords.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 pb-4">
                            {combinedHistoryRecords.map((entry) => {
                                if (entry.类型 === 'scene' && entry.sceneRecord) {
                                    const result = entry.sceneRecord;
                                    const imageId = typeof result?.id === 'string' ? result.id : '';
                                    const imageSrc = 获取图片展示地址(result);
                                    const isCurrentWallpaper = Boolean(imageId) && imageId === 当前场景壁纸ID;
                                    const normalizedPersistentWallpaper = (currentPersistentWallpaper || '').trim();
                                    const isPersistentWallpaper = Boolean(imageSrc && normalizedPersistentWallpaper && imageSrc === normalizedPersistentWallpaper);
                                    const hasLocalCopy = 是否存在本地图片副本(result);
                                    const status = result?.状态 || 'success';
                                    
                                    return (
                                        <div key={entry.key} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col xl:flex-row group hover:border-wuxia-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all duration-300">
                                            <div className="xl:w-1/3 aspect-[16/9] xl:aspect-auto xl:min-h-[240px] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b xl:border-b-0 xl:border-r border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                                {imageSrc ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => 打开图片查看器(imageSrc, result?.摘要 || '场景')}
                                                        className="w-full h-full block text-left"
                                                        title="查看大图"
                                                    >
                                                        <img src={imageSrc} alt={result?.摘要 || '场景'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                                    </button>
                                                ) : (
                                                    <div className="text-xs text-gray-500 font-serif">图片不可用</div>
                                                )}
                                                <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded border inline-block w-fit backdrop-blur bg-black/60 shadow-md ${状态样式[status as keyof typeof 状态样式]}`}>
                                                        {状态文案[status as keyof typeof 状态文案]}
                                                    </span>
                                                    <span className="rounded border border-wuxia-gold/40 bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-wuxia-gold/80 shadow-md w-fit">
                                                        场景
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 flex flex-col flex-1 bg-gradient-to-b xl:bg-gradient-to-r from-transparent to-black/30">
                                                <div className="flex items-start justify-between gap-3 border-b border-wuxia-gold/10 pb-3 mb-4">
                                                    <div>
                                                        <div className="text-lg font-serif text-wuxia-gold/90">{result?.摘要 || '未命名场景'}</div>
                                                        <div className="text-[10px] text-gray-500 mt-1 flex gap-2 items-center">
                                                            <span className="px-1.5 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5 text-wuxia-gold/70">{result?.场景类型 || '未分类'}</span>
                                                            <span className="font-mono">{格式化时间(result?.生成时间)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {onDeleteSceneImage && imageId && (
                                                            <button type="button" onClick={() => { void handleDeleteSceneImage?.(imageId); }} disabled={busyActionKey === `delete_scene_${imageId}`} className={次级按钮样式(true)}>
                                                                删除图片
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 flex-1">
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                        <div className="text-wuxia-gold/50 text-[10px] mb-1">使用模型</div>
                                                        <div className="text-gray-300 text-xs font-mono break-words">{result.使用模型 || '未记录'}</div>
                                                    </div>
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                        <div className="text-wuxia-gold/50 text-[10px] mb-1">画风偏好 / 附加预设</div>
                                                        <div className="text-gray-300 text-xs font-mono break-words">{[result.画风, result.画师串].filter(Boolean).join(' / ') || '无'}</div>
                                                    </div>
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3 md:col-span-2">
                                                        <div className="text-wuxia-gold/50 text-[10px] mb-1">本地路径</div>
                                                        <div className="text-gray-300 text-[10px] font-mono break-all">{格式化本地图片描述(result.本地路径)}</div>
                                                    </div>
                                                    {result.错误信息 && (
                                                        <div className="rounded border border-red-900/40 bg-red-950/20 p-3 md:col-span-2 text-red-200 text-xs font-mono break-words">
                                                            错误：{result.错误信息}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col gap-2">
                                                    <details className="group/details">
                                                        <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                            最终正向提示词
                                                        </summary>
                                                        <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                            {result.最终正向提示词 || result.生图词组 || '未记录提示词'}
                                                        </div>
                                                    </details>
                                                    {!!result.最终负向提示词 && (
                                                        <details className="group/details">
                                                            <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                                最终负面提示词
                                                            </summary>
                                                            <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                                {result.最终负向提示词}
                                                            </div>
                                                        </details>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-4 pt-3 flex flex-wrap justify-end gap-2 border-t border-wuxia-gold/10">
                                                    {imageSrc && (
                                                        <button
                                                            type="button"
                                                            onClick={() => 打开图片查看器(imageSrc, result?.摘要 || '场景')}
                                                            className={次级按钮样式()}
                                                        >
                                                            查看大图
                                                        </button>
                                                    )}
                                                    {onApplySceneWallpaper && imageId && imageSrc && status === 'success' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { void (isCurrentWallpaper ? handleClearSceneWallpaper?.() : handleApplySceneWallpaper?.(imageId)); }}
                                                            disabled={busyActionKey === `apply_scene_${imageId}` || busyActionKey === 'clear_scene_wallpaper'}
                                                            className={次级按钮样式()}
                                                        >
                                                            {isCurrentWallpaper ? '取消设置壁纸' : '设为壁纸'}
                                                        </button>
                                                    )}
                                                    {onSetPersistentWallpaper && imageSrc && status === 'success' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { void (isPersistentWallpaper ? handleClearPersistentWallpaper?.() : handleSetPersistentWallpaper?.(imageSrc)); }}
                                                            disabled={busyActionKey === `set_persistent_wallpaper_${imageSrc}` || busyActionKey === 'clear_persistent_wallpaper'}
                                                            className={次级按钮样式()}
                                                        >
                                                            {isPersistentWallpaper ? '取消常驻壁纸' : '设为常驻壁纸'}
                                                        </button>
                                                    )}
                                                    {onSaveSceneImageLocally && imageId && !hasLocalCopy && (
                                                        <button type="button" onClick={() => { void handleSaveSceneImageLocally?.(imageId); }} disabled={busyActionKey === `local_scene_${imageId}`} className={次级按钮样式()}>
                                                            保存到本地
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                const record = entry.npcRecord!;
                                const result = record.结果;
                                const status = result.状态 || 'success';
                                const imageId = typeof result.id === 'string' ? result.id : '';
                                const imageSrc = 获取图片展示地址(result);
                                const normalizedPersistentWallpaper = (currentPersistentWallpaper || '').trim();
                                const isPersistentWallpaper = Boolean(imageSrc && normalizedPersistentWallpaper && imageSrc === normalizedPersistentWallpaper);
                                const hasLocalCopy = 是否存在本地图片副本(result);
                                
                                return (
                                    <div key={entry.key} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col xl:flex-row group hover:border-wuxia-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all duration-300">
                                        <div className="xl:w-1/3 aspect-[3/4] xl:aspect-auto xl:min-h-[300px] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b xl:border-b-0 xl:border-r border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                            {imageSrc ? (
                                                <button
                                                    type="button"
                                                    onClick={() => 打开图片查看器(imageSrc, `${record.NPC姓名} 图片`)}
                                                    className="w-full h-full block text-left"
                                                    title="查看大图"
                                                >
                                                    <img src={imageSrc} alt={`${record.NPC姓名} 图片`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                                </button>
                                            ) : (
                                                    <div className="text-xs text-gray-500 font-serif">图片不可用</div>
                                            )}
                                            <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                                                <span className={`text-[10px] px-2 py-0.5 rounded border inline-block w-fit backdrop-blur bg-black/60 shadow-md ${状态样式[status as keyof typeof 状态样式]}`}>
                                                    {状态文案[status as keyof typeof 状态文案]}
                                                </span>
                                                <span className="rounded border border-wuxia-gold/40 bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-wuxia-gold/80 shadow-md w-fit">
                                                    角色
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 flex flex-col flex-1 bg-gradient-to-b xl:bg-gradient-to-r from-transparent to-black/30">
                                            <div className="flex items-start justify-between gap-3 border-b border-wuxia-gold/10 pb-3 mb-4">
                                                <div>
                                                    <div className="text-lg font-serif text-wuxia-gold/90">{record.NPC姓名}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1 flex gap-2 items-center">
                                                        <span>{record.NPC性别 || '未知'}</span>
                                                        <span className="px-1.5 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5 text-wuxia-gold/70">{获取NPC构图文案(result.构图, result.部位)}</span>
                                                        <span className="font-mono">{格式化时间(result.生成时间)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {onDeleteImageRecord && imageId && (
                                                        <button type="button" onClick={() => { void handleDeleteImageRecord?.(record.NPC标识, imageId); }} disabled={busyActionKey === `delete_image_${imageId}`} className={次级按钮样式(true)}>
                                                            删除图片
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 flex-1">
                                                <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                    <div className="text-wuxia-gold/50 text-[10px] mb-1">使用模型</div>
                                                    <div className="text-gray-300 text-xs font-mono break-words">{result.使用模型 || '未记录'}</div>
                                                </div>
                                                <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3">
                                                    <div className="text-wuxia-gold/50 text-[10px] mb-1">画风偏好 / 附加预设</div>
                                                    <div className="text-gray-300 text-xs font-mono break-words">{[result.画风, result.画师串].filter(Boolean).join(' / ') || '无'}</div>
                                                </div>
                                                <div className="rounded border border-wuxia-gold/10 bg-black/50 p-3 md:col-span-2">
                                                    <div className="text-wuxia-gold/50 text-[10px] mb-1">本地路径</div>
                                                    <div className="text-gray-300 text-[10px] font-mono break-all">{格式化本地图片描述(result.本地路径)}</div>
                                                </div>
                                                {result.错误信息 && (
                                                    <div className="rounded border border-red-900/40 bg-red-950/20 p-3 md:col-span-2 text-red-200 text-xs font-mono break-words">
                                                        错误：{result.错误信息}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                <details className="group/details">
                                                    <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                        最终正向提示词
                                                    </summary>
                                                    <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                        {result.最终正向提示词 || result.生图词组 || '未记录提示词'}
                                                    </div>
                                                </details>
                                                {!!result.最终负向提示词 && (
                                                    <details className="group/details">
                                                        <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                            最终负面提示词
                                                        </summary>
                                                        <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                            {result.最终负向提示词}
                                                        </div>
                                                    </details>
                                                )}
                                                <details className="group/details">
                                                    <summary className={`text-[11px] text-gray-400 cursor-pointer select-none hover:text-wuxia-gold transition-colors outline-none flex items-center gap-1 before:content-['▶'] before:text-[8px] before:transition-transform group-open/details:before:rotate-90`}>
                                                        原始描述
                                                    </summary>
                                                    <div className="mt-2 text-[10px] text-gray-400/80 bg-black/80 p-3 rounded border border-wuxia-gold/10 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                                                        {result.原始描述 || '未记录描述'}
                                                    </div>
                                                </details>
                                            </div>
                                            
                                            <div className="mt-4 pt-3 flex flex-wrap justify-end gap-2 border-t border-wuxia-gold/10">
                                                {imageSrc && (
                                                    <button
                                                        type="button"
                                                        onClick={() => 打开图片查看器(imageSrc, `${record.NPC姓名} 图片`)}
                                                        className={次级按钮样式()}
                                                    >
                                                        查看大图
                                                    </button>
                                                )}
                                                {onSetPersistentWallpaper && imageSrc && status === 'success' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { void (isPersistentWallpaper ? handleClearPersistentWallpaper?.() : handleSetPersistentWallpaper?.(imageSrc)); }}
                                                        disabled={busyActionKey === `set_persistent_wallpaper_${imageSrc}` || busyActionKey === 'clear_persistent_wallpaper'}
                                                        className={次级按钮样式()}
                                                    >
                                                        {isPersistentWallpaper ? '取消常驻壁纸' : '设为常驻壁纸'}
                                                    </button>
                                                )}
                                                {onSaveImageLocally && imageId && !hasLocalCopy && (
                                                    <button type="button" onClick={() => { void handleSaveNpcImageLocally?.(record.NPC标识, imageId); }} disabled={busyActionKey === `local_npc_${imageId}`} className={次级按钮样式()}>
                                                        保存到本地
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 min-h-[400px]">
                            <div className="text-wuxia-gold/20 text-6xl mb-4 font-serif"><IconScroll size={64} /></div>
                            <div className="text-wuxia-gold/60 font-serif text-lg mb-2">暂无历史记录</div>
                            <div className="text-gray-500 text-xs">成功、失败与处理中记录都会在这里留档，目前尚无记录。</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryTab;