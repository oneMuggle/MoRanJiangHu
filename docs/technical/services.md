# 服务层

> 扩展自 `services/AGENTS.md` | **日期:** 2026-04-28

## 概述

服务层处理所有外部交互：AI API、本地数据库、云同步和小说分解。

## AI 服务（`services/ai/`）

### 文本生成（`services/ai/text/`）

- `storyResponseParser.ts` — 解析 AI 剧情响应，提取命令和叙事
- `text/` — 文本生成流水线和格式化

### 图片生成（`services/ai/image/`）

- NovelAI 集成及开发期代理
- 图片提示词转换
- 资源管理和缓存

### 聊天补全客户端（`services/ai/chatCompletionClient.ts`）

统一多供应商客户端，支持：
- Gemini
- Claude
- OpenAI
- DeepSeek
- 智谱
- OpenAI-compatible 供应商

## 数据库服务（`services/dbService.ts`）

基于 IndexedDB 的多级回退持久化：

1. **内存缓存** — 快速内存查询
2. **IndexedDB** — 持久化本地存储
3. **CDN 下载** — 资源云端回退
4. **空字符串** — 最终回退

### 存储类别

| 存储 | 内容 |
|------|------|
| 存档 | 完整游戏状态快照 |
| 设置 | 用户偏好和 API 配置 |
| 图片资源 | 已生成和缓存的图片 |

## 云同步（`services/githubSync.ts`）

- GitHub OAuth + Release 附件上传/下载
- 使用 `fflate` 压缩以实现高效传输
- 大存档文件分块上传
- Cloudflare Pages Functions 位于 `functions/api/`

## 存档归档（`services/saveArchiveService.ts`）

管理多个存档文件历史，允许玩家维护并切换不同游戏状态。

## 小说分解（`services/novel-decomposition/`）

调度和处理器，导入外部小说文本并分解为游戏兼容的剧情片段。

## EPUB 导入（`services/epubImport.ts`）

解析 EPUB 文件进行小说导入，提取章节结构和文本内容。
