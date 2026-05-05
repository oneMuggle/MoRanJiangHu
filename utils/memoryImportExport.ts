/**
 * 记忆系统导入导出工具函数
 * 提供快捷的记忆导入导出功能
 */

import { 
    下载记忆系统, 
    记忆导出格式, 
    记忆导出选项,
    处理记忆文件导入,
    合并记忆系统,
    导出记忆系统 
} from '../services/memoryImportExportService';
import type { 记忆系统结构 } from '../types';

/**
 * 完整导出记忆系统（JSON格式）
 */
export const 快速导出记忆JSON = (
    记忆: 记忆系统结构,
    角色名称?: string
): void => {
    下载记忆系统(记忆, {
        格式: 'json',
        包含回忆档案: true,
        包含即时记忆: true,
        包含短期记忆: true,
        包含中期记忆: true,
        包含长期记忆: true,
        角色名称,
    });
};

/**
 * 完整导出记忆系统（纯文本格式）
 */
export const 快速导出记忆Txt = (
    记忆: 记忆系统结构,
    角色名称?: string
): void => {
    下载记忆系统(记忆, {
        格式: 'txt',
        包含回忆档案: true,
        包含即时记忆: true,
        包含短期记忆: true,
        包含中期记忆: true,
        包含长期记忆: true,
        角色名称,
    });
};

/**
 * 仅导出回忆档案
 */
export const 仅导出回忆档案 = (
    记忆: 记忆系统结构,
    角色名称?: string
): void => {
    下载记忆系统(记忆, {
        格式: 'json',
        包含回忆档案: true,
        包含即时记忆: false,
        包含短期记忆: false,
        包含中期记忆: false,
        包含长期记忆: false,
        角色名称,
    });
};

/**
 * 仅导出短期和中期记忆
 */
export const 导出短中期记忆 = (
    记忆: 记忆系统结构,
    角色名称?: string
): void => {
    下载记忆系统(记忆, {
        格式: 'json',
        包含回忆档案: false,
        包含即时记忆: false,
        包含短期记忆: true,
        包含中期记忆: true,
        包含长期记忆: false,
        角色名称,
    });
};

/**
 * 仅导出长期记忆
 */
export const 仅导出长期记忆 = (
    记忆: 记忆系统结构,
    角色名称?: string
): void => {
    下载记忆系统(记忆, {
        格式: 'json',
        包含回忆档案: false,
        包含即时记忆: false,
        包含短期记忆: false,
        包含中期记忆: false,
        包含长期记忆: true,
        角色名称,
    });
};

/**
 * 导出函数别名
 */
export { 下载记忆系统 as 导出记忆 };

/**
 * 导入记忆文件
 */
export const 导入记忆文件 = 处理记忆文件导入;

/**
 * 合并记忆系统
 */
export { 合并记忆系统 as 合并记忆, 合并记忆系统 };

// 重新导出类型
export type { 记忆导出格式, 记忆导出选项 };
