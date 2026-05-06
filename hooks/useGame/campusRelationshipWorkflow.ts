/**
 * 校园纪元 NPC 关系工作流
 * 负责关系互动的 AI 工作流编排
 */

import type { NPC结构 } from '../../models/domain/social';
import type {
  NPC关系数据,
  互动类型,
  关系类型,
} from '../../models/campusNSFW';
import {
  初始化NPC关系,
  从NPC初始化关系,
  执行关系互动,
  计算关系阶段,
  检查关系进展,
  解锁关系场景,
  设置独占标记,
  获取关系摘要,
} from './campusRelationshipEngine';
import type { 运行时提示词状态 } from './systemPromptBuilder';

/**
 * 执行关系互动工作流
 * 调用 AI 处理互动并更新关系
 */
export async function 执行关系互动工作流(参数: {
  npc: NPC结构;
  当前关系: NPC关系数据;
  互动类型: 互动类型;
  场景?: string;
  NPC性格?: string;
  对话历史?: string[];
}): Promise<{
  更新后关系: NPC关系数据;
  AI回复: string;
  叙事内容: string;
}> {
  const { npc, 当前关系, 互动类型, 场景, NPC性格, 对话历史 } = 参数;

  // 执行基础关系计算
  const 结果 = 执行关系互动(当前关系, 互动类型, 场景);

  // TODO: 调用 AI 生成叙事内容
  // 实际项目中这里会调用 textAIService 生成更丰富的叙事
  const 叙事内容 = 生成基础叙事(npc.姓名, 互动类型, 结果.变化值);

  return {
    更新后关系: 结果.更新后数据,
    AI回复: 生成AIReply(当前关系, 互动类型, npc.姓名),
    叙事内容,
  };
}

/**
 * 生成关系进展判定
 * 调用 AI 判定是否满足阶段推进条件
 */
export async function 生成关系进展判定(参数: {
  npc: NPC结构;
  当前关系: NPC关系数据;
}): Promise<{
  可进阶: boolean;
  当前阶段: 关系类型;
  下一阶段?: 关系类型;
  推进叙事?: string;
}> {
  const { npc, 当前关系 } = 参数;

  // 检查进展
  const 进展 = 检查关系进展(当前关系);

  // TODO: 调用 AI 生成推进叙事
  // 实际项目中这里会生成更丰富的进展叙事

  return {
    ...进展,
    推进叙事: 进展.可进阶
      ? `与${npc.姓名}的关系有了新的进展`
      : undefined,
  };
}

/**
 * 生成关系叙事
 * 为关系事件生成叙事文本
 */
export function 生成关系叙事(参数: {
  npc姓名: string;
  事件类型: string;
  变化值: { 好感度: number; 亲密度: number; 信任度: number; 感情值: number };
}): string {
  const { npc姓名, 事件类型, 变化值 } = 参数;

  const 正向变化 = 变化值.好感度 > 0;
  const 变化符号 = 正向变化 ? '+' : '';

  return `与${npc姓名}的${事件类型}：好感度${变化符号}${变化值.好感度}，亲密度${变化符号}${变化值.亲密度}，信任度${变化符号}${变化值.信任度}，感情值${变化符号}${变化值.感情值}`;
}

/**
 * 生成关系互动提示词
 * 构建用于 AI 的关系互动上下文
 */
export function 构建关系互动提示词(参数: {
  npc: NPC结构;
  当前关系: NPC关系数据;
  场景?: string;
  互动类型?: 互动类型;
}): string {
  const { npc, 当前关系, 场景, 互动类型 } = 参数;

  const 关系摘要 = 获取关系摘要(当前关系);
  const 阶段 = 计算关系阶段(当前关系);

  let 提示词 = `【NPC关系状态】
NPC: ${npc.姓名}
当前关系阶段: ${阶段}
${关系摘要}
`;

  if (场景) {
    提示词 += `当前场景: ${场景}\n`;
  }

  if (互动类型) {
    提示词 += `互动类型: ${互动类型}\n`;
  }

  if (npc.核心性格特征) {
    提示词 += `NPC性格特征: ${npc.核心性格特征}\n`;
  }

  if (当前关系.解锁场景.length > 0) {
    提示词 += `已解锁场景: ${当前关系.解锁场景.join(', ')}\n`;
  }

  if (当前关系.关键事件.length > 0) {
    提示词 += `近期事件:\n`;
    const 最近事件 = 当前关系.关键事件.slice(-3);
    最近事件.forEach((事件) => {
      提示词 += `  - ${事件.时间}: ${事件.标题}\n`;
    });
  }

  return 提示词;
}

/**
 * 构建关系进展提示词
 * 用于 AI 判定关系阶段推进
 */
export function 构建关系进展提示词(参数: {
  npc: NPC结构;
  当前关系: NPC关系数据;
}): string {
  const { npc, 当前关系 } = 参数;

  const 进展 = 检查关系进展(当前关系);
  const 阶段阈值 = 进展.当前阶段
    ? `陌生→相识→好感→亲密→恋人`
    : '未知';

  let 提示词 = `【关系进展判定】
NPC: ${npc.姓名}
当前阶段: ${进展.当前阶段}
阶段顺序: ${阶段阈值}
`;

  if (进展.下一阶段) {
    提示词 += `下一阶段: ${进展.下一阶段}\n`;
    提示词 += `是否满足进阶条件: ${进展.可进阶 ? '是' : '否'}\n`;
  }

  return 提示词;
}

/**
 * 生成基础叙事
 */
function 生成基础叙事(
  npc姓名: string,
  互动类型: 互动类型,
  变化值: { 好感度: number; 亲密度: number; 信任度: number; 感情值: number }
): string {
  const 正向 = 变化值.好感度 > 0;
  const 符号 = 正向 ? '+' : '';

  const 叙事映射: Record<互动类型, string> = {
    '对话': `与${npc姓名}进行了愉快的交谈。`,
    '送礼': `送给${npc姓名}一份礼物。`,
    '邀约': `邀请${npc姓名}一起外出。`,
    '任务帮助': `帮助${npc姓名}完成任务。`,
    '亲密互动': `与${npc姓名}有了亲密的接触。`,
    '冲突': `与${npc姓名}发生了争执。`,
  };

  let 叙事 = 叙事映射[互动类型] || `与${npc姓名}进行了互动。`;

  叙事 += ` 关系数值变化: 好感${符号}${变化值.好感度}，亲密度${符号}${变化值.亲密度}，信任${符号}${变化值.信任度}，感情${符号}${变化值.感情值}`;

  return 叙事;
}

/**
 * 生成 AI 回复
 */
function 生成AIReply(
  当前关系: NPC关系数据,
  互动类型: 互动类型,
  npc姓名: string
): string {
  const 阶段 = 计算关系阶段(当前关系);

  // 根据关系阶段和互动类型生成不同风格的回复
  if (互动类型 === '冲突') {
    return `虽然有些不快，但${npc姓名}似乎愿意和你沟通解决这个问题。`;
  }

  if (阶段 === '陌生') {
    return `${npc姓名}礼貌地回应了你的互动。`;
  }

  if (阶段 === '相识') {
    return `${npc姓名}愉快地回应了你的互动。`;
  }

  if (阶段 === '好感' || 阶段 === '亲密') {
    return `${npc姓名}对你的互动表现出了积极的态度。`;
  }

  if (阶段 === '恋人') {
    return `${npc姓名}甜蜜地回应了你的互动。`;
  }

  return `${npc姓名}接受了你的互动。`;
}

/**
 * 验证关系数据完整性
 * 确保关系数据符合规范
 */
export function 验证关系数据完整性(数据: NPC关系数据): boolean {
  return (
    typeof 数据.npcId === 'string' &&
    typeof 数据.关系类型 === 'string' &&
    typeof 数据.关系状态 === 'string' &&
    typeof 数据.好感度 === 'number' &&
    typeof 数据.亲密度 === 'number' &&
    typeof 数据.信任度 === 'number' &&
    typeof 数据.感情值 === 'number' &&
    Array.isArray(数据.关键事件) &&
    Array.isArray(数据.解锁场景)
  );
}

/**
 * 获取关系状态颜色
 * 用于 UI 显示
 */
export function 获取关系状态颜色(阶段: 关系类型): string {
  const 颜色映射: Record<关系类型, string> = {
    '陌生': '#9CA3AF',
    '相识': '#60A5FA',
    '好感': '#34D399',
    '亲密': '#FBBF24',
    '恋人': '#F472B6',
    '挚友': '#A78BFA',
  };
  return 颜色映射[阶段] || '#9CA3AF';
}
