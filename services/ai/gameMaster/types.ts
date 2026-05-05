/**
 * @module gameMaster/types
 * 多智能体游戏大师系统 - 类型定义
 */

import type { TavernCommand, GameResponse } from '../../../types';
import type { 当前可用接口结构 } from '../../../utils/apiConfig';

/**
 * 游戏大师智能体类型
 */
export type 游戏大师智能体类型 =
    | 'story'          // 主剧情生成
    | 'world'          // 世界演变
    | 'variable'       // 变量校准
    | 'planning'       // 剧情规划
    | 'memory'         // 记忆召回
    | 'polish';        // 正文润色

/**
 * 智能体执行状态
 */
export type 智能体执行状态 = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * 单个智能体执行结果
 */
export interface 智能体执行结果 {
    类型: 游戏大师智能体类型;
    状态: 智能体执行状态;
    耗时毫秒?: number;
    原始文本?: string;
    解析结果?: any;
    错误信息?: string;
    优先级: number;
}

/**
 * 游戏大师协调结果
 */
export interface 游戏大师协调结果 {
    /** 是否成功 */
    success: boolean;
    /** 执行阶段 */
    phase: 'init' | 'story' | 'world' | 'variable' | 'planning' | 'memory' | 'polish' | 'finalize' | 'error';
    /** 各智能体执行结果 */
    agentResults: 智能体执行结果[];
    /** 最终合并的命令 */
    commands: TavernCommand[];
    /** 动态世界线索（传递给世界演变） */
    dynamicWorldHints: string[];
    /** 变量校准报告 */
    variableCalibrationReport?: string[];
    /** 短期记忆摘要 */
    shortTermMemory?: string;
    /** 状态文本（用于UI显示） */
    statusText: string;
    /** 原始文本（调试用） */
    rawTexts: Record<游戏大师智能体类型, string>;
}

/**
 * 游戏大师触发参数
 */
export interface 游戏大师触发参数 {
    /** 来源 */
    来源?: 'user_input' | 'auto' | 'world_due' | 'story_end' | 'planning_trigger';
    /** 是否启用世界演变 */
    启用世界演变?: boolean;
    /** 是否启用变量校准 */
    启用变量校准?: boolean;
    /** 是否启用记忆召回 */
    启用记忆召回?: boolean;
    /** 是否启用正文润色 */
    启用正文润色?: boolean;
    /** 是否启用规划更新 */
    启用规划更新?: boolean;
    /** 强制执行（跳过去重检查） */
    强制执行?: boolean;
    /** 当前回合响应（用于提取动态世界线索） */
    当前响应?: GameResponse;
    /** 额外提示词 */
    额外提示词?: string;
}

/**
 * 游戏大师依赖项接口
 */
export interface 游戏大师依赖接口 {
    // API配置
    apiSettings: any;
    gameConfig: any;
    
    // 状态
    角色: any;
    环境: any;
    世界: any;
    剧情: any;
    记忆系统: any;
    历史记录: any[];
    社交列表: any[];
    
    // 规范化函数
    规范化环境信息: (env?: any) => any;
    规范化世界状态: (world?: any) => any;
    规范化剧情状态: (story?: any, env?: any) => any;
    
    // 设置函数
    设置剧情: (story: any) => void;
    设置世界: (world: any) => void;
    设置记忆系统: (memory: any) => void;
    
    // 命令处理
    processResponseCommands: (response: any, baseState?: any, options?: any) => any;
    
    // 状态设置器
    set世界演变更新中: (value: boolean) => void;
    set世界演变状态文本: (value: string) => void;
    set变量校准更新中: (value: boolean) => void;
    set变量校准状态文本: (value: string) => void;
    set规划更新中: (value: boolean) => void;
    set规划状态文本: (value: string) => void;
    
    // 世界演变专用
    世界演变进行中Ref?: { current: boolean };
    世界演变去重签名Ref?: { current: string };
    set世界演变最近更新时间?: (value: string | null) => void;
    set世界演变最近摘要?: (value: string[]) => void;
    set世界演变最近原始消息?: (value: string) => void;
    追加系统消息?: (message: string, options?: any) => void;
    已进入主剧情回合?: () => boolean;
    按回合窗口裁剪历史?: (history: any[], rounds: number) => any[];
}

/**
 * 智能体执行配置
 */
export interface 智能体执行配置 {
    类型: 游戏大师智能体类型;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 优先级（越小越先执行） */
    priority?: number;
    /** 是否必需（失败是否中断整个流程） */
    必需?: boolean;
}

/**
 * 并行执行组
 */
export interface 并行执行组 {
    agents: 智能体执行配置[];
    等待完成?: boolean;
}
