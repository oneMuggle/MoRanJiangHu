import type { 世界书作用域 } from '../../types';

/**
 * 剧情槽位类型
 */
export type 剧情槽位类型 =
    | '主线任务'
    | '支线任务'
    | '日常任务'
    | '镜头序列'
    | '事件触发'
    | '过渡场景'
    | '角色互动'
    | '背景描写';

/**
 * 剧情槽位结构 - 表示一个可注入的故事单元
 */
export interface 剧情槽位结构 {
    /** 唯一标识 */
    id: string;
    /** 槽位名称 */
    名称: string;
    /** 槽位类型 */
    类型: 剧情槽位类型;
    /** 槽位内容（提示词/模板） */
    内容: string;
    /** 适用作用域 */
    作用域: 世界书作用域[];
    /** 优先级（越大越优先） */
    优先级: number;
    /** 启用条件（满足条件才注入） */
    启用条件?: string[];
    /** 失效条件（满足条件则不注入） */
    失效条件?: string[];
    /** 关联的任务ID列表 */
    关联任务?: string[];
    /** 关联的人物ID列表 */
    关联人物?: string[];
    /** 关联的地点ID列表 */
    关联地点?: string[];
    /** 是否默认启用 */
    默认启用?: boolean;
}

/**
 * 剧情槽位预算配置
 * 各作用域的槽位内容最大token数
 */
export const 剧情槽位预算: Record<世界书作用域, number> = {
    main: 3000,
    opening: 2000,
    world_evolution: 1500,
    variable_calibration: 1000,
    story_plan: 2500,
    heroine_plan: 2000,
    tavern: 2000,
    recall: 0,
    all: 4000
};

/**
 * 剧情槽位类型标签
 */
export const 剧情槽位类型标签: Record<剧情槽位类型, string> = {
    主线任务: '主线任务',
    支线任务: '支线任务',
    日常任务: '日常任务',
    镜头序列: '镜头序列',
    事件触发: '事件触发',
    过渡场景: '过渡场景',
    角色互动: '角色互动',
    背景描写: '背景描写'
};

/**
 * 生成剧情槽位ID
 */
export const 生成剧情槽位ID = (prefix: string = 'story_slot'): string =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * 剧情槽位工厂函数 - 创建新槽位
 */
export const 创建剧情槽位 = (
    partial: Partial<剧情槽位结构> & Pick<剧情槽位结构, '名称' | '类型' | '内容'>
): 剧情槽位结构 => ({
    id: 生成剧情槽位ID(),
    作用域: ['main'],
    优先级: 50,
    默认启用: true,
    ...partial
});
