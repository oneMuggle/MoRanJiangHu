/**
 * 校园 NSFW v1.6 BDSM 关系管线 — 见面场景工作流
 *
 * 负责见面场景 prompt 构建和见面结果处理
 * 见面由主剧情 AI 生成，本文件提供状态注入和结果解析
 */

import type {
  契约类型,
  关系阶段,
  BDSM调教任务,
} from '../../models/campusNSFW';

// ============================================================
// 见面场景 Prompt 构建
// ============================================================

export interface 见面场景上下文 {
  NPC姓名: string;
  NPC性格特征?: string;
  关系阶段: 关系阶段;
  服从度: number;
  权力倾向: string;
  契约类型: 契约类型 | '未缔结';
  契约条款?: string[];
  安全词: string;
  底线列表: string[];
  见面地点?: string;
  见面时间?: string;
  私聊协商摘要?: string;
  历史任务摘要?: string;
  已解锁场景: string[];
}

export function 构建见面场景提示词(上下文: 见面场景上下文): string {
  const {
    NPC姓名,
    NPC性格特征,
    关系阶段,
    服从度,
    权力倾向,
    契约类型,
    契约条款,
    安全词,
    底线列表,
    见面地点,
    见面时间,
    私聊协商摘要,
    历史任务摘要,
    已解锁场景,
  } = 上下文;

  const parts: string[] = [];

  parts.push('## 角色信息');
  parts.push(`- NPC 姓名：${NPC姓名}`);
  if (NPC性格特征) parts.push(`- 性格特征：${NPC性格特征}`);

  parts.push('\n## 关系状态');
  parts.push(`- 关系阶段：${关系阶段}`);
  parts.push(`- 服从度：${服从度}/100`);
  parts.push(`- 权力倾向：${权力倾向}`);

  if (契约类型 !== '未缔结') {
    parts.push('\n## 契约信息');
    parts.push(`- 契约类型：${契约类型}`);
    if (契约条款 && 契约条款.length > 0) {
      parts.push(`- 契约条款：${契约条款.join('、')}`);
    }
    parts.push(`- 安全词：${安全词}`);
    if (底线列表.length > 0) {
      parts.push(`- 底线：${底线列表.join('、')}`);
    }
  }

  if (见面地点) parts.push(`\n## 见面地点：${见面地点}`);
  if (见面时间) parts.push(`## 见面时间：${见面时间}`);
  if (私聊协商摘要) parts.push(`\n## 私聊协商摘要\n${私聊协商摘要}`);
  if (历史任务摘要) parts.push(`\n## 近期任务摘要\n${历史任务摘要}`);

  if (已解锁场景.length > 0) {
    parts.push(`\n## 已解锁场景类型`);
    parts.push(已解锁场景.join('、'));
  }

  parts.push('\n## 叙事要求');
  parts.push('1. 以第三人称叙事视角生成见面场景');
  parts.push('2. 根据关系阶段调整亲密程度和对话风格');
  parts.push('3. 体现契约约定的条款和安全词的重要性');
  parts.push('4. 尊重双方底线，不越界');
  parts.push('5. 场景要有氛围感和情绪张力');
  parts.push('6. 给出 2-3 个互动选项供玩家选择');

  // 关系阶段叙事指引
  const 阶段指引: Record<string, string> = {
    '初识': '初次正式见面，氛围应该是谨慎而带有试探性的。双方都在观察对方的真实面目是否与网上相符。',
    '试探': '已有初步信任，但仍保留一些距离感。可以有轻微的暧昧互动，但不会过于直接。',
    '确立': '信任已经建立，互动更加自然和亲密。可以出现明确的服从/支配互动。',
    '深入': '深度信任关系，互动可以更加大胆和深入。场景可以包含较复杂的调教元素。',
    '固化': '完全投入的关系，身份认同已经形成。场景应该体现深度的信任和默契。',
  };

  if (阶段指引[关系阶段]) {
    parts.push(`\n## 当前阶段叙事指引`);
    parts.push(阶段指引[关系阶段]);
  }

  return parts.join('\n');
}

// ============================================================
// 见面结果解析
// ============================================================

export interface 见面结果 {
  见面成功: boolean;
  关系阶段变更?: 关系阶段;
  服从度变化?: number;
  权力天平变化?: number;
  新里程碑?: string;
  契约变更?: { 类型: 契约类型; 条款: string[] };
  后续任务建议?: string[];
  场景描述: string;
}

export function 解析见面结果(rawText: string): 见面结果 {
  const trimmed = rawText.trim();

  // 尝试提取 JSON
  const jsonStr = extractJsonObject(trimmed);

  if (jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      return {
        见面成功: parsed.meetingSuccess !== false,
        关系阶段变更: parsed.stageChange || undefined,
        服从度变化: typeof parsed.obedienceChange === 'number' ? parsed.obedienceChange : undefined,
        权力天平变化: typeof parsed.powerChange === 'number' ? parsed.powerChange : undefined,
        新里程碑: parsed.newMilestone || undefined,
        契约变更: parsed.contractChange ? {
          类型: parsed.contractChange.type as 契约类型,
          条款: parsed.contractChange.clauses || [],
        } : undefined,
        后续任务建议: Array.isArray(parsed.taskSuggestions) ? parsed.taskSuggestions : undefined,
        场景描述: parsed.sceneDescription || trimmed.slice(0, 500),
      };
    } catch {
      // JSON 解析失败，回退到文本解析
    }
  }

  // 回退：从文本中提取基本信息
  return {
    见面成功: true,
    场景描述: trimmed.slice(0, 1000),
  };
}

// ============================================================
// 日常指令管理
// ============================================================

export type 日常指令 = {
  content: string;
  category: string;
  duration: string;
  是否完成: boolean;
  rewardHint: string;
  punishmentHint: string;
};

export function 刷新日常指令(
  现有指令: 日常指令[],
  _当前回合: number,
  _指令持续时间回合: number = 3
): 日常指令[] {
  return 现有指令.filter(指令 => {
    // 已完成的指令移除，未完成的保留
    return !指令.是否完成;
  });
}

export function 更新指令完成状态(
  指令列表: 日常指令[],
  完成的内容: string
): 日常指令[] {
  return 指令列表.map(指令 => {
    if (指令.content === 完成的内容 && !指令.是否完成) {
      return { ...指令, 是否完成: true };
    }
    return 指令;
  });
}

// ============================================================
// 任务管理辅助函数
// ============================================================

export function 创建调教任务(
  类型: BDSM调教任务['类型'],
  标题: string,
  描述: string,
  难度: BDSM调教任务['难度'],
  发布者: string,
  接受者: string,
  服从度变化: number,
  奖励描述?: string,
  惩罚描述?: string,
  关联场景?: BDSM调教任务['关联场景']
): Omit<BDSM调教任务, 'id' | '状态' | '发布时间'> {
  return {
    类型,
    标题,
    描述,
    难度,
    发布者,
    接受者,
    服从度变化,
    奖励描述,
    惩罚描述,
    关联场景,
  };
}

export function 获取活跃任务(
  任务列表: BDSM调教任务[],
  最大数量: number = 5
): BDSM调教任务[] {
  return 任务列表
    .filter(t => t.状态 === '进行中' || t.状态 === '待接受')
    .slice(0, 最大数量);
}

export function 生成任务摘要(任务列表: BDSM调教任务[]): string {
  if (任务列表.length === 0) return '当前没有活跃任务。';

  return 任务列表.map(t => {
    const 状态文本 = t.状态 === '进行中' ? '进行中' : '待接受';
    return `- [${t.标题}] (${状态文本}, ${t.难度})：${t.描述.slice(0, 50)}`;
  }).join('\n');
}

// ============================================================
// JSON 提取工具
// ============================================================

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
