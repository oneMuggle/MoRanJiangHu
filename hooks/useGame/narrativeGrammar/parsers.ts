import type { 旁白行, 角色台词行, 判定行, 判定类型, 判定结果, 叙事块, 解析选项 } from '../../../models/narrativeGrammar';

const 旁白行正则 = /^【旁白】(.+)$/;
const 角色台词行正则 = /^【(.+?)】(.+)$/;

const 判定类型映射: Record<string, 判定类型> = {
  '通用': '通用', '对抗': '对抗', '洞察': '洞察', '先机': '先机',
  '瞄准': '瞄准', '接战': '接战', '防御': '防御', '伤害': '伤害',
  '态势': '态势', '反击': '反击', '反馈': '反馈', '消耗': '消耗', '衰退': '衰退',
};

const 判定结果映射: Record<string, 判定结果> = {
  '成功': '成功', '失败': '失败', '大成功': '大成功', '大失败': '大失败',
};

export function 解析旁白行(行: string): 旁白行 | null {
  const match = 行.match(旁白行正则);
  if (!match) return null;
  return { 类型: '旁白', 内容: match[1].trim(), 原始行: 行 };
}

export function 解析角色台词行(行: string): 角色台词行 | null {
  if (行.startsWith('【判定】')) return null;
  const match = 行.match(角色台词行正则);
  if (!match) return null;
  return { 类型: '角色台词', 角色名: match[1].trim(), 内容: match[2].trim(), 原始行: 行 };
}

export function 解析判定行(行: string): 判定行 | null {
  const match = 行.match(/^【判定】\[(.+?)\](.+?)｜(.+)$/);
  if (!match) return null;
  const 判定类型Str = match[1].trim();
  const 判定类型 = 判定类型映射[判定类型Str];
  const 行动名与触发对象 = match[2].trim();
  const 行动名匹配 = 行动名与触发对象.match(/^(.+?)｜触发对象(.+)$/);
  let 行动名 = 行动名与触发对象;
  let 触发对象 = '';
  if (行动名匹配) { 行动名 = 行动名匹配[1].trim(); 触发对象 = 行动名匹配[2].trim(); }
  const 判定信息 = match[3];
  const 判定值难度匹配 = 判定信息.match(/判定值(\d+)\/难度(\d+)/);
  const 结果匹配 = 判定信息.match(/结果=(.+)$/);
  if (!判定值难度匹配 || !结果匹配) return null;
  const 判定值 = parseInt(判定值难度匹配[1], 10);
  const 难度 = parseInt(判定值难度匹配[2], 10);
  const 结果 = 判定结果映射[结果匹配[1].trim()];
  if (结果 === undefined) return null;
  const 基础匹配 = 判定信息.match(/基础\s*B\(([+-]?\d+)/);
  const 环境匹配 = 判定信息.match(/环境\s*E\(([+-]?\d+)/);
  const 状态匹配 = 判定信息.match(/状态\s*S\(([+-]?\d+)/);
  const 幸运匹配 = 判定信息.match(/幸运\s*L\(([+-]?\d+)/);
  const 装备匹配 = 判定信息.match(/装备\s*Q\((.+?)[,)]]/);
  let 玩家: string | undefined;
  let 角色名: string | undefined;
  if (触发对象) {
    const 玩家匹配 = 触发对象.match(/玩家:(.+?)$/);
    const 角色匹配 = 触发对象.match(/NPC:(.+?)$/);
    if (玩家匹配) 玩家 = 玩家匹配[1].trim();
    if (角色匹配) 角色名 = 角色匹配[1].trim();
  }
  return {
    类型: '判定', 判定类型: 判定类型 || '通用', 行动名, 触发对象, 玩家, 角色名,
    判定值, 难度, 基础: 基础匹配 ? parseInt(基础匹配[1], 10) : 0,
    环境: 环境匹配 ? parseInt(环境匹配[1], 10) : 0, 状态: 状态匹配 ? parseInt(状态匹配[1], 10) : 0,
    幸运: 幸运匹配 ? parseInt(幸运匹配[1], 10) : undefined,
    装备: 装备匹配 ? 装备匹配[1].trim() : undefined, 结果, 原始行: 行
  };
}

export function 解析叙事块(文本: string, 选项?: 解析选项): 叙事块 {
  const 严格模式 = 选项?.严格模式 ?? false;
  const 结果: 叙事块 = { 正文: [] };
  const 正文匹配 = 文本.match(/<正文>([\s\S]*?)<\/正文>/);
  if (正文匹配) {
    const 行列表 = 正文匹配[1].split('\n').filter(行 => 行.trim());
    for (const 行 of 行列表) {
      const trimmed = 行.trim();
      if (!trimmed) continue;
      const 判定 = 解析判定行(trimmed);
      if (判定) { 结果.正文.push(判定); continue; }
      const 角色台词 = 解析角色台词行(trimmed);
      if (角色台词) { 结果.正文.push(角色台词); continue; }
      const 旁白 = 解析旁白行(trimmed);
      if (旁白) { 结果.正文.push(旁白); continue; }
      if (严格模式) { 结果.正文.push({ 类型: '旁白', 内容: trimmed, 原始行: trimmed }); }
    }
  }
  const extract = (tag: string): string | undefined => {
    const m = 文本.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return m ? m[1].trim() : undefined;
  };
  const 变量规划 = extract('变量规划'); if (变量规划) 结果.变量规划 = 变量规划;
  const 剧情规划 = extract('剧情规划'); if (剧情规划) 结果.剧情规划 = 剧情规划;
  const 短期记忆 = extract('短期记忆'); if (短期记忆) 结果.短期记忆 = 短期记忆;
  const thinking = extract('thinking'); if (thinking) 结果.thinking = thinking;
  const 行动选项 = extract('行动选项'); if (行动选项) 结果.行动选项 = 行动选项;
  const disclaimer = extract('disclaimer'); if (disclaimer) 结果.disclaimer = disclaimer;
  return 结果;
}
