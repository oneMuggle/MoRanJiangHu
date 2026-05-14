/**
 * UI 功能模块注册系统 - 类型定义
 *
 * 借鉴 StoryModuleRegistry 和 EngineRegistry 模式，为 UI 模块建立统一注册表。
 */

import * as React from 'react';

/** 模块分类 */
export type ModuleCategory = 'core' | 'nsfw' | 'settings' | 'tools' | 'narrative' | 'entertainment';

/** 模块可见性控制 */
export type ModuleVisibility = 'always' | 'era-dependent' | 'config-dependent' | 'hidden';

/** ModalManager 接口 - 在 propsFactory 中使用 */
export interface ModalManagerAPI {
  open: (moduleId: string, payload?: unknown) => void;
  close: (moduleId: string) => void;
  closeAll: () => void;
  toggle: (moduleId: string) => void;
  isOpen: (moduleId: string) => boolean;
  /** 当前打开的弹窗 Map（供 propsFactory 读取 payload） */
  openModals: Map<string, unknown>;
}

/** 弹窗 Props 构造上下文 */
export interface ModalPropsContext {
  state: Record<string, unknown>;
  meta: Record<string, unknown>;
  setters: Record<string, (value: unknown) => void>;
  actions: Record<string, (...args: unknown[]) => unknown>;
  modalManager: ModalManagerAPI;
  isMobile: boolean;
  /** 确认对话框（供 ConfirmModal 使用） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestConfirm?: (options: any) => Promise<boolean>;
  /** 额外 props（由 App.tsx 注入，无法从 state 获取的值） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraProps?: Record<string, any>;
}

/** 弹窗渲染配置 */
export interface ModalConfig {
  /** 懒加载的弹窗组件（桌面版） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  desktopComponent: React.LazyExoticComponent<React.ComponentType<any>>;
  /** 懒加载的弹窗组件（移动版） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mobileComponent?: React.LazyExoticComponent<React.ComponentType<any>>;
  /** 可见性控制 */
  visibility: ModuleVisibility;
  /** 依赖的 gameConfig 键（visibility=config-dependent 时生效） */
  configKey?: string;
  /** 依赖的 gameConfig 值（visibility=config-dependent 时生效） */
  configValue?: unknown;
  /** 是否仅在 game view 中渲染 */
  gameViewOnly?: boolean;
  /** 对应 state 中的布尔键名，用于兼容旧系统（如 setShowInventory → state.showInventory） */
  stateKey?: string;
  /** Props 工厂函数：从 state/setters/actions 构造组件 props */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propsFactory: (ctx: ModalPropsContext) => Record<string, any>;
}

/** UI 功能模块完整定义 */
export interface UIFeatureModule {
  /** 唯一标识，如 'character'、'campusDesire' */
  id: string;
  /** 显示名称，如 '角色面板'、'校园欲望' */
  name: string;
  /** 图标（emoji 或 SVG 路径） */
  icon: string;
  /** 模块分类 */
  category: ModuleCategory;
  /** 所属时代 ID（可选） */
  eraId?: string;
  /** 依赖的其他模块 ID */
  dependencies: string[];
  /** 关联的 StoryModule ID（AI 侧） */
  storyModuleId?: string;
  /** 渲染优先级（数字越大越先渲染） */
  priority: number;
  /** 描述 */
  description?: string;
  /** 弹窗配置（无此字段表示无 UI 弹窗） */
  modal?: ModalConfig;
  /** 版本号 */
  version: string;
}
