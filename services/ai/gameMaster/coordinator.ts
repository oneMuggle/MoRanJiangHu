/**
 * @module gameMaster/coordinator
 * 多智能体游戏大师系统 - 协调器
 * 
 * 协调各AI智能体（主剧情、世界演变、变量校准、规划更新、记忆召回、正文润色）
 * 的执行顺序和并行化，最大化多线程效率。
 */

import type {
    游戏大师智能体类型,
    游戏大师协调结果,
    游戏大师触发参数,
    游戏大师依赖接口,
    智能体执行结果,
    智能体执行配置,
} from './types';
import type { GameResponse } from '../../../types';
import * as textAIService from '../text';

// ==================== 常量 ====================

/**
 * 智能体执行超时（毫秒）
 */
const 智能体超时 = 120000; // 2分钟

/**
 * 默认优先级（数字越小优先级越高）
 */
const 默认优先级: Record<游戏大师智能体类型, number> = {
    story: 1,        // 主剧情最先
    world: 2,        // 世界演变其次
    variable: 3,     // 变量校准
    planning: 4,    // 规划更新
    memory: 5,      // 记忆召回
    polish: 6,      // 正文润色最后
};

// ==================== 辅助函数 ====================

/**
 * 提取动态世界线索
 */
const 提取动态世界线索 = (response?: GameResponse): string[] => {
    if (!response) return [];
    const hints: string[] = [];
    
    // 从 dynamic_world 标签提取
    if (Array.isArray(response.dynamic_world)) {
        hints.push(...response.dynamic_world);
    }
    
    // 从 t_plan 提取关键词
    if (response.t_plan) {
        const planText = response.t_plan;
        // 提取可能的世界变化暗示
        const worldKeywords = ['势力', '门派', '江湖', '发生', '变化', '事件', '传闻', '动态'];
        for (const keyword of worldKeywords) {
            if (planText.includes(keyword)) {
                const sentences = planText.split(/[。！？]/);
                for (const sentence of sentences) {
                    if (sentence.includes(keyword) && sentence.trim().length > 10) {
                        hints.push(sentence.trim());
                    }
                }
            }
        }
    }
    
    return Array.from(new Set(hints)).slice(0, 10);
};

/**
 * 创建空结果
 */
const 创建空结果 = (type: 游戏大师智能体类型): 智能体执行结果 => ({
    类型: type,
    状态: 'skipped',
    优先级: 默认优先级[type],
});

/**
 * 格式化耗时
 */
const 格式化耗时 = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
};

// ==================== 游戏大师协调器 ====================

export class 游戏大师协调器 {
    private deps: 游戏大师依赖接口;
    private params: 游戏大师触发参数;
    private results: Map<游戏大师智能体类型, 智能体执行结果> = new Map();
    private startTime: number = 0;

    constructor(deps: 游戏大师依赖接口, params: 游戏大师触发参数) {
        this.deps = deps;
        this.params = {
            启用世界演变: true,
            启用变量校准: true,
            启用记忆召回: false,
            启用正文润色: false,
            启用规划更新: true,
            ...params,
        };
    }

    /**
     * 执行完整的游戏大师流程
     */
    async execute(): Promise<游戏大师协调结果> {
        this.startTime = Date.now();
        const rawTexts: Record<游戏大师智能体类型, string> = {
            story: '', world: '', variable: '', planning: '', memory: '', polish: ''
        };
        const agentResults: 智能体执行结果[] = [];

        try {
            // Phase 1: 主剧情生成（核心，必需）
            const storyResult = await this.executeStoryAgent();
            rawTexts.story = storyResult.原始文本 || '';
            agentResults.push(storyResult);

            // 如果主剧情失败，整体失败
            if (storyResult.状态 === 'failed') {
                return this.buildResult(false, 'error', agentResults, [], rawTexts as Record<游戏大师智能体类型, string>, `主剧情生成失败: ${storyResult.错误信息}`);
            }

            // Phase 2: 并行执行辅助智能体
            const parallelResults = await this.executeParallelAgents(rawTexts);
            agentResults.push(...parallelResults);

            // Phase 3: 合并结果
            const { commands, dynamicWorldHints, variableReport, shortTermMemory } = 
                this.mergeResults(agentResults);

            const totalTime = Date.now() - this.startTime;
            const statusText = this.generateStatusText(agentResults, totalTime);

            return {
                success: true,
                phase: 'finalize',
                agentResults,
                commands,
                dynamicWorldHints,
                variableCalibrationReport: variableReport,
                shortTermMemory,
                statusText,
                rawTexts,
            };

        } catch (error: any) {
            const totalTime = Date.now() - this.startTime;
            return {
                success: false,
                phase: 'error',
                agentResults,
                commands: [],
                dynamicWorldHints: [],
                statusText: `游戏大师执行失败: ${error?.message || '未知错误'} (${格式化耗时(totalTime)})`,
                rawTexts,
            };
        }
    }

    /**
     * 执行主剧情智能体
     */
    private async executeStoryAgent(): Promise<智能体执行结果> {
        const startTime = Date.now();
        
        try {
            // 状态：标记为运行中
            this.deps.set规划更新中?.(true);
            
            // 主剧情生成已在外部完成，这里仅做记录
            // 实际的主剧情生成在 mainStoryRequest.ts 中
            const storyResponse = this.params.当前响应;
            
            return {
                类型: 'story',
                状态: storyResponse ? 'completed' : 'skipped',
                耗时毫秒: Date.now() - startTime,
                原始文本: '',
                解析结果: storyResponse,
                优先级: 默认优先级.story,
            };
        } catch (error: any) {
            return {
                类型: 'story',
                状态: 'failed',
                耗时毫秒: Date.now() - startTime,
                错误信息: error?.message || '主剧情生成失败',
                优先级: 默认优先级.story,
            };
        } finally {
            this.deps.set规划更新中?.(false);
        }
    }

    /**
     * 并行执行辅助智能体
     */
    private async executeParallelAgents(
        rawTexts: Record<游戏大师智能体类型, string>
    ): Promise<智能体执行结果[]> {
        const results: 智能体执行结果[] = [];
        
        // 世界演变和变量校准可以并行
        const parallelPromises: Promise<智能体执行结果>[] = [];
        
        if (this.params.启用世界演变) {
            parallelPromises.push(this.executeWorldEvolutionAgent(rawTexts));
        }
        
        if (this.params.启用变量校准) {
            parallelPromises.push(this.executeVariableCalibrationAgent(rawTexts));
        }
        
        if (this.params.启用规划更新) {
            parallelPromises.push(this.executePlanningAgent(rawTexts));
        }

        // 并行执行
        const parallelResults = await Promise.allSettled(parallelPromises);
        
        for (const result of parallelResults) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    类型: 'world',
                    状态: 'failed',
                    错误信息: result.reason?.message || '并行执行失败',
                    优先级: 99,
                });
            }
        }

        // 记忆召回和正文润色串行执行（依赖主剧情结果）
        if (this.params.启用记忆召回) {
            const memoryResult = await this.executeMemoryRecallAgent(rawTexts);
            results.push(memoryResult);
        }
        
        if (this.params.启用正文润色) {
            const polishResult = await this.executePolishAgent(rawTexts);
            results.push(polishResult);
        }

        return results;
    }

    /**
     * 执行世界演变智能体
     */
    private async executeWorldEvolutionAgent(
        rawTexts: Record<游戏大师智能体类型, string>
    ): Promise<智能体执行结果> {
        const startTime = Date.now();
        
        try {
            // 检查是否正在执行中
            if (this.deps.世界演变进行中Ref?.current) {
                return {
                    类型: 'world',
                    状态: 'skipped',
                    耗时毫秒: Date.now() - startTime,
                    错误信息: '世界演变正在执行中',
                    优先级: 默认优先级.world,
                };
            }

            this.deps.世界演变进行中Ref && (this.deps.世界演变进行中Ref.current = true);
            this.deps.set世界演变更新中?.(true);
            this.deps.set世界演变状态文本?.('世界演变更新中...');

            // 提取动态世界线索
            const dynamicHints = 提取动态世界线索(this.params.当前响应);
            const currentTurnBody = this.params.当前响应?.logs
                ?.map((log: any) => `${log.sender || '旁白'}：${log.text || ''}`)
                .join('\n') || '';

            // 调用世界演变工作流
            const { 执行世界演变更新工作流 } = await import('../../../hooks/useGame/worldEvolutionWorkflow');
            
            // 注意：这里需要完整的依赖，实际使用时从 useGame 获取
            // 简化版本，实际应该传递完整依赖
            const evolutionResult = {
                ok: false,
                phase: 'skipped' as const,
                commands: [] as any[],
                updates: [] as string[],
                rawText: '',
                statusText: '世界演变跳过（未提供完整依赖）',
            };

            rawTexts.world = evolutionResult.rawText;

            return {
                类型: 'world',
                状态: evolutionResult.ok ? 'completed' : 'skipped',
                耗时毫秒: Date.now() - startTime,
                原始文本: evolutionResult.rawText,
                解析结果: evolutionResult,
                优先级: 默认优先级.world,
            };
        } catch (error: any) {
            return {
                类型: 'world',
                状态: 'failed',
                耗时毫秒: Date.now() - startTime,
                错误信息: error?.message || '世界演变失败',
                优先级: 默认优先级.world,
            };
        } finally {
            this.deps.世界演变进行中Ref && (this.deps.世界演变进行中Ref.current = false);
            this.deps.set世界演变更新中?.(false);
        }
    }

    /**
     * 执行变量校准智能体
     */
    private async executeVariableCalibrationAgent(
        rawTexts: Record<游戏大师智能体类型, string>
    ): Promise<智能体执行结果> {
        const startTime = Date.now();
        
        try {
            this.deps.set变量校准更新中?.(true);
            this.deps.set变量校准状态文本?.('变量校准中...');

            // 变量校准逻辑
            // 实际实现需要完整的上下文
            const calibrationResult = {
                commands: [] as any[],
                reports: [] as string[],
                rawText: '',
            };

            rawTexts.variable = calibrationResult.rawText;

            return {
                类型: 'variable',
                状态: 'skipped', // 因缺少完整依赖而跳过
                耗时毫秒: Date.now() - startTime,
                原始文本: calibrationResult.rawText,
                解析结果: calibrationResult,
                优先级: 默认优先级.variable,
            };
        } catch (error: any) {
            return {
                类型: 'variable',
                状态: 'failed',
                耗时毫秒: Date.now() - startTime,
                错误信息: error?.message || '变量校准失败',
                优先级: 默认优先级.variable,
            };
        } finally {
            this.deps.set变量校准更新中?.(false);
        }
    }

    /**
     * 执行规划更新智能体
     */
    private async executePlanningAgent(
        rawTexts: Record<游戏大师智能体类型, string>
    ): Promise<智能体执行结果> {
        const startTime = Date.now();
        
        try {
            this.deps.set规划更新中?.(true);
            this.deps.set规划状态文本?.('规划更新中...');

            // 规划更新逻辑
            const planningResult = {
                updated: false,
                message: '规划更新跳过（未提供完整依赖）',
                commands: [] as any[],
            };

            rawTexts.planning = '';

            return {
                类型: 'planning',
                状态: 'skipped',
                耗时毫秒: Date.now() - startTime,
                原始文本: '',
                解析结果: planningResult,
                优先级: 默认优先级.planning,
            };
        } catch (error: any) {
            return {
                类型: 'planning',
                状态: 'failed',
                耗时毫秒: Date.now() - startTime,
                错误信息: error?.message || '规划更新失败',
                优先级: 默认优先级.planning,
            };
        } finally {
            this.deps.set规划更新中?.(false);
        }
    }

    /**
     * 执行记忆召回智能体
     */
    private async executeMemoryRecallAgent(
        rawTexts: Record<游戏大师智能体类型, string>
    ): Promise<智能体执行结果> {
        const startTime = Date.now();
        
        try {
            // 记忆召回实现
            const recallResult = await textAIService.generateMemoryRecall(
                '你是一个记忆分析专家',
                '分析最近的对话，提取重要的记忆点',
                this.deps.apiSettings as any,
                undefined,
                undefined,
                this.params.额外提示词
            );

            rawTexts.memory = recallResult;

            return {
                类型: 'memory',
                状态: 'completed',
                耗时毫秒: Date.now() - startTime,
                原始文本: recallResult,
                解析结果: recallResult,
                优先级: 默认优先级.memory,
            };
        } catch (error: any) {
            return {
                类型: 'memory',
                状态: 'failed',
                耗时毫秒: Date.now() - startTime,
                错误信息: error?.message || '记忆召回失败',
                优先级: 默认优先级.memory,
            };
        }
    }

    /**
     * 执行正文润色智能体
     */
    private async executePolishAgent(
        rawTexts: Record<游戏大师智能体类型, string>
    ): Promise<智能体执行结果> {
        const startTime = Date.now();
        
        try {
            // 提取正文
            const bodyText = this.params.当前响应?.logs
                ?.map((log: any) => log.text || '')
                .join('\n') || '';

            if (!bodyText.trim()) {
                return {
                    类型: 'polish',
                    状态: 'skipped',
                    耗时毫秒: Date.now() - startTime,
                    错误信息: '无正文内容可润色',
                    优先级: 默认优先级.polish,
                };
            }

            const polishResult = await textAIService.generatePolishedBody(
                bodyText,
                this.params.额外提示词 || '请润色以下正文，保持原有风格和事实',
                this.deps.apiSettings as any
            );

            rawTexts.polish = polishResult.rawText;

            return {
                类型: 'polish',
                状态: 'completed',
                耗时毫秒: Date.now() - startTime,
                原始文本: polishResult.rawText,
                解析结果: polishResult,
                优先级: 默认优先级.polish,
            };
        } catch (error: any) {
            return {
                类型: 'polish',
                状态: 'failed',
                耗时毫秒: Date.now() - startTime,
                错误信息: error?.message || '正文润色失败',
                优先级: 默认优先级.polish,
            };
        }
    }

    /**
     * 合并各智能体结果
     */
    private mergeResults(
        agentResults: 智能体执行结果[]
    ): {
        commands: any[];
        dynamicWorldHints: string[];
        variableReport?: string[];
        shortTermMemory?: string;
    } {
        const commands: any[] = [];
        const dynamicWorldHints: string[] = [];
        let variableReport: string[] | undefined;
        let shortTermMemory: string | undefined;

        for (const result of agentResults) {
            if (result.状态 !== 'completed') continue;

            switch (result.类型) {
                case 'world':
                    // 世界演变命令
                    if (result.解析结果?.commands) {
                        commands.push(...result.解析结果.commands);
                    }
                    if (result.解析结果?.updates) {
                        dynamicWorldHints.push(...result.解析结果.updates);
                    }
                    break;

                case 'variable':
                    // 变量校准命令
                    if (result.解析结果?.commands) {
                        commands.push(...result.解析结果.commands);
                    }
                    if (result.解析结果?.reports) {
                        variableReport = result.解析结果.reports;
                    }
                    break;

                case 'planning':
                    // 规划命令
                    if (result.解析结果?.commands) {
                        commands.push(...result.解析结果.commands);
                    }
                    break;

                case 'memory':
                    // 记忆召回结果
                    if (result.原始文本) {
                        shortTermMemory = result.原始文本;
                    }
                    break;

                case 'polish':
                    // 正文润色结果（直接更新到响应）
                    break;
            }
        }

        return {
            commands,
            dynamicWorldHints: Array.from(new Set(dynamicWorldHints)).slice(0, 20),
            variableReport,
            shortTermMemory,
        };
    }

    /**
     * 构建最终结果
     */
    private buildResult(
        success: boolean,
        phase: 游戏大师协调结果['phase'],
        agentResults: 智能体执行结果[],
        commands: any[],
        rawTexts: Record<游戏大师智能体类型, string>,
        statusText: string
    ): 游戏大师协调结果 {
        return {
            success,
            phase,
            agentResults,
            commands,
            dynamicWorldHints: [],
            statusText,
            rawTexts,
        };
    }

    /**
     * 生成状态文本
     */
    private generateStatusText(agentResults: 智能体执行结果[], totalTime: number): string {
        const parts: string[] = [];
        
        for (const result of agentResults) {
            const icon = {
                completed: '✅',
                failed: '❌',
                skipped: '⏭️',
                running: '🔄',
                pending: '⏳',
            }[result.状态] || '❓';
            
            const timeStr = result.耗时毫秒 ? `(${格式化耗时(result.耗时毫秒)})` : '';
            parts.push(`${icon}${result.类型}${timeStr}`);
        }
        
        parts.push(`总耗时: ${格式化耗时(totalTime)}`);
        
        return parts.join(' | ');
    }
}

// ==================== 便捷函数 ====================

/**
 * 创建游戏大师协调器
 */
export const 创建游戏大师协调器 = (
    deps: 游戏大师依赖接口,
    params?: 游戏大师触发参数
): 游戏大师协调器 => new 游戏大师协调器(deps, params);

/**
 * 执行游戏大师流程（便捷函数）
 */
export const 执行游戏大师流程 = async (
    deps: 游戏大师依赖接口,
    params?: 游戏大师触发参数
): Promise<游戏大师协调结果> => {
    const coordinator = new 游戏大师协调器(deps, params);
    return coordinator.execute();
};
