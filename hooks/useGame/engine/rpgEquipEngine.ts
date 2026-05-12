/**
 * rpgEquipEngine.ts
 *
 * RPG 装备引擎 — 管理装备穿戴、卸下、属性修正
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
import {
  calculateItemModifiers,
  mergeModifiers,
  type EquipModifiers,
} from '../rpg/equipment';
import { calculateEncumbrance, canCarry, type EncumbranceResult } from '../rpg/equipment';
import type { 游戏物品 } from '../../../models/item';
import type { 角色数据结构 } from '../../../models/character';

/** 装备槽位 */
export interface EquipSlots {
  武器: 游戏物品 | undefined;
  防具: 游戏物品 | undefined;
  饰品: 游戏物品 | undefined;
}

export class RpgEquipEngine extends BaseEngine {
  private _equipment: EquipSlots = { 武器: undefined, 防具: undefined, 饰品: undefined };
  private _turnNumber = 0;

  constructor() {
    super('rpgEquip' as EngineType);
  }

  get equipment(): Readonly<EquipSlots> {
    return this._equipment;
  }

  /**
   * 穿戴装备
   */
  equip(slot: keyof EquipSlots, item: 游戏物品): ActionResult {
    this._equipment[slot] = item;

    const modifiers = calculateItemModifiers(item);
    this._publishEquipEvent('EQUIP_CHANGE', {
      slot,
      itemId: item.ID,
      itemName: item.名称,
      modifiers,
    });

    return {
      success: true,
      stateUpdates: { equipment: { [slot]: item.ID }, modifiers },
      narrativeConstraint: `<装备>穿戴${item.名称}到${slot}</装备>`,
      keyStep: true,
      sideEffects: [{ type: 'equip_change', payload: { slot, itemId: item.ID } }],
    };
  }

  /**
   * 卸下装备
   */
  unequip(slot: keyof EquipSlots): ActionResult {
    const previous = this._equipment[slot];
    if (!previous) {
      return {
        success: false,
        stateUpdates: {},
        narrativeConstraint: `<装备>${slot}槽位为空</装备>`,
        keyStep: false,
        sideEffects: [],
      };
    }

    this._equipment[slot] = undefined;

    this._publishEquipEvent('EQUIP_CHANGE', {
      slot,
      itemId: null,
      previousItemId: previous.ID,
    });

    return {
      success: true,
      stateUpdates: { equipment: { [slot]: undefined } },
      narrativeConstraint: `<装备>卸下${previous.名称}</装备>`,
      keyStep: false,
      sideEffects: [{ type: 'unequip', payload: { slot, itemId: previous.ID } }],
    };
  }

  /**
   * 计算当前总属性修正
   */
  getTotalModifiers(): EquipModifiers {
    const modifiers: EquipModifiers[] = [];

    for (const item of Object.values(this._equipment)) {
      if (item) {
        modifiers.push(calculateItemModifiers(item));
      }
    }

    return modifiers.length > 0 ? mergeModifiers(...modifiers) : this._zeroModifiers();
  }

  /**
   * 计算负重
   */
  calculateEncumbrance(character: 角色数据结构, inventory: 游戏物品[]): EncumbranceResult {
    return calculateEncumbrance(character, inventory);
  }

  /**
   * 检查是否可以携带新物品
   */
  canCarryItem(
    character: 角色数据结构,
    inventory: 游戏物品[],
    item: 游戏物品,
    quantity = 1,
  ): boolean {
    return canCarry(character, inventory, item, quantity);
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

    if (type === 'equip') {
      const slot = payload.slot as keyof EquipSlots;
      const item = payload.item as 游戏物品 | undefined;
      if (!item) {
        return this.unequip(slot);
      }
      return this.equip(slot, item);
    }

    if (type === 'unequip') {
      const slot = payload.slot as keyof EquipSlots;
      return this.unequip(slot);
    }

    return {
      success: false,
      stateUpdates: {},
      narrativeConstraint: '<装备>未知操作类型</装备>',
      keyStep: false,
      sideEffects: [],
    };
  }

  canExecuteAction(action: PlayerAction): boolean {
    return ['equip', 'unequip'].includes(action.type);
  }

  getSnapshot(): GameStateSnapshot {
    return {
      turnNumber: this._turnNumber,
      timestamp: Date.now(),
      engineStates: {
        rpgEquip: {
          equipment: {
            武器: this._equipment.武器?.ID,
            防具: this._equipment.防具?.ID,
            饰品: this._equipment.饰品?.ID,
          },
        },
      },
    };
  }

  getNarrativeConstraints(): NarrativeConstraint {
    const equippedItems = Object.entries(this._equipment)
      .filter(([, item]) => item != null)
      .map(([slot, item]) => `${slot}:${item!.名称}`);

    return {
      scene: '装备管理',
      turn: this._turnNumber,
      tension: 0,
      playerAction: equippedItems.length > 0 ? `已装备: ${equippedItems.join(', ')}` : '未装备任何物品',
      keyStep: false,
      nsfwTriggered: false,
      participants: [],
      nextEvent: 'equip_change',
    };
  }

  reset(): void {
    this._equipment = { 武器: undefined, 防具: undefined, 饰品: undefined };
    this._turnNumber = 0;
    super.pause('phase-change');
    super.resume();
  }

  private _publishEquipEvent(type: string, payload: Record<string, unknown>): void {
    const event: GameEvent = {
      id: `equip-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      engineType: this._engineType,
      type,
      description: `Equipment event: ${type}`,
      status: 'pending',
      payload,
      createdAt: Date.now(),
    };
    this.enqueueEvent(event);
  }

  private _zeroModifiers(): EquipModifiers {
    return {
      力量: 0, 敏捷: 0, 体质: 0, 根骨: 0, 悟性: 0, 福源: 0,
      攻击力: 0, 防御力: 0, 速度: 0, 暴击率: 0, 闪避率: 0,
    };
  }
}

/** 工厂函数 */
export function createRpgEquipEngine(): RpgEquipEngine {
  return new RpgEquipEngine();
}
