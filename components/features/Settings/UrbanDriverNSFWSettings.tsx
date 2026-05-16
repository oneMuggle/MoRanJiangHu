// 都市网约车 NSFW 设置面板
// 提供所有网约车 NSFW 子系统的独立开关和强度控制

import React from 'react';
import type { 都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';
import { 默认都市网约车NSFW设置 } from '../../../models/urbanDriverNSFW';
import { NsfwToggleSwitch, NsfwSelectOption, NsfwSectionHeader } from '../NSFWCenter/NsfwSettingsForm';

export type { 都市网约车NSFW设置 };
export { 默认都市网约车NSFW设置 };

// ==================== 主组件 ====================

interface Props {
  settings: 都市网约车NSFW设置;
  onChange: (settings: 都市网约车NSFW设置) => void;
}

export const UrbanDriverNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof 都市网约车NSFW设置>(key: K, value: 都市网约车NSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用都市网约车NSFW系统;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <NsfwToggleSwitch
          label="启用都市网约车 NSFW 系统"
          description="为网约车司机职业路径增加深度 NSFW 强化（仅 contemporary_urban 时代生效）"
          checked={settings.启用都市网约车NSFW系统}
          onChange={(v) => update('启用都市网约车NSFW系统', v)}
        />
      </div>

      {/* 基础设置 */}
      <NsfwSectionHeader title="基础设置" />
      <NsfwSelectOption
        label="NSFW 内容强度"
        value={settings.NSFW内容强度}
        options={['微暗', '暧昧', '露骨']}
        onChange={(v) => update('NSFW内容强度', v as 都市网约车NSFW设置['NSFW内容强度'])}
        disabled={!masterEnabled}
      />

      {/* 醉酒场景 */}
      <NsfwSectionHeader title="醉酒场景" />
      <NsfwToggleSwitch
        label="启用醉酒乘客场景"
        description="深夜接到醉酒状态的女性乘客，在密闭车厢内产生暧昧互动"
        checked={settings.启用醉酒乘客场景}
        onChange={(v) => update('启用醉酒乘客场景', v)}
        disabled={!masterEnabled}
      />
      <NsfwSelectOption
        label="醉酒场景强度"
        value={settings.醉酒场景强度}
        options={['关闭', '轻度', '中度', '深度']}
        onChange={(v) => update('醉酒场景强度', v as 都市网约车NSFW设置['醉酒场景强度'])}
        disabled={!masterEnabled || !settings.启用醉酒乘客场景}
      />

      {/* 下药场景 */}
      <NsfwSectionHeader title="下药场景" />
      <NsfwToggleSwitch
        label="启用饮料下药场景"
        description="乘客或司机在车内饮料中被下药导致意识模糊的场景"
        checked={settings.启用饮料下药场景}
        onChange={(v) => update('启用饮料下药场景', v)}
        disabled={!masterEnabled}
      />
      <NsfwSelectOption
        label="下药场景强度"
        value={settings.下药场景强度}
        options={['关闭', '轻度', '中度', '深度']}
        onChange={(v) => update('下药场景强度', v as 都市网约车NSFW设置['下药场景强度'])}
        disabled={!masterEnabled || !settings.启用饮料下药场景}
      />
      <NsfwSelectOption
        label="首选药物类型"
        value={settings.首选药物类型}
        options={['随机', '迷药', '安眠药', '兴奋剂', '催情药', '致幻剂', '记忆阻断剂']}
        onChange={(v) => update('首选药物类型', v as 都市网约车NSFW设置['首选药物类型'])}
        disabled={!masterEnabled || !settings.启用饮料下药场景}
        description="随机=每次随机选择；迷药=意识模糊；安眠药=强烈睡意；兴奋剂=感官敏锐；催情药=身体燥热渴望；致幻剂=现实扭曲幻觉；记忆阻断剂=短期记忆丧失"
      />

      {/* 场景系统 */}
      <NsfwSectionHeader title="场景系统" />
      <NsfwToggleSwitch
        label="启用深夜独处场景"
        description="凌晨空旷街道上的单独相处"
        checked={settings.启用深夜独处场景}
        onChange={(v) => update('启用深夜独处场景', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用后座暗示场景"
        description="乘客在后座做出的暗示行为"
        checked={settings.启用后座暗示场景}
        onChange={(v) => update('启用后座暗示场景', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用停车场秘密场景"
        description="到达目的地后在停车场的延伸故事"
        checked={settings.启用停车场秘密场景}
        onChange={(v) => update('启用停车场秘密场景', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用拼车暧昧场景"
        description="拼车时的多人互动"
        checked={settings.启用拼车暧昧场景}
        onChange={(v) => update('启用拼车暧昧场景', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用常客关系系统"
        description="固定乘客的渐进关系发展"
        checked={settings.启用常客关系系统}
        onChange={(v) => update('启用常客关系系统', v)}
        disabled={!masterEnabled}
      />
      <NsfwToggleSwitch
        label="启用行车记录仪系统"
        description="记录仪相关的紧张场景和泄露风险"
        checked={settings.启用行车记录仪系统}
        onChange={(v) => update('启用行车记录仪系统', v)}
        disabled={!masterEnabled}
      />

      {/* 后果系统 */}
      <NsfwSectionHeader title="后果系统" />
      <NsfwToggleSwitch
        label="启用后果系统"
        description="每个 NSFW 场景都伴随可能的后果"
        checked={settings.启用后果系统}
        onChange={(v) => update('启用后果系统', v)}
        disabled={!masterEnabled}
      />
      <NsfwSelectOption
        label="后果严重程度"
        value={settings.后果严重程度}
        options={['轻微', '中等', '严重', '毁灭']}
        onChange={(v) => update('后果严重程度', v as 都市网约车NSFW设置['后果严重程度'])}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <NsfwToggleSwitch
        label="启用平台处罚"
        description="平台投诉、差评降权、封号等处罚"
        checked={settings.启用平台处罚}
        onChange={(v) => update('启用平台处罚', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <NsfwToggleSwitch
        label="启用网络传播"
        description="事件在社交媒体发酵"
        checked={settings.启用网络传播}
        onChange={(v) => update('启用网络传播', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <NsfwToggleSwitch
        label="启用警察盘查"
        description="路遇临检发现异常"
        checked={settings.启用警察盘查}
        onChange={(v) => update('启用警察盘查', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />
      <NsfwToggleSwitch
        label="启用勒索威胁"
        description="被乘客或第三方勒索"
        checked={settings.启用勒索威胁}
        onChange={(v) => update('启用勒索威胁', v)}
        disabled={!masterEnabled || !settings.启用后果系统}
      />

      {/* 频率控制 */}
      <NsfwSectionHeader title="频率控制" />
      <NsfwSelectOption
        label="NSFW 行程触发频率"
        value={settings.NSFW行程触发频率}
        options={['低', '中', '高']}
        onChange={(v) => update('NSFW行程触发频率', v as 都市网约车NSFW设置['NSFW行程触发频率'])}
        disabled={!masterEnabled}
      />
    </div>
  );
};

export default UrbanDriverNSFWSettings;