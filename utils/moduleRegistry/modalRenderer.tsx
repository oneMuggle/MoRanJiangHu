/**
 * 统一弹窗渲染器 — 取代 ModalLayer.tsx + NSFWModals.tsx
 *
 * 从 UIFeatureRegistry 读取所有弹窗配置，按优先级排序渲染。
 * 支持可见性控制（always / era-dependent / config-dependent / hidden）。
 */

import * as React from 'react';
import { 懒加载边界 } from '../../components/features/lazyComponents';
import { UIFeatureRegistry } from './registry';
import type { ModalPropsContext } from './types';

interface ModalRendererProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setters: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: Record<string, any>;
  isMobile: boolean;
  /** 当前打开的弹窗 ID 集合 */
  openModals: Map<string, unknown>;
  /** 关闭弹窗的回调 */
  onClose: (moduleId: string) => void;
  /** 确认对话框 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestConfirm?: (options: any) => Promise<boolean>;
  /** 额外 props（无法从 state 获取的值，如 runtimeStateSections） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraProps?: Record<string, any>;
}

export function ModalRenderer({
  state,
  meta,
  setters,
  actions,
  isMobile,
  openModals,
  onClose,
  requestConfirm,
  extraProps,
}: ModalRendererProps) {
  const modalModules = React.useMemo(
    () => UIFeatureRegistry.getModals().sort((a, b) => b.priority - a.priority),
    [],
  );

  return (
    <>
      {modalModules.map(module => {
        if (!module.modal) return null;

        // 可见性检查：gameViewOnly
        if (module.modal.gameViewOnly && state.view !== 'game') return null;

        // 可见性检查：config-dependent
        if (module.modal.visibility === 'config-dependent' && module.modal.configKey) {
          const config = state.gameConfig as Record<string, unknown> | undefined;
          const actualValue = config?.[module.modal.configKey];
          if (actualValue !== module.modal.configValue) return null;
        }

        // 可见性检查：hidden
        if (module.modal.visibility === 'hidden') return null;

        // 检查弹窗是否打开：同时支持新系统（openModals Map）和旧系统（state.showXxx 布尔值）
        const isOpenViaMap = openModals.has(module.id);
        const isOpenViaState = module.modal.stateKey ? !!state[module.modal.stateKey] : false;
        if (!isOpenViaMap && !isOpenViaState) return null;

        // 构造 modalManager API 传给 propsFactory
        const modalManager = {
          open: (id: string, payload?: unknown) => {
            window.dispatchEvent(new CustomEvent('modal:open', { detail: { id, payload } }));
          },
          close: onClose,
          closeAll: () => {
            window.dispatchEvent(new CustomEvent('modal:closeAll'));
          },
          toggle: (id: string) => {
            window.dispatchEvent(new CustomEvent('modal:toggle', { detail: { id } }));
          },
          isOpen: (id: string) => openModals.has(id),
          openModals,
        };

        const context: ModalPropsContext = {
          state,
          meta,
          setters,
          actions,
          modalManager,
          isMobile,
          requestConfirm,
          extraProps,
        };

        const props = module.modal.propsFactory(context);
        // 确保 onClose 始终存在
        if (!props.onClose) {
          props.onClose = () => onClose(module.id);
        }

        const Component = isMobile && module.modal.mobileComponent
          ? module.modal.mobileComponent
          : module.modal.desktopComponent;

        return (
          <React.Fragment key={module.id}>
            <懒加载边界>
              <Component {...props} />
            </懒加载边界>
          </React.Fragment>
        );
      })}
    </>
  );
}
