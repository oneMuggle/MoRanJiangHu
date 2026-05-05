# 对话记忆导入导出系统

> 创建日期：2026-04-25
> 状态：已完成
> 关联功能：记忆系统 (MemoryModal, MobileMemory)

---

## 1. 需求分析

### 1.1 现状
- 游戏有完整的四层记忆系统（即时、短期、中期、长期）
- 存档可以整体导出/导入，但需要完整 ZIP 打包
- 记忆系统支持搜索功能（基于关键词检索）

### 1.2 需求
- 支持将记忆系统导出为独立文件（JSON/TXT）
- 支持从 JSON 文件导入记忆系统
- 支持合并导入（将导入的记忆与现有记忆整合）
- 在记忆面板中提供导入导出入口

---

## 2. 实施方案

### 2.1 新建服务文件
- `services/memoryImportExportService.ts` - 导入导出核心逻辑
  - 支持 JSON 和纯文本两种导出格式
  - 包含元数据（标题、角色、导出时间、版本）
  - 可选择性导出各层记忆
  - JSON 导入验证和规范化
  - 记忆系统合并功能

### 2.2 工具函数
- `utils/memoryImportExport.ts` - 快捷函数封装
  - `快速导出记忆JSON()` - 完整导出为 JSON
  - `快速导出记忆Txt()` - 完整导出为纯文本
  - `仅导出回忆档案()` - 仅导出剧情回忆索引
  - `导出短中期记忆()` - 导出短期和中期记忆
  - `仅导出长期记忆()` - 仅导出长期记忆
  - `导入记忆文件()` - 从文件导入记忆
  - `合并记忆系统()` - 合并导入的记忆

### 2.3 UI 组件
- `components/features/Memory/MemoryImportExportPanel.tsx` - 导入导出面板
  - 导出/导入标签页切换
  - 多种导出预设（完整、仅回忆档案、短中期、仅长期）
  - 格式选择（JSON/TXT）
  - 文件选择器（导入）
  - 导入状态反馈
  - 合并导入功能

### 2.4 UI 集成
- 修改 `components/features/Memory/MemoryModal.tsx`
- 在顶栏右侧添加"导入导出"按钮
- 点击按钮打开 MemoryImportExportPanel 模态框

---

## 3. 文件变更清单

### 新建
- `services/memoryImportExportService.ts` - 导入导出服务 (~400行)
- `utils/memoryImportExport.ts` - 工具函数 (~120行)
- `components/features/Memory/MemoryImportExportPanel.tsx` - 导入导出面板 (~400行)
- `docs/plans/2026-04-25_conversation-memory-import-export.md` - 本计划文档

### 修改
- `components/features/Memory/MemoryModal.tsx` - 添加导入导出按钮和模态框集成

---

## 4. 记忆系统结构

```
记忆系统结构 {
    回忆档案: 回忆条目结构[];  // 结构化回忆索引
    即时记忆: string[];        // 近期回合逐条记忆
    短期记忆: string[];        // 短期摘要记忆条目
    中期记忆: string[];
    长期记忆: string[];
}

回忆条目结构 {
    名称: string;      // 例如：【回忆001】
    概括: string;      // 对应短期记忆
    原文: string;      // 对应即时记忆
    回合: number;      // 顺序号
    记录时间: string;  // YYYY:MM:DD:HH:MM
    时间戳: string;
}
```

---

## 5. 实现记录

### 2026-05-06 初始化
- [x] 创建计划文档
- [x] 实现导入导出服务 (memoryImportExportService.ts)
- [x] 实现工具函数 (memoryImportExport.ts)
- [x] 创建导入导出面板 (MemoryImportExportPanel.tsx)
- [x] 集成到 MemoryModal
- [x] Git commit
