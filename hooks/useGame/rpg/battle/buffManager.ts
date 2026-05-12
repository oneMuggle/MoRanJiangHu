/**
 * buffManager.ts
 *
 * Buff 管理器 — 管理战斗中的增益/减益效果
 *
 * Buff 类型:
 * - 增益: 攻击力提升、防御力提升、速度提升、生命恢复
 * - 减益: 攻击力下降、防御力下降、速度下降、持续伤害(中毒/流血)
 * - 控制: 眩晕、沉默、定身
 */

/** Buff 实例 */
export interface BuffInstance {
  /** 唯一 ID */
  id: string;
  /** Buff 名称 */
  name: string;
  /** 剩余回合数 */
  remainingTurns: number;
  /** 最大回合数 */
  maxTurns: number;
  /** Buff 类型 */
  buffType: 'buff' | 'debuff' | 'control';
  /** 效果类型 */
  effectType: BuffEffectType;
  /** 效果值 */
  value: number;
  /** 是否百分比 */
  isPercentage: boolean;
  /** 来源技能 ID */
  sourceSkillId?: string;
}

export type BuffEffectType =
  | 'attack_modify'
  | 'defense_modify'
  | 'speed_modify'
  | 'crit_rate_modify'
  | 'dodge_rate_modify'
  | 'hp_regen'
  | 'damage_over_time'
  | 'stun'
  | 'silence'
  | 'root';

/** Buff 结算结果 */
export interface BuffResolveResult {
  /** 应用后的攻击修正值 */
  attackModifier: number;
  /** 应用后的防御修正值 */
  defenseModifier: number;
  /** 应用后的速度修正值 */
  speedModifier: number;
  /** 应用后的暴击率修正值 */
  critRateModifier: number;
  /** 应用后的闪避率修正值 */
  dodgeRateModifier: number;
  /** 持续伤害总和 */
  damageOverTime: number;
  /** 生命恢复总和 */
  hpRegen: number;
  /** 是否被眩晕（无法行动） */
  isStunned: boolean;
  /** 是否被沉默（无法使用技能） */
  isSilenced: boolean;
  /** 是否被定身（无法闪避） */
  isRooted: boolean;
}

export class BuffManager {
  private _buffs: Map<string, BuffInstance[]> = new Map(); // actor ID -> buffs

  /**
   * 为指定角色添加 Buff
   */
  addBuff(actorId: string, buff: Omit<BuffInstance, 'id'>): string {
    const id = `buff-${actorId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const instance: BuffInstance = { ...buff, id };

    const actorBuffs = this._buffs.get(actorId) ?? [];
    actorBuffs.push(instance);
    this._buffs.set(actorId, actorBuffs);

    return id;
  }

  /**
   * 移除指定 Buff
   */
  removeBuff(actorId: string, buffId: string): void {
    const actorBuffs = this._buffs.get(actorId) ?? [];
    this._buffs.set(
      actorId,
      actorBuffs.filter((b) => b.id !== buffId),
    );
  }

  /**
   * 结算所有 Buff（每回合调用）
   * - 递减回合数
   * - 移除过期 Buff
   * - 计算 DoT/HoT
   */
  resolve(actorId: string): BuffResolveResult {
    const actorBuffs = this._buffs.get(actorId) ?? [];
    const result: BuffResolveResult = {
      attackModifier: 0,
      defenseModifier: 0,
      speedModifier: 0,
      critRateModifier: 0,
      dodgeRateModifier: 0,
      damageOverTime: 0,
      hpRegen: 0,
      isStunned: false,
      isSilenced: false,
      isRooted: false,
    };

    const remaining: BuffInstance[] = [];

    for (const buff of actorBuffs) {
      const newRemaining = buff.remainingTurns - 1;

      if (newRemaining <= 0) {
        // Buff 过期，移除
        continue;
      }

      remaining.push({ ...buff, remainingTurns: newRemaining });

      // 应用效果
      this._applyEffect(buff, result);
    }

    this._buffs.set(actorId, remaining);
    return result;
  }

  /**
   * 获取指定角色的所有 Buff
   */
  getBuffs(actorId: string): BuffInstance[] {
    return [...(this._buffs.get(actorId) ?? [])];
  }

  /**
   * 获取指定角色的 Buff 修正（不消耗回合）
   */
  getModifiers(actorId: string): BuffResolveResult {
    const actorBuffs = this._buffs.get(actorId) ?? [];
    const result: BuffResolveResult = {
      attackModifier: 0,
      defenseModifier: 0,
      speedModifier: 0,
      critRateModifier: 0,
      dodgeRateModifier: 0,
      damageOverTime: 0,
      hpRegen: 0,
      isStunned: false,
      isSilenced: false,
      isRooted: false,
    };

    for (const buff of actorBuffs) {
      this._applyEffect(buff, result);
    }

    return result;
  }

  /**
   * 清空所有 Buff
   */
  clear(): void {
    this._buffs.clear();
  }

  private _applyEffect(buff: BuffInstance, result: BuffResolveResult): void {
    const value = buff.isPercentage ? buff.value / 100 : buff.value;

    switch (buff.effectType) {
      case 'attack_modify':
        result.attackModifier += buff.isPercentage ? value : Math.round(value);
        break;
      case 'defense_modify':
        result.defenseModifier += buff.isPercentage ? value : Math.round(value);
        break;
      case 'speed_modify':
        result.speedModifier += buff.isPercentage ? value : Math.round(value);
        break;
      case 'crit_rate_modify':
        result.critRateModifier += value;
        break;
      case 'dodge_rate_modify':
        result.dodgeRateModifier += value;
        break;
      case 'hp_regen':
        result.hpRegen += Math.round(value);
        break;
      case 'damage_over_time':
        result.damageOverTime += Math.round(value);
        break;
      case 'stun':
        result.isStunned = true;
        break;
      case 'silence':
        result.isSilenced = true;
        break;
      case 'root':
        result.isRooted = true;
        break;
    }
  }
}
