import React from 'react';
import type { BDSM日常指令, BDSM关系状态 } from '../../../../models/campusNSFW/sm';

interface Props {
    关系状态: BDSM关系状态;
    日常指令: BDSM日常指令[];
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

const BDSMTaskPanel: React.FC<Props> = ({ 关系状态, 日常指令, onAcceptTask, onReportComplete, onAbandonTask }) => {
    const [展开任务ID, set展开任务ID] = React.useState<string | null>(null);
    const [执行描述, set执行描述] = React.useState('');
    const [筛选, set筛选] = React.useState<'全部' | '待接受' | '进行中'>('进行中');

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
        <div className="flex flex-col h-full bg-gray-900/50">
            <div className="px-4 py-3 border-b border-gray-700/50">
                <h3 className="font-semibold text-white text-sm">调教任务</h3>
                <div className="flex gap-2 mt-2">
                    {(['进行中', '待接受', '全部'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => set筛选(s)}
                            className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                                筛选 === s
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700/50 text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {s}{s === '进行中' ? ` (${进行中数})` : s === '待接受' ? ` (${待接受数})` : ''}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {活跃任务.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-3xl text-gray-600 mb-2">📋</span>
                        <p className="text-sm text-gray-500">暂无{筛选 === '全部' ? '' : 筛选}任务</p>
                        <p className="text-[10px] text-gray-600 mt-1">任务会在见面后由系统生成</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {活跃任务.map(task => (
                            <div
                                key={task.id}
                                className="bg-gray-800/60 rounded-lg border border-gray-700/30 overflow-hidden"
                            >
                                <button
                                    onClick={() => set展开任务ID(展开任务ID === task.id ? null : task.id)}
                                    className="w-full px-3 py-2.5 text-left"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">
                                            {任务类型图标[task.类型] || '📌'}
                                        </span>
                                        <span className="text-sm text-white font-medium flex-1 truncate">
                                            {task.标题}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${状态颜色[task.状态]}`}>
                                            {task.状态}
                                        </span>
                                        <span className={`text-[10px] ${难度颜色[task.难度]}`}>
                                            {task.难度}
                                        </span>
                                    </div>
                                </button>

                                {展开任务ID === task.id && (
                                    <div className="px-3 pb-3 space-y-2 border-t border-gray-700/30 pt-2">
                                        <p className="text-xs text-gray-300">{task.描述}</p>

                                        {task.截止时间 && (
                                            <p className="text-[10px] text-gray-500">截止：{task.截止时间}</p>
                                        )}

                                        {task.状态 === '进行中' && task.奖励描述 && (
                                            <p className="text-[10px] text-green-400">奖励：{task.奖励描述}</p>
                                        )}
                                        {task.状态 === '进行中' && task.惩罚描述 && (
                                            <p className="text-[10px] text-red-400">失败：{task.惩罚描述}</p>
                                        )}
                                        {task.状态 === '已完成' && task.评价 && (
                                            <p className="text-[10px] text-blue-400">评价：{task.评价}</p>
                                        )}

                                        {task.状态 === '待接受' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => onAcceptTask?.(task.id)}
                                                    className="flex-1 py-1.5 rounded text-xs bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                                                >
                                                    接受任务
                                                </button>
                                            </div>
                                        )}

                                        {task.状态 === '进行中' && (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 resize-none"
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
                                                        className="flex-1 py-1.5 rounded text-xs bg-green-600 hover:bg-green-500 text-white transition-colors"
                                                    >
                                                        报告完成
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onAbandonTask?.(task.id);
                                                            set展开任务ID(null);
                                                        }}
                                                        className="px-3 py-1.5 rounded text-xs bg-gray-600 hover:bg-gray-500 text-white transition-colors"
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

                {日常指令.length > 0 && (
                    <div className="px-3 pb-3">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2 px-1">日常指令</h4>
                        <div className="space-y-1.5">
                            {日常指令.map((指令, idx) => (
                                <div
                                    key={idx}
                                    className={`px-3 py-2 rounded-lg text-xs border ${
                                        指令.是否完成
                                            ? 'bg-green-900/20 border-green-700/30 text-gray-500 line-through'
                                            : 'bg-gray-800/40 border-gray-700/30 text-gray-300'
                                    }`}
                                >
                                    <span className="text-[10px] text-purple-400 mr-1.5">[{指令.分类}]</span>
                                    {指令.内容}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BDSMTaskPanel;
