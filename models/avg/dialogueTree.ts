/**
 * AVG 对话树 — 数据模型
 */

/** 对话节点类型 */
export type DialogueNodeType = 'text' | 'choice' | 'condition' | 'action' | 'jump';

/** 节点条件类型 */
export type ConditionType =
  | 'stat_check'
  | 'intimacy_check'
  | 'task_check'
  | 'item_check'
  | 'flag_check'
  | 'always_true'
  | 'always_false';

/** 条件表达式 */
export interface DialogueCondition {
  type: ConditionType;
  field?: string;
  operator: 'gte' | 'lte' | 'eq' | 'neq' | 'has';
  value: number | string | boolean;
}

/** 动作定义 */
export interface DialogueAction {
  type: 'intimacy_change' | 'flag_set' | 'item_change' | 'task_update';
  target: string;
  value: number | string | boolean;
}

/** 选项定义 */
export interface DialogueChoice {
  id: string;
  text: string;
  targetNodeId: string;
  condition?: DialogueCondition;
  consequenceHint?: string;
  actions: DialogueAction[];
}

/** 对话节点 */
export interface DialogueNode {
  id: string;
  type: DialogueNodeType;
  speaker?: string;
  text: string;
  condition?: DialogueCondition;
  actions: DialogueAction[];
  choices?: DialogueChoice[];
  nextNodeId?: string;
  tags?: string[];
}

/** 对话树 */
export interface DialogueTree {
  id: string;
  name: string;
  description: string;
  rootNodeId: string;
  nodes: DialogueNode[];
  tags?: string[];
  relatedNpcId?: string;
}

/** 对话执行状态 */
export interface DialogueState {
  treeId: string;
  currentNodeId: string;
  visitedNodeIds: string[];
  history: DialogueHistoryEntry[];
  isComplete: boolean;
}

export interface DialogueHistoryEntry {
  nodeId: string;
  speaker?: string;
  text: string;
  chosenChoiceId?: string;
  timestamp: number;
}
