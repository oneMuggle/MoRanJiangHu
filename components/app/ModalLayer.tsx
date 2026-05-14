/**
 * ModalLayer.tsx
 *
 * 全局装饰层（金色边框框架）。
 * 所有弹窗已由 ModalRenderer 渲染。
 */

export function ModalLayer() {
    return (
        <>
            {/* Global Golden Border Frame */}
            <div className="pointer-events-none fixed inset-2 md:inset-3 z-[100] border-[3px] md:border-4 border-double border-wuxia-gold/40 rounded-xl md:rounded-2xl shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                {/* Corner Ornaments */}
                <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t-[3px] md:border-t-4 border-l-[3px] md:border-l-4 border-wuxia-gold rounded-tl-lg md:rounded-tl-xl shadow-[-2px_-2px_5px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute top-0 right-0 w-6 h-6 md:w-8 md:h-8 border-t-[3px] md:border-t-4 border-r-[3px] md:border-r-4 border-wuxia-gold rounded-tr-lg md:rounded-tr-xl shadow-[2px_-2px_5px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 md:w-8 md:h-8 border-b-[3px] md:border-b-4 border-l-[3px] md:border-l-4 border-wuxia-gold rounded-bl-lg md:rounded-bl-xl shadow-[-2px_2px_5px_rgba(0,0,0,0.5)]"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b-[3px] md:border-b-4 border-r-[3px] md:border-r-4 border-wuxia-gold rounded-br-lg md:rounded-br-xl shadow-[2px_2px_5px_rgba(0,0,0,0.5)]"></div>

                {/* Mid-point Accents */}
                <div className="absolute top-1/2 left-0 w-1 h-12 -translate-y-1/2 bg-wuxia-gold/60"></div>
                <div className="absolute top-1/2 right-0 w-1 h-12 -translate-y-1/2 bg-wuxia-gold/60"></div>
            </div>
        </>
    );
}
