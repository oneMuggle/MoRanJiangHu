import React, { useCallback } from 'react';
import type { BDSM关系状态, BDSM日常指令, BDSM调教任务 } from '../../models/campusNSFW/sm';

interface Props {
    关系状态: BDSM关系状态;
    日常指令: BDSM日常指令[];
    onClose: () => void;
    onAcceptTask?: (任务ID: string) => void;
    onReportComplete?: (任务ID: string, 执行描述: string) => void;
    onAbandonTask?: (任务ID: string) => void;
}

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

const 难度颜色: Record<string, string> = {
    '入门': 'text-green-400',
    '初级': 'text-blue-400',
    '中级': 'text-yellow-400',
    '高级': 'text-orange-400',
    '极限': 'text-red-400',
};

const 状态颜色: Record<string, string> = {
    '待接受': 'bg-gray-600/50 text-gray-300',
    '进行中': 'bg-blue-600/50 text-blue-200',
    '已完成': 'bg-green-600/50 text-green-200',
    '已失败': 'bg-red-600/50 text-red-200',
    '已放弃': 'bg-yellow-600/50 text-yellow-200',
};

const BDSMTaskModal: React.FC<Props> = ({
    关系状态,
    日常指令,
    onClose,
    onAcceptTask,
    onReportComplete,
    onAbandonTask,
}) => {
    const [展开任务ID, set展开任务ID] = React.useState<string | null>(null);
    const [执行描述, set执行描述] = React.useState('');
    const [筛选, set筛选] = React.useState<'全部' | '待接受' | '进行中'>('进行中');

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    const 活跃任务 = 关系状态.任务历史.filter(t => {
        if (筛选 === '全部') return true;
        if (筛选 === '待接受') return t.状态 === '待接受';
        if (筛选 === '进行中') return t.状态 === '进行中';
        return true;
    }).sort((a, b) => {
        if (a.状态 === '进行中' && b.状态 !== '进行中') return -1;
        if (a.状态 !== '进行中' && b.状态 === '进行中') return 1;
        return 0;
    });

    const 待接受数 = 关系状态.任务历史.filter(t => t.状态 === '待接受').length;
    const 进行中数 = 关系状态.任务历史.filter(t => t.状态 === '进行中').length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onKeyDown={handleKeyDown}
        >
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-gray-900 rounded-xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                    <h2 className="text-lg text-white font-semibold">调教任务</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
                        aria-label="关闭"
                    >
                        ×
                    </button>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 px-6 py-2 border-b border-gray-700/30 bg-gray-800/30">
                    {(['进行中', '待接受', '全部'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => set筛选(s)}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                                筛选 === s
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {s}{s === '进行中' ? ` (${进行中数})` : s === '待接受' ? ` (${待接受数})` : ''}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-4">
                        {/* 日常指令 */}
                        {日常指令.length > 0 && (
                            <div className="mb-4">
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
                        {活跃任务.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <span className="text-4xl text-gray-600 mb-2">📋</span>
                                <p className="text-sm text-gray-500">暂无{筛选 === '全部' ? '' : 筛选}任务</p>
                                <p className="text-xs text-gray-600 mt-1">任务会在见面后由系统生成</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {活跃任务.map((task: BDSM调教任务) => (
                                    <div
                                        key={task.id}
                                        className="bg-gray-800/60 rounded-lg border border-gray-700/30 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => set展开任务ID(展开任务ID === task.id ? null : task.id)}
                                            className="w-full px-4 py-3 text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">
                                                    {任务类型图标[task.类型] || '📌'}
                                                </span>
                                                <span className="text-sm text-white font-medium flex-1">
                                                    {task.标题}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${状态颜色[task.状态]}`}>
                                                    {task.状态}
                                                </span>
                                                <span className={`text-xs ${难度颜色[task.难度]}`}>
                                                    {task.难度}
                                                </span>
                                            </div>
                                        </button>

                                        {展开任务ID === task.id && (
                                            <div className="px-4 pb-3 space-y-2 border-t border-gray-700/30 pt-3">
                                                <p className="text-sm text-gray-300">{task.描述}</p>

                                                {task.截止时间 && (
                                                    <p className="text-xs text-gray-500">截止：{task.截止时间}</p>
                                                )}

                                                {task.状态 === '进行中' && task.奖励描述 && (
                                                    <p className="text-xs text-green-400">奖励：{task.奖励描述}</p>
                                                )}
                                                {task.状态 === '进行中' && task.惩罚描述 && (
                                                    <p className="text-xs text-red-400">失败：{task.惩罚描述}</p>
                                                )}
                                                {task.状态 === '已完成' && task.评价 && (
                                                    <p className="text-xs text-blue-400">评价：{task.评价}</p>
                                                )}

                                                {task.状态 === '待接受' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => onAcceptTask?.(task.id)}
                                                            className="flex-1 py-2 rounded text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                                                        >
                                                            接受任务
                                                        </button>
                                                    </div>
                                                )}

                                                {task.状态 === '进行中' && (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            className="w-full bg-gray-700/50 border border-gray-600/50 rounded px-3 py-2 text-sm text-white placeholder-gray-500 resize-none"
                                                            rows={2}
                                                            placeholder="描述执行情况..."
                                                            value={执行描述}
                                                            onChange={e => set执行描述(e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    onReportComplete?.(task.id, 执行描述);
                                                                    set执行描述('');
                                                                    set展开任务ID(null);
                                                                }}
                                                                className="flex-1 py-2 rounded text-sm bg-green-600 hover:bg-green-500 text-white transition-colors"
                                                            >
                                                                报告完成
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    onAbandonTask?.(task.id);
                                                                    set展开任务ID(null);
                                                                }}
                                                                className="px-4 py-2 rounded text-sm bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                                                            >
                                                                放弃
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-700/50 flex justify-end">
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

export default BDSMTaskModal;
