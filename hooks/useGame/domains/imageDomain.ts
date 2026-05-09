/**
 * 图片生成域
 *
 * 聚合图片生成相关子系统创建调用，返回所有图片相关函数和状态。
 * 从 useGame.ts 的 ~450 行图片相关代码提取。
 *
 * 模式：直接接收 stateAccess 和 refs，内部解构所需字段。
 */

import { useEffect } from 'react';
import * as dbService from '../../../services/dbService';
import { 设置键 } from '../../../utils/settingsSchema';
import { 规范化图片管理设置, 默认图片管理设置 } from '../../../utils/imageManagerSettings';
import type { 场景图片档案 } from '../../../types';
import type { GameStateAccess, UseGameRefs } from '../state';

export interface ImageDomainInput {
    stateAccess: GameStateAccess;
    refs: UseGameRefs;
    apiConfig: any;
    gameConfig: any;
    visualConfig: any;
    imageManagerConfig: any;
    推送右下角提示: any;
    深拷贝: any;
    规范化环境信息: any;
    规范化社交列表安全: any;
    规范化角色物品容器映射: any;
    环境时间转标准串: any;
    构建完整地点文本: any;
    提取NPC生图基础数据: any;
    提取NPC生图基础数据附带私密描述: any;
    提取NPC香闺秘档部位生图数据: any;
    提取主角生图基础数据: any;
    生成场景生图记录ID: any;
    生成NPC生图记录ID: any;
    创建场景图片档案工作流: any;
    创建图片生成协调器: any;
    创建手动图片动作工作流: any;
    创建手动NPC工作流: any;
    创建主角图片工作流: any;
    useImagePresets: any;
    加载图片AI服务: any;
    加载NPC生图工作流: any;
    加载NPC香闺秘档生图工作流: any;
    加载场景生图工作流: any;
    获取文生图接口配置: any;
    获取场景文生图接口配置: any;
    获取生图词组转化器接口配置: any;
    获取生图画师串预设: any;
    获取词组转化器预设提示词: any;
    接口配置是否可用: any;
}

export function createImageDomain(input: ImageDomainInput) {
    const {
        stateAccess, refs,
        apiConfig, gameConfig, visualConfig, imageManagerConfig,
        推送右下角提示, 深拷贝,
        规范化环境信息, 规范化社交列表安全, 规范化角色物品容器映射,
        环境时间转标准串, 构建完整地点文本,
        提取NPC生图基础数据, 提取NPC生图基础数据附带私密描述,
        提取NPC香闺秘档部位生图数据, 提取主角生图基础数据,
        生成场景生图记录ID, 生成NPC生图记录ID,
        创建场景图片档案工作流, 创建图片生成协调器,
        创建手动图片动作工作流, 创建手动NPC工作流, 创建主角图片工作流,
        useImagePresets, 加载图片AI服务, 加载NPC生图工作流,
        加载NPC香闺秘档生图工作流, 加载场景生图工作流,
        获取文生图接口配置, 获取场景文生图接口配置,
        获取生图词组转化器接口配置, 获取生图画师串预设,
        获取词组转化器预设提示词, 接口配置是否可用,
    } = input;

    // 从 stateAccess 解构
    const {
        环境, 角色, 社交, 历史记录,
        set场景生图任务队列, setNPC生图任务队列, 设置社交, 设置角色,
        set场景图片档案,
    } = stateAccess;

    // 从 refs 解构
    const {
        apiConfigRef, visualConfigRef, imageManagerConfigRef,
        场景图片档案Ref, 场景生图自动应用任务Ref,
        后台手动生图监控Ref, 后台私密生图监控Ref, 后台场景生图监控Ref,
        NPC生图进行中Ref, 主角生图进行中Ref, NPC香闺秘档生图进行中Ref,
        performAutoSaveRef, 按NPC读取角色锚点Ref, 提取场景角色锚点Ref,
        获取当前PNG画风预设摘要Ref,
    } = refs;

    // 修炼体系开关
    const 读取修炼体系开关 = () => gameConfig?.启用修炼体系 !== false;

    // 场景图历史上限
    const 获取场景图历史上限 = (): number => (
        规范化图片管理设置(imageManagerConfigRef.current || imageManagerConfig || 默认图片管理设置).场景图历史上限
    );

    // --- 场景图片档案工作流 ---
    const sceneArchive = 创建场景图片档案工作流({
        获取场景图历史上限,
        读取场景图片档案设置: () => dbService.读取设置(设置键.场景图片档案),
        保存场景图片档案设置: (archive: 场景图片档案) => dbService.保存设置(设置键.场景图片档案, archive),
        同步场景图片档案: (archive: 场景图片档案) => {
            场景图片档案Ref.current = archive;
            set场景图片档案(archive);
        },
        获取当前场景图片档案: () => 场景图片档案Ref.current || {},
        清理未引用图片资源: dbService.清理未引用图片资源,
        获取当前视觉设置: () => visualConfigRef.current || visualConfig,
        应用视觉设置到状态: () => {},
        深拷贝,
        加载图片AI服务
    });

    useEffect(() => {
        void sceneArchive.加载场景图片档案();
    }, []);

    // --- 图片生成协调器 ---
    const imageGen = 创建图片生成协调器({
        apiConfig,
        gameConfig,
        环境, 角色, 社交, 历史记录,
        set场景生图任务队列,
        setNPC生图任务队列,
        设置社交,
        规范化社交列表安全,
        规范化环境信息,
        深拷贝,
        环境时间转标准串,
        构建完整地点文本,
        提取NPC生图基础数据: (npc: any) => 提取NPC生图基础数据(npc, {
            cultivationSystemEnabled: 读取修炼体系开关()
        }),
        提取NPC生图基础数据附带私密描述,
        提取NPC香闺秘档部位生图数据,
        按NPC读取角色锚点: (npcId: string) => 按NPC读取角色锚点Ref.current?.(npcId) ?? null,
        提取场景角色锚点: (ctx: any) => 提取场景角色锚点Ref.current?.(ctx) ?? [],
        获取文生图接口配置,
        获取生图词组转化器接口配置,
        获取生图画师串预设,
        获取当前PNG画风预设摘要: (presetId?: string, type?: 'scene' | 'npc') =>
            获取当前PNG画风预设摘要Ref.current?.(presetId, type) ?? null,
        获取词组转化器预设提示词,
        接口配置是否可用,
        加载NPC生图工作流,
        加载NPC香闺秘档生图工作流,
        加载场景生图工作流,
        获取场景文生图接口配置,
        生成场景生图记录ID,
        生成NPC生图记录ID,
        应用场景图片为壁纸: sceneArchive.应用场景图片为壁纸,
        场景生图自动应用任务Ref,
        后台场景生图监控Ref,
        NPC生图进行中Ref,
        NPC香闺秘档生图进行中Ref,
        推送右下角提示,
        写入场景图片档案: sceneArchive.写入场景图片档案,
        performAutoSave: (...args: any[]) => performAutoSaveRef.current?.(...args)
    });

    // --- 图片预设 ---
    const imagePresets = useImagePresets({
        apiConfigRef,
        updateApiConfig: async () => {},
        加载图片AI服务,
        set右下角提示列表: stateAccess.set右下角提示列表,
        社交,
        角色,
        isCultivationSystemEnabled: 读取修炼体系开关,
    });

    // 注册前向引用
    按NPC读取角色锚点Ref.current = imagePresets.getCharacterAnchorByNpcId;
    提取场景角色锚点Ref.current = imagePresets.getSceneCharacterAnchors;
    获取当前PNG画风预设摘要Ref.current = imagePresets.getCurrentPngStylePreset;

    // --- 手动 NPC ---
    const manualNpc = 创建手动NPC工作流({
        获取环境: () => 环境,
        环境时间转标准串,
        规范化社交列表: 规范化社交列表安全,
        设置社交,
        执行社交自动存档: (socialSnapshot: any) => {
            void performAutoSaveRef.current?.({ social: socialSnapshot, history: 历史记录, force: true });
        },
        保存图片资源: dbService.保存图片资源
    });

    // --- 手动图片动作 ---
    const manualImageActions = 创建手动图片动作工作流({
        获取社交列表: () => 社交,
        记录后台手动生图监控: (payload: any) => { 后台手动生图监控Ref.current.push(payload); },
        记录后台私密生图监控: (payload: any) => { 后台私密生图监控Ref.current.push(payload); },
        推送右下角提示,
        执行单个NPC生图: imageGen.执行单个NPC生图,
        执行NPC香闺秘档部位生图: imageGen.执行NPC香闺秘档部位生图
    });

    // --- 主角图片 ---
    const playerImage = 创建主角图片工作流({
        获取角色: () => 角色,
        设置角色,
        规范化角色物品容器映射,
        执行自动存档: performAutoSaveRef.current,
        获取历史记录: () => 历史记录,
        推送右下角提示,
        加载NPC生图工作流,
        apiConfig,
        获取文生图接口配置,
        获取生图词组转化器接口配置,
        获取生图画师串预设,
        获取当前PNG画风预设: (presetId?: string) =>
            imagePresets.getCurrentPngStylePreset(presetId, 'npc'),
        读取主角角色锚点: imagePresets.getPlayerCharacterAnchor,
        获取词组转化器预设提示词,
        接口配置是否可用,
        读取文生图功能配置: imageGen.读取文生图功能配置,
        主角生图进行中集合: 主角生图进行中Ref.current,
        提取主角生图基础数据: (character: any) => 提取主角生图基础数据(character, {
            cultivationSystemEnabled: 读取修炼体系开关()
        }),
        创建NPC生图任务: imageGen.创建NPC生图任务,
        生成NPC生图记录ID,
        构建文生图额外要求: imageGen.构建文生图额外要求
    });

    return {
        sceneArchive, imageGen, imagePresets, manualNpc, manualImageActions, playerImage,
    };
}
