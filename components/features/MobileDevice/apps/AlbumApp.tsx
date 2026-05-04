import React from 'react';
import { DeviceMode, MobileApp } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
}

interface AlbumImage {
    id: string;
    thumbnail: string;
    title: string;
    date: string;
}

const AlbumApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '相册';

    // 从 CDN 加载真实记忆图片（AI生成）
    const albumImages: AlbumImage[] = [
        { id: '1', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_mountain_retreat.jpg', title: '山间隐居', date: '甲子年三月初一' },
        { id: '2', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_marriage_tree.jpg', title: '姻缘树', date: '甲子年二月初八' },
        { id: '3', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_tomb_ruins.jpg', title: '古墓秘境', date: '甲子年正月十五' },
        { id: '4', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_sea_adventure.jpg', title: '出海冒险', date: '癸亥年腊月廿八' },
        { id: '5', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_moon_blossom.jpg', title: '月下表白', date: '癸亥年腊月初五' },
        { id: '6', thumbnail: 'https://mrqk.cc.cd/resources/images/albumapp/albumapp_falling_leaves.jpg', title: '离别场景', date: '癸亥年九月初三' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">←</button>
                <h3 className="font-semibold text-white">{appName}</h3>
                <span className="text-xs text-gray-500 ml-auto">{albumImages.length} 张</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {albumImages.map((img) => (
                        <div key={img.id} className="rounded-lg overflow-hidden bg-gray-800/60 border border-gray-700/30 hover:border-wuxia-gold/40 transition-colors cursor-pointer group">
                            <div className="aspect-square flex items-center justify-center bg-gray-900/50 group-hover:scale-105 transition-transform overflow-hidden">
                                <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
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
