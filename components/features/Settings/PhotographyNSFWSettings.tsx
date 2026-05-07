// 写真约拍 NSFW 设置面板
// 提供所有写真 NSFW 子系统的独立开关和强度控制

import React from 'react';
import type { 写真NSFW设置 } from '../../../models/photographyNSFW';
import { 默认写真NSFW设置 } from '../../../models/photographyNSFW';

export type { 写真NSFW设置 };
export { 默认写真NSFW设置 };

// ==================== 子组件 ====================

interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, checked, onChange, disabled = false }) => (
  <div className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}>
    <div className="flex-1 mr-4">
      <label className={`text-sm font-serif ${disabled ? 'text-gray-600' : 'text-gray-200'}`}>{label}</label>
      {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? 'bg-wuxia-gold/60' : 'bg-gray-700'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

interface SelectOptionProps {
  label: string;
  description?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({ label, description, value, options, onChange, disabled = false }) => (
  <div className={`flex items-center justify-between py-3 px-4 rounded-lg transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'}`}>
    <div className="flex-1 mr-4">
      <label className={`text-sm font-serif ${disabled ? 'text-gray-600' : 'text-gray-200'}`}>{label}</label>
      {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
    </div>
    <select
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-sm text-gray-200 disabled:cursor-not-allowed"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b border-white/5">
    <h3 className="text-wuxia-gold/70 font-serif font-bold text-sm tracking-[0.2em]">{title}</h3>
  </div>
);

// ==================== 主组件 ====================

interface PhotographyNSFWSettingsProps {
  settings: 写真NSFW设置;
  onChange: (s: 写真NSFW设置) => void;
}

const PhotographyNSFWSettings: React.FC<PhotographyNSFWSettingsProps> = ({ settings, onChange }) => {
  const set = <K extends keyof 写真NSFW设置>(key: K, value: 写真NSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const 禁用 = !settings.启用写真NSFW系统;

  return (
    <div className="space-y-2">
      <SectionHeader title="写真约拍 NSFW" />

      {/* 基础设置 */}
      <ToggleSwitch
        label="启用写真NSFW系统"
        description="写真约拍系统总开关（现代纪元）"
        checked={settings.启用写真NSFW系统}
        onChange={v => set('启用写真NSFW系统', v)}
      />
      <SelectOption
        label="NSFW内容强度"
        value={settings.NSFW内容强度}
        options={['微暗', '暧昧', '露骨']}
        onChange={v => set('NSFW内容强度', v as any)}
        disabled={禁用}
      />
      <SelectOption
        label="主要玩法层"
        value={settings.主要玩法层}
        options={['经营管理', '人际关系', '灰色地带']}
        onChange={v => set('主要玩法层', v as any)}
        disabled={禁用}
      />

      {/* 尺度递进 */}
      <SectionHeader title="尺度递进" />
      <ToggleSwitch
        label="启用尺度递进"
        checked={settings.启用尺度递进}
        onChange={v => set('启用尺度递进', v)}
        disabled={禁用}
      />
      <ToggleSwitch
        label="启用安全词系统"
        checked={settings.启用安全词系统}
        onChange={v => set('启用安全词系统', v)}
        disabled={禁用 || !settings.启用尺度递进}
      />

      {/* 越界识别 */}
      <SectionHeader title="越界识别" />
      <ToggleSwitch
        label="启用越界识别"
        checked={settings.启用越界识别}
        onChange={v => set('启用越界识别', v)}
        disabled={禁用}
      />
      <ToggleSwitch
        label="启用摄影师筛选"
        checked={settings.启用摄影师筛选}
        onChange={v => set('启用摄影师筛选', v)}
        disabled={禁用}
      />
      <ToggleSwitch
        label="启用道德选择"
        description="仅在灰色地带玩法层时生效"
        checked={settings.启用道德选择}
        onChange={v => set('启用道德选择', v)}
        disabled={禁用 || settings.主要玩法层 !== '灰色地带'}
      />

      {/* 泄露事件 */}
      <SectionHeader title="泄露事件" />
      <ToggleSwitch
        label="启用泄露事件"
        checked={settings.启用泄露事件}
        onChange={v => set('启用泄露事件', v)}
        disabled={禁用}
      />
      <ToggleSwitch
        label="启用照片交付"
        checked={settings.启用照片交付}
        onChange={v => set('启用照片交付', v)}
        disabled={禁用}
      />
      <SelectOption
        label="泄露事件频率"
        value={settings.泄露事件频率}
        options={['低', '中', '高']}
        onChange={v => set('泄露事件频率', v as any)}
        disabled={禁用 || !settings.启用泄露事件}
      />
    </div>
  );
};

export default PhotographyNSFWSettings;
