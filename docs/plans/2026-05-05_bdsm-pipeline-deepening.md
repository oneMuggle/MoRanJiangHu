# BDSM Relationship Pipeline 深化设计计划

> 日期：2026-05-05
> 状态：待审批
> 前置：`2026-05-05_bdsm-relationship-pipeline.md`（Phase 1-5 已完成）
> 范围：完整管线串联——论坛联系 → 私聊协商 → 主剧情见面 → 契约缔结 → 调教任务 → 阶段推进

---

## 一、目标与背景

将已有的 BDSM UI 组件和数据模型串联为**可端到端运行的完整玩法系统**。核心原则：

1. **手机协商，主剧情执行**：见面、调教、契约仪式等重度叙事内容放在主剧情
2. **渐进递进**：初识 → 试探 → 确立 → 深入 → 固化，每阶段解锁新玩法
3. **安全优先**：安全词、底线、Aftercare 贯穿始终
4. **懒加载**：新增面板组件全部 React.lazy() 加载，不同板块（论坛/私聊/任务/契约/仪表盘）独立加载

---

## 二、现状分析

### 已完成模块

| 模块 | 文件 | 状态 |
|------|------|------|
| 数据模型 | `models/campusNSFW/sm.ts` | 全部类型定义完成 |
| 论坛类型 | `models/campusNSFW/bdsm-forum.ts` | 完成 |
| 论坛 UI | `CampusForumApp.tsx` + `BDSMContactModal.tsx` | 完成 - 3 轮联系对话 |
| 私聊 UI | `CampusChatApp.tsx` | 完成 - 4 面板切换，紫色头像 |
| 任务面板 | `BDSMTaskPanel.tsx` | 完成 |
| 契约面板 | `BDSMContractPanel.tsx` | 完成 |
| 仪表盘 | `BDSMRelationshipDashboard.tsx` | 完成 |
| 提示词层 | `prompts/runtime/bdsmTasks.ts` | 完成 - 8 个构建函数 |
| 任务工作流 | `hooks/useGame/bdsmTaskWorkflow.ts` | 完成 - 含硬编码回退 |
| 见面工作流 | `hooks/useGame/bdsmMeetingWorkflow.ts` | 完成 - 提示词构建 + 结果解析 |
| NSFW 引擎 | `hooks/useGame/campusNSFWEngine.ts` | 完成 - 任务影响 + 阶段推进 |
| 系统提示词注入 | `hooks/useGame/systemPromptBuilder.ts` (L1486-1522) | 完成 |
| 私聊工作流 | `hooks/useGame/privateChatWorkflow.ts` | 完成 - LLM 回复 + 状态解析 |
| useGame actions | `hooks/useGame.ts` (L980-1046) | 完成 - 6 个函数，5 个导出 |
| Mobile Home | `MobileHome.tsx` | 完成 - 关系快捷入口 |
| 私聊消息修复 | `App.tsx` onSendMessage | 完成 - 独立工作流，不发主剧情 |
| 帖子状态同步 | `CampusForumApp.tsx` handleContactConfirm | 完成 - setSelectedPost 同步 |
| 问候语修复 | `CampusChatApp.tsx` | 完成 - 不再用 npc.简介 |

### 关键缺口

| 缺口 | 影响 | 优先级 |
|------|------|--------|
| 联系成功不创建私聊会话 | NPC 不在 CampusChatApp 中出现 | P0 |
| 无见面协商 UI | 无法通过手机安排见面 | P0 |
| 无主剧情见面触发 | 协商完成后无法触发主剧情 | P0 |
| 无任务生成触发器 | 任务永远不生成 | P0 |
| 无任务评价链条 | 报告完成不更新服从度 | P0 |
| 无契约协商流程 | 无法正式建立契约 | P0 |
| 无自动阶段推进 | 关系永远不升级 | P0 |
| 无 `<BDSM状态更新>` 解析 | 主剧情状态变更不生效 | P0 |
| 无 Aftercare 机制 | 缺少调教后心理关怀 | P1 |
| 无底线编辑 UI | 安全词/底线不可修改 | P1 |

---

## 三、完整工作流设计

### 3.1 端到端流程图

```
论坛浏览 BDSM 板块
    │
    ▼
浏览寻主召奴帖 ─→ 点击「联系TA」 ─→ 3轮沟通对话（BDSMContactModal）
    │
    ▼ 建立关系
创建私聊会话（自动加入 CampusChatApp）
    │
    ▼
私聊面板（CampusChatApp）
    ├── 总览面板 ─── 关系阶段、服从度、权力天平
    ├── 任务面板 ─── 调教任务列表、日常指令
    ├── 契约面板 ─── 当前契约、条款列表
    └── 聊天面板 ─── 实时对话 + 「协商见面」按钮
         │
         ▼ 点击「协商见面」
见面协商面板（BDSMNegotiationPanel）
    ├── 时间选择（当前回合 + N 回合后）
    ├── 地点选择（咖啡厅/图书馆花园/废弃教室/天台/操场角落/宿舍）
    ├── 安全词确认（默认"月光"，可编辑）
    ├── 底线输入（1-3 条）
    └── AI NPC 回复（同意/犹豫/拒绝）
         │
         ▼ NPC 同意 → 创建见面预约
写入 校园系统.见面预约列表
    │
    ▼ 下一回合主剧情
见面场景 AI 生成（sendWorkflow 注入见面提示词）
    ├── AI 生成见面叙事文本
    ├── 可选输出 <BDSM状态更新> 标签
    └── 建立口头约定/书面契约/信物交换
         │
         ▼
契约缔结（主剧情 AI 生成条款）
    ├── 口头约定（试探阶段）
    ├── 书面契约（确立阶段）
    └── 信物交换（固化阶段）
         │
         ▼
调教任务系统
    ├── AI 生成 2-4 个任务（服从测试/忠诚考验/技能训练/心理建设...）
    ├── 日常指令 1-3 条
    ├── 玩家接受任务
    ├── 主剧情体现任务执行过程
    ├── 玩家报告完成
    ├── AI 评价（服从度变化 + 奖励/惩罚）
    └── 阶段推进判定
         │
         ▼ 满足条件
关系阶段推进（初识→试探→确立→深入→固化）
    └── AI 生成推进叙事
```

### 3.2 新增数据结构

```typescript
// models/campusPhone.ts 扩展
interface 见面预约 {
    npcId: string;
    npcName: string;
    见面回合偏移: number;
    见面地点: string;
    安全词: string;
    玩家底线: string[];
    npc底线?: string[];
    状态: '已协商' | '已见面' | '已取消';
    创建时间: string;
}

interface 契约协商 {
    类型: '口头约定' | '书面契约' | '信物交换';
    条款草案: { 编号: number; 内容: string }[];
    安全词: string;
    玩家底线: string[];
    npc底线: string[];
    有效期回合: number;
}

// 校园系统数据扩展
interface 校园系统数据 {
    // ... 现有字段 ...
    见面预约列表?: 见面预约[];
    契约协商?: 契约协商;
    BDSM关系快捷入口?: string; // 当前活跃 BDSM 关系 NPC ID
}
```

---

## 四、实施步骤

### Phase A：私聊协商 + 见面触发（6-8h）

**A1. 论坛联系 → 自动创建私聊会话**
- 文件：`components/features/MobileDevice/apps/CampusForumApp.tsx`
- 修改：`handleContactConfirm` 中当 结果 === '建立关系' 时，向 `校园系统.私聊会话列表` 追加新会话
- NPC 首条消息为打招呼内容（问候语模板）
- 依赖：无

**A2. 见面协商面板组件**
- 新建：`components/features/MobileDevice/apps/BDSMNegotiationPanel.tsx`
- 功能：
  - 时间选择器（当前回合 + N 回合后）
  - 地点选择器（咖啡厅/图书馆花园/废弃教室/天台/操场角落/宿舍）
  - 安全词确认（默认"月光"，可编辑）
  - 底线输入（1-3 条）
  - 确认按钮 → 触发 AI NPC 回复（同意/犹豫/拒绝）
- 依赖：无

**A3. CampusChatApp 集成**
- 文件：`components/features/MobileDevice/apps/CampusChatApp.tsx`
- 新增：BDSM 关系会话头部显示「协商见面」按钮
- 条件：存在 BDSM 关系 && 无待处理见面预约
- 点击后显示 `BDSMNegotiationPanel`
- 确认后调用 `onConfirmNegotiation(npcId, 协商结果)`
- 依赖：A1, A2

**A4. 见面预约状态模型**
- 文件：`models/campusPhone.ts`
- 新增：`见面预约` 类型、`见面预约列表` 字段
- 依赖：无

**A5. 主剧情见面触发器**
- 新建：`hooks/useGame/bdsmMeetingTrigger.ts`
- 函数：
  - `检查见面触发(校园系统)` → 返回待处理预约
  - `构建见面注入提示词(预约, 关系上下文)` → 返回 prompt 片段
  - `处理见面结果(解析结果, 状态更新函数)` → 更新预约状态
- 依赖：Phase B（状态解析器）

### Phase B：BDSM 状态解析器（3-4h）

**B6. `<BDSM状态更新>` 标签解析**
- 新建：`hooks/useGame/bdsmStateParser.ts`
- 函数：
  - `解析BDSM状态更新(responseText)` → 返回结构化数据
    - 任务更新列表、服从度变化、阶段推进、契约更新、里程碑、日常指令
  - `移除BDSM状态标签(responseText)` → 返回清理后文本
- 依赖：无

**B7. 集成到 sendWorkflow**
- 文件：`hooks/useGame/sendWorkflow/responseProcessingPhase.ts`
- 修改：AI 响应后调用 `解析BDSM状态更新()`，如有非空结果则调用对应 useGame actions
- 依赖：B6, 已有 useGame actions

### Phase C：任务生命周期引擎（6-8h）

**C8. 任务生成触发器**
- 新建：`hooks/useGame/bdsmTaskTrigger.ts`
- 函数：
  - `触发任务生成(npcId, 关系上下文)` → 调用 `生成调教任务()` + `添加BDSM任务()`
  - `触发日常指令刷新(npcId)` → 每 3 回合刷新日常指令
  - `检查Aftercare需求(任务历史)` → 重度任务后触发心理关怀
- 依赖：Phase B
- [x] 已完成

**C9. 任务报告 → AI 评价链条**
- 文件：`hooks/useGame.ts`
- 新增：`报告任务完成(npcId, 任务ID, 执行描述)`
  1. 标记任务为已完成
  2. 调用 `评价任务完成()` 获取 AI 评价
  3. 调用 `处理BDSM任务影响()` 更新服从度
  4. 调用阶段推进检查
  5. 如需要触发新任务生成
- 依赖：C8
- [x] 已完成（导出为 `reportTaskComplete`）

**C10. 自动阶段推进**
- 文件：`hooks/useGame.ts`
- 新增：`处理关系阶段推进(npcId)`
  - 调用 `判定BDSM关系阶段推进()`
  - 如推进为 true：更新阶段、记录里程碑、标记 `pendingStageAdvance`
- 依赖：C9
- [x] 已完成（导出为 `stageAdvance`）

### Phase D：契约协商系统（4-5h）

**D11. 契约协商面板**
- 新建：`components/features/MobileDevice/apps/BDSMContractNegotiation.tsx`
- 功能：
  - 选择契约类型（根据阶段自动建议）
  - 调用 AI 生成条款建议
  - 显示可编辑条款列表
  - 确认安全词和底线
  - 提交协商结果
- 依赖：Phase C（AI 调用基础设施）
- [x] 已完成

**D12. CampusChatApp 契约入口**
- 文件：`CampusChatApp.tsx`
- 新增：契约面板中当无有效契约且阶段 >= '试探' 时显示「协商契约」按钮
- 依赖：D11
- [x] 已完成 — 通过 BDSMBContractPanel.onNegotiateContract 连线

### Phase E：Aftercare 机制（2-3h）

**E13. Aftercare 触发**
- 文件：`hooks/useGame/bdsmTaskTrigger.ts`
- 函数：
  - `需要Aftercare(已完成任务)` → 重度/极限任务、公开挑战
  - `触发Aftercare(npcId)` → 生成 Aftercare 叙事 + 小幅服从度加成 (+3)
- 依赖：Phase C
- [x] 已完成（`检查Aftercare需求` + `应用Aftercare服从度`）

### Phase F：安全设置（2h）

**F14. 安全设置面板**
- 新建：`components/features/MobileDevice/apps/BDSMSafetySettings.tsx`
- 功能：编辑安全词、管理底线列表（添加/删除）
- 基于 RACK/SSC 原则提供预设底线建议
- 依赖：无
- [x] 已完成

**F15. 集成到仪表盘**
- 文件：`BDSMRelationshipDashboard.tsx`
- 新增：安全区域「编辑」按钮 → 打开 `BDSMSafetySettings`
- 依赖：F14
- [x] 已完成

### Phase G：系统集成（4-5h）

**G16. sendWorkflow 独立阶段**
- 文件：`hooks/useGame/sendWorkflow/index.ts`
- 新增：「BDSM 任务补充」独立阶段
  - 检查所有活跃 BDSM 关系 NPC
  - 任务数 < 2 时生成新任务
  - 日常指令过期（> 3 回合）时刷新
  - 注入待处理见面/阶段推进/契约仪式/Aftercare 上下文
- [x] 已完成（BDSM任务补充阶段已集成到 sendWorkflow，进度回调类型已添加）

**G17. 响应处理集成**
- 文件：`hooks/useGame/sendWorkflow/responseProcessingPhase.ts`
- 修改：AI 响应后调用 `<BDSM状态更新>` 解析器，应用所有变更，清除已处理的待处理标记
- 依赖：Phase B, A-F
- [x] 已完成（Phase B7 已集成 `onBDSM状态更新` 回调）

### Phase H：清理（1h）

**H18. 删除过时组件**
- 删除：`BDSMMeetingModal.tsx`（功能已被 `BDSMNegotiationPanel.tsx` 取代）
- 清理：`App.tsx` 和 `MobileHome.tsx` 中的见面相关回调
- 依赖：所有前述阶段
- [x] 已完成 — `BDSMMeetingModal.tsx` 已删除，无外部引用

---

## 九、完成状态总览

| Phase | 状态 | 备注 |
|-------|------|------|
| A: 私聊协商+见面触发 | 已完成 | A1-A5 全部完成 |
| B: 状态解析器 | 已完成 | B6-B7 集成到 sendWorkflow |
| C: 任务生命周期 | 已完成 | C8-C10，含评价链和阶段推进 |
| D: 契约协商系统 | 已完成 | D11-D12，契约协商面板+入口 |
| E: Aftercare 机制 | 已完成 | E13，触发检测+服从度应用 |
| F: 安全设置 | 已完成 | F14-F15，安全面板+仪表盘集成 |
| G: 系统集成 | 已完成 | G16-G17，sendWorkflow 补充阶段 |
| H: 清理 | 已完成 | H18，删除过时组件 |

---

## 五、数据流设计

```
用户操作（论坛/手机）
    │
    ▼
React State (校园系统)
    │
    ▼
useGame Actions (handlePrivateChatSend, 报告任务完成, etc.)
    │
    ├── 调用 AI（privateChatWorkflow / bdsmTaskWorkflow）
    │       │
    │       ▼
    │   AI Response（含 <BDSM状态更新> 标签）
    │       │
    │       ▼
    │   bdsmStateParser 解析
    │       │
    │       ▼
    │   更新 React State
    │
    └── 直接更新 React State（无 AI 参与）
            │
            ▼
        IndexedDB 持久化（保存/加载时自动处理）
```

---

## 六、风险评估

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| AI 生成任务/条款质量不稳定 | 高 | 硬编码回退（已在 `bdsmTaskWorkflow.ts`）+ 预设任务池作为二级回退 |
| 主剧情 prompt 过长 | 中 | 仅注入活跃任务（最多 5 个）+ 日常指令摘要，总注入文本 ≤ 500 token |
| 关系推进过快/过慢 | 中 | 硬编码数值阈值作为主判断，AI 判定仅作辅助 |
| `<BDSM状态更新>` 解析失败导致状态不同步 | 中 | 解析失败返回 null，不应用任何变更（安全默认值），记录警告 |
| 私聊会话创建与现有社交列表冲突 | 低 | 使用一致 NPC ID，创建前检查是否存在 |
| 存档兼容性问题 | 低 | 新字段有默认值，向后兼容 |
| 非校园纪元误出现 | 低 | 仅在校园纪元 + BDSM 论坛启用时生效 |

---

## 七、成功标准

- [ ] 论坛联系成功后自动创建 CampusChatApp 私聊会话
- [ ] 私聊中可协商见面（时间/地点/安全词/底线）
- [ ] 协商确认后下一回合主剧情生成见面场景
- [ ] AI 根据契约/服从度/关系阶段生成合适的 2-4 个任务
- [ ] 任务有完整生命周期：接受 → 执行 → 报告 → AI 评价 → 奖惩
- [ ] 服从度/权力天平随任务执行正确变化
- [ ] 关系阶段满足条件时自动推进
- [ ] 契约系统完整可用（协商/缔结/履行/违约）
- [ ] 日常指令在叙事中有所体现
- [ ] Aftercare 机制在重度任务后触发
- [ ] 安全词/底线可编辑
- [ ] BDSM 关系数据在保存/加载后保持不变
- [ ] 所有面板组件使用 React.lazy() 懒加载
- [ ] 不同板块（论坛/私聊/任务/契约/仪表盘）独立加载，互不阻塞
- [ ] 删除过时的 `BDSMMeetingModal` 组件

---

## 八、文件变更总览

### 新建文件（6 个）

| 文件 | 说明 | Phase |
|------|------|-------|
| `components/features/MobileDevice/apps/BDSMNegotiationPanel.tsx` | 见面协商面板 | A |
| `components/features/MobileDevice/apps/BDSMContractNegotiation.tsx` | 契约协商面板 | D |
| `components/features/MobileDevice/apps/BDSMSafetySettings.tsx` | 安全设置面板 | F |
| `hooks/useGame/bdsmMeetingTrigger.ts` | 见面触发器 | A |
| `hooks/useGame/bdsmStateParser.ts` | `<BDSM状态更新>` 解析器 | B |
| `hooks/useGame/bdsmTaskTrigger.ts` | 任务生成/刷新/Aftercare 触发器 | C, E |

### 修改文件（8 个）

| 文件 | 变更 | Phase |
|------|------|-------|
| `components/features/MobileDevice/apps/CampusForumApp.tsx` | 联系成功创建私聊会话 | A |
| `components/features/MobileDevice/apps/CampusChatApp.tsx` | 协商见面/契约按钮 | A, D |
| `components/features/MobileDevice/apps/BDSMRelationshipDashboard.tsx` | 安全设置入口 | F |
| `models/campusPhone.ts` | 见面预约/契约协商类型 | A, D |
| `hooks/useGame.ts` | 报告任务完成/阶段推进 actions | C |
| `hooks/useGame/sendWorkflow/independentStages.ts` | BDSM 任务补充阶段 | G |
| `hooks/useGame/sendWorkflow/responseProcessingPhase.ts` | 集成状态解析器 | G |
| `hooks/useGame/privateChatWorkflow.ts` | 扩展协商上下文 prompt | A |
