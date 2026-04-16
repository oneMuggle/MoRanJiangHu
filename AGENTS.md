# 墨色江湖：无尽武林 - AGENTS.md

## 项目概述

武侠互动叙事游戏，前端为主（含 Cloudflare Pages Functions）。数据默认存储在 IndexedDB，支持 GitHub 云同步。

**技术栈**: React 19, TypeScript, Vite 6, Tailwind CSS, IndexedDB, fflate

---

## 开发命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 生产构建
npm run preview      # 预览构建结果
npm run stress:test  # 提示词压力测试
```

**环境要求**: Node.js 20+, npm 10+

---

## 目录结构

```
components/    UI 组件、弹窗、功能面板
data/          内置预设和静态数据
docs/          设计/重构分析文档
functions/     Cloudflare Pages Functions (GitHub 同步 API)
hooks/         业务逻辑和 React hooks
models/        领域模型和类型定义
plans/         功能规划和阶段性方案
prompts/       提示词系统 (core/runtime/writing/stats 分层)
scripts/       开发辅助脚本
services/      AI、数据库、同步服务
styles/        全局样式和主题
utils/         配置、状态、通用工具函数
```

---

## 架构要点

### 应用入口
- `index.tsx` → `App.tsx` → 使用 `useGame()` hook
- 开发服务器: http://localhost:3000

### 核心状态管理
- `hooks/useGame.ts` 是主入口 (~3000 行)，导出 `useGame()` hook
- `hooks/useGame/` 包含 44 个子模块：sendWorkflow、memoryUtils、worldEvolutionWorkflow 等
- 状态通过 `useGameState.ts` 管理，通过 `useGame()` 返回 `{ state, meta, setters, actions }`

### 提示词系统 (`prompts/`)
- `prompts/core/` - 核心规则、格式、共享约束、COT 片段
- `prompts/runtime/` - 开局、世界生成、变量生成、规划分析等运行时链路
- `prompts/writing/` - 写作风格、视角、正文约束
- `prompts/stats/` - 经验、战斗、角色、掉落等统计规则
- `prompts/index.ts` 导出 `默认提示词` 数组

### AI 服务 (`services/ai/`)
- `services/ai/text/` - 文本生成
- `services/ai/image/` - 图片生成 (NovelAI 等)
- `services/ai/chatCompletionClient.ts` - 通用聊天补全客户端

### 数据库 (`services/dbService.ts`)
- IndexedDB 存储存档、设置、图片资源
- DB_NAME: `WuxiaGameDB`

### GitHub 云同步 (`functions/api/`)
- 需要额外部署 Cloudflare Pages Functions
- 依赖环境变量: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

---

## 构建配置

### Vite Chunk 分割策略 (`vite.config.ts`)
```typescript
// 提示词按目录分割
prompts-core, prompts-runtime, prompts-stats, prompts-shared

// 功能模块分割
image-manager-desktop, image-manager-mobile
settings-desktop-entry, settings-mobile-entry, settings-panels
game-runtime (services/ai/ + hooks/useGame.ts)
```

### 别名
- `@/*` → 项目根目录

---

## 开发注意事项

### 编码
- **必须使用 UTF-8 编码**处理所有文件

### 命名
- 代码库混用中文和英文命名
- 新增代码遵循所在模块的既有风格，**不做无关重命名**

### 调试提示
- 历史记录、设置、图片资源缓存在 IndexedDB
- 排查"旧数据残留"时优先检查 IndexedDB

### 构建警告
- Vite 大 chunk 警告不会阻塞构建完成

### Windows 开发
- NovelAI 代理脚本 (`scripts/novelai-proxy.ps1`) 需要 PowerShell 7
- `vite.config.ts` 中 `PWSH_PATH` 指向 `C:\Program Files\PowerShell\7\pwsh.exe`

---

## 配置说明

### 应用内配置
模型选择、接口地址、提示词开关、世界书等在**应用内设置页**管理，不硬编码在 `.env`。

### 可选 `.env.local`
```env
GEMINI_API_KEY=your_key_here
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

---

## 无配置项

- **无 ESLint/Prettier 配置** - 未发现 linting 配置
- **无 Jest/Vitest 配置** - 未发现测试框架
- **无 CI/CD 工作流** - 未发现 GitHub Actions 或其他 CI 配置

---

## Tailwind 主题

自定义颜色 (`tailwind.config.cjs`):
- `ink-black`, `ink-gray`, `wuxia-gold`, `wuxia-gold-dark`, `wuxia-cyan`, `wuxia-red`, `paper-white`

自定义字体:
- `font-serif`: Noto Serif SC, SimSun, Songti SC
- `font-sans`: Noto Sans SC, Microsoft YaHei

自定义动画:
- `glitch`, `slide-in`, `fadeIn`, `marquee`, `marquee-linear`

---

## 相关文档

- [README.md](./README.md) - 项目概述和快速开始
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南
- `docs/` - 设计分析文档
- `plans/` - 功能规划文档

## 子模块 AGENTS.md

分层知识库覆盖关键复杂模块：

| 模块 | 文件 | 覆盖内容 |
|------|------|----------|
| hooks/useGame | [AGENTS.md](./hooks/useGame/AGENTS.md) | 状态管理、44 工作流、入口点 |
| prompts | [AGENTS.md](./prompts/AGENTS.md) | 6 层提示词结构、COT、添加方式 |
| components/features | [AGENTS.md](./components/features/AGENTS.md) | 22 功能模块、桌面/移动端模式 |
| services | [AGENTS.md](./services/AGENTS.md) | AI 调用、数据库、同步服务 |

---

## 项目规模

- **总文件数**: 329 (不含 node_modules/dist)
- **代码行数**: ~99k 行 TypeScript/TSX
- **大型文件**: 47 个 (>500行)
- **最大深度**: 4 层目录
