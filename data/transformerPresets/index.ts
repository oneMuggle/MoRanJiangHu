import { 词组转化器提示词预设结构, 模型词组转化器预设结构 } from '../../models/system';
import { NPC词组转化器提示词预设列表 } from './npc';
import { 场景词组转化器提示词预设列表 } from './scene';
import { 模型词组转化器预设列表 } from './model';

export const 默认词组转化器提示词预设列表: 词组转化器提示词预设结构[] = [
    ...NPC词组转化器提示词预设列表,
    ...场景词组转化器提示词预设列表
];

export const 默认模型词组转化器预设列表: 模型词组转化器预设结构[] = 模型词组转化器预设列表;

export { NPC词组转化器提示词预设列表 } from './npc';
export { 场景词组转化器提示词预设列表 } from './scene';
export { 模型词组转化器预设列表 } from './model';

export * from './npc';
export * from './scene';
export * from './model';