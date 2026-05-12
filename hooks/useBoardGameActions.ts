/**
 * useBoardGameActions.ts
 *
 * 桌游 SLG 玩家操作层 — 封装所有可交互操作。
 * 玩家通过此 hook 向引擎发送操作，引擎结算后更新状态。
 */

import * as React from 'react';
import { useGameStore } from './useGame/subsystems/zustandStore';
import { useShallow } from 'zustand/react/shallow';
import type { BoardGamePlayerAction, BoardGameSettlementResult, BoardGamePendingEvent } from './useGame/subsystems/zustandStore';

export interface UseBoardGameActionsReturn {
  /** 发送玩家操作到引擎 */
  dispatch: (action: Omit<BoardGamePlayerAction, 'timestamp'>) => void;
  /** 暂停游戏 */
  pauseGame: (reason: 'chat-sent' | 'key-step' | 'player-pause') => void;
  /** 恢复游戏 */
  resumeGame: () => void;
  /** 记录结算结果 */
  recordSettlement: (result: BoardGameSettlementResult) => void;
  /** 添加待处理事件 */
  addPendingEvent: (event: BoardGamePendingEvent) => void;
  /** 处理待处理事件的选择 */
  resolvePendingEvent: (eventId: string, choiceId: string) => void;
  /** 设置叙事约束 */
  setNarrativeConstraints: (constraints: string) => void;
  /** 当前是否暂停 */
  isPaused: boolean;
  /** 暂停原因 */
  pauseReason: 'chat-sent' | 'key-step' | 'player-pause' | null;
}

export function useBoardGameActions(): UseBoardGameActionsReturn {
  const {
    setBoardGamePaused,
    setPauseReason,
    addActionToHistory,
    setLastSettlement,
    setPendingEvents,
    setNarrativeConstraints,
    boardGamePaused,
    pauseReason,
  } = useGameStore(useShallow((s) => ({
    setBoardGamePaused: s.setBoardGamePaused,
    setPauseReason: s.setPauseReason,
    addActionToHistory: s.addActionToHistory,
    setLastSettlement: s.setLastSettlement,
    setPendingEvents: s.setPendingEvents,
    setNarrativeConstraints: s.setNarrativeConstraints,
    boardGamePaused: s.boardGamePaused,
    pauseReason: s.pauseReason,
  })));

  const dispatch = React.useCallback((action: Omit<BoardGamePlayerAction, 'timestamp'>) => {
    const fullAction: BoardGamePlayerAction = {
      ...action,
      timestamp: Date.now(),
    };
    addActionToHistory(fullAction);
  }, [addActionToHistory]);

  const pauseGame = React.useCallback((reason: 'chat-sent' | 'key-step' | 'player-pause') => {
    setBoardGamePaused(true);
    setPauseReason(reason);
  }, [setBoardGamePaused, setPauseReason]);

  const resumeGame = React.useCallback(() => {
    setBoardGamePaused(false);
    setPauseReason(null);
  }, [setBoardGamePaused, setPauseReason]);

  const recordSettlement = React.useCallback((result: BoardGameSettlementResult) => {
    setLastSettlement(result);
  }, [setLastSettlement]);

  const addPendingEvent = React.useCallback((event: BoardGamePendingEvent) => {
    setPendingEvents((prev) => [...prev, event]);
  }, [setPendingEvents]);

  const resolvePendingEvent = React.useCallback((eventId: string, choiceId: string) => {
    setPendingEvents((prev) => prev.filter((e: BoardGamePendingEvent) => e.id !== eventId));
    dispatch({
      type: 'resolve_pending_event',
      payload: { eventId, choiceId },
    });
  }, [setPendingEvents, dispatch]);

  const setNarrativeConstraintsFn = React.useCallback((constraints: string) => {
    setNarrativeConstraints(constraints);
  }, [setNarrativeConstraints]);

  return {
    dispatch,
    pauseGame,
    resumeGame,
    recordSettlement,
    addPendingEvent,
    resolvePendingEvent,
    setNarrativeConstraints: setNarrativeConstraintsFn,
    isPaused: boardGamePaused,
    pauseReason,
  };
}
