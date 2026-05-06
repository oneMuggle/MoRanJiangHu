/**
 * MCN公会状态
 */

import type { MCN公会等级 } from '../types';

export type { MCN公会等级 };

export interface MCN公会状态 {
  公会ID: string;
  公会名称: string;
  公会等级: MCN公会等级;

  // 合同条款
  合同期限: number;         // 月数
  分成比例: number;          // 主播所得百分比
  最低直播时长: number;      // 每月最低小时数
  违约金条款: string;
  竞业禁止条款: boolean;    // 离职后是否禁止去其他公会

  // 资源支持
  流量扶持: number;          // 0-100，平台给的支持
  运营支持: '无' | '基础' | '专业' | '全方位';
  培训体系: boolean;         // 是否有培训

  // 公会主播
  主播数量: number;
  主播列表: string[];        // 主播ID列表
  头部主播ID?: string;       // 公会顶流主播
}

/**
 * 创建默认公会状态
 */
export function 创建默认公会状态(公会ID: string, 公会名称: string): MCN公会状态 {
  return {
    公会ID,
    公会名称,
    公会等级: '小公会',
    合同期限: 12,
    分成比例: 40,
    最低直播时长: 150,
    违约金条款: '提前解约需赔偿10万元',
    竞业禁止条款: false,
    流量扶持: 20,
    运营支持: '基础',
    培训体系: false,
    主播数量: 0,
    主播列表: [],
  };
}
