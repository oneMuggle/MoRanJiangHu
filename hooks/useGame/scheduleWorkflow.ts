// 时间/日程系统增强
// 时辰换算、NPC日程检查、时间敏感事件

import { 活跃NPC结构 } from '../../models/game/world';
import { normalizeCanonicalGameTime, 标准时间串转结构化 } from './timeUtils';

// ---- 时辰系统 ----

export const 时辰列表 = [
    '子时', '丑时', '寅时', '卯时', '辰时', '巳时',
    '午时', '未时', '申时', '酉时', '戌时', '亥时'
] as const;

export type 时辰 = typeof 时辰列表[number];

export function 小时转时辰(小时: number): 时辰 {
    return 时辰列表[Math.floor(((小时 + 1) % 24) / 2)];
}

export function 获取当前时辰(时间串: string): 时辰 | null {
    const 结构化 = 标准时间串转结构化(时间串);
    if (!结构化) return null;
    return 小时转时辰(结构化.时);
}

export function 获取时辰时段(时间串: string): string | null {
    const 结构化 = 标准时间串转结构化(时间串);
    if (!结构化) return null;
    const 时 = 结构化.时;

    if (时 >= 5 && 时 < 8) return '清晨';
    if (时 >= 8 && 时 < 12) return '上午';
    if (时 >= 12 && 时 < 14) return '中午';
    if (时 >= 14 && 时 < 18) return '下午';
    if (时 >= 18 && 时 < 21) return '傍晚';
    if (时 >= 21 || 时 < 1) return '深夜';
    if (时 >= 1 && 时 < 5) return '凌晨';
    return '未知';
}

export function 是否为夜间(时间串: string): boolean {
    const 结构化 = 标准时间串转结构化(时间串);
    if (!结构化) return false;
    return 结构化.时 >= 19 || 结构化.时 < 6;
}

// ---- NPC日程检查 ----

export interface NPC日程状态 {
    是否在岗: boolean;
    当前行动: string;
    行动剩余时间: number | null;
    说明: string;
}

export function 检查NPC日程(
    NPC: 活跃NPC结构,
    当前时间: string
): NPC日程状态 | null {
    if (!NPC.行动开始时间 || !NPC.行动结束时间) {
        return {
            是否在岗: false,
            当前行动: NPC.当前行动 || '未知',
            行动剩余时间: null,
            说明: '无日程信息',
        };
    }

    const 开始 = 时间转分钟(NPC.行动开始时间);
    const 结束 = 时间转分钟(NPC.行动结束时间);
    const 当前 = 时间转分钟(当前时间);

    if (开始 === null || 结束 === null || 当前 === null) return null;

    const 在日程内 = 开始 <= 结束
        ? 当前 >= 开始 && 当前 <= 结束
        : 当前 >= 开始 || 当前 <= 结束;

    const 剩余 = 在日程内 ? 结束 - 当前 : null;

    return {
        是否在岗: 在日程内,
        当前行动: NPC.当前行动 || '未知',
        行动剩余时间: 剩余 !== null && 剩余 > 0 ? 剩余 : null,
        说明: 在日程内
            ? `正在「${NPC.当前行动 || '忙碌'}」${剩余 !== null && 剩余 > 0 ? `（剩余约${剩余}分钟）` : ''}`
            : '当前空闲',
    };
}

export function 筛选在岗NPC(
    NPC列表: 活跃NPC结构[],
    当前时间: string
): 活跃NPC结构[] {
    return NPC列表.filter(npc => {
        if (!npc.行动开始时间 || !npc.行动结束时间) return true;
        const 日程 = 检查NPC日程(npc, 当前时间);
        return 日程?.是否在岗 ?? true;
    });
}

// ---- 时间差计算 ----

export function 时间差分钟(开始: string, 结束: string): number | null {
    const 开始分 = 时间转分钟(开始);
    const 结束分 = 时间转分钟(结束);
    if (开始分 === null || 结束分 === null) return null;
    return 结束分 - 开始分;
}

export function 添加时间(当前时间: string, 分钟: number): string {
    const 规范化 = normalizeCanonicalGameTime(当前时间);
    if (!规范化) return 当前时间;

    const parts = 规范化.split(':').map(Number);
    let [年, 月, 日, 时, 分] = parts;

    分 += 分钟;

    while (分 >= 60) { 分 -= 60; 时 += 1; }
    while (时 < 0) { 时 += 24; 日 -= 1; }
    while (时 >= 24) { 时 -= 24; 日 += 1; }

    while (日 < 1) { 日 += 30; 月 -= 1; }
    while (日 > 30) { 日 -= 30; 月 += 1; }

    while (月 < 1) { 月 += 12; 年 -= 1; }
    while (月 > 12) { 月 -= 12; 年 += 1; }

    return `${年}:${String(月).padStart(2, '0')}:${String(日).padStart(2, '0')}:${String(时).padStart(2, '0')}:${String(分).padStart(2, '0')}`;
}

// ---- 时间格式化 ----

export function 格式化时间(时间串: string): string {
    const 结构化 = 标准时间串转结构化(时间串);
    if (!结构化) return 时间串;

    const 时辰 = 小时转时辰(结构化.时);
    return `${结构化.年}年${结构化.月}月${结构化.日}日 ${时辰} ${String(结构化.时).padStart(2, '0')}:${String(结构化.分).padStart(2, '0')}`;
}

export function 格式化短时间(时间串: string): string {
    const 结构化 = 标准时间串转结构化(时间串);
    if (!结构化) return 时间串;

    const 时辰 = 小时转时辰(结构化.时);
    const 时段 = 获取时辰时段(时间串);
    return `${结构化.月}月${结构化.日}日 ${时段}（${时辰}）`;
}

// ---- 内部工具 ----

function 时间转分钟(时间串: string): number | null {
    const 结构化 = 标准时间串转结构化(时间串);
    if (!结构化) return null;
    return 结构化.时 * 60 + 结构化.分;
}
