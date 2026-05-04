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

const CampusClubApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '社团活动';

    const activities = useMemo(() => {
        const result: Array<{
            id: string; clubName: string; activityName: string;
            time: string; location: string; description: string; participants: number;
        }> = [];

        const 世界 = gameContext?.世界;
        if (世界?.进行中事件) {
            世界.进行中事件.slice(0, 6).forEach((event, idx) => {
                result.push({
                    id: `club-${idx}`,
                    clubName: event.关联人物?.[0] || '学生会',
                    activityName: event.事件名,
                    time: event.开始时间 || '本周末',
                    location: event.关联地点?.[0] || '活动中心',
                    description: event.事件说明,
                    participants: Math.floor(Math.random() * 100) + 10,
                });
            });
        }

        const 模板活动 = [
            { clubName: '文学社', activityName: '读书分享会', time: '周五 19:00', location: '图书馆报告厅', description: '本月共读《百年孤独》，欢迎参加讨论。', participants: 45 },
            { clubName: '动漫社', activityName: '新番观影夜', time: '周六 20:00', location: '活动中心A101', description: '集体观看本季热门新番，提供零食饮料。', participants: 60 },
            { clubName: '街舞社', activityName: '街舞交流会', time: '周日 15:00', location: '体育馆舞蹈室', description: '新老社员交流，零基础也可参加。', participants: 30 },
            { clubName: '摄影社', activityName: '校园采风', time: '周六 09:00', location: '校门口集合', description: '春季校园摄影活动，设备自备。', participants: 25 },
        ];

        模板活动.forEach((a, idx) => {
            result.push({ id: `template-${idx}`, ...a });
        });

        return result;
    }, [gameContext?.世界]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {activities.length > 0 ? (
                    <div className="grid gap-3">
                        {activities.map(activity => (
                            <div key={activity.id} className="rounded-lg bg-gray-800/40 border border-gray-700/30 p-3 hover:bg-gray-800/60 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-purple-400/60 bg-purple-400/10 px-1.5 py-0.5 rounded">{activity.clubName}</span>
                                        <h4 className="text-sm text-white font-medium mt-1">{activity.activityName}</h4>
                                    </div>
                                    <span className="text-[10px] text-gray-500 ml-2">{activity.participants}人参与</span>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">{activity.description}</p>
                                <div className="flex items-center gap-4 text-[10px] text-gray-500">
                                    <span>时间：{activity.time}</span>
                                    <span>地点：{activity.location}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">&#127919;</span>
                        <p className="text-sm text-gray-400">暂无活动</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusClubApp;
