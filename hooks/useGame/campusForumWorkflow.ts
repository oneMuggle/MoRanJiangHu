/**
 * 校园论坛 AI 刷新工作流
 * 为普通论坛和 BDSM 深夜板块生成内容
 */

import type { 当前可用接口结构 } from '../../utils/apiConfig';
import type { 接口设置结构 } from '../../models/system';
import type { DeviceMode, DeviceGameContext } from '../../models/mobileDevice';
import type { 校园系统数据 } from '../../models/campusPhone';
import type { 校园NSFW设置 } from '../../models/campusNSFW';
import { 生成设备消息, 解析AI论坛帖子, 解析AIBDSM帖子 } from './deviceAiWorkflow';

export interface 论坛刷新结果 {
    论坛帖子: { id: string; 标题: string; 分类: string }[];
    BDSM帖子: { id: string; 标题: string; 子分类: string }[];
    errors: string[];
}

/** 刷新校园论坛内容（普通 + BDSM） */
export async function 刷新校园论坛(
    params: {
        eraId: string;
        mode: DeviceMode;
        apiConfig: 当前可用接口结构;
        apiSettings: 接口设置结构;
        gameContext: DeviceGameContext;
        校园系统: 校园系统数据;
        nsfw设置: 校园NSFW设置;
        count?: number;
        signal?: AbortSignal;
    }
): Promise<论坛刷新结果> {
    const { eraId, mode, apiConfig, apiSettings, gameContext, 校园系统: _校园系统, nsfw设置, count = 5, signal } = params;

    const result: 论坛刷新结果 = { 论坛帖子: [], BDSM帖子: [], errors: [] };

    const appContext = {
        当前场景: gameContext.世界?.进行中事件?.[0]?.事件名 || '',
        角色名: gameContext.角色?.姓名 || '',
        当前位置: '',
        世界状态: '',
    };

    // 1. 生成普通论坛帖子
    try {
        const forumResult = await 生成设备消息({
            eraId, mode, appType: 'forum', context: appContext, count, signal,
        }, apiConfig, apiSettings, count);

        const parsedPosts = 解析AI论坛帖子(forumResult.messages as unknown[]);
        result.论坛帖子 = parsedPosts.map(p => ({ id: p.id, 标题: p.标题, 分类: p.分类 }));
    } catch (err) {
        result.errors.push(`论坛生成失败: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 2. 生成 BDSM 帖子（如果启用）
    if (nsfw设置.启用BDSM论坛 && nsfw设置.BDSM内容强度 !== '关闭') {
        try {
            const bdsmResult = await 生成设备消息({
                eraId, mode, appType: 'bdsn', context: appContext, count, signal,
            }, apiConfig, apiSettings, count);

            const parsedPosts = 解析AIBDSM帖子(bdsmResult.messages as unknown[]);
            result.BDSM帖子 = parsedPosts.map(p => ({ id: p.id, 标题: p.标题, 子分类: p.子分类 }));
        } catch (err) {
            result.errors.push(`BDSM生成失败: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    return result;
}
