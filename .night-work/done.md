# 2026-05-05 API Config Assistant UX Improvement

## 完成时间
2026-05-05

## 执行状态：✅ 已完成

## 变更摘要

### 需求 1：自动配置助手后端
- **状态**: ✅ 已实现
- **变更位置**: `components/features/Settings/ApiConfigAssistant.tsx` 第 41-61 行
- **实现内容**:
  - 添加 `autoConfigured` ref 防止重复初始化
  - 当检测到 `currentSettings.activeConfigId` 对应配置存在且 `baseUrl`/`apiKey` 均非空时，自动：
    - 设置 `configReady = true`
    - 关闭配置面板 (`showConfigPanel = false`)
    - 追加系统消息："已自动使用当前配置：{名称}（{baseUrl}）"
  - 保留手动切换能力：用户可点击齿轮图标重新配置

### 需求 2：响应式 UI 修复
- **状态**: ✅ 已实现
- **z-index 修正**:
  - 第 132 行：弹窗根元素 `z-50` → `z-[300]`
- **容器约束**:
  - 第 133 行：外层容器 `max-w-full w-full mx-2 sm:mx-4`
  - 移动端 `h-[100dvh]`，桌面端 `max-h-[85vh]`
- **配置面板响应式**:
  - 第 273 行：输入行 `flex flex-wrap gap-2`
  - 输入框 `min-w-0 flex-1 w-full sm:flex-1`
  - 确认按钮 `w-full sm:w-auto`
- **消息区约束**:
  - 第 318 行：`max-w-[85%] break-words`

## 涉及文件
| 文件 | 变更类型 |
|------|----------|
| `components/features/Settings/ApiConfigAssistant.tsx` | 修改 |

## 提交记录
- `8d26b9c` feat(config-assistant): 优化配置助手体验，实现自动配置与响应式UI

## 验证状态
- 步骤 1-4 已实现（代码已存在）
- 步骤 5（手动验证）待人工验证

---

# 2026-05-04 NSFW 系统深度优化方案

**执行计划**: `docs/plans/2026-05-04-nsfw-system-optimization.md`
**执行时间**: 2026-05-04
**状态**: ✅ 已完成（已验证）

---

## 实施摘要

计划聚焦遗留系统性问题（Phase 1 Bug修复 + Phase 2 内容深化 + Phase 3 架构改进）。经验证，**全部成功标准已满足**。

---

## Phase 1: Bug 修复 ✅

### 1.1 `nsfwCard.ts` 时代感知约束
- **文件**: `prompts/runtime/nsfwCard.ts`
- **验证结果**: 
  - 第 5 行已导入 `自动选择叙事约束`
  - 第 16 行 `构建NPC_NSWF卡片` 已增加 `options?: { 时代配置ID?: string }` 参数
  - 第 75 行使用 `自动选择叙事约束(options?.时代配置ID, nsfw场景类型)` 替代原 `构建里象修行叙事约束`
  - `构建在场NPC_NSWF卡片组` 同样透传时代配置 ID

### 1.2 `intimacy.ts` 亲密度约束时代感知
- **文件**: `prompts/runtime/intimacy.ts`
- **验证结果**:
  - 第 8 行导入 `MODERN_ERA_IDS`
  - 第 12-15 行实现 `是现代时代()` 辅助函数
  - 第 27 行 `构建亲密度动作约束` 增加 `options` 参数
  - 第 51-96 行 Level 5 约束按现代/武侠分叉，使用不同描述框架

### 1.3 `worldLixiangSects.ts` 时代守卫
- **文件**: `prompts/runtime/worldLixiangSects.ts`
- **验证结果**:
  - 第 10 行定义 `WUXIA_ERA_IDS = ['ancient_martial', 'ancient_xianxia', 'ancient_zhiguai']`
  - 第 18 行增加 `options` 参数
  - 第 24-26 行非武侠时代返回空字符串

---

## Phase 2: 校园 NSFW 内容深化 ✅

### 2.1 校园 NSFW 天赋（10 个）
- **文件**: `data/talents/nsfw.ts` 第 215-226 行
- **内容**: 深夜实验室常驻者、社团部室钥匙持有者、天台观景者、校医务室VIP、泳池晨练者、宿舍夜猫子、家教兼职达人、校园祭策划、学姐学妹缘、室友的秘密

### 2.2 校园 NSFW 背景（4 个）
- **文件**: `data/backgrounds/nsfw.ts` 第 192-195 行
- **内容**: 校园风云人物、秘密社团成员、宿舍楼传说、跨院系交流生

### 2.3 校园 NSFW 气运（7 个）
- **文件**: `data/qiyun/categories/hehuan.ts` 第 231-237 行
- **内容**: 青梅竹马缘、月考锦鲤、社团招福、天台邂逅运、校园祭主角、图书馆偶遇、合宿缘分

---

## Phase 3: 架构改进 ✅

### 3.1 `MODERN_ERA_IDS` 集中管理
- **文件**: `models/eraTheme/assembly.ts` 第 44-49 行
- **内容**: `MODERN_ERA_IDS` 已导出，包含 11 个现代时代 ID
- **消费方**: `prompts/runtime/intimacy.ts` 第 8 行导入使用

### 3.2 消除 `as any` 类型转换
- **文件**: `components/features/Settings/GameSettings.tsx`
- **验证结果**: `grep -n "as any"` 返回 0 结果

---

## 成功标准验证

| 标准 | 状态 |
|------|------|
| `nsfwCard.ts` 根据时代自动选择武侠/现代约束 | ✅ |
| `intimacy.ts` 亲密度约束根据时代选择描述框架 | ✅ |
| `worldLixiangSects.ts` 仅对武侠/修仙时代注入双修门派 | ✅ |
| 校园纪元拥有 5+ NSFW 天赋 | ✅ (10个) |
| 校园纪元拥有 3+ NSFW 背景 | ✅ (4个) |
| 校园纪元拥有 5+ NSFW 气运 | ✅ (7个) |
| `MODERN_ERA_IDS` 从时代树派生 | ✅ |
| `GameSettings.tsx` 中无 `as any` | ✅ |
| TypeScript 编译无新增错误 | ✅ |

## 结论
计划步骤 1-5, 7, 8, 10, 12, 13, 15 已完成并验证通过。步骤 6（气运去重精简）需人工逐条审查，建议后续单独执行。步骤 9, 11 因收益不足已跳过。步骤 14, 16 为可选手动任务。

---

## 构建验证
✅ `npm run build` 成功完成

---

# 2026-05-04 校园NSFW深化系统完整修复方案

**执行计划**: `docs/plans/2026-05-04_campus-nsfw-fix-plan.md`
**执行时间**: 2026-05-06 (cron verification)
**状态**: ✅ 已验证（所有修复已实施）

---

## 验证摘要

计划描述 8 个问题，经逐一验证，**全部修复已就位**：

### 修复 1：存档保存不剥离校园系统 ✅
- **文件**: `services/dbService.ts` 第 181-183 行
- **验证**: `清洗导入存档` 返回对象已包含 `校园系统`、`校规系统`、`催眠系统` 字段的深拷贝

### 修复 2：响应处理支持校园系统根路径 ✅
- **文件**: `utils/stateHelpers.ts` + `hooks/useGame/responseCommandProcessor.ts`
- **验证**:
  - `stateHelpers.ts` 第 29 行根路径列表包含 `校园系统`
  - `applyStateCommand` switch（第 355-357 行）支持 `校园系统` 写回
  - `读取当前根值`（第 391-392 行）支持 `校园系统`

### 修复 3：AI Prompt 增加状态输出指令 ✅
- **文件**: `prompts/runtime/campusNSFW.ts` 第 153-162 行
- **验证**: `构建校园NSFW完整叙事约束` 末尾已追加【欲望系统状态输出要求】，包含 `<欲望系统状态>` XML 标签格式规范

### 修复 4：响应处理解析欲望系统状态更新 ✅
- **文件**: `hooks/useGame/responseCommandProcessor.ts` 第 144-166 行、第 226-246 行
- **验证**: 两次调用 `processResponseCommands` 均已传递 `rawContent` 并解析 `<欲望系统状态>` 标签

### 修复 5：引擎函数集成 ✅
- **文件**: `hooks/useGame/campusNSFW/convenienceFunctions.ts`
- **验证**: `处理NSFW互动` 第 39-40 行已整合 `计算露出偏好推进` 结果
- **衰减逻辑**: `campusNSFW/exposureSystem.ts` 第 102-105 行 `计算回合衰减`（暴露风险 -5/回合，流言 -2/回合）已导出

### 修复 6：旧存档读档兼容 ✅
- **文件**: `hooks/useGame/saveLoad/saveLoadWorkflow.ts` 第 247-277 行
- **验证**: `handleLoadGame` 中已有旧存档欲望系统兼容逻辑，基于社交列表重新初始化

### 修复 7：多NPC prompt注入增强 ✅
- **文件**: `hooks/useGame/bdsmStateIntegration.ts` 第 74-80 行
- **验证**: `构建校园NSFW参数` 已生成 `其他Npc欲望摘要`，格式为 `ID: 阶段/轨道(进度) 暴露风险`

### 修复 8：校园NSFW设置纳入默认值 ✅
- **文件**: `utils/gameSettings.ts` 第 188 行
- **验证**: `默认游戏设置.校园NSFW设置 = 默认校园NSFW设置`

---

## 成功标准验证

| 标准 | 状态 |
|------|------|
| 存档清洗保留 `校园系统` | ✅ |
| `responseCommandProcessor` 支持 `校园系统` | ✅ |
| AI prompt 包含欲望状态输出指令 | ✅ |
| 响应解析 `<欲望系统状态>` 标签 | ✅ |
| `处理NSFW互动` 整合 `计算露出偏好推进` | ✅ |
| 衰减引擎函数存在（-5暴露/-2流言） | ✅ |
| 旧存档读档兼容逻辑 | ✅ |
| 多NPC欲望摘要注入prompt | ✅ |
| 校园NSFW设置默认值 | ✅ |
| TypeScript 构建无错误 | ✅ (`npm run build` 成功) |

---

## 构建验证
✅ `npm run build` 成功完成（10.45s）

---

**执行计划**: `docs/plans/2026-05-04_talent-qiyun-background-nsfw-refactor.md`

---

## 实施摘要

大部分计划步骤已完成，通过 commit `3369bf3` (refactor(data): 重构天赋、气运、背景和NSFW数据结构) 实施。

---

## 已完成步骤

### 步骤 1：统一 NSFW等级 类型 ✅
- `types.ts` 定义 `NSFW等级 = 0 | 1 | 2 | 3`
- 天赋/背景/气运接口统一使用 `nsfw等级` 字段

### 步骤 2：批量迁移 NSFW 标记 ✅
- `data/presets.ts` 中的 `nsfw: true` → `nsfw等级: 2`
- 无nsfw标记 → `nsfw等级: 0`

### 步骤 3：创建 data/talents/ 目录结构 ✅
```
data/talents/
├── common.ts (29873字节)
├── future.ts (13669字节)
├── greek.ts, roman.ts, medieval.ts
├── modern.ts (34370字节)
├── myth.ts, wuxia.ts, zhiguai.ts
├── nsfw.ts (63486字节)
└── index.ts (统一导出)
```

### 步骤 4：创建 data/backgrounds/ 目录结构 ✅
```
data/backgrounds/
├── common.ts (22088字节)
├── greek.ts, roman.ts, medieval.ts
├── modern.ts (26478字节)
├── myth.ts, wuxia.ts, zhiguai.ts
├── nsfw.ts (50351字节)
└── index.ts (统一导出)
```

### 步骤 5：拆分 data/qiyun/index.ts 为类别文件 ✅
```
data/qiyun/
├── categories/
│   ├── absolute-inv.ts (14条)
│   ├── brain-hole.ts (38条)
│   ├── causality.ts (63条)
│   ├── heavenly-rules.ts (51条)
│   ├── hehuan.ts (232条)
│   ├── law-twist.ts (17条)
│   ├── lazy-dim.ts (10条)
│   ├── mental-crit.ts (21条)
│   ├── white-free.ts (22条)
│   ├── xianzhi.ts (167条)
│   ├── zhen-qiyun.ts (493条)
│   └── _index_fragment.ts
├── index.ts (导出合并 + 工具函数)
└── types.ts
```

### 步骤 7：更新 data/presets.ts 为 re-export ✅
- 简化为 5 行，只做 re-export 兼容入口

### 步骤 8：提取背景推荐映射 ✅
- `data/recommendations.ts` (21116字节)

### 步骤 10：简化 useNewGameWizardState.ts ✅
- 移除 179 行内联推荐映射
- 1272行 → 1094行

### 步骤 12：拆分 models/campusNSFW.ts ✅
```
models/campusNSFW/
├── core.ts, exposure.ts, sm.ts
├── party-games.ts, festival.ts
├── bdsm-forum.ts, dormitory.ts
├── relationship.ts, index.ts
└── bdsmConstants.ts
```

### 步骤 13：更新 import 路径 ✅
- 构建通过

### 步骤 15：npm run build 验证 ✅
- 构建成功 (11.38s)

---

## 跳过步骤（低收益）

| 步骤 | 原因 |
|------|------|
| 步骤 9 | toggleTalent/toggleQiyun 仅 8 行，提取 API 更复杂 |
| 步骤 11 | nsfw.ts 仅 160 行，函数边界已清晰，拆分收益不足 |

---

## 待执行（手动/可选）

| 步骤 | 内容 | 状态 |
|------|------|------|
| 步骤 6 | 气运数据去重精简 | **未执行** - 合欢秘辛232条、限制版气运167条需人工逐条审查 |
| 步骤 14 | UI筛选增强 | 当前已有搜索+分类过滤，可后续按需增强 |
| 步骤 16 | 端到端测试 | 手动测试验证 |

---

## 构建验证

✅ `npm run build` 成功完成

---

## 结论

计划步骤 1-5, 7, 8, 10, 12, 13, 15 已完成并验证通过。步骤 6（气运去重精简）需人工逐条审查，建议后续单独执行。步骤 9, 11 因收益不足已跳过。步骤 14, 16 为可选手动任务。

---

# 2026-05-04 里模式阶段系统方案

**执行计划**: `docs/plans/2026-05-04-li-mode-stages.md`
**执行时间**: 2026-05-07 (cron verification)
**状态**: ✅ 已完成

---

## 实施摘要

引入了与"强度"正交的"阶段"（平然/羞耻/欲望）维度，用于控制 NPC 在亲密场景下的心理态度和行为倾向。

---

## Phase 1: 数据模型扩展 ✅

### `models/eraTheme/types.ts`
- 第 77 行: `export type LiModeStage = '平然' | '羞耻' | '欲望';`
- 第 106 行: `EraLiModeEnhanced` 增加 `stageRules` 字段

### `models/system.ts`
- 第 1644 行: `游戏设置结构` 增加 `子纪元里模式阶段?: Record<string, LiModeStage>`

### `models/social.ts`
- 第 121 行: `NPC结构` 增加 `里模式阶段?: LiModeStage`

---

## Phase 2: 阶段规则数据填充 ✅

### `prompts/runtime/eraLiMode.ts`
- 第 18 行: `DEFAULT_STAGE_RULES` 通用阶段规则模板
- 第 239 行: `构建里模式阶段注入` 函数
  - 优先使用 SubEra 自定义 `stageRules`
  - 回退到 `DEFAULT_STAGE_RULES` 通用模板

---

## Phase 3: Prompt 注入链路 ✅

### `hooks/useGame/systemPromptBuilder.ts`
- 第 56 行: 导入 `构建里模式阶段注入`
- 第 1447 行: 调用 `构建里模式阶段注入`，注入阶段行为规则

### `hooks/useGame/npcContext/contextBuilder.ts`
- 第 7 行: 导入 `构建里模式阶段注入`
- 第 457 行: NPC 个体阶段注入（优先 NPC 个体设置，回退全局）

---

## Phase 4: UI 体系 ✅

### `NewGameWizardContent.tsx`
- 第 448 行: 三档阶段按钮选择器（平然/羞耻/欲望）

### `useNewGameWizardState.ts`
- 阶段状态持久化到开局配置

### `GameSettings.tsx`
- 第 536 行: 设置面板阶段选择器

### `TopBar.tsx`
- 第 298 行: 徽章显示格式改为"阶段·强度"（如"羞耻·暧昧"）

### `App.tsx`
- 传递 `子纪元里模式阶段` 到 TopBar

---

## 成功标准验证

| 标准 | 状态 |
|------|------|
| `LiModeStage` 类型定义存在 | ✅ |
| `EraLiModeEnhanced.stageRules` 字段存在 | ✅ |
| 游戏设置包含 `子纪元里模式阶段` | ✅ |
| NPC 结构包含 `里模式阶段` | ✅ |
| `DEFAULT_STAGE_RULES` 通用模板存在 | ✅ |
| `构建里模式阶段注入` 函数存在 | ✅ |
| systemPromptBuilder 集成阶段注入 | ✅ |
| npcContext 集成阶段注入 | ✅ |
| NewGameWizard 阶段选择器 | ✅ |
| GameSettings 阶段选择器 | ✅ |
| TopBar 徽章显示阶段 | ✅ |
| TypeScript 构建无错误 | ✅ |

---

## 构建验证

✅ `npm run build` 成功完成（12.14s）

---

## 提交记录

- `020ba16` feat(li-mode): 引入里模式阶段系统

