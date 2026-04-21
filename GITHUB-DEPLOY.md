# GitHub 部署流程

本文档提供将项目部署到 GitHub 的多种参考方案。

## 目录

- [方案对比](#方案对比)
- [方案一：GitHub Pages + Cloudflare Functions](#方案一github-pages--cloudflare-functions)
- [方案二：Vercel + Cloudflare Workers](#方案二vercel--cloudflare-workers)
- [方案三：Netlify + Cloudflare Workers](#方案三netlify--cloudflare-workers)
- [方案四：纯静态 + 独立 API 服务](#方案四纯静态--独立-api-服务)
- [选择建议](#选择建议)

---

## 方案对比

| 方案 | 前端托管 | API 服务 | 免费额度 | 自定义域名 | 复杂度 |
|------|---------|---------|---------|-----------|--------|
| GitHub Pages + Cloudflare | ✅ | ✅ | ✅ | ✅ | 中 |
| Vercel + Cloudflare Workers | ✅ | ✅ | ✅（有限） | ✅ | 低 |
| Netlify + Cloudflare Workers | ✅ | ✅ | ✅ | ✅ | 低 |
| 纯静态 + 独立 API | ✅ | ❌ | ✅ | ✅ | 高 |

---

## 方案一：GitHub Pages + Cloudflare Functions

### 步骤 1：构建项目

```bash
npm run build
```

### 步骤 2：创建 GitHub 仓库

```bash
# 初始化 git（如果尚未初始化）
git init

# 添加 remote
git remote add origin https://github.com/oneMuggle/MoRanJiangHu.git

# 创建 main 分支
git checkout -b main

# 添加文件
git add .
git commit -m "Initial commit"

# 推送
git push -u origin main
```

### 步骤 3：创建 gh-pages 分支并部署

```bash
# 构建项目
npm run build

# 创建空的 gh-pages 分支
git checkout --orphan gh-pages

# 删除原来 main 分支的内容（保留 .git）
git rm -rf .

# 复制构建产物
cp -r dist/* .

# 提交并推送
git add .
git commit -m "Deploy $(date +%Y-%m-%d)"
git push origin gh-pages

# 切回 main 分支
git checkout main
```

### 步骤 4：启用 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选择 `gh-pages`，目录选择 `/ (root)`
4. 点击 Save

### 步骤 4：部署 Cloudflare Functions

将 `functions/` 部署到 Cloudflare Workers：

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
wrangler deploy
```

在 Cloudflare 设置环境变量：

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

### 步骤 5：配置自定义域名（可选）

1. 在 Cloudflare Dashboard 添加域名 DNS
2. 进入 **Pages** → 项目 → **Custom domains**
3. 添加你的域名
4. 确保 SSL/TLS 模式为 "Full"

### 方案一优点
- 完全免费
- 静态资源和 API 同一域名
- Cloudflare 全球 CDN

---

## 方案二：Vercel + Cloudflare Workers

### 步骤 1：安装 Vercel CLI

```bash
npm i -g vercel
```

### 步骤 2：部署前端

```bash
vercel --prod
```

按提示完成部署：

```
? Set up and deploy? [Y/N] Y
? Which scope? <your-vercel-username>
? Link to existing project? [Y/N] N
? What's your project's name? MoRanJiangHu
? In which directory is your code located? ./dist
```

### 步骤 3：部署 API

```bash
cd functions
wrangler deploy
```

### 步骤 4：配置环境变量

在 Vercel Dashboard：
- 进入项目 → **Settings** → **Environment Variables**
- 添加 `VITE_GITHUB_CLIENT_ID`

在 Cloudflare Workers：
- 执行 `wrangler secret put GITHUB_CLIENT_SECRET`

### 方案二优点
- Vercel 部署简单
- 自动 HTTPS
- 预览部署功能

---

## 方案三：Netlify + Cloudflare Workers

### 步骤 1：安装 Netlify CLI

```bash
npm i -g netlify-cli
```

### 步骤 2：部署

```bash
netlify deploy --prod --dir=dist
```

### 步骤 3：绑定 GitHub 仓库（可选）

在 Netlify Dashboard：
1. Add new site → Import from Git
2. 选择 GitHub 仓库
3. 设置：

| 配置项 | 值 |
|--------|-----|
| Build command | npm run build |
| Publish directory | dist |

### 方案三优点
- CLI 简单
- Form 功能内置
- 函数支持

---

## 方案四：纯静态 + 独立 API 服务

### 前端部署选项

#### GitHub Pages 免费托管

1. 进入 **Settings** → **Pages**
2. Source: **GitHub Actions**
3. 创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 或手动部署

```bash
npm run build
git checkout gh-pages
cp -r dist/* .
git commit -m "Deploy"
git push origin gh-pages
git checkout main
```

### 后端 API 部署

#### Cloudflare Workers 独立部署

```bash
# 创建 Worker 项目
wrangler init wuxia-api --type=javascript

# 复制 functions 到 Worker
cp -r functions/api/* wuxia-api/src/

# 部署
cd wuxia-api
wrangler deploy
```

#### Railway/V Render 等

```bash
# 使用 Express 包装 functions
# 创建 server.js
const app = require('./api/index');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 选择建议

| 场景 | 推荐方案 |
|------|---------|
| 完全免费，个人项目 | 方案一 |
| 快速部署试用 | 方案二 |
| 需要 Form/Serverless | 方案三 |
| 有现有后端服务 | 方案四 |

### 小项目推荐

**方案一（GitHub Pages + Cloudflare）** 是最经济的选择：

- GitHub Pages：免费，流量无限制
- Cloudflare Workers：每月 100K 请求免费
- 自定义域名 + 免费 SSL

### 生产环境推荐

- 使用 Cloudflare Proxied + 付费计划
- 考虑 CDN 缓存优化
- 配置 Analytics 监控

---

## 快速开始命令

### 一键部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash
set -e

echo "1. Building..."
npm run build

echo "2. committing to gh-pages..."
git checkout gh-pages
cp -r dist/* .
git add -A
git commit -m "Deploy $(date)" || echo "No changes"
git push origin gh-pages

git checkout main

echo "3. Deployment complete!"
echo "Check GitHub Pages URL in repository Settings"
```

执行：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 环境变量速查表

| 位置 | 变量名 | 说明 |
|------|--------|------|
| 前端 `.env` | `VITE_GITHUB_CLIENT_ID` | GitHub OAuth Client ID |
| Cloudflare | `GITHUB_CLIENT_ID` | 同上（用于 API） |
| Cloudflare | `GITHUB_CLIENT_SECRET` | OAuth Client Secret |

---

## 验证部署

部署完成后检查：

1. **前端访问**：`https://<username>.github.io/MoRanJiangHu`
2. **API 可用**：`https://<worker>.workers.dev/api/health`
3. **功能测试**：
   - 打开游戏
   - 进入设置
   - 测试 GitHub 登录
   - 尝试云同步

---

## 相关链接

- [GitHub Pages 文档](https://docs.github.com/pages)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers)
- [Vercel 部署文档](https://vercel.com/docs)
- [Netlify 部署文档](https://docs.netlify.com)