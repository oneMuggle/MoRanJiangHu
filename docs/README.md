# 文档索引

> 墨色江湖：无尽武林 — 文档中心

## 用户文档

- [用户手册](./user-manual/user-manual.md) — 完整用户指南

## 技术文档

- [架构总览](./technical/architecture.md) — 应用结构、状态管理、数据持久化、AI 供应商抽象
- [状态管理](./technical/state-management.md) — useGame hook、子工作流、数据流
- [提示词系统](./technical/prompt-system.md) — 六层提示词工程体系（~160 文件）
- [服务层](./technical/services.md) — AI 调用、数据库、云同步、小说分解
- [组件](./technical/components.md) — 22 个功能模块、布局、懒加载

## 规划与设计文档

### 已完成
- [Phase 0: Vitest + 错误边界 + 时代素材](./plans/phase-0-vitest-error-boundary.md) — 基础设施搭建
- [22 细分时代主题树状结构](./plans/era-theme-tree-structure.md) — Epoch/Era/SubEra 重构
- [storyResponseParser 嵌套函数提取](./plans/nested-function-refactor.md) — 消除重复嵌套函数
- [Cloudflare R2 + CDN 资源管理](./plans/cloudflare-r2-cdn.md) — 多级资源加载链
- [搜索过滤新游戏向导](./plans/search-filter-new-game-wizard.md) — 向导 UX 改进

### 进行中 / 未完成
- [ ] [角色锚定与词组转化器](./plans/character-anchor-plan.md) — 2026-03-16 起进行中
- [ ] [同人模式提示词系统](./plans/fandom-mode-prompt-plan.md) — 进行中
- [ ] [小说分解功能](./plans/novel-decomposition-feature-plan.md) — 进行中
- [ ] [小说分解任务进度](./plans/novel-decomposition-feature-progress.md) — 进行中
- [ ] [PNG 提示词重构](./plans/png-prompt-refactor-plan.md) — 进行中
- [ ] [PNG 风格导入方案](./plans/png-style-import-plan.md) — 设计稿
- [ ] 提取后的解析函数单元测试（见 nested-function-refactor.md）
- [ ] 时代树继承逻辑测试（见 era-theme-tree-structure.md）
- [ ] R2 部署手册与监控（见 cloudflare-r2-cdn.md）
- [ ] 核心用户流 E2E 测试（见 phase-0-vitest-error-boundary.md）

## 相关文档

- [README](../README.md) — 项目概述和快速开始
- [CLAUDE.md](../CLAUDE.md) — Claude Code 开发指南
- [AGENTS.md](../AGENTS.md) — Agent 项目摘要
- [贡献指南](../CONTRIBUTING.md) — 贡献规范
- [行为准则](../CODE_OF_CONDUCT.md) — 社区标准
- [安全策略](../SECURITY.md) — 安全报告

## 历史文档

- `docs/user-manual.md` — 用户手册旧位置（已移至 user-manual/）
- `docs/时代主题设计方案设计文档` — 时代主题树中文设计文档（799 行）
- `docs/cloudflare-r2-cdn-resource-plan.md` — R2 原始设计文档（421 行）
