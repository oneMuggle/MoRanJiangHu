# 里模式强化深化与体系化方案

**日期：** 2026-05-03
**状态：** 实施中
**优先级：** 高

---

## Context

里模式（liMode）系统已完成基础架构（类型定义、三级强度、UI 选择器、prompt 注入），但实际可用的仅校园（campus）一个子纪元的增强版数据。其余 31 个子纪元仍使用旧版纯文本 `rules` 格式，导致强度选择器对所有非校园纪元形同虚设，角色表里人格绑定未接入 NPC 生成，设备工作流强度参数未传递，且存在 legacy 里武侠/里志怪双轨运行机制。

本方案从**数据完善、运行时绑定、玩法融合、UI 体系**四个维度进行体系化升级。

---

## Phase 1: 数据体系化 — 全量子纪元增强版转换

**目标**：31 个旧格式 SubEra 全部升级为 `EraLiModeEnhanced` 结构化定义

### 1.1 核心纪元优先转换（P0）

| 子纪元 ID | 里模式名称 | 核心主题 |
|-----------|-----------|---------|
| `ancient_eastern_wuxia` | 里武侠 | 江湖秘事、门派暗流 |
| `ancient_eastern_zhiguai` | 里志怪 | 妖鬼情债、阴阳双修 |
| `ancient_eastern_xianxia` | 里修仙 | 炉鼎双修、秘境采补 |
| `contemporary_urban` | 里都市 | 职场秘事、霓虹暗欲 |
| `contemporary_post_apocalyptic` | 里废土 | 生存交易、废土欲望 |
| `contemporary_hippie` | 里嬉皮 | 摇滚放纵、自由公社 |

### 1.2 次优先级纪元转换（P1）

古代神话、权谋、古希腊/罗马、中世纪欧洲、维京、凯尔特、民国风云、明治大正、晚清、维多利亚、爵士时代、赛博朋克、星际科幻等。

### 1.3 其余纪元转换（P2）

战后重建、乡村、丧尸危机、各类末日、反乌托邦、太空殖民、赛博格、虚拟现实、后人类等。

### 1.4 每个增强版 liMode 必须包含的字段

| 字段 | 说明 | 最低要求 |
|------|------|---------|
| `name` | 里模式名称 | 必填 |
| `description` | 一句话描述 | 必填 |
| `corePrinciple` | 核心原理（表里两面的哲学基础） | 必填 |
| `powerSystem` | 权力/等级体系 | 必填 |
| `dualPersonalities` | 角色表里人格（至少 4 组） | 必填 |
| `sceneTypes` | 亲密场景类型（至少 4 种） | 必填 |
| `desireMotives` | 欲望动机（至少 4 条） | 必填 |
| `taboos` | 禁忌与边界（至少 3 条） | 必填 |
| `aiDirectives` | AI 指令（至少 4 条） | 必填 |
| `intensityLevels` | 三级强度定义 | 必填 |

---

## Phase 2: 运行时绑定 — 角色原型 → NPC 生成

**目标**：将 `EraCharacterArchetype` 的 `表人格`/`里人格` 字段接入 NPC 生成链路

### 2.1 NPC 档案注入

在系统提示词构建中，当里模式开启时，将当前 SubEra 的 `characterArchetypes` 表里人格信息注入到 NPC 生成规则中，使 AI 生成 NPC 时自动参考当前时代的表里人格模板。

### 2.2 设备工作流强度修复

`deviceAiWorkflow.ts` 和 `mobileDeviceWorkflow.ts` 中 `liIntensity` 参数已定义但调用方未传递。需要：
- 在 `生成设备消息` 等处从 gameConfig 读取强度并传入
- 确保设备生成内容（短信、社交帖子等）也受强度级别影响

### 2.3 Legacy 里武侠/里志怪清理

当前 `systemPromptBuilder.ts` 中同时存在：
- 子纪元 liMode 注入（新路径）
- 里武侠/里志怪 legacy 注入（旧路径，通过 `启用里武侠模式`/`启用里志怪模式` 开关）

当子纪元 liMode 已注入时自动跳过 legacy 版本（已有逻辑），但双开关并存造成配置混乱。建议：
- 保留 legacy 注入作为无 liMode SubEra 时代的 fallback
- 在 UI 上标注"随时代自动定义"，隐藏 legacy 开关

---

## Phase 3: 玩法融合 — 里模式从 prompt 到 gameplay

**目标**：里模式不只是 prompt 注入，而是影响实际游戏机制

### 3.1 NPC 表里切换机制

在 `角色` 或 `社交` 数据结构中增加可选字段：
- `里人格激活条件` — 好感度阈值、特定事件触发、时间/地点条件
- `当前人格状态` — `表` / `里` / `半觉醒`

当里模式开启且条件满足时，NPC 展现里人格，影响：
- 对话风格转变
- 可触发特殊事件
- 好感度突破路径变化

### 3.2 里模式专属事件池

为有增强版 liMode 的 SubEra 定义专属事件类型：
- 事件带有 `里模式专属: true` 标记
- 仅在里模式开启且强度达到阈值时触发
- 事件内容引用 `sceneTypes` 和 `desireMotives`

### 3.3 强度动态调节

里模式强度不应仅是开局设置，游戏中也可动态调整：
- 设置面板中增加里模式强度切换
- 某些事件/剧情可临时提升或降低强度
- 强度变化写入 `gameConfig.子纪元里模式强度[eraId]`

---

## Phase 4: UI 体系化

### 4.1 强度选择器适配所有时代

当前强度选择器只在 `有里模式数据` 时展示（即 SubEra 有 liMode 字段）。Phase 1 完成后所有 SubEra 都有 liMode，选择器自动生效。

### 4.2 设置面板同步

`components/features/Settings/GameSettings.tsx` 中增加里模式强度设置，让已存档游戏也能调整强度。

### 4.3 游戏内状态提示

在游戏界面中（如顶部状态栏或右侧栏），当里模式开启时以 subtle 方式提示当前状态：
- 小图标或文字标记"里模式：暧昧"
- 点击可快速切换强度

---

## 实施顺序与依赖

```
Phase 1（数据转换）
  ├── 1.1 P0 核心纪元（6个）
  ├── 1.2 P1 次优先级（~10个）
  └── 1.3 P2 其余（~15个）
        ↓
Phase 2（运行时绑定）── 可在 Phase 1.1 完成后并行开始
  ├── 2.1 NPC 档案注入
  ├── 2.2 设备工作流修复
  └── 2.3 Legacy 清理
        ↓
Phase 3（玩法融合）── 需要 Phase 1 + 2 完成
  ├── 3.1 NPC 表里切换
  ├── 3.2 里模式事件池
  └── 3.3 强度动态调节
        ↓
Phase 4（UI 体系）── 可与 Phase 3 并行
  ├── 4.1 全时代强度选择
  ├── 4.2 设置面板同步
  └── 4.3 游戏内状态提示
```

## 涉及核心文件

| 文件 | 涉及阶段 | 修改内容 |
|------|---------|---------|
| `models/eraTheme/epoch-*.ts` | Phase 1 | 31 个 SubEra liMode 增强版转换 |
| `models/eraTheme/types.ts` | Phase 3 | NPC 表里状态字段扩展 |
| `prompts/runtime/eraLiMode.ts` | Phase 2 | 强度过滤逻辑优化 |
| `hooks/useGame/systemPromptBuilder.ts` | Phase 2 | NPC 原型注入 + Legacy 清理 |
| `hooks/useGame/deviceAiWorkflow.ts` | Phase 2 | 强度参数传递修复 |
| `hooks/useGame/mobileDeviceWorkflow.ts` | Phase 2 | 强度参数传递修复 |
| `components/features/NewGame/NewGameWizardContent.tsx` | Phase 4 | UI 适配 |
| `components/features/Settings/GameSettings.tsx` | Phase 4 | 设置面板新增 |
| `models/system.ts` | Phase 3 | 游戏设置结构扩展 |
| `utils/gameSettings.ts` | Phase 2 | Legacy 规范化清理 |

## 风险评估

| 风险 | 等级 | 应对 |
|------|------|------|
| Phase 1 数据量大，31 个 SubEra 逐一编写质量难保证 | 高 | 分批交付，P0 先上线验证效果，P1/P2 逐步补齐 |
| 表里人格注入可能影响现有 NPC 生成稳定性 | 中 | 仅在里模式开启时激活，不影响默认行为 |
| Legacy 清理可能影响旧存档兼容性 | 中 | 保留 fallback 逻辑，渐进式迁移 |
| Phase 3 玩法融合涉及数据结构变更 | 高 | 所有新增字段 optional，向后兼容 |

## 预计工作量

| 阶段 | 工作量 | 说明 |
|------|--------|------|
| Phase 1.1 | 高 | 6 个核心 SubEra 增强版编写，每个需精心设计 |
| Phase 1.2 | 中 | ~10 个，可复用 Phase 1.1 模式 |
| Phase 1.3 | 低 | ~15 个，部分可批量处理 |
| Phase 2 | 中 | 运行时绑定 + 设备修复 + Legacy 清理 |
| Phase 3 | 高 | NPC 表里切换 + 事件池 + 动态强度 |
| Phase 4 | 低 | UI 适配 + 设置面板 |

---

## 实施进度

- [x] 方案设计
- [x] Phase 1.1：P0 核心纪元转换（6 个全部完成）
  - [x] 里武侠 (ancient_eastern_wuxia)
  - [x] 里志怪 (ancient_eastern_zhiguai)
  - [x] 里修仙 (ancient_eastern_xianxia)
  - [x] 里都市 (contemporary_urban)
  - [x] 里废土 (contemporary_post_apocalyptic)
  - [x] 里校园 (contemporary_campus) — 原本即为增强版
- [x] Phase 1.2：P1 次优先级纪元转换（15 个完成）
  - [x] epoch-modern.ts：里谍战、里暗谍、里晚清、里维多利亚、里爵士、里战后
  - [x] epoch-near-future.ts：里赛博、里反乌托邦、里星际拓荒
  - [x] epoch-far-future.ts：里星际帝国、里赛博格、里虚拟
  - [x] epoch-post-human.ts：里超验、里维度、里数学
  - [x] epoch-primordial.ts：里图腾、里血祭、里萨满
- [x] Phase 1.3：P2 其余纪元转换（14 个全部完成）
  - [x] epoch-ancient.ts：里神话、里宫廷、里奥林匹斯、里罗马、里中世纪、里维京、里凯尔特
  - [x] epoch-contemporary.ts：里乡土、里黑色、里嬉皮、里尸变、里冰封、里疫病、里辐射
- [x] Phase 1 总结：全部 31 个 SubEra liMode 增强版转换完成
- [x] Phase 2：运行时绑定
  - [x] 2.1 NPC 原型表里人格注入（`构建里模式NPC原型注入` + `systemPromptBuilder` 接入）
  - [x] 2.2 设备工作流强度参数修复（`triggerDeviceMessageWorkflow` → `deviceAiWorkflow` 全链路传递）
  - [x] 2.3 Legacy 里武侠/里志怪清理（已有 fallback 逻辑，增强版注入后自动跳过 legacy）
- [x] Phase 3：玩法融合
  - [x] 3.1 NPC 表里切换（`models/social.ts` 字段 + `eraLiMode.ts` 注入函数 + `npcContext.ts` 集成）
  - [x] 3.2 里模式事件池（`filterByIntensity` 暧昧/露骨级别追加事件引导区块）
  - [x] 3.3 强度动态调节（`GameSettings.tsx` 三档强度选择器 + `systemPromptBuilder.ts` 已传递强度参数）
- [x] Phase 4：UI 体系化
  - [x] 4.1 全时代强度选择器（Phase 1 完成后所有 SubEra 都有 liMode，选择器自动生效）
  - [x] 4.2 设置面板同步（`GameSettings.tsx` 里模式强度三档选择器）
  - [ ] 4.3 游戏内状态提示（可选，TopBar 已较密集，暂不添加）
