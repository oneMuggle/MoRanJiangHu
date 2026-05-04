import type { 气运数据 } from './index';

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
