import type { NPC结构 } from '@/models/social';
import { 计算亲密度等级, 获取可触发互动选项 } from '@/models/intimacy';
import type { 亲密互动类型 } from '@/models/intimacy';

interface Props {
    npc: NPC结构;
    onSelect: (type: 亲密互动类型) => void;
    disabled?: boolean;
}

export default function IntimacyPanel({ npc, onSelect, disabled }: Props) {
    const level = 计算亲密度等级(npc.好感度);
    const options = 获取可触发互动选项(level);

    return (
        <div className="space-y-3 p-3">
            <div className="flex items-center gap-2 text-xs text-wuxia-gold/70">
                <span className="w-2 h-2 rounded bg-wuxia-gold/50 rotate-45" />
                亲密等级: {level}/5
            </div>
            <div className="grid grid-cols-2 gap-2">
                {options.map(opt => (
                    <button
                        key={opt.类型}
                        onClick={() => onSelect(opt.类型)}
                        disabled={disabled}
                        className="p-3 rounded-lg border border-wuxia-gold/40 bg-wuxia-gold/10 text-gray-200 hover:bg-wuxia-gold/20 hover:border-wuxia-gold transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="font-serif text-sm">{opt.名称}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{opt.描述}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}