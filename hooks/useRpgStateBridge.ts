/**
 * useRpgStateBridge.ts
 *
 * RPG 引擎状态 → React 状态桥接层。
 * 将 RpgBattleEngine 等 RPG 引擎的内部状态映射为 UI 可消费的 React state。
 */

import * as React from 'react';
import type { RpgBattleEngine, BattleSnapshot, BattleLogEntry, BattleOutcome } from './useGame/engine/rpgBattleEngine';
import type { RpgEquipEngine } from './useGame/engine/rpgEquipEngine';
import type { RpgKungfuEngine } from './useGame/engine/rpgKungfuEngine';
import type { RpgTaskEngine } from './useGame/engine/rpgTaskEngine';
import type { RpgSectEngine } from './useGame/engine/rpgSectEngine';
import type { RpgItemEngine } from './useGame/engine/rpgItemEngine';
import type { CombatStats } from './useGame/rpg/battle/damageCalculator';
import type { BattlePhase } from './useGame/rpg/battle/battleStateMachine';
import type { PlayerAction } from './useGame/engine/types';
import type { 功法结构 } from '../models/kungfu';
import type { 任务结构 } from '../models/task';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import { createRpgBattleEngine } from './useGame/engine/rpgBattleEngine';
import { createRpgEquipEngine } from './useGame/engine/rpgEquipEngine';
import { createRpgItemEngine } from './useGame/engine/rpgItemEngine';
import { createRpgKungfuEngine } from './useGame/engine/rpgKungfuEngine';
import { createRpgTaskEngine } from './useGame/engine/rpgTaskEngine';
import { createRpgSectEngine } from './useGame/engine/rpgSectEngine';
import { createRpgActionDispatcher, type RpgActionDispatcher } from './useGame/rpg/rpgActionDispatcher';

// ==================== Shared singleton engine instances ====================
// All components calling useRpgStateBridge() share these same engine instances.
// Engines are lazily created on first access.

let _sharedBattleEngine: RpgBattleEngine | null = null;
let _sharedEquipEngine: RpgEquipEngine | null = null;
let _sharedItemEngine: RpgItemEngine | null = null;
let _sharedKungfuEngine: RpgKungfuEngine | null = null;
let _sharedTaskEngine: RpgTaskEngine | null = null;
let _sharedSectEngine: RpgSectEngine | null = null;
let _sharedDispatcher: RpgActionDispatcher | null = null;

function getBattleEngine(): RpgBattleEngine {
  if (!_sharedBattleEngine) {
    _sharedBattleEngine = createRpgBattleEngine();
  }
  return _sharedBattleEngine;
}

function getEquipEngine(): RpgEquipEngine {
  if (!_sharedEquipEngine) {
    _sharedEquipEngine = createRpgEquipEngine();
  }
  return _sharedEquipEngine;
}

function getItemEngine(): RpgItemEngine {
  if (!_sharedItemEngine) {
    _sharedItemEngine = createRpgItemEngine();
  }
  return _sharedItemEngine;
}

function getKungfuEngine(): RpgKungfuEngine {
  if (!_sharedKungfuEngine) {
    _sharedKungfuEngine = createRpgKungfuEngine();
  }
  return _sharedKungfuEngine;
}

function getTaskEngine(): RpgTaskEngine {
  if (!_sharedTaskEngine) {
    _sharedTaskEngine = createRpgTaskEngine();
  }
  return _sharedTaskEngine;
}

function getSectEngine(): RpgSectEngine {
  if (!_sharedSectEngine) {
    _sharedSectEngine = createRpgSectEngine();
  }
  return _sharedSectEngine;
}

/** Get the shared RPG action dispatcher (singleton, wired to shared engines). */
export function getRpgDispatcher(): RpgActionDispatcher {
  if (!_sharedDispatcher) {
    _sharedDispatcher = createRpgActionDispatcher();
    // Wire all engines to the dispatcher
    _sharedDispatcher.setBattleEngine(getBattleEngine());
    _sharedDispatcher.setEquipEngine(getEquipEngine());
    _sharedDispatcher.setItemEngine(getItemEngine());
    _sharedDispatcher.setKungfuEngine(getKungfuEngine());
    _sharedDispatcher.setTaskEngine(getTaskEngine());
    _sharedDispatcher.setSectEngine(getSectEngine());
  }
  return _sharedDispatcher;
}

/** Reset all shared engine instances (e.g. on new game). */
export function resetRpgEngines(): void {
  _sharedBattleEngine = null;
  _sharedEquipEngine = null;
  _sharedItemEngine = null;
  _sharedKungfuEngine = null;
  _sharedTaskEngine = null;
  _sharedSectEngine = null;
  _sharedDispatcher = null;
}

export interface RpgBattleStateSnapshot {
  battleActive: boolean;
  phase: BattlePhase | null;
  round: number;
  snapshot: BattleSnapshot | null;
  currentActorName: string | null;
  playerStats: CombatStats | null;
  playerHP: { current: number; max: number } | null;
  log: ReadonlyArray<BattleLogEntry>;
  outcome: BattleOutcome | null;
}

export interface UseRpgStateBridgeReturn {
  battleEngineRef: React.RefObject<RpgBattleEngine | null>;
  equipEngineRef: React.RefObject<RpgEquipEngine | null>;
  itemEngineRef: React.RefObject<RpgItemEngine | null>;
  kungfuEngineRef: React.RefObject<RpgKungfuEngine | null>;
  taskEngineRef: React.RefObject<RpgTaskEngine | null>;
  sectEngineRef: React.RefObject<RpgSectEngine | null>;

  getBattleSnapshot: () => RpgBattleStateSnapshot | null;
  syncBattleState: () => void;
  initBattle: (actors: Parameters<RpgBattleEngine['initBattle']>[0]) => void;
  executeAttack: (targetId: string, bodyPart?: string) => boolean;
  executeSkill: (targetId: string, kungfuId: string, bodyPart?: string) => boolean;
  executeDefend: () => boolean;
  advanceBattleTurn: () => void;
  syncAllEnginesState: () => void;
  isBattleActive: () => boolean;

  // Equip engine
  syncEquipState: () => void;
  // Kungfu engine
  syncKungfuState: () => void;
  // Task engine
  syncTaskState: () => void;
  // Sect engine
  syncSectState: () => void;
  // Item engine
  syncItemState: () => void;
}

export function useRpgStateBridge(): UseRpgStateBridgeReturn {
  // All refs point to shared singleton engines (lazy-initialized on first access).
  // This ensures every component calling useRpgStateBridge() works with the same engines.
  const battleEngineRef = React.useRef<RpgBattleEngine | null>(getBattleEngine());
  const equipEngineRef = React.useRef<RpgEquipEngine | null>(getEquipEngine());
  const itemEngineRef = React.useRef<RpgItemEngine | null>(getItemEngine());
  const kungfuEngineRef = React.useRef<RpgKungfuEngine | null>(getKungfuEngine());
  const taskEngineRef = React.useRef<RpgTaskEngine | null>(getTaskEngine());
  const sectEngineRef = React.useRef<RpgSectEngine | null>(getSectEngine());

  const { setRpgState } = useGameStore(
    useShallow((s) => ({
      setRpgState: s.setRpgState,
    }))
  );

  const getBattleSnapshot = React.useCallback((): RpgBattleStateSnapshot | null => {
    const engine = battleEngineRef.current;
    if (!engine) return null;

    const snapshot = engine.getBattleSnapshot();
    const playerStats = engine.getPlayerStats();

    let currentActorName: string | null = null;
    if (snapshot) {
      const currentActor = snapshot.actors.find((a) => a.id === snapshot.currentActorId);
      if (currentActor) currentActorName = currentActor.name;
    }

    let playerHP: { current: number; max: number } | null = null;
    if (snapshot) {
      const playerActor = snapshot.actors.find((a) => a.side === 'player');
      if (playerActor) {
        playerHP = { current: playerActor.currentHP, max: playerActor.maxHP };
      }
    }

    return {
      battleActive: engine.isActive,
      phase: engine.isActive ? engine.phase : null,
      round: engine.round,
      snapshot,
      currentActorName,
      playerStats,
      playerHP,
      log: engine.getBattleLog(),
      outcome: engine.getOutcome(),
    };
  }, []);

  const syncBattleState = React.useCallback(() => {
    const snap = getBattleSnapshot();
    if (!snap) return;

    setRpgState({
      rpgBattleActive: snap.battleActive,
      rpgBattlePhase: snap.phase,
      rpgBattleRound: snap.round,
      rpgBattleCurrentActor: snap.currentActorName,
      rpgBattleLog: Array.from(snap.log),
      rpgBattlePlayerHP: snap.playerHP,
      rpgBattleOutcome: snap.outcome?.winner ?? null,
    });
  }, [getBattleSnapshot, setRpgState]);

  const initBattle = React.useCallback(
    (actors: Parameters<RpgBattleEngine['initBattle']>[0]) => {
      const engine = battleEngineRef.current;
      if (!engine) return;
      engine.initBattle(actors);
      syncBattleState();
    },
    [syncBattleState]
  );

  const executeAttack = React.useCallback(
    (targetId: string, bodyPart?: string): boolean => {
      const engine = battleEngineRef.current;
      if (!engine || !engine.isActive) return false;

      const currentActor = engine.getCurrentActor();
      if (!currentActor || currentActor.side !== 'player') return false;

      const action: PlayerAction = {
        id: `attack-${Date.now()}`,
        engineType: 'rpgBattle',
        type: 'attack',
        payload: { targetId, bodyPart },
        timestamp: Date.now(),
      };

      const result = engine.executePlayerAction(action);
      if (result.success) syncBattleState();
      return result.success;
    },
    [syncBattleState]
  );

  const executeSkill = React.useCallback(
    (targetId: string, kungfuId: string, bodyPart?: string): boolean => {
      const engine = battleEngineRef.current;
      if (!engine || !engine.isActive) return false;

      const currentActor = engine.getCurrentActor();
      if (!currentActor || currentActor.side !== 'player') return false;

      const action: PlayerAction = {
        id: `skill-${Date.now()}`,
        engineType: 'rpgBattle',
        type: 'skill_attack',
        payload: { targetId, kungfuId, bodyPart },
        timestamp: Date.now(),
      };

      const result = engine.executePlayerAction(action);
      if (result.success) syncBattleState();
      return result.success;
    },
    [syncBattleState]
  );

  const executeDefend = React.useCallback((): boolean => {
    const engine = battleEngineRef.current;
    if (!engine || !engine.isActive) return false;

    const currentActor = engine.getCurrentActor();
    if (!currentActor || currentActor.side !== 'player') return false;

    const action: PlayerAction = {
      id: `defend-${Date.now()}`,
      engineType: 'rpgBattle',
      type: 'defend',
      payload: {},
      timestamp: Date.now(),
    };

    const result = engine.executePlayerAction(action);
    if (result.success) syncBattleState();
    return result.success;
  }, [syncBattleState]);

  const advanceBattleTurn = React.useCallback(() => {
    const engine = battleEngineRef.current;
    if (!engine) return;
    engine.advanceTurn();
    syncBattleState();
  }, [syncBattleState]);

  // === Equip Engine Sync ===
  const syncEquipState = React.useCallback(() => {
    const engine = equipEngineRef.current;
    if (!engine) return;
    const equip = engine.equipment;
    setRpgState({
      rpgEquipWeapon: equip.武器?.ID ?? null,
      rpgEquipArmor: equip.防具?.ID ?? null,
      rpgEquipAccessory: equip.饰品?.ID ?? null,
    });
  }, [setRpgState]);

  // === Kungfu Engine Sync ===
  const syncKungfuState = React.useCallback(() => {
    const engine = kungfuEngineRef.current;
    if (!engine) return;
    const kungfuList = engine.kungfuList;
    setRpgState({
      rpgActiveKungfuIds: kungfuList.map((k: 功法结构) => k.ID),
    });
  }, [setRpgState]);

  // === Task Engine Sync ===
  const syncTaskState = React.useCallback(() => {
    const engine = taskEngineRef.current;
    if (!engine) return;
    const taskList = engine.taskList;
    setRpgState({
      rpgActiveTaskIds: taskList
        .filter((t: 任务结构) => t.当前状态 === '进行中')
        .map((t: 任务结构) => t.标题),
    });
  }, [setRpgState]);

  // === Sect Engine Sync ===
  const syncSectState = React.useCallback(() => {
    const engine = sectEngineRef.current;
    if (!engine) return;
    const sectData = engine.sectData;
    if (!sectData) {
      setRpgState({ rpgSectId: null, rpgSectContribution: 0 });
      return;
    }
    setRpgState({
      rpgSectId: sectData.ID,
      rpgSectContribution: sectData.玩家贡献,
    });
  }, [setRpgState]);

  // === Item Engine Sync ===
  const syncItemState = React.useCallback(() => {
    const engine = itemEngineRef.current;
    if (!engine) return;
    // Currently no Zustand fields for inventory — consumed via engine actions directly
  }, []);

  const syncAllEnginesState = React.useCallback(() => {
    syncBattleState();
    syncEquipState();
    syncKungfuState();
    syncTaskState();
    syncSectState();
    syncItemState();
  }, [syncBattleState, syncEquipState, syncKungfuState, syncTaskState, syncSectState, syncItemState]);

  const isBattleActive = React.useCallback((): boolean => {
    const engine = battleEngineRef.current;
    return engine?.isActive ?? false;
  }, []);

  return {
    battleEngineRef,
    equipEngineRef,
    itemEngineRef,
    kungfuEngineRef,
    taskEngineRef,
    sectEngineRef,
    getBattleSnapshot,
    syncBattleState,
    initBattle,
    executeAttack,
    executeSkill,
    executeDefend,
    advanceBattleTurn,
    syncAllEnginesState,
    isBattleActive,
    syncEquipState,
    syncKungfuState,
    syncTaskState,
    syncSectState,
    syncItemState,
  };
}
