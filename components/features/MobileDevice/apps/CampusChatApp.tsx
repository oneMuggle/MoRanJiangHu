import React, { useState, useMemo, useRef, useEffect, Suspense, lazy } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { 见面地点 } from '../../../../models/campusPhone';
import type { BDSM关系状态 } from '../../../../models/campusNSFW/sm';

const BDSMTaskPanel = lazy(() => import('./BDSMTaskPanel'));
const BDSMContractPanel = lazy(() => import('./BDSMContractPanel'));
const BDSMRelationshipDashboard = lazy(() => import('./BDSMRelationshipDashboard'));
const BDSMNegotiationPanel = lazy(() => import('./BDSMNegotiationPanel'));
const BDSMContractNegotiation = lazy(() => import('./BDSMContractNegotiation'));
const BDSMSafetySettings = lazy(() => import('./BDSMSafetySettings'));

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    onSendMessage?: (npcId: string, npcName: string, content: string) => Promise<{ npcReply: string }>;
    onCreateChatSession?: (npcId: string, npcName: string, 关系标签: string, 初始消息: string) => void;
    onConfirmNegotiation?: (npcId: string, npcName: string, 协商结果: { 见面回合偏移: number; 见面地点: 见面地点; 安全词: string; 玩家底线: string[] }) => void;
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

const CampusChatApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, onSendMessage, onConfirmNegotiation }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '私聊';
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [inputText, setInputText] = useState('');
    const [bdsmPanel, setBdsmPanel] = useState<BdsmPanelMode>('聊天');
    const [negotiating, setNegotiating] = useState(false);
    const [negotiatingContract, setNegotiatingContract] = useState(false);
    const [editingSafety, setEditingSafety] = useState(false);
    const [waitingForReply, setWaitingForReply] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 自动滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.messages?.length, activeSession?.id]);

    // 从欲望系统中查找当前会话 NPC 的 BDSM 关系状态
    const findBDSM关系 = (npcId: string, npc姓名: string): BDSM关系状态 | null => {
        const 欲望系统 = gameContext?.校园系统?.欲望系统;
        const 档案 = 欲望系统?.NPC欲望档案;
        if (!档案) return null;
        // 优先用 npcId 直接匹配
        const 直接匹配 = 档案[npcId] as any;
        if (直接匹配?.BDSM关系) return 直接匹配.BDSM关系 as BDSM关系状态;
        // 回退：按姓名匹配
        for (const [, v] of Object.entries(档案)) {
            const b = (v as any).BDSM关系;
            if (b && ((v as any)._npcName === npc姓名 || (v as any).姓名 === npc姓名)) return b as BDSM关系状态;
        }
        return null;
    };

    const hasBDSM关系 = activeSession ? findBDSM关系(activeSession.id, activeSession.name) !== null : false;
    const 当前BDSM关系 = activeSession ? findBDSM关系(activeSession.id, activeSession.name) : null;

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
                    content: 问候语模板[idx % 问候语模板.length],
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

    const handleSend = async () => {
        if (!inputText.trim() || !activeSession || waitingForReply) return;
        const npcName = activeSession.name;
        const userMessage = inputText.trim();
        setInputText('');
        setWaitingForReply(true);

        // 先添加用户消息
        setActiveSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                messages: [...prev.messages, {
                    id: `sent-${Date.now()}`,
                    sender: '我',
                    content: userMessage,
                    time: '刚刚',
                    isMe: true,
                }],
                lastMessage: userMessage,
                lastTime: '刚刚',
                unread: 0,
            };
        });

        // 等待 NPC 回复并追加
        try {
            const result = await onSendMessage?.(activeSession.id, npcName, userMessage);
            if (result?.npcReply) {
                setActiveSession(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        messages: [...prev.messages, {
                            id: `npc-${Date.now()}`,
                            sender: npcName,
                            content: result.npcReply,
                            time: '刚刚',
                            isMe: false,
                        }],
                        lastMessage: result.npcReply,
                        lastTime: '刚刚',
                    };
                });
            }
        } catch {
            // NPC 回复失败，静默处理
        } finally {
            setWaitingForReply(false);
        }
    };

const LOADING_FALLBACK = (
        <div className="flex items-center justify-center h-full text-gray-500 text-sm gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            加载中…
        </div>
    );

    const LOADING_FALLBACK_FULL = (
        <div className="flex items-center justify-center h-full bg-gray-900/95 text-gray-500 text-sm gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            加载中…
        </div>
    );

    if (activeSession) {
        // 见面协商面板
        if (negotiating) {
            return (
                <div className="flex flex-col h-full overflow-hidden">
                    <Suspense fallback={LOADING_FALLBACK_FULL} key="negotiation">
                        <div className="flex flex-col h-full min-h-0 overflow-hidden">
                            <BDSMNegotiationPanel
                            npcName={activeSession.name}
                            onConfirm={(协商结果) => {
                                onConfirmNegotiation?.(activeSession.id, activeSession.name, {
                                    见面回合偏移: 协商结果.见面回合偏移,
                                    见面地点: 协商结果.见面地点,
                                    安全词: 协商结果.安全词,
                                    玩家底线: 协商结果.玩家底线,
                                });
                                setNegotiating(false);
                            }}
                            onCancel={() => setNegotiating(false)}
                        />
                        </div>
                    </Suspense>
                </div>
            );
        }

        // 契约协商面板
        if (negotiatingContract && 当前BDSM关系) {
            return (
                <div className="flex flex-col h-full overflow-hidden">
                    <Suspense fallback={LOADING_FALLBACK_FULL} key="contract">
                        <div className="flex flex-col h-full min-h-0 overflow-hidden">
                            <BDSMContractNegotiation
                            npcName={activeSession.name}
                            当前阶段={当前BDSM关系.阶段}
                            服从度={当前BDSM关系.服从度}
                            onConfirm={() => {
                                setNegotiatingContract(false);
                                setBdsmPanel('契约');
                            }}
                            onCancel={() => setNegotiatingContract(false)}
                        />
                        </div>
                    </Suspense>
                </div>
            );
        }

        // BDSM 子面板渲染
        if (bdsmPanel !== '聊天' && 当前BDSM关系) {
            return (
                <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50 shrink-0">
                        <button onClick={() => setBdsmPanel('聊天')} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                        <h3 className="font-semibold text-white text-sm flex-1 truncate">{activeSession.name}</h3>
                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{当前BDSM关系.阶段}</span>
                    </div>
                    <Suspense fallback={LOADING_FALLBACK}>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        {bdsmPanel === '任务' && (
                            <BDSMTaskPanel
                                关系状态={当前BDSM关系}
                                日常指令={当前BDSM关系.日常指令 || []}
                            />
                        )}
                        {bdsmPanel === '契约' && (
                            <BDSMContractPanel
                                关系状态={当前BDSM关系}
                                onNegotiateContract={() => setNegotiatingContract(true)}
                            />
                        )}
                        {bdsmPanel === '总览' && (
                            <BDSMRelationshipDashboard
                                关系状态={当前BDSM关系}
                                npcName={activeSession.name}
                                onGoToTasks={() => setBdsmPanel('任务')}
                                onGoToContract={() => setBdsmPanel('契约')}
                                onEditSafety={() => setEditingSafety(true)}
                            />
                        )}
                    </div>
                    </Suspense>
                </div>
            );
        }

        // 安全设置面板
        if (editingSafety && 当前BDSM关系) {
            return (
                <div className="flex flex-col h-full overflow-hidden">
                    <Suspense fallback={LOADING_FALLBACK_FULL} key="safety">
                        <div className="flex flex-col h-full min-h-0 overflow-hidden">
                            <BDSMSafetySettings
                                关系状态={当前BDSM关系}
                                npcName={activeSession.name}
                                onSave={() => setEditingSafety(false)}
                                onCancel={() => setEditingSafety(false)}
                            />
                        </div>
                    </Suspense>
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
                            {!negotiating && (
                                <button
                                    onClick={() => setNegotiating(true)}
                                    className="text-[10px] text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded hover:bg-pink-500/20 transition-colors"
                                >见面</button>
                            )}
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
                    {waitingForReply && (
                        <div className="flex justify-start">
                            <div className="max-w-[75%] rounded-lg px-3 py-2 text-sm bg-gray-700/50 text-gray-400">
                                <div className="text-[9px] text-gray-500 mb-0.5">{activeSession.name}</div>
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
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
                        disabled={!inputText.trim() || waitingForReply}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >{waitingForReply ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : '发送'}</button>
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
                            const bRel = findBDSM关系(session.id, session.name);
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
