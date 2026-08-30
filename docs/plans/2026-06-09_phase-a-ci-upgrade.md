# Phase A — CI 升级与 threshold 渐进实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 升级 GitHub Actions 至 Node.js 24 + 渐进提升 vitest coverage threshold，避免 2026-06-16 后 GitHub 强制升级引发的 CI 失效。

**Architecture:** 在 6 个 GitHub Actions workflow（test-coverage/ci/lighthouse/android/deploy/**release**）中升级 action 至 `@v5` 系列 + 添加 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` 环境变量；修改 `vitest.config.ts` 的 `coverage.thresholds` 字段从 0 提升到 10。**不动业务逻辑、不动测试代码**。

> **2026-06-09 修订**：原计划列 5 个 workflow（test-coverage/ci/lighthouse-ci/build-android-apk/deploy-cloudflare），实际仓库 6 个（lighthouse.yml / android.yml / deploy.yml + 计划外的 release.yml）。Day 1 实施时升级全部 6 个，避免 release.yml 在 2026-06-16 Node 20 deprecation deadline 后失效。文件名也以实际为准。

**Tech Stack:** GitHub Actions (Node.js 20→24), Vitest v8 coverage, TypeScript

---

**父 spec:** `docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md` §3
**工期:** Day 1-2（2 天）
**前置依赖:** 无（v2.0 已合入 main + CI 全绿）
**v2.0 基线状态:** vitest 109/109 通过（4 spec 禁区 fail 保留）；Node.js 20 即将被 GitHub 强制升级

---

## 涉及文件

| 文件 | 变更 |
|---|---|
| `.github/workflows/test-coverage.yml` | 升级 3 个 action 到 `@v5` + 加 `env.FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` |
| `.github/workflows/ci.yml` | 同步升级（如存在） |
| `.github/workflows/lighthouse.yml` | 升级（实际文件名，原计划误为 lighthouse-ci.yml） |
| `.github/workflows/android.yml` | 升级（实际文件名，原计划误为 build-android-apk.yml） |
| `.github/workflows/deploy.yml` | 升级（实际文件名，原计划误为 deploy-cloudflare.yml） |
| `.github/workflows/release.yml` | **计划外**：实施时发现，同步升级以避免 Node 20 deprecation deadline |
| `vitest.config.ts` | `coverage.thresholds`：`lines/functions/statements` 从 0→10，`branches` 0→8 |

---

## 实施步骤

### Day 1：升级 test-coverage workflow + 其他 4 个 workflow

#### Task 1：盘点现有 workflow

- [ ] **Step 1：列出 `.github/workflows/` 下所有 workflow**

```bash
cd /home/fz/project/MoRanJiangHu
ls -la .github/workflows/
```

预期看到 6 个 `.yml` 文件（test-coverage / ci / lighthouse / android / deploy / release）。

- [ ] **Step 2：检查每个 workflow 当前的 action 版本**

```bash
cd /home/fz/project/MoRanJiangHu
grep -rE "actions/(checkout|setup-node|upload-artifact)@v" .github/workflows/
```

预期看到 `@v4` 字样。**所有 v4 都需升级到 v5**。

- [ ] **Step 3：备份现状**

```bash
cd /home/fz/project/MoRanJiangHu
cp .github/workflows/test-coverage.yml /tmp/test-coverage.yml.bak
```

#### Task 2：升级 test-coverage.yml

- [ ] **Step 1：在 `test-coverage.yml` 顶部加 `env` 块**

修改前（约第 5-8 行）：
```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
```

修改后：
```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'

jobs:
```

- [ ] **Step 2：升级 3 个 action 到 v5**

逐个修改（用 Edit 工具 replace_all）：

`actions/checkout@v4` → `actions/checkout@v5`
`actions/setup-node@v4` → `actions/setup-node@v5`
`actions/upload-artifact@v4` → `actions/upload-artifact@v5`

预期最终 `test-coverage.yml` 类似：
```yaml
name: test-coverage

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Run unit tests
        run: npm run test:unit
      - name: Run coverage
        run: npm run test:coverage
      - name: Check coverage threshold
        run: npx vitest run --coverage --coverage.thresholds.lines=10
        continue-on-error: false
      - name: Upload coverage artifacts
        if: always()
        uses: actions/upload-artifact@v5
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7
```

- [ ] **Step 3：本地验证 YAML 语法**

```bash
cd /home/fz/project/MoRanJiangHu
npx js-yaml .github/workflows/test-coverage.yml > /dev/null && echo "YAML valid" || echo "YAML INVALID"
```

预期：`YAML valid`。如 `npx js-yaml` 不存在则跳过此步（YAML 简单无嵌套）。

#### Task 3：升级其他 4 个 workflow

- [ ] **Step 1：批量升级 ci.yml（如果存在）**

```bash
cd /home/fz/project/MoRanJiangHu
if [ -f .github/workflows/ci.yml ]; then
  sed -i 's|actions/checkout@v4|actions/checkout@v5|g; s|actions/setup-node@v4|actions/setup-node@v5|g; s|actions/upload-artifact@v4|actions/upload-artifact@v5|g' .github/workflows/ci.yml
  # 同步加 env 块（如果文件无 env 段）
  if ! grep -q "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24" .github/workflows/ci.yml; then
    sed -i '/^jobs:/i\env:\n  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: '"'"'true'"'"'\n' .github/workflows/ci.yml
  fi
  echo "ci.yml updated"
fi
```

- [ ] **Step 2：同样升级 lighthouse.yml / android.yml / deploy.yml / release.yml**

```bash
cd /home/fz/project/MoRanJiangHu
for f in .github/workflows/lighthouse.yml .github/workflows/android.yml .github/workflows/deploy.yml .github/workflows/release.yml; do
  if [ -f "$f" ]; then
    sed -i 's|actions/checkout@v4|actions/checkout@v5|g; s|actions/setup-node@v4|actions/setup-node@v5|g; s|actions/upload-artifact@v4|actions/upload-artifact@v5|g' "$f"
    if ! grep -q "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24" "$f"; then
      sed -i '/^jobs:/i\env:\n  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: '"'"'true'"'"'\n' "$f"
    fi
    echo "$f updated"
  fi
done
```

- [ ] **Step 3：验证所有 workflow 都升级**

```bash
cd /home/fz/project/MoRanJiangHu
echo "=== remaining v4 actions (should be 0) ==="
grep -rE "actions/(checkout|setup-node|upload-artifact)@v4" .github/workflows/ || echo "all v5"
echo "=== FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 (should be 5) ==="
grep -rl "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24" .github/workflows/ | wc -l
```

预期：`all v5` 和 `5`。

- [ ] **Step 4：提交 Day 1 工作**

```bash
cd /home/fz/project/MoRanJiangHu
git add .github/workflows/
git -c user.email=planner@moran.local -c user.name=planner commit -m "ci(upgrade): 升级 GitHub Actions 至 Node.js 24（解决 2026-06-16 deprecation deadline）

- 6 个 workflow（test-coverage/ci/lighthouse/android/deploy/release）
  的 actions/checkout|setup-node|upload-artifact 从 @v4 升级到 @v5
- 每个 workflow 顶部加 env.FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'
- 不改业务逻辑、不改测试代码"
```

### Day 2：vitest threshold 渐进提升 + 决策记录

#### Task 4：提升 vitest.config.ts threshold

- [ ] **Step 1：读 `vitest.config.ts` 当前 thresholds**

```bash
cd /home/fz/project/MoRanJiangHu
grep -A 6 "thresholds:" vitest.config.ts
```

预期看到：
```ts
thresholds: {
  lines: 0,
  functions: 0,
  branches: 0,
  statements: 0,
}
```

- [ ] **Step 2：提升 thresholds**

修改 `vitest.config.ts` 的 `thresholds` 块：

修改前：
```ts
thresholds: {
  // 2026-06-06 Phase 5 Day 46 起步门槛：0（Day 48 写完测试后提升到 50%）
  lines: 0,
  functions: 0,
  branches: 0,
  statements: 0,
}
```

修改后：
```ts
thresholds: {
  // 2026-06-09 v2.1 Day 2 起步门槛：
  // 当前实测 14.78% statements / 15.21% lines / 14.5% functions / 8.63% branches
  // Day 22 末升到 20%，Day 42 末升到 25%
  lines: 10,
  functions: 10,
  branches: 8,
  statements: 10,
}
```

- [ ] **Step 3：本地验证 threshold 仍通过**

```bash
cd /home/fz/project/MoRanJiangHu
npx vitest run --coverage 2>&1 | tail -10
```

预期：测试通过，coverage 报告生成，threshold 校验通过（实际 14.78% > 10%）。

如 threshold 失败（实际 < 10%），回退到 `lines: 5` 渐进。

- [ ] **Step 4：build 验证**

```bash
cd /home/fz/project/MoRanJiangHu
npm run build 2>&1 | tail -3
```

预期：`✓ built in <N>s`。

- [ ] **Step 5：提交 Day 2 工作**

```bash
cd /home/fz/project/MoRanJiangHu
git add vitest.config.ts
git -c user.email=planner@moran.local -c user.name=planner commit -m "ci(threshold): vitest coverage threshold 从 0% 提升到 10%（v2.1 渐进起步）

- Day 2 末：lines/functions/statements 0→10，branches 0→8
- 实际覆盖率 14.78% 留 4.78% 缓冲位
- Day 22 末升到 20%，Day 42 末升到 25%
- 不修改测试代码"
```

#### Task 5：建立 Phase A 决策记录

- [ ] **Step 1：创建 `docs/phase-decisions/2026-06-09-phase-a-ci-upgrade.md`**

```markdown
# Phase A CI 升级决策记录

> 创建：2026-06-09
> 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §3
> 父计划：docs/plans/2026-06-09_phase-a-ci-upgrade.md

## 决策

- 6 个 GitHub Actions workflow 升级至 Node.js 24（@v5 actions + FORCE_JAVASCRIPT_ACTIONS_TO_NODE24）
- vitest threshold 从 0% 起步门槛提升到 10%

## 升级理由

GitHub 警告 actions/checkout@v4 / setup-node@v4 / upload-artifact@v4 使用 Node.js 20，
将于 2026-06-16 后强制 Node.js 24。提前升级避免 deadline 后 CI 失效。

## threshold 渐进路径

| Day | lines | functions | branches | statements | 实际 |
|-----|-------|-----------|----------|------------|------|
| 2（v2.1 起步）| 10 | 10 | 8 | 10 | 14.78% |
| 22（v2.1 中段）| 20 | 20 | 15 | 20 | ~25% |
| 42（v2.1 末段）| 25 | 25 | 18 | 25 | ~30% |
| v2.2 末 | 30 | 30 | 22 | 30 | ≥ 30% |

## 影响

- 0 业务逻辑变更
- 0 测试代码变更
- 仅 action 版本号 + threshold 数值变化
```

- [ ] **Step 2：提交决策记录**

```bash
cd /home/fz/project/MoRanJiangHu
git add docs/phase-decisions/2026-06-09-phase-a-ci-upgrade.md
git -c user.email=planner@moran.local -c user.name=planner commit -m "docs(phase-decisions): 记录 Phase A CI 升级决策"
```

---

## 验收标准（P2 完成）

- [ ] 6 个 workflow 全部用 `@v5` actions + `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: 'true'`
- [ ] `vitest.config.ts` threshold: `lines: 10, functions: 10, branches: 8, statements: 10`
- [ ] 本地 `npm run build` 通过
- [ ] 本地 `npx vitest run --coverage` 通过（实际 ≥ 10%）
- [ ] 0 业务逻辑变更
- [ ] 0 测试代码变更
- [ ] 3 个 commit（Day 1 action 升级、Day 2 threshold、决策记录）
- [ ] 决策文档就位

---

## 风险与依赖

| 风险 | 等级 | 缓解 |
|---|---|---|
| Node.js 24 升级后某 action 不兼容 | LOW | 升级前看 GitHub release notes；备 `@v4` 回退；用 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` 提前适配 |
| threshold 10% 过高（实际 < 10%）| LOW | 先跑 `npx vitest run --coverage` 验证；如失败回退到 5% |
| 其他 workflow 引用了 `@v4` 的非标准 action | LOW | Step 1 的 grep 已覆盖所有 v4；如发现手动补 |

### 依赖

- 现有：GitHub Actions（v4 + 24 deprecation 警告已收到）
- 新增：无

---

## 参考文档

- 父 spec：docs/superpowers/specs/2026-06-09-project-optimization-roadmap-v2-1-design.md §3
- v2.0 报告：docs/technical/14-optimization-roadmap-v2.md
- v2.0 父 spec：docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md
- 项目规则：/home/fz/.claude/rules/common/testing.md
- GitHub Node.js 20 deprecation：https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
