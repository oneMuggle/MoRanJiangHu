# MoRanJiangHu 项目优化分析

> 日期: 2026-05-05
> 状态: 待审核
> 文件: `docs/plans/2026-05-05_project-optimization-analysis.md`

---

## 概览

代码库分析发现 14 项优化内容，按优先级 P0（关键）→ P3（锦上添花）排序。

| 指标 | 当前值 | 目标值 |
|------|--------|--------|
| useGame.ts 行数 | ~2376 | <800 |
| App.tsx 行数 | ~1817 | <800 |
| `as any` 强转 | 6+ | 0 |
| isRefreshing 属性穿透层级 | 5 层 | <= 2 层 |

---

## P0 -- 类型安全修复（关键）

### P0-1: 消除 `apiConfig as any`（useGame.ts）

**根因：** `deviceRefreshMonitor.ts` 声明 `apiSettings: 接口设置结构`，但接收到 `当前可用接口结构`。

**修改文件：**
- `hooks/useGame/deviceRefreshMonitor.ts` — `apiSettings` 类型改为 `当前可用接口结构`
- `hooks/useGame/deviceAiWorkflow.ts` — `生成设备原始消息` 第二参数类型修正
- `hooks/useGame.ts` — 移除 `as any`

**风险：** 低 — 纯类型变更。**预估：** 30 分钟

### P0-2: 消除 `(meta as any).deviceRefreshQueue`（App.tsx）

**修复：** meta 已暴露 `deviceRefreshQueue: 设备刷新任务[]`，App.tsx 需正确解构。

**风险：** 低。**预估：** 15 分钟

### P0-3: 类型化 `nsfw设置` 访问（useGame.ts）

**修复：** 添加 `校园NSFW设置` 到 `游戏设置结构` 或使用 proper narrowing。

**风险：** 中。**预估：** 45 分钟

---

## P1 -- 状态管理

### P1-1: 通过 Context 消除 isRefreshing/onRefresh 属性穿透

**当前链：** MobileDeviceModal → MobileDevice → MobileHome → renderActiveApp() → CampusForumApp

**修复：** 创建 `DeviceRefreshContext` + `useDeviceRefresh()` hook

**风险：** 中。**预估：** 1.5 小时

### P1-2: 聚合校园回调属性

**预估：** 1 小时

---

## P1 -- 代码质量

### P1-3: 消除 `生成设备消息` 和 `生成设备原始消息` 重复代码

**修复：** 提取共享核心逻辑函数

**风险：** 低。**预估：** 45 分钟

### P1-4: 拆分 CampusForumApp

**目标：** ForumBoard.tsx + BDSMBoard.tsx 各 <= 200 行

**风险：** 低。**预估：** 2 小时

---

## P2 -- 用户体验

| ID | 描述 | 预估 |
|----|------|------|
| P2-1 | 错误详情展开显示 | 1.5 小时 |
| P2-2 | 空状态改进 | 1 小时 |
| P2-3 | 刷新进度反馈 | 1.5 小时 |

---

## 实施路线图

| 阶段 | 项目 | 优先级 | 预估时间 |
|------|------|--------|----------|
| 阶段 1 | P0-1, P0-2, P0-3 | P0 | 1.5 小时 |
| 阶段 2 | P1-3, P1-1 | P1 | 2 小时 |
| 阶段 3 | P1-4, P1-2 | P1 | 3 小时 |
| 阶段 4 | P2-1, P2-2, P2-3, P2-4 | P2 | 5 小时 |
| 阶段 5 | P2-5, P3-1/2/3 | P2/P3 | 6.5 小时 |

---

## 成功标准

- [ ] `as any` 从 6+ 降至 0
- [ ] `isRefreshing`/`onRefresh` 属性穿透最多 2 层
- [ ] `生成设备消息` 和 `生成设备原始消息` 共享核心逻辑
- [ ] CampusForumApp 组件每个 <= 200 行
- [ ] TypeScript 零错误零警告编译
