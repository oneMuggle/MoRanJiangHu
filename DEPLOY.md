# 部署文档

本文档详细介绍 `墨色江湖：无尽武林` 项目的部署方案，包括本地开发部署和生产环境部署。

## 目录

- [环境要求](#环境要求)
- [本地开发部署](#本地开发部署)
- [生产构建部署](#生产构建部署)
- [Cloudflare Pages Functions 部署](#cloudflare-pages-functions-部署)
- [GitHub 云同步配置](#github-云同步配置)
- [NovelAI 图像生成配置](#novelai-图像生成配置)
- [常见部署问题](#常见部署问题)

---

## 环境要求

| 组件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | 20+ | 开发服务器和构建必需 |
| npm | 10+ | 包管理器 |
| Git | 2.0+ | 版本控制（可选） |
| PowerShell 7 | - | 仅 Windows 用户需要使用开发期 NovelAI 代理时安装 |

### 检查环境

```bash
node -v    # 应为 20.x.x 或更高
npm -v      # 应为 10.x.x 或更高
```

---

## 本地开发部署

### 步骤 1：克隆仓库

```bash
git clone <repository-url>
cd MoRanJiangHu
```

### 步骤 2：安装依赖

```bash
npm install
```

### 步骤 3：启动开发服务器

```bash
npm run dev
```

服务启动后访问：

```
http://localhost:3000
```

### 开发模式说明

- Vite 开发服务器支持热更新（HMR）
- Windows 用户会自动启动 NovelAI 代理脚本（用于图像生成）
- 前端实时编译，无需手动刷新

### 可选环境变量

在项目根目录创建 `.env.local` 文件：

```env
# 可选：Gemini API 密钥（旧链路兼容）
GEMINI_API_KEY=your_key_here

# 可选：GitHub OAuth 客户端 ID
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

---

## 生产构建部署

### 构建命令

```bash
npm run build
```

构建产物输出到 `dist/` 目录：

```
dist/
├── assets/          # 打包后的静态资源
├── functions/      # Cloudflare Pages Functions（需单独部署）
└── index.html      # 入口 HTML
```

### 预览构建结果

```bash
npm run preview
```

默认访问：`http://localhost:4173`

### 静态部署

将 `dist/` 目录内容部署到任意静态文件服务器：

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/wuxia-game/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

#### Apache 配置示例

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/wuxia-game/dist

    <Directory />
        Require all granted
        Options -Indexes +FollowSymLinks
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /index.html [L]
    </Directory>

    # 缓存静态资源
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        <IfModule mod_expires.c>
            ExpiresActive On
            ExpiresByType image/jpeg "access plus 1 year"
            ExpiresByType image/png "access plus 1 year"
            ExpiresByType text/css "access plus 1 month"
            ExpiresByType application/javascript "access plus 1 month"
        </IfModule>
    </FilesMatch>
</VirtualHost>
```

---

## Cloudflare Pages Functions 部署

此项目包含 Cloudflare Pages Functions 用于 GitHub 云同步功能，需要单独部署到 Cloudflare Pages。

### 部署步骤

#### 方法一：通过 Cloudflare Dashboard 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Pages** → **Create a project**
3. 选择 **Direct upload**
4. 上传 `dist/functions/` 目录内容
5. 配置构建命令（留空，因为这是纯 API）
6. 设置环境变量：

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth 应用 Client ID | 是 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 应用 Client Secret | 是 |

#### 方法二：通过 Wrangler CLI 部署

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署 Functions
cd dist/functions
wrangler pages deploy . --project-name wuxia-game-api
```

### 配置环境变量

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

### Workers 路由配置

如需自定义域名，在 Cloudflare Dashboard 中：

1. 进入 **Pages** → 你的项目 → **Custom domains**
2. 添加自定义域名
3. 配置 SSL/TLS 为 "Full" 或 "Full (strict)"

---

## GitHub 云同步配置

### 前置条件

1. 创建 GitHub OAuth 应用
2. 获取 `Client ID` 和 `Client Secret`

### 创建 OAuth 应用

1. 访问 https://github.com/settings/developers
2. 点击 **New OAuth app**
3. 填写信息：

| 字段 | 值 |
|------|-----|
| Application name | 墨色江湖 |
| Homepage URL | 你的游戏部署地址 |
| Application description | 武侠互动叙事游戏 |
| Authorization callback URL | `https://<你的API域名>/api/auth/github/callback` |

### 环境变量配置

#### 前端环境变量（构建时）

在 `.env.production` 或部署平台的环境变量设置中添加：

```env
VITE_GITHUB_CLIENT_ID=your_client_id
```

#### 后端环境变量（Cloudflare）

在 Cloudflare Pages 的环境变量设置中添加：

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 云同步功能说明

- **同步内容**：存档、设置、游戏内图片资源
- **不同步**：提示词池、内置提示词、GitHub Token
- **存储方式**：GitHub 私有仓库的 Release 附件
- **压缩算法**：fflate 分卷压缩

---

## NovelAI 图像生成配置

### 开发模式

Windows 用户在开发模式下会自动启动代理脚本：

```bash
npm run dev
```

代理脚本位于：`scripts/novelai-proxy.ps1`

#### 手动配置（可选）

在应用内设置页配置：

1. 进入 **设置** → **图像生成**
2. 选择 **NovelAI** 作为模型
3. 填写 API 地址（如需代理）
4. 输入 API Key

### 生产模式

在生产环境使用 NovelAI：

1. 申请 [NovelAI](https://novelai.net) 账号
2. 获取 API Key
3. 在应用内设置页配置：

| 配置项 | 值 |
|--------|-----|
| 模型 | novelai |
| API 地址 | `https://api.novelai.net` |
| API Key | 你的密钥 |

### 代理配置（可选）

如需通过代理访问 NovelAI：

```env
# 在 .env.local 中
NOVELAI_PROXY=http://127.0.0.1:7890
```

---

## 常见部署问题

### 构建失败

**问题**：执行 `npm run build` 失败

**解决**：
1. 检查 Node.js 版本是否为 20+
2. 清除缓存后重新安装依赖：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 静态资源 404

**问题**：部署后样式或脚本资源加载失败

**解决**：
1. 确保服务器正确配置 SPA 路由（所有非文件请求回退到 `index.html`）
2. 检查 Nginx/Apache 配置中的 `try_files` 指令

### CORS 错误

**问题**：API 请求跨域错误

**解决**：
1. 生产部���时��保前端和 API 同域或配置 CORS
2. 如使用 Cloudflare，检查 Cloudflare 设置中的 CORS 配置

### IndexedDB 访问失败

**问题**：本地存储无法写入

**解决**：
1. 确保使用 HTTPS（或 localhost）
2. 检查浏览器隐私设置是否阻止 IndexedDB
3. 清除浏览器站点数据后重试

### Cloudflare Functions 部署失败

**问题**：Wrangler 部署报错

**解决**：
1. 确保已登录：`wrangler login`
2. 检查 `functions/` 目录结构是否正确
3. 查看 Cloudflare Pages 构建日志

### 大 Chunk 警告

**问题**：Vite 构建显示大 chunk 警告

**解决**：
- 此为预期行为，不会阻塞构建完成
- 如需优化，可调整 `vite.config.ts` 中的 chunk 分割策略

---

## 部署检查清单

### 开发环境

- [ ] Node.js 20+ 已安装
- [ ] 执行 `npm install` 成功
- [ ] 执行 `npm run dev` 成功
- [ ] 访问 http://localhost:3000 正常

### 生产环境

- [ ] 执行 `npm run build` 成功
- [ ] `dist/` 目录生成完整
- [ ] 静态文件服务器配置正确
- [ ] SPA 路由回退配置正确
- [ ] HTTPS 证书配置正确（如需生产环境）

### Cloudflare Functions

- [ ] OAuth 应用已创建
- [ ] Client ID 和 Secret 已获取
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 自定义域名配置（如需要）

### GitHub 云同步

- [ ] 前端 `VITE_GITHUB_CLIENT_ID` 已配置
- [ ] 后端环境变量已配置
- [ ] 云同步功能测试通过
- [ ] 上传/下载功能正常

---

## 相关文档

- [README.md](./README.md) - 项目概述
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
- [SECURITY.md](./SECURITY.md) - 安全策略