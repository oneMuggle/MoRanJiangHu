# 大文件拆分重构方案

## 总览

当前项目有 11 个源文件超过 1200 行，其中 5 个超过 1500 行。最大的文件 `services/ai/image/imageTasks.ts` 已达 3952 行，且文件顶部已有 TODO 注释建议拆分。

| 文件 | 当前行数 | 目标最大行数 | 拆分后文件数 |
|------|---------|-------------|------------|
| services/ai/image/imageTasks.ts | 3952 | 400 | 8 |
| components/features/Social/ImageManagerModal.tsx | 3521 | 400 | 6 |
| components/features/Social/mobile/MobileImageManagerModal.tsx | 3097 | 400 | 5 |
| components/features/Settings/NovelDecompositionSettings.tsx | 3038 | 400 | 6 |
| components/features/Settings/ImageGenerationSettings.tsx | 2172 | 400 | 4 |
| hooks/useGame.ts | 2123 | 300 | 2 (已是编排器) |
| services/ai/text/storyTasks.ts | 1813 | 400 | 4 |
| App.tsx | 1711 | 400 | 3 |
| utils/apiConfig.ts | 1681 | 400 | 3 |
| models/system.ts | 1330 | 400 | 2 |
| services/dbService.ts | 1287 | 400 | 3 |

**目标**: 所有源文件控制在 800 行以内，典型文件 200-400 行。

---

## 优先级分级

### P0 - 最高优先级 (阻塞日常开发)
1. `services/ai/image/imageTasks.ts` (3952 行) -- 已有 TODO，修改最频繁
2. `services/ai/text/storyTasks.ts` (1813 行) -- 核心 AI 调用链路
3. `utils/apiConfig.ts` (1681 行) -- 所有功能依赖的配置层

### P1 - 高优先级 (影响组件开发效率)
4. `components/features/Settings/NovelDecompositionSettings.tsx` (3038 行) -- 文件顶部已有 TODO
5. `components/features/Settings/ImageGenerationSettings.tsx` (2172 行)
6. `components/features/Social/ImageManagerModal.tsx` (3521 行)

### P2 - 中等优先级 (改善可维护性)
7. `components/features/Social/mobile/MobileImageManagerModal.tsx` (3097 行)
8. `App.tsx` (1711 行)
9. `hooks/useGame.ts` (2123 行) -- 已经是编排器，拆分价值有限
10. `models/system.ts` (1330 行) -- 纯类型定义
11. `services/dbService.ts` (1287 行)

---

## 每个文件的详细拆分方案

---

### P0-1. services/ai/image/imageTasks.ts (3952 行) → 拆分为 8 个文件

#### 当前职责
图片生图系统的"大杂烩"，包含：
- PNG 元数据解析（Exif、tEXt、zTXt、iTXt、NovelAI 隐写）~550 行
- 分词器文本生成（角色/场景/部位特写三种任务类型）~700 行
- 多后端图片生成（OpenAI、NovelAI、SD WebUI、ComfyUI、Grok）~600 行
- 提示词装配与清洗（NAI 权重语法、结构化词组序列化、角色锚点注入）~800 行
- 角色/NPC 提示词构建（直接构建 + AI 生成）~600 行
- 场景提示词构建（判定 + 转换）~400 行
- 香闺秘档部位特写提示词构建 ~250 行
- 连接测试（各后端连通性检测）~350 行
- 本地资源持久化 ~50 行

#### 拆分方案

| 新文件 | 行数预估 | 职责 | 依赖 |
|--------|---------|------|------|
| `services/ai/image/constants.ts` | ~150 | 常量、默认值、映射表、正则 | 无 |
| `services/ai/image/pngParser.ts` | ~600 | PNG 元数据解析：签名校验、块遍历、tEXt/zTXt/iTXt 解析、Exif 解析、NovelAI 隐写解码、SD 参数解析、JSON 注释解析 | constants.ts |
| `services/ai/image/imageTokenizer.ts` | ~700 | 分词器工具：NAI V4 提示结构拆分、词组清洗、权重语法转换、提示词去重合并、Artist 标签规范化、结构化词组解析与序列化 | constants.ts, chatCompletionClient |
| `services/ai/image/backends.ts` | ~700 | 后端请求：OpenAI 协议、NovelAI 请求体构建与响应解析、SD WebUI、ComfyUI 工作流注入与轮询、Grok | constants.ts, chatCompletionClient |
| `services/ai/image/anchorExtractor.ts` | ~350 | 角色锚点提取：PNG 画风提炼、角色锚点 AI 提取、PNG 参数净化 | constants.ts, pngParser.ts, chatCompletionClient |
| `services/ai/image/promptBuilder.ts` | ~500 | 提示词构建：NPC 直接构建、场景判定构建、部位特写构建、角色锚点注入、最终提示词装配 | constants.ts, imageTokenizer.ts |
| `services/ai/image/connectionTests.ts` | ~350 | 连接测试：SD WebUI、ComfyUI、NovelAI、OpenAI、Grok 各后端测试 | constants.ts, backends.ts |
| `services/ai/image/persistence.ts` | ~100 | 本地持久化：blob 转 DataUrl、图片资源保存到 IndexedDB | dbService |

**出口文件**: `services/ai/image/index.ts` 统一 re-export，保持现有公共 API 不变。

#### 关键依赖链（必须按此顺序创建）
```
constants.ts (无依赖)
  --> pngParser.ts (依赖 constants)
  --> imageTokenizer.ts (依赖 constants, chatCompletionClient)
  --> backends.ts (依赖 constants, chatCompletionClient)
  --> promptBuilder.ts (依赖 constants, imageTokenizer)
  --> anchorExtractor.ts (依赖 constants, pngParser, chatCompletionClient)
  --> connectionTests.ts (依赖 constants, backends)
  --> persistence.ts (依赖 dbService)
  --> index.ts (依赖以上所有)
```

#### 拆分步骤
1. **创建 constants.ts** -- 提取所有不依赖其他模块的常量
2. **创建 pngParser.ts** -- 移动所有 PNG/Exif/NovelAI 解析相关函数
3. **创建 imageTokenizer.ts** -- 移动所有分词/清洗/序列化函数
4. **创建 backends.ts** -- 移动所有后端请求逻辑
5. **创建 anchorExtractor.ts** -- 移动角色锚点提取相关函数
6. **创建 promptBuilder.ts** -- 移动所有提示词构建函数
7. **创建 connectionTests.ts** -- 移动所有连接测试函数
8. **创建 persistence.ts** -- 移动持久化相关函数
9. **创建 index.ts** -- 统一导出所有公共 API
10. **修改 imageTasks.ts** -- 改为 re-export from index.ts，确认无报错后再删除

#### 风险评估
- **风险**: 文件间循环依赖 → **缓解**: 严格按依赖顺序创建，每个文件创建后 `npm run build` 验证
- **风险**: 导出名称变更导致运行时错误 → **缓解**: index.ts 保持与现有完全相同的导出名
- **风险**: `services/ai/image/runtime.ts` 只导出了 5 个函数 → **缓解**: 修改 runtime.ts 改为从 index.ts 或直接从新文件导入

---

### P0-2. services/ai/text/storyTasks.ts (1813 行) → 拆分为 4 个文件

#### 当前职责
所有 AI 文本生成任务的入口：
- 记忆回忆、正文润色、世界观生成、同人境界体系
- 世界演变、变量校准
- 小说拆分解析（约 30 个函数，~1000 行）

#### 拆分方案

| 新文件 | 行数预估 | 职责 | 依赖 |
|--------|---------|------|------|
| `services/ai/text/storyCoreTasks.ts` | ~450 | 回忆、润色、世界观、境界体系生成 | chatCompletionClient, storyResponseParser |
| `services/ai/text/worldEvolutionTask.ts` | ~200 | 世界演变 | chatCompletionClient, storyResponseParser |
| `services/ai/text/variableCalibrationTask.ts` | ~250 | 变量校准 | chatCompletionClient, storyResponseParser |
| `services/ai/text/novelDecomposition.ts` | ~800 | 小说拆分：全部解析/规范化/AI分析函数 | chatCompletionClient, storyResponseParser |

**出口文件**: 在 `storyTasks.ts` 中统一 re-export 所有公共 API，保持现有导入不变。

---

### P0-3. utils/apiConfig.ts (1681 行) → 拆分为 3 个文件

#### 拆分方案

| 新文件 | 行数预估 | 职责 | 依赖 |
|--------|---------|------|------|
| `utils/apiConfigConstants.ts` | ~400 | 常量、预设、默认值、ID 生成、标准化辅助 | models/system |
| `utils/apiConfigNormalization.ts` | ~350 | 配置标准化：单配置、功能模型占位、接口设置规范化 | apiConfigConstants |
| `utils/apiConfig.ts` | ~600 | 公共 API：`获取*接口配置` 系列函数 | apiConfigNormalization, apiConfigConstants |

---

### P1-1. NovelDecompositionSettings.tsx (3038 行)

文件顶部 TODO 已建议拆分到 `panels/{ApiConfig,Injection,Preview,ImportExport,Scheduler,Split}Panel.tsx`。

#### 拆分方案

| 新文件 | 行数预估 | 职责 |
|--------|---------|------|
| `NovelDecompositionSettings/ApiConfigPanel.tsx` | ~400 | API 配置区域 |
| `NovelDecompositionSettings/InjectionPanel.tsx` | ~350 | 注入设置区域 |
| `NovelDecompositionSettings/PreviewPanel.tsx` | ~300 | 预览区域 |
| `NovelDecompositionSettings/ImportExportPanel.tsx` | ~400 | 导入导出区域 |
| `NovelDecompositionSettings/SchedulerPanel.tsx` | ~500 | 调度器区域 |
| `NovelDecompositionSettings/SplitPanel.tsx` | ~400 | 拆分设置区域 |
| `NovelDecompositionSettings/types.ts` | ~100 | 共享类型 |
| `NovelDecompositionSettings/index.tsx` | ~200 | 主面板（组合各子面板） |

---

### P1-2. ImageGenerationSettings.tsx (2172 行)

#### 拆分方案

| 新文件 | 行数预估 | 职责 |
|--------|---------|------|
| `ImageGenerationSettings/BasicSettingsPanel.tsx` | ~500 | 基础设置：后端选择、模型、地址、密钥、ComfyUI |
| `ImageGenerationSettings/TransformerPanel.tsx` | ~450 | 词组转化器设置 |
| `ImageGenerationSettings/ArtistAndPngPanel.tsx` | ~500 | 画师串和 PNG 画风预设管理 |
| `ImageGenerationSettings/index.tsx` | ~300 | 主面板 |

---

### P1-3. ImageManagerModal.tsx (3521 行)

已有 `context/`, `utils/`, `tabs/`, `overlays/`, `components/` 子目录，需补全剩余内联组件的提取。

#### 拆分方案

| 新文件 | 行数预估 | 职责 |
|--------|---------|------|
| `ImageManagerModal/ImageManagerMain.tsx` | ~400 | 主组件 + 状态管理 |
| `ImageManagerModal/tabs/NpcImageTab.tsx` | ~500 | NPC 图片 tab |
| `ImageManagerModal/tabs/SceneImageTab.tsx` | ~450 | 场景图片 tab |
| `ImageManagerModal/tabs/PlayerImageTab.tsx` | ~400 | 主角图片 tab |
| `ImageManagerModal/tabs/PngRefineTab.tsx` | ~400 | PNG 提炼 tab |
| `ImageManagerModal/tabs/CharacterAnchorTab.tsx` | ~400 | 角色锚点 tab |

---

### P2-1. App.tsx (1711 行)

#### 拆分方案

| 新文件 | 行数预估 | 职责 |
|--------|---------|------|
| `App.tsx` | ~400 | 主组件（视图路由 + JSX 渲染） |
| `AppLazyComponents.tsx` | ~250 | 所有 `创建可预加载懒组件` 声明 + 预加载占位 |
| `AppHandlers.ts` | ~500 | 所有 `useCallback` 事件处理函数 |

---

### P2-2. models/system.ts (1330 行)

#### 拆分方案

| 新文件 | 行数预估 | 职责 |
|--------|---------|------|
| `models/system.ts` | ~600 | 核心系统类型：接口配置、API 设置、游戏设置等 |
| `models/imageSettings.ts` | ~500 | 图片设置类型：文生图配置、画师串预设、PNG 画风预设等 |

---

### P2-3. services/dbService.ts (1287 行)

#### 拆分方案

| 新文件 | 行数预估 | 职责 |
|--------|---------|------|
| `services/db/core.ts` | ~200 | 数据库初始化、通用工具 |
| `services/db/saves.ts` | ~500 | 存档 CRUD、自动存档、导入导出 |
| `services/db/settings.ts` | ~300 | 设置 CRUD |
| `services/db/imageAssets.ts` | ~200 | 图片资源 CRUD |
| `services/dbService.ts` | ~100 | 统一 re-export（向后兼容） |

---

## 实施阶段

### Phase 1: 低风险、高价值 (第 1 周)
1. `utils/apiConfig.ts` → 3 个文件（纯函数，无 React 依赖，风险最低）
2. `services/ai/text/storyTasks.ts` → 4 个文件
3. `services/ai/image/imageTasks.ts` → 8 个文件（最大收益）

### Phase 2: 中等复杂度 (第 2 周)
4. `NovelDecompositionSettings.tsx` → 按已有 TODO 拆分为面板
5. `ImageGenerationSettings.tsx` → 4 个文件
6. `ImageManagerModal.tsx` → 补全现有子目录模块化

### Phase 3: 改善可维护性 (第 3 周+)
7. `MobileImageManagerModal.tsx` → 参考桌面版拆分
8. `App.tsx` → 3 个文件
9. `models/system.ts` → 2 个文件
10. `services/dbService.ts` → 子模块

---

## 通用拆分规则

### 命名约定
- 保留中文命名（项目约定，CLAUDE.md 明确说明）
- 子目录使用 PascalCase
- 文件名：PascalCase（组件）或 camelCase（工具/服务）

### 导入路径约定
- 拆分后的文件使用相对路径导入同级文件
- 外部引用方统一通过原文件名 re-export
- 示例：`import { xxx } from '../../services/ai/image'` 保持可用（通过 index.ts）

### 行为不变原则
- 拆分过程中**不改变任何运行时行为**
- 只移动代码，不重写逻辑
- 每次拆分后立即运行 `npm run build` 和 `npm run dev` 验证

### Git 策略
- 每个文件的拆分为一个独立 commit
- Commit message: `refactor: split XxxFile into smaller modules`
- 使用 `git mv` 保持文件历史记录

---

## 注意事项

1. **中文命名是项目约定**：不要将变量、类型、函数名改为英文
2. **React.lazy 预加载**：拆分组件时确保 `创建可预加载懒组件` 模式不受影响
3. **IndexedDB 是主要持久化层**：dbService 拆分后保持相同的 key 和 store 结构
4. **无测试框架**：拆分后手动验证关键功能
5. **Vite chunk 警告是预期行为**：拆分后可能增加 chunk 数量，但不影响功能
