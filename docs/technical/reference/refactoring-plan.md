# 代码重构计划

## 项目概述

本项目为武侠互动叙事游戏前端应用 (React 19 + TypeScript + Vite 6)，当前代码规模约 99k 行，存在若干大文件需要重构以提升可维护性。

---

## 一、大文件统计 (Top 25)

### 1.1 完整列表

| 排名 | 文件 | 行数 | 类型 |
|------|------|------|------|
| 1 | `components/features/Social/ImageManagerModal.tsx` | 4805 | 组件 |
| 2 | `services/ai/image/imageTasks.ts` | 3590 | 服务 |
| 3 | `components/features/Social/mobile/MobileImageManagerModal.tsx` | 3096 | 组件 |
| 4 | `components/features/Settings/NovelDecompositionSettings.tsx` | 3037 | 组件 |
| 5 | `hooks/useGame.ts` | 2990 | Hook |
| 6 | `components/features/NewGame/NewGameWizard.tsx` | 2038 | 组件 |
| 7 | `components/features/NewGame/mobile/MobileNewGameWizard.tsx` | 1960 | 组件 |
| 8 | `services/ai/text/storyTasks.ts` | 1673 | 服务 |
| 9 | `App.tsx` | 1636 | 组件 |
| 10 | `components/features/Settings/ImageGenerationSettings.tsx` | 1627 | 组件 |
| 11 | `utils/apiConfig.ts` | 1603 | 工具 ✅已完成 |
| 12 | `hooks/useGame/systemPromptBuilder.ts` | 1598 | Hook |
| 13 | `hooks/useGame/openingStoryWorkflow.ts` | 1447 | Hook |
| 14 | `services/dbService.ts` | 1250 | 服务 |
| 15 | `utils/worldbook.ts` | 1245 | 工具 |
| 16 | `services/ai/text/storyResponseParser.ts` | 1243 | 服务 |
| 17 | `hooks/useGame/stateTransforms.ts` | 1236 | Hook |
| 18 | `services/novel-decomposition/novelDecompositionStore.ts` | 1127 | 服务 |
| 19 | `hooks/useGame/sendWorkflow.ts` | 1122 | Hook |
| 20 | `services/novel-decomposition/novelDecompositionInjection.ts` | 985 | 服务 |
| 21 | `services/novel-decomposition/novelDecompositionPipeline.ts` | 968 | 服务 |
| 22 | `hooks/useGame/storyState.ts` | 939 | Hook |
| 23 | `components/features/Chat/InputArea.tsx` | 911 | 组件 |
| 24 | `services/githubSync.ts` | 908 | 服务 |
| 25 | `components/features/Social/SocialModal.tsx` | 850 | 组件 |

### 1.2 分类汇总

| 类别 | 数量 | 最大文件 |
|------|------|---------|
| **Components** | 12 | 4805行 |
| **Hooks** | 6 | 2990行 |
| **Services** | 6 | 3590行 |
| **Utils** | 2 | 1603行 |

---

## 二、重构方案详情

### 2.1 高优先级 (P0)

#### 1. `services/ai/image/imageTasks.ts` → ⏸️ 跳过

**状态**: 高风险拆分，跳过

**问题**: 3590行，混入了多后端图片生成逻辑 (NovelAI/OpenAI/SD/WebUI)

**分析**:
- 内部helper函数 (~40个) 相互依赖
- 类型定义散布各区域
- 业务函数名混在其中
- 拆分风险 > 预期收益

**建议**: 保持或完全重写

---

#### 2. `utils/apiConfig.ts` → ✅ 完成

**状态**: ✅ 已完成

**重构前**: 1932行
**重构后**: 1603行
**减少**: 329行 (17%)

**新建结构**:
```
data/transformerPresets/
├── npc/
│   ├── transformer_nai_npc.ts
│   ├── transformer_banana_npc.ts
│   ├── transformer_grok_npc.ts
│   └── index.ts
├── scene/
│   ├── transformer_nai_scene.ts
│   ├── transformer_banana_scene.ts
│   ├── transformer_grok_scene.ts
│   ├── transformer_nai_scene_judge.ts
│   ├── transformer_banana_scene_judge.ts
│   ├── transformer_grok_scene_judge.ts
│   └── index.ts
├── model/
│   ├── transformer_model_bundle_nai.ts
│   ├── transformer_model_bundle_banana.ts
│   ├── transformer_model_bundle_grok.ts
│   └── index.ts
└── index.ts
```

---

### 2.2 中优先级 (P1)

#### 3. `utils/worldbook.ts` → ⏸️ 跳过

**状态**: 业务逻辑紧耦合，跳过

**原因**:
- 1245行全是管理逻辑
- 无大型预设数据块可分离
- 内置世界书条目通过代码动态生成

---

#### 4. `services/ai/text/storyTasks.ts` → ⏸️ 可选

**状态**: 中等风险，可选

**问题**: 1673行，混入了 memory recall / world generation / novel decomposition

**分析**:
- 导出函数10个，内部helper ~18个
- 比 imageTasks.ts 更易拆分
- 需谨慎处理helper依赖

**建议**: 保持，或拆分后风险可控

---

### 2.3 低优先级 (P2)

#### 5. `hooks/useGame/systemPromptBuilder.ts` → ⏸️ 可选

**状态**: 可选拆分

**问题**: 1598行，系统提示词构建

**分析**:
- 无UI，纯逻辑
- 与useGame模块紧耦合
- 可尝试按提示词类型拆分

---

### 2.4 组件文件分析

#### ImageManagerModal.tsx (4805行) → ❌ 不建议拆分

**原因**:
- 146个Hooks (useState/useEffect/useMemo)
- 40+ Props回调函数
- React UI逻辑紧耦合

---

#### NovelDecompositionSettings.tsx (3037行) → ⏸️ 可选

**状态**: 可选拆分
**风险**: 设置面板逻辑

---

#### NewGameWizard.tsx (2038行) → ⏸️ 可选

**状态**: 可选拆分

---

## 三、重构执行总结

### 已执行重构

| # | 文件 | 状态 | 变化 |
|---|------|------|------|
| 1 | `utils/apiConfig.ts` | ✅ 完成 | 1932→1603行 (-329行) |

### 已跳过重构

| # | 文件 | 状态 | 原因 |
|---|------|------|------|
| 2 | `utils/worldbook.ts` | ⏸️ 跳过 | 业务逻辑紧耦合 |
| 3 | `services/ai/image/imageTasks.ts` | ⏸️ 跳过 | 高风险拆分 |
| 4 | `services/ai/text/storyTasks.ts` | ⏸️ 可选 | 中风险 |
| 5 | `hooks/useGame/systemPromptBuilder.ts` | ⏸️ 可选 | 需谨慎 |
| 6 | `components/.../ImageManagerModal.tsx` | ❌ 不建议 | UI逻辑紧耦合 |

---

## 四、重构建议

### 最终结论

1. **主要目标已完成**: `utils/apiConfig.ts` 重构成功，减少329行
2. **其他文件风险较高**: 组件文件不建议拆分
3. **服务层可尝试**: `storyTasks.ts` 拆分风险中等
4. **保持现状**: 多数大文件已是最佳组织方式

### 何时考虑继续重构

- 项目需要新功能时顺便拆分
- 出现明显代码异味时局部重构
- 重写而非重构大型模块

---

## 五、预期收益

| 指标 | 重构前 | 重构后 |
|------|--------|--------|
| 最大单文件行数 | 4805 | 1603 |
| 可维护文件数 | +1 | data/transformerPresets/ |
| 模块内聚性 | 中 | 高 |

---

*文档更新日期: 2026-04-18*
*分析范围: 全项目329个TS/TSX文件*