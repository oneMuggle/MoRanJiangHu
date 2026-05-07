// 校园 NSFW 设置面板
// 提供所有校园 NSFW 子系统的独立开关和强度控制

import React from 'react';
import { 校园NSFW设置, 默认校园NSFW设置 } from '../../../models/campusNSFW';
import { NsfwToggleSwitch, NsfwSelectOption, NsfwSectionHeader } from '../NSFWCenter/NsfwSettingsForm';

export type { 校园NSFW设置 };
export { 默认校园NSFW设置 };

// ==================== 主组件 ====================

interface Props {
  settings: 校园NSFW设置;
  onChange: (settings: 校园NSFW设置) => void;
}

export const CampusNSFWSettings: React.FC<Props> = ({ settings, onChange }) => {
  const update = <K extends keyof 校园NSFW设置>(key: K, value: 校园NSFW设置[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const masterEnabled = settings.启用校园NSFW深化系统;

  return (
    <div className="space-y-1">
      {/* 主开关 */}
      <div className="bg-wuxia-gold/5 border border-wuxia-gold/20 rounded-lg px-4 py-3 mb-2">
        <NsfwToggleSwitch
          label="启用校园 NSFW 深化系统"
          description="关闭时所有校园 NSFW 新功能不生效，NPC 欲望档案不创建"
          checked={settings.启用校园NSFW深化系统}
          onChange={(v) => update('启用校园NSFW深化系统', v)}
        />
      </div>

      {!masterEnabled && (
        <div className="text-center text-gray-600 text-xs py-8 font-serif">
          开启主开关以配置校园 NSFW 子系统
        </div>
      )}

      {masterEnabled && (
        <>
          {/* 基础设置 */}
          <NsfwSectionHeader title="基础设置" />
          <NsfwSelectOption
            label="NSFW 内容强度"
            description="影响 AI prompt 约束和生成内容的详细程度"
            value={settings.NSFW内容强度}
            options={['微暗', '暧昧', '露骨']}
            onChange={(v) => update('NSFW内容强度', v as any)}
          />
          <NsfwToggleSwitch
            label="启用后果系统"
            description="关闭时不触发暴露/流言/学业影响后果"
            checked={settings.启用后果系统}
            onChange={(v) => update('启用后果系统', v)}
          />
          <NsfwToggleSwitch
            label="启用多角关系"
            description="关闭时检测到多 NPC 发展会触发警告并限制"
            checked={settings.启用多角关系}
            onChange={(v) => update('启用多角关系', v)}
          />

          {/* v1.1 露出与公开隐秘 */}
          <NsfwSectionHeader title="露出与公开隐秘" />
          <NsfwToggleSwitch
            label="启用露出系统"
            description="开启后 NPC 可能从被动风险转为主动追求暴露"
            checked={settings.启用露出系统}
            onChange={(v) => update('启用露出系统', v)}
          />
          <NsfwSelectOption
            label="露出内容强度"
            description="关闭: 不生成露出叙事 | 轻度: 私密半公开 | 中度: 半公共场所 | 深度: 公共场所"
            value={settings.露出内容强度}
            options={['关闭', '轻度', '中度', '深度']}
            onChange={(v) => update('露出内容强度', v as any)}
            disabled={!settings.启用露出系统}
          />
          <NsfwToggleSwitch
            label="启用公开隐秘侵犯"
            description="开启后在教室、会议、活动等场合可能触发秘密互动"
            checked={settings.启用公开隐秘侵犯}
            onChange={(v) => update('启用公开隐秘侵犯', v)}
            disabled={!settings.启用露出系统}
          />
          <NsfwToggleSwitch
            label="启用旁观者反应"
            description="开启后周围人可能注意到并触发流言/后果"
            checked={settings.启用旁观者反应}
            onChange={(v) => update('启用旁观者反应', v)}
            disabled={!settings.启用公开隐秘侵犯}
          />
          <NsfwToggleSwitch
            label="启用网络传播"
            description="开启后可能有偷拍、论坛讨论、群聊传播"
            checked={settings.启用网络传播}
            onChange={(v) => update('启用网络传播', v)}
            disabled={!settings.启用旁观者反应}
          />
          <NsfwSelectOption
            label="校园活动 NSFW 频率"
            description="关闭: 活动不触发 NSFW | 低: 仅特殊活动 | 中: 中型活动 | 高: 所有活动"
            value={settings.校园活动NSFW频率}
            options={['关闭', '低', '中', '高']}
            onChange={(v) => update('校园活动NSFW频率', v as any)}
          />

          {/* v1.2 SM/支配服从 */}
          <NsfwSectionHeader title="SM/支配服从系统" />
          <NsfwToggleSwitch
            label="启用 SM/支配服从系统"
            description="开启后引入权力天平、服从度、契约等子系统"
            checked={settings.启用SM系统}
            onChange={(v) => update('启用SM系统', v)}
          />
          <NsfwSelectOption
            label="SM 内容强度"
            description="轻度: 指令/测试 | 中度: +束缚/角色扮演 | 深度: +感官剥夺/契约/公开服从"
            value={settings.SM内容强度}
            options={['关闭', '轻度', '中度', '深度']}
            onChange={(v) => update('SM内容强度', v as any)}
            disabled={!settings.启用SM系统}
          />
          <NsfwToggleSwitch
            label="启用契约系统"
            description="开启后可达成口头/书面契约和交换信物"
            checked={settings.启用契约系统}
            onChange={(v) => update('启用契约系统', v)}
            disabled={!settings.启用SM系统}
          />
          <NsfwToggleSwitch
            label="启用公开服从"
            description="开启后在高服从度下可能触发公开服从场景"
            checked={settings.启用公开服从}
            onChange={(v) => update('启用公开服从', v)}
            disabled={!settings.启用契约系统}
          />
          <NsfwSelectOption
            label="权力天平初始倾向"
            description="随机: 每个 NPC 随机生成 | 其他: 所有 NPC 初始倾向固定"
            value={settings.权力天平初始倾向}
            options={['随机', 'NPC支配', 'NPC服从', '切换者']}
            onChange={(v) => update('权力天平初始倾向', v as any)}
            disabled={!settings.启用SM系统}
          />

          {/* v1.3 桌游社交 */}
          <NsfwSectionHeader title="桌游社交 NSFW" />
          <NsfwToggleSwitch
            label="启用桌游 NSFW 系统"
            description="开启后在桌游中可能触发 NSFW 事件"
            checked={settings.启用桌游NSFW}
            onChange={(v) => update('启用桌游NSFW', v)}
          />
          <NsfwSelectOption
            label="桌游 NSFW 强度"
            description="轻度: 密室独处/私下结盟 | 中度: +搜身/假戏真做 | 深度: +屏风后/公开执行"
            value={settings.桌游NSFW强度}
            options={['关闭', '轻度', '中度', '深度']}
            onChange={(v) => update('桌游NSFW强度', v as any)}
            disabled={!settings.启用桌游NSFW}
          />
          <NsfwToggleSwitch
            label="启用密室逃脱 NSFW"
            description="开启后密室逃脱可能触发独处亲密场景"
            checked={settings.启用密室逃脱NSFW}
            onChange={(v) => update('启用密室逃脱NSFW', v)}
            disabled={!settings.启用桌游NSFW}
          />
          <NsfwToggleSwitch
            label="启用狼人杀 NSFW"
            description="开启后私下结盟和出局后可能有 NSFW 内容"
            checked={settings.启用狼人杀NSFW}
            onChange={(v) => update('启用狼人杀NSFW', v)}
            disabled={!settings.启用桌游NSFW}
          />
          <NsfwToggleSwitch
            label="启用剧本杀 NSFW"
            description="开启后剧本 CP 线可能现实化"
            checked={settings.启用剧本杀NSFW}
            onChange={(v) => update('启用剧本杀NSFW', v)}
            disabled={!settings.启用桌游NSFW}
          />
          <NsfwToggleSwitch
            label="启用派对游戏 NSFW"
            description="开启后真心话大冒险/国王游戏可能有 NSFW 指令"
            checked={settings.启用派对游戏NSFW}
            onChange={(v) => update('启用派对游戏NSFW', v)}
            disabled={!settings.启用桌游NSFW}
          />
          <NsfwSelectOption
            label="桌游触发频率"
            description="低: 每月 1 次 | 中: 每 2 周 1 次 | 高: 每周 1 次 + 社团额外"
            value={settings.桌游触发频率}
            options={['低', '中', '高']}
            onChange={(v) => update('桌游触发频率', v as any)}
            disabled={!settings.启用桌游NSFW}
          />

          {/* v1.4 校园祭 */}
          <NsfwSectionHeader title="校园祭 NSFW" />
          <NsfwToggleSwitch
            label="启用校园祭 NSFW 系统"
            description="开启后在筹备/举办/后夜祭各阶段触发 NSFW 事件"
            checked={settings.启用校园祭NSFW}
            onChange={(v) => update('启用校园祭NSFW', v)}
          />
          <NsfwSelectOption
            label="校园祭 NSFW 强度"
            description="轻度: 筹备/摊位/告白 | 中度: +舞台后台/鬼屋 | 深度: +修罗场/酒精"
            value={settings.校园祭NSFW强度}
            options={['关闭', '轻度', '中度', '深度']}
            onChange={(v) => update('校园祭NSFW强度', v as any)}
            disabled={!settings.启用校园祭NSFW}
          />
          <NsfwToggleSwitch
            label="启用后夜祭告白"
            description="开启后篝火/烟花时可能触发告白事件"
            checked={settings.启用后夜祭告白}
            onChange={(v) => update('启用后夜祭告白', v)}
            disabled={!settings.启用校园祭NSFW}
          />
          <NsfwToggleSwitch
            label="启用摊位 NSFW"
            description="开启后根据摊位类型生成对应 NSFW 场景"
            checked={settings.启用摊位NSFW}
            onChange={(v) => update('启用摊位NSFW', v)}
            disabled={!settings.启用校园祭NSFW}
          />
          <NsfwToggleSwitch
            label="启用舞台 NSFW"
            description="开启后后台独处、表演中断等场景可触发"
            checked={settings.启用舞台NSFW}
            onChange={(v) => update('启用舞台NSFW', v)}
            disabled={!settings.启用校园祭NSFW}
          />
          <NsfwSelectOption
            label="校园祭频率"
            description="每学期一次: 每年 3 次 | 每学年一次: 每年 1 次 | 随机: 不可预测"
            value={settings.校园祭频率}
            options={['每学期一次', '每学年一次', '随机']}
            onChange={(v) => update('校园祭频率', v as any)}
            disabled={!settings.启用校园祭NSFW}
          />

          {/* v1.5 BDSM 论坛 */}
          <NsfwSectionHeader title="BDSM 论坛系统" />
          <NsfwToggleSwitch
            label="启用 BDSM 论坛"
            description="开启后校园深夜板块增加 BDSM 子论坛，包含匿名讨论、寻主召奴等子分类"
            checked={settings.启用BDSM论坛}
            onChange={(v) => update('启用BDSM论坛', v)}
          />
          <NsfwSelectOption
            label="BDSM 内容强度"
            description="关闭: 不生成 | 轻度: 心理暗示 | 中度: 明确行为 | 深度: 详细场景"
            value={settings.BDSM内容强度}
            options={['关闭', '轻度', '中度', '深度']}
            onChange={(v) => update('BDSM内容强度', v as any)}
            disabled={!settings.启用BDSM论坛}
          />
          <NsfwToggleSwitch
            label="启用 NPC 影响"
            description="开启后浏览 BDSM 帖子会推进 NPC 欲望阶段"
            checked={settings.启用BDSM_NPC影响}
            onChange={(v) => update('启用BDSM_NPC影响', v)}
            disabled={!settings.启用BDSM论坛}
          />
          <NsfwToggleSwitch
            label="启用流言传播"
            description="开启后严重/中等帖子会增加校园流言等级"
            checked={settings.启用BDSM_流言传播}
            onChange={(v) => update('启用BDSM_流言传播', v)}
            disabled={!settings.启用BDSM论坛}
          />

          {/* v1.6 BDSM 关系管线 */}
          <NsfwSectionHeader title="BDSM 关系管线" />
          <NsfwToggleSwitch
            label="启用 BDSM 关系管线"
            description="开启后 NPC 欲望档案将追踪 BDSM 关系状态、服从度、权力天平等"
            checked={settings.启用BDSM关系管线}
            onChange={(v) => update('启用BDSM关系管线', v)}
          />
          <NsfwToggleSwitch
            label="启用 BDSM 调教任务"
            description="开启后 AI 每回合生成调教任务/日常指令，玩家可接受、报告完成或放弃"
            checked={settings.启用BDSM调教任务}
            onChange={(v) => update('启用BDSM调教任务', v)}
            disabled={!settings.启用BDSM关系管线}
          />
          <NsfwToggleSwitch
            label="启用 BDSM 契约系统"
            description="开启后可与 NPC 协商并缔结 BDSM 契约，约定双方权利与义务"
            checked={settings.启用BDSM契约系统}
            onChange={(v) => update('启用BDSM契约系统', v)}
            disabled={!settings.启用BDSM关系管线}
          />
          <NsfwToggleSwitch
            label="启用 BDSM 见面预约"
            description="开启后可与 NPC 预约见面时间与地点，系统将生成对应场景"
            checked={settings.启用BDSM见面预约}
            onChange={(v) => update('启用BDSM见面预约', v)}
            disabled={!settings.启用BDSM关系管线}
          />
        </>
      )}
    </div>
  );
};

export default CampusNSFWSettings;
