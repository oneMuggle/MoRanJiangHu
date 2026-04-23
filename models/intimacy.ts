import type { NPC结构 } from './social';

/**
 * 亲密互动系统类型定义
 * 
 * 最小侵入式设计：
 * - 不修改现有 NPC结构 接口
 * - 使用纯函数进行计算，不依赖副作用
 * - 新增字段作为可选扩展
 */

// ==================== 类型定义 ====================

/** 亲密互动类型 */
export type 亲密互动类型 = 
  | '调情'    // Lv1: 言语调情、轻触
  | '拥抱'    // Lv2: 拥抱、亲吻
  | '抚摸'   // Lv3: 抚摸、亲密接触
  | '亲密'    // Lv4: 亲密互动
  | '双修';   // Lv5: 深度亲密/双修

/** 亲密互动记录 */
export interface 亲密互动记录 {
  时间: string;           // ISO时间戳
  类型: 亲密互动类型;
  描述: string;
  npcId: string;        // 关联的NPC ID
  获得奖励?: 属性奖励结构;
}

/** 属性奖励结构 */
export interface 属性奖励结构 {
  属性类型: '力量' | '敏捷' | '体质' | '根骨' | '悟性' | '福源';
  数值: number;          // 1-3点
}

/** NPC亲密度信息（计算属性，非持久化） */
export interface NPC亲密度信息 {
  好感度: number;       // 0-100 来自 NPC结构
  亲密度等级: number;   // 1-5 计算属性
  可解锁互动列表: 亲密互动类型[]; // 基于等级可触发的互动
}

/** 亲密互动选项 */
export interface 亲密互动选项 {
  类型: 亲密互动类型;
  等级要求: number;      // 1-5
  名称: string;
  描述: string;
}

/** 触发条件 */
export interface 触发条件 {
  类型: '地点' | '事件' | '主动';
  位置?: string;         // 地点名称（地点触发）
  事件名?: string;       // 事件名称（事件触发）
  npcId?: string;        // NPC ID（事件触发）
}

// ==================== 常量定义 ====================

/** 亲密度等级阈值 */
export const 亲密度等级阈值 = [0, 20, 40, 60, 80, 100] as const;

/** 亲密互动选项列表 */
export const 亲密互动选项列表: 亲密互动选项[] = [
  { 类型: '调情', 等级要求: 1, 名称: '调情', 描述: '言语互动，轻微身体接触' },
  { 类型: '拥抱', 等级要求: 2, 名称: '拥抱', 描述: '拥抱、亲吻等亲密举动' },
  { 类型: '抚摸', 等级要求: 3, 名称: '抚摸', 描述: '抚摸、亲密身体接触' },
  { 类型: '亲密', 等级要求: 4, 名称: '亲密', 描述: '深度亲密互动' },
  { 类型: '双修', 等级要求: 5, 名称: '双修', 描述: '双修功法，属性提升' },
] as const;

// ==================== 纯函数 ====================

/**
 * 计算亲密度等级
 * @param 好感度 - NPC好感度（0-100）
 * @returns 亲密度等级（1-5）
 */
export function 计算亲密度等级(好感度: number): number {
  if (好感度 < 0) return 1;
  if (好感度 >= 100) return 5;
  return Math.floor(好感度 / 20) + 1;
}

/**
 * 检查是否可触发特定互动
 * @param 亲密度等级 - NPC当前亲密度等级
 * @param 互动所需等级 - 互动要求的等级
 * @returns 是否可触发
 */
export function 是否可触发互动(亲密度等级: number, 互动所需等级: number): boolean {
  return 亲密度等级 >= 互动所需等级;
}

/**
 * 获取NPC亲密度信息
 * @param npc - NPC结构实例
 * @returns 亲密度信息
 */
export function 获取NPC亲密度信息(npc: NPC结构): NPC亲密度信息 {
  const 等级 = 计算亲密度等级(npc.好感度);
  const 可解锁列表 = 亲密互动选项列表
    .filter(opt => 等级 >= opt.等级要求)
    .map(opt => opt.类型);
  
  return {
    好感度: npc.好感度,
    亲密度等级: 等级,
    可解锁互动列表: 可解锁列表,
  };
}

/**
 * 获取可触发的互动选项
 * @param 亲密度等级 - NPC当前亲密度等级
 * @returns 可触发的互动选项列表
 */
export function 获取可触发互动选项(亲密度等级: number): 亲密互动选项[] {
  return 亲密互动选项列表.filter(opt => 亲密度等级 >= opt.等级要求);
}

/**
 * 获取互动等级要求
 * @param 互动类型 - 亲密互动类型
 * @returns 所需等级
 */
export function 获取互动等级要求(互动类型: 亲密互动类型): number {
  const 选项 = 亲密互动选项列表.find(opt => opt.类型 === 互动类型);
  return 选项?.等级要求 ?? 1;
}

/**
 * 生成亲密互动记录
 * @param npcId - NPC ID
 * @param 类型 - 互动类型
 * @param 描述 - 描述文本
 * @param 奖励 - 可选的属性奖励
 * @returns 亲密互动记录
 */
export function 生成亲密互动记录(
  npcId: string,
  类型: 亲密互动类型,
  描述: string,
  奖励?: 属性奖励结构
): 亲密互动记录 {
  return {
    时间: new Date().toISOString(),
    npcId,
    类型,
    描述,
    ...(奖励 && { 获得奖励: 奖励 }),
  };
}

/**
 * 随机生成属性奖励（双修用）
 * @returns 属性奖励结构
 */
export function 生成双修奖励(): 属性奖励结构 {
  const 属性列表: 属性奖励结构['属性类型'][] = ['力量', '敏捷', '体质', '根骨', '悟性', '福源'];
  const 随机属性 = 属性列表[Math.floor(Math.random() * 属性列表.length)];
  const 随机数值 = Math.floor(Math.random() * 3) + 1; // 1-3点
  
  return {
    属性类型: 随机属性,
    数值: 随机数值,
  };
}