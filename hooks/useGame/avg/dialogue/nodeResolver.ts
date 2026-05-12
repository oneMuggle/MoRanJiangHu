/**
 * AVG 对话树 — 节点解析器
 *
 * 解析对话树节点，处理类型分发和执行动作。
 */

import type {
  DialogueNode,
  DialogueAction,
  DialogueState,
  DialogueHistoryEntry,
} from '../../../../models/avg/dialogueTree';
import { ConditionEvaluator } from './conditionEvaluator';
import type { GameContext } from './conditionEvaluator';

export interface NodeResolveResult {
  node: DialogueNode;
  state: DialogueState;
  actions: DialogueAction[];
  availableChoices: { id: string; text: string; consequenceHint?: string }[];
  historyEntry: DialogueHistoryEntry;
}

export class NodeResolver {
  private evaluator: ConditionEvaluator;

  constructor(context: GameContext) {
    this.evaluator = new ConditionEvaluator(context);
  }

  updateContext(context: Partial<GameContext>): void {
    this.evaluator.updateContext(context);
  }

  resolve(
    treeNodes: DialogueNode[],
    state: DialogueState,
    choiceId?: string
  ): NodeResolveResult | null {
    const nodeMap = this._buildNodeMap(treeNodes);
    const currentNode = nodeMap.get(state.currentNodeId);
    if (!currentNode) return null;

    if (currentNode.condition && !this.evaluator.evaluate(currentNode.condition)) {
      return null;
    }

    const newState = { ...state, visitedNodeIds: [...state.visitedNodeIds, currentNode.id] };
    let nextNodeId: string | undefined;

    if (currentNode.type === 'choice' && currentNode.choices) {
      const availableChoices = this.evaluator.evaluateChoices(currentNode.choices);

      if (choiceId) {
        const chosen = availableChoices.find((c) => c.id === choiceId);
        if (chosen) {
          nextNodeId = chosen.targetNodeId;
          this._executeActions(chosen.actions);
          newState.history = [
            ...state.history,
            this._makeHistoryEntry(currentNode, choiceId),
          ];
        } else {
          return null;
        }
      } else {
        newState.history = [
          ...state.history,
          this._makeHistoryEntry(currentNode, undefined),
        ];
      }

      const simplifiedChoices = availableChoices.map((c) => ({
        id: c.id,
        text: c.text,
        consequenceHint: c.consequenceHint,
      }));

      newState.currentNodeId = nextNodeId ?? currentNode.id;

      return {
        node: currentNode,
        state: newState,
        actions: choiceId ? (currentNode.choices?.find((c) => c.id === choiceId)?.actions ?? []) : [],
        availableChoices: simplifiedChoices,
        historyEntry: this._makeHistoryEntry(currentNode, choiceId),
      };
    }

    if (currentNode.type === 'condition' && currentNode.choices) {
      const availableChoices = this.evaluator.evaluateChoices(currentNode.choices);
      if (availableChoices.length > 0) {
        const first = availableChoices[0];
        nextNodeId = first.targetNodeId;
        this._executeActions(first.actions);
      }
    }

    if (currentNode.type === 'action') {
      this._executeActions(currentNode.actions);
    }

    if (currentNode.type === 'jump' && currentNode.nextNodeId) {
      nextNodeId = currentNode.nextNodeId;
    }

    if (!nextNodeId && currentNode.nextNodeId) {
      nextNodeId = currentNode.nextNodeId;
    }

    if (nextNodeId) {
      newState.currentNodeId = nextNodeId;
    } else if (!nextNodeId && !currentNode.choices && !currentNode.nextNodeId) {
      newState.isComplete = true;
    }

    this._executeActions(currentNode.actions);

    return {
      node: currentNode,
      state: newState,
      actions: currentNode.actions,
      availableChoices: currentNode.choices
        ? this.evaluator.evaluateChoices(currentNode.choices).map((c) => ({
            id: c.id,
            text: c.text,
            consequenceHint: c.consequenceHint,
          }))
        : [],
      historyEntry: this._makeHistoryEntry(currentNode, choiceId),
    };
  }

  private _buildNodeMap(nodes: DialogueNode[]): Map<string, DialogueNode> {
    const map = new Map<string, DialogueNode>();
    nodes.forEach((node) => map.set(node.id, node));
    return map;
  }

  private _executeActions(actions: DialogueAction[]): void {
    for (const action of actions) {
      this.evaluator.updateContext(this._actionToContext(action));
    }
  }

  private _actionToContext(action: DialogueAction): Partial<GameContext> {
    switch (action.type) {
      case 'intimacy_change':
        return { intimacy: { [action.target]: action.value as number } };
      case 'flag_set':
        return { flags: { [action.target]: action.value as boolean } };
      case 'item_change':
        return { items: [action.value as string] };
      case 'task_update':
        return { tasks: { [action.target]: action.value as string } };
      default:
        return {};
    }
  }

  private _makeHistoryEntry(node: DialogueNode, chosenChoiceId?: string): DialogueHistoryEntry {
    return {
      nodeId: node.id,
      speaker: node.speaker,
      text: node.text,
      chosenChoiceId,
      timestamp: Date.now(),
    };
  }
}

export function createNodeResolver(context: GameContext): NodeResolver {
  return new NodeResolver(context);
}
