/**
 * 记忆系统导入导出服务
 * 提供记忆数据的导出为文件和从文件导入功能
 */

import type { 记忆系统结构, 回忆条目结构 } from '../types';
import { 规范化记忆系统 } from '../hooks/useGame/memoryUtils';

export type 记忆导出格式 = 'json' | 'txt';

export interface 记忆导出选项 {
    格式: 记忆导出格式;
    包含回忆档案?: boolean;
    包含即时记忆?: boolean;
    包含短期记忆?: boolean;
    包含中期记忆?: boolean;
    包含长期记忆?: boolean;
    角色名称?: string;
    导出时间?: string;
}

interface 记忆导出元数据 {
    标题: string;
    角色: string;
    导出时间: string;
    版本: string;
    包含内容: string[];
}

/**
 * 格式化时间为可读字符串
 */
const 格式化时间 = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};

/**
 * 生成导出元数据
 */
const 生成元数据 = (选项: 记忆导出选项, 记忆: 记忆系统结构): 记忆导出元数据 => {
    const 包含内容: string[] = [];
    if (选项.包含回忆档案 && 记忆.回忆档案.length > 0) 包含内容.push('回忆档案');
    if (选项.包含即时记忆 && 记忆.即时记忆.length > 0) 包含内容.push('即时记忆');
    if (选项.包含短期记忆 && 记忆.短期记忆.length > 0) 包含内容.push('短期记忆');
    if (选项.包含中期记忆 && 记忆.中期记忆.length > 0) 包含内容.push('中期记忆');
    if (选项.包含长期记忆 && 记忆.长期记忆.length > 0) 包含内容.push('长期记忆');

    return {
        标题: `${选项.角色名称 || '游戏'}的记忆数据`,
        角色: 选项.角色名称 || '未知角色',
        导出时间: 选项.导出时间 || new Date().toLocaleString('zh-CN'),
        版本: '1.0',
        包含内容,
    };
};

/**
 * 转换为 JSON 格式
 */
export const 记忆转换为JSON = (记忆: 记忆系统结构, 选项: 记忆导出选项): string => {
    const 元数据 = 生成元数据(选项, 记忆);
    
    const 导出数据: any = {
        _元数据: 元数据,
    };

    if (选项.包含回忆档案) {
        导出数据.回忆档案 = 记忆.回忆档案;
    }
    if (选项.包含即时记忆) {
        导出数据.即时记忆 = 记忆.即时记忆;
    }
    if (选项.包含短期记忆) {
        导出数据.短期记忆 = 记忆.短期记忆;
    }
    if (选项.包含中期记忆) {
        导出数据.中期记忆 = 记忆.中期记忆;
    }
    if (选项.包含长期记忆) {
        导出数据.长期记忆 = 记忆.长期记忆;
    }

    return JSON.stringify(导出数据, null, 2);
};

/**
 * 转换为纯文本格式
 */
export const 记忆转换为纯文本 = (记忆: 记忆系统结构, 选项: 记忆导出选项): string => {
    const 元数据 = 生成元数据(选项, 记忆);
    const lines: string[] = [];

    lines.push('='.repeat(50));
    lines.push(`标题：${元数据.标题}`);
    lines.push(`角色：${元数据.角色}`);
    lines.push(`导出时间：${元数据.导出时间}`);
    lines.push(`版本：${元数据.版本}`);
    lines.push(`包含内容：${元数据.包含内容.join('、') || '无'}`);
    lines.push('='.repeat(50));
    lines.push('');

    if (选项.包含回忆档案 && 记忆.回忆档案.length > 0) {
        lines.push('【回忆档案】');
        lines.push('-'.repeat(30));
        记忆.回忆档案.forEach((item, idx) => {
            lines.push(`${item.名称}`);
            lines.push(`  概括：${item.概括 || '（无）'}`);
            lines.push(`  原文：${item.原文 || '（无）'}`);
            lines.push(`  回合：${item.回合} | 时间：${item.时间戳}`);
            lines.push('');
        });
        lines.push('');
    }

    if (选项.包含即时记忆 && 记忆.即时记忆.length > 0) {
        lines.push('【即时记忆】');
        lines.push('-'.repeat(30));
        记忆.即时记忆.forEach((item, idx) => {
            lines.push(`[${idx + 1}] ${item.slice(0, 100)}${item.length > 100 ? '...' : ''}`);
        });
        lines.push('');
    }

    if (选项.包含短期记忆 && 记忆.短期记忆.length > 0) {
        lines.push('【短期记忆】');
        lines.push('-'.repeat(30));
        记忆.短期记忆.forEach((item, idx) => {
            lines.push(`[${idx + 1}] ${item}`);
            lines.push('');
        });
    }

    if (选项.包含中期记忆 && 记忆.中期记忆.length > 0) {
        lines.push('【中期记忆】');
        lines.push('-'.repeat(30));
        记忆.中期记忆.forEach((item, idx) => {
            lines.push(`[${idx + 1}] ${item}`);
            lines.push('');
        });
    }

    if (选项.包含长期记忆 && 记忆.长期记忆.length > 0) {
        lines.push('【长期记忆】');
        lines.push('-'.repeat(30));
        记忆.长期记忆.forEach((item, idx) => {
            lines.push(`[${idx + 1}] ${item}`);
            lines.push('');
        });
    }

    return lines.join('\n');
};

/**
 * 导出记忆系统为 Blob
 */
export const 导出记忆系统 = (记忆: 记忆系统结构, 选项: 记忆导出选项): Blob => {
    let content: string;
    let mimeType: string;
    let extension: string;

    const 默认选项: 记忆导出选项 = {
        格式: 'json',
        包含回忆档案: true,
        包含即时记忆: true,
        包含短期记忆: true,
        包含中期记忆: true,
        包含长期记忆: true,
        ...选项,
    };

    switch (默认选项.格式) {
        case 'json':
            content = 记忆转换为JSON(记忆, 默认选项);
            mimeType = 'application/json;charset=utf-8';
            extension = 'json';
            break;
        case 'txt':
            content = 记忆转换为纯文本(记忆, 默认选项);
            mimeType = 'text/plain;charset=utf-8';
            extension = 'txt';
            break;
        default:
            content = 记忆转换为JSON(记忆, 默认选项);
            mimeType = 'application/json;charset=utf-8';
            extension = 'json';
    }

    return new Blob([content], { type: mimeType });
};

/**
 * 下载记忆系统文件
 */
export const 下载记忆系统 = (记忆: 记忆系统结构, 选项: 记忆导出选项): void => {
    const blob = 导出记忆系统(记忆, 选项);
    const url = URL.createObjectURL(blob);
    
    const safeTitle = (选项.角色名称 || '记忆数据')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, '_');
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const extension = 选项.格式 === 'txt' ? 'txt' : 'json';
    const filename = `${safeTitle}_memory_${timestamp}.${extension}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * 从 JSON 导入记忆系统
 */
export const 从JSON导入记忆 = (jsonString: string): { 成功: boolean; 记忆?: 记忆系统结构; 错误?: string } => {
    try {
        const data = JSON.parse(jsonString);
        
        if (!data || typeof data !== 'object') {
            return { 成功: false, 错误: '无效的 JSON 格式' };
        }

        const 记忆: 记忆系统结构 = {
            回忆档案: Array.isArray(data.回忆档案) ? data.回忆档案 : [],
            即时记忆: Array.isArray(data.即时记忆) ? data.即时记忆 : [],
            短期记忆: Array.isArray(data.短期记忆) ? data.短期记忆 : [],
            中期记忆: Array.isArray(data.中期记忆) ? data.中期记忆 : [],
            长期记忆: Array.isArray(data.长期记忆) ? data.长期记忆 : [],
        };

        return { 成功: true, 记忆: 规范化记忆系统(记忆) };
    } catch (error) {
        return { 
            成功: false, 
            错误: `解析失败：${error instanceof Error ? error.message : '未知错误'}` 
        };
    }
};

/**
 * 处理文件导入
 */
export const 处理记忆文件导入 = (file: File): Promise<{ 成功: boolean; 记忆?: 记忆系统结构; 错误?: string }> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target?.result;
            if (typeof content !== 'string') {
                resolve({ 成功: false, 错误: '无法读取文件内容' });
                return;
            }

            const isJson = file.name.endsWith('.json');
            
            if (isJson) {
                resolve(从JSON导入记忆(content));
            } else {
                // 纯文本格式不支持直接导入，提示用户
                resolve({ 
                    成功: false, 
                    错误: 'TXT 格式仅用于预览，不支持导入。请导入 JSON 格式文件。' 
                });
            }
        };

        reader.onerror = () => {
            resolve({ 成功: false, 错误: '文件读取失败' });
        };

        reader.readAsText(file);
    });
};

/**
 * 合并导入的记忆与现有记忆
 */
export const 合并记忆系统 = (
    现有记忆: 记忆系统结构,
    导入记忆: 记忆系统结构,
    选项?: {
        合并回忆档案?: boolean;
        合并即时记忆?: boolean;
        合并短期记忆?: boolean;
        合并中期记忆?: boolean;
        合并长期记忆?: boolean;
    }
): 记忆系统结构 => {
    const 合并选项 = {
        合并回忆档案: true,
        合并即时记忆: false, // 即时记忆通常不合并
        合并短期记忆: true,
        合并中期记忆: true,
        合并长期记忆: true,
        ...选项,
    };

    const 结果: 记忆系统结构 = 规范化记忆系统(现有记忆);

    if (合并选项.合并回忆档案 && 导入记忆.回忆档案.length > 0) {
        const 现有回忆Set = new Set(结果.回忆档案.map(r => `${r.回合}-${r.概括}`));
        导入记忆.回忆档案.forEach(item => {
            const key = `${item.回合}-${item.概括}`;
            if (!现有回忆Set.has(key)) {
                结果.回忆档案.push(item);
                现有回忆Set.add(key);
            }
        });
        // 按回合排序
        结果.回忆档案.sort((a, b) => (a.回合 || 0) - (b.回合 || 0));
    }

    if (合并选项.合并短期记忆 && 导入记忆.短期记忆.length > 0) {
        导入记忆.短期记忆.forEach(item => {
            if (!结果.短期记忆.includes(item)) {
                结果.短期记忆.push(item);
            }
        });
    }

    if (合并选项.合并中期记忆 && 导入记忆.中期记忆.length > 0) {
        导入记忆.中期记忆.forEach(item => {
            if (!结果.中期记忆.includes(item)) {
                结果.中期记忆.push(item);
            }
        });
    }

    if (合并选项.合并长期记忆 && 导入记忆.长期记忆.length > 0) {
        导入记忆.长期记忆.forEach(item => {
            if (!结果.长期记忆.includes(item)) {
                结果.长期记忆.push(item);
            }
        });
    }

    return 结果;
};
