import React from 'react';
import type { 
    NPC结构,
    NPC图片记录
} from '../../../../../types';
import { 
    状态样式, 
    状态文案,
    次级按钮样式
} from '../utils/imageManagerConstants';
import { 
    格式化时间,
    获取NPC构图文案,
    空状态
} from '../utils/imageManagerHelpers';

type NPC图库分组 = {
    npc: NPC结构;
    records: NPC图片记录[];
};

interface LibraryTabProps {
    npcLibraryGroups: NPC图库分组[];
    libraryNpcId: string;
    busyActionKey: string;
    currentPersistentWallpaper?: string;
    获取图片展示地址: (result: any) => string | undefined;
    是否存在本地图片副本: (result: any) => boolean;
    格式化本地图片描述: (path?: string) => string;
    打开图片查看器: (src: string, alt: string) => void;
    setLibraryNpcId: (id: string) => void;
    onSelectAvatarImage?: (npcId: string, imageId: string) => Promise<void> | void;
    onSelectPortraitImage?: (npcId: string, imageId: string) => Promise<void> | void;
    onSelectBackgroundImage?: (npcId: string, imageId: string) => Promise<void> | void;
    onClearAvatarImage?: (npcId: string) => Promise<void> | void;
    onClearPortraitImage?: (npcId: string) => Promise<void> | void;
    onClearBackgroundImage?: (npcId: string) => Promise<void> | void;
    onDeleteImageRecord?: (npcId: string, imageId: string) => Promise<void> | void;
    onClearImageHistory?: (npcId?: string) => Promise<void> | void;
    onSetPersistentWallpaper?: (imageUrl: string) => Promise<void> | void;
    onClearPersistentWallpaper?: () => Promise<void> | void;
    onSaveImageLocally?: (npcId: string, imageId: string) => Promise<void> | void;
    打开手动生图页: (npcId: string, composition?: string) => void;
    handleClearAvatarImage?: (npcId: string) => Promise<void>;
    handleClearPortraitImage?: (npcId: string) => Promise<void>;
    handleClearBackgroundImage?: (npcId: string) => Promise<void>;
    handleSelectAvatarImage?: (npcId: string, imageId: string) => Promise<void>;
    handleSelectPortraitImage?: (npcId: string, imageId: string) => Promise<void>;
    handleSelectBackgroundImage?: (npcId: string, imageId: string) => Promise<void>;
    handleDeleteImageRecord?: (npcId: string, imageId: string) => Promise<void>;
    handleClearNpcHistory?: (npcId: string) => Promise<void>;
    handleSetPersistentWallpaper?: (imageUrl: string) => Promise<void>;
    handleClearPersistentWallpaper?: () => Promise<void>;
    handleSaveNpcImageLocally?: (npcId: string, imageId: string) => Promise<void>;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
    npcLibraryGroups,
    libraryNpcId,
    busyActionKey,
    currentPersistentWallpaper,
    获取图片展示地址,
    是否存在本地图片副本,
    格式化本地图片描述,
    打开图片查看器,
    setLibraryNpcId,
    onSelectAvatarImage,
    onSelectPortraitImage,
    onSelectBackgroundImage,
    onClearAvatarImage,
    onClearPortraitImage,
    onClearBackgroundImage,
    onDeleteImageRecord,
    onClearImageHistory,
    onSetPersistentWallpaper,
    onClearPersistentWallpaper,
    onSaveImageLocally,
    打开手动生图页,
    handleClearAvatarImage,
    handleClearPortraitImage,
    handleClearBackgroundImage,
    handleSelectAvatarImage,
    handleSelectPortraitImage,
    handleSelectBackgroundImage,
    handleDeleteImageRecord,
    handleClearNpcHistory,
    handleSetPersistentWallpaper,
    handleClearPersistentWallpaper,
    handleSaveNpcImageLocally
}) => {
    const currentLibraryGroup = npcLibraryGroups.find(g => g.npc.id === libraryNpcId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-[160px_minmax(0,1fr)] lg:grid-cols-[184px_minmax(0,1fr)] gap-6">
            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 flex flex-col">
                <div className="flex items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 shrink-0">
                    <div>
                        <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">角色图库</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Character Archive</div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {npcLibraryGroups.map((group) => {
                        const isSelected = libraryNpcId === group.npc.id;
                        return (
                            <button
                                key={group.npc.id}
                                type="button"
                                onClick={() => setLibraryNpcId(group.npc.id)}
                                className={`w-full flex items-center justify-between p-3 rounded border transition-all duration-300 ${
                                    isSelected
                                        ? 'border-wuxia-gold/80 bg-wuxia-gold/15 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                        : 'border-wuxia-gold/10 bg-black/40 hover:border-wuxia-gold/40 hover:bg-white/5'
                                }`}
                            >
                                <div className="text-left">
                                    <div className={`font-serif ${isSelected ? 'text-wuxia-gold' : 'text-gray-300'}`}>{group.npc.姓名}</div>
                                </div>
                                <div className={`text-xs px-2 py-0.5 rounded ${isSelected ? 'bg-wuxia-gold/20 text-wuxia-gold border border-wuxia-gold/30' : 'bg-black/60 text-gray-400 border border-gray-800'}`}>
                                    {group.records.length}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 flex flex-col relative min-w-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
                
                {!currentLibraryGroup ? (
                    <空状态 title="未找到匹配图片" desc="未找到符合筛选条件的记录，请调整筛选条件或先生成图片。" />
                ) : (
                    <div className="flex flex-col h-full relative z-10 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-wuxia-gold/10 pb-4 shrink-0">
                            <div>
                                <div className="text-wuxia-gold font-serif text-2xl tracking-wider text-shadow-glow flex items-center gap-3">
                                    {currentLibraryGroup.npc.姓名}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-2 space-x-3 flex items-center">
                                    <span className="px-2 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5">{currentLibraryGroup.npc.性别 || '未知性别'}</span>
                                    <span className="px-2 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5">{currentLibraryGroup.npc.是否主要角色 ? '主要角色' : '普通角色'}</span>
                                    <span className="px-2 py-0.5 rounded border border-wuxia-gold/20 bg-wuxia-gold/5 text-wuxia-gold/80">共 {currentLibraryGroup.records.length} 张图片</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => 打开手动生图页(currentLibraryGroup.npc.id)} className={次级按钮样式()}>
                                    去生成图片
                                </button>
                                {onClearImageHistory && (
                                    <button
                                        type="button"
                                        onClick={() => { void handleClearNpcHistory?.(currentLibraryGroup.npc.id); }}
                                        disabled={busyActionKey === `clear_npc_history_${currentLibraryGroup.npc.id}`}
                                        className={次级按钮样式(true)}
                                    >
                                        清空记录
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                                {currentLibraryGroup.records.map((record) => {
                                    const result = record.结果;
                                    const status = result.状态 || 'success';
                                    const imageId = typeof result.id === 'string' ? result.id : '';
                                    const imageSrc = 获取图片展示地址(result);
                                    const selectedAvatarId = currentLibraryGroup.npc?.图片档案?.已选头像图片ID || '';
                                    const selectedPortraitId = currentLibraryGroup.npc?.图片档案?.已选立绘图片ID || '';
                                    const selectedBackgroundId = currentLibraryGroup.npc?.图片档案?.已选背景图片ID || '';
                                    const isSelectedAvatar = Boolean(imageId) && imageId === selectedAvatarId;
                                    const isSelectedPortrait = Boolean(imageId) && imageId === selectedPortraitId;
                                    const isSelectedBackground = Boolean(imageId) && imageId === selectedBackgroundId;
                                    const canSelectAvatar = Boolean(onSelectAvatarImage && imageId && status === 'success' && imageSrc && result.构图 === '头像');
                                    const canSelectPortrait = Boolean(onSelectPortraitImage && imageId && status === 'success' && imageSrc && (result.构图 === '半身' || result.构图 === '立绘'));
                                    const canSelectBackground = Boolean(onSelectBackgroundImage && imageId && status === 'success' && imageSrc);
                                    const hasLocalCopy = 是否存在本地图片副本(result);
                                    const normalizedPersistentWallpaper = typeof currentPersistentWallpaper === 'string' ? currentPersistentWallpaper.trim() : '';
                                    const isPersistentWallpaper = Boolean(imageSrc && normalizedPersistentWallpaper && imageSrc === normalizedPersistentWallpaper);
                                    const 当前用途标签 = [
                                        isSelectedAvatar ? '已设头像' : '',
                                        isSelectedPortrait ? '已设立绘' : '',
                                        isSelectedBackground ? '已设背景' : '',
                                        isPersistentWallpaper ? '常驻壁纸' : ''
                                    ].filter(Boolean);
                                    
                                    return (
                                        <div key={`${record.NPC标识}_${imageId || result.生成时间}`} className="rounded border border-wuxia-gold/20 bg-black/40 overflow-hidden flex flex-col hover:border-wuxia-gold/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all duration-300 group">
                                            <div className="aspect-[3/4] bg-[radial-gradient(circle_at_center,#1a1a1c,black)] border-b border-wuxia-gold/10 flex items-center justify-center relative overflow-hidden">
                                                {imageSrc ? (
                                                    <button
                                                        type="button"
                                                        className="block w-full h-full"
                                                        onClick={() => 打开图片查看器(imageSrc, `${record.NPC姓名} ${获取NPC构图文案(result.构图, result.部位)}`)}
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
                                                    {当前用途标签.map((label) => (
                                                        <span
                                                            key={`${imageId}_${label}`}
                                                            className="rounded border border-wuxia-gold/60 bg-wuxia-gold/20 backdrop-blur-sm px-2 py-0.5 text-[10px] text-wuxia-gold shadow-[0_0_10px_rgba(212,175,55,0.3)] w-fit"
                                                        >
                                                            {label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1 bg-gradient-to-b from-transparent to-black/30">
                                                <div className="flex items-start justify-between gap-3 border-b border-wuxia-gold/10 pb-2 mb-3">
                                                    <div className="text-sm font-serif text-wuxia-gold/90">{获取NPC构图文案(result.构图, result.部位)}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono tracking-wider">{格式化时间(result.生成时间)}</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-[11px] mb-3">
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/40 p-2 text-center text-gray-300">
                                                        <div className="text-wuxia-gold/50 mb-1">使用模型</div>
                                                        <div className="truncate">{result.使用模型 || '未记录'}</div>
                                                    </div>
                                                    <div className="rounded border border-wuxia-gold/10 bg-black/40 p-2 text-center text-gray-300">
                                                        <div className="text-wuxia-gold/50 mb-1">画风</div>
                                                        <div className="truncate">{result.画风 || '未记录'}</div>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-gray-600 mb-4 h-4 truncate" title={格式化本地图片描述(result.本地路径)}>
                                                    本地路径：{格式化本地图片描述(result.本地路径)}
                                                </div>
                                                <div className="mt-auto pt-2 flex flex-col gap-2 border-t border-wuxia-gold/10">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        {canSelectAvatar && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelectedAvatar) {
                                                                        void handleClearAvatarImage?.(record.NPC标识);
                                                                    } else {
                                                                        void handleSelectAvatarImage?.(record.NPC标识, imageId);
                                                                    }
                                                                }}
                                                                disabled={isSelectedAvatar ? busyActionKey === `clear_avatar_${record.NPC标识}` : busyActionKey === `select_avatar_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isSelectedAvatar ? '取消设置头像' : '设为头像'}
                                                            </button>
                                                        )}
                                                        {canSelectPortrait && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelectedPortrait) {
                                                                        void handleClearPortraitImage?.(record.NPC标识);
                                                                    } else {
                                                                        void handleSelectPortraitImage?.(record.NPC标识, imageId);
                                                                    }
                                                                }}
                                                                disabled={isSelectedPortrait ? busyActionKey === `clear_portrait_${record.NPC标识}` : busyActionKey === `select_portrait_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isSelectedPortrait ? '取消设置立绘' : '设为立绘'}
                                                            </button>
                                                        )}
                                                        {canSelectBackground && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isSelectedBackground) {
                                                                        void handleClearBackgroundImage?.(record.NPC标识);
                                                                    } else {
                                                                        void handleSelectBackgroundImage?.(record.NPC标识, imageId);
                                                                    }
                                                                }}
                                                                disabled={isSelectedBackground ? busyActionKey === `clear_background_${record.NPC标识}` : busyActionKey === `select_background_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isSelectedBackground ? '取消设置背景' : '设为背景'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        {onSetPersistentWallpaper && imageSrc && status === 'success' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (isPersistentWallpaper) {
                                                                        void handleClearPersistentWallpaper?.();
                                                                    } else {
                                                                        void handleSetPersistentWallpaper?.(imageSrc);
                                                                    }
                                                                }}
                                                                className={次级按钮样式()}
                                                            >
                                                                {isPersistentWallpaper ? '取消常驻壁纸' : '设为常驻壁纸'}
                                                            </button>
                                                        )}
                                                        {onSaveImageLocally && imageId && !hasLocalCopy && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void handleSaveNpcImageLocally?.(record.NPC标识, imageId); }}
                                                                disabled={busyActionKey === `local_npc_${imageId}`}
                                                                className={次级按钮样式()}
                                                            >
                                                                保存到本地
                                                            </button>
                                                        )}
                                                        {onDeleteImageRecord && imageId && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { void handleDeleteImageRecord?.(record.NPC标识, imageId); }}
                                                                disabled={busyActionKey === `delete_image_${imageId}`}
                                                                className={次级按钮样式(true)}
                                                            >
                                                                删除图片
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryTab;