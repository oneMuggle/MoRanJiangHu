// 校园 NSFW 模块注册

import type { StoryModule, 游戏状态快照 } from '../../../utils/storyModule/types';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { 校园NSFW设置 } from '../../../models/campusNSFW';
import { 默认校园NSFW设置 } from '../../../models/campusNSFW';
import { 规范化校园NSFW设置 } from '../../../models/campusNSFW/normalization';
import { 构建校园NSFW完整叙事约束 } from '../../../prompts/runtime/campusNSFW';
import type { 露出偏好等级, 权力倾向, SM场景类型, 校园祭阶段, 校园祭主题, 摊位类型, 后夜祭状态, 桌游类型, 密室主题 } from '../../../models/campusNSFW';

interface 校园运行时参数 {
  欲望阶段: string;
  关系轨道: string;
  暴露风险: number;
  流言等级: number;
  露出偏好等级?: 露出偏好等级;
  紧张度?: number;
  权力倾向?: 权力倾向;
  服从度?: number;
  已解锁SM场景: SM场景类型[];
  校园祭阶段?: 校园祭阶段;
  校园祭主题?: 校园祭主题;
  摊位类型?: 摊位类型;
  后夜祭状态?: 后夜祭状态;
  桌游类型?: 桌游类型;
  密室主题?: 密室主题;
  内容强度: '微暗' | '暧昧' | '露骨';
  其他Npc欲望摘要?: string;
  启用BDSM论坛: boolean;
  BDSM内容强度: '关闭' | '轻度' | '中度' | '深度';
  论坛活跃帖子数?: number;
  寻主召奴未联系帖数?: number;
}

function 提取校园参数(
  gameState: 游戏状态快照,
  settings: 校园NSFW设置
): 校园运行时参数 | null {
  const 欲望系统 = (gameState.校园系统 as any)?.欲望系统;
  if (!欲望系统?.NPC欲望档案) return null;

  const npcIds = Object.keys(欲望系统.NPC欲望档案);
  if (npcIds.length === 0) return null;

  const 阶段权重: Record<string, number> = { '克制': 0, '试探': 1, '渴望': 2, '沉沦': 3, '支配': 4 };
  const 焦点NpcId = npcIds.reduce((best, id) => {
    const a = 欲望系统.NPC欲望档案[id];
    const b = 欲望系统.NPC欲望档案[best];
    return (阶段权重[a?.当前阶段] || 0) > (阶段权重[b?.当前阶段] || 0) ? id : best;
  });

  const 焦点档案 = 欲望系统.NPC欲望档案[焦点NpcId];
  if (!焦点档案) return null;

  const 其他Npc摘要: string[] = [];
  for (const id of npcIds) {
    if (id === 焦点NpcId) continue;
    const 档案 = 欲望系统.NPC欲望档案[id];
    if (!档案) continue;
    let 片段 = `${id}: ${档案.当前阶段}/${档案.关系轨道}(进度${档案.阶段进度}/${档案.轨道进度}) 暴露${档案.暴露风险值}`;
    if (档案.BDSM关系) {
      片段 += ` BDSM:${档案.BDSM关系.阶段}`;
    }
    其他Npc摘要.push(片段);
  }

  const 已解锁SM场景: SM场景类型[] = (欲望系统.SM场景池 || []).map((r: any) => r.场景类型);

  const 校园祭状态 = 欲望系统.校园祭状态;
  const 桌游 = 欲望系统.桌游状态;

  return {
    欲望阶段: 焦点档案.当前阶段,
    关系轨道: 焦点档案.关系轨道,
    暴露风险: 焦点档案.暴露风险值,
    流言等级: 焦点档案.流言等级,
    露出偏好等级: 焦点档案.露出状态?.当前等级,
    紧张度: 焦点档案.紧张度状态?.当前值,
    权力倾向: 焦点档案.权力倾向,
    服从度: 焦点档案.服从度?.当前值,
    已解锁SM场景,
    校园祭阶段: 校园祭状态?.阶段,
    校园祭主题: 校园祭状态?.主题,
    摊位类型: 校园祭状态?.摊位类型,
    后夜祭状态: 校园祭状态?.后夜祭状态,
    桌游类型: 桌游?.当前类型,
    密室主题: (桌游 as any)?.密室主题,
    内容强度: settings.NSFW内容强度,
    其他Npc欲望摘要: 其他Npc摘要.length > 0 ? 其他Npc摘要.join('；') : undefined,
    启用BDSM论坛: settings.启用BDSM论坛,
    BDSM内容强度: settings.BDSM内容强度,
    论坛活跃帖子数: 0,
    寻主召奴未联系帖数: 0,
  };
}

const 校园NSFW模块: StoryModule<校园NSFW设置, 校园运行时参数> = {
  id: 'campusNSFW',
  name: '校园NSFW',
  eraId: 'contemporary_urban',
  version: '2.0.0',
  priority: 100,
  category: 'nsfw',
  description: '校园纪元 NSFW 深化系统：欲望状态机、关系轨道、露出、SM、桌游、校园祭、BDSM 论坛等子系统',
  masterToggleKey: '启用校园NSFW深化系统',
  dependencies: [],
  defaultSettings: 默认校园NSFW设置,
  normalizeSettings: (raw) => 规范化校园NSFW设置(raw as Partial<校园NSFW设置>),
  extractPromptParams: 提取校园参数,
  buildPromptFragment: (params) => {
    return 构建校园NSFW完整叙事约束({
      欲望阶段: params.欲望阶段 as any,
      关系轨道: params.关系轨道 as any,
      暴露风险: params.暴露风险,
      流言等级: params.流言等级,
      露出偏好等级: params.露出偏好等级,
      紧张度: params.紧张度,
      权力倾向: params.权力倾向,
      服从度: params.服从度,
      已解锁SM场景: params.已解锁SM场景,
      校园祭阶段: params.校园祭阶段,
      校园祭主题: params.校园祭主题,
      摊位类型: params.摊位类型,
      后夜祭状态: params.后夜祭状态,
      桌游类型: params.桌游类型,
      密室主题: params.密室主题,
      内容强度: params.内容强度,
      其他Npc欲望摘要: params.其他Npc欲望摘要,
      启用BDSM论坛: params.启用BDSM论坛,
      BDSM内容强度: params.BDSM内容强度,
      论坛活跃帖子数: params.论坛活跃帖子数,
      寻主召奴未联系帖数: params.寻主召奴未联系帖数,
    });
  },
  responseTag: '欲望系统状态',
};

故事模块注册表.注册模块(校园NSFW模块);
