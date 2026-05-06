// 都市网约车 NSFW 设置规范化

import type { 都市网约车NSFW设置 } from './index';
import { 默认都市网约车NSFW设置 } from './index';

const 读取布尔 = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const 合法NSFW强度 = ['微暗', '暧昧', '露骨'] as const;
const 合法场景强度 = ['关闭', '轻度', '中度', '深度'] as const;
const 合法后果严重度 = ['轻微', '中等', '严重', '毁灭'] as const;
const 合法触发频率 = ['低', '中', '高'] as const;

function 枚举校验<T extends string>(value: unknown, 合法值: readonly T[], fallback: T): T {
  return (合法值 as readonly string[]).includes(typeof value === 'string' ? value : '')
    ? (value as T)
    : fallback;
}

/**
 * 规范化都市网约车 NSFW 设置
 */
export function 规范化都市网约车NSFW设置(raw: Partial<都市网约车NSFW设置>): 都市网约车NSFW设置 {
  const s = 默认都市网约车NSFW设置;
  return {
    启用都市网约车NSFW系统: 读取布尔(raw.启用都市网约车NSFW系统, s.启用都市网约车NSFW系统),
    NSFW内容强度: 枚举校验(raw.NSFW内容强度, 合法NSFW强度, s.NSFW内容强度),
    启用醉酒乘客场景: 读取布尔(raw.启用醉酒乘客场景, s.启用醉酒乘客场景),
    醉酒场景强度: 枚举校验(raw.醉酒场景强度, 合法场景强度, s.醉酒场景强度),
    启用饮料下药场景: 读取布尔(raw.启用饮料下药场景, s.启用饮料下药场景),
    下药场景强度: 枚举校验(raw.下药场景强度, 合法场景强度, s.下药场景强度),
    启用深夜独处场景: 读取布尔(raw.启用深夜独处场景, s.启用深夜独处场景),
    启用后座暗示场景: 读取布尔(raw.启用后座暗示场景, s.启用后座暗示场景),
    启用停车场秘密场景: 读取布尔(raw.启用停车场秘密场景, s.启用停车场秘密场景),
    启用拼车暧昧场景: 读取布尔(raw.启用拼车暧昧场景, s.启用拼车暧昧场景),
    启用常客关系系统: 读取布尔(raw.启用常客关系系统, s.启用常客关系系统),
    启用行车记录仪系统: 读取布尔(raw.启用行车记录仪系统, s.启用行车记录仪系统),
    启用后果系统: 读取布尔(raw.启用后果系统, s.启用后果系统),
    后果严重程度: 枚举校验(raw.后果严重程度, 合法后果严重度, s.后果严重程度),
    启用平台处罚: 读取布尔(raw.启用平台处罚, s.启用平台处罚),
    启用网络传播: 读取布尔(raw.启用网络传播, s.启用网络传播),
    启用警察盘查: 读取布尔(raw.启用警察盘查, s.启用警察盘查),
    启用勒索威胁: 读取布尔(raw.启用勒索威胁, s.启用勒索威胁),
    NSFW行程触发频率: 枚举校验(raw.NSFW行程触发频率, 合法触发频率, s.NSFW行程触发频率),
  };
}
