/**
 * 校园 NSFW 深化系统数据模型 — 模块化入口
 *
 * v1.0: 欲望状态机、关系轨道、后果系统、地点系统
 * v1.1: 露出系统、公开隐秘侵犯、旁观者系统、网络传播、校园活动
 * v1.2: SM/支配服从系统（权力天平、服从度、契约）
 * v1.3: 桌游社交 NSFW 系统（密室逃脱、狼人杀、剧本杀、派对游戏）
 * v1.4: 校园祭 NSFW 深化系统
 */

// v1.0 核心
export type {
  欲望阶段,
  关系轨道,
  权力倾向,
  NPC欲望档案,
  里程碑类型,
  亲密里程碑,
  后果类型,
  后果记录,
  解锁条件,
  校园NSFW地点,
} from './core';

// v1.1 露出
export type {
  露出偏好等级,
  露出状态,
  露出场景配置,
  旁观者反应,
  旁观者,
  紧张度状态,
  网络流言状态,
  校园活动,
} from './exposure';

// v1.2 SM
export type {
  权力天平状态,
  服从度状态,
  契约类型,
  契约状态,
  契约记录,
  SM场景类型,
  SM场景记录,
} from './sm';

// v1.3 桌游
export type {
  桌游类型,
  密室主题,
  密室逃脱状态,
  狼人杀状态,
  剧本杀状态,
  派对游戏状态,
  桌游状态,
} from './party-games';

// v1.4 校园祭
export type {
  校园祭阶段,
  摊位类型,
  校园祭主题,
  舞台表演类型,
  后夜祭状态,
  校园祭状态,
} from './festival';

// 设置类型
export interface 校园NSFW设置 {
  启用校园NSFW深化系统: boolean;
  NSFW内容强度: '微暗' | '暧昧' | '露骨';
  启用后果系统: boolean;
  启用多角关系: boolean;
  启用露出系统: boolean;
  露出内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用公开隐秘侵犯: boolean;
  启用旁观者反应: boolean;
  启用网络传播: boolean;
  校园活动NSFW频率: '关闭' | '低' | '中' | '高';
  启用SM系统: boolean;
  SM内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用契约系统: boolean;
  启用公开服从: boolean;
  权力天平初始倾向: '随机' | 'NPC支配' | 'NPC服从' | '切换者';
  启用桌游NSFW: boolean;
  桌游NSFW强度: '关闭' | '轻度' | '中度' | '深度';
  启用密室逃脱NSFW: boolean;
  启用狼人杀NSFW: boolean;
  启用剧本杀NSFW: boolean;
  启用派对游戏NSFW: boolean;
  桌游触发频率: '低' | '中' | '高';
  启用校园祭NSFW: boolean;
  校园祭NSFW强度: '关闭' | '轻度' | '中度' | '深度';
  启用后夜祭告白: boolean;
  启用摊位NSFW: boolean;
  启用舞台NSFW: boolean;
  校园祭频率: '每学期一次' | '每学年一次' | '随机';
}

export const 默认校园NSFW设置: 校园NSFW设置 = {
  启用校园NSFW深化系统: false,
  NSFW内容强度: '暧昧',
  启用后果系统: true,
  启用多角关系: false,
  启用露出系统: false,
  露出内容强度: '关闭',
  启用公开隐秘侵犯: false,
  启用旁观者反应: false,
  启用网络传播: false,
  校园活动NSFW频率: '关闭',
  启用SM系统: false,
  SM内容强度: '关闭',
  启用契约系统: false,
  启用公开服从: false,
  权力天平初始倾向: '随机',
  启用桌游NSFW: false,
  桌游NSFW强度: '关闭',
  启用密室逃脱NSFW: false,
  启用狼人杀NSFW: false,
  启用剧本杀NSFW: false,
  启用派对游戏NSFW: false,
  桌游触发频率: '中',
  启用校园祭NSFW: false,
  校园祭NSFW强度: '关闭',
  启用后夜祭告白: false,
  启用摊位NSFW: false,
  启用舞台NSFW: false,
  校园祭频率: '每学年一次',
};

// 挂载点接口
export interface 校园NSFW系统扩展 {
  欲望系统?: {
    NPC欲望档案: Record<string, import('./core').NPC欲望档案>;
    里程碑列表: import('./core').亲密里程碑[];
    后果列表: import('./core').后果记录[];
    已解锁地点: string[];
    露出场景解锁: string[];
    当前活动?: import('./exposure').校园活动;
    旁观者记录: import('./exposure').旁观者[];
    活动专属回忆: { 活动Id: string; NPCid: string; 描述: string }[];
    SM场景池: import('./sm').SM场景记录[];
    契约列表: import('./sm').契约记录[];
    指令队列: { NPCid: string; 指令: string; 截止时间: string; 状态: '待执行' | '已完成' | '已拒绝' | '已过期' }[];
    桌游状态?: import('./party-games').桌游状态;
    校园祭状态?: import('./festival').校园祭状态;
  };
}
