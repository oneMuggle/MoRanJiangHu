# 时代系统与开局设置适配优化

> 日期: 2026-05-03
> 状态: 已完成

## 背景与目标

当前各纪元（尤其是校园子纪元）与开局设置之间存在多处不协调：背景名称无法匹配、气运引用失效、promptVars 继承不准确、首页 UI 未展示时代特色等。本计划旨在修复这些问题，使开局设置与时代系统保持一致。

## 涉及文件

| 文件 | 修改内容 |
|------|----------|
| `data/newGamePresets.ts` | 修复背景名称引用 |
| `data/presets.ts` | 确认/补充校园背景数据 |
| `data/qiyun/index.ts` | 添加校园专属气运 |
| `models/eraTheme/epoch-contemporary.ts` | 添加校园专属 promptVars，补全其他子纪元缺失定义 |
| `utils/eraUIText.ts` | 检查时代切换可靠性 |
| `components/layout/LandingPage.tsx` | 首页时代感知优化 |
| `prompts/runtime/eraTheme.ts` | 检查提示词注入逻辑 |

## 实施步骤

### Phase 1: 修复数据引用（HIGH）

- [x] 步骤 1.1：修复 `newGamePresets.ts` 中的背景名称，改为 `presets.ts` 中实际存在的校园背景
- [x] 步骤 1.2（已跳过）：`qiyun/index.ts` 中校园专属气运已存在（第1024-1026行）

### Phase 2: 补全时代定义（MEDIUM）

- [x] 步骤 2.1：为校园子纪元添加专属 promptVars
- [x] 步骤 2.2：为末日废土子纪元添加 promptVars + conflictTypes
- [x] 步骤 2.3：为嬉皮士文化子纪元添加 promptVars + conflictTypes
- [x] 步骤 2.4：为校园子纪元添加 `subEraDefaultPresets.ts` 默认预设（3个方案）

### Phase 3: UI 与提示词适配（LOW）

- [x] 步骤 3.1：检查 eraUIText.ts 时代切换可靠性（机制正常，无需修改）
- [x] 步骤 3.2：检查 LandingPage 时代感知（已使用 useUIText() hook 订阅，无需修改）

## 风险评估

- 气运数据格式需与现有结构保持一致，否则运行时解析失败
- promptVars 的修改会影响 AI 生成的叙事风格，需要谨慎调整
- UI 改动需确保不影响已有时代（武侠、都市等）的正常显示
