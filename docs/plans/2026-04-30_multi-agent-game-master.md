# Multi-Agent Game Master System 多智能体游戏主持人系统

> **Status:** 设计中 | **最近更新:** 2026-04-30
> **Plan:** 实现多智能体游戏主持人系统，增强叙事控制与动态事件生成

---

## 背景与目标

当前游戏使用单一 AI 负责所有决策，导致：
1. 叙事与战斗逻辑混杂，难以独立优化
2. 事件生成缺乏多样性，容易陷入套路
3. 无法并行处理不同维度的游戏逻辑

本系统将引入多智能体架构，每个智能体专注于特定职责。

---

## 系统架构

### 智能体角色

| 角色 | 职责 | 输入 | 输出 |
|------|------|------|------|
| **叙事导演** | 控制故事节奏、章节推进、伏笔管理 | 世界状态、角色状态 | 叙事决策、事件列表 |
| **战斗导演** | 战斗判定、技能效果、胜负结算 | 战斗状态、双方属性 | 战斗结果、伤害数值 |
| **判定导演** | 随机事件判定、NPC行为决策 | 判定请求、概率参数 | 判定结果、事件触发 |
| **氛围导演** | 控制叙事风格、情感节奏、场景描写 | 当前场景、情绪状态 | 氛围描述、情感倾向 |
| **经济导演** | 物品掉落、交易定价、资源流通 | 角色状态、场景类型 | 掉落表、价格浮动 |

### 协作流程

```
用户输入 → 调度器 → 并行分发到相关智能体
                    ↓
              各智能体独立推理
                    ↓
              结果汇聚到协调器
                    ↓
              融合决策 → 最终输出
```

---

## 实现方案

### 文件结构

```
services/gameMaster/
├── index.ts                    # 主入口，导出协调器
├── types.ts                    # 智能体相关类型定义
├── agents/
│   ├── NarrativeDirector.ts    # 叙事导演
│   ├── CombatDirector.ts       # 战斗导演
│   ├── JudgeDirector.ts        # 判定导演
│   ├── AtmosphereDirector.ts   # 氛围导演
│   └── EconomyDirector.ts      # 经济导演
├── dispatcher.ts               # 任务调度器
├── coordinator.ts              # 结果协调器
└── prompts/
    ├── directorCore.ts         # 导演核心提示词
    └── rolePrompts.ts          # 各角色提示词
```

### 类型定义 (services/gameMaster/types.ts)

```typescript
export type DirectorRole = 'narrative' | 'combat' | 'judge' | 'atmosphere' | 'economy';

export interface DirectorContext {
  role: DirectorRole;
  gameState: GameState;
  characterState: CharacterState;
  currentScene: SceneState;
}

export interface DirectorDecision {
  role: DirectorRole;
  decision: string;
  events: GameEvent[];
  variables: Record<string, unknown>;
}

export interface GameMasterRequest {
  type: 'narrative' | 'combat' | 'judge' | 'atmosphere' | 'economy' | 'full';
  context: DirectorContext;
}

export interface GameMasterResponse {
  decisions: DirectorDecision[];
  finalOutput: string;
  events: GameEvent[];
}
```

### 核心实现

#### 1. 导演基类 (services/gameMaster/agents/BaseDirector.ts)

```typescript
export abstract class BaseDirector {
  protected role: DirectorRole;
  protected prompt: string;
  
  abstract analyze(context: DirectorContext): Promise<DirectorDecision>;
  
  protected buildPrompt(context: DirectorContext): string {
    return `${this.getRolePrompt()}\n\n${this.getContextPrompt(context)}`;
  }
  
  protected abstract getRolePrompt(): string;
  protected abstract getContextPrompt(context: DirectorContext): string;
}
```

#### 2. 叙事导演 (services/gameMaster/agents/NarrativeDirector.ts)

负责故事主线推进、支线触发、伏笔回收

#### 3. 战斗导演 (services/gameMaster/agents/CombatDirector.ts)

负责战斗判定、技能结算、胜负决定

#### 4. 判定导演 (services/gameMaster/agents/JudgeDirector.ts)

负责随机判定、NPC行为、事件触发

#### 5. 氛围导演 (services/gameMaster/agents/AtmosphereDirector.ts)

负责场景描写、情感节奏、文字风格

#### 6. 经济导演 (services/gameMaster/agents/EconomyDirector.ts)

负责物品掉落、交易价格、资源管理

#### 7. 调度器 (services/gameMaster/dispatcher.ts)

并行分发任务到相关智能体

```typescript
export class DirectorDispatcher {
  private directors: Map<DirectorRole, BaseDirector>;
  
  async dispatch(request: GameMasterRequest): Promise<DirectorDecision[]> {
    const relevantRoles = this.getRelevantRoles(request.type);
    return Promise.all(
      relevantRoles.map(role => this.directors.get(role)!.analyze(request.context))
    );
  }
  
  private getRelevantRoles(type: GameMasterRequest['type']): DirectorRole[] {
    switch (type) {
      case 'full': return ['narrative', 'combat', 'judge', 'atmosphere', 'economy'];
      case 'narrative': return ['narrative', 'atmosphere'];
      case 'combat': return ['combat', 'atmosphere'];
      case 'judge': return ['judge', 'atmosphere'];
      default: return [type as DirectorRole];
    }
  }
}
```

#### 8. 协调器 (services/gameMaster/coordinator.ts)

汇聚各导演决策，生成最终输出

---

## 提示词设计

### 导演核心提示词 (services/gameMaster/prompts/directorCore.ts)

```typescript
export const 导演_角色定义 = `
你是一位经验丰富的游戏主持人（Game Master）。
你的职责是根据当前游戏状态，做出符合角色定位的决策。
每个决策都必须：
1. 符合武侠世界观的基本逻辑
2. 考虑玩家的沉浸体验
3. 推动故事向前发展
4. 保持各角色的一致性
`;

export const 导演_决策格式 = `
决策格式：
{
  "role": "角色名",
  "decision": "核心决策描述",
  "events": ["事件1", "事件2"],
  "variables": { "变量名": "值" }
}
`;
```

---

## 集成方式

### 在 useGame 中集成

在 `hooks/useGame.ts` 中引入 GameMaster 服务：

```typescript
import { createGameMaster } from '../services/gameMaster';

const gameMaster = createGameMaster();

// 在需要多智能体决策时使用
const response = await gameMaster.process({
  type: 'full',
  context: { ... }
});
```

---

## 验收标准

1. `services/gameMaster/` 目录包含所有智能体文件
2. 各 Director 类实现 `analyze` 方法
3. Dispatcher 支持并行分发
4. Coordinator 能汇聚并融合决策
5. 导出 `createGameMaster` 工厂函数
6. 编写基础类型测试

---

## 优先级

- **P0**: 创建目录结构和基础类型
- **P1**: 实现各 Director 智能体
- **P2**: 实现 Dispatcher 和 Coordinator
- **P3**: 编写集成代码和提示词
- **P4**: 单元测试
