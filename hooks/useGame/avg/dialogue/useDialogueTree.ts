/**
 * useDialogueTree.ts
 *
 * 对话树运行时 hook。管理对话树状态、选项求值、动作执行。
 * 将 NodeResolver 与 AvgRelationEngine 桥接。
 */

import * as React from 'react';
import { createNodeResolver } from './nodeResolver';
import type { DialogueNode, DialogueState } from '../../../../models/avg/dialogueTree';
import type { AvgRelationEngine } from '../../engine/avgRelationEngine';

export interface DialogueTreeContext {
  engineRef: React.RefObject<AvgRelationEngine | null>;
}

export interface UseDialogueTreeReturn {
  /** 当前可用的分支选项 */
  availableChoices: Array<{ id: string; text: string; consequenceHint?: string }>;
  /** 选择选项 */
  selectChoice: (choiceId: string) => void;
  /** 当前对话树状态 */
  state: DialogueState | null;
  /** 是否处于分支选择状态 */
  isAtChoice: boolean;
  /** 初始化对话树 */
  initTree: (tree: { nodes: DialogueNode[]; rootNodeId: string }) => void;
  /** 重置 */
  reset: () => void;
}

export function useDialogueTree(
  context: DialogueTreeContext
): UseDialogueTreeReturn {
  const [tree, setTree] = React.useState<{
    nodes: DialogueNode[];
    rootNodeId: string;
  } | null>(null);

  const [dialogueState, setDialogueState] = React.useState<DialogueState | null>(null);
  const [choices, setChoices] = React.useState<Array<{ id: string; text: string; consequenceHint?: string }>>([]);

  const resolverRef = React.useRef<ReturnType<typeof createNodeResolver> | null>(null);

  const buildGameContext = React.useCallback((): Parameters<typeof createNodeResolver>[0] => {
    const engine = context.engineRef.current;
    if (!engine) {
      return { stats: {}, intimacy: {}, tasks: {}, items: [], flags: {} };
    }

    const galgameState = engine.getGalgameState();
    const allNpcs = engine.getAllNpcs();
    const intimacyMap: Record<string, number> = {};
    for (const npcId of allNpcs) {
      const level = engine.getLevel('player', npcId);
      intimacyMap[npcId] = level ?? 0;
    }

    return {
      stats: {},
      intimacy: intimacyMap,
      tasks: {},
      items: galgameState.unlockedCGIds,
      flags: galgameState.flags,
    };
  }, [context.engineRef]);

  const initTree = React.useCallback((newTree: { nodes: DialogueNode[]; rootNodeId: string }) => {
    setTree(newTree);
    const ctx = buildGameContext();
    resolverRef.current = createNodeResolver(ctx);

    const initialState: DialogueState = {
      treeId: newTree.rootNodeId,
      currentNodeId: newTree.rootNodeId,
      visitedNodeIds: [],
      history: [],
      isComplete: false,
    };

    const result = resolverRef.current.resolve(newTree.nodes, initialState);
    if (result) {
      setDialogueState(result.state);
      setChoices(result.availableChoices);
    } else {
      setDialogueState(initialState);
      setChoices([]);
    }
  }, [buildGameContext]);

  const selectChoice = React.useCallback((choiceId: string) => {
    if (!tree || !resolverRef.current || !dialogueState) return;

    const result = resolverRef.current.resolve(tree.nodes, dialogueState, choiceId);
    if (result) {
      setDialogueState(result.state);
      setChoices(result.availableChoices);
    }
  }, [tree, dialogueState]);

  const reset = React.useCallback(() => {
    setTree(null);
    setDialogueState(null);
    setChoices([]);
    resolverRef.current = null;
  }, []);

  const isAtChoice = choices.length > 0 && !!dialogueState && !dialogueState.isComplete;

  return {
    availableChoices: choices,
    selectChoice,
    state: dialogueState,
    isAtChoice,
    initTree,
    reset,
  };
}
