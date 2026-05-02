# Phase 0: 基础设施搭建 — Vitest + Error Boundary + 时代资源 + 清理

> **Commit:** `69abdcc` | **Status:** ✅ 已完成 | **Date:** 2026-04-28

## 概述

基础设施搭建，启用测试、错误处理和时代主题 UI 资源。

## 已完成内容

### 1. Vitest 测试框架

- 安装 Vitest 并配置 `jsdom` 环境
- 创建 `vitest.config.ts` 配置
- 创建 `setupTests.ts` 入口
- 在 `package.json` 中添加 `npm run stress:test` 脚本

**状态:** ✅ 已完成

### 2. Error Boundary 组件

- 创建 `components/ui/ErrorBoundary.tsx`（64 行）
- React 错误边界，用于优雅处理 UI 错误

**状态:** ✅ 已完成

### 3. 时代资源图片和 BGM

添加了时代特定的视觉和音频资源，位于 `data/era_assets/`：

| 时代 | 图片 | BGM |
|-----|------|-----|
| 古代武侠 (ancient_wuxia) | 3 张 | ✅ |
| 近代共和 (republic_modern) | 7 张 | ✅ |
| 现代都市 (modern_urban) | 6 张 | ✅ |
| 赛博朋克 (cyberpunk_nearfuture) | 6 张 | ✅ |
| 科幻未来 (scifi_future) | 6 张 | ✅ |
| 古代志怪 (ancient_zhiguai) | 3 张 | ✅ |

同时添加了 `data/era_assets/index.html` — 可浏览的资源索引页面。

**状态:** ✅ 已完成

### 4. 清理

- 删除 `models/eraTheme.ts.backup`（过时的备份文件）

**状态:** ✅ 已完成

## 变更文件

- `components/ui/ErrorBoundary.tsx`（新建，64 行）
- `vitest.config.ts`（新建，12 行）
- `setupTests.ts`（新建，1 行）
- `package.json`（添加测试脚本）
- `data/era_assets/*`（30+ 图片文件 + 5 BGM 文件）
- `data/era_assets/index.html`（新建，95 行）
- `models/eraTheme.ts.backup`（已删除）

## 待办事项

- [ ] 为工具函数（`utils/`）编写单元测试
- [ ] 为核心 workflow hooks 编写单元测试
- [ ] 配置 CI 在 PR 时运行 Vitest
- [ ] 为 AI 文本生成管道添加集成测试
- [ ] 为关键用户流（新建游戏、故事推进、存档/读档）添加 E2E 测试

## 备注

- 构建时来自时代资源的大 chunk size 警告是预期的，不会阻塞构建。
- Vitest 已安装但尚未编写测试文件 — 项目当前测试覆盖率为 0%。
