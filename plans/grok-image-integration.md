# Grok 图片生成集成计划

**日期**: 2026-04-29
**状态**: 已完成
**目标**: 将 Grok (xAI) 添加为文生图后端

---

## Grok API 规格

| 项目 | 内容 |
|------|------|
| 端点 | `POST https://api.x.ai/v1/chat/completions` |
| 认证 | `Authorization: Bearer <API_KEY>` |
| 请求格式 | 标准 Chat Completions |
| 响应格式 | `choices[0].message.content` 含 `![img](URL)` |

---

## 实施步骤

### Phase 1: 类型系统更新

- [x] **Step 1**: `models/system.ts` — `接口供应商类型` 添加 `'grok'` ✅ 2026-04-29 13:45
- [x] **Step 2**: `models/system.ts` — `文生图后端类型` 添加 `'grok'` ✅ 2026-04-29 13:45

### Phase 2: API 配置

- [x] **Step 3**: `utils/apiConfig.ts` — 添加 Grok 标签 ✅ 2026-04-29 14:00
- [x] **Step 4**: `utils/apiConfig.ts` — 添加 Grok 默认值 ✅ 2026-04-29 14:00
- [x] **Step 5**: `utils/apiConfig.ts` — 更新 `推断供应商` 识别 x.ai ✅ 2026-04-29 14:00
- [x] **Step 6**: `utils/apiConfig.ts` — 更新 `接口配置是否可用` 验证 ✅ 2026-04-29 14:15

### Phase 3: 图片生成核心

- [x] **Step 7**: `imageTasks.ts` — 添加 Grok 请求体构建 ✅ 2026-04-29 22:30
- [x] **Step 8**: `imageTasks.ts` — 更新 `构建图片端点` ✅ 2026-04-29 22:00
- [x] **Step 9**: `imageTasks.ts` — 更新 `构建生图请求头` ✅ 2026-04-29 22:00
- [x] **Step 10**: `imageTasks.ts` — 验证/增强 Grok 响应解析 ✅ 2026-04-29 22:30 (已存在 markdown URL 解析)

### Phase 4: 连接测试

- [x] **Step 11**: `imageTasks.ts` — 添加 Grok 连接测试 ✅ 2026-04-29 23:00
- [x] **Step 12**: `imageTasks.ts` — 更新 `testImageConnection` 路由 ✅ 2026-04-29 23:00

### Phase 5: 构建验证

- [x] **Step 13**: TypeScript 检查 ✅ 2026-04-29 23:15 (仅预存 RulesTab.tsx 错误 + 未使用变量警告)
- [x] **Step 14**: 完整构建 ✅ 2026-04-29 23:20 (built in 7.96s)

---

## 进度记录

| 时间 | 步骤 | 状态 | 备注 |
|------|------|------|------|
| 2026-04-29 13:45 | Phase 1 | ✅ 完成 | 类型系统已添加 grok |
| 2026-04-29 14:00 | Phase 2 | ✅ 完成 | API 配置已更新所有相关位置 |
| 2026-04-29 22:30 | Phase 3 | ✅ 完成 | 图片生成核心已更新 |
| 2026-04-29 23:00 | Phase 4 | ✅ 完成 | 连接测试已添加 |
| 2026-04-29 23:20 | Phase 5 | ✅ 完成 | TS 检查通过 + 构建成功 (7.96s) |

---

## 测试计划

### 测试用 API 信息

| 供应商 | Base URL | 模型 | 状态 |
|--------|----------|------|------|
| Grok (sunlea.de) | https://sunlea.de/v1 | grok-imagine-image-lite | ✅ 实机测试通过 |
| Grok (yuqing) | https://yuqing-suluokk.com/v1 | grok-imagine-image-lite | ✅ 实机测试通过 |

### 测试结果

**sunlea.de 端（2026-04-30）**

- [x] 端到端生图测试通过 — 提示词：武侠风格汉服女性，竹林月光下 ✅
- [x] 耗时 6.8s，HTTP 200 ✅
- [x] 图片 URL: `https://grok.sunlea.de/v1/files/image?id=1f68ca32-...` ✅
- [x] 图片可访问: `image/jpeg`, 307 KB ✅

**yuqing-suluokk.com 端（2026-04-29）**

- [x] 连接测试返回成功 — 耗时 12321ms，HTTP 200 ✅
- [x] 生成的图片 URL 可访问 — `momo-grok2api.exe.xyz:8000` ✅
- [x] 图片 Content-Type 为 `image/jpeg`，GET 返回 200 ✅
- [x] 响应解析正确识别 markdown `![img](URL)` 格式 ✅

### 测试详情

| 步骤 | 结果 | 详情 |
|------|------|------|
| 请求 `POST /v1/chat/completions` | ✅ HTTP 200, 6.8s | 模型 `grok-imagine-image-lite` |
| 解析 markdown 图片 URL | ✅ 成功 | 提取到 `https://grok.sunlea.de/v1/files/image?id=1f68ca32-...` |
| 验证图片可访问 | ✅ image/jpeg, 200, 307KB | GET 请求成功，返回有效 JPEG 数据 |

### 关键发现

- `grok-imagine-image-lite` 模型实际返回的是 **SSE 流式响应**（即使 `stream: false`），包含 `reasoning_content` 进度提示（如 "图片正在生成 100% (1/1)"）和最终的 `content` 含 markdown URL
- 应用代码中现有的 `生成图片端点` 函数会正确保留 `/chat/completions` 端点
- 现有的 markdown URL 正则解析 `/!\[.*?\]\(([^)]+)\)/` 能正确提取图片链接
- 返回的图片 URL 域名与请求的 Base URL 不同（`grok.sunlea.de` vs `sunlea.de`），但不影响正常访问

### 其他可用模型

| 模型 | 格式 | 耗时 | 状态 |
|------|------|------|------|
| `gpt-image-2` | base64 PNG | ~37s | ✅ 可用，但较慢 |
| `gemini-3.1-flash-image-preview` 系列 | - | ~24s | ❌ 限流/空响应 |
| `grok-4.20-fast` | - | ~3.5s | ❌ 返回空 |
