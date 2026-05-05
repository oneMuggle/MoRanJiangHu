/**
 * @module hooks/useGame/memoryConsolidation
 * 记忆整合系统
 * 
 * 负责四层记忆（即时/短期/中期/长期）的自动压缩调度和整合管理。
 * 在适当的时机触发记忆压缩任务，确保记忆层级之间的平滑过渡。
 */

import type { 记忆系统结构, 记忆配置结构 } from '../../types';
import {
    规范化记忆系统,
    规范化记忆配置,
    构建待处理记忆压缩任务,
    应用记忆压缩结果,
    记忆压缩任务结构,
    记忆压缩来源层,
} from './memoryUtils';

/**
 * 记忆整合状态
 */
export type 记忆整合状态 = {
    /** 待处理的压缩任务队列 */
    pendingTasks: 记忆压缩任务结构[];
    /** 当前是否正在处理整合 */
    isProcessing: boolean;
    /** 最后整合时间戳 */
    lastConsolidationTime: number;
    /** 整合摘要 */
    summary: string;
};

/**
 * 记忆整合结果
 */
export interface 记忆整合结果 {
    /** 整合后的记忆系统 */
    memory: 记忆系统结构;
    /** 是否执行了压缩 */
    compressed: boolean;
    /** 执行了哪些层的压缩 */
    compressedLayers: 记忆压缩来源层[];
    /** 剩余待处理任务 */
    remainingTasks: number;
    /** 整合摘要 */
    summary: string;
};

/**
 * 整合任务优先级
 * 短期 → 中期 优先于 中期 → 长期
 */
const 整合优先级: Record<记忆压缩来源层, number> = {
    '短期': 1,
    '中期': 2,
};

/**
 * 检查是否需要压缩
 */
export const 需要压缩 = (
    memory: 记忆系统结构,
    config: 记忆配置结构
): boolean => {
    const mem = 规范化记忆系统(memory);
    const cfg = 规范化记忆配置(config);
    const shortLimit = Math.max(5, Number(cfg.短期记忆阈值) || 30);
    const midLimit = Math.max(20, Number(cfg.中期记忆阈值) || 50);
    
    return mem.短期记忆.length > shortLimit || mem.中期记忆.length > midLimit;
};

/**
 * 获取所有待处理压缩任务（按优先级排序）
 */
export const 获取待处理压缩任务队列 = (
    memory: 记忆系统结构,
    config: 记忆配置结构
): 记忆压缩任务结构[] => {
    const tasks: 记忆压缩任务结构[] = [];
    
    // 短期 → 中期 任务
    const shortToMid = 构建待处理记忆压缩任务(memory, config);
    if (shortToMid) {
        tasks.push(shortToMid);
    }
    
    // 中期 → 长期 任务
    const midToLong = 构建待处理记忆压缩任务(memory, config);
    if (midToLong) {
        tasks.push(midToLong);
    }
    
    // 按优先级排序
    return tasks.sort((a, b) => 
        整合优先级[a.来源层] - 整合优先级[b.来源层]
    );
};

/**
 * 执行单次记忆压缩
 */
export const 执行单次记忆压缩 = (
    memory: 记忆系统结构,
    task: 记忆压缩任务结构,
    summaryText: string
): 记忆整合结果 => {
    const beforeMemory = 规范化记忆系统(memory);
    const afterMemory = 应用记忆压缩结果(beforeMemory, task, summaryText);
    
    const beforeCounts = {
        短期: beforeMemory.短期记忆.length,
        中期: beforeMemory.中期记忆.length,
    };
    const afterCounts = {
        短期: afterMemory.短期记忆.length,
        中期: afterMemory.中期记忆.length,
    };
    
    const compressedLayers: 记忆压缩来源层[] = [];
    if (task.来源层 === '短期' && afterCounts.短期 < beforeCounts.短期) {
        compressedLayers.push('短期');
    }
    if (task.来源层 === '中期' && afterCounts.中期 < beforeCounts.中期) {
        compressedLayers.push('中期');
    }
    
    const summary = compressedLayers.length > 0
        ? `已执行 ${compressedLayers.join('→')} 压缩，移除了 ${task.批次条数} 条记忆`
        : '压缩任务执行完成，但无实际压缩发生';
    
    return {
        memory: afterMemory,
        compressed: compressedLayers.length > 0,
        compressedLayers,
        remainingTasks: 获取待处理压缩任务队列(afterMemory, 
            { 短期记忆阈值: 30, 中期记忆阈值: 50 } as 记忆配置结构
        ).length,
        summary,
    };
};

/**
 * 执行记忆整合（处理所有待压缩任务）
 * 
 * @param memory 原始记忆系统
 * @param config 记忆配置
 * @param maxTasksPerLayer 每层最大处理任务数（防止过多压缩）
 * @returns 整合结果
 */
export const 执行记忆整合 = (
    memory: 记忆系统结构,
    config: 记忆配置结构,
    maxTasksPerLayer: number = 1
): 记忆整合结果 => {
    let currentMemory = 规范化记忆系统(memory);
    const normalizedConfig = 规范化记忆配置(config);
    
    const allCompressedLayers: 记忆压缩来源层[] = [];
    let totalCompressedCount = 0;
    
    // 处理所有层的压缩任务
    let iterations = 0;
    const maxIterations = 10; // 防止无限循环
    
    while (iterations < maxIterations) {
        iterations++;
        
        const pendingTasks = 获取待处理压缩任务队列(currentMemory, normalizedConfig);
        if (pendingTasks.length === 0) {
            break;
        }
        
        // 按层分组，每层只处理 maxTasksPerLayer 个任务
        const tasksByLayer = new Map<记忆压缩来源层, 记忆压缩任务结构[]>();
        for (const task of pendingTasks) {
            const existing = tasksByLayer.get(task.来源层) || [];
            if (existing.length < maxTasksPerLayer) {
                existing.push(task);
                tasksByLayer.set(task.来源层, existing);
            }
        }
        
        // 按优先级处理
        const sortedLayers = Array.from(tasksByLayer.keys())
            .sort((a, b) => 整合优先级[a] - 整合优先级[b]);
        
        let madeProgress = false;
        for (const layer of sortedLayers) {
            const tasks = tasksByLayer.get(layer) || [];
            for (const task of tasks) {
                // 生成简单的摘要文本（实际应由AI生成）
                const summaryText = 生成压缩摘要(task);
                const result = 执行单次记忆压缩(currentMemory, task, summaryText);
                
                if (result.compressed) {
                    currentMemory = result.memory;
                    allCompressedLayers.push(...result.compressedLayers);
                    totalCompressedCount += task.批次条数;
                    madeProgress = true;
                }
            }
        }
        
        if (!madeProgress) {
            break;
        }
    }
    
    const summary = allCompressedLayers.length > 0
        ? `整合完成：执行了 ${allCompressedLayers.length} 次压缩，移除 ${totalCompressedCount} 条记忆`
        : '无需整合，记忆层级均在阈值内';
    
    return {
        memory: currentMemory,
        compressed: allCompressedLayers.length > 0,
        compressedLayers: Array.from(new Set(allCompressedLayers)),
        remainingTasks: 获取待处理压缩任务队列(currentMemory, normalizedConfig).length,
        summary,
    };
};

/**
 * 生成压缩摘要（简单版本，实际应由AI调用生成）
 * 
 * 当无法调用AI时，使用简单的格式生成摘要。
 * 格式：【时间范围】记忆1；记忆2；... 等
 */
const 生成压缩摘要 = (task: 记忆压缩任务结构): string => {
    if (!task.批次 || task.批次.length === 0) {
        return '';
    }
    
    // 提取前几条记忆的关键词作为摘要
    const previewCount = Math.min(3, task.批次.length);
    const previews = task.批次
        .slice(0, previewCount)
        .map(item => {
            // 去掉时间前缀，提取内容
            const content = item.replace(/^【[^】]*】\s*/, '').trim();
            return content.length > 50 ? `${content.slice(0, 50)}...` : content;
        })
        .join('；');
    
    const timeRange = task.起始时间 !== '未知时间' && task.结束时间 !== '未知时间'
        ? `${task.起始时间}至${task.结束时间}`
        : '';
    
    return timeRange ? `【${timeRange}】${previews}` : previews;
};

/**
 * 检查是否需要立即整合（用于性能敏感场景）
 */
export const 需要立即整合 = (
    memory: 记忆系统结构,
    config: 记忆配置结构
): boolean => {
    const mem = 规范化记忆系统(memory);
    const cfg = 规范化记忆配置(config);
    const shortLimit = Math.max(5, Number(cfg.短期记忆阈值) || 30);
    const midLimit = Math.max(20, Number(cfg.中期记忆阈值) || 50);
    
    // 超过阈值 50% 则需要立即整合
    return mem.短期记忆.length > shortLimit * 1.5 || 
           mem.中期记忆.length > midLimit * 1.5;
};

/**
 * 获取记忆层级健康状态
 */
export const 获取记忆健康状态 = (
    memory: 记忆系统结构,
    config: 记忆配置结构
): Record<'短期' | '中期' | '长期', { count: number; limit: number; usagePercent: number; status: 'normal' | 'warning' | 'critical' }> => {
    const mem = 规范化记忆系统(memory);
    const cfg = 规范化记忆配置(config);
    
    const shortLimit = Math.max(5, Number(cfg.短期记忆阈值) || 30);
    const midLimit = Math.max(20, Number(cfg.中期记忆阈值) || 50);
    
    const calcStatus = (count: number, limit: number): 'normal' | 'warning' | 'critical' => {
        const usage = count / limit;
        if (usage >= 1.0) return 'critical';
        if (usage >= 0.8) return 'warning';
        return 'normal';
    };
    
    return {
        '短期': {
            count: mem.短期记忆.length,
            limit: shortLimit,
            usagePercent: Math.round((mem.短期记忆.length / shortLimit) * 100),
            status: calcStatus(mem.短期记忆.length, shortLimit),
        },
        '中期': {
            count: mem.中期记忆.length,
            limit: midLimit,
            usagePercent: Math.round((mem.中期记忆.length / midLimit) * 100),
            status: calcStatus(mem.中期记忆.length, midLimit),
        },
        '长期': {
            count: mem.长期记忆.length,
            limit: Infinity, // 长期记忆无硬性限制
            usagePercent: 0,
            status: 'normal',
        },
    };
};

/**
 * 创建记忆整合追踪器
 * 用于在游戏过程中追踪和管理记忆整合状态
 */
export const 创建记忆整合追踪器 = () => {
    let state: 记忆整合状态 = {
        pendingTasks: [],
        isProcessing: false,
        lastConsolidationTime: 0,
        summary: '',
    };
    
    return {
        /**
         * 获取当前状态
         */
        getState: () => ({ ...state }),
        
        /**
         * 检查并更新待处理任务
         */
        refreshPendingTasks: (memory: 记忆系统结构, config: 记忆配置结构) => {
            state.pendingTasks = 获取待处理压缩任务队列(memory, config);
            state.summary = state.pendingTasks.length > 0
                ? `待处理 ${state.pendingTasks.length} 个压缩任务`
                : '无需压缩';
        },
        
        /**
         * 开始处理整合
         */
        beginConsolidation: () => {
            state.isProcessing = true;
        },
        
        /**
         * 完成整合
         */
        completeConsolidation: (result: 记忆整合结果) => {
            state.isProcessing = false;
            state.lastConsolidationTime = Date.now();
            state.summary = result.summary;
            state.pendingTasks = 获取待处理压缩任务队列(
                result.memory,
                { 短期记忆阈值: 30, 中期记忆阈值: 50 } as 记忆配置结构
            );
        },
        
        /**
         * 取消整合
         */
        cancelConsolidation: () => {
            state.isProcessing = false;
            state.summary = '整合已取消';
        },
    };
};

/**
 * 在记忆写入后自动整合（推荐在回合结束调用）
 * 
 * @param memory 写入后的记忆系统
 * @param config 记忆配置
 * @param options.autoThreshold 超过阈值多少倍时自动整合（默认1.5）
 * @returns 整合结果，如果不需要整合则返回null
 */
export const 自动记忆整合 = (
    memory: 记忆系统结构,
    config: 记忆配置结构,
    options?: { autoThreshold?: number }
): 记忆整合结果 | null => {
    const threshold = Math.max(1.0, options?.autoThreshold || 1.5);
    
    if (!需要立即整合(memory, config)) {
        return null;
    }
    
    return 执行记忆整合(memory, config, 1);
};

/**
 * 整合并将结果应用到记忆系统
 * 便捷函数，一步完成整合和状态更新
 */
export const 整合记忆系统 = async (
    memory: 记忆系统结构,
    config: 记忆配置结构,
    aiSummaryGenerator?: (task: 记忆压缩任务结构) => Promise<string>
): Promise<记忆整合结果> => {
    let currentMemory = 规范化记忆系统(memory);
    const normalizedConfig = 规范化记忆配置(config);
    
    const allCompressedLayers: 记忆压缩来源层[] = [];
    let totalCompressedCount = 0;
    
    // 处理直到没有待处理任务
    let iterations = 0;
    const maxIterations = 10;
    
    while (iterations < maxIterations) {
        iterations++;
        
        const pendingTasks = 获取待处理压缩任务队列(currentMemory, normalizedConfig);
        if (pendingTasks.length === 0) {
            break;
        }
        
        const task = pendingTasks[0]; // 按优先级取第一个
        
        // 使用AI生成摘要（如果提供）或有备用方案
        let summaryText: string;
        if (aiSummaryGenerator) {
            try {
                summaryText = await aiSummaryGenerator(task);
            } catch {
                summaryText = 生成压缩摘要(task);
            }
        } else {
            summaryText = 生成压缩摘要(task);
        }
        
        const result = 执行单次记忆压缩(currentMemory, task, summaryText);
        
        if (result.compressed) {
            currentMemory = result.memory;
            allCompressedLayers.push(...result.compressedLayers);
            totalCompressedCount += task.批次条数;
        } else {
            // 无法继续压缩，退出
            break;
        }
    }
    
    const summary = allCompressedLayers.length > 0
        ? `自动整合完成：执行了 ${allCompressedLayers.length} 次压缩，合并 ${totalCompressedCount} 条记忆`
        : '无需整合';
    
    return {
        memory: currentMemory,
        compressed: allCompressedLayers.length > 0,
        compressedLayers: Array.from(new Set(allCompressedLayers)),
        remainingTasks: 获取待处理压缩任务队列(currentMemory, normalizedConfig).length,
        summary,
    };
};
