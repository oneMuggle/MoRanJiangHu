/**
 * Combat Director - 战斗导演
 * 负责战斗判定、技能效果、胜负结算
 */

import { BaseDirector } from './BaseDirector';
import type { DirectorContext, CombatDecision } from '../types';
import { 战斗导演_角色提示 } from '../prompts/directorCore';
import { 战斗导演_提示词 } from '../prompts/rolePrompts';

/**
 * 战斗导演
 * 负责战斗系统的判定与结算
 */
export class CombatDirector extends BaseDirector {
  constructor() {
    super('combat', 战斗导演_角色提示);
  }

  /**
   * 分析上下文并做出战斗决策
   */
  async analyze(context: DirectorContext): Promise<CombatDecision> {
    if (!this.validateContext(context)) {
      return this.createDefaultDecision();
    }

    const { gameState, characterState, currentScene } = context;

    // 解析战斗信息
    const combatInfo = this.parseCombatInfo(gameState, currentScene);
    
    // 计算伤害
    const damage = this.calculateDamage(combatInfo);
    
    // 判定命中
    const hitResult = this.judgeHit(combatInfo);
    
    // 生成战斗决策
    const decision = this.generateCombatDecision(damage, hitResult, combatInfo);

    return {
      ...this.createBaseDecision(
        decision.核心决策,
        decision.事件列表,
        decision.变量更新,
        decision.置信度,
        decision.理由
      ),
      damage: decision.伤害值,
      skillEffects: decision.技能效果,
      combatPhase: decision.战斗阶段,
    } as CombatDecision;
  }

  /**
   * 解析战斗信息
   */
  private parseCombatInfo(
    gameState: DirectorContext['gameState'],
    currentScene: DirectorContext['currentScene']
  ): {
    attacker: CharacterCombatInfo;
    defender: CharacterCombatInfo;
    round: number;
    terrain: string;
    weather: string;
  } {
    // 从场景中获取战斗信息
    const combatData = (currentScene as any).战斗数据 || {};
    const enemies = (currentScene as any).敌人列表 || [];

    const defaultChar: CharacterCombatInfo = {
      name: characterState.姓名 || '玩家',
      attack: (characterState as any).攻击力 || 10,
      defense: (characterState as any).防御力 || 5,
      hp: characterState.生命值 || 100,
      maxHp: characterState.最大生命值 || 100,
      mp: characterState.内力值 || 50,
      skills: (characterState as any).技能列表 || [],
    };

    const enemy = enemies[0] || {
      name: '敌人',
      attack: 8,
      defense: 3,
      hp: 80,
      maxHp: 80,
      mp: 30,
      skills: [],
    };

    return {
      attacker: defaultChar,
      defender: enemy as CharacterCombatInfo,
      round: combatData.回合 || 1,
      terrain: (currentScene as any).地形 || '平原',
      weather: (gameState as any).天气 || '晴',
    };
  }

  /**
   * 计算伤害
   */
  private calculateDamage(combatInfo: ReturnType<typeof this.parseCombatInfo>): {
    finalDamage: number;
    isCritical: boolean;
    blocked: boolean;
  } {
    const { attacker, defender } = combatInfo;

    // 基础伤害 = 攻击力 × (1 - 防御减伤比)
    const defenseRatio = Math.min(defender.defense / (attacker.attack + defender.defense), 0.7);
    const baseDamage = Math.floor(attacker.attack * (1 - defenseRatio));
    
    // 随机波动 ±20%
    const variance = 0.8 + Math.random() * 0.4;
    let finalDamage = Math.floor(baseDamage * variance);

    // 暴击判定 10% 概率
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
      finalDamage = Math.floor(finalDamage * 1.5);
    }

    // 格挡判定 15% 概率
    const blocked = Math.random() < 0.15;
    if (blocked) {
      finalDamage = Math.floor(finalDamage * 0.3);
    }

    return { finalDamage, isCritical, blocked };
  }

  /**
   * 判定命中
   */
  private judgeHit(combatInfo: ReturnType<typeof this.parseCombatInfo>): {
    hit: boolean;
    hitRate: number;
    dodgeRate: number;
  } {
    const { attacker, defender, terrain, weather } = combatInfo;

    // 基础命中率 = 75%
    let hitRate = 75;

    // 地形修正
    const terrainMod: Record<string, number> = {
      '山地': -10,
      '树林': -5,
      '水域': -5,
      '室内': 5,
      '平原': 0,
    };
    hitRate += terrainMod[terrain] || 0;

    // 天气修正
    const weatherMod: Record<string, number> = {
      '雨天': -10,
      '雪天': -5,
      '大风': -5,
      '晴天': 0,
      '夜晚': -5,
    };
    hitRate += weatherMod[weather] || 0;

    // 闪避率（防御方）
    const dodgeRate = Math.min(defender.defense * 2, 30);

    // 最终命中率
    const finalHitRate = Math.max(20, Math.min(95, hitRate - dodgeRate / 2));
    const hit = Math.random() * 100 < finalHitRate;

    return { hit, hitRate: finalHitRate, dodgeRate };
  }

  /**
   * 生成战斗决策
   */
  private generateCombatDecision(
    damageResult: { finalDamage: number; isCritical: boolean; blocked: boolean },
    hitResult: { hit: boolean; hitRate: number; dodgeRate: number },
    combatInfo: ReturnType<typeof this.parseCombatInfo>
  ): {
    核心决策: string;
    事件列表: string[];
    变量更新: Record<string, unknown>;
    置信度: number;
    理由: string;
    伤害值: number;
    技能效果: string[];
    战斗阶段: 'initiation' | 'action' | 'counter' | 'resolution';
  } {
    const events: string[] = [];
    const variables: Record<string, unknown> = {};
    const skillEffects: string[] = [];

    let combatPhase: 'initiation' | 'action' | 'counter' | 'resolution' = 'action';
    let coreDecision = '';
    let damage = 0;

    if (!hitResult.hit) {
      // 未命中
      coreDecision = `${combatInfo.defender.name}闪避了攻击`;
      events.push(`未命中！${combatInfo.defender.name}躲避了攻击`);
      variables.闪避 = true;
    } else {
      damage = damageResult.finalDamage;

      if (damageResult.blocked) {
        events.push(`攻击被格挡！造成${damage}点伤害`);
        skillEffects.push('格挡');
      } else if (damageResult.isCritical) {
        events.push(`暴击！造成${damage}点伤害！`);
        skillEffects.push('暴击');
        variables.暴击 = true;
      } else {
        events.push(`命中！造成${damage}点伤害`);
      }

      // 更新敌人生命值
      variables.敌人生命变化 = -damage;

      // 检查是否击败敌人
      if (combatInfo.defender.hp - damage <= 0) {
        combatPhase = 'resolution';
        coreDecision = `击败了${combatInfo.defender.name}！`;
        events.push('战斗胜利！');
        variables.战斗胜利 = true;
        variables.敌人生命 = 0;
      } else {
        coreDecision = `对${combatInfo.defender.name}造成${damage}点伤害`;
        variables.敌人生命 = combatInfo.defender.hp - damage;
      }
    }

    // 战斗阶段判断
    if (combatInfo.round === 1) {
      combatPhase = 'initiation';
    } else if ((combatInfo.defender.hp - damage) <= combatInfo.defender.maxHp * 0.3) {
      combatPhase = 'counter';
    }

    return {
      核心决策: coreDecision,
      事件列表: events,
      变量更新: variables,
      置信度: 0.9,
      理由: `命中率${hitResult.hitRate}%，基于双方属性计算`,
      伤害值: damage,
      技能效果: skillEffects,
      战斗阶段: combatPhase,
    };
  }

  /**
   * 创建默认决策
   */
  private createDefaultDecision(): CombatDecision {
    return {
      role: 'combat',
      decision: '等待战斗',
      events: [],
      variables: {},
      confidence: 0.5,
      reasoning: '默认决策',
      damage: 0,
      skillEffects: [],
      combatPhase: 'initiation',
    };
  }
}

/**
 * 角色战斗信息
 */
interface CharacterCombatInfo {
  name: string;
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
  mp: number;
  skills: string[];
}
