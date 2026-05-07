import React, { useState, useMemo, useEffect } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext, DeviceGroup } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { ApiConfigLike } from '../../MobileHome';
import { 生成设备群组 } from '../../../../hooks/useGame/device/deviceAiWorkflow';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    apiConfig?: ApiConfigLike;
}

interface ChatGroup {
    id: string;
    name: string;
    lastMessage: string;
    lastTime: string;
    unread: number;
    members: number;
}

interface ChatMessage {
    id: string;
    sender: string;
    content: string;
    time: string;
}

const ChatApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, apiConfig }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '群聊';
    const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
    const [aiGroups, setAiGroups] = useState<DeviceGroup[]>([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // 当群组为空时，自动生成 AI 群组
    useEffect(() => {
        // 检查是否有基于游戏数据的群组
        const hasGameGroups = (() => {
            if (!gameContext) return false;
            const hasSect = gameContext.角色?.所属门派ID && gameContext.角色.所属门派ID !== 'none';
            const hasTeammates = gameContext.社交?.some((npc) => npc.是否队友);
            const hasPresentNPCs = gameContext.社交?.some((npc) => npc.是否在场);
            return hasSect || hasTeammates || hasPresentNPCs;
        })();

        // 如果没有游戏群组，且有 API 配置，则尝试生成
        if (!hasGameGroups && apiConfig && !isLoadingAi && aiGroups.length === 0) {
            const loadAiGroups = async () => {
                setIsLoadingAi(true);
                try {
                    const apiConfigObj = apiConfig as { 接口数组?: unknown[] };
                    if (!apiConfigObj?.接口数组?.length) {
                        setIsLoadingAi(false);
                        return;
                    }

                    const context = {
                        当前场景: gameContext?.世界?.进行中事件?.[0]?.事件名 || '',
                        角色名: gameContext?.角色?.姓名 || '',
                        当前位置: gameContext?.世界?.当前位置?.名称 || '',
                        世界状态: gameContext?.世界?.状态?.描述 || '',
                    };

                    const generatedGroups = await 生成设备群组(
                        eraId,
                        mode,
                        context,
                        apiConfig as Parameters<typeof 生成设备群组>[3],
                        apiConfig as Parameters<typeof 生成设备群组>[4],
                        5
                    );

                    if (generatedGroups && generatedGroups.length > 0) {
                        setAiGroups(generatedGroups);
                    }
                } catch (error) {
                    console.warn('生成设备群组失败:', error);
                } finally {
                    setIsLoadingAi(false);
                }
            };

            void loadAiGroups();
        }
    }, [gameContext, apiConfig, eraId, mode, isLoadingAi, aiGroups.length]);

    const groups: ChatGroup[] = useMemo(() => {
        const result: ChatGroup[] = [];
        const ctx = gameContext;
        if (!ctx) return result;

        // 门派群 — 用全体NPC近似
        if (ctx.角色?.所属门派ID && ctx.角色.所属门派ID !== 'none') {
            result.push({
                id: 'sect-group',
                name: '门派内堂',
                lastMessage: `${ctx.角色.姓名}：今日练功可曾懈怠？`,
                lastTime: '近日',
                unread: 0,
                members: ctx.社交.length + 1,
            });
        }

        // 队友群
        const teammates = ctx.社交.filter((npc) => npc.是否队友);
        if (teammates.length > 0) {
            result.push({
                id: 'team-group',
                name: '同行伙伴',
                lastMessage: `${teammates[0].姓名}：前路凶险，大家小心。`,
                lastTime: '方才',
                unread: 1,
                members: teammates.length + 1,
            });
        }

        // 在场NPC群聊
        const presentNPCs = ctx.社交.filter((npc) => npc.是否在场 && !npc.是否队友);
        if (presentNPCs.length > 0) {
            result.push({
                id: 'scene-group',
                name: '当前场景',
                lastMessage: `${presentNPCs[0].姓名}：诸位在此，有何贵干？`,
                lastTime: '此刻',
                unread: presentNPCs.length > 2 ? 1 : 0,
                members: presentNPCs.length + 1,
            });
        }

        // 补充 AI 生成的群组
        aiGroups.forEach((aiGroup) => {
            result.push({
                id: aiGroup.id,
                name: aiGroup.name,
                lastMessage: aiGroup.lastMessage?.content || '暂无消息',
                lastTime: '近日',
                unread: 0,
                members: aiGroup.members.length,
            });
        });

        return result;
    }, [gameContext, aiGroups]);

    const messages: Record<string, ChatMessage[]> = useMemo(() => {
        const result: Record<string, ChatMessage[]> = {};
        if (!gameContext) return result;

        for (const group of groups) {
            const msgs: ChatMessage[] = [];
            if (group.id === 'sect-group' || group.id === 'team-group' || group.id === 'scene-group') {
                // 从历史记录提取最近的 assistant/user 消息作为聊天内容
                const recentHistory = (gameContext.历史记录 || [])
                    .filter((h) => h.role !== 'system')
                    .slice(-8);
                recentHistory.forEach((h, idx) => {
                    msgs.push({
                        id: `hist-${idx}`,
                        sender: h.role === 'user' ? '你' : '系统',
                        content: h.content?.substring(0, 200) || '',
                        time: h.gameTime || `${idx}`,
                    });
                });
            }
            result[group.id] = msgs;
        }
        return result;
    }, [gameContext, groups]);

    if (selectedGroup) {
        const groupMessages = messages[selectedGroup.id] || [];
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => setSelectedGroup(null)} className="text-gray-400 hover:text-white transition-colors">←</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{selectedGroup.name}</h3>
                        <span className="text-[10px] text-gray-500">{selectedGroup.members} 人</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {groupMessages.length > 0 ? groupMessages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === '你' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-gray-500 mb-0.5">{msg.sender}</span>
                            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender === '你' ? 'bg-wuxia-gold/20 text-wuxia-gold' : 'bg-gray-700/50 text-gray-200'}`}>
                                {msg.content}
                            </div>
                            <span className="text-[9px] text-gray-600 mt-0.5">{msg.time}</span>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <span className="text-4xl text-gray-600 mb-3">💬</span>
                            <p className="text-sm text-gray-400">暂无聊天记录</p>
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
            <div className="flex-1 overflow-y-auto">
                {groups.length > 0 ? (
                    <ul className="divide-y divide-gray-800/50">
                        {groups.map((group) => (
                            <li key={group.id}>
                                <button
                                    onClick={() => setSelectedGroup(group)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-wuxia-gold/10 border border-wuxia-gold/20 flex items-center justify-center text-lg flex-shrink-0">
                                        💬
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white font-medium">{group.name}</span>
                                            <span className="text-[10px] text-gray-500">{group.lastTime}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <span className="text-xs text-gray-400 truncate pr-2">{group.lastMessage}</span>
                                            {group.unread > 0 && (
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                                                    {group.unread}
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
                        <span className="text-4xl text-gray-600 mb-3">💬</span>
                        <p className="text-sm text-gray-400">暂无群聊</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatApp;
