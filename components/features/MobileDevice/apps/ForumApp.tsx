import React, { useState, useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

interface ForumPost {
    id: string;
    author: string;
    title: string;
    content: string;
    category: string;
    time: string;
    replies: number;
    views: number;
    replyList: { author: string; content: string; time: string }[];
}

const ForumApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '论坛';
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [activeCategory, setActiveCategory] = useState('全部');

    const posts: ForumPost[] = useMemo(() => {
        const result: ForumPost[] = [];
        const ctx = gameContext;
        if (!ctx?.世界) return result;

        // 进行中事件 → 论坛热帖
        if (ctx.世界.进行中事件) {
            ctx.世界.进行中事件.forEach((event, idx) => {
                result.push({
                    id: `ongoing-${idx}`,
                    author: event.关联人物?.[0] || '江湖传闻',
                    title: event.事件名,
                    content: event.事件说明,
                    category: '江湖情报',
                    time: event.开始时间 || '近日',
                    replies: event.关联人物?.length || 0,
                    views: Math.floor(Math.random() * 500) + 50,
                    replyList: event.关联人物.slice(1).map((person) => ({
                        author: person,
                        content: `涉及此事，${person}亦有参与。`,
                        time: event.开始时间 || '近日',
                    })),
                });
            });
        }

        // 已结算事件 → 历史帖
        if (ctx.世界.已结算事件) {
            ctx.世界.已结算事件.slice(-5).forEach((event, idx) => {
                const 结果 = event.事件结果?.join('; ') || '已了结';
                result.push({
                    id: `settled-${idx}`,
                    author: event.关联人物?.[0] || '史官',
                    title: `[已结案] ${event.事件名}`,
                    content: `${event.事件说明}\n结果: ${结果}`,
                    category: '武林旧事',
                    time: event.结算时间 || '往昔',
                    replies: event.关联人物?.length || 0,
                    views: Math.floor(Math.random() * 300) + 30,
                    replyList: [],
                });
            });
        }

        // 世界镜头规划 → 讨论帖
        if (ctx.世界.世界镜头规划) {
            ctx.世界.世界镜头规划.slice(-3).forEach((lens, idx) => {
                result.push({
                    id: `lens-${idx}`,
                    author: lens.关联人物?.[0] || '说书人',
                    title: lens.镜头标题,
                    content: lens.镜头内容 || '',
                    category: '武林杂谈',
                    time: lens.触发时间 || '近日',
                    replies: lens.关联人物?.length || 0,
                    views: Math.floor(Math.random() * 200) + 20,
                    replyList: [],
                });
            });
        }

        return result;
    }, [gameContext?.世界]);

    const categories = ['全部', ...Array.from(new Set(posts.map((p) => p.category)))];
    const filteredPosts = activeCategory === '全部'
        ? posts
        : posts.filter((p) => p.category === activeCategory);

    if (selectedPost) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white transition-colors">←</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{selectedPost.title}</h3>
                        <span className="text-[10px] text-gray-500">{selectedPost.author} · {selectedPost.time}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="rounded-lg bg-gray-800/40 border border-gray-700/30 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-wuxia-gold/60 bg-wuxia-gold/10 px-1.5 py-0.5 rounded">{selectedPost.category}</span>
                            <span className="text-[10px] text-gray-500">{selectedPost.views} 浏览</span>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                    </div>
                    {selectedPost.replyList.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-400 mb-2">{selectedPost.replyList.length} 条回复</h4>
                            <div className="space-y-3">
                                {selectedPost.replyList.map((reply, idx) => (
                                    <div key={idx} className="rounded-lg bg-gray-900/40 border border-gray-800/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-wuxia-gold/70">{reply.author}</span>
                                            <span className="text-[10px] text-gray-500">{reply.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-300">{reply.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            {categories.length > 1 && (
                <div className="flex gap-1 px-4 py-2 overflow-x-auto border-b border-gray-800/30">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-wuxia-gold/20 text-wuxia-gold' : 'text-gray-400 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
            <div className="flex-1 overflow-y-auto">
                {filteredPosts.length > 0 ? (
                    <ul className="divide-y divide-gray-800/50">
                        {filteredPosts.map((post) => (
                            <li key={post.id}>
                                <button
                                    onClick={() => setSelectedPost(post)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] text-wuxia-gold/60 bg-wuxia-gold/10 px-1.5 py-0.5 rounded">{post.category}</span>
                                        <span className="text-sm text-white font-medium truncate">{post.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                        <span>{post.author}</span>
                                        <span>{post.time}</span>
                                        <span>回复 {post.replies}</span>
                                        <span>浏览 {post.views}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">📋</span>
                        <p className="text-sm text-gray-400">暂无帖子</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForumApp;
