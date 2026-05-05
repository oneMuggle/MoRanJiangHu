/**
 * 批量生图工作流调度器
 * 
 * 统一调度 NPC 生图和场景生图任务队列，实现：
 * - 可配置的最大并发数控制，避免 API 限流
 * - 失败任务自动重试（指数退避）
 * - 任务优先级排序（manual > retry > auto）
 * - 暂停/恢复功能
 */

import type { NPC生图任务记录, 场景生图任务记录, 生图任务来源类型 } from '../../types';

// ==================== 类型定义 ====================

export type 任务优先级 = 'high' | 'normal' | 'low';

export interface 批量生图配置 {
    最大NPC并发数: number;      // 默认: 2
    最大场景并发数: number;     // 默认: 1
    重试次数: number;           // 默认: 3
    基础重试延迟ms: number;    // 默认: 1000
    最大重试延迟ms: number;     // 默认: 60000
    启用自动重试: boolean;      // 默认: true
}

export interface Toast {
    title: string;
    message: string;
    tone?: 'info' | 'success' | 'error';
}

type NPC生图执行器 = (
    npc: any,
    options: {
        force?: boolean;
        source?: 生图任务来源类型;
        构图?: '头像' | '半身' | '立绘';
        画风?: string;
        画师串?: string;
        画师串预设ID?: string;
        PNG画风预设ID?: string;
        额外要求?: string;
        尺寸?: string;
        复用提示词?: { 生图词组: string; 最终正向提示词: string; 最终负向提示词: string };
    },
    deps: any
) => Promise<void>;

type 场景生图执行器 = (
    params: {
        bodyText: string;
        sceneContext: unknown;
        source?: 生图任务来源类型;
        来源回合?: number;
        摘要?: string;
        autoApply?: boolean;
        请求标识?: string;
        画风?: string;
        画师串预设ID?: string;
        PNG画风预设ID?: string;
        强制执行?: boolean;
        额外要求?: string;
        尺寸?: string;
        构图要求?: '纯场景' | '故事快照';
    },
    deps: any
) => Promise<void>;

export type BatchDeps = {
    // 状态访问
    获取NPC生图任务队列: () => NPC生图任务记录[];
    获取场景生图任务队列: () => 场景生图任务记录[];
    
    // 状态更新
    设置NPC生图任务队列: (updater: (prev: NPC生图任务记录[]) => NPC生图任务记录[]) => void;
    设置场景生图任务队列: (updater: (prev: 场景生图任务记录[]) => 场景生图任务记录[]) => void;
    
    // NPC 数据访问
    获取社交列表: () => any[];
    获取NPC唯一标识: (npc: any, index?: number) => string;
    
    // 通知
    推送右下角提示: (toast: Toast) => void;
    
    // 配置
    获取批量生图配置: () => 批量生图配置;
    
    // API 配置（传递给具体执行器）
    apiConfig: any;
    
    // 执行器工厂（延迟加载以避免循环依赖）
    获取NPC执行器: () => Promise<NPC生图执行器>;
    获取场景执行器: () => Promise<场景生图执行器>;
};

// ==================== 优先级计算 ====================

const 计算任务优先级 = (task: NPC生图任务记录 | 场景生图任务记录): 任务优先级 => {
    const 来源 = task.来源;
    if (来源 === 'manual') return 'high';
    if (来源 === 'retry') return 'normal';
    return 'low'; // 'auto'
};

const 优先级排序 = (a: NPC生图任务记录 | 场景生图任务记录, b: NPC生图任务记录 | 场景生图任务记录): number => {
    const 优先级Map: Record<任务优先级, number> = { high: 0, normal: 1, low: 2 };
    const 优先级A = 优先级Map[计算任务优先级(a)];
    const 优先级B = 优先级Map[计算任务优先级(b)];
    if (优先级A !== 优先级B) return 优先级A - 优先级B;
    // 同优先级按创建时间正序
    return (a.创建时间 || 0) - (b.创建时间 || 0);
};

// ==================== 指数退避 ====================

const 计算重试延迟 = (attempt: number, baseDelay: number, maxDelay: number): number => {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * (baseDelay / 2);
    const delay = Math.min(exponentialDelay + jitter, maxDelay);
    return Math.floor(delay);
};

// ==================== 调度器实现 ====================

export const 创建批量生图调度器 = (deps: BatchDeps) => {
    // 内部状态
    const 处理中NPC任务 = new Map<string, Promise<void>>();
    const 处理中场景任务 = new Map<string, Promise<void>>();
    let 已暂停 = false;
    let 已销毁 = false;
    
    // 任务重试计数
    const 任务重试计数 = new Map<string, number>();
    
    // ==================== NPC 任务处理 ====================
    
    const 获取可执行的NPC任务 = (): NPC生图任务记录 | null => {
        if (处理中NPC任务.size >= deps.获取批量生图配置().最大NPC并发数) {
            return null; // 达到并发上限
        }
        
        const 队列 = deps.获取NPC生图任务队列();
        const 可执行任务 = 队列
            .filter((task) => task.状态 === 'queued')
            .sort(优先级排序);
        
        return 可执行任务[0] || null;
    };
    
    const 执行NPC任务 = async (task: NPC生图任务记录): Promise<void> => {
        const 任务ID = task.id;
        const npcKey = task.NPC标识;
        const config = deps.获取批量生图配置();
        
        // 找到对应的 NPC 数据
        const 社交列表 = deps.获取社交列表();
        const npc = 社交列表.find((n: any) => {
            const id = deps.获取NPC唯一标识(n);
            return id === npcKey || id === `id:${npcKey}`;
        });
        
        if (!npc) {
            // NPC 不存在，标记任务失败
            deps.设置NPC生图任务队列((prev) =>
                prev.map((t) => t.id === 任务ID ? { ...t, 状态: 'failed' as const, 错误信息: 'NPC 不存在' } : t)
            );
            处理中NPC任务.delete(任务ID);
            return;
        }
        
        // 更新任务状态
        deps.设置NPC生图任务队列((prev) =>
            prev.map((t) => t.id === 任务ID ? { ...t, 状态: 'running' as const } : t)
        );
        
        try {
            const 执行器 = await deps.获取NPC执行器();
            await 执行器(npc, {
                force: true,
                source: task.来源,
                构图: task.构图 as '头像' | '半身' | '立绘',
                画风: task.画风,
                画师串: task.画师串,
                额外要求: task.额外要求,
                尺寸: task.尺寸,
            }, deps);
        } catch (error: any) {
            const errorMessage = error?.message || 'NPC 生图失败';
            console.error(`NPC 生图失败: ${task.NPC姓名}`, error);
            
            // 检查是否需要重试
            const 当前重试次数 = 任务重试计数.get(任务ID) || 0;
            if (config.启用自动重试 && 当前重试次数 < config.重试次数) {
                任务重试计数.set(任务ID, 当前重试次数 + 1);
                const 延迟 = 计算重试延迟(当前重试次数 + 1, config.基础重试延迟ms, config.最大重试延迟ms);
                
                // 重置为 queued 状态并等待后重试
                deps.设置NPC生图任务队列((prev) =>
                    prev.map((t) => t.id === 任务ID ? {
                        ...t,
                        状态: 'queued' as const,
                        进度文本: `第 ${当前重试次数 + 1} 次重试中，${延迟 / 1000}秒 后开始...`
                    } : t)
                );
                
                setTimeout(() => {
                    if (!已销毁 && !已暂停) {
                        调度NPC任务();
                    }
                }, 延迟);
                return; // 不在这里清理，以便重试时能找到任务
            }
            
            // 达到最大重试次数或禁用重试，标记失败
            deps.设置NPC生图任务队列((prev) =>
                prev.map((t) => t.id === 任务ID ? {
                    ...t,
                    状态: 'failed' as const,
                    错误信息: errorMessage,
                    进度阶段: 'failed' as const,
                    进度文本: `生图失败：${errorMessage}`
                } : t)
            );
            
            deps.推送右下角提示({
                title: 'NPC 生图失败',
                message: `${task.NPC姓名}的${task.构图 || '图片'}生成失败：${errorMessage}`,
                tone: 'error'
            });
        } finally {
            处理中NPC任务.delete(任务ID);
            任务重试计数.delete(任务ID);
        }
    };
    
    const 调度NPC任务 = (): void => {
        if (已暂停 || 已销毁) return;
        
        const 任务 = 获取可执行的NPC任务();
        if (!任务) return;
        
        const promise = 执行NPC任务(任务).catch((error) => {
            console.error('NPC 任务执行异常:', error);
        });
        
        处理中NPC任务.set(任务.id, promise);
    };
    
    // ==================== 场景任务处理 ====================
    
    const 获取可执行的场景任务 = (): 场景生图任务记录 | null => {
        if (处理中场景任务.size >= deps.获取批量生图配置().最大场景并发数) {
            return null;
        }
        
        const 队列 = deps.获取场景生图任务队列();
        const 可执行任务 = 队列
            .filter((task) => task.状态 === 'queued')
            .sort(优先级排序);
        
        return 可执行任务[0] || null;
    };
    
    const 执行场景任务 = async (task: 场景生图任务记录): Promise<void> => {
        const 任务ID = task.id;
        const config = deps.获取批量生图配置();
        
        // 更新任务状态
        deps.设置场景生图任务队列((prev) =>
            prev.map((t) => t.id === 任务ID ? { ...t, 状态: 'running' as const } : t)
        );
        
        try {
            const 执行器 = await deps.获取场景执行器();
            await 执行器({
                bodyText: task.原始描述 || '',
                sceneContext: {},
                source: task.来源,
                来源回合: task.来源回合,
                摘要: task.摘要,
                画风: task.画风,
                画师串预设ID: undefined,
                PNG画风预设ID: undefined,
                额外要求: task.额外要求,
                尺寸: task.尺寸,
                构图要求: task.场景类型 === '场景快照' ? '故事快照' : '纯场景',
                强制执行: true,
            }, deps);
        } catch (error: any) {
            const errorMessage = error?.message || '场景生图失败';
            console.error(`场景生图失败: ${task.摘要 || '未知场景'}`, error);
            
            const 当前重试次数 = 任务重试计数.get(任务ID) || 0;
            if (config.启用自动重试 && 当前重试次数 < config.重试次数) {
                任务重试计数.set(任务ID, 当前重试次数 + 1);
                const 延迟 = 计算重试延迟(当前重试次数 + 1, config.基础重试延迟ms, config.最大重试延迟ms);
                
                deps.设置场景生图任务队列((prev) =>
                    prev.map((t) => t.id === 任务ID ? {
                        ...t,
                        状态: 'queued' as const,
                        进度文本: `第 ${当前重试次数 + 1} 次重试中，${延迟 / 1000}秒 后开始...`
                    } : t)
                );
                
                setTimeout(() => {
                    if (!已销毁 && !已暂停) {
                        调度场景任务();
                    }
                }, 延迟);
                return;
            }
            
            deps.设置场景生图任务队列((prev) =>
                prev.map((t) => t.id === 任务ID ? {
                    ...t,
                    状态: 'failed' as const,
                    错误信息: errorMessage,
                    进度阶段: 'failed' as const,
                    进度文本: `生图失败：${errorMessage}`
                } : t)
            );
            
            deps.推送右下角提示({
                title: '场景生图失败',
                message: `${task.摘要 || '当前场景'}生成失败：${errorMessage}`,
                tone: 'error'
            });
        } finally {
            处理中场景任务.delete(任务ID);
            任务重试计数.delete(任务ID);
        }
    };
    
    const 调度场景任务 = (): void => {
        if (已暂停 || 已销毁) return;
        
        const 任务 = 获取可执行的场景任务();
        if (!任务) return;
        
        const promise = 执行场景任务(任务).catch((error) => {
            console.error('场景任务执行异常:', error);
        });
        
        处理中场景任务.set(任务.id, promise);
    };
    
    // ==================== 主调度循环 ====================
    
    let 调度定时器: ReturnType<typeof setTimeout> | null = null;
    
    const 调度循环 = (): void => {
        if (已销毁 || 已暂停) return;
        
        // 调度所有可执行的任务
        let npc任务调度了 = true;
        let scene任务调度了 = true;
        
        // 持续调度直到达到并发上限
        while (npc任务调度了 || scene任务调度了) {
            npc任务调度了 = false;
            scene任务调度了 = false;
            
            if (获取可执行的NPC任务()) {
                调度NPC任务();
                npc任务调度了 = true;
            }
            
            if (获取可执行的场景任务()) {
                调度场景任务();
                scene任务调度了 = true;
            }
        }
        
        // 检查是否还有未完成的任务
        const npc队列 = deps.获取NPC生图任务队列();
        const 场景队列 = deps.获取场景生图任务队列();
        const 有未完成任务 = npc队列.some((t) => t.状态 === 'queued') || 
                             场景队列.some((t) => t.状态 === 'queued');
        
        if (有未完成任务) {
            // 100ms 后再次检查
            调度定时器 = setTimeout(调度循环, 100);
        }
    };
    
    // ==================== 公共接口 ====================
    
    const 启动调度 = (): void => {
        if (已销毁) {
            console.warn('调度器已销毁，无法启动');
            return;
        }
        已暂停 = false;
        调度循环();
    };
    
    const 暂停调度 = (): void => {
        已暂停 = true;
        if (调度定时器) {
            clearTimeout(调度定时器);
            调度定时器 = null;
        }
    };
    
    const 恢复调度 = (): void => {
        if (已销毁) return;
        暂停调度();
        启动调度();
    };
    
    const 取消所有任务 = (): void => {
        // 等待当前执行的任务完成（但不启动新任务）
        暂停调度();
        
        // 将所有 queued 状态的任务标记为取消
        deps.设置NPC生图任务队列((prev) =>
            prev.map((t) => t.状态 === 'queued' ? {
                ...t,
                状态: 'failed' as const,
                错误信息: '任务已取消',
                进度阶段: 'failed' as const,
                进度文本: '任务已取消'
            } : t)
        );
        
        deps.设置场景生图任务队列((prev) =>
            prev.map((t) => t.状态 === 'queued' ? {
                ...t,
                状态: 'failed' as const,
                错误信息: '任务已取消',
                进度阶段: 'failed' as const,
                进度文本: '任务已取消'
            } : t)
        );
        
        // 清理进行中任务
        处理中NPC任务.clear();
        处理中场景任务.clear();
        任务重试计数.clear();
    };
    
    const 销毁调度器 = (): void => {
        已销毁 = true;
        暂停调度();
        取消所有任务();
    };
    
    const 获取调度状态 = (): {
        已暂停: boolean;
        已销毁: boolean;
        NPC进行中数: number;
        场景进行中数: number;
        NPC队列长度: number;
        场景队列长度: number;
    } => ({
        已暂停,
        已销毁,
        NPC进行中数: 处理中NPC任务.size,
        场景进行中数: 处理中场景任务.size,
        NPC队列长度: deps.获取NPC生图任务队列().length,
        场景队列长度: deps.获取场景生图任务队列().length,
    });
    
    return {
        启动调度,
        暂停调度,
        恢复调度,
        取消所有任务,
        销毁调度器,
        获取调度状态,
    };
};

// ==================== 默认配置 ====================

export const 默认批量生图配置: 批量生图配置 = {
    最大NPC并发数: 2,
    最大场景并发数: 1,
    重试次数: 3,
    基础重试延迟ms: 1000,
    最大重试延迟ms: 60000,
    启用自动重试: true,
};
