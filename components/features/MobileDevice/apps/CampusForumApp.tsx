import React, { useState, useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { 论坛帖子 } from '../../../../models/campusPhone';
import type { BDSM论坛帖子, BDSM帖子分类, 联系对话 } from '../../../../models/campusNSFW/bdsm-forum';
import type { NPC结构 } from '../../../../models/domain/social';
import { 从BDSM帖子创建NPC } from '../../../../hooks/useGame/bdsmForumEngine';
import BDSMContactModal from './BDSMContactModal';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    onUnlockNPC?: (npc: NPC结构) => void;
}

const 论坛分类 = ['全部', '校园资讯', '学术交流', '社团活动', '情感树洞', '匿名灌水', '求助答疑'];
const BDSM子分类: BDSM帖子分类[] = ['匿名讨论', '经验交流', '物品话题', '心理探索', '安全科普', '寻主召奴'];

const 回复话术池 = [
    '确实如此，深有同感。',
    '此楼说得在理。',
    '我也遇到过类似的情况。',
    '楼上说的对，补充一下我的看法。',
    '不太同意，事情没那么简单。',
    '这个观点有意思。',
    '感谢分享，学到了。',
];

const CampusForumApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, onRefresh, isRefreshing, onUnlockNPC }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '校园论坛';

    // 当前激活的主分类（普通论坛 / BDSM）
    const [activeBoard, setActiveBoard] = useState<'forum' | 'bdsm'>('forum');
    const [selectedPost, setSelectedPost] = useState<论坛帖子 | BDSM论坛帖子 | null>(null);
    const [contactingPost, setContactingPost] = useState<BDSM论坛帖子 | null>(null);
    const [activeCategory, setActiveCategory] = useState('全部');
    const [activeBDSMSub, setActiveBDSMSub] = useState<BDSM帖子分类 | '全部'>('全部');

    const handleContactPost = (post: BDSM论坛帖子) => {
        setContactingPost(post);
    };

    const handleContactConfirm = (
        _对话记录: 联系对话[],
        结果: '建立关系' | '已拒绝' | '沟通中'
    ) => {
        if (contactingPost && 结果 === '建立关系') {
            const newNpc = 从BDSM帖子创建NPC(contactingPost);
            onUnlockNPC?.(newNpc);
        }
        setContactingPost(null);
    };

    // 普通论坛帖子
    const posts: 论坛帖子[] = useMemo(() => {
        const systemPosts = gameContext?.校园系统?.论坛帖子列表;
        if (systemPosts && systemPosts.length > 0) return systemPosts;

        const result: 论坛帖子[] = [];
        const events = gameContext?.世界?.进行中事件 || [];
        events.forEach((event, idx) => {
            const replies = (event.关联人物 || []).slice(1, 4).map((person, ri) => ({
                id: `reply-${idx}-${ri}`,
                作者: person,
                内容: 回复话术池[(idx + ri) % 回复话术池.length],
                回复时间: event.开始时间 || '近日',
                楼层: ri + 1,
            }));
            result.push({
                id: `event-${idx}`,
                作者: event.关联人物?.[0] || '匿名',
                标题: event.事件名,
                内容: event.事件说明 || '',
                分类: '校园资讯',
                发布时间: event.开始时间 || '近日',
                回复数: replies.length,
                浏览数: (idx + 1) * 100,
                点赞数: Math.max(1, 10 - idx),
                是否置顶: idx === 0,
                是否精华: false,
                回复列表: replies,
            });
        });
        return result;
    }, [gameContext?.校园系统?.论坛帖子列表, gameContext?.世界?.进行中事件]);

    // BDSM 帖子
    const bdsmPosts: BDSM论坛帖子[] = useMemo(() => {
        return gameContext?.校园系统?.BDSM帖子列表 || [];
    }, [gameContext?.校园系统?.BDSM帖子列表]);

    const filteredPosts = useMemo(() => {
        if (activeBoard === 'bdsm') {
            if (activeBDSMSub === '全部') return bdsmPosts;
            return bdsmPosts.filter(p => p.子分类 === activeBDSMSub);
        }
        if (activeCategory === '全部') return posts;
        return posts.filter(p => p.分类 === activeCategory);
    }, [activeBoard, activeCategory, activeBDSMSub, posts, bdsmPosts]);

    const isBDSMPost = (post: 论坛帖子 | BDSM论坛帖子): post is BDSM论坛帖子 => {
        return '子分类' in post && '影响等级' in post;
    };

    // ========== 帖子详情页 ==========
    // ========== 联系对话框 ==========
    if (contactingPost) {
        return (
            <BDSMContactModal
                post={contactingPost}
                onBack={() => setContactingPost(null)}
                onConfirm={handleContactConfirm}
            />
        );
    }

    // ========== 帖子详情页 ==========
    if (selectedPost) {
        const isBDSM = isBDSMPost(selectedPost);
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{selectedPost.标题}</h3>
                        <span className="text-[10px] text-gray-500">{selectedPost.作者} &middot; {selectedPost.发布时间}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className={`rounded-lg border p-3 ${isBDSM ? 'bg-red-950/30 border-red-800/30' : 'bg-gray-800/40 border-gray-700/30'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                {isBDSM && (
                                    <span className="text-[10px] text-red-400/60 bg-red-400/10 px-1.5 py-0.5 rounded">深夜</span>
                                )}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isBDSM ? 'text-red-400/60 bg-red-400/10' : 'text-blue-400/60 bg-blue-400/10'}`}>
                                    {isBDSM ? (selectedPost as BDSM论坛帖子).子分类 : selectedPost.分类}
                                </span>
                                {isBDSM && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                        selectedPost.影响等级 === '严重' ? 'text-red-300 bg-red-500/20'
                                        : selectedPost.影响等级 === '中等' ? 'text-orange-300 bg-orange-500/20'
                                        : 'text-gray-400 bg-gray-500/20'
                                    }`}>
                                        {selectedPost.影响等级}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-500">{selectedPost.浏览数} 浏览</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{selectedPost.内容}</p>
                    </div>
                    {isBDSM && (selectedPost as BDSM论坛帖子).寻主召奴信息 && (
                        <div className="rounded-lg border border-purple-700/40 bg-purple-950/30 p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-purple-300">寻主召奴帖</span>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        方向：{(selectedPost as BDSM论坛帖子).寻主召奴信息!.招募方角色} &middot; 关系：{(selectedPost as BDSM论坛帖子).寻主召奴信息!.期望关系类型}
                                    </p>
                                </div>
                                {(selectedPost as BDSM论坛帖子).寻主召奴信息!.是否已联系 ? (
                                    <span className="text-[10px] text-gray-500 px-2 py-1">已联系</span>
                                ) : (
                                    <button
                                        onClick={() => handleContactPost(selectedPost as BDSM论坛帖子)}
                                        className="text-xs bg-purple-600/80 hover:bg-purple-500 text-white px-3 py-1.5 rounded transition-colors"
                                    >联系TA</button>
                                )}
                            </div>
                        </div>
                    )}
                    {selectedPost.回复列表.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">{selectedPost.回复列表.length} 条回复</h4>
                            <div className="space-y-3">
                                {selectedPost.回复列表.map(reply => (
                                    <div key={reply.id} className="rounded-lg bg-gray-900/40 border border-gray-800/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-blue-300/70">{reply.作者}</span>
                                            <span className="text-[10px] text-gray-500">{reply.回复时间}</span>
                                        </div>
                                        <p className="text-sm text-gray-300">{reply.内容}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ========== 列表页 ==========
    return (
        <div className="flex flex-col h-full">
            {/* 顶部栏 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white flex-1">{appName}</h3>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                            isRefreshing
                                ? 'bg-gray-600/40 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-600/80 hover:bg-purple-500 text-white'
                        }`}
                    >{isRefreshing && (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    )}{isRefreshing ? '刷新中...' : 'AI 刷新'}</button>
                )}
            </div>

            {/* 板块切换 */}
            <div className="flex gap-1 px-4 py-2 border-b border-gray-800/30">
                <button
                    onClick={() => { setActiveBoard('forum'); setActiveCategory('全部'); }}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${activeBoard === 'forum' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                >论坛</button>
                <button
                    onClick={() => { setActiveBoard('bdsm'); setActiveBDSMSub('全部'); }}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${activeBoard === 'bdsm' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
                >深夜板块</button>
            </div>

            {/* 子分类筛选 */}
            <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-gray-800/30">
                {activeBoard === 'forum' ? (
                    论坛分类.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                        >{cat}</button>
                    ))
                ) : (
                    ['全部' as const, ...BDSM子分类].map(sub => (
                        <button
                            key={sub}
                            onClick={() => setActiveBDSMSub(sub)}
                            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${activeBDSMSub === sub ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
                        >{sub}</button>
                    ))
                )}
            </div>

            {/* 帖子列表 */}
            <div className="flex-1 overflow-y-auto">
                {filteredPosts.length > 0 ? (
                    <ul className="divide-y divide-gray-800/50">
                        {filteredPosts.map(post => {
                            const isBDSM = isBDSMPost(post);
                            return (
                                <li key={post.id}>
                                    <button
                                        onClick={() => setSelectedPost(post)}
                                        className={`w-full px-4 py-3 text-left transition-colors ${isBDSM ? 'hover:bg-red-950/20' : 'hover:bg-gray-800/30'}`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {post.是否置顶 && <span className="text-[10px] text-red-400 bg-red-400/10 px-1 rounded">置顶</span>}
                                            {isBDSM && (
                                                <span className="text-[10px] text-red-400/60 bg-red-400/10 px-1.5 py-0.5 rounded">深夜</span>
                                            )}
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isBDSM ? 'text-red-400/60 bg-red-400/10' : 'text-blue-400/60 bg-blue-400/10'}`}>
                                                {isBDSM ? (post as BDSM论坛帖子).子分类 : post.分类}
                                            </span>
                                            <span className={`text-sm font-medium truncate ${isBDSM ? 'text-gray-200' : 'text-white'}`}>{post.标题}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                            <span>{post.作者}</span>
                                            <span>{post.发布时间}</span>
                                            <span>回复 {post.回复数}</span>
                                            <span>浏览 {post.浏览数}</span>
                                            {isBDSM && <span className="text-red-500/60">[{post.影响等级}]</span>}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">&#128203;</span>
                        <p className="text-sm text-gray-400">{activeBoard === 'bdsm' ? '深夜板块暂无帖子' : '暂无帖子'}</p>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={isRefreshing}
                                className={`mt-3 text-xs px-4 py-2 rounded transition-colors flex items-center gap-1 ${
                                    isRefreshing
                                        ? 'bg-gray-600/40 text-gray-400 cursor-not-allowed'
                                        : 'bg-purple-600/80 hover:bg-purple-500 text-white'
                                }`}
                            >{isRefreshing && (
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            )}{isRefreshing ? '生成中...' : 'AI 生成内容'}</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusForumApp;
