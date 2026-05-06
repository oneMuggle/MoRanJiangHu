import React, { useMemo } from 'react';
import { DeviceMode, MobileApp } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { DeviceGameContext } from '../../../../models/mobileDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

interface AlbumImage {
    id: string;
    thumbnail: string;
    title: string;
    date: string;
}

const AlbumApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '相册';

    // 从游戏历史记录中提取场景图片信息
    const gameImages: AlbumImage[] = useMemo(() => {
        if (!gameContext?.历史记录 || gameContext.历史记录.length === 0) {
            return [];
        }

        const result: AlbumImage[] = [];
        const history = gameContext.历史记录;

        // 遍历历史记录，查找包含场景描述的内容作为图片来源
        // 提取最近的非 system 消息作为图片场景描述
        const relevantHistory = history
            .filter((h) => h.role !== 'system')
            .slice(-20); // 最近20条

        relevantHistory.forEach((item, idx) => {
            // 从聊天内容中提取场景描述作为图片标题
            const text = item.content || '';
            // 查找包含场景描述的关键词
            if (text.includes('来到') || text.includes('进入') || text.includes('发现') || text.includes('看到')) {
                // 提取第一个场景描述的句子作为标题
                const sentences = text.split(/[。！？]/);
                for (const sentence of sentences) {
                    if (sentence.includes('来到') || sentence.includes('进入') || sentence.includes('发现')) {
                        const title = sentence.trim().substring(0, 20);
                        if (title.length > 3) {
                            result.push({
                                id: `game-img-${idx}-${Date.now()}`,
                                thumbnail: '', // 游戏内图片需要通过其他方式获取
                                title: title + '…',
                                date: item.gameTime || '近日',
                            });
                            break;
                        }
                    }
                }
            }
        });

        return result.slice(0, 6); // 最多6张
    }, [gameContext?.历史记录]);

    // 默认的 CDN 图片（当没有游戏图片时使用）
    const defaultImages: AlbumImage[] = [
        { id: '1', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_mountain_retreat.jpg', title: '山间隐居', date: '甲子年三月初一' },
        { id: '2', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_marriage_tree.jpg', title: '姻缘树', date: '甲子年二月初八' },
        { id: '3', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_tomb_ruins.jpg', title: '古墓秘境', date: '甲子年正月十五' },
        { id: '4', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_sea_adventure.jpg', title: '出海冒险', date: '癸亥年腊月廿八' },
        { id: '5', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_moon_blossom.jpg', title: '月下表白', date: '癸亥年腊月初五' },
        { id: '6', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_falling_leaves.jpg', title: '离别场景', date: '癸亥年九月初三' },
    ];

    // 合并游戏图片和默认图片
    const albumImages = gameImages.length > 0 ? gameImages : defaultImages;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
                <span className="text-xs text-gray-500 ml-auto">{albumImages.length} 张</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                {gameImages.length > 0 && (
                    <div className="mb-3 px-1">
                        <p className="text-[10px] text-wuxia-gold/60">来自游戏历程</p>
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {albumImages.map((img) => (
                        <div key={img.id} className="rounded-lg overflow-hidden bg-gray-800/60 border border-gray-700/30 hover:border-wuxia-gold/40 transition-colors cursor-pointer group">
                            <div className="aspect-square flex items-center justify-center bg-gray-900/50 group-hover:scale-105 transition-transform overflow-hidden">
                                {img.thumbnail ? (
                                    <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="text-4xl text-gray-600">🖼️</div>
                                )}
                            </div>
                            <div className="px-2 py-1.5">
                                <div className="text-xs text-white truncate">{img.title}</div>
                                <div className="text-[10px] text-gray-500 truncate">{img.date}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlbumApp;
