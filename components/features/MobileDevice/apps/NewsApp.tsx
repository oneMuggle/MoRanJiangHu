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

interface NewsItem {
    id: string;
    title: string;
    source: string;
    time: string;
    summary: string;
    category: string;
    urgent: boolean;
}

const NewsApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '资讯';

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const news: NewsItem[] = useMemo(() => {
        const result: NewsItem[] = [];
        const ctx = gameContext;
        if (!ctx) return result;

        // 当前章节 → 头条
        if (ctx.剧情?.当前章节) {
            const chapter = ctx.剧情.当前章节;
            result.push({
                id: 'chapter-headline',
                title: chapter.标题 || '当前章节',
                source: '江湖快报',
                time: '最新',
                summary: chapter.原著章节标题 || chapter.当前待解问题?.join('; ') || '剧情进行中',
                category: '武林要闻',
                urgent: true,
            });
        }

        // 下一章预告 → 前瞻
        if (ctx.剧情?.下一章预告) {
            const preview = ctx.剧情.下一章预告;
            result.push({
                id: 'chapter-preview',
                title: `【预告】${preview.标题 || '下一章'}`,
                source: '天机阁',
                time: '近日',
                summary: preview.大纲?.join('; ') || '剧情即将展开',
                category: '剧情前瞻',
                urgent: false,
            });
        }

        // 进行中事件 → 资讯
        if (ctx.世界?.进行中事件) {
            ctx.世界.进行中事件.forEach((event, idx) => {
                result.push({
                    id: `world-${idx}`,
                    title: event.事件名,
                    source: '江湖见闻',
                    time: event.开始时间 || '近日',
                    summary: event.事件说明,
                    category: '江湖动态',
                    urgent: false,
                });
            });
        }

        // 世界镜头 → 资讯
        if (ctx.世界?.世界镜头规划) {
            ctx.世界.世界镜头规划.slice(-3).forEach((lens, idx) => {
                result.push({
                    id: `lens-${idx}`,
                    title: lens.镜头标题,
                    source: '江湖见闻',
                    time: lens.触发时间 || '近日',
                    summary: lens.镜头内容 || '',
                    category: '江湖镜头',
                    urgent: false,
                });
            });
        }

        return result;
    }, [gameContext]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
                {news.some((n) => n.urgent) && (
                    <span className="ml-auto text-[10px] text-red-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                        紧急
                    </span>
                )}
            </div>
            <div className="flex-1 overflow-y-auto">
                {news.length > 0 ? (
                    <ul className="divide-y divide-gray-800/50">
                        {news.map((item) => {
                            const isExpanded = expandedId === item.id;
                            return (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-800/30 transition-colors"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {item.urgent && (
                                                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">急</span>
                                                    )}
                                                    <span className="text-[10px] text-wuxia-gold/60 bg-wuxia-gold/10 px-1.5 py-0.5 rounded">{item.category}</span>
                                                </div>
                                                <h4 className="text-sm text-white font-medium mb-1">{item.title}</h4>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                    <span>{item.source}</span>
                                                    <span>{item.time}</span>
                                                </div>
                                                {isExpanded && (
                                                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">{item.summary}</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">📰</span>
                        <p className="text-sm text-gray-400">暂无资讯</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsApp;
