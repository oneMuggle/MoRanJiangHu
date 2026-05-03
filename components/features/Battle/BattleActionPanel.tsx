import React, { useState } from 'react';
import { 角色数据结构, 战斗状态结构 } from '../../../types';
import {
    计算玩家战斗属性,
    生成可用战斗行动,
    执行战斗行动,
    战斗行动选项,
    战斗行动结果,
} from '../../../hooks/useGame/combatCalculation';
import { IconSwords, IconShield, IconPotion } from '../../ui/Icons';

interface Props {
    角色: 角色数据结构;
    battle: 战斗状态结构;
    onAction: (结果: 战斗行动结果) => void;
}

const 行动类型图标: Record<string, React.ReactNode> = {
    '攻击': <IconSwords size={14} />,
    '防御': <IconShield size={14} />,
    '道具': <IconPotion size={14} />,
    '撤退': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    '技能': <IconSwords size={14} />,
};

const 行动类型颜色: Record<string, string> = {
    '攻击': 'text-red-300 border-red-900/40 bg-red-950/30',
    '防御': 'text-blue-300 border-blue-900/40 bg-blue-950/30',
    '道具': 'text-green-300 border-green-900/40 bg-green-950/30',
    '撤退': 'text-yellow-300 border-yellow-900/40 bg-yellow-950/30',
    '技能': 'text-purple-300 border-purple-900/40 bg-purple-950/30',
};

const BattleActionPanel: React.FC<Props> = ({ 角色, battle, onAction }) => {
    const [选中目标索引, set选中目标索引] = useState<number>(0);
    const [最新结果, set最新结果] = useState<战斗行动结果 | null>(null);
    const [正在执行, set正在执行] = useState(false);

    const 敌方列表 = Array.isArray(battle?.敌方) ? battle.敌方 : [];
    const 存活敌人 = 敌方列表.filter((e) => (e.当前血量 || 0) > 0);
    const 战斗属性 = 计算玩家战斗属性(角色);
    const 可用行动 = 生成可用战斗行动(角色, 敌方列表);

    const 执行行动 = async (行动: 战斗行动选项) => {
        set正在执行(true);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const 目标 = 行动.目标类型 !== '自身' ? 存活敌人[选中目标索引] || null : null;
        const 结果 = 执行战斗行动(行动, 战斗属性, 目标);

        set最新结果(结果);
        onAction(结果);
        set正在执行(false);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* 目标选择 */}
            {存活敌人.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-wuxia-gold/70 font-serif">目标:</span>
                    {存活敌人.map((enemy, idx) => (
                        <button
                            key={idx}
                            onClick={() => set选中目标索引(idx)}
                            className={`px-3 py-1 rounded text-xs font-serif transition-all ${
                                选中目标索引 === idx
                                    ? 'bg-red-900/60 text-red-200 border border-red-700 shadow-[0_0_8px_rgba(220,38,38,0.3)]'
                                    : 'bg-black/40 text-gray-400 border border-gray-800 hover:border-red-900/50'
                            }`}
                        >
                            {enemy.名字}
                            <span className="ml-1 text-[10px] text-red-400">
                                {enemy.当前血量}/{enemy.最大血量}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* 行动按钮列表 */}
            <div className="grid grid-cols-2 gap-2">
                {可用行动.map((行动) => (
                    <button
                        key={行动.id}
                        onClick={() => 执行行动(行动)}
                        disabled={正在执行}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all
                            ${行动类型颜色[行动.类型] || 'text-gray-300 border-gray-800 bg-black/30'}
                            ${正在执行 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-lg'}
                        `}
                    >
                        <span className="shrink-0">
                            {行动类型图标[行动.类型]}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-serif truncate">{行动.名称}</div>
                            <div className="text-[10px] opacity-60 truncate">{行动.描述}</div>
                            {行动.消耗内力 && (
                                <div className="text-[10px] text-cyan-400/80">
                                    消耗内力: {行动.消耗内力}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* 战斗结果反馈 */}
            {最新结果 && (
                <div className={`rounded-lg border p-3 text-sm font-serif transition-all ${
                    最新结果.成功
                        ? 'border-green-900/40 bg-green-950/30 text-green-200'
                        : 'border-red-900/40 bg-red-950/30 text-red-200'
                }`}>
                    {最新结果.描述}
                    {最新结果.伤害 && (
                        <div className="mt-1 text-xs opacity-80">
                            {最新结果.伤害.描述}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BattleActionPanel;
