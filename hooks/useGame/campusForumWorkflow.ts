/**
 * 校园论坛 AI 刷新工作流
 * 为普通论坛和 BDSM 深夜板块生成内容
 */

import type { 当前可用接口结构 } from '../../utils/apiConfig';
import type { 接口设置结构 } from '../../models/system';
import type { DeviceMode, DeviceGameContext } from '../../models/mobileDevice';
import type { 校园系统数据, 论坛帖子 } from '../../models/campusPhone';
import type { 校园NSFW设置 } from '../../models/campusNSFW';
import type { BDSM论坛帖子 } from '../../models/campusNSFW/bdsm-forum';
import { 生成设备原始消息, 解析AI论坛帖子, 解析AIBDSM帖子 } from './deviceAiWorkflow';

export interface 论坛刷新结果 {
    论坛帖子: 论坛帖子[];
    BDSM帖子: BDSM论坛帖子[];
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
        const forumRawItems = await 生成设备原始消息({
            eraId, mode, appType: 'forum', context: appContext, count, signal,
        }, apiConfig, apiSettings, count);

        const parsedPosts = 解析AI论坛帖子(forumRawItems);
        result.论坛帖子 = parsedPosts;
    } catch (err) {
        result.errors.push(`论坛生成失败: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 2. 生成 BDSM 帖子（如果启用）
    if (nsfw设置.启用BDSM论坛 && nsfw设置.BDSM内容强度 !== '关闭') {
        try {
            const bdsmRawItems = await 生成设备原始消息({
                eraId, mode, appType: 'bdsn', context: appContext, count, signal,
            }, apiConfig, apiSettings, count);

            const parsedPosts = 解析AIBDSM帖子(bdsmRawItems);
            result.BDSM帖子 = parsedPosts;
        } catch (err) {
            result.errors.push(`BDSM生成失败: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    return result;
}
