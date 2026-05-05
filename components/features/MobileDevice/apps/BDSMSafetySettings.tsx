import React, { useState } from 'react';
import type { BDSM关系状态 } from '../../../../models/campusNSFW/sm';

interface Props {
    关系状态: BDSM关系状态;
    npcName: string;
    onSave: (安全词: string, 底线: string[]) => void;
    onCancel: () => void;
}

const 预设底线: string[] = [
    '不在公共场所造成可见痕迹',
    '不涉及第三方',
    '不使用真名或可识别信息',
    '不影响学业和正常生活',
    '不造成身体伤害',
    '随时可以使用安全词终止',
    '不拍摄或传播私密内容',
];

const BDSMSafetySettings: React.FC<Props> = ({ 关系状态, npcName, onSave, onCancel }) => {
    const [安全词, set安全词] = useState(关系状态.安全词 || '月光');
    const [底线, set底线] = useState<string[]>([...(关系状态.底线列表 || [])]);
    const [新底线, set新底线] = useState('');

    const 添加底线 = () => {
        if (新底线.trim() && !底线.includes(新底线.trim())) {
            set底线([...底线, 新底线.trim()]);
            set新底线('');
        }
    };
    const 移除底线 = (i: number) => set底线(底线.filter((_, idx) => idx !== i));
    const 切换预设底线 = (b: string) => {
        if (底线.includes(b)) {
            set底线(底线.filter(x => x !== b));
        } else {
            set底线([...底线, b]);
        }
    };

    const handleSave = () => {
        onSave(安全词, 底线);
    };

    return (
        <div className="flex flex-col h-full bg-gray-900/50">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
                <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white text-sm flex-1 truncate">安全设置 — {npcName}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">安全词</h4>
                    <input
                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white"
                        value={安全词}
                        onChange={e => set安全词(e.target.value)}
                        placeholder="例如：月光"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">说出安全词将立即终止所有互动，这是 SSC/RACK 原则的核心保障</p>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">已设置的底线</h4>
                    {底线.length === 0 ? (
                        <p className="text-xs text-gray-600">暂未设置底线</p>
                    ) : (
                        <div className="space-y-1 mb-3">
                            {底线.map((b, i) => (
                                <div key={i} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                                    <span className="text-xs text-red-300 flex-1">{b}</span>
                                    <button onClick={() => 移除底线(i)} className="text-red-400 hover:text-red-300 text-xs">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500"
                            placeholder="添加自定义底线..."
                            value={新底线}
                            onChange={e => set新底线(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), 添加底线())}
                        />
                        <button
                            onClick={添加底线}
                            disabled={!新底线.trim()}
                            className="px-3 py-2 rounded-lg text-xs bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40"
                        >添加</button>
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">预设底线建议（基于 SSC/RACK 原则）</h4>
                    <div className="space-y-1">
                        {预设底线.map(b => (
                            <button
                                key={b}
                                onClick={() => 切换预设底线(b)}
                                className={`w-full text-left text-[11px] px-2 py-1.5 rounded border transition-all ${
                                    底线.includes(b)
                                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                        : 'bg-gray-800/30 border-gray-700/20 text-gray-400 hover:border-gray-600/40'
                                }`}
                            >
                                {底线.includes(b) ? '✓ ' : '+ '}{b}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/20">
                    <h5 className="text-xs font-semibold text-gray-300 mb-1">SSC 原则</h5>
                    <p className="text-[10px] text-gray-500">Safe（安全）、Sane（理智）、Consensual（知情同意）</p>
                    <h5 className="text-xs font-semibold text-gray-300 mb-1 mt-2">RACK 原则</h5>
                    <p className="text-[10px] text-gray-500">Risk-Aware Consensual Kink（风险知情的同意癖好）</p>
                </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-700/50 flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2 rounded-lg text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                >取消</button>
                <button
                    onClick={handleSave}
                    className="flex-1 py-2 rounded-lg text-xs bg-green-600 hover:bg-green-500 text-white font-medium transition-colors"
                >保存</button>
            </div>
        </div>
    );
};

export default BDSMSafetySettings;
