/**
 * 校园 NSFW v1.1 露出系统
 * 露出等级、旁观者、紧张度、网络传播、校园活动
 */

import type { 里程碑类型, 校园NSFW地点 } from './core';

export type 露出偏好等级 = 0 | 1 | 2 | 3 | 4 | 5;

export interface 露出状态 {
  当前等级: 露出偏好等级;
  等级进度: number;
  最后一次露出尝试: string;
  成功露出次数: number;
  暴露失败次数: number;
  最大紧张度记录: number;
}

export interface 露出场景配置 {
  id: string;
  名称: string;
  描述: string;
  所需最低露出等级: 露出偏好等级;
  基础发现概率: number;
  紧张度基础值: number;
  周围人数范围: [number, number];
  适合互动: 里程碑类型[];
}

export type 旁观者反应 =
  | '假装没看到'
  | '偷拍记录'
  | '直接揭穿'
  | '传播流言'
  | '暗示嘲弄'
  | '未察觉';

export interface 旁观者 {
  id: string;
  类型: '普通同学' | '闺蜜好友' | '老师辅导员' | '情敌对手' | '室友';
  距离: '同桌邻座' | '对面附近' | '同一房间远处' | '路过经过';
  察觉概率: number;
  已察觉: boolean;
  反应?: 旁观者反应;
}

export interface 紧张度状态 {
  当前值: number;
  周围人数: number;
  互动强度系数: number;
  周围人状态: '正常上课' | '自由活动' | '正式集会' | '排队等待';
  NPC公开行为: '无' | '倾听' | '需要回应' | '正在发言' | '表演中';
}

export interface 网络流言状态 {
  当前等级: number;
  传播渠道: ('匿名论坛' | '校园群' | '社交媒体' | '截图流传')[];
  有无证据: boolean;
  最新传播时间: string;
  辟谣状态: '未辟谣' | '正在辟谣' | '已辟谣';
}

export interface 校园活动 {
  id: string;
  名称: string;
  时间段: [string, string];
  类型: '典礼' | '运动会' | '文化节' | '晚会' | '考试' | '毕业' | '郊游';
  规模: '班级' | '院系' | '全校' | '校外';
  专属场景: 校园NSFW地点[];
  参与NPC列表: string[];
}
