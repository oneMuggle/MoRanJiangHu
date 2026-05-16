/**
 * EndingNotification.tsx
 *
 * 结局达成时全屏提示。在 GalgameView 中叠加渲染。
 */

import React, { useEffect, useState } from 'react';
import type { EndingJudgment } from '../../../models/avg/galgame';

export interface EndingNotificationProps {
  /** 结局信息（null 表示无结局） */
  ending: EndingJudgment | null;
  /** 路线名称 */
  routeName?: string;
  /** 动画完成后回调 */
  onDismiss?: () => void;
}

const ENDING_TYPE_LABELS: Record<string, string> = {
  good: '好结局',
  normal: '普通结局',
  bad: '坏结局',
  true: '真结局',
  secret: '隐藏结局',
};

const ENDING_TYPE_COLORS: Record<string, { border: string; text: string; bg: string; glow: string }> = {
  good: {
    border: 'border-emerald-400/60',
    text: 'text-emerald-300',
    bg: 'from-emerald-950/80',
    glow: 'shadow-[0_0_80px_rgba(16,185,129,0.3)]',
  },
  normal: {
    border: 'border-gray-400/60',
    text: 'text-gray-300',
    bg: 'from-gray-950/80',
    glow: 'shadow-[0_0_80px_rgba(156,163,175,0.3)]',
  },
  bad: {
    border: 'border-red-400/60',
    text: 'text-red-300',
    bg: 'from-red-950/80',
    glow: 'shadow-[0_0_80px_rgba(239,68,68,0.3)]',
  },
  true: {
    border: 'border-wuxia-gold/60',
    text: 'text-wuxia-gold',
    bg: 'from-amber-950/80',
    glow: 'shadow-[0_0_80px_rgba(212,175,55,0.4)]',
  },
  secret: {
    border: 'border-purple-400/60',
    text: 'text-purple-300',
    bg: 'from-purple-950/80',
    glow: 'shadow-[0_0_80px_rgba(168,85,247,0.3)]',
  },
};

export const EndingNotification: React.FC<EndingNotificationProps> = ({
  ending,
  routeName,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (ending?.resolved) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, [ending]);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 800);
    }, 5000);

    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!ending || !ending.ending || !visible) return null;

  const { endingType, title, description } = ending.ending;
  const colors = ENDING_TYPE_COLORS[endingType] || ENDING_TYPE_COLORS.normal;
  const label = ENDING_TYPE_LABELS[endingType] || endingType;

  return (
    <div className={`fixed inset-0 z-[300] flex items-center justify-center transition-opacity duration-800 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className={`relative z-10 mx-4 max-w-lg w-full bg-gradient-to-b ${colors.bg} to-black/95 border ${colors.border} rounded-2xl p-8 text-center shadow-2xl ${colors.glow} animate-fadeIn`}>
        <div className={`inline-block px-4 py-1 border ${colors.border} rounded-full text-xs ${colors.text} tracking-[0.3em] mb-6`}>
          {label}
        </div>

        {routeName && (
          <div className="text-gray-400 text-sm tracking-widest font-serif mb-2">
            {routeName}
          </div>
        )}

        <h2 className={`text-3xl font-serif font-bold ${colors.text} tracking-[0.2em] drop-shadow-lg mb-4`}>
          {title}
        </h2>

        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
          {description}
        </p>

        <div className={`w-24 h-px bg-gradient-to-r from-transparent ${colors.text} to-transparent mx-auto`} />
      </div>
    </div>
  );
};
