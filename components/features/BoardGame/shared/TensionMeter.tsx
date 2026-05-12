import React from 'react';

interface TensionMeterProps {
  value: number;
  max?: number;
  label?: string;
  pulsing?: boolean;
}

const 紧张度颜色 = (value: number): string => {
  if (value >= 80) return 'from-purple-500 to-purple-600';
  if (value >= 60) return 'from-red-500 to-red-600';
  if (value >= 40) return 'from-yellow-500 to-yellow-600';
  return 'from-green-500 to-green-600';
};

const 紧张度标签 = (value: number): string => {
  if (value >= 80) return '极危';
  if (value >= 60) return '危险';
  if (value >= 40) return '紧张';
  return '平静';
};

const TensionMeter: React.FC<TensionMeterProps> = ({ value, max = 100, label = '紧张度', pulsing = true }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass = 紧张度颜色(value);
  const isCritical = value >= 80;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className={`font-mono font-bold ${isCritical ? 'text-purple-400' : 'text-gray-300'}`}>
          {value}/{max}
        </span>
      </div>
      <div className="relative h-3 bg-black/60 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-300 ${isCritical && pulsing ? 'animate-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right text-[10px] text-gray-500">{紧张度标签(value)}</div>
    </div>
  );
};

export default TensionMeter;
