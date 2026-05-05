# 剧情槽位框架 (Story Slots Framework)

## 目标

构建剧情槽位框架，将故事内容组织为可复用、可注入的槽位单元，与现有世界书槽位系统集成。

## 背景

现有 `worldbook.ts` 已有内置槽位系统（`builtin_slot_*`），但缺少剧情层面的槽位抽象。本框架在故事规划层引入剧情槽位概念，支持：
- 剧情任务的模块化封装
- 镜头/事件的可复用槽位
- 剧情阶段与主线/支线的解耦

## 实现方案

### 1. 剧情槽位类型定义

新建 `models/planning/storySlots.ts`：

```typescript
// 剧情槽位结构
export interface 剧情槽位结构 {
  id: string;
  名称: string;
  类型: 剧情槽位类型;
  内容: string;
  作用域: 世界书作用域[];
  优先级: number;
  启用条件?: string[];
  失效条件?: string[];
}

// 剧情槽位类型
export type 剧情槽位类型 = 
  | '主线任务' | '支线任务' | '日常任务'
  | '镜头序列' | '事件触发' | '过渡场景'
  | '角色互动' | '背景描写';

// 剧情槽位预算
export const 剧情槽位预算: Record<世界书作用域, number> = {
  main: 3000,
  opening: 2000,
  world_evolution: 1500,
  variable_calibration: 1000,
  story_plan: 2500,
  heroine_plan: 2000,
  tavern: 2000,
  recall: 0,
  all: 4000
};
```

### 2. 槽位注册表

新建 `data/story-slots.ts`：
- 预设剧情槽位模板
- 默认启用/禁用状态
- 槽位与工作流的绑定关系

### 3. 槽位注入逻辑

在 `utils/worldbook.ts` 中新增：
- `获取剧情槽位(作用域: 世界书作用域): 剧情槽位结构[]`
- `评估槽位优先级(槽位: 剧情槽位结构, 上下文: 游戏状态): number`
- `过滤可用槽位(作用域: 世界书作用域, 上下文: 游戏状态): 剧情槽位结构[]`

### 4. 状态管理

在 `models/planning/storyPlan.ts` 中新增：
```typescript
export interface 剧情规划结构 {
  // ... 现有字段
  剧情槽位: 剧情槽位结构[];
  已激活槽位: string[];
  已完成槽位: string[];
}
```

### 5. UI 面板（可选）

在设置或剧情面板中展示槽位状态（`components/features/`）。

## 文件清单

| 文件 | 操作 |
|------|------|
| `models/planning/storySlots.ts` | 新建 |
| `data/story-slots.ts` | 新建 |
| `utils/storySlots.ts` | 新建 |
| `models/planning/storyPlan.ts` | 修改 |
| `utils/worldbook.ts` | 修改 |

## 验收标准

1. 剧情槽位类型定义完整
2. 槽位可根据作用域和条件过滤
3. 与现有世界书槽位系统共存不冲突
4. 剧情规划结构包含槽位列表
5. `npm run build` 通过
