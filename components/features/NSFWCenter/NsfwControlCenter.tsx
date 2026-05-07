// NSFW 控制中心主面板

import React, { useState } from 'react';
import { 获取NSFW模块列表, type NsfwModuleUI } from './moduleRegistry';
import { NsfwModuleCard } from './NsfwModuleCard';
import { NsfwModuleSettingsModal } from './NsfwModuleSettingsModal';

interface Props {
  gameConfig: Record<string, unknown>;
  onSaveGame: (config: Record<string, unknown>) => void;
  onClose: () => void;
  onOpenDashboard?: (moduleId: string) => void;
}

export const NsfwControlCenter: React.FC<Props> = ({
  gameConfig,
  onSaveGame,
  onClose,
  onOpenDashboard,
}) => {
  const nsfwModules = 获取NSFW模块列表();
  const [configuringModule, setConfiguringModule] = useState<NsfwModuleUI | null>(null);

  const updateMasterToggle = (module: NsfwModuleUI, enabled: boolean) => {
    onSaveGame({ ...gameConfig, [module.masterToggleKey]: enabled });
  };

  const getModuleSettings = (module: NsfwModuleUI): Record<string, unknown> => {
    const configKey = getSettingsKey(module);
    return (gameConfig[configKey] as Record<string, unknown>) ?? module.defaultSettings;
  };

  const updateModuleSettings = (module: NsfwModuleUI, settings: Record<string, unknown>) => {
    const configKey = getSettingsKey(module);
    onSaveGame({ ...gameConfig, [configKey]: settings });
  };

  const enabledCount = nsfwModules.filter(m =>
    gameConfig[m.masterToggleKey] === true
  ).length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#0b0b0c]/95 border border-wuxia-gold/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
        {/* 头部 */}
        <div className="shrink-0 px-6 py-5 border-b border-wuxia-gold/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-wuxia-gold font-serif font-bold text-xl tracking-[0.28em]">
                NSFW 管理中心
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {enabledCount}/{nsfwModules.length} 个模块已启用
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  nsfwModules.forEach(m => {
                    if (gameConfig[m.masterToggleKey] !== true) {
                      onSaveGame({ ...gameConfig, [m.masterToggleKey]: true });
                    }
                  });
                }}
                className="py-2 px-4 rounded-lg text-xs font-serif tracking-[0.1em] border border-wuxia-gold/30 text-wuxia-gold/80 hover:bg-wuxia-gold/10 transition-colors"
              >
                全部启用
              </button>
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
          </div>
        </div>

        {/* 模块网格 */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nsfwModules.map(mod => (
              <NsfwModuleCard
                key={mod.id}
                module={mod}
                masterEnabled={gameConfig[mod.masterToggleKey] === true}
                onMasterToggle={(v) => updateMasterToggle(mod, v)}
                onConfigure={() => setConfiguringModule(mod)}
                onOpenDashboard={onOpenDashboard ? () => onOpenDashboard(mod.id) : undefined}
              />
            ))}
          </div>

          {nsfwModules.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-16 font-serif">
              当前时代没有 NSFW 模块
            </div>
          )}
        </div>
      </div>

      {/* 配置弹窗 */}
      {configuringModule && (
        <NsfwModuleSettingsModal
          module={configuringModule}
          settings={getModuleSettings(configuringModule)}
          onChange={(s) => updateModuleSettings(configuringModule, s)}
          onClose={() => setConfiguringModule(null)}
        />
      )}
    </div>
  );
};

function getSettingsKey(module: NsfwModuleUI): string {
  // 从 masterToggleKey 推导设置键名
  // "启用校园NSFW深化系统" → "校园NSFW设置"
  // "启用都市网约车NSFW系统" → "都市网约车NSFW设置"
  // "启用写真NSFW系统" → "写真NSFW设置"
  const key = module.masterToggleKey;
  if (key.startsWith('启用') && key.endsWith('系统')) {
    const inner = key.slice(2, -2);
    if (inner.endsWith('深化')) {
      return inner.slice(0, -2) + '设置';
    }
    return inner + '设置';
  }
  return module.id + 'Settings';
}

export default NsfwControlCenter;
