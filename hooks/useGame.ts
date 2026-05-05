
import {
    角色数据结构,
    环境信息结构,
    聊天记录结构,
    接口设置结构,
    提示词结构,
    视觉设置结构,
    游戏设置结构,
    记忆系统结构,
    WorldGenConfig,
    剧情系统结构,
    剧情规划结构,
    女主剧情规划结构,
    同人剧情规划结构,
    同人女主剧情规划结构,
    OpeningConfig,
    NPC结构,
    场景图片档案,
    场景生图任务记录,
    NPC生图任务记录,
    生图任务来源类型,
    香闺秘档部位类型,
    图片管理设置结构,
    内置提示词条目结构,
    世界书结构,
    世界书预设组结构,
    世界书作用域,
    TavernCommand,
    GameResponse,
    记忆配置结构,
    详细门派结构,
    节日结构,
    世界数据结构,
    战斗状态结构,
    时代信息结构
} from '../types';
import { 地图结构, 建筑结构 } from '../models/game/world';
import { 游戏物品 } from '../models/domain/item';
import { 旅行事件, 评估旅行可行性, 执行旅行, 执行探索, 推进游戏时间 } from './useGame/travelWorkflow';
import { 执行购买, 执行出售, 计算购买价格, 计算出售价格, 出售结果 } from './useGame/tradeWorkflow';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as dbService from '../services/dbService';
import { 获取时代信息, 获取时代推荐主题, 获取时代主题方案 } from '../models/system';
import { 应用时代主题到根元素 } from '../styles/themes';
import { 设置时代UI文案 } from '../utils/eraUIText';
import * as textAIService from '../services/ai/text';
import { useGameState } from './useGameState';
import { 规范化接口设置, 获取记忆总结接口配置, 获取变量计算接口配置, 获取世界演变接口配置, 获取文生图接口配置, 获取场景文生图接口配置, 获取生图词组转化器接口配置, 获取生图画师串预设, 获取词组转化器预设提示词, 获取主剧情接口配置, 获取设备消息接口配置, 接口配置是否可用, 变量校准功能已启用 as 变量生成功能已启用 } from '../utils/apiConfig';
import type { 当前可用接口结构 } from '../utils/apiConfig';
import {
    规范化记忆系统,
    规范化记忆配置,
    构建即时记忆条目,
    构建短期记忆条目,
    写入四段记忆,
    构建待处理记忆压缩任务,
    构建手动记忆压缩任务,
    应用记忆压缩结果,
    记忆压缩任务结构
} from './useGame/memoryUtils';
import { 执行主剧情发送工作流 } from './useGame/sendWorkflow';
import { 执行正文润色 as 执行正文润色工作流 } from './useGame/bodyPolish';
import { 构建上下文快照数据 } from './useGame/contextSnapshot';
import { 执行响应命令处理 } from './useGame/responseCommandProcessor';
import { 创建会话生命周期工作流 } from './useGame/sessionLifecycleWorkflow';
import {
    构建系统提示词 as 构建系统提示词工作流,
    type 运行时提示词状态
} from './useGame/systemPromptBuilder';
import { 从NPC创建欲望档案, 创建默认欲望档案 } from './useGame/campusNSFWEngine';
import { 构建见面场景提示词, 解析见面结果, 生成任务摘要, type 见面场景上下文, type 日常指令 } from './useGame/bdsmMeetingWorkflow';
import type { BDSM调教任务, BDSM任务状态, BDSM评价等级, 契约记录, 关系阶段, BDSM日常指令 } from '../models/campusNSFW';
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
import type { 开场命令基态 } from './useGame/storyState';
import { 执行世界演变更新工作流 } from './useGame/worldEvolutionWorkflow';
import { 创建图片预设工作流, 提取NPC生图基础数据附带私密描述 } from './useGame/imagePresetWorkflow';
import { 创建设置持久化工作流 } from './useGame/config/settingsPersistenceWorkflow';
import { 创建历史回合工作流 } from './useGame/historyTurnWorkflow';
import { 创建存读档工作流 } from './useGame/saveLoad/saveLoadWorkflow';
import { 创建规划更新工作流 } from './useGame/planningUpdateWorkflow';
import { 创建NPC图片状态工作流, 合并NPC图片档案, 生成NPC生图记录ID } from './useGame/npcImageStateWorkflow';
import { 创建场景图片档案工作流, 按场景图上限裁剪档案, 生成场景生图记录ID, 规范化场景图片档案 } from './useGame/sceneImageArchiveWorkflow';
import { 创建场景生图触发工作流 } from './useGame/sceneImageTriggerWorkflow';
import { 创建手动图片动作工作流 } from './useGame/image/manualImageActionsWorkflow';
import { 创建手动NPC工作流 } from './useGame/manualNpcWorkflow';
import { 创建主角图片工作流 } from './useGame/playerImageWorkflow';
import { 创建运行时变量工作流 } from './useGame/runtimeVariableWorkflow';
import { 创建变量校准协调器 as 创建变量生成协调器 } from './useGame/variableCalibrationCoordinator';
import { useWorldEvolutionControl } from './useGame/worldEvolutionControl';
import { normalizeCanonicalGameTime, 环境时间转标准串, 提取环境月日 } from './useGame/timeUtils';
import { 提取NPC生图基础数据, 提取NPC香闺秘档部位生图数据, 提取主角生图基础数据 } from './useGame/npcContext';
import { 应用NPC记忆总结, 构建手动NPC记忆总结候选, 构建自动NPC记忆总结候选, 构建NPC记忆总结回退文案 } from './useGame/npcMemorySummary';
import { 规范化游戏设置 } from '../utils/gameSettings';
import { 规范化视觉设置 } from '../utils/visualSettings';
import { 默认图片管理设置, 规范化图片管理设置 } from '../utils/imageManagerSettings';
import { 规范化可选开局配置 } from '../utils/openingConfig';
import type { DeviceGameContext } from '../models/mobileDevice';
import { 构建COT伪装提示词, 规范化比较文本, 酒馆预设模式可用 } from './useGame/promptRuntime';
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
import { 按世界演变分流净化响应 } from './useGame/storyResponseGuards';
import { 执行变量自动校准 } from './useGame/variableCalibration';
import { 执行变量模型校准工作流 } from './useGame/variableModelWorkflow';
import { 合并变量校准结果到响应 as 合并变量生成结果到响应 } from './useGame/variableCalibrationMerge';
import { 获取图片展示地址, 压缩图片资源字段 } from '../utils/imageAssets';
import { 设置键 } from '../utils/settingsSchema';
import { countOpenAIChatMessagesTokens, countOpenAITextTokens } from '../utils/tokenEstimate';

// 提取的子系统
import { 提取原始报错详情, 格式化错误详情, 提取解析失败原始信息 } from './useGame/errorFormatting';
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
} from './useGame/responseTextHelpers';
import { 自动重试最大次数, 替换流式草稿为失败提示, 更新流式草稿为自动重试提示, 游戏设置启用自动重试, 提取自动重试原因, 是否可自动重试错误, 执行带自动重试的生成请求 } from './useGame/autoRetry';
import { 去重文本数组, 收集剧情规划时间触发原因, 收集女主规划时间触发原因, 收集剧情正文命中原因, 收集女主正文命中原因, 过滤规划补丁命令 } from './useGame/planningReasonCollector';
import { 创建回档快照系统, type 回合快照结构 } from './useGame/rollbackSnapshot';
import { 创建通知系统, type 右下角提示结构 } from './useGame/notificationSystem';
import { 创建记忆总结处理器, type NPC记忆总结任务结构, type 记忆总结阶段类型 } from './useGame/memorySummaryHandlers';
import { 创建变量生成进度系统, type 变量生成上下文缓存项 } from './useGame/variableGenerationProgress';
import { use后台生图监控 } from './useGame/backgroundImageMonitor';
import { 触发设备消息生成 } from './useGame/triggerDeviceMessageWorkflow';
import { use后台设备刷新监控, type 设备刷新任务 } from './useGame/deviceRefreshMonitor';

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

type 发送选项 = {
    onRecallProgress?: (progress: 回忆检索进度) => void;
    onPolishProgress?: (progress: 正文润色进度) => void;
    onWorldEvolutionProgress?: (progress: 世界演变进度) => void;
    onPlanningProgress?: (progress: 规划分析进度) => void;
    onVariableGenerationProgress?: (progress: 变量生成进度) => void;
    onStageFailureDecision?: (params: 独立阶段失败决策参数) => Promise<独立阶段失败决策> | 独立阶段失败决策;
};

const 加载图片AI服务 = () => import('../services/ai/image/runtime');
const 加载NPC生图工作流 = () => import('./useGame/npcImageWorkflow');
const 加载NPC香闺秘档生图工作流 = () => import('./useGame/npcSecretImageWorkflow');
const 加载场景生图工作流 = () => import('./useGame/sceneImageWorkflow');


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

type 发送结果 = {
    cancelled?: boolean;
    attachedRecallPreview?: string;
    preparedRecallTag?: string;
    needRecallConfirm?: boolean;
    needRerollConfirm?: boolean;
    parseErrorMessage?: string;
    parseErrorDetail?: string;
    parseErrorRawText?: string;
    errorDetail?: string;
    errorTitle?: string;
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
        prompts, setPrompts,
        ensurePromptsLoaded,
        festivals, setFestivals,
        currentTheme, setCurrentTheme,
        currentEra, setCurrentEra,
        scrollRef, abortControllerRef, variableGenerationAbortControllerRef,

        // Campus Systems
        校规系统, 设置校规系统,
        催眠系统, 设置催眠系统,
        校园系统, 设置校园系统
    } = gameState;

    // Mobile Device
    const { 设备状态, 设置设备状态, 设备打开, 设备关闭, 设备打开应用, 设备返回主页 } = gameState;

    // 旅行系统
    const [旅行事件列表, set旅行事件列表] = useState<旅行事件[]>([]);

    const handleTravel = useCallback((目标地图: 地图结构, 目标建筑: 建筑结构 | null) => {
        const 当前位置 = { 大地点: 环境?.大地点 || '', 中地点: 环境?.中地点 || '', 小地点: 环境?.小地点 || '' };
        const 可行性 = 评估旅行可行性(角色, 当前位置, 目标地图);
        if (!可行性.可行) {
            return;
        }

        const 结果 = 执行旅行(角色, 环境, 目标地图, 目标建筑);
        if (结果.成功) {
            设置环境(结果.新环境);
            set旅行事件列表(结果.事件);
        }
    }, [角色, 环境, 设置环境]);

    const handleExplore = useCallback((目标建筑: 建筑结构) => {
        const 结果 = 执行探索(环境, 目标建筑);
        if (结果.成功) {
            设置环境((prev) => ({ ...prev, 时间: 结果.新时间 || prev.时间, 具体地点: 目标建筑.名称 }));
        }
    }, [环境, 设置环境]);

    // 交易系统
    const handleBuyItem = useCallback((物品: 游戏物品, 卖家NPC: NPC结构 | null) => {
        const 价格 = 计算购买价格(物品, 卖家NPC);
        const 结果 = 执行购买(角色.金钱, 角色.物品列表, 物品, 价格);
        if (结果.成功) {
            设置角色((prev) => ({ ...prev, 金钱: 结果.新金钱, 物品列表: 结果.新物品列表 as typeof prev.物品列表 }));
        }
        return 结果;
    }, [角色, 设置角色]);

    const handleSellItem = useCallback((物品ID: string) => {
        const 物品 = 角色.物品列表.find(i => i.ID === 物品ID);
        if (!物品) {
            return { 成功: false, 新金钱: 角色.金钱, 新物品列表: 角色.物品列表, 错误: '物品不存在' } as 出售结果;
        }
        const 价格 = 计算出售价格(物品, null);
        const 结果 = 执行出售(角色.金钱, 角色.物品列表, 物品ID, 价格);
        if (结果.成功) {
            设置角色((prev) => ({ ...prev, 金钱: 结果.新金钱, 物品列表: 结果.新物品列表 as typeof prev.物品列表 }));
        }
        return 结果;
    }, [角色, 设置角色]);

    /** 根据 gameConfig 推导设备模式 */
    const 派生设备模式 = (): 'normal' | 'li' => {
        const perEra = gameConfig?.启用子纪元里模式;
        if (perEra && currentEra in perEra) {
            return perEra[currentEra] ? 'li' : 'normal';
        }
        return 'normal'; // 未设置时默认正常模式
    };

    // 覆盖 设备打开：打开时同步设置当前时代的里模式状态
    const 打开设备 = () => {
        设备打开();
        const mode = 派生设备模式();
        设置设备状态((prev) => ({ ...prev, mode }));
    };
    const 回合快照栈Ref = useRef<回合快照结构[]>([]);
    const 最近自动存档时间戳Ref = useRef<number>(0);
    const 最近自动存档签名Ref = useRef<string>('');
    const [可重Roll计数, set可重Roll计数] = useState(0);
    const [最近开局配置, 设置最近开局配置] = useState<最近开局配置结构 | null>(null);
    const apiConfigRef = useRef(apiConfig);
    const visualConfigRef = useRef(visualConfig);
    const imageManagerConfigRef = useRef<图片管理设置结构>(imageManagerConfig || 默认图片管理设置);
    const [世界演变更新中, set世界演变更新中] = useState(false);
    const [世界演变状态文本, set世界演变状态文本] = useState('世界演变待命');
    // 世界演变“最近更新时间”应使用游戏内时间戳（用于展示/归档），而非现实时间。
    const [世界演变最近更新时间, set世界演变最近更新时间State] = useState<string | null>(null);
    // 仍然需要一个现实时间戳用于前端去抖/冷启动保护（避免依赖抖动导致 auto_due 连续触发）。
    const 世界演变最近现实更新时间戳Ref = useRef<number>(0);
    const set世界演变最近更新时间 = (value: string | null) => {
        set世界演变最近更新时间State(value);
        世界演变最近现实更新时间戳Ref.current = Date.now();
    };
    const [世界演变最近摘要, set世界演变最近摘要] = useState<string[]>([]);
    const [世界演变最近原始消息, set世界演变最近原始消息] = useState('');
    const [待处理记忆总结任务, set待处理记忆总结任务] = useState<记忆压缩任务结构 | null>(null);
    const [记忆总结阶段, set记忆总结阶段] = useState<记忆总结阶段类型>('idle');
    const [记忆总结草稿, set记忆总结草稿] = useState('');
    const [记忆总结错误, set记忆总结错误] = useState('');
    const [待处理NPC记忆总结队列, set待处理NPC记忆总结队列] = useState<NPC记忆总结任务结构[]>([]);
    const [NPC记忆总结阶段, setNPC记忆总结阶段] = useState<记忆总结阶段类型>('idle');
    const [NPC记忆总结草稿, setNPC记忆总结草稿] = useState('');
    const [NPC记忆总结错误, setNPC记忆总结错误] = useState('');
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
    const [NPC生图任务队列, setNPC生图任务队列] = useState<NPC生图任务记录[]>([]);
    const 场景生图自动应用任务Ref = useRef('');
    const 场景图片档案Ref = useRef<场景图片档案>({});
    const [场景图片档案, set场景图片档案] = useState<场景图片档案>({});
    const 时代信息Ref = useRef<时代信息结构 | undefined>(undefined);
    const [时代信息, set时代信息] = useState<时代信息结构 | undefined>(undefined);
    const [场景生图任务队列, set场景生图任务队列] = useState<场景生图任务记录[]>([]);

    // 设备刷新任务队列
    const [设备刷新任务队列, set设备刷新任务队列] = useState<设备刷新任务[]>([]);

    const 后台手动生图监控Ref = useRef<Array<{ npcId: string; since: number; npcName: string; 构图: '头像' | '半身' | '立绘' }>>([]);
    const 已提示后台生图任务Ref = useRef<Set<string>>(new Set());
    const 后台私密生图监控Ref = useRef<Array<{ npcId: string; since: number; npcName: string; 部位: 香闺秘档部位类型 }>>([]);
    const 已提示后台私密生图任务Ref = useRef<Set<string>>(new Set());
    const 后台场景生图监控Ref = useRef<Array<{ since: number; 摘要: string }>>([]);
    const 已提示后台场景生图任务Ref = useRef<Set<string>>(new Set());
    const performAutoSaveRef = useRef<((...args: any[]) => void) | null>(null);
    const [右下角提示列表, set右下角提示列表] = useState<右下角提示结构[]>([]);
    const [聊天区自动滚动抑制令牌, set聊天区自动滚动抑制令牌] = useState(0);
    const [聊天区强制置底令牌, set聊天区强制置底令牌] = useState(0);
    const [变量生成中, set变量生成中] = useState(false);
    const [开局变量生成进度, set开局变量生成进度] = useState<开局独立阶段进度 | null>(null);
    const [开局世界演变进度, set开局世界演变进度] = useState<开局独立阶段进度 | null>(null);
    const [开局规划进度, set开局规划进度] = useState<开局独立阶段进度 | null>(null);
    const [内置提示词列表, set内置提示词列表] = useState<内置提示词条目结构[]>([]);
    const [世界书列表, set世界书列表] = useState<世界书结构[]>([]);
    const [世界书预设组列表, set世界书预设组列表] = useState<世界书预设组结构[]>([]);

    useEffect(() => {
        apiConfigRef.current = apiConfig;
    }, [apiConfig]);

    useEffect(() => {
        visualConfigRef.current = visualConfig;
    }, [visualConfig]);

    useEffect(() => {
        imageManagerConfigRef.current = 规范化图片管理设置(imageManagerConfig);
    }, [imageManagerConfig]);

    // --- Actions (before subsystems) ---
    const 深拷贝 = <T,>(data: T): T => {
        if (data === undefined || data === null) {
            return data;
        }
        if (typeof structuredClone === 'function') {
            return structuredClone(data);
        }
        return JSON.parse(JSON.stringify(data)) as T;
    };
    const 应用视觉设置到状态 = (value: Partial<视觉设置结构> | null | undefined) => {
        const normalized = 规范化视觉设置(value || {});
        visualConfigRef.current = normalized;
        setVisualConfig(normalized);
        void dbService.保存设置(设置键.视觉设置, normalized);
    };
    const 应用场景图片档案到状态 = (value: 场景图片档案 | null | undefined) => {
        const normalized = 规范化场景图片档案(value || {});
        场景图片档案Ref.current = normalized;
        set场景图片档案(normalized);
        void dbService.保存设置(设置键.场景图片档案, normalized);
    };
    const 应用时代信息到状态 = (value: 时代信息结构 | undefined) => {
        时代信息Ref.current = value;
        set时代信息(value);
    };
    const 处理时代变更 = async (eraId: string) => {
        setCurrentEra(eraId);
        void dbService.保存设置(设置键.应用时代, eraId);
        const eraInfo = 获取时代信息(eraId);
        应用时代信息到状态(eraInfo || undefined);
        const eraTheme = 获取时代主题方案(eraId);
        if (eraTheme) {
            应用时代主题到根元素(eraTheme);
            设置时代UI文案(eraTheme);
        }
        const recommendedTheme = 获取时代推荐主题(eraId);
        if (recommendedTheme) {
            setCurrentTheme(recommendedTheme);
        }
    };

    // --- 子系统初始化 ---
    const 通知系统 = 创建通知系统(set右下角提示列表);
    const 推送右下角提示 = 通知系统.推送右下角提示;

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

    const 变量生成进度系统 = 创建变量生成进度系统({
        最近变量生成上下文Ref,
        变量生成中,
        set变量生成中,
        开局变量生成进度,
        set开局变量生成进度,
        世界演变进行中Ref,
        variableGenerationAbortControllerRef,
        深拷贝
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
        performAutoSave: (...args) => performAutoSaveRef.current?.(...args),
        规范化社交列表
    });
    const { 构建记忆总结用户提示词, 清理记忆总结输出, handleStartMemorySummary, handleCancelMemorySummary, handleBackToMemorySummaryRemind, handleUpdateMemorySummaryDraft, handleStartManualMemorySummary, handleApplyMemorySummary, 构建NPC记忆总结任务, 构建NPC记忆总结用户提示词, 清空NPC记忆总结流程, 刷新NPC记忆总结队列, 应用并同步社交列表, 清空记忆总结流程, 刷新记忆总结任务, 应用并同步记忆系统, handleStartNpcMemorySummary, handleCancelNpcMemorySummary, handleBackToNpcMemorySummaryRemind, handleUpdateNpcMemorySummaryDraft, handleQueueManualNpcMemorySummary, handleApplyNpcMemorySummary } = 记忆总结处理器;

    const 后台生图监控 = use后台生图监控({
        推送右下角提示,
        NPC生图任务队列,
        场景生图任务队列
    });

    // 后台设备刷新监控
    const nsfw设置 = (gameConfig as any)?.校园NSFW设置 || { 启用BDSM论坛: true, BDSM内容强度: '轻度' };
    const 设备消息接口 = 获取设备消息接口配置(apiConfig);
    const 设备刷新GameContext: DeviceGameContext = {
        角色: 角色 || null,
        社交: 社交 || [],
        世界: 世界 || null,
        剧情: 剧情 || null,
        历史记录: 历史记录 || [],
        校规系统: 校规系统,
        催眠系统: 催眠系统,
        校园系统: 校园系统,
    };
    use后台设备刷新监控({
        设备刷新任务队列,
        set设备刷新任务队列,
        set校园系统: 设置校园系统,
        eraId: currentEra,
        mode: 派生设备模式(),
        apiConfig: 设备消息接口!,
        apiSettings: apiConfig as any,
        gameContext: 设备刷新GameContext,
        nsfw设置,
        推送右下角提示,
    });

    useEffect(() => {
        刷新NPC记忆总结队列(Array.isArray(社交) ? 社交 : [], { 静默: NPC记忆总结阶段 === 'processing' || NPC记忆总结阶段 === 'review' });
    }, [社交, memoryConfig]);

    // --- Actions ---
    const 应用图片管理设置到状态 = (value: Partial<图片管理设置结构> | null | undefined) => {
        const normalized = 规范化图片管理设置(value || 默认图片管理设置);
        imageManagerConfigRef.current = normalized;
        setImageManagerConfig(normalized);
        void dbService.保存设置(设置键.图片管理设置, normalized);
    };
    const 关闭右下角提示 = (toastId: string) => {
        if (!toastId) return;
        set右下角提示列表(prev => prev.filter(item => item.id !== toastId));
    };

    // Frontend联动：当游戏时间命中节日设定时，自动同步”名称/简介/效果”到环境
    useEffect(() => {
        const md = 提取环境月日(环境);
        const matched = md ? festivals.find(f => f.月 === md.month && f.日 === md.day) : undefined;
        const nextFestival = matched
            ? {
                名称: matched.名称?.trim() || '',
                简介: matched.描述?.trim() || '',
                效果: matched.效果?.trim() || ''
            }
            : null;

        const currentFestival = 环境?.节日 || null;
        const sameFestival = !!(
            (!currentFestival && !nextFestival) ||
            (
                currentFestival &&
                nextFestival &&
                (currentFestival.名称 || '') === (nextFestival.名称 || '') &&
                (currentFestival.简介 || '') === (nextFestival.简介 || '') &&
                (currentFestival.效果 || '') === (nextFestival.效果 || '')
            )
        );

        if (sameFestival) return;
        设置环境(prev => ({
            ...prev,
            节日: nextFestival
        }));
    }, [环境?.时间, 环境?.节日, festivals, 设置环境]);

    useEffect(() => {
        if (游戏初始时间) return;
        const 占位开局时间 = '1:01:01:00:00';
        const 规范化可用起始时间 = (value?: string | null): string | null => {
            const canonical = normalizeCanonicalGameTime((value || '').trim());
            if (!canonical || canonical === 占位开局时间) return null;
            return canonical;
        };

        const currentTime = 规范化可用起始时间(环境时间转标准串(环境));
        if (currentTime) {
            设置游戏初始时间(currentTime);
            return;
        }

        const 回忆档案 = Array.isArray(记忆系统?.回忆档案) ? 记忆系统.回忆档案 : [];
        const 开局回忆 = 回忆档案.find((item) => item?.回合 === 1 || item?.名称 === '【回忆001】') || 回忆档案[0];
        const 回忆开局时间 = 规范化可用起始时间(开局回忆?.记录时间)
            || 规范化可用起始时间(开局回忆?.时间戳);
        if (!回忆开局时间) return;
        设置游戏初始时间(回忆开局时间);
    }, [环境, 游戏初始时间, 记忆系统, 设置游戏初始时间]);

    const 构建标签解析选项 = (config: 游戏设置结构) => ({
        validateTagCompleteness: config?.启用标签检测完整性 === true,
        enableTagRepair: config?.启用标签修复 !== false,
        requireActionOptionsTag: config?.启用行动选项 !== false
    });

    const 追加系统消息 = (content: string, options?: { position?: 'tail' | 'after_last_turn' }) => {
        const text = (content || '').trim();
        if (!text) return;
        const position = options?.position || 'tail';
        const now = Date.now();
        const systemMsg: 聊天记录结构 = {
            role: 'system',
            content: text,
            timestamp: now
        };

        设置历史记录((prev) => {
            const history = Array.isArray(prev) ? [...prev] : [];
            if (position !== 'after_last_turn') {
                return [...history, systemMsg];
            }

            // 插入到“最近一个已完成回合（assistant structuredResponse）”的下方，避免落在玩家输入下方。
            let lastTurnIndex = -1;
            for (let i = history.length - 1; i >= 0; i -= 1) {
                const item = history[i];
                if (item?.role === 'assistant' && item?.structuredResponse) {
                    lastTurnIndex = i;
                    break;
                }
            }
            if (lastTurnIndex < 0) {
                return [...history, systemMsg];
            }

            // 放在该回合之后、下一条 user 消息之前。
            let insertAt = lastTurnIndex + 1;
            while (insertAt < history.length && history[insertAt]?.role !== 'user') {
                insertAt += 1;
            }
            history.splice(insertAt, 0, systemMsg);
            return history;
        });
    };

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

    useEffect(() => {
        void loadBuiltinPromptEntries();
    }, []);

    useEffect(() => {
        void loadWorldbooks();
    }, []);

    useEffect(() => {
        void loadWorldbookPresetGroups();
    }, []);

    const 场景模式已开启 = (): boolean => {
        const feature = apiConfig?.功能模型占位 as any;
        return Boolean(
            feature?.文生图功能启用
            && feature?.场景生图启用
        );
    };

    const 创建场景生图任务 = (params: {
        source: 生图任务来源类型;
        modelName: string;
        画风?: 当前可用接口结构['画风'];
        画师串?: string;
        来源回合?: number;
        摘要?: string;
    }): 场景生图任务记录 => ({
        id: `scene_image_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        目标类型: 'scene',
        来源: params.source,
        状态: 'queued',
        创建时间: Date.now(),
        使用模型: params.modelName,
        构图: '场景',
        画风: params.画风,
        画师串: params.画师串,
        进度阶段: 'queued',
        进度文本: '任务已入队，等待生成场景壁纸。',
        来源回合: params.来源回合,
        摘要: params.摘要,
        已应用为壁纸: false
    });

    const 追加场景生图任务 = (task: 场景生图任务记录) => {
        set场景生图任务队列(prev => [task, ...(Array.isArray(prev) ? prev : [])].slice(0, 100));
    };

    const 更新场景生图任务 = (taskId: string, updater: (task: 场景生图任务记录) => 场景生图任务记录) => {
        set场景生图任务队列(prev => (Array.isArray(prev) ? prev : []).map((task) => (
            task.id === taskId ? updater(task) : task
        )));
    };

    const 删除场景生图任务 = (taskId: string) => {
        if (!taskId) return;
        set场景生图任务队列(prev => (Array.isArray(prev) ? prev : []).filter((task) => task?.id !== taskId));
    };

    const 清空场景生图任务队列 = (mode: 'all' | 'completed' = 'all') => {
        set场景生图任务队列(prev => {
            const baseList = Array.isArray(prev) ? prev : [];
            if (mode === 'all') return [];
            return baseList.filter((task) => task?.状态 === 'queued' || task?.状态 === 'running');
        });
    };

    const 获取NPC唯一标识 = (npc: any, index?: number): string => {
        const id = typeof npc?.id === 'string' ? npc.id.trim() : '';
        if (id) return `id:${id}`;
        const name = typeof npc?.姓名 === 'string' ? npc.姓名.trim() : '';
        if (name) return `name:${name}`;
        return `index:${index ?? -1}`;
    };

    const {
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
        保存NPC图片本地副本
    } = 创建NPC图片状态工作流({
        设置社交,
        规范化社交列表: 规范化社交列表安全,
        执行社交自动存档: (socialSnapshot) => {
            void performAutoSave({ social: socialSnapshot, history: 历史记录, force: true });
        },
        获取社交列表: () => 社交,
        获取NPC唯一标识,
        设置NPC生图任务队列: setNPC生图任务队列,
        加载图片AI服务
    });

    // ==================== BDSM 关系管线操作 ====================

    const 更新BDSM关系状态 = useCallback((npcId: string, updater: (state: any) => any) => {
        设置校园系统(prev => {
            if (!prev?.欲望系统?.NPC欲望档案?.[npcId]?.BDSM关系) return prev;
            const 档案 = prev.欲望系统.NPC欲望档案[npcId];
            return {
                ...prev,
                欲望系统: {
                    ...prev.欲望系统,
                    NPC欲望档案: {
                        ...prev.欲望系统.NPC欲望档案,
                        [npcId]: {
                            ...档案,
                            BDSM关系: updater(档案.BDSM关系),
                        },
                    },
                },
            };
        });
    }, [设置校园系统]);

    const 添加BDSM任务 = useCallback((npcId: string, 任务: Omit<BDSM调教任务, 'id' | '状态' | '发布时间'>) => {
        const 新任务: BDSM调教任务 = {
            ...任务,
            id: `bdsm_task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            状态: '待接受' as const,
            发布时间: new Date().toISOString(),
        };
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            任务历史: [...prev.任务历史, 新任务],
        }));
        return 新任务;
    }, [更新BDSM关系状态]);

    const 更新BDSM任务状态 = useCallback((npcId: string, 任务ID: string, 新状态: BDSM任务状态, 评价?: BDSM评价等级) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            任务历史: prev.任务历史.map(t =>
                t.id === 任务ID
                    ? { ...t, 状态: 新状态, 评价, 完成时间: 新状态 === '已完成' ? new Date().toISOString() : t.完成时间 }
                    : t
            ),
        }));
    }, [更新BDSM关系状态]);

    const 更新契约状态 = useCallback((npcId: string, 新契约: 契约记录) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            契约记录: [...prev.契约记录, 新契约],
        }));
    }, [更新BDSM关系状态]);

    const 添加BDSM里程碑 = useCallback((npcId: string, 类型: string, 描述: string) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            里程碑: [...prev.里程碑, { 类型, 时间: new Date().toISOString(), 描述 }],
        }));
    }, [更新BDSM关系状态]);

    const 设置日常指令 = useCallback((npcId: string, 指令: 日常指令[]) => {
        更新BDSM关系状态(npcId, prev => ({
            ...prev,
            日常指令: 指令,
        }));
    }, [更新BDSM关系状态]);

    const 读取文生图功能配置 = () => {
        const feature = apiConfig?.功能模型占位 as any;
        const 当前后端 = feature?.文生图后端类型 === 'novelai' ? 'novelai' : 'other';
        const 场景横竖屏 = feature?.自动场景生图横竖屏 === '竖屏' ? '竖屏' : '横屏';
        const 场景尺寸 = typeof feature?.自动场景生图分辨率 === 'string' && feature.自动场景生图分辨率.trim()
            ? feature.自动场景生图分辨率.trim()
            : (场景横竖屏 === '竖屏' ? '576x1024' : '1024x576');
        return {
            总开关: Boolean(feature?.文生图功能启用),
            NPC开关: Boolean(feature?.NPC生图启用),
            使用词组转化器: 当前后端 === 'novelai' ? true : feature?.NPC生图使用词组转化器 !== false,
            性别筛选: feature?.NPC生图性别筛选 === '男' || feature?.NPC生图性别筛选 === '女' || feature?.NPC生图性别筛选 === '全部'
                ? feature.NPC生图性别筛选
                : '全部',
            重要性筛选: feature?.NPC生图重要性筛选 === '仅重要' || feature?.NPC生图重要性筛选 === '全部'
                ? feature.NPC生图重要性筛选
                : '全部',
            NPC画风: feature?.自动NPC生图画风 === '二次元' || feature?.自动NPC生图画风 === '写实' || feature?.自动NPC生图画风 === '国风'
                ? feature.自动NPC生图画风
                : '通用',
            场景画风: feature?.自动场景生图画风 === '二次元' || feature?.自动场景生图画风 === '写实' || feature?.自动场景生图画风 === '国风'
                ? feature.自动场景生图画风
                : '通用',
            场景构图要求: feature?.自动场景生图构图要求 === '故事快照' ? '故事快照' : '纯场景',
            场景横竖屏,
            场景尺寸
        } as const;
    };

    const NPC符合自动生图条件 = (npc: any): boolean => {
        const config = 读取文生图功能配置();
        if (!config.总开关 || !config.NPC开关) return false;
        if (config.性别筛选 !== '全部') {
            const gender = typeof npc?.性别 === 'string' ? npc.性别.trim() : '';
            if (gender !== config.性别筛选) return false;
        }
        if (config.重要性筛选 === '仅重要' && npc?.是否主要角色 !== true) {
            return false;
        }
        return true;
    };

    const 提取新增NPC列表 = (beforeList: any[], afterList: any[]): any[] => {
        const beforeIdentitySet = new Set(
            (Array.isArray(beforeList) ? beforeList : []).map((npc) => {
                const id = typeof npc?.id === 'string' ? npc.id.trim() : '';
                const name = typeof npc?.姓名 === 'string' ? npc.姓名.trim() : '';
                return `${id}::${name}`;
            })
        );
        return (Array.isArray(afterList) ? afterList : []).filter((npc, index) => {
            const id = typeof npc?.id === 'string' ? npc.id.trim() : '';
            const name = typeof npc?.姓名 === 'string' ? npc.姓名.trim() : '';
            const identity = `${id}::${name}`;
            if (id || name) {
                return !beforeIdentitySet.has(identity);
            }
            return !Array.isArray(beforeList) || index >= beforeList.length;
        });
    };

    const 读取修炼体系开关 = (): boolean => gameConfig?.启用修炼体系 !== false;

    const 构建文生图额外要求 = (extra?: string): string => {
        const runtimeGameConfig = 规范化游戏设置(gameConfig);
        const runtimeImageExtraPrompt = 构建文生图运行时额外提示词(runtimeGameConfig.额外提示词 || '', runtimeGameConfig);
        return [(extra || '').trim(), runtimeImageExtraPrompt].filter(Boolean).join('\n\n').trim();
    };
    const {
        触发场景自动生图,
        生成场景壁纸
    } = 创建场景生图触发工作流({
        获取环境: () => 环境,
        获取角色: () => 角色,
        获取社交列表: () => 社交,
        获取历史记录: () => 历史记录,
        获取接口配置: () => apiConfig,
        规范化环境信息,
        深拷贝,
        环境时间转标准串,
        构建完整地点文本,
        修炼体系已启用: 读取修炼体系开关,
        提取NPC生图基础数据: (npc) => 提取NPC生图基础数据(npc, {
            cultivationSystemEnabled: 读取修炼体系开关()
        }),
        读取文生图功能配置,
        场景模式已开启,
        构建文生图额外要求,
        加载场景生图工作流,
        获取场景文生图接口配置,
        获取生图词组转化器接口配置,
        获取生图画师串预设,
        获取当前PNG画风预设: (presetId?: string) => 获取当前PNG画风预设摘要(presetId, 'scene'),
        获取场景角色锚点: (...args) => 提取场景角色锚点(...args),
        获取词组转化器预设提示词,
        接口配置是否可用,
        创建场景生图任务,
        生成场景生图记录ID,
        追加场景生图任务,
        更新场景生图任务,
        更新场景图片档案: 写入场景图片档案,
        应用场景图片为壁纸,
        获取当前自动应用任务ID: () => 场景生图自动应用任务Ref.current,
        设置当前自动应用任务ID: (requestId) => {
            场景生图自动应用任务Ref.current = requestId;
        },
        记录后台场景监控: (item) => {
            后台场景生图监控Ref.current.push(item);
        },
        推送右下角提示
    });


    const 执行单个NPC生图 = async (npc: any, options?: { force?: boolean; source?: 生图任务来源类型; 构图?: '头像' | '半身' | '立绘'; 画风?: 当前可用接口结构['画风']; 画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string; 额外要求?: string; 尺寸?: string; 复用提示词?: { 生图词组: string; 最终正向提示词: string; 最终负向提示词: string } }) => {
        const { 执行NPC生图工作流 } = await 加载NPC生图工作流();
        return 执行NPC生图工作流(npc, {
            ...options,
            额外要求: 构建文生图额外要求(options?.额外要求)
        }, {
            apiConfig,
            获取NPC唯一标识,
            获取文生图接口配置,
            获取生图词组转化器接口配置,
            获取生图画师串预设,
            获取当前PNG画风预设: (presetId?: string) => 获取当前PNG画风预设摘要(presetId, 'npc'),
            获取NPC角色锚点: (npcId: string) => {
                const anchor = 按NPC读取角色锚点(npcId);
                // “生成时默认附加”关闭时：NPC 单图（含自动/手动）不应自动注入锚点。
                if (!anchor || anchor.生成时默认附加 !== true) return null;
                return anchor;
            },
            获取词组转化器预设提示词,
            接口配置是否可用,
            读取文生图功能配置,
            NPC符合自动生图条件,
            NPC生图进行中集合: NPC生图进行中Ref.current,
            提取NPC生图基础数据: (targetNpc) => 提取NPC生图基础数据附带私密描述(targetNpc, {
                cultivationSystemEnabled: 读取修炼体系开关()
            }),
            创建NPC生图任务,
            生成NPC生图记录ID,
            追加NPC生图任务,
            更新NPC生图任务,
            更新NPC最近生图结果
        });
    };

    const 执行NPC香闺秘档部位生图 = async (
        npc: any,
        part: 香闺秘档部位类型,
        options?: { 画风?: 当前可用接口结构['画风']; 画师串?: string; 画师串预设ID?: string; PNG画风预设ID?: string; 额外要求?: string; 尺寸?: string }
    ) => {
        const { 执行NPC香闺秘档部位生图工作流 } = await 加载NPC香闺秘档生图工作流();
        return 执行NPC香闺秘档部位生图工作流(npc, part, {
            ...options,
            额外要求: 构建文生图额外要求(options?.额外要求)
        }, {
            apiConfig,
            获取NPC唯一标识,
            获取文生图接口配置,
            获取生图词组转化器接口配置,
            获取生图画师串预设,
            获取当前PNG画风预设: (presetId?: string) => 获取当前PNG画风预设摘要(presetId, 'npc'),
            获取NPC角色锚点: 按NPC读取角色锚点,
            获取词组转化器预设提示词,
            接口配置是否可用,
            读取文生图功能配置,
            NPC私密部位生图进行中集合: NPC香闺秘档生图进行中Ref.current,
            提取NPC香闺秘档部位生图数据: (targetNpc, targetPart) => 提取NPC香闺秘档部位生图数据(targetNpc, targetPart, {
                cultivationSystemEnabled: 读取修炼体系开关()
            }),
            创建NPC生图任务,
            生成NPC生图记录ID,
            追加NPC生图任务,
            更新NPC生图任务,
            写入NPC图片历史记录,
            更新NPC香闺秘档部位结果
        });
    };

    const 触发新增NPC自动生图 = (newNpcList: any[]) => {
        const npcList = Array.isArray(newNpcList) ? newNpcList : [];
        if (npcList.length === 0) return;
        npcList.forEach((npc) => {
            void 执行单个NPC生图(npc).catch(() => undefined);
        });
    };

    const 世界演变功能已开启 = (): boolean => {
        const feature = apiConfig?.功能模型占位 as any;
        return Boolean(
            feature?.世界演变独立模型开关
            && typeof feature?.世界演变使用模型 === 'string'
            && feature.世界演变使用模型.trim().length > 0
        );
    };

    const 文章优化功能已开启 = (): boolean => {
        const feature = apiConfig?.功能模型占位 as any;
        return Boolean(
            feature?.文章优化独立模型开关
            && typeof feature?.文章优化使用模型 === 'string'
            && feature.文章优化使用模型.trim().length > 0
        );
    };

    const 已进入主剧情回合 = (): boolean => {
        return Array.isArray(历史记录)
            && 历史记录.some(item => item?.role === 'user' && typeof item?.content === 'string' && item.content.trim().length > 0);
    };

    const 执行正文润色 = async (
        baseResponse: GameResponse,
        rawText: string,
        options?: { manual?: boolean; playerInput?: string }
    ): Promise<{ response: GameResponse; applied: boolean; error?: string; rawText?: string }> => 执行正文润色工作流(
        baseResponse,
        rawText,
        {
            apiConfig,
            gameConfig,
            prompts,
            环境,
            剧情,
            社交,
            战斗,
            角色,
            文章优化已开启: 文章优化功能已开启(),
            深拷贝
        },
        options
    );

    const 规范化剧情规划状态 = (raw?: any): 剧情规划结构 => 基础规范化剧情规划状态(raw);
    const 规范化女主剧情规划状态 = (raw?: any): 女主剧情规划结构 | undefined => 基础规范化女主剧情规划状态(raw);
    const 规范化同人剧情规划状态 = (raw?: any): 同人剧情规划结构 | undefined => 基础规范化同人剧情规划状态(raw);
    const 规范化同人女主剧情规划状态 = (raw?: any): 同人女主剧情规划结构 | undefined => 基础规范化同人女主剧情规划状态(raw);

    function 规范化社交列表安全(raw?: any[], options?: { 合并同名?: boolean }) {
        const list = Array.isArray(raw) ? raw : [];
        return 规范化社交列表(list, options);
    }

    const 应用开场基态 = (openingBase: ReturnType<typeof 创建开场基础状态>) => {
        设置角色(规范化角色物品容器映射(openingBase.角色));
        设置环境(规范化环境信息(openingBase.环境));
        设置游戏初始时间(openingBase.游戏初始时间 || '');
        设置社交(规范化社交列表(openingBase.社交));
        设置世界(openingBase.世界);
        设置战斗(openingBase.战斗);
        设置玩家门派(openingBase.玩家门派);
        设置任务列表(openingBase.任务列表 || []);
        设置约定列表(openingBase.约定列表 || []);
        设置剧情(规范化剧情状态(openingBase.剧情));
        设置剧情规划(规范化剧情规划状态(openingBase.剧情规划 || 创建空剧情规划()));
        设置女主剧情规划(openingBase.女主剧情规划);
        设置同人剧情规划(openingBase.同人剧情规划);
        设置同人女主剧情规划(openingBase.同人女主剧情规划);
        应用并同步记忆系统(创建空记忆系统(), { 静默总结提示: true });
        设置历史记录([]);
        设置校规系统({ 校规列表: [], 影响日志: [] });
        设置催眠系统({ 催眠记录列表: [], app等级: { 当前等级: 1, 已使用次数: 0, 升级阈值: 5, 解锁能力: [] }, 累计使用次数: 0 });
        清空变量生成上下文缓存();
        setWorldEvents([]);
    };

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
                    BDSM帖子列表: Array.isArray(safe.BDSM帖子列表) ? safe.BDSM帖子列表 : [],
                    私聊会话列表: Array.isArray(safe.私聊会话列表) ? safe.私聊会话列表 : [],
                    课程表: (safe.课程表 && typeof safe.课程表 === 'object') ? safe.课程表 : {},
                    校园卡: (safe.校园卡 && typeof safe.校园卡 === 'object') ? {
                        余额: typeof safe.校园卡.余额 === 'number' ? safe.校园卡.余额 : 0,
                        消费记录: Array.isArray(safe.校园卡.消费记录) ? safe.校园卡.消费记录 : [],
                    } : { 余额: 0, 消费记录: [] },
                    社团活动列表: Array.isArray(safe.社团活动列表) ? safe.社团活动列表 : [],
                    欲望系统: safe.欲望系统 ?? undefined,
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
    });
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

    // --- Core Send Logic ---
    const handleSend = async (
        content: string,
        isStreaming: boolean = true,
        options?: 发送选项
    ): Promise<发送结果> => {
        set开局变量生成进度(null);
        set开局世界演变进度(null);
        set开局规划进度(null);
        if (variableGenerationAbortControllerRef.current) {
            variableGenerationAbortControllerRef.current.abort();
        }
        const promptPool = (Array.isArray(prompts) && prompts.length > 0) ? prompts : await ensurePromptsLoaded();
        return 执行主剧情发送工作流(
            content,
            isStreaming,
            {
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
                时代配置ID: currentEra,
                loading,
                gameConfig,
                apiConfig,
                memoryConfig,
                visualConfig,
                sceneImageArchive: 场景图片档案,
                prompts: promptPool,
                内置提示词列表,
                世界书列表,
                设备状态: {
                    messages: 设备状态.messages.map(m => {
                        const notif = 设备状态.notifications.find(n => n.relatedMessageId === m.id);
                        return { app: m.type, title: m.title, content: m.content, timestamp: m.timestamp, read: notif ? notif.read : true };
                    })
                }
            },
            {
                abortControllerRef,
                setLoading,
                setShowSettings,
                设置剧情,
                设置历史记录,
                应用并同步记忆系统,
                构建系统提示词,
                processResponseCommands,
                performAutoSave,
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
                执行变量生成并合并响应: 执行变量生成并合并响应,
                触发设备消息生成: async ({ finalState, signal }) => {
                    try {
                        const 当前时代 = currentEra;
                        if (!当前时代) return;
                        const mode = 派生设备模式();
                        const 设备消息接口 = 获取设备消息接口配置(apiConfig);
                        if (!设备消息接口?.baseUrl || !设备消息接口?.apiKey) return;
                        const liIntensity = gameConfig?.子纪元里模式强度?.[当前时代];
                        const result = await 触发设备消息生成({
                            eraId: 当前时代,
                            mode,
                            apiConfig: 设备消息接口,
                            apiSettings: apiConfig,
                            context: {
                                角色名: 角色.姓名 || '无名',
                                当前场景: finalState.环境?.具体地点 || finalState.环境?.小地点 || '未知场景',
                                当前位置: `${finalState.环境?.大地点 || ''}${finalState.环境?.中地点 || ''}`,
                                世界状态: '',
                            },
                            liIntensity,
                            signal,
                        });
                        const allMessages = Object.values(result.generatedMessages || {}).flat();
                        return {
                            summary: allMessages.length > 0
                                ? `生成 ${allMessages.length} 条设备消息`
                                : '设备消息生成完成',
                            rawText: result.errors?.join('; ') || '',
                        };
                    } catch (err) {
                        console.warn('[设备消息生成] 失败:', err);
                        throw err;
                    }
                },
                onBDSM状态更新: (bdsmResult) => {
                    // 解析 AI 响应中的 BDSM 状态更新并应用到校园系统
                    const 校园NSFW已启用 = (gameConfig as any)?.校园NSFW设置?.启用校园NSFW深化系统;
                    if (!校园NSFW已启用) return;

                    设置校园系统(prev => {
                        const 欲望系统 = prev?.欲望系统;
                        if (!欲望系统?.NPC欲望档案) return prev;

                        const 更新后档案 = { ...欲望系统.NPC欲望档案 };

                        // 任务更新
                        if (bdsmResult.任务更新 && bdsmResult.任务更新.length > 0) {
                            for (const [npcId, 档案] of Object.entries(更新后档案)) {
                                const 档案Any = 档案 as any;
                                if (!档案Any.BDSM关系) continue;
                                const 任务列表 = 档案Any.BDSM关系.任务历史 || [];
                                const 更新 = bdsmResult.任务更新!.filter(t =>
                                    任务列表.some((t2: any) => t2.id === t.id)
                                );
                                for (const t of 更新) {
                                    const idx = 任务列表.findIndex((x: any) => x.id === t.id);
                                    if (idx >= 0) {
                                        if (t.状态) 任务列表[idx].状态 = t.状态;
                                        if (t.评价) 任务列表[idx].评价 = t.评价;
                                    }
                                }
                            }
                        }

                        // 服从度变化
                        if (bdsmResult.服从度变化) {
                            for (const [npcId, delta] of Object.entries(bdsmResult.服从度变化)) {
                                if (更新后档案[npcId]?.BDSM关系) {
                                    更新后档案[npcId].BDSM关系.服从度 =
                                        Math.max(0, Math.min(100,
                                            (更新后档案[npcId].BDSM关系.服从度 || 50) + delta
                                        ));
                                }
                            }
                        }

                        // 关系阶段推进
                        if (bdsmResult.关系阶段推进) {
                            for (const [npcId, 新阶段] of Object.entries(bdsmResult.关系阶段推进)) {
                                if (更新后档案[npcId]?.BDSM关系) {
                                    更新后档案[npcId].BDSM关系.阶段 = 新阶段 as 关系阶段;
                                }
                            }
                        }

                        // 契约更新
                        if (bdsmResult.契约更新 && bdsmResult.契约更新.length > 0) {
                            for (const [npcId, 档案] of Object.entries(更新后档案)) {
                                const 档案Any = 档案 as any;
                                if (!档案Any.BDSM关系) continue;
                                const 契约列表 = 档案Any.BDSM关系.契约记录 || [];
                                for (const c of bdsmResult.契约更新!) {
                                    const idx = 契约列表.findIndex((x: any) => x.id === c.id);
                                    if (idx >= 0 && c.违约次数 !== undefined) {
                                        契约列表[idx].违约次数 = c.违约次数;
                                    }
                                }
                            }
                        }

                        // 里程碑
                        if (bdsmResult.里程碑 && bdsmResult.里程碑.length > 0) {
                            for (const [npcId, 档案] of Object.entries(更新后档案)) {
                                const 档案Any = 档案 as any;
                                if (!档案Any.BDSM关系) continue;
                                档案Any.BDSM关系.里程碑 = [
                                    ...(档案Any.BDSM关系.里程碑 || []),
                                    ...bdsmResult.里程碑!
                                ];
                            }
                        }

                        // 日常指令
                        if (bdsmResult.日常指令 && bdsmResult.日常指令.length > 0) {
                            // 日常指令关联到当前焦点 NPC（取第一个有 BDSM 关系的）
                            const 焦点NpcId = Object.keys(更新后档案).find(id =>
                                更新后档案[id]?.BDSM关系
                            );
                            if (焦点NpcId) {
                                更新后档案[焦点NpcId].BDSM关系.日常指令 = bdsmResult.日常指令 as BDSM日常指令[];
                            }
                        }

                        return {
                            ...prev,
                            欲望系统: { ...欲望系统, NPC欲望档案: 更新后档案 },
                        };
                    });
                },
                onBDSM见面预约更新: (更新) => {
                    设置校园系统(prev => {
                        const 预约列表 = prev?.见面预约列表 || [];
                        const 更新后列表 = 预约列表.map(预约 =>
                            预约.npcId === 更新.npcId
                                ? { ...预约, 状态: 更新.新状态 as '已协商' | '已见面' | '已取消' }
                                : 预约
                        );
                        return { ...prev, 见面预约列表: 更新后列表 };
                    });
                },
            },
            options
        );
    };

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

    /**
     * 报告任务完成：标记状态 → AI 评价 → 更新服从度 → 检查阶段推进 → 检查 Aftercare
     */
    const handleReportTaskComplete = async (
        taskId: string,
        npcId: string,
        executionDescription: string
    ): Promise<{ evaluation: string; obedienceDelta: number }> => {
        const 校园系统快照 = 校园系统;
        const 欲望系统 = 校园系统快照?.欲望系统;
        if (!欲望系统?.NPC欲望档案?.[npcId]) {
            return { evaluation: '[错误：未找到NPC欲望档案]', obedienceDelta: 0 };
        }

        const 档案 = 欲望系统.NPC欲望档案[npcId];
        const bdsM关系 = 档案.BDSM关系;
        if (!bdsM关系?.任务历史) {
            return { evaluation: '[错误：未找到任务历史]', obedienceDelta: 0 };
        }

        // 1. 标记任务为已完成
        const 任务列表 = bdsM关系.任务历史;
        const 任务 = 任务列表.find((t: any) => t.id === taskId);
        if (!任务) {
            return { evaluation: '[错误：未找到指定任务]', obedienceDelta: 0 };
        }

        任务.状态 = '已完成';
        任务.完成时间 = new Date().toISOString();

        // 2. 调用 AI 评价
        const 主剧情Api = 获取主剧情接口配置(apiConfig);
        if (!主剧情Api || !主剧情Api.apiKey) {
            return { evaluation: '[AI不可用，无法评价]', obedienceDelta: 0 };
        }

        try {
            const { 构建任务完成评价提示词 } = await import('../prompts/runtime/bdsmTasks');
            const { 请求模型文本 } = await import('../services/ai/chatCompletionClient');
            const 评价提示词 = 构建任务完成评价提示词({
                任务类型: 任务.类型,
                任务难度: 任务.难度,
                任务描述: 任务.描述,
                执行情况描述: executionDescription,
                当前服从度: bdsM关系.服从度,
                NPC性格特征: npcId,
            });

            const 评价结果文本 = await 请求模型文本(主剧情Api, [
                { role: 'system', content: '你是 BDSM 关系中的任务评价系统。' },
                { role: 'user', content: 评价提示词 },
            ], { temperature: 0.7 });

            // 3. 解析评价结果
            let 评价: { grade?: string; obedienceChange?: number; feedback?: string; consequence?: string } = {};
            try {
                const jsonMatch = 评价结果文本.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    评价 = JSON.parse(jsonMatch[0]);
                }
            } catch {
                评价 = { grade: '良好', obedienceChange: 5, feedback: 评价结果文本.slice(0, 100) };
            }

            const 服从度变化 = 评价.obedienceChange ?? 0;

            // 3. 应用任务影响
            const { 处理BDSM任务影响 } = await import('./useGame/campusNSFWEngine');
            const 评价等级 = (评价.grade || '良好') as '完美服从' | '优秀' | '良好' | '勉强' | '失败' | '拒绝';
            const 结果 = 处理BDSM任务影响({
                NPC档案: 档案,
                任务评价: 评价等级,
                服从度变化,
            });

            任务.评价 = 评价等级;
            任务.服从度变化 = 服从度变化;

            // 4. 应用状态更新
            设置校园系统(prev => {
                const 欲望系统 = (prev?.欲望系统 || {}) as any;
                const 档案 = { ...(欲望系统.NPC欲望档案?.[npcId] || {}), ...结果.更新后档案 };
                return {
                    ...prev,
                    欲望系统: { ...欲望系统, NPC欲望档案: { ...欲望系统.NPC欲望档案, [npcId]: 档案 } },
                };
            });

            return {
                evaluation: 评价.feedback || 评价结果文本.slice(0, 200),
                obedienceDelta: 服从度变化,
            };
        } catch (err) {
            console.warn('[任务评价] 失败:', err);
            return { evaluation: '[评价失败]', obedienceDelta: 0 };
        }
    };

    /**
     * 自动阶段推进：检查并推进 BDSM 关系阶段
     */
    const handleStageAdvance = async (npcId: string): Promise<{ advanced: boolean; newStage?: string; reason?: string }> => {
        const 校园系统快照 = 校园系统;
        const 欲望系统 = 校园系统快照?.欲望系统;
        if (!欲望系统?.NPC欲望档案?.[npcId]) {
            return { advanced: false };
        }

        const 档案 = 欲望系统.NPC欲望档案[npcId];
        const bdsM关系 = 档案.BDSM关系;
        if (!bdsM关系) return { advanced: false };

        const { 判定BDSM关系阶段推进 } = await import('./useGame/campusNSFWEngine');
        const 结果 = 判定BDSM关系阶段推进(档案);

        if (结果.推进 && 结果.新阶段) {
            const 旧阶段 = bdsM关系.阶段;
            设置校园系统(prev => {
                const 欲望系统 = (prev?.欲望系统 || {}) as any;
                const 原档案 = 欲望系统.NPC欲望档案?.[npcId];
                if (!原档案) return prev;
                const 更新后BDSM = {
                    ...原档案.BDSM关系,
                    阶段: 结果.新阶段 as 关系阶段,
                    里程碑: [
                        ...(原档案.BDSM关系?.里程碑 || []),
                        { 类型: '阶段推进', 时间: new Date().toISOString(), 描述: `关系从 "${旧阶段}" 推进至 "${结果.新阶段}"` },
                    ],
                };
                const 更新后档案 = { ...原档案, BDSM关系: 更新后BDSM };
                return {
                    ...prev,
                    欲望系统: { ...欲望系统, NPC欲望档案: { ...欲望系统.NPC欲望档案, [npcId]: 更新后档案 } },
                };
            });
            return { advanced: true, newStage: 结果.新阶段, reason: 结果.理由 };
        }

        return { advanced: false };
    };

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
    } = 创建图片预设工作流({
        获取接口配置: () => apiConfigRef.current,
        更新接口配置: updateApiConfig,
        加载图片AI服务,
        推送右下角提示,
        保存图片资源: dbService.保存图片资源,
        获取社交列表: () => 社交,
        获取角色: () => 角色,
        isCultivationSystemEnabled: 读取修炼体系开关
    });

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
            reportTaskComplete: handleReportTaskComplete,
            stageAdvance: handleStageAdvance,
            // 旅行系统
            handleTravel,
            handleExplore,
            travelEvents: 旅行事件列表,
            // 交易系统
            handleBuyItem,
            handleSellItem,
            // Mobile Device
            openDevice: 打开设备,
            closeDevice: 设备关闭,
            openDeviceApp: 设备打开应用,
            returnDeviceHome: 设备返回主页,
            setDeviceState: 设置设备状态
        }
    };
};
