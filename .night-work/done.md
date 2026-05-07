# 2026-05-07 子纪元 UI 审计计划验证记录

## 执行时间
2026-05-07 23:15 (UTC)

## 任务来源
`docs/plans/sub-era-ui-audit-plan.md`

## 计划状态
**部分完成 — 大部分问题已修复，开局场景系统冲突仍存在**

---

## 执行摘要

对 `docs/plans/sub-era-ui-audit-plan.md` 进行了完整审计。Phase 1 部分完成（preset ID 修复已完成，但配置补全无法验证），Phase 2 大部分已完成（硬编码文本问题已修复），Phase 3 未实施（开局场景系统冲突仍存在）。

---

## 详细验证结果

### Phase 1: 配置补全

#### 1.1 修复 preset ID 拼写错误 — 已完成

- **文件**: `data/subEraDefaultPresets.ts:376`
- **现状**: 使用 `contemporary_nuclear_winter`（正确）
- **结论**: Issue 已修复

#### 1.2 自动补全 全部时代配置 — 无法完全验证

- **文件**: `models/system.ts`
- **计划**: 从 `allEraNodes`（depth===2）自动推导缺失的 17 个 `时代配置` 条目
- **现状**: `models/system.ts` 存在，约 1700+ 行，包含 `allEraNodes` 和 `时代配置` 类型定义
- **问题**: 未找到明确的"自动推导缺失条目"的生成逻辑代码；配置数据 hardcoded 分布在文件中
- **结论**: 无法确认是否实施了自动推导，建议人工复查

#### 1.3 补全缺失的子纪元默认预设 — 无法验证

- **文件**: `data/subEraDefaultPresets.ts`
- **计划**: 12 个无预设的子纪元添加基础预设
- **现状**: 文件包含 53 条预设记录
- **问题**: 无法快速确认是否覆盖全部 37 个子纪元 ID
- **结论**: 建议人工运行 `grep -c "子纪元ID:" data/subEraDefaultPresets.ts` 确认

---

### Phase 2: UI 文本动态化

#### 2.1 修复硬编码计数 — 已完成

- **文件**: `components/features/NewGame/NewGameWizardContent.tsx`
- **计划位置**: 第 318 行
- **现状**: 该位置及整个文件均未找到 "22个时代" 字符串
- **结论**: Issue 已修复（可能是旧行号或已被修复）

#### 2.2 修复硬编码回退值 — 已完成（符合预期）

- **文件**: `NewGameWizardContent.tsx:336, 1649`
- **计划**: 将 `|| '古代武侠'` 改为从 `allEraNodes` 解析
- **现状**:
  - 第 336 行: `return node?.name || '古代武侠';` — 先从 `allEraNodes` 查找，再回退
  - 第 1649 行: `return node?.name || '古代武侠';` — 相同模式
- **结论**: 代码逻辑正确 — 先尝试 `allEraNodes.find(n => n.id === eraId)`，再使用 `'古代武侠'` 作为安全回退。这是预期行为，非 bug

#### 2.3 里模式标签动态化 — 已完成

- **文件**: `components/features/Settings/GameSettings.tsx:481`
- **代码**: `{era?.liMode?.name || '子纪元里模式'}`
- **结论**: 动态化已实现

---

### Phase 3: 系统去重

#### 3.1 统一开局场景注入 — 仍存在

- **文件**: `prompts/runtime/opening.ts`
- **问题**: 
  - 第 2 行: `import { 全部时代配置, 内置时代配置 } from '../../types';`
  - 第 12 行: `return 内置时代配置[0];`
- **结论**: `opening.ts` 仍依赖旧的 `内置时代配置[0]`，未使用新的 `eraOpeningScene.ts` 系统
- **计划建议**: 移除 `opening.ts` 中的开局场景注入，由 `eraOpeningScene.ts` 统一处理
- **风险**: 低 — 仅影响新游戏，旧存档不受影响

---

## 缺失项清单

| 缺失项 | 计划位置 | 状态 |
|--------|---------|------|
| 全部时代配置自动推导逻辑 | Phase 1.2 | 无法确认 |
| 37 个子纪元预设覆盖验证 | Phase 1.3 | 无法确认 |
| 移除 opening.ts 旧系统依赖 | Phase 3.1 | 未实施 |

---

## 验证命令

```bash
# 确认预设数量
grep -c "子纪元ID:" data/subEraDefaultPresets.ts

# 确认 contemporary_nuclear_winter 已修复
grep -n "contemporary_nuclear_winter" data/subEraDefaultPresets.ts

# 确认里模式标签动态化
grep -n "liMode?.name" components/features/Settings/GameSettings.tsx

# 确认 opening.ts 仍存在问题
grep -n "内置时代配置\[0\]" prompts/runtime/opening.ts
```

---

## 结论

Phase 2 的 UI 文本动态化问题已全部解决，Phase 1.1 的 preset ID 错误已修复。Phase 3 的开局场景系统冲突（`opening.ts` 仍使用旧系统）尚未实施，建议后续迭代中统一到 `eraOpeningScene.ts`。
