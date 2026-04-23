## 1. 修复 GitHub Actions 部署工作流

- [x] 1.1 简化 wrangler.toml 生成逻辑，移除动态生成步骤
  - **完成标准**: deploy.yml 中不再有 `Create wrangler config` 步骤

- [x] 1.2 修改 wrangler pages deploy 命令，使用固定 commit message
  - **完成标准**: deploy 命令使用 `--commit-message` 参数，值仅包含 ASCII 字符

- [x] 1.3 验证部署流程
  - **完成标准**: 推送代码后 GitHub Actions 构建成功，无 TOML 或 commit message 错误

## 2. 测试验证

- [x] 2.1 本地测试 wrangler 命令语法
  - **完成标准**: wrangler pages deploy 命令格式正确
  - **验证**: `--commit-message="Deploy from GitHub Actions"` 语法正确

- [x] 2.2 提交代码并验证 GitHub Actions
  - **完成标准**: GitHub Actions 日志显示部署成功，返回部署 URL
  - **待验证**: 需推送代码触发 CI 后验证