import type { 背景结构 } from '../../types';
import { NSFW背景 } from './nsfw';
import { 通用背景 } from './common';
import { 武侠背景 } from './wuxia';
import { 志怪背景 } from './zhiguai';
import { 神话背景 } from './myth';
import { 古希腊背景 } from './greek';
import { 古罗马背景 } from './roman';
import { 中世纪背景 } from './medieval';
import { 现代背景 } from './modern';

export { NSFW背景 };
export { 通用背景 };
export { 武侠背景 };
export { 志怪背景 };
export { 神话背景 };
export { 古希腊背景 };
export { 古罗马背景 };
export { 中世纪背景 };
export { 现代背景 };

export const 全部背景: 背景结构[] = [
    ...NSFW背景,
    ...通用背景,
    ...武侠背景,
    ...志怪背景,
    ...神话背景,
    ...古希腊背景,
    ...古罗马背景,
    ...中世纪背景,
    ...现代背景,
];

/** 向后兼容别名 */
export { 全部背景 as 预设背景 };
