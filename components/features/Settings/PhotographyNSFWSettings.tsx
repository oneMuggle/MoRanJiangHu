// 写真约拍 NSFW 设置面板
// 提供所有写真 NSFW 子系统的独立开关和强度控制

import React from 'react';
import type { 写真NSFW设置 } from '../../../models/photographyNSFW';
import { 默认写真NSFW设置 } from '../../../models/photographyNSFW';
import { NsfwToggleSwitch, NsfwSelectOption, NsfwSectionHeader } from '../NSFWCenter/NsfwSettingsForm';

export type { 写真NSFW设置 };
export { 默认写真NSFW设置 };

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
      <NsfwSectionHeader title="写真约拍 NSFW" />

      {/* 基础设置 */}
      <NsfwToggleSwitch
        label="启用写真NSFW系统"
        description="写真约拍系统总开关（现代纪元）"
        checked={settings.启用写真NSFW系统}
        onChange={v => set('启用写真NSFW系统', v)}
      />
      <NsfwSelectOption
        label="NSFW内容强度"
        value={settings.NSFW内容强度}
        options={['微暗', '暧昧', '露骨']}
        onChange={v => set('NSFW内容强度', v as any)}
        disabled={禁用}
      />
      <NsfwSelectOption
        label="主要玩法层"
        value={settings.主要玩法层}
        options={['经营管理', '人际关系', '灰色地带']}
        onChange={v => set('主要玩法层', v as any)}
        disabled={禁用}
      />

      {/* 尺度递进 */}
      <NsfwSectionHeader title="尺度递进" />
      <NsfwToggleSwitch
        label="启用尺度递进"
        checked={settings.启用尺度递进}
        onChange={v => set('启用尺度递进', v)}
        disabled={禁用}
      />
      <NsfwToggleSwitch
        label="启用安全词系统"
        checked={settings.启用安全词系统}
        onChange={v => set('启用安全词系统', v)}
        disabled={禁用 || !settings.启用尺度递进}
      />

      {/* 越界识别 */}
      <NsfwSectionHeader title="越界识别" />
      <NsfwToggleSwitch
        label="启用越界识别"
        checked={settings.启用越界识别}
        onChange={v => set('启用越界识别', v)}
        disabled={禁用}
      />
      <NsfwToggleSwitch
        label="启用摄影师筛选"
        checked={settings.启用摄影师筛选}
        onChange={v => set('启用摄影师筛选', v)}
        disabled={禁用}
      />
      <NsfwToggleSwitch
        label="启用道德选择"
        description="仅在灰色地带玩法层时生效"
        checked={settings.启用道德选择}
        onChange={v => set('启用道德选择', v)}
        disabled={禁用 || settings.主要玩法层 !== '灰色地带'}
      />

      {/* 泄露事件 */}
      <NsfwSectionHeader title="泄露事件" />
      <NsfwToggleSwitch
        label="启用泄露事件"
        checked={settings.启用泄露事件}
        onChange={v => set('启用泄露事件', v)}
        disabled={禁用}
      />
      <NsfwToggleSwitch
        label="启用照片交付"
        checked={settings.启用照片交付}
        onChange={v => set('启用照片交付', v)}
        disabled={禁用}
      />
      <NsfwSelectOption
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
