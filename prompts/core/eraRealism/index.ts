import { 提示词结构 } from '../../../types';
import { 核心_古代现实基本逻辑 } from './ancient';
import { 核心_近代现实基本逻辑 } from './modern';
import { 核心_现代现实基本逻辑 } from './contemporary';
import { 核心_近未来赛博现实基本逻辑 } from './cyberpunk';
import { 核心_未来科幻现实基本逻辑 } from './scifi';

export { 核心_古代现实基本逻辑, 核心_近代现实基本逻辑, 核心_现代现实基本逻辑, 核心_近未来赛博现实基本逻辑, 核心_未来科幻现实基本逻辑 };

const ERA_REALISM_MAP: Record<string, 提示词结构> = {
    ancient: 核心_古代现实基本逻辑,
    modern: 核心_近代现实基本逻辑,
    contemporary: 核心_现代现实基本逻辑,
    cyberpunk: 核心_近未来赛博现实基本逻辑,
    scifi: 核心_未来科幻现实基本逻辑
};

/** 从树状时代 ID 推导现实主义变体关键词 */
const 推导时代变体 = (eraId: string): string => {
    const prefix = eraId.split('_')[0];
    switch (prefix) {
        case 'primordial':
        case 'ancient':
            return 'ancient';
        case 'modern':
            return 'modern';
        case 'contemporary':
            return 'contemporary';
        case 'near':
            return 'cyberpunk';
        case 'far':
        case 'post':
            return 'scifi';
        default:
            return 'ancient';
    }
};

export const 获取时代现实提示词 = (eraVariant: string): 提示词结构 => (
    ERA_REALISM_MAP[eraVariant] || 核心_古代现实基本逻辑
);

/** 从树状时代 ID 获取对应的现实主义提示词 */
export const 获取时代现实提示词ByEraId = (eraId: string | null | undefined): string | null => {
    if (!eraId) return null;
    const variant = 推导时代变体(eraId);
    return 获取时代现实提示词(variant).内容;
};
