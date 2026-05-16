import React, { useState, useCallback, useMemo } from 'react';
import { 角色数据结构 } from '../../../types';
import { 游戏物品 } from '../../../models/item';
import { getRarityNameClass, getRarityStyles } from '../../ui/rarityStyles';
import { IconSwords, IconDagger, IconShield, IconArmor, IconBackpack, IconBelt, IconHelmet, IconBoot, IconPants, IconGlove, IconHorse, ItemTypeIcon } from '../../ui/Icons';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import { getRpgDispatcher } from '../../../hooks/useRpgStateBridge';
import type { EquipSlots } from '../../../hooks/useGame/engine/rpgEquipEngine';

interface Props {
    character: 角色数据结构;
    onClose: () => void;
    rpgMode?: boolean;
}

function toRpgSlot(slotKey: keyof 角色数据结构['装备']): keyof EquipSlots | null {
    if (slotKey === '主武器' || slotKey === '副武器') return '武器';
    if (slotKey === '盔甲' || slotKey === '胸部' || slotKey === '内衬') return '防具';
    if (slotKey === '头部' || slotKey === '腰部' || slotKey === '手部' || slotKey === '足部' || slotKey === '腿部') return '饰品';
    return null;
}

function toRpgSlotByType(itemType: string): keyof EquipSlots | null {
    if (itemType === '武器') return '武器';
    if (itemType === '防具') return '防具';
    if (itemType === '饰品') return '饰品';
    return null;
}

const MobileEquipmentModal: React.FC<Props> = ({ character, onClose, rpgMode: rpgModeProp }) => {
    const zustandRpgMode = useGameStore(useShallow((s) => s.rpgMode));
    const rpgMode = rpgModeProp ?? zustandRpgMode;

    const [selectedItem, setSelectedItem] = useState<游戏物品 | null>(null);
    const [selectingSlot, setSelectingSlot] = useState<keyof EquipSlots | null>(null);

    const rpgEquipState = useGameStore(
        useShallow((s) => ({
            weapon: s.rpgEquipWeapon,
            armor: s.rpgEquipArmor,
            accessory: s.rpgEquipAccessory,
        }))
    );

    const getItem = (idOrName: string): 游戏物品 | null => {
        if (!idOrName || idOrName === '无') return null;
        return character.物品列表.find(i => i.ID === idOrName || i.名称 === idOrName) || null;
    };

    const getRpgEquippedItem = useCallback((rpgSlot: keyof EquipSlots): 游戏物品 | null => {
        const equippedId = rpgSlot === '武器' ? rpgEquipState.weapon : rpgSlot === '防具' ? rpgEquipState.armor : rpgEquipState.accessory;
        if (!equippedId) return null;
        return character.物品列表.find(i => i.ID === equippedId) ?? null;
    }, [character.物品列表, rpgEquipState]);

    const handleRpgUnequip = useCallback((rpgSlot: keyof EquipSlots) => {
        getRpgDispatcher().unequipItem(rpgSlot);
        setSelectedItem(null);
    }, []);

    const handleRpgEquip = useCallback((rpgSlot: keyof EquipSlots, item: 游戏物品) => {
        getRpgDispatcher().equipItem(rpgSlot, item);
        setSelectingSlot(null);
        setSelectedItem(null);
    }, []);

    const inventory = useMemo(() => character.物品列表 ?? [], [character.物品列表]);

    const slots = [
        { key: '头部', label: '头部', icon: <IconHelmet size={20} /> },
        { key: '内衬', label: '内衬', icon: <IconArmor size={20} /> },
        { key: '主武器', label: '主武器', icon: <IconSwords size={20} /> },
        { key: '手部', label: '手部', icon: <IconGlove size={20} /> },
        { key: '暗器', label: '暗器', icon: <IconDagger size={20} /> },
        { key: '背部', label: '背负', icon: <IconBackpack size={20} /> },
        { key: '胸部', label: '上装', icon: <IconArmor size={20} /> },
        { key: '盔甲', label: '盔甲', icon: <IconShield size={20} /> },
        { key: '副武器', label: '副武器', icon: <IconShield size={20} /> },
        { key: '腰部', label: '腰间', icon: <IconBelt size={20} /> },
        { key: '腿部', label: '下装', icon: <IconPants size={20} /> },
        { key: '足部', label: '鞋履', icon: <IconBoot size={20} /> },
        { key: '坐骑', label: '坐骑', icon: <IconHorse size={20} /> },
    ];

    const isOverweight = character.当前负重 > character.最大负重;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fadeIn">
            {/* Header with weight display */}
            <div className="flex items-center justify-between p-4 border-b border-wuxia-gold/30">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-wuxia-gold">装备</h2>
                    <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-wuxia-gold/20">
                        <span className="text-[10px] text-wuxia-gold/70 font-serif">身负</span>
                        <span className={`text-sm font-mono ${isOverweight ? 'text-red-500 font-bold' : 'text-wuxia-gold'}`}>
                            {character.当前负重}
                        </span>
                        <span className="text-gray-500 text-xs">/</span>
                        <span className="text-xs text-gray-400 font-mono">{character.最大负重}</span>
                        <span className="text-[9px] text-gray-500 font-serif">斤</span>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-700 text-gray-400" title="关闭">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                        const rpgSlot = toRpgSlot(slot.key as keyof typeof character.装备);
                        const traditionalItem = getItem(character.装备[slot.key as keyof typeof character.装备]);
                        const rpgItem = rpgMode && rpgSlot ? getRpgEquippedItem(rpgSlot) : null;
                        const item = rpgMode ? rpgItem : traditionalItem;
                        const qualityClass = item
                            ? `${getRarityStyles(item.品质).border} ${getRarityStyles(item.品质).text} ${getRarityStyles(item.品质).bg}`
                            : 'border-gray-700 bg-black/40 text-gray-600 border-dashed';

                        const handleClick = () => {
                            if (!rpgMode) {
                                item && setSelectedItem(item);
                                return;
                            }
                            if (item) {
                                if (rpgSlot) handleRpgUnequip(rpgSlot);
                                else setSelectedItem(item);
                            } else if (rpgSlot) {
                                setSelectingSlot(rpgSlot);
                            }
                        };

                        return (
                            <div
                                key={slot.key}
                                onClick={handleClick}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border ${qualityClass} min-h-[80px] ${item ? 'cursor-pointer' : (rpgMode && rpgSlot ? 'cursor-pointer' : 'cursor-default')}`}
                            >
                                <div className="text-gray-400 mb-1">{slot.icon}</div>
                                <div className="text-[10px] text-gray-500">{slot.label}</div>
                                {item ? (
                                    <>
                                        <div className={`text-xs font-bold truncate w-full text-center mt-0.5 ${getRarityNameClass(item.品质)}`}>
                                            {item.名称}
                                        </div>
                                        <div className="text-[9px] text-wuxia-gold/70 font-mono mt-0.5">
                                            耐久 {item.当前耐久}/{item.最大耐久}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-[10px] text-gray-600">-</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Rich item detail panel */}
            {selectedItem && (
                <div className="fixed inset-0 z-60 flex items-end bg-black/80" onClick={() => setSelectedItem(null)}>
                    <div
                        className="bg-[#0a0a0c] border-t border-wuxia-gold/40 rounded-t-2xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0a0a0c] border-b border-wuxia-gold/10 p-4 pb-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl border-2 ${getRarityStyles(selectedItem.品质).border} ${getRarityStyles(selectedItem.品质).bg} bg-opacity-20 flex items-center justify-center shrink-0`}>
                                    <ItemTypeIcon type={selectedItem.类型} size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-base font-bold font-serif truncate ${getRarityNameClass(selectedItem.品质)}`}>
                                        {selectedItem.名称}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-sm border ${getRarityStyles(selectedItem.品质).border} ${getRarityStyles(selectedItem.品质).text} bg-black/60`}>
                                            {selectedItem.品质}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-serif">{selectedItem.类型}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Description */}
                            <div className="bg-black/30 border-l-4 border-wuxia-gold/40 p-3 rounded-r-xl">
                                <p className="text-gray-300 text-xs font-serif italic leading-relaxed">
                                    "{selectedItem.描述 || '此物来历不明，似有天道之力缠绕。'}"
                                </p>
                            </div>

                            {/* Basic attributes */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 border-b border-wuxia-gold/10 pb-1.5">
                                    <span className="w-1.5 h-1.5 rotate-45 bg-wuxia-gold/50"></span>
                                    <div className="text-[11px] text-wuxia-gold/80 uppercase tracking-widest font-serif font-bold">基本属性</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-black/40 border border-gray-800/80 rounded-xl p-2.5 text-center">
                                        <div className="text-[9px] text-gray-500 font-serif">万钧之重</div>
                                        <div className="text-base font-mono text-gray-200 mt-0.5">{selectedItem.重量} <span className="text-xs text-gray-500">斤</span></div>
                                    </div>
                                    <div className="bg-black/40 border border-gray-800/80 rounded-xl p-2.5 text-center">
                                        <div className="text-[9px] text-gray-500 font-serif">坊市估值</div>
                                        <div className="text-base font-mono text-amber-500 mt-0.5">{selectedItem.价值} <span className="text-xs text-amber-700">铜</span></div>
                                    </div>
                                    <div className="col-span-2 bg-black/40 border border-gray-800/80 rounded-xl p-2.5">
                                        <div className="text-[9px] text-gray-500 font-serif text-center mb-1.5">品相耐久</div>
                                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-blue-500 shadow-[0_0_5px_currentColor]"
                                                style={{ width: `${(selectedItem.当前耐久 / Math.max(selectedItem.最大耐久, 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs font-mono text-blue-300 text-center mt-1">{selectedItem.当前耐久} / {selectedItem.最大耐久}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Combat stats */}
                            {(selectedItem.类型 === '武器' || selectedItem.类型 === '防具') && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3 border-b border-red-900/40 pb-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600/70"></span>
                                        <div className="text-[11px] text-red-500/90 uppercase tracking-widest font-serif font-bold">武道参数</div>
                                    </div>
                                    <div className="space-y-2 bg-red-950/10 border border-red-900/20 p-3 rounded-xl">
                                        {selectedItem.类型 === '武器' && (
                                            <>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-serif">兵刃杀力</span>
                                                    <span className="text-lg font-black font-mono text-red-400">
                                                        {(selectedItem as any).最小攻击}-{(selectedItem as any).最大攻击}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-serif">身法干涉</span>
                                                    <span className="text-sm font-mono text-emerald-400">{(selectedItem as any).攻速修正}</span>
                                                </div>
                                            </>
                                        )}
                                        {selectedItem.类型 === '防具' && (
                                            <>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-serif">外家护体</span>
                                                    <span className="text-lg font-black font-mono text-blue-400">+{(selectedItem as any).物理防御}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-serif">内劲消解</span>
                                                    <span className="text-sm font-bold font-mono text-purple-400">+{(selectedItem as any).内功防御}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Affixes */}
                            {selectedItem.词条列表 && selectedItem.词条列表.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3 border-b border-cyan-900/40 pb-1.5">
                                        <span className="w-1.5 h-1.5 rotate-45 bg-cyan-500"></span>
                                        <div className="text-[11px] text-cyan-500/90 uppercase tracking-widest font-serif font-bold">天启词条</div>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedItem.词条列表.map((mod, i) => (
                                            <div key={`mod_${i}`} className="bg-cyan-950/20 border border-cyan-900/30 p-2.5 rounded-xl flex justify-between items-center">
                                                <span className="text-gray-200 font-serif text-xs flex items-center gap-1.5">
                                                    <span className="text-cyan-600">◈</span>
                                                    {mod.名称} <span className="text-[9px] text-gray-500 font-mono">({mod.属性})</span>
                                                </span>
                                                <span className="text-cyan-300 font-mono font-bold text-xs bg-cyan-950/40 px-2 py-0.5 rounded">
                                                    {mod.数值 > 0 ? '+' : ''}{mod.数值}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* RPG Inventory Picker */}
            {rpgMode && selectingSlot && (
                <div className="fixed inset-0 z-70 flex items-end bg-black/80" onClick={() => setSelectingSlot(null)}>
                    <div className="bg-[#0a0a0c] border-t border-wuxia-gold/40 rounded-t-2xl w-full max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-[#0a0a0c] border-b border-wuxia-gold/10 p-4 flex items-center justify-between">
                            <div className="text-wuxia-gold font-serif font-bold">── 选择装备 ──</div>
                            <button onClick={() => setSelectingSlot(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 border border-gray-700 text-gray-400">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-2">
                                {inventory
                                    .filter((item) => toRpgSlotByType(item.类型) === selectingSlot)
                                    .map((item) => (
                                        <button
                                            key={item.ID}
                                            className={`px-3 py-2 rounded-lg border text-left transition-all ${getRarityStyles(item.品质).border} ${getRarityStyles(item.品质).bg} bg-opacity-10`}
                                            onClick={() => handleRpgEquip(selectingSlot!, item)}
                                        >
                                            <div className={`text-sm font-bold truncate ${getRarityStyles(item.品质).text}`}>{item.名称}</div>
                                            <div className="text-[10px] text-gray-500">{item.类型} · 耐久 {item.当前耐久}</div>
                                        </button>
                                    ))}
                            </div>
                            {inventory.filter((item) => toRpgSlotByType(item.类型) === selectingSlot).length === 0 && (
                                <div className="text-center text-gray-600 text-sm py-8 italic">暂无可装备的物品</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileEquipmentModal;
