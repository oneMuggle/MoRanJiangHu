/**
 * 剧情槽位工具函数
 * 提供剧情槽位的过滤、评估、注入等操作
 */
import type { 游戏状态 } from '../models/system';
import type { 世界书作用域 } from '../types';
import { 剧情槽位预算, type 剧情槽位结构 } from '../models/planning/storySlots';
import { 预设剧情槽位列表 } from '../data/story-slots';

/**
 * 评估条件是否满足
 * @param conditions 条件数组（如 ['江湖声望 >= 100', '存在仇人 = true']）
 * @param state 游戏状态
 * @returns 是否所有条件都满足
 */
export const 评估条件 = (conditions: string[] | undefined, state: 游戏状态): boolean => {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
        // 简单的条件解析 - 支持 >=, <=, =, !=, >, < 运算符
        const match = condition.match(/^(.+?)\s*(>=|<=|=|!=|>|<)\s*(.+)$/);
        if (!match) return true; // 无法解析的条件默认通过

        const [, left, op, right] = match;
        const leftVal = 解析条件值(left.trim(), state);
        const rightVal = 解析条件值(right.trim(), state);

        switch (op) {
            case '>=':
                return Number(leftVal) >= Number(rightVal);
            case '<=':
                return Number(leftVal) <= Number(rightVal);
            case '=':
                return String(leftVal) === String(rightVal);
            case '!=':
                return String(leftVal) !== String(rightVal);
            case '>':
                return Number(leftVal) > Number(rightVal);
            case '<':
                return Number(leftVal) < Number(rightVal);
            default:
                return true;
        }
    });
};

/**
 * 解析条件中的变量值
 */
const 解析条件值 = (key: string, state: 游戏状态): string | number | boolean => {
    // 处理嵌套属性访问（如 "日期.年"）
    const parts = key.split('.');
    let value: unknown = state;

    for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
            value = (value as Record<string, unknown>)[part];
        } else {
            return key; // 无法解析返回原值
        }
    }

    return value as string | number | boolean;
};

/**
 * 评估剧情槽位优先级
 * 根据上下文信息动态调整优先级
 */
export const 评估槽位优先级 = (
    slot: 剧情槽位结构,
    state: 游戏状态
): number => {
    let priority = slot.优先级;

    // 如果有启用条件但未满足，优先级降到最低
    if (slot.启用条件 && !评估条件(slot.启用条件, state)) {
        return -1;
    }

    // 如果有失效条件且满足，优先级降到最低
    if (slot.失效条件 && 评估条件(slot.失效条件, state)) {
        return -1;
    }

    // 根据游戏阶段调整优先级
    // 例如：主线推进时可以临时提升任务槽位优先级
    if (slot.类型 === '主线任务' && state.剧情?.当前章节) {
        priority += 10;
    }

    return priority;
};

/**
 * 过滤可用剧情槽位
 * 根据作用域和游戏状态返回可用的槽位列表
 */
export const 过滤可用槽位 = (
    scope: 世界书作用域,
    state: 游戏状态,
    slots?: 剧情槽位结构[]
): 剧情槽位结构[] => {
    const sourceSlots = slots || 预设剧情槽位列表;

    return sourceSlots
        .filter(slot =>
            slot.作用域.includes(scope) || slot.作用域.includes('all')
        )
        .map(slot => ({
            slot,
            effectivePriority: 评估槽位优先级(slot, state)
        }))
        .filter(({ effectivePriority }) => effectivePriority >= 0)
        .sort((a, b) => b.effectivePriority - a.effectivePriority)
        .map(({ slot }) => slot);
};

/**
 * 获取指定作用域的可用槽位
 */
export const 获取可用槽位 = (
    scope: 世界书作用域,
    state: 游戏状态
): 剧情槽位结构[] => 过滤可用槽位(scope, state);

/**
 * 按类型分组获取可用槽位
 */
export const 按类型分组获取槽位 = (
    scope: 世界书作用域,
    state: 游戏状态
): Record<string, 剧情槽位结构[]> => {
    const slots = 获取可用槽位(scope, state);
    return slots.reduce(
        (acc, slot) => {
            if (!acc[slot.类型]) {
                acc[slot.类型] = [];
            }
            acc[slot.类型].push(slot);
            return acc;
        },
        {} as Record<string, 剧情槽位结构[]>
    );
};

/**
 * 计算槽位内容的估计长度
 */
export const 估算槽位内容长度 = (slot: 剧情槽位结构): number => {
    return slot.内容.length;
};

/**
 * 检查是否超出预算
 */
export const 检查预算 = (
    slots: 剧情槽位结构[],
    scope: 世界书作用域
): { withinBudget: boolean; used: number; budget: number } => {
    const budget = 剧情槽位预算[scope] || 3000;
    const used = slots.reduce((sum, slot) => sum + 估算槽位内容长度(slot), 0);
    return {
        withinBudget: used <= budget,
        used,
        budget
    };
};

/**
 * 在预算内获取最佳槽位组合
 */
export const 获取预算内槽位组合 = (
    scope: 世界书作用域,
    state: 游戏状态
): 剧情槽位结构[] => {
    const available = 获取可用槽位(scope, state);
    const budget = 剧情槽位预算[scope] || 3000;

    const result: 剧情槽位结构[] = [];
    let currentLength = 0;

    for (const slot of available) {
        const slotLength = 估算槽位内容长度(slot);
        if (currentLength + slotLength <= budget) {
            result.push(slot);
            currentLength += slotLength;
        } else {
            break; // 已按优先级排序，后面的都会超出预算
        }
    }

    return result;
};

/**
 * 格式化槽位内容用于注入
 * 替换模板变量
 */
export const 格式化槽位内容 = (
    slot: 剧情槽位结构,
    state: 游戏状态
): string => {
    let content = slot.内容;

    // 简单的模板变量替换
    // 支持 {{变量名}} 或 {{对象.属性}} 格式
    const templateRegex = /\{\{([^}]+)\}\}/g;
    content = content.replace(templateRegex, (_, path) => {
        const value = 解析条件值(path.trim(), state);
        return String(value ?? '');
    });

    return content;
};

/**
 * 生成槽位注册表
 * 用于在游戏初始化时注册所有可用槽位
 */
export const 生成槽位注册表 = (): Record<string, 剧情槽位结构> => {
    return 预设剧情槽位列表.reduce(
        (acc, slot) => {
            acc[slot.id] = slot;
            return acc;
        },
        {} as Record<string, 剧情槽位结构>
    );
};

/**
 * 根据ID获取槽位
 */
export const 获取槽位ById = (id: string): 剧情槽位结构 | undefined => {
    return 预设剧情槽位列表.find(slot => slot.id === id);
};

/**
 * 激活槽位
 * 返回激活后的槽位信息
 */
export const 激活槽位 = (
    slot: 剧情槽位结构,
    state: 游戏状态
): { success: boolean; slot?: 剧情槽位结构; reason?: string } => {
    // 检查启用条件
    if (slot.启用条件 && !评估条件(slot.启用条件, state)) {
        return {
            success: false,
            reason: '启用条件未满足'
        };
    }

    // 检查失效条件
    if (slot.失效条件 && 评估条件(slot.失效条件, state)) {
        return {
            success: false,
            reason: '失效条件已满足'
        };
    }

    return { success: true, slot };
};
