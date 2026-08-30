# Phase C — Phase 1 文档归一化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 51 个 `docs/plans/*.md` → 0（迁移或删除），新增 `docs/technical/16-*.md` ~ `19-*.md` 系列合并章节，更新 README。

**Architecture:** 按主题聚类（NSFW 9+ 个 / contemporary 10+ 个 / 性能 5+ 个 / 关系规划 8+ 个 / 游戏机制 10+ 个）合并到 `docs/technical/` 系列章节。备份原文到 `/tmp/legacy-plans/` 防丢失。删除已迁移 + 过期 plan。更新 README 章节目录。

**Tech Stack:** git mv/rm, 文档合并（保留原始 commit SHA 引用）

---

**父 spec:** `docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md` §6
**工期:** Day 23-27（5 天）
**前置依赖:** Phase A + B（CI + 覆盖率，不强制依赖）
**当前状态:** docs/plans/ 共 51 个文件（v2.0 期间从 48 增到 51）

---

## 涉及文件

### 新建（按主题合并）

| 文件 | 来源 | 内容 |
|---|---|---|
| `docs/technical/16-nsfw-systems.md` | `2026-05-06-modern-era-nsfw-modules.md` + `2026-05-20-*-nsfw-*.md`（~12 个）+ `2026-05-21-nsfw-enhancement-phase2.md` + `2026-05-22_nsfw-enhancement-plan.md` + `2026-05-23_nsfw深化方案.md` + `2026-05-24_nsfw_harem_system.md` + `2026-06-03-nsfw-*.md`（4 个）+ `2026-05-05-16-bdsm-system-complete.md` | NSFW 子系统总览 |
| `docs/technical/17-contemporary-modules.md` | `2026-04-01_mobile-ui-optimization.md` + `2026-05-03-09-campus-modern-era-enhancement.md` + `2026-05-17-modern-era-talent-background-qiyun-optimization.md` + `2026-05-20-bar-nsfw-module.md`（注：bar 属 contemporary）+ `2026-05-22_visual-galgame-enhancement.md` + `2026-05-05_开局环境剧情预设.md` | 现代纪元 UI/剧情/角色/酒吧/视觉 |
| `docs/technical/13c-performance-extra.md` | `2026-05-04_performance-monitoring.md` + `2026-05-23_memory_summary_background_refactor.md` | 性能监控 + 记忆后台重构（增量） |
| `docs/technical/18-planning-systems.md` | `2026-04-27_novel-writing-assistant.md` + `2026-04-28_memory-search.md` + `2026-04-28_prompt-engine-upgrade.md` + `2026-05-10-interaction-model-optimization.md` + `2026-05-21_variable-generation-record-enhancement.md` + `2026-05-18-rpg-sect-integration.md` + `2026-05-14-exploration-fix-plan.md` | 写作助手/记忆/提示词引擎/交互/变量/门派/探索 |
| `docs/technical/19-game-systems.md` | `2026-05-03_rule-system-modern-urban-integration.md` + `2026-05-03_story-slots-framework.md` + `2026-05-04_asset-resource-detailed-requirements.md` + `2026-05-05_api-config-assistant-ux-improvement.md` + `2026-05-05_forum-refresh-backend-queue.md` + `2026-05-10_llm_debug_mode.md` + `2026-05-18-property-slg-expansion.md` | 规则/故事槽位/资产/API 助手/论坛/LLM debug/物业 SLG |
| `docs/technical/20-prompt-architecture.md`（如需） | `story-planning-novel-decomposition.md` + `architecture-refactor-plans.md` | 提示词架构/规划 |

### 删除（已迁移 + 过期 plan）

约 50 个迁移完成 + 0-3 个保留（如有 v2.0 仍引用的）：
- v2.0 期间所有 plan（`2026-04-*.md` ~ `2026-06-06_*.md` 中除了 `2026-06-03-project-optimization.md` 仍引用的）

### 修改文件

| 文件 | 变更 |
|---|---|
| `docs/technical/README.md` | 新增 16-20 章节条目，删除 plans-archive 引用 |
| `docs/technical/14-optimization-roadmap-v2.md` §7 | 标注 v2.1 Phase 1 已完成 |

### 保留文件

| 文件 | 原因 |
|---|---|
| `2026-06-03-project-optimization.md` | v2.0 仍引用 |
| `architecture-refactor-plans.md` | 如有活跃引用 |
| `modern-era-module-management.md` / `photography-system-plans.md` / `relationship-system-plans.md` / `slg-system-plans.md` / `sub-era-ui-audit-plan.md` / `story-planning-novel-decomposition.md` | 单文件聚合，可选择性保留 |

---

## 实施步骤

### Day 23：盘点与备份

#### Task 1：盘点所有 plan 文件

- [ ] **Step 1：列出所有 plan 文件（含大小）**

```bash
cd /home/fz/project/MoRanJiangHu
ls -la docs/plans/ | head -60
echo "---total---"
ls docs/plans/ | wc -l
```

预期：~51 个文件。

- [ ] **Step 2：按主题分类**

```bash
cd /home/fz/project/MoRanJiangHu
echo "=== NSFW 系列 ==="
ls docs/plans/2026-05-06-modern-era-nsfw-modules.md docs/plans/2026-05-20-nsfw-*.md docs/plans/2026-05-21-nsfw-enhancement-phase2.md docs/plans/2026-05-22_nsfw-*.md docs/plans/2026-05-23_nsfw-*.md docs/plans/2026-05-24_nsfw_*.md docs/plans/2026-06-03-nsfw-*.md docs/plans/2026-05-05-16-bdsm-system-complete.md 2>/dev/null

echo "=== contemporary 系列 ==="
ls docs/plans/2026-04-01_mobile-ui-optimization.md docs/plans/2026-05-03-09-campus-modern-era-enhancement.md docs/plans/2026-05-17-modern-era-talent-background-qiyun-optimization.md docs/plans/2026-05-20-bar-nsfw-module.md docs/plans/2026-05-22_visual-galgame-enhancement.md docs/plans/2026-05-05_开局环境剧情预设.md 2>/dev/null

echo "=== 规划/写作系列 ==="
ls docs/plans/2026-04-27_novel-writing-assistant.md docs/plans/2026-04-28_*.md docs/plans/2026-05-10_*.md docs/plans/2026-05-18-rpg-sect-integration.md docs/plans/2026-05-14-exploration-fix-plan.md 2>/dev/null

echo "=== 游戏机制 ==="
ls docs/plans/2026-05-03_rule-system-modern-urban-integration.md docs/plans/2026-05-03_story-slots-framework.md docs/plans/2026-05-04_asset-resource-detailed-requirements.md docs/plans/2026-05-05_api-config-assistant-ux-improvement.md docs/plans/2026-05-05_forum-refresh-backend-queue.md docs/plans/2026-05-10_llm_debug_mode.md docs/plans/2026-05-18-property-slg-expansion.md 2>/dev/null
```

- [ ] **Step 3：备份到 /tmp/legacy-plans/**

```bash
mkdir -p /tmp/legacy-plans
cp -r /home/fz/project/MoRanJiangHu/docs/plans/* /tmp/legacy-plans/
ls /tmp/legacy-plans/ | wc -l
```

预期：~51 个备份文件。

#### Task 2：建立决策记录

- [ ] **Step 1：创建 `docs/phase-decisions/2026-06-09-phase-c-docs-normalize.md`**

```markdown
# Phase C 文档归一化决策记录

> 创建：2026-06-09
> 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §6
> 父计划：docs/plans/2026-06-09_phase-c-docs-normalize.md

## 决策

51 个 docs/plans/*.md 全部迁移到 docs/technical/ 系列合并章节。

## 主题分类

| 主题 | 源 plan 数 | 目标章节 |
|------|------------|----------|
| NSFW 子系统 | 12+ | 16-nsfw-systems.md |
| Contemporary 模块 | 7+ | 17-contemporary-modules.md |
| 性能/记忆 | 2+ | 13c-performance-extra.md |
| 规划/写作 | 7+ | 18-planning-systems.md |
| 游戏机制 | 7+ | 19-game-systems.md |
| 提示词架构 | 2+ | 20-prompt-architecture.md（如需） |

## 保留文件

（v2.0 仍引用的不删）
- 2026-06-03-project-optimization.md（v2.0 spec 引用）
- 其他单文件聚合类（architecture-refactor-plans.md 等）
```

- [ ] **Step 2：commit 决策记录**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/phase-decisions/2026-06-09-phase-c-docs-normalize.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(phase-decisions): Phase C 文档归一化清单"
```

### Day 24-25：迁移（git mv）

#### Task 3：迁移 NSFW 系列 → 16-nsfw-systems.md

- [ ] **Step 1：合并 NSFW plan 内容到 `docs/technical/16-nsfw-systems.md`**

```bash
cd /home/fz/project/MoRanJiangHu
# 1. 创建一个空的合并目标
cat > docs/technical/16-nsfw-systems.md << 'EOF'
# 16 - NSFW 子系统总览

> 合并来源：v2.0 期间 docs/plans/ 12+ 个 NSFW 计划文档
> 创建：2026-06-09 v2.1 Phase C

## 1. 概述

NSFW（Not Safe For Work）子系统覆盖现代纪元及部分跨纪元的成人向剧情与交互逻辑。
本章节由 v2.0 期间 12+ 个分散的 plan 文档合并而成。

## 2. 模块清单

### 2.1 基础子系统
$(cat docs/plans/2026-05-06-modern-era-nsfw-modules.md | head -100)

### 2.2 增强与扩展
$(cat docs/plans/2026-05-21-nsfw-enhancement-phase2.md | head -100)

### 2.3 跨模块链接
$(cat docs/plans/2026-05-20-nsfw-cross-module-linker.md | head -100)

### 2.4 视觉与叙事质量
$(cat docs/plans/2026-05-20-nsfw-visual-ui-enhancement.md | head -100)
$(cat docs/plans/2026-05-20-nsfw-narrative-quality-upgrade.md | head -100)

### 2.5 后果记忆与后宫系统
$(cat docs/plans/2026-05-20-nsfw-consequences-memory.md | head -100)
$(cat docs/plans/2026-05-24_nsfw_harem_system.md | head -100)

### 2.6 深化方案
$(cat docs/plans/2026-05-22_nsfw-enhancement-plan.md | head -100)
$(cat docs/plans/2026-05-23_nsfw深化方案.md | head -100)

### 2.7 玩法深化
$(cat docs/plans/2026-06-03-nsfw-gameplay-deepening.md | head -100)

### 2.8 子模块 D/E
$(cat docs/plans/2026-06-03-nsfw-module-d-exploration.md | head -100)
$(cat docs/plans/2026-06-03-nsfw-module-e-autonomy.md | head -100)
$(cat docs/plans/2026-06-03-nsfw-optimization.md | head -100)

### 2.9 BDSM
$(cat docs/plans/2026-05-05-16-bdsm-system-complete.md | head -100)

EOF
```

> **注**：实际合并时由 subagent 读每个 plan 完整内容，按主题重新组织（不简单 concat），保留原 commit SHA 引用。

- [ ] **Step 2：commit NSFW 合并**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/technical/16-nsfw-systems.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(technical): 合并 NSFW 系列 plan 到 16-nsfw-systems.md"
```

#### Task 4-7：同样合并其他系列

- [ ] **Task 4：contemporary → 17-contemporary-modules.md**
- [ ] **Task 5：性能 → 13c-performance-extra.md**
- [ ] **Task 6：规划/写作 → 18-planning-systems.md**
- [ ] **Task 7：游戏机制 → 19-game-systems.md**

每个按 Task 3 模式：
1. 读源 plan 完整内容
2. 按主题重新组织到合并章节（不简单 concat）
3. 保留原 commit SHA 引用
4. 单文件 commit

### Day 26：删除已迁移 + 过期 plan

#### Task 8：批量 git rm 已迁移的 plan

- [ ] **Step 1：git rm 已合并的 NSFW plans**

```bash
cd /home/fz/project/MoRanJiangHu
git rm docs/plans/2026-05-06-modern-era-nsfw-modules.md
git rm docs/plans/2026-05-20-nsfw-*.md
git rm docs/plans/2026-05-21-nsfw-enhancement-phase2.md
git rm docs/plans/2026-05-22_nsfw-*.md
git rm docs/plans/2026-05-23_nsfw深化方案.md
git rm docs/plans/2026-05-24_nsfw_harem_system.md
git rm docs/plans/2026-06-03-nsfw-*.md
git rm docs/plans/2026-05-05-16-bdsm-system-complete.md
```

- [ ] **Step 2：git rm 已合并的其他 series**

```bash
cd /home/fz/project/MoRanJiangHu
# contemporary
git rm docs/plans/2026-04-01_mobile-ui-optimization.md
git rm docs/plans/2026-05-03-09-campus-modern-era-enhancement.md
git rm docs/plans/2026-05-17-modern-era-talent-background-qiyun-optimization.md
git rm docs/plans/2026-05-20-bar-nsfw-module.md
git rm docs/plans/2026-05-22_visual-galgame-enhancement.md
git rm docs/plans/2026-05-05_开局环境剧情预设.md

# 性能
git rm docs/plans/2026-05-04_performance-monitoring.md
git rm docs/plans/2026-05-23_memory_summary_background_refactor.md

# 规划/写作
git rm docs/plans/2026-04-27_novel-writing-assistant.md
git rm docs/plans/2026-04-28_memory-search.md
git rm docs/plans/2026-04-28_prompt-engine-upgrade.md
git rm docs/plans/2026-05-10-interaction-model-optimization.md
git rm docs/plans/2026-05-21_variable-generation-record-enhancement.md
git rm docs/plans/2026-05-18-rpg-sect-integration.md
git rm docs/plans/2026-05-14-exploration-fix-plan.md

# 游戏机制
git rm docs/plans/2026-05-03_rule-system-modern-urban-integration.md
git rm docs/plans/2026-05-03_story-slots-framework.md
git rm docs/plans/2026-05-04_asset-resource-detailed-requirements.md
git rm docs/plans/2026-05-05_api-config-assistant-ux-improvement.md
git rm docs/plans/2026-05-05_forum-refresh-backend-queue.md
git rm docs/plans/2026-05-10_llm_debug_mode.md
git rm docs/plans/2026-05-18-property-slg-expansion.md
```

- [ ] **Step 3：保留文件检查**

```bash
cd /home/fz/project/MoRanJiangHu
ls docs/plans/
```

预期：仅剩 0-3 个保留文件（`2026-06-03-project-optimization.md` 等）。

- [ ] **Step 4：commit 删除**

```bash
cd /home/fz/project/MoRanJiangHu
git add -A
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(cleanup): 删除已合并到 docs/technical/ 的历史 plan（51 → N）"
```

### Day 27：更新 README + 验证

#### Task 9：更新 `docs/technical/README.md`

- [ ] **Step 1：读当前 README**

```bash
cd /home/fz/project/MoRanJiangHu
cat docs/technical/README.md
```

- [ ] **Step 2：在目录追加新章节条目**

修改 `docs/technical/README.md` 章节目录部分，添加：

```markdown
- 13c-performance-extra.md
- 14-optimization-roadmap-v2.md
- 15-optimization-roadmap-v2-1.md（v2.1 报告）
- 16-nsfw-systems.md
- 17-contemporary-modules.md
- 18-planning-systems.md
- 19-game-systems.md
- 20-prompt-architecture.md（如创建）
```

- [ ] **Step 3：更新 v2.0 报告引用**

修改 `docs/technical/14-optimization-roadmap-v2.md` §7 标注 v2.1 Phase 1 完成：

```markdown
> **2026-06-09 v2.1 Phase 1 状态**：文档归一化已完成
> - docs/plans/ 51 → 0（迁移/合并完成）
> - 新增 13c/16/17/18/19 系列章节
> - 详见 `docs/phase-decisions/2026-06-09-phase-c-docs-normalize.md`
```

- [ ] **Step 4：commit README 更新**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/technical/README.md docs/technical/14-optimization-roadmap-v2.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(technical): 更新 README 章节目录（v2.1 Phase 1 完成）"
```

#### Task 10：验证

- [ ] **Step 1：跑 tsc + build + vitest**

```bash
cd /home/fz/project/MoRanJiangHu
npx tsc --noEmit 2>&1 | tail -3
npm run build 2>&1 | tail -3
npx vitest run 2>&1 | tail -5
```

预期：TS 0 错误，build 成功，vitest 通过。

- [ ] **Step 2：commit 决策更新（如有）**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/phase-decisions/2026-06-09-phase-c-docs-normalize.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(phase-decisions): 标记 Phase C 完成"
```

---

## 验收标准

- [ ] docs/plans/ 仅剩 0-3 个保留文件（v2.0 仍引用的）
- [ ] docs/technical/ 新增 16-nsfw-systems.md / 17-contemporary-modules.md / 13c-performance-extra.md / 18-planning-systems.md / 19-game-systems.md
- [ ] docs/technical/README.md 章节目录更新
- [ ] docs/technical/14-optimization-roadmap-v2.md §7 标注 v2.1 Phase 1 完成
- [ ] TS 0 错误
- [ ] Build 成功
- [ ] vitest 通过
- [ ] 0 业务逻辑变更

---

## 风险与依赖

| 风险 | 等级 | 缓解 |
|---|---|---|
| 合并 plan 时内容丢失 | HIGH | 迁移前 backup 到 `/tmp/legacy-plans/`；保留原 commit SHA 引用 |
| 删除 plan 后 v2.0 文档有死链 | MEDIUM | grep 全文搜索 v2.0 仍引用的 plan 路径；保留必要的 |
| 合并章节太长（> 1000 行）| MEDIUM | 按主题再拆 17.1/17.2/17.3 子节 |
| 保留文件判断错误（漏删 active 文档）| MEDIUM | 迁移前 grep v2.0 spec + v2.0 报告 §7 引用 |

### 依赖

- 无（纯文档操作）

---

## 参考文档

- 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §6
- 前置：Phase A — docs/plans/2026-06-09_phase-a-ci-upgrade.md
- 前置：Phase B1 — docs/plans/2026-06-09_phase-b1-t1-pure-functions.md
- 前置：Phase B2 — docs/plans/2026-06-09_phase-b2-t2-services.md
- v2.0 报告：docs/technical/14-optimization-roadmap-v2.md
- docs/technical/02-state-modularization.md（保持现状，不参与归一化）
