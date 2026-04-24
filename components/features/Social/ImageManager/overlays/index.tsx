interface ImageViewerOverlayProps {
    src: string;
    alt: string;
    onClose: () => void;
}

/**
 * 图片全屏查看器 — 点击遮罩或关闭按钮退出
 */
export function ImageViewerOverlay({ src, alt, onClose }: ImageViewerOverlayProps) {
    return (
        <div
            className="absolute inset-0 z-[250] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-[92vw] max-h-[94vh] rounded-lg overflow-hidden border border-wuxia-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.16)]"
                onClick={(event) => event.stopPropagation()}
            >
                <img src={src} alt={alt} className="max-w-[92vw] max-h-[94vh] object-contain bg-black" />
                <button
                    type="button"
                    className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 border border-gray-700 text-gray-300"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

interface PromptDisplayOverlayProps {
    打开: boolean;
    生图词组?: string;
    最终正向提示词?: string;
    最终负向提示词?: string;
    错误信息?: string;
    onClose: () => void;
}

/**
 * 提示词详情弹窗 — 查看并复制生图词
 */
export function PromptDisplayOverlay({ 打开, 生图词组, 最终正向提示词, 最终负向提示词, 错误信息, onClose }: PromptDisplayOverlayProps) {
    if (!打开) return null;

    const 复制文本 = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div
                className="w-full max-w-2xl bg-[#0c0d0f] border border-fuchsia-500/30 rounded-xl shadow-[0_0_50px_rgba(217,70,239,0.15)] max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-fuchsia-500/20">
                    <div className="text-fuchsia-200 font-serif text-lg">提示词详情</div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {生图词组 && (
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-fuchsia-300">生图词组</div>
                            <div className="text-sm text-gray-300 bg-black/40 rounded p-3 font-mono whitespace-pre-wrap">{生图词组}</div>
                        </div>
                    )}
                    {最终正向提示词 && (
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-emerald-300 flex items-center justify-between">
                                <span>最终正向提示词</span>
                                <button
                                    type="button"
                                    onClick={() => 复制文本(最终正向提示词)}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                                >
                                    复制
                                </button>
                            </div>
                            <div className="text-sm text-gray-300 bg-black/40 rounded p-3 font-mono whitespace-pre-wrap">{最终正向提示词}</div>
                        </div>
                    )}
                    {最终负向提示词 && (
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-red-300 flex items-center justify-between">
                                <span>最终负向提示词</span>
                                <button
                                    type="button"
                                    onClick={() => 复制文本(最终负向提示词)}
                                    className="text-xs text-red-400 hover:text-red-300 underline"
                                >
                                    复制
                                </button>
                            </div>
                            <div className="text-sm text-gray-300 bg-black/40 rounded p-3 font-mono whitespace-pre-wrap">{最终负向提示词}</div>
                        </div>
                    )}
                    {错误信息 && (
                        <div className="space-y-2">
                            <div className="text-sm font-bold text-red-300">错误信息</div>
                            <div className="text-sm text-red-400 bg-red-950/20 rounded p-3">{错误信息}</div>
                        </div>
                    )}
                    {!生图词组 && !最终正向提示词 && (
                        <div className="text-center text-gray-500 py-8">提示词数据不可用</div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ManualConfirmOverlayProps {
    flowStage: 'confirm' | 'submitting';
    selectedNpcName?: string;
    composition: '头像' | '半身' | '立绘' | '自定义';
    customComposition: string;
    backgroundMode: boolean;
    extraRequirement: string;
    npcSummary: string;
    statusText: string;
    recentTask?: { 进度文本?: string; 进度阶段?: string; 状态?: string; 错误信息?: string };
    fallbackTask?: { 进度文本?: string; 进度阶段?: string; 状态?: string; 错误信息?: string };
    获取生图阶段中文: (stage?: string) => string;
    从任务状态推导阶段: (status?: string) => string;
    主按钮样式: (disabled?: boolean) => string;
    次级按钮样式: (danger?: boolean) => string;
    onCancelConfirm: () => void;
    onCancelSubmitting: () => void;
    onSubmitManual: () => void;
    canSubmit: boolean;
}

/**
 * 手动生图确认/提交弹层
 */
export function ManualConfirmOverlay({
    flowStage,
    selectedNpcName,
    composition,
    customComposition,
    backgroundMode,
    extraRequirement,
    npcSummary,
    statusText,
    recentTask,
    fallbackTask,
    获取生图阶段中文,
    从任务状态推导阶段,
    主按钮样式,
    次级按钮样式,
    onCancelConfirm,
    onCancelSubmitting,
    onSubmitManual,
    canSubmit,
}: ManualConfirmOverlayProps) {
    const compositionText = composition === '头像'
        ? '头像 (1024:1024)'
        : composition === '半身'
            ? '半身像 (3:4)'
            : composition === '立绘'
                ? '立绘'
                : (customComposition.trim() ? `自定义：${customComposition.trim()}` : '自定义构图');

    const activeTask = recentTask || fallbackTask;

    return (
        <div className="absolute inset-0 z-[240] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded border border-wuxia-gold/30 bg-[#0c0d0f]/95 shadow-[0_0_50px_rgba(212,175,55,0.15)] p-5 md:p-6 space-y-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_100%)] pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="text-wuxia-gold font-serif font-bold text-xl tracking-[0.15em] text-shadow-glow">
                        {flowStage === 'submitting' ? (backgroundMode ? '任务已提交（后台处理）' : '正在提交任务') : '确认生成图片'}
                    </div>
                    <div className="text-sm text-gray-400 mt-2 font-serif">
                        {flowStage === 'submitting'
                            ? (backgroundMode ? '任务已进入后台队列，可直接关闭当前提示。' : '系统正在提交任务，请稍候...')
                            : '请确认角色与生成参数无误。'}
                    </div>
                </div>

                <div className="relative z-10 rounded border border-wuxia-gold/20 bg-black/40 p-4 space-y-4 text-sm font-serif">
                    <div className="flex items-center justify-between gap-3 border-b border-wuxia-gold/10 pb-2">
                        <span className="text-wuxia-gold/60">目标角色</span>
                        <span className="text-wuxia-gold/90">{selectedNpcName || '未选择角色'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-wuxia-gold/10 pb-2">
                        <span className="text-wuxia-gold/60">构图</span>
                        <span className="text-gray-300">{compositionText}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-b border-wuxia-gold/10 pb-2">
                        <span className="text-wuxia-gold/60">处理模式</span>
                        <span className="text-gray-300">{backgroundMode ? '后台处理' : '前台等待'}</span>
                    </div>
                    <div className="space-y-2">
                        <div className="text-wuxia-gold/60">额外要求</div>
                        <div className="max-h-[84px] overflow-y-auto custom-scrollbar whitespace-pre-wrap break-words text-gray-300 rounded border border-wuxia-gold/10 bg-black/50 p-3 font-mono text-xs leading-relaxed">
                            {extraRequirement.trim() || '无'}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-wuxia-gold/60">角色资料</div>
                        <div className="max-h-[140px] overflow-y-auto custom-scrollbar whitespace-pre-wrap break-words text-gray-300 rounded border border-wuxia-gold/10 bg-black/50 p-3 text-xs leading-relaxed">
                            {npcSummary || '暂无资料'}
                        </div>
                    </div>
                </div>

                {flowStage === 'submitting' ? (
                    <div className="relative z-10 rounded border border-wuxia-gold/30 bg-wuxia-gold/5 p-4 space-y-3">
                        <div className="flex items-center gap-3 text-wuxia-gold/90">
                            <div className="w-5 h-5 rounded-full border-2 border-wuxia-gold border-t-transparent animate-spin" />
                            <div>
                                <div className="font-serif tracking-wider">{activeTask?.进度文本 || statusText || '正在提交任务或等待状态更新...'}</div>
                                <div className="text-[10px] text-wuxia-gold/60 mt-1 uppercase tracking-widest">当前阶段：{获取生图阶段中文(activeTask?.进度阶段 || 从任务状态推导阶段(activeTask?.状态))}</div>
                            </div>
                        </div>
                        {activeTask?.状态 === 'success' && (
                            <div className="rounded border border-emerald-900/50 bg-emerald-950/20 px-3 py-2 text-sm text-emerald-400 font-serif">
                                图片已生成并送到了图库。
                            </div>
                        )}
                        {activeTask?.状态 === 'failed' && (
                            <div className="rounded border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-400 whitespace-pre-wrap break-words font-serif">
                                {activeTask.错误信息 || '图片生成失败。'}
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onCancelSubmitting}
                                className={次级按钮样式()}
                            >
                                {backgroundMode ? '关闭提示' : '取消等待'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-wrap justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancelConfirm}
                            className={次级按钮样式()}
                        >
                            返回修改
                        </button>
                        <button
                            type="button"
                            onClick={onSubmitManual}
                            disabled={!canSubmit}
                            className={主按钮样式(!canSubmit)}
                        >
                            确认生成
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
