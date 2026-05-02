import { useState } from 'react';

interface SectionCollapseProps {
    title: React.ReactNode;
    subtitle?: string;
    count?: number;
    defaultOpen?: boolean;
    headerExtra?: React.ReactNode;
    children: React.ReactNode;
}

export const SectionCollapse: React.FC<SectionCollapseProps> = ({
    title,
    subtitle,
    count,
    defaultOpen = false,
    headerExtra,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="rounded-2xl border border-gray-800 bg-black/20 overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-3 md:px-5 md:py-4 hover:bg-white/5 transition-colors text-left min-h-[44px]"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <svg
                        className={`w-4 h-4 text-wuxia-gold/70 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="min-w-0">
                        <div className="text-sm font-serif font-bold text-wuxia-gold">{title}</div>
                        {subtitle && <div className="text-[11px] text-gray-500 truncate">{subtitle}</div>}
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    {count !== undefined && (
                        <span className="text-[11px] text-gray-400 font-mono">{count} 项</span>
                    )}
                    {headerExtra}
                </div>
            </button>
            <div
                className={`transition-all duration-300 ${isOpen ? 'max-h-[8000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-3 pb-3 md:px-5 md:pb-5 max-h-[60vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar">{children}</div>
            </div>
        </div>
    );
};
