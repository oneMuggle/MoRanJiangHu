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

interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    time: string;
    isMe: boolean;
}

interface ChatSession {
    id: string;
    name: string;
    lastMessage: string;
    lastTime: string;
    unread: number;
    relation: string;
    messages: ChatMessage[];
}

const CampusChatApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '私聊';
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

    const sessions: ChatSession[] = useMemo(() => {
        if (!gameContext?.社交?.length) return [];

        const 关系类型映射: Record<string, string> = {
            '恋人': '恋人', '室友': '室友', '同学': '同学',
            '师兄': '学长学姐', '师姐': '学长学姐',
        };

        return gameContext.社交.slice(0, 15).map((npc, idx) => ({
            id: `chat-${idx}`,
            name: npc.姓名,
            lastMessage: npc.简介?.slice(0, 20) || '暂无消息',
            lastTime: '近日',
            unread: Math.floor(Math.random() * 5),
            relation: 关系类型映射[npc.关系状态] || '同学',
            messages: [],
        }));
    }, [gameContext?.社交]);

    if (activeSession) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => setActiveSession(null)} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{activeSession.name}</h3>
                        <span className="text-[10px] text-gray-500">{activeSession.relation}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="text-center text-[10px] text-gray-500 py-2">--- {activeSession.name} 的聊天 ---</div>
                    {activeSession.messages.length > 0 ? (
                        activeSession.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.isMe ? 'bg-blue-600/60 text-white' : 'bg-gray-700/50 text-gray-200'}`}>
                                    <p>{msg.content}</p>
                                    <span className="text-[9px] text-gray-400 mt-1 block">{msg.time}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-sm text-gray-500 py-8">暂无消息，等待互动...</div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white">{appName}</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
                {sessions.length > 0 ? (
                    <ul className="divide-y divide-gray-800/50">
                        {sessions.map(session => (
                            <li key={session.id}>
                                <button
                                    onClick={() => setActiveSession(session)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {session.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white font-medium">{session.name}</span>
                                            <span className="text-[10px] text-gray-500">{session.lastTime}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <span className="text-xs text-gray-400 truncate">{session.lastMessage}</span>
                                            {session.unread > 0 && (
                                                <span className="ml-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                                    {session.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">&#128172;</span>
                        <p className="text-sm text-gray-400">暂无会话</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampusChatApp;
