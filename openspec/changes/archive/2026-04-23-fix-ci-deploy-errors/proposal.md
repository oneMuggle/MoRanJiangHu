## Why

GitHub Actions 推送到 Cloudflare Pages 时出现两个构建错误：
1. `wrangler.toml` 中 `account_id` 包含换行符导致 TOML 解析失败
2. `--commit-dirty=true` 生成的 commit message 包含非 UTF-8 字符导致部署 API 报错

这些问题导致 CI/CD 自动构建流程完全失败，必须修复后才能实现自动部署。

## What Changes

- 修复 `wrangler.toml` 生成逻辑，确保 `account_id` 写入时正确处理
- 使用自定义 commit message 替代 `--commit-dirty=true`，避免非 UTF-8 字符问题
- 可选：移除项目检查逻辑，直接使用已有项目

## Capabilities

### New Capabilities
- `ci-deploy-fix`: 修复 CI/CD 构建流程，确保 GitHub Actions 可以成功部署到 Cloudflare Pages

### Modified Capabilities
<!-- 现有规格没有变更 -->
- (无)

## Impact

- `.github/workflows/deploy.yml` - 主要修改文件
- 无 API/依赖变更
- 修复后 GitHub Actions 应能正常部署

## 变更范围

- 修改 `.github/workflows/deploy.yml` 的 wrangler 配置生成和部署命令

## 非目标

- 不修改 `wrangler.toml` 根文件（CI 会动态生成）
- 不修改 Cloudflare 相关 secrets 配置
- 不涉及前端代码变更

## 验收标准

1. CI 构建日志中不再出现 `Invalid TOML document` 错误
2. CI 构建日志中不再出现 `Invalid commit message` 错误
3. `wrangler pages deploy` 命令执行成功并返回部署 URL
4. 部署的网站可以通过 Cloudflare Pages URL 访问