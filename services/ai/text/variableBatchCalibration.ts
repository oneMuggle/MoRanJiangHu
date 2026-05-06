/**
 * 批量变量校准服务
 * 当多个变量生成任务使用相同 API 配置时，可合并为单次请求进行优化
 */

import type { TavernCommand } from '../../types';
import type { 变量模型校准参数, 变量模型校准结果 } from '../../hooks/useGame/variableModelWorkflow';
import { 获取变量计算接口配置, 接口配置是否可用 } from '../../utils/apiConfig';

type 批量校准任务 = {
    taskId: string;
    params: 变量模型校准参数;
};

type 批量校准结果 = {
    taskId: string;
    result: 变量模型校准结果 | null;
};

/**
 * 批量执行变量校准
 * 当多个任务使用相同 API 配置时，可合并为单次请求
 * @param tasks 要批量执行的任务
 * @param apiConfig API配置
 * @param gameConfig 游戏配置
 * @param executeWorkflow 执行变量模型校准工作流的函数
 * @returns 各个任务的结果
 */
export const 批量执行变量校准 = async (
    tasks: 批量校准任务[],
    apiConfig: any,
    gameConfig: any,
    executeWorkflow: (params: 变量模型校准参数, options: { apiConfig: any; gameConfig: any }) => Promise<变量模型校准结果 | null>
): Promise<批量校准结果[]> => {
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return [];
    }

    // 检查 API 配置是否可用
    const variableApi = 获取变量计算接口配置(apiConfig);
    if (!接口配置是否可用(variableApi)) {
        return tasks.map((task) => ({ taskId: task.taskId, result: null }));
    }

    // 如果只有一个任务，直接执行
    if (tasks.length === 1) {
        const task = tasks[0];
        const result = await executeWorkflow(task.params, { apiConfig, gameConfig });
        return [{ taskId: task.taskId, result }];
    }

    // 合并多个任务的 prompt 上下文
    // 注意：这里仅做简单合并，实际实现可能需要更复杂的 prompt 拼接策略
    const mergedParams: 变量模型校准参数 = {
        ...tasks[0].params,
        // 可以添加额外的合并逻辑
    };

    try {
        // 执行合并后的单个请求
        const mergedResult = await executeWorkflow(mergedParams, { apiConfig, gameConfig });

        // 将结果分配给所有任务
        return tasks.map((task) => ({
            taskId: task.taskId,
            result: mergedResult
        }));
    } catch (error) {
        // 如果批量执行失败，单独执行每个任务
        const results: 批量校准结果[] = [];
        for (const task of tasks) {
            try {
                const result = await executeWorkflow(task.params, { apiConfig, gameConfig });
                results.push({ taskId: task.taskId, result });
            } catch {
                results.push({ taskId: task.taskId, result: null });
            }
        }
        return results;
    }
};

/**
 * 判断是否应该使用批量模式
 * @param pendingCount 等待中的任务数量
 * @param maxConcurrency 最大并发数
 * @returns 是否应该使用批量模式
 */
export const 应该使用批量模式 = (pendingCount: number, maxConcurrency: number): boolean => {
    // 当等待任务数超过最大并发数时，考虑使用批量模式
    return pendingCount > maxConcurrency * 2;
};
