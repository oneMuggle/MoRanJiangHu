# 架构总览

> 提取自 `CLAUDE.md` 和根 `AGENTS.md` | **日期:** 2026-04-28

## 应用结构

```
index.html -> index.tsx -> App.tsx -> useGame() hook
```

三个顶级视图由 `state.view` 控制：
1. `'home'` -> LandingPage（起始页）
2. `'new_game'` -> NewGameWizard（新游戏向导）
3. `'game'` -> 主游戏框架（LeftPanel | Chat | RightPanel）

## 核心状态管理

### 中央 Hook：`hooks/useGame.ts`（~3000 行）

所有游戏状态的唯一来源。返回 `{ state, meta, setters, actions }`。

**子工作流**（`hooks/useGame/` 下 45+ 文件）：
- `sendWorkflow.ts` — 主剧情请求处理和 AI 响应解析
- `systemPromptBuilder.ts` — 运行时提示词组装
- `memoryUtils.ts`、`memoryRecall.ts` — 记忆系统
- `worldGenerationWorkflow.ts`、`worldEvolutionWorkflow.ts` — 世界状态管理
- `openingStoryWorkflow.ts` — 新游戏初始化和开局剧情
- `bodyPolish.ts` — 文本后处理润色
- `saveCoordinator.ts` — 存档/读档协调
- `image/` — 图片生成工作流
- `config/` — 设置持久化

### 状态结构

扁平结构，使用中文 key：

| Key | 领域 |
|-----|------|
| `state.角色` | 角色属性和状态 |
| `state.环境` | 环境和位置 |
| `state.社交` | NPC 社交关系 |
| `state.世界` | 世界状态和时间线 |
| `state.战斗` | 战斗状态 |
| `state.剧情` | 故事/叙事状态 |
| `state.历史记录` | 聊天历史 |
| `state.记忆系统` | 记忆系统 |
| `state.任务列表` / `state.约定列表` | 任务和约定 |
| `state.玩家门派` | 玩家门派管理 |
| `state.开局配置` | 开局配置 |
| `state.apiConfig` / `state.gameConfig` / `state.memoryConfig` / `state.visualConfig` | 设置配置 |

## 数据持久化

### 主存储：IndexedDB

- 数据库名：`WuxiaGameDB`
- 存储：存档、设置、图片资源
- 实现：`services/dbService.ts`
- 多级回退链：内存 -> IndexedDB -> CDN -> 空字符串

### 可选：GitHub 云同步

- Cloudflare Pages Functions 位于 `functions/api/`
- OAuth 认证：`functions/api/auth/github.ts`
- 存档上传/下载：GitHub Release 附件
- 使用 `fflate` 压缩

## AI 供应商抽象

通过 `接口供应商类型` 支持多供应商：`'gemini' | 'claude' | 'openai' | 'deepseek' | 'zhipu' | 'openai_compatible'`

不同操作可使用不同供应商：
- 主剧情生成
- 记忆操作
- 世界演变
- 图片生成

## 构建配置

### Vite Chunk 分割（`vite.config.ts`）

- 提示词分块：`prompts-core`、`prompts-runtime`、`prompts-stats`、`prompts-shared`
- 功能分块：`image-manager-desktop`、`image-manager-mobile`、`settings-desktop-entry`、`settings-mobile-entry`、`settings-panels`
- 游戏运行时：`services/ai/` + `hooks/useGame.ts`

### 别名

- `@/*` -> 项目根目录

## 响应式设计

- 桌面端：三栏布局（LeftPanel | Chat | RightPanel）
- 移动端：单栏 + `MobileQuickMenu` 底部导航
- 断点：`max-width: 767px`

## 主题系统

自定义 Tailwind 颜色：`ink-black`、`ink-gray`、`wuxia-gold`、`wuxia-gold-dark`、`wuxia-cyan`、`wuxia-red`、`paper-white`

字体：
- `font-serif`：Noto Serif SC、SimSun、Songti SC
- `font-sans`：Noto Sans SC、Microsoft YaHei

动画：`glitch`、`slide-in`、`fadeIn`、`marquee`、`marquee-linear`

## 时代主题系统

三层树：`Epoch（时代）-> Era（纪元）-> SubEra（子纪元）`，共 22 个细分时代。
继承规则：子节点缺失的元数据自动继承最近父节点。
类型定义见 `models/eraTheme.ts`。
