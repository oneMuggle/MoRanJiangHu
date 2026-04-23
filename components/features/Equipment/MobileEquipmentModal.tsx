import React, { useState } from 'react';
import { 角色数据结构 } from '../../../types';
import { 游戏物品 } from '../../../models/item';
import { getRarityNameClass, getRarityStyles } from '../../ui/rarityStyles';
import { IconSwords, IconDagger, IconShield, IconArmor, IconBackpack, IconRing, IconBelt, IconHelmet, IconBoot, IconPants, IconGlove, IconHorse } from '../../ui/Icons';

interface Props {
    character: 角色数据结构;
    onClose: () => void;
}

const MobileEquipmentModal: React.FC<Props> = ({ character, onClose }) => {
    const [selectedItem, setSelectedItem] = useState<游戏物品 | null>(null);

    const getItem = (idOrName: string): 游戏物品 | null => {
        if (!idOrName || idOrName === '无') return null;
        return character.物品列表.find(i => i.ID === idOrName || i.名称 === idOrName) || null;
    };

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

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fadeIn">
            <div className="flex items-center justify-between p-4 border-b border-wuxia-gold/30">
                <h2 className="text-lg font-bold text-wuxia-gold">装备</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                        const itemRef = character.装备[slot.key as keyof typeof character.装备];
                        const item = getItem(itemRef);
                        const qualityClass = item
                            ? `${getRarityStyles(item.品质).border} ${getRarityStyles(item.品质).text} ${getRarityStyles(item.品质).bg}`
                            : 'border-gray-700 bg-black/40 text-gray-600 border-dashed';
                        
                        return (
                            <div
                                key={slot.key}
                                onClick={() => item && setSelectedItem(item)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border ${qualityClass} min-h-[72px] ${item ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <div className="text-gray-400 mb-1">{slot.icon}</div>
                                <div className="text-[10px]">{slot.label}</div>
                                {item ? (
                                    <div className={`text-xs font-bold truncate w-full text-center ${getRarityNameClass(item.品质)}`}>
                                        {item.名称}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-gray-600">-</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedItem && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80" onClick={() => setSelectedItem(null)}>
                    <div className="bg-black/90 border border-wuxia-gold/40 rounded-xl p-4 max-w-[300px] w-full mx-4" onClick={e => e.stopPropagation()}>
                        <div className={`text-lg font-bold mb-2 ${getRarityNameClass(selectedItem.品质)}`}>{selectedItem.名称}</div>
                        <div className="text-sm text-gray-400 mb-2">{selectedItem.品质}</div>
                        <div className="text-xs text-gray-500">{selectedItem.描述 || '无描述'}</div>
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="mt-4 w-full py-2 bg-wuxia-gold/20 text-wuxia-gold rounded-lg"
                        >
                            关闭
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileEquipmentModal;