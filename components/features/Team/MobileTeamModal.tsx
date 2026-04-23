import React, { useState } from 'react';
import { 角色数据结构, NPC结构 } from '../../../types';

interface Props {
    character: 角色数据结构;
    teammates: NPC结构[];
    onClose: () => void;
}

const formatTimeAgo = (timestamp?: number): string => {
    if (!timestamp) return '未知';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    return `${days} 天前`;
};

const getTeammateLastUpdateTime = (npc: NPC结构): number | undefined => {
    const candidates: unknown[] = [
        npc.上次更新时间,
        (npc as any)?.最后更新时间,
        (npc as any)?.更新时间,
        (npc as any)?.队伍战斗状态?.上次更新时间,
        (npc as any)?.队伍战斗状态?.最后更新时间,
        (npc as any)?.战斗状态?.上次更新时间,
        (npc as any)?.战斗状态?.最后更新时间
    ];
    for (const c of candidates) {
        if (typeof c === 'number' && c > 0) return c;
    }
    return undefined;
};

const ProgressBar: React.FC<{ label: string; cur: number; max: number; color: string }> = ({ label, cur, max, color }) => {
    const safeMax = Math.max(1, max || 0);
    const safeCur = Math.max(0, cur || 0);
    const pct = Math.max(0, Math.min(100, (safeCur / safeMax) * 100));
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">{label}</span>
                <span className="font-mono text-gray-300">{safeCur}/{safeMax}</span>
            </div>
            <div className="h-1.5 bg-gray-900 rounded-full border border-gray-800 overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const MobileTeamModal: React.FC<Props> = ({ character, teammates, onClose }) => {
    const activeTeammates = (Array.isArray(teammates) ? teammates : []).filter((n) => n.是否队友 === true);
    const [selectedTeammate, setSelectedTeammate] = useState<NPC结构 | null>(null);

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex flex-col md:hidden animate-fadeIn">
            {/* Header */}
            <div className="h-12 shrink-0 border-b border-wuxia-gold/20 bg-black/60 flex items-center justify-between px-4">
                <h3 className="text-wuxia-gold font-serif font-bold text-base tracking-[0.3em]">队伍管理</h3>
                <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400"
                    title="关闭"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {/* Leader card */}
                <div
                    className="bg-black/40 border border-wuxia-gold/20 rounded-xl p-4 cursor-pointer hover:border-wuxia-gold/40 transition-colors"
                    onClick={() => setSelectedTeammate(null)}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-wuxia-gold/20 border border-wuxia-gold/40 flex items-center justify-center text-wuxia-gold font-serif font-bold text-sm">
                                {character.姓名?.[0] || '队'}
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 tracking-[0.2em]">队长</div>
                                <div className="text-lg text-wuxia-gold font-serif font-bold">{character.姓名}</div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400">{character.境界}</div>
                    </div>
                    <div className="space-y-2">
                        <ProgressBar label="精力" cur={character.当前精力} max={character.最大精力} color="bg-teal-500" />
                        <ProgressBar label="内力" cur={character.当前内力} max={character.最大内力} color="bg-indigo-500" />
                    </div>
                </div>

                {/* Teammate list */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] text-gray-500 tracking-[0.2em]">队员列表 · 点击查看详情</span>
                        <span className="text-[10px] text-wuxia-cyan/80">{activeTeammates.length} 人</span>
                    </div>

                    <div className="space-y-2">
                        {activeTeammates.map((npc) => (
                            <div
                                key={npc.id}
                                className="bg-black/35 border border-gray-800 rounded-xl p-3 cursor-pointer hover:border-wuxia-gold/30 transition-colors"
                                onClick={() => setSelectedTeammate(npc)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 font-serif text-xs">
                                            {npc.姓名?.[0] || '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-200 font-serif">{npc.姓名}</div>
                                            <div className="text-[10px] text-gray-500">{npc.身份} · {npc.境界}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-red-300">攻 {npc.攻击力 || 0}</div>
                                        <div className="text-[10px] text-blue-300">防 {npc.防御力 || 0}</div>
                                    </div>
                                </div>
                                {/* Last update timestamp */}
                                {getTeammateLastUpdateTime(npc) && (
                                    <div className="mt-1.5 text-[9px] text-gray-600 font-serif italic">
                                        前尘印记：{formatTimeAgo(getTeammateLastUpdateTime(npc))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {activeTeammates.length === 0 && (
                            <div className="text-center text-gray-600 text-xs py-8 bg-black/20 rounded-xl border border-dashed border-gray-800">暂无队员</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Teammate detail overlay */}
            {selectedTeammate && (
                <div className="fixed inset-0 z-[210] flex items-end bg-black/80" onClick={() => setSelectedTeammate(null)}>
                    <div
                        className="bg-[#0a0a0c] border-t border-wuxia-gold/40 rounded-t-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Detail header */}
                        <div className="sticky top-0 bg-[#0a0a0c] border-b border-wuxia-gold/10 p-4 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-wuxia-gold/15 border border-wuxia-gold/40 flex items-center justify-center text-wuxia-gold font-serif font-bold">
                                    {selectedTeammate.姓名?.[0] || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-base font-serif font-bold text-wuxia-gold">{selectedTeammate.姓名}</div>
                                    <div className="text-[10px] text-gray-500">{selectedTeammate.身份} · {selectedTeammate.境界}</div>
                                </div>
                                <button onClick={() => setSelectedTeammate(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Combat stats */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 border border-red-900/30 rounded-xl p-3 text-center">
                                    <div className="text-[9px] text-red-500/70 font-serif">威能</div>
                                    <div className="text-xl font-mono font-bold text-red-300 mt-1">{selectedTeammate.攻击力 || 0}</div>
                                </div>
                                <div className="bg-black/40 border border-blue-900/30 rounded-xl p-3 text-center">
                                    <div className="text-[9px] text-blue-500/70 font-serif">护体</div>
                                    <div className="text-xl font-mono font-bold text-blue-300 mt-1">{selectedTeammate.防御力 || 0}</div>
                                </div>
                            </div>

                            {/* Vitals */}
                            <div className="space-y-2 bg-black/30 border border-gray-800 rounded-xl p-3">
                                <ProgressBar label="血量" cur={selectedTeammate.当前血量 || 0} max={selectedTeammate.最大血量 || 0} color="bg-red-700" />
                                <ProgressBar label="精力" cur={selectedTeammate.当前精力 || 0} max={selectedTeammate.最大精力 || 0} color="bg-blue-700" />
                                <ProgressBar label="内力" cur={selectedTeammate.当前内力 || 0} max={selectedTeammate.最大内力 || 0} color="bg-indigo-700" />
                            </div>

                            {/* Equipment */}
                            {(selectedTeammate.当前装备?.主武器 || selectedTeammate.当前装备?.副武器 || selectedTeammate.当前装备?.饰品) && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 border-b border-wuxia-gold/10 pb-1">
                                        <span className="w-1.5 h-1.5 rotate-45 bg-wuxia-gold/50"></span>
                                        <div className="text-[11px] text-wuxia-gold/80 font-serif tracking-widest">神兵利器</div>
                                    </div>
                                    <div className="space-y-1">
                                        {selectedTeammate.当前装备?.主武器 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">主手兵刃</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.主武器}</span>
                                            </div>
                                        )}
                                        {selectedTeammate.当前装备?.副武器 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">副手持物</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.副武器}</span>
                                            </div>
                                        )}
                                        {selectedTeammate.当前装备?.饰品 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">随身配饰</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.饰品}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Gender-specific clothing */}
                            {selectedTeammate.性别 === '女' && (selectedTeammate.当前装备?.服装 || selectedTeammate.当前装备?.内衣 || selectedTeammate.当前装备?.内裤 || selectedTeammate.当前装备?.袜饰 || selectedTeammate.当前装备?.鞋履) && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 border-b border-pink-900/20 pb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500/70"></span>
                                        <div className="text-[11px] text-pink-400/90 font-serif tracking-widest">裙衫装束</div>
                                    </div>
                                    <div className="space-y-1">
                                        {selectedTeammate.当前装备?.服装 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">外装罗裙</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.服装}</span>
                                            </div>
                                        )}
                                        {selectedTeammate.当前装备?.内衣 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">贴身亵衣</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.内衣}</span>
                                            </div>
                                        )}
                                        {selectedTeammate.当前装备?.内裤 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">贴身亵裤</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.内裤}</span>
                                            </div>
                                        )}
                                        {selectedTeammate.当前装备?.袜饰 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">足下罗袜</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.袜饰}</span>
                                            </div>
                                        )}
                                        {selectedTeammate.当前装备?.鞋履 && (
                                            <div className="flex justify-between text-xs bg-black/30 rounded-lg px-3 py-2 border border-gray-800">
                                                <span className="text-gray-400">足下绣鞋</span>
                                                <span className="text-gray-200 font-serif">{selectedTeammate.当前装备.鞋履}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Backpack */}
                            <div>
                                <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-1">
                                    <span className="w-1.5 h-1.5 rotate-45 bg-gray-500"></span>
                                    <div className="text-[11px] text-gray-400 font-serif tracking-widest">随身行囊</div>
                                </div>
                                {selectedTeammate.背包 && selectedTeammate.背包.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedTeammate.背包.map((item, i) => (
                                            <span key={i} className="text-xs bg-black/50 border border-gray-700 px-2.5 py-1 rounded text-gray-300 font-serif">
                                                {typeof item === 'string' ? item : item?.名称 || '未命名物品'}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-600 text-xs py-4 bg-black/20 rounded-lg border border-dashed border-gray-800 italic">
                                        并无余物
                                    </div>
                                )}
                            </div>

                            {/* Last update */}
                            {getTeammateLastUpdateTime(selectedTeammate) && (
                                <div className="text-[10px] text-gray-600 font-serif italic text-center">
                                    前尘印记：{formatTimeAgo(getTeammateLastUpdateTime(selectedTeammate))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileTeamModal;
