/**
 * inventoryManager.ts
 *
 * 背包管理 — 物品增删、堆叠、查询
 */

import type { 游戏物品 } from '../../../../models/item';

export interface InventoryItem {
  item: 游戏物品;
  quantity: number;
}

export interface InventoryOperation {
  success: boolean;
  reason?: string;
  updatedQuantity?: number;
}

export class InventoryManager {
  private _items: InventoryItem[] = [];
  private _maxSlots: number;

  constructor(maxSlots = 50) {
    this._maxSlots = maxSlots;
  }

  get items(): ReadonlyArray<InventoryItem> {
    return this._items;
  }

  get slotCount(): number {
    return this._items.length;
  }

  get maxSlots(): number {
    return this._maxSlots;
  }

  /**
   * 添加物品到背包
   */
  addItem(item: 游戏物品, quantity = 1): InventoryOperation {
    if (quantity <= 0) {
      return { success: false, reason: '数量必须大于0' };
    }

    // 检查是否已满
    const existingIndex = this._items.findIndex((inv) => inv.item.ID === item.ID);

    if (existingIndex >= 0) {
      // 已有该物品，尝试堆叠
      const existing = this._items[existingIndex];
      const maxStack = item.最大堆叠 ?? 99;
      const newQuantity = existing.quantity + quantity;

      if (newQuantity > maxStack) {
        return { success: false, reason: `堆叠上限为${maxStack}` };
      }

      existing.quantity = newQuantity;
      return { success: true, updatedQuantity: newQuantity };
    }

    // 新物品，检查格子
    if (this._items.length >= this._maxSlots) {
      return { success: false, reason: '背包已满' };
    }

    this._items.push({ item, quantity });
    return { success: true, updatedQuantity: quantity };
  }

  /**
   * 从背包移除物品
   */
  removeItem(itemId: string, quantity = 1): InventoryOperation {
    const index = this._items.findIndex((inv) => inv.item.ID === itemId);
    if (index < 0) {
      return { success: false, reason: '物品不存在' };
    }

    const existing = this._items[index];
    if (existing.quantity < quantity) {
      return { success: false, reason: '数量不足' };
    }

    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      this._items.splice(index, 1);
    }

    return { success: true, updatedQuantity: existing.quantity };
  }

  /**
   * 消耗物品（使用后消失或减少）
   */
  consumeItem(itemId: string, quantity = 1): InventoryOperation {
    return this.removeItem(itemId, quantity);
  }

  /**
   * 检查是否拥有某物品
   */
  hasItem(itemId: string, quantity = 1): boolean {
    const inv = this._items.find((i) => i.item.ID === itemId);
    return inv != null && inv.quantity >= quantity;
  }

  /**
   * 获取某物品的堆叠数量
   */
  getQuantity(itemId: string): number {
    return this._items.find((i) => i.item.ID === itemId)?.quantity ?? 0;
  }

  /**
   * 查找物品
   */
  findItem(itemId: string): InventoryItem | undefined {
    return this._items.find((i) => i.item.ID === itemId);
  }

  /**
   * 清空背包
   */
  clear(): void {
    this._items = [];
  }
}
