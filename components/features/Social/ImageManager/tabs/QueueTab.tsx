import React from 'react';
import type { 
    NPC结构,
    NPC图片记录,
    场景图片档案,
    场景生图任务记录,
    NPC生图任务记录,
    图片管理筛选条件,
    接口设置结构,
    图片管理设置结构,
    香闺秘档部位类型,
    画师串预设结构,
    角色锚点结构
} from '../../../../../types';
import { IconScroll } from '../../../../ui/Icons';
import { 
    队列状态样式, 
    队列状态文案, 
    次级按钮样式
} from '../utils/imageManagerConstants';
import { 
    获取生图阶段中文, 
    从任务状态推导阶段,
    格式化时间,
    从任务标识提取NPCID,
    获取NPC构图文案
} from '../utils/imageManagerHelpers';

type 合并队列记录 = {
    类型: 'npc' | 'scene';
    id: string;
    创建时间: number;
    状态: NPC生图任务记录['状态'];
    task: NPC生图任务记录 | 场景生图任务记录;
};

interface QueueTabProps {
    filteredCombinedQueue: 合并队列记录[];
    busyActionKey: string;
    onDeleteQueueTask?: (taskId: string) => Promise<void> | void;
    onClearQueue?: (mode?: 'all' | 'completed') => Promise<void> | void;
    onDeleteSceneQueueTask?: (taskId: string) => Promise<void> | void;
    onClearSceneQueue?: (mode?: 'all' | 'completed') => Promise<void> | void;
    onRetryImage?: (npcId: string) => Promise<void> | void;
    onGenerateImage?: (npcId: string, options?: { 构图?: '头像' | '半身' | '立绘'; 画风?: string; 画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string; 额外要求?: string; 尺寸?: string; 后台处理?: boolean }) => Promise<void> | void;
    打开手动生图页: (npcId: string, composition?: string) => void;
}

export const QueueTab: React.FC<QueueTabProps> = ({
    filteredCombinedQueue,
    busyActionKey,
    onDeleteQueueTask,
    onClearQueue,
    onDeleteSceneQueueTask,
    onClearSceneQueue,
    onRetryImage,
    打开手动生图页
}) => {
    const 来源文案: Record<string, string> = {
        auto: '自动',
        manual: '手动',
        retry: '重试'
    };

    return (
        <div className="flex flex-col h-full bg-[#0c0d0f]/90 border border-wuxia-gold/30 rounded shadow-[0_0_30px_rgba(212,175,55,0.05)] p-5 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_100%)] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex flex-wrap items-center justify-between border-b border-wuxia-gold/10 pb-4 mb-4 shrink-0 gap-4">
                    <div>
                        <div className="text-wuxia-gold font-serif text-xl tracking-wider text-shadow-glow">统一生成队列</div>
                        <div className="text-[10px] text-gray-500 mt-1">所有角色和场景的生成任务都会显示在这里。</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {onClearQueue && (
                            <>
                                <button type="button" onClick={() => { void onClearQueue('completed'); }} disabled={busyActionKey === 'clear_queue_completed'} className={次级按钮样式(true)}>
                                    清空已完成 NPC 任务
                                </button>
                                <button type="button" onClick={() => { void onClearQueue('all'); }} disabled={busyActionKey === 'clear_queue_all'} className={次级按钮样式(true)}>
                                    清空全部 NPC 任务
                                </button>
                            </>
                        )}
                        {onClearSceneQueue && (
                            <>
                                <button type="button" onClick={() => { void onClearSceneQueue('completed'); }} disabled={busyActionKey === 'clear_scene_queue_completed'} className={次级按钮样式(true)}>
                                    清空已完成场景任务
                                </button>
                                <button type="button" onClick={() => { void onClearSceneQueue('all'); }} disabled={busyActionKey === 'clear_scene_queue_all'} className={次级按钮样式(true)}>
                                    清空全部场景任务
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {filteredCombinedQueue.length > 0 ? (
                        filteredCombinedQueue.map((entry) => {
                            if (entry.类型 === 'scene') {
                                const task = entry.task as 场景生图任务记录;
                                return (
                                    <div key={task.id} className="rounded border border-wuxia-gold/20 bg-black/40 p-4 relative group hover:border-wuxia-gold/40 transition-colors">
                                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-wuxia-gold/10 border-b border-l border-wuxia-gold/20 text-[10px] text-wuxia-gold/80 font-serif rounded-bl">
                                            场景任务
                                        </div>
                                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                            <div className="pr-16">
                                                <div className="text-lg font-serif text-wuxia-gold/90">{task.摘要 || '未命名场景'}</div>
                                                <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded bg-black/50 border border-wuxia-gold/10 text-wuxia-gold/70">{task.场景类型 || '未分类'}</span>
                                                    <span>来源: {来源文案[task.来源]}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[11px] px-2.5 py-1 rounded border shadow-sm ${队列状态样式[task.状态]}`}>{队列状态文案[task.状态]}</span>
                                                {onDeleteSceneQueueTask && (
                                                    <button type="button" onClick={() => { void onDeleteSceneQueueTask(task.id); }} disabled={busyActionKey === `delete_scene_queue_${task.id}`} className={次级按钮样式(true)}>
                                                        删除
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-[11px]">
                                            <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5">
                                                <div className="text-wuxia-gold/50 mb-1">创建时间</div>
                                                <div className="text-gray-300 font-mono text-[10px]">{格式化时间(task.创建时间)}</div>
                                            </div>
                                            <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5">
                                                <div className="text-wuxia-gold/50 mb-1">开始 / 完成</div>
                                                <div className="text-gray-300 font-mono text-[10px]">{格式化时间(task.开始时间)} / {格式化时间(task.完成时间)}</div>
                                            </div>
                                            <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5">
                                                <div className="text-wuxia-gold/50 mb-1">模型 / 画风</div>
                                                <div className="text-gray-300 truncate" title={[task.使用模型, task.画风].filter(Boolean).join(' / ')}>{[task.使用模型, task.画风].filter(Boolean).join(' / ') || '未定'}</div>
                                            </div>
                                            <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5 relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-wuxia-gold/30"></div>
                                                <div className="text-wuxia-gold/50 mb-1 pl-1">任务进度 ({获取生图阶段中文(task.进度阶段 || 从任务状态推导阶段(task.状态))})</div>
                                                <div className="text-gray-300 pl-1">{task.进度文本 || task.错误信息 || '场景生成中...'}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            const task = entry.task as NPC生图任务记录;
                            return (
                                <div key={task.id} className="rounded border border-wuxia-gold/20 bg-black/40 p-4 relative group hover:border-wuxia-gold/40 transition-colors">
                                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-wuxia-gold/10 border-b border-l border-wuxia-gold/20 text-[10px] text-wuxia-gold/80 font-serif rounded-bl">
                                        角色任务
                                    </div>
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                        <div className="pr-16">
                                            <div className="text-lg font-serif text-wuxia-gold/90">{task.NPC姓名}</div>
                                            <div className="text-[10px] text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                                                <span>{task.NPC性别 || '未知'}</span>
                                                <span>{task.NPC身份 || '未知身份'}</span>
                                                <span className="px-1.5 py-0.5 rounded bg-black/50 border border-wuxia-gold/10 text-wuxia-gold/70">{获取NPC构图文案(task.构图, task.部位)}</span>
                                                <span>来源: {来源文案[task.来源]}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] px-2.5 py-1 rounded border shadow-sm ${队列状态样式[task.状态]}`}>{队列状态文案[task.状态]}</span>
                                            {onDeleteQueueTask && (
                                                <button type="button" onClick={() => { void onDeleteQueueTask(task.id); }} disabled={busyActionKey === `delete_queue_${task.id}`} className={次级按钮样式(true)}>
                                                    删除
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-[11px]">
                                        <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5">
                                            <div className="text-wuxia-gold/50 mb-1">创建时间</div>
                                            <div className="text-gray-300 font-mono text-[10px]">{格式化时间(task.创建时间)}</div>
                                        </div>
                                        <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5">
                                            <div className="text-wuxia-gold/50 mb-1">开始 / 完成</div>
                                            <div className="text-gray-300 font-mono text-[10px]">{格式化时间(task.开始时间)} / {格式化时间(task.完成时间)}</div>
                                        </div>
                                        <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5">
                                            <div className="text-wuxia-gold/50 mb-1">模型 / 画风</div>
                                            <div className="text-gray-300 truncate" title={[task.使用模型, task.画风].filter(Boolean).join(' / ')}>{[task.使用模型, task.画风].filter(Boolean).join(' / ') || '未定'}</div>
                                        </div>
                                        <div className="rounded border border-wuxia-gold/10 bg-black/50 p-2.5 relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-wuxia-gold/30"></div>
                                            <div className="text-wuxia-gold/50 mb-1 pl-1">任务进度 ({获取生图阶段中文(task.进度阶段 || 从任务状态推导阶段(task.状态))})</div>
                                            <div className="text-gray-300 pl-1">{task.进度文本 || task.错误信息 || '图片生成中...'}</div>
                                        </div>
                                    </div>
                                    {task.状态 === 'failed' && (
                                        <div className="mt-4 pt-3 border-t border-wuxia-gold/10 flex flex-wrap justify-end gap-2">
                                            {task.构图 !== '部位特写' && (
                                                <button type="button" onClick={() => 打开手动生图页(从任务标识提取NPCID(task.NPC标识), task.构图 === '部位特写' ? '头像' : (task.构图 || '头像'))} className={次级按钮样式()}>
                                                    手动重试
                                                </button>
                                            )}
                                            {onRetryImage && task.构图 !== '部位特写' && (
                                                <button type="button" onClick={() => onRetryImage(从任务标识提取NPCID(task.NPC标识))} className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded border border-wuxia-gold/40 bg-wuxia-gold/10 text-wuxia-gold hover:bg-wuxia-gold/20 text-xs transition-colors shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                                                    重试任务
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                            <div className="text-wuxia-gold/20 text-6xl mb-4 font-serif">☯</div>
                            <div className="text-wuxia-gold/60 font-serif text-lg mb-2">当前没有生成任务</div>
                            <div className="text-gray-500 text-xs">新的角色或场景生成任务会显示在这里。</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QueueTab;