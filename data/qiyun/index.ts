/**
 * 气运数据模块化入口
 * 新代码可直接引用 categories/ 下的子文件
 */
export type { 气运类别, 气运稀有度, 气运数据 } from './types';
export type { 气运属性类型, 气运效果类型 } from '../../types';

// 按类别导出的气运数据
export { 真气运 } from './categories/zhen-qiyun';
export { 限制版气运 } from './categories/xianzhi';
export { 因果律 } from './categories/causality';
export { 天道规则 } from './categories/heavenly-rules';
export { 绝对无敌 } from './categories/absolute-inv';
export { 脑洞破防 } from './categories/brain-hole';
export { 法则扭曲 } from './categories/law-twist';
export { 白嫖躺赢 } from './categories/white-free';
export { 怠惰降维 } from './categories/lazy-dim';
export { 精神暴击 } from './categories/mental-crit';
export { 合欢秘辛 } from './categories/hehuan';

import type { 气运数据, 气运稀有度 } from './types';
import type { 气运属性类型, 气运效果类型 } from '../../types';
import { 真气运 } from './categories/zhen-qiyun';
import { 限制版气运 } from './categories/xianzhi';
import { 因果律 } from './categories/causality';
import { 天道规则 } from './categories/heavenly-rules';
import { 绝对无敌 } from './categories/absolute-inv';
import { 脑洞破防 } from './categories/brain-hole';
import { 法则扭曲 } from './categories/law-twist';
import { 白嫖躺赢 } from './categories/white-free';
import { 怠惰降维 } from './categories/lazy-dim';
import { 精神暴击 } from './categories/mental-crit';
import { 合欢秘辛 } from './categories/hehuan';

export type 气运能力类型 = '战斗' | '生存' | '社交' | '谋略' | '特殊' | '辅助';

/** 完整气运数据列表（向后兼容） */
export const 气运数据列表: 气运数据[] = [
    ...真气运,
    ...限制版气运,
    ...因果律,
    ...天道规则,
    ...绝对无敌,
    ...脑洞破防,
    ...法则扭曲,
    ...白嫖躺赢,
    ...怠惰降维,
    ...精神暴击,
    ...合欢秘辛,
];

/** 向后兼容别名 */
export { 气运数据列表 as 全部气运 };

export function getQiyunByCategory(类别: string): 气运数据[] {
    const map: Record<string, 气运数据[]> = {
        '真·气运': 真气运,
        '限制版气运': 限制版气运,
        '因果律': 因果律,
        '天道规则': 天道规则,
        '绝对无敌': 绝对无敌,
        '脑洞破防': 脑洞破防,
        '法则扭曲': 法则扭曲,
        '白嫖躺赢': 白嫖躺赢,
        '怠惰降维': 怠惰降维,
        '精神暴击': 精神暴击,
        '合欢秘辛': 合欢秘辛,
    };
    return map[类别] || [];
}

export function getQiyunByRarity(稀有度: 气运稀有度): 气运数据[] {
    return 气运数据列表.filter(q => q.稀有度 === 稀有度);
}

export function getQiyunDetail(名称: string): 气运数据 | undefined {
    return 气运数据列表.find(q => q.名称 === 名称);
}

export function getQiyunByType(能力类型: 气运能力类型): 气运数据[] {
    return 气运数据列表.filter(q => q.能力类型 === 能力类型);
}

export function getQiyunByRealm(境界层级: number): 气运数据[] {
    return 气运数据列表.filter(q => {
        if (!q.适用境界) return true;
        return 境界层级 >= q.适用境界[0] && 境界层级 <= q.适用境界[1];
    });
}

function applyQiyunFilters(pool: 气运数据[], options?: {
    成人内容开启?: boolean;
    excludeNsfw?: boolean;
    能力类型?: 气运能力类型;
}): 气运数据[] {
    return pool.filter(q => {
        if (options?.excludeNsfw && (q.nsfw等级 && q.nsfw等级 > 0)) return false;
        if (!options?.成人内容开启 && q.nsfw等级 && q.nsfw等级 > 0) return false;
        if (options?.能力类型 && q.能力类型 !== options.能力类型) return false;
        return true;
    });
}

export function randomQiyun(count: number = 1, options?: {
    成人内容开启?: boolean;
    excludeNsfw?: boolean;
    能力类型?: 气运能力类型;
}): 气运数据[] {
    const pool = applyQiyunFilters(气运数据列表, options);
    const result: 气运数据[] = [];
    const used = new Set<string>();
    while (result.length < count && result.length < pool.length) {
        const idx = Math.floor(Math.random() * pool.length);
        if (!used.has(pool[idx].名称)) {
            used.add(pool[idx].名称);
            result.push(pool[idx]);
        }
    }
    return result;
}

export function filterQiyun(options?: {
    成人内容开启?: boolean;
    excludeNsfw?: boolean;
    能力类型?: 气运能力类型;
    类别?: string;
    稀有度?: 气运稀有度;
}): 气运数据[] {
    let pool = applyQiyunFilters(气运数据列表, options);
    if (options?.类别) pool = getQiyunByCategory(options.类别);
    if (options?.稀有度) pool = pool.filter(q => q.稀有度 === options.稀有度);
    return pool;
}

export function 计算气运属性修正(
    当前属性: number,
    气运列表: 气运数据[]
): number {
    let 修正因子 = 1;
    for (const qiyun of 气运列表) {
        for (const effect of qiyun.效果) {
            if (effect.类型 === '属性修正' && effect.修正值) {
                修正因子 *= effect.修正值;
            }
        }
    }
    return Math.round(当前属性 * 修正因子);
}

export function 获取气运效果描述(气运列表: 气运数据[]): string[] {
    return 气运列表.flatMap(q =>
        q.效果
            .filter(e => e.类型 === '描述效果')
            .map(e => e.描述 || '')
            .filter(Boolean)
    );
}

export function 获取气运属性列表(气运列表: 气运数据[]): Array<{属性: 气运属性类型; 修正值: number}> {
    return 气运列表.flatMap(q =>
        q.效果
            .filter(e => e.类型 === '属性修正' && e.属性 && e.修正值)
            .map(e => ({ 属性: e.属性!, 修正值: e.修正值! }))
    );
}
