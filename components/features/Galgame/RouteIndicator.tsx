/**
 * RouteIndicator.tsx
 *
 * 显示当前 Galgame 路线名称、好感度等级、CG 收集进度。
 */

import React from 'react';
import type { AvgStateBridgeSnapshot } from '../../../hooks/useAvgStateBridge';

interface RouteIndicatorProps {
  snapshot: AvgStateBridgeSnapshot;
  /** 已解锁 CG 数量 */
  unlockedCgsCount?: number;
  /** 总 CG 数量 */
  totalCgs?: number;
  /** 显示位置 */
  position?: 'top' | 'bottom-right' | 'bottom-left';
}

const POSITION_CLASSES: Record<NonNullable<RouteIndicatorProps['position']>, string> = {
  top: 'absolute top-4 left-1/2 -translate-x-1/2 z-30',
  'bottom-right': 'absolute bottom-24 right-4 z-30',
  'bottom-left': 'absolute bottom-24 left-4 z-30',
};

const INTIMACY_COLORS: Record<string, { bg: string; dot: string; label: string }> = {
  '0': { bg: 'bg-gray-800/80', dot: 'bg-gray-600', label: 'text-gray-400' },
  '1': { bg: 'bg-blue-900/80', dot: 'bg-blue-400', label: 'text-blue-300' },
  '2': { bg: 'bg-green-900/80', dot: 'bg-green-400', label: 'text-green-300' },
  '3': { bg: 'bg-yellow-900/80', dot: 'bg-yellow-400', label: 'text-yellow-300' },
  '4': { bg: 'bg-orange-900/80', dot: 'bg-orange-400', label: 'text-orange-300' },
  '5': { bg: 'bg-pink-900/80', dot: 'bg-pink-400', label: 'text-pink-300' },
};

export const RouteIndicator: React.FC<RouteIndicatorProps> = ({
  snapshot,
  unlockedCgsCount = 0,
  totalCgs = 0,
  position = 'top',
}) => {
  if (!snapshot.activeRouteName) return null;

  const intimacyLevel = snapshot.intimacyLevel ?? 0;
  const colors = INTIMACY_COLORS[String(intimacyLevel)] ?? INTIMACY_COLORS['0'];
  const maxDots = 5;

  return (
    <div className={POSITION_CLASSES[position]}>
      <div
        className={`px-4 py-2 ${colors.bg} backdrop-blur-sm border border-wuxia-gold/30 rounded-lg shadow-lg`}
      >
        {/* 路线名 */}
        <div className="text-xs font-bold text-wuxia-gold/90 mb-1">
          {snapshot.activeRouteName}
        </div>

        {/* 好感度 + CG 进度 */}
        <div className="flex items-center gap-3">
          {/* 好感度圆点 */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: maxDots }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < intimacyLevel ? colors.dot : 'bg-gray-600/40'
                }`}
              />
            ))}
            {snapshot.intimacyLabel && (
              <span className={`ml-1 text-[10px] ${colors.label}`}>
                {snapshot.intimacyLabel}
              </span>
            )}
          </div>

          {/* CG 收集进度 */}
          {totalCgs > 0 && (
            <div className="text-[10px] text-gray-400">
              CG: {unlockedCgsCount}/{totalCgs}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
