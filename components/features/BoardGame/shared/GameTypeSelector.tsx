import React from 'react';
import type { 桌游类型 } from '../../../../models/boardGameNSFW/core';

interface GameTypeSelectorProps {
  onSelect: (type: 桌游类型) => void;
  selected?: 桌游类型 | null;
  history?: Record<string, number>;
}

const 桌游描述: Record<桌游类型, string> = {
  '密室逃脱': '合作解谜，独处触发',
  '狼人杀': '身份推理，私下结盟',
  '剧本杀': '角色扮演，情感线推进',
  '真心话大冒险': '指令等级，紧张氛围',
  '国王游戏': '绝对服从，随机指令',
  '大富翁': '地产争夺，惩罚债务',
  '棋牌游戏': '心理博弈，Bluff机制',
  '骰子游戏': '随机累积，NSFW指令',
};

const GameTypeSelector: React.FC<GameTypeSelectorProps> = ({ onSelect, selected, history = {} }) => {
  const 游戏列表: 桌游类型[] = [
    '密室逃脱', '狼人杀', '剧本杀', '真心话大冒险',
    '国王游戏', '大富翁', '棋牌游戏', '骰子游戏',
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {游戏列表.map((type) => {
        const isSelected = selected === type;
        const playCount = history[type] || 0;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border transition-all text-left ${
              isSelected
                ? 'border-wuxia-gold bg-wuxia-gold/10 shadow-[0_0_12px_rgba(217,175,65,0.15)]'
                : 'border-gray-700/40 bg-black/30 hover:border-gray-500/50 hover:bg-black/40'
            }`}
          >
            <div className="text-2xl">{type[0]}</div>
            <div className="text-xs font-serif text-gray-300 text-center">{type}</div>
            <div className="text-[10px] text-gray-500 text-center">{桌游描述[type]}</div>
            {playCount > 0 && (
              <div className="absolute top-2 right-2 text-[10px] text-gray-600">
                {playCount}场
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GameTypeSelector;
