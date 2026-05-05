# 校园论坛 AI 刷新后台队列修复

> 日期：2026-05-05
> 状态：实施中

---

## 一、问题分析

### 问题 1：刷新命令被当成正文发送给 LLM
**根因：** `App.tsx` 的 `onRefresh` 把 `/手机 刷新论坛内容` 作为文本命令通过 `handleSend()` 发送给主剧情 AI，而不是作为后台任务处理。

```typescript
// App.tsx L1790 — 当前实现
const prompt = appPromptMap[activeApp] || '/手机 刷新设备内容';
actions.handleSend(prompt);  // ❌ 发送到主剧情对话
```

### 问题 2：即使 AI 收到命令也不会生成内容
**根因：** `刷新校园论坛()` 函数（`campusForumWorkflow.ts`）虽然已经写好，但**从未被任何地方调用过**，是死代码。

### 问题 3：`生成设备消息` 的输出没有被消费
`生成设备消息()` 返回 `DeviceMessage[]`，但论坛需要的是 `论坛帖子[]` 和 `BDSM论坛帖子[]`。虽然 `campusForumWorkflow.ts` 中有解析函数，但整个流程没有被接入。

---

## 二、修复方案

### 方案：后台队列模式（复用生图监控架构）

参考现有 `NPC生图任务队列` + `use后台生图监控` 的架构，创建 `设备刷新任务队列` + `use后台设备刷新监控`。

### 2.1 新增后台队列系统

**文件：** `hooks/useGame.ts`

```
- 新增 state: 设备刷新任务队列
- 新增 ref: 设备刷新进行中标志
- 新增 use后台设备刷新监控 hook
```

### 2.2 创建后台刷新 hook

**文件：** `hooks/useGame/deviceRefreshMonitor.ts`（新文件）

监控任务队列，依次执行：
1. 调用 `刷新校园论坛()` 或 `生成设备消息()`
2. 将结果更新到 `校园系统` 状态
3. 标记任务完成

### 2.3 重写 `onRefresh`

**文件：** `App.tsx`

不再发送文本命令，改为：
```typescript
onRefresh={() => {
    const activeApp = meta.deviceState.activeApp;
    if (!activeApp) return;
    setters.set设备刷新队列?.(prev => [...prev, {
        id: `refresh-${Date.now()}`,
        app: activeApp,
        status: 'pending',
    }]);
}}
```

### 2.4 修复内容生成的潜在 bug

检查 `解析AIBDSM帖子` 和 `解析AI论坛帖子` 的 JSON 解析逻辑，确保 AI 返回的数据格式能被正确解析。

---

## 三、涉及的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `hooks/useGame/deviceRefreshMonitor.ts` | **新建** | 后台设备刷新监控 hook |
| `hooks/useGame.ts` | 修改 | 新增队列 state + 接入监控 |
| `App.tsx` | 修改 | 重写 onRefresh 为队列提交 |
| `hooks/useGame/campusForumWorkflow.ts` | 检查 | 验证解析逻辑 |
| `hooks/useGame/deviceAiWorkflow.ts` | 检查 | 验证 `生成设备消息` 返回值 |

---

## 四、实施步骤

- [x] 1. 创建 `hooks/useGame/deviceRefreshMonitor.ts` — 后台监控 hook
- [x] 2. 在 `useGame.ts` 中新增 `设备刷新任务队列` state 和监控接入
- [x] 3. 修改 `App.tsx` 的 `onRefresh` — 提交到队列而非发送文本
- [x] 4. 验证 `campusForumWorkflow.ts` 的解析逻辑（确认 `解析AI论坛帖子` 和 `解析AIBDSM帖子` 逻辑完整）
- [ ] 5. 在 `App.tsx` 中显示刷新状态（可选 UI 反馈）

---

## 五、风险与依赖

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| API 配置不存在时刷新崩溃 | 中 | 队列执行前检查 apiConfig 是否存在 |
| 并发刷新导致状态覆盖 | 中 | 队列顺序执行，单任务完成后再取下一个 |
| JSON 解析失败 | 低 | 已有 try/catch + errors 返回机制 |
