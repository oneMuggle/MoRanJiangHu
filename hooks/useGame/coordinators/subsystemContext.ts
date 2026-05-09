/**
 * 子系统共享上下文
 *
 * 将所有子系统（图片、记忆、存读档等）共用的依赖项集中到单一上下文对象，
 * 替代当前逐个参数传递的模式（每个子系统 10-30 个 props）。
 *
 * 使用方式：
 *   const ctx = createSubsystemContext(stateAccess, refs);
 *   const imageDomain = createImageDomain(ctx);
 */

import type { GameStateAccess, UseGameRefs } from '../state';
import type { GameResponse } from '../../../types';

// ============================================================
// 共享工具函数类型（从主文件提取的公共依赖）
// ============================================================

/** 规范化函数集合 */
export interface Normalizers {
    规范化环境信息: (env: unknown) => unknown;
    规范化社交列表: (social: unknown) => unknown;
    规范化世界状态: (world: unknown) => unknown;
    规范化战斗状态: (battle: unknown) => unknown;
    规范化门派状态: (sect: unknown) => unknown;
    规范化剧情状态: (story: unknown) => unknown;
    规范化剧情规划状态: (plan: unknown) => unknown;
    规范化女主剧情规划状态: (plan: unknown) => unknown;
    规范化同人剧情规划状态: (plan: unknown) => unknown;
    规范化同人女主剧情规划状态: (plan: unknown) => unknown;
    规范化角色物品容器映射: (items: unknown) => unknown;
    规范化记忆系统: (memory: unknown) => unknown;
    规范化视觉设置: (visual: unknown) => unknown;
    规范化场景图片档案: (archive: unknown) => unknown;
    规范化游戏设置: (config: unknown) => unknown;
    规范化可选开局配置: (config: unknown) => unknown;
    规范化记忆配置: (config: unknown) => unknown;
}

/** API 配置工具集合 */
export interface ApiUtils {
    获取世界演变接口配置: (config: unknown) => unknown;
    获取文生图接口配置: (config: unknown) => unknown;
    获取场景文生图接口配置: (config: unknown) => unknown;
    获取生图词组转化器接口配置: (config: unknown) => unknown;
    获取生图画师串预设: (config: unknown) => unknown;
    获取词组转化器预设提示词: (config: unknown) => string;
    接口配置是否可用: (config: unknown) => boolean;
    变量校准功能已启用: (config: unknown) => boolean;
    获取变量计算接口配置: (config: unknown) => unknown;
    获取变量生成并发配置: (config: unknown) => number;
    规范化接口设置: (config: unknown) => unknown;
}

/** 状态工厂集合 */
export interface StateFactories {
    创建开场空白环境: () => unknown;
    创建开场空白世界: () => unknown;
    创建开场空白战斗: () => unknown;
    创建开场空白剧情: () => unknown;
    创建空门派状态: () => unknown;
    创建空剧情规划: () => unknown;
    创建空记忆系统: () => unknown;
    创建开场基础状态: (overrides?: unknown) => unknown;
    创建开场命令基态: () => unknown;
    构建前端清空开场状态: () => unknown;
    战斗结束自动清空: (battle: unknown) => unknown;
    按回合窗口裁剪历史: (history: unknown, window?: number) => unknown;
}

/** 时间工具集合 */
export interface TimeUtils {
    环境时间转标准串: (env: unknown) => string;
    normalizeCanonicalGameTime: (time: unknown) => unknown;
}

/** 响应处理工具集合 */
export interface ResponseUtils {
    获取原始AI消息: (entry: unknown) => string;
    计算回复耗时秒: (entry: unknown) => number;
    估算消息Token: (messages: unknown[]) => number;
    估算AI输出Token: (text: string) => number;
    提取响应完整正文文本: (entry: unknown) => string;
    收集最近完整正文回合: (history: unknown[], count?: number) => unknown[];
    构建最近完整正文上下文: (entries: unknown[]) => string;
    按世界演变分流净化响应: (response: GameResponse, state: unknown) => GameResponse;
    替换流式草稿为失败提示: (history: unknown[], error: string) => void;
    更新流式草稿为自动重试提示: (history: unknown[]) => void;
    游戏设置启用自动重试: (config: unknown) => boolean;
    执行带自动重试的生成请求: (fn: () => Promise<unknown>, maxRetries?: number) => Promise<unknown>;
    提取解析失败原始信息: (entry: unknown) => string;
    提取原始报错详情: (error: unknown) => { name: string; message: string; stack?: string };
    格式化错误详情: (error: unknown) => string;
}

/** 记忆工具集合 */
export interface MemoryUtils {
    规范化记忆配置: (config: unknown) => unknown;
    规范化记忆系统: (memory: unknown) => unknown;
    构建即时记忆条目: (content: string, env: unknown) => unknown;
    构建短期记忆条目: (content: string, env: unknown) => unknown;
    写入四段记忆: (memory: unknown, newEntries: unknown[]) => unknown;
}

/** NPC 上下文工具集合 */
export interface NpcContextUtils {
    提取NPC生图基础数据: (npc: unknown, options?: { cultivationSystemEnabled?: boolean }) => unknown;
    提取NPC生图基础数据附带私密描述: (npc: unknown) => unknown;
    提取NPC香闺秘档部位生图数据: (npc: unknown, part: string) => unknown;
    提取主角生图基础数据: (character: unknown, options?: { cultivationSystemEnabled?: boolean }) => unknown;
    合并NPC图片档案: (npc: unknown, archive: unknown) => unknown;
    生成NPC生图记录ID: () => string;
    生成场景生图记录ID: () => string;
}

/** 规划原因收集器 */
export interface PlanningReasonCollector {
    去重文本数组: (texts: string[]) => string[];
    收集剧情规划时间触发原因: (state: unknown) => string[];
    收集女主规划时间触发原因: (state: unknown) => string[];
    收集剧情正文命中原因: (state: unknown) => string[];
    收集女主正文命中原因: (state: unknown) => string[];
}

/** 完整子系统上下文 */
export interface SubsystemContext {
    /** 统一状态访问 */
    state: GameStateAccess;

    /** Ref 注册表 */
    refs: UseGameRefs;

    /** 规范化函数 */
    normalizers: Normalizers;

    /** API 配置工具 */
    apiUtils: ApiUtils;

    /** 状态工厂 */
    factories: StateFactories;

    /** 时间工具 */
    timeUtils: TimeUtils;

    /** 响应处理工具 */
    responseUtils: ResponseUtils;

    /** 记忆工具 */
    memoryUtils: MemoryUtils;

    /** NPC 上下文工具 */
    npcContextUtils: NpcContextUtils;

    /** 规划原因收集器 */
    planningReasons: PlanningReasonCollector;
}

/**
 * 创建子系统共享上下文
 *
 * 接收统一状态访问层和 Ref 注册表，以及所有公共工具函数，
 * 返回一个完整的上下文对象供各子系统使用。
 */
export function createSubsystemContext(
    state: GameStateAccess,
    refs: UseGameRefs,
    normalizers: Normalizers,
    apiUtils: ApiUtils,
    factories: StateFactories,
    timeUtils: TimeUtils,
    responseUtils: ResponseUtils,
    memoryUtils: MemoryUtils,
    npcContextUtils: NpcContextUtils,
    planningReasons: PlanningReasonCollector
): SubsystemContext {
    return {
        state,
        refs,
        normalizers,
        apiUtils,
        factories,
        timeUtils,
        responseUtils,
        memoryUtils,
        npcContextUtils,
        planningReasons,
    };
}
