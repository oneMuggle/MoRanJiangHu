# services/ - 服务层

## 概述
游戏后端服务：AI 调用、数据库、同步 (~13 文件)

## 结构

```
services/
├── ai/              # AI 服务
│   ├── text/        # 文本生成
│   ├── image/       # 图片生成
│   ├── chatCompletionClient.ts
│   ├── storyTasks.ts      # 剧情任务 (1673行)
│   ├── imageTasks.ts      # 图片任务 (3572行)
│   ├── storyResponseParser.ts
│   └── artistTagDictionary.ts
├── dbService.ts     # IndexedDB 封装 (1250行)
├── githubSync.ts    # GitHub 云同步
├── aiService.ts     # AI 导出聚合
├── epubImport.ts    # EPUB 导入
├── saveArchiveService.ts
└── novelDecomposition*    # 小说分解服务 (7 文件)
```

## 核心服务

### AI 文本生成
```typescript
// services/ai/text/index.ts
export {
  generateStoryResponse,      // 主剧情生成
  generatePlanningAnalysis,    // 规划分析
  generateWorldEvolutionUpdate, // 世界演变
  generateVariableCalibrationUpdate, // 变量校准
  generatePolishedBody,        // 正文润色
  // ...
}
```

### AI 图片生成
```typescript
// services/ai/image/runtime.ts
export {
  generateSceneImage,   // 场景生图
  generateCharacterImage, // 角色生图
  // ...
}
```

### 数据库
```typescript
// services/dbService.ts
const DB_NAME = 'WuxiaGameDB';
// 存储: saves, settings, image_assets
```

## 调用模式

```typescript
// hooks/useGame/sendWorkflow.ts
import * as textAIService from '../../services/ai/text';

// 异步调用
const result = await textAIService.generateStoryResponse(params);
```

## 开发注意

- `chatCompletionClient.ts` - 通用聊天补全客户端
- 图片任务复杂 (3572行 imageTasks.ts)
- 数据库操作需要处理 IndexedDB 异步
- GitHub 同步需要 OAuth 配置
