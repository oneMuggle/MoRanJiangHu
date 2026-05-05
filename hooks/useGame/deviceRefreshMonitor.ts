/**
 * 后台设备刷新监控系统
 * 处理设备刷新任务队列，依次调用 AI 生成论坛/BDSM 内容并写回校园系统
 */

import { useEffect, useRef } from 'react';
import type { DeviceMode, DeviceGameContext } from '../../models/mobileDevice';
import type { 校园系统数据 } from '../../models/campusPhone';
import type { 校园NSFW设置 } from '../../models/campusNSFW';
import type { 当前可用接口结构 } from '../../utils/apiConfig';
import type { 接口设置结构 } from '../../models/system';
import { 刷新校园论坛, 论坛刷新结果 } from './campusForumWorkflow';

export interface 设备刷新任务 {
    id: string;
    app: string;
    status: 'pending' | 'processing' | 'done' | 'failed';
    error?: string;
    创建时间: number;
}

interface Use后台设备刷新监控Deps {
    设备刷新任务队列: 设备刷新任务[];
    set设备刷新任务队列: (updater: (prev: 设备刷新任务[]) => 设备刷新任务[]) => void;
    校园系统: 校园系统数据;
    set校园系统: (updater: (prev: 校园系统数据) => 校园系统数据) => void;
    eraId: string;
    mode: DeviceMode;
    apiConfig: 当前可用接口结构;
    apiSettings: 接口设置结构;
    gameContext: DeviceGameContext;
    nsfw设置: 校园NSFW设置;
    推送右下角提示: (toast: { title: string; message: string; tone?: 'info' | 'success' | 'error' }) => void;
}

export const use后台设备刷新监控 = (deps: Use后台设备刷新监控Deps) => {
    const 处理中Ref = useRef(false);

    useEffect(() => {
        if (处理中Ref.current) return;
        const pendingTask = deps.设备刷新任务队列.find(t => t.status === 'pending');
        if (!pendingTask) return;

        处理中Ref.current = true;

        // 标记为 processing
        deps.set设备刷新任务队列(prev =>
            prev.map(t => t.id === pendingTask.id ? { ...t, status: 'processing' } : t)
        );

        const executeRefresh = async () => {
            const { eraId, mode, apiConfig, apiSettings, gameContext, 校园系统, nsfw设置 } = deps;

            // 检查 API 配置是否可用
            if (!apiConfig || !apiSettings) {
                deps.set设备刷新任务队列(prev =>
                    prev.map(t => t.id === pendingTask.id
                        ? { ...t, status: 'failed', error: 'API 配置不可用' }
                        : t
                    )
                );
                处理中Ref.current = false;
                deps.推送右下角提示({
                    title: '刷新失败',
                    message: '请先配置 AI 接口',
                    tone: 'error',
                });
                return;
            }

            try {
                const result: 论坛刷新结果 = await 刷新校园论坛({
                    eraId,
                    mode,
                    apiConfig,
                    apiSettings,
                    gameContext,
                    校园系统,
                    nsfw设置,
                    count: 5,
                });

                // 将生成的帖子写入校园系统
                deps.set校园系统(prev => {
                    const next = { ...prev };
                    if (result.论坛帖子.length > 0) {
                        const existing = next.论坛帖子列表 || [];
                        next.论坛帖子列表 = [...result.论坛帖子, ...existing].slice(0, 50);
                    }
                    if (result.BDSM帖子.length > 0) {
                        const existing = next.BDSM帖子列表 || [];
                        next.BDSM帖子列表 = [...result.BDSM帖子, ...existing].slice(0, 50);
                    }
                    return next;
                });

                deps.set设备刷新任务队列(prev =>
                    prev.map(t => t.id === pendingTask.id ? { ...t, status: 'done' } : t)
                );

                const total = result.论坛帖子.length + result.BDSM帖子.length;
                deps.推送右下角提示({
                    title: '刷新完成',
                    message: `已生成 ${total} 条新内容`,
                    tone: 'success',
                });
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                deps.set设备刷新任务队列(prev =>
                    prev.map(t => t.id === pendingTask.id
                        ? { ...t, status: 'failed', error: errorMsg }
                        : t
                    )
                );
                deps.推送右下角提示({
                    title: '刷新失败',
                    message: errorMsg.slice(0, 80),
                    tone: 'error',
                });
            } finally {
                处理中Ref.current = false;
            }
        };

        void executeRefresh();
    }, [deps.设备刷新任务队列]);
};
