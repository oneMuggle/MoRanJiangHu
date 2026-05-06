import { 计算BDSM帖子总影响, 应用BDSM帖子影响, 计算BDSM流言传播 } from '../bdsmForumEngine';
import type { BDSM论坛帖子 } from '../../../models/campusNSFW/bdsm-forum';
import type { NPC欲望档案 } from '../../../models/campusNSFW';

export function 处理BDSM论坛影响(参数: {
  帖子列表: BDSM论坛帖子[]; NPC欲望档案映射: Map<string, NPC欲望档案>;
  当前流言等级: number; 启用NPC影响: boolean; 启用流言传播: boolean;
  内容强度: '关闭' | '轻度' | '中度' | '深度';
}): { 更新后档案映射: Map<string, NPC欲望档案>; 新流言等级: number; 影响记录: { npcId: string; 描述: string }[] } {
  const { 帖子列表, NPC欲望档案映射, 当前流言等级, 启用NPC影响, 启用流言传播, 内容强度 } = 参数;
  const 更新后映射 = new Map(NPC欲望档案映射);
  const 影响记录: { npcId: string; 描述: string }[] = [];
  if (启用NPC影响 && 帖子列表.length > 0 && 内容强度 !== '关闭') {
    const 总影响 = 计算BDSM帖子总影响({ 帖子列表, 内容强度 });
    for (const [npcId, 档案] of 更新后映射) {
      const npc影响 = 应用BDSM帖子影响({ NPC档案: 档案, 推进值: 总影响.总推进值 });
      if (npc影响.阶段升级) 影响记录.push({ npcId, 描述: `欲望阶段升级至 ${npc影响.更新后档案.当前阶段}` });
      更新后映射.set(npcId, npc影响.更新后档案);
    }
  }
  const 新流言等级 = 计算BDSM流言传播({ 帖子列表, 当前流言等级, 启用流言传播 });
  return { 更新后档案映射: 更新后映射, 新流言等级, 影响记录 };
}
