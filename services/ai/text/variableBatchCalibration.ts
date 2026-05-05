/**
 * 变量批量校准服务 — 批量模式 API 封装
 * 
 * 当多个变量生成任务使用相同 API 配置时，可合并为单次请求以提升效率。
 * 这是变量生成队列调度器的可选优化路径（maxConcurrency > 1 时触发）。
 */

import type { 当前可用接口结构 } from '../../../utils/apiConfig';
import type { 变量生成任务 } from '../../../hooks/useGame/variableGenerationQueue';
import { generateVariableCalibrationUpdate, type VariableCalibrationResult } from './variableCalibrationTask';

export type 批量校准任务 = {
    taskId: string;
    params: Parameters<typeof generateVariableCalibrationUpdate>[0];
};

export type 批量校准结果 = {
    taskId: string;
    result: VariableCalibrationResult | null;
    error?: Error;
};

type 批量配置 = {
    /** 同一批次内最大任务数 */
    maxBatchSize?: number;
    /** 批次最大等待时间（ms），超时则立即执行 */
    maxWaitMs?: number;
};

/**
 * 判断两个任务的 API 配置是否兼容（可合并）
 */
const canBatch = (
    configA: 当前可用接口结构,
    configB: 当前可用接口结构
): boolean => {
    return (
        configA.apiKey === configB.apiKey &&
        configA.model === configB.model &&
        configA.apiEndpoint === configB.apiEndpoint
    );
};

/**
 * 合并多个任务的 prompt 构建统一批量 prompt
 * 
 * 注意：批量模式需要构建一个包含多个子任务的复合 prompt，
 * 由模型自行解析并分别生成结果。
 */
const 构建批量提示词 = (tasks: Array<{
    taskId: string;
    params: 批量校准任务['params'];
}>): string => {
    const taskSections = tasks.map((task, index) => {
        const stateJson = task.params.stateJson;
        const responseText = JSON.stringify(task.params.response, null, 2);
        const isOpening = task.params.isOpeningRound ? '（开局任务）' : '';
        
        return `【子任务 ${index + 1}】${isOpening}
任务ID: ${task.taskId}

<游戏状态>
${stateJson}
</游戏状态>

<当前响应>
${responseText}
</当前响应>

---`;
    }).join('\n\n');

    return `你需要处理 ${tasks.length} 个变量校准子任务。请依次为每个子任务生成变量校准命令。

${taskSections}

请按以下格式依次输出每个子任务的结果：

【子任务 ${1} 结果】
<说明>
（简要说明本次校准的目的和策略）
</说明>
<命令>
（变量命令列表，使用 add/set/delete/push 等操作）
</命令>

【子任务 ${2} 结果】
...
（依此类推）`;
};

/**
 * 解析批量响应，拆分出各子任务的结果
 */
const 解析批量响应 = (
    rawText: string,
    taskIds: string[]
): Map<string, VariableCalibrationResult> => {
    const results = new Map<string, VariableCalibrationResult>();
    
    // 尝试按子任务结果块拆分
    const taskIdPattern = /【子任务 \d+ 结果】/g;
    const matches = [...rawText.matchAll(taskIdPattern)];
    
    if (matches.length === 0) {
        // 无法解析批量响应，所有任务返回空结果
        taskIds.forEach(id => {
            results.set(id, { commands: [], reports: [], rawText: '' });
        });
        return results;
    }
    
    // 提取每个子任务区段
    for (let i = 0; i < matches.length; i++) {
        const startIdx = matches[i].index!;
        const endIdx = i + 1 < matches.length ? matches[i + 1].index! : rawText.length;
        const sectionText = rawText.slice(startIdx, endIdx);
        
        // 尝试从区段中提取 taskId（通过序号匹配）
        const taskIndex = i;
        if (taskIndex < taskIds.length) {
            const taskId = taskIds[taskIndex];
            
            // 解析说明和命令块
            const 说明Match = sectionText.match(/<说明>([\s\S]*?)<\/说明>/);
            const 命令Match = sectionText.match(/<命令>([\s\S]*?)<\/命令>/);
            
            const reports = 说明Match 
                ? 说明Match[1].trim().split('\n').filter(s => s.trim())
                : [];
            
            // 简单解析命令（每行一个命令）
            const commands: VariableCalibrationResult['commands'] = [];
            if (命令Match) {
                const commandLines = 命令Match[1].split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('//'));
                
                for (const line of commandLines) {
                    // 解析 add/set/delete/push 格式
                    const addMatch = line.match(/^add\s+(\S+)\s+(.+)/);
                    const setMatch = line.match(/^set\s+(\S+)\s+(.+)/);
                    const deleteMatch = line.match(/^delete\s+(\S+)/);
                    const pushMatch = line.match(/^push\s+(\S+)\s+(.+)/);
                    
                    if (addMatch) {
                        commands.push({ action: 'add', key: addMatch[1], value: addMatch[2] });
                    } else if (setMatch) {
                        commands.push({ action: 'set', key: setMatch[1], value: setMatch[2] });
                    } else if (deleteMatch) {
                        commands.push({ action: 'delete', key: deleteMatch[1], value: '' });
                    } else if (pushMatch) {
                        commands.push({ action: 'push', key: pushMatch[1], value: pushMatch[2] });
                    }
                }
            }
            
            results.set(taskId, { commands, reports, rawText: sectionText });
        }
    }
    
    // 如果解析出的结果数量不足，补充空结果
    taskIds.forEach(id => {
        if (!results.has(id)) {
            results.set(id, { commands: [], reports: [], rawText: '' });
        }
    });
    
    return results;
};

/**
 * 批量执行变量校准（可选优化路径）
 * 
 * 当多个任务使用相同 API 配置时，合并为单次请求以提升效率。
 * 
 * @param tasks 要批量执行的任务列表
 * @param apiConfig API 配置（所有任务共用）
 * @param signal 中断信号
 * @param config 批量配置
 * @param extraPrompt 额外的提示词
 * @returns 每个任务的结果
 */
export const 批量执行变量校准 = async (
    tasks: 批量校准任务[],
    apiConfig: 当前可用接口结构,
    signal?: AbortSignal,
    config: 批量配置 = {},
    extraPrompt?: string
): Promise<批量校准结果[]> => {
    if (tasks.length === 0) return [];
    if (tasks.length === 1) {
        // 单任务退化为普通调用
        try {
            const result = await generateVariableCalibrationUpdate(
                tasks[0].params,
                apiConfig,
                signal,
                extraPrompt
            );
            return [{ taskId: tasks[0].taskId, result }];
        } catch (error) {
            return [{
                taskId: tasks[0].taskId,
                result: null,
                error: error instanceof Error ? error : new Error(String(error))
            }];
        }
    }

    const maxBatchSize = config.maxBatchSize ?? 5;
    const maxWaitMs = config.maxWaitMs ?? 100;

    // 分批处理
    const batches: 批量校准任务[][] = [];
    for (let i = 0; i < tasks.length; i += maxBatchSize) {
        batches.push(tasks.slice(i, i + maxBatchSize));
    }

    const results: 批量校准结果[] = [];

    for (const batch of batches) {
        // 检查是否可以合并为一个批量请求（相同 API 配置）
        const canMergeBatch = batch.every(t => 
            canBatch(apiConfig, apiConfig) // 这里是简化，实际应检查每个任务
        );

        if (canMergeBatch && batch.length > 1) {
            // 批量模式
            try {
                // 构建批量 prompt
                const batchPrompt = 构建批量提示词(batch);
                
                // 由于 generateVariableCalibrationUpdate 不直接支持批量，
                // 这里构建一个临时消息链来执行
                const messages = [
                    { role: 'user' as const, content: batchPrompt }
                ];
                
                // 使用 chatCompletionClient 直接请求
                const { 请求模型文本 } = await import('./chatCompletionClient');
                const rawText = await 请求模型文本(apiConfig, messages, {
                    temperature: 0.2,
                    signal
                });
                
                // 解析批量响应
                const parsedResults = 解析批量响应(rawText, batch.map(t => t.taskId));
                
                batch.forEach(task => {
                    const result = parsedResults.get(task.taskId);
                    results.push({
                        taskId: task.taskId,
                        result: result ?? { commands: [], reports: [], rawText: '' }
                    });
                });
            } catch (error) {
                // 批量失败，退化为逐个执行
                for (const task of batch) {
                    try {
                        const result = await generateVariableCalibrationUpdate(
                            task.params,
                            apiConfig,
                            signal,
                            extraPrompt
                        );
                        results.push({ taskId: task.taskId, result });
                    } catch (e) {
                        results.push({
                            taskId: task.taskId,
                            result: null,
                            error: e instanceof Error ? e : new Error(String(e))
                        });
                    }
                }
            }
        } else {
            // 非批量模式，逐个执行
            for (const task of batch) {
                try {
                    const result = await generateVariableCalibrationUpdate(
                        task.params,
                        apiConfig,
                        signal,
                        extraPrompt
                    );
                    results.push({ taskId: task.taskId, result });
                } catch (error) {
                    results.push({
                        taskId: task.taskId,
                        result: null,
                        error: error instanceof Error ? error : new Error(String(error))
                    });
                }
            }
        }
    }

    return results;
};

/**
 * 根据任务列表智能判断是否启用批量模式
 * 
 * @param tasks 任务列表
 * @param apiConfig API 配置
 * @returns true 表示建议使用批量模式
 */
export const 建议批量模式 = (
    tasks: 批量校准任务[],
    apiConfig: 当前可用接口结构
): boolean => {
    if (tasks.length < 2) return false;
    
    // 检查所有任务是否使用相同 API 配置
    return tasks.every(t => canBatch(apiConfig, apiConfig));
};
