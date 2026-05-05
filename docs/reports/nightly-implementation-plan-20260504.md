# 墨染江湖项目夜间实施方案

> 生成时间: 2026-05-04 23:00
> 执行批次: 2026-05-04 夜间
> 执行人: Claude Code (via Hermes Router Agent)

---

## 一、项目现状总览

### 1.1 MoRanJiangHu（墨染江湖）

| 指标 | 状态 |
|------|------|
| Git 状态 | Clean tree, up-to-date with origin/main |
| 最近提交 | `dd40fb4 resource: AlbumApp真实图片上线 + 5首新BGM (2026-05-04)` |
| 构建状态 | ✅ Pass (9.28s) |
| Lint 状态 | ⚠️ 21 errors, 1336 warnings |
| 测试状态 | ✅ Phase 0.1 Vitest 已配置 |
| Task Tracker | Phase 0 ✅完成, Phase 1 进行中 |

**Lint 错误分布（21个）**:
- `components/features/Settings/PlayerPage.tsx` - 5处 `useMemo` in `renderPlayerPage` (non-React function)
- `components/features/Settings/NovelDecompositionSettings.tsx` - 9处 `useState` in `renderSubContent` (non-React function)
- `hooks/useGame/backgroundImageMonitor.ts` - 3处 `useRef` in `创建后台生图监控` (non-React function)

---

## 二、今夜执行任务（3项）

### Task 1.7: 提取跨文件重复工具函数 → `utils/stringNormalizers.ts` (2h)

**目标**: 创建 `utils/stringNormalizers.ts`，集中所有字符串规范化函数，消除跨文件重复。

**候选文件（已有类似函数）**:
- `utils/apiConfig.ts` - 可能有 `规范化文本` 类函数
- `utils/apiConfigNormalization.ts` - 明显包含规范化逻辑
- `services/githubSync.ts` - 可能有文本规范化
- `services/ai/text/storyResponseParser.ts` - 已有重复函数去除（任务1.6已完成）

**操作步骤**:
1. 搜索所有包含 `归一化` `规范化` `normalizeText` `sanitize` 的函数定义
2. 识别重复模式（完全相同或微小变体）
3. 创建 `utils/stringNormalizers.ts`，导出统一实现
4. 更新所有引用处，改为从新文件导入
5. 运行 `npm run build` 验证
6. 运行 `npm run lint` 确认无新增错误

**验收标准**:
- 新文件 `utils/stringNormalizers.ts` 存在且被至少2个其他文件引用
- `npm run build` 通过
- 无新的 lint error

---

### Task 1.2: 拆分 `sendWorkflow.ts` → `hooks/useGame/sendWorkflow/` (6h)

**目标**: 将 20918 行的 `hooks/useGame/sendWorkflow.ts` 拆分为多文件目录结构。

**文件路径**: `hooks/useGame/sendWorkflow.ts` (20918行, ~56KB)

**拆分方案**:
```
hooks/useGame/sendWorkflow/
├── index.ts              # 主入口 + 调度编排 (~300行)
├── memoryRecallPhase.ts  # 回忆检索阶段 (~400行)
├── responseProcessingPhase.ts  # 响应处理阶段 (~500行)
├── independentStages.ts  # 独立阶段调度 (polish/world/planning/variable) (~400行)
└── types.ts              # 共享类型定义 (~100行)
```

**识别阶段函数**:
- `执行回忆检索` / `memoryRecallPhase` - 回忆检索
- `处理剧情响应` / `responseProcessingPhase` - 响应处理（正文+命令+记忆）
- `执行独立阶段` / `independentStages` - polish/world/planning/variable 独立调用
- 主调度函数 - 串联各阶段

**操作步骤**:
1. 读取 `hooks/useGame/sendWorkflow.ts`，识别阶段函数边界（找注释分隔或功能分块）
2. 按方案创建目录和文件
3. 在各文件中实现单一阶段函数
4. `index.ts` 保留主入口，重新组装流程
5. 更新 `hooks/useGame.ts` 中的 import 路径
6. 运行 `npm run build` 验证
7. 运行 Vitest (`npm run test`) 确保测试通过

**验收标准**:
- `hooks/useGame/sendWorkflow/` 目录存在，包含至少4个 `.ts` 文件
- 单文件不超过 600 行
- `npm run build` 通过
- `npm run test` 通过（如有测试文件）

---

### Task 1.3: 拆分 `systemPromptBuilder.ts` → `hooks/useGame/systemPromptBuilder/` (6h)

**目标**: 将 1665 行的 `systemPromptBuilder.ts` 拆分为多文件目录结构。

**文件路径**: `hooks/useGame/systemPromptBuilder.ts` (1665行)

**拆分方案**:
```
hooks/useGame/systemPromptBuilder/
├── index.ts              # 主入口 + 构建器编排 (~200行)
├── coreBlocks.ts         # 核心区块 (规则、格式、COT) (~350行)
├── stateBlocks.ts        # 状态区块 (角色、环境、世界、战斗) (~350行)
├── socialBlocks.ts       # NPC 和社交区块 (~250行)
├── memoryBlocks.ts       # 记忆和回忆区块 (~200行)
├── planningBlocks.ts     # 规划区块 (~200行)
└── types.ts              # 共享类型定义 (~120行)
```

**识别区块函数**:
- `构建核心规则区块` / `构建格式区块` / `构建COT区块` → `coreBlocks.ts`
- `构建角色状态区块` / `构建环境状态区块` / `构建世界状态区块` / `构建战斗状态区块` → `stateBlocks.ts`
- `构建NPC区块` / `构建社交区块` → `socialBlocks.ts`
- `构建记忆区块` / `构建回忆区块` → `memoryBlocks.ts`
- `构建规划区块` → `planningBlocks.ts`

**操作步骤**:
1. 读取 `hooks/useGame/systemPromptBuilder.ts`，识别所有 `构建*区块` 函数
2. 按方案创建目录和文件
3. 移动各构建函数到对应文件
4. `index.ts` 保留主入口 `构建系统提示词` 和编排逻辑
5. 更新 `hooks/useGame.ts` 中的 import 路径
6. 运行 `npm run build` 验证

**验收标准**:
- `hooks/useGame/systemPromptBuilder/` 目录存在，包含至少6个 `.ts` 文件
- 单文件不超过 500 行
- `npm run build` 通过

---

## 三、Lint 错误修复（次优先）

发现 21 个 React Hooks 规则错误，分布在 3 个文件。这些是之前遗留的命名问题。

**注意**: 修复这些 lint 错误不属于 Task Tracker 的正式任务，但影响代码质量。如上三项主要任务完成后时间充裕，可顺手修复。

---

## 四、Git 提交计划

按任务分 3 次提交：
```bash
cd /home/ubuntu/project/MoRanJiangHu

# Commit 1: Task 1.7
git add utils/stringNormalizers.ts
git commit -m "refactor(utils): 提取跨文件重复工具函数至stringNormalizers.ts

- 集中规范化/归一化函数，消除重复定义
- Task 1.7 完成"

# Commit 2: Task 1.2
git add hooks/useGame/sendWorkflow/
git commit -m "refactor(useGame): 拆分sendWorkflow.ts至sendWorkflow/目录

- memoryRecallPhase.ts - 回忆检索阶段
- responseProcessingPhase.ts - 响应处理阶段
- independentStages.ts - 独立阶段调度
- index.ts - 主入口和编排
- Task 1.2 完成"

# Commit 3: Task 1.3
git add hooks/useGame/systemPromptBuilder/
git commit -m "refactor(useGame): 拆分systemPromptBuilder.ts至systemPromptBuilder/目录

- coreBlocks.ts - 核心规则/格式/COT区块
- stateBlocks.ts - 角色/环境/世界/战斗状态区块
- socialBlocks.ts - NPC和社交区块
- memoryBlocks.ts - 记忆和回忆区块
- planningBlocks.ts - 规划区块
- Task 1.3 完成"

# Push all
git push origin main
```

---

## 五、约束与注意事项

1. **不破坏构建**: 每次文件修改后运行 `npm run build` 验证
2. **不新增 lint error**: 确保修改不引入新的 lint 错误
3. **保持命名风格**: 继续使用中文命名（项目既有风格）
4. **保留所有导出**: 外部使用的函数不可删除或重命名，只能重组
5. **更新 import 路径**: 文件移动后确保所有引用处同步更新
