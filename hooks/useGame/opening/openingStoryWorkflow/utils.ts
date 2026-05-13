import type { GameResponse, TavernCommand, 提示词结构 } from '../../../../types';

// Utility functions extracted from openingStoryWorkflow.ts

export const 构建开局角色建档摘要 = (
    roleData: any,
    options?: { cultivationSystemEnabled?: boolean }
): string => {
    const 启用修炼体系 = options?.cultivationSystemEnabled !== false;
    const 纯文本 = (value: unknown, fallback = '未提供'): string => {
        if (typeof value !== 'string') return fallback;
        const trimmed = value.trim();
        return trimmed || fallback;
    };
    const 数值文本 = (value: unknown, fallback = '未提供'): string => (
        typeof value === 'number' && Number.isFinite(value) ? String(value) : fallback
    );
    const 天赋列表 = Array.isArray(roleData?.天赋列表)
        ? roleData.天赋列表
            .map((item: any, index: number) => {
                const 名称 = 纯文本(item?.名称, '未提供');
                const 描述 = 纯文本(item?.描述, '未提供');
                const 效果 = 纯文本(item?.效果, '未提供');
                return `[${index}] 名称：${名称}｜描述：${描述}｜效果：${效果}`;
            })
            .filter(Boolean)
            .join('\n')
        : '';
    const 构建气运摘要 = (data: any): string => {
        if (!Array.isArray(data?.气运列表) || data.气运列表.length === 0) {
            return '- 气运：无';
        }
        const lines = data.气运列表.map((item: any, index: number) => {
            const 名称 = 纯文本(item?.名称, '未提供');
            const 描述 = 纯文本(item?.描述, '未提供');
            const 稀有度 = 纯文本(item?.稀有度, '未提供');
            return `  [${index}] 名称：${名称}｜稀有度：${稀有度}｜描述：${描述}`;
        });
        return `- 气运数量：${data.气运列表.length}\n- 气运详情：\n${lines.join('\n')}`;
    };
    const 背景名称 = 纯文本(roleData?.出身背景?.名称);
    const 背景描述 = 纯文本(roleData?.出身背景?.描述);
    const 背景效果 = 纯文本(roleData?.出身背景?.效果);
    return [
        '【主角建档信息】',
        `- 主角姓名：${纯文本(roleData?.姓名)}`,
        `- 性别：${纯文本(roleData?.性别)}`,
        `- 年龄：${数值文本(roleData?.年龄)}`,
        `- 出生日期：${纯文本(roleData?.出生日期)}`,
        `- 外貌：${纯文本(roleData?.外貌)}`,
        `- 性格：${纯文本(roleData?.性格)}`,
        `- 称号：${纯文本(roleData?.称号)}`,
        ...(启用修炼体系 ? [`- 初始境界：${纯文本(roleData?.境界)}`] : []),
        `- 六维：力量 ${数值文本(roleData?.力量)} / 敏捷 ${数值文本(roleData?.敏捷)} / 体质 ${数值文本(roleData?.体质)} / 根骨 ${数值文本(roleData?.根骨)} / 悟性 ${数值文本(roleData?.悟性)} / 福源 ${数值文本(roleData?.福源)}`,
        `- 天赋数量：${Array.isArray(roleData?.天赋列表) ? roleData.天赋列表.length : 0}`,
        天赋列表 ? `- 天赋详情：\n${天赋列表}` : '- 天赋详情：无',
        `- 出身背景名称：${背景名称}`,
        `- 出身背景描述：${背景描述}`,
        `- 出身背景效果：${背景效果}`,
        构建气运摘要(roleData),
        `- 当前所属门派ID：${纯文本(roleData?.所属门派ID)}`,
        '以上建档信息仅作为本回合初始化依据，不代表这些字段已经自动写入前端变量；除非你在 `<变量规划>` 中明确列出需要初始化的内容，否则它们不算已进入本回合初始化结果。',
        '若建档已给出天赋或出身背景的 名称/描述/效果，生成开局时必须按原文完整承接，不得省略、压缩成只剩名称，或擅自改写其语义。'
    ].join('\n');
};

export const 提取响应完整正文文本 = (response?: GameResponse): string => {
    const logs = Array.isArray(response?.logs) ? response.logs : [];
    return logs
        .map((item) => `${item?.sender || '旁白'}：${item?.text || ''}`.trim())
        .filter(Boolean)
        .join('\n')
        .trim();
};

export const 格式化命令展示路径 = (key: string): string => key.replace(/^gameState\./, '');

export const 序列化命令文本 = (cmd: TavernCommand): string => {
    const action = typeof cmd?.action === 'string' ? cmd.action : 'set';
    const key = 格式化命令展示路径(typeof cmd?.key === 'string' ? cmd.key : '');
    if (action === 'delete') return `${action} ${key}`;
    try {
        return `${action} ${key} = ${JSON.stringify(cmd?.value ?? null)}`;
    } catch {
        return `${action} ${key} = ${String(cmd?.value ?? null)}`;
    }
};

export const 构建带索引命令文本 = (commands: TavernCommand[], startIndex = 1): string[] => (
    (Array.isArray(commands) ? commands : [])
        .map((cmd, index) => {
            const text = 序列化命令文本(cmd);
            return text.trim() ? `[#${startIndex + index}] ${text}` : '';
        })
        .filter(Boolean)
);

export const 过滤规划补丁命令 = (commands: TavernCommand[] | undefined, targets: string[]): TavernCommand[] => (
    (Array.isArray(commands) ? commands : []).filter((cmd) => {
        const key = 格式化命令展示路径(typeof cmd?.key === 'string' ? cmd.key.trim() : '');
        return targets.some((target) => key === target || key.startsWith(`${target}.`));
    })
);

export const 读取提示词内容 = (promptPool: 提示词结构[], promptId: string): string => {
    const matched = Array.isArray(promptPool)
        ? promptPool.find((item) => item?.id === promptId)
        : undefined;
    return typeof matched?.内容 === 'string' ? matched.内容.trim() : '';
};
