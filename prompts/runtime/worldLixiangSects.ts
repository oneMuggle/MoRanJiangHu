/**
 * 双修门派世界书注入
 * 
 * 根据 NSFW 场景类型在世界生成时注入双修门派设定
 */

import { NSFW场景类型 } from '../../models/system';

/** 武侠/修仙/志怪时代列表（使用双修门派设定的时代） */
const WUXIA_ERA_IDS = ['ancient_martial', 'ancient_xianxia', 'ancient_zhiguai'];

/**
 * 构建双修门派世界书
 * @param nsfw场景类型 - NSFW场景档位
 * @param options - 可选参数，包含时代配置ID用于检查是否适用
 * @returns 门派世界书文本（非'无'档位且武侠时代返回门派设定，否则返回空字符串）
 */
export const 构建双修门派世界书 = (nsfw场景类型: NSFW场景类型, options?: { 时代配置ID?: string }): string => {
  if (nsfw场景类型 === '无') {
    return '';
  }

  // 仅对武侠/修仙/志怪时代注入双修门派内容
  if (options?.时代配置ID && !WUXIA_ERA_IDS.includes(options.时代配置ID)) {
    return '';
  }

  return `
【双修门派设定】
本世界存在以"里象修行"为核心的邪派/旁门势力，它们将双修之道融入武学体系：

**合欢宗（正道旁门）**
- 门风：采阴补阳、采阳补阴，男女合修，以情欲为引，催动气机运转
- 修炼理念：讲究"情真意切"，双方必须心甘情愿方能修炼
- 功法特点：风险较低，收益稳定，适合正道人士
- 代表功法：血亲和鸣谱、阴阳交泰诀等
- 门派所在地：多在风景秀丽之地，门人多为容貌出众之辈

**血河宗（邪派）**
- 门风：采补之道，以掠夺他人精元为法，不讲情义
- 修炼理念：唯我独尊，不择手段
- 功法特点：收益较高但风险极大，可能遭遇正道追杀
- 代表功法：摧花铁掌、采补大法等
- 门派所在地：多在阴邪之地，门人行事狠辣

**天魔宫（魔道）**
- 门风：以魅惑之术配合双修，可同时提升悟性与心魔
- 修炼理念：修天魔妙相，夺天地精华
- 功法特点：提升悟性但易生心魔
- 代表功法：天魔妙相等

注：以上门派设定仅在 NSFW 场景类型非"无"时生效。若 NSFW 场景类型为"点到为止"，这些门派以"旁门左道"名义存在，不明确提及双修；若为"适度展开"或"完全展开"，可详细展开其双修功法体系。`;
};

/**
 * 获取双修门派在指定档位下的描述强度
 * @param nsfw场景类型 - NSFW场景档位
 * @returns 描述强度：'minimal' | 'moderate' | 'full'
 */
export const 获取门派描述强度 = (nsfw场景类型: NSFW场景类型): 'minimal' | 'moderate' | 'full' => {
  switch (nsfw场景类型) {
    case '无':
      return 'minimal';
    case '点到为止':
      return 'minimal';
    case '适度展开':
      return 'moderate';
    case '完全展开':
      return 'full';
    default:
      return 'minimal';
  }
};