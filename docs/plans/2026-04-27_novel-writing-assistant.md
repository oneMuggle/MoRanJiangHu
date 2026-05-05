# 小说写作助手

> **Status:** 规划中 | **当前阶段:** 阶段 1 / 基础骨架 | **创建日期:** 2026-04-27

## 目标

为用户提供 AI 辅助小说写作功能，支持大纲生成、章节撰写、文风一致性检查、角色一致性维护，与现有的"小说分解"功能形成互补（分解↔写作）。

## 与小说分解的关系

- **小说分解**：将已有小说拆解为结构化数据，用于同人融合
- **小说写作助手**：帮助用户从零开始创作原创小说，提供大纲、章节、角色设定等 AI 辅助

## 总体范围

- 首页新增小说写作独立工作台入口
- 支持小说大纲生成（世界观、角色、剧情线）
- 支持章节级撰写辅助（续写、润色、重写）
- 支持文风一致性指导（基于 prompts/writing/）
- 支持角色设定卡管理与人设一致性检查
- 支持导出为标准格式（TXT、JSON）
- 支持与小说分解数据联动（可将写作内容注入游戏）

## 关键设计原则

- 写作辅助而非替代：AI 提供建议和框架，用户保留创作主导权
- 文风一致性：使用现有的 `prompts/writing/` 系统
- 可渐进使用：支持大纲优先、章节续写、完稿检查等独立模块
- 数据隔离：写作内容默认本地存储，支持主动导入小说分解

## 分阶段进度

### 阶段 1：基础骨架

- [ ] 新增小说写作任务与数据集类型
- [ ] 新增功能配置字段与默认值
- [ ] 新增首页小说写作独立工作台入口与弹窗骨架
- [ ] 新增写作任务状态管理（草稿、进行中、已完成）

### 阶段 2：大纲生成

- [ ] 设计小说大纲生成提示词（世界观、角色、剧情线）
- [ ] 支持基于用户输入的灵感生成大纲
- [ ] 支持大纲编辑与调整
- [ ] 支持保存/加载大纲

### 阶段 3：章节撰写

- [ ] 设计章节撰写辅助提示词
- [ ] 支持基于大纲的章节续写
- [ ] 支持润色、重写、扩展等写作辅助
- [ ] 支持章节进度跟踪

### 阶段 4：文风与角色一致性

- [ ] 接入 `prompts/writing/` 文风系统
- [ ] 支持角色设定卡管理
- [ ] 支持人设一致性检查
- [ ] 支持文风指导与建议

### 阶段 5：导出与联动

- [ ] 支持导出为 TXT 格式
- [ ] 支持导出为 JSON 格式（可被小说分解导入）
- [ ] 支持将写作内容注入游戏世界书
- [ ] 支持从游戏世界书导入设定

## 技术实现要点

### 数据模型

```typescript
interface NovelWritingProject {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'in_progress' | 'completed';
  outline: NovelOutline;
  characters: CharacterCard[];
  chapters: Chapter[];
  settings: WritingSettings;
}

interface NovelOutline {
  worldSetting: string;
  mainPlot: string;
  subPlots: string[];
  estimatedChapters: number;
}

interface CharacterCard {
  id: string;
  name: string;
  role: 'protagonist' | 'supporting' | 'antagonist';
  description: string;
  personality: string;
  appearance: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  status: 'outline' | 'draft' | 'revised' | 'final';
  wordCount: number;
}
```

### 组件结构

```
components/features/
└── NovelWriting/           # 小说写作功能
    ├── NovelWritingModal.tsx       # 桌面版主弹窗
    ├── MobileNovelWriting.tsx      # 移动版主界面
    ├── NovelWritingWorkspace.tsx  # 工作台核心
    ├── NovelOutlineEditor.tsx      # 大纲编辑器
    ├── ChapterEditor.tsx           # 章节编辑器
    ├── CharacterManager.tsx       # 角色管理
    └── WritingToolbar.tsx          # 写作工具栏
```

### 服务层

```
services/
└── novelWriting/
    ├── novelWritingService.ts     # 核心服务
    ├── novelWritingStore.ts       # 状态管理
    └── novelWritingApi.ts         # AI API 调用
```

### 提示词集成

- `prompts/writing/` - 文风约束（已存在）
- 新建 `prompts/runtime/novelWriting.ts` - 大纲生成
- 新建 `prompts/runtime/novelWritingChapter.ts` - 章节撰写
- 新建 `prompts/runtime/novelWritingCharacter.ts` - 角色设定

## 下一步

- [ ] 阶段 1 基础骨架开发
- [ ] 设计数据持久化方案（IndexedDB）
- [ ] 与现有 novel-decomposition 数据格式兼容

## 风险与注意事项

- 需要避免写作内容与游戏存档混淆
- AI 写作建议需明确标注为辅助性质
- 大文件写作需考虑性能与存储
