// NSFW 模块详细设置弹窗

import React from 'react';
import type { NsfwModuleUI } from './moduleRegistry';

interface Props {
  module: NsfwModuleUI;
  settings: Record<string, unknown>;
  onChange: (settings: Record<string, unknown>) => void;
  onClose: () => void;
}

export const NsfwModuleSettingsModal: React.FC<Props> = ({
  module,
  settings,
  onChange,
  onClose,
}) => {
  const SettingsComponent = module.settingsComponent;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[85vh] bg-[#0b0b0c]/95 border border-wuxia-gold/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
        {/* 头部 */}
        <div className="shrink-0 px-6 py-4 border-b border-wuxia-gold/20 flex items-center justify-between">
          <div>
            <h2 className="text-wuxia-gold font-serif font-bold text-lg tracking-[0.2em]">
              {module.name} 设置
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">{module.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-700 bg-black/50 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
            title="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 设置内容 */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
          <React.Suspense fallback={
            <div className="flex min-h-[220px] items-center justify-center text-sm tracking-[0.2em] text-wuxia-gold/70">
              加载设置中…
            </div>
          }>
            {SettingsComponent && (
              <SettingsComponent settings={settings} onChange={onChange} />
            )}
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default NsfwModuleSettingsModal;
