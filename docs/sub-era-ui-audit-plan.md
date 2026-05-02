# 子纪元 UI 文本匹配修复计划

## 需求概述

审计发现当前 UI 文本与子纪元设置之间存在多处不匹配，涉及 37 个子纪元的配置覆盖不全、硬编码文本过时、双系统并行等问题。

## 审计发现汇总

### 1. 全部时代配置 缺失 17 个子纪元
`全部时代配置` 仅有 25 条，实际有 37 个子纪元。缺失的 17 个导致 `获取时代信息()`、`获取时代背景()` 等返回 null。

### 2. 子纪元默认预设 缺失 12 个子纪元
`data/subEraDefaultPresets.ts` 中 29 条预设覆盖 26 个 ID，仍有 12 个子纪元无预设。

### 3. 硬编码文本过时
- `NewGameWizardContent.tsx:318` — "22个时代" 应为动态数字
- `NewGameWizardContent.tsx:305,1425` — 回退到硬编码 "古代武侠"
- `subEraDefaultPresets.ts` — `contemporary_nuclear` 应为 `contemporary_nuclear_winter`

### 4. 里模式标签静态化
Settings 面板的里模式切换始终显示 "子纪元里模式"，未使用当前子纪元特有的 `liMode.name`。

### 5. 双开局场景系统冲突
`prompts/runtime/opening.ts` 硬编码到旧时代配置，`eraOpeningScene.ts` 使用新系统正确解析。

## 实施方案

### Phase 1: 配置补全（低风险）

#### 1.1 修复 preset ID 拼写错误
- 文件: `data/subEraDefaultPresets.ts`
- 将 `contemporary_nuclear` 改为 `contemporary_nuclear_winter`

#### 1.2 自动补全 全部时代配置
- 文件: `models/system.ts`
- 从 `allEraNodes`（depth===2）自动推导缺失的 17 个 `时代配置` 条目
- 利用 `resolveEraNode()` 从父节点继承 武力等级、货币模板 等字段
- 保留已有的 25 条手工配置，只补缺失的部分

#### 1.3 补全缺失的子纪元默认预设
- 文件: `data/subEraDefaultPresets.ts`
- 为 12 个无预设的子纪元添加基础预设（名称、简介、天赋列表）
- 从 `EraNode` 的 `promptVars` 和 `conflictTypes` 中推导合理默认值

### Phase 2: UI 文本动态化

#### 2.1 修复硬编码计数
- 文件: `components/features/NewGame/NewGameWizardContent.tsx:318`
- 将 "22个时代" 改为 `${时代主题方案列表.length}个时代`

#### 2.2 修复硬编码回退值
- 文件: `NewGameWizardContent.tsx:305,1425`
- 将 `|| '古代武侠'` 改为从 `allEraNodes` 中解析当前子纪元名称

#### 2.3 里模式标签动态化
- 文件: `components/features/Settings/GameSettings.tsx:487-507`
- 将静态 "子纪元里模式" 改为显示 `resolvedEra.liMode?.name || '子纪元里模式'`
- 描述文案也相应更新

### Phase 3: 系统去重

#### 3.1 统一开局场景注入
- 文件: `prompts/runtime/opening.ts`
- 移除对 `默认时代配置` 和 `内置时代配置[0]` 的依赖
- 改为调用 `eraOpeningScene.ts` 的解析逻辑，使用当前选择的 eraId
- 或直接移除 `opening.ts` 中的开局场景注入（由 `eraOpeningScene.ts` 统一处理）

### Phase 4: 验证

#### 4.1 手动验证
- 启动 dev server (`npm run dev`)
- 逐个选择 37 个子纪元，确认：
  - 新游戏向导中显示正确的时代名称和标签
  - 推荐预设正确显示
  - 设置面板中里模式标签反映当前子纪元
  - 开局场景文案与子纪元匹配

#### 4.2 编译检查
- `npm run build` 确保无类型错误

## 风险评估

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| 自动生成的时代配置字段不完整 | 低 | 利用 resolveEraNode 继承，缺省值合理 |
| 新预设不够准确 | 低 | 基础预设仅用于展示，用户可自由编辑 |
| 移除旧开局场景注入影响旧存档 | 低 | 仅影响新游戏，旧存档不受影响 |
| LiMode 某些子纪元无 liMode 定义 | 低 | 使用 `?.name || '子纪元里模式'` 安全回退 |

## 预估工作量

- Phase 1: 15 分钟（数据补全）
- Phase 2: 10 分钟（UI 文本修改）
- Phase 3: 5 分钟（系统去重）
- Phase 4: 5 分钟（验证）
- **总计: ~35 分钟**

---

**等待确认**: 是否按此方案执行？(yes / no / modify)
