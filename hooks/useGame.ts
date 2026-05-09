
import {
    记忆系统结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    OpeningConfig,
    世界书作用域,
    GameResponse,
    提示词结构
} from '../types';
import { useEffect } from 'react';
import * as textAIService from '../services/ai/text';
import { useGameState } from './useGameState';
import { 规范化接口设置, 获取变量计算接口配置, 获取世界演变接口配置, 获取文生图接口配置, 获取场景文生图接口配置, 获取生图词组转化器接口配置, 获取生图画师串预设, 获取词组转化器预设提示词, 接口配置是否可用, 变量校准功能已启用 as 变量生成功能已启用, 获取变量生成并发配置 } from '../utils/apiConfig';
import {
    规范化记忆系统,
    规范化记忆配置,
    构建即时记忆条目,
    构建短期记忆条目,
    写入四段记忆
} from './useGame/memory/memoryUtils';
import { 创建会话生命周期工作流 } from './useGame/sessionLifecycleWorkflow';
import {
    构建系统提示词 as 构建系统提示词工作流
} from './useGame/systemPromptBuilder';
import { 构建见面场景提示词, 解析见面结果, 生成任务摘要 } from './useGame/bdsmMeetingWorkflow';
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
import { normalizeCanonicalGameTime, 环境时间转标准串 } from './useGame/time/timeUtils';
import { use时间初始化, 构建标签解析选项, 创建追加系统消息 } from './useGame/time/timeInitialization';
import { 提取NPC生图基础数据, 提取NPC香闺秘档部位生图数据, 提取主角生图基础数据 } from './useGame/npcContext';
import { 规范化游戏设置 } from '../utils/gameSettings';
import { 规范化视觉设置 } from '../utils/visualSettings';
import { 默认图片管理设置, 规范化图片管理设置 } from '../utils/imageManagerSettings';
import { 规范化可选开局配置 } from '../utils/openingConfig';
import { 规范化环境信息, 构建完整地点文本, 规范化角色物品容器映射, 规范化社交列表 } from './useGame/stateTransforms';
import { createGameStateAccess, createRefRegistry } from './useGame/state';
import { createImageDomain } from './useGame/domains/imageDomain';
import { createSessionDomain } from './useGame/domains/sessionDomain';
import { 按世界演变分流净化响应 } from './useGame/response/storyResponseGuards';
import { 执行变量自动校准 } from './useGame/planning/variableCalibration';
import { 执行变量模型校准工作流 } from './useGame/planning/variableModelWorkflow';
import { 合并变量校准结果到响应 as 合并变量生成结果到响应 } from './useGame/planning/variableCalibrationMerge';

// 提取的子系统
import { useSettingsActions } from './useGame/useSettingsActions';
import { useFeatureFlags } from './useGame/useFeatureFlags';
import { useTravelAndTrade } from './useGame/useTravelAndTrade';
import { useImagePresets } from './useGame/useImagePresets';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { 提取原始报错详情, 格式化错误详情, 提取解析失败原始信息 } from './useGame/quality/errorFormatting';
import {
    获取原始AI消息,
    计算回复耗时秒,
    估算消息Token,
    估算AI输出Token,
    提取响应完整正文文本,
    收集最近完整正文回合,
    构建最近完整正文上下文
} from './useGame/response/responseTextHelpers';
import { 替换流式草稿为失败提示, 更新流式草稿为自动重试提示, 游戏设置启用自动重试, 执行带自动重试的生成请求 } from './useGame/quality/autoRetry';
import { 去重文本数组, 收集剧情规划时间触发原因, 收集女主规划时间触发原因, 收集剧情正文命中原因, 收集女主正文命中原因 } from './useGame/planning/planningReasonCollector';
import { 创建回档快照系统, type 回合快照结构 } from './useGame/ui/rollbackSnapshot';
import { 创建通知系统 } from './useGame/ui/notificationSystem';
import { 创建记忆总结处理器 } from './useGame/memory/memorySummaryHandlers';
import { 创建变量生成进度系统, type 变量生成上下文缓存项 } from './useGame/planning/variableGenerationProgress';
import { 创建变量生成队列调度器 } from './useGame/planning/variableGenerationQueue';
import { useBackgroundImageMonitor } from './useGame/quality/backgroundImageMonitor';
import { useDevice } from './useGame/useDevice';
import { 创建私聊发送工作流 } from './useGame/npc/privateChatCoordinator';
import { 创建BDSM关系操作工作流 } from './useGame/bdsmRelationshipOperations';
import { 创建主剧情发送工作流 } from './useGame/useSend';
import { 创建图片生成协调器 } from './useGame/image/imageGenerationCoordinator';
import { 创建命令处理工作流 } from './useGame/core/commandProcessorCoordinator';
import { 创建上下文快照工作流, type 上下文快照 } from './useGame/ui/contextSnapshotCoordinator';
import { 构建useGame返回值 } from './useGame/core/useGameReturnMapper';

const 加载图片AI服务 = () => import('../services/ai/image/runtime');
const 加载NPC生图工作流 = () => import('./useGame/image/npcImageWorkflow');
const 加载NPC香闺秘档生图工作流 = () => import('./useGame/image/npcSecretImageWorkflow');
const 加载场景生图工作流 = () => import('./useGame/image/sceneImageWorkflow');


export const useGame = () => {
    // --- 统一状态访问 + Ref 注册表（阶段 1 重构） ---
    const gameState = useGameState();
    const stateAccess = createGameStateAccess(gameState, useGameStore());
    const refs = createRefRegistry();

    // 从统一状态访问层解构（保持原有变量名，确保后续引用不变）
    const {
        view, setView, setHasSave,
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
        setWorldEvents,
        setShowSettings, setShowInventory, setShowEquipment, setShowBattle, setShowSocial, setShowTeam, setShowKungfu, setShowWorld, setShowMap, setShowSect, setShowTask, setShowAgreement, setShowStory, setShowHeroinePlan, setShowMemory, setShowSaveLoad,
        setActiveTab, setCurrentTheme,
        apiConfig, setApiConfig,
        visualConfig, setVisualConfig,
        imageManagerConfig, setImageManagerConfig,
        gameConfig, setGameConfig,
        memoryConfig, setMemoryConfig,
        performanceConfig,
        prompts, setPrompts,
        ensurePromptsLoaded,
        festivals, setFestivals,
        currentEra, setCurrentEra,
        scrollRef, abortControllerRef, variableGenerationAbortControllerRef,
        // Campus Systems
        校规系统, 设置校规系统,
        催眠系统, 设置催眠系统,
        校园系统, 设置校园系统,
        // NSFW Systems
        写真系统, 设置写真系统,
        都市网约车系统, 设置都市网约车系统,
        // Zustand Store — UI Slice
        可重Roll计数, set可重Roll计数,
        聊天区自动滚动抑制令牌, set聊天区自动滚动抑制令牌,
        聊天区强制置底令牌, set聊天区强制置底令牌,
        右下角提示列表, set右下角提示列表,
        // Zustand Store — Image Slice
        NPC生图任务队列, setNPC生图任务队列,
        场景生图任务队列, set场景生图任务队列,
        // Zustand Store — Settings Slice
        内置提示词列表, set内置提示词列表,
        世界书列表, set世界书列表,
        世界书预设组列表, set世界书预设组列表,
        // Zustand Store — Device Slice
        设备状态, 设置设备状态,
        设备刷新任务队列, set设备刷新任务队列,
        // Zustand Store — World Slice
        世界演变更新中, set世界演变更新中,
        世界演变状态文本, set世界演变状态文本,
        世界演变最近更新时间, set世界演变最近更新时间State,
        世界演变最近摘要, set世界演变最近摘要,
        世界演变最近原始消息, set世界演变最近原始消息,
        // Zustand Store — Memory Slice
        待处理记忆总结任务, set待处理记忆总结任务,
        记忆总结阶段, set记忆总结阶段,
        记忆总结草稿, set记忆总结草稿,
        记忆总结错误, set记忆总结错误,
        待处理NPC记忆总结队列, set待处理NPC记忆总结队列,
        NPC记忆总结阶段, setNPC记忆总结阶段,
        NPC记忆总结草稿, setNPC记忆总结草稿,
        NPC记忆总结错误, setNPC记忆总结错误,
        // Zustand Store — Variable Slice
        变量生成中, set变量生成中,
        开局变量生成进度, set开局变量生成进度,
        开局世界演变进度, set开局世界演变进度,
        开局规划进度, set开局规划进度,
        // Zustand Store — Opening Slice
        最近开局配置, 设置最近开局配置,
        // Zustand Store — Scene Config Slice
        场景图片档案, set场景图片档案,
        set时代信息,
        // Zustand Store — Travel Slice
        旅行事件列表,
    } = stateAccess;

    // 从 Ref 注册表解构（保持原有变量名）
    const {
        回合快照栈Ref, 最近自动存档时间戳Ref, 最近自动存档签名Ref,
        apiConfigRef, visualConfigRef, imageManagerConfigRef,
        上下文快照缓存Ref,
        世界演变进行中Ref, 世界演变去重签名Ref, 世界演变最近现实更新时间戳Ref,
        最近变量生成上下文Ref,
        NPC生图进行中Ref, 主角生图进行中Ref, NPC香闺秘档生图进行中Ref,
        场景生图自动应用任务Ref,
        场景图片档案Ref, 时代信息Ref,
        后台手动生图监控Ref, 后台私密生图监控Ref, 后台场景生图监控Ref,
        performAutoSaveRef,
        按NPC读取角色锚点Ref, 提取场景角色锚点Ref, 获取当前PNG画风预设摘要Ref,
    } = refs;

    // 世界演变时间管理（封装游戏内时间 + 现实时间戳）
    const { 世界演变时间管理 } = stateAccess;

    // set世界演变最近更新时间 封装（原内联函数，保持向后兼容）
    const set世界演变最近更新时间 = (value: string | null) => {
        set世界演变最近更新时间State(value);
        世界演变最近现实更新时间戳Ref.current = Date.now();
    };

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
    // 旅行事件列表 now managed by Zustand store (already destructured from stateAccess above)

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
    const { 清空重Roll快照, 推入重Roll快照, 弹出重Roll快照, 回档到快照, 重置自动存档状态, 删除最近自动存档并重置状态 } = 回档快照系统;

    // ==================== 记忆与变量：早期子系统 ====================
    // 这些不依赖 featureFlags 的输出，可以提前创建
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
    const { 序列化变量校准命令, 清空变量生成上下文缓存, 记录变量生成上下文, 收集最近变量生成上下文, 等待世界演变空闲, handleCancelVariableGeneration } = 变量生成进度系统;

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
        performAutoSave: (...args: any[]) => performAutoSaveRef.current?.(...args),
        规范化社交列表
    });
    const { handleStartMemorySummary, handleCancelMemorySummary, handleBackToMemorySummaryRemind, handleUpdateMemorySummaryDraft, handleStartManualMemorySummary, handleApplyMemorySummary, 刷新NPC记忆总结队列, 应用并同步记忆系统, handleStartNpcMemorySummary, handleCancelNpcMemorySummary, handleBackToNpcMemorySummaryRemind, handleUpdateNpcMemorySummaryDraft, handleQueueManualNpcMemorySummary, handleApplyNpcMemorySummary } = 记忆总结处理器;

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

    useBackgroundImageMonitor({
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

    // ==================== 图片生成域 ====================
    const imageDomain = createImageDomain({
        stateAccess,
        refs,
        apiConfig,
        gameConfig,
        visualConfig,
        imageManagerConfig,
        推送右下角提示,
        深拷贝,
        规范化环境信息,
        规范化社交列表安全,
        规范化角色物品容器映射,
        环境时间转标准串,
        构建完整地点文本,
        提取NPC生图基础数据,
        提取NPC生图基础数据附带私密描述,
        提取NPC香闺秘档部位生图数据,
        提取主角生图基础数据,
        生成场景生图记录ID,
        生成NPC生图记录ID,
        创建场景图片档案工作流,
        创建图片生成协调器,
        创建手动图片动作工作流,
        创建手动NPC工作流,
        创建主角图片工作流,
        useImagePresets,
        加载图片AI服务,
        加载NPC生图工作流,
        加载NPC香闺秘档生图工作流,
        加载场景生图工作流,
        获取文生图接口配置,
        获取场景文生图接口配置,
        获取生图词组转化器接口配置,
        获取生图画师串预设,
        获取词组转化器预设提示词,
        接口配置是否可用,
    });
    const { sceneArchive, imageGen, imagePresets, manualNpc, manualImageActions, playerImage } = imageDomain;

    const {
        加载场景图片档案, 写入场景图片档案, 应用场景图片为壁纸,
        清除场景壁纸, 设置常驻壁纸, 清除常驻壁纸, 应用常驻壁纸为背景,
        删除场景图片记录, 清空场景图片历史, 保存场景图片本地副本
    } = sceneArchive;

    const {
        删除场景生图任务, 清空场景生图任务队列, 获取NPC唯一标识,
        创建NPC生图任务, 删除NPC生图任务, 清空NPC生图任务队列,
        删除NPC图片记录, 清空NPC图片历史, 选择NPC头像图片,
        清除NPC头像图片, 选择NPC立绘图片, 清除NPC立绘图片,
        选择NPC背景图片, 清除NPC背景图片, 保存NPC图片本地副本,
        读取文生图功能配置, 提取新增NPC列表, 读取修炼体系开关,
        构建文生图额外要求, 触发场景自动生图, 生成场景壁纸,
        执行单个NPC生图, 执行NPC香闺秘档部位生图, 触发新增NPC自动生图
    } = imageGen;

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

    const {
        createNpcManually, updateNpcManually, deleteNpcManually,
        uploadNpcImageToSlot, updateNpcMajorRole, updateNpcPresence, removeNpc
    } = manualNpc;

    const {
        generateNpcImageManually, generateNpcSecretPartImage, retryNpcImageGeneration
    } = manualImageActions;

    const {
        updatePlayerAvatar: 更新玩家头像,
        selectPlayerAvatarImage: 选择主角头像图片,
        clearPlayerAvatarImage: 清除主角头像图片,
        selectPlayerPortraitImage: 选择主角立绘图片,
        clearPlayerPortraitImage: 清除主角立绘图片,
        removePlayerImageRecord: 删除主角图片记录,
        generatePlayerImageManually: 生成主角图片
    } = playerImage;

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
        获取场景图历史上限: () => 规范化图片管理设置(imageManagerConfigRef.current || imageManagerConfig || 默认图片管理设置).场景图历史上限,
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

    // ==================== 命令处理工作流 ====================
    const { processResponseCommands } = 创建命令处理工作流({
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
        校园系统,
        写真系统,
        都市网约车系统,
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
        战斗结束自动清空,
        深拷贝,
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
        设置校园系统,
        设置写真系统,
        设置都市网约车系统,
        执行变量自动校准,
        变量生成功能已启用,
        apiConfig
    });

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

    // ==================== 变量校准协调器 ====================
    // 注意：此协调器依赖 featureFlags.世界演变功能已开启，必须在 featureFlags 之后创建
    const {
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

    // --- 上下文快照 ---
    const { buildContextSnapshot } = 创建上下文快照工作流({
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
        currentEra,
        上下文快照缓存Ref,
        构建系统提示词,
        规范化环境信息,
        规范化剧情状态,
        规范化剧情规划状态,
        规范化女主剧情规划状态,
        规范化同人剧情规划状态,
        规范化同人女主剧情规划状态,
        按回合窗口裁剪历史
    });

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
    const { handlePrivateChatSend } = 创建私聊发送工作流({
        apiConfig,
        校园系统,
        角色,
        设置校园系统
    });

    const updateMemorySystem = (nextMemory: 记忆系统结构) => {
        const normalized = 规范化记忆系统(nextMemory);
        应用并同步记忆系统(normalized);
    };

    // ==================== 会话生命周期域 ====================
    const sessionDomain = createSessionDomain({
        apiConfig,
        存档格式版本: 3,
        自动存档最小间隔毫秒: 30000,
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
        开局配置,
        prompts,
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
        规范化社交列表安全,
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
        设置角色锚点列表: (value: any) => {
            void updateApiConfig(config => ({
                ...config,
                功能模型占位: {
                    ...config.功能模型占位,
                    角色锚点列表: Array.isArray(value) ? value : []
                }
            }));
        },
        设置当前角色锚点ID: (value: any) => {
            void updateApiConfig(config => ({
                ...config,
                功能模型占位: {
                    ...config.功能模型占位,
                    当前角色锚点ID: typeof value === 'string' ? value : ''
                }
            }));
        },
        设置时代信息: 应用时代信息到状态,
        设置校规系统,
        设置催眠系统,
        设置校园系统,
        设置写真系统,
        设置都市网约车系统,
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
        读档前重置瞬态状态: () => {
            清空变量生成上下文缓存();
            世界演变进行中Ref.current = false;
            世界演变去重签名Ref.current = '';
            set世界演变更新中(false);
            set世界演变状态文本('世界演变待命');
            set世界演变最近更新时间(null);
            世界演变最近现实更新时间戳Ref.current = 0;
            set世界演变最近摘要([]);
            set世界演变最近原始消息('');
        },
        读档后重置上下文: 清空变量生成上下文缓存,
        读档后定位到最新回合: () => set聊天区强制置底令牌(prev => prev + 1),
        创建存读档工作流,
        view,
        loading,
        最近开局配置,
        abortControllerRef,
        ensurePromptsLoaded,
        setLoading,
        setShowSettings,
        currentEra,
        setWorldEvents,
        清空变量生成上下文缓存,
        创建开场基础状态,
        构建前端清空开场状态,
        创建开场命令基态,
        创建空剧情规划,
        创建空记忆系统,
        应用开场基态,
        追加系统消息,
        替换流式草稿为失败提示,
        记录变量生成上下文,
        构建系统提示词: 构建系统提示词工作流,
        processResponseCommands,
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
        设置开局变量生成进度: set开局变量生成进度,
        设置开局世界演变进度: set开局世界演变进度,
        设置开局规划进度: set开局规划进度,
        创建会话生命周期工作流,
        performAutoSaveRef,
        内置提示词列表,
        世界书列表,
        推入重Roll快照,
    });

    const { handleSaveGame, performAutoSave, handleLoadGame } = sessionDomain;
    const { handleStartNewGameWizard, handleGenerateWorld, handleReturnToHome, handleQuickRestart } = sessionDomain;

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


    return 构建useGame返回值({
        gameState,
        可重Roll计数,
        世界演变更新中,
        世界演变状态文本,
        世界演变最近更新时间,
        世界演变最近摘要,
        世界演变最近原始消息,
        待处理记忆总结任务,
        记忆总结阶段,
        记忆总结草稿,
        记忆总结错误,
        待处理NPC记忆总结队列,
        NPC记忆总结阶段,
        NPC记忆总结草稿,
        NPC记忆总结错误,
        NPC生图任务队列,
        场景图片档案,
        场景生图任务队列,
        变量生成中,
        开局世界演变进度,
        开局规划进度,
        开局变量生成进度,
        内置提示词列表,
        世界书列表,
        世界书预设组列表,
        右下角提示列表,
        聊天区自动滚动抑制令牌,
        聊天区强制置底令牌,
        时代信息Ref,
        设备状态,
        设备刷新任务队列,
        旅行事件列表,
        最近开局配置,
        已进入主剧情回合,
        接口配置是否可用,
        获取世界演变接口配置,
        apiConfig,
        setShowSettings, setShowInventory, setShowEquipment, setShowBattle, setShowSocial, setShowTeam, setShowKungfu, setShowWorld, setShowMap, setShowSect, setShowTask, setShowAgreement, setShowStory, setShowHeroinePlan, setShowMemory, setShowSaveLoad,
        setActiveTab, setCurrentTheme, setCurrentEra,
        setApiConfig, setVisualConfig, setImageManagerConfig, setPrompts,
        设置校规系统, 设置催眠系统, 设置校园系统, 设置约定列表, 设置社交,
        set设备刷新任务队列,
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
        更新玩家头像,
        生成主角图片,
        选择主角头像图片,
        清除主角头像图片,
        选择主角立绘图片,
        清除主角立绘图片,
        删除主角图片记录,
        生成场景壁纸,
        选择NPC头像图片,
        选择NPC立绘图片,
        选择NPC背景图片,
        清除NPC头像图片,
        清除NPC立绘图片,
        清除NPC背景图片,
        删除NPC图片记录,
        清空NPC图片历史,
        删除NPC生图任务,
        清空NPC生图任务队列,
        保存NPC图片本地副本,
        应用场景图片为壁纸,
        清除场景壁纸,
        删除场景图片记录,
        清空场景图片历史,
        删除场景生图任务,
        清空场景生图任务队列,
        保存场景图片本地副本,
        关闭右下角提示,
        handleForceWorldEvolutionUpdate,
        buildContextSnapshot,
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
        保存角色锚点,
        删除角色锚点,
        设置当前角色锚点,
        读取角色锚点,
        按NPC读取角色锚点,
        读取主角角色锚点,
        提取角色锚点,
        提取主角角色锚点,
        importPresets,
        exportPresets,
        保存PNG画风预设,
        删除PNG画风预设,
        设置当前PNG画风预设,
        parsePngStylePreset,
        导出PNG画风预设,
        导入PNG画风预设,
        设置常驻壁纸,
        清除常驻壁纸,
        推送右下角提示,
        处理时代变更,
        更新BDSM关系状态,
        添加BDSM任务,
        更新BDSM任务状态,
        更新契约状态,
        添加BDSM里程碑,
        设置日常指令,
        构建见面场景提示词,
        解析见面结果,
        生成任务摘要,
        请求报告任务完成,
        请求阶段推进,
        请求生成BDSM任务,
        请求生成BDSM日常指令,
        请求评价BDSM任务,
        请求生成BDSM契约,
        请求判定BDSM阶段推进,
        handleTravel,
        handleExplore,
        handleBuyItem,
        handleSellItem,
        handleForgeItem,
        getForgeRecipes,
        checkForgeMaterials,
        getForgeSuccessRate,
        设备打开,
        设备关闭,
        设备打开应用,
        设备返回主页,
        设置设备状态,
        performanceConfig
    });
};
