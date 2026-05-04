import React, { useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
}

const CampusCardApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '校园卡';

    const balance = useMemo(() => {
        const 金钱 = gameContext?.角色?.金钱;
        if (!金钱) return 500;
        return (金钱.金元宝 || 0) * 100 + (金钱.银子 || 0) * 10 + (金钱.铜钱 || 0) || 500;
    }, [gameContext?.角色?.金钱]);

    const 消费记录 = useMemo(() => {
        const types = ['食堂', '超市', '图书馆', '打印店', '其他'] as const;
        const locations = ['第一食堂', '校园超市', '图书馆咖啡厅', '东门打印店', '快递站'] as const;
        const records = Array.from({ length: 8 }, (_, idx) => ({
            time: `${idx + 1}天前`,
            location: locations[idx % locations.length],
            amount: Math.floor(Math.random() * 30) + 5,
            type: types[idx % types.length],
        }));
        return records;
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="mx-4 mt-4 rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 p-4 text-white shadow-lg">
                    <div className="text-xs text-green-200 mb-1">校园卡余额</div>
                    <div className="text-2xl font-bold mb-2">&yen; {balance.toFixed(2)}</div>
                    <div className="text-[10px] text-green-200/70">
                        {gameContext?.角色?.姓名 || '未命名'} &middot; 校园一卡通
                    </div>
                </div>
                <div className="px-4 mt-6">
                    <h4 className="text-xs font-semibold text-gray-400 mb-3">近期消费</h4>
                    <ul className="space-y-2">
                        {消费记录.map((record, idx) => (
                            <li key={idx} className="flex items-center justify-between py-2 border-b border-gray-800/30">
                                <div className="flex-1">
                                    <div className="text-sm text-white">{record.location}</div>
                                    <div className="text-[10px] text-gray-500">{record.time} &middot; {record.type}</div>
                                </div>
                                <span className="text-sm text-red-400 font-medium">-&yen;{record.amount}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CampusCardApp;
