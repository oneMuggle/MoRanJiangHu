/**
 * 对话导出工具函数
 * 提供聊天记录的格式化导出功能
 */

import { 下载对话记录, 导出格式, 导出选项 } from '../services/conversationExportService';
import type { 聊天记录结构 } from '../types';

/**
 * 快捷导出为纯文本
 */
export const 快速导出为Txt = (
    历史: 聊天记录结构[],
    角色名称?: string,
    对话标题?: string
): void => {
    下载对话记录(历史, {
        格式: 'txt',
        包含元数据: true,
        包含时间戳: true,
        角色名称,
        对话标题,
    });
};

/**
 * 快捷导出为 JSON
 */
export const 快速导出为Json = (
    历史: 聊天记录结构[],
    角色名称?: string,
    对话标题?: string
): void => {
    下载对话记录(历史, {
        格式: 'json',
        包含元数据: true,
        包含时间戳: true,
        角色名称,
        对话标题,
    });
};

/**
 * 快捷导出为 Markdown
 */
export const 快速导出为Md = (
    历史: 聊天记录结构[],
    角色名称?: string,
    对话标题?: string
): void => {
    下载对话记录(历史, {
        格式: 'md',
        包含元数据: true,
        包含时间戳: true,
        角色名称,
        对话标题,
    });
};

/**
 * 导出函数别名（保持命名一致性）
 */
export { 下载对话记录 as 导出对话 };
export type { 导出格式, 导出选项 };
