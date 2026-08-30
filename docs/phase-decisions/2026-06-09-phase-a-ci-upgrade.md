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

## 实际升级 6 个 workflow

原计划列 5 个，实施时发现 6 个（多了 release.yml）：

| # | 文件 | 计划列 | 实施时 |
|---|------|--------|--------|
| 1 | test-coverage.yml | ✓ | ✓ |
| 2 | ci.yml | ✓ | ✓ |
| 3 | lighthouse.yml | ✗ (计划误为 lighthouse-ci.yml) | ✓ |
| 4 | android.yml | ✗ (计划误为 build-android-apk.yml) | ✓ |
| 5 | deploy.yml | ✗ (计划误为 deploy-cloudflare.yml) | ✓ |
| 6 | release.yml | ✗ (计划外) | ✓ |

理由：release.yml 也用 @v4 actions，统一升级避免 2026-06-16 deadline 留下死角。

## 未升级的 action（spec 范围外）

- `actions/setup-java@v4` (android.yml)
- `actions/upload-release-asset@v1` (release.yml，已 archive)

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
