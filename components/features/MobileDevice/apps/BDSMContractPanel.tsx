import React from 'react';
import type { BDSM关系状态, 契约状态 } from '../../../../models/campusNSFW/sm';

interface Props {
    关系状态: BDSM关系状态;
    onNegotiateContract?: () => void;
    onDissolveContract?: () => void;
}

const 契约类型图标: Record<string, string> = {
    '口头约定': '💬',
    '书面契约': '📜',
    '信物交换': '🎁',
};

const 契约状态样式: Record<契约状态, string> = {
    '未缔结': 'bg-gray-600/50 text-gray-400',
    '口头约定': 'bg-blue-600/50 text-blue-200',
    '书面契约': 'bg-purple-600/50 text-purple-200',
    '信物交换': 'bg-amber-600/50 text-amber-200',
    '已解除': 'bg-gray-700/50 text-gray-500',
    '已违约': 'bg-red-600/50 text-red-200',
};

const BDSMContractPanel: React.FC<Props> = ({ 关系状态, onNegotiateContract, onDissolveContract }) => {
    const [展开条款, set展开条款] = React.useState(false);

    const 当前契约 = 关系状态.契约记录.length > 0
        ? 关系状态.契约记录[关系状态.契约记录.length - 1]
        : null;

    const 有效契约 = 当前契约 && 当前契约.状态 !== '未缔结' && 当前契约.状态 !== '已解除';

    return (
        <div className="flex flex-col h-full bg-gray-900/50">
            <div className="px-4 py-3 border-b border-gray-700/50">
                <h3 className="font-semibold text-white text-sm">契约管理</h3>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">当前契约</h4>
                    {有效契约 ? (
                        <div className="bg-gray-800/60 rounded-lg border border-gray-700/30 p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{契约类型图标[当前契约.类型] || '📄'}</span>
                                <span className="text-sm text-white font-medium">{当前契约.类型}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${契约状态样式[当前契约.状态]}`}>
                                    {当前契约.状态}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-2">
                                缔结于 {当前契约.缔结时间}
                                {当前契约.违约次数 > 0 && ` · 违约 ${当前契约.违约次数} 次`}
                            </p>

                            <button
                                onClick={() => set展开条款(!展开条款)}
                                className="text-xs text-purple-400 hover:text-purple-300 mb-1"
                            >
                                {展开条款 ? '收起' : '查看'}条款 ({当前契约.条款列表.length})
                            </button>
                            {展开条款 && 当前契约.条款列表.length > 0 && (
                                <ul className="space-y-1 mb-2">
                                    {当前契约.条款列表.map((条款, idx) => (
                                        <li key={idx} className="text-xs text-gray-300 pl-3 border-l-2 border-purple-500/30">
                                            {条款}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {当前契约.信物描述 && (
                                <p className="text-xs text-amber-400 mt-1">
                                    信物：{当前契约.信物描述}
                                </p>
                            )}

                            <div className="mt-3 pt-2 border-t border-gray-700/30">
                                <p className="text-[10px] text-red-400">
                                    安全词：{关系状态.安全词}
                                </p>
                                {关系状态.底线列表.length > 0 && (
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        底线：{关系状态.底线列表.join('、')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/30 rounded-lg border border-gray-700/20 p-3 text-center">
                            <p className="text-sm text-gray-500">尚未缔结契约</p>
                            <p className="text-[10px] text-gray-600 mt-1">
                                {关系状态.阶段 === '初识'
                                    ? '需要先建立初步信任'
                                    : '关系阶段满足条件后可缔结契约'}
                            </p>
                        </div>
                    )}
                </div>

                {关系状态.契约记录.length > 1 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2">历史契约</h4>
                        <div className="space-y-1.5">
                            {关系状态.契约记录.slice(0, -1).reverse().map((契约, idx) => (
                                <div key={idx} className="bg-gray-800/30 rounded px-3 py-2 flex items-center gap-2">
                                    <span className="text-sm">{契约类型图标[契约.类型] || '📄'}</span>
                                    <span className="text-xs text-gray-400 flex-1">{契约.类型}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${契约状态样式[契约.状态]}`}>
                                        {契约.状态}
                                    </span>
                                    <span className="text-[10px] text-gray-600">{契约.缔结时间}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {关系状态.里程碑.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2">里程碑</h4>
                        <div className="space-y-1.5">
                            {关系状态.里程碑.slice(-5).reverse().map((m, idx) => (
                                <div key={idx} className="flex gap-2 text-xs">
                                    <span className="text-[10px] text-gray-600 w-16 shrink-0">{m.时间}</span>
                                    <span className="text-gray-400">{m.描述}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {有效契约 && (
                <div className="px-4 py-3 border-t border-gray-700/50 flex gap-2">
                    <button
                        onClick={onDissolveContract}
                        className="flex-1 py-2 rounded-lg text-xs bg-red-900/50 border border-red-700/50 text-red-300 hover:bg-red-800/50 transition-colors"
                    >
                        解除契约
                    </button>
                </div>
            )}
            {!有效契约 && 关系状态.阶段 !== '初识' && (
                <div className="px-4 py-3 border-t border-gray-700/50">
                    <button
                        onClick={onNegotiateContract}
                        className="w-full py-2 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                    >
                        协商契约
                    </button>
                </div>
            )}
        </div>
    );
};

export default BDSMContractPanel;
