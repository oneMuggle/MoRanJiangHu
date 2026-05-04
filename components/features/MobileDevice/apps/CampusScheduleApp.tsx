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

interface Course {
    name: string;
    location: string;
    teacher: string;
    timeSlot: string;
}

const CampusScheduleApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '课程表';

    const schedule: Record<string, Course[]> = useMemo(() => {
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const result: Record<string, Course[]> = {};

        const world = gameContext?.世界;
        if (world?.进行中事件?.length) {
            world.进行中事件.forEach((event, idx) => {
                const day = days[idx % 5];
                if (!result[day]) result[day] = [];
                result[day].push({
                    name: event.事件名,
                    location: event.关联地点?.[0] || '待定',
                    teacher: event.关联人物?.[0] || '未知',
                    timeSlot: `${(idx % 4) + 1}-${(idx % 4) + 2}节`,
                });
            });
        }

        const 课程模板 = [
            { name: '高等数学', location: '教学楼A101', teacher: '张教授', timeSlot: '1-2节' },
            { name: '大学物理', location: '理科楼B203', teacher: '李教授', timeSlot: '3-4节' },
            { name: '英语', location: '外语楼C305', teacher: '王老师', timeSlot: '5-6节' },
            { name: '体育课', location: '操场', teacher: '赵教练', timeSlot: '7-8节' },
        ];

        days.forEach(day => {
            if (!result[day]) {
                const count = Math.floor(Math.random() * 3) + 1;
                result[day] = 课程模板.slice(0, count);
            }
        });

        return result;
    }, [gameContext?.世界]);

    const timeSlots = ['1-2节', '3-4节', '5-6节', '7-8节', '9-10节'];
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    const getCourseAt = (day: string, slot: string): Course | undefined => {
        return schedule[day]?.find(c => c.timeSlot === slot);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 mb-2">
                    {days.map(day => <span key={day}>{day}</span>)}
                </div>
                {timeSlots.map(slot => (
                    <div key={slot} className="mb-2">
                        <div className="text-[10px] text-gray-500 mb-1">{slot}</div>
                        <div className="grid grid-cols-7 gap-1">
                            {days.map(day => {
                                const course = getCourseAt(day, slot);
                                return (
                                    <div key={`${day}-${slot}`} className={`rounded p-1 min-h-[48px] text-[10px] ${course ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' : 'bg-gray-800/20 border border-gray-800/20'}`}>
                                        {course && (
                                            <div>
                                                <div className="font-medium truncate">{course.name}</div>
                                                <div className="text-gray-400 truncate">{course.location}</div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CampusScheduleApp;
