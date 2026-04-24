/**
 * 亲密度动作约束动态注入
 * 
 * 根据 NPC 亲密度等级和 NSFW 场景档位动态注入动作约束
 */

import { NSFW场景类型 } from '../../models/system';
import { 适度展开描写规则, 委婉成语列表, getRandomEuphemism } from '../core/euphemisms';

/**
 * 根据亲密度等级动态注入动作约束
 * @param 亲密度等级 - NPC当前亲密度等级 (0-5)
 * @param nsfw场景类型 - NSFW场景档位
 * @returns 动作约束提示词
 */
export const 构建亲密度动作约束 = (
  亲密度等级: number,
  nsfw场景类型: NSFW场景类型
): string => {
  const constraints: string[] = [];

  // Level 0: 敌对/排斥状态
  if (亲密度等级 <= 0) {
    constraints.push('禁止任何身体接触与调情，保持敌对或冷漠距离');
    return constraints.join('；');
  }

  // 基础动作约束（所有等级）
  if (亲密度等级 >= 1) {
    constraints.push('允许言语调情、轻微身体接触、眼神交流');
  }
  if (亲密度等级 >= 2) {
    constraints.push('允许拥抱、亲吻');
  }
  if (亲密度等级 >= 3) {
    constraints.push('允许抚摸、亲密身体接触');
  }
  if (亲密度等级 >= 4) {
    constraints.push('允许深度亲密互动');
  }
  if (亲密度等级 >= 5) {
    constraints.push('允许双修（里象修行）');
    
    // 根据档位注入描写约束
    if (nsfw场景类型 === '点到为止') {
      const euphemism = getRandomEuphemism();
      constraints.push(
        `双修描写仅用委婉成语（如"${euphemism}"），不出现任何敏感词汇`,
        '以情感氛围为主，不描写具体身体接触',
        '用武侠叙事框架包装（气机运转、经脉感受等）'
      );
    } else if (nsfw场景类型 === '适度展开') {
      constraints.push(
        '双修描写用委婉词汇（玉茎/花径等），不出现明确词汇',
        '适度展开描写规则：' + 适度展开描写规则
      );
    } else if (nsfw场景类型 === '完全展开') {
      constraints.push(
        '双修描写可使用明确词汇（肉棒、小穴等），保留武侠叙事框架（气机运转、经脉感受）',
        '用武侠术语包装身体感受：气机/经脉/阴阳/精元等',
        '关注双方情感互动和内功修炼'
      );
    }
  }

  return constraints.join('；');
};

/**
 * 获取双修解锁状态
 * @param 亲密度等级 - NPC当前亲密度等级
 * @returns 是否可触发双修
 */
export const 可触发双修 = (亲密度等级: number): boolean => {
  return 亲密度等级 >= 5;
};

/**
 * 获取指定亲密度等级可用的最亲密动作
 * @param 亲密度等级 - NPC当前亲密度等级
 * @returns 最亲密动作名称
 */
export const 获取最亲密动作 = (亲密度等级: number): string => {
  if (亲密度等级 >= 5) return '双修';
  if (亲密度等级 >= 4) return '亲密';
  if (亲密度等级 >= 3) return '抚摸';
  if (亲密度等级 >= 2) return '拥抱';
  if (亲密度等级 >= 1) return '调情';
  return '无';
};