## Context

当前 GitHub Actions 部署到 Cloudflare Pages 的工作流 (`.github/workflows/deploy.yml`) 存在两个问题：

### 问题 1: TOML 解析错误
工作流中动态生成 `wrangler.toml`：
```bash
echo "account_id = \"$CLOUDFLARE_ACCOUNT_ID\"" >> wrangler.toml
```
当 `CLOUDFLARE_ACCOUNT_ID` secret 包含特殊字符或空格时，会导致 `Invalid TOML document: newlines are not allowed in strings` 错误。

### 问题 2: Commit Message 编码错误
使用 `npx wrangler pages deploy dist --project-name=wuxia-game --commit-dirty=true` 时，wrangler 会生成包含 git diff 的 commit message。如果 diff 中有非 UTF-8 字符，Cloudflare API 会拒绝请求。

## Goals / Non-Goals

**Goals:**
- 修复 `wrangler.toml` 动态生成逻辑，确保 account_id 正确写入
- 修复 commit message 问题，避免非 UTF-8 字符导致的部署失败
- 确保 CI/CD 自动构建流程可以正常运行

**Non-Goals:**
- 不修改本地 `wrangler.toml` 根文件（CI 会动态生成）
- 不涉及前端功能变更
- 不修改 Cloudflare 项目配置

## Decisions

### Decision 1: 简化 wrangler.toml 生成

**选择**: 直接在 wrangler.toml 中配置必要字段，不依赖环境变量生成

**原因**: wrangler 4.x 支持 `pages_build_output_dir` 字段，可以直接配置静态站点部署

**替代方案考虑**:
- 方案 A (当前): 动态生成 wrangler.toml，依赖 shell 脚本
- 方案 B (采用): 直接在 `.github/workflows/deploy.yml` 中使用 wrangler pages deploy 命令，不生成 wrangler.toml

**实现**:
```yaml
- name: Deploy to Cloudflare Pages
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
  run: |
    npx wrangler pages deploy dist \
      --project-name=wuxia-game \
      --branch=main \
      --commit-message="Deploy from GitHub Actions"
```

### Decision 2: 使用固定 commit message

**选择**: 使用固定的、纯 ASCII 的 commit message

**原因**: 避免 git diff 生成的动态内容包含非 UTF-8 字符

**实现**:
```bash
npx wrangler pages deploy dist \
  --project-name=wuxia-game \
  --branch=main \
  --commit-message="Deploy from GitHub Actions: $(date +%Y-%m-%d_%H:%M:%S)"
```

## 技术方案

### 当前 deploy.yml 结构
```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
```

### 修改方案

1. **移除 wrangler.toml 生成步骤**: 不再需要动态生成配置文件
2. **简化部署命令**: 直接使用 wrangler pages deploy
3. **使用固定 commit message**: 避免非 UTF-8 字符问题
4. **保持项目创建逻辑**: 仅首次部署需要创建项目（可选，如果项目已存在则跳过）

## 影响评估

### 功能影响
- 修复后 GitHub Actions 可以正常自动部署
- 部署状态可以在 GitHub Actions 日志中查看

### 兼容性影响
- 无 API 变更
- 无前端代码变更
- 对现有 Cloudflare Pages 项目配置无影响

### 性能影响
- 无性能影响
- 构建时间保持不变

## 风险 / Trade-offs

### Risk 1: Cloudflare API 配额限制
**风险**: 频繁部署可能导致 API 速率限制
**缓解**: 使用 `--commit-message` 参数，避免每次生成新的 commit

### Risk 2: 项目不存在
**风险**: 如果 Cloudflare Pages 项目被删除，首次部署可能失败
**缓解**: 可选保留项目检查逻辑，或在首次手动创建项目

### Trade-off
- 简化部署流程 vs 保留灵活性
- 固定 commit message vs 自动检测变更
- 采用固定 commit message 简化了流程，且足够满足自动部署需求

## Open Questions

1. Q: 是否需要保留项目检查逻辑？
   A: 可选。如果确认项目已存在，可以移除检查步骤简化流程。

2. Q: commit message 是否需要包含变更信息？
   A: 可选。使用时间戳作为唯一标识足以满足需求。