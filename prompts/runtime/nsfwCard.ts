import type { NPC结构 } from '../../models/social';
import type { NSFW场景类型 } from '../../models/system';
import { 获取最亲密动作, 构建亲密度动作约束 } from './intimacy';
import { 构建里象修行叙事约束 } from './nsfw';

/**
 * 构建单个 NPC 的 NSFW 角色卡片文本
 * @param npc - NPC 数据结构
 * @param nsfw场景类型 - NSFW 场景档位
 * @returns 角色卡片提示词字符串
 */
export const 构建NPC_NSWF卡片 = (
  npc: NPC结构,
  nsfw场景类型: NSFW场景类型
): string => {
  if (nsfw场景类型 === '无') return '';

  const lines: string[] = [];
  lines.push(`【${npc.姓名}】`);

  // 亲密度等级
  const 亲密度等级 = npc.亲密度等级 ?? 0;
  lines.push(`亲密度等级: ${亲密度等级}（${获取最亲密动作(亲密度等级)}）`);

  // 动作约束
  const 动作约束 = 构建亲密度动作约束(亲密度等级, nsfw场景类型);
  if (动作约束) {
    lines.push(`动作约束: ${动作约束}`);
  }

  // 里象心法
  if (npc.里象心法) {
    const 心法 = npc.里象心法;
    const 已解锁 = 亲密度等级 >= 心法.亲密度解锁等级;
    lines.push(`里象心法【${心法.名称}】(${已解锁 ? '已解锁' : `未解锁(需等级${心法.亲密度解锁等级})`})`);
    if (已解锁) {
      lines.push(`表: ${心法.表描述}`);
      lines.push(`里: ${心法.里描述}`);
      lines.push(`描写风格: ${心法.描写风格}`);
    } else {
      lines.push(`(此心法尚未解锁，AI 不应描写相关内容)`);
    }
  }

  // 服装状态
  if (npc.当前服装状态) {
    const 服装 = npc.当前服装状态;
    const 服装摘要: string[] = [];
    if (服装.上衣状态) 服装摘要.push(`上衣:${服装.上衣状态}`);
    if (服装.下装状态) 服装摘要.push(`下装:${服装.下装状态}`);
    if (服装.内衣状态) 服装摘要.push(`内衣:${服装.内衣状态}`);
    if (服装.内裤状态) 服装摘要.push(`内裤:${服装.内裤状态}`);
    if (服装.袜饰状态) 服装摘要.push(`袜饰:${服装.袜饰状态}`);
    if (服装摘要.length > 0) {
      lines.push(`服装状态: ${服装摘要.join(', ')}`);
    }
  }

  // NSFW 行为特征
  if (npc.NSFW行为特征) {
    const 特征 = npc.NSFW行为特征;
    lines.push(`主动程度: ${特征.主动程度}`);
    if (特征.反差偏好) lines.push(`反差: ${特征.反差偏好}`);
    if (特征.特殊癖好) lines.push(`癖好: ${特征.特殊癖好}`);
    lines.push(`叙事锚点: ${特征.叙事锚点}`);
  }

  // 里象修行叙事约束（Level 5 时注入）
  if (亲密度等级 >= 5) {
    const 叙事约束 = 构建里象修行叙事约束(nsfw场景类型);
    if (叙事约束) {
      lines.push(叙事约束);
    }
  }

  return lines.join('\n');
};

/**
 * 批量构建在场 NPC 的 NSFW 角色卡片组
 * @param npcs - NPC 数组
 * @param nsfw场景类型 - NSFW 场景档位
 * @returns 完整的角色卡片块
 */
export const 构建在场NPC_NSWF卡片组 = (
  npcs: NPC结构[],
  nsfw场景类型: NSFW场景类型
): string => {
  if (nsfw场景类型 === '无') return '';

  const 在场NPC = npcs.filter(npc => npc.是否在场 !== false);
  if (在场NPC.length === 0) return '';

  const cards = 在场NPC
    .map(npc => 构建NPC_NSWF卡片(npc, nsfw场景类型))
    .filter(Boolean);

  if (cards.length === 0) return '';

  return `【在场角色 NSFW 角色卡片】\n${cards.join('\n\n')}`;
};
