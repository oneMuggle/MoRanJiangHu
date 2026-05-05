// 校园纪元 NSFW 引擎 — v1.5 BDSM 论坛子系统
// 纯函数层：帖子影响计算、寻主召奴联系判定、流言传播

import type {
  BDSM论坛帖子,
  BDSM影响记录,
  寻主召奴联系会话,
  联系状态,
} from '../../models/campusNSFW/bdsm-forum';
import type { NPC欲望档案, 欲望阶段 } from '../../models/campusNSFW/core';
import type { NPC结构 } from '../../models/domain/social';

// ==================== 常量定义 ====================

const BDSM单贴最大推进值 = 10;
const 联系基础成功概率 = 0.6;

const 欲望阶段联系修正: Record<欲望阶段, number> = {
  '克制': -0.2,
  '试探': -0.05,
  '渴望': 0.1,
  '沉沦': 0.2,
  '支配': 0.15,
};

const 内容强度修正: Record<string, number> = {
  '关闭': 0,
  '轻度': 0.5,
  '中度': 1.0,
  '深度': 1.5,
};

// ==================== 帖子对 NPC 的影响 ====================

export function 计算BDSM帖子对NPC影响(参数: {
  帖子: BDSM论坛帖子;
  内容强度: '关闭' | '轻度' | '中度' | '深度';
}): number {
  const { 帖子, 内容强度 } = 参数;
  if (内容强度 === '关闭') return 0;

  const 基础值 = 帖子.影响等级 === '严重' ? 8
    : 帖子.影响等级 === '中等' ? 5
    : 2;

  const 修正 = 内容强度修正[内容强度] ?? 1.0;
  const 随机波动 = 0.8 + Math.random() * 0.4;

  return Math.min(BDSM单贴最大推进值, Math.round(基础值 * 修正 * 随机波动));
}

export function 计算BDSM帖子总影响(参数: {
  帖子列表: BDSM论坛帖子[];
  内容强度: '关闭' | '轻度' | '中度' | '深度';
}): { 总推进值: number; 影响明细: { 帖子ID: string; 推进值: number }[] } {
  const { 帖子列表, 内容强度 } = 参数;
  const 上限 = 30;

  const 影响明细 = 帖子列表.map(帖子 => ({
    帖子ID: 帖子.id,
    推进值: 计算BDSM帖子对NPC影响({ 帖子, 内容强度 }),
  }));

  const 总推进值 = Math.min(上限, 影响明细.reduce((sum, d) => sum + d.推进值, 0));
  return { 总推进值, 影响明细 };
}

export function 应用BDSM帖子影响(参数: {
  NPC档案: NPC欲望档案;
  推进值: number;
}): { 更新后档案: NPC欲望档案; 阶段升级: boolean } {
  const { NPC档案, 推进值 } = 参数;
  const 新进度 = Math.min(100, NPC档案.阶段进度 + 推进值);
  const 欲望阶段列表: 欲望阶段[] = ['克制', '试探', '渴望', '沉沦', '支配'];
  const 当前索引 = 欲望阶段列表.indexOf(NPC档案.当前阶段);
  let 新阶段 = NPC档案.当前阶段;
  let 阶段升级 = false;

  if (新进度 >= 100 && 当前索引 < 欲望阶段列表.length - 1) {
    新阶段 = 欲望阶段列表[当前索引 + 1];
    阶段升级 = true;
  }

  return {
    更新后档案: {
      ...NPC档案,
      当前阶段: 新阶段,
      阶段进度: 阶段升级 ? 0 : 新进度,
    },
    阶段升级,
  };
}

// ==================== 寻主召奴联系系统 ====================

export function 判定寻主召奴联系结果(参数: {
  玩家欲望阶段: 欲望阶段;
  内容强度: '关闭' | '轻度' | '中度' | '深度';
  玩家社交NPC数: number;
}): { 结果: 联系状态; 成功概率: number } {
  const { 玩家欲望阶段, 内容强度 } = 参数;
  if (内容强度 === '关闭') return { 结果: '已拒绝', 成功概率: 0 };

  let 概率 = 联系基础成功概率;
  概率 += 欲望阶段联系修正[玩家欲望阶段] ?? 0;

  if (参数.玩家社交NPC数 > 20) 概率 -= 0.1;
  if (参数.玩家社交NPC数 > 30) 概率 -= 0.15;

  概率 = Math.max(0.1, Math.min(0.9, 概率));
  const 成功 = Math.random() < 概率;

  return { 结果: 成功 ? '沟通中' : '已拒绝', 成功概率: 概率 };
}

export function 生成联系初始对话(帖子: BDSM论坛帖子): string {
  const 招募信息 = 帖子.寻主召奴信息;
  if (!招募信息) return '你好，看到你的帖子了。';

  const 招呼语: Record<string, string> = {
    '寻主': '你好，我看到你的帖子了。我正在寻找一个值得追随的人。',
    '召奴': '你好，我对你的帖子很感兴趣。我在寻找一个愿意跟随我的人。',
    '不限': '你好，我看到你的帖子了。我对你的想法很感兴趣，想进一步了解。',
  };
  return 招呼语[招募信息.招募方角色] || 招呼语['不限'];
}

export function 创建联系会话(帖子ID: string): 寻主召奴联系会话 {
  return {
    帖子ID,
    对话记录: [],
    开始时间: new Date().toISOString(),
    结果: '未联系',
  };
}

export function 确认联系成功(参数: {
  会话: 寻主召奴联系会话;
  帖子: BDSM论坛帖子;
}): { NPC姓名: string; NPCID: string; 描述: string } {
  const { 会话, 帖子 } = 参数;
  const 姓名 = 帖子.寻主召奴信息?.解锁NPC姓名 || 帖子.作者;
  const ID = 帖子.寻主召奴信息?.['关联NPC ID'] || `npc-bdsm-${Date.now()}`;

  会话.结果 = '关系建立';
  会话['解锁NPC ID'] = ID;
  会话.解锁NPC姓名 = 姓名;

  return { NPC姓名: 姓名, NPCID: ID, 描述: `通过论坛联系建立了新的关系：${姓名}` };
}

// ==================== 流言传播 ====================

export function 计算BDSM流言传播(参数: {
  帖子列表: BDSM论坛帖子[];
  当前流言等级: number;
  启用流言传播: boolean;
}): number {
  const { 帖子列表, 当前流言等级, 启用流言传播 } = 参数;
  if (!启用流言传播) return 当前流言等级;

  const 严重帖数 = 帖子列表.filter(p => p.影响等级 === '严重').length;
  const 中等帖数 = 帖子列表.filter(p => p.影响等级 === '中等').length;
  const 增量 = Math.floor(严重帖数 / 2) + Math.floor(中等帖数 / 4);

  return Math.min(5, 当前流言等级 + 增量);
}

// ==================== 影响记录 ====================

export function 生成BDSM影响记录(参数: {
  帖子: BDSM论坛帖子;
  NPC姓名: string;
  影响类型: BDSM影响记录['影响类型'];
  描述: string;
}): BDSM影响记录 {
  const { 帖子, NPC姓名, 影响类型, 描述 } = 参数;
  return {
    id: `bdsm-impact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    帖子ID: 帖子.id,
    关联NPC姓名: NPC姓名,
    影响类型,
    影响描述: 描述,
    时间: new Date().toISOString(),
  };
}

// ==================== NPC 解锁 ====================

/**
 * 从寻主召奴帖子创建新 NPC 结构
 */
export function 从BDSM帖子创建NPC(帖子: BDSM论坛帖子): NPC结构 {
  const 姓名 = 帖子.寻主召奴信息?.解锁NPC姓名 || 帖子.作者;
  const ID = 帖子.寻主召奴信息?.['关联NPC ID'] || `npc-bdsm-${Date.now()}`;
  const 招募方 = 帖子.寻主召奴信息?.招募方角色 || '不限';

  // 根据帖子内容推断性别
  const 性别推断 = (() => {
    if (招募方 === '寻主') return '女';
    if (招募方 === '召奴') return '男';
    return '女'; // 默认
  })();

  // 从帖子标题/内容中提取关键词作为身份
  const 身份 = 帖子.寻主召奴信息?.期望关系类型 || '论坛匿名用户';

  return {
    id: ID,
    姓名,
    性别: 性别推断,
    年龄: 20,
    境界: '',
    身份,
    是否在场: false,
    是否队友: false,
    是否主要角色: false,
    好感度: 20,
    关系状态: '初识',
    简介: 帖子.内容.substring(0, 100),
    核心性格特征: '匿名发帖人',
    记忆: [],
  };
}
