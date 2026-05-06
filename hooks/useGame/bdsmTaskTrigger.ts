/**
 * bdsmTaskTrigger.ts
 * BDSM 任务生命周期触发器
 *
 * 编排任务生成、日常指令刷新和 Aftercare 需求的检测与注入。
 * 纯函数，不直接修改状态，返回操作指令供调用方应用。
 */

import { 构建调教任务生成提示词, 构建日常指令生成提示词, 构建Aftercare注入提示词 } from '../../prompts/runtime/bdsmTasks';
import { type BDSM调教任务, type BDSM日常指令, type BDSM关系状态 } from '../../models/campusNSFW/sm';

// ==================== 常量 ====================

const 默认最大活跃任务数 = 2;
const 连续拒绝阈值 = 2;

/** Aftercare 服从度加成 */
const Aftercare服从度加成: Record<string, [number, number]> = {
    '重体力任务': [3, 5],
    '极限挑战': [3, 5],
    '公开挑战': [2, 4],
    '连续拒绝': [2, 3],
    '阶段推进': [1, 2],
};

// ==================== 任务生成触发 ====================

export interface 任务生成结果 {
    需要生成: boolean;
    提示词?: string;
}

/**
 * 检查是否需要生成新任务，并在需要时构建提示词
 */
export const 触发任务生成 = (params: {
    活跃任务: BDSM调教任务[];
    关系状态: BDSM关系状态;
    npcName: string;
    最大活跃数?: number;
    请求模型文本?: (prompt: string) => Promise<string>;
}): 任务生成结果 => {
    const 最大数 = params.最大活跃数 ?? 默认最大活跃任务数;
    const 待完成任务 = params.活跃任务.filter(t => t.状态 === '待接受' || t.状态 === '进行中');
    if (待完成任务.length >= 最大数) {
        return { 需要生成: false };
    }

    const 当前契约 = params.关系状态.契约记录.length > 0
        ? params.关系状态.契约记录[params.关系状态.契约记录.length - 1]
        : null;
    const 提示词 = 构建调教任务生成提示词({
        契约类型: 当前契约?.类型 ?? '口头约定',
        契约状态: 当前契约?.状态 ?? '口头约定',
        服从度: params.关系状态.服从度,
        权力倾向: params.关系状态.权力天平 > 0 ? '支配' : '服从',
        关系阶段: params.关系状态.阶段,
        已解锁场景: [],
        历史任务数量: params.活跃任务.length,
        NPC性格特征: params.npcName,
    });

    return { 需要生成: true, 提示词 };
};

// ==================== 日常指令刷新触发 ====================

export interface 日常指令刷新结果 {
    需要刷新: boolean;
    提示词?: string;
}

/**
 * 检查是否需要刷新日常指令（全部完成或无日常指令时）
 */
export const 触发日常指令刷新 = (params: {
    日常指令: BDSM日常指令[];
    关系状态: BDSM关系状态;
    npcName: string;
    请求模型文本?: (prompt: string) => Promise<string>;
}): 日常指令刷新结果 => {
    const 全部完成 = params.日常指令.length > 0 && params.日常指令.every(i => i.是否完成);
    const 无指令 = params.日常指令.length === 0;

    if (!全部完成 && !无指令) {
        return { 需要刷新: false };
    }

    const 当前契约 = params.关系状态.契约记录.length > 0
        ? params.关系状态.契约记录[params.关系状态.契约记录.length - 1]
        : null;
    const 提示词 = 构建日常指令生成提示词({
        服从度: params.关系状态.服从度,
        契约状态: 当前契约?.状态 ?? '口头约定',
        关系阶段: params.关系状态.阶段,
        已发布指令数: params.日常指令.length,
        NPC性格特征: params.npcName,
    });

    return { 需要刷新: true, 提示词 };
};

// ==================== Aftercare 检测 ====================

export interface Aftercare检测结果 {
    需要Aftercare: boolean;
    触发原因?: string;
    提示词?: string;
    服从度加成: number;
}

/**
 * 检查是否触发 Aftercare 需求
 *
 * 触发条件：
 * 1. 完成了重体力任务（难度 >= 高级）或极限任务
 * 2. 完成了"公开挑战"类型任务
 * 3. 连续拒绝任务 >= 阈值
 * 4. 关系阶段推进
 */
export const 检查Aftercare需求 = (params: {
    完成任务?: BDSM调教任务;
    连续拒绝次数: number;
    关系状态: BDSM关系状态;
    阶段是否推进: boolean;
    npcName: string;
}): Aftercare检测结果 => {
    // 检查重体力/极限任务
    if (params.完成任务) {
        const 任务 = params.完成任务;
        if (任务.难度 === '高级' || 任务.难度 === '极限') {
            const [min, max] = Aftercare服从度加成[任务.类型] ?? Aftercare服从度加成['重体力任务'];
            return 构建Aftercare结果('重体力任务', params, min, max);
        }
        if (任务.类型 === '公开挑战') {
            const [min, max] = Aftercare服从度加成['公开挑战'];
            return 构建Aftercare结果('公开挑战', params, min, max);
        }
    }

    // 连续拒绝
    if (params.连续拒绝次数 >= 连续拒绝阈值) {
        const [min, max] = Aftercare服从度加成['连续拒绝'];
        return 构建Aftercare结果('连续拒绝', params, min, max);
    }

    // 阶段推进
    if (params.阶段是否推进) {
        const [min, max] = Aftercare服从度加成['阶段推进'];
        return 构建Aftercare结果('阶段推进', params, min, max);
    }

    return { 需要Aftercare: false, 服从度加成: 0 };
};

const 构建Aftercare结果 = (
    原因: string,
    params: Parameters<typeof 检查Aftercare需求>[0],
    min: number,
    max: number
): Aftercare检测结果 => {
    const 服从度加成 = Math.floor(Math.random() * (max - min + 1)) + min;
    const 提示词 = 构建Aftercare注入提示词({
        npcName: params.npcName,
        触发原因: 原因,
        当前阶段: params.关系状态.阶段,
        服从度: params.关系状态.服从度,
        服从度加成,
    });

    return {
        需要Aftercare: true,
        触发原因: 原因,
        提示词,
        服从度加成,
    };
};

// ==================== Aftercare 服从度应用 ====================

/**
 * 计算 Aftercare 后的新服从度（不可变更新）
 */
export const 应用Aftercare服从度 = (关系状态: BDSM关系状态, 加成: number): BDSM关系状态 => {
    const 新服从度 = Math.min(100, 关系状态.服从度 + 加成);
    return {
        ...关系状态,
        服从度: 新服从度,
    };
};
