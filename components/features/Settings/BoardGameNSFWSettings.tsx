/**
 * BoardGameNSFWSettings.tsx — 桌游社交 NSFW 设置面板
 *
 * 替换原有占位符，实现完整设置项。
 */

import React from 'react';
import type { 桌游类型 } from '../../../models/boardGameNSFW/core';

interface Props {
  settings: Record<string, unknown>;
  onChange: (settings: Record<string, unknown>) => void;
}

const 强度选项 = [
  { value: '关闭', label: '关闭', desc: '不触发桌游NSFW内容' },
  { value: '轻度', label: '轻度', desc: '暗示性描写，无直接描述' },
  { value: '中度', label: '中度', desc: '适度描写，情感驱动' },
  { value: '深度', label: '深度', desc: '完整描写，无限制' },
] as const;

const 频率选项 = [
  { value: '低', label: '低', desc: '偶尔触发' },
  { value: '中', label: '中', desc: '正常频率' },
  { value: '高', label: '高', desc: '频繁触发' },
] as const;

const 全部桌游类型: 桌游类型[] = [
  '密室逃脱', '狼人杀', '剧本杀', '真心话大冒险',
  '国王游戏', '大富翁', '棋牌游戏', '骰子游戏',
];

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }> = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <div className="text-sm text-gray-300">{label}</div>
      {desc && <div className="text-xs text-gray-500">{desc}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-wuxia-gold/60' : 'bg-gray-600'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export const BoardGameNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const 启用 = (settings.启用桌游NSFW as boolean) ?? false;
  const 强度 = (settings.桌游NSFW强度 as string) ?? '关闭';
  const 频率 = (settings.桌游触发频率 as string) ?? '中';
  const 启用游戏 = (settings.桌游启用游戏 as Record<string, boolean>) ?? {};
  const 启用多人局 = (settings.桌游启用多人局 as boolean) ?? true;
  const 启用邀请 = (settings.桌游启用邀请 as boolean) ?? true;
  const 启用成就 = (settings.桌游启用成就 as boolean) ?? true;
  const 线上模式 = (settings.桌游线上模式 as boolean) ?? false;

  const update = (key: string, value: unknown) => {
    onChange({ ...settings, [key]: value });
  };

  const toggle游戏 = (type: 桌游类型) => {
    const next = { ...启用游戏, [type]: !启用游戏[type] };
    update('桌游启用游戏', next);
  };

  return (
    <div className="space-y-4">
      {/* 主开关 */}
      <div className="border-b border-gray-700/30 pb-3">
        <h4 className="text-sm font-serif text-wuxia-gold/70 mb-2">桌游社交 NSFW</h4>
        <Switch
          checked={启用}
          onChange={(v) => update('启用桌游NSFW', v)}
          label="启用桌游 NSFW"
          desc="开启后在桌游场景中触发 NSFW 内容"
        />
      </div>

      {启用 && (
        <>
          {/* 强度选择 */}
          <div className="border-b border-gray-700/30 pb-3">
            <h4 className="text-sm font-serif text-wuxia-gold/70 mb-2">NSFW 强度</h4>
            <div className="grid grid-cols-2 gap-2">
              {强度选项.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('桌游NSFW强度', opt.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    强度 === opt.value
                      ? 'border-wuxia-gold bg-wuxia-gold/10'
                      : 'border-gray-700/30 hover:border-gray-500/50'
                  }`}
                >
                  <div className={`text-sm font-bold ${强度 === opt.value ? 'text-wuxia-gold' : 'text-gray-300'}`}>{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 触发频率 */}
          <div className="border-b border-gray-700/30 pb-3">
            <h4 className="text-sm font-serif text-wuxia-gold/70 mb-2">触发频率</h4>
            <div className="flex gap-2">
              {频率选项.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('桌游触发频率', opt.value)}
                  className={`flex-1 p-2 rounded-lg border text-center transition-all text-sm ${
                    频率 === opt.value
                      ? 'border-wuxia-gold bg-wuxia-gold/10 text-wuxia-gold'
                      : 'border-gray-700/30 text-gray-400 hover:border-gray-500/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 游戏类型开关 */}
          <div className="border-b border-gray-700/30 pb-3">
            <h4 className="text-sm font-serif text-wuxia-gold/70 mb-2">启用游戏类型</h4>
            <div className="grid grid-cols-2 gap-2">
              {全部桌游类型.map(type => (
                <Switch
                  key={type}
                  checked={启用游戏[type] ?? true}
                  onChange={() => toggle游戏(type)}
                  label={type}
                />
              ))}
            </div>
          </div>

          {/* 功能开关 */}
          <div>
            <h4 className="text-sm font-serif text-wuxia-gold/70 mb-2">功能</h4>
            <Switch checked={启用多人局} onChange={(v) => update('桌游启用多人局', v)} label="启用多人局" desc="3-8 人多人局管理" />
            <Switch checked={启用邀请} onChange={(v) => update('桌游启用邀请', v)} label="启用邀请机制" desc="NPC 主动邀请参加桌游" />
            <Switch checked={启用成就} onChange={(v) => update('桌游启用成就', v)} label="启用成就系统" desc="记录桌游里程碑和成就" />
            <Switch checked={线上模式} onChange={(v) => update('桌游线上模式', v)} label="线上模式" desc="模拟线上桌游体验" />
          </div>
        </>
      )}
    </div>
  );
};

export default BoardGameNSFWSettings;
