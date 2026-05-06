/**
 * 校园 NSFW v1.6 BDSM 关系管线 — 调教任务工作流
 *
 * 负责任务生成、日常指令生成、任务评价、契约生成、关系阶段推进
 * 所有函数通过 AI 调用生成内容，解析 JSON 返回
 */

import type { 当前可用接口结构 } from '../../utils/apiConfig';
import type {
  BDSM调教任务,
  BDSM日常指令,
  BDSM评价等级,
  契约类型,
  契约状态,
  SM场景类型,
} from '../../models/campusNSFW';
import { BDSM阶段要求 } from '../../models/campusNSFW/bdsmConstants';
import {
  构建调教任务生成提示词,
  构建日常指令生成提示词,
  构建任务完成评价提示词,
  构建契约条款生成提示词,
  构建关系阶段推进判定提示词,
} from '../../prompts/runtime/bdsmTasks';
import {
  type 通用消息,
  规范化文本补全消息链,
  请求模型文本,
} from '../../services/ai/chatCompletionClient';

// ============================================================
// 任务生成
// ============================================================

export interface 任务生成上下文 {
  契约类型: 契约类型;
  契约状态: 契约状态;
  服从度: number;
  权力倾向: string;
  关系阶段: string;
  已解锁场景: SM场景类型[];
  历史任务数量: number;
  上次任务评价?: BDSM评价等级;
  NPC性格特征?: string;
}

export async function 生成调教任务(
  上下文: 任务生成上下文,
  apiConfig: 当前可用接口结构 | null,
  signal?: AbortSignal
): Promise<Omit<BDSM调教任务, 'id' | '发布者' | '接受者' | '状态' | '发布时间'>[]> {
  if (!apiConfig) return [];

  const prompt = 构建调教任务生成提示词(上下文);

  const messages: 通用消息[] = 规范化文本补全消息链([
    {
      role: 'system',
      content: '你是一个调教任务生成器。请根据给定的上下文生成合适的调教任务。只输出 JSON 数组，不要其他内容。',
    },
    { role: 'user', content: prompt },
  ]);

  const rawText = await 请求模型文本(apiConfig, messages, {
    temperature: 0.8,
    signal,
  });

  const jsonStr = extractJsonArray(rawText);

  if (!jsonStr) {
    console.warn('AI 任务生成返回非 JSON 内容:', rawText.slice(0, 200));
    return [];
  }

  try {
    const parsed = JSON.parse(jsonStr) as Array<{
      type: string;
      title: string;
      description: string;
      difficulty: string;
      deadline: string;
      obedienceChange: number;
      rewardDescription: string;
      punishmentDescription: string;
    }>;

    return parsed.map(item => ({
      类型: item.type as BDSM调教任务['类型'],
      标题: item.title,
      描述: item.description,
      难度: item.difficulty as BDSM调教任务['难度'],
      截止时间: item.deadline,
      服从度变化: item.obedienceChange,
      奖励描述: item.rewardDescription,
      惩罚描述: item.punishmentDescription,
    }));
  } catch (e) {
    console.warn('AI 任务生成 JSON 解析失败:', e, rawText.slice(0, 300));
    return [];
  }
}

// ============================================================
// 日常指令生成
// ============================================================

export interface 日常指令生成上下文 {
  服从度: number;
  契约状态: 契约状态;
  关系阶段: string;
  已发布指令数: number;
  NPC性格特征?: string;
  当前时间?: string;
}

export async function 生成日常指令(
  上下文: 日常指令生成上下文,
  apiConfig: 当前可用接口结构 | null,
  signal?: AbortSignal
): Promise<BDSM日常指令[]> {
  if (!apiConfig) return [];

  const prompt = 构建日常指令生成提示词(上下文);

  const messages: 通用消息[] = 规范化文本补全消息链([
    {
      role: 'system',
      content: '你是一个日常指令生成器。请根据给定的上下文生成轻量日常指令。只输出 JSON 数组，不要其他内容。',
    },
    { role: 'user', content: prompt },
  ]);

  const rawText = await 请求模型文本(apiConfig, messages, {
    temperature: 0.7,
    signal,
  });

  const jsonStr = extractJsonArray(rawText);

  if (!jsonStr) {
    console.warn('AI 日常指令生成返回非 JSON 内容:', rawText.slice(0, 200));
    return [];
  }

  try {
    const parsed = JSON.parse(jsonStr) as Array<{
      content: string;
      category: string;
      duration: string;
      rewardHint: string;
      punishmentHint: string;
    }>;

    return parsed.map(item => ({
      内容: item.content || (item as any).内容 || '',
      分类: (item.category || (item as any).分类 || '行为') as BDSM日常指令['分类'],
      持续时间: item.duration || (item as any).持续时间 || '未知',
      是否完成: false,
      奖励提示: item.rewardHint || (item as any).奖励提示 || '',
      惩罚提示: item.punishmentHint || (item as any).惩罚提示 || '',
    }));
  } catch (e) {
    console.warn('AI 日常指令 JSON 解析失败:', e, rawText.slice(0, 300));
    return [];
  }
}

// ============================================================
// 任务完成评价
// ============================================================

export interface 任务评价结果 {
  评价: BDSM评价等级;
  服从度变化: number;
  反馈: string;
  后续影响: string;
  下一步建议: string;
}

export async function 评价任务完成(
  任务: { 类型: BDSM调教任务['类型']; 难度: BDSM调教任务['难度']; 描述: string },
  执行情况: string,
  当前服从度: number,
  NPC性格特征: string | undefined,
  apiConfig: 当前可用接口结构 | null,
  signal?: AbortSignal
): Promise<任务评价结果> {
  if (!apiConfig) {
    return {
      评价: '良好' as BDSM评价等级,
      服从度变化: 5,
      反馈: '任务基本完成。',
      后续影响: '关系保持稳定。',
      下一步建议: '继续保持。',
    };
  }

  const prompt = 构建任务完成评价提示词({
    任务类型: 任务.类型,
    任务难度: 任务.难度,
    任务描述: 任务.描述,
    执行情况描述: 执行情况,
    当前服从度,
    NPC性格特征,
  });

  const messages: 通用消息[] = 规范化文本补全消息链([
    {
      role: 'system',
      content: '你是一个任务评价器。请根据任务执行情况给出评价。只输出 JSON 对象，不要其他内容。',
    },
    { role: 'user', content: prompt },
  ]);

  const rawText = await 请求模型文本(apiConfig, messages, {
    temperature: 0.5,
    signal,
  });

  const jsonStr = extractJsonObject(rawText);

  if (!jsonStr) {
    console.warn('AI 任务评价返回非 JSON 内容:', rawText.slice(0, 200));
    return {
      评价: '良好' as BDSM评价等级,
      服从度变化: 5,
      反馈: '任务基本完成。',
      后续影响: '关系保持稳定。',
      下一步建议: '继续保持。',
    };
  }

  try {
    const parsed = JSON.parse(jsonStr) as {
      grade: string;
      obedienceChange: number;
      feedback: string;
      consequence: string;
      nextSuggestion: string;
    };

    return {
      评价: parsed.grade as BDSM评价等级,
      服从度变化: parsed.obedienceChange,
      反馈: parsed.feedback,
      后续影响: parsed.consequence,
      下一步建议: parsed.nextSuggestion,
    };
  } catch (e) {
    console.warn('AI 任务评价 JSON 解析失败:', e, rawText.slice(0, 300));
    return {
      评价: '良好' as BDSM评价等级,
      服从度变化: 5,
      反馈: '任务基本完成。',
      后续影响: '关系保持稳定。',
      下一步建议: '继续保持。',
    };
  }
}

// ============================================================
// 契约条款生成
// ============================================================

export interface 契约生成结果 {
  条款: string[];
  安全词: string;
  退出条件: string;
  有效期: string;
  双方义务: string;
}

export async function 生成契约条款(
  契约类型: 契约类型,
  关系阶段: string,
  服从度: number,
  权力倾向: string,
  双方底线: string[] | undefined,
  apiConfig: 当前可用接口结构 | null,
  signal?: AbortSignal
): Promise<契约生成结果> {
  if (!apiConfig) return 默认契约结果();

  const prompt = 构建契约条款生成提示词({
    契约类型,
    关系阶段,
    服从度,
    权力倾向,
    双方底线,
  });

  const messages: 通用消息[] = 规范化文本补全消息链([
    {
      role: 'system',
      content: '你是一个契约条款生成器。请根据给定的上下文生成契约条款。只输出 JSON 对象，不要其他内容。',
    },
    { role: 'user', content: prompt },
  ]);

  const rawText = await 请求模型文本(apiConfig, messages, {
    temperature: 0.6,
    signal,
  });

  const jsonStr = extractJsonObject(rawText);

  if (!jsonStr) {
    console.warn('AI 契约生成返回非 JSON 内容:', rawText.slice(0, 200));
    return 默认契约结果();
  }

  try {
    const parsed = JSON.parse(jsonStr) as {
      clauses: string[];
      safeWord: string;
      exitCondition: string;
      duration: string;
      mutualObligations: string;
    };

    return {
      条款: parsed.clauses,
      安全词: parsed.safeWord,
      退出条件: parsed.exitCondition,
      有效期: parsed.duration,
      双方义务: parsed.mutualObligations,
    };
  } catch (e) {
    console.warn('AI 契约 JSON 解析失败:', e, rawText.slice(0, 300));
    return 默认契约结果();
  }
}

function 默认契约结果(): 契约生成结果 {
  return {
    条款: ['使用特定称呼', '保守关系秘密'],
    安全词: '月光',
    退出条件: '任一方说出安全词即可立即终止',
    有效期: '直到双方同意解除',
    双方义务: '尊重彼此底线，保持沟通',
  };
}

// ============================================================
// 关系阶段推进判定
// ============================================================

export interface 关系阶段推进结果 {
  是否推进: boolean;
  下一阶段: string | null;
  理由: string;
  未满足条件: string[];
  标志性事件: string;
}

export async function 判定关系阶段推进(
  当前阶段: string,
  服从度: number,
  完成任务数: number,
  完美服从数: number,
  违约次数: number,
  契约类型: 契约类型,
  最近互动摘要: string,
  apiConfig: 当前可用接口结构 | null,
  signal?: AbortSignal
): Promise<关系阶段推进结果> {
  if (!apiConfig) {
    return 硬编码阶段判定(当前阶段, 服从度, 完成任务数, 完美服从数, 违约次数, 契约类型);
  }

  const prompt = 构建关系阶段推进判定提示词({
    当前阶段,
    服从度,
    完成任务数,
    完美服从数,
    违约次数,
    契约类型,
    最近互动摘要,
  });

  const messages: 通用消息[] = 规范化文本补全消息链([
    {
      role: 'system',
      content: '你是一个关系阶段判定器。请根据当前状态判定是否满足推进条件。只输出 JSON 对象，不要其他内容。',
    },
    { role: 'user', content: prompt },
  ]);

  const rawText = await 请求模型文本(apiConfig, messages, {
    temperature: 0.3,
    signal,
  });

  const jsonStr = extractJsonObject(rawText);

  if (!jsonStr) {
    return 硬编码阶段判定(当前阶段, 服从度, 完成任务数, 完美服从数, 违约次数, 契约类型);
  }

  try {
    const parsed = JSON.parse(jsonStr) as {
      shouldAdvance: boolean;
      nextStage: string | null;
      reason: string;
      missingConditions: string[];
      milestoneEvent: string;
    };

    return {
      是否推进: parsed.shouldAdvance,
      下一阶段: parsed.nextStage,
      理由: parsed.reason,
      未满足条件: parsed.missingConditions,
      标志性事件: parsed.milestoneEvent,
    };
  } catch (e) {
    console.warn('AI 阶段判定 JSON 解析失败，回退到硬编码规则:', e);
    return 硬编码阶段判定(当前阶段, 服从度, 完成任务数, 完美服从数, 违约次数, 契约类型);
  }
}

function 硬编码阶段判定(
  当前阶段: string,
  服从度: number,
  完成任务数: number,
  完美服从数: number,
  违约次数: number,
  契约类型: 契约类型
): 关系阶段推进结果 {
  const 阶段要求 = BDSM阶段要求[当前阶段];
  if (!阶段要求) {
    return { 是否推进: false, 下一阶段: null, 理由: '已达最终阶段', 未满足条件: [], 标志性事件: '' };
  }

  const 未满足: string[] = [];
  if (服从度 < 阶段要求.服从度) 未满足.push(`服从度 ${服从度}/${阶段要求.服从度}`);
  if (完成任务数 < 阶段要求.任务数) 未满足.push(`完成任务 ${完成任务数}/${阶段要求.任务数}`);
  if (完美服从数 < 阶段要求.完美服从) 未满足.push(`完美服从 ${完美服从数}/${阶段要求.完美服从}`);
  if (违约次数 > 阶段要求.最大违约) 未满足.push(`违约次数过多 (${违约次数}/${阶段要求.最大违约})`);

  const 满足要求 = 未满足.length === 0;

  return {
    是否推进: 满足要求,
    下一阶段: 满足要求 ? 阶段要求.下一阶段 : null,
    理由: 满足要求
      ? `满足所有条件，从「${当前阶段}」推进到「${阶段要求.下一阶段}」`
      : `尚未满足：${未满足.join('、')}`,
    未满足条件: 未满足,
    标志性事件: 满足要求 ? `${当前阶段}→${阶段要求.下一阶段} 关系进阶` : '',
  };
}

// ============================================================
// JSON 提取工具
// ============================================================

function extractJsonArray(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed.startsWith('[')) {
    const end = trimmed.lastIndexOf(']');
    if (end > 0) return trimmed.slice(0, end + 1);
  }

  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    const block = jsonBlockMatch[1].trim();
    if (block.startsWith('[')) {
      const end = block.lastIndexOf(']');
      if (end > 0) return block.slice(0, end + 1);
    }
  }

  const first = trimmed.indexOf('[');
  const last = trimmed.lastIndexOf(']');
  if (first !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return null;
}

function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed.startsWith('{')) {
    const end = trimmed.lastIndexOf('}');
    if (end > 0) return trimmed.slice(0, end + 1);
  }

  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    const block = jsonBlockMatch[1].trim();
    if (block.startsWith('{')) {
      const end = block.lastIndexOf('}');
      if (end > 0) return block.slice(0, end + 1);
    }
  }

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return null;
}
