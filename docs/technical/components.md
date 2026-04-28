# 组件

> 扩展自 `components/features/AGENTS.md` | **日期:** 2026-04-28

## 概述

UI 组件位于 `components/`，22 个功能模块，每个模块有桌面端和移动端版本。

## 目录结构

```
components/
├── features/   # 22 个功能模块
├── layout/     # TopBar、LeftPanel、RightPanel、MobileQuickMenu、LandingPage
└── ui/         # 共享 UI 基础组件
```

## 功能模块（`components/features/`）

每个功能模块遵循以下模式：
- 桌面端：`XxxModal.tsx`（React.lazy 懒加载）
- 移动端：`MobileXxx.tsx` 或 `mobile/MobileXxxModal.tsx`

| # | 模块 | 桌面端 | 用途 |
|---|------|--------|------|
| 1 | Character | CharacterModal | 查看角色属性和状态 |
| 2 | Chat | — | 消息输入和历史记录 |
| 3 | Inventory | InventoryModal | 物品存储和管理 |
| 4 | Equipment | EquipmentModal | 武器、防具、功法装备 |
| 5 | Battle | BattleModal | 战斗界面 |
| 6 | Social | SocialModal | NPC 关系和互动 |
| 7 | Kungfu | KungfuModal | 武学功法学习和修炼 |
| 8 | World | WorldModal | 世界状态和时间线查看 |
| 9 | Map | MapModal | 位置导航和地图 |
| 10 | Sect | SectModal | 玩家门派管理 |
| 11 | Task | TaskModal | 任务追踪 |
| 12 | Team | TeamModal | 队伍管理 |
| 13 | Story | StoryModal | 剧情历史回顾 |
| 14 | Memory | MemoryModal | 记忆系统界面 |
| 15 | Settings | SettingsModal | 游戏和 API 配置 |
| 16 | SaveLoad | SaveLoadModal | 存档/读档游戏进度 |
| 17 | NewGame | NewGameWizard | 新游戏创建向导 |
| 18 | NovelDecomposition | NovelDecompositionModal | 小说导入和分解 |
| 19 | Worldbook | WorldbookModal | 编辑世界设定和规则 |
| 20 | Music | MusicModal | 背景音乐控制 |
| 21 | Agreement | AgreementModal | 自定义游戏规则和约束 |
| 22 | Auth | AuthModal | 认证和云同步登录 |

## 布局组件（`components/layout/`）

- `TopBar.tsx` — 角色属性展示（境界、生命、时间等）
- `LeftPanel.tsx` — 聊天历史和剧情回顾
- `RightPanel.tsx` — 功能模块按钮网格
- `MobileQuickMenu.tsx` — 移动端底部导航
- `LandingPage.tsx` — 起始页/首页

## 共享 UI 基础组件（`components/ui/`）

- `ErrorBoundary.tsx` — React 错误边界，优雅处理 UI 错误
- `InAppConfirmModal.tsx` — 自定义确认对话框
- 其他可复用 UI 组件

## 懒加载模式

所有功能模块使用 `React.lazy()` 配合自定义 `创建可预加载懒组件()` 包装器，提供 `preload()` 方法。预加载在游戏视图激活时的空闲时间触发。

## 响应式设计

- 断点：`max-width: 767px`
- 桌面端：三栏布局（LeftPanel | Chat | RightPanel）
- 移动端：单栏 + `MobileQuickMenu` 底部导航
