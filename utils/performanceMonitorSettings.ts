/**
 * 性能监控设置工具
 * 提供性能监控配置的规范化、默认值和存取逻辑
 */

import { 性能监控配置结构, 默认性能监控配置 } from '../models/system';

export const 性能监控设置键 = 'performance_monitor_settings';

/**
 * 规范化性能监控设置
 */
export const 规范化性能监控设置 = (
    raw?: Partial<性能监控配置结构> | null
): 性能监控配置结构 => {
    return {
        启用性能监控: raw?.启用性能监控 ?? 默认性能监控配置.启用性能监控,
        显示FPS: raw?.显示FPS ?? 默认性能监控配置.显示FPS,
        AI响应慢阈值ms: Number(raw?.AI响应慢阈值ms) || 默认性能监控配置.AI响应慢阈值ms,
        生图慢阈值ms: Number(raw?.生图慢阈值ms) || 默认性能监控配置.生图慢阈值ms,
    };
};
