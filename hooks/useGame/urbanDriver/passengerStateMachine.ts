/**
 * SLG + AI 混合架构 — 网约车乘客状态机
 *
 * 强化药物/醉酒状态的衰减模型，欲望阶段推进。
 */

export type DesireStage = '克制' | '试探' | '渴望' | '沉沦' | '支配';
export type RelationshipTrack = '纯爱' | '暧昧' | '肉体' | '支配' | '交易';

export interface PassengerState {
  desireStage: DesireStage;
  desireProgress: number;            // 0-100
  intoxication: '清醒' | '微醺' | '醉酒' | '烂醉';
  intoxicationLevel: number;         // 0-100
  drugType: '迷药' | '安眠药' | '兴奋剂' | '未知' | null;
  drugPotency: number;               // 0-100
  drugClarity: number;               // 意识清晰度 0-100
  relationshipTrack: RelationshipTrack;
  trackProgress: number;             // 0-100
}

export interface DecayRates {
  intoxicationDecay: number;         // 每回合醉酒衰减值
  drugPotencyDecay: number;          // 每回合药物衰减值
  drugClarityRecovery: number;       // 每回合意识恢复值
  desireProgressDecay: number;       // 欲望进度回退值（仅在高阶段）
}

export const DEFAULT_DECAY_RATES: DecayRates = {
  intoxicationDecay: 5,
  drugPotencyDecay: 8,
  drugClarityRecovery: 3,
  desireProgressDecay: 0,
};

const DESIRE_STAGE_ORDER: DesireStage[] = ['克制', '试探', '渴望', '沉沦', '支配'];

export class PassengerStateMachine {
  private _state: PassengerState;
  private _decayRates: DecayRates;

  constructor(initial?: Partial<PassengerState>, decayRates?: Partial<DecayRates>) {
    this._state = {
      desireStage: '克制',
      desireProgress: 0,
      intoxication: '清醒',
      intoxicationLevel: 0,
      drugType: null,
      drugPotency: 0,
      drugClarity: 100,
      relationshipTrack: '暧昧',
      trackProgress: 0,
      ...initial,
    };
    this._decayRates = { ...DEFAULT_DECAY_RATES, ...decayRates };
  }

  getState(): Readonly<PassengerState> {
    return { ...this._state };
  }

  advanceDesireProgress(amount: number, trackMultiplier: number = 1.0): void {
    const trackCoefficients: Record<RelationshipTrack, number> = {
      '纯爱': 0.8, '暧昧': 1.0, '肉体': 1.3, '支配': 1.2, '交易': 1.5,
    };
    const adjusted = amount * trackCoefficients[this._state.relationshipTrack] * trackMultiplier;
    this._state.desireProgress = Math.min(100, this._state.desireProgress + adjusted);

    if (this._state.desireProgress >= 100) {
      this._upgradeDesireStage();
    }
  }

  decayTurn(): DecayResult {
    const changes: string[] = [];

    if (this._state.intoxication !== '清醒') {
      const before = this._state.intoxicationLevel;
      this._state.intoxicationLevel = Math.max(0, this._state.intoxicationLevel - this._decayRates.intoxicationDecay);
      this._updateIntoxicationLevel();
      if (this._state.intoxicationLevel !== before) {
        changes.push(`醉酒衰减: ${before} → ${this._state.intoxicationLevel}`);
      }
    }

    if (this._state.drugType !== null && this._state.drugPotency > 0) {
      const beforePotency = this._state.drugPotency;
      const beforeClarity = this._state.drugClarity;

      this._state.drugPotency = Math.max(0, this._state.drugPotency - this._decayRates.drugPotencyDecay);
      this._state.drugClarity = Math.min(100, this._state.drugClarity + this._decayRates.drugClarityRecovery);

      if (this._state.drugPotency === 0) {
        this._state.drugType = null;
        changes.push('药物效果完全消退');
      } else if (this._state.drugPotency !== beforePotency) {
        changes.push(`药物强度: ${beforePotency} → ${this._state.drugPotency}`);
      }
      if (this._state.drugClarity !== beforeClarity) {
        changes.push(`意识恢复: ${beforeClarity} → ${this._state.drugClarity}`);
      }
    }

    if (this._state.desireStage === '沉沦' || this._state.desireStage === '支配') {
      this._state.desireProgress = Math.max(0, this._state.desireProgress - this._decayRates.desireProgressDecay);
    }

    return { changes, state: this.getState() };
  }

  applyIntoxication(amount: '少量' | '中量' | '大量'): void {
    const boosts: Record<string, number> = { '少量': 15, '中量': 35, '大量': 60 };
    this._state.intoxicationLevel = Math.min(100, this._state.intoxicationLevel + boosts[amount]);
    this._updateIntoxicationLevel();
  }

  applyDrug(type: '迷药' | '安眠药' | '兴奋剂' | '未知', potency: number): void {
    this._state.drugType = type;
    this._state.drugPotency = Math.min(100, potency);
    this._state.drugClarity = Math.max(0, 100 - potency);
  }

  setRelationshipTrack(track: RelationshipTrack): void {
    this._state.relationshipTrack = track;
  }

  private _upgradeDesireStage(): void {
    const currentIndex = DESIRE_STAGE_ORDER.indexOf(this._state.desireStage);
    if (currentIndex < DESIRE_STAGE_ORDER.length - 1) {
      this._state.desireStage = DESIRE_STAGE_ORDER[currentIndex + 1];
      this._state.desireProgress = 0;
    }
  }

  private _updateIntoxicationLevel(): void {
    const level = this._state.intoxicationLevel;
    if (level >= 75) this._state.intoxication = '烂醉';
    else if (level >= 40) this._state.intoxication = '醉酒';
    else if (level >= 15) this._state.intoxication = '微醺';
    else this._state.intoxication = '清醒';
  }
}

export interface DecayResult {
  changes: string[];
  state: Readonly<PassengerState>;
}

export function createPassengerStateMachine(
  initial?: Partial<PassengerState>,
  decayRates?: Partial<DecayRates>
): PassengerStateMachine {
  return new PassengerStateMachine(initial, decayRates);
}
