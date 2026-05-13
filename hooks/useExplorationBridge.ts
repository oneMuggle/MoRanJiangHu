/**
 * useExplorationBridge.ts
 *
 * 探索引擎叙事桥接层 — 负责：
 * 1. 持有 ExplorationEngine 实例 ref
 * 2. 发消息时自动暂停探索，AI 回复后恢复
 * 3. 引擎状态变更自动同步到 Zustand
 * 4. 生成叙事约束注入 AI prompt
 */

import * as React from 'react';
import type { ExplorationEngine } from './useGame/engine/explorationEngine';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import type { MapNode } from '../models/exploration/mapNode';

export interface UseExplorationBridgeReturn {
  /** 持有引擎实例（由 useGame 注入） */
  engineRef: React.MutableRefObject<ExplorationEngine | null>;
  /** 初始化地图数据 */
  initMap: (nodes: MapNode[], paths: Array<{ from: string; to: string; actionCost: number }>, startNodeId?: string) => void;
  /** 移动到目标节点 */
  moveTo: (targetNodeId: string) => { success: boolean; encounter?: unknown; treasure?: unknown; hiddenEvents: string[] };
  /** 在当前节点探索 */
  explore: () => void;
  /** 休息恢复行动力 */
  rest: () => void;
  /** 玩家发送消息时调用 — 自动暂停 */
  onChatMessageSent: () => void;
  /** AI 回复后调用 — 自动恢复 */
  onAIReplyReceived: () => void;
  /** 生成叙事约束 XML（可注入 prompt） */
  getNarrativeConstraints: () => string | null;
  /** 同步引擎状态到 Zustand */
  syncStateToZustand: () => void;
  /** 当前是否暂停 */
  isPaused: boolean;
}

export function useExplorationBridge(): UseExplorationBridgeReturn {
  const engineRef = React.useRef<ExplorationEngine | null>(null);

  const {
    explorationPaused,
    explorationPauseReason,
    setExplorationPaused,
    setExplorationPauseReason,
    syncExplorationState,
  } = useGameStore(useShallow((s) => ({
    explorationPaused: s.explorationPaused,
    explorationPauseReason: s.explorationPauseReason,
    setExplorationPaused: s.setExplorationPaused,
    setExplorationPauseReason: s.setExplorationPauseReason,
    syncExplorationState: s.syncExplorationState,
  })));

  const syncStateToZustand = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const state = engine.getState();
    const graphData = (engine as any)._graph.getData();

    syncExplorationState({
      explorationNodes: graphData.nodes,
      explorationPaths: graphData.paths,
      explorationCurrentAp: state.currentAp,
      explorationMaxAp: state.maxAp,
      explorationCurrentNodeId: state.currentNodeId,
    });
  }, [syncExplorationState]);

  const initMap = React.useCallback((
    nodes: MapNode[],
    paths: Array<{ from: string; to: string; actionCost: number }>,
    startNodeId?: string,
  ) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.initMap(nodes, paths, startNodeId);
    syncStateToZustand();
  }, [syncStateToZustand]);

  const moveTo = React.useCallback((targetNodeId: string) => {
    const engine = engineRef.current;
    if (!engine) return { success: false as const, hiddenEvents: [] };
    const result = engine.moveTo(targetNodeId);
    syncStateToZustand();
    return result;
  }, [syncStateToZustand]);

  const explore = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.explore();
    syncStateToZustand();
  }, [syncStateToZustand]);

  const rest = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.rest();
    syncStateToZustand();
  }, [syncStateToZustand]);

  const onChatMessageSent = React.useCallback(() => {
    if (!explorationPaused) {
      setExplorationPaused(true);
      setExplorationPauseReason('chat-sent');
    }
  }, [explorationPaused, setExplorationPaused, setExplorationPauseReason]);

  const onAIReplyReceived = React.useCallback(() => {
    if (explorationPaused && explorationPauseReason === 'chat-sent') {
      setExplorationPaused(false);
      setExplorationPauseReason(null);
    }
  }, [explorationPaused, explorationPauseReason, setExplorationPaused, setExplorationPauseReason]);

  const getNarrativeConstraints = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return null;
    const constraint = engine.getNarrativeConstraints();
    return `<探索叙事约束>
  当前位置: ${constraint.scene}
  回合: ${constraint.turn}
  玩家行动: ${constraint.playerAction}
  下一事件: ${constraint.nextEvent}
</探索叙事约束>`;
  }, []);

  return {
    engineRef,
    initMap,
    moveTo,
    explore,
    rest,
    onChatMessageSent,
    onAIReplyReceived,
    getNarrativeConstraints,
    syncStateToZustand,
    isPaused: explorationPaused,
  };
}
