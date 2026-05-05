import React, { useState, useMemo } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { BDSM关系状态 } from '../../../../models/campusNSFW/sm';
import BDSMTaskPanel from './BDSMTaskPanel';
import BDSMContractPanel from './BDSMContractPanel';
import BDSMRelationshipDashboard from './BDSMRelationshipDashboard';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    onSendMessage?: (npcId: string, npcName: string, content: string) => void;
}

type BdsmPanelMode = '聊天' | '任务' | '契约' | '总览';

interface ChatSession {
    id: string;
    name: string;
    lastMessage: string;
    lastTime: string;
    unread: number;
    relation: string;
    messages: ChatMessage[];
}

interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    time: string;
    isMe: boolean;
}

const 问候语模板: string[] = [
    '最近还好吗？',
    '好久不见，有空聊聊吗？',
    '上次那件事后来怎么样了？',
    '你好呀~',
];

const CampusChatApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, onSendMessage }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '私聊';
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [inputText, setInputText] = useState('');
    const [bdsmPanel, setBdsmPanel] = useState<BdsmPanelMode>('聊天');

    // 从欲望系统中查找当前会话 NPC 的 BDSM 关系状态
    const findBDSM关系 = (npc姓名: string): BDSM关系状态 | null => {
        const 欲望系统 = gameContext?.校园系统?.欲望系统;
        const 档案 = 欲望系统?.NPC欲望档案;
        if (!档案) return null;
        for (const [, v] of Object.entries(档案)) {
            const b = (v as any).BDSM关系;
            if (b && (v as any)._npcName === npc姓名) return b as BDSM关系状态;
        }
        return null;
    };

    const hasBDSM关系 = activeSession ? findBDSM关系(activeSession.name) !== null : false;
    const 当前BDSM关系 = activeSession ? findBDSM关系(activeSession.name) : null;

    const 关系类型映射: Record<string, string> = {
        '恋人': '恋人', '室友': '室友', '同学': '同学',
        '师兄': '学长学姐', '师姐': '学长学姐',
    };

    const sessions: ChatSession[] = useMemo(() => {
        // 优先使用校园系统的私聊会话列表
        const systemSessions = gameContext?.校园系统?.私聊会话列表;
        if (systemSessions && systemSessions.length > 0) {
            return systemSessions.map((session, idx) => ({
                id: session.id || `sys-chat-${idx}`,
                name: session.对方姓名,
                lastMessage: session.最后消息,
                lastTime: session.最后时间,
                unread: session.未读数,
                relation: 关系类型映射[session.关系类型] || '同学',
                messages: session.消息列表.map((msg, mi) => ({
                    id: msg.id || `msg-${idx}-${mi}`,
                    sender: msg.发送者,
                    content: msg.内容,
                    time: msg.时间,
                    isMe: msg.发送者 !== session.对方姓名,
                })),
            }));
        }

        // 回退：从社交列表生成
        if (!gameContext?.社交?.length) return [];

        return gameContext.社交.slice(0, 15).map((npc, idx) => {
            const history = gameContext.历史记录 || [];
            const 相关消息 = history
                .filter(h => h.role === 'assistant' && typeof h.content === 'string')
                .filter(h => h.content.includes(npc.姓名))
                .slice(-5);

            const messages: ChatMessage[] = 相关消息.map((h, mi) => ({
                id: `hist-${idx}-${mi}`,
                sender: npc.姓名,
                content: h.content.slice(0, 80),
                time: '近日',
                isMe: false,
            }));

            if (messages.length === 0) {
                messages.push({
                    id: `greet-${idx}`,
                    sender: npc.姓名,
                    content: npc.简介?.slice(0, 30) || 问候语模板[idx % 问候语模板.length],
                    time: '近日',
                    isMe: false,
                });
            }

            const lastMsg = messages[messages.length - 1];
            const 有未回复 = messages.some(m => !m.isMe);

            return {
                id: `chat-${idx}`,
                name: npc.姓名,
                lastMessage: lastMsg.content,
                lastTime: lastMsg.time,
                unread: 有未回复 ? 1 : 0,
                relation: 关系类型映射[npc.关系状态] || '同学',
                messages,
            };
        });
    }, [gameContext?.社交, gameContext?.历史记录, gameContext?.校园系统?.私聊会话列表]);

    const handleSend = () => {
        if (!inputText.trim() || !activeSession) return;
        const npcName = activeSession.name;
        onSendMessage?.(activeSession.id, npcName, inputText.trim());
        setInputText('');
        setActiveSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                messages: [...prev.messages, {
                    id: `sent-${Date.now()}`,
                    sender: '我',
                    content: inputText.trim(),
                    time: '刚刚',
                    isMe: true,
                }],
                lastMessage: inputText.trim(),
                lastTime: '刚刚',
                unread: 0,
            };
        });
    };

    if (activeSession) {
        // BDSM 子面板渲染
        if (bdsmPanel !== '聊天' && 当前BDSM关系) {
            const panelProps = {
                关系状态: 当前BDSM关系,
                日常指令: 当前BDSM关系.日常指令 || [],
                npcName: activeSession.name,
                onGoToTasks: () => setBdsmPanel('任务'),
                onGoToContract: () => setBdsmPanel('契约'),
            };
            return (
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                        <button onClick={() => setBdsmPanel('聊天')} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                        <h3 className="font-semibold text-white text-sm flex-1 truncate">{activeSession.name}</h3>
                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{当前BDSM关系.阶段}</span>
                    </div>
                    {bdsmPanel === '任务' && (
                        <BDSMTaskPanel
                            关系状态={当前BDSM关系}
                            日常指令={当前BDSM关系.日常指令 || []}
                        />
                    )}
                    {bdsmPanel === '契约' && (
                        <BDSMContractPanel 关系状态={当前BDSM关系} />
                    )}
                    {bdsmPanel === '总览' && (
                        <BDSMRelationshipDashboard
                            关系状态={当前BDSM关系}
                            npcName={activeSession.name}
                            onGoToTasks={() => setBdsmPanel('任务')}
                            onGoToContract={() => setBdsmPanel('契约')}
                        />
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => { setActiveSession(null); setBdsmPanel('聊天'); }} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{activeSession.name}</h3>
                        <span className="text-[10px] text-gray-500">{activeSession.relation}</span>
                    </div>
                    {hasBDSM关系 && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => setBdsmPanel('总览')}
                                className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded hover:bg-purple-500/20 transition-colors"
                            >关系</button>
                            <button
                                onClick={() => setBdsmPanel('任务')}
                                className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded hover:bg-blue-500/20 transition-colors"
                            >任务</button>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="text-center text-[10px] text-gray-500 py-2">--- {activeSession.name} 的聊天 ---</div>
                    {activeSession.messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.isMe ? 'bg-blue-600/60 text-white' : 'bg-gray-700/50 text-gray-200'}`}>
                                {!msg.isMe && <div className="text-[9px] text-gray-400 mb-0.5">{msg.sender}</div>}
                                <p>{msg.content}</p>
                                <span className="text-[9px] text-gray-400 mt-1 block">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 px-4 py-3 border-t border-gray-700/50">
                    <input
                        className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                        placeholder="输入消息..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >发送</button>
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
                        {sessions.map(session => {
                            const bRel = findBDSM关系(session.name);
                            return (
                            <li key={session.id}>
                                <button
                                    onClick={() => { setActiveSession(session); setBdsmPanel('聊天'); }}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                                        bRel
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                            : 'bg-gradient-to-br from-blue-500 to-purple-500'
                                    }`}>
                                        {session.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white font-medium">{session.name}</span>
                                            <div className="flex items-center gap-1">
                                                {bRel && (
                                                    <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1 rounded">
                                                        {bRel.阶段}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-500">{session.lastTime}</span>
                                            </div>
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
                            );
                        })}
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
