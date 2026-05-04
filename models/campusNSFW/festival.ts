/**
 * 校园 NSFW v1.4 校园祭系统
 * 摊位、舞台表演、后夜祭、校园祭状态
 */

import type { 关系轨道 } from './core';

export type 校园祭阶段 = '未开始' | '筹备期' | '预热期' | '举办期' | '收尾期' | '已结束';
export type 摊位类型 = '鬼屋' | '咖啡厅' | '女仆咖啡厅' | '执事咖啡厅' | '小吃摊' | '烧烤摊' | '展示类' | '游戏摊位';
export type 校园祭主题 = '经典校园祭' | '夏日祭' | '万圣节校园祭' | '冬季校园祭' | '毕业校园祭';
export type 舞台表演类型 = '合唱' | '舞蹈' | '话剧' | '才艺' | '乐队';

export interface 后夜祭状态 {
  类型: '篝火晚会' | '烟花大会' | '宿舍派对' | '自由派对';
  阶段: '进行中' | '告白时间' | '自由时间' | '散场';
  参与NPC: string[];
  已告白: boolean;
  告白对象?: string;
  告白结果?: '成功' | '拒绝' | '未告白';
  酒精影响: boolean;
  触发NSFW场景数: number;
  多角冲突发生: boolean;
  关系轨道变更: { NPCid: string; 新轨道: 关系轨道 }[];
}

export interface 校园祭状态 {
  阶段: 校园祭阶段;
  主题: 校园祭主题;
  班级摊位: 摊位类型;
  是否有舞台表演: boolean;
  舞台表演类型?: 舞台表演类型;
  筹备进度: number;
  已触发筹备NSFW: boolean;
  已触发摊位NSFW: boolean;
  已触发舞台NSFW: boolean;
  后夜祭状态?: 后夜祭状态;
  已解锁特殊场景: string[];
  服装试穿发生: boolean;
  排练独处发生: boolean;
  告白已发生: boolean;
  总NSFW场景数: number;
}
