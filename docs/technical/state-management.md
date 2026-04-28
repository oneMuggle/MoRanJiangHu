# 状态管理

> 扩展自 `hooks/useGame/AGENTS.md` | **日期:** 2026-04-28

## 概述

游戏状态由中央 hook `useGame()`（~3000 行）管理，包含 45+ 个子工作流模块。

## 入口

```
hooks/useGame.ts -> 导入子工作流 -> 返回 { state, meta, setters, actions }
```

## 状态初始化

`hooks/useGameState.ts` 负责初始状态设置和从 IndexedDB 恢复。

## 子工作流模块

### 核心工作流

| 模块 | 用途 |
|------|------|
| `sendWorkflow.ts` | 主剧情请求处理和 AI 响应解析 |
| `systemPromptBuilder.ts` | 运行时从各层组装提示词 |
| `openingStoryWorkflow.ts` | 新游戏初始化和开局剧情生成 |
| `bodyPolish.ts` | 后处理和文本润色 |

### 世界状态

| 模块 | 用途 |
|------|------|
| `worldGenerationWorkflow.ts` | 初始世界生成 |
| `worldEvolutionWorkflow.ts` | 基于时间的世界状态更新 |

### 记忆系统

| 模块 | 用途 |
|------|------|
| `memoryUtils.ts` | 记忆创建、存储和检索工具 |
| `memoryRecall.ts` | 基于上下文相关性的记忆召回 |

### 存档/读档

| 模块 | 用途 |
|------|------|
| `saveCoordinator.ts` | 协调存档和读档操作 |

### 图片生成

| 模块 | 用途 |
|------|------|
| `image/*` | 角色、场景和资源图片生成工作流 |

### 配置

| 模块 | 用途 |
|------|------|
| `config/*` | 设置持久化和验证 |

## 数据流

1. 用户操作触发 `hooks/useGame/` 中的工作流
2. 工作流通过 `systemPromptBuilder.ts` 组装上下文和提示词
3. AI 响应解析后不可变更新状态
4. 变更通过 `saveCoordinator.ts` 持久化到 IndexedDB

## 状态结构

完整状态结构见 `docs/technical/architecture.md`。

## 核心模式

- **不可变更新**：所有状态变更创建新对象，绝不原地修改
- **工作流隔离**：每个子模块处理特定领域
- **懒加载**：子工作流按需导入和初始化
