/**
 * SLG + AI 混合架构 — 统一类型定义
 *
 * 所有子引擎共享的接口和类型，确保引擎间可互操作。
 */

// ==================== 引擎类型枚举 ====================

export type EngineType =
  | 'boardGame'
  | 'urbanDriver'
  | 'phoneSim'
  | 'campusNSFW'
  | 'bdsm'
  | 'global'
  // RPG engines (Phases 7-9)
  | 'rpgBattle'
  | 'rpgEquip'
  | 'rpgItem'
  | 'rpgKungfu'
  | 'rpgTask'
  | 'rpgSect'
  // AVG engines (Phases 11-13)
  | 'avgDialogue'
  | 'avgRelation'
  | 'avgBranch'
  // Exploration engine (Phase 14)
  | 'exploration'
  // Daily town engine (Phase 10)
  | 'dailyTown'
  // Notification engine (promoted from standalone class)
  | 'notification';

// ==================== 回合系统 ====================

export type TurnPhase = 'idle' | 'player-action' | 'resolution' | 'narrative' | 'transition';

export type PauseReason = 'chat-sent' | 'key-step' | 'player-pause' | 'phase-change' | 'error';

export interface TurnResult {
  turnNumber: number;
  phase: TurnPhase;
  eventsTriggered: GameEvent[];
  stateChanges: StateChange[];
}

export interface ScheduledEvent {
  id: string;
  engineType: EngineType;
  triggerTurn: number;
  offset?: number;
  condition?: string;
  payload: Record<string, unknown>;
  chainTo?: string;
}

// ==================== 玩家操作 ====================

export interface PlayerAction {
  id: string;
  engineType: EngineType;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface ActionResult {
  success: boolean;
  stateUpdates: Partial<Record<string, unknown>>;
  narrativeConstraint: string;
  keyStep: boolean;
  sideEffects: SideEffect[];
}

export interface SideEffect {
  type: string;
  payload: Record<string, unknown>;
}

// ==================== 事件系统 ====================

export type EventStatus = 'pending' | 'resolved' | 'expired';

export interface GameEvent {
  id: string;
  engineType: EngineType;
  type: string;
  description: string;
  status: EventStatus;
  payload: Record<string, unknown>;
  createdAt: number;
  resolvedAt?: number;
}

export interface ResolvedEvent {
  event: GameEvent;
  result: ActionResult;
}

// ==================== 状态管理 ====================

export interface StateChange {
  key: string;
  before: unknown;
  after: unknown;
}

export interface GameStateSnapshot {
  turnNumber: number;
  timestamp: number;
  engineStates: Record<string, Record<string, unknown>>;
}

// ==================== 叙事约束 ====================

export interface NarrativeConstraint {
  scene: string;
  turn: number;
  tension: number;
  playerAction: string;
  keyStep: boolean;
  nsfwTriggered: boolean;
  participants: NPCInfo[];
  nextEvent: string;
}

export interface NPCInfo {
  id: string;
  name: string;
  status: string;
  desireStage?: string;
  extra?: Record<string, unknown>;
}

// ==================== AI 叙事响应 ====================

export type EmotionalTone = 'calm' | 'tense' | 'excited' | 'fearful' | 'romantic' | 'dramatic';

export interface NPCReaction {
  npcId: string;
  reaction: string;
  emotion: EmotionalTone;
}

export interface AINarrativeResponse {
  narrativeText: string;
  npcReactions: NPCReaction[];
  stateUpdates: Partial<Record<string, unknown>>;
  emotionalTone: EmotionalTone;
  suggestedNextActions: string[];
}

// ==================== 操作日志（事件溯源） ====================

export interface ActionLogEntry {
  id: string;
  timestamp: number;
  turnNumber: number;
  engineType: EngineType;
  action: PlayerAction;
  result: ActionResult;
  snapshotBefore: GameStateSnapshot;
  snapshotAfter: GameStateSnapshot;
}

// ==================== SLG 引擎接口 ====================

export interface SLGEngine {
  advanceTurn(): TurnResult;
  pause(reason: PauseReason): void;
  resume(): void;
  isPaused(): boolean;
  getPauseReason(): PauseReason | null;
  enqueueEvent(event: GameEvent): void;
  resolvePendingEvents(): ResolvedEvent[];
  scheduleEvent(event: ScheduledEvent): void;
  executePlayerAction(action: PlayerAction): ActionResult;
  canExecuteAction(action: PlayerAction): boolean;
  getSnapshot(): GameStateSnapshot;
  getNarrativeConstraints(): NarrativeConstraint;
  getEngineType(): EngineType;
}

// ==================== 引擎优先级 ====================

export type EnginePriority = 'high' | 'medium' | 'low';

export const ENGINE_PRIORITY: Record<EngineType, EnginePriority> = {
  boardGame: 'high',
  urbanDriver: 'high',
  phoneSim: 'medium',
  campusNSFW: 'medium',
  bdsm: 'low',
  global: 'high',
  // RPG engines
  rpgBattle: 'high',
  rpgEquip: 'medium',
  rpgItem: 'medium',
  rpgKungfu: 'medium',
  rpgTask: 'low',
  rpgSect: 'medium',
  // AVG engines
  avgDialogue: 'high',
  avgRelation: 'medium',
  avgBranch: 'medium',
  // Exploration
  exploration: 'high',
  // Daily town
  dailyTown: 'medium',
  // Notification
  notification: 'low',
};
