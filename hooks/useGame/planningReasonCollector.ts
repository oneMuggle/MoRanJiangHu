/** 规划原因收集器 */

import type { 剧情规划结构, 女主剧情规划结构, 环境信息结构, 剧情系统结构, TavernCommand } from '../../types';
import { 环境时间转标准串 } from './timeUtils';
import {
    规范化剧情规划状态,
    规范化女主剧情规划状态,
    规范化剧情状态
} from './storyState';
import { 游戏时间转排序值 } from './responseTextHelpers';

const 当前时间已达到 = (currentTime?: string, targetTime?: string): boolean => {
    const currentSort = 游戏时间转排序值(currentTime);
    const targetSort = 游戏时间转排序值(targetTime);
    if (currentSort === null || targetSort === null) return false;
    return currentSort >= targetSort;
};

/** 去重文本数组 */
export const 去重文本数组 = (items: string[]): string[] => {
    const result: string[] = [];
    (Array.isArray(items) ? items : []).forEach((item) => {
        const text = typeof item === 'string' ? item.trim() : '';
        if (text && !result.includes(text)) result.push(text);
    });
    return result;
};

/** 收集剧情规划时间触发原因 */
export const 收集剧情规划时间触发原因 = (planLike?: 剧情规划结构, envLike?: 环境信息结构): string[] => {
    const currentTime = 环境时间转标准串(envLike);
    if (!currentTime) return [];
    const normalizedPlan = 规范化剧情规划状态(planLike);
    const reasons: string[] = [];
    (Array.isArray(normalizedPlan?.待触发事件) ? normalizedPlan.待触发事件 : []).forEach((item: any) => {
        const name = typeof item?.事件名 === 'string' ? item.事件名.trim() : '未命名事件';
        [item?.计划触发时间, item?.最早触发时间, item?.最晚触发时间].forEach((time) => {
            if (当前时间已达到(currentTime, time)) {
                reasons.push(`剧情待触发事件「${name}」已到时间点 ${time}`);
            }
        });
    });
    (Array.isArray(normalizedPlan?.当前章任务) ? normalizedPlan.当前章任务 : []).forEach((item: any) => {
        const name = typeof item?.标题 === 'string' ? item.标题.trim() : '未命名任务';
        [item?.计划执行时间, item?.最早执行时间, item?.最晚执行时间].forEach((time) => {
            if (当前时间已达到(currentTime, time)) {
                reasons.push(`剧情任务「${name}」已到执行时间 ${time}`);
            }
        });
    });
    return 去重文本数组(reasons);
};

/** 收集女主规划时间触发原因 */
export const 收集女主规划时间触发原因 = (planLike?: 女主剧情规划结构, envLike?: 环境信息结构): string[] => {
    const currentTime = 环境时间转标准串(envLike);
    if (!currentTime) return [];
    const normalizedPlan = 规范化女主剧情规划状态(planLike);
    if (!normalizedPlan) return [];
    const reasons: string[] = [];
    (Array.isArray(normalizedPlan?.女主互动事件) ? normalizedPlan.女主互动事件 : []).forEach((item: any) => {
        const eventId = typeof item?.事件名 === 'string' ? item.事件名.trim() : '未知排期';
        const heroineName = typeof item?.女主姓名 === 'string' ? item.女主姓名.trim() : '未知女主';
        [item?.计划触发时间, item?.最早触发时间, item?.最晚触发时间].forEach((time) => {
            if (当前时间已达到(currentTime, time)) {
                reasons.push(`女主互动事件「${heroineName}/${eventId}」已到时间点 ${time}`);
            }
        });
    });
    return 去重文本数组(reasons);
};

/** 收集剧情正文命中原因 */
export const 收集剧情正文命中原因 = (
    storyLike?: 剧情系统结构,
    planLike?: 剧情规划结构,
    latestBodyText?: string
): string[] => {
    const body = typeof latestBodyText === 'string' ? latestBodyText.trim() : '';
    if (!body) return [];
    const normalizedStory = 规范化剧情状态(storyLike);
    const normalizedPlan = 规范化剧情规划状态(planLike);
    const keywords = 去重文本数组([
        normalizedStory?.当前章节?.标题 || '',
        ...(Array.isArray(normalizedPlan?.待触发事件) ? normalizedPlan.待触发事件.map((item: any) => item?.事件名 || '') : []),
        ...(Array.isArray(normalizedPlan?.当前章任务) ? normalizedPlan.当前章任务.map((item: any) => item?.标题 || '') : [])
    ]).filter((item) => item.length >= 2);
    return keywords
        .filter((keyword) => body.includes(keyword))
        .map((keyword) => `最近正文命中剧情线索「${keyword}」`);
};

/** 收集女主正文命中原因 */
export const 收集女主正文命中原因 = (planLike?: 女主剧情规划结构, latestBodyText?: string): string[] => {
    const body = typeof latestBodyText === 'string' ? latestBodyText.trim() : '';
    if (!body) return [];
    const normalizedPlan = 规范化女主剧情规划状态(planLike);
    if (!normalizedPlan) return [];
    const keywords = 去重文本数组([
        ...(Array.isArray(normalizedPlan?.女主条目) ? normalizedPlan.女主条目.map((item: any) => item?.女主姓名 || '') : [])
    ]).filter((item) => item.length >= 2);
    return keywords
        .filter((keyword) => body.includes(keyword))
        .map((keyword) => `最近正文命中女主线索「${keyword}」`);
};

/** 过滤规划补丁命令 */
export const 过滤规划补丁命令 = (
    commands: TavernCommand[],
    allowedPrefixes: string[]
): TavernCommand[] => (
    (Array.isArray(commands) ? commands : [])
        .filter((cmd) => cmd && typeof cmd.key === 'string' && typeof cmd.action === 'string')
        .filter((cmd) => allowedPrefixes.some((prefix) => cmd.key === prefix || cmd.key.startsWith(`${prefix}.`) || cmd.key.startsWith(`${prefix}[`)))
);
