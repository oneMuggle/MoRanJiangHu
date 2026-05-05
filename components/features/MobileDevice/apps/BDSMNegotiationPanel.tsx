import React, { useState } from 'react';
import type { 见面地点 } from '../../../../models/campusPhone';

const 见面地点选项: { value: 见面地点; icon: string; desc: string }[] = [
    { value: '咖啡厅', icon: '☕', desc: '安静的角落，适合初次见面' },
    { value: '图书馆花园', icon: '🌿', desc: '开放空间，有人经过但不易被打扰' },
    { value: '废弃教室', icon: '🏫', desc: '隐蔽，适合深入交流' },
    { value: '天台', icon: '🌃', desc: '高处独处，风景好但可能有风' },
    { value: '操场角落', icon: '🏟️', desc: '运动场边缘，偶尔有人经过' },
    { value: '宿舍', icon: '🏠', desc: '最私密，风险也最高' },
];

interface BDSMNegotiationPanelProps {
    npcName: string;
    默认安全词?: string;
    onConfirm: (协商结果: {
        npcName: string;
        见面回合偏移: number;
        见面地点: 见面地点;
        安全词: string;
        玩家底线: string[];
    }) => void;
    onCancel: () => void;
}

const BDSMNegotiationPanel: React.FC<BDSMNegotiationPanelProps> = ({
    npcName,
    默认安全词 = '月光',
    onConfirm,
    onCancel,
}) => {
    const [回合偏移, set回合偏移] = useState(1);
    const [地点, set地点] = useState<见面地点>('咖啡厅');
    const [安全词, set安全词] = useState(默认安全词);
    const [底线, set底线] = useState<string[]>(['']);
    const [error, setError] = useState<string | null>(null);

    const add底线 = () => {
        if (底线.length >= 5) return;
        set底线(prev => [...prev, '']);
    };

    const update底线 = (idx: number, val: string) => {
        set底线(prev => prev.map((v, i) => i === idx ? val : v));
    };

    const remove底线 = (idx: number) => {
        set底线(prev => prev.filter((_, i) => i !== idx));
    };

    const handleConfirm = () => {
        if (!安全词.trim()) {
            setError('安全词不能为空');
            return;
        }
        if (安全词.length < 2) {
            setError('安全词至少 2 个字符');
            return;
        }
        const 有效底线 = 底线.map(b => b.trim()).filter(Boolean);
        onConfirm({
            npcName,
            见面回合偏移: 回合偏移,
            见面地点: 地点,
            安全词: 安全词.trim(),
            玩家底线: 有效底线,
        });
    };

    return (
        <div className="flex flex-col h-full bg-gray-900/95 text-gray-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50 shrink-0">
                <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">&larr;</button>
                <h3 className="font-semibold text-white text-sm flex-1">协商见面 — {npcName}</h3>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
                {/* Safety Word */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">安全词 <span className="text-red-400">*</span></label>
                    <input
                        type="text"
                        value={安全词}
                        onChange={e => { set安全词(e.target.value); setError(null); }}
                        placeholder="例如：月光"
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">说出安全词即表示立即停止当前互动</p>
                </div>

                {/* Meeting Time */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">见面时间</label>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{回合偏移} 回合后</span>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={回合偏移}
                            onChange={e => set回合偏移(Number(e.target.value))}
                            className="flex-1 accent-purple-600"
                        />
                        <span className="text-xs text-purple-400 font-mono w-8 text-right">{回合偏移}</span>
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-xs text-gray-400 mb-2">见面地点</label>
                    <div className="grid grid-cols-2 gap-2">
                        {见面地点选项.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => set地点(opt.value)}
                                className={`p-2 rounded-lg border text-left transition-all ${
                                    地点 === opt.value
                                        ? 'border-purple-500 bg-purple-900/30'
                                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
                                }`}
                            >
                                <span className="text-lg">{opt.icon}</span>
                                <div className="text-xs text-white mt-0.5">{opt.value}</div>
                                <div className="text-[10px] text-gray-500">{opt.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Boundaries */}
                <div>
                    <label className="block text-xs text-gray-400 mb-1">你的底线（可选）</label>
                    {底线.map((b, idx) => (
                        <div key={idx} className="flex gap-2 mb-1.5">
                            <input
                                type="text"
                                value={b}
                                onChange={e => update底线(idx, e.target.value)}
                                placeholder={`底线 ${idx + 1}`}
                                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                            />
                            {底线.length > 1 && (
                                <button onClick={() => remove底线(idx)} className="text-gray-500 hover:text-red-400 px-1">✕</button>
                            )}
                        </div>
                    ))}
                    {底线.length < 5 && (
                        <button onClick={add底线} className="text-xs text-purple-400 hover:text-purple-300">+ 添加底线</button>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2">{error}</div>
                )}
            </div>

            {/* Confirm Button */}
            <div className="p-4 border-t border-gray-700/50 shrink-0">
                <button
                    onClick={handleConfirm}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-700 to-pink-700 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                    发送见面邀请
                </button>
            </div>
        </div>
    );
};

export default BDSMNegotiationPanel;
