/**
 * Phase 11: AVG Dialogue Tree Engine Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConditionEvaluator, createConditionEvaluator } from './avg/dialogue/conditionEvaluator';
import type { GameContext } from './avg/dialogue/conditionEvaluator';
import { NodeResolver, createNodeResolver } from './avg/dialogue/nodeResolver';
import { AvgDialogueEngine, createAvgDialogueEngine } from './engine/avgDialogueEngine';
import type { PlayerAction } from './engine/types';
import type { DialogueTree, DialogueNode, DialogueChoice, DialogueCondition, DialogueAction } from '../../models/avg/dialogueTree';

const makeAction = (type: string, payload: Record<string, unknown>): PlayerAction => ({
  id: `test-${type}-${Date.now()}`,
  engineType: 'avgDialogue' as const,
  type,
  payload,
  timestamp: Date.now(),
});

// ==================== ConditionEvaluator Tests ====================

describe('ConditionEvaluator', () => {
  let ctx: GameContext;
  let evaluator: ConditionEvaluator;

  beforeEach(() => {
    ctx = {
      stats: { strength: 10, intelligence: 15 },
      intimacy: { npc_001: 50, npc_002: 30 },
      tasks: { task_001: 'completed', task_002: 'active' },
      items: ['sword', 'potion'],
      flags: { met_king: true, defeated_dragon: false },
    };
    evaluator = createConditionEvaluator(ctx);
  });

  describe('always_true / always_false', () => {
    it('always_true returns true', () => {
      expect(evaluator.evaluate({ type: 'always_true', operator: 'eq', value: true })).toBe(true);
    });

    it('always_false returns false', () => {
      expect(evaluator.evaluate({ type: 'always_false', operator: 'eq', value: true })).toBe(false);
    });
  });

  describe('stat_check', () => {
    it('passes when stat >= threshold', () => {
      expect(evaluator.evaluate({ type: 'stat_check', field: 'strength', operator: 'gte', value: 10 })).toBe(true);
    });

    it('fails when stat < threshold', () => {
      expect(evaluator.evaluate({ type: 'stat_check', field: 'strength', operator: 'gte', value: 11 })).toBe(false);
    });

    it('passes when stat == value', () => {
      expect(evaluator.evaluate({ type: 'stat_check', field: 'intelligence', operator: 'eq', value: 15 })).toBe(true);
    });

    it('fails when stat is missing', () => {
      expect(evaluator.evaluate({ type: 'stat_check', field: 'charisma', operator: 'gte', value: 0 })).toBe(false);
    });
  });

  describe('intimacy_check', () => {
    it('passes when intimacy >= threshold', () => {
      expect(evaluator.evaluate({ type: 'intimacy_check', field: 'npc_001', operator: 'gte', value: 50 })).toBe(true);
    });

    it('fails when intimacy < threshold', () => {
      expect(evaluator.evaluate({ type: 'intimacy_check', field: 'npc_001', operator: 'gte', value: 51 })).toBe(false);
    });

    it('fails when NPC has no intimacy', () => {
      expect(evaluator.evaluate({ type: 'intimacy_check', field: 'npc_999', operator: 'gte', value: 0 })).toBe(false);
    });
  });

  describe('task_check', () => {
    it('passes when task status equals', () => {
      expect(evaluator.evaluate({ type: 'task_check', field: 'task_001', operator: 'eq', value: 'completed' })).toBe(true);
    });

    it('fails when task status differs', () => {
      expect(evaluator.evaluate({ type: 'task_check', field: 'task_001', operator: 'eq', value: 'active' })).toBe(false);
    });

    it('fails when task missing', () => {
      expect(evaluator.evaluate({ type: 'task_check', field: 'task_999', operator: 'eq', value: 'active' })).toBe(false);
    });
  });

  describe('item_check', () => {
    it('passes when player has item', () => {
      expect(evaluator.evaluate({ type: 'item_check', operator: 'has', value: 'sword' })).toBe(true);
    });

    it('fails when player lacks item', () => {
      expect(evaluator.evaluate({ type: 'item_check', operator: 'has', value: 'shield' })).toBe(false);
    });
  });

  describe('flag_check', () => {
    it('passes when flag equals true', () => {
      expect(evaluator.evaluate({ type: 'flag_check', field: 'met_king', operator: 'eq', value: true })).toBe(true);
    });

    it('passes when flag equals false', () => {
      expect(evaluator.evaluate({ type: 'flag_check', field: 'defeated_dragon', operator: 'eq', value: false })).toBe(true);
    });

    it('fails when flag missing', () => {
      expect(evaluator.evaluate({ type: 'flag_check', field: 'unknown_flag', operator: 'eq', value: true })).toBe(false);
    });
  });

  describe('evaluateChoices', () => {
    const choices: DialogueChoice[] = [
      { id: 'c1', text: 'Friendly', targetNodeId: 'n2', condition: { type: 'intimacy_check', field: 'npc_001', operator: 'gte', value: 40 }, actions: [] },
      { id: 'c2', text: 'Hostile', targetNodeId: 'n3', condition: { type: 'always_false', operator: 'eq', value: true }, actions: [] },
      { id: 'c3', text: 'Neutral', targetNodeId: 'n3', actions: [] },
    ];

    it('filters choices by condition', () => {
      const result = evaluator.evaluateChoices(choices);
      expect(result).toHaveLength(2);
      expect(result.map(c => c.id)).toContain('c1');
      expect(result.map(c => c.id)).toContain('c3');
    });
  });

  describe('updateContext', () => {
    it('merges new context', () => {
      evaluator.updateContext({ stats: { strength: 20 } });
      expect(evaluator.evaluate({ type: 'stat_check', field: 'strength', operator: 'gte', value: 15 })).toBe(true);
    });
  });
});

// ==================== NodeResolver Tests ====================

describe('NodeResolver', () => {
  let resolver: NodeResolver;
  let ctx: GameContext;

  beforeEach(() => {
    ctx = {
      stats: { strength: 10 },
      intimacy: { npc_001: 50 },
      tasks: {},
      items: [],
      flags: {},
    };
    resolver = createNodeResolver(ctx);
  });

  const makeNode = (id: string, type: DialogueNode['type'], text: string, overrides: Partial<DialogueNode> = {}): DialogueNode => ({
    id,
    type,
    text,
    actions: [],
    ...overrides,
  });

  it('returns null for missing node', () => {
    const result = resolver.resolve([], { treeId: 't1', currentNodeId: 'missing', visitedNodeIds: [], history: [], isComplete: false });
    expect(result).toBeNull();
  });

  it('resolves a simple text node', () => {
    const nodes: DialogueNode[] = [
      makeNode('n1', 'text', 'Hello'),
    ];
    const state = { treeId: 't1', currentNodeId: 'n1', visitedNodeIds: [], history: [], isComplete: false };
    const result = resolver.resolve(nodes, state);

    expect(result).not.toBeNull();
    expect(result!.node.id).toBe('n1');
    expect(result!.state.isComplete).toBe(true);
  });

  it('follows nextNodeId', () => {
    const nodes: DialogueNode[] = [
      makeNode('n1', 'text', 'Hello', { nextNodeId: 'n2' }),
      makeNode('n2', 'text', 'World'),
    ];
    const state = { treeId: 't1', currentNodeId: 'n1', visitedNodeIds: [], history: [], isComplete: false };
    const result = resolver.resolve(nodes, state);

    expect(result).not.toBeNull();
    expect(result!.state.currentNodeId).toBe('n2');
  });

  it('resolves choice node without selection', () => {
    const choices: DialogueChoice[] = [
      { id: 'c1', text: 'Option A', targetNodeId: 'n2', actions: [] },
      { id: 'c2', text: 'Option B', targetNodeId: 'n3', actions: [] },
    ];
    const nodes: DialogueNode[] = [
      makeNode('n1', 'choice', 'Choose:', { choices, nextNodeId: 'n1' }),
      makeNode('n2', 'text', 'A'),
      makeNode('n3', 'text', 'B'),
    ];
    const state = { treeId: 't1', currentNodeId: 'n1', visitedNodeIds: [], history: [], isComplete: false };
    const result = resolver.resolve(nodes, state);

    expect(result).not.toBeNull();
    expect(result!.availableChoices).toHaveLength(2);
    expect(result!.state.currentNodeId).toBe('n1'); // stays at choice node
  });

  it('resolves choice node with selection', () => {
    const choices: DialogueChoice[] = [
      { id: 'c1', text: 'Option A', targetNodeId: 'n2', actions: [] },
      { id: 'c2', text: 'Option B', targetNodeId: 'n3', actions: [] },
    ];
    const nodes: DialogueNode[] = [
      makeNode('n1', 'choice', 'Choose:', { choices }),
      makeNode('n2', 'text', 'A'),
      makeNode('n3', 'text', 'B'),
    ];
    const state = { treeId: 't1', currentNodeId: 'n1', visitedNodeIds: [], history: [], isComplete: false };
    const result = resolver.resolve(nodes, state, 'c1');

    expect(result).not.toBeNull();
    expect(result!.state.currentNodeId).toBe('n2');
  });

  it('returns null for unavailable choice', () => {
    const choices: DialogueChoice[] = [
      { id: 'c1', text: 'Option A', targetNodeId: 'n2', condition: { type: 'always_false', operator: 'eq', value: true }, actions: [] },
    ];
    const nodes: DialogueNode[] = [
      makeNode('n1', 'choice', 'Choose:', { choices }),
      makeNode('n2', 'text', 'A'),
    ];
    const state = { treeId: 't1', currentNodeId: 'n1', visitedNodeIds: [], history: [], isComplete: false };
    const result = resolver.resolve(nodes, state, 'c1');

    expect(result).toBeNull();
  });

  it('records visited nodes', () => {
    const nodes: DialogueNode[] = [
      makeNode('n1', 'text', 'Hello', { nextNodeId: 'n2' }),
      makeNode('n2', 'text', 'World'),
    ];
    const state = { treeId: 't1', currentNodeId: 'n1', visitedNodeIds: [], history: [], isComplete: false };
    const result = resolver.resolve(nodes, state);

    expect(result!.state.visitedNodeIds).toContain('n1');
  });

  it('executes actions on action node', () => {
    const actions: DialogueAction[] = [
      { type: 'flag_set', target: 'met_npc', value: true },
    ];
    const nodes: DialogueNode[] = [
      makeNode('n1', 'action', '', { actions, nextNodeId: 'n2' }),
      makeNode('n2', 'text', 'Done'),
    ];
    const state = { treeId: 't1', currentNodeId: 'n1', visitedNodeIds: [], history: [], isComplete: false };
    const result = resolver.resolve(nodes, state);

    expect(result).not.toBeNull();
    expect(result!.state.currentNodeId).toBe('n2');
  });
});

// ==================== AvgDialogueEngine Tests ====================

describe('AvgDialogueEngine', () => {
  let engine: AvgDialogueEngine;

  const makeTree = (id: string): DialogueTree => ({
    id,
    name: `Tree ${id}`,
    description: 'Test tree',
    rootNodeId: 'n1',
    nodes: [
      { id: 'n1', type: 'text', text: 'Hello', actions: [], nextNodeId: 'n2' },
      { id: 'n2', type: 'choice', text: 'Choose:', actions: [], choices: [
        { id: 'c1', text: 'Yes', targetNodeId: 'n3', actions: [] },
        { id: 'c2', text: 'No', targetNodeId: 'n4', actions: [] },
      ]},
      { id: 'n3', type: 'text', text: 'You said yes', actions: [] },
      { id: 'n4', type: 'text', text: 'You said no', actions: [] },
    ],
  });

  beforeEach(() => {
    engine = createAvgDialogueEngine();
  });

  describe('tree management', () => {
    it('registers a tree', () => {
      engine.registerTree(makeTree('t1'));
      expect(engine.getAllTreeIds()).toEqual(['t1']);
    });

    it('removes a tree', () => {
      engine.registerTree(makeTree('t1'));
      engine.removeTree('t1');
      expect(engine.getAllTreeIds()).toEqual([]);
    });

    it('gets a tree by id', () => {
      engine.registerTree(makeTree('t1'));
      const tree = engine.getTree('t1');
      expect(tree).toBeDefined();
      expect(tree!.name).toBe('Tree t1');
    });
  });

  describe('startTree', () => {
    it('starts a valid tree', () => {
      engine.registerTree(makeTree('t1'));
      const result = engine.startTree('t1');
      expect(result).toBe(true);
      expect(engine.currentTreeId).toBe('t1');
      expect(engine.dialogueState?.currentNodeId).toBe('n1');
    });

    it('returns false for missing tree', () => {
      expect(engine.startTree('nonexistent')).toBe(false);
    });
  });

  describe('advance', () => {
    it('advances through dialogue', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      const result = engine.advance();
      expect(result.success).toBe(true);
      expect(engine.turnNumber).toBe(1);
    });

    it('fails with no active dialogue', () => {
      const result = engine.advance();
      expect(result.success).toBe(false);
    });
  });

  describe('choose', () => {
    it('makes a choice at choice node', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      engine.advance(); // move to n2 (choice node)
      const result = engine.choose('c1');
      expect(result.success).toBe(true);
    });

    it('fails with invalid choice', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      engine.advance();
      const result = engine.choose('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('end', () => {
    it('ends dialogue', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      engine.end();
      expect(engine.currentTreeId).toBeNull();
      expect(engine.dialogueState).toBeNull();
    });
  });

  describe('getAvailableChoices', () => {
    it('returns choices at choice node', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      engine.advance(); // move to n2
      const choices = engine.getAvailableChoices();
      expect(choices).toHaveLength(2);
      expect(choices.map(c => c.text)).toContain('Yes');
      expect(choices.map(c => c.text)).toContain('No');
    });

    it('returns empty at non-choice node', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      // at n1, which is a text node
      const choices = engine.getAvailableChoices();
      expect(choices).toEqual([]);
    });
  });

  describe('SLGEngine interface', () => {
    it('executePlayerAction start', () => {
      engine.registerTree(makeTree('t1'));
      const result = engine.executePlayerAction(makeAction('start', { treeId: 't1' }));
      expect(result.success).toBe(true);
    });

    it('executePlayerAction advance', () => {
      engine.registerTree(makeTree('t1'));
      engine.executePlayerAction(makeAction('start', { treeId: 't1' }));
      const result = engine.executePlayerAction(makeAction('advance', {}));
      expect(result.success).toBe(true);
    });

    it('executePlayerAction choose', () => {
      engine.registerTree(makeTree('t1'));
      engine.executePlayerAction(makeAction('start', { treeId: 't1' }));
      engine.executePlayerAction(makeAction('advance', {}));
      const result = engine.executePlayerAction(makeAction('choose', { choiceId: 'c1' }));
      expect(result.success).toBe(true);
    });

    it('executePlayerAction end', () => {
      engine.registerTree(makeTree('t1'));
      engine.executePlayerAction(makeAction('start', { treeId: 't1' }));
      const result = engine.executePlayerAction(makeAction('end', {}));
      expect(result.success).toBe(true);
    });

    it('canExecuteAction', () => {
      engine.registerTree(makeTree('t1'));
      expect(engine.canExecuteAction(makeAction('start', { treeId: 't1' }))).toBe(true);
      expect(engine.canExecuteAction(makeAction('start', { treeId: 'bad' }))).toBe(false);
      expect(engine.canExecuteAction(makeAction('advance', {}))).toBe(false);

      engine.startTree('t1');
      expect(engine.canExecuteAction(makeAction('advance', {}))).toBe(true);
      expect(engine.canExecuteAction(makeAction('choose', {}))).toBe(true);
      expect(engine.canExecuteAction(makeAction('end', {}))).toBe(true);
    });

    it('getSnapshot', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      const snapshot = engine.getSnapshot();
      expect(snapshot.turnNumber).toBe(0);
      expect(snapshot.engineStates.avgDialogue).toBeDefined();
    });

    it('getNarrativeConstraints', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      const constraints = engine.getNarrativeConstraints();
      expect(constraints.scene).toContain('Hello');
      expect(constraints.turn).toBe(0);
    });

    it('advanceTurn', () => {
      const result = engine.advanceTurn();
      expect(result.turnNumber).toBe(1);
      expect(result.phase).toBe('narrative');
    });

    it('reset', () => {
      engine.registerTree(makeTree('t1'));
      engine.startTree('t1');
      engine.reset();
      expect(engine.getAllTreeIds()).toEqual([]);
      expect(engine.currentTreeId).toBeNull();
    });
  });

  describe('context', () => {
    it('updateContext merges', () => {
      engine.updateContext({ stats: { strength: 10 } });
      const ctx = engine.getContext();
      expect(ctx.stats.strength).toBe(10);
    });
  });

  describe('dynamic node insertion', () => {
    it('inserts a node into a tree', () => {
      engine.registerTree(makeTree('t1'));
      const newNode: DialogueNode = { id: 'n5', type: 'text', text: 'Inserted', actions: [] };
      const result = engine.insertNode('t1', newNode, 'n1');
      expect(result).toBe(true);
      const tree = engine.getTree('t1');
      expect(tree!.nodes.find(n => n.id === 'n5')).toBeDefined();
    });

    it('fails to insert duplicate', () => {
      engine.registerTree(makeTree('t1'));
      const newNode: DialogueNode = { id: 'n1', type: 'text', text: 'Dup', actions: [] };
      const result = engine.insertNode('t1', newNode);
      expect(result).toBe(false);
    });

    it('fails to insert into missing tree', () => {
      const newNode: DialogueNode = { id: 'n5', type: 'text', text: 'Test', actions: [] };
      const result = engine.insertNode('missing', newNode);
      expect(result).toBe(false);
    });
  });
});
