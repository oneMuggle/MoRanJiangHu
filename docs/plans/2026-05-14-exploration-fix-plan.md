# 探索功能修复计划

**日期**: 2026-05-14
**状态**: 待实施
**作者**: Claude Code

## Context

探索功能已有完整的架构分层（数据模型 → 引擎 → 桥接 → Zustand → UI），用户可以打开地图、移动节点、看到 AI 旅行叙事。但多个关键链路断裂导致"有引擎无效果"：移动不消耗行动力、遇敌不触发战斗、事件系统为空、探索/休息操作无 UI 入口等。

本计划按优先级分为 4 个阶段，从最关键的功能断裂修起，再到体验优化。

---

## Phase 1: P0 关键链路修复

### Step 1.1: 修复 moveTo() 中 `from` 字段错误

**文件**: `hooks/useGame/engine/explorationEngine.ts` (约第155-196行)

**问题**: `_currentNodeId` 在第161行被先更新为 `targetNodeId`，后续 `_pushEvent` 的 `from` 字段读到的是已更新的值，导致 `from` 和 `to` 相同。

**修改**: 在 `const path = ...` 获取路径之后、`this._currentNodeId = targetNodeId` 之前，保存原始值：
```
const fromNodeId = this._currentNodeId;
```
然后将 `_pushEvent` 中的 `from: this._currentNodeId` 改为 `from: fromNodeId`。

---

### Step 1.2: 移动时消耗行动力

**文件**: `hooks/useGame/engine/explorationEngine.ts`

**修改位置1 — `moveTo()` 方法**（约第158行之后）:

在获取到 path 之后、更新 `_currentNodeId` 之前，插入 AP 检查与扣减：
```
if (this._currentAp < path.actionCost) {
  return { success: false, hiddenEvents: [], travelTimeMinutes: 0, pathCost: path.actionCost };
}
this._currentAp -= path.actionCost;
```

**修改位置2 — `canExecuteAction()` 方法**（约第90-93行）:

在 `moveTo` 分支中增加 AP 充足性检查：
```
if (action.type === 'moveTo') {
  if (!this._currentNodeId) return false;
  const target = action.payload.targetNodeId as string | undefined;
  if (!target || !this._graph.hasPath(this._currentNodeId, target)) return false;
  const path = this._graph.getPathsFrom(this._currentNodeId).find((p) => p.to === target);
  return !!path && this._currentAp >= path.actionCost;
}
```

---

### Step 1.3: 遇敌/宝藏结果事件入队

**文件**: `hooks/useGame/engine/explorationEngine.ts` (约第171-180行之后)

**问题**: `rollEncounter()` 和 `rollTreasure()` 的结果仅用于 `_pushEvent('移动', ...)` 的 payload，没有独立事件驱动后续处理。

**修改**: 在 `_pushEvent('移动', ...)` 之前，为遇敌和宝藏各推入独立事件：
```
if (encounter.triggered) {
  this._pushEvent('遇敌', `在 ${targetNode.name} 遭遇了${encounter.encounterType}`, {
    encounterType: encounter.encounterType,
    entityId: encounter.entityId,
    dangerLevel: encounter.dangerLevel,
  });
}

if (treasure.found) {
  this._pushEvent('发现宝藏', `在 ${targetNode.name} 发现了${treasure.quality}品质的宝藏`, {
    treasureId: treasure.treasureId,
    quality: treasure.quality,
  });
}
```

> 注意：当前阶段只做事件入队，让叙事系统能感知到这些事件。实际战斗/NPC/背包联动留作后续迭代。

---

## Phase 2: P1 功能补全

### Step 2.1: 注册基础事件触发点

**文件**: `hooks/useGame/engine/explorationEngine.ts`

**修改1**: 在 `ExplorationEngine` 类中添加公共方法：
```
registerEventTrigger(trigger: EventTrigger): void {
  this._eventManager.addTrigger(trigger);
}
```

**修改2**: 在 `initMap()` 末尾，为每个节点注册首次访问事件：
```
for (const node of nodes) {
  this._eventManager.addTrigger({
    id: `evt_first_${node.id}`,
    nodeId: node.id,
    conditionType: 'first_visit',
    eventId: `narrative_first_visit_${node.id}`,
    oneTime: true,
  });
}
```

---

### Step 2.2: 添加"探索"和"休息"按钮到 UI

需要修改 5 个文件：

**1. `components/features/Exploration/MapExplorer.tsx`**

- Props 接口新增：`onExplore?: () => void` 和 `onRest?: () => void`
- 在 stats bar 区域（时段/银两下方）添加两个按钮：
  - "探索此地" → 调用 `onExplore`
  - "休息" → 调用 `onRest`

**2. `components/features/Exploration/MobileMapExplorer.tsx`**

- 同样新增 props 和按钮，适配移动端布局

**3. `components/features/Exploration/MapExplorerModal.tsx`**

- Props 新增 `onExplore` 和 `onRest`，传递给子组件 `MapExplorer`

**4. `components/features/Exploration/MobileMapExplorerModal.tsx`**

- 同上，传递给 `MobileMapExplorer`

**5. `components/app/ModalLayer.tsx`** (约第753-774行)

在探索弹窗的调用处添加回调：
```
onExplore={() => {
  const bridge = (actions as any).explorationBridge;
  bridge?.explore?.();
}}
onRest={() => {
  const bridge = (actions as any).explorationBridge;
  bridge?.rest?.();
}}
```

---

## Phase 3: P2 体验改善

### Step 3.1: 探索叙事加入时代匹配

**当前问题**: `TravelNarrativeContext` 不包含时代字段，`buildSystemPrompt()` 硬编码为"传统武侠/仙侠风格"。无论玩家选的是"古代武侠"、"现代都市"还是"赛博朋克"，AI 都用同一种文风生成旅行叙事。

**涉及文件**:
- `hooks/useGame/exploration/explorationNarrativeService.ts` — Context 接口 + system/user prompt
- `hooks/useExplorationBridge.ts` — 从 Zustand 读取时代信息注入 context
- `models/eraTheme/assembly.ts` — 时代树 + `resolveEraNode(id)`（只读复用）
- `models/eraTheme/types.ts` — `EraPromptVars` 类型（只读复用）

**修改 1: 扩展 `TravelNarrativeContext` 接口**

文件: `explorationNarrativeService.ts` (约第8-21行)

新增字段:
```typescript
eraId?: string;         // 当前时代 ID（如 "ancient_wuxia"、"modern_urban"）
eraName?: string;       // 时代名称（如"古代武侠"、"现代都市"）
eraPromptVars?: {       // 时代提示词变量
    社会形态?: string;
    科技水平?: string;
    力量体系?: string;
    禁忌?: string[];
};
```

**修改 2: `buildSystemPrompt()` 改为时代感知**

同一文件 (约第28-43行)。当前硬编码为"传统武侠/仙侠风格"，改为根据时代动态调整：

```typescript
function buildSystemPrompt(context: TravelNarrativeContext): string {
    const style = getEraWritingStyle(context.eraId);
    return `你是一位${style}小说家。...`;
}
```

文风映射示例：
- 无 eraId 或古代系 → "传统武侠/仙侠风格"
- 现代系 → "现代都市写实风格"
- 赛博朋克系 → "赛博朋克霓虹 noir 风格"
- 未来系 → "科幻史诗叙事风格"

可通过 `resolveEraNode(eraId)` 获取 `promptVars` 中的力量体系等信息。

**修改 3: `buildUserPrompt()` 注入时代约束**

同一文件 (约第46-69行)。在 prompt 中追加时代信息：

```typescript
if (context.eraName) {
    prompt += `\n\n### 时代背景\n时代: ${context.eraName}`;
    if (context.eraPromptVars?.社会形态) {
        prompt += `\n社会形态: ${context.eraPromptVars.社会形态}`;
    }
    if (context.eraPromptVars?.科技水平) {
        prompt += `\n科技水平: ${context.eraPromptVars.科技水平}`;
    }
    if (context.eraPromptVars?.力量体系) {
        prompt += `\n力量体系: ${context.eraPromptVars.力量体系}`;
    }
    if (context.eraPromptVars?.禁忌 && context.eraPromptVars.禁忌.length > 0) {
        prompt += `\n禁忌: ${context.eraPromptVars.禁忌.join('、')}`;
    }
}
```

**修改 4: `useExplorationBridge.ts` 注入时代信息**

文件: `hooks/useExplorationBridge.ts` (约第110-122行，`moveTo()` 构建 context 处)

从 Zustand store 读取时代信息并传入：

```typescript
const store = useGameStore.getState();
const eraInfo = store.时代信息;
const eraId = eraInfo?.配置ID;

// 如果有 eraId，通过 resolveEraNode 获取详细信息
const eraNode = eraId ? resolveEraNode(eraId) : null;

const context: TravelNarrativeContext = {
    // ... 已有字段 ...
    eraId: eraId,
    eraName: eraInfo?.名称 || eraNode?.name,
    eraPromptVars: eraNode?.promptVars,
};
```

> 需要从 `models/eraTheme/assembly` 导入 `resolveEraNode`。

---

### Step 3.2: 叙事约束注入 AI Prompt

**文件1**: `hooks/useGame/exploration/explorationNarrativeService.ts`

在 `TravelNarrativeContext` 接口中新增可选字段：
```
narrativeConstraints?: string;
```

在 `buildUserPrompt()` 末尾（返回 prompt 之前）追加：
```
if (context.narrativeConstraints) {
  prompt += `\n\n### 当前状态约束\n${context.narrativeConstraints}\n`;
}
```

**文件2**: `hooks/useExplorationBridge.ts` (约第110行构建 context 时)

添加叙事约束到 context：
```
narrativeConstraints: this.getNarrativeConstraints() ?? undefined,
```

---

### Step 3.3: 读档后引擎状态重建

**文件**: `hooks/useGame.ts`

在 `useGame.ts` 中找到 `handleLoadGame` 的使用位置（通过 saveLoadWorkflow），在加载完成后重建探索引擎。

具体方案：在 `构建useGame返回值` 中，将 `handleLoadGame` 包装：
```
const wrappedHandleLoadGame: typeof handleLoadGame = async (save) => {
  const result = await handleLoadGame(save);
  // 读档后重建探索引擎
  const store = useGameStore.getState();
  if (store.explorationNodes && store.explorationNodes.length > 0) {
    const newEngine = createExplorationEngine();
    explorationBridge.engineRef.current = newEngine;
    newEngine.initMap(
      store.explorationNodes,
      store.explorationPaths || [],
      store.explorationCurrentNodeId || undefined
    );
    // 恢复 AP 状态
    (newEngine as any)._currentAp = store.explorationCurrentAp ?? 10;
    (newEngine as any)._maxAp = store.explorationMaxAp ?? 10;
  }
  return result;
};
```

在返回值中将 `handleLoadGame` 替换为 `wrappedHandleLoadGame`。

---

### Step 3.4: UI 中显示行动力信息

**文件**: `components/features/Exploration/MapExplorer.tsx` 和 `MobileMapExplorer.tsx`

在 stats bar 区域（时段显示旁边）添加行动力显示：
```
<span className="text-gray-400">
  行动力: <span className="text-emerald-400">{currentActionPoints}/{maxActionPoints}</span>
</span>
```

---

## Phase 4: P3 次要修复

### Step 4.1: 修复银两硬编码

**文件**: `components/features/Exploration/MapExplorerModal.tsx` 和 `MobileMapExplorerModal.tsx`

将 `playerSilver={0}` 替换为从 Zustand store 读取。参考项目中已有的读取方式，获取角色银两字段并传递给子组件。

---

### Step 4.2: 改进地图坐标布局（可选）

**文件**: `hooks/useGame/exploration/mapNodeAdapter.ts` 的 `computeLayoutXY` 函数

当前使用伪随机哈希计算坐标。改进为基于 BFS 路径距离的分层布局：
- 当前节点固定在中心
- 相邻节点按圆形排列在固定半径上
- 非相邻节点根据最短路径距离放置在不同半径的圆环上

> 此步骤为体验优化，优先级最低。

---

## 依赖关系

```
Phase 1 (最关键，可并行):
  Step 1.1 (from字段修复) ──┐
  Step 1.2 (AP消耗)       ──┼── 可并行执行，无相互依赖
  Step 1.3 (遇敌事件入队) ──┘

Phase 2 (Phase 1 之后):
  Step 2.1 (事件注册) ──┐
  Step 2.2 (UI按钮)   ──┘── 可并行

Phase 3 (Phase 2 之后):
  Step 3.1 (时代匹配)   ──┐
  Step 3.2 (叙事约束)   ──┼── 可并行执行（同改 explorationNarrativeService）
  Step 3.3 (存档同步)   ──┤
  Step 3.4 (UI行动力)   ──┘

Phase 4 (最后):
  Step 4.1 (银两) ──┐
  Step 4.2 (布局) ──┘── 可并行
```

---

## 实施步骤

- [x] Phase 1: P0 关键链路修复
  - [x] Step 1.1: 修复 moveTo() 中 from 字段错误
  - [x] Step 1.2: 移动时消耗行动力 → **已撤回**：AP 系统已移除，改为本地时间计算
  - [x] Step 1.3: 遇敌/宝藏结果事件入队
- [x] Phase 2: P1 功能补全
  - [x] Step 2.1: 注册基础事件触发点
  - [x] Step 2.2: 添加"探索"和"休息"按钮到 UI
- [x] Phase 3: P2 体验改善
  - [x] Step 3.1: 探索叙事加入时代匹配
  - [x] Step 3.2: 叙事约束注入 AI Prompt
  - [ ] Step 3.3: 读档后引擎状态重建（待后续迭代）
  - [x] Step 3.4: UI 中显示行动力信息 → **已改为**：显示"预计耗时"（本地计算）
- [x] Phase 4: P3 次要修复
  - [x] Step 4.1: 修复银两硬编码
  - [ ] Step 4.2: 改进地图坐标布局（可选，待后续迭代）
- [x] Phase 5: AP 系统移除 + 本地时间计算
  - [x] 移除 `moveTo()` 中的 AP 扣减逻辑
  - [x] 新增 `_calculateTravelTime()` 本地计算方法
  - [x] `mapNodeAdapter.ts` 为每个相邻节点计算 `estimatedTimeMinutes`
  - [x] UI 移除"行动力: X/Y"，改为在节点卡片显示"预计 X 分钟"
  - [x] `explorationNarrativeService.ts` 移除 AI JSON 时间解析，AI 只生成纯叙事文本
  - [x] `useExplorationBridge.ts` 使用 `moveTo()` 返回的本地时间替代 AI 返回时间
  - [x] `explorationEngine.ts` `moveTo()` 返回实际计算的 `travelTimeMinutes`（之前硬编码为 0）

---

## 验证方式

| 阶段 | 验证操作 | 预期结果 |
|------|---------|---------|
| Phase 1 | 多次移动节点 | 移动不消耗 AP，每次移动后触发 AI 旅行叙事 |
| Phase 1 | 查看事件队列 | 遇敌/宝藏有独立事件入队 |
| Phase 2 | 打开探索弹窗 | 能看到"探索"和"休息"按钮 |
| Phase 2 | 点击"探索" | 可能发现宝藏 |
| Phase 2 | 点击"休息" | 无 AP 恢复（已移除 AP 系统） |
| Phase 3 | 移动后看AI叙述 | 叙述包含探索状态约束信息 + 时代文风匹配 |
| Phase 3 | 读档后打开地图 | 地图状态与读档前一致 |
| Phase 3 | 切换时代后移动 | 叙事文风随时代变化（古代武侠/现代/科幻） |
| Phase 4 | 查看银两显示 | 显示实际银两数量（非0） |
| Phase 4 | 查看地图布局 | 节点位置有地理关系感 |
| **Phase 5** | 查看节点卡片 | 相邻节点显示"预计 X 分钟" |
| **Phase 5** | 移动后看时间推进 | 游戏时间按本地计算的分钟数推进 |
| **Phase 5** | 不同路径耗时对比 | 危险区域/远距离路径耗时更长 |

---

## 涉及文件清单

| 文件 | 修改内容 |
|------|---------|
| `hooks/useGame/engine/explorationEngine.ts` | Step 1.1, 1.3, 2.1, Phase 5（AP移除+本地时间计算） |
| `components/features/Exploration/MapExplorer.tsx` | Step 2.2, Phase 5（预计耗时显示） |
| `components/features/Exploration/MobileMapExplorer.tsx` | Step 2.2, Phase 5（预计耗时显示） |
| `components/features/Exploration/MapExplorerModal.tsx` | Step 2.2, 4.1, Phase 5（移除AP props） |
| `components/features/Exploration/MobileMapExplorerModal.tsx` | Step 2.2, 4.1, Phase 5（移除AP props） |
| `components/app/ModalLayer.tsx` | Step 2.2 |
| `hooks/useExplorationBridge.ts` | Step 3.1, 3.2, Phase 5（使用本地时间） |
| `hooks/useGame/exploration/explorationNarrativeService.ts` | Step 3.1, 3.2, Phase 5（移除JSON时间解析） |
| `hooks/useGame/exploration/mapNodeAdapter.ts` | Phase 5（计算预计耗时） |
| `models/eraTheme/assembly.ts` | Step 3.1（只读复用 resolveEraNode） |
| `hooks/useGame.ts` | Step 3.3 |

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| AP 消耗后玩家无法移动 | 高 | 确保休息按钮同步上线，恢复 AP |
| 遇敌事件与现有战斗系统对接 | 中 | Phase 1 仅做事件入队，后续迭代对接 |
| 两套旅行系统并存 | 中 | 暂时保持独立，标记旧系统为待迁移 |
| 读档后引擎状态重建失败 | 低 | 有 guard 条件，无数据时跳过重建 |
