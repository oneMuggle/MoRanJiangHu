/**
 * useAvgStateBridge.ts
 *
 * AVG/Galgame 引擎状态 → React 状态桥接层。
 * 将 AvgRelationEngine 的内部状态映射为 UI 可消费的 React state。
 */

import * as React from 'react';
import type { AvgRelationEngine } from './useGame/engine/avgRelationEngine';
import type { GalgameRoute, GalgameCG, EndingJudgment } from '../models/avg/galgame';
import type { NpcRelationSummary, IntimacyLevel } from '../models/avg/relationGraph';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';

export interface AvgStateBridgeSnapshot {
  galgameState: ReturnType<AvgRelationEngine['getGalgameState']> | null;
  activeRoute: GalgameRoute | null;
  activeRouteName: string | null;
  allCGs: GalgameCG[];
  unlockedCGs: GalgameCG[];
  npcRelations: NpcRelationSummary[];
  intimacyLevel: IntimacyLevel | null;
  intimacyLabel: string | null;
  suggestedRouteId: string | null;
  currentEnding: EndingJudgment | null;
}

export interface UseAvgStateBridgeReturn {
  /** 引擎实例 ref（由 useGame 注入） */
  engineRef: React.RefObject<AvgRelationEngine | null>;
  /** 获取当前完整状态快照 */
  getSnapshot: () => AvgStateBridgeSnapshot | null;
  /** 同步引擎状态到 Zustand（触发 UI 重渲染） */
  syncStateToZustand: () => void;
  /** 获取当前激活路线 */
  getActiveRoute: () => GalgameRoute | null;
  /** 获取指定 NPC 的好感度摘要 */
  getNpcRelationSummary: (npcId: string) => NpcRelationSummary[] | null;
  /** 对指定 NPC 判定路线 */
  judgeRouteForNpc: (routeId: string, npcId: string) => boolean;
  /** 进入指定路线 */
  enterRoute: (routeId: string, npcId: string) => boolean;
  /** 解析结局 */
  resolveEnding: (routeId?: string) => boolean;
  /** 完成结局 */
  completeEnding: (endingId: string) => boolean;
  /** 设置 flag */
  setFlag: (key: string, value: boolean) => void;
}

export function useAvgStateBridge(): UseAvgStateBridgeReturn {
  const engineRef = React.useRef<AvgRelationEngine | null>(null);

  const { setAvgState } = useGameStore(
    useShallow((s) => ({
      setAvgState: s.setAvgState,
    }))
  );

  const getSnapshot = React.useCallback((): AvgStateBridgeSnapshot | null => {
    const engine = engineRef.current;
    if (!engine) return null;

    const galgameState = engine.getGalgameState();
    const activeRoute = engine.getActiveRoute() ?? null;
    const allCGs = engine.getAllCGs();
    const unlockedCGs = engine.getUnlockedCGs();

    const npcRelations: NpcRelationSummary[] = [];
    const allNpcs = engine.getAllNpcs();
    for (const npcId of allNpcs) {
      const summary = engine.getRelationSummary(npcId);
      npcRelations.push(...summary);
    }

    let intimacyLevel: IntimacyLevel | null = null;
    let intimacyLabel: string | null = null;
    if (allNpcs.length > 0) {
      intimacyLevel = engine.getLevel('player', allNpcs[0]);
      intimacyLabel = engine.getLevelLabel(intimacyLevel);
    }

    let suggestedRouteId: string | null = null;
    if (allNpcs.length > 0 && !galgameState.activeRouteId) {
      const suggested = engine.suggestRoute(allNpcs[0]);
      if (suggested) suggestedRouteId = suggested.id;
    }

    const currentEnding = engine.getLastResolvedEnding();

    return {
      galgameState,
      activeRoute,
      activeRouteName: activeRoute?.routeName ?? null,
      allCGs,
      unlockedCGs,
      npcRelations,
      intimacyLevel,
      intimacyLabel,
      suggestedRouteId,
      currentEnding,
    };
  }, []);

  const syncStateToZustand = React.useCallback(() => {
    const snapshot = getSnapshot();
    if (!snapshot) return;

    setAvgState({
      avgGalgameState: snapshot.galgameState,
      avgActiveRouteId: snapshot.galgameState.activeRouteId,
      avgActiveRouteName: snapshot.activeRouteName,
      avgUnlockedRouteIds: snapshot.galgameState.unlockedRouteIds,
      avgLockedRouteIds: snapshot.galgameState.lockedRouteIds,
      avgCompletedEndingIds: snapshot.galgameState.completedEndingIds,
      avgUnlockedCGIds: snapshot.galgameState.unlockedCGIds,
      avgTriggeredEventIds: snapshot.galgameState.triggeredEventIds,
      avgIntimacyLevel: snapshot.intimacyLabel,
      avgAvailableCGs: snapshot.allCGs.length,
      avgUnlockedCGs: snapshot.unlockedCGs.length,
    });
  }, [getSnapshot, setAvgState]);

  const getActiveRoute = React.useCallback((): GalgameRoute | null => {
    const engine = engineRef.current;
    if (!engine) return null;
    return engine.getActiveRoute() ?? null;
  }, []);

  const getNpcRelationSummary = React.useCallback(
    (npcId: string): NpcRelationSummary[] | null => {
      const engine = engineRef.current;
      if (!engine) return null;
      return engine.getRelationSummary(npcId);
    },
    []
  );

  const judgeRouteForNpc = React.useCallback(
    (routeId: string, npcId: string): boolean => {
      const engine = engineRef.current;
      if (!engine) return false;
      const judgment = engine.judgeRoute(routeId, npcId);
      return judgment.canEnter;
    },
    []
  );

  const enterRoute = React.useCallback(
    (routeId: string, npcId: string): boolean => {
      const engine = engineRef.current;
      if (!engine) return false;
      const success = engine.enterRoute(routeId, npcId);
      if (success) syncStateToZustand();
      return success;
    },
    [syncStateToZustand]
  );

  const resolveEnding = React.useCallback(
    (routeId?: string): boolean => {
      const engine = engineRef.current;
      if (!engine) return false;
      const result = engine.resolveEnding(routeId);
      if (result.resolved) syncStateToZustand();
      return result.resolved;
    },
    [syncStateToZustand]
  );

  const completeEnding = React.useCallback(
    (endingId: string): boolean => {
      const engine = engineRef.current;
      if (!engine) return false;
      const success = engine.completeEnding(endingId);
      if (success) syncStateToZustand();
      return success;
    },
    [syncStateToZustand]
  );

  const setFlag = React.useCallback(
    (key: string, value: boolean): void => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.setFlag(key, value);
      syncStateToZustand();
    },
    [syncStateToZustand]
  );

  return {
    engineRef,
    getSnapshot,
    syncStateToZustand,
    getActiveRoute,
    getNpcRelationSummary,
    judgeRouteForNpc,
    enterRoute,
    resolveEnding,
    completeEnding,
    setFlag,
  };
}
