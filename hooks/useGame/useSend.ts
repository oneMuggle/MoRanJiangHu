/**
 * 主剧情发送逻辑
 * 从 useGame.ts 提取的 handleSend 函数 + 设备消息生成内联回调
 */
import { 执行主剧情发送工作流 } from './sendWorkflow';
import type { 发送选项, 发送结果 } from './sendWorkflow';
import { 触发设备消息生成 } from './device/triggerDeviceMessageWorkflow';
import { 获取设备消息接口配置 } from '../../utils/apiConfig';
import type { DeviceMode } from '../../models/mobileDevice';

interface SendDeps {
    // State snapshot
    历史记录: any[];
    记忆系统: any;
    角色: any;
    环境: any;
    社交: any[];
    世界: any;
    战斗: any;
    玩家门派: any;
    任务列表: any[];
    约定列表: any[];
    剧情: any;
    剧情规划: any;
    女主剧情规划: any;
    同人剧情规划: any;
    同人女主剧情规划: any;
    开局配置: any;
    校规系统: any;
    催眠系统: any;
    校园系统: any;
    currentEra: string | null;
    loading: boolean;
    gameConfig: any;
    apiConfig: any;
    memoryConfig: any;
    visualConfig: any;
    场景图片档案: any;
    prompts: any[];
    内置提示词列表: any[];
    世界书列表: any[];
    设备状态Messages: Array<{ id: string; type: string; title: string; content: string; timestamp: number }>;
    设备状态Notifications: Array<{ relatedMessageId?: string; read: boolean }>;

    // Actions & refs
    abortControllerRef: React.MutableRefObject<AbortController | null>;
    variableGenerationAbortControllerRef: React.MutableRefObject<AbortController | null>;
    setLoading: (value: boolean) => void;
    setShowSettings: (value: boolean) => void;
    设置剧情: (value: any) => void;
    设置历史记录: (value: any[] | ((prev: any[]) => any[])) => void;
    应用并同步记忆系统: (memory: any, options?: { 静默总结提示?: boolean }) => void;
    构建系统提示词: (...args: any[]) => any;
    processResponseCommands: (...args: any[]) => any;
    performAutoSave: (...args: any[]) => void | Promise<void>;
    执行正文润色: (...args: any[]) => Promise<any>;
    执行世界演变更新: (params?: any) => Promise<any>;
    触发新增NPC自动生图: (npcs: any[]) => void;
    触发场景自动生图: (...args: any[]) => void;
    应用常驻壁纸为背景: () => Promise<void> | void;
    提取新增NPC列表: (before: any[], after: any[]) => any[];
    推入重Roll快照: (snapshot: any) => void;
    弹出重Roll快照: () => any;
    回档到快照: (snapshot: any, options?: { 保留图片状态?: boolean }) => void;
    深拷贝: <T>(value: T) => T;
    按回合窗口裁剪历史: (...args: any[]) => any[];
    规范化环境信息: (...args: any[]) => any;
    规范化剧情状态: (...args: any[]) => any;
    规范化剧情规划状态: (...args: any[]) => any;
    规范化女主剧情规划状态: (...args: any[]) => any;
    规范化同人剧情规划状态: (...args: any[]) => any;
    规范化同人女主剧情规划状态: (...args: any[]) => any;
    规范化世界状态: (...args: any[]) => any;
    游戏设置启用自动重试: (config: any) => boolean;
    执行带自动重试的生成请求: <T>(params: {
        enabled: boolean;
        action: () => Promise<T>;
        onRetry?: (attempt: number, maxAttempts: number, reason: string) => void;
    }) => Promise<T>;
    更新流式草稿为自动重试提示: (...args: any[]) => any[];
    提取解析失败原始信息: (...args: any[]) => string;
    提取原始报错详情: (...args: any[]) => string;
    格式化错误详情: (...args: any[]) => string;
    获取原始AI消息: (...args: any[]) => string;
    估算消息Token: (...args: any[]) => number;
    估算AI输出Token: (...args: any[]) => number;
    计算回复耗时秒: (...args: any[]) => number;
    文章优化功能已开启: () => boolean;
    后台执行统一规划分析: (...args: any[]) => Promise<any>;
    执行变量生成并合并响应: (...args: any[]) => Promise<any>;
    派生设备模式: () => DeviceMode;
    onBDSM状态更新: (result: any) => void;
    onBDSM见面预约更新: (update: any) => void;
    set开局变量生成进度: (value: any) => void;
    set开局世界演变进度: (value: any) => void;
    set开局规划进度: (value: any) => void;
    ensurePromptsLoaded: () => Promise<any[]>;
}

export function 创建主剧情发送工作流(deps: SendDeps) {
    const handleSend = async (
        content: string,
        isStreaming: boolean = true,
        options?: 发送选项
    ): Promise<发送结果> => {
        deps.set开局变量生成进度(null);
        deps.set开局世界演变进度(null);
        deps.set开局规划进度(null);
        if (deps.variableGenerationAbortControllerRef.current) {
            deps.variableGenerationAbortControllerRef.current.abort();
        }
        const promptPool = (Array.isArray(deps.prompts) && deps.prompts.length > 0)
            ? deps.prompts
            : await deps.ensurePromptsLoaded();

        return 执行主剧情发送工作流(
            content,
            isStreaming,
            {
                历史记录: deps.历史记录,
                记忆系统: deps.记忆系统,
                角色: deps.角色,
                环境: deps.环境,
                社交: deps.社交,
                世界: deps.世界,
                战斗: deps.战斗,
                玩家门派: deps.玩家门派,
                任务列表: deps.任务列表,
                约定列表: deps.约定列表,
                剧情: deps.剧情,
                剧情规划: deps.剧情规划,
                女主剧情规划: deps.女主剧情规划,
                同人剧情规划: deps.同人剧情规划,
                同人女主剧情规划: deps.同人女主剧情规划,
                开局配置: deps.开局配置,
                校规系统: deps.校规系统,
                催眠系统: deps.催眠系统,
                校园系统: deps.校园系统,
                时代配置ID: deps.currentEra,
                loading: deps.loading,
                gameConfig: deps.gameConfig,
                apiConfig: deps.apiConfig,
                memoryConfig: deps.memoryConfig,
                visualConfig: deps.visualConfig,
                sceneImageArchive: deps.场景图片档案,
                prompts: promptPool,
                内置提示词列表: deps.内置提示词列表,
                世界书列表: deps.世界书列表,
                设备状态: {
                    messages: deps.设备状态Messages.map(m => {
                        const notif = deps.设备状态Notifications.find(n => n.relatedMessageId === m.id);
                        return { app: m.type, title: m.title, content: m.content, timestamp: m.timestamp, read: notif ? notif.read : true };
                    })
                }
            },
            {
                abortControllerRef: deps.abortControllerRef,
                setLoading: deps.setLoading,
                setShowSettings: deps.setShowSettings,
                设置剧情: deps.设置剧情,
                设置历史记录: deps.设置历史记录,
                应用并同步记忆系统: deps.应用并同步记忆系统,
                构建系统提示词: deps.构建系统提示词,
                processResponseCommands: deps.processResponseCommands,
                performAutoSave: (...args) => Promise.resolve(deps.performAutoSave(...args)),
                执行正文润色: deps.执行正文润色,
                执行世界演变更新: deps.执行世界演变更新,
                触发新增NPC自动生图: deps.触发新增NPC自动生图,
                触发场景自动生图: deps.触发场景自动生图,
                应用常驻壁纸为背景: deps.应用常驻壁纸为背景,
                提取新增NPC列表: deps.提取新增NPC列表,
                推入重Roll快照: deps.推入重Roll快照,
                弹出重Roll快照: () => deps.弹出重Roll快照() || undefined,
                回档到快照: deps.回档到快照,
                深拷贝: deps.深拷贝,
                按回合窗口裁剪历史: deps.按回合窗口裁剪历史,
                规范化环境信息: deps.规范化环境信息,
                规范化剧情状态: deps.规范化剧情状态,
                规范化剧情规划状态: deps.规范化剧情规划状态,
                规范化女主剧情规划状态: deps.规范化女主剧情规划状态,
                规范化同人剧情规划状态: deps.规范化同人剧情规划状态,
                规范化同人女主剧情规划状态: deps.规范化同人女主剧情规划状态,
                规范化世界状态: deps.规范化世界状态,
                游戏设置启用自动重试: deps.游戏设置启用自动重试,
                执行带自动重试的生成请求: deps.执行带自动重试的生成请求,
                更新流式草稿为自动重试提示: deps.更新流式草稿为自动重试提示,
                提取解析失败原始信息: deps.提取解析失败原始信息,
                提取原始报错详情: deps.提取原始报错详情,
                格式化错误详情: deps.格式化错误详情,
                获取原始AI消息: deps.获取原始AI消息,
                估算消息Token: deps.估算消息Token,
                估算AI输出Token: deps.估算AI输出Token,
                计算回复耗时秒: deps.计算回复耗时秒,
                文章优化功能已开启: deps.文章优化功能已开启,
                后台执行统一规划分析: deps.后台执行统一规划分析,
                执行变量生成并合并响应: deps.执行变量生成并合并响应,
                触发设备消息生成: async ({ finalState, signal }) => {
                    try {
                        const 当前时代 = deps.currentEra;
                        if (!当前时代) return;
                        const mode = deps.派生设备模式();
                        const 设备消息接口 = 获取设备消息接口配置(deps.apiConfig);
                        if (!设备消息接口?.baseUrl || !设备消息接口?.apiKey) return;
                        const liIntensity = deps.gameConfig?.子纪元里模式强度?.[当前时代];
                        const result = await 触发设备消息生成({
                            eraId: 当前时代,
                            mode,
                            apiConfig: 设备消息接口,
                            apiSettings: deps.apiConfig,
                            context: {
                                角色名: deps.角色.姓名 || '无名',
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
                onBDSM状态更新: deps.onBDSM状态更新,
                onBDSM见面预约更新: deps.onBDSM见面预约更新,
            },
            options
        );
    };

    return { handleSend };
}
