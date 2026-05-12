/**
 * SLG + AI 混合架构 — 引擎注册表
 *
 * 管理所有子引擎的生命周期：注册、注销、动态加载/卸载。
 * 提供跨引擎事件路由和优先级调度支持。
 */

import type {
  SLGEngine,
  EngineType,
  EnginePriority,
  GameEvent,
} from './types';
import { ENGINE_PRIORITY } from './types';
import { getEventBus } from '../events/globalEventBus';
import type { EventSubscriber } from '../events/eventSubscriber';

export interface EngineMetadata {
  type: EngineType;
  priority: EnginePriority;
  registeredAt: number;
  isActive: boolean;
}

export interface EngineRegistrySnapshot {
  engines: EngineMetadata[];
  activeCount: number;
  totalCount: number;
}

export class EngineRegistry {
  private _engines = new Map<EngineType, SLGEngine>();
  private _metadata = new Map<EngineType, EngineMetadata>();

  /**
   * 注册引擎到注册表。
   * 如果引擎实现了 EventSubscriber 接口，自动订阅到 EventBus。
   */
  register(engine: SLGEngine): void {
    const type = engine.getEngineType();
    if (this._engines.has(type)) {
      throw new Error(`引擎 ${type} 已注册，请先注销后再注册`);
    }

    this._engines.set(type, engine);
    this._metadata.set(type, {
      type,
      priority: ENGINE_PRIORITY[type],
      registeredAt: Date.now(),
      isActive: true,
    });

    // 如果引擎实现了 EventSubscriber，自动订阅
    const subscriber = engine as Partial<EventSubscriber>;
    if (typeof subscriber.handleEvent === 'function') {
      getEventBus().subscribe(subscriber as EventSubscriber);
    }
  }

  /**
   * 注销并移除引擎。
   * 如果引擎之前订阅了 EventBus，自动取消订阅。
   */
  unregister(type: EngineType): boolean {
    const engine = this._engines.get(type);
    if (!engine) return false;

    // 自动取消 EventBus 订阅
    getEventBus().unsubscribe(type);

    this._engines.delete(type);
    this._metadata.delete(type);
    return true;
  }

  /**
   * 获取已注册的引擎。
   */
  get<T extends SLGEngine>(type: EngineType): T | undefined {
    return this._engines.get(type) as T | undefined;
  }

  /**
   * 检查引擎是否已注册。
   */
  has(type: EngineType): boolean {
    return this._engines.has(type);
  }

  /**
   * 获取所有已注册的引擎。
   */
  getAll(): SLGEngine[] {
    return Array.from(this._engines.values());
  }

  /**
   * 获取按优先级排序的引擎列表（高优先级在前）。
   */
  getByPriority(): SLGEngine[] {
    const priorityOrder: EngineType[] = Object.keys(ENGINE_PRIORITY) as EngineType[];
    const sorted: SLGEngine[] = [];

    for (const type of priorityOrder) {
      const engine = this._engines.get(type);
      if (engine) sorted.push(engine);
    }

    for (const [type, engine] of this._engines) {
      if (!ENGINE_PRIORITY[type] && !sorted.includes(engine)) {
        sorted.push(engine);
      }
    }

    return sorted;
  }

  /**
   * 获取所有活跃引擎。
   */
  getActive(): SLGEngine[] {
    return this.getByPriority().filter((engine) => {
      const meta = this._metadata.get(engine.getEngineType());
      return meta?.isActive && !engine.isPaused();
    });
  }

  /**
   * 激活/停用引擎。
   */
  setActive(type: EngineType, active: boolean): void {
    const meta = this._metadata.get(type);
    if (meta) {
      meta.isActive = active;
    }
  }

  /**
   * 获取引擎元数据。
   */
  getMetadata(type: EngineType): EngineMetadata | undefined {
    return this._metadata.get(type);
  }

  /**
   * 获取注册表快照。
   */
  getSnapshot(): EngineRegistrySnapshot {
    const engines = Array.from(this._metadata.values());
    return {
      engines,
      activeCount: engines.filter((m) => m.isActive).length,
      totalCount: engines.length,
    };
  }

  /**
   * 跨引擎事件路由：将事件分发到目标引擎。
   */
  routeEvent(_sourceType: EngineType, event: GameEvent): void {
    const targetEngine = this._engines.get(event.engineType);
    if (!targetEngine) return;
    targetEngine.enqueueEvent(event);
  }

  /**
   * 广播事件到所有引擎，同时发布到 EventBus。
   */
  broadcastEvent(event: GameEvent): void {
    for (const engine of this._engines.values()) {
      engine.enqueueEvent(event);
    }
    // 同时发布到 EventBus，让非 SLGEngine 订阅者也能收到
    getEventBus().publish(event);
  }

  /**
   * 获取已注册引擎类型列表。
   */
  get registeredTypes(): EngineType[] {
    return Array.from(this._engines.keys());
  }

  /**
   * 获取活跃引擎数量。
   */
  get activeCount(): number {
    let count = 0;
    for (const [type] of this._metadata) {
      const meta = this._metadata.get(type);
      const engine = this._engines.get(type);
      if (meta?.isActive && engine && !engine.isPaused()) count++;
    }
    return count;
  }
}

export function createEngineRegistry(): EngineRegistry {
  return new EngineRegistry();
}
