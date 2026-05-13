/**
 * useAggregatedDialogue.ts
 *
 * 聚合所有回合的对话日志，为主视图和 Backlog 提供统一数据源。
 */

import { useMemo } from 'react';
import type { 聊天记录结构 } from '../../../types';

// ============================================================================
// 类型
// ============================================================================

export interface AggregatedLogEntry {
  /** 在 history 中的索引（0-based） */
  turnIndex: number;
  /** 是否为玩家消息 */
  isUserMessage: boolean;
  /** 发送者：旁白、NPC 名、玩家名 */
  sender: string;
  /** 对话/叙事文本 */
  text: string;
  /** 是否为旁白 */
  isNarrator: boolean;
}

export interface AggregatedDialogueResult {
  /** 全量时间线（Backlog 用） */
  allEntries: AggregatedLogEntry[];
  /** 当前场景（最新 assistant 回复的所有 logs） */
  currentSceneEntries: AggregatedLogEntry[];
  /** 当前场景最后 2-3 条（主视图用） */
  recentEntries: AggregatedLogEntry[];
  /** 当前说话角色 */
  currentSpeaker: { name: string; text: string; imageUrl?: string } | null;
  /** 场景中所有 NPC 角色 */
  currentSceneCharacters: Array<{ name: string; imageUrl?: string }>;
}

interface UseAggregatedDialogueOptions {
  history: 聊天记录结构[];
  socialList: Array<{ 姓名?: string; 头像图片URL?: string; 图片URL?: string; 立绘图片URL?: string }>;
  playerName?: string;
}

// ============================================================================
// 工具函数
// ============================================================================

function isNarrator(sender: string): boolean {
  return sender === '旁白' || sender === 'narrator';
}

// ============================================================================
// Hook
// ============================================================================

export function useAggregatedDialogue({
  history,
  socialList,
  playerName,
}: UseAggregatedDialogueOptions): AggregatedDialogueResult {
  return useMemo(() => {
    const allEntries: AggregatedLogEntry[] = [];
    let currentSceneEntries: AggregatedLogEntry[] = [];

    for (let turnIdx = 0; turnIdx < history.length; turnIdx++) {
      const msg = history[turnIdx];
      if (!msg) continue;

      // 玩家消息
      if (msg.role === 'user' && msg.content) {
        allEntries.push({
          turnIndex: turnIdx,
          isUserMessage: true,
          sender: playerName || '玩家',
          text: msg.content,
          isNarrator: false,
        });
      }

      // AI 回复
      if (msg.role === 'assistant' && msg.structuredResponse?.logs) {
        const logs = msg.structuredResponse.logs as Array<{ sender: string; text: string }>;
        const sceneEntries: AggregatedLogEntry[] = [];

        for (const log of logs) {
          if (!log?.text?.trim()) continue;
          const entry: AggregatedLogEntry = {
            turnIndex: turnIdx,
            isUserMessage: false,
            sender: log.sender,
            text: log.text,
            isNarrator: isNarrator(log.sender),
          };
          allEntries.push(entry);
          sceneEntries.push(entry);
        }

        // 最后一条 assistant 消息 = 当前场景
        currentSceneEntries = sceneEntries;
      }
    }

    // 当前场景最后 3 条用于主视图
    const recentEntries = currentSceneEntries.slice(-3);

    // 当前说话角色（最后一条非旁白）
    let currentSpeaker: { name: string; text: string; imageUrl?: string } | null = null;
    for (let i = currentSceneEntries.length - 1; i >= 0; i--) {
      const entry = currentSceneEntries[i];
      if (!entry.isNarrator) {
        const npc = socialList.find((n) => n.姓名 === entry.sender);
        currentSpeaker = {
          name: entry.sender,
          text: entry.text,
          imageUrl: npc?.头像图片URL || npc?.图片URL || npc?.立绘图片URL,
        };
        break;
      }
    }

    // 全部是旁白时，取最后一条
    if (!currentSpeaker && currentSceneEntries.length > 0) {
      const lastEntry = currentSceneEntries[currentSceneEntries.length - 1];
      currentSpeaker = { name: lastEntry.sender, text: lastEntry.text };
    }

    // 场景中的 NPC 角色列表（用于 CharacterSprite）
    const characterNames = new Set<string>();
    for (const entry of currentSceneEntries) {
      if (!entry.isNarrator) {
        characterNames.add(entry.sender);
      }
    }
    const currentSceneCharacters = Array.from(characterNames).slice(0, 2).map((name) => {
      const npc = socialList.find((n) => n.姓名 === name);
      return { name, imageUrl: npc?.头像图片URL || npc?.图片URL || npc?.立绘图片URL };
    });

    return {
      allEntries,
      currentSceneEntries,
      recentEntries,
      currentSpeaker,
      currentSceneCharacters,
    };
  }, [history, socialList, playerName]);
}
