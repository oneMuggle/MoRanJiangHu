// 写真 NSFW 设置规范化

import type { 写真NSFW设置 } from './index';
import { 默认写真NSFW设置 } from './index';

const 读取布尔 = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const 合法NSFW强度 = ['微暗', '暧昧', '露骨'] as const;
const 合法玩法层 = ['经营管理', '人际关系', '灰色地带'] as const;
const 合法频率 = ['低', '中', '高'] as const;

function 枚举校验<T extends string>(value: unknown, 合法值: readonly T[], fallback: T): T {
  return (合法值 as readonly string[]).includes(typeof value === 'string' ? value : '')
    ? (value as T)
    : fallback;
}

/**
 * 规范化写真 NSFW 设置：处理用户输入的类型转换和校验
 */
export function 规范化写真NSFW设置(raw: Partial<写真NSFW设置>): 写真NSFW设置 {
  const s = 默认写真NSFW设置;
  return {
    启用写真NSFW系统: 读取布尔(raw.启用写真NSFW系统, s.启用写真NSFW系统),
    NSFW内容强度: 枚举校验(raw.NSFW内容强度, 合法NSFW强度, s.NSFW内容强度),
    主要玩法层: 枚举校验(raw.主要玩法层, 合法玩法层, s.主要玩法层),
    次要玩法权重: typeof raw.次要玩法权重 === 'number' ? Math.max(0, Math.min(100, raw.次要玩法权重)) : s.次要玩法权重,
    启用道德选择: 读取布尔(raw.启用道德选择, s.启用道德选择),
    启用尺度递进: 读取布尔(raw.启用尺度递进, s.启用尺度递进),
    启用摄影师筛选: 读取布尔(raw.启用摄影师筛选, s.启用摄影师筛选),
    启用越界识别: 读取布尔(raw.启用越界识别, s.启用越界识别),
    启用安全词系统: 读取布尔(raw.启用安全词系统, s.启用安全词系统),
    启用照片交付: 读取布尔(raw.启用照片交付, s.启用照片交付),
    启用泄露事件: 读取布尔(raw.启用泄露事件, s.启用泄露事件),
    泄露事件频率: 枚举校验(raw.泄露事件频率, 合法频率, s.泄露事件频率),
  };
}
