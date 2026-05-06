import type { 叙事块, 判定类型, 判定结果 } from '../../../models/narrativeGrammar';

const 判定结果映射: Record<string, 判定结果> = { '成功': '成功', '失败': '失败', '大成功': '大成功', '大失败': '大失败' };

export function 规范化叙事文本(原始文本: string): string {
  let 结果 = 原始文本;
  结果 = 结果.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  结果 = 结果.replace(/\n{3,}/g, '\n\n');
  结果 = 结果.replace(/\n\s*</g, '<');
  结果 = 结果.replace(/>\s*\n/g, '>\n');
  结果 = 结果.replace(/【旁白】\s*/g, '【旁白】');
  结果 = 结果.replace(/【(.+?)】\s*/g, '【$1】');
  结果 = 结果.replace(/【判定】\s*/g, '【判定】');
  return 结果;
}

export function 提取叙事统计(叙事块: 叙事块): { 旁白数: number; 台词数: number; 判定数: number; 总行数: number } {
  return {
    旁白数: 叙事块.正文.filter(行 => 行.类型 === '旁白').length,
    台词数: 叙事块.正文.filter(行 => 行.类型 === '角色台词').length,
    判定数: 叙事块.正文.filter(行 => 行.类型 === '判定').length,
    总行数: 叙事块.正文.length
  };
}

export function 获取判定类型显示名(判定类型: 判定类型): string {
  return { '通用': '通用行动判定', '对抗': '对抗判定', '洞察': '洞察判定', '先机': '先机判定', '瞄准': '瞄准判定', '接战': '接战判定', '防御': '防御判定', '伤害': '伤害判定', '态势': '态势判定', '反击': '反击判定', '反馈': '反馈判定', '消耗': '消耗判定', '衰退': '衰退判定' }[判定类型] || 判定类型;
}

export function 是有效判定结果(结果: string): boolean {
  return 结果 in 判定结果映射;
}
