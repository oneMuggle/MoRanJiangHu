/**
 * @module models/planning/gameMaster
 * 多智能体游戏大师配置
 */

import type { 游戏大师智能体类型, 并行执行组 } from '../../services/ai/gameMaster/types';

/**
 * 游戏大师配置结构
 */
export interface 游戏大师配置结构 {
    /** 是否启用 */
    enabled: boolean;
    /** 默认启用的智能体 */
    defaultAgents: 游戏大师智能体类型[];
    /** 并行执行配置 */
    parallelGroups: 并行执行组[];
    /** 超时配置（毫秒） */
    timeout: number;
    /** 调试模式 */
    debug: boolean;
}

/**
 * 默认游戏大师配置
 */
export const 默认游戏大师配置: 游戏大师配置结构 = {
    enabled: true,
    defaultAgents: ['story', 'world', 'variable', 'planning'],
    parallelGroups: [
        {
            agents: [
                { type: 'world', priority: 2 },
                { type: 'variable', priority: 3 },
            ],
            等待完成: true,
        },
        {
            agents: [
                { type: 'planning', priority: 4 },
            ],
            等待完成: false,
        },
    ],
    timeout: 120000, // 2分钟
    debug: false,
};

/**
 * 智能体优先级定义
 */
export const 智能体优先级: Record<游戏大师智能体类型, number> = {
    story: 1,
    world: 2,
    variable: 3,
    planning: 4,
    memory: 5,
    polish: 6,
};

/**
 * 智能体超时配置（毫秒）
 */
export const 智能体超时配置: Record<游戏大师智能体类型, number> = {
    story: 90000,    // 主剧情 90秒
    world: 60000,    // 世界演变 60秒
    variable: 45000,  // 变量校准 45秒
    planning: 45000,  // 规划更新 45秒
    memory: 30000,   // 记忆召回 30秒
    polish: 30000,   // 正文润色 30秒
};

/**
 * 智能体描述（用于UI显示）
 */
export const 智能体描述: Record<游戏大师智能体类型, string> = {
    story: '主剧情生成',
    world: '世界演变',
    variable: '变量校准',
    planning: '剧情规划',
    memory: '记忆召回',
    polish: '正文润色',
};

/**
 * 检查智能体是否应该并行执行
 */
export const 智能体可并行执行 = (agent1: 游戏大师智能体类型, agent2: 游戏大师智能体类型): boolean => {
    // world 和 variable 可以并行
    const parallelPairs: [游戏大师智能体类型, 游戏大师智能体类型][] = [
        ['world', 'variable'],
        ['world', 'planning'],
        ['variable', 'planning'],
    ];
    
    return parallelPairs.some(
        ([a1, a2]) =>
            (agent1 === a1 && agent2 === a2) || (agent1 === a2 && agent2 === a1)
    );
};
