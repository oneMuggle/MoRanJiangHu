import {
    GameResponse,
    角色数据结构,
    环境信息结构,
    世界数据结构,
    战斗状态结构,
    详细门派结构,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构
} from '../../../types';
import type { 校园系统数据 } from '../../../models/campusPhone';
import type { 校园NSFW系统扩展 } from '../../../models/campusNSFW';
import type { 写真系统扩展 } from '../../../models/photographyNSFW';
import { applyStateCommand } from '../../../utils/stateHelpers';

const 深拷贝 = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export type 响应命令处理状态 = {
    角色: 角色数据结构;
    环境: 环境信息结构;
    社交: any[];
    世界: 世界数据结构;
    战斗: 战斗状态结构;
    玩家门派: 详细门派结构;
    任务列表: any[];
    约定列表: any[];
    剧情: 剧情系统结构;
    剧情规划: 剧情规划结构;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;
    校园系统: 校园系统数据;
};

type 响应命令处理依赖 = {
    规范化环境信息: (envLike?: any) => 环境信息结构;
    规范化社交列表: (raw?: any[], options?: { 合并同名?: boolean }) => any[];
    规范化世界状态: (raw?: any) => 世界数据结构;
    规范化战斗状态: (raw?: any) => 战斗状态结构;
    规范化门派状态: (raw?: any) => 详细门派结构;
    规范化剧情状态: (raw?: any) => 剧情系统结构;
    规范化剧情规划状态: (raw?: any) => 剧情规划结构;
    规范化女主剧情规划状态: (raw?: any) => 女主剧情规划结构 | undefined;
    规范化同人剧情规划状态: (raw?: any) => 同人剧情规划结构 | undefined;
    规范化同人女主剧情规划状态: (raw?: any) => 同人女主剧情规划结构 | undefined;
    规范化角色物品容器映射: (raw?: any) => 角色数据结构;
    规范化校园系统: (raw?: any) => 校园系统数据;
    战斗结束自动清空: (battle: 战斗状态结构, story?: 剧情系统结构) => 战斗状态结构;
    设置角色?: (value: 角色数据结构) => void;
    设置环境?: (value: 环境信息结构) => void;
    设置社交?: (value: any[]) => void;
    设置世界?: (value: 世界数据结构) => void;
    设置战斗?: (value: 战斗状态结构) => void;
    设置玩家门派?: (value: 详细门派结构) => void;
    设置任务列表?: (value: any[]) => void;
    设置约定列表?: (value: any[]) => void;
    设置剧情?: (value: 剧情系统结构) => void;
    设置剧情规划?: (value: 剧情规划结构) => void;
    设置女主剧情规划?: (value: 女主剧情规划结构 | undefined) => void;
    设置同人剧情规划?: (value: 同人剧情规划结构 | undefined) => void;
    设置同人女主剧情规划?: (value: 同人女主剧情规划结构 | undefined) => void;
    设置校园系统?: (value: 校园系统数据) => void;
    命令后校准?: (state: 响应命令处理状态) => { state: 响应命令处理状态; corrections?: string[] } | 响应命令处理状态;
};

export const 执行响应命令处理 = (
    response: GameResponse,
    currentState: 响应命令处理状态,
    deps: 响应命令处理依赖,
    baseState?: Partial<响应命令处理状态>,
    options?: {
        applyState?: boolean;
        /** AI 原始响应文本，用于解析 <欲望系统状态> XML 标签 */
        rawContent?: string;
    }
): 响应命令处理状态 => {
    const shouldApplyState = options?.applyState !== false;
    const rawContent = options?.rawContent;
    let charBuffer = baseState?.角色 || currentState.角色;
    const 原始气运列表 = Array.isArray(charBuffer?.气运列表) ? charBuffer.气运列表 : [];
    let envBuffer = deps.规范化环境信息(baseState?.环境 || currentState.环境);
    let socialBuffer = Array.isArray(baseState?.社交) ? baseState.社交 : currentState.社交;
    let worldBuffer = deps.规范化世界状态(baseState?.世界 || currentState.世界);
    let battleBuffer = deps.规范化战斗状态(baseState?.战斗 || currentState.战斗);
    let sectBuffer = deps.规范化门派状态(baseState?.玩家门派 || currentState.玩家门派);
    let tasksBuffer = Array.isArray(baseState?.任务列表) ? baseState.任务列表 : currentState.任务列表;
    let agreementsBuffer = Array.isArray(baseState?.约定列表) ? baseState.约定列表 : currentState.约定列表;
    let storyBuffer = deps.规范化剧情状态(baseState?.剧情 || currentState.剧情);
    let storyPlanBuffer = deps.规范化剧情规划状态(baseState?.剧情规划 || currentState.剧情规划);
    let heroinePlanBuffer = deps.规范化女主剧情规划状态(baseState?.女主剧情规划 ?? currentState.女主剧情规划);
    let fandomStoryPlanBuffer = deps.规范化同人剧情规划状态(baseState?.同人剧情规划 ?? currentState.同人剧情规划);
    let fandomHeroinePlanBuffer = deps.规范化同人女主剧情规划状态(baseState?.同人女主剧情规划 ?? currentState.同人女主剧情规划);
    let campusBuffer = deps.规范化校园系统(baseState?.校园系统 ?? currentState.校园系统);

    if (Array.isArray(response.tavern_commands)) {
        response.tavern_commands.forEach(cmd => {
            const result = applyStateCommand(
                charBuffer,
                envBuffer,
                socialBuffer,
                worldBuffer,
                battleBuffer,
                storyBuffer,
                storyPlanBuffer,
                heroinePlanBuffer,
                fandomStoryPlanBuffer,
                fandomHeroinePlanBuffer,
                sectBuffer,
                tasksBuffer,
                agreementsBuffer,
                campusBuffer,
                cmd.key,
                cmd.value,
                cmd.action
            );
            charBuffer = result.char;
            envBuffer = deps.规范化环境信息(result.env);
            socialBuffer = deps.规范化社交列表(result.social, { 合并同名: false });
            worldBuffer = deps.规范化世界状态(result.world);
            battleBuffer = result.battle;
            sectBuffer = deps.规范化门派状态(result.sect);
            tasksBuffer = Array.isArray(result.tasks) ? result.tasks : [];
            agreementsBuffer = Array.isArray(result.agreements) ? result.agreements : [];
            storyBuffer = result.story;
            storyPlanBuffer = deps.规范化剧情规划状态(result.storyPlan);
            heroinePlanBuffer = deps.规范化女主剧情规划状态(result.heroinePlan);
            fandomStoryPlanBuffer = deps.规范化同人剧情规划状态(result.fandomStoryPlan);
            fandomHeroinePlanBuffer = deps.规范化同人女主剧情规划状态(result.fandomHeroinePlan);
            campusBuffer = deps.规范化校园系统(result.campus);
        });

        battleBuffer = deps.战斗结束自动清空(battleBuffer, storyBuffer);
        charBuffer = deps.规范化角色物品容器映射(charBuffer);

        if (原始气运列表.length > 0 && (!Array.isArray(charBuffer?.气运列表) || charBuffer.气运列表.length === 0)) {
            charBuffer = { ...charBuffer, 气运列表: 深拷贝(原始气运列表) };
        }

        socialBuffer = deps.规范化社交列表(socialBuffer);
        storyBuffer = deps.规范化剧情状态(storyBuffer);

        // 解析 <欲望系统状态> XML 标签，应用 AI 返回的欲望档案更新
        if (typeof rawContent === 'string') {
            const 欲望系统状态匹配 = rawContent.match(/<欲望系统状态>\s*([\s\S]*?)\s*<\/欲望系统状态>/);
            if (欲望系统状态匹配) {
                try {
                    const 解析结果 = JSON.parse(欲望系统状态匹配[1]) as { 更新档案?: Record<string, Partial<import('../../models/campusNSFW').NPC欲望档案>> };
                    if (解析结果.更新档案 && Object.keys(解析结果.更新档案).length > 0) {
                        const 欲望系统 = (campusBuffer.欲望系统 || {}) as NonNullable<校园NSFW系统扩展['欲望系统']>;
                        const 现有档案 = 欲望系统.NPC欲望档案 || {};
                        const 更新后档案 = { ...现有档案 };
                        for (const [npcId, 更新] of Object.entries(解析结果.更新档案)) {
                            更新后档案[npcId] = { ...(更新后档案[npcId] || {}), ...更新 } as any;
                        }
                        campusBuffer = {
                            ...campusBuffer,
                            欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 } as 校园NSFW系统扩展['欲望系统']
                        };
                    }
                } catch {
                    // JSON 解析失败，忽略本次更新
                }
            }

            // 解析 <关系状态更新> XML 标签，应用 NPC 关系数据更新
            const 关系状态匹配 = rawContent.match(/<关系状态更新>\s*([\s\S]*?)\s*<\/关系状态更新>/);
            if (关系状态匹配) {
                try {
                    const 解析结果 = JSON.parse(关系状态匹配[1]);
                    // 关系变化：Array<{npcId, 好感度, 亲密度, 信任度, 感情值}>
                    if (Array.isArray(解析结果.关系变化)) {
                        for (const 变化 of 解析结果.关系变化) {
                            if (!变化.npcId) continue;
                            const idx = socialBuffer.findIndex((n: any) => n.id === 变化.npcId);
                            if (idx >= 0) {
                                const npc = { ...socialBuffer[idx] };
                                if (!npc.关系数据) {
                                    npc.关系数据 = {
                                        npcId: npc.id,
                                        关系类型: '陌生',
                                        关系状态: '单恋',
                                        好感度: 0,
                                        亲密度: 0,
                                        信任度: 0,
                                        感情值: 0,
                                        互动次数: 0,
                                        关键事件: [],
                                        独家标记: false,
                                        解锁场景: [],
                                    };
                                }
                                if (变化.好感度 !== undefined) npc.关系数据.好感度 = Math.max(0, Math.min(100, npc.关系数据.好感度 + 变化.好感度));
                                if (变化.亲密度 !== undefined) npc.关系数据.亲密度 = Math.max(0, Math.min(100, npc.关系数据.亲密度 + 变化.亲密度));
                                if (变化.信任度 !== undefined) npc.关系数据.信任度 = Math.max(0, Math.min(100, npc.关系数据.信任度 + 变化.信任度));
                                if (变化.感情值 !== undefined) npc.关系数据.感情值 = Math.max(0, Math.min(100, npc.关系数据.感情值 + 变化.感情值));
                                socialBuffer = [...socialBuffer];
                                socialBuffer[idx] = npc;
                            }
                        }
                    }
                    // 阶段推进：{npcId, 原阶段, 新阶段}
                    if (解析结果.阶段推进?.npcId) {
                        const idx = socialBuffer.findIndex((n: any) => n.id === 解析结果.阶段推进.npcId);
                        if (idx >= 0) {
                            const npc = { ...socialBuffer[idx] };
                            if (npc.关系数据) {
                                npc.关系数据 = { ...npc.关系数据, 关系类型: 解析结果.阶段推进.新阶段 };
                            }
                            socialBuffer = [...socialBuffer];
                            socialBuffer[idx] = npc;
                        }
                    }
                } catch {
                    // JSON 解析失败，忽略本次更新
                }
            }
        }

        let finalState: 响应命令处理状态 = {
            角色: charBuffer,
            环境: deps.规范化环境信息(envBuffer),
            社交: socialBuffer,
            世界: deps.规范化世界状态(worldBuffer),
            战斗: battleBuffer,
            玩家门派: deps.规范化门派状态(sectBuffer),
            任务列表: Array.isArray(tasksBuffer) ? tasksBuffer : [],
            约定列表: Array.isArray(agreementsBuffer) ? agreementsBuffer : [],
            剧情: storyBuffer,
            剧情规划: deps.规范化剧情规划状态(storyPlanBuffer),
            女主剧情规划: deps.规范化女主剧情规划状态(heroinePlanBuffer),
            同人剧情规划: deps.规范化同人剧情规划状态(fandomStoryPlanBuffer),
            同人女主剧情规划: deps.规范化同人女主剧情规划状态(fandomHeroinePlanBuffer),
            校园系统: campusBuffer
        };
        const calibrated = deps.命令后校准?.(finalState);
        if (calibrated) {
            finalState = 'state' in calibrated ? calibrated.state : calibrated;
        }

        if (shouldApplyState) {
            deps.设置角色?.(finalState.角色);
            deps.设置环境?.(finalState.环境);
            deps.设置社交?.(finalState.社交);
            deps.设置世界?.(finalState.世界);
            deps.设置战斗?.(finalState.战斗);
            deps.设置玩家门派?.(finalState.玩家门派);
            deps.设置任务列表?.(finalState.任务列表);
            deps.设置约定列表?.(finalState.约定列表);
            deps.设置剧情?.(finalState.剧情);
            deps.设置剧情规划?.(finalState.剧情规划);
            deps.设置女主剧情规划?.(finalState.女主剧情规划);
            deps.设置同人剧情规划?.(finalState.同人剧情规划);
            deps.设置同人女主剧情规划?.(finalState.同人女主剧情规划);
            deps.设置校园系统?.(finalState.校园系统);
        }

        return finalState;
    }

    let finalState: 响应命令处理状态 = {
        角色: charBuffer,
        环境: deps.规范化环境信息(envBuffer),
        社交: deps.规范化社交列表(socialBuffer),
        世界: deps.规范化世界状态(worldBuffer),
        战斗: battleBuffer,
        玩家门派: deps.规范化门派状态(sectBuffer),
        任务列表: Array.isArray(tasksBuffer) ? tasksBuffer : [],
        约定列表: Array.isArray(agreementsBuffer) ? agreementsBuffer : [],
        剧情: deps.规范化剧情状态(storyBuffer),
        剧情规划: deps.规范化剧情规划状态(storyPlanBuffer),
        女主剧情规划: deps.规范化女主剧情规划状态(heroinePlanBuffer),
        同人剧情规划: deps.规范化同人剧情规划状态(fandomStoryPlanBuffer),
        同人女主剧情规划: deps.规范化同人女主剧情规划状态(fandomHeroinePlanBuffer),
        校园系统: campusBuffer
    };

    // 无 tavern_commands 时也解析欲望系统状态更新
    if (typeof rawContent === 'string') {
        const 欲望系统状态匹配 = rawContent.match(/<欲望系统状态>\s*([\s\S]*?)\s*<\/欲望系统状态>/);
        if (欲望系统状态匹配) {
            try {
                const 解析结果 = JSON.parse(欲望系统状态匹配[1]) as { 更新档案?: Record<string, any> };
                if (解析结果.更新档案 && Object.keys(解析结果.更新档案).length > 0) {
                    const 欲望系统 = (campusBuffer.欲望系统 || {}) as NonNullable<校园NSFW系统扩展['欲望系统']>;
                    const 现有档案 = 欲望系统.NPC欲望档案 || {};
                    const 更新后档案 = { ...现有档案 };
                    for (const [npcId, 更新] of Object.entries(解析结果.更新档案)) {
                        更新后档案[npcId] = { ...(更新后档案[npcId] || {}), ...更新 };
                    }
                    campusBuffer = {
                        ...campusBuffer,
                        欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 } as 校园NSFW系统扩展['欲望系统']
                    };
                }
            } catch { /* JSON 解析失败，忽略 */ }
        }
    }

    // 更新 finalState 中的校园系统
    finalState.校园系统 = campusBuffer;

    // 解析 <写真系统状态> XML 标签，应用 AI 返回的写真系统更新
    if (typeof rawContent === 'string') {
        const 写真系统状态匹配 = rawContent.match(/<写真系统状态>\s*([\s\S]*?)\s*<\/写真系统状态>/);
        if (写真系统状态匹配) {
            try {
                const 写真解析结果 = JSON.parse(写真系统状态匹配[1]) as {
                    更新模特档案?: Record<string, Partial<import('../../../models/photographyNSFW').模特核心状态>>;
                    更新拍摄项目?: Partial<import('../../../models/photographyNSFW').拍摄项目状态>[];
                    新泄露事件?: import('../../../models/photographyNSFW').泄露事件状态[];
                };
                const 写真系统 = (finalState as any).写真系统 || {} as 写真系统扩展;
                const 更新后模特档案 = { ...(写真系统.模特档案 || {}) };
                if (写真解析结果.更新模特档案) {
                    for (const [id, 更新] of Object.entries(写真解析结果.更新模特档案)) {
                        更新后模特档案[id] = { ...(更新后模特档案[id] || {}), ...更新 } as any;
                    }
                }
                const 更新后项目 = [...(写真系统.进行中的拍摄项目 || [])];
                if (写真解析结果.更新拍摄项目) {
                    for (const 更新 of 写真解析结果.更新拍摄项目) {
                        if (更新.id) {
                            const idx = 更新后项目.findIndex(p => p.id === 更新.id);
                            if (idx >= 0) 更新后项目[idx] = { ...更新后项目[idx], ...更新 } as any;
                        }
                    }
                }
                const 更新后泄露 = [...(写真系统.泄露事件列表 || [])];
                if (写真解析结果.新泄露事件) {
                    更新后泄露.push(...写真解析结果.新泄露事件);
                }
                (finalState as any).写真系统 = {
                    ...写真系统,
                    模特档案: 更新后模特档案,
                    进行中的拍摄项目: 更新后项目,
                    泄露事件列表: 更新后泄露,
                } as 写真系统扩展;
            } catch { /* JSON 解析失败，忽略 */ }
        }
    }

    const calibrated = deps.命令后校准?.(finalState);
    if (calibrated) {
        finalState = 'state' in calibrated ? calibrated.state : calibrated;
        if (shouldApplyState) {
            deps.设置角色?.(finalState.角色);
            deps.设置环境?.(finalState.环境);
            deps.设置社交?.(finalState.社交);
            deps.设置世界?.(finalState.世界);
            deps.设置战斗?.(finalState.战斗);
            deps.设置玩家门派?.(finalState.玩家门派);
            deps.设置任务列表?.(finalState.任务列表);
            deps.设置约定列表?.(finalState.约定列表);
            deps.设置剧情?.(finalState.剧情);
            deps.设置剧情规划?.(finalState.剧情规划);
            deps.设置女主剧情规划?.(finalState.女主剧情规划);
            deps.设置同人剧情规划?.(finalState.同人剧情规划);
            deps.设置同人女主剧情规划?.(finalState.同人女主剧情规划);
            deps.设置校园系统?.(finalState.校园系统);
        }
    };
    return finalState;
};
