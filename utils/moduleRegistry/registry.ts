/**
 * UI 功能模块注册表 — 集中管理所有已注册 UI 模块
 *
 * 借鉴 StoryModuleRegistry 模式，提供注册、查询、过滤、依赖检查等功能。
 */

import type { UIFeatureModule, ModuleCategory } from './types';

export class UIFeatureRegistry {
  private static _modules = new Map<string, UIFeatureModule>();

  /** 注册模块（应用启动时调用一次） */
  static register(module: UIFeatureModule): void {
    if (this._modules.has(module.id)) {
      console.warn(`[UI模块] 模块 ${module.id} 已被注册，将覆盖`);
    }
    this._modules.set(module.id, module);
  }

  /** 获取单个模块 */
  static get(id: string): UIFeatureModule | undefined {
    return this._modules.get(id);
  }

  /** 获取所有已注册模块 */
  static getAll(): UIFeatureModule[] {
    return Array.from(this._modules.values());
  }

  /** 获取有弹窗配置的模块 */
  static getModals(): UIFeatureModule[] {
    return this.getAll().filter(m => m.modal);
  }

  /** 按分类过滤 */
  static getByCategory(category: ModuleCategory): UIFeatureModule[] {
    return this.getAll().filter(m => m.category === category);
  }

  /** 检查模块依赖是否满足 */
  static dependenciesSatisfied(moduleId: string, activeIds: Set<string>): boolean {
    const module = this.get(moduleId);
    if (!module) return false;
    return module.dependencies.every(dep => activeIds.has(dep));
  }

  /** 获取模块注册摘要（用于调试/管理界面） */
  static getSummary(): Array<{
    id: string;
    name: string;
    category: string;
    hasModal: boolean;
    dependencies: string[];
    version: string;
  }> {
    return this.getAll().map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      hasModal: !!m.modal,
      dependencies: m.dependencies,
      version: m.version,
    }));
  }

  /** 清除所有注册（测试用） */
  static clear(): void {
    this._modules.clear();
  }
}
