import React, { useCallback } from 'react';
import type { BDSM关系状态, BDSM日常指令 } from '../../models/campusNSFW/sm';

interface Props {
    关系状态: BDSM关系状态;
    npcName: string;
    日常指令: BDSM日常指令[];
    onClose: () => void;
    onAcceptTask?: (任务ID: string) => void;
    onReportComplete?: (任务ID: string, 执行描述: string) => void;
    onAbandonTask?: (任务ID: string) => void;
    onGoToContract?: () => void;
    onEditSafety?: () => void;
}

const 阶段图标: Record<string, string> = {
    '初识': '👁️',
    '试探': '🤝',
    '确立': '💫',
    '深入': '🔗',
    '固化': '💎',
};

const 阶段颜色: Record<string, string> = {
    '初识': 'text-gray-400',
    '试探': 'text-blue-400',
    '确立': 'text-green-400',
    '深入': 'text-purple-400',
    '固化': 'text-amber-400',
};

const 阶段描述: Record<string, string> = {
    '初识': '初次接触，互相了解',
    '试探': '初步信任，轻度互动',
    '确立': '信任建立，正式契约',
    '深入': '深度信任，公开挑战',
    '固化': '完全投入，身份认同',
};

const BDSMRelationshipModal: React.FC<Props> = ({
    关系状态,
    npcName,
    日常指令,
    onClose,
    onAcceptTask,
    onReportComplete,
    onGoToContract,
    onEditSafety,
}) => {
    const [activeTab, setActiveTab] = React.useState<'关系' | '任务'>('关系');

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    const progressPercent = Math.min(100, Math.max(0, 关系状态.服从度));
    const powerBalance = Math.min(100, Math.max(0, ((关系状态.权力天平 + 50) / 100) * 100));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onKeyDown={handleKeyDown}
        >
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-gray-900 rounded-xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-lg text-white font-bold">
                            {npcName[0]}
                        </div>
                        <div>
                            <h2 className="text-lg text-white font-semibold">{npcName} — BDSM 关系</h2>
                            <p className="text-xs text-gray-400">关系阶段：{关系状态.阶段}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
                        aria-label="关闭"
                    >
                        ×
                    </button>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 px-6 py-2 border-b border-gray-700/30 bg-gray-800/30">
                    {([['关系', '关系总览'], ['任务', '调教任务']] as const).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-4 py-1.5 rounded-t text-sm transition-colors ${
                                activeTab === key
                                    ? 'bg-gray-900 text-purple-400 border-b-2 border-purple-500'
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    {activeTab === '关系' && (
                        <div className="p-6 space-y-4">
                            {/* 服从度 & 权力天平 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-400">服从度</span>
                                        <span className="text-sm text-white font-mono">{关系状态.服从度}/100</span>
                                    </div>
                                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-400">权力天平</span>
                                        <span className="text-sm text-white font-mono">
                                            {关系状态.权力天平 > 0 ? '支配' : 关系状态.权力天平 < 0 ? '服从' : '平衡'} {Math.abs(关系状态.权力天平)}/50
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
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
                                </div>
                            </div>

                            {/* 阶段进度 */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-400">阶段进度</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {(['初识', '试探', '确立', '深入', '固化'] as const).map((阶段, idx) => {
                                        const 已达成 = idx <= ['初识', '试探', '确立', '深入', '固化'].indexOf(关系状态.阶段);
                                        return (
                                            <div
                                                key={阶段}
                                                className={`flex-1 text-center py-1 rounded text-xs transition-colors ${
                                                    已达成
                                                        ? `${阶段颜色[阶段]} bg-gray-800/60`
                                                        : 'text-gray-600 bg-gray-800/30'
                                                }`}
                                            >
                                                {阶段图标[阶段]} {阶段}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-center">{阶段描述[关系状态.阶段]}</p>
                            </div>

                            {/* 统计 */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                                    <p className="text-2xl text-white font-bold">
                                        {关系状态.任务历史.filter(t => t.状态 === '已完成').length}
                                    </p>
                                    <p className="text-xs text-gray-500">完成任务</p>
                                </div>
                                <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                                    <p className="text-2xl text-white font-bold">
                                        {关系状态.契约记录.filter(c => c.状态 !== '未缔结' && c.状态 !== '已解除').length}
                                    </p>
                                    <p className="text-xs text-gray-500">有效契约</p>
                                </div>
                                <div className="bg-gray-800/60 rounded-lg p-3 text-center">
                                    <p className="text-2xl text-white font-bold">{关系状态.里程碑.length}</p>
                                    <p className="text-xs text-gray-500">里程碑</p>
                                </div>
                            </div>

                            {/* 安全信息 */}
                            <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-red-400 font-semibold">安全设置</p>
                                    {onEditSafety && (
                                        <button
                                            onClick={onEditSafety}
                                            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                        >编辑</button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400">安全词：<span className="text-white">{关系状态.安全词}</span></p>
                                {关系状态.底线列表.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-400 mb-1">底线：</p>
                                        <ul className="text-sm text-gray-300 space-y-0.5">
                                            {关系状态.底线列表.map((b, i) => (
                                                <li key={i}>• {b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* 最近里程碑 */}
                            {关系状态.里程碑.length > 0 && (
                                <div>
                                    <h4 className="text-sm text-gray-400 font-semibold mb-2">最近里程碑</h4>
                                    <div className="space-y-1">
                                        {关系状态.里程碑.slice(-5).reverse().map((m, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-purple-400 mt-0.5">◆</span>
                                                <div>
                                                    <span className="text-gray-300">{m.描述}</span>
                                                    <span className="text-gray-500 ml-2 text-xs">{m.时间}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === '任务' && (
                        <div className="p-4 space-y-3">
                            {/* 日常指令 */}
                            {日常指令.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">日常指令</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {日常指令.map((指令, idx) => (
                                            <div
                                                key={idx}
                                                className={`px-3 py-2 rounded-lg text-sm border ${
                                                    指令.是否完成
                                                        ? 'bg-green-900/20 border-green-700/30 text-gray-500 line-through'
                                                        : 'bg-gray-800/40 border-gray-700/30 text-gray-300'
                                                }`}
                                            >
                                                <span className="text-xs text-purple-400 mr-1.5">[{指令.分类}]</span>
                                                {指令.内容}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 任务列表 */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-400 mb-2">调教任务</h4>
                                {关系状态.任务历史.filter(t => t.状态 === '进行中' || t.状态 === '待接受').length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-6">暂无活跃任务</p>
                                ) : (
                                    <div className="space-y-2">
                                        {关系状态.任务历史
                                            .filter(t => t.状态 === '进行中' || t.状态 === '待接受')
                                            .map(task => (
                                                <div key={task.id} className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/30">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-base">{任务类型图标[task.类型] || '📌'}</span>
                                                        <span className="text-sm text-white font-medium">{task.标题}</span>
                                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                            task.状态 === '进行中' ? 'bg-blue-600/50 text-blue-200' : 'bg-gray-600/50 text-gray-300'
                                                        }`}>
                                                            {task.状态}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400">{task.描述}</p>
                                                    {task.状态 === '待接受' && onAcceptTask && (
                                                        <button
                                                            onClick={() => onAcceptTask(task.id)}
                                                            className="mt-2 px-3 py-1 rounded text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                                                        >
                                                            接受任务
                                                        </button>
                                                    )}
                                                    {task.状态 === '进行中' && onReportComplete && (
                                                        <button
                                                            onClick={() => onReportComplete(task.id, '')}
                                                            className="mt-2 px-3 py-1 rounded text-xs bg-green-600 hover:bg-green-500 text-white transition-colors"
                                                        >
                                                            报告完成
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-700/50 flex justify-end gap-2">
                    {onGoToContract && (
                        <button
                            onClick={onGoToContract}
                            className="px-4 py-2 rounded-lg text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                        >
                            查看契约
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
};

const 任务类型图标: Record<string, string> = {
    '服从测试': '🎯',
    '忠诚考验': '💎',
    '技能训练': '📚',
    '心理建设': '🧠',
    '公开挑战': '⚡',
    '日常指令': '📋',
    '信物任务': '🎁',
    '契约履行': '📝',
};

export default BDSMRelationshipModal;
