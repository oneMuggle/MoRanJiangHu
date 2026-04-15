# hooks/useGame/ - 游戏核心状态与工作流

## 概述
游戏核心状态管理与工作流编排 (~3000行 useGame.ts + 44 子模块)

## 结构
```
useGame/
├── useGame.ts           # 主入口 (~2990行)，导出 useGame() hook
├── useGameState.ts      # 状态初始化 (392行)
├── config/              # 设置持久化
├── image/               # 图片相关工作流
├── saveLoad/            # 存档读写
└── [44个独立模块]       # 各功能工作流
```

## 模块清单

| 模块 | 职责 |
|------|------|
| `sendWorkflow` | 主剧情发送 (1122行) |
| `worldEvolutionWorkflow` | 世界演变更新 |
| `variableCalibrationCoordinator` | 变量校准协调 |
| `memoryUtils` | 记忆压缩与规范化 |
| `systemPromptBuilder` | 系统提示词构建 (1598行) |
| `openingStoryWorkflow` | 开局剧情生成 (1447行) |
| `storyResponseGuards` | 响应分流与净化 |
| `responseCommandProcessor` | 命令处理 |
| `sceneImageWorkflow` | 场景生图 |
| `npcImageWorkflow` | NPC生图 |
| `playerImageWorkflow` | 主角生图 |
| `worldGenerationWorkflow` | 世界生成 |
| `planningUpdateWorkflow` | 剧情规划更新 |
| `bodyPolish` | 正文润色 |
| `memoryRecall` | 记忆召回 |
| `timeUtils` | 时间转换 |
| `npcContext` | NPC上下文 |
| `stateTransforms` | 状态规范化 |

## 入口点

```typescript
// hooks/useGame.ts
export const useGame = () => {
  // 返回: { state, meta, setters, actions }
  // state: 游戏状态 (角色、环境、社交、世界、战斗等)
  // meta: 元状态 (loading、notifications、progress)
  // setters: 状态修改器 (setShowXxx)
  // actions: 动作方法 (handleSend、handleStop等)
}
```

## 状态结构

```typescript
// useGame() 返回
{
  state: {
    view: 'home' | 'new_game' | 'game',
    角色: 角色数据结构,
    环境: 环境信息结构,
    社交: 社交列表,
    世界: 世界数据结构,
    战斗: 战斗状态结构,
    剧情: 剧情系统结构,
    历史记录: 聊天记录结构[],
    记忆系统: 记忆系统结构,
    // ... 更多状态
  },
  meta: {
    loading: boolean,
    notifications: Notification[],
    worldEvolutionEnabled: boolean,
    // ... 更多元数据
  },
  setters: { setShowBattle, setShowInventory, ... },
  actions: { handleSend, handleStop, handleRegenerate, ... }
}
```

## 开发注意

- **不要直接修改状态** - 通过 setters 和 actions
- **大型工作流** - sendWorkflow、systemPromptBuilder 等是核心入口
- **动态导入** - 图片相关使用 `() => import(...)` 懒加载
- **Bilingual naming** - 模块内混用中英文 (创建、执行等)

## 调试

- IndexedDB 存储状态 - 排查数据残留先清 IndexedDB
- `state.scrollRef` - 历史记录滚动控制
- `meta.notifications` - 通知队列
