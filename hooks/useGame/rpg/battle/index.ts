export { BattleStateMachine, type BattlePhase, type BattleState } from './battleStateMachine';
export {
  calculateCombatStats,
  calculateDamage,
  calculateSkillDamage,
  getBodyPartMultiplier,
  type CombatStats,
  type DamageResult,
} from './damageCalculator';
export {
  calculateInitiative,
  getCurrentActorIndex,
  type InitiativeActor,
} from './initiativeCalculator';
export {
  resolveSkill,
  consumeResource,
  tickCooldowns,
  setCooldown,
  type SkillResolveResult,
} from './skillResolver';
export {
  BuffManager,
  type BuffInstance,
  type BuffEffectType,
  type BuffResolveResult,
} from './buffManager';
