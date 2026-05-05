// BDSM 寻主召奴联系对话框 — 聊天式交互
// 模拟与匿名发帖人的私信联系流程

import React, { useState, useRef, useEffect } from 'react';
import type { BDSM论坛帖子, 联系对话 } from '../../../../models/campusNSFW/bdsm-forum';

interface Props {
    post: BDSM论坛帖子;
    onBack: () => void;
    onConfirm: (对话记录: 联系对话[], 结果: '建立关系' | '已拒绝' | '沟通中') => void;
}

const NPC回复话术池: Record<string, string[]> = {
    '寻主': [
        '你好，感谢你的回应。能说说你是怎么看到我的帖子的吗？',
        '我很谨慎地选择人。你能告诉我，你为什么会对这个感兴趣？',
        '我不轻易相信陌生人。我们先聊聊，看看是否合适。',
        '你的回复让我觉得可以进一步了解。你期待什么样的关系？',
    ],
    '召奴': [
        '你好，谢谢你的关注。能说说你找什么样的人吗？',
        '我对你的帖子挺感兴趣的。你期待怎样的互动？',
        '我先看看你的诚意。说说你的想法吧。',
        '你的文字让我觉得你可能是一个合适的人选。我们继续聊聊。',
    ],
    '不限': [
        '你好，我看到你的回应了。能多聊聊吗？',
        '感谢你的关注。我持开放态度，先互相了解吧。',
        '你的回复挺真诚的。你期待怎样的关系？',
        '我觉得我们可以进一步交流想法。',
    ],
};

const 玩家回复引导: string[] = [
    '你好，我看到你的帖子了。',
    '我对你的想法很感兴趣，想进一步了解。',
    '能多说说你的期望吗？',
    '我觉得我们可以试着接触一下。',
    '谢谢你的信任，我会认真对待的。',
];

const BDSMContactModal: React.FC<Props> = ({ post, onBack, onConfirm }) => {
    const [messages, setMessages] = useState<联系对话[]>([]);
    const [inputText, setInputText] = useState('');
    const [npcName, setNpcName] = useState<string>(post.寻主召奴信息?.解锁NPC姓名 || '匿名');
    const [isLoading, setIsLoading] = useState(false);
    const [round, setRound] = useState(0);
    const [status, setStatus] = useState<'沟通中' | '已确认' | '已拒绝'>('沟通中');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const 招募方角色 = post.寻主召奴信息?.招募方角色 || '不限';

    // 初始消息
    useEffect(() => {
        const 初始对话 = generateInitialMessage(招募方角色);
        setMessages([{
            发送者: 'NPC',
            内容: 初始对话,
            时间: '刚刚',
        }]);
    }, [招募方角色]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim() || isLoading || status !== '沟通中') return;

        const playerMsg: 联系对话 = {
            发送者: '玩家',
            内容: inputText.trim(),
            时间: '刚刚',
        };

        setMessages(prev => [...prev, playerMsg]);
        setInputText('');
        setIsLoading(true);

        // 模拟 NPC 回复
        setTimeout(() => {
            const newRound = round + 1;
            const npcReply = generateNPCReply(招募方角色, newRound);

            // 判定结果
            let 新状态: '沟通中' | '已确认' | '已拒绝' = '沟通中';
            if (newRound >= 3) {
                新状态 = Math.random() > 0.3 ? '已确认' : '已拒绝';
                setStatus(新状态);
            }

            const npcMsg: 联系对话 = {
                发送者: 'NPC',
                内容: npcReply,
                时间: '刚刚',
            };

            setMessages(prev => [...prev, npcMsg]);
            setRound(newRound);
            setIsLoading(false);

            // 如果已确认且帖子有NPC信息，触发解锁
            if (新状态 === '已确认' && post.寻主召奴信息?.解锁NPC姓名) {
                setNpcName(post.寻主召奴信息!.解锁NPC姓名);
            }
        }, 1000);
    };

    const handleConfirm = () => {
        onConfirm(messages, status === '已确认' ? '建立关系' : status);
    };

    const handleQuickReply = (text: string) => {
        setInputText(text);
    };

    return (
        <div className="flex flex-col h-full bg-gray-950">
            {/* 顶部栏 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-700/30 bg-purple-950/20">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-purple-300 text-sm truncate">{npcName}</h3>
                    <span className="text-[10px] text-gray-500">
                        {招募方角色 === '寻主' ? '寻找支配方' : 招募方角色 === '召奴' ? '寻找服从方' : '开放态度'}
                        {' · '}
                        {post.寻主召奴信息?.期望关系类型 || '不限'}
                    </span>
                </div>
                {status === '已确认' && (
                    <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded-full">匹配成功</span>
                )}
                {status === '已拒绝' && (
                    <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-1 rounded-full">未匹配</span>
                )}
            </div>

            {/* 帖子信息摘要 */}
            <div className="px-4 py-2 border-b border-gray-800/30 bg-gray-900/30">
                <p className="text-[10px] text-gray-500 line-clamp-2">{post.标题}：{post.内容}</p>
            </div>

            {/* 聊天区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.发送者 === '玩家' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.发送者 === '玩家'
                                ? 'bg-purple-600/60 text-white'
                                : 'bg-gray-800/50 text-gray-200'
                        }`}>
                            {msg.发送者 !== '玩家' && (
                                <div className="text-[9px] text-purple-400/60 mb-0.5">{npcName}</div>
                            )}
                            <p>{msg.内容}</p>
                            <span className="text-[9px] text-gray-500 mt-1 block">{msg.时间}</span>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                            <span className="text-sm text-gray-400 animate-pulse">对方正在输入...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 快捷回复 */}
            {status === '沟通中' && round < 3 && (
                <div className="px-4 py-2 border-t border-gray-800/30 flex gap-2 overflow-x-auto">
                    {玩家回复引导.slice(0, 3).map((text, i) => (
                        <button
                            key={i}
                            onClick={() => handleQuickReply(text)}
                            className="text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full whitespace-nowrap hover:bg-purple-500/20 transition-colors"
                        >{text}</button>
                    ))}
                </div>
            )}

            {/* 输入框 */}
            {status === '沟通中' && round < 3 && (
                <div className="flex gap-2 px-4 py-3 border-t border-gray-700/50">
                    <input
                        className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        placeholder="输入回复..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600/80 hover:bg-purple-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >发送</button>
                </div>
            )}

            {/* 结果操作区 */}
            {(status === '已确认' || status === '已拒绝') && (
                <div className="px-4 py-4 border-t border-gray-700/50">
                    {status === '已确认' ? (
                        <div className="space-y-3">
                            <div className="text-center">
                                <p className="text-sm text-green-400 font-medium">联系成功！</p>
                                <p className="text-[10px] text-gray-500 mt-1">你们建立了初步的信任关系</p>
                            </div>
                            <button
                                onClick={handleConfirm}
                                className="w-full py-2.5 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                            >确认并继续</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-center">
                                <p className="text-sm text-red-400 font-medium">未能建立联系</p>
                                <p className="text-[10px] text-gray-500 mt-1">对方暂时不想继续交流</p>
                            </div>
                            <button
                                onClick={handleConfirm}
                                className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                            >返回</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BDSMContactModal;

// ==================== 辅助函数 ====================

function generateInitialMessage(角色: string): string {
    const 寻主招呼 = [
        '你好，我看到你的回应了。我在寻找一个值得追随的人。',
        '你好，感谢你的关注。我对你的帖子很感兴趣。',
    ];
    const 召奴招呼 = [
        '你好，我看到你的帖子了。我在寻找一个愿意跟随我的人。',
        '你好，感谢你的回应。我对你描述的想法很感兴趣。',
    ];
    const 不限招呼 = [
        '你好，我看到你的帖子了。我对你的想法很感兴趣，想进一步了解。',
        '你好，感谢你的关注。我们互相了解一下吧。',
    ];

    if (角色 === '寻主') return 寻主招呼[Math.floor(Math.random() * 寻主招呼.length)];
    if (角色 === '召奴') return 召奴招呼[Math.floor(Math.random() * 召奴招呼.length)];
    return 不限招呼[Math.floor(Math.random() * 不限招呼.length)];
}

function generateNPCReply(角色: string, round: number): string {
    const pool = NPC回复话术池[角色] || NPC回复话术池['不限'];
    if (round >= 3) {
        // 最终轮判定回复
        return Math.random() > 0.3
            ? '经过这几轮交流，我觉得你可能是合适的人。我们可以进一步接触。'
            : '抱歉，我觉得我们可能不太合适。祝你好运。';
    }
    return pool[Math.min(round - 1, pool.length - 1)] || pool[pool.length - 1];
}
