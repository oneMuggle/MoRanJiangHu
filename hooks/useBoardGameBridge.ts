/**
 * useBoardGameBridge.ts
 *
 * 桌游 SLG 叙事桥接层 — 负责：
 * 1. 发消息时自动暂停游戏并保存状态
 * 2. AI 回复后自动恢复游戏
 * 3. 关键步骤触发叙事推进
 * 4. 生成叙事约束注入 AI prompt
 */

import * as React from 'react';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import type { BoardGameSettlementResult } from './useGame/subsystems/zustandStore';

export interface UseBoardGameBridgeReturn {
  /** 玩家发送消息时调用 — 自动暂停 */
  onChatMessageSent: () => void;
  /** AI 回复后调用 — 自动恢复 */
  onAIReplyReceived: () => void;
  /** 关键步骤检测 — 触发叙事推进 */
  onKeyStepDetected: (result: BoardGameSettlementResult) => void;
  /** 生成叙事约束 XML */
  generateNarrativeConstraint: (actionType: string, result: Partial<BoardGameSettlementResult>) => string;
  /** 当前游戏是否暂停 */
  isPaused: boolean;
  /** 暂停原因 */
  pauseReason: 'chat-sent' | 'key-step' | 'player-pause' | null;
  /** 当前叙事约束（可注入 prompt） */
  narrativeConstraints: string | null;
}

export function useBoardGameBridge(): UseBoardGameBridgeReturn {
  const {
    boardGamePaused,
    pauseReason,
    showBoardGameModal,
    narrativeConstraints,
    setBoardGamePaused,
    setPauseReason,
    setNarrativeConstraints,
    setLastSettlement,
  } = useGameStore(useShallow((s) => ({
    boardGamePaused: s.boardGamePaused,
    pauseReason: s.pauseReason,
    showBoardGameModal: s.showBoardGameModal,
    narrativeConstraints: s.narrativeConstraints,
    setBoardGamePaused: s.setBoardGamePaused,
    setPauseReason: s.setPauseReason,
    setNarrativeConstraints: s.setNarrativeConstraints,
    setLastSettlement: s.setLastSettlement,
  })));

  const onChatMessageSent = React.useCallback(() => {
    if (showBoardGameModal && !boardGamePaused) {
      setBoardGamePaused(true);
      setPauseReason('chat-sent');
    }
  }, [showBoardGameModal, boardGamePaused, setBoardGamePaused, setPauseReason]);

  const onAIReplyReceived = React.useCallback(() => {
    if (boardGamePaused && pauseReason === 'chat-sent') {
      setBoardGamePaused(false);
      setPauseReason(null);
    }
  }, [boardGamePaused, pauseReason, setBoardGamePaused, setPauseReason]);

  const onKeyStepDetected = React.useCallback((result: BoardGameSettlementResult) => {
    setLastSettlement(result);
    if (result.keyStep) {
      setBoardGamePaused(true);
      setPauseReason('key-step');
      setNarrativeConstraints(result.narrativeConstraint);
    }
  }, [setLastSettlement, setBoardGamePaused, setPauseReason, setNarrativeConstraints]);

  const generateNarrativeConstraint = React.useCallback(
    (actionType: string, result: Partial<BoardGameSettlementResult>) => {
      return `<桌游叙事约束>
  玩家操作: ${actionType}
  结算结果: ${result.success ? '成功' : '失败'}
  紧张度变化: ${result.tensionDelta ?? 0}
  NSFW触发: ${result.nsfwTriggered ? '是' : '否'}
  ${result.keyStep ? '关键步骤，请详细描写' : ''}
</桌游叙事约束>`;
    },
    []
  );

  return {
    onChatMessageSent,
    onAIReplyReceived,
    onKeyStepDetected,
    generateNarrativeConstraint,
    isPaused: boardGamePaused,
    pauseReason,
    narrativeConstraints,
  };
}
