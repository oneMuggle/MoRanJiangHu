/**
 * 弹窗管理器 Hook — 取代 useAppModalState + useModalOpeners
 *
 * 使用 Map<string, payload> 管理弹窗状态，自动从注册表生成 openers/closers。
 */

import * as React from 'react';
import { UIFeatureRegistry } from './registry';
import type { ModalManagerAPI } from './types';

export interface ModalManager extends ModalManagerAPI {
  /** 当前所有打开的弹窗及其 payload */
  openModals: Map<string, unknown>;
  /** 便捷 openers（向后兼容旧代码） */
  openers: Record<string, () => void>;
  /** 便捷 closers */
  closers: Record<string, () => void>;
}

/** 将模块 id 转换为驼峰命名的函数名（如 'campusDesire' → 'CampusDesire'） */
function pascalCase(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export function useModalManager(): ModalManager {
  const [openModals, setOpenModals] = React.useState<Map<string, unknown>>(new Map());

  const modulesRef = React.useRef(UIFeatureRegistry.getAll());

  const open = React.useCallback((moduleId: string, payload?: unknown) => {
    setOpenModals(prev => {
      const next = new Map(prev);
      next.set(moduleId, payload ?? true);
      return next;
    });
  }, []);

  const close = React.useCallback((moduleId: string) => {
    setOpenModals(prev => {
      const next = new Map(prev);
      next.delete(moduleId);
      return next;
    });
  }, []);

  const closeAll = React.useCallback(() => {
    setOpenModals(new Map());
  }, []);

  const toggle = React.useCallback((moduleId: string) => {
    setOpenModals(prev => {
      const next = new Map(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.set(moduleId, true);
      }
      return next;
    });
  }, []);

  const isOpen = React.useCallback(
    (moduleId: string) => openModals.has(moduleId),
    [openModals],
  );

  // 自动从注册表生成 openers/closers
  const openers = React.useMemo(() => {
    const result: Record<string, () => void> = {};
    for (const mod of modulesRef.current) {
      result[`open${pascalCase(mod.id)}`] = () => open(mod.id);
    }
    return result;
  }, [open]);

  const closers = React.useMemo(() => {
    const result: Record<string, () => void> = {};
    for (const mod of modulesRef.current) {
      result[`close${pascalCase(mod.id)}`] = () => close(mod.id);
    }
    return result;
  }, [close]);

  return { open, close, closeAll, toggle, isOpen, openModals, openers, closers };
}
