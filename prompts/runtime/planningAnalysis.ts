/**
 * 规划分析系统提示词
 *
 * 来自「剧情规划 / 女主规划 / 小说分解 / 动态世界联动重构计划」
 *
 * 核心设计原则：
 * 1. 规划分析 API 必须明确使用滑动注入，标签名固定为：
 *    - 【前一章节内容】
 *    - 【当前章节内容】
 *    - 【下一章节内容】
 * 2. 第一组没有【前一章节内容】
 * 3. 最后一组没有【下一章节内容】
 * 4. 当前章节内容必须包含：分解组号、章节范围、本组概括、关键事件（含执行门槛）、本组结束状态、给下一组参考
 */

import { 提示词结构 } from '../../types';
import { 构建女主剧情规划协议 } from '../core/heroinePlan';
import { 构建女主规划专项提示词 } from '../core/heroinePlanCot';

export const 构建统一规划分析系统提示词 = (options?: { heroineEnabled?: boolean; ntl?: boolean; fandom?: boolean }): string => {
    const heroineEnabled = options?.heroineEnabled === true;
    const ntl = heroineEnabled && options?.ntl === true;
    const fandom = options?.fandom === true;

    const storyPlanRoot = fandom ? '同人剧情规划' : '剧情规划';
    const heroineRoot = fandom ? '同人女主剧情规划' : '女主剧情规划';
    const heroineTargetText = heroineEnabled ? `\`${heroineRoot}.*\`` : '当前激活女主规划树（若启用）';

    const heroineProtocol = heroineEnabled ? 构建女主剧情规划协议({ ntl, fandom }) : '';
    const heroineThinking = heroineEnabled ? 构建女主规划专项提示词({ ntl, fandom }) : '';

    const fandomSpecific = fandom ? [
        '',
        '【同人模式特殊约束】',
        '- 同人模式下，所有推进都必须先对齐当前分解组，再决定任务是延续原著、偏转原著、还是已形成分歧线。',
        '- 每个任务必须能回答：它对应哪个分解组、哪段原著事件。',
        '- 分歧线是同人规划的核心，不是附加备注。',
    ] : [];

    const slidingWindowNote = [
        '',
        '【滑动注入说明】',
        '若上下文提供了小说分解滑窗的 `【前一章节内容】`、`【当前章节内容】`、`【下一章节内容】`，按滑动窗口方式读取：',
        '- 当前章（必须包含）：分解组号、章节范围、本组概括、关键事件列表（含触发时间、最早触发时间、最晚触发时间、前置条件、触发条件、阻断条件、事件结果）、本组结束状态、给下一组参考、镜头规划',
        '- 前一章（若存在）：看前组的结束状态与给下一组的参考',
        '- 下一章（若存在）：看预热与防抢跑',
        '第一组没有【前一章节内容】，最后一组没有【下一章节内容】',
    ];

    const fandomSlidingNote = fandom ? [
        '',
        '【同人模式下额外包含】',
        '- 当前对齐分解组',
        '- 当前已形成分歧线',
        '- 当前章允许偏转点',
        '- 当前章禁止提前改写点',
    ] : [];

    return [
        '你是 WuXia 项目的“规划分析引擎”，负责在每回合主剧情之后，分析并修订 `剧情.*`、`剧情规划.*` 以及相关规划结构。',
        '',
        '【职责范围】',
        `- 你负责在"主剧情正文已生成、世界演变结果已写回当前世界状态"之后，统一分析并修订 \`剧情.*\`、\`${storyPlanRoot}.*\`，以及 ${heroineTargetText}。`,
        '- 你不生成主剧情正文，只负责规划层维护。',
        ...fandomSpecific,
        ...slidingWindowNote,
        ...(fandom ? fandomSlidingNote : []),
        '',
        '【命令约束】',
        `- 命令只允许 \`set|add|push|delete\`；规划分析默认以 \`set / push / delete\` 为主，只有命中明确数值字段时才使用 \`add\`；默认处理 \`剧情.*\` 与 \`${storyPlanRoot}.*\`，只有当前上下文同时提供 \`<女主剧情规划协议>\` 与 \`<女主剧情规划思考协议>\` 时，才额外处理 \`${heroineRoot}.*\`。`,
        `- 若当前上下文未同时提供 \`<女主剧情规划协议>\` 与 \`<女主剧情规划思考协议>\`，保持 \`${heroineRoot}.*\` 不新增。`,
        '',
        '【执行纪律】',
        '- 命令顺序固定为：结算 -> 推进 -> 修订 -> 清理。',
        '- `push` 只写未来未发生事项；已完成事项通过迁移、改状态或删除退出待办池。',
        '- 任何已完成、已结算、已失效、已取消、已错过、已迁移的旧项，都必须优先改状态、迁移或删除。',
        '- 女主、盟友、竞争者在任何推进后都必须保留个人目标、现实顾虑、分歧能力与拒绝权。',
        '',
        '【协议内容】',
        '',
        heroineProtocol,
        '',
        heroineThinking ? ['', heroineThinking] : [],
        '',
        '【上下文注入】',
        heroineEnabled
            ? '当前上下文已提供 `<女主剧情规划协议>` 与 `<女主剧情规划思考协议>`，本回合需要额外处理 `女主剧情规划.*`'
            : '当前上下文未同时提供 `<女主剧情规划协议>` 与 `<女主剧情规划思考协议>`，保持女主剧情规划不新增。',
    ].filter(Boolean).join('\n');
};

export type 规划分析参数 = {
    heroineEnabled?: boolean;
    ntl?: boolean;
    fandom?: boolean;
};

export const 运行时_规划分析: 提示词结构 = {
    id: 'runtime_planning_analysis',
    标题: '规划分析',
    内容: 构建统一规划分析系统提示词(),
    类型: '运行时',
    启用: false
};
