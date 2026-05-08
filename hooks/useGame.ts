
import {
    角色数据结构,
    视觉设置结构,
    记忆系统结构,
    WorldGenConfig,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    OpeningConfig,
    场景图片档案,
    场景生图任务记录,
    NPC生图任务记录,
    香闺秘档部位类型,
    图片管理设置结构,
    内置提示词条目结构,
    世界书结构,
    世界书预设组结构,
    世界书作用域,
    时代信息结构,
    GameResponse,
    提示词结构,
    详细门派结构
} from '../types';
import { useEffect, useRef } from 'react';
import * as dbService from '../services/dbService';
import * as textAIService from '../services/ai/text';
import { useGameState } from './useGameState';
import { 规范化接口设置, 获取变量计算接口配置, 获取世界演变接口配置, 获取文生图接口配置, 获取场景文生图接口配置, 获取生图词组转化器接口配置, 获取生图画师串预设, 获取词组转化器预设提示词, 获取主剧情接口配置, 接口配置是否可用, 变量校准功能已启用 as 变量生成功能已启用, 获取变量生成并发配置 } from '../utils/apiConfig';
import type { 当前可用接口结构 } from '../utils/apiConfig';
import {
    规范化记忆系统,
    规范化记忆配置,
    构建即时记忆条目,
    构建短期记忆条目,
    写入四段记忆,
    记忆压缩任务结构
} from './useGame/memory/memoryUtils';
import { 构建上下文快照数据 } from './useGame/ui/contextSnapshot';
import { 执行响应命令处理 } from './useGame/npc/responseCommandProcessor';
import { 创建会话生命周期工作流 } from './useGame/sessionLifecycleWorkflow';
import {
    构建系统提示词 as 构建系统提示词工作流,
    type 运行时提示词状态
} from './useGame/systemPromptBuilder';
import { 构建见面场景提示词, 解析见面结果, 生成任务摘要 } from './useGame/bdsmMeetingWorkflow';
import type { 关系阶段 } from '../models/campusNSFW/sm';
import { useNSFW系统初始化 } from './useGame/nsfw/nsfwSystemInitialization';

import {
    创建开场基础状态,
    创建开场命令基态,
    构建前端清空开场状态,
    创建开场空白剧情,
    创建开场空白环境,
    创建开场空白世界,
    创建开场空白战斗,
    创建空剧情规划,
    创建空门派状态,
    创建空记忆系统,
    规范化世界状态,
    规范化战斗状态,
    规范化门派状态,
    规范化剧情状态,
    规范化剧情规划状态 as 基础规范化剧情规划状态,
    规范化女主剧情规划状态 as 基础规范化女主剧情规划状态,
    规范化同人剧情规划状态 as 基础规范化同人剧情规划状态,
    规范化同人女主剧情规划状态 as 基础规范化同人女主剧情规划状态,
    战斗结束自动清空,
    按回合窗口裁剪历史
} from './useGame/storyState';
import { 执行世界演变更新工作流 } from './useGame/world/worldEvolutionWorkflow';
import { 提取NPC生图基础数据附带私密描述 } from './useGame/image/imagePresetWorkflow';
import { 创建设置持久化工作流 } from './useGame/config/settingsPersistenceWorkflow';
import { 创建历史回合工作流 } from './useGame/time/historyTurnWorkflow';
import { 创建存读档工作流 } from './useGame/saveLoad/saveLoadWorkflow';
import { 创建规划更新工作流 } from './useGame/planning/planningUpdateWorkflow';
import { 合并NPC图片档案, 生成NPC生图记录ID } from './useGame/image/npcImageStateWorkflow';
import { 创建场景图片档案工作流, 生成场景生图记录ID, 规范化场景图片档案 } from './useGame/image/sceneImageArchiveWorkflow';
import { 创建手动图片动作工作流 } from './useGame/image/manualImageActionsWorkflow';
import { 创建手动NPC工作流 } from './useGame/npc/manualNpcWorkflow';
import { 创建主角图片工作流 } from './useGame/image/playerImageWorkflow';
import { 创建运行时变量工作流 } from './useGame/runtimeVariableWorkflow';
import { 创建变量校准协调器 as 创建变量生成协调器 } from './useGame/planning/variableCalibrationCoordinator';
import { useWorldEvolutionControl } from './useGame/world/worldEvolutionControl';
import { normalizeCanonicalGameTime, 环境时间转标准串, 提取环境月日 } from './useGame/time/timeUtils';
import { use时间初始化, 构建标签解析选项, 创建追加系统消息 } from './useGame/time/timeInitialization';
import { 提取NPC生图基础数据, 提取NPC香闺秘档部位生图数据, 提取主角生图基础数据 } from './useGame/npcContext';
import { 规范化游戏设置 } from '../utils/gameSettings';
import { 规范化视觉设置 } from '../utils/visualSettings';
import { 默认图片管理设置, 规范化图片管理设置 } from '../utils/imageManagerSettings';
import { 规范化可选开局配置 } from '../utils/openingConfig';
import type { DeviceGameContext } from '../models/mobileDevice'; // unused - managed by useDevice
import { 构建文生图运行时额外提示词 } from '../prompts/runtime/nsfw';
import { 构建真实世界模式提示词 } from '../prompts/runtime/realWorldMode';
import { 核心_文章优化思维链 } from '../prompts/core/cotPolish';
import { 核心_开局思维链 } from '../prompts/core/cotOpening';
import {
    规范化环境信息,
    构建完整地点文本,
    规范化角色物品容器映射,
    规范化社交列表
} from './useGame/stateTransforms';
import { 按世界演变分流净化响应 } from './useGame/response/storyResponseGuards';
import { 执行变量自动校准 } from './useGame/planning/variableCalibration';
import { 执行变量模型校准工作流 } from './useGame/planning/variableModelWorkflow';
import { 合并变量校准结果到响应 as 合并变量生成结果到响应 } from './useGame/planning/variableCalibrationMerge';
import { 设置键 } from '../utils/settingsSchema';

// 提取的子系统
import { useSettingsActions } from './useGame/useSettingsActions';
import { useFeatureFlags } from './useGame/useFeatureFlags';
import { useTravelAndTrade } from './useGame/useTravelAndTrade';
import { useSceneImageArchive } from './useGame/useSceneImageArchive';
import { useNPCWorkflow } from './useGame/useNPCWorkflow';
import { useWorldAndPlanning } from './useGame/useWorldAndPlanning';
import { useHistoryAndMemory } from './useGame/useHistoryAndMemory';
import { useOpeningAndSession } from './useGame/useOpeningAndSession';
import { useImagePresets } from './useGame/useImagePresets';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { 提取原始报错详情, 格式化错误详情, 提取解析失败原始信息 } from './useGame/quality/errorFormatting';
import {
    获取原始AI消息,
    计算回复耗时秒,
    估算消息Token,
    估算AI输出Token,
    游戏时间转排序值,
    提取文本中的游戏时间列表,
    当前时间已达到,
    提取响应完整正文文本,
    收集最近完整正文回合,
    构建最近完整正文上下文
} from './useGame/response/responseTextHelpers';
import { 自动重试最大次数, 替换流式草稿为失败提示, 更新流式草稿为自动重试提示, 游戏设置启用自动重试, 提取自动重试原因, 是否可自动重试错误, 执行带自动重试的生成请求 } from './useGame/quality/autoRetry';
import { 去重文本数组, 收集剧情规划时间触发原因, 收集女主规划时间触发原因, 收集剧情正文命中原因, 收集女主正文命中原因, 过滤规划补丁命令 } from './useGame/planning/planningReasonCollector';
import { 创建回档快照系统, type 回合快照结构 } from './useGame/ui/rollbackSnapshot';
import { 创建通知系统, type 右下角提示结构 } from './useGame/ui/notificationSystem';
import { 创建记忆总结处理器, type NPC记忆总结任务结构, type 记忆总结阶段类型 } from './useGame/memory/memorySummaryHandlers';
import { 创建变量生成进度系统, type 变量生成上下文缓存项 } from './useGame/planning/variableGenerationProgress';
import { 创建变量生成队列调度器 } from './useGame/planning/variableGenerationQueue';
import { useBackgroundImageMonitor } from './useGame/quality/backgroundImageMonitor';
import type { 设备刷新任务 } from './useGame/device/deviceRefreshMonitor';
import { useDevice } from './useGame/useDevice';
import { 创建BDSM关系操作工作流 } from './useGame/bdsmRelationshipOperations';
import { 创建主剧情发送工作流 } from './useGame/useSend';
import { 创建图片生成协调器 } from './useGame/image/imageGenerationCoordinator';

type 回忆检索进度 = {
    phase: 'start' | 'stream' | 'done' | 'error';
    text?: string;
};

type 正文润色进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

type 变量生成进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped' | 'cancelled';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

type 独立阶段标识 = 'polish' | 'world' | 'planning' | 'variable';
type 独立阶段失败决策 = 'retry' | 'skip';
type 独立阶段失败决策参数 = {
    stageId: 独立阶段标识;
    stageLabel: string;
    errorText: string;
};

type 规划分析进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

type 世界演变进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

const 加载图片AI服务 = () => import('../services/ai/image/runtime');
const 加载NPC生图工作流 = () => import('./useGame/image/npcImageWorkflow');
const 加载NPC香闺秘档生图工作流 = () => import('./useGame/image/npcSecretImageWorkflow');
const 加载场景生图工作流 = () => import('./useGame/image/sceneImageWorkflow');


type 最近开局配置结构 = {
    worldConfig: WorldGenConfig;
    charData: 角色数据结构;
    openingConfig?: OpeningConfig;
    openingStreaming: boolean;
    openingExtraPrompt: string;
};

type 快速重开模式 = 'world_only' | 'opening_only' | 'all';

type 开局独立阶段进度 = {
    phase: 'start' | 'done' | 'error' | 'skipped' | 'cancelled';
    text?: string;
    rawText?: string;
    commandTexts?: string[];
};

type 世界生成选项 = {
    清空前端变量?: boolean;
};

type 上下文段 = {
    id: string;
    title: string;
    category: string;
    order: number;
    content: string;
    uploadTokens: number;
};

type 上下文快照 = {
    sections: 上下文段[];
    fullText: string;
    uploadTokens: number;
    runtimePromptStates: Record<string, 运行时提示词状态>;
};


export const useGame = () => {
    const gameState = useGameState();
    const {
        view, setView,
        hasSave, setHasSave,
        角色, 设置角色,
        环境, 设置环境,
        社交, 设置社交,
        世界, 设置世界,
        战斗, 设置战斗,
        玩家门派, 设置玩家门派,
        任务列表, 设置任务列表,
        约定列表, 设置约定列表,
        剧情, 设置剧情,
        剧情规划, 设置剧情规划,
        女主剧情规划, 设置女主剧情规划,
        同人剧情规划, 设置同人剧情规划,
        同人女主剧情规划, 设置同人女主剧情规划,
        开局配置, 设置开局配置,
        游戏初始时间, 设置游戏初始时间,
        历史记录, 设置历史记录,
        记忆系统, 设置记忆系统,
        loading, setLoading,
        worldEvents, setWorldEvents,
        showSettings, setShowSettings,
        showInventory, setShowInventory,
        showEquipment, setShowEquipment,
        showBattle, setShowBattle,
        showSocial, setShowSocial,
        showTeam, setShowTeam,
        showKungfu, setShowKungfu,
        showWorld, setShowWorld,
        showMap, setShowMap,
        showSect, setShowSect,
        showTask, setShowTask,
        showAgreement, setShowAgreement,
        showStory, setShowStory,
        showHeroinePlan, setShowHeroinePlan,
        showMemory, setShowMemory,
        showSaveLoad, setShowSaveLoad,
        activeTab, setActiveTab,
        
        apiConfig, setApiConfig,
        visualConfig, setVisualConfig,
        imageManagerConfig, setImageManagerConfig,
        gameConfig, setGameConfig,
        memoryConfig, setMemoryConfig,
        performanceConfig, setPerformanceConfig,
        prompts, setPrompts,
        ensurePromptsLoaded,
        festivals, setFestivals,
        currentTheme, setCurrentTheme,
        currentEra, setCurrentEra,
        scrollRef, abortControllerRef, variableGenerationAbortControllerRef,

        // Campus Systems
        校规系统, 设置校规系统,
        催眠系统, 设置催眠系统,
        校园系统, 设置校园系统,

        // NSFW Systems
        写真系统, 设置写真系统,
        都市网约车系统, 设置都市网约车系统
    } = gameState;

    // Mobile Device — managed by useDevice sub-hook (declared below after 推送右下角提示)

    // --- Zustand Store (Phase 6.9: direct store access) ---
    const store = useGameStore();
    // UI Slice
    const 可重Roll计数 = store.可重Roll计数;
    const set可重Roll计数 = store.set可重Roll计数;
    const 聊天区自动滚动抑制令牌 = store.聊天区自动滚动抑制令牌;
    const set聊天区自动滚动抑制令牌 = store.set聊天区自动滚动抑制令牌;
    const 聊天区强制置底令牌 = store.聊天区强制置底令牌;
    const set聊天区强制置底令牌 = store.set聊天区强制置底令牌;
    const 右下角提示列表 = store.右下角提示列表;
    const set右下角提示列表 = store.set右下角提示列表;
    // Image Slice
    const NPC生图任务队列 = store.NPC生图任务队列;
    const setNPC生图任务队列 = store.setNPC生图任务队列;
    const 场景生图任务队列 = store.场景生图任务队列;
    const set场景生图任务队列 = store.set场景生图任务队列;
    // Settings Slice
    const 内置提示词列表 = store.内置提示词列表;
    const set内置提示词列表 = store.set内置提示词列表;
    const 世界书列表 = store.世界书列表;
    const set世界书列表 = store.set世界书列表;
    const 世界书预设组列表 = store.世界书预设组列表;
    const set世界书预设组列表 = store.set世界书预设组列表;
    // Device Slice
    const 设备状态 = store.设备状态;
    const 设置设备状态 = store.set设备状态;
    const 设备刷新任务队列 = store.设备刷新任务队列;
    const set设备刷新任务队列 = store.set设备刷新任务队列;
    // World Slice
    const 世界演变更新中 = store.世界演变更新中;
    const set世界演变更新中 = store.set世界演变更新中;
    const 世界演变状态文本 = store.世界演变状态文本;
    const set世界演变状态文本 = store.set世界演变状态文本;
    const 世界演变最近更新时间 = store.世界演变最近更新时间;
    const set世界演变最近更新时间State = store.set世界演变最近更新时间;
    const 世界演变最近摘要 = store.世界演变最近摘要;
    const set世界演变最近摘要 = store.set世界演变最近摘要;
    const 世界演变最近原始消息 = store.世界演变最近原始消息;
    const set世界演变最近原始消息 = store.set世界演变最近原始消息;
    // 世界演变”最近更新时间”应使用游戏内时间戳（用于展示/归档），而非现实时间。
    // 仍然需要一个现实时间戳用于前端去抖/冷启动保护（避免依赖抖动导致 auto_due 连续触发）。
    const 世界演变最近现实更新时间戳Ref = useRef<number>(0);
    const set世界演变最近更新时间 = (value: string | null) => {
        set世界演变最近更新时间State(value);
        世界演变最近现实更新时间戳Ref.current = Date.now();
    };
    // Memory Slice
    const 待处理记忆总结任务 = store.待处理记忆总结任务;
    const set待处理记忆总结任务 = store.set待处理记忆总结任务;
    const 记忆总结阶段 = store.记忆总结阶段;
    const set记忆总结阶段 = store.set记忆总结阶段;
    const 记忆总结草稿 = store.记忆总结草稿;
    const set记忆总结草稿 = store.set记忆总结草稿;
    const 记忆总结错误 = store.记忆总结错误;
    const set记忆总结错误 = store.set记忆总结错误;
    const 待处理NPC记忆总结队列 = store.待处理NPC记忆总结队列;
    const set待处理NPC记忆总结队列 = store.set待处理NPC记忆总结队列;
    const NPC记忆总结阶段 = store.NPC记忆总结阶段;
    const setNPC记忆总结阶段 = store.setNPC记忆总结阶段;
    const NPC记忆总结草稿 = store.NPC记忆总结草稿;
    const setNPC记忆总结草稿 = store.setNPC记忆总结草稿;
    const NPC记忆总结错误 = store.NPC记忆总结错误;
    const setNPC记忆总结错误 = store.setNPC记忆总结错误;
    // Variable Slice
    const 变量生成中 = store.变量生成中;
    const set变量生成中 = store.set变量生成中;
    const 开局变量生成进度 = store.开局变量生成进度;
    const set开局变量生成进度 = store.set开局变量生成进度;
    const 开局世界演变进度 = store.开局世界演变进度;
    const set开局世界演变进度 = store.set开局世界演变进度;
    const 开局规划进度 = store.开局规划进度;
    const set开局规划进度 = store.set开局规划进度;
    // Opening Slice
    const 最近开局配置 = store.最近开局配置;
    const 设置最近开局配置 = store.set最近开局配置;
    // Scene Config Slice
    const 场景图片档案 = store.场景图片档案;
    const set场景图片档案 = store.set场景图片档案;
    const 时代信息 = store.时代信息;
    const set时代信息 = store.set时代信息;

    const 回合快照栈Ref = useRef<回合快照结构[]>([]);
    const 最近自动存档时间戳Ref = useRef<number>(0);
    const 最近自动存档签名Ref = useRef<string>('');
    const apiConfigRef = useRef(apiConfig);
    const visualConfigRef = useRef(visualConfig);
    const imageManagerConfigRef = useRef<图片管理设置结构>(imageManagerConfig || 默认图片管理设置);
    const 上下文快照缓存Ref = useRef<{
        value: 上下文快照;
        refs: unknown[];
    } | null>(null);
    const 世界演变进行中Ref = useRef(false);
    const 世界演变去重签名Ref = useRef('');
    const 最近变量生成上下文Ref = useRef<变量生成上下文缓存项[]>([]);
    const NPC生图进行中Ref = useRef<Set<string>>(new Set());
    const 主角生图进行中Ref = useRef<Set<string>>(new Set());
    const NPC香闺秘档生图进行中Ref = useRef<Set<string>>(new Set());
    const 场景生图自动应用任务Ref = useRef('');
    // Refs kept for synchronous access in callbacks (Zustand state is the source of truth)
    const 场景图片档案Ref = useRef<场景图片档案>({});
    const 时代信息Ref = useRef<时代信息结构 | undefined>(undefined);

    const 后台手动生图监控Ref = useRef<Array<{ npcId: string; since: number; npcName: string; 构图: '头像' | '半身' | '立绘' }>>([]);
    const 已提示后台生图任务Ref = useRef<Set<string>>(new Set());
    const 后台私密生图监控Ref = useRef<Array<{ npcId: string; since: number; npcName: string; 部位: 香闺秘档部位类型 }>>([]);
    const 已提示后台私密生图任务Ref = useRef<Set<string>>(new Set());
    const 后台场景生图监控Ref = useRef<Array<{ since: number; 摘要: string }>>([]);
    const 已提示后台场景生图任务Ref = useRef<Set<string>>(new Set());
    const performAutoSaveRef = useRef<((...args: any[]) => void) | null>(null);
    const 按NPC读取角色锚点Ref = useRef<((npcId: string) => any) | null>(null);
    const 提取场景角色锚点Ref = useRef<((ctx: unknown) => any) | null>(null);
    const 获取当前PNG画风预设摘要Ref = useRef<((presetId?: string, type?: 'scene' | 'npc') => any) | null>(null);

    // --- useSettingsActions ---
    const settingsActions = useSettingsActions({
        visualConfigRef,
        setVisualConfig,
        场景图片档案Ref,
        set场景图片档案,
        时代信息Ref,
        set时代信息,
        imageManagerConfigRef,
        setImageManagerConfig,
        setCurrentEra,
        setCurrentTheme,
        set右下角提示列表,
    });
    const { 深拷贝, 应用视觉设置到状态, 应用场景图片档案到状态, 应用时代信息到状态, 处理时代变更, 应用图片管理设置到状态, 关闭右下角提示 } = settingsActions;

    useEffect(() => {
        apiConfigRef.current = apiConfig;
    }, [apiConfig]);

    useEffect(() => {
        visualConfigRef.current = visualConfig;
    }, [visualConfig]);

    useEffect(() => {
        imageManagerConfigRef.current = 规范化图片管理设置(imageManagerConfig);
    }, [imageManagerConfig]);

    // --- 子系统初始化 ---
    const 通知系统 = 创建通知系统(set右下角提示列表);
    const 推送右下角提示 = 通知系统.推送右下角提示;

    // --- useDevice ---
    const device = useDevice({
        gameConfig,
        currentEra,
        角色,
        社交,
        世界,
        剧情,
        历史记录,
        校规系统,
        催眠系统,
        校园系统,
        设置校园系统,
        apiConfig,
        推送右下角提示,
    });
    const {
        设备关闭,
        设备返回主页,
        设备打开应用,
        设备打开,
        派生设备模式,
    } = device;

    // --- useTravelAndTrade ---
    const travelAndTrade = useTravelAndTrade({
        角色,
        环境,
        设置角色,
        设置环境,
        gameConfig,
        currentEra,
    });
    const {
        handleTravel,
        handleExplore,
        handleBuyItem,
        handleSellItem,
        handleForgeItem,
        getForgeRecipes,
        checkForgeMaterials,
        getForgeSuccessRate,
    } = travelAndTrade;
    // 旅行事件列表 now managed by Zustand store (travel slice)
    const 旅行事件列表 = store.旅行事件列表;

    const 回档快照系统 = 创建回档快照系统({
        回合快照栈Ref,
        可重Roll计数,
        set可重Roll计数,
        最近自动存档时间戳Ref,
        最近自动存档签名Ref,
        深拷贝,
        规范化角色物品容器映射,
        规范化环境信息,
        规范化社交列表,
        规范化世界状态,
        规范化剧情状态,
        规范化剧情规划状态: 基础规范化剧情规划状态,
        规范化女主剧情规划状态: 基础规范化女主剧情规划状态,
        规范化同人剧情规划状态: 基础规范化同人剧情规划状态,
        规范化同人女主剧情规划状态: 基础规范化同人女主剧情规划状态,
        应用并同步记忆系统: (memory) => 应用并同步记忆系统(memory),
        设置历史记录: 设置历史记录,
        应用视觉设置到状态,
        应用场景图片档案到状态
    });
    const { 同步重Roll计数, 清空重Roll快照, 推入重Roll快照, 弹出重Roll快照, 回档到快照, 重置自动存档状态, 删除最近自动存档并重置状态 } = 回档快照系统;

    const 变量生成队列调度器 = 创建变量生成队列调度器({
        执行变量模型校准工作流,
        apiConfig,
        gameConfig
    });
    const 变量生成进度系统 = 创建变量生成进度系统({
        最近变量生成上下文Ref,
        变量生成中,
        set变量生成中,
        开局变量生成进度,
        set开局变量生成进度,
        世界演变进行中Ref,
        variableGenerationAbortControllerRef,
        深拷贝,
        队列调度器: 变量生成队列调度器
    });
    const { 序列化变量校准命令, 清空变量生成上下文缓存, 记录变量生成上下文, 收集最近变量生成上下文, 等待世界演变空闲, handleCancelVariableGeneration, 获取变量生成状态, 获取任务详情, 监听任务完成 } = 变量生成进度系统;

    const 记忆总结处理器 = 创建记忆总结处理器({
        待处理记忆总结任务,
        set待处理记忆总结任务,
        记忆总结阶段,
        set记忆总结阶段,
        记忆总结草稿,
        set记忆总结草稿,
        记忆总结错误,
        set记忆总结错误,
        待处理NPC记忆总结队列,
        set待处理NPC记忆总结队列,
        NPC记忆总结阶段,
        setNPC记忆总结阶段,
        NPC记忆总结草稿,
        setNPC记忆总结草稿,
        NPC记忆总结错误,
        setNPC记忆总结错误,
        社交,
        设置社交,
        记忆系统,
        设置记忆系统,
        memoryConfig,
        apiConfig,
        历史记录,
        performAutoSave: (...args) => performAutoSaveRef.current?.(...args),
        规范化社交列表
    });
    const { 构建记忆总结用户提示词, 清理记忆总结输出, handleStartMemorySummary, handleCancelMemorySummary, handleBackToMemorySummaryRemind, handleUpdateMemorySummaryDraft, handleStartManualMemorySummary, handleApplyMemorySummary, 构建NPC记忆总结任务, 构建NPC记忆总结用户提示词, 清空NPC记忆总结流程, 刷新NPC记忆总结队列, 应用并同步社交列表, 清空记忆总结流程, 刷新记忆总结任务, 应用并同步记忆系统, handleStartNpcMemorySummary, handleCancelNpcMemorySummary, handleBackToNpcMemorySummaryRemind, handleUpdateNpcMemorySummaryDraft, handleQueueManualNpcMemorySummary, handleApplyNpcMemorySummary } = 记忆总结处理器;

    // --- useFeatureFlags ---
    const featureFlags = useFeatureFlags({
        apiConfig,
        gameConfig,
        历史记录,
        环境,
        剧情,
        社交,
        战斗,
        角色,
        prompts,
        设置角色,
        设置环境,
        设置游戏初始时间,
        设置社交,
        设置世界,
        设置战斗,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        应用并同步记忆系统,
        设置历史记录,
        设置校规系统,
        设置催眠系统,
        清空变量生成上下文缓存,
        setWorldEvents,
        规范化剧情状态,
        规范化角色物品容器映射,
        规范化环境信息,
        深拷贝,
    });
    const {
        世界演变功能已开启,
        文章优化功能已开启,
        已进入主剧情回合,
        执行正文润色,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化社交列表安全,
        应用开场基态,
    } = featureFlags;

    const 后台生图监控 = useBackgroundImageMonitor({
        推送右下角提示,
        NPC生图任务队列,
        场景生图任务队列
    });

    useEffect(() => {
        刷新NPC记忆总结队列(Array.isArray(社交) ? 社交 : [], { 静默: NPC记忆总结阶段 === 'processing' || NPC记忆总结阶段 === 'review' });
    }, [社交, memoryConfig]);

    // 时间初始化（已提取到独立 hook）
    use时间初始化({ 环境, 游戏初始时间, 记忆系统, festivals, 设置环境, 设置游戏初始时间 });

    const 追加系统消息 = 创建追加系统消息(设置历史记录);

    const 获取场景图历史上限 = (): number => (
        规范化图片管理设置(imageManagerConfigRef.current || imageManagerConfig || 默认图片管理设置).场景图历史上限
    );

    const {
        加载场景图片档案,
        写入场景图片档案,
        应用场景图片为壁纸,
        清除场景壁纸,
        设置常驻壁纸,
        清除常驻壁纸,
        应用常驻壁纸为背景,
        删除场景图片记录,
        清空场景图片历史,
        保存场景图片本地副本
    } = 创建场景图片档案工作流({
        获取场景图历史上限,
        读取场景图片档案设置: () => dbService.读取设置(设置键.场景图片档案),
        保存场景图片档案设置: (archive) => dbService.保存设置(设置键.场景图片档案, archive),
        同步场景图片档案: (archive) => {
            场景图片档案Ref.current = archive;
            set场景图片档案(archive);
        },
        获取当前场景图片档案: () => 场景图片档案Ref.current || {},
        清理未引用图片资源: dbService.清理未引用图片资源,
        获取当前视觉设置: () => visualConfigRef.current || visualConfig,
        应用视觉设置到状态,
        深拷贝,
        加载图片AI服务
    });

    const {
        loadBuiltinPromptEntries,
        loadWorldbooks,
        loadWorldbookPresetGroups,
        saveSettings,
        saveBuiltinPromptEntries,
        saveWorldbooks,
        saveWorldbookPresetGroups,
        saveVisualSettings,
        saveImageManagerSettings,
        updateApiConfig,
        saveArtistPreset,
        deleteArtistPreset,
        saveModelConverterPreset,
        deleteModelConverterPreset,
        setModelConverterPresetEnabled,
        savePromptConverterPreset,
        deletePromptConverterPreset,
        exportPresets,
        importPresets,
        saveGameSettings,
        saveMemorySettings,
        updatePrompts,
        updateFestivals
    } = 创建设置持久化工作流({
        获取接口配置: () => apiConfigRef.current,
        同步接口配置: (config) => {
            apiConfigRef.current = config;
            setApiConfig(config);
        },
        设置内置提示词列表: set内置提示词列表,
        设置世界书列表: set世界书列表,
        设置世界书预设组列表: set世界书预设组列表,
        应用视觉设置到状态,
        应用图片管理设置到状态,
        获取当前场景图片档案: () => 场景图片档案Ref.current || {},
        同步场景图片档案: (archive) => {
            场景图片档案Ref.current = archive;
            set场景图片档案(archive);
        },
        获取场景图历史上限,
        设置游戏设置: setGameConfig,
        设置记忆配置: setMemoryConfig,
        设置提示词池: setPrompts,
        设置节日列表: setFestivals
    });

    useEffect(() => {
        void 加载场景图片档案();
    }, []);

    // NSFW 系统初始化（已提取到独立 hook）
    useNSFW系统初始化({
        gameConfig,
        校园系统,
        都市网约车系统,
        写真系统,
        角色,
        社交,
        设置校园系统,
        设置都市网约车系统,
        设置写真系统,
    });

    useEffect(() => {
        void loadBuiltinPromptEntries();
    }, []);

    useEffect(() => {
        void loadWorldbooks();
    }, []);

    useEffect(() => {
        void loadWorldbookPresetGroups();
    }, []);

    // ==================== 图片生成协调器 ====================
    const imageGen = 创建图片生成协调器({
        apiConfig,
        gameConfig,
        环境,
        角色,
        社交,
        历史记录,
        set场景生图任务队列,
        setNPC生图任务队列,
        设置社交,
        规范化社交列表安全,
        规范化环境信息,
        深拷贝,
        环境时间转标准串,
        构建完整地点文本,
        提取NPC生图基础数据: (npc) => 提取NPC生图基础数据(npc, {
            cultivationSystemEnabled: gameConfig?.启用修炼体系 !== false
        }),
        提取NPC生图基础数据附带私密描述,
        提取NPC香闺秘档部位生图数据,
        按NPC读取角色锚点: (npcId) => 按NPC读取角色锚点Ref.current?.(npcId) ?? null,
        提取场景角色锚点: (ctx) => 提取场景角色锚点Ref.current?.(ctx) ?? [],
        获取文生图接口配置,
        获取生图词组转化器接口配置,
        获取生图画师串预设,
        获取当前PNG画风预设摘要: (presetId?: string, type?: 'scene' | 'npc') => 获取当前PNG画风预设摘要Ref.current?.(presetId, type) ?? null,
        获取词组转化器预设提示词,
        接口配置是否可用,
        加载NPC生图工作流,
        加载NPC香闺秘档生图工作流,
        加载场景生图工作流,
        获取场景文生图接口配置,
        生成场景生图记录ID,
        生成NPC生图记录ID,
        应用场景图片为壁纸,
        场景生图自动应用任务Ref,
        后台场景生图监控Ref,
        NPC生图进行中Ref,
        NPC香闺秘档生图进行中Ref,
        推送右下角提示,
        写入场景图片档案,
        performAutoSave: (...args) => performAutoSaveRef.current?.(...args)
    });
    const {
        场景模式已开启,
        创建场景生图任务,
        追加场景生图任务,
        更新场景生图任务,
        删除场景生图任务,
        清空场景生图任务队列,
        获取NPC唯一标识,
        更新NPC最近生图结果,
        写入NPC图片历史记录,
        更新NPC香闺秘档部位结果,
        获取生图阶段中文,
        创建NPC生图任务,
        追加NPC生图任务,
        更新NPC生图任务,
        删除NPC生图任务,
        清空NPC生图任务队列,
        删除NPC图片记录,
        清空NPC图片历史,
        选择NPC头像图片,
        清除NPC头像图片,
        选择NPC立绘图片,
        清除NPC立绘图片,
        选择NPC背景图片,
        清除NPC背景图片,
        保存NPC图片本地副本,
        读取文生图功能配置,
        NPC符合自动生图条件,
        提取新增NPC列表,
        读取修炼体系开关,
        构建文生图额外要求,
        触发场景自动生图,
        生成场景壁纸,
        执行单个NPC生图,
        执行NPC香闺秘档部位生图,
        触发新增NPC自动生图
    } = imageGen;

    // ==================== BDSM 关系管线操作 ====================
    const bdsm = 创建BDSM关系操作工作流({ 校园系统, apiConfig, 设置校园系统 });
    const {
        更新BDSM关系状态,
        添加BDSM任务,
        更新BDSM任务状态,
        更新契约状态,
        添加BDSM里程碑,
        设置日常指令,
        请求生成BDSM任务,
        请求生成BDSM日常指令,
        请求评价BDSM任务,
        请求生成BDSM契约,
        请求判定BDSM阶段推进,
        构建BDSM状态更新回调,
        构建BDSM见面预约更新回调,
        请求报告任务完成,
        请求阶段推进,
    } = bdsm;


    const 构建系统提示词 = (
        promptPool: 提示词结构[],
        memoryData: 记忆系统结构,
        socialData: any[],
        statePayload: any,
        options?: {
            禁用中期长期记忆?: boolean;
            禁用短期记忆?: boolean;
            禁用世界演变分流?: boolean;
            禁用行动选项提示词?: boolean;
            注入剧情推动协议?: boolean;
            注入女主剧情规划协议?: boolean;
            世界书作用域?: 世界书作用域[];
            世界书附加文本?: string[];
            openingConfig?: OpeningConfig;
            eraId?: string | null;
        },
        deviceMessages?: Array<{ app: string; title: string; content: string; timestamp: number; read: boolean }>
    ) => 构建系统提示词工作流({
        promptPool,
        memoryData,
        socialData,
        statePayload,
        gameConfig,
        memoryConfig,
        fallbackPlayerName: 角色?.姓名,
        builtinPromptEntries: 内置提示词列表,
        worldbooks: 世界书列表,
        worldEvolutionEnabled: 世界演变功能已开启(),
        deviceMessages,
        options: { ...options, eraId: options?.eraId ?? currentEra }
    });

    const processResponseCommands = (
        response: GameResponse,
        baseState?: {
            角色: typeof 角色;
            环境: typeof 环境;
            社交: typeof 社交;
            世界: typeof 世界;
            战斗: typeof 战斗;
            玩家门派?: 详细门派结构;
            任务列表?: any[];
            约定列表?: any[];
            剧情: typeof 剧情;
            剧情规划: typeof 剧情规划;
            女主剧情规划?: 女主剧情规划结构;
            同人剧情规划?: 同人剧情规划结构;
            同人女主剧情规划?: 同人女主剧情规划结构;
        },
        options?: {
            applyState?: boolean;
            rawContent?: string;
        }
    ) => 执行响应命令处理(
        response,
        {
            角色,
            环境,
            社交,
            世界,
            战斗,
            玩家门派,
            任务列表,
            约定列表,
            剧情,
            剧情规划,
            女主剧情规划,
            同人剧情规划,
            同人女主剧情规划,
            校园系统
        },
        {
            规范化环境信息,
            规范化社交列表: 规范化社交列表安全,
            规范化世界状态,
            规范化战斗状态,
            规范化门派状态,
            规范化剧情状态,
            规范化剧情规划状态,
            规范化女主剧情规划状态,
            规范化同人剧情规划状态,
            规范化同人女主剧情规划状态,
            规范化角色物品容器映射,
            规范化校园系统: (raw?: any) => {
                const safe = 深拷贝(raw || {});
                return {
                    论坛帖子列表: Array.isArray(safe.论坛帖子列表) ? safe.论坛帖子列表 : [],
                    表白墙帖子列表: Array.isArray(safe.表白墙帖子列表) ? safe.表白墙帖子列表 : [],
                    BDSM帖子列表: Array.isArray(safe.BDSM帖子列表) ? safe.BDSM帖子列表 : [],
                    私聊会话列表: Array.isArray(safe.私聊会话列表) ? safe.私聊会话列表 : [],
                    课程表: (safe.课程表 && typeof safe.课程表 === 'object') ? safe.课程表 : {},
                    校园卡: (safe.校园卡 && typeof safe.校园卡 === 'object') ? {
                        余额: typeof safe.校园卡.余额 === 'number' ? safe.校园卡.余额 : 0,
                        消费记录: Array.isArray(safe.校园卡.消费记录) ? safe.校园卡.消费记录 : [],
                    } : { 余额: 0, 消费记录: [] },
                    社团活动列表: Array.isArray(safe.社团活动列表) ? safe.社团活动列表 : [],
                    欲望系统: safe.欲望系统 ?? undefined,
                    见面预约列表: Array.isArray(safe.见面预约列表) ? safe.见面预约列表 : undefined,
                };
            },
            战斗结束自动清空,
            设置角色,
            设置环境,
            设置社交,
            设置世界,
            设置战斗,
            设置玩家门派,
            设置任务列表,
            设置约定列表,
            设置剧情,
            设置剧情规划,
            设置女主剧情规划,
            设置同人剧情规划,
            设置同人女主剧情规划,
            设置校园系统: 设置校园系统,
            设置写真系统: 设置写真系统,
            设置都市网约车系统: 设置都市网约车系统,
            命令后校准: (nextState) => {
                if (!变量生成功能已启用(apiConfig)) {
                    return nextState;
                }
                return 执行变量自动校准(nextState, {
                    规范化环境信息,
                    规范化社交列表: 规范化社交列表安全,
                    规范化世界状态,
                    规范化战斗状态,
                    规范化门派状态,
                    规范化剧情状态,
                    规范化剧情规划状态,
                    规范化女主剧情规划状态,
                    规范化同人剧情规划状态,
                    规范化同人女主剧情规划状态,
                    规范化角色物品容器映射
                });
            }
        },
        baseState,
        options
    );

    const 执行世界演变更新 = async (params?: {
        来源?: 'manual' | 'auto_due' | 'story_dynamic' | 'story_dynamic_and_due';
        动态世界线索?: string[];
        到期摘要?: string[];
        force?: boolean;
        currentResponse?: GameResponse;
        stateBase?: {
            角色: typeof 角色;
            环境: typeof 环境;
            社交: typeof 社交;
            世界: typeof 世界;
            战斗: typeof 战斗;
            剧情: typeof 剧情;
            剧情规划: typeof 剧情规划;
            女主剧情规划?: 女主剧情规划结构;
            同人剧情规划?: 同人剧情规划结构;
            同人女主剧情规划?: 同人女主剧情规划结构;
        };
    }) => 执行世界演变更新工作流(
        params,
        {
            apiSettings: apiConfig,
            gameConfig,
            角色,
            环境,
            世界,
            剧情,
            记忆系统,
            历史记录,
            prompts,
            开局配置,
            worldbooks: 世界书列表,
            世界演变进行中Ref,
            世界演变去重签名Ref,
            已进入主剧情回合,
            按回合窗口裁剪历史,
            规范化环境信息,
            规范化世界状态,
            规范化剧情状态,
            processResponseCommands,
            setWorldEvents,
            set世界演变更新中,
            set世界演变状态文本,
            set世界演变最近更新时间,
            set世界演变最近摘要,
            set世界演变最近原始消息,
            追加系统消息
        }
    );

    const {
        后台执行统一规划分析
    } = 创建规划更新工作流({
        apiConfig,
        gameConfig,
        角色,
        环境,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        历史记录,
        开局配置,
        prompts,
        worldbooks: 世界书列表,
        规范化环境信息,
        规范化社交列表: 规范化社交列表安全,
        规范化世界状态,
        规范化战斗状态,
        规范化门派状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        深拷贝,
        收集最近完整正文回合,
        构建最近完整正文上下文,
        去重文本数组,
        收集女主规划时间触发原因,
        收集女主正文命中原因,
        收集剧情规划时间触发原因,
        收集剧情正文命中原因,
        提取响应完整正文文本,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        performAutoSave: (...args) => performAutoSave(...args)
    });

    const { handleForceWorldEvolutionUpdate } = useWorldEvolutionControl({
        view,
        loading,
        apiConfig,
        环境,
        世界,
        世界演变更新中,
        变量生成中: 变量生成中,
        世界演变状态文本,
        世界演变最近更新时间,
        世界演变最近现实更新时间戳Ref,
        世界演变去重签名Ref,
        世界演变功能已开启,
        已进入主剧情回合,
        set世界演变状态文本,
        规范化世界状态,
        执行世界演变更新
    });

    let 执行重解析变量生成委托 = async (params: {
        snapshot: any;
        playerInput: string;
        parsedResponse: GameResponse;
    }): Promise<GameResponse> => params.parsedResponse;

    const {
        使用快照重建解析回合,
        updateHistoryItem,
        handleRegenerate,
        handleRecoverFromParseErrorRaw,
        handlePolishTurn
    } = 创建历史回合工作流({
        历史记录,
        记忆系统,
        memoryConfig,
        gameConfig,
        prompts,
        内置提示词列表,
        世界书列表,
        loading,
        变量生成中: 变量生成中,
        记忆总结阶段,
        社交,
        visualConfig,
        visualConfigRef,
        场景图片档案Ref,
        scrollRef,
        获取最新快照: () => 回合快照栈Ref.current[回合快照栈Ref.current.length - 1] || null,
        回档到快照,
        弹出重Roll快照,
        删除最近自动存档并重置状态,
        深拷贝,
        环境时间转标准串,
        获取开局配置: () => 开局配置,
        规范化记忆配置,
        规范化记忆系统,
        规范化社交列表: 规范化社交列表安全,
        规范化视觉设置,
        规范化场景图片档案,
        normalizeCanonicalGameTime,
        构建即时记忆条目,
        构建短期记忆条目,
        写入四段记忆,
        估算AI输出Token,
        提取解析失败原始信息,
        提取原始报错详情,
        构建标签解析选项,
        parseStoryRawText: textAIService.parseStoryRawText,
        执行正文润色,
        规范化游戏设置,
        processResponseCommands,
        按世界演变分流净化响应,
        世界演变功能已开启,
        执行重解析变量生成: (params) => 执行重解析变量生成委托(params),
        应用并同步记忆系统,
        performAutoSave: (...args) => performAutoSave(...args),
        设置剧情,
        设置历史记录,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置社交,
        记录变量生成上下文,
        set聊天区自动滚动抑制令牌,
        获取NPC唯一标识,
        合并NPC图片档案
    });

    const {
        后台执行变量校准: 后台执行变量生成,
        执行变量校准并合并响应: 执行变量生成并合并响应,
        执行重解析变量校准: 执行重解析变量生成
    } = 创建变量生成协调器({
        apiConfig,
        gameConfig,
        prompts,
        开局配置,
        内置提示词列表,
        世界书列表,
        世界演变进行中Ref,
        variableGenerationAbortControllerRef,
        set变量生成中: set变量生成中,
        深拷贝,
        世界演变功能已开启,
        等待世界演变空闲,
        收集最近变量生成上下文,
        执行变量模型校准工作流,
        合并变量生成结果到响应,
        变量生成功能已启用,
        获取变量计算接口配置,
        接口配置是否可用,
        序列化变量生成命令: 序列化变量校准命令,
        使用快照重建解析回合
    }, 获取变量生成并发配置(gameConfig));
    执行重解析变量生成委托 = 执行重解析变量生成;

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (variableGenerationAbortControllerRef.current) {
            variableGenerationAbortControllerRef.current.abort();
        }
    };

    const buildContextSnapshot = async (): Promise<上下文快照> => {
        const currentRefs = [
            apiConfig,
            gameConfig,
            memoryConfig,
            prompts,
            内置提示词列表,
            世界书列表,
            记忆系统,
            历史记录,
            社交,
            角色,
            环境,
            世界,
            战斗,
            玩家门派,
            任务列表,
            约定列表,
            剧情,
            剧情规划,
            女主剧情规划,
            同人剧情规划,
            同人女主剧情规划,
            开局配置
        ];
        const cached = 上下文快照缓存Ref.current;
        if (
            cached
            && cached.refs.length === currentRefs.length
            && cached.refs.every((item, index) => item === currentRefs[index])
        ) {
            return cached.value;
        }

        const nextSnapshot = await 构建上下文快照数据({
            apiConfig,
            gameConfig,
            memoryConfig,
            prompts,
            内置提示词列表,
            世界书列表,
            记忆系统,
            历史记录,
            社交,
            角色,
            环境,
            世界,
            战斗,
            玩家门派,
            任务列表,
            约定列表,
            剧情,
            剧情规划,
            女主剧情规划,
            同人剧情规划,
            同人女主剧情规划,
            开局配置,
            校规系统,
            催眠系统,
            校园系统,
            时代配置ID: currentEra,
            规范化环境信息,
            规范化剧情状态,
            规范化剧情规划状态,
            规范化女主剧情规划状态,
            规范化同人剧情规划状态,
            规范化同人女主剧情规划状态,
            按回合窗口裁剪历史,
            构建系统提示词
        });
        上下文快照缓存Ref.current = {
            value: nextSnapshot,
            refs: currentRefs
        };
        return nextSnapshot;
    };

    // --- Core Send Logic (提取到 useSend.ts) ---
    const { handleSend } = 创建主剧情发送工作流({
        历史记录,
        记忆系统,
        角色,
        环境,
        社交,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        剧情,
        剧情规划,
        女主剧情规划,
        同人剧情规划,
        同人女主剧情规划,
        开局配置,
        校规系统,
        催眠系统,
        校园系统,
        currentEra,
        loading,
        gameConfig,
        apiConfig,
        memoryConfig,
        visualConfig,
        场景图片档案,
        prompts,
        内置提示词列表,
        世界书列表,
        设备状态Messages: 设备状态.messages,
        设备状态Notifications: 设备状态.notifications,
        abortControllerRef,
        variableGenerationAbortControllerRef,
        setLoading,
        setShowSettings,
        设置剧情,
        设置历史记录,
        应用并同步记忆系统,
        构建系统提示词,
        processResponseCommands,
        performAutoSave: (...args: any[]) => performAutoSaveRef.current?.(...args),
        执行正文润色,
        执行世界演变更新,
        触发新增NPC自动生图,
        触发场景自动生图,
        应用常驻壁纸为背景,
        提取新增NPC列表,
        推入重Roll快照,
        弹出重Roll快照: () => 弹出重Roll快照() || undefined,
        回档到快照,
        深拷贝,
        按回合窗口裁剪历史,
        规范化环境信息,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化世界状态,
        游戏设置启用自动重试,
        执行带自动重试的生成请求,
        更新流式草稿为自动重试提示,
        提取解析失败原始信息,
        提取原始报错详情,
        格式化错误详情,
        获取原始AI消息,
        估算消息Token,
        估算AI输出Token,
        计算回复耗时秒,
        文章优化功能已开启,
        后台执行统一规划分析,
        执行变量生成并合并响应,
        派生设备模式,
        onBDSM状态更新: 构建BDSM状态更新回调(gameConfig?.校园NSFW设置),
        onBDSM见面预约更新: 构建BDSM见面预约更新回调(),
        set开局变量生成进度,
        set开局世界演变进度,
        set开局规划进度,
        ensurePromptsLoaded,
    });

    // --- 私聊发送工作流 ---
    const handlePrivateChatSend = async (
        npcId: string,
        npcName: string,
        content: string
    ): Promise<{ npcReply: string }> => {
        const 私聊Api = 获取主剧情接口配置(apiConfig);
        if (!私聊Api || !私聊Api.apiKey) {
            return { npcReply: '[无法连接AI，私聊功能不可用]' };
        }

        // 获取当前私聊会话历史
        const 私聊列表 = 校园系统?.私聊会话列表 || [];
        const 当前会话 = 私聊列表.find((s: any) => s.id === npcId);
        const 会话历史 = (当前会话?.消息列表 || []).map((m: any) => ({
            sender: m.发送者,
            content: m.内容,
            isMe: m.发送者 === (角色?.姓名 || '玩家')
        }));

        try {
            const { 执行私聊发送工作流 } = await import('./useGame/privateChatWorkflow');
            const result = await 执行私聊发送工作流({
                npcId,
                npcName,
                玩家姓名: 角色?.姓名 || '玩家',
                会话历史,
                校园系统,
                apiConfig: 私聊Api
            }, content);

            // 如果 AI 响应中包含欲望系统状态更新，应用它
            if (result.状态更新?.更新档案) {
                设置校园系统?.(prev => {
                    const 欲望系统 = (prev?.欲望系统 || {}) as any;
                    const 现有档案 = 欲望系统.NPC欲望档案 || {};
                    const 更新后档案 = { ...现有档案 };
                    for (const [id, 更新] of Object.entries(result.状态更新!.更新档案)) {
                        更新后档案[id] = { ...(更新后档案[id] || {}), ...更新 };
                    }
                    return {
                        ...prev,
                        欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 }
                    };
                });
            }

            return { npcReply: result.npcReply };
        } catch (err) {
            console.warn('[私聊发送] 失败:', err);
            return { npcReply: '[消息发送失败，请重试]' };
        }
    };

    const imagePresets = useImagePresets({
        apiConfigRef,
        updateApiConfig,
        加载图片AI服务,
        set右下角提示列表,
        社交,
        角色,
        isCultivationSystemEnabled: 读取修炼体系开关,
    });
    const {
        savePngStylePreset: 保存PNG画风预设,
        deletePngStylePreset: 删除PNG画风预设,
        setCurrentPngStylePreset: 设置当前PNG画风预设,
        getCurrentPngStylePreset: 获取当前PNG画风预设摘要,
        parsePngStylePreset,
        exportPngStylePresets: 导出PNG画风预设,
        importPngStylePresets: 导入PNG画风预设,
        saveCharacterAnchor: 保存角色锚点,
        deleteCharacterAnchor: 删除角色锚点,
        setCurrentCharacterAnchor: 设置当前角色锚点,
        getCharacterAnchor: 读取角色锚点,
        getCharacterAnchorByNpcId: 按NPC读取角色锚点,
        getPlayerCharacterAnchor: 读取主角角色锚点,
        getSceneCharacterAnchors: 提取场景角色锚点,
        extractCharacterAnchor: 提取角色锚点,
        extractPlayerCharacterAnchor: 提取主角角色锚点
    } = imagePresets;

    // 注册到 ref，供图片生成协调器前向引用
    按NPC读取角色锚点Ref.current = 按NPC读取角色锚点;
    提取场景角色锚点Ref.current = 提取场景角色锚点;
    获取当前PNG画风预设摘要Ref.current = 获取当前PNG画风预设摘要;

    const updateMemorySystem = (nextMemory: 记忆系统结构) => {
        const normalized = 规范化记忆系统(nextMemory);
        应用并同步记忆系统(normalized);
    };

    const 存档格式版本 = 3;
    const 自动存档最小间隔毫秒 = 30000;
    const 重置读档瞬态状态 = () => {
        清空变量生成上下文缓存();
        世界演变进行中Ref.current = false;
        世界演变去重签名Ref.current = '';
        set世界演变更新中(false);
        set世界演变状态文本('世界演变待命');
        set世界演变最近更新时间(null);
        世界演变最近现实更新时间戳Ref.current = 0;
        set世界演变最近摘要([]);
        set世界演变最近原始消息('');
    };

    const {
        handleSaveGame,
        performAutoSave,
        handleLoadGame
    } = 创建存读档工作流({
        存档格式版本,
        自动存档最小间隔毫秒,
        深拷贝,
        历史记录,
        角色,
        环境,
        社交,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        剧情,
        剧情规划,
        女主剧情规划,
        同人剧情规划,
        同人女主剧情规划,
        记忆系统,
        openingConfig: 开局配置,
        提示词池: prompts,
        游戏初始时间,
        gameConfig,
        memoryConfig,
        获取当前视觉设置快照: () => 规范化视觉设置(深拷贝(visualConfigRef.current || visualConfig)),
        获取当前场景图片档案快照: () => 规范化场景图片档案(深拷贝(场景图片档案Ref.current || 场景图片档案)),
        获取角色锚点列表: () => 规范化接口设置(apiConfigRef.current).功能模型占位.角色锚点列表,
        获取当前角色锚点ID: () => 规范化接口设置(apiConfigRef.current).功能模型占位.当前角色锚点ID,
        获取当前时代信息: () => 时代信息Ref.current,
        校规系统,
        催眠系统,
        校园系统,
        写真系统,
        都市网约车系统,
        构建完整地点文本,
        规范化环境信息,
        规范化世界状态,
        规范化战斗状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化记忆系统,
        规范化可选开局配置,
        规范化记忆配置,
        规范化游戏设置,
        规范化视觉设置,
        规范化场景图片档案,
        规范化角色物品容器映射,
        规范化社交列表: 规范化社交列表安全,
        获取当前提示词池: () => prompts,
        创建开场空白环境,
        创建开场空白世界,
        创建开场空白战斗,
        创建空门派状态,
        创建开场空白剧情,
        应用并同步记忆系统,
        setHasSave,
        setGameConfig,
        setMemoryConfig,
        设置视觉设置: 应用视觉设置到状态,
        设置场景图片档案: 应用场景图片档案到状态,
        设置游戏初始时间,
        设置角色锚点列表: (value) => {
            void updateApiConfig(config => ({
                ...config,
                功能模型占位: {
                    ...config.功能模型占位,
                    角色锚点列表: Array.isArray(value) ? value : []
                }
            }));
        },
        设置当前角色锚点ID: (value) => {
            void updateApiConfig(config => ({
                ...config,
                功能模型占位: {
                    ...config.功能模型占位,
                    当前角色锚点ID: typeof value === 'string' ? value : ''
                }
            }));
        },
        设置时代信息: 应用时代信息到状态,
        设置校规系统: 设置校规系统,
        设置催眠系统: 设置催眠系统,
        设置校园系统: 设置校园系统,
        设置写真系统: 设置写真系统,
        设置都市网约车系统: 设置都市网约车系统,
        setView,
        setShowSaveLoad,
        设置最近开局配置,
        设置角色,
        设置环境,
        设置社交,
        设置世界,
        设置战斗,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置开局配置,
        设置提示词池: setPrompts,
        设置历史记录,
        清空重Roll快照,
        重置自动存档状态,
        最近自动存档时间戳Ref,
        最近自动存档签名Ref,
        读档前重置瞬态状态: 重置读档瞬态状态,
        读档后重置上下文: 清空变量生成上下文缓存,
        读档后定位到最新回合: () => set聊天区强制置底令牌(prev => prev + 1)
    });

    const {
        handleStartNewGameWizard,
        generateOpeningStory,
        handleGenerateWorld,
        handleReturnToHome,
        handleQuickRestart
    } = 创建会话生命周期工作流({
        apiConfig,
        gameConfig,
        memoryConfig,
        view,
        prompts,
        历史记录,
        记忆系统,
        社交,
        环境,
        角色,
        世界,
        战斗,
        玩家门派,
        任务列表,
        约定列表,
        剧情,
        剧情规划,
        女主剧情规划,
        同人剧情规划,
        同人女主剧情规划,
        开局配置,
        内置提示词列表,
        世界书列表,
        loading,
        最近开局配置,
        abortControllerRef,
        ensurePromptsLoaded,
        setView,
        setPrompts,
        setLoading,
        setShowSettings,
        设置历史记录,
        设置最近开局配置,
        清空重Roll快照,
        推入重Roll快照,
        重置自动存档状态,
        设置角色,
        设置环境,
        设置游戏初始时间,
        设置社交,
        设置世界,
        设置战斗,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置开局配置,
        设置时代信息: 应用时代信息到状态,
        currentEra,
        setGameConfig,
        设置开局变量生成进度: set开局变量生成进度,
        设置开局世界演变进度: set开局世界演变进度,
        设置开局规划进度: set开局规划进度,
        setWorldEvents,
        应用并同步记忆系统,
        清空变量生成上下文缓存,
        创建开场基础状态,
        构建前端清空开场状态,
        创建开场命令基态,
        创建开场空白环境,
        创建开场空白世界,
        创建开场空白战斗,
        创建空门派状态,
        创建开场空白剧情,
        创建空剧情规划,
        创建空记忆系统,
        应用开场基态,
        追加系统消息,
        替换流式草稿为失败提示,
        记录变量生成上下文,
        深拷贝,
        performAutoSave,
        构建系统提示词,
        processResponseCommands,
        规范化环境信息,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化角色物品容器映射,
        规范化社交列表: 规范化社交列表安全,
        规范化世界状态,
        规范化战斗状态,
        规范化门派状态,
        游戏设置启用自动重试,
        执行带自动重试的生成请求,
        更新流式草稿为自动重试提示,
        提取解析失败原始信息,
        获取原始AI消息,
        估算消息Token,
        估算AI输出Token,
        计算回复耗时秒,
        触发新增NPC自动生图,
        触发场景自动生图,
        提取新增NPC列表,
        获取当前视觉设置快照: () => 规范化视觉设置(深拷贝(visualConfigRef.current || visualConfig)),
        获取当前场景图片档案快照: () => 规范化场景图片档案(深拷贝(场景图片档案Ref.current || 场景图片档案))
    });

    // 填充前向引用
    performAutoSaveRef.current = performAutoSave;

    const {
        createNpcManually,
        updateNpcManually,
        deleteNpcManually,
        uploadNpcImageToSlot,
        updateNpcMajorRole,
        updateNpcPresence,
        removeNpc
    } = 创建手动NPC工作流({
        获取环境: () => 环境,
        环境时间转标准串,
        规范化社交列表: 规范化社交列表安全,
        设置社交,
        执行社交自动存档: (socialSnapshot) => {
            void performAutoSave({ social: socialSnapshot, history: 历史记录, force: true });
        },
        保存图片资源: dbService.保存图片资源
    });

    const {
        updateRuntimeVariableSection,
        applyRuntimeVariableCommand,
        removeTask,
        removeAgreement
    } = 创建运行时变量工作流({
        获取历史记录: () => 历史记录,
        深拷贝,
        获取当前状态: () => ({
            角色,
            环境,
            社交,
            世界,
            战斗,
            剧情,
            剧情规划,
            女主剧情规划,
            同人剧情规划,
            同人女主剧情规划,
            玩家门派,
            任务列表,
            约定列表,
            记忆系统
        }),
        规范化角色物品容器映射,
        规范化环境信息,
        规范化社交列表: 规范化社交列表安全,
        规范化世界状态,
        规范化战斗状态,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        规范化门派状态,
        规范化记忆系统,
        环境时间转标准串,
        获取开局配置: () => 开局配置,
        设置角色,
        设置环境,
        设置社交,
        设置世界,
        设置战斗,
        设置剧情,
        设置剧情规划,
        设置女主剧情规划,
        设置同人剧情规划,
        设置同人女主剧情规划,
        设置玩家门派,
        设置任务列表,
        设置约定列表,
        应用并同步记忆系统,
        performAutoSave
    });

    const {
        generateNpcImageManually,
        generateNpcSecretPartImage,
        retryNpcImageGeneration
    } = 创建手动图片动作工作流({
        获取社交列表: () => 社交,
        记录后台手动生图监控: (payload) => {
            后台手动生图监控Ref.current.push(payload);
        },
        记录后台私密生图监控: (payload) => {
            后台私密生图监控Ref.current.push(payload);
        },
        推送右下角提示,
        执行单个NPC生图,
        执行NPC香闺秘档部位生图
    });

    const {
        updatePlayerAvatar: 更新玩家头像,
        selectPlayerAvatarImage: 选择主角头像图片,
        clearPlayerAvatarImage: 清除主角头像图片,
        selectPlayerPortraitImage: 选择主角立绘图片,
        clearPlayerPortraitImage: 清除主角立绘图片,
        removePlayerImageRecord: 删除主角图片记录,
        generatePlayerImageManually: 生成主角图片
    } = 创建主角图片工作流({
        获取角色: () => 角色,
        设置角色,
        规范化角色物品容器映射,
        执行自动存档: performAutoSave,
        获取历史记录: () => 历史记录,
        推送右下角提示,
        加载NPC生图工作流,
        apiConfig,
        获取文生图接口配置,
        获取生图词组转化器接口配置,
        获取生图画师串预设,
        获取当前PNG画风预设: (presetId?: string) => 获取当前PNG画风预设摘要(presetId, 'npc'),
        读取主角角色锚点,
        获取词组转化器预设提示词,
        接口配置是否可用,
        读取文生图功能配置,
        主角生图进行中集合: 主角生图进行中Ref.current,
        提取主角生图基础数据: (character) => 提取主角生图基础数据(character, {
            cultivationSystemEnabled: 读取修炼体系开关()
        }),
        创建NPC生图任务,
        生成NPC生图记录ID,
        构建文生图额外要求
    });

    return {
        state: gameState,
        meta: {
            canRerollLatest: 可重Roll计数 > 0,
            canQuickRestart: Boolean(最近开局配置),
            worldEvolutionEnabled: 已进入主剧情回合() && 接口配置是否可用(获取世界演变接口配置(apiConfig)),
            worldEvolutionUpdating: 世界演变更新中,
            worldEvolutionStatus: 世界演变状态文本,
            worldEvolutionLastUpdatedAt: 世界演变最近更新时间,
            worldEvolutionLastSummary: 世界演变最近摘要,
            worldEvolutionLastRawText: 世界演变最近原始消息,
            memorySummaryOpen: Boolean(待处理记忆总结任务) && 记忆总结阶段 !== 'idle',
            memorySummaryStage: 记忆总结阶段,
            memorySummaryTask: 待处理记忆总结任务,
            memorySummaryDraft: 记忆总结草稿,
            memorySummaryError: 记忆总结错误,
            npcMemorySummaryOpen: !Boolean(待处理记忆总结任务) && Boolean(待处理NPC记忆总结队列[0]) && NPC记忆总结阶段 !== 'idle',
            npcMemorySummaryStage: NPC记忆总结阶段,
            npcMemorySummaryTask: 待处理NPC记忆总结队列[0] || null,
            npcMemorySummaryDraft: NPC记忆总结草稿,
            npcMemorySummaryError: NPC记忆总结错误,
            npcMemorySummaryQueueLength: 待处理NPC记忆总结队列.length,
            imageGenerationQueue: NPC生图任务队列,
            sceneImageArchive: 场景图片档案,
            sceneImageQueue: 场景生图任务队列,
            variableGenerationRunning: 变量生成中,
            openingWorldEvolutionProgress: 开局世界演变进度,
            openingPlanningProgress: 开局规划进度,
            openingVariableGenerationProgress: 开局变量生成进度,
            builtinPromptEntries: 内置提示词列表,
            worldbooks: 世界书列表,
            worldbookPresetGroups: 世界书预设组列表,
            notifications: 右下角提示列表,
            chatScrollSuppressToken: 聊天区自动滚动抑制令牌,
            chatForceScrollToken: 聊天区强制置底令牌,
            eraInfo: 时代信息Ref.current,
            // Mobile Device
            deviceState: 设备状态,
            deviceRefreshQueue: 设备刷新任务队列,
        },
        setters: {
            setShowSettings, setShowInventory, setShowEquipment, setShowBattle, setShowSocial, setShowTeam, setShowKungfu, setShowWorld, setShowMap, setShowSect, setShowTask, setShowAgreement, setShowStory, setShowHeroinePlan, setShowMemory, setShowSaveLoad,
            setActiveTab, setCurrentTheme, setCurrentEra,
            setApiConfig, setVisualConfig, setImageManagerConfig, setPrompts,
            set校规系统: 设置校规系统,
            set催眠系统: 设置催眠系统,
            set校园系统: 设置校园系统,
            set约定列表: 设置约定列表,
            set社交: 设置社交,
            set设备刷新队列: set设备刷新任务队列,
        },
        actions: {
            handleSend,
            handlePrivateChatSend,
            handleStop,
            handleCancelVariableGeneration,
            handleRegenerate,
            handlePolishTurn,
            handleRecoverFromParseErrorRaw,
            saveSettings, saveVisualSettings, saveImageManagerSettings, saveGameSettings, saveMemorySettings,
            saveBuiltinPromptEntries,
            saveWorldbooks, saveWorldbookPresetGroups,
            updatePrompts, updateFestivals,
            handleSaveGame, handleLoadGame,
            updateHistoryItem,
            updateMemorySystem,
            createNpcManually,
            updateNpcManually,
            deleteNpcManually,
            uploadNpcImageToSlot,
            updateRuntimeVariableSection,
            applyRuntimeVariableCommand,
            handleStartNewGameWizard,
            handleGenerateWorld,
            handleQuickRestart,
            handleReturnToHome,
            updateNpcMajorRole,
            updateNpcPresence,
            removeNpc,
            removeTask,
            removeAgreement,
            generateNpcImageManually,
            generateNpcSecretPartImage,
            retryNpcImageGeneration,
            updatePlayerAvatar: 更新玩家头像,
            generatePlayerImageManually: 生成主角图片,
            selectPlayerAvatarImage: 选择主角头像图片,
            clearPlayerAvatarImage: 清除主角头像图片,
            selectPlayerPortraitImage: 选择主角立绘图片,
            clearPlayerPortraitImage: 清除主角立绘图片,
            removePlayerImageRecord: 删除主角图片记录,
            generateSceneImageManually: 生成场景壁纸,
            selectNpcAvatarImage: 选择NPC头像图片,
            selectNpcPortraitImage: 选择NPC立绘图片,
            selectNpcBackgroundImage: 选择NPC背景图片,
            clearNpcAvatarImage: 清除NPC头像图片,
            clearNpcPortraitImage: 清除NPC立绘图片,
            clearNpcBackgroundImage: 清除NPC背景图片,
            removeNpcImageRecord: 删除NPC图片记录,
            clearNpcImageHistory: 清空NPC图片历史,
            removeNpcImageQueueTask: 删除NPC生图任务,
            clearNpcImageQueue: 清空NPC生图任务队列,
            saveNpcImageLocally: 保存NPC图片本地副本,
            applySceneImageWallpaper: 应用场景图片为壁纸,
            clearSceneWallpaper: 清除场景壁纸,
            removeSceneImageRecord: 删除场景图片记录,
            clearSceneImageHistory: 清空场景图片历史,
            removeSceneImageQueueTask: 删除场景生图任务,
            clearSceneImageQueue: 清空场景生图任务队列,
            saveSceneImageLocally: 保存场景图片本地副本,
            dismissNotification: 关闭右下角提示,
            handleForceWorldEvolutionUpdate,
            getContextSnapshot: buildContextSnapshot,
            handleStartMemorySummary,
            handleCancelMemorySummary,
            handleBackToMemorySummaryRemind,
            handleUpdateMemorySummaryDraft,
            handleStartManualMemorySummary,
            handleApplyMemorySummary,
            handleStartNpcMemorySummary,
            handleCancelNpcMemorySummary,
            handleBackToNpcMemorySummaryRemind,
            handleUpdateNpcMemorySummaryDraft,
            handleQueueManualNpcMemorySummary,
            handleApplyNpcMemorySummary,
            saveArtistPreset,
            deleteArtistPreset,
            saveModelConverterPreset,
            deleteModelConverterPreset,
            setModelConverterPresetEnabled,
            savePromptConverterPreset,
            deletePromptConverterPreset,
            saveCharacterAnchor: 保存角色锚点,
            deleteCharacterAnchor: 删除角色锚点,
            setCurrentCharacterAnchor: 设置当前角色锚点,
            getCharacterAnchor: 读取角色锚点,
            getCharacterAnchorByNpcId: 按NPC读取角色锚点,
            getPlayerCharacterAnchor: 读取主角角色锚点,
            extractCharacterAnchor: 提取角色锚点,
            extractPlayerCharacterAnchor: 提取主角角色锚点,
            importPresets,
            exportPresets,
            savePngStylePreset: 保存PNG画风预设,
            deletePngStylePreset: 删除PNG画风预设,
            setCurrentPngStylePreset: 设置当前PNG画风预设,
            parsePngStylePreset,
            exportPngStylePresets: 导出PNG画风预设,
            importPngStylePresets: 导入PNG画风预设,
            setPersistentWallpaper: 设置常驻壁纸,
            clearPersistentWallpaper: 清除常驻壁纸,
            pushNotification: 推送右下角提示,
            handleEraChange: 处理时代变更,
            // BDSM 关系管线
            updateBDSMRelationshipState: 更新BDSM关系状态,
            addBDSMTask: 添加BDSM任务,
            updateBDSMTaskStatus: 更新BDSM任务状态,
            updateContractStatus: 更新契约状态,
            addBDSMMilestone: 添加BDSM里程碑,
            setDailyInstructions: 设置日常指令,
            buildMeetingPrompt: 构建见面场景提示词,
            parseMeetingResult: 解析见面结果,
            generateTaskSummary: 生成任务摘要,
            reportTaskComplete: 请求报告任务完成,
            stageAdvance: 请求阶段推进,
            // BDSM AI 操作
            requestBDSMTaskGeneration: 请求生成BDSM任务,
            requestBDSMDailyInstructions: 请求生成BDSM日常指令,
            requestBDSMTaskEvaluation: 请求评价BDSM任务,
            requestBDSMContractGeneration: 请求生成BDSM契约,
            requestBDSMStageAdvance: 请求判定BDSM阶段推进,
            // 旅行系统
            handleTravel,
            handleExplore,
            travelEvents: 旅行事件列表,
            // 交易系统
            handleBuyItem,
            handleSellItem,
            // 锻造系统
            handleForgeItem,
            getForgeRecipes,
            checkForgeMaterials,
            getForgeSuccessRate,
            // Mobile Device
            openDevice: 设备打开,
            closeDevice: 设备关闭,
            openDeviceApp: 设备打开应用,
            returnDeviceHome: 设备返回主页,
            setDeviceState: 设置设备状态,
            // Performance
            performanceConfig
        }
    };
};
