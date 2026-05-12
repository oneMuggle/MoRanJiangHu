import React from 'react';

interface RoundCounterProps {
  current: number;
  total: number;
  showProgressDots?: boolean;
}

const RoundCounter: React.FC<RoundCounterProps> = ({ current, total, showProgressDots = true }) => {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">
        <span className="text-gray-500">回合</span>
        <span className="text-wuxia-gold font-mono font-bold ml-1">{current}</span>
        <span className="text-gray-600">/{total}</span>
      </div>
      {showProgressDots && (
        <div className="flex items-center gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i < current
                  ? 'bg-wuxia-gold'
                  : i === current
                    ? 'bg-wuxia-gold/40 animate-pulse'
                    : 'bg-gray-600/40'
              }`}
            />
          ))}
        </div>
      )}
      <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full bg-wuxia-gold/60 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default RoundCounter;
