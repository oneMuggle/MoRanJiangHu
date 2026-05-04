/**
 * 字符串规范化工具集
 * 集中管理跨文件重复的文本规范化函数，避免重复定义。
 *
 * 所有需要文本规范化的模块应从此文件导入，禁止自行定义同名函数。
 */

/**
 * 规范化文本 - 移除BOM字符、转换CRLF为LF、去除首尾空白
 * @param value 输入字符串
 * @param fallback 非字符串时的默认值
 */
export const 规范化文本 = (value: unknown, fallback = ''): string => {
    if (typeof value !== 'string') return fallback;
    return value
        .replace(/\r\n/g, '\n')
        .replace(/\uFEFF/g, '')
        .trim();
};

/**
 * 规范化标题候选行 - 用于章节标题等场景的文本规范化
 * 在规范化文本基础上额外处理：
 * - 多个空白字符合并为单个空格
 * - 多个管道符合并为单个
 * @param value 输入字符串
 */
export const 规范化标题候选行 = (value: string): string => 规范化文本(value)
    .replace(/[\t\u3000 ]+/g, ' ')
    .replace(/[|｜]+/g, '｜')
    .trim();
