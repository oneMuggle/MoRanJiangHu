# 大文件重构计划

> 创建时间: 2026-05-06
> 状态: 待审批

## 目标

找出项目中所有超过 500 行的大文件，提出具体的拆分重构方案，降低耦合度、提升可维护性。

---

## 1. 大文件清单（按行数排序）

### Tier 0: 严重（>2000 行）

| # | 文件 | 行数 | 职责 |
|---|------|------|------|
| 1 | `hooks/useGame.ts` | 2952 | 中央游戏状态管理 hook，231+ 内部函数，管理所有游戏子系统 |
| 2 | `App.tsx` | 2115 | 根组件，50+ lazy 组件声明，30+ 模态状态，大量 inline callback |

### Tier 1: 重度（1000-2000 行）

| # | 文件 | 行数 | 职责 |
|---|------|------|------|
| 3 | `hooks/useGame/systemPromptBuilder.ts` | 1733 | AI 故事生成系统提示词组装 |
| 4 | `hooks/useGame/campusNSFWEngine.ts` | 1601 | 校园 NSFW 引擎（欲望/后果/曝光/BDSM/小游戏/节日） |
| 5 | `hooks/useGame/openingStoryWorkflow.ts` | 1466 | 开局故事生成流程 |
| 6 | `hooks/useGame/stateTransforms.ts` | 1234 | 游戏状态归一化（NPC/环境/物品/装备/社交） |

### Tier 2: 显著（700-1000 行）

| # | 文件 | 行数 | 职责 |
|---|------|------|------|
| 7 | `hooks/useGame/storyState.ts` | 941 | 空白状态工厂函数 + 归一化函数 |
| 8 | `hooks/useGame/sendWorkflow/index.ts` | 899 | 故事发送流程入口 |
| 9 | `hooks/useGame/promptRuntime.ts` | 751 | Tavern 模式运行时提示词池 |
| 10 | `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` | 731 | 响应解析/变量生成/BDSM 集成/记忆写入 |
| 11 | `hooks/useGame/npcContext.ts` | 690 | NPC 图片数据提取 + 系统提示词 NPC 上下文 |
| 12 | `hooks/useGame/imagePresetWorkflow.ts` | 618 | 图片预设工作流 |

### Tier 3: 中度（500-600 行）

| # | 文件 | 行数 | 职责 |
|---|------|------|------|
| 13 | `hooks/useGame/narrativeGrammar.ts` | 584 | 叙事语法引擎 |
| 14 | `hooks/useGame/eventTrigger.ts` | 578 | 事件触发引擎 |
| 15 | `hooks/useGame/npcImageStateWorkflow.ts` | 551 | NPC 图片状态工作流 |

### Tier 4: 大型组件（>500 行，UI）

| # | 文件 | 行数 | 职责 |
|---|------|------|------|
| 16 | `components/features/Social/ImageManagerModal.tsx` | 3521 | **最大组件**：图片管理器模态 |
| 17 | `components/features/Social/mobile/MobileImageManagerModal.tsx` | 3097 | 图片管理器移动端 |
| 18 | `components/features/Settings/NovelDecompositionSettings.tsx` | 3038 | 小说分解设置 |
| 19 | `components/features/Settings/ImageGenerationSettings.tsx` | 2205 | 图片生成设置 |
| 20 | `components/features/NewGame/NewGameWizardContent.tsx` | 1809 | 新建游戏向导 |
| 21 | `components/features/NewGame/useNewGameWizardState.ts` | 1156 | 新建游戏向导状态 |
| 22 | `components/features/Settings/IntegratedModelSettings.tsx` | 1316 | AI 模型配置 |
| 23 | `components/features/Chat/InputArea.tsx` | 930 | 聊天输入区 |
| 24 | `components/features/Social/SocialModal.tsx` | 897 | 社交模态 |
| 25 | `components/features/Social/MobileSocial.tsx` | 859 | 社交移动端 |
| 26 | `components/features/Character/MobileCharacter.tsx` | 834 | 角色移动端 |
| 27 | `components/features/Settings/ApiSettings.tsx` | 780 | API 设置 |
| 28 | `components/features/Social/ImageManager/tabs/PresetsTab.tsx` | 770 | 预设标签页 |
| 29 | `components/features/Settings/StorageManager.tsx` | 704 | 存储管理 |
| 30 | `components/features/Settings/VisualSettings.tsx` | 699 | 视觉设置 |
| 31 | `components/features/Memory/MemoryModal.tsx` | 698 | 记忆模态 |
| 32 | `components/features/Character/CharacterModal.tsx` | 612 | 角色模态 |
| 33 | `components/features/Settings/GameSettings.tsx` | 611 | 游戏设置 |
| 34 | `components/layout/TopBar.tsx` | 568 | 顶部栏 |
| 35 | `components/features/Chat/MessageRenderers.tsx` | 562 | 消息渲染器 |
| 36 | `components/ui/Icons.tsx` | 557 | 图标库 |
| 37 | `components/features/Chat/TurnItem.tsx` | 536 | 回合项 |
| 38 | `components/features/Settings/TavernPresetSettings.tsx` | 535 | 酒馆预设设置 |
| 39 | `components/features/Settings/NpcManager.tsx` | 520 | NPC 管理器 |

---

## 2. 具体拆分方案

### P1: `hooks/useGame.ts` (2952 → ~600 行) | 复杂度: 高

**提取方案：**

| 新文件 | 提取内容 | 预估行数 |
|--------|----------|----------|
| `hooks/useGame/tradeAndTravel.ts` | 旅行/交易相关 state 和 handler | ~150 |
| `hooks/useGame/deviceSubsystem.ts` | 设备系统全部 state 和操作 | ~200 |
| `hooks/useGame/memoryManagement.ts` | 记忆总结任务/队列/NPC 记忆 | ~250 |
| `hooks/useGame/imageGenerationState.ts` | 图片生成队列/状态/懒加载 | ~300 |
| `hooks/useGame/worldEvolutionState.ts` | 世界演变状态/refs | ~200 |
| `hooks/useGame/callbacks.ts` | return 对象组装 | ~400 |

### P2: `App.tsx` (2115 → ~300 行) | 复杂度: 高

**提取方案：**

| 新文件 | 提取内容 | 预估行数 |
|--------|----------|----------|
| `components/app/ModalOrchestrator.tsx` | 模态状态 + 开关 handlers | ~200 |
| `components/app/useAppCallbacks.ts` | inline callbacks 提取为 hook | ~350 |
| `components/app/DesktopLayout.tsx` | 桌面端布局 JSX | ~400 |
| `components/app/MobileLayout.tsx` | 移动端布局 JSX | ~350 |
| `components/app/LazyComponents.ts` | 50+ lazy 组件声明 | ~80 |

### P3: `hooks/useGame/systemPromptBuilder.ts` (1733 → ~200 行) | 复杂度: 高

**提取方案：**

| 新文件 | 提取内容 |
|--------|----------|
| `hooks/useGame/promptAssembly/characterContext.ts` | 角色卡片、身份、人设 |
| `hooks/useGame/promptAssembly/worldContext.ts` | 世界状态、环境、地图建筑 |
| `hooks/useGame/promptAssembly/npcContextAssembly.ts` | NPC 上下文（在场/不在场、NSFW 卡片） |
| `hooks/useGame/promptAssembly/memoryContext.ts` | 长/中期记忆组装 |
| `hooks/useGame/promptAssembly/protocolDirectives.ts` | 输出协议、字数、免责声明、COT |
| `hooks/useGame/promptAssembly/fandomContext.ts` | 境界/修炼体系、同人摘要 |

### P4: `hooks/useGame/campusNSFWEngine.ts` (1601 → ~200 行) | 复杂度: 中

**提取方案：**

| 新文件 | 提取内容 |
|--------|----------|
| `hooks/useGame/campusNSFW/desireStateMachine.ts` | 欲望状态机、关系轨道、亲密里程碑 |
| `hooks/useGame/campusNSFW/consequenceSystem.ts` | 后果记录/应用/回滚 |
| `hooks/useGame/campusNSFW/exposureSystem.ts` | 曝光状态、旁观者反应 |
| `hooks/useGame/campusNSFW/bdsmSystem.ts` | BDSM 关系追踪、契约、阶段推进 |
| `hooks/useGame/campusNSFW/boardGameSystem.ts` | 小游戏状态/机制 |
| `hooks/useGame/campusNSFW/festivalSystem.ts` | 校园节日系统 |
| `hooks/useGame/campusNSFW/types.ts` | 统一类型导出 |

### P5: `hooks/useGame/openingStoryWorkflow.ts` (1466 → ~200 行) | 复杂度: 中

**提取方案：**

| 新文件 | 提取内容 |
|--------|----------|
| `hooks/useGame/opening/worldEvolutionInit.ts` | 开局世界演变初始化 |
| `hooks/useGame/opening/variableGenerationInit.ts` | 开局变量生成初始化 |
| `hooks/useGame/opening/planningInit.ts` | 开局规划初始化 |
| `hooks/useGame/opening/storyGeneration.ts` | 故事生成管线（流式/非流式） |

### P6: `hooks/useGame/stateTransforms.ts` (1234 → ~300 行) | 复杂度: 中

**提取方案：**

| 新文件 | 提取内容 |
|--------|----------|
| `hooks/useGame/transforms/npcNormalization.ts` | NPC 归一化 + 去重合并 (~600) |
| `hooks/useGame/transforms/environmentNormalization.ts` | 环境归一化 |
| `hooks/useGame/transforms/itemContainerMapping.ts` | 物品容器映射 |
| `hooks/useGame/transforms/socialListNormalization.ts` | 社交列表归一化 |

### P7: `hooks/useGame/storyState.ts` (941 → ~200 行) | 复杂度: 低

**提取方案：**

| 新文件 | 提取内容 |
|--------|----------|
| `hooks/useGame/state/factoryFunctions.ts` | 空白状态工厂函数 |
| `hooks/useGame/state/normalizationFunctions.ts` | 各类型归一化函数 |
| `hooks/useGame/state/historyUtils.ts` | 历史裁剪/战斗清空 |

### P8: 组件拆分（3000+ 行）| 复杂度: 高

**ImageManagerModal.tsx (3521 行)：**

| 新文件 | 提取内容 |
|--------|----------|
| `hooks/useImageManagerModalState.ts` | 100+ state 声明提取为 hook |
| `ImageManagerModal/TabsSection.tsx` | 6 个标签页内容 |
| `ImageManagerModal/Overlays.tsx` | 图片查看器/手动确认/提示词展示 |
| `ImageManagerModal/FilterSection.tsx` | 筛选/搜索栏 |

**NovelDecompositionSettings.tsx (3038 行)：**

已有 `@todo-replace` 注释，按计划拆分为：
- `ApiConfigPanel.tsx` / `InjectionPanel.tsx` / `PreviewPanel.tsx` / `ImportExportPanel.tsx` / `SchedulerPanel.tsx` / `SplitPanel.tsx` / `DatasetManagerPanel.tsx`

**其他大型组件：**

每个设置类组件按 tab/panel 拆分子文件：
- `ImageGenerationSettings.tsx` → `ModelPanel.tsx` / `ArtistPanel.tsx` / `AutomationPanel.tsx`
- `IntegratedModelSettings.tsx` → 每个子配置一个 Panel
- `NewGameWizardContent.tsx` → `CharacterCreation.tsx` / `WorldConfig.tsx` / `EraSelection.tsx` / `OpeningConfig.tsx`

---

## 3. 优先级排序

| 优先级 | 阶段 | 文件 | 原因 |
|--------|------|------|------|
| 1 | Phase 1 | campusNSFWEngine.ts | 独立领域，低风险，可并行 |
| 2 | Phase 1 | stateTransforms.ts | 纯函数，无副作用，易测试 |
| 3 | Phase 1 | storyState.ts | 工厂函数天然可分离 |
| 4 | Phase 1 | narrativeGrammar.ts | 独立语法解析拆分 |
| 5 | Phase 1 | eventTrigger.ts | 触发检查与生命周期分离 |
| 6 | Phase 2 | openingStoryWorkflow.ts | 子阶段清晰 |
| 7 | Phase 2 | systemPromptBuilder.ts | 最多被引用，拆分后解锁提示词相关开发 |
| 8 | Phase 2 | promptRuntime.ts | 酒馆模式逻辑自包含 |
| 9 | Phase 2 | responseProcessingPhase.ts | 子阶段提取 |
| 10 | Phase 2 | npcContext.ts | 两个清晰职责 |
| 11 | Phase 3 | 大型组件 (ImageManagerModal 等) | UI tab/panel 边界清晰 |
| 12 | Phase 4 | App.tsx | 依赖 hook API 稳定 |
| 13 | Phase 4 | hooks/useGame.ts | **最后做**，依赖所有子模块稳定 |

---

## 4. 阶段依赖关系

```
Phase 1 (可并行):
  ├── campusNSFWEngine.ts → campusNSFW/
  ├── stateTransforms.ts → transforms/
  ├── storyState.ts → state/
  ├── narrativeGrammar.ts (独立拆分)
  └── eventTrigger.ts (独立拆分)

Phase 2 (依赖 Phase 1 稳定):
  ├── openingStoryWorkflow.ts → opening/
  ├── systemPromptBuilder.ts → promptAssembly/
  ├── promptRuntime.ts → promptRuntime/
  ├── responseProcessingPhase.ts 子提取
  └── npcContext.ts 拆分

Phase 3 (组件重构，与 hook 并行):
  ├── ImageManagerModal.tsx → ImageManagerModal/
  ├── NovelDecompositionSettings.tsx → NovelDecompositionSettings/
  ├── ImageGenerationSettings.tsx → ImageGenerationSettings/
  ├── IntegratedModelSettings.tsx 子面板
  ├── NewGameWizardContent.tsx 子区域
  └── useNewGameWizardState.ts 子 hook

Phase 4 (最终，依赖 Phase 1-3):
  ├── App.tsx → app/ (需稳定 hook API)
  └── hooks/useGame.ts → 子 hook (需所有 Phase 1-2 模块稳定)
```

---

## 5. 风险评估

| 风险等级 | 文件 | 说明 |
|----------|------|------|
| **高** | `hooks/useGame.ts` | 200+ action 方法暴露给外部，提取需保证接口不变 |
| **高** | `App.tsx` | callback 签名变化会导致所有模态运行时错误 |
| **中** | `systemPromptBuilder.ts` | 返回结构变化影响 sendWorkflow，需保持类型一致 |
| **中** | `openingStoryWorkflow.ts` | 影响新游戏流程，高可见性但边界清晰 |
| **低** | `storyState.ts` | 纯工厂函数，零副作用 |
| **低** | `stateTransforms.ts` | 纯归一化函数 |
| **低** | 设置面板组件 | 纯 UI，不影响游戏逻辑 |

---

## 6. 实施步骤

- [ ] Phase 1: 独立模块拆分（5 个文件）
- [ ] Phase 2: 提示词/工作流模块拆分（5 个文件）
- [ ] Phase 3: 大型组件拆分（6+ 个组件）
- [ ] Phase 4: 核心骨架精简（App.tsx + useGame.ts）

---

## 实施进度

> 每完成一个阶段后在此标注 `[x]` 并记录实际产出的文件和行数变化。

### Phase 1: 独立模块拆分

- [x] **campusNSFWEngine.ts** (1601 → 81 行 re-export)
  - 拆分为 `campusNSFW/` 子目录，7 个模块 + 1 个 barrel + 1 个 re-export 入口
  - 文件：constants.ts(90), desireStateMachine.ts(110), exposureSystem.ts(115), bdsmSystem.ts(90), boardGameSystem.ts(75), festivalSystem.ts(145), factoryFunctions.ts(77), convenienceFunctions.ts(42), forumIntegration.ts(23), bdsmTaskEngine.ts(38), index.ts(81)
  - 总代码行数：~886 行（原 1601 行，减少 44%）
  - TypeScript 编译：零新增错误

- [x] **stateTransforms.ts** (1234 → 8 行 re-export)
  - 拆分为 `transforms/` 子目录，4 个模块
  - 文件：environmentNormalization.ts(92), itemContainerMapping.ts(320), npcNormalization.ts(494), socialListNormalization.ts(8)
  - 总代码行数：~914 行（原 1234 行，减少 26%）
  - TypeScript 编译：零新增错误

- [x] **storyState.ts** (941 → 20 行 re-export)
  - 拆分为 `state/` 子目录，3 个模块
  - 文件：factories.ts(221), planningNormalizers.ts(142), historyUtils.ts(101)
  - 总代码行数：~464 行（原 941 行，减少 51%）
  - TypeScript 编译：零新增错误

- [x] **narrativeGrammar.ts** (585 → 6 行 re-export)
  - 拆分为 `narrativeGrammar/` 子目录，4 个模块
  - 文件：parsers.ts(提取/解析), extractors.ts(提取), validators.ts(验证), normalizers.ts(规范化)
  - TypeScript 编译：零新增错误

- [x] **eventTrigger.ts** (579 → 8 行 re-export)
  - 拆分为 `eventTrigger/` 子目录，6 个模块
  - 文件：core.ts(核心), promptAndParse.ts(提示词与解析), stateManagement.ts(状态管理), factories.ts(工厂), v2Enhanced.ts(增强), utilities.ts(工具)
  - TypeScript 编译：零新增错误（eventTrigger.test.ts 缺少 Jest 类型为已有问题）

### Phase 1 补充：Barrel 文件补全 (2026-05-07)

- [x] **transforms/index.ts** (新增 barrel 文件)
  - 为 transforms/ 子目录创建统一导出文件
  - TypeScript 编译：零新增错误

- [x] **state/index.ts** (新增 barrel 文件)
  - 为 state/ 子目录创建统一导出文件，包含 factories, planningNormalizers, historyUtils
  - TypeScript 编译：零新增错误

### Phase 2: 提示词/工作流模块拆分（5 个文件）- 进行中

**已完成：**
- [x] **npcContext.ts** (690 → 3 行 re-export)
  - 拆分为 `npcContext/` 子目录，3 个模块
  - 文件：contextBuilder.ts(26303), imageDataExtraction.ts(6353), index.ts(292)

**待完成（难度高，需谨慎拆分）：**
- [ ] **systemPromptBuilder.ts** (1733 行) - 最多被引用，拆分后解锁提示词相关开发
- [ ] **openingStoryWorkflow.ts** (1466 行) - 子阶段清晰，可按阶段拆分
- [ ] **promptRuntime.ts** (751 行) - 酒馆模式逻辑，可与 systemPromptBuilder 协同拆分
- [ ] **sendWorkflow/responseProcessingPhase.ts** (731 行) - 子阶段提取

**目录已创建待填充：**
- [ ] `hooks/useGame/opening/` - 开局工作流子模块
- [ ] `hooks/useGame/promptAssembly/` - 系统提示词组装子模块
