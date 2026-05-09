/**
 * Ref 集中管理
 *
 * 将 useGame 中分散的 ~20 个 Ref 整合到统一的注册表中，
 * 提供类型安全的访问和同步机制。
 */

import { useRef, useEffect } from 'react';
import type { 场景图片档案, 时代信息结构, 图片管理设置结构, 香闺秘档部位类型 } from '../../../types';
import type { 上下文快照 } from '../ui/contextSnapshotCoordinator';
import type { 回合快照结构 } from '../ui/rollbackSnapshot';
import type { 变量生成上下文缓存项 } from '../planning/variableGenerationProgress';

/** 所有 Ref 的集合接口 */
export interface UseGameRefs {
    /** 世界演变最近现实时间戳 */
    世界演变最近现实更新时间戳Ref: React.MutableRefObject<number>;

    /** 世界演变进行中标志 */
    世界演变进行中Ref: React.MutableRefObject<boolean>;

    /** 世界演变去重签名 */
    世界演变去重签名Ref: React.MutableRefObject<string>;

    /** 最近变量生成上下文缓存 */
    最近变量生成上下文Ref: React.MutableRefObject<变量生成上下文缓存项[]>;

    /** NPC 生图进行中集合 */
    NPC生图进行中Ref: React.MutableRefObject<Set<string>>;

    /** 主角生图进行中集合 */
    主角生图进行中Ref: React.MutableRefObject<Set<string>>;

    /** NPC 香闺秘档生图进行中集合 */
    NPC香闺秘档生图进行中Ref: React.MutableRefObject<Set<string>>;

    /** 场景生图自动应用任务 */
    场景生图自动应用任务Ref: React.MutableRefObject<string>;

    /** 场景图片档案同步 Ref */
    场景图片档案Ref: React.MutableRefObject<场景图片档案>;

    /** 时代信息同步 Ref */
    时代信息Ref: React.MutableRefObject<时代信息结构 | undefined>;

    /** 后台手动生图监控 */
    后台手动生图监控Ref: React.MutableRefObject<Array<{
        npcId: string;
        since: number;
        npcName: string;
        构图: '头像' | '半身' | '立绘';
    }>>;

    /** 后台私密生图监控 */
    后台私密生图监控Ref: React.MutableRefObject<Array<{
        npcId: string;
        since: number;
        npcName: string;
        部位: 香闺秘档部位类型;
    }>>;

    /** 后台场景生图监控 */
    后台场景生图监控Ref: React.MutableRefObject<Array<{
        since: number;
        摘要: string;
    }>>;

    /** 自动存档执行函数引用 */
    performAutoSaveRef: React.MutableRefObject<((...args: unknown[]) => void) | null>;

    /** 按 NPC 读取角色锚点函数引用 */
    按NPC读取角色锚点Ref: React.MutableRefObject<((npcId: string) => unknown) | null>;

    /** 提取场景角色锚点函数引用 */
    提取场景角色锚点Ref: React.MutableRefObject<((ctx: unknown) => unknown) | null>;

    /** 获取当前 PNG 画风预设摘要函数引用 */
    获取当前PNG画风预设摘要Ref: React.MutableRefObject<((presetId?: string, type?: 'scene' | 'npc') => unknown) | null>;

    /** 回合快照栈 */
    回合快照栈Ref: React.MutableRefObject<回合快照结构[]>;

    /** 最近自动存档时间戳 */
    最近自动存档时间戳Ref: React.MutableRefObject<number>;

    /** 最近自动存档签名 */
    最近自动存档签名Ref: React.MutableRefObject<string>;

    /** API 配置引用 */
    apiConfigRef: React.MutableRefObject<unknown>;

    /** 视觉配置引用 */
    visualConfigRef: React.MutableRefObject<unknown>;

    /** 图片管理配置引用 */
    imageManagerConfigRef: React.MutableRefObject<图片管理设置结构>;

    /** 上下文快照缓存 */
    上下文快照缓存Ref: React.MutableRefObject<{
        value: 上下文快照;
        refs: unknown[];
    } | null>;
}

/**
 * 创建 Ref 注册表
 *
 * 在 useGame 中调用此函数，创建所有需要的 Ref 并返回。
 */
export function createRefRegistry(): UseGameRefs {
    return {
        世界演变最近现实更新时间戳Ref: useRef(0),
        世界演变进行中Ref: useRef(false),
        世界演变去重签名Ref: useRef(''),
        最近变量生成上下文Ref: useRef<变量生成上下文缓存项[]>([]),
        NPC生图进行中Ref: useRef<Set<string>>(new Set()),
        主角生图进行中Ref: useRef<Set<string>>(new Set()),
        NPC香闺秘档生图进行中Ref: useRef<Set<string>>(new Set()),
        场景生图自动应用任务Ref: useRef(''),
        场景图片档案Ref: useRef<场景图片档案>({}),
        时代信息Ref: useRef<时代信息结构 | undefined>(undefined),
        后台手动生图监控Ref: useRef<Array<{ npcId: string; since: number; npcName: string; 构图: '头像' | '半身' | '立绘' }>>([]),
        后台私密生图监控Ref: useRef<Array<{ npcId: string; since: number; npcName: string; 部位: 香闺秘档部位类型 }>>([]),
        后台场景生图监控Ref: useRef<Array<{ since: number; 摘要: string }>>([]),
        performAutoSaveRef: useRef<((...args: unknown[]) => void) | null>(null),
        按NPC读取角色锚点Ref: useRef<((npcId: string) => unknown) | null>(null),
        提取场景角色锚点Ref: useRef<((ctx: unknown) => unknown) | null>(null),
        获取当前PNG画风预设摘要Ref: useRef<((presetId?: string, type?: 'scene' | 'npc') => unknown) | null>(null),
        回合快照栈Ref: useRef<回合快照结构[]>([]),
        最近自动存档时间戳Ref: useRef<number>(0),
        最近自动存档签名Ref: useRef<string>(''),
        apiConfigRef: useRef<unknown>(null),
        visualConfigRef: useRef<unknown>(null),
        imageManagerConfigRef: useRef<图片管理设置结构>({} as 图片管理设置结构),
        上下文快照缓存Ref: useRef<{ value: 上下文快照; refs: unknown[] } | null>(null),
    };
}

/**
 * 同步 Ref 与最新值的 Hook
 *
 * 替代原 useGame 中的多个 useEffect 同步逻辑。
 */
export function useSyncRef<T>(ref: React.MutableRefObject<T>, value: T): void {
    useEffect(() => {
        ref.current = value;
    }, [ref, value]);
}
