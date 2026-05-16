/**
 * RpgEquipmentIntegration.tsx
 *
 * RPG 模式装备面板。使用 3 槽位系统（武器、防具、饰品），
 * 读取角色物品列表进行装备/卸下操作。
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useGameStore } from '../../../hooks/useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import type { 角色数据结构 } from '../../../models/character';
import type { 游戏物品 } from '../../../models/item';
import { getRarityStyles } from '../../ui/rarityStyles';
import { IconSwords, IconShield, IconRing } from '../../ui/Icons';

interface Props {
  character: 角色数据结构;
  onClose: () => void;
}

const SLOT_CONFIG = [
  { key: 'weapon' as const, rpgKey: 'rpgEquipWeapon', label: '武器', type: '武器' as const, icon: <IconSwords size={20} /> },
  { key: 'armor' as const, rpgKey: 'rpgEquipArmor', label: '防具', type: '防具' as const, icon: <IconShield size={20} /> },
  { key: 'accessory' as const, rpgKey: 'rpgEquipAccessory', label: '饰品', type: '饰品' as const, icon: <IconRing size={20} /> },
];

export const RpgEquipmentIntegration: React.FC<Props> = ({ character, onClose }) => {
  const { equipWeapon, equipArmor, equipAccessory, setRpgEquipSlot } = useGameStore(
    useShallow((s) => ({
      equipWeapon: s.rpgEquipWeapon,
      equipArmor: s.rpgEquipArmor,
      equipAccessory: s.rpgEquipAccessory,
      setRpgEquipSlot: s.setRpgEquipSlot,
    }))
  );

  const [showInventory, setShowInventory] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<'weapon' | 'armor' | 'accessory' | null>(null);

  const inventory = useMemo(() => character.物品列表 ?? [], [character.物品列表]);

  const equippedMap = useMemo(() => ({
    weapon: equipWeapon,
    armor: equipArmor,
    accessory: equipAccessory,
  }), [equipWeapon, equipArmor, equipAccessory]);

  const getEquippedItem = useCallback((slotKey: string): 游戏物品 | undefined => {
    const equippedId = equippedMap[slotKey as keyof typeof equippedMap];
    if (!equippedId) return undefined;
    return inventory.find((item) => item.ID === equippedId);
  }, [inventory, equippedMap]);

  const handleEquip = useCallback((slot: 'weapon' | 'armor' | 'accessory', item: 游戏物品) => {
    setRpgEquipSlot(slot, item);
    setShowInventory(false);
    setSelectingSlot(null);
  }, [setRpgEquipSlot]);

  const handleUnequip = useCallback((slot: 'weapon' | 'armor' | 'accessory') => {
    setRpgEquipSlot(slot, null);
  }, [setRpgEquipSlot]);

  const selectingConfig = SLOT_CONFIG.find((s) => s.key === selectingSlot);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-ink-black/95 border border-wuxia-gold/20 w-full max-w-lg h-[70vh] flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 h-14 flex items-center justify-between px-6 border-b border-wuxia-gold/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-950/50 border border-red-700/40 flex items-center justify-center text-red-400">
              <IconSwords size={16} />
            </div>
            <h3 className="text-wuxia-gold font-serif font-bold text-lg tracking-wider">RPG 装备</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-700 text-gray-400 hover:text-wuxia-red">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 3 槽位 */}
          <div className="space-y-3 mb-6">
            {SLOT_CONFIG.map((slot) => {
              const equipped = getEquippedItem(slot.key);
              return (
                <div key={slot.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/60 border border-gray-700 text-wuxia-gold/80">
                    {slot.icon}
                  </div>
                  <span className="text-xs text-gray-400 font-serif w-10">{slot.label}</span>
                  {equipped ? (
                    <div
                      className={`flex-1 px-3 py-2 rounded-lg border cursor-pointer hover:scale-[1.01] transition-transform ${getRarityStyles(equipped.品质).border} ${getRarityStyles(equipped.品质).bg} bg-opacity-10`}
                      onClick={() => handleUnequip(slot.key)}
                    >
                      <div className={`text-sm font-bold ${getRarityStyles(equipped.品质).text}`}>{equipped.名称}</div>
                      <div className="text-[10px] text-gray-500">耐久 {equipped.当前耐久}/{equipped.最大耐久}</div>
                    </div>
                  ) : (
                    <button
                      className="flex-1 px-3 py-2 rounded-lg border border-dashed border-gray-700 text-gray-600 text-sm hover:border-wuxia-gold/40 hover:text-wuxia-gold/60 transition-colors"
                      onClick={() => { setSelectingSlot(slot.key); setShowInventory(true); }}
                    >
                      空置 — 点击装备
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* 背包选择器 */}
          {showInventory && selectingConfig && (
            <div>
              <div className="text-xs text-wuxia-gold/60 font-serif mb-2 tracking-wider">
                ── 选择{selectingConfig.label} ──
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                {inventory
                  .filter((item) => item.类型 === selectingConfig.type)
                  .map((item) => (
                    <button
                      key={item.ID}
                      className={`px-3 py-2 rounded-lg border text-left transition-all hover:scale-[1.02] ${getRarityStyles(item.品质).border} ${getRarityStyles(item.品质).bg} bg-opacity-10`}
                      onClick={() => handleEquip(selectingSlot!, item)}
                    >
                      <div className={`text-sm font-bold truncate ${getRarityStyles(item.品质).text}`}>{item.名称}</div>
                      <div className="text-[10px] text-gray-500">{item.类型} · {item.品质} · 耐久 {item.当前耐久}</div>
                    </button>
                  ))}
              </div>
              {inventory.filter((item) => item.类型 === selectingConfig.type).length === 0 && (
                <div className="text-center text-gray-600 text-sm py-4 italic">暂无{selectingConfig.label}类物品</div>
              )}
              <button
                className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-700 text-gray-500 text-sm hover:text-wuxia-gold/60"
                onClick={() => { setShowInventory(false); setSelectingSlot(null); }}
              >
                返回
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
