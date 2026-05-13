/**
 * DialogueBacklog.tsx
 *
 * Galgame 风格的对话记录回顾面板：全屏遮罩 + 时间线列表。
 * 移动端底部抽屉，桌面端居中弹窗。
 */

import React, { useEffect, useRef, useCallback } from 'react';
import type { AggregatedLogEntry } from '../../../hooks/useGame/ui/useAggregatedDialogue';

export interface DialogueBacklogProps {
  entries: AggregatedLogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const DialogueBacklog: React.FC<DialogueBacklogProps> = ({
  entries,
  isOpen,
  onClose,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 打开时自动滚动到底部
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
      });
    }
  }, [isOpen, entries.length]);

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="对话记录"
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* 面板 */}
      <div
        className="relative w-full md:max-w-2xl rounded-t-xl md:rounded-xl
                   bg-[#0d0f14]/95 border border-wuxia-gold/20
                   h-[85vh] md:h-[70vh] flex flex-col overflow-hidden
                   shadow-[0_-8px_40px_rgba(0,0,0,0.6)]"
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-wuxia-gold/15 shrink-0 bg-ink-black/60">
          <h2 className="text-wuxia-gold font-serif font-bold text-lg tracking-wider">对话记录</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-wuxia-gold transition-colors p-1.5 rounded-full hover:bg-white/5"
            aria-label="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 滚动列表 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {entries.length === 0 && (
            <div className="text-center text-gray-500 py-12 text-sm">暂无对话记录</div>
          )}
          {entries.map((entry, idx) => (
            <div
              key={`${entry.turnIndex}-${entry.isUserMessage}-${idx}`}
              className={`flex flex-col ${entry.isUserMessage ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    entry.isUserMessage
                      ? 'bg-sky-900/50 text-sky-300'
                      : entry.isNarrator
                      ? 'bg-gray-700/40 text-gray-400 italic'
                      : 'bg-wuxia-gold/15 text-wuxia-gold/80'
                  }`}
                >
                  {entry.sender}
                </span>
                <span className="text-[10px] text-gray-600">
                  第{entry.turnIndex + 1}回合
                </span>
              </div>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  entry.isUserMessage
                    ? 'bg-sky-900/30 text-sky-100/90 rounded-br-sm'
                    : entry.isNarrator
                    ? 'bg-gray-800/40 text-gray-300/90 italic border-l-2 border-gray-600/60'
                    : 'bg-gray-800/50 text-gray-100/90 border-l-2 border-wuxia-gold/30'
                }`}
              >
                {entry.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
