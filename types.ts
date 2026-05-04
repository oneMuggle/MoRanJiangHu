export * from './models/character';
export * from './models/environment';
export * from './models/system';
export * from './models/imageGeneration';
export * from './models/world';
export * from './models/item';
export * from './models/social';
export * from './models/kungfu'; 
export * from './models/sect'; 
export * from './models/task'; 
export * from './models/story'; 
export * from './models/storyPlan';
export * from './models/heroinePlan';
export * from './models/fandomPlanning/story';
export * from './models/fandomPlanning/heroinePlan';
export * from './models/battle';
export * from './models/worldbook';
export * from './models/novelDecomposition';
export * from './models/campusPhone';
export * from './models/campusNSFW';

// New types for the advanced chat system

export interface TavernCommand {
    action: 'add' | 'set' | 'push' | 'delete';
    key: string;
    value: any;
}

export interface GameLog {
    sender: string;
    text: string;
}

export interface JudgmentThoughtBlock {
    raw: string;
    text: string;
    attachedTo?: string;
    isNsfw?: boolean;
}

export interface GameResponse {
    logs: GameLog[];
    thinking_pre?: string;
    thinking_native?: string;
    t_input?: string;
    t_plan?: string;
    t_var_plan?: string;
    t_state?: string;
    t_branch?: string;
    t_precheck?: string;
    t_logcheck?: string;
    t_var?: string;
    t_npc?: string;
    t_cmd?: string;
    t_audit?: string;
    t_fix?: string;
    thinking_post?: string;
    t_mem?: string;
    t_opts?: string;
    tavern_commands?: TavernCommand[];
    shortTerm?: string;
    action_options?: string[]; // Quick actions for the user
    dynamic_world?: string[]; // Hints for world-evolution model
    judge_blocks?: JudgmentThoughtBlock[];
    body_optimized?: boolean;
    body_optimized_manual?: boolean;
    body_optimized_at?: number;
    body_optimized_model?: string;
    body_original_logs?: GameLog[];
    variable_calibration_report?: string[];
    variable_calibration_commands?: TavernCommand[];
    variable_calibration_model?: string;
}

// Extend/Override the old history structure
export interface 聊天记录结构 {
    role: 'user' | 'assistant' | 'system';
    content: string; // Keep for backward compat or user input
    structuredResponse?: GameResponse; // The parsed object for assistant
    timestamp: number;
    rawJson?: string; // Raw model text for source view/edit
    gameTime?: string; // Added gameTime
    inputTokens?: number; // Estimated uploaded/input tokens
    responseDurationSec?: number; // Request start -> final reply duration (seconds)
    outputTokens?: number; // Estimated AI output tokens
    autoScrollToTurnIcon?: boolean;
}

/** NSFW 分级：0=无, 1=轻度(暧昧暗示), 2=中度(委婉描写), 3=重度(明确描写) */
export type NSFW等级 = 0 | 1 | 2 | 3;

export interface 天赋结构 {
    名称: string;
    描述: string;
    效果: string; // 具体数值或逻辑描述
    /** 适用性别限制：'男' / '女' / undefined（男女皆可） */
    适用性别?: '男' | '女';
    /** NSFW 分级等级，0 或 undefined 表示无 NSFW 内容 */
    nsfw等级?: NSFW等级;
    /** 适配的时代背景大类，不填则全时代可见 */
    时代适配?: string[];
    /** 适配的具体子纪元 ID，优先级高于时代适配，不填则回退到大类匹配 */
    子纪元适配?: string[];
    /** 分类标签，用于 UI 中按类别过滤 */
    分类?: string;
}

export interface 背景结构 {
    名称: string;
    描述: string;
    效果: string;
    /** 适用性别限制：'男' / '女' / undefined（男女皆可） */
    适用性别?: '男' | '女';
    /** NSFW 分级等级，0 或 undefined 表示无 NSFW 内容 */
    nsfw等级?: NSFW等级;
    /** 适配的时代背景大类，不填则全时代可见 */
    时代适配?: string[];
    /** 适配的具体子纪元 ID，优先级高于时代适配，不填则回退到大类匹配 */
    子纪元适配?: string[];
    /** 分类标签，用于 UI 中按类别过滤 */
    分类?: string;
}

/** 气运属性类型（六维） */
export type 气运属性类型 = '力量' | '敏捷' | '体质' | '根骨' | '悟性' | '福源';

/** 气运效果类型 */
export type 气运效果类型 = '属性修正' | '描述效果';

/** 气运结构 */
export interface 气运结构 {
    名称: string;
    类别: string;
    描述: string;
    效果: Array<{
        类型: 气运效果类型;
        属性?: 气运属性类型;
        修正值?: number;
        描述?: string;
    }>;
    稀有度?: '传说' | '稀有' | '普通';
    代价?: string;
    nsfw等级?: 0 | 1 | 2;
    能力类型?: '战斗' | '生存' | '社交' | '谋略' | '特殊' | '辅助';
    适用境界?: [number, number];
}
