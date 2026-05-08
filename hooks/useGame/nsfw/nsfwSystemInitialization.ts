/**
 * NSFW 系统初始化
 * 从 useGame.ts 提取的 5 个 NSFW 系统初始化 useEffect 区块
 */
import { useEffect } from 'react';
import { 从NPC创建欲望档案 } from '../campusNSFWEngine';
import { 创建乘客欲望档案 } from '../urbanDriverNSFWEngine';
import type { NPC结构 } from '../../../types';

interface NSFW系统初始化依赖 {
    gameConfig: any;
    校园系统: any;
    都市网约车系统: any;
    写真系统: any;
    角色: any;
    社交: NPC结构[];
    设置校园系统: (updater: (prev: any) => any) => void;
    设置都市网约车系统: (updater: (prev: any) => any) => void;
    设置写真系统: (value: any) => void;
}

export function useNSFW系统初始化(deps: NSFW系统初始化依赖) {
    const {
        gameConfig, 校园系统, 都市网约车系统, 写真系统,
        角色, 社交,
        设置校园系统, 设置都市网约车系统, 设置写真系统,
    } = deps;

    // 校园 NSFW 欲望系统初始化：当主开关打开且尚未初始化时，为所有主要角色 NPC 创建默认欲望档案
    useEffect(() => {
        const nsfwEnabled = gameConfig?.校园NSFW设置?.启用校园NSFW深化系统;
        const 欲望系统已存在 = 校园系统?.欲望系统;
        const 游戏已开始 = 角色?.姓名;
        const 有主要角色 = 社交?.some((n: NPC结构) => n.是否主要角色);

        if (nsfwEnabled && !欲望系统已存在 && 游戏已开始 && 有主要角色) {
            const NPC欲望档案: Record<string, any> = {};
            社交.forEach((npc: NPC结构) => {
                if (npc.是否主要角色) {
                    NPC欲望档案[npc.id] = 从NPC创建欲望档案(npc);
                }
            });

            if (Object.keys(NPC欲望档案).length > 0) {
                设置校园系统(prev => ({
                    ...prev,
                    欲望系统: {
                        NPC欲望档案,
                        里程碑列表: [],
                        后果列表: [],
                        已解锁地点: [],
                        露出场景解锁: [],
                        旁观者记录: [],
                        活动专属回忆: [],
                        SM场景池: [],
                        契约列表: [],
                        指令队列: [],
                    }
                }));
            }
        }
    }, [gameConfig?.校园NSFW设置?.启用校园NSFW深化系统, 校园系统?.欲望系统, 角色?.姓名, 社交, 设置校园系统]);

    // 新增主要角色 NPC 时自动补全欲望档案
    useEffect(() => {
        const nsfwEnabled = gameConfig?.校园NSFW设置?.启用校园NSFW深化系统;
        const 欲望系统 = 校园系统?.欲望系统;
        if (!nsfwEnabled || !欲望系统) return;

        const 缺失档案的主要角色 = 社交.filter((npc: NPC结构) =>
            npc.是否主要角色 && !欲望系统.NPC欲望档案?.[npc.id]
        );
        if (缺失档案的主要角色.length === 0) return;

        const 新档案: Record<string, any> = {};
        缺失档案的主要角色.forEach(npc => {
            新档案[npc.id] = 从NPC创建欲望档案(npc);
        });

        设置校园系统(prev => ({
            ...prev,
            欲望系统: {
                ...欲望系统,
                NPC欲望档案: { ...欲望系统.NPC欲望档案, ...新档案 }
            }
        }));
    }, [社交, gameConfig?.校园NSFW设置?.启用校园NSFW深化系统, 校园系统?.欲望系统?.NPC欲望档案, 设置校园系统]);

    // 都市网约车 NSFW 乘客档案初始化
    useEffect(() => {
        const nsfw设置 = gameConfig?.都市网约车NSFW设置;
        const 行程系统 = (都市网约车系统 as any)?.行程系统;
        const 游戏已开始 = 角色?.姓名;
        const 是司机背景 = 角色?.出身背景?.名称 &&
            ['网约车司机', '网约车夜司机', '代驾司机', '网约车队长'].includes(角色.出身背景.名称);

        if (nsfw设置?.启用都市网约车NSFW系统 && 行程系统 && 游戏已开始 && 是司机背景) {
            const 已有档案 = 行程系统.乘客欲望档案 || {};
            if (Object.keys(已有档案).length === 0 && 社交?.length > 0) {
                const 新档案: Record<string, any> = {};
                社交.forEach((npc: NPC结构) => {
                    if (npc.是否主要角色) {
                        新档案[npc.id] = 创建乘客欲望档案();
                    }
                });
                if (Object.keys(新档案).length > 0) {
                    设置都市网约车系统(prev => ({
                        ...prev,
                        行程系统: { ...行程系统, 乘客欲望档案: { ...已有档案, ...新档案 } }
                    }));
                }
            }
        }
    }, [gameConfig?.都市网约车NSFW设置?.启用都市网约车NSFW系统, 都市网约车系统, 角色?.姓名, 角色?.出身背景?.名称, 社交, 设置都市网约车系统]);

    // 新增主要角色 NPC 时自动补全都市网约车乘客档案
    useEffect(() => {
        const nsfw设置 = gameConfig?.都市网约车NSFW设置;
        const 行程系统 = (都市网约车系统 as any)?.行程系统;
        if (!nsfw设置?.启用都市网约车NSFW系统 || !行程系统) return;

        const 乘客档案 = 行程系统.乘客欲望档案 || {};
        const 缺失档案的角色 = 社交.filter((npc: NPC结构) => !乘客档案[npc.id]);
        if (缺失档案的角色.length === 0) return;

        const 新档案: Record<string, any> = {};
        缺失档案的角色.forEach(npc => {
            新档案[npc.id] = 创建乘客欲望档案();
        });

        设置都市网约车系统(prev => {
            const 当前行程 = (prev as any)?.行程系统 || 行程系统;
            return {
                ...prev,
                行程系统: { ...当前行程, 乘客欲望档案: { ...乘客档案, ...新档案 } }
            };
        });
    }, [社交, gameConfig?.都市网约车NSFW设置?.启用都市网约车NSFW系统, 都市网约车系统, 设置都市网约车系统]);

    // 写真约拍 NSFW 系统初始化
    useEffect(() => {
        const nsfw设置 = gameConfig?.写真NSFW设置;
        const 游戏已开始 = 角色?.姓名;
        const 是写真相关背景 = 角色?.出身背景?.名称 &&
            ['写真模特', '摄影师', '自由摄影师', '平面模特', 'Cosplay模特'].includes(角色.出身背景.名称);
        const 写真系统已存在 = (写真系统 as any)?.模特档案 || (写真系统 as any)?.摄影师档案;

        if (nsfw设置?.启用写真NSFW系统 && 游戏已开始 && 是写真相关背景 && !写真系统已存在) {
            const { 创建默认模特, 创建默认摄影师 } = require('../photographyNSFWEngine');
            const 模特Id = `model_${Date.now()}`;
            const 摄影师Id = `photographer_${Date.now()}`;

            const 写真系统初始值 = {
                模特档案: { [模特Id]: 创建默认模特(模特Id, 角色?.姓名 ?? '未知模特', '素人模特', '新人') },
                摄影师档案: { [摄影师Id]: 创建默认摄影师(摄影师Id, '独立摄影师', '独立摄影师', '纯艺术') },
                进行中的拍摄项目: [],
                历史拍摄记录: [],
                泄露事件列表: [],
            };

            设置写真系统(写真系统初始值);
        }
    }, [gameConfig?.写真NSFW设置?.启用写真NSFW系统, 写真系统, 角色?.姓名, 角色?.出身背景?.名称, 设置写真系统]);
}
