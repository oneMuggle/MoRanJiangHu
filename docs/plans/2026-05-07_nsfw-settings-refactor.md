# NSFW 设置面板重构

> **执行状态：已完成** ✅
> **目标：** 将 NSFW 模块设置从主设置面板剥离，建立独立 NSFW 控制面板

## 问题

当前校园NSFW、写真NSFW、都市NSFW等模块都作为独立 tab 平铺在设置面板中。后续新增 NSFW 模块会导致设置面板臃肿、难以维护。

## 方案

从设置面板移除所有 NSFW tab，改为一个独立的 NSFW 控制面板弹窗，以卡片网格展示所有 NSFW 模块。每个卡片包含主开关 + 配置按钮 + 仪表盘入口。

**关键决策：**
- 沿用现有的 `StoryModule` 注册表机制（`category: 'nsfw'` 过滤）
- 各模块的详细设置组件保持不变，由 NSFW 控制面板调用
- 数据模型不变，仍通过 `gameConfig.写真NSFW设置` 等字段持久化

## 实施步骤

### Phase 1: 提取共享表单组件

提取三个 NSFW 设置组件中重复的 `ToggleSwitch`、`SelectOption`、`SectionHeader` 为共享组件。

- [x] 新建 `components/features/NSFWCenter/NsfwSettingsForm.tsx`
- [x] 重构 `CampusNSFWSettings.tsx` 使用共享组件
- [x] 重构 `UrbanDriverNSFWSettings.tsx` 使用共享组件
- [x] 重构 `PhotographyNSFWSettings.tsx` 使用共享组件

### Phase 2: NSFW 控制面板核心

创建 NSFW 管理中心的弹窗、模块卡片和配置弹窗。

- [x] 新建 `moduleRegistry.ts` — 桥接 StoryModule 注册表到 UI
- [x] 新建 `NsfwModuleCard.tsx` — 模块卡片组件
- [x] 新建 `NsfwModuleSettingsModal.tsx` — 模块详细设置弹窗
- [x] 新建 `NsfwControlCenter.tsx` — 主面板

### Phase 3: 清理设置面板

从设置面板移除 NSFW tab。

- [x] `tabDefinitions.ts` — 移除 NSFW tab 条目
- [x] `SettingsPanel.tsx` — 移除 NSFW tab 渲染逻辑和导入

### Phase 4: 集成到 App.tsx

将 NSFW 控制面板接入主应用。

- [x] `lazyComponents.tsx` — 添加懒加载导出
- [x] `App.tsx` — 添加 `showNsfwCenter` 状态和渲染逻辑
- [x] 添加入口按钮（顶部导航栏右上角）

### Phase 5: 仪表盘统一入口（可选）

将现有仪表盘统一通过 NSFW 控制面板打开。

- [ ] `NsfwControlCenter` 添加 `onOpenDashboard` 回调
- [ ] App.tsx 中桥接到现有 `showCampusDesire`/`showPhotography` 状态

### Phase 6: 自动发现（远期）

扩展 `StoryModule` 接口支持 UI 元数据注册。

## 风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| 破坏现有 NSFW 设置持久化 | 高 | 沿用 `saveGameSettings` 路径，数据模型不变 |
| 移动端布局拥挤 | 中 | 复用 SettingsPanel 的响应式模式 |
| 现有仪表盘打开流程断裂 | 低 | Phase 4 通过现有状态桥接，不改变入口 |
| modules/ 和 components/ 循环依赖 | 低 | moduleRegistry.ts 仅导入元数据，不导入运行时逻辑 |

## 文件结构（完成后）

```
components/features/
  NSFWCenter/                    # 新建
    index.ts
    NsfwControlCenter.tsx        # 主面板
    NsfwModuleCard.tsx           # 模块卡片
    NsfwModuleSettingsModal.tsx  # 模块设置弹窗
    NsfwSettingsForm.tsx         # 共享表单组件
    moduleRegistry.ts            # 模块注册桥接
  Settings/
    tabDefinitions.ts            # NSFW tab 已移除
    SettingsPanel.tsx            # NSFW 渲染逻辑已移除
    CampusNSFWSettings.tsx       # 重构使用共享组件
    UrbanDriverNSFWSettings.tsx  # 重构使用共享组件
    PhotographyNSFWSettings.tsx  # 重构使用共享组件
```
