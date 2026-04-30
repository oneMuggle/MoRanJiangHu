# 修复：开局设置中切换时代后 UI 主题未变 + 体系显示错误

**日期**: 2026-04-30
**状态**: 已完成

---

## Bug 分析

### Bug 1: 切换时代后 UI 主题未改变

**根因**: 在 `NewGameWizard.tsx:42-48` 和 `MobileNewGameWizard.tsx:39-45` 中，EraSelector 的 `onChange` 回调只做了两件事：
1. `wizard.setWorldConfig({ ..., 时代配置ID: eraId })` — 更新本地状态
2. `应用时代主题到根元素(eraScheme)` — 设置 CSS 变量到 `document.documentElement`

CSS 变量确实被设置了，但 `useNewGameWizardState.ts:78-95` 中的 `currentEra` sync effect **不会触发**，因为全局 `currentEra` prop 没有变化。这个 effect 的守卫条件 `if (prev.时代配置ID === currentEra) return prev;` 在 wizard 内部选中新时代时，`currentEra` 是外部传入的旧值，所以 `setWorldConfig` 中的 effect 会更新 `时代配置ID`，但不会更新 `能力类型`、`武力等级` 等衍生字段。

**实际影响**: `应用时代主题到根元素` 已经设置 CSS 变量了，但组件内部的衍生状态（能力类型、武力等级）没有跟着时代更新，导致预设卡片等 UI 没有正确切换。

### Bug 2: 体系显示依然是"武侠和志怪"

**根因**: `useNewGameWizardState.ts:148` 初始化 `古代体系选择 = '武侠'`，但 `currentEra` sync effect（第 78-95 行）**从未更新** `古代体系选择`。

具体场景：
1. 用户选了 `ancient_eastern_zhiguai`（支持体系: `['志怪', '双修']`）
2. 但 `古代体系选择` 仍然是 `'武侠'`
3. `NewGameWizardContent.tsx:313-338` 的体系选择 UI 中，`支持体系` 数组不包含 `'武侠'`，所以高亮按钮可能错位
4. `NewGameWizardContent.tsx:235-236` 的预设过滤中，`古代体系选择 === '武侠'` 仍然走武侠分支

**NSFW 模式**: NSFW 开启只是让用户注意到这个 bug（因为 NSFW 用户会更频繁使用开局设置），NSFW 本身不是根因。

---

## 修复方案

### 修复 1: `useNewGameWizardState.ts` — sync effect 增加 `古代体系选择` 同步

**文件**: `components/features/NewGame/useNewGameWizardState.ts`
**位置**: 第 78-95 行的 `useEffect`

**改动**: 在 `currentEra` 变化时，检查新 eras 的 `支持体系`，如果当前的 `古代体系选择` 不在其中，重置为第一个有效值。

### 修复 2: `useNewGameWizardState.ts` — return 中暴露 `设置古代体系选择`

**改动**: 确保 wizard 对象的 return 值中包含 `设置古代体系选择`，以便 NewGameWizard.tsx 和 MobileNewGameWizard.tsx 调用。

### 修复 3: `NewGameWizard.tsx` — EraSelector onChange 中同步 `古代体系选择`

**文件**: `components/features/NewGame/NewGameWizard.tsx`
**位置**: 第 42-50 行

**改动**: 在 EraSelector onChange 中，根据新 eras 的 `支持体系` 更新 `古代体系选择`。

### 修复 4: `MobileNewGameWizard.tsx` — 同样修复

**文件**: `components/features/NewGame/mobile/MobileNewGameWizard.tsx`
**位置**: 第 39-46 行

**改动**: 同修复 3。

### 修复 5: TypeScript 检查 + 构建

---

## 实施步骤

| 步骤 | 文件 | 改动 | 复杂度 |
|------|------|------|--------|
| 1 | `useNewGameWizardState.ts` | sync effect 增加 `古代体系选择` 重置逻辑 | 低 |
| 2 | `useNewGameWizardState.ts` | return 中暴露 `设置古代体系选择` | 低 |
| 3 | `NewGameWizard.tsx` | EraSelector onChange 中调用 `wizard.设置古代体系选择` | 低 |
| 4 | `MobileNewGameWizard.tsx` | EraSelector onChange 中调用 `wizard.设置古代体系选择` | 低 |
| 5 | TypeScript 检查 + 构建 | 验证无新错误 | 低 |

---

## 进度记录

| 时间 | 步骤 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-30 01:45 | Step 1 | ✅ 完成 | sync effect 增加 `古代体系选择` 重置 |
| 2026-04-30 01:45 | Step 2 | ✅ 完成 | `设置古代体系选择` 已在 return 中（无需改动） |
| 2026-04-30 01:45 | Step 3 | ✅ 完成 | `NewGameWizard.tsx` EraSelector onChange 已同步 |
| 2026-04-30 01:45 | Step 4 | ✅ 完成 | `MobileNewGameWizard.tsx` 同上 |
| 2026-04-30 01:45 | Step 5 | ✅ 完成 | TS 检查通过 + 构建成功 (8.75s) |
