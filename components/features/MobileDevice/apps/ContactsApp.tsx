import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DeviceMode, MobileApp, DeviceGameContext, DeviceContact } from '../../../../models/mobileDevice';
import { getDeviceConfig, getAppName } from '../../../../models/eraDevice';
import type { ApiConfigLike } from '../../MobileHome';
import { 生成设备联系人 } from '../../../../hooks/useGame/deviceAiWorkflow';
import { getEraCategory } from '../eraStyles/EraStyleSelector';

interface AppProps {
    eraId: string;
    mode: DeviceMode;
    appId: MobileApp;
    onBack: () => void;
    gameContext?: DeviceGameContext;
    apiConfig?: ApiConfigLike;
}

interface Contact {
    id: string;
    name: string;
    relation: string;
    location: string;
    description: string;
    avatar: string;
}

const genderEmoji: Record<string, string> = {
    '男': '👨',
    '女': '👩',
};

const ContactsApp: React.FC<AppProps> = ({ eraId, mode, appId, onBack, gameContext, apiConfig }) => {
    const config = getDeviceConfig(eraId);
    const appName = config ? getAppName(config, appId, mode) : '通讯录';
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [searchText, setSearchText] = useState('');
    const [aiContacts, setAiContacts] = useState<DeviceContact[]>([]);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // 当联系人不足时，自动生成 AI 联系人
    useEffect(() => {
        const socialContacts = gameContext?.社交?.length || 0;
        // 如果社交联系人少于 3 个，且有 API 配置，则尝试生成
        if (socialContacts < 3 && apiConfig && !isLoadingAi && aiContacts.length === 0) {
            const loadAiContacts = async () => {
                setIsLoadingAi(true);
                try {
                    const config = getDeviceConfig(eraId);
                    if (!config) return;

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

                    const eraCategory = getEraCategory(eraId);
                    const generatedContacts = await 生成设备联系人(
                        eraId,
                        mode,
                        context,
                        apiConfig as Parameters<typeof 生成设备联系人>[2],
                        apiConfig as Parameters<typeof 生成设备联系人>[3],
                        8
                    );

                    if (generatedContacts && generatedContacts.length > 0) {
                        setAiContacts(generatedContacts);
                    }
                } catch (error) {
                    console.warn('生成设备联系人失败:', error);
                } finally {
                    setIsLoadingAi(false);
                }
            };

            void loadAiContacts();
        }
    }, [gameContext?.社交, apiConfig, eraId, mode, isLoadingAi, aiContacts.length]);

    const contacts: Contact[] = useMemo(() => {
        const result: Contact[] = [];

        // 优先使用游戏社交数据
        if (gameContext?.社交?.length) {
            gameContext.社交.forEach((npc) => {
                result.push({
                    id: npc.id,
                    name: npc.姓名,
                    relation: npc.关系状态 || npc.身份 || '江湖中人',
                    location: npc.是否在场 ? '当前场景' : '未知',
                    description: npc.简介 || '',
                    avatar: genderEmoji[npc.性别] || '🧑',
                });
            });
        }

        // 补充 AI 生成的联系人（去重）
        const existingIds = new Set(result.map(c => c.id));
        aiContacts.forEach((aiContact) => {
            if (!existingIds.has(aiContact.id)) {
                result.push({
                    id: aiContact.id,
                    name: aiContact.name,
                    relation: aiContact.relation || '江湖中人',
                    location: aiContact.location ? `${aiContact.location.x},${aiContact.location.y}` : '未知',
                    description: aiContact.description || '',
                    avatar: '🤖',
                });
            }
        });

        return result;
    }, [gameContext?.社交, aiContacts]);

    const filteredContacts = contacts.filter(
        (c) =>
            c.name.includes(searchText) ||
            c.relation.includes(searchText) ||
            c.location.includes(searchText)
    );

    if (selectedContact) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                    <button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-white transition-colors">←</button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{selectedContact.name}</h3>
                        <span className="text-[10px] text-gray-500">{selectedContact.relation}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-wuxia-gold/10 border border-wuxia-gold/20 flex items-center justify-center text-4xl mb-3">
                            {selectedContact.avatar}
                        </div>
                        <h4 className="text-lg font-semibold text-white">{selectedContact.name}</h4>
                        <span className="text-xs text-wuxia-gold/70 mt-0.5">{selectedContact.relation}</span>
                    </div>
                    <div className="space-y-3">
                        <div className="rounded-lg bg-gray-800/40 border border-gray-700/30 p-3">
                            <span className="text-[10px] text-gray-500 block mb-1">所在位置</span>
                            <span className="text-sm text-white">{selectedContact.location}</span>
                        </div>
                        {selectedContact.description && (
                            <div className="rounded-lg bg-gray-800/40 border border-gray-700/30 p-3">
                                <span className="text-[10px] text-gray-500 block mb-1">简介</span>
                                <span className="text-sm text-gray-300">{selectedContact.description}</span>
                            </div>
                        )}
                    </div>
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
            {contacts.length > 0 && (
                <div className="px-4 py-2">
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="搜索姓名、关系或地点..."
                        className="w-full bg-gray-800/50 border border-gray-600/30 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-wuxia-gold/50"
                    />
                </div>
            )}
            <div className="flex-1 overflow-y-auto">
                {filteredContacts.length > 0 ? (
                    <ul className="divide-y divide-gray-800/50">
                        {filteredContacts.map((contact) => (
                            <li key={contact.id}>
                                <button
                                    onClick={() => setSelectedContact(contact)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/30 transition-colors text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-wuxia-gold/10 border border-wuxia-gold/20 flex items-center justify-center text-lg flex-shrink-0">
                                        {contact.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white font-medium">{contact.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-wuxia-gold/60">{contact.relation}</span>
                                            <span className="text-[10px] text-gray-500">·</span>
                                            <span className="text-[10px] text-gray-500">{contact.location}</span>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <span className="text-4xl text-gray-600 mb-3">📱</span>
                        <p className="text-sm text-gray-400">{contacts.length === 0 ? '暂无联系人' : '未找到匹配的联系人'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsApp;
