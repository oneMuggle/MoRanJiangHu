/**
 * ChoiceDialog.tsx — 桌游选择对话框
 */

import React from 'react';

export interface ChoiceOption {
  id: string;
  label: string;
  risk: 'low' | 'medium' | 'high';
  consequence: string;
  disabled?: boolean;
}

interface ChoiceDialogProps {
  title: string;
  description?: string;
  options: ChoiceOption[];
  onSelect: (optionId: string) => void;
  onClose?: () => void;
}

const riskColors: Record<ChoiceOption['risk'], string> = {
  low: 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10',
  medium: 'border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10',
  high: 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10',
};

const riskLabels: Record<ChoiceOption['risk'], string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

const riskLabelColors: Record<ChoiceOption['risk'], string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export const ChoiceDialog: React.FC<ChoiceDialogProps> = ({ title, description, options, onSelect, onClose }) => {
  return (
    <div className="bg-black/40 border border-gray-700/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-serif text-wuxia-gold/70">{title}</h4>
        {onClose && (
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">&times;</button>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}

      <div className="grid grid-cols-1 gap-2">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            disabled={opt.disabled}
            onClick={() => onSelect(opt.id)}
            className={`
              p-3 rounded-lg border text-left transition-all
              ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}
              ${riskColors[opt.risk]}
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-200">{opt.label}</span>
              <span className={`text-[10px] font-medium ${riskLabelColors[opt.risk]}`}>{riskLabels[opt.risk]}</span>
            </div>
            <div className="text-xs text-gray-500">{opt.consequence}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChoiceDialog;
