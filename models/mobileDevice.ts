// 跨时代移动设备 — 类型定义

// 设备形态枚举
export type DeviceForm =
    | 'stone_tablet'         // 远古：石板刻绘
    | 'jade_token'            // 古代东方：传音玉简
    | 'scroll'                // 古代西方：羊皮信卷
    | 'telegraph'             // 近代：电报机
    | 'mechanical'            // 近代西方：机械通讯器
    | 'smartphone'            // 现代：智能手机
    | 'radio'                 // 废土：对讲机
    | 'data_terminal'         // 近未来：数据终端
    | 'hologram'              // 远未来：全息投影器
    | 'neural_interface'      // 赛博格：神经接口
    | 'consciousness';        // 后人类：意识终端

// 应用程序枚举
export type MobileApp =
    | 'map'                   // 地图
    | 'contacts'              // 通讯录
    | 'chat'                  // 群聊
    | 'forum'                 // 论坛
    | 'news'                  // 资讯
    | 'album'                 // 相册
    | 'tools'                 // 工具
    | 'schedule'              // 课程表（校园特有）
    | 'campus_card'           // 校园卡（校园特有）
    | 'club'                  // 社团（校园特有）
    | 'confession'            // 表白墙（校园特有）
    | 'rules'                 // 校规编辑器（校园特有）
    | 'hypnosis'              // 催眠App（校园特有）
    | 'bdsn';                 // BDSM论坛（校园特有）

// 设备运行模式
export type DeviceMode = 'normal' | 'li';

// 通知类型
export type NotificationType = 'incoming_message' | 'missed_call' | 'news_push' | 'forum_reply' | 'system_alert';

// 设备通讯统计
export interface DeviceStats {
    totalMessagesSent: number;
    totalMessagesReceived: number;
    lastUsedTimestamp: number;
    activeContacts: string[];
    missedNotifications: number;
}

// 通知
export interface DeviceNotification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    relatedMessageId?: string;
    relatedApp?: MobileApp;
}

// 设备状态
export interface DeviceState {
    isOpen: boolean;
    activeApp: MobileApp | null;
    mode: DeviceMode;
    messages: DeviceMessage[];
    stats: DeviceStats;
    notifications: DeviceNotification[];
}

// 设备能力
export interface DeviceCapabilities {
    hasGPS: boolean;
    hasVocalInput: boolean;
    hasTextInput: boolean;
    hasProjection: boolean;       // 全息投影
    hasNeuralLink: boolean;       // 神经链接
    hasAR: boolean;               // AR叠加
    通讯范围: string;
    能源类型: '体力' | '真气' | '灵力' | '电力' | '太阳能' | '量子' | '意识';
}

// 设备配置接口
export interface DeviceConfig {
    deviceId: string;
    deviceName: string;           // 设备名称（时代化）
    deviceForm: DeviceForm;
    eraId: string;
    apps: MobileApp[];
    uiStyle: 'ancient' | 'modern' | 'retro' | 'tech' | 'holographic' | 'consciousness';
    capabilities: DeviceCapabilities;
    // 表模式应用名称（时代化）
    normalAppNames?: Partial<Record<MobileApp, string>>;
    // 里模式覆盖
    liModeOverrides?: {
        appNames?: Partial<Record<MobileApp, string>>;  // 里模式应用名
        themeColor?: string;      // 里模式主题色
        uiStyleOverride?: string; // 里模式 UI 风格覆盖
    };
}

// 设备状态
export interface DeviceState {
    isOpen: boolean;
    activeApp: MobileApp | null;
    mode: DeviceMode;
}

// 应用定义
export interface AppDefinition {
    id: MobileApp;
    normalName: string;    // 正常模式名称
    liName: string;        // 里模式名称
    icon: string;          // 图标标识
}

// 消息结构
export interface DeviceMessage {
    id: string;
    type: 'map' | 'chat' | 'forum' | 'news' | 'schedule' | 'campus_card' | 'club' | 'confession' | 'rules' | 'hypnosis';
    title: string;
    content: string;
    sender?: string;
    timestamp: number;
    location?: { x: number; y: number };
    tags?: string[];
}

// 联系人
export interface DeviceContact {
    id: string;
    name: string;
    relation: string;
    description: string;
    lastContact?: number;
    location?: { x: number; y: number };
}

// 群组
export interface DeviceGroup {
    id: string;
    name: string;
    type: 'tribe' | 'sect' | 'faction' | 'modern' | 'neural';
    members: string[];
    lastMessage?: DeviceMessage;
}

// ============================================================
// 游戏状态上下文 — 设备 App 需要的数据子集
// ============================================================

import type { NPC结构 } from './domain/social';
import type { 世界数据结构 } from './game/world';
import type { 剧情系统结构 } from './game/story';
import type { 角色数据结构 } from './domain/character';
import type { 聊天记录结构, 校规条目, 校规影响日志, 催眠记录, 催眠App等级 } from '../types';
import type { 校园系统数据 } from './campusPhone';

export interface DeviceGameContext {
    角色: 角色数据结构 | null;
    社交: NPC结构[];
    世界: 世界数据结构 | null;
    剧情: 剧情系统结构 | null;
    历史记录: 聊天记录结构[];
    // 校园系统
    校规系统?: { 校规列表: 校规条目[]; 影响日志: 校规影响日志[] };
    催眠系统?: { 催眠记录列表: 催眠记录[]; app等级: 催眠App等级; 累计使用次数: number };
    校园系统?: 校园系统数据;
}
