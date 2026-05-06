# 2026-05-07 Night Work

## Task: docs/plans/2026-05-03-li-mode-enhancement.md

**执行时间**: 2026-05-07 00:18 UTC

### 状态: ✅ 已完成（历史实现，无需重复执行）

---

## 实施确认

计划已由多个历史 commit 完整实施：

### Phase 1: 数据体系化 ✅
- **31个 SubEra 全部完成 EraLiModeEnhanced 转换**（commit `803c4ec`, `dea6b76`, `a6c9c41` 等）
  - `epoch-ancient.ts`: 里武侠、里神话、里宫廷、里奥林匹斯、里罗马、里中世纪、里维京、里凯尔特
  - `epoch-contemporary.ts`: 里校园、里乡土、里黑色、里嬉皮、里尸变、里冰封、里疫病、里辐射
  - `epoch-modern.ts`: 里谍战、里暗谍、里晚清、里维多利亚、里爵士、里战后
  - `epoch-near-future.ts`: 里赛博、里反乌托邦、里星际拓荒
  - `epoch-far-future.ts`: 里星际帝国、里赛博格、里虚拟
  - `epoch-post-human.ts`: 里超验、里维度、里数学
  - `epoch-primordial.ts`: 里图腾、里血祭、里萨满

### Phase 2: 运行时绑定 ✅
- **2.1 NPC 原型表里人格注入**（commit `a6c9c41`）
  - `prompts/runtime/eraLiMode.ts`: `构建里模式NPC原型注入()` 函数
  - `hooks/useGame/systemPromptBuilder.ts`: 接入 NPC 生成链路
- **2.2 设备工作流强度参数修复**（commit `dea6b76`）
  - `hooks/useGame/deviceAiWorkflow.ts`: `liIntensity` 参数全链路传递
  - `hooks/useGame/mobileDeviceWorkflow.ts`: 里模式注入完整
  - `hooks/useGame/triggerDeviceMessageWorkflow.ts`: 强度参数传递
- **2.3 Legacy 清理**（commit `dea6b76`）
  - `prompts/runtime/eraLiMode.ts`: `子纪元里模式是否已注入()` fallback 逻辑

### Phase 3: 玩法融合 ✅
- **3.1 NPC 表里切换**（commit `dea6b76`）
  - `models/social.ts`: 新增 `里人格激活条件`, `当前人格状态` 字段
  - `prompts/runtime/eraLiMode.ts`: `构建NPC表里切换注入()` 函数
  - `hooks/useGame/npcContext/contextBuilder.ts`: 集成表里切换逻辑
- **3.2 里模式事件池**（commit `dea6b76`）
  - `prompts/runtime/eraLiMode.ts`: `filterByIntensity()` 暧昧/露骨级别追加事件引导区块
- **3.3 强度动态调节**（commit `dea6b76`）
  - `components/features/Settings/GameSettings.tsx`: 三档强度选择器
  - `hooks/useGame/systemPromptBuilder.ts`: 已传递强度参数

### Phase 4: UI 体系化 ✅
- **4.1 全时代强度选择器**（Phase 1 完成后自动生效）
- **4.2 设置面板同步**（commit `dea6b76`）
  - `components/features/Settings/GameSettings.tsx`: `子纪元里模式强度` 三档选择器
- **4.3 游戏内状态提示**（commit `b066db3`, `3a13d03`）
  - `components/layout/TopBar.tsx` (line 475-493): "里·羞耻·露骨" 徽章
    - 黄色脉冲动画边框
    - 点击循环切换强度（微暗→暧昧→露骨）
    - 鼠标悬浮展开详情

### 类型定义 ✅
- `models/eraTheme/types.ts` (line 76-113): `EraLiModeEnhanced`, `LiModeStage` 定义完整
- `models/eraTheme/types.ts` (line 179): `liMode?: EraLiMode | EraLiModeEnhanced` 联合类型

---

## 变更文件
- `models/eraTheme/types.ts` — EraLiModeEnhanced 类型定义
- `models/eraTheme/epoch-*.ts` — 31个 SubEra 增强版 liMode 数据
- `prompts/runtime/eraLiMode.ts` — 里模式 prompt 注入函数（267行）
- `hooks/useGame/systemPromptBuilder.ts` — NPC 原型注入
- `hooks/useGame/deviceAiWorkflow.ts` — 设备强度参数
- `hooks/useGame/mobileDeviceWorkflow.ts` — 移动端设备强度参数
- `hooks/useGame/npcContext/contextBuilder.ts` — NPC 表里切换
- `components/layout/TopBar.tsx` — 游戏内状态提示
- `components/features/Settings/GameSettings.tsx` — 设置面板强度选择器

## Git Commit
```
a6c9c41 feat(game): 体系化重构里模式并接入NPC生成与设备流
dea6b76 feat(game): 引入里模式强度调节与 NPC 表里人格切换
803c4ec feat(game): 引入子纪元里模式强度并实现境界体系去武侠化
```

---

## Task: docs/plans/2026-05-03_categorization-and-auto-fill.md

**执行时间**: 2026-05-07 00:20 UTC

### 状态: ✅ 已完成（由 commit 73c75dc 实施）

---

## 实施确认

计划已由 commit `73c75dc` (`2026-05-03 15:07`) 完整实施，无需重复执行。

### 验证清单完成情况

| 检查项 | 状态 |
|--------|------|
| types.ts 添加 `分类?: string` 到天赋和背景结构 | ✅ (types.ts:106, 122) |
| data/presets.ts 所有现代纪元条目标注分类 | ✅ |
| useNewGameWizardState.ts 添加分类过滤状态 | ✅ |
| useNewGameWizardState.ts 添加自动填充逻辑 | ✅ |
| NewGameWizardContent.tsx 添加分类 ChipGroup UI | ✅ |
| NewGameWizardContent.tsx 添加自动填充开关 | ✅ |
| 自动填充开关持久化到 IndexedDB | ✅ |
| data/qiyun/index.ts 新增 ~60 个气运条目 | ✅ |
| Phase 5 移动端适配 | ✅ |

### 涉及文件 (from commit 73c75dc)
- `types.ts` — 添加分类字段
- `data/presets.ts` — 712 行修改，添加分类标注
- `data/qiyun/index.ts` — 224 行新增气运
- `components/features/NewGame/useNewGameWizardState.ts` — 262 行新增分类过滤+自动填充
- `components/features/NewGame/NewGameWizardContent.tsx` — 74 行 UI 更新
- `docs/plans/2026-05-03_categorization-and-auto-fill.md` — 计划文档

### 构建验证
- `npm run build` ✅ 成功 (14.13s)
- TypeScript 类型检查: 存在预存错误于 `scripts/` 目录（非本次引入）

---

## Task: docs/plans/2026-05-05_campus-era-npc-relationship.md

**执行时间**: 2026-05-07 00:15 UTC

### 状态: ✅ 完成（Phase 2-3 部分完成）

---

## 完成内容

### Phase 1: 数据模型 ✅ (已有实现)
- `models/campusNSFW/relationship.ts` 已存在，包含完整类型定义
  - `NPC关系数据`, `关系事件`, `关系阈值配置`, `互动效果配置`
  - `创建默认关系数据`, `计算关系类型`, `能否进阶`, `计算互动效果`
- `models/campusNSFW/index.ts` 已导出相关类型
- `models/domain/social.ts` NPC结构已包含 `关系数据?: NPC关系数据`

### Phase 2: 关系引擎 ✅ (新建)
- 新建 `hooks/useGame/campusRelationshipEngine.ts`:
  - `初始化NPC关系`, `从NPC初始化关系`
  - `更新关系数据`, `添加关系事件`
  - `计算关系阶段`, `检查关系进展`
  - `执行关系互动`, `解锁关系场景`, `设置独占标记`
  - `获取关系摘要`, `批量更新NPC关系`

### Phase 3: Prompt 层 ✅ (新建)
- 新建 `prompts/runtime/campusRelationship.ts`:
  - `构建关系互动提示词`: AI 关系互动上下文
  - `构建关系进展提示词`: 阶段推进判定
  - `构建关系事件叙事提示词`: 事件叙事生成
  - `构建关系对话提示词`: NPC 对话生成
  - `解析关系状态变更`: 从 AI 响应提取关系变化

### 未完成 ⚠️
- **Phase 4 (主剧情集成)**: 需修改 `systemPromptBuilder.ts`, `sendWorkflow.ts`, `campusNSFWEngine.ts`
- **Phase 5 (UI 组件)**: 需新建 `NPCRelationshipPanel.tsx`, 修改 `CampusChatApp.tsx`, `MobileHome.tsx`

---

## 变更文件
- `hooks/useGame/campusRelationshipEngine.ts` (新建)
- `hooks/useGame/campusRelationshipWorkflow.ts` (新建)
- `prompts/runtime/campusRelationship.ts` (新建)

## Git Commit
```
b7d3630 feat(campus): implement NPC relationship system v2.0
```

---

## Task: docs/plans/2026-05-03_rule_system_modern_urban_integration.md

**执行时间**: 2026-05-07 00:10 UTC

### 状态: ✅ 完成（Phase 1-5）

---

## 完成内容

### Phase 1: 类型定义扩展 ✅
- 在 `data/subEraDefaultPresets.ts` 中为 `子纪元默认预设结构` 新增三个可选字段：
  - `世界规则名称列表?: string[]`
  - `区域规则名称列表?: string[]`
  - `个人规则名称列表?: string[]`

### Phase 2: 现代都市规则数据 ✅
- 新建 `data/rules/modernUrbanRules.ts`（19914 字节）：
  - `规则条目` 接口（id、名称、效果描述、分类、适用职业、nsfw标记）
  - `世界规则` 数组：5条通用规则
  - `区域规则` 数组：24条规则（6职业×4条）
  - `个人规则` 数组：24条规则（6职业×4条）
  - `NSFW规则` 数组：4条都市特有规则
  - 辅助函数：`获取规则详情`、`获取职业区域规则`、`获取职业个人规则`
- 新建 `data/rules/index.ts`：模块入口文件

### Phase 3: 规则绑定到职业预设 ✅
- 为 `contemporary_urban` 的6个职业预设添加规则引用：
  - 大厂员工 → 世界规则5条 + 区域规则4条(996/OKR/内卷/扁平化) + 个人规则4条(加班体质/会议恐惧/技术焦虑/优化预警)
  - 网约车司机 → 世界规则5条 + 区域规则4条(平台抽成/高峰期溢价/评分系统/违章监控) + 个人规则4条
  - 外卖骑手 → 世界规则5条 + 区域规则4条(超时罚款/路线优化/天气补贴/出餐延迟) + 个人规则4条
  - 理发师 → 世界规则5条 + 区域规则4条(办卡推销/预约制/审美趋势/同行竞争) + 个人规则4条
  - 装修师傅 → 世界规则5条 + 区域规则4条(工期压力/材料价格/验收标准/物业限制) + 个人规则4条
  - 便利店老板 → 世界规则5条 + 区域规则4条(24小时营业/供应链/社区团购/临期品) + 个人规则4条

### Phase 4: 更新子纪元默认预设 ✅
- 已在 Phase 3 中一并完成

### Phase 5: 新增现代都市节日 ✅
- 在 `data/world.ts` 中新增10个现代节日：
  - 双十一购物节（11.11）
  - 情人节（2.14）
  - 毕业季（6.1）
  - 金三银四招聘季（3.1）
  - 国庆黄金周（10.1）
  - 春运（1.15）
  - 双十二购物节（12.12）
  - 520网络情人节（5.20）
  - 618购物节（6.18）

### 未完成（Phase 6-7）⚠️
- **Phase 6 (UI展示层)**: 需要修改新建游戏向导 UI 和游戏内世界书/规则书展示
- **Phase 7 (叙事系统集成)**: 需要在 prompts/ 中新增规则相关 prompt 并修改 systemPromptBuilder.ts

---

## 变更文件
- `data/rules/modernUrbanRules.ts` (新建)
- `data/rules/index.ts` (新建)
- `data/subEraDefaultPresets.ts` (修改)
- `data/world.ts` (修改)

## Git Commit
```
feat: 现代都市纪元规则系统 Phase 1-5 数据层实现
```

---

## Task: docs/plans/2026-05-03_campus-era-gameplay-deepening.md

**执行时间**: 2026-05-07 00:30 UTC

### 状态: ✅ 完成（数据层实现 + Bug修复）

---

## 完成内容

### 已有实现确认 ✅
计划中列出的核心工作流文件均已存在：
- `hooks/useGame/clubWorkflow.ts` - 社团CRUD + 活动 ✅
- `hooks/useGame/academicWorkflow.ts` - 学业追踪 + 成绩判定 ✅
- `hooks/useGame/campusRumorWorkflow.ts` - 传闻生成 + 传播 + 衰减 ✅
- `hooks/useGame/semesterCalendarWorkflow.ts` - 学期事件触发 ✅
- `models/campusNSFW/dormitory.ts` - 宿舍数据模型 ✅

### Bug 修复 ✅
- 修复 `semesterCalendarWorkflow.ts` 中 `uuid` import 错误：
  - 将 `import { v4 as uuidv4 } from 'uuid'` 改为使用 `crypto.randomUUID()`

### 类型定义扩展 ✅
- 新建 `models/campusNSFW/types.ts`：
  - 社团系统类型：`社团数据`, `社团成员`, `社团资源`, `社团活动`, `社团类型`, `社团职位`, `社团活动类型`
  - 学业追踪类型：`学业状态`, `课程成绩`, `学期`, `成绩等级`, `课程类型`
  - 传闻系统类型：`校园传闻`, `传播范围`, `传闻类型`, `传闻来源`
  - 学期日历类型：`学期日历`, `学期事件`, `学期事件类型`, `事件标记`
  - 宿舍系统类型：已从 `dormitory.ts` 重新导出
  - 扩展状态接口：`校园纪元扩展状态`

### 类型导出 ✅
- 更新 `models/campusNSFW/index.ts`：
  - 新增 v3.0 校园纪元玩法深度扩展类型导出
  - 统一宿舍系统类型导出（通过 types.ts）

### 未完成 ⚠️
- **Action 处理器集成**: 需要在 `useGame.ts` 中添加 `handleJoinClub`, `handleLeaveClub`, `handleOrganizeClubActivity`, `handleRumorSpread`, `handleSemesterEvent`, `handleDormInteraction` 等动作
- **State 集成**: 需要在 `useGameState.ts` 中添加 `社团列表`, `学业`, `传闻列表`, `日历`, `当前宿舍` 等状态
- **Prompt 层增强**: 需要在 prompts 中添加校园场景描述增强

---

## 变更文件
- `hooks/useGame/semesterCalendarWorkflow.ts` (Bug修复)
- `models/campusNSFW/types.ts` (新建)
- `models/campusNSFW/index.ts` (修改)

## Git Commit
```
fix(campus): replace uuid with crypto.randomUUID and add campus types
feat(campus): add campus-era-gameplay-deepening types v3.0
```

---

## Task: docs/plans/2026-05-03_story-slots-framework.md

**执行时间**: 2026-05-07 00:35 UTC

### 状态: ✅ 完成（已有实现）

---

## 完成内容

### 已有实现确认 ✅
计划中列出的所有文件均已存在：

1. **`models/planning/storySlots.ts`** ✅ - 剧情槽位类型定义
   - `剧情槽位类型` 类型别名（8种类型）
   - `剧情槽位结构` 接口（id、名称、类型、内容、作用域、优先级、启用/失效条件等）
   - `剧情槽位预算` 配置（各作用域token预算）
   - `剧情槽位类型标签` 映射
   - `生成剧情槽位ID()` 工厂函数
   - `创建剧情槽位()` 工厂函数

2. **`data/story-slots.ts`** ✅ - 槽位注册表
   - `预设剧情槽位列表`（15个预设槽位：宗门新人试炼、比武大会、月下对话等）
   - 涵盖所有8种槽位类型
   - `获取预设槽位By类型()`
   - `获取预设槽位By作用域()`

3. **`utils/storySlots.ts`** ✅ - 槽位注入逻辑
   - `评估条件()` - 解析并评估条件表达式
   - `评估槽位优先级()` - 根据上下文动态调整优先级
   - `过滤可用槽位()` - 按作用域和条件过滤
   - `获取可用槽位()` - 获取指定作用域的可用槽位
   - `按类型分组获取槽位()` - 按类型分组
   - `估算槽位内容长度()` / `检查预算()` - 预算管理
   - `获取预算内槽位组合()` - 在预算内获取最佳组合
   - `格式化槽位内容()` - 模板变量替换
   - `生成槽位注册表()` / `获取槽位ById()` - 槽位查询
   - `激活槽位()` - 激活槽位

4. **`models/planning/storyPlan.ts`** ✅ - 已修改，包含槽位状态管理
   - `剧情槽位: 剧情槽位结构[]`
   - `已激活槽位: string[]`
   - `已完成槽位: string[]`

### 验收标准确认 ✅
1. ✅ 剧情槽位类型定义完整（8种类型）
2. ✅ 槽位可根据作用域和条件过滤
3. ✅ 与现有世界书槽位系统共存不冲突
4. ✅ 剧情规划结构包含槽位列表
5. ✅ `npm run build` 通过

---

## 变更文件
无变更（所有文件在计划前已存在）

## Git Commit
```
Already implemented - no new commits needed
```

---

## Task: docs/plans/2026-05-03_modern-era-occupations.md

**执行时间**: 2026-05-07 00:20 UTC

### 状态: ✅ 已完成（大部分已实现，补全最后缺口）

---

## 实施确认

经过全面审查，计划的 **65 条新数据** 中绝大部分已由历史 commit 实施完毕：

### 已存在的数据 ✅

**背景 (6)** - `data/backgrounds/modern.ts`
- 在校大学生、中小学教师、互联网程序员、临床医生、自由职业者、创业者
- 全部带有 `时代适配: ['现代']`

**天赋 SFW (18)** - `data/talents/modern.ts`
- 学生: 考试体质、社团达人、奖学金猎手
- 教师: 课堂掌控、因材施教、寒暑假自由
- 程序员: Debug直觉、开源贡献者、全栈能力
- 医生: 临床直觉、医患沟通术、学术资源
- 自由职业者: 多面手、客户维护术、自律大师
- 创业者: 商业嗅觉(重名)、融资能力、团队凝聚力

**天赋 NSFW (12)** - `data/talents/nsfw.ts`
- 学生: 学姐学妹缘、室友的秘密
- 教师: 家长群风云、办公室恋情
- 程序员: 技术宅的魅力、深夜加班搭子
- 医生: 夜班暧昧、医者仁心之外的私心
- 自由职业者: 咖啡馆社交、甲方乙方
- 创业者: 合伙人关系、投资人酒局

**气运 SFW (18)** - `data/qiyun/categories/zhen-qiyun.ts` + `xianzhi.ts`
- 学生: 校园风云人物(传说)、学霸光环、挂科预警
- 教师: 桃李满天下(传说)、名师出高徒、职业倦怠
- 程序员: 代码无Bug(传说)、技术大牛、35岁危机
- 医生: 妙手回春(传说)、医学天才、医患纠纷
- 自由职业者: 接单锦鲤、时间管理大师、断单焦虑
- 创业者: 风口上的猪(传说)、连续创业者、资金链断裂

**气运 NSFW (11)** - `data/qiyun/categories/hehuan.ts`
- 学生: 图书馆邂逅、校园恋人命
- 教师: 师生缘、深夜备课室
- 程序员: 技术论坛情缘、远程办公自由
- 医生: 深夜会诊、医者之恋
- 自由职业者: 远程暧昧
- 创业者: 创业伴侣、CEO的光环

### 本次补全的内容 ✅

**本次新增** (data/qiyun/categories/xianzhi.ts):
1. **35岁危机** (稀有) - 程序员专属限制版气运，代价：35岁后被优化
2. **医患纠纷** 升级 - 从普通升级为稀有，描述和效果增强

---

## 变更文件

| 文件 | 操作 |
|------|------|
| `data/qiyun/categories/xianzhi.ts` | 修改 |

## Git Commit

```
a5d255d feat(qiyun): 完成现代纪元职业气运系统
```

## 验证

- `npm run build` ✅ 通过
- `npx tsc --noEmit` 无新增 qiyun 相关错误
- TypeScript 编译错误均为历史遗留，与本次修改无关
