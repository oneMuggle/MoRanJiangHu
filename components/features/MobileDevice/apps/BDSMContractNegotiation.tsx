import React, { useState } from 'react';
import type { 契约类型 } from '../../../../models/campusNSFW/sm';

interface Props {
    npcName: string;
    当前阶段: string;
    服从度: number;
    onConfirm: (结果: { 契约类型: 契约类型; 条款: string[]; 安全词: string; 玩家底线: string[] }) => void;
    onCancel: () => void;
}

const 契约类型选项: { 值: 契约类型; 标签: string; 描述: string; 阶段要求: string }[] = [
    { 值: '口头约定', 标签: '口头约定', 描述: '轻量级的行为规范和称呼约定', 阶段要求: '试探+' },
    { 值: '书面契约', 标签: '书面契约', 描述: '正式的条款契约，包含权利义务和奖惩机制', 阶段要求: '确立+' },
    { 值: '信物交换', 标签: '信物交换', 描述: '以信物为象征的深层契约关系', 阶段要求: '固化' },
];

const 预设底线: string[] = [
    '不在公共场所造成可见痕迹',
    '不涉及第三方',
    '不使用真名或可识别信息',
    '不影响学业和正常生活',
    '不造成身体伤害',
    '随时可以使用安全词终止',
    '不拍摄或传播私密内容',
];

const BDSMContractNegotiation: React.FC<Props> = ({ npcName, 当前阶段, 服从度, onConfirm, onCancel }) => {
    const [契约类型, set契约类型] = useState<契约类型>('口头约定');
    const [条款, set条款] = useState<string[]>(['']);
    const [安全词, set安全词] = useState('月光');
    const [玩家底线, set玩家底线] = useState<string[]>([]);
    const [添加底线输入, set添加底线输入] = useState('');
    const [步骤, set步骤] = useState<'类型' | '条款' | '安全'>('类型');

    const 可用类型 = 契约类型选项.filter(opt => {
        if (opt.阶段要求 === '试探+') return ['试探', '确立', '深入', '固化'].includes(当前阶段);
        if (opt.阶段要求 === '确立+') return ['确立', '深入', '固化'].includes(当前阶段);
        if (opt.阶段要求 === '固化') return 当前阶段 === '固化';
        return true;
    });

    const 建议类型 = 可用类型[0]?.值 || '口头约定';

    const 添加条款 = () => set条款([...条款, '']);
    const 更新条款 = (i: number, v: string) => {
        const next = [...条款];
        next[i] = v;
        set条款(next);
    };
    const 删除条款 = (i: number) => set条款(条款.filter((_, idx) => idx !== i));

    const 添加底线 = () => {
        if (添加底线输入.trim() && !玩家底线.includes(添加底线输入.trim())) {
            set玩家底线([...玩家底线, 添加底线输入.trim()]);
            set添加底线输入('');
        }
    };
    const 移除底线 = (i: number) => set玩家底线(玩家底线.filter((_, idx) => idx !== i));
    const 切换预设底线 = (b: string) => {
        if (玩家底线.includes(b)) {
            set玩家底线(玩家底线.filter(x => x !== b));
        } else {
            set玩家底线([...玩家底线, b]);
        }
    };

    const 有效条款 = 条款.filter(t => t.trim());

    const handleConfirm = () => {
        if (有效条款.length === 0) return;
        onConfirm({ 契约类型, 条款: 有效条款, 安全词, 玩家底线 });
    };

    return (
        <div className="flex flex-col h-full bg-gray-900/50">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">契约协商 — {npcName}</h3>
                    <div className="flex gap-1 mt-0.5">
                        {['类型', '条款', '安全'].map((s, i) => (
                            <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${
                                ['类型', '条款', '安全'].indexOf(步骤) >= i
                                    ? 'bg-purple-500/30 text-purple-300'
                                    : 'bg-gray-700/30 text-gray-500'
                            }`}>{s}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {步骤 === '类型' && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 mb-3">选择契约类型</h4>
                        <p className="text-[10px] text-yellow-500 mb-3">建议：{可用类型[0]?.标签 || '暂无可用类型'}</p>
                        <div className="space-y-2">
                            {契约类型选项.map(opt => {
                                const 可用 = 可用类型.some(o => o.值 === opt.值);
                                const isSuggested = opt.值 === 建议类型;
                                return (
                                    <button
                                        key={opt.值}
                                        disabled={!可用}
                                        onClick={() => { set契约类型(opt.值); set步骤('条款'); }}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                                            !可用 ? 'opacity-40 cursor-not-allowed border-gray-700/20'
                                                : 契约类型 === opt.值
                                                    ? 'border-purple-500 bg-purple-500/10'
                                                    : 'border-gray-700/30 hover:border-gray-600/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-white font-medium">{opt.标签}</span>
                                            {!可用 && <span className="text-[10px] text-gray-500">需要 {opt.阶段要求}</span>}
                                            {isSuggested && 可用 && <span className="text-[10px] text-green-400">推荐</span>}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">{opt.描述}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {步骤 === '条款' && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 mb-3">
                            契约条款 — {契约类型}
                        </h4>
                        <div className="space-y-2 mb-3">
                            {条款.map((t, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                                        placeholder={`条款 ${i + 1}`}
                                        value={t}
                                        onChange={e => 更新条款(i, e.target.value)}
                                    />
                                    {条款.length > 1 && (
                                        <button
                                            onClick={() => 删除条款(i)}
                                            className="text-red-400 hover:text-red-300 px-2"
                                        >×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={添加条款}
                            className="text-xs text-purple-400 hover:text-purple-300 mb-4"
                        >+ 添加条款</button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => set步骤('类型')}
                                className="flex-1 py-2 rounded-lg text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                            >上一步</button>
                            <button
                                onClick={() => set步骤('安全')}
                                disabled={有效条款.length === 0}
                                className="flex-1 py-2 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >下一步</button>
                        </div>
                    </div>
                )}

                {步骤 === '安全' && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 mb-3">安全设置</h4>

                        <div className="mb-4">
                            <label className="text-xs text-gray-300 mb-1 block">安全词</label>
                            <input
                                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white"
                                value={安全词}
                                onChange={e => set安全词(e.target.value)}
                                placeholder="默认：月光"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">说出安全词将立即终止所有互动</p>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-gray-300 mb-1 block">你的底线</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                                    placeholder="添加自定义底线..."
                                    value={添加底线输入}
                                    onChange={e => set添加底线输入(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), 添加底线())}
                                />
                                <button
                                    onClick={添加底线}
                                    disabled={!添加底线输入.trim()}
                                    className="px-3 py-2 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
                                >添加</button>
                            </div>
                            {玩家底线.length > 0 && (
                                <div className="space-y-1 mb-2">
                                    {玩家底线.map((b, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                                            <span className="text-xs text-red-300 flex-1">{b}</span>
                                            <button onClick={() => 移除底线(i)} className="text-red-400 hover:text-red-300 text-xs">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-gray-400 mb-2 block">预设底线建议</label>
                            <div className="space-y-1">
                                {预设底线.map(b => (
                                    <button
                                        key={b}
                                        onClick={() => 切换预设底线(b)}
                                        className={`w-full text-left text-[11px] px-2 py-1.5 rounded border transition-all ${
                                            玩家底线.includes(b)
                                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                                : 'bg-gray-800/30 border-gray-700/20 text-gray-400 hover:border-gray-600/40'
                                        }`}
                                    >
                                        {玩家底线.includes(b) ? '✓ ' : '+ '}{b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => set步骤('条款')}
                                className="flex-1 py-2 rounded-lg text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                            >上一步</button>
                            <button
                                onClick={handleConfirm}
                                disabled={有效条款.length === 0}
                                className="flex-1 py-2 rounded-lg text-xs bg-green-600 hover:bg-green-500 text-white font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >确认协商</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BDSMContractNegotiation;
