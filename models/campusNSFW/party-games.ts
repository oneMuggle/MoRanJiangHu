/**
 * 校园 NSFW v1.3 桌游社交系统
 * 密室逃脱、狼人杀、剧本杀、派对游戏
 */

export type 桌游类型 = '密室逃脱' | '狼人杀' | '剧本杀' | '真心话大冒险' | '国王游戏';
export type 密室主题 = '古宅惊魂' | '古墓迷踪' | '末日地堡' | '魔法学院' | '医院密室' | '温泉旅馆';

export interface 密室逃脱状态 {
  当前主题: 密室主题;
  已通关房间数: number;
  总房间数: number;
  独处事件次数: number;
  黑暗中共处次数: number;
  已触发NSFW场景: boolean;
  逃脱成功率: number;
  NPC表现: '害怕' | '冷静' | '兴奋' | '依赖';
  羁绊加成: number;
}

export interface 狼人杀状态 {
  NPC角色: '狼人' | '预言家' | '女巫' | '猎人' | '平民' | '守卫';
  玩家角色: string;
  当前轮次: number;
  已出局玩家: string[];
  私下结盟发生: boolean;
  结盟NPC?: string;
  结盟条件?: string;
  是否已私下互动: boolean;
  游戏结果: '好人胜利' | '狼人胜利' | '进行中';
}

export interface 剧本杀状态 {
  剧本名称: string;
  玩家角色名: string;
  NPC角色名: string;
  CP关系: boolean;
  当前幕: number;
  总幕数: number;
  情感线进度: '无' | '初遇' | '暧昧' | '告白' | '冲突' | '结局';
  已触发剧本NSFW: boolean;
  剧本与现实模糊度: number;
  搜身发生: boolean;
  秘密交换发生: boolean;
}

export interface 派对游戏状态 {
  游戏类型: '真心话大冒险' | '国王游戏';
  参与人数: number;
  参与NPC列表: string[];
  当前回合: number;
  NSFW指令已触发: boolean;
  已执行指令列表: { 执行者: string; 指令: string; 等级: number }[];
  紧张氛围: number;
  酒后状态: boolean;
}

export interface 桌游状态 {
  当前桌游: 密室逃脱状态 | 狼人杀状态 | 剧本杀状态 | 派对游戏状态 | null;
  桌游类型: 桌游类型 | null;
  历史桌游记录: {
    类型: string;
    日期: string;
    参与NPC: string[];
    触发NSFW场景数: number;
    里程碑: string[];
  }[];
  桌游偏好: Record<string, number>;
}
