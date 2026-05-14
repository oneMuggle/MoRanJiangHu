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
import { generateTravelNarrative, type TravelNarrativeContext } from './useGame/exploration/explorationNarrativeService';

export interface UseExplorationBridgeReturn {
  /** 持有引擎实例（由 useGame 注入） */
  engineRef: React.MutableRefObject<ExplorationEngine | null>;
  /** 初始化地图数据 */
  initMap: (nodes: MapNode[], paths: Array<{ from: string; to: string; actionCost: number }>, startNodeId?: string) => void;
  /** 移动到目标节点（async — 会触发 AI 叙事） */
  moveTo: (targetNodeId: string) => Promise<{ success: boolean; encounter?: unknown; treasure?: unknown; hiddenEvents: string[]; travelTimeMinutes: number; pathCost: number }>;
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

interface BridgeExtras {
  apiConfig: any;
  onTravelNarrative?: (narrative: string, travelTimeMinutes: number, originName: string, destName: string) => void;
}

export function useExplorationBridge(extras?: BridgeExtras): UseExplorationBridgeReturn {
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

  const moveTo = React.useCallback(async (targetNodeId: string) => {
    const engine = engineRef.current;
    if (!engine) return { success: false as const, hiddenEvents: [], travelTimeMinutes: 0, pathCost: 0 };

    // 获取出发地信息
    const originNode = engine.getCurrentNode();
    const originName = originNode?.name ?? '未知地点';

    const result = engine.moveTo(targetNodeId);
    syncStateToZustand();

    if (!result.success) return result;

    // AI 叙事（异步，不阻塞状态更新）
    if (extras?.onTravelNarrative && extras?.apiConfig) {
      const destNode = engine.getCurrentNode();
      if (destNode) {
        const 环境时间 = (useGameStore.getState() as any).环境?.时间 ?? '';
        const 角色名 = (useGameStore.getState() as any).角色?.姓名 ?? '玩家';

        const context: TravelNarrativeContext = {
          originNodeName: originName,
          destinationNodeName: destNode.name,
          pathDescription: undefined,
          gameTime: 环境时间,
          timeOfDay: 环境时间 ? extractTimeOfDay(环境时间) : '未知',
          encounterTriggered: !!result.encounter,
          treasureFound: !!result.treasure,
          hiddenEvents: result.hiddenEvents,
          playerCharacterName: 角色名,
          destinationNodeType: destNode.type,
          destinationDescription: destNode.description,
        };

        const narrativeResult = await generateTravelNarrative(context, extras.apiConfig);
        if (narrativeResult) {
          extras.onTravelNarrative(
            narrativeResult.narrative,
            narrativeResult.travelTimeMinutes,
            originName,
            destNode.name,
          );
        }
      }
    }

    return result;
  }, [syncStateToZustand, extras]);

/** 从 canonical time 提取时段标签（简易版，与 timeOfDayUtils 一致） */
function extractTimeOfDay(canonicalTime: string): string {
  const parts = canonicalTime.split(':');
  if (parts.length < 4) return '未知';
  const hour = parseInt(parts[3], 10);
  if (isNaN(hour)) return '未知';
  if (hour >= 5 && hour <= 7) return '清晨';
  if (hour >= 8 && hour <= 11) return '上午';
  if (hour >= 12 && hour <= 13) return '中午';
  if (hour >= 14 && hour <= 17) return '下午';
  if (hour >= 18 && hour <= 20) return '傍晚';
  if (hour >= 21 || hour === 0) return '深夜';
  return '凌晨';
}

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
