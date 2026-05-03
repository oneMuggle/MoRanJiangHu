/**
 * ImageManager Constants
 * Extracted from ImageManagerModal.tsx for better maintainability
 */


import type {
    图片生成状态类型,
    NPC生图任务记录,
    场景生图任务记录,
    香闺秘档部位类型
} from '../../../../../types';

// ============ 状态样式 ============

export const 状态样式: Record<图片生成状态类型, string> = {
    success: 'border-emerald-700 text-emerald-300 bg-emerald-950/20',
    failed: 'border-red-700 text-red-300 bg-red-950/20',
    pending: 'border-amber-700 text-amber-300 bg-amber-950/20'
};

export const 状态文案: Record<图片生成状态类型, string> = {
    success: '成功',
    failed: '失败',
    pending: '生成中'
};

// ============ 队列状态样式 ============

export const 队列状态样式: Record<NPC生图任务记录['状态'], string> = {
    queued: 'border-slate-700 text-slate-300 bg-slate-950/40',
    running: 'border-sky-700 text-sky-300 bg-sky-950/30',
    success: 'border-emerald-700 text-emerald-300 bg-emerald-950/20',
    failed: 'border-red-700 text-red-300 bg-red-950/20'
};

export const 队列状态文案: Record<NPC生图任务记录['状态'], string> = {
    queued: '排队中',
    running: '生成中',
    success: '已完成',
    failed: '失败'
};

// ============ 来源文案 ============

export const 来源文案: Record<NPC生图任务记录['来源'], string> = {
    auto: '自动',
    manual: '手动',
    retry: '重试'
};

// ============ 生图阶段映射 ============

export const 生图阶段中文映射: Record<NonNullable<NPC生图任务记录['进度阶段']>, string> = {
    queued: '排队中',
    prompting: '词组转换中',
    generating: '生成图片中',
    saving: '保存结果中',
    success: '已完成',
    failed: '失败'
};

// ============ 按钮样式 ============

export const 标签按钮样式 = (active: boolean): string => `w-full text-left px-4 py-3 border-l-2 text-sm transition-colors flex items-center gap-3 ${
    active
        ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold text-shadow-glow font-bold'
        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
}`;

export const 次级按钮样式 = (danger = false): string => `inline-flex items-center justify-center gap-2 px-3 py-2 rounded border text-sm transition-all duration-300 ${
    danger
        ? 'border-red-900/50 bg-red-950/30 text-red-300 hover:border-red-700 hover:shadow-[0_0_10px_rgba(185,28,28,0.3)]'
        : 'border-wuxia-gold/30 bg-black/50 text-gray-300 hover:text-wuxia-gold hover:border-wuxia-gold/60 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]'
}`;

export const 主按钮样式 = (disabled: boolean): string => `inline-flex items-center justify-center gap-2 px-6 py-2 rounded border font-serif text-sm md:text-base transition-all duration-300 ${
    disabled
        ? 'border-gray-800 text-gray-600 bg-black/40 cursor-not-allowed'
        : 'border-wuxia-gold/50 bg-wuxia-gold/15 text-wuxia-gold text-shadow-glow hover:border-wuxia-gold hover:bg-wuxia-gold/25 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
}`;

// ============ 通用样式 ============

export const 卡片样式 = 'rounded border border-wuxia-gold/20 bg-black/40 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)]';
export const 小标题样式 = 'text-[10px] md:text-xs text-wuxia-gold/70 tracking-widest uppercase font-serif drop-shadow-md';
export const 摘要卡片样式 = 'rounded border border-wuxia-gold/20 bg-gradient-to-br from-black/60 to-black/30 p-3 h-[112px] overflow-hidden relative group hover:border-wuxia-gold/40 transition-colors shadow-inner';

