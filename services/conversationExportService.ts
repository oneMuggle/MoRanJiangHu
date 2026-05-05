import type { 聊天记录结构 } from '../types';

export type 导出格式 = 'txt' | 'json' | 'md';

export interface 导出选项 {
    格式: 导出格式;
    包含元数据?: boolean;
    包含时间戳?: boolean;
    角色名称?: string;
    对话标题?: string;
}

interface 导出元数据 {
    标题: string;
    角色: string;
    导出时间: string;
    对话条数: number;
}

/**
 * 格式化时间戳为可读字符串
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
const 生成元数据 = (选项: 导出选项, 对话条数: number): 导出元数据 => {
    return {
        标题: 选项.对话标题 || '对话记录',
        角色: 选项.角色名称 || '未知角色',
        导出时间: new Date().toLocaleString('zh-CN'),
        对话条数,
    };
};

/**
 * 转换为纯文本格式
 */
export const 转换为纯文本 = (
    历史: 聊天记录结构[],
    选项: 导出选项
): string => {
    const lines: string[] = [];
    const 元数据 = 生成元数据(选项, 历史.length);

    lines.push('='.repeat(50));
    lines.push(`标题：${元数据.标题}`);
    lines.push(`角色：${元数据.角色}`);
    lines.push(`导出时间：${元数据.导出时间}`);
    lines.push(`对话条数：${元数据.对话条数}`);
    lines.push('='.repeat(50));
    lines.push('');

    for (const item of 历史) {
        const 角色标签 = item.role === 'user' ? '用户' : item.role === 'assistant' ? 'AI' : '系统';
        const 时间信息 = 选项.包含时间戳 ? `[${格式化时间(item.timestamp)}] ` : '';
        
        lines.push(`${时间信息}${角色标签}：`);
        lines.push(item.content);
        lines.push('');
        lines.push('-'.repeat(30));
        lines.push('');
    }

    return lines.join('\n');
};

/**
 * 转换为 JSON 格式
 */
export const 转换为JSON = (
    历史: 聊天记录结构[],
    选项: 导出选项
): string => {
    const 元数据 = 生成元数据(选项, 历史.length);
    
    const 导出数据 = {
        ...元数据,
        对话记录: 历史.map((item) => ({
            角色: item.role === 'user' ? '用户' : item.role === 'assistant' ? 'AI' : '系统',
            内容: item.content,
            时间戳: 选项.包含时间戳 ? item.timestamp : undefined,
            游戏时间: item.gameTime,
        })),
    };

    return JSON.stringify(导出数据, null, 2);
};

/**
 * 转换为 Markdown 格式
 */
export const 转换为Markdown = (
    历史: 聊天记录结构[],
    选项: 导出选项
): string => {
    const lines: string[] = [];
    const 元数据 = 生成元数据(选项, 历史.length);

    lines.push('# ' + 元数据.标题);
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push(`**角色**：${元数据.角色}`);
    lines.push(`**导出时间**：${元数据.导出时间}`);
    lines.push(`**对话条数**：${元数据.对话条数}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const item of 历史) {
        const 角色标签 = item.role === 'user' ? '**用户**' : item.role === 'assistant' ? '**AI**' : '*系统*';
        const 时间信息 = 选项.包含时间戳 ? `*${格式化时间(item.timestamp)}*` : '';
        
        lines.push(`### ${角色标签} ${时间信息}`);
        lines.push('');
        lines.push(item.content);
        lines.push('');
    }

    return lines.join('\n');
};

/**
 * 导出对话记录为主 Blob
 */
export const 导出对话记录 = (
    历史: 聊天记录结构[],
    选项: 导出选项
): Blob => {
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (选项.格式) {
        case 'txt':
            content = 转换为纯文本(历史, 选项);
            mimeType = 'text/plain;charset=utf-8';
            extension = 'txt';
            break;
        case 'json':
            content = 转换为JSON(历史, 选项);
            mimeType = 'application/json;charset=utf-8';
            extension = 'json';
            break;
        case 'md':
            content = 转换为Markdown(历史, 选项);
            mimeType = 'text/markdown;charset=utf-8';
            extension = 'md';
            break;
        default:
            content = 转换为纯文本(历史, 选项);
            mimeType = 'text/plain;charset=utf-8';
            extension = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    return blob;
};

/**
 * 下载对话记录文件
 */
export const 下载对话记录 = (
    历史: 聊天记录结构[],
    选项: 导出选项
): void => {
    const blob = 导出对话记录(历史, 选项);
    const url = URL.createObjectURL(blob);
    
    const safeTitle = (选项.对话标题 || '对话记录')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/\s+/g, '_');
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeTitle}_${timestamp}.${选项.格式}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理 URL 对象
    setTimeout(() => URL.revokeObjectURL(url), 100);
};
