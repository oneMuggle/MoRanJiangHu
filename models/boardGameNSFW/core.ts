/**
 * 桌游社交 NSFW 系统 — 核心类型定义
 *
 * 从 campusNSFW/party-games.ts 迁移，去校园化
 */

export type 桌游类型 =
  | '密室逃脱' | '狼人杀' | '剧本杀'
  | '真心话大冒险' | '国王游戏'
  | '大富翁' | '棋牌游戏' | '骰子游戏';
export type 密室主题 = '古宅惊魂' | '古墓迷踪' | '末日地堡' | '魔法学院' | '医院密室' | '温泉旅馆';

export type 大富翁地产 =
  | '温泉旅馆' | '私人海滩' | '豪华套房' | '秘密花园'
  | '情侣包厢' | '星空帐篷' | '地下密室' | '天台酒吧';

export type 棋牌游戏子类型 = '扑克' | '麻将' | '象棋' | '自创卡牌';

export type 骰子面类型 =
  | '轻抚' | '亲吻' | '拥抱' | '低语'
  | '脱衣' | '惩罚' | '豁免' | '翻倍';

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

export interface 大富翁状态 {
  当前地产: 大富翁地产;
  玩家资产: number;
  NPC资产: number;
  当前回合: number;
  总回合数: number;
  已购地产权: 大富翁地产[];
  惩罚债务: { 债务人: string; 债权人: string; 惩罚描述: string; 等级: number }[];
  骰子点数总和: number;
  已触发NSFW场景: boolean;
  随机遭遇次数: number;
  NPC情绪: '得意' | '沮丧' | '兴奋' | '紧张' | '期待';
}

export interface 棋牌游戏状态 {
  游戏子类型: 棋牌游戏子类型;
  玩家手牌: string[];
  NPC手牌: string[];
  当前轮次: number;
  玩家胜局: number;
  NPC胜局: number;
  总轮次: number;
  已使用Bluff次数: number;
  押注NSFW指令: { 押注者: string; 指令: string; 等级: number; 已结算: boolean }[];
  连败惩罚累积: number;
  已触发NSFW场景: boolean;
  心理战阶段: '试探' | '博弈' | '决战';
}

export interface 骰子游戏状态 {
  骰子面配置: 骰子面类型[];
  最近投掷结果: 骰子面类型;
  历史投掷: 骰子面类型[];
  累计效应: number;
  当前回合: number;
  总回合数: number;
  连续相同面次数: number;
  已触发NSFW场景: boolean;
  最大累积等级: number;
  骰子数量: number;
}

export interface 桌游状态 {
  当前桌游: 密室逃脱状态 | 狼人杀状态 | 剧本杀状态 | 派对游戏状态 | 大富翁状态 | 棋牌游戏状态 | 骰子游戏状态 | null;
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
