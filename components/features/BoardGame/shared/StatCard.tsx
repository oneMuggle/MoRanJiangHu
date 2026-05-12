import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = 'text-wuxia-gold', subtext }) => {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-black/30 border border-gray-700/30 hover:border-gray-500/50 transition-colors">
      {icon && <div className="text-xl">{icon}</div>}
      <div className={`text-xl font-mono font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-gray-500 text-center">{label}</div>
      {subtext && <div className="text-[9px] text-gray-600">{subtext}</div>}
    </div>
  );
};

export default StatCard;
