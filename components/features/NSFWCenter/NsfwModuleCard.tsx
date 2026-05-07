// NSFW 模块卡片组件

import React from 'react';
import { NsfwToggleSwitch } from './NsfwSettingsForm';
import type { NsfwModuleUI } from './moduleRegistry';

interface Props {
  module: NsfwModuleUI;
  masterEnabled: boolean;
  onMasterToggle: (enabled: boolean) => void;
  onConfigure: () => void;
  onOpenDashboard?: () => void;
}

export const NsfwModuleCard: React.FC<Props> = ({
  module,
  masterEnabled,
  onMasterToggle,
  onConfigure,
  onOpenDashboard,
}) => (
  <div className={`rounded-xl border transition-all ${
    masterEnabled
      ? 'border-wuxia-gold/30 bg-wuxia-gold/5'
      : 'border-white/10 bg-white/5'
  }`}>
    {/* 卡片头部 */}
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-wuxia-gold/80 font-serif font-bold text-sm tracking-[0.15em]">
            {module.name}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
            {module.description}
          </p>
        </div>
        {/* 状态指示灯 */}
        <div className={`shrink-0 w-2 h-2 rounded-full mt-1 ${
          masterEnabled ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-gray-600'
        }`} />
      </div>
    </div>

    {/* 主开关 */}
    <div className="px-2">
      <NsfwToggleSwitch
        label="启用"
        checked={masterEnabled}
        onChange={onMasterToggle}
      />
    </div>

    {/* 操作按钮 */}
    <div className="px-4 pb-4 flex gap-2">
      <button
        type="button"
        onClick={onConfigure}
        className="flex-1 py-2 px-3 rounded-lg text-xs font-serif tracking-[0.1em] transition-colors border border-wuxia-gold/30 text-wuxia-gold/80 hover:bg-wuxia-gold/10 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={!masterEnabled}
      >
        配置
      </button>
      {onOpenDashboard && (
        <button
          type="button"
          onClick={onOpenDashboard}
          className="flex-1 py-2 px-3 rounded-lg text-xs font-serif tracking-[0.1em] transition-colors border border-white/10 text-gray-400 hover:bg-white/5"
        >
          {module.dashboardLabel}
        </button>
      )}
    </div>
  </div>
);

export default NsfwModuleCard;
