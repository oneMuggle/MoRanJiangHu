/**
 * 模型集中导出
 *
 * 提供单一导入入口，避免消费者使用深层相对路径。
 */

// 核心实体
export type { 角色数据结构, 角色装备, 角色金钱, 玩家BUFF结构, 突破条件结构 } from './character';
export type { 环境信息结构, 环境变量结构, 天气信息结构, 结构化时间信息结构, 环境节日信息结构 } from './environment';
export type { NPC结构, NPC关系边, 服装状态结构 } from './social';
export type { 世界数据结构, 地图结构, 建筑结构, 活跃NPC结构, 游戏时间格式, 地点归属结构 } from './world';
export type { 战斗状态结构, 战斗敌方信息 } from './battle';
export type { 门派成员简报 as 门派状态结构 } from './sect';
export type { 任务结构, 任务状态, 任务类型, 任务目标, 约定结构, 约定状态, 约定性质 } from './task';
export type { 剧情系统结构, 当前章节结构, 下一章预告结构, 历史章节结构, 章节时间校准结构 } from './story';

// 规划
export type { 剧情规划结构, 剧情任务结构, 剧情延续事项结构, 剧情待触发事件结构, 剧情镜头结构, 剧情换章规则结构 } from './storyPlan';
export type { 女主剧情规划结构, 女主阶段推进结构, 女主条目结构, 女主互动事件结构, 女主镜头结构 } from './heroinePlan';
export type { 同人剧情规划结构, 同人对齐信息结构, 同人剧情任务结构, 同人分歧线结构, 同人待触发事件结构, 同人镜头结构, 同人换组规则结构 } from './fandomPlanning/story';
export type { 同人女主剧情规划结构, 同人女主阶段推进结构, 同人女主条目结构, 同人女主互动事件结构, 同人女主镜头结构 } from './fandomPlanning/heroinePlan';

// 配置
export type { 游戏设置结构, 难度调整记录, 游戏统计, OpeningConfig, WorldGenConfig, SaveType, 同人角色替换规则结构, 同人融合配置结构 } from './game-settings';
export type { 视觉设置结构, 字体资源结构, 区域文字样式结构, UI文字样式结构, 图片管理设置结构, 性能监控配置结构 } from './theme-visual';
export type { 接口供应商类型 as API配置结构, 文生图接口配置结构 } from './api-config';
export type { 记忆配置结构 as 记忆设置结构, 记忆系统结构 } from './system';

// 图片与生图
export type {
  生图目标类型, 生图任务状态类型, 生图构图类型, 场景生成类型,
  NPC生图结果, NPC香闺秘档生图结果, 场景生图结果,
  图片管理筛选条件, NPC图片记录, NPC图片档案, 场景图片档案,
  NPC生图任务记录, 场景生图任务记录, 批量生图配置, 香闺秘档部位类型
} from './imageGeneration';

// NSFW 子系统
export type { 校园系统数据, 校规条目, 催眠类型, 催眠能力, 见面预约 } from './campusPhone';
export type { 写真NSFW设置 } from './photographyNSFW';
export type { 都市网约车NSFW设置 } from './urbanDriverNSFW';
export type { 户外NSFW设置 } from './outdoorNSFW';

// 移动设备
export type { DeviceState, DeviceNotification, AppDefinition, DeviceMessage, DeviceContact, DeviceGroup, DeviceGameContext, MobileApp, DeviceForm, DeviceMode } from './mobileDevice';
export type { InstalledApp, AppInstallState } from './installedApps';
export type { AppContentGrade } from './nsfwApps';
export type { AppCategory } from './appRegistry';

// 小说系统
export type { 小说写作任务结构, 小说写作大纲结构, 小说写作角色结构, 小说写作章节结构, 小说写作数据集结构 } from './novelWriting';
export type { 小说拆分任务结构, 小说拆分章节结构, 小说拆分数据集结构 } from './novelDecomposition';

// 时代配置
export type { 时代背景, 体系类型, 时代主题方案, 时代主题方案列表 } from './era-config';
export type { EraManifest, EraAssetPreloadState, EraThemeConfig } from './eraAssets';

// 事件触发
export type { 触发条件, 事件链, 事件状态, 游戏事件, 事件更新 } from './eventTrigger';

// 其他
export type { 功法结构, 功法类型, 功法品质 } from './kungfu';
export type { 物品类型, 物品品质, 装备槽位, 基础物品, 武器, 防具, 饰品 } from './item';
export type { 世界书结构 } from './worldbook';
