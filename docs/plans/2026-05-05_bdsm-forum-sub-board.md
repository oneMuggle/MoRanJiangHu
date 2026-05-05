# BDSM 校园论坛子板块实施计划

> 日期：2026-05-05
> 状态：实施完成（Phase 1-5 全部完成）
> 范围：校园纪元 · 深夜板块 · BDSM 子论坛 + 寻主召奴招募系统

---

## 一、目标与背景

在校园纪元的手机论坛系统（深夜板块）中新增 **BDSM** 子板块，包含 6 个分类子区：

| 子分类 | 内容定位 | 交互类型 |
|--------|----------|----------|
| 匿名讨论 | 匿名发帖讨论各类话题 | 浏览、回复 |
| 经验交流 | 经验分享、心得体会 | 浏览、回复 |
| 物品话题 | 道具/装备相关讨论 | 浏览、回复 |
| 心理探索 | 关系动态、心理层面的探讨 | 浏览、回复 |
| 安全科普 | 安全知识与 SSC/RACK 原则 | 浏览、回复 |
| **寻主召奴** | NPC 发布的招募帖，寻找匹配对象 | **浏览 + 联系发帖人 → 解锁新角色/新故事线** |

**核心设计：** BDSM 论坛不仅是一个内容展示模块，更是 **角色发现 + 故事线触发** 的入口。通过「寻主召奴」板块，玩家可以联系匿名 NPC，解锁该角色并开启专属 BDSM 关系剧情线。

---

## 二、当前状态分析

### 已有模块

| 模块 | 文件 | 状态 |
|------|------|------|
| 论坛数据模型 | `models/campusPhone.ts` | 7 个分类，无 BDSM |
| 论坛 UI | `components/features/MobileDevice/apps/CampusForumApp.tsx` | 支持分类筛选、回复、刷新 |
| AI 帖子生成 | `hooks/useGame/deviceAiWorkflow.ts` | 有 `forum` 角色，无 BDSM 特定生成 |
| 论坛帖子解析 | `deviceAiWorkflow.ts` 中的 `解析AI论坛帖子()` | 解析为 `论坛帖子[]` |
| 校园 NSFW 设置 | `models/campusNSFW/index.ts` + `CampusNSFWSettings.tsx` | v1.0-v1.4 子系统，无 BDSM 论坛 |
| 校园 NSFW 引擎 | `hooks/useGame/campusNSFWEngine.ts` | 欲望/暴露/SM/桌游/校园祭引擎 |
| 校园 NSFW prompt | `prompts/runtime/campusNSFW.ts` | 叙事约束构建器 |
| 游戏状态初始化 | `hooks/useGameState.ts` | `校园系统` 包含 `论坛帖子列表` |
| Prompt Builder | `hooks/useGame/systemPromptBuilder.ts` | 注入校规/催眠，未注入论坛内容 |

### 存在的问题

1. **论坛分类中没有 BDSM**：`论坛分类` 类型不包含任何 BDSM 相关值
2. **论坛帖子与校园 NSFW 引擎脱节**：论坛内容不会影响 NPC 欲望/流言
3. **没有角色发现/解锁机制**：论坛帖子中的 NPC 无法被解锁为可交互角色
4. **论坛 AI 生成没有 BDSM 内容**：`appTypeMap` 中没有 BDSM 特定的生成角色
5. **设置中没有 BDSM 板块开关**：CampusNSFWSettings 不包含论坛相关配置

---

## 三、架构设计

### 3.1 数据模型扩展

#### 新增类型（`models/campusNSFW/bdsm-forum.ts`）

```typescript
// BDSM 帖子子分类
type BDSM帖子分类 = '匿名讨论' | '经验交流' | '物品话题' | '心理探索' | '安全科普' | '寻主召奴';

// 寻主召奴帖子专用字段（扩展自 论坛帖子）
interface 寻主召奴扩展 {
  招募方角色: '寻主' | '召奴' | '不限';
  期望关系类型: string;      // 如「轻度探索」「固定关系」「偶尔互动」
  接头暗号?: string;          // 用于联系时的验证
  关联NPC ID?: string;        // 联系成功后解锁的 NPC
  是否已联系: boolean;         // 玩家是否已联系
  联系状态: '未联系' | '沟通中' | '已确认' | '已拒绝' | '关系建立';
}

// BDSM 论坛帖子（继承 论坛帖子 + 扩展字段）
interface BDSM论坛帖子 extends 论坛帖子 {
  子分类: BDSM帖子分类;
  影响等级: '轻微' | '中等' | '严重';
  // 仅寻主召奴帖子有值
  寻主召奴信息?: 寻主召奴扩展;
}

// BDSM 论坛设置（挂载到 校园NSFW设置）
interface BDSMS论坛设置 {
  启用BDSM论坛: boolean;
  BDSM内容强度: '关闭' | '轻度' | '中度' | '深度';
  启用NPC影响: boolean;        // BDSM 帖子影响 NPC 欲望
  启用流言传播: boolean;        // 帖子内容参与流言计算
}
```

#### 类型扩展

| 文件 | 修改 |
|------|------|
| `models/campusPhone.ts` | `论坛分类` 增加 `'BDSM'` |
| `models/campusPhone.ts` | `校园系统数据` 增加 `BDSM帖子列表?: BDSM论坛帖子[]` |
| `models/campusNSFW/index.ts` | `校园NSFW设置` 增加 BDSM 论坛设置字段 |

### 3.2 引擎层

| 文件 | 新增函数 |
|------|----------|
| `hooks/useGame/bdsmForumEngine.ts` | `计算BDSM帖子对NPC影响()` — 帖子影响欲望阶段推进 |
| `hooks/useGame/bdsmForumEngine.ts` | `判定寻主召奴联系结果()` — 判定联系成功/失败/解锁NPC |
| `hooks/useGame/bdsmForumEngine.ts` | `计算BDSM流言传播()` — 帖子对流言等级的影响 |
| `hooks/useGame/bdsmForumEngine.ts` | `生成BDSM影响记录()` — 记录帖子对 NPC 的影响 |

### 3.3 Prompt 层

| 文件 | 新增内容 |
|------|----------|
| `prompts/runtime/bdsmForum.ts` | `构建BDSM叙事约束()` — 将活跃帖子注入主线 prompt |
| `prompts/runtime/bdsmForum.ts` | `构建寻主召奴联系对话()` — 生成联系 NPC 时的对话 prompt |
| `hooks/useGame/deviceAiWorkflow.ts` | `appTypeMap` 增加 `bdsn` 角色 |

### 3.4 UI 层

| 文件 | 修改 |
|------|------|
| `CampusForumApp.tsx` | 增加 BDSM 分类标签、暗红视觉样式、帖子详情 |
| `CampusForumApp.tsx` | 寻主召奴帖子增加「联系TA」按钮 |
| `CampusNSFWSettings.tsx` | 增加 BDSM 论坛设置区块 |
| **新增组件** | `BDSMContactModal.tsx` — 联系发帖人对话框 |
| **新增组件** | `BDSMUnlockResult.tsx` — 角色解锁结果展示 |

### 3.5 集成层

| 文件 | 修改 |
|------|------|
| `hooks/useGameState.ts` | 初始化 `BDSM帖子列表: []` |
| `hooks/useGame.ts` | 论坛刷新时包含 BDSM 内容生成 |
| `hooks/useGame/systemPromptBuilder.ts` | 注入活跃 BDSM 帖子摘要 |

---

## 四、实施步骤

### 阶段一：数据模型（低复杂度）

- [x] 1.1 创建 `models/campusNSFW/bdsm-forum.ts` — 定义所有 BDSM 论坛类型和默认值
- [x] 1.2 扩展 `models/campusPhone.ts` — `论坛分类` 增加 `'BDSM'`
- [x] 1.3 扩展 `models/campusPhone.ts` — `校园系统数据` 增加 `BDSM帖子列表`
- [x] 1.4 扩展 `models/campusNSFW/index.ts` — 设置类型和默认值
- [x] 1.5 在 `index.ts` 中 re-export BDSM 论坛类型

### 阶段二：引擎逻辑（中复杂度）

- [x] 2.1 创建 `hooks/useGame/bdsmForumEngine.ts` — 核心引擎函数
  - `计算BDSM帖子对NPC影响()` — 返回欲望阶段推进值
  - `判定寻主召奴联系结果()` — 返回联系结果和解锁 NPC 信息
  - `计算BDSM流言传播()` — 返回流言等级变化
  - `生成BDSM影响记录()` — 创建影响记录
- [x] 2.2 将 BDSM 引擎函数接入 `campusNSFWEngine.ts` 的统一处理 — 新增 `处理BDSM论坛影响()`

### 阶段三：Prompt 集成（中复杂度）

- [x] 3.1 创建 `prompts/runtime/bdsmForum.ts` — 叙事约束构建器
- [x] 3.2 在 `deviceAiWorkflow.ts` 的 `appTypeMap` 中增加 BDSM 生成角色 + `解析AIBDSM帖子()` 解析函数
- [x] 3.3 在 `campusNSFW.ts` 中集成 BDSM 论坛叙事约束
- [x] 3.4 在 `systemPromptBuilder.ts` 中注入活跃 BDSM 帖子

### 阶段四：UI 实现（中复杂度）

- [x] 4.1 扩展 `CampusForumApp.tsx` — 论坛/BDSM 板块切换 + 子分类筛选 + 暗红视觉样式
- [x] 4.2 在 `CampusForumApp.tsx` 中实现「联系TA」按钮（仅寻主召奴帖子）
- [x] 4.3 创建 `BDSMContactModal.tsx` — 联系发帖人对话框（聊天式交互，2-3 轮对话，匹配判定）
- [ ] 4.4 创建 `BDSMUnlockResult.tsx` — 角色解锁结果展示（可选，已在 ContactModal 中内联处理）
- [x] 4.5 扩展 `CampusNSFWSettings.tsx` — BDSM 论坛设置区块

### 阶段五：集成与串联（高复杂度）

- [x] 5.1 在 `useGameState.ts` 中初始化 `BDSM帖子列表: []`
- [x] 5.2 在 `triggerDeviceMessageWorkflow.ts` 中接入论坛刷新工作流（里模式默认生成 BDSM 内容）
- [x] 5.3 在 `MobileHome.tsx` 中添加 `bdsn` app 入口 + 图标（🌙 深夜板块）
- [x] 5.4 联系 NPC 后更新 `社交` 列表（解锁新角色）
- [x] 5.5 保存/加载时 BDSM 数据持久化验证 — `校园系统` 整体深拷贝，`BDSM帖子列表` 自动序列化

---

## 五、用户交互流程

### 5.1 浏览 BDSM 论坛

```
用户打开手机 → 校园论坛 → 点击「BDSM」分类标签
→ 看到 6 个子分类的帖子列表
→ 点击帖子查看详情和回复
→ 点击「AI 刷新」生成新内容
```

### 5.2 寻主召奴联系流程

```
用户浏览「寻主召奴」子分类
→ 看到 NPC 发布的招募帖（匿名描述、期望关系类型）
→ 点击帖子中的「联系TA」按钮
→ 弹出联系对话框，显示 AI 生成的初始对话
→ 玩家回复，进入 2-3 轮对话
→ 系统判定联系结果：
   → 成功：解锁 NPC 角色，加入社交列表，开启专属故事线
   → 失败：对方拒绝或消失，可增加少量暴露风险
→ 解锁成功后展示角色卡片和关系建立确认
```

### 5.3 联系判定时机

联系结果由 AI 根据以下因素综合判定：
- 玩家当前欲望阶段 / 关系轨道
- 发帖 NPC 的欲望档案（如果已存在）
- 内容强度设置
- 对话质量（AI 判定）

---

## 六、风险评估

| 风险 | 级别 | 缓解措施 |
|------|------|----------|
| BDSM 帖子过度影响 NPC 欲望导致失控 | 高 | 每回合 capped 影响上限（单贴最多推进 10 点） |
| Prompt 上下文膨胀 | 中 | 仅注入最近 5 条活跃帖子 |
| 低强度下内容过于露骨 | 中 | 按强度分级 prompt 约束 |
| 联系 NPC 后状态同步问题 | 中 | 统一通过 `设置社交` 更新 |
| 破坏现有论坛分类筛选 | 低 | BDSM 作为额外筛选项 |
| 非校园纪元时误出现 | 低 | 仅在校园纪元设备系统中渲染 |

---

## 七、成功标准

- [ ] BDSM 子板块开关在 Campus NSFW 设置中可见
- [ ] BDSM 分类标签在论坛中可见（仅校园纪元）
- [ ] 6 个子分类正确显示
- [ ] AI 刷新能生成 BDSM 帖子
- [ ] BDSM 帖子有独特的暗红视觉样式
- [ ] 寻主召奴帖子有「联系TA」按钮
- [ ] 联系后能触发对话流程
- [ ] 联系成功能解锁 NPC 并加入社交列表
- [ ] 联系失败有合理的反馈
- [ ] BDSM 设置关闭后隐藏所有内容
- [ ] 数据在保存/加载后保持不变
