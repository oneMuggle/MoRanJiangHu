# useGame.ts 拆分重构计划

**日期：** 2026-05-09
**状态：** 实施中
**负责人：** AI Assistant

---

## 背景与目标

`hooks/useGame.ts` 当前约 **1717 行**，是 React 应用的核心 Hook。尽管已经进行了部分模块化拆分（有 150+ 个子模块文件），但主文件仍然是所有子系统的编排中心，存在以下问题：

1. **主文件过大**：1717 行，超出 800 行上限
2. **依赖注入地狱**：每个子系统创建需传递 10-30 个依赖项
3. **状态声明重复**：从 `gameState` 解构 ~45 个状态，从 Zustand store 解构 ~40 个状态
4. **Ref 管理分散**：~20 个 Ref 散布在主文件中
5. **上帝协调器模式**：主文件成为所有子系统间耦合的中介

### 重构目标

- 将 `useGame.ts` 从 **1717 行减少到 ~200 行**
- 减少 props 透传复杂度
- 保持现有功能不变
- 保持向后兼容的导出接口

---

## 涉及的文件与模块

### 现有文件（将被修改）

| 文件 | 当前行数 | 目标行数 | 说明 |
|------|----------|----------|------|
| `hooks/useGame.ts` | ~1717 | ~200 | 主 Hook 文件 |

### 新增文件

| 文件 | 预估行数 | 说明 |
|------|----------|------|
| `hooks/useGame/state/gameStateAccess.ts` | ~200 | 统一状态访问层 |
| `hooks/useGame/state/refRegistry.ts` | ~150 | Ref 集中管理 |
| `hooks/useGame/coordinators/subsystemContext.ts` | ~200 | 子系统共享上下文 |
| `hooks/useGame/coordinators/workflowCoordinator.ts` | ~300 | 工作流协调器 |
| `hooks/useGame/domains/imageDomain.ts` | ~200 | 图片生成域 |
| `hooks/useGame/domains/memoryDomain.ts` | ~150 | 记忆系统域 |
| `hooks/useGame/domains/coreDomain.ts` | ~200 | 核心逻辑域 |
| `hooks/useGame/domains/sessionDomain.ts` | ~200 | 会话生命周期域 |
| `hooks/useGame/domains/settingsDomain.ts` | ~150 | 设置管理域 |
| `hooks/useGame/domains/npcDomain.ts` | ~150 | NPC 管理域 |
| `hooks/useGame/domains/deviceDomain.ts` | ~100 | 设备系统域 |
| `hooks/useGame/domains/worldDomain.ts` | ~150 | 世界演变域 |
| `hooks/useGame/domains/variableDomain.ts` | ~150 | 变量生成域 |

---

## 技术方案

### 架构设计

采用**域分组 + 上下文共享**的模式：

```
useGame (200 lines)
├── createSubsystemContext()    // 共享依赖
├── createImageDomain()         // 图片相关
├── createMemoryDomain()        // 记忆相关
├── createCoreDomain()          // 核心发送/命令
├── createSessionDomain()       // 存读档/会话
├── createSettingsDomain()      // 设置持久化
├── createNpcDomain()           // NPC 操作
├── createDeviceDomain()        // 设备系统
├── createWorldDomain()         // 世界演变
├── createVariableDomain()     // 变量生成
└── buildUseGameReturn()        // 返回值映射
```

### 关键模式

#### 1. 统一状态访问

```typescript
// 替代当前 ~85 个解构变量
const stateAccess = createGameStateAccess(gameState, store);
```

#### 2. 共享子系统上下文

```typescript
// 替代逐个参数传递
const context = createSubsystemContext(stateAccess);
```

#### 3. 域分组

```typescript
// 每个域接收统一上下文，返回该域的所有导出函数/状态
const imageDomain = createImageDomain(context);
```

---

## 实施步骤

### 阶段 1：状态管理整合

- [x] 步骤 1.1：创建 `hooks/useGame/state/gameStateAccess.ts`
  - 整合所有从 `gameState` 解构的状态变量
  - 整合所有从 Zustand store 访问的状态
  - 提供类型安全的访问接口
- [x] 步骤 1.2：创建 `hooks/useGame/state/refRegistry.ts`
  - 集中管理所有 Ref
  - 提供 Ref 注册和同步机制
- [x] 步骤 1.3：类型验证通过
  - 所有新文件 TypeScript 编译零错误
  - 导出到 `state/index.ts`

### 阶段 2：工作流协调器

- [x] 步骤 2.1：创建 `hooks/useGame/coordinators/subsystemContext.ts`
  - 定义 `SharedSubsystemContext` 类型
  - 包含所有子系统共用的依赖项
- [ ] 步骤 2.2：创建 `hooks/useGame/coordinators/workflowCoordinator.ts`
  - 提取所有"创建 XX 工作流()"调用
  - 每个子系统接收上下文对象而非逐个参数
- [ ] 步骤 2.3：更新 `useGame.ts` 使用协调器
  - 验证编译通过
  - 验证运行时行为一致

### 阶段 3：功能域分组

- [x] 步骤 3.1：创建 `hooks/useGame/domains/imageDomain.ts`
  - 聚合图片生成相关子系统（场景图片档案、图片生成协调器、图片预设、手动 NPC、手动图片动作、主角图片）
  - **已集成到 useGame.ts**，替换 ~187 行内联代码为单个域调用
- [x] 步骤 3.2：创建 `hooks/useGame/domains/memoryDomain.ts`
  - 聚合记忆系统相关子系统（记忆总结处理器、变量生成进度系统、变量生成队列调度器、变量校准协调器）
  - **暂未集成**：存在循环依赖（`useFeatureFlags` 需要 `应用并同步记忆系统` / `清空变量生成上下文缓存`，而 `memoryDomain` 需要 `世界演变功能已开启` 来自 `useFeatureFlags`）
  - 当前保持内联创建，memoryDomain.ts 保留为未来重构参考
- [x] 步骤 3.3：创建 `hooks/useGame/domains/index.ts`
  - 域分组统一导出
- [ ] 步骤 3.4：创建 `hooks/useGame/domains/sessionDomain.ts`
  - 聚合存读档/会话生命周期相关子系统
- [ ] 步骤 3.5：创建 `hooks/useGame/domains/coreDomain.ts`
  - 聚合核心发送/命令相关子系统
- [ ] 步骤 3.6：更新 `useGame.ts` 使用域分组
  - 验证编译通过
  - 验证运行时行为一致

### 阶段 4：主文件精简

- [ ] 步骤 4.1：精简 `useGame.ts` 主文件
  - 移除所有已提取的子系统创建逻辑
  - 仅保留编排和返回值映射
- [ ] 步骤 4.2：更新返回值映射
  - 确保所有导出函数/状态正确映射
- [ ] 步骤 4.3：最终验证
  - 运行 `npm run build`
  - 运行 `npm run lint`
  - 手动测试核心功能

---

## 风险评估与依赖

### 风险

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| 回归 bug | HIGH | 每个阶段完成后运行 build 和 lint，手动测试核心功能 |
| 类型错误 | MEDIUM | 利用 TypeScript 类型检查，逐步验证 |
| 运行时行为变化 | LOW | 保持功能接口不变，逐项对比 |
| 重构时间过长 | MEDIUM | 分 4 个阶段，每阶段可独立验证和暂停 |

### 依赖

- 无外部依赖
- 依赖现有 TypeScript/React/Vite 工具链
- 依赖 Zustand store 的稳定性

### 预估工作量

| 阶段 | 预估时间 | 复杂度 |
|------|----------|--------|
| 阶段 1：状态管理整合 | 2-3 小时 | 中 |
| 阶段 2：工作流协调器 | 3-4 小时 | 高 |
| 阶段 3：功能域分组 | 4-5 小时 | 高 |
| 阶段 4：主文件精简 | 1-2 小时 | 低 |
| **总计** | **10-14 小时** | **高** |

---

## 验收标准

1. `useGame.ts` 主文件行数 ≤ 300 行 → **当前 1557 行（从 1717 减少 160 行）**
2. `npm run build` 通过 → **通过**
3. `npm run lint` 通过
4. 所有现有功能正常工作
5. 导出的 API 保持向后兼容

---

## 当前进度

- **主文件行数**: 1557（目标 ~200）
- **已完成**: imageDomain 集成，减少 ~187 行
- **阻塞项**: memoryDomain 因循环依赖无法直接集成，需重构 `useFeatureFlags` 的依赖方式
- **下一步**: 考虑 sessionDomain 和 coreDomain 的提取，进一步减少主文件行数
