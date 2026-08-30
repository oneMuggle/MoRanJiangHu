# Phase D — Phase 4 循环依赖解耦起步实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 循环依赖 26 → ≤ 20（**只拆 5-8 个高 priority 链，不追求全清零**）。优先拆 `prompts ↔ models` 链。

**Architecture:** 接续 v2.0 决策 `02d-circular-deps-decoupling.md` 的 3 种模式：命名导入改类型、提取共享类型中间层、拆分 barrel 暴露面。每拆一个循环跑 madge + vitest 验证。剩余循环推迟 v2.2。

**Tech Stack:** TypeScript `import type` 语法、shared types 中间层、barrel 拆分模式、madge `--circular`

---

**父 spec:** `docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md` §7
**工期:** Day 28-42（15 天）
**前置依赖:** Phase A + B（CI + 覆盖率，不强制依赖）
**v2.0 基线:** madge 报告 26 个循环依赖

---

## 涉及文件

**无新建文件**。仅修改 import 模式 + 提取共享类型。

### 修改文件（按循环所在位置，运行时确定）

- `prompts/runtime/*.ts`（`import type` 改 + 提取中间层）
- `models/*.ts`（提取 shared types 到 `models/types/character-shared.ts` 等）
- `hooks/useGame/*.ts`（命名导入改类型）
- `services/ai/**/*.ts`（如 hooks ↔ services 链涉及）
- `models/index.ts`（barrel 拆分：拆分暴露面）

### 决策记录

- `docs/phase-decisions/2026-06-09-phase-d-circular-deps.md`（新建）

---

## 实施步骤

### Day 28-30（3d）madge 现状审计

#### Task 1：madge 报告导出

- [ ] **Step 1：跑 madge 报告当前 26 个循环**

```bash
cd /home/fz/project/MoRanJiangHu
npx madge --circular --extensions ts,tsx . 2>&1 | tee /tmp/circular-v2-1-baseline.txt
echo "---count---"
npx madge --circular --extensions ts,tsx . 2>&1 | grep -E "^[0-9]+\)" | wc -l
```

预期：~26 个循环，输出到 `/tmp/circular-v2-1-baseline.txt`。

- [ ] **Step 2：按模式分类**

```bash
cd /home/fz/project/MoRanJiangHu
echo "=== prompts ↔ models chains ==="
grep "prompts.*models\|models.*prompts" /tmp/circular-v2-1-baseline.txt | sort -u
echo "=== hooks ↔ services chains ==="
grep "hooks.*services\|services.*hooks" /tmp/circular-v2-1-baseline.txt | sort -u
echo "=== models ↔ services chains ==="
grep "models.*services\|services.*models" /tmp/circular-v2-1-baseline.txt | sort -u
echo "=== cross-layer chains ==="
# 排除以上三类后的其他循环
```

- [ ] **Step 3：挑 5-8 个高 priority 循环**

策略：
- 优先 `prompts ↔ models`（影响最大）
- 优先改动小（仅 1-2 行改动的循环）
- 优先 runtime 路径（避免冷代码）

把选定循环清单写入决策记录。

#### Task 2：建立决策记录

- [ ] **Step 1：创建 `docs/phase-decisions/2026-06-09-phase-d-circular-deps.md`**

```markdown
# Phase D 循环依赖解耦决策记录

> 创建：2026-06-09
> 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §7
> 父计划：docs/plans/2026-06-09_phase-d-circular-deps.md

## 基线（2026-06-09）

madge 报告 26 个循环依赖。

## 高 priority 循环清单（v2.1 拆解目标）

（待 Task 1 完成后填入）

## 拆解模式（来自 v2.0 `02d-circular-deps-decoupling.md`）

### 模式 1：命名导入改类型

```ts
// 修复前
import { 角色数据结构 } from '../../models/character';
// 修复后
import type { 角色数据结构 } from '../../models/character';
```

### 模式 2：提取 shared types 中间层

```ts
// 新建 models/types/character-shared.ts
export interface 角色共享字段 {
  姓名: string;
  性别: string;
}

// prompts/runtime/character-prompts.ts
import type { 角色共享字段 } from '../../models/types/character-shared';
// 不再直接 import models/character.ts
```

### 模式 3：barrel 拆分暴露面

```ts
// models/index.ts
export * from './character-name';
export * from './character-stats';
// 不再 export * from './character'（整个）
```

## 进度追踪

| Day | 循环数 | 拆解数 | 备注 |
|-----|--------|--------|------|
| 28 | 26 | 0 | baseline |
| 42 | ≤ 20 | 5-8 | v2.1 末 |
```

- [ ] **Step 2：commit 决策记录**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/phase-decisions/2026-06-09-phase-d-circular-deps.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(phase-decisions): Phase D 循环依赖解耦清单"
```

### Day 31-37（7d）拆 prompts ↔ models 链

#### Task 3：拆第 1 个循环（5-8 模式 1 修复）

- [ ] **Step 1：选循环 + 应用模式 1**

```bash
cd /home/fz/project/MoRanJiangHu
# 查看具体循环
grep "循环1" /tmp/circular-v2-1-baseline.txt  # 用实际循环内容替换
```

- [ ] **Step 2：改 `import` 为 `import type`**

修改 `prompts/runtime/XXX.ts`：
```ts
// 修改前
import { XXX } from '../../models/YYY';
// 修改后
import type { XXX } from '../../models/YYY';
```

（如 XXX 在运行时也用到，需保留 import；本模式仅限**纯类型**使用）

- [ ] **Step 3：跑 madge 验证减少**

```bash
cd /home/fz/project/MoRanJiangHu
npx madge --circular --extensions ts,tsx . 2>&1 | wc -l
```

预期：循环数从 26 减 1。

- [ ] **Step 4：跑 tsc + vitest**

```bash
cd /home/fz/project/MoRanJiangHu
npx tsc --noEmit 2>&1 | tail -3
npx vitest run 2>&1 | tail -3
```

预期：0 错误，测试通过。

- [ ] **Step 5：commit**

```bash
cd /home/fz/project/MoRanJiangHu
git add <修改的文件>
git -c user.email=planner@moran.local -c user.name=planner commit -m "refactor(arch): 拆 <循环名> 循环依赖（模式 1: import type）"
```

#### Task 4-7：拆后续循环（每个 1 天）

按 Task 3 模式，对每个高 priority 循环：
- 评估用哪种模式（1/2/3）
- 应用修复
- 跑 madge + tsc + vitest 验证
- commit

**Day 31-32（2d）拆 prompts ↔ models 链 4-5 个**：
- 模式 1（import type）为主
- 模式 2（提取中间层）用于复杂循环

**Day 33-37（5d）拆 hooks ↔ services 链 3-4 个**：
- 模式 1 + 模式 3（barrel 拆分）
- 重点 hooks/useGame/*.test.ts 中 mock 路径修正

#### Task 8：Day 37 末测量

- [ ] **Step 1：跑 madge 测量**

```bash
cd /home/fz/project/MoRanJiangHu
npx madge --circular --extensions ts,tsx . 2>&1 | tee /tmp/circular-v2-1-mid.txt
echo "---mid count---"
npx madge --circular --extensions ts,tsx . 2>&1 | grep -E "^[0-9]+\)" | wc -l
```

预期：≤ 22 循环（Day 37 末中间值）。

- [ ] **Step 2：commit 进度更新**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/phase-decisions/2026-06-09-phase-d-circular-deps.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(phase-decisions): Phase D Day 37 进度（循环 26 → N）"
```

### Day 38-42（5d）拆剩余高优循环 + 提升 threshold 到 25% + 收口

#### Task 9-10：拆剩余循环（2-3 个）

- [ ] **Step 1-5：每个循环跑 Task 3 模式**

每个循环 ~0.5d（高 priority 循环已拆完，剩余较难）。

#### Task 11：Day 42 末 threshold 提升

- [ ] **Step 1：跑全量覆盖率**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage --exclude="**/photographyNSFW/**" 2>&1 | grep -E "All files|Statements" | head -3
```

预期：≥ 30%（Phase B 完成）。

- [ ] **Step 2：threshold 已达 25%（Phase B Day 22 末）**

如 v2.1 spec §5.4 路径：Day 22 末已升到 25%，Day 42 末**保持** 25%（不进一步升，避免覆盖率倒退）。

#### Task 12：最终验证

- [ ] **Step 1：跑 madge + tsc + vitest + build**

```bash
cd /home/fz/project/MoRanJiangHu
echo "=== final circular count ==="
npx madge --circular --extensions ts,tsx . 2>&1 | grep -E "^[0-9]+\)" | wc -l

echo "=== tsc ==="
npx tsc --noEmit 2>&1 | tail -3

echo "=== build ==="
npm run build 2>&1 | tail -3

echo "=== vitest ==="
npx vitest run 2>&1 | tail -5
```

预期：
- 循环 ≤ 20
- TS 0 错误
- build 成功
- vitest 109/116+ 通过

- [ ] **Step 2：commit 收口**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/phase-decisions/2026-06-09-phase-d-circular-deps.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(phase-decisions): Phase D 收口（循环 26 → ≤20）"
```

---

## 验收标准

- [ ] madge 报告循环数 ≤ 20（基线 26，v2.1 拆 5-8）
- [ ] 拆后 0 业务逻辑变更
- [ ] TS 0 错误
- [ ] build 成功
- [ ] vitest 通过（109/116+）
- [ ] 决策记录含完整进度表
- [ ] v2.2 优先项清单记录（剩余循环）

---

## 风险与依赖

| 风险 | 等级 | 缓解 |
|---|---|---|
| 拆循环引入新的 import 路径错误 | MEDIUM | 拆前跑 `madge --circular`；拆后跑 `vitest` 验证 |
| 模式 1 不适用（运行时需要具体值）| MEDIUM | 改用模式 2/3 |
| 模式 2 中间层命名复杂 | LOW | 用主题命名（如 `character-shared`）|
| 模式 3 barrel 拆分破坏外部 import | HIGH | 保留 `models/index.ts` re-export 全部子文件 |
| 拆跨层循环时影响 2+ 文件 | MEDIUM | 每个循环 commit 1 次，逐个推进 |

### 依赖

- 现有：madge、ts-prune（v2.0 验证）
- 新增：无

---

## 参考文档

- 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §7
- 前置：Phase A — docs/plans/2026-06-09_phase-a-ci-upgrade.md
- 前置：Phase B1 — docs/plans/2026-06-09_phase-b1-t1-pure-functions.md
- 前置：Phase B2 — docs/plans/2026-06-09_phase-b2-t2-services.md
- 前置：Phase C — docs/plans/2026-06-09_phase-c-docs-normalize.md
- v2.0 循环依赖决策：docs/technical/02d-circular-deps-decoupling.md
- 项目规则：/home/fz/.claude/rules/common/coding-style.md
