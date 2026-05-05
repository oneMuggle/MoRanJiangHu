import React from 'react';
import type { BDSM关系状态, 关系阶段 } from '../../../../models/campusNSFW/sm';

interface Props {
    关系状态: BDSM关系状态;
    npcName: string;
    onGoToTasks?: () => void;
    onGoToContract?: () => void;
}

const 阶段图标: Record<关系阶段, string> = {
    '初识': '👁️',
    '试探': '🤝',
    '确立': '💫',
    '深入': '🔗',
    '固化': '💎',
};

const 阶段颜色: Record<关系阶段, string> = {
    '初识': 'text-gray-400',
    '试探': 'text-blue-400',
    '确立': 'text-green-400',
    '深入': 'text-purple-400',
    '固化': 'text-amber-400',
};

const 阶段描述: Record<关系阶段, string> = {
    '初识': '初次接触，互相了解',
    '试探': '初步信任，轻度互动',
    '确立': '信任建立，正式契约',
    '深入': '深度信任，公开挑战',
    '固化': '完全投入，身份认同',
};

const BDSMRelationshipDashboard: React.FC<Props> = ({ 关系状态, npcName, onGoToTasks, onGoToContract }) => {
    const progressPercent = Math.min(100, Math.max(0, 关系状态.服从度));
    const powerBalance = Math.min(100, Math.max(0, ((关系状态.权力天平 + 50) / 100) * 100));

    return (
        <div className="flex flex-col h-full bg-gray-900/50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700/50">
                <h3 className="font-semibold text-white text-sm">关系总览</h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* NPC 信息 */}
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 mx-auto flex items-center justify-center text-2xl text-white font-bold mb-2">
                        {npcName[0]}
                    </div>
                    <h4 className="text-sm text-white font-medium">{npcName}</h4>
                    <span className={`text-xs ${阶段颜色[关系状态.阶段]}`}>
                        {阶段图标[关系状态.阶段]} {关系状态.阶段}
                    </span>
                    <p className="text-[10px] text-gray-500 mt-1">{阶段描述[关系状态.阶段]}</p>
                </div>

                {/* 服从度 */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">服从度</span>
                        <span className="text-xs text-white font-mono">{关系状态.服从度}/100</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* 权力天平 */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">权力天平</span>
                        <span className="text-xs text-white font-mono">
                            {关系状态.权力天平 > 0 ? '支配' : 关系状态.权力天平 < 0 ? '服从' : '平衡'} {Math.abs(关系状态.权力天平)}/50
                        </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500 z-10" />
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                关系状态.权力天平 >= 0
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}
                            style={{
                                width: `${powerBalance / 2}%`,
                                marginLeft: 关系状态.权力天平 >= 0 ? '50%' : `${powerBalance / 2}%`,
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-blue-400">绝对服从</span>
                        <span className="text-[9px] text-gray-500">平衡</span>
                        <span className="text-[9px] text-orange-400">绝对支配</span>
                    </div>
                </div>

                {/* 阶段进度 */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">阶段进度</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {(['初识', '试探', '确立', '深入', '固化'] as 关系阶段[]).map((阶段, idx) => {
                            const 已达成 = idx <= ['初识', '试探', '确立', '深入', '固化'].indexOf(关系状态.阶段);
                            return (
                                <div
                                    key={阶段}
                                    className={`flex-1 text-center py-1 rounded text-[9px] transition-colors ${
                                        已达成
                                            ? `${阶段颜色[阶段]} bg-gray-800/60`
                                            : 'text-gray-600 bg-gray-800/30'
                                    }`}
                                >
                                    {阶段}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 统计卡片 */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800/60 rounded-lg p-2 text-center">
                        <p className="text-lg text-white font-bold">
                            {关系状态.任务历史.filter(t => t.状态 === '已完成').length}
                        </p>
                        <p className="text-[10px] text-gray-500">完成任务</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-2 text-center">
                        <p className="text-lg text-white font-bold">
                            {关系状态.契约记录.filter(c => c.状态 !== '未缔结' && c.状态 !== '已解除').length}
                        </p>
                        <p className="text-[10px] text-gray-500">有效契约</p>
                    </div>
                    <div className="bg-gray-800/60 rounded-lg p-2 text-center">
                        <p className="text-lg text-white font-bold">{关系状态.里程碑.length}</p>
                        <p className="text-[10px] text-gray-500">里程碑</p>
                    </div>
                </div>

                {/* 安全信息 */}
                <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                    <p className="text-[10px] text-red-400 font-semibold mb-1">安全设置</p>
                    <p className="text-[10px] text-gray-400">安全词：{关系状态.安全词}</p>
                    {关系状态.底线列表.length > 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">
                            底线：{关系状态.底线列表.slice(0, 3).join('、')}
                            {关系状态.底线列表.length > 3 ? ` 等${关系状态.底线列表.length}条` : ''}
                        </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-700/50 flex gap-2">
                <button
                    onClick={onGoToTasks}
                    className="flex-1 py-2 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                >
                    查看任务
                </button>
                <button
                    onClick={onGoToContract}
                    className="flex-1 py-2 rounded-lg text-xs bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                >
                    查看契约
                </button>
            </div>
        </div>
    );
};

export default BDSMRelationshipDashboard;
