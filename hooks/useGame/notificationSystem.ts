/** 右下角通知系统 */

export type 右下角提示结构 = {
    id: string;
    title: string;
    message: string;
    tone?: 'info' | 'success' | 'error';
};

export const 创建通知系统 = (set右下角提示列表: React.Dispatch<React.SetStateAction<右下角提示结构[]>>) => {
    /** 推送右下角提示 */
    const 推送右下角提示 = (toast: Omit<右下角提示结构, 'id'>) => {
        const nextId = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        set右下角提示列表(prev => [...prev, { id: nextId, ...toast }].slice(-4));
        window.setTimeout(() => {
            set右下角提示列表(prev => prev.filter(item => item.id !== nextId));
        }, 4200);
    };

    /** 关闭右下角提示 */
    const 关闭右下角提示 = (toastId: string) => {
        if (!toastId) return;
        set右下角提示列表(prev => prev.filter(item => item.id !== toastId));
    };

    return { 推送右下角提示, 关闭右下角提示 };
};
