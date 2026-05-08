/**
 * 图片生成协调器
 * 从 useGame.ts 提取的图片生成相关函数：场景模式判断、任务 CRUD、NPC 生图触发等
 */
import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 生图任务来源类型 } from '../../../models/imageGeneration';
import type { 场景生图任务记录 } from '../../../types';
import { 规范化接口设置 } from '../../../utils/apiConfig';
import { 规范化游戏设置 } from '../../../utils/gameSettings';
import { 构建文生图运行时额外提示词 } from '../../../prompts/runtime/nsfw';
import { 创建NPC图片状态工作流 } from '../image/npcImageStateWorkflow';
import { 创建场景生图触发工作流 } from '../image/sceneImageTriggerWorkflow';

interface CoordinatorDeps {
    apiConfig: any;
    gameConfig: any;
    环境: any;
    角色: any;
    社交: any[];
    历史记录: any[];
    set场景生图任务队列: (updater: (prev: 场景生图任务记录[]) => 场景生图任务记录[]) => void;
    setNPC生图任务队列: (updater: (prev: any[]) => any[]) => void;
    设置社交: (value: any[] | ((prev: any[]) => any[])) => void;
    规范化社交列表安全: (list: any[]) => any[];
    规范化环境信息: (...args: any[]) => any;
    深拷贝: <T>(value: T) => T;
    环境时间转标准串: (...args: any[]) => string;
    构建完整地点文本: (...args: any[]) => string;
    提取NPC生图基础数据: (npc: any, opts: { cultivationSystemEnabled: boolean }) => any;
    提取NPC生图基础数据附带私密描述: (npc: any, opts: { cultivationSystemEnabled: boolean }) => any;
    提取NPC香闺秘档部位生图数据: (npc: any, part: string, opts: { cultivationSystemEnabled: boolean }) => any;
    按NPC读取角色锚点: (npcId: string) => any;
    提取场景角色锚点: (sceneContext: unknown) => any;
    获取文生图接口配置: (...args: any[]) => any;
    获取生图词组转化器接口配置: (...args: any[]) => any;
    获取生图画师串预设: (...args: any[]) => any;
    获取当前PNG画风预设摘要: (presetId?: string, type?: 'scene' | 'npc') => string;
    获取词组转化器预设提示词: (...args: any[]) => string;
    接口配置是否可用: (...args: any[]) => boolean;
    加载NPC生图工作流: () => Promise<{ 执行NPC生图工作流: (...args: any[]) => Promise<any> }>;
    加载NPC香闺秘档生图工作流: () => Promise<{ 执行NPC香闺秘档部位生图工作流: (...args: any[]) => Promise<any> }>;
    加载场景生图工作流: () => Promise<any>;
    获取场景文生图接口配置: (...args: any[]) => any;
    生成场景生图记录ID: () => string;
    生成NPC生图记录ID: () => string;
    应用场景图片为壁纸: (...args: any[]) => Promise<void>;
    场景生图自动应用任务Ref: React.MutableRefObject<string | null>;
    后台场景生图监控Ref: React.MutableRefObject<any[]>;
    NPC生图进行中Ref: React.MutableRefObject<Set<string>>;
    NPC香闺秘档生图进行中Ref: React.MutableRefObject<Set<string>>;
    推送右下角提示: (...args: any[]) => void;
    写入场景图片档案: (...args: any[]) => void;
    performAutoSave: (params: { social: any[]; history: any[]; force: boolean }) => void;
}

export function 创建图片生成协调器(deps: CoordinatorDeps) {
    const 场景模式已开启 = (): boolean => {
        const feature = 规范化接口设置(deps.apiConfig).功能模型占位;
        return Boolean(feature?.文生图功能启用 && feature?.场景生图启用);
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
        deps.set场景生图任务队列(prev => [task, ...(Array.isArray(prev) ? prev : [])].slice(0, 100));
    };

    const 更新场景生图任务 = (taskId: string, updater: (task: 场景生图任务记录) => 场景生图任务记录) => {
        deps.set场景生图任务队列(prev => (Array.isArray(prev) ? prev : []).map((task) => (
            task.id === taskId ? updater(task) : task
        )));
    };

    const 删除场景生图任务 = (taskId: string) => {
        if (!taskId) return;
        deps.set场景生图任务队列(prev => (Array.isArray(prev) ? prev : []).filter((task) => task?.id !== taskId));
    };

    const 清空场景生图任务队列 = (mode: 'all' | 'completed' = 'all') => {
        deps.set场景生图任务队列(prev => {
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

    const npcImageState = 创建NPC图片状态工作流({
        设置社交: deps.设置社交,
        规范化社交列表: deps.规范化社交列表安全,
        执行社交自动存档: (socialSnapshot: any[]) => {
            void deps.performAutoSave({ social: socialSnapshot, history: deps.历史记录, force: true });
        },
        获取社交列表: () => deps.社交,
        获取NPC唯一标识,
        设置NPC生图任务队列: deps.setNPC生图任务队列,
        加载图片AI服务: deps.加载NPC生图工作流
    });

    const 读取文生图功能配置 = () => {
        const feature = 规范化接口设置(deps.apiConfig).功能模型占位;
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
        if (config.重要性筛选 === '仅重要' && npc?.是否主要角色 !== true) return false;
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
            if (id || name) return !beforeIdentitySet.has(identity);
            return !Array.isArray(beforeList) || index >= beforeList.length;
        });
    };

    const 读取修炼体系开关 = (): boolean => deps.gameConfig?.启用修炼体系 !== false;

    const 构建文生图额外要求 = (extra?: string): string => {
        const runtimeGameConfig = 规范化游戏设置(deps.gameConfig);
        const runtimeImageExtraPrompt = 构建文生图运行时额外提示词(runtimeGameConfig.额外提示词 || '', runtimeGameConfig);
        return [(extra || '').trim(), runtimeImageExtraPrompt].filter(Boolean).join('\n\n').trim();
    };

    const sceneImageTrigger = 创建场景生图触发工作流({
        获取环境: () => deps.环境,
        获取角色: () => deps.角色,
        获取社交列表: () => deps.社交,
        获取历史记录: () => deps.历史记录,
        获取接口配置: () => deps.apiConfig,
        规范化环境信息: deps.规范化环境信息,
        深拷贝: deps.深拷贝,
        环境时间转标准串: deps.环境时间转标准串,
        构建完整地点文本: deps.构建完整地点文本,
        修炼体系已启用: 读取修炼体系开关,
        提取NPC生图基础数据: (npc: any) => deps.提取NPC生图基础数据(npc, {
            cultivationSystemEnabled: 读取修炼体系开关()
        }),
        读取文生图功能配置,
        场景模式已开启,
        构建文生图额外要求,
        加载场景生图工作流: deps.加载场景生图工作流,
        获取场景文生图接口配置: deps.获取场景文生图接口配置,
        获取生图词组转化器接口配置: deps.获取生图词组转化器接口配置,
        获取生图画师串预设: deps.获取生图画师串预设,
        获取当前PNG画风预设: (presetId?: string) => deps.获取当前PNG画风预设摘要(presetId, 'scene'),
        获取场景角色锚点: deps.提取场景角色锚点,
        获取词组转化器预设提示词: deps.获取词组转化器预设提示词,
        接口配置是否可用: deps.接口配置是否可用,
        创建场景生图任务,
        生成场景生图记录ID: deps.生成场景生图记录ID,
        追加场景生图任务,
        更新场景生图任务,
        更新场景图片档案: deps.写入场景图片档案,
        应用场景图片为壁纸: deps.应用场景图片为壁纸,
        获取当前自动应用任务ID: () => deps.场景生图自动应用任务Ref.current,
        设置当前自动应用任务ID: (requestId: string | null) => {
            deps.场景生图自动应用任务Ref.current = requestId;
        },
        记录后台场景监控: (item: any) => {
            deps.后台场景生图监控Ref.current.push(item);
        },
        推送右下角提示: deps.推送右下角提示
    });

    const 执行单个NPC生图 = async (npc: any, options?: {
        force?: boolean;
        source?: 生图任务来源类型;
        构图?: '头像' | '半身' | '立绘';
        画风?: 当前可用接口结构['画风'];
        画师串?: string;
        画师串预设ID?: string;
        PNG画风预设ID?: string;
        额外要求?: string;
        尺寸?: string;
        复用提示词?: { 生图词组: string; 最终正向提示词: string; 最终负向提示词: string };
    }) => {
        const { 执行NPC生图工作流 } = await deps.加载NPC生图工作流();
        return 执行NPC生图工作流(npc, {
            ...options,
            额外要求: 构建文生图额外要求(options?.额外要求)
        }, {
            apiConfig: deps.apiConfig,
            获取NPC唯一标识,
            获取文生图接口配置: deps.获取文生图接口配置,
            获取生图词组转化器接口配置: deps.获取生图词组转化器接口配置,
            获取生图画师串预设: deps.获取生图画师串预设,
            获取当前PNG画风预设: (presetId?: string) => deps.获取当前PNG画风预设摘要(presetId, 'npc'),
            获取NPC角色锚点: (npcId: string) => {
                const anchor = deps.按NPC读取角色锚点(npcId);
                if (!anchor || anchor.生成时默认附加 !== true) return null;
                return anchor;
            },
            获取词组转化器预设提示词: deps.获取词组转化器预设提示词,
            接口配置是否可用: deps.接口配置是否可用,
            读取文生图功能配置,
            NPC符合自动生图条件,
            NPC生图进行中集合: deps.NPC生图进行中Ref.current,
            提取NPC生图基础数据: (targetNpc: any) => deps.提取NPC生图基础数据附带私密描述(targetNpc, {
                cultivationSystemEnabled: 读取修炼体系开关()
            }),
            创建NPC生图任务: npcImageState.创建NPC生图任务,
            生成NPC生图记录ID: deps.生成NPC生图记录ID,
            追加NPC生图任务: npcImageState.追加NPC生图任务,
            更新NPC生图任务: npcImageState.更新NPC生图任务,
            更新NPC最近生图结果: npcImageState.更新NPC最近生图结果
        });
    };

    const 执行NPC香闺秘档部位生图 = async (
        npc: any,
        part: string,
        options?: {
            画风?: 当前可用接口结构['画风'];
            画师串?: string;
            画师串预设ID?: string;
            PNG画风预设ID?: string;
            额外要求?: string;
            尺寸?: string;
        }
    ) => {
        const { 执行NPC香闺秘档部位生图工作流 } = await deps.加载NPC香闺秘档生图工作流();
        return 执行NPC香闺秘档部位生图工作流(npc, part, {
            ...options,
            额外要求: 构建文生图额外要求(options?.额外要求)
        }, {
            apiConfig: deps.apiConfig,
            获取NPC唯一标识,
            获取文生图接口配置: deps.获取文生图接口配置,
            获取生图词组转化器接口配置: deps.获取生图词组转化器接口配置,
            获取生图画师串预设: deps.获取生图画师串预设,
            获取当前PNG画风预设: (presetId?: string) => deps.获取当前PNG画风预设摘要(presetId, 'npc'),
            获取NPC角色锚点: deps.按NPC读取角色锚点,
            获取词组转化器预设提示词: deps.获取词组转化器预设提示词,
            接口配置是否可用: deps.接口配置是否可用,
            读取文生图功能配置,
            NPC私密部位生图进行中集合: deps.NPC香闺秘档生图进行中Ref.current,
            提取NPC香闺秘档部位生图数据: (targetNpc: any, targetPart: string) => deps.提取NPC香闺秘档部位生图数据(targetNpc, targetPart, {
                cultivationSystemEnabled: 读取修炼体系开关()
            }),
            创建NPC生图任务: npcImageState.创建NPC生图任务,
            生成NPC生图记录ID: deps.生成NPC生图记录ID,
            追加NPC生图任务: npcImageState.追加NPC生图任务,
            更新NPC生图任务: npcImageState.更新NPC生图任务,
            写入NPC图片历史记录: npcImageState.写入NPC图片历史记录,
            更新NPC香闺秘档部位结果: npcImageState.更新NPC香闺秘档部位结果
        });
    };

    const 触发新增NPC自动生图 = (newNpcList: any[]) => {
        const npcList = Array.isArray(newNpcList) ? newNpcList : [];
        if (npcList.length === 0) return;
        npcList.forEach((npc) => {
            void 执行单个NPC生图(npc).catch(() => undefined);
        });
    };

    return {
        场景模式已开启,
        创建场景生图任务,
        追加场景生图任务,
        更新场景生图任务,
        删除场景生图任务,
        清空场景生图任务队列,
        获取NPC唯一标识,
        更新NPC最近生图结果: npcImageState.更新NPC最近生图结果,
        写入NPC图片历史记录: npcImageState.写入NPC图片历史记录,
        更新NPC香闺秘档部位结果: npcImageState.更新NPC香闺秘档部位结果,
        获取生图阶段中文: npcImageState.获取生图阶段中文,
        创建NPC生图任务: npcImageState.创建NPC生图任务,
        追加NPC生图任务: npcImageState.追加NPC生图任务,
        更新NPC生图任务: npcImageState.更新NPC生图任务,
        删除NPC生图任务: npcImageState.删除NPC生图任务,
        清空NPC生图任务队列: npcImageState.清空NPC生图任务队列,
        删除NPC图片记录: npcImageState.删除NPC图片记录,
        清空NPC图片历史: npcImageState.清空NPC图片历史,
        选择NPC头像图片: npcImageState.选择NPC头像图片,
        清除NPC头像图片: npcImageState.清除NPC头像图片,
        选择NPC立绘图片: npcImageState.选择NPC立绘图片,
        清除NPC立绘图片: npcImageState.清除NPC立绘图片,
        选择NPC背景图片: npcImageState.选择NPC背景图片,
        清除NPC背景图片: npcImageState.清除NPC背景图片,
        保存NPC图片本地副本: npcImageState.保存NPC图片本地副本,
        读取文生图功能配置,
        NPC符合自动生图条件,
        提取新增NPC列表,
        读取修炼体系开关,
        构建文生图额外要求,
        触发场景自动生图: sceneImageTrigger.触发场景自动生图,
        生成场景壁纸: sceneImageTrigger.生成场景壁纸,
        执行单个NPC生图,
        执行NPC香闺秘档部位生图,
        触发新增NPC自动生图
    };
}
