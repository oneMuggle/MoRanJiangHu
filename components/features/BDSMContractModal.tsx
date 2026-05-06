import React, { useCallback } from 'react';
import type { BDSM关系状态, 契约状态 } from '../../models/campusNSFW/sm';

interface Props {
    关系状态: BDSM关系状态;
    onClose: () => void;
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

const BDSMContractModal: React.FC<Props> = ({
    关系状态,
    onClose,
    onNegotiateContract,
    onDissolveContract,
}) => {
    const [展开条款, set展开条款] = React.useState(false);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    const 当前契约 = 关系状态.契约记录.length > 0
        ? 关系状态.契约记录[关系状态.契约记录.length - 1]
        : null;

    const 有效契约 = 当前契约 && 当前契约.状态 !== '未缔结' && 当前契约.状态 !== '已解除';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onKeyDown={handleKeyDown}
        >
            <div className="relative w-full max-w-xl max-h-[80vh] bg-gray-900 rounded-xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                    <h2 className="text-lg text-white font-semibold">契约管理</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
                        aria-label="关闭"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                    {/* 当前契约 */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">当前契约</h4>
                        {有效契约 ? (
                            <div className="bg-gray-800/60 rounded-lg border border-gray-700/30 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">{契约类型图标[当前契约.类型] || '📄'}</span>
                                    <span className="text-base text-white font-medium">{当前契约.类型}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${契约状态样式[当前契约.状态]}`}>
                                        {当前契约.状态}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">
                                    缔结于 {当前契约.缔结时间}
                                    {当前契约.违约次数 > 0 && ` · 违约 ${当前契约.违约次数} 次`}
                                </p>

                                <button
                                    onClick={() => set展开条款(!展开条款)}
                                    className="text-sm text-purple-400 hover:text-purple-300 mb-2"
                                >
                                    {展开条款 ? '收起' : '查看'}条款 ({当前契约.条款列表.length})
                                </button>
                                {展开条款 && 当前契约.条款列表.length > 0 && (
                                    <ul className="space-y-1.5 mb-3">
                                        {当前契约.条款列表.map((条款, idx) => (
                                            <li key={idx} className="text-sm text-gray-300 pl-3 border-l-2 border-purple-500/30">
                                                {条款}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {当前契约.信物描述 && (
                                    <p className="text-sm text-amber-400 mb-3">
                                        信物：{当前契约.信物描述}
                                    </p>
                                )}

                                <div className="pt-3 border-t border-gray-700/30">
                                    <p className="text-xs text-red-400">
                                        安全词：<span className="text-white">{关系状态.安全词}</span>
                                    </p>
                                    {关系状态.底线列表.length > 0 && (
                                        <div className="mt-1">
                                            <p className="text-xs text-gray-500">底线：</p>
                                            <ul className="text-xs text-gray-400 mt-1 space-y-0.5">
                                                {关系状态.底线列表.map((b, i) => (
                                                    <li key={i}>• {b}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-800/30 rounded-lg border border-gray-700/20 p-4 text-center">
                                <p className="text-base text-gray-500">尚未缔结契约</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {关系状态.阶段 === '初识'
                                        ? '需要先建立初步信任'
                                        : '关系阶段满足条件后可缔结契约'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 历史契约 */}
                    {关系状态.契约记录.length > 1 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">历史契约</h4>
                            <div className="space-y-2">
                                {关系状态.契约记录.slice(0, -1).reverse().map((契约, idx) => (
                                    <div key={idx} className="bg-gray-800/30 rounded px-4 py-2.5 flex items-center gap-2">
                                        <span className="text-base">{契约类型图标[契约.类型] || '📄'}</span>
                                        <span className="text-sm text-gray-400 flex-1">{契约.类型}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${契约状态样式[契约.状态]}`}>
                                            {契约.状态}
                                        </span>
                                        <span className="text-xs text-gray-600">{契约.缔结时间}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 里程碑 */}
                    {关系状态.里程碑.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">里程碑</h4>
                            <div className="space-y-1.5">
                                {关系状态.里程碑.slice(-8).reverse().map((m, idx) => (
                                    <div key={idx} className="flex gap-2 text-sm">
                                        <span className="text-xs text-gray-600 w-20 shrink-0">{m.时间}</span>
                                        <span className="text-gray-400">{m.描述}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-700/50 flex gap-2">
                    {有效契约 && (
                        <button
                            onClick={onDissolveContract}
                            className="flex-1 py-2 rounded-lg text-sm bg-red-900/50 border border-red-700/50 text-red-300 hover:bg-red-800/50 transition-colors"
                        >
                            解除契约
                        </button>
                    )}
                    {!有效契约 && 关系状态.阶段 !== '初识' && (
                        <button
                            onClick={onNegotiateContract}
                            className="w-full py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                        >
                            协商契约
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

export default BDSMContractModal;
