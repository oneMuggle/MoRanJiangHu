// 写真约拍 NSFW 设置面板
// Phase 1 Step 5

import React from 'react';
import type { 写真NSFW设置, 玩法层类型, NSFW内容强度 } from '../../../models/photographyNSFW';
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

interface SliderOptionProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SliderOption: React.FC<SliderOptionProps> = ({ label, description, value, min, max, onChange, disabled = false }) => (
  <div className={`py-3 px-4 rounded-lg transition-colors ${disabled ? 'opacity-40' : 'hover:bg-white/5'}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex-1 mr-4">
        <label className={`text-sm font-serif ${disabled ? 'text-gray-600' : 'text-gray-200'}`}>{label}</label>
        {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
      </div>
      <span className="text-wuxia-gold text-sm font-mono">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-wuxia-gold"
    />
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

interface Props {
  settings: 写真NSFW设置;
  onChange: (settings: 写真NSFW设置) => void;
}

export const PhotographyNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof 写真NSFW设置>(key: K, value: 写真NSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用写真NSFW系统;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <ToggleSwitch
          label="启用写真约拍 NSFW 系统"
          description="写真约拍NSFW子系统，覆盖从正规商业写真到私房约拍的完整生命周期"
          checked={settings.启用写真NSFW系统}
          onChange={(v) => update('启用写真NSFW系统', v)}
        />
      </div>

      {!masterEnabled && (
        <div className="text-center text-gray-600 text-xs py-8 font-serif">
          开启主开关以配置写真约拍 NSFW 子系统
        </div>
      )}

      {masterEnabled && (
        <>
          {/* 基础设置 */}
          <SectionHeader title="基础设置" />
          <SelectOption
            label="NSFW 内容强度"
            description="微暗：暗示性描述 | 暧昧：适度描写，侧重心理 | 露骨：直接描写"
            value={settings.NSFW内容强度}
            options={['微暗', '暧昧', '露骨']}
            onChange={(v) => update('NSFW内容强度', v as NSFW内容强度)}
          />
          <SelectOption
            label="主要玩法层"
            description="经营管理：事业成长模拟 | 人际关系：社交模拟 | 灰色地带：道德博弈"
            value={settings.主要玩法层}
            options={['经营管理', '人际关系', '灰色地带']}
            onChange={(v) => update('主要玩法层', v as 玩法层类型)}
          />
          <SliderOption
            label="次要玩法权重"
            description="次要层的出现频率（0-100）"
            value={settings.次要玩法权重}
            min={0}
            max={100}
            onChange={(v) => update('次要玩法权重', v)}
          />

          {/* 灰色地带设置 */}
          <SectionHeader title="灰色地带层" />
          <ToggleSwitch
            label="启用道德选择"
            description="开启后玩家在关键节点面临主动决策（仅主要玩法层为灰色地带时可用）"
            checked={settings.启用道德选择}
            onChange={(v) => update('启用道德选择', v)}
            disabled={settings.主要玩法层 !== '灰色地带'}
          />
          <ToggleSwitch
            label="启用尺度递进"
            description="拍摄过程中尺度可能逐渐升级"
            checked={settings.启用尺度递进}
            onChange={(v) => update('启用尺度递进', v)}
          />
          <ToggleSwitch
            label="启用摄影师筛选"
            description="根据模特保护意识过滤不合适的摄影师"
            checked={settings.启用摄影师筛选}
            onChange={(v) => update('启用摄影师筛选', v)}
          />
          <ToggleSwitch
            label="启用越界识别"
            description="识别并记录摄影师的越界行为"
            checked={settings.启用越界识别}
            onChange={(v) => update('启用越界识别', v)}
          />

          {/* 安全与交付 */}
          <SectionHeader title="安全与交付" />
          <ToggleSwitch
            label="启用安全词系统"
            description="模特可使用安全词终止拍摄"
            checked={settings.启用安全词系统}
            onChange={(v) => update('启用安全词系统', v)}
          />
          <ToggleSwitch
            label="启用照片交付"
            description="照片交付流程和风险评估"
            checked={settings.启用照片交付}
            onChange={(v) => update('启用照片交付', v)}
          />

          {/* 泄露事件 */}
          <SectionHeader title="泄露事件" />
          <ToggleSwitch
            label="启用泄露事件"
            description="照片可能发生泄露并传播"
            checked={settings.启用泄露事件}
            onChange={(v) => update('启用泄露事件', v)}
          />
          <SelectOption
            label="泄露事件频率"
            description="低：风险70%以上才触发 | 中：50%以上 | 高：30%以上"
            value={settings.泄露事件频率}
            options={['低', '中', '高']}
            onChange={(v) => update('泄露事件频率', v as '低' | '中' | '高')}
            disabled={!settings.启用泄露事件}
          />
        </>
      )}
    </div>
  );
};

export default PhotographyNSFWSettings;
