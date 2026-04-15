# components/features/ - 功能组件

## 概述
游戏功能 UI 组件 (~100+ 文件，22 个功能模块，桌面/移动端双版本)

## 结构

```
features/
├── Agreement/      # 约定系统
├── Auth/           # 认证
├── Battle/         # 战斗
├── Character/      # 角色
├── Chat/           # 聊天 (InputArea, ChatList)
├── Equipment/      # 装备
├── Inventory/      # 背包
├── Kungfu/         # 功法
├── Map/            # 地图
├── Memory/         # 记忆
├── Music/          # 音乐
├── NewGame/        # 新游戏向导
├── NovelDecomposition/  # 小说分解
├── SaveLoad/       # 存档
├── Sect/           # 门派
├── Settings/       # 设置 (复杂面板)
├── Social/         # 社交 (含 ImageManager)
├── Story/          # 剧情
├── Task/           # 任务
├── Team/           # 队伍
├── World/          # 世界
└── Worldbook/      # 世界书
```

## 桌面/移动端模式

每个功能模块都有桌面版和移动版：

| 桌面版 | 移动版 |
|--------|--------|
| `XxxModal.tsx` | `MobileXxx.tsx` 或 `mobile/MobileXxxModal.tsx` |

### 示例
- `Inventory/InventoryModal.tsx` → `Inventory/MobileInventoryModal.tsx`
- `Settings/SettingsModal.tsx` → `Settings/mobile/MobileSettingsModal.tsx`
- `Social/SocialModal.tsx` → `Social/MobileSocial.tsx`

## 组件导出模式

```typescript
// App.tsx 中使用懒加载
const InventoryModal = 创建可预加载懒组件(
  () => import('./components/features/Inventory/InventoryModal')
);
```

## Settings 模块特点

`components/features/Settings/` 是最复杂模块 (29 文件)：
- `ApiSettings.tsx` - API 配置
- `ImageGenerationSettings.tsx` - 图片生成
- `NovelDecompositionSettings.tsx` - 小说分解
- 含多个桌面/移动端面板

## 通用 UI

- `components/ui/InAppConfirmModal` - 确认弹窗
- 使用 React Portal 渲染

## 开发注意

- 移动端组件命名: `Mobile` 前缀
- 共享状态通过 `useGame()` hook
- 设置变更需要持久化到 IndexedDB
