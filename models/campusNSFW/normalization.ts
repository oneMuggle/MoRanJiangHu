// 校园 NSFW 设置规范化

import type { 校园NSFW设置 } from './index';
import { 默认校园NSFW设置 } from './index';

const 读取布尔 = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const 合法NSFW强度 = ['微暗', '暧昧', '露骨'] as const;
const 合法露出强度 = ['关闭', '轻度', '中度', '深度'] as const;
const 合法SM强度 = ['关闭', '轻度', '中度', '深度'] as const;
const 合法桌游强度 = ['关闭', '轻度', '中度', '深度'] as const;
const 合法校园祭强度 = ['关闭', '轻度', '中度', '深度'] as const;
const 合法权力倾向 = ['随机', 'NPC支配', 'NPC服从', '切换者'] as const;
const 合法活动频率 = ['关闭', '低', '中', '高'] as const;
const 合法桌游频率 = ['低', '中', '高'] as const;
const 合法校园祭频率 = ['每学期一次', '每学年一次', '随机'] as const;
const 合法BDSM强度 = ['关闭', '轻度', '中度', '深度'] as const;

function 枚举校验<T extends string>(value: unknown, 合法值: readonly T[], fallback: T): T {
  return (合法值 as readonly string[]).includes(typeof value === 'string' ? value : '')
    ? (value as T)
    : fallback;
}

/**
 * 规范化校园 NSFW 设置：处理用户输入的类型转换和校验
 */
export function 规范化校园NSFW设置(raw: Partial<校园NSFW设置>): 校园NSFW设置 {
  const s = 默认校园NSFW设置;
  return {
    启用校园NSFW深化系统: 读取布尔(raw.启用校园NSFW深化系统, s.启用校园NSFW深化系统),
    NSFW内容强度: 枚举校验(raw.NSFW内容强度, 合法NSFW强度, s.NSFW内容强度),
    启用后果系统: 读取布尔(raw.启用后果系统, s.启用后果系统),
    启用多角关系: 读取布尔(raw.启用多角关系, s.启用多角关系),
    启用露出系统: 读取布尔(raw.启用露出系统, s.启用露出系统),
    露出内容强度: 枚举校验(raw.露出内容强度, 合法露出强度, s.露出内容强度),
    启用公开隐秘侵犯: 读取布尔(raw.启用公开隐秘侵犯, s.启用公开隐秘侵犯),
    启用旁观者反应: 读取布尔(raw.启用旁观者反应, s.启用旁观者反应),
    启用网络传播: 读取布尔(raw.启用网络传播, s.启用网络传播),
    校园活动NSFW频率: 枚举校验(raw.校园活动NSFW频率, 合法活动频率, s.校园活动NSFW频率),
    启用SM系统: 读取布尔(raw.启用SM系统, s.启用SM系统),
    SM内容强度: 枚举校验(raw.SM内容强度, 合法SM强度, s.SM内容强度),
    启用契约系统: 读取布尔(raw.启用契约系统, s.启用契约系统),
    启用公开服从: 读取布尔(raw.启用公开服从, s.启用公开服从),
    权力天平初始倾向: 枚举校验(raw.权力天平初始倾向, 合法权力倾向, s.权力天平初始倾向),
    启用桌游NSFW: 读取布尔(raw.启用桌游NSFW, s.启用桌游NSFW),
    桌游NSFW强度: 枚举校验(raw.桌游NSFW强度, 合法桌游强度, s.桌游NSFW强度),
    启用密室逃脱NSFW: 读取布尔(raw.启用密室逃脱NSFW, s.启用密室逃脱NSFW),
    启用狼人杀NSFW: 读取布尔(raw.启用狼人杀NSFW, s.启用狼人杀NSFW),
    启用剧本杀NSFW: 读取布尔(raw.启用剧本杀NSFW, s.启用剧本杀NSFW),
    启用派对游戏NSFW: 读取布尔(raw.启用派对游戏NSFW, s.启用派对游戏NSFW),
    桌游触发频率: 枚举校验(raw.桌游触发频率, 合法桌游频率, s.桌游触发频率),
    启用校园祭NSFW: 读取布尔(raw.启用校园祭NSFW, s.启用校园祭NSFW),
    校园祭NSFW强度: 枚举校验(raw.校园祭NSFW强度, 合法校园祭强度, s.校园祭NSFW强度),
    启用后夜祭告白: 读取布尔(raw.启用后夜祭告白, s.启用后夜祭告白),
    启用摊位NSFW: 读取布尔(raw.启用摊位NSFW, s.启用摊位NSFW),
    启用舞台NSFW: 读取布尔(raw.启用舞台NSFW, s.启用舞台NSFW),
    校园祭频率: 枚举校验(raw.校园祭频率, 合法校园祭频率, s.校园祭频率),
    启用BDSM论坛: 读取布尔(raw.启用BDSM论坛, s.启用BDSM论坛),
    BDSM内容强度: 枚举校验(raw.BDSM内容强度, 合法BDSM强度, s.BDSM内容强度),
    启用BDSM_NPC影响: 读取布尔(raw.启用BDSM_NPC影响, s.启用BDSM_NPC影响),
    启用BDSM_流言传播: 读取布尔(raw.启用BDSM_流言传播, s.启用BDSM_流言传播),
    启用BDSM关系管线: 读取布尔(raw.启用BDSM关系管线, s.启用BDSM关系管线),
    启用BDSM调教任务: 读取布尔(raw.启用BDSM调教任务, s.启用BDSM调教任务),
    启用BDSM契约系统: 读取布尔(raw.启用BDSM契约系统, s.启用BDSM契约系统),
  };
}
