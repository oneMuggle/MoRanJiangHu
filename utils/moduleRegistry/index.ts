/**
 * UI 功能模块注册系统 - 统一导出
 */

export { UIFeatureRegistry } from './registry';
export { useModalManager } from './modalHooks';
export { ModalRenderer } from './modalRenderer';
export { createSelectors } from './selectors';
export type {
  UIFeatureModule,
  ModalConfig,
  ModalPropsContext,
  ModalManagerAPI,
  ModuleCategory,
  ModuleVisibility,
} from './types';
