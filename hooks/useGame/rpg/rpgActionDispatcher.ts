/**
 * rpgActionDispatcher.ts
 *
 * RPG UI 操作 → 引擎调用分发器。
 * 将 UI 层的用户操作（战斗指令、装备更换、功法修炼等）转为对应 RPG 引擎调用。
 */

import type { RpgBattleEngine, BattleActor, BattleSnapshot, BattleOutcome } from '../engine/rpgBattleEngine';
import type { RpgEquipEngine, EquipSlots } from '../engine/rpgEquipEngine';
import type { RpgItemEngine } from '../engine/rpgItemEngine';
import type { RpgKungfuEngine } from '../engine/rpgKungfuEngine';
import type { RpgTaskEngine } from '../engine/rpgTaskEngine';
import type { RpgSectEngine } from '../engine/rpgSectEngine';
import type { ActionResult } from '../engine/types';
import type { 游戏物品 } from '../../../models/item';
import type { 任务结构 } from '../../../models/task';
import type { 角色数据结构 } from '../../../models/character';
import type { 功法结构 } from '../../../models/kungfu';

export interface RpgActionDispatcher {
  // ==================== Battle ====================
  setBattleEngine: (engine: RpgBattleEngine) => void;
  initBattle: (actors: BattleActor[]) => void;
  executeAttack: (targetId: string, bodyPart?: string) => ActionResult | null;
  executeSkill: (targetId: string, kungfuId: string, bodyPart?: string) => ActionResult | null;
  executeDefend: () => ActionResult | null;
  advanceTurn: () => void;
  getBattleSnapshot: () => BattleSnapshot | null;
  getBattleOutcome: () => BattleOutcome | null;
  isBattleActive: () => boolean;

  // ==================== Equipment ====================
  setEquipEngine: (engine: RpgEquipEngine) => void;
  equipItem: (slot: keyof EquipSlots, item: 游戏物品) => ActionResult | null;
  unequipItem: (slot: keyof EquipSlots) => ActionResult | null;

  // ==================== Kungfu ====================
  setKungfuEngine: (engine: RpgKungfuEngine) => void;
  learnKungfu: (kungfu: 功法结构) => ActionResult | null;
  cultivateKungfu: (kungfuId: string, proficiencyGain: number) => ActionResult | null;
  cultivateKungfuBatch: (kungfuId: string, totalProficiencyGain: number) => ActionResult | null;
  breakthroughKungfu: (kungfuId: string, character: 角色数据结构) => ActionResult | null;

  // ==================== Task ====================
  setTaskEngine: (engine: RpgTaskEngine) => void;
  acceptTask: (task: 任务结构, playerRealm: string) => ActionResult | null;
  updateTaskProgress: (taskTitle: string, objectiveIndex: number) => ActionResult | null;
  submitTask: (taskTitle: string, character: 角色数据结构) => ActionResult | null;
  failTask: (taskTitle: string, reason?: string) => ActionResult | null;

  // ==================== Sect ====================
  setSectEngine: (engine: RpgSectEngine) => void;
  gainContribution: (amount: number) => ActionResult | null;
  useContribution: (amount: number) => ActionResult | null;
  investConstruction: (funds: number) => ActionResult | null;
  refreshTasks: (missionCountPerType?: number) => ActionResult | null;
  dispatchMember: (memberId: string, postId: string) => ActionResult | null;
  recallMember: (memberId: string) => ActionResult | null;

  // ==================== Item ====================
  setItemEngine: (engine: RpgItemEngine) => void;
  addItem: (item: 游戏物品, quantity?: number) => ActionResult | null;
  removeItem: (itemId: string, quantity?: number) => ActionResult | null;
  useItem: (itemId: string, character: 角色数据结构, quantity?: number) => ActionResult | null;
}

export function createRpgActionDispatcher(): RpgActionDispatcher {
  let battleEngine: RpgBattleEngine | null = null;
  let equipEngine: RpgEquipEngine | null = null;
  let itemEngine: RpgItemEngine | null = null;
  let kungfuEngine: RpgKungfuEngine | null = null;
  let taskEngine: RpgTaskEngine | null = null;
  let sectEngine: RpgSectEngine | null = null;

  const requireBattle = () => { if (!battleEngine) throw new Error('RpgBattleEngine not set'); return battleEngine; };
  const requireEquip = () => { if (!equipEngine) throw new Error('RpgEquipEngine not set'); return equipEngine; };
  const requireItem = () => { if (!itemEngine) throw new Error('RpgItemEngine not set'); return itemEngine; };
  const requireKungfu = () => { if (!kungfuEngine) throw new Error('RpgKungfuEngine not set'); return kungfuEngine; };
  const requireTask = () => { if (!taskEngine) throw new Error('RpgTaskEngine not set'); return taskEngine; };
  const requireSect = () => { if (!sectEngine) throw new Error('RpgSectEngine not set'); return sectEngine; };

  return {
    // Battle
    setBattleEngine: (engine) => { battleEngine = engine; },
    initBattle: (actors) => { requireBattle().initBattle(actors); },
    executeAttack: (targetId, bodyPart) => {
      const engine = requireBattle();
      if (!engine.isActive) return null;
      return engine.executePlayerAction({
        id: `attack-${Date.now()}`,
        engineType: 'rpgBattle',
        type: 'attack',
        payload: { targetId, bodyPart },
        timestamp: Date.now(),
      });
    },
    executeSkill: (targetId, kungfuId, bodyPart) => {
      const engine = requireBattle();
      if (!engine.isActive) return null;
      return engine.executePlayerAction({
        id: `skill-${Date.now()}`,
        engineType: 'rpgBattle',
        type: 'skill_attack',
        payload: { targetId, kungfuId, bodyPart },
        timestamp: Date.now(),
      });
    },
    executeDefend: () => {
      const engine = requireBattle();
      if (!engine.isActive) return null;
      return engine.executePlayerAction({
        id: `defend-${Date.now()}`,
        engineType: 'rpgBattle',
        type: 'defend',
        payload: {},
        timestamp: Date.now(),
      });
    },
    advanceTurn: () => { requireBattle().advanceTurn(); },
    getBattleSnapshot: () => requireBattle().getBattleSnapshot(),
    getBattleOutcome: () => requireBattle().getOutcome(),
    isBattleActive: () => requireBattle().isActive,

    // Equipment
    setEquipEngine: (engine) => { equipEngine = engine; },
    equipItem: (slot, item) => requireEquip().equip(slot, item),
    unequipItem: (slot) => requireEquip().unequip(slot),

    // Item
    setItemEngine: (engine) => { itemEngine = engine; },
    addItem: (item, quantity = 1) => requireItem().addItem(item, quantity),
    removeItem: (itemId, quantity = 1) => requireItem().removeItem(itemId, quantity),
    useItem: (itemId, character, quantity = 1) => requireItem().useItem(itemId, character, quantity),

    // Kungfu
    setKungfuEngine: (engine) => { kungfuEngine = engine; },
    learnKungfu: (kungfu) => requireKungfu().learnKungfu(kungfu),
    cultivateKungfu: (kungfuId, proficiencyGain) => requireKungfu().cultivateKungfu(kungfuId, proficiencyGain),
    cultivateKungfuBatch: (kungfuId, totalProficiencyGain) => requireKungfu().cultivateKungfuBatch(kungfuId, totalProficiencyGain),
    breakthroughKungfu: (kungfuId, character) => requireKungfu().breakthroughKungfu(kungfuId, character),

    // Task
    setTaskEngine: (engine) => { taskEngine = engine; },
    acceptTask: (task, playerRealm) => requireTask().acceptTask(task, playerRealm),
    updateTaskProgress: (taskTitle, objectiveIndex) => requireTask().updateTaskProgress(taskTitle, objectiveIndex),
    submitTask: (taskTitle, character) => requireTask().submitTask(taskTitle, character),
    failTask: (taskTitle, reason) => requireTask().failTask(taskTitle, reason),

    // Sect
    setSectEngine: (engine) => { sectEngine = engine; },
    gainContribution: (amount) => requireSect().gainContribution(amount),
    useContribution: (amount) => requireSect().useContribution(amount),
    investConstruction: (funds) => requireSect().investInConstruction(funds),
    refreshTasks: (missionCountPerType = 2) => requireSect().refreshTasks(missionCountPerType),
    dispatchMember: (memberId, postId) => requireSect().dispatchMember(memberId, postId),
    recallMember: (memberId) => requireSect().recallMember(memberId),
  };
}
