import type { 天赋结构 } from '../../types';
import { 通用天赋 } from './common';
import { 武侠天赋 } from './wuxia';
import { 志怪天赋 } from './zhiguai';
import { 神话天赋 } from './myth';
import { 古希腊天赋 } from './greek';
import { 古罗马天赋 } from './roman';
import { 中世纪天赋 } from './medieval';
import { NSFW天赋 } from './nsfw';
import { 现代天赋 } from './modern';
import { 未来天赋 } from './future';

export { 通用天赋, 武侠天赋, 志怪天赋, 神话天赋, 古希腊天赋, 古罗马天赋, 中世纪天赋, NSFW天赋, 现代天赋, 未来天赋 };

export const 全部天赋: 天赋结构[] = [
    ...通用天赋,
    ...武侠天赋,
    ...志怪天赋,
    ...神话天赋,
    ...古希腊天赋,
    ...古罗马天赋,
    ...中世纪天赋,
    ...NSFW天赋,
    ...现代天赋,
    ...未来天赋,
];

/** 向后兼容别名 */
export { 全部天赋 as 预设天赋 };
