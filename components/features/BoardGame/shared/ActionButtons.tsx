/**
 * ActionButtons.tsx — 桌游操作按钮组
 */

import React from 'react';

export interface ActionButtonDef {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  onClick: () => void;
}

interface ActionButtonsProps {
  buttons: ActionButtonDef[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

const variantStyles: Record<NonNullable<ActionButtonDef['variant']>, string> = {
  primary: 'bg-wuxia-gold/80 hover:bg-wuxia-gold text-ink-black font-semibold',
  secondary: 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200',
  danger: 'bg-red-600/60 hover:bg-red-500/60 text-white',
  warning: 'bg-yellow-600/60 hover:bg-yellow-500/60 text-white',
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({ buttons, layout = 'horizontal', className = '' }) => {
  const layoutClass = {
    horizontal: 'flex gap-2',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2',
  }[layout];

  return (
    <div className={`${layoutClass} ${className}`}>
      {buttons.map(btn => (
        <button
          key={btn.id}
          type="button"
          disabled={btn.disabled || btn.loading}
          onClick={btn.onClick}
          className={`
            px-4 py-2.5 rounded-lg text-sm font-medium transition-all
            ${btn.disabled || btn.loading ? 'opacity-50 cursor-not-allowed' : ''}
            ${variantStyles[btn.variant ?? 'secondary']}
          `}
        >
          {btn.loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {btn.label}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              {btn.icon && <span>{btn.icon}</span>}
              {btn.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
