# 校园纪元玩法深度扩展计划

> **日期：** 2026-05-03
> **状态：** 实施中
> **优先级：** 高
> **前置：** campus-era-li-mode.md、campus-nsfw-deepening.md

---

## 一、背景与目标

校园纪元已有基础框架（子纪元、里模式、NSFW引擎、NPC关系系统）。本计划旨在深化校园玩法的互动性、真实感和情感深度，将校园场景从"背景板"提升为"沉浸式青春体验"。

### 核心目标

1. **社团系统深化** - 社团不只是场景，是有资源、成员、事件的微型经营
2. **学业系统可视化** - 学业进度、考试成绩、升学压力直接影响剧情
3. **校园人际关系网络** - 派系、传闻、流言影响NPC行为
4. **时间节点事件** - 期中/期末、节假日、社团活动影响可触发事件
5. **表里人格强化** - 校园场景下的表里切换更细腻

---

## 二、现状分析

### 已有系统
| 系统 | 文件 | 完成度 |
|------|------|--------|
| 校园子纪元 | models/eraTheme/epoch-contemporary.ts | ✅ |
| 里模式强化 | prompts/runtime/eraLiMode.ts | ✅ |
| NSFW引擎 | hooks/useGame/campusNSFWEngine.ts | ✅ |
| NPC关系 | hooks/useGame/*relationship*.ts | ✅ |
| 手机系统 | hooks/useGame/deviceAiWorkflow.ts | ✅ |
| 论坛系统 | hooks/useGame/campusForumWorkflow.ts | ✅ |

### 缺失/薄弱环节
| 玩法 | 现状 | 目标 |
|------|------|------|
| 社团经营 | 无独立系统 | 社团资源、成员好感、等级 |
| 学业追踪 | 仅数值 | 可视化成绩单、升学进度 |
| 人际传闻 | 无 | 流言系统、派系关系 |
| 事件日历 | 无 | 学期关键节点触发 |
| 宿舍生活 | 提及但无系统 | 室友互动、私密场景 |

---

## 三、实施步骤

### 步骤 1：社团系统基础架构

**文件：** `hooks/useGame/clubWorkflow.ts`（新建）

```typescript
export interface 社团数据 {
  id: string;
  名称: string;
  类型: '学术' | '艺术' | '体育' | '社交' | '神秘';
  会长: string;  // NPC ID
  成员: 社团成员[];
  资源: {
    资金: number;
    名气: number;    // 影响招募
    凝聚力: number; // 影响活动成功率
  };
  等级: number;     // 1-5级
  设施等级: number; // 影响可举办活动类型
}

export interface 社团成员 {
  npcId: string;
  职位: '会长' | '副会长' | '骨干' | '普通成员';
  入会时间: string;
  贡献度: number;
}
```

**功能：**
- 社团创建（消耗游戏货币/资源）
- 加入已有社团（需会长审批 or 条件满足）
- 社团升级（名气/资金条件）
- 举办活动（消耗资源，产生事件）
- 成员贡献度影响职位晋升

### 步骤 2：学业追踪系统

**文件：** `hooks/useGame/academicWorkflow.ts`（新建）

```typescript
export interface 学业状态 {
  学年: number;
  学期: 1 | 2;
  课程: 课程成绩[];
  学分: number;
  GPA: number;
  升学压力: number; // 0-100
  奖学金资格: boolean;
}

export interface 课程成绩 {
  课程名: string;
  学分: number;
  成绩: number;      // 0-100
  等级: 'A' | 'B' | 'C' | 'D' | 'F';
}
```

**功能：**
- 期末触发成绩判定
- 学业压力影响NPC对话选项
- 奖学金资格解锁特殊购买
- 挂科触发特定事件

### 步骤 3：校园传闻系统

**文件：** `hooks/useGame/campusRumorWorkflow.ts`（新建）

```typescript
export interface 校园传闻 {
  id: string;
  内容: string;
  涉及NPC: string[];
  涉及玩家: boolean;
  传播范围: '小圈子' | '班级' | '年级' | '全校';
  真实性: number; // 0-100，越高越真
  影响力: number; // 影响NPC态度
  持续时间: number; // 游戏天数
  创建时间: string;
}
```

**功能：**
- 特定行为产生传闻（关系确认、冲突、优异表现）
- 传闻影响NPC初始态度
- 高影响力传闻可能触发剧情事件
- 传闻随时间衰减或升级

### 步骤 4：学期日历事件

**文件：** `hooks/useGame/semesterCalendarWorkflow.ts`（新建）

```typescript
export interface 学期事件 {
  id: string;
  名称: string;
  触发时间: '开学' | '期中' | '期末' | '节假日' | '社团节' | '运动会' | '毕业';
  持续天数: number;
  特殊标记: '考试' | '活动' | '假期' | '仪式';
  可触发剧情: string[];
}
```

**功能：**
- 关键时间节点触发专属剧情
- 期末/期中有不同的行动限制
- 暑假/寒假开放特殊场景
- 毕业触发主线剧情节点

### 步骤 5：宿舍系统

**文件：** `models/campusNSFW/dormitory.ts`（新建）

```typescript
export interface 宿舍数据 {
  宿舍类型: '男生宿舍' | '女生宿舍' | '混合宿舍';
  楼栋: string;
  房间号: string;
  室友: string[]; // NPC IDs
  私密程度: number; // 影响可触发事件类型
  装饰度: number; // 可升级
}
```

**功能：**
- 室友互动专属场景
- 宿舍私密事件
- 室友关系线

---

## 四、类型定义扩展

**文件：** `models/campusNSFW/types.ts`

新增类型：
- `社团数据`, `社团成员`, `社团类型`
- `学业状态`, `课程成绩`
- `校园传闻`
- `学期事件`, `学期事件类型`
- `宿舍数据`, `宿舍类型`

---

## 五、集成到 useGame

**文件：** `hooks/useGame.ts`

在 state 中添加：
```typescript
campusState: {
  社团: 社团数据[];
  学业: 学业状态;
  传闻: 校园传闻[];
  当前宿舍?: 宿舍数据;
}
```

在 actions 中添加：
- `handleJoinClub`
- `handleLeaveClub`
- `handleOrganizeClubActivity`
- `handleRumorSpread`
- `handleSemesterEvent`
- `handleDormInteraction`

---

## 六、验收标准

1. ✅ `hooks/useGame/clubWorkflow.ts` - 社团CRUD + 活动
2. ✅ `hooks/useGame/academicWorkflow.ts` - 学业追踪 + 成绩判定
3. ✅ `hooks/useGame/campusRumorWorkflow.ts` - 传闻生成 + 传播 + 衰减
4. ✅ `hooks/useGame/semesterCalendarWorkflow.ts` - 学期事件触发
5. ✅ `models/campusNSFW/dormitory.ts` - 宿舍数据模型
6. ✅ `models/campusNSFW/types.ts` - 类型扩展
7. ✅ 集成到 useGame state 和 actions
8. ✅ 相关 prompts 更新（校园场景描述增强）

---

## 七、优先级

| 步骤 | 优先级 | 工作量 |
|------|--------|--------|
| 步骤 1：社团系统 | P0 | 中 |
| 步骤 2：学业追踪 | P1 | 中 |
| 步骤 3：传闻系统 | P2 | 低中 |
| 步骤 4：日历事件 | P2 | 低 |
| 步骤 5：宿舍系统 | P3 | 中 |

---

## 八、风险评估

| 风险 | 等级 | 应对 |
|------|------|------|
| 系统过于复杂影响性能 | 中 | 传闻系统定期清理过期数据 |
| 与现有NPC系统冲突 | 低 | 复用现有NPC数据模型 |
| 学业数值影响剧情流畅度 | 中 | 学业压力仅作数值修饰，不阻塞剧情 |
