import { 提示词结构 } from '../../../types';
import { 核心_古代现实基本逻辑 } from './ancient';

export { 核心_古代现实基本逻辑 };

const ERA_REALISM_MAP: Record<string, 提示词结构> = {
    ancient: 核心_古代现实基本逻辑
};

export const 获取时代现实提示词 = (eraVariant: string): 提示词结构 => (
    ERA_REALISM_MAP[eraVariant] || 核心_古代现实基本逻辑
);
