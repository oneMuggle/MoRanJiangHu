# SLG + RPG + AVG + AI 四支柱架构迁移方案

> 创建日期: 2026-05-12
> 状态: 待实施
> 关联文档: `2026-05-12-slg-ai-hybrid-architecture.md`（已完成阶段一至五）

---

## 一、现状分析

### 1.1 当前架构概述

项目已从纯文字冒险游戏演进为 **SLG + AI 混合架构**，核心基础设施已在五个阶段中完成：

| 已完成基础设施 | 文件路径 | 状态 |
|--------------|---------|------|
| 统一引擎接口 `SLGEngine` | `hooks/useGame/engine/types.ts` | 完成 |
| 抽象基类 `BaseEngine` | `hooks/useGame/engine/baseEngine.ts` | 完成 |
| 回合调度器 `TurnManager` | `hooks/useGame/engine/turnManager.ts` | 完成 |
| 操作路由器 `ActionRouter` | `hooks/useGame/engine/actionRouter.ts` | 完成 |
| 操作日志 `ActionLogger` | `hooks/useGame/engine/actionLogger.ts` | 完成 |
| 全局回合管理器 `GlobalTurnManager` | `hooks/useGame/engine/globalTurnManager.ts` | 完成 |
| 引擎注册表 `EngineRegistry` | `hooks/useGame/engine/engineRegistry.ts` | 完成 |
| BoardGame 引擎（8 种游戏） | `hooks/useGame/boardGameNSFWEngine/` + 8 Panels | 完成 |
| PhoneSim 引擎 | `hooks/useGame/engine/phoneEngine.ts` | 完成 |
| UrbanDriver 引擎 | `hooks/useGame/engine/urbanDriverEngine.ts` | 完成 |
| Notification 引擎 | `hooks/useGame/engine/notificationEngine.ts` | 完成 |
| 消息调度/队列/社交图谱 | `hooks/useGame/device/` | 完成 |
| Zustand Store（14 slices） | `hooks/useGame/subsystems/zustandStore.ts` | 完成 |
| 叙事桥接层 `useBoardGameBridge` | `hooks/useBoardGameBridge.ts` | 完成 |
| 单元测试 | 5 个测试文件，158 tests 通过 | 完成 |

### 1.2 当前架构局限

| 局限 | 描述 | 影响 |
|------|------|------|
| RPG 计算由 AI 承担 | 属性检定、装备效果、战斗伤害等全部由 AI 生成 | 结果不可预测、游戏平衡失控 |
| 无对话树引擎 | AVG 叙事完全依赖 AI 自由文本生成 | 分支不连贯、角色关系不一致 |
| useGame.ts 依然庞大 | 约 3000 行，状态管理耦合 | 难以维护、测试困难 |
| 无全局事件总线 | 各引擎间事件通过各自管理器传递 | 跨引擎联动困难 |
| 缺少 RPG 确定性引擎 | 战斗、装备、功法、任务无独立引擎 | 无法保证数值平衡 |
| 缺少 AVG 分支引擎 | 无对话树、无分支追踪、无关系图谱引擎 | 叙事不连贯 |

---

## 二、目标架构定义

### 2.1 四支柱 + 扩展玩法定义

#### 四支柱

| 支柱 | 含义 | 在本项目中的定位 |
|------|------|----------------|
| **SLG** (Strategy Layer Game) | 确定性游戏逻辑：回合系统、资源管理、属性计算、事件触发、条件判定、后果结算 | 已部分实现，需要扩展到 RPG 领域 |
| **RPG** (Role-Playing Game) | 角色成长：属性检定、装备系统、技能功法、任务系统、门派系统、战斗伤害计算 | 模型已存在但缺乏确定性引擎 |
| **AVG** (Adventure Visual Novel) | 叙事驱动：对话树、分支叙事、角色关系图谱、好感度轨道、关键剧情锚点 | 部分结构存在但缺乏引擎 |
| **AI** (AI Driver) | LLM 驱动：叙事生成、动态 NPC 对话、世界演变、记忆生成、图片生成 | 已非常成熟，作为"叙事渲染层" |

#### 扩展玩法（可插拔 Mini-Engine）

| 玩法类型 | 核心玩法 | 归属支柱 | 复用现有 | 阶段 |
|----------|---------|---------|---------|------|
| **日常城镇地图** | 区域移动、NPC 会面、购物、吃饭、日常活动 | SLG + AVG 扩展 | 回合框架 + 对话引擎 + 物品引擎 | 十 |
| **Galgame / 恋爱模拟** | 角色路线、好感度事件、CG 收集、结局分歧 | AVG 扩展 | 好感度引擎（阶段十二） | 十二 |
| **地图探索** | 大地图移动、随机遇敌、迷雾、隐藏事件、宝藏 | SLG 扩展 | 回合框架 + RPG 战斗 + 物品引擎 | 十四 |
| **模拟经营** | 门派/商铺运营、资源产出、人员调度、经济系统 | RPG 扩展 | 门派引擎（阶段九）+ 任务引擎 | 九 |

> **设计原则**：扩展玩法不是独立支柱，而是挂接在四支柱上的可插拔 Mini-Engine。每个扩展玩法继承 `BaseEngine`，通过 EventBus 与主干系统联动，可以按需启用/禁用。

### 2.2 核心循环（四支柱 + 扩展玩法）

```
[玩家操作 / SLG Tick]
        |
    +---+---+
    v       v
  [日常]  [冒险]
城镇移动  大地图探索
购物/吃饭  遇敌/寻宝
  |   |     |   |
  v   v     v   v
[RPG] [AVG]  [SLG战斗]
装备/物品 对话/分支 伤害计算
门派经营   Gal路线 行动力消耗
  |       |       |
  v       v       v
  [Narrative Bridge]  合并全状态为叙事约束 XML
        |
        v
  [AI Layer]  生成叙事文本、NPC 对话、场景描写
        |
        v
  [UI Refresh]  数值即时刷新 + 叙事追加
```

### 2.3 核心设计原则

1. **确定性优先**：凡是可以计算的不交给 AI（骰子、属性检定、装备效果、战斗伤害、资源变化）
2. **叙事自由**：凡是必须创作的不限制 AI（场景描写、NPC 情感、对话内容、环境渲染）
3. **状态一致性**：SLG/RPG/AVG 引擎拥有单一真实来源（Zustand Store），AI 只能读取和建议
4. **渐进式迁移**：不做大爆炸重写，从最成熟的 BoardGame 模式扩展到 RPG/AVG
5. **双速刷新**：数值变化即时刷新（SLG/RPG），叙事文本异步刷新（AI）

---

## 三、适配性分析

### 3.1 SLG 支柱：优秀（无需大改）

| 维度 | 现状 | 评价 |
|------|------|------|
| 引擎接口 | `SLGEngine` interface + `BaseEngine` 已存在 | 优秀 |
| 回合管理 | `GlobalTurnManager` + `EngineRegistry` 已存在 | 优秀 |
| 事件系统 | `eventTrigger` V2 + 引擎内事件队列 | 优秀 |
| 操作路由 | `ActionRouter` 已存在 | 优秀 |
| 事件溯源 | `ActionLogger` 已存在 | 优秀 |
| 状态管理 | Zustand Store 14 slices | 良好 |
| 叙事桥接 | `useBoardGameBridge` 已存在 | 良好 |
| 测试覆盖 | 158 tests 通过 | 优秀 |

### 3.2 RPG 支柱：模型完整但缺引擎

| 维度 | 现状 | 缺失 | 适配难度 |
|------|------|------|---------|
| 角色模型 | `models/character.ts` 有完整数据结构（六维属性、精力、内力、装备、门派） | 无属性检定引擎、无 Buff 状态机 | 中 |
| 物品系统 | `models/item.ts` 有武器/防具/消耗品/词条/耐久/堆叠 | 无背包引擎、无装备效果引擎 | 中 |
| 战斗模型 | `models/battle.ts` 有敌方信息（血量、精力、内力、技能） | 无战斗伤害计算引擎 | 高 |
| 功法系统 | `models/kungfu.ts` 有功法结构（伤害、消耗、冷却、被动修正） | 无功法效果引擎 | 高 |
| 门派系统 | `models/sect.ts` 有任务/商品/成员简报 | 无门派运营引擎 | 低 |
| 任务系统 | `models/task.ts` 有任务结构 | 无任务状态机 | 低 |
| UI 面板 | 22+ 功能模块均有 Desktop/Mobile 版本 | 面板是纯展示，不驱动逻辑 | 中 |

**关键冲突**：
- RPG 模型数据丰富但全部由 AI 消费和修改，缺乏确定性计算
- 战斗系统目前只有 UI 面板（`components/features/Battle/BattleActionPanel.tsx`），伤害计算完全由 AI 决定
- 装备、物品、功法的效果描述是自由文本，AI 可能忽略或误读

### 3.3 AVG 支柱：结构存在但缺引擎

| 维度 | 现状 | 缺失 | 适配难度 |
|------|------|------|---------|
| 剧情结构 | `models/story.ts` 有章节/时间线/历史章节 | 无对话树引擎、无分支追踪 | 高 |
| 剧情规划 | `models/game/storyPlan.ts` 有任务/事件/镜头结构 | 无剧情引擎将规划转化为可执行步骤 | 高 |
| 社交关系 | `models/social.ts` 有 NPC 关系边、好感度、亲密度、信任度 | 无关系图谱引擎、无好感度轨道机 | 中 |
| 记忆系统 | `hooks/useGame/memory/memoryUtils.ts` 有四段记忆 | 无记忆驱动的分支触发 | 中 |
| 世界书 | `models/worldbook.ts` 有注入系统 | 无世界状态追踪引擎 | 低 |
| Prompt 系统 | 60+ prompt 文件（core/runtime/writing/stats/difficulty） | 已成熟，无需大改 | 无 |

**关键冲突**：
- AVG 分支叙事与 SLG 回合推进存在时序冲突（SLG 是离散回合，AVG 是连续叙事）
- 对话树需要"预定义节点 + AI 填充内容"的混合模式，当前纯 AI 生成模式无法直接转换
- NPC 关系图谱需要持久化追踪，但当前关系数据分散在 `social.ts` 和 `character.ts` 中

### 3.4 AI 支柱：非常成熟（职责收窄）

| 维度 | 现状 | 评价 |
|------|------|------|
| 多供应商客户端 | `services/ai/text/chatCompletionClient.ts` | 优秀 |
| Prompt 分层系统 | 60+ prompt 文件 | 优秀 |
| 系统提示词构建 | `systemPromptBuilder.ts` 注入叙事约束（L1578-1591） | 优秀 |
| 结构化输出 | Zod schema 验证 | 良好 |
| 世界演变 | `worldEvolutionWorkflow.ts` | 良好 |
| 记忆系统 | `memoryUtils.ts` + `memoryRecall.ts` | 良好 |

**结论**：AI 将从"全能计算+叙事"降为"纯叙事渲染"，职责更清晰。

### 3.5 范式间冲突与解决方案

| 冲突 | 描述 | 解决方案 |
|------|------|---------|
| SLG 离散 vs AVG 连续 | SLG 以回合为单位，AVG 叙事是连续的 | 使用"叙事回合"概念：每个 SLG 回合对应一个 AVG 叙事片段 |
| RPG 数值 vs AI 自由 | RPG 数值需要精确计算，AI 生成可能偏离 | RPG 引擎先计算数值，AI 仅负责渲染 |
| 状态权威 | 谁拥有状态的最终解释权？ | SLG/RPG/AVG 引擎拥有最终解释权，AI 的 stateUpdates 仅作参考 |
| Prompt 膨胀 | 注入信息越多，AI 越容易遗漏 | 使用"分级注入"：关键约束必注入，次要信息按需注入 |
| 双速刷新 | 数值即时 vs 叙事异步 | UI 层分离：数值组件直接读 Zustand，叙事组件等 AI 回复后追加 |

### 3.6 扩展玩法适配性分析

#### 日常城镇地图（SLG + AVG 扩展，适配难度：低）

| 维度 | 现状 | 缺失 | 说明 |
|------|------|------|------|
| 区域节点 | 环境模型有场景定义 | 无区域移动系统 | 新增 DailyTownEngine |
| 区域交互 | 各子系统独立（商店/对话/物品） | 无区域关联的交互入口 | 区域进入时加载对应 UI |
| NPC 分布 | NPC 数据在 `social.ts` | 无时段/NPC 位置调度 | 新增 NPC 日程管理器 |
| 行动力系统 | 无 | 无每日行动力上限 | 新增行动力状态追踪 |
| 时间系统 | 章节/时间线存在 | 无上午/下午/晚上分时 | 扩展现有章节时间 |

**与探险地图的区别**：
- 探险地图 = 大地图冒险（秘境、山洞、荒野），有战斗/迷雾/寻宝
- 日常城镇地图 = 城镇/社区探索（街道、客栈、商铺），无战斗，以社交/购物/吃饭为主
- 类似《星露谷》《女神异闻录》的日常移动节奏

**融合方案**：
- `DailyTownEngine` 继承 `BaseEngine`，管理城镇区域节点
- 区域类型：`家 | 客栈 | 酒楼 | 武器铺 | 药铺 | 茶楼 | 书院 | 市集 | NPC居所 | 衙门`
- 每个区域是独立场景面板，进入后展示该区域的固定 UI：
  - **武器铺/药铺** → 货架 UI，调用 RPG 物品引擎购买/出售
  - **酒楼** → 菜单 UI，消耗品恢复精力/内力，可能触发 buff
  - **茶楼** → NPC 列表，触发 AVG 对话引擎（闲聊/情报/支线）
  - **NPC 居所** → 访问特定 NPC，触发 Galgame 好感事件
  - **市集** → 临时摊位，随机商品/情报/特殊客人
- 移动消耗「行动力」（每天固定次数，如 3-5 次）
- **时段系统**：每天分「上午/下午/晚上」
  - 不同时段不同 NPC 出现在不同地点
  - 某些区域仅在特定时段开放（酒楼晚上才有表演）
  - 时段切换触发叙事事件（"夕阳西下，街上行人渐少"）
- **动态事件**（低概率触发）：
  - 随机 NPC 路过并打招呼
  - 限时折扣（武器铺今天打八折）
  - 特殊客人来访（"一个蒙面人坐在客栈角落等你"）
- 与 RPG 物品引擎联动：购物 → 背包更新
- 与 AVG 对话引擎联动：茶楼闲聊 → 触发对话节点
- 与 Galgame 路线联动：拜访 NPC 居所 → 好感事件
- 与模拟经营联动：市集摆摊 → 经营收入
- **UI 设计**：2D 俯视角节点图，已访问区域高亮，未访问区域半透明

#### Galgame / 恋爱模拟（AVG 扩展，适配难度：中）

| 维度 | 现状 | 缺失 | 说明 |
|------|------|------|------|
| 角色路线 | 好感度数据存在 `social.ts` | 无路线判定、无结局分支 | 扩展现有关系图谱即可 |
| 好感度事件 | 好感度数值已追踪 | 无阈值触发、无事件链 | 在好感度触发器中增加事件链 |
| CG 收集 | 图片生成系统已存在 | 无图鉴/收藏系统 | 新增 CG 图鉴组件，复用已有 imageAssets |
| 结局分歧 | 无结局系统 | 无结局判定逻辑 | 基于路线选择的最终状态机 |

**融合方案**：
- 在 `avgRelationEngine` 中增加「路线判定」子模块
- 好感度阈值（如 80/120/160）触发不同等级的专属事件
- 路线互斥：选择 A 角色后降低 B 角色好感度增益
- 结局判定：游戏终章时根据最高好感度路线 + 关键选择决定结局
- CG 图鉴：记录 AI 生成的关键场景图片，按角色/事件分类

#### 地图探索（SLG 扩展，适配难度：中）

| 维度 | 现状 | 缺失 | 说明 |
|------|------|------|------|
| 地图结构 | `models/game/world.ts` 有世界数据 | 无格子/节点移动系统 | 新增 ExplorationEngine |
| 战争迷雾 | 无 | 无 FOW 系统 | 基于可见性半径计算 |
| 随机遇敌 | 无 | 无遇敌概率计算 | 基于区域危险等级 + 福源属性 |
| 隐藏事件 | 无 | 无事件触发点系统 | 地图节点绑定事件模板 |
| 宝藏发现 | 无 | 无探索/发现机制 | 基于悟性/福源属性检定 |

**融合方案**：
- `ExplorationEngine` 继承 `BaseEngine`，管理玩家在地图上的位置
- 地图采用「节点图」结构（非格子），节点间有路径连接
- 移动消耗行动力，进入新节点触发事件（遇敌/NPC/宝藏/剧情）
- 遇敌概率 = `基础概率 × 区域危险等级 × (1 - 福源修正)`
- 发现隐藏物品 = `悟性检定 + 福源检定` 双阈值
- 与 RPG 战斗引擎联动：遇敌 → 切换至战斗场景
- 与 RPG 物品引擎联动：发现物品 → 加入背包
- 战争迷雾：未探索节点隐藏信息，探索后解锁节点详情

#### 模拟经营（RPG 扩展，适配难度：低）

| 维度 | 现状 | 缺失 | 说明 |
|------|------|------|------|
| 门派数据 | `models/sect.ts` 已有完整结构 | 无经济系统、无资源产出 | 扩展门派引擎 |
| 任务刷新 | 无 | 无刷新机制 | 门派任务随时间/贡献度刷新 |
| 人员调度 | 门派有成员简报 | 无成员分配/调度 | 新增成员管理模块 |
| 商品买卖 | 门派有商品列表 | 无动态定价、库存系统 | 新增经济模块 |

**融合方案**：
- 在 `rpgSectEngine` 中增加「经济子模块」：资源产出、商品买卖、动态定价
- 资源产出 = `成员数量 × 工作效率 × 建筑等级 × 时间周期`
- 动态定价：商品供需关系影响价格（买入增多 → 价格上涨）
- 成员调度：分配成员到不同岗位（巡逻/生产/教学/外交）
- 经营叙事：AI 根据经营状态生成叙事（"你的客栈今天来了三位客人，收入 300 文"）
- 与 RPG 任务引擎联动：经营目标转化为任务（"本月收入达到 5000 文"）
- 与 AVG 关系图谱联动：NPC 顾客好感度影响回头率和消费额

#### 扩展玩法与核心系统的联动关系

```
                 ┌─ 日常城镇地图 ───────────────┐
                 │                              │
                 ├── 进入武器铺 ──▶ RPG 物品（购买装备）
 玩家移动 ───────┤── 进入酒楼   ──▶ RPG 物品（消耗品）+ Buff
                 ├── 进入茶楼   ──▶ AVG 对话（NPC闲聊/情报）
                 ├── 拜访NPC    ──▶ Galgame 好感事件
                 └── 市集摆摊   ──▶ 模拟经营收入
                 │
                 ├─ 大地图探险 ── 遇敌 ──▶ RPG 战斗 ──▶ AI 渲染
                 │              │
                 ├── 发现物品 ──▶ RPG 物品 ──┘
                 │
                 └── 模拟经营 ──▶ RPG 门派/经济 ──▶ AI 渲染
```

---

## 四、核心架构设计

### 4.1 全局事件总线（新增核心组件）

```
GlobalEventBus:
  register(subscriber: EventSubscriber)
  unregister(type: EngineType)
  publish(event: GameEvent) -> 所有订阅引擎收到通知

事件类型（40+ 种）:
  BATTLE_START, BATTLE_END, BATTLE_DAMAGE
  EQUIP_CHANGE, ITEM_USE, ITEM_GAIN
  KUNGFU_LEVEL_UP, KUNGFU_BREAKTHROUGH
  TASK_ACCEPT, TASK_COMPLETE, TASK_FAIL
  RELATION_CHANGE, INTIMACY_CHANGE, NPC_MEET
  DIALOGUE_BRANCH, STORY_CHAPTER_CHANGE
  BOARD_GAME_START, BOARD_GAME_END
  PHONE_MESSAGE, URBAN_TRIP_START
  WORLD_EVOLVE, TIME_ADVANCE
```

### 4.2 叙事约束构建器（扩展）

将现有的 `构建桌游NSFW完整叙事约束`（`prompts/runtime/boardGameNSFW.ts`）模式扩展为统一构建器，覆盖 SLG+RPG+AVG 全状态：

```xml
<游戏叙事约束>
  <!-- SLG 层 -->
  <回合>23</回合>
  <活跃引擎>boardGame,phoneSim,rpgBattle</活跃引擎>

  <!-- RPG 层 -->
  <角色状态>
    <属性>力量45 敏捷62 体质50 根骨38 悟性55 福源42</属性>
    <装备>主武器:长剑(耐久80/100)</装备>
    <Buff>破风剑法(3重,熟练度65%)</Buff>
  </角色状态>

  <!-- AVG 层 -->
  <叙事状态>
    <当前章节>初入江湖</当前章节>
    <对话节点>npc_meeting_003</对话节点>
    <在场NPC>李秋水(好感62,亲密度30)</在场NPC>
  </叙事状态>

  <!-- 叙事约束 -->
  <当前场景>客栈大堂，NPC 李秋水向你递来一封信</当前场景>
</游戏叙事约束>
```

### 4.3 数据流

```
玩家操作 -> Zustand Store（乐观更新）
Zustand Store -> SLG/RPG/AVG Engine（确定性计算）
Engine 结果 -> Zustand Store（状态更新）
Zustand Store -> Narrative Bridge（生成约束）
Narrative Bridge -> AI（叙事生成）
AI 响应 -> Zustand Store（追加叙事文本到历史记录）
Zustand Store -> React UI（渲染）
Zustand Store -> IndexedDB（定期持久化）
```

### 4.4 分层架构图

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                      │
│  BoardGame | RPGPanel | AVGDialogue | UrbanDriver |      │
│  MapExplorer | SectManager | GalgameRoute | CGGallery    │
├─────────────────────────────────────────────────────────┤
│                 Bridge Layer (Hooks)                     │
│  useBoardGameBridge | useBoardGameActions | ...          │
├─────────────────────────────────────────────────────────┤
│               State Layer (Zustand)                      │
│  EngineSlice | RPGSlice | AVGSlice | ExploreSlice |      │
│  ManagementSlice | UISlice | ...                         │
├─────────────────────────────────────────────────────────┤
│              Engine Layer (SLG Base)                     │
│  BoardGame | PhoneSim | Notification | UrbanDriver |     │
│  RPGBattle | RPGEquip | RPGItem | RPGKungfu | RPGTask |  │
│  RPGSect(+经营) | AVGDialogue | AVGRelation(+Galgame) |  │
│  AVGBranch | Exploration | ...                          │
├─────────────────────────────────────────────────────────┤
│           Shared Infrastructure (Completed)              │
│  GlobalTurnManager | EngineRegistry | GlobalEventBus |   │
│  ActionRouter | ActionLogger | ConstraintBuilder         │
├─────────────────────────────────────────────────────────┤
│                   AI Layer (LLM)                         │
│  Text Generation | Image Generation | Memory Generation  │
├─────────────────────────────────────────────────────────┤
│               Persistence Layer                          │
│  IndexedDB (local) | GitHub Release (cloud sync)         │
└─────────────────────────────────────────────────────────┘
```

---

## 五、迁移方案（9 个阶段）

### 阶段总览

| 阶段 | 名称 | 工期 | 依赖 | 风险 |
|------|------|------|------|------|
| 六 | 全局事件总线 + 叙事约束构建器 | 2 周 | 阶段五（已完成） | 中 |
| 七 | RPG 战斗引擎 | 3-4 周 | 阶段六 | 高 |
| 八 | RPG 装备/物品/功法引擎 | 3 周 | 阶段七 | 中 |
| 九 | RPG 任务/门派引擎（+ 模拟经营） | 3 周 | 阶段八 | 低 |
| 十 | 日常城镇地图引擎 | 2-3 周 | 阶段八+六 | 低 |
| 十一 | AVG 对话树引擎 | 3-4 周 | 阶段六 | 高 |
| 十二 | AVG 关系图谱/好感度（+ Galgame） | 3-4 周 | 阶段十一 | 中 |
| 十三 | AVG 分支叙事追踪引擎 | 2-3 周 | 阶段十二 | 中 |
| 十四 | 地图探索引擎（ExplorationEngine） | 3 周 | 阶段七+八 | 中 |
| 十五 | 四支柱集成 + useGame.ts 拆分 | 3-4 周 | 阶段六至十四 | 高 |
| 十六 | 测试 + 性能优化 | 2 周 | 阶段十五 | 低 |

**总计: 29-38 周（+11 周风险缓冲）**

### 阶段六：全局事件总线 + 叙事约束构建器

**目标**：建立跨引擎事件分发机制，扩展叙事约束覆盖全状态。

**交付物**：
- `hooks/useGame/events/globalEventBus.ts` — 事件总线核心
- `hooks/useGame/events/eventTypes.ts` — 40+ 种事件类型定义
- `hooks/useGame/events/eventSubscriber.ts` — 订阅者接口
- `hooks/useGame/narrative/constraintBuilder.ts` — 统一叙事约束构建器
- `prompts/runtime/narrativeConstraints.ts` — 分层注入 prompt 规则

**关键设计**：
- EventBus 采用发布-订阅模式，每个引擎既是发布者也是订阅者
- 约束构建器从 Zustand Store 读取全状态，按优先级分级注入
- 关键约束必注入，次要信息按需注入，避免 prompt 膨胀

**验收标准**：
- [ ] EventBus 发布事件后所有订阅者收到通知
- [ ] 约束构建器生成 XML 覆盖 SLG/RPG/AVG 三层状态
- [ ] 与现有 EngineRegistry 集成，引擎自动注册/注销事件订阅
- [ ] `npm run build` 通过

### 阶段七：RPG 战斗引擎

**目标**：将战斗计算从 AI 收回，改为确定性引擎计算。

**交付物**：
- `hooks/useGame/engine/rpgBattleEngine.ts` — 战斗引擎主类
- `hooks/useGame/rpg/battle/damageCalculator.ts` — 伤害计算器
- `hooks/useGame/rpg/battle/initiativeCalculator.ts` — 先攻计算
- `hooks/useGame/rpg/battle/skillResolver.ts` — 技能解析器
- `hooks/useGame/rpg/battle/buffManager.ts` — Buff 管理器
- `hooks/useGame/rpg/battle/battleStateMachine.ts` — 战斗状态机

**关键设计**：
- 继承 `BaseEngine`，实现 `SLGEngine` 接口
- 战斗状态机：`准备 → 先攻判定 → 攻击方行动 → 伤害结算 → Buff结算 → 回合切换 → 结束`
- AI 仅负责渲染战斗描述，伤害数值由引擎计算
- 伤害公式：`基础伤害 × (1 + 功法修正) × (1 - 防御减免) × 暴击倍率`

**验收标准**：
- [ ] 伤害计算结果与人工计算一致
- [ ] Buff 状态正确增减
- [ ] 先攻判定基于属性/功法权重
- [ ] 至少 30 个单元测试
- [ ] `npm run build` 通过

### 阶段八：RPG 装备/物品/功法引擎

**目标**：装备效果、物品使用、功法修炼的确定性计算。

**交付物**：
- `hooks/useGame/engine/rpgEquipEngine.ts` — 装备引擎
- `hooks/useGame/rpg/equipment/effectCalculator.ts` — 装备效果计算
- `hooks/useGame/rpg/equipment/encumbranceCalculator.ts` — 负重计算
- `hooks/useGame/engine/rpgItemEngine.ts` — 物品引擎
- `hooks/useGame/rpg/inventory/inventoryManager.ts` — 背包管理器
- `hooks/useGame/rpg/inventory/itemEffectResolver.ts` — 物品效果解析
- `hooks/useGame/engine/rpgKungfuEngine.ts` — 功法引擎
- `hooks/useGame/rpg/kungfu/cultivationManager.ts` — 修炼管理器
- `hooks/useGame/rpg/kungfu/breakthroughChecker.ts` — 突破检查
- `hooks/useGame/rpg/kungfu/passiveEffectCalculator.ts` — 被动效果计算

**关键设计**：
- 装备效果引擎：穿戴/卸下时自动计算属性修正
- 背包引擎：重量上限、堆叠规则、消耗品自动判定
- 功法引擎：修炼进度追踪、突破概率计算、被动效果应用
- 所有效果通过 EventBus 发布，其他系统可订阅响应

**验收标准**：
- [ ] 装备穿戴后属性修正正确
- [ ] 物品使用效果符合描述
- [ ] 功法修炼进度正确递增
- [ ] 突破判定概率与设定一致
- [ ] 至少 40 个单元测试
- [ ] `npm run build` 通过

### 阶段九：RPG 任务/门派引擎（+ 模拟经营扩展）

**目标**：任务状态机、门派运营和模拟经营系统的确定性管理。

**交付物**：
- `hooks/useGame/engine/rpgTaskEngine.ts` — 任务引擎
- `hooks/useGame/rpg/task/taskStateMachine.ts` — 任务状态机
- `hooks/useGame/rpg/task/rewardDistributor.ts` — 奖励分发
- `hooks/useGame/engine/rpgSectEngine.ts` — 门派引擎
- `hooks/useGame/rpg/sect/missionRefreshManager.ts` — 任务刷新
- `hooks/useGame/rpg/sect/contributionManager.ts` — 贡献度管理
- `hooks/useGame/rpg/sect/economyManager.ts` — 经济管理（新增）
- `hooks/useGame/rpg/sect/memberDispatcher.ts` — 成员调度（新增）
- `hooks/useGame/rpg/sect/dynamicPricing.ts` — 动态定价（新增）

**关键设计**：
- 任务状态机：`可接取 → 进行中 → 已完成/失败 → 已领取奖励`
- 任务条件检查：等级要求、前置任务、物品条件
- 门派运营：贡献度积累、任务刷新、权限等级
- **模拟经营扩展**：
  - 经济子模块：资源产出、商品买卖、动态定价
  - 资源产出 = `成员数量 × 工作效率 × 建筑等级 × 时间周期`
  - 动态定价：商品供需关系影响价格（买入增多 → 价格上涨）
  - 成员调度：分配成员到不同岗位（巡逻/生产/教学/外交）
  - 经营叙事：AI 根据经营状态生成叙事文本
  - 与 AVG 关系图谱联动：NPC 顾客好感度影响回头率和消费额
- 任务奖励由引擎发放，不依赖 AI 计算

**验收标准**：
- [ ] 任务状态正确流转
- [ ] 条件检查准确
- [ ] 门派任务刷新逻辑正确
- [ ] 经济系统资源产出/消耗正确
- [ ] 动态定价符合供需关系
- [ ] 成员调度效果正确
- [ ] 至少 25 个单元测试
- [ ] `npm run build` 通过

### 阶段十：日常城镇地图引擎

**目标**：城镇区域移动、NPC 会面、购物、吃饭、日常活动。类似《星露谷》《女神异闻录》的城镇探索体验。

**交付物**：
- `hooks/useGame/engine/dailyTownEngine.ts` — 日常城镇引擎主类
- `hooks/useGame/dailytown/townGraph.ts` — 城镇区域节点图
- `hooks/useGame/dailytown/actionPointManager.ts` — 行动力管理器
- `hooks/useGame/dailytown/timeOfDayManager.ts` — 时段管理器（上午/下午/晚上）
- `hooks/useGame/dailytown/npcScheduleManager.ts` — NPC 日程管理器
- `hooks/useGame/dailytown/dynamicEventTrigger.ts` — 动态事件触发
- `models/dailyTown/regionNode.ts` — 区域节点数据模型
- `models/dailyTown/npcSchedule.ts` — NPC 日程数据模型
- `components/features/DailyTown/TownMap.tsx` — 城镇地图 UI（新增）
- `components/features/DailyTown/MobileTownMap.tsx` — 移动端城镇地图（新增）
- `components/features/DailyTown/RegionPanel.tsx` — 区域面板（通用入口）
- `components/features/DailyTown/regionPanels/` — 各区域专用面板：
  - `WeaponShopPanel.tsx` — 武器铺（货架 UI，调用 RPG 物品引擎）
  - `TavernPanel.tsx` — 酒楼（菜单 UI，消耗品 + buff）
  - `TeaHousePanel.tsx` — 茶楼（NPC 列表 + 对话入口）
  - `NpcResidencePanel.tsx` — NPC 居所（拜访 UI + 好感事件）
  - `MarketPanel.tsx` — 市集（随机摊位 UI）

**关键设计**：
- 继承 `BaseEngine`，实现 `SLGEngine` 接口
- 城镇采用「区域节点图」结构，区域间有路径连接
- 区域类型：`家 | 客栈 | 酒楼 | 武器铺 | 药铺 | 茶楼 | 书院 | 市集 | NPC居所 | 衙门 | 医馆`
- 每个区域进入后展示对应的场景面板 UI：
  - **武器铺/药铺** → 货架 UI，直接调用 RPG 物品引擎购买/出售
  - **酒楼** → 菜单 UI，选择菜品消耗银两，恢复精力/内力，可能触发 buff
  - **茶楼** → NPC 列表 UI，选择 NPC 触发 AVG 对话引擎（闲聊/情报/支线）
  - **NPC 居所** → 拜访 UI，触发 Galgame 好感事件（如该 NPC 在家且有空）
  - **市集** → 随机摊位 UI，随机商品/情报/特殊客人
- 区域间移动消耗「行动力」：
  - 每天固定行动力（如 3-5 次，可随等级/功法提升）
  - 行动力耗尽后需要回家休息（或消耗银两购买额外行动力）
  - 每次移动 = 1 点行动力
- **时段系统**：每天分「上午/下午/晚上」
  - 每天开始默认为上午，移动 2 次后切换下午，再移动 2 次后切换晚上
  - 不同时段不同 NPC 出现在不同地点（如上午张三在书院，下午在茶楼）
  - 某些区域仅在特定时段开放（酒楼晚上才有表演，书院白天开放）
  - 时段切换时触发叙事事件（AI 生成过渡文本）
- **动态事件**（移动到低概率触发，约 10-15%）：
  - 随机 NPC 路过并打招呼
  - 限时折扣
  - 特殊客人来访
  - 天气变化
- 与各子系统联动：
  - RPG 物品引擎：购物 → 背包更新，银两减少
  - AVG 对话引擎：茶楼闲聊 → 触发对话节点
  - Galgame 路线：拜访 NPC 居所 → 好感事件
  - 模拟经营：市集摆摊 → 经营收入记录
- **UI 设计**：
  - 2D 俯视角节点图，玩家位置高亮显示
  - 可到达的区域有边框高亮，不可到达的半透明
  - 顶部状态栏：当前时段、行动力（点数图标）、银两
  - 底部区域列表：可点击快速移动

**验收标准**：
- [ ] 区域移动正确，行动力消耗正确
- [ ] 时段切换逻辑正确
- [ ] NPC 日程正确（不同时段出现在不同地点）
- [ ] 进入区域后正确加载对应 UI 面板
- [ ] 武器铺购物后背包/银两正确更新
- [ ] 酒楼吃饭后精力/内力正确恢复
- [ ] 茶楼触发 AVG 对话正确
- [ ] 动态事件按概率触发
- [ ] 至少 25 个单元测试
- [ ] `npm run build` 通过

### 阶段十一：AVG 对话树引擎

**目标**：对话树结构的解析、执行和条件分支。

**交付物**：
- `hooks/useGame/engine/avgDialogueEngine.ts` — 对话引擎
- `hooks/useGame/avg/dialogue/dialogueTree.ts` — 对话树结构
- `hooks/useGame/avg/dialogue/nodeResolver.ts` — 节点解析器
- `hooks/useGame/avg/dialogue/conditionEvaluator.ts` — 条件求值器
- `models/avg/dialogueTree.ts` — 对话树数据模型

**关键设计**：
- 对话树结构：`根节点 → 分支节点 → 叶子节点`
- 节点类型：`text | choice | condition | action | jump`
- 条件求值器：基于当前游戏状态（属性、好感度、任务进度）判断分支可达性
- 混合模式：预定义分支结构 + AI 填充对话内容
- 提供 AI 辅助生成对话树的工具（从剧情规划自动生成对话树骨架）

**验收标准**：
- [ ] 对话树正确遍历
- [ ] 条件分支正确求值
- [ ] 选择后状态正确更新
- [ ] 支持动态节点插入（AI 生成）
- [ ] 至少 25 个单元测试
- [ ] `npm run build` 通过

### 阶段十二：AVG 关系图谱/好感度（+ Galgame 扩展）

**目标**：NPC 关系图谱、好感度追踪、Galgame 角色路线和结局判定。

**交付物**：
- `hooks/useGame/engine/avgRelationEngine.ts` — 关系引擎
- `hooks/useGame/avg/relation/relationGraph.ts` — 关系图谱
- `hooks/useGame/avg/intimacy/intimacyStateMachine.ts` — 好感度状态机
- `hooks/useGame/avg/intimacy/intimacyTrigger.ts` — 好感度触发器
- `hooks/useGame/avg/galgame/routeDetector.ts` — 路线判定（新增）
- `hooks/useGame/avg/galgame/endingResolver.ts` — 结局解析（新增）
- `hooks/useGame/avg/galgame/cgGallery.ts` — CG 图鉴（新增）
- `components/features/Galgame/CGGallery.tsx` — CG 图鉴 UI（新增）

**关键设计**：
- 关系图谱：有向图，边带权重（好感度、信任度、亲密度）
- 好感度状态机：`陌生人 → 认识 → 熟悉 → 好友 → 挚友 → 恋人`
- 触发器：好感度阈值触发特殊事件/对话/选项
- NPC 之间的关系也会影响玩家互动（三角关系、嫉妒等）
- **Galgame 扩展**：
  - 路线判定：好感度阈值（80/120/160）触发不同等级的专属事件
  - 路线互斥：选择 A 角色后降低 B 角色好感度增益
  - 专属事件链：每个角色有独立的剧情线（5-10 个事件节点）
  - 结局判定：终章时根据最高好感度路线 + 关键选择决定结局
  - CG 图鉴：记录 AI 生成的关键场景图片，按角色/事件分类，已解锁/未解锁状态
  - 与 `memoryUtils.ts` 联动：记忆影响角色路线选择

**验收标准**：
- [ ] 关系图谱正确构建和查询
- [ ] 好感度正确递增/递减
- [ ] 阈值触发事件正确执行
- [ ] 路线判定逻辑正确（互斥/专属事件）
- [ ] 结局判定基于路线选择 + 关键选择
- [ ] CG 图鉴正确记录和展示
- [ ] 至少 25 个单元测试
- [ ] `npm run build` 通过

### 阶段十三：AVG 分支叙事追踪引擎

**目标**：追踪叙事分支选择、记录后果、影响未来剧情。

**交付物**：
- `hooks/useGame/engine/avgBranchEngine.ts` — 分支引擎
- `hooks/useGame/avg/branch/branchTracker.ts` — 分支追踪器
- `hooks/useGame/avg/branch/consequenceResolver.ts` — 后果解析器

**关键设计**：
- 分支追踪器：记录玩家在每个关键节点的选择
- 后果解析器：将历史选择转化为对未来剧情的影响参数
- 与 `storyPlan.ts` 联动：根据历史选择调整后续剧情规划
- 通过 EventBus 发布分支变更事件，通知其他系统

**验收标准**：
- [ ] 分支选择正确记录
- [ ] 后果解析正确应用
- [ ] 历史选择影响未来剧情参数
- [ ] 至少 15 个单元测试
- [ ] `npm run build` 通过

### 阶段十四：地图探索引擎（ExplorationEngine）

**目标**：大地图移动、随机遇敌、战争迷雾、隐藏事件和宝藏发现。

**交付物**：
- `hooks/useGame/engine/explorationEngine.ts` — 地图探索引擎主类
- `hooks/useGame/exploration/mapGraph.ts` — 地图节点图
- `hooks/useGame/exploration/fowSystem.ts` — 战争迷雾系统
- `hooks/useGame/exploration/encounterCalculator.ts` — 遇敌概率计算
- `hooks/useGame/exploration/treasureDetector.ts` — 宝藏发现检定
- `hooks/useGame/exploration/eventTriggerPoint.ts` — 事件触发点
- `models/exploration/mapNode.ts` — 地图节点数据模型
- `components/features/Exploration/MapExplorer.tsx` — 地图探索 UI（新增）
- `components/features/Exploration/MobileMapExplorer.tsx` — 移动端地图（新增）

**关键设计**：
- 继承 `BaseEngine`，实现 `SLGEngine` 接口
- 地图采用「节点图」结构（非格子），节点间有路径连接
- 节点类型：`门派 | 客栈 | 市集 | 秘境 | 山洞 | 村庄 | 城镇 | 荒野`
- 移动消耗行动力，进入新节点触发事件判定：
  - 遇敌判定：`基础概率 × 区域危险等级 × (1 - 福源修正)`
  - 宝藏发现：`悟性检定 + 福源检定` 双阈值
  - 隐藏事件：基于区域事件模板 + 好感度条件
- 战争迷雾（FOW）：未探索节点隐藏信息，探索后解锁节点详情
- 与 RPG 战斗引擎联动：遇敌 → 切换至战斗场景
- 与 RPG 物品引擎联动：发现物品 → 加入背包
- 与 AVG 关系图谱联动：探索中遇到 NPC 影响好感度
- UI 采用可交互节点图：已探索节点高亮，未探索节点模糊显示

**验收标准**：
- [ ] 地图节点移动正确，行动力消耗正确
- [ ] 遇敌概率符合设定公式
- [ ] 宝藏发现检定正确
- [ ] 战争迷雾正确显示/隐藏节点
- [ ] 遇敌后正确切换到战斗场景
- [ ] 发现物品正确加入背包
- [ ] 至少 30 个单元测试
- [ ] `npm run build` 通过

### 阶段十五：四支柱 + 扩展玩法集成 + useGame.ts 拆分

**目标**：将所有引擎（含扩展玩法）集成到统一调度框架，拆分 useGame.ts。

**交付物**：
- `hooks/useGame/gameOrchestrator.ts` — 游戏编排器
- `hooks/useGame/index.ts` — 拆分后的主 hook 入口
- 按工作流拆分的子模块（预计 12+ 个文件）

**关键设计**：
- GameOrchestrator 负责协调所有引擎的生命周期和调度顺序
- 按工作流拆分（而非按模块），保持每个子模块功能完整性
- 保留集成测试作为安全网，确保拆分不改变行为
- 拆分顺序：状态管理 → 工作流 → 引擎集成 → AI 交互

**拆分后预期结构**：
```
hooks/useGame/
├── index.ts                    # 主 hook 入口（编排器集成）
├── gameOrchestrator.ts         # 游戏编排器
├── engine/                     # 引擎层（已完成 + 新增）
├── events/                     # 事件总线（阶段六）
├── narrative/                  # 叙事约束构建器（阶段六）
├── rpg/                        # RPG 子系统（阶段七-九）
├── avg/                        # AVG 子系统（阶段十-十二）
├── exploration/                # 地图探索（阶段十三）
├── device/                     # 设备系统（已完成）
├── memory/                     # 记忆系统（已完成）
├── workflows/                  # 工作流（send, world evolution, etc.）
├── subsystems/                 # Zustand slices（已完成）
└── state/                      # 状态访问（已完成）
```

**验收标准**：
- [ ] useGame.ts 从 3000 行拆分为 12+ 个子模块
- [ ] 所有引擎（含扩展玩法）注册到 EngineRegistry 正确工作
- [ ] 事件总线跨引擎通信正常
- [ ] 集成测试全部通过
- [ ] `npm run build` 通过
- [ ] 运行时无行为变化（回归测试）

### 阶段十六：测试 + 性能优化

**目标**：提升测试覆盖率至 80%+，优化性能瓶颈。

**交付物**：
- 350+ 单元测试（覆盖所有新增引擎 + 扩展玩法）
- 集成测试（四支柱 + 扩展玩法联动）
- 性能剖析和优化报告

**关键工作**：
- RPG 引擎：属性计算/伤害计算边界测试
- AVG 引擎：对话树遍历/条件求值/路线判定测试
- Exploration 引擎：遇敌概率/宝藏发现/迷雾边界测试
- Galgame 扩展：路线互斥/结局判定/CG 记录测试
- 模拟经营扩展：经济产出/动态定价/成员调度测试
- 集成：多引擎并发工作测试
- 性能：减少不必要的 Zustand 重渲染
- 性能：约束 XML 大小控制（< 2KB）

**验收标准**：
- [ ] 测试覆盖率 >= 80%
- [ ] 集成测试全部通过
- [ ] 无性能回归
- [ ] `npm run build` 通过
- [ ] 首屏加载时间无明显增加

---

## 六、关键发现与建议

### 6.1 现有架构可复用度极高

SLG 基础设施（阶段一至五）已经完成了最困难的部分：统一接口、回合管理、操作路由、事件溯源、叙事桥接。RPG 和 AVG 引擎可以直接继承 `BaseEngine`，复用全部调度能力。

### 6.2 数据模型已完整

RPG 相关的角色（`models/character.ts`）、物品（`models/item.ts`）、战斗（`models/battle.ts`）、功法（`models/kungfu.ts`）、门派（`models/sect.ts`）数据结构均已存在且字段丰富。AVG 相关的剧情（`models/story.ts`）、社交（`models/social.ts`）、剧情规划（`models/game/storyPlan.ts`）也已到位。

### 6.3 最大风险在 AVG 对话树和地图探索

对话树需要预定义节点，设计成本高。建议采用混合模式：预定义分支结构 + AI 填充具体对话内容，并提供 AI 辅助生成对话树的工具。

地图探索的难点在于事件密度调优——太少则无聊，太多则疲劳。建议初期采用固定事件模板，后期根据玩家行为数据动态调整。

### 6.4 扩展玩法的「可插拔」设计

日常城镇地图、Galgame、地图探索、模拟经营这四个扩展玩法不作为必选项，而是通过 EngineRegistry 按需注册/注销。玩家可以在设置中开关特定玩法，引擎不会在后台消耗资源。

### 6.5 useGame.ts 拆分需谨慎

3000 行的 `useGame.ts` 是项目的核心，拆分前必须先建立集成测试作为安全网。建议按工作流（而非按模块）拆分，保持每个子模块的功能完整性。

### 6.6 建议的分步验证策略

每完成一个阶段，都应该验证：
1. 该阶段的新引擎可以独立运行（单元测试）
2. 新引擎可以与已有引擎共存（集成测试）
3. UI 层可以正确读取新引擎状态（组件测试）
4. `npm run build` 通过

---

## 七、UI 沉浸式演进方案（远期规划）

> 当前 UI 是三栏功能面板布局（LeftPanel | Chat | RightPanel），以功能性为导向。
> 本节规划如何将其演进为沉浸式 Galgame/SLG 风格的 UI，提升视觉体验。

### 7.1 演进路线总览

| 阶段 | 名称 | 目标 | 优先级 |
|------|------|------|--------|
| UI-1 | 角色立绘 + 场景背景 | 对话时显示角色立绘和场景背景 | 高 |
| UI-2 | Galgame 对话系统 | 底部对话框 + 角色名 + 文字逐字显示 | 高 |
| UI-3 | 场景切换动画 | 区域移动时的过渡动画 + 场景淡入淡出 | 中 |
| UI-4 | SLG 战术地图 | 大地图探险的 2D 俯视角 + 单位移动 | 中 |
| UI-5 | 动态 CG 事件 | 关键剧情时切换全屏 CG | 高 |
| UI-6 | 自适应混合 UI | 根据当前模式自动切换 UI 风格 | 低 |

### 7.2 各阶段详细设计

#### UI-1：角色立绘 + 场景背景

**当前问题**：NPC 交互只有纯文本，没有角色视觉表现。

**设计方案**：
```
┌────────────────────────────────────────────────────────────┐
│                    场景背景图（AI 生成）                      │
│                                                            │
│    🧑 角色立绘A          🧑‍🦰 角色立绘B                    │
│    (左侧，说话中)         (右侧，沉默)                      │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 张三：「今天天气不错，要不要一起去茶馆坐坐？」       │    │
│  │                                      [继续 ▶]      │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

- **角色立绘**：
  - 每个 NPC 有默认立绘（AI 生成或预设图片）
  - 说话中的角色立绘有微动画（呼吸/眨眼/口型）
  - 表情系统：高兴/愤怒/悲伤/害羞（通过 CSS filter 或不同图片切换）
- **场景背景**：
  - 根据当前区域加载对应背景（武器铺、酒楼、茶楼等）
  - 背景由 AI 首次生成，缓存到 IndexedDB
  - 时段影响背景色调（白天亮色，晚上暗色 + 暖光）

**新增组件**：
- `components/features/Galgame/CharacterSprite.tsx` — 角色立绘组件
- `components/features/Galgame/SceneBackground.tsx` — 场景背景组件
- `components/features/Galgame/GalgameDialogueBox.tsx` — 对话框（带逐字效果）
- `components/features/Galgame/GalgameMode.tsx` — Galgame 模式容器

**技术要点**：
- 立绘使用 CSS 定位，固定在屏幕左右两侧
- 逐字显示效果：`useTypewriter` hook 控制文字逐个出现
- 点击屏幕任意位置跳过逐字动画（直接显示全文）
- 立绘图片支持懒加载和预缓存

---

#### UI-2：Galgame 对话系统

**当前问题**：对话混在叙事文本中，没有独立的对话交互。

**设计方案**：
```
┌────────────────────────────────────────────────────────────┐
│                    场景背景                                  │
│                                                            │
│    🧑 角色立绘                                             │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 张三                                               │    │
│  │ 「今天天气不错，要不要一起去茶馆坐坐？」             │    │
│  │                                                     │    │
│  │  ▶ 好啊，走吧！                                     │    │
│  │    不了，我还有事。                                 │    │
│  │    （沉默不语）                                     │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

- 对话模式时，主界面切换为 Galgame 风格
- 选项以按钮列表形式出现在对话框底部
- 每个选项有后果提示（小字标注，如「好感度 +5」）
- 长按选项预览后果的简要描述

**与 AVG 对话引擎联动**：
- 对话树引擎提供选项列表 → UI 渲染为按钮
- 玩家选择后 → 引擎计算后果 → AI 生成回应文本
- 选项数量 > 4 时自动切换为滚动列表

---

#### UI-3：场景切换动画

**当前问题**：区域移动是瞬间切换，没有过渡感。

**设计方案**：
```
[当前场景淡出] → [移动动画] → [新场景淡入]
     ↓              ↓             ↓
  0.5s 淡出     0.3-1s 过渡     0.5s 淡入
```

- 移动类型影响动画时长：
  - 相邻区域移动：0.3s 滑入滑出
  - 远距离移动（回家）：1s 全屏过渡
- 移动时显示过渡文本（AI 生成）：
  - "你穿过熙熙攘攘的街道，来到了武器铺"
  - "夜色渐深，你独自走在回家的路上"
- 可选关闭动画（设置中开关）

---

#### UI-4：SLG 战术地图

**当前问题**：大地图探险是文本 + 按钮，缺乏空间感。

**设计方案**：
```
┌────────────────────────────────────────────────────────────┐
│  🗺️ 江湖大地图（可缩放、可拖动）                              │
│                                                            │
│    ╔══════╗         ╔══════╗                               │
│    ║ 门派 ║═══╗     ║ 秘境 ║                               │
│    ╚══════╝   ║     ╚══════╝                               │
│                 ║                                          │
│              🧑 你                                        │
│                 ║     ╔══════╗                             │
│                 ╚════╗║ 山洞 ║                              │
│                      ║╚══════╝                              │
│                      ║                                      │
│                   ╔══════╗                                  │
│                   ║ 城镇 ║                                  │
│                   ╚══════╝                                  │
│                                                            │
│  [当前: 门派附近]  [⚡ 行动力: 3/5]  [📅 春三月初七]         │
└────────────────────────────────────────────────────────────┘
```

- 可缩放/拖动的 2D 节点地图
- 玩家位置用角色图标标注
- 路径线表示可达区域（灰色 = 未解锁）
- 点击可达节点 → 移动动画 → 到达新位置
- 到达后触发事件判定（遇敌/寻宝/NPC/无事）
- 战争迷雾：未探索区域模糊/黑色遮盖
- 右上角小地图（可选开关）

**技术要点**：
- 使用 SVG 或 Canvas 渲染地图
- 节点数据来自 `exploration/mapGraph.ts`
- 迷雾使用 Canvas 覆盖层 + 透明度控制

---

#### UI-5：动态 CG 事件

**当前问题**：关键剧情没有视觉冲击力，纯文本缺乏感染力。

**设计方案**：
```
[触发关键事件时]
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              全屏 CG 图片（AI 生成）                         │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  叙事文本叠加在 CG 上方                              │    │
│  │  "在那一瞬间，你看到了她眼中有异样的光芒..."         │    │
│  │                                              [▶]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
[CG 结束后] → 平滑切换回对话/叙事模式
```

- CG 触发条件：好感度达到阈值、关键剧情节点、结局判定
- CG 生成流程：
  1. 事件触发 → AI 生成 CG 提示词
  2. 调用图片生成 API → 获得 CG 图片
  3. 缓存到 IndexedDB → 记录到 CG 图鉴
- CG 图鉴（`CGGallery.tsx`）：
  - 按角色分类
  - 已解锁 CG 可查看大图
  - 未解锁 CG 显示轮廓/剪影（激发收集欲）
- CG 播放时支持：
  - 背景音乐（可选）
  - 文字叠加（AI 生成叙事文本）
  - 点击继续

---

#### UI-6：自适应混合 UI

**最终目标**：UI 根据当前游戏模式自动切换风格。

```
┌─────────────────────────────────────────────────────────────┐
│                      GameOrchestrator                       │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐               │
│         ▼                 ▼                 ▼               │
│   🎭 AVG 模式        ⚔️ RPG 模式       🗺️ 探索模式          │
│   Galgame 风格        功能面板风格       地图模式            │
│   角色立绘+对话框     三栏布局           2D 战术地图         │
│   场景背景+CG         数值面板           迷雾+事件           │
│                                                             │
│   🏠 日常城镇模式    🎲 桌游模式      📱 手机模式           │
│   2D 节点图+面板     桌游专用 UI       手机模拟界面          │
│   时段+行动力        轮次+紧张度        App 列表            │
└─────────────────────────────────────────────────────────────┘
```

- **模式切换规则**：
  | 触发条件 | 切换至 |
  |---------|--------|
  | 进入城镇区域 → 与 NPC 对话 | AVG 模式 |
  | 进入战斗（遇敌/切磋） | RPG 模式 |
  | 进入大地图探索 | 探索模式 |
  | 日常城镇移动 | 城镇模式 |
  | 开始桌游 | 桌游模式 |
  | 查看手机 | 手机模式 |
- 模式切换时有平滑过渡动画（0.3s 淡入淡出）
- 顶部模式指示器（可选关闭）
- 玩家可随时手动切回功能面板模式

---

### 7.3 与现有 UI 的关系

| 现有组件 | 演进后的状态 |
|---------|-------------|
| `LeftPanel` / `RightPanel` | 退化为功能面板模式，保留为备用视图 |
| `Chat` | 叙事文本区保留，但 Galgame 模式下隐藏 |
| `BoardGameModal` | 保留，桌游模式专用 |
| `MobileDevice/*` | 保留，手机模式专用 |
| `App.tsx` 路由 | 增加模式切换逻辑，决定渲染哪个 UI 层 |

### 7.4 实施建议

1. **渐进式实施**：不需要一次性重做全部 UI。可以先在 AVG 对话时叠加 Galgame 模式，不影响其他功能面板。
2. **资源优先级**：角色立绘和场景背景是视觉体验的核心，优先解决图片来源（AI 生成 or 预设素材）。
3. **性能考虑**：CG 图片较大，需要懒加载和缓存策略，避免首屏卡顿。
4. **无障碍**：所有动画都应有「关闭动画」的选项，照顾对动画敏感的用户。
5. **移动端适配**：Galgame 模式在移动端天然适合（全屏对话 + 角色立绘），只需调整比例。

### 7.5 降级方案：性能与流量优化

> 当前 7.1-7.4 的 UI 演进方案以「最佳视觉体验」为目标，假设用户有充足的算力、带宽和电量。
> 本节针对三类资源受限用户设计降级策略，确保所有用户都能流畅游戏。

#### 7.5.1 目标用户群

| 用户类型 | 核心痛点 | 降级目标 |
|----------|---------|---------|
| **手机端用户** | 大量图片渲染 + CSS 动画导致 CPU/GPU 负载高，手机发热严重 | 减少渲染负载，降低 GPU 使用率 |
| **流量敏感用户** | 图片传输消耗大量流量（单张 AI 图片 500KB-2MB） | 减少网络传输，优先本地资源 |
| **无 AI 生图能力用户** | 没有配置图片生成 API，无法获得动态图片 | 提供预置素材和纯文本模式 |

#### 7.5.2 四阶降级体系

整体采用「从上到下」的阶梯式降级，每阶独立可用，也可组合使用：

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: AI 动态生成（最佳体验）                          │
│  - 角色立绘、场景背景、CG 全部由 AI 实时生成               │
│  - 资源消耗：高（图片 API 调用 + 大图片传输 + GPU 渲染）    │
│  适用：PC 端 + WiFi/不限流量 + 已配置图片 API               │
├─────────────────────────────────────────────────────────┤
│  Tier 2: CC0 预置素材库                                    │
│  - 使用开源免费的角色立绘和场景素材（CC0 协议）              │
│  - 首次下载后缓存到 IndexedDB，后续零流量                    │
│  - 资源消耗：中（仅首次下载 ~50MB）                         │
│  适用：所有用户，作为 Tier 1 失败时的自动降级                 │
├─────────────────────────────────────────────────────────┤
│  Tier 3: CSS 氛围渐变 + 色块                               │
│  - 不使用任何图片，用 CSS gradient 模拟场景氛围              │
│  - 角色用色块 + 名称标签表示                                │
│  - 资源消耗：极低（纯 CSS，零图片）                          │
│  适用：流量敏感模式 / 手机省电模式                           │
├─────────────────────────────────────────────────────────┤
│  Tier 4: 纯文本模式                                        │
│  - 无任何图片、无动画、无渐变，纯文字叙述                    │
│  - 保留所有游戏逻辑，仅关闭视觉层                            │
│  - 资源消耗：零                                            │
│  适用：极端流量敏感 / 严重手机发热 / 无障碍需求               │
└─────────────────────────────────────────────────────────┘
```

#### 7.5.3 手机端性能优化（防发热）

**问题根因分析**：
- 大图片解码（2MB 图片解码需要 CPU 几十毫秒）
- CSS `backdrop-filter: blur()` 和 `filter` 触发 GPU 持续计算
- `animation` 和 `transition` 频繁触发重绘
- Canvas 渲染（战术地图、战争迷雾）持续占用 GPU
- 多图层叠加（背景 + 立绘 + 对话框 + 粒子效果）导致合成压力大

**优化措施**：

| 优化项 | 具体措施 | 预期效果 |
|--------|---------|---------|
| **禁用 backdrop-filter** | 手机端改用纯色半透明背景 | 减少 GPU 持续计算，节省 ~30% GPU |
| **降低图片分辨率** | 手机端加载 1x 分辨率（桌面端 2x） | 图片体积减少 50-75% |
| **禁用粒子效果** | 手机端关闭所有 CSS/JS 粒子动画 | 减少 JS 执行和 GPU 渲染 |
| **减少动画帧率** | `requestAnimationFrame` 限流到 30fps | 减少 50% 渲染压力 |
| **图片懒加载 + 预解码** | 仅加载可视区域图片，后台预解码 | 减少首屏解码压力 |
| **合并 CSS 层** | 将多个叠加层合并为单一 Canvas 绘制 | 减少浏览器合成压力 |
| **立绘简化模式** | 手机端显示静态立绘，关闭呼吸/眨眼动画 | 减少 CSS 动画开销 |
| **自动检测** | 监听 `navigator.hardwareConcurrency` 和电池 API | 低性能设备自动降级 |

**自动降级触发条件**：
```typescript
// 手机端检测
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
// CPU 核心数 <= 4 视为中低端设备
const isLowEnd = navigator.hardwareConcurrency <= 4
// 电池电量低或处于省电模式
const isPowerSaving = battery?.level < 0.2 || battery?.charging === false

if (isMobile && (isLowEnd || isPowerSaving)) {
  // 自动切换到 Tier 3（CSS 氛围模式）
  setVisualTier('css-gradient')
  disableAllAnimations()
  enableLowResImages()
}
```

**设置项**：
- 「性能模式」：自动 / 高性能 / 省电
  - 自动：根据设备能力自动选择
  - 高性能：开启全部视觉效果（仅推荐 PC）
  - 省电：禁用所有动画、使用 CSS 渐变、降低图片分辨率

#### 7.5.4 流量敏感优化（省流量）

**问题根因分析**：
- AI 生成图片单次请求响应 500KB-2MB
- 场景切换时加载新背景图
- 角色立绘切换时加载新图片
- CG 事件时加载全屏大图
- 频繁的场景切换导致累积流量消耗大

**优化措施**：

| 优化项 | 具体措施 | 预期效果 |
|--------|---------|---------|
| **激进缓存策略** | 所有图片存入 IndexedDB，同场景永不重复下载 | 重复访问零流量 |
| **WiFi 预加载** | 仅在 WiFi 连接时预加载图片，移动网络不主动加载 | 移动网络零图片流量 |
| **低分辨率占位符** | 首屏加载 50x50 的极小模糊图（~2KB），用户点击才加载大图 | 默认流量 < 10KB/场景 |
| **按需加载** | 图片默认不显示，用户主动点击「查看图片」才加载 | 用户控制流量消耗 |
| **纯文本模式开关** | 一键关闭所有图片加载，仅保留文字 | 零图片流量 |
| **流量统计** | 设置中显示本期流量消耗，支持设置月度流量上限 | 用户可感知、可控制 |
| **差分更新** | 场景切换时仅传输变化的部分（如角色表情变化），不重新下载整张背景 | 减少 60-80% 重复流量 |

**网络状态检测**：
```typescript
// Connection API 检测网络类型
const conn = navigator.connection
const isWifi = conn?.effectiveType === '4g' && conn?.downlink > 10
const isMetered = conn?.saveData === true || conn?.effectiveType === '2g'

if (isMetered) {
  // 自动切换到 Tier 2 或 Tier 3
  setVisualTier('cc0-assets')
  enableWifiOnlyPreload()
}
```

**设置项**：
- 「流量模式」：自动 / WiFi 优先 / 省流量 / 纯文本
  - 自动：WiFi 时加载图片，移动网络使用缓存
  - WiFi 优先：仅在 WiFi 时加载图片，移动网络显示占位符
  - 省流量：使用 CC0 预置素材，不请求 AI 生图
  - 纯文本：完全关闭图片

#### 7.5.5 无 AI 生图能力用户

**问题**：部分用户没有配置图片生成 API（如 DALL-E、Midjourney、Stable Diffusion），无法获得动态生成的图片。

**解决方案**：

| 方案 | 说明 | 适用场景 |
|------|------|---------|
| **CC0 预置素材包** | 内置 50+ 张开源角色立绘和场景图（CC0 协议） | 覆盖主要场景：客栈、武器铺、山林、城镇 |
| **程序化生成头像** | 使用 `dicebear` 或自定义算法生成简约角色头像（纯 JS，零图片） | NPC 头像、玩家角色 |
| **CSS 艺术场景** | 用 CSS gradient + box-shadow 创建简约场景氛围 | 夜晚、雨天、雪天等特殊天气 |
| **社区素材共享** | 允许玩家社区分享自制素材包 | 长期生态建设 |
| **纯文本叙事** | 依靠高质量文字描写营造沉浸感 | 最终兜底方案 |

**预置素材包设计**：
```
assets/presets/
├── characters/           # CC0 角色立绘
│   ├── swordsman.png     # 剑客
│   ├── scholar.png       # 书生
│   ├── merchant.png      # 商人
│   └── ...
├── scenes/               # CC0 场景背景
│   ├── tavern.png        # 客栈
│   ├── weapon-shop.png   # 武器铺
│   ├── mountain.png      # 山林
│   └── ...
├── weather/              # 天气效果（CSS 实现）
│   ├── rain.css
│   └── snow.css
└── avatars/              # 程序化生成头像
    └── dicebear-config.ts
```

#### 7.5.6 降级策略决策树

```
玩家启动游戏
    │
    ▼
检测 [设备类型] ── 手机 ──▶ 检测 [电池状态]
    │                      │
    PC                 低电量/省电模式
    │                      │
    ▼                      ▼
检测 [网络类型]         自动 → Tier 3（CSS 氛围）
    │
    WiFi/有线              正常电量
    │                      │
    ▼                      ▼
检测 [图片 API 配置]   自动 → Tier 2（CC0 预置）
    │
    已配置                 │
    │                      │
    ▼                      ▼
    Tier 1（AI 生成）◄─────┘
    │
    未配置
    │
    ▼
    Tier 2（CC0 预置）
         │
         无预置素材
         │
         ▼
         Tier 3（CSS 氛围）
              │
              用户手动切换
              │
              ▼
              Tier 4（纯文本）
```

#### 7.5.7 实施优先级

| 优先级 | 任务 | 工时 | 依赖 |
|--------|------|------|------|
| P0 | 纯文本模式开关 | 2 天 | 无 |
| P0 | 图片 IndexedDB 缓存 | 3 天 | 无 |
| P1 | CC0 预置素材包收集 | 1 周 | 无 |
| P1 | 手机端分辨率降级 | 2 天 | UI-1 立绘组件 |
| P1 | WiFi/移动网络检测 | 2 天 | 无 |
| P2 | CSS 氛围渐变场景 | 1 周 | UI-1 场景背景组件 |
| P2 | 程序化头像系统 | 3 天 | 无 |
| P2 | 电池 API 集成 | 2 天 | 无 |
| P3 | 差分更新 | 1 周 | AI 图片生成服务 |
| P3 | 流量统计 UI | 3 天 | 无 |

---

### 7.6 新增文件清单（UI 部分）

| 文件 | 说明 |
|------|------|
| `components/features/Galgame/CharacterSprite.tsx` | 角色立绘组件 |
| `components/features/Galgame/SceneBackground.tsx` | 场景背景组件 |
| `components/features/Galgame/GalgameDialogueBox.tsx` | 对话框 + 逐字效果 |
| `components/features/Galgame/GalgameMode.tsx` | Galgame 模式容器 |
| `components/features/Galgame/CGPlayer.tsx` | CG 播放器 |
| `components/features/Exploration/TacticalMap.tsx` | SLG 战术地图 |
| `components/features/Exploration/FogOfWar.tsx` | 战争迷雾层 |
| `components/features/Transitions/SceneTransition.tsx` | 场景切换动画 |
| `components/features/UIMode/ModeSwitcher.tsx` | UI 模式切换器 |
| `hooks/useGame/ui/useTypewriter.ts` | 逐字显示 hook |
| `hooks/useGame/ui/uiModeManager.ts` | UI 模式管理器 |

---

## 九、新增文件清单（107 个）

| 文件 | 阶段 | 说明 |
|------|------|------|
| `hooks/useGame/events/globalEventBus.ts` | 六 | 事件总线核心 |
| `hooks/useGame/events/globalEventBus.test.ts` | 六 | EventBus 单元测试 (17 tests) |
| `hooks/useGame/events/eventTypes.ts` | 六 | 事件类型定义 (46种) |
| `hooks/useGame/events/eventSubscriber.ts` | 六 | 订阅者接口 |
| `hooks/useGame/events/index.ts` | 六 | 事件模块导出 |
| `hooks/useGame/narrative/constraintBuilder.ts` | 六 | 叙事约束构建器 |
| `hooks/useGame/narrative/constraintBuilder.test.ts` | 六 | ConstraintBuilder 测试 (12 tests) |
| `hooks/useGame/narrative/index.ts` | 六 | 叙事模块导出 |
| `prompts/runtime/narrativeConstraints.ts` | 六 | 分层注入 prompt |
| `hooks/useGame/engine/rpgBattleEngine.ts` | 七 | 战斗引擎 |
| `hooks/useGame/rpg/battle/damageCalculator.ts` | 七 | 伤害计算 |
| `hooks/useGame/rpg/battle/initiativeCalculator.ts` | 七 | 先攻计算 |
| `hooks/useGame/rpg/battle/skillResolver.ts` | 七 | 技能解析 |
| `hooks/useGame/rpg/battle/buffManager.ts` | 七 | Buff 管理 |
| `hooks/useGame/rpg/battle/battleStateMachine.ts` | 七 | 战斗状态机 |
| `hooks/useGame/engine/rpgEquipEngine.ts` | 八 | 装备引擎 |
| `hooks/useGame/rpg/equipment/effectCalculator.ts` | 八 | 装备效果计算 |
| `hooks/useGame/rpg/equipment/encumbranceCalculator.ts` | 八 | 负重计算 |
| `hooks/useGame/engine/rpgItemEngine.ts` | 八 | 物品引擎 |
| `hooks/useGame/rpg/inventory/inventoryManager.ts` | 八 | 背包管理 |
| `hooks/useGame/rpg/inventory/itemEffectResolver.ts` | 八 | 物品效果解析 |
| `hooks/useGame/engine/rpgKungfuEngine.ts` | 八 | 功法引擎 |
| `hooks/useGame/rpg/kungfu/cultivationManager.ts` | 八 | 修炼管理 |
| `hooks/useGame/rpg/kungfu/breakthroughChecker.ts` | 八 | 突破检查 |
| `hooks/useGame/rpg/kungfu/passiveEffectCalculator.ts` | 八 | 被动效果计算 |
| `hooks/useGame/engine/rpgTaskEngine.ts` | 九 | 任务引擎 |
| `hooks/useGame/rpg/task/taskStateMachine.ts` | 九 | 任务状态机 |
| `hooks/useGame/rpg/task/rewardDistributor.ts` | 九 | 奖励分发 |
| `hooks/useGame/engine/rpgSectEngine.ts` | 九 | 门派引擎 |
| `hooks/useGame/rpg/sect/missionRefreshManager.ts` | 九 | 任务刷新 |
| `hooks/useGame/rpg/sect/contributionManager.ts` | 九 | 贡献度管理 |
| `hooks/useGame/rpg/sect/economyManager.ts` | 九 | 经济管理（模拟经营） |
| `hooks/useGame/rpg/sect/memberDispatcher.ts` | 九 | 成员调度（模拟经营） |
| `hooks/useGame/rpg/sect/dynamicPricing.ts` | 九 | 动态定价（模拟经营） |
| `hooks/useGame/engine/dailyTownEngine.ts` | 十 | 日常城镇引擎 |
| `hooks/useGame/dailytown/townGraph.ts` | 十 | 城镇区域节点图 |
| `hooks/useGame/dailytown/actionPointManager.ts` | 十 | 行动力管理器 |
| `hooks/useGame/dailytown/timeOfDayManager.ts` | 十 | 时段管理器 |
| `hooks/useGame/dailytown/npcScheduleManager.ts` | 十 | NPC 日程管理器 |
| `hooks/useGame/dailytown/dynamicEventTrigger.ts` | 十 | 动态事件触发 |
| `models/dailyTown/regionNode.ts` | 十 | 区域节点数据模型 |
| `models/dailyTown/npcSchedule.ts` | 十 | NPC 日程数据模型 |
| `components/features/DailyTown/TownMap.tsx` | 十 | 城镇地图 UI |
| `components/features/DailyTown/MobileTownMap.tsx` | 十 | 移动端城镇地图 |
| `components/features/DailyTown/RegionPanel.tsx` | 十 | 区域面板（通用入口） |
| `components/features/DailyTown/regionPanels/WeaponShopPanel.tsx` | 十 | 武器铺面板 |
| `components/features/DailyTown/regionPanels/TavernPanel.tsx` | 十 | 酒楼面板 |
| `components/features/DailyTown/regionPanels/TeaHousePanel.tsx` | 十 | 茶楼面板 |
| `components/features/DailyTown/regionPanels/NpcResidencePanel.tsx` | 十 | NPC 居所面板 |
| `components/features/DailyTown/regionPanels/MarketPanel.tsx` | 十 | 市集面板 |
| `hooks/useGame/engine/avgDialogueEngine.ts` | 十一 | 对话引擎 |
| `hooks/useGame/avg/dialogue/dialogueTree.ts` | 十一 | 对话树结构 |
| `hooks/useGame/avg/dialogue/nodeResolver.ts` | 十一 | 节点解析器 |
| `hooks/useGame/avg/dialogue/conditionEvaluator.ts` | 十一 | 条件求值 |
| `models/avg/dialogueTree.ts` | 十一 | 对话树数据模型 |
| `hooks/useGame/engine/avgRelationEngine.ts` | 十二 | 关系引擎 |
| `hooks/useGame/avg/relation/relationGraph.ts` | 十二 | 关系图谱 |
| `hooks/useGame/avg/intimacy/intimacyStateMachine.ts` | 十二 | 好感度状态机 |
| `hooks/useGame/avg/intimacy/intimacyTrigger.ts` | 十二 | 好感度触发器 |
| `hooks/useGame/avg/galgame/routeDetector.ts` | 十二 | 路线判定（Galgame） |
| `hooks/useGame/avg/galgame/endingResolver.ts` | 十二 | 结局解析（Galgame） |
| `hooks/useGame/avg/galgame/cgGallery.ts` | 十二 | CG 图鉴（Galgame） |
| `components/features/Galgame/CGGallery.tsx` | 十二 | CG 图鉴 UI |
| `hooks/useGame/engine/avgBranchEngine.ts` | 十三 | 分支引擎 |
| `hooks/useGame/avg/branch/branchTracker.ts` | 十三 | 分支追踪器 |
| `hooks/useGame/avg/branch/consequenceResolver.ts` | 十三 | 后果解析器 |
| `hooks/useGame/engine/explorationEngine.ts` | 十四 | 地图探索引擎 |
| `hooks/useGame/exploration/mapGraph.ts` | 十四 | 地图节点图 |
| `hooks/useGame/exploration/fowSystem.ts` | 十四 | 战争迷雾系统 |
| `hooks/useGame/exploration/encounterCalculator.ts` | 十四 | 遇敌概率计算 |
| `hooks/useGame/exploration/treasureDetector.ts` | 十四 | 宝藏发现检定 |
| `hooks/useGame/exploration/eventTriggerPoint.ts` | 十四 | 事件触发点 |
| `models/exploration/mapNode.ts` | 十四 | 地图节点数据模型 |
| `components/features/Exploration/MapExplorer.tsx` | 十四 | 地图探索 UI |
| `components/features/Exploration/MobileMapExplorer.tsx` | 十四 | 移动端地图探索 |
| `components/features/Galgame/CharacterSprite.tsx` | UI-1 | 角色立绘组件 |
| `components/features/Galgame/SceneBackground.tsx` | UI-1 | 场景背景组件 |
| `components/features/Galgame/GalgameDialogueBox.tsx` | UI-2 | 对话框 + 逐字效果 |
| `components/features/Galgame/GalgameMode.tsx` | UI-2 | Galgame 模式容器 |
| `components/features/Galgame/CGPlayer.tsx` | UI-5 | CG 播放器 |
| `components/features/Exploration/TacticalMap.tsx` | UI-4 | SLG 战术地图 |
| `components/features/Exploration/FogOfWar.tsx` | UI-4 | 战争迷雾层 |
| `components/features/Transitions/SceneTransition.tsx` | UI-3 | 场景切换动画 |
| `components/features/UIMode/ModeSwitcher.tsx` | UI-6 | UI 模式切换器 |
| `hooks/useGame/ui/useTypewriter.ts` | UI-2 | 逐字显示 hook |
| `hooks/useGame/ui/uiModeManager.ts` | UI-6 | UI 模式管理器 |
| `hooks/useGame/ui/visualTierManager.ts` | 7.5 | 视觉降级层管理器 |
| `hooks/useGame/ui/performanceDetector.ts` | 7.5 | 性能检测（电池/CPU/网络） |
| `hooks/useGame/ui/dataUsageTracker.ts` | 7.5 | 流量统计与限制器 |
| `hooks/useGame/ui/proceduralAvatar.ts` | 7.5 | 程序化头像生成 |
| `hooks/useGame/ui/cssSceneGenerator.ts` | 7.5 | CSS 氛围场景生成 |
| `assets/presets/` | 7.5 | CC0 预置素材包目录 |
| `components/features/Settings/DataSaverPanel.tsx` | 7.5 | 省流量设置面板 |
| `components/features/Settings/PerformancePanel.tsx` | 7.5 | 性能模式设置面板 |

---

## 九、实施记录

### 阶段六：全局事件总线 + 叙事约束构建器

- [x] 6.1 全局事件总线（`globalEventBus.ts`）— 单例模式，订阅/发布/广播/历史/延迟队列
- [x] 6.2 事件类型定义（`eventTypes.ts`）— 46 种事件类型 + 领域映射 + 工厂函数
- [x] 6.3 叙事约束构建器（`constraintBuilder.ts`）— 分层注册、优先级注入、大小控制 < 2KB
- [x] 6.4 分层注入 prompt（`systemPromptBuilder.ts` L1592-1600）
- [x] 6.5 单元测试 — 29 tests 通过（EventBus 17 + ConstraintBuilder 12）
- [x] 6.6 build 通过 — 修改文件无 TypeScript 错误
- [x] 6.7 EngineType 扩展（`engine/types.ts`）— 6 → 18 种引擎类型
- [x] 6.8 Zustand 默认更新（`zustandStore.ts`）— allEngines() 辅助函数
- [x] 6.9 EngineRegistry 集成（`engineRegistry.ts`）— 自动订阅/取消订阅 EventBus
- [x] 6.10 GlobalTurnManager 集成（`globalTurnManager.ts`）— advanceTurn 后发布事件 + 处理延迟队列

### 阶段七：RPG 战斗引擎

- [ ] 7.1 RPG 战斗引擎主类
- [ ] 7.2 伤害/先攻/技能解析
- [ ] 7.3 Buff 管理器
- [ ] 7.4 战斗状态机
- [ ] 7.5 单元测试
- [ ] 7.6 build 通过

### 阶段八：RPG 装备/物品/功法引擎

- [ ] 8.1 RPG 装备引擎
- [ ] 8.2 RPG 物品引擎
- [ ] 8.3 RPG 功法引擎
- [ ] 8.4 单元测试
- [ ] 8.5 build 通过

### 阶段九：RPG 任务/门派引擎（+ 模拟经营扩展）

- [ ] 9.1 RPG 任务引擎
- [ ] 9.2 RPG 门派引擎
- [ ] 9.3 模拟经营扩展：经济管理
- [ ] 9.4 模拟经营扩展：成员调度
- [ ] 9.5 模拟经营扩展：动态定价
- [ ] 9.6 单元测试
- [ ] 9.7 build 通过

### 阶段十：日常城镇地图引擎

- [x] 10.1 DailyTownEngine 主类
- [x] 10.2 城镇区域节点图 (townGraph.ts)
- [x] 10.3 行动力管理器 (actionPointManager.ts) + 时段管理器 (timeOfDayManager.ts)
- [x] 10.4 NPC 日程管理器 (npcScheduleManager.ts)
- [x] 10.5 动态事件触发 (dynamicEventTrigger.ts)
- [ ] 10.6 区域面板 UI（武器铺/酒楼/茶楼等）— 待前端实施
- [x] 10.7 单元测试 — 52 tests 通过
- [x] 10.8 build 通过 — TypeScript 编译无错误

### 阶段十一：AVG 对话树引擎

- [x] 11.1 AVG 对话引擎 — `hooks/useGame/engine/avgDialogueEngine.ts`
- [x] 11.2 对话树结构 — `models/avg/dialogueTree.ts`
- [x] 11.3 节点解析器 + 条件求值 — `hooks/useGame/avg/dialogue/nodeResolver.ts` + `conditionEvaluator.ts`
- [x] 11.4 单元测试 — `hooks/useGame/phase11.test.ts`，52 tests 通过
- [ ] 11.5 build 通过

### 阶段十二：AVG 关系图谱/好感度（+ Galgame 扩展）

- [ ] 12.1 AVG 关系引擎
- [ ] 12.2 好感度状态机 + 触发器
- [ ] 12.3 Galgame 路线判定
- [ ] 12.4 Galgame 结局解析
- [ ] 12.5 Galgame CG 图鉴
- [ ] 12.6 单元测试
- [ ] 12.7 build 通过

### 阶段十三：AVG 分支叙事追踪引擎

- [ ] 13.1 AVG 分支引擎
- [ ] 13.2 分支追踪 + 后果解析
- [ ] 13.3 单元测试
- [ ] 13.4 build 通过

### 阶段十四：地图探索引擎

- [ ] 14.1 ExplorationEngine 主类
- [ ] 14.2 地图节点图 + 战争迷雾
- [ ] 14.3 遇敌概率 + 宝藏发现
- [ ] 14.4 事件触发点
- [ ] 14.5 地图探索 UI（桌面 + 移动）
- [ ] 14.6 单元测试
- [ ] 14.7 build 通过

### 阶段十五：四支柱 + 扩展玩法集成 + useGame.ts 拆分

- [ ] 15.1 GameOrchestrator 编排器
- [ ] 15.2 useGame.ts 拆分
- [ ] 15.3 存档集成
- [ ] 15.4 集成测试
- [ ] 15.5 build 通过

### 阶段十六：测试 + 性能优化

- [ ] 16.1 测试覆盖率达标（>= 80%）
- [ ] 16.2 性能优化
- [ ] 16.3 最终 build 通过
- [ ] 15.3 最终 build 通过
