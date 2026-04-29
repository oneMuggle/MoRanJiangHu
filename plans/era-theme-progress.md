# 三层时代架构 — 实施进度追踪

> 最后更新: 2026-04-29 18:00
> 分支: main
> 最新提交: Phase D-6 (cc4cf58)

---

## Phase A: 元数据扩展 ✅ 已完成
**提交:** `6f6a2a5`

---

## Phase B: 树结构重组 ✅ 已完成
### B-1: contemporaryEpoch 重组 ✅ `a11725c`
### B-2: nearFutureEpoch + farFutureEpoch 重组 ✅ `bba2abf`
### B-3: 新建纪元 + 扩展 SubEra ✅ `307fdeb`
**结构总计:** 7 时代 × 13 纪元 × 36 子纪元

---

## Phase C: 新 SubEra 元数据定义 ✅ 已完成

### C-1: promptVars 填充 ✅ 已完成
**提交:** `3166ef2` — 全部 11 个缺失 SubEra 已补充

### C-2: openingScenes 开局场景池 ✅ 已完成
**提交:** `65d5891` — 全部 37 个 SubEra 已补充（每个 3 个场景）

### C-3: characterArchetypes 角色原型 ✅ 已完成
**提交:** `21a74c0` — 全部 37 个 SubEra 已补充（每个 3 个角色）

### C-4: writingSamples 文风示例 ✅ 已完成
**提交:** `42c057c` — 全部 37 个 SubEra 已补充（每个 2 个示例）

---

## Phase D: 提示词层接入 ✅ 已完成

### D-1: resolveEraNode 扩展 ✅ 已完成
**提交:** `3ff9d75` — 新增 promptVars/openingScenes/characterArchetypes/writingSamples/conflictTypes 返回字段

### D-2: systemPromptBuilder 接入 promptVars ✅ 已完成
**提交:** `a37bc06` — 新建 prompts/runtime/eraTheme.ts，注入 eraId 到系统提示词

### D-3: openingStoryWorkflow 接入 openingScenes ✅ 已完成
**提交:** `8e1dd85` — 新建 prompts/runtime/eraOpeningScene.ts，开场剧情随机选取时代场景

### D-4: 角色生成接入 characterArchetypes ✅ 已完成
**提交:** `fb1cbd2` — 角色原型注入开场初始化任务提示词

### D-5: 写作风格提示接入 writingSamples ✅ 已完成
**提交:** `a723bef` — 文风示例注入系统提示词

### D-6: 时代现实主义提示词接入 (eraRealism) ✅ 已完成
**提交:** `cc4cf58` — 现实主义约束接入系统提示词

---

## Phase E: 资源需求更新 ✅ 已完成
**提交:** pending

- 修正 SubEra 数量从 35→37
- 修正 ID 不匹配: `ancient_eastern_politics` → `ancient_eastern_intrigue`, `primordial_norse_saman` → `primordial_norse`, `post-human_pure_energy` → `post-human_energy`, `post-human_math_reality` → `post-human_math`
- 更新资源总量: 图片 180 张需生成, BGM 32 首需生成
- 添加 Phase D 完成标记

---

## 断点恢复

1. `git log --oneline -5` 确认最新提交
2. Phase D + E 已全部完成, 全部代码已提交

---

## Phase F: Bug 修复与数据补全

### F-1: CRITICAL Bug — worldGenerationWorkflow 缺少 eraId ✅ 已修复
- `hooks/useGame/worldGenerationWorkflow.ts:433` 添加 `eraId: worldConfig.时代配置ID || null`
- `类型 世界生成选项` 新增 `eraId?: string | null`

### F-2: HIGH Bug — resolveEraNode 兜底配色错误 ✅ 已修复
- `models/eraTheme.ts:4382-4384` 将 hardcoded `ancientEpoch` 改为 `path[0]`（节点自身所属 Epoch）

### F-3: 数据缺失 — 6 个 Era 缺少 promptVars ⚠ 待修复
- **影响**: 21 个 SubEra 继承不到 `promptVars`
- **缺失 Era**: `ancient_eastern`, `ancient_western`, `modern_eastern`, `modern_western`, `contemporary_eastern`, `contemporary_western`
- **原因**: Phase C-1 仅补充了 SubEra 级别或较新 Era 的 promptVars，遗漏了 6 个早期 Era

### F-4: 数据缺失 — conflictTypes 覆盖率不足 ⚠ 待修复
- 仅 17 个 conflictTypes 定义，部分 Era/SubEra 缺失
- `resolveEraNode()` 返回 `conflictTypes: undefined` 对多个 SubEra
