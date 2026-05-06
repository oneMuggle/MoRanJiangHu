import type { NPC欲望档案 } from '../../../models/campusNSFW';
import { BDSM阶段要求 } from '../../../models/campusNSFW/bdsmConstants';

export function 处理BDSM任务影响(参数: {
  NPC档案: NPC欲望档案; 任务评价: '完美服从' | '优秀' | '良好' | '勉强' | '失败' | '拒绝';
  服从度变化: number;
}): { 更新后档案: NPC欲望档案; 里程碑?: string } {
  const { NPC档案, 任务评价, 服从度变化 } = 参数;
  const 更新后档案 = { ...NPC档案 };
  const bdsm = 更新后档案.BDSM关系;
  if (!bdsm) return { 更新后档案 };
  const 新服从度 = Math.max(0, Math.min(100, bdsm.服从度 + 服从度变化));
  const 新权力天平 = Math.max(-50, Math.min(50,
    bdsm.权力天平 + (任务评价 === '完美服从' || 任务评价 === '优秀' ? -2 : 任务评价 === '失败' || 任务评价 === '拒绝' ? 3 : 0)
  ));
  更新后档案.BDSM关系 = { ...bdsm, 服从度: 新服从度, 权力天平: 新权力天平 };
  let 里程碑: string | undefined;
  if (任务评价 === '完美服从') 里程碑 = `完美服从任务，服从度提升至 ${新服从度}`;
  else if (任务评价 === '拒绝') 里程碑 = `拒绝执行任务，服从度降至 ${新服从度}`;
  return { 更新后档案, 里程碑 };
}

export function 判定BDSM关系阶段推进(当前档案: NPC欲望档案): { 推进: boolean; 新阶段: string | null; 理由: string } {
  const bdsm = 当前档案.BDSM关系;
  if (!bdsm) return { 推进: false, 新阶段: null, 理由: '无 BDSM 关系' };
  const 阶段要求 = BDSM阶段要求[bdsm.阶段];
  if (!阶段要求) return { 推进: false, 新阶段: null, 理由: '已达最终阶段' };
  const 完成任务数 = (bdsm.任务历史 || []).filter(t => t.状态 === '已完成').length;
  const 完美服从数 = (bdsm.任务历史 || []).filter(t => t.评价 === '完美服从').length;
  const 违约次数 = (bdsm.契约记录 || []).reduce((sum, c) => sum + (c.违约次数 || 0), 0);
  const 未满足: string[] = [];
  if (bdsm.服从度 < 阶段要求.服从度) 未满足.push(`服从度 ${bdsm.服从度}/${阶段要求.服从度}`);
  if (完成任务数 < 阶段要求.任务数) 未满足.push(`完成任务 ${完成任务数}/${阶段要求.任务数}`);
  if (完美服从数 < 阶段要求.完美服从) 未满足.push(`完美服从 ${完美服从数}/${阶段要求.完美服从}`);
  if (违约次数 > 阶段要求.最大违约) 未满足.push(`违约次数过多 (${违约次数}/${阶段要求.最大违约})`);
  if (未满足.length === 0) return { 推进: true, 新阶段: 阶段要求.下一阶段, 理由: `满足所有条件，从「${bdsm.阶段}」推进到「${阶段要求.下一阶段}」` };
  return { 推进: false, 新阶段: null, 理由: `尚未满足：${未满足.join('、')}` };
}
