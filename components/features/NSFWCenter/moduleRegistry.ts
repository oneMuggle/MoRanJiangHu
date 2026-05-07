// NSFW 模块注册桥接
// 将 StoryModule 注册表中的 NSFW 模块映射到 UI 元数据和设置组件

import React from 'react';
import { 故事模块注册表 } from '../../../utils/storyModule/registry';
import type { StoryModule } from '../../../utils/storyModule/types';

export interface NsfwModuleUI {
  id: string;
  name: string;
  description: string;
  masterToggleKey: string;
  settingsComponent: React.LazyExoticComponent<React.FC<any>>;
  dashboardLabel: string;
  defaultSettings: Record<string, unknown>;
  normalizeSettings: (raw: Record<string, unknown>) => Record<string, unknown>;
  storyModule: StoryModule<any, any>;
}

// 模块 ID → 设置组件映射（手动维护，直到实现自动发现）
const settingsComponentMap: Record<string, React.LazyExoticComponent<React.FC<any>>> = {
  campusNSFW: React.lazy(() => import('../Settings/CampusNSFWSettings')),
  photographyNSFW: React.lazy(() => import('../Settings/PhotographyNSFWSettings')),
  urbanDriverNSFW: React.lazy(() => import('../Settings/UrbanDriverNSFWSettings')),
};

const dashboardLabelMap: Record<string, string> = {
  campusNSFW: '校园欲望仪表盘',
  photographyNSFW: '写真仪表盘',
  urbanDriverNSFW: '网约车仪表盘',
};

export function 获取NSFW模块列表(): NsfwModuleUI[] {
  const allModules = 故事模块注册表.获取模块摘要();
  return allModules
    .filter(m => m.category === 'nsfw')
    .map(m => {
      const storyModule = 故事模块注册表.获取模块(m.id)!;
      return {
        id: m.id,
        name: m.name,
        description: storyModule.description,
        masterToggleKey: storyModule.masterToggleKey,
        settingsComponent: settingsComponentMap[m.id],
        dashboardLabel: dashboardLabelMap[m.id] || '仪表盘',
        defaultSettings: storyModule.defaultSettings,
        normalizeSettings: storyModule.normalizeSettings,
        storyModule,
      };
    });
}

export function 获取NSFW模块(id: string): NsfwModuleUI | undefined {
  const storyModule = 故事模块注册表.获取模块(id);
  if (!storyModule || storyModule.category !== 'nsfw') return undefined;
  return {
    id: storyModule.id,
    name: storyModule.name,
    description: storyModule.description,
    masterToggleKey: storyModule.masterToggleKey,
    settingsComponent: settingsComponentMap[storyModule.id],
    dashboardLabel: dashboardLabelMap[storyModule.id] || '仪表盘',
    defaultSettings: storyModule.defaultSettings,
    normalizeSettings: storyModule.normalizeSettings,
    storyModule,
  };
}
