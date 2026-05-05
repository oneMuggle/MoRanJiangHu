// 校园纪元·手机系统数据模型
// 定义论坛、聊天、课程、校园卡、社团、校规、催眠等系统的类型

import type { 校园NSFW系统扩展 } from './campusNSFW';

// === 论坛系统 ===

export interface 论坛帖子 {
    id: string;
    作者: string;
    标题: string;
    内容: string;
    分类: 论坛分类;
    发布时间: string;
    回复数: number;
    浏览数: number;
    点赞数: number;
    是否置顶: boolean;
    是否精华: boolean;
    回复列表: 论坛回复[];
}

export type 论坛分类 = '校园资讯' | '学术交流' | '社团活动' | '闲置交易' | '情感树洞' | '匿名灌水' | '求助答疑' | 'BDSM';

export interface 论坛回复 {
    id: string;
    作者: string;
    内容: string;
    回复时间: string;
    楼层: number;
}

// === 聊天系统 ===

export interface 私聊会话 {
    id: string;
    对方姓名: string;
    最后消息: string;
    最后时间: string;
    未读数: number;
    消息列表: 聊天消息[];
    关系类型: 私聊关系类型;
}

export type 私聊关系类型 = '同学' | '室友' | '学长学姐' | '导师' | '恋人' | '暧昧对象' | '社团同伴';

export interface 聊天消息 {
    id: string;
    发送者: string;
    内容: string;
    时间: string;
    是否已读: boolean;
}

// === 课程表 ===

export interface 课程表 {
    星期: string;
    课程列表: 课程[];
}

export interface 课程 {
    名称: string;
    地点: string;
    教师: string;
    时间段: string; // e.g. "1-2节"
}

// === 校园卡 ===

export interface 校园卡 {
    余额: number;
    消费记录: 消费记录[];
}

export interface 消费记录 {
    时间: string;
    地点: string;
    金额: number;
    类型: '食堂' | '超市' | '图书馆' | '打印店' | '其他';
}

// === 社团活动 ===

export interface 社团活动 {
    id: string;
    社团名称: string;
    活动名称: string;
    时间: string;
    地点: string;
    描述: string;
    参与人数: number;
}

// === 校规编辑器 ===

export interface 校规条目 {
    id: string;
    标题: string;
    内容: string;
    分类: 校规分类;
    生效日期: string;
    是否启用: boolean;
    影响程度: '轻微' | '中等' | '显著' | '深度';
}

export type 校规分类 = '行为规范' | '着装要求' | '作息制度' | '社交规范' | '特殊规定';

export interface 校规影响日志 {
    时间: string;
    校规ID: string;
    受影响NPC: string;
    影响描述: string;
}

// === 催眠App ===

export type 催眠类型 = '暗示植入' | '行为引导' | '记忆修改' | '认知扭曲' | '深度控制';

export interface 催眠能力 {
    类型: 催眠类型;
    最大指令长度: number;
    持续时间上限: string;
    描述: string;
    解锁等级: number;
}

export interface 催眠App等级 {
    当前等级: number; // 1-5
    已使用次数: number;
    升级阈值: number; // 达到后升级
    解锁能力: 催眠能力[]; // 当前等级可用的催眠类型
}

export interface 催眠记录 {
    id: string;
    目标NPC: string;
    催眠类型: 催眠类型;
    催眠指令: string;
    生效时间: string;
    持续时间: string; // e.g. "永久", "24小时", "直到解除"
    是否生效中: boolean;
    效果强度: number; // 0-100, 基于催眠App等级和目标抵抗力
}

export interface 催眠进化阶段 {
    阶段: number; // 1-5
    名称: string; // "入门", "熟练", "精通", "大师", "传说"
    描述: string;
    解锁能力: 催眠类型[];
    所需使用次数: number;
}

// === 催眠进化常量 ===

export const 催眠进化阶段表: 催眠进化阶段[] = [
    { 阶段: 1, 名称: '入门', 描述: '初窥催眠之门，仅能进行简单的暗示', 解锁能力: ['暗示植入'], 所需使用次数: 0 },
    { 阶段: 2, 名称: '熟练', 描述: '掌握了行为引导的技巧，可以引导NPC执行特定行为', 解锁能力: ['暗示植入', '行为引导'], 所需使用次数: 5 },
    { 阶段: 3, 名称: '精通', 描述: '能够修改目标的记忆，改变其对某些事物的认知', 解锁能力: ['暗示植入', '行为引导', '记忆修改'], 所需使用次数: 15 },
    { 阶段: 4, 名称: '大师', 描述: '可以扭曲目标的认知，使其接受不合常理的事物', 解锁能力: ['暗示植入', '行为引导', '记忆修改', '认知扭曲'], 所需使用次数: 30 },
    { 阶段: 5, 名称: '传说', 描述: '达到催眠的极致，完全控制目标的行为和思想', 解锁能力: ['暗示植入', '行为引导', '记忆修改', '认知扭曲', '深度控制'], 所需使用次数: 50 },
];

// === 校园系统上下文（用于 DeviceGameContext） ===

export interface 校园系统数据 {
    论坛帖子列表: 论坛帖子[];
    私聊会话列表: 私聊会话[];
    课程表: Record<string, 课程[]>;
    校园卡: 校园卡;
    社团活动列表: 社团活动[];
    // NSFW 深化系统扩展 (v1.0-v1.4)
    欲望系统?: 校园NSFW系统扩展['欲望系统'];
    // BDSM 论坛子系统 (v1.5)
    BDSM帖子列表?: import('./campusNSFW/bdsm-forum').BDSM论坛帖子[];
}
