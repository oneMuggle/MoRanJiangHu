# 对话导出系统

> 创建日期：2026-05-04
> 状态：已完成
> 关联功能：互动历史存档 (HistoryViewer)

---

## 1. 需求分析

### 1.1 现状
- 游戏有完整的聊天记录系统 (`聊天记录结构`)
- 存档导出包含聊天记录，但需要完整 ZIP 打包
- 有独立的互动历史存档查看功能 (HistoryViewer)

### 1.2 需求
- 支持将当前对话历史导出为多种格式（TXT、JSON、Markdown）
- 在互动历史面板中提供导出入口
- 导出时包含角色信息、时间戳等元数据

---

## 2. 实施方案

### 2.1 新建服务文件
- `services/conversationExportService.ts` - 导出核心逻辑
  - 支持三种格式：纯文本、JSON、Markdown
  - 包含元数据（标题、角色、导出时间、对话条数）
  - 自动下载文件

### 2.2 工具函数
- `utils/conversationExport.ts` - 快捷导出函数封装
  - `快速导出为Txt()` - 快捷导出为纯文本
  - `快速导出为Json()` - 快捷导出为JSON
  - `快速导出为Md()` - 快捷导出为Markdown

### 2.3 UI 组件
- `components/features/Chat/ConversationExportPanel.tsx` - 导出面板
  - 格式选择（Markdown/纯文本/JSON）
  - 导出按钮和状态反馈

### 2.4 UI 集成
- 修改 `components/features/Settings/HistoryViewer.tsx`
- 在互动历史面板添加导出按钮
- 复用已有 HistoryViewer 的 props 接口

---

## 3. 文件变更清单

### 新建
- `services/conversationExportService.ts` - 导出服务 (~150行)
- `utils/conversationExport.ts` - 工具函数 (~60行)
- `components/features/Chat/ConversationExportPanel.tsx` - 导出面板 (~150行)
- `docs/plans/2026-05-04_conversation-export-system.md` - 本计划文档

### 修改
- `components/features/Settings/HistoryViewer.tsx` - 添加导出按钮入口

---

## 4. 实现记录

### 2026-05-06 初始化
- [x] 创建计划文档
- [x] 实现导出服务 (conversationExportService.ts)
- [x] 实现工具函数 (conversationExport.ts)
- [x] 创建导出面板 (ConversationExportPanel.tsx)
- [x] 集成到 HistoryViewer
- [x] Git commit
