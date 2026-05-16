/**
 * modeManager.ts
 *
 * 统一模式管理。支持：traditional, galgame, rpg, exploration。
 * 模式切换时保存/恢复 UI 状态。
 */

export type GameMode = 'traditional' | 'galgame' | 'rpg' | 'exploration';

export interface ModeState {
  mode: GameMode;
  /** 模式切换前保存的 UI 快照 */
  previousUiState: Record<string, unknown> | null;
  /** 当前模式是否启用 */
  isEnabled: (mode: GameMode) => boolean;
  /** 切换到指定模式 */
  switchMode: (mode: GameMode) => void;
}

type ModeChangeListener = (oldMode: GameMode, newMode: GameMode) => void;

let _currentMode: GameMode = 'traditional';
let _uiStateSnapshot: Record<string, unknown> | null = null;
const _listeners = new Set<ModeChangeListener>();

/** 获取当前模式 */
export function getCurrentMode(): GameMode {
  return _currentMode;
}

/** 切换模式 */
export function switchMode(newMode: GameMode): void {
  const oldMode = _currentMode;
  if (oldMode === newMode) return;

  _uiStateSnapshot = { mode: oldMode, timestamp: Date.now() };
  _currentMode = newMode;

  for (const listener of _listeners) {
    listener(oldMode, newMode);
  }
}

/** 注册模式切换监听器 */
export function onModeChange(listener: ModeChangeListener): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

/** 获取上次保存的 UI 状态 */
export function getUiStateSnapshot(): Record<string, unknown> | null {
  return _uiStateSnapshot;
}

/** 重置模式（新游戏/读档用） */
export function resetMode(mode: GameMode = 'traditional'): void {
  _currentMode = mode;
  _uiStateSnapshot = null;
}

/** 序列化当前模式状态 */
export function serializeMode(): { mode: GameMode } {
  return { mode: _currentMode };
}

/** 从存档恢复模式 */
export function deserializeMode(data: { mode?: GameMode }): void {
  if (data.mode && isValidMode(data.mode)) {
    _currentMode = data.mode;
  } else {
    _currentMode = 'traditional';
  }
}

function isValidMode(mode: string): mode is GameMode {
  return ['traditional', 'galgame', 'rpg', 'exploration'].includes(mode);
}
