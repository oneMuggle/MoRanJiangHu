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
import { 生成设备原始消息, 解析AI论坛帖子, 解析AIBDSM帖子 } from './deviceAiWorkflow';

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
            const { eraId, mode, apiConfig, apiSettings, gameContext, nsfw设置 } = deps;
            const { app } = pendingTask;

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

            const appContext = {
                当前场景: gameContext.世界?.进行中事件?.[0]?.事件名 || '',
                角色名: gameContext.角色?.姓名 || '',
                当前位置: '',
                世界状态: '',
            };

            let 论坛帖子数 = 0;
            let BDSM帖子数 = 0;
            const errors: string[] = [];

            // 根据当前 app 决定刷新哪些内容
            const 需要刷新论坛 = app === 'forum' || app === 'confession';
            const 需要刷新BDSM = app === 'bdsn';

            if (需要刷新论坛) {
                try {
                    const forumRawItems = await 生成设备原始消息({
                        eraId, mode, appType: 'forum', context: appContext, count: 5,
                    }, apiConfig, apiSettings, 5);
                    const parsed = 解析AI论坛帖子(forumRawItems);
                    if (parsed.length > 0) {
                        deps.set校园系统(prev => {
                            const existing = prev.论坛帖子列表 || [];
                            return { ...prev, 论坛帖子列表: [...parsed, ...existing].slice(0, 50) };
                        });
                        论坛帖子数 = parsed.length;
                    }
                } catch (err) {
                    errors.push(`论坛生成失败: ${err instanceof Error ? err.message : String(err)}`);
                }
            }

            if (需要刷新BDSM && nsfw设置.启用BDSM论坛 && nsfw设置.BDSM内容强度 !== '关闭') {
                try {
                    const bdsmRawItems = await 生成设备原始消息({
                        eraId, mode, appType: 'bdsn', context: appContext, count: 5,
                    }, apiConfig, apiSettings, 5);
                    const parsed = 解析AIBDSM帖子(bdsmRawItems);
                    if (parsed.length > 0) {
                        deps.set校园系统(prev => {
                            const existing = prev.BDSM帖子列表 || [];
                            return { ...prev, BDSM帖子列表: [...parsed, ...existing].slice(0, 50) };
                        });
                        BDSM帖子数 = parsed.length;
                    }
                } catch (err) {
                    errors.push(`BDSM生成失败: ${err instanceof Error ? err.message : String(err)}`);
                }
            }

            // 标记任务完成
            if (errors.length > 0) {
                deps.set设备刷新任务队列(prev =>
                    prev.map(t => t.id === pendingTask.id
                        ? { ...t, status: 'failed', error: errors.join('; ') }
                        : t
                    )
                );
                deps.推送右下角提示({
                    title: '刷新部分失败',
                    message: errors[0]?.slice(0, 80) || '未知错误',
                    tone: 'error',
                });
            } else {
                deps.set设备刷新任务队列(prev =>
                    prev.map(t => t.id === pendingTask.id ? { ...t, status: 'done' } : t)
                );
                const total = 论坛帖子数 + BDSM帖子数;
                deps.推送右下角提示({
                    title: '刷新完成',
                    message: `已生成 ${total} 条新内容`,
                    tone: 'success',
                });
            }

            处理中Ref.current = false;
        };

        void executeRefresh();
    }, [deps.设备刷新任务队列]);
};
