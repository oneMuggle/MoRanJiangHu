/** 错误格式化工具函数 */

/** 提取原始报错详情 */
export const 提取原始报错详情 = (error: unknown): string => {
    const raw = (error as any)?.detail ?? (error as any)?.message ?? error ?? '未知错误';
    if (typeof raw === 'string') return raw;
    try {
        return JSON.stringify(raw, null, 2);
    } catch {
        return String(raw);
    }
};

/** 格式化错误详情 */
export const 格式化错误详情 = (error: unknown): string => {
    if (!error) return '未知错误';
    if (typeof error === 'string') return error;
    const lines: string[] = [];
    if ((error as any)?.name) lines.push(`Name: ${(error as any).name}`);
    if (typeof (error as any)?.status === 'number') lines.push(`Status: ${(error as any).status}`);
    if (typeof (error as any)?.message === 'string' && (error as any).message.trim()) {
        lines.push(`Message: ${(error as any).message}`);
    }
    const detail = (error as any)?.detail ?? (error as any)?.parseDetail;
    if (detail) {
        const detailText = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
        lines.push('Detail:');
        lines.push(detailText);
    }
    if (lines.length > 0) return lines.join('\n');
    try {
        return JSON.stringify(error, null, 2);
    } catch {
        return String(error);
    }
};

/** 提取解析失败原始信息 */
export const 提取解析失败原始信息 = (error: unknown): string => {
    if (!error) return '返回内容不符合标签协议';
    if (typeof error === 'string' && error.trim().length > 0) return error.trim();
    if (typeof (error as any)?.parseDetail === 'string' && (error as any).parseDetail.trim().length > 0) {
        return (error as any).parseDetail.trim();
    }
    if (typeof (error as any)?.message === 'string' && (error as any).message.trim().length > 0) {
        return (error as any).message.trim();
    }
    return '返回内容不符合标签协议';
};
