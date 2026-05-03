// 角色成长与突破工作流
// 管理经验值获取、升级、属性点分配、境界突破

import { 角色数据结构 } from '../../models/domain/character';

// ---- 经验值系统 ----

export interface 经验值来源 {
    来源: string;
    经验值: number;
}

const 经验值来源倍率: Record<string, number> = {
    '战斗胜利': 1.0,
    '任务完成': 1.2,
    '亲密互动': 0.8,
    '修炼功法': 1.5,
    '探索发现': 0.6,
    '锻造成功': 0.5,
    '剧情推进': 1.0,
};

export function 计算获得经验值(来源: string, 基础值: number): number {
    const 倍率 = 经验值来源倍率[来源] ?? 1.0;
    return Math.round(基础值 * 倍率);
}

export function 获得经验值(角色: 角色数据结构, 来源: string, 基础值: number): 角色数据结构 {
    const 获得经验 = 计算获得经验值(来源, 基础值);
    const 新经验 = 角色.当前经验 + 获得经验;
    const 是否升级 = 新经验 >= 角色.升级经验;

    const 更新角色 = {
        ...角色,
        当前经验: 新经验,
    };

    if (是否升级) {
        return 处理升级(更新角色);
    }

    return 更新角色;
}

// ---- 升级系统 ----

export interface 升级结果 {
    是否升级: boolean;
    获得属性点: number;
    新等级?: number;
    新升级经验?: number;
}

function 处理升级(角色: 角色数据结构): 角色数据结构 {
    const 超出经验 = 角色.当前经验 - 角色.升级经验;
    const 新升级经验 = Math.round(角色.升级经验 * 1.1);
    const 获得属性点 = 3;

    return {
        ...角色,
        当前经验: Math.max(0, 超出经验),
        升级经验: 新升级经验,
        境界层级: 角色.境界层级 + 1,
        玩家BUFF: [
            ...角色.玩家BUFF,
            {
                名称: '升级',
                描述: `获得 ${获得属性点} 个属性点`,
                效果: `可分配属性点 +${获得属性点}`,
                结束时间: '未过期',
            },
        ],
    };
}

// ---- 属性点分配 ----

export type 可分配属性 = '力量' | '敏捷' | '体质' | '根骨' | '悟性' | '福源';

const 六维属性: 可分配属性[] = ['力量', '敏捷', '体质', '根骨', '悟性', '福源'];

export function 分配属性点(
    角色: 角色数据结构,
    分配方案: Partial<Record<可分配属性, number>>
): { 成功: boolean; 角色?: 角色数据结构; 错误?: string } {
    const 总分配 = Object.values(分配方案).reduce((sum, v) => sum + v, 0);
    if (总分配 <= 0) {
        return { 成功: false, 错误: '没有分配任何属性点' };
    }

    for (const [属性, 值] of Object.entries(分配方案)) {
        if (值 < 0) {
            return { 成功: false, 错误: `属性 ${属性} 不能减少` };
        }
    }

    for (const 属性 of Object.keys(分配方案)) {
        if (!六维属性.includes(属性 as 可分配属性)) {
            return { 成功: false, 错误: `未知属性: ${属性}` };
        }
    }

    const 新角色 = { ...角色 };
    for (const [属性, 值] of Object.entries(分配方案)) {
        (新角色 as any)[属性] = ((新角色 as any)[属性] || 0) + 值;
    }

    return { 成功: true, 角色: 新角色 };
}

// ---- 境界突破 ----

export interface 突破条件 {
    当前境界: string;
    目标境界: string;
    所需条件: string[];
    满足情况: Record<string, boolean>;
}

export const 境界序列 = [
    '未入流',
    '三流',
    '二流',
    '一流',
    '后天',
    '先天',
    '宗师',
    '大宗师',
    '陆地神仙',
];

export function 评估突破条件(角色: 角色数据结构): 突破条件 | null {
    const 当前索引 = 境界序列.indexOf(角色.境界);
    if (当前索引 < 0 || 当前索引 >= 境界序列.length - 1) {
        return null;
    }

    const 目标境界 = 境界序列[当前索引 + 1];
    const 所需条件: string[] = [];
    const 满足情况: Record<string, boolean> = {};

    const 层级要求 = (当前索引 + 1) * 10;
    所需条件.push(`境界层级 >= ${层级要求}`);
    满足情况['境界层级'] = 角色.境界层级 >= 层级要求;

    const 最高重数 = 角色.功法列表.reduce((max, g) => Math.max(max, g.当前重数), 0);
    const 重数要求 = (当前索引 + 1) * 3;
    所需条件.push(`最高功法重数 >= ${重数要求}`);
    满足情况['功法重数'] = 最高重数 >= 重数要求;

    const 六维总和 = 角色.力量 + 角色.敏捷 + 角色.体质 + 角色.根骨 + 角色.悟性 + 角色.福源;
    const 属性要求 = (当前索引 + 1) * 20;
    所需条件.push(`六维总和 >= ${属性要求}`);
    满足情况['六维总和'] = 六维总和 >= 属性要求;

    return {
        当前境界: 角色.境界,
        目标境界,
        所需条件,
        满足情况,
    };
}

export function 是否可以突破(角色: 角色数据结构): boolean {
    const 条件 = 评估突破条件(角色);
    if (!条件) return false;
    return Object.values(条件.满足情况).every(Boolean);
}

// ---- 经验值进度 ----

export interface 经验值进度 {
    当前经验: number;
    升级经验: number;
    百分比: number;
    距离升级差值: number;
}

export function 获取经验值进度(角色: 角色数据结构): 经验值进度 {
    const 差值 = Math.max(0, 角色.升级经验 - 角色.当前经验);
    const 百分比 = 角色.升级经验 > 0
        ? Math.min(100, (角色.当前经验 / 角色.升级经验) * 100)
        : 0;

    return {
        当前经验: 角色.当前经验,
        升级经验: 角色.升级经验,
        百分比: Math.round(百分比 * 10) / 10,
        距离升级差值: 差值,
    };
}

// ---- 境界信息 ----

export function 获取下一个境界(当前境界: string): string | null {
    const 索引 = 境界序列.indexOf(当前境界);
    if (索引 < 0 || 索引 >= 境界序列.length - 1) return null;
    return 境界序列[索引 + 1];
}

export function 获取境界描述(境界: string): string {
    const 描述映射: Record<string, string> = {
        '未入流': '初涉武道，尚未入门',
        '三流': '略懂拳脚，初入江湖',
        '二流': '招式娴熟，小有名气',
        '一流': '武艺精湛，名震一方',
        '后天': '内力初成，超越凡俗',
        '先天': '先天真气，融会贯通',
        '宗师': '自创武学，一代宗师',
        '大宗师': '武道巅峰，震古烁今',
        '陆地神仙': '超越武道，近乎神明',
    };
    return 描述映射[境界] ?? '境界未明';
}
