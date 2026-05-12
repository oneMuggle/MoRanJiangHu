/**
 * StatusBadge.tsx — 桌游状态徽章
 */

import React from 'react';

interface StatusBadgeProps {
  status: 'running' | 'paused' | 'ended';
  pauseReason?: string;
}

const statusConfig: Record<StatusBadgeProps['status'], { label: string; color: string; pulse: boolean }> = {
  running: { label: '进行中', color: 'bg-green-500/20 text-green-400 border-green-500/30', pulse: false },
  paused: { label: '已暂停', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', pulse: true },
  ended: { label: '已结束', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', pulse: false },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pauseReason }) => {
  const config = statusConfig[status];
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'running' ? 'bg-green-400' : status === 'paused' ? 'bg-yellow-400' : 'bg-gray-400'}`} />
      <span>{config.label}</span>
      {status === 'paused' && pauseReason && (
        <span className="text-gray-500 text-[10px]">({pauseReason})</span>
      )}
    </div>
  );
};

export default StatusBadge;
