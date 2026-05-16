/**
 * rpgItemEngine.ts
 *
 * RPG 物品引擎 — 管理背包、物品使用、消耗
 */

import { BaseEngine } from '../engine/baseEngine';
import type {
  GameEvent,
  GameStateSnapshot,
  NarrativeConstraint,
  TurnResult,
  PlayerAction,
  ActionResult,
  EngineType,
} from '../engine/types';
import { InventoryManager, type InventoryItem } from '../rpg/inventory';
import type { 游戏物品 } from '../../../models/item';
import type { 角色数据结构 } from '../../../models/character';

export class RpgItemEngine extends BaseEngine {
  private _inventory: InventoryManager;
  private _turnNumber = 0;

  constructor(maxSlots = 50) {
    super('rpgItem' as EngineType);
    this._inventory = new InventoryManager(maxSlots);
  }

  get inventory(): ReadonlyArray<InventoryItem> {
    return this._inventory.items;
  }

  get slotCount(): number {
    return this._inventory.slotCount;
  }

  get maxSlots(): number {
    return this._inventory.maxSlots;
  }

  getItemQuantity(itemId: string): number {
    return this._inventory.getQuantity(itemId);
  }

  hasItem(itemId: string, quantity = 1): boolean {
    return this._inventory.hasItem(itemId, quantity);
  }

  /**
   * 添加物品
   */
  addItem(item: 游戏物品, quantity = 1): ActionResult {
    const result = this._inventory.addItem(item, quantity);

    this._publishItemEvent('ITEM_GAIN', {
      itemId: item.ID,
      itemName: item.名称,
      quantity,
      success: result.success,
    });

    return {
      success: result.success,
      stateUpdates: { item: item.ID, quantity: result.updatedQuantity },
      narrativeConstraint: result.success
        ? `<物品>获得${item.名称} x${quantity}</物品>`
        : `<物品>${result.reason}</物品>`,
      keyStep: result.success,
      sideEffects: [{ type: 'item_gain', payload: { itemId: item.ID, quantity } }],
    };
  }

  /**
   * 移除物品
   */
  removeItem(itemId: string, quantity = 1): ActionResult {
    const result = this._inventory.removeItem(itemId, quantity);
    const invItem = this._inventory.findItem(itemId);

    this._publishItemEvent('ITEM_LOSE', {
      itemId,
      itemName: invItem?.item.名称,
      quantity,
      success: result.success,
    });

    return {
      success: result.success,
      stateUpdates: { item: itemId, quantity: result.updatedQuantity },
      narrativeConstraint: result.success
        ? `<物品>失去${invItem?.item.名称 ?? itemId} x${quantity}</物品>`
        : `<物品>${result.reason}</物品>`,
      keyStep: false,
      sideEffects: [{ type: 'item_lose', payload: { itemId, quantity } }],
    };
  }

  /**
   * 使用物品（消耗品）
   */
  useItem(itemId: string, _character: 角色数据结构, quantity = 1): ActionResult {
    const invItem = this._inventory.findItem(itemId);
    if (!invItem) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: '<物品>物品不存在于背包</物品>',
        keyStep: false,
        sideEffects: [],
      };
    }

    if (invItem.item.类型 !== '消耗品') {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<物品>${invItem.item.名称}不是消耗品</物品>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    const consumeResult = this._inventory.consumeItem(itemId, quantity);
    if (!consumeResult.success) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<物品>${consumeResult.reason}</物品>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    this._publishItemEvent('ITEM_USE', {
      itemId,
      itemName: invItem.item.名称,
      quantity,
    });

    return {
      success: true,
      stateUpdates: { itemUsed: itemId },
      narrativeConstraint: `<物品>使用${invItem.item.名称} x${quantity}</物品>`,
      keyStep: true,
      sideEffects: [{ type: 'item_use', payload: { itemId, quantity } }],
    };
  }

  /**
   * 清空背包
   */
  clearInventory(): void {
    this._inventory.clear();
    this._publishItemEvent('ITEM_LOSE', { reason: 'inventory_cleared' });
  }

  // ==================== SLGEngine 接口 ====================

  advanceTurn(): TurnResult {
    this._turnNumber++;
    return {
      turnNumber: this._turnNumber,
      phase: 'narrative',
      eventsTriggered: [],
      stateChanges: [],
    };
  }

  executePlayerAction(action: PlayerAction): ActionResult {
    const { type, payload } = action;

    if (type === 'use_item') {
      const itemId = payload.itemId as string;
      const quantity = (payload.quantity as number) ?? 1;
      const character = payload.character as 角色数据结构 | undefined;
      if (!character) {
        return {
          success: false,
          stateUpdates: {},
          narrativeConstraint: '<物品>缺少角色数据</物品>',
          keyStep: false,
          sideEffects: [],
        };
      }
      return this.useItem(itemId, character, quantity);
    }

    if (type === 'drop_item') {
      const itemId = payload.itemId as string;
      const quantity = (payload.quantity as number) ?? 1;
      return this.removeItem(itemId, quantity);
    }

    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: '<物品>未知操作类型</物品>',
      keyStep: false,
      sideEffects: [],
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    return ['use_item', 'drop_item'].includes(action.type);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        rpgItem: {
          slotCount: this._inventory.slotCount,
          maxSlots: this._inventory.maxSlots,
          items: this._inventory.items.map((i: InventoryItem) => ({
            id: i.item.ID,
            name: i.item.名称,
            quantity: i.quantity,
          })),
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    return {
      scene: '背包管理',
      turn: this._turnNumber,
      tension: 0,
      playerAction: `背包: ${this._inventory.slotCount}/${this._inventory.maxSlots} 格`,
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: 'item_use',
    };
  }

  reset(): void {
    this._inventory.clear();
    this._turnNumber = 0;
    super.pause('phase-change');
    super.resume();
  }

  serialize(): Record<string, unknown> {
    return {
      engineType: 'rpgItem',
      turnNumber: this._turnNumber,
      maxSlots: this._inventory.maxSlots,
      items: this._inventory.items,
    };
  }

  static fromJSON(state: Record<string, unknown>): RpgItemEngine {
    const maxSlots = typeof state.maxSlots === 'number' ? state.maxSlots : 50;
    const engine = new RpgItemEngine(maxSlots);
    if (typeof state.turnNumber === 'number') engine._turnNumber = state.turnNumber;
    if (Array.isArray(state.items)) {
      const invItems = state.items as InventoryItem[];
      engine._inventory = new InventoryManager(maxSlots);
      for (const invItem of invItems) {
        engine._inventory.addItem(invItem.item, invItem.quantity);
      }
    }
    return engine;
  }

  private _publishItemEvent(type: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: `item-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      engineType: this._engineType,
      type,
      description: `Item event: ${type}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }
}

/** 工厂函数 */
export function createRpgItemEngine(maxSlots = 50): RpgItemEngine {
  return new RpgItemEngine(maxSlots);
}
