// 游戏设置、记忆、存档、酒馆预设、能力系统相关定义
// 从 models/system.ts 拆分而来

import type { LiModeStage } from './eraTheme/types';
import { 角色数据结构 } from './character';
import { 环境信息结构 } from './environment';
import type { 校园NSFW设置 } from './campusNSFW';
import type { 都市网约车NSFW设置 } from './urbanDriverNSFW';
import type { 写真NSFW设置, 写真系统扩展 } from './photographyNSFW';
import { 场景图片档案 } from './imageGeneration';
import { NPC结构 } from './social';
import { 世界数据结构 } from './world';
import { 详细门派结构 } from './sect';
import { 任务结构, 约定结构 } from './task';
import type { 校规条目, 校规影响日志, 催眠记录, 催眠App等级, 校园系统数据 } from './campusPhone';
import { 剧情系统结构 } from './story';
import { 剧情规划结构 } from './storyPlan';
import { 女主剧情规划结构 } from './heroinePlan';
import { 同人剧情规划结构 } from './fandomPlanning/story';
import { 同人女主剧情规划结构 } from './fandomPlanning/heroinePlan';
import { 战斗状态结构 } from './battle';
import type { 视觉设置结构 } from './theme-visual';
import type { 角色锚点结构 } from './api-config';
import type { 时代信息结构 } from './era-config';

// === 游戏配置类型 ===

export type 剧情风格类型 = '后宫' | '修炼' | '一般' | '修罗场' | '纯爱' | 'NTL后宫';
export type NTL后宫档位 = '禁止乱伦' | '假乱伦' | '无限制';
export type 酒馆提示词后处理类型 = '未选择' | '单一用户' | '严格' | '半严格';
export type 武力等级 = '低武' | '中武' | '高武' | '修仙';

export const 武力等级描述映射: Record<武力等级, string> = {
    '低武': '武侠初期，拳脚功夫为主，刀剑为辅。高手亦不过力大招猛、身法矫健，止步于人体极限。江湖以招式精妙、经验丰富者为强，内力可有但浅薄。无轻功飞纵，无隔空伤人，无真气外放。',
    '中武': '武侠中期，内力显著，可登堂入室。高手能以一敌十，轻功可腾跃数丈，暗器可及远。江湖以门派传承、功法境界为尊。或有真传秘籍之争，或有宗师独步一方。',
    '高武': '武侠巅峰/后期化境，宗师辈出，可开宗立派。高手段已臻化境，飞花摘叶皆可伤人，真气外放亦有之。秘籍、名器、传承皆为稀缺资源。高境界者凤毛麟角，百年难遇。',
    '修仙': '超越武侠范畴，涉及灵气、真元、阵法、炼丹、灵兽等元素。修行者可御器飞行、夺天地造化。门派以修仙宗门为主，凡人江湖缩小为世俗一隅。秘境、灵脉、仙缘为修行关键。'
};

export type NSFW场景类型 = '无' | '点到为止' | '适度展开' | '完全展开';

export const NSFW场景描述映射: Record<NSFW场景类型, string> = {
    '无': '完全不会出现性相关描写。',
    '点到为止': '只描写氛围和情感递进，身体接触限于拥抱、牵手、眼神交流，使用"春宵一度"、"巫山云雨"等委婉表达。',
    '适度展开': '可描写亲吻、抚摸、衣着褪去，使用委婉词汇替代敏感词，不出现敏感词。',
    '完全展开': '可进行完全展开的性描写，使用敏感词：肉棒、龟头、阴茎、小穴、阴蒂、乳头、蜜液、精液等。'
};

export type 剧情推进速度 = '缓慢' | '正常' | '快速' | '跳过至关键节点';

export type 行动选项增强档位 = '缓慢' | '正常' | '快速' | '跳过至关键节点';

export const 剧情推进速度描述映射: Record<剧情推进速度, string> = {
    '缓慢': '每个回合聚焦极小范围的细节互动，节奏舒缓，重情感递进与氛围营造。',
    '正常': '按默认节奏推进剧情，平衡叙事与互动的比重。',
    '快速': '跳过不必要的过场和寒暄，选项直奔核心行动，减少冗余叙事。',
    '跳过至关键节点': '大幅跳跃到下一个重要事件或转折点，选项可包含明确的时间跨度。'
};

// === 能力系统 ===

export type 能力类型 = '传统武侠' | '修仙体系' | '超能力线' | '混合世界';

export type 超能力分类 = '心灵感应' | '念力' | '预知' | '治愈' | '元素操控' | '时空' | '变身' | '灵能' | '高科技' | '综合' | '未觉醒';

export const 超能力分类描述: Record<超能力分类, string> = {
    '心灵感应': '脑波能力，可读取他人思维、传递意识、感知情绪。高阶可进行远距离传心或思维干扰。',
    '念力': '精神力外显形成的物质化力量，可隔空移物、压缩物体、形成念力护盾。高阶可撼山搬海。',
    '预知': '时间感知能力，可预见短期未来、占卜吉凶、预判危机。高阶可看到多条时间线。',
    '治愈': '生命力操控能力，可加速自愈、治愈他人、操控血液。高阶可起死回生但有代价。',
    '元素操控': '自然元素亲和，可操控火、水、风、土、雷等自然之力。高阶可引动天灾。',
    '时空': '时空规则能力，可短距离瞬移、时间减缓、空间扭曲。高阶可短暂停滞时间。',
    '变身': '形态变化能力，可变化外貌、拟态他物、兽化。高阶可完全变身或化为能量态。',
    '灵能': '灵魂层面能力，可灵魂出窍、灵体攻击、开启灵觉。高阶可干预他人魂魄。',
    '高科技': '科技侧能力，机械改造、基因药剂、义体强化。高阶可成为半机械或半生物。',
    '综合': '多重能力混合，多种超能力并存，能力间可能有协同或冲突。',
    '未觉醒': '能力潜力存在但尚未激发，可能在危机时刻或特定条件下觉醒。'
};

export type 觉醒程度 = '未觉醒' | '初觉' | '小成' | '大成' | '巅峰';

export const 觉醒程度描述: Record<觉醒程度, string> = {
    '未觉醒': '体内有潜能但尚未激发，可能在危机时刻或特定条件下觉醒。',
    '初觉': '能力刚开始显现，表现为微弱、不稳定、难以控制。',
    '小成': '能力已可主动使用，但威力有限，需要专注才能发动。',
    '大成': '能力运用自如，威力可观，可作为主要对敌手段。',
    '巅峰': '能力已臻化境炉火纯青，可越级挑战甚至改变局势。'
};

export const 能力类型描述映射: Record<能力类型, string> = {
    '传统武侠': '纯内力体系，无超自然能力，江湖以招式精妙、经验丰富者为强。',
    '修仙体系': '灵气为基，修仙功法为主，可御剑飞行、炼丹炼器、追求长生。',
    '超能力线': '特异功能为主，现代/科幻风格，包括心灵感应、念力、元素操控等。',
    '混合世界': '武侠、修仙、超能力并存，多体系交汇，兼容并蓄。'
};

// === 难度与统计 ===

export type 游戏难度 = 'relaxed' | 'easy' | 'normal' | 'hard' | 'extreme';

export interface 难度调整记录 {
    时间: number;
    原难度: 游戏难度;
    新难度: 游戏难度;
    原因: string;
    玩家表现: {
        胜率: number;
        死亡次数: number;
        任务完成率: number;
    };
}

export interface 游戏统计 {
    总回合数: number;
    战斗次数: number;
    胜利次数: number;
    失败次数: number;
    死亡次数: number;
    任务完成次数: number;
    任务失败次数: number;
    跨境挑战次数: number;
    跨境成功次数: number;
    濒死次数: number;
    连续失败次数: number;
    连续胜利次数: number;
    难度调整历史: 难度调整记录[];
    上次调整后回合数: number;
}

export const 默认游戏统计 = (): 游戏统计 => ({
    总回合数: 0,
    战斗次数: 0,
    胜利次数: 0,
    失败次数: 0,
    死亡次数: 0,
    任务完成次数: 0,
    任务失败次数: 0,
    跨境挑战次数: 0,
    跨境成功次数: 0,
    濒死次数: 0,
    连续失败次数: 0,
    连续胜利次数: 0,
    难度调整历史: [],
    上次调整后回合数: 0
});

// === 开局与同人配置 ===

export type 初始关系模板类型 = '独行少系' | '家族牵引' | '师门牵引' | '世家官门' | '青梅旧识' | '旧仇旧债';
export type 关系侧重类型 = '亲情' | '友情' | '师门' | '情缘' | '利益' | '仇怨';
export type 开局切入偏好类型 = '日常低压' | '在途起手' | '家宅起手' | '门派起手' | '风波前夜';
export type 同人来源类型 = '小说' | '动漫' | '游戏' | '影视';
export type 同人融合强度类型 = '轻度映射' | '中度混编' | '显性同台';

export type 酒馆预设消息角色类型 = 'system' | 'user' | 'assistant';

export interface 同人角色替换规则结构 {
    原名称: string;
    替换为: string;
}

export interface 同人融合配置结构 {
    enabled: boolean;
    作品名: string;
    来源类型: 同人来源类型;
    融合强度: 同人融合强度类型;
    保留原著角色: boolean;
    启用角色替换: boolean;
    替换目标角色名: string;
    附加替换角色名列表: string[];
    附加角色替换规则列表: 同人角色替换规则结构[];
    启用附加小说: boolean;
    附加小说数据集ID: string;
}

export interface OpeningConfig {
    初始关系模板: 初始关系模板类型;
    关系侧重: 关系侧重类型[];
    开局切入偏好: 开局切入偏好类型;
    同人融合: 同人融合配置结构;
    /** 选中的开局场景 ID（来自当前子纪元的 openingScenes） */
    selectedSceneId?: string;
    /** 选中的角色原型 ID 列表（来自当前子纪元的 characterArchetypes） */
    selectedArchetypeIds?: string[];
    /** 选中的写作示例 ID 列表（来自当前子纪元的 writingSamples） */
    selectedWritingSampleIds?: string[];
}

export interface WorldGenConfig {
    worldName: string;
    worldSize: '弹丸之地' | '九州宏大' | '无尽位面';
    dynastySetting: string;
    sectDensity: '稀少' | '适中' | '林立';
    tianjiaoSetting: string;
    武力等级: 武力等级;
    nsfw场景类型: NSFW场景类型;
    能力类型: 能力类型;
    超能力分类?: 超能力分类;
    觉醒程度?: 觉醒程度;
    worldExtraRequirement: string;
    manualWorldPrompt: string;
    manualRealmPrompt: string;
    difficulty: 游戏难度;
    时代配置ID?: string;
    古代体系选择?: '武侠' | '志怪' | '双修';
}

export type SaveType = 'manual' | 'auto';

// === 酒馆预设 ===

export interface 酒馆预设提示词结构 {
    identifier: string;
    name?: string;
    role: 酒馆预设消息角色类型;
    content: string;
    system_prompt?: boolean;
}

export interface 酒馆预设顺序项结构 {
    identifier: string;
    enabled: boolean;
}

export interface 酒馆预设顺序结构 {
    character_id: number;
    order: 酒馆预设顺序项结构[];
}

export interface 酒馆预设结构 {
    prompts: 酒馆预设提示词结构[];
    prompt_order: 酒馆预设顺序结构[];
}

export interface 酒馆预设条目结构 {
    id: string;
    名称: string;
    预设: 酒馆预设结构;
    角色ID?: number | null;
    导入时间?: number;
}

// === 游戏设置 ===

export type 行动选项输入模式类型 = '追加' | '替换';

export interface 游戏设置结构 {
    字数要求: number;
    叙事人称: '第一人称' | '第二人称' | '第三人称';
    启用行动选项: boolean;
    行动选项输入模式: 行动选项输入模式类型;
    启用行动选项增强: boolean;
    启用NSFW推进选项: boolean;
    剧情推进速度: 剧情推进速度;
    启用COT伪装注入: boolean;
    启用GPT模式: boolean;
    启用女主剧情规划: boolean;
    启用防止说话: boolean;
    启用真实世界模式: boolean;
    启用免责声明输出: boolean;
    启用标签检测完整性: boolean;
    启用标签修复: boolean;
    启用自动重试: boolean;
    启用NSFW模式: boolean;
    nsfw场景类型: NSFW场景类型;
    成人内容?: boolean;
    校园NSFW设置?: 校园NSFW设置;
    都市网约车NSFW设置?: 都市网约车NSFW设置;
    写真NSFW设置?: 写真NSFW设置; // 写真约拍NSFW子系统（仅现代纪元）
    启用饱腹口渴系统: boolean;
    启用修炼体系: boolean;
    启用里武侠模式: boolean;
    启用里志怪模式: boolean;
    启用子纪元里模式?: Record<string, boolean>;
    子纪元里模式强度?: Record<string, '微暗' | '暧昧' | '露骨'>;
    子纪元里模式阶段?: Record<string, LiModeStage>;
    古代体系选择?: '武侠' | '志怪' | '双修';
    剧情风格: 剧情风格类型;
    NTL后宫档位: NTL后宫档位;
    启用酒馆预设模式: boolean;
    酒馆预设列表?: 酒馆预设条目结构[];
    当前酒馆预设ID?: string | null;
    酒馆提示词后处理?: 酒馆提示词后处理类型;
    酒馆角色卡描述?: string;
    酒馆预设?: 酒馆预设结构 | null;
    酒馆预设角色ID?: number | null;
    酒馆预设名称?: string;
    独立APIGPT模式?: {
        剧情回忆: boolean;
        记忆总结: boolean;
        文章优化: boolean;
        世界演变: boolean;
        变量生成: boolean;
        规划分析: boolean;
        小说拆分: boolean;
    };
    额外提示词: string;
    启用动态难度?: boolean;
}

// === 记忆系统 ===

export interface 记忆配置结构 {
    短期记忆阈值: number;
    中期记忆阈值: number;
    重要角色关键记忆条数N: number;
    NPC记忆总结阈值: number;
    即时消息上传条数N: number;
    短期转中期提示词: string;
    中期转长期提示词: string;
    NPC记忆总结提示词: string;
}

export interface 记忆系统结构 {
    回忆档案: 回忆条目结构[];
    即时记忆: string[];
    短期记忆: string[];
    中期记忆: string[];
    长期记忆: string[];
}

export interface 回忆条目结构 {
    名称: string;
    概括: string;
    原文: string;
    回合: number;
    记录时间: string;
    时间戳: string;
}

// === 聊天与存档 ===

export interface 聊天记录结构 {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    gameTime?: string;
    inputTokens?: number;
    responseDurationSec?: number;
    outputTokens?: number;
    [key: string]: any;
}

export interface 存档元数据结构 {
    schemaVersion?: number;
    历史记录条数?: number;
    历史记录是否裁剪?: boolean;
    自动存档签名?: string;
}

export interface 核心提示词快照结构 {
    世界观母本?: string;
    境界体系?: string;
}

export interface 存档结构 {
    id: number;
    类型: 'manual' | 'auto';
    时间戳: number;
    描述?: string;
    元数据?: 存档元数据结构;
    游戏初始时间?: string;
    角色数据: 角色数据结构;
    环境信息: 环境信息结构;
    历史记录: 聊天记录结构[];

    社交?: NPC结构[];
    世界?: 世界数据结构;
    战斗?: 战斗状态结构;
    玩家门派?: 详细门派结构;
    任务列表?: 任务结构[];
    约定列表?: 约定结构[];
    剧情?: 剧情系统结构;
    剧情规划?: 剧情规划结构;
    女主剧情规划?: 女主剧情规划结构;
    同人剧情规划?: 同人剧情规划结构;
    同人女主剧情规划?: 同人女主剧情规划结构;

    记忆系统?: 记忆系统结构;
    openingConfig?: OpeningConfig;
    游戏设置?: 游戏设置结构;
    记忆配置?: 记忆配置结构;
    视觉设置?: Partial<视觉设置结构>;
    场景图片档案?: 场景图片档案;
    核心提示词快照?: 核心提示词快照结构;
    角色锚点列表?: 角色锚点结构[];
    当前角色锚点ID?: string;
    时代信息?: 时代信息结构;
    校规系统?: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] };
    催眠系统?: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number };
    校园系统?: 校园系统数据;
    写真系统?: 写真系统扩展; // 写真约拍系统（现代纪元NSFW模块）
}

// === 提示词与节日 ===

export type PromptCategory = '核心设定' | '数值设定' | '难度设定' | '写作设定' | '自定义';

export interface 提示词结构 {
    id: string;
    标题: string;
    内容: string;
    类型: PromptCategory;
    启用: boolean;
    版本?: string;
    更新时间?: string;
}

export interface 节日结构 {
    id: string;
    名称: string;
    月: number;
    日: number;
    描述: string;
    效果: string;
}
