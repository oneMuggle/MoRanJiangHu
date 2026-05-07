/**
 * 直播间状态
 */

import type { 直播平台, PK惩罚类型 } from '../types';

export interface PK状态 {
  对手ID: string;
  双方票数: [number, number];
  惩罚内容: PK惩罚类型;
  惩罚对象: '自己' | '对方';
}

export interface 直播间状态 {
  // 基础信息
  直播间ID: string;
  主播ID: string;
  平台: 直播平台;

  // 实时数据
  当前观众: number;
  峰值观众: number;
  累计观看: number;         // 本场累计观看人数
  当前收入: number;         // 本场累计打赏
  当前弹幕数: number;

  // 互动状态
  连麦状态: '无' | '发起连麦' | '接受连麦' | 'PK中';
  连麦对象ID?: string;
  PK状态?: PK状态;

  // 粉丝团状态
  当前粉丝团等级: number;   // 1-10级
  粉丝团目标完成度: number;  // 0-100%
  粉丝团成员在线: number;

  // 气氛指标
  弹幕密度: number;          // 每分钟弹幕数
  礼物密度: number;         // 每分钟礼物数
  气氛热度: number;         // 0-100，AI生成内容参考
}

/**
 * 创建默认直播间状态
 */
export function 创建默认直播间状态(直播间ID: string, 主播ID: string, 平台: 直播平台): 直播间状态 {
  return {
    直播间ID,
    主播ID,
    平台,
    当前观众: 0,
    峰值观众: 0,
    累计观看: 0,
    当前收入: 0,
    当前弹幕数: 0,
    连麦状态: '无',
    当前粉丝团等级: 1,
    粉丝团目标完成度: 0,
    粉丝团成员在线: 0,
    弹幕密度: 0,
    礼物密度: 0,
    气氛热度: 0,
  };
}
